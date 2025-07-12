import { useState, useEffect, useCallback } from 'react';

export function useTheme(defaultMode: 'light' | 'dark' = 'dark') {
  const [mode, setMode] = useState(defaultMode);

  useEffect(() => {
    document.body.dataset.theme = mode;
  }, [mode]);

  const toggleMode = useCallback(
    () => setMode(prev => (prev === 'dark' ? 'light' : 'dark')),
    []
  );

  return { mode, toggleMode };
}
