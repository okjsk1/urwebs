# WeatherWidget 마이그레이션 가이드

## 1. 버전 키 전략

### 1.1 기존 버전
- 키: `weather_${widgetId}`
- 형식: `WeatherState` (구버전 스키마)

### 1.2 신규 버전
- 키: `weather_state_v2_${widgetId}`
- 형식: `WeatherStateV2` (신규 표준 스키마)

### 1.3 마이그레이션 전략
- 기존 키 확인 → 변환 → 신규 키 저장
- 기존 키는 삭제하지 않음 (롤백 대비)

---

## 2. 데이터 변환 규칙

### 2.1 CurrentWeather 변환

#### 기존 스키마
```typescript
interface CurrentWeatherOld {
  location: WeatherLocation | string;  // 문자열일 수 있음
  temperature: number;
  feelsLike: number;
  condition: string;                   // 한글 또는 영문 혼재
  description: string;
  humidity: number;
  windSpeed: number;
  visibility: number;
  pressure: number;
  icon: string;                        // 이모지 또는 OWM 코드
  timestamp: number;
  sunrise?: number;
  sunset?: number;
}
```

#### 신규 스키마
```typescript
interface CurrentWeatherV2 {
  location: WeatherLocation;          // 항상 객체
  temperatureC: number;               // 명시적 단위
  feelsLikeC: number;
  windSpeedMS: number;                // 명시적 단위
  windDirection: number;
  visibilityM: number;                // 명시적 단위
  pressureHpa: number;                // 명시적 단위
  humidity: number;
  uvIndex?: number;
  sunriseTs?: number;
  sunsetTs?: number;
  conditionCode: WeatherCondition;    // enum
  conditionKo: string;               // 표시용 한글
  iconCode: string;                   // OWM 스타일
  timestamp: number;
  provider: string;
}
```

#### 변환 함수 (의사코드)
```
function migrateCurrentWeather(old: CurrentWeatherOld): CurrentWeatherV2 {
  // location 변환
  let location: WeatherLocation;
  if (typeof old.location === 'string') {
    location = {
      name: old.location,
      lat: DEFAULT_LOCATION.lat,
      lon: DEFAULT_LOCATION.lon
    };
  } else {
    location = old.location;
  }
  
  // condition 변환
  let conditionCode: WeatherCondition;
  let conditionKo: string;
  if (isKorean(old.condition)) {
    conditionCode = mapKoreanToCode(old.condition);
    conditionKo = old.condition;
  } else {
    conditionCode = mapEnglishToCode(old.condition);
    conditionKo = mapCodeToKorean(conditionCode);
  }
  
  // icon 변환
  let iconCode: string;
  if (isEmoji(old.icon)) {
    iconCode = mapEmojiToOWM(old.icon);
  } else {
    iconCode = old.icon; // 이미 OWM 코드
  }
  
  return {
    location,
    temperatureC: old.temperature,
    feelsLikeC: old.feelsLike,
    windSpeedMS: old.windSpeed,
    windDirection: old.windDirection || 0,
    visibilityM: old.visibility,
    pressureHpa: old.pressure,
    humidity: old.humidity,
    uvIndex: old.uvIndex,
    sunriseTs: old.sunrise,
    sunsetTs: old.sunset,
    conditionCode,
    conditionKo,
    iconCode,
    timestamp: old.timestamp,
    provider: 'simulation' // 기존 데이터는 시뮬레이터로 가정
  };
}
```

### 2.2 HourlyForecast 변환

#### 기존 스키마
```typescript
interface HourlyForecastOld {
  time?: number;                      // 필드명 불일치
  timestamp?: number;
  temperature: number;
  // ... 기타 필드
}
```

#### 변환 규칙
- `time` 또는 `timestamp` 중 하나만 있다고 가정
- 둘 다 없으면 현재 시간으로 설정
- 모든 필드를 표준 스키마로 변환:
  - `temperature` → `tempC`
  - `condition` → `conditionCode` + `conditionKo`
  - `icon` → `iconCode`

