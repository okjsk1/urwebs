// 북마크 위젯 - 파비콘 자동, URL 정규화, 인라인 추가 폼, 재정렬 기능
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Button } from '../ui/button';
import { Plus, Trash2, ArrowUp, ArrowDown, ExternalLink, Edit, Check, X as XIcon, SortAsc, SortDesc } from 'lucide-react';
import { 
  WidgetProps, 
  persistOrLocal, 
  readLocal, 
  getFaviconUrl, 
  normalizeUrl, 
  isValidUrl,
  showToast 
} from './utils/widget-helpers';

interface Bookmark {
  id: string;
  name: string;
  url: string;
  icon: string;
  favicon?: string;
  categoryId?: string;
}

interface BookmarkState {
  bookmarks: Bookmark[];
  categories: { id: string; name: string }[];
  activeCategoryId?: string; // 필터용
  showAddForm: boolean;
  newBookmark: {
    name: string;
    url: string;
    categoryId?: string;
  };
  editingId?: string;
  editDraft?: { name: string; url: string };
  sortBy: 'name' | 'date' | 'category';
  sortOrder: 'asc' | 'desc';
  // 전송 기능 제거
}

const DEFAULT_BOOKMARKS: Bookmark[] = [];
const DEFAULT_CATEGORIES = [
  { id: 'default', name: '기본' }
];

