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
      refreshInterval: 600000,
      lastRefresh: Date.now(),
      baseCurrency: 'KRW',
      status: 'live' as const,
      notificationPermission: false
    });
    // 저장된 데이터에 status가 없으면 기본값 설정
    if (!saved.status) {
      saved.status = 'live';
    }
    if (!saved.refreshInterval || saved.refreshInterval < 600000) {
      saved.refreshInterval = 600000;
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

  const stateRef = React.useRef(state);
  const isMountedRef = React.useRef(true);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // 상태 저장
  useEffect(() => {
    persistOrLocal(widget.id, state, updateWidget);
  }, [widget.id, state, updateWidget]);

  // 컬렉션에 등록
  useEffect(() => {
    addToWidgetCollection('exchange');
  }, []);

  const fetchFxRate = useCallback(async (from: string, to: string): Promise<number> => {
    const url = `https://api.exchangerate.host/convert?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&_=${Date.now()}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`환율 API 응답 오류: ${response.status}`);
    }
    const data = await response.json();
    if (typeof data?.result !== 'number') {
      throw new Error('환율 데이터를 파싱할 수 없습니다.');
    }
    return data.result;
  }, []);

  const refreshRates = useCallback(async () => {
    const snapshot = stateRef.current;
    if (!snapshot || snapshot.rates.length === 0) {
      return;
    }

    setState(prev => ({
      ...prev,
      status: prev.status === 'error' ? 'error' : 'loading'
    }));

    try {
      const now = Date.now();
      const updatedRates = await Promise.all(
        snapshot.rates.map(async (item) => {
          try {
            const latest = await fetchFxRate(item.fromCurrency, item.toCurrency);
            const change = latest - item.rate;
            const changePercent = item.rate !== 0 ? (change / item.rate) * 100 : 0;
            return {
              ...item,
              rate: latest,
              change,
              changePercent,
              lastUpdate: now
            };
          } catch (error) {
            console.warn(`환율 업데이트 실패 (${item.fromCurrency}/${item.toCurrency}):`, error);
            return {
              ...item,
              lastUpdate: item.lastUpdate
            };
          }
        })
      );

      if (!isMountedRef.current) return;
      setState(prev => ({
        ...prev,
        rates: updatedRates,
        lastRefresh: now,
        status: 'live'
      }));
    } catch (error) {
      console.error('환율 새로고침 중 오류:', error);
      if (!isMountedRef.current) return;
      setState(prev => ({
        ...prev,
        status: prev.status === 'error' ? 'error' : 'stale'
      }));
    }
  }, [fetchFxRate]);

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

    const duplicate = stateRef.current.rates.find(r => 
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

    const nextRates = [...stateRef.current.rates, newRate];
    stateRef.current = {
      ...stateRef.current,
      rates: nextRates
    };

    setState(prev => ({
      ...prev,
      rates: nextRates,
      newRate: {},
      showAddForm: false
    }));
    showToast('환율이 추가되었습니다', 'success');
    refreshRates();
  }, [state.newRate, refreshRates]);

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

  useEffect(() => {
    refreshRates();
  }, [refreshRates]);

  useEffect(() => {
    if (!state.refreshInterval || state.refreshInterval < 15000) return;
    const timer = setInterval(() => {
      refreshRates();
    }, Math.max(state.refreshInterval, 600000));
    return () => clearInterval(timer);
  }, [state.refreshInterval, refreshRates]);

  // 드래그 정렬 전용 상태
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const gridSize = useMemo(() => {
    const size = (widget as any)?.gridSize;
    if (size?.w && size?.h) return size;
    const fallback = (widget as any)?.size;
    if (fallback?.w && fallback?.h) return fallback;
    return { w: 1, h: 1 };
  }, [widget]);

  const layoutVariant = useMemo(() => {
    if (gridSize.w === 1 && gridSize.h === 1) {
      return 'micro';
    }
    if (gridSize.w === 1 && gridSize.h <= 3) {
      return 'compact';
    }
    return 'default';
  }, [gridSize]);

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

  const prioritizedRates = useMemo(() => {
    const usd = state.rates.find(
      (rate) => rate.fromCurrency === 'USD' && rate.toCurrency === 'KRW'
    );
    const jpy = state.rates.find(
      (rate) => rate.fromCurrency === 'JPY' && rate.toCurrency === 'KRW'
    );
    const unique: ExchangeRate[] = [];
    [usd, jpy, ...state.rates].forEach((rate) => {
      if (rate && !unique.some((item) => item.id === rate.id)) {
        unique.push(rate);
      }
    });
    return unique.slice(0, 2);
  }, [state.rates]);

  const displayRates = useMemo(() => {
    if (layoutVariant === 'micro') {
      return prioritizedRates;
    }
    if (layoutVariant === 'compact') {
      return filteredAndSortedRates.slice(0, 4);
    }
    return filteredAndSortedRates.slice(0, 5);
  }, [layoutVariant, prioritizedRates, filteredAndSortedRates]);

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

  const formatUpdatedTime = (timestamp?: number) => {
    if (!timestamp) return '-';
    try {
      return new Date(timestamp).toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '-';
    }
  };

  if (layoutVariant === 'micro') {
    const statusBadgeClass =
      state.status === 'live'
        ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300'
        : state.status === 'loading'
        ? 'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-300'
        : state.status === 'stale'
        ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300'
        : state.status === 'error'
        ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-300'
        : 'bg-slate-100 text-slate-500 dark:bg-slate-900/40 dark:text-slate-400';

    const statusLabel =
      state.status === 'live'
        ? '실시간'
        : state.status === 'loading'
        ? '갱신 중'
        : state.status === 'stale'
        ? '지연'
        : state.status === 'error'
        ? '오류'
        : '대기';

    return (
      <div className="h-full rounded-xl bg-gradient-to-br from-slate-50/90 via-white to-slate-100/80 dark:from-slate-900/80 dark:via-slate-900/60 dark:to-slate-900/40 p-2 flex flex-col">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-200">주요 환율</span>
          <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${statusBadgeClass}`}>
            {statusLabel}
          </span>
        </div>
        <div className="flex-1 flex flex-col justify-center gap-1.5">
          {displayRates.length > 0 ? (
            displayRates.map((rate) => {
              const isUp = (rate.changePercent || 0) >= 0;
              const accentClass =
                rate.fromCurrency === 'USD'
                  ? 'border-sky-200/70 bg-white/90 dark:bg-slate-900/70 dark:border-sky-800/50'
                  : rate.fromCurrency === 'JPY'
                  ? 'border-indigo-200/70 bg-white/90 dark:bg-slate-900/70 dark:border-indigo-800/50'
                  : 'border-slate-200/70 bg-white/90 dark:bg-slate-900/70 dark:border-slate-800/50';
              return (
                <div
                  key={rate.id}
                  className={`flex items-center justify-between gap-3 rounded-lg border px-2 py-1.5 shadow-sm ${accentClass}`}
                >
                  <div className="min-w-0">
                    <div className="text-[10px] font-medium text-slate-500 dark:text-slate-300">
                      {getKoName(rate.fromCurrency)} / {getKoName(rate.toCurrency)}
                    </div>
                    <div className="mt-0.5 text-sm font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                      {formatFxRate(rate.rate, rate.fromCurrency, rate.toCurrency)}
                      <span className="ml-1 text-[10px] font-medium text-slate-400 dark:text-slate-500">
                        {rate.toCurrency === 'KRW' ? '원' : getKoName(rate.toCurrency)}
                      </span>
                    </div>
                  </div>
                  <div
                    className={`text-[10px] font-semibold ${
                      isUp
                        ? 'text-rose-500 dark:text-rose-300'
                        : 'text-emerald-500 dark:text-emerald-300'
                    }`}
                  >
                    {isUp ? '▲' : '▼'} {Math.abs(rate.changePercent || 0).toFixed(2)}%
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex-1 flex items-center justify-center text-[10px] text-slate-400 dark:text-slate-500 text-center">
              USD/KRW와 JPY/KRW 환율을 추가하면 자동으로 표시됩니다.
            </div>
          )}
        </div>
        <div className="mt-1 pt-1 flex items-center justify-between text-[9px] text-slate-400 dark:text-slate-500 border-t border-slate-200/70 dark:border-slate-800/60">
          <span>기준 통화: {state.baseCurrency}</span>
          <span>업데이트 {formatUpdatedTime(displayRates[0]?.lastUpdate || state.lastRefresh)}</span>
        </div>
        {isEditMode && displayRates.length < 2 && (
          <div className="mt-1 text-[9px] text-amber-500 dark:text-amber-300">
            편집 모드에서 USD/KRW, JPY/KRW 환율을 추가해 주세요.
          </div>
        )}
      </div>
    );
  }

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
        {displayRates.map((rate) => {
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
