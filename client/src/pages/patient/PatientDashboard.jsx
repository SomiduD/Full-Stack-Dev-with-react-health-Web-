// client/src/pages/patient/PatientDashboard.jsx
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import useOffline from '../../hooks/useOffline';
import useAppointments from '../../hooks/useAppointments';
import DashboardShell   from '../../components/DashboardShell';
import OverviewTab      from './tabs/OverviewTab';
import AppointmentsTab  from './tabs/AppointmentsTab';
import HealthVaultTab   from './tabs/HealthVaultTab';
import PrescriptionsTab from './tabs/PrescriptionsTab';
import ProfileTab       from './tabs/ProfileTab';

const PatientDashboard = () => {
  const { user, logout } = useAuth();
  const { isOnline }     = useOffline();
  const [activeTab, setActiveTab] = useState('overview');

  // Pre-fetch upcoming appointments for the sidebar badge
  const { appointments } = useAppointments('patient', { upcoming: 'true' });
  const upcomingCount = appointments.filter((a) => a.status !== 'cancelled').length;

  const NAV_ITEMS = [
    { id: 'overview',      label: 'Overview',       icon: '🏠' },
    { id: 'appointments',  label: 'Appointments',    icon: '📅', badge: upcomingCount },
    { id: 'vault',         label: 'Health Vault',    icon: '🗂️' },
    { id: 'prescriptions', label: 'Prescriptions',   icon: '💊' },
    { id: 'profile',       label: 'My Profile',      icon: '👤' },
  ];

  const statusDot = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div className={isOnline ? 'dot-online' : 'dot-offline'} />
      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
        {isOnline ? 'Online' : 'Offline Mode'}
      </span>
    </div>
  );

  const footerBadge = !isOnline ? (
    <div className="badge badge-amber" style={{ width: '100%', justifyContent: 'center' }}>
      ⚡ Dexie cache active
    </div>
  ) : null;

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':      return <OverviewTab user={user} onNavigate={setActiveTab} />;
      case 'appointments':  return <AppointmentsTab />;
      case 'vault':         return <HealthVaultTab />;
      case 'prescriptions': return <PrescriptionsTab />;
      case 'profile':       return <ProfileTab user={user} />;
      default:              return <OverviewTab user={user} onNavigate={setActiveTab} />;
    }
  };

  return (
    <DashboardShell
      accentColor="var(--cyan)"
      gradientFrom="#00d4ff"
      gradientTo="#0080ff"
      navItems={NAV_ITEMS}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onLogout={logout}
      statusDot={statusDot}
      footerBadge={footerBadge}
    >
      {renderTab()}
    </DashboardShell>
  );
};

export default PatientDashboard;
