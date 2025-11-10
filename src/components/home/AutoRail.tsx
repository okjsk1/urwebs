import React, { useEffect, useRef, useState, useMemo } from 'react';
import { 
  Search, Cloud, CheckSquare, Calendar, DollarSign, Bookmark, BookOpen, Globe,
  Timer, Quote, FileText, TrendingUp, BarChart3, Mic, Camera, Zap,
  Heart, Star, Target, Clock, Bell, Mail, QrCode, Link, Palette, Table
} from 'lucide-react';
import { WidgetCard } from '../ColumnsBoard/WidgetCard';
import { TodoWidget } from '../widgets/TodoWidget';
import { WeatherWidget } from '../widgets/WeatherWidget';
import { CalendarWidget } from '../ColumnsBoard/widgets/CalendarWidget';
import { ExchangeWidget } from '../widgets/ExchangeWidget';
import { BookmarkWidget } from '../widgets/BookmarkWidget';
import { EnglishWordsWidget } from '../widgets/EnglishWordsWidget';
import { NewsWidget } from '../widgets/NewsWidget';
import { TimerWidget } from '../widgets/TimerWidget';
import { QuoteWidget } from '../widgets/QuoteWidget';
import { QuickNoteWidget } from '../widgets/QuickNoteWidget';
import { CryptoWidget } from '../widgets/CryptoWidget';
import { EconomicCalendarWidget } from '../widgets/EconomicCalendarWidget';
import { GoogleSearchWidget } from '../widgets/GoogleSearchWidget';
import { NaverSearchWidget } from '../widgets/NaverSearchWidget';
import { LawSearchWidget } from '../widgets/LawSearchWidget';
import { QRCodeWidget } from '../widgets/QRCodeWidget';
import { DdayWidget } from '../widgets/DdayWidget';
import { FrequentSitesWidget } from '../widgets/FrequentSitesWidget';
import { ImageWidget } from '../widgets/ImageWidget';
import { TableWidget } from '../widgets/TableWidget';
import clsx from 'clsx';

interface RailItem {
  id: string;
  title: string;
  tag: string;
  icon: React.ComponentType<any>;
  color: string;
  description: string;
  widgetType: string;
}

