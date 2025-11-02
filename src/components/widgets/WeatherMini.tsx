// 날씨 위젯 - 1x1 컴팩트 레이아웃
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { WeatherState } from './hooks/useWeatherCore';
import { formatTemperature } from './utils/weatherFormat';

interface Props {
  state: WeatherState;
  isEditMode: boolean;
  setState: React.Dispatch<React.SetStateAction<WeatherState>>;
  widgetRef?: React.RefObject<HTMLDivElement>;
}

export function WeatherMini({ state, isEditMode, setState, widgetRef }: Props) {
  const cw = state.currentWeather;
  const isStealthMode = document.querySelector('[data-stealth-mode="true"]') !== null;

  const getWeatherColor = (condition: string | undefined) => {
    if (!condition) return isStealthMode ? 'text-gray-600' : 'text-gray-600';
    if (isStealthMode) {
      // 스텔스 모드: 다운톤 컬러
      if (condition.includes('맑음')) return 'text-gray-700';
      if (condition.includes('구름')) return 'text-gray-500';
      if (condition.includes('비')) return 'text-blue-700';
      if (condition.includes('눈')) return 'text-blue-500';
      return 'text-gray-600';
    }
    // 일반 모드
    if (condition.includes('맑음')) return 'text-yellow-600';
    if (condition.includes('구름')) return 'text-gray-600';
    if (condition.includes('비')) return 'text-blue-600';
    if (condition.includes('눈')) return 'text-blue-300';
    return 'text-gray-600';
  };

  return (
    <div
      ref={widgetRef}
      className="h-full p-1 flex flex-col items-center justify-center text-center min-h-0 bg-white dark:bg-gray-800"
    >
      {state.loading ? (
        <div className="w-full space-y-1">
          <div className="animate-pulse h-4 bg-gray-300 dark:bg-gray-600 rounded mb-1"></div>
          <div className="animate-pulse h-3 bg-gray-300 dark:bg-gray-600 rounded mb-1"></div>
          <div className="animate-pulse h-2 bg-gray-300 dark:bg-gray-600 rounded"></div>
        </div>
      ) : state.error ? (
        <div>
          <AlertCircle className="w-4 h-4 text-red-500 mx-auto mb-1" />
          <div className="text-[11px] text-red-600 dark:text-red-400">오류</div>
          <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
            {state.location?.name || '위치 없음'}
          </div>
        </div>
      ) : cw ? (
        <>
          <div className="text-xl mb-0.5">{cw.icon}</div>
          <div className={`text-sm font-semibold ${getWeatherColor(cw.condition)}`}>
            {formatTemperature(cw.temperature, state.units)}
          </div>
          <div className="text-[10px] text-gray-600 dark:text-gray-400">{cw.condition}</div>
          <div className="text-[10px] text-gray-500 dark:text-gray-500 mt-0.5">
            {cw.location?.name || state.location?.name || '위치 없음'}
          </div>
          {!state.isOnline && (
            <div className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5">오프라인</div>
          )}
        </>
      ) : (
        <div className="text-[11px] text-gray-500 dark:text-gray-400">날씨 정보 없음</div>
      )}
    </div>
  );
}

