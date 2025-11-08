import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Newspaper,
  Plus,
  Settings,
  ExternalLink,
  Clock,
  Hash,
  RefreshCw,
  Pin,
  PinOff,
  BookmarkPlus,
  BookmarkCheck,
  Share2,
  Inbox
} from 'lucide-react';
import { WidgetShell, WidgetSize } from './WidgetShell';
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
  excludedKeywords?: string[];
  readIds?: string[];
  pinnedIds?: string[];
  readLater?: Record<string, NewsItem>;
  lastSuccessfulItems?: NewsItem[];
  lastFetchError?: string | null;
  clickStats?: Record<string, { clicks: Record<string, number>; saves: Record<string, number> }>;
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

const SOURCE_WEIGHT: Record<string, number> = {
  'news.google.com': 2,
  'www.bloomberg.co.kr': 3,
  'www.coindeskkorea.com': 3,
  'rss.naver.com': 2,
  'finance.naver.com': 2,
  'www.yna.co.kr': 3,
  'www.hankyung.com': 2
};

const canonicalizeLink = (link: string) => {
  try {
    const url = new URL(link);
    url.search = '';
    url.hash = '';
    return url.toString();
  } catch {
    return link;
  }
};

const getSourceWeight = (source: string) => {
  const customWeight =
    typeof window !== 'undefined' && (window as any)?.URWEBS?.getNewsSourceWeight
      ? (window as any).URWEBS.getNewsSourceWeight(source)
      : undefined;
  if (typeof customWeight === 'number') {
    return customWeight;
  }
  return SOURCE_WEIGHT[source] ?? 0;
};

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
      refreshInterval: 10,
      interests: [],
      excludedKeywords: [],
      readIds: [],
      pinnedIds: [],
      readLater: {},
      lastSuccessfulItems: [],
      lastFetchError: null,
      clickStats: {}
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [newFeedUrl, setNewFeedUrl] = useState('');
  const [excludeInput, setExcludeInput] = useState('');
  const [showReadLater, setShowReadLater] = useState(false);
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const autoRefreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const INTEREST_OPTIONS = ['IT', '경제', '주식', '코인', '스포츠', '연예', '정치', '세계', '자동차'];
  const PRESET_FEEDS: Array<{ label: string; url: string }> = [
    { label: '구글뉴스 · IT', url: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx1YlY4U0FtVnVHZ0pRVkNnQVAB?hl=ko&gl=KR&ceid=KR:ko' },
    { label: '구글뉴스 · 경제', url: 'https://news.google.com/rss/topics/CAAqJAgKIh5DQkFTRUFvSEwyMHZNRGR6ZEdKUWNHUmxHZ0pEUlNnQVAB?hl=ko&gl=KR&ceid=KR:ko' },
    { label: '네이버 주요뉴스', url: 'https://rss.naver.com/news/topstory.naver' },
    { label: '코인데스크', url: 'https://www.coindeskkorea.com/rss/allArticle.xml' },
    { label: '블룸버그 머니', url: 'https://www.bloomberg.co.kr/rss' },
    { label: '연합뉴스 정치', url: 'https://www.yna.co.kr/rss/politics.xml' },
    { label: '한겨레 스포츠', url: 'https://www.hani.co.kr/rss/sports/' }
  ];

  const PRESET_GROUPS: Record<string, string[]> = {
    IT: [
      'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx1YlY4U0FtVnVHZ0pRVkNnQVAB?hl=ko&gl=KR&ceid=KR:ko',
      'https://www.zdnet.co.kr/news/rss.xml',
      'https://www.bloter.net/rss'
    ],
    경제: [
      'https://news.google.com/rss/topics/CAAqJAgKIh5DQkFTRUFvSEwyMHZNRGR6ZEdKUWNHUmxHZ0pEUlNnQVAB?hl=ko&gl=KR&ceid=KR:ko',
      'https://www.hankyung.com/rss/economy.xml',
      'https://www.mk.co.kr/rss/30100041/'
    ],
    주식: [
      'https://finance.naver.com/rss/rss.nhn?category=market_sum',
      'https://www.etoday.co.kr/rss/section/stock.xml'
    ],
    코인: [
      'https://www.coindeskkorea.com/rss/allArticle.xml',
      'https://coinpan.com/rss',
      'https://www.tokensky.net/rss'
    ],
    스포츠: [
      'https://www.hani.co.kr/rss/sports/',
      'https://sports.news.naver.com/rss/index.nhn'
    ],
    정치: [
      'https://www.yna.co.kr/rss/politics.xml',
      'https://www.khan.co.kr/rss/rssdata/total_politic.xml'
    ]
  };

  // RSS 파싱 함수 (간단한 구현)
  const parseRSS = async (url: string): Promise<NewsItem[]> => {
    try {
      // CORS 문제로 인해 실제로는 프록시 서버를 사용해야 함
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
      console.error('RSS 파싱 실패:', error);
      let host = url;
      try {
        host = new URL(url).hostname;
      } catch {
        /* noop */
      }
      throw new Error(`RSS 데이터를 불러오지 못했습니다 (${host})`);
    }
  };

  // 요약 생성 함수
  const generateSummary = (text: string): string => {
    if (!text) return '';
    const cleaned = text
      .replace(/<[^>]+>/g, ' ')
      .replace(/&[#\w]+;/g, ' ')
      .replace(/🔴|🟢|▶|◆|▲|■|※|▷|▶️|▼|●|◇|★|【|】/g, '')
      .replace(/\s+/g, ' ');

    const sentences = cleaned
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter(
        (s) =>
          s.length > 10 &&
          !/^광고/.test(s) &&
          !/^관련 기사/.test(s) &&
          !/^Copyright/.test(s)
      );

    if (sentences.length === 0) {
      const fallback = cleaned.slice(0, 180).trim();
      return fallback ? `${fallback}${fallback.endsWith('.') ? '' : '.'}` : '';
    }

    const selected: string[] = [];
    let total = 0;
    for (const sentence of sentences) {
      if (selected.length >= 3) break;
      selected.push(sentence);
      total += sentence.length;
      if (total >= 130) break;
    }

    let summary = selected.join(' ');
    if (summary.length > 180) {
      summary = summary.slice(0, 180);
    }
    if (summary.length < 120) {
      summary = sentences.slice(0, Math.min(sentences.length, 3)).join(' ').slice(0, 180);
    }

    summary = summary.trim();
    return summary.endsWith('.') ? summary : `${summary}.`;
  };

  // 피드 새로고침
  const refreshFeeds = useCallback(
    async ({ source = 'manual' }: { source?: 'manual' | 'auto' } = {}) => {
      const feeds = state.feeds;
      if (feeds.length === 0) {
        if (source === 'manual') setIsLoading(false);
        if (source === 'auto') {
          setIsAutoRefreshing(false);
          if (autoRefreshTimerRef.current) {
            clearTimeout(autoRefreshTimerRef.current);
            autoRefreshTimerRef.current = null;
          }
        }
        return;
      }

      if (source === 'manual') {
        setIsLoading(true);
      } else {
        setIsAutoRefreshing(true);
        if (autoRefreshTimerRef.current) {
          clearTimeout(autoRefreshTimerRef.current);
          autoRefreshTimerRef.current = null;
        }
      }

      if (source === 'manual') {
        setError(null);
      }

      try {
        const allItems: NewsItem[] = [];

        for (const feed of feeds) {
          const items = await parseRSS(feed.url);

          const filteredItems = items.filter((item) => {
            const titleLower = item.title.toLowerCase();
            const summaryLower = item.summary?.toLowerCase() || '';

            if (feed.include && feed.include.length > 0) {
              const hasIncludeKeyword = feed.include.some(
                (keyword) =>
                  titleLower.includes(keyword.toLowerCase()) ||
                  summaryLower.includes(keyword.toLowerCase())
              );
              if (!hasIncludeKeyword) return false;
            }

            if (feed.exclude && feed.exclude.length > 0) {
              const hasExcludeKeyword = feed.exclude.some(
                (keyword) =>
                  titleLower.includes(keyword.toLowerCase()) ||
                  summaryLower.includes(keyword.toLowerCase())
              );
              if (hasExcludeKeyword) return false;
            }

            return true;
          });

          allItems.push(...filteredItems);
        }

        const dedupedMap = new Map<string, NewsItem>();
        for (const item of allItems) {
          const canonical = canonicalizeLink(item.link);
          let host = '';
          try {
            host = new URL(canonical).hostname;
          } catch {
            host = '';
          }
          const key = `${item.title}_${host}_${canonical}`;
          const prev = dedupedMap.get(key);
          if (!prev || prev.ts < item.ts) {
            dedupedMap.set(key, item);
          }
        }

        const now = Date.now();
        const uniqueItems = Array.from(dedupedMap.values())
          .filter((item) => now - item.ts <= 1000 * 60 * 60 * 24)
          .sort((a, b) => {
            const tsDiff = b.ts - a.ts;
            if (tsDiff !== 0) return tsDiff;
            const weightDiff = getSourceWeight(b.source) - getSourceWeight(a.source);
            if (weightDiff !== 0) return weightDiff;
            return b.title.localeCompare(a.title);
          });

        const processedItems = uniqueItems.map((item) => ({
          ...item,
          summary: item.summary ? generateSummary(item.summary) : ''
        }));

        setState((prev) => ({
          ...prev,
          items: processedItems,
          lastFetched: Date.now(),
          lastSuccessfulItems: processedItems,
          lastFetchError: null
        }));

        trackEvent('news_refresh', { feeds: feeds.length, items: processedItems.length });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'RSS 데이터를 불러오지 못했습니다.';
        console.error('뉴스 새로고침 실패:', err);
        setError(errorMessage);
        setState((prev) => {
          if (prev.lastSuccessfulItems && prev.lastSuccessfulItems.length > 0) {
            return {
              ...prev,
              items: prev.lastSuccessfulItems,
              lastFetchError: errorMessage
            };
          }
          return {
            ...prev,
            lastFetchError: errorMessage
          };
        });
      } finally {
        if (source === 'manual') {
          setIsLoading(false);
        } else {
          autoRefreshTimerRef.current = setTimeout(() => {
            setIsAutoRefreshing(false);
            autoRefreshTimerRef.current = null;
          }, 1500);
        }
      }
    },
    [state.feeds, setState, parseRSS]
  );

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
      trackEvent('news_feed_add', { url: newFeedUrl });
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
  }, [setState]);

  // 자동 새로고침 설정
  useEffect(() => {
    if (state.refreshInterval <= 0) return;
 
    const interval = setInterval(() => {
      refreshFeeds({ source: 'auto' });
    }, state.refreshInterval * 60 * 1000);
    return () => clearInterval(interval);
  }, [state.refreshInterval, refreshFeeds]);

  // 초기 로드
  useEffect(() => {
    if (state.feeds.length > 0 && state.items.length === 0) {
      refreshFeeds({ source: 'manual' });
    }
  }, [state.feeds.length, state.items.length, refreshFeeds]);

  // 시간 포맷팅
  const formatTime = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) {
      return '방금 전';
    } else if (diff < 3600000) { // 1시간 미만
      return `${Math.floor(diff / 60000)}분 전`;
    } else if (diff < 86400000) { // 1일 미만
      return `${Math.floor(diff / 3600000)}시간 전`;
    } else {
      return `${Math.floor(diff / 86400000)}일 전`;
    }
  };

  const normalizedSize = useMemo<'s' | 'm' | 'l'>(() => {
    const map: Record<WidgetSize, 's' | 'm' | 'l'> = {
      s: 's',
      m: 'm',
      l: 'l',
      xl: 'l'
    };
    return map[size as WidgetSize] ?? 'm';
  }, [size]);

  const readIdsSet = useMemo(() => new Set(state.readIds || []), [state.readIds]);
  const pinnedIdsSet = useMemo(() => new Set(state.pinnedIds || []), [state.pinnedIds]);
  const readLaterItems = state.readLater || {};

  const sizeConfig = useMemo(() => {
    switch (normalizedSize) {
      case 's':
        return {
          maxItems: 3,
          showSummary: false,
          showBadges: false,
          itemSpacing: 'space-y-1',
          itemClass: 'py-2 px-2',
          titleClass: 'text-sm leading-tight',
          metaClass: 'text-[11px] text-gray-500',
          summaryClass: 'hidden',
          clampClass: 'line-clamp-2',
          showMoreButton: false
        } as const;
      case 'l':
        return {
          maxItems: 10,
          showSummary: true,
          showBadges: true,
          itemSpacing: 'space-y-3',
          itemClass: 'p-3',
          titleClass: 'text-base leading-snug',
          metaClass: 'text-xs text-gray-500',
          summaryClass: 'text-xs text-gray-600 line-clamp-2 hidden sm:block',
          clampClass: 'line-clamp-3',
          showMoreButton: true
        } as const;
      case 'm':
      default:
        return {
          maxItems: 6,
          showSummary: true,
          showBadges: false,
          itemSpacing: 'space-y-2',
          itemClass: 'p-2',
          titleClass: 'text-sm',
          metaClass: 'text-xs text-gray-500',
          summaryClass: 'text-xs text-gray-600 line-clamp-2 hidden sm:block',
          clampClass: 'line-clamp-2',
          showMoreButton: false
        } as const;
    }
  }, [normalizedSize]);

  const [showAll, setShowAll] = useState(false);

  const baseItems = useMemo(() => {
    const includeKeywords = (state.interests || []).map((k) => k.toLowerCase());
    const excludeKeywords = (state.excludedKeywords || []).map((k) => k.toLowerCase());

    return state.items.filter((item) => {
      const haystack = (item.title + ' ' + (item.summary || '')).toLowerCase();

      if (includeKeywords.length > 0) {
        const hasInclude = includeKeywords.some((keyword) => haystack.includes(keyword));
        if (!hasInclude) {
          return false;
        }
      }

      if (excludeKeywords.length > 0) {
        const hasExclude = excludeKeywords.some((keyword) => haystack.includes(keyword));
        if (hasExclude) {
          return false;
        }
      }

      return true;
    });
  }, [state.items, state.interests, state.excludedKeywords]);

  const orderedItems = useMemo(() => {
    if (!baseItems.length) return [];
    const pinned: NewsItem[] = [];
    const others: NewsItem[] = [];
    baseItems.forEach((item) => {
      if (pinnedIdsSet.has(item.id)) {
        pinned.push(item);
      } else {
        others.push(item);
      }
    });
    return [...pinned, ...others];
  }, [baseItems, pinnedIdsSet]);

  const displayedItems = useMemo(() => {
    if (showAll || !sizeConfig.showMoreButton) {
      return orderedItems;
    }
    const limit = Math.max(sizeConfig.maxItems, baseItems.filter((item) => pinnedIdsSet.has(item.id)).length);
    return orderedItems.slice(0, limit);
  }, [orderedItems, showAll, sizeConfig, baseItems, pinnedIdsSet]);

  const hasMoreItems = sizeConfig.showMoreButton && orderedItems.length > displayedItems.length;
  const unreadCount = useMemo(
    () => orderedItems.filter((item) => !readIdsSet.has(item.id)).length,
    [orderedItems, readIdsSet]
  );
  const readLaterList = useMemo(
    () =>
      Object.values(readLaterItems)
        .slice()
        .sort((a, b) => b.ts - a.ts),
    [readLaterItems]
  );
  const spinnerActive = isLoading || isAutoRefreshing;
  itemRefs.current.length = displayedItems.length;

  useEffect(() => {
    setShowAll(false);
  }, [normalizedSize, state.feeds.length]);

  useEffect(() => {
    if (displayedItems.length === 0) {
      setFocusedIndex(-1);
      return;
    }
    setFocusedIndex((prev) => {
      if (prev === -1) return 0;
      if (prev >= displayedItems.length) return displayedItems.length - 1;
      return prev;
    });
  }, [displayedItems.length]);

  useEffect(() => {
    if (focusedIndex < 0 || focusedIndex >= itemRefs.current.length) return;
    const node = itemRefs.current[focusedIndex];
    if (node) {
      node.focus({ preventScroll: true });
      node.scrollIntoView({ block: 'nearest' });
    }
  }, [focusedIndex, displayedItems.length]);

  const addPresetFeed = (presetUrl: string) => {
    const normalized = presetUrl.trim();
    if (state.feeds.some((feed) => feed.url.trim() === normalized)) {
      return;
    }
    setState((prev) => ({
      ...prev,
      feeds: [...prev.feeds, { url: normalized }]
    }));
    trackEvent('news_feed_add', { url: normalized });
  };

  const addPresetGroup = (label: string, urls: string[]) => {
    if (!urls || urls.length === 0) return;
    const trimmed = urls.map((url) => url.trim()).filter(Boolean);
    setState((prev) => {
      const existing = new Set(prev.feeds.map((feed) => feed.url.trim()));
      const newFeeds: string[] = [];
      trimmed.forEach((url) => {
        if (!existing.has(url)) {
          existing.add(url);
          newFeeds.push(url);
        }
      });
      if (newFeeds.length === 0) {
        return prev;
      }
      newFeeds.forEach((url) => {
        trackEvent('news_feed_add', { url });
      });
      return {
        ...prev,
        feeds: [...prev.feeds, ...newFeeds.map((url) => ({ url }))]
      };
    });
  };

  const addExcludeKeyword = () => {
    const keyword = excludeInput.trim();
    if (!keyword) return;
    setState((prev) => {
      const current = prev.excludedKeywords || [];
      if (current.includes(keyword)) {
        return prev;
      }
      return {
        ...prev,
        excludedKeywords: [...current, keyword]
      };
    });
    setExcludeInput('');
  };

  const removeExcludeKeyword = (keyword: string) => {
    setState((prev) => {
      const current = prev.excludedKeywords || [];
      return {
        ...prev,
        excludedKeywords: current.filter((item) => item !== keyword)
      };
    });
  };

  const markAsRead = (id: string) => {
    if (readIdsSet.has(id)) return;
    setState((prev) => {
      const prevIds = prev.readIds || [];
      if (prevIds.includes(id)) return prev;
      return {
        ...prev,
        readIds: [...prevIds, id]
      };
    });
  };

  const togglePin = (item: NewsItem) => {
    setState((prev) => {
      const prevPins = prev.pinnedIds || [];
      const isPinned = prevPins.includes(item.id);
      const nextPins = isPinned ? prevPins.filter((id) => id !== item.id) : [...prevPins, item.id];
      trackEvent('news_pin', { id: item.id });
      return {
        ...prev,
        pinnedIds: nextPins
      };
    });
  };

  const saveForLater = (item: NewsItem) => {
    setState((prev) => {
      const next = {
        ...prev,
        readLater: {
          ...(prev.readLater || {}),
          [item.id]: {
            ...item
          }
        }
      };
      trackEvent('news_save', { id: item.id });
      return next;
    });
  };

  const removeFromReadLater = (id: string) => {
    setState((prev) => {
      if (!prev.readLater || !prev.readLater[id]) return prev;
      const next = { ...prev.readLater };
      delete next[id];
      return {
        ...prev,
        readLater: next
      };
    });
  };

  const handleShare = async (item: NewsItem) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(item.link);
      }
      trackEvent('news_share', { id: item.id });
    } catch (err) {
      console.error('링크 복사 실패:', err);
    }
  };

  const logClick = useCallback(
    (item: NewsItem, options?: { trigger?: 'keyboard' | 'mouse' | 'read_later' }) => {
      setState((prev) => {
        const now = Date.now();
        const dateKey = new Date(now).toISOString().slice(0, 10);
        const nextClickStats = { ...(prev.clickStats || {}) };
        const counters = nextClickStats[dateKey] || { clicks: {}, saves: {} };
        counters.clicks[item.id] = (counters.clicks[item.id] || 0) + 1;
        nextClickStats[dateKey] = counters;
        return {
          ...prev,
          clickStats: nextClickStats
        };
      });
      trackEvent('news_item_click', { source: item.source });
    },
    [setState]
  );

  const logSave = useCallback(
    (item: NewsItem) => {
      setState((prev) => {
        const now = Date.now();
        const dateKey = new Date(now).toISOString().slice(0, 10);
        const nextClickStats = { ...(prev.clickStats || {}) };
        const counters = nextClickStats[dateKey] || { clicks: {}, saves: {} };
        counters.saves[item.id] = (counters.saves[item.id] || 0) + 1;
        nextClickStats[dateKey] = counters;
        return {
          ...prev,
          clickStats: nextClickStats
        };
      });
      trackEvent('news_save', { id: item.id });
    },
    [setState]
  );

  const usePopularNews = useCallback(() => {
    const stats = state.clickStats || {};
    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const aggregated: Record<string, { clicks: number; saves: number }> = {};

    Object.entries(stats).forEach(([dateKey, { clicks = {}, saves = {} }]) => {
      const dateTs = Date.parse(dateKey);
      if (Number.isNaN(dateTs) || dateTs < cutoff) return;
      Object.entries(clicks).forEach(([id, count]) => {
        if (!aggregated[id]) aggregated[id] = { clicks: 0, saves: 0 };
        aggregated[id].clicks += count as number;
      });
      Object.entries(saves).forEach(([id, count]) => {
        if (!aggregated[id]) aggregated[id] = { clicks: 0, saves: 0 };
        aggregated[id].saves += count as number;
      });
    });

    const sorted = Object.entries(aggregated)
      .map(([id, counts]) => ({
        id,
        clicks: counts.clicks,
        saves: counts.saves,
        score: counts.clicks * 2 + counts.saves * 3
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    const itemsById = new Map(state.items.map((item) => [item.id, item]));
    return sorted
      .map(({ id, clicks, saves }) => {
        const item = itemsById.get(id) || state.lastSuccessfulItems?.find((news) => news.id === id);
        if (!item) return null;
        return {
          item,
          clicks,
          saves
        };
      })
      .filter(Boolean) as Array<{ item: NewsItem; clicks: number; saves: number }>;
  }, [state.clickStats, state.items, state.lastSuccessfulItems]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const active = document.activeElement as HTMLElement | null;
      if (
        active &&
        (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable)
      ) {
        return;
      }

      if (!displayedItems.length) return;

      const key = e.key;
      if (key === 'ArrowDown') {
        e.preventDefault();
        const next = focusedIndex < 0 ? 0 : (focusedIndex + 1) % displayedItems.length;
        setFocusedIndex(next);
      } else if (key === 'ArrowUp') {
        e.preventDefault();
        const next =
          focusedIndex < 0
            ? displayedItems.length - 1
            : (focusedIndex - 1 + displayedItems.length) % displayedItems.length;
        setFocusedIndex(next);
      } else if (key === 'Enter') {
        if (focusedIndex < 0 || focusedIndex >= displayedItems.length) return;
        e.preventDefault();
        const item = displayedItems[focusedIndex];
        if (!item) return;
        markAsRead(item.id);
        window.open(item.link, '_blank', 'noopener');
        logClick(item, { trigger: 'keyboard' });
      } else if (key.toLowerCase() === 'p') {
        if (focusedIndex < 0 || focusedIndex >= displayedItems.length) return;
        e.preventDefault();
        togglePin(displayedItems[focusedIndex]);
      } else if (key.toLowerCase() === 's' && e.shiftKey) {
        if (focusedIndex < 0 || focusedIndex >= displayedItems.length) return;
        e.preventDefault();
        const item = displayedItems[focusedIndex];
        if (readLaterItems[item.id]) {
          removeFromReadLater(item.id);
        } else {
          saveForLater(item);
          logSave(item);
        }
      }
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [displayedItems, focusedIndex, readLaterItems, togglePin, saveForLater, removeFromReadLater, markAsRead, logClick, logSave]);

  useEffect(() => () => {
    if (autoRefreshTimerRef.current) {
      clearTimeout(autoRefreshTimerRef.current);
      autoRefreshTimerRef.current = null;
    }
  }, []);

  return (
    <WidgetShell
      icon={<Newspaper className="w-4 h-4 text-blue-600" />}
      title={title}
      size={size}
      onRefresh={() => refreshFeeds({ source: 'manual' })}
      onRemove={() => onRemove?.(id)}
      onResize={(newSize) => onResize?.(id, newSize === 'xl' ? 'l' : newSize)}
      onPin={() => onPin?.(id)}
      isPinned={isPinned}
      variant="inset"
      contentClassName="h-full flex flex-col gap-3 px-3 py-3"
      headerAction={
        <div className="flex items-center gap-2 text-xs text-gray-600">
          {unreadCount > 0 && (
            <span className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50/70 px-2.5 py-1 text-[11px] font-medium text-indigo-700">
              읽지 않음 {unreadCount}
            </span>
          )}
          <div className="flex items-center gap-1 rounded-md border border-white/40 bg-white/40 px-2 py-1">
            <Clock className="h-3.5 w-3.5 text-gray-500" />
            <span className="font-medium">
              {state.lastFetched ? formatTime(state.lastFetched) : '아직 없음'}
            </span>
          </div>
          <button
            onClick={() => refreshFeeds({ source: 'manual' })}
            className="inline-flex items-center justify-center rounded-md border border-white/40 bg-white/40 px-2 py-1 text-[11px] font-medium text-gray-700 transition hover:bg-white/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 disabled:opacity-50"
            aria-label="뉴스 새로고침"
            title="뉴스 새로고침"
            disabled={spinnerActive || state.feeds.length === 0}
          >
            <RefreshCw className={`mr-1 h-3.5 w-3.5 ${spinnerActive ? 'animate-spin text-blue-500' : 'text-gray-600'}`} />
            새로고침
          </button>
          <button
            onClick={() => setShowSettings((prev) => !prev)}
            className="inline-flex items-center justify-center rounded-md border border-white/40 bg-white/40 px-2 py-1 text-[11px] font-medium text-gray-700 transition hover:bg-white/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
            aria-label={showSettings ? '설정 닫기' : '설정 열기'}
            title="설정 열기"
          >
            <Settings className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setShowReadLater(true)}
            className="inline-flex items-center justify-center rounded-md border border-white/40 bg-white/40 px-2 py-1 text-[11px] font-medium text-gray-700 transition hover:bg-white/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
            aria-label="보관함 열기"
            title="나중에 읽기 보관함"
          >
            <Inbox className="mr-1 h-3.5 w-3.5" />
            보관함
            {Object.keys(readLaterItems).length > 0 && (
              <span className="ml-1 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-indigo-500 px-1 text-[10px] font-semibold text-white">
                {Object.keys(readLaterItems).length}
              </span>
            )}
          </button>
        </div>
      }
    >
      <div className="flex h-full flex-col">
        {/* 상태 요약 */}
        <div className="flex items-center justify-between rounded-lg border border-white/50 bg-white/35 px-2 py-1 text-xs text-gray-600 backdrop-blur">
          <span>{state.feeds.length}개 피드 · {state.items.length}개 기사</span>
          {state.lastFetched && (
            <span className="flex items-center gap-1 text-gray-500">
              <Clock className="h-3 w-3" />
              {formatTime(state.lastFetched)}
            </span>
          )}
        </div>

        {/* 설정 패널 */}
        {showSettings && (
          <div className="rounded-xl border border-white/40 bg-white/25 p-3 shadow-none backdrop-blur-sm">
            <div className="mb-3">
              <div className="mb-2 text-sm font-medium text-gray-700">추천 프리셋</div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(PRESET_GROUPS).map(([label, urls]) => (
                  <button
                    key={label}
                    onClick={() => addPresetGroup(label, urls)}
                    className="rounded-full border border-blue-200 bg-blue-50/70 px-3 py-1 text-xs font-medium text-blue-700 transition hover:bg-blue-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
                  >
                    #{label}
                  </button>
                ))}
              </div>
              <p className="mt-1 text-[11px] text-gray-500">
                카테고리를 선택하면 관련된 RSS 다수를 한 번에 추가합니다.
              </p>
            </div>

            <div className="mb-2 text-sm font-medium text-gray-700">피드 추가</div>
            <div className="mb-3 flex gap-2">
              <input
                type="url"
                value={newFeedUrl}
                onChange={(e) => setNewFeedUrl(e.target.value)}
                placeholder="RSS URL 입력"
                className="flex-1 rounded-md border border-gray-200 bg-white/80 px-2 py-1 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
                onKeyPress={(e) => e.key === 'Enter' && addFeed()}
              />
              <button
                onClick={addFeed}
                className="inline-flex items-center rounded-md bg-blue-600 px-3 py-1 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            {/* 피드 목록 */}
            {state.feeds.length > 0 && (
              <div className="space-y-1">
                {state.feeds.map((feed, index) => (
                  <div key={index} className="flex items-center justify-between text-xs text-gray-600">
                    <span className="truncate">{feed.url}</span>
                    <button
                      onClick={() => removeFeed(index)}
                      className="rounded px-2 py-0.5 text-red-500 transition hover:bg-red-50"
                    >
                      삭제
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {/* 새로고침 간격 */}
            <div className="mt-3">
              <div className="mb-1 text-sm font-medium text-gray-700">새로고침 간격</div>
              <div className="flex gap-1">
                {REFRESH_INTERVALS.map((interval) => (
                  <button
                    key={interval}
                    onClick={() => setState(prev => ({ ...prev, refreshInterval: interval }))}
                    className={`rounded-md px-2 py-1 text-xs transition ${
                      state.refreshInterval === interval
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-white/70 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {interval}분
                  </button>
                ))}
              </div>
            </div>

        {/* 관심사 선택 */}
        <div className="mt-3">
          <div className="text-sm font-medium text-gray-700 mb-2">관심사 (포함 필터)</div>
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
          <div className="text-[11px] text-gray-500 mt-1">여기에 추가한 키워드가 제목/요약에 포함된 기사만 표시합니다.</div>
        </div>

        <div className="mt-3">
          <div className="text-sm font-medium text-gray-700 mb-2">제외 키워드</div>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={excludeInput}
              onChange={(e) => setExcludeInput(e.target.value)}
              placeholder="예: 연예, 광고"
              className="flex-1 rounded-md border border-gray-200 bg-white/80 px-2 py-1 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addExcludeKeyword();
                }
              }}
            />
            <button
              onClick={addExcludeKeyword}
              className="inline-flex items-center rounded-md border border-gray-200 bg-white/80 px-3 py-1 text-sm font-medium text-gray-600 transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
            >
              추가
            </button>
          </div>
          {(state.excludedKeywords && state.excludedKeywords.length > 0) ? (
            <div className="flex flex-wrap gap-1.5">
              {state.excludedKeywords!.map((keyword) => (
                <span
                  key={keyword}
                  className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-[11px] text-red-600"
                >
                  {keyword}
                  <button
                    onClick={() => removeExcludeKeyword(keyword)}
                    className="ml-1 text-red-500 hover:text-red-700"
                    aria-label={`${keyword} 제외 키워드 제거`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <div className="text-[11px] text-gray-500">
              제외할 단어를 추가하면 해당 키워드가 포함된 기사가 숨겨집니다.
            </div>
          )}
        </div>
          </div>
        )}

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-3 rounded-xl border border-red-200 bg-red-50/90 px-3 py-2 text-xs text-red-700">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-semibold">뉴스를 가져오는 중 문제가 발생했습니다.</div>
                <div className="mt-1 text-[11px] text-red-600/80">{error}</div>
                {state.lastSuccessfulItems && state.lastSuccessfulItems.length > 0 && (
                  <div className="mt-2 text-[11px] text-red-500/80">
                    최근 저장된 뉴스를 계속 표시하고 있어요.
                  </div>
                )}
              </div>
              <button
                onClick={() => setError(null)}
                className="rounded-md px-2 py-1 text-[11px] text-red-500 hover:text-red-600"
                aria-label="오류 숨기기"
              >
                ×
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                onClick={() => refreshFeeds({ source: 'manual' })}
                className="inline-flex items-center rounded-md border border-red-200 bg-white/80 px-3 py-1 text-[11px] font-medium text-red-600 transition hover:bg-white"
              >
                다시 시도
              </button>
            </div>
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
        <div className={`flex-1 overflow-y-auto ${sizeConfig.itemSpacing}`}>
          {state.feeds.length === 0 && !isLoading ? (
            <div className="rounded-xl border border-dashed border-gray-200/70 bg-white/30 px-4 py-5 text-center text-gray-500">
              <Newspaper className="mx-auto mb-3 h-8 w-8 text-gray-300" />
              <div className="mb-3 text-sm">원하는 소식을 빠르게 구독해보세요</div>
              <div className="flex flex-wrap justify-center gap-2">
                {PRESET_FEEDS.map((preset) => (
                  <button
                    key={preset.url}
                    onClick={() => addPresetFeed(preset.url)}
                    className="rounded-full border border-blue-200 bg-blue-50/60 px-3 py-1 text-xs text-blue-700 transition hover:bg-blue-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          ) : orderedItems.length === 0 && !isLoading ? (
            <div className="rounded-xl border border-dashed border-gray-200/70 bg-white/30 py-6 text-center text-gray-500">
              <Newspaper className="mx-auto mb-2 h-8 w-8 text-gray-300" />
              <div className="text-sm">뉴스 피드를 추가해주세요</div>
            </div>
          ) : (
            displayedItems.map((item, index) => {
              const isRead = readIdsSet.has(item.id);
              const isPinned = pinnedIdsSet.has(item.id);
              const isSaved = Boolean(readLaterItems[item.id]);
              const isFocused = focusedIndex === index;

              return (
                <div
                  key={item.id}
                  ref={(el) => (itemRefs.current[index] = el)}
                  role="button"
                  tabIndex={0}
                  aria-label={`${item.title} (${item.source}, ${formatTime(item.ts)})`}
                  className={`group cursor-pointer rounded-lg border border-gray-200/70 bg-white/10 ${sizeConfig.itemClass} transition hover:border-gray-300 hover:bg-white/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-1 focus-visible:ring-offset-white ${isRead ? 'opacity-75' : ''} ${isFocused ? 'ring-2 ring-blue-300' : ''}`}
                  onClick={() => {
                    markAsRead(item.id);
                    window.open(item.link, '_blank', 'noopener');
                    logClick(item);
                  }}
                  onFocus={() => setFocusedIndex(index)}
                  data-index={index}
                >
                  <div className="mb-1 flex items-start justify-between gap-2">
                    <h4
                      className={`flex-1 font-medium ${sizeConfig.clampClass} ${sizeConfig.titleClass} ${
                        isRead ? 'text-gray-500' : 'text-gray-900'
                      }`}
                    >
                      {item.title}
                    </h4>
                    <ExternalLink
                      className="h-3 w-3 flex-shrink-0 text-gray-400 transition group-hover:text-gray-500"
                      title="새 탭에서 열기"
                    />
                  </div>

                  <div className={`mb-1 flex flex-wrap items-center gap-2 ${sizeConfig.metaClass}`}>
                    <span className="flex items-center gap-1">
                      <Hash className="h-3 w-3" />
                      {item.source}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTime(item.ts)}
                    </span>
                    {isPinned && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] text-amber-700">
                        <Pin className="h-3 w-3" />
                        고정됨
                      </span>
                    )}
                    {sizeConfig.showBadges && state.interests && state.interests.length > 0 && (
                      <span className="flex flex-wrap gap-1">
                        {state.interests.map((chip) => (
                          <span
                            key={`${item.id}-${chip}`}
                            className="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] text-indigo-600"
                          >
                            #{chip}
                          </span>
                        ))}
                      </span>
                    )}
                  </div>

                  {item.summary && sizeConfig.showSummary && (
                    <p className={sizeConfig.summaryClass}>
                      {item.summary}
                    </p>
                  )}

                  <div className="mt-2 flex flex-wrap items-center justify-end gap-2 text-[11px] text-gray-500">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePin(item);
                      }}
                      className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white/70 px-2 py-0.5 transition hover:bg-white"
                      aria-pressed={isPinned}
                    >
                      {isPinned ? (
                        <>
                          <PinOff className="h-3 w-3" />
                          고정 해제
                        </>
                      ) : (
                        <>
                          <Pin className="h-3 w-3" />
                          고정
                        </>
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isSaved) {
                          removeFromReadLater(item.id);
                        } else {
                          saveForLater(item);
                          logSave(item);
                        }
                      }}
                      className={`inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white/70 px-2 py-0.5 transition hover:bg-white ${
                        isSaved ? 'text-emerald-600' : ''
                      }`}
                      aria-pressed={isSaved}
                    >
                      {isSaved ? (
                        <>
                          <BookmarkCheck className="h-3 w-3" />
                          저장됨
                        </>
                      ) : (
                        <>
                          <BookmarkPlus className="h-3 w-3" />
                          나중에 읽기
                        </>
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShare(item);
                      }}
                      className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white/70 px-2 py-0.5 transition hover:bg-white"
                      title="링크 복사"
                    >
                      <Share2 className="h-3 w-3" />
                      공유
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {hasMoreItems && (
          <button
            onClick={() => setShowAll((prev) => !prev)}
            className="mt-1 inline-flex items-center justify-center rounded-lg border border-blue-200 bg-blue-50/60 px-3 py-1 text-xs text-blue-700 transition hover:bg-blue-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
          >
            {showAll ? '간단히 보기' : `더보기 (${orderedItems.length - displayedItems.length}건)`}
          </button>
        )}
      </div>

      {showReadLater && (
        <div className="fixed inset-0 z-[13000] flex items-center justify-center bg-black/30 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="max-h-[80vh] w-full max-w-lg rounded-2xl border border-white/50 bg-white/90 p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">나중에 읽기 보관함</h3>
              <button
                onClick={() => setShowReadLater(false)}
                className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-600 hover:bg-gray-100"
              >
                닫기
              </button>
            </div>

            {readLaterList.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 bg-white/60 py-10 text-center text-sm text-gray-500">
                저장된 기사가 없습니다.
              </div>
            ) : (
              <div className="flex max-h-[60vh] flex-col gap-3 overflow-y-auto pr-1">
                {readLaterList.map((item) => (
                  <div key={item.id} className="rounded-xl border border-gray-200 bg-white/80 p-3 shadow-sm">
                    <div className="mb-1 flex items-start justify-between gap-3">
                      <h4 className="flex-1 text-sm font-semibold text-gray-900 line-clamp-2">{item.title}</h4>
                      <button
                        onClick={() => removeFromReadLater(item.id)}
                        className="text-xs text-red-500 hover:text-red-600"
                      >
                        삭제
                      </button>
                    </div>
                    <div className="mb-2 flex items-center gap-2 text-[11px] text-gray-500">
                      <span>{item.source}</span>
                      <span>·</span>
                      <span>{formatTime(item.ts)}</span>
                    </div>
                    {item.summary && (
                      <p className="text-xs text-gray-600 line-clamp-3">{item.summary}</p>
                    )}
                    <div className="mt-2 flex items-center gap-2 text-[11px]">
                      <button
                        onClick={() => {
                          window.open(item.link, '_blank');
                          logClick(item);
                        }}
                        className="rounded-full border border-blue-200 bg-blue-50/70 px-3 py-1 text-blue-700 transition hover:bg-blue-100"
                      >
                        기사 열기
                      </button>
                      <button
                        onClick={() => handleShare(item)}
                        className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white/70 px-2 py-1 text-gray-600 transition hover:bg-white"
                      >
                        <Share2 className="h-3 w-3" />
                        공유
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </WidgetShell>
  );
}
