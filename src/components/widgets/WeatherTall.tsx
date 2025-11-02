// 날씨 위젯 - 1x2 레이아웃 (현재 + 시간별)
import React from 'react';
import { MapPin, RefreshCw, Settings, AlertCircle, WifiOff, Navigation } from 'lucide-react';
import { Button } from '../ui/button';
import { WeatherState } from './hooks/useWeatherCore';
import { formatTemperature } from './utils/weatherFormat';

interface Props {
  state: WeatherState;
  isEditMode: boolean;
  setState: React.Dispatch<React.SetStateAction<WeatherState>>;
  updateLocation: (locationName: string) => Promise<void>;
  detectCurrentLocation: () => Promise<void>;
  toggleUnits: () => void;
  widgetRef: React.RefObject<HTMLDivElement>;
}

export function WeatherTall({ state, isEditMode, setState, updateLocation, detectCurrentLocation, toggleUnits, widgetRef }: Props) {
  const cw = state.currentWeather;
  const isStealthMode = document.querySelector('[data-stealth-mode="true"]') !== null;

  const getWeatherColor = (condition: string | undefined) => {
    if (!condition) return isStealthMode ? 'text-gray-600' : 'text-gray-600';
    if (isStealthMode) {
      if (condition.includes('맑음')) return 'text-gray-700';
      if (condition.includes('구름')) return 'text-gray-500';
      if (condition.includes('비')) return 'text-blue-700';
      if (condition.includes('눈')) return 'text-blue-500';
      return 'text-gray-600';
    }
    if (condition.includes('맑음')) return 'text-yellow-600';
    if (condition.includes('구름')) return 'text-gray-600';
    if (condition.includes('비')) return 'text-blue-600';
    if (condition.includes('눈')) return 'text-blue-300';
    return 'text-gray-600';
  };

  return (
    <div
      ref={widgetRef}
      className="h-full p-2 flex flex-col min-h-0 overflow-hidden bg-white dark:bg-gray-800"
    >
      {/* 시뮬레이션 모드 배너 */}
      {(import.meta as any).env.VITE_OPENWEATHER_API_KEY === 'demo' && (
        <div className="mb-1 px-1 py-0.5 bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 rounded text-[10px] text-amber-800 dark:text-amber-200 text-center shrink-0">
          🧪 시뮬레이션 모드
        </div>
      )}

      {/* 상단 바 */}
      <div className="flex items-center justify-between mb-2 shrink-0">
        <div className="flex items-center gap-1">
          <MapPin className="w-3 h-3 text-gray-600 dark:text-gray-400" />
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {state.location?.name || '위치 없음'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {!state.isOnline && <WifiOff className="w-3 h-3 text-amber-500" />}
          {state.loading && <RefreshCw className="w-3 h-3 animate-spin text-gray-600 dark:text-gray-400" />}
          {isEditMode && (
            <Button
              size="sm"
              variant="ghost"
              className="h-4 w-4 p-0"
              onClick={() => setState(prev => ({ ...prev, showSettings: !prev.showSettings }))}
            >
              <Settings className="w-2 h-2" />
            </Button>
          )}
        </div>
      </div>

      {/* 설정 패널 */}
      {state.showSettings && (
        <div className="bg-white/70 dark:bg-gray-800/70 rounded p-2 mb-2 shrink-0">
          <div className="grid grid-cols-2 gap-1 mb-2">
            {['서울', '부산', '대구', '인천'].map(city => (
              <Button
                key={city}
                size="sm"
                variant="outline"
                className="text-xs h-4"
                onClick={() => updateLocation(city)}
              >
                {city}
              </Button>
            ))}
          </div>
          <div className="flex gap-1 mb-2">
            <input
              type="text"
              placeholder="도시명 입력"
              value={state.customLocation}
              onChange={(e) => setState(prev => ({ ...prev, customLocation: e.target.value }))}
              className="flex-1 text-xs px-1 py-0.5 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              onKeyPress={(e) => e.key === 'Enter' && updateLocation(state.customLocation)}
            />
            <Button
              size="sm"
              variant="outline"
              className="text-xs h-4 px-1"
              onClick={() => updateLocation(state.customLocation)}
            >
              설정
            </Button>
          </div>
          <div className="flex gap-1 mb-2">
            <Button
              size="sm"
              variant="outline"
              className="text-xs h-4 flex-1"
              onClick={detectCurrentLocation}
            >
              <Navigation className="w-2 h-2 mr-1" />
              현재위치
            </Button>
            <Button
              size="sm"
              variant={state.units === 'metric' ? 'default' : 'outline'}
              className="text-xs h-4 flex-1"
              onClick={toggleUnits}
            >
              {state.units === 'metric' ? '°C' : '°F'}
            </Button>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="w-full text-xs h-4"
            onClick={() => setState(prev => ({ ...prev, showSettings: false }))}
          >
            닫기
          </Button>
        </div>
      )}

      {/* 메인 컨텐츠 */}
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        {state.loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-gray-600 dark:text-gray-400" />
              <div className="text-xs text-gray-500 dark:text-gray-400">날씨 정보 로딩 중...</div>
            </div>
          </div>
        ) : state.error ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <AlertCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
              <div className="text-xs text-red-600 dark:text-red-400 mb-1">오류 발생</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{state.error}</div>
            </div>
          </div>
        ) : cw ? (
          <>
            {/* 현재 날씨 */}
            <div className="text-center mb-3 shrink-0">
              <div className="text-2xl mb-1">{cw.icon}</div>
              <div className={`text-lg font-semibold ${getWeatherColor(cw.condition)}`}>
                {formatTemperature(cw.temperature, state.units)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{cw.condition}</div>
              <div className="text-xs text-gray-500 dark:text-gray-500">
                체감 {formatTemperature(cw.feelsLike, state.units)}
              </div>
            </div>

            {/* 시간별 예보 */}
            <div className="flex-1 overflow-y-auto min-h-0">
              <div className="grid grid-cols-4 gap-1">
                {state.hourlyForecast.slice(0, 8).map((hour, index) => (
                  <div key={index} className="text-center">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(hour.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit' })}
                    </div>
                    <div className="text-sm">{hour.icon}</div>
                    <div className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                      {formatTemperature(hour.temperature, state.units)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-xs text-gray-500 dark:text-gray-400">날씨 정보 없음</div>
              <div className="text-xs text-gray-400 dark:text-gray-500">{state.location?.name || '위치 없음'}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

