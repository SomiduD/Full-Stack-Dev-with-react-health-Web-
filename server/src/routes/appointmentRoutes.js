// server/src/routes/appointmentRoutes.js
const express = require('express');
const { body, query } = require('express-validator');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  bookAppointment,
  getMyAppointments,
  getDoctorQueue,
  getDoctorSchedule,
  updateAppointmentStatus,
  getAvailableSlots,
} = require('../controllers/appointmentController');
const { TIME_SLOTS } = require('../models/Appointment');

const router = express.Router();

// All routes require authentication
router.use(protect);

// ── Slot availability (any authenticated user can query) ──────────────────────
router.get('/slots', getAvailableSlots);

// ── Patient routes ────────────────────────────────────────────────────────────
router.post(
  '/',
  authorize('patient'),
  [
    body('doctorId').notEmpty().withMessage('Doctor ID is required'),
    body('date').isISO8601().withMessage('Valid date is required'),
    body('timeSlot').isIn(TIME_SLOTS).withMessage('Invalid time slot'),
    body('reason').trim().notEmpty().isLength({ max: 500 }).withMessage('Reason is required (max 500 chars)'),
  ],
  bookAppointment
);

router.get('/my', authorize('patient'), getMyAppointments);

// ── Doctor routes ─────────────────────────────────────────────────────────────
router.get('/doctor/queue',    authorize('doctor'), getDoctorQueue);
router.get('/doctor/schedule', authorize('doctor'), getDoctorSchedule);

// ── Shared — update status ────────────────────────────────────────────────────
router.patch(
  '/:id/status',
  authorize('patient', 'doctor', 'hospital_admin'),
  [
    body('status')
      .isIn(['pending', 'confirmed', 'cancelled', 'completed'])
      .withMessage('Invalid status value'),
  ],
  updateAppointmentStatus
);

module.exports = router;
