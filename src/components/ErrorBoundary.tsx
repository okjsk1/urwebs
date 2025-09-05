import React from "react";

interface ErrorBoundaryProps {
  fallback?: React.ReactNode;
  children?: React.ReactNode;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(e: any) {
    console.warn("[UI ERROR]", e);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="p-4 text-center" role="alert">
            문제가 발생했습니다. 페이지를 새로고침해주세요.
          </div>
        )
      );
    }
    return this.props.children;
  }
}

