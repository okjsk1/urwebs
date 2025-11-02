import { GripVertical, Trash2 } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Widget } from './types';

interface WidgetCardProps {
  widget: Widget;
  isEditMode: boolean;
  isPublic?: boolean; // Public View 모드
  onDelete?: (id: string) => void;
  children: React.ReactNode;
}

export function WidgetCard({ widget, isEditMode, isPublic = false, onDelete, children }: WidgetCardProps) {
  // Public View에서는 모든 편집 기능 비활성화
  const canEdit = isEditMode && !isPublic;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: widget.id,
    disabled: !canEdit,
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

  // 위젯 크기 확인 (1x1 컴팩트 모드 여부)
  const widgetSize = (widget as any)?.gridSize || (widget as any)?.size;
  let isCompact = false;
  if (typeof widgetSize === 'object' && widgetSize !== null) {
    isCompact = widgetSize.w === 1 && widgetSize.h === 1;
  } else if (typeof widgetSize === 'string') {
    const [w, h] = widgetSize.split('x').map(Number);
    isCompact = w === 1 && h === 1;
  }

  // 컴팩트 모드일 때 타이틀 축약 (긴 타이틀의 경우)
  const getDisplayTitle = (title: string): string => {
    if (!title) return '';
    
    // 영단어 관련 타이틀 축약 (컴팩트 모드든 아니든)
    if (title.includes('영어') && (title.includes('단어') || title.includes('학습') || title.includes('모음'))) {
      if (isCompact) {
        return '영단어';
      }
      // 컴팩트가 아니어도 "영어 단어 학습" 같은 긴 타이틀 축약
      if (title.length > 6) {
        return '영단어';
      }
    }
    
    // 컴팩트 모드일 때 긴 타이틀 축약
    if (isCompact && title.length > 6) {
      return title.substring(0, 6) + '...';
    }
    
    return title;
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        ...cardStyle,
        // Stealth 토큰 적용
        boxShadow: isDragging ? '0 2px 4px rgba(0,0,0,0.08)' : 'var(--stealth-shadow)',
        border: '1px solid var(--stealth-border)',
        borderRadius: isPublic ? 'var(--stealth-radius)' : 'var(--stealth-radius)', // rounded-lg = 8px
        backgroundColor: 'var(--stealth-surface)',
        transition: `all var(--stealth-transition-duration) var(--stealth-transition-easing)`,
      }}
      className={`overflow-hidden ${
        !canEdit ? 'cursor-default' : ''
      }`}
      onMouseEnter={(e) => {
        // hover 시 y-translation 금지, 미세한 배경 하이라이트만
        if (!isDragging && canEdit) {
          e.currentTarget.style.backgroundColor = 'var(--stealth-surface-muted)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isDragging) {
          e.currentTarget.style.backgroundColor = 'var(--stealth-surface)';
        }
      }}
    >
      {/* 헤더 - Stealth 규격: 높이 36px, 타이틀 13.5~14px, 아이콘 14~16px */}
      <div
        style={{
          height: '36px',
          paddingLeft: 'var(--stealth-spacing-card)',
          paddingRight: 'var(--stealth-spacing-card)',
          borderBottom: '1px solid var(--stealth-border)',
          backgroundColor: 'var(--stealth-surface-muted)',
          transition: `background-color var(--stealth-transition-duration) var(--stealth-transition-easing)`,
        }}
        className={`drag-handle flex items-center justify-between ${
          canEdit ? 'cursor-move' : ''
        }`}
        {...(canEdit ? { ...attributes, ...listeners } : {})}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
          {canEdit && (
            <GripVertical 
              className="text-gray-400 flex-shrink-0" 
              style={{ width: '14px', height: '14px' }}
            />
          )}
          <h3 
            className="truncate overflow-hidden text-ellipsis"
            style={{
              fontSize: '13.5px',
              lineHeight: '1.2',
              fontWeight: 'var(--stealth-font-weight-header)',
              color: 'var(--stealth-text-primary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '100%',
              flex: '1 1 0',
              minWidth: 0,
            }}
            title={widget.title} // 전체 타이틀을 툴팁으로 표시
          >
            {getDisplayTitle(widget.title || '')}
          </h3>
        </div>
        
        {canEdit && onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm('이 위젯을 삭제하시겠습니까?')) {
                onDelete(widget.id);
              }
            }}
            style={{
              transition: `all var(--stealth-transition-duration) var(--stealth-transition-easing)`,
            }}
            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded flex-shrink-0 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-1"
            aria-label="위젯 삭제"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
      
      {/* 컨텐츠 - Stealth 규격: padding 16px (기본), L사이즈 20~24px */}
      <div 
        className="min-h-[64px]"
        style={{
          padding: 'var(--stealth-spacing-card)',
        }}
      >
        {children}
      </div>
    </div>
  );
}

































