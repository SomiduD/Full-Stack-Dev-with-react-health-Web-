// client/src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { cacheUser, getCachedUser, clearUserCache } from '../db/healthVaultDB';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);  // true on mount while rehydrating
  const [error,   setError]   = useState(null);

  // ─── Session rehydration on mount ──────────────────────────────────────────
  useEffect(() => {
    const rehydrate = async () => {
      const token = localStorage.getItem('accessToken');

      if (!token) {
        // No token in storage — try Dexie cache for offline continuity
        const cached = await getCachedUser();
        if (cached) {
          setUser({
            id:               cached.userId,
            email:            cached.email,
            role:             cached.role,
            hospitalId:       cached.hospitalId,
            profile:          cached.profile,
            hospital:         cached.hospital,
            isOfflineCached:  true,
          });
        }
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get('/auth/me');
        const userData = data.data;
        setUser(userData);
        await cacheUser(userData);
      } catch (_err) {
        // Token invalid or server unreachable — fall back to Dexie cache
        const cached = await getCachedUser();
        if (cached) {
          setUser({
            id:              cached.userId,
            email:           cached.email,
            role:            cached.role,
            hospitalId:      cached.hospitalId,
            profile:         cached.profile,
            hospital:        cached.hospital,
            isOfflineCached: true,
          });
        } else {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      } finally {
        setLoading(false);
      }
    };

    rehydrate();
  }, []);

  // ─── Register ───────────────────────────────────────────────────────────────
  const register = useCallback(async (formData) => {
    setError(null);
    try {
      const { data } = await api.post('/auth/register', formData);
      const { accessToken, refreshToken, user: userData } = data.data;

      localStorage.setItem('accessToken',  accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      setUser(userData);
      await cacheUser(userData);

      return { success: true, user: userData };
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(message);
      return { success: false, message, errors: err.response?.data?.errors };
    }
  }, []);

  // ─── Login ──────────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    setError(null);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      const { accessToken, refreshToken, user: userData } = data.data;

      localStorage.setItem('accessToken',  accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      setUser(userData);
      await cacheUser(userData);

      return { success: true, user: userData };
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(message);
      return { success: false, message };
    }
  }, []);

  // ─── Logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      await api.post('/auth/logout', { refreshToken });
    } catch (_) {
      // Server logout failure should never block client-side logout
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      await clearUserCache();
      setUser(null);
      setError(null);
    }
  }, []);

  const value = {
    user,
    loading,
    error,
    setError,
    login,
    logout,
    register,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Named export for direct context consumption
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an <AuthProvider>');
  return ctx;
};

export default AuthContext;
