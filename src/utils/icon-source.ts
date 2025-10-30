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

  // (선택) Clearbit 로고 서비스 - 주석 처리
  // candidates.push(`https://logo.clearbit.com/${host}`);

  return candidates;
}