### 2.3 DailyForecast 변환

#### 기존 스키마
```typescript
interface DailyForecastOld {
  date: string | number;              // 타입 불일치
  timestamp?: number;
  maxTemperature?: number;            // 필드명 불일치
  minTemperature?: number;
  temperature?: { min: number; max: number; };  // 신규 형식
  // ... 기타 필드
}
```

#### 변환 규칙
- `date`가 number면 `YYYY-MM-DD` 문자열로 변환
- `maxTemperature`/`minTemperature` 있으면 `temperature: {min, max}` 객체 생성
- 이미 `temperature` 객체면 그대로 사용
- 모든 필드를 표준 스키마로 변환:
  - `maxTemperature` → `temperature.maxC`
  - `minTemperature` → `temperature.minC`

---

## 3. 한글 → 영문 조건 매핑

### 3.1 매핑표

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

### 3.2 영문 → 한글 매핑

| 영문 | conditionCode | conditionKo |
|------|--------------|------------|
| `"Clear"` | `"clear"` | `"맑음"` |
| `"Clouds"` | `"clouds"` | `"구름 많음"` |
| `"Rain"` | `"rain"` | `"비"` |
| `"Snow"` | `"snow"` | `"눈"` |
| `"Thunderstorm"` | `"thunder"` | `"뇌우"` |
| `"Drizzle"` | `"drizzle"` | `"이슬비"` |
| `"Mist"` | `"mist"` | `"안개"` |
| `"Fog"` | `"fog"` | `"짙은 안개"` |
| `"Haze"` | `"haze"` | `"연무"` |

---

## 4. 이모지 → OWM 아이콘 코드 매핑

### 4.1 매핑표

| 이모지 | iconCode (낮) | iconCode (밤) | 선택 기준 |
|--------|--------------|--------------|----------|
| `"☀️"` | `"01d"` | `"01n"` | 현재 시간 기준 |
| `"⛅"` | `"02d"` | `"02n"` | 현재 시간 기준 |
| `"☁️"` | `"03d"` 또는 `"04d"` | `"03n"` 또는 `"04n"` | 현재 시간 기준 |
| `"🌧️"` | `"09d"` | `"09n"` | 현재 시간 기준 |
| `"🌦️"` | `"10d"` | - | 낮 전용 |
| `"⛈️"` | `"11d"` | `"11n"` | 현재 시간 기준 |
| `"❄️"` | `"13d"` | `"13n"` | 현재 시간 기준 |
| `"🌫️"` | `"50d"` | `"50n"` | 현재 시간 기준 |

### 4.2 낮/밤 판단 규칙
- 현재 시간(KST) 기준:
  - 06:00 ~ 18:00: `*d` (낮)
  - 그 외: `*n` (밤)

---

## 5. 마이그레이션 실행 순서

### Step 1: 기존 데이터 확인
```typescript
const oldData = localStorage.getItem(`weather_${widgetId}`);
if (!oldData) {
  // 마이그레이션 불필요
  return;
}
```

### Step 2: 버전 확인
```typescript
try {
  const parsed = JSON.parse(oldData);
  if (parsed.version === 'v2') {
    // 이미 마이그레이션 완료
    return;
  }
} catch (e) {
  // 구버전 데이터
}
```

### Step 3: 변환 실행
```typescript
const migrated = migrateWeatherState(oldData);
```

### Step 4: 신규 키 저장
```typescript
localStorage.setItem(`weather_state_v2_${widgetId}`, JSON.stringify({
  ...migrated,
  version: 'v2',
  migratedAt: Date.now()
}));
```

### Step 5: 검증
```typescript
// 필수 필드 확인
if (!migrated.currentWeather?.conditionCode) {
  throw new Error('Migration failed: missing conditionCode');
}
```

### Step 6: 기존 키 보관 (롤백 대비)
```typescript
// 기존 키는 삭제하지 않음
// 필요 시 수동으로 삭제
```

