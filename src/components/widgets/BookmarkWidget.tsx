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
      {/* 북마크 그리드 */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {filteredBookmarks.map((bookmark, index) => (
          <div key={bookmark.id} className="relative group">
            <button
              onClick={() => openBookmark(bookmark.url)}
              className="w-full p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
              aria-label={`${bookmark.name} 열기`}
            >
              <div className="flex items-center gap-2 mb-1">
                {bookmark.favicon ? (
                  <img 
                    src={bookmark.favicon} 
                    alt="" 
                    className="w-4 h-4 flex-shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <span className="text-sm">{bookmark.icon}</span>
                )}
                <ExternalLink className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="text-xs font-medium text-gray-800 truncate text-left">
                {bookmark.name}
              </div>
              <div className="text-xs text-gray-500 truncate text-left">
                {new URL(normalizeUrl(bookmark.url)).hostname}
              </div>
            </button>
            
            {isEditMode && (
              <div className="absolute -top-1 -right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    moveBookmark(bookmark.id, 'up');
                  }}
                  disabled={index === 0}
                  className="w-4 h-4 bg-blue-500 text-white rounded-full text-xs disabled:opacity-50 disabled:cursor-not-allowed"
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
                  className="w-4 h-4 bg-blue-500 text-white rounded-full text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="아래로 이동"
                >
                  <ArrowDown className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteBookmark(bookmark.id);
                  }}
                  className="w-4 h-4 bg-red-500 text-white rounded-full text-xs"
                  aria-label="북마크 삭제"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        ))}
        
        {/* 빈 슬롯 표시 */}
        {Array.from({ length: Math.max(0, 8 - state.bookmarks.length) }).map((_, index) => (
          <div key={`empty-${index}`} className="p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
            <div className="text-gray-400 text-xs">빈 슬롯</div>
          </div>
        ))}
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
