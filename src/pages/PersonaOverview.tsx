// src/pages/PersonaOverview.tsx
import React, { useEffect } from 'react';
import categories from '../data/categories';
import personaCategories from '../data/personas';

export default function PersonaOverview() {
  useEffect(() => {
    document.title = '페르소나 구분';
  }, []);

  return (
    <main className="min-h-screen px-4 py-12">
      <h1 className="mb-8 text-2xl font-bold text-center">페르소나 구분</h1>
      {personaCategories.map((cat) => {
        const category = categories.find((c) => c.slug === cat.slug);
        return (
          <section key={cat.slug} className="mb-8">
            <h2 className="mb-2 text-xl font-semibold flex items-center">
              {category?.icon && (
                <span className="mr-2 text-2xl" aria-hidden="true">
                  {category.icon}
                </span>
              )}
              {cat.title}
            </h2>
            <ul className="list-disc pl-6 space-y-1">
              {cat.items.map((item) => (
                <li key={item.slug}>{item.title}</li>
              ))}
            </ul>
          </section>
        );
      })}
    </main>
  );
}
