// client/src/pages/admin/AdminDashboard.jsx
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminOverviewTab      from './tabs/OverviewTab';
import AdminAppointmentsTab  from './tabs/AppointmentsTab';
import DoctorsTab            from './tabs/DoctorsTab';
import PatientsTab           from './tabs/PatientsTab';

const NAV_ITEMS = [
  { id: 'overview',      label: 'Overview',      icon: '📊' },
  { id: 'appointments',  label: 'Appointments',  icon: '📅' },
  { id: 'doctors',       label: 'Doctors',       icon: '🩺' },
  { id: 'patients',      label: 'Patients',      icon: '🧑' },
];

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [active, setActive] = useState('overview');

  const renderTab = () => {
    switch (active) {
      case 'overview':     return <AdminOverviewTab     user={user} />;
      case 'appointments': return <AdminAppointmentsTab />;
      case 'doctors':      return <DoctorsTab />;
      case 'patients':     return <PatientsTab />;
      default:             return <AdminOverviewTab user={user} />;
    }
  };

  return (
    <div style={{ minHeight: '100svh', display: 'flex', background: 'var(--bg-base)' }}>

      {/* ── Sidebar ──────────────────────────────────────────────────────────── */}
      <aside style={{
        width: 260, flexShrink: 0,
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex', flexDirection: 'column',
        padding: 'var(--sp-6) var(--sp-4)', gap: 'var(--sp-1)',
      }}>
        {/* Logo */}
        <div style={{ padding: '0 var(--sp-2) var(--sp-6)', borderBottom: '1px solid var(--border-subtle)', marginBottom: 'var(--sp-3)' }}>
          <div style={{ fontSize: '1.3rem', fontWeight: 900, background: 'linear-gradient(135deg, var(--amber), #fde68a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            MedCore
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 3 }}>
            <span style={{ fontSize: '0.68rem', color: 'var(--amber)', fontWeight: 700 }}>⬡</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Hospital Admin Portal</span>
          </div>
        </div>

        {/* Nav */}
        {NAV_ITEMS.map((item) => {
          const isActive = active === item.id;
          return (
            <button key={item.id} id={`nav-admin-${item.id}`} type="button"
              onClick={() => setActive(item.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 'var(--sp-3)',
                padding: '10px 12px', borderRadius: 'var(--r-md)',
                border: 'none',
                background: isActive ? 'rgba(251,191,36,0.1)' : 'none',
                color: isActive ? 'var(--amber)' : 'var(--text-secondary)',
                cursor: 'pointer', fontSize: '0.9rem',
                fontWeight: isActive ? 600 : 500,
                width: '100%', textAlign: 'left', transition: 'all var(--t-fast)',
                borderLeft: isActive ? '3px solid var(--amber)' : '3px solid transparent',
              }}
              onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.background = 'var(--bg-elevated)'; e.currentTarget.style.color = 'var(--text-primary)'; } }}
              onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-secondary)'; } }}
            >
              <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
              {item.label}
            </button>
          );
        })}

        <div style={{ flex: 1 }} />

        {/* User info */}
        <div style={{ padding: 'var(--sp-3)', borderRadius: 'var(--r-md)', background: 'rgba(255,255,255,0.03)', marginBottom: 'var(--sp-2)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, var(--amber), #f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#000', fontSize: '0.85rem', flexShrink: 0 }}>
              {user?.profile?.firstName?.[0]}{user?.profile?.lastName?.[0]}
            </div>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {user?.profile?.firstName} {user?.profile?.lastName}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Hospital Admin</div>
            </div>
          </div>
        </div>

        {/* Logout */}
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

      {/* ── Main content ─────────────────────────────────────────────────────── */}
      <main style={{ flex: 1, padding: 'var(--sp-8)', overflowY: 'auto' }}>
        {renderTab()}
      </main>
    </div>
  );
};

export default AdminDashboard;
