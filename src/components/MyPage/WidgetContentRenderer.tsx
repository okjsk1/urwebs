import React from 'react';
import { Widget } from '../../types/mypage.types';
import {
  TodoWidget,
  ExchangeWidget,
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
  EconomicCalendarWidget,
  QuoteWidget,
  QRCodeWidget,
  UnifiedSearchWidget
} from '../widgets';
import { ContactIcon } from 'lucide-react';

interface WidgetContentRendererProps {
  widget: Widget;
  isEditMode: boolean;
  updateWidget: (id: string, updates: Partial<Widget>) => void;
  widgets: Widget[];
  setWidgets: React.Dispatch<React.SetStateAction<Widget[]>>;
}

export function WidgetContentRenderer({ 
  widget, 
  isEditMode, 
  updateWidget,
  widgets,
  setWidgets 
}: WidgetContentRendererProps) {
  const commonProps = {
    widget,
    isEditMode,
    updateWidget,
  };

  try {
    switch (widget.type) {
      case 'bookmark':
        return <BookmarkWidget {...commonProps} onBookmarkCountChange={() => {}} />;

      case 'weather':
        return <WeatherWidget {...commonProps} />;

      case 'todo':
        return <TodoWidget {...commonProps} />;

      case 'crypto':
        return <CryptoWidget {...commonProps} />;
      
      case 'stock_alert':
        return null;
      
      case 'economic_calendar':
        return <EconomicCalendarWidget {...commonProps} />;
      
      case 'expense':
        return (
          <div className="h-full flex items-center justify-center text-xs text-gray-500 bg-gray-50">
            가계부 위젯은 지원 중단되었습니다
          </div>
        );

      case 'english_words':
        return <EnglishWordsWidget {...commonProps} />;

      case 'exchange':
        return <ExchangeWidget {...commonProps} />;

      case 'news':
        return <NewsWidget {...commonProps} />;

      case 'google_search':
        return <GoogleSearchWidget {...commonProps} />;

      case 'naver_search':
        return <NaverSearchWidget {...commonProps} />;

      case 'law_search':
        return <LawSearchWidget {...commonProps} />;

      case 'unified_search':
        return <UnifiedSearchWidget {...commonProps} />;

      case 'qr_code':
        return <QRCodeWidget {...commonProps} />;

      case 'frequent_sites':
        return <FrequentSitesWidget {...commonProps} />;

      case 'google_ad':
        return <GoogleAdWidget {...commonProps} />;

      case 'quote':
        return <QuoteWidget {...commonProps} />;

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
        const currentGridSize = widget.size || { w: 1, h: 1 };
        const getRows = () => {
          if (currentGridSize.h === 1) return 4;
          if (currentGridSize.h === 2) return 10;
          if (currentGridSize.h === 3) return 16;
          return 4;
        };
        
        return (
          <div className="h-full flex flex-col p-1">
            <textarea
              value={widget.content?.text || ''}
              onChange={(e) => {
                const updatedWidgets = widgets.map(w => 
                  w.id === widget.id 
                    ? { ...w, content: { ...(w.content || {}), text: e.target.value } }
                    : w
                );
                setWidgets(updatedWidgets);
              }}
              placeholder="메모를 작성하세요..."
              className="flex-1 w-full p-1 text-sm border-0 resize-none focus:outline-none bg-transparent"
              style={{ textAlign: 'left', verticalAlign: 'top' }}
              rows={getRows()}
            />
          </div>
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


