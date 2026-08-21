// server/src/routes/authRoutes.js
const express  = require('express');
const { body } = require('express-validator');
const {
  register,
  login,
  refreshToken,
  logout,
  getMe,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// ─── Validation rule sets ─────────────────────────────────────────────────────

const registerRules = [
  body('email')
    .isEmail().withMessage('Must be a valid email address.')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter.')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter.')
    .matches(/\d/).withMessage('Password must contain at least one number.'),
  body('profile.firstName')
    .trim().notEmpty().withMessage('First name is required.'),
  body('profile.lastName')
    .trim().notEmpty().withMessage('Last name is required.'),
  body('role')
    .optional()
    .isIn(['patient', 'doctor'])
    .withMessage('Only "patient" or "doctor" roles can self-register.'),
  body('hospitalCode')
    .if(body('role').not().equals('super_admin'))
    .trim()
    .notEmpty().withMessage('Hospital code is required.')
    .isLength({ min: 3, max: 20 }).withMessage('Hospital code must be 3–20 characters.'),
];

const loginRules = [
  body('email')
    .isEmail().withMessage('Must be a valid email address.')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required.'),
];

// ─── Routes ───────────────────────────────────────────────────────────────────

/** POST /api/auth/register — Public self-registration (patient/doctor only) */
router.post('/register', registerRules, register);

/** POST /api/auth/login — Public credential authentication */
router.post('/login', loginRules, login);

/** POST /api/auth/refresh — Public refresh token rotation */
router.post('/refresh', refreshToken);

/** POST /api/auth/logout — Protected; invalidates the provided refresh token */
router.post('/logout', protect, logout);

/** GET /api/auth/me — Protected; returns the current user's full profile */
router.get('/me', protect, getMe);

module.exports = router;
