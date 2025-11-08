/**
 * URWEBS Design Tokens
 * - 통합된 라이트/다크 모드 팔레트
 * - Tailwind & Figma 양측에서 활용 가능한 스케일 정리
 * - '부드럽고 직관적'한 UI를 위한 기본 값 중심
 */

export type ThemeMode = 'light' | 'dark';

type ColorRamp = {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
};

type SemanticColorSet = {
  bg: {
    canvas: string;
    surface: string;
    surfaceMuted: string;
    elevated: string;
  };
  text: {
    primary: string;
    secondary: string;
    muted: string;
    inverse: string;
  };
  border: {
    subtle: string;
    default: string;
    strong: string;
  };
  state: {
    success: string;
    warning: string;
    danger: string;
    info: string;
  };
};

type RadiiScale = {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  full: string;
};

type ShadowScale = {
  none: string;
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  glow: string;
};

type FontScale = {
  family: {
    sans: string;
    mono: string;
  };
  size: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
  };
  weight: {
    regular: number;
    medium: number;
    semibold: number;
    bold: number;
  };
  lineHeight: {
    tight: number;
    base: number;
    relaxed: number;
  };
};

type SpacingScale = {
  none: string;
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
};

export interface DesignTokens {
  colorRamps: {
    primary: ColorRamp;
    accent: ColorRamp;
    neutral: ColorRamp;
    info: ColorRamp;
    success: ColorRamp;
    warning: ColorRamp;
    danger: ColorRamp;
  };
  semantic: SemanticColorSet;
  radii: RadiiScale;
  shadows: ShadowScale;
  spacing: SpacingScale;
  font: FontScale;
  blur: {
    sm: string;
    md: string;
    lg: string;
  };
  transition: {
    duration: {
      fast: string;
      normal: string;
      slow: string;
    };
    easing: {
      standard: string;
      entrance: string;
      exit: string;
    };
  };
}

const colorRampsLight: DesignTokens['colorRamps'] = {
  primary: {
    50: '#eef2ff',
    100: '#e0e7ff',
    200: '#c7d2fe',
    300: '#a5b4fc',
    400: '#818cf8',
    500: '#6366f1',
    600: '#4f46e5',
    700: '#4338ca',
    800: '#3730a3',
    900: '#312e81',
  },
  accent: {
    50: '#f5f5ff',
    100: '#e9edff',
    200: '#d8dcff',
    300: '#b4bffb',
    400: '#91a0f4',
    500: '#7386ec',
    600: '#5d6dd7',
    700: '#4c59b7',
    800: '#3f4a95',
    900: '#343c74',
  },
  neutral: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5f5',
    400: '#94a3b8',
    500: '#64748b',
    600: '#4b5563',
    700: '#334155',
    800: '#1f2937',
    900: '#0f172a',
  },
  info: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  danger: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
};

const colorRampsDark: DesignTokens['colorRamps'] = {
  primary: {
    50: '#f5f3ff',
    100: '#ede9fe',
    200: '#ddd6fe',
    300: '#c4b5fd',
    400: '#a78bfa',
    500: '#8b5cf6',
    600: '#7c3aed',
    700: '#6d28d9',
    800: '#5b21b6',
    900: '#4c1d95',
  },
  accent: {
    50: '#eef2ff',
    100: '#e0e7ff',
    200: '#c7d2fe',
    300: '#a5b4fc',
    400: '#818cf8',
    500: '#6366f1',
    600: '#4f46e5',
    700: '#4338ca',
    800: '#3730a3',
    900: '#312e81',
  },
  neutral: {
    50: '#111318',
    100: '#171b21',
    200: '#1e232b',
    300: '#252c36',
    400: '#2f3744',
    500: '#3f4a5a',
    600: '#4f5e71',
    700: '#61748b',
    800: '#7a8fa9',
    900: '#9eb3cc',
  },
  info: {
    50: '#0f172a',
    100: '#1e3a8a',
    200: '#1d4ed8',
    300: '#2563eb',
    400: '#3b82f6',
    500: '#60a5fa',
    600: '#93c5fd',
    700: '#bfdbfe',
    800: '#dbeafe',
    900: '#eff6ff',
  },
  success: {
    50: '#022c22',
    100: '#064e3b',
    200: '#047857',
    300: '#059669',
    400: '#10b981',
    500: '#34d399',
    600: '#6ee7b7',
    700: '#a7f3d0',
    800: '#d1fae5',
    900: '#ecfdf5',
  },
  warning: {
    50: '#422006',
    100: '#713f12',
    200: '#a16207',
    300: '#ca8a04',
    400: '#eab308',
    500: '#facc15',
    600: '#fde047',
    700: '#fef08a',
    800: '#fef9c3',
    900: '#fefce8',
  },
  danger: {
    50: '#450a0a',
    100: '#7f1d1d',
    200: '#991b1b',
    300: '#b91c1c',
    400: '#dc2626',
    500: '#ef4444',
    600: '#f87171',
    700: '#fca5a5',
    800: '#fecaca',
    900: '#fee2e2',
  },
};

