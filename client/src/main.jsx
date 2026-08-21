// client/src/main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import './index.css';
import App from './App.jsx';

/**
 * Provider order matters:
 *   BrowserRouter  — router context (outermost, no auth dependency)
 *   AuthProvider   — manages user session; must wrap SocketProvider
 *   SocketProvider — depends on AuthContext for user/token
 *   App            — route tree
 */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <App />
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
