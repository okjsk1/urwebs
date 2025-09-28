import { useState, useEffect, useRef } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { 
  Clock, 
  Calendar, 
  CloudSun, 
  TrendingUp, 
  BookOpen, 
  Calculator,
  Plus,
  Settings,
  X,
  Move,
  Palette,
  Star,
  Search
} from 'lucide-react';

interface Widget {
  id: string;
  type: 'clock' | 'weather' | 'calendar' | 'todo' | 'bookmarks' | 'calculator' | 'notes' | 'news' | 'favorites' | 'naver-search' | 'google-search';
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface FavoriteSite {
  id: string;
  name: string;
  url: string;
  category: string;
}

const WIDGET_TYPES = [
  { id: 'clock', icon: Clock, title: '시계', description: '현재 시간 표시' },
  { id: 'weather', icon: CloudSun, title: '날씨', description: '현재 날씨 정보' },
  { id: 'calendar', icon: Calendar, title: '달력', description: '오늘 날짜 및 일정' },
  { id: 'todo', icon: BookOpen, title: '할 일', description: 'To-Do 리스트' },
  { id: 'favorites', icon: Star, title: '즐겨찾기', description: '즐겨찾기한 사이트들' },
  { id: 'naver-search', icon: Search, title: '네이버 검색', description: '네이버에서 검색' },
  { id: 'google-search', icon: Search, title: '구글 검색', description: '구글에서 검색' },
  { id: 'calculator', icon: Calculator, title: '계산기', description: '간단한 계산기' },
  { id: 'notes', icon: BookOpen, title: '메모', description: '간단한 메모장' },
  { id: 'news', icon: TrendingUp, title: '뉴스', description: '최신 뉴스' }
];

const BACKGROUNDS = [
  'bg-gradient-to-br from-blue-400 to-blue-600',
  'bg-gradient-to-br from-purple-400 to-purple-600',
  'bg-gradient-to-br from-green-400 to-green-600',
  'bg-gradient-to-br from-orange-400 to-orange-600',
  'bg-gradient-to-br from-pink-400 to-pink-600',
  'bg-gray-100',
  'bg-white'
];

const DEFAULT_WIDGETS: Widget[] = [
  {
    id: 'clock_default',
    type: 'clock',
    title: '시계',
    x: 0,
    y: 0,
    width: 2,
    height: 1
  },
  {
    id: 'naver_search_default',
    type: 'naver-search',
    title: '네이버 검색',
    x: 2,
    y: 0,
    width: 2,
    height: 1
  },
  {
    id: 'google_search_default',
    type: 'google-search',
    title: '구글 검색',
    x: 4,
    y: 0,
    width: 2,
    height: 1
  },
  {
    id: 'weather_default',
    type: 'weather',
    title: '날씨',
    x: 0,
    y: 1,
    width: 1,
    height: 1
  },
  {
    id: 'todo_default',
    type: 'todo',
    title: '할 일',
    x: 1,
    y: 1,
    width: 1,
    height: 2
  },
  {
    id: 'favorites_default',
    type: 'favorites',
    title: '즐겨찾기',
    x: 2,
    y: 1,
    width: 2,
    height: 2
  },
  {
    id: 'calculator_default',
    type: 'calculator',
    title: '계산기',
    x: 4,
    y: 1,
    width: 1,
    height: 2
  },
  {
    id: 'notes_default',
    type: 'notes',
    title: '메모',
    x: 5,
    y: 1,
    width: 1,
    height: 1
  },
  {
    id: 'calendar_default',
    type: 'calendar',
    title: '달력',
    x: 0,
    y: 2,
    width: 1,
    height: 1
  },
  {
    id: 'news_default',
    type: 'news',
    title: '뉴스',
    x: 5,
    y: 2,
    width: 1,
    height: 1
  }
];

export function CustomStartPage() {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedBackground, setSelectedBackground] = useState(BACKGROUNDS[0]);
  const [showWidgetSelector, setShowWidgetSelector] = useState(false);
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const savedWidgets = localStorage.getItem('customWidgets');
    const savedBackground = localStorage.getItem('customBackground');
    
    if (savedWidgets) {
      setWidgets(JSON.parse(savedWidgets));
    } else {
      // 기본 위젯 설정
      setWidgets(DEFAULT_WIDGETS);
      localStorage.setItem('customWidgets', JSON.stringify(DEFAULT_WIDGETS));
    }
    
