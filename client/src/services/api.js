// client/src/services/api.js
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Configured Axios instance.
 * All API calls in the app should import this, never raw axios.
 */
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request interceptor ──────────────────────────────────────────────────────
// Automatically attach the access token to every outgoing request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (err) => Promise.reject(err)
);

// ─── Response interceptor — silent token refresh ──────────────────────────────
let isRefreshing  = false;
let failedQueue   = []; // Requests queued while refresh is in-flight

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => (error ? prom.reject(error) : prom.resolve(token)));
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // ── Never retry auth endpoints — their 401s are real credential errors ──
    const isAuthEndpoint = originalRequest?.url?.includes('/auth/login')
      || originalRequest?.url?.includes('/auth/register')
      || originalRequest?.url?.includes('/auth/refresh');

    // Only handle 401s that haven't already been retried, and are not auth endpoints
    if (error.response?.status !== 401 || originalRequest._retry || isAuthEndpoint) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Queue subsequent 401s until the in-flight refresh resolves
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch(Promise.reject);
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const storedRefresh = localStorage.getItem('refreshToken');

    if (!storedRefresh) {
      isRefreshing = false;
      forceLogout();
      return Promise.reject(error);
    }

    try {
      // Call refresh endpoint directly with axios (not the intercepted instance)
      const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
        refreshToken: storedRefresh,
      });

      const { accessToken, refreshToken } = data.data;

      localStorage.setItem('accessToken',  accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
      originalRequest.headers.Authorization      = `Bearer ${accessToken}`;

      processQueue(null, accessToken);
      return api(originalRequest);
    } catch (refreshErr) {
      processQueue(refreshErr, null);
      forceLogout();
      return Promise.reject(refreshErr);
    } finally {
      isRefreshing = false;
    }
  }
);

/** Hard-redirect to login after token refresh failure */
const forceLogout = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  window.location.href = '/login';
};

export default api;
