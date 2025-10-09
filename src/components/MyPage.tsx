import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Plus, Star, Clock, Globe, Settings, Palette, Grid, Link, Type, Image, Save, Eye, Trash2, Edit, Move, Maximize2, Minimize2, RotateCcw, Download, Upload, Layers, AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline, MousePointer, Square, Circle, Triangle, Share2, Copy, ExternalLink, Lock, Unlock, Calendar, Music, Users, BarChart3, TrendingUp, DollarSign, Target, CheckSquare, FileText, Image as ImageIcon, Youtube, Twitter, Instagram, Github, Mail, Phone, MapPin, Thermometer, Cloud, Sun, CloudRain, CloudSnow, Zap, Battery, Wifi, Volume2, VolumeX, Play, Pause, SkipForward, SkipBack, Shuffle, Repeat, Heart, ThumbsUp, MessageCircle, Bell, Search, Filter, SortAsc, SortDesc, MoreHorizontal, MoreVertical, Sun as SunIcon, Moon, MessageCircle as ContactIcon, Calculator, Rss, QrCode, Smile, Laugh, Quote, BookOpen, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { useTheme } from '../contexts/ThemeContext';

// 위젯 컴포넌트들 import
import {
  TodoWidget,
  GoalWidget,
  HabitWidget,
  TimerWidget,
  ReminderWidget,
  QuickNoteWidget,
  CalendarWidget,
  EmailWidget,
  MailServicesWidget,
  StockWidget,
  CryptoWidget,
  ExchangeWidget,
  StockAlertWidget,
  EconomicCalendarWidget,
  ExpenseWidget,
  GitHubWidget,
  CalculatorWidget,
  ConverterWidget,
  PasswordWidget,
  QRCodeWidget,
  NewsWidget,
  WeatherWidget,
  WeatherSmallWidget,
  WeatherMediumWidget,
  RSSWidget,
  GoogleSearchWidget,
  NaverSearchWidget,
  LawSearchWidget,
  MusicWidget,
  QuoteWidget,
  ColorPickerWidget,
  BookmarkWidget,
  StatsWidget,
  ContactWidget,
  EnglishWordsWidget,
  SocialWidget
} from './widgets';

interface Widget {
  id: string;
  type: 'bookmark' | 'clock' | 'weather' | 'weather_small' | 'weather_medium' | 'todo' | 'note' | 'calendar' | 'stats' | 'news' | 'music' | 'social' | 'stock' | 'crypto' | 'goal' | 'habit' | 'expense' | 'quote' | 'reminder' | 'timer' | 'calculator' | 'converter' | 'google_search' | 'naver_search' | 'law_search' | 'rss' | 'github' | 'email' | 'mail_services' | 'system' | 'media' | 'favorite' | 'recent' | 'quicknote' | 'password' | 'qr' | 'barcode' | 'colorpicker' | 'gradient' | 'icon' | 'emoji' | 'gif' | 'meme' | 'contact' | 'search' | 'meeting' | 'shopping' | 'travel' | 'sports' | 'profile_card' | 'qr_code' | 'portfolio_header' | 'project_gallery' | 'contact_buttons' | 'download_section' | 'business_header' | 'menu_section' | 'business_info' | 'map_section' | 'event_header' | 'countdown' | 'rsvp_form' | 'event_gallery' | 'blog_header' | 'post_list' | 'blog_sidebar' | 'shop_header' | 'product_grid' | 'contact_order' | 'reviews' | 'team_header' | 'member_grid' | 'activity_calendar' | 'join_form' | 'exchange' | 'github_repo' | 'stock_alert' | 'economic_calendar' | 'english_words';
  x: number;
  y: number;
  width: number;
  height: number;
  title: string;
  content?: any;
  zIndex?: number;
}

interface Bookmark {
  id: string;
  name: string;
  url: string;
  icon?: string;
  color?: string;
}

interface BackgroundSettings {
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

interface FontSettings {
  family: string;
  size: number;
  weight: 'normal' | 'bold';
  style: 'normal' | 'italic';
  color: string;
}

interface LayoutSettings {
  gridSize: number;
  snapToGrid: boolean;
  showGrid: boolean;
  spacing: number;
}

interface ShareSettings {
  isPublic: boolean;
  customDomain: string;
  allowComments: boolean;
  showStats: boolean;
  password?: string;
}

// 기본 위젯 설정
const getDefaultWidgets = (): Widget[] => [
  {
    id: '1',
    type: 'weather',
    x: 0,
    y: 0,
    width: 450,
    height: 200,
    title: '날씨',
    zIndex: 1
  },
  {
    id: '2',
    type: 'todo',
    x: 455, // 450 + 5
    y: 0,
    width: 450,
    height: 200,
    title: '할 일',
    content: {
      todos: [
        { id: '1', text: '새로운 시작페이지 만들기', completed: true },
        { id: '2', text: '위젯 추가하기', completed: false },
        { id: '3', text: '디자인 꾸미기', completed: false }
      ]
    },
    zIndex: 1
  },
  {
    id: '3',
    type: 'bookmark',
    x: 910, // 455 + 455
    y: 0,
    width: 450,
    height: 200,
    title: '즐겨찾기',
    content: {
      bookmarks: [
        { id: '1', name: '네이버', url: 'https://naver.com', icon: '🔍', color: 'bg-green-100' },
        { id: '2', name: '구글', url: 'https://google.com', icon: '🔍', color: 'bg-blue-100' },
          { id: '3', name: '유튜브', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', icon: '📺', color: 'bg-red-100' },
        { id: '4', name: '깃허브', url: 'https://github.com', icon: '💻', color: 'bg-gray-100' },
      ]
    },
    zIndex: 1
  },
  {
    id: '4',
    type: 'crypto',
    x: 1365, // 910 + 455
    y: 0,
    width: 450,
    height: 200,
    title: '암호화폐',
    zIndex: 1
  },
  {
    id: '5',
    type: 'news',
    x: 0,
    y: 245, // 240 + 5
    width: 450,
    height: 200,
    title: '뉴스',
    zIndex: 1
  },
  {
    id: '6',
    type: 'music',
    x: 455, // 450 + 5
    y: 245, // 240 + 5
    width: 450,
    height: 200,
    title: '음악',
    zIndex: 1
  },
  {
    id: '7',
    type: 'calendar',
    x: 910, // 455 + 455
    y: 245, // 240 + 5
    width: 450,
    height: 200,
    title: '캘린더',
    zIndex: 1
  },
  {
    id: '8',
    type: 'goal',
    x: 1365, // 910 + 455
    y: 245, // 240 + 5
    width: 450,
    height: 200,
    title: '목표',
    content: {
      goals: [
        { id: '1', text: '운동하기', progress: 60, target: 100 },
        { id: '2', text: '책 읽기', progress: 30, target: 50 },
        { id: '3', text: '프로젝트 완료', progress: 80, target: 100 }
      ]
    },
    zIndex: 1
  },
  {
    id: '9',
    type: 'habit',
    x: 0,
    y: 490, // 245 + 245
    width: 450,
    height: 200,
    title: '습관',
    content: {
      habits: [
        { id: '1', text: '물 마시기', streak: 7, completed: true },
        { id: '2', text: '일기 쓰기', streak: 3, completed: false },
        { id: '3', text: '산책하기', streak: 12, completed: true }
      ]
    },
    zIndex: 1
  },
  {
    id: '10',
    type: 'timer',
    x: 455, // 450 + 5
    y: 490, // 245 + 245
    width: 645, // 2x1 사이즈 (450 + 195)
    height: 200,
    title: '타이머',
    content: {
      time: 1500, // 25분
      isRunning: false,
      mode: 'pomodoro'
    },
    zIndex: 1
  },
  {
    id: '11',
    type: 'search',
    x: 910, // 455 + 455
    y: 490, // 245 + 245
    width: 450,
    height: 200,
    title: '검색',
    content: {
      searchHistory: [
        { id: '1', query: 'React hooks', time: '2시간 전' },
        { id: '2', query: 'TypeScript', time: '1일 전' },
        { id: '3', query: 'CSS Grid', time: '3일 전' }
      ]
    },
    zIndex: 1
  },
  {
    id: '12',
    type: 'email',
    x: 1365, // 910 + 455
    y: 490, // 245 + 245
    width: 450,
    height: 200,
    title: '이메일',
    content: {
      emails: [
        { id: '1', from: '김과장', subject: '월간 보고서 검토', time: '10분 전', unread: true },
        { id: '2', from: '이대리', subject: '프로젝트 일정 변경', time: '1시간 전', unread: false },
        { id: '3', from: '박팀장', subject: '회의 자료 공유', time: '3시간 전', unread: true }
      ]
    },
    zIndex: 1
  },
  {
    id: '13',
    type: 'meeting',
    x: 0,
    y: 735, // 490 + 245
    width: 450,
    height: 200,
    title: '회의실 예약',
    content: {
      meetings: [
        { id: '1', room: 'A회의실', time: '14:00-15:00', title: '주간 미팅', status: 'reserved' },
        { id: '2', room: 'B회의실', time: '15:30-16:30', title: '프로젝트 검토', status: 'available' },
        { id: '3', room: 'C회의실', time: '17:00-18:00', title: '고객 미팅', status: 'reserved' }
      ]
    },
    zIndex: 1
  },
  {
    id: '14',
    type: 'expense',
    x: 455, // 450 + 5
    y: 735, // 490 + 245
    width: 450,
    height: 200,
    title: '가계부',
    content: {
      expenses: [
        { id: '1', category: '식비', amount: 15000, date: '2024-01-15', memo: '점심' },
        { id: '2', category: '교통비', amount: 5000, date: '2024-01-15', memo: '지하철' },
        { id: '3', category: '카페', amount: 4500, date: '2024-01-15', memo: '아메리카노' }
      ],
      total: 24500
    },
    zIndex: 1
  },
  {
    id: '15',
    type: 'converter',
    x: 910, // 455 + 455
    y: 735, // 490 + 245
    width: 450,
    height: 200,
    title: '단위 변환',
    content: {
      conversions: [
        { from: 'USD', to: 'KRW', rate: 1320.50 },
        { from: 'EUR', to: 'KRW', rate: 1435.20 },
        { from: 'JPY', to: 'KRW', rate: 8.95 }
      ]
    },
    zIndex: 1
  },
  {
    id: '16',
    type: 'note',
    x: 1365, // 910 + 455
    y: 735, // 490 + 245
    width: 450,
    height: 200,
    title: '빠른 메모',
    content: {
      notes: [
        { id: '1', text: '내일 회의 준비하기', time: '10:30', pinned: true },
        { id: '2', text: '보고서 마감일 확인', time: '14:20', pinned: false },
        { id: '3', text: '고객사 연락하기', time: '16:45', pinned: false }
      ]
    },
    zIndex: 1
  },
  {
    id: '17',
    type: 'news',
    x: 0,
    y: 980, // 735 + 245
    width: 450,
    height: 300,
    title: '뉴스',
    content: {
      articles: [
        { id: '1', title: '한국 경제 성장률 상승', source: '연합뉴스', time: '2시간 전', category: '경제' },
        { id: '2', title: '새로운 AI 기술 개발', source: '조선일보', time: '4시간 전', category: '기술' },
        { id: '3', title: '환경 정책 발표', source: '동아일보', time: '6시간 전', category: '정치' },
        { id: '4', title: '스포츠 경기 결과', source: '스포츠조선', time: '8시간 전', category: '스포츠' }
      ]
    },
    zIndex: 1
  },
  {
    id: '18',
    type: 'shopping',
    x: 455, // 450 + 5
    y: 980, // 735 + 245
    width: 450,
    height: 200,
    title: '쇼핑',
    content: {
      sites: [
        { name: '11번가', url: 'https://www.11st.co.kr', icon: '🛒' },
        { name: 'G마켓', url: 'https://www.gmarket.co.kr', icon: '🛍️' },
        { name: '인터파크', url: 'https://www.interpark.com', icon: '🎫' },
        { name: '옥션', url: 'https://www.auction.co.kr', icon: '🔨' },
        { name: '위메프', url: 'https://www.wemakeprice.com', icon: '💸' },
        { name: '쿠팡', url: 'https://www.coupang.com', icon: '📦' }
      ]
    },
    zIndex: 1
  },
  {
    id: '19',
    type: 'travel',
    x: 910, // 455 + 455
    y: 980, // 735 + 245
    width: 450,
    height: 200,
    title: '여행',
    content: {
      sites: [
        { name: 'Booking', url: 'https://www.booking.com', icon: '🏨' },
        { name: 'Tripadvisor', url: 'https://www.tripadvisor.com', icon: '🗺️' },
        { name: 'Expedia', url: 'https://www.expedia.com', icon: '✈️' },
        { name: 'Skyscanner', url: 'https://www.skyscanner.co.kr', icon: '🔍' },
        { name: 'Airbnb', url: 'https://www.airbnb.co.kr', icon: '🏠' },
        { name: '아고다', url: 'https://www.agoda.com', icon: '🌏' }
      ]
    },
    zIndex: 1
  },
  {
    id: '20',
    type: 'sports',
    x: 1365, // 910 + 455
    y: 980, // 735 + 245
    width: 450,
    height: 200,
    title: '스포츠',
    content: {
      news: [
        { id: '1', title: '프리미어리그 경기 결과', league: 'EPL', time: '1시간 전' },
        { id: '2', title: 'K리그 경기 일정', league: 'K리그', time: '3시간 전' },
        { id: '3', title: '올림픽 준비 상황', league: '올림픽', time: '5시간 전' }
      ]
    },
    zIndex: 1
  }
];

export function MyPage() {
  const { theme, toggleTheme } = useTheme();
  const [isEditMode, setIsEditMode] = useState(true);
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragOverWidget, setDragOverWidget] = useState<string | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  
  // 그리드 설정 상수
  const cellWidth = 300;
  const cellHeight = 300;
  const spacing = 5;
  
  // 위젯 상태 관리
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weatherData, setWeatherData] = useState({
    temperature: 22,
    condition: '맑음',
    humidity: 60,
    windSpeed: 5,
    location: '서울',
    feelsLike: 24,
    uvIndex: 6,
    pressure: 1013,
    visibility: 10,
    sunrise: '06:30',
    sunset: '19:45',
    hourly: [
      { time: '14:00', temp: 22, icon: '☀️' },
      { time: '15:00', temp: 24, icon: '⛅' },
      { time: '16:00', temp: 23, icon: '☁️' },
      { time: '17:00', temp: 21, icon: '🌧️' }
    ]
  });
  const [cryptoPrices, setCryptoPrices] = useState({
    bitcoin: { price: 45000000, change: 2.5 },
    ethereum: { price: 3200000, change: -1.2 },
    solana: { price: 180000, change: 5.8 }
  });
  const [musicState, setMusicState] = useState({
    isPlaying: false,
    currentSong: '샘플 음악',
    artist: '샘플 아티스트',
    duration: 180,
    currentTime: 0
  });

  // 설정들
  const [backgroundSettings, setBackgroundSettings] = useState<BackgroundSettings>({
    type: 'gradient',
    color: '#3B82F6',
    gradient: {
      from: '#3B82F6',
      to: '#8B5CF6',
      direction: 'to-br'
    },
    opacity: 1
  });

  const [fontSettings, setFontSettings] = useState<FontSettings>({
    family: 'Inter',
    size: 14,
    weight: 'normal',
    style: 'normal',
    color: '#1F2937'
  });

  const [layoutSettings, setLayoutSettings] = useState<LayoutSettings>({
    gridSize: 20,
    snapToGrid: true,
    showGrid: true,
    spacing: 10
  });

  const [shareSettings, setShareSettings] = useState<ShareSettings>({
    isPublic: false,
    customDomain: 'user123', // 실제로는 사용자 ID나 사용자명을 가져와야 함
    allowComments: true,
    showStats: true
  });

  // 사용자 정보 (실제로는 인증 시스템에서 가져와야 함)
  const [currentUser, setCurrentUser] = useState({
    id: 'user123',
    name: '김사용자',
    email: 'user123@example.com'
  });

  const [pageTitle, setPageTitle] = useState("'김사용자'님의 페이지");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(pageTitle);
  
