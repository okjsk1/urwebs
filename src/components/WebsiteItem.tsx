import React from "react";
import { Website } from "../types";
import { trackVisit } from "../utils/visitTrack";

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
    <div
      className="urwebs-website-item flex items-center gap-2 px-2 min-h-9 rounded-md min-w-0 flex-1 overflow-hidden hover:bg-gray-100 focus-within:ring-2 focus-within:ring-blue-400"
      style={{ height: showDescription ? "auto" : undefined }}
      draggable={isDraggable}
      onDragStart={handleDragStart}
    >
      <img
        src={`https://www.google.com/s2/favicons?domain=${website.url}&sz=84`}
        alt=""
        className="w-4 h-4 rounded border flex-shrink-0"
        style={{ backgroundColor: "#f7f7f7", borderColor: "#ededed" }}
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src =
            'data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\"><rect width=\"16\" height=\"16\" fill=\"%23e5e7eb\"/></svg>';
        }}
      />

      <div className="flex-1 min-w-0">
        <a
          href={website.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-sm text-[var(--main-dark)] truncate focus:outline-none"
          title={!showDescription ? website.description : undefined}
          onClick={() => trackVisit(website.id)}
        >
          {website.title}
        </a>

        {showDescription && (
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
          </div>
        )}
      </div>

      <button
        onClick={handleFavoriteClick}
        className="ml-auto bg-transparent border-0 p-1 flex items-center cursor-pointer rounded transition-colors hover:bg-pink-100"
        aria-label="즐겨찾기"
      >
        <svg
          className={`w-3 h-3 urwebs-star-icon ${isFavorited ? "favorited" : ""}`}
          viewBox="0 0 24 24"
          strokeWidth="1"
        >
          <polygon points="12,2 15,8 22,9 17,14 18,21 12,18 6,21 7,14 2,9 9,8"></polygon>
        </svg>
      </button>
    </div>
  );
}

