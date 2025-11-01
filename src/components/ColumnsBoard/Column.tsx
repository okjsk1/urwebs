import { Plus } from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Column as ColumnType, Widget } from './types';
import { WidgetCard } from './WidgetCard';
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

interface ColumnProps {
  column: ColumnType;
  widgets: Widget[];
  isEditMode: boolean;
  onAddWidget?: (columnId: string) => void;
  onDeleteWidget?: (widgetId: string) => void;
  onWidgetResize?: (widgetId: string, minHeight: number) => void;
}

export function Column({ column, widgets, isEditMode, onAddWidget, onDeleteWidget, onWidgetResize }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  // 위젯 타입에 따라 컴포넌트 렌더링
  const renderWidgetContent = (widget: Widget) => {
    switch (widget.type) {
      case 'news':
        return <NewsWidget />;
      case 'links':
        return <LinksWidget />;
      case 'weather':
        return <WeatherWidget />;
      case 'todo':
        return <TodoWidget />;
      case 'memo':
        return <MemoWidget />;
      case 'bookmarks':
        return <BookmarksWidget widget={widget} onResize={onWidgetResize} />;
      case 'calendar':
        return <CalendarWidget />;
      case 'exchange':
        return <ExchangeWidget />;
      case 'stock':
        return <StockWidget />;
      default:
        return <div className="text-sm text-gray-500">알 수 없는 위젯</div>;
    }
  };

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col min-h-[400px] transition-colors ${
        isOver ? 'bg-blue-50/50' : ''
      }`}
    >
      {/* 컬럼 헤더 */}
      {column.title && (
        <div className="mb-4 pb-2 border-b border-gray-200">
          <h2 className="font-bold text-lg text-gray-800">{column.title}</h2>
        </div>
      )}

      {/* 드롭 영역 & 정렬 가능한 아이템들 */}
      <SortableContext items={column.items} strategy={verticalListSortingStrategy}>
        <div className="space-y-5 flex-1">
          {widgets.map((widget) => (
            <WidgetCard
              key={widget.id}
              widget={widget}
              isEditMode={isEditMode}
              onDelete={onDeleteWidget}
            >
              {renderWidgetContent(widget)}
            </WidgetCard>
          ))}
          
          {/* 플레이스홀더 (빈 컬럼일 때) */}
          {widgets.length === 0 && !isEditMode && (
            <div className="text-center py-12 text-gray-400 text-sm">
              <div className="text-4xl mb-2">📭</div>
              <div>위젯이 없습니다</div>
            </div>
          )}
        </div>
      </SortableContext>

      {/* 위젯 추가 버튼 (편집 모드일 때만) */}
      {isEditMode && onAddWidget && (
        <button
          onClick={() => onAddWidget(column.id)}
          className="mt-4 w-full p-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-sm text-gray-600 hover:text-blue-600 font-medium flex items-center justify-center gap-2"
          aria-label={`${column.title || '컬럼'}에 위젯 추가`}
        >
          <Plus className="w-4 h-4" />
          위젯 추가
        </button>
      )}
    </div>
  );
}































