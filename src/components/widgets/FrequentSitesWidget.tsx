// 자주가는 사이트 위젯 - 개선된 추천 시스템, 보안, 성능
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '../ui/button';
import { TrendingUp, ExternalLink, BarChart3, Trash2, Plus, Pin, PinOff, EyeOff, Search, MoreVertical, Settings, Download, Upload, RotateCcw } from 'lucide-react';
import { WidgetProps, persistOrLocal, readLocal, showToast } from './utils/widget-helpers';
import { useDebouncedEffect } from '../../hooks/useDebouncedEffect';
import { 
  SiteVisit, 
  ScoringConfig, 
  DEFAULT_SCORING, 
  SCORING_PRESETS,
  calculateScore, 
  sortSitesByScore,
  validateScoringConfig 
} from '../../utils/frequentSitesScoring';
import { 
  safeNormalizeUrl, 
  extractDomain, 
  sanitizeTitle, 
  spreadHistoryDeterministic,
  isMigrationCompleted,
  markMigrationCompleted,
  generateFaviconUrl,
  getDomainInitial,
  formatRelativeTime,
  calculateStats,
  exportSitesData,
  importSitesData
} from '../../utils/frequentSitesUtils';

interface FrequentSitesState {
  sites: SiteVisit[];
  searchQuery: string;
  sortBy: 'recommended' | 'visitCount' | 'recent' | 'title';
  showPinnedOnly: boolean;
  showAddForm: boolean;
  newSite: { url: string; title: string };
  topN: number;
  scoringConfig: ScoringConfig;
  showSettings: boolean;
  showDataManagement: boolean;
}

// 마이그레이션: 구버전 데이터를 신버전으로 변환 (결정론적)
const migrateSite = (site: Partial<SiteVisit>): SiteVisit => {
  const now = Date.now();
  const lastVisitTime = site.lastVisit ? new Date(site.lastVisit).getTime() : now;
  const domain = site.domain || extractDomain(site.url || '');
  
  // 결정론적 히스토리 생성 (랜덤 대신)
  const history: number[] = [];
  if (site.visitCount && site.visitCount > 0) {
    history.push(...spreadHistoryDeterministic(site.visitCount, lastVisitTime, domain));
  }
  
  return {
    id: site.id || Date.now().toString(),
    url: site.url || '',
    domain,
    title: sanitizeTitle(site.title || '제목 없음'),
    visitCount: site.visitCount || 0,
    lastVisit: site.lastVisit || new Date().toISOString(),
    favicon: site.favicon || generateFaviconUrl(domain),
    pinned: site.pinned ?? false,
    blocked: site.blocked ?? false,
    history: history.slice(0, 100)
  };
};

const DEFAULT_SITES: SiteVisit[] = [];

