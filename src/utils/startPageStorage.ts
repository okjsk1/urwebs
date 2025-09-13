import { FavoritesData, Widget, SortMode, FavoriteItem } from '../types';
import starter from '../data/starter.json';

const DEFAULT_STORAGE_KEY = 'favorites:default';

interface StarterFolder {
  id: string;
  name: string;
  items: string[];
  color?: string;
  sortMode?: SortMode;
}

interface StarterRaw {
  favorites: string[];
  folders?: StarterFolder[];
  widgets: { id: string; type: Widget['type'] }[];
}

const starterData = starter as StarterRaw;

export function loadFavoritesData(ns = DEFAULT_STORAGE_KEY): FavoritesData {
  try {
    const raw = localStorage.getItem(ns);
    if (!raw) return { items: [], folders: [], widgets: [], layout: [] };
    const parsed = JSON.parse(raw);

    const items: FavoriteItem[] = [];
    const folders = Array.isArray(parsed.folders)
      ? parsed.folders.map((f: any) => {
          const { id, name, color, sortMode } = f;
          if (Array.isArray(f.items)) {
            f.items.forEach((wid: string) =>
              items.push({ id: wid, parentId: id })
            );
          }
          return { id, name, color, sortMode };
        })
      : [];

    if (Array.isArray(parsed.items)) {
      parsed.items.forEach((it: any) => {
        if (typeof it === 'string') items.push({ id: it, parentId: null });
        else if (it && typeof it.id === 'string')
          items.push({ id: it.id, parentId: it.parentId ?? null });
      });
    }

    const widgets: Widget[] = Array.isArray(parsed.widgets) ? parsed.widgets : [];
    const layout: string[] = Array.isArray(parsed.layout) ? parsed.layout : [];

    return { items, folders, widgets, layout };
  } catch (e) {
    console.error('Failed to load favorites data', e);
    return { items: [], folders: [], widgets: [], layout: [] };
  }
}

export function saveFavoritesData(data: FavoritesData, ns = DEFAULT_STORAGE_KEY) {
  try {
    localStorage.setItem(ns, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save favorites data', e);
  }
}

export function getStarterData(): FavoritesData {
  const widgets: Widget[] = (starterData.widgets || []).map((w) => ({
    id: w.id,
    type: w.type,
  }));

  const folders = (starterData.folders || []).map((f) => ({
    id: f.id,
    name: f.name,
    color: f.color,
    sortMode: f.sortMode,
  }));

  const items: FavoriteItem[] = [];
  (starterData.favorites || []).forEach((id) =>
    items.push({ id, parentId: null })
  );
  (starterData.folders || []).forEach((f) => {
    (f.items || []).forEach((wid) =>
      items.push({ id: wid, parentId: f.id })
    );
  });

  const layout = [
    ...items.filter((i) => !i.parentId).map((i) => `item:${i.id}`),
    ...folders.map((f) => `folder:${f.id}`),
    ...widgets.map((w) => `widget:${w.id}`),
  ];

  return { items, folders, widgets, layout };
}

export function applyStarter(
  onUpdate: (data: FavoritesData) => void,
  ns = DEFAULT_STORAGE_KEY,
) {
  const data = getStarterData();
  saveFavoritesData(data, ns);
  onUpdate(data);
}

export function resetFavorites(
  onUpdate: (data: FavoritesData) => void,
  ns = DEFAULT_STORAGE_KEY,
) {
  applyStarter(onUpdate, ns);
}
