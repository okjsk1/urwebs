// 위젯 공통 유틸리티 함수들
export interface WidgetProps {
  widget: {
    id: string;
    type: string;
    title?: string;
    content?: any;
  };
  isEditMode: boolean;
  updateWidget?: (widgetId: string, partial: any) => void;
}

// 편집 가능한 위젯 타입 목록
export const EDITABLE_WIDGET_TYPES = [
  'weather',           // 날씨 위젯 - 위치 설정, 단위 변경
  'todo',              // 할일 위젯 - 할일 추가/편집/삭제
  'english_words',     // 영어 단어 위젯 - 단어 추가/편집
  'bookmark',          // 북마크 위젯 - 북마크 추가/편집/삭제
  'frequent_sites',    // 자주가는 사이트 위젯 - 사이트 관리
  'exchange',          // 환율 위젯 - 관심 통화 설정
  'crypto',            // 암호화폐 위젯 - 관심 코인 설정
  'stock',             // 주식 위젯 - 관심 종목 설정
  'memo',              // 메모 위젯 - 메모 편집
  'quicknote',         // 빠른 메모 위젯 - 메모 편집
  'table',             // 표 위젯 - 행/열 편집
  'links',             // 링크 위젯 - 링크 관리
  'news',              // 뉴스 위젯 - 카테고리 설정
  'music',             // 음악 위젯 - 플레이리스트 설정
  'github',            // GitHub 위젯 - 저장소 설정
  'qr',                // QR 코드 위젯 - 텍스트 설정
  'contact',           // 연락처 위젯 - 연락처 관리
  'calendar',          // 캘린더 위젯 - 이벤트 관리
  'stock_alert',       // 주식 알림 위젯 - 알림 설정
  'economic_calendar', // 경제 캘린더 위젯 - 설정
  'google_ad',         // Google 광고 위젯 - 설정
  'image'              // 이미지 위젯 - 사진 추가/편집/삭제
];

// 위젯이 편집 가능한지 확인하는 함수
export const isWidgetEditable = (widgetType: string): boolean => {
  return EDITABLE_WIDGET_TYPES.includes(widgetType);
};

// 로컬 스토리지 저장/불러오기
// 백엔드 동기화를 위한 어댑터 인터페이스 (향후 확장)
export interface DataSyncAdapter {
  isEnabled: () => boolean;
  save: (widgetId: string, data: any) => Promise<void>;
  load: (widgetId: string) => Promise<any | null>;
}

let registeredDataSyncAdapter: DataSyncAdapter | null = null;

export const registerDataSyncAdapter = (adapter: DataSyncAdapter) => {
  registeredDataSyncAdapter = adapter;
};

export const persistOrLocal = (widgetId: string, data: any, updateWidget?: (widgetId: string, partial: any) => void) => {
  try {
    const dataString = JSON.stringify(data);
    localStorage.setItem(`widget:${widgetId}`, dataString);
    
    // updateWidget이 있으면 비동기로 호출하여 무한 루프 방지
    if (updateWidget) {
      setTimeout(() => {
        updateWidget(widgetId, { content: data });
      }, 0);
    }

    // 선택적 원격 동기화 (비차단)
    if (registeredDataSyncAdapter && registeredDataSyncAdapter.isEnabled()) {
      // 비동기 저장, 실패해도 무시하고 로컬은 유지
      registeredDataSyncAdapter.save(widgetId, data).catch(() => {});
    }
  } catch (error) {
    console.warn('Failed to persist widget data:', error);
  }
};

export const readLocal = (widgetId: string, fallback: any = null): any => {
  try {
    const stored = localStorage.getItem(`widget:${widgetId}`);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
};

// 원격 우선 읽기 (비동기). 원격이 비활성/실패 시 로컬로 폴백
export const readState = async (widgetId: string, fallback: any = null): Promise<any> => {
  try {
    if (registeredDataSyncAdapter && registeredDataSyncAdapter.isEnabled()) {
      const remote = await registeredDataSyncAdapter.load(widgetId);
      if (remote !== undefined && remote !== null) {
        // 로컬 캐시도 최신화
        try {
          localStorage.setItem(`widget:${widgetId}`, JSON.stringify(remote));
        } catch {}
        return remote;
      }
    }
  } catch {}
  // 폴백: 로컬 동기 읽기
  return readLocal(widgetId, fallback);
};

// 클립보드 복사
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch {
      document.body.removeChild(textArea);
      return false;
    }
  }
};

