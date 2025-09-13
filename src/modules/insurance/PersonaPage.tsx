// src/modules/insurance/PersonaPage.tsx
import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { CategoryPageLayout } from "@/components/CategoryPageLayout";
import type { Website } from "@/types";
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
  const categoryTitle = `보험 · ${personaLabels[persona] || persona}`;

  if (!bundle) return <div className="p-6">잘못된 경로입니다.</div>;

  return (
    <CategoryPageLayout
      websites={websites}
      categoryOrder={["insurance"]}
      categoryConfig={{ insurance: { title: "보험" } }}
      storageNamespace={storageNamespace}
      pageTitle="나의 시작페이지"
      categoryTitle={categoryTitle}
      showDescriptions={true}
    />
  );
}

