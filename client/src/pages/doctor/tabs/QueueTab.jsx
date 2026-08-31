// client/src/pages/doctor/tabs/QueueTab.jsx
import { useState } from 'react';
import useAppointments from '../../../hooks/useAppointments';
import { updateAppointmentStatus } from '../../../services/appointmentService';

const STATUS_COLOR = {
  pending:   'var(--amber)',
  confirmed: 'var(--emerald)',
  cancelled: 'var(--red)',
  completed: 'var(--indigo)',
};

const QueueTab = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const { appointments, loading, error, refetch } = useAppointments('doctor-queue', { date: selectedDate });
  const [updating, setUpdating] = useState(null);

  const handleStatus = async (id, status, extra = {}) => {
    setUpdating(id);
    try {
      await updateAppointmentStatus(id, { status, ...extra });
      refetch();
    } catch { /* ignore */ } finally {
      setUpdating(null);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sp-6)' }}>
        <div>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: 4 }}>Patient Queue</h3>
          <p style={{ fontSize: '0.85rem' }}>Manage today's patient appointments.</p>
        </div>
        <input
          id="input-queue-date"
          type="date"
          className="form-input"
          style={{ width: 'auto' }}
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
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
          <div style={{ fontSize: '3rem', marginBottom: 'var(--sp-3)' }}>✨</div>
          <h4 style={{ color: 'var(--text-primary)', marginBottom: 'var(--sp-2)' }}>No patients in queue</h4>
          <p style={{ fontSize: '0.88rem' }}>No pending or confirmed appointments for this date.</p>
        </div>
      )}

      {/* Queue list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
        {appointments.map((appt, i) => {
          const p = appt.patientId?.profile || {};
          const isUpdating = updating === appt._id;
          return (
            <div key={appt._id} className="glass-card animate-fade-in-up" style={{ padding: 'var(--sp-5)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--sp-4)' }}>

                {/* Queue number badge */}
                <div style={{
                  width: 40, height: 40, flexShrink: 0, borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--indigo), #6366f1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, color: '#fff', fontSize: '1rem',
                }}>
                  {i + 1}
                </div>

                {/* Patient details */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', marginBottom: 'var(--sp-2)' }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem' }}>
                      {p.firstName} {p.lastName}
                    </span>
                    <span style={{
                      fontSize: '0.72rem', fontWeight: 600, padding: '2px 8px',
                      borderRadius: 'var(--r-full)',
                      border: `1px solid ${STATUS_COLOR[appt.status]}40`,
                      color: STATUS_COLOR[appt.status],
                      background: `${STATUS_COLOR[appt.status]}12`,
                    }}>
                      {appt.status}
                    </span>
                    <span style={{ marginLeft: 'auto', fontSize: '1.1rem', fontWeight: 700, color: 'var(--indigo)' }}>
                      {appt.timeSlot}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: 'var(--sp-5)', flexWrap: 'wrap', marginBottom: 'var(--sp-3)' }}>
                    {p.gender && (
                      <div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>GENDER  </span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{p.gender}</span>
                      </div>
                    )}
                    {p.bloodGroup && (
                      <div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>BLOOD  </span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--rose)', fontWeight: 600 }}>{p.bloodGroup}</span>
                      </div>
                    )}
                    <div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>REASON  </span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{appt.reason}</span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: 'var(--sp-2)', flexWrap: 'wrap' }}>
                    {appt.status === 'pending' && (
                      <button
                        type="button"
                        disabled={isUpdating}
                        className="btn btn-sm"
                        style={{ background: 'rgba(16,185,129,0.12)', color: 'var(--emerald)', border: '1px solid rgba(16,185,129,0.3)' }}
                        onClick={() => handleStatus(appt._id, 'confirmed')}
                      >
                        {isUpdating ? <span className="spinner" /> : '✓ Confirm'}
                      </button>
                    )}
                    {(appt.status === 'pending' || appt.status === 'confirmed') && (
                      <>
                        <button
                          type="button"
                          disabled={isUpdating}
                          className="btn btn-sm"
                          style={{ background: 'rgba(129,140,248,0.12)', color: 'var(--indigo)', border: '1px solid rgba(129,140,248,0.3)' }}
                          onClick={() => handleStatus(appt._id, 'completed')}
                        >
                          {isUpdating ? <span className="spinner" /> : '🩺 Mark Complete'}
                        </button>
                        <button
                          type="button"
                          disabled={isUpdating}
                          className="btn btn-sm"
                          style={{ background: 'rgba(239,68,68,0.08)', color: 'var(--red)', border: '1px solid rgba(239,68,68,0.25)' }}
                          onClick={() => handleStatus(appt._id, 'cancelled', { cancelledReason: 'Cancelled by doctor' })}
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    {appt.status === 'completed' && (
                      <span style={{ fontSize: '0.82rem', color: 'var(--emerald)', fontWeight: 500 }}>✓ Consultation complete</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QueueTab;
