import { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';
import {
  HiOutlineHome,
  HiOutlineClipboardDocumentList,
  HiOutlineChartBarSquare,
  HiOutlineUsers,
  HiOutlineArrowRightOnRectangle,
  HiOutlineBars3,
  HiOutlineXMark,
  HiOutlineCodeBracketSquare,
} from 'react-icons/hi2';

const DashboardLayout = () => {
  const { theme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAdmin = user?.role === 'admin';

  const handleLogout = () => {
    logout();
    navigate(isAdmin ? '/admin/login' : '/login');
  };

  const adminNav = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: HiOutlineHome },
    { path: '/admin/tests', label: 'Manage Tests', icon: HiOutlineClipboardDocumentList },
    { path: '/admin/students', label: 'Students', icon: HiOutlineUsers },
    { path: '/admin/results', label: 'Results', icon: HiOutlineChartBarSquare },
  ];

  const studentNav = [
    { path: '/student/dashboard', label: 'Dashboard', icon: HiOutlineHome },
    { path: '/student/results', label: 'My Results', icon: HiOutlineChartBarSquare },
  ];

  const navItems = isAdmin ? adminNav : studentNav;

  const isActive = (path) => {
    if (path === '/admin/tests' && location.pathname.startsWith('/admin/tests')) return true;
    if (path === '/admin/results' && location.pathname.startsWith('/admin/results')) return true;
    if (path === '/student/results' && location.pathname.startsWith('/student/results')) return true;
    return location.pathname === path;
  };

  const accentColor = isAdmin ? 'var(--accent-amber)' : 'var(--accent-blue)';
  const accentBg = isAdmin ? 'var(--accent-amber-bg)' : 'var(--accent-blue-bg)';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 40 }}
          className="lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        className={`lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{
          width: '240px',
          minWidth: '240px',
          flexShrink: 0,
          background: 'var(--bg-sidebar)',
          borderRight: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0, left: 0,
          height: '100vh',
          zIndex: 50,
          transition: 'transform 0.3s'
        }}
      >
        {/* Logo */}
        <div style={{
          height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 20px', borderBottom: '1px solid var(--border-color)',
        }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, color: '#fff', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
            }}>
              🎓
            </div>
            <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
              Sync<span style={{ color: 'var(--accent-blue)' }}>Test</span>
            </span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden"
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <HiOutlineXMark size={20} />
          </button>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '20px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '11px 16px', borderRadius: '12px', cursor: 'pointer',
                  textDecoration: 'none', position: 'relative',
                  color: active ? (isAdmin ? 'var(--accent-amber)' : 'var(--accent-blue)') : 'var(--text-secondary)',
                  background: active ? accentBg : 'transparent',
                  border: active ? `1px solid ${isAdmin ? 'rgba(234,179,8,0.2)' : 'rgba(59,130,246,0.2)'}` : '1px solid transparent',
                  fontWeight: active ? 600 : 500,
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: active ? `0 4px 14px ${isAdmin ? 'rgba(234,179,8,0.1)' : 'rgba(59,130,246,0.1)'}` : 'none'
                }}
                onMouseEnter={e => {
                  if (!active) {
                    e.currentTarget.style.background = 'var(--bg-hover)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }
                }}
              >
                <Icon size={19} style={{ flexShrink: 0 }} />
                <span style={{ fontSize: '14px' }}>
                  {item.label}
                </span>
                {active && (
                  <span style={{
                    marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%',
                    background: isAdmin ? 'var(--accent-amber)' : 'var(--accent-blue)'
                  }} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User info */}
        <div style={{
          padding: '18px 16px',
          borderTop: '1px solid var(--border-color)',
          marginTop: 'auto',
          background: 'rgba(0,0,0,0.1)'
        }}>
          <div style={{
            display: 'flex', alignItems: 'center',
            gap: '12px', marginBottom: '12px'
          }}>
            <div style={{ position: 'relative' }}>
              <div style={{
                width: '38px', height: '38px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center',
                fontSize: '15px', fontWeight: '700',
                flexShrink: 0,
                color: '#fff',
                boxShadow: '0 4px 12px rgba(59,130,246,0.25)'
              }}>
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <span style={{
                position: 'absolute', bottom: -1, right: -1,
                width: 10, height: 10, borderRadius: '50%',
                background: '#10b981', border: '2px solid var(--bg-sidebar)'
              }} />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{
                fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0
              }}>
                {user?.name}
              </p>
              <span style={{
                fontSize: '10px',
                background: accentBg,
                color: accentColor,
                padding: '2px 8px',
                borderRadius: '6px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                display: 'inline-block',
                marginTop: '3px'
              }}>
                {user?.role}
              </span>
            </div>
          </div>
          <button onClick={handleLogout} style={{
            display: 'flex', alignItems: 'center',
            gap: '8px', color: 'var(--accent-red)',
            background: 'none', border: 'none',
            cursor: 'pointer', fontSize: '13px',
            fontWeight: '600',
            padding: '6px 4px', width: '100%',
            borderRadius: '8px',
            transition: 'background 0.15s'
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-red-bg)'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            <HiOutlineArrowRightOnRectangle size={16} />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="lg:ml-[240px]" style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        minHeight: '100vh',
        marginLeft: window.innerWidth >= 1024 ? '240px' : 0
      }}>
        {/* Top bar */}
        <div style={{
          height: '64px',
          background: theme === 'light' ? 'rgba(255, 255, 255, 0.85)' : 'rgba(8, 12, 20, 0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
          position: 'sticky',
          top: 0,
          zIndex: 40
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden"
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
              <HiOutlineBars3 size={24} />
            </button>
            <div className="hidden sm:flex items-center gap-2">
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)',
                color: '#10b981', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 9999
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} className="animate-pulse-dot" />
                SYSTEM ONLINE
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }} className="hidden sm:block">
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <ThemeToggle />
          </div>
        </div>

        {/* Page content */}
        <div style={{
          flex: 1,
          padding: '32px 36px',
          overflowY: 'auto'
        }}>
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
