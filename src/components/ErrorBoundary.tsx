import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/** Prevents a blank/green screen when a render crash happens on WebView. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Ezan Vakti Ultra render error', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div
        style={{
          minHeight: '100%',
          padding: '2rem 1.25rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          textAlign: 'center',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <p style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f2c14e', margin: 0 }}>
          Ezan Vakti Ultra
        </p>
        <p style={{ color: '#e8f0ea', margin: 0 }}>Uygulama açılırken bir sorun oluştu.</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          style={{
            background: '#f2c14e',
            color: '#04120e',
            border: 0,
            borderRadius: 12,
            padding: '0.85rem 1.2rem',
            fontWeight: 700,
          }}
        >
          Yeniden dene
        </button>
      </div>
    );
  }
}
