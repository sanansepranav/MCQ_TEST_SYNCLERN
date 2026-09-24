import { useTheme } from '../../context/ThemeContext';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../../services/api';
import toast from 'react-hot-toast';
import ResultSummary from '../../components/ResultSummary';
import {
  HiOutlineArrowLeft,
  HiOutlineArrowDownTray,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineMinusCircle,
  HiOutlineShieldExclamation,
} from 'react-icons/hi2';

const ResultDetail = () => {
  const { theme } = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => { fetchResult(); }, [id]);

  const fetchResult = async () => {
    try {
      const res = await API.get(`/student/results/${id}`);
      setResult(res.data.data);
    } catch (err) {
      toast.error('Failed to load result');
      navigate('/student/results');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    setPdfLoading(true);
    try {
      const response = await API.get(
        `/student/results/${id}/pdf`,
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `result_${result?.studentId?.rollNumber || 'student'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('PDF Downloaded!');
    } catch {
      toast.error('PDF download failed');
    } finally {
      setPdfLoading(false);
    }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  }) : '—';

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
        <div style={{ width: 40, height: 40, border: '3px solid var(--accent-blue-bg)', borderTopColor: 'var(--accent-blue)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (!result) return null;

  const comparison = result.comparison || [];
  const violations = result.violationRecords || [];

  return (
    <div style={{ padding: '32px 40px', maxWidth: '900px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
        <button onClick={() => navigate('/student/results')} style={{ background: 'var(--bg-hover)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '8px', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
          <HiOutlineArrowLeft size={16} />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '2px', fontFamily: "'Sora', sans-serif" }}>Result Detail</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{result.testId?.title}</p>
        </div>
        <button onClick={handleDownloadPDF} disabled={pdfLoading} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--accent-blue)', border: 'none', borderRadius: '10px', padding: '10px 20px', color: '#ffffff', fontSize: '14px', fontWeight: '600', cursor: 'pointer', opacity: pdfLoading ? 0.5 : 1 }}>
          {pdfLoading ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#ffffff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              Generating...
            </span>
          ) : (
            <>
              <HiOutlineArrowDownTray size={16} /> Download PDF
            </>
          )}
        </button>
      </div>

      {/* Result Summary (reusable component) */}
      <ResultSummary result={result} />

      {/* Answer Comparison */}
      <div style={{ marginTop: '32px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '16px' }}>Answer Review</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {comparison.map((q) => {
            const isCorrect = q.isCorrect;
            const isUnattempted = q.isUnattempted;
            
            let cardBg = 'var(--bg-surface)';
            let leftBorder = '4px solid var(--border-color)';
            let icon = null;
            
            if (isUnattempted) {
              cardBg = 'var(--accent-amber-bg)';
              leftBorder = '4px solid var(--accent-amber)';
              icon = <HiOutlineMinusCircle size={24} color="var(--accent-amber)" />;
            } else if (isCorrect) {
              cardBg = 'var(--accent-green-bg)';
              leftBorder = '4px solid var(--accent-green)';
              icon = <HiOutlineCheckCircle size={24} color="var(--accent-green)" />;
            } else {
              cardBg = 'var(--accent-red-bg)';
              leftBorder = '4px solid var(--accent-red)';
              icon = <HiOutlineXCircle size={24} color="var(--accent-red)" />;
            }

            return (
              <div key={q.questionNo} style={{ background: cardBg, borderLeft: leftBorder, borderRadius: '8px', padding: '20px', display: 'flex', gap: '16px', boxShadow: 'var(--shadow-sm)', borderTop: '1px solid var(--border-color)', borderRight: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ flexShrink: 0 }}>
                  {icon}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Question {q.questionNo}</p>
                  <p style={{ fontSize: '15px', color: 'var(--text-primary)', marginBottom: '16px', fontWeight: '500' }}>{q.questionText}</p>
                  
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
                    <div>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Your Answer:</p>
                      {q.isUnattempted ? (
                        <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-muted)' }}>Skipped</span>
                      ) : (
                        <span style={{ fontSize: '14px', fontWeight: '600', color: isCorrect ? 'var(--accent-green)' : 'var(--accent-red)' }}>{q.studentAnswer}</span>
                      )}
                    </div>
                    <div>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Correct Answer:</p>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>{q.correctAnswer}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ResultDetail;
