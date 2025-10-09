// 주식 시세 위젯 - 실시간 데이터, 포트폴리오 관리, 알림 설정
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '../ui/button';
import { TrendingUp, TrendingDown, Bell, Plus, Settings, BarChart3, Eye, EyeOff } from 'lucide-react';
import { WidgetProps, persistOrLocal, readLocal, showToast } from './utils/widget-helpers';

interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  lastUpdate: number;
  isWatched: boolean;
  targetPrice?: number;
  alertEnabled: boolean;
}

interface StockState {
  stocks: Stock[];
  showAddForm: boolean;
  newStock: Partial<Stock>;
  editingStock: string | null;
  sortBy: 'name' | 'price' | 'change' | 'volume';
  sortOrder: 'asc' | 'desc';
  showOnlyWatched: boolean;
  refreshInterval: number;
  lastRefresh: number;
}

const DEFAULT_STOCKS: Stock[] = [
  {
    symbol: 'AAPL',
    name: '애플',
    price: 175.43,
    change: 2.34,
    changePercent: 1.35,
    volume: 45678900,
    marketCap: 2750000000000,
    lastUpdate: Date.now(),
    isWatched: true,
    alertEnabled: false
  },
  {
    symbol: 'GOOGL',
    name: '구글',
    price: 142.56,
    change: -1.23,
    changePercent: -0.86,
    volume: 23456700,
    marketCap: 1780000000000,
    lastUpdate: Date.now(),
    isWatched: true,
    alertEnabled: false
  },
  {
    symbol: 'MSFT',
    name: '마이크로소프트',
    price: 378.85,
    change: 5.67,
    changePercent: 1.52,
    volume: 34567800,
    marketCap: 2810000000000,
    lastUpdate: Date.now(),
    isWatched: false,
    alertEnabled: false
  },
  {
    symbol: 'TSLA',
    name: '테슬라',
    price: 248.42,
    change: -3.21,
    changePercent: -1.27,
    volume: 67890100,
    marketCap: 785000000000,
    lastUpdate: Date.now(),
    isWatched: false,
    alertEnabled: false
  }
];

