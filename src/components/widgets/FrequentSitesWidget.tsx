// 자주가는 사이트 위젯 - 방문 횟수 기반 추천 (고도화)
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '../ui/button';
import { TrendingUp, ExternalLink, BarChart3, Trash2, Plus, Pin, PinOff, EyeOff, Search, MoreVertical } from 'lucide-react';
import { WidgetProps, persistOrLocal, readLocal, getFaviconUrl, normalizeUrl, showToast } from './utils/widget-helpers';
import { useDebouncedEffect } from '../../hooks/useDebouncedEffect';

interface SiteVisit {
  id: string;
  url: string;
  domain: string;          // 정규화된 도메인 (예: youtube.com)
  title: string;
  visitCount: number;
  lastVisit: string;       // ISO 형식
  favicon?: string;
  pinned?: boolean;        // 고정
  blocked?: boolean;       // 숨김
  history?: number[];      // 방문 타임스탬프 배열 (최근 100개)
}

interface FrequentSitesState {
  sites: SiteVisit[];
  showStats: boolean;
  searchQuery: string;
  sortBy: 'recommended' | 'visitCount' | 'recent' | 'title';
  showPinnedOnly: boolean;
  showAddForm: boolean;
  newSite: { url: string; title: string };
  topN: number; // 표시할 상위 개수
}

