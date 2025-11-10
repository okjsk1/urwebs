// 날씨 위젯 - 3x1, 3x2, 3x3 레이아웃 (대형 가로형)
import React from 'react';
import { MapPin, RefreshCw, Settings, AlertCircle, WifiOff, Navigation, Droplets, Wind } from 'lucide-react';
import { Button } from '../ui/button';
import { WeatherState } from './hooks/useWeatherCore';
import { formatTemperature, formatWindSpeed, formatHumidity } from './utils/weatherFormat';

interface Props {
  state: WeatherState;
  isEditMode: boolean;
  setState: React.Dispatch<React.SetStateAction<WeatherState>>;
  updateLocation: (locationName: string) => Promise<void>;
  detectCurrentLocation: () => Promise<void>;
  toggleUnits: () => void;
  widgetRef: React.RefObject<HTMLDivElement>;
  height: number; // 그리드 높이 (1, 2, 3)
}

export function WeatherLarge({ state, isEditMode, setState, updateLocation, detectCurrentLocation, toggleUnits, widgetRef, height }: Props) {
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
      {/* 상단 바 */}
      <div className="flex items-center justify-between mb-2 shrink-0">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
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
        <div className="bg-white/70 dark:bg-gray-800/70 rounded p-2 mb-2 shrink-0">
          <div className="grid grid-cols-4 gap-1 mb-2">
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
          <div className="flex gap-2 mb-2">
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
          <div className="flex gap-2 mb-2">
            <Button
              size="sm"
              variant="outline"
              className="text-xs h-6 flex-1"
              onClick={detectCurrentLocation}
            >
              <Navigation className="w-3 h-3 mr-1" />
              현재위치
            </Button>
            <Button
              size="sm"
              variant={state.units === 'metric' ? 'default' : 'outline'}
              className="text-xs h-6 flex-1"
              onClick={toggleUnits}
            >
              {state.units === 'metric' ? '°C' : '°F'}
            </Button>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="w-full text-xs h-6"
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
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-gray-600 dark:text-gray-400" />
              <div className="text-sm text-gray-500 dark:text-gray-400">날씨 정보 로딩 중...</div>
            </div>
          </div>
        ) : state.error ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
              <div className="text-sm text-red-600 dark:text-red-400 mb-2">오류 발생</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{state.error}</div>
            </div>
          </div>
        ) : cw ? (
          <>
            {/* 현재 날씨 + 상세 정보 (상단) */}
            <div className="flex items-center gap-4 mb-3 shrink-0">
              <div className="text-center">
                <div className="text-4xl mb-1">{cw.icon}</div>
                <div className={`text-2xl font-bold mb-0.5 ${getWeatherColor(cw.condition)}`}>
                  {formatTemperature(cw.temperature, state.units)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{cw.condition}</div>
                <div className="text-xs text-gray-500 dark:text-gray-500">
                  체감 {formatTemperature(cw.feelsLike, state.units)}
                </div>
              </div>

              {height >= 2 && (
                <div className="grid grid-cols-2 gap-3 text-sm">
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
                </div>
              )}
            </div>

            {/* 시간별 예보 (중앙) */}
            {height >= 2 && (
              <div className="mb-3 shrink-0">
                <div className="text-xs font-semibold mb-2 text-gray-900 dark:text-gray-100">시간별 예보</div>
                <div className="grid grid-cols-6 gap-2">
                  {state.hourlyForecast.slice(0, 12).map((hour, index) => (
                    <div key={index} className="text-center">
                      <div className="text-[10px] text-gray-500 dark:text-gray-400">
                        {new Date(hour.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit' })}
                      </div>
                      <div className="text-base">{hour.icon}</div>
                      <div className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                        {formatTemperature(hour.temperature, state.units)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 일별 예보 (하단, 3x2, 3x3) */}
            {height >= 2 && (
              <div className="flex-1 overflow-y-auto min-h-0">
                <div className="text-xs font-semibold mb-2 text-gray-900 dark:text-gray-100">일별 예보</div>
                <div className="space-y-1">
                  {state.dailyForecast.slice(0, height === 2 ? 5 : 7).map((day, index) => (
                    <div key={index} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-10 text-gray-900 dark:text-gray-100">
                          {index === 0 ? '오늘' : 
                           index === 1 ? '내일' : 
                           new Date(day.timestamp).toLocaleDateString('ko-KR', { weekday: 'short' })}
                        </span>
                        <span className="text-base">{day.icon}</span>
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
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
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















