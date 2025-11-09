import React, {
  Component,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';

type LazyStrategy = 'visible' | 'idle' | 'visible-or-idle';

interface LazyWidgetBaseProps {
  fallback?: ReactNode;
  threshold?: number | number[];
  rootMargin?: string;
  className?: string;
  once?: boolean;
  strategy?: LazyStrategy;
  onVisible?: () => void;
}

export type LazyWidgetProps = React.PropsWithChildren<LazyWidgetBaseProps>;

const DEFAULT_FALLBACK = (
  <div
    role="status"
    aria-busy="true"
    aria-live="polite"
    className="rounded-2xl h-48 bg-gray-200 dark:bg-gray-700/70 motion-safe:animate-pulse motion-reduce:animate-none"
  />
);

export function LazyWidget({
  children,
  fallback = DEFAULT_FALLBACK,
  threshold = 0.1,
  rootMargin = '50px',
  className = '',
  once = true,
  strategy = 'visible',
  onVisible
}: LazyWidgetProps) {
  const [visible, setVisible] = useState(false);
  const [hasEverVisible, setHasEverVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const idleHandle = useRef<number | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const unmounted = useRef(false);

  useEffect(() => {
    return () => {
      unmounted.current = true;
      if (typeof window !== 'undefined') {
        const win = window as any;
        if (idleHandle.current !== null) {
          if (typeof win.cancelIdleCallback === 'function') {
            win.cancelIdleCallback(idleHandle.current);
          } else {
            window.clearTimeout(idleHandle.current);
          }
        }
      }
      observerRef.current?.disconnect();
      observerRef.current = null;
    };
  }, []);

  const makeVisible = useCallback(() => {
    if (unmounted.current) return;
    setVisible(true);
    setHasEverVisible(true);
    onVisible?.();
  }, [onVisible]);

  const makeHidden = useCallback(() => {
    if (unmounted.current) return;
    setVisible(false);
  }, []);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    if (typeof window === 'undefined') {
      makeVisible();
      return;
    }

    const win = window as any;

    const startIdle = () => {
      if (idleHandle.current !== null) return;
      const handler = () => {
        idleHandle.current = null;
        makeVisible();
      };
      if (typeof win.requestIdleCallback === 'function') {
        idleHandle.current = win.requestIdleCallback(handler);
      } else {
        idleHandle.current = window.setTimeout(handler, 1);
      }
    };

    const cancelIdle = () => {
      if (idleHandle.current === null) return;
      if (typeof win.cancelIdleCallback === 'function') {
        win.cancelIdleCallback(idleHandle.current);
      } else {
        window.clearTimeout(idleHandle.current);
      }
      idleHandle.current = null;
    };

    const shouldObserve = strategy === 'visible' || strategy === 'visible-or-idle';
    const shouldIdle = strategy === 'idle' || strategy === 'visible-or-idle';

    if (shouldIdle) {
      startIdle();
    }

    if (!shouldObserve) {
      // Idle 전략만 사용하는 경우
      return () => cancelIdle();
    }

    if (typeof IntersectionObserver === 'undefined') {
      cancelIdle();
      makeVisible();
      return;
    }

    observerRef.current?.disconnect();
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;

        const isVisible = entry.isIntersecting || entry.intersectionRatio > 0;
        if (isVisible) {
          makeVisible();
          if (shouldIdle) cancelIdle();
          if (once) {
            observer.unobserve(node);
          }
        } else if (!once) {
          makeHidden();
        }
      },
      {
        threshold,
        rootMargin
      }
    );

    observer.observe(node);
    observerRef.current = observer;

    return () => {
      observer.disconnect();
      if (shouldIdle) {
        cancelIdle();
      }
    };
  }, [threshold, rootMargin, once, strategy, makeVisible, makeHidden]);

  const fallbackNode = useMemo(() => {
    if (!React.isValidElement(fallback)) return fallback;
    const props: Record<string, unknown> = {
      'aria-busy': (fallback.props as any)?.['aria-busy'] ?? true
    };
    if ((fallback.props as any)?.role == null) {
      props.role = 'status';
    }
    if ((fallback.props as any)?.['aria-live'] == null) {
      props['aria-live'] = 'polite';
    }
    return React.cloneElement(fallback, props);
  }, [fallback]);

  const shouldRenderContent = once ? hasEverVisible : visible;

  return (
    <div
      ref={containerRef}
      className={mergeClassNames(className)}
      aria-busy={!shouldRenderContent}
    >
      {shouldRenderContent ? children : fallbackNode}
    </div>
  );
}

