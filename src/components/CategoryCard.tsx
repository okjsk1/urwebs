import React from "react";
import { Website, CategoryConfig } from "../types";
import { WebsiteItem } from "./WebsiteItem";

interface CategoryCardProps {
  category: string;
  sites: Website[];
  config: CategoryConfig;
  isExpanded: boolean;
  showDescriptions: boolean;
  favorites: string[];
  onToggleCategory: (category: string) => void;
  onToggleFavorite: (id: string) => void;
}

export function CategoryCard({
  category,
  sites,
  config,
  isExpanded,
  showDescriptions,
  favorites,
  onToggleCategory,
  onToggleFavorite,
}: CategoryCardProps) {
  // 설명 보기가 활성화되어 있으면 전체, 아니면 4개만 표시 (확장 시 전체)
  const displaySites = showDescriptions ? sites : (isExpanded ? sites : sites.slice(0, 4));
  const hasMore = sites.length > 4;

  return (
    <div
      className="urwebs-category-card flex flex-col gap-2 p-3 min-w-0"
      style={{
        height: showDescriptions || isExpanded ? "auto" : "180px",
        minHeight: "180px",
        maxHeight: showDescriptions || isExpanded ? "500px" : "180px",
      }}
    >
      <div className="flex items-center gap-3 mb-1">
        <div className="flex items-center justify-center gap-3 mb-0.5">
          <span style={{ fontSize: "0.9rem" }} className="flex-shrink-0">
            {config.icon}
          </span>
          <span
            style={{
              fontSize: "1.1rem",
              color: "var(--main-point)",
              letterSpacing: "0.01em",
            }}
          >
            {category}
          </span>
        </div>
      </div>

      <div className={`flex-1 flex flex-col ${isExpanded || showDescriptions ? "overflow-y-auto" : "overflow-hidden"}`}>
        <div className={`flex flex-col gap-0.5 ${isExpanded || showDescriptions ? "max-h-80 overflow-y-auto" : ""}`}>
          {sites.length === 0 ? (
            <div className="flex items-center justify-center flex-1 text-gray-500 text-xs">
              모든 사이트가 즐겨찾기에 추가됨
            </div>
          ) : (
            displaySites.map((website) => (
              <WebsiteItem
                key={website.id}
                website={website}
                isDraggable={false}
                isFavorited={favorites.includes(website.id)}
                onToggleFavorite={onToggleFavorite}
                showDescription={showDescriptions}
              />
            ))
          )}
        </div>

        {hasMore && !showDescriptions && (
          <button
            onClick={() => onToggleCategory(category)}
            className="urwebs-more-btn mt-1 px-2 py-0.5 text-xs"
          >
            {isExpanded ? "▲ 접기" : `▼ 더보기 (${sites.length}개)`}
          </button>
        )}
      </div>
    </div>
  );
}
