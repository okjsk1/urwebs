export function buildCoOccur(folders: string[][]): Record<string, number> {
  const map: Record<string, number> = {};
  folders.forEach((items) => {
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const a = items[i];
        const b = items[j];
        const key = [a, b].sort().join("|");
        map[key] = (map[key] || 0) + 1;
      }
    }
  });
  return map;
}

export function suggestByRecent(
  freqMap: Record<string, number>,
  k: number
): string[] {
  return Object.entries(freqMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, k)
    .map(([id]) => id);
}

export function suggestForFolder(
  folderItems: string[],
  globalStats: Record<string, number>,
  k: number
): string[] {
  const counts: Record<string, number> = {};
  folderItems.forEach((item) => {
    Object.entries(globalStats).forEach(([pair, c]) => {
      const [a, b] = pair.split("|");
      if (a === item && !folderItems.includes(b)) {
        counts[b] = (counts[b] || 0) + c;
      } else if (b === item && !folderItems.includes(a)) {
        counts[a] = (counts[a] || 0) + c;
      }
    });
  });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, k)
    .map(([id]) => id);
}

