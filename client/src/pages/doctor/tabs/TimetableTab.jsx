// client/src/pages/doctor/tabs/TimetableTab.jsx
import useAppointments from '../../../hooks/useAppointments';

const STATUS_COLOR = {
  pending:   'var(--amber)',
  confirmed: 'var(--emerald)',
  cancelled: 'var(--red)',
  completed: 'var(--indigo)',
};

const TimetableTab = () => {
  const { appointments, loading, error } = useAppointments('doctor-schedule');

  // Group appointments by formatted date string
  const grouped = appointments.reduce((acc, appt) => {
    const dateKey = new Date(appt.date).toLocaleDateString('en-IN', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(appt);
    return acc;
  }, {});

  return (
    <div>
      <div style={{ marginBottom: 'var(--sp-6)' }}>
        <h3 style={{ color: 'var(--text-primary)', marginBottom: 4 }}>My Timetable</h3>
        <p style={{ fontSize: '0.85rem' }}>All upcoming scheduled appointments across all dates.</p>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: 'var(--sp-12)' }}>
          <span className="spinner spinner-lg" />
        </div>
      )}

      {/* Error */}
      {!loading && error && <div className="alert alert-error">{error}</div>}

      {/* Empty */}
      {!loading && appointments.length === 0 && (
        <div className="glass-card" style={{ padding: 'var(--sp-10)', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: 'var(--sp-3)' }}>📆</div>
          <h4 style={{ color: 'var(--text-primary)', marginBottom: 'var(--sp-2)' }}>Schedule is clear</h4>
          <p style={{ fontSize: '0.88rem' }}>No upcoming appointments scheduled.</p>
        </div>
      )}

      {/* Grouped by date */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
        {Object.entries(grouped).map(([dateStr, appts]) => (
          <div key={dateStr}>
            {/* Date header pill */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', marginBottom: 'var(--sp-3)' }}>
              <div style={{
                padding: '6px 16px', borderRadius: 'var(--r-full)',
                background: 'rgba(129,140,248,0.12)', border: '1px solid rgba(129,140,248,0.3)',
                color: 'var(--indigo)', fontSize: '0.82rem', fontWeight: 600,
              }}>
                📆 {dateStr}
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {appts.length} appointment{appts.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Appointment cards for this date */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--sp-3)' }}>
              {appts.map((appt) => {
                const p = appt.patientId?.profile || {};
                return (
                  <div
                    key={appt._id}
                    className="glass-card animate-fade-in-up"
                    style={{
                      padding: 'var(--sp-4)',
                      borderLeft: `3px solid ${STATUS_COLOR[appt.status] || 'var(--border-medium)'}`,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--sp-2)' }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                        {p.firstName} {p.lastName}
                      </span>
                      <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--indigo)' }}>
                        {appt.timeSlot}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 'var(--sp-2)' }}>
                      {appt.reason}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_COLOR[appt.status] }} />
                      <span style={{ fontSize: '0.72rem', color: STATUS_COLOR[appt.status], fontWeight: 600, textTransform: 'capitalize' }}>
                        {appt.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimetableTab;
