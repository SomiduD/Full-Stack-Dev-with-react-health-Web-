// client/src/pages/patient/tabs/AppointmentsTab.jsx
import { useState } from 'react';
import useAppointments from '../../../hooks/useAppointments';
import { getDoctorsInHospital } from '../../../services/healthRecordService';
import { bookAppointment, updateAppointmentStatus, getAvailableSlots } from '../../../services/appointmentService';

const STATUS_BADGE = {
  pending:   'badge-amber',
  confirmed: 'badge-emerald',
  cancelled: 'badge-red',
  completed: 'badge-indigo',
};

const AppointmentsTab = () => {
  const { appointments, loading, error, refetch } = useAppointments('patient');
  const [view,     setView]     = useState('list'); // 'list' | 'book'
  const [doctors,  setDoctors]  = useState([]);
  const [slots,    setSlots]    = useState({ available: [], booked: [] });
  const [form,     setForm]     = useState({ doctorId: '', date: '', timeSlot: '', reason: '' });
  const [formErr,  setFormErr]  = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const openBooking = async () => {
    setView('book');
    setFormErr('');
    try {
      const res = await getDoctorsInHospital();
      setDoctors(res.data || []);
    } catch {
      setFormErr('Could not load doctors. Please try again.');
    }
  };

  const onDoctorDateChange = async (doctorId, date) => {
    if (!doctorId || !date) return;
    setSlotsLoading(true);
    try {
      const res = await getAvailableSlots(doctorId, date);
      setSlots(res.data || { available: [], booked: [] });
    } catch {
      setSlots({ available: [], booked: [] });
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleField = (k, v) => {
    const next = { ...form, [k]: v };
    if (k === 'timeSlot') next.timeSlot = v;
    setForm(next);
    if ((k === 'doctorId' || k === 'date') && next.doctorId && next.date) {
      onDoctorDateChange(next.doctorId, next.date);
    }
  };

  const handleBook = async (e) => {
    e.preventDefault();
    setFormErr('');
    if (!form.doctorId || !form.date || !form.timeSlot || !form.reason.trim()) {
      setFormErr('All fields are required.');
      return;
    }
    setSubmitting(true);
    try {
      await bookAppointment(form);
      setView('list');
      setForm({ doctorId: '', date: '', timeSlot: '', reason: '' });
      refetch();
    } catch (err) {
      setFormErr(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      await updateAppointmentStatus(id, { status: 'cancelled', cancelledReason: 'Cancelled by patient' });
      refetch();
    } catch { /* ignore */ }
  };

  const minDate = new Date().toISOString().split('T')[0];

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sp-6)' }}>
        <div>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: 4 }}>My Appointments</h3>
          <p style={{ fontSize: '0.85rem' }}>Book and manage your consultations.</p>
        </div>
        {view === 'list' ? (
          <button id="btn-book-appt" type="button" className="btn btn-primary" onClick={openBooking}>
            + Book Appointment
          </button>
        ) : (
          <button type="button" className="btn btn-ghost" onClick={() => setView('list')}>
            ← Back to List
          </button>
        )}
      </div>

      {/* Book form */}
      {view === 'book' && (
        <div className="glass-card animate-scale-in" style={{ padding: 'var(--sp-6)', marginBottom: 'var(--sp-6)' }}>
          <h4 style={{ color: 'var(--text-primary)', marginBottom: 'var(--sp-4)' }}>Book New Appointment</h4>
          <form onSubmit={handleBook} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-4)' }}>
              {/* Doctor select */}
              <div className="form-group">
                <label className="form-label">Doctor</label>
                <select
                  id="select-doctor"
                  className="form-input form-select"
                  value={form.doctorId}
                  onChange={(e) => handleField('doctorId', e.target.value)}
                >
                  <option value="">Select a doctor…</option>
                  {doctors.map((d) => (
                    <option key={d._id} value={d._id}>
                      Dr. {d.profile?.firstName} {d.profile?.lastName}
                      {d.profile?.specialization ? ` — ${d.profile.specialization}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div className="form-group">
                <label className="form-label">Date</label>
                <input
                  id="input-appt-date"
                  type="date"
                  className="form-input"
                  min={minDate}
                  value={form.date}
                  onChange={(e) => handleField('date', e.target.value)}
                />
              </div>
            </div>

            {/* Time slots */}
            {form.doctorId && form.date && (
              <div className="form-group">
                <label className="form-label">
                  Available Time Slots{slotsLoading ? ' — loading…' : ` (${slots.available?.length} available)`}
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-2)' }}>
                  {slots.available?.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, timeSlot: slot }))}
                      style={{
                        padding: '6px 14px', borderRadius: 'var(--r-md)', fontSize: '0.85rem',
                        border: form.timeSlot === slot ? '1.5px solid var(--cyan)' : '1px solid var(--border-medium)',
                        background: form.timeSlot === slot ? 'rgba(0,212,255,0.12)' : 'var(--bg-surface)',
                        color: form.timeSlot === slot ? 'var(--cyan)' : 'var(--text-secondary)',
                        fontWeight: form.timeSlot === slot ? 600 : 400,
                        cursor: 'pointer', transition: 'all var(--t-fast)',
                      }}
                    >
                      {slot}
                    </button>
                  ))}
                  {slots.available?.length === 0 && !slotsLoading && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No slots available on this date.</p>
                  )}
                </div>
              </div>
            )}

            {/* Reason */}
            <div className="form-group">
              <label className="form-label">Reason for Visit</label>
              <textarea
                id="input-appt-reason"
                className="form-input"
                rows={3}
                placeholder="Briefly describe your concern…"
                value={form.reason}
                onChange={(e) => handleField('reason', e.target.value)}
                style={{ resize: 'vertical' }}
              />
            </div>

            {formErr && <div className="alert alert-error">{formErr}</div>}

            <button id="btn-confirm-book" type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
              {submitting ? <><span className="spinner" /> Booking…</> : 'Confirm Booking'}
            </button>
          </form>
        </div>
      )}

      {/* Appointments list */}
      {view === 'list' && (
        <>
          {loading && (
            <div style={{ textAlign: 'center', padding: 'var(--sp-12)', color: 'var(--text-muted)' }}>
              <span className="spinner spinner-lg" />
            </div>
          )}
          {!loading && error && <div className="alert alert-error">{error}</div>}
          {!loading && appointments.length === 0 && (
            <div className="glass-card" style={{ padding: 'var(--sp-10)', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: 'var(--sp-3)' }}>📅</div>
              <h4 style={{ color: 'var(--text-primary)', marginBottom: 'var(--sp-2)' }}>No appointments yet</h4>
              <p style={{ fontSize: '0.88rem', marginBottom: 'var(--sp-4)' }}>Book your first appointment with a doctor at your hospital.</p>
              <button type="button" className="btn btn-primary" onClick={openBooking}>Book Now</button>
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
            {appointments.map((appt) => (
              <div key={appt._id} className="glass-card animate-fade-in-up" style={{ padding: 'var(--sp-5)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--sp-4)' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', marginBottom: 'var(--sp-2)' }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem' }}>
                        Dr. {appt.doctorId?.profile?.firstName} {appt.doctorId?.profile?.lastName}
                      </span>
                      <span className={`badge ${STATUS_BADGE[appt.status] || 'badge-amber'}`}>{appt.status}</span>
                    </div>
                    {appt.doctorId?.profile?.specialization && (
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 'var(--sp-2)' }}>
                        {appt.doctorId.profile.specialization}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: 'var(--sp-5)', flexWrap: 'wrap' }}>
                      <div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>DATE  </span>
                        <span style={{ fontSize: '0.88rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                          {new Date(appt.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>TIME  </span>
                        <span style={{ fontSize: '0.88rem', color: 'var(--cyan)', fontWeight: 600 }}>{appt.timeSlot}</span>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>REASON  </span>
                        <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>{appt.reason}</span>
                      </div>
                    </div>
                  </div>
                  {appt.status === 'pending' || appt.status === 'confirmed' ? (
                    <button
                      type="button"
                      className="btn btn-sm"
                      onClick={() => handleCancel(appt._id)}
                      style={{ border: '1px solid var(--border-medium)', background: 'none', color: 'var(--red)', borderColor: 'rgba(239,68,68,0.3)', flexShrink: 0 }}
                    >
                      Cancel
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AppointmentsTab;