// 파비콘 URL 생성 (fallback 포함)
export const getFaviconUrl = (url: string): string => {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  } catch {
    // 로컬 fallback 파비콘 사용
    return '/favicon.ico';
  }
};

// URL 정규화
export const normalizeUrl = (url: string): string => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `https://${url}`;
};

// 이메일 유효성 검사
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// 전화번호 유효성 검사 (한국)
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^01[0-9]-?[0-9]{4}-?[0-9]{4}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

// URL 유효성 검사
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(normalizeUrl(url));
    return true;
  } catch {
    return false;
  }
};

// 색상 대비 계산 (흰색/검은색 텍스트 결정)
export const getContrastColor = (hexColor: string): string => {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? '#000000' : '#ffffff';
};

// HSL 색상 생성
export const generateHSLColors = (count: number = 10): string[] => {
  const colors: string[] = [];
  for (let i = 0; i < count; i++) {
    const hue = (i * 360) / count;
    const saturation = 70 + Math.floor(Math.random() * 30);
    const lightness = 50 + Math.floor(Math.random() * 30);
    colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
  }
  return colors;
};

// 시드 기반 랜덤 생성기
export class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  nextInt(max: number): number {
    return Math.floor(this.next() * max);
  }
}

// 통계 데이터 생성 (시드 기반)
export const generateStatsData = (timeRange: string, seed: number = 12345) => {
  const random = new SeededRandom(seed);
  const baseValues = {
    visitors: 1000,
    pageviews: 5000,
    duration: 180,
    bounceRate: 40
  };

  const ranges = {
    '24hours': { multiplier: 0.1, variance: 0.3 },
    '7days': { multiplier: 1, variance: 0.2 },
    '30days': { multiplier: 4, variance: 0.15 }
  };

  const range = ranges[timeRange as keyof typeof ranges] || ranges['7days'];
  
  return {
    visitors: Math.floor(baseValues.visitors * range.multiplier * (1 + (random.next() - 0.5) * range.variance)),
    pageviews: Math.floor(baseValues.pageviews * range.multiplier * (1 + (random.next() - 0.5) * range.variance)),
    duration: Math.floor(baseValues.duration * (1 + (random.next() - 0.5) * range.variance)),
    bounceRate: Math.floor(baseValues.bounceRate * (1 + (random.next() - 0.5) * range.variance) * 10) / 10
  };
};

// 차트 데이터 생성 (시드 기반)
export const generateChartData = (points: number = 7, seed: number = 12345) => {
  const random = new SeededRandom(seed);
  const data: number[] = [];
  
  for (let i = 0; i < points; i++) {
    const baseHeight = 30;
    const variance = 20;
    const height = baseHeight + random.nextInt(variance);
    data.push(height);
  }
  
  return data;
};

// 토스트 메시지 표시 (간단한 구현)
export const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
  const toast = document.createElement('div');
  toast.className = `fixed top-4 right-4 px-4 py-2 rounded-lg text-white text-sm z-50 ${
    type === 'success' ? 'bg-green-500' : 
    type === 'error' ? 'bg-red-500' : 
    'bg-blue-500'
  }`;
  toast.textContent = message;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 3000);
};

// 위젯 모음(컬렉션) 관리
export const addToWidgetCollection = (widgetType: string) => {
  try {
    const key = 'widget_collection';
    const raw = localStorage.getItem(key);
    const list: string[] = raw ? JSON.parse(raw) : [];
    if (!list.includes(widgetType)) {
      const updated = [...list, widgetType];
      localStorage.setItem(key, JSON.stringify(updated));
    }
  } catch {}
};
