// client/src/pages/admin/AdminDashboard.jsx
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: '📊' },
  { id: 'beds', label: 'Bed Management', icon: '🛏️' },
  { id: 'doctors', label: 'Doctors', icon: '👨‍⚕️' },
  { id: 'resources', label: 'Resources', icon: '🏗️' },
  { id: 'analytics', label: 'Analytics', icon: '📈' },
  { id: 'profile', label: 'Settings', icon: '⚙️' },
];

const AdminDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div style={{ minHeight: '100svh', display: 'flex', background: 'var(--bg-base)' }}>
      <aside style={{
        width: 260, flexShrink: 0,
        background: 'var(--bg-secondary)', borderRight: '1px solid var(--border-subtle)',
        display: 'flex', flexDirection: 'column', padding: 'var(--sp-6) var(--sp-4)', gap: 'var(--sp-2)',
      }}>
        <div style={{ padding: '0 var(--sp-2) var(--sp-6)', borderBottom: '1px solid var(--border-subtle)', marginBottom: 'var(--sp-2)' }}>
          <div style={{ fontSize: '1.3rem', fontWeight: 900, background: 'linear-gradient(135deg, var(--amber), #fde68a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            MedCore
          </div>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>Hospital Admin Portal</p>
        </div>

        {NAV_ITEMS.map((item) => (
          <button key={item.id} id={`nav-admin-${item.id}`} type="button"
            style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', padding: '10px 12px', borderRadius: 'var(--r-md)', border: 'none', background: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500, width: '100%', textAlign: 'left', transition: 'all var(--t-fast)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-elevated)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
            {item.label}
          </button>
        ))}

        <div style={{ flex: 1 }} />
        <button type="button" onClick={logout} id="btn-admin-logout"
          style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', padding: '10px 12px', borderRadius: 'var(--r-md)', border: '1px solid var(--border-subtle)', background: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem', width: '100%', transition: 'all var(--t-fast)' }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--red)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Sign Out
        </button>
      </aside>

      <main style={{ flex: 1, padding: 'var(--sp-8)', overflowY: 'auto' }}>
        <div style={{ marginBottom: 'var(--sp-8)', animation: 'fadeInDown 0.4s ease both' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: 4 }}>HOSPITAL ADMIN PORTAL</p>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: 4 }}>Hospital Dashboard</h2>
          <p style={{ fontSize: '0.88rem' }}>Manage resources, beds, and analytics for your hospital.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 'var(--sp-4)' }} className="stagger">
          {[
            { label: 'Total Beds', value: '340', sub: '280 occupied (82%)', color: 'var(--amber)' },
            { label: 'ICU Availability', value: '12', sub: 'of 40 total', color: 'var(--rose)' },
            { label: 'Active Doctors', value: '48', sub: '11 on emergency duty', color: 'var(--cyan)' },
            { label: 'Today\'s Admissions', value: '23', sub: '+5 from yesterday', color: 'var(--emerald)' },
          ].map((c) => (
            <div key={c.label} className="glass-card animate-fade-in-up" style={{ padding: 'var(--sp-5)', cursor: 'pointer', transition: 'transform var(--t-base)' }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ fontSize: '2rem', fontWeight: 800, color: c.color, marginBottom: 4 }}>{c.value}</div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem', marginBottom: 4 }}>{c.label}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{c.sub}</div>
            </div>
          ))}
        </div>

        <div className="glass-card" style={{ marginTop: 'var(--sp-8)', padding: 'var(--sp-8)', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: 'var(--sp-4)' }}>🏥</div>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: 'var(--sp-2)' }}>Resource Management — Phase 4</h3>
          <p style={{ fontSize: '0.88rem', maxWidth: 420, margin: '0 auto' }}>
            Bed management, doctor scheduling, hospital-scoped analytics, and resource allocation
            will be built in Phase 4.
          </p>
          <div style={{ marginTop: 'var(--sp-4)' }}>
            <span className="badge badge-amber">Phase 4: Hospital Management</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;