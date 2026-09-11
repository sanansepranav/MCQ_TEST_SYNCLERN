import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

const STATUS_COLORS = {
  Accepted: { bg: 'var(--accent-green-bg)', color: 'var(--accent-green)', icon: '✓' },
  'Wrong Answer': { bg: 'var(--accent-red-bg)', color: 'var(--accent-red)', icon: '✗' },
  'Time Limit Exceeded': { bg: 'var(--accent-amber-bg)', color: 'var(--accent-amber)', icon: '⏱' },
  'Runtime Error': { bg: 'var(--accent-red-bg)', color: 'var(--accent-red)', icon: '⚠' },
  'Compilation Error': { bg: 'var(--accent-red-bg)', color: 'var(--accent-red)', icon: '⛔' },
  Pending: { bg: 'var(--bg-hover)', color: 'var(--text-muted)', icon: '⋯' },
};

const TestCasePanel = ({ testCases = [], compilationError = null }) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState(0);

  if (compilationError) {
    return (
      <div style={{
        background: 'var(--accent-red-bg)',
        border: '1px solid rgba(239,68,68,0.2)',
        borderRadius: '12px',
        padding: '20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <span style={{ fontSize: '16px' }}>⛔</span>
          <span style={{ fontWeight: '600', color: 'var(--accent-red)', fontSize: '14px' }}>
            Compilation Error
          </span>
        </div>
        <pre style={{
          background: theme === 'light' ? '#fff5f5' : 'rgba(0,0,0,0.3)',
          border: '1px solid rgba(239,68,68,0.15)',
          borderRadius: '8px',
          padding: '14px',
          fontSize: '12px',
          fontFamily: "'JetBrains Mono', 'Consolas', monospace",
          color: 'var(--accent-red)',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          margin: 0,
          overflow: 'auto',
          maxHeight: '200px',
        }}>
          {compilationError}
        </pre>
      </div>
    );
  }

  if (testCases.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '40px 20px',
        color: 'var(--text-muted)',
        fontSize: '14px',
      }}>
        No test case results yet. Run or submit your code.
      </div>
    );
  }

  const activeCase = testCases[activeTab];
  const statusInfo = STATUS_COLORS[activeCase?.status] || STATUS_COLORS.Pending;

  return (
    <div>
      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '6px',
        padding: '0 0 12px 0',
        overflowX: 'auto',
        flexWrap: 'wrap',
      }}>
        {testCases.map((tc, idx) => {
          const s = STATUS_COLORS[tc.status] || STATUS_COLORS.Pending;
          const isActive = idx === activeTab;
          return (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: isActive ? `1.5px solid ${s.color}` : '1px solid var(--border-color)',
                background: isActive ? s.bg : 'transparent',
                color: isActive ? s.color : 'var(--text-secondary)',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                whiteSpace: 'nowrap',
                fontFamily: 'inherit',
                transition: 'all 0.15s',
              }}
            >
              <span style={{ fontSize: '11px' }}>{s.icon}</span>
              {tc.isHidden ? `Hidden #${idx + 1}` : `Case #${idx + 1}`}
            </button>
          );
        })}
      </div>

      {/* Active test case detail */}
      {activeCase && (
        <div style={{
          background: 'var(--bg-hover)',
          borderRadius: '10px',
          padding: '16px',
          border: '1px solid var(--border-color)',
        }}>
          {/* Status bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '14px',
            flexWrap: 'wrap',
            gap: '8px',
          }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '6px',
              background: statusInfo.bg,
              color: statusInfo.color,
              fontSize: '12px',
              fontWeight: '600',
            }}>
              {statusInfo.icon} {activeCase.status}
            </span>
            <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
              {activeCase.executionTime > 0 && (
                <span>⏱ {activeCase.executionTime.toFixed(1)}ms</span>
              )}
              {activeCase.memoryUsed > 0 && (
                <span>💾 {(activeCase.memoryUsed / 1024).toFixed(1)}MB</span>
              )}
            </div>
          </div>

          {/* Output */}
          {!activeCase.isHidden && activeCase.actualOutput !== undefined && (
            <div>
              <p style={{
                fontSize: '11px',
                fontWeight: '600',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '6px',
              }}>
                Output
              </p>
              <pre style={{
                background: theme === 'light' ? '#f8faff' : 'rgba(0,0,0,0.3)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '12px',
                fontFamily: "'JetBrains Mono', 'Consolas', monospace",
                color: 'var(--text-primary)',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                margin: 0,
                maxHeight: '160px',
                overflow: 'auto',
              }}>
                {activeCase.actualOutput || '(no output)'}
              </pre>
            </div>
          )}

          {activeCase.isHidden && (
            <p style={{
              fontSize: '13px',
              color: 'var(--text-muted)',
              fontStyle: 'italic',
            }}>
              This is a hidden test case. {activeCase.passed ? 'Your output matched.' : 'Your output did not match.'}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default TestCasePanel;
