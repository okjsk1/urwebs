import React from "react";
import { websites, Website } from "../data/websites";
import { FavoritesData } from "../types";
import {
  buildCoOccur,
  suggestByRecent,
  suggestForFolder,
} from "../utils/recommend";
import { buildFrequencyMap } from "../utils/visitTrack";

const SAFE_IDS = ["1", "2", "3", "5", "60", "65", "71", "145"]; // fallback

interface RecommendTrayProps {
  onApplyPreset: (preset: FavoritesData) => void;
}

export function RecommendTray({ onApplyPreset }: RecommendTrayProps) {
  const suggestions = React.useMemo(() => {
    let fav: FavoritesData = { items: [], folders: [], widgets: [] };
    try {
      const raw = localStorage.getItem("urwebs-favorites-v3");
      if (raw) fav = JSON.parse(raw);
    } catch {}
    const favoriteIds = new Set<string>(fav.items);
    fav.folders.forEach((f) => f.items.forEach((id) => favoriteIds.add(id)));

    const freqMap = buildFrequencyMap();
    favoriteIds.forEach((id) => delete freqMap[id]);
    const recent = suggestByRecent(freqMap, 5);

    const coMap = buildCoOccur(fav.folders.map((f) => f.items));
    const folderSuggests = fav.folders.flatMap((f) =>
      suggestForFolder(f.items, coMap, 2)
    );

    const ids = Array.from(
      new Set([...recent, ...folderSuggests].filter((id) => !favoriteIds.has(id)))
    );
    if (ids.length < 6) {
      SAFE_IDS.forEach((id) => {
        if (!favoriteIds.has(id) && !ids.includes(id)) ids.push(id);
      });
    }
    return ids
      .slice(0, 10)
      .map((id) => websites.find((w) => w.id === id))
      .filter((w): w is Website => Boolean(w));
  }, []);

  if (suggestions.length === 0) return null;

  return (
    <div className="max-w-screen-2xl mx-auto px-5 mb-4">
      <h2 className="font-bold mb-2" style={{ color: "var(--main-dark)" }}>
        추천 사이트
      </h2>
      <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
        {suggestions.map((site) => (
          <div
            key={site.id}
            className="p-2 bg-gray-50 dark:bg-gray-800 rounded flex flex-col"
          >
            <a
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-sm text-gray-800 dark:text-gray-200"
            >
              {site.title}
            </a>
            <button
              type="button"
              onClick={() =>
                onApplyPreset({ items: [site.id], folders: [], widgets: [] })
              }
              className="mt-1 text-xs text-blue-600 dark:text-blue-400 self-start hover:underline"
            >
              [담기]
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecommendTray;
