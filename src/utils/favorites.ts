import { FavoritesData, FavoriteItem } from "../types";

export function toggleFavorite(
  data: FavoritesData,
  websiteId: string
): FavoritesData {
  const newData: FavoritesData = {
    items: data.items ? data.items.map((i) => ({ ...i })) : [],
    folders: data.folders ? data.folders.map((f) => ({ ...f })) : [],
    widgets: data.widgets ? data.widgets.map((w) => ({ ...w })) : [],
    layout: data.layout ? [...data.layout] : [],
  };

  const index = newData.items.findIndex((i) => i.id === websiteId);
  const isFavorited = index !== -1;

  if (isFavorited) {
    newData.items = newData.items.filter((i) => i.id !== websiteId);
    newData.layout = (newData.layout || []).filter(
      (entry) => entry !== `item:${websiteId}`
    );
  } else {
    const newItem: FavoriteItem = { id: websiteId, parentId: null };
    // Insert the new favorite at the beginning of items and layout
    newData.items = [newItem, ...newData.items];
    newData.layout = [`item:${websiteId}`, ...(newData.layout || [])];
  }

  return newData;
}
