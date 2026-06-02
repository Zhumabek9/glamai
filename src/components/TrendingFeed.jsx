import React, { useState, useRef } from 'react';
import { Compass, Sparkles, Flame, Eye, Share2, TrendingUp } from 'lucide-react';
import { useToast } from './Toast';

const TRENDING_POSTS = [
  {
    id: 1,
    title: 'Wavy Golden Blonde',
    views: '2.3M views',
    likes: '318K likes',
    targetTab: 'playground',
    presetId: 'wavy',
    category: '✂️ Hair',
    beforeImg: '/trending_hair_before.png',
    afterImg: '/trending_hair.png',
    isSingleImage: false,
  },
  {
    id: 2,
    title: 'Korean Glass Skin Glow',
    views: '1.4M views',
    likes: '187K likes',
    targetTab: 'makeup',
    presetId: 'clean-girl',
    category: '💄 Makeup',
    beforeImg: '/trending_makeup_before.png',
    afterImg: '/trending_makeup.png',
    isSingleImage: false,
  },
  {
    id: 3,
    title: 'Chic Pixie Cut',
    views: '1.8M views',
    likes: '231K likes',
    targetTab: 'playground',
    presetId: 'pixie-cut',
    category: '✂️ Hair',
    beforeImg: '/trending_pixie_before.png',
    afterImg: '/trending_pixie.png',
    isSingleImage: false,
  },
  {
    id: 4,
    title: 'Pink Marble Acrylic Nails',
    views: '920K views',
    likes: '104K likes',
    targetTab: 'nails',
    presetId: 'acrylic',
    category: '💅 Nails',
    beforeImg: '/trending_nails_before.png',
    afterImg: '/trending_nails.png',
    isSingleImage: false,
  },
  {
    id: 5,
    title: 'Sharp Angled Bob',
    views: '2.1M views',
    likes: '310K likes',
    targetTab: 'playground',
    presetId: 'angled-bob',
    category: '✂️ Hair',
    beforeImg: '/trending_bob_before.png',
    afterImg: '/trending_bob_after.png',
    isSingleImage: false,
  },
  {
    id: 6,
    title: 'Siren Eyes Dramatic',
    views: '1.6M views',
    likes: '212K likes',
    targetTab: 'makeup',
    presetId: 'siren-eyes',
    category: '💄 Makeup',
    beforeImg: '/trending_siren_before.png',
    afterImg: '/trending_siren_after.png',
    isSingleImage: false,
  },
];

const ACTION_GIFS = [
  { id: 1, emoji: '✂️', title: 'Wavy Transformation', desc: 'Natural → Glamorous Waves', img: '/styles/female_wavy.webp', tab: 'playground' },
  { id: 2, emoji: '💄', title: 'Soft Glam Makeup', desc: 'Bare → Runway Glam', img: '/styles/makeup_soft_girl.png', tab: 'makeup' },
  { id: 3, emoji: '💅', title: 'Chrome Nails', desc: 'Plain → Mirror Chrome', img: '/styles/nails_chrome.png', tab: 'nails' },
  { id: 4, emoji: '✂️', title: 'Pixie Cut', desc: 'Long → Chic Pixie', img: '/styles/female_pixie-cut.webp', tab: 'playground' },
  { id: 5, emoji: '💄', title: 'Cat Eye Look', desc: 'Natural → Seductive Cat Eye', img: '/styles/makeup_siren_eyes.png', tab: 'makeup' },
  { id: 6, emoji: '💅', title: 'Gold Foil Art', desc: 'Bare → Luxury Gold', img: '/styles/nails_luxury.png', tab: 'nails' },
];

