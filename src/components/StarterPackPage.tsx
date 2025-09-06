import React from "react";
import { STARTER_PACK_CATEGORIES } from "../data/starterPack";
import { analytics } from "../firebase";
import { logEvent } from "firebase/analytics";

interface StarterPackPageProps {
  onBack: () => void;
}

export function StarterPackPage({ onBack }: StarterPackPageProps) {
  const handleLinkClick = (category: string, label: string) => {
    if (analytics) {
      logEvent(analytics, "starter_pack_link", { category, label });
    }
  };

  return (
    <div className="max-w-screen-lg mx-auto p-5">
      <button
        onClick={onBack}
        className="mb-4 text-sm text-[var(--main-point)]"
        type="button"
      >
        ← 홈으로 돌아가기
      </button>
      <h1 className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-100">
        건축 스타터 팩
      </h1>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        {STARTER_PACK_CATEGORIES.map((cat) => (
          <div
            key={cat.title}
            className="p-4 border rounded bg-white dark:bg-gray-800"
            style={{ borderColor: "var(--border-urwebs)" }}
          >
            <h2 className="text-sm font-medium mb-2 text-gray-800 dark:text-gray-100">
              {cat.title}
            </h2>
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
    </div>
  );
}

export default StarterPackPage;
