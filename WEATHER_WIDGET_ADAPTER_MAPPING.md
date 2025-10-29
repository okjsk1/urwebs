# WeatherWidget 프로바이더 어댑터 매핑표

## 1. OpenWeatherMap → 표준 스키마

### 1.1 CurrentWeather 변환

| OpenWeather 필드 | 표준 스키마 필드 | 변환 규칙 | 예시 |
|-----------------|----------------|----------|------|
| `main.temp` | `temperatureC` | 직접 사용 (이미 Celsius) | `22.5` → `22.5` |
| `main.feels_like` | `feelsLikeC` | 직접 사용 | `24.3` → `24.3` |
| `wind.speed` | `windSpeedMS` | 직접 사용 (이미 m/s) | `5.2` → `5.2` |
| `wind.deg` | `windDirection` | 직접 사용 (0-360) | `180` → `180` |
| `visibility` | `visibilityM` | 직접 사용 (이미 meters) | `10000` → `10000` |
| `main.pressure` | `pressureHpa` | 직접 사용 | `1013` → `1013` |
| `main.humidity` | `humidity` | 직접 사용 (%) | `65` → `65` |
| `uvi` | `uvIndex` | 직접 사용 (없으면 undefined) | `5` → `5` |
| `weather[0].main` | `conditionCode` | 조건 매핑표 적용 | `"Clear"` → `"clear"` |
| `weather[0].description` | `conditionKo` | 언어 맵 적용 | `"clear sky"` → `"맑음"` |
| `weather[0].icon` | `iconCode` | 직접 사용 | `"01d"` → `"01d"` |
| `sys.sunrise` | `sunriseTs` | `* 1000` (초→밀리초) | `1720000000` → `1720000000000` |
| `sys.sunset` | `sunsetTs` | `* 1000` | `1720040000` → `1720040000000` |
| `dt` | `timestamp` | `* 1000` | `1720000000` → `1720000000000` |

### 1.2 HourlyForecast 변환 (forecast API)

| OpenWeather 필드 | 표준 스키마 필드 | 변환 규칙 | 예시 |
|-----------------|----------------|----------|------|
| `dt` | `timestamp` | `* 1000` | `1720000000` → `1720000000000` |
| `main.temp` | `tempC` | 직접 사용 | `22.5` → `22.5` |
| `main.feels_like` | `feelsLikeC` | 직접 사용 | `24.3` → `24.3` |
| `pop` | `pop` | `* 100` (0-1 → 0-100%) | `0.3` → `30` |
| `rain['3h']` 또는 `snow['3h']` | `precipMm` | 직접 사용 (없으면 0) | `2.5` → `2.5` |
| `weather[0].icon` | `iconCode` | 직접 사용 | `"09d"` → `"09d"` |
| `weather[0].main` | `conditionCode` | 조건 매핑표 적용 | `"Rain"` → `"rain"` |
| `weather[0].description` | `conditionKo` | 언어 맵 적용 | `"light rain"` → `"가벼운 비"` |
| `wind.speed` | `windSpeedMS` | 직접 사용 | `5.2` → `5.2` |
| `main.humidity` | `humidity` | 직접 사용 | `65` → `65` |

### 1.3 DailyForecast 변환 (일별 집계)

**입력**: OpenWeather 5일/3시간 예보 API (`forecast`)

**집계 알고리즘**:
1. 날짜별로 그룹화 (KST 기준 `YYYY-MM-DD`)
2. 각 날짜별로:
   - `minC`: 해당 날짜 모든 데이터의 `main.temp` 최소값
   - `maxC`: 해당 날짜 모든 데이터의 `main.temp` 최대값
   - `pop`: 해당 날짜 모든 데이터의 `pop` 최대값
   - `precipMm`: 해당 날짜 모든 데이터의 `rain['3h']` + `snow['3h']` 합계
   - `iconCode`: 해당 날짜 첫 번째 데이터의 `weather[0].icon`
   - `conditionCode`: 해당 날짜 첫 번째 데이터의 `weather[0].main` 매핑
   - `windSpeedMS`: 해당 날짜 모든 데이터의 `wind.speed` 평균
   - `humidity`: 해당 날짜 모든 데이터의 `main.humidity` 평균
   - `sunriseTs`/`sunsetTs`: API에서 제공되지 않으면 계산 (날짜별)

