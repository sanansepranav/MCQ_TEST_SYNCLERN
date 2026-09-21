import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { HiOutlineEye, HiOutlineEyeSlash, HiOutlineArrowLeft } from 'react-icons/hi2';
import api from '../services/api';

const Register = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [stage, setStage] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [branch, setBranch] = useState('');
  const [otp, setOtp] = useState('');
  const [devOtpCode, setDevOtpCode] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

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

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Full name is required');
      return;
    }
    const cleanMobile = mobileNumber.replace(/\D/g, '').slice(-10);
    if (!cleanMobile || cleanMobile.length !== 10) {
      setError('Valid 10-digit mobile number is required to receive OTP');
      return;
    }
    if (!rollNumber.trim()) {
      setError('Roll number is required');
      return;
    }
    if (!collegeName.trim()) {
      setError('College name is required');
      return;
    }
    if (!branch) {
      setError('Please select your branch');
      return;
    }
    if (email.trim() && !/\S+@\S+\.\S+/.test(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const studentEmail = email.trim() || `${cleanMobile}@student.synctest.com`;

    setLoading(true);
    try {
      const res = await api.post('/auth/send-otp', {
        mobileNumber: cleanMobile,
        email: studentEmail,
        name: name.trim()
      });

      if (res.data.success) {
        setStage(2);
        if (res.data.devOtp) {
          setDevOtpCode(res.data.devOtp);
          setOtp(res.data.devOtp);
        }
        setSuccess(res.data.message || `OTP sent to mobile number +91 ${cleanMobile}`);
        setResendTimer(60);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    setError('');
    setOtp('');
    setLoading(true);
    try {
      const cleanMobile = mobileNumber.replace(/\D/g, '').slice(-10);
      const studentEmail = email.trim() || `${cleanMobile}@student.synctest.com`;
      const res = await api.post('/auth/send-otp', {
        mobileNumber: cleanMobile,
        email: studentEmail,
        name: name.trim()
      });
      if (res.data.devOtp) {
        setDevOtpCode(res.data.devOtp);
        setOtp(res.data.devOtp);
      }
      setSuccess(res.data.message || `New OTP sent to mobile number +91 ${cleanMobile}`);
      setResendTimer(60);
    } catch (err) {
      setError('Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!otp || otp.length !== 6) {
      setError('Please enter the 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const cleanMobile = mobileNumber.replace(/\D/g, '').slice(-10);
      const studentEmail = email.trim() || `${cleanMobile}@student.synctest.com`;
      const res = await api.post('/auth/register', {
        name: name.trim(),
        email: studentEmail,
        password,
        rollNumber: rollNumber.trim(),
        mobileNumber: cleanMobile,
        collegeName: collegeName.trim(),
        branch,
        otp: otp.trim()
      });

      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        setSuccess('Account created successfully! Redirecting...');
        setTimeout(() => {
          navigate('/student/dashboard');
          window.location.reload();
        }, 1200);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
        maxWidth: stage === 1 ? 580 : 460,
        position: 'relative',
        zIndex: 1,
        boxShadow: theme === 'light'
          ? '0 20px 50px -10px rgba(59, 130, 246, 0.14)'
          : '0 25px 60px -15px rgba(0,0,0,0.7)',
        transition: 'max-width 0.3s ease'
      }}>
        {stage === 1 ? (
          <>
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
                Get instant access to tests & live assessments on <strong style={{ color: 'var(--accent-blue)' }}>SyncTest</strong>
              </p>
            </div>

            {/* Stepper Pill Indicator */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: theme === 'light' ? 'rgba(59,130,246,0.06)' : 'rgba(255,255,255,0.03)',
              padding: '8px 14px', borderRadius: 9999, marginBottom: 24,
              border: theme === 'light' ? '1px solid rgba(59,130,246,0.15)' : '1px solid rgba(255,255,255,0.08)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
                <span style={{
                  width: 20, height: 20, borderRadius: '50%', background: 'var(--accent-blue)',
                  color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>1</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent-blue)' }}>Details</span>
              </div>
              <div style={{ width: 32, height: 2, background: theme === 'light' ? '#cbd5e1' : 'rgba(255,255,255,0.1)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
                <span style={{
                  width: 20, height: 20, borderRadius: '50%',
                  background: theme === 'light' ? '#e2e8f0' : 'rgba(255,255,255,0.1)',
                  color: 'var(--text-muted)', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>2</span>
                <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)' }}>SMS OTP</span>
              </div>
            </div>

            {error && (
              <div style={{
                background: 'var(--accent-red-bg)', border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: 12, padding: '12px 16px', marginBottom: 18, fontSize: 13, color: 'var(--accent-red)'
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSendOTP}>
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
                  <label style={labelStyle}>Mobile (SMS OTP) *</label>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="10-digit number"
                    value={mobileNumber}
                    onChange={e => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    onFocus={() => setFocusedField('mobile')}
                    onBlur={() => setFocusedField('')}
                    style={inputStyle(focusedField === 'mobile')}
                    required
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
                    <option value="">Select Branch</option>
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
                      placeholder="Min 8 chars"
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
                style={{ padding: 14, fontSize: 15, borderRadius: 12, marginTop: 4 }}
              >
                {loading ? (
                  <>
                    <span style={{
                      width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)',
                      borderTop: '2px solid #fff', borderRadius: '50%',
                      animation: 'spin 1s linear infinite', display: 'inline-block', marginRight: 8
                    }} />
                    Sending OTP to Mobile...
                  </>
                ) : '📱 Send OTP to Mobile Number →'}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: 22, fontSize: 13, color: 'var(--text-muted)' }}>
              Already registered?{' '}
              <Link to="/login" style={{ color: 'var(--accent-blue)', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
            </p>
          </>
        ) : (
          <>
            {/* Step 2: OTP Verification */}
            <button
              onClick={() => { setStage(1); setOtp(''); setError(''); setSuccess(''); }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none',
                border: 'none', color: 'var(--text-secondary)', cursor: 'pointer',
                fontSize: 13, marginBottom: 18, padding: 0
              }}
            >
              <HiOutlineArrowLeft size={16} /> Back to Details
            </button>

            {/* Stepper Pill */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: theme === 'light' ? 'rgba(59,130,246,0.06)' : 'rgba(255,255,255,0.03)',
              padding: '8px 14px', borderRadius: 9999, marginBottom: 24,
              border: theme === 'light' ? '1px solid rgba(59,130,246,0.15)' : '1px solid rgba(255,255,255,0.08)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
                <span style={{
                  width: 20, height: 20, borderRadius: '50%', background: 'var(--accent-green)',
                  color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>✓</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent-green)' }}>Details</span>
              </div>
              <div style={{ width: 32, height: 2, background: 'var(--accent-blue)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
                <span style={{
                  width: 20, height: 20, borderRadius: '50%', background: 'var(--accent-blue)',
                  color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>2</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent-blue)' }}>SMS OTP</span>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{
                width: 60, height: 60, borderRadius: '50%',
                background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px', fontSize: 28
              }}>📱</div>
              <h2 style={{
                fontFamily: "'Sora', sans-serif", fontSize: 22, fontWeight: 800,
                color: 'var(--text-primary)', margin: '0 0 8px'
              }}>
                Verify Mobile Number
              </h2>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
                Enter the 6-digit verification code sent to<br />
                <strong style={{ color: 'var(--accent-blue)', fontSize: 17, letterSpacing: 0.5 }}>+91 {mobileNumber}</strong>
              </p>
            </div>

            {success && (
              <div style={{
                background: 'var(--accent-green-bg)', border: '1px solid rgba(16,185,129,0.25)',
                borderRadius: 12, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: 'var(--accent-green)', textAlign: 'center'
              }}>
                {success}
              </div>
            )}

            {devOtpCode && (
              <div style={{
                background: 'rgba(59,130,246,0.1)', border: '1.5px dashed rgba(59,130,246,0.35)',
                borderRadius: 12, padding: '12px 14px', marginBottom: 18, fontSize: 13,
                color: 'var(--accent-blue)', textAlign: 'center', fontWeight: 500
              }}>
                ⚡ Instant SMS Code: <strong style={{ letterSpacing: 4, fontSize: 18, marginLeft: 6 }}>{devOtpCode}</strong>
              </div>
            )}

            {error && (
              <div style={{
                background: 'var(--accent-red-bg)', border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: 12, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: 'var(--accent-red)', textAlign: 'center'
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleVerifyAndRegister}>
              <div style={{ marginBottom: 22 }}>
                <label style={{
                  display: 'block', fontSize: 12, fontWeight: 600,
                  color: 'var(--text-label)', marginBottom: 8, textAlign: 'center', textTransform: 'uppercase', letterSpacing: 1
                }}>
                  6-Digit Verification Code
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="• • • • • •"
                  maxLength={6}
                  style={{
                    width: '100%', padding: '14px',
                    background: theme === 'light' ? '#f8faff' : 'rgba(255,255,255,0.05)',
                    border: '2px solid var(--accent-blue)',
                    borderRadius: 14,
                    color: 'var(--text-primary)',
                    fontSize: 26, fontWeight: 800,
                    letterSpacing: 10, textAlign: 'center',
                    outline: 'none', boxSizing: 'border-box',
                    fontFamily: "'Sora', monospace",
                    boxShadow: '0 0 0 4px rgba(59,130,246,0.15)'
                  }}
                  autoFocus
                />
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8, textAlign: 'center' }}>
                  OTP is valid for 10 minutes
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="dms-btn dms-btn-primary dms-btn-full"
                style={{
                  padding: 14, fontSize: 15, borderRadius: 12,
                  opacity: (loading || otp.length !== 6) ? 0.6 : 1
                }}
              >
                {loading ? 'Verifying & Creating Account...' : 'Verify & Complete Registration ✓'}
              </button>
            </form>

            <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', marginTop: 20 }}>
              Didn't receive code?{' '}
              {resendTimer > 0 ? (
                <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Resend in {resendTimer}s</span>
              ) : (
                <button
                  onClick={handleResendOTP}
                  disabled={loading}
                  style={{
                    background: 'none', border: 'none', color: 'var(--accent-blue)',
                    cursor: 'pointer', fontSize: 13, fontWeight: 700, padding: 0
                  }}
                >
                  Resend OTP
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Register;
