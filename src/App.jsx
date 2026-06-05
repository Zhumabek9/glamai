import React, { useState, useEffect, useRef, lazy, Suspense, useMemo, useCallback } from 'react';
import { useAuth, useUser, useClerk } from '@clerk/react';
import { authFetch } from './apiClient';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import PaymentModal from './components/PaymentModal';
import { ToastProvider } from './components/Toast';
import CookieBanner from './components/CookieBanner';
import { getLanguage, setLanguage } from './utils/i18n';

// Lazy loaded components for code splitting & better LCP
const Playground = lazy(() => import('./components/Playground'));
const Makeup = lazy(() => import('./components/Makeup'));
const Nails = lazy(() => import('./components/Nails'));
const TrendingFeed = lazy(() => import('./components/TrendingFeed'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const Settings = lazy(() => import('./components/Settings'));
const Pricing = lazy(() => import('./components/Pricing'));
const History = lazy(() => import('./components/History'));
const Blog = lazy(() => import('./components/Blog'));
const PrivacyPolicy = lazy(() => import('./components/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./components/TermsOfService'));
const Favorites = lazy(() => import('./components/Favorites'));
const FaceAnalysis = lazy(() => import('./components/FaceAnalysis'));

export default function App() {
  const { isLoaded, userId, getToken } = useAuth();
  const { user: clerkUser } = useUser();
  const { signOut, openSignIn } = useClerk();

  const getTabFromPath = (path) => {
    if (path.startsWith('/blog/')) return 'blog';
    const cleanPath = path.replace(/^\//, '');
    if (!cleanPath) return 'playground';
    const validTabs = [
      'playground', 'makeup', 'nails', 'scanner',
      'trending', 'dashboard', 'settings', 
      'pricing', 'blog', 'privacy', 'terms', 'history', 'favorites'
    ];
    return validTabs.includes(cleanPath) ? cleanPath : 'playground';
  };

  const [activeTab, setActiveTab] = useState(() => getTabFromPath(window.location.pathname));
  const [styleContext, setStyleContext] = useState(null);
  const [user, setUser] = useState(null);
  const [guestTokens, setGuestTokens] = useState(10);
  const [history, setHistory] = useState([]);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [stripeEnabled, setStripeEnabled] = useState(false);
  const [allowMockPayment, setAllowMockPayment] = useState(true);

  const handleOpenAuth = useCallback(() => {
    if (openSignIn) {
      openSignIn({
        appearance: {
          variables: {
            colorPrimary: '#ff2e93',
          }
        }
      });
    } else {
      setIsAuthOpen(true);
    }
  }, [openSignIn]);

  const navigateToTab = useCallback((tab) => {
    setActiveTab(tab);
    const path = tab === 'playground' ? '/' : `/${tab}`;
    window.history.pushState(null, '', path);
    
    const titles = {
      playground: 'GlamAI — AI Hairstyle Changer & Virtual Hair Styler Online',
      makeup: 'GlamAI — AI Makeup Salon & Virtual Try-On Online',
      nails: 'GlamAI — AI Nails Studio & Virtual Nail Art Try-On',
      trending: 'GlamAI — Trending Beauty Feed & Transformations',
      pricing: 'GlamAI Pricing — Simple & Transparent Plans',
      blog: 'GlamAI Magazine — Hairstyle Tips, Trends & Expert Advice',
      dashboard: 'GlamAI — User Dashboard',
      settings: 'GlamAI — Settings',
      privacy: 'GlamAI — Privacy Policy',
      terms: 'GlamAI — Terms of Service',
      history: 'GlamAI — My Style History',
      scanner: 'GlamAI — AI Face Scanner & Beauty Analysis'
    };
    document.title = titles[tab] || 'GlamAI — AI Hairstyle Changer';
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      const tab = getTabFromPath(window.location.pathname);
      setActiveTab(tab);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const playgroundRef = useRef(null);

  // Scroll to top on tab change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  // 1. Load config and Stripe state on mount
  useEffect(() => {
    // Load Stripe config
    authFetch('/api/config')
      .then(res => res.json())
      .then(config => {
        setStripeEnabled(config.stripeEnabled);
        setAllowMockPayment(config.allowMockPayment ?? true);
        if (config.guestTokensRemaining !== undefined) {
          setGuestTokens(config.guestTokensRemaining);
        }
        
        // Auto-detect language by IP country if not set manually by the user
        if (config.country && !localStorage.getItem('glamai_language')) {
          const country = config.country.toUpperCase();
          const countryToLang = {
            'RU': 'ru', 'BY': 'ru', 'KZ': 'ru', 'UA': 'ru', 'UZ': 'ru', 'KG': 'ru', 'AM': 'ru',
            'ES': 'es', 'MX': 'es', 'AR': 'es', 'CO': 'es', 'CL': 'es', 'PE': 'es', 'VE': 'es',
            'FR': 'fr', 'BE': 'fr', 'CH': 'fr', 'CA': 'fr', 'LU': 'fr',
            'DE': 'de', 'AT': 'de', 'LI': 'de'
          };
          const detectedLang = countryToLang[country];
          if (detectedLang) {
            if (getLanguage() !== detectedLang) {
              setLanguage(detectedLang);
              window.location.reload();
            }
          }
        }
      })
      .catch(err => console.warn('Failed to load public config:', err));

    // Handle return from Stripe Checkout
    const params = new URLSearchParams(window.location.search);
    if (params.get('paid') === '1' || params.get('cancel') === '1') {
      setActiveTab('pricing');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // 1b. Clerk auth syncing listener
  useEffect(() => {
    if (!isLoaded) return;

    const syncClerkUser = async () => {
      if (!userId || !clerkUser) {
        setUser(null);
        return;
      }
      try {
        const idToken = await getToken();
        if (!idToken) {
          setUser(null);
          return;
        }
        const email = clerkUser.primaryEmailAddress?.emailAddress || "";
        const res = await authFetch('/api/auth/clerk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken, email }),
        });
        if (res.ok) {
          const data = await res.json();
          const activeUser = { 
            id: data.user.id, 
            email: data.user.email, 
            tokens: data.user.credits,
            referralCode: data.user.referralCode,
            subscriptionTier: data.user.subscriptionTier || 'free',
            subscriptionStatus: data.user.subscriptionStatus || 'inactive',
            role: data.user.role || 'user'
          };
          setUser(activeUser);
          loadHistory(activeUser.email);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Clerk sync error:', err);
        setUser(null);
      }
    };

    syncClerkUser();
  }, [isLoaded, userId, clerkUser]);

  // 2. Load History for specific user
  const loadHistory = useCallback(async (email) => {
    // 1. Try fetching from server first if authenticated
    try {
      const res = await authFetch('/api/user/history?type=all');
      if (res.ok) {
        const data = await res.json();
        if (data.history) {
          const mapped = data.history.map(row => ({
            id: row.id,
            style: row.task_type === 'hairstyle' ? (row.style || 'Custom style') : (row.makeup || row.nails || 'Custom Look'),
            color: row.color || 'Default',
            result: row.result_url,
            original: null,
            date: new Date(row.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
            task_type: row.task_type
          }));
          setHistory(mapped);
          return;
        }
      }
    } catch (err) {
      console.warn("Failed to fetch history from server, falling back to local:", err);
    }

    // 2. Fallback to localStorage
    const key = `glamai_history_${email.toLowerCase()}`;
    try {
      const raw = localStorage.getItem(key);
      if (!raw) { setHistory([]); return; }
      const parsed = JSON.parse(raw);
      // Sanitize: strip base64 originals and keep max 15
      const sanitized = parsed
        .filter(item => item)
        .slice(0, 15)
        .map(item => ({ ...item, original: null }));

      setHistory(sanitized);
      localStorage.setItem(key, JSON.stringify(sanitized));
    } catch (_) {
      setHistory([]);
    }
  }, []);

  // 3. User Authentication
  const handleAuthSuccess = useCallback((backendUser) => {
    const activeUser = {
      id: backendUser.id,
      email: backendUser.email,
      tokens: backendUser.credits,
      referralCode: backendUser.referralCode,
      subscriptionTier: backendUser.subscriptionTier || 'free',
      subscriptionStatus: backendUser.subscriptionStatus || 'inactive',
      role: backendUser.role || 'user'
    };
    setUser(activeUser);
    setGuestTokens(10); // reset guest tokens on login
    loadHistory(activeUser.email);
  }, [loadHistory]);

  const handleLogout = useCallback(async () => {
    try {
      await signOut();
      await authFetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    } catch (err) {
      console.error('Logout error:', err);
    }
    setUser(null);
    setHistory([]);
    setActiveTab('playground');
  }, [signOut]);

  // 4. Token deduction (syncs state; actual deduction happens during /api/generate)
  const handleDeductToken = useCallback((count = 1) => {
    if (!user) return;
    setUser(prev => prev ? { ...prev, tokens: Math.max(0, prev.tokens - count) } : null);
  }, [user]);

  // 4b. Guest token deduction
  const handleGuestDeductToken = useCallback((count = 10) => {
    setGuestTokens(prev => Math.max(0, prev - count));
  }, []);

  // Effective user object passed to components (real user or guest with tokens)
  const effectiveUser = useMemo(() => user || { 
    isGuest: true, 
    tokens: guestTokens, 
    email: 'guest',
    subscriptionTier: 'free',
    subscriptionStatus: 'inactive'
  }, [user, guestTokens]);

  // 5. Payment completed (syncs state; actual increment happens via Stripe webhook/backend)
  const handlePaymentSuccess = useCallback((newTokens) => {
    if (!user) return;
    setUser(prev => prev ? { ...prev, tokens: newTokens } : null);
  }, [user]);

  const handleSelectPlan = (plan) => {
    if (stripeEnabled) {
      authFetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pack: plan.id })
      })
      .then(res => {
        if (!res.ok) {
          return res.json().then(err => { throw new Error(err.message || 'Checkout failed') });
        }
        return res.json();
      })
      .then(data => {
        if (data.url) {
          window.location.href = data.url;
        } else {
          throw new Error('Checkout url not found');
        }
      })
      .catch(err => {
        console.error("Stripe checkout failed, falling back to mock payment:", err);
        setSelectedPlan(plan);
      });
    } else {
      setSelectedPlan(plan);
    }
  };

  // 6. Adding & Deleting History
  const handleAddHistory = useCallback((newItem) => {
    if (!user) return;
    setHistory(prev => {
      // Strip base64 original image — only keep result URL to avoid quota overflow
      const safeItem = { ...newItem, original: null };
      // Keep max 15 entries
      const updatedHistory = [safeItem, ...prev].slice(0, 15);
      
      try {
        localStorage.setItem(`glamai_history_${user.email.toLowerCase()}`, JSON.stringify(updatedHistory));
      } catch (e) {
        // Quota exceeded — trim to 5 oldest entries and retry
        console.warn('localStorage quota exceeded, trimming history...');
        const trimmed = updatedHistory.slice(0, 5);
        try {
          localStorage.setItem(`glamai_history_${user.email.toLowerCase()}`, JSON.stringify(trimmed));
          return trimmed;
        } catch (_) {
          // If still fails, clear history entirely
          localStorage.removeItem(`glamai_history_${user.email.toLowerCase()}`);
          return [];
        }
      }
      return updatedHistory;
    });
  }, [user]);

  const handleClearHistoryItem = useCallback((itemId) => {
    if (!user) return;
    setHistory(prev => {
      const updatedHistory = prev.filter(item => item.id !== itemId);
      try {
        localStorage.setItem(`glamai_history_${user.email.toLowerCase()}`, JSON.stringify(updatedHistory));
      } catch (_) {}
      return updatedHistory;
    });
  }, [user]);

  const scrollToPlayground = useCallback(() => {
    navigateToTab('playground');
    setTimeout(() => {
      playgroundRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }, [navigateToTab]);

  return (
    <ToastProvider>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar
          activeTab={activeTab}
          setActiveTab={navigateToTab}
          user={user}
          guestTokens={guestTokens}
          onLogout={handleLogout}
          onOpenAuth={handleOpenAuth}
        />

        <main style={{ flex: 1 }}>
          <Suspense fallback={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', color: 'var(--color-pink-primary)' }}>
              <div className="animate-spin" style={{ width: '40px', height: '40px', border: '3px solid rgba(255,46,147,0.1)', borderTopColor: 'var(--color-pink-primary)', borderRadius: '50%' }} />
            </div>
          }>
            {activeTab === 'playground' && (
              <Hero
                onStartClick={scrollToPlayground}
                onViewPricing={() => navigateToTab('pricing')}
                user={effectiveUser}
                guestTokens={guestTokens}
                onDeductToken={user ? handleDeductToken : handleGuestDeductToken}
                onOpenAuth={handleOpenAuth}
                onAddHistory={handleAddHistory}
                setActiveTab={navigateToTab}
                playgroundRef={playgroundRef}
                styleContext={styleContext}
                setStyleContext={setStyleContext}
              />
            )}

            {activeTab === 'makeup' && (
              <Makeup
                user={effectiveUser}
                guestTokens={guestTokens}
                onDeductToken={user ? handleDeductToken : handleGuestDeductToken}
                onOpenAuth={handleOpenAuth}
                onAddHistory={handleAddHistory}
                setActiveTab={navigateToTab}
                styleContext={styleContext}
                setStyleContext={setStyleContext}
              />
            )}

            {activeTab === 'scanner' && (
              <FaceAnalysis
                user={effectiveUser}
                onOpenAuth={handleOpenAuth}
                setActiveTab={navigateToTab}
                setStyleContext={setStyleContext}
              />
            )}

            {activeTab === 'nails' && (
              <Nails
                user={effectiveUser}
                guestTokens={guestTokens}
                onDeductToken={user ? handleDeductToken : handleGuestDeductToken}
                onOpenAuth={handleOpenAuth}
                onAddHistory={handleAddHistory}
                setActiveTab={navigateToTab}
              />
            )}

            {activeTab === 'trending' && (
              <TrendingFeed
                setActiveTab={navigateToTab}
              />
            )}

            {activeTab === 'dashboard' && (
              <Dashboard
                user={effectiveUser}
                onLogout={handleLogout}
                setActiveTab={navigateToTab}
              />
            )}

            {activeTab === 'settings' && (
              <Settings
                user={effectiveUser}
                onLogout={handleLogout}
                setActiveTab={navigateToTab}
              />
            )}

            {activeTab === 'pricing' && (
              <Pricing
                user={effectiveUser}
                onSelectPlan={handleSelectPlan}
                onOpenAuth={handleOpenAuth}
              />
            )}

            {activeTab === 'history' && (
              <History
                history={history}
                onClearItem={handleClearHistoryItem}
                onStartClick={scrollToPlayground}
              />
            )}

            {activeTab === 'blog' && (
              <Blog onStartClick={scrollToPlayground} />
            )}

            {activeTab === 'privacy' && (
              <PrivacyPolicy setActiveTab={navigateToTab} />
            )}

            {activeTab === 'terms' && (
              <TermsOfService setActiveTab={navigateToTab} />
            )}

            {activeTab === 'favorites' && (
              <Favorites setActiveTab={navigateToTab} />
            )}

            {!['playground', 'makeup', 'scanner', 'nails', 'trending', 'dashboard', 'settings', 'pricing', 'history', 'blog', 'privacy', 'terms', 'favorites'].includes(activeTab) && (
              <div style={{ padding: '8rem 2rem 10rem', textAlign: 'center', background: 'var(--bg-primary)' }}>
                <div style={{ maxWidth: '500px', margin: '0 auto', padding: '3rem 2rem' }} className="glass-panel animate-fade-in">
                  <h1 style={{ fontSize: '6rem', fontWeight: 800, background: 'var(--gradient-pink-purple)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '0 0 1rem' }}>404</h1>
                  <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>Page Not Found</h2>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', lineHeight: 1.6 }}>
                    The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                  </p>
                  <button className="btn btn-primary" onClick={() => navigateToTab('playground')} style={{ margin: '0 auto' }}>
                    Return to Studio
                  </button>
                </div>
              </div>
            )}
          </Suspense>
        </main>

        <Footer setActiveTab={navigateToTab} />



        {/* Modals */}
        {isAuthOpen && (
          <AuthModal
            onClose={() => setIsAuthOpen(false)}
            onAuthSuccess={handleAuthSuccess}
          />
        )}

        {selectedPlan && (
          <PaymentModal
            plan={selectedPlan}
            allowMockPayment={allowMockPayment}
            onClose={() => setSelectedPlan(null)}
            onPaymentSuccess={handlePaymentSuccess}
          />
        )}
        <CookieBanner />
      </div>
    </ToastProvider>
  );
}
