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
      className="urwebs-website-item grid grid-cols-[20px,1fr,24px] gap-x-2 gap-y-1 items-center px-2 py-2 rounded-md hover:bg-gray-100 focus-within:ring-2 focus-within:ring-blue-400"
      draggable={isDraggable}
      onDragStart={handleDragStart}
    >
      <Favicon domain={website.url} className="w-4 h-4 rounded border shrink-0" />

      <a
        href={website.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full font-medium text-sm text-[var(--main-dark)] focus:outline-none min-w-[10ch] truncate"
        title={website.title}
        onClick={() => trackVisit(website.id)}
      >
        {website.title}
      </a>

      <button
        onClick={handleFavoriteClick}
        aria-label="즐겨찾기"
        className="favorite grid place-items-center w-5 h-5 bg-transparent border-0 cursor-pointer rounded hover:bg-pink-100 shrink-0"
      >
        <svg
          className={`w-3 h-3 urwebs-star-icon ${isFavorite ? "favorited" : ""}`}
          viewBox="0 0 24 24"
          strokeWidth="1"
        >
          <polygon points="12,2 15,8.2 22,9 17,14 18,21 12,18 6,21 7,14 2,9 9,8.2" />
        </svg>
      </button>

      {(website.summary || website.description) && (
        <p className="col-start-2 col-span-2 text-xs leading-snug text-gray-600 dark:text-gray-300 line-clamp-2">
          {website.summary ?? website.description}
        </p>
      )}
    </li>
  );
}