const semanticLight: SemanticColorSet = {
  bg: {
    canvas: '#f6f7f9',
    surface: '#ffffff',
    surfaceMuted: '#eef1f6',
    elevated: '#fdfdff',
  },
  text: {
    primary: '#1d2130',
    secondary: '#3f4555',
    muted: '#6b7280',
    inverse: '#f8fafc',
  },
  border: {
    subtle: 'rgba(15, 23, 42, 0.08)',
    default: 'rgba(15, 23, 42, 0.12)',
    strong: 'rgba(15, 23, 42, 0.18)',
  },
  state: {
    success: '#16a34a',
    warning: '#d97706',
    danger: '#ef4444',
    info: '#2563eb',
  },
};

const semanticDark: SemanticColorSet = {
  bg: {
    canvas: '#0f1419',
    surface: '#141a20',
    surfaceMuted: '#1b232c',
    elevated: '#1f2933',
  },
  text: {
    primary: '#f3f4f6',
    secondary: '#cbd5f5',
    muted: '#94a3b8',
    inverse: '#0f1419',
  },
  border: {
    subtle: 'rgba(226, 232, 240, 0.12)',
    default: 'rgba(226, 232, 240, 0.16)',
    strong: 'rgba(226, 232, 240, 0.24)',
  },
  state: {
    success: '#34d399',
    warning: '#facc15',
    danger: '#f87171',
    info: '#60a5fa',
  },
};

const radii: RadiiScale = {
  xs: '6px', // input, chip
  sm: '10px', // 버튼, 카드
  md: '16px', // 다이얼로그, 모달
  lg: '20px', // 대형 카드
  xl: '28px', // 히어로 블록
  full: '999px', // pill
};

const shadows: ShadowScale = {
  none: 'none',
  xs: '0 1px 2px rgba(15, 23, 42, 0.06)',
  sm: '0 6px 16px rgba(15, 23, 42, 0.08)',
  md: '0 12px 32px rgba(15, 23, 42, 0.12)',
  lg: '0 18px 44px rgba(15, 23, 42, 0.14)',
  xl: '0 24px 48px rgba(15, 23, 42, 0.18)',
  glow: '0 0 0 6px rgba(99, 102, 241, 0.16)',
};

const spacing: SpacingScale = {
  none: '0px',
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  '2xl': '32px',
};

const font: FontScale = {
  family: {
    sans: "'Pretendard', 'Inter', 'Noto Sans KR', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "'Fira Code', 'Roboto Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
  size: {
    xs: '12px',
    sm: '13px',
    md: '15px',
    lg: '17px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '32px',
  },
  weight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.3,
    base: 1.55,
    relaxed: 1.75,
  },
};

const blur = {
  sm: '6px',
  md: '14px',
  lg: '28px',
};

const transition = {
  duration: {
    fast: '120ms',
    normal: '180ms',
    slow: '260ms',
  },
  easing: {
    standard: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
    entrance: 'cubic-bezier(0.16, 1, 0.3, 1)',
    exit: 'cubic-bezier(0.4, 0, 1, 1)',
  },
};

const lightTokens: DesignTokens = {
  colorRamps: colorRampsLight,
  semantic: semanticLight,
  radii,
  shadows,
  spacing,
  font,
  blur,
  transition,
};

const darkTokens: DesignTokens = {
  colorRamps: colorRampsDark,
  semantic: semanticDark,
  radii,
  shadows,
  spacing,
  font,
  blur,
  transition,
};

export const designTokens: Record<ThemeMode, DesignTokens> = {
  light: lightTokens,
  dark: darkTokens,
};

export const getDesignTokens = (mode: ThemeMode): DesignTokens => designTokens[mode];

/**
 * Tailwind theme.extend 예시
 * - tailwind.config.js 의 extend에 펼쳐서 사용할 수 있는 객체
 */
