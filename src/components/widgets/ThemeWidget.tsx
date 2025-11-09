import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Sun, Moon, Monitor, Palette, Check } from 'lucide-react';
import { WidgetProps } from './utils/widget-helpers';
import { WidgetShell } from './WidgetShell';
import { useTheme, predefinedPalettes } from '../../contexts/ThemeContext';

type PaletteKey = keyof typeof predefinedPalettes;
type ThemeMode = 'light' | 'dark';

interface ThemeWidgetStateV1 {
  v: 1;
  autoSyncWithSystem: boolean;
  selectedPaletteKey?: PaletteKey;
}

const THEME_WIDGET_STORAGE_KEY = 'theme_widget_state_v1';
const DEFAULT_WIDGET_STATE: ThemeWidgetStateV1 = {
  v: 1,
  autoSyncWithSystem: false,
  selectedPaletteKey: 'default',
};

const resolvePalette = (key: PaletteKey | undefined, mode: ThemeMode) => {
  const entry = key ? predefinedPalettes[key] : undefined;
  if (entry && entry[mode]) {
    return entry[mode];
  }
  if (entry) {
    const fallback = mode === 'dark' ? entry.light : entry.dark;
    if (fallback) return fallback;
  }
  const defaultEntry = predefinedPalettes.default;
  return defaultEntry[mode] ?? defaultEntry.light;
};

const isPaletteEqual = (
  a: ReturnType<typeof resolvePalette>,
  b: ReturnType<typeof resolvePalette>
) => {
  if (!a || !b) return false;
  return (
    a.primary === b.primary &&
    a.secondary === b.secondary &&
    a.accent === b.accent &&
    a.background === b.background &&
    a.surface === b.surface &&
    a.text === b.text
  );
};

const readStoredState = (): ThemeWidgetStateV1 => {
  if (typeof window === 'undefined') return DEFAULT_WIDGET_STATE;
  try {
    const raw = window.localStorage.getItem(THEME_WIDGET_STORAGE_KEY);
    if (!raw) return DEFAULT_WIDGET_STATE;
    const parsed = JSON.parse(raw) as Partial<ThemeWidgetStateV1>;
    return {
      v: 1,
      autoSyncWithSystem:
        typeof parsed.autoSyncWithSystem === 'boolean'
          ? parsed.autoSyncWithSystem
          : DEFAULT_WIDGET_STATE.autoSyncWithSystem,
      selectedPaletteKey: (parsed.selectedPaletteKey && parsed.selectedPaletteKey in predefinedPalettes
        ? parsed.selectedPaletteKey
        : DEFAULT_WIDGET_STATE.selectedPaletteKey) as PaletteKey | undefined,
    };
  } catch {
    return DEFAULT_WIDGET_STATE;
  }
};

const PaletteSwatch = memo(function PaletteSwatch({
  name,
  colors,
}: {
  name: string;
  colors: { background: string; primary: string; accent: string; surface: string };
}) {
  return (
    <div className="flex items-center gap-1 max-w-full">
      <span
        className="inline-block w-3 h-3 rounded-sm border border-black/5"
        style={{ background: colors.background }}
        aria-hidden="true"
      />
      <span
        className="inline-block w-3 h-3 rounded-sm border border-black/5"
        style={{ background: colors.primary }}
        aria-hidden="true"
      />
      <span
        className="inline-block w-3 h-3 rounded-sm border border-black/5"
        style={{ background: colors.accent }}
        aria-hidden="true"
      />
      <span
        className="inline-block w-3 h-3 rounded-sm border border-black/5"
        style={{ background: colors.surface }}
        aria-hidden="true"
      />
      <span className="ml-1 text-[10px] text-gray-600 dark:text-gray-400 truncate max-w-[64px]">
        {name}
      </span>
    </div>
  );
});

