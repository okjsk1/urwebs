import { Widget } from '../types/mypage.types';

export const templates = {
  profile: {
    name: '프로필',
    description: '개인 소개와 정보를 공유하세요',
    icon: '👤',
    color: '#3B82F6',
    widgets: (() => {
      const cellWidth = 18;
      const cellHeight = 60;
      const spacing = 5;
      const colWidth = (cellWidth + spacing) * 2 - spacing; // 2칸 너비
      return [
        { id: '1', type: 'contact', x: 0, y: 0, width: colWidth, height: cellHeight, title: '연락처', content: {}, zIndex: 1, size: '2x1' },
        { id: '2', type: 'social', x: (cellWidth + spacing) * 2, y: 0, width: colWidth, height: cellHeight, title: '소셜 링크', content: {}, zIndex: 1, size: '2x1' },
        { id: '3', type: 'qr_code', x: (cellWidth + spacing) * 4, y: 0, width: (cellWidth + spacing) * 4 - spacing, height: cellHeight, title: 'QR 코드', content: {}, zIndex: 1, size: '4x1' }
      ] as Widget[];
    })()
  },
  links: {
    name: '링크 모음',
    description: '자주 사용하는 링크를 한곳에',
    icon: '🔗',
    color: '#10B981',
    widgets: (() => {
      const cellWidth = 18;
      const cellHeight = 60;
      const spacing = 5;
      const colWidth = (cellWidth + spacing) * 2 - spacing;
      return [
        { id: '1', type: 'bookmark', x: 0, y: 0, width: colWidth, height: cellHeight, title: '북마크', content: {}, zIndex: 1, size: '2x1' },
        { id: '2', type: 'social', x: (cellWidth + spacing) * 2, y: 0, width: colWidth, height: cellHeight, title: '소셜 링크', content: {}, zIndex: 1, size: '2x1' },
        { id: '3', type: 'qr_code', x: (cellWidth + spacing) * 4, y: 0, width: (cellWidth + spacing) * 4 - spacing, height: cellHeight, title: 'QR 코드', content: {}, zIndex: 1, size: '4x1' }
      ] as Widget[];
    })()
  },
  portfolio: {
    name: '포트폴리오',
    description: '작업과 프로젝트를 멋지게 소개하세요',
    icon: '💼',
    color: '#8B5CF6',
    widgets: (() => {
      const cellWidth = 18;
      const cellHeight = 60;
      const spacing = 5;
      const colWidth = (cellWidth + spacing) * 2 - spacing;
      return [
        { id: '1', type: 'github_repo', x: 0, y: 0, width: colWidth, height: cellHeight, title: 'GitHub', content: {}, zIndex: 1, size: '2x1' },
        { id: '2', type: 'contact', x: (cellWidth + spacing) * 2, y: 0, width: colWidth, height: cellHeight, title: '연락처', content: {}, zIndex: 1, size: '2x1' },
        { id: '3', type: 'stats', x: (cellWidth + spacing) * 4, y: 0, width: (cellWidth + spacing) * 4 - spacing, height: cellHeight, title: '통계', content: {}, zIndex: 1, size: '4x1' }
      ] as Widget[];
    })()
  },
  productivity: {
    name: '생산성 대시보드',
    description: '할일, 목표, 습관을 관리하세요',
    icon: '📊',
    color: '#F59E0B',
    widgets: (() => {
      const cellWidth = 18;
      const cellHeight = 60;
      const spacing = 5;
      const colWidth = (cellWidth + spacing) * 2 - spacing;
      return [
        { id: '1', type: 'todo', x: 0, y: 0, width: colWidth, height: cellHeight, title: '할 일', content: {}, zIndex: 1, size: '2x1' },
        { id: '2', type: 'goal', x: (cellWidth + spacing) * 2, y: 0, width: colWidth, height: cellHeight, title: '목표', content: {}, zIndex: 1, size: '2x1' },
        { id: '3', type: 'habit', x: (cellWidth + spacing) * 4, y: 0, width: (cellWidth + spacing) * 4 - spacing, height: cellHeight, title: '습관', content: {}, zIndex: 1, size: '4x1' }
      ] as Widget[];
    })()
  },
  finance: {
    name: '금융 대시보드',
    description: '주식, 암호화폐, 환율을 확인하세요',
    icon: '💰',
    color: '#EF4444',
    widgets: (() => {
      const cellWidth = 18;
      const cellHeight = 60;
      const spacing = 5;
      const colWidth = (cellWidth + spacing) * 2 - spacing;
      return [
        { id: '1', type: 'stock', x: 0, y: 0, width: colWidth, height: cellHeight, title: '주식', content: {}, zIndex: 1, size: '2x1' },
        { id: '2', type: 'crypto', x: (cellWidth + spacing) * 2, y: 0, width: colWidth, height: cellHeight, title: '암호화폐', content: {}, zIndex: 1, size: '2x1' },
        { id: '3', type: 'exchange', x: (cellWidth + spacing) * 4, y: 0, width: (cellWidth + spacing) * 4 - spacing, height: cellHeight, title: '환율', content: {}, zIndex: 1, size: '4x1' }
      ] as Widget[];
    })()
  },
  social: {
    name: '소셜 미디어',
    description: '소셜 링크, 음악, 명언 공유',
    icon: '🌟',
    color: '#EC4899',
    widgets: (() => {
      const cellWidth = 18;
      const cellHeight = 60;
      const spacing = 5;
      const colWidth = (cellWidth + spacing) * 2 - spacing;
      
      return [
        // 1-2컬럼 - 구글검색, 날씨, 즐겨찾기
        { id: '1', type: 'google_search', x: 0, y: 0, width: colWidth * 2 + spacing, height: 225, title: '구글 검색', content: {}, zIndex: 1, size: '2x1' },
        { id: '2', type: 'weather_small', x: 0, y: 230, width: colWidth, height: cellHeight, title: '날씨', content: {}, zIndex: 1, size: '2x1' },
        { id: '3', type: 'bookmark', x: colWidth + spacing, y: 230, width: colWidth, height: cellHeight, title: '즐겨찾기', content: {}, zIndex: 1, size: '2x1' },
        
        // 3-4컬럼 - 네이버검색, 투두리스트, 캘린더
        { id: '4', type: 'naver_search', x: (colWidth + spacing) * 2, y: 0, width: colWidth * 2 + spacing, height: 225, title: '네이버 검색', content: {}, zIndex: 1, size: '2x1' },
        { id: '5', type: 'todo', x: (colWidth + spacing) * 2, y: 230, width: colWidth, height: cellHeight, title: '할 일', content: {}, zIndex: 1, size: '2x1' },
        { id: '6', type: 'calendar', x: (colWidth + spacing) * 3, y: 230, width: colWidth, height: cellHeight, title: '캘린더', content: {}, zIndex: 1, size: '2x1' },
        
        // 5-6컬럼 - 소셜링크, 영어단어모음
        { id: '7', type: 'social', x: (colWidth + spacing) * 4, y: 0, width: colWidth * 2 + spacing, height: 225, title: '소셜링크', content: {}, zIndex: 1, size: '2x1' },
        { id: '8', type: 'english_words', x: (colWidth + spacing) * 4, y: 230, width: colWidth, height: cellHeight, title: '영어단어모음', content: {}, zIndex: 1, size: '2x1' },
        
        // 7-8컬럼 - 법제처검색, 계산기
        { id: '9', type: 'law_search', x: (colWidth + spacing) * 6, y: 0, width: colWidth * 2 + spacing, height: 225, title: '법제처 검색', content: {}, zIndex: 1, size: '2x1' },
        { id: '10', type: 'calculator', x: (colWidth + spacing) * 6, y: 230, width: colWidth, height: cellHeight, title: '계산기', content: {}, zIndex: 1, size: '2x1' },
        
        // 5-6컬럼 추가 위젯들
        { id: '11', type: 'news', x: (colWidth + spacing) * 5, y: 230, width: colWidth, height: cellHeight, title: '뉴스', content: {}, zIndex: 1, size: '2x1' },
        
        // 7-8컬럼 추가 위젯들
        { id: '12', type: 'music', x: (colWidth + spacing) * 7, y: 230, width: colWidth, height: cellHeight, title: '음악', content: {}, zIndex: 1, size: '2x1' }
      ] as Widget[];
    })()
  },
  custom: {
    name: '빈 캔버스',
    description: '빈 페이지에서 자유롭게 시작',
    icon: '🎨',
    color: '#64748B',
    widgets: [] as Widget[]
  }
};

// 기본 위젯 설정 - 8컬럼 그리드용
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
    
    // 7-8컬럼 - 법제처검색, 계산기
    {
      id: '9',
      type: 'law_search',
      x: (cellWidth + spacing) * 6,
      y: 540,
      width: (cellWidth + spacing) * 2 - spacing,
      height: cellHeight,
      title: '법제처 검색',
      zIndex: 1,
      size: '2x1'
    },
    {
      id: '10',
      type: 'calculator',
      x: (cellWidth + spacing) * 6,
      y: 310,
      width: (cellWidth + spacing) * 2 - spacing,
      height: cellHeight,
      title: '계산기',
      zIndex: 1,
      size: '2x1'
    }
  ];
};

                                