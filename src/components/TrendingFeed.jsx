import React, { useState, useRef } from 'react';
import { Compass, Sparkles, Flame, Play, Eye } from 'lucide-react';

const TRENDING_POSTS = [
  {
    id: 1,
    title: 'Audrey Hepburn Pixie Cut',
    views: '1.2M views',
    likes: '142K likes',
    targetTab: 'playground',
    presetId: 'pixie-cut',
    beforeImg: '/styles/female_straight.webp',
    afterImg: '/styles/female_pixie-cut.webp'
  },
  {
    id: 2,
    title: 'Korean Soft Glow Glam',
    views: '840K views',
    likes: '92K likes',
    targetTab: 'makeup',
    presetId: 'korean',
    beforeImg: '/styles/female_straight.webp',
    afterImg: '/styles/female_straightened.webp' // placeholder or similar
  },
  {
    id: 3,
    title: 'Sharp Angled Bob',
    views: '2.1M views',
    likes: '310K likes',
    targetTab: 'playground',
    presetId: 'angled-bob',
    beforeImg: '/styles/female_straight.webp',
    afterImg: '/styles/female_angled-bob.webp'
  },
  {
    id: 4,
    title: 'Textured Shag Cut',
    views: '540K views',
    likes: '45K likes',
    targetTab: 'playground',
    presetId: 'shag',
    beforeImg: '/styles/female_straight.webp',
    afterImg: '/styles/female_shag.webp'
  }
];

export default function TrendingFeed({ setActiveTab }) {
  const [activePreset, setActivePreset] = useState(null);

  return (
    <div style={{ background: 'var(--bg-primary)', padding: '2rem 0 6rem' }}>
      <div className="container animate-fade-in" style={{ maxWidth: '960px' }}>
        
        {/* Premium Feature Landing Page Hero */}
        <div className="category-landing-hero" style={{ marginBottom: '3rem', textAlign: 'center' }}>
          <div className="glowing-orb pink-orb"></div>
          <div className="glowing-orb purple-orb"></div>
          <h1 className="landing-title">
            <span className="gradient-text">Trending Beauty</span> Feed
          </h1>
          <p className="landing-subtitle">
            Explore viral AI transformations blowing up on TikTok and Instagram. See real side-by-side community creations and try on your favorite looks with a single tap.
          </p>
          <div className="landing-stats">
            <div className="stat-badge"><Flame size={14} color="var(--color-pink-primary)" style={{ fill: 'currentColor' }} /> <span>15,000+ Daily Creations</span></div>
            <div className="stat-badge"><Sparkles size={14} color="var(--color-pink-primary)" /> <span>Trending Looks Updated Hourly</span></div>
            <div className="stat-badge"><span>🔥 Join the Glow Up Challenge</span></div>
          </div>
        </div>

        {/* Swipeable Grid of Videos/Sliders */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
          {TRENDING_POSTS.map((post) => (
            <div 
              key={post.id} 
              className="glass-panel" 
              style={{ borderRadius: '24px', overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'transform 0.25s ease' }}
            >
              {/* Image Split slider */}
              <BeforeAfterSlider 
                before={post.beforeImg} 
                after={post.afterImg} 
                title={post.title}
              />
 
              {/* Feed Card Footer */}
              <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>{post.title}</span>
                  <span style={{ fontSize: '0.75rem', background: 'rgba(255, 46, 147, 0.08)', color: 'var(--color-pink-primary)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>Trending</span>
                </div>
                
                <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span>{post.views}</span>
                  <span>&bull;</span>
                  <span>{post.likes}</span>
                </div>
 
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button 
                    className="btn btn-primary" 
                    style={{ flex: 2, padding: '0.6rem 0', fontSize: '0.8rem' }}
                    onClick={() => setActiveTab(post.targetTab)}
                  >
                    <Sparkles size={14} />
                    <span>Try on Selfie</span>
                  </button>
                  <button 
                    className="btn btn-secondary" 
                    style={{ flex: 1, padding: '0.6rem 0', fontSize: '0.8rem' }}
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.origin + '?try=' + post.presetId);
                      alert('Link to try this look copied to clipboard!');
                    }}
                  >
                    <span>Share</span>
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

// Visual before-after drag comparison slider component
function BeforeAfterSlider({ before, after, title }) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef(null);

  const handleMove = (clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleMouseMove = (e) => {
    if (e.buttons === 1) {
      handleMove(e.clientX);
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length > 0) {
      handleMove(e.touches[0].clientX);
    }
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      style={{
        position: 'relative',
        width: '100%',
        height: '320px',
        overflow: 'hidden',
        cursor: 'ew-resize',
        background: '#000',
        userSelect: 'none'
      }}
    >
      {/* After image (background) */}
      <img 
        src={after} 
        alt="After" 
        style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }}
      />
      <div 
        style={{
          position: 'absolute',
          top: '0.75rem',
          right: '0.75rem',
          background: 'rgba(255, 46, 147, 0.85)',
          color: '#fff',
          fontSize: '0.65rem',
          fontWeight: 700,
          padding: '0.2rem 0.5rem',
          borderRadius: '4px'
        }}
      >
        AFTER
      </div>

      {/* Before image (clipped overlay) */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: `${sliderPosition}%`,
          height: '100%',
          overflow: 'hidden',
          borderRight: '2px solid #fff'
        }}
      >
        <img 
          src={before} 
          alt="Before" 
          style={{ 
            width: containerRef.current ? containerRef.current.getBoundingClientRect().width : '300px', 
            height: '320px', 
            objectFit: 'cover', 
            maxWidth: 'none',
            pointerEvents: 'none' 
          }}
        />
        <div 
          style={{
            position: 'absolute',
            top: '0.75rem',
            left: '0.75rem',
            background: 'rgba(0, 0, 0, 0.7)',
            color: '#fff',
            fontSize: '0.65rem',
            fontWeight: 700,
            padding: '0.2rem 0.5rem',
            borderRadius: '4px'
          }}
        >
          BEFORE
        </div>
      </div>

      {/* Slider handle bar */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: `${sliderPosition}%`,
          width: '2px',
          background: '#fff',
          transform: 'translateX(-50%)',
          pointerEvents: 'none'
        }}
      >
        <div 
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '32px',
            height: '32px',
            background: '#fff',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
            color: 'var(--color-pink-primary)',
            fontSize: '1rem',
            fontWeight: 'bold'
          }}
        >
          &harr;
        </div>
      </div>
    </div>
  );
}
