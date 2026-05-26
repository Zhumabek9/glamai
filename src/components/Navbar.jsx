import React, { useState } from 'react';
import { Sparkles, Coins, LogOut, User, LogIn, Menu, X, Scissors, Smile, Compass, Sparkle, Eye, Settings as SettingsIcon, CreditCard } from 'lucide-react';
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
            <button 
              className={`nav-item ${activeTab === 'playground' ? 'active' : ''}`}
              onClick={() => navigate('playground')}
              style={{ background: 'transparent', border: 'none' }}
            >
              <Scissors size={14} />
              <span>Hair</span>
            </button>

            <button 
              className={`nav-item ${activeTab === 'makeup' ? 'active' : ''}`}
              onClick={() => navigate('makeup')}
              style={{ background: 'transparent', border: 'none' }}
            >
              <Sparkle size={14} />
              <span>Makeup</span>
            </button>

            <button 
              className={`nav-item ${activeTab === 'beard' ? 'active' : ''}`}
              onClick={() => navigate('beard')}
              style={{ background: 'transparent', border: 'none' }}
            >
              <Smile size={14} />
              <span>Beard</span>
            </button>

            <button 
              className={`nav-item ${activeTab === 'nails' ? 'active' : ''}`}
              onClick={() => navigate('nails')}
              style={{ background: 'transparent', border: 'none' }}
            >
              <Sparkles size={14} />
              <span>Nails</span>
            </button>

            <button 
              className={`nav-item ${activeTab === 'retouch' ? 'active' : ''}`}
              onClick={() => navigate('retouch')}
              style={{ background: 'transparent', border: 'none' }}
            >
              <Eye size={14} />
              <span>Retouch</span>
            </button>

            <button 
              className={`nav-item ${activeTab === 'analysis' ? 'active' : ''}`}
              onClick={() => navigate('analysis')}
              style={{ background: 'transparent', border: 'none' }}
            >
              <User size={14} />
              <span>Face Scan</span>
            </button>

            <button 
              className={`nav-item ${activeTab === 'trending' ? 'active' : ''}`}
              onClick={() => navigate('trending')}
              style={{ background: 'transparent', border: 'none' }}
            >
              <Compass size={14} />
              <span>Trending</span>
            </button>

            <button 
              className={`nav-item ${activeTab === 'pricing' ? 'active' : ''}`}
              onClick={() => navigate('pricing')}
              style={{ background: 'transparent', border: 'none' }}
            >
              <CreditCard size={14} />
              <span>Pricing</span>
            </button>

            {user && (
              <button 
                className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => navigate('dashboard')}
                style={{ background: 'transparent', border: 'none' }}
              >
                <span>Dashboard</span>
              </button>
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
                <span style={{ color: 'var(--color-pink-primary)', fontWeight: 700 }}>{guestTokens}</span>
              </div>
            )}
            {!isPremium && user && (
              <div className="token-pill" style={{ fontSize: '0.8rem', padding: '0.3rem 0.7rem' }}>
                <Coins size={13} />
                <span>{user.tokens}</span>
              </div>
            )}
            {isPremium && (
              <span className="vip-badge-mini" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>PRO</span>
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
            <button className={`mobile-nav-item ${activeTab === 'playground' ? 'active' : ''}`} onClick={() => navigate('playground')}>Hair Transformation</button>
            <button className={`mobile-nav-item ${activeTab === 'makeup' ? 'active' : ''}`} onClick={() => navigate('makeup')}>AI Makeup Salon</button>
            <button className={`mobile-nav-item ${activeTab === 'beard' ? 'active' : ''}`} onClick={() => navigate('beard')}>AI Beard Styler</button>
            <button className={`mobile-nav-item ${activeTab === 'nails' ? 'active' : ''}`} onClick={() => navigate('nails')}>AI Nails Studio</button>
            <button className={`mobile-nav-item ${activeTab === 'retouch' ? 'active' : ''}`} onClick={() => navigate('retouch')}>Beauty Retouch</button>
            <button className={`mobile-nav-item ${activeTab === 'analysis' ? 'active' : ''}`} onClick={() => navigate('analysis')}>AI Face Scanner</button>
            <button className={`mobile-nav-item ${activeTab === 'trending' ? 'active' : ''}`} onClick={() => navigate('trending')}>Trending Feed</button>
            <button className={`mobile-nav-item ${activeTab === 'pricing' ? 'active' : ''}`} onClick={() => navigate('pricing')}>Pricing Plans</button>
            {user && (
              <>
                <button className={`mobile-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => navigate('dashboard')}>Dashboard</button>
                <button className={`mobile-nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => navigate('settings')}>Settings</button>
              </>
            )}
            <div className="mobile-drawer-footer">
              {user ? (
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
          <Sparkle size={20} />
          <span>Makeup</span>
        </button>
        <button 
          className={`dock-item ${activeTab === 'analysis' ? 'active' : ''}`}
          style={{ position: 'relative' }}
          onClick={() => navigate('analysis')}
        >
          <div className="dock-scan-btn">
            <User size={22} color="#fff" />
          </div>
          <span style={{ marginTop: '16px' }}>Scan</span>
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
          onClick={() => navigate(user ? 'dashboard' : 'pricing')}
        >
          {user ? <User size={20} /> : <CreditCard size={20} />}
          <span>{user ? 'Me' : 'VIP'}</span>
        </button>
      </div>
    </>
  );
}
