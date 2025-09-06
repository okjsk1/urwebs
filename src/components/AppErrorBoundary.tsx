import React from "react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

export class AppErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, info: any) {
    console.error(error, info);
  }

  render() {
    if (this.state.hasError) {
      return <div>문제가 발생했습니다.</div>;
    }
    return this.props.children;
  }
}

export default AppErrorBoundary;
