import { FavoritesData } from "../types";

export function toggleFavorite(data: FavoritesData, websiteId: string): FavoritesData {
  const newData: FavoritesData = {
    items: data.items ? [...data.items] : [],
    folders: data.folders ? data.folders.map(f => ({ ...f, items: [...(f.items || [])] })) : [],
    widgets: data.widgets ? [...data.widgets] : [],
    layout: data.layout ? [...data.layout] : [],
  };

  const allIds = [
    ...newData.items,
    ...(newData.folders || []).flatMap(f => f.items || []),
  ];
  const isFavorited = allIds.includes(websiteId);

  if (isFavorited) {
    newData.items = newData.items.filter(id => id !== websiteId);
    newData.folders = (newData.folders || []).map(folder => ({
      ...folder,
      items: (folder.items || []).filter(id => id !== websiteId),
    }));
    newData.layout = (newData.layout || []).filter(entry => entry !== `item:${websiteId}`);
  } else {
    newData.items = [...(newData.items || []), websiteId];
    newData.layout = [...(newData.layout || []), `item:${websiteId}`];
  }

  return newData;
}
