// server/src/controllers/adminController.js
const { User, ROLES } = require('../models/User');
const Appointment     = require('../models/Appointment');
const HealthRecord    = require('../models/HealthRecord');
const Hospital        = require('../models/Hospital');
const bcrypt          = require('bcryptjs');
const { validationResult } = require('express-validator');

// ── Helper ─────────────────────────────────────────────────────────────────────
const handleValidation = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({ success: false, errors: errors.array() });
    return true;
  }
  return false;
};

/**
 * GET /api/admin/stats
 * Hospital-wide real-time stats from the database.
 */
exports.getStats = async (req, res, next) => {
  try {
    const hospitalId = req.user.hospitalId;

    const [
      totalDoctors,
      totalPatients,
      todayAppts,
      pendingAppts,
      confirmedAppts,
      completedAppts,
      totalRecords,
      hospital,
    ] = await Promise.all([
      User.countDocuments({ hospitalId, role: ROLES.DOCTOR, isActive: true }),
      User.countDocuments({ hospitalId, role: ROLES.PATIENT, isActive: true }),
      Appointment.countDocuments({
        hospitalId,
        date: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lte: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      }),
      Appointment.countDocuments({ hospitalId, status: 'pending' }),
      Appointment.countDocuments({ hospitalId, status: 'confirmed' }),
      Appointment.countDocuments({ hospitalId, status: 'completed' }),
      HealthRecord.countDocuments({ hospitalId, isDeleted: { $ne: true } }),
      Hospital.findById(hospitalId).select('name code settings').lean(),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalDoctors,
        totalPatients,
        todayAppts,
        pendingAppts,
        confirmedAppts,
        completedAppts,
        totalRecords,
        hospital,
        bedsICU:      hospital?.settings?.maxBedsICU      || 0,
        bedsGeneral:  hospital?.settings?.maxBedsGeneral  || 0,
        bedsEmergency:hospital?.settings?.maxBedsEmergency|| 0,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/admin/doctors
 * All doctors in the admin's hospital.
 */
exports.getDoctors = async (req, res, next) => {
  try {
    const { isActive } = req.query;
    const filter = { hospitalId: req.user.hospitalId, role: ROLES.DOCTOR };
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const doctors = await User.find(filter)
      .select('-passwordHash -refreshTokens')
      .sort({ 'profile.lastName': 1 })
      .lean();

    return res.status(200).json({ success: true, data: doctors });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/admin/doctors
 * Create a new doctor account in the hospital.
 */
exports.createDoctor = async (req, res, next) => {
  if (handleValidation(req, res)) return;
  try {
    const { email, password, profile } = req.body;
    const hospitalId = req.user.hospitalId;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const doctor = await User.create({
      email,
      passwordHash,
      role: ROLES.DOCTOR,
      hospitalId,
      isActive: true,
      profile: {
        firstName:      profile.firstName,
        lastName:       profile.lastName,
        gender:         profile.gender || 'prefer_not_to_say',
        specialization: profile.specialization,
        department:     profile.department,
        licenseNumber:  profile.licenseNumber,
        yearsExperience:profile.yearsExperience || 0,
        phone:          profile.phone,
      },
    });

    // Emit to admin room so all admin tabs update live
    const io = req.app.get('io');
    if (io) io.to(`hospital:${hospitalId}`).emit('doctor:new', { _id: doctor._id });

    return res.status(201).json({
      success: true,
      message: 'Doctor account created.',
      data: { _id: doctor._id, email: doctor.email, profile: doctor.profile },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/admin/doctors/:id/status
 * Activate / deactivate a doctor.
 */
exports.updateDoctorStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;
    const doctor = await User.findOneAndUpdate(
      { _id: req.params.id, hospitalId: req.user.hospitalId, role: ROLES.DOCTOR },
      { isActive },
      { new: true }
    ).select('-passwordHash -refreshTokens');

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }
    return res.status(200).json({ success: true, data: doctor });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/admin/appointments
 * All appointments in the hospital with optional filters.
 */
exports.getAppointments = async (req, res, next) => {
  try {
    const { status, doctorId, date, page = 1, limit = 20 } = req.query;
    const filter = { hospitalId: req.user.hospitalId };
    if (status)   filter.status   = status;
    if (doctorId) filter.doctorId = doctorId;
    if (date) {
      const d = new Date(date);
      filter.date = {
        $gte: new Date(d.setHours(0, 0, 0, 0)),
        $lte: new Date(d.setHours(23, 59, 59, 999)),
      };
    }

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Appointment.countDocuments(filter);
    const appointments = await Appointment.find(filter)
      .populate('patientId', 'profile.firstName profile.lastName profile.phone')
      .populate('doctorId',  'profile.firstName profile.lastName profile.specialization')
      .sort({ date: -1, timeSlot: 1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    return res.status(200).json({
      success: true,
      data: appointments,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/admin/patients
 * All patients in the hospital.
 */
exports.getPatients = async (req, res, next) => {
  try {
    const { search } = req.query;
    const filter = { hospitalId: req.user.hospitalId, role: ROLES.PATIENT, isActive: true };

    if (search) {
      filter.$or = [
        { 'profile.firstName': { $regex: search, $options: 'i' } },
        { 'profile.lastName':  { $regex: search, $options: 'i' } },
        { email:               { $regex: search, $options: 'i' } },
      ];
    }

    const patients = await User.find(filter)
      .select('-passwordHash -refreshTokens')
      .sort({ 'profile.lastName': 1 })
      .lean();

    return res.status(200).json({ success: true, data: patients });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/admin/hospital
 * Get hospital profile.
 */
exports.getHospital = async (req, res, next) => {
  try {
    const hospital = await Hospital.findById(req.user.hospitalId).lean();
    if (!hospital) return res.status(404).json({ success: false, message: 'Hospital not found.' });
    return res.status(200).json({ success: true, data: hospital });
  } catch (err) {
    next(err);
  }
};
