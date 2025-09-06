import React, { useState, useEffect, useMemo } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Widget, FavoritesData, Website } from '../types'; // ← Website도 함께 import
import { WeatherWidget } from './widgets/WeatherWidget';
import { ClockWidget } from './widgets/ClockWidget';
import { MemoWidget } from './widgets/MemoWidget';
import { TodoWidget } from './widgets/TodoWidget';
// ⚠️ websites는 import하지 말고, JSON에서 읽는다
import { categoryOrder, categoryConfig } from '../data/websites';
import { CategoryCard } from './CategoryCard';

interface StartPageProps {
  favoritesData: FavoritesData;
  onUpdateFavorites: (data: FavoritesData) => void;
  onClose: () => void;
  showDescriptions: boolean;
}

export function StartPage({ favoritesData, onUpdateFavorites, onClose, showDescriptions }: StartPageProps) {
  // ✅ JSON에서 불러온 목록을 상태로 보관
  const [websites, setWebsites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(true);

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
    return () => { cancelled = true; };
  }, []);

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) =>
    date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const formatDate = (date: Date) =>
    date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });

  const renderWidget = (widget: Widget) => {
    switch (widget.type) {
      case 'weather': return <WeatherWidget key={widget.id} widget={widget} />;
      case 'clock':   return <ClockWidget key={widget.id} widget={widget} />;
      case 'memo':    return <MemoWidget key={widget.id} widget={widget} />;
      case 'todo':    return <TodoWidget key={widget.id} widget={widget} />;
      default:        return null;
    }
  };

  const getFavoriteWebsites = () =>
    favoritesData.items
      .map(id => websites.find(site => site.id === id))
      .filter(Boolean) as Website[];

  const handleToggleFavorite = (websiteId: string) => {
    const isFavorited = favoritesData.items.includes(websiteId);
    const updatedItems = isFavorited
      ? favoritesData.items.filter(id => id !== websiteId)
      : [...favoritesData.items, websiteId];
    onUpdateFavorites({ ...favoritesData, items: updatedItems });
  };

  // ✅ websites(상태)를 기준으로 카테고리 묶기
  const categorizedWebsites = useMemo(() => {
    const acc: Record<string, Website[]> = {};
    categoryOrder.forEach(category => {
      acc[category] = websites.filter(site => site.category === category);
    });
    return acc;
  }, [websites]);

  if (loading) return <div className="p-6">로딩 중…</div>;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-purple-50 overflow-auto">
      <div
        className="min-h-screen mx-auto px-4 md:px-6"
        style={{ maxWidth: "1440px" }}
      >
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
                      <a
                        key={site.id}
                        href={site.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow border"
                      >
                        <div className="text-center">
                          <div className="text-2xl mb-2">🌐</div>
                          <h3 className="font-medium text-gray-800 truncate">{site.title}</h3>
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{site.description}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>

                {/* 위젯 영역 */}
                <div className="lg:col-span-2">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">위젯</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {favoritesData.widgets.map(renderWidget)}
                    {/* 기본 위젯들 ... (생략: 기존 그대로) */}
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">전체 카테고리</h2>
                <div
                  className="grid gap-x-4 gap-y-6"
                  style={{
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(280px, 1fr))",
                  }}
                >
                  {categoryOrder.map((category) => (
                    <CategoryCard
                      key={category}
                      category={category}
                      sites={categorizedWebsites[category] || []}
                      config={categoryConfig[category]}
                      showDescriptions={showDescriptions}
                      favorites={favoritesData.items}
                      onToggleFavorite={handleToggleFavorite}
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
