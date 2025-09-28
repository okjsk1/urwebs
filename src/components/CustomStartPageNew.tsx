import { useState, useEffect, useRef } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
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
  Search,
  Trash2,
  Check,
  Minus,
  Equal,
  Delete
} from 'lucide-react';

interface Widget {
  id: string;
  type: 'clock' | 'weather' | 'calendar' | 'todo' | 'favorites' | 'calculator' | 'notes' | 'news' | 'naver-search' | 'google-search';
  title: string;
  gridX: number;
  gridY: number;
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
  'bg-gradient-to-br from-pink-200 to-rose-300',
  'bg-gradient-to-br from-purple-200 to-indigo-300',
  'bg-gradient-to-br from-blue-200 to-cyan-300',
  'bg-gradient-to-br from-green-200 to-emerald-300',
  'bg-gradient-to-br from-yellow-200 to-orange-300',
  'bg-gradient-to-br from-indigo-200 to-purple-300',
  'bg-gradient-to-br from-gray-100 to-slate-200',
  'bg-gradient-to-br from-white to-gray-100'
];

const DEFAULT_WIDGETS: Widget[] = [
  { id: 'clock_default', type: 'clock', title: '시계', gridX: 0, gridY: 0, width: 2, height: 1 },
  { id: 'naver_search_default', type: 'naver-search', title: '네이버 검색', gridX: 2, gridY: 0, width: 2, height: 1 },
  { id: 'google_search_default', type: 'google-search', title: '구글 검색', gridX: 4, gridY: 0, width: 2, height: 1 },
  { id: 'weather_default', type: 'weather', title: '날씨', gridX: 0, gridY: 1, width: 1, height: 1 },
  { id: 'todo_default', type: 'todo', title: '할 일', gridX: 1, gridY: 1, width: 1, height: 2 },
  { id: 'favorites_default', type: 'favorites', title: '즐겨찾기', gridX: 2, gridY: 1, width: 2, height: 2 },
  { id: 'calculator_default', type: 'calculator', title: '계산기', gridX: 4, gridY: 1, width: 1, height: 2 },
  { id: 'notes_default', type: 'notes', title: '메모', gridX: 5, gridY: 1, width: 1, height: 1 },
  { id: 'calendar_default', type: 'calendar', title: '달력', gridX: 0, gridY: 2, width: 1, height: 1 },
  { id: 'news_default', type: 'news', title: '뉴스', gridX: 5, gridY: 2, width: 1, height: 1 }
];

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

