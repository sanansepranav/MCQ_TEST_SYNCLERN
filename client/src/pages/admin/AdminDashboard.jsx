import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import toast from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';
import {
  HiOutlineClipboardDocumentList,
  HiOutlineUsers,
  HiOutlineChartBarSquare,
  HiOutlineSignal,
  HiOutlinePlus,
  HiOutlineArrowRight,
} from 'react-icons/hi2';

const AdminDashboard = () => {
  const { theme } = useTheme();
  const [stats, setStats] = useState({
    totalTests: 0, totalStudents: 0, totalSubmissions: 0, liveTests: 0,
    recentTests: [], recentSubmissions: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      const res = await API.get('/tests/stats/dashboard');
      setStats(res.data.data);
    } catch { toast.error('Failed to load dashboard stats'); }
    finally { setLoading(false); }
  };

  const cards = [
    { label: 'Total Tests', value: stats.totalTests, icon: HiOutlineClipboardDocumentList, color: 'var(--accent-blue)', bg: 'var(--accent-blue-bg)' },
    { label: 'Total Students', value: stats.totalStudents, icon: HiOutlineUsers, color: 'var(--accent-amber)', bg: 'var(--accent-amber-bg)' },
    { label: 'Submissions', value: stats.totalSubmissions, icon: HiOutlineChartBarSquare, color: 'var(--accent-green)', bg: 'var(--accent-green-bg)' },
    { label: 'Live Tests', value: stats.liveTests, icon: HiOutlineSignal, color: 'var(--accent-red)', bg: 'var(--accent-red-bg)' },
  ];

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
  }) : '—';

  const getStatusPill = (status) => {
    const map = {
      published: { bg: 'var(--accent-green-bg)', color: 'var(--accent-green)', label: 'Published' },
      draft: { bg: 'var(--bg-hover)', color: 'var(--text-muted)', label: 'Draft' },
      active: { bg: 'var(--accent-blue-bg)', color: 'var(--accent-blue)', label: 'Live' },
    };
    const s = map[status] || map.draft;
    return (
      <span style={{
        fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1,
        background: s.bg, color: s.color,
        borderRadius: 20, padding: '3px 10px',
      }}>{s.label}</span>
    );
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          border: '3px solid var(--accent-amber-bg)', borderTopColor: 'var(--accent-amber)',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>Admin Dashboard</h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>Overview of your test management system</p>
        </div>
        <Link to="/admin/tests/create" className="dms-btn dms-btn-amber dms-btn-sm">
          <HiOutlinePlus size={16} /> Create Test
        </Link>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} style={{
              background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
              borderRadius: 16, padding: 24,
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
              boxShadow: theme === 'light' ? 'var(--shadow-sm)' : 'none',
            }}>
              <div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 500 }}>{card.label}</p>
                <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 32, fontWeight: 700, color: card.color, marginTop: 8 }}>{card.value}</p>
              </div>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: card.bg, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={22} style={{ color: card.color }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 20 }}>
        {/* Recent Tests */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 16, padding: 24, boxShadow: theme === 'light' ? 'var(--shadow-sm)' : 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>Recent Tests</h2>
            <Link to="/admin/tests" style={{ fontSize: 12, color: 'var(--accent-amber)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              View all <HiOutlineArrowRight size={12} />
            </Link>
          </div>
          {stats.recentTests.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: '32px 0' }}>No tests created yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {stats.recentTests.slice(0, 5).map((t) => (
                <div key={t._id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 14px', borderRadius: 10,
                  background: 'var(--bg-hover)',
                  transition: 'background 0.15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-input)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{formatDate(t.createdAt)}</p>
                  </div>
                  {getStatusPill(t.status)}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Submissions */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 16, padding: 24, boxShadow: theme === 'light' ? 'var(--shadow-sm)' : 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>Recent Submissions</h2>
            <Link to="/admin/results" style={{ fontSize: 12, color: 'var(--accent-amber)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              View all <HiOutlineArrowRight size={12} />
            </Link>
          </div>
          {stats.recentSubmissions.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: '32px 0' }}>No submissions yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {stats.recentSubmissions.slice(0, 5).map((s) => (
                <div key={s._id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 14px', borderRadius: 10,
                  background: 'var(--bg-hover)',
                  transition: 'background 0.15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-input)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {s.studentId?.name || 'N/A'}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                      {s.testId?.title || 'N/A'} · {formatDate(s.submittedAt)}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right', marginLeft: 12 }}>
                    <span style={{
                      fontFamily: "'Sora', sans-serif", fontSize: 14, fontWeight: 700,
                      color: (s.percentage || 0) >= 40 ? 'var(--accent-green)' : 'var(--accent-red)',
                    }}>{s.percentage}%</span>
                    {s.autoSubmitted && (
                      <span style={{
                        display: 'block', fontSize: 9, fontWeight: 700, color: 'var(--accent-red)',
                        marginTop: 2, letterSpacing: 1,
                      }}>AUTO</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
