import { Widget, WidgetSize } from '../types/mypage.types';

// 위젯 사이즈별 크기 계산 함수
export const getWidgetDimensions = (size: WidgetSize, cellWidth: number, cellHeight: number, spacing: number) => {
  const sizeMap = {
    '1x1': { cols: 1, rows: 1 },
    '1x2': { cols: 1, rows: 2 },
    '2x1': { cols: 2, rows: 1 },
    '3x1': { cols: 3, rows: 1 },
    '4x1': { cols: 4, rows: 1 },
    '4x2': { cols: 4, rows: 2 }
  };
  
  const { cols, rows } = sizeMap[size];
  return {
    width: cols * cellWidth + (cols - 1) * spacing,
    height: rows * cellHeight + (rows - 1) * spacing
  };
};

// 위젯 겹침 감지 함수
export const isWidgetOverlapping = (widget1: Widget, widget2: Widget) => {
  return !(
    widget1.x + widget1.width <= widget2.x ||
    widget2.x + widget2.width <= widget1.x ||
    widget1.y + widget1.height <= widget2.y ||
    widget2.y + widget2.height <= widget1.y
  );
};

// 다음 사용 가능한 위치 계산 (겹침 방지)
export const getNextAvailablePosition = (
  widgets: Widget[],
  width: number,
  height: number,
  MAIN_COLUMNS: number,
  mainColumnWidth: number,
  spacing: number
) => {
  const cols = MAIN_COLUMNS;
  
  // 각 메인 컬럼별로 마지막 위젯의 Y 위치 계산
  const columnHeights = Array(cols).fill(0);
  
  widgets.forEach(widget => {
    const col = Math.floor(widget.x / (mainColumnWidth + spacing));
    if (col >= 0 && col < cols) {
      const widgetBottom = widget.y + widget.height + spacing;
      columnHeights[col] = Math.max(columnHeights[col], widgetBottom);
    }
  });
  
  // 가장 낮은 컬럼 찾기
  const minHeight = Math.min(...columnHeights);
  const targetCol = columnHeights.indexOf(minHeight);
  
  return {
    x: targetCol * (mainColumnWidth + spacing),
    y: columnHeights[targetCol]
  };
};

// 각 컬럼의 마지막 위젯 찾기
export const getColumnLastWidget = (
  widgets: Widget[],
  columnIndex: number,
  mainColumnWidth: number,
  spacing: number
) => {
  const columnWidgets = widgets.filter(widget => {
    const col = Math.floor(widget.x / (mainColumnWidth + spacing));
    return col === columnIndex;
  });
  
  return columnWidgets.reduce<Widget | null>((last, current) => 
    !last || current.y > last.y ? current : last,
    null
  );
};

// 컬럼의 하단 Y 위치 계산
export const getColumnBottomY = (
  widgets: Widget[],
  columnIndex: number,
  mainColumnWidth: number,
  spacing: number
) => {
  const lastWidget = getColumnLastWidget(widgets, columnIndex, mainColumnWidth, spacing);
  if (!lastWidget) return 0;
  return lastWidget.y + lastWidget.height + spacing;
};




























