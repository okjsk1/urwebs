// 파비콘 품질 검사 및 최적 아이콘 선택

interface IconCache {
  src: string;
  timestamp: number;
}

const CACHE_TTL = 300000; // 5분 (밀리초)

/**
 * 캐시에서 최적 아이콘 가져오기
 */
function getCachedIcon(host: string): string | null {
  try {
    const cached = sessionStorage.getItem(`bestIcon:${host}`);
    if (!cached) return null;

    const data: IconCache = JSON.parse(cached);
    const now = Date.now();

    // TTL 체크
    if (now - data.timestamp > CACHE_TTL) {
      sessionStorage.removeItem(`bestIcon:${host}`);
      return null;
    }

    return data.src;
  } catch {
    return null;
  }
}

/**
 * 최적 아이콘 캐시 저장
 */
function cacheIcon(host: string, src: string): void {
  try {
    const data: IconCache = {
      src,
      timestamp: Date.now()
    };
    sessionStorage.setItem(`bestIcon:${host}`, JSON.stringify(data));
  } catch {
    // sessionStorage 용량 초과 등 에러 무시
  }
}

/**
 * 이미지 품질 검사 (최소 크기)
 */
function checkImageQuality(src: string, minSize: number): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    // CORS 에러 방지: crossOrigin 제거, <img> 태그로만 로드
    
    const timeout = setTimeout(() => {
      resolve(false);
    }, 3000); // 3초 타임아웃

    img.onload = () => {
      clearTimeout(timeout);
      const isHighQuality = img.naturalWidth >= minSize && img.naturalHeight >= minSize;
      resolve(isHighQuality);
    };

    img.onerror = () => {
      clearTimeout(timeout);
      resolve(false);
    };

    img.src = src;
  });
}

/**
 * 후보 중 최적 아이콘 선택
 * 
 * @param candidates 파비콘 후보 URL 배열
 * @param minSize 최소 크기 (기본 24)
 * @returns 최적 아이콘 URL 또는 null
 */
export async function pickBestIcon(
  candidates: string[],
  minSize: number = 24
): Promise<string | null> {
  if (candidates.length === 0) return null;

  // 첫 번째 후보의 host 추출 (캐시 키로 사용)
  const firstCandidate = candidates[0];
  let host = '';
  try {
    const url = new URL(firstCandidate);
    if (url.searchParams.has('domain')) {
      host = url.searchParams.get('domain') || '';
    } else {
      host = url.hostname.replace(/^www\./, '');
    }
  } catch {}

  // 캐시 확인
  if (host) {
    const cached = getCachedIcon(host);
    if (cached) {
      return cached;
    }
  }

  // 각 후보를 순차적으로 검사
  for (const candidate of candidates) {
    const isHighQuality = await checkImageQuality(candidate, minSize);
    if (isHighQuality) {
      // 캐시 저장
      if (host) {
        cacheIcon(host, candidate);
      }
      return candidate;
    }
    
    // 약간의 지연으로 서버 부하 방지
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  // 모든 후보 실패 시 첫 번째 후보라도 반환 (폴백)
  return candidates[0];
}

