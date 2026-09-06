// client/src/pages/patient/tabs/AmbulanceTab.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';

const EMERGENCY_TYPES = [
  { id: 'general',  label: 'General Emergency', icon: '🚑', color: 'var(--cyan)' },
  { id: 'cardiac',  label: 'Cardiac Emergency',  icon: '❤️', color: 'var(--rose)' },
  { id: 'trauma',   label: 'Trauma / Accident',  icon: '🩹', color: 'var(--amber)' },
  { id: 'maternity',label: 'Maternity',           icon: '🤱', color: '#f472b6' },
  { id: 'other',    label: 'Other',               icon: '⚕️', color: 'var(--indigo)' },
];

const AmbulanceTab = () => {
  const { user } = useAuth();
  const [step,          setStep]          = useState('form'); // 'form' | 'confirming' | 'confirmed'
  const [emergencyType, setEmergencyType] = useState('general');
  const [locationNote,  setLocationNote]  = useState('');
  const [notes,         setNotes]         = useState('');
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState('');
  const [requestData,   setRequestData]   = useState(null);
  const [history,       setHistory]       = useState([]);
  const [countdown,     setCountdown]     = useState(0);

  // Load request history
  useEffect(() => {
    api.get('/ambulance/my-requests')
      .then((r) => setHistory(r.data?.data || []))
      .catch(() => {});
  }, [step]);

  // Countdown timer after confirmation
  useEffect(() => {
    if (step === 'confirmed' && requestData?.estimatedETA) {
      setCountdown(requestData.estimatedETA * 60); // convert mins to seconds
      const t = setInterval(() => {
        setCountdown((c) => { if (c <= 1) { clearInterval(t); return 0; } return c - 1; });
      }, 1000);
      return () => clearInterval(t);
    }
  }, [step, requestData]);

  const handleRequest = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/ambulance/request', {
        emergencyType,
        locationNote,
        notes,
      });
      setRequestData(res.data?.data);
      setStep('confirmed');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit request. Please call 1990 directly.');
    } finally {
      setLoading(false);
    }
  };

  const fmtCountdown = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const selectedType = EMERGENCY_TYPES.find((t) => t.id === emergencyType);

  return (
    <div>
      <div style={{ marginBottom: 'var(--sp-6)' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 'var(--sp-1)' }}>
          🚑 Ambulance Services
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Request emergency ambulance or call directly. For life-threatening emergencies call <strong style={{ color: 'var(--rose)' }}>1990</strong> immediately.
        </p>
      </div>

      {/* Emergency Hotlines */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--sp-3)', marginBottom: 'var(--sp-6)' }}>
        {[
          { num: '1990', label: 'Suwa Seriya', sub: 'Free ambulance 24/7', color: 'var(--rose)', icon: '🚑' },
          { num: '119',  label: 'Police',      sub: 'Emergency response',   color: 'var(--indigo)', icon: '👮' },
          { num: '110',  label: 'Fire & Rescue',sub: 'Fire & accidents',    color: 'var(--amber)', icon: '🔥' },
          { num: '+94 11 254 4444', label: 'Nawaloka', sub: 'Hospital direct line', color: 'var(--cyan)', icon: '🏥' },
        ].map((c) => (
          <a key={c.num} href={`tel:${c.num}`}
            style={{ textDecoration: 'none' }}
          >
            <div className="glass-card" style={{ padding: 'var(--sp-4)', borderLeft: `3px solid ${c.color}`, cursor: 'pointer', transition: 'transform 0.15s' }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{ fontSize: '1.4rem', marginBottom: 4 }}>{c.icon}</div>
              <div style={{ fontWeight: 800, fontSize: '1.15rem', color: c.color }}>{c.num}</div>
              <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-primary)' }}>{c.label}</div>
              <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>{c.sub}</div>
            </div>
          </a>
        ))}
      </div>

      {/* Main content */}
      {step === 'form' && (
        <div className="glass-card" style={{ padding: 'var(--sp-6)' }}>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: 'var(--sp-5)' }}>
            Request Hospital Ambulance
          </h3>

          {error && (
            <div className="alert alert-error" style={{ marginBottom: 'var(--sp-4)' }}>
              ⚠️ {error}
            </div>
          )}

          {/* Patient summary */}
          <div style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 'var(--r-lg)', padding: 'var(--sp-4)', marginBottom: 'var(--sp-5)' }}>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 6 }}>PATIENT INFORMATION (pre-filled from your profile)</p>
            <div style={{ display: 'flex', gap: 'var(--sp-6)', flexWrap: 'wrap' }}>
              <div><span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Name: </span><strong style={{ color: 'var(--text-primary)' }}>{user?.profile?.firstName} {user?.profile?.lastName}</strong></div>
              <div><span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Phone: </span><strong style={{ color: 'var(--text-primary)' }}>{user?.profile?.phone || 'Not set'}</strong></div>
              <div><span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Blood Group: </span><strong style={{ color: 'var(--rose)' }}>{user?.profile?.bloodGroup || 'Unknown'}</strong></div>
            </div>
          </div>

          {/* Emergency type */}
          <div style={{ marginBottom: 'var(--sp-5)' }}>
            <label className="form-label" style={{ marginBottom: 'var(--sp-3)', display: 'block' }}>Emergency Type</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 'var(--sp-2)' }}>
              {EMERGENCY_TYPES.map((t) => (
                <button key={t.id} type="button"
                  onClick={() => setEmergencyType(t.id)}
                  style={{
                    padding: '12px 10px', borderRadius: 'var(--r-lg)', border: `2px solid ${emergencyType === t.id ? t.color : 'var(--border-subtle)'}`,
                    background: emergencyType === t.id ? `${t.color}15` : 'var(--bg-glass-light)',
                    cursor: 'pointer', transition: 'all 0.15s', textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '1.4rem', marginBottom: 4 }}>{t.icon}</div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: emergencyType === t.id ? t.color : 'var(--text-secondary)' }}>{t.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div className="form-group" style={{ marginBottom: 'var(--sp-4)' }}>
            <label htmlFor="amb-location" className="form-label">Your Current Location / Description *</label>
            <input id="amb-location" type="text" className="form-input"
              placeholder="e.g. Near Nawaloka Hospital gate, Ward 3 room 12..."
              value={locationNote}
              onChange={(e) => setLocationNote(e.target.value)}
            />
          </div>

          {/* Notes */}
          <div className="form-group" style={{ marginBottom: 'var(--sp-6)' }}>
            <label htmlFor="amb-notes" className="form-label">Additional Notes (optional)</label>
            <textarea id="amb-notes" className="form-input"
              rows={3} placeholder="Any additional information for the medical team..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{ resize: 'vertical', minHeight: 80 }}
            />
          </div>

          {/* Submit */}
          <button
            id="btn-request-ambulance"
            type="button"
            onClick={() => setStep('confirming')}
            disabled={!locationNote.trim()}
            style={{
              width: '100%', padding: '16px', border: 'none', borderRadius: 'var(--r-lg)',
              background: locationNote.trim() ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'var(--bg-elevated)',
              color: locationNote.trim() ? '#fff' : 'var(--text-muted)',
              fontWeight: 800, fontSize: '1.05rem', cursor: locationNote.trim() ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              boxShadow: locationNote.trim() ? '0 4px 20px rgba(239,68,68,0.35)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            🚑 Request Emergency Ambulance
          </button>
        </div>
      )}

      {/* Confirmation modal */}
      {step === 'confirming' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--sp-4)' }}>
          <div className="glass-card" style={{ padding: 'var(--sp-8)', maxWidth: 420, width: '100%', textAlign: 'center' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: 'var(--sp-4)' }}>🚑</div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 'var(--sp-2)' }}>Confirm Ambulance Request</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: 'var(--sp-4)' }}>
              This will immediately alert Nawaloka Hospital dispatch.<br/>
              <strong style={{ color: selectedType?.color }}>{selectedType?.icon} {selectedType?.label}</strong>
            </p>
            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 'var(--r-lg)', padding: 'var(--sp-3)', marginBottom: 'var(--sp-5)', textAlign: 'left' }}>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>📍 <strong>Location:</strong> {locationNote}</div>
              {notes && <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 4 }}>📝 {notes}</div>}
            </div>
            <div style={{ display: 'flex', gap: 'var(--sp-3)' }}>
              <button type="button" onClick={() => setStep('form')} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
              <button type="button" id="btn-confirm-ambulance"
                onClick={handleRequest}
                disabled={loading}
                style={{
                  flex: 2, padding: '14px', border: 'none', borderRadius: 'var(--r-lg)',
                  background: 'linear-gradient(135deg,#ef4444,#dc2626)',
                  color: '#fff', fontWeight: 800, fontSize: '0.95rem', cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                {loading ? <><div className="spinner" style={{ borderTopColor: '#fff' }} /> Sending...</> : '✅ Confirm & Send'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmed state */}
      {step === 'confirmed' && requestData && (
        <div className="glass-card" style={{ padding: 'var(--sp-8)', textAlign: 'center', border: '1px solid rgba(34,197,94,0.3)' }}>
          <div style={{ fontSize: '4rem', marginBottom: 'var(--sp-3)', animation: 'pulse 1.5s infinite' }}>🚑</div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#22c55e', marginBottom: 'var(--sp-2)' }}>Ambulance Dispatched!</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--sp-6)' }}>
            Your request has been received. Help is on the way to your location.
          </p>

          {countdown > 0 && (
            <div style={{ marginBottom: 'var(--sp-6)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 8 }}>ESTIMATED ARRIVAL IN</div>
              <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--rose)', fontVariantNumeric: 'tabular-nums' }}>
                {fmtCountdown(countdown)}
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-3)', marginBottom: 'var(--sp-6)', textAlign: 'left' }}>
            {[
              ['Request ID', `#${requestData._id?.slice(-6).toUpperCase()}`],
              ['Type', EMERGENCY_TYPES.find((t) => t.id === requestData.emergencyType)?.label || 'General'],
              ['ETA', `~${requestData.estimatedETA} minutes`],
              ['Status', 'Dispatched'],
            ].map(([k, v]) => (
              <div key={k} style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--r-md)', padding: 'var(--sp-3)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{k}</div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>{v}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 'var(--sp-3)', justifyContent: 'center' }}>
            <a href="tel:1990" style={{ padding: '12px 24px', background: 'rgba(239,68,68,0.15)', color: 'var(--rose)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--r-lg)', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none' }}>
              📞 Call 1990
            </a>
            <button type="button" onClick={() => { setStep('form'); setLocationNote(''); setNotes(''); setEmergencyType('general'); }}
              className="btn btn-ghost">
              New Request
            </button>
          </div>
        </div>
      )}

      {/* History */}
      {history.length > 0 && step === 'form' && (
        <div style={{ marginTop: 'var(--sp-6)' }}>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: 'var(--sp-4)' }}>Recent Requests</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
            {history.map((r) => (
              <div key={r._id} className="glass-card" style={{ padding: 'var(--sp-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                    {EMERGENCY_TYPES.find((t) => t.id === r.emergencyType)?.icon} {EMERGENCY_TYPES.find((t) => t.id === r.emergencyType)?.label}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    {new Date(r.createdAt).toLocaleString('en-LK')}
                  </div>
                </div>
                <span className="badge" style={{ background: r.status === 'requested' ? 'rgba(0,212,255,0.15)' : 'rgba(34,197,94,0.15)', color: r.status === 'requested' ? 'var(--cyan)' : '#22c55e' }}>
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AmbulanceTab;