export interface WidgetContainerProps {
  children: ReactNode;
  className?: string;
}

export function WidgetContainer({ children, className = '' }: WidgetContainerProps) {
  return <div className={mergeClassNames('widget-container', className)}>{children}</div>;
}

export interface WidgetGridProps {
  children: ReactNode;
  columns?: number;
  gap?: number;
  minColWidth?: number;
  className?: string;
}

export function WidgetGrid({
  children,
  columns = 4,
  gap = 16,
  minColWidth,
  className = ''
}: WidgetGridProps) {
  const style: React.CSSProperties = {
    gap,
    gridTemplateColumns: minColWidth
      ? `repeat(auto-fit, minmax(${minColWidth}px, 1fr))`
      : `repeat(${columns}, minmax(0, 1fr))`
  };

  return (
    <div className={mergeClassNames('grid', className)} style={style}>
      {children}
    </div>
  );
}

type WidgetLoaderType = 'default' | 'timer' | 'news' | 'dday';

export function WidgetLoader({ type = 'default' }: { type?: WidgetLoaderType }) {
  const baseClass =
    'rounded-2xl h-48 bg-gray-200 dark:bg-gray-700/70 motion-safe:animate-pulse motion-reduce:animate-none';

  const body = useMemo(() => {
    const decorative = (className: string) => (
      <div aria-hidden="true" className={className} />
    );

    switch (type) {
      case 'timer':
        return (
          <div className="p-3 flex flex-col items-center justify-center gap-4" aria-hidden="true">
            {decorative('h-12 bg-gray-300 dark:bg-gray-600 rounded w-32')}
            <div className="flex gap-2">
              {decorative('h-8 bg-gray-300 dark:bg-gray-600 rounded w-16')}
              {decorative('h-8 bg-gray-300 dark:bg-gray-600 rounded w-16')}
            </div>
          </div>
        );
      case 'news':
        return (
          <div className="p-3 space-y-2" aria-hidden="true">
            {decorative('h-4 bg-gray-300 dark:bg-gray-600 rounded w-full')}
            {decorative('h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4')}
            {decorative('h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2')}
          </div>
        );
      case 'dday':
        return (
          <div className="p-3 space-y-2" aria-hidden="true">
            {decorative('h-6 bg-gray-300 dark:bg-gray-600 rounded w-20')}
            {decorative('h-4 bg-gray-300 dark:bg-gray-600 rounded w-full')}
            {decorative('h-4 bg-gray-300 dark:bg-gray-600 rounded w-2/3')}
          </div>
        );
      default:
        return (
          <div className="p-3 space-y-2" aria-hidden="true">
            {decorative('h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4')}
            {decorative('h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2')}
            {decorative('h-8 bg-gray-300 dark:bg-gray-600 rounded w-full')}
          </div>
        );
    }
  }, [type]);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={mergeClassNames(baseClass)}
    >
      <div
        aria-hidden="true"
        className="h-10 bg-gray-300 dark:bg-gray-600 rounded-t-2xl"
      />
      {body}
    </div>
  );
}

type WidgetErrorBoundaryProps = React.PropsWithChildren<{
  fallback?: ReactNode;
  resetKeys?: any[];
  onError?: (error: Error, info: React.ErrorInfo) => void;
}>;

interface WidgetErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  info?: React.ErrorInfo;
  showDetails: boolean;
  internalKey: number;
}

