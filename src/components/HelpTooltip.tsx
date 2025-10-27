import React, { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';

interface HelpTooltipProps {
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export function HelpTooltip({ content, position = 'top', className = '' }: HelpTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        aria-label="도움말 보기"
      >
        <HelpCircle className="w-4 h-4" />
      </button>
      
      {isVisible && (
        <>
          {/* 배경 오버레이 */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsVisible(false)}
          />
          
          {/* 툴팁 */}
          <div className={`absolute z-50 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm rounded-lg p-3 shadow-lg max-w-xs ${
            position === 'top' ? 'bottom-full mb-2' :
            position === 'bottom' ? 'top-full mt-2' :
            position === 'left' ? 'right-full mr-2' :
            'left-full ml-2'
          }`}>
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm leading-relaxed">{content}</p>
              <button
                onClick={() => setIsVisible(false)}
                className="text-gray-400 hover:text-gray-200 dark:text-gray-600 dark:hover:text-gray-800 flex-shrink-0"
                aria-label="닫기"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            
            {/* 화살표 */}
            <div className={`absolute w-2 h-2 bg-gray-900 dark:bg-gray-100 transform rotate-45 ${
              position === 'top' ? 'top-full -translate-y-1' :
              position === 'bottom' ? 'bottom-full translate-y-1' :
              position === 'left' ? 'left-full -translate-x-1' :
              'right-full translate-x-1'
            }`} />
          </div>
        </>
      )}
    </div>
  );
}
