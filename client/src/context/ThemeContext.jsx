// client/src/context/ThemeContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  // Default to 'light' (day theme). Persist preference in localStorage.
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('hcp-theme') || 'light';
  });

  useEffect(() => {
    // Apply data-theme attribute to <html> so CSS vars respond
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('hcp-theme', theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a <ThemeProvider>');
  return ctx;
};

export default ThemeContext;
