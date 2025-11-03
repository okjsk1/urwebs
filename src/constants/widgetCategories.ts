import {
  CheckSquare, Target, Repeat, Clock, Bell, FileText, Calendar, Mail,
  TrendingUp, DollarSign, BarChart3, Github, Lock, QrCode,
  Globe, Cloud, Search, Rss, Quote, Palette, Link, BookOpen, Users,
  Timer, Newspaper, CalendarDays, Image as ImageIcon
} from 'lucide-react';
import { WidgetCategory } from '../types/mypage.types';

export const widgetCategories: Record<string, WidgetCategory> = {
  // 📊 생산성 및 업무
  productivity: {
    name: '생산성 & 업무',
    widgets: [
      { type: 'todo', name: 'To Do List', icon: CheckSquare, description: '할 일 목록 관리 및 체크' },
      { type: 'quicknote', name: '빠른 메모', icon: FileText, description: '즉석 메모 작성' },
      { type: 'calendar', name: '캘린더', icon: Calendar, description: '일정 관리 및 계획' },
      { type: 'quote', name: '영감 명언', icon: Quote, description: '영감을 주는 명언' },
      { type: 'english_words', name: '영어 단어 학습', icon: BookOpen, description: '영어 단어 학습 도구' },
      { type: 'timer', name: '타이머', icon: Timer, description: '카운트다운/스톱워치/포모도로' },
      { type: 'dday', name: 'D-Day', icon: CalendarDays, description: '기념일/마감일 관리' },
    ]
  },

  // 💰 금융 및 투자
  finance: {
    name: '금융 & 투자',
    widgets: [
      { type: 'crypto', name: '암호화폐', icon: DollarSign, description: '실시간 코인 시세 및 스파크라인' },
      { type: 'economic_calendar', name: '경제 캘린더', icon: Calendar, description: 'FOMC, CPI 등 경제 지표 일정' },
      { type: 'exchange', name: '환율 정보', icon: DollarSign, description: '실시간 환율 정보' },
      { type: 'google_ad', name: '구글 광고', icon: DollarSign, description: '구글 광고 위젯' },
    ]
  },

  // 📰 정보 및 뉴스
  information: {
    name: '정보 & 뉴스',
    widgets: [
      { type: 'news', name: '뉴스 피드', icon: Globe, description: '최신 뉴스 및 관심사' },
      { type: 'news_summary', name: '뉴스 요약', icon: Newspaper, description: 'RSS 피드 요약 및 필터링' },
      { type: 'weather', name: '날씨 정보', icon: Cloud, description: '실시간 날씨 정보' },
      { type: 'unified_search', name: '통합검색', icon: Search, description: '여러 검색 엔진 통합 검색' },
      { type: 'google_search', name: '구글 검색', icon: Search, description: '구글 검색 바로가기' },
      { type: 'naver_search', name: '네이버 검색', icon: Search, description: '네이버 검색 바로가기' },
      { type: 'law_search', name: '법제처 검색', icon: Search, description: '법령 검색 도구' },
    ]
  },

  // 🎨 디자인 및 도구
  design: {
    name: '디자인 & 도구',
    widgets: [
      { type: 'bookmark', name: '즐겨찾기', icon: Link, description: '자주 사용하는 링크' },
      { type: 'frequent_sites', name: '자주가는 사이트', icon: TrendingUp, description: '방문 횟수 기반 추천' },
      { type: 'qr_code', name: 'QR접속', icon: QrCode, description: '현재 페이지 URL을 QR 코드로 생성' },
      { type: 'image', name: '사진 프레임', icon: ImageIcon, description: '개인 사진을 예쁘게 표시 (단일/슬라이드쇼)' },
      { type: 'theme', name: '다크모드/테마', icon: Palette, description: '다크모드 전환 및 컬러 팔레트' },
    ]
  },

};

// 모든 위젯을 평면 배열로 변환
export const allWidgets = Object.values(widgetCategories).flatMap(category => category.widgets);

// 카테고리 아이콘
export const getCategoryIcon = (categoryKey: string) => {
  const icons: { [key: string]: string } = {
    productivity: '📊',
    finance: '💰',
    information: '📰',
    design: '🎨'
  };
  return icons[categoryKey] || '📦';
};

// 폰트 옵션
export const fontOptions = [
  { family: 'Inter', name: 'Inter' },
  { family: 'Roboto', name: 'Roboto' },
  { family: 'Open Sans', name: 'Open Sans' },
  { family: 'Lato', name: 'Lato' },
  { family: 'Montserrat', name: 'Montserrat' },
  { family: 'Poppins', name: 'Poppins' },
  { family: 'Source Sans Pro', name: 'Source Sans Pro' },
  { family: 'Nunito', name: 'Nunito' },
];




