import t from '../utils/i18n';
import React, { useState, useEffect } from 'react';
import { Heart, Trash2, Download, Sparkles, Image } from 'lucide-react';
import { useToast } from './Toast';
import { handleDownloadClick } from '../utils/telegramHelper';

const FAVORITES_KEY = 'glamai_favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
    } catch { return []; }
  });

  const addFavorite = (item) => {
    setFavorites(prev => {
      if (prev.find(f => f.id === item.id)) return prev;
      const updated = [item, ...prev].slice(0, 50);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const removeFavorite = (id) => {
    setFavorites(prev => {
      const updated = prev.filter(f => f.id !== id);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const isFavorite = (id) => favorites.some(f => f.id === id);

  return { favorites, addFavorite, removeFavorite, isFavorite };
}

export default function Favorites({ setActiveTab }) {
  const { favorites, removeFavorite } = useFavorites();
  const toast = useToast();

  if (favorites.length === 0) {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', padding: '3rem 1rem', textAlign: 'center' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,46,147,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(255,46,147,0.15)' }}>
          <Heart size={36} color="var(--color-pink-primary)" />
        </div>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{t('audit.favorites.noFavouritesYet')}</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '320px' }}>
            Tap the ❤️ button on any AI result to save it here for later.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button className="btn btn-primary" onClick={() => setActiveTab('playground')} style={{ padding: '0.75rem 1.5rem' }}>
            <Sparkles size={16} /> <span>{t('audit.favorites.tryHairStyles')}</span>
          </button>
          <button className="btn btn-secondary" onClick={() => setActiveTab('makeup')} style={{ padding: '0.75rem 1.5rem' }}>
            <span>{t('audit.favorites.tryMakeup')}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem 0 6rem', background: 'var(--bg-primary)' }}>
      <div className="container animate-fade-in" style={{ maxWidth: '1100px' }}>

        {/* Hero */}
        <div className="category-landing-hero" style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
          <div className="glowing-orb pink-orb" />
          <div className="glowing-orb purple-orb" />
          <h1 className="landing-title">
            <span className="gradient-text">{t('audit.favorites.myFavourites')}</span>
          </h1>
          <p className="landing-subtitle">
            All your saved AI results in one place. {favorites.length} look{favorites.length !== 1 ? 's' : ''} saved.
          </p>
        </div>

        {/* Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '1.25rem',
        }}>
          {favorites.map(item => (
            <div
              key={item.id}
              className="glass-panel"
              style={{ borderRadius: '20px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
            >
              <div style={{ position: 'relative', height: '260px', background: '#111', overflow: 'hidden' }}>
                <img
                  src={item.result}
                  alt={item.style || 'Saved look'}
                  loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                />
                {item.category && (
                  <div style={{ position: 'absolute', top: '0.6rem', left: '0.6rem', background: 'rgba(255,46,147,0.9)', color: '#fff', fontSize: '0.68rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '6px' }}>
                    {item.category}
                  </div>
                )}
              </div>

              <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', flex: 1 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{item.style || 'AI Style'}</div>
                  {item.color && item.color !== item.style && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.color}</div>
                  )}
                  {item.date && (
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{item.date}</div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                  <a
                    href={item.result}
                    download={`glamai_fav_${item.id}.png`}
                    className="btn btn-primary"
                    style={{ flex: 2, padding: '0.55rem 0', fontSize: '0.78rem', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                    title={t('audit.favorites.download')}
                    onClick={(e) => handleDownloadClick(e, item.result, `glamai_fav_${item.id}.png`, toast)}
                  >
                    <Download size={13} /> <span>{t('audit.favorites.download')}</span>
                  </a>
                  <button
                    className="btn btn-secondary"
                    style={{ flex: 1, padding: '0.55rem 0', fontSize: '0.78rem' }}
                    title={t('audit.favorites.removeFromFavourites')}
                    onClick={() => removeFavorite(item.id)}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
