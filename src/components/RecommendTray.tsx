import React from 'react';
import { FavoritesData } from '../types';

interface RecommendTrayProps {
  onApplyPreset: (preset: FavoritesData) => void;
}

const RECOMMENDATIONS: { title: string; preset: FavoritesData }[] = [
  { title: '건축 인기', preset: { items: ['1', '2', '3'], folders: [], widgets: [] } },
  { title: '급상승', preset: { items: ['5', '60', '63'], folders: [], widgets: [] } },
  { title: '자주 같이 담는 사이트', preset: { items: ['12', '13', '14'], folders: [], widgets: [] } },
  { title: '건축가 모음', preset: { items: ['101', '105', '108'], folders: [], widgets: [] } },
  { title: '포털 모음', preset: { items: ['301', '302', '303'], folders: [], widgets: [] } },
  { title: '자료 모음', preset: { items: ['KR-R-001', 'KR-R-002', 'KR-R-003'], folders: [], widgets: [] } },
];

export function RecommendTray({ onApplyPreset }: RecommendTrayProps) {
  return (
    <div className="max-w-screen-2xl mx-auto px-5 sm:px-2 mb-6 mt-6">
      <div className="cards-6cols">
        {RECOMMENDATIONS.map((rec) => (
          <div
            key={rec.title}
            className="card p-3 border rounded bg-white dark:bg-gray-800"
            style={{ borderColor: 'var(--border-urwebs)' }}
          >
            <h3 className="title mb-2 text-gray-800 dark:text-gray-100">
              {rec.title}
            </h3>
            <button
              onClick={() => onApplyPreset(rec.preset)}
              className="px-2 py-1 text-xs rounded bg-[var(--main-point)] text-white"
              aria-label={`${rec.title} 담기`}
              type="button"
            >
              담기
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecommendTray;

