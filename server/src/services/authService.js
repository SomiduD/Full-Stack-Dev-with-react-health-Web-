// server/src/services/authService.js
const jwt = require('jsonwebtoken');
const { User, ROLES } = require('../models/User');
const Hospital = require('../models/Hospital');

// ─── Token generators ─────────────────────────────────────────────────────────

/**
 * Issues a short-lived JWT access token (default: 15 min).
 * Payload carries only what controllers/middleware need — no sensitive data.
 */
const generateAccessToken = (userId, role, hospitalId) =>
  jwt.sign(
    {
      id:         userId.toString(),
      role,
      hospitalId: hospitalId ? hospitalId.toString() : null,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );

/**
 * Issues a long-lived refresh token (default: 7 days).
 * Stored server-side in User.refreshTokens for rotation and revocation.
 */
const generateRefreshToken = (userId) =>
  jwt.sign(
    { id: userId.toString() },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );

// ─── Service functions ────────────────────────────────────────────────────────

/**
 * Registers a new user (patient or doctor only — admin roles are invite-only).
 *
 * @param {Object} data
 * @param {string} data.email
 * @param {string} data.password
 * @param {string} data.role         - 'patient' | 'doctor'
 * @param {string} [data.hospitalCode] - Required for non-super_admin
 * @param {Object} data.profile      - { firstName, lastName, ... }
 */
const registerUser = async ({ email, password, role, hospitalCode, profile }) => {
  // ── Block privileged self-registration ──────────────────────────────────────
  if (role === ROLES.SUPER_ADMIN || role === ROLES.HOSPITAL_ADMIN) {
    const err = new Error('This role cannot self-register. Contact your system administrator.');
    err.statusCode = 403;
    throw err;
  }

  // ── Duplicate check ─────────────────────────────────────────────────────────
  const existing = await User.findOne({ email });
  if (existing) {
    const err = new Error('An account with this email already exists.');
    err.statusCode = 409;
    throw err;
  }

  // ── Hospital resolution ─────────────────────────────────────────────────────
  let hospitalId = null;

  if (role !== ROLES.SUPER_ADMIN) {
    if (!hospitalCode) {
      const err = new Error('A hospital code is required for patient and doctor registration.');
      err.statusCode = 400;
      throw err;
    }

    const hospital = await Hospital.findOne({
      code:     hospitalCode.toUpperCase().trim(),
      isActive: true,
    });

    if (!hospital) {
      const err = new Error(`No active hospital found with code "${hospitalCode}". Please check the code and try again.`);
      err.statusCode = 404;
      throw err;
    }

    hospitalId = hospital._id;
  }

  // ── Create user (password hashed by pre-save hook) ──────────────────────────
  const user = await User.create({
    email,
    passwordHash: password,
    role:         role || ROLES.PATIENT,
    hospitalId,
    profile,
  });

  // ── Issue tokens ─────────────────────────────────────────────────────────────
  const accessToken  = generateAccessToken(user._id, user.role, user.hospitalId);
  const refreshToken = generateRefreshToken(user._id);

  await User.findByIdAndUpdate(user._id, {
    $push:        { refreshTokens: refreshToken },
    lastLoginAt:  new Date(),
  });

  return {
    accessToken,
    refreshToken,
    user: _sanitize(user),
  };
};

/**
 * Authenticates a user with email/password credentials.
 *
 * @param {string} email
 * @param {string} password
 */
const loginUser = async (email, password) => {
  // Explicitly select the fields that are excluded by default
  const user = await User.findOne({ email }).select('+passwordHash +refreshTokens +passwordChangedAt');

  if (!user || !(await user.comparePassword(password))) {
    const err = new Error('Invalid email or password.');
    err.statusCode = 401;
    throw err;
  }

  if (!user.isActive) {
    const err = new Error('Your account has been deactivated. Contact your administrator.');
    err.statusCode = 403;
    throw err;
  }

  const accessToken  = generateAccessToken(user._id, user.role, user.hospitalId);
  const refreshToken = generateRefreshToken(user._id);

  // Keep only the last 5 sessions (sliding window — prevents unbounded growth)
  const updatedTokens = [...(user.refreshTokens || []), refreshToken].slice(-5);

  await User.findByIdAndUpdate(user._id, {
    refreshTokens: updatedTokens,
    lastLoginAt:   new Date(),
  });

  return {
    accessToken,
    refreshToken,
    user: _sanitize(user),
  };
};

/**
 * Issues a new access token via a valid refresh token (token rotation).
 *
 * @param {string} refreshToken
 */
const refreshAccessToken = async (refreshToken) => {
  if (!refreshToken) {
    const err = new Error('Refresh token is required.');
    err.statusCode = 400;
    throw err;
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch (e) {
    const err = new Error('Invalid or expired refresh token. Please log in again.');
    err.statusCode = 401;
    throw err;
  }

  const user = await User.findById(decoded.id).select('+refreshTokens');

  if (!user || !user.refreshTokens.includes(refreshToken)) {
    // Possible token reuse attack — wipe all sessions
    if (user) {
      await User.findByIdAndUpdate(decoded.id, { refreshTokens: [] });
    }
    const err = new Error('Refresh token not recognized. All sessions have been invalidated for security. Please log in again.');
    err.statusCode = 401;
    throw err;
  }

  // Rotate: remove old, issue new
  const newRefreshToken = generateRefreshToken(user._id);
  const newAccessToken  = generateAccessToken(user._id, user.role, user.hospitalId);

  const updatedTokens = user.refreshTokens.filter((t) => t !== refreshToken);
  updatedTokens.push(newRefreshToken);
  await User.findByIdAndUpdate(user._id, { refreshTokens: updatedTokens });

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

/**
 * Logs out a user by removing the specific refresh token from their session pool.
 *
 * @param {string} userId
 * @param {string} refreshToken
 */
const logoutUser = async (userId, refreshToken) => {
  if (refreshToken) {
    await User.findByIdAndUpdate(userId, {
      $pull: { refreshTokens: refreshToken },
    });
  }
};

// ─── Internal helper ──────────────────────────────────────────────────────────

/** Strips sensitive fields before returning user data to the controller */
const _sanitize = (user) => ({
  id:              user._id,
  email:           user.email,
  role:            user.role,
  hospitalId:      user.hospitalId,
  profile:         user.profile,
  isEmailVerified: user.isEmailVerified,
  lastLoginAt:     user.lastLoginAt,
  createdAt:       user.createdAt,
});

module.exports = {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
};
