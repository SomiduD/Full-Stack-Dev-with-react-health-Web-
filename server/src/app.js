// server/src/app.js
require('dotenv').config();

const http        = require('http');
const express     = require('express');
const cors        = require('cors');
const helmet      = require('helmet');
const { Server }  = require('socket.io');
const connectDB   = require('./config/db');
const authRoutes  = require('./routes/authRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// ─── Database ─────────────────────────────────────────────────────────────────
connectDB();

// ─── Express app ──────────────────────────────────────────────────────────────
const app    = express();
const server = http.createServer(app);

// ─── Socket.io ───────────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin:      process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    methods:     ['GET', 'POST'],
    credentials: true,
  },
});

// Expose io on the app instance so controllers/services can emit events
app.set('io', io);

/**
 * Socket.io — Auth middleware (Phase 2 will add full JWT verification here)
 * Currently allows connection with any token so the client can establish a socket.
 */
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) {
    return next(new Error('Socket authentication error: token required'));
  }
  socket.authToken = token;
  next();
});

io.on('connection', (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  /**
   * join_hospital_room — client sends this immediately after connecting.
   * All subsequent hospital-scoped broadcasts (e.g. triage updates, schedule changes)
   * will be emitted to this room.
   */
  socket.on('join_hospital_room', (hospitalId) => {
    if (!hospitalId) return;
    socket.join(`hospital:${hospitalId}`);
    console.log(`   ↳ ${socket.id} joined room hospital:${hospitalId}`);
  });

  /**
   * join_doctor_room — individual doctor room for real-time queue notifications
   */
  socket.on('join_doctor_room', (doctorId) => {
    if (!doctorId) return;
    socket.join(`doctor:${doctorId}`);
    console.log(`   ↳ ${socket.id} joined room doctor:${doctorId}`);
  });

  socket.on('disconnect', (reason) => {
    console.log(`🔌 Socket disconnected: ${socket.id} (${reason})`);
  });

  socket.on('error', (err) => {
    console.error(`Socket error [${socket.id}]:`, err.message);
  });
});

// ─── Express Middleware ───────────────────────────────────────────────────────
app.use(
  helmet({
    crossOriginEmbedderPolicy: false, // Required for Socket.io to work correctly
  })
);

app.use(
  cors({
    origin:      process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true,
    methods:     ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) =>
  res.status(200).json({
    success:     true,
    message:     'Healthcare Platform API is operational',
    timestamp:   new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version:     '1.0.0',
  })
);

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
// Phase 2+: app.use('/api/appointments', appointmentRoutes);
// Phase 3+: app.use('/api/triage',       triageRoutes);
// Phase 4+: app.use('/api/hospitals',    hospitalRoutes);

// ─── Error Handling ───────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT, 10) || 5000;

server.listen(PORT, () => {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🚀  Server running in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`🌐  REST API  : http://localhost:${PORT}/api/health`);
  console.log(`🔌  Socket.io : ws://localhost:${PORT}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
});

// ─── Graceful Shutdown ────────────────────────────────────────────────────────
const shutdown = (signal) => {
  console.log(`\n${signal} received — shutting down gracefully...`);
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
  // Force exit after 10 s if connections don't drain
  setTimeout(() => process.exit(1), 10_000).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  console.error('💥 Unhandled Promise Rejection:', reason);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err);
  process.exit(1);
});

module.exports = { app, server, io };
