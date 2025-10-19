// 날씨 위젯 - 개선된 데이터 소스, 단위 변환, 위치 감지
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '../ui/button';
import { MapPin, RefreshCw, Settings, Thermometer, Droplets, Wind, Eye, Sunrise, Sunset, AlertCircle, Wifi, WifiOff, Navigation } from 'lucide-react';
import { WidgetProps, persistOrLocal, readLocal, showToast } from './utils/widget-helpers';
import { weatherService, WeatherLocation, CurrentWeather, HourlyForecast, DailyForecast } from '../../services/weatherService';
import { WeatherUnits, formatTemperature, formatWindSpeed, formatDistance, formatHumidity, formatPressure } from '../../utils/weatherUnits';

interface WeatherState {
  location: WeatherLocation;
  currentWeather: CurrentWeather | null;
  hourlyForecast: HourlyForecast[];
  dailyForecast: DailyForecast[];
  showHourly: boolean;
  showDaily: boolean;
  showSettings: boolean;
  customLocation: string;
  autoRefresh: boolean;
  refreshInterval: number; // minutes
  units: WeatherUnits;
  loading: boolean;
  error: string | null;
  lastUpdated: number;
  isOnline: boolean;
}

const DEFAULT_LOCATION: WeatherLocation = {
  name: '서울',
  lat: 37.5665,
  lon: 126.9780,
  timezone: 'Asia/Seoul'
};

