// 날씨 데이터 서비스 - 다중 프로바이더 지원
export interface WeatherLocation {
  name: string;
  lat: number;
  lon: number;
  timezone?: string;
}

export interface CurrentWeather {
  location: WeatherLocation;
  temperature: number; // Celsius
  feelsLike: number; // Celsius
  condition: string;
  description: string;
  humidity: number; // %
  windSpeed: number; // m/s
  windDirection: number; // degrees
  visibility: number; // meters
  pressure: number; // hPa
  uvIndex?: number;
  icon: string;
  timestamp: number;
  sunrise?: number; // timestamp
  sunset?: number; // timestamp
}

export interface HourlyForecast {
  timestamp: number;
  temperature: number; // Celsius
  feelsLike: number; // Celsius
  condition: string;
  description: string;
  humidity: number; // %
  windSpeed: number; // m/s
  windDirection: number; // degrees
  precipitation: number; // mm
  precipitationProbability: number; // %
  icon: string;
}

export interface DailyForecast {
  date: string; // YYYY-MM-DD
  timestamp: number;
  temperature: {
    min: number; // Celsius
    max: number; // Celsius
  };
  condition: string;
  description: string;
  humidity: number; // %
  windSpeed: number; // m/s
  windDirection: number; // degrees
  precipitation: number; // mm
  precipitationProbability: number; // %
  icon: string;
  sunrise?: number; // timestamp
  sunset?: number; // timestamp
}

export interface WeatherProvider {
  name: string;
  getCurrent(location: WeatherLocation): Promise<CurrentWeather>;
  getHourly(location: WeatherLocation): Promise<HourlyForecast[]>;
  getDaily(location: WeatherLocation): Promise<DailyForecast[]>;
}

// 시뮬레이션 프로바이더 (폴백용)
class SimulationProvider implements WeatherProvider {
  name = 'simulation';

  private generateRandomWeather(location: WeatherLocation): CurrentWeather {
    const now = Date.now();
    const baseTemp = 20 + Math.sin((now / 86400000) * Math.PI * 2) * 10; // 계절적 변화
    const randomVariation = (Math.random() - 0.5) * 10; // ±5도 랜덤
    
    return {
      location,
      temperature: Math.round(baseTemp + randomVariation),
      feelsLike: Math.round(baseTemp + randomVariation + (Math.random() - 0.5) * 3),
      condition: ['맑음', '구름많음', '흐림', '비', '눈'][Math.floor(Math.random() * 5)],
      description: '시뮬레이션 데이터',
      humidity: Math.round(40 + Math.random() * 40),
      windSpeed: Math.round(Math.random() * 10 * 10) / 10,
      windDirection: Math.round(Math.random() * 360),
      visibility: Math.round((5000 + Math.random() * 10000) / 1000) * 1000,
      pressure: Math.round(1000 + Math.random() * 50),
      uvIndex: Math.round(Math.random() * 10),
      icon: ['☀️', '⛅', '☁️', '🌧️', '❄️'][Math.floor(Math.random() * 5)],
      timestamp: now,
      sunrise: now - (Math.random() * 8 + 4) * 3600000, // 4-12시간 전
      sunset: now + (Math.random() * 8 + 4) * 3600000, // 4-12시간 후
    };
  }

  private generateHourlyForecast(location: WeatherLocation): HourlyForecast[] {
    const forecasts: HourlyForecast[] = [];
    const now = Date.now();
    
    for (let i = 0; i < 24; i++) {
      const timestamp = now + i * 3600000;
      const baseTemp = 20 + Math.sin((timestamp / 86400000) * Math.PI * 2) * 10;
      const randomVariation = (Math.random() - 0.5) * 8;
      
      forecasts.push({
        timestamp,
        temperature: Math.round(baseTemp + randomVariation),
        feelsLike: Math.round(baseTemp + randomVariation + (Math.random() - 0.5) * 2),
        condition: ['맑음', '구름많음', '흐림', '비', '눈'][Math.floor(Math.random() * 5)],
        description: '시뮬레이션 데이터',
        humidity: Math.round(40 + Math.random() * 40),
        windSpeed: Math.round(Math.random() * 10 * 10) / 10,
        windDirection: Math.round(Math.random() * 360),
        precipitation: Math.round(Math.random() * 5 * 10) / 10,
        precipitationProbability: Math.round(Math.random() * 100),
        icon: ['☀️', '⛅', '☁️', '🌧️', '❄️'][Math.floor(Math.random() * 5)],
      });
    }
    
    return forecasts;
  }

