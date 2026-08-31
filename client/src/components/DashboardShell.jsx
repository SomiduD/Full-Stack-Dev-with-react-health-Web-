// client/src/components/DashboardShell.jsx
import ThemeToggle from './ThemeToggle';
/**
 * DashboardShell — reusable sidebar + main layout.
 * Used by PatientDashboard and DoctorDashboard.
 *
 * Props:
 *   accentColor   — CSS var string e.g. 'var(--cyan)'
 *   gradientFrom  — CSS color string for logo gradient start
 *   gradientTo    — CSS color string for logo gradient end
 *   navItems      — [{ id, label, icon }]
 *   activeTab     — current tab id
 *   onTabChange   — fn(id)
 *   onLogout      — fn()
 *   statusDot     — React node (online/socket indicator)
 *   footerBadge   — React node (optional, e.g. offline badge)
 *   children      — main content
 */
const DashboardShell = ({
  accentColor = 'var(--cyan)',
  gradientFrom = '#00d4ff',
  gradientTo   = '#0080ff',
  navItems     = [],
  activeTab,
  onTabChange,
  onLogout,
  statusDot,
  footerBadge,
  children,
}) => {
  return (
    <div style={{ minHeight: '100svh', display: 'flex', background: 'var(--bg-base)' }}>

      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside style={{
        width: 260, flexShrink: 0,
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex', flexDirection: 'column',
        padding: 'var(--sp-6) var(--sp-4)',
        gap: 'var(--sp-1)',
        position: 'sticky', top: 0, height: '100svh',
        overflowY: 'auto',
      }}>

        {/* Logo + status */}
        <div style={{
          padding: '0 var(--sp-2) var(--sp-5)',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: 'var(--sp-3)',
        }}>
          <div style={{
            fontSize: '1.4rem', fontWeight: 900,
            background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            marginBottom: 6,
          }}>
            MedCore
          </div>
          {statusDot}
        </div>

        {/* Nav items */}
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              type="button"
              onClick={() => onTabChange(item.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 'var(--sp-3)',
                padding: '10px 12px', borderRadius: 'var(--r-md)',
                border: isActive ? `1px solid ${accentColor}30` : '1px solid transparent',
                background: isActive ? `${accentColor}12` : 'none',
                color: isActive ? accentColor : 'var(--text-secondary)',
                cursor: 'pointer', fontSize: '0.9rem', fontWeight: isActive ? 600 : 500,
                width: '100%', textAlign: 'left',
                transition: 'all var(--t-fast)',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'var(--bg-elevated)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'none';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
            >
              <span style={{ fontSize: '1.1rem', width: 22, textAlign: 'center' }}>
                {item.icon}
              </span>
              {item.label}
              {item.badge != null && item.badge > 0 && (
                <span style={{
                  marginLeft: 'auto', minWidth: 20, height: 20,
                  background: accentColor, color: 'var(--bg-base)',
                  borderRadius: 'var(--r-full)', fontSize: '0.7rem',
                  fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '0 5px',
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        <div style={{ flex: 1 }} />

        {footerBadge && (
          <div style={{ marginBottom: 'var(--sp-2)' }}>{footerBadge}</div>
        )}

        {/* Theme toggle */}
        <div style={{ marginBottom: 'var(--sp-2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 4px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>Theme</span>
          <ThemeToggle />
        </div>

        {/* Logout */}
        <button
          type="button"
          id="btn-logout"
          onClick={onLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: 'var(--sp-2)',
            padding: '10px 12px', borderRadius: 'var(--r-md)',
            border: '1px solid var(--border-subtle)',
            background: 'none', color: 'var(--text-muted)',
            cursor: 'pointer', fontSize: '0.85rem', width: '100%',
            transition: 'all var(--t-fast)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)';
            e.currentTarget.style.color = 'var(--red)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-subtle)';
            e.currentTarget.style.color = 'var(--text-muted)';
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Sign Out
        </button>
      </aside>

      {/* ── Main content ─────────────────────────────────────────────────────── */}
      <main style={{ flex: 1, padding: 'var(--sp-8)', overflowY: 'auto', minHeight: '100svh' }}>
        {children}
      </main>
    </div>
  );
};

export default DashboardShell;
