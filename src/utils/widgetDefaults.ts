// 위젯 기본 설정 및 상수
import { WidgetSize } from '../types/mypage.types';

// 위젯 타입별 기본 크기 매핑
export const WIDGET_DEFAULT_SIZES: Record<string, WidgetSize> = {
  'google_search': '2x1',
  'naver_search': '2x1',
  'unified_search': '2x1',
  'weather_small': '4x1',
  'weather_medium': '4x2',
  'todo': '2x2',
  'crypto': '1x2',
  'frequent_sites': '1x1',
  'calendar': '1x1',
  'weather': '1x3',
  'english_words': '1x2',
  'economic_calendar': '2x2',
  'qr_code': '1x1',
  'bookmark': '1x2',
  'quicknote': '1x1',
  'news': '2x2',
  'exchange': '1x1',
  'google_ad': '1x1',
  'law_search': '2x1',
  'image': '1x1',
};

// 위젯 타입별 컬럼 제한 (1칸 너비만 허용하는 위젯들)
export const SINGLE_COLUMN_WIDGETS = [
  'english_words',
  'crypto',
  'exchange',
  'qr_code',
  'frequent_sites',
];

// 위젯 타입별 행 제한
export const WIDGET_ROW_LIMITS: Record<string, number[]> = {
  'qr_code': [1],
  'unified_search': [1],
  'law_search': [1],
  'google_search': [1],
  'naver_search': [1],
  'calendar': [1, 2, 4], // 1x1, 1x2, 2x2, 4x4 지원
};

// 위젯 기본 콘텐츠
export const WIDGET_DEFAULT_CONTENT: Record<string, any> = {
  'bookmark': { bookmarks: [] },
  'quicknote': { text: '', lastSaved: null },
  'english_words': { 
    currentWord: { 
      word: 'Serendipity', 
      pronunciation: '[serənˈdipəti]', 
      meaning: '우연히 좋은 일을 발견하는 것' 
    } 
  },
};

// 위젯 기본 옵션
export const WIDGET_DEFAULT_OPTIONS: Record<string, any> = {
  'google_search': { variant: 'compact' },
  'naver_search': { variant: 'compact' },
};


