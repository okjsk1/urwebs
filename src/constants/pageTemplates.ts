import { Widget } from '../types/mypage.types';

// 코드 내 기본 템플릿을 완전히 제거합니다.
// 관리자에서 템플릿을 생성해 사용하는 흐름을 위해 비워둡니다.
export const templates = {} as Record<string, {
  name: string;
  description: string;
  icon: string;
  color: string;
  widgets: Widget[];
}>;

// 기본 위젯 설정 - 6컬럼 그리드용 (개인 페이지 초기 레이아웃 등에 사용 가능)
export const getDefaultWidgets = (): Widget[] => {
  const cellWidth = 18;
  const cellHeight = 60;
  const spacing = 5;
  
  return [
    // 1-2컬럼 - 구글검색, 날씨, 즐겨찾기
    {
      id: '1',
      type: 'google_search',
      x: 0,
      y: 0,
      width: (cellWidth + spacing) * 4 - spacing,
      height: 225,
      title: '검색',
      zIndex: 1,
      size: '2x1'
    },
    {
      id: '2',
      type: 'weather_small',
      x: 0,
      y: 230,
      width: (cellWidth + spacing) * 2 - spacing,
      height: 75,
      title: '날씨',
      zIndex: 1,
      size: '2x1'
    },
    {
      id: '3',
      type: 'bookmark',
      x: (cellWidth + spacing) * 2,
      y: 230,
      width: (cellWidth + spacing) * 2 - spacing,
      height: 75,
      title: '즐겨찾기',
      content: {
        bookmarks: [
          { id: '1', name: '네이버', url: 'https://naver.com', icon: '🔍', color: 'bg-green-100' },
          { id: '2', name: '구글', url: 'https://google.com', icon: '🔍', color: 'bg-blue-100' }
        ]
      },
      zIndex: 1,
      size: '2x1'
    },
    
    // 3-4컬럼 - 네이버검색, 투두리스트, 캘린더
    {
      id: '4',
      type: 'naver_search',
      x: (cellWidth + spacing) * 4,
      y: 0,
      width: (cellWidth + spacing) * 4 - spacing,
      height: 225,
      title: '검색',
      zIndex: 1,
      size: '2x1'
    },
    {
      id: '5',
      type: 'todo',
      x: (cellWidth + spacing) * 4,
      y: 230,
      width: (cellWidth + spacing) * 2 - spacing,
      height: 75,
      title: '할 일',
      content: {
        todos: [
          { id: '1', text: '새로운 시작페이지 만들기', completed: true },
          { id: '2', text: '위젯 추가하기', completed: false }
        ]
      },
      zIndex: 1,
      size: '2x1'
    },
    {
      id: '6',
      type: 'calendar',
      x: (cellWidth + spacing) * 6,
      y: 230,
      width: (cellWidth + spacing) * 2 - spacing,
      height: cellHeight,
      title: '캘린더',
      zIndex: 1,
      size: '2x1'
    },
    
    // 5-6컬럼 - 소셜링크, 영어단어모음
    {
      id: '7',
      type: 'social',
      x: (cellWidth + spacing) * 4,
      y: 310,
      width: (cellWidth + spacing) * 4 - spacing,
      height: 225,
      title: '소셜링크',
      zIndex: 1,
      size: '2x1'
    },
    {
      id: '8',
      type: 'english_words',
      x: (cellWidth + spacing) * 4,
      y: 540,
      width: (cellWidth + spacing) * 2 - spacing,
      height: cellHeight,
      title: '영어단어모음',
      zIndex: 1,
      size: '2x1'
    },
    
    // 5-6컬럼 - 법제처검색, 계산기
    {
      id: '9',
      type: 'law_search',
      x: (cellWidth + spacing) * 4,
      y: 540,
      width: (cellWidth + spacing) * 2 - spacing,
      height: cellHeight,
      title: '법제처 검색',
      zIndex: 1,
      size: '2x1'
    },
    {
      id: '10',
      type: 'todo',
      x: (cellWidth + spacing) * 4,
      y: 310,
      width: (cellWidth + spacing) * 2 - spacing,
      height: cellHeight,
      title: '할일',
      zIndex: 1,
      size: '2x1'
    }
  ];
};

                                