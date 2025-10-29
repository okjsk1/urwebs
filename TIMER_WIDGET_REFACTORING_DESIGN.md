# TimerWidget 리팩터링 설계서

## 0. 현재 문제 진단 및 해결 방안

### 문제 1: 카운트다운/포모도로 매 틱 re-render 미동작
**증상**: `updateTimer`에서 카운트다운/포모도로 모드일 때 `setState`를 호출하지 않아 UI가 갱신되지 않음.

**해결**: 
- 더미 상태 변수 `tick` 추가하여 매 틱마다 증가시켜 강제 리렌더링
- 또는 `getDisplayTime()`에서 계산된 시간을 상태로 관리

### 문제 2: 스톱워치 누적 오차
**증상**: `elapsed = now - startTimeRef.current + state.elapsedMs`를 매번 실행하면 이미 누적된 값을 계속 더해 중복 가산 위험.

**해결**:
- 단일 소스 오브 트루스: `startEpoch`와 `accumulatedMs`만 관리
- 일시정지 시 `accumulatedMs`에 경과 시간 누적, `startEpoch` 재설정

### 문제 3: setInterval + 캡처 상태(stale closure)
**증상**: `updateTimer`의 의존성 배열에 `state`가 있어 오래된 상태 참조 가능.

**해결**:
- `useRef`로 최신 상태 참조
- 또는 `useCallback` 의존성 최소화하고 ref 패턴 사용

### 문제 4: 탭 비활성/가시영역 외에서 불필요한 틱
**증상**: `Page Visibility API` 및 `IntersectionObserver` 미사용으로 성능/배터리 손실.

**해결**:
- `document.visibilityState` 감지하여 탭 비활성 시 틱 중지
- `IntersectionObserver`로 위젯이 화면에 보일 때만 틱 실행

### 문제 5: 사운드/알림 예외 처리 미흡
**증상**: 사용자 제스처 없는 `play()` 실패, 탭 비활성 시 알림 부족.

**해결**:
- `Notification API` 사용하여 데스크톱 알림
- `play()` 실패 시 토스트 메시지 표시
- 브라우저 정책 준수 (사용자 상호작용 후에만 재생)

---

## 1. 타이머 엔진 리팩터링 설계

### 1.1 단일 소스 오브 트루스 (TimeBase)

**상태 구조**:
```typescript
interface TimerCore {
  // 시간 추적
  startEpoch: number | null;        // 시작 시점 (Unix timestamp)
  accumulatedMs: number;              // 일시정지 시 누적된 시간 (밀리초)
  
  // 제어
  running: boolean;
  mode: TimerMode;
  
  // 포모도로 특화
  pomoPhase: 'work' | 'rest';
  pomoRounds: number;
  pomoWorkMin: number;
  pomoRestMin: number;
  
  // 설정
  targetMs?: number;                  // 카운트다운 목표 시점
  sound: boolean;
  notifyEnabled: boolean;
}

// 계산된 값 (파생 상태)
interface DisplayTime {
  remainingMs: number;                // 남은 시간 (카운트다운/포모도로)
  elapsedMs: number;                  // 경과 시간 (스톱워치)
  isExpired: boolean;                 // 종료 여부
}
```

**시간 계산 공식**:
- **스톱워치**: `elapsedMs = accumulatedMs + (running ? now - startEpoch : 0)`
- **카운트다운**: `remainingMs = targetMs - (accumulatedMs + (running ? now - startEpoch : accumulatedMs))`
- **포모도로**: `remainingMs = phaseDuration - (accumulatedMs + (running ? now - startEpoch : accumulatedMs))`

### 1.2 틱 전략

**틱 간격**: 200ms (또는 250ms)
- UI 갱신에는 충분하면서도 CPU 부하 최소화
- 카운트다운/포모도로도 더미 `tick` 상태 증가로 강제 리렌더링

**가시성 제어**:
```typescript
// IntersectionObserver로 위젯이 화면에 보이는지 확인
const observer = new IntersectionObserver((entries) => {
  setIsVisible(entries[0].isIntersecting);
});

// Page Visibility API로 탭 활성 상태 확인
document.addEventListener('visibilitychange', () => {
  setIsPageVisible(!document.hidden);
});

// 틱은 가시 영역일 때만 실행
if (isVisible && isPageVisible && state.running) {
  // 틱 실행
}
```

