# WeatherWidget 캐시/SWR/취소/백오프/페일오버 흐름도

## 1. Stale-While-Revalidate (SWR) 흐름도

```
사용자 요청
    ↓
캐시 확인 (In-Memory 또는 LocalStorage)
    ↓
┌─────────────────┐
│ 캐시 있음?      │
└─────────────────┘
    │
    ├─ YES → 캐시 데이터 즉시 반환 (UI 갱신)
    │           ↓
    │      백그라운드에서 새 요청 시작
    │           ↓
    │      ┌─────────────────┐
    │      │ 요청 성공?       │
    │      └─────────────────┘
    │           │
    │           ├─ YES → 캐시 업데이트 + UI 갱신 (깜빡임 없음)
    │           └─ NO → 캐시 유지 (에러 표시 안 함)
    │
    └─ NO → 새 요청 시작
              ↓
         ┌─────────────────┐
         │ 요청 성공?       │
         └─────────────────┘
              │
              ├─ YES → 캐시 저장 + 데이터 반환
              └─ NO → 에러 반환
```

### 1.1 SWR 상태 관리

#### 상태 변수
- `cacheData`: 캐시된 데이터 (stale 허용)
- `freshData`: 새로 받은 데이터 (옵션)
- `isRevalidating`: 백그라운드 갱신 중 여부

#### UI 업데이트 규칙
- 캐시 데이터가 있으면 즉시 표시
- 새 데이터 도착 시 부드럽게 교체 (애니메이션 없음)
- 에러 발생 시 에러 표시하지 않고 캐시 유지

---

## 2. 요청 취소/경합 방지 흐름도

```
위치 변경 이벤트
    ↓
┌──────────────────────┐
│ 이전 요청 있음?      │
└──────────────────────┘
    │
    ├─ YES → AbortController.abort() 호출
    │           ↓
    │      이전 요청 취소됨
    │
    └─ NO → 진행
    ↓
새 AbortController 생성
    ↓
새 요청 ID 생성: `${lat}-${lon}-${timestamp}`
    ↓
요청 저장 (ref에 보관)
    ↓
fetch(url, { signal: abortController.signal })
    ↓
┌──────────────────────┐
│ 요청 완료?           │
└──────────────────────┘
    │
    ├─ abort됨 → 응답 무시 (에러 처리 안 함)
    │
    ├─ 성공 → 요청 ID 확인
    │           ↓
    │      ┌──────────────────────┐
    │      │ 최신 요청인가?        │
    │      └──────────────────────┘
    │           │
    │           ├─ YES → 데이터 반영
    │           └─ NO → 응답 무시 (이미 최신 데이터 있음)
    │
    └─ 에러 → 요청 ID 확인 후 최신 요청이면 에러 반환
```

### 2.1 AbortController 패턴

#### 구현 전략
```typescript
// ref로 최신 요청 추적
const requestRef = useRef<{
  id: string;
  controller: AbortController;
} | null>(null);

// 새 요청 시작
const startRequest = (location: WeatherLocation) => {
  // 이전 요청 취소
  if (requestRef.current) {
    requestRef.current.controller.abort();
  }
  
  // 새 요청 생성
  const requestId = `${location.lat}-${location.lon}-${Date.now()}`;
  const controller = new AbortController();
  requestRef.current = { id: requestId, controller };
  
  // fetch 실행
  fetch(url, { signal: controller.signal })
    .then(response => {
      // 요청 ID 확인
      if (requestRef.current?.id === requestId) {
        // 최신 요청이면 반영
        return response.json();
      }
      // 아니면 무시
      return null;
    });
};
```

---

## 3. 재시도/백오프 흐름도

```
API 요청 시작
    ↓
fetch(url)
    ↓
┌──────────────────┐
│ 응답 상태 확인   │
└──────────────────┘
    │
    ├─ 200 OK → 성공 반환
    │
    ├─ 429 Rate Limit → 백오프
    │           ↓
    │      delay = 1000 * (2 ^ attempt)
    │           ↓
    │      setTimeout(재시도, delay)
    │           ↓
    │      ┌──────────────────┐
    │      │ 최대 재시도?      │
    │      └──────────────────┘
    │           │
    │           ├─ YES → 페일오버 또는 에러
    │           └─ NO → 재시도
    │
    ├─ 5xx 서버 오류 → 백오프 (동일)
    │
    └─ 4xx 클라이언트 오류 → 에러 반환 (재시도 안 함)
```

