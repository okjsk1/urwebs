import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark';
type ColorPalette = {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
};

interface ThemeContextType {
  theme: Theme;
  colorPalette: ColorPalette;
  toggleTheme: () => void;
  setColorPalette: (palette: ColorPalette) => void;
  setCustomColors: (colors: Partial<ColorPalette>) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// 기본 컬러 팔레트
const defaultLightPalette: ColorPalette = {
  primary: '#3B82F6', // blue-500
  secondary: '#8B5CF6', // violet-500
  accent: '#10B981', // emerald-500
  background: '#FFFFFF', // white
  surface: '#F8FAFC', // slate-50
  text: '#1F2937', // gray-800
};

const defaultDarkPalette: ColorPalette = {
  primary: '#60A5FA', // blue-400
  secondary: '#A78BFA', // violet-400
  accent: '#34D399', // emerald-400
  background: '#111827', // gray-900
  surface: '#1F2937', // gray-800
  text: '#F9FAFB', // gray-50
};

// 미리 정의된 컬러 팔레트들
export const predefinedPalettes = {
  default: {
    light: defaultLightPalette,
    dark: defaultDarkPalette,
  },
  ocean: {
    light: {
      primary: '#0EA5E9', // sky-500
      secondary: '#06B6D4', // cyan-500
      accent: '#0891B2', // cyan-600
      background: '#F0F9FF', // sky-50
      surface: '#E0F2FE', // sky-100
      text: '#0C4A6E', // sky-900
    },
    dark: {
      primary: '#38BDF8', // sky-400
      secondary: '#22D3EE', // cyan-400
      accent: '#06B6D4', // cyan-500
      background: '#0C4A6E', // sky-900
      surface: '#075985', // sky-800
      text: '#F0F9FF', // sky-50
    },
  },
  forest: {
    light: {
      primary: '#059669', // emerald-600
      secondary: '#16A34A', // green-600
      accent: '#65A30D', // lime-600
      background: '#F0FDF4', // green-50
      surface: '#DCFCE7', // green-100
      text: '#14532D', // green-900
    },
    dark: {
      primary: '#34D399', // emerald-400
      secondary: '#4ADE80', // green-400
      accent: '#A3E635', // lime-400
      background: '#14532D', // green-900
      surface: '#166534', // green-800
      text: '#F0FDF4', // green-50
    },
  },
  sunset: {
    light: {
      primary: '#EA580C', // orange-600
      secondary: '#DC2626', // red-600
      accent: '#D97706', // amber-600
      background: '#FFF7ED', // orange-50
      surface: '#FFEDD5', // orange-100
      text: '#9A3412', // orange-900
    },
    dark: {
      primary: '#FB923C', // orange-400
      secondary: '#F87171', // red-400
      accent: '#FBBF24', // amber-400
      background: '#9A3412', // orange-900
      surface: '#C2410C', // orange-800
      text: '#FFF7ED', // orange-50
    },
  },
  lavender: {
    light: {
      primary: '#7C3AED', // violet-600
      secondary: '#DB2777', // pink-600
      accent: '#A855F7', // purple-500
      background: '#FAF5FF', // violet-50
      surface: '#F3E8FF', // violet-100
      text: '#581C87', // violet-900
    },
    dark: {
      primary: '#A78BFA', // violet-400
      secondary: '#F472B6', // pink-400
      accent: '#C084FC', // purple-400
      background: '#581C87', // violet-900
      surface: '#6B21A8', // violet-800
      text: '#FAF5FF', // violet-50
    },
  },
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [colorPalette, setColorPaletteState] = useState<ColorPalette>(
    defaultLightPalette
  );

  // 로컬 스토리지에서 테마 설정 불러오기
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    const savedPalette = localStorage.getItem('colorPalette');
    
    if (savedTheme) {
      setTheme(savedTheme);
    }
    
    if (savedPalette) {
      try {
        const palette = JSON.parse(savedPalette);
        setColorPaletteState(palette);
      } catch (error) {
        console.error('Failed to parse saved color palette:', error);
      }
    }
  }, []);

  // 테마 변경 시 컬러 팔레트 업데이트
  useEffect(() => {
    if (theme === 'light') {
      setColorPaletteState(defaultLightPalette);
    } else {
      setColorPaletteState(defaultDarkPalette);
    }
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    console.log('테마 전환:', theme, '→', newTheme);
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const setColorPalette = (palette: ColorPalette) => {
    setColorPaletteState(palette);
    localStorage.setItem('colorPalette', JSON.stringify(palette));
  };

  const setCustomColors = (colors: Partial<ColorPalette>) => {
    const newPalette = { ...colorPalette, ...colors };
    setColorPaletteState(newPalette);
    localStorage.setItem('colorPalette', JSON.stringify(newPalette));
  };

  // CSS 변수 업데이트
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', colorPalette.primary);
    root.style.setProperty('--color-secondary', colorPalette.secondary);
    root.style.setProperty('--color-accent', colorPalette.accent);
    root.style.setProperty('--color-background', colorPalette.background);
    root.style.setProperty('--color-surface', colorPalette.surface);
    root.style.setProperty('--color-text', colorPalette.text);
    
    // 다크모드 클래스 추가/제거
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      console.log('🌙 다크모드 활성화:', document.documentElement.classList.contains('dark'));
    } else {
      document.documentElement.classList.remove('dark');
      console.log('☀️ 라이트모드 활성화:', !document.documentElement.classList.contains('dark'));
    }
  }, [theme, colorPalette]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        colorPalette,
        toggleTheme,
        setColorPalette,
        setCustomColors,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

