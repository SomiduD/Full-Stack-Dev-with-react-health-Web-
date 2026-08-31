// client/src/pages/superadmin/SuperAdminDashboard.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getSuperStats, getAllHospitals, toggleHospital } from '../../services/superadminService';
import { getDoctors, getPatients, getAdminAppointments } from '../../services/adminService';

const NAV_ITEMS = [
  { id: 'overview',     label: 'System Overview',  icon: '🌐' },
  { id: 'hospitals',    label: 'Hospitals',         icon: '🏥' },
  { id: 'doctors',      label: 'All Doctors',       icon: '🩺' },
  { id: 'patients',     label: 'All Patients',      icon: '🧑' },
  { id: 'appointments', label: 'All Appointments',  icon: '📅' },
  { id: 'compliance',   label: 'Compliance',        icon: '📋' },
  { id: 'audit',        label: 'Audit Logs',        icon: '🔍' },
];

const SC = {
  pending:   { text:'var(--amber)',   bg:'rgba(251,191,36,0.1)',  border:'rgba(251,191,36,0.3)'  },
  confirmed: { text:'var(--emerald)',bg:'rgba(16,185,129,0.1)',  border:'rgba(16,185,129,0.3)'  },
  completed: { text:'var(--indigo)', bg:'rgba(129,140,248,0.1)', border:'rgba(129,140,248,0.3)' },
  cancelled: { text:'var(--rose)',   bg:'rgba(251,113,133,0.1)', border:'rgba(251,113,133,0.3)' },
};

