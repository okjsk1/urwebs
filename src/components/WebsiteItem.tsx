import React from "react";
import { Website } from "../types";
import { trackVisit } from "../utils/visitTrack";
import { Favicon } from "./Favicon";

interface WebsiteItemProps {
  website: Website;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  isDraggable?: boolean;
  onDragStart?: (e: React.DragEvent, website: Website) => void;
}

export function WebsiteItem({
  website,
  isFavorite,
  onToggleFavorite,
  isDraggable = false,
  onDragStart,
}: WebsiteItemProps) {
  if (!website?.url || !website?.title) return null;

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavorite(website.id);
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("websiteId", website.id);
    onDragStart?.(e, website);
  };

  return (
    <li
      className="urwebs-website-item px-2 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800 focus-within:ring-2 focus-within:ring-blue-400"
      draggable={isDraggable}
      onDragStart={handleDragStart}
    >
      <div className="grid grid-cols-[20px_1fr_24px] items-start gap-x-2 min-w-0">
        <Favicon
          domain={website.url}
          className="w-5 h-5 rounded border col-start-1 row-start-1 justify-self-start self-center"
        />

        <a
          href={website.url}
          target="_blank"
          rel="noopener noreferrer"
          title={website.title}
          onClick={() => trackVisit(website.id)}
          className="col-start-2 row-start-1 block font-medium text-sm text-zinc-900 dark:text-zinc-100 min-w-0 truncate [min-width:10ch] focus:outline-none"
        >
          {website.title}
        </a>

        <button
          onClick={handleFavoriteClick}
          aria-label="즐겨찾기"
          className="col-start-3 row-start-1 justify-self-end self-start w-6 h-6 grid place-items-center rounded hover:bg-pink-100 dark:hover:bg-zinc-700"
        >
          <svg
            className={`w-4 h-4 urwebs-star-icon ${isFavorite ? "favorited" : ""}`}
            viewBox="0 0 24 24"
            strokeWidth="1"
          >
            <polygon points="12,2 15,8.2 22,9 17,14 18,21 12,18 6,21 7,14 2,9 9,8.2" />
          </svg>
        </button>

        {(website.summary || website.description) && (
          <p className="col-start-2 col-span-2 row-start-2 mt-1 text-xs leading-snug text-zinc-700 dark:text-zinc-300 min-w-0 line-clamp-2">
            {website.summary ?? website.description}
          </p>
        )}
      </div>
    </li>
  );
}
