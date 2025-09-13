import { useEffect, useMemo, useState } from "react";
import { FavoritesSectionNew } from "@/components/FavoritesSectionNew";
import { CategoryCard } from "@/components/CategoryCard";
import type { FavoritesData, Website, CategoryConfigMap } from "@/types";
import { loadFavoritesData, saveFavoritesData } from "@/utils/startPageStorage";
import { toggleFavorite as toggleFavoriteData } from "@/utils/favorites";
import { validateCategoryKeys } from "@/utils/validateCategories";

interface CategoryPageLayoutProps {
  websites: Website[];
  categoryOrder: string[];
  categoryConfig: CategoryConfigMap;
  storageNamespace: string;
  pageTitle: string;
  categoryTitle?: string;
  showDescriptions?: boolean;
  loading?: boolean;
}

export function CategoryPageLayout({
  websites,
  categoryOrder,
  categoryConfig,
  storageNamespace,
  pageTitle,
  categoryTitle,
  showDescriptions = true,
  loading = false,
}: CategoryPageLayoutProps) {
  const [favoritesData, setFavoritesData] = useState<FavoritesData>(() =>
    loadFavoritesData(storageNamespace),
  );

  useEffect(() => {
    setFavoritesData(loadFavoritesData(storageNamespace));
  }, [storageNamespace]);

  useEffect(() => {
    saveFavoritesData(favoritesData, storageNamespace);
  }, [favoritesData, storageNamespace]);

  useEffect(() => {
    document.title = categoryTitle
      ? `${categoryTitle} | ${pageTitle}`
      : pageTitle;
  }, [categoryTitle, pageTitle]);

  const categorizedWebsites = useMemo(() => {
    const acc: Record<string, Website[]> = {};
    categoryOrder.forEach((slug) => {
      const name = categoryConfig[slug]?.title ?? slug;
      acc[slug] = websites.filter(
        (site) => site.category === name || site.categorySlug === slug,
      );
    });
    return acc;
  }, [websites, categoryOrder, categoryConfig]);
  useEffect(() => {
    validateCategoryKeys(websites, categoryConfig, categoryOrder);
  }, [websites, categoryConfig, categoryOrder]);

  if (loading) return <div className="p-6">로딩 중…</div>;

  const toggleFavorite = (id: string) => {
    setFavoritesData((prev) => toggleFavoriteData(prev, id));
  };
  const favoriteIds = favoritesData.items.map((i) => i.id);

  return (
    <div className="p-4">
      <div className="mx-auto max-w-[1180px]">
        {favoritesData.items.length > 0 && (
          <FavoritesSectionNew
            favoritesData={favoritesData}
            onUpdateFavorites={setFavoritesData}
          />
        )}
        {categoryTitle && (
          <h2 className="mt-6 mb-4 text-xl font-bold">{categoryTitle}</h2>
        )}
        <div className="grid grid-cols-6 gap-x-2 gap-y-4 min-w-0">
          {categoryOrder.map((slug) => (
            <CategoryCard
              key={slug}
              category={categoryConfig[slug]?.title ?? slug}
              sites={categorizedWebsites[slug] || []}
              config={categoryConfig[slug]}
              showDescriptions={showDescriptions}
              favorites={favoriteIds}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default CategoryPageLayout;
