# WeatherWidget & WeatherService 리팩터링 설계서

## 0. 현재 문제 진단 및 해결 체크리스트

### 문제 1: 스키마 불일치
**재현**:
- WeatherWidget.tsx:525에서 `hour.timestamp` 사용
- weatherService.ts:585에서 시뮬레이션은 `time` 필드 사용
- DailyForecast 인터페이스는 `temperature: {min, max}`인데, 시뮬레이션은 `maxTemperature/minTemperature` 사용

**수정**:
- 단일 표준 스키마 정의 (서비스 계층)
- 모든 프로바이더/시뮬레이터가 표준 스키마로 변환하도록 어댑터 패턴 적용
- 인터페이스 필드명 통일: `timestamp` (HourlyForecast), `temperature: {min, max}` (DailyForecast)

**검증**:
- 모든 프로바이더에서 동일한 필드명으로 데이터 반환 확인
- TypeScript 타입 체크 통과

---

### 문제 2: condition/description/icon 혼재
**재현**:
- OpenWeather: `condition: 'Clear'`, `description: 'clear sky'` (영문)
- 시뮬레이터: `condition: '맑음'` (한글)
- icon: 이모지 vs OWM 코드 ('01d') 혼재

**수정**:
- 표준 스키마: `conditionCode` (enum: clear/clouds/rain/snow/thunder/drizzle/mist/fog/haze)
- `conditionKo` (표시용 한글 라벨)
- `iconCode` (OWM 스타일: '01d', '01n' 등) → 위젯에서 이모지/이미지로 변환

**검증**:
- 모든 프로바이더에서 conditionCode enum으로 반환
- iconCode 일관성 확인

---

### 문제 3: 단위/포맷 불일치
**재현**:
- 서비스는 항상 SI (Celsius, m/s, m, hPa)로 내려줌
- 위젯은 units(metric|imperial)로 표시 포맷만 변경
- 풍속/가시거리/기압 환산 누락 (현재는 온도만 변환)

**수정**:
- 서비스는 항상 SI 유지 (단일 진실원본)
- 위젯에서 weatherUnits 유틸로 모든 단위 변환 (온도/풍속/거리/기압)

**검증**:
- metric ↔ imperial 전환 시 모든 값이 정확히 변환됨
- 참값 대비 오차 허용 범위 내 (±0.1°C, ±0.1 km/h, ±0.01 inHg)

---

### 문제 4: visibilitychange 리스너 해제 실패
**재현**:
- WeatherWidget.tsx:195에서 `removeEventListener('visibilitychange', () => {})` → 빈 함수로 해제 실패

**수정**:
- 동일 참조 유지: `useCallback`으로 핸들러 메모이제이션
- `useRef`로 타이머 참조 보관하여 정확한 cleanup

**검증**:
- 탭 전환 시 이벤트 리스너 중복 없음
- 메모리 릭 없음 (DevTools 확인)

---

### 문제 5: AbortController/경합 취소 부재
**재현**:
- 연속 위치 변경 시 이전 요청이 완료되어 최신 데이터 덮어쓰기 가능

**수정**:
- 각 요청에 `AbortController` 할당
- 새 요청 시 이전 요청 abort
- 경합 방지: 요청 ID로 최신 요청만 반영

**검증**:
- 연속 위치 변경 시 최신 데이터만 반영
- 취소된 요청 응답 무시 확인

---

### 문제 6: 오프라인/에러 처리 미흡
**재현**:
- 오프라인 시 UI 알림은 있으나, 캐시된 마지막 정상 데이터 재표시(Last Known Good) 전략 문서화 부재

**수정**:
- 오프라인 감지: `navigator.onLine` + `online/offline` 이벤트
- Last Known Good: 마지막 정상 데이터 LocalStorage에 저장 (TTL 무시)
- 오프라인 배지 표시 + "마지막 업데이트: X분 전" 표시

**검증**:
- 네트워크 차단 후 마지막 정상 데이터 표시
- 온라인 복귀 시 자동 갱신

