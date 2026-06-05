import t from './utils/i18n';
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/react'
import ErrorBoundary from './components/ErrorBoundary'
import './index.css'
import App from './App.jsx'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  console.warn("VITE_CLERK_PUBLISHABLE_KEY is not set in environment variables.")
  
  createRoot(document.getElementById('root')).render(
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', textAlign: 'center', background: '#fcf6fa', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h2 style={{ color: '#ff2e93', marginBottom: '1rem' }}>{t('audit.main.clerkConfigurationKeyMissing')}</h2>
      <p style={{ color: '#5d4d6d', maxWidth: '480px', lineHeight: 1.6, margin: '0 auto' }}>
        Please set the <strong>{t('audit.main.viteclerkpublishablekey')}</strong> environment variable in your local or production environment config to initialize authentication.
      </p>
    </div>
  );
} else {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <ErrorBoundary>
        <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
          <App />
        </ClerkProvider>
      </ErrorBoundary>
    </StrictMode>,
  );
}

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => console.log('ServiceWorker registered:', reg.scope))
      .catch((err) => console.error('ServiceWorker registration failed:', err));
  });
}
