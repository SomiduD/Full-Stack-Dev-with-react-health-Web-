// client/src/services/appointmentService.js
import api from './api';

/**
 * Book a new appointment (patient only)
 * @param {{ doctorId, date, timeSlot, reason }} data
 */
export const bookAppointment = (data) =>
  api.post('/appointments', data).then((r) => r.data);

/**
 * Get the current patient's appointments
 * @param {{ status?, upcoming? }} params
 */
export const getMyAppointments = (params = {}) =>
  api.get('/appointments/my', { params }).then((r) => r.data);

/**
 * Get available time slots for a doctor on a date
 * @param {string} doctorId
 * @param {string} date  ISO date string
 */
export const getAvailableSlots = (doctorId, date) =>
  api.get('/appointments/slots', { params: { doctorId, date } }).then((r) => r.data);

/**
 * Doctor: get today's (or a specific date's) patient queue
 * @param {string?} date  ISO date string (defaults to today on server)
 */
export const getDoctorQueue = (date) =>
  api.get('/appointments/doctor/queue', { params: date ? { date } : {} }).then((r) => r.data);

/**
 * Doctor: get full upcoming schedule
 */
export const getDoctorSchedule = () =>
  api.get('/appointments/doctor/schedule').then((r) => r.data);

/**
 * Update appointment status (doctor confirms/cancels; patient cancels)
 * @param {string} id
 * @param {{ status, doctorNotes?, cancelledReason? }} data
 */
export const updateAppointmentStatus = (id, data) =>
  api.patch(`/appointments/${id}/status`, data).then((r) => r.data);
