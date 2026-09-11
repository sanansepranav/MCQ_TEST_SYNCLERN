import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import API from '../../services/api';
import toast from 'react-hot-toast';
import { HiOutlineChevronLeft } from 'react-icons/hi2';

const STATUS_BADGE = {
  completed: { bg: 'var(--accent-green-bg)', color: 'var(--accent-green)', label: 'Graded' },
  error: { bg: 'var(--accent-red-bg)', color: 'var(--accent-red)', label: 'Error' },
  running: { bg: 'var(--accent-amber-bg)', color: 'var(--accent-amber)', label: 'Running' },
  pending: { bg: 'var(--bg-hover)', color: 'var(--text-muted)', label: 'Pending' },
};

const ViewCodingSubmissions = () => {
  const { theme } = useTheme();
  const { id: testId } = useParams();
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [testTitle, setTestTitle] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchData();
  }, [testId]);

  const fetchData = async () => {
    try {
      const [testRes, subRes] = await Promise.all([
        API.get(`/tests/${testId}`),
        API.get(`/coding/${testId}/all-submissions`),
      ]);
      setTestTitle(testRes.data.data?.title || 'Test');
      setSubmissions(subRes.data.data || []);
    } catch (err) {
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--border-hover)', borderTopColor: 'var(--accent-amber)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  // Group submissions by student
  const byStudent = {};
  submissions.forEach(s => {
    const sid = s.studentId?._id || 'unknown';
    if (!byStudent[sid]) {
      byStudent[sid] = {
        student: s.studentId,
        submissions: [],
        totalScore: 0,
      };
    }
    byStudent[sid].submissions.push(s);
    byStudent[sid].totalScore += s.score || 0;
  });

  const studentList = Object.values(byStudent).sort((a, b) => b.totalScore - a.totalScore);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <button onClick={() => navigate('/admin/tests')} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '13px', marginBottom: '8px', padding: 0 }}>
          <HiOutlineChevronLeft size={14} /> Back to Tests
        </button>
        <h1 style={{ fontSize: '26px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' }}>
          Coding Submissions
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
          {testTitle} — {submissions.length} submission{submissions.length !== 1 ? 's' : ''} from {studentList.length} student{studentList.length !== 1 ? 's' : ''}
        </p>
      </div>

      {studentList.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)', fontSize: '15px', background: 'var(--bg-surface)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
          No submissions yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {studentList.map(({ student, submissions: subs, totalScore }) => {
            const isExpanded = expandedId === student?._id;
            return (
              <div key={student?._id || Math.random()} style={{ background: 'var(--bg-surface)', borderRadius: '14px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                {/* Student header */}
                <div onClick={() => setExpandedId(isExpanded ? null : student?._id)} style={{ padding: '18px 24px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', color: '#fff', flexShrink: 0 }}>
                      {student?.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <p style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '14px' }}>{student?.name || 'Unknown'}</p>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{student?.email} · {student?.rollNumber}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontSize: '15px', fontWeight: '700', color: 'var(--accent-blue)' }}>{totalScore} pts</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{subs.length} submission{subs.length !== 1 ? 's' : ''}</span>
                    <span style={{ color: 'var(--text-muted)', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', fontSize: '16px' }}>▼</span>
                  </div>
                </div>

                {/* Expanded submissions */}
                {isExpanded && (
                  <div style={{ borderTop: '1px solid var(--border-color)', padding: '16px 24px' }}>
                    {subs.map((sub) => {
                      const badge = STATUS_BADGE[sub.status] || STATUS_BADGE.pending;
                      return (
                        <div key={sub._id} style={{ background: 'var(--bg-hover)', borderRadius: '10px', padding: '16px', marginBottom: '10px', border: '1px solid var(--border-color)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '14px' }}>
                                {sub.problemId?.title || 'Problem'}
                              </span>
                              <span style={{ padding: '2px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', background: badge.bg, color: badge.color }}>{badge.label}</span>
                              <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>{sub.language}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>
                              <span style={{ fontWeight: '700', color: 'var(--accent-green)' }}>{sub.score}/{sub.totalMarks}</span>
                              <span>Attempt #{sub.attemptNumber}</span>
                              <span>{new Date(sub.submittedAt).toLocaleString('en-IN')}</span>
                            </div>
                          </div>

                          {/* Test case results */}
                          {sub.testCaseResults && sub.testCaseResults.length > 0 && (
                            <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', flexWrap: 'wrap' }}>
                              {sub.testCaseResults.map((tcr, idx) => (
                                <span key={idx} style={{ width: '24px', height: '24px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', background: tcr.passed ? 'var(--accent-green-bg)' : 'var(--accent-red-bg)', color: tcr.passed ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                                  {tcr.passed ? '✓' : '✗'}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Source code */}
                          <details>
                            <summary style={{ fontSize: '12px', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '6px' }}>View Source Code</summary>
                            <pre style={{ background: theme === 'light' ? '#f8faff' : 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '14px', fontSize: '12px', fontFamily: "'JetBrains Mono', 'Consolas', monospace", color: 'var(--text-primary)', whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: '300px', overflow: 'auto', margin: 0 }}>
                              {sub.sourceCode}
                            </pre>
                          </details>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ViewCodingSubmissions;
