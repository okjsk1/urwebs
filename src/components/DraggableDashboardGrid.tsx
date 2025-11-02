import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  isOverlapping,
  clampToGrid,
  compactLayout,
  saveLayout,
  loadLayout,
  normalizeLayout,
  type WidgetLayout,
  type CollisionStrategy,
} from '../utils/gridLayout';

type GridWidget = {
  id: string;
  type: string;
  size: { w: number; h: number };
  x?: number;
  y?: number;
  [key: string]: any;
};

interface DraggableDashboardGridProps {
  widgets: GridWidget[];
  renderWidget: (w: GridWidget) => React.ReactNode;
  onLayoutChange?: (widgets: GridWidget[]) => void;
  isEditMode?: boolean;
  cellHeight?: number;
  cellWidth?: number;
  gap?: number;
  cols?: number;
  className?: string;
  onAddWidget?: () => void;
  showAddButton?: boolean;
  userId?: string;
  collisionStrategy?: CollisionStrategy;
  responsiveCells?: {
    default: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

function DraggableWidget({
  widget,
  isEditMode,
  onDragStart,
  renderWidget,
  isDragging,
  onWidgetHover,
  onWidgetLeave,
  getColumnBottomWidget,
}: {
  widget: GridWidget;
  isEditMode: boolean;
  onDragStart: (e: React.MouseEvent | React.TouchEvent, widgetId: string) => void;
  renderWidget: (w: GridWidget) => React.ReactNode;
  isDragging: boolean;
  onWidgetHover: (column: number) => void;
  onWidgetLeave: () => void;
  getColumnBottomWidget: (column: number) => any;
}) {
  // 제목(헤더)에서만 드래그 시작할 수 있도록 이벤트 핸들러 제거
  // MyPage.tsx의 renderWidget에서 헤더의 onMouseDown을 통해 드래그 시작

  const handleMouseEnter = () => {
    if (!isEditMode) return;
    const column = widget.x || 0;
    const bottomWidget = getColumnBottomWidget(column);
    if (bottomWidget && bottomWidget.id === widget.id) {
      onWidgetHover(column);
    }
  };

  return (
    <div
      data-widget-id={widget.id}
      className={`bg-white rounded-lg shadow-md overflow-hidden border border-gray-300 transition-all ${
        isDragging ? 'opacity-60 scale-[0.98]' : ''
      } ${isEditMode ? 'hover:shadow-xl hover:border-blue-300' : ''}`}
      style={{
        gridColumn: `${(widget.x || 0) + 1} / span ${widget.size.w}`,
        gridRow: `${(widget.y || 0) + 1} / span ${widget.size.h}`,
        transition: isDragging ? 'opacity 0.2s, transform 0.2s' : 'all 0.2s ease',
        position: 'relative',
        zIndex: isDragging ? 10 : 1,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={onWidgetLeave}
    >
      <div className="h-full relative">
        {renderWidget(widget)}
      </div>
    </div>
  );
}

export default function DraggableDashboardGrid({
  widgets,
  renderWidget,
  onLayoutChange,
  isEditMode = false,
  cellHeight = 160,
  cellWidth = 150,
  gap = 16,
  cols = 8,
  className = '',
  onAddWidget,
  showAddButton = false,
  userId = 'guest',
  collisionStrategy = 'push',
  responsiveCells = {
    default: 160,
    sm: 160,
    md: 160,
    lg: 160,
    xl: 160,
  },
}: DraggableDashboardGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });
  const [previewPos, setPreviewPos] = useState<{ x: number; y: number } | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [currentBreakpoint, setCurrentBreakpoint] = useState('md');
  const [showAddButtonState, setShowAddButtonState] = useState<{ [column: number]: boolean }>({});
  const hideButtonTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 활성 위젯 찾기
  const activeWidget = activeId ? widgets.find(w => w.id === activeId) : null;
  
  // 초기 로드 시 겹침 자동 해소 (한 번만 실행, 겹침이 있을 때만)
  // 주의: 드래그 중에는 실행되지 않도록 activeId 확인
  const isInitialMountRef = useRef(true);
  useEffect(() => {
    // 위젯이 없으면 스킵
    if (widgets.length === 0) return;
    
    // 드래그 중이면 스킵 (레이아웃 변경 방지)
    if (activeId) return;
    
    // 마운트 시에만 실행 (한 번만)
    if (!isInitialMountRef.current) return;
    isInitialMountRef.current = false;
    
    const layouts: WidgetLayout[] = widgets.map(w => ({
      id: w.id,
      x: w.x || 0,
      y: w.y || 0,
      w: w.size.w,
      h: w.size.h,
    }));
    
    // 겹침이 있는지 확인
    let hasOverlap = false;
    for (let i = 0; i < layouts.length; i++) {
      for (let j = i + 1; j < layouts.length; j++) {
        if (isOverlapping(layouts[i], layouts[j])) {
          hasOverlap = true;
          break;
        }
      }
      if (hasOverlap) break;
    }
    
    // 겹침이 있을 때만 정규화 (초기 로드 시에만)
    if (hasOverlap && onLayoutChange) {
      const normalized = normalizeLayout(layouts, cols);
      
      // normalizeLayout이 모든 위젯을 보존했는지 확인
      const normalizedIds = new Set(normalized.map(l => l.id));
      const allPreserved = layouts.every(l => normalizedIds.has(l.id));
      
      if (!allPreserved) {
        console.warn('normalizeLayout이 일부 위젯을 누락했습니다. 레이아웃 정규화를 건너뜁니다.');
        return;
      }
      
      // 변경사항이 있으면 업데이트 (크기는 변경하지 않음)
      const hasChanges = normalized.some((n, i) => {
        const orig = layouts[i];
        return n.x !== orig.x || n.y !== orig.y;
      });
      
      if (hasChanges) {
        const updatedWidgets = widgets.map(widget => {
          const layout = normalized.find(l => l.id === widget.id);
          if (layout) {
            // 크기는 유지하고 위치만 변경
            return { ...widget, x: layout.x, y: layout.y };
          }
          return widget;
        });
        
        // 모든 위젯이 포함되었는지 확인
        if (updatedWidgets.length === widgets.length) {
          onLayoutChange(updatedWidgets);
        } else {
          console.warn('위젯 수가 일치하지 않습니다. 레이아웃 업데이트를 건너뜁니다.', {
            original: widgets.length,
            updated: updatedWidgets.length
          });
        }
      }
    }
  }, [widgets.length]); // widgets.length 변경 시에만 체크 (초기 로드)

  // 각 컬럼별 최하단 위젯 찾기
  const getColumnBottomWidget = useCallback((columnIndex: number) => {
    const columnWidgets = widgets.filter(w => (w.x || 0) === columnIndex);
    if (columnWidgets.length === 0) return null;
    
    return columnWidgets.reduce((bottom, widget) => {
      const widgetBottom = (widget.y || 0) + widget.size.h;
      const currentBottom = (bottom.y || 0) + bottom.size.h;
      return widgetBottom > currentBottom ? widget : bottom;
    });
  }, [widgets]);

  // 각 컬럼별 최하단 y 좌표 찾기
  const getColumnBottomY = useCallback((columnIndex: number) => {
    const bottomWidget = getColumnBottomWidget(columnIndex);
    if (!bottomWidget) return 0;
    return (bottomWidget.y || 0) + bottomWidget.size.h;
  }, [getColumnBottomWidget]);

  // 브레이크포인트 감지
  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      if (width < 640) setCurrentBreakpoint('default');
      else if (width < 768) setCurrentBreakpoint('sm');
      else if (width < 1024) setCurrentBreakpoint('md');
      else if (width < 1280) setCurrentBreakpoint('lg');
      else setCurrentBreakpoint('xl');
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  // 레이아웃 저장
  const saveCurrentLayout = useCallback(() => {
    if (!userId) return;
    
    const layouts: WidgetLayout[] = widgets.map(w => ({
      id: w.id,
      x: w.x || 0,
      y: w.y || 0,
      w: w.size.w,
      h: w.size.h,
    }));

    saveLayout(userId, currentBreakpoint, layouts);
  }, [widgets, userId, currentBreakpoint]);

  // 픽셀 좌표를 그리드 좌표로 변환
  const pixelToGridCoord = useCallback((clientX: number, clientY: number): { x: number; y: number } => {
    if (!gridRef.current) return { x: 0, y: 0 };

    const gridEl = gridRef.current;
    const rect = gridEl.getBoundingClientRect();

    // 컨테이너 기준 좌표 (스크롤 보정 포함)
    const xPx = clientX - rect.left + gridEl.scrollLeft;
    const yPx = clientY - rect.top + gridEl.scrollTop;

    // 실제 열 너비 계산 (gap 포함)
    const totalWidth = gridEl.clientWidth;
    const colWidth = (totalWidth - gap * (cols - 1)) / cols;

    // 그리드 좌표 계산
    // 스냅 정확도 향상: 반올림 대신 바운딩 박스 기준 스냅
    const x = Math.max(0, Math.min(cols - 1, Math.floor((xPx + (colWidth + gap) / 2) / (colWidth + gap))));
    const y = Math.max(0, Math.floor((yPx + (cellHeight + gap) / 2) / (cellHeight + gap)));

    return { x, y };
  }, [cols, cellHeight, gap]);

  // 드래그 시작
  const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent, widgetId: string) => {
    if (!isEditMode) return;

    e.preventDefault();
    e.stopPropagation();

    const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;

    setActiveId(widgetId);
    setDragStart({ x: clientX, y: clientY });
    setCurrentPos({ x: clientX, y: clientY });
    
    // 초기 미리보기 위치 설정
    const widget = widgets.find(w => w.id === widgetId);
    if (widget) {
      setPreviewPos({ x: widget.x || 0, y: widget.y || 0 });
      
      // 드래그 오프셋 계산: 위젯 내에서 클릭한 위치
      if (gridRef.current) {
        const widgetElement = gridRef.current.querySelector(`[data-widget-id="${widgetId}"]`) as HTMLElement;
        if (widgetElement) {
          const rect = widgetElement.getBoundingClientRect();
          const offsetX = clientX - rect.left;
          const offsetY = clientY - rect.top;
          setDragOffset({ x: offsetX, y: offsetY });
        }
      }
    }
  }, [isEditMode, widgets]);

