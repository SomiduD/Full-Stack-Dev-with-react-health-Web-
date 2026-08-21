// server/src/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/** Canonical role values — export for use across the codebase */
const ROLES = Object.freeze({
  PATIENT:        'patient',
  DOCTOR:         'doctor',
  HOSPITAL_ADMIN: 'hospital_admin',
  SUPER_ADMIN:    'super_admin',
});

// ─── Profile sub-document ────────────────────────────────────────────────────
const profileSchema = new mongoose.Schema(
  {
    firstName: { type: String, trim: true, required: [true, 'First name is required'] },
    lastName:  { type: String, trim: true, required: [true, 'Last name is required'] },
    dateOfBirth: { type: Date },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer_not_to_say'],
    },
    phone:  { type: String, trim: true },
    avatar: { type: String, default: '' },

    // ── Doctor-specific ──────────────────────────────────────────────────────
    specialization: { type: String, trim: true },
    licenseNumber:  { type: String, trim: true },
    department:     { type: String, trim: true },
    yearsExperience: { type: Number, min: 0 },

    // ── Patient-specific ─────────────────────────────────────────────────────
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', ''],
      default: '',
    },
    allergies: [{ type: String, trim: true }],
    emergencyContact: {
      name:     { type: String, trim: true },
      phone:    { type: String, trim: true },
      relation: { type: String, trim: true },
    },
  },
  { _id: false }
);

// ─── User schema ─────────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
      select: false, // Excluded from all queries by default — must be explicit
    },
    role: {
      type: String,
      enum: { values: Object.values(ROLES), message: 'Invalid role: {VALUE}' },
      required: [true, 'Role is required'],
      default: ROLES.PATIENT,
    },
    // null for super_admin; required ref to Hospital for all other roles
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      default: null,
    },
    profile: {
      type: profileSchema,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    // Rotating refresh token pool — max 5 concurrent sessions
    refreshTokens: {
      type: [String],
      default: [],
      select: false,
    },
    lastLoginAt: { type: Date },
    passwordChangedAt: { type: Date, select: false },
  },
  {
    timestamps: true,
    versionKey: '__v', // Explicit — Mongoose optimistic locking via __v field
  }
);

// ─── Indexes ─────────────────────────────────────────────────────────────────// Indexes for performance (email already indexed via unique:true on field)
userSchema.index({ hospitalId: 1, role: 1 });
userSchema.index({ role: 1 });

// ─── Pre-save: hash password only when modified ───────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();

  const salt = await bcrypt.genSalt(12);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);

  // Mark password change time (subtract 1s so JWT iat comparison works correctly)
  if (!this.isNew) {
    this.passwordChangedAt = Date.now() - 1000;
  }

  next();
});

// ─── Instance methods ─────────────────────────────────────────────────────────

/** Compare a plain-text candidate against the stored bcrypt hash */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

/**
 * Returns true if password was changed AFTER the JWT was issued.
 * Used in protect middleware as a security check.
 */
userSchema.methods.changedPasswordAfter = function (jwtIssuedAt) {
  if (this.passwordChangedAt) {
    const changedAt = Math.floor(this.passwordChangedAt.getTime() / 1000);
    return jwtIssuedAt < changedAt;
  }
  return false;
};

// ─── Virtuals ────────────────────────────────────────────────────────────────
userSchema.virtual('fullName').get(function () {
  if (this.profile) {
    return `${this.profile.firstName} ${this.profile.lastName}`.trim();
  }
  return '';
});

userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

const User = mongoose.model('User', userSchema);
module.exports = { User, ROLES };
