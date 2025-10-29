// 통합검색 위젯 - 여러 검색 엔진 통합
import React, { useState } from 'react';
import { ChevronDown, Search as SearchIcon } from 'lucide-react';
import { WidgetProps, persistOrLocal, readLocal } from './utils/widget-helpers';

interface SearchEngine {
  id: string;
  name: string;
  url: string;
  icon: string;
  color: string;
}

const SEARCH_ENGINES: SearchEngine[] = [
  { id: 'google', name: 'Google', url: 'https://www.google.com/search?q=', icon: 'G', color: '#4285F4' },
  { id: 'naver', name: 'Naver', url: 'https://search.naver.com/search.naver?query=', icon: 'N', color: '#03C75A' },
  { id: 'yahoo', name: 'Yahoo', url: 'https://search.yahoo.com/search?p=', icon: 'Y', color: '#720E9E' },
  { id: 'bing', name: 'Bing', url: 'https://www.bing.com/search?q=', icon: 'B', color: '#008373' },
  { id: 'daum', name: 'Daum', url: 'https://search.daum.net/search?q=', icon: 'D', color: '#FF5722' },
  { id: 'law', name: '법제처', url: 'https://www.law.go.kr/LSW/lsLinkProc.do?lsNm=', icon: '법', color: '#4A90E2' }
];

interface UnifiedSearchState {
  selectedEngine: string;
  searchQuery: string;
}

const DEFAULT_STATE: UnifiedSearchState = {
  selectedEngine: 'google',
  searchQuery: ''
};

export const UnifiedSearchWidget = ({ widget, isEditMode, updateWidget }: WidgetProps) => {
  const [state, setState] = useState(() => {
    const saved = readLocal(widget.id, DEFAULT_STATE);
    return saved;
  });

  const [showEngineList, setShowEngineList] = useState(false);

  const selectedEngineData = SEARCH_ENGINES.find(e => e.id === state.selectedEngine) || SEARCH_ENGINES[0];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (state.searchQuery.trim()) {
      const searchUrl = selectedEngineData.url + encodeURIComponent(state.searchQuery);
      window.open(searchUrl, '_blank');
    }
  };

  const selectEngine = (engineId: string) => {
    setState(prev => ({ ...prev, selectedEngine: engineId }));
    setShowEngineList(false);
  };

  // 상태 저장
  React.useEffect(() => {
    persistOrLocal(widget.id, state, updateWidget);
  }, [widget.id, state, updateWidget]);

  return (
    <div className="p-3 h-full flex flex-col items-center justify-center min-h-0">
      <form onSubmit={handleSearch} className="w-full flex flex-col items-center justify-center flex-1">
        <div className="relative">
          {/* 통합 검색바 */}
          <div className="flex items-center bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-full shadow-md hover:shadow-lg transition-shadow">
            {/* 검색 엔진 선택 버튼 */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowEngineList(!showEngineList)}
                className="flex items-center gap-1 px-2.5 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-l-full transition-colors"
                style={{ borderRight: '1px solid #e5e7eb' }}
              >
                <span 
                  className="text-sm font-semibold"
                  style={{ color: selectedEngineData.color }}
                >
                  {selectedEngineData.icon}
                </span>
                <span className="text-xs text-gray-600 dark:text-gray-400 ml-1">
                  {selectedEngineData.name}
                </span>
                <ChevronDown className="w-3 h-3 text-gray-500" />
              </button>

              {/* 검색 엔진 목록 드롭다운 */}
              {showEngineList && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowEngineList(false)}
                  />
                  <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-20 min-w-[140px]">
                    {SEARCH_ENGINES.map(engine => (
                      <button
                        key={engine.id}
                        type="button"
                        onClick={() => selectEngine(engine.id)}
                        className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg ${
                          state.selectedEngine === engine.id ? 'bg-blue-50 dark:bg-blue-900/30' : ''
                        }`}
                      >
                        <span 
                          className="text-sm font-semibold"
                          style={{ color: engine.color }}
                        >
                          {engine.icon}
                        </span>
                        <span className="text-sm text-gray-700 dark:text-gray-300">{engine.name}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            
            {/* 검색 입력 필드 */}
            <input
              type="text"
              value={state.searchQuery}
              onChange={(e) => setState(prev => ({ ...prev, searchQuery: e.target.value }))}
              placeholder={`${selectedEngineData.name} 검색`}
              className="flex-1 px-2.5 py-1.5 text-sm border-none outline-none bg-transparent placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100"
            />
            
            {/* 검색 버튼 */}
            <button
              type="submit"
              className="p-1.5 rounded-r-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="검색"
            >
              <SearchIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