  private generateDailyForecast(location: WeatherLocation): DailyForecast[] {
    const forecasts: DailyForecast[] = [];
    const now = Date.now();
    
    for (let i = 0; i < 7; i++) {
      const timestamp = now + i * 86400000;
      const baseTemp = 20 + Math.sin((timestamp / 86400000) * Math.PI * 2) * 10;
      const randomVariation = (Math.random() - 0.5) * 6;
      const minTemp = Math.round(baseTemp + randomVariation - 5);
      const maxTemp = Math.round(baseTemp + randomVariation + 5);
      
      forecasts.push({
        date: new Date(timestamp).toISOString().split('T')[0],
        timestamp,
        temperature: { min: minTemp, max: maxTemp },
        condition: ['맑음', '구름많음', '흐림', '비', '눈'][Math.floor(Math.random() * 5)],
        description: '시뮬레이션 데이터',
        humidity: Math.round(40 + Math.random() * 40),
        windSpeed: Math.round(Math.random() * 10 * 10) / 10,
        windDirection: Math.round(Math.random() * 360),
        precipitation: Math.round(Math.random() * 10 * 10) / 10,
        precipitationProbability: Math.round(Math.random() * 100),
        icon: ['☀️', '⛅', '☁️', '🌧️', '❄️'][Math.floor(Math.random() * 5)],
        sunrise: timestamp - (Math.random() * 8 + 4) * 3600000,
        sunset: timestamp + (Math.random() * 8 + 4) * 3600000,
      });
    }
    
    return forecasts;
  }

  async getCurrent(location: WeatherLocation): Promise<CurrentWeather> {
    // 시뮬레이션 지연
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
    return this.generateRandomWeather(location);
  }

  async getHourly(location: WeatherLocation): Promise<HourlyForecast[]> {
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500));
    return this.generateHourlyForecast(location);
  }

  async getDaily(location: WeatherLocation): Promise<DailyForecast[]> {
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500));
    return this.generateDailyForecast(location);
  }
}

// OpenWeatherMap 프로바이더 (실제 API)
class OpenWeatherProvider implements WeatherProvider {
  name = 'openweather';
  private apiKey: string;
  private baseUrl = 'https://api.openweathermap.org/data/2.5';

  constructor(apiKey: string = 'demo') {
    this.apiKey = apiKey;
  }

