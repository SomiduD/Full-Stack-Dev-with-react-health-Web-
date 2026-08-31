// client/src/pages/patient/tabs/PrescriptionsTab.jsx
import { useState } from 'react';
import useHealthRecords from '../../../hooks/useHealthRecords';

const statusColors = {
  active:   { bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.3)',  text: 'var(--emerald)', label: '✅ Active'   },
  review:   { bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.3)',  text: 'var(--amber)',   label: '⏳ Review'   },
  completed:{ bg: 'rgba(129,140,248,0.1)', border: 'rgba(129,140,248,0.3)', text: 'var(--indigo)',  label: '☑️ Completed' },
};

/** Derive a rough status based on how recent the prescription is */
function deriveStatus(dateStr) {
  const days = (Date.now() - new Date(dateStr).getTime()) / 86400000;
  if (days < 30)  return 'active';
  if (days < 90)  return 'review';
  return 'completed';
}

/** Split description into numbered medicine lines */
function parseMedicines(description) {
  if (!description) return [];
  return description
    .split('\n')
    .filter((l) => /^\d+\./.test(l.trim()))
    .map((l) => l.replace(/^\d+\.\s*/, '').trim());
}

function MedicineChip({ name }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontSize: '0.78rem', padding: '3px 10px', borderRadius: 'var(--r-full)',
      background: 'rgba(251,191,36,0.1)', color: 'var(--amber)',
      border: '1px solid rgba(251,191,36,0.25)', fontWeight: 500,
    }}>
      💊 {name}
    </span>
  );
}

function PrescriptionCard({ rec }) {
  const [expanded, setExpanded] = useState(false);
  const status   = deriveStatus(rec.date);
  const colors   = statusColors[status];
  const medicines = parseMedicines(rec.description);

  return (
    <div className="glass-card animate-fade-in-up"
      style={{ padding: 'var(--sp-5)', transition: 'transform var(--t-base), box-shadow var(--t-base)' }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--sp-3)', marginBottom: 'var(--sp-3)' }}>
        {/* Icon */}
        <div style={{
          width: 48, height: 48, flexShrink: 0,
          background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)',
          borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.4rem',
        }}>
          💊
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', flexWrap: 'wrap', marginBottom: 4 }}>
            <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
              {rec.title}
            </span>
            <span style={{
              fontSize: '0.7rem', padding: '2px 8px', borderRadius: 'var(--r-full)',
              background: colors.bg, color: colors.text, border: `1px solid ${colors.border}`,
              fontWeight: 600,
            }}>
              {colors.label}
            </span>
          </div>

          <div style={{ display: 'flex', gap: 'var(--sp-4)', fontSize: '0.78rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
            <span>📅 {new Date(rec.date).toLocaleDateString('en-LK', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            {rec.uploadedBy && (
              <span>🩺 Dr. {rec.uploadedBy?.profile?.firstName} {rec.uploadedBy?.profile?.lastName}</span>
            )}
          </div>
        </div>

        <button type="button" onClick={() => setExpanded(!expanded)}
          style={{
            flexShrink: 0, padding: '6px 12px', borderRadius: 'var(--r-md)',
            border: '1px solid var(--border-medium)', background: 'var(--bg-surface)',
            color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.8rem',
            transition: 'all var(--t-fast)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-surface)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
        >
          {expanded ? '▲ Less' : '▼ Details'}
        </button>
      </div>

      {/* Medicine chips */}
      {medicines.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 'var(--sp-3)' }}>
          {medicines.map((m, i) => <MedicineChip key={i} name={m.split('—')[0].trim()} />)}
        </div>
      )}

      {/* Tags */}
      {rec.tags?.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: expanded ? 'var(--sp-3)' : 0 }}>
          {rec.tags.map((tag) => (
            <span key={tag} style={{
              fontSize: '0.68rem', padding: '2px 7px', borderRadius: 'var(--r-full)',
              background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)',
              border: '1px solid var(--border-subtle)',
            }}>
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Expanded notes */}
      {expanded && rec.description && (
        <div style={{
          marginTop: 'var(--sp-3)', padding: 'var(--sp-4)',
          background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--r-md)',
          borderLeft: '3px solid rgba(251,191,36,0.5)',
        }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--amber)', marginBottom: 'var(--sp-2)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Full Prescription Details
          </div>
          <pre style={{
            fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0,
            whiteSpace: 'pre-wrap', fontFamily: 'var(--font-mono, monospace)', lineHeight: 1.7,
          }}>
            {rec.description}
          </pre>
        </div>
      )}

      {/* View file button */}
      {rec.fileUrl && (
        <a href={rec.fileUrl} target="_blank" rel="noreferrer"
          className="btn btn-sm btn-ghost"
          style={{ marginTop: 'var(--sp-3)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          📎 View PDF ↗
        </a>
      )}
    </div>
  );
}

const PrescriptionsTab = () => {
  const { records, loading, error } = useHealthRecords({ type: 'prescription' });

  const active    = records.filter((r) => deriveStatus(r.date) === 'active');
  const past      = records.filter((r) => deriveStatus(r.date) !== 'active');

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 'var(--sp-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', marginBottom: 4 }}>
          <h3 style={{ color: 'var(--text-primary)' }}>💊 Prescriptions</h3>
          {!loading && records.length > 0 && (
            <span style={{
              fontSize: '0.75rem', padding: '3px 10px', borderRadius: 'var(--r-full)',
              background: 'rgba(251,191,36,0.1)', color: 'var(--amber)',
              border: '1px solid rgba(251,191,36,0.25)', fontWeight: 600,
            }}>
              {records.length} total
            </span>
          )}
        </div>
        <p style={{ fontSize: '0.85rem' }}>
          All prescriptions issued during your consultations. Active prescriptions appear at the top.
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: 'var(--sp-12)' }}>
          <span className="spinner spinner-lg" />
          <p style={{ marginTop: 'var(--sp-3)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading prescriptions…</p>
        </div>
      )}

      {/* Error */}
      {!loading && error && <div className="alert alert-error">{error}</div>}

      {/* Empty state */}
      {!loading && records.length === 0 && (
        <div className="glass-card" style={{ padding: 'var(--sp-10)', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: 'var(--sp-3)' }}>💊</div>
          <h4 style={{ color: 'var(--text-primary)', marginBottom: 'var(--sp-2)' }}>No prescriptions yet</h4>
          <p style={{ fontSize: '0.88rem' }}>Prescriptions issued by your doctor will appear here after your consultation.</p>
        </div>
      )}

      {/* Active prescriptions */}
      {!loading && active.length > 0 && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'var(--sp-3)' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--emerald)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              ● Active Prescriptions
            </span>
            <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)', marginBottom: 'var(--sp-6)' }}>
            {active.map((rec) => <PrescriptionCard key={rec._id} rec={rec} />)}
          </div>
        </>
      )}

      {/* Past prescriptions */}
      {!loading && past.length > 0 && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'var(--sp-3)' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Past Prescriptions
            </span>
            <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
            {past.map((rec) => <PrescriptionCard key={rec._id} rec={rec} />)}
          </div>
        </>
      )}
    </div>
  );
};

export default PrescriptionsTab;
