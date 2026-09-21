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
      {/* Welcome Banner */}
      <div className="glass-card" style={{
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(99, 102, 241, 0.05) 100%)',
        border: '1px solid rgba(59, 130, 246, 0.22)',
        borderRadius: 20, padding: '26px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
        boxShadow: '0 10px 30px -10px rgba(59, 130, 246, 0.12)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-blue)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Student Portal
            </span>
            <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--text-muted)' }} />
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {user?.rollNumber ? `Roll: ${user.rollNumber}` : 'Candidate'}
            </span>
          </div>
          <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.5px' }}>
            {greeting()}, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 6, marginBottom: 0 }}>
            Prepare for upcoming assessments, practice coding challenges, and review your performance.
          </p>
        </div>

        {user?.branch && (
          <div style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-color)',
            borderRadius: 12, padding: '8px 16px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start'
          }}>
            <span style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: 0.5 }}>Branch</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>{user.branch}</span>
          </div>
        )}
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 14 }}>
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="glass-card glass-card-hover" style={{
              borderRadius: 18, padding: '20px 22px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
            }}>
              <div>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 600, margin: 0 }}>{s.label}</p>
                <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 26, fontWeight: 800, color: s.color, margin: '8px 0 0', letterSpacing: '-0.5px' }}>{s.value}</p>
              </div>
              <div style={{
                width: 42, height: 42, borderRadius: 12,
                background: `${s.color}15`, border: `1px solid ${s.color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Icon size={20} style={{ color: s.color }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Available Tests */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Available Tests & Assessments
          </h2>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
            {liveTests.length} Live now · {upcomingTests.length} Scheduled
          </span>
        </div>

        {liveTests.length === 0 && upcomingTests.length === 0 ? (
          <div className="glass-card" style={{
            borderRadius: 20, padding: '56px 24px', textAlign: 'center',
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16, background: 'var(--accent-blue-bg)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 26, margin: '0 auto 16px'
            }}>📝</div>
            <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px' }}>
              No active tests right now
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: 0, maxWidth: 360, marginInline: 'auto' }}>
              Your faculty has not scheduled any live examinations at this moment. Check back soon!
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
            {[...liveTests, ...upcomingTests].map((test) => {
              const isLive = test.liveStatus === 'live';
              return (
                <div key={test._id} className="glass-card glass-card-hover" style={{
                  borderRadius: 20, padding: '24px',
                  display: 'flex', flexDirection: 'column',
                  borderColor: isLive ? 'rgba(239, 68, 68, 0.25)' : 'var(--border-color)',
                  position: 'relative', overflow: 'hidden'
                }}>
                  {/* Subtle top accent border for live tests */}
                  {isLive && (
                    <div style={{
                      position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                      background: 'linear-gradient(90deg, #ef4444 0%, #f97316 100%)'
                    }} />
                  )}

                  {/* Status badge & Type */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8,
                      background: isLive ? 'rgba(239,68,68,0.12)' : 'rgba(59,130,246,0.12)',
                      border: isLive ? '1px solid rgba(239,68,68,0.25)' : '1px solid rgba(59,130,246,0.25)',
                      color: isLive ? 'var(--accent-red)' : 'var(--accent-blue)',
                      borderRadius: 20, padding: '4px 12px',
                    }}>
                      {isLive && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-red)' }} className="animate-pulse-dot" />}
                      {isLive ? 'LIVE NOW' : 'UPCOMING'}
                    </span>

                    {test.testType === 'coding' && (
                      <span style={{
                        background: 'rgba(168,85,247,0.12)', color: '#a855f7',
                        border: '1px solid rgba(168,85,247,0.25)', borderRadius: 8,
                        padding: '3px 10px', fontSize: 11, fontWeight: 700
                      }}>
                        💻 Coding IDE
                      </span>
                    )}

                    {test.testType === 'combined' && (
                      <span style={{
                        background: 'rgba(59,130,246,0.12)', color: '#3b82f6',
                        border: '1px solid rgba(59,130,246,0.25)', borderRadius: 8,
                        padding: '3px 10px', fontSize: 11, fontWeight: 700
                      }}>
                        🎯 MCQ + Coding
                      </span>
                    )}

                    {(!test.testType || test.testType === 'mcq') && (
                      <span style={{
                        background: 'rgba(16,185,129,0.1)', color: '#10b981',
                        border: '1px solid rgba(16,185,129,0.25)', borderRadius: 8,
                        padding: '3px 10px', fontSize: 11, fontWeight: 700
                      }}>
                        📝 Standard MCQ
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 style={{
                    fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 700,
                    color: 'var(--text-primary)', margin: '0 0 10px', letterSpacing: '-0.3px',
                    lineHeight: 1.3
                  }}>
                    {test.title}
                  </h3>

                  {/* Info Chips */}
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>
                    <span style={{
                      background: 'rgba(255,255,255,0.04)', padding: '4px 10px', borderRadius: 8,
                      border: '1px solid var(--border-color)', fontWeight: 600
                    }}>
                      📋 {test.totalQuestions} Questions
                    </span>
                    <span style={{
                      background: 'rgba(255,255,255,0.04)', padding: '4px 10px', borderRadius: 8,
                      border: '1px solid var(--border-color)', fontWeight: 600
                    }}>
                      ⏱️ {test.duration} mins
                    </span>
                    <span style={{
                      background: 'rgba(255,255,255,0.04)', padding: '4px 10px', borderRadius: 8,
                      border: '1px solid var(--border-color)', fontWeight: 600
                    }}>
                      🔄 {test.maxAttempts || 1} attempt
                    </span>
                  </div>

                  {/* Time frame */}
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 18, marginTop: 'auto' }}>
                    📅 {formatDate(test.startTime)} → {formatDate(test.endTime)}
                  </p>

                  {/* Combined Progress */}
                  {test.testType === 'combined' && (
                    <div style={{
                      display: 'flex', gap: 10, marginBottom: 14,
                      fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)'
                    }}>
                      <span style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        color: test.hasAttempted ? 'var(--accent-green)' : 'var(--text-muted)'
                      }}>
                        {test.hasAttempted ? '✓' : '○'} MCQ Section
                      </span>
                      <span style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        color: test.hasAttemptedCoding ? 'var(--accent-green)' : 'var(--text-muted)'
                      }}>
                        {test.hasAttemptedCoding ? '✓' : '○'} Coding Section
                      </span>
                    </div>
                  )}

                  {/* Actions */}
                  {(!test.testType || test.testType === 'mcq') && (
                    <>
                      {test.hasAttempted ? (
                        <div style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                          background: 'var(--accent-green-bg)', color: 'var(--accent-green)',
                          border: '1px solid rgba(16,185,129,0.25)',
                          borderRadius: 12, padding: '11px 16px', fontSize: 13, fontWeight: 700,
                        }}>
                          <HiOutlineCheckBadge size={18} />
                          Attempted · {test.bestPercentage}%
                        </div>
                      ) : isLive ? (
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => navigate(`/student/test/${test._id}`)}
                            className="dms-btn dms-btn-primary" style={{ padding: '11px 16px', fontSize: 13, flex: 1, borderRadius: 12 }}>
                            <HiOutlinePlayCircle size={18} /> Start MCQ Test →
                          </button>
                        </div>
                      ) : (
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: 6,
                          color: 'var(--text-muted)', fontSize: 13,
                          background: 'var(--bg-hover)', borderRadius: 12,
                          padding: '11px 16px', justifyContent: 'center', fontWeight: 500
                        }}>
                          <HiOutlineClock size={16} /> Starts in {getTimeUntil(test.startTime)}
                        </div>
                      )}
                    </>
                  )}

                  {/* Coding Only test button */}
                  {test.testType === 'coding' && (
                    <button
                      disabled={!isLive || test.hasAttemptedCoding}
                      onClick={() => navigate(`/student/coding-test/${test._id}`)}
                      className={isLive && !test.hasAttemptedCoding ? "dms-btn dms-btn-primary" : ""}
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: test.hasAttemptedCoding
                          ? 'var(--accent-green-bg)'
                          : (!isLive 
                            ? 'var(--bg-hover)' 
                            : undefined),
                        color: test.hasAttemptedCoding
                          ? 'var(--accent-green)'
                          : (!isLive 
                            ? 'var(--text-muted)' 
                            : undefined),
                        border: test.hasAttemptedCoding
                          ? '1px solid rgba(16,185,129,0.25)'
                          : (!isLive ? '1px solid var(--border-color)' : 'none'),
                        borderRadius: '12px',
                        fontSize: '13px',
                        fontWeight: '700',
                        cursor: (!isLive || test.hasAttemptedCoding) ? 'not-allowed' : 'pointer',
                        marginTop: '8px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                      }}
                    >
                      {test.hasAttemptedCoding
                        ? '✓ Coding Assessment Submitted'
                        : !isLive
                          ? 'Starts Soon'
                          : '💻 Start Coding Test →'}
                    </button>
                  )}

                  {/* Combined test button */}
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
                      className={(isLive && !(test.hasAttempted && test.hasAttemptedCoding)) ? "dms-btn dms-btn-primary" : ""}
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: (test.hasAttempted && test.hasAttemptedCoding)
                          ? 'var(--accent-green-bg)'
                          : (!isLive ? 'var(--bg-hover)' : undefined),
                        color: (test.hasAttempted && test.hasAttemptedCoding)
                          ? 'var(--accent-green)'
                          : (!isLive ? 'var(--text-muted)' : undefined),
                        border: (test.hasAttempted && test.hasAttemptedCoding)
                          ? '1px solid rgba(16,185,129,0.25)'
                          : (!isLive ? '1px solid var(--border-color)' : 'none'),
                        borderRadius: '12px',
                        fontSize: '13px',
                        fontWeight: '700',
                        cursor: (!isLive || (test.hasAttempted && test.hasAttemptedCoding)) 
                          ? 'not-allowed' : 'pointer',
                        marginTop: '8px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                      }}
                    >
                      {(() => {
                        const mcqDone = test.hasAttempted;
                        const codingDone = test.hasAttemptedCoding;
                        
                        if (!isLive) return 'Starts Soon';
                        if (mcqDone && codingDone) return '✓ All Sections Completed';
                        if (!mcqDone) return '🎯 Start Test (MCQ + Coding) →';
                        return '💻 Continue to Coding Section →';
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
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Recent Assessment History
          </h2>
          {results.length > 0 && (
            <Link to="/student/results" style={{
              fontSize: 13, color: 'var(--accent-blue)', textDecoration: 'none',
              display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600
            }}>
              View all results <HiOutlineArrowRight size={14} />
            </Link>
          )}
        </div>

        {results.length === 0 ? (
          <div className="glass-card" style={{
            borderRadius: 20, padding: '48px 24px', textAlign: 'center',
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14, background: 'rgba(59,130,246,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, margin: '0 auto 12px'
            }}>📊</div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: 0 }}>You haven't attempted any tests yet</p>
          </div>
        ) : (
          <div className="glass-card" style={{ borderRadius: 20, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)' }}>
                    <th style={{ textAlign: 'left', padding: '14px 22px', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Test Name</th>
                    <th style={{ textAlign: 'center', padding: '14px 22px', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Raw Score</th>
                    <th style={{ textAlign: 'center', padding: '14px 22px', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Percentage</th>
                    <th className="hidden sm:table-cell" style={{ textAlign: 'left', padding: '14px 22px', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Date & Time</th>
                    <th style={{ width: 50 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {results.slice(0, 5).map((r) => {
                    const pass = (r.percentage || 0) >= 40;
                    return (
                      <tr key={r._id} onClick={() => navigate(`/student/results/${r._id}`)}
                        style={{ borderBottom: '1px solid var(--border-color)', cursor: 'pointer', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '14px 22px', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{r.testId?.title || 'Assessment'}</td>
                        <td style={{ padding: '14px 22px', textAlign: 'center' }}>
                          <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 14, fontWeight: 700, color: pass ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                            {r.score}/{r.totalMarks}
                          </span>
                        </td>
                        <td style={{ padding: '14px 22px', textAlign: 'center' }}>
                          <span style={{
                            fontSize: 12, fontWeight: 700, borderRadius: 20,
                            padding: '4px 12px',
                            background: pass ? 'var(--accent-green-bg)' : 'var(--accent-red-bg)',
                            color: pass ? 'var(--accent-green)' : 'var(--accent-red)',
                            border: `1px solid ${pass ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`
                          }}>{r.percentage}%</span>
                        </td>
                        <td className="hidden sm:table-cell" style={{ padding: '14px 22px', fontSize: 13, color: 'var(--text-secondary)' }}>{formatDate(r.submittedAt)}</td>
                        <td style={{ padding: '14px 22px' }}><HiOutlineArrowRight size={15} style={{ color: 'var(--accent-blue)' }} /></td>
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