    if (savedBackground) {
      setSelectedBackground(savedBackground);
    }
  }, []);

  const saveWidgets = (newWidgets: Widget[]) => {
    setWidgets(newWidgets);
    localStorage.setItem('customWidgets', JSON.stringify(newWidgets));
  };

  const addWidget = (type: string) => {
    const newWidget: Widget = {
      id: `${type}_${Date.now()}`,
      type: type as any,
      title: WIDGET_TYPES.find(w => w.id === type)?.title || '위젯',
      x: Math.random() * 300,
      y: Math.random() * 200,
      width: 200,
      height: 150
    };
    saveWidgets([...widgets, newWidget]);
    setShowWidgetSelector(false);
  };

  const removeWidget = (id: string) => {
    saveWidgets(widgets.filter(w => w.id !== id));
  };

  const changeBackground = (bg: string) => {
    setSelectedBackground(bg);
    localStorage.setItem('customBackground', bg);
  };

  const handleMouseDown = (e: React.MouseEvent, widgetId: string) => {
    if (!isEditMode) return;
    
    const widget = widgets.find(w => w.id === widgetId);
    if (!widget) return;

    setDraggedWidget(widgetId);
    setDragOffset({
      x: e.clientX - widget.x,
      y: e.clientY - widget.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedWidget || !isEditMode) return;

    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;

    const updatedWidgets = widgets.map(widget =>
      widget.id === draggedWidget
        ? { ...widget, x: Math.max(0, newX), y: Math.max(0, newY) }
        : widget
    );

    setWidgets(updatedWidgets);
  };

  const handleMouseUp = () => {
    if (draggedWidget) {
      saveWidgets(widgets);
      setDraggedWidget(null);
    }
  };

  const getFavorites = (): FavoriteSite[] => {
    const favorites: FavoriteSite[] = [];
    
    // 모든 카테고리의 즐겨찾기를 수집
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('favorites_')) {
        try {
          const categoryFavorites = JSON.parse(localStorage.getItem(key) || '[]');
          categoryFavorites.forEach((siteId: string) => {
            // 실제 사이트 정보는 간단히 mock 데이터로 대체
            favorites.push({
              id: siteId,
              name: `사이트 ${siteId}`,
              url: '#',
              category: key.split('_')[1]
            });
          });
        } catch (e) {
          // 파싱 에러 무시
        }
      }
    });
    
    return favorites.slice(0, 8); // 최대 8개만 표시
  };

  const renderWidget = (widget: Widget) => {
    const baseProps = {
      key: widget.id,
      className: `absolute bg-white rounded-lg shadow-lg p-4 ${
        isEditMode ? 'cursor-move border-2 border-dashed border-blue-300' : ''
      } ${draggedWidget === widget.id ? 'opacity-80 scale-105' : ''}`,
      style: {
        left: widget.x,
        top: widget.y,
        width: widget.width,
        height: widget.height,
        zIndex: draggedWidget === widget.id ? 1000 : 1
      },
      onMouseDown: (e: React.MouseEvent) => handleMouseDown(e, widget.id)
    };

    const content = (() => {
      switch (widget.type) {
        case 'clock':
          return (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="text-3xl font-bold text-blue-600">
                {currentTime.toLocaleTimeString('ko-KR', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: false 
                })}
              </div>
              <div className="text-sm text-gray-600 mt-2">
                {currentTime.toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long'
                })}
              </div>
            </div>
          );
        
        case 'weather':
          return (
            <div className="flex flex-col items-center justify-center h-full">
              <CloudSun className="w-12 h-12 text-blue-500 mb-3" />
              <div className="text-2xl font-bold">22°C</div>
              <div className="text-sm text-gray-600">서울, 맑음</div>
              <div className="text-xs text-gray-500 mt-1">습도 45%</div>
            </div>
          );
        
        case 'favorites':
          return (
            <div className="h-full">
              <h3 className="font-bold mb-3 text-gray-800">즐겨찾기</h3>
              <div className="space-y-2 h-full overflow-hidden">
                {getFavorites().length > 0 ? getFavorites().map((site, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-xs">{site.name.charAt(0)}</span>
                    </div>
                    <span className="text-xs text-gray-700 truncate flex-1">{site.name}</span>
                  </div>
                )) : (
                  <div className="flex items-center justify-center text-gray-500 text-sm h-full">
                    아직 즐겨찾기한<br/>사이트가 없습니다
                  </div>
                )}
              </div>
            </div>
          );
        
        case 'todo':
          return (
            <div className="h-full">
              <h3 className="font-bold mb-3 text-gray-800">오늘 할 일</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 p-1">
                  <input type="checkbox" className="w-4 h-4" />
                  <span>프로젝트 마무리</span>
                </div>
                <div className="flex items-center gap-2 p-1">
                  <input type="checkbox" className="w-4 h-4" />
                  <span>회의 자료 준비</span>
                </div>
                <div className="flex items-center gap-2 p-1">
                  <input type="checkbox" className="w-4 h-4" />
                  <span>이메일 확인</span>
                </div>
                <div className="mt-4">
                  <Input placeholder="새 할 일 추가..." className="text-xs h-8" />
                </div>
              </div>
            </div>
          );
        
        case 'calculator':
          return (
            <div className="h-full">
              <h3 className="font-bold mb-2 text-gray-800">계산기</h3>
              <div className="space-y-2">
                <Input placeholder="0" className="text-sm text-right" readOnly />
                <div className="grid grid-cols-4 gap-1">
                  {['C','÷','×','-','7','8','9','+','4','5','6','=','1','2','3','0'].map(btn => (
                    <Button key={btn} variant="outline" size="sm" className="h-8 text-xs">
                      {btn}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          );
        
        case 'notes':
          return (
            <div className="h-full">
              <h3 className="font-bold mb-2 text-gray-800">메모</h3>
              <textarea 
                className="w-full flex-1 text-sm border rounded p-2 resize-none"
                placeholder="간단한 메모를 작성하세요..."
                style={{ height: 'calc(100% - 40px)' }}
              />
            </div>
          );
        
        case 'news':
          return (
            <div className="h-full">
              <h3 className="font-bold mb-2 text-gray-800">뉴스</h3>
              <div className="space-y-2 text-sm">
                <div className="p-2 border-l-3 border-blue-500 bg-blue-50">
                  <div className="font-medium text-blue-800">기술 뉴스</div>
                  <div className="text-gray-600 text-xs">AI 기술 발전으로 새로운 변화...</div>
                </div>
                <div className="p-2 border-l-3 border-green-500 bg-green-50">
                  <div className="font-medium text-green-800">경제</div>
                  <div className="text-gray-600 text-xs">새로운 투자 동향...</div>
                </div>
              </div>
            </div>
          );

        case 'calendar':
          return (
            <div className="h-full">
              <h3 className="font-bold mb-2 text-gray-800">달력</h3>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {currentTime.getDate()}
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  {currentTime.toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long'
                  })}
                </div>
                <div className="text-xs text-gray-500">
                  {currentTime.toLocaleDateString('ko-KR', { weekday: 'long' })}
                </div>
              </div>
            </div>
          );
        
        default:
          return <div>위젯</div>;
      }
    })();

    return (
      <Card {...baseProps}>
        {isEditMode && (
          <div className="absolute -top-2 -right-2 flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 rounded-full bg-white border shadow-sm"
            >
              <Move className="w-3 h-3 text-gray-600" />
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="h-6 w-6 p-0 rounded-full"
              onClick={() => removeWidget(widget.id)}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        )}
        {content}
      </Card>
    );
  };

  return (
    <div 
      className={`min-h-screen ${selectedBackground} relative p-4`}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* 상단 툴바 */}
      <div className="absolute top-4 right-4 flex gap-2 z-20">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowWidgetSelector(!showWidgetSelector)}
          className="flex items-center gap-2 bg-white shadow-md"
        >
          <Plus className="w-4 h-4" />
          위젯 추가
        </Button>
        <Button
          variant={isEditMode ? "destructive" : "secondary"}
          size="sm"
          onClick={() => setIsEditMode(!isEditMode)}
          className="flex items-center gap-2 bg-white shadow-md"
        >
          <Settings className="w-4 h-4" />
          {isEditMode ? '편집 완료' : '편집 모드'}
        </Button>
      </div>

      {/* 배경 선택 */}
      {isEditMode && (
        <Card className="absolute top-20 right-4 p-4 z-15 shadow-lg">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <Palette className="w-4 h-4" />
            배경 선택
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {BACKGROUNDS.map((bg, index) => (
              <button
                key={index}
                className={`w-12 h-12 rounded-lg ${bg} border-2 transition-all ${
                  selectedBackground === bg ? 'border-blue-500 scale-105' : 'border-gray-300 hover:border-gray-400'
                }`}
                onClick={() => changeBackground(bg)}
              />
            ))}
          </div>
        </Card>
      )}

      {/* 위젯 선택기 */}
      {showWidgetSelector && (
        <Card className="absolute top-20 right-48 p-4 z-15 shadow-lg">
          <h3 className="font-bold mb-3">위젯 추가</h3>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {WIDGET_TYPES.map((widgetType) => (
              <Button
                key={widgetType.id}
                variant="outline"
                size="sm"
                onClick={() => addWidget(widgetType.id)}
                className="w-full justify-start hover:bg-blue-50 p-3"
              >
                <widgetType.icon className="w-5 h-5 mr-3 text-blue-600" />
                <div className="text-left">
                  <div className="font-medium text-gray-900">{widgetType.title}</div>
                  <div className="text-xs text-gray-500">{widgetType.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </Card>
      )}

      {/* 편집 모드 안내 */}
      {isEditMode && (
        <div className="absolute top-4 left-4 z-15">
          <Card className="p-3 bg-blue-50 border-blue-200">
            <p className="text-sm text-blue-700 flex items-center gap-2">
              <Move className="w-4 h-4" />
              위젯을 드래그해서 이동할 수 있습니다
            </p>
          </Card>
        </div>
      )}

      {/* 위젯들 - 6컬럼 그리드 레이아웃 */}
      <div className="grid grid-cols-6 gap-4 p-4 h-screen">
        {widgets.map((widget, index) => (
          <div key={widget.id} className={`
            ${widget.type === 'clock' ? 'col-span-2' : ''}
            ${widget.type === 'weather' ? 'col-span-1' : ''}
            ${widget.type === 'todo' ? 'col-span-1' : ''}
            ${widget.type === 'favorites' ? 'col-span-1' : ''}
            ${widget.type === 'calculator' ? 'col-span-1' : ''}
            ${widget.type === 'notes' ? 'col-span-1 row-span-1' : ''}
            ${widget.type === 'news' ? 'col-span-3 row-start-2' : ''}
            ${widget.type === 'calendar' ? 'col-span-1' : ''}
          `}>
            <Card className={`h-full bg-white rounded-lg shadow-lg p-4 ${
              isEditMode ? 'cursor-move border-2 border-dashed border-blue-300' : ''
            } ${draggedWidget === widget.id ? 'opacity-80 scale-105' : ''}`}
            onMouseDown={(e: React.MouseEvent) => handleMouseDown(e, widget.id)}>
              {isEditMode && (
                <div className="absolute -top-2 -right-2 flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 rounded-full bg-white border shadow-sm"
                  >
                    <Move className="w-3 h-3 text-gray-600" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="h-6 w-6 p-0 rounded-full"
                    onClick={() => removeWidget(widget.id)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )}
              {(() => {
                switch (widget.type) {
                  case 'clock':
                    return (
                      <div className="flex flex-col items-center justify-center h-full">
                        <div className="text-4xl font-bold text-blue-600 mb-2">
                          {currentTime.toLocaleTimeString('ko-KR', { 
                            hour: '2-digit', 
                            minute: '2-digit',
                            hour12: false 
                          })}
                        </div>
                        <div className="text-sm text-gray-600">
                          {currentTime.toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            weekday: 'long'
                          })}
                        </div>
                      </div>
                    );
                  
                  case 'weather':
                    return (
                      <div className="flex flex-col items-center justify-center h-full">
                        <CloudSun className="w-10 h-10 text-blue-500 mb-2" />
                        <div className="text-xl font-bold">22°C</div>
                        <div className="text-xs text-gray-600">서울, 맑음</div>
                        <div className="text-xs text-gray-500 mt-1">습도 45%</div>
                      </div>
                    );
                  
                  case 'favorites':
                    return (
                      <div className="h-full">
                        <h3 className="font-bold mb-3 text-gray-800 text-sm">즐겨찾기</h3>
                        <div className="space-y-2 h-full overflow-hidden">
                          {getFavorites().length > 0 ? getFavorites().slice(0, 6).map((site, idx) => (
                            <div key={idx} className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded text-xs">
                              <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-bold text-xs">{site.name.charAt(0)}</span>
                              </div>
                              <span className="text-gray-700 truncate flex-1">{site.name}</span>
                            </div>
                          )) : (
                            <div className="flex items-center justify-center text-gray-500 text-xs h-full">
                              즐겨찾기한<br/>사이트가 없습니다
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  
                  case 'todo':
                    return (
                      <div className="h-full">
                        <h3 className="font-bold mb-3 text-gray-800 text-sm">할 일</h3>
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center gap-2">
                            <input type="checkbox" className="w-3 h-3" />
                            <span>프로젝트 마무리</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="checkbox" className="w-3 h-3" />
                            <span>회의 자료 준비</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="checkbox" className="w-3 h-3" />
                            <span>이메일 확인</span>
                          </div>
                        </div>
                      </div>
                    );
                  
                  case 'calculator':
                    return (
                      <div className="h-full">
                        <h3 className="font-bold mb-2 text-gray-800 text-sm">계산기</h3>
                        <div className="space-y-1">
                          <Input placeholder="0" className="text-xs text-right h-6" readOnly />
                          <div className="grid grid-cols-3 gap-1">
                            {['7','8','9','4','5','6','1','2','3'].map(btn => (
                              <Button key={btn} variant="outline" size="sm" className="h-5 text-xs p-0">
                                {btn}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  
                  case 'notes':
                    return (
                      <div className="h-full">
                        <h3 className="font-bold mb-2 text-gray-800 text-sm">메모</h3>
                        <textarea 
                          className="w-full flex-1 text-xs border rounded p-2 resize-none"
                          placeholder="메모를 작성하세요..."
                          style={{ height: 'calc(100% - 40px)' }}
                        />
                      </div>
                    );
                  
                  case 'news':
                    return (
                      <div className="h-full">
                        <h3 className="font-bold mb-2 text-gray-800 text-sm">뉴스</h3>
                        <div className="space-y-2 text-xs">
                          <div className="p-2 border-l-2 border-blue-500 bg-blue-50">
                            <div className="font-medium text-blue-800">기술 뉴스</div>
                            <div className="text-gray-600 text-xs">AI 기술 발전으로 새로운 변화가 시작되었습니다...</div>
                          </div>
                          <div className="p-2 border-l-2 border-green-500 bg-green-50">
                            <div className="font-medium text-green-800">경제</div>
                            <div className="text-gray-600 text-xs">새로운 투자 동향과 시장 전망...</div>
                          </div>
                        </div>
                      </div>
                    );

                  case 'calendar':
                    return (
                      <div className="h-full">
                        <h3 className="font-bold mb-2 text-gray-800 text-sm">달력</h3>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600 mb-1">
                            {currentTime.getDate()}
                          </div>
                          <div className="text-xs text-gray-600 mb-1">
                            {currentTime.toLocaleDateString('ko-KR', {
                              month: 'long'
                            })}
                          </div>
                          <div className="text-xs text-gray-500">
                            {currentTime.toLocaleDateString('ko-KR', { weekday: 'long' })}
                          </div>
                        </div>
                      </div>
                    );

                  case 'naver-search':
                    return (
                      <div className="h-full">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center">
                            <span className="text-white font-bold text-xs">N</span>
                          </div>
                          <h3 className="font-bold text-gray-800 text-sm">네이버</h3>
                        </div>
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          const query = (e.target as any).query.value;
                          window.open(`https://search.naver.com/search.naver?query=${encodeURIComponent(query)}`, '_blank');
                        }}>
                          <input
                            name="query"
                            placeholder="검색어를 입력하세요"
                            className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </form>
                      </div>
                    );

                  case 'google-search':
                    return (
                      <div className="h-full">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
                            <span className="text-white font-bold text-xs">G</span>
                          </div>
                          <h3 className="font-bold text-gray-800 text-sm">구글</h3>
                        </div>
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          const query = (e.target as any).query.value;
                          window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
                        }}>
                          <input
                            name="query"
                            placeholder="검색어를 입력하세요"
                            className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </form>
                      </div>
                    );
                  
                  default:
                    return <div>위젯</div>;
                }
              })()}
            </Card>
          </div>
        ))}
        
        {widgets.length === 0 && (
          <div className="col-span-6 flex items-center justify-center">
            <Card className="p-8 text-center bg-white/90 backdrop-blur shadow-xl">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">환영합니다! 🎉</h2>
              <p className="text-gray-600 mb-6">
                6컬럼 그리드 기반의 개인화된 시작페이지입니다.<br />
                시계, 날씨, 즐겨찾기 등 다양한 위젯이 기본으로 제공됩니다.
              </p>
              <Button 
                onClick={() => setShowWidgetSelector(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                위젯 추가하기
              </Button>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}