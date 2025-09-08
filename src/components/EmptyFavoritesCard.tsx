import React from 'react';

export function EmptyFavoritesCard() {
  return (
    <div className="max-w-screen-2xl mx-auto px-5 mb-4">
      <div
        className="border rounded p-6 text-center bg-white dark:bg-gray-800"
        style={{ borderColor: 'var(--border-urwebs)' }}
      >
        <p className="mb-4 text-sm">아직 즐겨찾기가 없습니다.</p>
        <div className="flex justify-center gap-2">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('openAddSiteModal'))}
            className="px-3 py-1 text-xs rounded bg-[var(--main-point)] text-white"
          >
            사이트 추가
          </button>
        </div>
      </div>
    </div>
  );
}

export default EmptyFavoritesCard;
