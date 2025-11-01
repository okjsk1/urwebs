import { GripVertical, Trash2 } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Widget } from './types';

interface WidgetCardProps {
  widget: Widget;
  isEditMode: boolean;
  onDelete?: (id: string) => void;
  children: React.ReactNode;
}

export function WidgetCard({ widget, isEditMode, onDelete, children }: WidgetCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: widget.id,
    disabled: !isEditMode,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // 위젯의 minHeight가 있으면 적용
  const cardStyle = {
    ...style,
    ...(widget.minHeight && { minHeight: `${widget.minHeight}px` }),
  };

  return (
    <div
      ref={setNodeRef}
      style={cardStyle}
      className={`bg-white rounded-2xl shadow-lg overflow-hidden transition-shadow ${
        isDragging ? 'shadow-2xl scale-105 z-10' : 'hover:shadow-xl'
      } ${!isEditMode ? 'cursor-default' : ''}`}
    >
      {/* 헤더 - 드래그 핸들 (h-10 px-3 통일) */}
      <div
        className={`drag-handle flex items-center justify-between h-10 px-3 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-100 ${
          isEditMode ? 'cursor-move' : ''
        }`}
        {...(isEditMode ? { ...attributes, ...listeners } : {})}
      >
        <div className="flex items-center gap-2 min-w-0">
          {isEditMode && (
            <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0" />
          )}
          <h3 className="font-semibold text-gray-800 text-sm truncate">{widget.title}</h3>
        </div>
        
        {isEditMode && onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm('이 위젯을 삭제하시겠습니까?')) {
                onDelete(widget.id);
              }
            }}
            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors flex-shrink-0 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-1"
            aria-label="위젯 삭제"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
      
      {/* 컨텐츠 */}
      <div className="p-4 min-h-[64px]">
        {children}
      </div>
    </div>
  );
}

































