/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = ++idCounter;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = {
    success: (msg, dur) => addToast(msg, 'success', dur),
    error: (msg, dur) => addToast(msg, 'error', dur),
    info: (msg, dur) => addToast(msg, 'info', dur),
  };

  const iconMap = {
    success: <CheckCircle size={18} />,
    error: <AlertCircle size={18} />,
    info: <Info size={18} />,
  };

  const colorMap = {
    success: { bg: 'rgba(16,185,129,0.95)', border: 'rgba(16,185,129,0.3)' },
    error: { bg: 'rgba(239,68,68,0.95)', border: 'rgba(239,68,68,0.3)' },
    info: { bg: 'rgba(255,46,147,0.95)', border: 'rgba(255,46,147,0.3)' },
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* Toast Container */}
      <div style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.6rem',
        pointerEvents: 'none',
      }}>
        {toasts.map(t => {
          const colors = colorMap[t.type] || colorMap.info;
          return (
            <div
              key={t.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                background: colors.bg,
                border: `1px solid ${colors.border}`,
                color: '#fff',
                padding: '0.75rem 1.1rem',
                borderRadius: '12px',
                fontSize: '0.88rem',
                fontWeight: 600,
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                backdropFilter: 'blur(8px)',
                animation: 'slideUp 0.3s cubic-bezier(0.16,1,0.3,1) forwards',
                pointerEvents: 'all',
                maxWidth: '320px',
                fontFamily: 'var(--font-body)',
              }}
            >
              {iconMap[t.type]}
              <span style={{ flex: 1 }}>{t.message}</span>
              <button
                onClick={() => removeToast(t.id)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(255,255,255,0.8)',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  flexShrink: 0,
                }}
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
