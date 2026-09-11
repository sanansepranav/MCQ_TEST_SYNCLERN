import {
  HiOutlineTrophy,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineMinusCircle,
  HiOutlineClock,
  HiOutlineExclamationTriangle,
  HiOutlineShieldExclamation,
} from 'react-icons/hi2';

/**
 * Reusable Result Summary component.
 * @param {{ result: object, showViolationBanner?: boolean }} props
 */
const ResultSummary = ({ result, showViolationBanner = true }) => {
  if (!result) return null;

  const percentage = result.percentage ?? 0;
  const passingPct = result.testId?.passingPercentage ?? 40;
  const passed = percentage >= passingPct;

  const correct = 
    result?.correctAnswers ?? 
    result?.correct ?? 
    result?.correctCount ?? 0;

  const incorrect = 
    result?.incorrectAnswers ?? 
    result?.incorrect ?? 
    result?.incorrectCount ?? 0;

  const unattempted = 
    result?.unattempted ?? 
    result?.unattemptedCount ?? 0;

  const formatTime = (sec) => {
    if (!sec) return '0m 0s';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  };

  // ─── Donut chart via CSS conic-gradient ───
  const donutStyle = {
    background: `conic-gradient(
      ${passed ? '#10b981' : '#ef4444'} 0% ${percentage}%,
      var(--bg-hover) ${percentage}% 100%
    )`,
  };

  const stats = [
    { label: 'Correct', value: correct, icon: HiOutlineCheckCircle, color: 'var(--accent-green)', bg: 'var(--accent-green-bg)' },
    { label: 'Incorrect', value: incorrect, icon: HiOutlineXCircle, color: 'var(--accent-red)', bg: 'var(--accent-red-bg)' },
    { label: 'Unattempted', value: unattempted, icon: HiOutlineMinusCircle, color: 'var(--accent-amber)', bg: 'var(--accent-amber-bg)' },
    { label: 'Time Taken', value: formatTime(result.timeTaken), icon: HiOutlineClock, color: 'var(--accent-blue)', bg: 'var(--accent-blue-bg)' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Main result card */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: '28px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '24px' }}>
          {/* Donut */}
          <div style={{ position: 'relative', width: '112px', height: '112px', flexShrink: 0 }}>
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', ...donutStyle }} />
            <div style={{ position: 'absolute', inset: '8px', background: 'var(--bg-surface)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '24px', fontWeight: '700', color: passed ? 'var(--accent-green)' : 'var(--accent-red)', fontFamily: "'Sora', sans-serif" }}>
                  {percentage}%
                </p>
                <p style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {passed ? 'Passed' : 'Failed'}
                </p>
              </div>
            </div>
          </div>

          {/* Score Info */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <HiOutlineTrophy size={24} color={passed ? 'var(--accent-green)' : 'var(--accent-red)'} />
              <p style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)', fontFamily: "'Sora', sans-serif" }}>
                {result.score}/{result.totalMarks}
              </p>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {result.testId?.title || 'Test'} · Attempt #{result.attemptNumber || 1}
            </p>

            {/* Pass/Fail Badge */}
            <span style={{
              display: 'inline-block', marginTop: '8px', padding: '4px 16px', borderRadius: '9999px',
              fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em',
              background: passed ? 'var(--accent-green-bg)' : 'var(--accent-red-bg)',
              color: passed ? 'var(--accent-green)' : 'var(--accent-red)'
            }}>
              {passed ? '✓ Passed' : '✗ Failed'}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="stat-card" style={{
              background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px', textAlign: 'center', boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ width: '36px', height: '36px', background: s.bg, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                <Icon size={20} color={s.color} />
              </div>
              <p style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', fontFamily: "'Sora', sans-serif" }}>{s.value}</p>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' }}>{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Auto-submitted warning */}
      {showViolationBanner && result.autoSubmitted && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 20px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', marginBottom: '16px' }}>
          <HiOutlineExclamationTriangle size={18} color="#ef4444" />
          <div>
            <p style={{ fontSize: '14px', fontWeight: '600', color: '#ef4444', marginBottom: '2px' }}>
              Auto-submitted due to security violation
            </p>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              This test was submitted automatically
            </p>
          </div>
        </div>
      )}

      {/* Violations count */}
      {showViolationBanner && (result.violations?.length > 0 || result.violationCount > 0) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 20px', background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.2)', borderRadius: '12px' }}>
          <HiOutlineShieldExclamation size={18} color="#eab308" />
          <div>
            <p style={{ fontSize: '14px', fontWeight: '600', color: '#eab308', marginBottom: '2px' }}>
              {result.violations?.length || result.violationCount} proctoring violation{(result.violations?.length || result.violationCount) !== 1 ? 's' : ''} recorded
            </p>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Some actions were flagged during the test
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultSummary;
