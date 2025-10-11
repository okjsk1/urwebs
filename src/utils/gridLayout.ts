/**
 * 그리드 레이아웃 유틸리티 함수들
 * 드래그 앤 드롭, 스냅-투-그리드, 충돌 해결 등
 */

export type WidgetLayout = {
  id: string;
  x: number;    // 열 기준 시작 인덱스 (0-base)
  y: number;    // 행 기준 시작 인덱스 (0-base)
  w: number;    // 가로 셀 수
  h: number;    // 세로 셀 수
};

export type ResponsiveLayouts = {
  base: WidgetLayout[];
  sm?: WidgetLayout[];
  md?: WidgetLayout[];
  lg?: WidgetLayout[];
  xl?: WidgetLayout[];
};

export type CollisionStrategy = 'push' | 'swap' | 'prevent';

/**
 * 픽셀 좌표를 그리드 좌표로 변환
 */
export function pixelToGrid(
  pixelX: number,
  pixelY: number,
  cellWidth: number,
  cellHeight: number,
  gap: number = 12
): { x: number; y: number } {
  const x = Math.round(pixelX / (cellWidth + gap));
  const y = Math.round(pixelY / (cellHeight + gap));
  return { x: Math.max(0, x), y: Math.max(0, y) };
}

/**
 * 그리드 좌표를 픽셀 좌표로 변환
 */
export function gridToPixel(
  gridX: number,
  gridY: number,
  cellWidth: number,
  cellHeight: number,
  gap: number = 12
): { x: number; y: number } {
  return {
    x: gridX * (cellWidth + gap),
    y: gridY * (cellHeight + gap)
  };
}

/**
 * 두 위젯이 겹치는지 확인
 */
export function isOverlapping(
  a: WidgetLayout,
  b: WidgetLayout
): boolean {
  return !(
    a.x + a.w <= b.x ||
    b.x + b.w <= a.x ||
    a.y + a.h <= b.y ||
    b.y + b.h <= a.y
  );
}

/**
 * 위젯이 그리드 경계를 벗어나는지 확인
 */
export function isOutOfBounds(
  widget: WidgetLayout,
  cols: number
): boolean {
  return (
    widget.x < 0 ||
    widget.y < 0 ||
    widget.x + widget.w > cols
  );
}

/**
 * 위젯을 그리드 경계 내로 보정
 */
export function clampToGrid(
  widget: WidgetLayout,
  cols: number,
  minW: number = 1,
  minH: number = 1
): WidgetLayout {
  return {
    ...widget,
    x: Math.max(0, Math.min(widget.x, cols - widget.w)),
    y: Math.max(0, widget.y),
    w: Math.max(minW, Math.min(widget.w, cols)),
    h: Math.max(minH, widget.h)
  };
}

/**
 * 충돌 해결 - Push 전략
 * 겹친 위젯들을 아래로 밀어냄
 */
export function resolveCollisionsPush(
  layouts: WidgetLayout[],
  movedWidget: WidgetLayout
): WidgetLayout[] {
  const result = [...layouts];
  const moved = result.find(w => w.id === movedWidget.id);
  if (!moved) return result;

  // 이동한 위젯 업데이트
  Object.assign(moved, movedWidget);

  // 충돌 해결을 위한 반복
  let hasCollision = true;
  let iterations = 0;
  const maxIterations = 50;

  while (hasCollision && iterations < maxIterations) {
    hasCollision = false;
    iterations++;

    for (let i = 0; i < result.length; i++) {
      const widget = result[i];
      
      for (let j = 0; j < result.length; j++) {
        if (i === j) continue;
        
        const other = result[j];
        
        if (isOverlapping(widget, other)) {
          hasCollision = true;
          
          // 더 위에 있는 위젯은 그대로 두고, 아래 위젯을 밀어냄
          if (widget.y <= other.y) {
            other.y = widget.y + widget.h;
          } else {
            widget.y = other.y + other.h;
          }
        }
      }
    }
  }

  // Y 좌표로 정렬하여 컴팩트하게 만들기
  return compactLayout(result);
}

/**
 * 충돌 해결 - Swap 전략
 * 두 위젯의 위치를 교환
 */
export function resolveCollisionsSwap(
  layouts: WidgetLayout[],
  movedWidget: WidgetLayout,
  targetWidget?: WidgetLayout
): WidgetLayout[] {
  const result = [...layouts];
  const moved = result.find(w => w.id === movedWidget.id);
  if (!moved) return result;

  const oldPos = { x: moved.x, y: moved.y };
  Object.assign(moved, movedWidget);

  // 타겟 위젯이 지정되어 있으면 위치 교환
  if (targetWidget) {
    const target = result.find(w => w.id === targetWidget.id);
    if (target) {
      target.x = oldPos.x;
      target.y = oldPos.y;
    }
  }

  return result;
}

/**
 * 충돌 해결 - Prevent 전략
 * 충돌이 발생하면 이동을 취소
 */
export function resolveCollisionsPrevent(
  layouts: WidgetLayout[],
  movedWidget: WidgetLayout
): WidgetLayout[] | null {
  const hasCollision = layouts.some(
    w => w.id !== movedWidget.id && isOverlapping(w, movedWidget)
  );

  if (hasCollision) {
    return null; // 이동 취소
  }

  return layouts.map(w =>
    w.id === movedWidget.id ? movedWidget : w
  );
}

/**
 * 레이아웃을 컴팩트하게 만들기
 * 위젯들을 위로 최대한 당김
 */
