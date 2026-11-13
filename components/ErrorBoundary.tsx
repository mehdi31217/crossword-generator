import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, info: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component — catches uncaught errors in the child tree
 * and displays a fallback UI instead of unmounting the entire app.
 *
 * Usage:
 *   <ErrorBoundary fallback={<MyFallback />}>
 *     <GameViews ... />
 *   </ErrorBoundary>
 */
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error.message, error.stack);
    console.error('[ErrorBoundary] Component stack:', info.componentStack);
    this.props.onError?.(error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '300px',
            padding: '40px 20px',
            textAlign: 'center',
            direction: 'rtl',
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <h2 style={{ marginBottom: '8px', color: '#e74c3c' }}>
            خطا در اجرا
          </h2>
          <p style={{ marginBottom: '24px', color: '#666', maxWidth: '400px' }}>
            مشکلی پیش آمده. لطفاً دوباره تلاش کنید.
          </p>
          <button
            onClick={this.handleRetry}
            style={{
              padding: '10px 24px',
              fontSize: '16px',
              backgroundColor: '#4a90d9',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            تلاش مجدد
          </button>
          <details style={{ marginTop: '16px', opacity: 0.5, fontSize: '12px' }}>
            <summary>جزئیات فنی</summary>
            <pre style={{ whiteSpace: 'pre-wrap', textAlign: 'left', direction: 'ltr' }}>
              {this.state.error?.message}
            </pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
