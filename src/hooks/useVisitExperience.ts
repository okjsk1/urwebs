import { useEffect, useMemo, useState } from 'react';
import { trackEvent, ANALYTICS_EVENTS } from '../utils/analytics';

const VISIT_STORAGE_KEY = 'urwebs-visit-log-v1';
const SESSION_FLAG_KEY = 'urwebs-session-flag-v1';

interface RawVisitLog {
  firstVisitAt: number;
  lastVisitAt: number;
  visitCount: number;
}

export interface VisitExperienceState {
  isLoading: boolean;
  isFirstVisit: boolean;
  isReturningVisit: boolean;
  visitCount: number;
  firstVisitAt?: number;
  lastVisitAt?: number;
}

const createDefaultLog = (): RawVisitLog => {
  const now = Date.now();
  return {
    firstVisitAt: now,
    lastVisitAt: now,
    visitCount: 1
  };
};

const loadVisitLog = (): RawVisitLog | null => {
  try {
    const raw = localStorage.getItem(VISIT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      typeof parsed.firstVisitAt === 'number' &&
      typeof parsed.lastVisitAt === 'number' &&
      typeof parsed.visitCount === 'number'
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
};

const persistVisitLog = (log: RawVisitLog) => {
  try {
    localStorage.setItem(VISIT_STORAGE_KEY, JSON.stringify(log));
  } catch (error) {
    console.warn('[useVisitExperience] visit log persist 실패', error);
  }
};

export const useVisitExperience = (): VisitExperienceState => {
  const [state, setState] = useState<VisitExperienceState>(() => {
    if (typeof window === 'undefined') {
      return {
        isLoading: true,
        isFirstVisit: false,
        isReturningVisit: false,
        visitCount: 0
      };
    }

    const existingLog = loadVisitLog();
    if (!existingLog) {
      return {
        isLoading: false,
        isFirstVisit: true,
        isReturningVisit: false,
        visitCount: 1
      };
    }

    return {
      isLoading: false,
      isFirstVisit: false,
      isReturningVisit: true,
      visitCount: existingLog.visitCount,
      firstVisitAt: existingLog.firstVisitAt,
      lastVisitAt: existingLog.lastVisitAt
    };
  });

  useEffect(() => {
    // 세션당 1회만 방문 수를 증가시키기 위해 sessionStorage 플래그 사용
    const sessionFlag = sessionStorage.getItem(SESSION_FLAG_KEY);
    const now = Date.now();
    const existingLog = loadVisitLog();

    if (!existingLog) {
      const log = createDefaultLog();
      persistVisitLog(log);
      sessionStorage.setItem(SESSION_FLAG_KEY, 'seen');

      setState({
        isLoading: false,
        isFirstVisit: true,
        isReturningVisit: false,
        visitCount: 1,
        firstVisitAt: log.firstVisitAt,
        lastVisitAt: log.lastVisitAt
      });

      trackEvent(ANALYTICS_EVENTS.FIRST_VISIT, { page: 'home' });
      trackEvent(ANALYTICS_EVENTS.PAGE_VIEW, { page: 'home', visitType: 'first' });
      return;
    }

    let updatedLog = existingLog;

    if (!sessionFlag) {
      updatedLog = {
        ...existingLog,
        visitCount: existingLog.visitCount + 1,
        lastVisitAt: now
      };
      persistVisitLog(updatedLog);
      sessionStorage.setItem(SESSION_FLAG_KEY, 'seen');
    }

    setState({
      isLoading: false,
      isFirstVisit: false,
      isReturningVisit: true,
      visitCount: updatedLog.visitCount,
      firstVisitAt: updatedLog.firstVisitAt,
      lastVisitAt: updatedLog.lastVisitAt
    });

    trackEvent(ANALYTICS_EVENTS.RETURNING_VISIT, {
      page: 'home',
      visitCount: updatedLog.visitCount
    });
    trackEvent(ANALYTICS_EVENTS.PAGE_VIEW, { page: 'home', visitType: 'returning' });
  }, []);

  return useMemo(() => state, [state]);
};

export const resetVisitExperience = () => {
  try {
    localStorage.removeItem(VISIT_STORAGE_KEY);
    sessionStorage.removeItem(SESSION_FLAG_KEY);
  } catch (error) {
    console.warn('[useVisitExperience] reset 실패', error);
  }
};

