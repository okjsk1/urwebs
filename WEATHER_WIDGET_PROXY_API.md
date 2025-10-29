# WeatherWidget 프록시 API 계약서

## 1. API 엔드포인트

### 1.1 현재 날씨
```
GET /api/weather/current?lat={lat}&lon={lon}
```

### 1.2 시간별 예보
```
GET /api/weather/hourly?lat={lat}&lon={lon}
```

### 1.3 일별 예보
```
GET /api/weather/daily?lat={lat}&lon={lon}
```

---

## 2. 요청 스키마

### 2.1 쿼리 파라미터

| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|------|------|
| `lat` | `number` | ✅ | 위도 (-90 ~ 90) |
| `lon` | `number` | ✅ | 경도 (-180 ~ 180) |

### 2.2 요청 예시
```
GET /api/weather/current?lat=37.5665&lon=126.9780
```

---

## 3. 응답 스키마

### 3.1 성공 응답

#### 현재 날씨
```json
{
  "data": {
    "location": {
      "name": "서울",
      "lat": 37.5665,
      "lon": 126.9780,
      "timezone": "Asia/Seoul"
    },
    "temperatureC": 22.5,
    "feelsLikeC": 24.3,
    "windSpeedMS": 5.2,
    "windDirection": 180,
    "visibilityM": 10000,
    "pressureHpa": 1013,
    "humidity": 65,
    "uvIndex": 5,
    "sunriseTs": 1720000000000,
    "sunsetTs": 1720040000000,
    "conditionCode": "clear",
    "conditionKo": "맑음",
    "iconCode": "01d",
    "timestamp": 1720000000000,
    "provider": "openweather"
  },
  "cached": false,
  "ttl": 300000
}
```

#### 시간별 예보
```json
{
  "data": [
    {
      "timestamp": 1720000000000,
      "tempC": 22.5,
      "feelsLikeC": 24.3,
      "pop": 30,
      "precipMm": 2.5,
      "iconCode": "09d",
      "conditionCode": "rain",
      "conditionKo": "비",
      "windSpeedMS": 5.2,
      "humidity": 65
    }
  ],
  "cached": false,
  "ttl": 1800000
}
```

#### 일별 예보
```json
{
  "data": [
    {
      "date": "2025-01-15",
      "timestamp": 1720000000000,
      "minC": 15,
      "maxC": 25,
      "pop": 40,
      "precipMm": 5.0,
      "iconCode": "10d",
      "conditionCode": "rain",
      "conditionKo": "비",
      "sunriseTs": 1720000000000,
      "sunsetTs": 1720040000000,
      "windSpeedMS": 5.2,
      "humidity": 65
    }
  ],
  "cached": false,
  "ttl": 3600000
}
```

### 3.2 에러 응답

```json
{
  "error": {
    "code": "RATE_LIMIT",
    "message": "API 호출 횟수 초과",
    "retryAfter": 60
  }
}
```

#### 에러 코드

| 코드 | HTTP 상태 | 설명 |
|------|----------|------|
| `RATE_LIMIT` | `429` | Rate Limit 초과 |
| `INVALID_LOCATION` | `400` | 잘못된 위치 좌표 |
| `SERVICE_UNAVAILABLE` | `503` | 서비스 일시 중단 |
| `INTERNAL_ERROR` | `500` | 내부 서버 오류 |

---

## 4. 캐시 헤더

### 4.1 응답 헤더

| 헤더 | 값 | 설명 |
|------|-----|------|
| `Cache-Control` | `public, max-age=300` | 현재 날씨: 5분 |
| `Cache-Control` | `public, max-age=1800` | 시간별: 30분 |
| `Cache-Control` | `public, max-age=3600` | 일별: 60분 |
| `ETag` | `"abc123"` | ETag (선택) |
| `X-Cache-Status` | `HIT` 또는 `MISS` | 캐시 상태 |

---

## 5. Rate Limit

### 5.1 제한 규칙

- 사용자별: 최대 60회/시간
- IP별: 최대 100회/시간

### 5.2 Rate Limit 응답

```json
{
  "error": {
    "code": "RATE_LIMIT",
    "message": "API 호출 횟수 초과",
    "retryAfter": 60,
    "limit": 60,
    "remaining": 0
  }
}
```

### 5.3 Rate Limit 헤더

| 헤더 | 값 | 설명 |
|------|-----|------|
| `X-RateLimit-Limit` | `60` | 시간당 제한 |
| `X-RateLimit-Remaining` | `45` | 남은 횟수 |
| `X-RateLimit-Reset` | `1720000000` | 리셋 시각 (Unix timestamp) |

---

## 6. 보안

### 6.1 API 키 관리
- 클라이언트에서 직접 키 사용 금지
- 프록시에서만 키 사용
- 환경 변수로 키 관리

### 6.2 CORS 설정
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET
Access-Control-Allow-Headers: Content-Type
```

---

## 7. 예시 구현 (Edge Function)

### 7.1 Vercel Edge Function 예시 (의사코드)

```typescript
// api/weather/current.ts
export default async function handler(req: Request) {
  const { lat, lon } = new URL(req.url).searchParams;
  
  // Rate Limit 체크
  const rateLimit = await checkRateLimit(req);
  if (!rateLimit.allowed) {
    return new Response(JSON.stringify({
      error: {
        code: 'RATE_LIMIT',
        message: 'API 호출 횟수 초과',
        retryAfter: rateLimit.retryAfter
      }
    }), {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': '60',
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': rateLimit.resetTime.toString()
      }
    });
  }
  
  // 캐시 확인
  const cacheKey = `weather:${lat}:${lon}:current`;
  const cached = await cache.get(cacheKey);
  if (cached) {
    return new Response(JSON.stringify({
      data: cached.data,
      cached: true,
      ttl: cached.ttl
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300',
        'X-Cache-Status': 'HIT'
      }
    });
  }
  
  // OpenWeather API 호출
  const apiKey = process.env.OPENWEATHER_API_KEY;
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=kr`;
  
  const response = await fetch(url);
  if (!response.ok) {
    return new Response(JSON.stringify({
      error: {
        code: 'SERVICE_UNAVAILABLE',
        message: '날씨 서비스 일시 중단'
      }
    }), {
      status: response.status
    });
  }
  
  const data = await response.json();
  
  // 표준 스키마로 변환
  const normalized = normalizeOpenWeatherData(data, lat, lon);
  
  // 캐시 저장
  await cache.set(cacheKey, normalized, 300000); // 5분
  
  return new Response(JSON.stringify({
    data: normalized,
    cached: false,
    ttl: 300000
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300',
      'X-Cache-Status': 'MISS'
    }
  });
}
```

---

## 8. 배포 체크리스트

- [ ] Edge Function 배포 완료
- [ ] 환경 변수 설정 (API 키)
- [ ] Rate Limit 로직 구현
- [ ] 캐시 설정 (Vercel KV 또는 Redis)
- [ ] CORS 설정
- [ ] 에러 핸들링 구현
- [ ] 로깅 설정
- [ ] 모니터링 설정

---

## 9. 모니터링

### 9.1 메트릭
- API 호출 횟수
- Rate Limit 초과 횟수
- 에러율
- 응답 시간
- 캐시 히트율

### 9.2 알림
- Rate Limit 초과 시 알림
- 에러율 임계값 초과 시 알림
- 응답 시간 지연 시 알림

