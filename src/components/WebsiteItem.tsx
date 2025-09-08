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

  const summaryOrDesc = website.summary || website.description;

  return (
    <li
      className="urwebs-website-item relative px-2 py-2 rounded-md hover:bg-gray-100 focus-within:ring-2 focus-within:ring-blue-400"
      draggable={isDraggable}
      onDragStart={handleDragStart}
    >
      <div className="flex items-center gap-2 min-w-0">
        <Favicon domain={website.url} className="w-4 h-4 rounded border shrink-0" />
        <a
          href={website.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block truncate text-[var(--main-dark)] focus:outline-none pr-8 min-w-0 flex-1"
          title={website.title}
          onClick={() => trackVisit(website.id)}
        >
          {website.title}
        </a>
        <button
          onClick={handleFavoriteClick}
          aria-label="즐겨찾기"
          className="favorite absolute top-2 right-2 grid place-items-center w-5 h-5 bg-transparent border-0 cursor-pointer rounded hover:bg-pink-100"
        >
          <svg className={`w-3 h-3 urwebs-star-icon ${isFavorite ? "favorited" : ""}`} viewBox="0 0 24 24" strokeWidth="1">
            <polygon points="12,2 15,8.2 22,9 17,14 18,21 12,18 6,21 7,14 2,9 9,8.2" />
          </svg>
        </button>
      </div>

      {summaryOrDesc && (
        <div className="mt-1 text-xs leading-snug opacity-80 pl-6">
          {website.summary ?? website.description}
        </div>
      )}
    </li>
  );
}
