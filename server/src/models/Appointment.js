// server/src/models/Appointment.js
const mongoose = require('mongoose');

const APPOINTMENT_STATUS = Object.freeze({
  PENDING:   'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
});

const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30',
];

const appointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: [true, 'Patient is required'],
    },
    doctorId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: [true, 'Doctor is required'],
    },
    hospitalId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Hospital',
      required: [true, 'Hospital is required'],
    },
    date: {
      type:     Date,
      required: [true, 'Appointment date is required'],
    },
    timeSlot: {
      type:     String,
      enum:     { values: TIME_SLOTS, message: 'Invalid time slot: {VALUE}' },
      required: [true, 'Time slot is required'],
    },
    reason: {
      type:      String,
      required:  [true, 'Reason for visit is required'],
      trim:      true,
      maxlength: [500, 'Reason cannot exceed 500 characters'],
    },
    status: {
      type:    String,
      enum:    { values: Object.values(APPOINTMENT_STATUS), message: 'Invalid status' },
      default: APPOINTMENT_STATUS.PENDING,
    },
    // Notes added by the doctor after consultation
    doctorNotes: {
      type:      String,
      trim:      true,
      maxlength: [2000, 'Notes cannot exceed 2000 characters'],
    },
    cancelledBy:     { type: String, enum: ['patient', 'doctor', 'admin'] },
    cancelledReason: { type: String, trim: true, maxlength: 300 },
  },
  {
    timestamps: true,
    versionKey: '__v', // Optimistic locking via __v for Phase 3 concurrent edits
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
appointmentSchema.index({ doctorId: 1, date: 1 });
appointmentSchema.index({ patientId: 1, status: 1 });
appointmentSchema.index({ hospitalId: 1, date: 1 });

// ─── Prevent double-booking ───────────────────────────────────────────────────
appointmentSchema.index(
  { doctorId: 1, date: 1, timeSlot: 1 },
  { unique: true, partialFilterExpression: { status: { $nin: ['cancelled'] } } }
);

const Appointment = mongoose.model('Appointment', appointmentSchema);
module.exports = { Appointment, APPOINTMENT_STATUS, TIME_SLOTS };
