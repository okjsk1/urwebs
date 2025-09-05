// src/utils/visitTrack.ts
export const LS_VISITS = "urwebs-visits-v1";
const THIRTY = 30 * 24 * 60 * 60 * 1000;

export function trackVisit(id: string): void {
  try {
    const raw = localStorage.getItem(LS_VISITS);
    const data: Record<string, number[]> = raw ? JSON.parse(raw) : {};
    const arr = Array.isArray(data[id]) ? data[id] : [];
    arr.push(Date.now());
    if (arr.length > 200) arr.splice(0, arr.length - 200);
    data[id] = arr;
    localStorage.setItem(LS_VISITS, JSON.stringify(data));
  } catch (e) {
    console.warn("trackVisit failed", e);
  }
}

export function buildFrequencyMap(): Record<string, number> {
  try {
    const raw = localStorage.getItem(LS_VISITS);
    if (!raw) return {};
    const data: Record<string, number[]> = JSON.parse(raw);
    const now = Date.now();
    const map: Record<string, number> = {};
    Object.entries(data).forEach(([id, times]) => {
      if (!Array.isArray(times)) return;
      const score = times
        .filter((t) => now - t <= THIRTY)
        .reduce((sum, t) => {
          const age = now - t;
          const w = 1 - age / THIRTY;
          return sum + (0.5 + 0.5 * w);
        }, 0);
      if (score > 0) map[id] = score;
    });
    return map;
  } catch (e) {
    console.warn("buildFrequencyMap failed", e);
    return {};
  }
}

