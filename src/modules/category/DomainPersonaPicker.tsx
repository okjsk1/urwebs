import { Link, useParams } from "react-router-dom";
import { registry } from "./registry";

export function DomainPersonaPicker() {
  const { domain } = useParams();
  const domainData = domain ? registry.domains[domain] : undefined;

  if (!domainData) {
    return <div className="p-6">잘못된 분야입니다.</div>;
  }

  return (
    <div className="mx-auto max-w-6xl px-4">
      <h1 className="text-center text-2xl font-bold my-6">
        {domainData.label} 사용자 선택
      </h1>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {domainData.personas.map((p) => (
          <Link
            key={p.key}
            to={`/category/${domain}/${p.key}`}
            className="rounded-xl border p-5 hover:shadow"
          >
            <div className="text-3xl">{p.emoji}</div>
            <div className="mt-2 font-semibold">{p.label}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