export default function TrendingFeed({ setActiveTab }) {
  const toast = useToast();
  return (
    <div style={{ background: 'var(--bg-primary)', padding: '2rem 0 6rem' }}>
      <div className="container animate-fade-in" style={{ maxWidth: '1100px' }}>

        {/* Hero */}
        <div className="category-landing-hero" style={{ marginBottom: '3rem', textAlign: 'center' }}>
          <div className="glowing-orb pink-orb"></div>
          <div className="glowing-orb purple-orb"></div>
          <h1 className="landing-title">
            <span className="gradient-text">Trending Beauty</span> Feed
          </h1>
          <p className="landing-subtitle">
            Discover AI-powered beauty transformations from our community. Drag the slider to see real before &amp; after results and try your favourite look instantly.
          </p>
          <div className="landing-stats">
            <div className="stat-badge"><Flame size={14} color="var(--color-pink-primary)" style={{ fill: 'currentColor' }} /> <span>15,000+ Daily Creations</span></div>
            <div className="stat-badge"><Sparkles size={14} color="var(--color-pink-primary)" /> <span>Trending Looks Updated Hourly</span></div>
            <div className="stat-badge"><span>🔥 Join the Glow Up Challenge</span></div>
          </div>
        </div>

        {/* Trending Grid - 3 cols on desktop, 1 on mobile */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
          gap: '1.5rem',
          marginBottom: '4rem'
        }}>
          {TRENDING_POSTS.map((post) => (
            <div
              key={post.id}
              className="glass-panel"
              style={{ borderRadius: '24px', overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'transform 0.25s ease' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {/* Image */}
              {post.isSingleImage ? (
                <div style={{ position: 'relative', width: '100%', height: '300px', overflow: 'hidden', background: '#111' }}>
                  <img
                    src={post.beforeImg}
                    alt={post.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', background: 'rgba(255,46,147,0.9)', color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '6px' }}>
                    {post.category}
                  </div>
                </div>
              ) : (
                <BeforeAfterSlider before={post.beforeImg} after={post.afterImg} category={post.category} />
              )}

              {/* Card Footer */}
              <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>{post.title}</span>
                  <span style={{ fontSize: '0.72rem', background: 'rgba(255,46,147,0.08)', color: 'var(--color-pink-primary)', padding: '0.2rem 0.6rem', borderRadius: '6px', fontWeight: 700, whiteSpace: 'nowrap' }}>Trending 🔥</span>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span><Eye size={11} style={{ display: 'inline', marginRight: '3px' }} />{post.views}</span>
                  <span>•</span>
                  <span>{post.likes}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <button
                    className="btn btn-primary"
                    style={{ flex: 2, padding: '0.6rem 0', fontSize: '0.8rem' }}
                    onClick={() => setActiveTab(post.targetTab)}
                  >
                    <Sparkles size={13} />
                    <span>Try This Look</span>
                  </button>
                  <button
                    className="btn btn-secondary"
                    style={{ flex: 1, padding: '0.6rem 0', fontSize: '0.8rem' }}
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.origin + '?try=' + post.presetId)
                        .then(() => toast.success('Link copied! Share it with friends ✓'))
                        .catch(() => toast.error('Could not copy link'));
                    }}
                  >
                    <Share2 size={13} />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* See the Magic in Action - 6 items in one row on desktop */}
        <div style={{ marginBottom: '3rem' }}>
          <div className="section-header" style={{ marginBottom: '2rem' }}>
            <span className="section-badge">🎬 See the Magic in Action</span>
            <h2>AI Transformations Gallery</h2>
            <p>Watch how GlamAI transforms everyday looks into stunning results instantly.</p>
          </div>
          <div className="magic-grid">
            {ACTION_GIFS.map(item => (
              <div
                key={item.id}
                onClick={() => setActiveTab(item.tab)}
                style={{
                  borderRadius: '16px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  position: 'relative',
                  minWidth: '140px',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(255,46,147,0.25)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)'; }}
              >
                <div style={{ height: '170px', overflow: 'hidden', background: '#111' }}>
                  <img src={item.img} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(10px)', padding: '0.7rem 0.6rem', borderTop: '1px solid var(--glass-border)' }}>
                  <div style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>{item.emoji}</div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.15rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, background: 'var(--gradient-text)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.75rem' }}>
            Start Your Transformation Today
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Join 52,000+ users discovering their best look with GlamAI.</p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => setActiveTab('playground')} style={{ padding: '0.8rem 1.5rem' }}>✂️ Try Hair Styles</button>
            <button className="btn btn-secondary" onClick={() => setActiveTab('makeup')} style={{ padding: '0.8rem 1.5rem' }}>💄 Try Makeup</button>
            <button className="btn btn-secondary" onClick={() => setActiveTab('nails')} style={{ padding: '0.8rem 1.5rem' }}>💅 Try Nails</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Before-after drag comparison slider component
function BeforeAfterSlider({ before, after, category }) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef(null);

  const handleMove = (clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={(e) => { if (e.buttons === 1) handleMove(e.clientX); }}
      onTouchMove={(e) => { if (e.touches.length > 0) handleMove(e.touches[0].clientX); }}
      style={{ position: 'relative', width: '100%', height: '300px', overflow: 'hidden', cursor: 'ew-resize', background: '#000', userSelect: 'none' }}
    >
      <img src={after} alt="After" style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', background: 'rgba(255,46,147,0.85)', color: '#fff', fontSize: '0.65rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '4px' }}>AFTER</div>
      {category && <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', background: 'rgba(255,46,147,0.9)', color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '6px' }}>{category}</div>}

      <div style={{ position: 'absolute', top: 0, left: 0, width: `${sliderPosition}%`, height: '100%', overflow: 'hidden', borderRight: '2px solid #fff' }}>
        <img src={before} alt="Before" style={{ width: containerRef.current ? containerRef.current.getBoundingClientRect().width + 'px' : '300px', height: '300px', objectFit: 'cover', maxWidth: 'none', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: '0.65rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '4px' }}>BEFORE</div>
      </div>

      <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${sliderPosition}%`, width: '2px', background: '#fff', transform: 'translateX(-50%)', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '32px', height: '32px', background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.3)', color: 'var(--color-pink-primary)', fontSize: '1rem', fontWeight: 'bold' }}>↔</div>
      </div>
    </div>
  );
}
