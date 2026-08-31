// server/src/routes/adminRoutes.js
const express = require('express');
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getStats,
  getDoctors,
  createDoctor,
  updateDoctorStatus,
  getAppointments,
  getPatients,
  getHospital,
} = require('../controllers/adminController');

const router = express.Router();

// All admin routes require authentication
router.use(protect);

// ── Stats — hospital_admin OR super_admin can view stats ───────────────────────
router.get('/stats',      authorize('hospital_admin', 'super_admin'), getStats);
router.get('/hospital',   authorize('hospital_admin', 'super_admin'), getHospital);

// ── Doctors ────────────────────────────────────────────────────────────────────
router.get('/doctors',    authorize('hospital_admin', 'super_admin'), getDoctors);

router.post('/doctors', authorize('hospital_admin', 'super_admin'), [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 chars'),
  body('profile.firstName').trim().notEmpty().withMessage('First name required'),
  body('profile.lastName').trim().notEmpty().withMessage('Last name required'),
  body('profile.specialization').trim().notEmpty().withMessage('Specialization required'),
], createDoctor);

router.patch('/doctors/:id/status', authorize('hospital_admin', 'super_admin'), [
  body('isActive').isBoolean().withMessage('isActive must be boolean'),
], updateDoctorStatus);

// ── Appointments ───────────────────────────────────────────────────────────────
router.get('/appointments', authorize('hospital_admin', 'super_admin'), getAppointments);

// ── Patients ───────────────────────────────────────────────────────────────────
router.get('/patients',   authorize('hospital_admin', 'super_admin'), getPatients);

module.exports = router;