export function AutoRail() {
  const railRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [isInViewport, setIsInViewport] = useState(false);

  const railItems: RailItem[] = [
    { id: '1', title: '구글 검색', tag: '검색', icon: Search, color: 'bg-blue-100 text-blue-600', description: 'Google 검색 바로가기', widgetType: 'google_search' },
    { id: '2', title: '날씨 정보', tag: '날씨', icon: Cloud, color: 'bg-sky-100 text-sky-600', description: '실시간 날씨 정보', widgetType: 'weather' },
    { id: '3', title: '할 일 목록', tag: '할일', icon: CheckSquare, color: 'bg-green-100 text-green-600', description: '할 일 관리 및 체크', widgetType: 'todo' },
    { id: '4', title: '캘린더', tag: '캘린더', icon: Calendar, color: 'bg-purple-100 text-purple-600', description: '일정 관리 및 계획', widgetType: 'calendar' },
    { id: '5', title: '환율 정보', tag: '환율', icon: DollarSign, color: 'bg-yellow-100 text-yellow-600', description: '실시간 환율 정보', widgetType: 'exchange' },
    { id: '6', title: '즐겨찾기', tag: '북마크', icon: Bookmark, color: 'bg-red-100 text-red-600', description: '자주 사용하는 링크', widgetType: 'bookmark' },
    { id: '7', title: '영어 단어', tag: '학습', icon: BookOpen, color: 'bg-indigo-100 text-indigo-600', description: '영어 단어 학습 도구', widgetType: 'english_words' },
    { id: '8', title: '뉴스 피드', tag: '뉴스', icon: Globe, color: 'bg-orange-100 text-orange-600', description: '최신 뉴스 및 관심사', widgetType: 'news' },
    { id: '9', title: '타이머', tag: '생산성', icon: Timer, color: 'bg-emerald-100 text-emerald-600', description: '카운트다운/스톱워치', widgetType: 'timer' },
    { id: '10', title: '오늘의 명언', tag: '영감', icon: Quote, color: 'bg-pink-100 text-pink-600', description: '영감을 주는 명언', widgetType: 'quote' },
    { id: '11', title: '빠른 메모', tag: '메모', icon: FileText, color: 'bg-gray-100 text-gray-600', description: '즉석 메모 작성', widgetType: 'quicknote' },
    { id: '12', title: '암호화폐', tag: '투자', icon: TrendingUp, color: 'bg-cyan-100 text-cyan-600', description: '실시간 코인 시세', widgetType: 'crypto' },
    { id: '13', title: '경제 캘린더', tag: '경제', icon: BarChart3, color: 'bg-teal-100 text-teal-600', description: '경제 지표 일정', widgetType: 'economic_calendar' },
    { id: '14', title: '네이버 검색', tag: '검색', icon: Search, color: 'bg-green-100 text-green-600', description: '네이버 검색 바로가기', widgetType: 'naver_search' },
    { id: '15', title: '법제처 검색', tag: '법령', icon: Search, color: 'bg-purple-100 text-purple-600', description: '법령 검색 도구', widgetType: 'law_search' },
    { id: '16', title: 'QR 코드', tag: '도구', icon: QrCode, color: 'bg-slate-100 text-slate-600', description: 'QR 코드 생성', widgetType: 'qrcode' },
    { id: '17', title: 'D-Day', tag: '일정', icon: Target, color: 'bg-rose-100 text-rose-600', description: '기념일/마감일 관리', widgetType: 'dday' },
    { id: '18', title: '자주가는 사이트', tag: '추천', icon: Link, color: 'bg-amber-100 text-amber-600', description: '방문 횟수 기반 추천', widgetType: 'frequent_sites' },
    { id: '19', title: '사진 프레임', tag: '사진', icon: Camera, color: 'bg-fuchsia-100 text-fuchsia-600', description: '개인 사진 표시', widgetType: 'image' },
    { id: '20', title: '표 메모', tag: '정리', icon: Table, color: 'bg-slate-100 text-slate-600', description: '엑셀처럼 행/열을 구성하는 표', widgetType: 'table' }
  ];

  // 위젯 렌더링 함수 (작은 크기로 직접 렌더링)
  const renderWidget = (widgetType: string, widgetData: any) => {
    // 기본 props (대부분의 위젯이 사용)
    const commonProps = {
      widget: widgetData,
      isEditMode: false,
      updateWidget: () => {},
      id: widgetData.id
    };

    switch (widgetType) {
      case 'todo':
        return <TodoWidget {...commonProps} />;
      case 'weather':
        return <WeatherWidget {...commonProps} />;
      case 'calendar':
        return <CalendarWidget value={new Date()} onSelectDate={() => {}} size="1x1" />;
      case 'exchange':
        return <ExchangeWidget {...commonProps} />;
      case 'bookmark':
        return <BookmarkWidget {...commonProps} />;
      case 'english_words':
        return <EnglishWordsWidget {...commonProps} />;
      case 'news':
        return <NewsWidget {...commonProps} />;
      case 'timer':
        return <TimerWidget {...commonProps} />;
      case 'quote':
        return <QuoteWidget {...commonProps} />;
      case 'quicknote':
        return <QuickNoteWidget {...commonProps} />;
      case 'crypto':
        return <CryptoWidget {...commonProps} />;
      case 'economic_calendar':
        return <EconomicCalendarWidget {...commonProps} />;
      case 'google_search':
        return <GoogleSearchWidget {...commonProps} />;
      case 'naver_search':
        return <NaverSearchWidget {...commonProps} />;
      case 'law_search':
        return <LawSearchWidget {...commonProps} />;
      case 'qrcode':
        return <QRCodeWidget {...commonProps} />;
      case 'dday':
        return <DdayWidget {...commonProps} />;
      case 'frequent_sites':
        return <FrequentSitesWidget {...commonProps} />;
      case 'image':
        return <ImageWidget {...commonProps} />;
      case 'table':
        return <TableWidget {...commonProps} />;
      default:
        return null;
    }
  };

  // 아이템을 두 번 복제하여 무한 루프
  const duplicatedItems = useMemo(() => [...railItems, ...railItems], []);

  // IntersectionObserver: 뷰포트 진입 시만 재생
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInViewport(entry.isIntersecting);
        // 뷰포트 밖이면 일시정지
        if (!entry.isIntersecting) {
          setPaused(true);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);

  // prefers-reduced-motion 감지
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (e: MediaQueryListEvent) => {
      setPaused(e.matches);
    };
    
    if (mediaQuery.matches) {
      setPaused(true);
    }
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // 키보드 탐색 핸들러
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!containerRef.current) return;
    
    if (e.key === 'ArrowRight') {
      containerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    } else if (e.key === 'ArrowLeft') {
      containerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  // 호버/포커스 시 일시정지, 떠나면 재생 (뷰포트에 있을 때만)
  const shouldPause = paused || !isInViewport;

  return (
    <div 
      ref={containerRef}
      className="relative overflow-hidden rounded-2xl bg-white/60 backdrop-blur border shadow-sm"
      aria-label="위젯 미리보기 전시 레일"
    >
      <div
        ref={railRef}
        className={clsx(
          'flex gap-4 py-6 auto-rail-anim',
          shouldPause && 'auto-rail-paused'
        )}
        style={{ 
          width: '200%',
          ['--rail-duration' as any]: '50s'
        }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => {
          if (isInViewport) setPaused(false);
        }}
        onFocus={() => setPaused(true)}
        onBlur={() => {
          if (isInViewport) setPaused(false);
        }}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        aria-live="off"
      >
        {duplicatedItems.map((item, index) => {
          const Icon = item.icon;
          const widgetData = {
            id: `preview-${item.id}-${index}`,
            type: item.widgetType,
            title: item.title,
            x: 0,
            y: 0,
            width: 200,
            height: 120,
            gridSize: { w: 1, h: 1 },
            size: '1x1',
            content: {}
          };

          return (
            <div
              key={`${item.id}-${index}`}
              className="min-w-[220px] w-[220px] h-[200px] rounded-xl border bg-white shadow hover:shadow-md transition-shadow cursor-pointer overflow-hidden flex flex-col"
              aria-label={`${item.title} 위젯 미리보기`}
              style={{ pointerEvents: 'auto' }}
            >
              {/* 위젯 미리보기 - 헤더 포함 전체 렌더링 */}
              <div className="flex-1 flex flex-col relative overflow-hidden">
                <WidgetCard
                  widget={{
                    ...widgetData,
                    title: item.title // 헤더에 표시할 타이틀
                  } as any}
                  isEditMode={false}
                  onDelete={() => {}}
                  compact={true}
                  showHeader={true}
                  headerVariant="compact"
                  titleColor={item.color.split(' ').find(c => c.startsWith('text-')) || item.color.split(' ')[1]} // 'bg-blue-100 text-blue-600'에서 'text-blue-600' 추출
                >
                  {/* 위젯 본문 영역 - 작은 크기로 렌더링 */}
                  <div 
                    className="flex-1 overflow-hidden relative"
                    style={{ 
                      pointerEvents: 'none',
                      userSelect: 'none',
                      transform: 'scale(0.8)',
                      transformOrigin: 'top center'
                    }}
                  >
                    <div className="w-[250px] h-[150px]">
                      {renderWidget(item.widgetType, widgetData)}
                    </div>
                  </div>
                </WidgetCard>
                
                {/* 헤더 아래 태그 메타 (1줄) */}
                <div className="px-2 py-1 border-t border-gray-100 bg-white flex-shrink-0">
                  <span className="text-[10px] text-gray-500">#{item.tag}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
