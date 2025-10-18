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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-2xl shadow-lg overflow-hidden transition-shadow ${
        isDragging ? 'shadow-2xl scale-105 z-10' : 'hover:shadow-xl'
      } ${!isEditMode ? 'cursor-default' : ''}`}
    >
      {/* 헤더 - 드래그 핸들 */}
      <div
        className={`drag-handle flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-100 ${
          isEditMode ? 'cursor-move' : ''
        }`}
        {...(isEditMode ? { ...attributes, ...listeners } : {})}
      >
        <div className="flex items-center gap-2">
          {isEditMode && (
            <GripVertical className="w-4 h-4 text-gray-400" />
          )}
          <h3 className="font-semibold text-gray-800 text-sm">{widget.title}</h3>
        </div>
        
        {isEditMode && onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm('이 위젯을 삭제하시겠습니까?')) {
                onDelete(widget.id);
              }
            }}
            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors"
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































