import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import API from '../../services/api';
import toast from 'react-hot-toast';
import { HiOutlineChevronLeft } from 'react-icons/hi2';

const STATUS_BADGE = {
  completed: { bg: 'var(--accent-green-bg)', color: 'var(--accent-green)', label: 'Graded' },
  error: { bg: 'var(--accent-red-bg)', color: 'var(--accent-red)', label: 'Error' },
  running: { bg: 'var(--accent-amber-bg)', color: 'var(--accent-amber)', label: 'Running' },
  pending: { bg: 'var(--bg-hover)', color: 'var(--text-muted)', label: 'Pending' },
};

const CodingResults = () => {
  const { theme } = useTheme();
  const { testId } = useParams();
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchSubmissions();
  }, [testId]);

  const fetchSubmissions = async () => {
    try {
      const res = await API.get(`/coding/${testId}/submissions`);
      setSubmissions(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  // Aggregate scores
  const totalScore = submissions.reduce((sum, s) => sum + (s.score || 0), 0);
  const totalMarks = submissions.reduce((sum, s) => sum + (s.totalMarks || 0), 0);

  // Best submission per problem
  const bestByProblem = {};
  submissions.forEach(s => {
    const pid = s.problemId?._id || s.problemId;
    if (!bestByProblem[pid] || s.score > bestByProblem[pid].score) {
      bestByProblem[pid] = s;
    }
  });
  const bestScore = Object.values(bestByProblem).reduce((sum, s) => sum + (s.score || 0), 0);
  const bestTotal = Object.values(bestByProblem).reduce((sum, s) => sum + (s.totalMarks || 0), 0);

  const isDark = theme !== 'light';

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--border-hover)', borderTopColor: 'var(--accent-blue)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <button onClick={() => navigate('/student/results')} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '13px', marginBottom: '8px', padding: 0 }}>
          <HiOutlineChevronLeft size={14} /> Back to Results
        </button>
        <h1 style={{ fontSize: '26px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' }}>
          Coding Results
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
          {submissions.length} submission{submissions.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Summary card */}
      {submissions.length > 0 && (
        <div style={{
          background: 'var(--bg-surface)', borderRadius: '14px',
          border: '1px solid var(--border-color)', padding: '24px',
          display: 'flex', gap: '40px', marginBottom: '24px', flexWrap: 'wrap',
        }}>
          <div>
            <p style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Best Score</p>
            <p style={{ fontSize: '28px', fontWeight: '800', color: 'var(--accent-blue)', fontFamily: "'Sora', sans-serif" }}>
              {bestScore}<span style={{ fontSize: '16px', color: 'var(--text-muted)', fontWeight: '500' }}>/{bestTotal}</span>
            </p>
          </div>
          <div>
            <p style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Percentage</p>
            <p style={{ fontSize: '28px', fontWeight: '800', color: bestTotal > 0 ? (bestScore / bestTotal >= 0.8 ? 'var(--accent-green)' : 'var(--accent-amber)') : 'var(--text-muted)', fontFamily: "'Sora', sans-serif" }}>
              {bestTotal > 0 ? Math.round((bestScore / bestTotal) * 100) : 0}%
            </p>
          </div>
          <div>
            <p style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Problems Attempted</p>
            <p style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)', fontFamily: "'Sora', sans-serif" }}>
              {Object.keys(bestByProblem).length}
            </p>
          </div>
          <div>
            <p style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Total Submissions</p>
            <p style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)', fontFamily: "'Sora', sans-serif" }}>
              {submissions.length}
            </p>
          </div>
        </div>
      )}

      {/* Submissions list */}
      {submissions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)', fontSize: '15px', background: 'var(--bg-surface)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
          No submissions found for this test.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {submissions.map((sub) => {
            const badge = STATUS_BADGE[sub.status] || STATUS_BADGE.pending;
            const isExpanded = expandedId === sub._id;
            return (
              <div key={sub._id} style={{ background: 'var(--bg-surface)', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                {/* Header row */}
                <div onClick={() => setExpandedId(isExpanded ? null : sub._id)} style={{ padding: '16px 20px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '14px' }}>
                      {sub.problemId?.title || 'Problem'}
                    </span>
                    <span style={{ padding: '2px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', background: badge.bg, color: badge.color }}>{badge.label}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>{sub.language}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
                    <span style={{ fontWeight: '700', fontSize: '14px', color: sub.score === sub.totalMarks ? 'var(--accent-green)' : 'var(--accent-amber)' }}>
                      {sub.score}/{sub.totalMarks}
                    </span>
                    <span>Attempt #{sub.attemptNumber}</span>
                    <span>{new Date(sub.submittedAt).toLocaleString('en-IN')}</span>
                    <span style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div style={{ borderTop: '1px solid var(--border-color)', padding: '16px 20px' }}>
                    {/* Test case results */}
                    {sub.testCaseResults && sub.testCaseResults.length > 0 && (
                      <div style={{ marginBottom: '14px' }}>
                        <p style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Test Cases</p>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {sub.testCaseResults.map((tcr, idx) => (
                            <div key={idx} style={{
                              padding: '4px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: '600',
                              background: tcr.passed ? 'var(--accent-green-bg)' : 'var(--accent-red-bg)',
                              color: tcr.passed ? 'var(--accent-green)' : 'var(--accent-red)',
                              display: 'flex', alignItems: 'center', gap: '4px',
                            }}>
                              {tcr.passed ? '✓' : '✗'} #{idx + 1}
                              {tcr.executionTime > 0 && <span style={{ opacity: 0.7 }}>({tcr.executionTime.toFixed(0)}ms)</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Compilation error */}
                    {sub.compilationError && (
                      <div style={{ marginBottom: '14px' }}>
                        <p style={{ fontSize: '11px', fontWeight: '600', color: 'var(--accent-red)', marginBottom: '4px' }}>Compilation Error</p>
                        <pre style={{ background: isDark ? 'rgba(0,0,0,0.3)' : '#fff5f5', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '6px', padding: '10px', fontSize: '12px', fontFamily: "'Consolas', monospace", color: 'var(--accent-red)', whiteSpace: 'pre-wrap', margin: 0, maxHeight: '120px', overflow: 'auto' }}>
                          {sub.compilationError}
                        </pre>
                      </div>
                    )}

                    {/* Source code */}
                    <details>
                      <summary style={{ fontSize: '12px', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '6px' }}>View Source Code</summary>
                      <pre style={{ background: isDark ? 'rgba(0,0,0,0.3)' : '#f8faff', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '14px', fontSize: '12px', fontFamily: "'JetBrains Mono', 'Consolas', monospace", color: 'var(--text-primary)', whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: '300px', overflow: 'auto', margin: 0 }}>
                        {sub.sourceCode}
                      </pre>
                    </details>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CodingResults;
