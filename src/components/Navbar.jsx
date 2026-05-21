import React, { useState } from 'react';
import { Sparkles, Coins, LogOut, User, LogIn, Menu, X } from 'lucide-react';
import { t } from '../utils/i18n';

export default function Navbar({ activeTab, setActiveTab, user, onLogout, onOpenAuth }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigate = (tab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="container nav-container">
        <a href="#" className="logo" onClick={(e) => { e.preventDefault(); navigate('playground'); }}>
          <Sparkles size={24} fill="var(--color-pink-primary)" />
          <span>GlamAI</span>
        </a>

        {/* Desktop nav-links */}
        <div className="nav-links desktop-nav">
          <button 
            className={`nav-item ${activeTab === 'playground' ? 'active' : ''}`}
            onClick={() => navigate('playground')}
            style={{ background: 'transparent', border: 'none' }}
          >
            {t('nav.tryItFree')}
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'pricing' ? 'active' : ''}`}
            onClick={() => navigate('pricing')}
            style={{ background: 'transparent', border: 'none' }}
          >
            {t('nav.pricing')}
          </button>

          <button 
            className={`nav-item ${activeTab === 'blog' ? 'active' : ''}`}
            onClick={() => navigate('blog')}
            style={{ background: 'transparent', border: 'none' }}
          >
            {t('nav.blog')}
          </button>

          {user && (
            <button 
              className={`nav-item ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => navigate('history')}
              style={{ background: 'transparent', border: 'none' }}
            >
              {t('nav.myHistory')}
            </button>
          )}

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div className="token-pill">
                <Coins size={14} />
                <span>{user.tokens} {t('nav.credits')}</span>
              </div>
              <div 
                style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem', 
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    fontWeight: 500
                }}
              >
                <div 
                  style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '50%', 
                    background: 'var(--gradient-pink-purple)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}
                >
                  <User size={16} color="#fff" />
                </div>
                <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.email.split('@')[0]}
                </span>
              </div>
              <button 
                className="btn btn-secondary" 
                onClick={onLogout}
                style={{ padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-sm)' }}
                title={t('nav.signOut')}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button className="btn btn-primary" onClick={onOpenAuth}>
              <LogIn size={16} />
              <span>{t('nav.signIn')}</span>
            </button>
          )}
        </div>

        {/* Mobile right side: tokens + hamburger */}
        <div className="mobile-nav-right">
          {user && (
            <div className="token-pill" style={{ fontSize: '0.8rem', padding: '0.3rem 0.7rem' }}>
              <Coins size={13} />
              <span>{user.tokens}</span>
            </div>
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
          <button 
            className={`mobile-nav-item ${activeTab === 'playground' ? 'active' : ''}`}
            onClick={() => navigate('playground')}
          >
            {t('nav.tryItFree')}
          </button>
          <button 
            className={`mobile-nav-item ${activeTab === 'pricing' ? 'active' : ''}`}
            onClick={() => navigate('pricing')}
          >
            {t('nav.pricing')}
          </button>
          <button 
            className={`mobile-nav-item ${activeTab === 'blog' ? 'active' : ''}`}
            onClick={() => navigate('blog')}
          >
            {t('nav.blog')}
          </button>
          {user && (
            <button 
              className={`mobile-nav-item ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => navigate('history')}
            >
              {t('nav.myHistory')}
            </button>
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
  );
}
