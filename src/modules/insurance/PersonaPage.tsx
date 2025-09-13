import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { siteCatalog } from "./sites";
import { personaBundles } from "./persona-bundles";
import { sortSites } from "./sortSites";
import { SiteCard } from "./SiteCard";

export default function InsurancePersonaPage() {
  const { persona } = useParams();
  const bundle = useMemo(
    () => personaBundles.find((b) => b.persona === persona),
    [persona],
  );
  const id2site = useMemo(
    () => Object.fromEntries(siteCatalog.map((s) => [s.id, s])),
    [],
  );

  if (!bundle) return <div className="p-6">잘못된 경로입니다.</div>;

  const { sites, missingIds } = useMemo(() => {
    const list: (typeof siteCatalog[number] & { category: string })[] = [];
    const missing: string[] = [];
    bundle.siteIds.forEach((id) => {
      const s = id2site[id];
      if (s) list.push({ ...s, category: "보험" });
      else missing.push(id);
    });
    return { sites: list.sort(sortSites), missingIds: missing };
  }, [bundle, id2site]);

  const emptyUrlCount = sites.filter((s) => !s.url).length;

  useEffect(() => {
    console.log("누락된 siteIds:", missingIds);
    console.log("빈 URL 개수:", emptyUrlCount);
    console.log(
      "category 매핑 누락 여부:",
      sites.some((s) => !(s as any).category),
    );
  }, [missingIds, emptyUrlCount, sites]);

  return (
    <div className="mx-auto max-w-6xl px-4">
      <h1 className="text-xl font-bold my-4">보험 · {String(persona)}</h1>
      {missingIds.length > 0 && (
        <div className="mb-4 rounded bg-yellow-100 p-3 text-sm text-yellow-800">
          누락된 siteIds: {missingIds.join(", ")}
        </div>
      )}
      {sites.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          등록된 사이트가 없습니다
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sites.map((s) => (
            <SiteCard key={s.id} site={s} />
          ))}
        </div>
      )}
    </div>
  );
}
