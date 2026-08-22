// server/src/models/HealthRecord.js
const mongoose = require('mongoose');

const RECORD_TYPES = Object.freeze({
  LAB:        'lab',
  IMAGING:    'imaging',
  PRESCRIPTION: 'prescription',
  DISCHARGE:  'discharge',
  VACCINATION:'vaccination',
  OTHER:      'other',
});

const healthRecordSchema = new mongoose.Schema(
  {
    patientId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: [true, 'Patient is required'],
    },
    hospitalId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Hospital',
      required: [true, 'Hospital is required'],
    },
    // The doctor or admin who created/uploaded this record
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'User',
    },
    type: {
      type:     String,
      enum:     { values: Object.values(RECORD_TYPES), message: 'Invalid record type' },
      required: [true, 'Record type is required'],
    },
    title: {
      type:      String,
      required:  [true, 'Record title is required'],
      trim:      true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type:      String,
      trim:      true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    // In Phase 2 we store a URL string; Phase 4+ will integrate S3/GCS
    fileUrl: {
      type:  String,
      trim:  true,
    },
    date: {
      type:    Date,
      default: Date.now,
    },
    tags: [{ type: String, trim: true, lowercase: true }],
    isVisible: {
      type:    Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: '__v',
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
healthRecordSchema.index({ patientId: 1, date: -1 });
healthRecordSchema.index({ hospitalId: 1, type: 1 });
healthRecordSchema.index({ patientId: 1, type: 1 });

const HealthRecord = mongoose.model('HealthRecord', healthRecordSchema);
module.exports = { HealthRecord, RECORD_TYPES };
