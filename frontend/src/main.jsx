import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  handleReset = () => {
    localStorage.removeItem('matchify_session');
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '2rem',
            textAlign: 'center',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            background: '#0f172a',
            color: '#f8fafc',
          }}
        >
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🔥</div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>Matchify encontró un problema</h2>
          <p style={{ maxWidth: '520px', marginBottom: '1.5rem', color: '#94a3b8', fontSize: '0.95rem' }}>
            {this.state.error?.message || 'Ocurrió un error al cargar la aplicación.'}
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={this.handleReset}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                border: 'none',
                background: '#e11d48',
                color: 'white',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              🔄 Limpiar sesión y reiniciar
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                border: '1px solid #334155',
                background: '#1e293b',
                color: 'white',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Reintentar
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
