// 주식 알림 위젯 - 조건식, 쿨다운, 브라우저 알림
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../ui/button';
import { Bell, BellOff, Plus, Trash2, Play, Pause } from 'lucide-react';
import { getQuotes, evaluateAlerts, showNotification, formatMoney, type Quote, type Alert } from '../../services/finance/api';
import { WidgetProps, persistOrLocal, readLocal, showToast } from './utils/widget-helpers';
import { useDebouncedEffect } from '../../hooks/useDebouncedEffect';

interface StockAlertState {
  alerts: Alert[];
  quotes: Record<string, Quote>;
  showAddForm: boolean;
  newAlert: Partial<Alert>;
}

const DEFAULT_ALERTS: Alert[] = [
  { id: '1', symbol: 'AAPL', condition: 'gte', target: 180, active: true, cooldownSec: 300 },
  { id: '2', symbol: 'TSLA', condition: 'lte', target: 240, active: true, cooldownSec: 300 }
];

export const StockAlertWidget: React.FC<WidgetProps> = ({ widget, isEditMode, updateWidget }) => {
  const [state, setState] = useState<StockAlertState>(() => {
    const saved = readLocal(widget.id, {
      alerts: DEFAULT_ALERTS,
      quotes: {},
      showAddForm: false,
      newAlert: { condition: 'gte' as const, cooldownSec: 300 }
    });
    return saved;
  });

  // 상태 저장 (디바운스)
  useDebouncedEffect(() => {
    persistOrLocal(widget.id, state, updateWidget);
  }, [widget.id, state], 300);

  // 시세 폴링 및 알림 평가
  useEffect(() => {
    const symbols = Array.from(new Set(state.alerts.map(a => a.symbol)));
    if (symbols.length === 0) return;

    const interval = setInterval(async () => {
      try {
        const quotes = await getQuotes(symbols, { asset: 'equity' });
        const quotesMap: Record<string, Quote> = {};
        quotes.forEach(q => { quotesMap[q.symbol] = q; });

        setState(prev => {
          const newQuotes = { ...prev.quotes, ...quotesMap };
          
          // 알림 평가
          const fired = evaluateAlerts(prev.alerts, newQuotes);
          
          if (fired.length > 0) {
            const updatedAlerts = prev.alerts.map(a => {
              if (fired.includes(a.id)) {
                const quote = newQuotes[a.symbol];
                const message = `${a.symbol}: ${formatMoney(quote.price, 'USD')} (목표: ${a.target})`;
                
                // 브라우저 알림
                showNotification('주식 알림', message);
                showToast(message, 'success');
                
                return { ...a, lastTriggeredAt: Date.now() };
              }
              return a;
            });
            
            return { ...prev, quotes: newQuotes, alerts: updatedAlerts };
          }
          
          return { ...prev, quotes: newQuotes };
        });
      } catch (error) {
        console.error('Failed to check alerts:', error);
      }
    }, 10000); // 10초마다 체크

    return () => clearInterval(interval);
  }, [state.alerts]);

  const addAlert = useCallback(() => {
    const { symbol, condition, target } = state.newAlert;
    
    if (!symbol?.trim()) {
      showToast('심볼을 입력하세요', 'error');
      return;
    }
    
    if (!target || target <= 0) {
      showToast('목표값을 입력하세요', 'error');
      return;
    }
    
    const newAlert: Alert = {
      id: Date.now().toString(),
      symbol: symbol.toUpperCase(),
      condition: condition || 'gte',
      target,
      active: true,
      cooldownSec: state.newAlert.cooldownSec || 300,
      note: state.newAlert.note
    };
    
    setState(prev => ({
      ...prev,
      alerts: [...prev.alerts, newAlert],
      showAddForm: false,
      newAlert: { condition: 'gte' as const, cooldownSec: 300 }
    }));
    
    showToast('알림이 추가되었습니다', 'success');
  }, [state.newAlert]);

  const toggleAlert = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      alerts: prev.alerts.map(a => a.id === id ? { ...a, active: !a.active } : a)
    }));
  }, []);

  const deleteAlert = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      alerts: prev.alerts.filter(a => a.id !== id)
    }));
    showToast('알림이 삭제되었습니다', 'success');
  }, []);

  const getConditionText = (condition: string, target: number) => {
    switch (condition) {
      case 'gte': return `≥ $${target}`;
      case 'lte': return `≤ $${target}`;
      case 'pctUp': return `+${target}% 이상`;
      case 'pctDown': return `-${target}% 이하`;
      default: return `${target}`;
    }
  };

  return (
    <div className="p-2 h-full flex flex-col">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-2 shrink-0">
        <div className="flex items-center gap-1">
          <Bell className="w-4 h-4 text-blue-600" />
          <h4 className="font-semibold text-sm text-gray-800">주식 알림</h4>
        </div>
        {isEditMode && (
          <button
            onClick={() => setState(prev => ({ ...prev, showAddForm: !prev.showAddForm }))}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <Plus className="w-3 h-3 text-green-600" />
          </button>
        )}
      </div>

      {/* 알림 추가 폼 */}
      {isEditMode && state.showAddForm && (
        <div className="bg-gray-50 rounded p-2 mb-2 space-y-1 shrink-0">
          <input
            type="text"
            value={state.newAlert.symbol || ''}
            onChange={(e) => setState(prev => ({
              ...prev,
              newAlert: { ...prev.newAlert, symbol: e.target.value.toUpperCase() }
            }))}
            placeholder="심볼 (예: AAPL)"
            className="w-full text-xs px-2 py-1 border border-gray-300 rounded"
          />
          <div className="grid grid-cols-2 gap-1">
            <select
              value={state.newAlert.condition || 'gte'}
              onChange={(e) => setState(prev => ({
                ...prev,
                newAlert: { ...prev.newAlert, condition: e.target.value as any }
              }))}
              className="text-xs px-2 py-1 border border-gray-300 rounded"
            >
              <option value="gte">이상 (≥)</option>
              <option value="lte">이하 (≤)</option>
              <option value="pctUp">상승률 (%)</option>
              <option value="pctDown">하락률 (%)</option>
            </select>
            <input
              type="number"
              value={state.newAlert.target || ''}
              onChange={(e) => setState(prev => ({
                ...prev,
                newAlert: { ...prev.newAlert, target: parseFloat(e.target.value) }
              }))}
              placeholder="목표값"
              className="text-xs px-2 py-1 border border-gray-300 rounded"
            />
          </div>
          <div className="flex gap-1">
            <Button size="sm" className="flex-1 h-6 text-xs" onClick={addAlert}>
              추가
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="flex-1 h-6 text-xs"
              onClick={() => setState(prev => ({
                ...prev,
                showAddForm: false,
                newAlert: { condition: 'gte' as const, cooldownSec: 300 }
              }))}
            >
              취소
            </Button>
          </div>
        </div>
      )}

      {/* 알림 목록 */}
      <div className="flex-1 overflow-y-auto space-y-1">
        {state.alerts.length === 0 ? (
          <div className="text-center text-gray-500 text-xs py-4">
            설정된 알림이 없습니다
          </div>
        ) : (
          state.alerts.map(alert => {
            const quote = state.quotes[alert.symbol];
            const isMet = quote && (
              (alert.condition === 'gte' && quote.price >= alert.target) ||
              (alert.condition === 'lte' && quote.price <= alert.target) ||
              (alert.condition === 'pctUp' && quote.changePct >= alert.target) ||
              (alert.condition === 'pctDown' && quote.changePct <= -alert.target)
            );
            
            return (
              <div
                key={alert.id}
                className={`relative p-2 rounded border-l-4 ${
                  isMet ? 'bg-yellow-50 border-yellow-400' :
                  alert.active ? 'bg-green-50 border-green-400' : 'bg-gray-50 border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="text-sm font-bold text-gray-800">{alert.symbol}</div>
                    <div className="text-xs text-gray-600">
                      {getConditionText(alert.condition, alert.target)}
                    </div>
                    {quote && (
                      <div className="text-xs text-gray-500 mt-0.5">
                        현재: ${quote.price.toFixed(2)}
                      </div>
                    )}
                  </div>
                  
                  {/* 컨트롤 */}
                  {isEditMode && (
                    <div className="flex gap-0.5">
                      <button
                        onClick={() => toggleAlert(alert.id)}
                        className={`p-0.5 rounded ${alert.active ? 'bg-green-100' : 'bg-gray-200'}`}
                        title={alert.active ? '일시정지' : '활성화'}
                      >
                        {alert.active ? (
                          <Pause className="w-3 h-3 text-green-600" />
                        ) : (
                          <Play className="w-3 h-3 text-gray-600" />
                        )}
                      </button>
                      <button
                        onClick={() => deleteAlert(alert.id)}
                        className="p-0.5 bg-red-100 hover:bg-red-200 rounded"
                        title="삭제"
                      >
                        <Trash2 className="w-3 h-3 text-red-600" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};













