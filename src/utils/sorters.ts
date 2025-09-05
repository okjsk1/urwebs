// src/utils/sorters.ts
export type SortMode = "manual" | "alpha" | "freq";

export function sortByMode(
  ids: string[],
  mode: SortMode,
  freqMap: Record<string, number> = {},
  titleMap: Record<string, string> = {}
): string[] {
  if (mode === "alpha") {
    return [...ids].sort((a, b) =>
      (titleMap[a] || "").localeCompare(titleMap[b] || "", "ko")
    );
  }
  if (mode === "freq") {
    return [...ids].sort((a, b) => (freqMap[b] || 0) - (freqMap[a] || 0));
  }
  return ids;
}

