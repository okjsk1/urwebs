import type { Website, CategoryConfigMap } from './websites';

export const websites: Website[] = [
  /* ───────── 증권: 시세/차트 ───────── */
  { category: '시세/차트', title: '네이버 금융', url: 'https://finance.naver.com/', description: '국내 시세·뉴스·종목', id: 'KR-ST-P-001' },
  { category: '시세/차트', title: 'TradingView', url: 'https://www.tradingview.com/', description: '차트·지표·아이디어', id: 'GL-ST-C-001' },
  { category: '시세/차트', title: 'Investing.com', url: 'https://www.investing.com/', description: '해외지수·상품·시세', id: 'GL-ST-C-002' },
  { category: '시세/차트', title: 'Yahoo Finance', url: 'https://finance.yahoo.com/', description: '미국 주식·ETF 시세', id: 'GL-ST-C-003' },
  { category: '시세/차트', title: 'Google Finance', url: 'https://www.google.com/finance', description: '간편 종목 검색', id: 'GL-ST-C-004' },

  /* ───────── 증권: 뉴스/리서치 ───────── */
  { category: '뉴스/리서치', title: '매일경제 증권', url: 'https://www.mk.co.kr/stock/', description: '국내 증권 뉴스', id: 'KR-ST-N-001' },
  { category: '뉴스/리서치', title: '한국경제 증권', url: 'https://www.hankyung.com/finance/stock', description: '증시·기업 분석', id: 'KR-ST-N-002' },
  { category: '뉴스/리서치', title: 'Reuters Markets', url: 'https://www.reuters.com/markets/', description: '글로벌 마켓 뉴스', id: 'GL-ST-N-001' },
  { category: '뉴스/리서치', title: 'Bloomberg Markets', url: 'https://www.bloomberg.com/markets', description: '글로벌 금융뉴스', id: 'GL-ST-N-002' },
  { category: '뉴스/리서치', title: 'Seeking Alpha', url: 'https://seekingalpha.com/', description: '기업·ETF 리서치', id: 'GL-ST-N-003' },

  /* ───────── 증권: 공시/기업정보 ───────── */
  { category: '공시/기업정보', title: 'DART 전자공시', url: 'https://dart.fss.or.kr/', description: '금감원 전자공시', id: 'KR-ST-D-001' },
  { category: '공시/기업정보', title: 'KIND 공시(KRX)', url: 'https://kind.krx.co.kr/', description: '거래소 공시 시스템', id: 'KR-ST-D-002' },
  { category: '공시/기업정보', title: 'FnGuide Company', url: 'http://comp.fnguide.com/', description: '기업 재무·컨센서스', id: 'KR-ST-D-003' },
  { category: '공시/기업정보', title: 'WISEreport Company', url: 'https://comp.wisereport.co.kr/', description: '기업 개요·지표', id: 'KR-ST-D-004' },
  { category: '공시/기업정보', title: 'KISVALUE', url: 'https://www.kisvalue.com/', description: '기업 가치·멀티플', id: 'KR-ST-D-005' },

  /* ───────── 증권: 수급/거래/통계 ───────── */
  { category: '수급/통계', title: 'KRX Data', url: 'https://data.krx.co.kr/', description: '거래·지수·통계 다운로드', id: 'KR-ST-T-001' },
  { category: '수급/통계', title: 'KRX 공매도 정보포털', url: 'https://short.krx.co.kr/', description: '공매도 현황·통계', id: 'KR-ST-T-002' },
  { category: '수급/통계', title: 'KRX 시장정보', url: 'https://global.krx.co.kr/', description: '시장 현황·지표', id: 'KR-ST-T-003' },

  /* ───────── 증권: 지표/경제데이터 ───────── */
  { category: '지표/경제데이터', title: '한국은행 ECOS', url: 'https://ecos.bok.or.kr/', description: '금리·환율·통계', id: 'KR-ST-M-001' },
  { category: '지표/경제데이터', title: 'KOSIS', url: 'https://kosis.kr/', description: '국가통계 포털', id: 'KR-ST-M-002' },
  { category: '지표/경제데이터', title: 'FRED', url: 'https://fred.stlouisfed.org/', description: '미국·글로벌 거시지표', id: 'GL-ST-M-001' },
  { category: '지표/경제데이터', title: 'OECD Data', url: 'https://data.oecd.org/', description: 'OECD 경제 데이터', id: 'GL-ST-M-002' },
  { category: '지표/경제데이터', title: 'IMF Data', url: 'https://www.imf.org/en/Data', description: 'IMF 통계·데이터셋', id: 'GL-ST-M-003' },

  /* ───────── 증권: ETF/지수 ───────── */
  { category: 'ETF/지수', title: 'KODEX(삼성자산운용)', url: 'https://www.kodex.com/', description: '국내 ETF 운용사', id: 'KR-ST-ETF-001' },
  { category: 'ETF/지수', title: 'TIGER(미래에셋자산운용)', url: 'https://www.tigeretf.com/', description: '국내 ETF 운용사', id: 'KR-ST-ETF-002' },
  { category: 'ETF/지수', title: 'KBSTAR(국민은행)', url: 'https://www.kbstaretf.com/', description: '국내 ETF 운용사', id: 'KR-ST-ETF-003' },
  { category: 'ETF/지수', title: 'KINDEX(NH-Amundi)', url: 'https://www.nham-etf.com/', description: '국내 ETF 운용사', id: 'KR-ST-ETF-004' },
  { category: 'ETF/지수', title: 'ARIRANG(한화자산운용)', url: 'https://www.arirang.co.kr/', description: '국내 ETF 운용사', id: 'KR-ST-ETF-005' },
  { category: 'ETF/지수', title: 'MSCI Indexes', url: 'https://www.msci.com/our-solutions/indexes', description: '글로벌 지수 제공사', id: 'GL-ST-IDX-001' },
  { category: 'ETF/지수', title: 'S&P Dow Jones Indices', url: 'https://www.spglobal.com/spdji/en/', description: 'S&P·다우존스 지수', id: 'GL-ST-IDX-002' },
  { category: 'ETF/지수', title: 'FTSE Russell', url: 'https://www.ftserussell.com/', description: 'FTSE·러셀 지수', id: 'GL-ST-IDX-003' },

  /* ───────── 증권: 파생/원자재 ───────── */
  { category: '파생/원자재', title: 'CME Group', url: 'https://www.cmegroup.com/', description: '선물·옵션 거래소', id: 'GL-ST-DRV-001' },
  { category: '파생/원자재', title: 'ICE', url: 'https://www.theice.com/', description: '원자재·금리·지수', id: 'GL-ST-DRV-002' },
  { category: '파생/원자재', title: 'LME', url: 'https://www.lme.com/', description: '런던 금속 거래소', id: 'GL-ST-DRV-003' },

  /* ───────── 증권: 캘린더/실적 ───────── */
  { category: '캘린더/실적', title: 'Investing 경제지표 캘린더', url: 'https://www.investing.com/economic-calendar/', description: '지표 발표 일정', id: 'GL-ST-CAL-001' },
  { category: '캘린더/실적', title: 'Nasdaq Earnings', url: 'https://www.nasdaq.com/market-activity/earnings', description: '실적 발표 캘린더', id: 'GL-ST-CAL-002' },
];

export const categoryConfig: CategoryConfigMap = {
  '시세/차트': { title: '시세/차트', icon: '📈', iconClass: 'icon-green' },
  '뉴스/리서치': { title: '뉴스/리서치', icon: '📰', iconClass: 'icon-blue' },
  '공시/기업정보': { title: '공시/기업정보', icon: '🏢', iconClass: 'icon-purple' },
  '수급/통계': { title: '수급/통계', icon: '📊', iconClass: 'icon-yellow' },
  '지표/경제데이터': { title: '지표/경제데이터', icon: '💹', iconClass: 'icon-red' },
  'ETF/지수': { title: 'ETF/지수', icon: '🗂️', iconClass: 'icon-indigo' },
  '파생/원자재': { title: '파생/원자재', icon: '🛢️', iconClass: 'icon-orange' },
  '캘린더/실적': { title: '캘린더/실적', icon: '📅', iconClass: 'icon-teal' },
};

export const categoryOrder = [
  '시세/차트',
  '뉴스/리서치',
  '공시/기업정보',
  '수급/통계',
  '지표/경제데이터',
  'ETF/지수',
  '파생/원자재',
  '캘린더/실적',
];

