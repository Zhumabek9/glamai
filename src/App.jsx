import React, { useState, useEffect, useRef, lazy, Suspense, useMemo } from 'react';
import { useAuth, useUser, useClerk } from '@clerk/react';
import { authFetch } from './apiClient';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import PaymentModal from './components/PaymentModal';
import { ToastProvider } from './components/Toast';
import CookieBanner from './components/CookieBanner';

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

export default function App() {
  const { isLoaded, userId, getToken } = useAuth();
  const { user: clerkUser } = useUser();
  const { signOut, openSignIn } = useClerk();

  const getTabFromPath = (path) => {
    if (path.startsWith('/blog/')) return 'blog';
    const cleanPath = path.replace(/^\//, '');
    if (!cleanPath) return 'playground';
    const validTabs = [
      'playground', 'makeup', 'nails',
      'trending', 'dashboard', 'settings', 
      'pricing', 'blog', 'privacy', 'terms', 'history', 'favorites'
    ];
    return validTabs.includes(cleanPath) ? cleanPath : 'playground';
  };

  const [activeTab, setActiveTab] = useState(() => getTabFromPath(window.location.pathname));
  const [user, setUser] = useState(null);
  const [guestTokens, setGuestTokens] = useState(10);
  const [history, setHistory] = useState([]);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [stripeEnabled, setStripeEnabled] = useState(false);

  const handleOpenAuth = () => {
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
  };

  const navigateToTab = (tab) => {
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
      history: 'GlamAI — My Style History'
    };
    document.title = titles[tab] || 'GlamAI — AI Hairstyle Changer';
  };

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
        if (config.guestTokensRemaining !== undefined) {
          setGuestTokens(config.guestTokensRemaining);
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
            subscriptionStatus: data.user.subscriptionStatus || 'inactive'
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
  const loadHistory = (email) => {
    const key = `glamai_history_${email.toLowerCase()}`;
    try {
      const raw = localStorage.getItem(key);
      if (!raw) { setHistory([]); return; }
      const parsed = JSON.parse(raw);
      // Sanitize: strip base64 originals (they bloat localStorage) and keep max 15
      const sanitized = parsed
        .slice(0, 15)
        .map(item => ({ ...item, original: null }));
      setHistory(sanitized);
      // Rewrite cleaned version back to free up space
      localStorage.setItem(key, JSON.stringify(sanitized));
    } catch (_) {
      setHistory([]);
    }
  };

  // 3. User Authentication
  const handleAuthSuccess = (backendUser) => {
    const activeUser = {
      id: backendUser.id,
      email: backendUser.email,
      tokens: backendUser.credits,
      referralCode: backendUser.referralCode,
      subscriptionTier: backendUser.subscriptionTier || 'free',
      subscriptionStatus: backendUser.subscriptionStatus || 'inactive'
    };
    setUser(activeUser);
    setGuestTokens(10); // reset guest tokens on login
    loadHistory(activeUser.email);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      await authFetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    } catch (err) {
      console.error('Logout error:', err);
    }
    setUser(null);
    setHistory([]);
    setActiveTab('playground');
  };

  // 4. Token deduction (syncs state; actual deduction happens during /api/generate)
  const handleDeductToken = (count = 1) => {
    if (!user) return;
    setUser(prev => prev ? { ...prev, tokens: Math.max(0, prev.tokens - count) } : null);
  };

  // 4b. Guest token deduction
  const handleGuestDeductToken = (count = 10) => {
    setGuestTokens(prev => Math.max(0, prev - count));
  };

  // Effective user object passed to components (real user or guest with tokens)
  const effectiveUser = useMemo(() => user || { 
    isGuest: true, 
    tokens: guestTokens, 
    email: 'guest',
    subscriptionTier: 'free',
    subscriptionStatus: 'inactive'
  }, [user, guestTokens]);

  // 5. Payment completed (syncs state; actual increment happens via Stripe webhook/backend)
  const handlePaymentSuccess = (newTokens) => {
    if (!user) return;
    setUser(prev => prev ? { ...prev, tokens: newTokens } : null);
  };

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
  const handleAddHistory = (newItem) => {
    if (!user) return;
    // Strip base64 original image — only keep result URL to avoid quota overflow
    const safeItem = { ...newItem, original: null };
    // Keep max 15 entries
    const updatedHistory = [safeItem, ...history].slice(0, 15);
    setHistory(updatedHistory);
    try {
      localStorage.setItem(`glamai_history_${user.email.toLowerCase()}`, JSON.stringify(updatedHistory));
    } catch (e) {
      // Quota exceeded — trim to 5 oldest entries and retry
      console.warn('localStorage quota exceeded, trimming history...');
      const trimmed = updatedHistory.slice(0, 5);
      setHistory(trimmed);
      try {
        localStorage.setItem(`glamai_history_${user.email.toLowerCase()}`, JSON.stringify(trimmed));
      } catch (_) {
        // If still fails, clear history entirely
        localStorage.removeItem(`glamai_history_${user.email.toLowerCase()}`);
        setHistory([]);
      }
    }
  };

  const handleClearHistoryItem = (itemId) => {
    if (!user) return;
    const updatedHistory = history.filter(item => item.id !== itemId);
    setHistory(updatedHistory);
    try {
      localStorage.setItem(`glamai_history_${user.email.toLowerCase()}`, JSON.stringify(updatedHistory));
    } catch (_) {}
  };

  const scrollToPlayground = () => {
    navigateToTab('playground');
    setTimeout(() => {
      playgroundRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

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
            onClose={() => setSelectedPlan(null)}
            onPaymentSuccess={handlePaymentSuccess}
          />
        )}
        <CookieBanner />
      </div>
    </ToastProvider>
  );
}
