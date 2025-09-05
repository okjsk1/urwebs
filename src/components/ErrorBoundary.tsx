import React from "react";

export class ErrorBoundary extends React.Component<any, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(e: any) {
    console.warn("[UI ERROR]", e);
  }

  render() {
    return this.state.hasError ? null : this.props.children;
  }
}

