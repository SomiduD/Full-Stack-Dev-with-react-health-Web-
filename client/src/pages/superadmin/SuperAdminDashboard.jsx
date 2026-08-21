// client/src/pages/superadmin/SuperAdminDashboard.jsx
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { id:'hospitals',   label:'All Hospitals',    icon:'🏥' },
  { id:'doctors',     label:'Doctor Onboarding',icon:'👨‍⚕️' },
  { id:'routing',     label:'Cross-Hospital Routing', icon:'🔀' },
  { id:'compliance',  label:'Compliance',       icon:'📋' },
  { id:'audit',       label:'Audit Logs',       icon:'🔍' },
  { id:'settings',    label:'Global Settings',  icon:'⚙️' },
];

const SuperAdminDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div style={{ minHeight:'100svh', display:'flex', background:'var(--bg-base)' }}>
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
            style={{ display:'flex', alignItems:'center', gap:'var(--sp-3)', padding:'10px 12px', borderRadius:'var(--r-md)', border:'none', background:'none', color:'var(--text-secondary)', cursor:'pointer', fontSize:'0.9rem', fontWeight:500, width:'100%', textAlign:'left', transition:'all var(--t-fast)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background='rgba(251,113,133,0.08)'; e.currentTarget.style.color='var(--text-primary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background='none'; e.currentTarget.style.color='var(--text-secondary)'; }}
          >
            <span style={{ fontSize:'1.1rem' }}>{item.icon}</span>
            {item.label}
          </button>
        ))}

        <div style={{ flex:1 }} />
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

      <main style={{ flex:1, padding:'var(--sp-8)', overflowY:'auto' }}>
        <div style={{ marginBottom:'var(--sp-8)', animation:'fadeInDown 0.4s ease both' }}>
          <p style={{ color:'var(--text-muted)', fontSize:'0.82rem', marginBottom:4 }}>SUPER ADMIN · GLOBAL CONTROL</p>
          <h2 style={{ color:'var(--text-primary)', marginBottom:4 }}>
            Welcome, {user?.profile?.firstName}
          </h2>
          <p style={{ fontSize:'0.88rem' }}>You have unrestricted access to all hospital tenants and global settings.</p>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))', gap:'var(--sp-4)' }} className="stagger">
          {[
            { label:'Active Hospitals',   value:'14',    sub:'2 pending onboarding',   color:'var(--rose)'    },
            { label:'Registered Doctors', value:'1,248', sub:'96 unverified',           color:'var(--indigo)'  },
            { label:'Total Patients',     value:'87.4K', sub:'+12% this month',         color:'var(--cyan)'    },
            { label:'Cross-Hospital Refs',value:'34',    sub:'7 pending approval',      color:'var(--amber)'   },
            { label:'Compliance Score',   value:'98%',   sub:'Last audit: 3 days ago',  color:'var(--emerald)' },
            { label:'System Uptime',      value:'99.97%',sub:'Last 30 days',            color:'var(--emerald)' },
          ].map((c) => (
            <div key={c.label} className="glass-card animate-fade-in-up" style={{ padding:'var(--sp-5)', cursor:'pointer', transition:'transform var(--t-base)' }}
              onMouseEnter={(e) => e.currentTarget.style.transform='translateY(-3px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform='translateY(0)'}
            >
              <div style={{ fontSize:'1.8rem', fontWeight:800, color:c.color, marginBottom:4 }}>{c.value}</div>
              <div style={{ fontWeight:600, color:'var(--text-primary)', fontSize:'0.9rem', marginBottom:4 }}>{c.label}</div>
              <div style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>{c.sub}</div>
            </div>
          ))}
        </div>

        <div className="glass-card" style={{ marginTop:'var(--sp-8)', padding:'var(--sp-8)', textAlign:'center', background:'linear-gradient(135deg, rgba(251,113,133,0.06), rgba(17,31,61,0.65))' }}>
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
