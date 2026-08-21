// server/src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const { User } = require('../models/User');

/**
 * protect — JWT verification middleware.
 *
 * Verifies the Bearer token, checks the user still exists and is active,
 * checks the password hasn't changed since the token was issued,
 * then attaches a lean `req.user` object for downstream use.
 */
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No authentication token provided.',
      });
    }

    const token = authHeader.split(' ')[1];

    // ── Verify signature & expiry ─────────────────────────────────────────
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtErr) {
      const message =
        jwtErr.name === 'TokenExpiredError'
          ? 'Your session has expired. Please log in again.'
          : 'Invalid token. Please log in again.';
      return res.status(401).json({ success: false, message });
    }

    // ── User still exists? ────────────────────────────────────────────────
    const user = await User.findById(decoded.id).select('+passwordChangedAt');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The account associated with this token no longer exists.',
      });
    }

    // ── Account active? ───────────────────────────────────────────────────
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Contact your administrator.',
      });
    }

    // ── Password changed after token issued? ──────────────────────────────
    if (user.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({
        success: false,
        message: 'Password was recently changed. Please log in again to continue.',
      });
    }

    // ── Attach lean user context ──────────────────────────────────────────
    req.user = {
      id:         user._id.toString(),
      role:       user.role,
      hospitalId: user.hospitalId ? user.hospitalId.toString() : null,
    };

    next();
  } catch (err) {
    next(err);
  }
};

/**
 * authorize(...roles) — role-based access control factory.
 *
 * Must be used AFTER `protect`.
 *
 * Usage:
 *   router.get('/admin-only', protect, authorize('hospital_admin', 'super_admin'), handler)
 */
const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: `Access denied. Your role ("${req.user.role}") is not permitted to access this resource.`,
    });
  }
  next();
};

/**
 * tenantGuard — multi-tenant isolation middleware.
 *
 * Ensures a user can only access resources belonging to their own hospital.
 * super_admin is exempt (cross-hospital access is their privilege).
 *
 * Checks: req.params.hospitalId || req.body.hospitalId || req.query.hospitalId
 *
 * Must be used AFTER `protect`.
 */
const tenantGuard = (req, res, next) => {
  // Super admin bypasses tenant isolation
  if (req.user.role === 'super_admin') return next();

  const requested =
    req.params.hospitalId ||
    req.body.hospitalId   ||
    req.query.hospitalId;

  // No hospital context in the request — let it pass (route handler may validate separately)
  if (!requested) return next();

  if (requested !== req.user.hospitalId) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only access resources within your own hospital.',
    });
  }

  next();
};

module.exports = { protect, authorize, tenantGuard };
