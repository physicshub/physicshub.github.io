import { useState, useEffect, useCallback } from 'react';

export function useTheme(defaultMode: 'light' | 'dark' | 'system' = 'system') {
  const [mode, setMode] = useState(defaultMode);

  const getSystemTheme = () => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

 useEffect(() => {
  let actualTheme = mode;
  if(mode === 'system'){
    actualTheme = getSystemTheme();
  }
  document.body.dataset.theme = actualTheme;
  if(mode === 'system'){
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      document.body.dataset.theme = getSystemTheme();
    };

    mediaQuery.addEventListener('change', handleChange);
    return ()=> mediaQuery.removeEventListener('change', handleChange);
  }
}, [mode]);

  const toggleMode = useCallback(
    () => setMode(prev => {
    if(prev === 'dark') return 'light';
    if(prev === 'light') return 'system';
    return 'dark';
    }),
    []
  );

  return { mode, toggleMode };
}
