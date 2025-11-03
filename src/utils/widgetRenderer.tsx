import React from 'react';
import { Widget } from '../types/mypage.types';
import { isWidgetEditable } from '../components/widgets/utils/widget-helpers';
import {
  TodoWidget,
  BookmarkWidget,
  EnglishWordsWidget,
  WeatherWidget,
  CryptoWidget,
  EconomicCalendarWidget,
  ExchangeWidget,
  GoogleAdWidget,
  FrequentSitesWidget,
  NewsWidget,
  QRCodeWidget,
  UnifiedSearchWidget,
  GoogleSearchWidget,
  NaverSearchWidget,
  LawSearchWidget,
  QuoteWidget,
  QuickNoteWidget,
  ImageWidget,
  ThemeWidget
} from '../components/widgets';
import { CalendarWidget } from '../components/ColumnsBoard/widgets/CalendarWidget';

export function renderWidget(widget: Widget): React.ReactNode {
  if (!widget || !widget.type) {
    return (
      <div className="text-center text-red-500 text-sm">
        <div>위젯 데이터 오류</div>
      </div>
    );
  }
  
  const commonProps = {
    widget,
    isEditMode: false,
    updateWidget: () => {}
  } as any;

  try {
    switch (widget.type) {
      case 'todo':
        return <TodoWidget {...commonProps} />;
      case 'bookmark':
        return <BookmarkWidget {...commonProps} />;
      case 'google_search':
        return <GoogleSearchWidget {...commonProps} />;
      case 'naver_search':
        return <NaverSearchWidget {...commonProps} />;
      case 'law_search':
        return <LawSearchWidget {...commonProps} />;
      case 'english_words':
        return <EnglishWordsWidget {...commonProps} />;
      case 'weather':
        return <WeatherWidget {...commonProps} />;
      case 'crypto':
        return <CryptoWidget {...commonProps} />;
      case 'economic_calendar':
        return <EconomicCalendarWidget {...commonProps} />;
      case 'exchange':
        return <ExchangeWidget {...commonProps} />;
      case 'google_ad':
        return <GoogleAdWidget {...commonProps} />;
      case 'frequent_sites':
        return <FrequentSitesWidget {...commonProps} />;
      case 'news':
        return <NewsWidget {...commonProps} />;
      case 'calendar':
        return <CalendarWidget />;
      case 'qr_code':
        return <QRCodeWidget {...commonProps} />;
      case 'unified_search':
        return <UnifiedSearchWidget {...commonProps} />;
      case 'quote':
        return <QuoteWidget {...commonProps} />;
      case 'quicknote':
        return <QuickNoteWidget {...commonProps} />;
      case 'image':
        return <ImageWidget {...commonProps} />;
      case 'theme':
        return <ThemeWidget {...commonProps} />;
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
