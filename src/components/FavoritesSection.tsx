import React from "react";
import { Website } from "../types";
import { SiteIcon } from "./SiteIcon";
import { websites } from "../data/websites";

interface FavoritesSectionProps {
  favorites: string[];
  onRemoveFavorite: (id: string) => void;
  onReorderFavorites: (newFavorites: string[]) => void;
}

export function FavoritesSection({
  favorites,
  onRemoveFavorite,
  onReorderFavorites,
}: FavoritesSectionProps) {
  if (favorites.length === 0) return null;

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    (e.currentTarget as HTMLElement).style.background = "#fffde4";
  };

  const handleDragLeave = (e: React.DragEvent) => {
    (e.currentTarget as HTMLElement).style.background = "";
  };

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    (e.currentTarget as HTMLElement).style.background = "";
    const fromIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);

    if (fromIndex !== toIndex) {
      const newFavorites = [...favorites];
      const moved = newFavorites.splice(fromIndex, 1)[0];
      newFavorites.splice(toIndex, 0, moved);
      onReorderFavorites(newFavorites);
    }
  };

  return (
    <div
      className="px-5 py-8 bg-gray-50 border-b-2"
      style={{ borderColor: "var(--border-urwebs)", backgroundColor: "var(--soft-bg)" }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2
          className="flex items-center gap-3"
          style={{ fontSize: "1.13rem", color: "var(--main-point)" }}
        >
          📁 내 즐겨찾기
        </h2>
      </div>

      <div className="flex flex-col gap-3 pb-2">
        {favorites.map((websiteId, index) => {
          const website = websites.find((w) => w.id === websiteId);
          if (!website) return null;

          return (
            <div
              key={websiteId}
              className="urwebs-favorite-item p-2 min-w-0 w-full overflow-hidden"
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
            >
              <div className="left flex items-center gap-2 min-w-0 flex-1">
                <SiteIcon website={website} size={16} className="w-4 h-4 flex-shrink-0" />
                <a
                  href={website.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-decoration-none"
                  style={{
                    color: "#47340a",
                    fontSize: "14px",
                    letterSpacing: "0.01em",
                  }}
                >
                  {website.title}
                </a>
              </div>
              <button
                onClick={() => onRemoveFavorite(website.id)}
                className="favorite ml-auto p-1 bg-transparent border-0 cursor-pointer transition-colors"
                style={{
                  fontSize: "14px",
                  color: "var(--main-point)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#c94060")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--main-point)")}
                aria-label="즐겨찾기 제거"
              >
                ⭐
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
