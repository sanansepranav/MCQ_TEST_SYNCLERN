import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div style={{
      minHeight: '100vh', background: '#080c14',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div className="animate-fade-in" style={{ textAlign: 'center' }}>
        <div style={{
          width: 80, height: 80, borderRadius: 20,
          background: '#0d1220', border: '1px solid rgba(255,255,255,0.07)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px', fontSize: 36,
        }}>⚠️</div>
        <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 56, fontWeight: 800, color: '#fff', marginBottom: 8 }}>404</h1>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.4)', marginBottom: 32 }}>Page not found</p>
        <Link to="/" className="dms-btn dms-btn-primary" style={{ padding: '14px 28px' }}>
          ← Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