| 필드 | 변환 규칙 |
|------|----------|
| `date` | `YYYY-MM-DD` (KST 기준, 타임존 보정) |
| `timestamp` | 해당 날짜 00:00 KST Unix timestamp |
| `minC` | `Math.min(...temps)` |
| `maxC` | `Math.max(...temps)` |
| `pop` | `Math.max(...pops)` |
| `precipMm` | `sum(rain['3h']) + sum(snow['3h'])` |
| `iconCode` | 첫 번째 데이터의 `weather[0].icon` |
| `conditionCode` | 첫 번째 데이터의 `weather[0].main` 매핑 |
| `windSpeedMS` | `avg(wind.speed)` |
| `humidity` | `avg(main.humidity)` |
| `sunriseTs`/`sunsetTs` | 계산 또는 API 제공 시 사용 |

---

## 2. 시뮬레이터 → 표준 스키마

### 2.1 CurrentWeather 변환

| 시뮬레이터 필드 | 표준 스키마 필드 | 변환 규칙 | 예시 |
|----------------|----------------|----------|------|
| `temperature` | `temperatureC` | 직접 사용 | `22` → `22` |
| `feelsLike` | `feelsLikeC` | 직접 사용 | `24` → `24` |
| `windSpeed` | `windSpeedMS` | 직접 사용 | `5.2` → `5.2` |
| `windDirection` | `windDirection` | 직접 사용 | `180` → `180` |
| `visibility` | `visibilityM` | 직접 사용 (meters) | `10000` → `10000` |
| `pressure` | `pressureHpa` | 직접 사용 | `1013` → `1013` |
| `humidity` | `humidity` | 직접 사용 | `65` → `65` |
| `uvIndex` | `uvIndex` | 직접 사용 (없으면 undefined) | `5` → `5` |
| `condition` (한글) | `conditionCode` | 한글→영문 매핑표 | `"맑음"` → `"clear"` |
| `condition` | `conditionKo` | 직접 사용 | `"맑음"` → `"맑음"` |
| `icon` (이모지) | `iconCode` | 이모지→OWM 코드 매핑표 | `"☀️"` → `"01d"` |
| `sunrise` | `sunriseTs` | 직접 사용 (이미 timestamp) | `1720000000000` → `1720000000000` |
| `sunset` | `sunsetTs` | 직접 사용 | `1720040000000` → `1720040000000` |
| `timestamp` | `timestamp` | 직접 사용 | `1720000000000` → `1720000000000` |

### 2.2 한글 → 영문 조건 매핑표

| 한글 | conditionCode |
|------|--------------|
| `"맑음"` | `"clear"` |
| `"구름많음"` 또는 `"구름"` | `"clouds"` |
| `"흐림"` | `"clouds"` |
| `"비"` | `"rain"` |
| `"눈"` | `"snow"` |
| `"뇌우"` | `"thunder"` |
| `"이슬비"` | `"drizzle"` |
| `"안개"` | `"mist"` 또는 `"fog"` |

### 2.3 이모지 → OWM 아이콘 코드 매핑표

| 이모지 | iconCode (낮) | iconCode (밤) |
|--------|--------------|--------------|
| `"☀️"` | `"01d"` | `"01n"` |
| `"⛅"` | `"02d"` | `"02n"` |
| `"☁️"` | `"03d"` 또는 `"04d"` | `"03n"` 또는 `"04n"` |
| `"🌧️"` | `"09d"` | `"09n"` |
| `"🌦️"` | `"10d"` | - |
| `"⛈️"` | `"11d"` | `"11n"` |
| `"❄️"` | `"13d"` | `"13n"` |
| `"🌫️"` | `"50d"` | `"50n"` |

**참고**: 시뮬레이터는 낮/밤 구분 없이 이모지만 제공하므로, 현재 시간 기준으로 `*d` 또는 `*n` 선택

---

## 3. 조건 코드 매핑표 (통합)

### 3.1 OpenWeather → 표준 conditionCode

| OpenWeather | 표준 conditionCode |
|------------|-------------------|
| `"Clear"` | `"clear"` |
| `"Clouds"` | `"clouds"` |
| `"Rain"` | `"rain"` |
| `"Snow"` | `"snow"` |
| `"Thunderstorm"` | `"thunder"` |
| `"Drizzle"` | `"drizzle"` |
| `"Mist"` | `"mist"` |
| `"Fog"` | `"fog"` |
| `"Haze"` | `"haze"` |

