import { useTheme } from '../../context/ThemeContext';
import { useState, useEffect, useReducer, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import toast from 'react-hot-toast';
import useTimer from '../../hooks/useTimer';
import useProctor from '../../hooks/useProctor';
import {
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineFlag,
  HiOutlinePaperAirplane,
  HiOutlineExclamationTriangle,
  HiOutlineXMark,
  HiOutlineListBullet,
} from 'react-icons/hi2';

// ─── Reducer ───
const initialState = {
  currentQuestion: 0, answers: {}, flagged: [], visited: [0], testSubmitted: false,
};

function testReducer(state, action) {
  switch (action.type) {
    case 'SET_ANSWER': {
      const newAnswers = { ...state.answers };
      if (newAnswers[action.questionNo] === action.option) delete newAnswers[action.questionNo];
      else newAnswers[action.questionNo] = action.option;
      return { ...state, answers: newAnswers };
    }
    case 'NAVIGATE': {
      const visited = state.visited.includes(action.index) ? state.visited : [...state.visited, action.index];
      return { ...state, currentQuestion: action.index, visited };
    }
    case 'TOGGLE_FLAG': {
      const flagged = state.flagged.includes(action.questionNo)
        ? state.flagged.filter((n) => n !== action.questionNo) : [...state.flagged, action.questionNo];
      return { ...state, flagged };
    }
    case 'SUBMITTED': return { ...state, testSubmitted: true };
    case 'RESTORE_ANSWERS': return { ...state, answers: action.answers };
    default: return state;
  }
}

const ActiveTest = ({ testData }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [showPalette, setShowPalette] = useState(false);
  const [state, dispatch] = useReducer(testReducer, initialState);
  
  const isCombinedTest = testData?.testType === 'combined';

  // STEP 1: Add these refs at top of component
  const autoSubmitCalledRef = useRef(false);
  const answersRef = useRef({});
  const violationsRef = useRef([]);
  const testIdRef = useRef(null);
  const secondsLeftRef = useRef(0);

  // STEP 2: When test loads, save testId to ref
  useEffect(() => {
    if (testData) {
      testIdRef.current = testData._id || testData.id || id;
      console.log('Test ID set:', testIdRef.current);
    }
  }, [testData, id]);

  // STEP 3: Keep answersRef synced
  useEffect(() => {
    answersRef.current = state.answers;
    console.log('Answers updated:', Object.keys(state.answers).length, 'answered');
  }, [state.answers]);

  // Load saved answers
  useEffect(() => {
    const saved = sessionStorage.getItem(`dms_test_${id}`);
    if (saved) {
      try {
        dispatch({ type: 'RESTORE_ANSWERS', answers: JSON.parse(saved) });
      } catch {}
    }
  }, [id]);

  // Save answers
  useEffect(() => {
    if (!state.testSubmitted) {
      sessionStorage.setItem(`dms_test_${id}`, JSON.stringify(state.answers));
    }
  }, [state.answers, id, state.testSubmitted]);

  // STEP 4: The autoSubmit function
  const autoSubmit = async (reason) => {
    console.log('autoSubmit called, reason:', reason);
    console.log('already called?', autoSubmitCalledRef.current);
    
    if (autoSubmitCalledRef.current) return;
    autoSubmitCalledRef.current = true;

    const currentTestId = testIdRef.current || id;
    console.log('Submitting testId:', currentTestId);

    if (!currentTestId) {
      console.error('NO TEST ID! Cannot submit');
      navigate('/student/results');
      return;
    }

    const answersArray = Object.entries(answersRef.current).map(([questionNo, selectedOption]) => ({
      questionNo: Number(questionNo),
      selectedOption: selectedOption
    }));

    console.log('Answers to submit:', answersArray);
    console.log('Violations:', violationsRef.current);
    
    const timeTaken = (testData?.duration || 2400) - secondsLeftRef.current;

    try {
      const res = await API.post(
        `/student/tests/${currentTestId}/submit`,
        {
          answers: answersArray,
          autoSubmitted: reason !== 'manual',
          timeTaken: timeTaken,
          violations: violationsRef.current
        }
      );

      console.log('Submit response:', res.data);

      const resultId = 
        res.data?.result?._id ||
        res.data?.result?.id ||
        res.data?._id ||
        res.data?.id ||
        res.data?.resultId ||
        res.data?.data?.resultId;

      console.log('Result ID:', resultId);
      dispatch({ type: 'SUBMITTED' });
      sessionStorage.removeItem(`dms_test_${id}`);
      
      if (reason !== 'manual') {
        toast.error('Test auto-submitted due to violation', { duration: 4000 });
      } else {
        toast.success('Test submitted successfully!', { duration: 4000 });
      }

      if (resultId) {
        if (isCombinedTest && reason === 'manual') {
          console.log('[Next Section] Carrying forward remaining time:', secondsLeftRef.current, 'seconds');
          navigate(`/student/coding-test/${currentTestId}`, { 
            state: { 
              mcqResultId: resultId, 
              fromCombinedMCQ: true,
              remainingSeconds: secondsLeftRef.current
            },
            replace: true 
          });
        } else if (isCombinedTest && reason === 'timerExpired') {
          // Time is up, skip coding and go to combined result
          navigate(`/student/combined-result/${currentTestId}`, { replace: true });
        } else {
          navigate(`/student/results/${resultId}`, { replace: true });
        }
      } else {
        console.warn('No resultId in response');
        navigate('/student/results');
      }
    } catch (err) {
      console.error('Submit FAILED:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      navigate('/student/results');
    }
  };

  // STEP 5: handleViolation function
  const handleViolation = useCallback((violationType) => {
    console.log('VIOLATION:', violationType);
    
    violationsRef.current = [
      ...violationsRef.current,
      {
        type: violationType,
        timestamp: new Date().toISOString()
      }
    ];

    autoSubmit(violationType);
  }, []);

  // STEP 6: handleTimerExpire
  const handleTimerExpire = useCallback(() => {
    console.log('TIMER EXPIRED');
    autoSubmit('timerExpired');
  }, []);

  // STEP 7: Manual submit handler
  const handleManualSubmit = async () => {
    const questionsList = testData.questions || [];
    const unanswered = questionsList.length - Object.keys(answersRef.current).length;
    
    if (unanswered > 0) {
      const confirmMsg = isCombinedTest
        ? `${unanswered} questions unanswered. Continue to Coding section anyway? You won't be able to return to MCQs after this.`
        : `${unanswered} questions unanswered. Submit anyway?`;
      const confirm = window.confirm(confirmMsg);
      if (!confirm) return;
    }
    
    await autoSubmit('manual');
  };

  // STEP 8: useProctor call
  useProctor(true, handleViolation);

  // STEP 9: useTimer call
  const rawDuration = testData?.duration || 2400;
  console.log('Passing to useTimer (seconds):', rawDuration);
  const { displayTime, isWarning, isCritical, secondsLeft } = useTimer(
    rawDuration,
    handleTimerExpire
  );

  // STEP 10: Track secondsLeft
  useEffect(() => {
    secondsLeftRef.current = secondsLeft;
  }, [secondsLeft]);

  const questions = testData.questions;
  const current = questions[state.currentQuestion];
  const totalQ = questions.length;
  const answeredCount = Object.keys(state.answers).length;

  const getQuestionStatus = (idx) => {
    const qNo = questions[idx].questionNo;
    if (idx === state.currentQuestion) return 'current';
    if (state.flagged.includes(qNo)) return 'flagged';
    if (state.answers[qNo]) return 'answered';
    if (state.visited.includes(idx)) return 'visited';
    return 'notVisited';
  };

  const paletteStyle = {
    current: { background: 'var(--accent-blue-bg)', color: 'var(--accent-blue)', border: '2px solid var(--accent-blue)' },
    answered: { background: 'var(--accent-green-bg)', color: 'var(--accent-green)', border: '1px solid rgba(16,185,129,0.3)' },
    flagged: { background: 'rgba(139,92,246,0.2)', color: '#8b5cf6', border: '1px solid rgba(139,92,246,0.3)' },
    visited: { background: 'rgba(249,115,22,0.2)', color: '#f97316', border: '1px solid rgba(249,115,22,0.3)' },
    notVisited: { background: 'var(--bg-hover)', color: 'var(--text-muted)', border: '1px solid var(--border-color)' },
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', zIndex: 9999, userSelect: 'none' }}
      onContextMenu={e => e.preventDefault()}>

      {/* ─── Top Bar ─── */}
      <header style={{
        height: 56, background: 'var(--bg-sidebar)', borderBottom: '1px solid var(--border-color)',
        display: 'flex', alignItems: 'center', padding: '0 16px', flexShrink: 0,
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{testData.title}</h1>
        </div>

        {/* Timer */}
        <div style={{
          fontSize: '24px',
          fontWeight: '800',
          fontFamily: 'Sora, sans-serif',
          color: isCritical 
            ? '#ef4444' 
            : isWarning 
              ? '#eab308' 
              : 'var(--text-primary)',
          letterSpacing: '2px',
          animation: isCritical 
            ? 'pulse 1s infinite' 
            : 'none'
        }}>
          {displayTime}
        </div>

        {/* Online indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 16, fontSize: 12, color: 'var(--accent-green)' }} className="hidden sm:flex">
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-green)' }} />
          Online
        </div>

        {/* Mobile palette toggle */}
        <button onClick={() => setShowPalette(!showPalette)}
          className="lg:hidden" style={{ marginLeft: 12, padding: 8, background: 'var(--bg-hover)', borderRadius: 8, border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
          <HiOutlineListBullet size={20} />
        </button>
      </header>

      {/* ─── Main ─── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Question area */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '32px 24px' }} className="lg:p-10">
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            {/* Q badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
              <span style={{
                fontFamily: "'Sora', sans-serif", fontSize: 12, fontWeight: 700,
                background: 'var(--accent-blue-bg)', color: 'var(--accent-blue)',
                borderRadius: 8, padding: '6px 14px',
              }}>Q {current.questionNo} of {totalQ}</span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{current.marks} mark{current.marks !== 1 ? 's' : ''}</span>
              {state.flagged.includes(current.questionNo) && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  fontSize: 10, fontWeight: 700, background: 'rgba(139,92,246,0.15)',
                  color: '#8b5cf6', borderRadius: 6, padding: '4px 10px',
                }}><HiOutlineFlag size={12} /> Flagged</span>
              )}
            </div>

            {/* Question text */}
            <p style={{ fontSize: 17, lineHeight: 1.8, color: 'var(--text-primary)', marginBottom: 32 }}>{current.questionText}</p>

            {/* Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {['A', 'B', 'C', 'D', ...(current.optionE ? ['E'] : [])].map((opt) => {
                const selected = state.answers[current.questionNo] === opt;
                return (
                  <button key={opt} onClick={() => dispatch({ type: 'SET_ANSWER', questionNo: current.questionNo, option: opt })}
                    style={{
                      width: '100%', textAlign: 'left', padding: '16px 20px',
                      borderRadius: 12, cursor: 'pointer', transition: 'all 0.15s',
                      display: 'flex', alignItems: 'center', gap: 16,
                      background: selected ? 'var(--accent-blue-bg)' : 'var(--bg-hover)',
                      border: selected ? '1px solid var(--accent-blue)' : '1px solid var(--border-color)',
                      borderLeft: selected ? '3px solid var(--accent-blue)' : '1px solid var(--border-color)',
                    }}
                    onMouseEnter={e => { if (!selected) e.currentTarget.style.borderColor = 'rgba(79,142,247,0.4)'; }}
                    onMouseLeave={e => { if (!selected) e.currentTarget.style.borderColor = 'var(--border-color)'; }}
                  >
                    <span style={{
                      width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: "'Sora', sans-serif", fontSize: 14, fontWeight: 700,
                      background: selected ? 'var(--accent-blue)' : 'rgba(255,255,255,0.06)',
                      color: selected ? '#ffffff' : 'var(--text-muted)',
                    }}>{opt}</span>
                    <span style={{ fontSize: 14, color: selected ? 'var(--accent-blue)' : 'var(--text-primary)', fontWeight: selected ? 600 : 400 }}>
                      {current[`option${opt}`]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </main>

        {/* ─── Desktop Palette ─── */}
        <aside className="hidden lg:flex" style={{
          width: 240, background: 'var(--bg-sidebar)', borderLeft: '1px solid var(--border-color)',
          flexDirection: 'column', flexShrink: 0,
        }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Question Palette</h3>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
              {questions.map((q, idx) => {
                const s = paletteStyle[getQuestionStatus(idx)];
                return (
                  <button key={q.questionNo} onClick={() => dispatch({ type: 'NAVIGATE', index: idx })}
                    style={{
                      aspectRatio: '1', borderRadius: 10, fontSize: 12, fontWeight: 700,
                      cursor: 'pointer', transition: 'all 0.15s', ...s,
                    }}>{q.questionNo}</button>
                );
              })}
            </div>
          </div>
          <div style={{ padding: 16, borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              { color: 'var(--bg-hover)', label: 'Not visited', border: 'var(--border-color)' },
              { color: 'rgba(249,115,22,0.2)', label: 'Visited', border: 'rgba(249,115,22,0.3)' },
              { color: 'var(--accent-green-bg)', label: 'Answered', border: 'rgba(16,185,129,0.3)' },
              { color: 'rgba(139,92,246,0.2)', label: 'Flagged', border: 'rgba(139,92,246,0.3)' },
            ].map((l, i) => (
               <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'var(--text-secondary)' }}>
                 <div style={{ width: 14, height: 14, borderRadius: 4, background: l.color, border: `1px solid ${l.border}` }} />
                 {l.label}
               </div>
            ))}
          </div>
        </aside>

        {/* ─── Mobile Palette ─── */}
        {showPalette && (
          <>
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50 }} className="lg:hidden" onClick={() => setShowPalette(false)} />
            <div className="lg:hidden" style={{
              position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
              background: 'var(--bg-sidebar)', borderTop: '1px solid var(--border-color)',
              borderRadius: '16px 16px 0 0', maxHeight: '60vh', overflowY: 'auto',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottom: '1px solid var(--border-color)' }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Question Palette</h3>
                <button onClick={() => setShowPalette(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <HiOutlineXMark size={20} />
                </button>
              </div>
              <div style={{ padding: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 8 }}>
                  {questions.map((q, idx) => {
                    const s = paletteStyle[getQuestionStatus(idx)];
                    return (
                      <button key={q.questionNo} onClick={() => { dispatch({ type: 'NAVIGATE', index: idx }); setShowPalette(false); }}
                        style={{ aspectRatio: '1', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer', ...s }}>{q.questionNo}</button>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ─── Bottom Bar ─── */}
      <footer style={{
        height: 60, background: 'var(--bg-sidebar)', borderTop: '1px solid var(--border-color)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', flexShrink: 0,
      }}>
        <button onClick={() => dispatch({ type: 'NAVIGATE', index: Math.max(0, state.currentQuestion - 1) })}
          disabled={state.currentQuestion === 0}
          style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border-input)', background: 'var(--bg-hover)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '500', cursor: state.currentQuestion === 0 ? 'not-allowed' : 'pointer', opacity: state.currentQuestion === 0 ? 0.4 : 1 }}>
          <HiOutlineChevronLeft size={16} /> <span className="hidden sm:inline">Previous</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={() => dispatch({ type: 'TOGGLE_FLAG', questionNo: current.questionNo })}
            style={{
              padding: '8px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', border: 'none',
              background: state.flagged.includes(current.questionNo) ? 'rgba(139,92,246,0.2)' : 'var(--bg-hover)',
              color: state.flagged.includes(current.questionNo) ? '#8b5cf6' : 'var(--text-secondary)',
            }}>
            <HiOutlineFlag size={16} /> <span className="hidden sm:inline">{state.flagged.includes(current.questionNo) ? 'Unflag' : 'Flag'}</span>
          </button>
          <button onClick={handleManualSubmit} 
            style={{ padding: '8px 20px', borderRadius: '8px', background: 'var(--accent-red)', color: '#ffffff', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
            <HiOutlinePaperAirplane size={16} /> {isCombinedTest ? 'Next Section: Coding →' : 'Submit'}
          </button>
        </div>

        <button onClick={() => dispatch({ type: 'NAVIGATE', index: Math.min(totalQ - 1, state.currentQuestion + 1) })}
          disabled={state.currentQuestion === totalQ - 1}
          style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border-input)', background: 'var(--bg-hover)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '500', cursor: state.currentQuestion === totalQ - 1 ? 'not-allowed' : 'pointer', opacity: state.currentQuestion === totalQ - 1 ? 0.4 : 1 }}>
          <span className="hidden sm:inline">Next</span> <HiOutlineChevronRight size={16} />
        </button>
      </footer>
    </div>
  );
};

const TakeTest = () => {
  const { theme } = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [testStarted, setTestStarted] = useState(false);

  // ─── Fetch ───
  useEffect(() => {
    const fetchTest = async () => {
      try {
        const res = await API.get(`/student/tests/${id}/start`);
        console.log('RAW API RESPONSE:', res.data);
        const testObj = res.data.data || res.data;
        
        console.log('TakeTest loaded test:', {
          title: testObj?.title,
          testType: testObj?.testType,
          isCombinedTest: testObj?.testType === 'combined'
        });

        console.log('duration field:', 
          res.data?.duration || 
          res.data?.test?.duration ||
          res.data?.data?.duration
        );
        setTestData(testObj);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load test');
        toast.error(err.response?.data?.message || 'Cannot start this test');
      } finally { setLoading(false); }
    };
    fetchTest();
  }, [id, navigate]);

  // ─── Loading ───
  if (loading) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', border: '3px solid var(--accent-blue-border)', borderTopColor: 'var(--accent-blue)', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Loading test...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (error || !testData) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 24 }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <HiOutlineExclamationTriangle size={48} style={{ color: 'var(--accent-red)', margin: '0 auto 16px' }} />
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Cannot Start Test</h2>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24 }}>{error}</p>
          <button onClick={() => navigate('/student/dashboard')} style={{ padding: '12px 24px', background: 'var(--accent-blue)', color: '#ffffff', borderRadius: '10px', border: 'none', fontWeight: '600', cursor: 'pointer' }}>Back to Dashboard</button>
        </div>
      </div>
    );
  }

  if (!testStarted) {
    const durationMins = testData?.duration 
      ? Math.round(testData.duration / 60) 
      : 40;

    return (
      <div style={{ position: 'fixed', inset: 0, background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 24, overflowY: 'auto' }}>
        <div className="animate-fade-in" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 16, padding: 32, maxWidth: 540, width: '100%' }}>
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>{testData.title}</h2>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 32, lineHeight: 1.6 }}>{testData.description}</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
            <div style={{ background: 'var(--bg-hover)', border: '1px solid var(--border-color)', padding: 20, borderRadius: 12 }}>
              <div>
                <p style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: '4px'
                }}>DURATION</p>
                <p style={{
                  fontSize: '28px',
                  fontWeight: '800',
                  fontFamily: 'Sora, sans-serif',
                  color: 'var(--text-primary)'
                }}>{durationMins}</p>
                <p style={{
                  fontSize: '13px',
                  color: 'var(--text-secondary)'
                }}>Minutes</p>
              </div>
            </div>
            <div style={{ background: 'var(--bg-hover)', border: '1px solid var(--border-color)', padding: 20, borderRadius: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Questions</span>
              <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginTop: 4, fontFamily: "'Sora', sans-serif" }}>{testData.totalQuestions || testData.questions?.length}</p>
            </div>
          </div>

          <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', padding: 20, borderRadius: 12, marginBottom: 32 }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent-red)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <HiOutlineExclamationTriangle size={20} /> Anti-Cheat Strict Mode
            </h4>
            <ul style={{ fontSize: 13, color: 'var(--text-primary)', paddingLeft: 20, margin: 0, lineHeight: 1.8 }}>
              <li>Do not switch tabs or minimize the window.</li>
              <li>Do not exit fullscreen mode once started.</li>
              <li>Do not use keyboard shortcuts.</li>
              <li><strong style={{ color: 'var(--accent-red)' }}>Any violation will auto-submit the exam immediately.</strong></li>
            </ul>
          </div>

          <button onClick={() => {
              console.log('Test started');
              setTestStarted(true);
            }} 
            style={{ width: '100%', padding: '16px', background: 'var(--accent-blue)', color: '#ffffff', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(79,142,247,0.3)' }}>
            Begin Exam
          </button>
        </div>
      </div>
    );
  }

  return <ActiveTest testData={testData} />;
};

export default TakeTest;
