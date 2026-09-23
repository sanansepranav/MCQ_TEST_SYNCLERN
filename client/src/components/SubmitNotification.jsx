import React from 'react';
import {
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineShieldExclamation,
} from 'react-icons/hi2';

/**
 * Centered Submit Notification Dialog (Displayed in middle of viewport)
 */
const SubmitNotification = ({
  isOpen = false,
  type = 'success', // 'success' | 'violation' | 'timeout'
  title = 'Exam Submitted Successfully',
  message = 'Your exam responses have been recorded.',
  redirectText = 'Redirecting to scorecard...',
}) => {
  if (!isOpen) return null;

  const isSuccess = type === 'success';
  const isTimeout = type === 'timeout';

  const accentColor = isSuccess ? '#10b981' : isTimeout ? '#f59e0b' : '#ef4444';
  const bgAccent = isSuccess
    ? 'rgba(16, 185, 129, 0.15)'
    : isTimeout
    ? 'rgba(245, 158, 11, 0.15)'
    : 'rgba(239, 68, 68, 0.15)';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(10, 15, 29, 0.82)',
        backdropFilter: 'blur(10px)',
        padding: '20px',
        animation: 'submitFadeIn 0.25s ease-out',
      }}
    >
      <div
        style={{
          position: 'relative',
          maxWidth: '460px',
          width: '100%',
          background: '#1e293b',
          border: `2px solid ${accentColor}`,
          borderRadius: '24px',
          padding: '36px 28px',
          textAlign: 'center',
          color: '#ffffff',
          boxShadow: '0 25px 60px -10px rgba(0, 0, 0, 0.75)',
          animation: 'submitPopIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Centered Pulse Icon */}
        <div
          style={{
            width: '74px',
            height: '74px',
            margin: '0 auto 20px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: bgAccent,
            border: `2px solid ${accentColor}`,
            boxShadow: `0 0 25px ${bgAccent}`,
          }}
        >
          {isSuccess && <HiOutlineCheckCircle size={44} color="#10b981" />}
          {isTimeout && <HiOutlineClock size={44} color="#f59e0b" />}
          {!isSuccess && !isTimeout && <HiOutlineShieldExclamation size={44} color="#ef4444" />}
        </div>

        {/* Title */}
        <h3
          style={{
            fontSize: '22px',
            fontWeight: '800',
            color: '#ffffff',
            margin: '0 0 10px',
            letterSpacing: '-0.02em',
          }}
        >
          {title}
        </h3>

        {/* Message */}
        <p
          style={{
            fontSize: '14px',
            color: '#94a3b8',
            margin: '0 0 24px',
            lineHeight: '1.6',
          }}
        >
          {message}
        </p>

        {/* Redirecting Spinner */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 20px',
            background: 'rgba(255, 255, 255, 0.08)',
            borderRadius: '30px',
            fontSize: '13px',
            fontWeight: '600',
            color: '#e2e8f0',
          }}
        >
          <div
            style={{
              width: '14px',
              height: '14px',
              border: '2px solid rgba(255,255,255,0.2)',
              borderTopColor: accentColor,
              borderRadius: '50%',
              animation: 'submitSpin 0.8s linear infinite',
            }}
          />
          <span>{redirectText}</span>
        </div>
      </div>

      <style>{`
        @keyframes submitFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes submitPopIn {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes submitSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default SubmitNotification;
