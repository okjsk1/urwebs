// 위젯 사용 예시 컴포넌트
import React, { useState } from 'react';
import { ColorPickerWidget, BookmarkWidget, StatsWidget, ContactWidget } from '../index';
import { Button } from '../../ui/button';

// 위젯 타입 정의
interface Widget {
  id: string;
  type: 'colorpicker' | 'bookmark' | 'stats' | 'contact';
  title: string;
}

// 예시 컴포넌트
export const WidgetExample: React.FC = () => {
  const [widgets] = useState<Widget[]>([
    { id: 'widget-1', type: 'colorpicker', title: '컬러 팔레트' },
    { id: 'widget-2', type: 'bookmark', title: '즐겨찾기' },
    { id: 'widget-3', type: 'stats', title: '통계 대시보드' },
    { id: 'widget-4', type: 'contact', title: '연락처 관리' }
  ]);

  const [isEditMode, setIsEditMode] = useState(false);

  // 위젯 업데이트 함수 (예시)
  const updateWidget = (widgetId: string, partial: any) => {
    // Widget updated: ${widgetId}
    // 실제 구현에서는 상태 관리 라이브러리나 API 호출
  };

  // 위젯 렌더링 함수
  const renderWidget = (widget: Widget) => {
    const commonProps = {
      widget: { id: widget.id, type: widget.type, title: widget.title },
      isEditMode,
      updateWidget
    };

    switch (widget.type) {
      case 'colorpicker':
        return <ColorPickerWidget {...commonProps} />;
      case 'bookmark':
        return <BookmarkWidget {...commonProps} />;
      case 'stats':
        return <StatsWidget {...commonProps} />;
      case 'contact':
        return <ContactWidget {...commonProps} />;
      default:
        return <div>Unknown widget type</div>;
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">위젯 예시</h1>
          <Button
            onClick={() => setIsEditMode(!isEditMode)}
            variant={isEditMode ? 'default' : 'outline'}
          >
            {isEditMode ? '편집 완료' : '편집 모드'}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {widgets.map(widget => (
            <div key={widget.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-3 border-b border-gray-200">
                <h3 className="font-semibold text-sm text-gray-800">{widget.title}</h3>
              </div>
              <div className="h-80">
                {renderWidget(widget)}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h2 className="font-semibold text-blue-800 mb-2">사용법 안내</h2>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• 편집 모드를 활성화하여 위젯을 수정할 수 있습니다</li>
            <li>• 컬러 팔레트: 랜덤/트렌드/HSL 색상 생성 및 복사</li>
            <li>• 북마크: 검색, 정렬, 재정렬, 파비콘 자동 로드</li>
            <li>• 통계: 시드 기반 데이터 생성, 차트 표시</li>
            <li>• 연락처: 검색, 정렬, 유효성 검사, 액션 버튼</li>
            <li>• 모든 데이터는 로컬 스토리지에 자동 저장됩니다</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
