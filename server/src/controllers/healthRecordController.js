// server/src/controllers/healthRecordController.js
const { validationResult } = require('express-validator');
const { HealthRecord, RECORD_TYPES } = require('../models/HealthRecord');
const { ROLES } = require('../models/User');

// ─── Helpers ──────────────────────────────────────────────────────────────────

const handleValidation = (req, res) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    res.status(422).json({
      success: false,
      message: 'Validation failed.',
      errors:  result.array().map((e) => ({ field: e.path, message: e.msg })),
    });
    return true;
  }
  return false;
};

// ─── Controllers ─────────────────────────────────────────────────────────────

/**
 * @desc   Create a health record (doctor, admin, or patient self-upload)
 * @route  POST /api/health-records
 * @access Protected
 */
const createRecord = async (req, res, next) => {
  try {
    if (handleValidation(req, res)) return;

    const { patientId, type, title, description, fileUrl, date, tags } = req.body;
    const { id: uploadedBy, role, hospitalId } = req.user;

    // Patients can only create records for themselves
    const resolvedPatientId = role === ROLES.PATIENT ? uploadedBy : patientId;

    if (!resolvedPatientId) {
      return res.status(400).json({ success: false, message: 'patientId is required.' });
    }

    const record = await HealthRecord.create({
      patientId:   resolvedPatientId,
      hospitalId,
      uploadedBy,
      type,
      title,
      description,
      fileUrl,
      date:  date ? new Date(date) : undefined,
      tags:  tags || [],
    });

    await record.populate('uploadedBy', 'profile.firstName profile.lastName role');

    return res.status(201).json({ success: true, message: 'Health record created.', data: record });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc   Patient retrieves their own health records
 * @route  GET /api/health-records/my
 * @access Protected — patient only
 */
const getMyRecords = async (req, res, next) => {
  try {
    const { type } = req.query;
    const filter = { patientId: req.user.id, isVisible: true };
    if (type) filter.type = type;

    const records = await HealthRecord.find(filter)
      .populate('uploadedBy', 'profile.firstName profile.lastName role')
      .populate('hospitalId', 'name')
      .sort({ date: -1 })
      .lean();

    return res.status(200).json({ success: true, data: records });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc   Get all records for a patient (doctor/admin access)
 * @route  GET /api/health-records/patient/:patientId
 * @access Protected — doctor, hospital_admin, super_admin
 */
const getPatientRecords = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    const { type }      = req.query;

    const filter = { patientId, isVisible: true };
    if (type) filter.type = type;

    const records = await HealthRecord.find(filter)
      .populate('uploadedBy', 'profile.firstName profile.lastName role')
      .sort({ date: -1 })
      .lean();

    return res.status(200).json({ success: true, data: records });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc   Get a single health record by ID
 * @route  GET /api/health-records/:id
 * @access Protected — owner patient, or doctor/admin in same hospital
 */
const getRecordById = async (req, res, next) => {
  try {
    const record = await HealthRecord.findById(req.params.id)
      .populate('uploadedBy', 'profile.firstName profile.lastName role')
      .populate('hospitalId', 'name')
      .lean();

    if (!record) {
      return res.status(404).json({ success: false, message: 'Health record not found.' });
    }

    // Patients can only view their own records
    if (
      req.user.role === ROLES.PATIENT &&
      record.patientId.toString() !== req.user.id
    ) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    return res.status(200).json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc   Soft-delete (hide) a health record
 * @route  DELETE /api/health-records/:id
 * @access Protected — uploader or admin
 */
const deleteRecord = async (req, res, next) => {
  try {
    const record = await HealthRecord.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Health record not found.' });
    }

    const isOwner = record.uploadedBy?.toString() === req.user.id;
    const isAdmin = [ROLES.HOSPITAL_ADMIN, ROLES.SUPER_ADMIN].includes(req.user.role);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    record.isVisible = false;
    await record.save();

    return res.status(200).json({ success: true, message: 'Health record removed.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { createRecord, getMyRecords, getPatientRecords, getRecordById, deleteRecord };
