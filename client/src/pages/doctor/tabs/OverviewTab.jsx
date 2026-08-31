// client/src/pages/doctor/tabs/OverviewTab.jsx
import useAppointments from '../../../hooks/useAppointments';

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

const DoctorOverviewTab = ({ user, onNavigate }) => {
  const { appointments: queue, loading: qLoading } = useAppointments('doctor-queue');
  const { appointments: schedule, loading: sLoading } = useAppointments('doctor-schedule');

  const pending = queue.filter((a) => a.status === 'pending').length;
  const confirmed = queue.filter((a) => a.status === 'confirmed').length;
  const nextAppt = queue[0];

  return (
    <div>
      {/* Welcome */}
      <div style={{ marginBottom: 'var(--sp-8)', animation: 'fadeInDown 0.4s ease both' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', letterSpacing: '0.1em', marginBottom: 6 }}>
          DOCTOR PORTAL
        </p>
        <h2 style={{ color: 'var(--text-primary)', marginBottom: 6 }}>
          Dr. {user?.profile?.firstName} {user?.profile?.lastName}
        </h2>
        <p style={{ fontSize: '0.88rem' }}>
          {user?.profile?.specialization || 'General Medicine'} · {user?.profile?.department || 'Internal Medicine'}
        </p>
      </div>

      {/* Stats */}
      <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 'var(--sp-4)', marginBottom: 'var(--sp-8)' }}>
        <StatCard icon="⏳" label="Pending Today"
          value={qLoading ? '—' : pending}
          sub="Awaiting confirmation"
          color="var(--amber)"
          onClick={() => onNavigate('queue')}
        />
        <StatCard icon="✅" label="Confirmed Today"
          value={qLoading ? '—' : confirmed}
          sub="Ready to see"
          color="var(--emerald)"
          onClick={() => onNavigate('queue')}
        />
        <StatCard icon="📆" label="Total Upcoming"
          value={sLoading ? '—' : schedule.length}
          sub="Across all dates"
          color="var(--indigo)"
          onClick={() => onNavigate('timetable')}
        />
        <StatCard icon="🩺" label="In Queue Now"
          value={qLoading ? '—' : queue.length}
          sub="Today's total"
          color="var(--rose)"
          onClick={() => onNavigate('queue')}
        />
      </div>

      {/* Next patient card */}
      {nextAppt && (
        <div className="glass-card" style={{ padding: 'var(--sp-6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', marginBottom: 'var(--sp-4)' }}>
            <div style={{ fontSize: '1.5rem' }}>👤</div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: '0.08em' }}>NEXT PATIENT</div>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.05rem' }}>
                {nextAppt.patientId?.profile?.firstName} {nextAppt.patientId?.profile?.lastName}
              </div>
            </div>
            <span
              className={`badge ${nextAppt.status === 'confirmed' ? 'badge-emerald' : 'badge-amber'}`}
              style={{ marginLeft: 'auto' }}
            >
              {nextAppt.status}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 'var(--sp-6)', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>TIME</div>
              <div style={{ fontWeight: 600, color: 'var(--indigo)', fontSize: '1.1rem' }}>{nextAppt.timeSlot}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>REASON</div>
              <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{nextAppt.reason}</div>
            </div>
            {nextAppt.patientId?.profile?.bloodGroup && (
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>BLOOD GROUP</div>
                <div style={{ fontWeight: 600, color: 'var(--rose)' }}>{nextAppt.patientId.profile.bloodGroup}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty queue */}
      {!qLoading && queue.length === 0 && (
        <div className="glass-card" style={{ padding: 'var(--sp-8)', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: 'var(--sp-3)' }}>✨</div>
          <h4 style={{ color: 'var(--text-primary)', marginBottom: 'var(--sp-2)' }}>Queue is clear for today</h4>
          <p style={{ fontSize: '0.88rem' }}>No pending or confirmed appointments for today.</p>
        </div>
      )}
    </div>
  );
};

export default DoctorOverviewTab;
