import { useMemo, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { registry } from "./registry";
import { sortSites } from "./sortSites";
import { CategoryCard } from "@/components/CategoryCard";
import { categoryConfig } from "@/data/websites";

export default function DomainPersonaPage() {
  const { domain, persona } = useParams();
  const domainData = domain ? registry.domains[domain] : undefined;
  const personaData = domainData?.personas.find((p) => p.key === persona);

  const [intentKey, setIntentKey] = useState(
    personaData?.defaultIntent || personaData?.intents[0]?.key
  );

  useEffect(() => {
    setIntentKey(personaData?.defaultIntent || personaData?.intents[0]?.key);
  }, [personaData]);

  const activeIntent = personaData?.intents.find((i) => i.key === intentKey);

  const sites = useMemo(() => {
    if (!activeIntent) return [] as typeof registry.sites[keyof typeof registry.sites][];
    return activeIntent.siteIds
      .map((id) => registry.sites[id])
      .filter((x): x is NonNullable<typeof x> => Boolean(x))
      .sort(sortSites);
  }, [activeIntent]);

  if (!domainData || !personaData) {
    return <div className="p-6">잘못된 경로입니다.</div>;
  }

  return (
    <div className="mx-auto max-w-6xl px-4">
      <h1 className="text-xl font-bold my-4">
        {domainData.label} · {personaData.label}
      </h1>
      {personaData.intents.length > 1 && (
        <div className="mb-4 flex gap-2">
          {personaData.intents.map((it) => (
            <button
              key={it.key}
              onClick={() => setIntentKey(it.key)}
              className={`px-3 py-1 rounded ${
                intentKey === it.key ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
            >
              {it.label}
            </button>
          ))}
        </div>
      )}
      <CategoryCard
        category={domainData.label}
        sites={sites.map((s) => ({
          id: s.id,
          category: s.category,
          title: s.title,
          url: s.url,
          description: s.description,
        }))}
        config={
          categoryConfig[domainData.label] || {
            title: domainData.label,
            icon: "",
          }
        }
        showDescriptions
        favorites={[]}
        onToggleFavorite={() => {}}
      />
    </div>
  );
}
