// client/src/components/ThemeToggle.jsx
import { useTheme } from '../context/ThemeContext';

/**
 * ThemeToggle — A pill-shaped Sun/Moon toggle button.
 * Drop this into any header/navbar.
 */
const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      id="theme-toggle-btn"
      onClick={toggleTheme}
      className={`theme-toggle ${className}`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      title={`Switch to ${isDark ? 'Day' : 'Night'} theme`}
    >
      {/* Track */}
      <span className="theme-toggle__track">
        {/* Sun icon */}
        <span className="theme-toggle__icon theme-toggle__icon--sun" aria-hidden="true">
          ☀️
        </span>
        {/* Moon icon */}
        <span className="theme-toggle__icon theme-toggle__icon--moon" aria-hidden="true">
          🌙
        </span>
        {/* Sliding thumb */}
        <span className="theme-toggle__thumb" />
      </span>
    </button>
  );
};

export default ThemeToggle;