export const StockWidget: React.FC<WidgetProps> = ({ widget, isEditMode, updateWidget }) => {
  const [state, setState] = useState<StockState>(() => {
    const saved = readLocal(widget.id, {
      stocks: DEFAULT_STOCKS,
      showAddForm: false,
      newStock: {},
      editingStock: null,
      sortBy: 'change',
      sortOrder: 'desc',
      showOnlyWatched: false,
      refreshInterval: 30000, // 30초
      lastRefresh: Date.now()
    });
    return saved;
  });

  // 상태 저장
  useEffect(() => {
    persistOrLocal(widget.id, state, updateWidget);
  }, [widget.id, updateWidget]);

  // 자동 새로고침
  useEffect(() => {
    if (state.refreshInterval > 0) {
      const interval = setInterval(() => {
        refreshStockData();
      }, state.refreshInterval);

      return () => clearInterval(interval);
    }
  }, [state.refreshInterval]);

  // 주식 데이터 새로고침 (시뮬레이션)
  const refreshStockData = useCallback(() => {
    setState(prev => ({
      ...prev,
      stocks: prev.stocks.map(stock => ({
        ...stock,
        price: stock.price + (Math.random() - 0.5) * stock.price * 0.02, // ±1% 변동
        change: (Math.random() - 0.5) * 10,
        changePercent: (Math.random() - 0.5) * 4,
        volume: stock.volume + Math.floor((Math.random() - 0.5) * 1000000),
        lastUpdate: Date.now()
      })),
      lastRefresh: Date.now()
    }));
  }, []);

  const addStock = useCallback(() => {
    const { symbol, name, price } = state.newStock;
    
    if (!symbol?.trim()) {
      showToast('주식 심볼을 입력하세요', 'error');
      return;
    }
    
    if (!name?.trim()) {
      showToast('회사명을 입력하세요', 'error');
      return;
    }

    const duplicate = state.stocks.find(s => s.symbol.toUpperCase() === symbol.toUpperCase());
    if (duplicate) {
      showToast('이미 존재하는 주식입니다', 'error');
      return;
    }

    const newStock: Stock = {
      symbol: symbol.toUpperCase().trim(),
      name: name.trim(),
      price: price || 100,
      change: 0,
      changePercent: 0,
      volume: Math.floor(Math.random() * 10000000),
      marketCap: Math.floor(Math.random() * 1000000000000),
      lastUpdate: Date.now(),
      isWatched: false,
      alertEnabled: false
    };

    setState(prev => ({
      ...prev,
      stocks: [...prev.stocks, newStock],
      newStock: {},
      showAddForm: false
    }));
    showToast('주식이 추가되었습니다', 'success');
  }, [state.newStock, state.stocks]);

  const updateStock = useCallback((symbol: string, updates: Partial<Stock>) => {
    setState(prev => ({
      ...prev,
      stocks: prev.stocks.map(stock => 
        stock.symbol === symbol ? { ...stock, ...updates } : stock
      ),
      editingStock: null
    }));
    showToast('주식 정보가 업데이트되었습니다', 'success');
  }, []);

  const deleteStock = useCallback((symbol: string) => {
    setState(prev => ({
      ...prev,
      stocks: prev.stocks.filter(stock => stock.symbol !== symbol)
    }));
    showToast('주식이 삭제되었습니다', 'success');
  }, []);

  const toggleWatch = useCallback((symbol: string) => {
    setState(prev => ({
      ...prev,
      stocks: prev.stocks.map(stock => 
        stock.symbol === symbol ? { ...stock, isWatched: !stock.isWatched } : stock
      )
    }));
  }, []);

  const toggleAlert = useCallback((symbol: string) => {
    setState(prev => ({
      ...prev,
      stocks: prev.stocks.map(stock => 
        stock.symbol === symbol ? { ...stock, alertEnabled: !stock.alertEnabled } : stock
      )
    }));
  }, []);

  const openStockChart = useCallback((symbol: string) => {
    const url = `https://finance.yahoo.com/quote/${symbol}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }, []);

  const filteredAndSortedStocks = useMemo(() => {
    let filtered = state.stocks;
    
    if (state.showOnlyWatched) {
      filtered = filtered.filter(stock => stock.isWatched);
    }
    
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (state.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'change':
          comparison = a.changePercent - b.changePercent;
          break;
        case 'volume':
          comparison = a.volume - b.volume;
          break;
      }
      return state.sortOrder === 'desc' ? -comparison : comparison;
    });
    
    return filtered;
  }, [state.stocks, state.showOnlyWatched, state.sortBy, state.sortOrder]);

  const portfolioStats = useMemo(() => {
    const watchedStocks = state.stocks.filter(stock => stock.isWatched);
    const totalValue = watchedStocks.reduce((sum, stock) => sum + stock.price, 0);
    const totalChange = watchedStocks.reduce((sum, stock) => sum + stock.change, 0);
    const totalChangePercent = watchedStocks.length > 0 ? (totalChange / totalValue) * 100 : 0;
    
    return {
      totalValue,
      totalChange,
      totalChangePercent,
      watchedCount: watchedStocks.length,
      totalCount: state.stocks.length
    };
  }, [state.stocks]);

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;
  const formatVolume = (volume: number) => {
    if (volume >= 1000000) return `${(volume / 1000000).toFixed(1)}M`;
    if (volume >= 1000) return `${(volume / 1000).toFixed(1)}K`;
    return volume.toString();
  };
  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1000000000000) return `$${(marketCap / 1000000000000).toFixed(1)}T`;
    if (marketCap >= 1000000000) return `$${(marketCap / 1000000000).toFixed(1)}B`;
    if (marketCap >= 1000000) return `$${(marketCap / 1000000).toFixed(1)}M`;
    return `$${marketCap}`;
  };

  return (
    <div className="p-3">
      <div className="text-center mb-3">
        <div className="text-2xl mb-1">📈</div>
        <h4 className="font-semibold text-sm text-gray-800">주식 시세</h4>
        <p className="text-xs text-gray-500">
          마지막 업데이트: {new Date(state.lastRefresh).toLocaleTimeString()}
        </p>
      </div>

      {/* 포트폴리오 요약 */}
      {portfolioStats.watchedCount > 0 && (
        <div className="mb-3 p-2 bg-blue-50 rounded border border-blue-200">
          <div className="flex justify-between items-center text-xs">
            <span className="text-blue-800 font-medium">포트폴리오</span>
            <span className="text-blue-600">
              {portfolioStats.watchedCount}/{portfolioStats.totalCount}개 주식
            </span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-blue-800 font-bold">
              {formatPrice(portfolioStats.totalValue)}
            </span>
            <span className={`text-xs font-medium ${
              portfolioStats.totalChange >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {portfolioStats.totalChange >= 0 ? '+' : ''}
              {portfolioStats.totalChange.toFixed(2)} ({portfolioStats.totalChangePercent.toFixed(2)}%)
            </span>
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
              <option value="name">이름</option>
              <option value="price">가격</option>
              <option value="volume">거래량</option>
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
              aria-label="관심 주식만 보기"
            >
              <Eye className="w-3 h-3" />
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 h-6 text-xs"
              onClick={refreshStockData}
            >
              <TrendingUp className="w-3 h-3 mr-1" />
              새로고침
            </Button>
            <select
              value={state.refreshInterval}
              onChange={(e) => setState(prev => ({ ...prev, refreshInterval: parseInt(e.target.value) }))}
              className="text-xs px-2 py-1 border border-gray-300 rounded"
              aria-label="새로고침 간격"
            >
              <option value="0">수동</option>
              <option value="10000">10초</option>
              <option value="30000">30초</option>
              <option value="60000">1분</option>
              <option value="300000">5분</option>
            </select>
          </div>
        </div>
      )}

      {/* 주식 목록 */}
      <div className="space-y-2">
        {filteredAndSortedStocks.map(stock => (
          <div key={stock.symbol} className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h5 className="text-sm font-medium text-gray-800">{stock.symbol}</h5>
                  {stock.isWatched && (
                    <span className="text-xs text-blue-500">⭐</span>
                  )}
                  {stock.alertEnabled && (
                    <span className="text-xs text-red-500">🔔</span>
                  )}
                </div>
                <div className="text-xs text-gray-600 mb-1">{stock.name}</div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>거래량: {formatVolume(stock.volume)}</span>
                  <span>시총: {formatMarketCap(stock.marketCap)}</span>
                </div>
              </div>
              <div className="text-right ml-2">
                <div className="text-sm font-bold text-gray-800">
                  {formatPrice(stock.price)}
                </div>
                <div className={`text-xs font-medium flex items-center gap-1 ${
                  stock.change >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stock.change >= 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex gap-1">
                <button
                  onClick={() => toggleWatch(stock.symbol)}
                  className={`text-xs px-2 py-1 rounded ${
                    stock.isWatched 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-gray-100 text-gray-600 hover:bg-blue-50'
                  }`}
                  aria-label={stock.isWatched ? '관심 주식 해제' : '관심 주식 추가'}
                >
                  {stock.isWatched ? '관심' : '관심 추가'}
                </button>
                <button
                  onClick={() => toggleAlert(stock.symbol)}
                  className={`text-xs px-2 py-1 rounded ${
                    stock.alertEnabled 
                      ? 'bg-red-100 text-red-700' 
                      : 'bg-gray-100 text-gray-600 hover:bg-red-50'
                  }`}
                  aria-label={stock.alertEnabled ? '알림 해제' : '알림 설정'}
                >
                  <Bell className="w-3 h-3" />
                </button>
                <button
                  onClick={() => openStockChart(stock.symbol)}
                  className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200"
                  aria-label="차트 보기"
                >
                  <BarChart3 className="w-3 h-3" />
                </button>
              </div>
              {isEditMode && (
                <div className="flex gap-1">
                  <button
                    onClick={() => setState(prev => ({ ...prev, editingStock: stock.symbol }))}
                    className="text-blue-500 hover:text-blue-700"
                    aria-label="주식 편집"
                  >
                    <Settings className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            {/* 편집 폼 */}
            {isEditMode && state.editingStock === stock.symbol && (
              <div className="mt-3 p-2 bg-white rounded border space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={stock.symbol}
                    onChange={(e) => updateStock(stock.symbol, { symbol: e.target.value.toUpperCase() })}
                    className="text-xs px-2 py-1 border border-gray-300 rounded"
                    placeholder="심볼"
                    aria-label="주식 심볼"
                  />
                  <input
                    type="text"
                    value={stock.name}
                    onChange={(e) => updateStock(stock.symbol, { name: e.target.value })}
                    className="text-xs px-2 py-1 border border-gray-300 rounded"
                    placeholder="회사명"
                    aria-label="회사명"
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={stock.targetPrice || ''}
                    onChange={(e) => updateStock(stock.symbol, { targetPrice: parseFloat(e.target.value) || undefined })}
                    className="flex-1 text-xs px-2 py-1 border border-gray-300 rounded"
                    placeholder="목표가 (선택사항)"
                    aria-label="목표가"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 text-xs"
                    onClick={() => setState(prev => ({ ...prev, editingStock: null }))}
                  >
                    완료
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 text-xs text-red-600 hover:text-red-700"
                    onClick={() => deleteStock(stock.symbol)}
                  >
                    삭제
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 주식 추가 */}
      {isEditMode && (
        <div className="mt-3">
          {!state.showAddForm ? (
            <Button
              size="sm"
              variant="outline"
              className="w-full h-6 text-xs"
              onClick={() => setState(prev => ({ ...prev, showAddForm: true }))}
            >
              <Plus className="w-3 h-3 mr-1" />
              주식 추가
            </Button>
          ) : (
            <div className="space-y-2 p-2 bg-gray-50 rounded">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={state.newStock.symbol || ''}
                  onChange={(e) => setState(prev => ({
                    ...prev,
                    newStock: { ...prev.newStock, symbol: e.target.value.toUpperCase() }
                  }))}
                  placeholder="심볼 (예: AAPL)"
                  className="text-xs px-2 py-1 border border-gray-300 rounded"
                  aria-label="새 주식 심볼"
                />
                <input
                  type="text"
                  value={state.newStock.name || ''}
                  onChange={(e) => setState(prev => ({
                    ...prev,
                    newStock: { ...prev.newStock, name: e.target.value }
                  }))}
                  placeholder="회사명"
                  className="text-xs px-2 py-1 border border-gray-300 rounded"
                  aria-label="새 회사명"
                />
              </div>
              <input
                type="number"
                value={state.newStock.price || ''}
                onChange={(e) => setState(prev => ({
                  ...prev,
                  newStock: { ...prev.newStock, price: parseFloat(e.target.value) || undefined }
                }))}
                placeholder="초기 가격 (선택사항)"
                className="w-full text-xs px-2 py-1 border border-gray-300 rounded"
                aria-label="초기 가격"
              />
              <div className="flex gap-1">
                <Button
                  size="sm"
                  className="flex-1 h-6 text-xs"
                  onClick={addStock}
                >
                  추가
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 h-6 text-xs"
                  onClick={() => setState(prev => ({ 
                    ...prev, 
                    showAddForm: false,
                    newStock: {}
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
      {state.stocks.length === 0 && (
        <div className="text-center text-gray-500 text-xs py-8">
          <div className="text-2xl mb-2">📊</div>
          <div>추가된 주식이 없습니다.</div>
          <div className="text-gray-400 mt-1">편집 모드에서 주식을 추가해보세요.</div>
        </div>
      )}
    </div>
  );
};
