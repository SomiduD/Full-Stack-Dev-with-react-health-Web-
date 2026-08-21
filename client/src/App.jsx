// client/src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import OfflineBanner from './components/OfflineBanner';
import ProtectedRoute from './components/ProtectedRoute';

// Auth pages
import LoginPage    from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Portal dashboards
import PatientDashboard    from './pages/patient/PatientDashboard';
import DoctorDashboard     from './pages/doctor/DoctorDashboard';
import AdminDashboard      from './pages/admin/AdminDashboard';
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard';

/** Maps role → home route. Used to redirect authenticated users away from /login. */
const ROLE_HOME = {
  patient:        '/patient/dashboard',
  doctor:         '/doctor/dashboard',
  hospital_admin: '/admin/dashboard',
  super_admin:    '/super-admin/dashboard',
};

/**
 * AuthRedirect — redirects already-authenticated users away from public auth pages.
 * If the user is loading, renders nothing (prevents flash).
 */
const AuthRedirect = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to={ROLE_HOME[user.role] || '/'} replace />;
  return children;
};

function App() {
  return (
    <>
      {/* Global offline network banner */}
      <OfflineBanner />

      <Routes>
        {/* ── Root redirect ──────────────────────────────────────────── */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* ── Public auth routes ─────────────────────────────────────── */}
        <Route
          path="/login"
          element={
            <AuthRedirect>
              <LoginPage />
            </AuthRedirect>
          }
        />
        <Route
          path="/register"
          element={
            <AuthRedirect>
              <RegisterPage />
            </AuthRedirect>
          }
        />

        {/* ── Patient Portal ─────────────────────────────────────────── */}
        <Route
          path="/patient/*"
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <PatientDashboard />
            </ProtectedRoute>
          }
        />

        {/* ── Doctor Portal ──────────────────────────────────────────── */}
        <Route
          path="/doctor/*"
          element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />

        {/* ── Hospital Admin Portal ───────────────────────────────────── */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={['hospital_admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* ── Super Admin Portal ──────────────────────────────────────── */}
        <Route
          path="/super-admin/*"
          element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <SuperAdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* ── 404 fallback ───────────────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}

export default App;
