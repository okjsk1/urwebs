// 암호화폐 단일 위젯 - 1칸 크기, 코인 1개만 표시
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '../ui/button';
import { Plus, Trash2, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';
import { getQuotes, subscribeQuotes, formatMoney, formatPercent, type Quote } from '../../services/finance/api';
import { Sparkline } from '../ui/Sparkline';
import { WidgetProps, persistOrLocal, readLocal, showToast } from './utils/widget-helpers';
import { useDebouncedEffect } from '../../hooks/useDebouncedEffect';

interface CryptoState {
  symbol: string;
  quote: Quote | null;
  history: number[]; // 가격 이력 (스파크라인용)
  currency: 'USD' | 'KRW';
  showAddForm: boolean;
  newSymbol: string;
  isLoading: boolean;
  lastUpdate: number;
}

const DEFAULT_SYMBOL = 'BTC';

export const CryptoWidgetSingle: React.FC<WidgetProps> = ({ widget, isEditMode, updateWidget }) => {
  const [state, setState] = useState<CryptoState>(() => {
    const saved = readLocal(widget.id, {
      symbol: DEFAULT_SYMBOL,
      quote: null,
      history: [],
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
    if (!state.symbol) return;
    
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const quotes = await getQuotes([state.symbol], { asset: 'crypto' });
      
      if (quotes.length > 0) {
        const quote = quotes[0];
        setState(prev => {
          const newHistory = [...prev.history, quote.price].slice(-60);
          
          return {
            ...prev,
            quote,
            history: newHistory,
            isLoading: false,
            lastUpdate: Date.now()
          };
        });
      }
    } catch (error) {
      console.error('Failed to fetch crypto quote:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      showToast('시세 업데이트 실패', 'error');
    }
  }, [state.symbol]);

  // 실시간 구독
  useEffect(() => {
    if (!state.symbol) return;
    
    const sub = subscribeQuotes(
      [state.symbol],
      (quote) => {
        setState(prev => {
          const newHistory = [...prev.history, quote.price].slice(-60);
          
          return {
            ...prev,
            quote,
            history: newHistory,
            lastUpdate: Date.now()
          };
        });
      },
      { asset: 'crypto', interval: 10000 }
    );
    
    return () => sub.close();
  }, [state.symbol]);

  const changeSymbol = useCallback(() => {
    const symbol = state.newSymbol.trim().toUpperCase();
    
    if (!symbol) {
      showToast('심볼을 입력하세요', 'error');
      return;
    }
    
    setState(prev => ({
      ...prev,
      symbol,
      showAddForm: false,
      newSymbol: '',
      quote: null,
      history: []
    }));
    
    showToast('심볼이 변경되었습니다', 'success');
  }, [state.newSymbol]);

  return (
    <div className="p-1 h-full flex flex-col">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-1 shrink-0">
        <div className="flex items-center gap-1">
          <span className="text-sm">₿</span>
          <h4 className="font-semibold text-xs text-gray-800">암호화폐</h4>
        </div>
        <div className="flex items-center gap-1">
          {isEditMode && (
            <button
              onClick={() => setState(prev => ({ ...prev, showAddForm: !prev.showAddForm }))}
              className="p-0.5 hover:bg-gray-100 rounded"
              title="심볼 변경"
            >
              <Plus className="w-3 h-3 text-green-600" />
            </button>
          )}
          <button
            onClick={() => setState(prev => ({ ...prev, currency: prev.currency === 'USD' ? 'KRW' : 'USD' }))}
            className="px-1 py-0.5 text-xs bg-gray-100 hover:bg-gray-200 rounded"
            title="통화 전환"
          >
            {state.currency}
          </button>
          <button
            onClick={refreshQuotes}
            disabled={state.isLoading}
            className="p-0.5 hover:bg-gray-100 rounded disabled:opacity-50"
            title="새로고침"
          >
            <RefreshCw className={`w-3 h-3 text-gray-600 ${state.isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 심볼 변경 폼 */}
      {isEditMode && state.showAddForm && (
        <div className="bg-gray-50 rounded p-1 mb-1 shrink-0">
          <div className="flex gap-1">
            <input
              type="text"
              value={state.newSymbol}
              onChange={(e) => setState(prev => ({ ...prev, newSymbol: e.target.value.toUpperCase() }))}
              onKeyPress={(e) => e.key === 'Enter' && changeSymbol()}
              placeholder="BTC, ETH..."
              className="flex-1 text-xs px-1 py-0.5 border border-gray-300 rounded"
            />
            <Button size="sm" className="h-5 text-xs" onClick={changeSymbol}>
              변경
            </Button>
          </div>
        </div>
      )}

      {/* 코인 정보 */}
      <div className="flex-1 flex flex-col justify-center">
        {state.symbol ? (
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 p-2 rounded text-center">
            <div className="text-xs font-bold text-gray-800 mb-1">{state.symbol}</div>
            {state.quote ? (
              <>
                <div className="text-lg font-bold text-gray-900 mb-1">
                  {state.currency === 'USD' 
                    ? `$${state.quote.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    : `₩${(state.quote.price * 1300).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                  }
                </div>
                <div className={`text-xs font-medium flex items-center justify-center gap-1 ${state.quote.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {state.quote.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {formatPercent(state.quote.changePct)}
                </div>
                
                {/* 스파크라인 */}
                {state.history.length > 1 && (
                  <div className="mt-2 flex justify-center">
                    <Sparkline 
                      data={state.history} 
                      width={60} 
                      height={20} 
                      color={state.quote.change >= 0 ? '#16a34a' : '#dc2626'}
                      className="opacity-70"
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="text-xs text-gray-400">로딩중...</div>
            )}
          </div>
        ) : (
          <div className="text-center text-gray-500 text-xs py-4">
            코인을 선택하세요
          </div>
        )}
      </div>

      {/* 하단 정보 */}
      <div className="text-xs text-gray-500 text-center mt-1 pt-1 border-t border-gray-200 shrink-0">
        {state.lastUpdate ? new Date(state.lastUpdate).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : ''}
      </div>
    </div>
  );
};
