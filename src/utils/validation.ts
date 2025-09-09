import { FavoritesData, CustomSite, FavoriteFolder, Widget } from "../types";

function isStringArray(arr: any): arr is string[] {
  return Array.isArray(arr) && arr.every((v) => typeof v === "string");
}

function parseFolders(data: any): FavoriteFolder[] {
  if (!Array.isArray(data)) return [];
  return data
    .filter((f) => f && typeof f.id === "string" && typeof f.name === "string")
    .map((f) => ({
      id: String(f.id),
      name: String(f.name),
      items: isStringArray(f.items) ? f.items : [],
      color: typeof f.color === "string" ? f.color : undefined,
      sortMode: typeof f.sortMode === "string" ? f.sortMode : undefined,
      position:
        f.position && typeof f.position.x === "number" && typeof f.position.y === "number"
          ? { x: f.position.x, y: f.position.y }
          : { x: 0, y: 0 },
    }));
}

function parseWidgets(data: any): Widget[] {
  if (!Array.isArray(data)) return [];
  return data
    .filter((w) => w && typeof w.id === "string" && typeof w.type === "string")
    .map((w) => ({
      id: String(w.id),
      type: String(w.type),
      title: typeof w.title === "string" ? w.title : "",
      data: w.data,
      position:
        w.position && typeof w.position.x === "number" && typeof w.position.y === "number"
          ? { x: w.position.x, y: w.position.y }
          : { x: 0, y: 0 },
      size:
        w.size && typeof w.size.width === "number" && typeof w.size.height === "number"
          ? { width: w.size.width, height: w.size.height }
          : { width: 1, height: 1 },
    }));
}

export function parseFavoritesData(data: unknown): FavoritesData {
  if (typeof data === "object" && data !== null) {
    const obj: any = data;
    return {
      items: isStringArray(obj.items) ? obj.items : [],
      folders: parseFolders(obj.folders),
      widgets: parseWidgets(obj.widgets),
      itemsSortMode: typeof obj.itemsSortMode === "string" ? obj.itemsSortMode : undefined,
    };
  }
  return { items: [], folders: [], widgets: [] };
}

export function parseCustomSites(data: unknown): CustomSite[] {
  if (!Array.isArray(data)) return [];
  return data
    .filter(
      (s) =>
        s &&
        typeof s.id === "string" &&
        typeof s.title === "string" &&
        typeof s.url === "string" &&
        typeof s.category === "string"
    )
    .map((s: any) => ({
      id: s.id,
      title: s.title,
      url: s.url,
      description: typeof s.description === "string" ? s.description : undefined,
      category: s.category,
      isCustom: typeof s.isCustom === "boolean" ? s.isCustom : undefined,
    }));
}
