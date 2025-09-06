import React from "react";
import { STARTER_PACK_CATEGORIES } from "../data/starterPack";
import { analytics } from "../firebase";
import { logEvent } from "firebase/analytics";

interface StarterPackSectionProps {
  onViewAll: () => void;
}

export function StarterPackSection({ onViewAll }: StarterPackSectionProps) {
  const handleLinkClick = (category: string, label: string) => {
    if (analytics) {
      logEvent(analytics, "starter_pack_link", { category, label });
    }
  };

  return (
    <section className="max-w-screen-2xl mx-auto px-5 sm:px-2 mb-6">
      <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
        건축 스타터 팩
      </h2>

      {/* Desktop/Grid view */}
      <div className="hidden sm:grid gap-4 grid-cols-2 md:grid-cols-4">
        {STARTER_PACK_CATEGORIES.map((cat) => (
          <div
            key={cat.title}
            className="p-3 border rounded bg-white dark:bg-gray-800"
            style={{ borderColor: "var(--border-urwebs)" }}
          >
            <h3 className="text-sm font-medium mb-2 text-gray-800 dark:text-gray-100">
              {cat.title}
            </h3>
            <ul className="space-y-1">
              {cat.links.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleLinkClick(cat.title, link.label)}
                    className="block text-xs text-gray-700 dark:text-gray-200 hover:underline"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Mobile summary */}
      <div className="sm:hidden">
        <div
          className="p-4 border rounded bg-white dark:bg-gray-800 flex justify-between items-center"
          style={{ borderColor: "var(--border-urwebs)" }}
        >
          <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
            건축 스타터 팩
          </span>
          <button
            onClick={onViewAll}
            className="text-xs text-[var(--main-point)]"
            type="button"
          >
            자세히 보기
          </button>
        </div>
      </div>

      <div className="hidden sm:block text-right mt-4">
        <button
          onClick={onViewAll}
          className="text-xs text-[var(--main-point)]"
          type="button"
        >
          전체 스타터 팩 보기 →
        </button>
      </div>
    </section>
  );
}

export default StarterPackSection;