export function compactLayout(layouts: WidgetLayout[]): WidgetLayout[] {
  const sorted = [...layouts].sort((a, b) => a.y - b.y);
  const result: WidgetLayout[] = [];

  for (const widget of sorted) {
    let targetY = 0;
    
    // 가능한 가장 위쪽 위치 찾기
    while (targetY < widget.y) {
      const testWidget = { ...widget, y: targetY };
      const hasCollision = result.some(w => isOverlapping(w, testWidget));
      
      if (!hasCollision) {
        break;
      }
      targetY++;
    }
    
    result.push({ ...widget, y: targetY });
  }

  return result;
}

/**
 * 위젯 레이아웃을 저장
 */
export function saveLayout(
  userId: string,
  breakpoint: string,
  layouts: WidgetLayout[]
): void {
  const key = `urwebs:layout:${userId}:${breakpoint}`;
  localStorage.setItem(key, JSON.stringify(layouts));
}

/**
 * 위젯 레이아웃을 로드
 */
export function loadLayout(
  userId: string,
  breakpoint: string
): WidgetLayout[] | null {
  const key = `urwebs:layout:${userId}:${breakpoint}`;
  const data = localStorage.getItem(key);
  
  if (!data) return null;
  
  try {
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to load layout:', error);
    return null;
  }
}

/**
 * 레이아웃을 다른 브레이크포인트용으로 변환
 */
export function adaptLayoutToBreakpoint(
  layout: WidgetLayout[],
  fromCols: number,
  toCols: number
): WidgetLayout[] {
  if (fromCols === toCols) return layout;

  const scale = toCols / fromCols;
  
  return layout.map(widget => ({
    ...widget,
    x: Math.floor(widget.x * scale),
    w: Math.max(1, Math.floor(widget.w * scale))
  })).map(widget => 
    clampToGrid(widget, toCols)
  );
}

/**
 * 새 위젯을 추가할 최적의 위치 찾기
 */
export function findNextAvailablePosition(
  layouts: WidgetLayout[],
  width: number,
  height: number,
  cols: number
): { x: number; y: number } {
  // 각 행을 순회하며 빈 공간 찾기
  for (let y = 0; y < 1000; y++) {
    for (let x = 0; x <= cols - width; x++) {
      const testWidget: WidgetLayout = {
        id: 'test',
        x,
        y,
        w: width,
        h: height
      };

      const hasCollision = layouts.some(w => isOverlapping(w, testWidget));
      
      if (!hasCollision) {
        return { x, y };
      }
    }
  }

  // 최악의 경우 맨 아래에 배치
  const maxY = Math.max(0, ...layouts.map(w => w.y + w.h));
  return { x: 0, y: maxY };
}

/**
 * 드래그 델타를 그리드 단위로 스냅
 */
export function snapDelta(
  delta: { x: number; y: number },
  cellWidth: number,
  cellHeight: number,
  gap: number = 12
): { x: number; y: number } {
  return {
    x: Math.round(delta.x / (cellWidth + gap)) * (cellWidth + gap),
    y: Math.round(delta.y / (cellHeight + gap)) * (cellHeight + gap)
  };
}

/**
 * 레이아웃의 총 높이 계산
 */
export function getLayoutHeight(layouts: WidgetLayout[]): number {
  if (layouts.length === 0) return 0;
  return Math.max(...layouts.map(w => w.y + w.h));
}

/**
 * 위젯들을 컬럼 범위 내로 보정
 */
export function clampToCols(items: WidgetLayout[], cols: number): WidgetLayout[] {
  return items.map(it => {
    const w = Math.min(it.w, cols); // 너무 넓은 위젯 축소
    const x = Math.max(0, Math.min(it.x, cols - w)); // 범위 보정
    const y = Math.max(0, it.y);
    return { ...it, x, y, w };
  });
}

/**
 * 겹치는 위젯을 아래로 밀어내며 컴팩트하게 정렬
 * first-fit push-down 알고리즘
 */
export function compact(items: WidgetLayout[], cols: number): WidgetLayout[] {
  const occ = new Set<string>();
  const key = (x: number, y: number) => `${x}:${y}`;
  
  const mark = (x: number, y: number, w: number, h: number) => {
    for (let ix = 0; ix < w; ix++) {
      for (let iy = 0; iy < h; iy++) {
        occ.add(key(x + ix, y + iy));
      }
    }
  };
  
  const hasCollision = (x: number, y: number, w: number, h: number) => {
    for (let ix = 0; ix < w; ix++) {
      for (let iy = 0; iy < h; iy++) {
        if (occ.has(key(x + ix, y + iy))) return true;
      }
    }
    return false;
  };

  // 위에서 아래, 왼쪽에서 오른쪽 순으로 안정 배치
  const sorted = [...items].sort((a, b) => a.y - b.y || a.x - b.x);
  const out: WidgetLayout[] = [];
  
  for (const it of sorted) {
    let x = it.x;
    let y = it.y;
    
    // 행을 아래로 밀어가며 빈 자리 탐색
    while (hasCollision(x, y, it.w, it.h)) {
      x += 1; // 한 칸씩 오른쪽으로
      if (x + it.w > cols) {
        x = 0;
        y += 1; // 다음 행으로
      }
    }
    
    mark(x, y, it.w, it.h);
    out.push({ ...it, x, y });
  }
  
  return out.sort((a, b) => a.y - b.y || a.x - b.x);
}

/**
 * 레이아웃 정규화: 범위 보정 + 겹침 해소
 */
export function normalizeLayout(items: WidgetLayout[], cols: number): WidgetLayout[] {
  // 1. 중복 ID 제거
  const uniqueItems = Array.from(
    new Map(items.map(item => [item.id, item])).values()
  );
  
  // 2. 컬럼 범위 내로 보정
  const clamped = clampToCols(uniqueItems, cols);
  
  // 3. 겹침 해소 (컴팩션)
  const compacted = compact(clamped, cols);
  
  return compacted;
}

