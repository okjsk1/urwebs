import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Clock, Play, Pause, RotateCcw, Volume2, VolumeX, Settings } from 'lucide-react';
import { WidgetShell } from './WidgetShell';
import { usePersist } from '../../hooks/usePersist';
import { trackEvent } from '../../utils/analytics';

export type TimerMode = 'countdown' | 'stopwatch' | 'pomodoro';

interface TimerCore {
  // 시간 추적 (단일 소스 오브 트루스)
  startEpoch: number | null;        // 시작 시점 (Unix timestamp)
  accumulatedMs: number;              // 일시정지 시 누적된 시간 (밀리초)
  
  // 제어
  running: boolean;
  mode: TimerMode;
  
  // 카운트다운
  targetMs?: number;                  // 목표 시점 (Unix timestamp)
  
  // 포모도로
  pomoPhase: 'work' | 'rest';
  pomoRounds: number;
  pomoWorkMin: number;
  pomoRestMin: number;
  
  // 설정
  sound: boolean;
  notifyEnabled: boolean;
}

interface DisplayTime {
  remainingMs: number;
  elapsedMs: number;
  isExpired: boolean;
  formatted: string;
}

export interface TimerWidgetProps {
  id: string;
  title?: string;
  size?: 's' | 'm' | 'l';
  onRemove?: (id: string) => void;
  onResize?: (id: string, size: 's' | 'm' | 'l') => void;
  onPin?: (id: string) => void;
  isPinned?: boolean;
}

const MODE_LABELS = {
  countdown: '카운트다운',
  stopwatch: '스톱워치',
  pomodoro: '포모도로'
};

const POMO_DEFAULTS = {
  workMin: 25,
  restMin: 5
};

const COUNTDOWN_PRESETS = [
  { label: '5분', minutes: 5 },
  { label: '10분', minutes: 10 },
  { label: '15분', minutes: 15 },
  { label: '30분', minutes: 30 }
];

const POMO_PRESETS = [
  { label: '기본', workMin: 25, restMin: 5 },
  { label: '긴 작업', workMin: 50, restMin: 10 },
  { label: '초집중', workMin: 90, restMin: 15 }
];

const TICK_INTERVAL = 200; // 200ms 틱

