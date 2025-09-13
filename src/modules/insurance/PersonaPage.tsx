// src/modules/insurance/PersonaPage.tsx
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { FavoritesSectionNew } from "@/components/FavoritesSectionNew";
import { CategoryCard } from "@/components/CategoryCard";
import type { FavoritesData, Website } from "@/types";
import { loadFavoritesData, saveFavoritesData } from "@/utils/startPageStorage";
import { toggleFavorite as toggleFavoriteData } from "@/utils/favorites";
import { siteCatalog } from "./sites";
import { personaBundles } from "./persona-bundles";
import { sortSites } from "./sortSites";

const personaLabels: Record<string, string> = {
  consumer: "개인고객",
  agent: "설계사",
  expert: "전문가",
  corporate: "기업·단체",
  licensePrep: "취업·수험",
  overseas: "해외/유학생",
};

export default function InsurancePersonaPage() {
  const { persona = "" } = useParams<{ persona: string }>();

  const bundle = useMemo(
    () => personaBundles.find((b) => b.persona === persona),
    [persona],
  );

  const websites = useMemo<Website[]>(() => {
    if (!bundle) return [];
    const id2site = Object.fromEntries(siteCatalog.map((s) => [s.id, s]));
    return bundle.siteIds
      .map((id) => id2site[id])
      .filter((s): s is typeof siteCatalog[number] => Boolean(s && s.url))
      .map((s) => ({
        ...s,
        category: "보험",
        categorySlug: "insurance",
      }))
      .sort(sortSites);
  }, [bundle]);

  const storageNamespace = `favorites:insurance-${persona}`;
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
    const label = personaLabels[persona] || persona;
    document.title = `보험 · ${label} | 나의 시작페이지`;
  }, [persona]);

  if (!bundle) return <div className="p-6">잘못된 경로입니다.</div>;

  const toggleFavorite = (id: string) => {
    setFavoritesData((prev) => toggleFavoriteData(prev, id));
  };

  const favoriteIds = favoritesData.items.map((i) => i.id);
  const categoryTitle = `보험 · ${personaLabels[persona] || persona}`;

  return (
    <div className="p-4">
      <div className="mx-auto max-w-[1180px]">
        {favoritesData.items.length > 0 && (
          <FavoritesSectionNew
            favoritesData={favoritesData}
            onUpdateFavorites={setFavoritesData}
          />
        )}
        <h2 className="mt-6 mb-4 text-xl font-bold">{categoryTitle}</h2>
        <div className="grid grid-cols-6 gap-x-2 gap-y-4 min-w-0">
          <CategoryCard
            category="insurance"
            sites={websites}
            config={{ title: "보험" }}
            showDescriptions={true}
            favorites={favoriteIds}
            onToggleFavorite={toggleFavorite}
          />
        </div>
      </div>
    </div>
  );
}

