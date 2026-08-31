// server/src/routes/superAdminRoutes.js
const express    = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const Hospital   = require('../models/Hospital');
const { User, ROLES } = require('../models/User');

const router = express.Router();

// All super admin routes require authentication + super_admin role
router.use(protect);
router.use(authorize('super_admin'));

/**
 * GET /api/superadmin/hospitals
 * List all hospitals in the platform.
 */
router.get('/hospitals', async (req, res, next) => {
  try {
    const hospitals = await Hospital.find({}).sort({ name: 1 }).lean();
    return res.status(200).json({ success: true, data: hospitals });
  } catch (err) { next(err); }
});

/**
 * GET /api/superadmin/stats
 * Platform-wide aggregate stats across ALL hospitals.
 */
router.get('/stats', async (req, res, next) => {
  try {
    const { Appointment } = require('../models/Appointment');
    const { HealthRecord } = require('../models/HealthRecord');

    const today0 = new Date(); today0.setHours(0, 0, 0, 0);
    const today1 = new Date(); today1.setHours(23, 59, 59, 999);

    const [
      totalHospitals,
      totalDoctors,
      totalPatients,
      totalAdmins,
      todayAppts,
      pendingAppts,
      completedAppts,
      totalRecords,
      hospitals,
    ] = await Promise.all([
      Hospital.countDocuments({ isActive: true }),
      User.countDocuments({ role: ROLES.DOCTOR, isActive: true }),
      User.countDocuments({ role: ROLES.PATIENT, isActive: true }),
      User.countDocuments({ role: ROLES.HOSPITAL_ADMIN, isActive: true }),
      Appointment.countDocuments({ date: { $gte: today0, $lte: today1 } }),
      Appointment.countDocuments({ status: 'pending' }),
      Appointment.countDocuments({ status: 'completed' }),
      HealthRecord.countDocuments({ isDeleted: { $ne: true } }),
      Hospital.find({ isActive: true }).select('name code address contactEmail settings').lean(),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalHospitals,
        totalDoctors,
        totalPatients,
        totalAdmins,
        todayAppts,
        pendingAppts,
        completedAppts,
        totalRecords,
        hospitals,
      },
    });
  } catch (err) { next(err); }
});

/**
 * PATCH /api/superadmin/hospitals/:id/status
 * Activate / deactivate a hospital.
 */
router.patch('/hospitals/:id/status', async (req, res, next) => {
  try {
    const { isActive } = req.body;
    const hospital = await Hospital.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    );
    if (!hospital) return res.status(404).json({ success: false, message: 'Hospital not found.' });
    return res.status(200).json({ success: true, data: hospital });
  } catch (err) { next(err); }
});

module.exports = router;
