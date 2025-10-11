import { useState, useEffect } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  closestCorners,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Edit, Save, Grid3x3, LayoutGrid } from 'lucide-react';
import { Button } from '../ui/button';
import { Column } from './Column';
import { WidgetCard } from './WidgetCard';
import { BoardState, Widget, WidgetType } from './types';
import { loadBoardState, saveBoardState, switchLayoutMode } from './storage';
import { useBoardSensors } from './dnd';
import {
  NewsWidget,
  LinksWidget,
  WeatherWidget,
  CalculatorWidget,
  MemoWidget,
  BookmarksWidget,
  CalendarWidget,
  ExchangeWidget,
  StockWidget,
  TodoWidget,
} from './widgets';

export function ColumnsBoard() {
  const [boardState, setBoardState] = useState<BoardState>(loadBoardState());
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeWidget, setActiveWidget] = useState<Widget | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [targetColumn, setTargetColumn] = useState<string | null>(null);

  const sensors = useBoardSensors();

  // 상태 변경 시 저장
  useEffect(() => {
    saveBoardState(boardState);
  }, [boardState]);

  // 드래그 시작
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const widget = boardState.widgets[active.id as string];
    setActiveWidget(widget || null);
  };

  // 드래그 중 (다른 컬럼으로 이동 감지)
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // 컬럼 위로 드래그하는 경우
    const activeColumn = findColumnByWidgetId(activeId);
    const overColumn = boardState.columns[overId] || findColumnByWidgetId(overId);

    if (!activeColumn || !overColumn) return;
    if (activeColumn.id === overColumn.id) return;

    // 다른 컬럼으로 이동
    setBoardState((prev) => {
      const activeItems = [...activeColumn.items];
      const overItems = [...overColumn.items];

      const activeIndex = activeItems.indexOf(activeId);
      const overIndex = overItems.indexOf(overId);

      // active 아이템 제거
      activeItems.splice(activeIndex, 1);
      
      // over 컬럼에 추가
      if (overIndex >= 0) {
        overItems.splice(overIndex, 0, activeId);
      } else {
        overItems.push(activeId);
      }

      return {
        ...prev,
        columns: {
          ...prev.columns,
          [activeColumn.id]: { ...activeColumn, items: activeItems },
          [overColumn.id]: { ...overColumn, items: overItems },
        },
      };
    });
  };

  // 드래그 종료
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveWidget(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeColumn = findColumnByWidgetId(activeId);
    if (!activeColumn) return;

    const overColumn = boardState.columns[overId] || findColumnByWidgetId(overId);
    if (!overColumn) return;

    // 같은 컬럼 내에서 순서 변경
    if (activeColumn.id === overColumn.id) {
      const items = [...activeColumn.items];
      const oldIndex = items.indexOf(activeId);
      const newIndex = items.indexOf(overId);

      if (oldIndex !== newIndex) {
        const reorderedItems = arrayMove(items, oldIndex, newIndex);
        setBoardState((prev) => ({
          ...prev,
          columns: {
            ...prev.columns,
            [activeColumn.id]: { ...activeColumn, items: reorderedItems },
          },
        }));
      }
    }
  };

  // 위젯 ID로 해당 컬럼 찾기
  const findColumnByWidgetId = (widgetId: string) => {
    return Object.values(boardState.columns).find((col) =>
      col.items.includes(widgetId)
    );
  };

  // 레이아웃 모드 전환
  const toggleLayoutMode = () => {
    const newMode = boardState.layoutMode === 3 ? 4 : 3;
    setBoardState(switchLayoutMode(boardState, newMode));
  };

  // 위젯 추가
  const handleAddWidget = (columnId: string) => {
    setTargetColumn(columnId);
    setShowAddModal(true);
  };

  const addWidget = (type: WidgetType) => {
    if (!targetColumn) return;

    const newWidgetId = `w-${type}-${Date.now()}`;
    const newWidget: Widget = {
      id: newWidgetId,
      type,
      title: getWidgetTitle(type),
    };

    setBoardState((prev) => ({
      ...prev,
      widgets: {
        ...prev.widgets,
        [newWidgetId]: newWidget,
      },
      columns: {
        ...prev.columns,
        [targetColumn]: {
          ...prev.columns[targetColumn],
          items: [...prev.columns[targetColumn].items, newWidgetId],
        },
      },
    }));

    setShowAddModal(false);
    setTargetColumn(null);
  };

  // 위젯 삭제
  const deleteWidget = (widgetId: string) => {
    const column = findColumnByWidgetId(widgetId);
    if (!column) return;

    setBoardState((prev) => {
      const newWidgets = { ...prev.widgets };
      delete newWidgets[widgetId];

      return {
        ...prev,
        widgets: newWidgets,
        columns: {
          ...prev.columns,
          [column.id]: {
            ...column,
            items: column.items.filter((id) => id !== widgetId),
          },
        },
      };
    });
  };

  // 위젯 타입별 제목
  const getWidgetTitle = (type: WidgetType): string => {
    const titles: Record<WidgetType, string> = {
      news: '최신 뉴스',
      links: '링크 모음',
      weather: '날씨',
      calculator: '계산기',
      memo: '메모',
      bookmarks: '즐겨찾기',
      calendar: '캘린더',
      exchange: '환율',
      stock: '주식',
      todo: '할 일',
    };
    return titles[type] || '새 위젯';
  };

  // 위젯 렌더링 (DragOverlay용)
  const renderWidgetContent = (widget: Widget) => {
    switch (widget.type) {
      case 'news':
        return <NewsWidget />;
      case 'links':
        return <LinksWidget />;
      case 'weather':
        return <WeatherWidget />;
      case 'calculator':
        return <CalculatorWidget />;
      case 'memo':
        return <MemoWidget />;
      case 'bookmarks':
        return <BookmarksWidget />;
      case 'calendar':
        return <CalendarWidget />;
      case 'exchange':
        return <ExchangeWidget />;
      case 'stock':
        return <StockWidget />;
      case 'todo':
        return <TodoWidget />;
      default:
        return null;
    }
  };

  const availableWidgetTypes: { type: WidgetType; label: string; icon: string }[] = [
    { type: 'news', label: '뉴스', icon: '📰' },
    { type: 'links', label: '링크 모음', icon: '🔗' },
    { type: 'weather', label: '날씨', icon: '🌤️' },
    { type: 'calculator', label: '계산기', icon: '🧮' },
    { type: 'memo', label: '메모', icon: '📝' },
    { type: 'bookmarks', label: '즐겨찾기', icon: '⭐' },
    { type: 'calendar', label: '캘린더', icon: '📅' },
    { type: 'exchange', label: '환율', icon: '💱' },
    { type: 'stock', label: '주식', icon: '📈' },
    { type: 'todo', label: '할 일', icon: '✅' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sticky Header */}
      <div className="sticky top-0 z-[1000] bg-white/85 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* 레이아웃 스위처 */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleLayoutMode}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  boardState.layoutMode === 3
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                aria-label="3열 레이아웃"
              >
                <Grid3x3 className="w-4 h-4" />
                3열
              </button>
              <button
                onClick={toggleLayoutMode}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  boardState.layoutMode === 4
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                aria-label="4열 레이아웃"
              >
                <LayoutGrid className="w-4 h-4" />
                4열
              </button>
            </div>

            {/* 편집 모드 토글 */}
            <Button
              onClick={() => setIsEditMode(!isEditMode)}
              variant={isEditMode ? 'default' : 'outline'}
              size="sm"
              className={`${
                isEditMode
                  ? 'bg-orange-500 hover:bg-orange-600 text-white'
                  : 'hover:bg-gray-100'
              }`}
              aria-label={isEditMode ? '편집 완료' : '편집 모드'}
            >
              {isEditMode ? (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  편집 완료
                </>
              ) : (
                <>
                  <Edit className="w-4 h-4 mr-2" />
                  편집
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 - 헤더 높이만큼 패딩 */}
      <div className="pt-4 px-4 pb-8">
        <div className="max-w-7xl mx-auto">
          {/* 편집 모드 안내 */}
          {isEditMode && (
            <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-800">
                <strong>편집 모드:</strong> 위젯을 드래그하여 같은 컬럼 내에서 순서를 변경하거나 다른 컬럼으로 이동할 수 있습니다.
              </p>
            </div>
          )}

          {/* 드래그 앤 드롭 컨텍스트 */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            {/* 컬럼 그리드 */}
            <div
              className="grid gap-6"
              style={{
                gridTemplateColumns: `repeat(${boardState.layoutMode}, minmax(0, 1fr))`,
              }}
            >
              {boardState.columnsOrder.slice(0, boardState.layoutMode).map((columnId) => {
                const column = boardState.columns[columnId];
                if (!column) return null;

                const widgets = column.items
                  .map((widgetId) => boardState.widgets[widgetId])
                  .filter(Boolean);

                return (
                  <Column
                    key={column.id}
                    column={column}
                    widgets={widgets}
                    isEditMode={isEditMode}
                    onAddWidget={handleAddWidget}
                    onDeleteWidget={deleteWidget}
                  />
                );
              })}
            </div>

            {/* 드래그 오버레이 */}
            <DragOverlay>
              {activeWidget ? (
                <div className="opacity-90">
                  <WidgetCard widget={activeWidget} isEditMode={false}>
                    {renderWidgetContent(activeWidget)}
                  </WidgetCard>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </div>

      {/* 위젯 추가 모달 */}
      {showAddModal && (
        <div className="fixed inset-0 z-[2000] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">위젯 추가</h3>
            <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {availableWidgetTypes.map((widget) => (
                <button
                  key={widget.type}
                  onClick={() => addWidget(widget.type)}
                  className="p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
                >
                  <div className="text-3xl mb-2">{widget.icon}</div>
                  <div className="text-sm font-medium text-gray-700 group-hover:text-blue-600">
                    {widget.label}
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                setShowAddModal(false);
                setTargetColumn(null);
              }}
              className="mt-4 w-full py-2 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              취소
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // 위젯 컨텐츠 렌더링 (DragOverlay용)
  function renderWidgetContent(widget: Widget) {
    switch (widget.type) {
      case 'news':
        return <NewsWidget />;
      case 'links':
        return <LinksWidget />;
      case 'weather':
        return <WeatherWidget />;
      case 'calculator':
        return <CalculatorWidget />;
      case 'memo':
        return <MemoWidget />;
      case 'bookmarks':
        return <BookmarksWidget />;
      case 'calendar':
        return <CalendarWidget />;
      case 'exchange':
        return <ExchangeWidget />;
      case 'stock':
        return <StockWidget />;
      case 'todo':
        return <TodoWidget />;
      default:
        return null;
    }
  }
}






















