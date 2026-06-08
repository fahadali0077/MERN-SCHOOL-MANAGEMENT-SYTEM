import React from 'react';

interface Props { children: React.ReactNode; }
interface State { hasError: boolean; error?: Error; }

// FIX: Top-level error boundary. Previously any render/chunk-load error unmounted the
// whole app to a blank white screen with no recovery. This catches it and shows a
// friendly fallback with a reload action.
export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary] Uncaught error:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-bg-primary flex items-center justify-center p-6">
          <div className="card p-8 max-w-md text-center">
            <div className="w-14 h-14 rounded-2xl bg-danger/10 flex items-center justify-center mx-auto mb-4">
              <span className="text-danger text-2xl">⚠</span>
            </div>
            <h1 className="font-display font-bold text-xl text-text-primary">Something went wrong</h1>
            <p className="text-text-secondary text-sm mt-2">
              An unexpected error occurred. You can try reloading the page.
            </p>
            {this.state.error?.message && (
              <p className="text-text-tertiary text-xs mt-3 font-mono break-words">
                {this.state.error.message}
              </p>
            )}
            <div className="flex gap-3 justify-center mt-6">
              <button onClick={this.handleReset} className="btn-secondary text-sm">Try again</button>
              <button onClick={() => window.location.assign('/')} className="btn-primary text-sm">Reload app</button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