  private async fetchWithRetry(url: string, retries = 3): Promise<any> {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url);
        if (response.ok) {
          return await response.json();
        }
        if (response.status === 429) {
          // Rate limit - exponential backoff
          const delay = Math.pow(2, i) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        throw new Error(`HTTP ${response.status}`);
      } catch (error) {
        if (i === retries - 1) throw error;
        const delay = Math.pow(2, i) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  async getCurrent(location: WeatherLocation): Promise<CurrentWeather> {
    if (this.apiKey === 'demo') {
<<<<<<< HEAD
      throw new Error('Demo API key - using simulation');
=======
      // 개발 환경에서는 시뮬레이션 데이터 사용 (오류 대신 조용히 처리)
      return this.generateSimulationData(location);
>>>>>>> f18eacae9db3a659b475638dca7b7d0b0ae30bd6
    }

    const url = `${this.baseUrl}/weather?lat=${location.lat}&lon=${location.lon}&appid=${this.apiKey}&units=metric&lang=kr`;
    const data = await this.fetchWithRetry(url);

    return {
      location,
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      condition: data.weather[0].main,
      description: data.weather[0].description,
      humidity: data.main.humidity,
      windSpeed: data.wind?.speed || 0,
      windDirection: data.wind?.deg || 0,
      visibility: data.visibility || 10000,
      pressure: data.main.pressure,
      uvIndex: data.uvi,
      icon: this.getWeatherIcon(data.weather[0].icon),
      timestamp: Date.now(),
      sunrise: data.sys.sunrise * 1000,
      sunset: data.sys.sunset * 1000,
    };
  }

  async getHourly(location: WeatherLocation): Promise<HourlyForecast[]> {
    if (this.apiKey === 'demo') {
<<<<<<< HEAD
      throw new Error('Demo API key - using simulation');
=======
      // 개발 환경에서는 시뮬레이션 데이터 사용
      return this.generateHourlySimulation(location);
>>>>>>> f18eacae9db3a659b475638dca7b7d0b0ae30bd6
    }

    const url = `${this.baseUrl}/forecast?lat=${location.lat}&lon=${location.lon}&appid=${this.apiKey}&units=metric&lang=kr`;
    const data = await this.fetchWithRetry(url);

    return data.list.slice(0, 24).map((item: any) => ({
      timestamp: item.dt * 1000,
      temperature: Math.round(item.main.temp),
      feelsLike: Math.round(item.main.feels_like),
      condition: item.weather[0].main,
      description: item.weather[0].description,
      humidity: item.main.humidity,
      windSpeed: item.wind?.speed || 0,
      windDirection: item.wind?.deg || 0,
      precipitation: item.rain?.['3h'] || item.snow?.['3h'] || 0,
      precipitationProbability: Math.round((item.pop || 0) * 100),
      icon: this.getWeatherIcon(item.weather[0].icon),
    }));
  }

  async getDaily(location: WeatherLocation): Promise<DailyForecast[]> {
    if (this.apiKey === 'demo') {
<<<<<<< HEAD
      throw new Error('Demo API key - using simulation');
=======
      // 개발 환경에서는 시뮬레이션 데이터 사용
      return this.generateDailySimulation(location);
>>>>>>> f18eacae9db3a659b475638dca7b7d0b0ae30bd6
    }

    const url = `${this.baseUrl}/forecast?lat=${location.lat}&lon=${location.lon}&appid=${this.apiKey}&units=metric&lang=kr`;
    const data = await this.fetchWithRetry(url);

    // 5일간의 일별 예보 생성
    const dailyForecasts: DailyForecast[] = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      // 해당 날짜의 데이터 필터링
      const dayData = data.list.filter((item: any) => 
        new Date(item.dt * 1000).toISOString().split('T')[0] === dateStr
      );
      
      if (dayData.length > 0) {
        const temps = dayData.map((item: any) => item.main.temp);
        const minTemp = Math.round(Math.min(...temps));
        const maxTemp = Math.round(Math.max(...temps));
        
        dailyForecasts.push({
          date: dateStr,
          timestamp: date.getTime(),
          temperature: { min: minTemp, max: maxTemp },
          condition: dayData[0].weather[0].main,
          description: dayData[0].weather[0].description,
          humidity: Math.round(dayData.reduce((sum: number, item: any) => sum + item.main.humidity, 0) / dayData.length),
          windSpeed: Math.round(dayData.reduce((sum: number, item: any) => sum + (item.wind?.speed || 0), 0) / dayData.length * 10) / 10,
          windDirection: Math.round(dayData.reduce((sum: number, item: any) => sum + (item.wind?.deg || 0), 0) / dayData.length),
          precipitation: Math.round(dayData.reduce((sum: number, item: any) => sum + (item.rain?.['3h'] || item.snow?.['3h'] || 0), 0) * 10) / 10,
          precipitationProbability: Math.round(dayData.reduce((sum: number, item: any) => sum + (item.pop || 0), 0) / dayData.length * 100),
          icon: this.getWeatherIcon(dayData[0].weather[0].icon),
        });
      }
    }
    
    return dailyForecasts;
  }

  private getWeatherIcon(iconCode: string): string {
    const iconMap: Record<string, string> = {
      '01d': '☀️', '01n': '🌙',
      '02d': '⛅', '02n': '☁️',
      '03d': '☁️', '03n': '☁️',
      '04d': '☁️', '04n': '☁️',
      '09d': '🌧️', '09n': '🌧️',
      '10d': '🌦️', '10n': '🌧️',
      '11d': '⛈️', '11n': '⛈️',
      '13d': '❄️', '13n': '❄️',
      '50d': '🌫️', '50n': '🌫️',
    };
    return iconMap[iconCode] || '☀️';
  }
}

// 메인 날씨 서비스
export class WeatherService {
  private providers: WeatherProvider[];
  private currentProvider: WeatherProvider;
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  constructor() {
    // Vite 환경변수 접근
    const apiKey = import.meta.env?.VITE_OPENWEATHER_API_KEY || 'demo';
    this.providers = [
      new OpenWeatherProvider(apiKey),
      new SimulationProvider(),
    ];
    this.currentProvider = this.providers[0];
  }

