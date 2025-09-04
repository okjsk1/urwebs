import React, { useState } from 'react';
import { FavoritesData } from '../types';
import { websites } from '../data/websites';

interface TopSitesSidebarProps {
  favoritesData: FavoritesData;
  onVisit: (id: string) => void;
}

export function TopSitesSidebar({ favoritesData, onVisit }: TopSitesSidebarProps) {
  const [limit, setLimit] = useState(10);

  const allIds = [
    ...(favoritesData.items || []),
    ...((favoritesData.folders || []).flatMap((f) => f.items || [])),
  ];

  const uniqueIds = Array.from(new Set(allIds));
  const sortedIds = uniqueIds
    .sort(
      (a, b) =>
        (favoritesData.visitCounts[b] || 0) -
        (favoritesData.visitCounts[a] || 0),
    )
    .slice(0, limit);

  const getWebsite = (id: string) => {
    let site = websites.find((w) => w.id === id);
    if (!site) {
      try {
        const saved = localStorage.getItem('sfu-custom-sites');
        if (saved) {
          const customSites = JSON.parse(saved) as any[];
          site = customSites.find((w) => w.id === id);
        }
      } catch (e) {
        console.error('Failed to parse custom sites:', e);
      }
    }
    return site;
  };

  return (
    <aside className="fixed right-0 top-0 h-full w-64 bg-white shadow-lg p-4 overflow-y-auto hidden lg:block">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Top Sites</h2>
        <button
          onClick={() => setLimit(limit === 10 ? 20 : 10)}
          className="text-sm text-blue-600 hover:underline"
        >
          Top {limit === 10 ? 20 : 10}
        </button>
      </div>
      <ol className="space-y-2 text-sm">
        {sortedIds.map((id) => {
          const site = getWebsite(id);
          if (!site) return null;
          const count = favoritesData.visitCounts[id] || 0;
          return (
            <li key={id} className="flex justify-between">
              <a
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => onVisit(id)}
                className="text-blue-600 hover:underline truncate flex-1"
                title={site.title}
              >
                {site.title}
              </a>
              <span className="ml-2 text-gray-500">{count}</span>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}
