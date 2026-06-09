import t from '../utils/i18n';
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { SignIn, SignUp } from '@clerk/react';

export default function AuthModal({ onClose }) {
  const [activeTab, setActiveTab] = useState('login');

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          background: 'var(--bg-card, #fff)',
          borderRadius: 'var(--radius-lg, 20px)',
          padding: '1.5rem 1.5rem 1rem',
          maxWidth: '420px',
          width: '90vw',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 24px 80px rgba(255,46,147,0.18)',
        }}
      >
        {/* Close button */}
        <button
          className="modal-close-btn"
          onClick={onClose}
          style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 10 }}
        >
          <X size={20} />
        </button>

        {/* Tabs */}
        <div className="auth-tabs" style={{ marginBottom: '1.25rem' }}>
          <div
            className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => handleTabChange('login')}
          >
            {t('audit.authmodal.login', 'Sign In')}
          </div>
          <div
            className={`auth-tab ${activeTab === 'signup' ? 'active' : ''}`}
            onClick={() => handleTabChange('signup')}
          >
            {t('audit.authmodal.signUp', 'Sign Up')}
          </div>
        </div>

        {/* Clerk's official components — handle Turnstile, email verification, OAuth automatically */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          {activeTab === 'login' ? (
            <SignIn
              afterSignInUrl="/"
              signUpUrl="#"
              appearance={{
                variables: {
                  colorPrimary: '#ff2e93',
                  colorBackground: 'transparent',
                  borderRadius: '12px',
                },
                elements: {
                  card: {
                    boxShadow: 'none',
                    border: 'none',
                    padding: '0',
                    background: 'transparent',
                  },
                  headerTitle: { display: 'none' },
                  headerSubtitle: { display: 'none' },
                  footer: { display: 'none' },
                  socialButtonsBlockButton: {
                    border: '1px solid rgba(0,0,0,0.12)',
                    borderRadius: '10px',
                  },
                },
              }}
              routing="hash"
            />
          ) : (
            <SignUp
              afterSignUpUrl="/"
              signInUrl="#"
              appearance={{
                variables: {
                  colorPrimary: '#ff2e93',
                  colorBackground: 'transparent',
                  borderRadius: '12px',
                },
                elements: {
                  card: {
                    boxShadow: 'none',
                    border: 'none',
                    padding: '0',
                    background: 'transparent',
                  },
                  headerTitle: { display: 'none' },
                  headerSubtitle: { display: 'none' },
                  footer: { display: 'none' },
                  socialButtonsBlockButton: {
                    border: '1px solid rgba(0,0,0,0.12)',
                    borderRadius: '10px',
                  },
                },
              }}
              routing="hash"
            />
          )}
        </div>

        {/* Bottom link to switch tabs */}
        <div style={{ marginTop: '0.75rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {activeTab === 'login' ? (
            <span>
              {t('auth.noAccount', "Don't have an account?")}{' '}
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); handleTabChange('signup'); }}
                style={{ color: 'var(--color-pink-primary)', textDecoration: 'none', fontWeight: 600 }}
              >
                {t('audit.authmodal.signUpFree', 'Sign up free')}
              </a>
            </span>
          ) : (
            <span>
              {t('auth.alreadyHaveAccount', 'Already have an account?')}{' '}
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); handleTabChange('login'); }}
                style={{ color: 'var(--color-pink-primary)', textDecoration: 'none', fontWeight: 600 }}
              >
                {t('audit.authmodal.signIn', 'Sign In')}
              </a>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
