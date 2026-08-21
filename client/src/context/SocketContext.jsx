// client/src/context/SocketContext.jsx
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

// Strip /api suffix from the URL to get the Socket.io server root
const SOCKET_URL =
  (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const socketRef                 = useRef(null);
  const [isConnected,    setIsConnected]    = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  useEffect(() => {
    // ── Disconnect when user logs out ──────────────────────────────────────
    if (!isAuthenticated || !user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) return;

    // ── Connect ────────────────────────────────────────────────────────────
    const socket = io(SOCKET_URL, {
      auth:                 { token },
      transports:           ['websocket', 'polling'],
      reconnection:         true,
      reconnectionAttempts: 5,
      reconnectionDelay:    1000,
      reconnectionDelayMax: 10_000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      setConnectionError(null);

      // Auto-join hospital room on connect
      if (user.hospitalId) {
        socket.emit('join_hospital_room', user.hospitalId);
      }

      // Doctors get an individual room for queue notifications
      if (user.role === 'doctor') {
        socket.emit('join_doctor_room', user.id);
      }
    });

    socket.on('disconnect', (reason) => {
      setIsConnected(false);
      console.warn('Socket disconnected:', reason);
    });

    socket.on('connect_error', (err) => {
      setConnectionError(err.message);
      setIsConnected(false);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, user]);

  const value = {
    socket:          socketRef.current,
    isConnected,
    connectionError,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within a <SocketProvider>');
  return ctx;
};

export default SocketContext;
