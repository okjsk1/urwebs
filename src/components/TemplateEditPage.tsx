import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ArrowLeft, Save, Plus, Settings, Grid, Trash2 } from 'lucide-react';
import { Widget, WidgetType } from '../types/mypage.types';
import { widgetCategories } from '../constants/widgetCategories';
import {
  CalendarWidget,
  TodoWidget,
  NewsWidget,
  BookmarkWidget,
  ContactWidget,
  QRCodeWidget,
  GitHubWidget,
  GoogleSearchWidget,
  NaverSearchWidget,
  LawSearchWidget,
  EnglishWordsWidget
} from './widgets';
import { getNextAvailablePosition, getWidgetDimensions } from '../utils/widgetHelpers';

interface TemplateEditPageProps {
  onBack: () => void;
  onSave?: (templateData: { name: string; description: string; category: string; icon: string; color: string; widgets: Widget[] }) => void;
  initialData?: {
    name: string;
    description: string;
    category: string;
    icon: string;
    color: string;
    widgets: Widget[];
  };
}

export function TemplateEditPage({ onBack, onSave, initialData }: TemplateEditPageProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [category, setCategory] = useState(initialData?.category || '일반');
  const [icon, setIcon] = useState(initialData?.icon || '📄');
  const [color, setColor] = useState(initialData?.color || '#3B82F6');
  const [widgets, setWidgets] = useState<Widget[]>(initialData?.widgets || []);
  const [showWidgetPanel, setShowWidgetPanel] = useState(false);
  const [draggedWidget, setDraggedWidget] = useState<Widget | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const gridRef = React.useRef<HTMLDivElement>(null);

  const COLUMNS = 8;
  const CELL_WIDTH = 18;
  const CELL_HEIGHT = 60;
  const SPACING = 5;

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setDescription(initialData.description || '');
      setCategory(initialData.category || '일반');
      setIcon(initialData.icon || '📄');
      setColor(initialData.color || '#3B82F6');
      setWidgets(initialData.widgets || []);
    }
  }, [initialData]);

  const renderWidget = (widget: Widget): React.ReactNode => {
    const commonProps = {
      widget,
      isEditMode: true,
      updateWidget: () => {}
    };

    switch (widget.type) {
      case 'calendar':
        return <CalendarWidget {...commonProps} />;
      case 'weather_small':
        return <WeatherSmallWidget {...commonProps} />;
      case 'todo':
        return <TodoWidget {...commonProps} />;
      case 'news':
        return <NewsWidget {...commonProps} />;
      case 'bookmark':
        return <BookmarkWidget {...commonProps} />;
      case 'social':
        return <SocialWidget {...commonProps} />;
      case 'music':
        return <MusicWidget {...commonProps} />;
      case 'calculator':
        return <CalculatorWidget {...commonProps} />;
      case 'contact':
        return <ContactWidget {...commonProps} />;
      case 'qr_code':
        return <QRCodeWidget {...commonProps} />;
      case 'github_repo':
      case 'github':
        return <GitHubWidget {...commonProps} />;
      case 'google_search':
        return <GoogleSearchWidget {...commonProps} />;
      case 'naver_search':
        return <NaverSearchWidget {...commonProps} />;
      case 'law_search':
        return <LawSearchWidget {...commonProps} />;
      case 'english_words':
        return <EnglishWordsWidget {...commonProps} />;
      default:
        return (
          <div className="flex items-center justify-center h-full bg-gray-100 text-gray-500 text-sm">
            <div className="text-center">
              <div className="text-2xl mb-2">📦</div>
              <div>{widget.title}</div>
              <div className="text-xs mt-1 opacity-70">{widget.type}</div>
            </div>
          </div>
        );
    }
  };

  const handleAddWidget = (type: WidgetType) => {
    const newWidget: Widget = {
      id: `widget_${Date.now()}`,
      type,
      title: widgetCategories[Object.keys(widgetCategories).find(key => 
        widgetCategories[key].widgets.some(w => w.type === type)
      )!].widgets.find(w => w.type === type)?.name || type,
      content: {},
      zIndex: 1,
      size: '1x1',
      ...getNextAvailablePosition(widgets, { width: CELL_WIDTH * 2 + SPACING, height: CELL_HEIGHT }, COLUMNS, CELL_WIDTH, CELL_HEIGHT, SPACING)
    };

    setWidgets([...widgets, newWidget]);
    setShowWidgetPanel(false);
  };

  const handleDeleteWidget = (widgetId: string) => {
    setWidgets(widgets.filter(w => w.id !== widgetId));
  };

  const handleDragStart = (widget: Widget, e: React.MouseEvent) => {
    setDraggedWidget(widget);
    if (gridRef.current) {
      const rect = gridRef.current.getBoundingClientRect();
      const offsetX = e.clientX - rect.left - widget.x;
      const offsetY = e.clientY - rect.top - widget.y;
      (e.target as HTMLElement).dataset.offsetX = String(offsetX);
      (e.target as HTMLElement).dataset.offsetY = String(offsetY);
    }
  };

  const handleDragMove = (e: React.MouseEvent) => {
    if (!draggedWidget || !gridRef.current) return;

    const rect = gridRef.current.getBoundingClientRect();
    const target = e.target as HTMLElement;
    const offsetX = parseFloat(target.dataset.offsetX || '0');
    const offsetY = parseFloat(target.dataset.offsetY || '0');
    
    const x = Math.round((e.clientX - rect.left - offsetX) / (CELL_WIDTH + SPACING)) * (CELL_WIDTH + SPACING);
    const y = Math.round((e.clientY - rect.top - offsetY) / (CELL_HEIGHT + SPACING)) * (CELL_HEIGHT + SPACING);

    setWidgets(widgets.map(w => 
      w.id === draggedWidget.id 
        ? { ...w, x: Math.max(0, x), y: Math.max(0, y) }
        : w
    ));
  };

  const handleDragEnd = () => {
    setDraggedWidget(null);
  };

  const handleSubmit = () => {
    if (!name.trim() || !description.trim()) {
      alert('템플릿 이름과 설명을 입력해주세요.');
      return;
    }
    
    if (onSave) {
      onSave({ name, description, category, icon, color, widgets });
    } else {
      // 로컬 저장 또는 다른 처리
      console.log('Template saved:', { name, description, category, icon, color, widgets });
      alert('템플릿이 저장되었습니다!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="w-full px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={onBack}>
                <ArrowLeft className="w-5 h-5 mr-2" />
                돌아가기
              </Button>
              <div className="h-8 w-px bg-gray-300" />
              <div className="flex items-center gap-3">
                <div className="text-4xl">{icon}</div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {name || '새 템플릿'}
                  </h1>
                  <p className="text-sm text-gray-500">
                    위젯 {widgets.length}개 • {category}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="w-4 h-4 mr-2" />
                설정
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowWidgetPanel(!showWidgetPanel)}
              >
                <Plus className="w-4 h-4 mr-2" />
                위젯 추가
              </Button>
              <Button
                onClick={handleSubmit}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="w-4 h-4 mr-2" />
                템플릿 저장
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-4 py-6">
        <div className="flex gap-6">
          {/* Settings Panel */}
          {showSettings && (
            <div className="w-80 bg-white rounded-xl shadow-lg p-6 space-y-4 h-fit sticky top-24 flex-shrink-0">
              <h3 className="text-lg font-bold text-gray-900 mb-4">템플릿 설정</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  템플릿 이름
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="예: 생산성 대시보드"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  설명
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="템플릿에 대한 설명"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  카테고리
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="예: 생산성"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  아이콘 (이모지)
                </label>
                <input
                  type="text"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-2xl text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="📄"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  색상
                </label>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full h-10 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* Widget Grid */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Grid className="w-4 h-4" />
                  <span>위젯을 드래그하여 위치를 조정하세요</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowWidgetPanel(!showWidgetPanel)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  위젯 추가
                </Button>
              </div>

              <div
                ref={gridRef}
                className="relative min-h-[1000px] bg-white rounded-lg border-2 border-dashed border-gray-300 p-4"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, #e5e7eb 1px, transparent 1px),
                    linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
                  `,
                  backgroundSize: `${(CELL_WIDTH + SPACING) * 4}px ${CELL_HEIGHT + SPACING}px`
                }}
                onMouseMove={draggedWidget ? handleDragMove : undefined}
                onMouseUp={handleDragEnd}
              >
                {widgets.map((widget) => (
                  <div
                    key={widget.id}
                    onMouseDown={(e) => handleDragStart(widget, e)}
                    className="absolute cursor-move transition-shadow duration-200 hover:shadow-2xl group"
                    style={{
                      left: widget.x,
                      top: widget.y,
                      width: widget.width,
                      height: widget.height,
                      zIndex: draggedWidget?.id === widget.id ? 1000 : widget.zIndex
                    }}
                  >
                    <div className="relative w-full h-full bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                      {renderWidget(widget)}
                      
                      {/* 삭제 버튼 - 호버 시 표시 */}
                      <div className="absolute top-2 right-2 flex gap-1 bg-white/95 backdrop-blur-sm rounded-lg p-1 shadow-xl border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 text-red-600 hover:bg-red-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteWidget(widget.id);
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {widgets.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-gray-400">
                      <Grid className="w-20 h-20 mx-auto mb-4 opacity-50" />
                      <p className="text-xl font-medium mb-2">위젯을 추가하여 시작하세요</p>
                      <p className="text-sm">상단의 "위젯 추가" 버튼을 클릭하세요</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Widget Panel */}
      {showWidgetPanel && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-4 border-blue-500 shadow-2xl z-[99999] max-h-[60vh] overflow-y-auto">
          <div className="w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">위젯 추가</h3>
              <Button
                variant="ghost"
                onClick={() => setShowWidgetPanel(false)}
              >
                닫기
              </Button>
            </div>

            <div className="space-y-6">
              {Object.entries(widgetCategories).map(([categoryKey, category]) => {
                const CategoryIcon = category.widgets[0]?.icon;
                const isIconComponent = CategoryIcon && typeof CategoryIcon === 'function';
                
                return (
                  <div key={categoryKey}>
                    <h4 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        {isIconComponent ? (
                          <CategoryIcon className="w-4 h-4" />
                        ) : (
                          <span className="text-lg">📦</span>
                        )}
                      </div>
                      {category.name}
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                      {category.widgets.map((widget) => {
                        const WidgetIcon = widget.icon;
                        const isWidgetIconComponent = WidgetIcon && typeof WidgetIcon === 'function';
                        
                        return (
                          <button
                            key={widget.type}
                            onClick={() => handleAddWidget(widget.type as WidgetType)}
                            className="p-4 border-2 border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-400 transition-all text-left group"
                          >
                            <div className="text-3xl mb-2 group-hover:scale-110 transition-transform flex items-center justify-center">
                              {isWidgetIconComponent ? (
                                <WidgetIcon className="w-8 h-8" />
                              ) : (
                                <span className="text-2xl">📦</span>
                              )}
                            </div>
                            <div className="text-sm font-medium text-gray-700">{widget.name}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