export const WeatherWidget = ({ widget, isEditMode, updateWidget }: WidgetProps) => {
  const [state, setState] = useState(() => {
    const saved = readLocal(widget.id, {
      location: DEFAULT_LOCATION,
      currentWeather: null,
      hourlyForecast: [],
      dailyForecast: [],
      showHourly: false,
      showDaily: false,
      showSettings: false,
      customLocation: '서울',
      autoRefresh: true,
      refreshInterval: 10,
      units: 'metric' as WeatherUnits,
      loading: false,
      error: null,
      lastUpdated: 0,
      isOnline: navigator.onLine
    });
    
    // 기존 데이터 호환성 처리
    if (saved) {
      if (typeof saved.location === 'string') {
        saved.location = {
          name: saved.location,
          lat: DEFAULT_LOCATION.lat,
          lon: DEFAULT_LOCATION.lon,
          timezone: DEFAULT_LOCATION.timezone
        };
      } else if (!saved.location || typeof saved.location.lat !== 'number' || typeof saved.location.lon !== 'number') {
        saved.location = DEFAULT_LOCATION;
      }
    }
    
    return saved;
  });

  // 온라인 상태 감지
  useEffect(() => {
    const handleOnline = () => setState(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setState(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const refreshWeather = useCallback(async () => {
    if (state.loading) return;
    
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const [currentWeather, hourlyForecast, dailyForecast] = await Promise.all([
        weatherService.getCurrentWeather(state.location),
        weatherService.getHourlyForecast(state.location),
        weatherService.getDailyForecast(state.location)
      ]);
      
      setState(prev => ({
        ...prev,
        currentWeather,
        hourlyForecast,
        dailyForecast,
        loading: false,
        error: null,
        lastUpdated: Date.now()
      }));

      showToast('날씨 정보가 업데이트되었습니다', 'success');
    } catch (error) {
      console.error('날씨 정보 업데이트 실패:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : '날씨 정보를 가져올 수 없습니다'
      }));
      showToast('날씨 정보 업데이트에 실패했습니다', 'error');
    }
  }, [state.location, state.loading]);

  // 가시성 기반 자동 새로고침
  useEffect(() => {
    if (!state.autoRefresh) return;

    let timer: number | null = null;

    const tick = async () => {
      if (document.visibilityState === 'visible' && state.isOnline) {
        await refreshWeather();
      }
      timer = window.setTimeout(tick, state.refreshInterval * 60 * 1000);
    };

    const start = () => {
      if (document.visibilityState === 'visible') tick();
    };
    
    const stop = () => {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    };

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        stop();
      } else {
        start();
      }
    });

    start();
    return () => {
      stop();
      document.removeEventListener('visibilitychange', () => {});
    };
  }, [state.autoRefresh, state.refreshInterval, state.isOnline, refreshWeather]);

  // 자동 저장 (디바운스)
  useEffect(() => {
    const timer = setTimeout(() => {
      persistOrLocal(widget.id, state, updateWidget);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [widget.id, state, updateWidget]);

  // 초기 날씨 데이터 로드
  useEffect(() => {
    if (!state.currentWeather && !state.loading) {
      refreshWeather();
    }
  }, [refreshWeather, state.currentWeather, state.loading]);

  const updateLocation = useCallback(async (locationName: string) => {
    if (!locationName.trim()) {
      showToast('위치를 입력하세요', 'error');
      return;
    }

    try {
      const locations = await weatherService.searchLocation(locationName.trim());
      if (locations.length === 0) {
        showToast('해당 위치를 찾을 수 없습니다', 'error');
        return;
      }

      const newLocation = locations[0];
      setState(prev => ({
        ...prev,
        location: newLocation,
        customLocation: locationName.trim(),
        showSettings: false
      }));

      // 위치 변경 후 새로운 날씨 정보 가져오기
      await refreshWeather();
      showToast(`위치가 ${newLocation.name}으로 변경되었습니다`, 'success');
    } catch (error) {
      showToast('위치 검색에 실패했습니다', 'error');
    }
  }, [refreshWeather]);

  const detectCurrentLocation = useCallback(async () => {
    try {
      const location = await weatherService.getCurrentLocation();
      setState(prev => ({
        ...prev,
        location,
        customLocation: location.name,
        showSettings: false
      }));
      
      await refreshWeather();
      showToast('현재 위치로 설정되었습니다', 'success');
    } catch (error) {
      showToast('위치 감지에 실패했습니다. 위치 권한을 확인해주세요.', 'error');
    }
  }, [refreshWeather]);

  const toggleUnits = useCallback(() => {
    const newUnits = state.units === 'metric' ? 'imperial' : 'metric';
    setState(prev => ({
      ...prev,
      units: newUnits
    }));
    showToast(`단위가 ${newUnits === 'metric' ? '섭씨' : '화씨'}로 변경되었습니다`, 'success');
  }, [state.units]);

  const getWeatherColor = useCallback((condition: string | undefined) => {
    if (!condition) return 'text-gray-600';
    if (condition.includes('맑음')) return 'text-yellow-600';
    if (condition.includes('구름')) return 'text-gray-600';
    if (condition.includes('비')) return 'text-blue-600';
    if (condition.includes('눈')) return 'text-blue-300';
    return 'text-gray-600';
  }, []);

  const getBackgroundColor = useCallback((condition: string | undefined) => {
    if (!condition) return 'bg-gradient-to-br from-gray-100 to-gray-200';
    if (condition.includes('맑음')) return 'bg-gradient-to-br from-yellow-100 to-orange-100';
    if (condition.includes('구름')) return 'bg-gradient-to-br from-gray-100 to-gray-200';
    if (condition.includes('비')) return 'bg-gradient-to-br from-blue-100 to-blue-200';
    if (condition.includes('눈')) return 'bg-gradient-to-br from-blue-50 to-blue-100';
    return 'bg-gradient-to-br from-gray-100 to-gray-200';
  }, []);

  // 현재 날씨 데이터
  const currentWeather = state.currentWeather;
  
  // 위젯 크기 확인 (gridSize.h 기준)
  const widgetHeight = (widget as any)?.gridSize?.h || 1;

  // 1x1: 오늘 날씨만
  if (widgetHeight === 1) {
    return (
      <div className={`p-1 h-full flex flex-col justify-center ${currentWeather ? getBackgroundColor(currentWeather.condition) : 'bg-gray-100'}`}>
        {state.loading ? (
          <div className="text-center">
            <div className="animate-pulse h-4 bg-gray-300 rounded mb-1"></div>
            <div className="animate-pulse h-3 bg-gray-300 rounded mb-1"></div>
            <div className="animate-pulse h-2 bg-gray-300 rounded"></div>
          </div>
        ) : state.error ? (
          <div className="text-center">
            <AlertCircle className="w-4 h-4 text-red-500 mx-auto mb-1" />
            <div className="text-xs text-red-600">오류 발생</div>
            <div className="text-xs text-gray-500">{state.location?.name || '위치 없음'}</div>
          </div>
        ) : state.showSettings ? (
          <div className="bg-white/70 rounded p-1">
            <div className="grid grid-cols-2 gap-1">
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
            <div className="mt-1 flex gap-1">
              <input
                type="text"
                placeholder="도시명 입력"
                value={state.customLocation}
                onChange={(e) => setState(prev => ({ ...prev, customLocation: e.target.value }))}
                className="flex-1 text-xs px-1 py-0.5 border rounded"
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
            <div className="mt-1 flex gap-1">
              <Button
                size="sm"
                variant={state.units === 'metric' ? 'default' : 'outline'}
                className="text-xs h-4 flex-1"
                onClick={toggleUnits}
              >
                {state.units === 'metric' ? '°C' : '°F'}
              </Button>
              <Button
                size="sm"
                variant={state.autoRefresh ? 'default' : 'outline'}
                className="text-xs h-4 flex-1"
                onClick={() => setState(prev => ({ ...prev, autoRefresh: !prev.autoRefresh }))}
              >
                자동
              </Button>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="w-full text-xs h-4 mt-1"
              onClick={() => setState(prev => ({ ...prev, showSettings: false }))}
            >
              닫기
            </Button>
          </div>
        ) : currentWeather ? (
          <div className="text-center">
            <div className="text-lg mb-1">{currentWeather.icon}</div>
            <div className="text-sm font-semibold">{formatTemperature(currentWeather.temperature, state.units)}</div>
            <div className="text-xs text-gray-600">{currentWeather.condition}</div>
            <div className="text-xs text-gray-500">{currentWeather.location?.name || state.location?.name || '위치 없음'}</div>
            {!state.isOnline && (
              <div className="text-xs text-amber-600 mt-1">오프라인</div>
            )}
            {isEditMode && (
              <Button
                size="sm"
                variant="ghost"
                className="w-full text-xs h-4 mt-1"
                onClick={() => setState(prev => ({ ...prev, showSettings: true }))}
              >
                <Settings className="w-2 h-2" />
              </Button>
            )}
          </div>
        ) : (
          <div className="text-center">
            <div className="text-xs text-gray-500">날씨 정보 없음</div>
            <div className="text-xs text-gray-400">{state.location?.name || '위치 없음'}</div>
          </div>
        )}
      </div>
    );
  }

  // 1x2: 오늘 날씨 + 시간별 예보
  if (widgetHeight === 2) {
    return (
      <div className={`p-2 h-full flex flex-col ${currentWeather ? getBackgroundColor(currentWeather.condition) : 'bg-gray-100'}`}>
        <div className="flex items-center justify-between mb-2 shrink-0">
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            <span className="text-sm font-semibold">{state.location?.name || '위치 없음'}</span>
          </div>
          <div className="flex items-center gap-1">
            {!state.isOnline && <WifiOff className="w-3 h-3 text-amber-500" />}
            {state.loading && <RefreshCw className="w-3 h-3 animate-spin" />}
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

        {state.showSettings ? (
          <div className="bg-white/70 rounded p-2 mb-2">
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
                className="flex-1 text-xs px-1 py-0.5 border rounded"
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
        ) : null}

        {state.loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
              <div className="text-xs text-gray-500">날씨 정보 로딩 중...</div>
            </div>
          </div>
        ) : state.error ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <AlertCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
              <div className="text-xs text-red-600 mb-1">오류 발생</div>
              <div className="text-xs text-gray-500">{state.error}</div>
            </div>
          </div>
        ) : currentWeather ? (
          <>
            <div className="text-center mb-3">
              <div className="text-2xl mb-1">{currentWeather.icon}</div>
              <div className="text-lg font-semibold">{formatTemperature(currentWeather.temperature, state.units)}</div>
              <div className="text-sm text-gray-600">{currentWeather.condition}</div>
              <div className="text-xs text-gray-500">체감 {formatTemperature(currentWeather.feelsLike, state.units)}</div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-4 gap-1">
                {state.hourlyForecast.slice(0, 8).map((hour, index) => (
                  <div key={index} className="text-center">
                    <div className="text-xs text-gray-500">
                      {new Date(hour.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="text-sm">{hour.icon}</div>
                    <div className="text-xs font-semibold">{formatTemperature(hour.temperature, state.units)}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-xs text-gray-500">날씨 정보 없음</div>
              <div className="text-xs text-gray-400">{state.location?.name || '위치 없음'}</div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 1x3: 오늘 날씨 + 시간별 + 일별 예보
  return (
    <div className={`p-3 h-full flex flex-col ${currentWeather ? getBackgroundColor(currentWeather.condition) : 'bg-gray-100'}`}>
      <div className="flex items-center justify-between mb-3 shrink-0">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          <span className="font-semibold text-sm">{state.location?.name || '위치 없음'}</span>
        </div>
        <div className="flex items-center gap-1">
          {!state.isOnline && <WifiOff className="w-4 h-4 text-amber-500" />}
          {state.loading && <RefreshCw className="w-4 h-4 animate-spin" />}
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

      {state.showSettings ? (
        <div className="bg-white/70 rounded p-3 mb-3">
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
              className="flex-1 text-xs px-2 py-1 border rounded"
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
      ) : null}

      {state.loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3" />
            <div className="text-sm text-gray-500">날씨 정보 로딩 중...</div>
          </div>
        </div>
      ) : state.error ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
            <div className="text-sm text-red-600 mb-2">오류 발생</div>
            <div className="text-xs text-gray-500">{state.error}</div>
          </div>
        </div>
      ) : currentWeather ? (
        <>
          {/* 현재 날씨 */}
          <div className="text-center mb-4">
            <div className="text-4xl mb-2">{currentWeather.icon}</div>
            <div className="text-2xl font-bold mb-1">{formatTemperature(currentWeather.temperature, state.units)}</div>
            <div className="text-sm text-gray-600 mb-1">{currentWeather.condition}</div>
            <div className="text-xs text-gray-500">체감 {formatTemperature(currentWeather.feelsLike, state.units)}</div>
          </div>

          {/* 상세 정보 */}
          <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
            <div className="flex items-center gap-1">
              <Droplets className="w-3 h-3" />
              <span>{formatHumidity(currentWeather.humidity)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Wind className="w-3 h-3" />
              <span>{formatWindSpeed(currentWeather.windSpeed, state.units)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>{formatDistance(currentWeather.visibility, state.units)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Thermometer className="w-3 h-3" />
              <span>{formatPressure(currentWeather.pressure, state.units)}</span>
            </div>
          </div>

          {/* 시간별 예보 */}
          <div className="mb-4">
            <div className="text-xs font-semibold mb-2">시간별 예보</div>
            <div className="grid grid-cols-4 gap-1">
              {state.hourlyForecast.slice(0, 8).map((hour, index) => (
                <div key={index} className="text-center">
                  <div className="text-xs text-gray-500">
                    {new Date(hour.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="text-sm">{hour.icon}</div>
                  <div className="text-xs font-semibold">{formatTemperature(hour.temperature, state.units)}</div>
                  {hour.precipitation > 0 && (
                    <div className="text-xs text-blue-600">{hour.precipitation}mm</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 일별 예보 */}
          <div className="flex-1 overflow-y-auto">
            <div className="text-xs font-semibold mb-2">일별 예보</div>
            <div className="space-y-1">
              {state.dailyForecast.slice(0, 5).map((day, index) => (
                <div key={index} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-8">
                      {index === 0 ? '오늘' : 
                       index === 1 ? '내일' : 
                       new Date(day.timestamp).toLocaleDateString('ko-KR', { weekday: 'short' })}
                    </span>
                    <span className="text-sm">{day.icon}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">{formatTemperature(day.temperature.min, state.units)}</span>
                    <span className="font-semibold">{formatTemperature(day.temperature.max, state.units)}</span>
                    {day.precipitation > 0 && (
                      <span className="text-blue-600">{day.precipitation}mm</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-sm text-gray-500">날씨 정보 없음</div>
            <div className="text-xs text-gray-400">{state.location?.name || '위치 없음'}</div>
          </div>
        </div>
      )}
    </div>
  );
};