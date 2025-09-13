import { Link } from "react-router-dom";

const items = [
  { key:"consumer", label:"개인고객", emoji:"🙋" },
  { key:"agent", label:"설계사", emoji:"💼" },
  { key:"expert", label:"전문가", emoji:"🧠" },
  { key:"corporate", label:"기업·단체", emoji:"🏢" },
  { key:"licensePrep", label:"취업·수험", emoji:"📚" },
  { key:"overseas", label:"해외/유학생", emoji:"🌏" },
];

export function PersonaPicker() {
  return (
    <div className="mx-auto max-w-6xl px-4">
      <h1 className="text-center text-2xl font-bold my-6">보험 사용자 선택</h1>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {items.map(it=>(
          <Link key={it.key} to={`/category/insurance/${it.key}`}
            className="rounded-xl border p-5 hover:shadow">
            <div className="text-3xl">{it.emoji}</div>
            <div className="mt-2 font-semibold">{it.label}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