export function TimerWidget({
  id,
  title = '타이머',
  size = 'm',
  onRemove,
  onResize,
  onPin,
  isPinned = false
}: TimerWidgetProps) {
  const isCompact = size === 's';
  const [core, setCore] = usePersist<TimerCore>({
    key: `timer_${id}`,
    initialValue: {
      startEpoch: null,
      accumulatedMs: 0,
      running: false,
      mode: 'countdown',
      targetMs: undefined,
      pomoPhase: 'work',
      pomoRounds: 0,
      pomoWorkMin: POMO_DEFAULTS.workMin,
      pomoRestMin: POMO_DEFAULTS.restMin,
      sound: true,
      notifyEnabled: true
    }
  });

  // UI 갱신을 위한 더미 상태 (매 틱마다 증가)
  const [tick, setTick] = useState(0);
  
  // 가시성 및 활성 상태
  const [isVisible, setIsVisible] = useState(true);
  const [isPageVisible, setIsPageVisible] = useState(!document.hidden);
  
  // 알림/사운드 관련
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const notificationPermissionRef = useRef<NotificationPermission>('default');
  const finishedNotifiedRef = useRef(false); // 중복 알림 방지
  
  // 위젯 요소 참조 (IntersectionObserver용)
  const widgetRef = useRef<HTMLDivElement>(null);

  // 오디오 초기화
  useEffect(() => {
    try {
      audioRef.current = new Audio('/sounds/timer-beep.mp3');
      audioRef.current.volume = 0.3;
      audioRef.current.preload = 'auto';
    } catch (error) {
      console.warn('오디오 초기화 실패:', error);
    }
  }, []);

  // 알림 권한 요청
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      // 사용자 상호작용 후에만 요청
      notificationPermissionRef.current = Notification.permission;
    } else if ('Notification' in window) {
      notificationPermissionRef.current = Notification.permission;
    }
  }, []);

  // IntersectionObserver로 가시성 감지
  useEffect(() => {
    if (!widgetRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        setIsVisible(entries[0].isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(widgetRef.current);

    return () => observer.disconnect();
  }, []);

  // Page Visibility API로 탭 활성 상태 감지
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPageVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // 시간 계산 함수 (단일 소스 오브 트루스)
  const calculateDisplayTime = useCallback((): DisplayTime => {
    const now = Date.now();
    let remainingMs = 0;
    let elapsedMs = 0;
    let isExpired = false;

    if (core.mode === 'stopwatch') {
      // 스톱워치: accumulatedMs + (실행 중이면 경과 시간)
      elapsedMs = core.accumulatedMs + (core.running && core.startEpoch ? now - core.startEpoch : 0);
      remainingMs = elapsedMs;
    } else if (core.mode === 'countdown' && core.targetMs) {
      // 카운트다운: 목표 시점까지의 남은 시간
      // 단순히 targetMs - now로 계산 (targetMs는 이미 목표 시점이므로)
      remainingMs = Math.max(0, core.targetMs - now);
      isExpired = remainingMs <= 0;
    } else if (core.mode === 'pomodoro') {
      // 포모도로: 페이즈 시간 - (누적 시간 + 현재 경과 시간)
      const phaseDuration = core.pomoPhase === 'work' 
        ? core.pomoWorkMin * 60 * 1000 
        : core.pomoRestMin * 60 * 1000;
      
      const currentMs = core.accumulatedMs + (core.running && core.startEpoch ? now - core.startEpoch : 0);
      remainingMs = Math.max(0, phaseDuration - currentMs);
      isExpired = remainingMs <= 0;
    }

    const totalSeconds = Math.floor(Math.abs(remainingMs || elapsedMs) / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const formatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    return { remainingMs, elapsedMs, isExpired, formatted };
  }, [core]);

  // 알림 및 사운드 트리거
  const triggerFinishNotification = useCallback(async (mode: 'countdown' | 'pomodoro') => {
    // 사운드 재생
    if (core.sound && audioRef.current) {
      try {
        await audioRef.current.play();
      } catch (error) {
        console.warn('사운드 재생 실패:', error);
        // 브라우저 정책으로 인한 실패는 무시
      }
    }

    // 데스크톱 알림
    if (core.notifyEnabled && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(`${mode === 'countdown' ? '카운트다운' : '포모도로'} 완료`, {
          body: mode === 'pomodoro' 
            ? `${core.pomoPhase === 'work' ? '작업' : '휴식'} 시간이 완료되었습니다.`
            : '타이머가 완료되었습니다.',
          icon: '/favicon.ico',
          tag: `timer-${id}`,
          requireInteraction: false
        });
      } else if (Notification.permission === 'default') {
        // 권한 요청 (사용자 상호작용 필요)
        try {
          const permission = await Notification.requestPermission();
          notificationPermissionRef.current = permission;
          if (permission === 'granted') {
            new Notification(`${mode === 'countdown' ? '카운트다운' : '포모도로'} 완료`, {
              body: mode === 'pomodoro' 
                ? `${core.pomoPhase === 'work' ? '작업' : '휴식'} 시간이 완료되었습니다.`
                : '타이머가 완료되었습니다.',
              icon: '/favicon.ico',
              tag: `timer-${id}`
            });
          }
        } catch (error) {
          console.warn('알림 권한 요청 실패:', error);
        }
      }
    }

    // 문서 제목 깜박임 (옵션)
    if (core.notifyEnabled && document.hidden) {
      let blinkCount = 0;
      const interval = setInterval(() => {
        document.title = blinkCount % 2 === 0 
          ? '⏰ 타이머 완료! ⏰' 
          : title;
        blinkCount++;
        if (blinkCount >= 10) {
          clearInterval(interval);
          document.title = title;
        }
      }, 500);
    }
  }, [core.sound, core.notifyEnabled, core.pomoPhase, id, title]);

  // 타이머 틱 업데이트
  const updateTimer = useCallback(() => {
    // running이 false면 즉시 리턴 (일시정지 상태)
    if (!core.running) return;
    
    if (!isVisible || !isPageVisible) return;

    const displayTime = calculateDisplayTime();
    
    // UI 강제 갱신을 위한 더미 상태 업데이트
    setTick(prev => prev + 1);

    // 카운트다운 종료 처리
    if (core.mode === 'countdown' && displayTime.isExpired && !finishedNotifiedRef.current) {
      finishedNotifiedRef.current = true;
      setCore(prev => ({ ...prev, running: false }));
      
      // 알림 및 사운드
      triggerFinishNotification('countdown');
      
      trackEvent('timer_finish', {
        mode: 'countdown',
        durationMs: core.targetMs ? Math.abs(core.targetMs - Date.now()) : 0
      });
    }
    
    // 포모도로 페이즈 종료 처리
    if (core.mode === 'pomodoro' && displayTime.isExpired && !finishedNotifiedRef.current) {
      finishedNotifiedRef.current = true;
      
      const nextPhase = core.pomoPhase === 'work' ? 'rest' : 'work';
      const newRounds = nextPhase === 'work' ? core.pomoRounds + 1 : core.pomoRounds;
      
      setCore(prev => ({
        ...prev,
        pomoPhase: nextPhase,
        pomoRounds: newRounds,
        startEpoch: Date.now(),
        accumulatedMs: 0
      }));
      
      // 알림 및 사운드
      triggerFinishNotification('pomodoro');
      
      trackEvent('timer_phase_change', {
        from: core.pomoPhase,
        to: nextPhase,
        rounds: newRounds
      });
      
      trackEvent('timer_finish', {
        mode: 'pomodoro',
        durationMs: core.pomoPhase === 'work' 
          ? core.pomoWorkMin * 60 * 1000 
          : core.pomoRestMin * 60 * 1000,
        rounds: newRounds
      });
      
      // 다음 페이즈 시작
      setTimeout(() => {
        finishedNotifiedRef.current = false;
      }, 1000);
    }
  }, [core, isVisible, isPageVisible, calculateDisplayTime, setCore, triggerFinishNotification]);

  // 타이머 시작/정지
  const toggleTimer = useCallback(() => {
    if (core.running) {
      // 일시정지
      const now = Date.now();
      setCore(prev => ({
        ...prev,
        accumulatedMs: prev.accumulatedMs + (prev.startEpoch ? now - prev.startEpoch : 0),
        startEpoch: null,
        running: false
      }));
      finishedNotifiedRef.current = false;
      trackEvent('timer_pause', {
        mode: core.mode,
        source: 'button',
        elapsedMs: core.mode === 'stopwatch' ? core.accumulatedMs : undefined,
        remainingMs: core.mode === 'countdown' ? calculateDisplayTime().remainingMs : undefined
      });
    } else {
      // 시작
      const now = Date.now();
      setCore(prev => {
        // 카운트다운 모드이고 targetMs가 없으면 현재 시간부터 10분 설정
        let targetMs = prev.targetMs;
        if (prev.mode === 'countdown' && !targetMs) {
          targetMs = now + 10 * 60 * 1000; // 기본 10분
        }
        return {
          ...prev,
          startEpoch: now,
          running: true,
          targetMs
        };
      });
      finishedNotifiedRef.current = false;
      trackEvent('timer_start', {
        mode: core.mode,
        source: 'button',
        preset: core.mode === 'countdown' && core.targetMs ? `${Math.floor((core.targetMs - Date.now()) / 60000)}분` : undefined
      });
    }
  }, [core.running, core.mode, core.accumulatedMs, core.targetMs, setCore, calculateDisplayTime]);

  // 타이머 리셋
  const resetTimer = useCallback(() => {
    setCore(prev => ({
      ...prev,
      running: false,
      startEpoch: null,
      accumulatedMs: 0,
      pomoPhase: 'work',
      pomoRounds: 0
    }));
    finishedNotifiedRef.current = false;
    trackEvent('timer_reset', {
      mode: core.mode,
      source: 'button'
    });
  }, [core.mode, setCore]);

  // 모드 변경
  const changeMode = useCallback((mode: TimerMode) => {
    const oldMode = core.mode;
    setCore(prev => ({
      ...prev,
      mode,
      running: false,
      startEpoch: null,
      accumulatedMs: 0,
      pomoPhase: 'work',
      pomoRounds: 0
    }));
    finishedNotifiedRef.current = false;
    trackEvent('timer_mode_change', {
      from: oldMode,
      to: mode,
      source: 'button'
    });
  }, [core.mode, setCore]);

  // 카운트다운 설정
  const setCountdown = useCallback((minutes: number, seconds: number = 0) => {
    if (minutes < 0 || seconds < 0 || seconds >= 60) {
      console.error('잘못된 카운트다운 시간');
      return;
    }
    
    const targetMs = Date.now() + (minutes * 60 + seconds) * 1000;
    setCore(prev => ({
      ...prev,
      targetMs,
      mode: 'countdown',
      // 빠른설정을 눌러도 자동으로 시작하지 않음 (사용자가 시작 버튼을 눌러야 함)
      running: false,
      startEpoch: null,
      accumulatedMs: 0
    }));
    
    trackEvent('timer_preset_apply', {
      mode: 'countdown',
      preset: `${minutes}분${seconds > 0 ? ` ${seconds}초` : ''}`,
      durationMs: (minutes * 60 + seconds) * 1000,
      source: 'button'
    });
  }, [setCore]);

  // 포모도로 설정
  const setPomodoro = useCallback((workMin: number, restMin: number) => {
    if (workMin < 1 || workMin > 60 || restMin < 1 || restMin > 30) {
      console.error('잘못된 포모도로 설정');
      return;
    }
    
    setCore(prev => ({
      ...prev,
      pomoWorkMin: workMin,
      pomoRestMin: restMin,
      mode: 'pomodoro',
      // 빠른설정을 눌러도 자동으로 시작하지 않음 (사용자가 시작 버튼을 눌러야 함)
      running: false,
      startEpoch: null,
      accumulatedMs: 0,
      pomoPhase: 'work',
      pomoRounds: 0
    }));
    
    trackEvent('timer_preset_apply', {
      mode: 'pomodoro',
      preset: `${workMin}/${restMin}분`,
      durationMs: workMin * 60 * 1000,
      source: 'button'
    });
  }, [setCore]);

  // 사운드 토글
  const toggleSound = useCallback(() => {
    setCore(prev => ({ ...prev, sound: !prev.sound }));
  }, [setCore]);

  // 틱 인터벌 설정
  useEffect(() => {
    // running이 false면 인터벌을 설정하지 않음
    if (!core.running) {
      return;
    }
    
    if (!isVisible || !isPageVisible) {
      return;
    }

    const interval = setInterval(updateTimer, TICK_INTERVAL);
    return () => clearInterval(interval);
  }, [core.running, isVisible, isPageVisible, updateTimer]);

  // 키보드 단축키
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      switch (e.code) {
        case 'Space':
          e.preventDefault();
          toggleTimer();
          break;
        case 'KeyR':
          e.preventDefault();
          resetTimer();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [toggleTimer, resetTimer]);

  // 시간 포맷팅 및 표시
  const displayTime = calculateDisplayTime();
  const color = displayTime.isExpired 
    ? 'text-red-600 dark:text-red-400'
    : displayTime.remainingMs <= 5000 && core.mode !== 'stopwatch'
    ? 'text-red-600 dark:text-red-400'
    : displayTime.remainingMs <= 15000 && core.mode !== 'stopwatch'
    ? 'text-orange-500 dark:text-orange-400'
    : displayTime.remainingMs <= 30000 && core.mode !== 'stopwatch'
    ? 'text-yellow-500 dark:text-yellow-400'
    : 'text-gray-900 dark:text-gray-100';

  return (
    <WidgetShell
      icon={<Clock className="w-4 h-4 text-indigo-600" />}
      title={title}
      size={size}
      onRemove={() => onRemove?.(id)}
      onResize={(newSize) => onResize?.(id, newSize as 's' | 'm' | 'l')}
      onPin={() => onPin?.(id)}
      isPinned={isPinned}
      variant="bare"
    >
      <div ref={widgetRef} className="h-full flex flex-col">
        {/* 접근성: 라이브 영역 */}
        <div 
          role="timer" 
          aria-live="polite" 
          aria-atomic="true"
          className="sr-only"
        >
          <span aria-label={`${MODE_LABELS[core.mode]} 모드, ${displayTime.formatted}`}>
            {displayTime.formatted}
          </span>
        </div>

        {/* 모드 선택 */}
        <div className="flex gap-1 mb-3" role="tablist">
          {(['countdown', 'stopwatch', 'pomodoro'] as TimerMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => changeMode(mode)}
              role="tab"
              aria-pressed={core.mode === mode}
              aria-label={`${MODE_LABELS[mode]} 모드로 전환`}
              className={`px-2 py-1 text-xs rounded ${
                core.mode === mode 
                  ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' 
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {MODE_LABELS[mode]}
            </button>
          ))}
        </div>

        {/* 메인 타이머 */}
        <div className={`flex-1 flex flex-col items-center justify-center ${isCompact ? 'gap-1' : ''}`}>
          <div 
            className={`${isCompact ? 'text-3xl mb-1' : 'text-5xl mb-2'} font-mono font-bold ${color} transition-colors duration-200`}
            aria-label={core.mode === 'stopwatch' ? '경과 시간' : '남은 시간'}
          >
            {displayTime.formatted}
          </div>
          
          {/* 세컨드라인 정보 */}
          {core.mode === 'pomodoro' && !isCompact && (
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              {core.pomoPhase === 'work' ? '작업' : '휴식'} • {core.pomoRounds}라운드
            </div>
          )}
          {core.mode === 'countdown' && displayTime.remainingMs > 0 && !isCompact && (
            <div className="text-xs text-gray-500 dark:text-gray-500 mb-1">
              {Math.floor(displayTime.remainingMs / 60000)}분 {Math.floor((displayTime.remainingMs % 60000) / 1000)}초 남음
            </div>
          )}
          {core.mode === 'stopwatch' && !isCompact && (
            <div className="text-xs text-gray-500 dark:text-gray-500 mb-1">
              {Math.floor(displayTime.elapsedMs / 60000)}분 {Math.floor((displayTime.elapsedMs % 60000) / 1000)}초 경과
            </div>
          )}

          {/* 컨트롤 버튼 */}
          <div className={`flex gap-2 ${isCompact ? 'mt-2' : 'mt-4'}`}>
            <button
              onClick={toggleTimer}
              aria-pressed={core.running}
              aria-label={core.running ? '일시정지' : '시작'}
              className={`${isCompact ? 'px-3 py-1.5' : 'px-4 py-2'} bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 transition-colors`}
            >
              {core.running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={resetTimer}
              aria-label="리셋"
              className={`${isCompact ? 'px-3 py-1.5' : 'px-4 py-2'} bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700 transition-colors`}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={toggleSound}
              aria-pressed={core.sound}
              aria-label={core.sound ? '사운드 끄기' : '사운드 켜기'}
              className={`${isCompact ? 'px-2.5 py-1.5' : 'px-4 py-2'} rounded-lg focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700 transition-colors ${
                core.sound ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}
            >
              {core.sound ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* 설정 */}
        {core.mode === 'countdown' && !isCompact && (
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">빠른 설정</div>
            <div className="flex gap-1 flex-wrap">
              {COUNTDOWN_PRESETS.map((preset) => (
                <button
                  key={preset.minutes}
                  onClick={() => setCountdown(preset.minutes)}
                  aria-label={`${preset.label} 설정`}
                  className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {core.mode === 'pomodoro' && !isCompact && (
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">포모도로 설정</div>
            <div className="flex gap-1 mb-2 flex-wrap">
              {POMO_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => setPomodoro(preset.workMin, preset.restMin)}
                  aria-label={`${preset.label} 프리셋: 작업 ${preset.workMin}분, 휴식 ${preset.restMin}분`}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    core.pomoWorkMin === preset.workMin && core.pomoRestMin === preset.restMin
                      ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2 text-xs">
              <div className="flex items-center gap-1">
                <label className="text-gray-600 dark:text-gray-400" htmlFor={`work-${id}`}>작업:</label>
                <input
                  id={`work-${id}`}
                  type="number"
                  value={core.pomoWorkMin}
                  onChange={(e) => setPomodoro(Number(e.target.value), core.pomoRestMin)}
                  className="w-12 px-1 py-0.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  min="1"
                  max="60"
                  aria-label="작업 시간 (분)"
                />
                <span className="text-gray-600 dark:text-gray-400">분</span>
              </div>
              <div className="flex items-center gap-1">
                <label className="text-gray-600 dark:text-gray-400" htmlFor={`rest-${id}`}>휴식:</label>
                <input
                  id={`rest-${id}`}
                  type="number"
                  value={core.pomoRestMin}
                  onChange={(e) => setPomodoro(core.pomoWorkMin, Number(e.target.value))}
                  className="w-12 px-1 py-0.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  min="1"
                  max="30"
                  aria-label="휴식 시간 (분)"
                />
                <span className="text-gray-600 dark:text-gray-400">분</span>
              </div>
            </div>
          </div>
        )}

        {/* 단축키 안내 */}
        {!isCompact && (
          <div className="mt-2 text-xs text-gray-400 dark:text-gray-500" aria-label="키보드 단축키">
            Space: 시작/정지 • R: 리셋
          </div>
        )}
      </div>
    </WidgetShell>
  );
}
