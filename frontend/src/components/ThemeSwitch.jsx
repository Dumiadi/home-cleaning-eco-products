import React from 'react';
import { useTheme } from '../context/ThemeContext';
import './ThemeSwitch.css';

function ThemeSwitch() {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button 
      className="theme-switch-btn"
      onClick={toggleTheme}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDarkMode ? 'Comută la modul luminos' : 'Comută la modul întunecat'}
    >
      <div className={`theme-switch ${isDarkMode ? 'dark' : 'light'}`}>
        <div className="theme-switch-track">
          <div className="theme-switch-thumb">
            <div className="theme-icon">
              {isDarkMode ? (
                // Moon icon
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path 
                    d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" 
                    fill="currentColor"
                  />
                </svg>
              ) : (
                // Sun icon
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="5" fill="currentColor"/>
                  <line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" strokeWidth="2"/>
                  <line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" strokeWidth="2"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" strokeWidth="2"/>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" strokeWidth="2"/>
                  <line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" strokeWidth="2"/>
                  <line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" strokeWidth="2"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" strokeWidth="2"/>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" strokeWidth="2"/>
                </svg>
              )}
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}

export default ThemeSwitch;