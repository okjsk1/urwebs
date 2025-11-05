// 위젯 사이즈 타입
export type WidgetSize = '1x1' | '1x2' | '1x3' | '1x4' | '2x1' | '2x2' | '2x3' | '3x1' | '3x2' | '3x3' | '4x1' | '4x2' | '4x4';

// 위젯 타입
export type WidgetType = 'bookmark' | 'clock' | 'weather' | 'weather_small' | 'weather_medium' | 'todo' | 'note' | 'calendar' | 'stats' | 'news' | 'social' | 'stock' | 'crypto' | 'goal' | 'habit' | 'expense' | 'quote' | 'reminder' | 'timer' | 'dday' |  'google_search' | 'naver_search' | 'law_search' | 'unified_search' | 'rss' | 'github' | 'email' | 'mail_services' | 'system' | 'media' | 'favorite' | 'recent' | 'quicknote' | 'password' | 'qr' | 'barcode' | 'colorpicker' | 'gradient' | 'icon' | 'emoji' | 'gif' | 'meme' | 'contact' | 'search' | 'meeting' | 'shopping' | 'travel' | 'sports' | 'profile_card' | 'qr_code' | 'portfolio_header' | 'project_gallery' | 'contact_buttons' | 'download_section' | 'business_header' | 'menu_section' | 'business_info' | 'map_section' | 'event_header' | 'countdown' | 'rsvp_form' | 'event_gallery' | 'blog_header' | 'post_list' | 'blog_sidebar' | 'shop_header' | 'product_grid' | 'contact_order' | 'reviews' | 'team_header' | 'member_grid' | 'activity_calendar' | 'join_form' | 'exchange' | 'github_repo' | 'stock_alert' | 'economic_calendar' | 'english_words' | 'google_ad' | 'frequent_sites' | 'image';

// 위젯 인터페이스
export interface Widget {
  id: string;
  type: WidgetType;
  x: number;
  y: number;
  width: number;
  height: number;
  title: string;
  content?: any;
  zIndex?: number;
  size?: WidgetSize;
  gridSize?: { w: number; h: number }; // 그리드 기반 크기 (예: { w: 2, h: 1 })
  variant?: 'compact' | 'normal'; // 위젯 변형 모드 (예: compact - 컴팩트 모드)
}

// 북마크 인터페이스
export interface Bookmark {
  id: string;
  name: string;
  url: string;
  icon?: string;
  color?: string;
}

// 배경 설정 인터페이스
export interface BackgroundSettings {
  type: 'solid' | 'gradient' | 'image';
  color: string;
  gradient: {
    from: string;
    to: string;
    direction: string;
  };
  image?: string;
  opacity: number;
}

// 공유 설정 인터페이스
export interface ShareSettings {
  isPublic: boolean;
  shareUrl: string;
  allowComments: boolean;
  showStats: boolean;
  password?: string;
}

// 페이지 인터페이스
export interface Page {
  id: string;
  title: string;
  widgets: Widget[];
  createdAt: number;
  updatedAt?: number;
  isActive?: boolean;
  customUrl?: string; // 사용자 정의 URL
  urlId?: string; // Firebase에서 사용하는 URL ID
  firebaseDocId?: string; // Firebase 문서 ID
  backgroundSettings?: BackgroundSettings; // 페이지별 배경 설정
}

// 위젯 카테고리 정의
export interface WidgetDefinition {
  type: WidgetType;
  name: string;
  icon: any;
  description: string;
}

export interface WidgetCategory {
  name: string;
  widgets: WidgetDefinition[];
}

// 추가 인터페이스들
export interface Bookmark {
  id: string;
  name: string;
  url: string;
  icon?: string;
  color?: string;
}

export interface FontSettings {
  family: string;
  size: number;
  weight: 'normal' | 'bold';
  style: 'normal' | 'italic';
  color: string;
}

export interface LayoutSettings {
  gridSize: number;
  snapToGrid: boolean;
  showGrid: boolean;
  spacing: number;
}

