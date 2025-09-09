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
import { applyStarter, resetFavorites, saveFavoritesData } from '../utils/startPageStorage';

interface StartPageProps {
  favoritesData: FavoritesData;
  onUpdateFavorites: (data: FavoritesData) => void;
  onClose: () => void;
  showDescriptions: boolean;
}

export function StartPage({
  favoritesData,
  onUpdateFavorites,
  onClose,
  showDescriptions,
}: StartPageProps) {
  // JSON에서 불러온 목록을 상태로 보관
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
    return () => {
      cancelled = true;
    };
  }, []);

  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    saveFavoritesData(favoritesData);
  }, [favoritesData]);

  const handleStarter = () => applyStarter(onUpdateFavorites);
  const handleReset = () => resetFavorites(onUpdateFavorites);

  const handleRemoveWidget = (id: string) => {
    const updated = favoritesData.widgets.filter((w) => w.id !== id);
    const updatedLayout = (favoritesData.layout || []).filter((e) => e !== `widget:${id}`);
    onUpdateFavorites({ ...favoritesData, widgets: updated, layout: updatedLayout });
  };

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
        return <WeatherWidget key={widget.id} id={widget.id} onRemove={handleRemoveWidget} />;
      case 'clock':
        return <ClockWidget key={widget.id} id={widget.id} onRemove={handleRemoveWidget} />;
      case 'memo':
        return <MemoWidget key={widget.id} id={widget.id} onRemove={handleRemoveWidget} />;
      case 'todo':
        return <TodoWidget key={widget.id} id={widget.id} onRemove={handleRemoveWidget} />;
      default:
        return null;
    }
  };

  const handleToggleFavorite = (websiteId: string) => {
    const isFavorited = favoritesData.items.includes(websiteId);
    const updatedItems = isFavorited
      ? favoritesData.items.filter((id) => id !== websiteId)
      : [...favoritesData.items, websiteId];
    const updatedLayout = isFavorited
      ? (favoritesData.layout || []).filter((e) => e !== `item:${websiteId}`)
      : [...(favoritesData.layout || []), `item:${websiteId}`];
    onUpdateFavorites({ ...favoritesData, items: updatedItems, layout: updatedLayout });
  };

  const buildLayout = () => {
    const entries = [
      ...favoritesData.items.map((id) => `item:${id}`),
      ...favoritesData.folders.map((f) => `folder:${f.id}`),
      ...favoritesData.widgets.map((w) => `widget:${w.id}`),
    ];
    const layout = favoritesData.layout && favoritesData.layout.length
      ? favoritesData.layout.filter((e) => entries.includes(e))
      : entries.slice();
    entries.forEach((e) => {
      if (!layout.includes(e)) layout.push(e);
    });
    return layout;
  };
  const layout = buildLayout();

  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const handleDragStart = (index: number) => () => setDragIndex(index);
  const handleDragOver = (index: number) => (e: React.DragEvent) => {
    e.preventDefault();
  };
  const handleDrop = (index: number) => (e: React.DragEvent) => {
    e.preventDefault();
    if (dragIndex === null) return;
    const newLayout = [...layout];
    const [moved] = newLayout.splice(dragIndex, 1);
    newLayout.splice(index, 0, moved);
    onUpdateFavorites({ ...favoritesData, layout: newLayout });
    setDragIndex(null);
  };

  const renderDesktopItem = (entry: string, index: number) => {
    const [type, id] = entry.split(':');
    if (type === 'item') {
      const site = websites.find((s) => s.id === id);
      if (!site) return null;
      return (
        <div
          key={entry}
          className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow border"
          draggable
          onDragStart={handleDragStart(index)}
          onDragOver={handleDragOver(index)}
          onDrop={handleDrop(index)}
        >
          <div className="flex items-center justify-between mb-2">
            <a
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 min-w-0"
            >
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
              <svg className="w-3 h-3 urwebs-star-icon favorited" viewBox="0 0 24 24" strokeWidth="1">
                <polygon points="12,2 15,8 22,9 17,14 18,21 12,18 6,21 7,14 2,9 9,8" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-500 line-clamp-2">{site.description}</p>
        </div>
      );
    }
    if (type === 'widget') {
      const widget = favoritesData.widgets.find((w) => w.id === id);
      if (!widget) return null;
      return (
        <div
          key={entry}
          draggable
          onDragStart={handleDragStart(index)}
          onDragOver={handleDragOver(index)}
          onDrop={handleDrop(index)}
        >
          {renderWidget(widget)}
        </div>
      );
    }
    if (type === 'folder') {
      const folder = favoritesData.folders.find((f) => f.id === id);
      if (!folder) return null;
      return (
        <div
          key={entry}
          className="bg-white p-4 rounded-lg shadow-md border flex flex-col items-center"
          draggable
          onDragStart={handleDragStart(index)}
          onDragOver={handleDragOver(index)}
          onDrop={handleDrop(index)}
        >
          <span className="text-2xl">📁</span>
          <h3 className="font-medium mt-2">{folder.name}</h3>
        </div>
      );
    }
    return null;
  };

  useEffect(() => {
    if (!favoritesData.layout || favoritesData.layout.length === 0) {
      const initial = [
        ...favoritesData.items.map((id) => `item:${id}`),
        ...favoritesData.folders.map((f) => `folder:${f.id}`),
        ...favoritesData.widgets.map((w) => `widget:${w.id}`),
      ];
      onUpdateFavorites({ ...favoritesData, layout: initial });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // websites(상태)를 기준으로 카테고리 묶기
  const categorizedWebsites = useMemo(() => {
    const acc: Record<string, Website[]> = {};
    categoryOrder.forEach((category) => {
      acc[category] = websites.filter((site) => site.category === category);
    });
    return acc;
  }, [websites]);
  const isEmpty = favoritesData.items.length === 0 && favoritesData.widgets.length === 0;

  if (loading) return <div className="p-6">로딩 중…</div>;

  if (isEmpty) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col items-center justify-center text-center p-6">
        <h1 className="text-3xl font-bold mb-4">나만의 시작페이지를 만들어 보세요</h1>
        <p className="text-lg text-gray-600 mb-8">
          버튼 한 번으로 추천 셋팅을 불러오고, 즐겨찾기와 위젯은 자유롭게 바꿀 수 있어요.
        </p>
        <button
          onClick={handleStarter}
          aria-label="나만의 시작페이지"
          className="bg-blue-500 text-white px-6 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          나만의 시작페이지
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-purple-50 overflow-auto">
      <div className="min-h-screen mx-auto px-4 md:px-6" style={{ maxWidth: '1440px' }}>
        <div className="py-8 space-y-12">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <button
                onClick={handleStarter}
                aria-label="나만의 시작페이지"
                className="bg-blue-500 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                나만의 시작페이지
              </button>
              <button
                onClick={handleReset}
                aria-label="기본 셋팅으로 리셋"
                className="border border-blue-500 text-blue-500 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                기본 셋팅으로 리셋
              </button>
            </div>
            <div className="text-center flex-1">
              <h1 className="text-4xl font-bold text-gray-800 mb-2">나의 시작페이지</h1>
              <p className="text-xl text-gray-600">{formatDate(currentTime)}</p>
              <p className="text-3xl font-mono text-blue-600 mt-2">{formatTime(currentTime)}</p>
            </div>
            <button
              onClick={onClose}
              aria-label="닫기"
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              ✖ 닫기
            </button>
          </div>

          <DndProvider backend={HTML5Backend}>
            <div className="space-y-12">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">나의 바탕화면</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {layout.map((entry, idx) => renderDesktopItem(entry, idx))}
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">전체 카테고리</h2>
                <div
                  className="grid gap-x-2 gap-y-4"
                  style={{
                    gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
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
