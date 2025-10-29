import React, { useState, useCallback } from 'react';
import { FileText } from 'lucide-react';
import { WidgetShell, WidgetProps, WidgetSize } from './WidgetShell';
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
    <WidgetShell
      icon={<FileText className="w-4 h-4 text-blue-600" />}
      title={title || '빠른 메모'}
      size={size}
      onRemove={() => onRemove?.(id)}
      onResize={(newSize) => onResize?.(id, newSize)}
      onPin={() => onPin?.(id)}
      variant="bare"
    >
      <textarea
        value={state.text}
        onChange={handleTextChange}
        className="w-full h-full text-sm border-0 resize-none focus:outline-none bg-transparent text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
        style={{ textAlign: 'left', verticalAlign: 'top' }}
        rows={getRows(size)}
        aria-label="빠른 메모 내용"
        placeholder="메모를 작성하세요..."
      />
    </WidgetShell>
  );
}