export class WidgetErrorBoundary extends Component<
  WidgetErrorBoundaryProps,
  WidgetErrorBoundaryState
> {
  declare props: WidgetErrorBoundaryProps;
  declare state: WidgetErrorBoundaryState;
  declare setState: Component<WidgetErrorBoundaryProps, WidgetErrorBoundaryState>['setState'];

  constructor(props: WidgetErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: undefined,
      info: undefined,
      showDetails: false,
      internalKey: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<WidgetErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    this.setState({ info });
    this.props.onError?.(error, info);

    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'exception', {
        description: error.message,
        fatal: false
      });
    }

    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error('Widget Error:', error, info);
    }
  }

  componentDidUpdate(prevProps: Readonly<WidgetErrorBoundaryProps>) {
    const { resetKeys = [] } = this.props;
    const prevResetKeys = prevProps.resetKeys ?? [];

    if (!shallowArrayEqual(resetKeys, prevResetKeys)) {
      if (this.state.hasError) {
        this.resetErrorState();
      } else {
        this.setState((state) => ({ internalKey: state.internalKey + 1 }));
      }
    }
  }

  private resetErrorState = () => {
    this.setState((state) => ({
      hasError: false,
      error: undefined,
      info: undefined,
      showDetails: false,
      internalKey: state.internalKey + 1
    }));
  };

  private toggleDetails = () => {
    this.setState((state) => ({ showDetails: !state.showDetails }));
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isDev = process.env.NODE_ENV !== 'production';

      return (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-center text-sm text-red-600 dark:border-red-800/50 dark:bg-red-900/20 dark:text-red-200">
          <div className="font-medium mb-2">위젯을 불러올 수 없습니다</div>
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={this.resetErrorState}
              className="text-xs font-semibold underline underline-offset-2 hover:text-red-700 dark:hover:text-red-100"
            >
              다시 시도
            </button>
            {isDev && this.state.error && (
              <button
                type="button"
                onClick={this.toggleDetails}
                className="text-xs underline underline-offset-2 hover:text-red-700 dark:hover:text-red-100"
              >
                {this.state.showDetails ? '상세 닫기' : '상세 보기'}
              </button>
            )}
          </div>
          {isDev && this.state.showDetails && this.state.error && (
            <pre className="mt-3 max-h-48 overflow-auto rounded bg-red-100/70 p-3 text-left text-xs leading-5 text-red-700 dark:bg-red-900/40 dark:text-red-200">
              {this.state.error.stack}
              {this.state.info?.componentStack}
            </pre>
          )}
        </div>
      );
    }

    return <React.Fragment key={this.state.internalKey}>{this.props.children}</React.Fragment>;
  }
}

export type WidgetWrapperProps = React.PropsWithChildren<{
  lazy?: boolean;
  lazyStrategy?: LazyStrategy;
  errorFallback?: ReactNode;
  className?: string;
  resetKeys?: any[];
  onError?: (error: Error, info: React.ErrorInfo) => void;
  fallback?: ReactNode;
}>;

export function WidgetWrapper({
  children,
  lazy = true,
  lazyStrategy = 'visible',
  errorFallback,
  className = '',
  resetKeys,
  onError,
  fallback
}: WidgetWrapperProps) {
  const content = (
    <WidgetErrorBoundary fallback={errorFallback} resetKeys={resetKeys} onError={onError}>
      {children}
    </WidgetErrorBoundary>
  );

  if (!lazy) {
    return <div className={mergeClassNames(className)}>{content}</div>;
  }

  return (
    <LazyWidget className={className} strategy={lazyStrategy} fallback={fallback}>
      {content}
    </LazyWidget>
  );
}

function mergeClassNames(...values: Array<string | undefined | null | false>): string {
  return values
    .filter((value) => typeof value === 'string' && value.trim().length > 0)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function shallowArrayEqual(a: any[], b: any[]) {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}
