import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { db } from '../../firebase/config';
import { collection, getDocs } from 'firebase/firestore';
import { allWidgets } from '../../constants/widgetCategories';
import { 
  Puzzle, 
  Eye, 
  TrendingUp,
  BarChart3,
  Search,
  Filter,
  RefreshCw,
  Star,
  Users,
  Activity
} from 'lucide-react';

interface Widget {
  id: string;
  name: string;
  category: string;
  description: string;
  usageCount: number;
  popularity: number;
  isActive: boolean;
  createdAt: Date;
  lastUsed?: Date;
  icon: string;
}

interface WidgetCategory {
  name: string;
  count: number;
  widgets: Widget[];
}

export function WidgetsTab() {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [categories, setCategories] = useState<WidgetCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWidgetStats = async () => {
      try {
        // userPages에서 위젯 사용 통계 수집
        const pagesRef = collection(db, 'userPages');
        const pagesSnapshot = await getDocs(pagesRef);
        
        const widgetUsageMap = new Map<string, number>();
        
        pagesSnapshot.docs.forEach(doc => {
          const data = doc.data();
          const widgets = data.widgets || [];
          widgets.forEach((widget: any) => {
            const count = widgetUsageMap.get(widget.type) || 0;
            widgetUsageMap.set(widget.type, count + 1);
          });
        });
        
        // widgetCategories에서 정의된 위젯 정보와 실제 사용 통계를 결합
        const widgetsData: Widget[] = allWidgets.map((widget, index) => {
          const usageCount = widgetUsageMap.get(widget.type) || 0;
          const totalWidgets = Array.from(widgetUsageMap.values()).reduce((a, b) => a + b, 0);
          const popularity = totalWidgets > 0 ? Math.round((usageCount / totalWidgets) * 100) : 0;
          
          return {
            id: widget.type,
            name: widget.name,
            category: widget.description.includes('검색') ? '검색' : 
                     widget.description.includes('날씨') || widget.description.includes('뉴스') ? '정보' :
                     widget.description.includes('할 일') || widget.description.includes('메모') ? '생산성' :
                     widget.description.includes('환율') || widget.description.includes('주식') ? '금융' : '기타',
            description: widget.description,
            usageCount,
            popularity,
            isActive: true,
            createdAt: new Date(),
            lastUsed: new Date(),
            icon: getWidgetIcon(widget.type)
          };
        }).sort((a, b) => b.usageCount - a.usageCount);
        
        setWidgets(widgetsData);
        
        // 카테고리별로 그룹화
        const categoryMap = new Map<string, Widget[]>();
        widgetsData.forEach(widget => {
          if (!categoryMap.has(widget.category)) {
            categoryMap.set(widget.category, []);
          }
          categoryMap.get(widget.category)!.push(widget);
        });

        const categoriesData: WidgetCategory[] = Array.from(categoryMap.entries()).map(([name, widgets]) => ({
          name,
          count: widgets.length,
          widgets
        }));

        setCategories(categoriesData);
        setLoading(false);
      } catch (error) {
        console.error('위젯 통계 로드 실패:', error);
        setLoading(false);
      }
    };
    
    loadWidgetStats();
  }, []);
  
  const getWidgetIcon = (type: string): string => {
    const iconMap: { [key: string]: string } = {
      'weather': '🌤️',
      'todo': '✅',
      'google_search': '🔍',
      'naver_search': '🔍',
      'calendar': '📅',
      'news': '📰',
      'bookmark': '🔖',
      'exchange': '💱',
      'stock': '📈',
      'crypto': '₿',
      'mail_services': '📧',
      'goal': '🎯',
      'reminder': '⏰',
      'quicknote': '📝',
      'quote': '💬',
      'english_words': '📚',
      'table': '📋',
      'qr': '📱',
      'rss': '📡'
    };
    return iconMap[type] || '📦';
  };

  const filteredWidgets = widgets.filter(widget => {
    const matchesCategory = selectedCategory === 'all' || widget.category === selectedCategory;
    const matchesSearch = widget.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         widget.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sortedWidgets = filteredWidgets.sort((a, b) => b.usageCount - a.usageCount);

  const getPopularityColor = (popularity: number) => {
    if (popularity >= 90) return 'bg-green-100 text-green-800';
    if (popularity >= 80) return 'bg-blue-100 text-blue-800';
    if (popularity >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getPopularityLabel = (popularity: number) => {
    if (popularity >= 90) return '매우 인기';
    if (popularity >= 80) return '인기';
    if (popularity >= 70) return '보통';
    return '낮음';
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return '오늘';
    if (days === 1) return '1일 전';
    if (days < 7) return `${days}일 전`;
    if (days < 30) return `${Math.floor(days / 7)}주 전`;
    return `${Math.floor(days / 30)}개월 전`;
  };

  const totalUsage = widgets.reduce((sum, widget) => sum + widget.usageCount, 0);
  const activeWidgets = widgets.filter(widget => widget.isActive).length;
  const avgPopularity = Math.round(widgets.reduce((sum, widget) => sum + widget.popularity, 0) / widgets.length);

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">위젯 관리</h2>
            <p className="text-gray-600">
              총 {widgets.length}개의 위젯 (활성: {activeWidgets}개)
            </p>
          </div>
        </div>
      </Card>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">총 위젯</p>
              <p className="text-2xl font-bold text-gray-900">{widgets.length}</p>
            </div>
            <Puzzle className="w-8 h-8 text-blue-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">총 사용량</p>
              <p className="text-2xl font-bold text-green-600">{totalUsage.toLocaleString()}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-green-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">평균 인기도</p>
              <p className="text-2xl font-bold text-purple-600">{avgPopularity}%</p>
            </div>
            <Star className="w-8 h-8 text-purple-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">활성 위젯</p>
              <p className="text-2xl font-bold text-orange-600">{activeWidgets}</p>
            </div>
            <Activity className="w-8 h-8 text-orange-500" />
          </div>
        </Card>
      </div>

      {/* 카테고리별 통계 */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">카테고리별 통계</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((category) => (
            <div key={category.name} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{category.name}</h4>
                <Badge>{category.count}개</Badge>
              </div>
              <div className="text-sm text-gray-600">
                총 사용량: {category.widgets.reduce((sum, widget) => sum + widget.usageCount, 0).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 필터 & 검색 */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="위젯 이름, 설명으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm"
          >
            <option value="all">전체 카테고리</option>
            {categories.map(category => (
              <option key={category.name} value={category.name}>
                {category.name} ({category.count})
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* 위젯 목록 */}
      {loading ? (
        <Card className="p-8 text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-gray-400" />
          <p className="text-gray-500">로딩 중...</p>
        </Card>
      ) : sortedWidgets.length === 0 ? (
        <Card className="p-8 text-center">
          <Puzzle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500">위젯이 없습니다.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedWidgets.map((widget) => (
            <Card key={widget.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{widget.icon}</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{widget.name}</h3>
                    <Badge className="text-xs mt-1">{widget.category}</Badge>
                  </div>
                </div>
                <Badge className={getPopularityColor(widget.popularity)}>
                  {getPopularityLabel(widget.popularity)}
                </Badge>
              </div>

              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {widget.description}
              </p>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-gray-500">
                    <Eye className="w-3 h-3" />
                    사용량
                  </div>
                  <span className="font-medium">{widget.usageCount.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-gray-500">
                    <TrendingUp className="w-3 h-3" />
                    인기도
                  </div>
                  <span className="font-medium">{widget.popularity}%</span>
                </div>

                {widget.lastUsed && (
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-gray-500">
                      <Activity className="w-3 h-3" />
                      마지막 사용
                    </div>
                    <span className="font-medium">{formatTimeAgo(widget.lastUsed)}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${widget.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <span className="text-xs text-gray-500">
                      {widget.isActive ? '활성' : '비활성'}
                    </span>
                  </div>
                  <Button variant="outline" size="sm">
                    설정
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}



