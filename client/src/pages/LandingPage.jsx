import { useState } from 'react';
import { Link } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import { useTheme } from '../context/ThemeContext';
import {
  HiOutlineShieldCheck,
  HiOutlineClock,
  HiOutlineDocumentText,
  HiOutlineChartBarSquare,
  HiOutlineDevicePhoneMobile,
  HiOutlineCodeBracket,
  HiOutlineCheckCircle,
} from 'react-icons/hi2';

const features = [
  { 
    icon: HiOutlineShieldCheck, 
    tag: 'Anti-Cheat AI',
    title: 'Smart Proctoring System', 
    desc: 'Automated tab-switch detection, fullscreen exit monitoring, and window blur alerts that trigger immediate auto-submit.', 
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(99,102,241,0.05) 100%)'
  },
  { 
    icon: HiOutlineCodeBracket, 
    tag: 'Multi-Language',
    title: 'Integrated Coding IDE', 
    desc: 'Real-time code editor supporting Python, C++, Java, and JavaScript with automated test case evaluation via Piston engine.', 
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(217,70,239,0.05) 100%)'
  },
  { 
    icon: HiOutlineClock, 
    tag: 'Precision',
    title: 'Live Synchronized Timer', 
    desc: 'Server-synchronized countdown with auto-warnings at 5 & 1 minute marks to ensure zero test time manipulation.', 
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(234,179,8,0.05) 100%)'
  },
  { 
    icon: HiOutlineDocumentText, 
    tag: 'Reporting',
    title: 'Certified PDF Scorecards', 
    desc: 'Instant 3-page comprehensive report card containing answer keys, candidate comparison, and proctoring audit log.', 
    color: '#10b981',
    gradient: 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(5,150,105,0.05) 100%)'
  },
  { 
    icon: HiOutlineChartBarSquare, 
    tag: 'Analytics',
    title: 'Institutional Dashboard', 
    desc: 'Deep-dive test analytics, class percentile distribution, branch-wise score filters, and one-click bulk exports.', 
    color: '#06b6d4',
    gradient: 'linear-gradient(135deg, rgba(6,182,212,0.15) 0%, rgba(14,165,233,0.05) 100%)'
  },
  { 
    icon: HiOutlineDevicePhoneMobile, 
    tag: 'Accessibility',
    title: 'Mobile OTP & Multi-Device', 
    desc: 'Seamless SMS OTP onboarding for mobile phones, clean responsive layouts for phones, tablets, and desktops.', 
    color: '#ec4899',
    gradient: 'linear-gradient(135deg, rgba(236,72,153,0.15) 0%, rgba(244,63,94,0.05) 100%)'
  },
];

const steps = [
  { 
    num: '01', 
    title: 'Create & Schedule Test', 
    desc: 'Upload questions via CSV or manual entry, set coding problems, define scoring rules, and schedule the exam window.' 
  },
  { 
    num: '02', 
    title: 'Secure Student Attempt', 
    desc: 'Students sign in via verified Mobile SMS OTP, lock into fullscreen proctored mode, and solve MCQs and coding tasks.' 
  },
  { 
    num: '03', 
    title: 'Instant Evaluation & Ranking', 
    desc: 'Scores and rank lists compute instantly. Students download verified certificates and comprehensive PDF breakdowns.' 
  },
];