### 1.3 정밀도 보장

**일시정지/재개**:
```typescript
pause() {
  if (state.running) {
    const now = Date.now();
    setState(prev => ({
      ...prev,
      accumulatedMs: prev.accumulatedMs + (now - prev.startEpoch!),
      startEpoch: null,
      running: false
    }));
  }
}

resume() {
  if (!state.running) {
    setState(prev => ({
      ...prev,
      startEpoch: Date.now(),
      running: true
    }));
  }
}
```

**종료 임계 처리**:
- `remainingMs <= 0` 체크를 매 틱마다 실행
- 중복 알림 방지를 위한 플래그 사용
- 정확히 한 번만 알림/사운드 실행

### 1.4 포모도로 페이즈 머신

**상태 전이**:
```
work (25분) → [종료] → rest (5분) → [종료] → work (25분) + rounds++
```

**전이 로직**:
```typescript
onPhaseComplete() {
  const nextPhase = state.pomoPhase === 'work' ? 'rest' : 'work';
  const newRounds = nextPhase === 'work' ? state.pomoRounds + 1 : state.pomoRounds;
  
  setState(prev => ({
    ...prev,
    pomoPhase: nextPhase,
    pomoRounds: newRounds,
    startEpoch: Date.now(),
    accumulatedMs: 0
  }));
  
  trackEvent('timer_phase_change', {
    phase: nextPhase,
    rounds: newRounds
  });
}
```

### 1.5 공개 API 스펙

```typescript
interface TimerAPI {
  // 제어 메서드
  start(): void;
  pause(): void;
  reset(): void;
  
  // 설정 메서드
  setCountdown(minutes: number, seconds?: number): void;
  setPomodoro(config: { workMin: number; restMin: number }): void;
  switchMode(mode: TimerMode): void;
  toggleSound(): void;
  
  // 이벤트 훅
  onStart?: () => void;
  onPause?: () => void;
  onReset?: () => void;
  onPhaseChange?: (phase: 'work' | 'rest', rounds: number) => void;
  onFinish?: (mode: TimerMode) => void;
  onTick?: (displayTime: DisplayTime) => void; // 옵션
}
```

**퍼시스트 키**: `timer_${id}` 유지 (호환성)

---

## 2. UI/UX 개선 설계

### 2.1 큰 시계 + 세컨드라인 정보

**레이아웃**:
```
┌─────────────────────────┐
│  [모드 탭]              │
│                         │
│       MM:SS             │  ← 큰 시계 (text-5xl)
│    남은 시간            │  ← 세컨드라인 (작은 텍스트)
│                         │
│  [재생/일시정지] [리셋] │
└─────────────────────────┘
```

**포모도로 모드 추가 정보**:
```
┌─────────────────────────┐
│       MM:SS             │
│    작업 • 3라운드       │  ← 현재 페이즈 + 라운드
│    다음: 휴식 5분       │  ← 다음 페이즈 정보
└─────────────────────────┘
```

### 2.2 프리셋 영역

**카운트다운 프리셋**:
- 빠른 버튼: 5분, 10분, 15분, 30분
- 커스텀 입력 모달: 분/초 입력

**포모도로 프리셋**:
- 기본: 25/5분
- 긴 작업: 50/10분
- 초집중: 90/15분

### 2.3 피드백 강화

**종료 시**:
1. 사운드 재생 (브라우저 정책 준수)
2. 데스크톱 알림 (`Notification API`)
3. 문서 제목 깜박임 (옵션)
4. 토스트 메시지 표시

**진행률 표시** (옵션):
- 원형 프로그레스 링 (SVG)
- 직선 프로그레스 바
- 접근성 고려: `prefers-reduced-motion` 감지 시 비활성화

### 2.4 컴팩트 모드

**핀/사이드바용 한 줄 표시**:
```
[⏱️] 05:23 [▶] [⏸] [🔊]
```

### 2.5 키보드 & 포커스

