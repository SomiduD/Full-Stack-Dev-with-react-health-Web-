// client/src/pages/admin/tabs/PatientsTab.jsx
import { useState, useEffect } from 'react';
import { getPatients } from '../../../services/adminService';

const BLOOD_COLORS = {
  'A+':'var(--rose)', 'A-':'var(--rose)', 'B+':'var(--indigo)', 'B-':'var(--indigo)',
  'O+':'var(--cyan)', 'O-':'var(--cyan)', 'AB+':'var(--emerald)', 'AB-':'var(--emerald)',
};

function PatientCard({ p }) {
  const initials = `${p.profile?.firstName?.[0] || ''}${p.profile?.lastName?.[0] || ''}`;
  const age = p.profile?.dateOfBirth
    ? Math.floor((Date.now() - new Date(p.profile.dateOfBirth).getTime()) / 31557600000)
    : null;

  return (
    <div className="glass-card animate-fade-in-up"
      style={{ padding: 'var(--sp-5)', transition: 'transform var(--t-base)' }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', marginBottom: 'var(--sp-3)' }}>
        <div style={{
          width: 46, height: 46, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--cyan), #0080ff)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 800, color: '#fff', fontSize: '1rem', flexShrink: 0,
        }}>
          {initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem', marginBottom: 2 }}>
            {p.profile?.firstName} {p.profile?.lastName}
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {p.email}
          </div>
        </div>
        {p.profile?.bloodGroup && (
          <div style={{
            padding: '4px 10px', borderRadius: 'var(--r-full)', flexShrink: 0,
            background: `${BLOOD_COLORS[p.profile.bloodGroup] || 'var(--rose)'}15`,
            border: `1px solid ${BLOOD_COLORS[p.profile.bloodGroup] || 'var(--rose)'}40`,
            color: BLOOD_COLORS[p.profile.bloodGroup] || 'var(--rose)',
            fontSize: '0.78rem', fontWeight: 700,
          }}>
            🩸 {p.profile.bloodGroup}
          </div>
        )}
      </div>

      {/* Details row */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', gap: 'var(--sp-4)', flexWrap: 'wrap' }}>
          {p.profile?.phone && (
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
              📞 {p.profile.phone}
            </span>
          )}
          {p.profile?.gender && (
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
              👤 {p.profile.gender}
            </span>
          )}
          {age && (
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              🎂 {age} yrs
            </span>
          )}
        </div>

        {/* Allergies */}
        {p.profile?.allergies?.length > 0 && (
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 4 }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--rose)', fontWeight: 600 }}>⚠️ Allergies:</span>
            {p.profile.allergies.map((a) => (
              <span key={a} style={{
                fontSize: '0.72rem', padding: '2px 7px', borderRadius: 'var(--r-full)',
                background: 'rgba(251,113,133,0.1)', color: 'var(--rose)',
                border: '1px solid rgba(251,113,133,0.25)',
              }}>
                {a}
              </span>
            ))}
          </div>
        )}

        {/* Emergency contact */}
        {p.profile?.emergencyContact?.name && (
          <div style={{ marginTop: 4, paddingTop: 8, borderTop: '1px solid var(--border-subtle)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            🆘 Emergency: <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{p.profile.emergencyContact.name}</span>
            {p.profile.emergencyContact.relation && ` (${p.profile.emergencyContact.relation})`}
            {p.profile.emergencyContact.phone && ` · ${p.profile.emergencyContact.phone}`}
          </div>
        )}
      </div>
    </div>
  );
}

const PatientsTab = () => {
  const [patients, setPatients] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [error,    setError]    = useState(null);

  const load = (q = '') => {
    setLoading(true);
    setError(null);
    getPatients(q ? { search: q } : {})
      .then(r => { setPatients(r.data || []); setLoading(false); })
      .catch(e => { setError(e.response?.data?.message || 'Failed to load patients.'); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const handleKey = (e) => {
    if (e.key === 'Enter') load(search);
    if (e.key === 'Escape') { setSearch(''); load(''); }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sp-6)', flexWrap: 'wrap', gap: 'var(--sp-3)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', marginBottom: 4 }}>
            <h3 style={{ color: 'var(--text-primary)' }}>🧑 Patients</h3>
            {!loading && patients.length > 0 && (
              <span style={{
                fontSize: '0.75rem', padding: '3px 10px', borderRadius: 'var(--r-full)',
                background: 'rgba(0,212,255,0.1)', color: 'var(--cyan)',
                border: '1px solid rgba(0,212,255,0.25)', fontWeight: 600,
              }}>
                {patients.length} registered
              </span>
            )}
          </div>
          <p style={{ fontSize: '0.85rem' }}>All registered patients in Nawaloka General Hospital.</p>
        </div>

        {/* Search */}
        <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
          <input id="input-patient-search" type="text" className="form-input" style={{ width: 260 }}
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); if (!e.target.value) load(''); }}
            onKeyDown={handleKey}
          />
          <button type="button" className="btn btn-ghost" onClick={() => load(search)}>🔍 Search</button>
        </div>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: 'var(--sp-4)' }}>{error}</div>}

      {loading && (
        <div style={{ textAlign: 'center', padding: 'var(--sp-12)' }}>
          <span className="spinner spinner-lg" />
          <p style={{ marginTop: 'var(--sp-3)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Loading patients…</p>
        </div>
      )}

      {!loading && patients.length === 0 && (
        <div className="glass-card" style={{ padding: 'var(--sp-10)', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: 'var(--sp-3)' }}>🧑</div>
          <h4 style={{ color: 'var(--text-primary)', marginBottom: 'var(--sp-2)' }}>
            {search ? `No patients matching "${search}"` : 'No patients registered yet'}
          </h4>
          {search && (
            <button type="button" className="btn btn-ghost" onClick={() => { setSearch(''); load(''); }}>
              Clear search
            </button>
          )}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--sp-4)' }} className="stagger">
        {patients.map(p => <PatientCard key={p._id} p={p} />)}
      </div>
    </div>
  );
};

export default PatientsTab;
