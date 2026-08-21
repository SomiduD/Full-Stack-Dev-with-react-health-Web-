// client/src/pages/auth/LoginPage.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import useOffline from '../../hooks/useOffline';

// ─── Portal definitions ───────────────────────────────────────────────────────
const PORTALS = [
  {
    id:    'patient',
    label: 'Patient',
    role:  'patient',
    tagline: 'Access your health vault & appointments',
    color:  'var(--cyan)',
    gradient: 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(0,128,255,0.08))',
    border: 'rgba(0,212,255,0.35)',
    glow:   'var(--glow-cyan)',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
  {
    id:    'doctor',
    label: 'Doctor',
    role:  'doctor',
    tagline: 'Manage queues & live triage',
    color:  'var(--indigo)',
    gradient: 'linear-gradient(135deg, rgba(129,140,248,0.15), rgba(99,102,241,0.08))',
    border: 'rgba(129,140,248,0.35)',
    glow:   'var(--glow-indigo)',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/>
        <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/>
        <circle cx="20" cy="10" r="2"/>
      </svg>
    ),
  },
  {
    id:    'hospital_admin',
    label: 'Hospital Admin',
    role:  'hospital_admin',
    tagline: 'Resources, beds & analytics',
    color:  'var(--amber)',
    gradient: 'linear-gradient(135deg, rgba(251,191,36,0.15), rgba(245,158,11,0.08))',
    border: 'rgba(251,191,36,0.35)',
    glow:   'var(--glow-amber)',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
        <line x1="12" y1="6" x2="12" y2="6.01"/>
        <path d="M9 9h.01M15 9h.01"/>
      </svg>
    ),
  },
  {
    id:    'super_admin',
    label: 'Super Admin',
    role:  'super_admin',
    tagline: 'Global compliance & routing',
    color:  'var(--rose)',
    gradient: 'linear-gradient(135deg, rgba(251,113,133,0.15), rgba(225,29,72,0.08))',
    border: 'rgba(251,113,133,0.35)',
    glow:   'var(--glow-rose)',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
  },
];

// ─── Floating stats card (left panel decoration) ──────────────────────────────
const FloatCard = ({ label, value, color, delay = '0s', top, left, right }) => (
  <div style={{
    position:   'absolute',
    top, left, right,
    background: 'rgba(17,31,61,0.85)',
    backdropFilter: 'blur(12px)',
    border:     `1px solid ${color}30`,
    borderRadius: 'var(--r-lg)',
    padding:    '12px 18px',
    animation:  `float 4s ease-in-out ${delay} infinite`,
    boxShadow:  `0 4px 20px rgba(0,0,0,0.4), 0 0 12px ${color}20`,
    minWidth:   130,
  }}>
    <div style={{ fontSize: '1.4rem', fontWeight: 800, color }}>{value}</div>
    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
  </div>
);

// ─── Medical cross SVG ────────────────────────────────────────────────────────
const MedicalCross = () => (
  <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
    <rect x="28" y="8"  width="24" height="64" rx="6" fill="rgba(0,212,255,0.18)" stroke="rgba(0,212,255,0.5)" strokeWidth="1.5"/>
    <rect x="8"  y="28" width="64" height="24" rx="6" fill="rgba(0,212,255,0.18)" stroke="rgba(0,212,255,0.5)" strokeWidth="1.5"/>
    <rect x="32" y="12" width="16" height="56" rx="4" fill="rgba(0,212,255,0.25)"/>
    <rect x="12" y="32" width="56" height="16" rx="4" fill="rgba(0,212,255,0.25)"/>
  </svg>
);

