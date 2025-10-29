import React, { useState, useCallback } from 'react';
import { Search, Keyboard, Mic, Camera } from 'lucide-react';
import { WidgetShell, WidgetProps } from './WidgetShell';
import { trackEvent } from '../../utils/analytics';

export function GoogleSearchWidget({ id, title, size = 'm', onRemove, onResize, onPin }: WidgetProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    trackEvent('widget_action', { type: 'search', widget: 'google_search', query: q });
    window.open(`https://www.google.com/search?q=${encodeURIComponent(q)}`, '_blank');
  }, [searchQuery]);

  return (
    <WidgetShell
      variant="bare" // ★ 카드 크롬 제거로 중첩 카드 느낌 방지
      icon={<Search className="w-4 h-4 text-gray-600" aria-hidden="true" />}
      title={title || '구글 검색'}
      size={size}
      onRemove={onRemove ? () => onRemove(id) : undefined}
      onResize={onResize ? (newSize) => onResize(id, newSize) : undefined}
      onPin={onPin ? () => onPin(id) : undefined}
      contentClassName="w-full h-full flex flex-col items-center justify-center min-h-0"
    >
      {/* 로고는 헤더처럼 보이지 않게 간단히 */}
      <div className="mb-3 text-lg font-bold leading-none">
        <span className="text-blue-500">G</span>
        <span className="text-red-500">o</span>
        <span className="text-yellow-500">o</span>
        <span className="text-blue-500">g</span>
        <span className="text-green-500">l</span>
        <span className="text-red-500">e</span>
      </div>

      <form onSubmit={handleSearch} className="w-full">
        <div className="flex items-center gap-1 rounded-full border border-gray-300 bg-white/80 backdrop-blur px-2 py-1.5 shadow-sm focus-within:ring-2 focus-within:ring-blue-500">
          <Search className="w-4 h-4 text-gray-400" aria-hidden="true" />
          <input
            type="text"
            placeholder="Google 검색 또는 URL 입력"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm"
          />
          <button type="button" aria-label="키보드" className="p-1 rounded-full hover:bg-gray-100">
            <Keyboard className="w-4 h-4 text-gray-500" aria-hidden="true" />
          </button>
          <button type="button" aria-label="음성 검색" className="p-1 rounded-full hover:bg-gray-100">
            <Mic className="w-4 h-4 text-gray-500" aria-hidden="true" />
          </button>
          <button type="button" aria-label="이미지 검색" className="p-1 rounded-full hover:bg-gray-100">
            <Camera className="w-4 h-4 text-gray-500" aria-hidden="true" />
          </button>
        </div>
      </form>
    </WidgetShell>
  );
}
