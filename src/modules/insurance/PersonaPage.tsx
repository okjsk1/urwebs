import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { siteCatalog } from "./sites";
import { personaBundles } from "./persona-bundles";
import { sortSites } from "./sortSites";
// TODO: 실제 URL 채우기, 퍼소나 세분화, 배지 색상 매핑 등 개선 필요

// ★ 기존 카드 컴포넌트/스타일을 그대로 재사용하세요.
//    props는 title/url/description/id/sourceType만 맞춰 주면 됩니다.
import { CategoryCard } from "@/components/CategoryCard"; // 이미 있는 카드(별/메모 버튼 포함 가정)

export default function InsurancePersonaPage() {
  const { persona } = useParams();
  const bundle = useMemo(() => personaBundles.find(b => b.persona === persona), [persona]);
  const id2site = useMemo(() => Object.fromEntries(siteCatalog.map(s => [s.id, s])), []);

  if (!bundle) return <div className="p-6">잘못된 경로입니다.</div>;
  const sites = bundle.siteIds.map(id => id2site[id]).filter(Boolean).sort(sortSites);

  return (
    <div className="mx-auto max-w-6xl px-4">
      <h1 className="text-xl font-bold my-4">보험 · {String(persona)}</h1>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sites.map(s => (
          <CategoryCard
            key={s.id}
            id={s.id}
            title={s.title}
            url={s.url || undefined}
            description={s.description}
            badge={s.sourceType}
          />
        ))}
      </div>
    </div>
  );
}
