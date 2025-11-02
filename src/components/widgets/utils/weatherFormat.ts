// 날씨 데이터 포맷팅 유틸리티
import { WeatherUnits } from '../../../utils/weatherUnits';

export function formatTemperature(temp: number, units: WeatherUnits): string {
  return `${Math.round(temp)}°${units === 'metric' ? 'C' : 'F'}`;
}

export function formatWindSpeed(speed: number, units: WeatherUnits): string {
  return `${speed.toFixed(1)} ${units === 'metric' ? 'm/s' : 'mph'}`;
}

export function formatDistance(distance: number, units: WeatherUnits): string {
  // km 단위 제거
  return `${Math.round(distance)}`;
}

export function formatHumidity(humidity: number): string {
  return `${humidity}%`;
}

export function formatPressure(pressure: number, units: WeatherUnits): string {
  // hPa 단위 제거
  return `${Math.round(pressure)}`;
}

