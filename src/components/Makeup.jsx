import React, { useState, useRef } from 'react';
import { Upload, Sparkles, Coins, Download, RefreshCw, Eye, Check, HelpCircle, EyeOff, ArrowRight, Star, ChevronDown, ChevronUp, Users, Lock, Palette } from 'lucide-react';
import { useToast } from './Toast';
import { authFetch } from '../apiClient';

const MAKEUP_PRESETS = [
  { id: 'bronze', name: 'Sunkissed Bronze', image: '/styles/makeup_bronze.png', desc: 'Warm golden tones, radiant bronzed highlights, and a dewy beach glow.' },
  { id: 'clean-girl', name: 'Clean Girl Aesthetic', image: '/styles/makeup_clean_girl.png', desc: 'Minimalist editorial look, fresh hyper-hydrated skin, and natural definition.' },
  { id: 'y2k', name: 'Y2K Retro Shimmer', image: '/styles/makeup_y2k.png', desc: 'Frosty pastel eyeshadows, high-shine wet lip gloss, and a classic late-90s vibe.' },
  { id: 'beige', name: 'Nude Beige Silhouette', image: '/styles/makeup_beige.png', desc: 'Neutral beige eyeshadow, soft contours, and natural nude lip.' },
  { id: 'soft-glam', name: 'Radiant Soft Glam', image: '/styles/makeup_soft_glam.png', desc: 'Warm brown smoky eyes, neutral lips, and radiant finish.' },
  { id: 'doll-like', name: 'Doll-Like Porcelain', image: '/styles/makeup_doll_like.png', desc: 'Pink flushed cheeks, defined long lashes, and glossy pink lips.' },
  { id: 'elegant', name: 'Timeless Elegance', image: '/styles/makeup_elegant.png', desc: 'Sophisticated look, classic thin eyeliner, and soft rose lips.' },
  { id: 'girlish', name: 'Petal Pink Girlish', image: '/styles/makeup_girlish.png', desc: 'Cute baby pink blush and glossy pink gradient lips.' },
  { id: 'grunge-rock', name: 'Edgy Grunge Rock', image: '/styles/makeup_grunge_rock.png', desc: 'Dark smoky eyeshadow, bold brown/nude matte lip.' },
  { id: 'matte', name: 'Velvet Matte Classic', image: '/styles/makeup_matte.png', desc: 'Flawless velvet skin, nude matte lip, structured contours.' },
  { id: 'seductive', name: 'Seductive Cat Eye', image: '/styles/makeup_seductive.png', desc: 'Dramatic winged cat eyeliner, sharp contour, and dark bold lips.' },
  { id: 'glossy-lips', name: 'Dewy Glass Lips', image: '/styles/makeup_glossy_lips.png', desc: 'Simple glass skin paired with high-shine wet lip gloss.' },
  { id: 'siren-eyes', name: 'Siren Eyes Dramatic', image: '/styles/makeup_siren_eyes.png', desc: 'Elongated winged liner, smoked out edges, and dramatic lifted eyes.' },
  { id: 'latte-makeup', name: 'Warm Latte Contour', image: '/styles/makeup_latte_makeup.png', desc: 'Warm caramel tones, soft brown smoky eyes, and nude glossy lips.' }
];

const LIPSTICKS = [
  { id: 'none', name: 'None', hex: '#888888' },
  { id: 'glazed-donut', name: 'Glazed Donut Gloss', hex: '#fef3f8' },
  { id: 'velvet-red', name: 'Velvet Matte Red', hex: '#b71c1c' },
  { id: 'satin-rosewood', name: 'Satin Rosewood', hex: '#a1695e' },
  { id: 'metallic-berry', name: 'Metallic Berry', hex: '#5d0032' },
  { id: 'soft-coral', name: 'Soft Coral Glow', hex: '#f08080' }
];

const EYELINERS = [
  { id: 'none', name: 'None' },
  { id: 'classic', name: 'Classic Eyeliner' },
  { id: 'winged', name: 'Winged Cat Eye' },
  { id: 'smokey', name: 'Smokey Smudge' }
];

