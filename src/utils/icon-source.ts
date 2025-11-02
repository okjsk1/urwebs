// 파비콘 소스 후보 경로 생성

import { getHost } from './brand';

/**
 * 파비콘 후보 경로 생성 (우선순위 순)
 * 
 * 우선순위:
 * 1. Google S2 Favicon Service (고해상도, 128x128)
 * 2. Apple Touch Icon (일반적으로 180x180)
 * 3. Favicon 32x32
 * 4. 기본 favicon.ico
 */
export function buildFaviconCandidates(url: string): string[] {
  const host = getHost(url);
  if (!host) {
    return [];
  }

  const candidates: string[] = [];

  // 1. Google S2 Favicon Service (고해상도 최우선)
  candidates.push(`https://www.google.com/s2/favicons?sz=128&domain=${host}`);

  // 2. 사이트 루트의 Apple Touch Icon
  try {
    const urlObj = new URL(url);
    candidates.push(`${urlObj.protocol}//${host}/apple-touch-icon.png`);
  } catch {}

  // 3. 사이트 루트의 32x32 Favicon
  try {
    const urlObj = new URL(url);
    candidates.push(`${urlObj.protocol}//${host}/favicon-32x32.png`);
  } catch {}

  // 4. 기본 favicon.ico
  try {
    const urlObj = new URL(url);
    candidates.push(`${urlObj.protocol}//${host}/favicon.ico`);
  } catch {}

  // 5. 로컬 fallback 파비콘 (모든 후보 실패 시)
  // 실제 파일은 public/favicon.ico 또는 public/assets/icons/default-favicon.png에 있어야 함
  // 후보 배열의 마지막에 추가하지 않고, 호출자가 실패 시 사용하도록 함

  return candidates;
}

/**
 * 기본 파비콘 경로 반환 (fallback용)
 */
export function getDefaultFaviconPath(): string {
  // public 폴더의 favicon.ico 또는 기본 아이콘 사용
  return '/favicon.ico';
}

