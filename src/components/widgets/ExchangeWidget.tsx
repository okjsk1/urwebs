// 환율 정보 위젯 - 간단한 정적 데이터 버전
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '../ui/button';
import { TrendingUp, TrendingDown, Globe, Bell, Plus, Settings, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { WidgetProps, persistOrLocal, readLocal, showToast } from './utils/widget-helpers';

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
    return saved;
  });

  // 상태 저장
  useEffect(() => {
    persistOrLocal(widget.id, state, updateWidget);
  }, [widget.id, state, updateWidget]);

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

  const filteredAndSortedRates = useMemo(() => {
    let filtered = [...state.rates]; // 불변성 유지
    
    if (state.showOnlyWatched) {
      filtered = filtered.filter(rate => rate.isWatched);
    }
    
    return filtered.sort((a, b) => {
      let comparison = 0;
      switch (state.sortBy) {
        case 'currency':
          comparison = a.fromCurrency.localeCompare(b.fromCurrency);
          break;
        case 'rate':
          comparison = a.rate - b.rate;
          break;
        case 'change':
          comparison = (a.changePercent || 0) - (b.changePercent || 0);
          break;
      }
      return state.sortOrder === 'desc' ? -comparison : comparison;
    });
  }, [state.rates, state.showOnlyWatched, state.sortBy, state.sortOrder]);

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
    <div className="p-2 h-full flex flex-col">
      {/* 드래그 핸들 영역 */}
      <div className="absolute top-0 left-0 right-0 h-6 cursor-move" style={{ zIndex: 10 }}></div>
      
      {/* 컴팩트 헤더 */}
      <div className="text-center mb-2 flex-shrink-0 relative" style={{ userSelect: 'none' }}>
        <div className="flex items-center justify-center gap-2 mb-1">
          <div className="text-lg">💱</div>
          <div className="flex items-center gap-1">
            {state.status === 'live' ? (
              <Wifi className="w-3 h-3 text-green-600" title="실시간 연결" />
            ) : state.status === 'error' ? (
              <WifiOff className="w-3 h-3 text-red-600" title="연결 오류" />
            ) : state.status === 'stale' ? (
              <RefreshCw className="w-3 h-3 text-yellow-600" title="오래된 데이터" />
            ) : (
              <RefreshCw className={`w-3 h-3 text-gray-600 ${state.status === 'loading' ? 'animate-spin' : ''}`} title={state.status} />
            )}
            <span className={`text-xs font-medium ${
              state.status === 'live' ? 'text-green-600' : 
              state.status === 'error' ? 'text-red-600' : 
              state.status === 'stale' ? 'text-yellow-600' : 'text-gray-600'
            }`}>
              {state.status === 'live' ? 'LIVE' : 
               state.status === 'error' ? 'ERROR' : 
               state.status === 'stale' ? 'STALE' : 
               (state.status || 'idle').toUpperCase()}
            </span>
          </div>
        </div>
        <h4 className="font-semibold text-xs text-gray-800 dark:text-gray-100">환율 정보</h4>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {new Date(state.lastRefresh).toLocaleTimeString()}
        </p>
      </div>

      {/* 관심 환율 요약 */}
      {watchedStats.watchedCount > 0 && (
        <div className="mb-3 p-2 bg-green-50 rounded border border-green-200">
          <div className="flex justify-between items-center text-xs">
            <span className="text-green-800 font-medium">관심 환율</span>
            <span className="text-green-600">
              {watchedStats.watchedCount}/{watchedStats.totalCount}개 통화
            </span>
          </div>
          <div className="text-green-800 text-xs mt-1">
            평균 변동률: {watchedStats.averageChange >= 0 ? '+' : ''}{watchedStats.averageChange.toFixed(2)}%
          </div>
        </div>
      )}

      {/* 필터 및 정렬 */}
      {isEditMode && (
        <div className="mb-3 space-y-2">
          <div className="flex gap-2">
            <select
              value={state.sortBy}
              onChange={(e) => setState(prev => ({ ...prev, sortBy: e.target.value as any }))}
              className="flex-1 text-xs px-2 py-1 border border-gray-300 rounded"
              aria-label="정렬 기준"
            >
              <option value="change">변동률</option>
              <option value="currency">통화</option>
              <option value="rate">환율</option>
            </select>
            <Button
              size="sm"
              variant="outline"
              className="h-6 text-xs"
              onClick={() => setState(prev => ({ 
                ...prev, 
                sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' 
              }))}
              aria-label="정렬 순서 변경"
            >
              {state.sortOrder === 'asc' ? '↑' : '↓'}
            </Button>
            <Button
              size="sm"
              variant={state.showOnlyWatched ? 'default' : 'outline'}
              className="h-6 text-xs"
              onClick={() => setState(prev => ({ ...prev, showOnlyWatched: !prev.showOnlyWatched }))}
              aria-label="관심 환율만 보기"
            >
              <Globe className="w-3 h-3" />
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 h-6 text-xs"
              onClick={() => {
                // 수동 새로고침은 자동 구독에서 처리됨
                showToast('환율이 자동으로 업데이트됩니다', 'success');
              }}
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              새로고침
            </Button>
            <select
              value={state.refreshInterval}
              onChange={(e) => setState(prev => ({ ...prev, refreshInterval: parseInt(e.target.value) }))}
              className="text-xs px-2 py-1 border border-gray-300 rounded"
              aria-label="새로고침 간격"
            >
              <option value="0">수동</option>
              <option value="60000">1분</option>
              <option value="300000">5분</option>
              <option value="600000">10분</option>
              <option value="1800000">30분</option>
            </select>
          </div>
        </div>
      )}

      {/* 환율 목록 - 컴팩트 버전 */}
      <div className="flex-1 overflow-y-auto space-y-1">
        {filteredAndSortedRates.slice(0, 5).map(rate => {
          return (
            <div key={rate.id} className="bg-gray-50 dark:bg-gray-700 rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-xs font-medium text-gray-800 dark:text-gray-100">
                      {rate.fromCurrency}/{rate.toCurrency}
                    </span>
                    {rate.isWatched && (
                      <span className="text-xs text-blue-500">⭐</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(rate.lastUpdate).toLocaleTimeString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-800 dark:text-gray-100">
                    {formatFxRate(rate.rate, rate.fromCurrency, rate.toCurrency)}
                  </div>
                  <div className={`text-xs font-medium ${
                    (rate.changePercent || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatChangePct(rate.changePercent || 0)}
                  </div>
                </div>
              </div>
              
              {isEditMode && (
                <div className="flex justify-between items-center mt-1">
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWatch(rate.id);
                      }}
                      className={`text-xs px-2 py-1 rounded ${
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
                    className="text-red-500 hover:text-red-700 text-xs"
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
              className="w-full h-5 text-xs"
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
