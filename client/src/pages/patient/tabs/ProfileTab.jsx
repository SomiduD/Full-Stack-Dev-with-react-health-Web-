// client/src/pages/patient/tabs/ProfileTab.jsx

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

const ProfileTab = ({ user }) => {
  const p = user?.profile || {};

  return (
    <div>
      <div style={{ marginBottom: 'var(--sp-6)' }}>
        <h3 style={{ color: 'var(--text-primary)', marginBottom: 4 }}>My Profile</h3>
        <p style={{ fontSize: '0.85rem' }}>Your personal and medical information.</p>
      </div>

      {/* Avatar + name card */}
      <div className="glass-card" style={{ padding: 'var(--sp-6)', marginBottom: 'var(--sp-5)', display: 'flex', alignItems: 'center', gap: 'var(--sp-5)' }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--cyan), #0080ff)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.8rem', color: 'var(--bg-base)', fontWeight: 800, flexShrink: 0,
        }}>
          {p.firstName?.[0]}{p.lastName?.[0]}
        </div>
        <div>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: 4 }}>
            {p.firstName} {p.lastName}
          </h3>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{user?.email}</div>
          <div style={{ display: 'flex', gap: 'var(--sp-2)', marginTop: 'var(--sp-2)', flexWrap: 'wrap' }}>
            <span className="badge badge-cyan">Patient</span>
            {p.bloodGroup && <span className="badge badge-rose">🩸 {p.bloodGroup}</span>}
          </div>
        </div>
      </div>

      {/* Personal info */}
      <div className="glass-card" style={{ padding: 'var(--sp-6)', marginBottom: 'var(--sp-5)' }}>
        <h4 style={{ color: 'var(--text-primary)', marginBottom: 'var(--sp-5)', paddingBottom: 'var(--sp-3)', borderBottom: '1px solid var(--border-subtle)' }}>
          Personal Information
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--sp-5)' }}>
          <InfoRow label="First Name" value={p.firstName} />
          <InfoRow label="Last Name"  value={p.lastName} />
          <InfoRow label="Gender"     value={p.gender?.replace('_', ' ')} />
          <InfoRow label="Date of Birth"
            value={p.dateOfBirth ? new Date(p.dateOfBirth).toLocaleDateString('en-IN') : null} />
          <InfoRow label="Phone" value={p.phone} />
          <InfoRow label="Blood Group" value={p.bloodGroup} />
        </div>
      </div>

      {/* Medical info */}
      <div className="glass-card" style={{ padding: 'var(--sp-6)', marginBottom: 'var(--sp-5)' }}>
        <h4 style={{ color: 'var(--text-primary)', marginBottom: 'var(--sp-5)', paddingBottom: 'var(--sp-3)', borderBottom: '1px solid var(--border-subtle)' }}>
          Medical Information
        </h4>
        <div style={{ marginBottom: 'var(--sp-4)' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Allergies
          </span>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 'var(--sp-2)' }}>
            {(p.allergies || []).length > 0
              ? p.allergies.map((a) => (
                  <span key={a} className="badge badge-rose">{a}</span>
                ))
              : <span style={{ color: 'var(--text-disabled)', fontSize: '0.88rem' }}>No known allergies</span>
            }
          </div>
        </div>
      </div>

      {/* Emergency contact */}
      {p.emergencyContact?.name && (
        <div className="glass-card" style={{ padding: 'var(--sp-6)' }}>
          <h4 style={{ color: 'var(--text-primary)', marginBottom: 'var(--sp-5)', paddingBottom: 'var(--sp-3)', borderBottom: '1px solid var(--border-subtle)' }}>
            🚨 Emergency Contact
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--sp-5)' }}>
            <InfoRow label="Name"     value={p.emergencyContact.name} />
            <InfoRow label="Phone"    value={p.emergencyContact.phone} />
            <InfoRow label="Relation" value={p.emergencyContact.relation} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileTab;
