import React from "react";
import { Website } from "../types";
import { trackVisit } from "../utils/visitTrack";
import { Favicon } from "./Favicon";

interface WebsiteItemProps {
  website: Website;
  isFavorited: boolean;
  showDescription: boolean;
  onToggleFavorite: (id: string) => void;
  isDraggable?: boolean;
  onDragStart: (e: React.DragEvent, website: Website) => void;
}

export function WebsiteItem({
  website,
  isFavorited,
  showDescription,
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
    onDragStart(e, website);
  };

  return (
    <li
      className="urwebs-website-item relative flex flex-col min-h-9 rounded-md min-w-0 hover:bg-gray-100 focus-within:ring-2 focus-within:ring-blue-400"
      style={{ height: showDescription ? "auto" : undefined }}
      draggable={isDraggable}
      onDragStart={handleDragStart}
    >
      <div className="flex items-center justify-between gap-2 w-full">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Favicon domain={website.url} className="w-4 h-4 rounded border shrink-0" />
          <a
            href={website.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block truncate text-[var(--main-dark)] focus:outline-none"
            style={{ fontSize: "12.5px" }}
            title={website.title}
            onClick={() => trackVisit(website.id)}
          >
            {website.title}
          </a>
        </div>

        <button
          onClick={handleFavoriteClick}
          aria-label="즐겨찾기"
          className="favorite w-5 h-5 flex items-center justify-center bg-transparent border-0 cursor-pointer rounded transition-colors hover:bg-pink-100"
          type="button"
        >
          <svg
            className={`w-3 h-3 urwebs-star-icon ${isFavorited ? "favorited" : ""}`}
            viewBox="0 0 24 24"
            strokeWidth="1"
          >
            <polygon points="12,2 15,8 22,9 17,14 18,21 12,18 6,21 7,14 2,9 9,8" />
          </svg>
        </button>
      </div>

      {showDescription && (website.summary || website.description) && (
        <div
          className="mt-1 pl-6 pr-2"
          style={{
            fontSize: "10px",
            color: "var(--sub-text)",
            lineHeight: 1.4,
            wordBreak: "break-word",
          }}
        >
          {website.summary ?? website.description}
        </div>
      )}
    </li>
  );
}
