import React, { useState, useCallback, useEffect } from 'react';
import { FileText } from 'lucide-react';
import { WidgetShell, WidgetProps, WidgetSize } from './WidgetShell';
import { readLocal, persistOrLocal } from './utils/widget-helpers';

interface QuickNoteState {
  text: string;
}

interface QuickNoteWidgetProps extends WidgetProps {
  widget?: {
    id: string;
    type: string;
    title?: string;
    content?: any;
  };
  isEditMode?: boolean;
  updateWidget?: (widgetId: string, partial: any) => void;
}

export function QuickNoteWidget({ id, title, size = 's', onRemove, onResize, onPin, widget, isEditMode, updateWidget }: QuickNoteWidgetProps) {
  // widget prop이 있으면 widget.id를 사용, 없으면 id prop 사용 (하위 호환성)
  const widgetId = widget?.id || id;
  
  const [state, setState] = useState<QuickNoteState>(() => {
    // widget.content에서 먼저 확인 (Firebase 동기화 데이터)
    if (widget?.content?.text !== undefined) {
      return { text: widget.content.text };
    }
    // localStorage에서 확인
    const saved = readLocal(widgetId, { text: '' });
    return saved;
  });

  // 상태 저장 (위젯 content에도 저장하여 동기화)
  useEffect(() => {
    persistOrLocal(widgetId, state, updateWidget);
  }, [widgetId, state, updateWidget]);

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setState(prev => ({ ...prev, text: e.target.value }));
  }, []);

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
