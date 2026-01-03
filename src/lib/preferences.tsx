import React, { createContext, useContext, useState, useEffect } from 'react';

interface PreferencesContextType {
  fontSize: number;
  setFontSize: (size: number) => void;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [fontSize, setFontSizeState] = useState<number>(16);

  useEffect(() => {
    const savedSize = localStorage.getItem('khaliq-font-size-px');
    
    if (savedSize) {
        setFontSizeState(parseInt(savedSize));
    } else {
        // Updated Logic per user request:
        // Mobile (< 768px): 12px
        // Desktop (>= 768px): 18px
        if (window.innerWidth < 768) {
            setFontSizeState(12); 
            document.documentElement.style.setProperty('--base-font-size', '12px');
        } else {
            setFontSizeState(18);
            document.documentElement.style.setProperty('--base-font-size', '18px');
        }
    }
  }, []);

  const setFontSize = (size: number) => {
    setFontSizeState(size);
    localStorage.setItem('khaliq-font-size-px', size.toString());
    
    // Apply CSS variable for global scaling
    document.documentElement.style.setProperty('--base-font-size', `${size}px`);
  };

  // Apply initial size on mount/change
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
