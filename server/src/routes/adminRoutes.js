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

// All admin routes require authentication + hospital_admin role
router.use(protect);
router.use(authorize('hospital_admin'));

// ── Stats ──────────────────────────────────────────────────────────────────────
router.get('/stats', getStats);

// ── Hospital profile ───────────────────────────────────────────────────────────
router.get('/hospital', getHospital);

// ── Doctors ────────────────────────────────────────────────────────────────────
router.get('/doctors', getDoctors);

router.post('/doctors', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 chars'),
  body('profile.firstName').trim().notEmpty().withMessage('First name required'),
  body('profile.lastName').trim().notEmpty().withMessage('Last name required'),
  body('profile.specialization').trim().notEmpty().withMessage('Specialization required'),
], createDoctor);

router.patch('/doctors/:id/status', [
  body('isActive').isBoolean().withMessage('isActive must be boolean'),
], updateDoctorStatus);

// ── Appointments ───────────────────────────────────────────────────────────────
router.get('/appointments', getAppointments);

// ── Patients ───────────────────────────────────────────────────────────────────
router.get('/patients', getPatients);

module.exports = router;
