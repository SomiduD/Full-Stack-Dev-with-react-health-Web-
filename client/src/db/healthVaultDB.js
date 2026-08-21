// client/src/db/healthVaultDB.js
import Dexie from 'dexie';

/**
 * HealthVaultDB — Dexie.js IndexedDB schema
 *
 * This is the offline-capable local database for the entire client.
 * It mirrors critical server-side MongoDB collections so that:
 *   1. Patients can read their records without connectivity.
 *   2. Draft mutations are queued and replayed once back online.
 *   3. Emergency triage events received via Socket.io are persisted locally.
 *
 * SCHEMA VERSIONING RULE: Never modify an existing version() block.
 * Always increment the version number and call .stores() with the full schema.
 */
export const db = new Dexie('HealthVaultDB');

db.version(1).stores({
  // ── Auth / session ─────────────────────────────────────────────────────────
  // Cached user profile for offline session restore
  users: '++id, userId, email, role, hospitalId, cachedAt',

  // ── Appointments ───────────────────────────────────────────────────────────
  // Supports offline read-through and offline draft creation
  appointments: [
    '++id',
    '_id',          // MongoDB _id (null for drafts)
    'patientId',
    'doctorId',
    'hospitalId',
    'date',
    'status',
    'isOfflineDraft', // true = not yet synced to server
    'syncedAt',
  ].join(', '),

  // ── Digital Health Vault ───────────────────────────────────────────────────
  // Lab reports, imaging, discharge summaries, etc.
  healthRecords: [
    '++id',
    '_id',
    'patientId',
    'hospitalId',
    'type',
    'date',
    'isOfflineDraft',
    'syncedAt',
  ].join(', '),

  // ── Prescriptions ──────────────────────────────────────────────────────────
  prescriptions: [
    '++id',
    '_id',
    'patientId',
    'doctorId',
    'hospitalId',
    'issuedAt',
    'isOfflineDraft',
    'syncedAt',
  ].join(', '),

  // ── Offline Sync Queue ─────────────────────────────────────────────────────
  // Pending mutations (create/update/delete) to be replayed when back online
  syncQueue: '++id, entityType, action, status, createdAt, attempts',

  // ── Emergency Triage Events ────────────────────────────────────────────────
  // Received from Socket.io and cached locally for Doctor/Admin portals
  triageEvents: '++id, _id, hospitalId, patientId, severity, status, timestamp',
});

// ─── User cache helpers ───────────────────────────────────────────────────────

/**
 * Persists the authenticated user profile into IndexedDB.
 * Called on every successful login or /me fetch.
 */
export const cacheUser = async (userData) => {
  await db.users.clear(); // Single-user client — clear any stale session
  await db.users.add({
    userId:     userData.id,
    email:      userData.email,
    role:       userData.role,
    hospitalId: userData.hospitalId || null,
    profile:    userData.profile,
    hospital:   userData.hospital || null,
    cachedAt:   Date.now(),
  });
};

/**
 * Retrieves the most recently cached user (offline session restore).
 * Returns undefined if no cache exists.
 */
export const getCachedUser = async () =>
  db.users.orderBy('cachedAt').last();

/**
 * Removes the cached user on logout.
 */
export const clearUserCache = async () =>
  db.users.clear();

// ─── Sync queue helpers ───────────────────────────────────────────────────────

/**
 * Enqueues an offline mutation for later sync.
 *
 * @param {'appointment'|'healthRecord'|'prescription'} entityType
 * @param {'CREATE'|'UPDATE'|'DELETE'} action
 * @param {Object} payload - The data to send when syncing
 */
export const addToSyncQueue = async (entityType, action, payload) =>
  db.syncQueue.add({
    entityType,
    action,
    payload,
    createdAt: Date.now(),
    attempts:  0,
    status:    'pending', // 'pending' | 'syncing' | 'synced' | 'failed'
  });

/**
 * Returns all items from the sync queue that have not yet been sent.
 */
export const getPendingSyncItems = async () =>
  db.syncQueue.where('status').equals('pending').toArray();

/**
 * Marks a sync queue item as successfully synced.
 */
export const markSyncItemDone = async (id) =>
  db.syncQueue.update(id, { status: 'synced' });

/**
 * Increments the attempt counter and marks as failed after too many retries.
 */
export const markSyncItemFailed = async (id, currentAttempts) => {
  const attempts = currentAttempts + 1;
  const status   = attempts >= 3 ? 'failed' : 'pending';
  await db.syncQueue.update(id, { attempts, status });
};

export default db;
