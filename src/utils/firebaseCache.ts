type CacheEntry<T> = {
  data: T;
  timestamp: number;
  ttl: number;
};

const cache = new Map<string, CacheEntry<any>>();
const DEFAULT_TTL = 1000 * 60; // 1분

export function getCachedData<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > entry.ttl) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

export function setCachedData<T>(key: string, data: T, ttl: number = DEFAULT_TTL) {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl,
  });
}

export function invalidateCache(keyPrefix?: string) {
  if (!keyPrefix) {
    cache.clear();
    return;
  }
  for (const key of cache.keys()) {
    if (key.startsWith(keyPrefix)) {
      cache.delete(key);
    }
  }
}

export function createCacheKey(parts: Array<string | number | undefined | null>) {
  return parts.filter(Boolean).join(':');
}

