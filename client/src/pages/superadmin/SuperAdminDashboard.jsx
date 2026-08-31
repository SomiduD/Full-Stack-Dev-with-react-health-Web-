// client/src/pages/superadmin/SuperAdminDashboard.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const NAV_ITEMS = [
  { id:'hospitals',   label:'All Hospitals',         icon:'🏥' },
  { id:'doctors',     label:'Doctor Onboarding',     icon:'👨‍⚕️' },
  { id:'routing',     label:'Cross-Hospital Routing',icon:'🔀' },
  { id:'compliance',  label:'Compliance',            icon:'📋' },
  { id:'audit',       label:'Audit Logs',            icon:'🔍' },
  { id:'settings',    label:'Global Settings',       icon:'⚙️' },
];

const StatCard = ({ icon, label, value, sub, color }) => (
  <div className="glass-card animate-fade-in-up" style={{ padding:'var(--sp-5)', cursor:'pointer', transition:'transform var(--t-base)' }}
    onMouseEnter={(e) => e.currentTarget.style.transform='translateY(-3px)'}
    onMouseLeave={(e) => e.currentTarget.style.transform='translateY(0)'}
  >
    <div style={{ fontSize:'1.8rem', fontWeight:800, color, marginBottom:4 }}>{icon} {value ?? '—'}</div>
    <div style={{ fontWeight:600, color:'var(--text-primary)', fontSize:'0.9rem', marginBottom:4 }}>{label}</div>
    <div style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>{sub}</div>
  </div>
);

