import { Card } from './ui/card';
import { LucideIcon } from 'lucide-react';
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';

interface SubCategory {
  id: string;
  title: string;
  description: string;
}

interface CategoryHoverCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  subCategories?: SubCategory[];
  onClick: (subCategoryId?: string) => void;
  openMode?: 'hover' | 'click';
  hoverOpenDelay?: number;
  hoverCloseDelay?: number;
  maxListHeight?: number;
}

export function CategoryHoverCard({
  icon: Icon,
  title,
  description,
  subCategories,
  onClick,
  openMode: openModeProp,
  hoverOpenDelay = 120,
  hoverCloseDelay = 160,
  maxListHeight = 320,
}: CategoryHoverCardProps) {
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const openTimer = useRef<number>();
  const closeTimer = useRef<number>();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const triggerId = useId();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const touch =
        'ontouchstart' in window ||
        (typeof navigator !== 'undefined' &&
          ('maxTouchPoints' in navigator ? navigator.maxTouchPoints > 0 : false));
      setIsTouchDevice(touch);
    }
  }, []);

  const resolvedOpenMode = useMemo<'hover' | 'click'>(() => {
    if (openModeProp) return openModeProp;
    return isTouchDevice ? 'click' : 'hover';
  }, [openModeProp, isTouchDevice]);

  const clearTimers = useCallback(() => {
    if (openTimer.current) {
      window.clearTimeout(openTimer.current);
      openTimer.current = undefined;
    }
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = undefined;
    }
  }, []);

  const openPanel = useCallback(() => {
    clearTimers();
    setIsOpen(true);
  }, [clearTimers]);

  const closePanel = useCallback(
    (focusTrigger?: boolean) => {
      clearTimers();
      setIsOpen(false);
      if (focusTrigger) {
        requestAnimationFrame(() => triggerRef.current?.focus());
      }
    },
    [clearTimers],
  );

  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  const handleDocumentClick = useCallback(
    (event: MouseEvent | TouchEvent) => {
      if (!isOpen) return;
      const target = event.target as Node | null;
      const root = rootRef.current;
      if (!root || !target) return;
      if (!root.contains(target)) {
        closePanel(true);
      }
    },
    [isOpen, closePanel],
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener('mousedown', handleDocumentClick);
    document.addEventListener('touchstart', handleDocumentClick);
    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
      document.removeEventListener('touchstart', handleDocumentClick);
    };
  }, [isOpen, handleDocumentClick]);

  const scheduleOpen = useCallback(() => {
    if (resolvedOpenMode !== 'hover') return;
    clearTimers();
    openTimer.current = window.setTimeout(() => setIsOpen(true), hoverOpenDelay);
  }, [clearTimers, hoverOpenDelay, resolvedOpenMode]);

  const scheduleClose = useCallback(() => {
    if (resolvedOpenMode !== 'hover') return;
    clearTimers();
    closeTimer.current = window.setTimeout(() => setIsOpen(false), hoverCloseDelay);
  }, [clearTimers, hoverCloseDelay, resolvedOpenMode]);

  const handleTriggerClick = useCallback(() => {
    if (resolvedOpenMode === 'click' || isTouchDevice) {
      setIsOpen((prev) => !prev);
    } else {
      setIsOpen(true);
    }
  }, [resolvedOpenMode, isTouchDevice]);

  const handleTriggerKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleTriggerClick();
      } else if (event.key === 'Escape') {
        event.preventDefault();
        closePanel(true);
      } else if (event.key === 'ArrowDown' && subCategories?.length) {
        event.preventDefault();
        openPanel();
        requestAnimationFrame(() => {
          const firstItem = panelRef.current?.querySelector<HTMLElement>('[data-menu-item]');
          firstItem?.focus();
        });
      }
    },
    [handleTriggerClick, closePanel, subCategories, openPanel],
  );

  const handlePanelKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closePanel(true);
      }
      if (event.key === 'Tab') {
        closePanel();
      }
    },
    [closePanel],
  );

  const handleItemKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLButtonElement>, subCategoryId?: string) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onClick(subCategoryId);
        closePanel(true);
      }
    },
    [onClick, closePanel],
  );

  const handleMouseEnter = () => {
    if (resolvedOpenMode === 'hover') {
      scheduleOpen();
    }
  };

  const handleMouseLeave = () => {
    if (resolvedOpenMode === 'hover') {
      scheduleClose();
    }
  };

  const handleClick = (subCategoryId?: string) => {
    onClick(subCategoryId);
  };

  if (!subCategories || subCategories.length === 0) {
    return (
      <Card
        className="p-6 cursor-pointer hover:shadow-lg transition-shadow duration-200 bg-white border border-gray-200"
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleClick();
          }
        }}
        onClick={() => handleClick()}
      >
        <div className="flex flex-col items-center text-center gap-3">
          <div className="p-3 bg-blue-50 rounded-lg">
            <Icon className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div
      ref={rootRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Card
        ref={triggerRef}
        className="p-6 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white border border-gray-200 hover:border-blue-300 group"
        role="button"
        tabIndex={0}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        id={triggerId}
        onClick={handleTriggerClick}
        onKeyDown={handleTriggerKeyDown}
      >
        <div className="flex flex-col items-center text-center gap-4">
          <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl group-hover:from-blue-100 group-hover:to-purple-100 transition-colors">
            <Icon className="w-8 h-8 text-blue-600 group-hover:text-blue-700 transition-colors" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">{title}</h3>
            <p className="text-sm text-gray-600 mt-2 leading-relaxed">{description}</p>
            <div className="mt-3 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
              {subCategories.length}개 세부 분야
            </div>
          </div>
        </div>
      </Card>

      {isOpen && (
        <div className="absolute top-0 left-0 w-full z-20">
          <Card
            ref={panelRef}
            id={menuId}
            role="menu"
            aria-labelledby={triggerId}
            tabIndex={-1}
            className="p-4 bg-white border-2 border-blue-200 shadow-2xl rounded-xl"
            onKeyDown={handlePanelKeyDown}
            onMouseEnter={() => {
              if (resolvedOpenMode === 'hover') {
                clearTimers();
              }
            }}
            onMouseLeave={handleMouseLeave}
            style={{ maxHeight: maxListHeight, overflowY: 'auto' }}
          >
            <div className="mb-2">
              <h4 className="font-semibold text-gray-800 text-sm mb-1">{title}</h4>
              <div className="w-full h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded"></div>
            </div>
            <div className="space-y-1">
              {subCategories.map((subCategory) => (
                <button
                  key={subCategory.id}
                  type="button"
                  data-menu-item
                  role="menuitem"
                  className="w-full text-left p-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-lg cursor-pointer transition-all duration-200 border border-transparent hover:border-blue-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  onClick={() => {
                    handleClick(subCategory.id);
                    closePanel(true);
                  }}
                  onKeyDown={(event) => handleItemKeyDown(event, subCategory.id)}
                >
                  <h4 className="font-medium text-gray-900 text-sm flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    {subCategory.title}
                  </h4>
                  <p className="text-xs text-gray-600 ml-4">{subCategory.description}</p>
                </button>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}