// server/src/controllers/authController.js
const { validationResult } = require('express-validator');
const authService = require('../services/authService');
const { User } = require('../models/User');

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Extract express-validator errors and respond 422 if any exist */
const handleValidation = (req, res) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    res.status(422).json({
      success: false,
      message: 'Validation failed. Please check the highlighted fields.',
      errors:  result.array().map((e) => ({ field: e.path, message: e.msg })),
    });
    return true; // Signals that a response was already sent
  }
  return false;
};

// ─── Controllers ─────────────────────────────────────────────────────────────

/**
 * @desc    Register a new user (patient or doctor)
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    if (handleValidation(req, res)) return;
    const result = await authService.registerUser(req.body);
    return res.status(201).json({
      success: true,
      message: 'Registration successful. Welcome to the platform!',
      data:    result,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Authenticate user and issue tokens
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    if (handleValidation(req, res)) return;
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password);
    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      data:    result,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Refresh access token using a valid refresh token
 * @route   POST /api/auth/refresh
 * @access  Public
 */
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;
    const result = await authService.refreshAccessToken(token);
    return res.status(200).json({
      success: true,
      message: 'Token refreshed successfully.',
      data:    result,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Logout and invalidate the current refresh token
 * @route   POST /api/auth/logout
 * @access  Protected
 */
const logout = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;
    await authService.logoutUser(req.user.id, token);
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully.',
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get the currently authenticated user's full profile
 * @route   GET /api/auth/me
 * @access  Protected
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('hospitalId', 'name code address contactEmail settings isActive');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.status(200).json({
      success: true,
      data: {
        id:              user._id,
        email:           user.email,
        role:            user.role,
        hospital:        user.hospitalId,   // Populated hospital document
        profile:         user.profile,
        fullName:        user.fullName,
        isEmailVerified: user.isEmailVerified,
        lastLoginAt:     user.lastLoginAt,
        createdAt:       user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, refreshToken, logout, getMe };
