# TimerWidget 공개 API 및 이벤트 명세서

## 1. 공개 API

### 1.1 제어 메서드

#### `start()`
타이머를 시작합니다.

```typescript
start(): void
```

**동작**:
- `running` 상태를 `true`로 설정
- `startEpoch`를 현재 시간으로 설정
- 틱 인터벌 시작
- `onStart` 이벤트 호출

**전제 조건**:
- 타이머가 일시정지 상태여야 함 (`running === false`)

---

#### `pause()`
타이머를 일시정지합니다.

```typescript
pause(): void
```

**동작**:
- `running` 상태를 `false`로 설정
- `accumulatedMs`에 경과 시간 누적
- `startEpoch`를 `null`로 설정
- 틱 인터벌 중지
- `onPause` 이벤트 호출

**전제 조건**:
- 타이머가 실행 중이어야 함 (`running === true`)

---

#### `reset()`
타이머를 초기 상태로 리셋합니다.

```typescript
reset(): void
```

**동작**:
- `running` 상태를 `false`로 설정
- `accumulatedMs`를 `0`으로 리셋
- `startEpoch`를 `null`로 설정
- 틱 인터벌 중지
- 포모도로 모드일 경우 `pomoPhase`를 `'work'`로, `pomoRounds`를 `0`으로 리셋
- `onReset` 이벤트 호출

---

### 1.2 설정 메서드

#### `setCountdown(minutes: number, seconds?: number)`
카운트다운 타이머의 목표 시간을 설정합니다.

```typescript
setCountdown(minutes: number, seconds?: number): void
```

**파라미터**:
- `minutes`: 분 (필수, 0 이상)
- `seconds`: 초 (선택, 기본값 0, 0-59)

**동작**:
- 모드를 `'countdown'`으로 전환
- `targetMs`를 `Date.now() + (minutes * 60 + seconds) * 1000`으로 설정
- 실행 중이면 즉시 적용 (재시작 없이 새 목표까지 카운트다운)

**예외**:
- `minutes < 0` 또는 `seconds < 0` 또는 `seconds >= 60`일 경우 에러

---

#### `setPomodoro(config: { workMin: number; restMin: number })`
포모도로 타이머의 작업/휴식 시간을 설정합니다.

```typescript
setPomodoro(config: { workMin: number; restMin: number }): void
```

**파라미터**:
- `config.workMin`: 작업 시간 (분, 1-60)
- `config.restMin`: 휴식 시간 (분, 1-30)

**동작**:
- 모드를 `'pomodoro'`로 전환
- `pomoWorkMin`, `pomoRestMin` 업데이트
- 실행 중이면 다음 페이즈부터 적용 (또는 현재 페이즈 남은 시간에 비례 조정)

**예외**:
- `workMin < 1` 또는 `workMin > 60`일 경우 에러
- `restMin < 1` 또는 `restMin > 30`일 경우 에러

---

#### `switchMode(mode: TimerMode)`
타이머 모드를 전환합니다.

```typescript
switchMode(mode: TimerMode): void
```

**파라미터**:
- `mode`: `'countdown' | 'stopwatch' | 'pomodoro'`

**동작**:
- 현재 모드를 `mode`로 변경
- 실행 중이면 자동으로 일시정지
- 모드별 초기 상태 설정

---

#### `toggleSound()`
사운드 설정을 토글합니다.

```typescript
toggleSound(): void
```

**동작**:
- `sound` 상태를 반전 (`true` ↔ `false`)

---

### 1.3 상태 조회

#### `getDisplayTime(): DisplayTime`
현재 표시할 시간 정보를 반환합니다.

```typescript
getDisplayTime(): DisplayTime

interface DisplayTime {
  remainingMs: number;    // 남은 시간 (카운트다운/포모도로)
  elapsedMs: number;      // 경과 시간 (스톱워치)
  isExpired: boolean;      // 종료 여부
  formatted: string;      // 포맷된 문자열 (MM:SS)
}
```

---

## 2. 이벤트 훅

### 2.1 onStart
타이머가 시작될 때 호출됩니다.

```typescript
onStart?: () => void
```

