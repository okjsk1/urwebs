import React from 'react';
import { Widget } from '../types/mypage.types';
import {
  CalendarWidget,
  WeatherSmallWidget,
  TodoWidget,
  NewsWidget,
  BookmarkWidget,
  SocialWidget,
  MusicWidget,
  CalculatorWidget,
  ContactWidget,
  QRCodeWidget,
  GitHubWidget,
  GoogleSearchWidget,
  NaverSearchWidget,
  YoutubeSearchWidget,
  LawSearchWidget,
  EnglishWordsWidget
} from '../components/widgets';

export function renderWidget(widget: Widget): React.ReactNode {
  const commonProps = {
    widget,
    isEditMode: false,
    updateWidget: () => {}
  } as any;

  switch (widget.type) {
    case 'calendar':
      return <CalendarWidget {...commonProps} />;
    case 'weather_small':
      return <WeatherSmallWidget {...commonProps} />;
    case 'todo':
      return <TodoWidget {...commonProps} />;
    case 'news':
      return <NewsWidget {...commonProps} />;
    case 'bookmark':
      return <BookmarkWidget {...commonProps} />;
    case 'social':
      return <SocialWidget {...commonProps} />;
    case 'music':
      return <MusicWidget {...commonProps} />;
    case 'calculator':
      return <CalculatorWidget {...commonProps} />;
    case 'contact':
      return <ContactWidget {...commonProps} />;
    case 'qr_code':
      return <QRCodeWidget {...commonProps} />;
    case 'github_repo':
      return <GitHubWidget {...commonProps} />;
    case 'google_search':
      return <GoogleSearchWidget {...commonProps} />;
    case 'naver_search':
      return <NaverSearchWidget {...commonProps} />;
    case 'youtube_search':
      return <YoutubeSearchWidget {...commonProps} />;
    case 'law_search':
      return <LawSearchWidget {...commonProps} />;
    case 'english_words':
      return <EnglishWordsWidget {...commonProps} />;
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

