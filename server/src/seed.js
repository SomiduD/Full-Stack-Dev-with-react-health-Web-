// server/src/seed.js
/**
 * Seed script — idempotent.
 * Creates:
 *   1. Nawaloka General Hospital (code: NWL01)
 *   2. 1 super_admin  — Karunaratne, Samidu
 *   3. 1 hospital_admin — Jayasinghe, Nimal
 *   4. 3 doctors     — Dr. Dissanayake, Dr. Perera, Dr. Fernando
 *   5. 3 patients    — Kumara, Silva, Wickramasinghe
 *   6. Sample appointments
 *   7. Sample health records (lab, imaging, prescription, vaccination, discharge)
 *
 * Safe to re-run — skips existing emails.
 *
 * Usage:
 *   cd server && npm run seed
 */
require('dotenv').config();
const mongoose   = require('mongoose');
const bcrypt     = require('bcryptjs');
const Hospital   = require('./models/Hospital');
const { User, ROLES }           = require('./models/User');
const { Appointment }           = require('./models/Appointment');
const { HealthRecord }          = require('./models/HealthRecord');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/healthcare_platform';

async function hashPw(password) {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

async function createUser(data) {
  const existing = await User.findOne({ email: data.email });
  if (existing) {
    console.log(`   ⏩ Skipped (exists): ${data.email}`);
    return existing;
  }
  const passwordHash = await hashPw(data.password);
  const doc = await User.collection.insertOne({
    ...data,
    passwordHash,
    isActive:        true,
    isEmailVerified: false,
    refreshTokens:   [],
    createdAt:       new Date(),
    updatedAt:       new Date(),
    __v:             0,
  });
  const created = await User.findById(doc.insertedId);
  console.log(`   ✅ Created: ${data.email}`);
  return created;
}

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('\n✅ Connected to MongoDB\n');

  // ─────────────────────────────────────────────────────────────────────────
  // 1. HOSPITAL
  // ─────────────────────────────────────────────────────────────────────────
  console.log('🏥 Creating hospital...');
  const hospital = await Hospital.findOneAndUpdate(
    { code: 'NWL01' },
    {
      $setOnInsert: {
        name:         'Nawaloka General Hospital',
        code:         'NWL01',
        contactEmail: 'info@nawaloka-hospital.lk',
        contactPhone: '+94-11-254-4444',
        address: {
          street:     '23 Deshamanya H K Dharmadasa Mawatha',
          city:       'Colombo',
          state:      'Western Province',
          postalCode: '00200',
          country:    'Sri Lanka',
        },
        settings: {
          maxBedsICU:          35,
          maxBedsGeneral:      250,
          maxBedsEmergency:    50,
          emergencyServices:   true,
          telemedicineEnabled: true,
          timezone:            'Asia/Colombo',
        },
        isActive: true,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log(`   ✅ Hospital: "${hospital.name}" (code: ${hospital.code})\n`);

  // ─────────────────────────────────────────────────────────────────────────
  // 2. SUPER ADMIN
  // ─────────────────────────────────────────────────────────────────────────
  console.log('👑 Creating Super Admin...');
  const superAdmin = await createUser({
    email:      'superadmin@healthcare.lk',
    password:   'Admin@1234',
    role:       ROLES.SUPER_ADMIN,
    hospitalId: null,
    profile: {
      firstName: 'Samidu',
      lastName:  'Karunaratne',
      gender:    'male',
      phone:     '+94-77-100-0001',
    },
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 3. HOSPITAL ADMIN
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n🛠️  Creating Hospital Admin...');
  const admin = await createUser({
    email:      'admin@nawaloka.lk',
    password:   'Admin@1234',
    role:       ROLES.HOSPITAL_ADMIN,
    hospitalId: hospital._id,
    profile: {
      firstName: 'Nimal',
      lastName:  'Jayasinghe',
      gender:    'male',
      phone:     '+94-77-100-0002',
    },
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 4. DOCTORS
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n🩺 Creating Doctors...');
  const doctor1 = await createUser({
    email:      'dr.dissanayake@nawaloka.lk',
    password:   'Doctor@1234',
    role:       ROLES.DOCTOR,
    hospitalId: hospital._id,
    profile: {
      firstName:       'Kasun',
      lastName:        'Dissanayake',
      gender:          'male',
      specialization:  'Cardiology',
      department:      'Cardiology & Cardiac Surgery',
      licenseNumber:   'SLMC-2015-0421',
      yearsExperience: 12,
      phone:           '+94-77-200-0001',
    },
  });

  const doctor2 = await createUser({
    email:      'dr.perera@nawaloka.lk',
    password:   'Doctor@1234',
    role:       ROLES.DOCTOR,
    hospitalId: hospital._id,
    profile: {
      firstName:       'Amali',
      lastName:        'Perera',
      gender:          'female',
      specialization:  'Paediatrics',
      department:      'Paediatric Medicine',
      licenseNumber:   'SLMC-2018-0887',
      yearsExperience: 7,
      phone:           '+94-77-200-0002',
    },
  });

  const doctor3 = await createUser({
    email:      'dr.fernando@nawaloka.lk',
    password:   'Doctor@1234',
    role:       ROLES.DOCTOR,
    hospitalId: hospital._id,
    profile: {
      firstName:       'Ruwan',
      lastName:        'Fernando',
      gender:          'male',
      specialization:  'General Medicine',
      department:      'Internal Medicine',
      licenseNumber:   'SLMC-2012-0334',
      yearsExperience: 15,
      phone:           '+94-77-200-0003',
    },
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 5. PATIENTS
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n🧑 Creating Patients...');
  const patient1 = await createUser({
    email:      'sunil.kumara@gmail.com',
    password:   'Patient@1234',
    role:       ROLES.PATIENT,
    hospitalId: hospital._id,
    profile: {
      firstName:  'Sunil',
      lastName:   'Kumara',
      gender:     'male',
      bloodGroup: 'B+',
      phone:      '+94-71-300-0001',
      dateOfBirth: new Date('1985-04-12'),
      allergies:  ['Penicillin', 'Sulfa drugs'],
      emergencyContact: {
        name:     'Kamala Kumara',
        phone:    '+94-71-300-0002',
        relation: 'Spouse',
      },
    },
  });

  const patient2 = await createUser({
    email:      'malini.silva@gmail.com',
    password:   'Patient@1234',
    role:       ROLES.PATIENT,
    hospitalId: hospital._id,
    profile: {
      firstName:  'Malini',
      lastName:   'Silva',
      gender:     'female',
      bloodGroup: 'O+',
      phone:      '+94-71-300-0003',
      dateOfBirth: new Date('1992-09-28'),
      allergies:  [],
      emergencyContact: {
        name:     'Rohana Silva',
        phone:    '+94-71-300-0004',
        relation: 'Husband',
      },
    },
  });

  const patient3 = await createUser({
    email:      'chaminda.wickramasinghe@gmail.com',
    password:   'Patient@1234',
    role:       ROLES.PATIENT,
    hospitalId: hospital._id,
    profile: {
      firstName:  'Chaminda',
      lastName:   'Wickramasinghe',
      gender:     'male',
      bloodGroup: 'A-',
      phone:      '+94-71-300-0005',
      dateOfBirth: new Date('1978-01-05'),
      allergies:  ['Aspirin'],
      emergencyContact: {
        name:     'Dilrukshi Wickramasinghe',
        phone:    '+94-71-300-0006',
        relation: 'Wife',
      },
    },
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 6. APPOINTMENTS
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n📅 Creating Sample Appointments...');

  const today = new Date(); today.setUTCHours(0,0,0,0);
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);

  const appts = [
    {
      patientId: patient1._id, doctorId: doctor1._id,
      hospitalId: hospital._id, date: today,
      timeSlot: '09:00', reason: 'Chest pain and shortness of breath during physical activity',
      status: 'confirmed',
    },
    {
      patientId: patient2._id, doctorId: doctor2._id,
      hospitalId: hospital._id, date: today,
      timeSlot: '10:30', reason: 'Child fever and persistent cough — 3 days',
      status: 'pending',
    },
    {
      patientId: patient3._id, doctorId: doctor3._id,
      hospitalId: hospital._id, date: yesterday,
      timeSlot: '11:00', reason: 'Annual general medical check-up',
      status: 'completed',
      doctorNotes: 'BP slightly elevated at 140/90. Advised dietary changes and salt reduction. Follow-up in 4 weeks.',
    },
    {
      patientId: patient1._id, doctorId: doctor3._id,
      hospitalId: hospital._id, date: tomorrow,
      timeSlot: '14:00', reason: 'Follow-up for hypertension management',
      status: 'pending',
    },
    {
      patientId: patient2._id, doctorId: doctor1._id,
      hospitalId: hospital._id, date: tomorrow,
      timeSlot: '15:30', reason: 'ECG review and cardiology consultation',
      status: 'pending',
    },
  ];

  for (const appt of appts) {
    const exists = await Appointment.findOne({
      patientId: appt.patientId,
      doctorId:  appt.doctorId,
      date:      appt.date,
      timeSlot:  appt.timeSlot,
    });
    if (!exists) {
      await Appointment.create(appt);
      console.log(`   ✅ Appointment: ${appt.timeSlot} — ${appt.status}`);
    } else {
      console.log(`   ⏩ Skipped appointment (exists): ${appt.timeSlot}`);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 7. HEALTH RECORDS
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n📋 Creating Sample Health Records...');

  const threeMonthsAgo = new Date(); threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  const twoMonthsAgo  = new Date(); twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
  const oneMonthAgo   = new Date(); oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  const twoWeeksAgo   = new Date(); twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
  const oneWeekAgo    = new Date(); oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const records = [
    // Sunil Kumara — Cardiology records
    {
      patientId:  patient1._id,
      hospitalId: hospital._id,
      uploadedBy: doctor1._id,
      type:       'lab',
      title:      'Full Blood Count (FBC) — Routine',
      description:'WBC: 7.2 × 10⁹/L (Normal)\nRBC: 4.8 × 10¹²/L (Normal)\nHaemoglobin: 14.2 g/dL (Normal)\nPlatelets: 210 × 10⁹/L (Normal)\nHaematocrit: 42% (Normal)\n\nConclusion: All haematological parameters within normal limits.',
      date:       threeMonthsAgo,
      tags:       ['fbc', 'routine', 'blood', 'cardiology'],
      isVisible:  true,
    },
    {
      patientId:  patient1._id,
      hospitalId: hospital._id,
      uploadedBy: doctor1._id,
      type:       'lab',
      title:      'Lipid Profile — Cholesterol Panel',
      description:'Total Cholesterol: 218 mg/dL ⚠️ (Borderline High)\nLDL-C: 142 mg/dL ⚠️ (Above optimal)\nHDL-C: 48 mg/dL (Acceptable)\nTriglycerides: 168 mg/dL (Borderline)\nNon-HDL-C: 170 mg/dL\n\nRecommendation: Dietary modification, reduce saturated fat. Retest in 3 months. Statin therapy to be discussed if no improvement.',
      date:       twoMonthsAgo,
      tags:       ['lipid', 'cholesterol', 'cardiology', 'ldl'],
      isVisible:  true,
    },
    {
      patientId:  patient1._id,
      hospitalId: hospital._id,
      uploadedBy: doctor1._id,
      type:       'imaging',
      title:      'ECG — 12-Lead Electrocardiogram',
      description:'Rhythm: Normal Sinus Rhythm\nHeart Rate: 78 bpm\nPR Interval: 162 ms (Normal)\nQRS Duration: 88 ms (Normal)\nQTc: 410 ms (Normal)\nST Segment: No acute ST elevation or depression\nT Waves: Normal morphology\n\nConclusion: Normal ECG. No evidence of ischaemia or arrhythmia.',
      date:       oneMonthAgo,
      tags:       ['ecg', 'heart', 'cardiology', 'sinus-rhythm'],
      isVisible:  true,
    },
    {
      patientId:  patient1._id,
      hospitalId: hospital._id,
      uploadedBy: doctor1._id,
      type:       'prescription',
      title:      'Rx — Hypertension & Lipid Management',
      description:'1. Amlodipine 5mg — Once daily (morning)\n   ↳ For blood pressure management. Take with or without food.\n\n2. Atorvastatin 10mg — Once daily (night)\n   ↳ For cholesterol control. Avoid grapefruit juice.\n\n3. Aspirin 75mg — Once daily (with food)\n   ↳ Antiplatelet therapy. Stop if unusual bleeding occurs.\n\nDuration: 90 days\nFollow-up: 4 weeks\nNotes: Monitor BP daily. Reduce salt, oil and red meat. Daily 30-minute walk.',
      date:       oneMonthAgo,
      tags:       ['amlodipine', 'atorvastatin', 'aspirin', 'hypertension', 'cholesterol'],
      isVisible:  true,
    },
    {
      patientId:  patient1._id,
      hospitalId: hospital._id,
      uploadedBy: doctor1._id,
      type:       'vaccination',
      title:      'Influenza Vaccine — Annual',
      description:'Vaccine: Influvac Tetra (Quadrivalent Influenza Vaccine)\nBatch No: ITQ-2025-0044\nDose: 0.5 mL intramuscular (deltoid, left arm)\nManufacturer: Abbott\nExpiry: March 2026\nAdministered by: Dr. K. Dissanayake\n\nNext dose: 12 months (August 2026)\nSide effects reported: None',
      date:       twoWeeksAgo,
      tags:       ['flu', 'influenza', 'vaccine', 'annual'],
      isVisible:  true,
    },

    // Malini Silva — Paediatric records
    {
      patientId:  patient2._id,
      hospitalId: hospital._id,
      uploadedBy: doctor2._id,
      type:       'lab',
      title:      'Urine Full Report (UFR)',
      description:'Appearance: Clear, Yellow\npH: 6.0 (Normal)\nProtein: Negative\nGlucose: Negative\nKetones: Negative\nBilirubin: Negative\nBlood: Negative\nLeukocytes: Negative\nNitrites: Negative\nMicroscopy: No significant findings\n\nConclusion: Normal urinalysis. No evidence of urinary tract infection.',
      date:       twoMonthsAgo,
      tags:       ['urine', 'ufr', 'paediatric'],
      isVisible:  true,
    },
    {
      patientId:  patient2._id,
      hospitalId: hospital._id,
      uploadedBy: doctor2._id,
      type:       'prescription',
      title:      'Rx — Upper Respiratory Tract Infection',
      description:'1. Amoxicillin 500mg — Three times daily × 7 days\n   ↳ Take with food. Complete the full course.\n\n2. Paracetamol 500mg — As needed for fever/pain (max 4 times/day)\n   ↳ Maintain 6-hour gap between doses.\n\n3. Cetirizine 10mg — Once daily at night × 5 days\n   ↳ For nasal congestion and runny nose. May cause drowsiness.\n\n4. Saline nasal drops — 2 drops each nostril, 3 times daily\n\nDuration: 7 days\nReturn if: Fever persists beyond 3 days or breathing difficulty develops.',
      date:       oneWeekAgo,
      tags:       ['amoxicillin', 'paracetamol', 'urti', 'antibiotic'],
      isVisible:  true,
    },
    {
      patientId:  patient2._id,
      hospitalId: hospital._id,
      uploadedBy: doctor2._id,
      type:       'vaccination',
      title:      'COVID-19 Booster — AstraZeneca',
      description:'Vaccine: AstraZeneca ChAdOx1-S (Covishield)\nBatch No: CV-2025-LK-0912\nDose: 3rd dose (Booster) — 0.5 mL intramuscular\nSite: Right deltoid\nManufacturer: Serum Institute of India\nAdministered at: Nawaloka General Hospital\n\nPrevious doses:\n  — 1st: 15-Jan-2022 (AstraZeneca)\n  — 2nd: 14-Apr-2022 (AstraZeneca)\n\nSide effects reported: Mild arm soreness (resolved in 24h)',
      date:       threeMonthsAgo,
      tags:       ['covid', 'booster', 'astrazeneca', 'vaccine'],
      isVisible:  true,
    },

    // Chaminda Wickramasinghe — General medicine records
    {
      patientId:  patient3._id,
      hospitalId: hospital._id,
      uploadedBy: doctor3._id,
      type:       'lab',
      title:      'HbA1c & Fasting Blood Sugar (FBS)',
      description:'Fasting Blood Sugar: 112 mg/dL ⚠️ (Pre-diabetic range: 100-125)\nHbA1c: 6.1% ⚠️ (Pre-diabetic range: 5.7-6.4%)\nRandom Blood Sugar: 148 mg/dL\n\nConclusion: Pre-diabetic. Lifestyle intervention strongly recommended. No pharmacotherapy at this stage.\nRetest HbA1c in 3 months.',
      date:       oneMonthAgo,
      tags:       ['hba1c', 'diabetes', 'blood-sugar', 'pre-diabetic'],
      isVisible:  true,
    },
    {
      patientId:  patient3._id,
      hospitalId: hospital._id,
      uploadedBy: doctor3._id,
      type:       'discharge',
      title:      'Discharge Summary — Dengue Fever',
      description:'Admission Date: 10-Jun-2025\nDischarge Date: 15-Jun-2025\nWard: General Medical Ward 3B\n\nDiagnosis: Dengue Fever (NS1 Antigen Positive)\n\nHospital Course:\nPatient admitted with 4 days of high fever (39.8°C), myalgia and retro-orbital headache. NS1 rapid antigen test positive on Day 1. Platelet count dropped to 68 × 10⁹/L on Day 3, managed conservatively with IV fluids. Platelet count recovered to 145 × 10⁹/L by Day 5. Fever subsided by Day 4. Patient discharged in stable condition.\n\nDischarge Medications:\n• Paracetamol 500mg PRN for pain (avoid NSAIDs/Aspirin)\n• ORS sachets for hydration\n\nFollow-up: 1 week with CBC repeat.',
      date:       twoWeeksAgo,
      tags:       ['dengue', 'discharge', 'ns1', 'fever', 'admission'],
      isVisible:  true,
    },
    {
      patientId:  patient3._id,
      hospitalId: hospital._id,
      uploadedBy: doctor3._id,
      type:       'prescription',
      title:      'Rx — Hypertension (Annual Review)',
      description:'1. Losartan 50mg — Once daily (morning)\n   ↳ ARB for blood pressure. Monitor potassium levels.\n\n2. Hydrochlorothiazide 12.5mg — Once daily (morning)\n   ↳ Thiazide diuretic. Take with plenty of water.\n\n3. Omeprazole 20mg — Once daily before breakfast\n   ↳ Gastric protection. Take 30 minutes before food.\n\nDuration: 90 days\nMonitoring: Check BP twice weekly. Record readings.\nDiet: DASH diet — reduce sodium to <2g/day\nFollow-up: 4 weeks',
      date:       oneWeekAgo,
      tags:       ['losartan', 'hydrochlorothiazide', 'hypertension', 'bp', 'dash-diet'],
      isVisible:  true,
    },
  ];

  for (const rec of records) {
    const exists = await HealthRecord.findOne({
      patientId: rec.patientId,
      title:     rec.title,
    });
    if (!exists) {
      await HealthRecord.create(rec);
      console.log(`   ✅ Record: [${rec.type}] ${rec.title.substring(0, 50)}`);
    } else {
      console.log(`   ⏩ Skipped record (exists): ${rec.title.substring(0, 40)}`);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SUMMARY
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n🎉 Seed complete!\n');
  console.log('═══════════════════════════════════════════════════════');
  console.log('  Hospital registration code: NWL01');
  console.log('═══════════════════════════════════════════════════════');
  console.log('  👑  Super Admin  : superadmin@healthcare.lk  / Admin@1234');
  console.log('  🛠️   Hospital Admin: admin@nawaloka.lk          / Admin@1234');
  console.log('  🩺  Doctor 1    : dr.dissanayake@nawaloka.lk  / Doctor@1234 (Cardiology)');
  console.log('  🩺  Doctor 2    : dr.perera@nawaloka.lk       / Doctor@1234 (Paediatrics)');
  console.log('  🩺  Doctor 3    : dr.fernando@nawaloka.lk     / Doctor@1234 (General Med)');
  console.log('  🧑  Patient 1   : sunil.kumara@gmail.com      / Patient@1234');
  console.log('  🧑  Patient 2   : malini.silva@gmail.com      / Patient@1234');
  console.log('  🧑  Patient 3   : chaminda.wickramasinghe@gmail.com / Patient@1234');
  console.log('═══════════════════════════════════════════════════════\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  console.error(err);
  process.exit(1);
});
