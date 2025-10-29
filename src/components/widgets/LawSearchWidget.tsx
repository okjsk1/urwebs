import React, { useState, useCallback } from 'react';
import { Search, Scale } from 'lucide-react';
import { WidgetShell, WidgetProps } from './WidgetShell';
import { trackEvent } from '../../utils/analytics';

export function LawSearchWidget({ id, title, size = 'm', onRemove, onResize, onPin }: WidgetProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    trackEvent('widget_action', { type: 'search', widget: 'law_search', query: q });
    window.open(`https://www.law.go.kr/LSW/lsInfoP.do?efYd=${new Date().toISOString().split('T')[0].replace(/-/g, '')}&lsiSeq=${encodeURIComponent(q)}`, '_blank');
  }, [searchQuery]);

  return (
    <WidgetShell
      variant="bare" // ★ 카드 크롬 제거로 중첩 카드 느낌 방지
      icon={<Scale className="w-4 h-4 text-gray-600" aria-hidden="true" />}
      title={title || '법제처 검색'}
      size={size}
      onRemove={onRemove ? () => onRemove(id) : undefined}
      onResize={onResize ? (newSize) => onResize(id, newSize) : undefined}
      onPin={onPin ? () => onPin(id) : undefined}
      contentClassName="w-full h-full flex flex-col items-center justify-center min-h-0"
    >
      {/* 로고는 헤더처럼 보이지 않게 간단히 */}
      <div className="mb-3 text-sm font-bold leading-none text-purple-600">
        법제처
      </div>

      <form onSubmit={handleSearch} className="w-full">
        <div className="flex items-center gap-2 rounded-full border border-gray-300 bg-white/80 backdrop-blur px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-500">
          <select className="px-2 py-1 text-sm border-none focus:outline-none bg-transparent text-blue-600 font-medium">
            <option>현행법령</option>
            <option>법령해석례</option>
            <option>행정규칙</option>
          </select>
          <div className="w-px h-6 bg-gray-300"></div>
          <input
            type="text"
            placeholder="검색어를 입력하세요"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm"
          />
          <button type="submit" className="p-2 bg-blue-500 hover:bg-blue-600 rounded focus:outline-none">
            <Search className="w-4 h-4 text-white" aria-hidden="true" />
          </button>
        </div>
      </form>
    </WidgetShell>
  );
}
