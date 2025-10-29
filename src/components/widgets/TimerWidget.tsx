import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Clock, Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { WidgetShell } from './WidgetShell';
import { usePersist } from '../../hooks/usePersist';
import { trackEvent } from '../../utils/analytics';

export type TimerMode = 'countdown' | 'stopwatch' | 'pomodoro';

export interface TimerState {
  mode: TimerMode;
  targetMs?: number;
  elapsedMs: number;
  running: boolean;
  pomo: {
    workMin: number;
    restMin: number;
    phase: 'work' | 'rest';
    rounds: number;
  };
  sound: boolean;
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

export function TimerWidget({
  id,
  title = '타이머',
  size = 'm',
  onRemove,
  onResize,
  onPin,
  isPinned = false
}: TimerWidgetProps) {
  const [state, setState] = usePersist<TimerState>({
    key: `timer_${id}`,
    initialValue: {
      mode: 'countdown',
      elapsedMs: 0,
      running: false,
      pomo: {
        workMin: POMO_DEFAULTS.workMin,
        restMin: POMO_DEFAULTS.restMin,
        phase: 'work',
        rounds: 0
      },
      sound: true
    }
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 오디오 초기화
  useEffect(() => {
    audioRef.current = new Audio('/sounds/timer-beep.mp3');
    audioRef.current.volume = 0.3;
  }, []);

  // 타이머 로직
  const updateTimer = useCallback(() => {
    const now = Date.now();
    
    if (state.mode === 'countdown' && state.targetMs) {
      const remaining = state.targetMs - now;
      if (remaining <= 0) {
        setState(prev => ({ ...prev, running: false }));
        if (state.sound && audioRef.current) {
          audioRef.current.play().catch(console.warn);
        }
        return;
      }
    } else if (state.mode === 'stopwatch') {
      const elapsed = now - startTimeRef.current + state.elapsedMs;
      setState(prev => ({ ...prev, elapsedMs: elapsed }));
    } else if (state.mode === 'pomodoro') {
      const phaseDuration = state.pomo.phase === 'work' 
        ? state.pomo.workMin * 60 * 1000 
        : state.pomo.restMin * 60 * 1000;
      const remaining = phaseDuration - (now - startTimeRef.current);
      
      if (remaining <= 0) {
        if (state.sound && audioRef.current) {
          audioRef.current.play().catch(console.warn);
        }
        
        setState(prev => ({
          ...prev,
          pomo: {
            ...prev.pomo,
            phase: prev.pomo.phase === 'work' ? 'rest' : 'work',
            rounds: prev.pomo.phase === 'work' ? prev.pomo.rounds + 1 : prev.pomo.rounds
          }
        }));
        startTimeRef.current = now;
      }
    }
  }, [state, setState]);

  // 타이머 시작/정지
  const toggleTimer = useCallback(() => {
    if (state.running) {
      setState(prev => ({ ...prev, running: false }));
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      trackEvent('timer_stop', { widget: 'timer', mode: state.mode });
    } else {
      startTimeRef.current = Date.now();
      setState(prev => ({ ...prev, running: true }));
      intervalRef.current = setInterval(updateTimer, 100);
      trackEvent('timer_start', { widget: 'timer', mode: state.mode });
    }
  }, [state.running, state.mode, setState, updateTimer]);

  // 타이머 리셋
  const resetTimer = useCallback(() => {
    setState(prev => ({
      ...prev,
      running: false,
      elapsedMs: 0,
      pomo: { ...prev.pomo, phase: 'work', rounds: 0 }
    }));
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    trackEvent('timer_reset', { widget: 'timer', mode: state.mode });
  }, [setState, state.mode]);

  // 모드 변경
  const changeMode = useCallback((mode: TimerMode) => {
    setState(prev => ({ ...prev, mode, running: false }));
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    trackEvent('timer_mode_change', { widget: 'timer', mode });
  }, [setState]);

  // 카운트다운 설정
  const setCountdown = useCallback((minutes: number) => {
    const targetMs = Date.now() + minutes * 60 * 1000;
    setState(prev => ({ ...prev, targetMs, mode: 'countdown' }));
  }, [setState]);

  // 포모도로 설정
  const setPomodoro = useCallback((workMin: number, restMin: number) => {
    setState(prev => ({
      ...prev,
      pomo: { ...prev.pomo, workMin, restMin }
    }));
  }, [setState]);

  // 사운드 토글
  const toggleSound = useCallback(() => {
    setState(prev => ({ ...prev, sound: !prev.sound }));
  }, [setState]);

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
        case 'Digit1':
          e.preventDefault();
          changeMode('countdown');
          break;
        case 'Digit2':
          e.preventDefault();
          changeMode('stopwatch');
          break;
        case 'Digit3':
          e.preventDefault();
          changeMode('pomodoro');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [toggleTimer, resetTimer, changeMode]);

  // 정리
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // 시간 포맷팅
  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // 현재 표시할 시간 계산
  const getDisplayTime = (): { time: string; color: string } => {
    let remainingMs = 0;
    let color = 'text-gray-900 dark:text-gray-100';

    if (state.mode === 'countdown' && state.targetMs) {
      remainingMs = Math.max(0, state.targetMs - Date.now());
      if (remainingMs <= 5000) color = 'text-red-600';
      else if (remainingMs <= 15000) color = 'text-orange-500';
      else if (remainingMs <= 30000) color = 'text-yellow-500';
    } else if (state.mode === 'stopwatch') {
      remainingMs = state.elapsedMs;
    } else if (state.mode === 'pomodoro') {
      const phaseDuration = state.pomo.phase === 'work' 
        ? state.pomo.workMin * 60 * 1000 
        : state.pomo.restMin * 60 * 1000;
      remainingMs = Math.max(0, phaseDuration - (Date.now() - startTimeRef.current));
      if (remainingMs <= 5000) color = 'text-red-600';
      else if (remainingMs <= 15000) color = 'text-orange-500';
      else if (remainingMs <= 30000) color = 'text-yellow-500';
    }

    return {
      time: formatTime(remainingMs),
      color
    };
  };

  const { time, color } = getDisplayTime();

  return (
    <WidgetShell
      icon={<Clock className="w-4 h-4 text-indigo-600" />}
      title={title}
      size={size}
      onRemove={() => onRemove?.(id)}
      onResize={(newSize) => onResize?.(id, newSize)}
      onPin={() => onPin?.(id)}
      isPinned={isPinned}
    >
      <div className="h-full flex flex-col">
        {/* 모드 선택 */}
        <div className="flex gap-1 mb-3">
          {(['countdown', 'stopwatch', 'pomodoro'] as TimerMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => changeMode(mode)}
              className={`px-2 py-1 text-xs rounded ${
                state.mode === mode 
                  ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' 
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {MODE_LABELS[mode]}
            </button>
          ))}
        </div>

        {/* 메인 타이머 */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className={`text-4xl font-mono font-bold ${color} mb-4`}>
            {time}
          </div>
          
          {state.mode === 'pomodoro' && (
            <div className={`text-sm mb-2 ${
              state.mode === 'pomodoro' 
                ? 'text-gray-600 dark:text-gray-400' 
                : ''
            }`}>
              {state.mode === 'pomodoro' && (
                <>
                  {state.pomo.phase === 'work' ? '작업' : '휴식'} • {state.pomo.rounds}라운드
                </>
              )}
            </div>
          )}

          {/* 컨트롤 버튼 */}
          <div className="flex gap-2">
            <button
              onClick={toggleTimer}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-200"
            >
              {state.running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={resetTimer}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={toggleSound}
              className={`px-4 py-2 rounded-lg focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700 ${
                state.sound ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}
            >
              {state.sound ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* 설정 */}
        {state.mode === 'countdown' && (
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">빠른 설정</div>
            <div className="flex gap-1">
              {[5, 10, 15, 30].map((min) => (
                <button
                  key={min}
                  onClick={() => setCountdown(min)}
                  className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  {min}분
                </button>
              ))}
            </div>
          </div>
        )}

        {state.mode === 'pomodoro' && (
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">포모도로 설정</div>
            <div className="flex gap-2">
              <div className="flex items-center gap-1">
                <label className="text-xs text-gray-600 dark:text-gray-400">작업:</label>
                <input
                  type="number"
                  value={state.pomo.workMin}
                  onChange={(e) => setPomodoro(Number(e.target.value), state.pomo.restMin)}
                  className="w-12 px-1 py-0.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  min="1"
                  max="60"
                />
                <span className="text-xs text-gray-600 dark:text-gray-400">분</span>
              </div>
              <div className="flex items-center gap-1">
                <label className="text-xs text-gray-600 dark:text-gray-400">휴식:</label>
                <input
                  type="number"
                  value={state.pomo.restMin}
                  onChange={(e) => setPomodoro(state.pomo.workMin, Number(e.target.value))}
                  className="w-12 px-1 py-0.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  min="1"
                  max="30"
                />
                <span className="text-xs text-gray-600 dark:text-gray-400">분</span>
              </div>
            </div>
          </div>
        )}

        {/* 단축키 안내 */}
        <div className="mt-2 text-xs text-gray-400 dark:text-gray-500">
          Space: 시작/정지 • R: 리셋 • 1/2/3: 모드
        </div>
      </div>
    </WidgetShell>
  );
}
