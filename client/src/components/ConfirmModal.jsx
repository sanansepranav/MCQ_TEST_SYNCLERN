import { HiOutlineExclamationTriangle } from 'react-icons/hi2';

/**
 * ConfirmModal — reusable confirmation dialog.
 *
 * @param {boolean}  isOpen      - Whether modal is visible
 * @param {function} onClose     - Close handler
 * @param {function} onConfirm   - Confirm handler
 * @param {string}   title       - Modal title
 * @param {string}   message     - Modal message
 * @param {string}   confirmText - Confirm button label (default "Confirm")
 * @param {string}   variant     - 'danger' | 'warning' | 'info' (default "danger")
 * @param {boolean}  loading     - Whether confirm action is in progress
 */
const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = '',
  confirmText = 'Confirm',
  variant = 'danger',
  loading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        borderRadius: '20px',
        padding: '32px',
        maxWidth: '420px',
        width: '90%',
        boxShadow: 'var(--shadow)',
        textAlign: 'center'
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: variant === 'danger' ? 'var(--accent-red-bg)' : 'var(--accent-blue-bg)',
          border: `1px solid ${variant === 'danger' ? 'rgba(239,68,68,0.2)' : 'rgba(59,130,246,0.2)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px'
        }}>
          <HiOutlineExclamationTriangle 
            size={24} 
            color={variant === 'danger' ? 'var(--accent-red)' : 'var(--accent-blue)'} 
          />
        </div>

        <h3 style={{
          fontSize: '20px',
          fontWeight: '700',
          color: 'var(--text-primary)',
          marginBottom: '12px',
          fontFamily: "'Sora', sans-serif"
        }}>
          {title || 'Are you sure?'}
        </h3>

        <p style={{
          fontSize: '14px',
          color: 'var(--text-secondary)',
          lineHeight: '1.6',
          marginBottom: '28px'
        }}>
          {message}
        </p>

        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center'
        }}>
          <button style={{
            flex: 1,
            padding: '12px',
            background: 'var(--bg-hover)',
            border: '1px solid var(--border-input)',
            borderRadius: '10px',
            color: 'var(--text-primary)',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer'
          }}
          onClick={onClose}
          disabled={loading}>
            Cancel
          </button>

          <button style={{
            flex: 1,
            padding: '12px',
            background: variant === 'danger'
              ? 'var(--accent-red)'
              : 'var(--accent-blue)',
            border: 'none',
            borderRadius: '10px',
            color: '#ffffff',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
          onClick={onConfirm}
          disabled={loading}>
            {loading && (
              <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#ffffff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            )}
            {confirmText || 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
