/**
 * Theme System for Live Intelligence
 * @file lib/live-intelligence/theme.js
 * 
 * Dark/Light theme toggle with CSS variables
 * Persists preference in localStorage
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

export const themes = {
  dark: {
    name: 'dark',
    label: 'Dark Mode',
    icon: '🌙',
    colors: {
      background: '#090A0C',
      backgroundPanel: 'rgba(10, 15, 25, 0.95)',
      backgroundCard: 'rgba(20, 30, 50, 0.50)',
      text: 'rgba(235, 242, 255, 0.94)',
      textMuted: 'rgba(220, 230, 255, 0.62)',
      textDim: 'rgba(200, 215, 240, 0.45)',
      accent: 'rgba(170, 198, 255, 0.70)',
      accentStrong: 'rgba(170, 198, 255, 0.82)',
      accentGlow: 'rgba(170, 198, 255, 0.18)',
      border: 'rgba(170, 198, 255, 0.15)',
      borderStrong: 'rgba(170, 198, 255, 0.25)',
      cardBg: 'rgba(20, 30, 50, 0.50)',
      cardBorder: 'rgba(170, 198, 255, 0.20)',
      buttonBg: 'rgba(170, 198, 255, 0.10)',
      buttonHover: 'rgba(170, 198, 255, 0.20)',
      success: 'rgba(100, 255, 150, 0.85)',
      warning: 'rgba(255, 200, 100, 0.85)',
      error: 'rgba(255, 100, 100, 0.85)',
      glassBlur: '24px',
    }
  },
  light: {
    name: 'light',
    label: 'Light Mode',
    icon: '☀️',
    colors: {
      background: '#F5F7FA',
      backgroundPanel: 'rgba(255, 255, 255, 0.98)',
      backgroundCard: 'rgba(255, 255, 255, 0.80)',
      text: 'rgba(20, 30, 50, 0.95)',
      textMuted: 'rgba(60, 80, 120, 0.70)',
      textDim: 'rgba(80, 100, 140, 0.55)',
      accent: 'rgba(70, 120, 220, 0.90)',
      accentStrong: 'rgba(70, 120, 220, 1.0)',
      accentGlow: 'rgba(70, 120, 220, 0.15)',
      border: 'rgba(70, 120, 220, 0.20)',
      borderStrong: 'rgba(70, 120, 220, 0.30)',
      cardBg: 'rgba(255, 255, 255, 0.80)',
      cardBorder: 'rgba(70, 120, 220, 0.15)',
      buttonBg: 'rgba(70, 120, 220, 0.10)',
      buttonHover: 'rgba(70, 120, 220, 0.20)',
      success: 'rgba(40, 180, 100, 0.90)',
      warning: 'rgba(200, 150, 50, 0.90)',
      error: 'rgba(220, 60, 60, 0.90)',
      glassBlur: '16px',
    }
  }
};

// Apply theme to document root
function applyTheme(themeName) {
  if (typeof document === 'undefined') return;
  
  const colors = themes[themeName]?.colors;
  if (!colors) return;
  
  const root = document.documentElement;
  
  // Set CSS variables
  Object.entries(colors).forEach(([key, value]) => {
    const cssVarName = `--li-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
    root.style.setProperty(cssVarName, value);
  });
  
  // Set data attribute for CSS selectors
  root.setAttribute('data-li-theme', themeName);
  
  // Also set on body for components that need it
  if (document.body) {
    document.body.setAttribute('data-li-theme', themeName);
  }
}

// Get initial theme from localStorage or system preference
function getInitialTheme() {
  if (typeof window === 'undefined') return 'dark';
  
  const saved = localStorage.getItem('li_theme');
  if (saved && themes[saved]) return saved;
  
  // Check system preference
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    return 'light';
  }
  
  return 'dark';
}

/**
 * React hook for theme management
 */
export function useTheme() {
  const [theme, setTheme] = useState('dark');
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    const initial = getInitialTheme();
    setTheme(initial);
    applyTheme(initial);
    setMounted(true);
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      const saved = localStorage.getItem('li_theme');
      if (!saved) {
        const newTheme = e.matches ? 'dark' : 'light';
        setTheme(newTheme);
        applyTheme(newTheme);
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('li_theme', newTheme);
    applyTheme(newTheme);
  }, [theme]);
  
  const setThemeMode = useCallback((mode) => {
    if (themes[mode]) {
      setTheme(mode);
      localStorage.setItem('li_theme', mode);
      applyTheme(mode);
    }
  }, []);
  
  return {
    theme,
    themes: themes[theme],
    allThemes: themes,
    toggleTheme,
    setTheme: setThemeMode,
    mounted,
    isDark: theme === 'dark',
    isLight: theme === 'light',
  };
}

/**
 * Get CSS variable value for current theme
 */
export function getThemeColor(colorName) {
  if (typeof document === 'undefined') return '';
  
  const varName = `--li-${colorName.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
  return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
}

/**
 * Theme Toggle Button Component
 */
export function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme, mounted } = useTheme();
  
  if (!mounted) {
    return (
      <button
        className={`p-2 rounded-lg transition-all opacity-50 ${className}`}
        disabled
      >
        🌓
      </button>
    );
  }
  
  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-lg hover:bg-white/10 transition-all ${className}`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode (Ctrl+D)`}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}

export default useTheme;
