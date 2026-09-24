import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';
import { HiOutlineEye, HiOutlineEyeSlash } from 'react-icons/hi2';

const AdminLogin = () => {
  const { theme } = useTheme();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [fEmail, setFEmail] = useState(false);
  const [fPw, setFPw] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Please fill all fields');
    setLoading(true);
    try {
      const user = await login(form.email, form.password, 'admin');
      toast.success('Welcome, Admin!');
      navigate('/admin/dashboard');
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
    border: focused ? '1.5px solid var(--accent-amber)' : '1.5px solid var(--border-input)',
    borderRadius: '10px',
    color: 'var(--text-primary)',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    transition: 'all 0.2s ease',
    boxShadow: focused ? '0 0 0 3px var(--accent-amber-bg)' : 'none'
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
        boxShadow: theme === 'light' ? '0 20px 50px -10px rgba(245, 158, 11, 0.15)' : '0 25px 60px -15px rgba(0,0,0,0.7)'
      }}>
        {/* Icon — amber gradient */}
        <div style={{
          width: 58, height: 58, borderRadius: 16,
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 18px', fontSize: 26, color: '#fff',
          boxShadow: '0 8px 24px rgba(245, 158, 11, 0.35)'
        }}>🛡️</div>

        <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 24, fontWeight: 800, textAlign: 'center', color: 'var(--text-primary)', marginBottom: 6, letterSpacing: '-0.5px' }}>
          Admin Portal
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', textAlign: 'center', marginBottom: 28 }}>
          Faculty & Examination Controller Access
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>Admin Email Address</label>
            <input type="email" placeholder="admin@synctest.com"
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              onFocus={() => setFEmail(true)} onBlur={() => setFEmail(false)} style={inputStyle(fEmail)} />
          </div>

          <div style={{ marginBottom: 26 }}>
            <label style={labelStyle}>Password</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input type={showPw ? 'text' : 'password'} placeholder="••••••••"
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                onFocus={() => setFPw(true)} onBlur={() => setFPw(false)} style={inputStyle(fPw)} />
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

          <button type="submit" disabled={loading} className="dms-btn dms-btn-full" style={{
            padding: 14, fontSize: 15, borderRadius: 12,
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            color: '#ffffff', fontWeight: 700,
            boxShadow: '0 4px 16px rgba(245, 158, 11, 0.3)'
          }}>
            {loading ? 'Authenticating...' : 'Sign In as Administrator →'}
          </button>
        </form>

        <div style={{ marginTop: 24, textAlign: 'center', paddingTop: 16, borderTop: '1px solid var(--border-color)' }}>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0' }}>
            <Link to="/login" style={{ color: 'var(--accent-blue)', textDecoration: 'none', fontWeight: 600 }}>← Back to Student Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
