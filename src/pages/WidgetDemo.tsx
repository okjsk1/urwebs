import React, { useState } from 'react';
import { TimerWidget } from '../components/widgets/TimerWidget';
import { NewsWidget } from '../components/widgets/NewsWidget';
import { DdayWidget } from '../components/widgets/DdayWidget';
import { WidgetWrapper, WidgetGrid } from '../components/widgets/LazyWidget';
import { useAccessibility } from '../hooks/useAccessibility';

export function WidgetDemo() {
  const [widgets, setWidgets] = useState([
    { id: 'timer-1', type: 'timer', size: 'm' as const },
    { id: 'news-1', type: 'news', size: 'l' as const },
    { id: 'dday-1', type: 'dday', size: 'm' as const }
  ]);

  const { isReducedMotion, isHighContrast } = useAccessibility();

  const handleRemoveWidget = (id: string) => {
    setWidgets(prev => prev.filter(w => w.id !== id));
  };

  const handleResizeWidget = (id: string, size: 's' | 'm' | 'l') => {
    setWidgets(prev => prev.map(w => w.id === id ? { ...w, size } : w));
  };

  const handlePinWidget = (id: string) => {
    console.log('Pin widget:', id);
  };

  const addWidget = (type: 'timer' | 'news' | 'dday') => {
    const newWidget = {
      id: `${type}-${Date.now()}`,
      type,
      size: 'm' as const
    };
    setWidgets(prev => [...prev, newWidget]);
  };

  const renderWidget = (widget: any) => {
    const commonProps = {
      id: widget.id,
      size: widget.size,
      onRemove: handleRemoveWidget,
      onResize: handleResizeWidget,
      onPin: handlePinWidget,
      isPinned: false
    };

    switch (widget.type) {
      case 'timer':
        return <TimerWidget {...commonProps} />;
      case 'news':
        return <NewsWidget {...commonProps} />;
      case 'dday':
        return <DdayWidget {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            위젯 데모
          </h1>
          
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => addWidget('timer')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              타이머 추가
            </button>
            <button
              onClick={() => addWidget('news')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              뉴스 추가
            </button>
            <button
              onClick={() => addWidget('dday')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              D-Day 추가
            </button>
          </div>

          <div className="text-sm text-gray-600">
            접근성 설정: {isReducedMotion && '애니메이션 감소'} {isHighContrast && '고대비'}
          </div>
        </div>

        <WidgetGrid columns={3} gap={6}>
          {widgets.map(widget => (
            <WidgetWrapper
              key={widget.id}
              lazy={true}
              className={`${isReducedMotion ? 'animate-none' : ''} ${isHighContrast ? 'contrast-more' : ''}`}
            >
              {renderWidget(widget)}
            </WidgetWrapper>
          ))}
        </WidgetGrid>

        {widgets.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">
              위젯을 추가해보세요
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
