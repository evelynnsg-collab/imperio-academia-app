import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    console.error('Erro capturado:', error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight: '100vh', background: '#0A0A0A', color: '#fff', padding: 20, fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          <h2 style={{ color: '#FF5555' }}>⚠️ Erro no app</h2>
          <p style={{ fontSize: 13, marginBottom: 16 }}>{this.state.error.message}</p>
          <pre style={{ fontSize: 11, opacity: 0.7 }}>{this.state.error.stack}</pre>
          <button onClick={() => this.setState({ error: null })} style={{ marginTop: 20, background: '#F2C200', border: 'none', borderRadius: 8, padding: '10px 16px', fontWeight: 700 }}>
            Tentar novamente
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
)
