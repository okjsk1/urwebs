// Vercel Functions - 환율 API 프록시
// 실제 배포 시에는 이 파일을 사용

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
};

// 한국수출입은행 API 키 (환경변수에서 가져오기)
const KOREA_EXIM_API_KEY = process.env.KOREA_EXIM_API_KEY || 'DmDlLpOj8J0F2zqE1mXgWLMzQOFxv8k8';

// 통화 코드 매핑
const CURRENCY_MAP = {
  'USD': 'USD',
  'EUR': 'EUR', 
  'JPY': 'JPY',
  'GBP': 'GBP',
  'CNY': 'CNY',
  'AUD': 'AUD',
  'CAD': 'CAD',
  'CHF': 'CHF',
  'SGD': 'SGD',
  'KRW': 'KRW'
};

// 환율 데이터 캐시 (메모리 기반)
let rateCache = {
  data: null,
  timestamp: 0,
  ttl: 60000 // 1분 캐시
};

// 한국수출입은행 API에서 환율 데이터 가져오기
async function fetchKoreaEximRates() {
  try {
    const response = await fetch(
      `https://www.koreaexim.go.kr/site/program/financial/exchangeJSON?authkey=${KOREA_EXIM_API_KEY}&data=AP01`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Korea Exim API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Korea Exim API error:', error);
    throw error;
  }
}

// 환율 데이터를 표준화된 형태로 변환
function normalizeRates(apiData, baseCurrency, targetSymbols) {
  const rates = [];
  const now = Date.now();

  // KRW 기준 환율 처리
  if (baseCurrency === 'KRW') {
    targetSymbols.forEach(symbol => {
      if (symbol === 'KRW') return;

      const apiRate = apiData.find(item => item.cur_unit === symbol);
      if (apiRate) {
        const rate = parseFloat(apiRate.deal_bas_r.replace(/,/g, ''));
        rates.push({
          base: 'KRW',
          quote: symbol,
          rate: rate,
          changePct: parseFloat(apiRate.change_rate) || 0,
          change: parseFloat(apiRate.change) || 0,
          timestamp: now
        });
      }
    });
  }

  // 교차 환율 계산 (USD 기준)
  if (baseCurrency !== 'KRW') {
    const usdRates = {};
    
    // USD 기준 환율 수집
    targetSymbols.forEach(symbol => {
      if (symbol === 'USD') return;
      
      const apiRate = apiData.find(item => item.cur_unit === symbol);
      if (apiRate) {
        const rate = parseFloat(apiRate.deal_bas_r.replace(/,/g, ''));
        usdRates[symbol] = rate;
      }
    });

    // 교차 환율 계산
    targetSymbols.forEach(symbol => {
      if (symbol === baseCurrency) return;

      let rate;
      if (baseCurrency === 'USD') {
        rate = usdRates[symbol] || 1;
      } else if (symbol === 'USD') {
        rate = 1 / (usdRates[baseCurrency] || 1);
      } else {
        // A/B = (A/USD) / (B/USD)
        const baseToUsd = usdRates[baseCurrency] || 1;
        const symbolToUsd = usdRates[symbol] || 1;
        rate = symbolToUsd / baseToUsd;
      }

      rates.push({
        base: baseCurrency,
        quote: symbol,
        rate: rate,
        changePct: 0, // 교차 환율의 경우 변동률 계산 복잡
        change: 0,
        timestamp: now
      });
    });
  }

  return rates;
}

// Vercel Functions 메인 핸들러
export default async function handler(req, res) {
  // CORS 헤더 설정
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  // CORS preflight 처리
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  // GET 요청만 허용
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { base = 'KRW', symbols = 'USD,EUR,JPY' } = req.query;
    
    // 파라미터 검증
    if (!CURRENCY_MAP[base]) {
      return res.status(400).json({ error: 'Invalid base currency' });
    }

    const targetSymbols = symbols.split(',').filter(s => CURRENCY_MAP[s]);
    if (targetSymbols.length === 0) {
      return res.status(400).json({ error: 'No valid target symbols' });
    }

    // 캐시 확인
    const now = Date.now();
    if (rateCache.data && (now - rateCache.timestamp) < rateCache.ttl) {
      return res.status(200).json({
        rates: rateCache.data,
        cached: true,
        timestamp: rateCache.timestamp
      });
    }

    // API에서 데이터 가져오기
    const apiData = await fetchKoreaEximRates();
    
    // 데이터 정규화
    const normalizedRates = normalizeRates(apiData, base, targetSymbols);

    // 캐시 업데이트
    rateCache = {
      data: normalizedRates,
      timestamp: now,
      ttl: 60000
    };

    // 응답
    res.status(200).json({
      rates: normalizedRates,
      cached: false,
      timestamp: now,
      base,
      symbols: targetSymbols
    });

  } catch (error) {
    console.error('Forex API error:', error);
    
    // 캐시된 데이터가 있으면 반환
    if (rateCache.data) {
      return res.status(200).json({
        rates: rateCache.data,
        cached: true,
        stale: true,
        error: 'Using cached data due to API error',
        timestamp: rateCache.timestamp
      });
    }

    // 에러 응답
    res.status(500).json({
      error: 'Failed to fetch exchange rates',
      message: error.message
    });
  }
}


