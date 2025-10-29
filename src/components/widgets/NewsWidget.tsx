import React, { useState, useEffect, useCallback } from 'react';
import { Newspaper, Plus, Settings, ExternalLink, Clock, Hash } from 'lucide-react';
import { WidgetShell } from './WidgetShell';
import { usePersist } from '../../hooks/usePersist';
import { trackEvent } from '../../utils/analytics';

export interface FeedConfig {
  url: string;
  include?: string[];
  exclude?: string[];
  lang?: 'ko' | 'en';
}

export interface NewsItem {
  id: string;
  title: string;
  link: string;
  source: string;
  ts: number;
  summary?: string;
}

export interface NewsState {
  feeds: FeedConfig[];
  items: NewsItem[];
  lastFetched?: number;
  refreshInterval: number; // 분 단위
  interests?: string[]; // 사용자 관심사 키워드
}

export interface NewsWidgetProps {
  id: string;
  title?: string;
  size?: 's' | 'm' | 'l';
  onRemove?: (id: string) => void;
  onResize?: (id: string, size: 's' | 'm' | 'l') => void;
  onPin?: (id: string) => void;
  isPinned?: boolean;
}

const REFRESH_INTERVALS = [5, 10, 15, 30]; // 분 단위

export function NewsWidget({
  id,
  title = '뉴스 요약',
  size = 'm',
  onRemove,
  onResize,
  onPin,
  isPinned = false
}: NewsWidgetProps) {
  const [state, setState] = usePersist<NewsState>({
    key: `news_${id}`,
    initialValue: {
      feeds: [],
      items: [],
      refreshInterval: 10
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [newFeedUrl, setNewFeedUrl] = useState('');
  const INTEREST_OPTIONS = ['IT', '경제', '주식', '코인', '스포츠', '연예', '정치', '세계', '자동차'];

  // RSS 파싱 함수 (간단한 구현)
  const parseRSS = async (url: string): Promise<NewsItem[]> => {
    try {
      // CORS 문제로 인해 실제로는 프록시 서버를 사용해야 함
      // 여기서는 더미 데이터를 반환
      const response = await fetch(`/api/proxy-rss?url=${encodeURIComponent(url)}`);
      if (!response.ok) {
        throw new Error('RSS 파싱 실패');
      }
      
      const text = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/xml');
      
      const items = Array.from(doc.querySelectorAll('item')).map((item, index) => {
        const title = item.querySelector('title')?.textContent || '';
        const link = item.querySelector('link')?.textContent || '';
        const pubDate = item.querySelector('pubDate')?.textContent || '';
        const description = item.querySelector('description')?.textContent || '';
        
        return {
          id: `${url}_${index}`,
          title,
          link,
          source: new URL(url).hostname,
          ts: new Date(pubDate).getTime(),
          summary: description.substring(0, 200) + '...'
        };
      });
      
      return items.slice(0, 10); // 최대 10개
    } catch (error) {
      console.warn('RSS 파싱 실패:', error);
      // 더미 데이터 반환
      return [
        {
          id: `${url}_dummy_1`,
          title: '샘플 뉴스 제목 1',
          link: '#',
          source: new URL(url).hostname,
          ts: Date.now() - 3600000,
          summary: '이것은 샘플 뉴스 요약입니다. 실제 RSS 피드가 연결되면 실제 뉴스가 표시됩니다.'
        },
        {
          id: `${url}_dummy_2`,
          title: '샘플 뉴스 제목 2',
          link: '#',
          source: new URL(url).hostname,
          ts: Date.now() - 7200000,
          summary: '뉴스 요약 기능을 테스트하기 위한 샘플 데이터입니다.'
        }
      ];
    }
  };

  // 요약 생성 함수
  const generateSummary = (text: string): string => {
    // 간단한 요약 로직: 첫 2-3문장 추출
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    return sentences.slice(0, 2).join('. ') + '.';
  };

  // 피드 새로고침
  const refreshFeeds = useCallback(async () => {
    if (state.feeds.length === 0) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const allItems: NewsItem[] = [];
      
      for (const feed of state.feeds) {
        const items = await parseRSS(feed.url);
        
        // 필터 적용
        const filteredItems = items.filter(item => {
          const titleLower = item.title.toLowerCase();
          const summaryLower = item.summary?.toLowerCase() || '';
          
          // 포함 키워드 체크
          if (feed.include && feed.include.length > 0) {
            const hasIncludeKeyword = feed.include.some(keyword => 
              titleLower.includes(keyword.toLowerCase()) || 
              summaryLower.includes(keyword.toLowerCase())
            );
            if (!hasIncludeKeyword) return false;
          }
          
          // 제외 키워드 체크
          if (feed.exclude && feed.exclude.length > 0) {
            const hasExcludeKeyword = feed.exclude.some(keyword => 
              titleLower.includes(keyword.toLowerCase()) || 
              summaryLower.includes(keyword.toLowerCase())
            );
            if (hasExcludeKeyword) return false;
          }
          
          return true;
        });
        
        allItems.push(...filteredItems);
      }
      
      // 시간순 정렬 및 중복 제거
      const uniqueItems = allItems
        .filter((item, index, self) => 
          index === self.findIndex(i => i.title === item.title)
        )
        .sort((a, b) => b.ts - a.ts)
        .slice(0, 10);
      
      setState(prev => ({
        ...prev,
        items: uniqueItems,
        lastFetched: Date.now()
      }));
      
      trackEvent('news_refresh', { widget: 'news', feeds: state.feeds.length, items: uniqueItems.length });
    } catch (error) {
      setError('뉴스를 불러오는데 실패했습니다.');
      console.error('뉴스 새로고침 실패:', error);
    } finally {
      setIsLoading(false);
    }
  }, [state.feeds, setState]);

  // 피드 추가
  const addFeed = useCallback(() => {
    if (!newFeedUrl.trim()) return;
    
    try {
      new URL(newFeedUrl); // URL 유효성 검사
      
      setState(prev => ({
        ...prev,
        feeds: [...prev.feeds, { url: newFeedUrl.trim() }]
      }));
      
      setNewFeedUrl('');
      trackEvent('news_feed_add', { widget: 'news', url: newFeedUrl });
    } catch (error) {
      setError('올바른 URL을 입력해주세요.');
    }
  }, [newFeedUrl, setState]);

  // 피드 제거
  const removeFeed = useCallback((index: number) => {
    setState(prev => ({
      ...prev,
      feeds: prev.feeds.filter((_, i) => i !== index)
    }));
    trackEvent('news_feed_remove', { widget: 'news' });
  }, [setState]);

  // 자동 새로고침 설정
  useEffect(() => {
    if (state.refreshInterval <= 0) return;
    
    const interval = setInterval(refreshFeeds, state.refreshInterval * 60 * 1000);
    return () => clearInterval(interval);
  }, [state.refreshInterval, refreshFeeds]);

  // 초기 로드
  useEffect(() => {
    if (state.feeds.length > 0 && state.items.length === 0) {
      refreshFeeds();
    }
  }, [state.feeds.length, state.items.length, refreshFeeds]);

  // 시간 포맷팅
  const formatTime = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 3600000) { // 1시간 미만
      return `${Math.floor(diff / 60000)}분 전`;
    } else if (diff < 86400000) { // 1일 미만
      return `${Math.floor(diff / 3600000)}시간 전`;
    } else {
      return `${Math.floor(diff / 86400000)}일 전`;
    }
  };

  return (
    <WidgetShell
      icon={<Newspaper className="w-4 h-4 text-blue-600" />}
      title={title}
      size={size}
      onRefresh={refreshFeeds}
      onRemove={() => onRemove?.(id)}
      onResize={(newSize) => onResize?.(id, newSize)}
      onPin={() => onPin?.(id)}
      isPinned={isPinned}
    >
      <div className="h-full flex flex-col">
        {/* 설정 버튼 */}
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-1 rounded hover:bg-gray-100 focus:ring-2 focus:ring-blue-200"
            >
              <Settings className="w-4 h-4 text-gray-600" />
            </button>
            <span className="text-xs text-gray-500">
              {state.feeds.length}개 피드 • {state.items.length}개 기사
            </span>
          </div>
          
          {state.lastFetched && (
            <span className="text-xs text-gray-400">
              {formatTime(state.lastFetched)}
            </span>
          )}
        </div>

        {/* 설정 패널 */}
        {showSettings && (
          <div className="mb-3 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium text-gray-700 mb-2">피드 추가</div>
            <div className="flex gap-2 mb-3">
              <input
                type="url"
                value={newFeedUrl}
                onChange={(e) => setNewFeedUrl(e.target.value)}
                placeholder="RSS URL 입력"
                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-200"
                onKeyPress={(e) => e.key === 'Enter' && addFeed()}
              />
              <button
                onClick={addFeed}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            {/* 피드 목록 */}
            {state.feeds.length > 0 && (
              <div className="space-y-1">
                {state.feeds.map((feed, index) => (
                  <div key={index} className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 truncate">{feed.url}</span>
                    <button
                      onClick={() => removeFeed(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      삭제
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {/* 새로고침 간격 */}
            <div className="mt-3">
              <div className="text-sm font-medium text-gray-700 mb-1">새로고침 간격</div>
              <div className="flex gap-1">
                {REFRESH_INTERVALS.map((interval) => (
                  <button
                    key={interval}
                    onClick={() => setState(prev => ({ ...prev, refreshInterval: interval }))}
                    className={`px-2 py-1 text-xs rounded ${
                      state.refreshInterval === interval
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {interval}분
                  </button>
                ))}
              </div>
            </div>

        {/* 관심사 선택 */}
        <div className="mt-3">
          <div className="text-sm font-medium text-gray-700 mb-2">관심사</div>
          <div className="flex flex-wrap gap-2">
            {INTEREST_OPTIONS.map(opt => {
              const active = (state.interests || []).includes(opt);
              return (
                <button
                  key={opt}
                  onClick={() =>
                    setState(prev => {
                      const cur = prev.interests || [];
                      const next = active ? cur.filter(x => x !== opt) : [...cur, opt];
                      return { ...prev, interests: next };
                    })
                  }
                  className={`px-2 py-1 text-xs rounded border ${active ? 'bg-blue-50 text-blue-700 border-blue-300' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
          <div className="text-[11px] text-gray-500 mt-1">관심사가 선택되면 제목/요약에 포함된 기사만 보여줘요</div>
        </div>
          </div>
        )}

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-3 p-2 bg-red-50 text-red-700 text-sm rounded">
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-2 text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        )}

        {/* 로딩 상태 */}
        {isLoading && (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-sm text-gray-600">뉴스 로딩 중...</span>
          </div>
        )}

        {/* 뉴스 목록 */}
        <div className="flex-1 overflow-y-auto space-y-2">
          {state.items.length === 0 && !isLoading ? (
            <div className="text-center py-4 text-gray-500">
              <Newspaper className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <div className="text-sm">뉴스 피드를 추가해주세요</div>
            </div>
          ) : (
            (state.interests && state.interests.length > 0
              ? state.items.filter(item => {
                  const hay = (item.title + ' ' + (item.summary || '')).toLowerCase();
                  return state.interests!.some(k => hay.includes(k.toLowerCase()));
                })
              : state.items
            ).map((item) => (
              <div
                key={item.id}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  window.open(item.link, '_blank');
                  trackEvent('news_item_click', { widget: 'news', title: item.title });
                }}
              >
                <div className="flex items-start justify-between mb-1">
                  <h4 className="text-sm font-medium text-gray-900 line-clamp-2 flex-1">
                    {item.title}
                  </h4>
                  <ExternalLink className="w-3 h-3 text-gray-400 ml-2 flex-shrink-0" />
                </div>
                
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                  <span className="flex items-center gap-1">
                    <Hash className="w-3 h-3" />
                    {item.source}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTime(item.ts)}
                  </span>
                </div>
                
                {item.summary && (
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {item.summary}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </WidgetShell>
  );
}
