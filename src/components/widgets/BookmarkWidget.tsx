import React, { useState, useEffect } from 'react';
import { Favicon } from '../Favicon';

interface BookmarkWidgetProps {
  id: string;
  onRemove: (id: string) => void;
}

interface Bookmark {
  id: string;
  title: string;
  url: string;
}

export function BookmarkWidget({ id, onRemove }: BookmarkWidgetProps) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');

  useEffect(() => {
    // 로컬 스토리지에서 북마크 불러오기
    const savedBookmarks = localStorage.getItem(`bookmark-widget-${id}`);
    if (savedBookmarks) {
      setBookmarks(JSON.parse(savedBookmarks));
    }
  }, [id]);

  const saveBookmarks = (updatedBookmarks: Bookmark[]) => {
    setBookmarks(updatedBookmarks);
    localStorage.setItem(`bookmark-widget-${id}`, JSON.stringify(updatedBookmarks));
  };

  const addBookmark = () => {
    if (newTitle.trim() && newUrl.trim()) {
      const newBookmark: Bookmark = {
        id: Date.now().toString(),
        title: newTitle.trim(),
        url: newUrl.trim().startsWith('http') ? newUrl.trim() : `https://${newUrl.trim()}`
      };
      
      saveBookmarks([...bookmarks, newBookmark]);
      setNewTitle('');
      setNewUrl('');
      setIsAdding(false);
    }
  };

  const removeBookmark = (bookmarkId: string) => {
    saveBookmarks(bookmarks.filter(b => b.id !== bookmarkId));
  };

  return (
    <div className="bg-white p-3 rounded-lg shadow-sm border h-full relative">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-medium text-gray-800">📖 북마크</h3>
        <div className="flex gap-1">
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="text-blue-500 hover:text-blue-700 text-xs"
          >
            +
          </button>
          <button
            onClick={() => onRemove(id)}
            className="text-red-500 hover:text-red-700 text-xs"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="space-y-2 max-h-40 overflow-y-auto">
        {isAdding && (
          <div className="space-y-2 p-2 bg-gray-50 rounded">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="제목"
              className="w-full px-2 py-1 border rounded text-xs"
            />
            <input
              type="text"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="URL"
              className="w-full px-2 py-1 border rounded text-xs"
            />
            <div className="flex gap-1">
              <button
                onClick={addBookmark}
                className="flex-1 bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
              >
                추가
              </button>
              <button
                onClick={() => {
                  setIsAdding(false);
                  setNewTitle('');
                  setNewUrl('');
                }}
                className="flex-1 bg-gray-500 text-white px-2 py-1 rounded text-xs hover:bg-gray-600"
              >
                취소
              </button>
            </div>
          </div>
        )}

        {bookmarks.map((bookmark) => {
          const domain = (() => {
            try {
              return new URL(bookmark.url).hostname;
            } catch {
              return bookmark.url;
            }
          })();

          return (
            <div key={bookmark.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded hover:bg-gray-100">
              <Favicon domain={domain} size={12} className="w-3 h-3 flex-shrink-0" />
              <a
                href={bookmark.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-xs text-blue-600 hover:underline truncate"
                title={bookmark.title}
              >
                {bookmark.title}
              </a>
              <button
                onClick={() => removeBookmark(bookmark.id)}
                className="text-red-500 hover:text-red-700 text-xs"
              >
                ×
              </button>
            </div>
          );
        })}

        {bookmarks.length === 0 && !isAdding && (
          <p className="text-xs text-gray-500 text-center py-4">
            + 버튼을 눌러 북마크를 추가하세요
          </p>
        )}
      </div>
    </div>
  );
}