import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import type { Website } from "../types";
import { categoryConfig, websites as websitesLocal } from "../data/websites";

export default function FieldPage() {
  const { slug } = useParams<{ slug: string }>();
  const [websites, setWebsites] = useState<Website[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/websites.json", { cache: "no-store" });
        if (!res.ok) throw new Error("failed");
        const data: Website[] = await res.json();
        if (mounted) setWebsites(data);
      } catch {
        setError(true);
        if (mounted) setWebsites(websitesLocal);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const categoryInfo = slug ? categoryConfig[slug] : undefined;

  const filtered = useMemo(() => {
    if (!websites || !slug) return [];
    const name = categoryInfo?.title ?? slug;
    return websites.filter(
      (w) => w.category === name || w.categorySlug === slug,
    );
  }, [websites, slug, categoryInfo]);

  if (!slug || !categoryInfo) {
    return (
      <div className="p-6">
        <p className="mb-4">알 수 없는 분야입니다.</p>
        <Link to="/" className="text-blue-600 underline">
          홈으로 돌아가기
        </Link>
      </div>
    );
  }

  if (!websites) return <div className="p-6">로딩 중…</div>;

  if (filtered.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">{categoryInfo.title}</h1>
        {error && (
          <p className="mb-2 text-sm text-gray-500">
            사이트 목록을 불러오지 못해 로컬 데이터로 표시합니다.
          </p>
        )}
        <p>표시할 사이트가 없습니다.</p>
      </div>
    );
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">{categoryInfo.title}</h1>
      {error && (
        <p className="mb-4 text-sm text-gray-500">
          사이트 목록을 불러오지 못해 로컬 데이터로 표시합니다.
        </p>
      )}
      <ul className="space-y-3">
        {filtered.map((site) => (
          <li key={site.id} className="border-b pb-2">
            <a
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {site.title}
            </a>
            {site.description && (
              <p className="text-sm text-gray-600">{site.description}</p>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
