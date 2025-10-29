import React, { useState, useCallback } from 'react';
import { Search } from 'lucide-react';
import { WidgetShell, WidgetProps } from './WidgetShell';
import { trackEvent } from '../../utils/analytics';

export function NaverSearchWidget({ id, title, size = 'm', onRemove, onResize, onPin }: WidgetProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    trackEvent('widget_action', { type: 'search', widget: 'naver_search', query: q });
    window.open(`https://search.naver.com/search.naver?query=${encodeURIComponent(q)}`, '_blank');
  }, [searchQuery]);

  return (
    <WidgetShell
      variant="bare" // ★ 카드 크롬 제거로 중첩 카드 느낌 방지
      icon={<Search className="w-4 h-4 text-gray-600" aria-hidden="true" />}
      title={title || '네이버 검색'}
      size={size}
      onRemove={onRemove ? () => onRemove(id) : undefined}
      onResize={onResize ? (newSize) => onResize(id, newSize) : undefined}
      onPin={onPin ? () => onPin(id) : undefined}
      contentClassName="w-full flex flex-col items-center justify-center"
    >
      {/* 로고는 헤더처럼 보이지 않게 간단히 */}
      <div className="mb-3 text-lg font-bold leading-none text-green-600">
        NAVER
      </div>

      <form onSubmit={handleSearch} className="w-full">
        <div className="flex items-center gap-1 rounded-full border border-gray-300 bg-white/80 backdrop-blur px-2 py-1.5 shadow-sm focus-within:ring-2 focus-within:ring-green-500">
          <Search className="w-4 h-4 text-gray-400" aria-hidden="true" />
          <input
            type="text"
            placeholder="검색어를 입력해 주세요"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm"
          />
          <button type="submit" className="p-1.5 bg-green-500 hover:bg-green-600 rounded-full focus:outline-none">
            <Search className="w-4 h-4 text-white" aria-hidden="true" />
          </button>
        </div>
      </form>
    </WidgetShell>
  );
}
