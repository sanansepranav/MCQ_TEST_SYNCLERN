import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import API from '../../services/api';
import toast from 'react-hot-toast';
import CodeEditor from '../../components/CodeEditor';
import TestCasePanel from '../../components/TestCasePanel';
import useProctor from '../../hooks/useProctor';
import useTimer from '../../hooks/useTimer';
import { useRef } from 'react';
import {
  HiOutlinePlay,
  HiOutlinePaperAirplane,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineExclamationTriangle,
} from 'react-icons/hi2';

const LANG_LABELS = { c: 'C', python: 'Python', java: 'Java' };

const TakeCodingTest = () => {
  const { theme } = useTheme();
  const { id: testId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const mcqResultId = location.state?.mcqResultId || null;
  const fromCombinedMCQ = location.state?.fromCombinedMCQ || false;
  const remainingSecondsFromMCQ = location.state?.remainingSeconds ?? null;

  console.log('TakeCodingTest mounted:', {
    mcqResultId,
    fromCombinedMCQ,
    remainingSecondsFromMCQ
  });

  const [problems, setProblems] = useState([]);
  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeProblem, setActiveProblem] = useState(0);

  const [testStarted, setTestStarted] = useState(false);
  const autoSubmitCalledRef = useRef(false);
  const violationsRef = useRef([]);

  const codeStateRef = useRef({});
  const activeProblemRef = useRef(0);
  const problemsRef = useRef([]);

  useEffect(() => {
    if (fromCombinedMCQ) {
      console.log('Combined test - auto-starting coding proctor');
      setTestStarted(true);
    }
  }, [fromCombinedMCQ]);

  // Per-problem state: { [problemId]: { code, language } }
  const [codeState, setCodeState] = useState({});

  useEffect(() => { codeStateRef.current = codeState; }, [codeState]);
  useEffect(() => { activeProblemRef.current = activeProblem; }, [activeProblem]);
  useEffect(() => { problemsRef.current = problems; }, [problems]);

  // Execution state
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [runOutput, setRunOutput] = useState(null);
  const [submitResults, setSubmitResults] = useState(null);
  const [activePanel, setActivePanel] = useState('output'); // 'output' or 'results'

  // Custom input
  const [customInput, setCustomInput] = useState('');
  const [useCustomInput, setUseCustomInput] = useState(false);

  useEffect(() => {
    fetchProblems();
  }, [testId]);

  const fetchProblems = async () => {
    try {
      if (!fromCombinedMCQ) {
        try {
          const testRes = await API.get(`/student/tests/${testId}/start`);
          setTestData(testRes.data.data || testRes.data);
        } catch (e) {
          console.warn('Could not fetch test data for pre-screen', e);
        }
      }

      const res = await API.get(`/coding/${testId}/student-problems`);
      const probs = res.data.data || [];
      setProblems(probs);

      // Initialize code state with boilerplate
      const initial = {};
      probs.forEach(p => {
        const defaultLang = (p.allowedLanguages && p.allowedLanguages[0]) || 'python';
        initial[p._id] = {
          code: CodeEditor.BOILERPLATE[defaultLang] || '',
          language: defaultLang,
        };
      });
      setCodeState(initial);
    } catch (err) {
      toast.error('Failed to load problems');
    } finally {
      setLoading(false);
    }
  };

  const currentProblem = problems[activeProblem];
  const currentState = currentProblem ? codeState[currentProblem._id] : null;

  const updateCode = useCallback((code) => {
    if (!currentProblem) return;
    setCodeState(prev => ({
      ...prev,
      [currentProblem._id]: { ...prev[currentProblem._id], code },
    }));
  }, [currentProblem]);

  const updateLanguage = (lang) => {
    if (!currentProblem) return;
    setCodeState(prev => ({
      ...prev,
      [currentProblem._id]: {
        ...prev[currentProblem._id],
        language: lang,
        code: prev[currentProblem._id]?.code || CodeEditor.BOILERPLATE[lang] || '',
      },
    }));
  };

  // Run code (against sample input, no grading)
  const handleRun = async () => {
    if (!currentState?.code.trim()) return toast.error('Write some code first');
    setRunning(true);
    setRunOutput(null);
    setActivePanel('output');
    try {
      const stdin = useCustomInput ? customInput : (currentProblem.sampleInput || '');
      const res = await API.post('/coding/run', {
        sourceCode: currentState.code,
        language: currentState.language,
        stdin,
      });
      console.log('[Run] API response:', res.data);
      setRunOutput({
        stdout: res.data.output,
        stderr: res.data.error,
        compile_output: res.data.status === 'Compilation Error' ? res.data.error : '',
        time: Number(res.data.executionTime) || 0,
      });
    } catch (err) {
      if (err.response?.status === 429) {
        setRunOutput({
          stderr: 'Daily code execution limit reached. Please try again tomorrow or contact your administrator.',
          status: 'Rate Limit'
        });
      } else {
        setRunOutput({
          stderr: err.response?.data?.message || 'Execution failed. Please try again.',
          status: 'Error'
        });
      }
    } finally {
      setRunning(false);
    }
  };

  // Submit solution (grade against all test cases)
  const handleSubmit = async (isAutoSubmit = false, violations = []) => {
    if (!currentState?.code.trim() && !isAutoSubmit) return toast.error('Write some code first');
    if (!currentProblem && !isAutoSubmit) return;

    if (!isAutoSubmit) {
      console.log('[Manual Submit] Called:', {
        testId,
        currentProblem: currentProblem?._id,
        problems: problems?.map(p => p._id),
        fromCombinedMCQ,
        mcqResultId,
        language: currentState?.language,
        codeLength: currentState?.code?.length
      });
      setSubmitting(true);
      setSubmitResults(null);
      setActivePanel('results');
    }
    try {
      const probId = currentProblem?._id || problems[0]?._id;
      if (!probId) throw new Error('No problem available to submit');

      const res = await API.post(`/coding/problems/${probId}/submit`, {
        sourceCode: currentState?.code || '',
        language: currentState?.language || 'python',
        mcqResultId: mcqResultId || undefined,
        autoSubmitted: isAutoSubmit,
        violations: isAutoSubmit ? violations : violationsRef.current,
      });

      console.log('[Manual Submit] API response:', {
        status: res.status,
        data: res.data,
        success: res.data?.success
      });
      
      if (!isAutoSubmit) {
        const d = res.data.submission || res.data.data;
        setSubmitResults(d);

        const isLastProblem = !problems || problems.length === 0 || activeProblem >= problems.length - 1;

        if (d.score === d.totalMarks) {
          toast.success(`All test cases passed! ${d.score}/${d.totalMarks}`);
        } else {
          toast(`Score: ${d.score}/${d.totalMarks}`, { icon: '📊' });
        }

        if (res.data?.success !== false) {
          setTimeout(() => {
            if (!isLastProblem) {
              toast.success('Problem submitted! Moving to next problem...', { duration: 1500 });
              setActiveProblem(prev => prev + 1);
              setSubmitResults(null);
              setActivePanel('output');
            } else {
              toast.success(
                fromCombinedMCQ
                  ? 'Coding submitted! Redirecting to Combined Result...'
                  : 'Coding submitted! Redirecting to Results...',
                { duration: 2000 }
              );
              
              if (fromCombinedMCQ) {
                navigate(`/student/combined-result/${testId}`);
              } else {
                navigate(`/student/coding-results/${testId}`);
              }
            }
          }, 2000);
        }
      }
      return res;
    } catch (err) {
      if (!isAutoSubmit) {
        console.error('[Submit] Error:', {
          status: err.response?.status,
          message: err.response?.data?.message
        });
        toast.error(err.response?.data?.message || 'Submission failed. Please try again.');
      }
      throw err;
    } finally {
      if (!isAutoSubmit) setSubmitting(false);
    }
  };

  const autoSubmitCoding = async (reason) => {
    if (autoSubmitCalledRef.current) return;
    autoSubmitCalledRef.current = true;

    console.log('[autoSubmit] Called:', {
      reason,
      testId,
      problems: problems?.map(p => ({
        id: p._id,
        title: p.title
      })),
      currentProblem: currentProblem?._id,
      fromCombinedMCQ,
      mcqResultId
    });

    if (!problems || problems.length === 0) {
      console.warn('[autoSubmit] No problems loaded, navigating away');
      navigate('/student/dashboard');
      return;
    }

    try {
      const currentCode = currentState?.code || '';
      const problemToSubmit = currentProblem || problems[0];

      if (!problemToSubmit?._id) {
        console.error('[autoSubmit] No valid problem ID found');
        navigate('/student/dashboard');
        return;
      }

      console.log('[autoSubmit] Submitting:', {
        problemId: problemToSubmit._id,
        language: currentState?.language || 'python',
        codeLength: currentCode.length,
        autoSubmitted: true
      });

      const res = await API.post(
        `/coding/problems/${problemToSubmit._id}/submit`,
        {
          language: currentState?.language || 'python',
          sourceCode: currentCode,
          autoSubmitted: true,
          violations: violationsRef.current,
          mcqResultId: mcqResultId || undefined
        }
      );

      console.log('[autoSubmit] Success:', res.data);

      if (fromCombinedMCQ && testId) {
        navigate(`/student/combined-result/${testId}`);
      } else {
        navigate(`/student/coding-results/${testId}`);
      }

    } catch (err) {
      console.error('[autoSubmit] Failed:', {
        status: err.response?.status,
        message: err.response?.data?.message,
        error: err.message
      });
      navigate('/student/dashboard');
    }
  };

  const handleCodingViolation = useCallback(async (violationType) => {
    console.log('CODING VIOLATION:', violationType);
    
    violationsRef.current = [
      ...violationsRef.current,
      {
        type: violationType,
        timestamp: new Date().toISOString()
      }
    ];

    await autoSubmitCoding(violationType);
  }, [mcqResultId, fromCombinedMCQ]);

  useProctor(testStarted, handleCodingViolation);

  const handleTimerExpireCoding = useCallback(() => {
    console.log('[Coding] Timer expired, auto-submitting');
    autoSubmitCoding('timerExpired');
  }, [autoSubmitCoding]);

  const timerStartValue = 
    (fromCombinedMCQ && remainingSecondsFromMCQ !== null)
      ? remainingSecondsFromMCQ
      : (testData?.duration || 2400);

  const { 
    displayTime, 
    isWarning, 
    isCritical,
    secondsLeft 
  } = useTimer(
    timerStartValue,
    handleTimerExpireCoding
  );

  console.log('Skipping total time taken calculation - no existing consumer found, avoiding unnecessary schema changes');

  const isDark = theme !== 'light';

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--border-hover)', borderTopColor: 'var(--accent-blue)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (problems.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <p style={{ fontSize: '16px', color: 'var(--text-muted)', marginBottom: '16px' }}>No coding problems available for this test.</p>
        <button onClick={() => navigate('/student/dashboard')} style={{ padding: '10px 24px', background: 'var(--accent-blue)', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>Back to Dashboard</button>
      </div>
    );
  }

  if (!testStarted && !fromCombinedMCQ) {
    const durationMins = testData?.duration 
      ? Math.round(testData.duration / 60) 
      : 40;

    return (
      <div style={{ position: 'fixed', inset: 0, background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 24, overflowY: 'auto' }}>
        <div className="animate-fade-in" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 16, padding: 32, maxWidth: 540, width: '100%' }}>
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>{testData?.title || 'Coding Test'}</h2>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 32, lineHeight: 1.6 }}>{testData?.description || 'Complete the following coding problems.'}</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
            <div style={{ background: 'var(--bg-hover)', border: '1px solid var(--border-color)', padding: 20, borderRadius: 12 }}>
              <div>
                <p style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>DURATION</p>
                <p style={{ fontSize: '28px', fontWeight: '800', fontFamily: 'Sora, sans-serif', color: 'var(--text-primary)' }}>{durationMins}</p>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Minutes</p>
              </div>
            </div>
            <div style={{ background: 'var(--bg-hover)', border: '1px solid var(--border-color)', padding: 20, borderRadius: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Problems</span>
              <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginTop: 4, fontFamily: "'Sora', sans-serif" }}>{problems.length}</p>
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 120px)' }}>
      {fromCombinedMCQ && (
        <div style={{
          padding: '12px 20px',
          background: 'var(--accent-green-bg)',
          border: '1px solid rgba(16,185,129,0.2)',
          borderRadius: '10px',
          marginBottom: '16px',
          fontSize: '13px',
          color: 'var(--accent-green)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          ✓ MCQ section submitted successfully. Now complete the coding section.
        </div>
      )}

      {/* Top bar: problem navigation + actions */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '12px 0', marginBottom: '16px', borderBottom: '1px solid var(--border-color)',
        flexWrap: 'wrap', gap: '12px',
      }}>
        {/* Problem tabs */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {problems.map((p, idx) => {
            const isActive = idx === activeProblem;
            const hasSubmission = p.lastSubmission?.status === 'completed';
            return (
              <button key={p._id} onClick={() => { setActiveProblem(idx); setRunOutput(null); setSubmitResults(null); }}
                style={{
                  padding: '6px 16px', borderRadius: '8px',
                  border: isActive ? '1.5px solid var(--accent-blue)' : '1px solid var(--border-color)',
                  background: isActive ? 'var(--accent-blue-bg)' : 'transparent',
                  color: isActive ? 'var(--accent-blue)' : 'var(--text-secondary)',
                  fontSize: '13px', fontWeight: '600', cursor: 'pointer', position: 'relative',
                  fontFamily: "'Sora', sans-serif",
                }}>
                P{idx + 1}
                {hasSubmission && <span style={{ position: 'absolute', top: '-3px', right: '-3px', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-green)' }} />}
              </button>
            );
          })}
        </div>

        {/* Timer Display */}
        {testStarted && (
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
              : 'none',
            margin: '0 auto',
          }}>
            {displayTime}
          </div>
        )}

        {/* Language selector + buttons */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select value={currentState?.language || 'python'} onChange={e => updateLanguage(e.target.value)}
            style={{
              padding: '7px 12px', background: 'var(--bg-hover)',
              border: '1px solid var(--border-color)', borderRadius: '8px',
              color: 'var(--text-primary)', fontSize: '13px', cursor: 'pointer', fontWeight: '600',
            }}>
            {(currentProblem?.allowedLanguages || ['c', 'python', 'java']).map(lang => (
              <option key={lang} value={lang}>{LANG_LABELS[lang]}</option>
            ))}
          </select>
          <button onClick={handleRun} disabled={running}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 18px', background: running ? 'rgba(34,197,94,0.5)' : 'var(--accent-green)',
              color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600',
              cursor: running ? 'not-allowed' : 'pointer',
            }}>
            <HiOutlinePlay size={14} /> {running ? 'Running...' : 'Run'}
          </button>
          <button onClick={() => handleSubmit(false, [])} disabled={submitting}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 18px', background: submitting ? 'rgba(59,130,246,0.5)' : 'var(--accent-blue)',
              color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600',
              cursor: submitting ? 'not-allowed' : 'pointer',
            }}>
            <HiOutlinePaperAirplane size={14} /> 
            {submitting 
              ? 'Submitting...' 
              : (!problems || problems.length === 0 || activeProblem >= problems.length - 1)
                ? 'Submit & Finish'
                : 'Submit & Next Problem →'}
          </button>
        </div>
      </div>

      {/* Main content: problem description + code editor */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', flex: 1, minHeight: '400px' }}
        className="coding-layout"
      >
        {/* Left: Problem description */}
        <div style={{
          background: 'var(--bg-surface)', borderRadius: '14px',
          border: '1px solid var(--border-color)', padding: '24px',
          overflowY: 'auto', maxHeight: '65vh',
        }}>
          {currentProblem && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--accent-blue)', fontFamily: "'Sora', sans-serif" }}>#{currentProblem.problemNo}</span>
                <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                  {currentProblem.title}
                </h2>
                <span style={{
                  padding: '2px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '600',
                  background: currentProblem.difficulty === 'easy' ? 'var(--accent-green-bg)' : currentProblem.difficulty === 'hard' ? 'var(--accent-red-bg)' : 'var(--accent-amber-bg)',
                  color: currentProblem.difficulty === 'easy' ? 'var(--accent-green)' : currentProblem.difficulty === 'hard' ? 'var(--accent-red)' : 'var(--accent-amber)',
                  textTransform: 'capitalize',
                }}>
                  {currentProblem.difficulty}
                </span>
              </div>

              <div style={{ fontSize: '14px', lineHeight: '1.7', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', marginBottom: '20px' }}>
                {currentProblem.description}
              </div>

              {currentProblem.inputFormat && (
                <div style={{ marginBottom: '14px' }}>
                  <h3 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>Input Format</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>{currentProblem.inputFormat}</p>
                </div>
              )}
              {currentProblem.outputFormat && (
                <div style={{ marginBottom: '14px' }}>
                  <h3 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>Output Format</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>{currentProblem.outputFormat}</p>
                </div>
              )}
              {currentProblem.constraints && (
                <div style={{ marginBottom: '14px' }}>
                  <h3 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>Constraints</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: "'Consolas', monospace", whiteSpace: 'pre-wrap' }}>{currentProblem.constraints}</p>
                </div>
              )}

              {/* Sample I/O */}
              {(currentProblem.sampleInput || currentProblem.sampleOutput) && (
                <div style={{ marginTop: '16px' }}>
                  <h3 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>Sample</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <p style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Input</p>
                      <pre style={{ background: isDark ? 'rgba(0,0,0,0.3)' : '#f5f7ff', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px 14px', fontSize: '12px', fontFamily: "'Consolas', monospace", color: 'var(--text-primary)', margin: 0, whiteSpace: 'pre-wrap' }}>
                        {currentProblem.sampleInput || '(none)'}
                      </pre>
                    </div>
                    <div>
                      <p style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Output</p>
                      <pre style={{ background: isDark ? 'rgba(0,0,0,0.3)' : '#f5f7ff', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px 14px', fontSize: '12px', fontFamily: "'Consolas', monospace", color: 'var(--text-primary)', margin: 0, whiteSpace: 'pre-wrap' }}>
                        {currentProblem.sampleOutput || '(none)'}
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              <div style={{ marginTop: '14px', fontSize: '12px', color: 'var(--text-muted)' }}>
                <span style={{ fontWeight: '600' }}>Marks:</span> {currentProblem.totalMarks}
              </div>
            </>
          )}
        </div>

        {/* Right: Code editor + output */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minHeight: '400px' }}>
          <CodeEditor
            value={currentState?.code || ''}
            onChange={updateCode}
            language={currentState?.language || 'python'}
            height="calc(65vh - 220px)"
          />

          {/* Custom Input toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <input type="checkbox" checked={useCustomInput} onChange={e => setUseCustomInput(e.target.checked)} />
              Custom Input
            </label>
            {useCustomInput && (
              <textarea value={customInput} onChange={e => setCustomInput(e.target.value)} rows={2} placeholder="Enter custom stdin..."
                style={{
                  flex: 1, padding: '6px 10px', background: 'var(--bg-hover)',
                  border: '1px solid var(--border-color)', borderRadius: '6px',
                  color: 'var(--text-primary)', fontSize: '12px',
                  fontFamily: "'Consolas', monospace", resize: 'vertical', outline: 'none',
                }}
              />
            )}
          </div>

          {/* Output / Results Panel */}
          <div style={{
            background: 'var(--bg-surface)', borderRadius: '12px',
            border: '1px solid var(--border-color)', padding: '16px',
            minHeight: '140px', maxHeight: '250px', overflowY: 'auto',
          }}>
            {/* Panel tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <button onClick={() => setActivePanel('output')}
                style={{
                  padding: '4px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                  border: activePanel === 'output' ? '1.5px solid var(--accent-blue)' : '1px solid var(--border-color)',
                  background: activePanel === 'output' ? 'var(--accent-blue-bg)' : 'transparent',
                  color: activePanel === 'output' ? 'var(--accent-blue)' : 'var(--text-muted)',
                }}>
                Output
              </button>
              <button onClick={() => setActivePanel('results')}
                style={{
                  padding: '4px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                  border: activePanel === 'results' ? '1.5px solid var(--accent-blue)' : '1px solid var(--border-color)',
                  background: activePanel === 'results' ? 'var(--accent-blue-bg)' : 'transparent',
                  color: activePanel === 'results' ? 'var(--accent-blue)' : 'var(--text-muted)',
                }}>
                Test Results
              </button>
            </div>

            {/* Output tab */}
            {activePanel === 'output' && (
              <>
                {running && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '13px' }}>
                    <div style={{ width: '16px', height: '16px', border: '2px solid var(--border-hover)', borderTopColor: 'var(--accent-green)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    Executing...
                  </div>
                )}
                {!running && !runOutput && (
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Click "Run" to see output here.</p>
                )}
                {!running && runOutput && (
                  <div>
                    {runOutput.compile_output && (
                      <div style={{ marginBottom: '8px' }}>
                        <p style={{ fontSize: '11px', fontWeight: '600', color: 'var(--accent-red)', marginBottom: '4px' }}>Compilation Error</p>
                        <pre style={{ background: isDark ? 'rgba(0,0,0,0.3)' : '#fff5f5', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '6px', padding: '10px', fontSize: '12px', fontFamily: "'Consolas', monospace", color: 'var(--accent-red)', whiteSpace: 'pre-wrap', margin: 0 }}>
                          {runOutput.compile_output}
                        </pre>
                      </div>
                    )}
                    {runOutput.stderr && (
                      <div style={{ marginBottom: '8px' }}>
                        <p style={{ fontSize: '11px', fontWeight: '600', color: 'var(--accent-red)', marginBottom: '4px' }}>Stderr</p>
                        <pre style={{ background: isDark ? 'rgba(0,0,0,0.3)' : '#fff5f5', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '6px', padding: '10px', fontSize: '12px', fontFamily: "'Consolas', monospace", color: 'var(--accent-red)', whiteSpace: 'pre-wrap', margin: 0 }}>
                          {runOutput.stderr}
                        </pre>
                      </div>
                    )}
                    {runOutput.stdout !== undefined && (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <p style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Stdout</p>
                          {runOutput.time > 0 && <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>⏱ {runOutput.time.toFixed(1)}ms</span>}
                        </div>
                        <pre style={{ background: isDark ? 'rgba(0,0,0,0.3)' : '#f8faff', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '10px', fontSize: '12px', fontFamily: "'Consolas', monospace", color: 'var(--text-primary)', whiteSpace: 'pre-wrap', margin: 0 }}>
                          {runOutput.stdout || '(no output)'}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Test Results tab */}
            {activePanel === 'results' && (
              <>
                {submitting && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '13px' }}>
                    <div style={{ width: '16px', height: '16px', border: '2px solid var(--border-hover)', borderTopColor: 'var(--accent-blue)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    Running test cases...
                  </div>
                )}
                {!submitting && !submitResults && (
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Click "Submit" to run against all test cases.</p>
                )}
                {!submitting && submitResults && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <span style={{ fontSize: '16px', fontWeight: '700', color: submitResults.score === submitResults.totalMarks ? 'var(--accent-green)' : 'var(--accent-amber)' }}>
                        {submitResults.score}/{submitResults.totalMarks}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Attempt #{submitResults.attemptNumber}</span>
                    </div>
                    <TestCasePanel
                      testCases={submitResults.testCaseResults || []}
                      compilationError={submitResults.compilationError}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile responsive style */}
      <style>{`
        @media (max-width: 900px) {
          .coding-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default TakeCodingTest;
