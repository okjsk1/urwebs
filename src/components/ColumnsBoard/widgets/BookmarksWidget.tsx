import React, { useRef, useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { SiteAvatar } from '../../../components/common/SiteAvatar';
import { Widget } from '../types';

interface BookmarksWidgetProps {
  widget?: Widget;
  onResize?: (widgetId: string, minHeight: number) => void;
}

export function BookmarksWidget({ widget, onResize }: BookmarksWidgetProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const hasAutoGrownRef = useRef(false);
  const [shouldForceScroll, setShouldForceScroll] = useState(false);
  const [currentMinHeight, setCurrentMinHeight] = useState(widget?.minHeight);
  const [maxHeight, setMaxHeight] = useState<number | undefined>(undefined);

  const bookmarks = [
    { name: 'React 공식 문서', url: 'https://react.dev' },
    { name: 'Tailwind CSS', url: 'https://tailwindcss.com' },
    { name: 'MDN Web Docs', url: 'https://developer.mozilla.org' },
    { name: 'Stack Overflow', url: 'https://stackoverflow.com' },
  ];

  // 오버플로 감지 및 자동 높이 증가
  useEffect(() => {
    const el = listRef.current;
    if (!el || !widget || !onResize) return;

    const measure = () => {
      // requestAnimationFrame으로 레이아웃 안정화 후 측정
      requestAnimationFrame(() => {
        if (!el) return;

        const scrollHeight = el.scrollHeight;
        const clientHeight = el.clientHeight;
        const threshold = 1; // 1px 여유

        // 오버플로 감지: scrollHeight가 clientHeight보다 크면 넘침
        // clientHeight는 부모 컨테이너의 높이 제한을 받습니다
        const overflows = scrollHeight > clientHeight + threshold;

        if (overflows && !hasAutoGrownRef.current) {
          // 처음 오버플로 감지: 1회만 자동 증가
          hasAutoGrownRef.current = true;
          
          // 부모 컨테이너 찾기 (WidgetCard의 컨텐츠 div)
          const parentContent = el.parentElement;
          if (parentContent) {
            // 전체 위젯 높이 = 헤더(56px) + 컨텐츠 패딩(32px) + 실제 콘텐츠 높이
            const headerHeight = 56; // WidgetCard 헤더 높이
            const contentPadding = 32; // 상하 패딩 (16px * 2)
            // scrollHeight는 이미 listRef의 실제 콘텐츠 높이이므로 그대로 사용
            const newMinHeight = scrollHeight + headerHeight + contentPadding;
            
            setCurrentMinHeight(newMinHeight);
            onResize(widget.id, newMinHeight);
          }
        } else if (overflows && hasAutoGrownRef.current) {
          // 이미 한 번 늘린 후에도 여전히 넘치면 스크롤 활성화
          if (!shouldForceScroll) {
            setShouldForceScroll(true);
            // 부모 컨테이너의 높이를 max-height로 설정
            const parentContent = el.parentElement;
            if (parentContent) {
              setMaxHeight(parentContent.clientHeight);
            }
          }
        }
      });
    };

    // ResizeObserver로 크기 변화 감지
    const resizeObserver = new ResizeObserver(() => {
      // 약간의 지연을 두어 DOM이 완전히 렌더링된 후 측정
      setTimeout(measure, 0);
    });

    resizeObserver.observe(el);
    
    // 초기 측정 (약간의 지연 후)
    const timeoutId = setTimeout(measure, 100);

    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
    };
  }, [widget?.id, onResize, shouldForceScroll]);

  // widget.minHeight가 외부에서 변경되면 반영
  useEffect(() => {
    if (widget?.minHeight !== undefined && widget.minHeight !== currentMinHeight) {
      setCurrentMinHeight(widget.minHeight);
    }
  }, [widget?.minHeight]);

  return (
    <div
      ref={listRef}
      className={`space-y-2 ${shouldForceScroll ? 'overflow-y-auto' : 'overflow-visible'}`}
      style={shouldForceScroll && maxHeight ? { maxHeight: `${maxHeight}px` } : undefined}
    >
      {bookmarks.map((bookmark) => (
        <a
          key={bookmark.name}
          href={bookmark.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors group"
        >
          <div className="flex items-center gap-2">
            <SiteAvatar url={bookmark.url} name={bookmark.name} size={24} />
            <span className="text-sm font-medium text-gray-700">{bookmark.name}</span>
          </div>
          <ExternalLink className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </a>
      ))}
    </div>
  );
}

































