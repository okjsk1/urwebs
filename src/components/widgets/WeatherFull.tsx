// 날씨 위젯 - 1x3+ 레이아웃 (현재 + 상세 + 시간별 + 일별)
import React from 'react';
import { MapPin, RefreshCw, Settings, AlertCircle, WifiOff, Navigation, Thermometer, Droplets, Wind, Eye } from 'lucide-react';
import { Button } from '../ui/button';
import { WeatherState } from './hooks/useWeatherCore';
import { formatTemperature, formatWindSpeed, formatDistance, formatHumidity, formatPressure } from './utils/weatherFormat';

interface Props {
  state: WeatherState;
  isEditMode: boolean;
  setState: React.Dispatch<React.SetStateAction<WeatherState>>;
  updateLocation: (locationName: string) => Promise<void>;
  detectCurrentLocation: () => Promise<void>;
  toggleUnits: () => void;
  widgetRef: React.RefObject<HTMLDivElement>;
}

export function WeatherFull({ state, isEditMode, setState, updateLocation, detectCurrentLocation, toggleUnits, widgetRef }: Props) {
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
      className="h-full p-3 flex flex-col min-h-0 overflow-hidden bg-white dark:bg-gray-800"
    >
      {/* 시뮬레이션 모드 배너 */}
      {(import.meta as any).env.VITE_OPENWEATHER_API_KEY === 'demo' && (
        <div className="mb-2 px-2 py-1 bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 rounded text-xs text-amber-800 dark:text-amber-200 text-center shrink-0">
          🧪 시뮬레이션 모드 (개발 환경)
        </div>
      )}

      {/* 상단 바 */}
      <div className="flex items-center justify-between mb-3 shrink-0">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">
            {state.location?.name || '위치 없음'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {!state.isOnline && <WifiOff className="w-4 h-4 text-amber-500" />}
          {state.loading && <RefreshCw className="w-4 h-4 animate-spin text-gray-600 dark:text-gray-400" />}
          {isEditMode && (
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={() => setState(prev => ({ ...prev, showSettings: !prev.showSettings }))}
            >
              <Settings className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>

      {/* 설정 패널 */}
      {state.showSettings && (
        <div className="bg-white/70 dark:bg-gray-800/70 rounded p-3 mb-3 shrink-0">
          <div className="grid grid-cols-2 gap-2 mb-3">
            {['서울', '부산', '대구', '인천'].map(city => (
              <Button
                key={city}
                size="sm"
                variant="outline"
                className="text-xs h-6"
                onClick={() => updateLocation(city)}
              >
                {city}
              </Button>
            ))}
          </div>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              placeholder="도시명 입력"
              value={state.customLocation}
              onChange={(e) => setState(prev => ({ ...prev, customLocation: e.target.value }))}
              className="flex-1 text-xs px-2 py-1 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              onKeyPress={(e) => e.key === 'Enter' && updateLocation(state.customLocation)}
            />
            <Button
              size="sm"
              variant="outline"
              className="text-xs h-6 px-2"
              onClick={() => updateLocation(state.customLocation)}
            >
              설정
            </Button>
          </div>
          <div className="flex gap-2 mb-3">
            <Button
              size="sm"
              variant="outline"
              className="text-sm h-8 flex-1"
              onClick={detectCurrentLocation}
            >
              <Navigation className="w-4 h-4 mr-1" />
              현재위치
            </Button>
            <Button
              size="sm"
              variant={state.units === 'metric' ? 'default' : 'outline'}
              className="text-sm h-8 flex-1"
              onClick={toggleUnits}
            >
              {state.units === 'metric' ? '°C' : '°F'}
            </Button>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="w-full text-sm h-8"
            onClick={() => setState(prev => ({ ...prev, showSettings: false }))}
          >
            닫기
          </Button>
        </div>
      )}

      {/* 메인 컨텐츠 */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {state.loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-gray-600 dark:text-gray-400" />
              <div className="text-sm text-gray-500 dark:text-gray-400">날씨 정보 로딩 중...</div>
            </div>
          </div>
        ) : state.error ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
              <div className="text-sm text-red-600 dark:text-red-400 mb-2">오류 발생</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{state.error}</div>
            </div>
          </div>
        ) : cw ? (
          <>
            {/* 현재 날씨 */}
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">{cw.icon}</div>
              <div className={`text-2xl font-bold mb-1 ${getWeatherColor(cw.condition)}`}>
                {formatTemperature(cw.temperature, state.units)}
              </div>
              <div className="text-base text-gray-700 dark:text-gray-300 mb-1 font-medium">{cw.condition}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                체감 {formatTemperature(cw.feelsLike, state.units)}
              </div>
            </div>

            {/* 상세 정보 */}
            <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-blue-500" />
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {formatHumidity(cw.humidity)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Wind className="w-4 h-4 text-gray-500" />
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {formatWindSpeed(cw.windSpeed, state.units)}
                </span>
              </div>
              {/* 가시거리와 기압 정보 제거 (km, hPa 단위 제거 요청) */}
            </div>

            {/* 시간별 예보 */}
            <div className="mb-4">
              <div className="text-sm font-semibold mb-3 text-gray-900 dark:text-gray-100">시간별 예보</div>
              <div className="grid grid-cols-4 gap-2">
                {state.hourlyForecast.filter((_, i) => i % 3 === 0).slice(0, 8).map((hour, index) => (
                  <div key={index} className="text-center space-y-1">
                    <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                      {new Date(hour.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit' })}
                    </div>
                    <div className="text-lg">{hour.icon}</div>
                    <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                      {formatTemperature(hour.temperature, state.units)}
                    </div>
                    {hour.precipitation > 0 && (
                      <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                        {hour.precipitation}mm
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 일별 예보 */}
            <div>
              <div className="text-xs font-semibold mb-2 text-gray-900 dark:text-gray-100">일별 예보</div>
              <div className="space-y-1">
                {state.dailyForecast.slice(0, 5).map((day, index) => (
                  <div key={index} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-8 text-gray-900 dark:text-gray-100">
                        {index === 0 ? '오늘' : 
                         index === 1 ? '내일' : 
                         new Date(day.timestamp).toLocaleDateString('ko-KR', { weekday: 'short' })}
                      </span>
                      <span className="text-sm">{day.icon}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-gray-400">
                        {formatTemperature(day.temperature.min, state.units)}
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {formatTemperature(day.temperature.max, state.units)}
                      </span>
                      {day.precipitation > 0 && (
                        <span className="text-blue-600 dark:text-blue-400">{day.precipitation}mm</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="text-sm text-gray-500 dark:text-gray-400">날씨 정보 없음</div>
              <div className="text-xs text-gray-400 dark:text-gray-500">{state.location?.name || '위치 없음'}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

