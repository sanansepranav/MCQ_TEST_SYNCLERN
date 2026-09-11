import { Link } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import { useTheme } from '../context/ThemeContext';
import {
  HiOutlineShieldCheck,
  HiOutlineClock,
  HiOutlineDocumentText,
  HiOutlineChartBarSquare,
  HiOutlineDevicePhoneMobile,
  HiOutlineArrowUpTray,
} from 'react-icons/hi2';

const features = [
  { icon: HiOutlineShieldCheck, title: 'Anti-Cheat Proctoring', desc: 'Tab switch, window blur, fullscreen exit — triggers instant auto-submit.', color: 'var(--accent-red)' },
  { icon: HiOutlineClock, title: 'Live Countdown Timer', desc: 'Real-time countdown with warnings. Auto-submits when time expires.', color: 'var(--accent-amber)' },
  { icon: HiOutlineDocumentText, title: 'Instant PDF Reports', desc: '3-page PDF: answer comparison, score summary, and violation log.', color: 'var(--accent-blue)' },
  { icon: HiOutlineChartBarSquare, title: 'Admin Analytics', desc: 'Track students, rank results, export bulk PDFs in one click.', color: 'var(--accent-green)' },
  { icon: HiOutlineDevicePhoneMobile, title: 'Mobile Ready', desc: 'Fully responsive. Students can attempt exams from any device.', color: '#8b5cf6' },
  { icon: HiOutlineArrowUpTray, title: 'CSV Question Upload', desc: 'Upload hundreds of questions at once via a simple CSV file.', color: '#f97316' },
];

const steps = [
  { num: '01', title: 'Admin creates the test', desc: 'Upload questions, set the answer key, and schedule the exam window.' },
  { num: '02', title: 'Students attempt securely', desc: 'Login, enter fullscreen, and answer. Any violation triggers auto-submit.' },
  { num: '03', title: 'Instant results and PDF', desc: 'Score is calculated automatically. Download a detailed PDF report.' },
];

