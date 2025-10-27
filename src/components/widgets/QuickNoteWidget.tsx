import React, { useState, useCallback } from 'react';
import { FileText, X, Maximize2, Minimize2, Pin } from 'lucide-react';
import { WidgetProps, WidgetSize } from './WidgetShell';
import { usePersist } from '../../hooks/usePersist';

interface QuickNoteState {
  text: string;
}

export function QuickNoteWidget({ id, title, size = 's', onRemove, onResize, onPin }: WidgetProps) {
  const [state, setState] = usePersist<QuickNoteState>(`uw_quicknote_${id}`, {
    text: '',
  });

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setState(prev => ({ ...prev, text: e.target.value }));
  }, [setState]);

  const getRows = (currentSize: WidgetSize) => {
    switch (currentSize) {
      case 's': return 8; // 1x1 - 더 많은 행
      case 'm': return 12; // 1x2 - 더 많은 행
      case 'l': return 18; // 1x3 - 더 많은 행
      default: return 8;
    }
  };

  return (
    <div className="h-full w-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
      {/* 간단한 헤더 */}
      <div className="flex items-center justify-between p-2 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {title || '빠른 메모'}
          </span>
        </div>
        
        {/* 액션 버튼들 */}
        <div className="flex items-center gap-1">
          {onPin && (
            <button
              onClick={() => onPin(id)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              title="고정"
            >
              <Pin className="w-3 h-3" />
            </button>
          )}
          {onResize && (
            <button
              onClick={() => onResize(id, size === 's' ? 'm' : size === 'm' ? 'l' : 's')}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              title="크기 변경"
            >
              {size === 'l' ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
            </button>
          )}
          {onRemove && (
            <button
              onClick={() => onRemove(id)}
              className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
              title="삭제"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* 텍스트 영역 */}
      <div className="p-3 h-full">
        <textarea
          value={state.text}
          onChange={handleTextChange}
          className="w-full h-full text-sm border-0 resize-none focus:outline-none bg-transparent text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
          style={{ textAlign: 'left', verticalAlign: 'top' }}
          rows={getRows(size)}
          aria-label="빠른 메모 내용"
          placeholder="메모를 작성하세요..."
        />
      </div>
    </div>
  );
}
