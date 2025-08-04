import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './LanguageSelector.css';

const languages = [
  {
    code: 'ro',
    name: 'Română',
    flag: '🇷🇴',
    nativeName: 'Română'
  },
  {
    code: 'en',
    name: 'English',
    flag: '🇺🇸',
    nativeName: 'English'
  }
];

function LanguageSelector() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (langCode) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('lang', langCode);
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="language-selector" ref={dropdownRef}>
      <button
        className="language-button"
        onClick={toggleDropdown}
        aria-label="Select language"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="language-flag">{currentLanguage.flag}</span>
        <span className="language-code">{currentLanguage.code.toUpperCase()}</span>
        <svg 
          className={`language-arrow ${isOpen ? 'open' : ''}`}
          width="12" 
          height="12" 
          viewBox="0 0 24 24" 
          fill="none"
        >
          <path 
            d="M6 9l6 6 6-6" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <div className={`language-dropdown ${isOpen ? 'open' : ''}`}>
        <div className="language-dropdown-content">
          {languages.map((language) => (
            <button
              key={language.code}
              className={`language-option ${
                currentLanguage.code === language.code ? 'active' : ''
              }`}
              onClick={() => handleLanguageChange(language.code)}
              aria-label={`Switch to ${language.name}`}
            >
              <span className="language-flag">{language.flag}</span>
              <div className="language-info">
                <span className="language-name">{language.name}</span>
                <span className="language-native">{language.nativeName}</span>
              </div>
              {currentLanguage.code === language.code && (
                <svg 
                  className="language-check" 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none"
                >
                  <path 
                    d="M20 6L9 17l-5-5" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default LanguageSelector;