// 도메인 추출 헬퍼
const extractDomain = (url: string): string => {
  try {
    const normalized = normalizeUrl(url);
    const urlObj = new URL(normalized);
    return urlObj.hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
};

// 마이그레이션: 구버전 데이터를 신버전으로 변환
const migrateSite = (site: Partial<SiteVisit>): SiteVisit => {
  const now = Date.now();
  const lastVisitTime = site.lastVisit ? new Date(site.lastVisit).getTime() : now;
  
  // history 생성: visitCount를 과거에 분산
  const history: number[] = [];
  if (site.visitCount && site.visitCount > 0) {
    for (let i = 0; i < Math.min(site.visitCount, 100); i++) {
      // 과거로 거슬러 올라가며 방문 기록 생성 (임의 분산)
      const timeOffset = i * 3600000 * (1 + Math.random() * 24); // 1-25시간씩 분산
      history.push(lastVisitTime - timeOffset);
    }
  }
  
  return {
    id: site.id || Date.now().toString(),
    url: site.url || '',
    domain: site.domain || extractDomain(site.url || ''),
    title: site.title || '제목 없음',
    visitCount: site.visitCount || 0,
    lastVisit: site.lastVisit || new Date().toISOString(),
    favicon: site.favicon,
    pinned: site.pinned ?? false,
    blocked: site.blocked ?? false,
    history: history.sort((a, b) => b - a).slice(0, 100)
  };
};

const DEFAULT_SITES: SiteVisit[] = [];

// 스코어 계산 (최근성 가중치)
const calculateScore = (site: SiteVisit, now: number = Date.now()): number => {
  const hist = site.history ?? [];
  const inHours = (hours: number) => hist.filter(t => now - t <= hours * 3600000).length;
  
  const recent1d = inHours(24);
  const recent7d = inHours(24 * 7) - recent1d;
  const lastGapDays = (now - new Date(site.lastVisit).getTime()) / 86400000;
  
  const base = site.visitCount;
  const recency = recent1d * 3 + recent7d * 1 + Math.exp(-Math.max(0, lastGapDays) / 30) * 2;
  const pin = site.pinned ? 1000 : 0;
  
  return base + recency + pin;
};

// 사이트 정렬
const sortSites = (sites: SiteVisit[], sortBy: string): SiteVisit[] => {
  const now = Date.now();
  return [...sites]
    .filter(s => !s.blocked)
    .sort((a, b) => {
      if (sortBy === 'recommended') {
        const scoreA = calculateScore(a, now);
        const scoreB = calculateScore(b, now);
        if (scoreB !== scoreA) return scoreB - scoreA;
        return new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime();
      } else if (sortBy === 'visitCount') {
        return b.visitCount - a.visitCount;
      } else if (sortBy === 'recent') {
        return new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime();
      } else if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });
};

export const FrequentSitesWidget: React.FC<WidgetProps> = ({ widget, isEditMode, updateWidget }) => {
  const [state, setState] = useState<FrequentSitesState>(() => {
    const saved = readLocal(widget.id, {
      sites: DEFAULT_SITES,
      showStats: false,
      searchQuery: '',
      sortBy: 'recommended' as const,
      showPinnedOnly: false,
      showAddForm: false,
      newSite: { url: '', title: '' },
      topN: 8
    });
    
    // 마이그레이션: 구버전 사이트 데이터를 신버전으로 변환
    const migratedSites = (saved.sites || DEFAULT_SITES).map(migrateSite);
    
    // 중복 도메인 병합
    const siteMap = new Map<string, SiteVisit>();
    migratedSites.forEach(site => {
      const existing = siteMap.get(site.domain);
      if (existing) {
        // 병합
        siteMap.set(site.domain, {
          ...existing,
          visitCount: existing.visitCount + site.visitCount,
          lastVisit: new Date(Math.max(
            new Date(existing.lastVisit).getTime(),
            new Date(site.lastVisit).getTime()
          )).toISOString(),
          history: [...(existing.history || []), ...(site.history || [])]
            .sort((a, b) => b - a)
            .slice(0, 100),
          title: existing.title.length >= site.title.length ? existing.title : site.title
        });
      } else {
        siteMap.set(site.domain, site);
      }
    });
    
    const uniqueSites = Array.from(siteMap.values());
    const sorted = sortSites(uniqueSites, saved.sortBy || 'recommended');
    
    return {
      ...saved,
      sites: sorted
    };
  });

  // 상태 저장 (디바운스)
  useDebouncedEffect(() => {
    persistOrLocal(widget.id, state, updateWidget);
  }, [widget.id, state], 300);

  const visitSite = useCallback((siteId: string) => {
    setState(prev => {
      const now = Date.now();
      const sites = prev.sites.map(s => {
        if (s.id === siteId) {
          return {
            ...s,
            visitCount: s.visitCount + 1,
            lastVisit: new Date(now).toISOString(),
            history: [now, ...(s.history || [])].slice(0, 100) // 최근 100개만 유지
          };
        }
        return s;
      });
      
      const sorted = sortSites(sites, prev.sortBy);
      
      // 사이트 열기
      const target = sites.find(s => s.id === siteId);
      if (target) {
        setTimeout(() => window.open(target.url, '_blank', 'noopener,noreferrer'), 0);
      }
      
      return { ...prev, sites: sorted };
    });
  }, []);

  const togglePin = useCallback((siteId: string) => {
    setState(prev => ({
      ...prev,
      sites: sortSites(
        prev.sites.map(s => s.id === siteId ? { ...s, pinned: !s.pinned } : s),
        prev.sortBy
      )
    }));
  }, []);

  const toggleBlock = useCallback((siteId: string) => {
    setState(prev => ({
      ...prev,
      sites: prev.sites.map(s => s.id === siteId ? { ...s, blocked: !s.blocked } : s)
    }));
    showToast('사이트가 숨김 처리되었습니다', 'success');
  }, []);

  const resetVisitCount = useCallback((siteId: string) => {
    setState(prev => ({
      ...prev,
      sites: prev.sites.map(s => 
        s.id === siteId ? { ...s, visitCount: 0, history: [] } : s
      )
    }));
    showToast('방문 기록이 초기화되었습니다', 'success');
  }, []);

  const deleteSite = useCallback((siteId: string) => {
    setState(prev => ({
      ...prev,
      sites: prev.sites.filter(s => s.id !== siteId)
    }));
    showToast('사이트가 삭제되었습니다', 'success');
  }, []);

  const addSite = useCallback(() => {
    const { url, title } = state.newSite;
    
    if (!url.trim()) {
      showToast('URL을 입력하세요', 'error');
      return;
    }
    
    const normalized = normalizeUrl(url);
    const domain = extractDomain(normalized);
    
    // 중복 체크
    if (state.sites.some(s => s.domain === domain)) {
      showToast('이미 추가된 사이트입니다', 'error');
      return;
    }
    
    const newSite: SiteVisit = {
      id: Date.now().toString(),
      url: normalized,
      domain,
      title: title.trim() || domain,
      visitCount: 0,
      lastVisit: new Date().toISOString(),
      favicon: getFaviconUrl(normalized),
      pinned: false,
      blocked: false,
      history: []
    };
    
    setState(prev => ({
      ...prev,
      sites: sortSites([...prev.sites, newSite], prev.sortBy),
      showAddForm: false,
      newSite: { url: '', title: '' }
    }));
    
    showToast('사이트가 추가되었습니다', 'success');
  }, [state.newSite, state.sites, state.sortBy]);

  const getTimeSince = useCallback((dateString: string) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}일 전`;
    if (hours > 0) return `${hours}시간 전`;
    return '방금';
  }, []);

  // 필터링 및 정렬된 사이트
  const filteredSites = useMemo(() => {
    let filtered = sortSites(state.sites, state.sortBy);
    
    // 검색 필터
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      filtered = filtered.filter(s => 
        s.title.toLowerCase().includes(query) ||
        s.domain.toLowerCase().includes(query)
      );
    }
    
    // 고정만 보기
    if (state.showPinnedOnly) {
      filtered = filtered.filter(s => s.pinned);
    }
    
    return filtered.slice(0, state.topN);
  }, [state.sites, state.sortBy, state.searchQuery, state.showPinnedOnly, state.topN]);

  // 통계 계산
  const stats = useMemo(() => {
    const now = Date.now();
    const todayVisits = state.sites.reduce((sum, s) => {
      const todayCount = (s.history || []).filter(t => now - t <= 24 * 3600000).length;
      return sum + todayCount;
    }, 0);
    
    const weekVisits = state.sites.reduce((sum, s) => {
      const weekCount = (s.history || []).filter(t => now - t <= 7 * 24 * 3600000).length;
      return sum + weekCount;
    }, 0);
    
    return {
      total: state.sites.filter(s => !s.blocked).length,
      today: todayVisits,
      week: weekVisits
    };
  }, [state.sites]);

  return (
    <div className="p-2 h-full flex flex-col">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-2 shrink-0">
        <div className="flex items-center gap-1">
          <TrendingUp className="w-4 h-4 text-blue-600" />
          <h4 className="font-semibold text-sm text-gray-800">자주가는 사이트</h4>
        </div>
        <div className="flex items-center gap-1">
          {isEditMode && (
            <button
              onClick={() => setState(prev => ({ ...prev, showAddForm: !prev.showAddForm }))}
              className="p-1 hover:bg-gray-100 rounded"
              title="사이트 추가"
            >
              <Plus className="w-3 h-3 text-green-600" />
            </button>
          )}
          <button
            onClick={() => setState(prev => ({ ...prev, showStats: !prev.showStats }))}
            className="p-1 hover:bg-gray-100 rounded"
            title="통계 보기"
          >
            <BarChart3 className="w-3 h-3 text-gray-600" />
          </button>
        </div>
      </div>
      
      {/* 요약 통계 */}
      {!state.showStats && (
        <div className="grid grid-cols-3 gap-1 mb-2 shrink-0">
          <div className="bg-blue-50 rounded p-1 text-center">
            <div className="text-xs text-blue-600 font-bold">{stats.total}</div>
            <div className="text-xs text-gray-500">총</div>
          </div>
          <div className="bg-green-50 rounded p-1 text-center">
            <div className="text-xs text-green-600 font-bold">{stats.today}</div>
            <div className="text-xs text-gray-500">오늘</div>
          </div>
          <div className="bg-purple-50 rounded p-1 text-center">
            <div className="text-xs text-purple-600 font-bold">{stats.week}</div>
            <div className="text-xs text-gray-500">7일</div>
          </div>
        </div>
      )}
      
      {/* 사이트 추가 폼 */}
      {isEditMode && state.showAddForm && (
        <div className="bg-gray-50 rounded p-2 mb-2 space-y-1 shrink-0">
          <input
            type="url"
            value={state.newSite.url}
            onChange={(e) => setState(prev => ({
              ...prev,
              newSite: { ...prev.newSite, url: e.target.value }
            }))}
            placeholder="https://example.com"
            className="w-full text-xs px-2 py-1 border border-gray-300 rounded"
          />
          <input
            type="text"
            value={state.newSite.title}
            onChange={(e) => setState(prev => ({
              ...prev,
              newSite: { ...prev.newSite, title: e.target.value }
            }))}
            placeholder="사이트 제목 (선택)"
            className="w-full text-xs px-2 py-1 border border-gray-300 rounded"
          />
          <div className="flex gap-1">
            <Button size="sm" className="flex-1 h-6 text-xs" onClick={addSite}>
              추가
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="flex-1 h-6 text-xs" 
              onClick={() => setState(prev => ({
                ...prev,
                showAddForm: false,
                newSite: { url: '', title: '' }
              }))}
            >
              취소
            </Button>
          </div>
        </div>
      )}

      {/* 통계/목록 뷰 */}
      <div className="flex-1 overflow-y-auto space-y-1">
        {filteredSites.length === 0 ? (
          <div className="text-center text-gray-500 text-xs py-4">
            사이트가 없습니다
          </div>
        ) : (
          filteredSites.map((site, index) => (
            <div key={site.id} className="relative group">
              <button
                onClick={() => visitSite(site.id)}
                className="w-full p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors flex items-center gap-2"
              >
                {/* 핀 아이콘 또는 순위 */}
                <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                  {site.pinned ? (
                    <Pin className="w-3 h-3 text-blue-600 fill-blue-600" />
                  ) : (
                    <span className="text-xs font-bold text-gray-600">{index + 1}</span>
                  )}
                </div>
                
                {/* 파비콘 */}
                <div className="flex-shrink-0">
                  {site.favicon ? (
                    <img 
                      src={site.favicon} 
                      alt="" 
                      className="w-4 h-4"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-4 h-4 bg-gray-300 rounded"></div>
                  )}
                </div>
                
                {/* 사이트 정보 */}
                <div className="flex-1 text-left min-w-0">
                  <div className="text-xs font-medium text-gray-800 truncate">
                    {site.title}
                  </div>
                  <div className="text-xs text-gray-500">
                    {state.showStats ? `${site.visitCount}회` : getTimeSince(site.lastVisit)}
                  </div>
                </div>
                
                {/* 외부 링크 아이콘 */}
                <ExternalLink className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              </button>
              
              {/* 편집 메뉴 */}
              {isEditMode && (
                <div className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-0.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePin(site.id);
                    }}
                    className={`p-0.5 rounded ${site.pinned ? 'bg-blue-100' : 'bg-gray-200 hover:bg-gray-300'}`}
                    title={site.pinned ? '고정 해제' : '고정'}
                  >
                    {site.pinned ? (
                      <PinOff className="w-3 h-3 text-blue-600" />
                    ) : (
                      <Pin className="w-3 h-3 text-gray-600" />
                    )}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleBlock(site.id);
                    }}
                    className="p-0.5 bg-gray-200 hover:bg-gray-300 rounded"
                    title="숨김"
                  >
                    <EyeOff className="w-3 h-3 text-gray-600" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSite(site.id);
                    }}
                    className="p-0.5 bg-red-100 hover:bg-red-200 rounded"
                    title="삭제"
                  >
                    <Trash2 className="w-3 h-3 text-red-600" />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* 하단 정보 */}
      <div className="text-xs text-gray-500 text-center mt-2 pt-2 border-t border-gray-200 shrink-0">
        {state.sortBy === 'recommended' ? '추천 순위' : 
         state.sortBy === 'visitCount' ? '방문 횟수' :
         state.sortBy === 'recent' ? '최근 방문' : '가나다 순'} • 상위 {state.topN}개
      </div>
    </div>
  );
};

