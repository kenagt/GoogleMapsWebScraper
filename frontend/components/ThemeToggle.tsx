import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  // Check if user has a preferred theme stored or use system preference
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    // Check localStorage first
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    // Otherwise check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Apply theme change to document
  useEffect(() => {
    const root = window.document.documentElement;
    
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <button
      onClick={toggleTheme}
      className={`flex items-center justify-center p-2 rounded-full transition-colors ${
        isDarkMode 
          ? 'bg-gray-800 text-yellow-300 hover:bg-gray-700' 
          : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
      } ${className}`}
      aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
    >
      {isDarkMode ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </button>
  );
};

export default ThemeToggle;