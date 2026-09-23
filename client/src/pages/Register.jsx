import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { HiOutlineEye, HiOutlineEyeSlash, HiOutlineUserPlus } from 'react-icons/hi2';
import api from '../services/api';

const Register = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [branch, setBranch] = useState('Computer Engineering');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showPw, setShowPw] = useState(false);
  const [showCPw, setShowCPw] = useState(false);

  const [focusedField, setFocusedField] = useState('');

  const inputStyle = (isFocused) => ({
    width: '100%',
    padding: '12px 16px',
    background: theme === 'light' ? '#f8faff' : 'rgba(255,255,255,0.05)',
    border: isFocused
      ? '1.5px solid var(--accent-blue)'
      : (theme === 'light' ? '1.5px solid #cbd5e1' : '1px solid rgba(255,255,255,0.12)'),
    borderRadius: '12px',
    color: theme === 'light' ? '#0f172a' : '#ffffff',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    transition: 'all 0.2s ease',
    boxShadow: isFocused ? '0 0 0 3px rgba(59, 130, 246, 0.15)' : 'none'
  });

  const labelStyle = {
    color: theme === 'light' ? '#334155' : 'var(--text-label)',
    fontSize: '12px',
    fontWeight: '600',
    marginBottom: '6px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim()) return setError('Full name is required');
    if (!rollNumber.trim()) return setError('Roll number is required');

    const cleanMobile = mobileNumber ? mobileNumber.replace(/\D/g, '').slice(-10) : '';
    if (mobileNumber && cleanMobile.length !== 10) {
      return setError('Please enter a valid 10-digit mobile number');
    }

    if (!collegeName.trim()) return setError('College name is required');
    if (!branch) return setError('Please select your branch');
    if (email.trim() && !/\S+@\S+\.\S+/.test(email.trim())) {
      return setError('Please enter a valid email address');
    }
    if (password.length < 6) {
      return setError('Password must be at least 6 characters');
    }
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    const studentEmail = email.trim() || (cleanMobile ? `${cleanMobile}@student.synctest.com` : `${rollNumber.trim().toLowerCase()}@student.synctest.com`);

    setLoading(true);
    try {
      const res = await api.post('/auth/register', {
        name: name.trim(),
        email: studentEmail,
        password,
        rollNumber: rollNumber.trim(),
        mobileNumber: cleanMobile,
        collegeName: collegeName.trim(),
        branch
      });

      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        setSuccess('Account created successfully! Redirecting to dashboard...');
        setTimeout(() => {
          navigate('/student/dashboard');
          window.location.reload();
        }, 1200);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '36px 16px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Ambient background glow */}
      <div className="mesh-glow-bg" />

      <div className="animate-fade-in glass-card" style={{
        borderRadius: 24,
        padding: '40px 36px',
        width: '100%',
        maxWidth: 580,
        position: 'relative',
        zIndex: 1,
        boxShadow: theme === 'light'
          ? '0 20px 50px -10px rgba(59, 130, 246, 0.14)'
          : '0 25px 60px -15px rgba(0,0,0,0.7)',
        transition: 'all 0.3s ease'
      }}>
        {/* Header / Brand */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            width: 54, height: 54, borderRadius: 16,
            background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px', fontSize: 24, color: '#fff',
            boxShadow: '0 8px 24px rgba(59, 130, 246, 0.35)'
          }}>🎓</div>
          <h1 style={{
            fontFamily: "'Sora', sans-serif", fontSize: 24, fontWeight: 800,
            color: 'var(--text-primary)', margin: '0 0 6px', letterSpacing: '-0.5px'
          }}>
            Create Candidate Account
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
            Instant registration for tests & live assessments on <strong style={{ color: 'var(--accent-blue)' }}>SyncTest</strong>
          </p>
        </div>

        {error && (
          <div style={{
            background: 'var(--accent-red-bg)', border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: 12, padding: '12px 16px', marginBottom: 18, fontSize: 13, color: 'var(--accent-red)'
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            background: 'var(--accent-green-bg)', border: '1px solid rgba(16,185,129,0.25)',
            borderRadius: 12, padding: '12px 16px', marginBottom: 18, fontSize: 13, color: 'var(--accent-green)', textAlign: 'center'
          }}>
            {success}
          </div>
        )}

        <form onSubmit={handleRegister}>
          {/* Full Name */}
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Full Name *</label>
            <input
              placeholder="e.g. John Doe"
              value={name}
              onChange={e => setName(e.target.value)}
              onFocus={() => setFocusedField('name')}
              onBlur={() => setFocusedField('')}
              style={inputStyle(focusedField === 'name')}
              required
            />
          </div>

          {/* 2-column grid: Roll No & Mobile */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div>
              <label style={labelStyle}>Roll Number *</label>
              <input
                placeholder="2024CS001"
                value={rollNumber}
                onChange={e => setRollNumber(e.target.value)}
                onFocus={() => setFocusedField('roll')}
                onBlur={() => setFocusedField('')}
                style={inputStyle(focusedField === 'roll')}
                required
              />
            </div>
            <div>
              <label style={labelStyle}>Mobile Number</label>
              <input
                type="tel"
                maxLength={10}
                placeholder="10-digit number"
                value={mobileNumber}
                onChange={e => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                onFocus={() => setFocusedField('mobile')}
                onBlur={() => setFocusedField('')}
                style={inputStyle(focusedField === 'mobile')}
              />
            </div>
          </div>

          {/* 2-column grid: College & Branch */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div>
              <label style={labelStyle}>College Name *</label>
              <input
                type="text"
                placeholder="College / Institute"
                value={collegeName}
                onChange={e => setCollegeName(e.target.value)}
                onFocus={() => setFocusedField('college')}
                onBlur={() => setFocusedField('')}
                style={inputStyle(focusedField === 'college')}
                required
              />
            </div>
            <div>
              <label style={labelStyle}>Branch *</label>
              <select
                value={branch}
                onChange={e => setBranch(e.target.value)}
                onFocus={() => setFocusedField('branch')}
                onBlur={() => setFocusedField('')}
                style={{
                  ...inputStyle(focusedField === 'branch'),
                  cursor: 'pointer'
                }}
                required
              >
                <option value="Computer Engineering">Computer Engineering (CE/CSE)</option>
                <option value="Information Technology">Information Technology (IT)</option>
                <option value="Electronics & Telecommunication Engineering">Electronics (ENTC/ECE)</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Civil Engineering">Civil Engineering</option>
                <option value="Electrical Engineering">Electrical Engineering</option>
                <option value="Artificial Intelligence & Data Science">AI & Data Science (AI&DS)</option>
                <option value="Chemical Engineering">Chemical Engineering</option>
                <option value="Other Engineering Branch">Other Branch</option>
              </select>
            </div>
          </div>

          {/* Optional Email */}
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>
              Email Address <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span>
            </label>
            <input
              type="email"
              placeholder="you@example.com (optional)"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField('')}
              style={inputStyle(focusedField === 'email')}
            />
          </div>

          {/* Password & Confirm Password */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            <div>
              <label style={labelStyle}>Password *</label>
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="Min 6 chars"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('pw')}
                  onBlur={() => setFocusedField('')}
                  style={inputStyle(focusedField === 'pw')}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{
                    background: theme === 'light' ? '#f8faff' : 'var(--bg-hover)',
                    border: theme === 'light' ? '1.5px solid #cbd5e1' : '1px solid var(--border-input)',
                    borderRadius: 10, width: 42, flexShrink: 0, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--text-muted)'
                  }}
                >
                  {showPw ? <HiOutlineEyeSlash size={16} /> : <HiOutlineEye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Confirm Password *</label>
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  type={showCPw ? 'text' : 'password'}
                  placeholder="Repeat password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  onFocus={() => setFocusedField('cpw')}
                  onBlur={() => setFocusedField('')}
                  style={inputStyle(focusedField === 'cpw')}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCPw(!showCPw)}
                  style={{
                    background: theme === 'light' ? '#f8faff' : 'var(--bg-hover)',
                    border: theme === 'light' ? '1.5px solid #cbd5e1' : '1px solid var(--border-input)',
                    borderRadius: 10, width: 42, flexShrink: 0, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--text-muted)'
                  }}
                >
                  {showCPw ? <HiOutlineEyeSlash size={16} /> : <HiOutlineEye size={16} />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="dms-btn dms-btn-primary dms-btn-full"
            style={{ padding: 14, fontSize: 15, borderRadius: 12, marginTop: 6 }}
          >
            {loading ? (
              <>
                <span style={{
                  width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)',
                  borderTop: '2px solid #fff', borderRadius: '50%',
                  animation: 'spin 1s linear infinite', display: 'inline-block', marginRight: 8
                }} />
                Creating Account...
              </>
            ) : '🚀 Create Account →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 22, fontSize: 13, color: 'var(--text-muted)' }}>
          Already registered?{' '}
          <Link to="/login" style={{ color: 'var(--accent-blue)', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
