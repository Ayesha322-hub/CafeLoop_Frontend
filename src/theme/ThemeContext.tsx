import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ── Light & Dark palettes ─────────────────────────────
const LIGHT = {
  coffee: '#1C0A00',
  caramel: '#C68642',
  cream: '#FDF6EC',
  foam: '#FFF8F0',          // screen background
  card: '#FFFFFF',          // card background
  gold: '#E8A045',
  accent: '#FF6B35',
  text: '#1C0A00',          // primary text
  muted: '#8B6F5E',         // secondary text
  border: '#EDE0D4',
  success: '#2ECC71',
  isDark: false,
};

const DARK = {
  coffee: '#1C0A00',
  caramel: '#C68642',
  cream: '#FDF6EC',         // kept cream for header text (header stays brown in both modes)
  foam: '#15100C',          // dark screen background
  card: '#241B14',          // dark card background
  gold: '#E8A045',
  accent: '#FF6B35',
  text: '#FDF6EC',          // cream text on dark bg
  muted: '#B8A593',         // soft cream-grey for secondary text
  border: '#3A2E22',
  success: '#2ECC71',
  isDark: true,
};

type ThemeContextType = {
  theme: typeof LIGHT;
  darkMode: boolean;
  toggleDarkMode: (value: boolean) => void;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: LIGHT,
  darkMode: false,
  toggleDarkMode: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('darkMode').then((val) => {
      if (val === 'true') setDarkMode(true);
    });
  }, []);

  const toggleDarkMode = (value: boolean) => {
    setDarkMode(value);
    AsyncStorage.setItem('darkMode', value ? 'true' : 'false');
  };

  return (
    <ThemeContext.Provider value={{ theme: darkMode ? DARK : LIGHT, darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);