**호출 시점**:
- `start()` 메서드 호출 시
- `toggleTimer()`로 시작 시

---

### 2.2 onPause
타이머가 일시정지될 때 호출됩니다.

```typescript
onPause?: () => void
```

**호출 시점**:
- `pause()` 메서드 호출 시
- `toggleTimer()`로 일시정지 시

---

### 2.3 onReset
타이머가 리셋될 때 호출됩니다.

```typescript
onReset?: () => void
```

**호출 시점**:
- `reset()` 메서드 호출 시

---

### 2.4 onPhaseChange
포모도로 모드에서 페이즈가 변경될 때 호출됩니다.

```typescript
onPhaseChange?: (phase: 'work' | 'rest', rounds: number) => void
```

**파라미터**:
- `phase`: 변경된 페이즈 (`'work'` 또는 `'rest'`)
- `rounds`: 현재 라운드 수

**호출 시점**:
- 작업 시간 종료 → 휴식 시간 시작
- 휴식 시간 종료 → 작업 시간 시작

---

### 2.5 onFinish
카운트다운이나 포모도로가 종료될 때 호출됩니다.

```typescript
onFinish?: (mode: TimerMode) => void
```

**파라미터**:
- `mode`: 종료된 모드 (`'countdown'` 또는 `'pomodoro'`)

**호출 시점**:
- 카운트다운: `remainingMs <= 0`일 때
- 포모도로: 페이즈 시간 종료 시 (페이즈 전이 전)

---

### 2.6 onTick (옵션)
매 틱마다 호출됩니다 (성능 고려하여 선택적 사용).

```typescript
onTick?: (displayTime: DisplayTime) => void
```

**호출 시점**:
- 틱 인터벌 실행 시 (200ms마다)
- 가시 영역에 있을 때만 실행

---

## 3. 분석 이벤트

### 3.1 timer_start
타이머 시작 이벤트

```typescript
trackEvent('timer_start', {
  mode: TimerMode;
  source: 'button' | 'keyboard';
  preset?: string;
})
```

---

### 3.2 timer_pause
타이머 일시정지 이벤트

```typescript
trackEvent('timer_pause', {
  mode: TimerMode;
  source: 'button' | 'keyboard';
  elapsedMs?: number;
  remainingMs?: number;
})
```

---

### 3.3 timer_reset
타이머 리셋 이벤트

```typescript
trackEvent('timer_reset', {
  mode: TimerMode;
  source: 'button' | 'keyboard';
})
```

---

### 3.4 timer_mode_change
모드 변경 이벤트

```typescript
trackEvent('timer_mode_change', {
  from: TimerMode;
  to: TimerMode;
  source: 'button' | 'keyboard';
})
```

---

### 3.5 timer_finish
타이머 종료 이벤트

```typescript
trackEvent('timer_finish', {
  mode: 'countdown' | 'pomodoro';
  durationMs: number;
  rounds?: number; // 포모도로인 경우
})
```

---

### 3.6 timer_phase_change
포모도로 페이즈 변경 이벤트

```typescript
trackEvent('timer_phase_change', {
  from: 'work' | 'rest';
  to: 'work' | 'rest';
  rounds: number;
})
```

---

### 3.7 timer_preset_apply
프리셋 적용 이벤트

```typescript
trackEvent('timer_preset_apply', {
  mode: TimerMode;
  preset: string;
  durationMs: number;
  source: 'button' | 'keyboard';
})
```

---

## 4. 퍼시스트 스키마

**키**: `timer_${id}`

**저장 데이터**:
```typescript
{
  mode: TimerMode;
  startEpoch: number | null;
  accumulatedMs: number;
  running: boolean;
  targetMs?: number;
  pomo: {
    phase: 'work' | 'rest';
    rounds: number;
    workMin: number;
    restMin: number;
  };
  sound: boolean;
  notifyEnabled: boolean;
}
```

**복원 로직**:
- 새로고침 후 저장된 상태 복원
- 실행 중이었던 경우: `startEpoch`를 현재 시간으로 재설정하여 정확도 보장
- 카운트다운/포모도로: `remainingMs` 계산하여 정확한 시간 표시

