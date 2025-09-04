import { FavoritesData } from "../types";

// 건축 샘플 즐겨찾기 프리셋
export const ARCHITECTURE_STARTER: FavoritesData = {
  items: ["archi-home", "archi-news"],
  folders: [
    { id: "design-ref", name: "디자인 레퍼런스", items: [] },
    { id: "contest", name: "공모전", items: [] },
    { id: "bim", name: "BIM/모델링", items: [] },
    { id: "law", name: "법규/행정", items: [] },
    { id: "tools", name: "툴/유틸리티", items: [] },
  ],
  widgets: [
    {
      id: "widget-weather",
      type: "weather",
      title: "날씨",
      position: { x: 0, y: 0 },
      size: { width: 2, height: 2 },
    },
    {
      id: "widget-todo",
      type: "todo",
      title: "할 일",
      position: { x: 2, y: 0 },
      size: { width: 2, height: 2 },
    },
    {
      id: "widget-dday",
      type: "dday" as any,
      title: "D-day",
      position: { x: 4, y: 0 },
      size: { width: 2, height: 2 },
    },
    {
      id: "widget-news",
      type: "news" as any,
      title: "뉴스",
      position: { x: 0, y: 2 },
      size: { width: 4, height: 2 },
    },
  ],
};
