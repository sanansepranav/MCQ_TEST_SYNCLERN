import { useTheme } from '../../context/ThemeContext';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../../services/api';
import toast from 'react-hot-toast';
import {
  HiOutlineArrowDownTray,
  HiOutlineExclamationTriangle,
  HiOutlineChartBarSquare,
  HiOutlineTrophy,
  HiOutlineArrowTrendingUp,
  HiOutlineArrowTrendingDown,
  HiOutlineUserGroup,
} from 'react-icons/hi2';

// Blob download helper
const downloadBlob = (data, filename) => {
  const url = window.URL.createObjectURL(new Blob([data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.parentNode.removeChild(link);
  window.URL.revokeObjectURL(url);
};

const ViewResults = () => {
  const { theme } = useTheme();
  const [searchParams] = useSearchParams();
  const preTestId = searchParams.get('testId') || '';

  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState(preTestId);
  const [results, setResults] = useState([]);
  const [testInfo, setTestInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [bulkExporting, setBulkExporting] = useState(false);
  const [rowExporting, setRowExporting] = useState(null);

  useEffect(() => { fetchTests(); }, []);
  useEffect(() => { if (selectedTest) fetchResults(selectedTest); }, [selectedTest]);

  const fetchTests = async () => {
    try {
      const res = await API.get('/tests');
      setTests(res.data.data);
    } catch { toast.error('Failed to load tests'); }
    finally { setInitialLoading(false); }
  };

  const fetchResults = async (testId) => {
    setLoading(true);
    try {
      const res = await API.get(`/results/test/${testId}`);
      setResults(res.data.data.results);
      setTestInfo(res.data.data.test);
    } catch { toast.error('Failed to load results'); }
    finally { setLoading(false); }
  };

  // ─── Export All PDF ───
  const handleExportPDF = async () => {
    if (!selectedTest) return;
    setBulkExporting(true);
    try {
      const response = await API.get(`/results/test/${selectedTest}/export-pdf`, { responseType: 'blob' });
      downloadBlob(response.data, `results_${testInfo?.title?.replace(/\s+/g, '_') || 'test'}.pdf`);
      toast.success('PDF downloaded!');
    } catch { toast.error('PDF export failed'); }
    finally { setBulkExporting(false); }
  };

  // ─── Export Single Student PDF ───
  const handleExportSinglePDF = async (resultId, studentRoll) => {
    setRowExporting(resultId);
    try {
      const response = await API.get(`/results/${resultId}/export-pdf`, { responseType: 'blob' });
      downloadBlob(response.data, `result_${studentRoll || 'student'}.pdf`);
      toast.success('PDF downloaded!');
    } catch { toast.error('PDF export failed'); }
    finally { setRowExporting(null); }
  };

  const formatTime = (seconds) => {
    if (!seconds) return '—';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  // ─── Stats calculation ───
  const passingPct = testInfo?.passingPercentage || 40;
  const scores = results.map((r) => r.percentage || 0);
  const passCount = scores.filter((s) => s >= passingPct).length;
  const failCount = scores.length - passCount;
  const highest = scores.length ? Math.max(...scores) : 0;
  const lowest = scores.length ? Math.min(...scores) : 0;
  const average = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  if (initialLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--border-hover)', borderTopColor: 'var(--accent-amber)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '28px'
      }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>
            View Results
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>
            {testInfo ? `${testInfo.title} — ${results.length} submissions` : 'Select a test to view results'}
          </p>
        </div>
        {selectedTest && results.length > 0 && (
          <button onClick={handleExportPDF} disabled={bulkExporting}
            style={{
              background: 'var(--accent-blue-bg)',
              border: '1px solid var(--accent-blue-border)',
              color: 'var(--accent-blue)',
              borderRadius: '10px',
              padding: '10px 18px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: bulkExporting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              opacity: bulkExporting ? 0.7 : 1
            }}>
            {bulkExporting ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '16px', height: '16px', border: '2px solid var(--accent-blue-border)', borderTopColor: 'var(--accent-blue)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                Exporting...
              </span>
            ) : (
              <>
                <HiOutlineArrowDownTray size={16} /> Export All PDF
              </>
            )}
          </button>
        )}
      </div>

      {/* Test Filter */}
      <div style={{ marginBottom: '28px' }}>
        <label style={{
          display: 'block', fontSize: '13px',
          color: 'var(--text-secondary)',
          marginBottom: '8px'
        }}>
          Filter by Test
        </label>
        <select value={selectedTest} onChange={(e) => setSelectedTest(e.target.value)}
          style={{
            background: 'var(--bg-hover)',
            border: '1px solid var(--border-input)',
            borderRadius: '10px',
            padding: '11px 16px',
            color: 'var(--text-primary)',
            fontSize: '14px',
            minWidth: '280px',
            cursor: 'pointer',
            outline: 'none',
            appearance: 'auto'
          }}>
          <option value="" style={{ background: 'var(--bg-sidebar)' }}>Select a test...</option>
          {tests.map((t) => (
            <option key={t._id} value={t._id} style={{ background: 'var(--bg-sidebar)' }}>{t.title} ({t.subject})</option>
          ))}
        </select>
      </div>

      {/* Stats Bar */}
      {selectedTest && results.length > 0 && !loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '28px' }}>
          {[
            { label: 'Total', value: results.length, icon: HiOutlineUserGroup, color: 'var(--accent-blue)', bg: 'var(--accent-blue-bg)' },
            { label: 'Highest', value: `${highest}%`, icon: HiOutlineArrowTrendingUp, color: 'var(--accent-green)', bg: 'var(--accent-green-bg)' },
            { label: 'Lowest', value: `${lowest}%`, icon: HiOutlineArrowTrendingDown, color: 'var(--accent-red)', bg: 'var(--accent-red-bg)' },
            { label: 'Average', value: `${average}%`, icon: HiOutlineChartBarSquare, color: 'var(--accent-amber)', bg: 'var(--accent-amber-bg)' },
            { label: 'Passed', value: passCount, icon: HiOutlineTrophy, color: 'var(--accent-green)', bg: 'var(--accent-green-bg)' },
            { label: 'Failed', value: failCount, icon: HiOutlineExclamationTriangle, color: 'var(--accent-red)', bg: 'var(--accent-red-bg)' },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} style={{
                background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
                borderRadius: '12px', padding: '12px', display: 'flex', alignItems: 'center', gap: '12px'
              }}>
                <div style={{ width: '32px', height: '32px', background: s.bg, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={16} style={{ color: s.color }} />
                </div>
                <div>
                  <p style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', lineHeight: '1.2' }}>{s.value}</p>
                  <p style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Results Table */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 0' }}>
          <div style={{ width: '32px', height: '32px', border: '3px solid var(--border-hover)', borderTopColor: 'var(--accent-amber)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : !selectedTest ? (
        <div style={{
          textAlign: 'center',
          padding: '80px 20px',
          color: 'var(--text-muted)',
          background: 'var(--bg-surface)',
          borderRadius: '16px',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>
            📊
          </div>
          <p style={{ fontSize: '16px', marginBottom: '8px', color: 'var(--text-secondary)' }}>
            No test selected
          </p>
          <p style={{ fontSize: '13px' }}>
            Select a test from the dropdown above to view student results
          </p>
        </div>
      ) : results.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '80px 20px',
          color: 'var(--text-muted)',
          background: 'var(--bg-surface)',
          borderRadius: '16px',
          border: '1px solid var(--border-color)'
        }}>
          <p style={{ fontSize: '15px' }}>No submissions found for this test</p>
        </div>
      ) : (
        <div style={{
          background: 'var(--bg-surface)',
          borderRadius: '16px',
          padding: '0',
          overflow: 'hidden',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-hover)', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '14px 20px', fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center', width: '48px' }}>#</th>
                  <th style={{ padding: '14px 20px', fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'left' }}>Student</th>
                  <th style={{ padding: '14px 20px', fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'left' }} className="hidden sm:table-cell">Roll No</th>
                  <th style={{ padding: '14px 20px', fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center' }}>Score</th>
                  <th style={{ padding: '14px 20px', fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center' }}>%</th>
                  <th style={{ padding: '14px 20px', fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center' }} className="hidden md:table-cell">Time</th>
                  <th style={{ padding: '14px 20px', fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center' }} className="hidden lg:table-cell">Flags</th>
                  {testInfo?.testType === 'combined' && (
                    <th style={{ padding: '14px 20px', fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center' }}>Combined Score</th>
                  )}
                  <th style={{ padding: '14px 20px', fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center' }}>PDF</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, idx) => {
                  const pass = (r.percentage || 0) >= passingPct;
                  const isExporting = rowExporting === r._id;
                  return (
                    <tr key={r._id} style={{ borderBottom: '1px solid var(--bg-hover)', transition: 'background 0.15s' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '16px 20px', fontSize: '14px', color: 'var(--text-primary)', textAlign: 'center' }}>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>{idx + 1}</span>
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: '14px', color: 'var(--text-primary)' }}>
                        <p style={{ fontWeight: '500', color: 'var(--text-primary)', marginBottom: '4px' }}>{r.studentId?.name || 'N/A'}</p>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }} className="sm:hidden">{r.studentId?.rollNumber}</p>
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: '14px', color: 'var(--text-primary)' }} className="hidden sm:table-cell">
                        <span style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>{r.studentId?.rollNumber || '—'}</span>
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: '14px', color: 'var(--text-primary)', textAlign: 'center' }}>
                        <span style={{ fontWeight: '700', color: pass ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                          {r.score}/{r.totalMarks}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: '14px', color: 'var(--text-primary)', textAlign: 'center' }}>
                        <span style={{
                          display: 'inline-block', padding: '2px 8px', borderRadius: '20px',
                          fontSize: '12px', fontWeight: '700',
                          background: pass ? 'var(--accent-green-bg)' : 'var(--accent-red-bg)',
                          color: pass ? 'var(--accent-green)' : 'var(--accent-red)'
                        }}>
                          {r.percentage}%
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: '14px', color: 'var(--text-primary)', textAlign: 'center' }} className="hidden md:table-cell">
                        <span style={{ color: 'var(--text-secondary)' }}>{formatTime(r.timeTaken)}</span>
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: '14px', color: 'var(--text-primary)', textAlign: 'center' }} className="hidden lg:table-cell">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                          {r.autoSubmitted && (
                            <span style={{
                              display: 'flex', alignItems: 'center', gap: '4px',
                              background: 'var(--accent-red-bg)', color: 'var(--accent-red)',
                              border: '1px solid var(--accent-red-bg)', borderRadius: '20px',
                              padding: '2px 10px', fontSize: '11px', fontWeight: '700'
                            }}>
                              AUTO
                            </span>
                          )}
                          {r.violationCount > 0 && (
                            <span style={{
                              background: 'var(--accent-amber-bg)', color: 'var(--accent-amber)',
                              borderRadius: '20px', padding: '2px 8px', fontSize: '10px', fontWeight: '700'
                            }}>
                              {r.violationCount} violations
                            </span>
                          )}
                          {!r.autoSubmitted && !r.violationCount && (
                            <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>—</span>
                          )}
                        </div>
                      </td>
                      {testInfo?.testType === 'combined' && (
                        <td style={{ padding: '16px 20px', fontSize: '14px', color: 'var(--text-primary)', textAlign: 'center' }}>
                          <button
                            onClick={() => navigate(`/admin/combined-result/${testInfo._id}/${r.studentId?._id}`)}
                            style={{
                              background: 'var(--accent-blue-bg)',
                              border: '1px solid var(--accent-blue-border)',
                              borderRadius: '6px',
                              padding: '6px 12px',
                              color: 'var(--accent-blue)',
                              fontSize: '12px',
                              fontWeight: '600',
                              cursor: 'pointer'
                            }}
                          >
                            View Combined
                          </button>
                        </td>
                      )}
                      <td style={{ padding: '16px 20px', fontSize: '14px', color: 'var(--text-primary)', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <button
                            onClick={() => handleExportSinglePDF(r._id, r.studentId?.rollNumber)}
                            disabled={isExporting}
                            style={{
                              background: 'var(--bg-hover)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '7px',
                              cursor: isExporting ? 'not-allowed' : 'pointer', color: 'var(--text-secondary)', display: 'flex', opacity: isExporting ? 0.5 : 1
                            }}
                            title="Download PDF"
                            onMouseEnter={(e) => { if (!isExporting) { e.currentTarget.style.background = 'var(--border-input)'; e.currentTarget.style.color = 'var(--accent-amber)'; } }}
                            onMouseLeave={(e) => { if (!isExporting) { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-secondary)'; } }}
                          >
                            {isExporting ? (
                              <div style={{ width: '16px', height: '16px', border: '2px solid var(--border-hover)', borderTopColor: 'var(--accent-amber)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                            ) : (
                              <HiOutlineArrowDownTray size={16} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewResults;
