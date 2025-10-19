// 크립토 가격 데이터 서비스 - WebSocket 우선, 폴백 폴링
export type Quote = 'KRW' | 'USD';
export type Symbol = 'BTC' | 'ETH' | 'SOL' | 'XRP' | 'ADA' | 'DOT' | 'MATIC' | 'AVAX';
export type Exchange = 'upbit' | 'binance';

export interface PriceTick {
  symbol: Symbol;
  price: number;
  changePct: number;
  change: number;
  volume?: number;
  timestamp: number;
}

export type Status = 'idle' | 'connecting' | 'live' | 'error';

export interface CryptoSubscriptionOptions {
  symbols: Symbol[];
  quote: Quote;
  exchange?: Exchange;
  intervalMs?: number;
  maxRetries?: number;
}

export interface CryptoSubscription {
  unsubscribe: () => void;
  getStatus: () => Status;
  getLastUpdate: () => number;
}

// 심볼 매핑 (거래소별)
const SYMBOL_MAPPING = {
  upbit: {
    BTC: 'KRW-BTC',
    ETH: 'KRW-ETH',
    SOL: 'KRW-SOL',
    XRP: 'KRW-XRP',
    ADA: 'KRW-ADA',
    DOT: 'KRW-DOT',
    MATIC: 'KRW-MATIC',
    AVAX: 'KRW-AVAX'
  },
  binance: {
    BTC: 'BTCUSDT',
    ETH: 'ETHUSDT',
    SOL: 'SOLUSDT',
    XRP: 'XRPUSDT',
    ADA: 'ADAUSDT',
    DOT: 'DOTUSDT',
    MATIC: 'MATICUSDT',
    AVAX: 'AVAXUSDT'
  }
};

// 환율 캐시 (KRW ↔ USD)
let exchangeRateCache: { rate: number; timestamp: number } | null = null;
const EXCHANGE_CACHE_DURATION = 30 * 60 * 1000; // 30분

// 환율 가져오기 (캐시 포함)
async function getExchangeRate(): Promise<number> {
  const now = Date.now();
  
  // 캐시된 환율이 유효한 경우
  if (exchangeRateCache && (now - exchangeRateCache.timestamp) < EXCHANGE_CACHE_DURATION) {
    return exchangeRateCache.rate;
  }

  try {
    // 간단한 환율 API (실제로는 더 안정적인 API 사용 권장)
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    const data = await response.json();
    const rate = data.rates.KRW || 1300; // 기본값
    
    exchangeRateCache = { rate, timestamp: now };
    return rate;
  } catch (error) {
    console.warn('환율 API 실패, 기본값 사용:', error);
    return exchangeRateCache?.rate || 1300; // 캐시된 값 또는 기본값
  }
}

// Upbit REST API로 가격 데이터 가져오기
async function fetchUpbitPrices(symbols: Symbol[]): Promise<PriceTick[]> {
  const markets = symbols.map(symbol => SYMBOL_MAPPING.upbit[symbol]).join(',');
  const response = await fetch(`https://api.upbit.com/v1/ticker?markets=${markets}`);
  
  if (!response.ok) {
    throw new Error(`Upbit API error: ${response.status}`);
  }
  
  const data = await response.json();
  const exchangeRate = await getExchangeRate();
  
  return data.map((item: any) => {
    const symbol = Object.keys(SYMBOL_MAPPING.upbit).find(
      key => SYMBOL_MAPPING.upbit[key as Symbol] === item.market
    ) as Symbol;
    
    return {
      symbol,
      price: item.trade_price,
      changePct: item.signed_change_rate * 100,
      change: item.signed_change_price,
      volume: item.acc_trade_volume_24h,
      timestamp: Date.now()
    };
  });
}