  // 헤더의 드래그 핸들 이벤트 리스너 등록
  useEffect(() => {
    if (!isEditMode || !gridRef.current) return;

    const handleDragHandleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // 제목바(drag-handle)에서만 드래그 허용
      const dragHandle = target.closest('[data-drag-handle="true"]');
      
      // 버튼, 입력창 등은 드래그 방지
      if (target.tagName === 'BUTTON' || 
          target.tagName === 'INPUT' || 
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'A' ||
          target.closest('button') ||
          target.closest('input') ||
          target.closest('textarea') ||
          target.closest('select')) {
        return;
      }
      
      if (dragHandle) {
        const widgetId = dragHandle.getAttribute('data-widget-id');
        if (widgetId) {
          e.preventDefault();
          e.stopPropagation();
          handleDragStart(e, widgetId);
        }
      }
    };

    const gridElement = gridRef.current;
    gridElement.addEventListener('mousedown', handleDragHandleMouseDown);

    return () => {
      gridElement.removeEventListener('mousedown', handleDragHandleMouseDown);
    };
  }, [isEditMode, handleDragStart]);

  // 드래그 중 및 드롭 처리
  useEffect(() => {
    if (!activeId || !isEditMode) return;

    const handleMove = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
      
      setCurrentPos({ x: clientX, y: clientY });
      
      // 드래그 중 미리보기 위치 업데이트
      const gridPos = pixelToGridCoord(clientX, clientY);
      const widget = widgets.find(w => w.id === activeId);
      
      if (widget) {
        // 경계 체크
        const newX = Math.max(0, Math.min(gridPos.x, cols - widget.size.w));
        const newY = Math.max(0, gridPos.y);
        setPreviewPos({ x: newX, y: newY });
      }
    };

    const handleEnd = (e: MouseEvent | TouchEvent) => {
      if (!activeId) return;

      const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'changedTouches' in e ? e.changedTouches[0].clientY : (e as MouseEvent).clientY;

      const widget = widgets.find(w => w.id === activeId);
      if (!widget) {
        setActiveId(null);
        setPreviewPos(null);
        setDragOffset({ x: 0, y: 0 });
        return;
      }

      // 드롭 위치를 그리드 좌표로 변환
      const dropPos = pixelToGridCoord(clientX, clientY);

      // 경계 체크
      const newX = Math.max(0, Math.min(dropPos.x, cols - widget.size.w));
      const newY = Math.max(0, dropPos.y);

      const updatedWidget: WidgetLayout = {
        id: widget.id,
        x: newX,
        y: newY,
        w: widget.size.w,
        h: widget.size.h,
      };

      // 현재 레이아웃
      const layouts: WidgetLayout[] = widgets.map(w => ({
        id: w.id,
        x: w.x || 0,
        y: w.y || 0,
        w: w.size.w,
        h: w.size.h,
      }));

      let newLayouts: WidgetLayout[];
      
      if (collisionStrategy === 'push') {
        // 충돌 해결 (푸시 전략)
        const tempLayouts = layouts.map(w =>
          w.id === updatedWidget.id ? updatedWidget : w
        );
        
        // 이동한 위젯과 충돌하는 다른 위젯이 있는지 확인
        const hasCollision = tempLayouts.some(
          w => w.id !== updatedWidget.id && isOverlapping(w, updatedWidget)
        );
        
        if (hasCollision) {
          // 충돌이 있을 때만 normalizeLayout 호출
          const normalized = normalizeLayout(tempLayouts, cols);
          
          // normalizeLayout이 모든 위젯을 보존했는지 확인
          const originalIds = new Set(tempLayouts.map(l => l.id));
          const normalizedIds = new Set(normalized.map(l => l.id));
          const allPreserved = tempLayouts.every(l => normalizedIds.has(l.id));
          
          if (allPreserved && normalized.length === tempLayouts.length) {
            newLayouts = normalized;
          } else {
            // normalizeLayout이 위젯을 제거했다면, 수동으로 충돌 해결
            console.warn('normalizeLayout이 위젯을 제거했습니다. 수동 충돌 해결을 시도합니다.');
            newLayouts = tempLayouts;
            
            // 수동으로 충돌 해결: 아래 위젯들을 밀어내기
            newLayouts = newLayouts.map(layout => {
              if (layout.id === updatedWidget.id) return layout;
              
              // 업데이트된 위젯과 겹치는지 확인
              if (isOverlapping(layout, updatedWidget)) {
                // 아래로 밀어내기
                return {
                  ...layout,
                  y: updatedWidget.y + updatedWidget.h
                };
              }
              
              return layout;
            });
          }
        } else {
          // 충돌이 없으면 그대로 사용
          newLayouts = tempLayouts;
        }
      } else if (collisionStrategy === 'prevent') {
        // 충돌 시 이동 취소
        const hasCollision = layouts.some(
          w => w.id !== updatedWidget.id && isOverlapping(w, updatedWidget)
        );
        
        if (hasCollision) {
          setActiveId(null);
          setPreviewPos(null);
          setDragOffset({ x: 0, y: 0 });
          return;
        }
        
        // 충돌이 없으면 그대로 사용
        newLayouts = layouts.map(w =>
          w.id === updatedWidget.id ? updatedWidget : w
        );
      } else {
        // swap 전략 (간단 구현)
        newLayouts = layouts.map(w =>
          w.id === updatedWidget.id ? updatedWidget : w
        );
      }

      // 위젯 업데이트 (크기는 변경하지 않음)
      // 모든 위젯이 보존되도록 보장
      const updatedWidgets = widgets.map(w => {
        const layout = newLayouts.find(l => l.id === w.id);
        if (layout) {
          // 크기는 유지하고 위치만 변경
          return { ...w, x: layout.x, y: layout.y };
        }
        // 레이아웃에서 찾을 수 없으면 원본 유지
        return w;
      });

      // 모든 위젯이 포함되었는지 확인
      if (updatedWidgets.length !== widgets.length) {
        console.error('위젯 수가 일치하지 않습니다. 업데이트를 취소합니다.', {
          original: widgets.length,
          updated: updatedWidgets.length
        });
        setActiveId(null);
        setPreviewPos(null);
        setDragOffset({ x: 0, y: 0 });
        return;
      }

      if (onLayoutChange) {
        onLayoutChange(updatedWidgets);
      }

      // 저장 (디바운스)
      setTimeout(saveCurrentLayout, 500);

      setActiveId(null);
      setPreviewPos(null);
      setDragOffset({ x: 0, y: 0 });
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('touchmove', handleMove, { passive: false });
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchend', handleEnd);

    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchend', handleEnd);
    };
  }, [
    activeId,
    widgets,
    cols,
    cellHeight,
    gap,
    isEditMode,
    collisionStrategy,
    onLayoutChange,
    saveCurrentLayout,
    pixelToGridCoord,
  ]);

  // 충돌 해결 함수 (간단한 push 전략)
  const resolveCollisionsPush = (layouts: WidgetLayout[], movedWidget: WidgetLayout): WidgetLayout[] => {
    const occupied = new Map<string, boolean>();
    const key = (x: number, y: number) => `${x}:${y}`;

    const hasOverlap = (x: number, y: number, w: number, h: number): boolean => {
      for (let ix = 0; ix < w; ix++) {
        for (let iy = 0; iy < h; iy++) {
          if (occupied.get(key(x + ix, y + iy))) return true;
        }
      }
      return false;
    };

    const mark = (x: number, y: number, w: number, h: number) => {
      for (let ix = 0; ix < w; ix++) {
        for (let iy = 0; iy < h; iy++) {
          occupied.set(key(x + ix, y + iy), true);
        }
      }
    };

    // 정렬: 이동한 위젯을 먼저, 나머지는 y, x 순
    const sorted = layouts
      .map(w => w.id === movedWidget.id ? movedWidget : w)
      .sort((a, b) => {
        if (a.id === movedWidget.id) return -1;
        if (b.id === movedWidget.id) return 1;
        return a.y - b.y || a.x - b.x;
      });

    return sorted.map(widget => {
      let { x, y } = widget;
      
      // 겹치는 동안 아래로 이동
      while (hasOverlap(x, y, widget.w, widget.h)) {
        y += 1;
      }
      
      mark(x, y, widget.w, widget.h);
      return { ...widget, x, y };
    });
  };

  // 반응형 CSS 생성
  const generateResponsiveStyles = () => {
    const baseHeight = responsiveCells.default;
    const styles: React.CSSProperties = {
      '--grid-row-height': `${baseHeight}px`,
      '--grid-row-height-sm': `${responsiveCells.sm || baseHeight}px`,
      '--grid-row-height-md': `${responsiveCells.md || baseHeight}px`,
      '--grid-row-height-lg': `${responsiveCells.lg || baseHeight}px`,
      '--grid-row-height-xl': `${responsiveCells.xl || baseHeight}px`,
    } as React.CSSProperties;
    return styles;
  };

  return (
    <>
      <style>
        {`
          .draggable-grid-container {
            position: relative;
            display: grid;
            grid-auto-rows: var(--grid-row-height);
          }
          @media (min-width: 640px) {
            .draggable-grid-container {
              grid-auto-rows: var(--grid-row-height-sm);
            }
          }
          @media (min-width: 768px) {
            .draggable-grid-container {
              grid-auto-rows: var(--grid-row-height-md);
            }
          }
          @media (min-width: 1024px) {
            .draggable-grid-container {
              grid-auto-rows: var(--grid-row-height-lg);
            }
          }
          @media (min-width: 1280px) {
            .draggable-grid-container {
              grid-auto-rows: var(--grid-row-height-xl);
            }
          }
        `}
      </style>
      <div
        ref={gridRef}
        className={`draggable-grid-container gap-3 ${className}`}
        style={{
          ...generateResponsiveStyles(),
          userSelect: activeId ? 'none' : 'auto',
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          gridAutoRows: `${responsiveCells.default}px`, // 고정 높이로 변경 (auto 제거)
          position: 'relative',
          display: 'grid',
        }}
        onMouseLeave={() => setShowAddButtonState({})}
      >
        {widgets.map((widget) => (
          <DraggableWidget
            key={widget.id}
            widget={widget}
            isEditMode={isEditMode}
            onDragStart={handleDragStart}
            renderWidget={renderWidget}
            isDragging={activeId === widget.id}
            onWidgetHover={(column) => {
              // 타이머가 있으면 취소
              if (hideButtonTimerRef.current) {
                clearTimeout(hideButtonTimerRef.current);
                hideButtonTimerRef.current = null;
              }
              setShowAddButtonState(prev => ({ ...prev, [column]: true }));
            }}
            onWidgetLeave={() => {
              // 위젯에서 마우스가 나갈 때 500ms 후에 버튼 숨김
              if (hideButtonTimerRef.current) {
                clearTimeout(hideButtonTimerRef.current);
              }
              hideButtonTimerRef.current = setTimeout(() => {
                setShowAddButtonState({});
              }, 500);
            }}
            getColumnBottomWidget={getColumnBottomWidget}
          />
        ))}

        {/* 드롭 예상 위치 플레이스홀더 - 개선된 시각적 피드백 */}
        {activeWidget && previewPos && activeId && (
          <div
            className="pointer-events-none rounded-lg border-4 border-indigo-500 border-dashed bg-indigo-100/60 dark:bg-indigo-900/30 animate-pulse transition-all duration-200"
            style={{
              gridColumn: `${previewPos.x + 1} / span ${activeWidget.size.w}`,
              gridRow: `${previewPos.y + 1} / span ${activeWidget.size.h}`,
              zIndex: 5,
              boxShadow: '0 0 0 2px rgba(99, 102, 241, 0.3)',
            }}
            aria-hidden="true"
          >
            <div className="h-full flex items-center justify-center">
              <div className="text-indigo-600 dark:text-indigo-400 text-xs font-semibold opacity-90 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                여기에 놓기
              </div>
            </div>
          </div>
        )}

        {/* 각 컬럼별 위젯 추가 버튼 */}
        {showAddButton && onAddWidget && Array.from({ length: cols }, (_, columnIndex) => (
          showAddButtonState[columnIndex] && (
            <div
              key={`add-button-${columnIndex}`}
              className="bg-white dark:bg-white/70 rounded-lg shadow-md border-2 border-dashed border-gray-300 dark:border-gray-400/50 hover:border-blue-400 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-50/80 transition-all duration-200 cursor-pointer flex items-center justify-center animate-fade-in dark:backdrop-blur-sm"
              style={{
                gridColumn: `${columnIndex + 1} / span 1`,
                gridRow: `${getColumnBottomY(columnIndex) + 1} / span 1`,
              }}
              onClick={() => onAddWidget(columnIndex)}
              onMouseEnter={() => {
                // 버튼에 마우스가 들어오면 타이머 취소
                if (hideButtonTimerRef.current) {
                  clearTimeout(hideButtonTimerRef.current);
                  hideButtonTimerRef.current = null;
                }
                setShowAddButtonState(prev => ({ ...prev, [columnIndex]: true }));
              }}
              onMouseLeave={(e) => {
                // 버튼 영역에서 벗어날 때 즉시 숨김
                setShowAddButtonState({});
              }}
            >
              <div className="text-center">
                <div className="text-2xl mb-2 dark:text-gray-700">+</div>
                <div className="text-sm text-gray-600 dark:text-gray-700">위젯 추가</div>
              </div>
            </div>
          )
        ))}
      </div>

      {/* 고스트 오버레이 (커서 따라다니는 미리보기) */}
      {activeWidget && activeId && (
        <div
          className="fixed pointer-events-none z-[9999]"
          style={{
            left: currentPos.x - dragOffset.x,
            top: currentPos.y - dragOffset.y,
          }}
        >
          <div className="rounded-lg shadow-2xl border-2 border-indigo-400 bg-white opacity-90 scale-95">
            <div 
              style={{ 
                width: `${cellWidth * activeWidget.size.w + gap * (activeWidget.size.w - 1)}px`,
                height: `${cellHeight * activeWidget.size.h + gap * (activeWidget.size.h - 1)}px`,
              }}
              className="overflow-hidden"
            >
              {renderWidget(activeWidget)}
            </div>
          </div>
        </div>
      )}

      {/* 편집 모드 안내 */}
      {isEditMode && !activeId && (
        <div className="mt-6 text-center text-sm text-gray-500">
          💡 위젯을 클릭하고 드래그하여 원하는 위치로 이동할 수 있습니다
        </div>
      )}
    </>
  );
}

