// 날씨 위젯 - 2x1, 2x2, 2x3 레이아웃 (가로형)
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
  width: number; // 그리드 너비 (2 또는 3)
  height: number; // 그리드 높이 (1, 2, 3)
}

export function WeatherWide({ state, isEditMode, setState, updateLocation, detectCurrentLocation, toggleUnits, widgetRef, width, height }: Props) {
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
      {/* 상단 바 */}
      <div className="flex items-center justify-between mb-2 shrink-0">
        <div className="flex items-center gap-1">
          <MapPin className="w-3 h-3 text-gray-600 dark:text-gray-400" />
          <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">
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
        <div className="bg-white/70 dark:bg-gray-800/70 rounded p-1.5 mb-2 shrink-0 text-xs">
          <div className="grid grid-cols-2 gap-1 mb-1.5">
            {['서울', '부산', '대구', '인천'].map(city => (
              <Button
                key={city}
                size="sm"
                variant="outline"
                className="text-[10px] h-4"
                onClick={() => updateLocation(city)}
              >
                {city}
              </Button>
            ))}
          </div>
          <div className="flex gap-1 mb-1.5">
            <input
              type="text"
              placeholder="도시명"
              value={state.customLocation}
              onChange={(e) => setState(prev => ({ ...prev, customLocation: e.target.value }))}
              className="flex-1 text-[10px] px-1 py-0.5 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              onKeyPress={(e) => e.key === 'Enter' && updateLocation(state.customLocation)}
            />
            <Button
              size="sm"
              variant="outline"
              className="text-[10px] h-4 px-1"
              onClick={() => updateLocation(state.customLocation)}
            >
              설정
            </Button>
          </div>
          <div className="flex gap-1 mb-1.5">
            <Button
              size="sm"
              variant="outline"
              className="text-[10px] h-4 flex-1"
              onClick={detectCurrentLocation}
            >
              <Navigation className="w-2 h-2 mr-0.5" />
              현재위치
            </Button>
            <Button
              size="sm"
              variant={state.units === 'metric' ? 'default' : 'outline'}
              className="text-[10px] h-4 flex-1"
              onClick={toggleUnits}
            >
              {state.units === 'metric' ? '°C' : '°F'}
            </Button>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="w-full text-[10px] h-4"
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
              <div className="text-[10px] text-gray-500 dark:text-gray-400">{state.error}</div>
            </div>
          </div>
        ) : cw ? (
          <div className="flex-1 flex items-center gap-3">
            {/* 현재 날씨 (왼쪽) */}
            <div className="flex-shrink-0 text-center">
              <div className="text-3xl mb-1">{cw.icon}</div>
              <div className={`text-xl font-bold mb-0.5 ${getWeatherColor(cw.condition)}`}>
                {formatTemperature(cw.temperature, state.units)}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">{cw.condition}</div>
              <div className="text-[10px] text-gray-500 dark:text-gray-500">
                체감 {formatTemperature(cw.feelsLike, state.units)}
              </div>
            </div>

            {/* 상세 정보 (중앙/오른쪽) - height가 1일 때도 표시 */}
            <div className="flex-1 flex items-center gap-2">
              {height === 1 ? (
                // 2x1, 3x1일 때는 한 줄로 습도, 풍속, 시간별 예보 표시
                <>
                  <div className="flex items-center gap-1 text-xs">
                    <Droplets className="w-3 h-3 text-blue-500" />
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {formatHumidity(cw.humidity)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <Wind className="w-3 h-3 text-gray-500" />
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {formatWindSpeed(cw.windSpeed, state.units)}
                    </span>
                  </div>
                  {/* 시간별 예보 (간략) */}
                  <div className="flex items-center gap-2 ml-auto">
                    {state.hourlyForecast.filter((_, i) => i % 3 === 0).slice(0, width === 2 ? 4 : 6).map((hour, index) => (
                      <div key={index} className="text-center">
                        <div className="text-[8px] text-gray-500 dark:text-gray-400">
                          {new Date(hour.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit' })}
                        </div>
                        <div className="text-lg">{hour.icon}</div>
                        <div className="text-[9px] font-semibold text-gray-900 dark:text-gray-100">
                          {formatTemperature(hour.temperature, state.units)}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                // height >= 2일 때는 기존 레이아웃
                <>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      <Droplets className="w-3 h-3 text-blue-500" />
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {formatHumidity(cw.humidity)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Wind className="w-3 h-3 text-gray-500" />
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {formatWindSpeed(cw.windSpeed, state.units)}
                      </span>
                    </div>
                  </div>
                  {/* 시간별 예보 (오른쪽) */}
                  {width >= 2 && (
                    <div className="flex-shrink-0 ml-auto">
                      <div className="text-[10px] font-semibold mb-1 text-gray-900 dark:text-gray-100">시간별</div>
                      <div className={`grid ${width === 2 ? 'grid-cols-4' : 'grid-cols-6'} gap-1`}>
                        {state.hourlyForecast.filter((_, i) => i % 3 === 0).slice(0, width === 2 ? 4 : 6).map((hour, index) => (
                          <div key={index} className="text-center">
                            <div className="text-[9px] text-gray-500 dark:text-gray-400">
                              {new Date(hour.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit' })}
                            </div>
                            <div className="text-xs">{hour.icon}</div>
                            <div className="text-[10px] font-semibold text-gray-900 dark:text-gray-100">
                              {formatTemperature(hour.temperature, state.units)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* 일별 예보 (하단, 3x2, 3x3) */}
            {width >= 3 && height >= 2 && (
              <div className="mt-2 shrink-0">
                <div className="text-[10px] font-semibold mb-1 text-gray-900 dark:text-gray-100">일별 예보</div>
                <div className="space-y-0.5">
                  {state.dailyForecast.slice(0, height === 2 ? 3 : 5).map((day, index) => (
                    <div key={index} className="flex items-center justify-between text-[10px]">
                      <div className="flex items-center gap-1">
                        <span className="w-8 text-gray-900 dark:text-gray-100">
                          {index === 0 ? '오늘' : 
                           index === 1 ? '내일' : 
                           new Date(day.timestamp).toLocaleDateString('ko-KR', { weekday: 'short' })}
                        </span>
                        <span className="text-xs">{day.icon}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-gray-500 dark:text-gray-400">
                          {formatTemperature(day.temperature.min, state.units)}
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                          {formatTemperature(day.temperature.max, state.units)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-xs text-gray-500 dark:text-gray-400">날씨 정보 없음</div>
              <div className="text-[10px] text-gray-400 dark:text-gray-500">{state.location?.name || '위치 없음'}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
