// client/src/components/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/** Maps each role to its home portal path */
const ROLE_HOME = {
  patient:        '/patient/dashboard',
  doctor:         '/doctor/dashboard',
  hospital_admin: '/admin/dashboard',
  super_admin:    '/super-admin/dashboard',
};

/**
 * ProtectedRoute — wraps routes that require authentication.
 *
 * Props:
 *   allowedRoles {string[]} — roles permitted to render `children`
 *   children     {ReactNode}
 *
 * Behaviour:
 *   • Loading   → renders a centered spinner (avoids flash-of-login)
 *   • No user   → redirects to /login (preserves attempted URL in state)
 *   • Wrong role→ redirects to the user's own portal home
 *   • Correct   → renders children
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location          = useLocation();

  if (loading) {
    return (
      <div
        style={{
          minHeight:      '100svh',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          background:     'var(--bg-base)',
        }}
      >
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div className="spinner spinner-lg" />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading your portal…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const home = ROLE_HOME[user.role] || '/login';
    return <Navigate to={home} replace />;
  }

  return children;
};

export default ProtectedRoute;