---

### 문제 7: OpenWeather 일별 집계 로직 간략
**재현**:
- weatherService.ts:272-296에서 3시간 간격 데이터로 일별 집계
- 단순 min/max만 계산, 중복/누락 가능성
- 일출/일몰 미전달

**수정**:
- 일별 집계 알고리즘 명세화:
  - 날짜별로 그룹화 (타임존 기준)
  - min/max 온도: 전체 데이터에서 실제 최소/최대값
  - 강수량: 합계 (중복 제거)
  - POP: 최대값 또는 평균 (정책 명시)
  - 일출/일몰: API에서 제공 시 사용, 없으면 계산

**검증**:
- 경계일(자정 교차) 데이터 정확도 확인
- 일출/일몰 정확도 확인

---

## 1. 데이터 스키마 표준화 (단일 진실원본: 서비스 계층)

### 1.1 표준 스키마 정의

#### CurrentWeather
```typescript
interface CurrentWeather {
  // 위치
  location: WeatherLocation;
  
  // 온도 (SI: Celsius)
  temperatureC: number;           // °C
  feelsLikeC: number;             // 체감 온도 °C
  
  // 풍속/풍향 (SI: m/s)
  windSpeedMS: number;            // m/s
  windDirection: number;          // degrees (0-360)
  
  // 가시거리 (SI: meters)
  visibilityM: number;            // meters
  
  // 기압 (SI: hPa)
  pressureHpa: number;           // hPa
  
  // 기타
  humidity: number;               // % (0-100)
  uvIndex?: number;               // 0-11+
  
  // 일출/일몰 (KST timestamp)
  sunriseTs?: number;             // Unix timestamp (ms)
  sunsetTs?: number;              // Unix timestamp (ms)
  
  // 날씨 상태 (표준화)
  conditionCode: WeatherCondition;  // enum
  conditionKo: string;            // 표시용 한글 라벨
  iconCode: string;                // '01d', '01n' 등
  
  // 메타데이터
  timestamp: number;              // Unix timestamp (ms)
  provider: string;                // 'openweather' | 'simulation'
}
```

#### HourlyForecast
```typescript
interface HourlyForecast {
  timestamp: number;              // Unix timestamp (ms) - KST 기준
  tempC: number;                   // °C
  feelsLikeC: number;              // 체감 온도 °C
  pop: number;                     // 강수 확률 % (0-100)
  precipMm: number;                // 강수량 mm
  iconCode: string;                // '01d', '09n' 등
  conditionCode: WeatherCondition;
  conditionKo: string;
  windSpeedMS: number;             // m/s
  humidity: number;                // %
}
```

#### DailyForecast
```typescript
interface DailyForecast {
  date: string;                    // 'YYYY-MM-DD' (KST 기준)
  timestamp: number;               // 해당 날짜 00:00 KST Unix timestamp
  minC: number;                    // 최저 온도 °C
  maxC: number;                    // 최고 온도 °C
  pop: number;                     // 강수 확률 % (0-100)
  precipMm: number;               // 강수량 mm
  iconCode: string;                // 대표 아이콘
  conditionCode: WeatherCondition;
  conditionKo: string;
  sunriseTs?: number;              // 일출 timestamp
  sunsetTs?: number;               // 일몰 timestamp
  windSpeedMS: number;             // m/s (평균 또는 최대)
  humidity: number;                // % (평균)
}
```

#### WeatherCondition Enum
```typescript
type WeatherCondition = 
  | 'clear' 
  | 'clouds' 
  | 'rain' 
  | 'snow' 
  | 'thunder' 
  | 'drizzle' 
  | 'mist' 
  | 'fog' 
  | 'haze';
```

### 1.2 프로바이더 어댑터 매핑표

