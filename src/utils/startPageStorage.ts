import { FavoritesData, Widget, SortMode, FavoriteItem } from '../types';
import starter from '../data/starter.json';

const DEFAULT_STORAGE_KEY = 'favorites:default';
const FAVORITES_FOLDER_ID = 'favorites';
const FAVORITES_FOLDER_NAME = '즐겨찾기';

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
    if (!raw)
      return {
        items: [],
        folders: [
          { id: FAVORITES_FOLDER_ID, name: FAVORITES_FOLDER_NAME },
        ],
        widgets: [],
        layout: [`folder:${FAVORITES_FOLDER_ID}`],
      };
    const parsed = JSON.parse(raw);

    let items: FavoriteItem[] = [];
    let folders = Array.isArray(parsed.folders)
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

    folders = folders.filter(
      (f, idx, self) => self.findIndex((x) => x.id === f.id) === idx
    );

    if (Array.isArray(parsed.items)) {
      parsed.items.forEach((it: any) => {
        if (typeof it === 'string') items.push({ id: it, parentId: null });
        else if (it && typeof it.id === 'string')
          items.push({ id: it.id, parentId: it.parentId ?? null });
      });
    }

    const seen = new Set<string>();
    items = items.filter((it) => {
      if (seen.has(it.id)) return false;
      seen.add(it.id);
      return true;
    });

    const widgets: Widget[] = Array.isArray(parsed.widgets) ? parsed.widgets : [];
    let layout: string[] = Array.isArray(parsed.layout) ? parsed.layout : [];

    // Ensure favorites folder exists and is placed first
    if (!folders.some((f) => f.id === FAVORITES_FOLDER_ID)) {
      folders = [
        { id: FAVORITES_FOLDER_ID, name: FAVORITES_FOLDER_NAME },
        ...folders,
      ];
    }
    // Move any root items into the favorites folder
    items = items.map((it) => ({
      ...it,
      parentId: it.parentId ?? FAVORITES_FOLDER_ID,
    }));

    // Remove item entries from layout and ensure favorites folder is first
    layout = layout.filter((e) => !e.startsWith('item:'));
    layout = [
      `folder:${FAVORITES_FOLDER_ID}`,
      ...layout.filter((e) => e !== `folder:${FAVORITES_FOLDER_ID}`),
    ];

    return { items, folders, widgets, layout };
  } catch (e) {
    console.error('Failed to load favorites data', e);
    return {
      items: [],
      folders: [{ id: FAVORITES_FOLDER_ID, name: FAVORITES_FOLDER_NAME }],
      widgets: [],
      layout: [`folder:${FAVORITES_FOLDER_ID}`],
    };
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

  let folders = (starterData.folders || []).map((f) => ({
    id: f.id,
    name: f.name,
    color: f.color,
    sortMode: f.sortMode,
  }));

  // Ensure favorites folder exists first
  if (!folders.some((f) => f.id === FAVORITES_FOLDER_ID)) {
    folders = [
      { id: FAVORITES_FOLDER_ID, name: FAVORITES_FOLDER_NAME },
      ...folders,
    ];
  } else {
    folders = [
      folders.find((f) => f.id === FAVORITES_FOLDER_ID)!,
      ...folders.filter((f) => f.id !== FAVORITES_FOLDER_ID),
    ];
  }

  const items: FavoriteItem[] = [];
  (starterData.favorites || []).forEach((id) =>
    items.push({ id, parentId: FAVORITES_FOLDER_ID })
  );
  (starterData.folders || []).forEach((f) => {
    (f.items || []).forEach((wid) =>
      items.push({ id: wid, parentId: f.id })
    );
  });

  const layout = [
    `folder:${FAVORITES_FOLDER_ID}`,
    ...folders
      .filter((f) => f.id !== FAVORITES_FOLDER_ID)
      .map((f) => `folder:${f.id}`),
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
