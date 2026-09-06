// server/src/models/AmbulanceRequest.js
const mongoose = require('mongoose');

const ambulanceRequestSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      required: true,
    },
    patientName:  { type: String, required: true },
    patientPhone: { type: String, default: '' },
    locationNote: { type: String, default: '' },  // Patient's described location
    status: {
      type: String,
      enum: ['requested', 'dispatched', 'arrived', 'cancelled'],
      default: 'requested',
    },
    emergencyType: {
      type: String,
      enum: ['general', 'cardiac', 'trauma', 'maternity', 'other'],
      default: 'general',
    },
    estimatedETA: { type: Number, default: 10 }, // minutes
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

const AmbulanceRequest = mongoose.model('AmbulanceRequest', ambulanceRequestSchema);
module.exports = AmbulanceRequest;
