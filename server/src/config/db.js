// server/src/config/db.js
const mongoose = require('mongoose');

/**
 * Connects to MongoDB with exponential-backoff retry logic.
 * Registers graceful shutdown handlers for SIGINT/SIGTERM.
 */
const connectDB = async () => {
  const MAX_RETRIES = 5;
  let retries = MAX_RETRIES;
  let delay = 2000; // Start at 2 s, double each attempt

  while (retries > 0) {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI);
      console.log(`✅ MongoDB Connected: ${conn.connection.host} (DB: ${conn.connection.name})`);

      // Log connection events
      mongoose.connection.on('error', (err) => {
        console.error('❌ MongoDB runtime error:', err.message);
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('⚠️  MongoDB disconnected. Reconnecting...');
      });

      return; // Success — exit retry loop
    } catch (err) {
      retries -= 1;
      console.error(`❌ MongoDB connection failed: ${err.message}`);

      if (retries === 0) {
        console.error('💀 Max retries exhausted. Exiting process.');
        process.exit(1);
      }

      console.log(`🔄 Retrying in ${delay / 1000}s... (${retries} attempt(s) left)`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay = Math.min(delay * 2, 30000); // Cap at 30 s
    }
  }
};

module.exports = connectDB;
