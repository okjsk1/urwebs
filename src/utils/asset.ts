// src/utils/asset.ts
export function buildAssetUrl(path: string): string {
  // path: 'websites.json' or '/websites.json'
  const cleaned = path.replace(/^\/+/, ''); // 앞 슬래시 제거
  try {
    const base = (import.meta as any).env?.BASE_URL;
    // 1) base가 절대 URL인 경우
    if (typeof base === 'string' && /^https?:\/\//i.test(base)) {
      return new URL(cleaned, base).toString();
    }
    // 2) base가 루트 절대경로('/app/')인 경우
    if (typeof base === 'string' && base.startsWith('/')) {
      return base.replace(/\/+$/, '') + '/' + cleaned;
    }
  } catch {
    /* no-op */
  }
  // 3) 최종 폴백: 루트 기준
  return '/' + cleaned;
}
