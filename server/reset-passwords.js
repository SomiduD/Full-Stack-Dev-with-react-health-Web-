// Fix patient passwords in the CORRECT database: healthcare_platform
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Use the exact URI from .env
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/healthcare_platform';
console.log('Connecting to:', MONGO_URI);

mongoose.connect(MONGO_URI).then(async () => {
  const db = mongoose.connection.db;
  console.log('Connected to DB:', db.databaseName);
  const col = db.collection('users');

  // List all users first
  const allUsers = await col.find({}).project({ email: 1, role: 1, isActive: 1 }).toArray();
  console.log('\nAll users in', db.databaseName, ':');
  allUsers.forEach(u => console.log(' -', u.role?.padEnd(16), u.email, u.isActive ? '✅' : '❌'));

  // Reset passwords
  const resets = [
    { email: 'sunil.kumara@gmail.com',           password: 'Patient@1234' },
    { email: 'malini.silva@gmail.com',            password: 'Patient@1234' },
    { email: 'chaminda.wickramasinghe@gmail.com', password: 'Patient@1234' },
    { email: 'patient@demo.com',                  password: 'Patient@1234' },
  ];

  console.log('\nResetting passwords...');
  for (const u of resets) {
    const hash = await bcrypt.hash(u.password, 12);
    const result = await col.updateOne({ email: u.email }, { $set: { passwordHash: hash, isActive: true, verificationStatus: 'approved' } });
    if (result.matchedCount > 0) {
      console.log('✅ Reset:', u.email);
    } else {
      console.log('⏩ Not found:', u.email);
    }
  }

  // Also fix admins/doctors/superadmin verificationStatus
  await col.updateMany(
    { verificationStatus: { $exists: false } },
    { $set: { verificationStatus: 'approved' } }
  );
  console.log('\n✅ Fixed verificationStatus for all users missing it.');

  // Verify
  const p = await col.findOne({ email: 'sunil.kumara@gmail.com' });
  if (p) {
    const ok = await bcrypt.compare('Patient@1234', p.passwordHash);
    console.log('\nFinal check (sunil.kumara / Patient@1234):', ok ? '✅ PASS' : '❌ FAIL');
  }

  await mongoose.disconnect();
  process.exit(0);
}).catch(e => { console.log('DB error:', e.message); process.exit(1); });
