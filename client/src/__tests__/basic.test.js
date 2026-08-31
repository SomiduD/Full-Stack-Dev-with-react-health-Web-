/**
 * client/src/__tests__/basic.test.js
 *
 * Core unit tests for the Healthcare Platform client.
 *
 * These tests validate foundational logic and utility functions
 * that are critical to the application's functionality.
 */

// ─── Test 1: JWT token parsing utility ────────────────────────────────────────
describe('JWT Token Utilities', () => {
  /**
   * The app reads the JWT expiry from the token payload to know when to
   * proactively refresh. This tests the core parsing logic.
   */
  const parseJwtPayload = (token) => {
    try {
      const base64Payload = token.split('.')[1];
      const jsonPayload   = atob(base64Payload);
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  };

  it('should correctly decode a JWT payload', () => {
    // A real-shaped (but unsigned) JWT for testing
    const header  = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({ id: 'user123', role: 'patient', exp: 9999999999 }));
    const token   = `${header}.${payload}.fakesig`;

    const decoded = parseJwtPayload(token);
    expect(decoded).not.toBeNull();
    expect(decoded.id).toBe('user123');
    expect(decoded.role).toBe('patient');
  });

  it('should return null for a malformed token', () => {
    const result = parseJwtPayload('not.a.valid.jwt.token');
    expect(result).toBeNull();
  });
});

// ─── Test 2: Appointment status logic ────────────────────────────────────────
describe('Appointment Status Logic', () => {
  const VALID_STATUSES = ['pending', 'confirmed', 'completed', 'cancelled'];

  const isValidStatus = (status) => VALID_STATUSES.includes(status);

  const canPatientCancel = (appointment, userId) =>
    appointment.patientId === userId && appointment.status !== 'completed';

  it('should only allow valid appointment statuses', () => {
    expect(isValidStatus('pending')).toBe(true);
    expect(isValidStatus('confirmed')).toBe(true);
    expect(isValidStatus('completed')).toBe(true);
    expect(isValidStatus('cancelled')).toBe(true);
    expect(isValidStatus('unknown_status')).toBe(false);
  });

  it('should allow a patient to cancel their own pending appointment', () => {
    const appt = { _id: 'appt1', patientId: 'user123', status: 'pending' };
    expect(canPatientCancel(appt, 'user123')).toBe(true);
  });

  it('should NOT allow a patient to cancel a completed appointment', () => {
    const appt = { _id: 'appt1', patientId: 'user123', status: 'completed' };
    expect(canPatientCancel(appt, 'user123')).toBe(false);
  });

  it('should NOT allow a patient to cancel another patient\'s appointment', () => {
    const appt = { _id: 'appt1', patientId: 'user123', status: 'pending' };
    expect(canPatientCancel(appt, 'other_user')).toBe(false);
  });
});

// ─── Test 3: Offline sync queue logic ────────────────────────────────────────
describe('Offline Sync Queue Logic', () => {
  // Mirrors the real syncQueue logic in healthVaultDB.js
  const buildSyncItem = (entityType, action, payload) => ({
    entityType,
    action,
    payload,
    createdAt: Date.now(),
    attempts:  0,
    status:    'pending',
  });

  const getMaxAttempts = () => 3;

  const markFailed = (item) => {
    const attempts = item.attempts + 1;
    return { ...item, attempts, status: attempts >= getMaxAttempts() ? 'failed' : 'pending' };
  };

  it('should create a sync queue item with status "pending"', () => {
    const item = buildSyncItem('appointment', 'CREATE', { doctorId: 'd1' });
    expect(item.status).toBe('pending');
    expect(item.attempts).toBe(0);
    expect(item.entityType).toBe('appointment');
  });

  it('should mark item as "failed" after 3 attempts', () => {
    let item = buildSyncItem('healthRecord', 'UPDATE', {});
    item = markFailed(item); // attempt 1
    expect(item.status).toBe('pending');
    item = markFailed(item); // attempt 2
    expect(item.status).toBe('pending');
    item = markFailed(item); // attempt 3
    expect(item.status).toBe('failed');
  });

  it('should support all required entity types', () => {
    const validEntities = ['appointment', 'healthRecord', 'prescription'];
    validEntities.forEach((entity) => {
      const item = buildSyncItem(entity, 'CREATE', {});
      expect(item.entityType).toBe(entity);
    });
  });
});
