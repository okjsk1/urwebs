const KEY = "urwebs-visits-v1";
const DAY = 24 * 60 * 60 * 1000;

export function trackVisit(id: string) {
  try {
    const raw = localStorage.getItem(KEY);
    const data: Record<string, number[]> = raw ? JSON.parse(raw) : {};
    const arr = Array.isArray(data[id]) ? data[id] : [];
    arr.push(Date.now());
    data[id] = arr;
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch (e) {
    console.error("trackVisit failed", e);
  }
}

export function buildFrequencyMap(): Record<string, number> {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const data: Record<string, number[]> = JSON.parse(raw);
    const cutoff = Date.now() - 30 * DAY;
    const map: Record<string, number> = {};
    Object.entries(data).forEach(([id, times]) => {
      const score = (times || [])
        .filter((t) => t >= cutoff)
        .reduce((sum, t) => sum + (1 - (Date.now() - t) / (30 * DAY)), 0);
      if (score > 0) map[id] = score;
    });
    return map;
  } catch (e) {
    console.error("buildFrequencyMap failed", e);
    return {};
  }
}
