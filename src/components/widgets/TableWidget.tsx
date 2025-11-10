import React, { useCallback, useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import { Button } from '../ui/button';
import {
  WidgetProps as WidgetComponentProps,
  persistOrLocal,
  readLocal,
  showToast,
  copyToClipboard,
} from './utils/widget-helpers';
import { Plus, Trash2, Copy } from 'lucide-react';

type TableRow = {
  id: string;
  values: string[];
};

interface TableState {
  headers: string[];
  rows: TableRow[];
  footnote: string;
  zebra: boolean;
  dense: boolean;
  stickyHeader: boolean;
}

const MAX_COLUMNS = 8;
const MAX_ROWS = 30;

const createDefaultState = (): TableState => ({
  headers: ['구분', '월요일', '화요일', '수요일'],
  rows: [
    {
      id: `row-${Date.now()}-1`,
      values: ['회의', '10:00', '09:30', '14:00'],
    },
    {
      id: `row-${Date.now()}-2`,
      values: ['보고서 작성', '14:00', '15:30', '13:00'],
    },
    {
      id: `row-${Date.now()}-3`,
      values: ['팀 커피챗', '', '16:00', ''],
    },
  ],
  footnote: '필요한 일정을 자유롭게 기록해보세요.',
  zebra: true,
  dense: false,
  stickyHeader: true,
});

const normalizeState = (raw: Partial<TableState> | null | undefined): TableState => {
  const fallback = createDefaultState();
  const headers = Array.isArray(raw?.headers) && raw?.headers.length
    ? raw.headers.slice(0, MAX_COLUMNS)
    : fallback.headers;

  const ensureRowValues = (values: string[]): string[] => {
    const copy = [...values];
    if (copy.length < headers.length) {
      return copy.concat(Array(headers.length - copy.length).fill(''));
    }
    return copy.slice(0, headers.length);
  };

  const rows: TableRow[] = Array.isArray(raw?.rows) && raw.rows.length
    ? raw.rows.slice(0, MAX_ROWS).map((row, index) => ({
        id: row?.id || `row-${Date.now()}-${index}`,
        values: ensureRowValues(Array.isArray(row?.values) ? row.values : []),
      }))
    : fallback.rows.map((row, index) => ({
        ...row,
        id: `${row.id}-${index}`,
        values: ensureRowValues(row.values),
      }));

  return {
    headers,
    rows,
    footnote: typeof raw?.footnote === 'string' ? raw.footnote : fallback.footnote,
    zebra: typeof raw?.zebra === 'boolean' ? raw.zebra : fallback.zebra,
    dense: typeof raw?.dense === 'boolean' ? raw.dense : fallback.dense,
    stickyHeader: typeof raw?.stickyHeader === 'boolean' ? raw.stickyHeader : fallback.stickyHeader,
  };
};

export const TableWidget = ({ widget, isEditMode, updateWidget }: WidgetComponentProps) => {
  const [state, setState] = useState<TableState>(() => {
    const saved = readLocal(widget.id, createDefaultState());
    return normalizeState(saved);
  });

  useEffect(() => {
    persistOrLocal(widget.id, state, updateWidget);
  }, [widget.id, state, updateWidget]);

  const cellPadding = useMemo(() => (state.dense ? 'px-2 py-1.5' : 'px-3 py-2.5'), [state.dense]);

  const addRow = useCallback(() => {
    setState((prev) => {
      if (prev.rows.length >= MAX_ROWS) {
        showToast('행은 최대 30개까지 추가할 수 있어요.', 'error');
        return prev;
      }
      const newRow: TableRow = {
        id: `row-${Date.now()}`,
        values: Array(prev.headers.length).fill(''),
      };
      showToast('새 행이 추가되었습니다.', 'success');
      return { ...prev, rows: [...prev.rows, newRow] };
    });
  }, []);

  const addColumn = useCallback(() => {
    setState((prev) => {
      if (prev.headers.length >= MAX_COLUMNS) {
        showToast('열은 최대 8개까지 추가할 수 있어요.', 'error');
        return prev;
      }
      const newHeaders = [...prev.headers, `열 ${prev.headers.length + 1}`];
      const newRows = prev.rows.map((row) => ({
        ...row,
        values: [...row.values, ''],
      }));
      showToast('새 열이 추가되었습니다.', 'success');
      return { ...prev, headers: newHeaders, rows: newRows };
    });
  }, []);

  const removeRow = useCallback((rowId: string) => {
    setState((prev) => {
      if (prev.rows.length <= 1) {
        showToast('표에는 최소 1개의 행이 필요해요.', 'error');
        return prev;
      }
      const filtered = prev.rows.filter((row) => row.id !== rowId);
      showToast('행이 삭제되었습니다.', 'success');
      return { ...prev, rows: filtered };
    });
  }, []);

  const removeColumn = useCallback((index: number) => {
    setState((prev) => {
      if (prev.headers.length <= 1) {
        showToast('표에는 최소 1개의 열이 필요해요.', 'error');
        return prev;
      }
      const newHeaders = prev.headers.filter((_, headerIndex) => headerIndex !== index);
      const newRows = prev.rows.map((row) => ({
        ...row,
        values: row.values.filter((_, valueIndex) => valueIndex !== index),
      }));
      showToast('열이 삭제되었습니다.', 'success');
      return { ...prev, headers: newHeaders, rows: newRows };
    });
  }, []);

  const handleHeaderChange = useCallback((index: number, value: string) => {
    setState((prev) => {
      const headers = [...prev.headers];
      headers[index] = value;
      return { ...prev, headers };
    });
  }, []);

  const handleCellChange = useCallback((rowId: string, index: number, value: string) => {
    setState((prev) => {
      const rows = prev.rows.map((row) =>
        row.id === rowId
          ? {
              ...row,
              values: row.values.map((cell, cellIndex) => (cellIndex === index ? value : cell)),
            }
          : row
      );
      return { ...prev, rows };
    });
  }, []);

  const toggleOption = useCallback((key: 'zebra' | 'dense' | 'stickyHeader') => {
    setState((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const resetTable = useCallback(() => {
    setState(normalizeState(createDefaultState()));
    showToast('표가 초기 상태로 되돌아갔어요.', 'info');
  }, []);

  const copyTable = useCallback(async () => {
    const rows = [
      state.headers.join('\t'),
      ...state.rows.map((row) => row.values.join('\t')),
      state.footnote ? `비고\t${state.footnote}` : '',
    ].filter(Boolean);

    const success = await copyToClipboard(rows.join('\n'));
    if (success) {
      showToast('표 데이터를 클립보드에 복사했어요.', 'success');
    } else {
      showToast('복사를 지원하지 않는 환경이에요.', 'error');
    }
  }, [state.headers, state.rows, state.footnote]);

  const updateFootnote = useCallback((value: string) => {
    setState((prev) => ({ ...prev, footnote: value }));
  }, []);

  return (
    <div className="p-2 h-full flex flex-col">
      <div className="flex items-center justify-between mb-2 shrink-0">
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <span className="text-base">📋</span>
          <span>표 작성 도구</span>
        </div>
        <div className="flex items-center gap-1">
          <Button size="sm" variant="outline" className="h-7 px-2 text-[11px]" onClick={copyTable}>
            <Copy className="w-3 h-3" />
            복사
          </Button>
          {isEditMode && (
            <Button size="sm" variant="ghost" className="h-7 px-2 text-[11px]" onClick={resetTable}>
              초기화
            </Button>
          )}
        </div>
      </div>

      {isEditMode && (
        <div className="mb-2 space-y-1.5 shrink-0">
          <div className="flex flex-wrap gap-1">
            <Button size="sm" variant="default" className="h-7 px-3 text-xs" onClick={addRow}>
              <Plus className="w-3 h-3" />
              행 추가
            </Button>
            <Button size="sm" variant="default" className="h-7 px-3 text-xs" onClick={addColumn}>
              <Plus className="w-3 h-3" />
              열 추가
            </Button>
          </div>
          <div className="flex flex-wrap gap-3 text-[11px] text-gray-600">
            <label className="inline-flex items-center gap-1">
              <input
                type="checkbox"
                checked={state.zebra}
                onChange={() => toggleOption('zebra')}
              />
              줄무늬 배경
            </label>
            <label className="inline-flex items-center gap-1">
              <input
                type="checkbox"
                checked={state.dense}
                onChange={() => toggleOption('dense')}
              />
              촘촘한 행간
            </label>
            <label className="inline-flex items-center gap-1">
              <input
                type="checkbox"
                checked={state.stickyHeader}
                onChange={() => toggleOption('stickyHeader')}
              />
              헤더 고정
            </label>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full border-collapse text-xs md:text-[13px]">
          <thead
            className={clsx(
              'bg-gray-50',
              state.stickyHeader && 'sticky top-0 z-10 shadow-sm'
            )}
          >
            <tr>
              {state.headers.map((header, index) => (
                <th
                  key={`${header}-${index}`}
                  className={clsx(
                    'border border-gray-200 text-left align-middle font-semibold text-gray-700',
                    cellPadding,
                    'relative'
                  )}
                  style={{ minWidth: 80 }}
                >
                  {isEditMode ? (
                    <input
                      value={header}
                      onChange={(e) => handleHeaderChange(index, e.target.value)}
                      className="w-full border-none bg-transparent text-xs font-semibold text-gray-800 focus:outline-none focus:ring-0"
                      placeholder={`열 ${index + 1}`}
                    />
                  ) : (
                    <span>{header || `열 ${index + 1}`}</span>
                  )}
                  {isEditMode && state.headers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeColumn(index)}
                      className="absolute -right-1 -top-1 rounded-full border border-gray-300 bg-white p-0.5 shadow-sm transition hover:bg-red-50"
                      title="열 삭제"
                    >
                      <Trash2 className="w-3 h-3 text-gray-500" />
                    </button>
                  )}
                </th>
              ))}
              {isEditMode && <th className="w-8 border border-gray-200 bg-gray-50" />}
            </tr>
          </thead>
          <tbody>
            {state.rows.map((row, rowIndex) => (
              <tr
                key={row.id}
                className={clsx(
                  state.zebra && rowIndex % 2 === 1 ? 'bg-gray-50/60' : 'bg-white',
                  !isEditMode && state.zebra && rowIndex % 2 === 1 && 'hover:bg-gray-50'
                )}
              >
                {row.values.map((value, colIndex) => (
                  <td
                    key={`${row.id}-${colIndex}`}
                    className={clsx(
                      'border border-gray-200 align-top text-gray-800',
                      cellPadding,
                      isEditMode ? 'bg-white/90' : 'bg-white'
                    )}
                  >
                    {isEditMode ? (
                      <textarea
                        value={value}
                        onChange={(e) => handleCellChange(row.id, colIndex, e.target.value)}
                        className="w-full resize-none border-none bg-transparent text-[12px] leading-4 text-gray-800 focus:outline-none focus:ring-0"
                        rows={state.dense ? 1 : 2}
                        placeholder="내용 입력"
                      />
                    ) : (
                      <div className="whitespace-pre-wrap leading-5 text-[12px]">
                        {value?.trim() ? value : <span className="text-gray-300">-</span>}
                      </div>
                    )}
                  </td>
                ))}
                {isEditMode && (
                  <td className="border border-gray-200 align-top">
                    <button
                      type="button"
                      className="mx-auto mt-1 flex h-6 w-6 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-500 transition hover:bg-red-50"
                      onClick={() => removeRow(row.id)}
                      title="행 삭제"
                      disabled={state.rows.length <= 1}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-2 shrink-0">
        {isEditMode ? (
          <textarea
            value={state.footnote}
            onChange={(e) => updateFootnote(e.target.value)}
            className="w-full resize-none rounded-md border border-gray-200 bg-white px-3 py-2 text-[12px] text-gray-600 focus:border-blue-400 focus:outline-none focus:ring focus:ring-blue-100"
            placeholder="각주나 참고 메모를 입력하세요."
            rows={state.dense ? 2 : 3}
          />
        ) : (
          state.footnote && (
            <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-[12px] text-gray-600 whitespace-pre-wrap">
              {state.footnote}
            </div>
          )
        )}
      </div>
    </div>
  );
};

