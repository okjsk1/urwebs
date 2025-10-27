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

interface WidgetScrollerNativeProps {
  items: WidgetItem[];
  speed?: number;          // px/s, 기본 48
  gap?: number;            // 카드 간격(px), 기본 16
  autoPlay?: boolean;      // 기본 true
  pauseOnHover?: boolean;  // 기본 true
  loop?: boolean;          // 기본 true (무한)
  snap?: "mandatory" | "proximity" | "none"; // 기본 "proximity"
  className?: string;
}

export function WidgetScrollerNative({
  items,
  speed = 48,
  gap = 16,
  autoPlay = true,
  pauseOnHover = true,
  loop = true,
  snap = "proximity",
  className = ""
}: WidgetScrollerNativeProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
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

  // 카드 너비 계산
  const cardWidth = useMemo(() => {
    const containerWidth = 1280;
    const visibleCards = 4.5;
    return Math.floor((containerWidth - gap * (visibleCards - 1)) / visibleCards);
  }, [gap]);

  // 클론된 아이템들 생성
  const clonedItems = useMemo(() => {
    if (!loop || items.length === 0) return items;
    
    const cloneCount = Math.ceil(3);
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

  // 자동 스크롤 애니메이션
  const animate = useCallback(() => {
    if (!scrollRef.current || !isVisibleRef.current || isPausedRef.current || isReducedMotion) {
      animationRef.current = requestAnimationFrame(animate);
      return;
    }

    const currentTime = performance.now();
    const deltaTime = currentTime - lastTimeRef.current;
    lastTimeRef.current = currentTime;

    const pixelsPerSecond = speed;
    const deltaPosition = (pixelsPerSecond * deltaTime) / 1000;

    if (scrollRef.current) {
      scrollRef.current.scrollLeft += deltaPosition;

      // 무한 루프 처리
      if (loop && clonedItems.length > 0) {
        const scrollWidth = scrollRef.current.scrollWidth;
        const clientWidth = scrollRef.current.clientWidth;
        const resetPoint = scrollWidth / 3;

        if (scrollRef.current.scrollLeft >= resetPoint) {
          scrollRef.current.scrollLeft -= resetPoint;
        }
      }
    }

    animationRef.current = requestAnimationFrame(animate);
  }, [speed, loop, clonedItems.length, isReducedMotion]);

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

  // 마우스 휠 이벤트
  const handleWheel = useCallback((e: WheelEvent) => {
    if (e.shiftKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? cardWidth + gap : -(cardWidth + gap);
      
      if (scrollRef.current) {
        scrollRef.current.scrollBy({
          left: delta,
          behavior: 'smooth'
        });
      }
    }
  }, [cardWidth, gap]);

  // 키보드 네비게이션
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      const delta = e.key === 'ArrowRight' ? cardWidth + gap : -(cardWidth + gap);
      
      if (scrollRef.current) {
        scrollRef.current.scrollBy({
          left: delta,
          behavior: 'smooth'
        });
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
      console.log('Widget clicked:', item.id);
    }
  }, []);

  // 네비게이션 버튼 핸들러
  const scrollToNext = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: cardWidth + gap,
        behavior: 'smooth'
      });
    }
  }, [cardWidth, gap]);

  const scrollToPrev = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: -(cardWidth + gap),
        behavior: 'smooth'
      });
    }
  }, [cardWidth, gap]);

  // 스냅 스타일 설정
  const snapStyle = useMemo(() => {
    switch (snap) {
      case 'mandatory':
        return {
          scrollSnapType: 'x mandatory' as const,
          scrollSnapAlign: 'start' as const
        };
      case 'proximity':
        return {
          scrollSnapType: 'x proximity' as const,
          scrollSnapAlign: 'start' as const
        };
      default:
        return {};
    }
  }, [snap]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full max-w-[1280px] mx-auto h-[200px] ${className}`}
      role="region"
      aria-roledescription="carousel"
      aria-label="추천 위젯"
      tabIndex={0}
    >
      <div
        ref={scrollRef}
        className="flex h-full items-center overflow-x-auto scrollbar-hide"
        style={{
          scrollSnapType: snapStyle.scrollSnapType,
          scrollBehavior: 'smooth',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {clonedItems.map((item, index) => (
          <div
            key={item.id}
            className="flex-shrink-0 cursor-pointer transition-transform hover:scale-105"
            style={{
              width: `${cardWidth}px`,
              marginRight: index < clonedItems.length - 1 ? `${gap}px` : '0',
              scrollSnapAlign: snapStyle.scrollSnapAlign
            }}
            onClick={() => handleCardClick(item)}
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
        ))}
      </div>

      {/* 네비게이션 버튼 */}
      <button
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 z-10"
        onClick={scrollToPrev}
        aria-label="이전 위젯"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 z-10"
        onClick={scrollToNext}
        aria-label="다음 위젯"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* 스크롤바 숨기기 CSS */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
