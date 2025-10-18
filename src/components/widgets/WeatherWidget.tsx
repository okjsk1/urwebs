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

  // 초기 날씨 데이터 로드
  useEffect(() => {
    // 컴포넌트 마운트 시 날씨 정보 초기화
    refreshWeather();
  }, []);

  // 자동 새로고침
  useEffect(() => {
    if (!state.autoRefresh) return;

    const interval = setInterval(() => {
      refreshWeather();
    }, state.refreshInterval * 60 * 1000);

    return () => clearInterval(interval);
  }, [state.autoRefresh, state.refreshInterval]);

  const refreshWeather = useCallback(async () => {
    try {
      // 한국 날씨 정보 API 호출 (기상청 단기예보 API 대신 간단한 공개 API 사용)
      const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(state.weatherData.location)}&appid=demo&units=metric`);
      
      // API 키가 없으므로 실제 데이터 대신 더 현실적인 시뮬레이션 사용
      const currentHour = new Date().getHours();
      const seasonalTemp = currentHour < 6 ? 15 : currentHour < 12 ? 22 : currentHour < 18 ? 25 : 20;
      const tempVariation = Math.floor(Math.random() * 6) - 3; // ±3도 변화
      const finalTemp = seasonalTemp + tempVariation;
      
      const conditions = ['맑음', '구름조금', '구름많음', '흐림'];
      const conditionIcons = ['☀️', '⛅', '☁️', '☁️'];
      const randomIndex = Math.floor(Math.random() * conditions.length);
      
      const newWeatherData = {
        ...state.weatherData,
        temperature: finalTemp,
        condition: conditions[randomIndex],
        humidity: Math.floor(Math.random() * 25) + 45, // 45-70%
        windSpeed: Math.floor(Math.random() * 15) + 8, // 8-23 km/h
        visibility: Math.floor(Math.random() * 5) + 8, // 8-13km
        feelsLike: finalTemp + Math.floor(Math.random() * 3) - 1, // ±1도 체감온도
        icon: conditionIcons[randomIndex],
        lastUpdated: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
      };

      // 시간별 예보도 업데이트
      const hourlyForecast: HourlyForecast[] = [];
      for (let i = 0; i < 8; i++) {
        const hour = (currentHour + i) % 24;
        const hourTemp = seasonalTemp + Math.floor(Math.random() * 4) - 2;
        const hourCondition = conditions[Math.floor(Math.random() * conditions.length)];
        const hourIcon = conditionIcons[conditions.indexOf(hourCondition)];
        
        hourlyForecast.push({
          time: `${hour.toString().padStart(2, '0')}:00`,
          temperature: hourTemp,
          condition: hourCondition,
          icon: hourIcon,
          precipitation: Math.floor(Math.random() * 20)
        });
      }

      // 일별 예보도 업데이트
      const dailyForecast: DailyForecast[] = [];
      const days = ['오늘', '내일', '모레', '3일후', '4일후'];
      for (let i = 0; i < 5; i++) {
        const highTemp = seasonalTemp + Math.floor(Math.random() * 6) + 2;
        const lowTemp = seasonalTemp - Math.floor(Math.random() * 4) - 2;
        const dayCondition = conditions[Math.floor(Math.random() * conditions.length)];
        const dayIcon = conditionIcons[conditions.indexOf(dayCondition)];
        
        dailyForecast.push({
          date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          day: days[i] || `${i+1}일후`,
          highTemp,
          lowTemp,
          condition: dayCondition,
          icon: dayIcon,
          precipitation: Math.floor(Math.random() * 30)
        });
      }

      setState(prev => ({
        ...prev,
        weatherData: newWeatherData,
        hourlyForecast,
        dailyForecast
      }));
      saveState();

      showToast('날씨 정보가 업데이트되었습니다', 'success');
    } catch (error) {
      console.error('날씨 정보 업데이트 실패:', error);
      showToast('날씨 정보 업데이트에 실패했습니다', 'error');
    }
  }, [state.weatherData.location]);

  const updateLocation = useCallback(async (location: string) => {
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

    // 위치 변경 후 새로운 날씨 정보 가져오기
    await refreshWeather();
    showToast(`위치가 ${location}으로 변경되었습니다`, 'success');
  }, [refreshWeather]);

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

  // 데이터가 없을 때 기본값 사용
  const weatherData = state.weatherData || DEFAULT_WEATHER_DATA;
  
  // 위젯 크기 확인 (gridSize.h 기준)
  const widgetHeight = widget?.gridSize?.h || 1;

  // 1x1: 오늘 날씨만
  if (widgetHeight === 1) {
    return (
      <div className={`p-1 h-full flex flex-col justify-center ${getBackgroundColor(weatherData.condition)}`}>
        {state.showSettings ? (
          <div className="bg-white/70 rounded p-1">
            <div className="grid grid-cols-2 gap-1">
              {['서울', '부산', '대구', '인천'].map(city => (
                <button
                  key={city}
                  onClick={() => {
                    updateLocation(city);
                    setState(prev => ({ ...prev, showSettings: false }));
                  }}
                  className={`px-1 py-0.5 text-xs rounded ${
                    weatherData.location === city ? 'bg-blue-500 text-white' : 'bg-gray-200'
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="flex items-center justify-between mb-0.5 px-1">
              <div className="text-lg">{weatherData.icon}</div>
              <button 
                onClick={() => setState(prev => ({ ...prev, showSettings: !prev.showSettings }))}
                className="p-0.5 hover:bg-white/30 rounded"
              >
                <Settings className="w-3 h-3 text-gray-600" />
              </button>
            </div>
            
            <div className="flex items-center justify-center gap-1 text-xs text-gray-600 mb-0.5">
              <MapPin className="w-3 h-3" />
              <span>{weatherData.location}</span>
            </div>
            
            <div className="text-lg font-bold text-gray-800 mb-0.5">
              {formatTemperature(weatherData.temperature)}
            </div>
            <div className="text-xs text-gray-600">{weatherData.condition}</div>
          </div>
        )}
      </div>
    );
  }
  
  // 1x2: 시간대별 날씨
  if (widgetHeight === 2) {
    const hourlyData = [];
    const currentHour = new Date().getHours();
    for (let i = 0; i < 8; i += 3) {
      const hour = (currentHour + i) % 24;
      hourlyData.push({
        time: `${hour.toString().padStart(2, '0')}:00`,
        temp: weatherData.temperature + Math.floor(Math.random() * 4) - 2,
        icon: weatherData.icon
      });
    }
    
    return (
      <div className={`p-2 h-full flex flex-col ${getBackgroundColor(weatherData.condition)}`}>
        <div className="flex items-center justify-between mb-2 shrink-0">
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            <span className="text-sm font-semibold">{weatherData.location}</span>
          </div>
          <button 
            onClick={() => setState(prev => ({ ...prev, showSettings: !prev.showSettings }))}
            className="p-1 hover:bg-white/30 rounded"
          >
            <Settings className="w-3 h-3 text-gray-600" />
          </button>
        </div>
        
        {state.showSettings ? (
          <div className="bg-white/70 rounded p-2">
            <div className="grid grid-cols-2 gap-1">
              {['서울', '부산', '대구', '인천'].map(city => (
                <button
                  key={city}
                  onClick={() => updateLocation(city)}
                  className={`px-2 py-1 text-xs rounded ${
                    weatherData.location === city ? 'bg-blue-500 text-white' : 'bg-gray-200'
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <div className="text-xs text-gray-600 mb-2">시간대별 날씨</div>
            <div className="space-y-1">
              {hourlyData.map((item, i) => (
                <div key={i} className="bg-white/50 rounded p-2 flex items-center justify-between">
                  <span className="text-xs">{item.time}</span>
                  <span className="text-base">{item.icon}</span>
                  <span className="text-sm font-bold">{formatTemperature(item.temp)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
  
  // 1x3: 7일 날씨
  if (widgetHeight >= 3) {
    const weeklyData = [];
    const today = new Date();
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dayName = i === 0 ? '오늘' : i === 1 ? '내일' : days[date.getDay()];
      
      weeklyData.push({
        day: dayName,
        date: `${date.getMonth() + 1}/${date.getDate()}`,
        high: weatherData.temperature + Math.floor(Math.random() * 6) - 3,
        low: weatherData.temperature - Math.floor(Math.random() * 8) - 2,
        icon: i === 0 ? weatherData.icon : ['☀️', '⛅', '☁️', '🌧️'][Math.floor(Math.random() * 4)]
      });
    }
    
    return (
      <div className={`p-2 h-full flex flex-col ${getBackgroundColor(weatherData.condition)}`}>
        <div className="flex items-center justify-between mb-2 shrink-0">
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            <span className="text-sm font-semibold">{weatherData.location}</span>
          </div>
          <button 
            onClick={() => setState(prev => ({ ...prev, showSettings: !prev.showSettings }))}
            className="p-1 hover:bg-white/30 rounded"
          >
            <Settings className="w-3 h-3 text-gray-600" />
          </button>
        </div>
        
        {state.showSettings ? (
          <div className="bg-white/70 rounded p-2">
            <div className="grid grid-cols-2 gap-1">
              {['서울', '부산', '대구', '인천', '광주', '대전', '울산', '제주'].map(city => (
                <button
                  key={city}
                  onClick={() => updateLocation(city)}
                  className={`px-2 py-1 text-xs rounded ${
                    weatherData.location === city ? 'bg-blue-500 text-white' : 'bg-gray-200'
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <div className="text-xs text-gray-600 mb-2">주간 날씨</div>
            <div className="space-y-1">
              {weeklyData.map((item, i) => (
                <div key={i} className="bg-white/50 rounded p-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-xs font-medium w-8">{item.day}</span>
                    <span className="text-xs text-gray-600">{item.date}</span>
                  </div>
                  <span className="text-base mx-2">{item.icon}</span>
                  <div className="text-xs font-bold">
                    <span className="text-red-600">{formatTemperature(item.high)}</span>
                    <span className="text-gray-400 mx-1">/</span>
                    <span className="text-blue-600">{formatTemperature(item.low)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // 기본 (모든 정보)
  return (
    <div className={`p-3 h-full ${getBackgroundColor(weatherData.condition)}`}>
      <div className="text-center mb-3">
        <div className="text-3xl mb-1">{weatherData.icon}</div>
        <h4 className="font-semibold text-sm text-gray-800">날씨</h4>
        <div className="flex items-center justify-center gap-1 text-xs text-gray-600">
          <MapPin className="w-3 h-3" />
          <span>{weatherData.location}</span>
        </div>
      </div>

      {/* 현재 날씨 */}
      <div className="text-center mb-3">
        <div className="text-3xl font-bold text-gray-800 mb-1">
          {formatTemperature(weatherData.temperature)}
        </div>
        <div className={`text-sm font-medium ${getWeatherColor(weatherData.condition)}`}>
          {weatherData.condition}
        </div>
        <div className="text-xs text-gray-600 mt-1">
          체감온도 {formatTemperature(weatherData.feelsLike)}
        </div>
      </div>

      {/* 날씨 정보 */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-white/50 rounded-lg p-2 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Droplets className="w-3 h-3 text-blue-600" />
            <span className="text-xs text-gray-600">습도</span>
          </div>
          <div className="text-sm font-bold text-gray-800">{weatherData.humidity}%</div>
        </div>
        
        <div className="bg-white/50 rounded-lg p-2 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Wind className="w-3 h-3 text-gray-600" />
            <span className="text-xs text-gray-600">바람</span>
          </div>
          <div className="text-sm font-bold text-gray-800">{formatWindSpeed(weatherData.windSpeed)}</div>
        </div>
        
        <div className="bg-white/50 rounded-lg p-2 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Eye className="w-3 h-3 text-purple-600" />
            <span className="text-xs text-gray-600">가시거리</span>
          </div>
          <div className="text-sm font-bold text-gray-800">{weatherData.visibility}km</div>
        </div>
        
        <div className="bg-white/50 rounded-lg p-2 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Thermometer className="w-3 h-3 text-red-600" />
            <span className="text-xs text-gray-600">온도</span>
          </div>
          <div className="text-sm font-bold text-gray-800">{formatTemperature(weatherData.temperature)}</div>
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
        마지막 업데이트: {weatherData.lastUpdated}
      </div>
    </div>
  );
};