#### OpenWeatherMap → 표준 스키마
| OpenWeather 필드 | 표준 스키마 필드 | 변환 규칙 |
|-----------------|----------------|----------|
| `main.temp` | `temperatureC` | 직접 사용 (이미 Celsius) |
| `main.feels_like` | `feelsLikeC` | 직접 사용 |
| `wind.speed` | `windSpeedMS` | 직접 사용 (이미 m/s) |
| `wind.deg` | `windDirection` | 직접 사용 |
| `visibility` | `visibilityM` | 직접 사용 (이미 meters) |
| `main.pressure` | `pressureHpa` | 직접 사용 |
| `main.humidity` | `humidity` | 직접 사용 |
| `weather[0].main` | `conditionCode` | 매핑표 적용 (Clear→clear, Clouds→clouds 등) |
| `weather[0].description` | `conditionKo` | 언어 맵 적용 또는 번역 |
| `weather[0].icon` | `iconCode` | 직접 사용 ('01d', '01n' 등) |
| `sys.sunrise` | `sunriseTs` | `* 1000` (초→밀리초) |
| `sys.sunset` | `sunsetTs` | `* 1000` |

#### 시뮬레이터 → 표준 스키마
| 시뮬레이터 필드 | 표준 스키마 필드 | 변환 규칙 |
|---------------|----------------|----------|
| `temperature` | `temperatureC` | 직접 사용 |
| `condition` (한글) | `conditionCode` | 한글→영문 매핑표 적용 ('맑음'→'clear') |
| `condition` | `conditionKo` | 직접 사용 |
| `icon` (이모지) | `iconCode` | 이모지→OWM 코드 매핑표 |

### 1.3 아이콘/조건 코드 매핑표

#### OWM 아이콘 코드 → 이모지/이미지
| iconCode | 낮 (d) | 밤 (n) | 설명 |
|---------|--------|--------|------|
| `01d` | ☀️ | - | 맑음 |
| `01n` | - | 🌙 | 맑음 (밤) |
| `02d` | ⛅ | - | 약간 흐림 |
| `02n` | - | ☁️ | 약간 흐림 (밤) |
| `03d/03n` | ☁️ | ☁️ | 흐림 |
| `04d/04n` | ☁️ | ☁️ | 매우 흐림 |
| `09d/09n` | 🌧️ | 🌧️ | 소나기 |
| `10d` | 🌦️ | - | 비 (낮) |
| `10n` | - | 🌧️ | 비 (밤) |
| `11d/11n` | ⛈️ | ⛈️ | 뇌우 |
| `13d/13n` | ❄️ | ❄️ | 눈 |
| `50d/50n` | 🌫️ | 🌫️ | 안개 |

#### 조건 코드 → 한글 라벨
| conditionCode | conditionKo |
|--------------|------------|
| `clear` | 맑음 |
| `clouds` | 구름 많음 |
| `rain` | 비 |
| `snow` | 눈 |
| `thunder` | 뇌우 |
| `drizzle` | 이슬비 |
| `mist` | 안개 |
| `fog` | 짙은 안개 |
| `haze` | 연무 |

---

## 2. 단위/포맷 전략 (뷰 계층 전용)

### 2.1 변환 규칙

모든 변환은 `weatherUnits.ts`의 헬퍼 함수 사용:

#### 온도 변환
- Celsius → Fahrenheit: `C * 9/5 + 32`
- 위젯 표시: `formatTemperature(celsius, units)`

#### 풍속 변환
- metric: `m/s → km/h` (× 3.6)
- imperial: `m/s → mph` (× 2.237)
- 위젯 표시: `formatWindSpeed(metersPerSecond, units)`

#### 거리 변환
- metric: `m → km` (÷ 1000)
- imperial: `m → miles` (× 0.000621371)
- 위젯 표시: `formatDistance(meters, units)`

#### 기압 변환
- metric: `hPa` (그대로)
- imperial: `hPa → inHg` (× 0.02953)
- 위젯 표시: `formatPressure(hPa, units)`

#### 강수량 변환
- metric: `mm` (그대로)
- imperial: `mm → inches` (× 0.0393701)
- 위젯 표시: `formatPrecipitation(mm, units)`

