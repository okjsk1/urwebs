// src/components/StartPage.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Widget, FavoritesData, Website } from '../types';
import { WeatherWidget } from './widgets/WeatherWidget';
import { ClockWidget } from './widgets/ClockWidget';
import { MemoWidget } from './widgets/MemoWidget';
import { TodoWidget } from './widgets/TodoWidget';
// websites는 import하지 않고 JSON에서 읽어옴
import { categoryOrder, categoryConfig } from '../data/websites';
import { CategoryCard } from './CategoryCard';
import { Favicon } from './Favicon';

interface StartPageProps {
  favoritesData: FavoritesData;
  onUpdateFavorites: (data: FavoritesData) => void;
  onClose: () => void;
}

export function StartPage({
  favoritesData,
  onUpdateFavorites,
  onClose,
}: StartPageProps) {
  // JSON에서 불러온 목록을 상태로 보관
  const [websites, setWebsites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDescriptions, setShowDescriptions] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/websites.json', { cache: 'no-store' });
        const data = await res.json();
        if (!cancelled) setWebsites(Array.isArray(data) ? data : []);
      } catch (e) {
        console.warn('websites.json 불러오기 실패:', e);
        if (!cancelled) setWebsites([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) =>
    date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

  const formatDate = (date: Date) =>
    date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });

  const renderWidget = (widget: Widget) => {
    switch (widget.type) {
      case 'weather':
        return <WeatherWidget key={widget.id} widget={widget} />;
      case 'clock':
        return <ClockWidget key={widget.id} widget={widget} />;
      case 'memo':
        return <MemoWidget key={widget.id} widget={widget} />;
      case 'todo':
        return <TodoWidget key={widget.id} widget={widget} />;
      default:
        return null;
    }
  };

  const getFavoriteWebsites = () =>
    favoritesData.items
      .map((id) => websites.find((site) => site.id === id))
      .filter(Boolean) as Website[];

  const handleToggleFavorite = (websiteId: string) => {
    const isFavorited = favoritesData.items.includes(websiteId);
    const updatedItems = isFavorited
      ? favoritesData.items.filter((id) => id !== websiteId)
      : [...favoritesData.items, websiteId];
    onUpdateFavorites({ ...favoritesData, items: updatedItems });
  };

  // websites(상태)를 기준으로 카테고리 묶기
  const categorizedWebsites = useMemo(() => {
    const acc: Record<string, Website[]> = {};
    categoryOrder.forEach((category) => {
      acc[category] = websites.filter((site) => site.category === category);
    });
    return acc;
  }, [websites]);

  if (loading) return <div className="p-6">로딩 중…</div>;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-purple-50 overflow-auto">
      <div className="min-h-screen mx-auto px-4 md:px-6" style={{ maxWidth: '1440px' }}>
        <div className="py-8 space-y-12">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div className="text-center flex-1">
              <h1 className="text-4xl font-bold text-gray-800 mb-2">나의 시작페이지</h1>
              <p className="text-xl text-gray-600">{formatDate(currentTime)}</p>
              <p className="text-3xl font-mono text-blue-600 mt-2">{formatTime(currentTime)}</p>
            </div>
            <button
              onClick={onClose}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              ✖ 닫기
            </button>
          </div>

          <DndProvider backend={HTML5Backend}>
            <div className="space-y-12">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* 즐겨찾기 사이트들 */}
                <div className="lg:col-span-2">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">즐겨찾기 사이트</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {getFavoriteWebsites().map((site) => (
                      <div
                        key={site.id}
                        className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow border"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <a
                            href={site.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 min-w-0"
                          >
                            {/* 추천안: flex-shrink-0 유지, border 제거 */}
                            <Favicon domain={site.url} size={20} className="w-5 h-5 rounded flex-shrink-0" />
                            <h3 className="font-medium text-gray-800 truncate">{site.title}</h3>
                          </a>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleToggleFavorite(site.id);
                            }}
                            aria-label="즐겨찾기 제거"
                            className="favorite w-5 h-5 flex items-center justify-center text-gray-400 hover:text-yellow-500"
                            type="button"
                          >
                            <svg
                              className="w-3 h-3 urwebs-star-icon favorited"
                              viewBox="0 0 24 24"
                              strokeWidth="1"
                            >
                              <polygon points="12,2 15,8 22,9 17,14 18,21 12,18 6,21 7,14 2,9 9,8" />
                            </svg>
                          </button>
                        </div>
                        <p className="text-sm text-gray-500 line-clamp-2">{site.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 위젯 영역 */}
                <div className="lg:col-span-2">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">위젯</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {favoritesData.widgets.map(renderWidget)}
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">전체 카테고리</h2>
                <div
                  className="grid gap-x-4 gap-y-6"
                  style={{
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  }}
                >
                  {categoryOrder.map((category) => (
                    <CategoryCard
                      key={category}
                      category={category}
                      sites={categorizedWebsites[category] || []}
                      config={categoryConfig[category]}
                      favorites={favoritesData.items}
                      onToggleFavorite={handleToggleFavorite}
                      showDescriptions={showDescriptions}
                      onToggleDescriptions={setShowDescriptions}
                    />
                  ))}
                </div>
              </div>
            </div>
          </DndProvider>
        </div>
      </div>
    </div>
  );
}
