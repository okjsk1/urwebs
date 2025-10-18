import { TrendingUp, TrendingDown } from 'lucide-react';

export function StockWidget() {
  const stocks = [
    { name: '삼성전자', code: '005930', price: 75000, change: +2.5 },
    { name: 'SK하이닉스', code: '000660', price: 128500, change: +1.8 },
    { name: 'NAVER', code: '035420', price: 184000, change: -0.9 },
    { name: '카카오', code: '035720', price: 48500, change: -1.2 },
  ];

  return (
    <div className="space-y-2">
      {stocks.map((stock) => (
        <div key={stock.code} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
          <div>
            <div className="font-semibold text-sm text-gray-800">{stock.name}</div>
            <div className="text-xs text-gray-500">{stock.code}</div>
          </div>
          <div className="text-right">
            <div className="font-semibold text-sm text-gray-800">
              {stock.price.toLocaleString()}원
            </div>
            <div className={`flex items-center justify-end gap-1 text-xs font-medium ${
              stock.change > 0 ? 'text-red-600' : 'text-blue-600'
            }`}>
              {stock.change > 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              <span>{stock.change > 0 ? '+' : ''}{stock.change}%</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}































