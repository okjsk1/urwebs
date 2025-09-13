// src/components/StartPage.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Widget, FavoritesData, Website, CategoryConfigMap } from '../types';
import { WeatherWidget } from './widgets/WeatherWidget';
import { ClockWidget } from './widgets/ClockWidget';
import { MemoWidget } from './widgets/MemoWidget';
import { TodoWidget } from './widgets/TodoWidget';
import { CategoryCard } from './CategoryCard';
import { SiteIcon } from './SiteIcon';
import { validateCategoryKeys } from '../utils/validateCategories';
import { AddFolderButton } from './AddFolderButton';

interface StartPageProps {
  favoritesData: FavoritesData;
  onUpdateFavorites: (data: FavoritesData) => void;
  onClose: () => void;
  showDescriptions: boolean;
  pageTitle?: string;
  categoryTitle?: string;
  websites: Website[];
  categoryOrder: string[];
  categoryConfig: CategoryConfigMap;
  loading?: boolean;
  onApplyStarter?: () => Promise<void> | void;
  onReset?: () => Promise<void> | void;
  /** 전역 기본값은 true: 보험 라우트 등에서만 false로 전달하여 안내/바탕화면 숨김 */
  showStartGuide?: boolean;
  showDesktop?: boolean;
}

export function StartPage({
  favoritesData,
  onUpdateFavorites,
  onClose,
  showDescriptions,
  pageTitle = '나의 시작페이지',
  categoryTitle,
  websites,
  categoryOrder,
  categoryConfig,
  loading = false,
  onApplyStarter,
  onReset,
  showStartGuide = true,
  showDesktop = true,
}: StartPageProps) {

  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 위젯 추가 버튼 팝오버 상태
  const [showWidgetPicker, setShowWidgetPicker] = useState(false);

  // 스타터팩/리셋 적용 중 로딩 가드
  const [isApplying, setIsApplying] = useState(false);

  const handleStarter = async () => {
    if (!onApplyStarter) return;
    try {
      setIsApplying(true);
      await onApplyStarter();
    } catch (e) {
      console.error('Starter apply failed', e);
    } finally {
      setIsApplying(false);
    }
  };

  const handleReset = async () => {
    if (!onReset) return;
    try {
      setIsApplying(true);
      await onReset();
    } catch (e) {
      console.error('Reset favorites failed', e);
    } finally {
      setIsApplying(false);
    }
  };

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

  const handleAddWidget = (type: Widget['type']) => {
    const id = `${type}-${Date.now()}`;
    const newWidget: Widget = { id, type };
    onUpdateFavorites({
      ...favoritesData,
      widgets: [...favoritesData.widgets, newWidget],
      layout: [...(favoritesData.layout || []), `widget:${id}`],
    });
    setShowWidgetPicker(false);
  };

  const handleAddFolder = () => {
    const name = prompt('폴더 이름을 입력하세요');
    if (!name) return;
    const id = `folder-${Date.now()}`;
    const newFolder = { id, name, items: [] } as any;
    onUpdateFavorites({
      ...favoritesData,
      folders: [...favoritesData.folders, newFolder],
      layout: [...(favoritesData.layout || []), `folder:${id}`],
    });
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
    const base =
      favoritesData.layout && favoritesData.layout.length
        ? favoritesData.layout.filter((e) => entries.includes(e))
        : entries.slice();
    entries.forEach((e) => {
      if (!base.includes(e)) base.push(e);
    });
    return base;
  };

  const [layout, setLayout] = useState<string[]>(buildLayout());

  useEffect(() => {
    setLayout(buildLayout());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [favoritesData]);

  const GRID_CAPACITY = 36;
  const displayLayout: (string | null)[] = [...layout];
  while (displayLayout.length < GRID_CAPACITY) displayLayout.push(null);

  // 드래그 이동: 상태와 외부 상태 동기화 일원화
  const moveItem = (from: number, to: number) => {
    if (from === to) return;
    setLayout((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(from, 1);
      updated.splice(to, 0, moved);
      onUpdateFavorites({ ...favoritesData, layout: updated });
      return updated;
    });
  };

  const moveItemToFolder = (websiteId: string, folderId: string) => {
    const updatedFolders = favoritesData.folders.map((f) =>
      f.id === folderId ? { ...f, items: [...f.items, websiteId] } : f,
    );
    const updatedItems = favoritesData.items.filter((id) => id !== websiteId);
    const updatedLayout = (favoritesData.layout || []).filter(
      (e) => e !== `item:${websiteId}`,
    );
    onUpdateFavorites({
      ...favoritesData,
      items: updatedItems,
      folders: updatedFolders,
      layout: updatedLayout,
    });
    setLayout((prev) => prev.filter((e) => e !== `item:${websiteId}`));
  };

  const renderItemContent = (entry: string) => {
    const [type, id] = entry.split(':');
    if (type === 'item') {
      const site = websites.find((s) => s.id === id);
      if (!site) return null;
      return (
        <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow border h-full">
          {/* 헤더: 절대 포지셔닝으로 ★ 우측 고정, 제목은 줄임표 */}
          <div className="relative mb-2 pr-8">
            <a
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 min-w-0"
            >
              <SiteIcon website={site} size={20} className="w-5 h-5 rounded flex-shrink-0" />
              <h3 className="font-medium text-gray-800 truncate">{site.title}</h3>
            </a>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleToggleFavorite(site.id);
              }}
              aria-label="즐겨찾기 제거"
              className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-yellow-500"
              type="button"
            >
              <svg className="w-4 h-4 urwebs-star-icon favorited" viewBox="0 0 24 24" strokeWidth="1">
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
        <div className="h-full flex items-center justify-center cursor-move">
          {renderWidget(widget)}
        </div>
      );
    }
    if (type === 'folder') {
      const folder = favoritesData.folders.find((f) => f.id === id);
      if (!folder) return null;
      return (
        <div className="h-full bg-white p-4 rounded-lg shadow-md border flex flex-col items-center justify-center cursor-move">
          <span className="text-2xl">📁</span>
          <h3 className="font-medium mt-2">{folder.name}</h3>
        </div>
      );
    }
    return null;
  };

  const ITEM_TYPE = 'desktop-item';

  const DesktopItem = ({ entry, index }: { entry: string; index: number }) => {
    const ref = React.useRef<HTMLDivElement>(null);
    const [{ isOver }, drop] = useDrop({
      accept: ITEM_TYPE,
      drop: (item: { index: number; entry: string }) =>
        handleDrop(item, index, entry),
      collect: (monitor) => ({ isOver: monitor.isOver({ shallow: true }) }),
    });
    const [{ isDragging }, drag] = useDrag({
      type: ITEM_TYPE,
      item: { index, entry },
      collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    });
    drag(drop(ref));
    const isFolder = entry.startsWith('folder:');
    return (
      <div
        ref={ref}
        className={`h-24 cursor-move ${
          isFolder && isOver ? 'border-2 border-blue-500 rounded-lg' : ''
        }`}
        style={{ opacity: isDragging ? 0.5 : 1 }}
      >
        {renderItemContent(entry)}
      </div>
    );
  };

  const handleDrop = (
    item: { index: number; entry: string },
    targetIndex: number,
    targetEntry: string,
  ) => {
    if (targetEntry.startsWith('folder:') && item.entry.startsWith('item:')) {
      const websiteId = item.entry.split(':')[1];
      const folderId = targetEntry.split(':')[1];
      moveItemToFolder(websiteId, folderId);
    } else {
      moveItem(item.index, targetIndex);
    }
  };

  const EmptyCell = ({ index }: { index: number }) => {
    const [, drop] = useDrop({
      accept: ITEM_TYPE,
      drop: (item: { index: number }) => moveItem(item.index, index),
    });
    return <div ref={drop} className="h-24 border-2 border-dashed rounded-lg" />;
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
    categoryOrder.forEach((slug) => {
      const name = categoryConfig[slug]?.title ?? slug;
      acc[slug] = websites.filter(
        (site) => site.category === name || site.categorySlug === slug,
      );
    });
    return acc;
  }, [websites, categoryOrder, categoryConfig]);

  useEffect(() => {
    validateCategoryKeys(websites, categoryConfig, categoryOrder);
  }, [websites, categoryConfig, categoryOrder]);

  const isEmpty =
    favoritesData.items.length === 0 &&
    favoritesData.widgets.length === 0 &&
    favoritesData.folders.length === 0;
  if (loading) return <div className="p-6">로딩 중…</div>;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-purple-50 overflow-auto">
      {/* 적용 중 오버레이 */}
      {isApplying && (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="px-6 py-4 rounded-lg shadow bg-white border text-gray-700">
            스타터팩 적용 중…
          </div>
        </div>
      )}

      <div className="min-h-screen mx-auto px-4 md:px-6" style={{ maxWidth: '1440px' }}>
        <div className="py-8 space-y-12">
          {/* Header */}
          <div className="flex justify-between items-center relative">
            <div className="flex gap-2">
              {showStartGuide && (
                <>
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
                </>
              )}
            </div>
            <div className="text-center flex-1">
              <h1 className="text-4xl font-bold text-gray-800 mb-2">{pageTitle}</h1>
              {categoryTitle && (
                <p className="text-lg text-gray-700 mb-1">{categoryTitle}</p>
              )}
              <p className="text-xl text-gray-600">{formatDate(currentTime)}</p>
              <p className="text-3xl font-mono text-blue-600 mt-2">{formatTime(currentTime)}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowWidgetPicker((v) => !v)}
                aria-label="위젯 추가"
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                위젯 추가
              </button>
              <AddFolderButton onClick={handleAddFolder} />
              <button
                onClick={onClose}
                aria-label="닫기"
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                ✖ 닫기
              </button>
            </div>
          </div>
          {showWidgetPicker && (
            <div className="absolute right-0 mt-2 bg-white border rounded shadow-lg p-4 z-10">
              <p className="mb-2 font-medium">위젯 선택</p>
              {(['clock', 'weather', 'memo', 'todo'] as Widget['type'][]).map((t) => (
                <button
                  key={t}
                  onClick={() => handleAddWidget(t)}
                  className="block w-full text-left px-2 py-1 hover:bg-gray-100 rounded"
                >
                  {t}
                </button>
              ))}
              <button
                onClick={() => setShowWidgetPicker(false)}
                className="mt-2 text-sm text-gray-500"
              >
                닫기
              </button>
            </div>
          )}

          <DndProvider backend={HTML5Backend}>
            <div className="space-y-12">
              {showDesktop && !isEmpty && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">나의 바탕화면</h2>
                  <div className="grid grid-cols-6 gap-4">
                    {displayLayout.map((entry, idx) =>
                      entry ? (
                        <DesktopItem key={`${entry}-${idx}`} entry={entry} index={idx} />
                      ) : (
                        <EmptyCell key={`empty-${idx}`} index={idx} />
                      )
                    )}
                  </div>
                </div>
              )}

              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">전체 카테고리</h2>
                <div className="grid grid-cols-6 gap-x-2 gap-y-4 min-w-0">
                  {categoryOrder.map((slug) => {
                    const displayName =
                      categoryConfig[slug]?.title ?? slug;
                    return (
                      <CategoryCard
                        key={slug}
                        category={displayName}
                        sites={categorizedWebsites[slug] || []}
                        config={categoryConfig[slug]}
                        showDescriptions={showDescriptions}
                        favorites={favoritesData.items}
                        onToggleFavorite={handleToggleFavorite}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </DndProvider>
        </div>
      </div>
    </div>
  );
}