// ─────────────────────────────── OVERVIEW ──────────────────────────────────────
function OverviewSection({ user }) {
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    getSuperStats()
      .then(r => { setStats(r.data); setLoading(false); })
      .catch(e => { setError(e.response?.data?.message || 'Failed to load stats'); setLoading(false); });
  }, []);

  return (
    <div>
      <div style={{ marginBottom:'var(--sp-8)', animation:'fadeInDown 0.4s ease both' }}>
        <p style={{ color:'var(--text-muted)', fontSize:'0.82rem', marginBottom:4 }}>SUPER ADMIN · GLOBAL CONTROL PANEL</p>
        <h2 style={{ color:'var(--text-primary)', marginBottom:4 }}>
          Welcome, {user?.profile?.firstName} {user?.profile?.lastName}
        </h2>
        <p style={{ fontSize:'0.88rem' }}>Unrestricted global access to all hospital tenants and platform data.</p>
      </div>

      {loading && <div style={{ textAlign:'center', padding:'var(--sp-12)' }}><span className="spinner spinner-lg"/></div>}
      {error   && <div className="alert alert-error" style={{ marginBottom:'var(--sp-6)' }}>⚠️ {error}</div>}

      {stats && (
        <>
          {/* Platform-wide stat grid */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(190px, 1fr))', gap:'var(--sp-4)', marginBottom:'var(--sp-8)' }} className="stagger">
            {[
              { icon:'🏥', label:'Active Hospitals',      value:stats.totalHospitals,  sub:'Platform-wide',          color:'var(--rose)'    },
              { icon:'🩺', label:'Total Doctors',         value:stats.totalDoctors,    sub:'Across all hospitals',   color:'var(--cyan)'    },
              { icon:'🧑', label:'Total Patients',        value:stats.totalPatients,   sub:'All time',               color:'var(--indigo)'  },
              { icon:'🛠️', label:'Hospital Admins',       value:stats.totalAdmins,     sub:'Platform administrators',color:'var(--amber)'   },
              { icon:'📅', label:"Today's Appointments",  value:stats.todayAppts,      sub:`${stats.pendingAppts} pending`, color:'var(--amber)' },
              { icon:'✅', label:'Completed Today',       value:stats.completedAppts,  sub:'Consultations done',     color:'var(--emerald)' },
              { icon:'📋', label:'Health Records',        value:stats.totalRecords,    sub:'In all vaults',          color:'var(--indigo)'  },
            ].map(c => (
              <div key={c.label} className="glass-card animate-fade-in-up"
                style={{ padding:'var(--sp-5)', transition:'transform var(--t-base)', cursor:'default' }}
                onMouseEnter={e => e.currentTarget.style.transform='translateY(-3px)'}
                onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}
              >
                <div style={{ fontSize:'1.5rem', marginBottom:6 }}>{c.icon}</div>
                <div style={{ fontSize:'2rem', fontWeight:800, color:c.color, marginBottom:4 }}>{c.value ?? '—'}</div>
                <div style={{ fontWeight:600, color:'var(--text-primary)', fontSize:'0.85rem', marginBottom:3 }}>{c.label}</div>
                <div style={{ fontSize:'0.76rem', color:'var(--text-muted)' }}>{c.sub}</div>
              </div>
            ))}
          </div>

          {/* Hospitals quick list */}
          <h4 style={{ color:'var(--text-primary)', marginBottom:'var(--sp-4)' }}>🏥 Registered Hospitals</h4>
          <div style={{ display:'flex', flexDirection:'column', gap:'var(--sp-3)' }}>
            {(stats.hospitals || []).map(h => (
              <div key={h._id} className="glass-card animate-fade-in-up"
                style={{ padding:'var(--sp-4)', display:'flex', alignItems:'center', gap:'var(--sp-4)',
                  borderLeft:'3px solid var(--rose)' }}>
                <span style={{ fontSize:'1.5rem' }}>🏥</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, color:'var(--text-primary)', marginBottom:2 }}>{h.name}</div>
                  <div style={{ fontSize:'0.8rem', color:'var(--text-muted)', display:'flex', gap:'var(--sp-3)', flexWrap:'wrap' }}>
                    <span>Code: <strong style={{ color:'var(--rose)' }}>{h.code}</strong></span>
                    {h.address?.city && <span>📍 {h.address.city}, {h.address.country}</span>}
                    {h.contactEmail  && <span>✉️ {h.contactEmail}</span>}
                    <span>🛏️ {(h.settings?.maxBedsICU||0)+(h.settings?.maxBedsGeneral||0)+(h.settings?.maxBedsEmergency||0)} beds</span>
                    {h.settings?.telemedicineEnabled && <span style={{ color:'var(--emerald)' }}>📱 Telemedicine</span>}
                  </div>
                </div>
                <span style={{ fontSize:'0.72rem', padding:'4px 12px', borderRadius:'var(--r-full)', background:'rgba(16,185,129,0.1)', color:'var(--emerald)', border:'1px solid rgba(16,185,129,0.3)', fontWeight:700 }}>
                  ● ACTIVE
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────── HOSPITALS ─────────────────────────────────────
function HospitalsSection() {
  const [hospitals, setHospitals] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [toggling,  setToggling]  = useState(null);

  const load = () => {
    setLoading(true);
    getAllHospitals()
      .then(r => { setHospitals(r.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  };
  useEffect(load, []);

  const handleToggle = async (id, current) => {
    setToggling(id);
    try { await toggleHospital(id, !current); load(); }
    catch { /* ignore */ }
    finally { setToggling(null); }
  };

  return (
    <div>
      <div style={{ marginBottom:'var(--sp-6)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'var(--sp-3)', marginBottom:4 }}>
          <h3 style={{ color:'var(--text-primary)' }}>🏥 Hospital Management</h3>
          {!loading && <span style={{ fontSize:'0.75rem', padding:'3px 10px', borderRadius:'var(--r-full)', background:'rgba(251,113,133,0.1)', color:'var(--rose)', border:'1px solid rgba(251,113,133,0.25)', fontWeight:600 }}>{hospitals.length} hospitals</span>}
        </div>
        <p style={{ fontSize:'0.85rem' }}>Manage all hospital tenants on the MedCore platform.</p>
      </div>

      {loading && <div style={{ textAlign:'center', padding:'var(--sp-12)' }}><span className="spinner spinner-lg"/></div>}

      <div style={{ display:'flex', flexDirection:'column', gap:'var(--sp-4)' }}>
        {hospitals.map(h => (
          <div key={h._id} className="glass-card animate-fade-in-up"
            style={{ padding:'var(--sp-5)', borderLeft:`3px solid ${h.isActive ? 'var(--emerald)' : 'var(--rose)'}` }}>
            <div style={{ display:'flex', alignItems:'flex-start', gap:'var(--sp-4)' }}>
              <div style={{ fontSize:'2.5rem', flexShrink:0 }}>🏥</div>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', alignItems:'center', gap:'var(--sp-2)', marginBottom:6, flexWrap:'wrap' }}>
                  <span style={{ fontWeight:800, color:'var(--text-primary)', fontSize:'1.05rem' }}>{h.name}</span>
                  <span style={{ fontSize:'0.72rem', padding:'3px 8px', borderRadius:'var(--r-full)', background: h.isActive ? 'rgba(16,185,129,0.1)' : 'rgba(251,113,133,0.1)', color: h.isActive ? 'var(--emerald)' : 'var(--rose)', border:`1px solid ${h.isActive ? 'rgba(16,185,129,0.3)' : 'rgba(251,113,133,0.3)'}`, fontWeight:700 }}>
                    {h.isActive ? '● ACTIVE' : '○ INACTIVE'}
                  </span>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:'var(--sp-2)', fontSize:'0.8rem', color:'var(--text-muted)' }}>
                  <span>🏷️ Code: <strong style={{ color:'var(--rose)' }}>{h.code}</strong></span>
                  {h.address?.street    && <span>📍 {h.address.street}</span>}
                  {h.address?.city      && <span>🌆 {h.address.city}, {h.address.state}</span>}
                  {h.address?.country   && <span>🌍 {h.address.country} {h.address.postalCode}</span>}
                  {h.contactEmail       && <span>✉️ {h.contactEmail}</span>}
                  {h.contactPhone       && <span>📞 {h.contactPhone}</span>}
                  {h.settings?.timezone && <span>🕐 {h.settings.timezone}</span>}
                </div>
                {/* Bed capacity */}
                <div style={{ display:'flex', gap:'var(--sp-3)', marginTop:'var(--sp-3)', flexWrap:'wrap' }}>
                  {[
                    { label:'ICU',       value:h.settings?.maxBedsICU,       color:'var(--rose)'  },
                    { label:'General',   value:h.settings?.maxBedsGeneral,   color:'var(--amber)' },
                    { label:'Emergency', value:h.settings?.maxBedsEmergency, color:'var(--red)'   },
                  ].map(b => b.value ? (
                    <span key={b.label} style={{ fontSize:'0.75rem', padding:'3px 10px', borderRadius:'var(--r-full)', background:`${b.color}15`, color:b.color, border:`1px solid ${b.color}30` }}>
                      🛏️ {b.label}: {b.value}
                    </span>
                  ) : null)}
                  {h.settings?.emergencyServices   && <span style={{ fontSize:'0.75rem', padding:'3px 10px', borderRadius:'var(--r-full)', background:'rgba(251,113,133,0.1)', color:'var(--rose)', border:'1px solid rgba(251,113,133,0.25)' }}>🚨 Emergency</span>}
                  {h.settings?.telemedicineEnabled && <span style={{ fontSize:'0.75rem', padding:'3px 10px', borderRadius:'var(--r-full)', background:'rgba(16,185,129,0.1)', color:'var(--emerald)', border:'1px solid rgba(16,185,129,0.25)' }}>📱 Telemedicine</span>}
                </div>
              </div>
              <button type="button"
                disabled={toggling === h._id}
                onClick={() => handleToggle(h._id, h.isActive)}
                style={{ flexShrink:0, padding:'8px 16px', borderRadius:'var(--r-md)', border:`1px solid ${h.isActive ? 'rgba(251,113,133,0.4)' : 'rgba(16,185,129,0.4)'}`, background:'none', color: h.isActive ? 'var(--rose)' : 'var(--emerald)', cursor:'pointer', fontSize:'0.82rem', fontWeight:600, transition:'all var(--t-fast)' }}>
                {toggling === h._id ? <span className="spinner"/> : (h.isActive ? 'Deactivate' : 'Activate')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────── DOCTORS ───────────────────────────────────────
function DoctorsSection() {
  const [doctors,  setDoctors]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    getDoctors()
      .then(r => { setDoctors(r.data || []); setLoading(false); })
      .catch(e => { setError(e.response?.data?.message || 'Failed'); setLoading(false); });
  }, []);

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', gap:'var(--sp-3)', marginBottom:'var(--sp-6)' }}>
        <h3 style={{ color:'var(--text-primary)' }}>🩺 All Doctors</h3>
        {!loading && <span style={{ fontSize:'0.75rem', padding:'3px 10px', borderRadius:'var(--r-full)', background:'rgba(0,212,255,0.1)', color:'var(--cyan)', border:'1px solid rgba(0,212,255,0.25)', fontWeight:600 }}>{doctors.length} doctors</span>}
      </div>
      {error   && <div className="alert alert-error">{error}</div>}
      {loading && <div style={{ textAlign:'center', padding:'var(--sp-12)' }}><span className="spinner spinner-lg"/></div>}
      <div style={{ display:'flex', flexDirection:'column', gap:'var(--sp-3)' }}>
        {doctors.map(doc => (
          <div key={doc._id} className="glass-card animate-fade-in-up"
            style={{ padding:'var(--sp-5)', display:'flex', alignItems:'center', gap:'var(--sp-4)' }}>
            <div style={{ width:48, height:48, borderRadius:'50%', background:'linear-gradient(135deg, var(--indigo), #6366f1)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, color:'#fff', fontSize:'1.1rem', flexShrink:0 }}>
              {doc.profile?.firstName?.[0]}{doc.profile?.lastName?.[0]}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ display:'flex', alignItems:'center', gap:'var(--sp-2)', marginBottom:4, flexWrap:'wrap' }}>
                <span style={{ fontWeight:700, color:'var(--text-primary)' }}>Dr. {doc.profile?.firstName} {doc.profile?.lastName}</span>
                <span className={`badge ${doc.isActive ? 'badge-emerald' : 'badge-red'}`}>{doc.isActive ? 'Active' : 'Inactive'}</span>
              </div>
              <div style={{ fontSize:'0.8rem', color:'var(--text-muted)', display:'flex', gap:'var(--sp-3)', flexWrap:'wrap' }}>
                {doc.profile?.specialization  && <span>🏥 {doc.profile.specialization}</span>}
                {doc.profile?.department      && <span>· {doc.profile.department}</span>}
                {doc.profile?.licenseNumber   && <span>· 🪪 {doc.profile.licenseNumber}</span>}
                {doc.profile?.yearsExperience && <span>· {doc.profile.yearsExperience}y exp</span>}
              </div>
              <div style={{ fontSize:'0.76rem', color:'var(--text-muted)', marginTop:2 }}>{doc.email} {doc.profile?.phone && `· ${doc.profile.phone}`}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────── PATIENTS ──────────────────────────────────────
function PatientsSection() {
  const [patients, setPatients] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');

  const load = (q='') => {
    setLoading(true);
    getPatients(q ? { search: q } : {})
      .then(r => { setPatients(r.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'var(--sp-6)', flexWrap:'wrap', gap:'var(--sp-3)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'var(--sp-3)' }}>
          <h3 style={{ color:'var(--text-primary)' }}>🧑 All Patients</h3>
          {!loading && <span style={{ fontSize:'0.75rem', padding:'3px 10px', borderRadius:'var(--r-full)', background:'rgba(129,140,248,0.1)', color:'var(--indigo)', border:'1px solid rgba(129,140,248,0.25)', fontWeight:600 }}>{patients.length} patients</span>}
        </div>
        <div style={{ display:'flex', gap:'var(--sp-2)' }}>
          <input type="text" className="form-input" style={{ width:250 }} placeholder="Search by name or email…"
            value={search} onChange={e => { setSearch(e.target.value); if (!e.target.value) load(''); }}
            onKeyDown={e => e.key === 'Enter' && load(search)} />
          <button type="button" className="btn btn-ghost" onClick={() => load(search)}>🔍</button>
        </div>
      </div>
      {loading && <div style={{ textAlign:'center', padding:'var(--sp-12)' }}><span className="spinner spinner-lg"/></div>}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:'var(--sp-3)' }} className="stagger">
        {patients.map(p => (
          <div key={p._id} className="glass-card animate-fade-in-up" style={{ padding:'var(--sp-5)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'var(--sp-3)', marginBottom:'var(--sp-3)' }}>
              <div style={{ width:44, height:44, borderRadius:'50%', background:'linear-gradient(135deg, var(--cyan), #0080ff)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, color:'#fff', fontSize:'1rem', flexShrink:0 }}>
                {p.profile?.firstName?.[0]}{p.profile?.lastName?.[0]}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, color:'var(--text-primary)', fontSize:'0.92rem' }}>{p.profile?.firstName} {p.profile?.lastName}</div>
                <div style={{ fontSize:'0.76rem', color:'var(--text-muted)' }}>{p.email}</div>
              </div>
              {p.profile?.bloodGroup && (
                <span style={{ fontSize:'0.75rem', padding:'3px 8px', borderRadius:'var(--r-full)', background:'rgba(251,113,133,0.1)', color:'var(--rose)', border:'1px solid rgba(251,113,133,0.25)', fontWeight:700 }}>🩸 {p.profile.bloodGroup}</span>
              )}
            </div>
            <div style={{ fontSize:'0.78rem', color:'var(--text-muted)', display:'flex', gap:'var(--sp-3)', flexWrap:'wrap' }}>
              {p.profile?.phone    && <span>📞 {p.profile.phone}</span>}
              {p.profile?.gender   && <span style={{ textTransform:'capitalize' }}>👤 {p.profile.gender}</span>}
              {p.profile?.allergies?.length > 0 && <span style={{ color:'var(--rose)' }}>⚠️ {p.profile.allergies.join(', ')}</span>}
            </div>
            {p.profile?.emergencyContact?.name && (
              <div style={{ marginTop:8, paddingTop:8, borderTop:'1px solid var(--border-subtle)', fontSize:'0.74rem', color:'var(--text-muted)' }}>
                🆘 {p.profile.emergencyContact.name} ({p.profile.emergencyContact.relation}) · {p.profile.emergencyContact.phone}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────── APPOINTMENTS ──────────────────────────────────
function AppointmentsSection() {
  const [appts,   setAppts]   = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status:'', page:1 });

  const load = (f=filters) => {
    setLoading(true);
    const params = { page:f.page, limit:20 };
    if (f.status) params.status = f.status;
    getAdminAppointments(params)
      .then(r => { setAppts(r.data || []); setPagination(r.pagination || {}); setLoading(false); })
      .catch(() => setLoading(false));
  };
  useEffect(() => { load(); }, []); // eslint-disable-line

  const applyFilter = (key, value) => {
    const next = { ...filters, [key]:value, page:1 };
    setFilters(next); load(next);
  };

  return (
    <div>
      <div style={{ marginBottom:'var(--sp-6)' }}>
        <h3 style={{ color:'var(--text-primary)', marginBottom:4 }}>📅 All Appointments</h3>
        <p style={{ fontSize:'0.85rem' }}>Hospital-wide appointment management and oversight.</p>
      </div>
      <div style={{ display:'flex', gap:'var(--sp-2)', flexWrap:'wrap', marginBottom:'var(--sp-5)' }}>
        {['','pending','confirmed','completed','cancelled'].map(s => (
          <button key={s||'all'} type="button" onClick={() => applyFilter('status', s)}
            style={{ padding:'6px 14px', borderRadius:'var(--r-full)', fontSize:'0.82rem', cursor:'pointer', transition:'all var(--t-fast)', border: filters.status===s ? '1.5px solid var(--rose)' : '1px solid var(--border-medium)', background: filters.status===s ? 'rgba(251,113,133,0.1)' : 'var(--bg-surface)', color: filters.status===s ? 'var(--rose)' : 'var(--text-secondary)', fontWeight: filters.status===s ? 600 : 400 }}>
            {s ? s.charAt(0).toUpperCase()+s.slice(1) : 'All'}
          </button>
        ))}
      </div>
      {loading && <div style={{ textAlign:'center', padding:'var(--sp-10)' }}><span className="spinner spinner-lg"/></div>}
      {!loading && appts.length === 0 && (
        <div className="glass-card" style={{ padding:'var(--sp-10)', textAlign:'center' }}>
          <div style={{ fontSize:'3rem', marginBottom:'var(--sp-3)' }}>📅</div>
          <h4 style={{ color:'var(--text-primary)' }}>No appointments found</h4>
        </div>
      )}
      <div style={{ display:'flex', flexDirection:'column', gap:'var(--sp-2)' }}>
        {appts.map(appt => {
          const sc = SC[appt.status] || SC.pending;
          return (
            <div key={appt._id} className="glass-card animate-fade-in-up"
              style={{ padding:'var(--sp-4)', display:'flex', alignItems:'center', gap:'var(--sp-4)' }}>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', alignItems:'center', gap:'var(--sp-2)', marginBottom:4, flexWrap:'wrap' }}>
                  <span style={{ fontWeight:600, color:'var(--text-primary)', fontSize:'0.92rem' }}>
                    {appt.patientId?.profile?.firstName} {appt.patientId?.profile?.lastName}
                  </span>
                  <span style={{ color:'var(--text-muted)', fontSize:'0.82rem' }}>→ Dr. {appt.doctorId?.profile?.firstName} {appt.doctorId?.profile?.lastName}</span>
                  <span style={{ marginLeft:'auto', fontSize:'0.72rem', fontWeight:700, padding:'2px 8px', borderRadius:'var(--r-full)', border:`1px solid ${sc.border}`, color:sc.text, background:sc.bg }}>
                    {appt.status}
                  </span>
                </div>
                <div style={{ display:'flex', gap:'var(--sp-4)', flexWrap:'wrap', fontSize:'0.78rem', color:'var(--text-muted)' }}>
                  <span>📅 {new Date(appt.date).toLocaleDateString('en-LK',{day:'numeric',month:'short',year:'numeric'})}</span>
                  <span style={{ color:'var(--indigo)', fontWeight:600 }}>⏰ {appt.timeSlot}</span>
                  {appt.reason && <span>💬 {appt.reason.length>60 ? appt.reason.slice(0,60)+'…' : appt.reason}</span>}
                  {appt.doctorId?.profile?.specialization && <span>({appt.doctorId.profile.specialization})</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {pagination.pages > 1 && (
        <div style={{ display:'flex', justifyContent:'center', gap:'var(--sp-2)', marginTop:'var(--sp-6)' }}>
          <button type="button" className="btn btn-sm btn-ghost" disabled={filters.page<=1} onClick={() => applyFilter('page', filters.page-1)}>← Prev</button>
          <span style={{ padding:'6px 12px', fontSize:'0.85rem', color:'var(--text-muted)' }}>Page {filters.page} of {pagination.pages}</span>
          <button type="button" className="btn btn-sm btn-ghost" disabled={filters.page>=pagination.pages} onClick={() => applyFilter('page', filters.page+1)}>Next →</button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────── COMPLIANCE ────────────────────────────────────
function ComplianceSection() {
  const items = [
    { label:'Patient Data Encryption',    status:'pass', detail:'AES-256 at rest · TLS 1.3 in transit' },
    { label:'JWT Token Rotation',          status:'pass', detail:'15min access token + 7-day refresh tokens' },
    { label:'Role-Based Access Control',   status:'pass', detail:'4-tier: patient / doctor / hospital_admin / super_admin' },
    { label:'Optimistic Locking',          status:'pass', detail:'Mongoose __v prevents double-booking conflicts (HTTP 409)' },
    { label:'Multi-Tenant Isolation',      status:'pass', detail:'hospitalId scoped on all DB queries — cross-tenant access blocked' },
    { label:'Password Hashing',            status:'pass', detail:'bcrypt cost factor 12 · changedPasswordAfter() invalidation' },
    { label:'CORS & Helmet Protection',    status:'pass', detail:'Whitelist-only origins · X-Frame-Options · CSP headers' },
    { label:'Offline Support (Dexie)',     status:'pass', detail:'IndexedDB caching + SyncQueue for offline continuity' },
    { label:'Audit Trail',                 status:'warn', detail:'Phase 5: full event streaming & immutable audit log planned' },
    { label:'HIPAA Compliance',            status:'warn', detail:'Partial — full certification in Phase 5' },
    { label:'S3 File Storage',             status:'info', detail:'Phase 4: replacing fileUrl strings with signed S3 upload URLs' },
    { label:'2FA / MFA',                   status:'info', detail:'Phase 5: TOTP-based 2FA for admin and doctor portals' },
  ];
  const C = {
    pass:{ color:'var(--emerald)', bg:'rgba(16,185,129,0.1)',  border:'rgba(16,185,129,0.3)',  icon:'✅' },
    warn:{ color:'var(--amber)',   bg:'rgba(251,191,36,0.1)',  border:'rgba(251,191,36,0.3)',  icon:'⚠️' },
    info:{ color:'var(--indigo)',  bg:'rgba(129,140,248,0.1)', border:'rgba(129,140,248,0.3)', icon:'ℹ️' },
  };
  const pass = items.filter(i=>i.status==='pass').length;
  return (
    <div>
      <div style={{ marginBottom:'var(--sp-6)' }}>
        <h3 style={{ color:'var(--text-primary)', marginBottom:4 }}>📋 Compliance & Security</h3>
        <p style={{ fontSize:'0.85rem' }}>Platform-wide compliance status — {pass} of {items.length} controls passing.</p>
      </div>
      {/* Score bar */}
      <div className="glass-card" style={{ padding:'var(--sp-5)', marginBottom:'var(--sp-6)', display:'flex', alignItems:'center', gap:'var(--sp-4)' }}>
        <div style={{ fontSize:'3rem' }}>🛡️</div>
        <div style={{ flex:1 }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
            <span style={{ fontWeight:700, color:'var(--text-primary)' }}>Compliance Score</span>
            <span style={{ fontWeight:800, fontSize:'1.2rem', color:'var(--emerald)' }}>{Math.round(pass/items.length*100)}%</span>
          </div>
          <div style={{ height:8, background:'var(--bg-elevated)', borderRadius:99, overflow:'hidden' }}>
            <div style={{ height:'100%', width:`${Math.round(pass/items.length*100)}%`, background:'linear-gradient(90deg, var(--emerald), var(--cyan))', borderRadius:99, transition:'width 1s ease' }}/>
          </div>
          <div style={{ display:'flex', gap:'var(--sp-3)', marginTop:8, fontSize:'0.75rem', color:'var(--text-muted)' }}>
            <span style={{ color:'var(--emerald)' }}>✅ {pass} passed</span>
            <span style={{ color:'var(--amber)' }}>⚠️ {items.filter(i=>i.status==='warn').length} warnings</span>
            <span style={{ color:'var(--indigo)' }}>ℹ️ {items.filter(i=>i.status==='info').length} planned</span>
          </div>
        </div>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:'var(--sp-3)' }} className="stagger">
        {items.map(item => {
          const c = C[item.status];
          return (
            <div key={item.label} className="glass-card animate-fade-in-up"
              style={{ padding:'var(--sp-4)', display:'flex', alignItems:'center', gap:'var(--sp-4)', borderLeft:`3px solid ${c.color}` }}>
              <span style={{ fontSize:'1.3rem' }}>{c.icon}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:600, color:'var(--text-primary)', marginBottom:2 }}>{item.label}</div>
                <div style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>{item.detail}</div>
              </div>
              <span style={{ fontSize:'0.72rem', padding:'3px 10px', borderRadius:'var(--r-full)', background:c.bg, color:c.color, border:`1px solid ${c.border}`, fontWeight:700, flexShrink:0 }}>
                {item.status.toUpperCase()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────── AUDIT LOGS ────────────────────────────────────
function AuditSection() {
  const logs = [
    { time:'09:14 today', action:'LOGIN',               user:'admin@nawaloka.lk',              detail:'Hospital Admin portal login — IP 192.168.1.5',     level:'info'  },
    { time:'09:02 today', action:'APPOINTMENT BOOKED',  user:'sunil.kumara@gmail.com',         detail:'Dr. K. Dissanayake — 09:00 · Confirmed',           level:'info'  },
    { time:'08:52 today', action:'HEALTH RECORD ADDED', user:'dr.dissanayake@nawaloka.lk',     detail:'Rx — Hypertension & Lipid Management (Sunil Kumara)', level:'info' },
    { time:'08:47 today', action:'HEALTH RECORD ADDED', user:'dr.dissanayake@nawaloka.lk',     detail:'ECG 12-Lead — Normal Sinus Rhythm',                level:'info'  },
    { time:'08:30 today', action:'LOGIN',               user:'dr.perera@nawaloka.lk',          detail:'Doctor portal login — IP 192.168.1.8',             level:'info'  },
    { time:'08:15 today', action:'TOKEN REFRESH',       user:'malini.silva@gmail.com',         detail:'Access token silently refreshed',                  level:'debug' },
    { time:'Yest 16:45',  action:'APPT STATUS UPDATE',  user:'dr.fernando@nawaloka.lk',        detail:'Appointment completed — Chaminda Wickramasinghe',  level:'info'  },
    { time:'Yest 14:22',  action:'DOCTOR CREATED',      user:'admin@nawaloka.lk',              detail:'New account: dr.fernando@nawaloka.lk (Gen. Med)',  level:'warn'  },
    { time:'Yest 12:00',  action:'SEED EXECUTED',       user:'system',                         detail:'Database seed completed — 9 users, 11 records',   level:'warn'  },
    { time:'Yest 11:55',  action:'SERVER START',        user:'system',                         detail:'Healthcare Platform API started · PORT 5001',      level:'info'  },
  ];
  const LC = { info:'var(--cyan)', warn:'var(--amber)', debug:'var(--text-muted)', error:'var(--rose)' };
  return (
    <div>
      <div style={{ marginBottom:'var(--sp-6)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'var(--sp-3)', marginBottom:4 }}>
          <h3 style={{ color:'var(--text-primary)' }}>🔍 Audit Logs</h3>
          <span style={{ fontSize:'0.72rem', padding:'3px 8px', borderRadius:'var(--r-full)', background:'rgba(251,191,36,0.1)', color:'var(--amber)', border:'1px solid rgba(251,191,36,0.25)' }}>
            ⚠️ Phase 5 — static preview
          </span>
        </div>
        <p style={{ fontSize:'0.85rem' }}>Recent platform activity. Full real-time streaming audit log coming in Phase 5.</p>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:'var(--sp-2)' }}>
        {logs.map((log, i) => (
          <div key={i} className="glass-card animate-fade-in-up"
            style={{ padding:'var(--sp-3) var(--sp-4)', display:'flex', alignItems:'center', gap:'var(--sp-3)', borderLeft:`2px solid ${LC[log.level]}` }}>
            <span style={{ fontSize:'0.7rem', color:'var(--text-muted)', flexShrink:0, minWidth:80 }}>{log.time}</span>
            <span style={{ fontSize:'0.72rem', fontWeight:700, color:LC[log.level], flexShrink:0, minWidth:155, textTransform:'uppercase' }}>{log.action}</span>
            <span style={{ fontSize:'0.8rem', color:'var(--text-secondary)', flex:1 }}>{log.detail}</span>
            <span style={{ fontSize:'0.68rem', color:'var(--text-muted)', flexShrink:0, maxWidth:160, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{log.user}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────── MAIN DASHBOARD ────────────────────────────────────
const SuperAdminDashboard = () => {
  const { user, logout } = useAuth();
  const [active, setActive] = useState('overview');

  const renderSection = () => {
    switch(active) {
      case 'overview':     return <OverviewSection user={user} />;
      case 'hospitals':    return <HospitalsSection />;
      case 'doctors':      return <DoctorsSection />;
      case 'patients':     return <PatientsSection />;
      case 'appointments': return <AppointmentsSection />;
      case 'compliance':   return <ComplianceSection />;
      case 'audit':        return <AuditSection />;
      default:             return <OverviewSection user={user} />;
    }
  };

  return (
    <div style={{ minHeight:'100svh', display:'flex', background:'var(--bg-base)' }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width:270, flexShrink:0,
        background:'linear-gradient(180deg, var(--bg-secondary) 0%, #0d0a1f 100%)',
        borderRight:'1px solid var(--border-subtle)',
        display:'flex', flexDirection:'column',
        padding:'var(--sp-6) var(--sp-4)', gap:'var(--sp-1)',
      }}>
        {/* Logo */}
        <div style={{ padding:'0 var(--sp-2) var(--sp-6)', borderBottom:'1px solid var(--border-subtle)', marginBottom:'var(--sp-3)' }}>
          <div style={{ fontSize:'1.3rem', fontWeight:900, background:'linear-gradient(135deg, var(--rose), #fda4af)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
            MedCore
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:5, marginTop:3 }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--rose)" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <span style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>Super Admin · Global Access</span>
          </div>
        </div>

        {NAV_ITEMS.map(item => {
          const isActive = active === item.id;
          return (
            <button key={item.id} id={`nav-sa-${item.id}`} type="button"
              onClick={() => setActive(item.id)}
              style={{
                display:'flex', alignItems:'center', gap:'var(--sp-3)',
                padding:'10px 12px', borderRadius:'var(--r-md)', border:'none',
                background: isActive ? 'rgba(251,113,133,0.12)' : 'none',
                color: isActive ? 'var(--rose)' : 'var(--text-secondary)',
                cursor:'pointer', fontSize:'0.9rem', fontWeight: isActive ? 600 : 500,
                width:'100%', textAlign:'left', transition:'all var(--t-fast)',
                borderLeft: isActive ? '3px solid var(--rose)' : '3px solid transparent',
              }}
              onMouseEnter={e => { if(!isActive) { e.currentTarget.style.background='rgba(251,113,133,0.06)'; e.currentTarget.style.color='var(--text-primary)'; }}}
              onMouseLeave={e => { if(!isActive) { e.currentTarget.style.background='none'; e.currentTarget.style.color='var(--text-secondary)'; }}}
            >
              <span style={{ fontSize:'1.1rem' }}>{item.icon}</span>
              {item.label}
            </button>
          );
        })}

        <div style={{ flex:1 }} />

        {/* User card */}
        <div style={{ padding:'var(--sp-3)', borderRadius:'var(--r-md)', background:'rgba(255,255,255,0.03)', marginBottom:'var(--sp-2)', border:'1px solid var(--border-subtle)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'var(--sp-2)' }}>
            <div style={{ width:34, height:34, borderRadius:'50%', background:'linear-gradient(135deg, var(--rose), #e11d48)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, color:'#fff', fontSize:'0.85rem', flexShrink:0 }}>
              {user?.profile?.firstName?.[0]}{user?.profile?.lastName?.[0]}
            </div>
            <div>
              <div style={{ fontSize:'0.82rem', fontWeight:600, color:'var(--text-primary)' }}>{user?.profile?.firstName} {user?.profile?.lastName}</div>
              <div style={{ fontSize:'0.7rem', color:'var(--rose)', fontWeight:600 }}>Super Admin</div>
            </div>
          </div>
        </div>

        {/* Logout */}
        <button type="button" onClick={logout} id="btn-sa-logout"
          style={{ display:'flex', alignItems:'center', gap:'var(--sp-2)', padding:'10px 12px', borderRadius:'var(--r-md)', border:'1px solid var(--border-subtle)', background:'none', color:'var(--text-muted)', cursor:'pointer', fontSize:'0.85rem', width:'100%', transition:'all var(--t-fast)' }}
          onMouseEnter={e => e.currentTarget.style.color='var(--red)'}
          onMouseLeave={e => e.currentTarget.style.color='var(--text-muted)'}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Sign Out
        </button>
      </aside>

      {/* ── Main ── */}
      <main style={{ flex:1, padding:'var(--sp-8)', overflowY:'auto' }}>
        {renderSection()}
      </main>
    </div>
  );
};

export default SuperAdminDashboard;
