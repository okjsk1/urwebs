// 가계부 위젯 - 수입/지출, 카테고리, 월별 합계
import React, { useState, useCallback, useMemo } from 'react';
import { Button } from '../ui/button';
import { Plus, Trash2, Download, Upload, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { formatMoney } from '../../services/finance/api';
import { WidgetProps, persistOrLocal, readLocal, showToast } from './utils/widget-helpers';
import { useDebouncedEffect } from '../../hooks/useDebouncedEffect';
import { MiniBarChart } from '../ui/Sparkline';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  date: string; // YYYY-MM-DD
  memo?: string;
}

interface Budget {
  monthly: number;
  currency: 'KRW' | 'USD';
}

interface ExpenseState {
  txs: Transaction[];
  budget: Budget;
  month: string; // YYYY-MM
  showAddForm: boolean;
  newTx: Partial<Transaction>;
}

const DEFAULT_TXS: Transaction[] = [
  { id: '1', type: 'expense', category: '식비', amount: 35000, date: new Date().toISOString().split('T')[0], memo: '점심' },
  { id: '2', type: 'expense', category: '교통', amount: 15000, date: new Date().toISOString().split('T')[0] },
  { id: '3', type: 'income', category: '급여', amount: 3000000, date: new Date().toISOString().split('T')[0] }
];

const CATEGORIES = {
  expense: ['식비', '교통', '주거', '의료', '쇼핑', '문화', '기타'],
  income: ['급여', '부수입', '이자', '기타']
};

