// 암호화폐 위젯 - 간단한 정적 데이터 버전
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '../ui/button';
import { Plus, Trash2, RefreshCw, TrendingUp, TrendingDown, Grid as GridIcon, List, Wifi, WifiOff } from 'lucide-react';
import { Sparkline } from '../ui/Sparkline';
import { WidgetProps, persistOrLocal, readLocal, showToast } from './utils/widget-helpers';

interface CryptoState {
  symbols: string[];
  quotes: Record<string, any>;
  history: Record<string, number[]>;
  currency: string;
  exchange: string;
  view: 'list' | 'grid';
  showAddForm: boolean;
  newSymbol: string;
  status: 'idle' | 'loading' | 'live' | 'stale' | 'error';
  lastUpdate: number;
  intervalMs: number;
}

const DEFAULT_SYMBOLS: string[] = ['BTC', 'ETH', 'SOL'];

// 간단한 포맷팅 함수들
const formatPrice = (price: number, currency: string): string => {
  return price.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
};

const formatChangePct = (changePct: number): string => {
  const sign = changePct >= 0 ? '+' : '';
  return `${sign}${changePct.toFixed(2)}%`;
};

const formatChange = (change: number): string => {
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(0)}`;
};

export const CryptoWidget = ({ widget, isEditMode, updateWidget }: WidgetProps) => {
  const [state, setState] = useState(() => {
    const saved = readLocal(widget.id, {
      symbols: DEFAULT_SYMBOLS,
      quotes: {} as Record<string, any>,
      history: {} as Record<string, number[]>,
      currency: 'KRW',
      exchange: 'upbit',
      view: 'list' as const,
      showAddForm: false,
      newSymbol: '',
      status: 'live',
      lastUpdate: Date.now(),
      intervalMs: 5000
    });
    return saved;
  });

  // 상태 저장
  useEffect(() => {
    persistOrLocal(widget.id, state, updateWidget);
  }, [widget.id, state, updateWidget]);

  const addSymbol = useCallback(() => {
    const symbol = state.newSymbol.trim().toUpperCase();
    
    if (!symbol) {
      showToast('심볼을 입력하세요', 'error');
      return;
    }
    
    if (state.symbols.includes(symbol)) {
      showToast('이미 추가된 심볼입니다', 'error');
      return;
    }
    
    setState(prev => ({
      ...prev,
      symbols: [...prev.symbols, symbol],
      showAddForm: false,
      newSymbol: ''
    }));
    
    showToast('심볼이 추가되었습니다', 'success');
  }, [state.newSymbol, state.symbols]);

  const removeSymbol = useCallback((symbol: Symbol) => {
    setState(prev => {
      const newQuotes = { ...prev.quotes };
      const newHistory = { ...prev.history };
      delete newQuotes[symbol];
      delete newHistory[symbol];
      
      return {
        ...prev,
        symbols: prev.symbols.filter(s => s !== symbol),
        quotes: newQuotes,
        history: newHistory
      };
    });
    showToast('심볼이 제거되었습니다', 'success');
  }, []);

  const sortedSymbols = useMemo(() => {
    return [...state.symbols].sort((a, b) => {
      const qA = state.quotes[a];
      const qB = state.quotes[b];
      
      if (!qA && !qB) return 0;
      if (!qA) return 1;
      if (!qB) return -1;
      
      // 변동률 높은 순
      return Math.abs(qB.changePct) - Math.abs(qA.changePct);
    });
  }, [state.symbols, state.quotes]);

  return (
    <div className="p-2 h-full flex flex-col">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-2 shrink-0">
        <div className="flex items-center gap-1">
          <span className="text-lg">₿</span>
        </div>
        <div className="flex items-center gap-1">
          {isEditMode && (
            <button
              onClick={() => setState(prev => ({ ...prev, showAddForm: !prev.showAddForm }))}
              className="p-1 hover:bg-gray-100 rounded"
              title="심볼 추가"
            >
              <Plus className="w-3 h-3 text-green-600" />
            </button>
          )}
          <button
            onClick={() => setState(prev => ({ ...prev, currency: prev.currency === 'USD' ? 'KRW' : 'USD' }))}
            className="px-2 py-0.5 text-xs bg-gray-100 hover:bg-gray-200 rounded"
            title="통화 전환"
          >
            {state.currency}
          </button>
          <button
            onClick={() => setState(prev => ({ ...prev, exchange: prev.exchange === 'upbit' ? 'binance' : 'upbit' }))}
            className="px-2 py-0.5 text-xs bg-gray-100 hover:bg-gray-200 rounded"
            title="거래소 전환"
          >
            {state.exchange}
          </button>
          <div className="flex items-center gap-1">
            {state.status === 'live' ? (
              <Wifi className="w-3 h-3 text-green-600" title="실시간 연결" />
            ) : state.status === 'error' ? (
              <WifiOff className="w-3 h-3 text-red-600" title="연결 오류" />
            ) : (
              <RefreshCw className={`w-3 h-3 text-gray-600 ${state.status === 'connecting' ? 'animate-spin' : ''}`} title={state.status} />
            )}
          </div>
          <button
            onClick={() => setState(prev => ({ ...prev, view: prev.view === 'list' ? 'grid' : 'list' }))}
            className="p-1 hover:bg-gray-100 rounded"
            title="보기 전환"
          >
            {state.view === 'list' ? <GridIcon className="w-3 h-3" /> : <List className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* 심볼 추가 폼 */}
      {isEditMode && state.showAddForm && (
        <div className="bg-gray-50 rounded p-2 mb-2 shrink-0">
          <div className="flex gap-1">
            <input
              type="text"
              value={state.newSymbol}
              onChange={(e) => setState(prev => ({ ...prev, newSymbol: e.target.value.toUpperCase() }))}
              onKeyPress={(e) => e.key === 'Enter' && addSymbol()}
              placeholder="BTC, ETH..."
              className="flex-1 text-xs px-2 py-1 border border-gray-300 rounded"
            />
            <Button size="sm" className="h-6 text-xs" onClick={addSymbol}>
              추가
            </Button>
          </div>
        </div>
      )}

      {/* 코인 목록 */}
      <div className="flex-1 overflow-y-auto">
        {sortedSymbols.length === 0 ? (
          <div className="text-center text-gray-500 text-xs py-4">
            추가된 코인이 없습니다
          </div>
        ) : (
          <div className={state.view === 'grid' ? 'grid grid-cols-2 gap-1' : 'space-y-1'}>
            {sortedSymbols.map(symbol => {
              const quote = state.quotes[symbol];
              const hist = state.history[symbol] || [];
              
              return (
                <div
                  key={symbol}
                  className="relative p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors group"
                >
                  {/* 심볼 & 가격 */}
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex-1">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-gray-800">{symbol}</span>
                        <span className="text-xs text-gray-500">{getSymbolInfo(symbol).name}</span>
                      </div>
                      {quote ? (
                        <>
                          <div className="text-sm font-bold text-gray-900">
                            {formatPrice(quote.price, state.currency)}
                          </div>
                          <div className={`text-xs font-medium ${quote.changePct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {quote.changePct >= 0 ? <TrendingUp className="w-3 h-3 inline mr-0.5" /> : <TrendingDown className="w-3 h-3 inline mr-0.5" />}
                            {formatChangePct(quote.changePct)}
                          </div>
                        </>
                      ) : (
                        <div className="text-xs text-gray-400">로딩중...</div>
                      )}
                    </div>
                    
                    {/* 스파크라인 */}
                    {hist.length > 1 && (
                      <div className="ml-2">
                        <Sparkline 
                          data={hist} 
                          width={40} 
                          height={20} 
                          color={quote && quote.changePct >= 0 ? '#16a34a' : '#dc2626'}
                          className="opacity-70"
                        />
                      </div>
                    )}
                  </div>
                  
                  {/* 삭제 버튼 */}
                  {isEditMode && (
                    <button
                      onClick={() => removeSymbol(symbol)}
                      className="absolute top-1 right-1 p-0.5 bg-red-100 hover:bg-red-200 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      title="제거"
                    >
                      <Trash2 className="w-3 h-3 text-red-600" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 하단 정보 */}
      <div className="text-xs text-gray-500 text-center mt-2 pt-2 border-t border-gray-200 shrink-0">
        <div className="flex items-center justify-center gap-2">
          <span>마지막 업데이트: {new Date(state.lastUpdate).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</span>
          <span>•</span>
          <span className={`${state.status === 'live' ? 'text-green-600' : state.status === 'error' ? 'text-red-600' : 'text-gray-500'}`}>
            {state.status === 'live' ? '실시간' : state.status === 'error' ? '오류' : state.status === 'connecting' ? '연결중' : '대기'}
          </span>
        </div>
      </div>
    </div>
  );
};


