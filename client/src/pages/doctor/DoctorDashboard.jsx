// client/src/pages/doctor/DoctorDashboard.jsx
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

const NAV_ITEMS = [
  { id:'triage',       label:'Live Triage',      icon:'🚨' },
  { id:'queue',        label:'Patient Queue',     icon:'👥' },
  { id:'timetable',    label:'My Timetable',      icon:'📆' },
  { id:'consultations',label:'Consultations',     icon:'🩺' },
  { id:'profile',      label:'My Profile',        icon:'👤' },
];

const DoctorDashboard = () => {
  const { user, logout } = useAuth();
  const { isConnected }  = useSocket();

  return (
    <div style={{ minHeight:'100svh', display:'flex', background:'var(--bg-base)' }}>

      {/* Sidebar */}
      <aside style={{
        width:260, flexShrink:0,
        background:'var(--bg-secondary)', borderRight:'1px solid var(--border-subtle)',
        display:'flex', flexDirection:'column', padding:'var(--sp-6) var(--sp-4)', gap:'var(--sp-2)',
      }}>
        <div style={{ padding:'0 var(--sp-2) var(--sp-6)', borderBottom:'1px solid var(--border-subtle)', marginBottom:'var(--sp-2)' }}>
          <div style={{ fontSize:'1.3rem', fontWeight:900, background:'linear-gradient(135deg, var(--indigo), #c7d2fe)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
            MedCore
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:4 }}>
            <div style={{ width:8, height:8, borderRadius:'50%', background: isConnected ? 'var(--emerald)' : 'var(--red)' }} />
            <span style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>
              Socket.io {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        {NAV_ITEMS.map((item) => (
          <button key={item.id} id={`nav-doc-${item.id}`} type="button"
            style={{ display:'flex', alignItems:'center', gap:'var(--sp-3)', padding:'10px 12px', borderRadius:'var(--r-md)', border:'none', background:'none', color:'var(--text-secondary)', cursor:'pointer', fontSize:'0.9rem', fontWeight:500, width:'100%', textAlign:'left', transition:'all var(--t-fast)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background='var(--bg-elevated)'; e.currentTarget.style.color='var(--text-primary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background='none'; e.currentTarget.style.color='var(--text-secondary)'; }}
          >
            <span style={{ fontSize:'1.1rem' }}>{item.icon}</span>
            {item.label}
          </button>
        ))}

        <div style={{ flex:1 }} />

        <button type="button" onClick={logout} id="btn-doctor-logout"
          style={{ display:'flex', alignItems:'center', gap:'var(--sp-2)', padding:'10px 12px', borderRadius:'var(--r-md)', border:'1px solid var(--border-subtle)', background:'none', color:'var(--text-muted)', cursor:'pointer', fontSize:'0.85rem', width:'100%', transition:'all var(--t-fast)' }}
          onMouseEnter={(e) => { e.currentTarget.style.color='var(--red)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color='var(--text-muted)'; }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Sign Out
        </button>
      </aside>

      {/* Main */}
      <main style={{ flex:1, padding:'var(--sp-8)', overflowY:'auto' }}>
        <div style={{ marginBottom:'var(--sp-8)', animation:'fadeInDown 0.4s ease both' }}>
          <p style={{ color:'var(--text-muted)', fontSize:'0.82rem', marginBottom:4 }}>DOCTOR PORTAL</p>
          <h2 style={{ color:'var(--text-primary)', marginBottom:4 }}>
            Dr. {user?.profile?.firstName} {user?.profile?.lastName}
          </h2>
          <p style={{ fontSize:'0.88rem' }}>{user?.profile?.specialization || 'General Medicine'} · Live triage stream {isConnected ? 'active' : 'reconnecting…'}</p>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))', gap:'var(--sp-4)' }} className="stagger">
          {[
            { label:'In Queue',         value:'7',  sub:'3 urgent',       color:'var(--rose)'    },
            { label:'Seen Today',       value:'12', sub:'avg. 18 min',    color:'var(--indigo)'  },
            { label:'Triage Alerts',    value:'2',  sub:'2 critical',     color:'var(--red)'     },
            { label:'Scheduled',        value:'5',  sub:'Next at 2:30 PM',color:'var(--amber)'   },
          ].map((c) => (
            <div key={c.label} className="glass-card animate-fade-in-up" style={{ padding:'var(--sp-5)', cursor:'pointer', transition:'transform var(--t-base)' }}
              onMouseEnter={(e) => e.currentTarget.style.transform='translateY(-3px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform='translateY(0)'}
            >
              <div style={{ fontSize:'2rem', fontWeight:800, color:c.color, marginBottom:4 }}>{c.value}</div>
              <div style={{ fontWeight:600, color:'var(--text-primary)', fontSize:'0.9rem', marginBottom:4 }}>{c.label}</div>
              <div style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>{c.sub}</div>
            </div>
          ))}
        </div>

        <div className="glass-card" style={{ marginTop:'var(--sp-8)', padding:'var(--sp-8)', textAlign:'center' }}>
          <div style={{ fontSize:'3rem', marginBottom:'var(--sp-4)' }}>🔴</div>
          <h3 style={{ color:'var(--text-primary)', marginBottom:'var(--sp-2)' }}>Live Triage Dashboard — Phase 3</h3>
          <p style={{ fontSize:'0.88rem', maxWidth:420, margin:'0 auto' }}>
            Real-time emergency triage stream via Socket.io, patient queue management,
            concurrent schedule editing with Mongoose optimistic locking UI will be built in Phase 3.
          </p>
          <div style={{ marginTop:'var(--sp-4)' }}>
            <span className="badge badge-indigo">Phase 3: Triage & Queue</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DoctorDashboard;
