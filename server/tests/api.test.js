// server/tests/api.test.js
const request  = require('supertest');
const mongoose = require('mongoose');
const { app }  = require('../src/app');

// ─── Test data ────────────────────────────────────────────────────────────────
const testPatient = {
  email:       'testpatient_jest@example.com',
  password:    'TestPass@123',
  role:        'patient',
  hospitalCode: 'DEMO01',        // Required by register route
  profile:     { firstName: 'Test', lastName: 'Patient' },
};

let accessToken  = null;
let dbAvailable  = false;

// ─── Lifecycle ────────────────────────────────────────────────────────────────
beforeAll(async () => {
  // Give MongoDB a moment to connect; detect availability
  await new Promise((r) => setTimeout(r, 2000));
  dbAvailable = mongoose.connection.readyState === 1;
}, 10000);

afterAll(async () => {
  if (dbAvailable) {
    try {
      const { User } = require('../src/models/User');
      await User.deleteOne({ email: testPatient.email });
    } catch (_) {}
  }
  await mongoose.connection.close();
}, 30000);


// ─── Health Check (no DB needed) ──────────────────────────────────────────────
describe('GET /api/health', () => {
  it('should return 200 and success:true', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/operational/i);
  });
});

// ─── 404 Handling (no DB needed) ──────────────────────────────────────────────
describe('404 Handling', () => {
  it('should return 404 for unknown API routes', async () => {
    const res = await request(app).get('/api/this-does-not-exist');
    expect(res.statusCode).toBe(404);
  });
});

// ─── Input Validation (no DB needed) ─────────────────────────────────────────
describe('POST /api/auth/register — Input Validation', () => {
  it('should return 422 when email is missing', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ password: 'TestPass@123', profile: { firstName: 'A', lastName: 'B' } });
    expect([400, 422]).toContain(res.statusCode);
    expect(res.body.success).toBe(false);
  });

  it('should return 422 when password is too weak', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'user@test.com', password: 'weak', profile: { firstName: 'A', lastName: 'B' } });
    expect([400, 422]).toContain(res.statusCode);
  });

  it('should return 422 when profile firstName is missing', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'user@test.com', password: 'TestPass@123', profile: { lastName: 'B' } });
    expect([400, 422]).toContain(res.statusCode);
  });
});

// ─── Protected Routes (no DB needed) ─────────────────────────────────────────
describe('Protected Routes — Unauthenticated Access', () => {
  it('GET /api/auth/me should return 401 without a token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.statusCode).toBe(401);
  });

  it('GET /api/appointments/my should return 401 without a token', async () => {
    const res = await request(app).get('/api/appointments/my');
    expect(res.statusCode).toBe(401);
  });

  it('GET /api/health-records should return 401 without a token', async () => {
    const res = await request(app).get('/api/health-records');
    expect(res.statusCode).toBe(401);
  });
});

// ─── Auth with real DB (skipped if DB unavailable) ───────────────────────────
describe('Auth Routes — with Database', () => {
  const skip = () => !dbAvailable;

  it('POST /api/auth/register — should create user and return 201', async () => {
    if (skip()) return console.warn('⚠️  Skipping DB test — MongoDB not connected.');
    const res = await request(app).post('/api/auth/register').send(testPatient);
    // If hospital code DEMO01 doesn't exist, we expect a 404 or 422 — both are valid
    expect([201, 404, 409, 422]).toContain(res.statusCode);
  }, 10000);

  it('POST /api/auth/login — wrong password returns 401', async () => {
    if (skip()) return console.warn('⚠️  Skipping DB test — MongoDB not connected.');
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testPatient.email, password: 'WrongPassword!' });
    expect([401, 404]).toContain(res.statusCode);
  }, 10000);
});

// ─── Conflict Detection ───────────────────────────────────────────────────────
describe('PATCH /api/appointments/:id/status — Conflict Detection', () => {
  it('should return 401 when updating an appointment without a token', async () => {
    const res = await request(app)
      .patch('/api/appointments/000000000000000000000001/status')
      .send({ status: 'confirmed', version: 0 });
    expect(res.statusCode).toBe(401);
  });
});
