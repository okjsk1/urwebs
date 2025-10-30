// 브랜드 컬러 및 아이콘 유틸리티

/**
 * URL에서 host를 추출 (www 제거, 소문자)
 */
export function getHost(url: string): string {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return host.replace(/^www\./, '');
  } catch {
    return '';
  }
}

/**
 * 브랜드별 고유 컬러 맵
 * TODO: 필요시 추가 사이트 확장
 */
const BRAND_COLORS: Record<string, string> = {
  'google.com': '#4285F4',
  'youtube.com': '#FF0000',
  'github.com': '#181717',
  'naver.com': '#03C75A',
  'daum.net': '#FF5722',
  'kakao.com': '#FEE500',
  'notion.so': '#000000',
  'figma.com': '#F24E1E',
  'law.go.kr': '#4A90E2',
  'facebook.com': '#1877F2',
  'instagram.com': '#E4405F',
  'twitter.com': '#1DA1F2',
  'linkedin.com': '#0A66C2',
  'stackoverflow.com': '#F48024',
  'medium.com': '#000000',
  'reddit.com': '#FF4500',
  'discord.com': '#5865F2',
  'slack.com': '#4A154B',
  'microsoft.com': '#00A4EF',
  'apple.com': '#000000',
  'amazon.com': '#FF9900',
  'netflix.com': '#E50914',
  'spotify.com': '#1DB954',
  'trello.com': '#0079BF',
  'asana.com': '#F06A6A',
  'dropbox.com': '#0061FF',
  'onedrive.com': '#0078D4',
  'zoom.us': '#2D8CFF',
  'teams.microsoft.com': '#6264A7',
  'workspace.google.com': '#34A853',
  'outlook.com': '#0078D4',
  'gmail.com': '#EA4335',
};

/**
 * URL 해시 기반 HSL 컬러 생성 (시드 기반 일관된 색상)
 */
function hashStringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // HSL 생성: H는 해시에서 추출, S=65%, L=55%
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 65%, 55%)`;
}

/**
 * 브랜드 컬러 가져오기 (캐시 지원)
 */
export function getBrandColor(url: string): string {
  const host = getHost(url);
  if (!host) return hashStringToColor(url);
  
  // 캐시 체크
  const cacheKey = `brandColor:${host}`;
  const cached = sessionStorage.getItem(cacheKey);
  if (cached) return cached;
  
  // 브랜드 맵에서 찾기
  const brandColor = BRAND_COLORS[host];
  
  if (brandColor) {
    sessionStorage.setItem(cacheKey, brandColor);
    return brandColor;
  }
  
  // 해시 기반 색상
  const hashColor = hashStringToColor(host);
  sessionStorage.setItem(cacheKey, hashColor);
  return hashColor;
}

/**
 * 이니셜 추출 (한글/영문 지원)
 */
export function getInitials(name?: string, url?: string): string {
  if (name) {
    // 한글/영문 추출 및 정리
    const cleaned = name
      .replace(/[^\uac00-\ud7a3a-zA-Z0-9\s]/g, '') // 특수문자 제거
      .trim();
    
    if (cleaned.length === 0) {
      // name에서 추출 실패 시 url 사용
      return getInitials(undefined, url);
    }
    
    // 한글 처리: 초성 추출 또는 처음 글자
    const firstChar = cleaned[0];
    if (/[\uac00-\ud7a3]/.test(firstChar)) {
      // 한글이면 1~2글자 추출
      return cleaned.slice(0, 2);
    }
    
    // 영문이면 공백 기준으로 단어 추출
    const words = cleaned.split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    
    // 단일 단어면 앞 1~2글자
    return cleaned.slice(0, 2).toUpperCase();
  }
  
  // name이 없으면 url에서 host 추출
  if (url) {
    const host = getHost(url);
    if (host) {
      // 도메인명의 앞 1~2글자
      const cleanHost = host.replace(/\.(com|net|co|kr|org|io)/g, '');
      return cleanHost.slice(0, 2).toUpperCase();
    }
  }
  
  return '?';
}

/**
 * 텍스트 색상 선택 (배경색 대비)
 */
export function pickTextColor(backgroundColor: string): '#111' | '#fff' {
  try {
    let r: number, g: number, b: number;
    
    // HEX 파싱
    if (backgroundColor.startsWith('#')) {
      const hex = backgroundColor.slice(1);
      if (hex.length === 6) {
        r = parseInt(hex.slice(0, 2), 16);
        g = parseInt(hex.slice(2, 4), 16);
        b = parseInt(hex.slice(4, 6), 16);
      } else {
        return '#111';
      }
    }
    // HSL 파싱
    else if (backgroundColor.startsWith('hsl(')) {
      const matches = backgroundColor.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
      if (!matches) return '#111';
      
      const h = parseInt(matches[1]) / 360;
      const s = parseInt(matches[2]) / 100;
      const l = parseInt(matches[3]) / 100;
      
      // HSL to RGB 변환
      const c = (1 - Math.abs(2 * l - 1)) * s;
      const x = c * (1 - Math.abs((h * 6) % 2 - 1));
      const m = l - c / 2;
      
      let rr = 0, gg = 0, bb = 0;
      
      if (h < 1/6) { rr = c; gg = x; bb = 0; }
      else if (h < 2/6) { rr = x; gg = c; bb = 0; }
      else if (h < 3/6) { rr = 0; gg = c; bb = x; }
      else if (h < 4/6) { rr = 0; gg = x; bb = c; }
      else if (h < 5/6) { rr = x; gg = 0; bb = c; }
      else { rr = c; gg = 0; bb = x; }
      
      r = Math.round((rr + m) * 255);
      g = Math.round((gg + m) * 255);
      b = Math.round((bb + m) * 255);
    }
    // 알 수 없는 형식
    else {
      return '#111';
    }
    
    // YIQ (밝기 계산)
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 128 ? '#111' : '#fff';
  } catch {
    return '#111';
  }
}

