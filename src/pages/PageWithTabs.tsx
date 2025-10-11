import { useState } from 'react';
import { PageTabs } from '../components/PageTabs';
import { FourColBoard } from '../components/FourColBoard';
import {
  WeatherWidget,
  NewsWidget,
  CalendarWidget,
  TimerWidget,
  FinanceWidget,
  MemoWidget,
  MemoLargeWidget,
} from '../components/SampleWidgets';

const TABS = ['페이지 1', '페이지 2', '페이지 3'];

export function PageWithTabs() {
  const [activeTab, setActiveTab] = useState('페이지 1');
  const [isEditMode, setIsEditMode] = useState(false);

  // 위젯 렌더링 함수
  const renderWidget = (widgetKey: string) => {
    const props = { isEditMode };

    switch (widgetKey) {
      case 'weather':
        return <WeatherWidget {...props} />;
      case 'news':
        return <NewsWidget {...props} />;
      case 'calendar':
        return <CalendarWidget {...props} />;
      case 'timer':
        return <TimerWidget {...props} />;
      case 'finance':
        return <FinanceWidget {...props} />;
      case 'memo':
        return <MemoWidget {...props} />;
      case 'memo-large':
        return <MemoLargeWidget {...props} />;
      default:
        return (
          <div className="h-full flex items-center justify-center bg-gray-100 rounded-lg">
            <span className="text-gray-500">Unknown Widget</span>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* 상단 탭 바 */}
      <PageTabs
        tabs={TABS}
        activeTab={activeTab}
        onChange={setActiveTab}
        isEditMode={isEditMode}
        onToggleEdit={() => setIsEditMode(!isEditMode)}
      />

      {/* 컨텐츠 영역 - 탭 바 높이(56px)만큼 패딩 */}
      <main className="pt-[56px]">
        <div className="max-w-7xl mx-auto py-6">
          {/* 편집 모드 안내 */}
          {isEditMode && (
            <div className="mx-4 mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-800">
                <strong>편집 모드:</strong> 위젯을 드래그하여 위치를 변경하거나, 모서리를 드래그하여 크기를 조정할 수 있습니다.
              </p>
            </div>
          )}

          {/* 4열 그리드 보드 */}
          <FourColBoard
            tabId={activeTab}
            isEditMode={isEditMode}
            renderWidget={renderWidget}
          />
        </div>
      </main>
    </div>
  );
}






















