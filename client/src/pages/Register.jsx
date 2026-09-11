import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';
import { HiOutlineEye, HiOutlineEyeSlash } from 'react-icons/hi2';
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

  const [fName, setFName] = useState(false);
  const [fRoll, setFRoll] = useState(false);
  const [fEmail, setFEmail] = useState(false);
  const [fPw, setFPw] = useState(false);
  const [fCPw, setFCPw] = useState(false);
  const [fMobile, setFMobile] = useState(false);
  const [fCollege, setFCollege] = useState(false);

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

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');

    // Validate all fields
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
        setSuccess('Registration successful! Redirecting...');
        setTimeout(() => {
          navigate('/student/dashboard');
          window.location.reload(); // To refresh AuthContext state
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', padding: '20px' }}>
      <div style={{
        background: theme === 'light' ? '#ffffff' : 'var(--bg-surface)',
        borderRadius: '20px', padding: '40px', width: '100%', maxWidth: '480px',
        border: theme === 'light' ? '1px solid #e2e8f0' : '1px solid var(--border-color)',
        boxShadow: theme === 'light' ? '0 8px 40px rgba(0,0,0,0.10)' : 'var(--shadow)'
      }}>
        {stage === 1 ? (
          <>
            {/* Logo */}
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <div style={{ width: '56px', height: '56px', background: 'var(--accent-blue)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: '26px' }}>🎓</div>
              <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 6px' }}>Create Account</h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>Join SyncTest</p>
            </div>

            {/* Progress indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
              <div style={{ flex: 1, height: '4px', background: 'var(--accent-blue)', borderRadius: '2px' }} />
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Step 1 of 2</span>
              <div style={{ flex: 1, height: '4px', background: theme === 'light' ? '#e2e8f0' : 'var(--border-color)', borderRadius: '2px' }} />
            </div>

            {error && (
              <div style={{ background: 'var(--accent-red-bg)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', fontSize: '13px', color: 'var(--accent-red)' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSendOTP}>
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Full Name</label>
                <input placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} onFocus={() => setFName(true)} onBlur={() => setFName(false)} style={inputStyle(fName)} />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Roll Number *</label>
                <input placeholder="2024CS001" value={rollNumber} onChange={e => setRollNumber(e.target.value)} onFocus={() => setFRoll(true)} onBlur={() => setFRoll(false)} style={inputStyle(fRoll)} />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Mobile Number *</label>
                <input type="tel" maxLength={10} placeholder="10-digit mobile number" value={mobileNumber} onChange={e => setMobileNumber(e.target.value)} onFocus={() => setFMobile(true)} onBlur={() => setFMobile(false)} style={inputStyle(fMobile)} />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>College Name *</label>
                <input type="text" placeholder="e.g. Government College of Engineering" value={collegeName} onChange={e => setCollegeName(e.target.value)} onFocus={() => setFCollege(true)} onBlur={() => setFCollege(false)} style={inputStyle(fCollege)} />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Branch (Engineering) *</label>
                <select 
                  value={branch} 
                  onChange={e => setBranch(e.target.value)} 
                  style={{ 
                    ...inputStyle(false), 
                    cursor: 'pointer', 
                    color: branch ? (theme === 'light' ? '#0f172a' : '#ffffff') : (theme === 'light' ? '#64748b' : '#94a3b8'),
                    backgroundColor: theme === 'light' ? '#ffffff' : '#1e293b'
                  }}
                >
                  <option value="" style={{ background: theme === 'light' ? '#ffffff' : '#1e293b', color: theme === 'light' ? '#64748b' : '#94a3b8' }}>
                    Select your branch
                  </option>
                  <option value="Computer Engineering" style={{ background: theme === 'light' ? '#ffffff' : '#1e293b', color: theme === 'light' ? '#0f172a' : '#ffffff' }}>
                    Computer Engineering (CE / CSE)
                  </option>
                  <option value="Information Technology" style={{ background: theme === 'light' ? '#ffffff' : '#1e293b', color: theme === 'light' ? '#0f172a' : '#ffffff' }}>
                    Information Technology (IT)
                  </option>
                  <option value="Electronics & Telecommunication Engineering" style={{ background: theme === 'light' ? '#ffffff' : '#1e293b', color: theme === 'light' ? '#0f172a' : '#ffffff' }}>
                    Electronics & Telecommunication Engineering (ENTC / ECE)
                  </option>
                  <option value="Mechanical Engineering" style={{ background: theme === 'light' ? '#ffffff' : '#1e293b', color: theme === 'light' ? '#0f172a' : '#ffffff' }}>
                    Mechanical Engineering (ME)
                  </option>
                  <option value="Civil Engineering" style={{ background: theme === 'light' ? '#ffffff' : '#1e293b', color: theme === 'light' ? '#0f172a' : '#ffffff' }}>
                    Civil Engineering (CE)
                  </option>
                  <option value="Electrical Engineering" style={{ background: theme === 'light' ? '#ffffff' : '#1e293b', color: theme === 'light' ? '#0f172a' : '#ffffff' }}>
                    Electrical Engineering (EE)
                  </option>
                  <option value="Artificial Intelligence & Data Science" style={{ background: theme === 'light' ? '#ffffff' : '#1e293b', color: theme === 'light' ? '#0f172a' : '#ffffff' }}>
                    Artificial Intelligence & Data Science (AI & DS)
                  </option>
                  <option value="Chemical Engineering" style={{ background: theme === 'light' ? '#ffffff' : '#1e293b', color: theme === 'light' ? '#0f172a' : '#ffffff' }}>
                    Chemical Engineering (CH)
                  </option>
                  <option value="Other Engineering Branch" style={{ background: theme === 'light' ? '#ffffff' : '#1e293b', color: theme === 'light' ? '#0f172a' : '#ffffff' }}>
                    Other Engineering Branch
                  </option>
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Email Address</label>
                <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} onFocus={() => setFEmail(true)} onBlur={() => setFEmail(false)} style={inputStyle(fEmail)} />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Password</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type={showPw ? 'text' : 'password'} placeholder="Minimum 8 characters" value={password} onChange={e => setPassword(e.target.value)} onFocus={() => setFPw(true)} onBlur={() => setFPw(false)} style={inputStyle(fPw)} />
                  <button type="button" onClick={() => setShowPw(!showPw)} style={{ background: theme === 'light' ? '#f8faff' : 'var(--bg-hover)', border: theme === 'light' ? '1.5px solid #cbd5e1' : '1px solid var(--border-input)', borderRadius: '10px', width: '48px', flexShrink: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', transition: 'color 0.2s' }}>
                    {showPw ? <HiOutlineEyeSlash size={18} /> : <HiOutlineEye size={18} />}
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Confirm Password</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type={showCPw ? 'text' : 'password'} placeholder="Re-enter password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} onFocus={() => setFCPw(true)} onBlur={() => setFCPw(false)} style={inputStyle(fCPw)} />
                  <button type="button" onClick={() => setShowCPw(!showCPw)} style={{ background: theme === 'light' ? '#f8faff' : 'var(--bg-hover)', border: theme === 'light' ? '1.5px solid #cbd5e1' : '1px solid var(--border-input)', borderRadius: '10px', width: '48px', flexShrink: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', transition: 'color 0.2s' }}>
                    {showCPw ? <HiOutlineEyeSlash size={18} /> : <HiOutlineEye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', background: loading ? 'rgba(37,99,235,0.6)' : 'var(--accent-blue)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600', fontFamily: 'Sora, sans-serif', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                {loading ? (
                  <>
                    <span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 1s linear infinite', display: 'inline-block' }} />
                    Sending OTP to Mobile...
                  </>
                ) : '📱 Send OTP to Mobile Number →'}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--text-muted)' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: 'var(--accent-blue)', textDecoration: 'none', fontWeight: '500' }}>Sign in</Link>
            </p>
          </>
        ) : (
          <>
            {/* Back button */}
            <button onClick={() => { setStage(1); setOtp(''); setError(''); setSuccess(''); }} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '13px', marginBottom: '20px', padding: 0 }}>
              ← Back to form
            </button>

            {/* Progress indicator - step 2 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
              <div style={{ flex: 1, height: '4px', background: 'var(--accent-blue)', borderRadius: '2px' }} />
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Step 2 of 2</span>
              <div style={{ flex: 1, height: '4px', background: 'var(--accent-blue)', borderRadius: '2px' }} />
            </div>

            {/* Mobile / SMS icon */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>📱</div>
              <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 8px' }}>Verify Mobile Number</h2>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.6' }}>
                We sent a 6-digit OTP via SMS to<br/>
                <strong style={{ color: 'var(--accent-blue)', fontSize: '17px', letterSpacing: '0.5px' }}>+91 {mobileNumber}</strong>
                {email && !email.includes('@student.synctest.com') && (
                  <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    (and copy sent to {email})
                  </span>
                )}
              </p>
            </div>

            {success && (
              <div style={{ background: 'var(--accent-green-bg)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', fontSize: '13px', color: 'var(--accent-green)' }}>
                {success}
              </div>
            )}
            {devOtpCode && (
              <div style={{ background: 'rgba(59,130,246,0.12)', border: '1.5px dashed rgba(59,130,246,0.4)', borderRadius: '10px', padding: '12px 14px', marginBottom: '16px', fontSize: '13px', color: 'var(--accent-blue)', textAlign: 'center', fontWeight: '500' }}>
                🔑 SMS OTP Code: <strong style={{ letterSpacing: '3px', fontSize: '16px', marginLeft: '6px' }}>{devOtpCode}</strong> (Auto-filled)
              </div>
            )}
            {error && (
              <div style={{ background: 'var(--accent-red-bg)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', fontSize: '13px', color: 'var(--accent-red)' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleVerifyAndRegister}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-label)', marginBottom: '8px', textAlign: 'center' }}>Enter 6-Digit OTP</label>
                <input type="text" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="• • • • • •" maxLength={6} style={{ width: '100%', padding: '16px', background: 'var(--bg-input)', border: '2px solid var(--border-input)', borderRadius: '12px', color: 'var(--text-primary)', fontSize: '24px', fontWeight: '700', letterSpacing: '12px', textAlign: 'center', outline: 'none', boxSizing: 'border-box', fontFamily: 'Sora, monospace' }} autoFocus />
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px', textAlign: 'center' }}>OTP valid for 10 minutes</p>
              </div>

              <button type="submit" disabled={loading || otp.length !== 6} style={{ width: '100%', padding: '14px', background: (loading || otp.length !== 6) ? 'rgba(37,99,235,0.5)' : 'var(--accent-blue)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600', fontFamily: 'Sora, sans-serif', cursor: (loading || otp.length !== 6) ? 'not-allowed' : 'pointer', marginBottom: '16px' }}>
                {loading ? 'Verifying...' : 'Verify & Complete Registration ✓'}
              </button>
            </form>

            <div style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
              Didn't receive OTP?{' '}
              {resendTimer > 0 ? (
                <span style={{ color: 'var(--text-muted)' }}>Resend in {resendTimer}s</span>
              ) : (
                <button onClick={handleResendOTP} disabled={loading} style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', cursor: 'pointer', fontSize: '13px', fontWeight: '600', padding: 0 }}>Resend OTP</button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Register;