**단축키**:
- `Space`: 시작/정지
- `R`: 리셋
- `1/2/3`: 모드 전환
- `[/]`: 프리셋 순환

**접근성**:
- 포커스 링 명확히 표시
- `aria-live="polite"` 영역에 상태 변경 안내
- 버튼에 `aria-pressed` 속성

---

## 3. 접근성 & 성능

### 3.1 접근성 (A11y)

**ARIA 속성**:
```tsx
<div role="timer" aria-live="polite" aria-atomic="true">
  <span aria-label="남은 시간">{displayTime}</span>
</div>

<button 
  aria-pressed={state.running}
  aria-label={state.running ? "일시정지" : "시작"}
>
  {state.running ? <Pause /> : <Play />}
</button>
```

**스크린리더 지원**:
- 모드 변경 시 "카운트다운 모드로 전환" 읽기
- 종료 시 "타이머가 완료되었습니다" 읽기
- Lighthouse A11y 점수 95+ 목표

### 3.2 성능 최적화

**가시 영역 최적화**:
- `IntersectionObserver`로 위젯이 화면에 보일 때만 틱 실행
- 탭 비활성 시 자동 일시정지 (옵션)

**사운드 처리**:
- 첫 사용자 상호작용 전에는 자동 재생 시도 안 함
- `play()` 실패 시 무음 모드 시도
- 브라우저 정책 준수

---

## 4. 분석 이벤트 정의

```typescript
// 이벤트 종류
'timer_start' | 'timer_pause' | 'timer_reset' | 'timer_mode_change' | 
'timer_finish' | 'timer_phase_change' | 'timer_preset_apply'

// 공통 파라미터
interface TimerEventParams {
  mode: TimerMode;
  phase?: 'work' | 'rest';
  preset?: string;
  durationMs?: number;
  remainingMs?: number;
  rounds?: number;
  source: 'button' | 'keyboard';
}
```

---

## 5. 에지 케이스 처리

### 5.1 카운트다운 목표 시간 변경 중 실행 상태 유지
- 실행 중 목표 시간 변경 시 즉시 반영
- 재시작 없이 새로운 목표까지 카운트다운

### 5.2 포모도로 작업/휴식 길이 실시간 변경
- 변경 시 다음 페이즈부터 적용 옵션
- 또는 현재 페이즈 남은 시간에 비례하여 조정

### 5.3 Audio.play() 실패 처리
- 실패 시 토스트 안내
- 시스템 알림으로 대체

### 5.4 시스템 슬립/휴면 복귀 시 시간 보정
- `visibilitychange` 이벤트 감지
- 복귀 시 `now` 다시 샘플링하여 시간 보정

---

## 6. 수용 기준 (테스트 시나리오)

1. ✅ 카운트다운 실시간 갱신: 10분 설정 후 1초 단위로 시간 감소 표시 (시각적 끊김 없음)
2. ✅ 스톱워치 누적 정확: 5초 실행 → 3초 정지 → 2초 실행 = 총 7초 (±200ms 이내)
3. ✅ 포모도로 전이: 0초 도달 시 한 번만 사운드/알림, work→rest 전환 및 rounds +1
4. ✅ 호버·포커스 무관: Space/버튼 반응, 키보드만으로 전 기능 수행 가능
5. ✅ 가시영역 최적화: 위젯이 화면 밖이면 틱 중지, 다시 보이면 재개 (로그로 확인)
6. ✅ 브라우저 정책: 첫 사용자 상호작용 전에는 자동 재생 사운드 미시도
7. ✅ 퍼시스트: 새로고침 후 모드/설정/사운드/진행 상태가 의도대로 복원
8. ✅ 알림 허용 안 됨: 거부 시 graceful fallback (토스트 + 타이틀 깜박임)
9. ✅ 접근성: 스크린리더에서 모드 변경/종료가 읽힌다. Lighthouse A11y 95+

---

## 7. 납품물 체크리스트

- [x] 리팩터링 설계서 (본 문서)
- [ ] 공개 API/이벤트 명세서
- [ ] UX 와이어 설명
- [ ] 테스트 케이스 체크리스트 및 수동 테스트 절차
- [ ] 리팩터링된 코드 구현

