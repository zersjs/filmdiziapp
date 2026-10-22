import React from 'react';
import { FaExclamationTriangle, FaRedo } from 'react-icons/fa';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary:', error, errorInfo);
  }

  componentDidUpdate(prevProps) {
    // Rota değişince hatayı sıfırla; kullanıcı başka sayfaya geçebilsin.
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
        <div className="max-w-md text-center">
          <div className="empty-state-icon mx-auto">
            <FaExclamationTriangle />
          </div>
          <h1 className="text-xl font-bold">Bir şeyler ters gitti</h1>
          <p className="mt-2 text-sm leading-relaxed text-white/50">
            Bu sayfa yüklenirken beklenmeyen bir hata oluştu. Tekrar deneyebilir veya ana sayfaya dönebilirsiniz.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-2 xs:flex-row">
            <button type="button" onClick={() => this.setState({ error: null })} className="btn btn-primary">
              <FaRedo className="text-xs" /> Tekrar dene
            </button>
            <a href="/" className="btn btn-secondary">Ana sayfa</a>
          </div>
          {import.meta.env.DEV && (
            <pre className="mt-6 max-h-48 overflow-auto rounded-lg bg-white/5 p-3 text-left text-xs text-red-300">
              {String(error?.stack || error)}
            </pre>
          )}
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
