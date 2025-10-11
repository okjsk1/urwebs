// 북마크 위젯 - 파비콘 자동, URL 정규화, 인라인 추가 폼, 재정렬 기능
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '../ui/button';
import { Plus, Trash2, ArrowUp, ArrowDown, ExternalLink } from 'lucide-react';
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
}

const DEFAULT_BOOKMARKS: Bookmark[] = [
  { id: '1', name: 'Google', url: 'https://www.google.com', icon: '🔍' },
  { id: '2', name: 'GitHub', url: 'https://github.com', icon: '🐙' },
  { id: '3', name: 'YouTube', url: 'https://www.youtube.com', icon: '📺' },
  { id: '4', name: 'Naver', url: 'https://www.naver.com', icon: '🌐' }
];

export const BookmarkWidget: React.FC<WidgetProps> = ({ widget, isEditMode, updateWidget }) => {
  const [state, setState] = useState<BookmarkState>(() => {
    const saved = readLocal(widget.id, {
      bookmarks: DEFAULT_BOOKMARKS,
      showAddForm: false,
      newBookmark: { name: '', url: '' }
    });
    return saved;
  });

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

  // 상태 저장
  useEffect(() => {
    persistOrLocal(widget.id, state, updateWidget);
  }, [widget.id, updateWidget]);

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

    const newBookmark: Bookmark = {
      id: Date.now().toString(),
      name: name.trim(),
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

  const openBookmark = useCallback((url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  }, []);

  // 북마크 목록 (검색/필터링 없이 그대로 사용)
  const filteredBookmarks = useMemo(() => {
    return state.bookmarks;
  }, [state.bookmarks]);

  return (
    <div className="p-3">
      {/* 북마크 리스트 (세로 배치) */}
      <div className="space-y-2 mb-3">
        {filteredBookmarks.map((bookmark, index) => (
          <div key={bookmark.id} className="relative group">
            <button
              onClick={() => openBookmark(bookmark.url)}
              className="w-full p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
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
            
            {/* 삭제 버튼 (호버 시 X 버튼) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteBookmark(bookmark.id);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="북마크 삭제"
            >
              ×
            </button>
            
            {isEditMode && (
              <div className="absolute -left-8 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    moveBookmark(bookmark.id, 'up');
                  }}
                  disabled={index === 0}
                  className="w-5 h-5 bg-blue-500 text-white rounded-full text-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  aria-label="위로 이동"
                >
                  <ArrowUp className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    moveBookmark(bookmark.id, 'down');
                  }}
                  disabled={index === filteredBookmarks.length - 1}
                  className="w-5 h-5 bg-blue-500 text-white rounded-full text-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  aria-label="아래로 이동"
                >
                  <ArrowDown className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        ))}
        
        {/* 페이지 추가 버튼 (하나만 표시) */}
        {isEditMode && state.bookmarks.length < 8 && (
          <button 
            className="w-full p-2 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 flex items-center justify-center transition-colors cursor-pointer"
            onClick={() => setState(prev => ({ ...prev, showAddForm: true }))}
          >
            <Plus className="w-4 h-4 mr-1 text-gray-400" />
            <div className="text-gray-400 text-xs">페이지 추가</div>
          </button>
        )}
      </div>

      {/* 북마크 추가 폼 */}
      {isEditMode && (
        <div className="space-y-2">
          {!state.showAddForm ? (
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full h-6 text-xs"
              onClick={() => setState(prev => ({ ...prev, showAddForm: true }))}
              disabled={state.bookmarks.length >= 8}
            >
              <Plus className="w-3 h-3 mr-1" />
              사이트 추가
            </Button>
          ) : (
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
      )}
    </div>
  );
};
