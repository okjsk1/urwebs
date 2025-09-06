import React, { useMemo } from "react";
import { Website } from "../types";
import { Favicon } from "./Favicon";

interface RightSidebarProps {
  topSites: Website[];
  trending: Website[];
  top10: Website[];
}

interface SidebarCardProps {
  title: string;
  items: Website[];
}

function SidebarCard({ title, items }: SidebarCardProps) {
  if (items.length === 0) return null;
  return (
    <div className="sidebar-card">
      <h4>{title}</h4>
      <ul className="sidebar-list">
        {items.map((site) => (
          <li key={site.id} className="sidebar-item">
            <Favicon domain={site.url} className="w-4 h-4 flex-shrink-0" />
            <a
              href={site.url}
              target="_blank"
              rel="noopener"
              className="title"
            >
              {site.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function RightSidebar({ topSites, trending, top10 }: RightSidebarProps) {
  const [uTopSites, uTop10, uTrending] = useMemo(() => {
    const seen = new Set<string>();
    const dedupe = (list: Website[]) => {
      const res: Website[] = [];
      for (const site of list) {
        const key = site.url || site.title;
        if (seen.has(key)) continue;
        seen.add(key);
        res.push(site);
      }
      return res;
    };
    return [dedupe(topSites), dedupe(top10), dedupe(trending)];
  }, [topSites, top10, trending]);

  return (
    <div>
      <SidebarCard title="자주 가는 사이트" items={uTopSites.slice(0, 8)} />
      <SidebarCard title="Top 10" items={uTop10.slice(0, 8)} />
      <SidebarCard title="급상승" items={uTrending.slice(0, 8)} />
    </div>
  );
}

export default RightSidebar;
