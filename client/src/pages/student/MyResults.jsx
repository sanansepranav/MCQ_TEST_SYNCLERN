import { useTheme } from '../../context/ThemeContext';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import toast from 'react-hot-toast';
import {
  HiOutlineChartBarSquare,
  HiOutlineArrowRight,
  HiOutlineExclamationTriangle,
} from 'react-icons/hi2';

const MyResults = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchResults(); }, []);

  const fetchResults = async () => {
    try {
      const res = await API.get('/student/results');
      setResults(res.data.data);
    } catch (err) {
      toast.error('Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) =>
    d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

  const formatTime = (sec) => {
    if (!sec) return '—';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          border: '3px solid var(--accent-blue-bg)', borderTopColor: 'var(--accent-blue)',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>My Results</h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>{results.length} test{results.length !== 1 ? 's' : ''} attempted</p>
      </div>

      {results.length === 0 ? (
        <div className="glass-card" style={{
          borderRadius: 20, padding: '64px 32px', textAlign: 'center', marginTop: 8
        }}>
          <div style={{
            width: 64, height: 64, background: 'rgba(59,130,246,0.1)', borderRadius: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px', fontSize: 28, border: '1px solid rgba(59,130,246,0.2)'
          }}>
            📊
          </div>
          <h3 style={{
            fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 700,
            color: 'var(--text-primary)', marginBottom: 8
          }}>
            No results recorded yet
          </h3>
          <p style={{
            fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24, maxWidth: 360, marginInline: 'auto'
          }}>
            Once you complete a scheduled test or practice coding assessment, your score breakdown will appear here.
          </p>
          <button
            className="dms-btn dms-btn-primary"
            style={{ padding: '12px 28px', fontSize: 14, borderRadius: 12 }}
            onClick={() => navigate('/student/dashboard')}
          >
            Browse Available Tests →
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
          {results.map((r) => {
            const pass = (r.percentage || 0) >= 40;
            return (
              <div
                key={r._id}
                onClick={() => navigate(`/student/results/${r._id}`)}
                className="glass-card glass-card-hover"
                style={{
                  borderRadius: 20,
                  padding: '24px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative'
                }}
              >
                {/* Title + Badge */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ flex: 1, minWidth: 0, paddingRight: 10 }}>
                    <h3 style={{
                      fontFamily: "'Sora', sans-serif", fontSize: 16, fontWeight: 700,
                      color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0
                    }}>
                      {r.testId?.title || 'Assessment'}
                    </h3>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, margin: 0 }}>
                      {r.testId?.subject || 'Engineering Assessment'}
                    </p>
                  </div>
                  <span style={{
                    padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.8, flexShrink: 0,
                    background: pass ? 'var(--accent-green-bg)' : 'var(--accent-red-bg)',
                    color: pass ? 'var(--accent-green)' : 'var(--accent-red)',
                    border: `1px solid ${pass ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`
                  }}>
                    {pass ? 'PASS' : 'FAIL'}
                  </span>
                </div>

                {/* Score */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 16 }}>
                  <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 32, fontWeight: 800, color: pass ? 'var(--accent-green)' : 'var(--accent-red)', letterSpacing: '-0.5px' }}>
                    {r.percentage}%
                  </span>
                  <span style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 600 }}>
                    Score: {r.score} / {r.totalMarks}
                  </span>
                </div>

                {/* Meta chips */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', marginTop: 'auto' }}>
                  <span>📅 {formatDate(r.submittedAt)}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {r.autoSubmitted && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--accent-red)', fontWeight: 600 }}>
                        <HiOutlineExclamationTriangle size={13} /> Auto
                      </span>
                    )}
                    <span>⏱️ {formatTime(r.timeTaken)}</span>
                  </div>
                </div>

                {/* Footer action */}
                <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  {r.testId?.testType === 'combined' ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/student/combined-result/${r.testId._id || r.testId}`);
                      }}
                      style={{
                        background: 'rgba(59,130,246,0.1)',
                        border: '1px solid rgba(59,130,246,0.25)',
                        borderRadius: 10,
                        padding: '6px 14px',
                        fontSize: 12,
                        fontWeight: 600,
                        color: 'var(--accent-blue)',
                        cursor: 'pointer'
                      }}
                    >
                      🎯 Combined Result
                    </button>
                  ) : (
                    <div />
                  )}
                  <span style={{ fontSize: 13, color: 'var(--accent-blue)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                    View Details <HiOutlineArrowRight size={13} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyResults;
