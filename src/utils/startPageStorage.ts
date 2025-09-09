import { FavoritesData, Widget, SortMode } from '../types';
import starter from '../data/starter.json';

const STORAGE_KEY = 'urwebs-favorites-v3';

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

export function loadFavoritesData(): FavoritesData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { items: [], folders: [], widgets: [] };
  } catch (e) {
    console.error('Failed to load favorites data', e);
    return { items: [], folders: [], widgets: [] };
  }
}

export function saveFavoritesData(data: FavoritesData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
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
    items: f.items || [],
    color: f.color,
    sortMode: f.sortMode,
  }));
  return { items: starterData.favorites || [], folders, widgets };
}

export function applyStarter(onUpdate: (data: FavoritesData) => void) {
  const data = getStarterData();
  saveFavoritesData(data);
  onUpdate(data);
}

export function resetFavorites(onUpdate: (data: FavoritesData) => void) {
  applyStarter(onUpdate);
}
