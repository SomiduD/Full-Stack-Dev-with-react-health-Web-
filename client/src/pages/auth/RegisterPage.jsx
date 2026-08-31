// client/src/pages/auth/RegisterPage.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// ─── Multi-step form config ───────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: 'Account Type',   icon: '🏷️' },
  { id: 2, label: 'Personal Info',  icon: '👤' },
  { id: 3, label: 'Hospital Code',  icon: '🏥' },
];

const ROLES = [
  {
    id:      'patient',
    label:   'Patient',
    desc:    'Book appointments, access your health vault, get emergency virtual help',
    color:   'var(--cyan)',
    border:  'rgba(0,212,255,0.35)',
    glow:    'var(--glow-cyan)',
    bg:      'linear-gradient(135deg, rgba(0,212,255,0.12), rgba(0,128,255,0.06))',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
  {
    id:      'doctor',
    label:   'Doctor',
    desc:    'Manage patient queues, view timetables, monitor emergency triage',
    color:   'var(--indigo)',
    border:  'rgba(129,140,248,0.35)',
    glow:    'var(--glow-indigo)',
    bg:      'linear-gradient(135deg, rgba(129,140,248,0.12), rgba(99,102,241,0.06))',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/>
        <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/>
        <circle cx="20" cy="10" r="2"/>
      </svg>
    ),
  },
];

// ─── Step indicator ───────────────────────────────────────────────────────────
const StepIndicator = ({ currentStep }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 'var(--sp-8)' }}>
    {STEPS.map((step, i) => (
      <div key={step.id} style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{
          display:       'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
          position:      'relative',
        }}>
          <div style={{
            width:        36, height: 36,
            borderRadius: '50%',
            display:      'flex', alignItems: 'center', justifyContent: 'center',
            fontSize:     '0.78rem', fontWeight: 700,
            background:   currentStep > step.id
              ? 'var(--gradient-emerald)'
              : currentStep === step.id
                ? 'var(--gradient-cyan)'
                : 'var(--bg-surface)',
            border:       currentStep >= step.id
              ? '1.5px solid transparent'
              : '1.5px solid var(--border-medium)',
            color:        currentStep >= step.id ? 'var(--bg-base)' : 'var(--text-muted)',
            transition:   'all var(--t-base)',
            boxShadow:    currentStep === step.id ? 'var(--glow-cyan)' : 'none',
          }}>
            {currentStep > step.id ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            ) : step.id}
          </div>
          <span style={{
            fontSize:  '0.68rem',
            fontWeight: 500,
            color:     currentStep >= step.id ? 'var(--text-secondary)' : 'var(--text-muted)',
            whiteSpace:'nowrap',
          }}>
            {step.label}
          </span>
        </div>
        {i < STEPS.length - 1 && (
          <div style={{
            width:      60, height: 1.5, marginBottom: 22,
            background: currentStep > step.id ? 'var(--emerald)' : 'var(--border-subtle)',
            transition: 'background var(--t-slow)',
          }} />
        )}
      </div>
    ))}
  </div>
);

