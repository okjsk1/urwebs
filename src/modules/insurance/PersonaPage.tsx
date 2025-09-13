import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { siteCatalog } from "./sites";
import { personaBundles } from "./persona-bundles";
import { sortSites } from "./sortSites";
import "./categoryConfig"; // 보험 카테고리 아이콘을 런타임 등록(부작용 import)

// ★ 기존 카드 컴포넌트/스타일을 그대로 재사용합니다.
//    프로젝트별 시그니처 차이를 흡수하기 위해 두 가지 사용 방식을 모두 지원합니다.
import { CategoryCard } from "@/components/CategoryCard";

// sourceType → 이모지(선택)
const typeIcon: Record<string, string> = {
  public: "🏛️",
  association: "🏢",
  insurer: "🏦",
  compare: "🔍",
  edu: "📚",
  stats: "📊",
  tool: "🧰",
  community: "👥",
};

export default function InsurancePersonaPage() {
  const { persona } = useParams();
  const bundle = useMemo(() => personaBundles.find(b => b.persona === persona), [persona]);
  const id2site = useMemo(() => Object.fromEntries(siteCatalog.map(s => [s.id, s])), []);

  if (!bundle) return <div className="p-6">잘못된 경로입니다.</div>;

  const sites = bundle.siteIds
    .map(id => id2site[id])
    .filter((x): x is NonNullable<typeof x> => Boolean(x))
    .sort(sortSites);

  return (
    <div className="mx-auto max-w-6xl px-4">
      <h1 className="text-xl font-bold my-4">보험 · {String(persona)}</h1>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sites.map((s) => {
          // A) CategoryCard가 website 객체 1개를 받는 시그니처인 경우를 우선 시도
          const anyCard: any = CategoryCard as any;
          const acceptsWebsite = !!(anyCard?.length === 1 || anyCard?.name?.toLowerCase?.().includes("website"));

          if (acceptsWebsite) {
            const websiteLike = {
              id: s.id,
              category: "보험",               // ★ icon 매핑용
              title: s.title,
              url: s.url || undefined,       // 빈 URL 가드
              description: s.description,
            };
            return <CategoryCard key={s.id} website={websiteLike} badge={s.sourceType} icon={typeIcon[s.sourceType]} />;
          }

          // B) 개별 props 시그니처
          return (
            <CategoryCard
              key={s.id}
              id={s.id}
              category="보험"                 // ★ 필수
              title={s.title}
              url={s.url || undefined}       // 빈 URL 가드
              description={s.description}
              // 아래 두 prop은 컴포넌트가 지원할 때만 사용됨(정의 안 되어 있으면 무시)
              badge={(s as any).sourceType}
              icon={typeIcon[(s as any).sourceType]}
            />
          );
        })}
      </div>
    </div>
  );
}