const LandingPage = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('mcq');

  return (
    <div style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', minHeight: '100vh', position: 'relative', overflowX: 'hidden' }}>
      {/* Ambient background glow */}
      <div className="mesh-glow-bg" />

      {/* ─── Modern Top Navigation ─── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: theme === 'light' ? 'rgba(255,255,255,0.85)' : 'rgba(8,12,20,0.80)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-color)',
        padding: '0 32px', height: 68,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        transition: 'all 0.2s'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 20, boxShadow: '0 4px 14px rgba(59,130,246,0.35)'
          }}>
            ⚡
          </div>
          <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 21, fontWeight: 800, letterSpacing: '-0.5px' }}>
            Sync<span className="gradient-text">Test</span>
          </div>
          <span style={{
            fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
            background: 'rgba(59,130,246,0.1)', color: 'var(--accent-blue)',
            border: '1px solid rgba(59,130,246,0.2)', marginLeft: 4
          }}>
            v2.4
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }} className="hidden md:flex">
          <a href="#features" style={{ color: 'var(--text-secondary)', fontSize: 14, fontWeight: 500, textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={e => e.target.style.color = 'var(--accent-blue)'} onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}>
            Features
          </a>
          <a href="#demo" style={{ color: 'var(--text-secondary)', fontSize: 14, fontWeight: 500, textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={e => e.target.style.color = 'var(--accent-blue)'} onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}>
            Interactive Console
          </a>
          <a href="#how-it-works" style={{ color: 'var(--text-secondary)', fontSize: 14, fontWeight: 500, textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={e => e.target.style.color = 'var(--accent-blue)'} onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}>
            How It Works
          </a>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <ThemeToggle />
          <Link to="/login" style={{
            background: 'transparent',
            color: 'var(--text-primary)',
            border: theme === 'light' ? '1.5px solid #cbd5e1' : '1px solid var(--border-input)',
            borderRadius: '10px',
            padding: '9px 20px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            textDecoration: 'none',
            transition: 'all 0.2s'
          }}>
            Sign In
          </Link>
          <Link to="/register" className="dms-btn dms-btn-primary dms-btn-sm" style={{ padding: '9px 20px' }}>
            Get Started Free →
          </Link>
        </div>
      </nav>

      {/* ─── Hero Section ─── */}
      <section style={{ 
        textAlign: 'center', 
        padding: '90px 24px 60px', 
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ maxWidth: 840, margin: '0 auto' }}>
          {/* Tag Pill */}
          <div className="animate-fade-in" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: theme === 'light' ? 'rgba(59,130,246,0.08)' : 'rgba(59,130,246,0.12)',
            border: '1px solid rgba(59,130,246,0.25)',
            borderRadius: 100, padding: '7px 20px', marginBottom: 28,
            boxShadow: '0 2px 10px rgba(59,130,246,0.1)'
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6' }} className="animate-pulse-dot" />
            <span style={{ fontSize: 13, color: 'var(--accent-blue)', fontWeight: 600, letterSpacing: '0.2px' }}>
              ✨ AI-Powered Intelligent Examination Platform
            </span>
          </div>

          {/* Main Title */}
          <h1 className="animate-fade-in stagger-1" style={{
            fontFamily: "'Sora', sans-serif", fontSize: 'clamp(38px, 5.5vw, 62px)',
            fontWeight: 800, lineHeight: 1.12, marginBottom: 22,
            letterSpacing: '-1.5px', color: 'var(--text-primary)'
          }}>
            Conduct Exams with Precision.<br />
            <span className="gradient-text">100% Anti-Cheat Integrity.</span>
          </h1>

          {/* Subtitle */}
          <p className="animate-fade-in stagger-2" style={{
            fontSize: 'clamp(16px, 2vw, 18px)', color: 'var(--text-secondary)', lineHeight: 1.7,
            maxWidth: 620, margin: '0 auto 36px', fontWeight: 400
          }}>
            The modern test management ecosystem for universities, colleges, and schools. 
            Automated proctoring, live code compilation, instant score computation, and certified PDF downloads.
          </p>

          {/* Trust Highlights Checklist */}
          <div className="animate-fade-in stagger-2" style={{ 
            display: 'flex', justifyContent: 'center', gap: 20, flexWrap: 'wrap', 
            marginBottom: 36, fontSize: 13, color: 'var(--text-secondary)' 
          }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <HiOutlineCheckCircle style={{ color: '#10b981', fontSize: 17 }} /> Instant Mobile SMS OTP
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <HiOutlineCheckCircle style={{ color: '#10b981', fontSize: 17 }} /> Piston Multi-language Compiler
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <HiOutlineCheckCircle style={{ color: '#10b981', fontSize: 17 }} /> Zero Exam Tampering
            </span>
          </div>

          {/* Action CTAs */}
          <div className="animate-fade-in stagger-3" style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
            <Link to="/register" className="dms-btn dms-btn-primary" style={{ padding: '15px 36px', fontSize: 16, borderRadius: 14 }}>
              Student Registration →
            </Link>
            <Link to="/admin/login" style={{
              background: theme === 'light' ? '#ffffff' : 'rgba(255,255,255,0.04)',
              color: 'var(--accent-blue)',
              border: '1.5px solid var(--accent-blue)',
              borderRadius: '14px',
              padding: '15px 34px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              textDecoration: 'none',
              transition: 'all 0.2s',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8
            }}>
              Admin Assessment Portal
            </Link>
          </div>

          {/* ─── Interactive Assessment Simulator Preview ─── */}
          <div id="demo" className="animate-fade-in stagger-4 glass-card" style={{
            marginTop: 64,
            maxWidth: 900,
            marginLeft: 'auto',
            marginRight: 'auto',
            overflow: 'hidden',
            textAlign: 'left',
            boxShadow: theme === 'light' ? '0 25px 60px -15px rgba(59, 130, 246, 0.15)' : '0 30px 70px -15px rgba(0,0,0,0.7)',
          }}>
            {/* Window titlebar & Tab Switcher */}
            <div style={{
              background: theme === 'light' ? '#f8fafc' : 'rgba(255,255,255,0.03)',
              borderBottom: '1px solid var(--border-color)',
              padding: '12px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12
            }}>
              {/* Traffic light dots */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
                <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
                <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginLeft: 8 }}>
                  SyncTest Live Simulator
                </span>
              </div>

              {/* Mode Switcher Tabs */}
              <div style={{ display: 'flex', background: theme === 'light' ? '#e2e8f0' : 'rgba(255,255,255,0.06)', borderRadius: 8, padding: 3 }}>
                {[
                  { id: 'mcq', label: '📝 MCQ Mode' },
                  { id: 'code', label: '💻 Code IDE' },
                  { id: 'analytics', label: '📊 PDF Result' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    style={{
                      border: 'none',
                      background: activeTab === t.id ? (theme === 'light' ? '#ffffff' : 'var(--accent-blue)') : 'transparent',
                      color: activeTab === t.id ? (theme === 'light' ? '#0f172a' : '#ffffff') : 'var(--text-secondary)',
                      padding: '5px 12px',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: activeTab === t.id ? '0 2px 6px rgba(0,0,0,0.1)' : 'none'
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Live badges */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '4px 10px', borderRadius: 20, fontWeight: 600 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} className="animate-pulse-dot" />
                  AI Proctor Active
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', background: 'var(--bg-hover)', padding: '4px 10px', borderRadius: 6, fontWeight: 500 }}>
                  ⏱️ 00:44:18
                </span>
              </div>
            </div>

            {/* Tab 1: MCQ Assessment Preview */}
            {activeTab === 'mcq' && (
              <div style={{ padding: '24px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: 20 }}>
                {/* Question panel */}
                <div style={{ background: theme === 'light' ? '#f8faff' : 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: 14, padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-blue)', textTransform: 'uppercase', letterSpacing: 1 }}>Question 12 of 50</span>
                    <span style={{ fontSize: 11, color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>+2 Marks</span>
                  </div>
                  <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 14, lineHeight: 1.5 }}>
                    In a Binary Search Tree (BST), what is the worst-case search complexity when the tree is unbalanced?
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { key: 'A', text: 'O(1) — Constant time lookup' },
                      { key: 'B', text: 'O(log n) — Logarithmic search' },
                      { key: 'C', text: 'O(n) — Linear time (skewed branch)', selected: true },
                      { key: 'D', text: 'O(n²) — Quadratic depth' },
                    ].map((opt) => (
                      <div key={opt.key} style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8,
                        border: opt.selected ? '1.5px solid var(--accent-blue)' : '1px solid var(--border-color)',
                        background: opt.selected ? 'var(--accent-blue-bg)' : 'var(--bg-surface)',
                        color: opt.selected ? 'var(--accent-blue)' : 'var(--text-secondary)',
                        fontSize: 12, fontWeight: opt.selected ? 600 : 400,
                        transition: 'all 0.15s'
                      }}>
                        <span style={{ width: 22, height: 22, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', background: opt.selected ? 'var(--accent-blue)' : 'var(--bg-hover)', color: opt.selected ? '#fff' : 'var(--text-secondary)', fontSize: 11, fontWeight: 700 }}>
                          {opt.key}
                        </span>
                        <span>{opt.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Proctor & Live Matrix */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {/* Proctor Candidate Feed */}
                  <div style={{ background: '#0a0e17', borderRadius: 12, padding: 12, border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ height: 105, background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                      <div style={{ border: '2px dashed #10b981', borderRadius: '50%', width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: 26 }}>👨‍🎓</span>
                      </div>
                      <span style={{ position: 'absolute', bottom: 6, left: 8, fontSize: 10, color: '#10b981', background: 'rgba(0,0,0,0.8)', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>
                        ✓ Candidate Present
                      </span>
                      <span style={{ position: 'absolute', top: 6, right: 8, fontSize: 10, color: '#38bdf8', background: 'rgba(0,0,0,0.8)', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>
                        🛡️ Fullscreen Locked
                      </span>
                    </div>
                  </div>

                  {/* Question Matrix */}
                  <div style={{ background: theme === 'light' ? '#f8faff' : 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase' }}>
                      Live Question Palette
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6 }}>
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 10, color: 'var(--text-muted)' }}>
                      <span>🟢 Answered (9)</span>
                      <span>🟡 Marked (1)</span>
                      <span>⚪ Remaining (40)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Live Code IDE Simulator */}
            {activeTab === 'code' && (
              <div style={{ padding: '20px 24px', background: '#0b0f19', color: '#f1f5f9', fontFamily: 'monospace' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ color: '#38bdf8', fontSize: 13, fontWeight: 600 }}>Problem: Two Sum (LeetCode #1)</span>
                    <span style={{ fontSize: 11, background: 'rgba(59,130,246,0.2)', color: '#60a5fa', padding: '2px 8px', borderRadius: 4 }}>Python 3.10</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <span style={{ fontSize: 11, background: 'rgba(16,185,129,0.2)', color: '#34d399', padding: '4px 10px', borderRadius: 6, fontWeight: 600 }}>
                      ✓ 3/3 Test Cases Passed
                    </span>
                  </div>
                </div>
                {/* Code Window */}
                <div style={{ background: '#070a12', borderRadius: 10, padding: '16px', border: '1px solid rgba(255,255,255,0.08)', fontSize: 13, lineHeight: '1.6' }}>
                  <span style={{ color: '#ec4899' }}>def</span> <span style={{ color: '#60a5fa' }}>two_sum</span>(nums: list[int], target: int) -&gt; list[int]:<br/>
                  &nbsp;&nbsp;&nbsp;&nbsp;seen = &#123;&#125;<br/>
                  &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#ec4899' }}>for</span> i, n <span style={{ color: '#ec4899' }}>in</span> enumerate(nums):<br/>
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;diff = target - n<br/>
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#ec4899' }}>if</span> diff <span style={{ color: '#ec4899' }}>in</span> seen:<br/>
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#ec4899' }}>return</span> [seen[diff], i]<br/>
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;seen[n] = i<br/>
                  &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#ec4899' }}>return</span> []
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, fontSize: 12, color: '#94a3b8' }}>
                  <span>Memory: 14.8 MB • Runtime: 42ms (Faster than 96.4%)</span>
                  <span style={{ color: '#34d399', fontWeight: 600 }}>Execution Engine: Piston Sandbox v2</span>
                </div>
              </div>
            )}

            {/* Tab 3: Detailed PDF Results Report */}
            {activeTab === 'analytics' && (
              <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
                <div style={{ background: theme === 'light' ? '#f8faff' : 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: 14, padding: 20, textAlign: 'center' }}>
                  <div style={{ width: 70, height: 70, borderRadius: '50%', background: 'rgba(16,185,129,0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: 24, fontWeight: 800 }}>
                    94%
                  </div>
                  <h4 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 4px' }}>Examination Cleared!</h4>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 16px' }}>Rank 2 / 120 Candidates (Branch: Computer Engineering)</p>
                  <span style={{ fontSize: 12, color: 'var(--accent-blue)', background: 'var(--accent-blue-bg)', padding: '6px 14px', borderRadius: 8, fontWeight: 600, display: 'inline-block' }}>
                    📄 Download Official PDF Report
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, justifyContent: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-hover)', borderRadius: 8, fontSize: 13 }}>
                    <span>Accuracy Rate:</span>
                    <strong style={{ color: '#10b981' }}>96.2%</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-hover)', borderRadius: 8, fontSize: 13 }}>
                    <span>Time Spent:</span>
                    <strong>28 mins / 60 mins</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-hover)', borderRadius: 8, fontSize: 13 }}>
                    <span>Proctoring Audit:</span>
                    <strong style={{ color: '#10b981' }}>0 Violations (Clean)</strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── Features Grid ─── */}
      <section id="features" style={{ padding: '90px 24px', maxWidth: 1160, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, color: 'var(--accent-blue)', marginBottom: 10, textTransform: 'uppercase' }}>
            KEY CAPABILITIES
          </div>
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, letterSpacing: '-1px' }}>
            Built for Academic Integrity & Scale
          </h2>
          <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 540, margin: '12px auto 0', lineHeight: 1.6 }}>
            Every tool required to administer tests, eliminate cheating, and generate deep student progress reports.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div 
                key={i} 
                className={`animate-fade-in stagger-${(i % 3) + 1} glass-card glass-card-hover`} 
                style={{
                  padding: '30px 26px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: 14,
                      background: f.gradient,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: `0 4px 15px ${f.color}25`
                    }}>
                      <Icon style={{ width: 24, height: 24, color: f.color }} />
                    </div>
                    <span style={{
                      fontSize: 11, fontWeight: 700, color: f.color,
                      background: `${f.color}15`, padding: '4px 10px', borderRadius: 20
                    }}>
                      {f.tag}
                    </span>
                  </div>
                  <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 17, fontWeight: 700, marginBottom: 10, color: 'var(--text-primary)' }}>
                    {f.title}
                  </h3>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0 }}>
                    {f.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section id="how-it-works" style={{ 
        background: theme === 'light' ? '#f8fafc' : 'rgba(255,255,255,0.02)', 
        borderTop: '1px solid var(--border-color)',
        borderBottom: '1px solid var(--border-color)',
        padding: '90px 24px',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, color: 'var(--accent-blue)', marginBottom: 10, textTransform: 'uppercase' }}>
              HOW IT WORKS
            </div>
            <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, letterSpacing: '-1px' }}>
              Three Effortless Steps
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 28 }}>
            {steps.map((s, i) => (
              <div 
                key={i} 
                className={`animate-fade-in stagger-${i + 1} glass-card`} 
                style={{
                  padding: '36px 28px', 
                  textAlign: 'center',
                  position: 'relative'
                }}
              >
                <div style={{
                  width: 52, height: 52, borderRadius: 16,
                  background: 'linear-gradient(135deg, rgba(59,130,246,0.2) 0%, rgba(99,102,241,0.2) 100%)',
                  color: 'var(--accent-blue)',
                  fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 18,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 22px',
                  border: '1.5px solid rgba(59,130,246,0.3)',
                  boxShadow: '0 4px 14px rgba(59,130,246,0.15)'
                }}>
                  {s.num}
                </div>
                <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 700, marginBottom: 12 }}>
                  {s.title}
                </h3>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0 }}>
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Bottom CTA Banner ─── */}
      <section style={{ padding: '90px 24px', maxWidth: 1000, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(139,92,246,0.12) 100%)',
          border: '1px solid rgba(59,130,246,0.3)',
          borderRadius: 24, padding: '56px 36px',
          boxShadow: '0 20px 50px -10px rgba(59,130,246,0.2)'
        }}>
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 'clamp(26px, 3.5vw, 36px)', fontWeight: 800, marginBottom: 16 }}>
            Ready to Run Secure Online Tests?
          </h2>
          <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 520, margin: '0 auto 32px', lineHeight: 1.6 }}>
            Empower your university, coaching center, or college with modern examination infrastructure.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
            <Link to="/register" className="dms-btn dms-btn-primary" style={{ padding: '15px 36px', fontSize: 15, borderRadius: 12 }}>
              Get Started Now →
            </Link>
            <Link to="/login" style={{
              background: theme === 'light' ? '#ffffff' : 'rgba(255,255,255,0.06)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: 12, padding: '15px 30px',
              fontSize: 15, fontWeight: 600, textDecoration: 'none'
            }}>
              Sign In to Account
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Modern Footer ─── */}
      <footer id="about" style={{
        borderTop: '1px solid var(--border-color)',
        padding: '36px 40px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 16,
        background: theme === 'light' ? '#ffffff' : 'var(--bg-surface)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14 }}>
            ⚡
          </div>
          <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 17, fontWeight: 800 }}>
            Sync<span className="gradient-text">Test</span>
          </div>
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          © 2026 SyncTest Platform. All rights reserved.
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          Engineered for high-stakes online examinations.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
