import React, { useEffect, useMemo, useRef, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { WidgetProps, persistOrLocal, readLocal, addToWidgetCollection } from './utils/widget-helpers';

type IndexCode = 'NASDAQ' | 'KOSPI' | 'KOSDAQ' | 'S&P500' | 'DOW' | 'NIKKEI' | 'HSI';

interface IndexRow {
  id: string;
  code: IndexCode;
  name: string;
  price: number;
  changePct: number;
}

interface IndexState {
  indices: IndexCode[]; // 표시할 지수
  rows: IndexRow[];
  lastUpdate: number;
  intervalMs: number; // 5분 기본
  loading: boolean;
}

const ALL_INDICES: Record<IndexCode, string> = {
  NASDAQ: '나스닥',
  KOSPI: '코스피',
  KOSDAQ: '코스닥',
  'S&P500': 'S&P 500',
  DOW: '다우',
  NIKKEI: '니케이',
  HSI: '항셍',
};

// 데모용 데이터 생성기 (실시간 API 대체)
function simulateFetch(codes: IndexCode[]): Promise<IndexRow[]> {
  return new Promise((resolve) => {
    const rows = codes.map((code) => {
      const base = Math.random() * 1000 + 1000;
      const change = (Math.random() - 0.5) * 2; // -1% ~ +1%
      return {
        id: `${code}`,
        code,
        name: ALL_INDICES[code],
        price: Math.round(base * 100) / 100,
        changePct: Math.round(change * 100) / 100,
      } as IndexRow;
    });
    setTimeout(() => resolve(rows), 300);
  });
}

export function MarketIndexWidget({ widget, isEditMode, updateWidget }: WidgetProps) {
  const [state, setState] = useState<IndexState>(() => {
    const saved = readLocal(widget.id, {
      indices: ['NASDAQ', 'KOSPI', 'KOSDAQ'] as IndexCode[],
      rows: [] as IndexRow[],
      lastUpdate: 0,
      intervalMs: 5 * 60 * 1000,
      loading: false,
    });
    return saved;
  });

  const timerRef = useRef<number | null>(null);

  useEffect(() => { addToWidgetCollection('market_index'); }, []);

  const load = async () => {
    if (state.loading) return;
    setState((p) => ({ ...p, loading: true }));
    try {
      const rows = await simulateFetch(state.indices);
      setState((p) => ({ ...p, rows, lastUpdate: Date.now(), loading: false }));
    } catch {
      setState((p) => ({ ...p, loading: false }));
    }
  };

  useEffect(() => {
    load();
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(load, state.intervalMs);
    return () => { if (timerRef.current) window.clearInterval(timerRef.current); };
  }, [state.indices, state.intervalMs]);

  useEffect(() => {
    const t = setTimeout(() => persistOrLocal(widget.id, state, updateWidget), 200);
    return () => clearTimeout(t);
  }, [widget.id, state, updateWidget]);

  const toggleIndex = (code: IndexCode) => {
    setState((p) => {
      const on = p.indices.includes(code);
      const indices = on ? p.indices.filter((c) => c !== code) : [...p.indices, code];
      return { ...p, indices };
    });
  };

  const orderedRows = useMemo(() => state.rows, [state.rows]);

  return (
    <div className="p-2 h-full flex flex-col">
      {/* 설정: 편집모드에서 지수 선택 */}
      {isEditMode && (
        <div className="mb-2 flex flex-wrap gap-1">
          {(Object.keys(ALL_INDICES) as IndexCode[]).map((code) => (
            <button
              key={code}
              onClick={() => toggleIndex(code)}
              className={`px-2 py-0.5 text-xs rounded border ${state.indices.includes(code) ? 'bg-blue-50 border-blue-400 text-blue-700' : 'bg-white border-gray-300 text-gray-600'}`}
            >
              {ALL_INDICES[code]}
            </button>
          ))}
        </div>
      )}

      {/* 리스트 */}
      <div className="flex-1 overflow-y-auto space-y-1">
        {state.loading && (
          <div className="text-center text-xs text-gray-500 py-2">
            <RefreshCw className="w-4 h-4 animate-spin inline mr-1" /> 불러오는 중...
          </div>
        )}
        {orderedRows.map((row) => {
          const isUp = row.changePct >= 0;
          return (
            <div key={row.id} className="bg-white dark:bg-gray-800/80 rounded-xl px-3 py-2 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{row.name}</div>
                <div className="flex items-center gap-3">
                  <div className="text-lg font-extrabold tracking-tight text-gray-900 dark:text-gray-100">{row.price.toLocaleString()}</div>
                  <div className={`text-sm font-semibold ${isUp ? 'text-red-600' : 'text-blue-600'}`}>{Math.abs(row.changePct).toFixed(2)}%</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


