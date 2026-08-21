// server/src/models/Hospital.js
const mongoose = require('mongoose');

/**
 * Hospital — the multi-tenant anchor document.
 * Every User, Appointment, Bed, and Resource is scoped to a Hospital via hospitalId.
 */
const hospitalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Hospital name is required'],
      trim: true,
      maxlength: [120, 'Hospital name cannot exceed 120 characters'],
    },
    // Short unique slug used as tenant identifier (e.g. "AIIMS_DEL")
    code: {
      type: String,
      required: [true, 'Hospital code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      match: [/^[A-Z0-9_-]{3,20}$/, 'Code must be 3-20 uppercase alphanumeric characters'],
    },
    address: {
      street:     { type: String, trim: true },
      city:       { type: String, trim: true },
      state:      { type: String, trim: true },
      postalCode: { type: String, trim: true },
      country:    { type: String, trim: true, default: 'India' },
    },
    contactEmail: {
      type: String,
      required: [true, 'Contact email is required'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    contactPhone: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    settings: {
      maxBedsICU:          { type: Number, default: 0, min: 0 },
      maxBedsGeneral:      { type: Number, default: 0, min: 0 },
      maxBedsEmergency:    { type: Number, default: 0, min: 0 },
      emergencyServices:   { type: Boolean, default: false },
      telemedicineEnabled: { type: Boolean, default: false },
      timezone:            { type: String, default: 'Asia/Kolkata' },
    },
    // Set by the super_admin who onboards this hospital
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    versionKey: '__v', // Mongoose optimistic locking — used in Phase 3+ for concurrent edits
  }
);

// code is already indexed via unique:true on the field definition
hospitalSchema.index({ isActive: 1 });

const Hospital = mongoose.model('Hospital', hospitalSchema);
module.exports = Hospital;