const LandingPage = () => {
  const { theme } = useTheme();

  return (
    <div style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', minHeight: '100vh' }}>
      {/* ─── Navbar ─── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'var(--bg-primary)', opacity: 0.95, backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-color)',
        padding: '0 40px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 20, fontWeight: 700 }}>
          Sync<span style={{ color: 'var(--accent-blue)' }}>Test</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }} className="hidden md:flex">
          <a href="#features" style={{ color: 'var(--text-secondary)', fontSize: 14, textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={e => e.target.style.color = 'var(--text-primary)'} onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}>Features</a>
          <a href="#how-it-works" style={{ color: 'var(--text-secondary)', fontSize: 14, textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={e => e.target.style.color = 'var(--text-primary)'} onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}>How it Works</a>
          <a href="#about" style={{ color: 'var(--text-secondary)', fontSize: 14, textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={e => e.target.style.color = 'var(--text-primary)'} onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}>About</a>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ThemeToggle />
          <Link to="/login" style={{
            background: 'transparent',
            color: 'var(--text-primary)',
            border: '1.5px solid var(--border-input)',
            borderRadius: '10px',
            padding: '10px 22px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            textDecoration: 'none'
          }}>Sign In</Link>
          <Link to="/register" className="dms-btn dms-btn-primary dms-btn-sm">Get Started</Link>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section style={{ 
        textAlign: 'center', 
        padding: '100px 24px 80px', 
        background: theme === 'light' ? 'linear-gradient(180deg, #eef2ff 0%, #f0f4ff 100%)' : 'none',
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div className="animate-fade-in" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'var(--accent-blue-bg)', border: '1px solid var(--accent-blue-border)',
            borderRadius: 100, padding: '6px 18px', marginBottom: 32,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-blue)' }} className="animate-pulse-dot" />
            <span style={{ fontSize: 13, color: 'var(--accent-blue)', fontWeight: 500 }}>AI-Powered Examination Platform</span>
          </div>

          <h1 className="animate-fade-in stagger-1" style={{
            fontFamily: "'Sora', sans-serif", fontSize: 'clamp(36px, 5vw, 56px)',
            fontWeight: 800, lineHeight: 1.15, marginBottom: 24,
            color: 'var(--text-primary)'
          }}>
            Conduct Exams.<br />
            <span style={{ color: 'var(--accent-blue)' }}>Securely.</span> Smartly.
          </h1>

          <p className="animate-fade-in stagger-2" style={{
            fontSize: 17, color: 'var(--text-secondary)', lineHeight: 1.7,
            maxWidth: 560, margin: '0 auto 40px',
          }}>
            The complete online test management system for colleges and institutions.
            Anti-cheat proctoring, instant results, and detailed PDF reports.
          </p>

          <div className="animate-fade-in stagger-3" style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
            <Link to="/register" className="dms-btn dms-btn-primary" style={{ padding: '14px 32px', fontSize: 15 }}>
              Start as Student →
            </Link>
            <Link to="/admin/login" style={{
              background: 'transparent',
              color: 'var(--accent-blue)',
              border: '1.5px solid var(--accent-blue)',
              borderRadius: '10px',
              padding: '14px 32px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              textDecoration: 'none'
            }}>
              Admin Portal
            </Link>
          </div>

          {/* Hero Platform Showcase Mockup */}
          <div className="animate-fade-in stagger-4" style={{
            marginTop: 56,
            maxWidth: 880,
            marginLeft: 'auto',
            marginRight: 'auto',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 18,
            boxShadow: theme === 'light' ? '0 20px 60px rgba(79, 142, 247, 0.15)' : '0 25px 70px rgba(0,0,0,0.6)',
            overflow: 'hidden',
            textAlign: 'left'
          }}>
            {/* Window titlebar */}
            <div style={{
              background: theme === 'light' ? '#f1f5f9' : 'rgba(255,255,255,0.03)',
              borderBottom: '1px solid var(--border-color)',
              padding: '12px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 8
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
                <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
                <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginLeft: 8 }}>
                  SyncTest Live Assessment Console
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '4px 10px', borderRadius: 20, fontWeight: 600 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} className="animate-pulse-dot" />
                  AI Proctor Active
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', background: 'var(--bg-hover)', padding: '4px 10px', borderRadius: 6 }}>
                  ⏱️ 00:44:18 Left
                </span>
              </div>
            </div>

            {/* Showcase body */}
            <div style={{ padding: '24px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
              {/* Question panel */}
              <div style={{ background: theme === 'light' ? '#f8faff' : 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-blue)', textTransform: 'uppercase', letterSpacing: 1 }}>Question 12 of 50</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg-surface)', padding: '2px 8px', borderRadius: 4, border: '1px solid var(--border-color)' }}>+2 Marks</span>
                </div>
                <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 14, lineHeight: 1.5 }}>
                  In a Binary Search Tree (BST), what is the worst-case search complexity when unbalanced?
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { key: 'A', text: 'O(1) — Constant time' },
                    { key: 'B', text: 'O(log n) — Logarithmic time' },
                    { key: 'C', text: 'O(n) — Linear time (skewed tree)', selected: true },
                    { key: 'D', text: 'O(n²) — Quadratic time' },
                  ].map((opt) => (
                    <div key={opt.key} style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8,
                      border: opt.selected ? '1.5px solid var(--accent-blue)' : '1px solid var(--border-color)',
                      background: opt.selected ? 'var(--accent-blue-bg)' : 'var(--bg-surface)',
                      color: opt.selected ? 'var(--accent-blue)' : 'var(--text-secondary)',
                      fontSize: 12, fontWeight: opt.selected ? 600 : 400
                    }}>
                      <span style={{ width: 20, height: 20, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', background: opt.selected ? 'var(--accent-blue)' : 'var(--bg-hover)', color: opt.selected ? '#fff' : 'var(--text-secondary)', fontSize: 10, fontWeight: 700 }}>
                        {opt.key}
                      </span>
                      <span>{opt.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Proctor & Palette panel */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Webcam proctor preview */}
                <div style={{ background: '#0a0e17', borderRadius: 12, padding: 10, border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ height: 100, background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    <div style={{ border: '2px dashed #10b981', borderRadius: '50%', width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 24 }}>🎓</span>
                    </div>
                    <span style={{ position: 'absolute', bottom: 6, left: 8, fontSize: 10, color: '#10b981', background: 'rgba(0,0,0,0.7)', padding: '2px 6px', borderRadius: 4 }}>
                      ✓ Verified Candidate
                    </span>
                    <span style={{ position: 'absolute', top: 6, right: 8, fontSize: 10, color: '#38bdf8', background: 'rgba(0,0,0,0.7)', padding: '2px 6px', borderRadius: 4 }}>
                      🛡️ Anti-Cheat Active
                    </span>
                  </div>
                </div>

                {/* Question palette preview */}
                <div style={{ background: theme === 'light' ? '#f8faff' : 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase' }}>
                    Live Question Matrix
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 5 }}>
                    {[1,2,3,4,5,6,7,8,9,10,11,12].map((num) => (
                      <div key={num} style={{
                        height: 24, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600,
                        background: num === 12 ? 'var(--accent-blue)' : (num < 10 ? '#10b981' : (num === 10 ? '#f59e0b' : 'var(--bg-hover)')),
                        color: num === 12 || num < 10 ? '#ffffff' : 'var(--text-secondary)'
                      }}>
                        {num}
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 10, color: 'var(--text-muted)' }}>
                    <span>🟢 Answered (9)</span>
                    <span>🟡 Review (1)</span>
                    <span>⚪ Remaining (40)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section id="features" style={{ padding: '80px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: 2, color: 'var(--accent-blue)', marginBottom: 12, textTransform: 'uppercase' }}>
            WHY SYNCTEST
          </div>
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 32, fontWeight: 700 }}>
            Everything you need for secure exams
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className={`animate-fade-in stagger-${i + 1}`} style={{
                background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
                borderRadius: 16, padding: '28px 24px',
                boxShadow: theme === 'light' ? 'var(--shadow-sm)' : 'none',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: f.color.startsWith('var') ? f.color.replace('var(--accent-', 'var(--accent-').replace(')', '-bg)') : `${f.color}15`, display: 'flex',
                  alignItems: 'center', justifyContent: 'center', marginBottom: 16,
                }}>
                  <Icon style={{ width: 22, height: 22, color: f.color }} />
                </div>
                <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 600, marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section id="how-it-works" style={{ background: 'var(--bg-sidebar)', padding: '80px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: 2, color: 'var(--accent-blue)', marginBottom: 12, textTransform: 'uppercase' }}>
              HOW IT WORKS
            </div>
            <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 32, fontWeight: 700 }}>
              Three simple steps
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {steps.map((s, i) => (
              <div key={i} className={`animate-fade-in stagger-${i + 1}`} style={{
                background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
                borderRadius: 16, padding: '32px 28px', textAlign: 'center',
                boxShadow: theme === 'light' ? 'var(--shadow-sm)' : 'none',
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: '50%',
                  background: 'var(--accent-blue-bg)', color: 'var(--accent-blue)',
                  fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 16,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 20px',
                }}>{s.num}</div>
                <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 17, fontWeight: 600, marginBottom: 10 }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer id="about" style={{
        borderTop: '1px solid var(--border-color)',
        padding: '32px 40px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 16,
      }}>
        <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 16, fontWeight: 700 }}>
          Sync<span style={{ color: 'var(--accent-blue)' }}>Test</span>
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          © 2026 SyncTest. All rights reserved.
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          Built for secure online examinations.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
