import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../../services/api';
import toast from 'react-hot-toast';
import {
  HiOutlineArrowLeft,
  HiOutlineKey,
  HiOutlineCheckCircle,
} from 'react-icons/hi2';

const UploadAnswerKey = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [testTitle, setTestTitle] = useState('');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [bulkOption, setBulkOption] = useState('');

  useEffect(() => { fetchData(); }, [id]);

  const fetchData = async () => {
    try {
      const [testRes, qRes] = await Promise.all([
        API.get(`/tests/${id}`),
        API.get(`/tests/${id}/questions`),
      ]);

      setTestTitle(testRes.data.data.title);
      setQuestions(qRes.data.data);

      try {
        const akRes = await API.get(`/tests/${id}/answerkey`);
        const existingAnswers = {};
        akRes.data.data.answers.forEach((a) => {
          existingAnswers[a.questionNo] = a.correctOption;
        });
        setAnswers(existingAnswers);
      } catch {
        // No answer key yet
      }
    } catch (err) {
      toast.error('Failed to load test data');
      navigate('/admin/tests');
    } finally {
      setLoading(false);
    }
  };

  const setAnswer = (questionNo, option) => {
    setAnswers((prev) => ({ ...prev, [questionNo]: option }));
    setSaved(false);
  };

  const handleBulkFill = () => {
    if (!bulkOption) return;
    const filled = {};
    questions.forEach((q) => { filled[q.questionNo] = bulkOption; });
    setAnswers(filled);
    setSaved(false);
    toast.success(`All answers set to ${bulkOption}`);
  };

  const handleSubmit = async () => {
    const missing = questions.filter((q) => !answers[q.questionNo]);
    if (missing.length > 0) {
      return toast.error(`${missing.length} question(s) don't have answers selected`);
    }

    setSubmitting(true);
    try {
      const payload = questions.map((q) => ({
        questionNo: q.questionNo,
        correctOption: answers[q.questionNo],
      }));

      await API.post(`/tests/${id}/answerkey`, { answers: payload });
      toast.success('Answer key saved successfully!');
      setSaved(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save answer key');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
        <div style={{ width: 40, height: 40, border: '3px solid var(--accent-amber-bg)', borderTopColor: 'var(--accent-amber)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  const answeredCount = questions.filter((q) => answers[q.questionNo]).length;

  return (
    <div style={{ padding: '32px 40px', maxWidth: '900px', margin: '0 auto' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
        <button onClick={() => navigate('/admin/tests')} style={{ background: 'var(--bg-hover)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '8px', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
          <HiOutlineArrowLeft size={16} />
        </button>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '2px', fontFamily: "'Sora', sans-serif" }}>Upload Answer Key</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{testTitle} · {answeredCount}/{questions.length} answered</p>
        </div>
      </div>

      {questions.length === 0 ? (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '48px', textAlign: 'center' }}>
          <HiOutlineKey size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 12px' }} />
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>No questions found for this test.</p>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Add questions first, then set the answer key.</p>
          <button onClick={() => navigate(`/admin/tests/${id}/questions`)} style={{ marginTop: '16px', padding: '8px 16px', background: 'var(--accent-amber-bg)', color: 'var(--accent-amber)', borderRadius: '12px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', border: 'none' }}>
            Add Questions
          </button>
        </div>
      ) : (
        <>
          {/* Bulk Fill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px', background: 'var(--bg-hover)', borderRadius: '12px', marginBottom: '20px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)' }}>Bulk Fill:</span>
            {['A','B','C','D','E'].map(opt => (
              <button key={opt} onClick={() => setBulkOption(opt)} style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1.5px solid var(--border-input)', background: bulkOption === opt ? 'var(--accent-amber)' : 'var(--bg-surface)', color: bulkOption === opt ? '#fff' : 'var(--text-primary)', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>
                {opt}
              </button>
            ))}
            <button onClick={handleBulkFill} disabled={!bulkOption} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border-input)', background: 'var(--bg-surface)', color: 'var(--text-secondary)', fontSize: '13px', cursor: 'pointer', opacity: !bulkOption ? 0.5 : 1 }}>
              Apply to All
            </button>
          </div>

          {/* Answer Grid */}
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '16px', overflow: 'hidden', marginBottom: '24px' }}>
            {questions.map((q, i) => (
              <div key={q._id} className="answer-key-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--accent-blue)', minWidth: '30px' }}>Q{i+1}</span>
                  <span style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{q.questionText}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['A','B','C','D', ...(q.optionE ? ['E'] : [])].map(opt => (
                    <button key={opt} onClick={() => setAnswer(q.questionNo, opt)} className={`abcd-button ${answers[q.questionNo] === opt ? 'selected' : ''}`} style={{ width: '40px', height: '40px', borderRadius: '8px', border: answers[q.questionNo] === opt ? '2px solid var(--accent-blue)' : '1.5px solid var(--border-input)', background: answers[q.questionNo] === opt ? 'var(--accent-blue)' : 'var(--bg-surface)', color: answers[q.questionNo] === opt ? '#ffffff' : 'var(--text-primary)', fontSize: '14px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.15s' }}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Submit */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button onClick={handleSubmit} disabled={submitting} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--accent-blue)', border: 'none', borderRadius: '10px', padding: '12px 28px', color: '#ffffff', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>
              <HiOutlineKey size={18} />
              {submitting ? 'Saving...' : 'Save Answer Key'}
            </button>
            {saved && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-green)', fontSize: '14px', fontWeight: '500' }}>
                <HiOutlineCheckCircle size={20} />
                Answer key saved!
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default UploadAnswerKey;