// ─── Component ────────────────────────────────────────────────────────────────
const RegisterPage = () => {
  const [step, setStep]     = useState(1);
  const [form, setForm]     = useState({
    role:           'patient',
    firstName:      '',
    lastName:       '',
    email:          '',
    password:       '',
    confirmPassword:'',
    hospitalCode:   '',
    gender:         '',
    phone:          '',
  });
  const [showPass,     setShowPass]     = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors,  setFieldErrors]  = useState({});
  const [apiError,     setApiError]     = useState('');

  const { register } = useAuth();
  const navigate     = useNavigate();

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const selectedRole = ROLES.find((r) => r.id === form.role);

  // ── Validation per step ───────────────────────────────────────────────────
  const validateStep = () => {
    const errs = {};

    if (step === 1) {
      if (!form.role) errs.role = 'Please select a role.';
    }

    if (step === 2) {
      if (!form.firstName.trim()) errs.firstName = 'First name is required.';
      if (!form.lastName.trim())  errs.lastName  = 'Last name is required.';
      if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email))
        errs.email = 'A valid email is required.';
      if (form.password.length < 8)
        errs.password = 'Password must be at least 8 characters.';
      if (!/[A-Z]/.test(form.password))
        errs.password = 'Password must contain at least one uppercase letter.';
      if (!/\d/.test(form.password))
        errs.password = 'Password must contain at least one number.';
      if (form.password !== form.confirmPassword)
        errs.confirmPassword = 'Passwords do not match.';
    }

    if (step === 3) {
      if (!form.hospitalCode.trim())
        errs.hospitalCode = 'Hospital code is required.';
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) setStep((s) => s + 1);
  };

  const handleBack = () => {
    setApiError('');
    setStep((s) => s - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;

    setApiError('');
    setIsSubmitting(true);

    const result = await register({
      email:        form.email,
      password:     form.password,
      role:         form.role,
      hospitalCode: form.hospitalCode.toUpperCase(),
      profile: {
        firstName: form.firstName,
        lastName:  form.lastName,
        gender:    form.gender,
        phone:     form.phone,
      },
    });

    setIsSubmitting(false);

    if (result.success) {
      const roleHome = {
        patient: '/patient/dashboard',
        doctor:  '/doctor/dashboard',
      };
      navigate(roleHome[result.user.role] || '/');
    } else {
      setApiError(result.message);
      if (result.errors) {
        const errs = {};
        result.errors.forEach((e) => { errs[e.field] = e.message; });
        setFieldErrors(errs);
      }
    }
  };

  const inputStyle = (field) => ({
    ...{ },
    borderColor: fieldErrors[field] ? 'var(--red)' : undefined,
  });

  return (
    <div style={{
      minHeight: '100svh',
      display:   'flex',
      alignItems:'center',
      justifyContent:'center',
      background:'var(--bg-base)',
      padding:   'var(--sp-6)',
      background: `
        var(--bg-base)
        radial-gradient(ellipse at 20% 40%, rgba(0,212,255,0.06) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 60%, rgba(129,140,248,0.06) 0%, transparent 50%)
      `,
    }}>
      <div style={{
        width:      '100%',
        maxWidth:   520,
        animation:  'fadeInUp 0.45s ease both',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--sp-8)' }}>
          {/* Logo / back to login */}
          <Link to="/login" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: 'var(--sp-6)',
            transition: 'color var(--t-fast)',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Back to login
          </Link>

          <div style={{
            fontSize: '1.6rem', fontWeight: 900,
            background: 'linear-gradient(135deg, var(--cyan), #a5f3fc)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            marginBottom: 'var(--sp-2)',
          }}>
            Create Account
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            Join the MedCore Healthcare Platform
          </p>
        </div>

        {/* Step indicator */}
        <StepIndicator currentStep={step} />

        {/* Card */}
        <div className="glass-card" style={{ padding: 'var(--sp-8)' }}>

          {/* API Error */}
          {apiError && (
            <div className="alert alert-error animate-fade-in" style={{ marginBottom: 'var(--sp-5)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>

            {/* ─── STEP 1: Role selection ───────────────────────────── */}
            {step === 1 && (
              <div className="animate-fade-in-up">
                <h3 style={{ marginBottom: 6, color: 'var(--text-primary)' }}>Choose your role</h3>
                <p style={{ fontSize: '0.85rem', marginBottom: 'var(--sp-5)' }}>
                  This determines which portal you'll access after login.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
                  {ROLES.map((r) => {
                    const active = form.role === r.id;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        id={`role-${r.id}`}
                        onClick={() => update('role', r.id)}
                        style={{
                          background:    active ? r.bg : 'var(--bg-glass-light)',
                          border:        `1.5px solid ${active ? r.border : 'var(--border-subtle)'}`,
                          borderRadius:  'var(--r-lg)',
                          padding:       '16px 18px',
                          display:       'flex', alignItems: 'center', gap: 'var(--sp-4)',
                          cursor:        'pointer',
                          transition:    'all var(--t-base)',
                          transform:     active ? 'scale(1.01)' : 'scale(1)',
                          boxShadow:     active ? r.glow : 'none',
                          textAlign:     'left',
                        }}
                      >
                        <div style={{ color: r.color, flexShrink: 0 }}>{r.icon}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3 }}>{r.label}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{r.desc}</div>
                        </div>
                        {active && (
                          <div style={{
                            width: 22, height: 22, borderRadius: '50%', background: r.color, flexShrink: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--bg-base)" strokeWidth="3.5">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ─── STEP 2: Personal info ────────────────────────────── */}
            {step === 2 && (
              <div className="animate-fade-in-up">
                <h3 style={{ marginBottom: 6, color: 'var(--text-primary)' }}>Personal Information</h3>
                <p style={{ fontSize: '0.85rem', marginBottom: 'var(--sp-5)' }}>
                  Tell us a bit about yourself.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-3)' }}>
                    <div className="form-group">
                      <label htmlFor="reg-first" className="form-label">First Name *</label>
                      <input id="reg-first" type="text" className={`form-input${fieldErrors.firstName ? ' error' : ''}`}
                        placeholder="Rahul" value={form.firstName} onChange={(e) => update('firstName', e.target.value)} />
                      {fieldErrors.firstName && <span className="form-error">{fieldErrors.firstName}</span>}
                    </div>
                    <div className="form-group">
                      <label htmlFor="reg-last" className="form-label">Last Name *</label>
                      <input id="reg-last" type="text" className={`form-input${fieldErrors.lastName ? ' error' : ''}`}
                        placeholder="Sharma" value={form.lastName} onChange={(e) => update('lastName', e.target.value)} />
                      {fieldErrors.lastName && <span className="form-error">{fieldErrors.lastName}</span>}
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="reg-email" className="form-label">Email Address *</label>
                    <input id="reg-email" type="email" className={`form-input${fieldErrors.email ? ' error' : ''}`}
                      placeholder="you@hospital.org" value={form.email} onChange={(e) => update('email', e.target.value)} />
                    {fieldErrors.email && <span className="form-error">{fieldErrors.email}</span>}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-3)' }}>
                    <div className="form-group">
                      <label htmlFor="reg-gender" className="form-label">Gender</label>
                      <select id="reg-gender" className="form-input form-select"
                        value={form.gender} onChange={(e) => update('gender', e.target.value)}
                        style={{ background: 'var(--bg-surface)' }}>
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer_not_to_say">Prefer not to say</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="reg-phone" className="form-label">Phone</label>
                      <input id="reg-phone" type="tel" className="form-input"
                        placeholder="+91 9876543210" value={form.phone} onChange={(e) => update('phone', e.target.value)} />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="reg-password" className="form-label">Password *</label>
                    <div style={{ position: 'relative' }}>
                      <input id="reg-password" type={showPass ? 'text' : 'password'}
                        className={`form-input${fieldErrors.password ? ' error' : ''}`}
                        placeholder="Min 8 chars, 1 upper, 1 number"
                        value={form.password} onChange={(e) => update('password', e.target.value)}
                        style={{ paddingRight: 48 }} />
                      <button type="button" onClick={() => setShowPass((v) => !v)}
                        style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)',
                          background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer' }}>
                        {showPass
                          ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                          : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        }
                      </button>
                    </div>
                    {fieldErrors.password && <span className="form-error">{fieldErrors.password}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="reg-confirm" className="form-label">Confirm Password *</label>
                    <input id="reg-confirm" type={showPass ? 'text' : 'password'}
                      className={`form-input${fieldErrors.confirmPassword ? ' error' : ''}`}
                      placeholder="Repeat your password"
                      value={form.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)} />
                    {fieldErrors.confirmPassword && <span className="form-error">{fieldErrors.confirmPassword}</span>}
                  </div>
                </div>
              </div>
            )}

            {/* ─── STEP 3: Hospital code ────────────────────────────── */}
            {step === 3 && (
              <div className="animate-fade-in-up">
                <h3 style={{ marginBottom: 6, color: 'var(--text-primary)' }}>Hospital Code</h3>
                <p style={{ fontSize: '0.85rem', marginBottom: 'var(--sp-5)' }}>
                  Enter the unique code for your hospital. Ask your hospital administrator if you don't have it.
                </p>

                <div className="form-group" style={{ marginBottom: 'var(--sp-4)' }}>
                  <label htmlFor="reg-hospital-code" className="form-label">Hospital Code *</label>
                  <input
                    id="reg-hospital-code"
                    type="text"
                    className={`form-input${fieldErrors.hospitalCode ? ' error' : ''}`}
                    placeholder="e.g. AIIMS_DEL or APOLLO_MUM"
                    value={form.hospitalCode}
                    onChange={(e) => update('hospitalCode', e.target.value.toUpperCase())}
                    style={{ letterSpacing: '0.1em', textTransform: 'uppercase' }}
                    maxLength={20}
                  />
                  {fieldErrors.hospitalCode
                    ? <span className="form-error">{fieldErrors.hospitalCode}</span>
                    : <span style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>3–20 alphanumeric characters, uppercase</span>
                  }
                </div>

                {/* Summary card */}
                <div style={{
                  background:   selectedRole?.bg,
                  border:       `1px solid ${selectedRole?.border}`,
                  borderRadius: 'var(--r-lg)',
                  padding:      'var(--sp-4)',
                  marginTop:    'var(--sp-4)',
                }}>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 8 }}>REGISTRATION SUMMARY</p>
                  <div style={{ display:'flex', flexDirection:'column', gap: 6 }}>
                    {[
                      ['Role',  selectedRole?.label],
                      ['Name',  `${form.firstName} ${form.lastName}`],
                      ['Email', form.email],
                    ].map(([label, val]) => (
                      <div key={label} style={{ display:'flex', justifyContent:'space-between', fontSize:'0.85rem' }}>
                        <span style={{ color:'var(--text-muted)' }}>{label}</span>
                        <span style={{ color:'var(--text-primary)', fontWeight:500 }}>{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ─── Navigation buttons ───────────────────────────────── */}
            <div style={{
              display:        'flex',
              justifyContent: step > 1 ? 'space-between' : 'flex-end',
              gap:            'var(--sp-3)',
              marginTop:      'var(--sp-6)',
            }}>
              {step > 1 && (
                <button type="button" onClick={handleBack} className="btn btn-ghost">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="15 18 9 12 15 6"/>
                  </svg>
                  Back
                </button>
              )}

              {step < 3 ? (
                <button type="button" id={`btn-next-step-${step}`} onClick={handleNext}
                  style={{
                    padding:'12px 28px', border:'none', borderRadius:'var(--r-md)', fontWeight:700,
                    cursor:'pointer', background:selectedRole
                      ? `linear-gradient(135deg, ${selectedRole.color}, ${selectedRole.color}cc)`
                      : 'var(--gradient-cyan)',
                    color:'#ffffff', fontSize:'0.95rem',
                    display:'flex', alignItems:'center', gap:8,
                  }}
                >
                  Continue
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </button>
              ) : (
                <button type="submit" id="btn-register-submit" disabled={isSubmitting}
                  style={{
                    padding:'12px 28px', border:'none', borderRadius:'var(--r-md)', fontWeight:700,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    background: isSubmitting ? 'var(--bg-elevated)' : selectedRole
                      ? `linear-gradient(135deg, ${selectedRole.color}, ${selectedRole.color}cc)`
                      : 'var(--gradient-cyan)',
                    color: isSubmitting ? 'var(--text-muted)' : '#ffffff',
                    opacity: isSubmitting ? 0.7 : 1,
                    fontSize:'0.95rem', display:'flex', alignItems:'center', gap:8,
                  }}
                >
                  {isSubmitting ? (
                    <><div className="spinner" style={{ borderTopColor:'var(--text-muted)' }}/><span>Creating account…</span></>
                  ) : (
                    <><span>Create Account</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg></>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Already have account */}
        <p style={{ textAlign:'center', marginTop:'var(--sp-5)', fontSize:'0.85rem', color:'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color:'var(--cyan)', fontWeight:600 }}>Sign in →</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
