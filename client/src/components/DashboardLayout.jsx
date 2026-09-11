import { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
          height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 20px', borderBottom: '1px solid var(--border-color)',
        }}>
          <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
            Sync<span style={{ color: 'var(--accent-blue)' }}>Test</span>
          </span>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden"
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <HiOutlineXMark size={20} />
          </button>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '10px 16px', borderRadius: '8px', cursor: 'pointer',
                  marginBottom: '4px', textDecoration: 'none',
                  color: active ? accentColor : 'var(--text-secondary)',
                  background: active ? accentBg : 'transparent',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-label)'; } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; } }}
              >
                <Icon size={18} />
                <span style={{ fontSize: '14px', fontWeight: '500' }}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* User info */}
        <div style={{
          padding: '16px',
          borderTop: '1px solid var(--border-color)',
          marginTop: 'auto'
        }}>
          <div style={{
            display: 'flex', alignItems: 'center',
            gap: '10px', marginBottom: '12px'
          }}>
            <div style={{
              width: '36px', height: '36px',
              borderRadius: '50%',
              background: accentColor,
              display: 'flex', alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px', fontWeight: '700',
              flexShrink: 0,
              color: '#fff'
            }}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{
                fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
              }}>
                {user?.name}
              </p>
              <span style={{
                fontSize: '11px',
                background: accentBg,
                color: accentColor,
                padding: '1px 8px',
                borderRadius: '4px',
                fontWeight: '600',
                textTransform: 'uppercase',
                display: 'inline-block',
                marginTop: '2px'
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
            padding: '4px 0', width: '100%'
          }}>
            <HiOutlineArrowRightOnRectangle size={15} />
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
          height: '60px',
          background: 'var(--bg-primary)',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
          position: 'sticky',
          top: 0,
          zIndex: 40
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden"
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginRight: '16px' }}>
              <HiOutlineBars3 size={22} />
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ThemeToggle />
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }} className="hidden sm:block">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>

        {/* Page content */}
        <div style={{
          flex: 1,
          padding: '32px 40px',
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
