import { FileText } from 'lucide-react';

export function MemoWidget() {
  return (
    <div>
      <textarea
        className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        placeholder="메모를 입력하세요..."
        defaultValue="오늘 할 일:&#10;1. 프로젝트 마감&#10;2. 회의 참석&#10;3. 보고서 작성"
      />
    </div>
  );
}






























