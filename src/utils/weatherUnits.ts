// 날씨 단위 변환 유틸리티
export type WeatherUnits = 'metric' | 'imperial';

// 온도 변환
export const convertTemperature = (celsius: number, units: WeatherUnits): number => {
  if (units === 'imperial') {
    return Math.round(celsius * 9/5 + 32);
  }
  return Math.round(celsius);
};

// 풍속 변환 (m/s → km/h 또는 mph)
export const convertWindSpeed = (ms: number, units: WeatherUnits): number => {
  if (units === 'imperial') {
    return Math.round(ms * 2.237); // m/s to mph
  }
  return Math.round(ms * 3.6); // m/s to km/h
};

// 거리 변환 (m → km 또는 miles)
export const convertDistance = (meters: number, units: WeatherUnits): number => {
  if (units === 'imperial') {
    return Math.round(meters * 0.000621371 * 10) / 10; // m to miles
  }
  return Math.round(meters / 1000 * 10) / 10; // m to km
};

// 강수량 변환 (mm → in 또는 mm)
export const convertPrecipitation = (mm: number, units: WeatherUnits): number => {
  if (units === 'imperial') {
    return Math.round(mm * 0.0393701 * 100) / 100; // mm to inches
  }
  return Math.round(mm * 10) / 10; // mm
};

// 단위별 포맷팅
export const formatTemperature = (celsius: number, units: WeatherUnits): string => {
  const temp = convertTemperature(celsius, units);
  return `${temp}°${units === 'imperial' ? 'F' : 'C'}`;
};

export const formatWindSpeed = (ms: number, units: WeatherUnits): string => {
  const speed = convertWindSpeed(ms, units);
  return `${speed} ${units === 'imperial' ? 'mph' : 'km/h'}`;
};

export const formatDistance = (meters: number, units: WeatherUnits): string => {
  const distance = convertDistance(meters, units);
  return `${distance} ${units === 'imperial' ? 'mi' : 'km'}`;
};

export const formatPrecipitation = (mm: number, units: WeatherUnits): string => {
  const precip = convertPrecipitation(mm, units);
  return `${precip} ${units === 'imperial' ? 'in' : 'mm'}`;
};

// 습도 포맷팅 (단위 없음)
export const formatHumidity = (humidity: number): string => {
  return `${humidity}%`;
};

// 기압 변환 (hPa → inHg 또는 hPa)
export const convertPressure = (hPa: number, units: WeatherUnits): number => {
  if (units === 'imperial') {
    return Math.round(hPa * 0.02953 * 100) / 100; // hPa to inHg
  }
  return Math.round(hPa);
};

export const formatPressure = (hPa: number, units: WeatherUnits): string => {
  const pressure = convertPressure(hPa, units);
  return `${pressure} ${units === 'imperial' ? 'inHg' : 'hPa'}`;
};


