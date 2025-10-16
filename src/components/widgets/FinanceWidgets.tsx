// 리팩터링된 FinanceWidgets - 고급 금융 기능과 실시간 데이터
export { StockWidget } from './StockWidget';
export { ExchangeWidget } from './ExchangeWidget';

// 기존 암호화폐 위젯 (간단한 버전 유지)
import React, { useState } from 'react';
import { Button } from '../ui/button';

export const CryptoWidget = ({ widget, isEditMode, updateWidget }: any) => {
  const [cryptos, setCryptos] = useState([
    { symbol: 'BTC', name: '비트코인', price: 42500, change: 1250, changePercent: 3.02 },
    { symbol: 'ETH', name: '이더리움', price: 2650, change: -45, changePercent: -1.67 },
    { symbol: 'ADA', name: '카르다노', price: 0.52, change: 0.03, changePercent: 6.12 },
    { symbol: 'DOT', name: '폴카닷', price: 7.85, change: -0.12, changePercent: -1.51 }
  ]);

  return (
    <div className="p-3">
      <div className="text-center mb-3">
        <div className="text-2xl mb-1">₿</div>
        <h4 className="font-semibold text-sm text-gray-800">암호화폐</h4>
      </div>
      
      <div className="space-y-2">
        {cryptos.map(crypto => (
          <div key={crypto.symbol} className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
            <div>
              <div className="text-sm font-medium text-gray-800">{crypto.symbol}</div>
              <div className="text-xs text-gray-500">{crypto.name}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-gray-800">
                ${crypto.price.toLocaleString()}
              </div>
              <div className={`text-xs ${crypto.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {crypto.change >= 0 ? '+' : ''}${crypto.change} ({crypto.changePercent}%)
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 기존 주식 알림 위젯 (간단한 버전 유지)
export const StockAlertWidget = ({ widget, isEditMode, updateWidget }: any) => {
  const [alerts, setAlerts] = useState([
    { id: 1, symbol: 'AAPL', condition: '상승', target: 180, current: 175.43, active: true },
    { id: 2, symbol: 'TSLA', condition: '하락', target: 240, current: 248.42, active: false },
    { id: 3, symbol: 'GOOGL', condition: '상승', target: 150, current: 142.56, active: true }
  ]);

  const addAlert = () => {
    const symbol = prompt('주식 심볼을 입력하세요 (예: AAPL):');
    const target = prompt('목표 가격을 입력하세요:');
    if (symbol && target) {
      const newAlert = {
        id: Date.now(),
        symbol: symbol.toUpperCase(),
        condition: '상승',
        target: parseFloat(target),
        current: Math.random() * 100 + 50,
        active: true
      };
      setAlerts([...alerts, newAlert]);
    }
  };

  return (
    <div className="p-3">
      <div className="text-center mb-3">
        <div className="text-2xl mb-1">📢</div>
        <h4 className="font-semibold text-sm text-gray-800">주식 알림</h4>
        <p className="text-xs text-gray-500">가격 알림 설정</p>
      </div>
      
      <div className="space-y-2">
        {alerts.map(alert => (
          <div key={alert.id} className={`p-2 rounded border-l-4 ${
            alert.active ? 'bg-green-50 border-green-400' : 'bg-gray-50 border-gray-300'
          }`}>
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm font-medium text-gray-800">{alert.symbol}</div>
                <div className="text-xs text-gray-500">
                  {alert.condition} 알림: ${alert.target}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-gray-800">${alert.current}</div>
                <div className={`text-xs ${alert.active ? 'text-green-600' : 'text-gray-500'}`}>
                  {alert.active ? '활성' : '비활성'}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {isEditMode && (
        <Button 
          size="sm" 
          variant="outline" 
          className="w-full h-8 text-xs mt-3"
          onClick={addAlert}
          aria-label="새 주식 알림 추가"
        >
          알림 추가
        </Button>
      )}
    </div>
  );
};

// 기존 경제 캘린더 위젯 (간단한 버전 유지)
export const EconomicCalendarWidget = ({ widget, isEditMode, updateWidget }: any) => {
  const [events, setEvents] = useState([
    { 
      id: 1, 
      title: 'FOMC 금리 결정', 
      date: '2024-01-31', 
      time: '03:00', 
      impact: 'high',
      description: '연방공개시장위원회 금리 결정 발표'
    },
    { 
      id: 2, 
      title: 'CPI 발표', 
      date: '2024-02-13', 
      time: '22:30', 
      impact: 'high',
      description: '소비자물가지수 발표'
    },
    { 
      id: 3, 
      title: '고용 통계', 
      date: '2024-02-02', 
      time: '22:30', 
      impact: 'medium',
      description: '비농업 부문 고용 통계'
    },
    { 
      id: 4, 
      title: 'GDP 발표', 
      date: '2024-01-25', 
      time: '22:30', 
      impact: 'medium',
      description: '국내총생산 발표'
    }
  ]);

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-50 border-red-400 text-red-800';
      case 'medium': return 'bg-yellow-50 border-yellow-400 text-yellow-800';
      case 'low': return 'bg-green-50 border-green-400 text-green-800';
      default: return 'bg-gray-50 border-gray-400 text-gray-800';
    }
  };

  return (
    <div className="p-3" style={{ minHeight: '300px' }}>
      <div className="text-center mb-3">
        <div className="text-2xl mb-1">📅</div>
        <h4 className="font-semibold text-sm text-gray-800">경제 캘린더</h4>
        <p className="text-xs text-gray-500">중요 경제 지표 발표</p>
      </div>
      
      <div className="space-y-2 overflow-auto" style={{ maxHeight: 'calc(100% - 56px)' }}>
        {events.map(event => (
          <div key={event.id} className={`p-2 rounded border-l-4 ${getImpactColor(event.impact)}`}>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="text-sm font-medium">{event.title}</div>
                <div className="text-xs opacity-80">{event.description}</div>
              </div>
              <div className="text-right ml-2">
                <div className="text-xs font-medium">{event.date}</div>
                <div className="text-xs opacity-80">{event.time}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 가계부 위젯은 비활성화되었습니다.
