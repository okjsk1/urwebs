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
  variant?: 'card' | 'bare' | 'inset';
  /** 내부 컨텐츠에 추가 클래스 */
  contentClassName?: string;
  /** 헤더 표시 여부 */
  headerVariant?: 'default' | 'compact' | 'none';
  /** 헤더 우측에 배치할 사용자 정의 액션 */
  headerAction?: ReactNode;
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
  contentClassName = '',
  headerVariant = 'default',
  headerAction
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

  const isCardLike = variant === 'card' || variant === 'inset';

  const wrapperClass = isCardLike
    ? `relative rounded-2xl border border-gray-200 bg-white/85 shadow-sm overflow-hidden backdrop-blur pointer-events-auto ${sizeClasses[size]} ${className}`
    : `relative bg-transparent shadow-none ring-0 pointer-events-auto ${className}`;

  const bodyBase = isCardLike ? 'h-full overflow-hidden flex flex-col' : '';
  const bodyPadding = isCardLike ? 'p-3' : 'p-0';
  const bodyDecoration = variant === 'inset'
    ? 'bg-transparent border-none rounded-none shadow-none'
    : '';

  const bodyClass = `${bodyPadding} ${bodyBase} ${bodyDecoration} ${contentClassName}`.trim();

  const showHeader = isCardLike && headerVariant !== 'none';

  return (
    <section 
      className={wrapperClass}
      onClick={handleOutsideClick}
    >
      {/* 헤더 - card variant이고 headerVariant가 none이 아닐 때만 표시 */}
      {showHeader && (
        <header className={`relative z-10 flex items-center justify-between border-b border-white/60 bg-white/75 backdrop-blur pointer-events-auto ${
          headerVariant === 'compact' ? 'h-8 px-2' : 'h-10 px-3'
        }`}>
          <div className="flex items-center gap-2">
            {icon}
            <h3 className={`font-semibold text-gray-900 truncate ${
              headerVariant === 'compact' ? 'text-xs' : 'text-sm'
            }`}>{title}</h3>
          </div>
          {headerAction && (
            <div className="flex items-center gap-1 pointer-events-auto">
              {headerAction}
            </div>
          )}
        </header>
      )}
      
      {/* 콘텐츠 */}
      <div className={`relative z-0 pointer-events-auto ${bodyClass}`}>
        {children}
      </div>
    </section>
  );
}
