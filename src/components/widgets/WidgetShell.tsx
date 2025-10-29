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
  children: ReactNode;
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
          
          <div className="flex items-center gap-1">
            {onRefresh && (
              <button
                aria-label="새로고침"
                onClick={onRefresh}
                className="p-1 rounded hover:bg-slate-100 focus:ring-2 focus:ring-indigo-200 focus:outline-none transition-colors"
              >
                <RefreshCw className="w-4 h-4 text-gray-600" />
              </button>
            )}
            
            <div className="relative">
              <button
                aria-label="메뉴"
                onClick={handleMenuToggle}
                className="p-1 rounded hover:bg-slate-100 focus:ring-2 focus:ring-indigo-200 focus:outline-none transition-colors"
              >
                <MoreHorizontal className="w-4 h-4 text-gray-600" />
              </button>
              
              {showMenu && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <div className="py-1">
                    {/* 크기 변경 */}
                    {onResize && (
                      <div className="px-3 py-2 border-b border-gray-100">
                        <div className="text-xs font-medium text-gray-500 mb-1">크기</div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              onResize('s');
                              setShowMenu(false);
                            }}
                            className={`px-2 py-1 text-xs rounded ${
                              size === 's' ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-100'
                            }`}
                          >
                            <Minimize2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => {
                              onResize('m');
                              setShowMenu(false);
                            }}
                            className={`px-2 py-1 text-xs rounded ${
                              size === 'm' ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-100'
                            }`}
                          >
                            <Maximize2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => {
                              onResize('l');
                              setShowMenu(false);
                            }}
                            className={`px-2 py-1 text-xs rounded ${
                              size === 'l' ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-100'
                            }`}
                          >
                            <Maximize2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => {
                              onResize('xl');
                              setShowMenu(false);
                            }}
                            className={`px-2 py-1 text-xs rounded ${
                              size === 'xl' ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-100'
                            }`}
                          >
                            <Maximize2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {/* 고정 */}
                    {onPin && (
                      <button
                        onClick={() => {
                          onPin();
                          setShowMenu(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                      >
                        <Pin className={`w-4 h-4 ${isPinned ? 'text-indigo-600' : 'text-gray-400'}`} />
                        {isPinned ? '고정 해제' : '고정'}
                      </button>
                    )}
                    
                    {/* 삭제 */}
                    {onRemove && (
                      <button
                        onClick={() => {
                          onRemove();
                          setShowMenu(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        삭제
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>
      )}
      
      {/* 콘텐츠 */}
      <div className={`${bodyPad} ${contentClassName}`}>
        {children}
      </div>
    </section>
  );
}
