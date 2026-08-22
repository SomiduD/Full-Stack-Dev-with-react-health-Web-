// server/src/routes/healthRecordRoutes.js
const express = require('express');
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  createRecord,
  getMyRecords,
  getPatientRecords,
  getRecordById,
  deleteRecord,
} = require('../controllers/healthRecordController');
const { RECORD_TYPES } = require('../models/HealthRecord');

const router = express.Router();

router.use(protect);

const VALID_TYPES = Object.values(RECORD_TYPES);

// ── Patient ───────────────────────────────────────────────────────────────────
router.get('/my', authorize('patient'), getMyRecords);

// ── Doctor / Admin — view a patient's records ─────────────────────────────────
router.get(
  '/patient/:patientId',
  authorize('doctor', 'hospital_admin', 'super_admin'),
  getPatientRecords
);

// ── Single record (patient, doctor, admin) ────────────────────────────────────
router.get('/:id', getRecordById);

// ── Create record ─────────────────────────────────────────────────────────────
router.post(
  '/',
  [
    body('type').isIn(VALID_TYPES).withMessage(`Type must be one of: ${VALID_TYPES.join(', ')}`),
    body('title').trim().notEmpty().isLength({ max: 200 }).withMessage('Title is required (max 200 chars)'),
    body('description').optional().isLength({ max: 2000 }),
  ],
  createRecord
);

// ── Soft delete ───────────────────────────────────────────────────────────────
router.delete('/:id', deleteRecord);

module.exports = router;
