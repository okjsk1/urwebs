// src/types/index.ts
export interface Website {
  category: string;
  title: string;
  url: string;
  description: string;
  id: string;
  /** optional custom icon or emoji override */
  icon?: string;
  emoji?: string;
  summary?: string; // 새로운 요약 필드
  // 랭킹 계산을 위한 임시 지표
  clicks?: number;
  favorites?: number;
  addedAt?: number;
  /** optional slug-based category identifier */
  categorySlug?: string;
}

export interface CategoryConfig {
  title: string;
  description?: string;
  icon?: string;
  emoji?: string;
  iconClass?: string;
}

export type CategoryConfigMap = Record<string, CategoryConfig>;

// 위젯 타입들
export type WidgetType =
  | 'weather'
  | 'clock'
  | 'memo'
  | 'todo'
  | 'calendar'
  | 'dday'
  | 'news';

export interface Widget {
  id: string;
  type: WidgetType;
  title?: string;
  data?: any;
  position?: { x: number; y: number };
  size?: { width: number; height: number };
  /** optional parent folder id */
  parentId?: string | null;
}

export type SortMode = 'manual' | 'alpha' | 'freq';

// 폴더 타입
export interface FavoriteFolder {
  id: string;
  name: string;
  color?: string;
  sortMode?: SortMode;
}

// 메인 페이지 분야 선택용 카테고리 타입
export interface FieldCategory {
  slug: string;
  title: string;
  icon?: string;
  emoji?: string;
  description?: string;
  order?: number;
  /** (선택) 슬러그 대신 사용할 사용자 정의 링크 경로 또는 외부 링크 */
  href?: string;
}

// 즐겨찾기 구조 확장
export interface FavoriteItem {
  id: string;
  /** parent folder id; null/undefined means root */
  parentId?: string | null;
}

export interface FavoritesData {
  items: FavoriteItem[];
  folders: FavoriteFolder[];
  widgets: Widget[];
  layout?: string[];
  itemsSortMode?: SortMode;
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
