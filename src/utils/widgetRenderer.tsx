import React from 'react';
import { Widget } from '../types/mypage.types';
import { isWidgetEditable } from '../components/widgets/utils/widget-helpers';
import {
  TodoWidget,
  BookmarkWidget,
  GoogleSearchWidget,
  NaverSearchWidget,
  LawSearchWidget,
  EnglishWordsWidget,
  WeatherWidget,
  CryptoWidget,
  EconomicCalendarWidget,
  ExchangeWidget,
  GoogleAdWidget,
  FrequentSitesWidget,
  NewsWidget
} from '../components/widgets';

export function renderWidget(widget: Widget): React.ReactNode {
  const commonProps = {
    widget,
    isEditMode: false,
    updateWidget: () => {}
  } as any;

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
}
