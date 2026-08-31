// client/src/pages/admin/tabs/PatientsTab.jsx
import { useState, useEffect } from 'react';
import { getPatients } from '../../../services/adminService';

const PatientsTab = () => {
  const [patients, setPatients] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');

  const load = (q = '') => {
    setLoading(true);
    getPatients(q ? { search: q } : {})
      .then(r => { setPatients(r.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    if (!e.target.value) load('');
  };

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter') load(search);
  };

  return (
    <div>
      <div style={{ marginBottom: 'var(--sp-6)' }}>
        <h3 style={{ color: 'var(--text-primary)', marginBottom: 4 }}>Patients</h3>
        <p style={{ fontSize: '0.85rem' }}>All registered patients in your hospital.</p>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 'var(--sp-5)', display: 'flex', gap: 'var(--sp-2)' }}>
        <input id="input-patient-search" type="text" className="form-input" style={{ maxWidth: 320 }}
          placeholder="Search by name or email…"
          value={search} onChange={handleSearch} onKeyDown={handleSearchSubmit} />
        <button type="button" className="btn btn-ghost" onClick={() => load(search)}>Search</button>
      </div>

      {loading && <div style={{ textAlign: 'center', padding: 'var(--sp-12)' }}><span className="spinner spinner-lg" /></div>}

      {!loading && patients.length === 0 && (
        <div className="glass-card" style={{ padding: 'var(--sp-10)', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: 'var(--sp-3)' }}>🧑</div>
          <h4 style={{ color: 'var(--text-primary)', marginBottom: 'var(--sp-2)' }}>No patients found</h4>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--sp-3)' }}>
        {patients.map(p => (
          <div key={p._id} className="glass-card animate-fade-in-up" style={{ padding: 'var(--sp-5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', marginBottom: 'var(--sp-3)' }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, var(--cyan), #0080ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff', fontSize: '1rem', flexShrink: 0 }}>
                {p.profile?.firstName?.[0]}{p.profile?.lastName?.[0]}
              </div>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                  {p.profile?.firstName} {p.profile?.lastName}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{p.email}</div>
              </div>
              {p.profile?.bloodGroup && (
                <span className="badge badge-rose" style={{ marginLeft: 'auto' }}>🩸 {p.profile.bloodGroup}</span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
              {p.profile?.phone && <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>📞 {p.profile.phone}</span>}
              {p.profile?.gender && <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>👤 {p.profile.gender}</span>}
              {p.profile?.allergies?.length > 0 && (
                <span style={{ fontSize: '0.78rem', color: 'var(--rose)' }}>⚠️ {p.profile.allergies.join(', ')}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PatientsTab;
