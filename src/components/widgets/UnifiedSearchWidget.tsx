// 통합검색 위젯 V2 - 탭형 검색박스, 키보드 단축키, 자동완성, 엔진 재정렬
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Search as SearchIcon,
  X,
  Pin,
  Settings,
  Plus,
  PenSquare,
  Trash2
} from 'lucide-react';
import { WidgetProps as HelperWidgetProps, persistOrLocal, readLocal, showToast } from './utils/widget-helpers';
import { WidgetShell, WidgetProps as ShellWidgetProps } from './WidgetShell';

// 엔진 인터페이스 확장
export interface SearchEngine {
  id: string;
  name: string;
  url?: string;
  icon?: string;
  color?: string;
  iconUrl?: string;
  type?: 'plain' | 'builder';
  buildUrlTemplate?: string;
  buildUrl?: (q: string, engine: SearchEngine) => string;
  placeholder?: string;
  meta?: Record<string, any>;
  _userDefined?: boolean;
}

type EngineDictionary = Record<string, Omit<SearchEngine, 'buildUrl'>>;

const BUILTIN_ENGINES: Omit<SearchEngine, 'buildUrl'>[] = [
  { id: 'google', name: 'Google', url: 'https://www.google.com/search?q=', icon: 'G', color: '#4285F4', placeholder: 'Google 검색' },
  { id: 'naver', name: 'Naver', url: 'https://search.naver.com/search.naver?query=', icon: 'N', color: '#03C75A', placeholder: '네이버 검색' },
  { id: 'daum', name: 'Daum', url: 'https://search.daum.net/search?q=', icon: 'D', color: '#FF5722', placeholder: '다음 검색' },
  { id: 'youtube', name: 'YouTube', url: 'https://www.youtube.com/results?search_query=', icon: 'YT', color: '#FF0000', placeholder: 'YouTube 검색' }
];

function createEngineDictionary(engines: Omit<SearchEngine, 'buildUrl'>[]): EngineDictionary {
  return engines.reduce((acc, engine) => {
    acc[engine.id] = { ...engine };
    return acc;
  }, {} as EngineDictionary);
}

const BUILTIN_ENGINE_MAP = createEngineDictionary(BUILTIN_ENGINES);

// 상태 인터페이스 V2
interface UnifiedSearchStateV2 {
  selectedEngine: string;
  searchQuery: string;
  recent: Record<string, string[]>; // 엔진별 최근 검색어
  order: string[];                  // 엔진 재정렬 순서
  pinned: string[];                 // 고정 엔진
  openInNewTab: boolean;            // 새 탭 열기 설정
  searchCounts?: Record<string, number>; // 인기 검색 집계 (엔진별 합산)
}

const DEFAULT_STATE_V2: UnifiedSearchStateV2 = {
  selectedEngine: 'google',
  searchQuery: '',
  recent: {},
  order: Object.keys(BUILTIN_ENGINE_MAP),
  pinned: [],
  openInNewTab: true,
  searchCounts: {}
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
      openInNewTab: saved.openInNewTab !== undefined ? saved.openInNewTab : true,
      searchCounts: saved.searchCounts || {}
    };
  }
  return DEFAULT_STATE_V2;
}

interface UnifiedSearchStateV3 extends Omit<UnifiedSearchStateV2, 'order'> {
  engines: EngineDictionary;
  customOrder: string[];
}

const DEFAULT_STATE_V3: UnifiedSearchStateV3 = {
  selectedEngine: 'google',
  searchQuery: '',
  recent: {},
  pinned: [],
  openInNewTab: true,
  searchCounts: {},
  engines: createEngineDictionary(BUILTIN_ENGINES),
  customOrder: Object.keys(BUILTIN_ENGINE_MAP)
};

const DEFAULT_ENGINE_COLOR = '#2563eb';

