import React from 'react';
import { Grid } from 'lucide-react';
import { allWidgets } from '../constants/widgetCategories';

// 위젯 컴포넌트들 import
import {
  TodoWidget,
  GoalWidget,
  ReminderWidget,
  QuickNoteWidget,
  CalendarWidget,
  StockWidget,
  ExchangeWidget,
  ConverterWidget,
  QRCodeWidget,
  NewsWidget,
  WeatherWidget,
  GoogleSearchWidget,
  NaverSearchWidget,
  LawSearchWidget,
  BookmarkWidget,
  EnglishWordsWidget,
  GoogleAdWidget,
  FrequentSitesWidget,
  CryptoWidget,
  CryptoWidgetSingle,
  CryptoWidgetTriple,
  EconomicCalendarWidget,
  QuoteWidget
} from '../components/widgets';

// 위젯 렌더링 함수 (공개 페이지용)
export const renderWidget = (widget: any, isEditMode: boolean = false, updateWidget?: (id: string, updates: any) => void) => {
  if (!widget) return null;

  return (
    <div
      className={`relative h-full overflow-hidden bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col ${
        isEditMode ? 'ring-2 ring-blue-500 shadow-lg' : ''
      }`}
      style={{
        zIndex: 1
      }}
    >
      {/* 위젯 헤더 - 고정 */}
      <div
        className="px-2 py-0.5 border-b border-gray-100 bg-gray-50 flex items-center justify-between cursor-move group flex-shrink-0"
      >
        <div className="flex items-center gap-2 flex-1">
          <span className="text-xs font-medium text-gray-800">{widget.title}</span>
        </div>
      </div>

      {/* 위젯 콘텐츠 - 스크롤 가능 */}
      <div className="flex-1 bg-transparent overflow-y-auto">
        <div className="p-3">
          {renderWidgetContent(widget, isEditMode, updateWidget)}
        </div>
      </div>
    </div>
  );
};

// 편집 모드용 위젯 렌더링 함수
export const renderEditModeWidget = (
  widget: any, 
  originalWidget: any,
  isSelected: boolean,
  isDragging: boolean,
  dragOverWidget: string | null,
  draggedWidget: string | null,
  isReordering: boolean,
  selectWidget: (id: string) => void,
  setDragOverWidget: (id: string | null) => void,
  reorderWidgets: (draggedId: string, targetId: string) => void,
  handleMouseDown: (e: React.MouseEvent, id: string) => void,
  updateWidget: (id: string, updates: any) => void,
  editWidget: (id: string) => void,
  removeWidget: (id: string) => void,
  SizePicker: any
) => {
  if (!originalWidget) return null;
  
  const WidgetIcon = allWidgets.find(w => w.type === originalWidget.type)?.icon || Grid;

  return (
    <div
      className={`relative h-full overflow-hidden bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col ${
        isSelected ? 'ring-2 ring-blue-500 shadow-lg' : ''
      } ${isDragging ? 'opacity-75' : ''} ${
        dragOverWidget === originalWidget.id && draggedWidget !== originalWidget.id ? 'ring-2 ring-green-500 bg-green-50' : ''
      }`}
      style={{
        zIndex: isDragging ? 10 : isSelected ? 5 : 1
      }}
      onClick={() => selectWidget(originalWidget.id)}
      onMouseEnter={() => {
        if (isReordering && draggedWidget && draggedWidget !== originalWidget.id) {
          setDragOverWidget(originalWidget.id);
        }
      }}
      onMouseLeave={() => {
        if (isReordering) {
          setDragOverWidget(null);
        }
      }}
      onMouseUp={() => {
        if (isReordering && draggedWidget && dragOverWidget === originalWidget.id) {
          reorderWidgets(draggedWidget, originalWidget.id);
        }
      }}
    >
      {/* 위젯 헤더 - 고정 */}
      <div
        data-drag-handle="true"
        data-widget-id={originalWidget.id}
        className="px-2 py-0.5 border-b border-gray-100 bg-gray-50 flex items-center justify-between cursor-move group flex-shrink-0"
        onMouseDown={(e) => {
          // 버튼이나 입력창을 클릭한 경우 드래그 방지
          const target = e.target as HTMLElement;
          if (target.tagName === 'BUTTON' ||
              target.tagName === 'INPUT' ||
              target.tagName === 'TEXTAREA' ||
              target.tagName === 'SELECT' ||
              target.closest('button') ||
              target.closest('input') ||
              target.closest('textarea') ||
              target.closest('select')) {
            return;
          }

          // 드래그 핸들에서만 드래그 시작
          e.preventDefault();
          e.stopPropagation();
          handleMouseDown(e, originalWidget.id);
        }}
      >
        <div className="flex items-center gap-2 flex-1">
          <span className="text-xs font-medium text-gray-800">{originalWidget.title}</span>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* 사이즈 선택기 */}
          <SizePicker
            value={originalWidget.gridSize || { w: 1, h: 1 }}
            onChange={(newSize: any) => {
              updateWidget(originalWidget.id, { ...originalWidget, gridSize: newSize });
            }}
          />
          <button
            className="h-6 w-6 p-0 hover:bg-blue-100 rounded"
            onClick={(e) => {
              e.stopPropagation();
              editWidget(originalWidget.id);
            }}
            title="위젯 편집"
          >
            <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            className="h-6 w-6 p-0 hover:bg-red-100 rounded"
            onClick={(e) => {
              e.stopPropagation();
              removeWidget(originalWidget.id);
            }}
            title="위젯 삭제"
          >
            <svg className="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* 위젯 콘텐츠 - 스크롤 가능 */}
      <div
        className="flex-1 bg-transparent overflow-y-auto"
        onMouseDown={(e) => {
          // 위젯 본문에서는 드래그 완전 방지
          e.stopPropagation();
        }}
      >
        <div className="p-3">
          {renderWidgetContent(originalWidget, true, updateWidget)}
        </div>
      </div>
    </div>
  );
};

