// client/src/pages/patient/tabs/HealthVaultTab.jsx
import { useState } from 'react';
import useHealthRecords from '../../../hooks/useHealthRecords';
import useOffline from '../../../hooks/useOffline';

const TYPE_META = {
  lab:          { icon: '🧪', label: 'Lab Report',    color: 'var(--cyan)',     bg: 'rgba(0,212,255,0.1)',     border: 'rgba(0,212,255,0.25)'     },
  imaging:      { icon: '🩻', label: 'Imaging',       color: 'var(--indigo)',   bg: 'rgba(129,140,248,0.1)',   border: 'rgba(129,140,248,0.25)'   },
  prescription: { icon: '💊', label: 'Prescription',  color: 'var(--amber)',    bg: 'rgba(251,191,36,0.1)',    border: 'rgba(251,191,36,0.25)'    },
  discharge:    { icon: '📋', label: 'Discharge',     color: 'var(--rose)',     bg: 'rgba(251,113,133,0.1)',   border: 'rgba(251,113,133,0.25)'   },
  vaccination:  { icon: '💉', label: 'Vaccination',   color: 'var(--emerald)',  bg: 'rgba(16,185,129,0.1)',    border: 'rgba(16,185,129,0.25)'    },
  other:        { icon: '📄', label: 'Other',         color: 'var(--text-muted)', bg: 'rgba(255,255,255,0.05)', border: 'var(--border-subtle)'    },
};

const ALL_TYPES = ['all', ...Object.keys(TYPE_META)];

function RecordDetailModal({ rec, onClose }) {
  const meta = TYPE_META[rec.type] || TYPE_META.other;
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--sp-4)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--bg-secondary)', borderRadius: 'var(--r-xl)',
          border: '1px solid var(--border-medium)', padding: 'var(--sp-6)',
          maxWidth: 580, width: '100%', maxHeight: '85vh', overflowY: 'auto',
          boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
          animation: 'fadeInDown 0.25s ease both',
        }}
      >
        {/* Modal header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--sp-3)', marginBottom: 'var(--sp-5)' }}>
          <div style={{
            width: 56, height: 56, flexShrink: 0,
            background: meta.bg, border: `1.5px solid ${meta.border}`,
            borderRadius: 'var(--r-lg)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '1.8rem',
          }}>
            {meta.icon}
          </div>
          <div style={{ flex: 1 }}>
            <span style={{
              fontSize: '0.72rem', fontWeight: 700, color: meta.color, textTransform: 'uppercase',
              letterSpacing: '0.08em', display: 'block', marginBottom: 4,
            }}>
              {meta.label}
            </span>
            <h4 style={{ color: 'var(--text-primary)', marginBottom: 4, lineHeight: 1.3 }}>{rec.title}</h4>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
              <span>📅 {new Date(rec.date).toLocaleDateString('en-LK', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              {rec.uploadedBy && (
                <span>🩺 Dr. {rec.uploadedBy?.profile?.firstName} {rec.uploadedBy?.profile?.lastName}</span>
              )}
            </div>
          </div>
          <button type="button" onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 'var(--r-full)',
              border: '1px solid var(--border-medium)', background: 'var(--bg-surface)',
              color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem', display: 'flex',
              alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
            ✕
          </button>
        </div>

        {/* Description */}
        {rec.description && (
          <div style={{
            padding: 'var(--sp-4)', background: 'rgba(0,0,0,0.25)',
            borderRadius: 'var(--r-md)', borderLeft: `3px solid ${meta.color}`,
            marginBottom: 'var(--sp-4)',
          }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: meta.color, marginBottom: 'var(--sp-2)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Clinical Notes
            </div>
            <pre style={{
              fontSize: '0.83rem', color: 'var(--text-secondary)', margin: 0,
              whiteSpace: 'pre-wrap', fontFamily: 'inherit', lineHeight: 1.8,
            }}>
              {rec.description}
            </pre>
          </div>
        )}

        {/* Tags */}
        {rec.tags?.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 'var(--sp-4)' }}>
            {rec.tags.map((tag) => (
              <span key={tag} style={{
                fontSize: '0.72rem', padding: '3px 9px', borderRadius: 'var(--r-full)',
                background: meta.bg, color: meta.color, border: `1px solid ${meta.border}`,
              }}>
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* File link */}
        {rec.fileUrl && (
          <a href={rec.fileUrl} target="_blank" rel="noreferrer"
            className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            📎 Open Document ↗
          </a>
        )}
      </div>
    </div>
  );
}

