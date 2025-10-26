import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { trackEvent, ANALYTICS_EVENTS } from '../../utils/analytics';

export function TemplateChipsSearch() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    '#개인용',
    '#디자인/건축',
    '#부동산',
    '#금융/투자',
    '#학생',
    '#개발자',
    '#마케터',
    '#자영업',
    '#캠핑/여행'
  ];

  const handleCategoryClick = (category: string) => {
    const tag = category.replace('#', '');
    trackEvent(ANALYTICS_EVENTS.CATEGORY_CLICK, { category: tag });
    navigate(`/templates?tag=${encodeURIComponent(tag)}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      trackEvent(ANALYTICS_EVENTS.SEARCH_QUERY, { query: searchQuery.trim() });
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="flex flex-nowrap items-center gap-3">
      {/* 카테고리 칩들 */}
      <div className="flex flex-nowrap items-center gap-3 overflow-x-auto scrollbar-hide">
        {categories.map((category, index) => (
          <button
            key={index}
            onClick={() => handleCategoryClick(category)}
            className="whitespace-nowrap rounded-full border bg-white px-3 py-1 text-sm shadow-sm hover:bg-slate-50 transition-colors"
          >
            {category}
          </button>
        ))}
      </div>

      {/* 검색 입력 */}
      <div className="w-[380px] shrink-0 relative">
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="템플릿 또는 사용자 검색"
            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="검색"
          >
            <Search className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
