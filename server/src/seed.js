// server/src/seed.js
/**
 * Seed script — idempotent.
 * Creates:
 *   1. DEMO hospital (code: DEMO)
 *   2. A super_admin user  (admin@demo.com / Admin@12345)
 *   3. A sample doctor     (doctor@demo.com / Doctor@12345)
 *   4. A sample patient    (patient@demo.com / Patient@12345)
 *
 * Safe to re-run — uses findOneAndUpdate with upsert so nothing is duplicated.
 *
 * Usage:
 *   cd server
 *   node src/seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const Hospital = require('./models/Hospital');
const { User, ROLES } = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/healthcare_platform';

// Build a user bypassing the pre-save hook (hash is applied manually)
async function createUser(data) {
  const existing = await User.findOne({ email: data.email });
  if (existing) return null;
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(data.password, salt);
  return User.collection.insertOne({
    ...data,
    passwordHash,
    isActive:         true,
    isEmailVerified:  false,
    refreshTokens:    [],
    createdAt:        new Date(),
    updatedAt:        new Date(),
  });
}

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB\n');

  // ── 1. Hospital ──────────────────────────────────────────────────────────────
  const hospital = await Hospital.findOneAndUpdate(
    { code: 'DEMO' },
    {
      $setOnInsert: {
        name:         'Demo General Hospital',
        code:         'DEMO',
        contactEmail: 'admin@demo-hospital.com',
        contactPhone: '+91-9000000000',
        address: {
          street:     '1 Healthcare Lane',
          city:       'Bengaluru',
          state:      'Karnataka',
          postalCode: '560001',
          country:    'India',
        },
        settings: {
          maxBedsICU:          20,
          maxBedsGeneral:      100,
          maxBedsEmergency:    30,
          emergencyServices:   true,
          telemedicineEnabled: true,
          timezone:            'Asia/Kolkata',
        },
        isActive: true,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log(`🏥 Hospital: "${hospital.name}" (code: ${hospital.code})`);

  // ── 2. Super Admin ───────────────────────────────────────────────────────────
  const adminResult = await createUser({
    email:      'admin@demo.com',
    password:   'Admin@12345',
    role:       ROLES.SUPER_ADMIN,
    hospitalId: null,
    profile: { firstName: 'Super', lastName: 'Admin', gender: 'prefer_not_to_say' },
  });
  console.log(adminResult ? '👑 Super Admin: admin@demo.com / Admin@12345' : '👑 Super Admin already exists (skipped)');

  // ── 3. Doctor ────────────────────────────────────────────────────────────────
  const doctorResult = await createUser({
    email:      'doctor@demo.com',
    password:   'Doctor@12345',
    role:       ROLES.DOCTOR,
    hospitalId: hospital._id,
    profile: {
      firstName: 'Priya', lastName: 'Sharma', gender: 'female',
      specialization: 'General Medicine', department: 'Internal Medicine',
      licenseNumber: 'MCI-2020-00123', yearsExperience: 8, phone: '+91-9000000001',
    },
  });
  console.log(doctorResult ? '🩺 Doctor:     doctor@demo.com  / Doctor@12345' : '🩺 Doctor already exists (skipped)');

  // ── 4. Patient ───────────────────────────────────────────────────────────────
  const patientResult = await createUser({
    email:      'patient@demo.com',
    password:   'Patient@12345',
    role:       ROLES.PATIENT,
    hospitalId: hospital._id,
    profile: {
      firstName: 'Rahul', lastName: 'Mehta', gender: 'male',
      bloodGroup: 'O+', phone: '+91-9000000002',
      allergies: ['Penicillin'],
      emergencyContact: { name: 'Anita Mehta', phone: '+91-9000000003', relation: 'Spouse' },
    },
  });
  console.log(patientResult ? '🧑‍⚕️ Patient:    patient@demo.com / Patient@12345' : '🧑‍⚕️ Patient already exists (skipped)');

  console.log('\n🎉 Seed complete!\n');
  console.log('─────────────────────────────────────────────────');
  console.log('Hospital code for registration: DEMO');
  console.log('─────────────────────────────────────────────────');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
