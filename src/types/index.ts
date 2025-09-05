export interface Website {
  category: string;
  title: string;
  url: string;
  description: string;
  id: string;
  summary?: string; // 새로운 요약 필드
}

export interface CategoryConfig {
  icon: string;
  iconClass: string;
}

export type CategoryConfigMap = Record<string, CategoryConfig>;

// 위젯 타입들
export type WidgetType = 'weather' | 'clock' | 'memo' | 'todo' | 'calendar' | 'dday' | 'news';

export interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  data?: any;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

export type SortMode = 'manual' | 'alpha' | 'freq';

// 폴더 타입
export interface FavoriteFolder {
  id: string;
  name: string;
  items: string[]; // website ids
  color?: string;
  sortMode?: SortMode;
}

export interface FavoritesDataMeta {
  updatedAt?: number;
  source?: 'local' | 'cloud';
}

// 즐겨찾기 구조 확장
export interface FavoritesData {
  items: string[];
  folders: FavoriteFolder[];
  widgets: Widget[];
  itemsSortMode?: SortMode;
  meta?: FavoritesDataMeta;
}

// 사용자 추가 사이트
export interface CustomSite {
  id: string;
  title: string;
  url: string;
  description?: string;
  category: string;
  isCustom?: boolean;
}