  // 페이지 관리 상태
  const [pages, setPages] = useState([
    {
      id: 'page1',
      title: "'김사용자'님의 페이지",
      widgets: getDefaultWidgets(),
      createdAt: new Date().toISOString(),
      isActive: true
    }
  ]);
  const [currentPageId, setCurrentPageId] = useState('page1');
  const [showPageManager, setShowPageManager] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingWidget, setEditingWidget] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const [showShareModal, setShowShareModal] = useState(false);
  const [showWidgetModal, setShowWidgetModal] = useState(false);
  const [showBackgroundModal, setShowBackgroundModal] = useState(false);
  const [showFontModal, setShowFontModal] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);

  // 현재 페이지의 위젯들 가져오기
  const currentPage = pages.find(page => page.id === currentPageId);
  const [widgets, setWidgets] = useState(() => {
    const pageWidgets = currentPage?.widgets || getDefaultWidgets();
    // 기존 위젯들의 크기와 위치를 새로운 크기로 업데이트
    return pageWidgets.map((widget, index) => {
      const col = index % 4;
      const row = Math.floor(index / 4);
      const spacing = 5;
      const cellWidth = 300;
      const cellHeight = 300;
      
      return {
        ...widget,
        width: cellWidth,
        height: widget.height || cellHeight,
        x: col * (cellWidth + spacing),
        y: row * (cellHeight + spacing)
      };
    });
  });



  // 템플릿 정의
  const templates = {
    profile: {
      name: '프로필 / 링크 모음',
      description: '프로필 사진, 소개, SNS 링크, QR코드',
      icon: '👤',
      widgets: [
        { id: '1', type: 'profile_card', x: 0, y: 0, width: 900, height: 300, title: '프로필 카드', content: {
          name: '김사용자',
          nickname: '@username',
          bio: '개발자 & 디자이너',
          profileImage: '',
          socialLinks: [
            { platform: 'Instagram', url: 'https://instagram.com', icon: '📷' },
            { platform: 'YouTube', url: 'https://youtube.com', icon: '📺' },
            { platform: 'Blog', url: 'https://blog.com', icon: '📝' },
            { platform: 'Email', url: 'mailto:user@example.com', icon: '📧' }
          ]
        }, zIndex: 1 },
        { id: '2', type: 'qr_code', x: 305, y: 0, width: 300, height: 300, title: 'QR 코드', content: {
          url: window.location.href,
          size: 150
        }, zIndex: 1 }
      ]
    },
    portfolio: {
      name: '포트폴리오',
      description: '프로젝트 갤러리, 상세보기, 연락처, 다운로드',
      icon: '💼',
      widgets: [
        { id: '1', type: 'portfolio_header', x: 0, y: 0, width: 900, height: 300, title: '포트폴리오 헤더', content: {
          name: '김사용자',
          title: 'Frontend Developer',
          bio: '사용자 경험을 중시하는 개발자입니다'
        }, zIndex: 1 },
        { id: '2', type: 'project_gallery', x: 0, y: 305, width: 900, height: 300, title: '프로젝트 갤러리', content: {
          projects: [
            { id: '1', title: '웹사이트 리뉴얼', image: '', description: 'React 기반 웹사이트', tools: ['React', 'TypeScript'] },
            { id: '2', title: '모바일 앱', image: '', description: 'React Native 앱', tools: ['React Native', 'Firebase'] }
          ]
        }, zIndex: 1 },
        { id: '3', type: 'contact_buttons', x: 0, y: 605, width: 600, height: 300, title: '연락처', content: {
          email: 'user@example.com',
          phone: '010-1234-5678',
          social: ['Instagram', 'LinkedIn']
        }, zIndex: 1 },
        { id: '4', type: 'download_section', x: 605, y: 605, width: 300, height: 300, title: '다운로드', content: {
          resume: '이력서.pdf',
          portfolio: '포트폴리오.pdf'
        }, zIndex: 1 }
      ]
    },
    business: {
      name: '비즈니스 / 가게 소개',
      description: '가게 정보, 메뉴, 지도, 영업시간, 후기',
      icon: '🏪',
      widgets: [
        { id: '1', type: 'business_header', x: 0, y: 0, width: 900, height: 300, title: '가게 소개', content: {
          name: '맛있는 카페',
          description: '신선한 원두로 만드는 특별한 커피',
          logo: '',
          mainImage: ''
        }, zIndex: 1 },
        { id: '2', type: 'menu_section', x: 0, y: 305, width: 900, height: 300, title: '메뉴', content: {
          items: [
            { name: '아메리카노', price: '4000원', description: '진한 에스프레소', image: '' },
            { name: '라떼', price: '4500원', description: '부드러운 우유거품', image: '' }
          ]
        }, zIndex: 1 },
        { id: '3', type: 'business_info', x: 0, y: 605, width: 600, height: 300, title: '영업정보', content: {
          hours: '평일 08:00-22:00\n주말 09:00-21:00',
          phone: '02-1234-5678',
          address: '서울시 강남구'
        }, zIndex: 1 },
        { id: '4', type: 'map_section', x: 605, y: 605, width: 300, height: 300, title: '지도', content: {
          address: '서울시 강남구 테헤란로 123',
          mapUrl: 'https://map.naver.com'
        }, zIndex: 1 }
      ]
    },
    event: {
      name: '행사 / 초대장',
      description: '행사 정보, D-Day 카운터, RSVP 폼, 갤러리',
      icon: '🎉',
      widgets: [
        { id: '1', type: 'event_header', x: 0, y: 0, width: 900, height: 300, title: '행사 소개', content: {
          title: '2024 신년 파티',
          date: '2024-01-15',
          time: '19:00-22:00',
          location: '서울시 강남구 파티홀',
          description: '함께 즐거운 시간을 보내요!',
          poster: ''
        }, zIndex: 1 },
        { id: '2', type: 'countdown', x: 0, y: 305, width: 600, height: 300, title: 'D-Day', content: {
          targetDate: '2024-01-15',
          message: '행사까지'
        }, zIndex: 1 },
        { id: '3', type: 'rsvp_form', x: 605, y: 305, width: 300, height: 300, title: '참석 확인', content: {
          fields: ['이름', '인원', '메시지'],
          submitButton: '참석 확인'
        }, zIndex: 1 },
        { id: '4', type: 'event_gallery', x: 0, y: 605, width: 900, height: 300, title: '행사 갤러리', content: {
          images: ['', '', '']
        }, zIndex: 1 }
      ]
    },
    blog: {
      name: '블로그 / 뉴스피드',
      description: '글 목록, 상세보기, 태그, 공유',
      icon: '📝',
      widgets: [
        { id: '1', type: 'blog_header', x: 0, y: 0, width: 900, height: 300, title: '블로그 헤더', content: {
          title: '김사용자의 블로그',
          description: '개발과 일상을 기록합니다',
          profile: ''
        }, zIndex: 1 },
        { id: '2', type: 'post_list', x: 0, y: 305, width: 900, height: 300, title: '글 목록', content: {
          posts: [
            { id: '1', title: 'React Hooks 완벽 가이드', date: '2024-01-10', excerpt: 'React Hooks에 대해 알아보자', thumbnail: '', tags: ['React', 'JavaScript'] },
            { id: '2', title: 'TypeScript 타입 시스템', date: '2024-01-08', excerpt: 'TypeScript의 강력한 타입 시스템', thumbnail: '', tags: ['TypeScript'] }
          ]
        }, zIndex: 1 },
        { id: '3', type: 'blog_sidebar', x: 0, y: 605, width: 300, height: 300, title: '사이드바', content: {
          categories: ['개발', '일상', '리뷰'],
          recentPosts: ['최근 글 1', '최근 글 2']
        }, zIndex: 1 }
      ]
    },
    shop: {
      name: '상품 / 판매 (라이트 커머스)',
      description: '상품 카드, 옵션 선택, 문의/주문, 후기',
      icon: '🛍️',
      widgets: [
        { id: '1', type: 'shop_header', x: 0, y: 0, width: 900, height: 300, title: '쇼핑몰 헤더', content: {
          brandName: '브랜드 이름',
          description: '고품질 상품을 만나보세요',
          logo: ''
        }, zIndex: 1 },
        { id: '2', type: 'product_grid', x: 0, y: 305, width: 900, height: 300, title: '상품 목록', content: {
          products: [
            { id: '1', name: '상품 1', price: '29,000원', image: '', description: '상품 설명', options: ['S', 'M', 'L'] },
            { id: '2', name: '상품 2', price: '39,000원', image: '', description: '상품 설명', options: ['빨강', '파랑', '검정'] }
          ]
        }, zIndex: 1 },
        { id: '3', type: 'contact_order', x: 0, y: 605, width: 600, height: 300, title: '주문/문의', content: {
          kakao: '카카오톡 문의',
          email: '이메일 문의',
          phone: '전화 주문'
        }, zIndex: 1 },
        { id: '4', type: 'reviews', x: 605, y: 605, width: 300, height: 300, title: '후기', content: {
          averageRating: 4.5,
          reviewCount: 23,
          recentReviews: ['정말 좋아요!', '배송 빠름']
        }, zIndex: 1 }
      ]
    },
    team: {
      name: '팀 / 동호회 / 프로젝트',
      description: '팀 소개, 멤버, 활동 갤러리, 일정, 가입폼',
      icon: '👥',
      widgets: [
        { id: '1', type: 'team_header', x: 0, y: 0, width: 900, height: 300, title: '팀 소개', content: {
          teamName: '개발 동아리',
          description: '함께 성장하는 개발자들의 모임',
          logo: ''
        }, zIndex: 1 },
        { id: '2', type: 'member_grid', x: 0, y: 305, width: 900, height: 300, title: '멤버 소개', content: {
          members: [
            { name: '김리더', role: '팀장', image: '', description: '프론트엔드 개발자' },
            { name: '이개발', role: '개발자', image: '', description: '백엔드 개발자' }
          ]
        }, zIndex: 1 },
        { id: '3', type: 'activity_calendar', x: 0, y: 605, width: 600, height: 300, title: '활동 일정', content: {
          events: [
            { date: '2024-01-20', title: '정기 모임' },
            { date: '2024-01-27', title: '프로젝트 발표' }
          ]
        }, zIndex: 1 },
        { id: '4', type: 'join_form', x: 605, y: 605, width: 300, height: 300, title: '가입 신청', content: {
          fields: ['이름', '연락처', '관심분야'],
          submitButton: '가입 신청'
        }, zIndex: 1 }
      ]
    },
    custom: {
      name: '커스텀',
      description: '빈 페이지에서 자유롭게 시작',
      icon: '🎨',
      widgets: []
    }
  };

  // 페이지 관리 함수들
  const createNewPage = () => {
    setShowTemplateModal(true);
  };

  const createPageWithTemplate = (templateKey: string) => {
    const template = templates[templateKey as keyof typeof templates];
    const newPageId = `page${Date.now()}`;
    const newPage = {
      id: newPageId,
      title: template.name,
      widgets: template.widgets,
      createdAt: new Date().toISOString(),
      isActive: false
    };
    
    setPages(prev => prev.map(page => ({ ...page, isActive: false })).concat(newPage));
    setCurrentPageId(newPageId);
    setPageTitle(newPage.title);
    // 새 페이지 생성 시에도 위젯 크기와 위치를 업데이트
    setWidgets(newPage.widgets.map((widget, index) => {
      const col = index % 4;
      const row = Math.floor(index / 4);
      const spacing = 5;
      const cellWidth = 300;
      const cellHeight = 300;
      
      return {
        ...widget,
        width: cellWidth,
        height: widget.height || cellHeight,
        x: col * (cellWidth + spacing),
        y: row * (cellHeight + spacing)
      };
    }));
    setShowTemplateModal(false);
    setShowPageManager(false);
  };

  const switchPage = (pageId: string) => {
    const targetPage = pages.find(page => page.id === pageId);
    if (targetPage) {
      setCurrentPageId(pageId);
      setPageTitle(targetPage.title);
      // 페이지 전환 시에도 위젯 크기와 위치를 업데이트
      setWidgets(targetPage.widgets.map((widget, index) => {
        const col = index % 4;
        const row = Math.floor(index / 4);
        const spacing = 5;
        const cellWidth = 320;
        const cellHeight = 240;
        
        return {
          ...widget,
          width: cellWidth,
          height: widget.height || cellHeight,
          x: col * (cellWidth + spacing),
          y: row * (cellHeight + spacing)
        };
      }));
      setPages(prev => prev.map(page => ({ ...page, isActive: page.id === pageId })));
    }
  };

  const deletePage = (pageId: string) => {
    if (pages.length <= 1) {
      alert('최소 하나의 페이지는 유지해야 합니다.');
      return;
    }
    
    const remainingPages = pages.filter(page => page.id !== pageId);
    setPages(remainingPages);
    
    // 삭제된 페이지가 현재 페이지였다면 첫 번째 페이지로 전환
    if (currentPageId === pageId) {
      const firstPage = remainingPages[0];
      setCurrentPageId(firstPage.id);
      setPageTitle(firstPage.title);
      setWidgets(firstPage.widgets);
    }
  };

  const updateCurrentPage = (updates: any) => {
    setPages(prev => prev.map(page => 
      page.id === currentPageId 
        ? { ...page, ...updates }
        : page
    ));
  };

  // 위젯 변경 시 현재 페이지 업데이트
  useEffect(() => {
    updateCurrentPage({ widgets });
  }, [widgets]);

  // 페이지 제목 변경 시 현재 페이지 업데이트
  useEffect(() => {
    updateCurrentPage({ title: pageTitle });
  }, [pageTitle]);

  // 위젯 편집 함수
  const editWidget = (widgetId: string) => {
    setEditingWidget(widgetId);
    const widget = widgets.find(w => w.id === widgetId);
    if (widget) {
      setFormData(widget.content || {});
    }
  };

  const saveWidget = (widgetId: string) => {
    setWidgets(prev => prev.map(w => 
      w.id === widgetId 
        ? { ...w, content: { ...w.content, ...formData } }
        : w
    ));
    setEditingWidget(null);
    setFormData({});
  };

  const cancelEdit = () => {
    setEditingWidget(null);
    setFormData({});
  };

  // 폼 제출 처리
  const handleFormSubmit = (widgetId: string, formType: string) => {
    const widget = widgets.find(w => w.id === widgetId);
    if (widget) {
      // 폼 데이터를 위젯에 저장
      const newContent = { ...widget.content };
      if (formType === 'rsvp') {
        newContent.submissions = [...(newContent.submissions || []), formData];
      } else if (formType === 'join') {
        newContent.applications = [...(newContent.applications || []), formData];
      } else if (formType === 'contact') {
        newContent.messages = [...(newContent.messages || []), formData];
      }
      
      setWidgets(prev => prev.map(w => 
        w.id === widgetId 
          ? { ...w, content: newContent }
          : w
      ));
      
      alert('제출되었습니다!');
      setFormData({});
    }
  };

  // QR 코드 생성 함수
  const generateQRCode = (url: string) => {
    // 실제 QR 코드 생성 로직 (간단한 시뮬레이션)
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(url)}`;
  };

  // D-Day 계산 함수
  const calculateDaysLeft = (targetDate: string) => {
    const today = new Date();
    const target = new Date(targetDate);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // 카테고리 아이콘 함수
  const getCategoryIcon = (categoryKey: string) => {
    const icons: { [key: string]: string } = {
      productivity: '📊',
      finance: '💰',
      development: '🔧',
      information: '📰',
      media: '🎵',
      design: '🎨',
      education: '📚',
      social: '👥',
      system: '⚙️'
    };
    return icons[categoryKey] || '📦';
  };

  // 위젯 미리보기 렌더링 함수
  const renderWidgetPreview = (widgetType: string) => {
    switch (widgetType) {
      case 'profile_card':
        return (
          <div className="text-center">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mx-auto mb-2 flex items-center justify-center">
              <span className="text-white text-xs">👤</span>
            </div>
            <div className="text-xs font-semibold text-gray-800 mb-1">김사용자</div>
            <div className="text-xs text-blue-600 mb-2">@username</div>
            <div className="space-y-1">
              <div className="w-full h-4 bg-gray-200 rounded text-xs flex items-center justify-center">📷 Instagram</div>
              <div className="w-full h-4 bg-gray-200 rounded text-xs flex items-center justify-center">📺 YouTube</div>
            </div>
          </div>
        );

      case 'portfolio_header':
        return (
          <div className="text-center bg-gradient-to-r from-blue-50 to-purple-50 p-2 rounded">
            <div className="text-sm font-bold text-gray-800 mb-1">김사용자</div>
            <div className="text-xs text-blue-600 mb-1">Frontend Developer</div>
            <div className="text-xs text-gray-600">사용자 경험을 중시하는 개발자</div>
          </div>
        );

      case 'project_gallery':
        return (
          <div className="space-y-2">
            <div className="border border-gray-200 rounded p-2">
              <div className="text-xs font-semibold text-gray-800">웹사이트 리뉴얼</div>
              <div className="text-xs text-gray-600">React 기반 웹사이트</div>
              <div className="flex gap-1 mt-1">
                <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">React</span>
                <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">TS</span>
              </div>
            </div>
          </div>
        );

      case 'business_header':
        return (
          <div className="text-center bg-gradient-to-r from-orange-50 to-red-50 p-2 rounded">
            <div className="text-sm font-bold text-gray-800 mb-1">맛있는 카페</div>
            <div className="text-xs text-gray-600">신선한 원두로 만드는 커피</div>
          </div>
        );

      case 'menu_section':
        return (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <div>
                <div className="font-semibold text-gray-800">아메리카노</div>
                <div className="text-gray-600">진한 에스프레소</div>
              </div>
              <span className="font-bold text-orange-600">4000원</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <div>
                <div className="font-semibold text-gray-800">라떼</div>
                <div className="text-gray-600">부드러운 우유거품</div>
              </div>
              <span className="font-bold text-orange-600">4500원</span>
            </div>
          </div>
        );

      case 'event_header':
        return (
          <div className="text-center bg-gradient-to-r from-pink-50 to-purple-50 p-2 rounded">
            <div className="text-sm font-bold text-gray-800 mb-1">2024 신년 파티</div>
            <div className="text-xs text-gray-600 space-y-1">
              <div>📅 2024-01-15</div>
              <div>⏰ 19:00-22:00</div>
              <div>📍 강남구 파티홀</div>
            </div>
          </div>
        );

      case 'countdown':
        return (
          <div className="text-center bg-red-100 rounded p-2">
            <div className="text-lg font-bold text-red-600">D-7</div>
            <p className="text-xs text-red-600">행사까지</p>
          </div>
        );

      case 'rsvp_form':
        return (
          <div className="space-y-1">
            <input type="text" placeholder="이름" className="w-full p-1 border rounded text-xs" disabled />
            <input type="number" placeholder="인원" className="w-full p-1 border rounded text-xs" disabled />
            <textarea placeholder="메시지" className="w-full p-1 border rounded text-xs h-8 resize-none" disabled />
            <button className="w-full p-1 bg-blue-600 text-white rounded text-xs">참석 확인</button>
          </div>
        );

      case 'blog_header':
        return (
          <div className="text-center bg-gradient-to-r from-green-50 to-blue-50 p-2 rounded">
            <div className="text-sm font-bold text-gray-800 mb-1">김사용자의 블로그</div>
            <div className="text-xs text-gray-600">개발과 일상을 기록합니다</div>
          </div>
        );

      case 'post_list':
        return (
          <div className="space-y-2">
            <div className="border border-gray-200 rounded p-2">
              <div className="text-xs font-semibold text-gray-800">React Hooks 완벽 가이드</div>
              <div className="text-xs text-gray-600">React Hooks에 대해 알아보자</div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-gray-500">2024-01-10</span>
                <div className="flex gap-1">
                  <span className="text-xs bg-gray-100 text-gray-600 px-1 rounded">React</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'shop_header':
        return (
          <div className="text-center bg-gradient-to-r from-yellow-50 to-orange-50 p-2 rounded">
            <div className="text-sm font-bold text-gray-800 mb-1">브랜드 이름</div>
            <div className="text-xs text-gray-600">고품질 상품을 만나보세요</div>
          </div>
        );

      case 'product_grid':
        return (
          <div className="grid grid-cols-2 gap-2">
            <div className="border border-gray-200 rounded p-1">
              <div className="aspect-square bg-gray-200 rounded mb-1 flex items-center justify-center">
                <span className="text-gray-400 text-xs">📦</span>
              </div>
              <div className="text-xs font-semibold text-gray-800">상품 1</div>
              <div className="text-xs font-bold text-orange-600">29,000원</div>
            </div>
            <div className="border border-gray-200 rounded p-1">
              <div className="aspect-square bg-gray-200 rounded mb-1 flex items-center justify-center">
                <span className="text-gray-400 text-xs">📦</span>
              </div>
              <div className="text-xs font-semibold text-gray-800">상품 2</div>
              <div className="text-xs font-bold text-orange-600">39,000원</div>
            </div>
          </div>
        );

      case 'team_header':
        return (
          <div className="text-center bg-gradient-to-r from-indigo-50 to-purple-50 p-2 rounded">
            <div className="text-sm font-bold text-gray-800 mb-1">개발 동아리</div>
            <div className="text-xs text-gray-600">함께 성장하는 개발자들의 모임</div>
          </div>
        );

      case 'member_grid':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-2 border border-gray-200 rounded">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">👤</span>
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-800">김리더</div>
                <div className="text-xs text-blue-600">팀장</div>
              </div>
            </div>
          </div>
        );

      case 'qr_code':
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-white border-2 border-gray-200 rounded mx-auto mb-2 flex items-center justify-center">
              <div className="w-12 h-12 bg-gray-800 rounded grid grid-cols-4 gap-0.5 p-1">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div key={i} className={`w-1 h-1 ${Math.random() > 0.5 ? 'bg-white' : 'bg-gray-800'} rounded-sm`}></div>
                ))}
              </div>
            </div>
            <p className="text-xs text-gray-600">QR 코드</p>
          </div>
        );

      case 'contact_buttons':
        return (
          <div className="space-y-1">
            <button className="w-full p-1 bg-blue-600 text-white rounded text-xs">📧 이메일</button>
            <button className="w-full p-1 bg-green-600 text-white rounded text-xs">📱 전화</button>
            <button className="w-full p-1 bg-purple-600 text-white rounded text-xs">💼 LinkedIn</button>
          </div>
        );

      case 'business_info':
        return (
          <div className="space-y-1">
            <div>
              <div className="text-xs font-semibold text-gray-800">영업시간</div>
              <div className="text-xs text-gray-600">평일 08:00-22:00</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-800">전화번호</div>
              <div className="text-xs text-gray-600">02-1234-5678</div>
            </div>
          </div>
        );

      case 'map_section':
        return (
          <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center">
            <div className="text-center">
              <div className="text-lg mb-1">🗺️</div>
              <p className="text-xs text-gray-600">지도 보기</p>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Grid className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-xs text-gray-500">미리보기</p>
            </div>
          </div>
        );
    }
  };

  // 초기화 함수
  const resetToDefault = () => {
    const defaultWidgets = getDefaultWidgets();
    setWidgets(defaultWidgets.map((widget, index) => {
      const col = index % 4;
      const row = Math.floor(index / 4);
      const spacing = 5;
      const cellWidth = 300;
      const cellHeight = 300;
      
      return {
        ...widget,
        width: cellWidth,
        height: widget.height || cellHeight,
        x: col * (cellWidth + spacing),
        y: row * (cellHeight + spacing)
      };
    }));
    setBackgroundSettings({
      type: 'gradient',
      color: '#3B82F6',
      gradient: {
        from: '#3B82F6',
        to: '#8B5CF6',
        direction: 'to-br'
      },
      opacity: 1
    });
    setFontSettings({
      family: 'Inter',
      size: 14,
      weight: 'normal',
      style: 'normal',
      color: '#1F2937'
    });
    setLayoutSettings({
      gridSize: 20,
      snapToGrid: true,
      showGrid: true,
      spacing: 10
    });
  };

  // 사용 가능한 위젯들 (카테고리별로 분류)
  const widgetCategories = {
    // 📊 생산성 및 업무 관리
    productivity: {
      name: '생산성 & 업무',
      widgets: [
        { type: 'todo', name: '할 일 관리', icon: CheckSquare, description: '할 일 목록 관리 및 체크' },
        { type: 'goal', name: '목표 추적', icon: Target, description: '목표 설정 및 진행률 추적' },
        { type: 'habit', name: '습관 트래킹', icon: Repeat, description: '일상 습관 관리' },
        { type: 'timer', name: '포모도로 타이머', icon: Clock, description: '집중 시간 관리' },
        { type: 'reminder', name: '알림 관리', icon: Bell, description: '중요한 일정 알림' },
        { type: 'quicknote', name: '빠른 메모', icon: FileText, description: '즉석 메모 작성' },
        { type: 'calendar', name: '캘린더', icon: Calendar, description: '일정 관리 및 계획' },
        { type: 'email', name: '이메일 관리', icon: Mail, description: '메일 확인 및 관리' },
        { type: 'mail_services', name: '메일 서비스', icon: Mail, description: '다양한 메일 서비스 바로가기' },
      ]
    },

    // 💰 금융 및 투자
    finance: {
      name: '금융 & 투자',
      widgets: [
        { type: 'stock', name: '주식 시세', icon: TrendingUp, description: '실시간 주식 가격 확인' },
        { type: 'crypto', name: '암호화폐', icon: DollarSign, description: '코인 가격 정보' },
        { type: 'exchange', name: '환율 정보', icon: DollarSign, description: '실시간 환율 정보' },
        { type: 'stock_alert', name: '주식 알림', icon: Bell, description: '주식 시세 알림 설정' },
        { type: 'economic_calendar', name: '경제 캘린더', icon: Calendar, description: 'FOMC, CPI 발표 일정' },
        { type: 'expense', name: '가계부', icon: BarChart3, description: '지출 관리 및 분석' },
      ]
    },

    // 🔧 개발 및 기술
    development: {
      name: '개발 & 기술',
      widgets: [
        { type: 'github', name: 'GitHub', icon: Github, description: '코드 저장소 관리' },
        { type: 'github_repo', name: 'GitHub Repo', icon: Github, description: '저장소 상태 모니터링' },
        { type: 'calculator', name: '계산기', icon: Calculator, description: '간편 계산기' },
        { type: 'converter', name: '단위 변환', icon: Calculator, description: '단위 변환기' },
        { type: 'password', name: '비밀번호 생성', icon: Lock, description: '안전한 비밀번호 생성' },
        { type: 'qr', name: 'QR 코드', icon: QrCode, description: 'QR 코드 생성' },
      ]
    },

    // 📰 정보 및 뉴스
    information: {
      name: '정보 & 뉴스',
      widgets: [
        { type: 'news', name: '뉴스 피드', icon: Globe, description: '최신 뉴스 및 관심사' },
        { type: 'weather', name: '날씨 정보', icon: Cloud, description: '실시간 날씨 정보' },
        { type: 'weather_small', name: '날씨 (소형)', icon: Cloud, description: '간단한 날씨 정보' },
        { type: 'weather_medium', name: '날씨 (중형)', icon: Cloud, description: '중간 크기 날씨 정보' },
        { type: 'rss', name: 'RSS 피드', icon: Rss, description: 'RSS 뉴스 피드' },
        { type: 'google_search', name: '구글 검색', icon: Search, description: '구글 검색 바로가기' },
        { type: 'naver_search', name: '네이버 검색', icon: Search, description: '네이버 검색 바로가기' },
        { type: 'law_search', name: '법제처 검색', icon: Search, description: '법령 검색 바로가기' },
      ]
    },

    // 🎵 미디어 및 엔터테인먼트
    media: {
      name: '미디어 & 엔터테인먼트',
      widgets: [
        { type: 'music', name: '음악 플레이어', icon: Music, description: '음악 재생 및 관리' },
        { type: 'quote', name: '영감 명언', icon: Quote, description: '영감을 주는 명언' },
      ]
    },

    // 🎨 디자인 및 도구
    design: {
      name: '디자인 & 도구',
      widgets: [
        { type: 'colorpicker', name: '컬러 팔레트', icon: Palette, description: '색상 생성 및 선택' },
        { type: 'bookmark', name: '즐겨찾기', icon: Link, description: '자주 사용하는 링크' },
        { type: 'stats', name: '통계 차트', icon: BarChart3, description: '데이터 시각화' },
        { type: 'contact', name: '문의하기', icon: ContactIcon, description: '사이트 개설자에게 문의' },
      ]
    },

    // 📚 교육 및 학습
    education: {
      name: '교육 & 학습',
      widgets: [
        { type: 'english_words', name: '영어 단어 학습', icon: BookOpen, description: '영어 단어 학습 도구' },
      ]
    },

    // 👥 소셜 및 커뮤니케이션
    social: {
      name: '소셜 & 커뮤니케이션',
      widgets: [
        { type: 'social', name: '소셜미디어', icon: Users, description: 'SNS 관리' },
      ]
    }
  };

  // 모든 위젯을 평면 배열로 변환
  const allWidgets = Object.values(widgetCategories).flatMap(category => category.widgets);

  // 폰트 옵션들
  const fontOptions = [
    { family: 'Inter', name: 'Inter' },
    { family: 'Roboto', name: 'Roboto' },
    { family: 'Open Sans', name: 'Open Sans' },
    { family: 'Lato', name: 'Lato' },
    { family: 'Montserrat', name: 'Montserrat' },
    { family: 'Poppins', name: 'Poppins' },
    { family: 'Source Sans Pro', name: 'Source Sans Pro' },
    { family: 'Nunito', name: 'Nunito' },
  ];

  // 위젯 겹침 감지 함수
  const isWidgetOverlapping = (widget1: Widget, widget2: Widget) => {
    return !(
      widget1.x + widget1.width <= widget2.x ||
      widget2.x + widget2.width <= widget1.x ||
      widget1.y + widget1.height <= widget2.y ||
      widget2.y + widget2.height <= widget1.y
    );
  };

  // 4컬럼 그리드에 위젯 자동 배치 (겹침 방지)
  const getNextAvailablePosition = (width: number, height: number) => {
    const cols = 4; // 4컬럼 고정
    
    // 각 컬럼별로 마지막 위젯의 Y 위치 계산
    const columnHeights = Array(cols).fill(0);
    
    widgets.forEach(widget => {
      const col = Math.floor(widget.x / (cellWidth + spacing));
      if (col >= 0 && col < cols) {
        const widgetBottom = widget.y + widget.height + spacing;
        columnHeights[col] = Math.max(columnHeights[col], widgetBottom);
      }
    });
    
    // 가장 낮은 컬럼 찾기
    const minHeight = Math.min(...columnHeights);
    const targetCol = columnHeights.indexOf(minHeight);
    
    // 충돌 감지하여 위치 조정
    let testX = targetCol * (cellWidth + spacing);
    let testY = minHeight;
    
    const testWidget: Widget = {
      id: 'test',
      type: 'bookmark',
      x: testX,
      y: testY,
      width,
      height,
      title: ''
    };
    
    // 다른 위젯과 겹치는지 확인
    let hasCollision = true;
    let attempts = 0;
    
    while (hasCollision && attempts < 10) {
      hasCollision = widgets.some(widget => isWidgetOverlapping(widget, testWidget));
      
      if (hasCollision) {
        testY += cellHeight / 2;
        testWidget.y = testY;
        attempts++;
      }
    }
    
    return {
      x: testX,
      y: testY
    };
  };


  // 위젯 추가
  const addWidget = (type: string) => {
    // 위젯 크기 결정
    let width = cellWidth; // 기본 전체 컬럼 너비
    let height = cellHeight; // 기본 높이
    
    if (type === 'weather_small') {
      width = cellWidth / 2 - spacing; // 1/2 너비
      height = cellHeight / 2 - spacing; // 1/2 높이
    } else if (type === 'weather_medium') {
      width = cellWidth - spacing; // 전체 너비
      height = cellHeight / 2 - spacing; // 1/2 높이
    } else if (type === 'timer') {
      width = cellWidth * 2 - spacing; // 2컬럼 너비
      height = cellHeight / 2 - spacing; // 1/2 높이
    }
    
    const position = getNextAvailablePosition(width, height);
    
    const newWidget: Widget = {
      id: Date.now().toString(),
      type: type as any,
      x: position.x,
      y: position.y,
      width,
      height,
      title: allWidgets.find(w => w.type === type)?.name || '새 위젯',
      content: type === 'bookmark' ? { bookmarks: [] } : undefined,
      zIndex: Math.max(...widgets.map(w => w.zIndex || 1), 1) + 1
    };
    setWidgets([...widgets, newWidget]);
  };

  // 위젯 삭제
  const removeWidget = (id: string) => {
    setWidgets(widgets.filter(w => w.id !== id));
    if (selectedWidget === id) {
      setSelectedWidget(null);
    }
  };

  // 위젯 업데이트
  const updateWidget = useCallback((id: string, updates: Partial<Widget>) => {
    setWidgets(prevWidgets => prevWidgets.map(w => w.id === id ? { ...w, ...updates } : w));
  }, []);

  // 위젯 선택
  const selectWidget = (id: string) => {
    if (isEditMode) {
      setSelectedWidget(id);
      // z-index를 최상위로 (드래그 중이 아닐 때만)
      if (!draggedWidget) {
        updateWidget(id, { zIndex: Math.max(...widgets.map(w => w.zIndex || 1), 1) + 1 });
      }
    }
  };

  // 드래그 시작
  const handleMouseDown = (e: React.MouseEvent, widgetId: string) => {
    if (!isEditMode) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const widget = widgets.find(w => w.id === widgetId);
    if (!widget) return;

    setDraggedWidget(widgetId);
    setSelectedWidget(widgetId);
    
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    
    // 드래그 시작 시 순서 변경 모드 활성화
    setIsReordering(true);
  };

  // 드래그 중
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedWidget) return;

    e.preventDefault();
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const canvasRect = canvas.getBoundingClientRect();
    let newX = e.clientX - canvasRect.left - dragOffset.x;
    let newY = e.clientY - canvasRect.top - dragOffset.y;

    // 그리드 스냅핑 (4컬럼 그리드)
    const targetCol = Math.floor(newX / (cellWidth + spacing));
    newX = targetCol * (cellWidth + spacing);
    newY = Math.round(newY / cellHeight) * cellHeight;

    // 경계 체크
    newX = Math.max(0, Math.min(newX, 3 * (cellWidth + spacing))); // 4컬럼이므로 0~3
    newY = Math.max(0, newY);

    // 드래그 중인 위젯 위치 업데이트
    setWidgets(prevWidgets => 
      prevWidgets.map(w => 
        w.id === draggedWidget ? { ...w, x: newX, y: newY } : w
      )
    );
  };

  // 드래그 종료
  const handleMouseUp = () => {
    if (draggedWidget) {
      // 드래그 종료 시 충돌 처리
      const draggedWidgetData = widgets.find(w => w.id === draggedWidget);
      if (draggedWidgetData) {
        const collidingWidgets = widgets.filter(w => 
          w.id !== draggedWidget && isWidgetOverlapping(draggedWidgetData, w)
        );

        if (collidingWidgets.length > 0) {
          // 충돌하는 위젯들과 그 아래 모든 위젯들을 아래로 이동
          const draggedBottom = draggedWidgetData.y + draggedWidgetData.height;
          
          // 가장 위에 있는 충돌 위젯의 위치를 기준으로 이동 거리 계산
          const topCollidingWidget = collidingWidgets.reduce((top, current) => 
            current.y < top.y ? current : top
          );
          
          const moveDistance = draggedBottom + spacing - topCollidingWidget.y;
          
          // 충돌하는 위젯과 그 아래 모든 위젯들을 이동
          setWidgets(widgets.map(w => {
            if (w.y >= topCollidingWidget.y && w.id !== draggedWidget) {
              return { ...w, y: w.y + moveDistance };
            }
            return w;
          }));
        }
      }
    }

    setDraggedWidget(null);
    setDragOverWidget(null);
    setIsReordering(false);
  };

  // 위젯 순서 변경
  const reorderWidgets = (draggedId: string, targetId: string) => {
    if (draggedId === targetId) return;
    
    const draggedIndex = widgets.findIndex(w => w.id === draggedId);
    const targetIndex = widgets.findIndex(w => w.id === targetId);
    
    if (draggedIndex === -1 || targetIndex === -1) return;
    
    const newWidgets = [...widgets];
    const [draggedWidget] = newWidgets.splice(draggedIndex, 1);
    newWidgets.splice(targetIndex, 0, draggedWidget);
    
    setWidgets(newWidgets);
  };


  // 링크 열기
  const openLink = (url: string) => {
    window.open(url, '_blank');
  };

  // 즐겨찾기 추가
  const addBookmark = (widgetId: string) => {
    const name = prompt('사이트 이름을 입력하세요:');
    if (!name) return;
    
    const url = prompt('URL을 입력하세요 (예: https://naver.com):');
    if (!url) return;
    
    // URL이 http:// 또는 https://로 시작하지 않으면 추가
    const fullUrl = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
    
    // 도메인에 따른 아이콘 자동 설정
    const getIconForDomain = (domain: string) => {
      const lowerDomain = domain.toLowerCase();
      if (lowerDomain.includes('naver')) return '🔍';
      if (lowerDomain.includes('google')) return '🔍';
      if (lowerDomain.includes('youtube')) return '📺';
      if (lowerDomain.includes('github')) return '💻';
      if (lowerDomain.includes('facebook')) return '📘';
      if (lowerDomain.includes('instagram')) return '📷';
      if (lowerDomain.includes('twitter')) return '🐦';
      if (lowerDomain.includes('linkedin')) return '💼';
      if (lowerDomain.includes('netflix')) return '🎬';
      if (lowerDomain.includes('spotify')) return '🎵';
      return '🌐';
    };
    
    const domain = new URL(fullUrl).hostname;
    const icon = getIconForDomain(domain);
    
      const newBookmark: Bookmark = {
        id: Date.now().toString(),
        name,
      url: fullUrl,
      icon,
        color: 'bg-blue-100'
      };
      
      setWidgets(widgets.map(w => 
        w.id === widgetId 
          ? { ...w, content: { ...w.content, bookmarks: [...(w.content?.bookmarks || []), newBookmark] }}
          : w
      ));
  };

  // 공유 관련 함수들
  const toggleShare = () => {
    setShareSettings(prev => ({ ...prev, isPublic: !prev.isPublic }));
  };

  const copyShareLink = () => {
    const shareUrl = `https://${shareSettings.customDomain}.urwebs.com`;
    navigator.clipboard.writeText(shareUrl);
    // 토스트 알림 등 추가 가능
  };

  const openSharePage = () => {
    const shareUrl = `https://${shareSettings.customDomain}.urwebs.com`;
    window.open(shareUrl, '_blank');
  };

  const generateCustomDomain = () => {
    // 실제로는 서버에서 고유한 도메인을 생성해야 함
    const randomId = Math.random().toString(36).substring(2, 8);
    setShareSettings(prev => ({ ...prev, customDomain: `user${randomId}` }));
  };

  // 시계 업데이트
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 암호화폐 가격 시뮬레이션
  useEffect(() => {
    const cryptoTimer = setInterval(() => {
      setCryptoPrices(prev => ({
        bitcoin: { 
          price: prev.bitcoin.price + (Math.random() - 0.5) * 100000, 
          change: (Math.random() - 0.5) * 5 
        },
        ethereum: { 
          price: prev.ethereum.price + (Math.random() - 0.5) * 10000, 
          change: (Math.random() - 0.5) * 5 
        },
        solana: { 
          price: prev.solana.price + (Math.random() - 0.5) * 1000, 
          change: (Math.random() - 0.5) * 5 
        }
      }));
    }, 5000);

    return () => clearInterval(cryptoTimer);
  }, []);

  // 새 창에서 위젯 추가 메시지 수신
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'ADD_WIDGET') {
        addWidget(event.data.widgetType);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // 각 컬럼의 마지막 위젯과 컬럼 하단 여백에 마우스 오버 시 위젯 추가 기능
  const getColumnLastWidget = (columnIndex: number) => {
    const columnWidgets = widgets.filter(widget => {
      const col = Math.floor(widget.x / (cellWidth + spacing));
      return col === columnIndex;
    });
    
    if (columnWidgets.length === 0) return null;
    
    return columnWidgets.reduce((last, current) => 
      current.y > last.y ? current : last
    );
  };

  const getColumnBottomY = (columnIndex: number) => {
    const lastWidget = getColumnLastWidget(columnIndex);
    if (!lastWidget) return 0;
    return lastWidget.y + lastWidget.height + spacing;
  };

  const openWidgetShop = () => {
    const widgetShopWindow = window.open(
      '',
      'widgetShop',
      'width=1400,height=900,scrollbars=yes,resizable=yes,menubar=no,toolbar=no,location=no,status=no'
    );
    
    if (widgetShopWindow) {
      widgetShopWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>위젯 상점</title>
          <meta charset="utf-8">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              margin: 0; 
              padding: 20px; 
              background: #f5f5f5;
            }
            .header {
              background: white;
              padding: 20px;
              border-radius: 12px;
              margin-bottom: 20px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            .widget-grid {
              display: grid;
              grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
              gap: 20px;
              padding: 20px;
              background: white;
              border-radius: 12px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            .widget-card {
              border: 2px solid #e5e7eb;
              border-radius: 12px;
              padding: 20px;
              cursor: pointer;
              transition: all 0.3s;
              background: white;
            }
            .widget-card:hover {
              border-color: #10b981;
              box-shadow: 0 4px 12px rgba(0,0,0,0.15);
              transform: translateY(-2px);
            }
            .widget-icon {
              width: 60px;
              height: 60px;
              background: #f3f4f6;
              border-radius: 12px;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 15px;
              font-size: 24px;
            }
            .widget-title {
              font-weight: 600;
              font-size: 16px;
              text-align: center;
              margin-bottom: 8px;
              color: #374151;
            }
            .widget-desc {
              font-size: 14px;
              color: #6b7280;
              text-align: center;
              margin-bottom: 15px;
              line-height: 1.4;
            }
            .add-btn {
              width: 100%;
              padding: 8px 16px;
              background: #10b981;
              color: white;
              border: none;
              border-radius: 8px;
              font-size: 14px;
              cursor: pointer;
              transition: background 0.2s;
            }
            .add-btn:hover {
              background: #059669;
            }
            .close-btn {
              position: absolute;
              top: 20px;
              right: 20px;
              background: #ef4444;
              color: white;
              border: none;
              border-radius: 50%;
              width: 40px;
              height: 40px;
              font-size: 18px;
              cursor: pointer;
            }
          </style>
        </head>
        <body>
          <!-- 왼쪽 카테고리 사이드바 -->
          <div style="width: 280px; background: white; border-right: 1px solid #e2e8f0; height: 100vh; overflow-y: auto; position: fixed; left: 0; top: 0;">
            <div style="padding: 20px; border-bottom: 1px solid #e2e8f0;">
              <h2 style="margin: 0; font-size: 18px; font-weight: 600; color: #1e293b;">🎨 위젯 상점</h2>
              <p style="margin: 8px 0 0; font-size: 14px; color: #64748b;">카테고리를 선택하세요</p>
            </div>
            <div id="categoryList">
              <!-- 카테고리 버튼들이 여기에 동적으로 추가됩니다 -->
            </div>
          </div>

          <!-- 메인 콘텐츠 영역 -->
          <div style="margin-left: 280px; min-height: 100vh; background: #f8fafc;">
            <div style="padding: 20px;">
              <div style="background: white; border-radius: 12px; padding: 24px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <h3 id="categoryTitle" style="margin: 0 0 8px; font-size: 20px; font-weight: 600; color: #1e293b;">카테고리를 선택하세요</h3>
                <p id="categoryDesc" style="margin: 0; color: #64748b;">왼쪽에서 원하는 카테고리를 클릭하세요</p>
              </div>
              
              <div id="widgetGrid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px;">
                <!-- 위젯들이 여기에 동적으로 추가됩니다 -->
                <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: #64748b;">
                  <div style="font-size: 48px; margin-bottom: 16px;">📦</div>
                  <p style="font-size: 18px; font-weight: 500; margin-bottom: 8px;">카테고리를 선택해주세요</p>
                  <p style="font-size: 14px;">왼쪽에서 원하는 카테고리를 클릭하세요</p>
                </div>
              </div>
            </div>
          </div>

          <button style="position: fixed; top: 20px; right: 20px; background: #ef4444; color: white; border: none; border-radius: 50%; width: 40px; height: 40px; font-size: 18px; cursor: pointer; z-index: 1000;" onclick="window.close()">×</button>
          
          <script>
            // 위젯 카테고리 데이터
            const widgetCategories = ${JSON.stringify(widgetCategories)};
            
            let selectedCategory = '';
            
            function getCategoryIcon(categoryKey) {
              const icons = {
                productivity: '📊',
                finance: '💰',
                development: '🔧',
                information: '📰',
                media: '🎵',
                design: '🎨',
                education: '📚',
                social: '👥',
                system: '⚙️'
              };
              return icons[categoryKey] || '📦';
            }
            
            function renderWidgetPreview(widgetType) {
              const previews = {
                todo: \`
                  <div style="background: #f8fafc; border-radius: 6px; padding: 8px; width: 100%; height: 100%;">
                    <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
                      <div style="width: 12px; height: 12px; border: 1px solid #cbd5e1; border-radius: 2px;"></div>
                      <div style="width: 60px; height: 8px; background: #e2e8f0; border-radius: 2px;"></div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
                      <div style="width: 12px; height: 12px; border: 1px solid #cbd5e1; border-radius: 2px;"></div>
                      <div style="width: 45px; height: 8px; background: #e2e8f0; border-radius: 2px;"></div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 6px;">
                      <div style="width: 12px; height: 12px; border: 1px solid #cbd5e1; border-radius: 2px;"></div>
                      <div style="width: 70px; height: 8px; background: #e2e8f0; border-radius: 2px;"></div>
                    </div>
                  </div>
                \`,
                weather: \`
                  <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); border-radius: 6px; padding: 8px; width: 100%; height: 100%; color: white; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                    <div style="font-size: 20px; margin-bottom: 4px;">☀️</div>
                    <div style="font-size: 12px; font-weight: 500;">22°C</div>
                    <div style="font-size: 10px; opacity: 0.8;">맑음</div>
                  </div>
                \`,
                weather_small: \`
                  <div style="background: linear-gradient(135deg, #fbbf24, #f59e0b); border-radius: 6px; padding: 6px; width: 100%; height: 100%; color: white; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                    <div style="font-size: 16px; margin-bottom: 2px;">☀️</div>
                    <div style="font-size: 10px; font-weight: 500;">22°</div>
                    <div style="font-size: 8px; opacity: 0.8;">맑음</div>
                  </div>
                \`,
                weather_medium: \`
                  <div style="background: linear-gradient(135deg, #10b981, #059669); border-radius: 6px; padding: 8px; width: 100%; height: 100%; color: white; display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; align-items: center; gap: 6px;">
                      <div style="font-size: 18px;">☀️</div>
                      <div>
                        <div style="font-size: 12px; font-weight: 500;">22°</div>
                        <div style="font-size: 8px; opacity: 0.8;">맑음</div>
                      </div>
                    </div>
                    <div style="text-align: right; font-size: 8px; opacity: 0.8;">
                      <div>체감 24°</div>
                      <div>습도 60%</div>
                    </div>
                  </div>
                \`,
                bookmark: \`
                  <div style="background: #f8fafc; border-radius: 6px; padding: 8px; width: 100%; height: 100%; display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
                    <div style="background: white; border-radius: 4px; padding: 4px; display: flex; flex-direction: column; align-items: center;">
                      <div style="font-size: 16px; margin-bottom: 2px;">🔍</div>
                      <div style="width: 20px; height: 4px; background: #e2e8f0; border-radius: 1px;"></div>
                    </div>
                    <div style="background: white; border-radius: 4px; padding: 4px; display: flex; flex-direction: column; align-items: center;">
                      <div style="font-size: 16px; margin-bottom: 2px;">📧</div>
                      <div style="width: 20px; height: 4px; background: #e2e8f0; border-radius: 1px;"></div>
                    </div>
                    <div style="background: white; border-radius: 4px; padding: 4px; display: flex; flex-direction: column; align-items: center;">
                      <div style="font-size: 16px; margin-bottom: 2px;">🎵</div>
                      <div style="width: 20px; height: 4px; background: #e2e8f0; border-radius: 1px;"></div>
                    </div>
                    <div style="background: white; border-radius: 4px; padding: 4px; display: flex; flex-direction: column; align-items: center;">
                      <div style="font-size: 16px; margin-bottom: 2px;">📱</div>
                      <div style="width: 20px; height: 4px; background: #e2e8f0; border-radius: 1px;"></div>
                    </div>
                  </div>
                \`,
                crypto: \`
                  <div style="background: #f8fafc; border-radius: 6px; padding: 8px; width: 100%; height: 100%;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                      <div style="width: 20px; height: 20px; background: #f59e0b; border-radius: 50%;"></div>
                      <div style="width: 30px; height: 6px; background: #10b981; border-radius: 2px;"></div>
                    </div>
                    <div style="width: 40px; height: 8px; background: #1e293b; border-radius: 2px; margin-bottom: 4px;"></div>
                    <div style="width: 25px; height: 6px; background: #10b981; border-radius: 2px;"></div>
                  </div>
                \`,
                news: \`
                  <div style="background: #f8fafc; border-radius: 6px; padding: 8px; width: 100%; height: 100%;">
                    <div style="width: 100%; height: 6px; background: #e2e8f0; border-radius: 2px; margin-bottom: 6px;"></div>
                    <div style="width: 80%; height: 6px; background: #e2e8f0; border-radius: 2px; margin-bottom: 6px;"></div>
                    <div style="width: 60%; height: 6px; background: #e2e8f0; border-radius: 2px; margin-bottom: 6px;"></div>
                    <div style="width: 40%; height: 4px; background: #cbd5e1; border-radius: 2px;"></div>
                  </div>
                \`,
                timer: \`
                  <div style="background: #f8fafc; border-radius: 6px; padding: 8px; width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                    <div style="font-size: 20px; font-weight: bold; color: #1e293b; margin-bottom: 4px;">25:00</div>
                    <div style="display: flex; gap: 4px;">
                      <div style="width: 16px; height: 16px; background: #10b981; border-radius: 50%;"></div>
                      <div style="width: 16px; height: 16px; background: #ef4444; border-radius: 50%;"></div>
                      <div style="width: 16px; height: 16px; background: #6b7280; border-radius: 50%;"></div>
                    </div>
                  </div>
                \`,
                google_search: \`
                  <div style="background: #f8fafc; border-radius: 6px; padding: 8px; width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                    <div style="font-size: 20px; margin-bottom: 4px;">🔍</div>
                    <div style="width: 80%; height: 12px; background: #e2e8f0; border-radius: 2px; margin-bottom: 4px;"></div>
                    <div style="width: 60%; height: 8px; background: #3b82f6; border-radius: 2px;"></div>
                  </div>
                \`,
                naver_search: \`
                  <div style="background: #f8fafc; border-radius: 6px; padding: 8px; width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                    <div style="font-size: 20px; margin-bottom: 4px;">🔍</div>
                    <div style="width: 80%; height: 12px; background: #e2e8f0; border-radius: 2px; margin-bottom: 4px;"></div>
                    <div style="width: 60%; height: 8px; background: #10b981; border-radius: 2px;"></div>
                  </div>
                \`,
                law_search: \`
                  <div style="background: #f8fafc; border-radius: 6px; padding: 8px; width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                    <div style="font-size: 20px; margin-bottom: 4px;">⚖️</div>
                    <div style="width: 80%; height: 12px; background: #e2e8f0; border-radius: 2px; margin-bottom: 4px;"></div>
                    <div style="width: 60%; height: 8px; background: #8b5cf6; border-radius: 2px;"></div>
                  </div>
                \`,
                mail_services: \`
                  <div style="background: #f8fafc; border-radius: 6px; padding: 8px; width: 100%; height: 100%; display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
                    <div style="background: white; border-radius: 4px; padding: 4px; display: flex; flex-direction: column; align-items: center;">
                      <div style="font-size: 12px; margin-bottom: 2px;">📧</div>
                      <div style="font-size: 8px; color: #666;">Gmail</div>
                    </div>
                    <div style="background: white; border-radius: 4px; padding: 4px; display: flex; flex-direction: column; align-items: center;">
                      <div style="font-size: 12px; margin-bottom: 2px;">📮</div>
                      <div style="font-size: 8px; color: #666;">Daum</div>
                    </div>
                    <div style="background: white; border-radius: 4px; padding: 4px; display: flex; flex-direction: column; align-items: center;">
                      <div style="font-size: 12px; margin-bottom: 2px;">📬</div>
                      <div style="font-size: 8px; color: #666;">Naver</div>
                    </div>
                    <div style="background: white; border-radius: 4px; padding: 4px; display: flex; flex-direction: column; align-items: center;">
                      <div style="font-size: 12px; margin-bottom: 2px;">📭</div>
                      <div style="font-size: 8px; color: #666;">Outlook</div>
                    </div>
                  </div>
                \`,
                default: \`
                  <div style="background: #f8fafc; border-radius: 6px; padding: 8px; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #64748b;">
                    <div style="text-align: center;">
                      <div style="font-size: 24px; margin-bottom: 4px;">📦</div>
                      <div style="font-size: 10px;">위젯</div>
                    </div>
                  </div>
                \`
              };
              return previews[widgetType] || previews.default;
            }
            
            function renderCategories() {
              const categoryList = document.getElementById('categoryList');
              categoryList.innerHTML = Object.entries(widgetCategories).map(([categoryKey, category]) => \`
                <button 
                  style="width: 100%; padding: 12px 16px; border: none; background: white; text-align: left; cursor: pointer; transition: all 0.2s; border-bottom: 1px solid #f1f5f9;" 
                  onmouseover="this.style.background='#f8fafc'" 
                  onmouseout="this.style.background='white'"
                  data-category="\${categoryKey}"
                  onclick="selectCategory('\${categoryKey}')"
                >
                  <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="font-size: 18px;">\${getCategoryIcon(categoryKey)}</div>
                    <div>
                      <div style="font-weight: 500; font-size: 14px; color: #1e293b;">\${category.name}</div>
                      <div style="font-size: 12px; color: #64748b;">\${category.widgets.length}개 위젯</div>
                    </div>
                  </div>
                </button>
              \`).join('');
            }
            
            function selectCategory(categoryKey) {
              selectedCategory = categoryKey;
              const category = widgetCategories[categoryKey];
              
              // 카테고리 버튼 스타일 업데이트
              document.querySelectorAll('[data-category]').forEach(btn => {
                btn.style.background = 'white';
                btn.style.borderRight = 'none';
                btn.style.color = '#1e293b';
              });
              
              const selectedBtn = document.querySelector(\`[data-category="\${categoryKey}"]\`);
              selectedBtn.style.background = '#dbeafe';
              selectedBtn.style.borderRight = '3px solid #3b82f6';
              selectedBtn.style.color = '#1e40af';
              
              // 제목 업데이트
              document.getElementById('categoryTitle').textContent = category.name;
              document.getElementById('categoryDesc').textContent = '\${category.widgets.length}개의 위젯이 있습니다';
              
              // 위젯 그리드 업데이트
              const grid = document.getElementById('widgetGrid');
              grid.innerHTML = category.widgets.map(widget => \`
                <div style="background: white; border-radius: 12px; padding: 16px; border: 2px solid #e2e8f0; transition: all 0.3s; cursor: pointer;" onmouseover="this.style.borderColor='#3b82f6'; this.style.boxShadow='0 8px 25px rgba(59, 130, 246, 0.15)'; this.style.transform='translateY(-2px)'" onmouseout="this.style.borderColor='#e2e8f0'; this.style.boxShadow='none'; this.style.transform='none'" onclick="addWidget('\${widget.type}')">
                  <div style="width: 100%; height: 120px; background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-bottom: 12px; position: relative; overflow: hidden;">
                    \${renderWidgetPreview(widget.type)}
                  </div>
                  <div style="text-align: center;">
                    <div style="font-weight: 600; font-size: 16px; color: #1e293b; margin-bottom: 4px;">\${widget.name}</div>
                    <div style="font-size: 14px; color: #64748b; margin-bottom: 12px; line-height: 1.4;">\${widget.description}</div>
                    <button style="width: 100%; padding: 8px 16px; background: #3b82f6; color: white; border: none; border-radius: 8px; font-size: 14px; cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='#2563eb'" onmouseout="this.style.background='#3b82f6'">
                      추가하기
                    </button>
                  </div>
                </div>
              \`).join('');
            }
            
            function addWidget(widgetType) {
              window.opener.postMessage({
                type: 'ADD_WIDGET',
                widgetType: widgetType
              }, '*');
              window.close();
            }
            
            // 페이지 로드 시 카테고리 렌더링
            renderCategories();
          </script>
        </body>
        </html>
      `);
      widgetShopWindow.document.close();
    }
  };

  // 마우스 이벤트 리스너 등록
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (draggedWidget) {
        e.preventDefault();
        
        const canvas = canvasRef.current;
        if (!canvas) return;

        const canvasRect = canvas.getBoundingClientRect();
        let newX = e.clientX - canvasRect.left - dragOffset.x;
        let newY = e.clientY - canvasRect.top - dragOffset.y;

        // 그리드 스냅핑 (4컬럼 그리드)
        const targetCol = Math.floor(newX / (cellWidth + spacing));
        newX = targetCol * (cellWidth + spacing);
        newY = Math.round(newY / cellHeight) * cellHeight;

        // 경계 체크
        newX = Math.max(0, Math.min(newX, 3 * (cellWidth + spacing))); // 4컬럼이므로 0~3
        newY = Math.max(0, newY);

        // 드래그 중인 위젯 위치 업데이트
        setWidgets(prevWidgets => 
          prevWidgets.map(w => 
            w.id === draggedWidget ? { ...w, x: newX, y: newY } : w
          )
        );
      }
    };

    const handleGlobalMouseUp = () => {
      handleMouseUp();
    };

    if (draggedWidget) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [draggedWidget, dragOffset, cellWidth, cellHeight, spacing]);

  // 위젯 렌더링
  const renderWidget = (widget: Widget) => {
    const WidgetIcon = allWidgets.find(w => w.type === widget.type)?.icon || Grid;
    const isSelected = selectedWidget === widget.id;
    const isDragging = draggedWidget === widget.id;

    return (
      <div
        className={`relative h-full overflow-hidden bg-white rounded-lg shadow-sm border border-gray-200 ${
          isSelected ? 'ring-2 ring-blue-500 shadow-lg' : ''
        } ${isDragging ? 'opacity-75 z-50' : 'z-10'} ${
          dragOverWidget === widget.id && draggedWidget !== widget.id ? 'ring-2 ring-green-500 bg-green-50' : ''
        }`}
        style={{
          zIndex: isDragging ? 50 : isSelected ? 20 : 10
        }}
        onClick={() => selectWidget(widget.id)}
        onMouseEnter={() => {
          if (isReordering && draggedWidget && draggedWidget !== widget.id) {
            setDragOverWidget(widget.id);
          }
        }}
        onMouseLeave={() => {
          if (isReordering) {
            setDragOverWidget(null);
          }
        }}
        onMouseUp={() => {
          if (isReordering && draggedWidget && dragOverWidget === widget.id) {
            reorderWidgets(draggedWidget, widget.id);
          }
        }}
      >
        {/* 위젯 헤더 */}
        <div 
          className="p-2 border-b border-gray-100 bg-gray-50 flex items-center justify-between cursor-move"
          onMouseDown={(e) => handleMouseDown(e, widget.id)}
        >
          <div className="flex items-center gap-2 flex-1">
            {isEditMode && (
              <div className="text-gray-400 hover:text-gray-600">
                <Move className="w-3 h-3" />
              </div>
            )}
            <WidgetIcon className="w-3 h-3 text-gray-600" />
            <span className="text-xs font-medium text-gray-800">{widget.title}</span>
          </div>
          
          {isEditMode && (
            <div className="flex gap-1">
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-5 w-5 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  editWidget(widget.id);
                }}
              >
                <Settings className="w-3 h-3" />
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-5 w-5 p-0 text-red-500 hover:text-red-700"
                onClick={(e) => {
                  e.stopPropagation();
                  removeWidget(widget.id);
                }}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>

        {/* 위젯 콘텐츠 */}
        <div className="p-3 h-full bg-transparent">
          {renderWidgetContent(widget)}
        </div>

      </div>
    );
  };

  // 위젯 콘텐츠 렌더링
  const renderWidgetContent = (widget: Widget) => {
    switch (widget.type) {
      case 'bookmark':
        return <BookmarkWidget widget={widget} isEditMode={isEditMode} updateWidget={updateWidget} />;

      case 'weather':
        return <WeatherWidget widget={widget} isEditMode={isEditMode} updateWidget={updateWidget} />;

      case 'weather_small':
        return <WeatherSmallWidget widget={widget} isEditMode={isEditMode} updateWidget={updateWidget} />;

      case 'weather_medium':
        return <WeatherMediumWidget widget={widget} isEditMode={isEditMode} updateWidget={updateWidget} />;

      case 'todo':
        return <TodoWidget widget={widget} isEditMode={isEditMode} updateWidget={updateWidget} />;

      case 'stats':
        return (
          <div className="space-y-3">
            {(widget.content?.stats || []).map((stat: any, index: number) => (
              <div key={index} className="text-center">
                <div className="text-lg font-bold text-gray-800">{stat.value}</div>
                <div className="text-xs text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        );

      case 'crypto':
        return (
          <div className="space-y-2">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-800">₿ 0.001234</div>
              <div className="text-xs text-green-600">+2.34%</div>
            </div>
            <div className="text-xs text-gray-600 text-center">비트코인</div>
          </div>
        );

      case 'contact':
        return (
          <div className="space-y-3">
            <div className="text-center">
              <ContactIcon className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <h4 className="font-semibold text-gray-800">문의하기</h4>
              <p className="text-xs text-gray-600">사이트 개설자에게 문의</p>
            </div>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="이름"
                className="w-full p-2 text-xs border rounded"
              />
              <input
                type="email"
                placeholder="이메일"
                className="w-full p-2 text-xs border rounded"
              />
              <textarea
                placeholder="문의 내용"
                className="w-full p-2 text-xs border rounded h-16 resize-none"
              />
              <Button
                size="sm"
                className="w-full text-xs"
                onClick={() => {
                  // 실제로는 서버로 이메일 전송
                  alert('문의가 전송되었습니다!');
                }}
              >
                전송
              </Button>
            </div>
          </div>
        );

      case 'calculator':
        return <CalculatorWidget widget={widget} isEditMode={isEditMode} updateWidget={updateWidget} />;

      case 'news':
        return (
          <div className="space-y-2">
            {(widget.content?.news || [
              { id: '1', title: '최신 기술 뉴스', source: '테크크런치', time: '2시간 전' },
              { id: '2', title: '경제 동향', source: '연합뉴스', time: '4시간 전' },
              { id: '3', title: '날씨 정보', source: '기상청', time: '6시간 전' }
            ]).map((news: any) => (
              <div key={news.id} className="p-2 bg-gray-50 rounded text-xs">
                <div className="font-medium text-gray-800 truncate">{news.title}</div>
                <div className="text-gray-500 text-xs mt-1">{news.source} • {news.time}</div>
              </div>
            ))}
          </div>
        );

      case 'music':
        return <MusicWidget widget={widget} isEditMode={isEditMode} updateWidget={updateWidget} />;

      case 'calendar':
        return (
          <div className="space-y-2">
            <div className="text-center mb-3">
              <div className="text-lg font-bold text-gray-800">
                {new Date().getDate()}
              </div>
              <div className="text-xs text-gray-600">
                {new Date().toLocaleDateString('ko-KR', { month: 'long', year: 'numeric' })}
              </div>
            </div>
            <div className="space-y-1">
              {(widget.content?.events || [
                { id: '1', title: '팀 미팅', time: '10:00', color: 'bg-blue-100' },
                { id: '2', title: '점심 약속', time: '12:30', color: 'bg-green-100' },
                { id: '3', title: '프로젝트 마감', time: '18:00', color: 'bg-red-100' }
              ]).map((event: any) => (
                <div key={event.id} className={`p-1 rounded text-xs ${event.color || 'bg-gray-100'}`}>
                  <div className="font-medium text-gray-800 truncate">{event.title}</div>
                  <div className="text-gray-600">{event.time}</div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'timer':
        return <TimerWidget widget={widget} isEditMode={isEditMode} updateWidget={updateWidget} />;

      case 'email':
        return (
          <div className="p-4">
            <div className="space-y-3">
              {widget.content.emails?.map((email: any) => (
                <div key={email.id} className={`p-2 rounded-lg ${email.unread ? 'bg-blue-50 border-l-4 border-blue-400' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-800">{email.from}</span>
                    <span className="text-xs text-gray-500">{email.time}</span>
                  </div>
                  <div className="text-xs text-gray-700 truncate">{email.subject}</div>
                  {email.unread && <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>}
                </div>
              ))}
            </div>
          </div>
        );

      case 'mail_services':
        const mailServices = [
          { name: 'Gmail', url: 'https://mail.google.com', icon: '📧', color: 'bg-red-50 hover:bg-red-100 border-red-200 text-red-700' },
          { name: 'Daum', url: 'https://mail.daum.net', icon: '📮', color: 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700' },
          { name: 'Naver', url: 'https://mail.naver.com', icon: '📬', color: 'bg-green-50 hover:bg-green-100 border-green-200 text-green-700' },
          { name: 'Outlook', url: 'https://outlook.live.com', icon: '📭', color: 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700' },
          { name: 'Yahoo', url: 'https://mail.yahoo.com', icon: '📨', color: 'bg-yellow-50 hover:bg-yellow-100 border-yellow-200 text-yellow-700' },
          { name: 'Apple Mail', url: 'https://www.icloud.com/mail', icon: '🍎', color: 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700' },
          { name: 'ProtonMail', url: 'https://mail.proton.me', icon: '🔒', color: 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-700' },
          { name: 'Zoho', url: 'https://mail.zoho.com', icon: '📧', color: 'bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-700' }
        ];

        return (
          <div className="h-full flex flex-col">
            <div className="p-3">
              <div className="text-center mb-3">
                <div className="text-2xl mb-1">📧</div>
                <h4 className="font-semibold text-sm text-gray-800">메일 서비스</h4>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {mailServices.map((service, index) => (
                  <Button
                    key={index}
                    size="sm"
                    variant="outline"
                    className={`h-12 text-xs ${service.color} flex flex-col items-center justify-center p-2`}
                    onClick={() => window.open(service.url, '_blank')}
                  >
                    <div className="text-lg mb-1">{service.icon}</div>
                    <div className="text-xs font-medium">{service.name}</div>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'meeting':
        return (
          <div className="p-4">
            <div className="space-y-3">
              {widget.content.meetings?.map((meeting: any) => (
                <div key={meeting.id} className={`p-2 rounded-lg ${meeting.status === 'reserved' ? 'bg-red-50 border-l-4 border-red-400' : 'bg-green-50 border-l-4 border-green-400'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-800">{meeting.room}</span>
                    <span className="text-xs text-gray-500">{meeting.time}</span>
                  </div>
                  <div className="text-xs text-gray-700">{meeting.title}</div>
                  <div className={`text-xs mt-1 ${meeting.status === 'reserved' ? 'text-red-600' : 'text-green-600'}`}>
                    {meeting.status === 'reserved' ? '예약됨' : '사용 가능'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'expense':
        return (
          <div className="p-4">
            <div className="mb-3">
              <div className="text-sm font-medium text-gray-800">오늘 지출</div>
              <div className="text-lg font-bold text-red-600">₩{widget.content.total?.toLocaleString()}</div>
            </div>
            <div className="space-y-2">
              {widget.content.expenses?.map((expense: any) => (
                <div key={expense.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600">{expense.category}</span>
                    <span className="text-gray-500">-</span>
                    <span className="text-gray-700">{expense.memo}</span>
                  </div>
                  <span className="text-red-600 font-medium">₩{expense.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'converter':
        return (
          <div className="p-4">
            <div className="space-y-3">
              {widget.content.conversions?.map((conversion: any) => (
                <div key={conversion.from} className="p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-800">{conversion.from}</span>
                    <span className="text-xs text-gray-500">→</span>
                    <span className="text-xs font-medium text-gray-800">{conversion.to}</span>
                  </div>
                  <div className="text-sm font-bold text-blue-600">{conversion.rate.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'note':
        return (
          <div className="p-4">
            <div className="space-y-2">
              {widget.content.notes?.map((note: any) => (
                <div key={note.id} className={`p-2 rounded-lg ${note.pinned ? 'bg-yellow-50 border-l-4 border-yellow-400' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500">{note.time}</span>
                    {note.pinned && <span className="text-xs text-yellow-600">📌</span>}
                  </div>
                  <div className="text-xs text-gray-700">{note.text}</div>
                </div>
              ))}
            </div>
          </div>
        );


      case 'shopping':
        return (
          <div className="p-4">
            <div className="grid grid-cols-3 gap-3">
              {widget.content.sites?.map((site: any, index: number) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2 text-xl">
                    {site.icon}
                  </div>
                  <div className="text-xs text-gray-700 truncate">{site.name}</div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'travel':
        return (
          <div className="p-4">
            <div className="grid grid-cols-3 gap-3">
              {widget.content.sites?.map((site: any, index: number) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-2 text-xl">
                    {site.icon}
                  </div>
                  <div className="text-xs text-gray-700 truncate">{site.name}</div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'sports':
        return (
          <div className="p-4">
            <div className="space-y-3">
              {widget.content.news?.map((news: any) => (
                <div key={news.id} className="border-b border-gray-200 pb-2 last:border-b-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-blue-600 font-medium">{news.league}</span>
                    <span className="text-xs text-gray-500">{news.time}</span>
                  </div>
                  <div className="text-sm text-gray-800 leading-tight">{news.title}</div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'profile_card':
        return (
          <div className="p-4 h-full flex flex-col">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-2xl text-white">👤</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-800 mb-1">{widget.content.name}</h3>
                <p className="text-sm text-blue-600 mb-1">{widget.content.nickname}</p>
                <p className="text-sm text-gray-600">{widget.content.bio}</p>
              </div>
            </div>
            <div className="flex-1 grid grid-cols-3 gap-3">
              {widget.content.socialLinks?.map((link: any, index: number) => (
                <button
                  key={index}
                  className="flex items-center justify-center gap-2 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-sm"
                  onClick={() => window.open(link.url, '_blank')}
                >
                  <span className="text-base">{link.icon}</span>
                  <span className="font-medium">{link.platform}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 'qr_code':
        return (
          <div className="p-2 text-center h-full flex flex-col">
            <div className="w-20 h-20 bg-white border-2 border-gray-200 rounded-lg mx-auto mb-2 flex items-center justify-center flex-shrink-0">
              <div className="w-16 h-16 bg-gray-800 rounded grid grid-cols-6 gap-0.5 p-1">
                {Array.from({ length: 36 }).map((_, i) => (
                  <div key={i} className={`w-1 h-1 ${Math.random() > 0.5 ? 'bg-white' : 'bg-gray-800'} rounded-sm`}></div>
                ))}
              </div>
            </div>
            <p className="text-xs text-gray-600">QR 코드</p>
          </div>
        );

      case 'portfolio_header':
        return (
          <div className="p-4 text-center bg-gradient-to-r from-blue-50 to-purple-50 h-full flex flex-col justify-center">
            <h2 className="text-lg font-bold text-gray-800 mb-2">{widget.content.name}</h2>
            <p className="text-sm text-blue-600 mb-2">{widget.content.title}</p>
            <p className="text-xs text-gray-600">{widget.content.bio}</p>
          </div>
        );

      case 'project_gallery':
        return (
          <div className="p-3 h-full overflow-y-auto">
            <div className="space-y-3">
              {widget.content.projects?.map((project: any) => (
                <div key={project.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                  <h4 className="font-semibold text-sm text-gray-800 mb-2 truncate">{project.title}</h4>
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">{project.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {project.tools?.slice(0, 3).map((tool: string, index: number) => (
                      <span key={index} className="text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded">
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'contact_buttons':
        return (
          <div className="p-3 h-full flex flex-col justify-center">
            <div className="space-y-2">
              <button className="w-full p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                📧 이메일
              </button>
              <button className="w-full p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
                📱 전화
              </button>
              <button className="w-full p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm">
                💼 LinkedIn
              </button>
            </div>
          </div>
        );

      case 'download_section':
        return (
          <div className="p-4">
            <div className="space-y-3">
              <button className="w-full p-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors">
                📄 이력서 다운로드
              </button>
              <button className="w-full p-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                📁 포트폴리오 다운로드
              </button>
            </div>
          </div>
        );

      case 'business_header':
        return (
          <div className="p-6 text-center bg-gradient-to-r from-orange-50 to-red-50">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{widget.content.name}</h2>
            <p className="text-sm text-gray-600">{widget.content.description}</p>
          </div>
        );

      case 'menu_section':
        return (
          <div className="p-4">
            <div className="space-y-4">
              {widget.content.items?.map((item: any, index: number) => (
                <div key={index} className="border-b border-gray-200 pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-gray-800">{item.name}</h4>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                    <span className="text-lg font-bold text-orange-600">{item.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'business_info':
        return (
          <div className="p-4">
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">영업시간</h4>
                <p className="text-xs text-gray-600 whitespace-pre-line">{widget.content.hours}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">전화번호</h4>
                <p className="text-xs text-gray-600">{widget.content.phone}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">주소</h4>
                <p className="text-xs text-gray-600">{widget.content.address}</p>
              </div>
            </div>
          </div>
        );

      case 'map_section':
        return (
          <div className="p-4">
            <button 
              className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
              onClick={() => window.open(widget.content.mapUrl, '_blank')}
            >
              <div className="text-center">
                <div className="text-2xl mb-2">🗺️</div>
                <p className="text-xs text-gray-600">지도 보기</p>
              </div>
            </button>
          </div>
        );

      case 'event_header':
        return (
          <div className="p-6 text-center bg-gradient-to-r from-pink-50 to-purple-50">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{widget.content.title}</h2>
            <div className="space-y-1 text-sm text-gray-600">
              <p>📅 {widget.content.date}</p>
              <p>⏰ {widget.content.time}</p>
              <p>📍 {widget.content.location}</p>
            </div>
            <p className="text-sm text-gray-600 mt-4">{widget.content.description}</p>
          </div>
        );

      case 'countdown':
        return (
          <div className="p-4 text-center">
            <div className="bg-red-100 rounded-lg p-4">
              <div className="text-2xl font-bold text-red-600 mb-1">D-7</div>
              <p className="text-xs text-red-600">{widget.content.message}</p>
            </div>
          </div>
        );

      case 'rsvp_form':
        return (
          <div className="p-4">
            <div className="space-y-3">
              <input 
                type="text" 
                placeholder="이름" 
                className="w-full p-2 border rounded text-sm"
              />
              <input 
                type="number" 
                placeholder="인원" 
                className="w-full p-2 border rounded text-sm"
              />
              <textarea 
                placeholder="메시지" 
                className="w-full p-2 border rounded text-sm h-16 resize-none"
              />
              <button className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm">
                참석 확인
              </button>
            </div>
          </div>
        );

      case 'event_gallery':
        return (
          <div className="p-4">
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400 text-xs">📷</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'blog_header':
        return (
          <div className="p-6 text-center bg-gradient-to-r from-green-50 to-blue-50">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{widget.content.title}</h2>
            <p className="text-sm text-gray-600">{widget.content.description}</p>
          </div>
        );

      case 'post_list':
        return (
          <div className="p-4">
            <div className="space-y-4">
              {widget.content.posts?.map((post: any) => (
                <div key={post.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h4 className="font-semibold text-gray-800 mb-2">{post.title}</h4>
                  <p className="text-sm text-gray-600 mb-2">{post.excerpt}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">{post.date}</span>
                    <div className="flex gap-1">
                      {post.tags?.map((tag: string, index: number) => (
                        <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'blog_sidebar':
        return (
          <div className="p-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">카테고리</h4>
                <div className="space-y-1">
                  {widget.content.categories?.map((category: string, index: number) => (
                    <div key={index} className="text-xs text-gray-600 hover:text-blue-600 cursor-pointer">
                      {category}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'shop_header':
        return (
          <div className="p-6 text-center bg-gradient-to-r from-yellow-50 to-orange-50">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{widget.content.brandName}</h2>
            <p className="text-sm text-gray-600">{widget.content.description}</p>
          </div>
        );

      case 'product_grid':
        return (
          <div className="p-4">
            <div className="grid grid-cols-2 gap-4">
              {widget.content.products?.map((product: any) => (
                <div key={product.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                  <div className="aspect-square bg-gray-200 rounded mb-2 flex items-center justify-center">
                    <span className="text-gray-400">📦</span>
                  </div>
                  <h4 className="font-semibold text-gray-800 text-sm mb-1">{product.name}</h4>
                  <p className="text-lg font-bold text-orange-600 mb-2">{product.price}</p>
                  <div className="flex gap-1">
                    {product.options?.slice(0, 2).map((option: string, index: number) => (
                      <span key={index} className="text-xs bg-gray-100 text-gray-600 px-1 py-0.5 rounded">
                        {option}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'contact_order':
        return (
          <div className="p-4">
            <div className="space-y-2">
              <button className="w-full p-2 bg-yellow-400 text-black rounded text-xs hover:bg-yellow-500 transition-colors">
                💬 카톡 문의
              </button>
              <button className="w-full p-2 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors">
                📧 이메일
              </button>
              <button className="w-full p-2 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors">
                📞 전화 주문
              </button>
            </div>
          </div>
        );

      case 'reviews':
        return (
          <div className="p-4">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-800 mb-1">⭐ {widget.content.averageRating}</div>
              <p className="text-xs text-gray-600 mb-3">리뷰 {widget.content.reviewCount}개</p>
              <div className="space-y-2">
                {widget.content.recentReviews?.map((review: string, index: number) => (
                  <div key={index} className="text-xs text-gray-600 p-2 bg-gray-50 rounded">
                    "{review}"
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'team_header':
        return (
          <div className="p-6 text-center bg-gradient-to-r from-indigo-50 to-purple-50">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{widget.content.teamName}</h2>
            <p className="text-sm text-gray-600">{widget.content.description}</p>
          </div>
        );

      case 'member_grid':
        return (
          <div className="p-4">
            <div className="space-y-4">
              {widget.content.members?.map((member: any, index: number) => (
                <div key={index} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">👤</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 text-sm">{member.name}</h4>
                    <p className="text-xs text-blue-600">{member.role}</p>
                    <p className="text-xs text-gray-600">{member.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'activity_calendar':
        return (
          <div className="p-4">
            <div className="space-y-2">
              {widget.content.events?.map((event: any, index: number) => (
                <div key={index} className="p-2 bg-blue-50 rounded text-xs">
                  <div className="font-semibold text-blue-800">{event.date}</div>
                  <div className="text-blue-600">{event.title}</div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'join_form':
        return (
          <div className="p-4">
            <div className="space-y-2">
              <input 
                type="text" 
                placeholder="이름" 
                className="w-full p-2 border rounded text-xs"
              />
              <input 
                type="text" 
                placeholder="연락처" 
                className="w-full p-2 border rounded text-xs"
              />
              <input 
                type="text" 
                placeholder="관심분야" 
                className="w-full p-2 border rounded text-xs"
              />
              <button className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-xs">
                가입 신청
              </button>
            </div>
          </div>
        );

      case 'exchange':
        const [exchangeRates, setExchangeRates] = useState({
          'USD/KRW': 1320.50,
          'EUR/KRW': 1450.30,
          'JPY/KRW': 8.95,
          'GBP/KRW': 1650.20,
          'CNY/KRW': 185.40
        });

        // 환율 데이터 시뮬레이션 (5분마다 업데이트)
        useEffect(() => {
          const interval = setInterval(() => {
            setExchangeRates(prev => ({
              'USD/KRW': prev['USD/KRW'] + (Math.random() - 0.5) * 10,
              'EUR/KRW': prev['EUR/KRW'] + (Math.random() - 0.5) * 15,
              'JPY/KRW': prev['JPY/KRW'] + (Math.random() - 0.5) * 0.5,
              'GBP/KRW': prev['GBP/KRW'] + (Math.random() - 0.5) * 20,
              'CNY/KRW': prev['CNY/KRW'] + (Math.random() - 0.5) * 5
            }));
          }, 300000); // 5분

          return () => clearInterval(interval);
        }, []);

        return (
          <div className="space-y-3">
            <div className="text-center">
              <div className="text-2xl mb-2">💱</div>
              <h4 className="font-semibold text-sm text-gray-800">실시간 환율</h4>
              <p className="text-xs text-gray-500">5분마다 업데이트</p>
            </div>
            <div className="space-y-2">
              {Object.entries(exchangeRates).map(([pair, rate]) => (
                <div key={pair} className="bg-gray-50 p-2 rounded text-xs hover:bg-gray-100 transition-colors">
                  <div className="flex justify-between items-center">
                    <div className="font-medium">{pair}</div>
                    <div className="text-gray-600 font-mono">{(rate as number).toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>
            {isEditMode && (
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full h-8 text-xs"
                onClick={() => {
                  const currency = prompt('추가할 통화를 입력하세요 (예: AUD, CAD):');
                  if (currency) {
                    const baseRate = Math.random() * 1000 + 500;
                    setExchangeRates(prev => ({
                      ...prev,
                      [`${currency}/KRW`]: baseRate
                    }));
                  }
                }}
              >
                <Plus className="w-3 h-3 mr-1" />
                통화 추가
              </Button>
            )}
          </div>
        );

      case 'google_search':
        return (
          <div className="space-y-3">
            <div className="text-center">
              <div className="text-2xl mb-2">🔍</div>
              <h4 className="font-semibold text-sm text-gray-800">구글 검색</h4>
            </div>
            <div className="space-y-2">
              <div className="flex gap-1">
                <input 
                  type="text" 
                  placeholder="구글에서 검색" 
                  className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const query = e.currentTarget.value;
                      if (query) {
                        window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
                      }
                    }
                  }}
                />
              </div>
              <Button 
                size="sm" 
                className="w-full h-8 text-xs bg-blue-500 hover:bg-blue-600"
                onClick={() => window.open('https://www.google.com', '_blank')}
              >
                Google 바로가기
              </Button>
            </div>
          </div>
        );

      case 'naver_search':
        return (
          <div className="space-y-3">
            <div className="text-center">
              <div className="text-2xl mb-2">🔍</div>
              <h4 className="font-semibold text-sm text-gray-800">네이버 검색</h4>
            </div>
            <div className="space-y-2">
              <div className="flex gap-1">
                <input 
                  type="text" 
                  placeholder="네이버에서 검색" 
                  className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const query = e.currentTarget.value;
                      if (query) {
                        window.open(`https://search.naver.com/search.naver?query=${encodeURIComponent(query)}`, '_blank');
                      }
                    }
                  }}
                />
              </div>
              <Button 
                size="sm" 
                className="w-full h-8 text-xs bg-green-500 hover:bg-green-600"
                onClick={() => window.open('https://www.naver.com', '_blank')}
              >
                Naver 바로가기
              </Button>
            </div>
          </div>
        );

      case 'law_search':
        return (
          <div className="space-y-3">
            <div className="text-center">
              <div className="text-2xl mb-2">⚖️</div>
              <h4 className="font-semibold text-sm text-gray-800">법제처 검색</h4>
            </div>
            <div className="space-y-2">
              <div className="flex gap-1">
                <input 
                  type="text" 
                  placeholder="법령명 검색" 
                  className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const query = e.currentTarget.value;
                      if (query) {
                        window.open(`https://www.law.go.kr/LSW/lsInfoP.do?efYd=20240101&lsiSeq=000000&chrClsCd=010202&urlMode=lsInfoP&viewCls=lsInfoP&ancYnChk=0#0000`, '_blank');
                      }
                    }
                  }}
                />
              </div>
              <Button 
                size="sm" 
                className="w-full h-8 text-xs bg-purple-500 hover:bg-purple-600"
                onClick={() => window.open('https://www.law.go.kr', '_blank')}
              >
                법제처 바로가기
              </Button>
            </div>
          </div>
        );


      case 'github_repo':
        return (
          <div className="space-y-3">
            <div className="text-center">
              <div className="text-2xl mb-2">📂</div>
              <h4 className="font-semibold text-sm text-gray-800">GitHub Repo</h4>
            </div>
            <div className="space-y-2">
              <div className="bg-gray-50 p-2 rounded text-xs">
                <div className="font-medium">react-dashboard</div>
                <div className="text-gray-600">⭐ 1,234 | 🍴 567</div>
              </div>
              <div className="bg-gray-50 p-2 rounded text-xs">
                <div className="font-medium">my-portfolio</div>
                <div className="text-gray-600">⭐ 89 | 🍴 23</div>
              </div>
            </div>
            {isEditMode && (
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full h-8 text-xs"
                onClick={() => {
                  const repo = prompt('GitHub 저장소 URL을 입력하세요:');
                  if (repo) {
                    updateWidget(widget.id, { 
                      content: { ...widget.content, repositories: [...(widget.content?.repositories || []), repo] }
                    });
                  }
                }}
              >
                <Plus className="w-3 h-3 mr-1" />
                저장소 추가
              </Button>
            )}
          </div>
        );

      case 'colorpicker':
        return (
          <div className="space-y-3">
            <div className="text-center">
              <div className="text-2xl mb-2">🎨</div>
              <h4 className="font-semibold text-sm text-gray-800">컬러 팔레트</h4>
            </div>
            <div className="grid grid-cols-4 gap-1">
              {['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'].map((color, index) => (
                <div 
                  key={index}
                  className="w-8 h-8 rounded cursor-pointer hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    navigator.clipboard.writeText(color);
                    alert(`색상 ${color}이 클립보드에 복사되었습니다!`);
                  }}
                />
              ))}
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full h-8 text-xs"
              onClick={() => {
                const colors = Array.from({ length: 8 }, () => '#' + Math.floor(Math.random()*16777215).toString(16));
                updateWidget(widget.id, { 
                  content: { ...widget.content, colors }
                });
              }}
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              새 팔레트 생성
            </Button>
          </div>
        );

      case 'stock_alert':
        return (
          <div className="space-y-3">
            <div className="text-center">
              <div className="text-2xl mb-2">📢</div>
              <h4 className="font-semibold text-sm text-gray-800">주식 알림</h4>
            </div>
            <div className="space-y-2">
              <div className="bg-gray-50 p-2 rounded text-xs">
                <div className="font-medium">삼성전자</div>
                <div className="text-gray-600">70,000원 도달</div>
              </div>
              <div className="bg-gray-50 p-2 rounded text-xs">
                <div className="font-medium">SK하이닉스</div>
                <div className="text-gray-600">120,000원 도달</div>
              </div>
            </div>
            {isEditMode && (
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full h-8 text-xs"
                onClick={() => {
                  const stock = prompt('주식 종목을 입력하세요 (예: 삼성전자, SK하이닉스):');
                  const price = prompt('목표 가격을 입력하세요:');
                  if (stock && price) {
                    updateWidget(widget.id, { 
                      content: { 
                        ...widget.content, 
                        alerts: [...(widget.content?.alerts || []), { stock, price, reached: false }]
                      }
                    });
                  }
                }}
              >
                <Plus className="w-3 h-3 mr-1" />
                알림 추가
              </Button>
            )}
          </div>
        );

      case 'economic_calendar':
        return (
          <div className="space-y-3">
            <div className="text-center">
              <div className="text-2xl mb-2">📅</div>
              <h4 className="font-semibold text-sm text-gray-800">경제 캘린더</h4>
            </div>
            <div className="space-y-2">
              <div className="bg-gray-50 p-2 rounded text-xs">
                <div className="font-medium">FOMC 회의</div>
                <div className="text-gray-600">12월 15일</div>
              </div>
              <div className="bg-gray-50 p-2 rounded text-xs">
                <div className="font-medium">CPI 발표</div>
                <div className="text-gray-600">12월 10일</div>
              </div>
              <div className="bg-gray-50 p-2 rounded text-xs">
                <div className="font-medium">고용 지표</div>
                <div className="text-gray-600">12월 8일</div>
              </div>
            </div>
          </div>
        );

      case 'english_words':
        return (
          <div className="space-y-3">
            <div className="text-center">
              <div className="text-2xl mb-2">📚</div>
              <h4 className="font-semibold text-sm text-gray-800">영어 단어</h4>
            </div>
            <div className="bg-gray-50 p-3 rounded text-center">
              <div className="font-bold text-lg mb-1">Serendipity</div>
              <div className="text-sm text-gray-600 mb-2">[serənˈdipəti]</div>
              <div className="text-xs text-gray-700">우연히 좋은 일을 발견하는 것</div>
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full h-8 text-xs"
              onClick={() => {
                const words = [
                  { word: 'Serendipity', pronunciation: '[serənˈdipəti]', meaning: '우연히 좋은 일을 발견하는 것' },
                  { word: 'Ephemeral', pronunciation: '[ɪˈfemərəl]', meaning: '순간적인, 덧없는' },
                  { word: 'Resilience', pronunciation: '[rɪˈzɪljəns]', meaning: '회복력, 탄력성' },
                  { word: 'Ubiquitous', pronunciation: '[juˈbɪkwɪtəs]', meaning: '어디에나 있는, 만연한' }
                ];
                const randomWord = words[Math.floor(Math.random() * words.length)];
                updateWidget(widget.id, { 
                  content: { ...widget.content, currentWord: randomWord }
                });
              }}
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              새 단어
            </Button>
          </div>
        );

      case 'quote':
        return <QuoteWidget widget={widget} isEditMode={isEditMode} updateWidget={updateWidget} />;
        return (
          <div className="space-y-3">
            <div className="text-center">
              <div className="text-2xl mb-2">💭</div>
              <h4 className="font-semibold text-sm text-gray-800">명언</h4>
            </div>
            <div className="bg-gray-50 p-3 rounded text-center">
              <div className="text-sm text-gray-700 italic mb-2">
                "성공은 준비된 자에게 찾아오는 기회다."
              </div>
              <div className="text-xs text-gray-500">- 알베르트 아인슈타인</div>
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full h-8 text-xs"
              onClick={() => {
                const quotes = [
                  { text: "성공은 준비된 자에게 찾아오는 기회다.", author: "알베르트 아인슈타인" },
                  { text: "꿈을 계속 간직하고 있으면 반드시 실현할 때가 온다.", author: "괴테" },
                  { text: "성공한 사람이 되려고 노력하기보다 가치있는 사람이 되려고 노력하라.", author: "알베르트 아인슈타인" },
                  { text: "오늘 할 수 있는 일에 전력을 다하라.", author: "토마스 에디슨" }
                ];
                const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
                updateWidget(widget.id, { 
                  content: { ...widget.content, currentQuote: randomQuote }
                });
              }}
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              새 명언
            </Button>
          </div>
        );


      default:
        return (
          <div className="text-center text-gray-500">
            <div className="text-lg mb-2">{widget.title}</div>
            <div className="text-xs">위젯 내용</div>
          </div>
        );
    }
  };

  // 배경 스타일 생성
  const getBackgroundStyle = () => {
    if (backgroundSettings.type === 'gradient') {
      return {
        background: `linear-gradient(${backgroundSettings.gradient.direction}, ${backgroundSettings.gradient.from}, ${backgroundSettings.gradient.to})`,
        opacity: backgroundSettings.opacity
      };
    } else if (backgroundSettings.type === 'solid') {
      return {
        backgroundColor: backgroundSettings.color,
        opacity: backgroundSettings.opacity
      };
    }
    return {};
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
      {/* 상단 툴바 */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
        <div className="w-full px-2 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* URWEBS 버튼 */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = '/'}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-semibold"
              >
                URWEBS
              </Button>
              
              <div className="flex items-center gap-2">
                {isEditingTitle ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={tempTitle}
                      onChange={(e) => setTempTitle(e.target.value)}
                      className="text-xl font-bold text-gray-800 bg-transparent border-b-2 border-blue-500 px-1 py-1 focus:outline-none min-w-[300px]"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          setPageTitle(tempTitle);
                          setIsEditingTitle(false);
                        } else if (e.key === 'Escape') {
                          setTempTitle(pageTitle);
                          setIsEditingTitle(false);
                        }
                      }}
                      onBlur={() => {
                        setPageTitle(tempTitle);
                        setIsEditingTitle(false);
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h1 
                      className="text-xl font-bold text-gray-800 cursor-pointer hover:text-blue-600 transition-colors"
                      onClick={() => {
                        setIsEditingTitle(true);
                        setTempTitle(pageTitle);
                      }}
                      title="클릭하여 제목 변경"
                    >
                      {pageTitle}
                    </h1>
                    <Edit className="w-4 h-4 text-gray-400 cursor-pointer hover:text-blue-600 transition-colors" 
                          onClick={() => {
                            setIsEditingTitle(true);
                            setTempTitle(pageTitle);
                          }}
                          title="제목 변경" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* 페이지 관리 버튼 */}
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPageManager(!showPageManager)}
                className="text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                title="페이지 관리"
              >
                <FileText className="w-4 h-4 mr-1" />
                페이지 ({pages.length})
            </Button>
            
              {/* 빠른 액션 버튼들 */}
              <div className="flex items-center gap-1">
            <Button 
                  variant="ghost"
                  size="sm"
              onClick={toggleShare}
                  className="h-8 w-8 p-0 hover:bg-gray-100"
                  title={shareSettings.isPublic ? '비공개로 변경' : '공개로 변경'}
            >
              {shareSettings.isPublic ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            </Button>

                <Button 
                  variant="ghost"
                  size="sm"
              onClick={toggleTheme}
                  className="h-8 w-8 p-0 hover:bg-gray-100"
                  title={theme === 'light' ? '다크모드' : '라이트모드'}
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <SunIcon className="w-4 h-4" />}
            </Button>

            <Button
                  variant="ghost"
                  size="sm"
              onClick={resetToDefault}
                  className="h-8 w-8 p-0 hover:bg-gray-100 text-red-500 hover:text-red-700"
                  title="초기화"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 페이지 관리 패널 */}
      {showPageManager && (
        <div className="absolute top-16 left-4 z-50 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-gray-200/50 p-4 min-w-[300px]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800">페이지 관리</h3>
              <Button
                size="sm"
              onClick={createNewPage}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              >
              <Plus className="w-4 h-4 mr-1" />
              새 페이지
              </Button>
          </div>
          
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {pages.map((page) => (
              <div
                key={page.id}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  page.id === currentPageId
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => switchPage(page.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-800 truncate">
                      {page.title}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(page.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      위젯 {page.widgets.length}개
                    </div>
                  </div>
                  {pages.length > 1 && (
              <Button
                size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('이 페이지를 삭제하시겠습니까?')) {
                          deletePage(page.id);
                        }
                      }}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
              </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 템플릿 선택 모달 */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/50 p-8 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">템플릿 선택</h2>
              <p className="text-gray-600">새 페이지에 사용할 템플릿을 선택하세요</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(templates).map(([key, template]) => (
                <div
                  key={key}
                  className="border-2 border-gray-200 rounded-xl p-6 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer group"
                  onClick={() => createPageWithTemplate(key)}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-4">{template.icon}</div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{template.name}</h3>
                    <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                    <div className="text-xs text-gray-500">
                      위젯 {template.widgets.length}개
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-center mt-8">
              <Button
                variant="outline"
                onClick={() => setShowTemplateModal(false)}
                className="px-8"
              >
                취소
              </Button>
            </div>
            </div>
          </div>
        )}

      <div className="w-full px-2 py-4">



        {/* 위젯 캔버스 */}
        <div 
          ref={canvasRef}
          className={`relative min-h-[600px] rounded-xl shadow-lg border-2 transition-all duration-200 ${
            isEditMode 
              ? 'bg-blue-50/30 backdrop-blur-sm border-dashed border-blue-300' 
              : 'bg-white/30 backdrop-blur-sm border-dashed border-gray-200'
          }`}
          style={{ 
            position: 'relative',
            backgroundImage: layoutSettings.showGrid && isEditMode ? `
              linear-gradient(rgba(59, 130, 246, 0.15) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.15) 1px, transparent 1px)
            ` : 'none',
            backgroundSize: `${layoutSettings.gridSize}px ${layoutSettings.gridSize}px`
          }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          {/* 빈 상태 안내 */}
          {widgets.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-gray-500 max-w-md">
                <div className="text-2xl mb-4">🎨</div>
                <div className="text-xl font-semibold mb-3">시작페이지가 비어있습니다</div>
                <div className="text-sm mb-4">각 컬럼의 마지막 위젯이나 컬럼 하단에 마우스를 올려 위젯을 추가해보세요</div>
              </div>
            </div>
          )}

          {widgets.map((widget) => (
            <div
              key={widget.id}
              className={`absolute bg-white rounded-lg shadow-md transition-all duration-200 ${
                isEditMode ? 'cursor-move' : ''
              }`}
              style={{
                left: widget.x,
                top: widget.y,
                width: widget.width,
                height: widget.height,
                zIndex: widget.zIndex || 1,
                transform: draggedWidget === widget.id ? 'rotate(2deg)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (isEditMode) {
                  const col = Math.floor(widget.x / (cellWidth + spacing));
                  const lastWidget = getColumnLastWidget(col);
                  if (lastWidget && lastWidget.id === widget.id) {
                    // 마지막 위젯에 마우스 오버 시 위젯 추가 영역 표시
                    const rect = e.currentTarget.getBoundingClientRect();
                    const addArea = document.createElement('div');
                    addArea.className = 'absolute bg-blue-500/10 border-2 border-blue-500 border-dashed rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200';
                    addArea.style.left = `${rect.left}px`;
                    addArea.style.top = `${rect.bottom + 5}px`;
                    addArea.style.width = `${widget.width}px`;
                    addArea.style.height = '60px';
                    addArea.style.zIndex = '1000';
                    addArea.innerHTML = '<div class="text-blue-600 font-medium text-sm">+ 위젯 추가</div>';
                    addArea.onclick = openWidgetShop;
                    document.body.appendChild(addArea);
                    
                    // 마우스가 벗어나면 제거
                    const removeAddArea = () => {
                      if (addArea.parentNode) {
                        addArea.parentNode.removeChild(addArea);
                      }
                    };
                    addArea.addEventListener('mouseleave', removeAddArea);
                    e.currentTarget.addEventListener('mouseleave', removeAddArea);
                  }
                }
              }}
            >
              {renderWidget(widget)}
            </div>
          ))}

          {/* 컬럼 하단 여백에 마우스 오버 시 위젯 추가 영역 */}
          {isEditMode && Array.from({ length: 4 }).map((_, colIndex) => {
            const bottomY = getColumnBottomY(colIndex);
            if (bottomY === 0) return null; // 컬럼에 위젯이 없으면 표시하지 않음
            
            return (
              <div
                key={`column-${colIndex}`}
                className="absolute bg-transparent hover:bg-blue-500/10 border-2 border-transparent hover:border-blue-500 hover:border-dashed rounded-lg transition-all duration-200 cursor-pointer"
                style={{
                  left: colIndex * (cellWidth + spacing),
                  top: bottomY,
                  width: cellWidth,
                  height: '60px',
                  zIndex: 10
                }}
                onMouseEnter={(e) => {
                  const target = e.currentTarget;
                  target.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
                  target.style.borderColor = '#3b82f6';
                  target.style.borderStyle = 'dashed';
                  target.style.transition = 'all 0.2s ease';
                  
                  // 텍스트 추가
                  const text = document.createElement('div');
                  text.className = 'absolute inset-0 flex items-center justify-center text-blue-600 font-medium text-sm pointer-events-none transition-all duration-200';
                  text.textContent = '+ 위젯 추가';
                  target.appendChild(text);
                }}
                onMouseLeave={(e) => {
                  const target = e.currentTarget;
                  target.style.backgroundColor = 'transparent';
                  target.style.borderColor = 'transparent';
                  target.style.borderStyle = 'solid';
                  
                  // 텍스트 제거
                  const text = target.querySelector('div');
                  if (text) {
                    target.removeChild(text);
                  }
                }}
                onClick={openWidgetShop}
              />
            );
          })}

        </div>



        {/* 위젯 상점 - 새 창으로 열기 */}
        {showWidgetModal && (
          <script>
            {(() => {
              const widgetShopWindow = window.open('', 'widgetShop', 'width=1200,height=800,scrollbars=yes,resizable=yes');
              if (widgetShopWindow) {
                widgetShopWindow.document.write(`
                  <!DOCTYPE html>
                  <html lang="ko">
                  <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>위젯 상점</title>
                    <script src="https://cdn.tailwindcss.com"><\/script>
                    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"><\/script>
                  </head>
                  <body class="bg-gray-100">
                    <div class="min-h-screen flex">
                      <!-- 왼쪽 카테고리 사이드바 -->
                      <div class="w-64 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto">
                        <div class="mb-6">
                          <h3 class="text-xl font-bold text-gray-900 flex items-center">
                            <span class="text-green-600 mr-2">+</span>
                            위젯 추가
                </h3>
                          <p class="text-sm text-gray-600 mt-2">카테고리를 선택하세요</p>
              </div>

                        <div class="space-y-2" id="category-list">
                          <!-- 카테고리 버튼들이 여기에 동적으로 생성됩니다 -->
                      </div>
              </div>

                      <!-- 오른쪽 위젯 목록 -->
                      <div class="flex-1 flex flex-col">
                        <div class="bg-white shadow-sm border-b p-6">
                          <div class="flex items-center justify-between">
                            <div>
                              <h1 class="text-2xl font-bold text-gray-900" id="category-title">카테고리를 선택하세요</h1>
                              <p class="text-sm text-gray-600 mt-1">원하는 위젯을 미리보고 선택하여 추가하세요</p>
            </div>
                            <button onclick="window.close()" class="text-gray-500 hover:text-gray-700 text-xl">×</button>
          </div>
                        </div>
                        
                        <div class="flex-1 overflow-y-auto p-6">
                          <div id="widget-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div class="col-span-full flex items-center justify-center h-64">
                              <div class="text-center text-gray-500">
                                <div class="text-4xl mb-4">📦</div>
                                <p class="text-lg font-medium">카테고리를 선택해주세요</p>
                                <p class="text-sm">왼쪽에서 원하는 카테고리를 클릭하세요</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
              </div>

                    <script>
                      // 위젯 카테고리 데이터
                      const widgetCategories = {
                        productivity: {
                          name: '생산성',
                          widgets: [
                            { type: 'todo', name: '할 일', icon: '✓', description: '할 일 목록 관리' },
                            { type: 'goal', name: '목표', icon: '🎯', description: '목표 설정 및 추적' },
                            { type: 'habit', name: '습관', icon: '🔄', description: '습관 트래킹' },
                            { type: 'timer', name: '타이머', icon: '⏰', description: '포모도로 타이머' },
                            { type: 'reminder', name: '알림', icon: '🔔', description: '중요한 알림' },
                            { type: 'quicknote', name: '빠른 메모', icon: '📝', description: '즉석 메모 작성' }
                          ]
                        },
                        finance: {
                          name: '금융',
                          widgets: [
                            { type: 'stock', name: '주식', icon: '📈', description: '주식 시세 확인' },
                            { type: 'crypto', name: '암호화폐', icon: '💰', description: '코인 가격 정보' },
                            { type: 'expense', name: '가계부', icon: '📊', description: '지출 관리' },
                            { type: 'calculator', name: '계산기', icon: '🧮', description: '간편 계산기' },
                            { type: 'exchange', name: '환율', icon: '💱', description: '실시간 환율 정보' },
                            { type: 'stock_alert', name: '주식 알림', icon: '📢', description: '주식 시세 알림' },
                            { type: 'economic_calendar', name: '경제 캘린더', icon: '📅', description: 'FOMC, CPI 발표 일정' }
                          ]
                        },
                        communication: {
                          name: '소통',
                          widgets: [
                            { type: 'email', name: '이메일', icon: '📧', description: '메일 확인' },
                            { type: 'mail_services', name: '메일 서비스', icon: '📮', description: '메일 서비스 바로가기' },
                            { type: 'social', name: '소셜미디어', icon: '👥', description: 'SNS 관리' },
                            { type: 'github', name: 'GitHub', icon: '🐙', description: '코드 저장소' },
                            { type: 'phone', name: '연락처', icon: '📞', description: '빠른 연락처' },
                            { type: 'github_repo', name: 'GitHub Repo', icon: '📂', description: 'GitHub 저장소 상태' }
                          ]
                        },
                        media: {
                          name: '미디어',
                          widgets: [
                            { type: 'music', name: '음악', icon: '🎵', description: '음악 플레이어' },
                            { type: 'video', name: '동영상', icon: '🎬', description: '비디오 콘텐츠' },
                            { type: 'photo', name: '사진', icon: '📸', description: '이미지 갤러리' },
                            { type: 'quote', name: '명언', icon: '💭', description: '영감을 주는 명언' }
                          ]
                        },
                        information: {
                          name: '정보',
                          widgets: [
                            { type: 'weather', name: '날씨', icon: '☁️', description: '날씨 정보' },
                            { type: 'weather_small', name: '날씨 (소형)', icon: '🌤️', description: '간단한 날씨 정보' },
                            { type: 'weather_medium', name: '날씨 (중형)', icon: '⛅', description: '중간 크기 날씨 정보' },
                            { type: 'news', name: '뉴스', icon: '🌐', description: '최신 뉴스' },
                            { type: 'rss', name: 'RSS', icon: '📡', description: 'RSS 피드' },
                            { type: 'google_search', name: '구글 검색', icon: '🔍', description: '구글 검색' },
                            { type: 'naver_search', name: '네이버 검색', icon: '🔍', description: '네이버 검색' },
                            { type: 'law_search', name: '법제처 검색', icon: '⚖️', description: '법령 검색' },
                          ]
                        },
                        system: {
                          name: '시스템',
                          widgets: [
                            { type: 'calendar', name: '캘린더', icon: '📅', description: '일정 관리' },
                            { type: 'location', name: '위치', icon: '📍', description: '현재 위치' },
                            { type: 'battery', name: '배터리', icon: '🔋', description: '배터리 상태' },
                            { type: 'network', name: '네트워크', icon: '📶', description: '인터넷 상태' },
                            { type: 'volume', name: '볼륨', icon: '🔊', description: '소리 조절' }
                          ]
                        },
                        tools: {
                          name: '도구',
                          widgets: [
                            { type: 'bookmark', name: '즐겨찾기', icon: '🔗', description: '자주 사용하는 링크' },
                            { type: 'stats', name: '통계', icon: '📊', description: '데이터 시각화' },
                            { type: 'converter', name: '단위 변환', icon: '🧮', description: '단위 변환기' },
                            { type: 'colorpicker', name: '컬러 팔레트', icon: '🎨', description: '색상 생성기' },
                            { type: 'qr', name: 'QR 코드', icon: '📱', description: 'QR 코드 생성' },
                            { type: 'password', name: '비밀번호', icon: '🔒', description: '비밀번호 생성' },
                            { type: 'contact', name: '문의하기', icon: '📞', description: '사이트 개설자에게 문의' }
                          ]
                        },
                        education: {
                          name: '교육',
                          widgets: [
                            { type: 'english_words', name: '영어 단어', icon: '📚', description: '영어 단어 학습' },
                            { type: 'quote', name: '명언', icon: '💭', description: '영감을 주는 명언' }
                          ]
                        }
                      };
                      
                      let selectedCategory = '';
                      
                      function getCategoryIcon(categoryKey) {
                        const icons = {
                          productivity: '📊',
                          finance: '💰',
                          development: '🔧',
                          information: '📰',
                          media: '🎵',
                          design: '🎨',
                          education: '📚',
                          social: '👥',
                          system: '⚙️'
                        };
                        return icons[categoryKey] || '📦';
                      }
                      
                      function renderCategories() {
                        const categoryList = document.getElementById('category-list');
                        categoryList.innerHTML = Object.entries(widgetCategories).map(([categoryKey, category]) => \`
                          <button
                            class="w-full text-left p-3 rounded-lg transition-colors bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 category-btn"
                            data-category="\${categoryKey}"
                            onclick="selectCategory('\${categoryKey}')"
                          >
                            <div class="flex items-center gap-3">
                              <div class="text-lg">\${getCategoryIcon(categoryKey)}</div>
                              <div>
                                <div class="font-medium text-sm">\${category.name}</div>
                                <div class="text-xs text-gray-500">\${category.widgets.length}개 위젯</div>
                            </div>
                    </div>
                          </button>
                        \`).join('');
                      }
                      
                      function selectCategory(categoryKey) {
                        selectedCategory = categoryKey;
                        const category = widgetCategories[categoryKey];
                        
                        // 카테고리 버튼 스타일 업데이트
                        document.querySelectorAll('.category-btn').forEach(btn => {
                          btn.classList.remove('bg-green-100', 'text-green-800', 'border-green-200');
                          btn.classList.add('bg-white', 'text-gray-700', 'border-gray-200');
                        });
                        
                        const selectedBtn = document.querySelector(\`[data-category="\${categoryKey}"]\`);
                        selectedBtn.classList.remove('bg-white', 'text-gray-700', 'border-gray-200');
                        selectedBtn.classList.add('bg-green-100', 'text-green-800', 'border-green-200');
                        
                        // 제목 업데이트
                        document.getElementById('category-title').textContent = category.name;
                        
                        // 위젯 그리드 업데이트
                        const grid = document.getElementById('widget-grid');
                        grid.innerHTML = category.widgets.map(widget => \`
                          <div class="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer" onclick="addWidget('\${widget.type}')">
                            <div class="text-center">
                              <div class="w-16 h-16 bg-gray-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
                                <span class="text-2xl">\${widget.icon}</span>
                  </div>
                              <h3 class="font-semibold text-gray-800 mb-1">\${widget.name}</h3>
                              <p class="text-sm text-gray-500 mb-3">\${widget.description}</p>
                              <button class="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors">
                                추가하기
                              </button>
              </div>
            </div>
                        \`).join('');
                      }
                      
                      function addWidget(widgetType) {
                        window.opener.postMessage({
                          type: 'ADD_WIDGET',
                          widgetType: widgetType
                        }, '*');
                        window.close();
                      }
                      
                      // 페이지 로드 시 카테고리 렌더링
                      document.addEventListener('DOMContentLoaded', renderCategories);
                    <\/script>
                  </body>
                  </html>
                `);
                widgetShopWindow.document.close();
                setShowWidgetModal(false);
              }
            })()}
          </script>
        )}

        {/* 배경 설정 모달 */}
        {showBackgroundModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <Palette className="w-5 h-5 mr-2" />
                  배경 설정
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBackgroundModal(false)}
                  className="h-8 w-8 p-0"
                >
                  ×
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">배경 타입</label>
                  <select 
                    value={backgroundSettings.type}
                    onChange={(e) => setBackgroundSettings({...backgroundSettings, type: e.target.value as any})}
                    className="w-full p-2 border rounded"
                  >
                    <option value="solid">단색</option>
                    <option value="gradient">그라데이션</option>
                  </select>
                </div>
                
                {backgroundSettings.type === 'solid' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">색상</label>
                    <input
                      type="color"
                      value={backgroundSettings.color}
                      onChange={(e) => setBackgroundSettings({...backgroundSettings, color: e.target.value})}
                      className="w-full h-10 border rounded"
                    />
                  </div>
                )}
                
                {backgroundSettings.type === 'gradient' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">시작 색상</label>
                      <input
                        type="color"
                        value={backgroundSettings.gradient.from}
                        onChange={(e) => setBackgroundSettings({
                          ...backgroundSettings, 
                          gradient: {...backgroundSettings.gradient, from: e.target.value}
                        })}
                        className="w-full h-10 border rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">끝 색상</label>
                      <input
                        type="color"
                        value={backgroundSettings.gradient.to}
                        onChange={(e) => setBackgroundSettings({
                          ...backgroundSettings, 
                          gradient: {...backgroundSettings.gradient, to: e.target.value}
                        })}
                        className="w-full h-10 border rounded"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowBackgroundModal(false)}
                  className="flex-1"
                >
                  취소
                </Button>
                <Button
                  onClick={() => setShowBackgroundModal(false)}
                  className="flex-1"
                >
                  적용
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* 폰트 설정 모달 */}
        {showFontModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <Type className="w-5 h-5 mr-2" />
                  폰트 설정
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFontModal(false)}
                  className="h-8 w-8 p-0"
                >
                  ×
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">폰트 패밀리</label>
                  <select 
                    value={fontSettings.family}
                    onChange={(e) => setFontSettings({...fontSettings, family: e.target.value})}
                    className="w-full p-2 border rounded"
                  >
                    {fontOptions.map((font) => (
                      <option key={font.family} value={font.family}>{font.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">폰트 크기: {fontSettings.size}px</label>
                  <input
                    type="range"
                    min="10"
                    max="24"
                    value={fontSettings.size}
                    onChange={(e) => setFontSettings({...fontSettings, size: parseInt(e.target.value)})}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">폰트 색상</label>
                  <input
                    type="color"
                    value={fontSettings.color}
                    onChange={(e) => setFontSettings({...fontSettings, color: e.target.value})}
                    className="w-full h-10 border rounded"
                  />
                </div>

                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={fontSettings.weight === 'bold'}
                      onChange={(e) => setFontSettings({...fontSettings, weight: e.target.checked ? 'bold' : 'normal'})}
                      className="rounded"
                    />
                    <label className="text-sm font-medium text-gray-700">굵게</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={fontSettings.style === 'italic'}
                      onChange={(e) => setFontSettings({...fontSettings, style: e.target.checked ? 'italic' : 'normal'})}
                      className="rounded"
                    />
                    <label className="text-sm font-medium text-gray-700">기울임</label>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowFontModal(false)}
                  className="flex-1"
                >
                  취소
                </Button>
                <Button
                  onClick={() => setShowFontModal(false)}
                  className="flex-1"
                >
                  적용
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* 위젯 편집 모달 */}
        {editingWidget && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[99999] p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">위젯 편집</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={cancelEdit}
                  className="h-8 w-8 p-0"
                >
                  ×
                </Button>
              </div>

              <div className="space-y-4">
                {editingWidget && (() => {
                  const widget = widgets.find(w => w.id === editingWidget);
                  if (!widget) return null;

                  switch (widget.type) {
                    case 'profile_card':
                      return (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
                            <input
                              type="text"
                              value={formData.name || ''}
                              onChange={(e) => setFormData({...formData, name: e.target.value})}
                              className="w-full p-2 border rounded"
                            />
                      </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">닉네임</label>
                            <input
                              type="text"
                              value={formData.nickname || ''}
                              onChange={(e) => setFormData({...formData, nickname: e.target.value})}
                              className="w-full p-2 border rounded"
                            />
                    </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">한 줄 소개</label>
                            <input
                              type="text"
                              value={formData.bio || ''}
                              onChange={(e) => setFormData({...formData, bio: e.target.value})}
                              className="w-full p-2 border rounded"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">소셜 링크</label>
                            {formData.socialLinks?.map((link: any, index: number) => (
                              <div key={index} className="flex gap-2 mb-2">
                                <input
                                  type="text"
                                  placeholder="플랫폼"
                                  value={link.platform || ''}
                                  onChange={(e) => {
                                    const newLinks = [...formData.socialLinks];
                                    newLinks[index] = {...link, platform: e.target.value};
                                    setFormData({...formData, socialLinks: newLinks});
                                  }}
                                  className="flex-1 p-2 border rounded"
                                />
                                <input
                                  type="url"
                                  placeholder="URL"
                                  value={link.url || ''}
                                  onChange={(e) => {
                                    const newLinks = [...formData.socialLinks];
                                    newLinks[index] = {...link, url: e.target.value};
                                    setFormData({...formData, socialLinks: newLinks});
                                  }}
                                  className="flex-1 p-2 border rounded"
                                />
                  </div>
                ))}
              </div>
                        </div>
                      );

                    case 'business_header':
                      return (
                <div className="space-y-4">
                  <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">가게 이름</label>
                    <input
                              type="text"
                              value={formData.name || ''}
                              onChange={(e) => setFormData({...formData, name: e.target.value})}
                              className="w-full p-2 border rounded"
                    />
                  </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">가게 소개</label>
                            <textarea
                              value={formData.description || ''}
                              onChange={(e) => setFormData({...formData, description: e.target.value})}
                              className="w-full p-2 border rounded h-20 resize-none"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">전화번호</label>
                            <input
                              type="tel"
                              value={formData.phone || ''}
                              onChange={(e) => setFormData({...formData, phone: e.target.value})}
                              className="w-full p-2 border rounded"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">주소</label>
                            <input
                              type="text"
                              value={formData.address || ''}
                              onChange={(e) => setFormData({...formData, address: e.target.value})}
                              className="w-full p-2 border rounded"
                            />
                          </div>
                        </div>
                      );

                    case 'event_header':
                      return (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">행사 제목</label>
                            <input
                              type="text"
                              value={formData.title || ''}
                              onChange={(e) => setFormData({...formData, title: e.target.value})}
                              className="w-full p-2 border rounded"
                            />
                          </div>
                  <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">날짜</label>
                      <input
                                type="date"
                                value={formData.date || ''}
                                onChange={(e) => setFormData({...formData, date: e.target.value})}
                                className="w-full p-2 border rounded"
                              />
                    </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">시간</label>
                      <input
                                type="time"
                                value={formData.time || ''}
                                onChange={(e) => setFormData({...formData, time: e.target.value})}
                                className="w-full p-2 border rounded"
                              />
                    </div>
                  </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">장소</label>
                            <input
                              type="text"
                              value={formData.location || ''}
                              onChange={(e) => setFormData({...formData, location: e.target.value})}
                              className="w-full p-2 border rounded"
                            />
                </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">행사 설명</label>
                            <textarea
                              value={formData.description || ''}
                              onChange={(e) => setFormData({...formData, description: e.target.value})}
                              className="w-full p-2 border rounded h-20 resize-none"
                            />
                          </div>
                        </div>
                      );

                    case 'note':
                      return (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">메모 제목</label>
                            <input
                              type="text"
                              value={formData.title || ''}
                              onChange={(e) => setFormData({...formData, title: e.target.value})}
                              className="w-full p-2 border rounded"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">내용</label>
                            <textarea
                              value={formData.content || ''}
                              onChange={(e) => setFormData({...formData, content: e.target.value})}
                              className="w-full p-2 border rounded h-32 resize-none"
                              placeholder="메모를 입력하세요..."
                            />
                          </div>
                        </div>
                      );

                    case 'reminder':
                      return (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">알림 제목</label>
                            <input
                              type="text"
                              value={formData.title || ''}
                              onChange={(e) => setFormData({...formData, title: e.target.value})}
                              className="w-full p-2 border rounded"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">알림 내용</label>
                            <textarea
                              value={formData.content || ''}
                              onChange={(e) => setFormData({...formData, content: e.target.value})}
                              className="w-full p-2 border rounded h-20 resize-none"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">날짜</label>
                              <input
                                type="date"
                                value={formData.date || ''}
                                onChange={(e) => setFormData({...formData, date: e.target.value})}
                                className="w-full p-2 border rounded"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">시간</label>
                              <input
                                type="time"
                                value={formData.time || ''}
                                onChange={(e) => setFormData({...formData, time: e.target.value})}
                                className="w-full p-2 border rounded"
                              />
                            </div>
                          </div>
                        </div>
                      );

                    case 'goal':
                      return (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">목표 제목</label>
                            <input
                              type="text"
                              value={formData.title || ''}
                              onChange={(e) => setFormData({...formData, title: e.target.value})}
                              className="w-full p-2 border rounded"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">목표 설명</label>
                            <textarea
                              value={formData.description || ''}
                              onChange={(e) => setFormData({...formData, description: e.target.value})}
                              className="w-full p-2 border rounded h-20 resize-none"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">목표 값</label>
                              <input
                                type="number"
                                value={formData.target || ''}
                                onChange={(e) => setFormData({...formData, target: e.target.value})}
                                className="w-full p-2 border rounded"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">현재 값</label>
                              <input
                                type="number"
                                value={formData.current || ''}
                                onChange={(e) => setFormData({...formData, current: e.target.value})}
                                className="w-full p-2 border rounded"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">단위</label>
                            <input
                              type="text"
                              value={formData.unit || ''}
                              onChange={(e) => setFormData({...formData, unit: e.target.value})}
                              className="w-full p-2 border rounded"
                              placeholder="예: kg, km, 개, 권..."
                            />
                          </div>
                        </div>
                      );

                    case 'habit':
                      return (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">습관 이름</label>
                            <input
                              type="text"
                              value={formData.title || ''}
                              onChange={(e) => setFormData({...formData, title: e.target.value})}
                              className="w-full p-2 border rounded"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">목표 주기</label>
                            <select
                              value={formData.frequency || 'daily'}
                              onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                              className="w-full p-2 border rounded"
                            >
                              <option value="daily">매일</option>
                              <option value="weekly">매주</option>
                              <option value="monthly">매월</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">목표 횟수</label>
                            <input
                              type="number"
                              value={formData.target || ''}
                              onChange={(e) => setFormData({...formData, target: e.target.value})}
                              className="w-full p-2 border rounded"
                              min="1"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
                            <textarea
                              value={formData.description || ''}
                              onChange={(e) => setFormData({...formData, description: e.target.value})}
                              className="w-full p-2 border rounded h-16 resize-none"
                            />
                          </div>
                        </div>
                      );

                    case 'expense':
                      return (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">지출 항목</label>
                            <input
                              type="text"
                              value={formData.title || ''}
                              onChange={(e) => setFormData({...formData, title: e.target.value})}
                              className="w-full p-2 border rounded"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">금액</label>
                            <input
                              type="number"
                              value={formData.amount || ''}
                              onChange={(e) => setFormData({...formData, amount: e.target.value})}
                              className="w-full p-2 border rounded"
                              min="0"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
                            <select
                              value={formData.category || 'food'}
                              onChange={(e) => setFormData({...formData, category: e.target.value})}
                              className="w-full p-2 border rounded"
                            >
                              <option value="food">식비</option>
                              <option value="transport">교통비</option>
                              <option value="shopping">쇼핑</option>
                              <option value="entertainment">오락</option>
                              <option value="health">건강</option>
                              <option value="education">교육</option>
                              <option value="other">기타</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">날짜</label>
                            <input
                              type="date"
                              value={formData.date || ''}
                              onChange={(e) => setFormData({...formData, date: e.target.value})}
                              className="w-full p-2 border rounded"
                            />
                          </div>
                        </div>
                      );

                    case 'quote':
                      return (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">명언</label>
                            <textarea
                              value={formData.quote || ''}
                              onChange={(e) => setFormData({...formData, quote: e.target.value})}
                              className="w-full p-2 border rounded h-20 resize-none"
                              placeholder="명언을 입력하세요..."
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">작가</label>
                            <input
                              type="text"
                              value={formData.author || ''}
                              onChange={(e) => setFormData({...formData, author: e.target.value})}
                              className="w-full p-2 border rounded"
                              placeholder="작가명을 입력하세요..."
                            />
                          </div>
                        </div>
                      );

                    default:
                      return (
                        <div className="text-center text-gray-500 py-8">
                          <p>이 위젯은 편집할 수 없습니다.</p>
                        </div>
                      );
                  }
                })()}
              </div>

              <div className="flex gap-3 mt-6 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={cancelEdit}
                  className="flex-1"
                >
                  취소
                </Button>
                <Button
                  onClick={() => saveWidget(editingWidget)}
                  className="flex-1"
                >
                  저장
                </Button>
              </div>
            </div>
          </div>
        )}


      </div>
    </div>
  );
}
