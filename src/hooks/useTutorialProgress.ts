import { useCallback, useEffect, useMemo, useState } from 'react';
import { trackEvent, ANALYTICS_EVENTS } from '../utils/analytics';

export type TutorialStepId = 'template' | 'widget' | 'save';

type TutorialStepStatus = 'pending' | 'current' | 'completed';

interface TutorialStepState {
  status: TutorialStepStatus;
  completedAt?: number;
}

export interface TutorialProgress {
  startedAt: number;
  completedAt?: number;
  currentStep: TutorialStepId | null;
  steps: Record<TutorialStepId, TutorialStepState>;
}

const STORAGE_KEY = 'urwebs-tutorial-progress-v1';
const EVENT_NAME = 'urwebs:tutorial-progress';

const defaultProgress = (): TutorialProgress => ({
  startedAt: Date.now(),
  currentStep: 'template',
  steps: {
    template: { status: 'current' },
    widget: { status: 'pending' },
    save: { status: 'pending' }
  }
});

const loadProgress = (): TutorialProgress | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as TutorialProgress;
    if (!parsed.steps) return null;
    return parsed;
  } catch {
    return null;
  }
};

const persistProgress = (progress: TutorialProgress) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    window.dispatchEvent(
      new CustomEvent(EVENT_NAME, {
        detail: progress
      })
    );
  } catch (error) {
    console.warn('[useTutorialProgress] persist 실패', error);
  }
};

const getNextStep = (step: TutorialStepId): TutorialStepId | null => {
  if (step === 'template') return 'widget';
  if (step === 'widget') return 'save';
  return null;
};

export const startTutorialFlow = () => {
  const progress = defaultProgress();
  persistProgress(progress);
  trackEvent(ANALYTICS_EVENTS.TUTORIAL_STARTED, { startedAt: progress.startedAt });
  return progress;
};

export const completeTutorialStep = (step: TutorialStepId, metadata?: Record<string, unknown>) => {
  const previous = loadProgress();
  const isNewlyStarted = !previous;
  const existing = previous ?? defaultProgress();

  if (isNewlyStarted) {
    trackEvent(ANALYTICS_EVENTS.TUTORIAL_STARTED, { startedAt: existing.startedAt, origin: 'implicit' });
  }

  const currentStatus = existing.steps[step]?.status;
  if (currentStatus === 'completed') {
    return existing;
  }

  const now = Date.now();
  const updated: TutorialProgress = {
    ...existing,
    steps: {
      ...existing.steps,
      [step]: {
        status: 'completed',
        completedAt: now
      }
    }
  };

  const next = getNextStep(step);
  if (next) {
    updated.currentStep = next;
    if (updated.steps[next].status !== 'completed') {
      updated.steps[next] = {
        ...updated.steps[next],
        status: 'current'
      };
    }
  } else {
    updated.currentStep = null;
    updated.completedAt = now;
    trackEvent(ANALYTICS_EVENTS.TUTORIAL_COMPLETED, { completedAt: now });
  }

  persistProgress(updated);
  trackEvent(ANALYTICS_EVENTS.TUTORIAL_STEP_COMPLETED, {
    step,
    metadata
  });
  return updated;
};

export const resetTutorialProgress = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(
      new CustomEvent(EVENT_NAME, {
        detail: null
      })
    );
  } catch (error) {
    console.warn('[useTutorialProgress] reset 실패', error);
  }
};

export const useTutorialProgress = () => {
  const [progress, setProgress] = useState<TutorialProgress | null>(() => loadProgress());

  useEffect(() => {
    const handleUpdate = (event: Event) => {
      if ((event as CustomEvent<TutorialProgress>).detail) {
        setProgress((event as CustomEvent<TutorialProgress>).detail);
      } else {
        setProgress(null);
      }
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) {
        setProgress(loadProgress());
      }
    };

    window.addEventListener(EVENT_NAME, handleUpdate as EventListener);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener(EVENT_NAME, handleUpdate as EventListener);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const start = useCallback(() => {
    const started = startTutorialFlow();
    setProgress(started);
    return started;
  }, []);

  const complete = useCallback((step: TutorialStepId, metadata?: Record<string, unknown>) => {
    const updated = completeTutorialStep(step, metadata);
    setProgress(updated);
    return updated;
  }, []);

  const reset = useCallback(() => {
    resetTutorialProgress();
    setProgress(null);
  }, []);

  const value = useMemo(
    () => ({
      progress,
      start,
      complete,
      reset
    }),
    [progress, start, complete, reset]
  );

  return value;
};

