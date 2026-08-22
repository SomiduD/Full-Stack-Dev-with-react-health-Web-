// client/src/hooks/useHealthRecords.js
import { useState, useEffect, useCallback } from 'react';
import { db } from '../db/healthVaultDB';
import { getMyRecords } from '../services/healthRecordService';

/**
 * useHealthRecords — fetches patient health records with Dexie offline fallback.
 *
 * @param {{ type? }} params  Optional filter by record type
 */
const useHealthRecords = (params = {}) => {
  const [records,  setRecords]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getMyRecords(params);
      const data   = result.data || [];
      setRecords(data);

      // Sync to Dexie
      for (const rec of data) {
        await db.healthRecords.put({
          _id:            rec._id,
          patientId:      rec.patientId,
          hospitalId:     rec.hospitalId,
          type:           rec.type,
          date:           rec.date,
          isOfflineDraft: false,
          syncedAt:       Date.now(),
          // Store full payload for offline reads
          _fullData:      JSON.stringify(rec),
        });
      }
    } catch (err) {
      // Offline fallback
      try {
        const cached = await db.healthRecords
          .where('isOfflineDraft').equals(0)
          .toArray();
        // Reconstruct from stored JSON if available
        setRecords(cached.map((r) => (r._fullData ? JSON.parse(r._fullData) : r)));
      } catch {
        setRecords([]);
      }
      setError(err.response?.data?.message || 'Failed to load health records.');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  return { records, loading, error, refetch: fetchRecords };
};

export default useHealthRecords;
