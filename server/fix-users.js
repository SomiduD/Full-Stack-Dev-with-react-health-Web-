require('dotenv').config();
const mongoose = require('mongoose');
const { User } = require('./src/models/User');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/healthcare').then(async () => {
  const result = await User.updateMany(
    { verificationStatus: { $exists: false } },
    { $set: { verificationStatus: 'approved', isActive: true } }
  );
  console.log('Fixed', result.modifiedCount, 'users with missing verificationStatus.');

  const users = await User.find({}).select('email role verificationStatus isActive').lean();
  users.forEach(u => {
    const status = u.isActive ? '✅ active' : '❌ inactive';
    console.log(u.role.padEnd(16), u.email.padEnd(45), status, u.verificationStatus);
  });
  await mongoose.disconnect();
  process.exit(0);
}).catch(e => { console.log('DB error:', e.message); process.exit(1); });
