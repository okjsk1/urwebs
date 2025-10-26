import React, { useEffect, useRef, useState, ReactNode } from 'react';

export interface LazyWidgetProps {
  children: ReactNode;
  fallback?: ReactNode;
  threshold?: number;
  rootMargin?: string;
  className?: string;
}

export function LazyWidget({
  children,
  fallback = <div className="animate-pulse bg-gray-200 rounded-2xl h-48" />,
  threshold = 0.1,
  rootMargin = '50px',
  className = ''
}: LazyWidgetProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          setHasBeenVisible(true);
          // 한 번 보이면 관찰 중단
          observer.unobserve(element);
        }
      },
      {
        threshold,
        rootMargin
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold, rootMargin]);

  return (
    <div ref={elementRef} className={className}>
      {hasBeenVisible ? children : fallback}
    </div>
  );
}

// 위젯 컨테이너 컴포넌트
export interface WidgetContainerProps {
  children: ReactNode;
  className?: string;
}

export function WidgetContainer({ children, className = '' }: WidgetContainerProps) {
  return (
    <div className={`widget-container ${className}`}>
      {children}
    </div>
  );
}

// 위젯 그리드 컴포넌트
export interface WidgetGridProps {
  children: ReactNode;
  columns?: number;
  gap?: number;
  className?: string;
}

export function WidgetGrid({ 
  children, 
  columns = 4, 
  gap = 4, 
  className = '' 
}: WidgetGridProps) {
  return (
    <div 
      className={`grid gap-${gap} ${className}`}
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`
      }}
    >
      {children}
    </div>
  );
}

// 위젯 로더 컴포넌트
export function WidgetLoader({ type = 'default' }: { type?: string }) {
  const loaders = {
    default: (
      <div className="animate-pulse bg-gray-200 rounded-2xl h-48">
        <div className="h-10 bg-gray-300 rounded-t-2xl"></div>
        <div className="p-3 space-y-2">
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          <div className="h-8 bg-gray-300 rounded w-full"></div>
        </div>
      </div>
    ),
    timer: (
      <div className="animate-pulse bg-gray-200 rounded-2xl h-48">
        <div className="h-10 bg-gray-300 rounded-t-2xl"></div>
        <div className="p-3 flex flex-col items-center justify-center">
          <div className="h-12 bg-gray-300 rounded w-32 mb-4"></div>
          <div className="flex gap-2">
            <div className="h-8 bg-gray-300 rounded w-16"></div>
            <div className="h-8 bg-gray-300 rounded w-16"></div>
          </div>
        </div>
      </div>
    ),
    news: (
      <div className="animate-pulse bg-gray-200 rounded-2xl h-48">
        <div className="h-10 bg-gray-300 rounded-t-2xl"></div>
        <div className="p-3 space-y-2">
          <div className="h-4 bg-gray-300 rounded w-full"></div>
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
    ),
    dday: (
      <div className="animate-pulse bg-gray-200 rounded-2xl h-48">
        <div className="h-10 bg-gray-300 rounded-t-2xl"></div>
        <div className="p-3 space-y-2">
          <div className="h-6 bg-gray-300 rounded w-20"></div>
          <div className="h-4 bg-gray-300 rounded w-full"></div>
          <div className="h-4 bg-gray-300 rounded w-2/3"></div>
        </div>
      </div>
    )
  };

  return loaders[type as keyof typeof loaders] || loaders.default;
}

// 위젯 에러 바운더리
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class WidgetErrorBoundary extends React.Component<
  { children: ReactNode; fallback?: ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Widget Error:', error, errorInfo);
    // 에러 로깅
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'exception', {
        description: error.message,
        fatal: false
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="rounded-2xl border bg-red-50 p-4 text-center">
          <div className="text-red-600 text-sm font-medium mb-2">
            위젯을 불러올 수 없습니다
          </div>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="text-red-500 text-xs hover:text-red-700"
          >
            다시 시도
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// 위젯 래퍼 컴포넌트
export interface WidgetWrapperProps {
  children: ReactNode;
  lazy?: boolean;
  errorFallback?: ReactNode;
  className?: string;
}

export function WidgetWrapper({
  children,
  lazy = true,
  errorFallback,
  className = ''
}: WidgetWrapperProps) {
  const content = (
    <WidgetErrorBoundary fallback={errorFallback}>
      {children}
    </WidgetErrorBoundary>
  );

  if (lazy) {
    return (
      <LazyWidget className={className}>
        {content}
      </LazyWidget>
    );
  }

  return <div className={className}>{content}</div>;
}
