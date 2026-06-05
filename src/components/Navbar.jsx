import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Coins, LogOut, User, LogIn, Menu, X, Scissors, Smile, Compass, Sparkle, Settings as SettingsIcon, CreditCard, BookOpen, Paintbrush, Gem, Globe } from 'lucide-react';
import { t, getLanguage, setLanguage } from '../utils/i18n';

export default function Navbar({ activeTab, setActiveTab, user, guestTokens, onLogout, onOpenAuth }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const drawerRef = useRef(null);
  const langDropdownRef = useRef(null);
  const currentLang = getLanguage();

  useEffect(() => {
    if (!langOpen) return;
    const handleOutsideClick = (e) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target)) {
        setLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [langOpen]);

  const handleLanguageChange = (langCode) => {
    setLanguage(langCode);
    setLangOpen(false);
    window.location.reload();
  };

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        return;
      }

      if (e.key === 'Tab' && drawerRef.current) {
        const focusableElements = drawerRef.current.querySelectorAll(
          'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    // Save last active element to restore focus when drawer closes
    const lastActive = document.activeElement;
    
    // Focus the first focusable element in the drawer
    if (drawerRef.current) {
      const focusable = drawerRef.current.querySelectorAll('a[href], button');
      if (focusable.length > 0) {
        focusable[0].focus();
      }
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (lastActive && typeof lastActive.focus === 'function') {
        lastActive.focus();
      }
    };
  }, [mobileMenuOpen]);

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
            <span>{t('audit.navbar.glamai')}</span>
            {isPremium && <span className="vip-badge-mini">{t('audit.navbar.pro')}</span>}
          </a>

          {/* Desktop nav-links */}
          <div className="nav-links desktop-nav" style={{ gap: '0.8rem' }}>
            <a 
              href="/"
              className={`nav-item ${activeTab === 'playground' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); navigate('playground'); }}
            >
              <Scissors size={14} />
              <span>{t('audit.navbar.hair')}</span>
            </a>

            <a 
              href="/makeup"
              className={`nav-item ${activeTab === 'makeup' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); navigate('makeup'); }}
            >
              <Sparkle size={14} />
              <span>{t('audit.navbar.makeup')}</span>
            </a>


            <a 
              href="/nails"
              className={`nav-item ${activeTab === 'nails' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); navigate('nails'); }}
            >
              <Sparkles size={14} />
              <span>{t('audit.navbar.nails')}</span>
            </a>

            <a 
              href="/scanner"
              className={`nav-item ${activeTab === 'scanner' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); navigate('scanner'); }}
            >
              <Smile size={14} />
              <span>{t('audit.navbar.scanner')}</span>
            </a>

            <a 
              href="/trending"
              className={`nav-item ${activeTab === 'trending' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); navigate('trending'); }}
            >
              <Compass size={14} />
              <span>{t('audit.navbar.trending')}</span>
            </a>

            <a 
              href="/blog"
              className={`nav-item ${activeTab === 'blog' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); navigate('blog'); }}
            >
              <BookOpen size={14} />
              <span>{t('audit.navbar.blog')}</span>
            </a>

            <a 
              href="/pricing"
              className={`nav-item ${activeTab === 'pricing' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); navigate('pricing'); }}
            >
              <CreditCard size={14} />
              <span>{t('audit.navbar.pricing')}</span>
            </a>

            {user && (
              <a 
                href="/dashboard"
                className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={(e) => { e.preventDefault(); navigate('dashboard'); }}
              >
                <span>{t('audit.navbar.dashboard')}</span>
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
                <button 
                  className="user-profile-badge"
                  onClick={() => navigate('settings')}
                  aria-label={t('audit.navbar.userSettings')}
                  style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.4rem', 
                      color: 'var(--text-primary)',
                      fontSize: '0.85rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      background: 'none',
                      border: 'none',
                      padding: 0
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
                </button>
                <button 
                  className="btn btn-secondary" 
                  onClick={onLogout}
                  style={{ 
                    padding: '0',
                    width: '44px',
                    height: '44px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 'var(--radius-sm)'
                  }}
                  title={t('nav.signOut')}
                  aria-label={t('nav.signOut')}
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

            {/* Language Switcher */}
            <div className="lang-switcher-container" ref={langDropdownRef}>
              <button 
                className="lang-switcher-btn"
                onClick={() => setLangOpen(!langOpen)}
                aria-label={t('audit.navbar.selectLanguage')}
                style={{ marginLeft: '0.4rem' }}
              >
                <Globe size={14} />
                <span style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>{currentLang}</span>
              </button>
              {langOpen && (
                <div className="lang-dropdown-menu">
                  <button className={currentLang === 'en' ? 'active' : ''} onClick={() => handleLanguageChange('en')}>{t('audit.navbar.english')}</button>
                  <button className={currentLang === 'es' ? 'active' : ''} onClick={() => handleLanguageChange('es')}>{t('audit.navbar.espaol')}</button>
                  <button className={currentLang === 'fr' ? 'active' : ''} onClick={() => handleLanguageChange('fr')}>{t('audit.navbar.franais')}</button>
                  <button className={currentLang === 'de' ? 'active' : ''} onClick={() => handleLanguageChange('de')}>{t('audit.navbar.deutsch')}</button>
                  <button className={currentLang === 'ru' ? 'active' : ''} onClick={() => handleLanguageChange('ru')}>{t('audit.navbar.text')}</button>
                </div>
              )}
            </div>
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
              <span className="vip-badge-mini" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>{t('audit.navbar.pro1')}</span>
            )}
            <button
              className="hamburger-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={t('audit.navbar.toggleMenu')}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div 
            ref={drawerRef}
            className="mobile-drawer"
            role="dialog"
            aria-modal="true"
            aria-label={t('audit.navbar.mobileNavigationDrawer')}
          >
            <a href="/" className={`mobile-nav-item ${activeTab === 'playground' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); navigate('playground'); }}>{t('audit.navbar.hairTransformation')}</a>
            <a href="/makeup" className={`mobile-nav-item ${activeTab === 'makeup' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); navigate('makeup'); }}>{t('audit.navbar.aiMakeupSalon')}</a>
            <a href="/nails" className={`mobile-nav-item ${activeTab === 'nails' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); navigate('nails'); }}>{t('audit.navbar.aiNailsStudio')}</a>
            <a href="/scanner" className={`mobile-nav-item ${activeTab === 'scanner' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); navigate('scanner'); }}>{t('audit.faceanalysis.aiFaceScanner')}</a>
            <a href="/trending" className={`mobile-nav-item ${activeTab === 'trending' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); navigate('trending'); }}>{t('audit.navbar.trendingFeed')}</a>
            <a href="/blog" className={`mobile-nav-item ${activeTab === 'blog' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); navigate('blog'); }}>{t('audit.navbar.blogTrends')}</a>
            <a href="/pricing" className={`mobile-nav-item ${activeTab === 'pricing' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); navigate('pricing'); }}>{t('audit.navbar.pricingPlans')}</a>
            {user && (
              <>
                <a href="/dashboard" className={`mobile-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); navigate('dashboard'); }}>{t('audit.navbar.dashboard')}</a>
                <a href="/settings" className={`mobile-nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); navigate('settings'); }}>{t('audit.navbar.settings')}</a>
              </>
            )}

            {/* Mobile Language Switcher Row */}
            <div className="mobile-lang-row" style={{ display: 'flex', justifyContent: 'center', gap: '0.6rem', padding: '0.8rem 1.5rem', borderTop: '1px solid rgba(255, 46, 147, 0.07)' }}>
              {['en', 'es', 'fr', 'de', 'ru'].map((langCode) => (
                <button
                  key={langCode}
                  onClick={() => handleLanguageChange(langCode)}
                  className={`mobile-lang-btn ${currentLang === langCode ? 'active' : ''}`}
                  style={{
                    background: currentLang === langCode ? 'rgba(255, 46, 147, 0.1)' : 'transparent',
                    border: '1px solid ' + (currentLang === langCode ? 'var(--color-pink-primary)' : 'rgba(0,0,0,0.05)'),
                    color: currentLang === langCode ? 'var(--color-pink-primary)' : 'var(--text-secondary)',
                    borderRadius: '8px',
                    padding: '0.35rem 0.65rem',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {langCode === 'en' && '🇬🇧 EN'}
                  {langCode === 'es' && '🇪🇸 ES'}
                  {langCode === 'fr' && '🇫🇷 FR'}
                  {langCode === 'de' && '🇩🇪 DE'}
                  {langCode === 'ru' && '🇷🇺 RU'}
                </button>
              ))}
            </div>

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
                      <span className="vip-badge-mini">{t('audit.navbar.pro')}</span>
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
                      aria-label={t('nav.signOut')}
                    >
                      <LogOut size={15} />
                      <span style={{ fontSize: '0.85rem' }}>{t('nav.signOut')}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => { onOpenAuth(); setMobileMenuOpen(false); }} aria-label={t('nav.signIn')}>
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
          aria-label={t('audit.navbar.hairTransformationTab')}
        >
          <Scissors size={20} />
          <span>{t('audit.navbar.hair')}</span>
        </button>
        <button 
          className={`dock-item ${activeTab === 'makeup' ? 'active' : ''}`}
          onClick={() => navigate('makeup')}
          aria-label={t('audit.navbar.makeupTryonTab')}
        >
          <Paintbrush size={20} />
          <span>{t('audit.navbar.makeup')}</span>
        </button>
        <button 
          className={`dock-item ${activeTab === 'nails' ? 'active' : ''}`}
          onClick={() => navigate('nails')}
          aria-label={t('audit.navbar.nailsTryonTab')}
        >
          <Gem size={20} />
          <span>{t('audit.navbar.nails')}</span>
        </button>
        <button 
          className={`dock-item ${activeTab === 'trending' ? 'active' : ''}`}
          onClick={() => navigate('trending')}
          aria-label={t('audit.navbar.trendingFeedTab')}
        >
          <Compass size={20} />
          <span>{t('audit.navbar.feed')}</span>
        </button>
        <button 
          className={`dock-item ${activeTab === 'dashboard' || activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => user ? navigate('dashboard') : onOpenAuth()}
          aria-label={user ? "Dashboard Tab" : "Sign In Tab"}
        >
          {user ? <User size={20} /> : <LogIn size={20} />}
          <span>{user ? 'Profile' : 'Sign In'}</span>
        </button>
      </div>
    </>
  );
}