### 3.1 지수 백오프 알고리즘

#### 공식
```
delay = baseDelay * (2 ^ attempt)
```

#### 파라미터
- `baseDelay`: 1000ms (1초)
- `attempt`: 0, 1, 2, ...
- `maxAttempts`: 3회

#### 예시
- 1차 실패: 1초 대기
- 2차 실패: 2초 대기
- 3차 실패: 4초 대기
- 4차 실패: 에러 반환 또는 페일오버

---

## 4. 프로바이더 페일오버 흐름도

```
getCurrentWeather(location)
    ↓
프로바이더 목록 순회: [OpenWeather, Simulation]
    ↓
┌─────────────────────────┐
│ OpenWeather 시도        │
└─────────────────────────┘
    │
    ├─ 성공 → 캐시 저장 + 반환
    │
    ├─ 401/403 (인증 오류) → 다음 프로바이더로
    │           ↓
    │      ┌─────────────────────────┐
    │      │ Simulation 시도        │
    │      └─────────────────────────┘
    │           │
    │           ├─ 성공 → 캐시 저장 + 반환
    │           └─ 실패 → 에러 반환
    │
    ├─ 429/5xx (일시 오류) → 재시도
    │           ↓
    │      ┌──────────────────┐
    │      │ 최대 재시도?      │
    │      └──────────────────┘
    │           │
    │           ├─ YES → 다음 프로바이더로
    │           └─ NO → 백오프 후 재시도
    │
    └─ 네트워크 오류 → 다음 프로바이더로
```

### 4.1 페일오버 조건

#### 즉시 페일오버 (재시도 안 함)
- `401` Unauthorized (API 키 오류)
- `403` Forbidden (권한 없음)
- `404` Not Found (위치 없음)
- 네트워크 오류 (타임아웃 제외)

#### 재시도 후 페일오버
- `429` Rate Limit (백오프 후 재시도)
- `500/502/503` 서버 오류 (백오프 후 재시도)
- 타임아웃 (백오프 후 재시도)

---

## 5. 캐시 계층 흐름도

```
데이터 요청
    ↓
┌─────────────────────┐
│ In-Memory Cache 확인│
└─────────────────────┘
    │
    ├─ HIT → ┌─────────────────────┐
    │        │ TTL 유효?            │
    │        └─────────────────────┘
    │            │
    │            ├─ YES → 즉시 반환 (SWR 적용)
    │            └─ NO → LocalStorage 확인
    │
    └─ MISS → ┌─────────────────────┐
              │ LocalStorage 확인    │
              └─────────────────────┘
                  │
                  ├─ HIT → ┌─────────────────────┐
                  │        │ TTL 유효?            │
                  │        └─────────────────────┘
                  │            │
                  │            ├─ YES → In-Memory에 로드 + 반환
                  │            └─ NO → 새 요청 시작
                  │
                  └─ MISS → 새 요청 시작
                              ↓
                         ┌─────────────────────┐
                         │ 요청 성공?           │
                         └─────────────────────┘
                             │
                             ├─ YES → In-Memory + LocalStorage 저장
                             └─ NO → 에러 반환
```

### 5.1 캐시 키 생성 규칙

#### 형식
```
{provider}:{lat}:{lon}:{type}:{rounding}
```

#### 예시
- `openweather:37.6:126.9:current:0.1`
- `simulation:37.6:126.9:hourly:0.1`

#### 좌표 반올림
- `lat`: 0.1° 단위 반올림 (37.5665 → 37.6)
- `lon`: 0.1° 단위 반올림 (126.9780 → 126.9)

---

## 6. 오프라인 모드 흐름도

```
온라인 상태 확인
    ↓
┌─────────────────────┐
│ navigator.onLine?   │
└─────────────────────┘
    │
    ├─ TRUE → 정상 흐름 (캐시/SWR/페일오버)
    │
    └─ FALSE → ┌─────────────────────┐
                │ 오프라인 모드        │
                └─────────────────────┘
                    ↓
                ┌─────────────────────┐
                │ Last Known Good 확인 │
                └─────────────────────┘
                    │
                    ├─ 있음 → 데이터 표시 + "오프라인" 배지
                    │           + "마지막 업데이트: X분 전"
                    │
                    └─ 없음 → 빈 상태 + "오프라인" 배지
                               + "연결 후 다시 시도" 메시지

온라인 복귀 이벤트 감지
    ↓
┌─────────────────────┐
│ online 이벤트       │
└─────────────────────┘
    ↓
자동 재시도 (최대 1회)
    ↓
┌─────────────────────┐
│ 성공?               │
└─────────────────────┘
    │
    ├─ YES → 배지 제거 + 데이터 갱신
    └─ NO → 배지 유지 + 에러 표시
```