function hexToRgba(hex: string, alpha: number): string {
  const normalized = hex.replace('#', '');
  const bigint = parseInt(normalized.length === 3
    ? normalized.split('').map((char) => char + char).join('')
    : normalized, 16);
  // eslint-disable-next-line no-bitwise
  const r = (bigint >> 16) & 255;
  // eslint-disable-next-line no-bitwise
  const g = (bigint >> 8) & 255;
  // eslint-disable-next-line no-bitwise
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function isValidHttpUrl(url: string) {
  return /^https?:\/\//i.test(url.trim());
}

function resolveEngine(engine: Omit<SearchEngine, 'buildUrl'>): SearchEngine {
  const color = engine.color || DEFAULT_ENGINE_COLOR;
  const base: SearchEngine = {
    ...engine,
    color
  };

  if (base.type === 'builder') {
    if (base.id === 'opgg') {
      base.buildUrl = (q: string) => {
        const mode = base.meta?.mode === 'champion' ? 'champion' : 'summoner';
        if (mode === 'champion') {
          return `https://www.op.gg/champions?query=${encodeURIComponent(q)}`;
        }
        return `https://www.op.gg/summoners/kr/${encodeURIComponent(q)}`;
      };
    } else if (base.buildUrlTemplate) {
      base.buildUrl = (q: string) => base.buildUrlTemplate!.replace('{q}', encodeURIComponent(q));
    }
  }

  if (!base.icon && base.name) {
    base.icon = base.name.slice(0, 2);
  }

  return base;
}

function migrateToV3(saved: any): UnifiedSearchStateV3 {
  const legacy = migrateToV2(saved);
  const persistedEngines = saved?.engines && typeof saved.engines === 'object' ? saved.engines as EngineDictionary : undefined;
  const mergedEngines: EngineDictionary = createEngineDictionary(BUILTIN_ENGINES);

  if (persistedEngines) {
    Object.entries(persistedEngines).forEach(([id, engine]) => {
      if (!engine || typeof engine !== 'object') return;
      const isUserDefined = Boolean((engine as SearchEngine)._userDefined);
      const isBuiltin = Boolean(BUILTIN_ENGINE_MAP[id]);
      if (isUserDefined || !isBuiltin) {
        mergedEngines[id] = { ...engine };
      }
    });
  }

  const existingIds = Object.keys(mergedEngines);
  const orderSource: string[] = Array.isArray(saved?.customOrder)
    ? saved.customOrder
    : Array.isArray(legacy.order)
      ? legacy.order
      : DEFAULT_STATE_V3.customOrder;

  const sanitizedOrder = [
    ...new Set(orderSource.filter((id) => existingIds.includes(id)))
  ];

  const filledOrder = sanitizedOrder.length > 0 ? [...sanitizedOrder] : [];
  existingIds.forEach((id) => {
    if (!filledOrder.includes(id)) {
      filledOrder.push(id);
    }
  });

  const pinned = (legacy.pinned || []).filter((id) => existingIds.includes(id));
  const selectedEngine = existingIds.includes(legacy.selectedEngine) ? legacy.selectedEngine : (filledOrder[0] || existingIds[0] || 'google');

  return {
    selectedEngine,
    searchQuery: legacy.searchQuery,
    recent: legacy.recent,
    pinned,
    openInNewTab: legacy.openInNewTab,
    searchCounts: legacy.searchCounts,
    engines: mergedEngines,
    customOrder: filledOrder
  };
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
  const [state, setState] = useState<UnifiedSearchStateV3>(() => migrateToV3(savedData));
  
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [draggedEngine, setDraggedEngine] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [inputError, setInputError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1); // 방향키로 선택된 항목 인덱스
  const [engineModal, setEngineModal] = useState<{ mode: 'create' | 'edit'; engineId?: string } | null>(null);
  const [engineForm, setEngineForm] = useState<Partial<Omit<SearchEngine, 'buildUrl'>>>({
    id: '',
    name: '',
    type: 'plain',
    url: 'https://',
    color: DEFAULT_ENGINE_COLOR,
    _userDefined: true
  });
  const [engineFormErrors, setEngineFormErrors] = useState<Record<string, string>>({});
  
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const suggestionItemsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const resolvedEnginesMap = useMemo(() => {
    const engines: Record<string, SearchEngine> = {};
    Object.entries(state.engines || {}).forEach(([id, engine]) => {
      engines[id] = resolveEngine(engine);
    });
    return engines;
  }, [state.engines]);

  const availableEngineIds = useMemo(() => Object.keys(resolvedEnginesMap), [resolvedEnginesMap]);

  const orderedEngines = useMemo(() => {
    const pinnedIds = state.pinned.filter((id) => resolvedEnginesMap[id]);
    const baseOrder = (state.customOrder || []).filter((id) => resolvedEnginesMap[id]);
    const remaining = baseOrder.filter((id) => !pinnedIds.includes(id));

    availableEngineIds.forEach((id) => {
      if (!pinnedIds.includes(id) && !remaining.includes(id)) {
        remaining.push(id);
      }
    });

    const orderedIds = [...pinnedIds, ...remaining];
    return orderedIds.map((id) => resolvedEnginesMap[id]).filter(Boolean);
  }, [availableEngineIds, resolvedEnginesMap, state.customOrder, state.pinned]);

  const selectedEngineData = useMemo(() => {
    const current = resolvedEnginesMap[state.selectedEngine];
    if (current) return current;
    return orderedEngines[0] || resolveEngine(BUILTIN_ENGINE_MAP['google']);
  }, [resolvedEnginesMap, state.selectedEngine, orderedEngines]);

  useEffect(() => {
    if (!resolvedEnginesMap[state.selectedEngine] && orderedEngines.length > 0) {
      const fallback = orderedEngines[0].id;
      setState((prev) => {
        if (prev.selectedEngine === fallback) return prev;
        return { ...prev, selectedEngine: fallback };
      });
    }
  }, [orderedEngines, resolvedEnginesMap, state.selectedEngine]);

  const recentQueries = useMemo(() => 
    state.recent[state.selectedEngine] || [],
    [state.recent, state.selectedEngine]
  );

  const { suggestions, loading: suggestionsLoading } = useSuggestions(state.selectedEngine, state.searchQuery, recentQueries);

  // 서제스트 항목 목록 생성 (최근 검색어 + 인기 검색어 + 제안)
  const suggestionItems = useMemo(() => {
    const items: Array<{ type: 'recent' | 'popular' | 'suggestion'; query: string }> = [];
    
    // 최근 검색어
    recentQueries.forEach(query => {
      items.push({ type: 'recent', query });
    });
    
    // 인기 검색어
    if (state.searchCounts) {
      Object.entries(state.searchCounts)
        .filter(([key]) => key.startsWith(`${state.selectedEngine}::`))
        .sort((a, b) => (b[1] as number) - (a[1] as number))
        .slice(0, 5)
        .forEach(([key]) => {
          const q = key.split('::')[1];
          items.push({ type: 'popular', query: q });
        });
    }
    
    // 제안
    suggestions.forEach(suggestion => {
      items.push({ type: 'suggestion', query: suggestion });
    });
    
    return items;
  }, [recentQueries, state.searchCounts, state.selectedEngine, suggestions]);

  // URL 빌드
  const buildSearchUrl = useCallback((engine: SearchEngine, query: string): string => {
    if (engine.type === 'builder') {
      if (engine.buildUrl) {
        return engine.buildUrl(query, engine);
      }
      if (engine.buildUrlTemplate) {
        return engine.buildUrlTemplate.replace('{q}', encodeURIComponent(query));
      }
    }

    if (engine.buildUrl) {
      return engine.buildUrl(query, engine);
    }

    if (engine.url) {
      return `${engine.url}${encodeURIComponent(query)}`;
    }

    if (engine.buildUrlTemplate) {
      return engine.buildUrlTemplate.replace('{q}', encodeURIComponent(query));
    }

    // fallback to Google search in case of invalid configuration
    return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
  }, []);

  const closeEngineModal = useCallback(() => {
    setEngineModal(null);
    setEngineFormErrors({});
  }, []);

  const openCreateEngine = useCallback(() => {
    setEngineModal({ mode: 'create' });
    setEngineForm({
      id: '',
      name: '',
      type: 'plain',
      url: 'https://',
      icon: '',
      color: DEFAULT_ENGINE_COLOR,
      iconUrl: '',
      placeholder: '',
      buildUrlTemplate: 'https://example.com/search?q={q}',
      _userDefined: true
    });
    setEngineFormErrors({});
  }, []);

  const openEditEngine = useCallback((engineId: string) => {
    const engine = state.engines[engineId];
    if (!engine) return;
    setEngineModal({ mode: 'edit', engineId });
    setEngineForm({
      ...engine,
      meta: engine.meta ? { ...engine.meta } : undefined
    });
    setEngineFormErrors({});
  }, [state.engines]);

  const handleEngineFormChange = useCallback((key: keyof Omit<SearchEngine, 'buildUrl'>, value: any) => {
    setEngineForm(prev => ({
      ...prev,
      [key]: value
    }));
    setEngineFormErrors(prev => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key as string];
      return next;
    });
  }, []);

  const handleEngineMetaChange = useCallback((key: string, value: any) => {
    setEngineForm(prev => ({
      ...prev,
      meta: {
        ...(prev.meta || {}),
        [key]: value
      }
    }));
  }, []);

  const handleEngineSave = useCallback(() => {
    if (!engineModal) return;
    setEngineFormErrors({});
    const errors: Record<string, string> = {};
    const name = engineForm.name?.trim() || '';
    const id = (engineModal.mode === 'create' ? engineForm.id : engineModal.engineId) ?? engineForm.id ?? '';
    const trimmedId = (id || '').trim();
    const type = engineForm.type || 'plain';

    if (!name) {
      errors.name = '이름을 입력하세요.';
    }

    if (engineModal.mode === 'create') {
      if (!trimmedId) {
        errors.id = 'ID를 입력하세요.';
      } else if (!/^[a-z0-9_-]+$/.test(trimmedId)) {
        errors.id = 'ID는 소문자, 숫자, -, _만 사용할 수 있습니다.';
      } else if (state.engines[trimmedId]) {
        errors.id = '이미 존재하는 ID입니다.';
      }
    }

    if (engineModal.mode === 'edit' && !trimmedId) {
      errors.id = 'ID를 확인할 수 없습니다.';
    }

    if (type === 'plain') {
      const url = engineForm.url?.trim() || '';
      if (!url) {
        errors.url = '검색 URL을 입력하세요.';
      } else if (!isValidHttpUrl(url)) {
        errors.url = 'https://로 시작하는 URL을 입력하세요.';
      }
    } else if (type === 'builder') {
      const template = engineForm.buildUrlTemplate?.trim() || '';
      if (!template) {
        errors.buildUrlTemplate = 'URL 템플릿을 입력하세요.';
      } else if (!template.includes('{q}')) {
        errors.buildUrlTemplate = '{q} 토큰을 포함해야 합니다.';
      } else if (!isValidHttpUrl(template.replace('{q}', 'test'))) {
        errors.buildUrlTemplate = 'https://로 시작하는 URL 템플릿을 입력하세요.';
      }
    }

    if (engineForm.iconUrl && !isValidHttpUrl(engineForm.iconUrl)) {
      errors.iconUrl = '아이콘 URL은 https://로 시작해야 합니다.';
    }

    if (engineForm.color && !/^#([0-9a-f]{3}){1,2}$/i.test(engineForm.color.trim())) {
      errors.color = '컬러는 HEX 형식이어야 합니다.';
    }

    if (Object.keys(errors).length > 0) {
      setEngineFormErrors(errors);
      return;
    }

    const finalId = engineModal.mode === 'create' ? trimmedId : (engineModal.engineId || trimmedId);
    const engineToSave: Omit<SearchEngine, 'buildUrl'> = {
      id: finalId,
      name,
      type,
      color: (engineForm.color?.trim() || DEFAULT_ENGINE_COLOR),
      icon: engineForm.icon?.trim() || name.slice(0, 2),
      iconUrl: engineForm.iconUrl?.trim() || undefined,
      placeholder: engineForm.placeholder?.trim() || undefined,
      meta: engineForm.meta ? { ...engineForm.meta } : undefined,
      _userDefined: engineForm._userDefined ?? engineModal.mode === 'create'
    };

    if (type === 'plain') {
      engineToSave.url = engineForm.url?.trim();
      engineToSave.buildUrlTemplate = undefined;
    } else {
      engineToSave.buildUrlTemplate = engineForm.buildUrlTemplate?.trim();
      engineToSave.url = undefined;
    }

    setState(prev => {
      const nextEngines = { ...prev.engines, [finalId]: engineToSave };
      const baseOrder = prev.customOrder || [];
      let nextOrder = baseOrder.filter(idItem => idItem !== finalId);

      if (engineModal.mode === 'edit') {
        const originalIndex = baseOrder.indexOf(finalId);
        if (originalIndex >= 0) {
          nextOrder.splice(originalIndex, 0, finalId);
        } else {
          nextOrder.push(finalId);
        }
      } else {
        nextOrder.push(finalId);
      }

      const prevPinned = prev.pinned.includes(finalId) ? prev.pinned : prev.pinned;

      const nextPinned = prevPinned.filter(idItem => nextEngines[idItem]).slice(0, 5);

      const nextSelectedEngine = prev.selectedEngine || finalId;

      return {
        ...prev,
        engines: nextEngines,
        customOrder: nextOrder,
        pinned: nextPinned,
        selectedEngine: nextEngines[nextSelectedEngine] ? nextSelectedEngine : finalId
      };
    });

    showToast(engineModal.mode === 'create' ? '검색 엔진이 추가되었습니다.' : '검색 엔진이 업데이트되었습니다.', 'success');
    closeEngineModal();
  }, [engineModal, engineForm, closeEngineModal, state.engines]);

  const handleDeleteEngine = useCallback((engineId: string) => {
    if (!resolvedEnginesMap[engineId]) return;
    if (Object.keys(state.engines).length <= 1) {
      showToast('최소 1개 이상의 검색 엔진이 필요합니다.', 'error');
      return;
    }
    if (!window.confirm('해당 검색 엔진을 삭제할까요? 최근 기록과 핀 정보가 함께 삭제됩니다.')) {
      return;
    }

    setState(prev => {
      const { [engineId]: _, ...restEngines } = prev.engines;
      const nextOrder = prev.customOrder.filter(id => id !== engineId);
      const nextPinned = prev.pinned.filter(id => id !== engineId);
      const nextRecent = { ...prev.recent };
      delete nextRecent[engineId];

      const nextCounts = { ...(prev.searchCounts || {}) };
      Object.keys(nextCounts).forEach(key => {
        if (key.startsWith(`${engineId}::`)) {
          delete nextCounts[key];
        }
      });

      let nextSelectedEngine = prev.selectedEngine;
      if (nextSelectedEngine === engineId) {
        nextSelectedEngine = nextOrder[0] || Object.keys(restEngines)[0] || 'google';
      }

      return {
        ...prev,
        engines: restEngines,
        customOrder: nextOrder,
        pinned: nextPinned,
        recent: nextRecent,
        searchCounts: nextCounts,
        selectedEngine: nextSelectedEngine
      };
    });

    showToast('검색 엔진이 삭제되었습니다.', 'success');
  }, [resolvedEnginesMap, state.engines]);

  // 검색 실행
  const handleSearch = useCallback((e?: React.FormEvent, inNewTab?: boolean) => {
    if (e) e.preventDefault();
    
    const query = state.searchQuery.trim();
    if (!query) {
      setInputError('검색어를 입력하세요.');
      showToast('검색어를 입력하세요.', 'error');
      return;
    }
    if (query.length < 2) {
      setInputError('두 글자 이상 입력해주세요.');
      showToast('두 글자 이상 입력해주세요.', 'info');
      return;
    }
    setInputError(null);

    // 최근 검색어 추가
    setState(prev => {
      const engineRecent = prev.recent[prev.selectedEngine] || [];
      const updatedRecent = [query, ...engineRecent.filter(q => q !== query)].slice(0, 10);
      const counts = { ...(prev.searchCounts || {}) };
      const key = `${prev.selectedEngine}::${query.toLowerCase()}`;
      counts[key] = (counts[key] || 0) + 1;
      return {
        ...prev,
        recent: { ...prev.recent, [prev.selectedEngine]: updatedRecent },
        searchCounts: counts
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
      if (!prev.engines[engineId]) return prev;
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
    const orderedIds = orderedEngines.map(engine => engine.id);
    if (!orderedIds.includes(engineId)) return;

    const filtered = orderedIds.filter(id => id !== engineId);
    const safeIndex = Math.max(0, Math.min(targetIndex, filtered.length));
    filtered.splice(safeIndex, 0, engineId);

    setState(prev => {
      const pinnedSet = new Set(prev.pinned);
      const nextPinned = filtered.filter(id => pinnedSet.has(id));
      const nextNonPinned = filtered.filter(id => !pinnedSet.has(id));
      return {
        ...prev,
        pinned: nextPinned,
        customOrder: [...nextPinned, ...nextNonPinned]
      };
    });
  }, [orderedEngines]);
      

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
      if ((e.key === '/' && !(e.target instanceof HTMLInputElement)) || (e.ctrlKey && e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        inputRef.current?.focus();
        return;
      }

      if (!inputRef.current?.matches(':focus-within') && e.target !== document.body) return;

      // Ctrl+Enter: 항상 새 탭에서 검색
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        handleSearch(undefined, true);
        return;
      }

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
        setSelectedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 선택된 항목으로 스크롤
  useEffect(() => {
    if (selectedIndex >= 0 && suggestionItemsRef.current[selectedIndex]) {
      suggestionItemsRef.current[selectedIndex]?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      });
    }
  }, [selectedIndex]);

  // 드래그앤드롭
  const handleDragStart = useCallback((engineId: string) => (e: React.DragEvent) => {
    isDragging.current = true;
    setDraggedEngine(engineId);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((index: number) => (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
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
    <>
      <WidgetShell
        variant="bare"
        icon={<SearchIcon className="w-4 h-4 text-gray-600" aria-hidden="true" />}
        title={widget.title || '통합검색'}
        size={size}
        contentClassName="w-full h-full flex flex-col min-h-0 p-0"
      >
      <div className={`${isCompact ? 'p-2' : 'p-2.5'} h-full flex flex-col min-h-0`}>
      {/* 탭 영역 */}
      <div className="mb-2">
        <div 
          role="tablist" 
          aria-label="검색 엔진 선택"
          className="flex gap-1 flex-wrap pb-2 overflow-x-hidden"
        >
          {/* 수평 스크롤 제거: flex-wrap으로 행 바꿈 */}
          
          {orderedEngines.map((engine, index) => {
            const isActive = state.selectedEngine === engine.id;
            const color = engine.color || DEFAULT_ENGINE_COLOR;
            const activeBg = hexToRgba(color, 0.14);
            const inactiveBorder = hexToRgba(color, 0.35);
            const isDragTarget = dragOverIndex === index && draggedEngine && draggedEngine !== engine.id;

            return (
              <button
                key={engine.id}
                role="tab"
                aria-selected={isActive}
                aria-controls={`search-input-${engine.id}`}
                draggable={orderedEngines.length > 1}
                onDragStart={handleDragStart(engine.id)}
                onDragOver={handleDragOver(index)}
                onDragEnd={handleDragEnd}
                onDrop={handleDrop(index)}
                onClick={() => selectEngine(engine.id)}
                className={`
                  flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap
                  transition-all cursor-pointer relative border
                  ${draggedEngine === engine.id ? 'opacity-60' : ''}
                `}
                style={{
                  borderColor: isDragTarget ? '#94a3b8' : (isActive ? color : inactiveBorder),
                  backgroundColor: isActive ? activeBg : isDragTarget ? hexToRgba('#94a3b8', 0.2) : undefined,
                  color: isActive ? color : undefined,
                  outline: isDragTarget ? `2px dashed ${inactiveBorder}` : undefined
                }}
              >
                {engine.iconUrl ? (
                  <img
                    src={engine.iconUrl}
                    alt=""
                    className="w-4 h-4 rounded-sm object-contain"
                    draggable={false}
                  />
                ) : (
                  <span
                    className="w-4 h-4 flex items-center justify-center rounded-sm text-[10px] font-semibold text-white"
                    style={{ backgroundColor: color }}
                  >
                    {engine.icon || engine.name.slice(0, 2)}
                  </span>
                )}
                <span className="truncate">{engine.name}</span>
                {state.pinned.includes(engine.id) && (
                  <Pin className="w-3 h-3 opacity-70" strokeWidth={1.5} />
                )}
              </button>
            );
          })}
        </div>
            </div>

      {/* 검색 폼 */}
      <form onSubmit={(e) => handleSearch(e, undefined)} className="flex-1 flex flex-col">
        <div className="relative w-full">
          <div
            className="flex items-center bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus-within:border-transparent rounded-full shadow-sm transition-shadow focus-within:ring-2 px-2 py-1"
            style={{ '--tw-ring-color': selectedEngineData.color || DEFAULT_ENGINE_COLOR } as React.CSSProperties}
          >
            {/* 검색 아이콘 */}
            <SearchIcon className="w-4 h-4 text-gray-400 ml-1 flex-shrink-0" />
            
            {/* 입력 필드 */}
            <input
              ref={inputRef}
              id={`search-input-${selectedEngineData.id}`}
              type="text"
              value={state.searchQuery}
            onChange={(e) => {
              const v = e.target.value;
              setState(prev => ({ ...prev, searchQuery: v }));
              if (!v) setInputError(null);
              else if (v.trim().length >= 2) setInputError(null);
            }}
              onFocus={() => {
                setShowSuggestions(true);
                setSelectedIndex(-1); // 서제스트 열릴 때 선택 인덱스 초기화
              }}
              onKeyDown={(e) => {
                // Alt + 방향키로 서제스트 항목 선택
                if (showSuggestions && suggestionItems.length > 0 && e.altKey) {
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setSelectedIndex(prev => {
                      const next = prev < suggestionItems.length - 1 ? prev + 1 : 0;
                      // 선택된 항목으로 스크롤
                      setTimeout(() => {
                        suggestionItemsRef.current[next]?.scrollIntoView({
                          block: 'nearest',
                          behavior: 'smooth'
                        });
                      }, 0);
                      return next;
                    });
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setSelectedIndex(prev => {
                      const next = prev > 0 ? prev - 1 : suggestionItems.length - 1;
                      // 선택된 항목으로 스크롤
                      setTimeout(() => {
                        suggestionItemsRef.current[next]?.scrollIntoView({
                          block: 'nearest',
                          behavior: 'smooth'
                        });
                      }, 0);
                      return next;
                    });
                  } else if (e.key === 'Enter' && selectedIndex >= 0) {
                    e.preventDefault();
                    const selectedItem = suggestionItems[selectedIndex];
                    if (selectedItem) {
                      setState(prev => ({ ...prev, searchQuery: selectedItem.query }));
                      handleSearch(undefined, state.openInNewTab);
                      setSelectedIndex(-1);
                    }
                  }
                } else if (e.key === 'Escape') {
                  setShowSuggestions(false);
                  setSelectedIndex(-1);
                }
              }}
              placeholder={selectedEngineData.placeholder || `${selectedEngineData.name} 검색`}
              className="flex-1 px-2 py-0.5 text-sm border-none outline-none bg-transparent placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100"
              aria-label={`${selectedEngineData.name}에서 검색하기`}
            aria-invalid={inputError ? 'true' : 'false'}
            aria-describedby={inputError ? `search-error-${widget.id}` : undefined}
            />
            {/* 스크린리더 안내 */}
            <span className="sr-only">
              {`${selectedEngineData.name} 검색. 키보드 단축키: '/' 입력창 포커스, Ctrl+좌우 엔진 전환, Alt+숫자 즉시 전환`}
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
              className="p-0.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full mr-1 transition-colors"
              aria-label="설정"
            >
              <Settings className="w-3.5 h-3.5 text-gray-500" />
            </button>
            
            {/* 검색 버튼 */}
            <button
              type="submit"
              className="p-0.5 rounded-r-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="검색 실행"
            >
              <SearchIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        {/* 에러 메시지 (접근성) */}
        {inputError && (
          <div id={`search-error-${widget.id}`} role="alert" aria-live="polite" className="mt-1 text-xs text-red-500">
            {inputError}
          </div>
        )}

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
                  {recentQueries.map((query, idx) => {
                    const itemIndex = idx;
                    const isSelected = selectedIndex === itemIndex;
                    return (
                      <button
                        key={query}
                        ref={(el) => { suggestionItemsRef.current[itemIndex] = el; }}
                        type="button"
                        onClick={() => {
                          setState(prev => ({ ...prev, searchQuery: query }));
                          handleSearch(undefined, state.openInNewTab);
                        }}
                        onMouseEnter={() => setSelectedIndex(itemIndex)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded text-sm text-left ${
                          isSelected 
                            ? 'bg-blue-50 dark:bg-blue-900/20' 
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                        role="option"
                        aria-selected={isSelected}
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
                    );
                  })}
                </div>
              )}

              {/* 인기 검색어 (간단 집계) */}
              {state.searchCounts && Object.keys(state.searchCounts).length > 0 && (
                <div className="border-t border-gray-200 dark:border-gray-600 p-2">
                  <div className="px-2 py-1 mb-1">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">인기 검색어</span>
                  </div>
                  {Object.entries(state.searchCounts)
                    .filter(([key]) => key.startsWith(`${state.selectedEngine}::`))
                    .sort((a, b) => (b[1] as number) - (a[1] as number))
                    .slice(0, 5)
                    .map(([key], idx) => {
                      const q = key.split('::')[1];
                      const itemIndex = recentQueries.length + idx;
                      const isSelected = selectedIndex === itemIndex;
                      return (
                        <button
                          key={key}
                          ref={(el) => { suggestionItemsRef.current[itemIndex] = el; }}
                          type="button"
                          onClick={() => {
                            setState(prev => ({ ...prev, searchQuery: q }));
                            handleSearch(undefined, state.openInNewTab);
                          }}
                          onMouseEnter={() => setSelectedIndex(itemIndex)}
                          className={`w-full px-3 py-2 rounded text-sm text-left ${
                            isSelected 
                              ? 'bg-blue-50 dark:bg-blue-900/20' 
                              : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                          role="option"
                          aria-selected={isSelected}
                        >
                          {q}
                        </button>
                      );
                    })}
                </div>
              )}

              {/* 제안 */}
              {suggestions.length > 0 && (
                <div className="border-t border-gray-200 dark:border-gray-600 p-2">
                  <div className="px-2 py-1 mb-1">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">제안</span>
                  </div>
                  {suggestions.map((suggestion, idx) => {
                    const itemIndex = recentQueries.length + 
                      (state.searchCounts ? Object.entries(state.searchCounts)
                        .filter(([key]) => key.startsWith(`${state.selectedEngine}::`))
                        .sort((a, b) => (b[1] as number) - (a[1] as number))
                        .slice(0, 5).length : 0) + idx;
                    const isSelected = selectedIndex === itemIndex;
                    return (
                      <button
                        key={suggestion}
                        ref={(el) => { suggestionItemsRef.current[itemIndex] = el; }}
                        type="button"
                        onClick={() => {
                          setState(prev => ({ ...prev, searchQuery: suggestion }));
                          handleSearch(undefined, state.openInNewTab);
                        }}
                        onMouseEnter={() => setSelectedIndex(itemIndex)}
                        className={`w-full px-3 py-2 rounded text-sm text-left ${
                          isSelected 
                            ? 'bg-blue-50 dark:bg-blue-900/20' 
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                        role="option"
                        aria-selected={isSelected}
                      >
                        {suggestion}
                      </button>
                    );
                  })}
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
                  {orderedEngines.map(engine => (
                    <label key={engine.id} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={state.pinned.includes(engine.id)}
                        onChange={() => togglePin(engine.id)}
                        disabled={!state.pinned.includes(engine.id) && state.pinned.length >= 5}
                        className="rounded"
                      />
                      <span className="flex-1">{engine.name}</span>
                      <span className="px-1.5 py-0.5 rounded text-xs text-white" style={{ backgroundColor: engine.color || DEFAULT_ENGINE_COLOR }}>
                        {engine.icon || engine.name.slice(0, 2)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                  <span>엔진 관리</span>
                  <button
                    type="button"
                    onClick={openCreateEngine}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded border border-dashed border-gray-300 dark:border-gray-600 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Plus className="w-3 h-3" />
                    추가
                  </button>
                </div>
                <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                  {orderedEngines.map(engine => (
                    <div
                      key={engine.id}
                      className="flex items-center gap-2 px-2 py-1.5 rounded border border-gray-200 dark:border-gray-700 text-xs bg-white dark:bg-gray-900"
                    >
                      {engine.iconUrl ? (
                        <img
                          src={engine.iconUrl}
                          alt=""
                          className="w-4 h-4 rounded-sm object-cover flex-shrink-0"
                          draggable={false}
                        />
                      ) : (
                        <span
                          className="w-4 h-4 flex items-center justify-center rounded-sm text-[10px] font-semibold text-white flex-shrink-0"
                          style={{ backgroundColor: engine.color || DEFAULT_ENGINE_COLOR }}
                        >
                          {engine.icon || engine.name.slice(0, 2)}
                        </span>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="font-semibold truncate">{engine.name}</span>
                          {engine._userDefined && (
                            <span className="px-1 rounded bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-200">User</span>
                          )}
                          {state.pinned.includes(engine.id) && (
                            <Pin className="w-3 h-3 text-blue-500" strokeWidth={1.5} />
                          )}
                        </div>
                        <div className="text-[10px] text-gray-400 dark:text-gray-500 truncate">
                          {engine.type === 'builder' ? 'Builder' : 'Plain'} · ID: {engine.id}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEditEngine(engine.id)}
                          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                          aria-label="엔진 편집"
                        >
                          <PenSquare className="w-3.5 h-3.5 text-gray-500" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteEngine(engine.id)}
                          className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/40"
                          aria-label="엔진 삭제"
                          disabled={!engine._userDefined && Object.keys(state.engines).length <= BUILTIN_ENGINES.length}
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-[10px] text-gray-400 dark:text-gray-500">
                  엔진 ID는 고유해야 하며, Builder 타입은 URL 템플릿에 <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">{'{q}'}</code> 토큰을 포함해야 합니다.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 도움말 - 항상 작게 표시하여 2x1에서도 보이도록 */}
        <div className="mt-1 text-[10px] leading-3 text-gray-400 dark:text-gray-500 text-center">
          Alt+1~9 전환 · Shift+Enter 현재 탭
        </div>
      </form>
      </div>
      </WidgetShell>

      {engineModal && (
        <div className="fixed inset-0 z-[999] bg-black/40 backdrop-blur-sm flex items-center justify-center px-4 py-6">
          <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                {engineModal.mode === 'create' ? '검색 엔진 추가' : '검색 엔진 편집'}
              </h3>
              <button
                type="button"
                onClick={closeEngineModal}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="엔진 관리 닫기"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-1">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  엔진 이름
                </label>
                <input
                  type="text"
                  value={engineForm.name ?? ''}
                  onChange={(e) => handleEngineFormChange('name', e.target.value)}
                  className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="예: Wikipedia"
                />
                {engineFormErrors.name && (
                  <p className="mt-1 text-[11px] text-red-500">{engineFormErrors.name}</p>
                )}
              </div>

              <div className="grid grid-cols-[1fr_auto] gap-3 items-end">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    엔진 ID (slug)
                  </label>
                  <input
                    type="text"
                    value={engineForm.id ?? ''}
                    onChange={(e) => handleEngineFormChange('id', e.target.value.toLowerCase())}
                    className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                    placeholder="예: wiki"
                    disabled={engineModal.mode === 'edit'}
                  />
                  {engineFormErrors.id && (
                    <p className="mt-1 text-[11px] text-red-500">{engineFormErrors.id}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    타입
                  </label>
                  <select
                    value={engineForm.type || 'plain'}
                    onChange={(e) => {
                      const value = e.target.value as 'plain' | 'builder';
                      setEngineForm(prev => ({
                        ...prev,
                        type: value,
                        ...(value === 'builder' && !prev.buildUrlTemplate
                          ? { buildUrlTemplate: 'https://example.com/search?q={q}' }
                          : {}),
                        ...(value === 'plain' && !prev.url ? { url: 'https://', buildUrlTemplate: prev.buildUrlTemplate } : {})
                      }));
                    }}
                    className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="plain">기본 검색 (URL + 질의)</option>
                    <option value="builder">커스텀 URL 템플릿</option>
                  </select>
                </div>
              </div>

              {(engineForm.type || 'plain') === 'plain' && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    검색 URL (검색어가 뒤에 붙습니다)
                  </label>
                  <input
                    type="text"
                    value={engineForm.url ?? ''}
                    onChange={(e) => handleEngineFormChange('url', e.target.value)}
                    className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/search?q="
                  />
                  {engineFormErrors.url && (
                    <p className="mt-1 text-[11px] text-red-500">{engineFormErrors.url}</p>
                  )}
                </div>
              )}

              {(engineForm.type || 'plain') === 'builder' && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    URL 템플릿 ({'{q}'} 자리에 검색어가 들어갑니다)
                  </label>
                  <input
                    type="text"
                    value={engineForm.buildUrlTemplate ?? ''}
                    onChange={(e) => handleEngineFormChange('buildUrlTemplate', e.target.value)}
                    className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/search?query={q}"
                  />
                  {engineFormErrors.buildUrlTemplate && (
                    <p className="mt-1 text-[11px] text-red-500">{engineFormErrors.buildUrlTemplate}</p>
                  )}
                </div>
              )}

              {(engineForm.id === 'opgg' || engineModal.engineId === 'opgg') && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    OP.GG 검색 모드
                  </label>
                  <select
                    value={(engineForm.meta?.mode as string) || 'summoner'}
                    onChange={(e) => handleEngineMetaChange('mode', e.target.value)}
                    className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="summoner">소환사 검색</option>
                    <option value="champion">챔피언 검색</option>
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">아이콘 텍스트</label>
                  <input
                    type="text"
                    value={engineForm.icon ?? ''}
                    onChange={(e) => handleEngineFormChange('icon', e.target.value)}
                    className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="예: W"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">아이콘 URL</label>
                  <input
                    type="text"
                    value={engineForm.iconUrl ?? ''}
                    onChange={(e) => handleEngineFormChange('iconUrl', e.target.value)}
                    className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/favicon.ico"
                  />
                  {engineFormErrors.iconUrl && (
                    <p className="mt-1 text-[11px] text-red-500">{engineFormErrors.iconUrl}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">플레이스홀더 문구</label>
                <input
                  type="text"
                  value={engineForm.placeholder ?? ''}
                  onChange={(e) => handleEngineFormChange('placeholder', e.target.value)}
                  className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="예: Wikipedia 검색"
                />
              </div>

              <div className="grid grid-cols-[auto_1fr] gap-3 items-center">
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={engineForm.color || DEFAULT_ENGINE_COLOR}
                    onChange={(e) => handleEngineFormChange('color', e.target.value)}
                    className="h-9 w-9 rounded border border-gray-300 dark:border-gray-700 p-0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    브랜드 컬러 (HEX)
                  </label>
                  <input
                    type="text"
                    value={engineForm.color ?? ''}
                    onChange={(e) => handleEngineFormChange('color', e.target.value)}
                    className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="#2563EB"
                  />
                  {engineFormErrors.color && (
                    <p className="mt-1 text-[11px] text-red-500">{engineFormErrors.color}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeEngineModal}
                className="px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleEngineSave}
                className="px-3 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                disabled={engineModal.mode === 'create' && !(engineForm.id && engineForm.name)}
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
