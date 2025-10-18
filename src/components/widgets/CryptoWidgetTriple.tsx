// 암호화폐 트리플 위젯 - 2칸 크기, 코인 3개 표시
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '../ui/button';
import { Plus, Trash2, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';
import { getQuotes, subscribeQuotes, formatMoney, formatPercent, type Quote } from '../../services/finance/api';
import { Sparkline } from '../ui/Sparkline';
import { WidgetProps, persistOrLocal, readLocal, showToast } from './utils/widget-helpers';
import { useDebouncedEffect } from '../../hooks/useDebouncedEffect';

interface CryptoState {
  symbols: string[];
  quotes: Record<string, Quote>;
  history: Record<string, number[]>; // 심볼별 가격 이력 (스파크라인용)
  currency: 'USD' | 'KRW';
  showAddForm: boolean;
  newSymbol: string;
  isLoading: boolean;
  lastUpdate: number;
}

const DEFAULT_SYMBOLS = ['BTC', 'ETH', 'XRP'];

export const CryptoWidgetTriple: React.FC<WidgetProps> = ({ widget, isEditMode, updateWidget }) => {
  const [state, setState] = useState<CryptoState>(() => {
    const saved = readLocal(widget.id, {
      symbols: DEFAULT_SYMBOLS,
      quotes: {},
      history: {},
      currency: 'USD' as const,
      showAddForm: false,
      newSymbol: '',
      isLoading: false,
      lastUpdate: Date.now()
    });
    return saved;
  });

  // 상태 저장 (디바운스)
  useDebouncedEffect(() => {
    persistOrLocal(widget.id, state, updateWidget);
  }, [widget.id, state], 300);

  // 시세 업데이트
  const refreshQuotes = useCallback(async () => {
    if (state.symbols.length === 0) return;
    
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const quotes = await getQuotes(state.symbols, { asset: 'crypto' });
      
      setState(prev => {
        const newQuotes: Record<string, Quote> = {};
        const newHistory: Record<string, number[]> = { ...prev.history };
        
        quotes.forEach(q => {
          newQuotes[q.symbol] = q;
          
          // 가격 이력 추가 (최근 60개만 유지)
          const hist = newHistory[q.symbol] || [];
          newHistory[q.symbol] = [...hist, q.price].slice(-60);
        });
        
        return {
          ...prev,
          quotes: newQuotes,
          history: newHistory,
          isLoading: false,
          lastUpdate: Date.now()
        };
      });
    } catch (error) {
      console.error('Failed to fetch crypto quotes:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      showToast('시세 업데이트 실패', 'error');
    }
  }, [state.symbols]);

  // 실시간 구독
  useEffect(() => {
    if (state.symbols.length === 0) return;
    
    const sub = subscribeQuotes(
      state.symbols,
      (quote) => {
        setState(prev => {
          const newHistory = { ...prev.history };
          const hist = newHistory[quote.symbol] || [];
          newHistory[quote.symbol] = [...hist, quote.price].slice(-60);
          
          return {
            ...prev,
            quotes: { ...prev.quotes, [quote.symbol]: quote },
            history: newHistory,
            lastUpdate: Date.now()
          };
        });
      },
      { asset: 'crypto', interval: 10000 }
    );
    
    return () => sub.close();
  }, [state.symbols]);

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
    
    if (state.symbols.length >= 3) {
      showToast('최대 3개까지만 추가할 수 있습니다', 'error');
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

  const removeSymbol = useCallback((symbol: string) => {
    setState(prev => ({
      ...prev,
      symbols: prev.symbols.filter(s => s !== symbol),
      quotes: Object.fromEntries(Object.entries(prev.quotes).filter(([k]) => k !== symbol)),
      history: Object.fromEntries(Object.entries(prev.history).filter(([k]) => k !== symbol))
    }));
    showToast('심볼이 제거되었습니다', 'success');
  }, []);

  return (
    <div className="p-2 h-full flex flex-col">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-2 shrink-0">
        <div className="flex items-center gap-1">
          <span className="text-lg">₿</span>
          <h4 className="font-semibold text-sm text-gray-800">암호화폐</h4>
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
            onClick={refreshQuotes}
            disabled={state.isLoading}
            className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
            title="새로고침"
          >
            <RefreshCw className={`w-3 h-3 text-gray-600 ${state.isLoading ? 'animate-spin' : ''}`} />
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
      <div className="flex-1 overflow-y-auto space-y-1">
        {state.symbols.length === 0 ? (
          <div className="text-center text-gray-500 text-xs py-4">
            추가된 코인이 없습니다
          </div>
        ) : (
          state.symbols.map(symbol => {
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
                    <div className="text-xs font-bold text-gray-800">{symbol}</div>
                    {quote ? (
                      <>
                        <div className="text-sm font-bold text-gray-900">
                          {state.currency === 'USD' 
                            ? `$${quote.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                            : `₩${(quote.price * 1300).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                          }
                        </div>
                        <div className={`text-xs font-medium flex items-center gap-1 ${quote.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {quote.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {formatPercent(quote.changePct)}
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
                        color={quote && quote.change >= 0 ? '#16a34a' : '#dc2626'}
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
          })
        )}
      </div>

      {/* 하단 정보 */}
      <div className="text-xs text-gray-500 text-center mt-2 pt-2 border-t border-gray-200 shrink-0">
        마지막 업데이트: {new Date(state.lastUpdate).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
      </div>
    </div>
  );
};