---

## 6. 롤백 플랜

### 6.1 마이그레이션 실패 시

#### 증상
- 필수 필드 누락
- 타입 불일치 오류
- 데이터 손상

#### 조치
1. 마이그레이션 중단
2. 기존 데이터 유지
3. 읽기 전용 모드로 전환
4. 사용자에게 알림: "데이터 변환 중 오류 발생. 새로고침 후 다시 시도해주세요."

### 6.2 롤백 절차

#### Step 1: 마이그레이션 플래그 제거
```typescript
localStorage.removeItem(`weather_state_v2_${widgetId}`);
```

#### Step 2: 기존 데이터 복원
```typescript
// 기존 키가 있으면 그대로 사용
const oldData = localStorage.getItem(`weather_${widgetId}`);
if (oldData) {
  // 기존 데이터로 복원
}
```

#### Step 3: 호환성 모드 활성화
```typescript
// 구버전 스키마 호환 모드
const compatibilityMode = true;
```

---

## 7. 기본값 채우기 규칙

### 7.1 누락 필드 기본값

| 필드 | 기본값 | 설명 |
|------|--------|------|
| `windDirection` | `0` | 풍향 없음 |
| `uvIndex` | `undefined` | UV 인덱스 없음 |
| `sunriseTs` | `undefined` | 일출 없음 |
| `sunsetTs` | `undefined` | 일몰 없음 |
| `conditionCode` | `"clear"` | 맑음 (기본) |
| `conditionKo` | `"맑음"` | 맑음 (기본) |
| `iconCode` | `"01d"` | 맑음 아이콘 (기본) |
| `provider` | `"simulation"` | 시뮬레이터 (기존 데이터) |

### 7.2 타입 변환 기본값

| 변환 타입 | 기본값 |
|----------|--------|
| `string` → `number` | `0` |
| `number` → `string` | `"0"` |
| `null` → `undefined` | `undefined` |
| `undefined` → `null` | `null` (필요 시) |

---

## 8. 마이그레이션 테스트 케이스

### TC-1: 기존 데이터 마이그레이션
- 기존 `weather_${widgetId}` 키 확인
- 신규 스키마로 변환
- `weather_state_v2_${widgetId}` 키 저장
- 변환 데이터 검증

### TC-2: location 문자열 변환
- `location: "서울"` → `location: {name: "서울", lat: 37.5665, lon: 126.9780}`

### TC-3: condition 한글 변환
- `condition: "맑음"` → `conditionCode: "clear"`, `conditionKo: "맑음"`

### TC-4: icon 이모지 변환
- `icon: "☀️"` → `iconCode: "01d"` (현재 시간 기준)

### TC-5: hourlyForecast time 변환
- `time` → `timestamp` 통일

### TC-6: dailyForecast temperature 변환
- `maxTemperature/minTemperature` → `temperature: {min, max}`

### TC-7: 마이그레이션 실패 처리
- 잘못된 데이터 형식 시 롤백
- 읽기 전용 모드 활성화

### TC-8: 버전 확인
- 이미 마이그레이션된 데이터는 재마이그레이션 안 함

---

## 9. 마이그레이션 실행 시점

### 9.1 자동 마이그레이션
- 위젯 마운트 시
- 기존 키 확인 후 자동 변환

### 9.2 수동 마이그레이션
- 설정 화면에서 "데이터 마이그레이션" 버튼 제공 (옵션)

---

## 10. 검증 체크리스트

- [ ] 모든 필수 필드가 채워짐
- [ ] 타입이 올바름 (TypeScript 검증)
- [ ] conditionCode가 enum 값
- [ ] iconCode가 OWM 스타일
- [ ] location이 객체 형식
- [ ] timestamp가 올바른 형식
- [ ] 한글/영문 혼재 없음
- [ ] 이모지/OWM 코드 혼재 없음
- [ ] 기본값이 적절히 채워짐
- [ ] 롤백 플랜 검증됨

