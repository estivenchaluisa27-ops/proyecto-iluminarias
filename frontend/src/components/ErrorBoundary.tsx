import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: '#111827',
          color: '#F3F4F6',
          fontFamily: "'IBM Plex Sans', 'Roboto', 'Segoe UI', system-ui, sans-serif",
          padding: '2rem',
          gap: '1rem',
        }}>
          <div style={{
            fontSize: '2rem',
            fontWeight: 600,
            color: '#DC2626',
          }}>
            Error inesperado
          </div>
          <div style={{
            fontSize: '0.875rem',
            color: '#9CA3AF',
            maxWidth: '500px',
            textAlign: 'center',
            lineHeight: 1.6,
          }}>
            {this.state.error?.message || 'Ha ocurrido un error en la aplicación.'}
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1.5rem',
              background: '#3B82F6',
              border: 'none',
              borderRadius: '4px',
              color: '#fff',
              fontWeight: 500,
              fontSize: '0.875rem',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Recargar página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
