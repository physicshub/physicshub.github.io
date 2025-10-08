import { useState, useEffect, useCallback } from 'react';

const THEME_STORAGE_KEY = 'physicshub-theme';

export function useTheme(defaultMode: 'light' | 'dark' = 'dark') {
  // Initialize theme from localStorage or default
  const [mode, setMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved && ['light', 'dark'].includes(saved)) {
        return saved as 'light' | 'dark';
      }
    }
    return defaultMode;
  });

  // Apply theme to document and save to localStorage
  useEffect(() => {
    // Apply theme to document
    document.body.dataset.theme = mode;
    
    // Save to localStorage
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  }, [mode]);

  const toggleMode = useCallback(() => {
    setMode(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);

  return { mode, toggleMode };
}
