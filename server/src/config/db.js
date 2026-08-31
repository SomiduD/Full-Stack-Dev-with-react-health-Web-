const mongoose = require('mongoose');

let retryCount = 0;
const MAX_RETRIES = 3;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 8000, // 8s timeout — fail fast
      connectTimeoutMS:         10000,
    });
    retryCount = 0;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    retryCount++;
    console.error(`❌ MongoDB connection attempt ${retryCount} failed: ${error.message}`);

    if (error.message.includes('whitelist') || error.message.includes('IP')) {
      console.error('');
      console.error('═══════════════════════════════════════════════════════════');
      console.error('  🔒  ATLAS IP WHITELIST ISSUE — FIX REQUIRED:');
      console.error('  1. Go to https://cloud.mongodb.com');
      console.error('  2. Security → Network Access → Add IP Address');
      console.error('  3. Choose "Allow Access from Anywhere" (0.0.0.0/0)');
      console.error('  4. Save and restart the server');
      console.error('═══════════════════════════════════════════════════════════');
      console.error('');
    }

    // In test mode, never crash — let tests handle the failure
    if (process.env.NODE_ENV === 'test') return;

    // In development mode: keep the server alive so the UI can still load
    // and so we can debug. Retry up to MAX_RETRIES times with a 5s delay.
    if (retryCount < MAX_RETRIES) {
      console.log(`⏳ Retrying MongoDB connection in 5 seconds... (${retryCount}/${MAX_RETRIES})`);
      setTimeout(connectDB, 5000);
    } else {
      console.error(`🛑 MongoDB connection failed after ${MAX_RETRIES} attempts.`);
      console.error('   Server will continue running but DB operations will fail.');
      // Don't call process.exit() — keep the Express server alive
      // so health checks and static routes still work for debugging.
    }
  }
};

/** Returns true if Mongoose is currently connected */
const isDBConnected = () => mongoose.connection.readyState === 1;

module.exports = connectDB;
module.exports.isDBConnected = isDBConnected;