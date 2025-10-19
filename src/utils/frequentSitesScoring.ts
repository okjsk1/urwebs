// 자주 가는 사이트 추천 스코어링 시스템
export interface SiteVisit {
  id: string;
  url: string;
  domain: string;
  title: string;
  visitCount: number;
  lastVisit: string;
  favicon?: string;
  pinned: boolean;
  blocked: boolean;
  history: number[];
}

export interface ScoringConfig {
  wBase: number;        // 기본 방문 횟수 가중치
  w1d: number;          // 1일 내 방문 가중치
  w7d: number;          // 7일 내 방문 가중치
  wDecay: number;       // 시간 감쇠 가중치
  pin: number;          // 고정 가중치 (기존 1000 → 150)
  halfLifeDays: number; // 반감기 (일)
}

export const DEFAULT_SCORING: ScoringConfig = {
  wBase: 1,
  w1d: 3,
  w7d: 1,
  wDecay: 2,
  pin: 150, // 기존 1000에서 150으로 대폭 하향
  halfLifeDays: 30
};

// 스코어 계산 함수
export function calculateScore(
  site: SiteVisit, 
  now: number = Date.now(), 
  config: ScoringConfig = DEFAULT_SCORING
): number {
  const { wBase, w1d, w7d, wDecay, pin, halfLifeDays } = config;
  
  // 방문 이력 분석
  const history = site.history || [];
  const inHours = (hours: number) => 
    history.filter(timestamp => now - timestamp <= hours * 3600000).length;
  
  // 최근 방문 간격 (일)
  const lastGapDays = Math.max(0, (now - new Date(site.lastVisit).getTime()) / 86400000);
  
  // 지수 감쇠 (최근 방문일수록 높은 점수)
  const decay = Math.exp(-Math.LN2 * lastGapDays / halfLifeDays);
  
  // 스코어 계산
  const baseScore = site.visitCount * wBase;
  const recent1dScore = inHours(24) * w1d;
  const recent7dScore = (inHours(24 * 7) - inHours(24)) * w7d;
  const decayScore = decay * wDecay;
  const pinScore = site.pinned ? pin : 0;
  
  return baseScore + recent1dScore + recent7dScore + decayScore + pinScore;
}

// 스코어 기반 정렬
export function sortSitesByScore(
  sites: SiteVisit[], 
  config: ScoringConfig = DEFAULT_SCORING
): SiteVisit[] {
  const now = Date.now();
  return [...sites].sort((a, b) => {
    const scoreA = calculateScore(a, now, config);
    const scoreB = calculateScore(b, now, config);
    return scoreB - scoreA;
  });
}

// 스코어 파라미터 프리셋
export const SCORING_PRESETS = {
  balanced: DEFAULT_SCORING,
  recency: {
    wBase: 0.5,
    w1d: 5,
    w7d: 2,
    wDecay: 3,
    pin: 100,
    halfLifeDays: 14
  },
  frequency: {
    wBase: 2,
    w1d: 1,
    w7d: 0.5,
    wDecay: 1,
    pin: 200,
    halfLifeDays: 60
  },
  pinPriority: {
    wBase: 1,
    w1d: 2,
    w7d: 1,
    wDecay: 1,
    pin: 500, // 고정 우선
    halfLifeDays: 30
  }
};

// 스코어 파라미터 검증
export function validateScoringConfig(config: Partial<ScoringConfig>): ScoringConfig {
  return {
    wBase: Math.max(0, config.wBase ?? DEFAULT_SCORING.wBase),
    w1d: Math.max(0, config.w1d ?? DEFAULT_SCORING.w1d),
    w7d: Math.max(0, config.w7d ?? DEFAULT_SCORING.w7d),
    wDecay: Math.max(0, config.wDecay ?? DEFAULT_SCORING.wDecay),
    pin: Math.max(0, config.pin ?? DEFAULT_SCORING.pin),
    halfLifeDays: Math.max(1, config.halfLifeDays ?? DEFAULT_SCORING.halfLifeDays)
  };
}


