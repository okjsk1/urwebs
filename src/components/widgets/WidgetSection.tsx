import React, { useState } from 'react';
import { Plus, X, Clock, Cloud, DollarSign, CheckSquare, Newspaper, TrendingUp, Link } from 'lucide-react';

interface WeatherData {
  main?: {
    temp?: number;
    humidity?: number;
  };
  weather?: Array<{
    description?: string;
    icon?: string;
  }>;
  name?: string;
}

interface ExchangeRates {
  USD?: number;
  EUR?: number;
  JPY?: number;
}

interface WidgetSectionProps {
  currentTime: Date;
  weather: WeatherData | null;
  exchangeRates: ExchangeRates | null;
}

interface Widget {
  id: string;
  name: string;
  icon: React.ReactNode;
  component: React.ReactNode;
}

export const WidgetSection: React.FC<WidgetSectionProps> = ({
  currentTime,
  weather,
  exchangeRates
}) => {
  const [activeWidgets, setActiveWidgets] = useState<string[]>([]);

  const availableWidgets: Widget[] = [
    {
      id: 'clock',
      name: '시계',
      icon: <Clock className="w-5 h-5" />,
      component: (
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-700">현재 시간</h3>
              <p className="text-2xl font-bold text-gray-900">
                {currentTime.toLocaleTimeString('ko-KR', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </p>
              <p className="text-sm text-gray-600">
                {currentTime.toLocaleDateString('ko-KR', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  weekday: 'long'
                })}
              </p>
            </div>
            <div className="text-3xl">🕐</div>
          </div>
        </div>
      )
    },
    {
      id: 'weather',
      name: '날씨',
      icon: <Cloud className="w-5 h-5" />,
      component: (
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-700">날씨</h3>
              <p className="text-2xl font-bold text-gray-900">
                {weather?.main?.temp || 22}°C
              </p>
              <p className="text-sm text-gray-600">
                {weather?.weather?.[0]?.description || '맑음'} • 습도 {weather?.main?.humidity || 65}%
              </p>
              <p className="text-xs text-gray-500">
                {weather?.name || '서울'}
              </p>
            </div>
            <div className="text-3xl">🌤️</div>
          </div>
        </div>
      )
    },
    {
      id: 'exchange',
      name: '환율',
      icon: <DollarSign className="w-5 h-5" />,
      component: (
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-700">환율</h3>
              <div className="space-y-1">
                <p className="text-sm text-gray-900">USD: {(1 / (exchangeRates?.USD || 0.00075)).toFixed(0)}원</p>
                <p className="text-sm text-gray-900">EUR: {(1 / (exchangeRates?.EUR || 0.00069)).toFixed(0)}원</p>
                <p className="text-sm text-gray-900">JPY: {(1 / (exchangeRates?.JPY || 0.11)).toFixed(0)}원</p>
              </div>
            </div>
            <div className="text-3xl">💱</div>
          </div>
        </div>
      )
    },
    {
      id: 'todos',
      name: '할일 관리',
      icon: <CheckSquare className="w-5 h-5" />,
      component: (
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-700">할일 관리</h3>
              <p className="text-2xl font-bold text-gray-900">0/5</p>
              <p className="text-sm text-gray-600">완료된 작업</p>
              <button className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded mt-1 transition-colors">
                + 할일 추가
              </button>
            </div>
            <div className="text-3xl">✅</div>
          </div>
        </div>
      )
    },
    {
      id: 'news',
      name: '뉴스',
      icon: <Newspaper className="w-5 h-5" />,
      component: (
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-900">📰 주요 뉴스</h3>
            <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded-full">실시간</span>
          </div>
          <div className="space-y-2">
            <div className="text-sm text-gray-700 hover:text-blue-600 cursor-pointer">
              • 한국 경제 성장률 3.2% 기록
            </div>
            <div className="text-sm text-gray-700 hover:text-blue-600 cursor-pointer">
              • AI 기술 발전으로 일자리 변화 예상
            </div>
            <div className="text-sm text-gray-700 hover:text-blue-600 cursor-pointer">
              • 환경 친화적 에너지 정책 발표
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'stocks',
      name: '주식',
      icon: <TrendingUp className="w-5 h-5" />,
      component: (
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-900">📈 주식</h3>
            <span className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded-full font-bold">+2.3%</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-700">KOSPI</span>
              <span className="font-bold text-green-600">2,847.23</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-700">Samsung</span>
              <span className="font-bold text-green-600">78,500원</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-700">LG</span>
              <span className="font-bold text-red-600">45,200원</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'quicklinks',
      name: '빠른 링크',
      icon: <Link className="w-5 h-5" />,
      component: (
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-900">🔗 빠른 링크</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button className="bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs py-2 px-3 rounded-lg transition-colors">
              Gmail
            </button>
            <button className="bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs py-2 px-3 rounded-lg transition-colors">
              Google Drive
            </button>
            <button className="bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs py-2 px-3 rounded-lg transition-colors">
              Notion
            </button>
            <button className="bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs py-2 px-3 rounded-lg transition-colors">
              GitHub
            </button>
          </div>
        </div>
      )
    }
  ];

  const addWidget = (widgetId: string) => {
    if (!activeWidgets.includes(widgetId)) {
      setActiveWidgets([...activeWidgets, widgetId]);
    }
  };

  const removeWidget = (widgetId: string) => {
    setActiveWidgets(activeWidgets.filter(id => id !== widgetId));
  };

  const getAvailableWidgets = () => {
    return availableWidgets.filter(widget => !activeWidgets.includes(widget.id));
  };

  const getActiveWidgets = () => {
    return availableWidgets.filter(widget => activeWidgets.includes(widget.id));
  };

  return (
    <div className="mt-12 mb-8">
      {/* 위젯 추가 버튼 */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {getAvailableWidgets().map((widget) => (
            <button
              key={widget.id}
              onClick={() => addWidget(widget.id)}
              className="flex items-center gap-2 bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700 px-3 py-2 rounded-lg transition-all duration-200 hover:shadow-md"
            >
              {widget.icon}
              <span className="text-sm font-medium">+ {widget.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 활성 위젯들 */}
      {activeWidgets.length > 0 && (
        <div className="space-y-6">
          {/* 첫 번째 행 (최대 4개) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {getActiveWidgets().slice(0, 4).map((widget) => (
              <div key={widget.id} className="relative">
                {widget.component}
                <button
                  onClick={() => removeWidget(widget.id)}
                  className="absolute top-2 right-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full p-1 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          {/* 두 번째 행 (나머지) */}
          {getActiveWidgets().length > 4 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {getActiveWidgets().slice(4).map((widget) => (
                <div key={widget.id} className="relative">
                  {widget.component}
                  <button
                    onClick={() => removeWidget(widget.id)}
                    className="absolute top-2 right-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full p-1 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 위젯이 없을 때 메시지 */}
      {activeWidgets.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-gray-50 rounded-xl p-8 border border-gray-200">
            <Plus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">위젯을 추가해보세요</h3>
            <p className="text-gray-600">위의 버튼들을 클릭하여 원하는 위젯을 추가할 수 있습니다.</p>
          </div>
        </div>
      )}
    </div>
  );
};
