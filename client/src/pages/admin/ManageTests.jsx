import { useTheme } from '../../context/ThemeContext';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/ConfirmModal';
import {
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineDocumentText,
  HiOutlineKey,
  HiOutlineChartBarSquare,
  HiOutlinePlus,
  HiOutlineMagnifyingGlass,
  HiOutlineCodeBracketSquare,
} from 'react-icons/hi2';

const ManageTests = () => {
  const { theme } = useTheme();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null, title: '' });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const res = await API.get('/tests');
      setTests(res.data.data);
    } catch (err) {
      toast.error('Failed to load tests');
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (id, title) => setDeleteModal({ open: true, id, title });
  const closeDeleteModal = () => setDeleteModal({ open: false, id: null, title: '' });

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await API.delete(`/tests/${deleteModal.id}`);
      toast.success('Test deleted');
      setTests(tests.filter((t) => t._id !== deleteModal.id));
      closeDeleteModal();
    } catch (err) {
      toast.error('Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  const getTestStatus = (test) => {
    const now = new Date();
    const start = test.startTime ? new Date(test.startTime) : null;
    const end = test.endTime ? new Date(test.endTime) : null;

    if (test.status === 'draft') return { label: 'Draft', bg: 'var(--bg-hover)', color: 'var(--text-muted)', border: '1px solid var(--border-input)' };
    if (start && end && now >= start && now <= end) return { label: 'Live', bg: 'var(--accent-green-bg)', color: 'var(--accent-green)', border: '1px solid var(--accent-green-bg)' };
    if (start && now < start) return { label: 'Upcoming', bg: 'var(--accent-blue-bg)', color: 'var(--accent-blue)', border: '1px solid var(--accent-blue-border)' };
    if (end && now > end) return { label: 'Ended', bg: 'var(--bg-hover)', color: 'var(--text-muted)', border: '1px solid var(--border-input)' };
    if (test.status === 'published') return { label: 'Published', bg: 'var(--accent-amber-bg)', color: 'var(--accent-amber)', border: '1px solid var(--border-hover)' };
    return { label: test.status, bg: 'var(--bg-hover)', color: 'var(--text-muted)', border: '1px solid var(--border-input)' };
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString(
      'en-IN',
      {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }
    );
  };

  const filtered = tests.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.subject?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
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
            Manage Tests
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>
            {tests.length} tests total
          </p>
        </div>
        <Link
          to="/admin/tests/create"
          style={{
            background: 'var(--accent-blue)',
            color: 'var(--text-primary)',
            border: 'none',
            borderRadius: '10px',
            padding: '11px 22px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            textDecoration: 'none'
          }}
        >
          <HiOutlinePlus size={16} /> Create Test
        </Link>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '24px', maxWidth: '400px' }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tests..."
            style={{
              width: '100%',
              padding: '10px 16px 10px 42px',
              background: 'var(--bg-hover)',
              border: '1px solid var(--border-input)',
              borderRadius: '10px',
              color: 'var(--text-primary)',
              fontSize: '14px',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
          <span style={{
            position: 'absolute',
            left: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)',
            pointerEvents: 'none',
            display: 'flex'
          }}>
            <HiOutlineMagnifyingGlass size={16} />
          </span>
        </div>
      </div>

      {/* Table */}
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
                <th style={{ padding: '14px 20px', fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'left' }}>Test Name</th>
                <th style={{ padding: '14px 20px', fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'left' }} className="hidden md:table-cell">Start / End</th>
                <th style={{ padding: '14px 20px', fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center' }} className="hidden sm:table-cell">Duration</th>
                <th style={{ padding: '14px 20px', fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center' }} className="hidden lg:table-cell">Qs</th>
                <th style={{ padding: '14px 20px', fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center' }}>Status</th>
                <th style={{ padding: '14px 20px', fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)', fontSize: '15px' }}>
                    {search ? 'No tests match your search' : 'No tests created yet'}
                  </td>
                </tr>
              ) : (
                filtered.map((test) => {
                  const status = getTestStatus(test);
                  return (
                    <tr key={test._id} style={{ borderBottom: '1px solid var(--bg-hover)', transition: 'background 0.15s' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '16px 20px', fontSize: '14px', color: 'var(--text-primary)' }}>
                        <div style={{display:'flex', alignItems:'center', gap:'8px', flexWrap: 'wrap', marginBottom: '4px'}}>
                          <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{test.title}</span>
                          
                          {test.testType === 'coding' && (
                            <span style={{
                              background: 'rgba(168,85,247,0.12)',
                              color: '#a855f7',
                              border: '1px solid rgba(168,85,247,0.2)',
                              borderRadius: '6px',
                              padding: '2px 8px',
                              fontSize: '11px',
                              fontWeight: '600'
                            }}>
                              💻 CODING
                            </span>
                          )}
                          
                          {test.testType === 'combined' && (
                            <span style={{
                              background: 'rgba(59,130,246,0.12)',
                              color: '#3b82f6',
                              border: '1px solid rgba(59,130,246,0.2)',
                              borderRadius: '6px',
                              padding: '2px 8px',
                              fontSize: '11px',
                              fontWeight: '600'
                            }}>
                              🎯 MCQ + CODE
                            </span>
                          )}
                          
                          {(!test.testType || test.testType === 'mcq') && (
                            <span style={{
                              background: 'var(--bg-hover)',
                              color: 'var(--text-muted)',
                              border: '1px solid var(--border-color)',
                              borderRadius: '6px',
                              padding: '2px 8px',
                              fontSize: '11px',
                              fontWeight: '600'
                            }}>
                              📝 MCQ
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{test.subject}</p>
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: '14px', color: 'var(--text-primary)' }} className="hidden md:table-cell">
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>{formatDateTime(test.startTime)}</p>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{formatDateTime(test.endTime)}</p>
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: '14px', color: 'var(--text-primary)', textAlign: 'center' }} className="hidden sm:table-cell">
                        <span style={{ color: 'var(--text-secondary)' }}>{test.duration}m</span>
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: '14px', color: 'var(--text-primary)', textAlign: 'center' }} className="hidden lg:table-cell">
                        <span style={{ color: 'var(--text-secondary)' }}>{test.questionCount || 0}</span>
                        {test.hasAnswerKey && <span style={{ marginLeft: '4px', color: 'var(--accent-green)', fontSize: '12px' }}>✓</span>}
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: '14px', color: 'var(--text-primary)', textAlign: 'center' }}>
                        <span style={{
                          background: status.bg,
                          color: status.color,
                          border: status.border,
                          borderRadius: '20px',
                          padding: '3px 12px',
                          fontSize: '12px',
                          fontWeight: '500',
                          display: 'inline-block'
                        }}>
                          {status.label}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: '14px', color: 'var(--text-primary)', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                          <Link to={`/admin/tests/${test._id}/edit`} title="Edit"
                            style={{ background: 'var(--bg-hover)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '7px', cursor: 'pointer', color: 'var(--text-secondary)', marginRight: '6px', display: 'flex' }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--border-input)'; e.currentTarget.style.color = 'var(--accent-amber)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                          >
                            <HiOutlinePencilSquare size={16} />
                          </Link>
                          <Link to={`/admin/tests/${test._id}/questions`} title="Questions"
                            style={{ background: 'var(--bg-hover)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '7px', cursor: 'pointer', color: 'var(--text-secondary)', marginRight: '6px', display: 'flex' }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--border-input)'; e.currentTarget.style.color = 'var(--accent-blue)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                          >
                            <HiOutlineDocumentText size={16} />
                          </Link>
                          <Link to={`/admin/tests/${test._id}/answerkey`} title="Answer Key"
                            style={{ background: 'var(--bg-hover)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '7px', cursor: 'pointer', color: 'var(--text-secondary)', marginRight: '6px', display: 'flex' }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--border-input)'; e.currentTarget.style.color = 'var(--accent-green)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                          >
                            <HiOutlineKey size={16} />
                          </Link>
                          <Link to={`/admin/results?testId=${test._id}`} title="Results"
                            style={{ background: 'var(--bg-hover)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '7px', cursor: 'pointer', color: 'var(--text-secondary)', marginRight: '6px', display: 'flex' }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--border-input)'; e.currentTarget.style.color = '#a855f7'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                          >
                            <HiOutlineChartBarSquare size={16} />
                          </Link>
                          <Link to={`/admin/tests/${test._id}/coding`} title="Coding Problems"
                            style={{ background: 'var(--bg-hover)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '7px', cursor: 'pointer', color: 'var(--text-secondary)', marginRight: '6px', display: 'flex' }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--border-input)'; e.currentTarget.style.color = '#06b6d4'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                          >
                            <HiOutlineCodeBracketSquare size={16} />
                          </Link>
                          <button onClick={() => openDeleteModal(test._id, test.title)} title="Delete"
                            style={{ background: 'var(--bg-hover)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '7px', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex' }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--border-input)'; e.currentTarget.style.color = 'var(--accent-red)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                          >
                            <HiOutlineTrash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={deleteModal.open}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title="Delete Test?"
        message={`Are you sure you want to delete "${deleteModal.title}"? This will permanently delete all questions, answer keys, and results for this test.`}
        confirmText="Delete Test"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
};

export default ManageTests;
