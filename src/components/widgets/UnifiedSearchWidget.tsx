// 통합검색 위젯 V2 - 탭형 검색박스, 키보드 단축키, 자동완성, 엔진 재정렬
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ChevronDown, Search as SearchIcon, X, Pin, PinOff, ArrowUpDown, Settings } from 'lucide-react';
import { WidgetProps as HelperWidgetProps, persistOrLocal, readLocal } from './utils/widget-helpers';
import { WidgetShell, WidgetProps as ShellWidgetProps } from './WidgetShell';

// 엔진 인터페이스 확장
export interface SearchEngine {
  id: string;
  name: string;
  url: string;
  icon: string;
  color: string;
  buildUrl?: (q: string) => string; // 커스텀 URL 빌더
}

const SEARCH_ENGINES: SearchEngine[] = [
  { id: 'google', name: 'Google', url: 'https://www.google.com/search?q=', icon: 'G', color: '#4285F4' },
  { id: 'naver', name: 'Naver', url: 'https://search.naver.com/search.naver?query=', icon: 'N', color: '#03C75A' },
  { id: 'yahoo', name: 'Yahoo', url: 'https://search.yahoo.com/search?p=', icon: 'Y', color: '#720E9E' },
  { id: 'bing', name: 'Bing', url: 'https://www.bing.com/search?q=', icon: 'B', color: '#008373' },
  { id: 'daum', name: 'Daum', url: 'https://search.daum.net/search?q=', icon: 'D', color: '#FF5722' },
  { 
    id: 'law', 
    name: '법제처', 
    url: 'https://www.law.go.kr/LSW/lsInfoP.do?',
    icon: '법', 
    color: '#4A90E2',
    buildUrl: (q: string) => `https://www.law.go.kr/LSW/lsLinkProc.do?lsNm=${encodeURIComponent(q)}&efYd=${new Date().toISOString().split('T')[0].replace(/-/g, '')}`
  }
];

// 상태 인터페이스 V2
interface UnifiedSearchStateV2 {
  selectedEngine: string;
  searchQuery: string;
  recent: Record<string, string[]>; // 엔진별 최근 검색어
  order: string[];                  // 엔진 재정렬 순서
  pinned: string[];                 // 고정 엔진
  openInNewTab: boolean;            // 새 탭 열기 설정
}

const DEFAULT_STATE_V2: UnifiedSearchStateV2 = {
  selectedEngine: 'google',
  searchQuery: '',
  recent: {},
  order: SEARCH_ENGINES.map(e => e.id),
  pinned: [],
  openInNewTab: true
};

// 레거시 상태 마이그레이션
function migrateToV2(saved: any): UnifiedSearchStateV2 {
  if (saved && typeof saved === 'object') {
    return {
      selectedEngine: saved.selectedEngine || DEFAULT_STATE_V2.selectedEngine,
      searchQuery: saved.searchQuery || '',
      recent: saved.recent || {},
      order: saved.order || DEFAULT_STATE_V2.order,
      pinned: saved.pinned || [],
      openInNewTab: saved.openInNewTab !== undefined ? saved.openInNewTab : true
    };
  }
  return DEFAULT_STATE_V2;
}

