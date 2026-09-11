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
    background: theme === 'light' ? '#f8faff' : 'rgba(255,255,255,0.05)',
    border: focused 
      ? '1.5px solid var(--accent-blue)' 
      : (theme === 'light' ? '1.5px solid #cbd5e1' : '1px solid rgba(255,255,255,0.12)'),
    borderRadius: '10px',
    color: theme === 'light' ? '#0f172a' : '#ffffff',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    transition: 'all 0.2s ease'
  });

  const labelStyle = {
    color: theme === 'light' ? '#374151' : 'var(--text-label)',
    fontSize: '13px',
    fontWeight: '600',
    marginBottom: '8px',
    display: 'block'
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div className="animate-fade-in" style={{
        background: theme === 'light' ? '#ffffff' : 'var(--bg-surface)',
        border: theme === 'light' ? '1px solid #e2e8f0' : '1px solid var(--border-color)',
        borderRadius: 20, padding: 40, width: '100%', maxWidth: 420,
        boxShadow: theme === 'light' ? '0 8px 40px rgba(0,0,0,0.10)' : 'none'
      }}>
        {/* Icon */}
        <div style={{
          width: 56, height: 56, borderRadius: 14, background: 'var(--accent-blue)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px', fontSize: 24,
        }}>🎓</div>

        <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 24, fontWeight: 700, textAlign: 'center', color: 'var(--text-primary)', marginBottom: 6 }}>
          Welcome Back
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', marginBottom: 32 }}>
          Sign in to SyncTest
        </p>

        <form onSubmit={handleSubmit}>
          {/* Email or Mobile */}
          <div style={{ marginBottom: 20 }}>
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
          <div style={{ marginBottom: 28 }}>
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
                background: theme === 'light' ? '#f8faff' : 'var(--bg-hover)', 
                border: theme === 'light' ? '1.5px solid #cbd5e1' : '1px solid var(--border-input)',
                borderRadius: 10, width: 48, flexShrink: 0, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-muted)', transition: 'color 0.2s',
              }}>
                {showPw ? <HiOutlineEyeSlash size={18} /> : <HiOutlineEye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="dms-btn dms-btn-primary dms-btn-full" style={{ padding: 14 }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Links */}
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '8px 0' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--accent-blue)', textDecoration: 'none' }}>Register here</Link>
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '8px 0' }}>
            <Link to="/forgot-password" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Forgot password?</Link>
          </p>
          <p style={{ margin: '12px 0 0' }}>
            <Link to="/admin/login" style={{
              display: 'inline-block', fontSize: 12, fontWeight: 600,
              color: 'var(--accent-amber)', background: 'var(--accent-amber-bg)',
              border: '1px solid var(--border-hover)', borderRadius: 8,
              padding: '6px 14px', textDecoration: 'none',
            }}>Admin? Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
