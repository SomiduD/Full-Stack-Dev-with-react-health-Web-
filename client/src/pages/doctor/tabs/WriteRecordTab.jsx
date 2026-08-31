// client/src/pages/doctor/tabs/WriteRecordTab.jsx
import { useState, useEffect } from 'react';
import { getDoctorsInHospital } from '../../../services/healthRecordService';
import { createRecord } from '../../../services/healthRecordService';
import api from '../../../services/api';

const RECORD_TYPES = [
  { value: 'prescription', label: '💊 Prescription', color: 'var(--amber)' },
  { value: 'lab',          label: '🧪 Lab Report',   color: 'var(--cyan)' },
  { value: 'imaging',      label: '🩻 Imaging',      color: 'var(--indigo)' },
  { value: 'discharge',    label: '📋 Discharge',    color: 'var(--rose)' },
  { value: 'vaccination',  label: '💉 Vaccination',  color: 'var(--emerald)' },
  { value: 'other',        label: '📄 Other',        color: 'var(--text-muted)' },
];

const WriteRecordTab = () => {
  const [patients,  setPatients]  = useState([]);
  const [form,      setForm]      = useState({ patientId: '', type: 'prescription', title: '', description: '', tags: '', date: new Date().toISOString().split('T')[0] });
  const [error,     setError]     = useState('');
  const [success,   setSuccess]   = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Load patients from the hospital
    api.get('/admin/patients').catch(() =>
      api.get('/doctors').then(() => {}) // fallback — use search
    );
    // Load patients via admin endpoint (requires hospital_admin) or query all patients
    api.get('/admin/patients')
      .then(r => setPatients(r.data?.data || []))
      .catch(() => setPatients([]));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!form.patientId || !form.title.trim()) {
      setError('Patient and title are required.');
      return;
    }
    setSubmitting(true);
    try {
      const tags = form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
      await createRecord({ ...form, tags });
      setSuccess('Health record added successfully!');
      setForm(f => ({ ...f, patientId: '', title: '', description: '', tags: '' }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add record.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 'var(--sp-6)' }}>
        <h3 style={{ color: 'var(--text-primary)', marginBottom: 4 }}>Add Health Record</h3>
        <p style={{ fontSize: '0.85rem' }}>Add a prescription, lab result, or medical note for a patient.</p>
      </div>

      <div className="glass-card animate-scale-in" style={{ padding: 'var(--sp-6)', maxWidth: 640 }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>

          {/* Record type */}
          <div className="form-group">
            <label className="form-label">Record Type</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-2)' }}>
              {RECORD_TYPES.map(({ value, label, color }) => (
                <button key={value} type="button"
                  onClick={() => setForm(f => ({ ...f, type: value }))}
                  style={{
                    padding: '7px 14px', borderRadius: 'var(--r-md)', fontSize: '0.82rem',
                    border: form.type === value ? `1.5px solid ${color}` : '1px solid var(--border-medium)',
                    background: form.type === value ? `${color}15` : 'var(--bg-surface)',
                    color: form.type === value ? color : 'var(--text-secondary)',
                    fontWeight: form.type === value ? 600 : 400,
                    cursor: 'pointer', transition: 'all var(--t-fast)',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Patient selector */}
          <div className="form-group">
            <label className="form-label">Patient</label>
            <select id="select-patient" className="form-input form-select"
              value={form.patientId} onChange={e => setForm(f => ({ ...f, patientId: e.target.value }))}>
              <option value="">Select patient…</option>
              {patients.map(p => (
                <option key={p._id} value={p._id}>
                  {p.profile?.firstName} {p.profile?.lastName} — {p.email}
                </option>
              ))}
            </select>
            {patients.length === 0 && (
              <p style={{ fontSize: '0.78rem', color: 'var(--amber)', marginTop: 4 }}>
                ⚠️ Patient list requires Hospital Admin access. Add patient ID manually in Title if needed.
              </p>
            )}
          </div>

          {/* Title + Date */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 'var(--sp-3)' }}>
            <div className="form-group">
              <label className="form-label">Title / Diagnosis</label>
              <input id="input-record-title" type="text" className="form-input"
                placeholder="e.g. Amoxicillin 500mg — 5 days"
                value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input id="input-record-date" type="date" className="form-input"
                value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Notes / Instructions</label>
            <textarea id="input-record-desc" className="form-input" rows={4}
              placeholder="Dosage, instructions, clinical notes…"
              value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              style={{ resize: 'vertical' }} />
          </div>

          {/* Tags */}
          <div className="form-group">
            <label className="form-label">Tags (comma separated)</label>
            <input type="text" className="form-input"
              placeholder="e.g. antibiotic, chest-infection, follow-up"
              value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} />
          </div>

          {error   && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <button id="btn-submit-record" type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
            {submitting ? <><span className="spinner" /> Saving…</> : '💾 Save Health Record'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default WriteRecordTab;
