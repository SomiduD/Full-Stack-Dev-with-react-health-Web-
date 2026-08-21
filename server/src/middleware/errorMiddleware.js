// server/src/middleware/errorMiddleware.js

/**
 * 404 Not Found handler.
 * Mount AFTER all valid routes so only unmatched requests reach it.
 */
const notFound = (req, res, next) => {
  const err = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  err.statusCode = 404;
  next(err);
};

/**
 * Global error handler.
 * Normalises Mongoose errors, JWT errors, optimistic-lock conflicts, and generic 500s
 * into a consistent JSON shape: { success, message, errors?, stack? }
 *
 * Must have 4 parameters so Express recognises it as an error handler.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || err.status || 500;
  let message    = err.message || 'Internal Server Error';
  let errors     = null;

  // ── Mongoose: invalid ObjectId ────────────────────────────────────────────
  if (err.name === 'CastError') {
    statusCode = 400;
    message    = `Invalid value for field "${err.path}": ${err.value}`;
  }

  // ── Mongoose: duplicate key ───────────────────────────────────────────────
  if (err.code === 11000) {
    statusCode  = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const value = err.keyValue?.[field];
    message     = `"${value}" is already taken for field: ${field}.`;
  }

  // ── Mongoose: schema validation ───────────────────────────────────────────
  if (err.name === 'ValidationError') {
    statusCode = 422;
    errors     = Object.values(err.errors).map((e) => ({
      field:   e.path,
      message: e.message,
    }));
    message = 'Validation failed. Please check the highlighted fields.';
  }

  // ── Mongoose: optimistic locking conflict (VersionError) ─────────────────
  // This is the server-side signal that triggers the frontend resolution UI.
  if (err.name === 'VersionError') {
    statusCode = 409;
    message    = 'CONFLICT: This record was modified by another request simultaneously. Please refresh and reapply your changes.';
  }

  // ── JWT errors ────────────────────────────────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message    = 'Invalid authentication token.';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message    = 'Authentication token has expired. Please refresh your session.';
  }

  // ── Development: log full stack ───────────────────────────────────────────
  if (process.env.NODE_ENV === 'development') {
    console.error(`\n[ERROR] ${statusCode} — ${message}`);
    if (statusCode >= 500) console.error(err.stack);
  }

  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors                               && { errors }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = { notFound, errorHandler };
