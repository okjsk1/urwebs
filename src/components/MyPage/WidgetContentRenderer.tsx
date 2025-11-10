import React, { Suspense, useMemo } from 'react';
import { ContactIcon } from 'lucide-react';
import { Widget } from '../../types/mypage.types';

const lazy = <T extends React.ComponentType<any>>(loader: () => Promise<{ default: T }>) =>
  React.lazy(loader);

const BookmarkWidget = lazy(() => import('../widgets/BookmarkWidget').then(m => ({ default: m.BookmarkWidget })));
const WeatherWidget = lazy(() => import('../widgets/WeatherWidget').then(m => ({ default: m.WeatherWidget })));
const TodoWidget = lazy(() => import('../widgets/TodoWidget').then(m => ({ default: m.TodoWidget })));
const CryptoWidget = lazy(() => import('../widgets/CryptoWidget').then(m => ({ default: m.CryptoWidget })));
const EconomicCalendarWidget = lazy(() => import('../widgets/EconomicCalendarWidget').then(m => ({ default: m.EconomicCalendarWidget })));
const EnglishWordsWidget = lazy(() => import('../widgets/EnglishWordsWidget').then(m => ({ default: m.EnglishWordsWidget })));
const ExchangeWidget = lazy(() => import('../widgets/ExchangeWidget').then(m => ({ default: m.ExchangeWidget })));
const NewsWidget = lazy(() => import('../widgets/NewsWidget').then(m => ({ default: m.NewsWidget })));
const GoogleSearchWidget = lazy(() => import('../widgets/GoogleSearchWidget').then(m => ({ default: m.GoogleSearchWidget })));
const NaverSearchWidget = lazy(() => import('../widgets/NaverSearchWidget').then(m => ({ default: m.NaverSearchWidget })));
const LawSearchWidget = lazy(() => import('../widgets/LawSearchWidget').then(m => ({ default: m.LawSearchWidget })));
const UnifiedSearchWidget = lazy(() => import('../widgets/UnifiedSearchWidget').then(m => ({ default: m.UnifiedSearchWidget })));
const QRCodeWidget = lazy(() => import('../widgets/QRCodeWidget').then(m => ({ default: m.QRCodeWidget })));
const FrequentSitesWidget = lazy(() => import('../widgets/FrequentSitesWidget').then(m => ({ default: m.FrequentSitesWidget })));
const GoogleAdWidget = lazy(() => import('../widgets/GoogleAdWidget').then(m => ({ default: m.GoogleAdWidget })));
const QuoteWidget = lazy(() => import('../widgets/QuoteWidget').then(m => ({ default: m.QuoteWidget })));
const QuickNoteWidget = lazy(() => import('../widgets/QuickNoteWidget').then(m => ({ default: m.QuickNoteWidget })));
const ImageWidget = lazy(() => import('../widgets/ImageWidget').then(m => ({ default: m.ImageWidget })));
const TimerWidget = lazy(() => import('../widgets').then(m => ({ default: m.TimerWidget })));
const DdayWidget = lazy(() => import('../widgets').then(m => ({ default: m.DdayWidget })));
const CalendarWidget = lazy(() => import('../ColumnsBoard/widgets/CalendarWidget').then(m => ({ default: m.CalendarWidget })));
const TableWidget = lazy(() => import('../widgets/TableWidget').then(m => ({ default: m.TableWidget })));

const widgetSkeleton = (
  <div className="w-full h-full animate-pulse rounded-xl bg-gray-100 dark:bg-gray-700/40" />
);

interface WidgetContentRendererProps {
  widget: Widget;
  isEditMode: boolean;
  updateWidget: (id: string, updates: Partial<Widget>) => void;
  widgets: Widget[];
  setWidgets: React.Dispatch<React.SetStateAction<Widget[]>>;
  onMoveBookmarkToWidget?: (bookmark: any, sourceWidgetId: string, targetWidgetId: string) => void;
}

