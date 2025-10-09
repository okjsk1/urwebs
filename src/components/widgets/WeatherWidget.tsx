// 날씨 위젯 - 실시간 날씨 정보, 시간별 예보, 위치 설정
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '../ui/button';
import { MapPin, RefreshCw, Settings, Thermometer, Droplets, Wind, Eye, Sunrise, Sunset } from 'lucide-react';
import { WidgetProps, persistOrLocal, readLocal, showToast } from './utils/widget-helpers';

interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  visibility: number;
  feelsLike: number;
  icon: string;
  lastUpdated: string;
}

interface HourlyForecast {
  time: string;
  temperature: number;
  condition: string;
  icon: string;
  precipitation: number;
}

interface DailyForecast {
  date: string;
  day: string;
  highTemp: number;
  lowTemp: number;
  condition: string;
  icon: string;
  precipitation: number;
}

interface WeatherState {
  weatherData: WeatherData;
  hourlyForecast: HourlyForecast[];
  dailyForecast: DailyForecast[];
  showHourly: boolean;
  showDaily: boolean;
  showSettings: boolean;
  customLocation: string;
  autoRefresh: boolean;
  refreshInterval: number; // minutes
  units: 'metric' | 'imperial';
}

const DEFAULT_WEATHER_DATA: WeatherData = {
  location: '서울',
  temperature: 22,
  condition: '맑음',
  humidity: 65,
  windSpeed: 12,
  visibility: 10,
  feelsLike: 24,
  icon: '☀️',
  lastUpdated: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
};

const SAMPLE_HOURLY_FORECAST: HourlyForecast[] = [
  { time: '14:00', temperature: 22, condition: '맑음', icon: '☀️', precipitation: 0 },
  { time: '15:00', temperature: 23, condition: '맑음', icon: '☀️', precipitation: 0 },
  { time: '16:00', temperature: 21, condition: '구름조금', icon: '⛅', precipitation: 0 },
  { time: '17:00', temperature: 20, condition: '구름많음', icon: '☁️', precipitation: 10 },
  { time: '18:00', temperature: 19, condition: '비', icon: '🌧️', precipitation: 80 },
  { time: '19:00', temperature: 18, condition: '비', icon: '🌧️', precipitation: 90 },
  { time: '20:00', temperature: 17, condition: '흐림', icon: '☁️', precipitation: 20 },
  { time: '21:00', temperature: 16, condition: '흐림', icon: '☁️', precipitation: 10 }
];

const SAMPLE_DAILY_FORECAST: DailyForecast[] = [
  { date: '2024-01-16', day: '화', highTemp: 25, lowTemp: 15, condition: '맑음', icon: '☀️', precipitation: 0 },
  { date: '2024-01-17', day: '수', highTemp: 23, lowTemp: 13, condition: '구름조금', icon: '⛅', precipitation: 10 },
  { date: '2024-01-18', day: '목', highTemp: 21, lowTemp: 11, condition: '비', icon: '🌧️', precipitation: 80 },
  { date: '2024-01-19', day: '금', highTemp: 19, lowTemp: 9, condition: '흐림', icon: '☁️', precipitation: 30 },
  { date: '2024-01-20', day: '토', highTemp: 22, lowTemp: 12, condition: '맑음', icon: '☀️', precipitation: 0 }
];

