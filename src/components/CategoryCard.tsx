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
  // 설명 보기가 활성화되어 있으면 전체, 아니면 6개만 표시 (확장 시 전체)
  const displaySites = showDescriptions ? sites : (isExpanded ? sites : sites.slice(0, 6));
  const hasMore = sites.length > 6;

  const listClasses =
    isExpanded || showDescriptions
      ? `${showDescriptions ? "max-h-80" : "max-h-56"} overflow-y-auto`
      : "";

  return (
    <div
      className="urwebs-category-card flex flex-col gap-2 p-3 min-w-0"
      style={{
        height: showDescriptions || isExpanded ? "auto" : "220px",
        minHeight: "220px",
        maxHeight: showDescriptions || isExpanded ? "500px" : "220px",
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

      {/* 사이트 목록 영역 */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className={`flex flex-col gap-0.5 ${listClasses}`}>
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
