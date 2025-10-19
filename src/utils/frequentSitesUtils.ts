// 자주 가는 사이트 유틸리티 함수들
import { SiteVisit } from './frequentSitesScoring';

// URL 정규화 및 검증
export function normalizeUrl(url: string): string {
  try {
    // 프로토콜이 없으면 https:// 추가
    if (!url.match(/^https?:\/\//)) {
      url = 'https://' + url;
    }
    
    const urlObj = new URL(url);
    
    // 지원되는 프로토콜만 허용
    if (urlObj.protocol !== 'https:' && urlObj.protocol !== 'http:') {
      throw new Error('Unsupported protocol');
    }
    
    // 기본 포트 제거
    if ((urlObj.protocol === 'https:' && urlObj.port === '443') ||
        (urlObj.protocol === 'http:' && urlObj.port === '80')) {
      urlObj.port = '';
    }
    
    return urlObj.toString();
  } catch (error) {
    throw new Error(`Invalid URL: ${url}`);
  }
}

// 안전한 URL 검증
export function safeNormalizeUrl(raw: string): string | null {
  try {
    return normalizeUrl(raw);
  } catch {
    return null;
  }
}

// 도메인 추출
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return '';
  }
}

// 타이틀 정화 (XSS 방지)
export function sanitizeTitle(title: string): string {
  // HTML 태그 제거 및 특수 문자 이스케이프
  return title
    .replace(/<[^>]*>/g, '') // HTML 태그 제거
    .replace(/[<>]/g, '') // 남은 꺾쇠 제거
    .trim()
    .substring(0, 100); // 길이 제한
}

// 결정론적 시드 생성
export function seedFrom(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 32bit 정수로 변환
  }
  return Math.abs(hash);
}

// 결정론적 히스토리 분산 (랜덤 대신)
export function spreadHistoryDeterministic(
  count: number, 
  lastTimestamp: number, 
  domain: string
): number[] {
  const seed = seedFrom(domain);
  const history: number[] = [];
  
  // 최대 100개까지만 생성
  const maxCount = Math.min(count, 100);
  
  for (let i = 0; i < maxCount; i++) {
    // 결정론적 오프셋 계산 (1~25시간 범위)
    const hourOffset = 1 + ((seed + i) % 24);
    const offset = (i + 1) * hourOffset * 3600000; // 밀리초
    history.push(lastTimestamp - offset);
  }
  
  return history.sort((a, b) => b - a); // 최신순 정렬
}

// 마이그레이션 플래그 관리
const MIGRATION_KEY = 'frequentSites_migration_v2';

export function isMigrationCompleted(): boolean {
  try {
    return localStorage.getItem(MIGRATION_KEY) === 'completed';
  } catch {
    return false;
  }
}

export function markMigrationCompleted(): void {
  try {
    localStorage.setItem(MIGRATION_KEY, 'completed');
  } catch {
    // localStorage 접근 실패 시 무시
  }
}

// 파비콘 URL 생성
export function generateFaviconUrl(domain: string): string {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
}

// 도메인 첫 글자 추출 (아바타용)
export function getDomainInitial(domain: string): string {
  const cleanDomain = domain.replace(/^www\./, '');
  return cleanDomain.charAt(0).toUpperCase();
}

// 상대 시간 포맷팅 (i18n 지원)
export function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 1) return '방금 전';
    if (diffMinutes < 60) return `${diffMinutes}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 전`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}개월 전`;
    return `${Math.floor(diffDays / 365)}년 전`;
  } catch {
    return '알 수 없음';
  }
}

// 통계 계산
export function calculateStats(sites: SiteVisit[]) {
  const now = Date.now();
  const visible = sites.filter(s => !s.blocked);
  
  const inRange = (history: number[], hours: number) =>
    history.filter(timestamp => now - timestamp <= hours * 3600000).length;
  
  return {
    total: visible.length,
    today: visible.reduce((sum, site) => 
      sum + inRange(site.history || [], 24), 0),
    week: visible.reduce((sum, site) => 
      sum + inRange(site.history || [], 24 * 7), 0),
    pinned: visible.filter(s => s.pinned).length
  };
}

// 데이터 내보내기
export function exportSitesData(sites: SiteVisit[]): string {
  const exportData = {
    version: '2.0',
    exportDate: new Date().toISOString(),
    sites: sites.map(site => ({
      url: site.url,
      title: site.title,
      visitCount: site.visitCount,
      lastVisit: site.lastVisit,
      pinned: site.pinned,
      blocked: site.blocked,
      // history는 개인정보이므로 제외
    }))
  };
  
  return JSON.stringify(exportData, null, 2);
}

// 데이터 가져오기
export function importSitesData(jsonData: string): Partial<SiteVisit>[] {
  try {
    const data = JSON.parse(jsonData);
    
    if (!data.sites || !Array.isArray(data.sites)) {
      throw new Error('Invalid data format');
    }
    
    return data.sites.map((item: any, index: number) => ({
      id: `imported_${Date.now()}_${index}`,
      url: item.url || '',
      domain: extractDomain(item.url || ''),
      title: sanitizeTitle(item.title || ''),
      visitCount: Math.max(0, item.visitCount || 0),
      lastVisit: item.lastVisit || new Date().toISOString(),
      favicon: generateFaviconUrl(extractDomain(item.url || '')),
      pinned: Boolean(item.pinned),
      blocked: Boolean(item.blocked),
      history: [] // 가져오기 시에는 빈 히스토리
    }));
  } catch (error) {
    throw new Error('Failed to parse import data');
  }
}


