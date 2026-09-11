import { useTheme } from '../../context/ThemeContext';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import toast from 'react-hot-toast';
import {
  HiOutlineClipboardDocumentList,
  HiOutlineArrowLeft,
} from 'react-icons/hi2';

// Convert local datetime input to UTC ISO string
const localToUTC = (localDateTimeStr) => {
  if (!localDateTimeStr) return null;
  const localDate = new Date(localDateTimeStr);
  return localDate.toISOString();
};

const CreateTest = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [testType, setTestType] = useState('mcq');
  const [form, setForm] = useState({
    title: '',
    description: '',
    subject: '',
    startTime: '',
    endTime: '',
    duration: 60,
    maxAttempts: 1,
    negativeMarking: false,
    marksPerQuestion: 1,
    negativeMarks: 0.25,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required');
    if (!form.duration || form.duration < 1) return toast.error('Duration must be at least 1 minute');

    setLoading(true);
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
      const res = await API.post('/tests', payload);
      toast.success('Test created successfully!');
      
      const testId = res.data.data._id;
      if (testType === 'mcq') {
        navigate(`/admin/tests/${testId}/questions`);
      } else if (testType === 'coding') {
        navigate(`/admin/tests/${testId}/coding`);
      } else if (testType === 'combined') {
        navigate(`/admin/tests/${testId}/questions`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create test');
    } finally {
      setLoading(false);
    }
  };

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
      <div style={{
        display: 'flex', alignItems: 'center',
        gap: '12px', marginBottom: '28px'
      }}>
        <button onClick={() => navigate('/admin/tests')} style={{
          background: 'var(--bg-hover)', border: 'none', borderRadius: '10px',
          padding: '8px', cursor: 'pointer', color: 'var(--text-secondary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--border-input)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
        >
          <HiOutlineArrowLeft size={20} />
        </button>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px', fontFamily: "'Sora', sans-serif" }}>Create New Test</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Set up test details, then add questions</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="ct-title" style={labelStyle}>Test Title *</label>
          <input id="ct-title" name="title" value={form.title} onChange={handleChange} required
            style={inputStyle}
            placeholder="e.g. Data Structures Mid-Term 2025" />
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
        
        {/* Description */}
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="ct-desc" style={labelStyle}>Description</label>
          <textarea id="ct-desc" name="description" value={form.description} onChange={handleChange} rows={3}
            style={{ ...inputStyle, resize: 'none' }}
            placeholder="Brief description of the test (optional)" />
        </div>

        {/* Subject */}
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="ct-subject" style={labelStyle}>Subject</label>
          <input id="ct-subject" name="subject" value={form.subject} onChange={handleChange}
            style={inputStyle}
            placeholder="e.g. Computer Science" />
        </div>

        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', marginTop: '20px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>Schedule</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <div>
            <label htmlFor="ct-start" style={labelStyle}>Start Time</label>
            <input id="ct-start" name="startTime" type="datetime-local" value={form.startTime} onChange={handleChange}
              style={inputStyle} />
          </div>
          <div>
            <label htmlFor="ct-end" style={labelStyle}>End Time</label>
            <input id="ct-end" name="endTime" type="datetime-local" value={form.endTime} onChange={handleChange}
              style={inputStyle} />
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', marginTop: '20px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>Test Settings</h3>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
          <div>
            <label htmlFor="ct-dur" style={labelStyle}>Duration (minutes) *</label>
            <input id="ct-dur" name="duration" type="number" min="1" value={form.duration} onChange={handleChange} required
              style={inputStyle} />
          </div>
          <div>
            <label htmlFor="ct-attempts" style={labelStyle}>Max Attempts</label>
            <input id="ct-attempts" name="maxAttempts" type="number" min="1" value={form.maxAttempts} onChange={handleChange}
              style={inputStyle} />
          </div>
          <div>
            <label htmlFor="ct-mpq" style={labelStyle}>Marks per Q</label>
            <input id="ct-mpq" name="marksPerQuestion" type="number" min="0" step="0.5" value={form.marksPerQuestion} onChange={handleChange}
              style={inputStyle} />
          </div>
        </div>

        {/* Negative Marking Toggle */}
        <div style={{
          display: 'flex', alignItems: 'center',
          gap: '12px', padding: '16px',
          background: 'var(--bg-hover)',
          borderRadius: '10px',
          border: '1px solid var(--border-color)',
          marginBottom: '24px'
        }}>
          <div style={{ position: 'relative', width: '40px', height: '24px', cursor: 'pointer' }}>
            <input type="checkbox" name="negativeMarking" checked={form.negativeMarking} onChange={handleChange}
              style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }} id="neg-mark" />
            <label htmlFor="neg-mark" style={{
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
            <p style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: '500', marginBottom: '2px' }}>
              Negative Marking
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
              Deduct marks for wrong answers
            </p>
          </div>
          {form.negativeMarking && (
            <div style={{ width: '120px' }}>
              <label htmlFor="ct-neg" style={labelStyle}>Deduct Marks</label>
              <input id="ct-neg" name="negativeMarks" type="number" min="0" step="0.25" value={form.negativeMarks} onChange={handleChange}
                style={{...inputStyle, padding: '8px 12px'}} />
            </div>
          )}
        </div>

        {/* Bottom buttons */}
        <div style={{
          display: 'flex', gap: '12px',
          marginTop: '28px',
          paddingTop: '24px',
          borderTop: '1px solid var(--border-color)'
        }}>
          <button type="submit" disabled={loading} style={{
            background: 'var(--accent-blue)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '10px',
            padding: '12px 24px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            opacity: loading ? 0.7 : 1
          }}>
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '16px', height: '16px', border: '2px solid var(--text-muted)', borderTopColor: '#ffffff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                Creating...
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
              </span>
            ) : (
              <>
                <HiOutlineClipboardDocumentList size={18} />
                Create Test & Add Questions
              </>
            )}
          </button>
          <button type="button" onClick={() => navigate('/admin/tests')} style={{
            background: 'transparent',
            color: 'var(--text-secondary)',
            border: 'none',
            padding: '12px 24px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer'
          }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTest;
