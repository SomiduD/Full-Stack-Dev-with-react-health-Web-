// client/src/services/healthRecordService.js
import api from './api';

/**
 * Get the current patient's health records
 * @param {{ type? }} params - optional filter by record type
 */
export const getMyRecords = (params = {}) =>
  api.get('/health-records/my', { params }).then((r) => r.data);

/**
 * Get a single health record by ID
 * @param {string} id
 */
export const getRecordById = (id) =>
  api.get(`/health-records/${id}`).then((r) => r.data);

/**
 * Get all records for a patient (doctor/admin)
 * @param {string} patientId
 * @param {{ type? }} params
 */
export const getPatientRecords = (patientId, params = {}) =>
  api.get(`/health-records/patient/${patientId}`, { params }).then((r) => r.data);

/**
 * Create a new health record
 * @param {{ type, title, description?, fileUrl?, date?, tags?, patientId? }} data
 */
export const createRecord = (data) =>
  api.post('/health-records', data).then((r) => r.data);

/**
 * Soft-delete a health record
 * @param {string} id
 */
export const deleteRecord = (id) =>
  api.delete(`/health-records/${id}`).then((r) => r.data);

/**
 * Get all doctors in the caller's hospital
 */
export const getDoctorsInHospital = () =>
  api.get('/doctors').then((r) => r.data);
