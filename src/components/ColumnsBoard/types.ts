export interface Widget {
  id: string;
  type: 'news' | 'links' | 'weather' | 'calculator' | 'memo' | 'calendar' | 'bookmarks' | 'exchange' | 'stock' | 'todo';
  title: string;
  data?: any;
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






















