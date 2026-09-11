import { useTheme } from '../../context/ThemeContext';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import toast from 'react-hot-toast';
import {
  HiOutlineClipboardDocumentList,
  HiOutlineChartBarSquare,
  HiOutlineTrophy,
  HiOutlineSignal,
  HiOutlineClock,
  HiOutlinePlayCircle,
  HiOutlineCheckBadge,
  HiOutlineArrowRight,
  HiOutlineCodeBracketSquare,
} from 'react-icons/hi2';

const StudentDashboard = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [testsRes, resultsRes] = await Promise.all([
        API.get('/student/tests'),
        API.get('/student/results'),
      ]);
      setTests(testsRes.data.data);
      setResults(resultsRes.data.data);
    } catch { toast.error('Failed to load dashboard'); }
    finally { setLoading(false); }
  };

  const liveTests = tests.filter((t) => t.liveStatus === 'live');
  const upcomingTests = tests.filter((t) => t.liveStatus === 'upcoming');
  const avgScore = results.length > 0 ? Math.round(results.reduce((s, r) => s + (r.percentage || 0), 0) / results.length) : 0;
  const bestScore = results.length > 0 ? Math.max(...results.map((r) => r.percentage || 0)) : 0;

  const stats = [
    { label: 'Tests Attempted', value: results.length, icon: HiOutlineClipboardDocumentList, color: 'var(--accent-blue)' },
    { label: 'Average Score', value: `${avgScore}%`, icon: HiOutlineChartBarSquare, color: 'var(--accent-green)' },
    { label: 'Best Score', value: `${bestScore}%`, icon: HiOutlineTrophy, color: 'var(--accent-amber)' },
    { label: 'Tests Available', value: liveTests.length, icon: HiOutlineSignal, color: 'var(--accent-red)' },
  ];

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString(
      'en-IN',
      {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }
    );
  };

  const getTimeUntil = (start) => {
    const diff = new Date(start) - new Date();
    if (diff <= 0) return 'Now';
    const hours = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    if (hours > 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          border: '3px solid var(--accent-blue-border)', borderTopColor: 'var(--accent-blue)',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Welcome */}
      <div style={{
        background: 'linear-gradient(135deg, var(--accent-blue-bg) 0%, rgba(79,142,247,0.03) 100%)',
        border: '1px solid var(--accent-blue-bg)',
        borderRadius: 16, padding: '24px 28px',
      }}>
        <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>
          {greeting()}, <span style={{ color: 'var(--accent-blue)' }}>{user?.name?.split(' ')[0]}</span> 👋
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>
          Here are your available tests
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} style={{
              background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
              borderRadius: 16, padding: '18px 20px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
            }}>
              <div>
                <p style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 500 }}>{s.label}</p>
                <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 26, fontWeight: 700, color: s.color, marginTop: 6 }}>{s.value}</p>
              </div>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={18} style={{ color: s.color }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Available Tests */}
      <div>
        <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 17, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>Available Tests</h2>

        {liveTests.length === 0 && upcomingTests.length === 0 ? (
          <div style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
            borderRadius: 16, padding: '48px 24px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📝</div>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No tests available yet</p>
            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12, marginTop: 4 }}>Check back later for upcoming tests</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {[...liveTests, ...upcomingTests].map((test) => {
              const isLive = test.liveStatus === 'live';
              return (
                <div key={test._id} style={{
                  background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
                  borderRadius: 16, padding: 24,
                  transition: 'border-color 0.2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
                >
                  {/* Status badge */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1,
                      background: isLive ? 'var(--accent-red-bg)' : 'var(--accent-blue-bg)',
                      color: isLive ? 'var(--accent-red)' : 'var(--accent-blue)',
                      borderRadius: 20, padding: '4px 12px',
                    }}>
                      {isLive && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-red)' }} className="animate-pulse-dot" />}
                      {isLive ? 'LIVE' : 'UPCOMING'}
                    </span>
                  </div>

                  {/* Title */}
                  <div style={{
                    display:'flex', alignItems:'center', 
                    gap:'8px', flexWrap:'wrap',
                    marginBottom: '4px'
                  }}>
                    <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 600, color: 'var(--text-primary)' }}>{test.title}</h3>
                    
                    {test.testType === 'coding' && (
                      <span style={{
                        background: 'rgba(168,85,247,0.12)',
                        color: '#a855f7',
                        border: '1px solid rgba(168,85,247,0.2)',
                        borderRadius: '6px',
                        padding: '2px 8px',
                        fontSize: '11px',
                        fontWeight: '600',
                        whiteSpace: 'nowrap'
                      }}>
                        💻 Coding
                      </span>
                    )}
                    
                    {test.testType === 'combined' && (
                      <span style={{
                        background: 'rgba(59,130,246,0.12)',
                        color: '#3b82f6',
                        border: '1px solid rgba(59,130,246,0.2)',
                        borderRadius: '6px',
                        padding: '2px 8px',
                        fontSize: '11px',
                        fontWeight: '600',
                        whiteSpace: 'nowrap'
                      }}>
                        🎯 MCQ + Coding
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
                    <span>{test.totalQuestions} Qs</span>
                    <span>{test.duration} min</span>
                    <span>{test.maxAttempts || 1} attempt{(test.maxAttempts || 1) > 1 ? 's' : ''}</span>
                  </div>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginBottom: 20 }}>
                    {formatDate(test.startTime)} – {formatDate(test.endTime)}
                  </p>

                  {/* Combined Progress */}
                  {test.testType === 'combined' && (
                    <div style={{
                      display:'flex', gap:'12px',
                      marginBottom:'12px', 
                      fontSize:'12px',
                      color: 'var(--text-secondary)'
                    }}>
                      <span style={{
                        display:'flex', alignItems:'center',
                        gap:'4px',
                        color: test.hasAttempted
                          ? 'var(--accent-green)'
                          : 'var(--text-muted)'
                      }}>
                        {test.hasAttempted ? '✓' : '○'} 
                        MCQ Section
                      </span>
                      <span style={{
                        display:'flex', alignItems:'center',
                        gap:'4px',
                        color: test.hasAttemptedCoding
                          ? 'var(--accent-green)'
                          : 'var(--text-muted)'
                      }}>
                        {test.hasAttemptedCoding ? '✓' : '○'} 
                        Coding Section
                      </span>
                    </div>
                  )}

                  {/* Action */}
                  {(!test.testType || test.testType === 'mcq') && (
                    <>
                      {test.hasAttempted ? (
                        <div style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                          background: 'var(--accent-green-bg)', color: 'var(--accent-green)',
                          borderRadius: 10, padding: '8px 16px', fontSize: 13, fontWeight: 600,
                        }}>
                          <HiOutlineCheckBadge size={16} />
                          Attempted · {test.bestPercentage}%
                        </div>
                      ) : isLive ? (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => navigate(`/student/test/${test._id}`)}
                            className="dms-btn dms-btn-primary" style={{ padding: '10px 16px', fontSize: 13, flex: 1 }}>
                            <HiOutlinePlayCircle size={18} /> MCQ Test →
                          </button>
                          <button onClick={() => navigate(`/student/coding-test/${test._id}`)}
                            style={{ padding: '10px 16px', fontSize: 13, background: 'var(--bg-hover)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600', fontFamily: "'Sora', sans-serif", transition: 'all 0.15s' }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = '#06b6d4'; e.currentTarget.style.color = '#06b6d4'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
                            <HiOutlineCodeBracketSquare size={16} /> Code
                          </button>
                        </div>
                      ) : (
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: 6,
                          color: 'var(--text-muted)', fontSize: 13,
                          background: 'var(--bg-hover)', borderRadius: 10,
                          padding: '10px 16px', justifyContent: 'center',
                        }}>
                          <HiOutlineClock size={16} /> Starts in {getTimeUntil(test.startTime)}
                        </div>
                      )}
                    </>
                  )}

                  {/* NEW: Coding Only test button */}
                  {test.testType === 'coding' && (
                    <button
                      disabled={!isLive || test.hasAttemptedCoding}
                      onClick={() => navigate(`/student/coding-test/${test._id}`)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: test.hasAttemptedCoding
                          ? 'var(--bg-hover)'
                          : (!isLive 
                            ? 'var(--bg-hover)' 
                            : 'var(--accent-blue)'),
                        color: test.hasAttemptedCoding
                          ? 'var(--text-muted)'
                          : (!isLive 
                            ? 'var(--text-muted)' 
                            : '#fff'),
                        border: 'none',
                        borderRadius: '10px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: (!isLive || test.hasAttemptedCoding)
                          ? 'not-allowed' : 'pointer',
                        marginTop: '8px'
                      }}
                    >
                      {test.hasAttemptedCoding
                        ? '✓ Submitted'
                        : !isLive
                          ? 'Not Live Yet'
                          : '💻 Start Coding Test →'}
                    </button>
                  )}

                  {/* NEW: Combined test button */}
                  {test.testType === 'combined' && (
                    <button
                      disabled={
                        !isLive || 
                        (test.hasAttempted && test.hasAttemptedCoding)
                      }
                      onClick={() => {
                        const mcqDone = test.hasAttempted;
                        if (!mcqDone) {
                          navigate(`/student/test/${test._id}`);
                        } else if (!test.hasAttemptedCoding) {
                          navigate(`/student/coding-test/${test._id}`);
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: (test.hasAttempted && test.hasAttemptedCoding) || !isLive
                          ? 'var(--bg-hover)'
                          : 'var(--accent-blue)',
                        color: (test.hasAttempted && test.hasAttemptedCoding) || !isLive
                          ? 'var(--text-muted)'
                          : '#fff',
                        border: 'none',
                        borderRadius: '10px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: (!isLive || (test.hasAttempted && test.hasAttemptedCoding)) 
                          ? 'not-allowed' : 'pointer',
                        marginTop: '8px'
                      }}
                    >
                      {(() => {
                        const mcqDone = test.hasAttempted;
                        const codingDone = test.hasAttemptedCoding;
                        
                        if (!isLive) return 'Not Live Yet';
                        if (mcqDone && codingDone) return '✓ Completed';
                        if (!mcqDone) return '🎯 Start Test (MCQ + Coding) →';
                        return '💻 Continue to Coding →';
                      })()}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Previous Results */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 17, fontWeight: 600, color: 'var(--text-primary)' }}>Previous Results</h2>
          {results.length > 0 && (
            <Link to="/student/results" style={{ fontSize: 12, color: 'var(--accent-blue)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              View all <HiOutlineArrowRight size={12} />
            </Link>
          )}
        </div>

        {results.length === 0 ? (
          <div style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
            borderRadius: 16, padding: '48px 24px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>You haven't attempted any tests yet</p>
          </div>
        ) : (
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ textAlign: 'left', padding: '12px 20px', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Test</th>
                    <th style={{ textAlign: 'center', padding: '12px 20px', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Score</th>
                    <th style={{ textAlign: 'center', padding: '12px 20px', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>%</th>
                    <th className="hidden sm:table-cell" style={{ textAlign: 'left', padding: '12px 20px', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Date</th>
                    <th style={{ width: 40 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {results.slice(0, 5).map((r) => {
                    const pass = (r.percentage || 0) >= 40;
                    return (
                      <tr key={r._id} onClick={() => navigate(`/student/results/${r._id}`)}
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '12px 20px', fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{r.testId?.title || 'N/A'}</td>
                        <td style={{ padding: '12px 20px', textAlign: 'center' }}>
                          <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 13, fontWeight: 700, color: pass ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                            {r.score}/{r.totalMarks}
                          </span>
                        </td>
                        <td style={{ padding: '12px 20px', textAlign: 'center' }}>
                          <span style={{
                            fontSize: 11, fontWeight: 700, borderRadius: 20,
                            padding: '3px 10px',
                            background: pass ? 'var(--accent-green-bg)' : 'var(--accent-red-bg)',
                            color: pass ? 'var(--accent-green)' : 'var(--accent-red)',
                          }}>{r.percentage}%</span>
                        </td>
                        <td className="hidden sm:table-cell" style={{ padding: '12px 20px', fontSize: 12, color: 'var(--text-muted)' }}>{formatDate(r.submittedAt)}</td>
                        <td style={{ padding: '12px 20px' }}><HiOutlineArrowRight size={14} style={{ color: 'rgba(255,255,255,0.2)' }} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
