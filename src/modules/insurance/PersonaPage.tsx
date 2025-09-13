// src/modules/insurance/PersonaPage.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { StartPage } from "@/components/StartPage";
import type { FavoritesData, Website } from "@/types";
import {
  loadFavoritesData,
  saveFavoritesData,
  applyStarter,
  resetFavorites,
} from "@/utils/startPageStorage";
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
  const navigate = useNavigate();

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

  const onApplyStarter = async () => applyStarter(setFavoritesData, storageNamespace);
  const onReset = async () => resetFavorites(setFavoritesData, storageNamespace);

  const categoryTitle = `보험 · ${personaLabels[persona] || persona}`;

  return (
    <StartPage
      favoritesData={favoritesData}
      onUpdateFavorites={setFavoritesData}
      onClose={() => navigate("/")}
      showDescriptions={true}
      pageTitle="나의 시작페이지"
      categoryTitle={categoryTitle}
      websites={websites}
      categoryOrder={["insurance"]}
      categoryConfig={{ insurance: { title: "보험" } }}
      loading={false}
      onApplyStarter={onApplyStarter}
      onReset={onReset}
      showStartGuide={false}
      showDesktop={false}
    />
  );
}