### 6.1 Last Known Good 저장 규칙

#### 저장 시점
- 정상 응답 수신 시
- TTL 무시하고 항상 저장

#### 저장 위치
- LocalStorage: `weather_lastGood_${widgetId}`

#### 저장 데이터
- 전체 WeatherState (currentWeather, hourlyForecast, dailyForecast)
- `lastUpdated` timestamp

---

## 7. 가시성 기반 갱신 흐름도

```
컴포넌트 마운트
    ↓
┌─────────────────────┐
│ autoRefresh 활성?   │
└─────────────────────┘
    │
    ├─ NO → 수동 새로고침만 가능
    │
    └─ YES → ┌─────────────────────┐
              │ IntersectionObserver │
              │ (위젯 가시성 감지)   │
              └─────────────────────┘
                  │
                  ├─ 보임 → ┌─────────────────────┐
                  │        │ Page Visibility 확인 │
                  │        └─────────────────────┘
                  │            │
                  │            ├─ visible → 타이머 시작
                  │            │           ↓
                  │            │      refreshInterval 후 갱신
                  │            │
                  │            └─ hidden → 타이머 중지
                  │
                  └─ 안 보임 → 타이머 중지
```

### 7.1 이벤트 리스너 관리

#### 등록/해제 규칙
- 동일 참조 유지: `useCallback`으로 핸들러 메모이제이션
- `useRef`로 타이머 참조 보관
- cleanup에서 정확한 참조로 해제

#### 구현 예시
```typescript
const visibilityHandler = useCallback(() => {
  if (document.visibilityState === 'visible' && isVisible) {
    startTimer();
  } else {
    stopTimer();
  }
}, [isVisible]);

useEffect(() => {
  document.addEventListener('visibilitychange', visibilityHandler);
  return () => {
    document.removeEventListener('visibilitychange', visibilityHandler);
  };
}, [visibilityHandler]);
```

---

## 8. 성능 최적화 규칙

### 8.1 가시 영역 최적화
- 위젯이 화면 밖에 있으면 자동 갱신 중지
- 다시 보이면 즉시 갱신 (누락 방지)

### 8.2 탭 비활성 최적화
- 백그라운드 탭에서는 자동 갱신 중지
- 다시 활성화되면 즉시 갱신

### 8.3 Motion 감소 고려
- `prefers-reduced-motion` 감지 시 애니메이션 최소화
- 스켈레톤 로딩 애니메이션 비활성화

---

## 9. 에러 처리 전략

### 9.1 에러 타입별 처리

| 에러 타입 | 처리 방법 |
|----------|----------|
| 네트워크 오류 | 시뮬레이터로 폴백 |
| API 키 오류 | 시뮬레이터로 폴백 |
| Rate Limit | 백오프 후 재시도 |
| 위치 없음 | 에러 메시지 표시 (폴백 안 함) |
| 타임아웃 | 백오프 후 재시도 → 폴백 |

### 9.2 사용자 피드백
- 에러 발생 시 토스트 메시지
- 재시도 버튼 제공
- 오프라인 상태 표시

---

## 10. 테스트 시나리오

### TC-1: SWR 동작
- 캐시 데이터 즉시 표시
- 백그라운드 갱신 완료
- 새 데이터로 UI 업데이트 (깜빡임 없음)

### TC-2: 요청 취소
- 연속 위치 변경 시 이전 요청 취소
- 최신 요청만 반영

### TC-3: 백오프
- 429 오류 발생 시 지수 백오프 적용
- 최대 재시도 횟수 제한

### TC-4: 페일오버
- OpenWeather 실패 시 시뮬레이터로 전환
- 사용자에게 투명하게 처리

### TC-5: 오프라인
- 네트워크 차단 시 마지막 정상 데이터 표시
- 온라인 복귀 시 자동 갱신

### TC-6: 가시성
- 위젯이 화면 밖에 있을 때 갱신 중지
- 다시 보이면 갱신 재개