export function CustomStartPageNew() {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedBackground, setSelectedBackground] = useState(BACKGROUNDS[0]);
  const [showWidgetSelector, setShowWidgetSelector] = useState(false);
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [currentTime, setCurrentTime] = useState(new Date());
  const gridRef = useRef<HTMLDivElement>(null);
  
  // 위젯별 상태
  const [todoItems, setTodoItems] = useState<TodoItem[]>([
    { id: '1', text: '프로젝트 완료', completed: false },
    { id: '2', text: '회의 준비', completed: false },
    { id: '3', text: '이메일 확인', completed: true }
  ]);
  const [newTodoText, setNewTodoText] = useState('');
  const [calculatorDisplay, setCalculatorDisplay] = useState('0');
  const [calculatorPrevValue, setCalculatorPrevValue] = useState<number | null>(null);
  const [calculatorOperation, setCalculatorOperation] = useState<string | null>(null);
  const [calculatorWaitingForValue, setCalculatorWaitingForValue] = useState(false);
  const [notes, setNotes] = useState('여기에 메모를 작성하세요...');

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
      gridX: 0,
      gridY: 3,
      width: 1,
      height: 1
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

  // Todo 기능
  const addTodo = () => {
    if (newTodoText.trim()) {
      const newTodo: TodoItem = {
        id: Date.now().toString(),
        text: newTodoText.trim(),
        completed: false
      };
      setTodoItems([...todoItems, newTodo]);
      setNewTodoText('');
    }
  };

  const toggleTodo = (id: string) => {
    setTodoItems(todoItems.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const deleteTodo = (id: string) => {
    setTodoItems(todoItems.filter(item => item.id !== id));
  };

  // Calculator 기능
  const inputNumber = (num: string) => {
    if (calculatorWaitingForValue) {
      setCalculatorDisplay(num);
      setCalculatorWaitingForValue(false);
    } else {
      setCalculatorDisplay(calculatorDisplay === '0' ? num : calculatorDisplay + num);
    }
  };

  const inputOperation = (nextOperation: string) => {
    const inputValue = parseFloat(calculatorDisplay);

    if (calculatorPrevValue === null) {
      setCalculatorPrevValue(inputValue);
    } else if (calculatorOperation) {
      const currentValue = calculatorPrevValue || 0;
      const newValue = calculate(currentValue, inputValue, calculatorOperation);

      setCalculatorDisplay(String(newValue));
      setCalculatorPrevValue(newValue);
    }

    setCalculatorWaitingForValue(true);
    setCalculatorOperation(nextOperation);
  };

  const calculate = (firstValue: number, secondValue: number, operation: string) => {
    switch (operation) {
      case '+':
        return firstValue + secondValue;
      case '-':
        return firstValue - secondValue;
      case '*':
        return firstValue * secondValue;
      case '/':
        return firstValue / secondValue;
      case '=':
        return secondValue;
      default:
        return secondValue;
    }
  };

  const performCalculation = () => {
    const inputValue = parseFloat(calculatorDisplay);

    if (calculatorPrevValue !== null && calculatorOperation) {
      const newValue = calculate(calculatorPrevValue, inputValue, calculatorOperation);
      setCalculatorDisplay(String(newValue));
      setCalculatorPrevValue(null);
      setCalculatorOperation(null);
      setCalculatorWaitingForValue(true);
    }
  };

  const clearCalculator = () => {
    setCalculatorDisplay('0');
    setCalculatorPrevValue(null);
    setCalculatorOperation(null);
    setCalculatorWaitingForValue(false);
  };

  const getGridPosition = (e: MouseEvent) => {
    if (!gridRef.current) return { x: 0, y: 0 };
    
    const rect = gridRef.current.getBoundingClientRect();
    const cellWidth = rect.width / 6;
    const cellHeight = 120; // 각 셀의 높이
    
    const x = Math.floor((e.clientX - rect.left) / cellWidth);
    const y = Math.floor((e.clientY - rect.top) / cellHeight);
    
    return { x: Math.max(0, Math.min(5, x)), y: Math.max(0, y) };
  };

  const handleDragStart = (e: React.DragEvent, widgetId: string) => {
    if (!isEditMode) return;
    setDraggedWidget(widgetId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedWidget) return;

    const position = getGridPosition(e.nativeEvent);
    
    const updatedWidgets = widgets.map(widget =>
      widget.id === draggedWidget
        ? { ...widget, gridX: position.x, gridY: position.y }
        : widget
    );

    saveWidgets(updatedWidgets);
    setDraggedWidget(null);
  };

  const getFavorites = (): FavoriteSite[] => {
    const favorites: FavoriteSite[] = [];
    
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('favorites_')) {
        try {
          const categoryFavorites = JSON.parse(localStorage.getItem(key) || '[]');
          categoryFavorites.forEach((siteId: string) => {
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
    
    return favorites.slice(0, 8);
  };

  const renderWidget = (widget: Widget) => {
    const content = (() => {
      switch (widget.type) {
        case 'clock':
          return (
            <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
              <div className="text-3xl font-bold text-indigo-600 mb-1">
                {currentTime.toLocaleTimeString('ko-KR', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: false 
                })}
              </div>
              <div className="text-sm text-indigo-500">
                {currentTime.toLocaleDateString('ko-KR', {
                  month: 'long',
                  day: 'numeric',
                  weekday: 'short'
                })}
              </div>
            </div>
          );
        
        case 'weather':
          return (
            <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg">
              <CloudSun className="w-8 h-8 text-cyan-500 mb-2" />
              <div className="text-lg font-bold text-cyan-700">22°C</div>
              <div className="text-xs text-cyan-600">서울, 맑음</div>
            </div>
          );
        
        case 'naver-search':
          return (
            <div className="h-full p-2 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 bg-emerald-400 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-xs">N</span>
                </div>
                <h3 className="font-bold text-emerald-700 text-sm">네이버</h3>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault();
                const query = (e.target as any).query.value;
                window.open(`https://search.naver.com/search.naver?query=${encodeURIComponent(query)}`, '_blank');
              }}>
                <input
                  name="query"
                  placeholder="검색어 입력"
                  className="w-full px-2 py-1 text-sm border border-emerald-200 rounded focus:outline-none focus:ring-1 focus:ring-emerald-400 bg-white"
                />
              </form>
            </div>
          );

        case 'google-search':
          return (
            <div className="h-full p-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 bg-blue-400 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-xs">G</span>
                </div>
                <h3 className="font-bold text-blue-700 text-sm">구글</h3>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault();
                const query = (e.target as any).query.value;
                window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
              }}>
                <input
                  name="query"
                  placeholder="검색어 입력"
                  className="w-full px-2 py-1 text-sm border border-blue-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white"
                />
              </form>
            </div>
          );
        
        case 'favorites':
          return (
            <div className="h-full p-2">
              <h3 className="font-bold mb-2 text-gray-800 text-sm">즐겨찾기</h3>
              <div className="grid grid-cols-2 gap-1 text-xs">
                {getFavorites().slice(0, 6).map((site, idx) => (
                  <div key={idx} className="flex items-center gap-1 p-1 hover:bg-gray-50 rounded">
                    <div className="w-3 h-3 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-xs">{site.name.charAt(0)}</span>
                    </div>
                    <span className="text-gray-700 truncate flex-1">{site.name}</span>
                  </div>
                ))}
                {getFavorites().length === 0 && (
                  <div className="col-span-2 text-center text-gray-500 text-xs py-4">
                    즐겨찾기한 사이트가 없습니다
                  </div>
                )}
              </div>
            </div>
          );
        
        case 'todo':
          return (
            <div className="h-full p-2 flex flex-col">
              <h3 className="font-bold mb-2 text-gray-800 text-sm">할 일</h3>
              <div className="flex-1 overflow-y-auto space-y-1">
                {todoItems.slice(0, 4).map((item) => (
                  <div key={item.id} className="flex items-center gap-1 text-xs group">
                    <input 
                      type="checkbox" 
                      checked={item.completed}
                      onChange={() => toggleTodo(item.id)}
                      className="w-3 h-3 accent-pink-400" 
                    />
                    <span className={`flex-1 truncate ${item.completed ? 'line-through text-gray-400' : ''}`}>
                      {item.text}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTodo(item.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-0 h-3 w-3"
                    >
                      <X className="w-2 h-2 text-red-400" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex gap-1 mt-2">
                <Input
                  value={newTodoText}
                  onChange={(e) => setNewTodoText(e.target.value)}
                  placeholder="새 할 일"
                  className="text-xs h-6 border-pink-200 focus:border-pink-400"
                  onKeyPress={(e) => e.key === 'Enter' && addTodo()}
                />
                <Button
                  onClick={addTodo}
                  size="sm"
                  className="h-6 w-6 p-0 bg-pink-400 hover:bg-pink-500"
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            </div>
          );
        
        case 'calculator':
          return (
            <div className="h-full p-2 flex flex-col">
              <h3 className="font-bold mb-2 text-gray-800 text-sm">계산기</h3>
              <div className="flex-1 space-y-1">
                <div className="bg-gray-50 p-1 rounded text-right text-xs font-mono border border-purple-200">
                  {calculatorDisplay}
                </div>
                <div className="grid grid-cols-4 gap-1">
                  <Button 
                    onClick={clearCalculator}
                    variant="outline" 
                    size="sm" 
                    className="h-4 text-xs p-0 bg-red-50 border-red-200 hover:bg-red-100"
                  >
                    C
                  </Button>
                  <Button 
                    onClick={() => inputOperation('/')}
                    variant="outline" 
                    size="sm" 
                    className="h-4 text-xs p-0 bg-purple-50 border-purple-200 hover:bg-purple-100"
                  >
                    ÷
                  </Button>
                  <Button 
                    onClick={() => inputOperation('*')}
                    variant="outline" 
                    size="sm" 
                    className="h-4 text-xs p-0 bg-purple-50 border-purple-200 hover:bg-purple-100"
                  >
                    ×
                  </Button>
                  <Button 
                    onClick={() => inputOperation('-')}
                    variant="outline" 
                    size="sm" 
                    className="h-4 text-xs p-0 bg-purple-50 border-purple-200 hover:bg-purple-100"
                  >
                    -
                  </Button>
                  {['7','8','9'].map(num => (
                    <Button 
                      key={num}
                      onClick={() => inputNumber(num)}
                      variant="outline" 
                      size="sm" 
                      className="h-4 text-xs p-0 border-gray-200 hover:bg-gray-50"
                    >
                      {num}
                    </Button>
                  ))}
                  <Button 
                    onClick={() => inputOperation('+')}
                    variant="outline" 
                    size="sm" 
                    className="h-4 text-xs p-0 bg-purple-50 border-purple-200 hover:bg-purple-100 row-span-2"
                  >
                    +
                  </Button>
                  {['4','5','6'].map(num => (
                    <Button 
                      key={num}
                      onClick={() => inputNumber(num)}
                      variant="outline" 
                      size="sm" 
                      className="h-4 text-xs p-0 border-gray-200 hover:bg-gray-50"
                    >
                      {num}
                    </Button>
                  ))}
                  {['1','2','3'].map(num => (
                    <Button 
                      key={num}
                      onClick={() => inputNumber(num)}
                      variant="outline" 
                      size="sm" 
                      className="h-4 text-xs p-0 border-gray-200 hover:bg-gray-50"
                    >
                      {num}
                    </Button>
                  ))}
                  <Button 
                    onClick={performCalculation}
                    variant="outline" 
                    size="sm" 
                    className="h-4 text-xs p-0 bg-green-50 border-green-200 hover:bg-green-100 row-span-2"
                  >
                    =
                  </Button>
                  <Button 
                    onClick={() => inputNumber('0')}
                    variant="outline" 
                    size="sm" 
                    className="h-4 text-xs p-0 border-gray-200 hover:bg-gray-50 col-span-2"
                  >
                    0
                  </Button>
                  <Button 
                    onClick={() => inputNumber('.')}
                    variant="outline" 
                    size="sm" 
                    className="h-4 text-xs p-0 border-gray-200 hover:bg-gray-50"
                  >
                    .
                  </Button>
                </div>
              </div>
            </div>
          );
        
        case 'notes':
          return (
            <div className="h-full p-2 flex flex-col">
              <h3 className="font-bold mb-2 text-gray-800 text-sm">메모</h3>
              <Textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="flex-1 text-xs border-yellow-200 focus:border-yellow-400 resize-none"
                placeholder="메모 작성..."
              />
            </div>
          );
        
        case 'news':
          return (
            <div className="h-full p-2">
              <h3 className="font-bold mb-2 text-gray-800 text-sm">뉴스</h3>
              <div className="space-y-1 text-xs">
                <div className="p-1 border-l-2 border-blue-500 bg-blue-50">
                  <div className="font-medium text-blue-800">기술</div>
                  <div className="text-gray-600">AI 발전...</div>
                </div>
                <div className="p-1 border-l-2 border-green-500 bg-green-50">
                  <div className="font-medium text-green-800">경제</div>
                  <div className="text-gray-600">투자 동향...</div>
                </div>
              </div>
            </div>
          );

        case 'calendar':
          return (
            <div className="h-full p-2">
              <h3 className="font-bold mb-2 text-gray-800 text-sm">달력</h3>
              <div className="text-center">
                <div className="text-xl font-bold text-blue-600 mb-1">
                  {currentTime.getDate()}
                </div>
                <div className="text-xs text-gray-600">
                  {currentTime.toLocaleDateString('ko-KR', {
                    month: 'long'
                  })}
                </div>
              </div>
            </div>
          );
        
        default:
          return <div>위젯</div>;
      }
    })();

    return (
      <div
        key={widget.id}
        draggable={isEditMode}
        onDragStart={(e) => handleDragStart(e, widget.id)}
        className={`
          ${widget.width === 2 ? 'col-span-2' : 'col-span-1'}
          ${widget.height === 2 ? 'row-span-2' : 'row-span-1'}
        `}
        style={{
          gridColumnStart: widget.gridX + 1,
          gridRowStart: widget.gridY + 1,
        }}
      >
        <Card className={`h-full bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border-0 ${
          isEditMode ? 'cursor-move border-2 border-dashed border-blue-300' : ''
        } ${draggedWidget === widget.id ? 'opacity-50' : ''}`}>
          {isEditMode && (
            <div className="absolute -top-2 -right-2 flex gap-1 z-10">
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
      </div>
    );
  };

  return (
    <div 
      className={`min-h-screen ${selectedBackground} relative p-4`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
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

      {/* 6컬럼 그리드 - 구분선 제거 */}
      <div 
        ref={gridRef}
        className="grid grid-cols-6 gap-4 auto-rows-[120px] max-w-7xl mx-auto"
      >
        {widgets.map(renderWidget)}
        
        {widgets.length === 0 && (
          <div className="col-span-6 flex items-center justify-center">
            <Card className="p-8 text-center bg-white/90 backdrop-blur shadow-xl">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">환영합니다! 🎉</h2>
              <p className="text-gray-600 mb-6">
                6컬럼 그리드 기반의 개인화된 시작페이지입니다.<br />
                드래그로 위젯을 자유롭게 이동하고 배치할 수 있습니다.
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