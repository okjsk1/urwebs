import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  iconEmoji?: string;
  title: string;
  description?: string;
  ctaText?: string;
  onCta?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  iconEmoji,
  title,
  description,
  ctaText,
  onCta,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      {Icon && (
        <Icon className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-4" />
      )}
      {iconEmoji && !Icon && (
        <div className="text-4xl mb-4">{iconEmoji}</div>
      )}
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 max-w-xs">
          {description}
        </p>
      )}
      {ctaText && onCta && (
        <button
          onClick={onCta}
          className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
          aria-label={ctaText}
        >
          {ctaText}
        </button>
      )}
    </div>
  );
}









