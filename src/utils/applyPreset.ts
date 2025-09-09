import { FavoritesData, FavoriteFolder, Widget } from "../types";

function mergeIds(a: string[] = [], b: string[] = []): string[] {
  return Array.from(new Set([...(a || []), ...(b || [])]));
}

function mergeFolders(a: FavoriteFolder[] = [], b: FavoriteFolder[] = []): FavoriteFolder[] {
  const map = new Map<string, FavoriteFolder>();
  a.forEach((f) => map.set(f.id, { ...f }));
  b.forEach((f) => {
    if (map.has(f.id)) {
      const cur = map.get(f.id)!;
      cur.items = mergeIds(cur.items, f.items);
      if (!cur.position && f.position) cur.position = f.position;
    } else {
      map.set(f.id, { ...f });
    }
  });
  return Array.from(map.values());
}

function mergeWidgets(a: Widget[] = [], b: Widget[] = []): Widget[] {
  const map = new Map<string, Widget>();
  a.forEach((w) => map.set(w.id, { ...w }));
  b.forEach((w) => {
    if (!map.has(w.id)) {
      map.set(w.id, { ...w });
    }
  });
  return Array.from(map.values());
}

export function applyPreset(
  current: FavoritesData | null | undefined,
  preset: FavoritesData
): FavoritesData {
  const base: FavoritesData = current || { items: [], folders: [], widgets: [] };
  return {
    items: mergeIds(base.items, preset.items),
    folders: mergeFolders(base.folders, preset.folders),
    widgets: mergeWidgets(base.widgets, preset.widgets),
    itemsSortMode: base.itemsSortMode,
  };
}
