import React from 'react';
import { AlertTriangle, RefreshCw, Copy, Check } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, copied: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    if (typeof window !== 'undefined') {
      window.__LAST_APP_ERROR__ = {
        message: error?.message,
        stack: error?.stack,
        info: errorInfo?.componentStack
      };
    }
  }

  handleCopy = () => {
    const errText = `${this.state.error?.message}\n${this.state.error?.stack}`;
    navigator.clipboard.writeText(errText);
    this.setState({ copied: true });
    setTimeout(() => this.setState({ copied: false }), 2000);
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="mobile-card" style={{ 
          border: '1.5px solid var(--danger)', 
          background: 'rgba(244, 63, 94, 0.08)',
          margin: '16px',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger)' }}>
            <AlertTriangle size={20} />
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.95rem', margin: 0, fontWeight: 700 }}>
              Rendering Error Prevented
            </h3>
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--text-main)', lineHeight: 1.4, margin: 0 }}>
            An unexpected error occurred while displaying this section, but the app safely intercepted it:
          </p>

          <div style={{ 
            background: '#070B14', 
            border: '1px solid var(--border-color)', 
            borderRadius: '8px', 
            padding: '10px', 
            fontFamily: 'var(--font-mono)', 
            fontSize: '0.72rem', 
            color: '#F87171',
            maxHeight: '120px',
            overflowY: 'auto'
          }}>
            {this.state.error?.message || "Unknown rendering exception"}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className="send-btn" 
              style={{ flex: 1, height: '36px', fontSize: '0.78rem', gap: '6px' }}
              onClick={this.handleReset}
            >
              <RefreshCw size={14} />
              Reset & Try Again
            </button>
            <button 
              className="icon-btn" 
              style={{ width: '36px', height: '36px' }}
              onClick={this.handleCopy}
              title="Copy error details"
            >
              {this.state.copied ? <Check size={14} color="var(--success)" /> : <Copy size={14} />}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
