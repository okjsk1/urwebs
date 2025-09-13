// src/pages/RealEstateRoleSelect.tsx
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const roles = [
  { slug: 'student', title: '학생', icon: '🎓' },
  { slug: 'agent', title: '공인중개사', icon: '🧑‍💼' },
  { slug: 'tenant', title: '임차인', icon: '🙋' },
  { slug: 'landlord', title: '임대인', icon: '🏠' },
  { slug: 'investor', title: '투자자', icon: '📈' },
] as const;

export default function RealEstateRoleSelect() {
  useEffect(() => {
    document.title = '부동산 사용자 선택';
  }, []);

  return (
    <main className="min-h-screen px-4 py-12">
      <h1 className="mb-6 text-2xl font-bold text-center">부동산 사용자 선택</h1>
      <div className="mx-auto grid max-w-3xl gap-4 [grid-template-columns:repeat(auto-fit,minmax(160px,1fr))]">
        {roles.map((role) => (
          <Link
            key={role.slug}
            to={`/category/realestate/${role.slug}`}
            className="flex flex-col items-center rounded-lg border bg-white p-4 text-center shadow-sm transition hover:shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <span className="text-3xl" aria-hidden="true">{role.icon}</span>
            <span className="mt-2 font-medium">{role.title}</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
