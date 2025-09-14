import { FavoritesData, FavoriteItem, FavoriteFolder } from "../types";

const FAVORITES_FOLDER_ID = "favorites";
const FAVORITES_FOLDER_NAME = "즐겨찾기";

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

  // Ensure favorites folder exists and is first in layout
  if (!newData.folders.some((f) => f.id === FAVORITES_FOLDER_ID)) {
    newData.folders.unshift({
      id: FAVORITES_FOLDER_ID,
      name: FAVORITES_FOLDER_NAME,
    } as FavoriteFolder);
  }
  const folderKey = `folder:${FAVORITES_FOLDER_ID}`;
  newData.layout = [
    folderKey,
    ...(newData.layout || []).filter((e) => e !== folderKey && !e.startsWith("item:")),
  ];

  const index = newData.items.findIndex((i) => i.id === websiteId);
  const isFavorited = index !== -1;

  if (isFavorited) {
    newData.items = newData.items.filter((i) => i.id !== websiteId);
  } else {
    const newItem: FavoriteItem = {
      id: websiteId,
      parentId: FAVORITES_FOLDER_ID,
    };
    newData.items = [newItem, ...newData.items];
  }

  newData.items = newData.items.filter(
    (item, idx, self) => self.findIndex((i) => i.id === item.id) === idx
  );

  return newData;
}
