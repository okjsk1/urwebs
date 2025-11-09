// 환율 정보 위젯 - 간단한 정적 데이터 버전
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '../ui/button';
import { TrendingUp, TrendingDown, Globe, Bell, Plus, Settings, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { WidgetProps, persistOrLocal, readLocal, showToast, addToWidgetCollection } from './utils/widget-helpers';

interface ExchangeRate {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  change?: number;
  changePercent?: number;
  lastUpdate: number;
  isWatched: boolean;
  alertEnabled: boolean;
  targetRate?: number;
  lastAlertTime?: number;
}

interface ExchangeState {
  rates: ExchangeRate[];
  showAddForm: boolean;
  newRate: Partial<ExchangeRate>;
  editingRate: string | null;
  sortBy: 'currency' | 'rate' | 'change';
  sortOrder: 'asc' | 'desc';
  showOnlyWatched: boolean;
  refreshInterval: number;
  lastRefresh: number;
  baseCurrency: string;
  status: 'idle' | 'loading' | 'live' | 'stale' | 'error';
  notificationPermission: boolean;
}

const DEFAULT_RATES: ExchangeRate[] = [
  {
    id: '1',
    fromCurrency: 'USD',
    toCurrency: 'KRW',
    rate: 1420.50,
    change: 5.20,
    changePercent: 0.39,
    lastUpdate: Date.now(),
    isWatched: true,
    alertEnabled: false
  },
  {
    id: '2',
    fromCurrency: 'EUR',
    toCurrency: 'KRW',
    rate: 1540.80,
    change: -8.70,
    changePercent: -0.60,
    lastUpdate: Date.now(),
    isWatched: true,
    alertEnabled: false
  },
  {
    id: '3',
    fromCurrency: 'JPY',
    toCurrency: 'KRW',
    rate: 9.45,
    change: 0.12,
    changePercent: 1.36,
    lastUpdate: Date.now(),
    isWatched: false,
    alertEnabled: false
  }
];

// 간단한 포맷팅 함수들
const formatFxRate = (rate: number, from: string, to: string): string => {
  return rate.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

const formatChangePct = (changePct: number): string => {
  const sign = changePct >= 0 ? '+' : '';
  return `${sign}${changePct.toFixed(2)}%`;
};

export const ExchangeWidget = ({ widget, isEditMode, updateWidget }: WidgetProps) => {
  const [state, setState] = useState(() => {
    const saved = readLocal(widget.id, {
      rates: DEFAULT_RATES,
      showAddForm: false,
      newRate: {},
      editingRate: null,
      sortBy: 'change',
      sortOrder: 'desc',
      showOnlyWatched: false,
      refreshInterval: 60000,
      lastRefresh: Date.now(),
      baseCurrency: 'KRW',
      status: 'live' as const,
      notificationPermission: false
    });
    // 저장된 데이터에 status가 없으면 기본값 설정
    if (!saved.status) {
      saved.status = 'live';
    }
    // 기본 정렬: USD, JPY 우선
    saved.rates = (saved.rates || []).sort((a: any, b: any) => {
      const order = ['USD', 'JPY'];
      const ai = order.indexOf(a.fromCurrency);
      const bi = order.indexOf(b.fromCurrency);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    });
    return saved;
  });

  // 상태 저장
  useEffect(() => {
    persistOrLocal(widget.id, state, updateWidget);
  }, [widget.id, state, updateWidget]);

  // 컬렉션에 등록
  useEffect(() => {
    addToWidgetCollection('exchange');
  }, []);

  const addExchangeRate = useCallback(() => {
    const { fromCurrency, toCurrency, rate } = state.newRate;
    
    if (!fromCurrency || !toCurrency) {
      showToast('통화를 선택하세요', 'error');
      return;
    }
    
    if (fromCurrency === toCurrency) {
      showToast('서로 다른 통화를 선택하세요', 'error');
      return;
    }

    const duplicate = state.rates.find(r => 
      r.fromCurrency === fromCurrency && r.toCurrency === toCurrency
    );
    if (duplicate) {
      showToast('이미 존재하는 환율입니다', 'error');
      return;
    }

    const newRate: ExchangeRate = {
      id: Date.now().toString(),
      fromCurrency: fromCurrency!,
      toCurrency: toCurrency!,
      rate: rate || 1,
      change: 0,
      changePercent: 0,
      lastUpdate: Date.now(),
      isWatched: false,
      alertEnabled: false
    };

    setState(prev => ({
      ...prev,
      rates: [...prev.rates, newRate],
      newRate: {},
      showAddForm: false
    }));
    showToast('환율이 추가되었습니다', 'success');
  }, [state.newRate, state.rates]);

  const updateExchangeRate = useCallback((id: string, updates: Partial<ExchangeRate>) => {
    setState(prev => ({
      ...prev,
      rates: prev.rates.map(rate => 
        rate.id === id ? { ...rate, ...updates } : rate
      ),
      editingRate: null
    }));
    showToast('환율 정보가 업데이트되었습니다', 'success');
  }, []);

  const deleteExchangeRate = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      rates: prev.rates.filter(rate => rate.id !== id)
    }));
    showToast('환율이 삭제되었습니다', 'success');
  }, []);

  const toggleWatch = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      rates: prev.rates.map(rate => 
        rate.id === id ? { ...rate, isWatched: !rate.isWatched } : rate
      )
    }));
  }, []);

  const toggleAlert = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      rates: prev.rates.map(rate => 
        rate.id === id ? { ...rate, alertEnabled: !rate.alertEnabled } : rate
      )
    }));
  }, []);

  // 드래그 정렬 전용 상태
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const layoutVariant = useMemo(() => {
    const { gridSize } = widget;
    const w = gridSize?.w ?? 1;
    const h = gridSize?.h ?? 1;
    if (w === 1 && h <= 3) {
      return 'compact';
    }
    return 'default';
  }, [widget]);

  const typography = useMemo(
    () =>
      layoutVariant === 'compact'
        ? {
            rootPadding: 'p-1.5',
            cardPadding: 'px-2.5 py-1.5',
            flag: 'text-sm',
            code: 'text-xs',
            rate: 'text-sm',
            currency: 'text-[10px]',
            change: 'text-[11px]',
            watchButton: 'text-[11px] px-2 py-0.5',
            deleteButton: 'text-[11px]',
            actionGap: 'gap-2',
            listGap: 'space-y-1.5',
            addButtonHeight: 'h-6 text-[11px]'
          }
        : {
            rootPadding: 'p-2',
            cardPadding: 'px-3 py-2',
            flag: 'text-base',
            code: 'text-sm',
            rate: 'text-base',
            currency: 'text-xs',
            change: 'text-xs',
            watchButton: 'text-xs px-2 py-1',
            deleteButton: 'text-xs',
            actionGap: 'gap-3',
            listGap: 'space-y-2',
            addButtonHeight: 'h-7 text-xs'
          },
    [layoutVariant]
  );

  const filteredAndSortedRates = useMemo(() => {
    return [...state.rates];
  }, [state.rates]);

  const startDrag = (e: React.DragEvent, id: string) => {
    if (!isEditMode) return;
    setDraggingId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  };
  const overDrag = (e: React.DragEvent, id: string) => {
    if (!isEditMode) return;
    e.preventDefault();
    setDragOverId(id);
  };
  const dropDrag = (e: React.DragEvent, targetId: string) => {
    if (!isEditMode) return;
    e.preventDefault();
    const sourceId = draggingId || e.dataTransfer.getData('text/plain');
    if (!sourceId || sourceId === targetId) {
      setDraggingId(null); setDragOverId(null); return;
    }
    setState(prev => {
      const list = [...prev.rates];
      const from = list.findIndex(r => r.id === sourceId);
      const to = list.findIndex(r => r.id === targetId);
      if (from === -1 || to === -1) return prev;
      const [m] = list.splice(from, 1);
      list.splice(to, 0, m);
      return { ...prev, rates: list };
    });
    setDraggingId(null); setDragOverId(null);
  };

  const watchedStats = useMemo(() => {
    const watchedRates = state.rates.filter(rate => rate.isWatched);
    const averageChange = watchedRates.length > 0 
      ? watchedRates.reduce((sum, rate) => sum + rate.changePercent, 0) / watchedRates.length 
      : 0;
    
    return {
      watchedCount: watchedRates.length,
      totalCount: state.rates.length,
      averageChange
    };
  }, [state.rates]);

  const availableCurrencies: string[] = ['USD', 'EUR', 'JPY', 'GBP', 'CNY', 'AUD', 'CAD', 'CHF', 'SGD'];

  return (
    <div className={`${typography.rootPadding} h-full flex flex-col`}>
      {/* 환율 목록 - 미니멀 리스트 (국기 · 통화코드 · 굵은 가격 · 등락) */}
      <div className={`flex-1 overflow-y-auto ${typography.listGap}`}>
        {filteredAndSortedRates.slice(0, 5).map(rate => {
          const isUp = (rate.changePercent || 0) >= 0;
          const code = rate.fromCurrency;
          const flag = code === 'USD' ? '🇺🇸' : code === 'EUR' ? '🇪🇺' : code === 'JPY' ? '🇯🇵' : '🌐';
          return (
            <div
              key={rate.id}
              draggable={isEditMode}
              onDragStart={(e) => startDrag(e, rate.id)}
              onDragOver={(e) => overDrag(e, rate.id)}
              onDrop={(e) => dropDrag(e, rate.id)}
              className={`bg-white dark:bg-gray-800/80 rounded-xl ${typography.cardPadding} border border-gray-200 dark:border-gray-700 ${dragOverId === rate.id ? 'ring-2 ring-blue-400' : ''}`}
            >
              <div className={`flex items-center justify-between ${typography.actionGap}`}>
                <div className="flex items-center gap-2">
                  <span className={`${typography.flag} leading-none`}>{flag}</span>
                  <span className={`${typography.code} font-semibold text-gray-900 dark:text-gray-100`}>{code}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className={`${typography.rate} font-extrabold tracking-tight text-gray-900 dark:text-gray-100`}>
                    {formatFxRate(rate.rate, rate.fromCurrency, rate.toCurrency)}
                    <span className={`${typography.currency} font-semibold ml-0.5`}>원</span>
                  </div>
                  <div className={`flex items-center gap-1 ${typography.change} font-semibold ${isUp ? 'text-red-600' : 'text-blue-600'}`}>
                    <span
                      className={`inline-block w-0 h-0 border-l-4 border-r-4 ${isUp ? 'border-t-0 border-b-6 border-b-red-600' : 'border-b-0 border-t-6 border-t-blue-600'}`}
                      style={{ borderLeftColor: 'transparent', borderRightColor: 'transparent' }}
                    />
                    <span>{Math.abs(rate.changePercent || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              {isEditMode && (
                <div className="mt-1 flex items-center justify-between">
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWatch(rate.id);
                      }}
                      className={`${typography.watchButton} rounded ${
                        rate.isWatched 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-gray-100 text-gray-600 hover:bg-blue-50'
                      }`}
                    >
                      {rate.isWatched ? '관심' : '관심 추가'}
                    </button>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteExchangeRate(rate.id);
                    }}
                    className={`text-red-500 hover:text-red-700 ${typography.deleteButton}`}
                  >
                    삭제
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 환율 추가 - 컴팩트 버전 */}
      {isEditMode && (
        <div className="mt-2 flex-shrink-0">
          {!state.showAddForm ? (
            <Button
              size="sm"
              variant="outline"
              className={`w-full ${typography.addButtonHeight}`}
              onClick={() => setState(prev => ({ ...prev, showAddForm: true }))}
            >
              <Plus className="w-3 h-3 mr-1" />
              환율 추가
            </Button>
          ) : (
            <div className="space-y-2 p-2 bg-gray-50 dark:bg-gray-700 rounded">
              <div className="grid grid-cols-2 gap-1">
                <select
                  value={state.newRate.fromCurrency || ''}
                  onChange={(e) => setState(prev => ({
                    ...prev,
                    newRate: { ...prev.newRate, fromCurrency: e.target.value }
                  }))}
                  className="text-xs px-1 py-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-600 dark:text-gray-100"
                >
                  <option value="">통화 선택</option>
                  {availableCurrencies.map(currency => (
                    <option key={currency} value={currency}>
                      {currency}
                    </option>
                  ))}
                </select>
                <select
                  value={state.newRate.toCurrency || ''}
                  onChange={(e) => setState(prev => ({
                    ...prev,
                    newRate: { ...prev.newRate, toCurrency: e.target.value }
                  }))}
                  className="text-xs px-1 py-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-600 dark:text-gray-100"
                >
                  <option value="">통화 선택</option>
                  {availableCurrencies.map(currency => (
                    <option key={currency} value={currency}>
                      {currency}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  className="flex-1 h-5 text-xs"
                  onClick={addExchangeRate}
                >
                  추가
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-5 text-xs"
                  onClick={() => setState(prev => ({ 
                    ...prev, 
                    showAddForm: false,
                    newRate: {}
                  }))}
                >
                  취소
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 빈 상태 */}
      {state.rates.length === 0 && (
        <div className="text-center text-gray-500 text-xs py-8">
          <div className="text-2xl mb-2">💱</div>
          <div>추가된 환율이 없습니다.</div>
          <div className="text-gray-400 mt-1">편집 모드에서 환율을 추가해보세요.</div>
        </div>
      )}
    </div>
  );
};
