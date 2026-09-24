import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import toast from 'react-hot-toast';
import {
  HiOutlineClipboardDocumentList,
  HiOutlineArrowTrendingUp,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineMagnifyingGlass
} from 'react-icons/hi2';

const MyResults = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { fetchResults(); }, []);

  const fetchResults = async () => {
    try {
      const res = await API.get('/student/results');
      setResults(res.data.data);
    } catch (err) {
      toast.error('Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  // --- Statistics Calculation ---
  const totalExams = results.length;
  const passedExams = results.filter(r => (r.percentage || 0) >= 40).length;
  const failedExams = results.filter(r => (r.percentage || 0) < 40).length;
  const avgScore = totalExams > 0 
    ? Math.round(results.reduce((acc, r) => acc + (r.percentage || 0), 0) / totalExams) 
    : 0;

  // --- Filter ---
  const filteredResults = results.filter(r => 
    (r.testId?.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.testId?.subject || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          border: '3px solid var(--accent-blue-bg)', borderTopColor: 'var(--accent-blue)',
          animation: 'spin 0.8s linear infinite',
        }} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* ─── HEADER ─── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: 28, fontWeight: 700, color: 'var(--text-primary)' }}>
            Your Results
          </h1>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginTop: 4 }}>
            View your examination performance and detailed results.
          </p>
        </div>
        <div style={{ position: 'relative', width: '280px' }}>
          <HiOutlineMagnifyingGlass style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} size={18} />
          <input
            type="text"
            placeholder="Search exams..."
            className="dms-input"
            style={{ paddingLeft: 38 }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* ─── SUMMARY CARDS ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
        {/* Total Exams */}
        <div className="stat-card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--accent-blue-bg)', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HiOutlineClipboardDocumentList size={24} />
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 2 }}>Total Exams</p>
            <h3 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>{totalExams}</h3>
          </div>
        </div>

        {/* Average Score */}
        <div className="stat-card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--accent-blue-bg)', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HiOutlineArrowTrendingUp size={24} />
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 2 }}>Average Score</p>
            <h3 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>{avgScore}%</h3>
          </div>
        </div>

        {/* Passed */}
        <div className="stat-card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--accent-green-bg)', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HiOutlineCheckCircle size={24} />
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 2 }}>Passed</p>
            <h3 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>{passedExams}</h3>
          </div>
        </div>

        {/* Failed */}
        <div className="stat-card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--accent-red-bg)', color: 'var(--accent-red)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HiOutlineXCircle size={24} />
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 2 }}>Failed</p>
            <h3 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>{failedExams}</h3>
          </div>
        </div>
      </div>

      {/* ─── RESULT TABLE ─── */}
      <div className="dms-card" style={{ overflow: 'hidden' }}>
        {results.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, margin: '0 auto 16px', background: 'var(--accent-blue-bg)', color: 'var(--accent-blue)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <HiOutlineClipboardDocumentList size={32} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>No results yet</h3>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>Your completed examinations will appear here.</p>
            <button className="dms-btn dms-btn-primary" onClick={() => navigate('/student/dashboard')}>
              View Available Exams
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr>
                  <th style={{ padding: '16px 20px', fontSize: 13, fontWeight: 600 }}>Exam Name</th>
                  <th style={{ padding: '16px 20px', fontSize: 13, fontWeight: 600 }}>Subject</th>
                  <th style={{ padding: '16px 20px', fontSize: 13, fontWeight: 600 }}>Date</th>
                  <th style={{ padding: '16px 20px', fontSize: 13, fontWeight: 600 }}>Score</th>
                  <th style={{ padding: '16px 20px', fontSize: 13, fontWeight: 600 }}>Percentage</th>
                  <th style={{ padding: '16px 20px', fontSize: 13, fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '16px 20px', fontSize: 13, fontWeight: 600, textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.map((r) => {
                  const pass = (r.percentage || 0) >= 40;
                  return (
                    <tr key={r._id} style={{ transition: 'background 0.2s' }}>
                      <td style={{ padding: '16px 20px', fontSize: 14, fontWeight: 500 }}>
                        {r.testId?.title || 'Assessment'}
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: 14, color: 'var(--text-secondary)' }}>
                        {r.testId?.subject || 'Engineering'}
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: 14, color: 'var(--text-secondary)' }}>
                        {formatDate(r.submittedAt)}
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: 14, fontWeight: 500 }}>
                        {r.score} <span style={{ color: 'var(--text-muted)' }}>/ {r.totalMarks}</span>
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: 14, fontWeight: 600 }}>
                        {r.percentage}%
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: 6,
                          fontSize: 12,
                          fontWeight: 600,
                          background: pass ? 'var(--accent-green-bg)' : 'var(--accent-red-bg)',
                          color: pass ? 'var(--accent-green)' : 'var(--accent-red)',
                        }}>
                          {pass ? 'Passed' : 'Failed'}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <button
                          className="dms-btn dms-btn-outline dms-btn-sm"
                          onClick={() => navigate(`/student/results/${r._id}`)}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyResults;