export function WidgetContentRenderer({
  widget,
  isEditMode,
  updateWidget,
  widgets,
  setWidgets: _setWidgets,
  onMoveBookmarkToWidget,
}: WidgetContentRendererProps) {
  const commonProps = useMemo(
    () => ({
      widget,
      isEditMode,
      updateWidget,
    }),
    [widget, isEditMode, updateWidget]
  );

  const bookmarkProps = useMemo(
    () => ({
      ...commonProps,
      onBookmarkCountChange: () => {},
      onMoveBookmarkToWidget,
      allWidgets: widgets,
    }),
    [commonProps, onMoveBookmarkToWidget, widgets]
  );

  try {
    switch (widget.type) {
      case 'bookmark':
        return (
          <Suspense fallback={widgetSkeleton}>
            <BookmarkWidget {...bookmarkProps} />
          </Suspense>
        );
      case 'weather':
        return (
          <Suspense fallback={widgetSkeleton}>
            <WeatherWidget {...commonProps} />
          </Suspense>
        );
      case 'todo':
        return (
          <Suspense fallback={widgetSkeleton}>
            <TodoWidget {...commonProps} />
          </Suspense>
        );
      case 'crypto':
        return (
          <Suspense fallback={widgetSkeleton}>
            <CryptoWidget {...commonProps} />
          </Suspense>
        );
      case 'stock_alert':
        return null;
      case 'calendar':
        return (
          <Suspense fallback={widgetSkeleton}>
            <CalendarWidget
              value={widget.content?.selectedDate ? new Date(widget.content.selectedDate) : null}
              onSelectDate={(date) =>
                updateWidget(widget.id, {
                  content: { ...widget.content, selectedDate: date.toISOString() },
                })
              }
              className="h-full"
              size={widget.size as '1x1' | '1x2' | '2x2'}
            />
          </Suspense>
        );
      case 'economic_calendar':
        return (
          <Suspense fallback={widgetSkeleton}>
            <EconomicCalendarWidget {...commonProps} />
          </Suspense>
        );
      case 'expense':
        return (
          <div className="h-full flex items-center justify-center text-xs text-gray-500 bg-gray-50">
            가계부 위젯은 지원 중단되었습니다
          </div>
        );
      case 'english_words':
        return (
          <Suspense fallback={widgetSkeleton}>
            <EnglishWordsWidget {...commonProps} />
          </Suspense>
        );
      case 'exchange':
        return (
          <Suspense fallback={widgetSkeleton}>
            <ExchangeWidget {...commonProps} />
          </Suspense>
        );
      case 'news':
        return (
          <Suspense fallback={widgetSkeleton}>
            <NewsWidget
              id={widget.id}
              title={widget.title || '뉴스'}
              size={widget.gridSize?.h === 1 ? 's' : widget.gridSize?.h === 2 ? 'm' : 'l'}
              onRemove={() => {}}
              onResize={() => {}}
              onPin={() => {}}
              embedded
            />
          </Suspense>
        );
      case 'google_search':
        return (
          <Suspense fallback={widgetSkeleton}>
            <GoogleSearchWidget
              id={widget.id}
              title={widget.title || '구글 검색'}
              size={widget.gridSize?.h === 1 ? 's' : widget.gridSize?.h === 2 ? 'm' : 'l'}
              onRemove={() => {}}
              onResize={() => {}}
              onPin={() => {}}
            />
          </Suspense>
        );
      case 'naver_search':
        return (
          <Suspense fallback={widgetSkeleton}>
            <NaverSearchWidget
              id={widget.id}
              title={widget.title || '네이버 검색'}
              size={widget.gridSize?.h === 1 ? 's' : widget.gridSize?.h === 2 ? 'm' : 'l'}
              onRemove={() => {}}
              onResize={() => {}}
              onPin={() => {}}
            />
          </Suspense>
        );
      case 'law_search':
        return (
          <Suspense fallback={widgetSkeleton}>
            <LawSearchWidget
              id={widget.id}
              title={widget.title || '법제처 검색'}
              size={widget.gridSize?.h === 1 ? 's' : widget.gridSize?.h === 2 ? 'm' : 'l'}
              onRemove={() => {}}
              onResize={() => {}}
              onPin={() => {}}
            />
          </Suspense>
        );
      case 'unified_search':
        return (
          <Suspense fallback={widgetSkeleton}>
            <UnifiedSearchWidget
              {...commonProps}
              size={widget.gridSize?.h === 1 ? 's' : widget.gridSize?.h === 2 ? 'm' : 'l'}
            />
          </Suspense>
        );
      case 'qr_code':
        return (
          <Suspense fallback={widgetSkeleton}>
            <QRCodeWidget {...commonProps} />
          </Suspense>
        );
      case 'frequent_sites':
        return (
          <Suspense fallback={widgetSkeleton}>
            <FrequentSitesWidget
              widget={widget}
              isEditMode={isEditMode}
              updateWidget={updateWidget}
            />
          </Suspense>
        );
      case 'google_ad':
        return (
          <Suspense fallback={widgetSkeleton}>
            <GoogleAdWidget {...commonProps} />
          </Suspense>
        );
      case 'table':
        return (
          <Suspense fallback={widgetSkeleton}>
            <TableWidget {...commonProps} />
          </Suspense>
        );
      case 'quote':
        return (
          <Suspense fallback={widgetSkeleton}>
            <QuoteWidget
              id={widget.id}
              title={widget.title || '영감 명언'}
              size={widget.gridSize?.w === 2 ? 'm' : 's'}
              onRemove={() => {}}
              onResize={() => {}}
              onPin={() => {}}
              embedded
            />
          </Suspense>
        );
      case 'contact':
        return (
          <div className="space-y-3">
            <div className="text-center">
              <ContactIcon className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <h4 className="font-semibold text-gray-800">문의하기</h4>
              <p className="text-xs text-gray-600">사이트 개설자에게 문의</p>
            </div>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="이름"
                id={`contact-name-${widget.id}`}
                className="w-full p-2 text-xs border rounded"
              />
              <input
                type="email"
                placeholder="이메일"
                id={`contact-email-${widget.id}`}
                className="w-full p-2 text-xs border rounded"
              />
              <input
                type="tel"
                placeholder="연락처 (예: 010-1234-5678)"
                id={`contact-phone-${widget.id}`}
                className="w-full p-2 text-xs border rounded"
              />
              <textarea
                placeholder="문의 내용"
                id={`contact-message-${widget.id}`}
                className="w-full p-2 text-xs border rounded h-16 resize-none"
              />
            </div>
          </div>
        );
      case 'quicknote':
        return (
          <Suspense fallback={widgetSkeleton}>
            <QuickNoteWidget
              id={widget.id}
              title={widget.title || '빠른 메모'}
              size={
                widget.gridSize?.h === 1
                  ? 's'
                  : widget.gridSize?.h === 2
                  ? 'm'
                  : widget.gridSize?.h === 3
                  ? 'l'
                  : 's'
              }
              onRemove={() => {}}
              onResize={() => {}}
              onPin={() => {}}
              widget={widget}
              isEditMode={isEditMode}
              updateWidget={updateWidget}
            />
          </Suspense>
        );
      case 'timer':
        return (
          <Suspense fallback={widgetSkeleton}>
            <TimerWidget
              id={widget.id}
              title={widget.title || '타이머'}
              size={widget.gridSize?.h === 1 ? 's' : widget.gridSize?.h === 2 ? 'm' : 'l'}
              onRemove={() => {}}
              onResize={() => {}}
              onPin={() => {}}
            />
          </Suspense>
        );
      case 'dday':
        return (
          <Suspense fallback={widgetSkeleton}>
            <DdayWidget
              id={widget.id}
              title={widget.title || 'D-Day'}
              size={widget.gridSize?.h === 1 ? 's' : widget.gridSize?.h === 2 ? 'm' : 'l'}
              onRemove={() => {}}
              onResize={() => {}}
              onPin={() => {}}
            />
          </Suspense>
        );
      case 'image':
        return (
          <Suspense fallback={widgetSkeleton}>
            <ImageWidget {...commonProps} />
          </Suspense>
        );
      default:
        return (
          <div className="flex items-center justify-center h-full bg-gray-100 text-gray-500 text-sm">
            <div className="text-center">
              <div className="text-2xl mb-2">📦</div>
              <div>{widget.title}</div>
              <div className="text-xs mt-1 opacity-70">{widget.type}</div>
            </div>
          </div>
        );
    }
  } catch (error) {
    console.error('위젯 렌더링 중 오류 발생:', error, '위젯:', widget);
    return (
      <div className="flex items-center justify-center h-full bg-red-100 text-red-500 text-sm">
        <div className="text-center">
          <div className="text-2xl mb-2">⚠️</div>
          <div>렌더링 오류</div>
          <div className="text-xs mt-1">{widget.type}</div>
        </div>
      </div>
    );
  }
}
