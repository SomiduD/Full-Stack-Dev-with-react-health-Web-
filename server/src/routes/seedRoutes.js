// server/src/routes/seedRoutes.js
// ONE-TIME seed endpoint — protected by SEED_SECRET env var
// DELETE THIS FILE after seeding production!
const express  = require('express');
const bcrypt   = require('bcryptjs');
const mongoose = require('mongoose');
const router   = express.Router();

const Hospital    = require('../models/Hospital');
const { User, ROLES } = require('../models/User');

/**
 * POST /api/seed/run?secret=YOUR_SEED_SECRET
 * Seeds the database that this server is currently connected to.
 * Returns a report of what was created/skipped.
 */
router.post('/run', async (req, res) => {
  // Guard: require a secret query param to prevent public access
  const secret = process.env.SEED_SECRET || 'hcp-seed-2026';
  if (req.query.secret !== secret) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  const report = [];
  const dbName = mongoose.connection.db?.databaseName || 'unknown';
  report.push(`Connected DB: ${dbName}`);

  try {
    // ── Hospital ─────────────────────────────────────────────────────────────
    let hospital = await Hospital.findOne({ code: 'NWL01' });
    if (!hospital) {
      hospital = await Hospital.create({
        name:         'Nawaloka General Hospital',
        code:         'NWL01',
        contactEmail: 'info@nawaloka-hospital.lk',
        contactPhone: '+94-11-254-4444',
        address: { street: '23 Deshamanya H K Dharmadasa Mawatha', city: 'Colombo', state: 'Western Province', postalCode: '00200', country: 'Sri Lanka' },
        settings: { maxBedsICU: 35, maxBedsGeneral: 250, maxBedsEmergency: 50, emergencyServices: true, telemedicineEnabled: true, timezone: 'Asia/Colombo' },
        isActive: true,
      });
      report.push('✅ Hospital created');
    } else {
      report.push('⏩ Hospital exists');
    }

    // ── Helper ───────────────────────────────────────────────────────────────
    async function upsertUser(data) {
      const existing = await User.findOne({ email: data.email }).select('+passwordHash');
      const hash = await bcrypt.hash(data.password, 12);
      if (existing) {
        // Force-reset password and ensure isActive + verificationStatus
        await User.collection.updateOne(
          { email: data.email },
          { $set: { passwordHash: hash, isActive: true, verificationStatus: 'approved', updatedAt: new Date() } }
        );
        report.push(`🔄 Reset password: ${data.email}`);
        return;
      }
      await User.collection.insertOne({
        email: data.email, passwordHash: hash, role: data.role,
        hospitalId: data.hospitalId || null,
        profile: data.profile,
        isActive: true, isEmailVerified: false,
        verificationStatus: 'approved',
        refreshTokens: [], createdAt: new Date(), updatedAt: new Date(), __v: 0,
      });
      report.push(`✅ Created: ${data.email}`);
    }

    const hId = hospital._id;

    await upsertUser({ email: 'superadmin@healthcare.lk',    password: 'Admin@1234',   role: ROLES.SUPER_ADMIN,    hospitalId: null, profile: { firstName: 'Samidu',  lastName: 'Karunaratne', gender: 'male', phone: '+94-77-100-0001' } });
    await upsertUser({ email: 'admin@nawaloka.lk',            password: 'Admin@1234',   role: ROLES.HOSPITAL_ADMIN, hospitalId: hId,  profile: { firstName: 'Nimal',   lastName: 'Jayasinghe',  gender: 'male', phone: '+94-77-100-0002' } });
    await upsertUser({ email: 'dr.dissanayake@nawaloka.lk',   password: 'Doctor@1234',  role: ROLES.DOCTOR,         hospitalId: hId,  profile: { firstName: 'Kasun',   lastName: 'Dissanayake', gender: 'male', phone: '+94-77-200-0001', specialization: 'Cardiology',      department: 'Cardiology & Cardiac Surgery', licenseNumber: 'SLMC-2015-0421', yearsExperience: 12 } });
    await upsertUser({ email: 'dr.perera@nawaloka.lk',        password: 'Doctor@1234',  role: ROLES.DOCTOR,         hospitalId: hId,  profile: { firstName: 'Amali',   lastName: 'Perera',      gender: 'female', phone: '+94-77-200-0002', specialization: 'Paediatrics',     department: 'Paediatric Medicine',          licenseNumber: 'SLMC-2018-0887', yearsExperience: 7  } });
    await upsertUser({ email: 'dr.fernando@nawaloka.lk',      password: 'Doctor@1234',  role: ROLES.DOCTOR,         hospitalId: hId,  profile: { firstName: 'Ruwan',   lastName: 'Fernando',    gender: 'male', phone: '+94-77-200-0003', specialization: 'General Medicine', department: 'Internal Medicine',           licenseNumber: 'SLMC-2012-0334', yearsExperience: 15 } });
    await upsertUser({ email: 'sunil.kumara@gmail.com',       password: 'Patient@1234', role: ROLES.PATIENT,        hospitalId: hId,  profile: { firstName: 'Sunil',   lastName: 'Kumara',  gender: 'male',   phone: '+94-71-300-0001', bloodGroup: 'B+', allergies: ['Penicillin','Sulfa drugs'], dateOfBirth: new Date('1985-04-12'), emergencyContact: { name: 'Kamala Kumara',       phone: '+94-71-300-0002', relation: 'Spouse'  } } });
    await upsertUser({ email: 'malini.silva@gmail.com',       password: 'Patient@1234', role: ROLES.PATIENT,        hospitalId: hId,  profile: { firstName: 'Malini',  lastName: 'Silva',   gender: 'female', phone: '+94-71-300-0003', bloodGroup: 'O+', allergies: [],                           dateOfBirth: new Date('1992-09-28'), emergencyContact: { name: 'Rohana Silva',        phone: '+94-71-300-0004', relation: 'Husband' } } });
    await upsertUser({ email: 'chaminda.wickramasinghe@gmail.com', password: 'Patient@1234', role: ROLES.PATIENT,   hospitalId: hId,  profile: { firstName: 'Chaminda',lastName: 'Wickramasinghe', gender: 'male', phone: '+94-71-300-0005', bloodGroup: 'A-', allergies: ['Aspirin'],                  dateOfBirth: new Date('1978-01-05'), emergencyContact: { name: 'Dilrukshi Wickramasinghe', phone: '+94-71-300-0006', relation: 'Wife' } } });

    return res.json({ success: true, dbName, report });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message, report });
  }
});

module.exports = router;
