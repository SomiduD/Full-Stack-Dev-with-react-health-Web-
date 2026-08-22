// server/src/routes/doctorRoutes.js
const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const { User, ROLES } = require('../models/User');

const router = express.Router();

router.use(protect);

/**
 * @desc   List all doctors in the caller's hospital
 * @route  GET /api/doctors
 * @access Protected — any role
 */
router.get('/', async (req, res, next) => {
  try {
    const hospitalId = req.user.hospitalId;
    if (!hospitalId) {
      return res.status(400).json({ success: false, message: 'No hospital associated with your account.' });
    }

    const doctors = await User.find({
      hospitalId,
      role:     ROLES.DOCTOR,
      isActive: true,
    })
      .select('profile.firstName profile.lastName profile.specialization profile.department profile.yearsExperience profile.avatar')
      .sort({ 'profile.lastName': 1 })
      .lean();

    return res.status(200).json({ success: true, data: doctors });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
