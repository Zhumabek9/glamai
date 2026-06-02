import React, { useState } from 'react';
import { Sparkles, Coins, LogOut, User, LogIn, Menu, X, Scissors, Smile, Compass, Sparkle, Settings as SettingsIcon, CreditCard, BookOpen, Paintbrush, Gem } from 'lucide-react';
import { t } from '../utils/i18n';

export default function Navbar({ activeTab, setActiveTab, user, guestTokens, onLogout, onOpenAuth }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigate = (tab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  const isPremium = user && user.subscriptionTier === 'premium';

  return (
    <>
      <nav className="navbar">
        <div className="container nav-container">
          <a href="#" className="logo" onClick={(e) => { e.preventDefault(); navigate('playground'); }}>
            <Sparkles size={24} fill="var(--color-pink-primary)" />
            <span>GlamAI</span>
            {isPremium && <span className="vip-badge-mini">PRO</span>}
          </a>

          {/* Desktop nav-links */}
          <div className="nav-links desktop-nav" style={{ gap: '0.8rem' }}>
            <a 
              href="/"
              className={`nav-item ${activeTab === 'playground' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); navigate('playground'); }}
            >
              <Scissors size={14} />
              <span>Hair</span>
            </a>

            <a 
              href="/makeup"
              className={`nav-item ${activeTab === 'makeup' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); navigate('makeup'); }}
            >
              <Sparkle size={14} />
              <span>Makeup</span>
            </a>


            <a 
              href="/nails"
              className={`nav-item ${activeTab === 'nails' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); navigate('nails'); }}
            >
              <Sparkles size={14} />
              <span>Nails</span>
            </a>

            <a 
              href="/trending"
              className={`nav-item ${activeTab === 'trending' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); navigate('trending'); }}
            >
              <Compass size={14} />
              <span>Trending</span>
            </a>

            <a 
              href="/blog"
              className={`nav-item ${activeTab === 'blog' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); navigate('blog'); }}
            >
              <BookOpen size={14} />
              <span>Blog</span>
            </a>

            <a 
              href="/pricing"
              className={`nav-item ${activeTab === 'pricing' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); navigate('pricing'); }}
            >
              <CreditCard size={14} />
              <span>Pricing</span>
            </a>

            {user && (
              <a 
                href="/dashboard"
                className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={(e) => { e.preventDefault(); navigate('dashboard'); }}
              >
                <span>Dashboard</span>
              </a>
            )}

            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '0.5rem' }}>
                {!isPremium && (
                  <div className="token-pill">
                    <Coins size={14} />
                    <span>{user.tokens} credits</span>
                  </div>
                )}
                <div 
                  className="user-profile-badge"
                  onClick={() => navigate('settings')}
                  style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.4rem', 
                      color: 'var(--text-primary)',
                      fontSize: '0.85rem',
                      fontWeight: 500,
                      cursor: 'pointer'
                  }}
                >
                  <div 
                    style={{ 
                      width: '28px', 
                      height: '28px', 
                      borderRadius: '50%', 
                      background: 'var(--gradient-pink-purple)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}
                  >
                    <User size={14} color="#fff" />
                  </div>
                  <span style={{ maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.email.split('@')[0]}
                  </span>
                </div>
                <button 
                  className="btn btn-secondary" 
                  onClick={onLogout}
                  style={{ padding: '0.35rem 0.7rem', borderRadius: 'var(--radius-sm)' }}
                  title={t('nav.signOut')}
                >
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '0.5rem' }}>
                {guestTokens > 0 && (
                  <div className="token-pill" style={{ background: 'rgba(255,46,147,0.12)', border: '1px solid rgba(255,46,147,0.3)', padding: '0.35rem 0.6rem' }}>
                    <Coins size={12} color="var(--color-pink-primary)" />
                    <span style={{ color: 'var(--color-pink-primary)', fontWeight: 700, fontSize: '0.8rem' }}>{guestTokens} Free</span>
                  </div>
                )}
                <button className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={onOpenAuth}>
                  <LogIn size={14} />
                  <span>{t('nav.signIn')}</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile right side: tokens + hamburger */}
          <div className="mobile-nav-right">
            {!isPremium && !user && guestTokens > 0 && (
              <div className="token-pill" style={{ fontSize: '0.8rem', padding: '0.3rem 0.7rem', background: 'rgba(255,46,147,0.12)', border: '1px solid rgba(255,46,147,0.3)' }}>
                <Coins size={13} color="var(--color-pink-primary)" />
                <span style={{ color: 'var(--color-pink-primary)', fontWeight: 700 }}>{guestTokens} Free</span>
              </div>
            )}
            {!isPremium && user && (
              <div className="token-pill" style={{ fontSize: '0.85rem', padding: '0.35rem 0.8rem', background: 'rgba(255,46,147,0.1)', border: '1px solid rgba(255,46,147,0.25)' }}>
                <Coins size={14} color="var(--color-pink-primary)" />
                <span style={{ color: 'var(--color-pink-primary)', fontWeight: 700 }}>{user.tokens} {t('nav.credits')}</span>
              </div>
            )}
            {isPremium && (
              <span className="vip-badge-mini" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>PRO ∞</span>
            )}
            <button
              className="hamburger-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="mobile-drawer">
            <a href="/" className={`mobile-nav-item ${activeTab === 'playground' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); navigate('playground'); }}>Hair Transformation</a>
            <a href="/makeup" className={`mobile-nav-item ${activeTab === 'makeup' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); navigate('makeup'); }}>AI Makeup Salon</a>
            <a href="/nails" className={`mobile-nav-item ${activeTab === 'nails' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); navigate('nails'); }}>AI Nails Studio</a>
            <a href="/trending" className={`mobile-nav-item ${activeTab === 'trending' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); navigate('trending'); }}>Trending Feed</a>
            <a href="/blog" className={`mobile-nav-item ${activeTab === 'blog' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); navigate('blog'); }}>Blog & Trends</a>
            <a href="/pricing" className={`mobile-nav-item ${activeTab === 'pricing' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); navigate('pricing'); }}>Pricing Plans</a>
            {user && (
              <>
                <a href="/dashboard" className={`mobile-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); navigate('dashboard'); }}>Dashboard</a>
                <a href="/settings" className={`mobile-nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); navigate('settings'); }}>Settings</a>
              </>
            )}
            <div className="mobile-drawer-footer">
              {user ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
                  {/* Credits row */}
                  {!isPremium && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,46,147,0.06)', borderRadius: '12px', padding: '0.6rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Coins size={16} color="var(--color-pink-primary)" />
                        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-pink-primary)' }}>{user.tokens} {t('nav.credits')}</span>
                      </div>
                      <button className="btn btn-primary" style={{ padding: '0.3rem 0.7rem', fontSize: '0.75rem' }} onClick={() => { navigate('pricing'); }}>
                        + {t('nav.buy')}
                      </button>
                    </div>
                  )}
                  {isPremium && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,46,147,0.06)', borderRadius: '12px', padding: '0.6rem 1rem' }}>
                      <span className="vip-badge-mini">PRO</span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t('nav.unlimited')}</span>
                    </div>
                  )}
                  {/* User row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--gradient-pink-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={16} color="#fff" />
                      </div>
                      <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {user.email.split('@')[0]}
                      </span>
                    </div>
                    <button 
                      className="btn btn-secondary" 
                      onClick={() => { onLogout(); setMobileMenuOpen(false); }}
                      style={{ padding: '0.4rem 0.8rem' }}
                    >
                      <LogOut size={15} />
                      <span style={{ fontSize: '0.85rem' }}>{t('nav.signOut')}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => { onOpenAuth(); setMobileMenuOpen(false); }}>
                  <LogIn size={16} />
                  <span>{t('nav.signIn')}</span>
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Premium Mobile Bottom Dock */}
      <div className="mobile-bottom-dock">
        <button 
          className={`dock-item ${activeTab === 'playground' ? 'active' : ''}`}
          onClick={() => navigate('playground')}
        >
          <Scissors size={20} />
          <span>Hair</span>
        </button>
        <button 
          className={`dock-item ${activeTab === 'makeup' ? 'active' : ''}`}
          onClick={() => navigate('makeup')}
        >
          <Paintbrush size={20} />
          <span>Makeup</span>
        </button>
        <button 
          className={`dock-item ${activeTab === 'nails' ? 'active' : ''}`}
          onClick={() => navigate('nails')}
        >
          <Gem size={20} />
          <span>Nails</span>
        </button>
        <button 
          className={`dock-item ${activeTab === 'trending' ? 'active' : ''}`}
          onClick={() => navigate('trending')}
        >
          <Compass size={20} />
          <span>Feed</span>
        </button>
        <button 
          className={`dock-item ${activeTab === 'dashboard' || activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => user ? navigate('dashboard') : onOpenAuth()}
        >
          {user ? <User size={20} /> : <LogIn size={20} />}
          <span>{user ? 'Profile' : 'Sign In'}</span>
        </button>
      </div>
    </>
  );
}
