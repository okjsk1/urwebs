import React from "react";

interface MidBannerProps {
  onApplyPreset: () => void;
  onOpenAddSite: () => void;
  onOpenHomepageGuide: () => void;
}

export function MidBanner({
  onApplyPreset,
  onOpenAddSite,
  onOpenHomepageGuide,
}: MidBannerProps) {
  return (
    <div
      className="urwebs-mid-banner flex items-center justify-between p-4 mb-6 rounded-lg border bg-gradient-to-r from-[var(--main-bg)] to-[var(--main-point)] dark:from-[var(--main-dark)] dark:to-[var(--main-bg)]"
      style={{ borderColor: "var(--border-urwebs)" }}
    >
      <div className="grid grid-cols-2 gap-2 w-1/2 mr-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-6 rounded bg-gray-200 dark:bg-gray-700"
          ></div>
        ))}
      </div>
      <div className="flex-1">
        <h2 className="text-sm font-semibold mb-1 text-gray-800 dark:text-gray-100">
          건축 스타터팩
        </h2>
        <p className="text-xs mb-3 text-gray-600 dark:text-gray-300">
          프리셋을 추가하거나 직접 사이트를 넣어보세요.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            className="px-3 py-1 rounded bg-[var(--main-point)] text-white text-xs"
            onClick={onApplyPreset}
            aria-label="샘플 즐겨찾기 담기"
            type="button"
          >
            샘플 즐겨찾기 담기
          </button>
          <button
            className="px-3 py-1 rounded border text-xs bg-white dark:bg-gray-800"
            style={{ borderColor: "var(--border-urwebs)" }}
            onClick={onOpenAddSite}
            aria-label="사이트 직접 추가"
            type="button"
          >
            직접 추가
          </button>
          <button
            className="px-3 py-1 rounded border text-xs bg-white dark:bg-gray-800"
            style={{ borderColor: "var(--border-urwebs)" }}
            onClick={onOpenHomepageGuide}
            aria-label="시작페이지 설정 안내"
            type="button"
          >
            시작페이지 설정 안내
          </button>
        </div>
      </div>
    </div>
  );
}

export default MidBanner;
