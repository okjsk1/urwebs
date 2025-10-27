import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { Search, Cloud, CheckSquare, Calendar, DollarSign, TrendingUp, BarChart3, Globe, Heart, Star } from 'lucide-react';

export type WidgetItem = {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  href?: string;
  badge?: string;
};

interface WidgetScrollerProps {
  items: WidgetItem[];
  speed?: number;          // px/s, 기본 48
  gap?: number;            // 카드 간격(px), 기본 16
  autoPlay?: boolean;      // 기본 true
  pauseOnHover?: boolean;  // 기본 true
  loop?: boolean;          // 기본 true (무한)
  snap?: "mandatory" | "proximity" | "none"; // 기본 "proximity"
  className?: string;
}

export function WidgetScroller({
  items,
  speed = 48,
  gap = 16,
  autoPlay = true,
  pauseOnHover = true,
  loop = true,
  snap = "proximity",
  className = ""
}: WidgetScrollerProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const positionRef = useRef<number>(0);
  const isVisibleRef = useRef<boolean>(true);
  const isHoveredRef = useRef<boolean>(false);
  const isPausedRef = useRef<boolean>(false);
  
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // prefers-reduced-motion 감지
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // IntersectionObserver로 가시성 감지
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
      },
      { threshold: 0.1 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // 카드 너비 계산 (컨테이너 너비 기준)
  const cardWidth = useMemo(() => {
    const containerWidth = 1280; // 고정 컨테이너 너비
    const visibleCards = 4.5; // 4~5개 카드가 보이도록
    return Math.floor((containerWidth - gap * (visibleCards - 1)) / visibleCards);
  }, [gap]);

  // 클론된 아이템들 생성 (무한 루프용)
  const clonedItems = useMemo(() => {
    if (!loop || items.length === 0) return items;
    
    // 충분한 클론을 생성하여 무한 루프가 자연스럽게 보이도록
    const cloneCount = Math.ceil(3); // 최소 3세트
    const cloned = [];
    
    for (let i = 0; i < cloneCount; i++) {
      items.forEach(item => {
        cloned.push({
          ...item,
          id: `${item.id}-clone-${i}`
        });
      });
    }
    
    return cloned;
  }, [items, loop]);

  // 애니메이션 루프
  const animate = useCallback((currentTime: number) => {
    if (!trackRef.current || !isVisibleRef.current || isPausedRef.current) {
      animationRef.current = requestAnimationFrame(animate);
      return;
    }

    const deltaTime = currentTime - lastTimeRef.current;
    lastTimeRef.current = currentTime;

    // 속도 계산 (px/s)
    const pixelsPerSecond = isReducedMotion ? 0 : speed;
    const deltaPosition = (pixelsPerSecond * deltaTime) / 1000;

    positionRef.current += deltaPosition;

    // 무한 루프 처리
    if (loop && clonedItems.length > 0) {
      const totalWidth = (cardWidth + gap) * clonedItems.length;
      const resetPoint = totalWidth / 3; // 1/3 지점에서 리셋
      
      if (positionRef.current >= resetPoint) {
        positionRef.current -= resetPoint;
      }
    }

    // transform 적용
    trackRef.current.style.transform = `translate3d(-${positionRef.current}px, 0, 0)`;

    animationRef.current = requestAnimationFrame(animate);
  }, [speed, gap, cardWidth, loop, clonedItems.length, isReducedMotion]);

  // 애니메이션 시작/정지
  useEffect(() => {
    if (autoPlay && !isReducedMotion) {
      lastTimeRef.current = performance.now();
      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animate, autoPlay, isReducedMotion]);

  // 마우스 이벤트 핸들러
  const handleMouseEnter = useCallback(() => {
    if (pauseOnHover) {
      isHoveredRef.current = true;
      isPausedRef.current = true;
    }
  }, [pauseOnHover]);

  const handleMouseLeave = useCallback(() => {
    if (pauseOnHover) {
      isHoveredRef.current = false;
      isPausedRef.current = false;
    }
  }, [pauseOnHover]);

  // 마우스 휠 이벤트 (Shift + Wheel)
  const handleWheel = useCallback((e: WheelEvent) => {
    if (e.shiftKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? cardWidth + gap : -(cardWidth + gap);
      positionRef.current += delta;
      
      if (trackRef.current) {
        trackRef.current.style.transform = `translate3d(-${positionRef.current}px, 0, 0)`;
      }
    }
  }, [cardWidth, gap]);

  // 키보드 네비게이션
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      const delta = e.key === 'ArrowRight' ? cardWidth + gap : -(cardWidth + gap);
      positionRef.current += delta;
      
      if (trackRef.current) {
        trackRef.current.style.transform = `translate3d(-${positionRef.current}px, 0, 0)`;
      }
    }
  }, [cardWidth, gap]);

  // 이벤트 리스너 등록
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('keydown', handleKeyDown);
    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('keydown', handleKeyDown);
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleWheel, handleKeyDown, handleMouseEnter, handleMouseLeave]);

  // 카드 클릭 핸들러
  const handleCardClick = useCallback((item: WidgetItem) => {
    if (item.href) {
      window.open(item.href, '_blank', 'noopener,noreferrer');
      // Analytics 이벤트 훅 (필요시 구현)
      console.log('Widget clicked:', item.id);
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full max-w-[1280px] mx-auto h-[200px] overflow-hidden ${className}`}
      role="region"
      aria-roledescription="carousel"
      aria-label="추천 위젯"
      tabIndex={0}
    >
      <div
        ref={trackRef}
        className="flex h-full items-center"
        style={{
          width: `${(cardWidth + gap) * clonedItems.length - gap}px`,
          willChange: 'transform'
        }}
      >
        {clonedItems.map((item, index) => {
          const isVisible = Math.abs(positionRef.current - index * (cardWidth + gap)) < cardWidth * 2;
          
          return (
            <div
              key={item.id}
              className="flex-shrink-0 cursor-pointer transition-transform hover:scale-105"
              style={{
                width: `${cardWidth}px`,
                marginRight: index < clonedItems.length - 1 ? `${gap}px` : '0'
              }}
              onClick={() => handleCardClick(item)}
              aria-hidden={!isVisible}
              aria-current={isVisible ? 'true' : 'false'}
            >
              <div className="h-full bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-white/20 dark:border-gray-700/50">
                {/* 아이콘 */}
                <div className="mb-4">
                  {item.icon || <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
                    <Star className="w-5 h-5" />
                  </div>}
                </div>

                {/* 제목 */}
                <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg mb-2 line-clamp-1">
                  {item.title}
                </h3>

                {/* 설명 */}
                {item.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-4">
                    {item.description}
                  </p>
                )}

                {/* 배지 */}
                {item.badge && (
                  <div className="absolute bottom-4 right-4">
                    <span className="px-2 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-medium rounded-full">
                      #{item.badge}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 네비게이션 버튼 (선택사항) */}
      <button
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
        onClick={() => {
          positionRef.current -= cardWidth + gap;
          if (trackRef.current) {
            trackRef.current.style.transform = `translate3d(-${positionRef.current}px, 0, 0)`;
          }
        }}
        aria-label="이전 위젯"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
        onClick={() => {
          positionRef.current += cardWidth + gap;
          if (trackRef.current) {
            trackRef.current.style.transform = `translate3d(-${positionRef.current}px, 0, 0)`;
          }
        }}
        aria-label="다음 위젯"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}

// 기본 위젯 데이터
export const DEFAULT_WIDGET_ITEMS: WidgetItem[] = [
  {
    id: 'google-search',
    title: '구글 검색',
    description: '빠른 웹 검색과 정보 찾기',
    icon: <Search className="w-8 h-8 text-blue-600" />,
    href: 'https://www.google.com',
    badge: '검색'
  },
  {
    id: 'weather',
    title: '날씨 정보',
    description: '실시간 날씨와 예보 확인',
    icon: <Cloud className="w-8 h-8 text-sky-500" />,
    href: '#',
    badge: '날씨'
  },
  {
    id: 'todo',
    title: '할 일 목록',
    description: '업무와 개인 일정 관리',
    icon: <CheckSquare className="w-8 h-8 text-green-600" />,
    href: '#',
    badge: '생산성'
  },
  {
    id: 'calendar',
    title: '캘린더',
    description: '일정 관리와 이벤트 추적',
    icon: <Calendar className="w-8 h-8 text-purple-600" />,
    href: '#',
    badge: '일정'
  },
  {
    id: 'exchange',
    title: '환율 정보',
    description: '실시간 환율과 환전 계산',
    icon: <DollarSign className="w-8 h-8 text-yellow-600" />,
    href: '#',
    badge: '금융'
  },
  {
    id: 'stocks',
    title: '주식 차트',
    description: '주식 시세와 투자 정보',
    icon: <TrendingUp className="w-8 h-8 text-red-600" />,
    href: '#',
    badge: '투자'
  },
  {
    id: 'analytics',
    title: '데이터 분석',
    description: '비즈니스 인사이트와 리포트',
    icon: <BarChart3 className="w-8 h-8 text-indigo-600" />,
    href: '#',
    badge: '분석'
  },
  {
    id: 'news',
    title: '뉴스 피드',
    description: '최신 뉴스와 트렌드 정보',
    icon: <Globe className="w-8 h-8 text-orange-600" />,
    href: '#',
    badge: '뉴스'
  },
  {
    id: 'favorites',
    title: '즐겨찾기',
    description: '자주 사용하는 사이트 모음',
    icon: <Heart className="w-8 h-8 text-pink-600" />,
    href: '#',
    badge: '북마크'
  },
  {
    id: 'bookmarks',
    title: '북마크 관리',
    description: '웹사이트 저장과 정리',
    icon: <Star className="w-8 h-8 text-amber-600" />,
    href: '#',
    badge: '관리'
  }
];
