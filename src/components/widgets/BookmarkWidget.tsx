// 북마크 위젯 - 파비콘 자동, URL 정규화, 인라인 추가 폼, 재정렬 기능
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '../ui/button';
import { Plus, Trash2, ArrowUp, ArrowDown, ExternalLink, Edit, Check, X as XIcon } from 'lucide-react';
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
}

interface BookmarkState {
  bookmarks: Bookmark[];
  showAddForm: boolean;
  newBookmark: {
    name: string;
    url: string;
  };
  editingId?: string;
  editDraft?: { name: string; url: string };
  // 전송 기능 제거
}

const DEFAULT_BOOKMARKS: Bookmark[] = [];

export const BookmarkWidget: React.FC<WidgetProps> = ({ widget, isEditMode, updateWidget }) => {
  const [state, setState] = useState<BookmarkState>(() => {
    const saved = readLocal(widget.id, {
      bookmarks: DEFAULT_BOOKMARKS,
      showAddForm: false,
      newBookmark: { name: '', url: '' },
      editingId: undefined,
      editDraft: { name: '', url: '' }
    });
    return saved;
  });

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

  // 북마크 개수에 따라 위젯 크기 자동 조절
  useEffect(() => {
    const bookmarkCount = state.bookmarks.length;
    let newHeight = 2; // 기본 1x2

    if (bookmarkCount > 5) {
      newHeight = 4; // 1x4 (6-8개)
    } else if (bookmarkCount > 3) {
      newHeight = 3; // 1x3 (4-5개)
    } else {
      newHeight = 2; // 1x2 (1-3개)
    }

    // 현재 gridSize와 다르면 업데이트
    const currentGridSize = widget.gridSize || { w: 1, h: 2 };
    if (currentGridSize.h !== newHeight) {
      updateWidget(widget.id, { ...widget, gridSize: { w: 1, h: newHeight } });
    }
  }, [state.bookmarks.length, widget, updateWidget]);

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
      favicon: getFaviconUrl(normalizedUrl)
    };

    setState(prev => ({
      ...prev,
      bookmarks: [...prev.bookmarks, newBookmark],
      newBookmark: { name: '', url: '' },
      showAddForm: false
    }));
    
    showToast('북마크 추가됨', 'success');
  }, [state.newBookmark, state.bookmarks, getDomainIcon]);

  const deleteBookmark = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      bookmarks: prev.bookmarks.filter(bookmark => bookmark.id !== id)
    }));
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

  // DnD: 시작
  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    if (!isEditMode) return;
    setDraggingId(id);
    e.dataTransfer.effectAllowed = 'move';
    // 파이어폭스 호환: setData 필요
    e.dataTransfer.setData('text/plain', id);
  }, [isEditMode]);

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

    setState(prev => ({
      ...prev,
      bookmarks: prev.bookmarks.map(bm => bm.id === id ? {
        ...bm,
        name,
        url: normalizedUrl,
        icon: getDomainIcon(normalizedUrl),
        favicon: getFaviconUrl(normalizedUrl)
      } : bm),
      editingId: undefined,
      editDraft: { name: '', url: '' }
    }));
    showToast('수정되었습니다', 'success');
  }, [state.editDraft, getDomainIcon]);

  // 전송/붙여넣기 기능 제거(드래그로 이동하세요)

  const openBookmark = useCallback((url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  }, []);

  // 북마크 목록 (검색/필터링 없이 그대로 사용)
  const filteredBookmarks = useMemo(() => {
    return state.bookmarks;
  }, [state.bookmarks]);

  return (
    <div className="p-2 px-2.5">
      {/* 북마크 리스트 (세로 배치) */}
      <div className="space-y-2 mb-3">
        {/* 붙여넣기 기능 제거 */}
        {filteredBookmarks.map((bookmark, index) => (
          <div 
            key={bookmark.id}
            className={`relative group ${dragOverId === bookmark.id ? 'ring-2 ring-blue-300 rounded' : ''}`}
            draggable={isEditMode}
            onDragStart={(e) => handleDragStart(e, bookmark.id)}
            onDragOver={(e) => handleDragOver(e, bookmark.id)}
            onDrop={(e) => handleDrop(e, bookmark.id)}
            onDragEnd={handleDragEnd}
          >
            <button
              onClick={() => openBookmark(bookmark.url)}
              className="w-full p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-1.5"
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
                placeholder="사이트 이름"
                className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
              />
              <input
                type="url"
                value={state.editDraft?.url || ''}
                onChange={(e) => setState(prev => ({ ...prev, editDraft: { ...(prev.editDraft || { name: '', url: '' }), url: e.target.value } }))}
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

        {/* 페이지 추가 버튼 (하나만 표시) */}
        {isEditMode && state.bookmarks.length < 8 && (
          <button 
            className="w-full p-2 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 flex items-center justify-center transition-colors cursor-pointer"
            onClick={() => setState(prev => ({ ...prev, showAddForm: true }))}
          >
            <Plus className="w-4 h-4 mr-1 text-gray-400" />
            <div className="text-gray-400 text-xs">사이트 추가</div>
          </button>
        )}
      </div>

      {/* 북마크 추가 폼 */}
      {isEditMode && state.showAddForm && (
        <div className="space-y-2 p-2 bg-gray-50 rounded">
          <input
            type="text"
            value={state.newBookmark.name}
            onChange={(e) => setState(prev => ({ 
              ...prev, 
              newBookmark: { ...prev.newBookmark, name: e.target.value } 
            }))}
            placeholder="사이트 이름"
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
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
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
            aria-label="URL 입력"
          />
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
              className="h-6 text-xs"
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
