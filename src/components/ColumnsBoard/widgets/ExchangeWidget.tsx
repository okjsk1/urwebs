import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

export function ExchangeWidget() {
  const rates = [
    { currency: 'USD', krw: 1328.50, change: +2.3, flag: '🇺🇸' },
    { currency: 'EUR', krw: 1442.30, change: -1.1, flag: '🇪🇺' },
    { currency: 'JPY', krw: 891.20, change: +0.8, flag: '🇯🇵' },
    { currency: 'CNY', krw: 183.45, change: +1.5, flag: '🇨🇳' },
  ];

  return (
    <div className="space-y-3">
      {rates.map((rate) => (
        <div key={rate.currency} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-xl">{rate.flag}</span>
            <div>
              <div className="font-semibold text-sm text-gray-800">{rate.currency}</div>
              <div className="text-xs text-gray-600">{rate.krw.toFixed(2)}원</div>
            </div>
          </div>
          <div className={`flex items-center gap-1 text-sm font-medium ${
            rate.change > 0 ? 'text-red-600' : 'text-blue-600'
          }`}>
            {rate.change > 0 ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span>{Math.abs(rate.change)}%</span>
          </div>
        </div>
      ))}
    </div>
  );
}




