import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../../services/api';
import toast from 'react-hot-toast';
import { HiOutlineArrowLeft } from 'react-icons/hi2';

// Convert local datetime input to UTC ISO string
const localToUTC = (localDateTimeStr) => {
  if (!localDateTimeStr) return null;
  const localDate = new Date(localDateTimeStr);
  return localDate.toISOString();
};

// Convert UTC ISO string to local datetime-local
const utcToLocal = (utcDateStr) => {
  if (!utcDateStr) return '';
  const date = new Date(utcDateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const EditTest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testType, setTestType] = useState('mcq');
  const [form, setForm] = useState({
    title: '', description: '', subject: '',
    startTime: '', endTime: '', duration: 60,
    maxAttempts: 1, negativeMarking: false,
    marksPerQuestion: 1, negativeMarks: 0.25, status: 'draft',
  });

  useEffect(() => { fetchTest(); }, [id]);

  const fetchTest = async () => {
    try {
      const res = await API.get(`/tests/${id}`);
      const t = res.data.data;
      setTestType(t.testType || 'mcq');
      setForm({
        title: t.title || '',
        description: t.description || '',
        subject: t.subject || '',
        startTime: utcToLocal(t.startTime),
        endTime: utcToLocal(t.endTime),
        duration: t.duration || 60,
        maxAttempts: t.maxAttempts || 1,
        negativeMarking: t.negativeMarking || false,
        marksPerQuestion: t.marksPerQuestion || 1,
        negativeMarks: t.negativeMarks || 0.25,
        status: t.status || 'draft',
      });
    } catch (err) {
      toast.error('Failed to load test');
      navigate('/admin/tests');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        duration: Number(form.duration),
        maxAttempts: Number(form.maxAttempts),
        marksPerQuestion: Number(form.marksPerQuestion),
        negativeMarks: form.negativeMarking ? Number(form.negativeMarks) : 0,
        startTime: localToUTC(form.startTime) || undefined,
        endTime: localToUTC(form.endTime) || undefined,
        testType: testType,
      };
      await API.put(`/tests/${id}`, payload);
      toast.success('Test updated!');
      navigate('/admin/tests');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    try {
      const res = await API.put(`/tests/${id}/publish`);
      toast.success(res.data?.message || 'Test published successfully!');
      navigate('/admin/tests');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to publish test. Please try again.');
      console.error('Publish error:', err.response?.data);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
        <div style={{ width: 40, height: 40, border: '3px solid var(--accent-amber-bg)', borderTopColor: 'var(--accent-amber)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  const labelStyle = { color: 'var(--text-label)', fontSize: '13px', fontWeight: '600', marginBottom: '8px', display: 'block' };
  const inputStyle = { background: 'var(--bg-input)', border: '1px solid var(--border-input)', borderRadius: '10px', padding: '12px 16px', color: 'var(--text-primary)', fontSize: '14px', width: '100%', outline: 'none', boxSizing: 'border-box' };

  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-color)',
      borderRadius: '16px',
      padding: '32px',
      maxWidth: '720px',
      boxShadow: 'var(--shadow-sm)',
      margin: '0 auto'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
        <button onClick={() => navigate('/admin/tests')} style={{
          background: 'var(--bg-hover)', border: 'none', borderRadius: '10px',
          padding: '8px', cursor: 'pointer', color: 'var(--text-secondary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <HiOutlineArrowLeft size={20} />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px', fontFamily: "'Sora', sans-serif" }}>Edit Test</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Update test configuration</p>
        </div>
        {form.status === 'draft' && (
          <button onClick={handlePublish} style={{
            background: 'var(--accent-green)', color: '#ffffff', border: 'none', borderRadius: '10px', padding: '10px 20px', fontSize: '14px', fontWeight: '600', cursor: 'pointer'
          }}>
            Publish
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
          <div>
            <label htmlFor="et-title" style={labelStyle}>Test Title *</label>
            <input id="et-title" name="title" value={form.title} onChange={handleChange} required style={inputStyle} />
          </div>

          {/* Test Type */}
          <div style={{marginBottom: '24px'}}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '600',
              color: 'var(--text-label)',
              marginBottom: '12px'
            }}>Test Type *</label>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px'
            }}>
              {[
                { 
                  value: 'mcq', 
                  label: 'MCQ Only', 
                  icon: '📝',
                  desc: 'Multiple choice questions only'
                },
                { 
                  value: 'coding', 
                  label: 'Coding Only', 
                  icon: '💻',
                  desc: 'Programming problems only'
                },
                { 
                  value: 'combined', 
                  label: 'MCQ + Coding', 
                  icon: '🎯',
                  desc: 'Both sections combined'
                }
              ].map(opt => (
                <div
                  key={opt.value}
                  onClick={() => setTestType(opt.value)}
                  style={{
                    padding: '20px 16px',
                    borderRadius: '12px',
                    border: testType === opt.value
                      ? '2px solid var(--accent-blue)'
                      : '1px solid var(--border-color)',
                    background: testType === opt.value
                      ? 'var(--accent-blue-bg)'
                      : 'var(--bg-surface)',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.15s'
                  }}
                >
                  <div style={{fontSize: '28px', 
                    marginBottom: '8px'}}>
                    {opt.icon}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: testType === opt.value
                      ? 'var(--accent-blue)'
                      : 'var(--text-primary)',
                    marginBottom: '4px'
                  }}>{opt.label}</div>
                  <div style={{
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                    lineHeight: '1.4'
                  }}>{opt.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="et-desc" style={labelStyle}>Description</label>
            <textarea id="et-desc" name="description" value={form.description} onChange={handleChange} rows={3} style={{ ...inputStyle, resize: 'none' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label htmlFor="et-subject" style={labelStyle}>Subject</label>
              <input id="et-subject" name="subject" value={form.subject} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label htmlFor="et-status" style={labelStyle}>Status</label>
              <select id="et-status" name="status" value={form.status} onChange={handleChange} style={inputStyle}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', marginTop: '20px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>Schedule</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <div>
            <label htmlFor="et-start" style={labelStyle}>Start Time</label>
            <input id="et-start" name="startTime" type="datetime-local" value={form.startTime} onChange={handleChange} style={inputStyle} />
          </div>
          <div>
            <label htmlFor="et-end" style={labelStyle}>End Time</label>
            <input id="et-end" name="endTime" type="datetime-local" value={form.endTime} onChange={handleChange} style={inputStyle} />
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', marginTop: '20px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>Test Settings</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
          <div>
            <label htmlFor="et-dur" style={labelStyle}>Duration (min)</label>
            <input id="et-dur" name="duration" type="number" min="1" value={form.duration} onChange={handleChange} style={inputStyle} />
          </div>
          <div>
            <label htmlFor="et-att" style={labelStyle}>Max Attempts</label>
            <input id="et-att" name="maxAttempts" type="number" min="1" value={form.maxAttempts} onChange={handleChange} style={inputStyle} />
          </div>
          <div>
            <label htmlFor="et-mpq" style={labelStyle}>Marks/Question</label>
            <input id="et-mpq" name="marksPerQuestion" type="number" min="0" step="0.5" value={form.marksPerQuestion} onChange={handleChange} style={inputStyle} />
          </div>
        </div>

        {/* Negative Marking Toggle */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: 'var(--bg-hover)', borderRadius: '10px', border: '1px solid var(--border-color)', marginBottom: '24px'
        }}>
          <div style={{ position: 'relative', width: '40px', height: '24px', cursor: 'pointer' }}>
            <input type="checkbox" name="negativeMarking" checked={form.negativeMarking} onChange={handleChange} style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }} id="neg-mark-et" />
            <label htmlFor="neg-mark-et" style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              background: form.negativeMarking ? 'var(--accent-blue)' : 'var(--border-input)',
              borderRadius: '24px', cursor: 'pointer', transition: '0.2s'
            }}>
              <span style={{
                position: 'absolute', top: '2px', left: form.negativeMarking ? '18px' : '2px',
                width: '20px', height: '20px', background: '#ffffff', borderRadius: '50%',
                transition: '0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
              }} />
            </label>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: '500', marginBottom: '2px' }}>Negative Marking</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Deduct marks for wrong answers</p>
          </div>
          {form.negativeMarking && (
            <div style={{ width: '120px' }}>
              <label htmlFor="et-neg" style={labelStyle}>Deduct Marks</label>
              <input id="et-neg" name="negativeMarks" type="number" min="0" step="0.25" value={form.negativeMarks} onChange={handleChange} style={{ ...inputStyle, padding: '8px 12px' }} />
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '28px', paddingTop: '24px', borderTop: '1px solid var(--border-color)' }}>
          <button type="submit" disabled={saving} style={{
            background: 'var(--accent-blue)', color: '#ffffff', border: 'none', borderRadius: '10px', padding: '12px 24px', fontSize: '14px', fontWeight: '600', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1
          }}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button type="button" onClick={() => navigate('/admin/tests')} style={{
            background: 'transparent', color: 'var(--text-secondary)', border: 'none', padding: '12px 24px', fontSize: '14px', fontWeight: '500', cursor: 'pointer'
          }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditTest;
