import { Code, Palette, DollarSign, Video, Heart, Clock, Star, Globe, BarChart3, FileText, Calendar, Users, TrendingUp, BookOpen, Settings, Zap } from 'lucide-react';

export interface WidgetTemplate {
  id: string;
  type: 'bookmark' | 'clock' | 'weather' | 'todo' | 'note' | 'calendar' | 'stats' | 'news' | 'music' | 'social';
  x: number;
  y: number;
  width: number;
  height: number;
  title: string;
  content?: any;
}

export interface PageTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: any;
  color: string;
  background: string;
  widgets: WidgetTemplate[];
  preview: string;
}

export const templates: PageTemplate[] = [
  {
    id: 'developer',
    name: '개발자 워크스페이스',
    description: '코딩과 개발에 최적화된 대시보드',
    category: '개발/기획',
    icon: Code,
    color: 'bg-blue-500',
    background: 'bg-gradient-to-br from-blue-50 to-indigo-100',
    preview: '💻',
    widgets: [
      {
        id: '1',
        type: 'bookmark',
        x: 50,
        y: 50,
        width: 300,
        height: 200,
        title: '개발 도구',
        content: {
          bookmarks: [
            { id: '1', name: 'GitHub', url: 'https://github.com', icon: '🐙', color: 'bg-gray-100' },
            { id: '2', name: 'Stack Overflow', url: 'https://stackoverflow.com', icon: '❓', color: 'bg-orange-100' },
            { id: '3', name: 'MDN', url: 'https://developer.mozilla.org', icon: '📚', color: 'bg-blue-100' },
            { id: '4', name: 'VS Code', url: 'https://code.visualstudio.com', icon: '💻', color: 'bg-blue-100' }
          ]
        }
      },
      {
        id: '2',
        type: 'todo',
        x: 400,
        y: 50,
        width: 250,
        height: 200,
        title: '오늘의 할 일',
        content: {
          todos: [
            { id: '1', text: '코드 리뷰 완료', completed: false },
            { id: '2', text: '버그 수정', completed: true },
            { id: '3', text: '테스트 작성', completed: false }
          ]
        }
      },
      {
        id: '3',
        type: 'weather',
        x: 700,
        y: 50,
        width: 200,
        height: 150,
        title: '날씨'
      },
      {
        id: '4',
        type: 'stats',
        x: 50,
        y: 300,
        width: 400,
        height: 180,
        title: 'Git 통계',
        content: {
          stats: [
            { label: '오늘 커밋', value: '7' },
            { label: '이번 주', value: '23' },
            { label: '리포지토리', value: '12' }
          ]
        }
      },
      {
        id: '5',
        type: 'news',
        x: 500,
        y: 300,
        width: 400,
        height: 180,
        title: '개발 뉴스',
        content: {
          articles: [
            { title: 'React 18 새 기능', source: 'React Blog' },
            { title: 'TypeScript 5.0 릴리즈', source: 'TypeScript' },
            { title: 'Node.js 성능 최적화', source: 'Node.js' }
          ]
        }
      }
    ]
  },
  {
    id: 'designer',
    name: '디자이너 스튜디오',
    description: '창의적인 디자인 작업을 위한 공간',
    category: 'UI/UX 디자인',
    icon: Palette,
    color: 'bg-purple-500',
    background: 'bg-gradient-to-br from-purple-50 to-pink-100',
    preview: '🎨',
    widgets: [
      {
        id: '1',
        type: 'bookmark',
        x: 50,
        y: 50,
        width: 350,
        height: 220,
        title: '디자인 리소스',
        content: {
          bookmarks: [
            { id: '1', name: 'Figma', url: 'https://figma.com', icon: '🎨', color: 'bg-purple-100' },
            { id: '2', name: 'Dribbble', url: 'https://dribbble.com', icon: '🏀', color: 'bg-pink-100' },
            { id: '3', name: 'Behance', url: 'https://behance.net', icon: '✨', color: 'bg-blue-100' },
            { id: '4', name: 'Adobe', url: 'https://adobe.com', icon: '🎭', color: 'bg-red-100' },
            { id: '5', name: 'Unsplash', url: 'https://unsplash.com', icon: '📸', color: 'bg-gray-100' },
            { id: '6', name: 'Icons8', url: 'https://icons8.com', icon: '🔷', color: 'bg-blue-100' }
          ]
        }
      },
      {
        id: '2',
        type: 'todo',
        x: 450,
        y: 50,
        width: 250,
        height: 220,
        title: '프로젝트 목록',
        content: {
          todos: [
            { id: '1', text: '앱 디자인 완료', completed: false },
            { id: '2', text: '고객 피드백 반영', completed: false },
            { id: '3', text: '프로토타입 제작', completed: true },
            { id: '4', text: '컬러 팔레트 검토', completed: false }
          ]
        }
      },
      {
        id: '3',
        type: 'weather',
        x: 750,
        y: 50,
        width: 200,
        height: 150,
        title: '날씨'
      },
      {
        id: '4',
        type: 'note',
        x: 50,
        y: 320,
        width: 400,
        height: 180,
        title: '디자인 노트',
        content: {
          notes: [
            '새로운 그라데이션 효과 시도해볼 것',
            '사용자 테스트 결과 반영 필요',
            '접근성 가이드라인 확인'
          ]
        }
      },
      {
        id: '5',
        type: 'calendar',
        x: 500,
        y: 320,
        width: 450,
        height: 180,
        title: '디자인 일정',
        content: {
          events: [
            { title: '클라이언트 미팅', date: '내일 2PM' },
            { title: '디자인 리뷰', date: '수요일 10AM' },
            { title: '프로젝트 마감', date: '금요일 6PM' }
          ]
        }
      }
    ]
  },
  {
    id: 'investor',
    name: '투자자 대시보드',
    description: '금융과 투자를 관리하는 전문 도구',
    category: '금융/투자',
    icon: DollarSign,
    color: 'bg-green-500',
    background: 'bg-gradient-to-br from-green-50 to-emerald-100',
    preview: '💰',
    widgets: [
      {
        id: '1',
        type: 'stats',
        x: 50,
        y: 50,
        width: 300,
        height: 200,
        title: '포트폴리오 현황',
        content: {
          stats: [
            { label: '총 자산', value: '₩125,000,000' },
            { label: '오늘 수익', value: '+₩2,300,000' },
            { label: '수익률', value: '+3.2%' }
          ]
        }
      },
      {
        id: '2',
        type: 'bookmark',
        x: 400,
        y: 50,
        width: 350,
        height: 200,
        title: '투자 플랫폼',
        content: {
          bookmarks: [
            { id: '1', name: '키움증권', url: 'https://kiwoom.com', icon: '📈', color: 'bg-blue-100' },
            { id: '2', name: '업비트', url: 'https://upbit.com', icon: '₿', color: 'bg-orange-100' },
            { id: '3', name: '네이버 금융', url: 'https://finance.naver.com', icon: '💹', color: 'bg-green-100' },
            { id: '4', name: 'Investing.com', url: 'https://investing.com', icon: '🌍', color: 'bg-purple-100' },
            { id: '5', name: 'CoinMarketCap', url: 'https://coinmarketcap.com', icon: '🪙', color: 'bg-yellow-100' },
            { id: '6', name: 'Bloomberg', url: 'https://bloomberg.com', icon: '📊', color: 'bg-gray-100' }
          ]
        }
      },
      {
        id: '3',
        type: 'weather',
        x: 800,
        y: 50,
        width: 200,
        height: 150,
        title: '날씨'
      },
      {
        id: '4',
        type: 'news',
        x: 50,
        y: 300,
        width: 500,
        height: 200,
        title: '금융 뉴스',
        content: {
          articles: [
            { title: '코스피 3% 상승', source: '한국경제' },
            { title: '비트코인 5만 달러 돌파', source: '코인데스크' },
            { title: 'Fed 금리 정책 발표', source: 'Reuters' },
            { title: '테슬라 실적 발표', source: 'MarketWatch' }
          ]
        }
      },
      {
        id: '5',
        type: 'calendar',
        x: 600,
        y: 300,
        width: 400,
        height: 200,
        title: '투자 일정',
        content: {
          events: [
            { title: '삼성전자 실적 발표', date: '내일 2PM' },
            { title: '연준 회의록 발표', date: '수요일 9PM' },
            { title: '월요일 시장 개장', date: '월요일 9AM' }
          ]
        }
      }
    ]
  },
  {
    id: 'student',
    name: '학습자 워크스페이스',
    description: '효율적인 학습과 시간 관리를 위한 공간',
    category: '교육',
    icon: BookOpen,
    color: 'bg-indigo-500',
    background: 'bg-gradient-to-br from-indigo-50 to-blue-100',
    preview: '📚',
    widgets: [
      {
        id: '1',
        type: 'bookmark',
        x: 50,
        y: 50,
        width: 350,
        height: 220,
        title: '학습 리소스',
        content: {
          bookmarks: [
            { id: '1', name: 'Coursera', url: 'https://coursera.org', icon: '🎓', color: 'bg-blue-100' },
            { id: '2', name: 'Khan Academy', url: 'https://khanacademy.org', icon: '📖', color: 'bg-orange-100' },
            { id: '3', name: 'YouTube Edu', url: 'https://youtube.com', icon: '📺', color: 'bg-red-100' },
            { id: '4', name: 'Notion', url: 'https://notion.so', icon: '📝', color: 'bg-gray-100' },
            { id: '5', name: 'Anki', url: 'https://ankiweb.net', icon: '🧠', color: 'bg-purple-100' },
            { id: '6', name: 'Google Scholar', url: 'https://scholar.google.com', icon: '🔍', color: 'bg-green-100' }
          ]
        }
      },
      {
        id: '2',
        type: 'todo',
        x: 450,
        y: 50,
        width: 300,
        height: 220,
        title: '학습 계획',
        content: {
          todos: [
            { id: '1', text: '수학 과제 완료', completed: false },
            { id: '2', text: '영어 단어 암기', completed: true },
            { id: '3', text: '과학 실험 보고서', completed: false },
            { id: '4', text: '역사 시험 준비', completed: false }
          ]
        }
      },
      {
        id: '3',
        type: 'weather',
        x: 800,
        y: 50,
        width: 200,
        height: 150,
        title: '날씨'
      },
      {
        id: '4',
        type: 'calendar',
        x: 50,
        y: 320,
        width: 400,
        height: 180,
        title: '학습 일정',
        content: {
          events: [
            { title: '수학 수업', date: '내일 9AM' },
            { title: '영어 시험', date: '목요일 2PM' },
            { title: '과제 제출', date: '금요일 11:59PM' }
          ]
        }
      },
      {
        id: '5',
        type: 'stats',
        x: 500,
        y: 320,
        width: 500,
        height: 180,
        title: '학습 통계',
        content: {
          stats: [
            { label: '오늘 공부 시간', value: '3시간 45분' },
            { label: '이번 주 목표', value: '25시간' },
            { label: '달성률', value: '68%' }
          ]
        }
      }
    ]
  }
];

export const getTemplateById = (id: string): PageTemplate | undefined => {
  return templates.find(template => template.id === id);
};

export const getTemplatesByCategory = (category: string): PageTemplate[] => {
  return templates.filter(template => template.category === category);
};

