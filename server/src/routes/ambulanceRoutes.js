// server/src/routes/ambulanceRoutes.js
const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const AmbulanceRequest = require('../models/AmbulanceRequest');
const { User } = require('../models/User');

const router = express.Router();

// All ambulance routes require authentication
router.use(protect);

/**
 * POST /api/ambulance/request
 * Patient submits an emergency ambulance request.
 */
router.post('/request', authorize('patient'), async (req, res, next) => {
  try {
    const { locationNote, emergencyType, notes } = req.body;

    const patient = await User.findById(req.user.id).select('profile hospitalId').lean();
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found.' });

    const request = await AmbulanceRequest.create({
      patientId:     req.user.id,
      hospitalId:    req.user.hospitalId || patient.hospitalId,
      patientName:   `${patient.profile?.firstName} ${patient.profile?.lastName}`,
      patientPhone:  patient.profile?.phone || '',
      locationNote:  locationNote || '',
      emergencyType: emergencyType || 'general',
      notes:         notes || '',
      estimatedETA:  Math.floor(Math.random() * 6) + 7, // 7–12 minutes
    });

    // Emit real-time alert to hospital room
    const io = req.app.get('io');
    if (io && req.user.hospitalId) {
      io.to(`hospital:${req.user.hospitalId}`).emit('ambulance_request', {
        requestId:   request._id,
        patientName: request.patientName,
        emergencyType: request.emergencyType,
        locationNote:  request.locationNote,
        createdAt:     request.createdAt,
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Ambulance request submitted. Help is on the way!',
      data: request,
    });
  } catch (err) { next(err); }
});

/**
 * GET /api/ambulance/my-requests
 * Patient views their own ambulance request history.
 */
router.get('/my-requests', authorize('patient'), async (req, res, next) => {
  try {
    const requests = await AmbulanceRequest.find({ patientId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
    return res.status(200).json({ success: true, data: requests });
  } catch (err) { next(err); }
});

module.exports = router;
