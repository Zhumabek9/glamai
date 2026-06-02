import React, { useState, useRef, useEffect, lazy, Suspense } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Check, 
  Scissors, 
  Palette, 
  Zap, 
  ShieldAlert, 
  Upload, 
  Eye, 
  Download, 
  ShieldCheck, 
  Award, 
  Heart,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Star,
  Users,
  Lock
} from 'lucide-react';
const Playground = lazy(() => import('./Playground'));
import { t } from '../utils/i18n';

export default function Hero({ 
  onStartClick, 
  onViewPricing, 
  user,
  guestTokens,
  onDeductToken, 
  onOpenAuth, 
  onAddHistory, 
  setActiveTab, 
  playgroundRef 
}) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const isDragging = useRef(false);
  const containerRef = useRef(null);
  const [openFaq, setOpenFaq] = useState(null);
  const [liveCount, setLiveCount] = useState(52847);

  // Animate live generation counter
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveCount(prev => prev + Math.floor(Math.random() * 3 + 1));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleMove = (clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let percentage = (x / rect.width) * 100;
    if (percentage < 0) percentage = 0;
    if (percentage > 100) percentage = 100;
    setSliderPosition(percentage);
  };

  const handleTouchMove = (e) => {
    if (!isDragging.current) return;
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    handleMove(e.clientX);
  };

  useEffect(() => {
    const handleMouseUp = () => {
      isDragging.current = false;
    };
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchend', handleMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, []);

  // 6 transformation GIFs metadata (English titles matching the user requested styles)
  const transformations = [
    { id: 1, title: 'Romantic Curls', path: '/transformation_1.gif', sliderPos: 8, hot: true },
    { id: 2, title: 'Golden Platinum Blonde', path: '/transformation_3.gif', sliderPos: 12 },
    { id: 3, title: 'Classic Parisian Bob', path: '/transformation_5.gif', sliderPos: 15 },
    { id: 4, title: 'Textured Beach Waves', path: '/transformation_6.gif', sliderPos: 20 },
    { id: 5, title: 'Sleek Pixie Cut', path: '/transformation_4.gif', sliderPos: 25 },
    { id: 6, title: 'Sun-Kissed Highlights', path: '/transformation_2.gif', sliderPos: 12 },
  ];

  return (
    <section className="hero-section">
      {/* 1. HERO MAIN SECTION */}
      <div className="hero">
        <div className="container">
          <div className="hero-badge animate-slide-up">
            <Sparkles size={14} />
            <span>✨ {t('home.badge')}</span>
          </div>
          
          <h1 className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
            {t('home.title1')} <span>{t('home.titleHighlight')}</span> <br />
            <span>{t('home.title2')}</span>
          </h1>
          
          <p className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            {t('home.subtitle')}
          </p>

          <div className="hero-actions animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <button className="btn btn-primary" onClick={onStartClick}>
              <span>{t('pricing.tryFree')}</span>
              <ArrowRight size={16} />
            </button>
            <button className="btn btn-secondary" onClick={onViewPricing}>
              <span>{t('nav.pricing')}</span>
            </button>
          </div>

          {/* Social proof trust strip */}
          <div className="trust-strip animate-slide-up" style={{ animationDelay: '0.35s', marginBottom: '0.5rem' }}>
            <div className="trust-strip-item">
              <div style={{ display: 'flex' }}>
                {[...Array(5)].map((_, i) => <Star key={i} size={18} fill="var(--color-pink-primary)" color="var(--color-pink-primary)" />)}
              </div>
              <span>4.9/5 rating</span>
            </div>
            <div style={{ width: '1px', height: '22px', background: 'rgba(255,46,147,0.15)' }} className="trust-divider" />
            <div className="trust-strip-item">
              <Users size={18} />
              <span key={liveCount} className="live-counter">{liveCount.toLocaleString()}+ transformations</span>
            </div>
            <div style={{ width: '1px', height: '22px', background: 'rgba(255,46,147,0.15)' }} className="trust-divider" />
            <div className="trust-strip-item">
              <Lock size={18} />
              <span>Privacy guaranteed</span>
            </div>
          </div>


          {/* Before/After Interactive Slider */}
          <div className="slider-wrapper animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <div 
              ref={containerRef}
              className="slider-container"
              onMouseDown={(e) => { e.preventDefault(); isDragging.current = true; handleMove(e.clientX); }}
              onMouseMove={handleMouseMove}
              onTouchStart={(e) => { isDragging.current = true; handleMove(e.touches[0].clientX); }}
              onTouchMove={handleTouchMove}
            >
              {/* After Image */}
              <img 
                src="/model_after.png" 
                alt="After AI Hairstyle Change" 
                className="slider-image image-after" 
              />
              <div className="slider-label after">{t('tool.after')}</div>

              {/* Before Image */}
              <img 
                src="/model_before.png" 
                alt="Before AI Hairstyle Change" 
                className="slider-image image-before" 
                style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
              />
              <div className="slider-label before">{t('tool.before')}</div>

              {/* Drag Handle Bar */}
              <div 
                className="slider-handle-bar" 
                style={{ left: `${sliderPosition}%` }}
                role="slider"
                aria-valuenow={Math.round(sliderPosition)}
                aria-valuemin="0"
                aria-valuemax="100"
                aria-label="Before and after comparison slider"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowLeft') {
                    setSliderPosition(prev => Math.max(0, prev - 5));
                  } else if (e.key === 'ArrowRight') {
                    setSliderPosition(prev => Math.min(100, prev + 5));
                  }
                }}
              >
                <div className="slider-handle-button">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 18l-6-6 6-6M15 6l6 6-6 6" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customize Hairstyle (Playground Workspace) - Positioned between Slider and Real Transformations */}
      <div ref={playgroundRef} style={{ scrollMarginTop: '100px' }}>
        <Suspense fallback={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px', color: 'var(--color-pink-primary)' }}>
            <div className="animate-spin" style={{ width: '40px', height: '40px', border: '3px solid rgba(255,46,147,0.1)', borderTopColor: 'var(--color-pink-primary)', borderRadius: '50%' }} />
          </div>
        }>
          <Playground 
            user={user}
            guestTokens={guestTokens}
            onDeductToken={onDeductToken}
            onOpenAuth={onOpenAuth}
            onAddHistory={onAddHistory}
            setActiveTab={setActiveTab}
          />
        </Suspense>
      </div>


      {/* 2. REAL TRANSFORMATIONS (See the Magic in Action) */}
      <div className="landing-section transformations-section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">{t('home.showcaseLabel')}</span>
            <h2>{t('home.showcaseTitle')}</h2>
            <p>{t('home.showcaseDesc')}</p>
          </div>

          <div className="transformations-grid">
            {transformations.map(tData => (
              <div key={tData.id} className="transformation-card-outer">
                <div className="transformation-card glass-panel">
                  <div className="transformation-image-wrapper">
                    {tData.hot && <span className="transformation-hot-badge">HOT</span>}
                    <img src={tData.path} alt={tData.title} className="transformation-gif" loading="lazy" decoding="async" />
                  </div>
                </div>
                <div className="transformation-card-title-bottom">
                  {tData.title}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. SIMPLE PROCESS (How It Works) */}
      <div className="landing-section process-section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">{t('home.simpleProcess')}</span>
            <h2>{t('howItWorks.title')}</h2>
            <p>Zero salon regrets, zero waste. Preview your perfect hair, makeup, and nail styles instantly.</p>
          </div>

          <div className="process-timeline">
            <div className="process-card glass-panel">
              <div className="process-step-num">01</div>
              <div className="process-icon-box">
                <Upload size={24} />
              </div>
              <h3>{t('howItWorks.step1Title')}</h3>
              <p>{t('howItWorks.step1Desc')}</p>
            </div>

            <div className="process-card glass-panel">
              <div className="process-step-num">02</div>
              <div className="process-icon-box">
                <Scissors size={24} />
              </div>
              <h3>{t('howItWorks.step2Title')}</h3>
              <p>{t('howItWorks.step2Desc')}</p>
            </div>

            <div className="process-card glass-panel">
              <div className="process-step-num">03</div>
              <div className="process-icon-box">
                <Eye size={24} />
              </div>
              <h3>{t('howItWorks.step3Title')}</h3>
              <p>{t('howItWorks.step3Desc')}</p>
            </div>

            <div className="process-card glass-panel">
              <div className="process-step-num">04</div>
              <div className="process-icon-box">
                <Download size={24} />
              </div>
              <h3>{t('home.downloadShare')}</h3>
              <p>{t('home.downloadShareDesc')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3.5 TESTIMONIALS */}
      <div className="landing-section testimonials-section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">💬 Real Stories</span>
            <h2>Loved by over 52,000+ Users</h2>
            <p>Read how GlamAI helped users discover their signature look and prevent costly salon disasters.</p>
          </div>

          <div className="testimonials-grid">
            {[
              {
                name: 'Sophia M.',
                meta: 'Used Bob Cut style',
                avatar: '💁‍♀️',
                bg: 'linear-gradient(135deg,#ff2e93,#a855f7)',
                text: 'I was nervous about cutting my hair short. GlamAI let me preview a bob cut and I loved it — booked my appointment the next day!',
                stars: 5
              },
              {
                name: 'James R.',
                meta: 'Tried Fade & Undercut',
                avatar: '🧔',
                bg: 'linear-gradient(135deg,#3b82f6,#06b6d4)',
                text: 'Finally found the perfect fade style without spending $50 on a cut I might hate. The AI results looked super realistic.',
                stars: 4
              },
              {
                name: 'Aisha K.',
                meta: 'Tested Braids & Locs',
                avatar: '👩🏾',
                bg: 'linear-gradient(135deg,#f59e0b,#ef4444)',
                text: 'I tested 5 different braid styles in one session! The batch generation feature is a game changer. So worth it.',
                stars: 5
              },
              {
                name: 'Elena V.',
                meta: 'Tried Wavy & Curly looks',
                avatar: '🌸',
                bg: 'linear-gradient(135deg,#ec4899,#f97316)',
                text: 'The results are honestly better than I expected. The color matching is incredible — tried blonde highlights and it looked so natural.',
                stars: 5
              },
              {
                name: 'Marcus T.',
                meta: 'Explored Long & Curly styles',
                avatar: '🧑🏽',
                bg: 'linear-gradient(135deg,#10b981,#3b82f6)',
                text: 'Showed the results to my barber and he was impressed. Using GlamAI before every appointment now — saves so much time explaining.',
                stars: 4
              },
              {
                name: 'Lena P.',
                meta: 'Tested Pixie & Shag cuts',
                avatar: '✨',
                bg: 'linear-gradient(135deg,#8b5cf6,#ec4899)',
                text: 'Going from long to short is scary! GlamAI made it easy to commit. The pixie cut preview convinced me to take the leap.',
                stars: 5
              }
            ].map((review, i) => (
              <div key={i} className="testimonial-card glass-panel">
                <div className="testimonial-stars">
                  {[...Array(review.stars)].map((_, si) => (
                    <Star key={si} size={14} fill="var(--color-pink-primary)" color="var(--color-pink-primary)" />
                  ))}
                </div>
                <p className="testimonial-text">{review.text}</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar" style={{ background: review.bg, color: '#fff' }}>
                    {review.avatar}
                  </div>
                  <div className="testimonial-author-info">
                    <span className="testimonial-name">{review.name}</span>
                    <span className="testimonial-meta">{review.meta}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. WHY CHOOSE US (Why Choose Glamai?) */}
      <div className="landing-section why-choose-section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">{t('home.whyChooseUs')}</span>
            <h2>{t('trust.title')}</h2>
            <p>Advanced generative AI beauty studio delivering 100% realistic hair, cosmetics, and grooming previews.</p>
          </div>

          <div className="benefits-grid">
            <div className="benefit-card glass-panel">
              <div className="benefit-icon-wrapper">
                <Scissors size={24} />
              </div>
              <h3>{t('trust.feature2Title')}</h3>
              <p>{t('trust.feature2Desc')}</p>
            </div>

            <div className="benefit-card glass-panel">
              <div className="benefit-icon-wrapper">
                <Award size={24} />
              </div>
              <h3>{t('trust.feature1Title')}</h3>
              <p>{t('trust.feature1Desc')}</p>
            </div>

            <div className="benefit-card glass-panel">
              <div className="benefit-icon-wrapper">
                <Zap size={24} />
              </div>
              <h3>{t('trust.feature4Title')}</h3>
              <p>{t('trust.feature4Desc')}</p>
            </div>

            <div className="benefit-card glass-panel">
              <div className="benefit-icon-wrapper">
                <ShieldCheck size={24} />
              </div>
              <h3>{t('trust.feature3Title')}</h3>
              <p>{t('trust.feature3Desc')}</p>
            </div>

            <div className="benefit-card glass-panel">
              <div className="benefit-icon-wrapper">
                <Palette size={24} />
              </div>
              <h3>{t('home.hairColorsTitle')}</h3>
              <p>{t('home.hairColorsDesc')}</p>
            </div>

            <div className="benefit-card glass-panel">
              <div className="benefit-icon-wrapper">
                <Download size={24} />
              </div>
              <h3>{t('home.hdTitle')}</h3>
              <p>{t('home.hdDesc')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 5. GENERAL FAQ ACCORDION SECTION */}
      <div className="landing-section faq-section" style={{ background: 'transparent' }}>
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="section-header">
            <span className="section-badge">{t('home.gotQuestions')}</span>
            <h2>{t('faq.title')}</h2>
            <p>Answers to common questions about our AI virtual styling studio & beauty features.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((index) => {
              const qKey = `faq.q${index}`;
              const aKey = `faq.a${index}`;
              const isOpened = openFaq === index;

              return (
                <div 
                  key={index}
                  style={{
                    background: 'var(--bg-surface, #ffffff)',
                    border: '1px solid rgba(255, 46, 147, 0.08)',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    transition: 'all 0.2s ease-in-out',
                    boxShadow: isOpened ? '0 10px 25px rgba(255, 46, 147, 0.04)' : 'none'
                  }}
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    style={{
                      width: '100%',
                      padding: '1.25rem 1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <HelpCircle size={16} color="var(--color-pink-primary)" style={{ flexShrink: 0 }} />
                      {t(qKey)}
                    </span>
                    {isOpened ? (
                      <ChevronUp size={18} color="var(--text-muted)" />
                    ) : (
                      <ChevronDown size={18} color="var(--text-muted)" />
                    )}
                  </button>

                  {isOpened && (
                    <div style={{ padding: '0 1.5rem 1.25rem 2.5rem', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.6', borderTop: '1px solid rgba(0,0,0,0.02)' }}>
                      {t(aKey)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 6. BOTTOM CTA SECTION */}
      <div className="landing-section bottom-cta-section" style={{ background: 'rgba(255, 255, 255, 0.2)', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '680px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, background: 'var(--gradient-text)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '1rem' }}>
            {t('cta.title')}
          </h2>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '2.5rem', lineHeight: '1.6' }}>
            {t('cta.desc')}
          </p>
          <button className="btn btn-primary" onClick={onStartClick} style={{ padding: '1rem 2rem', fontSize: '1.05rem', boxShadow: '0 10px 20px var(--color-pink-glow)' }}>
            <span>{t('cta.button')}</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
