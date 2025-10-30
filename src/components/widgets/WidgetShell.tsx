import React, { ReactNode } from 'react';
import { RefreshCw, MoreHorizontal, Trash2, Maximize2, Minimize2, Pin } from 'lucide-react';

export type WidgetSize = 's' | 'm' | 'l' | 'xl';

export interface WidgetProps {
  id: string;
  title?: string;
  size?: WidgetSize;
  onRemove?: (id: string) => void;
  onResize?: (id: string, size: WidgetSize) => void;
  onPin?: (id: string) => void;
  isPinned?: boolean;
}

export interface WidgetShellProps {
  icon: ReactNode;
  title: string;
  children?: ReactNode;
  onRefresh?: () => void;
  onRemove?: () => void;
  onResize?: (size: WidgetSize) => void;
  onPin?: () => void;
  isPinned?: boolean;
  size?: WidgetSize;
  className?: string;
  /** 카드 크롬 표시 방식 */
  variant?: 'card' | 'bare';
  /** 내부 컨텐츠에 추가 클래스 */
  contentClassName?: string;
}

const sizeClasses = {
  s: 'h-28',
  m: 'h-32',
  l: 'h-48',
  xl: 'h-64'
};

export function WidgetShell({
  icon,
  title,
  children,
  onRefresh,
  onRemove,
  onResize,
  onPin,
  isPinned = false,
  size = 'm',
  className = '',
  variant = 'card',
  contentClassName = ''
}: WidgetShellProps) {
  const [showMenu, setShowMenu] = React.useState(false);

  const handleMenuToggle = () => {
    setShowMenu(!showMenu);
  };

  const handleOutsideClick = (e: React.MouseEvent) => {
    if (showMenu) {
      setShowMenu(false);
    }
  };

  const wrapperClass = variant === 'card'
    ? `rounded-2xl border bg-white shadow-sm overflow-hidden ${sizeClasses[size]} ${className}`
    : `bg-transparent shadow-none ring-0 ${className}`;

  const bodyPad = variant === 'card' ? 'p-3 h-full overflow-hidden flex flex-col' : 'p-0';

  return (
    <section 
      className={wrapperClass}
      onClick={handleOutsideClick}
    >
      {/* 헤더 - card variant일 때만 표시 */}
      {variant === 'card' && (
        <header className="flex items-center justify-between h-10 px-3 border-b bg-white/80">
          <div className="flex items-center gap-2">
            {icon}
            <h3 className="text-sm font-semibold text-gray-900 truncate">{title}</h3>
          </div>
          
          {/* 편집/메뉴 버튼 제거 요청에 따라 우측 액션 제거 */}
        </header>
      )}
      
      {/* 콘텐츠 */}
      <div className={`${bodyPad} ${contentClassName}`}>
        {children}
      </div>
    </section>
  );
}
