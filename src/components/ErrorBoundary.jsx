import React from 'react';
import t from '../utils/i18n';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-primary, #fcf6fa)',
          color: 'var(--text-primary, #1d1d1f)',
          fontFamily: 'var(--font-sans, "Outfit", sans-serif)',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 46, 147, 0.15)',
            borderRadius: '24px',
            padding: '3rem 2rem',
            maxWidth: '500px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.05)'
          }}>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: 800,
              background: 'var(--gradient-pink-purple, linear-gradient(135deg, #ff2e93 0%, #a200ff 100%))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '1rem'
            }}>
              Something went wrong
            </h1>
            <p style={{
              color: 'var(--text-secondary, #5d4d6d)',
              fontSize: '1rem',
              lineHeight: 1.6,
              marginBottom: '2rem'
            }}>
              We apologize for the inconvenience. An unexpected application error occurred.
            </p>
            <div style={{
              background: 'rgba(0, 0, 0, 0.03)',
              borderRadius: '12px',
              padding: '1rem',
              fontFamily: 'monospace',
              fontSize: '0.8rem',
              textAlign: 'left',
              overflowX: 'auto',
              marginBottom: '2rem',
              color: '#ff453a'
            }}>
              {this.state.error?.toString()}
            </div>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: 'var(--gradient-pink-purple, linear-gradient(135deg, #ff2e93 0%, #a200ff 100%))',
                color: '#fff',
                border: 'none',
                padding: '0.8rem 2rem',
                borderRadius: '100px',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                boxShadow: '0 8px 16px rgba(255, 46, 147, 0.25)',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