  private getCacheKey(location: WeatherLocation, type: string): string {
    if (!location || typeof location.lat !== 'number' || typeof location.lon !== 'number') {
      return `${type}:unknown:unknown`;
    }
    return `${type}:${location.lat.toFixed(2)}:${location.lon.toFixed(2)}`;
  }

  private getCachedData<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }
    return null;
  }

  private setCachedData<T>(key: string, data: T, ttl: number = 300000): void { // 5분 기본 TTL
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  async getCurrentWeather(location: WeatherLocation): Promise<CurrentWeather> {
    const cacheKey = this.getCacheKey(location, 'current');
    const cached = this.getCachedData<CurrentWeather>(cacheKey);
    if (cached) return cached;

    for (const provider of this.providers) {
      try {
        const data = await provider.getCurrent(location);
        this.setCachedData(cacheKey, data, 300000); // 5분 캐시
        return data;
      } catch (error) {
        console.warn(`Weather provider ${provider.name} failed:`, error);
        continue;
      }
    }
    
    throw new Error('All weather providers failed');
  }

  async getHourlyForecast(location: WeatherLocation): Promise<HourlyForecast[]> {
    const cacheKey = this.getCacheKey(location, 'hourly');
    const cached = this.getCachedData<HourlyForecast[]>(cacheKey);
    if (cached) return cached;

    for (const provider of this.providers) {
      try {
        const data = await provider.getHourly(location);
        this.setCachedData(cacheKey, data, 1800000); // 30분 캐시
        return data;
      } catch (error) {
        console.warn(`Weather provider ${provider.name} failed:`, error);
        continue;
      }
    }
    
    throw new Error('All weather providers failed');
  }

  async getDailyForecast(location: WeatherLocation): Promise<DailyForecast[]> {
    const cacheKey = this.getCacheKey(location, 'daily');
    const cached = this.getCachedData<DailyForecast[]>(cacheKey);
    if (cached) return cached;

    for (const provider of this.providers) {
      try {
        const data = await provider.getDaily(location);
        this.setCachedData(cacheKey, data, 3600000); // 1시간 캐시
        return data;
      } catch (error) {
        console.warn(`Weather provider ${provider.name} failed:`, error);
        continue;
      }
    }
    
    throw new Error('All weather providers failed');
  }

  // 위치 검색 (역지오코딩)
  async searchLocation(query: string): Promise<WeatherLocation[]> {
    // 간단한 도시명 매핑 (실제로는 지오코딩 API 사용)
    const cityMap: Record<string, WeatherLocation> = {
      '서울': { name: '서울', lat: 37.5665, lon: 126.9780, timezone: 'Asia/Seoul' },
      '부산': { name: '부산', lat: 35.1796, lon: 129.0756, timezone: 'Asia/Seoul' },
      '대구': { name: '대구', lat: 35.8714, lon: 128.6014, timezone: 'Asia/Seoul' },
      '인천': { name: '인천', lat: 37.4563, lon: 126.7052, timezone: 'Asia/Seoul' },
      '광주': { name: '광주', lat: 35.1595, lon: 126.8526, timezone: 'Asia/Seoul' },
      '대전': { name: '대전', lat: 36.3504, lon: 127.3845, timezone: 'Asia/Seoul' },
      '울산': { name: '울산', lat: 35.5384, lon: 129.3114, timezone: 'Asia/Seoul' },
      '세종': { name: '세종', lat: 36.4800, lon: 127.2890, timezone: 'Asia/Seoul' },
      '수원': { name: '수원', lat: 37.2636, lon: 127.0286, timezone: 'Asia/Seoul' },
      '성남': { name: '성남', lat: 37.4201, lon: 127.1268, timezone: 'Asia/Seoul' },
    };

    const results: WeatherLocation[] = [];
    const queryLower = query.toLowerCase();
    
    for (const [name, location] of Object.entries(cityMap)) {
      if (name.includes(query) || query.includes(name)) {
        results.push(location);
      }
    }
    
    return results;
  }

<<<<<<< HEAD
=======
  // 시뮬레이션 데이터 생성 메서드들
  private generateSimulationData(location: WeatherLocation): CurrentWeather {
    const now = new Date();
    const hour = now.getHours();
    
    // 시간대별 온도 시뮬레이션
    const baseTemp = 20 + Math.sin((hour - 6) * Math.PI / 12) * 8;
    const temp = Math.round(baseTemp + (Math.random() - 0.5) * 4);
    
    const conditions = ['Clear', 'Clouds', 'Rain', 'Snow'];
    const condition = conditions[Math.floor(Math.random() * conditions.length)];
    
    return {
      location,
      temperature: temp,
      feelsLike: temp + Math.round((Math.random() - 0.5) * 3),
      condition,
      description: this.getConditionDescription(condition),
      humidity: Math.round(40 + Math.random() * 40),
      windSpeed: Math.round(Math.random() * 10),
      windDirection: Math.round(Math.random() * 360),
      visibility: Math.round(8000 + Math.random() * 2000),
      pressure: Math.round(1010 + Math.random() * 20),
      uvIndex: Math.round(Math.random() * 10),
      sunrise: this.getSunriseTime(now),
      sunset: this.getSunsetTime(now),
    };
  }

  private generateHourlySimulation(location: WeatherLocation): HourlyForecast[] {
    const forecasts: HourlyForecast[] = [];
    const now = new Date();
    
    for (let i = 0; i < 24; i++) {
      const time = new Date(now.getTime() + i * 60 * 60 * 1000);
      const hour = time.getHours();
      const baseTemp = 20 + Math.sin((hour - 6) * Math.PI / 12) * 8;
      const temp = Math.round(baseTemp + (Math.random() - 0.5) * 4);
      
      forecasts.push({
        time: time.getTime(),
        temperature: temp,
        condition: ['Clear', 'Clouds', 'Rain'][Math.floor(Math.random() * 3)],
        description: this.getConditionDescription(['Clear', 'Clouds', 'Rain'][Math.floor(Math.random() * 3)]),
        precipitationProbability: Math.round(Math.random() * 30),
        icon: this.getWeatherIcon('01d'),
      });
    }
    
    return forecasts;
  }

  private generateDailySimulation(location: WeatherLocation): DailyForecast[] {
    const forecasts: DailyForecast[] = [];
    const now = new Date();
    
    for (let i = 0; i < 5; i++) {
      const date = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
      const baseTemp = 20 + Math.sin(i * Math.PI / 5) * 5;
      const maxTemp = Math.round(baseTemp + Math.random() * 5);
      const minTemp = Math.round(maxTemp - 8 - Math.random() * 5);
      
      forecasts.push({
        date: date.getTime(),
        maxTemperature: maxTemp,
        minTemperature: minTemp,
        condition: ['Clear', 'Clouds', 'Rain', 'Snow'][Math.floor(Math.random() * 4)],
        description: this.getConditionDescription(['Clear', 'Clouds', 'Rain', 'Snow'][Math.floor(Math.random() * 4)]),
        precipitationProbability: Math.round(Math.random() * 40),
        icon: this.getWeatherIcon('01d'),
      });
    }
    
    return forecasts;
  }

  private getConditionDescription(condition: string): string {
    const descriptions: Record<string, string> = {
      'Clear': '맑음',
      'Clouds': '구름 많음',
      'Rain': '비',
      'Snow': '눈',
      'Thunderstorm': '뇌우',
      'Drizzle': '이슬비',
      'Mist': '안개',
    };
    return descriptions[condition] || condition;
  }

  private getSunriseTime(date: Date): number {
    const sunrise = new Date(date);
    sunrise.setHours(6, 30 + Math.floor(Math.random() * 30), 0, 0);
    return sunrise.getTime();
  }

  private getSunsetTime(date: Date): number {
    const sunset = new Date(date);
    sunset.setHours(18, 30 + Math.floor(Math.random() * 60), 0, 0);
    return sunset.getTime();
  }

>>>>>>> f18eacae9db3a659b475638dca7b7d0b0ae30bd6
  // 현재 위치 감지
  async getCurrentLocation(): Promise<WeatherLocation> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          // 간단한 역지오코딩 (실제로는 API 사용)
          const location: WeatherLocation = {
            name: '현재 위치',
            lat: latitude,
            lon: longitude,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          };
          resolve(location);
        },
        (error) => {
          reject(new Error(`Geolocation error: ${error.message}`));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5분
        }
      );
    });
  }
}

// 싱글톤 인스턴스
export const weatherService = new WeatherService();
