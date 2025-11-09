// 환율 정보 위젯 - 간단한 정적 데이터 버전
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';
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
    const gridSize = (widget as any)?.gridSize;
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

const KOREAN_CURRENCY: Record<string, string> = {
  KRW: '원화',
  USD: '달러',
  JPY: '엔화',
  EUR: '유로화',
  GBP: '파운드화',
  CNY: '위안화',
  AUD: '호주달러',
  CAD: '캐나다달러',
  CHF: '스위스프랑',
  SGD: '싱가포르달러',
  HKD: '홍콩달러',
};

const getKoName = (code?: string) => (code && KOREAN_CURRENCY[code]) || code || '';

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
      {/* 환율 목록 */}
      <ul className={`flex-1 overflow-y-auto ${typography.listGap}`}>
        {filteredAndSortedRates.slice(0, 5).map((rate) => {
          const koPairLabel = `${getKoName(rate.fromCurrency)}/${getKoName(rate.toCurrency)}`;
          const isUp = (rate.changePercent || 0) >= 0;
          return (
            <li
              key={rate.id}
              draggable={isEditMode}
              onDragStart={(e) => startDrag(e, rate.id)}
              onDragOver={(e) => overDrag(e, rate.id)}
              onDrop={(e) => dropDrag(e, rate.id)}
              className={`group rounded-xl ${typography.cardPadding} border border-black/5 bg-white/80 dark:bg-zinc-900/70 shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-800/60 focus-within:bg-zinc-50 dark:focus-within:bg-zinc-800/60 ${dragOverId === rate.id ? 'ring-2 ring-indigo-400' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <div className="text-[12px] font-medium text-zinc-700 dark:text-zinc-300">
                    {koPairLabel}
                  </div>
                  <div
                    className={`mt-0.5 ${typography.rate} font-semibold tabular-nums text-zinc-900 dark:text-zinc-100`}
                  >
                    {formatFxRate(rate.rate, rate.fromCurrency, rate.toCurrency)}
                    <span className={`${typography.currency} ml-1 opacity-70`}>
                      {rate.toCurrency === 'KRW' ? '원' : getKoName(rate.toCurrency)}
                    </span>
                  </div>
                  <div
                    className={[
                      'mt-1 inline-flex items-center rounded-md px-1.5 py-[2px] text-[11px] font-medium',
                      isUp
                        ? 'text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-950/40'
                        : 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40',
                    ].join(' ')}
                    aria-label={`변동률 ${Math.abs(rate.changePercent || 0).toFixed(2)}%`}
                  >
                    {isUp ? '🔺' : '🔻'}
                    <span className="ml-1 tabular-nums">
                      {Math.abs(rate.changePercent || 0).toFixed(2)}%
                    </span>
                  </div>
                </div>
                <div className="ml-2 flex flex-col items-end gap-1">
                  {isEditMode && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWatch(rate.id);
                      }}
                      className={`h-6 rounded-md border border-black/10 px-2 text-[11px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                        rate.isWatched
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300'
                          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                      }`}
                      aria-pressed={rate.isWatched}
                    >
                      {rate.isWatched ? '관심' : '관심 추가'}
                    </button>
                  )}
                  {isEditMode && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteExchangeRate(rate.id);
                      }}
                      className="invisible group-hover:visible h-7 w-7 grid place-items-center rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                      aria-label="삭제"
                      title="삭제"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

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