### 3.2 conditionCode → 한글 라벨

| conditionCode | conditionKo |
|--------------|------------|
| `"clear"` | `"맑음"` |
| `"clouds"` | `"구름 많음"` |
| `"rain"` | `"비"` |
| `"snow"` | `"눈"` |
| `"thunder"` | `"뇌우"` |
| `"drizzle"` | `"이슬비"` |
| `"mist"` | `"안개"` |
| `"fog"` | `"짙은 안개"` |
| `"haze"` | `"연무"` |

---

## 4. 아이콘 코드 → 표시 요소 매핑표

### 4.1 OWM 아이콘 코드 → 이모지/이미지

| iconCode | 낮 (d) | 밤 (n) | 설명 |
|---------|--------|--------|------|
| `01d` | ☀️ | - | 맑음 |
| `01n` | - | 🌙 | 맑음 (밤) |
| `02d` | ⛅ | - | 약간 흐림 |
| `02n` | - | ☁️ | 약간 흐림 (밤) |
| `03d` | ☁️ | - | 흐림 |
| `03n` | - | ☁️ | 흐림 (밤) |
| `04d` | ☁️ | - | 매우 흐림 |
| `04n` | - | ☁️ | 매우 흐림 (밤) |
| `09d` | 🌧️ | - | 소나기 |
| `09n` | - | 🌧️ | 소나기 (밤) |
| `10d` | 🌦️ | - | 비 (낮) |
| `10n` | - | 🌧️ | 비 (밤) |
| `11d` | ⛈️ | - | 뇌우 |
| `11n` | - | ⛈️ | 뇌우 (밤) |
| `13d` | ❄️ | - | 눈 |
| `13n` | - | ❄️ | 눈 (밤) |
| `50d` | 🌫️ | - | 안개 |
| `50n` | - | 🌫️ | 안개 (밤) |

### 4.2 아이콘 코드 → 색상 클래스

| conditionCode | 낮 색상 | 밤 색상 |
|--------------|--------|--------|
| `clear` | `text-yellow-600` | `text-yellow-400` |
| `clouds` | `text-gray-600` | `text-gray-400` |
| `rain` | `text-blue-600` | `text-blue-400` |
| `snow` | `text-blue-300` | `text-blue-200` |
| `thunder` | `text-purple-600` | `text-purple-400` |
| `drizzle` | `text-blue-500` | `text-blue-300` |
| `mist/fog/haze` | `text-gray-500` | `text-gray-300` |

---

## 5. 일별 집계 알고리즘 상세

### 5.1 입력 데이터
- OpenWeather `forecast` API 응답: 3시간 간격 40개 데이터 포인트 (5일)

### 5.2 집계 단계

#### Step 1: 날짜별 그룹화
```typescript
// 각 데이터 포인트의 timestamp를 KST 기준 날짜로 변환
const dateStr = new Date(timestamp).toLocaleDateString('ko-KR', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
});

// 날짜별로 그룹화
const groups = {};
for (const item of data.list) {
  const date = getKSTDate(item.dt * 1000);
  if (!groups[date]) groups[date] = [];
  groups[date].push(item);
}
```

#### Step 2: 각 날짜별 집계
```typescript
for (const [date, items] of Object.entries(groups)) {
  const temps = items.map(i => i.main.temp);
  const minC = Math.min(...temps);
  const maxC = Math.max(...temps);
  
  const pops = items.map(i => i.pop || 0);
  const pop = Math.max(...pops) * 100; // 최대 강수 확률
  
  const precipMm = items.reduce((sum, i) => 
    sum + (i.rain?.['3h'] || 0) + (i.snow?.['3h'] || 0), 0
  );
  
  const windSpeedMS = items.reduce((sum, i) => 
    sum + (i.wind?.speed || 0), 0
  ) / items.length;
  
  const humidity = items.reduce((sum, i) => 
    sum + i.main.humidity, 0
  ) / items.length;
  
  // 첫 번째 데이터의 아이콘/조건 사용
  const iconCode = items[0].weather[0].icon;
  const conditionCode = mapCondition(items[0].weather[0].main);
  
  // 일출/일몰 계산 (또는 API 제공 시 사용)
  const sunriseTs = calculateSunrise(date, location);
  const sunsetTs = calculateSunset(date, location);
}
```

