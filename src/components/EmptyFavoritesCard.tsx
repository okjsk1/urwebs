import React from "react";

interface EmptyFavoritesCardProps {
  onAddSite: () => void;
  onPreviewStarter: () => void;
}

export function EmptyFavoritesCard({ onAddSite, onPreviewStarter }: EmptyFavoritesCardProps) {
  return (
    <div className="sidebar-card text-center max-w-sm">
      <p className="mb-4">아직 즐겨찾기가 없습니다.</p>
      <div className="flex justify-center gap-2">
        <button
          type="button"
          onClick={onAddSite}
          className="px-3 py-1 rounded bg-blue-500 text-white text-sm"
        >
          사이트 추가
        </button>
        <button
          type="button"
          onClick={onPreviewStarter}
          className="px-3 py-1 rounded border text-sm"
        >
          스타터 세트 미리보기
        </button>
      </div>
    </div>
  );
}

export default EmptyFavoritesCard;
