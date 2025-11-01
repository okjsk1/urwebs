export interface Widget {
  id: string;
  type: 'news' | 'links' | 'weather' | 'todo' | 'memo' | 'calendar' | 'bookmarks' | 'exchange' | 'stock';
  title: string;
  data?: any;
  minHeight?: number; // 위젯의 최소 높이 (px)
}

export interface Column {
  id: string;
  title?: string;
  items: string[]; // Widget ID 배열
}

export interface BoardState {
  layoutMode: 3 | 4;
  columnsOrder: string[];
  columns: Record<string, Column>;
  widgets: Record<string, Widget>;
}

export type WidgetType = Widget['type'];































