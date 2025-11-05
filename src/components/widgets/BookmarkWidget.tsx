// 북마크 위젯 - 파비콘 자동, URL 정규화, 인라인 추가 폼, 재정렬 기능
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Button } from '../ui/button';
import { Plus, Trash2, ArrowUp, ArrowDown, ExternalLink, Edit, Check, X as XIcon } from 'lucide-react';
import { SiteAvatar } from '../common/SiteAvatar';
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
  tags?: string[];
}

interface BookmarkState {
  bookmarks: Bookmark[];
  categories: { id: string; name: string }[];
  activeCategoryId?: string; // 필터용
  activeTag?: string; // 태그 필터
  showAddForm: boolean;
  newBookmark: {
    name: string;
    url: string;
    categoryId?: string;
    tags?: string[];
  };
  editingId?: string;
  editDraft?: { name: string; url: string; tags?: string[] };
}

const DEFAULT_BOOKMARKS: Bookmark[] = [];
const DEFAULT_CATEGORIES = [
  { id: 'default', name: '기본' }
];

export const BookmarkWidget: React.FC<WidgetProps & { 
  onBookmarkCountChange?: (count: number) => void;
  onMoveBookmarkToWidget?: (bookmark: Bookmark, sourceWidgetId: string, targetWidgetId: string) => void;
  allWidgets?: any[];
}> = ({ widget, isEditMode, updateWidget, onBookmarkCountChange, onMoveBookmarkToWidget, allWidgets }) => {
  const lastBookmarkCountRef = useRef<number>(0);
  const listRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<BookmarkState>(() => {
    const saved = readLocal(widget.id, {
      bookmarks: DEFAULT_BOOKMARKS,
      categories: DEFAULT_CATEGORIES,
      activeCategoryId: 'default',
      showAddForm: false,
      newBookmark: { name: '', url: '', categoryId: 'default', tags: [] },
      editingId: undefined,
      editDraft: { name: '', url: '', tags: [] }
    });
    
    // widget.content에서 북마크 데이터가 있으면 사용 (공개페이지용)
    if (widget.content?.bookmarks && Array.isArray(widget.content.bookmarks)) {
      saved.bookmarks = widget.content.bookmarks;
    }
    
    return saved;
  });

  // 폴더명(위젯 제목) 초기 자동 지정: "새 폴더", "새 폴더(1)" ...
  // 마이그레이션: 기존 categories[0].name이 있으면 타이틀로 승격
  useEffect(() => {
    // 1. 마이그레이션: categories[0].name이 있으면 타이틀로 승격
    if ((!widget.title || !widget.title.trim()) && state.categories?.[0]?.name) {
      updateWidget?.(widget.id, { ...widget, title: state.categories[0].name });
      return;
    }
    
    // 2. 타이틀이 비어 있거나 '즐겨찾기'인 경우에만 자동 생성
    const currentTitle = (widget.title || '').trim();
    if (!currentTitle || currentTitle === '즐겨찾기') {
      const key = 'bookmark_folder_counter';
      const parsed = parseInt(localStorage.getItem(key) || '0', 10);
      const next = isNaN(parsed) ? 0 : parsed;
      const name = next === 0 ? '새 폴더' : `새 폴더(${next})`;
      try { localStorage.setItem(key, String(next + 1)); } catch {}
      updateWidget?.(widget.id, { ...widget, title: name });
    }
  }, [widget.id, widget.title, state.categories]);

  // 드래그 앤 드롭 순서 변경용 로컬 상태 (퍼시스트 필요 없음)
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  // 파비콘 로드 로직 제거 - SiteAvatar 컴포넌트에서 자동 처리

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

  // 모든 태그 추출
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    state.bookmarks.forEach(bm => {
      bm.tags?.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [state.bookmarks]);

  // 필터링된 북마크 반환
  const filteredBookmarks = useMemo(() => {
    let filtered = state.bookmarks;
    
    // 카테고리 필터
    if (state.activeCategoryId) {
      filtered = filtered.filter(bm => bm.categoryId === state.activeCategoryId);
    }
    
    // 태그 필터
    if (state.activeTag) {
      filtered = filtered.filter(bm => bm.tags?.includes(state.activeTag!));
    }

    return filtered;
  }, [state.bookmarks, state.activeCategoryId, state.activeTag]);

  // 더보기/접기 상태
  const [collapsed, setCollapsed] = useState(true);
  const VISIBLE_COUNT = 8; // 접힘 모드에서 보일 최대 개수

  // 보이는 북마크 계산
  const visibleBookmarks = useMemo(() => {
    return collapsed ? filteredBookmarks.slice(0, VISIBLE_COUNT) : filteredBookmarks;
  }, [collapsed, filteredBookmarks]);

  // 북마크 개수에 따라 위젯 높이 자동 조절 (디바운싱으로 안정화)
  useEffect(() => {
    const bookmarkCount = filteredBookmarks.length;
    
    // 북마크 개수가 변경되었을 때만 처리 (무한 루프 방지)
    if (bookmarkCount === lastBookmarkCountRef.current) {
      return;
    }
    
    // 디바운싱: 짧은 지연 후 업데이트 (레이아웃 안정화)
    const timer = setTimeout(() => {
      lastBookmarkCountRef.current = bookmarkCount;

      // 부모 컴포넌트에게 북마크 개수 변경 알림
      onBookmarkCountChange?.(bookmarkCount);

      // 북마크 개수에 따라 위젯 높이 자동 조절
      // 1-4개: 2칸 (1x2), 5-6개: 3칸 (1x3), 7-8개: 4칸 (1x4)
      let newHeight;
      if (bookmarkCount <= 4) {
        newHeight = 2;
      } else if (bookmarkCount <= 6) {
        newHeight = 3;
      } else if (bookmarkCount <= 8) {
        newHeight = 4;
      } else {
        // 9개 이상일 때는 더보기/접기 기능 사용하므로 4칸 고정
        newHeight = 4;
      }
      
      // 위젯의 현재 gridSize 가져오기
      const currentGridSize = (widget as any).gridSize || (widget as any).size || { w: 1, h: 2 };
      
      // 높이가 변경된 경우에만 업데이트
      if (newHeight !== currentGridSize.h && updateWidget) {
        // gridSize를 픽셀 높이로 변환 (북마크 위젯은 1칸 너비이므로 w는 1로 고정)
        const cellHeight = 160; // MyPage의 cellHeight와 일치해야 함
        const spacing = 12; // MyPage의 spacing과 일치해야 함
        const newHeightPx = newHeight * (cellHeight + spacing) - spacing;
        
        updateWidget(widget.id, {
          ...widget,
          gridSize: { w: 1, h: newHeight },
          size: { w: 1, h: newHeight },
          height: newHeightPx, // 픽셀 높이도 함께 업데이트
        });
      }
    }, 100); // 100ms 디바운싱

    return () => clearTimeout(timer);
  }, [filteredBookmarks.length, onBookmarkCountChange, updateWidget, widget]);

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

    // 최대 개수 제한 제거 (더보기/접기로 처리)

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
      categoryId: state.activeCategoryId || 'default',
      tags: state.newBookmark.tags || []
    };

    setState(prev => {
      const updatedBookmarks = [...prev.bookmarks, newBookmark];
      return {
        ...prev,
        bookmarks: updatedBookmarks,
                newBookmark: { name: '', url: '', tags: [] },
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
      // 디버그 모드에서만 로그 출력
      if ((import.meta as any).env?.DEV && e.key === 'F12') {
        // F12는 개발자 도구 단축키이므로 무시
        return;
      }
      // 필요시 여기에 단축키 핸들러 추가
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
      editDraft: { name: bm.name, url: bm.url, tags: bm.tags || [] }
    }));
  }, []);

  const cancelEdit = useCallback(() => {
    setState(prev => ({ ...prev, editingId: undefined, editDraft: { name: '', url: '', tags: [] } }));
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
        favicon: getFaviconUrl(normalizedUrl),
        tags: draft.tags || []
      } : bm);
      return {
        ...prev,
        bookmarks: updatedBookmarks,
        editingId: undefined,
        editDraft: { name: '', url: '', tags: [] }
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

  // 다른 즐겨찾기 위젯에서 드롭받기
  const handleExternalDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isEditMode) return;
    
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      if (data.type === 'bookmark' && data.widgetId && data.widgetId !== widget.id) {
        // 다른 북마크 위젯에서 온 북마크
        const sourceBookmark = state.bookmarks.find(bm => bm.id === data.bookmarkId);
        
        if (!sourceBookmark) {
          // 다른 위젯에서 온 북마크인 경우
          if (onMoveBookmarkToWidget && allWidgets) {
            const sourceWidget = allWidgets.find(w => w.id === data.widgetId);
            if (sourceWidget && sourceWidget.type === 'bookmark') {
              // 소스 위젯의 북마크 데이터 읽기
              const sourceBookmarks = readLocal(data.widgetId, { bookmarks: [] }).bookmarks || [];
              const bookmarkToMove = sourceBookmarks.find((bm: Bookmark) => bm.id === data.bookmarkId);
              
              if (bookmarkToMove) {
                // 소스 위젯에서 북마크 제거 (먼저 실행)
                if (onMoveBookmarkToWidget) {
                  onMoveBookmarkToWidget(bookmarkToMove, data.widgetId, widget.id);
                }
                
                // 현재 위젯에 북마크 추가
                setState(prev => ({
                  ...prev,
                  bookmarks: [...prev.bookmarks, { ...bookmarkToMove, id: Date.now().toString() }]
                }));
                
                showToast(`"${bookmarkToMove.name}"이(가) 이동되었습니다`, 'success');
              }
            }
          }
        }
      }
    } catch (error) {
      // 일반 드래그 처리 또는 파싱 실패
      console.warn('북마크 이동 실패:', error);
    }
  }, [widget.id, isEditMode, state.bookmarks, onMoveBookmarkToWidget, allWidgets]);

  return (
    <div 
      className="h-full flex flex-col"
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
      }}
      onDrop={handleExternalDrop}
    >
      {/* 위젯 타이틀 편집 (편집모드에서 표시) */}
      {isEditMode && updateWidget && (
        <div className="px-2.5 pt-2">
          <input
            type="text"
            defaultValue={widget.title || ''}
            placeholder="위젯 제목"
            onBlur={(e) => updateWidget(widget.id, { ...widget, title: e.target.value })}
            className="w-full text-sm px-2 py-1 border border-gray-300 dark:border-[var(--border)] rounded bg-white dark:bg-[var(--input-background)] text-gray-900 dark:text-[var(--foreground)]"
          />
        </div>
      )}
      {/* 태그 필터 */}
      {isEditMode && allTags.length > 0 && (
        <div className="px-2.5 pt-2 flex flex-wrap gap-1 mb-2">
          {state.activeTag && (
            <button
              onClick={() => setState(prev => ({ ...prev, activeTag: undefined }))}
              className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
            >
              필터 해제
            </button>
          )}
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setState(prev => ({ ...prev, activeTag: prev.activeTag === tag ? undefined : tag }))}
              className={`text-xs px-2 py-1 rounded transition-colors ${
                state.activeTag === tag
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* 북마크 리스트 (세로 배치) - 스크롤 제거 */}
      {/* 내부 폴더 헤더 제거: 폴더명은 위젯 타이틀 바(WidgetShell)에서만 사용 */}
      <div 
        ref={listRef}
        className="space-y-2 mb-3 flex-1 min-h-0 overflow-y-auto px-2.5 pt-2 scrollbar-none"
        onDragOver={(e) => e.preventDefault()}
      >
        {/* 붙여넣기 기능 제거 */}
        {visibleBookmarks.map((bookmark, index) => {
          const isEditing = state.editingId === bookmark.id;
          return (
            <div key={bookmark.id}>
              <div 
                className={`relative group ${dragOverId === bookmark.id ? 'ring-2 ring-blue-300 rounded' : ''} ${isEditing ? 'mb-2' : ''}`}
                draggable={isEditMode && !isEditing}
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
                  onClick={() => !isEditing && openBookmark(bookmark.url)}
                  className="w-full p-2 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center gap-1.5"
                  aria-label={`${bookmark.name} 열기`}
                >
                  {/* 로고 */}
                  <div className="flex-shrink-0">
                    <SiteAvatar url={bookmark.url} name={bookmark.name} size={20} />
                  </div>
                  
                  {/* 사이트 이름과 태그 */}
                  <div className="flex-1 text-left min-w-0">
                    <div className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">
                      {bookmark.name}
                    </div>
                    {bookmark.tags && bookmark.tags.length > 0 && (
                      <div className="flex flex-wrap gap-0.5 mt-0.5">
                        {bookmark.tags.slice(0, 3).map(tag => (
                          <span
                            key={tag}
                            onClick={(e) => {
                              e.stopPropagation();
                              setState(prev => ({ ...prev, activeTag: prev.activeTag === tag ? undefined : tag }));
                            }}
                            className={`text-[10px] px-1 py-0.5 rounded ${
                              state.activeTag === tag 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                            } cursor-pointer hover:bg-blue-400 transition-colors`}
                          >
                            {tag}
                          </span>
                        ))}
                        {bookmark.tags.length > 3 && (
                          <span className="text-[10px] text-gray-400">+{bookmark.tags.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* 외부 링크 아이콘 */}
                  {!isEditing && (
                    <ExternalLink className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  )}
                </button>
                
                {/* 편집/삭제 버튼 */}
                {!isEditing && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startEdit(bookmark);
                      }}
                      className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-blue-600"
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
                      className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                      aria-label="북마크 삭제"
                      title="삭제"
                    >
                      ×
                    </button>
                  </div>
                )}
                
                {/* 드래그 핸들 시각 강화 (왼쪽 바) */}
                {isEditMode && !isEditing && (
                  <div className="absolute -left-2 top-0 bottom-0 w-1.5 rounded-l bg-gradient-to-b from-gray-300 to-gray-200 opacity-0 group-hover:opacity-100" />
                )}
              </div>
              
              {/* 인라인 편집 폼 (해당 항목 바로 아래에 표시) */}
              {isEditing && (
                <div 
                  className="p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg mb-2 shadow-sm"
                  ref={(el) => {
                    // 편집 폼이 보이도록 스크롤
                    if (el && listRef.current) {
                      setTimeout(() => {
                        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                      }, 100);
                    }
                  }}
                >
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={state.editDraft?.name || ''}
                      onChange={(e) => setState(prev => ({ ...prev, editDraft: { ...(prev.editDraft || { name: '', url: '' }), name: e.target.value } }))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          saveEdit(state.editingId!);
                        } else if (e.key === 'Escape') {
                          cancelEdit();
                        }
                      }}
                      placeholder="사이트 이름"
                      className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      autoFocus
                    />
                    <input
                      type="url"
                      value={state.editDraft?.url || ''}
                      onChange={(e) => setState(prev => ({ ...prev, editDraft: { ...(prev.editDraft || { name: '', url: '' }), url: e.target.value } }))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          saveEdit(state.editingId!);
                        } else if (e.key === 'Escape') {
                          cancelEdit();
                        }
                      }}
                      placeholder="https://example.com"
                      className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    />
                    <input
                      type="text"
                      value={state.editDraft?.tags?.join(', ') || ''}
                      onChange={(e) => {
                        const tags = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
                        setState(prev => ({ ...prev, editDraft: { ...(prev.editDraft || { name: '', url: '' }), tags } }));
                      }}
                      placeholder="태그 (쉼표로 구분)"
                      className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    />
                    <div className="flex gap-2 justify-end pt-1">
                      <Button 
                        size="sm" 
                        className="h-7 text-xs px-3" 
                        onClick={() => saveEdit(state.editingId!)}
                      >
                        <Check className="w-3 h-3 mr-1" /> 저장
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-7 text-xs px-3 border-gray-300 dark:border-gray-600" 
                        onClick={cancelEdit}
                      >
                        <XIcon className="w-3 h-3 mr-1" /> 취소
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 더보기/접기 버튼 */}
      {filteredBookmarks.length > VISIBLE_COUNT && (
        <div className="px-2.5 pb-2 flex-shrink-0">
          <button
            className="w-full py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:underline transition-colors"
            onClick={() => setCollapsed(v => !v)}
          >
            {collapsed 
              ? `더보기 (${filteredBookmarks.length - VISIBLE_COUNT}개)` 
              : '접기'}
          </button>
        </div>
      )}
      
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
          <input
            type="text"
            value={state.newBookmark.tags?.join(', ') || ''}
            onChange={(e) => {
              const tags = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
              setState(prev => ({ 
                ...prev, 
                newBookmark: { ...prev.newBookmark, tags } 
              }));
            }}
            placeholder="태그 (쉼표로 구분)"
            className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded"
            aria-label="태그 입력"
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
                newBookmark: { name: '', url: '', tags: [] } 
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
