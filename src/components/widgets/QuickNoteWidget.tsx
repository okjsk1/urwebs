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
      case 's': return 6; // 1x1 - 더 많은 행
      case 'm': return 12; // 1x2 - 더 많은 행
      case 'l': return 18; // 1x3 - 더 많은 행
      default: return 6;
    }
  };

  return (
    <WidgetShell
      icon={<FileText className="w-4 h-4 text-gray-600" aria-hidden="true" />}
      title={title || '빠른 메모'}
      size={size}
      onRemove={onRemove ? () => onRemove(id) : undefined}
      onResize={onResize ? (newSize) => onResize(id, newSize) : undefined}
      onPin={onPin ? () => onPin(id) : undefined}
    >
      <div className="h-full flex flex-col">
        <textarea
          value={state.text}
          onChange={handleTextChange}
          className="flex-1 w-full p-2 text-sm border-0 resize-none focus:outline-none bg-transparent"
          style={{ textAlign: 'left', verticalAlign: 'top' }}
          rows={getRows(size)}
          aria-label="빠른 메모 내용"
          placeholder="메모를 작성하세요..."
        />
      </div>
    </WidgetShell>
  );
}
