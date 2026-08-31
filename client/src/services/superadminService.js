// client/src/services/superadminService.js
import api from './api';

/** GET /api/superadmin/stats — platform-wide aggregates across ALL hospitals */
export const getSuperStats   = ()        => api.get('/superadmin/stats').then(r => r.data);

/** GET /api/superadmin/hospitals — list all hospitals */
export const getAllHospitals = ()        => api.get('/superadmin/hospitals').then(r => r.data);

/** PATCH /api/superadmin/hospitals/:id/status */
export const toggleHospital  = (id, isActive) =>
  api.patch(`/superadmin/hospitals/${id}/status`, { isActive }).then(r => r.data);