export const WeatherWidget: React.FC<WidgetProps> = ({ widget, isEditMode, updateWidget }) => {
  const [state, setState] = useState<WeatherState>(() => {
    const saved = readLocal(widget.id, {
      weatherData: DEFAULT_WEATHER_DATA,
      hourlyForecast: SAMPLE_HOURLY_FORECAST,
      dailyForecast: SAMPLE_DAILY_FORECAST,
      showHourly: false,
      showDaily: false,
      showSettings: false,
      customLocation: '서울',
      autoRefresh: true,
      refreshInterval: 10,
      units: 'metric' as const
    });
    return saved;
  });

  // 상태 저장 (수동으로만 호출)
  const saveState = useCallback(() => {
    persistOrLocal(widget.id, state, updateWidget);
  }, [widget.id, state, updateWidget]);

  // 자동 새로고침
  useEffect(() => {
    if (!state.autoRefresh) return;

    const interval = setInterval(() => {
      refreshWeather();
    }, state.refreshInterval * 60 * 1000);

    return () => clearInterval(interval);
  }, [state.autoRefresh, state.refreshInterval]);

  const refreshWeather = useCallback(() => {
    // 실제로는 날씨 API를 호출해야 하지만, 여기서는 시뮬레이션
    const newWeatherData = {
      ...state.weatherData,
      temperature: Math.floor(Math.random() * 15) + 15, // 15-30도
      humidity: Math.floor(Math.random() * 30) + 40, // 40-70%
      windSpeed: Math.floor(Math.random() * 20) + 5, // 5-25 km/h
      lastUpdated: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    };

    setState(prev => ({
      ...prev,
      weatherData: newWeatherData
    }));
    saveState();

    showToast('날씨 정보가 업데이트되었습니다', 'success');
  }, [state.weatherData]);

  const updateLocation = useCallback((location: string) => {
    if (!location.trim()) {
      showToast('위치를 입력하세요', 'error');
      return;
    }

    setState(prev => ({
      ...prev,
      weatherData: {
        ...prev.weatherData,
        location: location.trim(),
        lastUpdated: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
      },
      customLocation: location.trim(),
      showSettings: false
    }));
    saveState();

    showToast(`위치가 ${location}으로 변경되었습니다`, 'success');
  }, []);

  const toggleUnits = useCallback(() => {
    const newUnits = state.units === 'metric' ? 'imperial' : 'metric';
    setState(prev => ({
      ...prev,
      units: newUnits
    }));
    saveState();
    showToast(`단위가 ${newUnits === 'metric' ? '섭씨' : '화씨'}로 변경되었습니다`, 'success');
  }, [state.units]);

  const formatTemperature = useCallback((temp: number) => {
    if (state.units === 'imperial') {
      return `${Math.round(temp * 9/5 + 32)}°F`;
    }
    return `${temp}°C`;
  }, [state.units]);

  const formatWindSpeed = useCallback((speed: number) => {
    if (state.units === 'imperial') {
      return `${Math.round(speed * 0.621371)} mph`;
    }
    return `${speed} km/h`;
  }, [state.units]);

  const getWeatherColor = useCallback((condition: string) => {
    if (condition.includes('맑음')) return 'text-yellow-600';
    if (condition.includes('구름')) return 'text-gray-600';
    if (condition.includes('비')) return 'text-blue-600';
    if (condition.includes('눈')) return 'text-blue-300';
    return 'text-gray-600';
  }, []);

  const getBackgroundColor = useCallback((condition: string) => {
    if (condition.includes('맑음')) return 'bg-gradient-to-br from-yellow-100 to-orange-100';
    if (condition.includes('구름')) return 'bg-gradient-to-br from-gray-100 to-gray-200';
    if (condition.includes('비')) return 'bg-gradient-to-br from-blue-100 to-blue-200';
    if (condition.includes('눈')) return 'bg-gradient-to-br from-blue-50 to-blue-100';
    return 'bg-gradient-to-br from-gray-100 to-gray-200';
  }, []);

  return (
    <div className={`p-3 h-full ${getBackgroundColor(state.weatherData.condition)}`}>
      <div className="text-center mb-3">
        <div className="text-3xl mb-1">{state.weatherData.icon}</div>
        <h4 className="font-semibold text-sm text-gray-800">날씨</h4>
        <div className="flex items-center justify-center gap-1 text-xs text-gray-600">
          <MapPin className="w-3 h-3" />
          <span>{state.weatherData.location}</span>
        </div>
      </div>

      {/* 현재 날씨 */}
      <div className="text-center mb-3">
        <div className="text-3xl font-bold text-gray-800 mb-1">
          {formatTemperature(state.weatherData.temperature)}
        </div>
        <div className={`text-sm font-medium ${getWeatherColor(state.weatherData.condition)}`}>
          {state.weatherData.condition}
        </div>
        <div className="text-xs text-gray-600 mt-1">
          체감온도 {formatTemperature(state.weatherData.feelsLike)}
        </div>
      </div>

      {/* 날씨 정보 */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-white/50 rounded-lg p-2 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Droplets className="w-3 h-3 text-blue-600" />
            <span className="text-xs text-gray-600">습도</span>
          </div>
          <div className="text-sm font-bold text-gray-800">{state.weatherData.humidity}%</div>
        </div>
        
        <div className="bg-white/50 rounded-lg p-2 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Wind className="w-3 h-3 text-gray-600" />
            <span className="text-xs text-gray-600">바람</span>
          </div>
          <div className="text-sm font-bold text-gray-800">{formatWindSpeed(state.weatherData.windSpeed)}</div>
        </div>
        
        <div className="bg-white/50 rounded-lg p-2 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Eye className="w-3 h-3 text-purple-600" />
            <span className="text-xs text-gray-600">가시거리</span>
          </div>
          <div className="text-sm font-bold text-gray-800">{state.weatherData.visibility}km</div>
        </div>
        
        <div className="bg-white/50 rounded-lg p-2 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Thermometer className="w-3 h-3 text-red-600" />
            <span className="text-xs text-gray-600">온도</span>
          </div>
          <div className="text-sm font-bold text-gray-800">{formatTemperature(state.weatherData.temperature)}</div>
        </div>
      </div>

      {/* 시간별 예보 */}
      {state.showHourly && (
        <div className="mb-3">
          <div className="text-xs font-medium text-gray-600 mb-2">시간별 예보</div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {state.hourlyForecast.slice(0, 6).map((hour, index) => (
              <div key={index} className="bg-white/50 rounded-lg p-2 text-center min-w-[60px]">
                <div className="text-xs text-gray-600 mb-1">{hour.time}</div>
                <div className="text-lg mb-1">{hour.icon}</div>
                <div className="text-sm font-bold text-gray-800">{formatTemperature(hour.temperature)}</div>
                <div className="text-xs text-gray-600">{hour.precipitation}%</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 일별 예보 */}
      {state.showDaily && (
        <div className="mb-3">
          <div className="text-xs font-medium text-gray-600 mb-2">일별 예보</div>
          <div className="space-y-1">
            {state.dailyForecast.slice(0, 3).map((day, index) => (
              <div key={index} className="bg-white/50 rounded-lg p-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="text-lg">{day.icon}</div>
                  <div>
                    <div className="text-xs font-medium text-gray-800">{day.day}</div>
                    <div className="text-xs text-gray-600">{day.condition}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-800">
                    {formatTemperature(day.highTemp)} / {formatTemperature(day.lowTemp)}
                  </div>
                  <div className="text-xs text-gray-600">{day.precipitation}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 컨트롤 버튼 */}
      <div className="flex gap-1 mb-3">
        <Button
          size="sm"
          variant="outline"
          className="flex-1 h-6 text-xs"
          onClick={refreshWeather}
          aria-label="날씨 새로고침"
        >
          <RefreshCw className="w-3 h-3 mr-1" />
          새로고침
        </Button>
        
        <Button
          size="sm"
          variant="outline"
          className="flex-1 h-6 text-xs"
          onClick={() => {
            setState(prev => ({ ...prev, showHourly: !prev.showHourly }));
            saveState();
          }}
          aria-label="시간별 예보 토글"
        >
          시간별
        </Button>
        
        <Button
          size="sm"
          variant="outline"
          className="flex-1 h-6 text-xs"
          onClick={() => {
            setState(prev => ({ ...prev, showDaily: !prev.showDaily }));
            saveState();
          }}
          aria-label="일별 예보 토글"
        >
          일별
        </Button>
      </div>

      {/* 설정 */}
      {isEditMode && (
        <div className="space-y-2">
          <Button
            size="sm"
            variant="outline"
            className="w-full h-6 text-xs"
            onClick={() => {
              setState(prev => ({ ...prev, showSettings: !prev.showSettings }));
              saveState();
            }}
            aria-label="날씨 설정"
          >
            <Settings className="w-3 h-3 mr-1" />
            설정
          </Button>

          {state.showSettings && (
            <div className="bg-white/70 rounded-lg p-2 space-y-2">
              <div>
                <label className="text-xs text-gray-600">위치</label>
                <div className="flex gap-1">
                  <input
                    type="text"
                    value={state.customLocation}
                    onChange={(e) => {
                      setState(prev => ({ ...prev, customLocation: e.target.value }));
                      saveState();
                    }}
                    placeholder="도시명 입력"
                    className="flex-1 text-xs px-2 py-1 border border-gray-300 rounded"
                    aria-label="위치 입력"
                  />
                  <Button
                    size="sm"
                    className="h-6 text-xs"
                    onClick={() => updateLocation(state.customLocation)}
                  >
                    변경
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-xs text-gray-600">단위</label>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 text-xs"
                  onClick={toggleUnits}
                >
                  {state.units === 'metric' ? '섭씨' : '화씨'}
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-xs text-gray-600">자동 새로고침</label>
                <input
                  type="checkbox"
                  checked={state.autoRefresh}
                  onChange={(e) => {
                    setState(prev => ({ ...prev, autoRefresh: e.target.checked }));
                    saveState();
                  }}
                  className="w-3 h-3"
                />
              </div>

              {state.autoRefresh && (
                <div>
                  <label className="text-xs text-gray-600">새로고침 간격 (분)</label>
                  <select
                    value={state.refreshInterval}
                    onChange={(e) => {
                      setState(prev => ({ ...prev, refreshInterval: parseInt(e.target.value) }));
                      saveState();
                    }}
                    className="w-full text-xs px-2 py-1 border border-gray-300 rounded"
                  >
                    <option value={5}>5분</option>
                    <option value={10}>10분</option>
                    <option value={15}>15분</option>
                    <option value={30}>30분</option>
                  </select>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 마지막 업데이트 */}
      <div className="text-center text-xs text-gray-500 mt-2">
        마지막 업데이트: {state.weatherData.lastUpdated}
      </div>
    </div>
  );
};
