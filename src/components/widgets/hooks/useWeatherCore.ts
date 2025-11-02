import { useCallback, useEffect, useRef, useState } from 'react';
import { weatherService, WeatherLocation, CurrentWeather, HourlyForecast, DailyForecast } from '../../../services/weatherService';
import { readLocal, persistOrLocal, showToast } from '../utils/widget-helpers';
import { WeatherUnits } from '../../../utils/weatherUnits';

export interface WeatherState {
  location: WeatherLocation;
  currentWeather: CurrentWeather | null;
  hourlyForecast: HourlyForecast[];
  dailyForecast: DailyForecast[];
  showSettings: boolean;
  customLocation: string;
  autoRefresh: boolean;
  refreshInterval: number; // minutes
  units: WeatherUnits;
  loading: boolean;
  error: string | null;
  lastUpdated: number;
  isOnline: boolean;
}

const DEFAULT_LOCATION: WeatherLocation = {
  name: '서울',
  lat: 37.5665,
  lon: 126.9780,
};

export function useWeatherCore(widgetId: string, initialLocation: WeatherLocation = DEFAULT_LOCATION) {
  const [state, setState] = useState<WeatherState>(() => {
    const saved = readLocal(widgetId, {
      location: initialLocation,
      currentWeather: null,
      hourlyForecast: [],
      dailyForecast: [],
      showSettings: false,
      customLocation: initialLocation.name,
      autoRefresh: true,
      refreshInterval: 5, // 5분 간격으로 자동 새로고침
      units: 'metric' as WeatherUnits,
      loading: false,
      error: null,
      lastUpdated: 0,
      isOnline: navigator.onLine,
    });

    // 기존 데이터 호환성 처리
    if (saved) {
      if (typeof saved.location === 'string') {
        saved.location = {
          name: saved.location,
          lat: DEFAULT_LOCATION.lat,
          lon: DEFAULT_LOCATION.lon,
        };
      } else if (!saved.location || typeof saved.location.lat !== 'number' || typeof saved.location.lon !== 'number') {
        saved.location = DEFAULT_LOCATION;
      }
    }

    return saved;
  });

  const abortRef = useRef<AbortController | null>(null);
  const refreshTimerRef = useRef<number | null>(null);
  const widgetRef = useRef<HTMLDivElement | null>(null);
  const isVisibleRef = useRef(true);

  // 가시성 감지 (IntersectionObserver)
  useEffect(() => {
    const element = widgetRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
      },
      { threshold: 0.1 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const refreshWeather = useCallback(async (signal?: AbortSignal) => {
    if (state.loading) return;
    
    // 가시성 체크
    if (!isVisibleRef.current || document.visibilityState !== 'visible') {
      return;
    }

    // 이전 요청 취소
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    // 전달받은 signal이 있으면 병합
    const combinedSignal = signal 
      ? (() => {
          const combined = new AbortController();
          signal.addEventListener('abort', () => combined.abort());
          ac.signal.addEventListener('abort', () => combined.abort());
          return combined.signal;
        })()
      : ac.signal;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const [currentWeather, hourlyForecast, dailyForecast] = await Promise.all([
        weatherService.getCurrentWeather(state.location),
        weatherService.getHourlyForecast(state.location),
        weatherService.getDailyForecast(state.location),
      ]);

      if (ac.signal.aborted) return;

      setState(prev => ({
        ...prev,
        currentWeather,
        hourlyForecast,
        dailyForecast,
        loading: false,
        error: null,
        lastUpdated: Date.now(),
      }));
    } catch (error: any) {
      if (ac.signal.aborted || error?.name === 'AbortError') return;

      console.error('날씨 정보 업데이트 실패:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : '날씨 정보를 가져올 수 없습니다',
      }));
      showToast('날씨 정보 업데이트에 실패했습니다', 'error');
    }
  }, [state.location, state.loading]);

  // 가시성 기반 자동 새로고침
  useEffect(() => {
    if (!state.autoRefresh) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && state.isOnline && isVisibleRef.current) {
        refreshWeather();
      }
      
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    };

    const scheduleRefresh = () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }

      if (document.visibilityState === 'visible' && state.isOnline && isVisibleRef.current) {
        refreshTimerRef.current = window.setTimeout(() => {
          refreshWeather();
          scheduleRefresh();
        }, state.refreshInterval * 60 * 1000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleVisibilityChange);
    window.addEventListener('offline', handleVisibilityChange);

    scheduleRefresh();

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleVisibilityChange);
      window.removeEventListener('offline', handleVisibilityChange);
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, [state.autoRefresh, state.refreshInterval, state.isOnline, refreshWeather]);

  // 온라인 상태 감지
  useEffect(() => {
    const handleOnline = () => setState(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setState(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 초기 로드
  useEffect(() => {
    if (!state.currentWeather && !state.loading && state.isOnline) {
      refreshWeather();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 자동 저장 (디바운스)
  useEffect(() => {
    const timer = setTimeout(() => {
      persistOrLocal(widgetId, state);
    }, 300);

    return () => clearTimeout(timer);
  }, [widgetId, state]);

  // 언마운트 시 정리
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, []);

  const updateLocation = useCallback(async (locationName: string) => {
    if (!locationName.trim()) {
      showToast('위치를 입력하세요', 'error');
      return;
    }

    try {
      const locations = await weatherService.searchLocation(locationName.trim());
      if (locations.length === 0) {
        showToast('해당 위치를 찾을 수 없습니다', 'error');
        return;
      }

      const newLocation = locations[0];
      setState(prev => ({
        ...prev,
        location: newLocation,
        customLocation: locationName.trim(),
        showSettings: false,
      }));

      await refreshWeather();
    } catch (error) {
      showToast('위치 검색에 실패했습니다', 'error');
    }
  }, [refreshWeather]);

  const detectCurrentLocation = useCallback(async () => {
    try {
      const location = await weatherService.getCurrentLocation();
      setState(prev => ({
        ...prev,
        location,
        customLocation: location.name,
        showSettings: false,
      }));

      await refreshWeather();
    } catch (error) {
      showToast('위치 감지에 실패했습니다. 위치 권한을 확인해주세요.', 'error');
    }
  }, [refreshWeather]);

  const toggleUnits = useCallback(() => {
    setState(prev => ({
      ...prev,
      units: prev.units === 'metric' ? 'imperial' : 'metric',
    }));
  }, []);

  return {
    state,
    setState,
    refreshWeather,
    updateLocation,
    detectCurrentLocation,
    toggleUnits,
    widgetRef,
  };
}

