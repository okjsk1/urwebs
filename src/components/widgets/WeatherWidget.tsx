import React, { useState, useEffect } from 'react';

export interface WeatherWidgetProps {
  id: string;
  onRemove: (id: string) => void;
  type?: 'current' | 'weekly' | 'hourly';
}

interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  high: number;
  low: number;
  icon: string;
}

interface WeeklyData {
  day: string;
  high: number;
  low: number;
  icon: string;
  condition: string;
}

interface HourlyData {
  time: string;
  temperature: number;
  icon: string;
  precipitation: number;
}

const WEATHER_LOCATIONS = [
  { name: '서울', code: 'seoul' },
  { name: '부산', code: 'busan' },
  { name: '대구', code: 'daegu' },
  { name: '인천', code: 'incheon' },
  { name: '광주', code: 'gwangju' },
  { name: '대전', code: 'daejeon' },
  { name: '울산', code: 'ulsan' },
  { name: '제주', code: 'jeju' }
];

// Mock weather data
const getMockWeatherData = (location: string): WeatherData => {
  const temps = [18, 22, 25, 16, 28, 30, 14, 26];
  const conditions = ['맑음', '흐림', '비', '눈', '구름많음'];
  const icons = ['☀️', '☁️', '🌧️', '❄️', '⛅'];

  const baseTemp = temps[Math.floor(Math.random() * temps.length)];
  const conditionIndex = Math.floor(Math.random() * conditions.length);

  return {
    location,
    temperature: baseTemp,
    condition: conditions[conditionIndex],
    high: baseTemp + Math.floor(Math.random() * 5) + 2,
    low: baseTemp - Math.floor(Math.random() * 5) - 2,
    icon: icons[conditionIndex]
  };
};

const getMockWeeklyData = (): WeeklyData[] => {
  const days = ['월', '화', '수', '목', '금', '토', '일'];
  const icons = ['☀️', '☁️', '🌧️', '❄️', '⛅'];
  const conditions = ['맑음', '흐림', '비', '눈', '구름많음'];

  return days.map(day => ({
    day,
    high: Math.floor(Math.random() * 15) + 15,
    low: Math.floor(Math.random() * 10) + 5,
    icon: icons[Math.floor(Math.random() * icons.length)],
    condition: conditions[Math.floor(Math.random() * conditions.length)]
  }));
};

const getMockHourlyData = (): HourlyData[] => {
  const hours = [];
  for (let i = 0; i < 24; i += 3) {
    hours.push(`${i.toString().padStart(2, '0')}:00`);
  }
  const icons = ['☀️', '☁️', '🌧️', '❄️', '⛅'];

  return hours.map(time => ({
    time,
    temperature: Math.floor(Math.random() * 15) + 10,
    icon: icons[Math.floor(Math.random() * icons.length)],
    precipitation: Math.floor(Math.random() * 100)
  }));
};

export function WeatherWidget({ id, onRemove, type = 'current' }: WeatherWidgetProps) {
  const [selectedLocation, setSelectedLocation] = useState('서울');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [hourlyData, setHourlyData] = useState<HourlyData[]>([]);
  const [showLocationSelect, setShowLocationSelect] = useState(false);

  useEffect(() => {
    // Simulate weather API call
    const fetchWeather = () => {
      setWeatherData(getMockWeatherData(selectedLocation));
      setWeeklyData(getMockWeeklyData());
      setHourlyData(getMockHourlyData());
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [selectedLocation]);

  const handleLocationClick = () => {
    window.open(`https://weather.naver.com/today/${selectedLocation}`, '_blank');
  };

  const getTitle = () => {
    switch (type) {
      case 'weekly': return '📅 요일별 날씨';
      case 'hourly': return '🕐 시간별 날씨';
      default: return '🌤️ 네이버 날씨';
    }
  };

  return (
    <div className="bg-white rounded-lg border shadow-sm p-3 lg:p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-gray-800 text-xs">{getTitle()}</h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowLocationSelect(!showLocationSelect)}
            className="text-xs text-blue-600 hover:text-blue-800 px-1 py-0.5 bg-blue-50 rounded"
          >
            위치설정
          </button>
          <button
            onClick={() => onRemove(id)}
            className="text-gray-400 hover:text-red-500 transition-colors text-xs"
          >
            ✕
          </button>
        </div>
      </div>

      {showLocationSelect && (
        <div className="mb-3">
          <select
            value={selectedLocation}
            onChange={(e) => {
              setSelectedLocation(e.target.value);
              setShowLocationSelect(false);
            }}
            className="text-xs border rounded px-2 py-1 w-full"
          >
            {WEATHER_LOCATIONS.map(location => (
              <option key={location.code} value={location.name}>
                {location.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {type === 'current' && weatherData && (
        <div
          className="text-center cursor-pointer hover:bg-gray-50 rounded p-2 transition-colors flex-1 flex flex-col justify-center"
          onClick={handleLocationClick}
        >
          <div className="text-2xl mb-1">{weatherData.icon}</div>
          <p className="text-xl font-bold text-blue-600">{weatherData.temperature}°C</p>
          <p className="text-xs text-gray-500 mb-2">{weatherData.location}, {weatherData.condition}</p>
          <div className="flex justify-between text-xs text-gray-400">
            <span>최고 {weatherData.high}°</span>
            <span>최저 {weatherData.low}°</span>
          </div>
          <p className="text-xs text-blue-500 mt-1">네이버 날씨 보기</p>
        </div>
      )}

      {type === 'weekly' && (
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-2">
            {weeklyData.map((day, index) => (
              <div key={index} className="flex items-center justify-between text-xs p-1 hover:bg-gray-50 rounded">
                <span className="w-6">{day.day}</span>
                <span className="text-sm">{day.icon}</span>
                <div className="flex gap-2">
                  <span className="text-blue-600">{day.high}°</span>
                  <span className="text-gray-400">{day.low}°</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {type === 'hourly' && (
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-2">
            {hourlyData.map((hour, index) => (
              <div key={index} className="flex items-center justify-between text-xs p-1 hover:bg-gray-50 rounded">
                <span className="w-12">{hour.time}</span>
                <span className="text-sm">{hour.icon}</span>
                <span className="text-blue-600">{hour.temperature}°</span>
                <span className="text-gray-400">{hour.precipitation}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}