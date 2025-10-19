// 환율 데이터 서비스 - 실시간 환율, 다중 기준통화, 보안 프록시
export type FxSymbol = 'KRW' | 'USD' | 'EUR' | 'JPY' | 'GBP' | 'CNY' | 'AUD' | 'CAD' | 'CHF' | 'SGD';

export interface FxTick {
  base: FxSymbol;
  quote: FxSymbol;
  rate: number;
  changePct?: number;
  change?: number;
  timestamp: number;
}

export type FxStatus = 'idle' | 'loading' | 'live' | 'stale' | 'error';

export interface FxSubscriptionOptions {
  base: FxSymbol;
  symbols: FxSymbol[];
  intervalMs?: number;
  maxRetries?: number;
}

export interface FxSubscription {
  stop: () => void;
  getStatus: () => FxStatus;
  getLastUpdate: () => number;
}

// 통화 정보
export const CURRENCY_INFO: Record<FxSymbol, { name: string; symbol: string; flag: string; precision: number }> = {
  KRW: { name: '한국 원', symbol: '₩', flag: '🇰🇷', precision: 0 },
  USD: { name: '미국 달러', symbol: '$', flag: '🇺🇸', precision: 4 },
  EUR: { name: '유로', symbol: '€', flag: '🇪🇺', precision: 4 },
  JPY: { name: '일본 엔', symbol: '¥', flag: '🇯🇵', precision: 2 },
  GBP: { name: '영국 파운드', symbol: '£', flag: '🇬🇧', precision: 4 },
  CNY: { name: '중국 위안', symbol: '¥', flag: '🇨🇳', precision: 4 },
  AUD: { name: '호주 달러', symbol: 'A$', flag: '🇦🇺', precision: 4 },
  CAD: { name: '캐나다 달러', symbol: 'C$', flag: '🇨🇦', precision: 4 },
  CHF: { name: '스위스 프랑', symbol: 'CHF', flag: '🇨🇭', precision: 4 },
  SGD: { name: '싱가포르 달러', symbol: 'S$', flag: '🇸🇬', precision: 4 }
};

// 더미 환율 데이터 생성 (개발 환경용)
function generateDummyRates(base: FxSymbol, symbols: FxSymbol[]): FxTick[] {
  const baseRates: Record<FxSymbol, number> = {
    KRW: 1,
    USD: 0.00075,
    EUR: 0.00069,
    JPY: 0.11,
    GBP: 0.00059,
    CNY: 0.0054,
    AUD: 0.0011,
    CAD: 0.0010,
    CHF: 0.00067,
    SGD: 0.0010
  };

  return symbols.map(quote => {
    const baseRate = baseRates[base] || 1;
    const quoteRate = baseRates[quote] || 1;
    const rate = base === quote ? 1 : baseRate / quoteRate;
    const change = (Math.random() - 0.5) * 0.02; // ±1% 변동
    const changePct = (change / rate) * 100;

    return {
      base,
      quote,
      rate: parseFloat(rate.toFixed(4)),
      change: parseFloat(change.toFixed(4)),
      changePct: parseFloat(changePct.toFixed(2)),
      timestamp: Date.now()
    };
  });
}

