import { useTheme } from '../context/ThemeContext';
import { HiOutlineSun, HiOutlineMoon } from 'react-icons/hi2';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: '#ffffff',
        border: '1.5px solid #cbd5e1',
        borderRadius: '10px',
        padding: '8px 16px',
        cursor: 'pointer',
        color: '#374151',
        fontSize: '13px',
        fontWeight: '600',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        transition: 'all 0.2s ease'
      }}
    >
      {theme === 'dark' ? (
        <>
          <HiOutlineSun size={15} />
          <span>Light</span>
        </>
      ) : (
        <>
          <HiOutlineMoon size={15} />
          <span>Dark</span>
        </>
      )}
    </button>
  );
};

export default ThemeToggle;
