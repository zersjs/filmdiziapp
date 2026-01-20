import React from 'react';
import { FaExclamationTriangle, FaRedo } from 'react-icons/fa';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  };

  render() {
    if (this.state.hasError) {
      const { fallback: Fallback } = this.props;
      
      if (Fallback) {
        return (
          <Fallback 
            error={this.state.error}
            errorInfo={this.state.errorInfo}
            onRetry={this.handleRetry}
          />
        );
      }

      return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="mb-6">
              <FaExclamationTriangle className="text-6xl text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2">Bir Hata Oluştu</h1>
              <p className="text-gray-400 mb-4">
                Üzgünüz, beklenmeyen bir hata oluştu. Lütfen sayfayı yenilemeyi deneyin.
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={this.handleRetry}
                className="btn-primary flex items-center space-x-2 mx-auto"
              >
                <FaRedo />
                <span>Tekrar Dene</span>
              </button>

              <button
                onClick={() => window.location.reload()}
                className="btn-secondary flex items-center space-x-2 mx-auto"
              >
                <span>Sayfayı Yenile</span>
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-300">
                  Hata Detayları (Geliştirici)
                </summary>
                <div className="mt-2 p-4 bg-gray-900 rounded text-xs overflow-auto">
                  <div className="mb-2">
                    <strong>Hata:</strong>
                    <pre className="text-red-400 whitespace-pre-wrap">
                      {this.state.error && this.state.error.toString()}
                    </pre>
                  </div>
                  {this.state.errorInfo && (
                    <div>
                      <strong>Stack Trace:</strong>
                      <pre className="text-gray-400 whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export const withErrorBoundary = (Component, fallback) => {
  return function WrappedComponent(props) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
};

export const useErrorHandler = () => {
  const [error, setError] = React.useState(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback((error) => {
    setError(error);
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { captureError, resetError };
};

export default ErrorBoundary;
