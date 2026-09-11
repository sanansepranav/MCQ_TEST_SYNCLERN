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
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          padding: '60px 40px',
          textAlign: 'center',
          marginTop: '8px'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: 'var(--accent-blue-bg)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            fontSize: '28px'
          }}>
            📊
          </div>
          <p style={{
            fontSize: '16px',
            fontWeight: '600',
            color: 'var(--text-primary)',
            marginBottom: '8px'
          }}>
            No results yet
          </p>
          <p style={{
            fontSize: '14px',
            color: 'var(--text-secondary)',
            marginBottom: '24px'
          }}>
            Take a test to see your scores here
          </p>
          <button style={{
            background: 'var(--accent-blue)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '10px',
            padding: '11px 24px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
          onClick={() => navigate('/student/dashboard')}
          >
            Browse Available Tests →
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          {results.map((r) => {
            const pass = (r.percentage || 0) >= 40;
            return (
              <div
                key={r._id}
                onClick={() => navigate(`/student/results/${r._id}`)}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '16px',
                  padding: '20px 24px',
                  marginBottom: '12px',
                  boxShadow: theme === 'light' ? 'var(--shadow-sm)' : 'none',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-hover)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
              >
                {/* Title + Badge */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {r.testId?.title || 'Unknown Test'}
                    </h3>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{r.testId?.subject || 'General'}</p>
                  </div>
                  <span style={{
                    marginLeft: 8, padding: '4px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, flexShrink: 0,
                    background: pass ? 'var(--accent-green-bg)' : 'var(--accent-red-bg)',
                    color: pass ? 'var(--accent-green)' : 'var(--accent-red)'
                  }}>
                    {pass ? 'PASS' : 'FAIL'}
                  </span>
                </div>

                {/* Score */}
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, marginBottom: 16 }}>
                  <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 28, fontWeight: 700, color: pass ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                    {r.percentage}%
                  </p>
                  <p style={{ fontSize: 14, color: 'var(--text-muted)', paddingBottom: 2 }}>
                    {r.score}/{r.totalMarks}
                  </p>
                </div>

                {/* Meta */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)' }}>
                  <span>{formatDate(r.submittedAt)}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {r.autoSubmitted && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--accent-red)' }}>
                        <HiOutlineExclamationTriangle size={12} /> Auto
                      </span>
                    )}
                    <span>{formatTime(r.timeTaken)}</span>
                  </div>
                </div>

                {/* View detail arrow */}
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  {r.testId?.testType === 'combined' ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/student/combined-result/${r.testId._id || r.testId}`);
                      }}
                      style={{
                        background:'var(--accent-blue-bg)',
                        border:'1px solid var(--accent-blue-border)',
                        borderRadius:'8px',
                        padding:'6px 14px',
                        fontSize:'12px',
                        color:'var(--accent-blue)',
                        cursor:'pointer'
                      }}
                    >
                      🎯 View Combined Result
                    </button>
                  ) : (
                    <div />
                  )}
                  <span style={{ fontSize: 12, color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    View MCQ Details <HiOutlineArrowRight size={12} />
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
