import { useState, useEffect } from 'react';

export const useTheme = () => {
  // Read from localStorage, but use a function to avoid running it on every render
  const [theme, setTheme] = useState(
    () => localStorage.getItem('theme') || 'light'
  );

  // Effect to apply the theme to the <body> and save to localStorage
  useEffect(() => {
    document.body.className = ''; // Clear old classes
    document.body.classList.add(`theme-${theme}`);
    localStorage.setItem('theme', theme);
  }, [theme]); // Only re-run when theme changes

  // Memoized toggle function
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return [theme, toggleTheme];
};