### 2.2 사용 규칙
- 서비스는 항상 SI 반환 (단일 진실원본)
- 위젯은 `units` 상태에 따라 뷰 포맷만 변환
- 변환은 항상 `weatherUnits.ts` 헬퍼 사용 (중복 제거)

---

## 3. 캐시/네트워킹/회복력

### 3.1 캐시 정책

#### 캐시 키 형식
```
{provider}:{lat}:{lon}:{type}:{rounding}
```
- `provider`: 'openweather' | 'simulation'
- `lat`: 0.1° 단위 반올림 (예: 37.5665 → 37.6)
- `lon`: 0.1° 단위 반올림 (예: 126.9780 → 126.9)
- `type`: 'current' | 'hourly' | 'daily'
- `rounding`: 항상 '0.1' (고정)

예시: `openweather:37.6:126.9:current:0.1`

#### TTL (Time To Live)
- `current`: 5분 (300,000ms)
- `hourly`: 30분 (1,800,000ms)
- `daily`: 60분 (3,600,000ms)

#### 캐시 계층
1. **In-Memory Cache**: Map<string, {data, timestamp, ttl}>
2. **LocalStorage Cache** (옵션): 동일 키 + versioning

#### Stale-While-Revalidate (SWR)
- 캐시 데이터가 있으면 즉시 표시 (stale 허용)
- 백그라운드에서 새로고침
- 새 데이터 도착 시 UI 업데이트 (깜빡임 없음)

### 3.2 요청 취소/경합 방지

#### AbortController 패턴
```typescript
// 각 요청에 고유 ID 부여
const requestId = `${location.lat}-${location.lon}-${Date.now()}`;
const abortController = new AbortController();

// 이전 요청 취소
if (previousAbortController) {
  previousAbortController.abort();
}

// 새 요청 저장
previousAbortController = abortController;

// fetch 시 signal 전달
fetch(url, { signal: abortController.signal })
```

#### 경합 방지
- 요청 ID로 최신 요청만 반영
- 취소된 요청 응답 무시

### 3.3 재시도/백오프

#### 지수 백오프 전략
```
delay = baseDelay * (2 ^ attempt)
```
- `baseDelay`: 1000ms
- `attempt`: 0, 1, 2, ...
- 최대 재시도: 3회

#### HTTP 상태 코드별 처리
- `429` (Rate Limit): 백오프 후 재시도
- `5xx` (서버 오류): 백오프 후 재시도
- `4xx` (클라이언트 오류): 재시도 없음 (에러 반환)

### 3.4 프로바이더 페일오버

#### 순차 시도
1. OpenWeatherMap (primary)
2. SimulationProvider (fallback)

#### 페일오버 조건
- 네트워크 오류
- API 키 오류
- Rate Limit 초과
- 타임아웃 (10초)

### 3.5 오프라인 모드

#### Last Known Good 전략
- 마지막 정상 데이터를 LocalStorage에 저장 (TTL 무시)
- 오프라인 시 즉시 표시
- "오프라인" 배지 + "마지막 업데이트: X분 전" 표시

#### 온라인 복귀
- `online` 이벤트 감지
- 자동 재시도 (최대 1회)
- 성공 시 배지 제거

---

## 4. 자동 새로고침/가시성

### 4.1 가시성 기반 갱신

#### 규칙
- 가시 영역에 있을 때만 자동 갱신
- 탭 비활성 시 중지
- `prefers-reduced-motion` 감지 시 빈도 축소

#### 구현 전략
- `IntersectionObserver`로 위젯 가시성 감지
- `document.visibilityState`로 탭 활성 상태 감지
- 동일 참조 유지: `useCallback` + `useRef`

### 4.2 자동 새로고침 설정

#### 사용자 설정
- `autoRefresh`: boolean (기본 true)
- `refreshInterval`: number (분 단위, 기본 10분)

#### 실행 조건
- `autoRefresh === true`
- `document.visibilityState === 'visible'`
- `navigator.onLine === true`
- 위젯이 가시 영역에 있음

### 4.3 이벤트 리스너 관리

