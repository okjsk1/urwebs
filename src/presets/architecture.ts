import { FavoritesData } from "../types";

// 건축 샘플 즐겨찾기 프리셋
export const ARCHITECTURE_STARTER: FavoritesData = {
  items: [],
  folders: [
    {
      id: "design-ref",
      name: "디자인 레퍼런스",
      items: [
        "1", // archdaily
        "2", // dezeen
        "60", // pinterest
        "3", // wallpaper
      ],
    },
    {
      id: "contest",
      name: "공모전",
      items: [
        // "uinz", // 데이터에 없음
        "KR-D-001", // vmspace
        // "zipggumigi", // 데이터에 없음
      ],
    },
    {
      id: "bim",
      name: "BIM / 모델링",
      items: [
        // "autodesk", // 데이터에 없음
        // "sketchup", // 데이터에 없음
        // "rhino", // 데이터에 없음
        // "enscape", // 데이터에 없음
      ],
    },
    {
      id: "law",
      name: "법규/행정",
      items: [
        // "mois", // 데이터에 없음
        // "lawgo", // 데이터에 없음
        // "klri", // 데이터에 없음
      ],
    },
    {
      id: "tools",
      name: "툴/유틸리티",
      items: [
        "301", // google
        "302", // naver
        "KR-MAP-001", // kakaoMap
      ],
    },
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
      type: "dday",
      title: "D-day",
      position: { x: 4, y: 0 },
      size: { width: 2, height: 2 },
    },
    {
      id: "widget-news",
      type: "news",
      title: "뉴스",
      position: { x: 0, y: 2 },
      size: { width: 4, height: 2 },
    },
  ],
};
