import React from "react";
import { Website, CategoryConfig } from "../types";
import { WebsiteItem } from "./WebsiteItem"; // WebsiteItem 컴포넌트를 가져옵니다.

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
  // 설명 보기가 활성화되어있으면 모든 사이트 표시, 아니면 기본 개수만 표시
  const displaySites = showDescriptions ? sites : (isExpanded ? sites : sites.slice(0, 4));
  const hasMore = sites.length > 4;

  return (
    <div
      className="sfu-category-card flex flex-col gap-2 p-3 min-w-0" // 커스텀 CSS와 flexbox를 사용하여 카드 스타일을 지정합니다.
      style={{
        // 설명 보기 모드이거나 확장된 경우 높이를 자동으로 조정
        height: (showDescriptions || isExpanded) ? "auto" : "180px",
        minHeight: "180px",
        maxHeight: (showDescriptions || isExpanded) ? "500px" : "180px"
      }}
    >
      {/* 카드 높이와 스크롤을 확장 상태에 따라 동적으로 조절합니다. */}
      <div className="flex items-center gap-3 mb-1">
        <div className="flex items-center justify-center gap-3 mb-0.5">
          <span
            style={{ fontSize: "0.9rem" }}
            className="flex-shrink-0"
          >
            {config.icon} {/* 카테고리 아이콘을 표시합니다. */}
          </span>
          <span
            style={{
              fontSize: "1.1rem",
              color: "var(--main-point)",
              letterSpacing: "0.01em",
            }}
          >
            {category} {/* 카테고리 제목을 표시합니다. */}
          </span>
        </div>
      </div>

      <div
        className={`flex-1 flex flex-col ${isExpanded || showDescriptions ? "overflow-y-auto" : "overflow-hidden"}`}
      >
        {/* 확장 상태나 설명 보기 상태에 따라 스크롤 동작을 제어합니다. */}
        <div className={`flex flex-col gap-0.5 ${isExpanded || showDescriptions ? "max-h-80 overflow-y-auto" : ""}`}>
          {sites.length === 0 ? (
            <div className="flex items-center justify-center flex-1 text-gray-500 text-xs">
              모든 사이트가 즐겨찾기에 추가됨
            </div>
            /* 사이트가 없으면 이 메시지를 표시합니다. */
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
            onClick={() => onToggleCategory(category)} // 클릭 시 카테고리 확장/축소 함수를 호출합니다.
            className="sfu-more-btn mt-1 px-2 py-0.5 text-xs"
          >
            {isExpanded
              ? "▲ 접기"
              : `▼ 더보기 (${sites.length}개)`}
            {/* 확장 상태에 따라 버튼 텍스트를 변경합니다. 설명 보기 모드에서는 더보기 버튼 숨김 */}
          </button>
        )}
      </div>
    </div>
  );
}