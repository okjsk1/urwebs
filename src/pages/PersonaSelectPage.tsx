import { Link } from "react-router-dom";
import { personaCategories } from "@/data/personas";

interface Props {
  slug: string;
}

export default function PersonaSelectPage({ slug }: Props) {
  const category = personaCategories.find((c) => c.slug === slug);
  if (!category) return <div className="p-6">잘못된 경로입니다.</div>;

  return (
    <div className="mx-auto max-w-6xl px-4">
      <h1 className="text-center text-2xl font-bold my-6">
        {category.title} 사용자 선택
      </h1>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {category.items.map((it) => (
          <Link
            key={it.slug}
            to={`/category/${slug}-${it.slug}`}
            className="rounded-xl border p-5 hover:shadow text-center"
          >
            <div className="mt-2 font-semibold">{it.title}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

