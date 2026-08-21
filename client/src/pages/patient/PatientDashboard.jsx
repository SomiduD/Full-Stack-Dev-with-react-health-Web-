// client/src/pages/patient/PatientDashboard.jsx
import { useAuth } from '../../context/AuthContext';
import useOffline from '../../hooks/useOffline';

const NAV_ITEMS = [
  { id: 'vault',        label: 'Health Vault',       icon: '🗂️' },
  { id: 'appointments', label: 'Appointments',       icon: '📅' },
  { id: 'emergency',    label: 'Emergency Help',     icon: '🚨' },
  { id: 'prescriptions',label: 'Prescriptions',      icon: '💊' },
  { id: 'profile',      label: 'My Profile',         icon: '👤' },
];

const PatientDashboard = () => {
  const { user, logout } = useAuth();
  const { isOnline }     = useOffline();

  return (
    <div style={{ minHeight: '100svh', display: 'flex', background: 'var(--bg-base)' }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: 260, flexShrink: 0,
        background: 'var(--bg-secondary)', borderRight: '1px solid var(--border-subtle)',
        display: 'flex', flexDirection: 'column', padding: 'var(--sp-6) var(--sp-4)', gap: 'var(--sp-2)',
      }}>
        {/* Logo */}
        <div style={{ padding: '0 var(--sp-2) var(--sp-6)', borderBottom: '1px solid var(--border-subtle)', marginBottom: 'var(--sp-2)' }}>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, background: 'linear-gradient(135deg, var(--cyan), #a5f3fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            MedCore
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
            {/* Added dynamic shadow/pulse for the connection dot */}
            <div 
              className={isOnline ? 'dot-online pulse-animation' : 'dot-offline'} 
              style={{
                width: 8, height: 8, borderRadius: '50%',
                background: isOnline ? 'var(--emerald)' : 'var(--amber)',
                boxShadow: isOnline ? '0 0 8px var(--emerald)' : 'none'
              }}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              {isOnline ? 'System Online' : 'Offline Mode Active'}
            </span>
          </div>
        </div>

        {/* Nav */}
        {NAV_ITEMS.map((item) => (
          <button key={item.id} id={`nav-${item.id}`} type="button"
            style={{
              display: 'flex', alignItems: 'center', gap: 'var(--sp-3)',
              padding: '10px 12px', borderRadius: 'var(--r-md)', border: 'none',
              background: 'none', color: 'var(--text-secondary)', cursor: 'pointer',
              fontSize: '0.95rem', fontWeight: 500, width: '100%', textAlign: 'left',
              transition: 'all var(--t-fast)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-elevated)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
            {item.label}
          </button>
        ))}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Offline badge - polished to stand out more when network drops */}
        {!isOnline && (
          <div className="badge badge-amber" style={{ justifyContent: 'center', marginBottom: 'var(--sp-4)', padding: '8px', border: '1px solid var(--amber)' }}>
            ⚡ Offline — Vault Cached
          </div>
        )}

        {/* Logout */}
        <button type="button" onClick={logout} id="btn-patient-logout"
          style={{
            display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', padding: '10px 12px',
            borderRadius: 'var(--r-md)', border: '1px solid var(--border-subtle)',
            background: 'none', color: 'var(--text-muted)', cursor: 'pointer',
            fontSize: '0.85rem', width: '100%', transition: 'all var(--t-fast)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--red)'; e.currentTarget.style.color = 'var(--red)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Sign Out
        </button>
      </aside>

      {/* ── Main content ── */}
      <main style={{ flex: 1, padding: 'var(--sp-8)', overflowY: 'auto' }}>
        
        {/* Welcome header - modified to include a primary action button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--sp-8)', animation: 'fadeInDown 0.4s ease both' }}>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', letterSpacing: '0.5px', marginBottom: 4 }}>PATIENT PORTAL</p>
            <h2 style={{ color: 'var(--text-primary)', marginBottom: 4, fontSize: '1.8rem' }}>
              Good morning, {user?.profile?.firstName || 'Guest'} 👋
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Your health data is {isOnline ? 'synced and up to date' : 'available offline via your local vault'}.
            </p>
          </div>
          
          <button style={{
            background: 'var(--cyan)', color: '#000', border: 'none', padding: '8px 16px', borderRadius: 'var(--r-md)', fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#67e8f9'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'var(--cyan)'}
          >
            + Book Appointment
          </button>
        </div>

        {/* Data cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--sp-5)' }} className="stagger">
          {[
            { label: 'Appointments', value: '2', sub: 'Next: Tmrw 10:00 AM', color: 'var(--cyan)',    icon: '📅' },
            { label: 'Health Records', value: '8', sub: '3 new since last visit', color: 'var(--indigo)', icon: '📋' },
            { label: 'Prescriptions',  value: '1', sub: 'Refill due in 5 days',   color: 'var(--amber)',  icon: '💊' },
            { label: 'Offline Drafts', value: '0', sub: 'All data synced',        color: 'var(--emerald)',icon: '✅' },
          ].map((card) => (
            <div key={card.label} className="glass-card animate-fade-in-up"
              style={{ padding: 'var(--sp-5)', cursor: 'pointer', transition: 'all var(--t-base)', border: '1px solid transparent' }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'transparent'; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--sp-3)' }}>
                <span style={{ fontSize: '1.8rem' }}>{card.icon}</span>
                <span style={{ fontSize: '2.2rem', fontWeight: 800, color: card.color, lineHeight: 1 }}>{card.value}</span>
              </div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem', marginBottom: 4 }}>{card.label}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{card.sub}</div>
            </div>
          ))}
        </div>

        {/* Phase 2 placeholder */}
        <div className="glass-card" style={{ marginTop: 'var(--sp-8)', padding: 'var(--sp-10)', textAlign: 'center', border: '1px dashed var(--border-subtle)' }}>
          <div style={{ fontSize: '3rem', marginBottom: 'var(--sp-3)' }}>🏗️</div>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: 'var(--sp-2)' }}>Phase 2 Features Pending</h3>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', maxWidth: 480, margin: '0 auto', lineHeight: 1.5 }}>
            The offline-capable Digital Health Vault and appointment booking systems rely on Dexie.js integration, which is slated for the upcoming sprint.
          </p>
          <div style={{ marginTop: 'var(--sp-6)' }}>
            <span className="badge badge-cyan" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Phase 2: Offline Vault</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PatientDashboard;