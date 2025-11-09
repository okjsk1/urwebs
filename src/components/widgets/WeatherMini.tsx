// 날씨 위젯 - 1x1 컴팩트 레이아웃
import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { WeatherState } from './hooks/useWeatherCore';
import { formatTemperature } from './utils/weatherFormat';

type Units = WeatherState['units'];

interface Props {
  state: WeatherState;
  isEditMode: boolean;
  setState: React.Dispatch<React.SetStateAction<WeatherState>>;
  widgetRef?: React.RefObject<HTMLDivElement>;
  isStealthMode?: boolean;
  onRetry?: () => void;
  showLocation?: boolean;
  showCondition?: boolean;
}

interface WeatherToneToken {
  text: string;
  accent: string;
  icon: string;
}

const DEFAULT_TONE: WeatherToneToken = {
  text: 'text-slate-700 dark:text-slate-200',
  accent: 'text-slate-600 dark:text-slate-300',
  icon: 'text-slate-600 dark:text-slate-300',
};

interface SecondaryInfoSource {
  rainProb?: number;
  pm25Grade?: string | number | null;
  pm25Label?: string | null;
  feelsLike?: number | null;
  temperature?: number | null;
  windSpeed?: number | null;
  summary?: string | null;
}

const normalizeAirQualityLabel = (value?: string | number | null): string | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') {
    if (value >= 4) return '매우나쁨';
    if (value === 3) return '나쁨';
    return null;
  }
  const raw = String(value).trim();
  if (!raw) return null;
  const lower = raw.toLowerCase();
  if (lower.includes('매우') || lower.includes('very') || lower.includes('severe')) return '매우나쁨';
  if (lower.includes('나쁨') || lower.includes('bad') || lower.includes('poor') || lower.includes('unhealthy')) return '나쁨';
  return null;
};

const truncate = (text: string, max = 18) => {
  if (text.length <= max) return text;
  return `${text.slice(0, max)}…`;
};

const getSecondaryInfo = (source: SecondaryInfoSource, units: Units): string => {
  if (!source) return '';

  const rainProb = typeof source.rainProb === 'number' && !Number.isNaN(source.rainProb)
    ? Math.round(source.rainProb)
    : undefined;
  if (rainProb !== undefined && rainProb >= 40) {
    return `강수 ${rainProb}%`;
  }

  const airLabel = normalizeAirQualityLabel(source.pm25Label ?? source.pm25Grade);
  if (airLabel && (airLabel === '나쁨' || airLabel === '매우나쁨')) {
    return `미세 ${airLabel}`;
  }

  if (
    typeof source.feelsLike === 'number' &&
    typeof source.temperature === 'number' &&
    Math.abs(source.feelsLike - source.temperature) >= 3
  ) {
    return `체감 ${formatTemperature(source.feelsLike, units)}`;
  }

  if (typeof source.windSpeed === 'number' && source.windSpeed >= 6) {
    return '강풍 주의';
  }

  if (source.summary && source.summary.trim()) {
    return truncate(source.summary.trim());
  }

  return '';
};

const getWeatherTone = (conditionRaw: string | undefined, stealth: boolean): WeatherToneToken => {
  const condition = conditionRaw ?? '';
  const includes = (keyword: string) => condition.includes(keyword);

  if (stealth) {
    if (includes('맑')) {
      return {
        text: 'text-slate-700 dark:text-slate-200',
        accent: 'text-slate-600 dark:text-slate-300',
        icon: 'text-slate-600 dark:text-slate-300',
      };
    }
    if (includes('구름')) {
      return {
        text: 'text-slate-600 dark:text-slate-200',
        accent: 'text-slate-500 dark:text-slate-300',
        icon: 'text-slate-500 dark:text-slate-300',
      };
    }
    if (includes('비')) {
      return {
        text: 'text-sky-700 dark:text-sky-300',
        accent: 'text-sky-600 dark:text-sky-300',
        icon: 'text-sky-600 dark:text-sky-300',
      };
    }
    if (includes('눈')) {
      return {
        text: 'text-blue-700 dark:text-blue-300',
        accent: 'text-blue-600 dark:text-blue-300',
        icon: 'text-blue-600 dark:text-blue-300',
      };
    }
    return {
      text: 'text-slate-600 dark:text-slate-300',
      accent: 'text-slate-500 dark:text-slate-300',
      icon: 'text-slate-500 dark:text-slate-300',
    };
  }

  if (includes('맑')) {
    return {
      text: 'text-amber-600 dark:text-amber-300',
      accent: 'text-amber-500 dark:text-amber-300',
      icon: 'text-amber-500 dark:text-amber-300',
    };
  }
  if (includes('구름')) {
    return {
      text: 'text-slate-700 dark:text-slate-200',
      accent: 'text-slate-600 dark:text-slate-300',
      icon: 'text-slate-600 dark:text-slate-300',
    };
  }
  if (includes('비')) {
    return {
      text: 'text-blue-600 dark:text-blue-300',
      accent: 'text-blue-500 dark:text-blue-300',
      icon: 'text-blue-500 dark:text-blue-300',
    };
  }
  if (includes('눈')) {
    return {
      text: 'text-sky-600 dark:text-sky-300',
      accent: 'text-sky-500 dark:text-sky-300',
      icon: 'text-sky-500 dark:text-sky-300',
    };
  }
  return DEFAULT_TONE;
};