const EYESHADOWS = [
  { id: 'none', name: 'None' },
  { id: 'smoky-sunset', name: 'Smoky Sunset' },
  { id: 'glitter-euphoria', name: 'Glitter Euphoria' },
  { id: 'nude-silhouette', name: 'Nude Silhouette' },
  { id: 'emerald-envy', name: 'Emerald Envy' }
];

const BLUSHES = [
  { id: 'none', name: 'None' },
  { id: 'glass-skin', name: 'Glass Skin Glow' },
  { id: 'sunkissed-peach', name: 'Sun-Kissed Peach' },
  { id: 'soft-lavender', name: 'Soft Lavender Tint' }
];

export default function Makeup({ user, guestTokens, onDeductToken, onOpenAuth, onAddHistory, setActiveTab }) {
  const toast = useToast();
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [selectedPreset, setSelectedPreset] = useState('bronze');
  const [selectedLipstick, setSelectedLipstick] = useState('none');
  const [selectedEyeliner, setSelectedEyeliner] = useState('none');
  const [selectedEyeshadow, setSelectedEyeshadow] = useState('none');
  const [selectedBlush, setSelectedBlush] = useState('none');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('');
  const [resultImage, setResultImage] = useState(null);
  const [showOriginal, setShowOriginal] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target.result);
        setResultImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    const isPremium = user && user.subscriptionTier === 'premium';
    const tokenCost = isPremium ? 0 : 10;
    const isGuest = !user || user.isGuest;
    const availableTokens = isGuest ? (guestTokens ?? 0) : (user?.tokens ?? 0);

    if (isGuest && availableTokens < 10) {
      toast.error('You have used your free generation! Sign up to get more tokens.');
      onOpenAuth();
      return;
    }

    if (!isGuest && !isPremium && availableTokens < 10) {
      toast.error(`You need at least 10 tokens to generate makeup!`);
      setActiveTab('pricing');
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setLoadingText('Uploading selfie to AI engine...');

    const steps = [
      { prg: 15, txt: 'Scanning facial landmarks...' },
      { prg: 35, txt: 'Mapping lips, eyes, and skin contours...' },
      { prg: 65, txt: 'Blending cosmetic filters...' },
      { prg: 85, txt: 'Matching lighting and skin textures...' },
      { prg: 95, txt: 'Refining makeup layers...' }
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      setProgress(prev => {
        const nextVal = prev + 1;
        if (currentStep < steps.length && nextVal >= steps[currentStep].prg) {
          setLoadingText(steps[currentStep].txt);
          currentStep++;
        }
        if (nextVal >= 95) return 95;
        return nextVal;
      });
    }, 100);

    try {
      const presetObj = MAKEUP_PRESETS.find(p => p.id === selectedPreset);
      const lipstickObj = LIPSTICKS.find(l => l.id === selectedLipstick);
      const eyelinerObj = EYELINERS.find(e => e.id === selectedEyeliner);
      const eyeshadowObj = EYESHADOWS.find(es => es.id === selectedEyeshadow);
      const blushObj = BLUSHES.find(b => b.id === selectedBlush);

      let makeupDesc = `${presetObj ? presetObj.name : 'Natural'} style.`;
      if (lipstickObj && lipstickObj.id !== 'none') makeupDesc += ` Lipstick: ${lipstickObj.name}.`;
      if (eyelinerObj && eyelinerObj.id !== 'none') makeupDesc += ` Eyeliner: ${eyelinerObj.name}.`;
      if (eyeshadowObj && eyeshadowObj.id !== 'none') makeupDesc += ` Eyeshadow: ${eyeshadowObj.name}.`;
      if (blushObj && blushObj.id !== 'none') makeupDesc += ` Blush: ${blushObj.name}.`;

      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('taskType', 'makeup');
      formData.append('makeup', makeupDesc);
      formData.append('gender', 'female');

      const res = await authFetch('/api/generate', {
        method: 'POST',
        body: formData
      });

      clearInterval(interval);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        if (errData.code === 'LOGIN_REQUIRED') {
          toast.error('Free generation used up! Sign up to continue.');
          onOpenAuth();
          setIsGenerating(false);
          return;
        }
        throw new Error(errData.error || 'Failed to render makeup');
      }

      const data = await res.json();
      setResultImage(data.imageUrl);
      setProgress(100);
      toast.success("AI Makeup rendered successfully!");
      onDeductToken(tokenCost);

      const newHistoryItem = {
        id: `history-makeup-${Date.now()}`,
        original: image,
        result: data.imageUrl,
        style: presetObj ? presetObj.name : 'Makeup',
        color: lipstickObj ? lipstickObj.name : 'Lipstick',
        date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
      };
      onAddHistory(newHistoryItem);

    } catch (err) {
      clearInterval(interval);
      toast.error(err.message || 'AI Makeup generation failed.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setImage(null);
    setImageFile(null);
    setResultImage(null);
  };

  return (
    <section className="playground-section container animate-fade-in">
      {/* Premium Feature Landing Page Hero */}
      <div className="category-landing-hero">
        <div className="glowing-orb pink-orb"></div>
        <div className="glowing-orb purple-orb"></div>
        <h1 className="landing-title">
          <span className="gradient-text">Precision Cosmetics, Zero Smudge</span>. Test High-End Makeup Instantly
        </h1>
        <p className="landing-subtitle">
          Experience high-definition virtual makeup. Test luxury lipsticks, eyeliners, shadows, and curated presets tailored to your unique skin undertone and facial contours. No messy cleanup, no expensive buyer's remorse.
        </p>
        <div className="landing-stats">
          <div className="stat-badge"><Sparkles size={14} color="var(--color-pink-primary)" /> <span>Biometric Tone Matching</span></div>
          <div className="stat-badge"><Coins size={14} color="var(--color-pink-primary)" /> <span>Pore-Preserving Neural Diffusion</span></div>
          <div className="stat-badge"><span>⚡ Studio-Grade Virtual Try-On</span></div>
        </div>
      </div>

      <div className="playground-grid">
        {/* Left Side: Makeup controls */}
        <div className="control-panel glass-panel">
          <div className="desktop-playground-header">
            <h2 className="section-title">
              <Sparkles size={20} color="var(--color-pink-primary)" />
              <span>AI Makeup Workspace</span>
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Select a preset template and customize shades.
            </p>
          </div>

          <hr style={{ border: 'none', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', margin: '1rem 0' }} />

          {/* Preset cards */}
          <div className="selector-group">
            <span className="selector-title">SELECT PRESET</span>
            <div className="style-cards-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              {MAKEUP_PRESETS.map(p => {
                const isSelected = selectedPreset === p.id;
                return (
                  <button
                    type="button"
                    key={p.id}
                    className={`style-card ${isSelected ? 'selected' : ''}`}
                    aria-pressed={isSelected}
                    aria-label={`Select preset: ${p.name}`}
                    onClick={() => setSelectedPreset(p.id)}
                    style={{ border: 'none', background: 'transparent', padding: '0.5rem', cursor: 'pointer', display: 'block', width: '100%', textAlign: 'left' }}
                  >
                    {isSelected && (
                      <div className="selected-badge">
                        <Check size={12} />
                      </div>
                    )}
                    <div className="style-card-image-wrapper">
                      <img 
                        src={p.image} 
                        alt={p.name} 
                        className="style-card-img" 
                      />
                      <div className="style-card-overlay"></div>
                    </div>
                    <div className="style-card-footer" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                      {p.name}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Lipstick shade selection */}
          <div className="selector-group">
            <span className="selector-title">LIPSTICK SHADE</span>
            <div className="pill-grid">
              {LIPSTICKS.map(l => (
                <button
                  type="button"
                  key={l.id}
                  className={`pill-option ${selectedLipstick === l.id ? 'selected' : ''}`}
                  aria-pressed={selectedLipstick === l.id}
                  aria-label={`Select lipstick shade: ${l.name}`}
                  onClick={() => setSelectedLipstick(l.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', border: 'none', font: 'inherit', cursor: 'pointer' }}
                >
                  <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: l.hex, border: '1px solid rgba(0,0,0,0.1)' }} />
                  <span>{l.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Eyeliner style selection */}
          <div className="selector-group">
            <span className="selector-title">EYELINER STYLE</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
              {EYELINERS.map(e => (
                <button
                  key={e.id}
                  className={`btn ${selectedEyeliner === e.id ? 'btn-primary' : 'btn-secondary'}`}
                  aria-pressed={selectedEyeliner === e.id}
                  style={{ padding: '0.5rem 0.75rem', fontSize: '0.75rem' }}
                  onClick={() => setSelectedEyeliner(e.id)}
                >
                  {e.name}
                </button>
              ))}
            </div>
          </div>

          {/* Eyeshadow style selection */}
          <div className="selector-group">
            <span className="selector-title">EYESHADOW PALETTE</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
              {EYESHADOWS.map(es => (
                <button
                  key={es.id}
                  className={`btn ${selectedEyeshadow === es.id ? 'btn-primary' : 'btn-secondary'}`}
                  aria-pressed={selectedEyeshadow === es.id}
                  style={{ padding: '0.5rem 0.75rem', fontSize: '0.75rem' }}
                  onClick={() => setSelectedEyeshadow(es.id)}
                >
                  {es.name}
                </button>
              ))}
            </div>
          </div>

          {/* Blush style selection */}
          <div className="selector-group">
            <span className="selector-title">BLUSH & HIGHLIGHTER</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
              {BLUSHES.map(b => (
                <button
                  key={b.id}
                  className={`btn ${selectedBlush === b.id ? 'btn-primary' : 'btn-secondary'}`}
                  aria-pressed={selectedBlush === b.id}
                  style={{ padding: '0.5rem 0.75rem', fontSize: '0.75rem' }}
                  onClick={() => setSelectedBlush(b.id)}
                >
                  {b.name}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 'auto', paddingTop: '1.5rem' }}>
            <button
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.9rem' }}
              disabled={!image || isGenerating}
              onClick={handleGenerate}
            >
              <Sparkles size={18} />
              <span>Apply AI Makeup</span>
            </button>
          </div>
        </div>

        {/* Right Side: Image Viewer */}
        <div className="preview-panel glass-panel">
          {isGenerating && (
            <div className="loading-overlay">
              <div className="spinner-outer">
                <div className="spinner-inner"></div>
              </div>
              <div className="progress-track">
                <div className="progress-bar" style={{ width: `${progress}%` }}></div>
              </div>
              <span className="loading-text">{loadingText}</span>
              <span className="loading-subtext">{progress}% Completed</span>
            </div>
          )}

          {!image ? (
            <div 
              className="dropzone"
              onClick={() => fileInputRef.current.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputRef.current.click(); } }}
              aria-label="Upload photo: drag and drop a face photo here or press Enter to browse files"
            >
              <div className="dropzone-icon">
                <Upload size={24} />
              </div>
              <h3>Upload a Selfie</h3>
              <p>Upload a clear, front-facing portrait to apply beauty makeup filters.</p>
              <button className="btn btn-secondary" tabIndex={-1} onClick={(e) => { e.stopPropagation(); fileInputRef.current.click(); }}>
                Choose File
              </button>
              <input 
                ref={fileInputRef}
                type="file" 
                className="file-input" 
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
          ) : (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {resultImage ? (
                <div className="before-after-grid">
                  <div className="before-after-col">
                    <span className="before-after-label before">Before</span>
                    <div className="preview-container">
                      <img src={image} alt="Before Makeup" />
                    </div>
                  </div>
                  <div className="before-after-col">
                    <span className="before-after-label after">After</span>
                    <div className="preview-container">
                      <img src={resultImage} alt="After Makeup" />
                      <div className="slider-label after" style={{ top: '1rem', right: '1rem', bottom: 'auto' }}>AI MAKEUP</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="preview-container" style={{ position: 'relative', overflow: 'hidden', borderRadius: '16px', border: '1px solid var(--glass-border)', background: '#000', maxWidth: '450px', margin: '0 auto' }}>
                  <img 
                    src={image} 
                    alt="Makeup Preview"
                    style={{ maxWidth: '100%', height: 'auto', display: 'block', maxHeight: '500px', objectFit: 'contain' }}
                  />
                </div>
              )}

              <div className="preview-controls" style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', width: '100%', justifyContent: 'center' }}>
                {resultImage ? (
                  <>
                    <a
                      href={resultImage}
                      download="glamai_makeup.png"
                      className="btn btn-primary"
                      style={{ flex: 1, maxWidth: '200px' }}
                    >
                      <Download size={16} />
                      <span>Download</span>
                    </a>
                    <button className="btn btn-secondary" onClick={handleReset} style={{ flex: 1, maxWidth: '200px' }}>
                      <RefreshCw size={16} />
                      <span>Reset</span>
                    </button>
                  </>
                ) : (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Ready to apply. Press 'Apply AI Makeup' on the left.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- Real Transformations --- */}
      <div className="landing-section transformations-section">
        <div className="section-header">
          <span className="section-badge">✨ Showcase</span>
          <h2>Real Transformations</h2>
          <p>See the stunning blend and visual fidelity of our AI cosmetics engine.</p>
        </div>
        <div className="transformations-grid">
          {[
            { id: 1, title: 'Korean Peach Gloss', path: '/styles/makeup_korean.png', hot: true },
            { id: 2, title: 'Smoky Glam Vibe', path: '/styles/makeup_glam.png' },
            { id: 3, title: 'Champagne Bridal', path: '/styles/makeup_bridal.png' },
            { id: 4, title: 'Dewy Natural Glow', path: '/styles/makeup_natural.png' },
          ].map(tData => (
            <div key={tData.id} className="transformation-card-outer">
              <div className="transformation-card glass-panel" style={{ padding: '0.5rem' }}>
                <div className="transformation-image-wrapper" style={{ height: '220px', borderRadius: '12px', overflow: 'hidden' }}>
                  {tData.hot && <span className="transformation-hot-badge">TRENDING</span>}
                  <img src={tData.path} alt={tData.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              </div>
              <div className="transformation-card-title-bottom" style={{ marginTop: '0.5rem', fontWeight: 700, fontSize: '0.85rem' }}>
                {tData.title}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- Simple Process --- */}
      <div className="landing-section process-section">
        <div className="section-header">
          <span className="section-badge">⚡ Simple Process</span>
          <h2>4 Steps to Flawless Makeup</h2>
          <p>Get a virtual beauty makeover in a matter of seconds, directly from your browser.</p>
        </div>
        <div className="process-timeline">
          {[
            { num: '01', title: 'Upload Portrait', desc: 'Drag and drop a front-facing selfie with clear lighting.', icon: <Upload size={24} /> },
            { num: '02', title: 'Select Preset', desc: 'Choose from Korean Glow, Glam, Soft Girl, and more.', icon: <Palette size={24} /> },
            { num: '03', title: 'Cosmetic Tweaks', desc: 'Fine-tune lipstick color hues and eyeliner weights.', icon: <Sparkles size={24} /> },
            { num: '04', title: 'Save & Export', desc: 'Download your high-definition transformation instantly.', icon: <Download size={24} /> },
          ].map((step, idx) => (
            <div key={idx} className="process-card glass-panel">
              <div className="process-step-num">{step.num}</div>
              <div className="process-icon-box">{step.icon}</div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* --- Real Stories --- */}
      <div className="landing-section testimonials-section">
        <div className="section-header">
          <span className="section-badge">💬 Real Stories</span>
          <h2>Loved by Makeup Lovers</h2>
          <p>Read why users choose GlamAI to test cosmetic aesthetics risk-free.</p>
        </div>
        <div className="testimonials-grid">
          {[
            { name: 'Min-ji K.', meta: 'Korean Makeup Preset', avatar: '🌸', text: 'The Korean gradient lip tint is spot on! It maps to the contours of my lips perfectly without bleeding. Saved it to show my stylist.' },
            { name: 'Sarah L.', meta: 'Bridal Makeup Preset', avatar: '👰‍♀️', text: 'I designed my entire wedding look here. I was overwhelmed by choices, but the Champagne Bridal preview made it clear what suited me.' },
            { name: 'Chloe M.', meta: 'Euphoria Preset', avatar: '✨', text: 'The graphic eyeliner and gems look so real! Tested a neon graphic eye look for festival prep and got so many compliments.' }
          ].map((review, i) => (
            <div key={i} className="testimonial-card glass-panel">
              <div className="testimonial-stars">
                {[...Array(5)].map((_, si) => (
                  <Star key={si} size={14} fill="var(--color-pink-primary)" color="var(--color-pink-primary)" />
                ))}
              </div>
              <p className="testimonial-text">{review.text}</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar" style={{ background: 'var(--gradient-pink-purple)', color: '#fff' }}>
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

      {/* --- Why Choose Us --- */}
      <div className="landing-section why-choose-section">
        <div className="section-header">
          <span className="section-badge">🏆 Why Choose Us</span>
          <h2>State-of-the-Art Beauty Mapping</h2>
          <p>Our platform uses micro-contour alignment to replicate realistic makeup finishes.</p>
        </div>
        <div className="benefits-grid">
          {[
            { title: 'Subtle Pore Blending', desc: 'Applies foundations and contours while retaining natural skin pore textures.', icon: <Sparkles size={24} /> },
            { title: 'Smart Lip Fillers', desc: 'Tracks outer lips to overlay gloss, matte, and gradient pigments dynamically.', icon: <Palette size={24} /> },
            { title: 'High-Fidelity Eyeliners', desc: 'Clings to the lash line perfectly, rendering winged cat-eyes with zero jitter.', icon: <Check size={24} /> },
            { title: 'Privacy Guaranteed', desc: 'Photos are handled securely and processed safely. We never sell your photos.', icon: <Lock size={24} /> },
          ].map((b, idx) => (
            <div key={idx} className="benefit-card glass-panel">
              <div className="benefit-icon-wrapper">{b.icon}</div>
              <h3>{b.title}</h3>
              <p>{b.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* --- Got Questions? --- */}
      <div className="landing-section faq-section" style={{ background: 'transparent' }}>
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="section-header">
            <span className="section-badge">❓ Got Questions?</span>
            <h2>Common Makeup Inquiries</h2>
            <p>Answers to questions about our virtual cosmetic app.</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
            {[
              { q: 'Will the AI alter my facial bone structure?', a: 'No. Our AI only overlays cosmetics, eye shadow gradients, liners, and lipstick shades. Your underlying facial anatomy stays completely original.' },
              { q: 'Can I test lipstick glosses if my mouth is closed?', a: 'Yes! The biometric detector maps lip margins in closed, neutral, and smiling expressions for accurate lipstick application.' },
              { q: 'Can it render matte and glossy finishes separately?', a: 'Yes, presets like Natural use dewy glass skin finishes, while the Matte preset creates velvet skin with zero glare.' }
            ].map((item, idx) => {
              const isOpened = openFaq === idx;
              return (
                <div 
                  key={idx}
                  style={{
                    background: '#ffffff',
                    border: '1px solid rgba(255, 46, 147, 0.08)',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    transition: 'all 0.2s ease-in-out',
                    boxShadow: isOpened ? '0 10px 25px rgba(255, 46, 147, 0.04)' : 'none'
                  }}
                >
                  <button
                    onClick={() => toggleFaq(idx)}
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
                      {item.q}
                    </span>
                    {isOpened ? <ChevronUp size={18} color="var(--text-muted)" /> : <ChevronDown size={18} color="var(--text-muted)" />}
                  </button>
                  {isOpened && (
                    <div style={{ padding: '0 1.5rem 1.25rem 2.5rem', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.6', borderTop: '1px solid rgba(0,0,0,0.02)' }}>
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* --- Bottom CTA --- */}
      <div className="landing-section bottom-cta-section" style={{ background: 'rgba(255, 255, 255, 0.2)', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '680px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, background: 'var(--gradient-text)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '1rem' }}>
            Ready to Find Your Perfect style?
          </h2>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '2.5rem', lineHeight: '1.6' }}>
            Ditch the physical testing and chemical wipes. Instantly preview your flawless makeover template online.
          </p>
          <button className="btn btn-primary" onClick={() => window.scrollTo({ top: 380, behavior: 'smooth' })} style={{ padding: '1rem 2rem', fontSize: '1.05rem', boxShadow: '0 10px 20px var(--color-pink-glow)' }}>
            <span>Create Your Look Now</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
