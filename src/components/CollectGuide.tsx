import React from "react";

interface CollectGuideProps {
  onClose: () => void;
  onLogin?: () => void;
}

export function CollectGuide({ onClose, onLogin }: CollectGuideProps) {
  return (
    <div className="bg-yellow-100 border-b px-4 py-3 text-sm text-gray-800 flex items-center justify-between">
      <span>
        이제 상단에서 즐겨찾기를 관리할 수 있어요. 로그인하면 안전하게 저장됩니다.
      </span>
      <div className="flex gap-2 ml-4">
        {onLogin && (
          <button className="underline text-blue-600" onClick={onLogin} type="button">
            로그인
          </button>
        )}
        <button className="underline" onClick={onClose} type="button">
          지금은 안 함
        </button>
      </div>
    </div>
  );
}
