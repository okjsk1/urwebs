import React from "react";
import { websites, Website } from "../data/websites";
import * as visitTrack from "../utils/visitTrack";

const GLOBAL_TOP20: string[] = [
  "60",
  "1",
  "2",
  "3",
  "5",
  "65",
  "71",
  "KR-D-001",
  "KR-D-002",
  "KR-D-003",
  "KR-D-004",
  "KR-D-006",
  "KR-D-007",
  "KR-D-009",
  "KR-D-010",
  "62",
  "63",
  "145",
  "KR-C-001",
  "61",
];

interface TopListProps {
  mode: "mine" | "global";
  onAddFavorite: (id: string) => void;
}

const safeBuildFrequencyMap: () => Record<string, number> =
  typeof visitTrack.buildFrequencyMap === "function"
    ? visitTrack.buildFrequencyMap
    : () => ({});

export function TopList({ mode, onAddFavorite }: TopListProps) {
  const frequencyMap = React.useMemo(() => {
    if (mode !== "mine") return {};
    return safeBuildFrequencyMap();
  }, [mode]);

  const ids = React.useMemo(() => {
    if (mode === "mine") {
      return Object.entries(frequencyMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([id]) => id);
    }
    return GLOBAL_TOP20;
  }, [mode, frequencyMap]);

  const items = React.useMemo(() => {
    return ids
      .map((id) => websites.find((w) => w.id === id))
      .filter((w): w is Website => Boolean(w));
  }, [ids]);

  const title = mode === "mine" ? "내 TOP 10" : "전체 TOP 20";

  if (items.length === 0) {
    return (
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded">
        <h2 className="font-bold mb-2 text-gray-800 dark:text-gray-100">{title}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          최근 방문 데이터가 부족합니다.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded">
      <h2 className="font-bold mb-2 text-gray-800 dark:text-gray-100">{title}</h2>
      <ul className="space-y-2">
        {items.map((site) => (
          <li key={site.id} className="flex items-center gap-2">
            <img
              src={`https://www.google.com/s2/favicons?domain=${site.url}&sz=16`}
              alt=""
              className="w-4 h-4 flex-shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><rect width="16" height="16" fill="%23e5e7eb"/></svg>';
              }}
            />
            <a
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-sm text-gray-800 dark:text-gray-200 hover:underline"
            >
              {site.title}
            </a>
            <button
              type="button"
              onClick={() => onAddFavorite(site.id)}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              aria-label={`${site.title} 즐겨찾기 추가`}
            >
              [+ 즐겨찾기]
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TopList;