export function WeatherMini({
  state,
  isEditMode: _isEditMode,
  setState: _setState,
  widgetRef,
  isStealthMode,
  onRetry,
  showLocation = true,
  showCondition = true,
}: Props) {
  const cw = state.currentWeather;

  const [stealthDetected, setStealthDetected] = useState(false);
  const stealth = isStealthMode ?? stealthDetected;

  const secondaryInfo = useMemo(() => {
    if (!cw) return '';

    const hourlyRainCandidates = state.hourlyForecast
      .slice(0, 6)
      .map(hour => hour?.precipitationProbability)
      .filter((prob): prob is number => typeof prob === 'number' && !Number.isNaN(prob));

    const dailyRainProb = state.dailyForecast?.[0]?.precipitationProbability;
    if (typeof dailyRainProb === 'number' && !Number.isNaN(dailyRainProb)) {
      hourlyRainCandidates.push(dailyRainProb);
    }

    const rainProb =
      hourlyRainCandidates.length > 0 ? Math.max(...hourlyRainCandidates) : undefined;

    const airQualitySource = (cw as any)?.airQuality || (state as any)?.airQuality;

    const summaryText =
      (cw as any)?.summary ?? cw.description ?? cw.condition ?? null;

    return getSecondaryInfo(
      {
        rainProb,
        pm25Label: airQualitySource?.pm25Label ?? (cw as any)?.pm25Label ?? null,
        pm25Grade: airQualitySource?.pm25Grade ?? (cw as any)?.pm25Grade ?? null,
        feelsLike: cw.feelsLike ?? null,
        temperature: cw.temperature ?? null,
        windSpeed: cw.windSpeed ?? null,
        summary: summaryText,
      },
      state.units
    );
  }, [cw, state.dailyForecast, state.hourlyForecast, state.units]);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const checkStealth = () => {
      setStealthDetected(Boolean(document.querySelector('[data-stealth-mode="true"]')));
    };

    checkStealth();
    document.addEventListener('visibilitychange', checkStealth);

    let observer: MutationObserver | null = null;
    if ('MutationObserver' in window && document.body) {
      observer = new MutationObserver(checkStealth);
      observer.observe(document.body, {
        attributes: true,
        subtree: true,
        attributeFilter: ['data-stealth-mode'],
      });
    }

    return () => {
      document.removeEventListener('visibilitychange', checkStealth);
      observer?.disconnect();
    };
  }, []);

  const tone = useMemo(() => getWeatherTone(cw?.condition, stealth), [cw?.condition, stealth]);
  const locationName = cw?.location?.name ?? state.location?.name ?? '위치 없음';
  const conditionText = cw?.condition ?? '상태 정보 없음';
  const temperatureText = cw ? formatTemperature(cw.temperature, state.units) : null;
  const isOffline = state.isOnline === false;

  return (
    <div
      ref={widgetRef || undefined}
      role="group"
      aria-label="현재 날씨"
      className="h-full px-2 py-2 flex flex-col items-center justify-center text-center min-h-0 bg-white dark:bg-gray-800 focus:outline-none rounded-lg"
    >
      {state.loading ? (
        <div role="status" aria-live="polite" className="w-full space-y-1">
          <div className="h-4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
          <div className="h-3 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
          <div className="h-2 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
        </div>
      ) : state.error ? (
        <div role="status" aria-live="polite" className="flex flex-col items-center w-full">
          <AlertCircle aria-hidden="true" className="w-4 h-4 text-red-500 dark:text-red-400 mx-auto mb-1" />
          <span className="sr-only">날씨 정보를 불러오지 못했습니다.</span>
          <div className="text-[11px] text-red-600 dark:text-red-400">오류</div>
          <div
            className="text-[10px] text-gray-600 dark:text-gray-400 mt-0.5 truncate max-w-full leading-tight"
            title={locationName}
          >
            {locationName}
          </div>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-1 text-[10px] px-2 py-0.5 rounded border border-gray-300 dark:border-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
            >
              다시 시도
            </button>
          )}
        </div>
      ) : cw ? (
        <div role="status" aria-live="polite" className="flex flex-col items-center w-full">
          <div aria-hidden="true" className={`flex items-end gap-1 leading-none ${tone.icon}`}>
            {cw.icon}
          </div>
          <span className="sr-only">{conditionText}</span>
          <div className={`mt-0.5 flex items-baseline gap-1`}>
            <div className={`text-lg font-semibold leading-none tracking-tight ${tone.text}`}>
              {temperatureText ?? '--°'}
            </div>
          </div>
          {secondaryInfo && (
            <div
              className="text-[11px] text-gray-600 dark:text-gray-300 mt-1 leading-tight"
              title={secondaryInfo}
            >
              {secondaryInfo}
            </div>
          )}
          {isOffline && (
            <div className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 mt-0.5">
              오프라인
            </div>
          )}
        </div>
      ) : (
        <div role="status" aria-live="polite" className="text-[11px] text-gray-600 dark:text-gray-300">
          날씨 정보 없음
        </div>
      )}
    </div>
  );
}
