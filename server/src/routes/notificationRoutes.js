// server/src/routes/notificationRoutes.js
/**
 * Notification Routes — In-app notification feed per user.
 * GET  /api/notifications        — Get unread + recent notifications (auth)
 * PATCH /api/notifications/:id/read — Mark one notification as read
 * PATCH /api/notifications/read-all — Mark all as read
 * DELETE /api/notifications/:id  — Delete a notification
 */
const express   = require('express');
const mongoose  = require('mongoose');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();
router.use(protect);

// ── Inline schema (no separate model file needed for a simple feed) ────────────
const notificationSchema = new mongoose.Schema(
  {
    userId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: ['appointment_booked','appointment_confirmed','appointment_cancelled',
             'appointment_completed','ambulance_dispatched','health_record_added',
             'doctor_created','system'],
      required: true,
    },
    title:   { type: String, required: true, maxlength: 120 },
    message: { type: String, required: true, maxlength: 500 },
    link:    { type: String, default: '' },       // Frontend route to deep-link
    isRead:  { type: Boolean, default: false, index: true },
    meta:    { type: mongoose.Schema.Types.Mixed }, // Extra data (appointmentId, etc.)
  },
  { timestamps: true }
);
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.models.Notification
  || mongoose.model('Notification', notificationSchema);

// Export model so other modules can create notifications
module.exports.Notification = Notification;

// ── GET /api/notifications ─────────────────────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const skip  = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find({ userId: req.user.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments({ userId: req.user.id }),
      Notification.countDocuments({ userId: req.user.id, isRead: false }),
    ]);

    return res.status(200).json({
      success: true,
      data: { notifications, total, unreadCount, page, pages: Math.ceil(total / limit) },
    });
  } catch (err) { next(err); }
});

// ── PATCH /api/notifications/:id/read ─────────────────────────────────────────
router.patch('/:id/read', async (req, res, next) => {
  try {
    const n = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { isRead: true },
      { new: true }
    );
    if (!n) return res.status(404).json({ success: false, message: 'Notification not found.' });
    return res.status(200).json({ success: true, data: n });
  } catch (err) { next(err); }
});

// ── PATCH /api/notifications/read-all ─────────────────────────────────────────
router.patch('/read-all', async (req, res, next) => {
  try {
    const result = await Notification.updateMany(
      { userId: req.user.id, isRead: false },
      { isRead: true }
    );
    return res.status(200).json({
      success: true,
      message: `${result.modifiedCount} notification(s) marked as read.`,
    });
  } catch (err) { next(err); }
});

// ── DELETE /api/notifications/:id ─────────────────────────────────────────────
router.delete('/:id', async (req, res, next) => {
  try {
    const n = await Notification.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!n) return res.status(404).json({ success: false, message: 'Notification not found.' });
    return res.status(200).json({ success: true, message: 'Notification deleted.' });
  } catch (err) { next(err); }
});

module.exports = router;
module.exports.Notification = Notification;