export function ThemeWidget({ widget, isEditMode }: WidgetProps) {
  const {
    theme,
    toggleTheme,
    setColorPalette,
    colorPalette,
  } = useTheme();

  const [localState, setLocalState] = useState<ThemeWidgetStateV1>(() => readStoredState());
  const saveRef = useRef<number | null>(null);
  const paletteRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const paletteKeys = useMemo<PaletteKey[]>(
    () => Object.keys(predefinedPalettes) as PaletteKey[],
    []
  );
  const [focusIndex, setFocusIndex] = useState(() => {
    const initial = localState.selectedPaletteKey
      ? Math.max(0, paletteKeys.indexOf(localState.selectedPaletteKey))
      : 0;
    return initial;
  });

  const persistState = useCallback((stateToSave: ThemeWidgetStateV1) => {
    if (typeof window === 'undefined') return;
    if (saveRef.current) {
      window.clearTimeout(saveRef.current);
    }
    saveRef.current = window.setTimeout(() => {
      try {
        window.localStorage.setItem(
          THEME_WIDGET_STORAGE_KEY,
          JSON.stringify(stateToSave)
        );
      } catch {
        // ignore write errors
      }
      saveRef.current = null;
    }, 200);
  }, []);

  useEffect(
    () => () => {
      if (saveRef.current) {
        window.clearTimeout(saveRef.current);
      }
    },
    []
  );

  useEffect(() => {
    persistState(localState);
  }, [localState, persistState]);

  const applyPalette = useCallback(
    (key: PaletteKey) => {
      const palette = resolvePalette(key, theme);
      if (!palette) return;
      if (!isPaletteEqual(palette, colorPalette)) {
        setColorPalette(palette);
      }
      setLocalState((prev) => ({
        ...prev,
        selectedPaletteKey: key,
      }));
    },
    [colorPalette, setColorPalette, theme]
  );

  useEffect(() => {
    const key = localState.selectedPaletteKey ?? 'default';
    if (!paletteKeys.includes(key)) {
      setLocalState((prev) => ({
        ...prev,
        selectedPaletteKey: 'default',
      }));
      return;
    }
    const palette = resolvePalette(key, theme);
    if (palette && !isPaletteEqual(palette, colorPalette)) {
      setColorPalette(palette);
    }
  }, [localState.selectedPaletteKey, theme, setColorPalette, colorPalette, paletteKeys]);

  const syncWithSystem = useCallback(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if ((theme === 'dark') !== prefersDark) {
      toggleTheme();
    }
  }, [theme, toggleTheme]);

  useEffect(() => {
    if (!localState.autoSyncWithSystem) return;
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const prefersDark = mediaQuery.matches;
      if ((theme === 'dark') !== prefersDark) {
        toggleTheme();
      }
    };

    handleChange();

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, [localState.autoSyncWithSystem, theme, toggleTheme]);

  useEffect(() => {
    if (localState.autoSyncWithSystem) {
      syncWithSystem();
    }
  }, [localState.autoSyncWithSystem, syncWithSystem]);

  useEffect(() => {
    if (localState.selectedPaletteKey) {
      const index = paletteKeys.indexOf(localState.selectedPaletteKey);
      if (index >= 0) {
        setFocusIndex(index);
      }
    }
  }, [localState.selectedPaletteKey, paletteKeys]);

  const handleAutoSyncToggle = useCallback(() => {
    setLocalState((prev) => ({
      ...prev,
      autoSyncWithSystem: !prev.autoSyncWithSystem,
    }));
  }, []);

  const handlePaletteKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>, index: number, key: PaletteKey) => {
      if (!['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'Enter', ' '].includes(event.key)) {
        return;
      }

      const columns = 3;
      const total = paletteKeys.length;

      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        applyPalette(key);
        return;
      }

      let nextIndex = index;
      switch (event.key) {
        case 'ArrowRight':
          nextIndex = (index + 1) % total;
          break;
        case 'ArrowLeft':
          nextIndex = (index - 1 + total) % total;
          break;
        case 'ArrowDown':
          nextIndex = (index + columns) % total;
          break;
        case 'ArrowUp':
          nextIndex = (index - columns + total) % total;
          break;
        case 'Home':
          nextIndex = 0;
          break;
        case 'End':
          nextIndex = total - 1;
          break;
        default:
          break;
      }

      if (nextIndex !== index) {
        event.preventDefault();
        setFocusIndex(nextIndex);
        const nextButton = paletteRefs.current[nextIndex];
        nextButton?.focus();
      }
    },
    [applyPalette, paletteKeys]
  );

  const handlePaletteClick = useCallback(
    (key: PaletteKey, index: number) => {
      setFocusIndex(index);
      applyPalette(key);
    },
    [applyPalette]
  );

  const paletteLabelForTheme = useCallback(
    (key: PaletteKey) => `${String(key)} (${theme === 'dark' ? 'dark' : 'light'})`,
    [theme]
  );

  return (
    <WidgetShell
      title={widget.title || '테마 / 다크모드'}
      icon={theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
      size={(widget as any).size || '1x1'}
    >
      <div
        className="p-2 flex flex-col gap-2 text-sm"
        role="group"
        aria-label="테마 및 색상 팔레트 설정"
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
            aria-label="테마 전환"
            aria-pressed={theme === 'dark'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" aria-hidden="true" /> : <Moon className="w-4 h-4" aria-hidden="true" />}
            <span>{theme === 'dark' ? '라이트 모드' : '다크 모드'}</span>
          </button>
          <button
            type="button"
            onClick={syncWithSystem}
            className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
            title="시스템 선호도와 동기화"
            aria-label="시스템 선호도와 동기화"
          >
            <Monitor className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {isEditMode && (
          <button
            type="button"
            onClick={handleAutoSyncToggle}
            className="flex items-center justify-between gap-2 px-2 py-1.5 rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-xs text-gray-600 dark:text-gray-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
            role="switch"
            aria-checked={localState.autoSyncWithSystem}
            aria-label="자동 시스템 동기화"
          >
            <span>자동 시스템 동기화</span>
            <span
              className={`inline-flex h-4 w-7 items-center rounded-full transition-colors ${
                localState.autoSyncWithSystem ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-3 w-3 rounded-full bg-white transform transition-transform ${
                  localState.autoSyncWithSystem ? 'translate-x-3.5' : 'translate-x-0.5'
                }`}
                aria-hidden="true"
              />
            </span>
          </button>
        )}

        <div className="mt-1">
          <div className="flex items-center gap-2 mb-1 text-xs text-gray-500 dark:text-gray-400">
            <Palette className="w-3 h-3" aria-hidden="true" />
            <span>팔레트</span>
          </div>
          <div
            className="grid grid-cols-3 gap-1"
            role="grid"
            aria-label="색상 팔레트 목록"
          >
            {paletteKeys.map((key, index) => {
              const paletteVariant = resolvePalette(key, theme);
              const selected = localState.selectedPaletteKey === key;
              const swatchColors = {
                background: paletteVariant?.background ?? '#f5f5f5',
                primary: paletteVariant?.primary ?? '#3b82f6',
                accent: paletteVariant?.accent ?? '#10b981',
                surface: paletteVariant?.surface ?? '#e5e7eb',
              };

              return (
                <button
                  key={key}
                  ref={(el) => {
                    paletteRefs.current[index] = el;
                  }}
                  type="button"
                  role="gridcell"
                  tabIndex={focusIndex === index ? 0 : -1}
                  onFocus={() => setFocusIndex(index)}
                  onClick={() => handlePaletteClick(key, index)}
                  onKeyDown={(event) => handlePaletteKeyDown(event, index, key)}
                  aria-label={`${String(key)} 팔레트 적용 (${theme === 'dark' ? '다크' : '라이트'})`}
                  aria-pressed={selected}
                  className={`relative h-9 rounded border flex items-center justify-center text-xs focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 transition ${
                    selected
                      ? 'border-blue-500 ring-1 ring-blue-300 bg-blue-50/40 dark:bg-blue-900/40'
                      : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                  title={paletteLabelForTheme(key)}
                >
                  <PaletteSwatch
                    name={String(key)}
                    colors={swatchColors}
                  />
                  {selected && (
                    <span className="absolute top-1 right-1 text-blue-500 dark:text-blue-300" aria-hidden="true">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </WidgetShell>
  );
}