// ─── Component ────────────────────────────────────────────────────────────────
const LoginPage = () => {
  const [selectedPortal, setSelectedPortal] = useState(PORTALS[0]);
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError,    setFormError]    = useState('');

  const { login }    = useAuth();
  const navigate     = useNavigate();
  const { isOnline } = useOffline();

  const ROLE_HOME = {
    patient:        '/patient/dashboard',
    doctor:         '/doctor/dashboard',
    hospital_admin: '/admin/dashboard',
    super_admin:    '/super-admin/dashboard',
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!email || !password) {
      setFormError('Please enter your email and password.');
      return;
    }

    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);

    if (result.success) {
      navigate(ROLE_HOME[result.user.role] || '/');
    } else {
      setFormError(result.message);
    }
  };

  const portal = selectedPortal;

  return (
    <div style={{
      minHeight:    '100svh',
      display:      'flex',
      background:   'var(--bg-base)',
    }}>
      {/* ══════════════ LEFT PANEL ══════════════ */}
      <div style={{
        width:       '42%',
        minHeight:   '100svh',
        position:    'relative',
        overflow:    'hidden',
        background:  'var(--gradient-brand)',
        display:     'flex',
        flexDirection:'column',
        alignItems:  'center',
        justifyContent:'center',
        padding:     'var(--sp-12)',
        flexShrink:  0,
      }}>
        {/* Background mesh gradient */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: `
            radial-gradient(ellipse at 30% 30%, rgba(0,212,255,0.12) 0%, transparent 55%),
            radial-gradient(ellipse at 70% 70%, rgba(129,140,248,0.10) 0%, transparent 55%),
            radial-gradient(ellipse at 50% 90%, rgba(16,185,129,0.07) 0%, transparent 50%)
          `,
        }}/>

        {/* Dot grid */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize:  '28px 28px',
        }}/>

        {/* Medical cross — animated */}
        <div style={{ animation: 'glow-pulse 3s ease-in-out infinite', marginBottom: 'var(--sp-8)' }}>
          <MedicalCross />
        </div>

        {/* Platform name */}
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <h1 style={{
            fontSize:       '2rem',
            fontWeight:     900,
            background:     'linear-gradient(135deg, var(--cyan), #a5f3fc)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing:  '-0.03em',
            marginBottom:   'var(--sp-2)',
          }}>
            MedCore
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', maxWidth: 220, lineHeight: 1.6 }}>
            Enterprise-grade multi-hospital healthcare management
          </p>
        </div>

        {/* Floating stat cards */}
        <FloatCard label="Active Patients" value="12,847" color="var(--cyan)"   delay="0s"   top="18%"  left="8%"  />
        <FloatCard label="Live Triage"     value="3 🔴"   color="var(--rose)"   delay="1.5s" top="30%"  right="4%" />
        <FloatCard label="Doctors Online"  value="284"    color="var(--indigo)" delay="0.8s" top="60%"  left="6%"  />
        <FloatCard label="Hospitals"       value="14"     color="var(--amber)"  delay="2s"   top="72%"  right="5%" />

        {/* Bottom badge */}
        <div style={{
          position: 'absolute', bottom: 24,
          background: 'var(--bg-glass)', backdropFilter: 'blur(10px)',
          border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-full)',
          padding: '6px 16px', fontSize: '0.75rem', color: 'var(--text-muted)',
        }}>
          HIPAA-Compliant · ISO 27001 · SOC 2 Type II
        </div>
      </div>

      {/* ══════════════ RIGHT PANEL ══════════════ */}
      <div style={{
        flex:           1,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        padding:        'var(--sp-8)',
        overflowY:      'auto',
      }}>
        <div style={{
          width:     '100%',
          maxWidth:  480,
          animation: 'fadeInUp 0.5s ease both',
        }}>
          {/* Header */}
          <div style={{ marginBottom: 'var(--sp-8)' }}>
            <h2 style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 'var(--sp-2)' }}>
              Welcome back
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
              Select your portal and sign in to continue
            </p>
          </div>

          {/* Portal selector grid */}
          <div style={{
            display:             'grid',
            gridTemplateColumns: '1fr 1fr',
            gap:                 'var(--sp-3)',
            marginBottom:        'var(--sp-6)',
          }}
          className="stagger"
          >
            {PORTALS.map((p) => {
              const active = selectedPortal.id === p.id;
              return (
                <button
                  key={p.id}
                  id={`portal-${p.id}`}
                  type="button"
                  onClick={() => { setSelectedPortal(p); setFormError(''); }}
                  style={{
                    background:    active ? p.gradient : 'var(--bg-glass-light)',
                    border:        `1.5px solid ${active ? p.border : 'var(--border-subtle)'}`,
                    borderRadius:  'var(--r-lg)',
                    padding:       '16px 14px',
                    cursor:        'pointer',
                    textAlign:     'left',
                    transition:    'all var(--t-base)',
                    transform:     active ? 'scale(1.02)' : 'scale(1)',
                    boxShadow:     active ? p.glow : 'none',
                    backdropFilter:'blur(8px)',
                    position:      'relative',
                    overflow:      'hidden',
                  }}
                  className="animate-fade-in-up"
                >
                  {/* Selected checkmark */}
                  {active && (
                    <div style={{
                      position:   'absolute', top: 8, right: 8,
                      width:      18, height: 18,
                      background: p.color,
                      borderRadius:'50%',
                      display:    'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--bg-base)" strokeWidth="3.5">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </div>
                  )}

                  <div style={{ color: p.color, marginBottom: 8 }}>{p.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: 3 }}>
                    {p.label}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    {p.tagline}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Offline warning */}
          {!isOnline && (
            <div className="alert alert-warning animate-fade-in" style={{ marginBottom: 'var(--sp-4)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              You're offline. Cached credentials may allow access to previously loaded data.
            </div>
          )}

          {/* Error alert */}
          {formError && (
            <div className="alert alert-error animate-fade-in" style={{ marginBottom: 'var(--sp-4)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              {formError}
            </div>
          )}

          {/* Login form */}
          <form onSubmit={handleSubmit} noValidate>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
              {/* Email */}
              <div className="form-group">
                <label htmlFor="login-email" className="form-label">Email Address</label>
                <input
                  id="login-email"
                  type="email"
                  className="form-input"
                  placeholder="you@hospital.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              {/* Password */}
              <div className="form-group">
                <label htmlFor="login-password" className="form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="login-password"
                    type={showPass ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                    style={{ paddingRight: 48 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    style={{
                      position:   'absolute', right: 14, top: '50%',
                      transform:  'translateY(-50%)',
                      background: 'none', border: 'none',
                      color:      'var(--text-muted)', cursor: 'pointer', padding: 4,
                    }}
                    aria-label={showPass ? 'Hide password' : 'Show password'}
                  >
                    {showPass ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Forgot password */}
              <div style={{ textAlign: 'right', marginTop: -8 }}>
                <Link
                  to="/forgot-password"
                  style={{ fontSize: '0.82rem', color: portal.color, opacity: 0.85 }}
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit */}
              <button
                id="btn-login"
                type="submit"
                disabled={isSubmitting}
                style={{
                  width:      '100%',
                  padding:    '14px',
                  border:     'none',
                  borderRadius:'var(--r-lg)',
                  fontWeight: 700,
                  fontSize:   '1rem',
                  cursor:     isSubmitting ? 'not-allowed' : 'pointer',
                  background: isSubmitting
                    ? 'var(--bg-elevated)'
                    : `linear-gradient(135deg, ${portal.color}, ${portal.color}cc)`,
                  color:      isSubmitting ? 'var(--text-muted)' : 'var(--bg-base)',
                  boxShadow:  isSubmitting ? 'none' : portal.glow,
                  transition: 'all var(--t-base)',
                  display:    'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                {isSubmitting ? (
                  <>
                    <div className="spinner" style={{ borderTopColor: 'var(--text-muted)' }} />
                    <span>Signing in…</span>
                  </>
                ) : (
                  <>
                    <span>Sign In as {portal.label}</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="5" y1="12" x2="19" y2="12"/>
                      <polyline points="12 5 19 12 12 19"/>
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="divider" style={{ margin: 'var(--sp-6) 0' }}>
            <span>or</span>
          </div>

          {/* Register link */}
          <p style={{ textAlign: 'center', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            New patient?{' '}
            <Link
              to="/register"
              id="link-register"
              style={{ color: portal.color, fontWeight: 600, transition: 'opacity var(--t-fast)' }}
            >
              Create an account →
            </Link>
          </p>

          {/* Selected portal badge */}
          <div style={{ textAlign: 'center', marginTop: 'var(--sp-6)' }}>
            <span
              className="badge"
              style={{
                background: `${portal.color}15`,
                color:      portal.color,
                border:     `1px solid ${portal.color}40`,
                fontSize:   '0.72rem',
              }}
            >
              {portal.icon && <span style={{ transform: 'scale(0.55)', display:'inline-flex' }}>{portal.icon}</span>}
              {portal.label} Portal Selected
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
