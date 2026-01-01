import React, { createContext, useContext, useState, useEffect } from 'react';

interface PreferencesContextType {
  fontSize: number;
  setFontSize: (size: number) => void;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  // Default base size is 16px
  const [fontSize, setFontSizeState] = useState<number>(16);

  useEffect(() => {
    const savedSize = localStorage.getItem('khaliq-font-size-px');
    if (savedSize) {
        setFontSizeState(parseInt(savedSize));
    }
  }, []);

  const setFontSize = (size: number) => {
    setFontSizeState(size);
    localStorage.setItem('khaliq-font-size-px', size.toString());
    
    // Apply CSS variable for global scaling
    document.documentElement.style.setProperty('--base-font-size', `${size}px`);
    
    // Also update the tailwind base font size if possible, or use the variable in CSS
    // We will update index.css to use this variable
  };

  // Apply initial size
  useEffect(() => {
    document.documentElement.style.setProperty('--base-font-size', `${fontSize}px`);
  }, [fontSize]);

  return (
    <PreferencesContext.Provider value={{ fontSize, setFontSize }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (!context) throw new Error('usePreferences must be used within a PreferencesProvider');
  return context;
};
