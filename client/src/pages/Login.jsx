import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';
import { HiOutlineEye, HiOutlineEyeSlash } from 'react-icons/hi2';
import api from '../services/api';

const Login = () => {
  const { theme } = useTheme();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const error = params.get('error');

    if (error) {
      toast.error('Google Authentication failed. Please try again.');
      // Clean up URL
      navigate('/login', { replace: true });
    } else if (token) {
      // Handle successful Google login
      const handleGoogleLogin = async () => {
        try {
          localStorage.setItem('token', token);
          // We need to fetch the user profile to populate auth context
          const res = await api.get('/auth/me');
          if (res.data.success) {
            toast.success('Welcome back!');
            navigate(res.data.data.role === 'admin' ? '/admin/dashboard' : '/student/dashboard');
            window.location.reload(); // Refresh to update AuthContext state properly
          }
        } catch (err) {
          toast.error('Failed to retrieve user profile after Google login.');
          localStorage.removeItem('token');
        }
      };
      handleGoogleLogin();
    }
  }, [location, navigate]);
  
  const [emailFocused, setEmailFocused] = useState(false);
  const [pwFocused, setPwFocused] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Please fill all fields');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (focused) => ({
    width: '100%',
    padding: '13px 16px',
    background: 'var(--bg-input)',
    border: focused ? '1.5px solid var(--accent-blue)' : '1.5px solid var(--border-input)',
    borderRadius: '10px',
    color: 'var(--text-primary)',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    transition: 'all 0.2s ease',
    boxShadow: focused ? '0 0 0 3px var(--accent-blue-bg)' : 'none'
  });

  const labelStyle = {
    color: 'var(--text-primary)',
    fontSize: '13px',
    fontWeight: '600',
    marginBottom: '8px',
    display: 'block'
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative', overflow: 'hidden' }}>
      {/* Ambient background glow */}
      <div className="mesh-glow-bg" />

      <div className="animate-fade-in glass-card" style={{
        borderRadius: 22, padding: '44px 36px', width: '100%', maxWidth: 440,
        position: 'relative', zIndex: 1,
        boxShadow: theme === 'light' ? '0 20px 50px -10px rgba(59, 130, 246, 0.15)' : '0 25px 60px -15px rgba(0,0,0,0.7)'
      }}>
        {/* Logo Badge */}
        <div style={{
          width: 58, height: 58, borderRadius: 16,
          background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 18px', fontSize: 26, color: '#fff',
          boxShadow: '0 8px 24px rgba(59, 130, 246, 0.35)'
        }}>🎓</div>

        <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 24, fontWeight: 800, textAlign: 'center', color: 'var(--text-primary)', marginBottom: 6, letterSpacing: '-0.5px' }}>
          Welcome Back
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', textAlign: 'center', marginBottom: 28 }}>
          Sign in to your <strong style={{ color: 'var(--accent-blue)' }}>SyncTest</strong> account
        </p>

        <form onSubmit={handleSubmit}>
          {/* Email or Mobile */}
          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>Email or Mobile Number</label>
            <input
              type="text"
              placeholder="you@example.com or 10-digit mobile"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
              style={inputStyle(emailFocused)}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: 26 }}>
            <label style={labelStyle}>Password</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                onFocus={() => setPwFocused(true)}
                onBlur={() => setPwFocused(false)}
                style={inputStyle(pwFocused)}
              />
              <button type="button" onClick={() => setShowPw(!showPw)} style={{
                background: 'var(--bg-input)', 
                border: '1.5px solid var(--border-input)',
                borderRadius: 10, width: 48, flexShrink: 0, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-muted)', transition: 'color 0.2s',
              }}>
                {showPw ? <HiOutlineEyeSlash size={18} /> : <HiOutlineEye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="dms-btn dms-btn-primary dms-btn-full" style={{ padding: 14, fontSize: 15, borderRadius: 12 }}>
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0 16px' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
          <span style={{ padding: '0 12px', fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
        </div>

        <button
          onClick={() => window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/google`}
          style={{
            width: '100%',
            padding: '12px',
            background: 'var(--bg-surface)',
            border: '1.5px solid var(--border-input)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            color: 'var(--text-primary)',
            transition: 'all 0.2s',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-surface)'; }}
        >
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        {/* Links */}
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '8px 0' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--accent-blue)', textDecoration: 'none', fontWeight: 600 }}>Create an account</Link>
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '8px 0' }}>
            <Link to="/forgot-password" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Forgot your password?</Link>
          </p>
          <div style={{ margin: '18px 0 0', paddingTop: 16, borderTop: '1px solid var(--border-color)' }}>
            <Link to="/admin/login" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600,
              color: 'var(--accent-blue)', background: 'var(--accent-blue-bg)',
              border: '1px solid var(--accent-blue-border)', borderRadius: 10,
              padding: '7px 16px', textDecoration: 'none',
              transition: 'all 0.2s'
            }}>
              🔒 Faculty / Admin Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
