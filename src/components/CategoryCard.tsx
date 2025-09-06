import React, { useState, useRef, useEffect, useCallback } from "react";
import { Website, CategoryConfig } from "../types";
import { WebsiteItem } from "./WebsiteItem";

interface CategoryCardProps {
  category: string;
  sites: Website[];
  config: CategoryConfig;
  showDescriptions: boolean;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
}

export function CategoryCard({
  category,
  sites,
  config,
  showDescriptions,
  favorites,
  onToggleFavorite,
}: CategoryCardProps) {
  const safeSites = Array.isArray(sites) ? sites : [];
  const [visibleCount, setVisibleCount] = useState(6);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  const loadMore = useCallback(() => {
    if (loading || visibleCount >= safeSites.length) return;
    setLoading(true);
    setTimeout(() => {
      setVisibleCount((prev) => {
        if (prev < 10) return Math.min(10, safeSites.length);
        return Math.min(prev + 10, safeSites.length);
      });
      setLoading(false);
    }, 500);
  }, [loading, visibleCount, safeSites.length]);

  useEffect(() => {
    if (!initialized) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        loadMore();
      }
    });
    const current = loaderRef.current;
    if (current) observer.observe(current);
    return () => {
      observer.disconnect();
    };
  }, [initialized, loadMore]);

  const handleFirstMore = () => {
    setInitialized(true);
    loadMore();
  };

  const displaySites = showDescriptions
    ? safeSites
    : safeSites.slice(0, visibleCount);
  const hasMore = visibleCount < safeSites.length;

  return (
    <div className="urwebs-category-card flex flex-col border rounded-lg shadow-sm h-full">
      <div className="flex items-center gap-3 px-4 py-4">
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

      {/* 사이트 목록 영역 */}
      <div className="flex-1 flex flex-col min-h-0 px-4 pb-4">
        <div className="flex flex-col gap-0.5 overflow-y-auto">
          {safeSites.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-gray-500 text-xs">
              <span className="text-base mb-2">📭</span>
              <span>사이트가 없습니다</span>
            </div>
          ) : (
            <>
              {displaySites.map((website) => (
                <WebsiteItem
                  key={website.id}
                  website={website}
                  isDraggable={false}
                  isFavorited={favorites.includes(website.id)}
                  onToggleFavorite={onToggleFavorite}
                  showDescription={showDescriptions}
                />
              ))}
              {loading &&
                Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={`skeleton-${i}`}
                    className="h-5 bg-gray-200 rounded animate-pulse"
                  />
                ))}
            </>
          )}
          <div ref={loaderRef} />
        </div>

        {hasMore && !initialized && !showDescriptions && (
          <button
            onClick={handleFirstMore}
            className="urwebs-more-btn mt-2 px-2 py-1 text-xs self-center"
            aria-label="더보기"
          >
            ▼ 더보기 ({safeSites.length}개)
          </button>
        )}
      </div>
    </div>
  );
}