#### 등록/해제 규칙
- 동일 참조 유지: `useCallback`으로 핸들러 메모이제이션
- `useRef`로 타이머 참조 보관
- cleanup에서 정확한 참조로 해제

---

## 5. 위치/타임존/지오코딩

### 5.1 위치 검색 (지오코딩)

#### 로컬 매핑 (1차)
- 주요 도시명 매핑 (한글/영문/로마자)
- 오타 교정 규칙 (예: 'seo ul' → '서울')

#### 외부 지오코딩 API (2차, 옵션)
- OpenWeatherMap Geocoding API
- 또는 Google Geocoding API

#### 쿼리 정규화
- 공백 제거
- 소문자 변환
- 한글/영문/로마자 통합 검색

### 5.2 좌표 → 타임존

#### 타임존 보정
- `Intl.DateTimeFormat().resolvedOptions().timeZone` 또는
- 좌표 기반 타임존 DB (예: `geo-tz` 라이브러리)
- 일출/일몰 계산 시 타임존 고려

### 5.3 현재 위치 감지

#### 권한 처리
- 거부: 안내 메시지 + 수동 입력 유도
- 타임아웃 (10초): 재시도 버튼 제공
- 정확도 낮음: 경고 표시 (선택적)

---

## 6. UI/UX 명세

### 6.1 공통 요소

#### 스켈레톤 로딩
- 텍스트 플레이스홀더 (3줄)
- 애니메이션: `animate-pulse`

#### 에러 빈 상태
- 아이콘: `AlertCircle`
- 메시지: "날씨 정보를 불러올 수 없습니다"
- 재시도 버튼

#### lastUpdated 표시
- 상대 시간: "3분 전", "방금 전"
- 절대 시간 (옵션): "14:30"

#### Settings 모달/패널
- 위치 입력: 유효성 검사 후 확인 버튼 클릭 시 적용
- 단위 토글: 즉시 적용
- 자동 새로고침: 토글 즉시 적용

### 6.2 크기별 레이아웃

#### 1x1 (최소)
- 현재 온도 (큰 글씨)
- 날씨 아이콘
- 도시명
- 날씨 상태 (작은 글씨)
- 오프라인 배지 (옵션)
- 설정 버튼 (편집 모드만)

#### 1x2 (+ 시간별)
- 1x1 내용
- 시간별 예보 8개 (가로 스크롤)
  - 시간 (HH:mm)
  - 아이콘
  - 온도
  - 강수량 (옵션)

#### 1x3 (+ 일별)
- 1x2 내용
- 상세 정보 그리드 (습도/풍속/가시거리/기압)
- 일별 예보 5-7일
  - 날짜 (오늘/내일/요일)
  - 아이콘
  - 최저/최고 온도
  - 강수량/POP

### 6.3 아이콘/컬러

#### 조건 코드 기반 색상
- `clear`: 노란색 (`text-yellow-600`)
- `rain`: 파란색 (`text-blue-600`)
- `snow`: 연한 파란색 (`text-blue-300`)
- `clouds`: 회색 (`text-gray-600`)
- `thunder`: 보라색 (`text-purple-600`)

#### 야간 테마
- `*n` 아이콘 코드일 때 어두운 색상 적용
- 다크모드 자동 대응

---

## 7. 접근성 (A11y) & 분석

### 7.1 접근성

#### ARIA 속성
- 상태 변화: `aria-live="polite"` 영역
- 버튼: `aria-label`, `aria-pressed`
- 키보드 포커스 순서: 논리적 순서

#### 키보드 조작
- Enter: 설정 확인
- Escape: 설정 닫기
- Tab: 포커스 이동

#### 색 대비
- 텍스트/배경: 4.5:1 이상 (WCAG AA)
- 다크모드 지원

#### Motion 감소
- `prefers-reduced-motion` 감지 시 애니메이션 최소화

### 7.2 분석 이벤트

