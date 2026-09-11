import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../../services/api';
import toast from 'react-hot-toast';
import {
  HiOutlineArrowLeft,
  HiOutlineArrowUpTray,
  HiOutlineArrowDownTray,
} from 'react-icons/hi2';

const UploadQuestions = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [testTitle, setTestTitle] = useState('');
  const [testType, setTestType] = useState('');
  const [activeTab, setActiveTab] = useState('manual');
  const [existing, setExisting] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Manual entry state
  const emptyQ = { questionNo: '', questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', optionE: '', showOptionE: false, marks: 1 };
  const [questions, setQuestions] = useState([{ ...emptyQ }]);

  // CSV state
  const [csvFile, setCsvFile] = useState(null);
  const [csvPreview, setCsvPreview] = useState([]);
  const [csvUploading, setCsvUploading] = useState(false);

  useEffect(() => { fetchExisting(); }, [id]);

  const fetchExisting = async () => {
    try {
      const [testRes, qRes] = await Promise.all([
        API.get(`/tests/${id}`),
        API.get(`/tests/${id}/questions`),
      ]);
      setTestTitle(testRes.data.data.title);
      setTestType(testRes.data.data.testType);
      setExisting(qRes.data.data);
    } catch (err) {
      toast.error('Failed to load test');
      navigate('/admin/tests');
    } finally {
      setLoading(false);
    }
  };

  // --- Manual Entry ---
  const updateQuestion = (idx, field, value) => {
    setQuestions((prev) => prev.map((q, i) => i === idx ? { ...q, [field]: value } : q));
  };

  const addQuestion = () => setQuestions((prev) => [...prev, { ...emptyQ }]);

  const removeQuestion = (idx) => {
    if (questions.length === 1) return;
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleManualSubmit = async () => {
    const valid = questions.every((q) => q.questionText && q.optionA && q.optionB && q.optionC && q.optionD);
    if (!valid) return toast.error('All required question fields (A, B, C, D) must be filled');

    setSubmitting(true);
    try {
      const payload = questions.map((q, idx) => ({
        ...q,
        questionNo: q.questionNo ? Number(q.questionNo) : (existing.length + idx + 1),
        optionE: q.showOptionE ? q.optionE : '',
        marks: Number(q.marks) || 1,
      }));
      const res = await API.post(`/tests/${id}/questions`, { questions: payload });
      toast.success(res.data.message);
      setQuestions([{ ...emptyQ }]);
      fetchExisting();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add questions');
    } finally {
      setSubmitting(false);
    }
  };

  // --- CSV ---
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCsvFile(file);

    // Local preview
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target.result;
      const lines = text.split('\n').filter((l) => l.trim());
      if (lines.length < 2) { setCsvPreview([]); return; }
      const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
      const rows = lines.slice(1).map((line) => {
        const vals = line.split(',').map((v) => v.trim());
        const obj = {};
        headers.forEach((h, i) => { obj[h] = vals[i] || ''; });
        return obj;
      });
      setCsvPreview(rows.slice(0, 20));
    };
    reader.readAsText(file);
  };

  const handleCsvUpload = async () => {
    if (!csvFile) return toast.error('Select a CSV file first');
    setCsvUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', csvFile);
      const res = await API.post(`/tests/${id}/questions/csv`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(res.data.message);
      setCsvFile(null);
      setCsvPreview([]);
      if (fileRef.current) fileRef.current.value = '';
      fetchExisting();
    } catch (err) {
      toast.error(err.response?.data?.message || 'CSV upload failed');
    } finally {
      setCsvUploading(false);
    }
  };

  const downloadSampleCSV = () => {
    const csv = 'questionNo,questionText,optionA,optionB,optionC,optionD,optionE,marks\n1,What is a primary key?,Unique identifier,Foreign key,Index,Constraint,,1\n2,Which SQL command retrieves data?,INSERT,UPDATE,SELECT,DELETE,,1\n3,What does NULL mean in SQL?,Zero value,Empty string,Unknown value,False value,No value,1';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'sample_questions.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
        <div style={{ width: 40, height: 40, border: '3px solid var(--accent-amber-bg)', borderTopColor: 'var(--accent-amber)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  const labelStyle = { display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' };
  const inputStyle = { width: '100%', padding: '10px 14px', background: 'var(--bg-input)', border: '1px solid var(--border-input)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none', boxSizing: 'border-box' };
  const thStyle = { padding: '12px 20px', fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'left' };
  const tdStyle = { padding: '14px 20px', fontSize: '14px', color: 'var(--text-primary)' };

  return (
    <div style={{ padding: '32px 40px', maxWidth: '900px', margin: '0 auto' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
        <button onClick={() => navigate('/admin/tests')} style={{ background: 'var(--bg-hover)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '8px', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
          <HiOutlineArrowLeft size={16} />
        </button>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '2px', fontFamily: "'Sora', sans-serif" }}>Upload Questions</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{testTitle} · {existing.length} questions added</p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-hover)', borderRadius: '10px', padding: '4px', marginBottom: '24px', width: 'fit-content', border: '1px solid var(--border-color)' }}>
        <button onClick={() => setActiveTab('manual')} style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '500', background: activeTab === 'manual' ? 'var(--accent-blue)' : 'transparent', color: activeTab === 'manual' ? '#ffffff' : 'var(--text-secondary)' }}>
          Manual Entry
        </button>
        <button onClick={() => setActiveTab('csv')} style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '500', background: activeTab === 'csv' ? 'var(--accent-blue)' : 'transparent', color: activeTab === 'csv' ? '#ffffff' : 'var(--text-secondary)' }}>
          CSV Upload
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'manual' ? (
        <div>
          {questions.map((q, idx) => (
            <div key={idx} className="question-card" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '24px', marginBottom: '16px', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>Question {idx + 1}</h3>
                {questions.length > 1 && (
                  <button onClick={() => removeQuestion(idx)} style={{ background: 'var(--accent-red-bg)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '6px 12px', color: 'var(--accent-red)', cursor: 'pointer', fontSize: '13px' }}>
                    Remove
                  </button>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr 100px', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={labelStyle}>Q. No</label>
                  <input type="number" value={q.questionNo} onChange={(e) => updateQuestion(idx, 'questionNo', e.target.value)} placeholder="Auto" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Question Text *</label>
                  <input value={q.questionText} onChange={(e) => updateQuestion(idx, 'questionText', e.target.value)} required placeholder="Enter question text" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Marks</label>
                  <input type="number" value={q.marks} onChange={(e) => updateQuestion(idx, 'marks', e.target.value)} min="0" style={inputStyle} />
                </div>
              </div>

              {/* Options A B C D */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                {['A', 'B', 'C', 'D'].map((opt) => (
                  <div key={opt}>
                    <label style={labelStyle}>Option {opt} *</label>
                    <input value={q[`option${opt}`]} onChange={(e) => updateQuestion(idx, `option${opt}`, e.target.value)} required placeholder={`Option ${opt}`} style={inputStyle} />
                  </div>
                ))}
              </div>

              {/* Option E — toggle */}
              {!q.showOptionE ? (
                <button
                  type="button"
                  onClick={() => updateQuestion(idx, 'showOptionE', true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'transparent',
                    border: '1px dashed var(--border-input)',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    color: 'var(--text-muted)',
                    fontSize: '13px',
                    cursor: 'pointer',
                    marginBottom: '12px'
                  }}
                >
                  + Add Option E (optional)
                </button>
              ) : (
                <div style={{marginBottom: '12px'}}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '6px'
                  }}>
                    <label style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color: 'var(--accent-blue)',
                      textTransform: 'uppercase'
                    }}>Option E (optional)</label>
                    <button
                      type="button"
                      onClick={() => {
                        updateQuestion(idx, 'showOptionE', false);
                        updateQuestion(idx, 'optionE', '');
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--accent-red)',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Remove E
                    </button>
                  </div>
                  <input
                    value={q.optionE || ''}
                    onChange={(e) => updateQuestion(idx, 'optionE', e.target.value)}
                    placeholder="Option E (optional)"
                    style={{
                      ...inputStyle,
                      border: '1px solid var(--accent-blue)'
                    }}
                  />
                </div>
              )}
            </div>
          ))}

          <div style={{ display: 'flex', gap: '12px', marginTop: '8px', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
            <button onClick={addQuestion} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-hover)', border: '1px solid var(--border-input)', borderRadius: '10px', padding: '11px 20px', color: 'var(--text-primary)', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>
              + Add Another Question
            </button>
            <button onClick={handleManualSubmit} disabled={submitting} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--accent-blue)', border: 'none', borderRadius: '10px', padding: '11px 24px', color: '#ffffff', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
              {submitting ? 'Submitting...' : `Submit ${questions.length} Question(s)`}
            </button>
          </div>
        </div>
      ) : (
        <div className="question-card" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{
            padding: '12px 16px',
            background: 'rgba(79,142,247,0.08)',
            border: '1px solid rgba(79,142,247,0.15)',
            borderRadius: '10px',
            marginBottom: '16px',
            fontSize: '13px',
            color: 'var(--text-secondary)'
          }}>
            ℹ️ CSV supports both 4-option and 5-option questions. For 4-option questions, leave the optionE column empty.
            Column order: questionNo, questionText, optionA, optionB, optionC, optionD, optionE, marks
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '20px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>Upload CSV File</label>
              <input ref={fileRef} type="file" accept=".csv" onChange={handleFileChange} style={{ display: 'block', width: '100%', padding: '10px', background: 'var(--bg-input)', border: '1px solid var(--border-input)', borderRadius: '8px', color: 'var(--text-primary)' }} />
            </div>
            <button onClick={downloadSampleCSV} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-hover)', border: '1px solid var(--border-input)', borderRadius: '8px', padding: '10px 16px', color: 'var(--text-primary)', fontSize: '13px', fontWeight: '500', cursor: 'pointer', marginTop: '28px' }}>
              <HiOutlineArrowDownTray size={16} /> Sample CSV
            </button>
          </div>

          {csvPreview.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '12px' }}>Preview ({csvPreview.length} rows)</h3>
              <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-hover)' }}>
                      <th style={thStyle}>#</th>
                      <th style={thStyle}>Question</th>
                      <th style={thStyle}>A</th>
                      <th style={thStyle}>B</th>
                      <th style={thStyle}>C</th>
                      <th style={thStyle}>D</th>
                      <th style={thStyle}>E</th>
                    </tr>
                  </thead>
                  <tbody>
                    {csvPreview.map((row, i) => {
                      const getField = (r, field) => {
                        const key = Object.keys(r).find(
                          k => k.toLowerCase().trim() === field.toLowerCase()
                        );
                        return key ? r[key] : '';
                      };
                      return (
                        <tr key={i} style={{ borderTop: '1px solid var(--border-color)' }}>
                          <td style={tdStyle}>{getField(row,'questionno') || i+1}</td>
                          <td style={tdStyle}>{getField(row,'questiontext')}</td>
                          <td style={tdStyle}>{getField(row,'optiona')}</td>
                          <td style={tdStyle}>{getField(row,'optionb')}</td>
                          <td style={tdStyle}>{getField(row,'optionc')}</td>
                          <td style={tdStyle}>{getField(row,'optiond')}</td>
                          <td style={tdStyle}>{getField(row,'optione') || '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <button onClick={handleCsvUpload} disabled={!csvFile || csvUploading} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--accent-blue)', border: 'none', borderRadius: '10px', padding: '11px 24px', color: '#ffffff', fontSize: '14px', fontWeight: '600', cursor: 'pointer', opacity: (!csvFile || csvUploading) ? 0.5 : 1 }}>
            <HiOutlineArrowUpTray size={16} /> {csvUploading ? 'Uploading...' : 'Confirm Upload'}
          </button>
        </div>
      )}

      {/* Existing Questions Table */}
      {existing.length > 0 && (
        <div style={{ marginTop: '32px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>Existing Questions ({existing.length})</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-hover)' }}>
                  <th style={thStyle}>#</th>
                  <th style={thStyle}>Question</th>
                  <th style={thStyle}>A</th>
                  <th style={thStyle}>B</th>
                  <th style={thStyle}>C</th>
                  <th style={thStyle}>D</th>
                  <th style={thStyle}>E</th>
                  <th style={thStyle}>Marks</th>
                </tr>
              </thead>
              <tbody>
                {existing.map((q, i) => (
                  <tr key={q._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={tdStyle}>{q.questionNo}</td>
                    <td style={tdStyle}>{q.questionText}</td>
                    <td style={tdStyle}>{q.optionA}</td>
                    <td style={tdStyle}>{q.optionB}</td>
                    <td style={tdStyle}>{q.optionC}</td>
                    <td style={tdStyle}>{q.optionD}</td>
                    <td style={tdStyle}>{q.optionE || '—'}</td>
                    <td style={tdStyle}>{q.marks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Banner for Combined Tests */}
      {testType === 'combined' && existing.length > 0 && (
        <div style={{
          marginTop: '24px',
          padding: '20px 24px',
          background: 'var(--accent-blue-bg)',
          border: '1px solid var(--accent-blue-border)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <p style={{
              fontSize: '14px',
              fontWeight: '600',
              color: 'var(--text-primary)',
              marginBottom: '4px'
            }}>
              ✅ MCQ Section Ready ({existing.length} questions)
            </p>
            <p style={{
              fontSize: '13px',
              color: 'var(--text-secondary)'
            }}>
              This is a Combined Test. 
              Now add coding problems to 
              complete the setup.
            </p>
          </div>
          <button
            onClick={() => navigate(`/admin/tests/${id}/coding`)}
            style={{
              background: 'var(--accent-blue)',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              padding: '11px 24px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            Add Coding Problems →
          </button>
        </div>
      )}

    </div>
  );
};

export default UploadQuestions;
