// client/src/hooks/useAppointments.js
import { useState, useEffect, useCallback } from 'react';
import { db } from '../db/healthVaultDB';
import {
  getMyAppointments,
  getDoctorQueue,
  getDoctorSchedule,
} from '../services/appointmentService';

/**
 * useAppointments — fetches appointments with Dexie offline fallback.
 *
 * @param {'patient'|'doctor-queue'|'doctor-schedule'} mode
 * @param {object} params  Optional query params (status, date, upcoming)
 */
const useAppointments = (mode = 'patient', params = {}) => {
  const [appointments, setAppointments] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let result;
      if (mode === 'patient')          result = await getMyAppointments(params);
      else if (mode === 'doctor-queue') result = await getDoctorQueue(params.date);
      else                             result = await getDoctorSchedule();

      const data = result.data || [];
      setAppointments(data);

      // Cache to Dexie for offline use (patient mode only)
      if (mode === 'patient') {
        for (const appt of data) {
          await db.appointments.put({
            _id:             appt._id,
            patientId:       appt.patientId,
            doctorId:        appt.doctorId,
            hospitalId:      appt.hospitalId,
            date:            appt.date,
            timeSlot:        appt.timeSlot,
            reason:          appt.reason,
            status:          appt.status,
            isOfflineDraft:  false,
            syncedAt:        Date.now(),
          });
        }
      }
    } catch (err) {
      // Offline fallback — try Dexie cache
      if (mode === 'patient') {
        try {
          const cached = await db.appointments
            .where('isOfflineDraft').equals(0)
            .toArray();
          setAppointments(cached);
        } catch {
          setAppointments([]);
        }
      }
      setError(err.response?.data?.message || 'Failed to load appointments.');
    } finally {
      setLoading(false);
    }
  }, [mode, JSON.stringify(params)]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  return { appointments, loading, error, refetch: fetchAppointments };
};

export default useAppointments;
