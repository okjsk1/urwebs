import { 
  Cloud, 
  Newspaper, 
  Calendar as CalendarIcon, 
  Clock, 
  TrendingUp, 
  FileText,
  GripVertical 
} from 'lucide-react';
import { Card } from './ui/card';

interface WidgetCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isEditMode: boolean;
}

function WidgetCard({ title, icon, children, isEditMode }: WidgetCardProps) {
  return (
    <Card className="rounded-2xl shadow-lg bg-white overflow-hidden h-full flex flex-col">
      {/* 헤더 - 드래그 핸들 */}
      <div 
        className={`widget-drag-handle flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b ${
          isEditMode ? 'cursor-move hover:bg-blue-100' : ''
        }`}
      >
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="font-semibold text-gray-800">{title}</h3>
        </div>
        {isEditMode && (
          <div className="flex items-center gap-1 text-gray-400">
            <GripVertical className="w-4 h-4" />
            <span className="text-xs">드래그</span>
          </div>
        )}
      </div>
      
      {/* 컨텐츠 */}
      <div className="p-4 flex-1 overflow-auto">
        {children}
      </div>
    </Card>
  );
}

interface SampleWidgetsProps {
  isEditMode: boolean;
}

export function WeatherWidget({ isEditMode }: SampleWidgetsProps) {
  return (
    <WidgetCard title="날씨" icon={<Cloud className="w-5 h-5 text-blue-500" />} isEditMode={isEditMode}>
      <div className="text-center">
        <div className="text-5xl mb-2">☀️</div>
        <div className="text-3xl font-bold text-gray-800">23°C</div>
        <div className="text-sm text-gray-600 mt-2">맑음</div>
        <div className="text-xs text-gray-500 mt-1">서울특별시</div>
      </div>
    </WidgetCard>
  );
}

export function NewsWidget({ isEditMode }: SampleWidgetsProps) {
  return (
    <WidgetCard title="뉴스" icon={<Newspaper className="w-5 h-5 text-purple-500" />} isEditMode={isEditMode}>
      <div className="space-y-3">
        <div className="pb-2 border-b">
          <h4 className="font-medium text-sm text-gray-800 line-clamp-2">
            최신 기술 트렌드 업데이트
          </h4>
          <p className="text-xs text-gray-500 mt-1">2시간 전</p>
        </div>
        <div className="pb-2 border-b">
          <h4 className="font-medium text-sm text-gray-800 line-clamp-2">
            경제 뉴스: 주식 시장 동향
          </h4>
          <p className="text-xs text-gray-500 mt-1">5시간 전</p>
        </div>
      </div>
    </WidgetCard>
  );
}

export function CalendarWidget({ isEditMode }: SampleWidgetsProps) {
  return (
    <WidgetCard title="캘린더" icon={<CalendarIcon className="w-5 h-5 text-green-500" />} isEditMode={isEditMode}>
      <div className="space-y-2">
        <div className="text-center mb-3">
          <div className="text-2xl font-bold text-gray-800">
            {new Date().toLocaleDateString('ko-KR', { month: 'long', year: 'numeric' })}
          </div>
        </div>
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="font-medium text-sm">회의</div>
          <div className="text-xs text-gray-600">오후 2:00</div>
        </div>
        <div className="bg-purple-50 p-3 rounded-lg">
          <div className="font-medium text-sm">프로젝트 마감</div>
          <div className="text-xs text-gray-600">오후 5:00</div>
        </div>
      </div>
    </WidgetCard>
  );
}

export function TimerWidget({ isEditMode }: SampleWidgetsProps) {
  return (
    <WidgetCard title="타이머" icon={<Clock className="w-5 h-5 text-orange-500" />} isEditMode={isEditMode}>
      <div className="text-center">
        <div className="text-4xl font-bold text-gray-800">25:00</div>
        <div className="text-sm text-gray-600 mt-2">포모도로</div>
        <button className="mt-3 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600">
          시작
        </button>
      </div>
    </WidgetCard>
  );
}

export function FinanceWidget({ isEditMode }: SampleWidgetsProps) {
  return (
    <WidgetCard title="금융" icon={<TrendingUp className="w-5 h-5 text-red-500" />} isEditMode={isEditMode}>
      <div className="space-y-3">
        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
          <div>
            <div className="font-medium text-sm">삼성전자</div>
            <div className="text-xs text-gray-600">005930</div>
          </div>
          <div className="text-right">
            <div className="font-bold text-green-600">+2.5%</div>
            <div className="text-xs text-gray-600">75,000원</div>
          </div>
        </div>
        <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
          <div>
            <div className="font-medium text-sm">카카오</div>
            <div className="text-xs text-gray-600">035720</div>
          </div>
          <div className="text-right">
            <div className="font-bold text-red-600">-1.2%</div>
            <div className="text-xs text-gray-600">48,500원</div>
          </div>
        </div>
      </div>
    </WidgetCard>
  );
}

export function MemoWidget({ isEditMode }: SampleWidgetsProps) {
  return (
    <WidgetCard title="메모" icon={<FileText className="w-5 h-5 text-yellow-500" />} isEditMode={isEditMode}>
      <textarea
        className="w-full h-full min-h-[100px] p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="메모를 입력하세요..."
        defaultValue="오늘 할 일:&#10;1. 프로젝트 문서 작성&#10;2. 팀 미팅 참석&#10;3. 코드 리뷰"
      />
    </WidgetCard>
  );
}

export function MemoLargeWidget({ isEditMode }: SampleWidgetsProps) {
  return (
    <WidgetCard title="큰 메모" icon={<FileText className="w-5 h-5 text-indigo-500" />} isEditMode={isEditMode}>
      <textarea
        className="w-full h-full min-h-[150px] p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="긴 메모를 입력하세요..."
        defaultValue="프로젝트 아이디어:&#10;&#10;새로운 위젯 보드 시스템을 만들어서 사용자가 자유롭게 레이아웃을 구성할 수 있도록 한다.&#10;&#10;주요 기능:&#10;- 드래그 앤 드롭&#10;- 리사이즈&#10;- 탭 기반 페이지 구성&#10;- localStorage 저장"
      />
    </WidgetCard>
  );
}




