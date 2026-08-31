// client/src/services/adminService.js
import api from './api';

export const getStats        = ()              => api.get('/admin/stats').then(r => r.data);
export const getHospital     = ()              => api.get('/admin/hospital').then(r => r.data);

export const getDoctors      = (params = {})   => api.get('/admin/doctors', { params }).then(r => r.data);
export const createDoctor    = (data)          => api.post('/admin/doctors', data).then(r => r.data);
export const updateDoctorStatus = (id, isActive) =>
  api.patch(`/admin/doctors/${id}/status`, { isActive }).then(r => r.data);

export const getAdminAppointments = (params = {}) =>
  api.get('/admin/appointments', { params }).then(r => r.data);

export const getPatients     = (params = {})   => api.get('/admin/patients', { params }).then(r => r.data);