// 사이트 정렬 (새로운 시스템)
const sortSites = (sites: SiteVisit[], sortBy: string, scoringConfig: ScoringConfig): SiteVisit[] => {
  return [...sites]
    .filter(s => !s.blocked)
    .sort((a, b) => {
      if (sortBy === 'recommended') {
        const scoreA = calculateScore(a, Date.now(), scoringConfig);
        const scoreB = calculateScore(b, Date.now(), scoringConfig);
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

export const FrequentSitesWidget = ({ widget, isEditMode, updateWidget }: WidgetProps) => {
  const [state, setState] = useState(() => {
    const saved = readLocal(widget.id, {
      sites: DEFAULT_SITES,
      searchQuery: '',
      sortBy: 'recommended' as const,
      showPinnedOnly: false,
      showAddForm: false,
      newSite: { url: '', title: '' },
      topN: 10,
      scoringConfig: DEFAULT_SCORING,
      showSettings: false,
      showDataManagement: false
    });
    
    // 마이그레이션: 구버전 사이트 데이터를 신버전으로 변환 (1회만 실행)
    let migratedSites = saved.sites || DEFAULT_SITES;
    
    if (!isMigrationCompleted()) {
      migratedSites = migratedSites.map(migrateSite);
      markMigrationCompleted();
    }
    
    // 중복 도메인 병합 (개선된 정책)
    const siteMap = new Map<string, SiteVisit>();
    migratedSites.forEach(site => {
      const existing = siteMap.get(site.domain);
      if (existing) {
        // 병합: 최근 방문 제목 우선
        const existingTime = new Date(existing.lastVisit).getTime();
        const siteTime = new Date(site.lastVisit).getTime();
        const isNewer = siteTime > existingTime;
        
        siteMap.set(site.domain, {
          ...existing,
          visitCount: existing.visitCount + site.visitCount,
          lastVisit: isNewer ? site.lastVisit : existing.lastVisit,
          title: isNewer ? site.title : existing.title,
          history: [...(existing.history || []), ...(site.history || [])]
            .sort((a, b) => b - a)
            .slice(0, 100),
          pinned: existing.pinned || site.pinned,
          blocked: existing.blocked || site.blocked
        });
      } else {
        siteMap.set(site.domain, site);
      }
    });
    
    const uniqueSites = Array.from(siteMap.values());
    const sorted = sortSites(uniqueSites, saved.sortBy || 'recommended', saved.scoringConfig || DEFAULT_SCORING);
    
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
      
      const sorted = sortSites(sites, prev.sortBy, prev.scoringConfig);
      
      return { ...prev, sites: sorted };
    });
  }, []);

  const togglePin = useCallback((siteId: string) => {
    setState(prev => ({
      ...prev,
      sites: sortSites(
        prev.sites.map(s => s.id === siteId ? { ...s, pinned: !s.pinned } : s),
        prev.sortBy,
        prev.scoringConfig
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
    
    // URL 검증 및 정규화
    const normalized = safeNormalizeUrl(url);
    if (!normalized) {
      showToast('올바른 URL을 입력하세요', 'error');
      return;
    }
    
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
      title: sanitizeTitle(title.trim() || domain),
      visitCount: 0,
      lastVisit: new Date().toISOString(),
      favicon: generateFaviconUrl(domain),
      pinned: false,
      blocked: false,
      history: []
    };
    
    setState(prev => ({
      ...prev,
      sites: sortSites([...prev.sites, newSite], prev.sortBy, prev.scoringConfig),
      showAddForm: false,
      newSite: { url: '', title: '' }
    }));
    
    showToast('사이트가 추가되었습니다', 'success');
  }, [state.newSite, state.sites, state.sortBy]);

  // 데이터 관리 함수들
  const exportData = useCallback(() => {
    try {
      const data = exportSitesData(state.sites);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `frequent-sites-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('데이터가 내보내기되었습니다', 'success');
    } catch (error) {
      showToast('내보내기 실패', 'error');
    }
  }, [state.sites]);

  const importData = useCallback((event: any) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result as string;
        const importedSites = importSitesData(data);
        
        setState(prev => ({
          ...prev,
          sites: [...prev.sites, ...importedSites],
          showDataManagement: false
        }));
        
        showToast(`${importedSites.length}개 사이트가 가져오기되었습니다`, 'success');
      } catch (error) {
        showToast('가져오기 실패: 잘못된 파일 형식', 'error');
      }
    };
    reader.readAsText(file);
  }, []);

  const clearAllData = useCallback(() => {
    if (window.confirm('모든 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      setState(prev => ({
        ...prev,
        sites: [],
        showDataManagement: false
      }));
      showToast('모든 데이터가 삭제되었습니다', 'success');
    }
  }, []);

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
    let filtered = sortSites(state.sites, state.sortBy, state.scoringConfig);
    
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

  // 통계 계산 (새로운 시스템)
  const stats = useMemo(() => {
    return calculateStats(state.sites);
  }, [state.sites]);

  return (
    <div className="p-2 h-full flex flex-col">
      {/* 편집 모드에서만 표시되는 헤더 */}
      {(isEditMode || filteredSites.length > 0) && (
        <div className="flex items-center justify-between mb-2 shrink-0">
          <div className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          {isEditMode && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setState(prev => ({ ...prev, showAddForm: !prev.showAddForm }))}
                className="p-1 hover:bg-gray-100 rounded"
                title="사이트 추가"
              >
                <Plus className="w-3 h-3 text-green-600" />
              </button>
              <button
                onClick={() => setState(prev => ({ ...prev, showSettings: !prev.showSettings }))}
                className="p-1 hover:bg-gray-100 rounded"
                title="설정"
              >
                <Settings className="w-3 h-3 text-blue-600" />
              </button>
              <button
                onClick={() => setState(prev => ({ ...prev, showDataManagement: !prev.showDataManagement }))}
                className="p-1 hover:bg-gray-100 rounded"
                title="데이터 관리"
              >
                <MoreVertical className="w-3 h-3 text-gray-600" />
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* 사이트 추가 폼 */}
      {state.showAddForm && (
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
              <a
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => visitSite(site.id)}
                className="w-full p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors flex items-center gap-2"
              >
                {/* 핀 아이콘 (고정된 사이트만) */}
                {site.pinned && (
                  <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                    <Pin className="w-3 h-3 text-blue-600 fill-blue-600" />
                  </div>
                )}
                
                {/* 파비콘 */}
                <div className="flex-shrink-0">
                  {site.favicon ? (
                    <img 
                      src={site.favicon} 
                      alt="" 
                      className="w-4 h-4"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const fallback = target.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className="w-4 h-4 bg-gray-300 rounded items-center justify-center text-xs font-bold text-gray-600"
                    style={{ display: site.favicon ? 'none' : 'flex' }}
                  >
                    {getDomainInitial(site.domain)}
                  </div>
                </div>
                
                {/* 사이트 정보 */}
                <div className="flex-1 text-left min-w-0">
                  <div className="text-xs font-medium text-gray-800 truncate">
                    {site.title}
                  </div>
                </div>
                
                {/* 외부 링크 아이콘 */}
                <ExternalLink className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              </a>
              
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

      {/* 설정 패널 */}
      {isEditMode && state.showSettings && (
        <div className="mt-3 p-3 bg-gray-50 rounded border">
          <h5 className="text-sm font-medium mb-2">추천 알고리즘 설정</h5>
          <div className="space-y-2">
            <div>
              <label className="text-xs text-gray-600">고정 가중치</label>
              <input
                type="range"
                min="0"
                max="500"
                value={state.scoringConfig.pin}
                onChange={(e) => setState(prev => ({
                  ...prev,
                  scoringConfig: { ...prev.scoringConfig, pin: parseInt(e.target.value) }
                }))}
                className="w-full"
              />
              <span className="text-xs text-gray-500">{state.scoringConfig.pin}</span>
            </div>
            <div>
              <label className="text-xs text-gray-600">최근성 가중치 (1일)</label>
              <input
                type="range"
                min="0"
                max="10"
                value={state.scoringConfig.w1d}
                onChange={(e) => setState(prev => ({
                  ...prev,
                  scoringConfig: { ...prev.scoringConfig, w1d: parseInt(e.target.value) }
                }))}
                className="w-full"
              />
              <span className="text-xs text-gray-500">{state.scoringConfig.w1d}</span>
            </div>
            <div className="flex gap-2">
              {Object.entries(SCORING_PRESETS).map(([key, preset]) => (
                <Button
                  key={key}
                  size="sm"
                  variant="outline"
                  className="text-xs"
                  onClick={() => setState(prev => ({ ...prev, scoringConfig: preset }))}
                >
                  {key === 'balanced' ? '균형' : 
                   key === 'recency' ? '최근성' : 
                   key === 'frequency' ? '빈도' : '고정우선'}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 데이터 관리 패널 */}
      {isEditMode && state.showDataManagement && (
        <div className="mt-3 p-3 bg-gray-50 rounded border">
          <h5 className="text-sm font-medium mb-2">데이터 관리</h5>
          <div className="space-y-2">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="text-xs"
                onClick={exportData}
              >
                <Download className="w-3 h-3 mr-1" />
                내보내기
              </Button>
              <label className="text-xs">
                <input
                  type="file"
                  accept=".json"
                  onChange={importData}
                  className="hidden"
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs"
                  asChild
                >
                  <span>
                    <Upload className="w-3 h-3 mr-1" />
                    가져오기
                  </span>
                </Button>
              </label>
              <Button
                size="sm"
                variant="outline"
                className="text-xs text-red-600"
                onClick={clearAllData}
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                전체 삭제
              </Button>
            </div>
            <div className="text-xs text-gray-500">
              데이터는 로컬에만 저장되며 외부로 전송되지 않습니다.
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

