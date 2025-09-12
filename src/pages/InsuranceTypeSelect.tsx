// src/pages/InsuranceTypeSelect.tsx
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const types = [
  { slug: 'planner', title: '설계사', emoji: '🧑‍💼' },
  { slug: 'auto', title: '자동차보험', emoji: '🚗' },
] as const;

export default function InsuranceTypeSelect() {
  useEffect(() => {
    document.title = '보험 유형 선택';
  }, []);

  return (
    <main className="min-h-screen px-4 py-12">
      <h1 className="mb-6 text-2xl font-bold text-center">보험 유형 선택</h1>
      <div className="mx-auto grid max-w-3xl gap-4 [grid-template-columns:repeat(auto-fit,minmax(160px,1fr))]">
        {types.map((type) => (
          <Link
            key={type.slug}
            to={`/category/insurance/${type.slug}`}
            className="flex flex-col items-center rounded-lg border bg-white p-4 text-center shadow-sm transition hover:shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <span className="text-3xl" aria-hidden="true">{type.emoji}</span>
            <span className="mt-2 font-medium">{type.title}</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
