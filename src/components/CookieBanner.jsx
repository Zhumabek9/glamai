import t from '../utils/i18n';
import React, { useState, useEffect } from 'react';
import { Shield, X, Check } from 'lucide-react';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check if consent has already been given
    const consent = localStorage.getItem('glamai_cookie_consent');
    if (!consent) {
      // Small delay before showing for smooth entrance transition
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('glamai_cookie_consent', 'accepted');
    setVisible(false);
  };

  const handleAcceptEssential = () => {
    localStorage.setItem('glamai_cookie_consent', 'essential-only');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div 
      className="glass-panel cookie-banner"
      style={{
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
      }}
    >
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        <div 
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'rgba(255, 46, 147, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-pink-primary)',
            flexShrink: 0,
          }}
        >
          <Shield size={20} />
        </div>
        <div style={{ flex: 1 }}>
          <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', fontWeight: 800, margin: '0 0 0.35rem 0', color: 'var(--text-primary)' }}>
            Cookie Consent & Privacy (GDPR / CCPA)
          </h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
            We use essential cookies to manage your session and secure payments. We also use analytics cookies to improve our virtual beauty experience. By clicking "Accept All", you agree to our use of cookies for all these purposes. You can choose to allow essential cookies only.
          </p>
        </div>
        <button 
          onClick={handleAcceptEssential}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '4px',
            display: 'inline-flex',
          }}
          aria-label={t('audit.cookiebanner.closeCookieBanner')}
        >
          <X size={16} />
        </button>
      </div>

      <div 
        style={{ 
          display: 'flex', 
          gap: '0.75rem', 
          justifyContent: 'flex-end',
          flexWrap: 'wrap',
          borderTop: '1px solid rgba(0, 0, 0, 0.04)',
          paddingTop: '1rem'
        }}
      >
        <button 
          onClick={handleAcceptEssential}
          className="btn btn-secondary"
          style={{ 
            padding: '0.5rem 1.25rem', 
            fontSize: '0.82rem',
            borderRadius: '10px'
          }}
        >
          Essential Only
        </button>
        <button 
          onClick={handleAcceptAll}
          className="btn btn-primary"
          style={{ 
            padding: '0.5rem 1.25rem', 
            fontSize: '0.82rem',
            borderRadius: '10px'
          }}
        >
          <Check size={14} />
          <span>{t('audit.cookiebanner.acceptAll')}</span>
        </button>
      </div>
    </div>
  );
}