// Binance REST API로 가격 데이터 가져오기
async function fetchBinancePrices(symbols: Symbol[]): Promise<PriceTick[]> {
  const promises = symbols.map(async (symbol) => {
    const binanceSymbol = SYMBOL_MAPPING.binance[symbol];
    const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${binanceSymbol}`);
    
    if (!response.ok) {
      throw new Error(`Binance API error: ${response.status}`);
    }
    
    const data = await response.json();
    return {
      symbol,
      price: parseFloat(data.lastPrice),
      changePct: parseFloat(data.priceChangePercent),
      change: parseFloat(data.priceChange),
      volume: parseFloat(data.volume),
      timestamp: Date.now()
    };
  });
  
  return Promise.all(promises);
}

// 가격 데이터 구독
export function subscribePrices(
  options: CryptoSubscriptionOptions,
  onTick: (tick: PriceTick) => void,
  onStatus?: (status: Status) => void
): CryptoSubscription {
  let status: Status = 'idle';
  let lastUpdate = 0;
  let stopFunctions: (() => void)[] = [];
  let stopped = false;
  let retryCount = 0;
  let currentTimer: NodeJS.Timeout | null = null;

  const {
    symbols,
    quote,
    exchange = 'upbit',
    intervalMs = 5000,
    maxRetries = 5
  } = options;

  const updateStatus = (newStatus: Status) => {
    status = newStatus;
    onStatus?.(newStatus);
  };

  const fetchPrices = async () => {
    if (stopped) return;
    
    try {
      updateStatus('connecting');
      
      let prices: PriceTick[];
      
      if (exchange === 'upbit') {
        prices = await fetchUpbitPrices(symbols);
      } else {
        prices = await fetchBinancePrices(symbols);
      }
      
      // 환율 변환 (필요한 경우)
      if (quote === 'USD' && exchange === 'upbit') {
        const exchangeRate = await getExchangeRate();
        prices = prices.map(price => ({
          ...price,
          price: price.price / exchangeRate,
          change: price.change / exchangeRate
        }));
      } else if (quote === 'KRW' && exchange === 'binance') {
        const exchangeRate = await getExchangeRate();
        prices = prices.map(price => ({
          ...price,
          price: price.price * exchangeRate,
          change: price.change * exchangeRate
        }));
      }
      
      // 각 가격 데이터를 콜백으로 전달
      prices.forEach(price => {
        if (!stopped) {
          onTick(price);
        }
      });
      
      updateStatus('live');
      lastUpdate = Date.now();
      retryCount = 0;
      
    } catch (error) {
      console.error('크립토 가격 조회 실패:', error);
      updateStatus('error');
      retryCount++;
      
      if (retryCount >= maxRetries) {
        console.error('최대 재시도 횟수 초과, 구독 중단');
        stop();
        return;
      }
    }
  };

  const scheduleNext = () => {
    if (stopped) return;
    
    const baseInterval = intervalMs;
    const backoffMultiplier = Math.min(Math.pow(2, retryCount), 8); // 최대 8배
    const nextInterval = baseInterval * backoffMultiplier;
    
    currentTimer = setTimeout(() => {
      fetchPrices().finally(() => {
        if (!stopped) {
          scheduleNext();
        }
      });
    }, nextInterval);
    
    stopFunctions.push(() => {
      if (currentTimer) {
        clearTimeout(currentTimer);
        currentTimer = null;
      }
    });
  };

  const start = () => {
    if (stopped) return;
    fetchPrices().finally(() => {
      if (!stopped) {
        scheduleNext();
      }
    });
  };

  const stop = () => {
    stopped = true;
    stopFunctions.forEach(fn => fn());
    stopFunctions = [];
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
    } else {
      // 페이지가 다시 보이면 재시작
      if (!stopped) {
        start();
      }
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  stopFunctions.push(() => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  });

  // 초기 시작
  start();

  return {
    unsubscribe: stop,
    getStatus: () => status,
    getLastUpdate: () => lastUpdate
  };
}

// 가격 포맷팅 유틸리티
export const formatPrice = (price: number, quote: Quote): string => {
  if (quote === 'KRW') {
    return `₩${Math.round(price).toLocaleString()}`;
  } else {
    return `$${price.toLocaleString(undefined, { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  }
};

export const formatChangePct = (changePct: number): string => {
  const sign = changePct >= 0 ? '+' : '';
  return `${sign}${changePct.toFixed(2)}%`;
};

export const formatChange = (change: number, quote: Quote): string => {
  if (quote === 'KRW') {
    return `₩${Math.round(change).toLocaleString()}`;
  } else {
    return `$${change.toFixed(2)}`;
  }
};

// 심볼 정보
export const getSymbolInfo = (symbol: Symbol) => {
  const info = {
    BTC: { name: 'Bitcoin', icon: '₿' },
    ETH: { name: 'Ethereum', icon: 'Ξ' },
    SOL: { name: 'Solana', icon: '◎' },
    XRP: { name: 'Ripple', icon: 'XRP' },
    ADA: { name: 'Cardano', icon: 'ADA' },
    DOT: { name: 'Polkadot', icon: 'DOT' },
    MATIC: { name: 'Polygon', icon: 'MATIC' },
    AVAX: { name: 'Avalanche', icon: 'AVAX' }
  };
  
  return info[symbol] || { name: symbol, icon: symbol };
};