const SuperAdminDashboard = () => {
  const { user, logout } = useAuth();
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [activeNav, setActiveNav] = useState('hospitals');

  useEffect(() => {
    // Super admin: try to get aggregate data from admin/stats
    // The super_admin may not have a hospitalId so we handle gracefully
    api.get('/admin/stats')
      .then(r  => { setStats(r.data.data); setLoading(false); })
      .catch(e => {
        const msg = e.response?.data?.message || 'Could not load stats.';
        setError(msg);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ minHeight:'100svh', display:'flex', background:'var(--bg-base)' }}>
      {/* ── Sidebar ── */}
      <aside style={{
        width:270, flexShrink:0,
        background:'linear-gradient(180deg, var(--bg-secondary) 0%, #0d0a1f 100%)',
        borderRight:'1px solid var(--border-subtle)',
        display:'flex', flexDirection:'column', padding:'var(--sp-6) var(--sp-4)', gap:'var(--sp-2)',
      }}>
        <div style={{ padding:'0 var(--sp-2) var(--sp-6)', borderBottom:'1px solid var(--border-subtle)', marginBottom:'var(--sp-2)' }}>
          <div style={{ fontSize:'1.3rem', fontWeight:900, background:'linear-gradient(135deg, var(--rose), #fda4af)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
            MedCore
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:4 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--rose)" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <span style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>Super Admin — Global Access</span>
          </div>
        </div>

        {NAV_ITEMS.map((item) => (
          <button key={item.id} id={`nav-sa-${item.id}`} type="button"
            onClick={() => setActiveNav(item.id)}
            style={{
              display:'flex', alignItems:'center', gap:'var(--sp-3)',
              padding:'10px 12px', borderRadius:'var(--r-md)',
              border:'none',
              background: activeNav === item.id ? 'rgba(251,113,133,0.12)' : 'none',
              color: activeNav === item.id ? 'var(--rose)' : 'var(--text-secondary)',
              cursor:'pointer', fontSize:'0.9rem', fontWeight:500,
              width:'100%', textAlign:'left', transition:'all var(--t-fast)',
            }}
            onMouseEnter={(e) => { if (activeNav !== item.id) { e.currentTarget.style.background='rgba(251,113,133,0.06)'; e.currentTarget.style.color='var(--text-primary)'; }}}
            onMouseLeave={(e) => { if (activeNav !== item.id) { e.currentTarget.style.background='none'; e.currentTarget.style.color='var(--text-secondary)'; }}}
          >
            <span style={{ fontSize:'1.1rem' }}>{item.icon}</span>
            {item.label}
          </button>
        ))}

        <div style={{ flex:1 }} />

        {/* User info */}
        <div style={{ padding:'var(--sp-3)', borderRadius:'var(--r-md)', background:'rgba(255,255,255,0.03)', marginBottom:'var(--sp-2)' }}>
          <div style={{ fontSize:'0.82rem', fontWeight:600, color:'var(--text-primary)' }}>
            {user?.profile?.firstName} {user?.profile?.lastName}
          </div>
          <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', marginTop:2 }}>{user?.email}</div>
        </div>

        <button type="button" onClick={logout} id="btn-sa-logout"
          style={{ display:'flex', alignItems:'center', gap:'var(--sp-2)', padding:'10px 12px', borderRadius:'var(--r-md)', border:'1px solid var(--border-subtle)', background:'none', color:'var(--text-muted)', cursor:'pointer', fontSize:'0.85rem', width:'100%', transition:'all var(--t-fast)' }}
          onMouseEnter={(e) => e.currentTarget.style.color='var(--red)'}
          onMouseLeave={(e) => e.currentTarget.style.color='var(--text-muted)'}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Sign Out
        </button>
      </aside>

      {/* ── Main ── */}
      <main style={{ flex:1, padding:'var(--sp-8)', overflowY:'auto' }}>
        <div style={{ marginBottom:'var(--sp-8)', animation:'fadeInDown 0.4s ease both' }}>
          <p style={{ color:'var(--text-muted)', fontSize:'0.82rem', marginBottom:4 }}>SUPER ADMIN · GLOBAL CONTROL</p>
          <h2 style={{ color:'var(--text-primary)', marginBottom:4 }}>
            Welcome, {user?.profile?.firstName}
          </h2>
          <p style={{ fontSize:'0.88rem' }}>You have unrestricted access to all hospital tenants and global settings.</p>
        </div>

        {/* Loading / Error */}
        {loading && <div style={{ textAlign:'center', padding:'var(--sp-12)' }}><span className="spinner spinner-lg" /></div>}
        {error   && (
          <div className="alert alert-error" style={{ marginBottom:'var(--sp-6)' }}>
            ⚠️ {error} — Stats require a hospital association. Core super admin features are still available.
          </div>
        )}

        {/* Stats grid — real data when available */}
        {stats && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))', gap:'var(--sp-4)', marginBottom:'var(--sp-8)' }} className="stagger">
            <StatCard icon="🩺" label="Active Doctors"      value={stats.totalDoctors}   sub={`Hospital: ${stats.hospital?.name || 'N/A'}`}   color="var(--cyan)"    />
            <StatCard icon="🧑" label="Registered Patients" value={stats.totalPatients}  sub="All time"                                        color="var(--indigo)"  />
            <StatCard icon="📅" label="Today's Appointments"value={stats.todayAppts}     sub={`${stats.pendingAppts} pending`}                  color="var(--amber)"   />
            <StatCard icon="✅" label="Completed Today"     value={stats.completedAppts} sub="Consultations done"                              color="var(--emerald)" />
            <StatCard icon="📋" label="Health Records"      value={stats.totalRecords}   sub="In the vault"                                    color="var(--indigo)"  />
            <StatCard icon="🏥" label="Hospital"            value={stats.hospital?.code} sub={stats.hospital?.name}                            color="var(--rose)"    />
          </div>
        )}

        {/* Phase 5 placeholder panel */}
        <div className="glass-card" style={{ padding:'var(--sp-8)', textAlign:'center', background:'linear-gradient(135deg, rgba(251,113,133,0.06), rgba(17,31,61,0.65))' }}>
          <div style={{ fontSize:'3rem', marginBottom:'var(--sp-4)' }}>🛡️</div>
          <h3 style={{ color:'var(--text-primary)', marginBottom:'var(--sp-2)' }}>Global Administration — Phase 5</h3>
          <p style={{ fontSize:'0.88rem', maxWidth:480, margin:'0 auto' }}>
            Hospital onboarding, doctor approval workflows, cross-hospital patient routing,
            global compliance dashboards, and audit log streams will be built in Phase 5.
          </p>
          <div style={{ marginTop:'var(--sp-4)', display:'flex', gap:'var(--sp-2)', justifyContent:'center', flexWrap:'wrap' }}>
            <span className="badge badge-rose">Phase 5: Global Admin</span>
            <span className="badge badge-indigo">Doctor Onboarding</span>
            <span className="badge badge-amber">Compliance</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SuperAdminDashboard;