### 5.3 경계일 처리

#### 자정 교차 데이터
- 23:00 ~ 02:00 데이터가 같은 날짜에 포함될 수 있음
- 타임존 보정으로 정확한 날짜 구분

#### 월말/월초 처리
- 마지막 날/첫 날 데이터 누락 시 이전/다음 날 데이터로 보간하지 않음
- 데이터가 있는 날만 집계

---

## 6. 타임존 보정 규칙

### 6.1 내부 기준 시각
- 모든 timestamp는 KST (UTC+9) 기준으로 정규화
- `new Date(timestamp).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })`

### 6.2 날짜 문자열 변환
- `YYYY-MM-DD` 형식은 항상 KST 자정 (00:00:00 KST)
- UTC 변환 시 `-9시간` 조정

### 6.3 일출/일몰 계산
- 좌표 기반 타임존 결정
- 해당 날짜의 자정(KST) 기준으로 계산
- 시간대 변경(DST) 고려 (한국은 DST 없음)

---

## 7. 에러 처리 매핑

### 7.1 OpenWeather API 에러 코드

| HTTP 상태 | 에러 타입 | 처리 방법 |
|----------|----------|----------|
| `401` | 인증 실패 | API 키 오류 → 시뮬레이터로 폴백 |
| `429` | Rate Limit | 백오프 후 재시도 (최대 3회) |
| `404` | 위치 없음 | 에러 반환 (폴백 안 함) |
| `500/502/503` | 서버 오류 | 백오프 후 재시도 → 폴백 |

### 7.2 네트워크 오류
- `NetworkError`: 시뮬레이터로 폴백
- `TimeoutError`: 재시도 후 폴백

---

## 8. 테스트 데이터 예시

### 8.1 OpenWeather API 응답 샘플
```json
{
  "main": {
    "temp": 22.5,
    "feels_like": 24.3,
    "pressure": 1013,
    "humidity": 65
  },
  "weather": [{
    "main": "Clear",
    "description": "clear sky",
    "icon": "01d"
  }],
  "wind": {
    "speed": 5.2,
    "deg": 180
  },
  "visibility": 10000,
  "sys": {
    "sunrise": 1720000000,
    "sunset": 1720040000
  },
  "dt": 1720000000
}
```

### 8.2 표준 스키마 변환 결과
```typescript
{
  temperatureC: 22.5,
  feelsLikeC: 24.3,
  windSpeedMS: 5.2,
  windDirection: 180,
  visibilityM: 10000,
  pressureHpa: 1013,
  humidity: 65,
  conditionCode: 'clear',
  conditionKo: '맑음',
  iconCode: '01d',
  sunriseTs: 1720000000000,
  sunsetTs: 1720040000000,
  timestamp: 1720000000000,
  provider: 'openweather'
}
```

---

## 9. 마이그레이션 변환 규칙

### 9.1 기존 WeatherState → 신규 WeatherState

| 기존 필드 | 신규 필드 | 변환 규칙 |
|----------|----------|----------|
| `currentWeather.temperature` | `currentWeather.temperatureC` | 직접 복사 |
| `currentWeather.condition` (한글) | `currentWeather.conditionCode` | 한글→영문 매핑표 |
| `currentWeather.condition` | `currentWeather.conditionKo` | 직접 복사 |
| `currentWeather.icon` (이모지) | `currentWeather.iconCode` | 이모지→OWM 코드 매핑표 |
| `hourlyForecast[i].time` | `hourlyForecast[i].timestamp` | 직접 복사 (이미 timestamp면) |
| `hourlyForecast[i].temperature` | `hourlyForecast[i].tempC` | 직접 복사 |
| `dailyForecast[i].maxTemperature` | `dailyForecast[i].temperature.maxC` | `{ max: value }` |
| `dailyForecast[i].minTemperature` | `dailyForecast[i].temperature.minC` | `{ min: value }` |
| `dailyForecast[i].date` (number) | `dailyForecast[i].date` (string) | `new Date(timestamp).toISOString().split('T')[0]` |

### 9.2 기본값 채우기
- 누락된 필드는 기본값으로 채움:
  - `conditionCode`: `'clear'` (기본)
  - `conditionKo`: `'맑음'`
  - `iconCode`: `'01d'` (기본)
  - `provider`: `'simulation'` (기존 데이터)

