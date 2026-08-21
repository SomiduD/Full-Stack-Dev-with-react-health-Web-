// client/src/components/OfflineBanner.jsx
import { useEffect, useState } from 'react';
import useOffline from '../hooks/useOffline';

/**
 * OfflineBanner — persistent top-of-page network status indicator.
 *
 * Shows:
 *   - Red bar when offline ("You are offline — data is being saved locally")
 *   - Green bar for 4 s when reconnected ("Back online — syncing your data")
 *   - Nothing when steadily online
 */
const OfflineBanner = () => {
  const { isOnline, wasOffline } = useOffline();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isOnline || wasOffline) {
      setVisible(true);
    } else {
      // Give the "Back online" message time to animate out
      const t = setTimeout(() => setVisible(false), 500);
      return () => clearTimeout(t);
    }
  }, [isOnline, wasOffline]);

  if (!visible) return null;

  const isReconnected = isOnline && wasOffline;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position:   'fixed',
        top:        0,
        left:       0,
        right:      0,
        zIndex:     9999,
        display:    'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap:        '10px',
        padding:    '10px 20px',
        fontSize:   '0.85rem',
        fontWeight: 500,
        background: isReconnected
          ? 'linear-gradient(90deg, rgba(16,185,129,0.95), rgba(5,150,105,0.95))'
          : 'linear-gradient(90deg, rgba(239,68,68,0.95), rgba(185,28,28,0.95))',
        color:      '#fff',
        backdropFilter: 'blur(8px)',
        animation:  'fadeInDown 0.3s ease both',
        boxShadow:  '0 2px 12px rgba(0,0,0,0.4)',
        transition: 'background 0.4s ease',
      }}
    >
      {/* Icon */}
      {isReconnected ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="1" y1="1" x2="23" y2="23"/>
          <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55M5 12.55a10.94 10.94 0 0 1 5.17-2.39M10.71 5.05A16 16 0 0 1 22.56 9M1.42 9a15.91 15.91 0 0 1 4.7-2.88M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01"/>
        </svg>
      )}

      {/* Message */}
      <span>
        {isReconnected
          ? 'Back online — syncing your offline changes...'
          : 'You\'re offline — changes are saved locally and will sync when reconnected.'}
      </span>

      {/* Pulse dot */}
      <span style={{
        width:           8,
        height:          8,
        borderRadius:    '50%',
        background:      isReconnected ? '#6ee7b7' : '#fca5a5',
        animation:       'ping 1.2s cubic-bezier(0,0,0.2,1) infinite',
        flexShrink:      0,
      }} />
    </div>
  );
};

export default OfflineBanner;
