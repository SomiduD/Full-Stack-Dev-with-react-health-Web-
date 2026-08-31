// client/src/pages/doctor/DoctorDashboard.jsx
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import useAppointments from '../../hooks/useAppointments';
import DashboardShell    from '../../components/DashboardShell';
import DoctorOverviewTab from './tabs/OverviewTab';
import QueueTab          from './tabs/QueueTab';
import TimetableTab      from './tabs/TimetableTab';
import DoctorProfileTab  from './tabs/ProfileTab';

const DoctorDashboard = () => {
  const { user, logout } = useAuth();
  const { isConnected }  = useSocket();
  const [activeTab, setActiveTab] = useState('overview');

  // Pre-fetch queue for sidebar pending badge
  const { appointments: queue } = useAppointments('doctor-queue');
  const pendingCount = queue.filter((a) => a.status === 'pending').length;

  const NAV_ITEMS = [
    { id: 'overview',  label: 'Overview',      icon: '🏠' },
    { id: 'queue',     label: 'Patient Queue',  icon: '👥', badge: pendingCount },
    { id: 'timetable', label: 'My Timetable',  icon: '📆' },
    { id: 'profile',   label: 'My Profile',    icon: '👤' },
  ];

  const statusDot = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{
        width: 8, height: 8, borderRadius: '50%',
        background: isConnected ? 'var(--emerald)' : 'var(--red)',
      }} />
      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
        Socket.io {isConnected ? 'Connected' : 'Disconnected'}
      </span>
    </div>
  );

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':  return <DoctorOverviewTab user={user} onNavigate={setActiveTab} />;
      case 'queue':     return <QueueTab />;
      case 'timetable': return <TimetableTab />;
      case 'profile':   return <DoctorProfileTab user={user} />;
      default:          return <DoctorOverviewTab user={user} onNavigate={setActiveTab} />;
    }
  };

  return (
    <DashboardShell
      accentColor="var(--indigo)"
      gradientFrom="#818cf8"
      gradientTo="#6366f1"
      navItems={NAV_ITEMS}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onLogout={logout}
      statusDot={statusDot}
    >
      {renderTab()}
    </DashboardShell>
  );
};

export default DoctorDashboard;
