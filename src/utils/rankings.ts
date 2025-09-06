import { Website } from '../types';

// 인기 사이트: 클릭 수 기준 내림차순
export function getPopularSites(sites: Website[]): Website[] {
  return [...sites]
    .map(site => ({ site, score: site.clicks ?? Math.random() * 100 }))
    .sort((a, b) => b.score - a.score)
    .map(({ site }) => site);
}

// 급상승 사이트: 최근 추가량(addedAt) 기준
export function getTrendingSites(sites: Website[]): Website[] {
  return [...sites]
    .map(site => ({ site, score: site.addedAt ?? 0 }))
    .sort((a, b) => b.score - a.score)
    .map(({ site }) => site);
}

// 자주 담는 사이트: 즐겨찾기 수 기준
export function getFrequentlyBookmarkedSites(sites: Website[]): Website[] {
  return [...sites]
    .map(site => ({ site, score: site.favorites ?? Math.random() * 100 }))
    .sort((a, b) => b.score - a.score)
    .map(({ site }) => site);
}
