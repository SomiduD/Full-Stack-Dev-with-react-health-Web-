// client/src/pages/patient/tabs/OverviewTab.jsx
import useAppointments from '../../../hooks/useAppointments';
import useHealthRecords from '../../../hooks/useHealthRecords';
import useOffline from '../../../hooks/useOffline';

const StatCard = ({ icon, label, value, sub, color, onClick }) => (
  <div
    className="glass-card animate-fade-in-up"
    onClick={onClick}
    style={{
      padding: 'var(--sp-5)', cursor: onClick ? 'pointer' : 'default',
      transition: 'transform var(--t-base)',
    }}
    onMouseEnter={(e) => { if (onClick) e.currentTarget.style.transform = 'translateY(-3px)'; }}
    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--sp-3)' }}>
      <span style={{ fontSize: '1.8rem' }}>{icon}</span>
      <span style={{ fontSize: '2.2rem', fontWeight: 800, color }}>{value}</span>
    </div>
    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem', marginBottom: 4 }}>{label}</div>
    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{sub}</div>
  </div>
);

const OverviewTab = ({ user, onNavigate }) => {
  const { appointments, loading: aLoading } = useAppointments('patient', { upcoming: 'true' });
  const { records,      loading: rLoading } = useHealthRecords();
  const { isOnline } = useOffline();

  const upcoming      = appointments.filter((a) => a.status !== 'cancelled');
  const nextAppt      = upcoming[0];
  const nextApptLabel = nextAppt
    ? `Next: ${new Date(nextAppt.date).toLocaleDateString()} at ${nextAppt.timeSlot}`
    : 'No upcoming appointments';

  const prescriptions = records.filter((r) => r.type === 'prescription');

  return (
    <div>
      {/* Welcome header */}
      <div style={{ marginBottom: 'var(--sp-8)', animation: 'fadeInDown 0.4s ease both' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', letterSpacing: '0.1em', marginBottom: 6 }}>
          PATIENT PORTAL
        </p>
        <h2 style={{ color: 'var(--text-primary)', marginBottom: 6 }}>
          Welcome back, {user?.profile?.firstName} 👋
        </h2>
        <p style={{ fontSize: '0.88rem' }}>
          {isOnline
            ? 'Your health data is synced and up to date.'
            : 'Showing cached data — you are offline.'}
        </p>
      </div>

      {/* Stat cards */}
      <div
        className="stagger"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 'var(--sp-4)', marginBottom: 'var(--sp-8)' }}
      >
        <StatCard
          icon="📅" label="Upcoming Appointments"
          value={aLoading ? '—' : upcoming.length}
          sub={nextApptLabel}
          color="var(--cyan)"
          onClick={() => onNavigate('appointments')}
        />
        <StatCard
          icon="📋" label="Health Records"
          value={rLoading ? '—' : records.length}
          sub={records.length > 0 ? `Last added: ${new Date(records[0]?.date).toLocaleDateString()}` : 'No records yet'}
          color="var(--indigo)"
          onClick={() => onNavigate('vault')}
        />
        <StatCard
          icon="💊" label="Active Prescriptions"
          value={rLoading ? '—' : prescriptions.length}
          sub={prescriptions.length > 0 ? 'Tap to view' : 'No active prescriptions'}
          color="var(--amber)"
          onClick={() => onNavigate('prescriptions')}
        />
        <StatCard
          icon={isOnline ? '✅' : '⚡'} label="Sync Status"
          value={isOnline ? 'Live' : 'Offline'}
          sub={isOnline ? 'All data synced' : 'Dexie cache active'}
          color={isOnline ? 'var(--emerald)' : 'var(--amber)'}
        />
      </div>

      {/* Next appointment card */}
      {nextAppt && (
        <div className="glass-card" style={{ padding: 'var(--sp-6)', marginBottom: 'var(--sp-6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', marginBottom: 'var(--sp-4)' }}>
            <div style={{ fontSize: '1.5rem' }}>📅</div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: '0.08em' }}>NEXT APPOINTMENT</div>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.05rem' }}>
                Dr. {nextAppt.doctorId?.profile?.firstName} {nextAppt.doctorId?.profile?.lastName}
              </div>
            </div>
            <span className={`badge badge-${nextAppt.status === 'confirmed' ? 'emerald' : 'amber'}`} style={{ marginLeft: 'auto' }}>
              {nextAppt.status}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 'var(--sp-6)' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>DATE</div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                {new Date(nextAppt.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TIME</div>
              <div style={{ fontWeight: 600, color: 'var(--cyan)' }}>{nextAppt.timeSlot}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>REASON</div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{nextAppt.reason}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OverviewTab;
