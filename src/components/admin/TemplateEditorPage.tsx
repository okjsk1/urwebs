import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import { ArrowLeft, Plus, Save, Grid, Trash2, Eye, Settings, Download, X } from 'lucide-react';
import { Widget, WidgetType } from '../../types/mypage.types';
import { widgetCategories, allWidgets } from '../../constants/widgetCategories';
import {
  TodoWidget,
  BookmarkWidget,
  GoogleSearchWidget,
  NaverSearchWidget,
  LawSearchWidget,
  EnglishWordsWidget,
  WeatherWidget,
  CryptoWidget,
  EconomicCalendarWidget,
  ExchangeWidget,
  GoogleAdWidget,
  FrequentSitesWidget,
  NewsWidget
} from '../widgets';

interface TemplateEditorPageProps {
  onBack: () => void;
  onSave: (templateData: {
    name: string;
    description: string;
    category: string;
    icon: string;
    color: string;
    widgets: Widget[];
  }) => void;
  onDelete?: (templateId: string) => void;
  templateId?: string;
  initialData?: {
    name?: string;
    description?: string;
    category?: string;
    icon?: string;
    color?: string;
    widgets?: Widget[];
  };
}

export function TemplateEditorPage({ onBack, onSave, onDelete, templateId, initialData }: TemplateEditorPageProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [category, setCategory] = useState(initialData?.category || '일반');
  const [icon, setIcon] = useState(initialData?.icon || '📄');
  const [color, setColor] = useState(initialData?.color || '#3B82F6');
  const [widgets, setWidgets] = useState<Widget[]>(initialData?.widgets || []);
  const [showWidgetPanel, setShowWidgetPanel] = useState(false);
  const [draggedWidget, setDraggedWidget] = useState<Widget | null>(null);
  const [hoveredWidget, setHoveredWidget] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(!initialData);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const gridRef = useRef<HTMLDivElement>(null);

  // MyPage와 동일한 레이아웃 상수
  const COLUMNS = 8; // 메인 컬럼 개수
  const SPACING = 5; // 그리드 간격
  const [CELL_WIDTH, setCellWidth] = useState(150); // 서브셀(=메인컬럼) 너비
  const CELL_HEIGHT = 160; // 위젯 기본 높이 (MyPage 고정값)

  useEffect(() => {
    console.log('TemplateEditorPage 로드됨:', {
      templateId,
      onDelete: !!onDelete,
      initialData: !!initialData
    });
    
    if (initialData) {
      setName(initialData.name || '');
      setDescription(initialData.description || '');
      setCategory(initialData.category || '일반');
      setIcon(initialData.icon || '📄');
      setColor(initialData.color || '#3B82F6');
      setWidgets(initialData.widgets || []);
    }
  }, [initialData, templateId, onDelete]);

  const renderWidget = (widget: Widget): React.ReactNode => {
    const commonProps = {
      widget,
      onUpdate: () => {},
      onDelete: () => {}
    };

    switch (widget.type) {
      case 'weather':
        return <WeatherWidget {...commonProps} />;
      case 'todo':
        return <TodoWidget {...commonProps} />;
      case 'news':
        return <NewsWidget {...commonProps} />;
      case 'bookmark':
        return <BookmarkWidget {...commonProps} />;
      case 'social':
        return <div className="flex items-center justify-center h-full bg-gray-100 text-gray-500 text-sm">소셜 위젯</div>;
      case 'crypto':
        return <CryptoWidget {...commonProps} />;
      case 'economic_calendar':
        return <EconomicCalendarWidget {...commonProps} />;
      case 'exchange':
        return <ExchangeWidget {...commonProps} />;
      case 'google_ad':
        return <GoogleAdWidget {...commonProps} />;
      case 'frequent_sites':
        return <FrequentSitesWidget {...commonProps} />;
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
    const widgetInfo = allWidgets.find(w => w.type === type);
    if (!widgetInfo) return;

    // 새 위젯의 위치 찾기
    let x = 0;
    let y = 0;
    let found = false;

    for (let row = 0; row < 20; row++) {
      for (let col = 0; col < COLUMNS; col++) {
        const testX = col * (CELL_WIDTH + SPACING);
        const testY = row * (CELL_HEIGHT + SPACING);
        
        const isOverlapping = widgets.some(w => {
          return (
            testX < w.x + w.width &&
            testX + CELL_WIDTH > w.x &&
            testY < w.y + w.height &&
            testY + CELL_HEIGHT > w.y
          );
        });

        if (!isOverlapping) {
          x = testX;
          y = testY;
          found = true;
          break;
        }
      }
      if (found) break;
    }

    const isSearchWidget = type === 'google_search' || type === 'naver_search' || type === 'law_search';
    const width = isSearchWidget ? CELL_WIDTH * 2 + SPACING : CELL_WIDTH; // MyPage의 서브셀/메인컬럼 폭 기준
    const height = isSearchWidget ? 225 : CELL_HEIGHT;

    const newWidget: Widget = {
      id: `widget_${Date.now()}`,
      type,
      title: widgetInfo.name,
      x,
      y,
      width,
      height,
      zIndex: 1,
      size: '2x1',
      content: {}
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
    onSave({ name, description, category, icon, color, widgets });
  };

  const handleDelete = () => {
    if (onDelete && templateId) {
      onDelete(templateId);
      setShowDeleteModal(false);
      onBack(); // 삭제 후 목록으로 돌아가기
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
              {templateId && onDelete ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    console.log('삭제 버튼 클릭됨, templateId:', templateId);
                    setShowDeleteModal(true);
                  }}
                  className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  템플릿 삭제
                </Button>
              ) : (
                <div className="text-xs text-gray-500">
                  {!templateId && '새 템플릿'}
                  {!onDelete && '삭제 불가'}
                </div>
              )}
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
                className="relative min-h-[1000px] bg-white rounded-lg border border-gray-200 p-4"
                onMouseMove={draggedWidget ? handleDragMove : undefined}
                onMouseUp={handleDragEnd}
              >
                {widgets.map((widget) => (
                  <div
                    key={widget.id}
                    onMouseDown={(e) => handleDragStart(widget, e)}
                    onMouseEnter={() => setHoveredWidget(widget.id)}
                    onMouseLeave={() => setHoveredWidget(null)}
                    className="absolute cursor-move transition-shadow duration-200 hover:shadow-2xl"
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
                      
                      {hoveredWidget === widget.id && (
                        <div className="absolute top-2 right-2 flex gap-1 bg-white/95 backdrop-blur-sm rounded-lg p-1 shadow-xl border border-gray-200">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 text-red-600 hover:bg-red-50"
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              handleDeleteWidget(widget.id);
                            }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
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
        <div className="fixed inset-0 z-[99999]">
          {/* 바깥 클릭 닫기 오버레이 */}
          <div className="absolute inset-0 bg-black/20" onClick={() => setShowWidgetPanel(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white border-t-4 border-blue-500 shadow-2xl max-h-[60vh] overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">위젯 추가</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowWidgetPanel(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-4">
                {Object.entries(widgetCategories).map(([categoryKey, category]) => (
                  <div key={categoryKey}>
                    <h4 className="font-semibold text-gray-800 mb-2">
                      {category.name}
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                      {category.widgets.map((widget) => {
                        const Icon = widget.icon;
                        return (
                          <button
                            key={widget.type}
                            onClick={() => {
                              handleAddWidget(widget.type as WidgetType);
                              setShowWidgetPanel(false);
                            }}
                            className="p-3 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg transition-all text-left group"
                          >
                            <div className="text-sm font-medium text-gray-800 truncate mb-1">{widget.name}</div>
                            <div className="text-xs text-gray-500 truncate">{widget.description}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100000]">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">템플릿 삭제</h3>
                  <p className="text-sm text-gray-500">이 작업은 되돌릴 수 없습니다</p>
                </div>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-700 mb-2">
                  <strong>"{name}"</strong> 템플릿을 정말 삭제하시겠습니까?
                </p>
                <p className="text-sm text-gray-500">
                  템플릿과 관련된 모든 데이터가 영구적으로 삭제됩니다.
                </p>
              </div>
              
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteModal(false)}
                  className="px-6"
                >
                  취소
                </Button>
                <Button
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700 text-white px-6"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  삭제
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

