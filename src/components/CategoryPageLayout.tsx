import { useEffect, useMemo } from "react";
import { CategoryCard } from "@/components/CategoryCard";
import type { Website, CategoryConfigMap } from "@/types";
import { validateCategoryKeys } from "@/utils/validateCategories";

interface CategoryPageLayoutProps {
  websites: Website[];
  categoryOrder: string[];
  categoryConfig: CategoryConfigMap;
  pageTitle: string;
  categoryTitle?: string;
  showDescriptions?: boolean;
  loading?: boolean;
}

export function CategoryPageLayout({
  websites,
  categoryOrder,
  categoryConfig,

  storageNamespace: _storageNamespace,

  pageTitle,
  categoryTitle,
  showDescriptions = true,
  loading = false,
}: CategoryPageLayoutProps) {

  void _storageNamespace;


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

  return (
    <div className="p-4">
      <div className="mx-auto max-w-[1180px]">
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
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default CategoryPageLayout;