// 환율 데이터 가져오기 (서버 프록시 경유)
async function fetchRates(options: {
  base: FxSymbol;
  symbols: FxSymbol[];
  signal?: AbortSignal;
}): Promise<FxTick[]> {
  const { base, symbols, signal } = options;
  const symbolsParam = symbols.join(',');
  
  // 서버 프록시 API 호출
  const response = await fetch(`/api/forex?base=${base}&symbols=${symbolsParam}`, {
    signal,
    headers: {
      'Accept': 'application/json',
      'Cache-Control': 'no-cache'
    }
  });

  if (response.status === 304) {
    // 캐시 hit - 클라이언트 캐시 사용
    throw new Error('CACHE_HIT');
  }

  if (!response.ok) {
    throw new Error(`Forex API error: ${response.status} ${response.statusText}`);
  }

  const text = await response.text();
  
  // JSON 파싱 전에 텍스트 검증
  if (!text || text.trim().startsWith('//') || text.trim().startsWith('<!DOCTYPE')) {
<<<<<<< HEAD
    console.warn('Invalid response format from forex API:', text.substring(0, 100));
    // 개발 환경에서는 더미 데이터 반환
    if (import.meta.env.MODE === 'development') {
      return generateDummyRates(base, symbols);
    }
=======
    // 개발 환경에서는 조용히 더미 데이터 반환 (콘솔 경고 제거)
    if (import.meta.env.MODE === 'development') {
      return generateDummyRates(base, symbols);
    }
    console.warn('Invalid response format from forex API:', text.substring(0, 100));
>>>>>>> f18eacae9db3a659b475638dca7b7d0b0ae30bd6
    throw new Error('Invalid JSON response from forex API');
  }
  
  let data;
  try {
    data = JSON.parse(text);
  } catch (parseError) {
<<<<<<< HEAD
    console.error('JSON parse error:', parseError);
    console.error('Response text:', text.substring(0, 200));
    
    // 개발 환경에서는 더미 데이터 반환
    if (import.meta.env.MODE === 'development') {
      console.warn('Using dummy forex data in development mode');
      return generateDummyRates(base, symbols);
    }
=======
    // 개발 환경에서는 조용히 더미 데이터 반환
    if (import.meta.env.MODE === 'development') {
      return generateDummyRates(base, symbols);
    }
    console.error('JSON parse error:', parseError);
    console.error('Response text:', text.substring(0, 200));
>>>>>>> f18eacae9db3a659b475638dca7b7d0b0ae30bd6
    throw new Error('Failed to parse forex API response');
  }
  
  // 서버 응답을 표준화된 형태로 변환
  if (!data || !Array.isArray(data.rates)) {
<<<<<<< HEAD
    console.warn('Invalid forex API response format:', data);
    
    // 개발 환경에서는 더미 데이터 반환
    if (import.meta.env.MODE === 'development') {
      console.warn('Using dummy forex data due to invalid response format');
      return generateDummyRates(base, symbols);
    }
=======
    // 개발 환경에서는 조용히 더미 데이터 반환
    if (import.meta.env.MODE === 'development') {
      return generateDummyRates(base, symbols);
    }
    console.warn('Invalid forex API response format:', data);
>>>>>>> f18eacae9db3a659b475638dca7b7d0b0ae30bd6
    throw new Error('Invalid forex API response format');
  }
  
  return data.rates.map((rate: any) => ({
    base: rate.base as FxSymbol,
    quote: rate.quote as FxSymbol,
    rate: parseFloat(rate.rate),
    changePct: rate.changePct ? parseFloat(rate.changePct) : undefined,
    change: rate.change ? parseFloat(rate.change) : undefined,
    timestamp: Date.now()
  }));
}