function RecordCard({ rec, onClick }) {
  const meta = TYPE_META[rec.type] || TYPE_META.other;

  return (
    <div
      className="glass-card animate-fade-in-up"
      onClick={() => onClick(rec)}
      style={{ padding: 'var(--sp-5)', cursor: 'pointer', transition: 'transform var(--t-base), box-shadow var(--t-base)' }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 8px 30px ${meta.color}18`; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--sp-3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
          <span style={{ fontSize: '1.4rem' }}>{meta.icon}</span>
          <span style={{
            fontSize: '0.72rem', fontWeight: 700, color: meta.color,
            background: meta.bg, padding: '3px 8px',
            borderRadius: 'var(--r-full)', border: `1px solid ${meta.border}`,
          }}>
            {meta.label}
          </span>
        </div>
        <span style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>
          {new Date(rec.date).toLocaleDateString('en-LK', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
      </div>

      {/* Title */}
      <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.92rem', marginBottom: 'var(--sp-2)', lineHeight: 1.3 }}>
        {rec.title}
      </div>

      {/* Description preview */}
      {rec.description && (
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 'var(--sp-3)', lineHeight: 1.6 }}>
          {rec.description.length > 90 ? `${rec.description.slice(0, 90)}…` : rec.description}
        </p>
      )}

      {/* Tags */}
      {rec.tags?.length > 0 && (
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 'var(--sp-3)' }}>
          {rec.tags.slice(0, 3).map((tag) => (
            <span key={tag} style={{
              fontSize: '0.67rem', padding: '2px 7px', borderRadius: 'var(--r-full)',
              background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)',
              border: '1px solid var(--border-subtle)',
            }}>
              #{tag}
            </span>
          ))}
          {rec.tags.length > 3 && (
            <span style={{ fontSize: '0.67rem', color: 'var(--text-muted)' }}>+{rec.tags.length - 3}</span>
          )}
        </div>
      )}

      {/* Footer */}
      <div style={{
        borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--sp-2)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>
          {rec.uploadedBy
            ? `🩺 Dr. ${rec.uploadedBy?.profile?.firstName} ${rec.uploadedBy?.profile?.lastName}`
            : '🏥 Nawaloka General Hospital'}
        </span>
        <span style={{ fontSize: '0.72rem', color: meta.color, fontWeight: 600 }}>
          View →
        </span>
      </div>
    </div>
  );
}

const HealthVaultTab = () => {
  const [activeType, setActiveType] = useState('all');
  const [selected,   setSelected]   = useState(null);
  const { records, loading, error } = useHealthRecords(activeType !== 'all' ? { type: activeType } : {});
  const { isOnline } = useOffline();

  // Counts per type for the filter pills
  const counts = {};
  records.forEach((r) => { counts[r.type] = (counts[r.type] || 0) + 1; });

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 'var(--sp-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', marginBottom: 4 }}>
          <h3 style={{ color: 'var(--text-primary)' }}>🗂️ Digital Health Vault</h3>
          {!isOnline && <span className="badge badge-amber">⚡ Offline Cache</span>}
          {!loading && records.length > 0 && (
            <span style={{
              fontSize: '0.75rem', padding: '3px 10px', borderRadius: 'var(--r-full)',
              background: 'rgba(0,212,255,0.1)', color: 'var(--cyan)',
              border: '1px solid rgba(0,212,255,0.25)', fontWeight: 600,
            }}>
              {records.length} records
            </span>
          )}
        </div>
        <p style={{ fontSize: '0.85rem' }}>
          Your complete medical history — lab reports, imaging, prescriptions and more. Click any card to view full details.
        </p>
      </div>

      {/* Filter pills */}
      <div style={{ display: 'flex', gap: 'var(--sp-2)', flexWrap: 'wrap', marginBottom: 'var(--sp-6)' }}>
        {ALL_TYPES.map((t) => {
          const isActive = activeType === t;
          const meta     = TYPE_META[t] || { icon: '🗂️', label: 'All', color: 'var(--cyan)', bg: 'rgba(0,212,255,0.1)', border: 'rgba(0,212,255,0.25)' };
          const count    = t === 'all' ? records.length : (counts[t] || 0);
          return (
            <button key={t} id={`filter-${t}`} type="button" onClick={() => setActiveType(t)}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '6px 14px', borderRadius: 'var(--r-full)',
                border: isActive ? `1.5px solid ${t === 'all' ? 'var(--cyan)' : meta.color}` : '1px solid var(--border-medium)',
                background: isActive ? (t === 'all' ? 'rgba(0,212,255,0.12)' : meta.bg) : 'var(--bg-surface)',
                color: isActive ? (t === 'all' ? 'var(--cyan)' : meta.color) : 'var(--text-secondary)',
                fontSize: '0.82rem', fontWeight: isActive ? 600 : 400,
                cursor: 'pointer', transition: 'all var(--t-fast)',
              }}
            >
              {t === 'all' ? '🗂️ All' : `${meta.icon} ${meta.label}`}
              {count > 0 && activeType !== t && (
                <span style={{
                  fontSize: '0.65rem', background: 'var(--border-subtle)',
                  borderRadius: 'var(--r-full)', padding: '1px 5px', color: 'var(--text-muted)',
                }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: 'var(--sp-12)', color: 'var(--text-muted)' }}>
          <span className="spinner spinner-lg" />
          <p style={{ marginTop: 'var(--sp-3)', fontSize: '0.85rem' }}>Loading your health vault…</p>
        </div>
      )}

      {/* Error */}
      {!loading && error && <div className="alert alert-error" style={{ marginBottom: 'var(--sp-4)' }}>{error}</div>}

      {/* Empty state */}
      {!loading && records.length === 0 && (
        <div className="glass-card" style={{ padding: 'var(--sp-10)', textAlign: 'center' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: 'var(--sp-3)' }}>🗂️</div>
          <h4 style={{ color: 'var(--text-primary)', marginBottom: 'var(--sp-2)' }}>No records found</h4>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            {activeType !== 'all'
              ? `No ${TYPE_META[activeType]?.label} records in your vault yet.`
              : 'Your health records added by your doctors will appear here.'}
          </p>
        </div>
      )}

      {/* Records grid */}
      {!loading && records.length > 0 && (
        <div
          className="stagger"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--sp-4)' }}
        >
          {records.map((rec) => (
            <RecordCard key={rec._id} rec={rec} onClick={setSelected} />
          ))}
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <RecordDetailModal rec={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
};

export default HealthVaultTab;
