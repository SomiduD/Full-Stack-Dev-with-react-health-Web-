// client/src/pages/patient/tabs/PrescriptionsTab.jsx
import useHealthRecords from '../../../hooks/useHealthRecords';

const PrescriptionsTab = () => {
  const { records, loading, error } = useHealthRecords({ type: 'prescription' });

  return (
    <div>
      <div style={{ marginBottom: 'var(--sp-6)' }}>
        <h3 style={{ color: 'var(--text-primary)', marginBottom: 4 }}>Prescriptions</h3>
        <p style={{ fontSize: '0.85rem' }}>All prescriptions issued during your consultations.</p>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: 'var(--sp-12)' }}>
          <span className="spinner spinner-lg" />
        </div>
      )}
      {!loading && error && <div className="alert alert-error">{error}</div>}

      {!loading && records.length === 0 && (
        <div className="glass-card" style={{ padding: 'var(--sp-10)', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: 'var(--sp-3)' }}>💊</div>
          <h4 style={{ color: 'var(--text-primary)', marginBottom: 'var(--sp-2)' }}>No prescriptions yet</h4>
          <p style={{ fontSize: '0.88rem' }}>Prescriptions issued by your doctor will appear here.</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
        {records.map((rec) => (
          <div key={rec._id} className="glass-card animate-fade-in-up"
            style={{ padding: 'var(--sp-5)', display: 'flex', gap: 'var(--sp-4)', alignItems: 'flex-start' }}>
            <div style={{
              width: 48, height: 48, flexShrink: 0,
              background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.3)',
              borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.4rem',
            }}>
              💊
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', marginBottom: 'var(--sp-1)' }}>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{rec.title}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                  {new Date(rec.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
              {rec.description && (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 'var(--sp-2)' }}>
                  {rec.description}
                </p>
              )}
              {rec.uploadedBy && (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Prescribed by Dr. {rec.uploadedBy?.profile?.firstName} {rec.uploadedBy?.profile?.lastName}
                </div>
              )}
              {rec.tags?.length > 0 && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 'var(--sp-2)' }}>
                  {rec.tags.map((tag) => (
                    <span key={tag} style={{
                      fontSize: '0.72rem', padding: '2px 8px', borderRadius: 'var(--r-full)',
                      background: 'rgba(251,191,36,0.1)', color: 'var(--amber)',
                      border: '1px solid rgba(251,191,36,0.25)',
                    }}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            {rec.fileUrl && (
              <a href={rec.fileUrl} target="_blank" rel="noreferrer"
                className="btn btn-sm btn-ghost" style={{ flexShrink: 0 }}>
                View ↗
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PrescriptionsTab;
