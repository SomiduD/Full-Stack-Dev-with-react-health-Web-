// client/src/pages/admin/tabs/DoctorsTab.jsx
import { useState, useEffect } from 'react';
import { getDoctors, createDoctor, updateDoctorStatus } from '../../../services/adminService';

const DoctorsTab = () => {
  const [doctors,  setDoctors]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [view,     setView]     = useState('list'); // 'list' | 'add'
  const [form,     setForm]     = useState({ email: '', password: '', profile: { firstName: '', lastName: '', specialization: '', department: '', licenseNumber: '', yearsExperience: '', gender: 'prefer_not_to_say', phone: '' } });
  const [formErr,  setFormErr]  = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    getDoctors()
      .then(r => { setDoctors(r.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(load, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setFormErr('');
    if (!form.email || !form.password || !form.profile.firstName || !form.profile.specialization) {
      setFormErr('Email, password, first name, and specialization are required.');
      return;
    }
    setSubmitting(true);
    try {
      await createDoctor(form);
      setView('list');
      load();
    } catch (err) {
      setFormErr(err.response?.data?.message || 'Failed to create doctor.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (id, current) => {
    try {
      await updateDoctorStatus(id, !current);
      load();
    } catch { /* ignore */ }
  };

  const setProfile = (k, v) => setForm(f => ({ ...f, profile: { ...f.profile, [k]: v } }));

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sp-6)' }}>
        <div>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: 4 }}>Doctor Management</h3>
          <p style={{ fontSize: '0.85rem' }}>Add, view, and manage doctor accounts in your hospital.</p>
        </div>
        {view === 'list'
          ? <button id="btn-add-doctor" type="button" className="btn btn-primary" onClick={() => setView('add')}>+ Add Doctor</button>
          : <button type="button" className="btn btn-ghost" onClick={() => setView('list')}>← Back to List</button>
        }
      </div>

      {/* Add Doctor Form */}
      {view === 'add' && (
        <div className="glass-card animate-scale-in" style={{ padding: 'var(--sp-6)', marginBottom: 'var(--sp-6)' }}>
          <h4 style={{ color: 'var(--text-primary)', marginBottom: 'var(--sp-5)' }}>New Doctor Account</h4>
          <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-4)' }}>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" className="form-input" placeholder="doctor@hospital.com"
                  value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Temporary Password</label>
                <input type="password" className="form-input" placeholder="Min 6 characters"
                  value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input type="text" className="form-input" value={form.profile.firstName}
                  onChange={e => setProfile('firstName', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input type="text" className="form-input" value={form.profile.lastName}
                  onChange={e => setProfile('lastName', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Specialization</label>
                <input type="text" className="form-input" placeholder="e.g. Cardiology"
                  value={form.profile.specialization} onChange={e => setProfile('specialization', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Department</label>
                <input type="text" className="form-input" placeholder="e.g. Internal Medicine"
                  value={form.profile.department} onChange={e => setProfile('department', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">License Number</label>
                <input type="text" className="form-input" value={form.profile.licenseNumber}
                  onChange={e => setProfile('licenseNumber', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input type="tel" className="form-input" value={form.profile.phone}
                  onChange={e => setProfile('phone', e.target.value)} />
              </div>
            </div>
            {formErr && <div className="alert alert-error">{formErr}</div>}
            <button id="btn-confirm-add-doctor" type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
              {submitting ? <><span className="spinner" /> Creating…</> : 'Create Doctor Account'}
            </button>
          </form>
        </div>
      )}

      {/* Doctor List */}
      {view === 'list' && (
        <>
          {loading && <div style={{ textAlign: 'center', padding: 'var(--sp-12)' }}><span className="spinner spinner-lg" /></div>}
          {!loading && doctors.length === 0 && (
            <div className="glass-card" style={{ padding: 'var(--sp-10)', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: 'var(--sp-3)' }}>🩺</div>
              <h4 style={{ color: 'var(--text-primary)', marginBottom: 'var(--sp-2)' }}>No doctors yet</h4>
              <p style={{ fontSize: '0.88rem', marginBottom: 'var(--sp-4)' }}>Add your first doctor using the button above.</p>
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
            {doctors.map(doc => (
              <div key={doc._id} className="glass-card animate-fade-in-up"
                style={{ padding: 'var(--sp-5)', display: 'flex', alignItems: 'center', gap: 'var(--sp-4)' }}>
                {/* Avatar */}
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, var(--indigo), #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff', fontSize: '1.1rem', flexShrink: 0 }}>
                  {doc.profile?.firstName?.[0]}{doc.profile?.lastName?.[0]}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Dr. {doc.profile?.firstName} {doc.profile?.lastName}</span>
                    <span className={`badge ${doc.isActive ? 'badge-emerald' : 'badge-red'}`}>{doc.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    {doc.profile?.specialization && <span>{doc.profile.specialization}</span>}
                    {doc.profile?.department && <span> · {doc.profile.department}</span>}
                    <span> · {doc.email}</span>
                  </div>
                </div>
                <button type="button" className="btn btn-sm"
                  onClick={() => toggleStatus(doc._id, doc.isActive)}
                  style={{ border: '1px solid var(--border-medium)', background: 'none', color: doc.isActive ? 'var(--red)' : 'var(--emerald)', flexShrink: 0 }}>
                  {doc.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default DoctorsTab;
