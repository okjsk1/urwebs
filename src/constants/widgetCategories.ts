import {
  CheckSquare, Target, Repeat, Clock, Bell, FileText, Calendar, Mail,
  TrendingUp, DollarSign, BarChart3, Github, Calculator, Lock, QrCode,
  Globe, Cloud, Search, Rss, Music, Quote, Palette, Link, BookOpen, Users
} from 'lucide-react';
import { WidgetCategory } from '../types/mypage.types';

export const widgetCategories: Record<string, WidgetCategory> = {
  // 📊 생산성 및 업무
  productivity: {
    name: '생산성 & 업무',
    widgets: [
      { type: 'todo', name: 'To Do List', icon: CheckSquare, description: '할 일 목록 관리 및 체크' },
      { type: 'goal', name: '목표 추적', icon: Target, description: '목표 설정 및 진행률 추적' },
      { type: 'reminder', name: '알림 관리', icon: Bell, description: '중요한 일정 알림' },
      { type: 'quicknote', name: '빠른 메모', icon: FileText, description: '즉석 메모 작성' },
      { type: 'calendar', name: '캘린더', icon: Calendar, description: '일정 관리 및 계획' },
      { type: 'mail_services', name: '메일 서비스', icon: Mail, description: '다양한 메일 서비스 바로가기' },
    ]
  },

  // 💰 금융 및 투자
  finance: {
    name: '금융 & 투자',
    widgets: [
      { type: 'stock', name: '주식 시세', icon: TrendingUp, description: '실시간 주식 가격 확인' },
      { type: 'crypto', name: '암호화폐', icon: DollarSign, description: '실시간 코인 시세 및 스파크라인' },
      { type: 'stock_alert', name: '주식 알림', icon: Bell, description: '주식 가격 알림 설정' },
      { type: 'economic_calendar', name: '경제 캘린더', icon: Calendar, description: 'FOMC, CPI 등 경제 지표 일정' },
      { type: 'expense', name: '가계부', icon: DollarSign, description: '수입/지출 관리' },
      { type: 'exchange', name: '환율 정보', icon: DollarSign, description: '실시간 환율 정보' },
    ]
  },

  // 🔧 개발 및 기술
  development: {
    name: '개발 & 기술',
    widgets: [
      { type: 'converter', name: '단위 변환', icon: Calculator, description: '단위 변환기' },
      { type: 'qr', name: 'QR 코드', icon: QrCode, description: 'QR 코드 생성' },
    ]
  },

  // 📰 정보 및 뉴스
  information: {
    name: '정보 & 뉴스',
    widgets: [
      { type: 'news', name: '뉴스 피드', icon: Globe, description: '최신 뉴스 및 관심사' },
      { type: 'weather', name: '날씨 정보', icon: Cloud, description: '실시간 날씨 정보' },
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
      { type: 'quote', name: '영감 명언', icon: Quote, description: '영감을 주는 명언' },
    ]
  },

  // 🎨 디자인 및 도구
  design: {
    name: '디자인 & 도구',
    widgets: [
      { type: 'bookmark', name: '즐겨찾기', icon: Link, description: '자주 사용하는 링크' },
      { type: 'frequent_sites', name: '자주가는 사이트', icon: TrendingUp, description: '방문 횟수 기반 추천' },
    ]
  },

  // 📚 교육 및 학습
  education: {
    name: '교육 & 학습',
    widgets: [
      { type: 'english_words', name: '영어 단어 학습', icon: BookOpen, description: '영어 단어 학습 도구' },
    ]
  },

  // 💰 광고
  ads: {
    name: '광고',
    widgets: [
      { type: 'google_ad', name: '구글 광고', icon: DollarSign, description: '구글 광고 위젯' },
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
    development: '🔧',
    information: '📰',
    media: '🎵',
    design: '🎨',
    education: '📚',
    social: '👥',
    system: '⚙️',
    ads: '📢'
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