// 서제스트 훅 - 로컬 기반, 외부 API 확장 가능
function useSuggestions(engineId: string, query: string, recentQueries: string[]) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const cacheRef = useRef<Record<string, { results: string[], timestamp: number }>>({});

  useEffect(() => {
    if (!query || query.length < 1) {
      setSuggestions([]);
      return;
    }

    const cacheKey = `${engineId}:${query}`;
    const cached = cacheRef.current[cacheKey];
    
    // 30초 캐시 체크
    if (cached && Date.now() - cached.timestamp < 30000) {
      setSuggestions(cached.results);
      return;
    }

    // 디바운스
    const timer = setTimeout(async () => {
      setLoading(true);
      
      try {
        // 🔌 기본 구현: 로컬 기반 추천
        const localSuggestions = recentQueries
          .filter(item => item.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 5);
        
        // TODO: 외부 API 통합 시 아래 주석 해제 및 API 함수 교체
        // const apiSuggestions = await getSuggestionsFromAPI(engineId, query);
        // setSuggestions([...localSuggestions, ...apiSuggestions].slice(0, 10));
        
        setSuggestions(localSuggestions);
        cacheRef.current[cacheKey] = { results: localSuggestions, timestamp: Date.now() };
      } catch (error) {
        console.warn('Suggestions fetch failed:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [engineId, query, recentQueries]);

  return { suggestions, loading };
}

// 외부 서제스트 API 인터페이스 (향후 확장용)
async function getSuggestionsFromAPI(engineId: string, q: string): Promise<string[]> {
  // TODO: Naver/Daum/Google 서제스트 API 연동
  // 예시:
  // if (engineId === 'naver') {
  //   const response = await fetch(`https://ac.search.naver.com/nx/ac?q=${encodeURIComponent(q)}`);
  //   const data = await response.json();
  //   return data.items?.[0]?.map((item: any[]) => item[0]) || [];
  // }
  return [];
}

interface UnifiedSearchWidgetProps extends HelperWidgetProps {
  size?: 's' | 'm' | 'l';
}

export const UnifiedSearchWidget = ({ widget, isEditMode, updateWidget, size = 'm' }: UnifiedSearchWidgetProps) => {
  const savedData = readLocal(widget.id, null);
  const [state, setState] = useState<UnifiedSearchStateV2>(() => migrateToV2(savedData));
  
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [draggedEngine, setDraggedEngine] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  // 엔진 순서 정규화
  const orderedEngines = useMemo(() => {
    const pinnedEngines = state.pinned.map(id => SEARCH_ENGINES.find(e => e.id === id)).filter(Boolean) as SearchEngine[];
    const unpinnedIds = state.order.filter(id => !state.pinned.includes(id));
    const unpinnedEngines = unpinnedIds.map(id => SEARCH_ENGINES.find(e => e.id === id)).filter(Boolean) as SearchEngine[];
    return [...pinnedEngines, ...unpinnedEngines];
  }, [state.order, state.pinned]);

  const selectedEngineData = useMemo(() => 
    SEARCH_ENGINES.find(e => e.id === state.selectedEngine) || SEARCH_ENGINES[0],
    [state.selectedEngine]
  );

  const recentQueries = useMemo(() => 
    state.recent[state.selectedEngine] || [],
    [state.recent, state.selectedEngine]
  );

  const { suggestions, loading: suggestionsLoading } = useSuggestions(state.selectedEngine, state.searchQuery, recentQueries);

  // URL 빌드
  const buildSearchUrl = useCallback((engine: SearchEngine, query: string): string => {
    if (engine.buildUrl) {
      return engine.buildUrl(query);
    }
    return engine.url + encodeURIComponent(query);
  }, []);

  // 검색 실행
  const handleSearch = useCallback((e?: React.FormEvent, inNewTab?: boolean) => {
    if (e) e.preventDefault();
    
    const query = state.searchQuery.trim();
    if (!query) return;

    // 최근 검색어 추가
    setState(prev => {
      const engineRecent = prev.recent[prev.selectedEngine] || [];
      const updatedRecent = [query, ...engineRecent.filter(q => q !== query)].slice(0, 10);
      return {
        ...prev,
        recent: { ...prev.recent, [prev.selectedEngine]: updatedRecent }
      };
    });

    const url = buildSearchUrl(selectedEngineData, query);
    const shouldOpenNewTab = inNewTab !== undefined ? inNewTab : state.openInNewTab;
    
    if (shouldOpenNewTab) {
      window.open(url, '_blank');
    } else {
      window.location.href = url;
    }

    setShowSuggestions(false);
    inputRef.current?.blur();
  }, [state.searchQuery, state.selectedEngine, state.openInNewTab, selectedEngineData, buildSearchUrl]);

  // 엔진 전환
  const selectEngine = useCallback((engineId: string) => {
    setState(prev => ({ ...prev, selectedEngine: engineId }));
    setShowSuggestions(false);
    inputRef.current?.focus();
  }, []);

  // 엔진 핀 토글
  const togglePin = useCallback((engineId: string) => {
    setState(prev => {
      const isPinned = prev.pinned.includes(engineId);
      const newPinned = isPinned
        ? prev.pinned.filter(id => id !== engineId)
        : prev.pinned.length < 5
          ? [...prev.pinned, engineId]
          : prev.pinned;
      return { ...prev, pinned: newPinned };
    });
  }, []);

  // 엔진 순서 변경
  const moveEngine = useCallback((engineId: string, targetIndex: number) => {
    setState(prev => {
      const currentIndex = prev.order.indexOf(engineId);
      if (currentIndex === -1) return prev;
      
      const newOrder = [...prev.order];
      newOrder.splice(currentIndex, 1);
      newOrder.splice(targetIndex, 0, engineId);
      
      return { ...prev, order: newOrder };
    });
  }, []);

  // 최근 검색어 삭제
  const removeRecentQuery = useCallback((query: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setState(prev => ({
      ...prev,
      recent: {
        ...prev.recent,
        [prev.selectedEngine]: prev.recent[prev.selectedEngine]?.filter(q => q !== query) || []
      }
    }));
  }, [state.selectedEngine]);

  // 최근 검색어 전체 삭제
  const clearRecentQueries = useCallback(() => {
    setState(prev => ({
      ...prev,
      recent: { ...prev.recent, [prev.selectedEngine]: [] }
    }));
  }, [state.selectedEngine]);

  // 키보드 단축키
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 입력창 포커스
      if (e.key === '/' && !(e.target instanceof HTMLInputElement)) {
        e.preventDefault();
        inputRef.current?.focus();
        return;
      }

      if (!inputRef.current?.matches(':focus-within') && e.target !== document.body) return;

      // Ctrl/Cmd + Arrow: 엔진 전환
      if ((e.ctrlKey || e.metaKey) && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        e.preventDefault();
        const currentIndex = orderedEngines.findIndex(e => e.id === state.selectedEngine);
        const direction = e.key === 'ArrowRight' ? 1 : -1;
        const newIndex = (currentIndex + direction + orderedEngines.length) % orderedEngines.length;
        selectEngine(orderedEngines[newIndex].id);
        return;
      }

      // Alt + 숫자: 엔진 직접 전환
      if (e.altKey && /^[1-9]$/.test(e.key)) {
        e.preventDefault();
        const index = parseInt(e.key) - 1;
        if (index < orderedEngines.length) {
          selectEngine(orderedEngines[index].id);
        }
        return;
      }

      // Escape: 서제스트 닫기 또는 입력 지우기
      if (e.key === 'Escape') {
        e.preventDefault();
        if (showSuggestions) {
          setShowSuggestions(false);
        } else if (state.searchQuery) {
          setState(prev => ({ ...prev, searchQuery: '' }));
        }
        return;
      }

      // Shift + Enter: 현재 탭에서 열기
      if (e.shiftKey && e.key === 'Enter') {
        e.preventDefault();
        handleSearch(undefined, false);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.selectedEngine, state.searchQuery, showSuggestions, orderedEngines, selectEngine, handleSearch]);

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 드래그앤드롭
  const handleDragStart = useCallback((engineId: string) => (e: React.DragEvent) => {
    isDragging.current = true;
    setDraggedEngine(engineId);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((index: number) => (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isDragging.current) {
      setDragOverIndex(index);
    }
  }, []);

  const handleDragEnd = useCallback(() => {
    if (draggedEngine && dragOverIndex !== null) {
      moveEngine(draggedEngine, dragOverIndex);
    }
    isDragging.current = false;
    setDraggedEngine(null);
    setDragOverIndex(null);
  }, [draggedEngine, dragOverIndex, moveEngine]);

  const handleDrop = useCallback((index: number) => (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverIndex(null);
  }, []);

  // 상태 저장
  useEffect(() => {
    persistOrLocal(widget.id, state, updateWidget);
  }, [widget.id, state, updateWidget]);

  // 컴팩트 모드
  const isCompact = size === 's';

  return (
    <WidgetShell
      variant="bare"
      icon={<SearchIcon className="w-4 h-4 text-gray-600" aria-hidden="true" />}
      title={widget.title || '통합검색'}
      size={size}
      contentClassName="w-full h-full flex flex-col min-h-0 p-0"
    >
      <div className={`${isCompact ? 'p-2' : 'p-3'} h-full flex flex-col min-h-0`}>
      {/* 탭 영역 */}
      <div className="mb-2">
        <div 
          role="tablist" 
          aria-label="검색 엔진 선택"
          className="flex gap-1 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
          style={{
            scrollbarWidth: 'thin',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {/* 페이드 힌트 */}
          <div className="absolute left-0 w-8 h-8 pointer-events-none bg-gradient-to-r from-white dark:from-gray-800 to-transparent opacity-80" />
          
          {orderedEngines.map((engine, index) => (
                      <button
                        key={engine.id}
              role="tab"
              aria-selected={state.selectedEngine === engine.id}
              aria-controls={`search-input-${engine.id}`}
              draggable
              onDragStart={handleDragStart(engine.id)}
              onDragOver={handleDragOver(index)}
              onDragEnd={handleDragEnd}
              onDrop={handleDrop(index)}
                        onClick={() => selectEngine(engine.id)}
              className={`
                flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap
                transition-all cursor-pointer relative
                ${state.selectedEngine === engine.id
                  ? 'text-gray-900 dark:text-gray-100 font-semibold'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }
                ${draggedEngine === engine.id ? 'opacity-50' : ''}
                ${dragOverIndex === index ? 'scale-105' : ''}
              `}
              style={{
                borderBottom: state.selectedEngine === engine.id 
                  ? `2px solid ${engine.color}` 
                  : '2px solid transparent'
              }}
            >
              <span style={{ color: state.selectedEngine === engine.id ? engine.color : undefined }}>
                          {engine.icon}
                        </span>
              <span className="hidden sm:inline">{engine.name}</span>
              {state.pinned.includes(engine.id) && (
                <Pin className="w-3 h-3 text-gray-400" />
              )}
                      </button>
                    ))}
                  </div>
            </div>

      {/* 검색 폼 */}
      <form onSubmit={(e) => handleSearch(e, undefined)} className="flex-1 flex flex-col">
        <div className="relative w-full">
          <div className="flex items-center bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-full shadow-sm hover:shadow-md transition-shadow focus-within:ring-2 focus-within:ring-blue-500">
            {/* 검색 아이콘 */}
            <SearchIcon className="w-4 h-4 text-gray-400 ml-3 flex-shrink-0" />
            
            {/* 입력 필드 */}
            <input
              ref={inputRef}
              id={`search-input-${selectedEngineData.id}`}
              type="text"
              value={state.searchQuery}
              onChange={(e) => setState(prev => ({ ...prev, searchQuery: e.target.value }))}
              onFocus={() => setShowSuggestions(true)}
              placeholder={`${selectedEngineData.name} 검색`}
              className="flex-1 px-2 py-2 text-sm border-none outline-none bg-transparent placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100"
              aria-label={`${selectedEngineData.name}에서 검색하기`}
            />
            {/* 스크린리더 안내 */}
            <span className="sr-only">
              ${selectedEngineData.name} 검색. 키보드 단축키: '/' 입력창 포커스, Ctrl+좌우 엔진 전환, Alt+숫자 즉시 전환
            </span>
            
            {/* 입력 지우기 */}
            {state.searchQuery && (
              <button
                type="button"
                onClick={() => setState(prev => ({ ...prev, searchQuery: '' }))}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full mr-1"
                aria-label="입력 지우기"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}

            {/* 설정 버튼 */}
            <button
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full mr-1 transition-colors"
              aria-label="설정"
            >
              <Settings className="w-3.5 h-3.5 text-gray-500" />
            </button>
            
            {/* 검색 버튼 */}
            <button
              type="submit"
              className="p-1.5 rounded-r-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="검색 실행"
            >
              <SearchIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* 서제스트 패널 */}
          {showSuggestions && (suggestions.length > 0 || recentQueries.length > 0) && (
            <div
              ref={suggestionsRef}
              className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-30 max-h-80 overflow-y-auto"
              role="listbox"
              aria-label="검색 제안"
            >
              {/* 최근 검색어 */}
              {recentQueries.length > 0 && (
                <div className="p-2">
                  <div className="flex items-center justify-between px-2 py-1 mb-1">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">최근 검색어</span>
                    <button
                      type="button"
                      onClick={clearRecentQueries}
                      className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      전체 삭제
                    </button>
                  </div>
                  {recentQueries.map(query => (
                    <button
                      key={query}
                      type="button"
                      onClick={() => {
                        setState(prev => ({ ...prev, searchQuery: query }));
                        handleSearch(undefined, state.openInNewTab);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded text-sm text-left"
                      role="option"
                    >
                      <span className="flex-1 truncate">{query}</span>
                      <button
                        type="button"
                        onClick={(e) => removeRecentQuery(query, e)}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                        aria-label="삭제"
                      >
                        <X className="w-3 h-3 text-gray-400" />
                      </button>
                    </button>
                  ))}
                </div>
              )}

              {/* 제안 */}
              {suggestions.length > 0 && (
                <div className="border-t border-gray-200 dark:border-gray-600 p-2">
                  <div className="px-2 py-1 mb-1">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">제안</span>
                  </div>
                  {suggestions.map(suggestion => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => {
                        setState(prev => ({ ...prev, searchQuery: suggestion }));
                        handleSearch(undefined, state.openInNewTab);
                      }}
                      className="w-full px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded text-sm text-left"
                      role="option"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}

              {suggestionsLoading && (
                <div className="p-3 text-center text-xs text-gray-400">제안 불러오는 중...</div>
              )}
            </div>
          )}
        </div>

        {/* 설정 패널 */}
        {showSettings && (
          <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg p-3 z-40">
            <div className="space-y-2">
              {/* 새 탭 열기 토글 */}
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={state.openInNewTab}
                  onChange={(e) => setState(prev => ({ ...prev, openInNewTab: e.target.checked }))}
                  className="rounded"
                />
                <span>새 탭에서 열기</span>
              </label>

              {/* 엔진 고정 */}
              <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">고정 엔진</div>
                <div className="space-y-1">
                  {SEARCH_ENGINES.map(engine => (
                    <label key={engine.id} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={state.pinned.includes(engine.id)}
                        onChange={() => togglePin(engine.id)}
                        disabled={!state.pinned.includes(engine.id) && state.pinned.length >= 5}
                        className="rounded"
                      />
                      <span className="flex-1">{engine.name}</span>
                      <span style={{ color: engine.color }}>{engine.icon}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 도움말 */}
        {!isCompact && (
          <div className="mt-2 text-xs text-gray-400 dark:text-gray-500 text-center">
            Ctrl+←/→ 엔진 전환 · Alt+1~9 직접 선택 · Shift+Enter 현재 탭
          </div>
        )}
      </form>
      </div>
    </WidgetShell>
  );
};
