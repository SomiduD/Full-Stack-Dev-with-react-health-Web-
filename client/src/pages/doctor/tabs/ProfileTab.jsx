const InfoRow = ({ label, value }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
      {label}
    </span>
    <span style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 500 }}>
      {value || <span style={{ color: 'var(--text-disabled)' }}>—</span>}
    </span>
  </div>
);

const DoctorProfileTab = ({ user }) => {
  const p = user?.profile || {};

  return (
    <div>
      <div style={{ marginBottom: 'var(--sp-6)' }}>
        <h3 style={{ color: 'var(--text-primary)', marginBottom: 4 }}>My Profile</h3>
        <p style={{ fontSize: '0.85rem' }}>Your professional details and credentials.</p>
      </div>

      {/* Avatar + name card */}
      <div className="glass-card" style={{ padding: 'var(--sp-6)', marginBottom: 'var(--sp-5)', display: 'flex', alignItems: 'center', gap: 'var(--sp-5)' }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--indigo), #6366f1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.8rem', color: '#fff', fontWeight: 800, flexShrink: 0,
        }}>
          {p.firstName?.[0]}{p.lastName?.[0]}
        </div>
        <div>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: 4 }}>
            Dr. {p.firstName} {p.lastName}
          </h3>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{user?.email}</div>
          <div style={{ display: 'flex', gap: 'var(--sp-2)', marginTop: 'var(--sp-2)', flexWrap: 'wrap' }}>
            <span className="badge badge-indigo">Doctor</span>
            {p.specialization && <span className="badge badge-indigo">{p.specialization}</span>}
          </div>
        </div>
      </div>

      {/* Professional details */}
      <div className="glass-card" style={{ padding: 'var(--sp-6)', marginBottom: 'var(--sp-5)' }}>
        <h4 style={{ color: 'var(--text-primary)', marginBottom: 'var(--sp-5)', paddingBottom: 'var(--sp-3)', borderBottom: '1px solid var(--border-subtle)' }}>
          Professional Details
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--sp-5)' }}>
          <InfoRow label="Specialization"   value={p.specialization} />
          <InfoRow label="Department"       value={p.department} />
          <InfoRow label="License Number"   value={p.licenseNumber} />
          <InfoRow label="Years Experience" value={p.yearsExperience != null ? `${p.yearsExperience} years` : null} />
        </div>
      </div>

      {/* Personal information */}
      <div className="glass-card" style={{ padding: 'var(--sp-6)' }}>
        <h4 style={{ color: 'var(--text-primary)', marginBottom: 'var(--sp-5)', paddingBottom: 'var(--sp-3)', borderBottom: '1px solid var(--border-subtle)' }}>
          Personal Information
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--sp-5)' }}>
          <InfoRow label="First Name" value={p.firstName} />
          <InfoRow label="Last Name"  value={p.lastName} />
          <InfoRow label="Gender"     value={p.gender?.replace('_', ' ')} />
          <InfoRow label="Phone"      value={p.phone} />
        </div>
      </div>
    </div>
  );
};

export default DoctorProfileTab;