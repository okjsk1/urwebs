/**
 * Stealth Mode 테마 토큰
 * "업무툴처럼 안 튀는" 기본 테마 도입
 */

export interface StealthThemeTokens {
  colors: {
    bg: string;
    surface: string;
    surfaceMuted: string;
    textPrimary: string;
    textSecondary: string;
    border: string;
    accent: string;
    accentHover: string;
  };
  shadows: {
    default: string;
    none: string;
  };
  radius: {
    default: string;
    max: string;
  };
  spacing: {
    base: string;
    card: string;
    cardLarge: string;
  };
  typography: {
    fontSize: string;
    lineHeight: string;
    fontWeight: number;
    fontWeightHeader: number;
    fontFamily: string;
  };
  transitions: {
    duration: string;
    easing: string;
  };
}

export const stealthThemeLight: StealthThemeTokens = {
  colors: {
    bg: '#F5F6F7',
    surface: '#F9FAFB',
    surfaceMuted: '#F1F3F5',
    textPrimary: '#2F3437',
    textSecondary: '#5B6166',
    border: 'rgba(0, 0, 0, 0.05)',
    accent: '#5B6EA6', // 저채도 블루
    accentHover: 'rgba(91, 110, 166, 0.92)', // hover 시 투명도만 변경
  },
  shadows: {
    default: '0 1px 2px rgba(0, 0, 0, 0.04)',
    none: 'none',
  },
  radius: {
    default: '8px', // rounded-lg
    max: '12px',
  },
  spacing: {
    base: '8px',
    card: '16px',
    cardLarge: '24px',
  },
  typography: {
    fontSize: '14px',
    lineHeight: '1.55',
    fontWeight: 400,
    fontWeightHeader: 500,
    fontFamily: "'Pretendard', 'Inter', 'Noto Sans KR', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  transitions: {
    duration: '120ms',
    easing: 'ease-out',
  },
};

export const stealthThemeDark: StealthThemeTokens = {
  colors: {
    bg: '#0F1215',
    surface: '#15191D',
    surfaceMuted: '#101418',
    textPrimary: '#E7EAED',
    textSecondary: '#A8B0B8',
    border: 'rgba(255, 255, 255, 0.08)',
    accent: '#7CA0D3',
    accentHover: 'rgba(124, 160, 211, 0.88)',
  },
  shadows: {
    default: 'none',
    none: 'none',
  },
  radius: {
    default: '10px',
    max: '12px',
  },
  spacing: {
    base: '8px',
    card: '16px',
    cardLarge: '24px',
  },
  typography: {
    fontSize: '14px',
    lineHeight: '1.55',
    fontWeight: 400,
    fontWeightHeader: 500,
    fontFamily: "'Pretendard', 'Inter', 'Noto Sans KR', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  transitions: {
    duration: '120ms',
    easing: 'ease-out',
  },
};

/**
 * 테마 모드에 따라 토큰 반환
 */
export function getStealthTheme(mode: 'light' | 'dark'): StealthThemeTokens {
  return mode === 'light' ? stealthThemeLight : stealthThemeDark;
}

/**
 * CSS 변수 이름 생성 헬퍼
 */
export function stealthCSSVar(name: string): string {
  return `--stealth-${name}`;
}

