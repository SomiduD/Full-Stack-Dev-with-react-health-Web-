// client/src/pages/patient/tabs/HealthVaultTab.jsx
import { useState } from 'react';
import useHealthRecords from '../../../hooks/useHealthRecords';
import useOffline from '../../../hooks/useOffline';

const TYPE_META = {
  lab:          { icon: '🧪', label: 'Lab Report',    color: 'var(--cyan)'    },
  imaging:      { icon: '🩻', label: 'Imaging',       color: 'var(--indigo)'  },
  prescription: { icon: '💊', label: 'Prescription',  color: 'var(--amber)'   },
  discharge:    { icon: '📋', label: 'Discharge',     color: 'var(--rose)'    },
  vaccination:  { icon: '💉', label: 'Vaccination',   color: 'var(--emerald)' },
  other:        { icon: '📄', label: 'Other',         color: 'var(--text-muted)' },
};

const ALL_TYPES = ['all', ...Object.keys(TYPE_META)];

const HealthVaultTab = () => {
  const [activeType, setActiveType] = useState('all');
  const { records, loading, error } = useHealthRecords(
    activeType !== 'all' ? { type: activeType } : {}
  );
  const { isOnline } = useOffline();

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 'var(--sp-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', marginBottom: 4 }}>
          <h3 style={{ color: 'var(--text-primary)' }}>Digital Health Vault</h3>
          {!isOnline && <span className="badge badge-amber">⚡ Offline Cache</span>}
        </div>
        <p style={{ fontSize: '0.85rem' }}>Your complete medical history — lab reports, imaging, prescriptions and more.</p>
      </div>

      {/* Type filter pills */}
      <div style={{ display: 'flex', gap: 'var(--sp-2)', flexWrap: 'wrap', marginBottom: 'var(--sp-6)' }}>
        {ALL_TYPES.map((t) => {
          const isActive = activeType === t;
          const meta     = TYPE_META[t] || { icon: '🗂️', label: 'All', color: 'var(--cyan)' };
          return (
            <button
              key={t}
              id={`filter-${t}`}
              type="button"
              onClick={() => setActiveType(t)}
              style={{
                padding: '6px 14px', borderRadius: 'var(--r-full)',
                border: isActive ? `1.5px solid ${t === 'all' ? 'var(--cyan)' : meta.color}` : '1px solid var(--border-medium)',
                background: isActive ? `${t === 'all' ? 'rgba(0,212,255,0.12)' : `${meta.color}18`}` : 'var(--bg-surface)',
                color: isActive ? (t === 'all' ? 'var(--cyan)' : meta.color) : 'var(--text-secondary)',
                fontSize: '0.82rem', fontWeight: isActive ? 600 : 400,
                cursor: 'pointer', transition: 'all var(--t-fast)',
              }}
            >
              {t === 'all' ? '🗂️ All' : `${meta.icon} ${meta.label}`}
            </button>
          );
        })}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: 'var(--sp-12)', color: 'var(--text-muted)' }}>
          <span className="spinner spinner-lg" />
          <p style={{ marginTop: 'var(--sp-3)' }}>Loading your vault…</p>
        </div>
      )}

      {/* Error */}
      {!loading && error && <div className="alert alert-error" style={{ marginBottom: 'var(--sp-4)' }}>{error}</div>}

      {/* Empty state */}
      {!loading && records.length === 0 && (
        <div className="glass-card" style={{ padding: 'var(--sp-10)', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: 'var(--sp-3)' }}>🗂️</div>
          <h4 style={{ color: 'var(--text-primary)', marginBottom: 'var(--sp-2)' }}>No records found</h4>
          <p style={{ fontSize: '0.88rem' }}>
            {activeType !== 'all'
              ? `No ${TYPE_META[activeType]?.label} records yet.`
              : 'Your health records added by doctors will appear here.'}
          </p>
        </div>
      )}

      {/* Records grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--sp-4)' }}
        className="stagger">
        {records.map((rec) => {
          const meta = TYPE_META[rec.type] || TYPE_META.other;
          return (
            <div key={rec._id} className="glass-card animate-fade-in-up"
              style={{ padding: 'var(--sp-5)', cursor: 'pointer', transition: 'transform var(--t-base)' }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--sp-3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                  <span style={{ fontSize: '1.5rem' }}>{meta.icon}</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: meta.color, background: `${meta.color}15`, padding: '3px 8px', borderRadius: 'var(--r-full)', border: `1px solid ${meta.color}30` }}>
                    {meta.label}
                  </span>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {new Date(rec.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>

              <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem', marginBottom: 'var(--sp-2)' }}>
                {rec.title}
              </div>

              {rec.description && (
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 'var(--sp-3)', lineHeight: 1.5 }}>
                  {rec.description.length > 80 ? `${rec.description.slice(0, 80)}…` : rec.description}
                </p>
              )}

              {rec.uploadedBy && (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--sp-2)', marginTop: 'var(--sp-2)' }}>
                  Added by Dr. {rec.uploadedBy?.profile?.firstName} {rec.uploadedBy?.profile?.lastName}
                </div>
              )}

              {rec.fileUrl && (
                <a
                  href={rec.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-sm btn-ghost"
                  style={{ marginTop: 'var(--sp-3)', width: '100%', justifyContent: 'center' }}
                >
                  View File ↗
                </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HealthVaultTab;
