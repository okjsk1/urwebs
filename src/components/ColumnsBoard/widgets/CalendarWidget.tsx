import { Calendar } from 'lucide-react';

export function CalendarWidget() {
  return (
    <div className="space-y-3">
      <div className="text-center mb-4">
        <div className="text-lg font-bold text-gray-800">
          {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })}
        </div>
      </div>
      <div className="space-y-2">
        <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
          <div className="font-medium text-sm text-gray-800">팀 회의</div>
          <div className="text-xs text-gray-600">오후 2:00 - 3:00</div>
        </div>
        <div className="bg-purple-50 border-l-4 border-purple-500 p-3 rounded">
          <div className="font-medium text-sm text-gray-800">프로젝트 마감</div>
          <div className="text-xs text-gray-600">오후 5:00</div>
        </div>
        <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded">
          <div className="font-medium text-sm text-gray-800">고객 미팅</div>
          <div className="text-xs text-gray-600">내일 오전 10:00</div>
        </div>
      </div>
    </div>
  );
}