// 환율 구독 시작
export function subscribeRates(
  options: FxSubscriptionOptions,
  onData: (ticks: FxTick[]) => void,
  onStatus?: (status: FxStatus) => void
): FxSubscription {
  let status: FxStatus = 'idle';
  let lastUpdate = 0;
  let retryCount = 0;
  let currentTimer: NodeJS.Timeout | null = null;
  let aborted = false;

  const {
    base,
    symbols,
    intervalMs = 60000, // 1분
    maxRetries = 5
  } = options;

  const updateStatus = (newStatus: FxStatus) => {
    status = newStatus;
    onStatus?.(newStatus);
  };

  const tick = async () => {
    if (aborted) return;
    
    try {
      updateStatus('loading');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10초 타임아웃
      
      const ticks = await fetchRates({
        base,
        symbols,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      onData(ticks);
      updateStatus('live');
      lastUpdate = Date.now();
      retryCount = 0;
      
    } catch (error) {
      console.error('환율 조회 실패:', error);
      
      if (error instanceof Error && error.message === 'CACHE_HIT') {
        updateStatus('live');
        lastUpdate = Date.now();
        return;
      }
      
      retryCount++;
      
      if (retryCount >= maxRetries) {
        updateStatus('error');
        console.error('최대 재시도 횟수 초과, 구독 중단');
        return;
      }
      
      updateStatus('stale');
    }
  };

  const scheduleNext = () => {
    if (aborted) return;
    
    const baseInterval = intervalMs;
    const backoffMultiplier = Math.min(Math.pow(2, retryCount), 8); // 최대 8배
    const nextInterval = baseInterval * backoffMultiplier;
    
    currentTimer = setTimeout(() => {
      tick().finally(() => {
        if (!aborted) {
          scheduleNext();
        }
      });
    }, nextInterval);
  };

  const start = () => {
    if (aborted) return;
    tick().finally(() => {
      if (!aborted) {
        scheduleNext();
      }
    });
  };

  const stop = () => {
    aborted = true;
    if (currentTimer) {
      clearTimeout(currentTimer);
      currentTimer = null;
    }
    updateStatus('idle');
  };

  // 페이지 가시성 변경 처리
  const handleVisibilityChange = () => {
    if (document.hidden) {
      // 페이지가 숨겨지면 일시정지
      if (currentTimer) {
        clearTimeout(currentTimer);
        currentTimer = null;
      }
      updateStatus('stale');
    } else {
      // 페이지가 다시 보이면 즉시 동기화 후 재시작
      if (!aborted) {
        start();
      }
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);

  // 초기 시작
  start();

  return {
    stop: () => {
      stop();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    },
    getStatus: () => status,
    getLastUpdate: () => lastUpdate
  };
}

// 환율 변환
export function convertRate(
  amount: number,
  from: FxSymbol,
  to: FxSymbol,
  rates: FxTick[],
  baseCurrency: FxSymbol = 'KRW'
): number {
  if (from === to) return amount;
  
  // 직접 환율 찾기
  const directRate = rates.find(r => r.base === from && r.quote === to);
  if (directRate) {
    return amount * directRate.rate;
  }
  
  // 역환율 찾기
  const reverseRate = rates.find(r => r.base === to && r.quote === from);
  if (reverseRate) {
    return amount / reverseRate.rate;
  }
  
  // 기준통화를 통한 교차 환율
  if (from !== baseCurrency && to !== baseCurrency) {
    const fromToBase = rates.find(r => r.base === baseCurrency && r.quote === from);
    const baseToTo = rates.find(r => r.base === baseCurrency && r.quote === to);
    
    if (fromToBase && baseToTo) {
      return amount * (baseToTo.rate / fromToBase.rate);
    }
  }
  
  return amount; // 변환 불가능한 경우 원본 반환
}

// 환율 포맷팅
export function formatFxRate(rate: number, from: FxSymbol, to: FxSymbol): string {
  const fromInfo = CURRENCY_INFO[from];
  const toInfo = CURRENCY_INFO[to];
  
  // KRW, JPY는 정수 또는 소수 2자리, 나머지는 소수 4자리
  const precision = (from === 'KRW' || from === 'JPY' || to === 'KRW' || to === 'JPY') ? 2 : 4;
  
  return rate.toLocaleString(undefined, {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision
  });
}

// 변동률 포맷팅
export function formatChangePct(changePct: number): string {
  const sign = changePct >= 0 ? '+' : '';
  return `${sign}${changePct.toFixed(2)}%`;
}

// 통화 정보 가져오기
export function getCurrencyInfo(symbol: FxSymbol) {
  return CURRENCY_INFO[symbol] || { name: symbol, symbol: symbol, flag: '🌍', precision: 2 };
}

// 알림 권한 요청
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    return false;
  }
  
  if (Notification.permission === 'granted') {
    return true;
  }
  
  if (Notification.permission === 'denied') {
    return false;
  }
  
  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

// 브라우저 알림 표시
export function showNotification(title: string, body: string, icon?: string) {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return false;
  }
  
  try {
    new Notification(title, {
      body,
      icon: icon || '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'forex-alert',
      requireInteraction: false
    });
    return true;
  } catch (error) {
    console.error('알림 표시 실패:', error);
    return false;
  }
}
