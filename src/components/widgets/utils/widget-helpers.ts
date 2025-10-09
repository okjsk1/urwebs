// 위젯 공통 유틸리티 함수들
export interface WidgetProps {
  widget: {
    id: string;
    type: string;
    content?: any;
  };
  isEditMode: boolean;
  updateWidget?: (widgetId: string, partial: any) => void;
}

// 로컬 스토리지 저장/불러오기
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

// 파비콘 URL 생성
export const getFaviconUrl = (url: string): string => {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  } catch {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iNCIgZmlsbD0iI0Y3RjNGNiIvPgo8cGF0aCBkPSJNMTYgMTBMMTIgMThIMjBMMTYgMTBaIiBmaWxsPSIjNkI3MjgwIi8+Cjwvc3ZnPgo=';
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
