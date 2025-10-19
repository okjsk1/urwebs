/**
 * 금융 데이터 API 어댑터
 * 실시간 시세, 코인, 주식, 경제 지표 등
 */

export type AssetType = 'crypto' | 'equity' | 'fx';

export interface Quote {
  symbol: string;
  price: number;
  change: number;
  changePct: number;
  time: number;
  currency?: string;
  high24h?: number;
  low24h?: number;
  volume?: number;
}

export interface EconomicEvent {
  id: string;
  title: string;
  dt: number; // timestamp
  impact: 'high' | 'medium' | 'low';
  country: string;
  actual?: number;
  consensus?: number;
  previous?: number;
}

export interface Subscription {
  close: () => void;
}

// 더미 데이터 생성 (실제 API 연결 시 교체)
const generateDummyQuote = (symbol: string, basePrice: number): Quote => {
  const variation = (Math.random() - 0.5) * basePrice * 0.02; // ±2% 변동
  const price = basePrice + variation;
  const change = variation;
  const changePct = (variation / basePrice) * 100;
  
  return {
    symbol,
    price: Math.round(price * 100) / 100,
    change: Math.round(change * 100) / 100,
    changePct: Math.round(changePct * 100) / 100,
    time: Date.now(),
    currency: 'USD',
    high24h: price * 1.05,
    low24h: price * 0.95,
    volume: Math.floor(Math.random() * 1000000)
  };
};

// 심볼별 기본 가격
const BASE_PRICES: Record<string, number> = {
  'BTC': 45000,
  'ETH': 2500,
  'XRP': 0.65,
  'ADA': 0.45,
  'SOL': 110,
  'AAPL': 175,
  'TSLA': 240,
  'GOOGL': 140,
  'MSFT': 380,
  'NVDA': 495
};

/**
 * 시세 조회
 */
export async function getQuotes(
  symbols: string[],
  options?: { asset?: AssetType }
): Promise<Quote[]> {
  // TODO: 실제 API 연결 (CoinGecko, Alpha Vantage 등)
  // 현재는 더미 데이터 반환
  
  return new Promise((resolve) => {
    setTimeout(() => {
      const quotes = symbols.map(symbol => {
        const basePrice = BASE_PRICES[symbol] || 100;
        return generateDummyQuote(symbol, basePrice);
      });
      resolve(quotes);
    }, 100); // 네트워크 지연 시뮬레이션
  });
}

/**
 * 실시간 시세 구독
 */
export function subscribeQuotes(
  symbols: string[],
  callback: (quote: Quote) => void,
  options?: { asset?: AssetType; interval?: number }
): Subscription {
  const interval = options?.interval || 10000; // 기본 10초
  
  // 폴링 방식 (WebSocket 사용 가능 시 교체)
  const timer = setInterval(async () => {
    try {
      const quotes = await getQuotes(symbols, options);
      quotes.forEach(callback);
    } catch (error) {
      console.error('Failed to fetch quotes:', error);
    }
  }, interval);
  
  // 초기 데이터 즉시 로드
  getQuotes(symbols, options).then(quotes => {
    quotes.forEach(callback);
  });
  
  return {
    close: () => clearInterval(timer)
  };
}

/**
 * 경제 캘린더 조회
 */
export async function getEconomicCalendar(options?: {
  from?: number;
  to?: number;
  country?: string;
  impact?: 'high' | 'medium' | 'low';
}): Promise<EconomicEvent[]> {
  // TODO: 실제 API 연결 (Trading Economics, Forex Factory 등)
  
  const now = Date.now();
  const weekInMs = 7 * 24 * 60 * 60 * 1000;
  
  // 더미 이벤트 데이터
  const dummyEvents: EconomicEvent[] = [
    {
      id: '1',
      title: 'FOMC 금리 결정',
      dt: now + 2 * 24 * 60 * 60 * 1000,
      impact: 'high',
      country: 'US',
      consensus: 5.5,
      previous: 5.25
    },
    {
      id: '2',
      title: 'CPI (소비자물가지수)',
      dt: now + 5 * 24 * 60 * 60 * 1000,
      impact: 'high',
      country: 'US',
      consensus: 3.2,
      previous: 3.7
    },
    {
      id: '3',
      title: '고용 보고서 (NFP)',
      dt: now + 10 * 24 * 60 * 60 * 1000,
      impact: 'high',
      country: 'US',
      previous: 187000
    },
    {
      id: '4',
      title: 'GDP 성장률',
      dt: now + 15 * 24 * 60 * 60 * 1000,
      impact: 'medium',
      country: 'KR',
      consensus: 2.1,
      previous: 2.3
    }
  ];
  
  return new Promise((resolve) => {
    setTimeout(() => {
      let filtered = dummyEvents;
      
      if (options?.country) {
        filtered = filtered.filter(e => e.country === options.country);
      }
      
      if (options?.impact) {
        filtered = filtered.filter(e => e.impact === options.impact);
      }
      
      if (options?.from) {
        filtered = filtered.filter(e => e.dt >= options.from!);
      }
      
      if (options?.to) {
        filtered = filtered.filter(e => e.dt <= options.to!);
      }
      
      resolve(filtered.sort((a, b) => a.dt - b.dt));
    }, 100);
  });
}

/**
 * 숫자/통화 포맷팅
 */
export function formatMoney(
  value: number,
  currency: string = 'USD',
  locale: string = 'ko-KR'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: currency === 'KRW' ? 0 : 2,
    maximumFractionDigits: currency === 'KRW' ? 0 : 2
  }).format(value);
}

/**
 * 퍼센트 포맷팅
 */
export function formatPercent(value: number, decimals: number = 2): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
}

/**
 * 알림 평가
 */
export interface Alert {
  id: string;
  symbol: string;
  condition: 'gte' | 'lte' | 'pctUp' | 'pctDown';
  target: number;
  active: boolean;
  lastTriggeredAt?: number;
  cooldownSec?: number;
  note?: string;
}

export function evaluateAlerts(
  alerts: Alert[],
  quotes: Record<string, Quote>,
  now: number = Date.now()
): string[] {
  const fired: string[] = [];
  
  for (const alert of alerts) {
    if (!alert.active) continue;
    
    const quote = quotes[alert.symbol];
    if (!quote) continue;
    
    // 조건 평가
    let triggered = false;
    switch (alert.condition) {
      case 'gte':
        triggered = quote.price >= alert.target;
        break;
      case 'lte':
        triggered = quote.price <= alert.target;
        break;
      case 'pctUp':
        triggered = quote.changePct >= alert.target;
        break;
      case 'pctDown':
        triggered = quote.changePct <= -alert.target;
        break;
    }
    
    // 쿨다운 체크
    const cooldownMs = (alert.cooldownSec || 300) * 1000;
    const cooldownOk = !alert.lastTriggeredAt || (now - alert.lastTriggeredAt) >= cooldownMs;
    
    if (triggered && cooldownOk) {
      fired.push(alert.id);
    }
  }
  
  return fired;
}

/**
 * 브라우저 알림 표시
 */
export async function showNotification(title: string, body: string): Promise<void> {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return;
  }
  
  if (Notification.permission === 'granted') {
    new Notification(title, { body });
  } else if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      new Notification(title, { body });
    }
  }
}


















