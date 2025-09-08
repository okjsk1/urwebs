import React from "react";
import { Website } from "../types";
import { trackVisit } from "../utils/visitTrack";
import { Favicon } from "./Favicon";

interface WebsiteItemProps {
  website: Website;
  isFavorited: boolean;
  onToggleFavorite: (id: string) => void;
  isDraggable?: boolean;
  onDragStart: (e: React.DragEvent, website: Website) => void;
  showDescriptions: boolean;
}

export function WebsiteItem({
  website,
  isFavorited,
  onToggleFavorite,
  isDraggable = false,
  onDragStart,
  showDescriptions,
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
      className="urwebs-website-item relative flex items-center min-h-9 rounded-md min-w-0 hover:bg-gray-100 focus-within:ring-2 focus-within:ring-blue-400"
      draggable={isDraggable}
      onDragStart={handleDragStart}
    >
      <button
        onClick={handleFavoriteClick}
        aria-label="즐겨찾기"
        className="favorite absolute top-1 right-1 w-5 h-5 grid place-items-center bg-transparent border-0 cursor-pointer rounded transition-colors hover:bg-pink-100"
      >
        <svg
          className={`w-3 h-3 urwebs-star-icon ${isFavorited ? "favorited" : ""}`}
          viewBox="0 0 24 24"
          strokeWidth="1"
        >
          <polygon points="12,2 15,8 22,9 17,14 18,21 12,18 6,21 7,14 2,9 9,8"></polygon>
        </svg>
      </button>

      <div className="left flex items-center gap-2 min-w-0 flex-1">
        <Favicon domain={website.url} className="w-4 h-4 rounded border shrink-0" />
        <div className="min-w-0 flex-1 pr-2">
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

          {showDescriptions && (website.summary || website.description) && (
            <div className="mt-2 space-y-1">
              {website.summary && (
                <div
                  className="pl-1 font-medium"
                  style={{
                    fontSize: "10px",
                    color: "var(--sub-text)",
                    lineHeight: 1.4,
                    wordBreak: "break-word",
                  }}
                >
                  📝 {website.summary}
                </div>
              )}
              {website.description && (
                <div
                  className="pl-1"
                  style={{
                    fontSize: "9px",
                    color: "var(--sub-text)",
                    lineHeight: 1.45,
                    wordBreak: "break-word",
                  }}
                >
                  {website.description}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </li>
  );
}
