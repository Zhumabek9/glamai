import React, { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { authFetch } from './apiClient';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Playground from './components/Playground';
import Pricing from './components/Pricing';
import History from './components/History';
import Blog from './components/Blog';
import Footer from './components/Footer';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import AuthModal from './components/AuthModal';
import PaymentModal from './components/PaymentModal';
import { ToastProvider } from './components/Toast';

export default function App() {
  const [activeTab, setActiveTab] = useState('playground');
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [stripeEnabled, setStripeEnabled] = useState(false);

  const playgroundRef = useRef(null);

  // Scroll to top on tab change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  // 1. Initial State Load — Firebase auth + backend sync
  useEffect(() => {
    // Load Stripe config
    fetch('/api/config')
      .then(res => res.json())
      .then(config => setStripeEnabled(config.stripeEnabled))
      .catch(err => console.warn('Failed to load public config:', err));

    // Handle return from Stripe Checkout
    const params = new URLSearchParams(window.location.search);
    if (params.get('paid') === '1' || params.get('cancel') === '1') {
      setActiveTab('pricing');
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Firebase auth state listener — automatically restores session
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) { setUser(null); return; }
      try {
        const idToken = await firebaseUser.getIdToken();
        const res = await authFetch('/api/auth/firebase', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken }),
        });
        if (res.ok) {
          const data = await res.json();
          const activeUser = { id: data.user.id, email: data.user.email, tokens: data.user.credits };
          setUser(activeUser);
          loadHistory(activeUser.email);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // 2. Load History for specific user
  const loadHistory = (email) => {
    const userHistory = localStorage.getItem(`glamai_history_${email.toLowerCase()}`);
    setHistory(userHistory ? JSON.parse(userHistory) : []);
  };

  // 3. User Authentication
  const handleAuthSuccess = (backendUser) => {
    const activeUser = {
      id: backendUser.id,
      email: backendUser.email,
      tokens: backendUser.credits
    };
    setUser(activeUser);
    loadHistory(activeUser.email);
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
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
    const updatedHistory = [newItem, ...history];
    setHistory(updatedHistory);
    localStorage.setItem(`glamai_history_${user.email.toLowerCase()}`, JSON.stringify(updatedHistory));
  };

  const handleClearHistoryItem = (itemId) => {
    if (!user) return;
    const updatedHistory = history.filter(item => item.id !== itemId);
    setHistory(updatedHistory);
    localStorage.setItem(`glamai_history_${user.email.toLowerCase()}`, JSON.stringify(updatedHistory));
  };

  const scrollToPlayground = () => {
    setActiveTab('playground');
    setTimeout(() => {
      playgroundRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  return (
    <ToastProvider>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          user={user}
          onLogout={handleLogout}
          onOpenAuth={() => setIsAuthOpen(true)}
        />

        <main style={{ flex: 1 }}>
          {activeTab === 'playground' && (
            <Hero
              onStartClick={scrollToPlayground}
              onViewPricing={() => setActiveTab('pricing')}
              user={user}
              onDeductToken={handleDeductToken}
              onOpenAuth={() => setIsAuthOpen(true)}
              onAddHistory={handleAddHistory}
              setActiveTab={setActiveTab}
              playgroundRef={playgroundRef}
            />
          )}

          {activeTab === 'pricing' && (
            <Pricing
              user={user}
              onSelectPlan={handleSelectPlan}
              onOpenAuth={() => setIsAuthOpen(true)}
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
            <PrivacyPolicy setActiveTab={setActiveTab} />
          )}

          {activeTab === 'terms' && (
            <TermsOfService setActiveTab={setActiveTab} />
          )}
        </main>

        <Footer setActiveTab={setActiveTab} />

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
      </div>
    </ToastProvider>
  );
}
