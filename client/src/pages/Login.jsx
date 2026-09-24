import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';
import { HiOutlineEye, HiOutlineEyeSlash } from 'react-icons/hi2';

const Login = () => {
  const { theme } = useTheme();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  
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