export const tailwindThemeExtend = {
  colors: {
    primary: {
      DEFAULT: 'var(--color-primary-500)',
      50: 'var(--color-primary-50)',
      100: 'var(--color-primary-100)',
      200: 'var(--color-primary-200)',
      300: 'var(--color-primary-300)',
      400: 'var(--color-primary-400)',
      500: 'var(--color-primary-500)',
      600: 'var(--color-primary-600)',
      700: 'var(--color-primary-700)',
      800: 'var(--color-primary-800)',
      900: 'var(--color-primary-900)',
    },
    accent: {
      DEFAULT: 'var(--color-accent-500)',
      50: 'var(--color-accent-50)',
      100: 'var(--color-accent-100)',
      200: 'var(--color-accent-200)',
      300: 'var(--color-accent-300)',
      400: 'var(--color-accent-400)',
      500: 'var(--color-accent-500)',
      600: 'var(--color-accent-600)',
      700: 'var(--color-accent-700)',
      800: 'var(--color-accent-800)',
      900: 'var(--color-accent-900)',
    },
    surface: {
      canvas: 'var(--color-bg-canvas)',
      base: 'var(--color-bg-surface)',
      muted: 'var(--color-bg-surface-muted)',
      elevated: 'var(--color-bg-elevated)',
    },
    text: {
      primary: 'var(--color-text-primary)',
      secondary: 'var(--color-text-secondary)',
      muted: 'var(--color-text-muted)',
      inverse: 'var(--color-text-inverse)',
    },
    border: {
      subtle: 'var(--color-border-subtle)',
      DEFAULT: 'var(--color-border-default)',
      strong: 'var(--color-border-strong)',
    },
    success: 'var(--color-success)',
    warning: 'var(--color-warning)',
    danger: 'var(--color-danger)',
    info: 'var(--color-info)',
  },
  borderRadius: radii,
  boxShadow: {
    ...shadows,
    focus: shadows.glow,
  },
  fontFamily: {
    sans: font.family.sans,
    mono: font.family.mono,
  },
  fontSize: font.size,
  lineHeight: font.lineHeight,
  spacing,
  backdropBlur: blur,
  transitionDuration: transition.duration,
  transitionTimingFunction: transition.easing,
};

/**
 * CSS 변수 세트를 생성하여 :root / .dark에 바인딩하기 위한 헬퍼
 * - Tailwind & CSS-in-JS 양쪽에서 동일한 값 활용
 */
export const buildCSSVariables = (mode: ThemeMode): Record<string, string> => {
  const tokens = getDesignTokens(mode);
  const entries: Record<string, string> = {};

  const prefix = (name: string) => `--color-${name}`;

  const pushColorRamp = (name: string, ramp: ColorRamp) => {
    Object.entries(ramp).forEach(([step, value]) => {
      entries[`${prefix(name)}-${step}`] = value;
    });
  };

  pushColorRamp('primary', tokens.colorRamps.primary);
  pushColorRamp('accent', tokens.colorRamps.accent);
  pushColorRamp('neutral', tokens.colorRamps.neutral);
  pushColorRamp('info', tokens.colorRamps.info);
  pushColorRamp('success-ramp', tokens.colorRamps.success);
  pushColorRamp('warning-ramp', tokens.colorRamps.warning);
  pushColorRamp('danger-ramp', tokens.colorRamps.danger);

  entries['--color-bg-canvas'] = tokens.semantic.bg.canvas;
  entries['--color-bg-surface'] = tokens.semantic.bg.surface;
  entries['--color-bg-surface-muted'] = tokens.semantic.bg.surfaceMuted;
  entries['--color-bg-elevated'] = tokens.semantic.bg.elevated;

  entries['--color-text-primary'] = tokens.semantic.text.primary;
  entries['--color-text-secondary'] = tokens.semantic.text.secondary;
  entries['--color-text-muted'] = tokens.semantic.text.muted;
  entries['--color-text-inverse'] = tokens.semantic.text.inverse;

  entries['--color-border-subtle'] = tokens.semantic.border.subtle;
  entries['--color-border-default'] = tokens.semantic.border.default;
  entries['--color-border-strong'] = tokens.semantic.border.strong;

  entries['--color-success'] = tokens.semantic.state.success;
  entries['--color-warning'] = tokens.semantic.state.warning;
  entries['--color-danger'] = tokens.semantic.state.danger;
  entries['--color-info'] = tokens.semantic.state.info;

  return entries;
};