// 위젯 콘텐츠 렌더링
export const renderWidgetContent = (widget: any, isEditMode: boolean = false, updateWidget?: (id: string, updates: any) => void) => {
  switch (widget.type) {
    case 'bookmark':
      return <BookmarkWidget widget={widget} isEditMode={isEditMode} updateWidget={updateWidget} />;

    case 'weather':
      return <WeatherWidget widget={widget} isEditMode={isEditMode} updateWidget={updateWidget} />;

    case 'calendar':
      return <CalendarWidget widget={widget} isEditMode={isEditMode} updateWidget={updateWidget} />;

    case 'todo':
      return <TodoWidget widget={widget} isEditMode={isEditMode} updateWidget={updateWidget} />;

    case 'quicknote':
      return <QuickNoteWidget widget={widget} isEditMode={isEditMode} updateWidget={updateWidget} />;

    case 'english_words':
      return <EnglishWordsWidget widget={widget} isEditMode={isEditMode} updateWidget={updateWidget} />;

    case 'quote':
      return <QuoteWidget widget={widget} isEditMode={isEditMode} updateWidget={updateWidget} />;

    case 'exchange':
      return <ExchangeWidget widget={widget} isEditMode={isEditMode} updateWidget={updateWidget} />;

    case 'google_search':
      return <GoogleSearchWidget widget={widget} isEditMode={isEditMode} updateWidget={updateWidget} />;

    case 'naver_search':
      return <NaverSearchWidget widget={widget} isEditMode={isEditMode} updateWidget={updateWidget} />;

    case 'law_search':
      return <LawSearchWidget widget={widget} isEditMode={isEditMode} updateWidget={updateWidget} />;

    case 'stock':
      return <StockWidget widget={widget} isEditMode={isEditMode} updateWidget={updateWidget} />;

    case 'crypto':
      return <CryptoWidget widget={widget} isEditMode={isEditMode} updateWidget={updateWidget} />;

    case 'crypto_single':
      return <CryptoWidgetSingle widget={widget} isEditMode={isEditMode} updateWidget={updateWidget} />;

    case 'crypto_triple':
      return <CryptoWidgetTriple widget={widget} isEditMode={isEditMode} updateWidget={updateWidget} />;

    case 'news':
      return <NewsWidget widget={widget} isEditMode={isEditMode} updateWidget={updateWidget} />;

    case 'economic_calendar':
      return <EconomicCalendarWidget widget={widget} isEditMode={isEditMode} updateWidget={updateWidget} />;

    case 'google_ad':
      return <GoogleAdWidget widget={widget} isEditMode={isEditMode} updateWidget={updateWidget} />;

    case 'frequent_sites':
      return <FrequentSitesWidget widget={widget} isEditMode={isEditMode} updateWidget={updateWidget} />;

    case 'goal':
      return <GoalWidget widget={widget} isEditMode={isEditMode} updateWidget={updateWidget} />;

    case 'reminder':
      return <ReminderWidget widget={widget} isEditMode={isEditMode} updateWidget={updateWidget} />;

    case 'converter':
      return <ConverterWidget widget={widget} isEditMode={isEditMode} updateWidget={updateWidget} />;

    case 'qr_code':
      return <QRCodeWidget widget={widget} isEditMode={isEditMode} updateWidget={updateWidget} />;

    default:
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center">
            <div className="text-2xl mb-2">📦</div>
            <div className="text-sm">알 수 없는 위젯</div>
            <div className="text-xs text-gray-400 mt-1">{widget.type}</div>
          </div>
        </div>
      );
  }
};