// client/src/pages/admin/tabs/AppointmentsTab.jsx
import { useState, useEffect } from 'react';
import { getAdminAppointments } from '../../../services/adminService';

const STATUS_COLOR = {
  pending:   'var(--amber)',
  confirmed: 'var(--emerald)',
  cancelled: 'var(--red)',
  completed: 'var(--indigo)',
};

const AdminAppointmentsTab = () => {
  const [appointments, setAppointments] = useState([]);
  const [pagination,   setPagination]   = useState({});
  const [loading,      setLoading]      = useState(true);
  const [filters, setFilters] = useState({ status: '', date: '', page: 1 });

  const load = (f = filters) => {
    setLoading(true);
    const params = { page: f.page, limit: 15 };
    if (f.status) params.status = f.status;
    if (f.date)   params.date   = f.date;
    getAdminAppointments(params)
      .then(r => { setAppointments(r.data || []); setPagination(r.pagination || {}); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []); // eslint-disable-line

  const applyFilter = (key, value) => {
    const next = { ...filters, [key]: value, page: 1 };
    setFilters(next);
    load(next);
  };

  return (
    <div>
      <div style={{ marginBottom: 'var(--sp-6)' }}>
        <h3 style={{ color: 'var(--text-primary)', marginBottom: 4 }}>All Appointments</h3>
        <p style={{ fontSize: '0.85rem' }}>Hospital-wide appointment overview.</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 'var(--sp-3)', flexWrap: 'wrap', marginBottom: 'var(--sp-5)' }}>
        {['', 'pending', 'confirmed', 'completed', 'cancelled'].map(s => (
          <button key={s || 'all'} type="button" onClick={() => applyFilter('status', s)}
            style={{
              padding: '6px 14px', borderRadius: 'var(--r-full)', fontSize: '0.82rem',
              border: filters.status === s ? '1.5px solid var(--amber)' : '1px solid var(--border-medium)',
              background: filters.status === s ? 'rgba(251,191,36,0.12)' : 'var(--bg-surface)',
              color: filters.status === s ? 'var(--amber)' : 'var(--text-secondary)',
              cursor: 'pointer', fontWeight: filters.status === s ? 600 : 400,
              transition: 'all var(--t-fast)',
            }}>
            {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
          </button>
        ))}
        <input type="date" className="form-input" style={{ width: 'auto', marginLeft: 'auto' }}
          value={filters.date} onChange={e => applyFilter('date', e.target.value)} />
      </div>

      {loading && <div style={{ textAlign: 'center', padding: 'var(--sp-10)' }}><span className="spinner spinner-lg" /></div>}

      {!loading && appointments.length === 0 && (
        <div className="glass-card" style={{ padding: 'var(--sp-10)', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: 'var(--sp-3)' }}>📅</div>
          <h4 style={{ color: 'var(--text-primary)', marginBottom: 'var(--sp-2)' }}>No appointments found</h4>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
        {appointments.map(appt => (
          <div key={appt._id} className="glass-card animate-fade-in-up"
            style={{ padding: 'var(--sp-4)', display: 'flex', alignItems: 'center', gap: 'var(--sp-4)' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', marginBottom: 4 }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.92rem' }}>
                  {appt.patientId?.profile?.firstName} {appt.patientId?.profile?.lastName}
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>→ Dr. {appt.doctorId?.profile?.firstName} {appt.doctorId?.profile?.lastName}</span>
                <span style={{ marginLeft: 'auto', fontSize: '0.72rem', fontWeight: 600, padding: '2px 8px', borderRadius: 'var(--r-full)', border: `1px solid ${STATUS_COLOR[appt.status]}40`, color: STATUS_COLOR[appt.status], background: `${STATUS_COLOR[appt.status]}12` }}>
                  {appt.status}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 'var(--sp-4)', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  📅 {new Date(appt.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--indigo)', fontWeight: 600 }}>{appt.timeSlot}</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{appt.reason}</span>
                {appt.doctorId?.profile?.specialization && (
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>({appt.doctorId.profile.specialization})</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--sp-2)', marginTop: 'var(--sp-6)' }}>
          <button type="button" className="btn btn-sm btn-ghost" disabled={filters.page <= 1}
            onClick={() => applyFilter('page', filters.page - 1)}>← Prev</button>
          <span style={{ padding: '6px 12px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Page {filters.page} of {pagination.pages}
          </span>
          <button type="button" className="btn btn-sm btn-ghost" disabled={filters.page >= pagination.pages}
            onClick={() => applyFilter('page', filters.page + 1)}>Next →</button>
        </div>
      )}
    </div>
  );
};

export default AdminAppointmentsTab;