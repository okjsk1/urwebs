import React, { useState, useCallback, useEffect, useRef } from 'react';
import { FileText } from 'lucide-react';
import { WidgetShell, WidgetProps, WidgetSize } from './WidgetShell';
import { uiPalette, typeScale } from '../../constants/uiTheme';
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

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, []);

  useEffect(() => {
    adjustTextareaHeight();
  }, [adjustTextareaHeight, state.text]);

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextText = e.target.value;
    setState(prev => ({ ...prev, text: nextText }));
    requestAnimationFrame(adjustTextareaHeight);
    if (size === 's') {
      const lines = nextText.split('\n').length;
      if (lines > 5) {
        onResize?.(id, 'm');
      }
    }
  }, [size, onResize, id]);

  const getRows = (currentSize: WidgetSize) => {
    switch (currentSize) {
      case 's': return 6;
      case 'm': return 10;
      case 'l': return 14;
      default: return 6;
    }
  };

  const rows = size === 's' ? 3 : getRows(size);
  const textareaClassName = `
    w-full border-0 resize-none focus:outline-none bg-transparent
    ${typeScale.md} ${uiPalette.textStrong} placeholder:${uiPalette.textMuted} leading-snug
    ${size === 's' ? 'p-2' : 'p-3'}
  `.replace(/\s+/g, ' ').trim();

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
      <div className="h-full flex flex-col">
        <textarea
          ref={textareaRef}
          value={state.text}
          onChange={handleTextChange}
          className={textareaClassName}
          style={{ textAlign: 'left', verticalAlign: 'top', overflow: 'hidden' }}
          rows={rows}
          aria-label="빠른 메모 내용"
          placeholder="메모를 작성하세요..."
        />
      </div>
    </WidgetShell>
  );
}
