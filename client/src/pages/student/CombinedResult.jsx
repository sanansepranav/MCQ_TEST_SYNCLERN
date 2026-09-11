import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

const CombinedResult = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);

  const handleDownloadPDF = async () => {
    setPdfLoading(true);
    try {
      const response = await api.get(
        `/coding/combined-result/${testId}/pdf`,
        { responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `combined_result_${testId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('PDF downloaded!');
    } catch (err) {
      console.error('PDF download error:', err);
      toast.error('Failed to download PDF. Please try again.');
    } finally {
      setPdfLoading(false);
    }
  };

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await api.get(`/coding/combined-result/${testId}`);
        setResult(res.data.result);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load results');
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [testId]);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
      <div style={{ width: 40, height: 40, border: '3px solid var(--border-hover)', borderTopColor: 'var(--accent-blue)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
  if (error) return (
    <div style={{padding:'40px', textAlign:'center', color:'var(--accent-red)'}}>
      {error}
    </div>
  );
  if (!result) return null;

  const { 
    testTitle, testSubject,
    mcqSection, codingSection, summary 
  } = result;

  return (
    <div style={{
      padding: '32px 40px',
      maxWidth: '900px',
      margin: '0 auto'
    }}>
      {/* Header */}
      <div style={{
        display:'flex',
        alignItems:'center',
        justifyContent:'space-between',
        marginBottom:'28px'
      }}>
        <div>
          <h1 style={{
            fontSize:'24px',
            fontWeight:'700',
            color:'var(--text-primary)',
            marginBottom:'4px',
            fontFamily:'Sora,sans-serif'
          }}>Combined Result</h1>
          <p style={{
            fontSize:'14px',
            color:'var(--text-muted)'
          }}>
            {testTitle} · {testSubject}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={handleDownloadPDF}
            disabled={pdfLoading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: pdfLoading ? 'rgba(37,99,235,0.5)' : 'var(--accent-blue)',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: pdfLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {pdfLoading ? (
              <>
                <span style={{
                  width: '14px',
                  height: '14px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTop: '2px solid #fff',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  display: 'inline-block'
                }}/>
                Generating...
              </>
            ) : (
              '⬇ Download PDF'
            )}
          </button>
          <button
            onClick={() => navigate('/student/dashboard')}
            style={{
              background:'var(--bg-hover)',
              border:'1px solid var(--border-color)',
              borderRadius:'10px',
              padding:'10px 18px',
              color:'var(--text-secondary)',
              fontSize:'14px',
              cursor:'pointer'
            }}
          >
            ← Dashboard
          </button>
        </div>
      </div>

      {/* Overall Score Card */}
      <div style={{
        background:'var(--bg-surface)',
        border: summary.passed
          ? '1px solid rgba(16,185,129,0.3)'
          : '1px solid rgba(239,68,68,0.3)',
        borderRadius:'16px',
        padding:'28px',
        marginBottom:'20px',
        display:'flex',
        alignItems:'center',
        gap:'28px'
      }}>
        {/* Score Circle */}
        <div style={{
          width:'100px',
          height:'100px',
          borderRadius:'50%',
          background: summary.passed
            ? 'rgba(16,185,129,0.1)'
            : 'rgba(239,68,68,0.1)',
          border: `3px solid ${
            summary.passed 
              ? '#10b981' 
              : '#ef4444'
          }`,
          display:'flex',
          flexDirection:'column',
          alignItems:'center',
          justifyContent:'center',
          flexShrink:0
        }}>
          <span style={{
            fontSize:'22px',
            fontWeight:'800',
            color: summary.passed 
              ? '#10b981' 
              : '#ef4444',
            fontFamily:'Sora,sans-serif'
          }}>
            {summary.overallPercentage}%
          </span>
          <span style={{
            fontSize:'11px',
            color: summary.passed 
              ? '#10b981' 
              : '#ef4444',
            fontWeight:'600'
          }}>
            {summary.passed 
              ? 'PASSED' 
              : 'FAILED'}
          </span>
        </div>

        <div style={{flex:1}}>
          <div style={{
            fontSize:'28px',
            fontWeight:'800',
            color:'var(--text-primary)',
            fontFamily:'Sora,sans-serif',
            marginBottom:'4px'
          }}>
            {summary.totalScore} / {summary.totalPossible} Marks
          </div>
          <p style={{
            fontSize:'14px',
            color:'var(--text-secondary)',
            marginBottom:'12px'
          }}>
            Combined MCQ + Coding Score
          </p>
          <div style={{
            display:'flex',
            gap:'8px'
          }}>
            <span style={{
              background: summary.passed
                ? 'rgba(16,185,129,0.12)'
                : 'rgba(239,68,68,0.12)',
              color: summary.passed
                ? '#10b981'
                : '#ef4444',
              border: `1px solid ${
                summary.passed
                  ? 'rgba(16,185,129,0.2)'
                  : 'rgba(239,68,68,0.2)'
              }`,
              borderRadius:'20px',
              padding:'4px 14px',
              fontSize:'13px',
              fontWeight:'600'
            }}>
              {summary.passed 
                ? '✓ PASSED' 
                : '✗ FAILED'}
            </span>
            <span style={{
              background:'var(--bg-hover)',
              border:'1px solid var(--border-color)',
              borderRadius:'20px',
              padding:'4px 14px',
              fontSize:'13px',
              color:'var(--text-secondary)'
            }}>
              Passing: {summary.passingPercentage}%
            </span>
          </div>
        </div>
      </div>

      {/* Two Section Cards */}
      <div style={{
        display:'grid',
        gridTemplateColumns:'1fr 1fr',
        gap:'16px',
        marginBottom:'20px'
      }}>
        {/* MCQ Section Card */}
        <div style={{
          background:'var(--bg-surface)',
          border:'1px solid var(--border-color)',
          borderRadius:'16px',
          padding:'24px'
        }}>
          <div style={{
            display:'flex',
            alignItems:'center',
            gap:'10px',
            marginBottom:'16px'
          }}>
            <span style={{fontSize:'20px'}}>
              📝
            </span>
            <h3 style={{
              fontSize:'15px',
              fontWeight:'600',
              color:'var(--text-primary)',
              fontFamily:'Sora,sans-serif'
            }}>MCQ Section</h3>
          </div>

          {mcqSection ? (
            <>
              <div style={{
                fontSize:'28px',
                fontWeight:'800',
                color:'var(--accent-blue)',
                fontFamily:'Sora,sans-serif',
                marginBottom:'4px'
              }}>
                {mcqSection.score} / {mcqSection.totalMarks}
              </div>
              <p style={{
                fontSize:'13px',
                color:'var(--text-muted)',
                marginBottom:'16px'
              }}>
                {mcqSection.percentage}% · 
                {mcqSection.correctAnswers} correct, 
                {mcqSection.incorrectAnswers} wrong, 
                {mcqSection.unattempted} skipped
              </p>
              {mcqSection.autoSubmitted && (
                <div style={{
                  background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  borderRadius:'8px',
                  padding:'8px 12px',
                  fontSize:'12px',
                  color:'#ef4444'
                }}>
                  ⚠ Auto-submitted (security violation)
                </div>
              )}
              <button
                onClick={() => navigate(`/student/results/${mcqSection.resultId}`)}
                style={{
                  marginTop:'12px',
                  background:'transparent',
                  border:'1px solid var(--border-input)',
                  borderRadius:'8px',
                  padding:'7px 14px',
                  fontSize:'12px',
                  color:'var(--text-secondary)',
                  cursor:'pointer'
                }}
              >
                View MCQ Detail →
              </button>
            </>
          ) : (
            <p style={{
              color:'var(--text-muted)',
              fontSize:'14px'
            }}>
              Not attempted
            </p>
          )}
        </div>

        {/* Coding Section Card */}
        <div style={{
          background:'var(--bg-surface)',
          border:'1px solid var(--border-color)',
          borderRadius:'16px',
          padding:'24px'
        }}>
          <div style={{
            display:'flex',
            alignItems:'center',
            gap:'10px',
            marginBottom:'16px'
          }}>
            <span style={{fontSize:'20px'}}>
              💻
            </span>
            <h3 style={{
              fontSize:'15px',
              fontWeight:'600',
              color:'var(--text-primary)',
              fontFamily:'Sora,sans-serif'
            }}>Coding Section</h3>
          </div>

          {codingSection ? (
            <>
              <div style={{
                fontSize:'28px',
                fontWeight:'800',
                color:'#a855f7',
                fontFamily:'Sora,sans-serif',
                marginBottom:'4px'
              }}>
                {codingSection.totalScore} / {codingSection.totalMarks}
              </div>
              <p style={{
                fontSize:'13px',
                color:'var(--text-muted)',
                marginBottom:'16px'
              }}>
                {codingSection.percentage}% · 
                {codingSection.submissions.length} problem(s) attempted
              </p>

              {/* Per-problem breakdown */}
              {codingSection.submissions.map((sub, i) => (
                <div key={i} style={{
                  padding:'10px 12px',
                  background:'var(--bg-hover)',
                  borderRadius:'8px',
                  marginBottom:'8px',
                  fontSize:'13px'
                }}>
                  <div style={{
                    display:'flex',
                    justifyContent:'space-between',
                    marginBottom:'4px'
                  }}>
                    <span style={{
                      color:'var(--text-primary)',
                      fontWeight:'500'
                    }}>
                      {sub.problemTitle}
                    </span>
                    <span style={{
                      color:'var(--accent-blue)',
                      fontWeight:'600'
                    }}>
                      {sub.score}/{sub.totalMarks}
                    </span>
                  </div>
                  <div style={{
                    display:'flex',
                    gap:'8px',
                    fontSize:'12px',
                    color:'var(--text-muted)'
                  }}>
                    <span>
                      {sub.language.toUpperCase()}
                    </span>
                    <span>·</span>
                    <span>
                      {sub.passedTestCases}/{sub.totalTestCases} test cases
                    </span>
                    {sub.autoSubmitted && (
                      <>
                        <span>·</span>
                        <span style={{ color:'#ef4444' }}>Auto-submitted</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </>
          ) : (
            <p style={{
              color:'var(--text-muted)',
              fontSize:'14px'
            }}>
              Not attempted
            </p>
          )}
        </div>
      </div>
      {/* Mobile layout fix */}
      <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default CombinedResult;