#### 이벤트 종류
- `weather_refresh`: 수동 새로고침
- `weather_location_change`: 위치 변경
- `weather_units_change`: 단위 변경
- `weather_provider_failover`: 프로바이더 페일오버
- `weather_offline_view`: 오프라인 상태에서 조회

#### 공통 파라미터
```typescript
{
  provider: string;
  lat: number;
  lon: number;
  ttlHit: boolean;      // 캐시에서 가져왔는지
  swr: boolean;         // SWR로 표시했는지
}
```

---

## 8. 보안/배포

### 8.1 API 키 노출 방지

#### 서버 프록시 전략
- Edge Function (Vercel/Cloudflare)로 키 비공개
- 클라이언트는 프록시 엔드포인트 호출
- 응답 캐시 (ETag/Cache-Control)

#### 프록시 API 계약서
```
GET /api/weather/current?lat=37.5665&lon=126.9780
→ 프록시가 OpenWeather API 호출
→ 응답 캐시 헤더 추가
→ 클라이언트로 반환
```

### 8.2 쿼터 보호

#### Rate Limit
- 사용자별 샘플링: 최대 N회/시간
- 프록시에서 rate limit 적용
- 초과 시 429 응답

---

## 9. 마이그레이션

### 9.1 버전 키
- 기존: `weather_${widgetId}`
- 신규: `weather_state_v2_${widgetId}`

### 9.2 변환 규칙

#### 기존 저장값 → 신규 스키마
- `location` 문자열 → `location: {name, lat, lon}` 객체
- `hour.time` → `hour.timestamp`
- `day.maxTemperature/minTemperature` → `day.temperature: {min, max}`
- `condition` 한글 → `conditionCode` enum + `conditionKo`
- `icon` 이모지 → `iconCode` OWM 스타일

### 9.3 롤백 플랜
- 마이그레이션 실패 시 읽기 전용 모드
- 기존 데이터 유지
- 재로그 후 재시도

---

## 10. 수용 기준 (테스트 시나리오)

### TC-1: 스키마 일관성
- 모든 프로바이더에서 `timestamp`, `minC/maxC`, `iconCode`가 표준 형태로 전달됨

### TC-2: 단위 변환 정확도
- metric ↔ imperial 전환 시 모든 값이 정확히 변환됨 (±0.1°C, ±0.1 km/h, ±0.01 inHg)

### TC-3: SWR 동작
- 캐시 즉시 표시 → 백그라운드 갱신 → UI 업데이트 (깜빡임 없음)

### TC-4: 가시성/취소
- 탭 전환/연속 위치 변경 시 이전 요청 중단, 최신 데이터만 반영

### TC-5: 오프라인 모드
- 네트워크 차단 시 마지막 정상 데이터 + 오프라인 배지 표시
- 온라인 복귀 시 자동 갱신

### TC-6: 일별 집계 정확도
- OpenWeather 3시간 간격 데이터로부터 일별 min/max/강수량/POP 정확 계산
- 경계일(자정 교차) 데이터 정확도 확인

### TC-7: 지오코딩
- '서울', 'Seoul', 'seo ul' 모두 검색 가능 (정규화 규칙 적용)

### TC-8: 접근성
- Lighthouse A11y 95+
- 키보드만으로 설정 변경/갱신 가능

### TC-9: 성능
- 1x3 뷰에서 INP < 200ms
- 메모리 릭/이벤트 리스너 중복 없음

### TC-10: 보안
- 프록시 경유 시 클라이언트 번들에서 API 키 검색 불가

---

## 11. 납품물 체크리스트

- [x] 설계 문서 (본 문서)
- [ ] 프로바이더 어댑터 매핑표 (상세)
- [ ] 아이콘/조건 코드 매핑표 (상세)
- [ ] 캐시/SWR/취소/백오프/페일오버 흐름도
- [ ] 가시성/자동 새로고침 규칙
- [ ] 오프라인 UX 규격
- [ ] 마이그레이션 가이드
- [ ] 테스트 케이스 표
- [ ] 수동 테스트 절차
- [ ] 프록시 API 계약서

