// server/src/controllers/appointmentController.js
const { validationResult } = require('express-validator');
const { Appointment, APPOINTMENT_STATUS, TIME_SLOTS } = require('../models/Appointment');
const { User, ROLES } = require('../models/User');

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
 * @desc   Patient books a new appointment
 * @route  POST /api/appointments
 * @access Protected — patient only
 */
const bookAppointment = async (req, res, next) => {
  try {
    if (handleValidation(req, res)) return;

    const { doctorId, date, timeSlot, reason } = req.body;
    const patientId  = req.user.id;
    const hospitalId = req.user.hospitalId;

    // Verify doctor exists, is a doctor, and belongs to the same hospital
    const doctor = await User.findOne({
      _id:        doctorId,
      role:       ROLES.DOCTOR,
      hospitalId,
      isActive:   true,
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found in your hospital.',
      });
    }

    // Normalize date to midnight UTC so comparisons are date-only
    const apptDate = new Date(date);
    apptDate.setUTCHours(0, 0, 0, 0);

    if (apptDate < new Date().setUTCHours(0, 0, 0, 0)) {
      return res.status(400).json({ success: false, message: 'Appointment date cannot be in the past.' });
    }

    const appointment = await Appointment.create({
      patientId,
      doctorId,
      hospitalId,
      date: apptDate,
      timeSlot,
      reason,
    });

    await appointment.populate([
      { path: 'doctorId',   select: 'profile.firstName profile.lastName profile.specialization' },
      { path: 'patientId',  select: 'profile.firstName profile.lastName' },
    ]);

    // Emit real-time event BEFORE sending the response
    const io = req.app.get('io');
    if (io) {
      io.to(`hospital:${hospitalId}`).emit('appointment:new', appointment);
      io.to(`doctor:${doctorId}`).emit('appointment:new', appointment);
    }

    return res.status(201).json({
      success: true,
      message: 'Appointment booked successfully.',
      data:    appointment,
    });
  } catch (err) {
    // Duplicate key = slot already taken
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'This time slot is already booked. Please choose a different slot.',
      });
    }
    next(err);
  }
};

/**
 * @desc   Patient retrieves their own appointments
 * @route  GET /api/appointments/my
 * @access Protected — patient only
 */
const getMyAppointments = async (req, res, next) => {
  try {
    const { status, upcoming } = req.query;

    const filter = { patientId: req.user.id };
    if (status) filter.status = status;
    if (upcoming === 'true') filter.date = { $gte: new Date() };

    const appointments = await Appointment.find(filter)
      .populate('doctorId', 'profile.firstName profile.lastName profile.specialization profile.department')
      .populate('hospitalId', 'name')
      .sort({ date: 1, timeSlot: 1 })
      .lean();

    return res.status(200).json({ success: true, data: appointments });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc   Doctor retrieves their queue (today's or a specific date)
 * @route  GET /api/appointments/doctor/queue
 * @access Protected — doctor only
 */
const getDoctorQueue = async (req, res, next) => {
  try {
    const { date } = req.query;

    const targetDate = date ? new Date(date) : new Date();
    targetDate.setUTCHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const appointments = await Appointment.find({
      doctorId: req.user.id,
      date:     { $gte: targetDate, $lt: nextDay },
      status:   { $in: [APPOINTMENT_STATUS.PENDING, APPOINTMENT_STATUS.CONFIRMED] },
    })
      .populate('patientId', 'profile.firstName profile.lastName profile.bloodGroup profile.phone profile.gender')
      .sort({ timeSlot: 1 })
      .lean();

    return res.status(200).json({ success: true, data: appointments });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc   Doctor retrieves their full schedule (all upcoming)
 * @route  GET /api/appointments/doctor/schedule
 * @access Protected — doctor only
 */
const getDoctorSchedule = async (req, res, next) => {
  try {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const appointments = await Appointment.find({
      doctorId: req.user.id,
      date:     { $gte: today },
    })
      .populate('patientId', 'profile.firstName profile.lastName')
      .sort({ date: 1, timeSlot: 1 })
      .lean();

    return res.status(200).json({ success: true, data: appointments });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc   Doctor or patient updates appointment status
 * @route  PATCH /api/appointments/:id/status
 * @access Protected — doctor or patient (with role restrictions)
 */
const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, doctorNotes, cancelledReason } = req.body;
    const { role, id: userId } = req.user;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    // Doctors can confirm/complete/cancel; patients can only cancel their own
    if (role === ROLES.PATIENT) {
      if (appointment.patientId.toString() !== userId) {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }
      if (status !== APPOINTMENT_STATUS.CANCELLED) {
        return res.status(403).json({ success: false, message: 'Patients can only cancel appointments.' });
      }
    }

    if (role === ROLES.DOCTOR) {
      if (appointment.doctorId.toString() !== userId) {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }
    }

    appointment.status = status;
    if (doctorNotes)      appointment.doctorNotes      = doctorNotes;
    if (cancelledReason)  appointment.cancelledReason  = cancelledReason;
    if (status === APPOINTMENT_STATUS.CANCELLED) {
      appointment.cancelledBy = role === ROLES.PATIENT ? 'patient' : 'doctor';
    }

    await appointment.save();
    await appointment.populate([
      { path: 'doctorId',  select: 'profile.firstName profile.lastName profile.specialization' },
      { path: 'patientId', select: 'profile.firstName profile.lastName' },
    ]);

    // Emit real-time status update
    const io = req.app.get('io');
    if (io) {
      io.to(`hospital:${appointment.hospitalId}`).emit('appointment:updated', appointment);
      io.to(`doctor:${appointment.doctorId._id}`).emit('appointment:updated', appointment);
    }

    return res.status(200).json({ success: true, message: 'Appointment updated.', data: appointment });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc   Get list of available time slots for a doctor on a date
 * @route  GET /api/appointments/slots?doctorId=&date=
 * @access Protected
 */
const getAvailableSlots = async (req, res, next) => {
  try {
    const { doctorId, date } = req.query;
    if (!doctorId || !date) {
      return res.status(400).json({ success: false, message: 'doctorId and date are required.' });
    }

    const targetDate = new Date(date);
    targetDate.setUTCHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const booked = await Appointment.find({
      doctorId,
      date:   { $gte: targetDate, $lt: nextDay },
      status: { $nin: [APPOINTMENT_STATUS.CANCELLED] },
    }).select('timeSlot').lean();

    const bookedSlots = booked.map((a) => a.timeSlot);
    const available   = TIME_SLOTS.filter((s) => !bookedSlots.includes(s));

    return res.status(200).json({ success: true, data: { available, booked: bookedSlots, all: TIME_SLOTS } });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  bookAppointment,
  getMyAppointments,
  getDoctorQueue,
  getDoctorSchedule,
  updateAppointmentStatus,
  getAvailableSlots,
};