export const BookmarkWidget: React.FC<WidgetProps & { onBookmarkCountChange?: (count: number) => void }> = ({ widget, isEditMode, updateWidget, onBookmarkCountChange }) => {
  const lastBookmarkCountRef = useRef<number>(0);
  const [state, setState] = useState<BookmarkState>(() => {
    const saved = readLocal(widget.id, {
      bookmarks: DEFAULT_BOOKMARKS,
      categories: DEFAULT_CATEGORIES,
      activeCategoryId: 'default',
      showAddForm: false,
      newBookmark: { name: '', url: '', categoryId: 'default' },
      editingId: undefined,
      editDraft: { name: '', url: '' },
      sortBy: 'name' as const,
      sortOrder: 'asc' as const
    });
    
    // widget.content에서 북마크 데이터가 있으면 사용 (공개페이지용)
    if (widget.content?.bookmarks && Array.isArray(widget.content.bookmarks)) {
      saved.bookmarks = widget.content.bookmarks;
    }
    
    return saved;
  });

  // 폴더명(위젯 제목) 초기 자동 지정: "새 폴더", "새 폴더(1)" ...
  useEffect(() => {
    const currentTitle = (widget.title || '').trim();
    if (!currentTitle || currentTitle === '즐겨찾기') {
      const key = 'bookmark_folder_counter';
      const parsed = parseInt(localStorage.getItem(key) || '0', 10);
      const next = isNaN(parsed) ? 0 : parsed;
      const name = next === 0 ? '새 폴더' : `새 폴더(${next})`;
      try { localStorage.setItem(key, String(next + 1)); } catch {}
      updateWidget?.(widget.id, { ...widget, title: name });
    }
  }, [widget.id]);

  // 내부 제목 편집 UI 제거 (타이틀 바에서만 편집)
  const [isRenaming, setIsRenaming] = useState(false);
  const [draftTitle, setDraftTitle] = useState<string>('');

  const startRename = () => {
    setDraftTitle(widget.title || '');
    setIsRenaming(true);
  };

  const commitRename = () => {
    const name = (draftTitle || '').trim() || '새 폴더';
    updateWidget?.(widget.id, { ...widget, title: name });
    setIsRenaming(false);
  };

  // 드래그 앤 드롭 순서 변경용 로컬 상태 (퍼시스트 필요 없음)
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  // 파비콘 로드
  useEffect(() => {
    const loadFavicons = async () => {
      const updatedBookmarks = await Promise.all(
        state.bookmarks.map(async (bookmark) => {
          if (!bookmark.favicon) {
            const favicon = getFaviconUrl(bookmark.url);
            return { ...bookmark, favicon };
          }
          return bookmark;
        })
      );
      
      if (updatedBookmarks.some((bm, i) => bm.favicon !== state.bookmarks[i]?.favicon)) {
        setState(prev => ({ ...prev, bookmarks: updatedBookmarks }));
      }
    };

    loadFavicons();
  }, [state.bookmarks.length]); // 파비콘은 한 번만 로드

  // 상태 저장: state가 바뀔 때마다 즉시 반영 (사라짐 문제 방지)
  useEffect(() => {
    persistOrLocal(widget.id, state, updateWidget);
  }, [widget.id, state, updateWidget]);

  // 마이그레이션: 예전 저장본에는 categories/activeCategoryId가 없음
  useEffect(() => {
    if (!state.categories || state.categories.length === 0) {
      setState(prev => ({
        ...prev,
        categories: DEFAULT_CATEGORIES,
        activeCategoryId: prev.activeCategoryId || 'default',
        newBookmark: { ...prev.newBookmark, categoryId: prev.newBookmark?.categoryId || 'default' }
      }));
    }
  }, []);

  // URL 입력 시 자동 이름 추천 (입력 중에도 동기 반영)
  useEffect(() => {
    const url = state.newBookmark.url?.trim();
    const name = state.newBookmark.name?.trim();
    if (!url) return;

    try {
      const normalized = normalizeUrl(url);
      const u = new URL(normalized);
      const host = u.hostname.replace(/^www\./, '');
      const suggestion = (() => {
        const h = host.toLowerCase();
        if (h.includes('google')) return 'Google';
        if (h.includes('naver')) return 'NAVER';
        if (h.includes('youtube')) return 'YouTube';
        if (h.includes('github')) return 'GitHub';
        if (h.includes('kakao') || h.includes('daum')) return '카카오';
        if (h.includes('apple')) return 'Apple';
        if (h.includes('microsoft')) return 'Microsoft';
        if (h.includes('notion')) return 'Notion';
        if (h.includes('figma')) return 'Figma';
        return host.split('.')[0].replace(/^[a-z]/, (c) => c.toUpperCase());
      })();

      // 사용자가 이름을 직접 입력하지 않았거나, 이전 자동추천과 동일하면 갱신
      if (!name || name === state.newBookmark.name) {
        setState(prev => ({ ...prev, newBookmark: { ...prev.newBookmark, name: suggestion } }));
      }
    } catch {
      // ignore
    }
  }, [state.newBookmark.url]);

  // 북마크 개수 추적 (크기 자동 조절 비활성화 - 사용자가 직접 조절 가능)
  useEffect(() => {
    const bookmarkCount = state.bookmarks.length;
    
    // 북마크 개수가 변경되었을 때만 처리 (무한 루프 방지)
    if (bookmarkCount === lastBookmarkCountRef.current) {
      return;
    }
    
    lastBookmarkCountRef.current = bookmarkCount;

    // 부모 컴포넌트에게 북마크 개수 변경 알림
    onBookmarkCountChange?.(bookmarkCount);

  }, [state.bookmarks.length, onBookmarkCountChange]);

  const getDomainIcon = useCallback((url: string): string => {
    try {
      const domain = new URL(normalizeUrl(url)).hostname.toLowerCase();
      if (domain.includes('google')) return '🔍';
      else if (domain.includes('github')) return '🐙';
      else if (domain.includes('youtube')) return '📺';
      else if (domain.includes('naver')) return '🌐';
      else if (domain.includes('facebook')) return '📘';
      else if (domain.includes('instagram')) return '📷';
      else if (domain.includes('twitter')) return '🐦';
      else if (domain.includes('linkedin')) return '💼';
      else if (domain.includes('netflix')) return '🎬';
      else if (domain.includes('spotify')) return '🎵';
      else if (domain.includes('apple')) return '🍎';
      else if (domain.includes('microsoft')) return '🪟';
      else return '🔗';
    } catch {
      return '🔗';
    }
  }, []);

  // 정렬된 북마크 반환
  const sortedBookmarks = useMemo(() => {
    const filtered = state.activeCategoryId 
      ? state.bookmarks.filter(bm => bm.categoryId === state.activeCategoryId)
      : state.bookmarks;

    return [...filtered].sort((a, b) => {
      let comparison = 0;
      
      switch (state.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'category':
          const categoryA = state.categories.find(c => c.id === a.categoryId)?.name || '';
          const categoryB = state.categories.find(c => c.id === b.categoryId)?.name || '';
          comparison = categoryA.localeCompare(categoryB);
          break;
        case 'date':
          // 날짜는 추가 순서로 정렬 (id 기준)
          comparison = a.id.localeCompare(b.id);
          break;
      }
      
      return state.sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [state.bookmarks, state.activeCategoryId, state.sortBy, state.sortOrder, state.categories]);

  const addBookmark = useCallback(() => {
    const { name, url } = state.newBookmark;
    
    if (!name.trim()) {
      showToast('사이트 이름을 입력하세요', 'error');
      return;
    }
    
    if (!url.trim()) {
      showToast('URL을 입력하세요', 'error');
      return;
    }

    const normalizedUrl = normalizeUrl(url);
    if (!isValidUrl(normalizedUrl)) {
      showToast('올바른 URL을 입력하세요', 'error');
      return;
    }

    // 중복 URL 체크
    if (state.bookmarks.some(bm => normalizeUrl(bm.url) === normalizedUrl)) {
      showToast('이미 추가된 URL입니다', 'error');
      return;
    }

    if (state.bookmarks.length >= 8) {
      showToast('북마크는 최대 8개까지 추가할 수 있습니다', 'error');
      return;
    }

    // 이름 자동 제안: '@' 접두 제거 후 도메인/경로에서 서비스명 추출
    const rawName = name.trim().replace(/^@+/, '');
    const autoName = (() => {
      if (rawName) return rawName;
      try {
        const u = new URL(normalizedUrl);
        const host = u.hostname.replace(/^www\./, '');
        if (host.includes('kakao') || host.includes('daum')) return '카카오맵';
        if (host.includes('google')) return 'Google';
        if (host.includes('naver')) return 'Naver';
        if (host.includes('github')) return 'GitHub';
        if (host.includes('youtube')) return 'YouTube';
        return host.split('.')[0];
      } catch { return '사이트'; }
    })();

    const newBookmark: Bookmark = {
      id: Date.now().toString(),
      name: autoName,
      url: normalizedUrl,
      icon: getDomainIcon(normalizedUrl),
      favicon: getFaviconUrl(normalizedUrl),
      categoryId: state.activeCategoryId || 'default'
    };

    setState(prev => {
      const updatedBookmarks = [...prev.bookmarks, newBookmark];
      return {
        ...prev,
        bookmarks: updatedBookmarks,
        newBookmark: { name: '', url: '' },
        showAddForm: false
      };
    });
    
    showToast('북마크 추가됨', 'success');
  }, [state.newBookmark, state.bookmarks, getDomainIcon]);

  const deleteBookmark = useCallback((id: string) => {
    setState(prev => {
      const updatedBookmarks = prev.bookmarks.filter(bookmark => bookmark.id !== id);
      return {
        ...prev,
        bookmarks: updatedBookmarks
      };
    });
    showToast('북마크 삭제됨', 'success');
  }, []);

  const moveBookmark = useCallback((id: string, direction: 'up' | 'down') => {
    setState(prev => {
      const bookmarks = [...prev.bookmarks];
      const index = bookmarks.findIndex(bm => bm.id === id);
      
      if (direction === 'up' && index > 0) {
        [bookmarks[index], bookmarks[index - 1]] = [bookmarks[index - 1], bookmarks[index]];
      } else if (direction === 'down' && index < bookmarks.length - 1) {
        [bookmarks[index], bookmarks[index + 1]] = [bookmarks[index + 1], bookmarks[index]];
      }
      
      return { ...prev, bookmarks };
    });
  }, []);

  // 키보드 단축키 처리 (간단한 버전)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Z, Ctrl+Y 단축키는 나중에 구현
      console.log('키보드 단축키:', e.key, e.ctrlKey);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // DnD: 시작
  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    if (!isEditMode) return;
    setDraggingId(id);
    e.dataTransfer.effectAllowed = 'move';
    // 파이어폭스 호환: setData 필요
    e.dataTransfer.setData('text/plain', id);
    // 다른 즐겨찾기 위젯으로 이동 가능하도록 타입 정보 추가
    e.dataTransfer.setData('application/json', JSON.stringify({
      type: 'bookmark',
      bookmarkId: id,
      widgetId: widget.id
    }));
  }, [isEditMode, widget.id]);

  // DnD: 드래그 중 (타겟 위)
  const handleDragOver = useCallback((e: React.DragEvent, overId: string) => {
    if (!isEditMode) return;
    e.preventDefault();
    if (dragOverId !== overId) setDragOverId(overId);
  }, [isEditMode, dragOverId]);

  // DnD: 드롭
  const handleDrop = useCallback((e: React.DragEvent, targetId: string) => {
    if (!isEditMode) return;
    e.preventDefault();
    const sourceId = draggingId || e.dataTransfer.getData('text/plain');
    if (!sourceId || sourceId === targetId) {
      setDraggingId(null);
      setDragOverId(null);
      return;
    }
    setState(prev => {
      const list = [...prev.bookmarks];
      const from = list.findIndex(b => b.id === sourceId);
      const to = list.findIndex(b => b.id === targetId);
      if (from === -1 || to === -1) return prev;
      const [moved] = list.splice(from, 1);
      list.splice(to, 0, moved);
      return { ...prev, bookmarks: list };
    });
    setDraggingId(null);
    setDragOverId(null);
  }, [isEditMode, draggingId]);

  const handleDragEnd = useCallback(() => {
    setDraggingId(null);
    setDragOverId(null);
  }, []);

  const startEdit = useCallback((bm: Bookmark) => {
    setState(prev => ({
      ...prev,
      editingId: bm.id,
      editDraft: { name: bm.name, url: bm.url }
    }));
  }, []);

  const cancelEdit = useCallback(() => {
    setState(prev => ({ ...prev, editingId: undefined, editDraft: { name: '', url: '' } }));
  }, []);

  const saveEdit = useCallback((id: string) => {
    const draft = state.editDraft || { name: '', url: '' };
    const name = draft.name?.trim() || '';
    const url = draft.url?.trim() || '';
    if (!name) { showToast('사이트 이름을 입력하세요', 'error'); return; }
    if (!url) { showToast('URL을 입력하세요', 'error'); return; }
    const normalizedUrl = normalizeUrl(url);
    if (!isValidUrl(normalizedUrl)) { showToast('올바른 URL을 입력하세요', 'error'); return; }

    setState(prev => {
      const updatedBookmarks = prev.bookmarks.map(bm => bm.id === id ? {
        ...bm,
        name,
        url: normalizedUrl,
        icon: getDomainIcon(normalizedUrl),
        favicon: getFaviconUrl(normalizedUrl)
      } : bm);
      return {
        ...prev,
        bookmarks: updatedBookmarks,
        editingId: undefined,
        editDraft: { name: '', url: '' }
      };
    });
    showToast('수정되었습니다', 'success');
  }, [state.editDraft, getDomainIcon]);

  // 전송/붙여넣기 기능 제거(드래그로 이동하세요)

  const openBookmark = useCallback((url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  }, []);

  // 북마크 목록 (검색/필터링 없이 그대로 사용)
  const categories = state.categories && state.categories.length > 0 ? state.categories : DEFAULT_CATEGORIES;
  const activeCategoryId = state.activeCategoryId || 'default';
  const filteredBookmarks = useMemo(() => {
    if (!activeCategoryId) return state.bookmarks;
    return state.bookmarks.filter(bm => (bm.categoryId || 'default') === activeCategoryId);
  }, [state.bookmarks, activeCategoryId]);

  // 다른 즐겨찾기 위젯에서 드롭받기
  const handleExternalDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      if (data.type === 'bookmark' && data.widgetId !== widget.id) {
        // 다른 즐겨찾기 위젯에서 온 북마크
        showToast('다른 즐겨찾기 위젯에서 북마크를 이동하려면 위젯 타이틀을 클릭하여 편집 모드에서 이동하세요', 'info');
      }
    } catch {
      // 일반 드래그 처리
    }
  }, [widget.id]);

  return (
    <div 
      className="h-full flex flex-col"
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
      }}
      onDrop={handleExternalDrop}
    >
      {/* 정렬 버튼 */}
      {isEditMode && (
        <div className="flex items-center justify-between px-2.5 pt-2 pb-1">
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={() => setState(prev => ({ 
                ...prev, 
                sortBy: 'name',
                sortOrder: prev.sortBy === 'name' && prev.sortOrder === 'asc' ? 'desc' : 'asc'
              }))}
              title="이름순 정렬"
            >
              {state.sortBy === 'name' ? (
                state.sortOrder === 'asc' ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />
              ) : (
                <SortAsc className="w-3 h-3 opacity-50" />
              )}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={() => setState(prev => ({ 
                ...prev, 
                sortBy: 'category',
                sortOrder: prev.sortBy === 'category' && prev.sortOrder === 'asc' ? 'desc' : 'asc'
              }))}
              title="카테고리순 정렬"
            >
              {state.sortBy === 'category' ? (
                state.sortOrder === 'asc' ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />
              ) : (
                <SortAsc className="w-3 h-3 opacity-50" />
              )}
            </Button>
          </div>
        </div>
      )}
      
      {/* 북마크 리스트 (세로 배치) */}
      <div className="space-y-2 mb-3 flex-1 overflow-y-auto px-2.5 pt-2">
        {/* 붙여넣기 기능 제거 */}
        {sortedBookmarks.map((bookmark, index) => (
          <div 
            key={bookmark.id}
            className={`relative group ${dragOverId === bookmark.id ? 'ring-2 ring-blue-300 rounded' : ''}`}
            draggable={isEditMode}
            onDragStart={(e) => {
              e.stopPropagation(); // 위젯 드래그와 충돌 방지
              handleDragStart(e, bookmark.id);
            }}
            onDragOver={(e) => {
              e.stopPropagation(); // 위젯 드래그와 충돌 방지
              handleDragOver(e, bookmark.id);
            }}
            onDrop={(e) => {
              e.stopPropagation(); // 위젯 드래그와 충돌 방지
              handleDrop(e, bookmark.id);
            }}
            onDragEnd={(e) => {
              e.stopPropagation(); // 위젯 드래그와 충돌 방지
              handleDragEnd();
            }}
          >
            <button
              onClick={() => openBookmark(bookmark.url)}
              className="w-full p-2 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center gap-1.5"
              aria-label={`${bookmark.name} 열기`}
            >
              {/* 로고 */}
              <div className="flex-shrink-0">
                {bookmark.favicon ? (
                  <img 
                    src={bookmark.favicon} 
                    alt="" 
                    className="w-5 h-5"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <span className="text-base">{bookmark.icon}</span>
                )}
              </div>
              
              {/* 사이트 이름 (오른쪽) */}
              <div className="flex-1 text-left text-xs font-medium text-gray-800 truncate">
                {bookmark.name}
              </div>
              
              {/* 외부 링크 아이콘 */}
              <ExternalLink className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            </button>
            
            {/* 편집/삭제 버튼 */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {/* 붙여넣기 기능 제거: 대신 그냥 이 위젯 내부에서 드래그로 순서 변경 */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  startEdit(bookmark);
                }}
                className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs"
                aria-label="북마크 편집"
                title="편집"
              >
                <Edit className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteBookmark(bookmark.id);
                }}
                className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                aria-label="북마크 삭제"
                title="삭제"
              >
                ×
              </button>
            </div>
            
            {/* 드래그 핸들 시각 강화 (왼쪽 바) */}
            {isEditMode && (
              <div className="absolute -left-2 top-0 bottom-0 w-1.5 rounded-l bg-gradient-to-b from-gray-300 to-gray-200 opacity-0 group-hover:opacity-100" />
            )}
          </div>
        ))}
        
        {/* 인라인 편집 폼 (해당 항목 아래에 표시) */}
        {state.editingId && (
          <div className="p-2 bg-blue-50 border border-blue-200 rounded">
            <div className="flex gap-1 mb-1">
              <input
                type="text"
                value={state.editDraft?.name || ''}
                onChange={(e) => setState(prev => ({ ...prev, editDraft: { ...(prev.editDraft || { name: '', url: '' }), name: e.target.value } }))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    saveEdit(state.editingId!);
                  }
                }}
                placeholder="사이트 이름"
                className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
              />
              <input
                type="url"
                value={state.editDraft?.url || ''}
                onChange={(e) => setState(prev => ({ ...prev, editDraft: { ...(prev.editDraft || { name: '', url: '' }), url: e.target.value } }))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    saveEdit(state.editingId!);
                  }
                }}
                placeholder="https://example.com"
                className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
              />
            </div>
            <div className="flex gap-1 justify-end">
              <Button size="sm" className="h-6 text-xs" onClick={() => saveEdit(state.editingId!)}>
                <Check className="w-3 h-3 mr-1" /> 저장
              </Button>
              <Button size="sm" variant="outline" className="h-6 text-xs" onClick={cancelEdit}>
                <XIcon className="w-3 h-3 mr-1" /> 취소
              </Button>
            </div>
          </div>
        )}

      </div>
      
      {/* 페이지 추가 버튼 (고정 위치) */}
      {isEditMode && state.bookmarks.length < 100 && (
        <div className="mt-2 flex-shrink-0 px-2.5 pb-2">
          <button 
            className="w-full p-2 bg-gray-100 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-500 hover:border-blue-300 dark:hover:border-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 flex items-center justify-center transition-colors cursor-pointer"
            onClick={() => setState(prev => ({ ...prev, showAddForm: true }))}
          >
            <Plus className="w-4 h-4 mr-1 text-gray-400 dark:text-gray-500" />
            <div className="text-gray-400 dark:text-gray-500 text-xs">사이트 추가</div>
          </button>
        </div>
      )}

      {/* 북마크 추가 폼 (고정 위치) */}
      {isEditMode && state.showAddForm && (
        <div className="mt-2 flex-shrink-0 space-y-2 p-2 bg-gray-50 dark:bg-gray-700 rounded mx-2.5 mb-2">
          <input
            type="text"
            value={state.newBookmark.name}
            onChange={(e) => setState(prev => ({ 
              ...prev, 
              newBookmark: { ...prev.newBookmark, name: e.target.value } 
            }))}
            placeholder="사이트 이름"
            className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded"
            aria-label="사이트 이름 입력"
          />
          <input
            type="url"
            value={state.newBookmark.url}
            onChange={(e) => setState(prev => ({ 
              ...prev, 
              newBookmark: { ...prev.newBookmark, url: e.target.value } 
            }))}
            placeholder="https://example.com"
            className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded"
            aria-label="URL 입력"
          />
          {/* 폴더 선택 제거: 현재 활성 폴더로 자동 추가 */}
          {/* 자동 추천 힌트 */}
          {state.newBookmark.url && (
            <div className="text-[10px] text-gray-500">URL 기준 이름 자동 추천됨</div>
          )}
          <div className="flex gap-1">
            <Button
              size="sm"
              className="flex-1 h-6 text-xs"
              onClick={addBookmark}
            >
              추가
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-6 text-xs border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
              onClick={() => setState(prev => ({ 
                ...prev, 
                showAddForm: false, 
                newBookmark: { name: '', url: '' } 
              }))}
            >
              취소
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
