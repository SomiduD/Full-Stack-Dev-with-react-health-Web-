// client/src/hooks/useOffline.js
import { useState, useEffect } from 'react';

/**
 * useOffline — tracks browser online/offline network status.
 *
 * Returns:
 *   isOnline   {boolean} — current connectivity status
 *   wasOffline {boolean} — true for 4 s after reconnecting (use to trigger sync)
 */
const useOffline = () => {
  const [isOnline,   setIsOnline]   = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    let resetTimer;

    const handleOnline = () => {
      setIsOnline(true);
      setWasOffline(true);
      // Hold the wasOffline flag for 4 s so consumers can trigger sync logic
      resetTimer = setTimeout(() => setWasOffline(false), 4_000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      clearTimeout(resetTimer);
    };

    window.addEventListener('online',  handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online',  handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearTimeout(resetTimer);
    };
  }, []);

  return { isOnline, wasOffline };
};

export default useOffline;
