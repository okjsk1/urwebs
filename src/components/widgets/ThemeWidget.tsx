import React, { useMemo } from 'react';
import { Sun, Moon, Monitor, Palette } from 'lucide-react';
import { WidgetProps } from './utils/widget-helpers';
import { WidgetShell } from './WidgetShell';
import { useTheme, predefinedPalettes } from '../../contexts/ThemeContext';

const PALETTES = Object.keys(predefinedPalettes) as Array<keyof typeof predefinedPalettes>;

export function ThemeWidget({ widget, isEditMode }: WidgetProps) {
  const { theme, toggleTheme, setColorPalette } = useTheme();

  const items = useMemo(() => PALETTES, []);

  return (
    <WidgetShell
      title={widget.title || '테마 / 다크모드'}
      icon={theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
      size={(widget as any).size || '1x1'}
    >
      <div className="p-2 flex flex-col gap-2 text-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
            aria-label="테마 전환"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            <span>{theme === 'dark' ? '라이트 모드' : '다크 모드'}</span>
          </button>
          <button
            onClick={() => {
              const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
              if ((theme === 'dark') !== prefersDark) toggleTheme();
            }}
            className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
            title="시스템 선호도와 동기화"
            aria-label="시스템 선호도"
          >
            <Monitor className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-1">
          <div className="flex items-center gap-2 mb-1 text-xs text-gray-500 dark:text-gray-400">
            <Palette className="w-3 h-3" />
            <span>팔레트</span>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {items.map(key => (
              <button
                key={key}
                onClick={() => setColorPalette(predefinedPalettes[key][theme])}
                className="h-8 rounded border border-gray-300 dark:border-gray-600 flex items-center justify-center text-xs hover:bg-gray-50 dark:hover:bg-gray-700"
                aria-label={`${key} 팔레트 적용`}
                title={`${key} (${theme})`}
              >
                {String(key)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </WidgetShell>
  );
}