// 사이즈 프리셋 선택 UI
export function SizePicker({
  value,
  onChange,
}: {
  value: { w: number; h: number };
  onChange: (v: { w: number; h: number }) => void;
}) {
  const presets = [
    { label: '1x3', w: 1, h: 3 },
    { label: '1x4', w: 1, h: 4 },
    { label: '2x1', w: 2, h: 1 },
    { label: '2x2', w: 2, h: 2 },
    { label: '2x3', w: 2, h: 3 },
    { label: '3x1', w: 3, h: 1 },
    { label: '3x2', w: 3, h: 2 },
    { label: '3x3', w: 3, h: 3 },
  ];

  const currentSize = `${value.w}x${value.h}`;

  return (
    <div className="relative">
      <select
        className="border border-gray-300 rounded px-2 py-1 text-xs bg-white hover:bg-gray-50 cursor-pointer appearance-none pr-6"
        value={currentSize}
        onChange={(e) => {
          const [w, h] = e.target.value.split('x').map(Number);
          onChange({ w, h });
        }}
        title="위젯 크기 변경"
      >
        {presets.map((p) => (
          <option key={p.label} value={`${p.w}x${p.h}`}>
            {p.label}
          </option>
        ))}
      </select>
      {/* 드롭다운 화살표 */}
      <div className="absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}
