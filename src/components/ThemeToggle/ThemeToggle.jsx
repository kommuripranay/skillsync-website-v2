import React from 'react';
import { IonIcon } from '@ionic/react';
import { moon, sunny } from 'ionicons/icons';
import { useTheme } from '../../hooks/useTheme'; // Adjust path as needed
import './ThemeToggle.css';

function ThemeToggle() {
  const [theme, toggleTheme] = useTheme();

  return (
    <button onClick={toggleTheme} className="theme-toggle-button">
      <IonIcon icon={theme === 'light' ? moon : sunny} />
    </button>
  );
}

export default ThemeToggle;