export const ExpenseWidget: React.FC<WidgetProps> = ({ widget, isEditMode, updateWidget }) => {
  const [state, setState] = useState<ExpenseState>(() => {
    const saved = readLocal(widget.id, {
      txs: DEFAULT_TXS,
      budget: { monthly: 2000000, currency: 'KRW' as const },
      month: new Date().toISOString().slice(0, 7), // YYYY-MM
      showAddForm: false,
      newTx: { type: 'expense' as const, date: new Date().toISOString().split('T')[0] }
    });
    return saved;
  });

  // 상태 저장 (디바운스)
  useDebouncedEffect(() => {
    persistOrLocal(widget.id, state, updateWidget);
  }, [widget.id, state], 300);

  // 월별 필터링
  const monthTxs = useMemo(() => {
    return state.txs.filter(tx => tx.date.startsWith(state.month));
  }, [state.txs, state.month]);

  // 합계 계산
  const summary = useMemo(() => {
    const income = monthTxs.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0);
    const expense = monthTxs.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0);
    const balance = income - expense;
    
    // 카테고리별 합계
    const byCategory: Record<string, number> = {};
    monthTxs.filter(tx => tx.type === 'expense').forEach(tx => {
      byCategory[tx.category] = (byCategory[tx.category] || 0) + tx.amount;
    });
    
    return { income, expense, balance, byCategory };
  }, [monthTxs]);

  const addTx = useCallback(() => {
    const { type, category, amount, date, memo } = state.newTx;
    
    if (!category) {
      showToast('카테고리를 선택하세요', 'error');
      return;
    }
    
    if (!amount || amount <= 0) {
      showToast('금액을 입력하세요', 'error');
      return;
    }
    
    const newTx: Transaction = {
      id: Date.now().toString(),
      type: type || 'expense',
      category,
      amount,
      date: date || new Date().toISOString().split('T')[0],
      memo
    };
    
    setState(prev => ({
      ...prev,
      txs: [...prev.txs, newTx],
      showAddForm: false,
      newTx: { type: 'expense' as const, date: new Date().toISOString().split('T')[0] }
    }));
    
    showToast('내역이 추가되었습니다', 'success');
  }, [state.newTx]);

  const deleteTx = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      txs: prev.txs.filter(tx => tx.id !== id)
    }));
    showToast('내역이 삭제되었습니다', 'success');
  }, []);

  const exportCSV = useCallback(() => {
    const csv = [
      'id,type,category,amount,date,memo',
      ...state.txs.map(tx => 
        `${tx.id},${tx.type},${tx.category},${tx.amount},${tx.date},"${tx.memo || ''}"`
      )
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expense-${state.month}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('CSV 내보내기 완료', 'success');
  }, [state.txs, state.month]);

  // 카테고리별 차트 데이터
  const chartData = useMemo(() => {
    return Object.entries(summary.byCategory)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [summary.byCategory]);

  return (
    <div className="p-2 h-full flex flex-col">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-2 shrink-0">
        <div className="flex items-center gap-1">
          <DollarSign className="w-4 h-4 text-green-600" />
          <h4 className="font-semibold text-sm text-gray-800">가계부</h4>
        </div>
        <div className="flex items-center gap-1">
          {isEditMode && (
            <>
              <button
                onClick={() => setState(prev => ({ ...prev, showAddForm: !prev.showAddForm }))}
                className="p-1 hover:bg-gray-100 rounded"
                title="내역 추가"
              >
                <Plus className="w-3 h-3 text-green-600" />
              </button>
              <button
                onClick={exportCSV}
                className="p-1 hover:bg-gray-100 rounded"
                title="CSV 내보내기"
              >
                <Download className="w-3 h-3 text-blue-600" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* 월 선택 */}
      <div className="mb-2 shrink-0">
        <input
          type="month"
          value={state.month}
          onChange={(e) => setState(prev => ({ ...prev, month: e.target.value }))}
          className="w-full text-xs px-2 py-1 border border-gray-300 rounded"
        />
      </div>

      {/* 요약 */}
      <div className="grid grid-cols-3 gap-1 mb-2 shrink-0">
        <div className="bg-green-50 rounded p-1 text-center">
          <div className="flex items-center justify-center gap-0.5">
            <TrendingUp className="w-3 h-3 text-green-600" />
            <span className="text-xs text-gray-600">수입</span>
          </div>
          <div className="text-xs font-bold text-green-600">
            {formatMoney(summary.income, state.budget.currency)}
          </div>
        </div>
        <div className="bg-red-50 rounded p-1 text-center">
          <div className="flex items-center justify-center gap-0.5">
            <TrendingDown className="w-3 h-3 text-red-600" />
            <span className="text-xs text-gray-600">지출</span>
          </div>
          <div className="text-xs font-bold text-red-600">
            {formatMoney(summary.expense, state.budget.currency)}
          </div>
        </div>
        <div className={`rounded p-1 text-center ${summary.balance >= 0 ? 'bg-blue-50' : 'bg-orange-50'}`}>
          <div className="text-xs text-gray-600">잔액</div>
          <div className={`text-xs font-bold ${summary.balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
            {formatMoney(summary.balance, state.budget.currency)}
          </div>
        </div>
      </div>

      {/* 추가 폼 */}
      {isEditMode && state.showAddForm && (
        <div className="bg-gray-50 rounded p-2 mb-2 space-y-1 shrink-0">
          <div className="grid grid-cols-2 gap-1">
            <select
              value={state.newTx.type || 'expense'}
              onChange={(e) => setState(prev => ({
                ...prev,
                newTx: { ...prev.newTx, type: e.target.value as any, category: undefined }
              }))}
              className="text-xs px-2 py-1 border border-gray-300 rounded"
            >
              <option value="expense">지출</option>
              <option value="income">수입</option>
            </select>
            <select
              value={state.newTx.category || ''}
              onChange={(e) => setState(prev => ({
                ...prev,
                newTx: { ...prev.newTx, category: e.target.value }
              }))}
              className="text-xs px-2 py-1 border border-gray-300 rounded"
            >
              <option value="">카테고리</option>
              {CATEGORIES[state.newTx.type || 'expense'].map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <input
            type="number"
            value={state.newTx.amount || ''}
            onChange={(e) => setState(prev => ({
              ...prev,
              newTx: { ...prev.newTx, amount: parseFloat(e.target.value) }
            }))}
            placeholder="금액"
            className="w-full text-xs px-2 py-1 border border-gray-300 rounded"
          />
          <input
            type="date"
            value={state.newTx.date || ''}
            onChange={(e) => setState(prev => ({
              ...prev,
              newTx: { ...prev.newTx, date: e.target.value }
            }))}
            className="w-full text-xs px-2 py-1 border border-gray-300 rounded"
          />
          <div className="flex gap-1">
            <Button size="sm" className="flex-1 h-6 text-xs" onClick={addTx}>
              추가
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="flex-1 h-6 text-xs"
              onClick={() => setState(prev => ({
                ...prev,
                showAddForm: false,
                newTx: { type: 'expense' as const, date: new Date().toISOString().split('T')[0] }
              }))}
            >
              취소
            </Button>
          </div>
        </div>
      )}

      {/* 내역 목록 */}
      <div className="flex-1 overflow-y-auto space-y-1">
        {monthTxs.length === 0 ? (
          <div className="text-center text-gray-500 text-xs py-4">
            이번 달 내역이 없습니다
          </div>
        ) : (
          monthTxs
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map(tx => (
              <div
                key={tx.id}
                className={`relative p-2 rounded border-l-4 ${
                  tx.type === 'income' ? 'bg-green-50 border-green-400' : 'bg-red-50 border-red-400'
                } group`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="text-xs font-medium text-gray-800">{tx.category}</div>
                    <div className="text-xs text-gray-500">{tx.date}</div>
                    {tx.memo && (
                      <div className="text-xs text-gray-600 italic mt-0.5">{tx.memo}</div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-bold ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.type === 'income' ? '+' : '-'}{formatMoney(tx.amount, state.budget.currency)}
                    </div>
                  </div>
                </div>
                
                {/* 삭제 버튼 */}
                {isEditMode && (
                  <button
                    onClick={() => deleteTx(tx.id)}
                    className="absolute top-1 right-1 p-0.5 bg-red-100 hover:bg-red-200 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3 text-red-600" />
                  </button>
                )}
              </div>
            ))
        )}
      </div>

      {/* 카테고리 차트 (간단) */}
      {chartData.length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-200 shrink-0">
          <div className="text-xs text-gray-600 mb-1">지출 Top 5</div>
          <div className="space-y-0.5">
            {chartData.map(([cat, amt]) => (
              <div key={cat} className="flex items-center gap-1">
                <span className="text-xs text-gray-700 w-12 truncate">{cat}</span>
                <div className="flex-1 bg-gray-200 rounded h-2">
                  <div
                    className="bg-red-400 h-2 rounded"
                    style={{ width: `${(amt / summary.expense) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-600 w-16 text-right">
                  {Math.round((amt / summary.expense) * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};









