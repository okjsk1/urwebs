import { Newspaper } from 'lucide-react';

export function NewsWidget() {
  return (
    <div className="space-y-3">
      <div className="pb-3 border-b border-gray-200">
        <div className="flex items-start gap-2">
          <Newspaper className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm text-gray-800 line-clamp-2">
              최신 AI 기술 개발 소식
            </h4>
            <p className="text-xs text-gray-500 mt-1">테크크런치 • 2시간 전</p>
          </div>
        </div>
      </div>
      <div className="pb-3 border-b border-gray-200">
        <div className="flex items-start gap-2">
          <Newspaper className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm text-gray-800 line-clamp-2">
              경제 동향 업데이트
            </h4>
            <p className="text-xs text-gray-500 mt-1">연합뉴스 • 5시간 전</p>
          </div>
        </div>
      </div>
      <div>
        <div className="flex items-start gap-2">
          <Newspaper className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm text-gray-800 line-clamp-2">
              새로운 정책 발표
            </h4>
            <p className="text-xs text-gray-500 mt-1">조선일보 • 1일 전</p>
          </div>
        </div>
      </div>
    </div>
  );
}
































