import React, { useState, useRef, useEffect } from 'react';
import { Upload, Sparkles, Coins, Download, RefreshCw, Check, Camera, Share2, Lock, Star, ArrowRight, HelpCircle, ChevronDown, ChevronUp, Palette, Smile, Flame, Heart, Wind } from 'lucide-react';
import { useToast } from './Toast';
import { authFetch } from '../apiClient';
import { useFavorites } from './Favorites';
import ShareStoriesModal from './ShareStoriesModal';

const MAKEUP_PRESETS = [
  { id: 'bronze', name: 'Sunkissed Bronze', image: '/styles/makeup_bronze.png', desc: 'Warm golden tones, radiant bronzed highlights, and a dewy beach glow.' },
  { id: 'clean-girl', name: 'Clean Girl', image: '/styles/makeup_clean_girl.png', desc: 'Minimalist editorial look, fresh hyper-hydrated skin, and natural definition.' },
  { id: 'y2k', name: 'Y2K Shimmer', image: '/styles/makeup_y2k.png', desc: 'Frosty pastel eyeshadows, high-shine wet lip gloss, and a classic late-90s vibe.' },
  { id: 'beige', name: 'Nude Beige', image: '/styles/makeup_beige.png', desc: 'Neutral beige eyeshadow, soft contours, and natural nude lip.' },
  { id: 'soft-glam', name: 'Soft Glam', image: '/styles/makeup_soft_glam.png', desc: 'Warm brown smoky eyes, neutral lips, and radiant finish.' },
  { id: 'doll-like', name: 'Doll Porcelain', image: '/styles/makeup_doll_like.png', desc: 'Pink flushed cheeks, defined long lashes, and glossy pink lips.' },
  { id: 'elegant', name: 'Timeless Elegance', image: '/styles/makeup_elegant.png', desc: 'Sophisticated look, classic thin eyeliner, and soft rose lips.' },
  { id: 'girlish', name: 'Petal Pink', image: '/styles/makeup_girlish.png', desc: 'Cute baby pink blush and glossy pink gradient lips.' },
  { id: 'grunge-rock', name: 'Edgy Grunge', image: '/styles/makeup_grunge_rock.png', desc: 'Dark smoky eyeshadow, bold brown/nude matte lip.' },
  { id: 'matte', name: 'Velvet Matte', image: '/styles/makeup_matte.png', desc: 'Flawless velvet skin, nude matte lip, structured contours.' },
  { id: 'seductive', name: 'Cat Eye', image: '/styles/makeup_seductive.png', desc: 'Dramatic winged cat eyeliner, sharp contour, and dark bold lips.' },
  { id: 'glossy-lips', name: 'Glass Lips', image: '/styles/makeup_glossy_lips.png', desc: 'Simple glass skin paired with high-shine wet lip gloss.' },
  { id: 'siren-eyes', name: 'Siren Eyes', image: '/styles/makeup_siren_eyes.png', desc: 'Elongated winged liner, smoked out edges, and dramatic lifted eyes.' },
  { id: 'latte-makeup', name: 'Latte Contour', image: '/styles/makeup_latte_makeup.png', desc: 'Warm caramel tones, soft brown smoky eyes, and nude glossy lips.' }
];

const QUICK_PRESETS = [
  { id: 'office', name: 'Office Chic', icon: '💼', preset: 'clean-girl' },
  { id: 'date', name: 'Date Night', icon: '💅', preset: 'soft-glam' },
  { id: 'bold', name: 'Bold & Bright', icon: '💋', preset: 'siren-eyes' },
  { id: 'natural', name: 'Natural Glow', icon: '🌸', preset: 'bronze' },
];

const LIPSTICKS = [
  { id: 'none', name: 'None', hex: '#888888' },
  { id: 'glazed-donut', name: 'Glazed Donut', hex: '#fef3f8' },
  { id: 'velvet-red', name: 'Velvet Red', hex: '#b71c1c' },
  { id: 'satin-rosewood', name: 'Satin Rosewood', hex: '#a1695e' },
  { id: 'metallic-berry', name: 'Berry', hex: '#5d0032' },
  { id: 'soft-coral', name: 'Soft Coral', hex: '#f08080' }
];

const EYELINERS = [
  { id: 'none', name: 'None' },
  { id: 'classic', name: 'Classic' },
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
  { id: 'soft-lavender', name: 'Soft Lavender' }
];

const PROGRESS_STEPS = [
  '⬆️ Uploading selfie to AI engine...',
  '🔍 Scanning facial landmarks...',
  '💄 Mapping lips, eyes & skin contours...',
  '🎨 Blending cosmetic filters...',
  '✨ Matching lighting & skin textures...',
  '🌟 Refining makeup layers...'
];

const SOCIAL_PROOF = [
  { name: 'Min-ji K.', look: 'Korean Glow', emoji: '🌸', text: 'The glass skin effect is unbelievable – tried it for my wedding day look!' },
  { name: 'Sarah L.', look: 'Soft Glam', emoji: '💄', text: 'Saved me from buying 5 wrong shades. This app paid for itself!' },
  { name: 'Chloe M.', look: 'Siren Eyes', emoji: '✨', text: 'Festival makeup perfect! The winged liner preview is spot-on.' },
  { name: 'Amara J.', look: 'Natural Glow', emoji: '👑', text: 'Finally found my perfect shade of nude before committing to a product.' },
];

export default function Makeup({ user, guestTokens, onDeductToken, onOpenAuth, onAddHistory, setActiveTab }) {
  const toast = useToast();
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [selectedPreset, setSelectedPreset] = useState('bronze');
  const [activeQuickPreset, setActiveQuickPreset] = useState(null);
  const [showStoriesModal, setShowStoriesModal] = useState(null);
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();
  const [selectedLipstick, setSelectedLipstick] = useState('none');
  const [selectedEyeliner, setSelectedEyeliner] = useState('none');
  const [selectedEyeshadow, setSelectedEyeshadow] = useState('none');
  const [selectedBlush, setSelectedBlush] = useState('none');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('');
  const [etaRemaining, setEtaRemaining] = useState(30);
  const [resultImage, setResultImage] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [showFixedCta, setShowFixedCta] = useState(true);

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const previewPanelRef = useRef(null);
  const sliderRef = useRef(null);

  // Monitor scroll positioning to hide/show the mobile floating button appropriately
  useEffect(() => {
    const handleScroll = () => {
      if (!previewPanelRef.current) return;
      const rect = previewPanelRef.current.getBoundingClientRect();
      if (rect.top >= 0 && rect.top <= window.innerHeight * 0.7) {
        setShowFixedCta(false);
      } else {
        setShowFixedCta(true);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) loadImage(file);
  };

  const loadImage = (file) => {
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setImage(event.target.result);
      setResultImage(null);
      setFeedback(null);
      setFeedbackSubmitted(false);
      scrollToPreview();
    };
    reader.readAsDataURL(file);
  };

  const triggerUpload = () => fileInputRef.current.click();
  const triggerCamera = () => cameraInputRef.current.click();

  const scrollToPreview = () => {
    if (window.innerWidth <= 900 && previewPanelRef.current) {
      setTimeout(() => {
        previewPanelRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  const handleApplyQuickPreset = (qp) => {
    setActiveQuickPreset(qp.id);
    setSelectedPreset(qp.preset);
    toast.success(`"${qp.name}" preset applied!`);
    scrollToPreview();
  };

  const handleShare = async () => {
    const shareData = { title: 'My AI Makeup — GlamAI', text: 'Check out my AI makeup transformation!', url: 'https://glamai.app' };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch (err) { if (err.name !== 'AbortError') toast.error('Sharing failed.'); }
    } else {
      try { await navigator.clipboard.writeText('https://glamai.app'); toast.success('Link copied!'); } catch { toast.error('Could not copy link.'); }
    }
  };

  // Slider interaction
  const handleSliderMove = (clientX) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(pct);
  };

  const handleGenerate = async () => {
    const isPremium = user && user.subscriptionTier === 'premium';
    const tokenCost = isPremium ? 0 : 10;
    const isGuest = !user || user.isGuest;
    const availableTokens = isGuest ? (guestTokens ?? 0) : (user?.tokens ?? 0);

    setFeedback(null);
    setFeedbackSubmitted(false);

    if (isGuest && availableTokens < 10) {
      toast.error('Free generation used up! Sign up to get more tokens.');
      onOpenAuth();
      return;
    }
    if (!isGuest && !isPremium && availableTokens < 10) {
      toast.error('You need at least 10 tokens!');
      setActiveTab('pricing');
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setLoadingText('Uploading selfie to AI engine...');
    setEtaRemaining(30);

    const steps = [
      { prg: 15, txt: PROGRESS_STEPS[1] },
      { prg: 35, txt: PROGRESS_STEPS[2] },
      { prg: 55, txt: PROGRESS_STEPS[3] },
      { prg: 75, txt: PROGRESS_STEPS[4] },
      { prg: 90, txt: PROGRESS_STEPS[5] }
    ];

    const etaInterval = setInterval(() => {
      setEtaRemaining(prev => prev <= 1 ? 1 : prev - 1);
    }, 1000);

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

      const res = await authFetch('/api/generate', { method: 'POST', body: formData });

      clearInterval(interval);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        if (errData.code === 'LOGIN_REQUIRED') {
          toast.error('Free generation used up! Sign up to continue.');
          onOpenAuth();
          setIsGenerating(false);
          clearInterval(etaInterval);
          return;
        }
        throw new Error(errData.error || 'Failed to render makeup');
      }

      const data = await res.json();
      setResultImage(data.imageUrl);
      setProgress(100);
      setSliderPosition(50);
      toast.success('AI Makeup rendered successfully!');
      onDeductToken(tokenCost);

      onAddHistory({
        id: `history-makeup-${Date.now()}`,
        original: image,
        result: data.imageUrl,
        style: presetObj ? presetObj.name : 'Makeup',
        color: lipstickObj ? lipstickObj.name : 'Lipstick',
        date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
      });

      // Scroll to result on mobile
      scrollToPreview();

    } catch (err) {
      clearInterval(interval);
      toast.error(err.message || 'AI Makeup generation failed.');
    } finally {
      setIsGenerating(false);
      clearInterval(etaInterval);
    }
  };

  const handleFeedback = (type) => {
    setFeedback(type);
    if (type === 'like') {
      setFeedbackSubmitted(true);
      toast.success('Thank you for your rating! ❤️');
    }
  };

  const handleReset = () => {
    setImage(null);
    setImageFile(null);
    setResultImage(null);
    setFeedback(null);
    setFeedbackSubmitted(false);
  };

  return (
    <section className="playground-section container animate-fade-in">
      {/* Hero Section */}
      <div className="category-landing-hero">
        <div className="glowing-orb pink-orb"></div>
        <div className="glowing-orb purple-orb"></div>
        <h1 className="landing-title">
          <span className="gradient-text">AI Makeup Studio</span>
        </h1>
        <p className="landing-subtitle">
          Try luxury lipsticks, eyeliners, and makeup presets tailored to your unique skin tone — no smudge, no commitment.
        </p>
        <div className="landing-stats">
          <div className="stat-badge"><Sparkles size={14} color="var(--color-pink-primary)" /><span>Biometric Tone Matching</span></div>
          <div className="stat-badge"><span>💄 14 Makeup Presets</span></div>
          <div className="stat-badge"><Lock size={14} color="var(--color-pink-primary)" /><span>Privacy Protected</span></div>
        </div>
      </div>

      <div className="playground-grid">
        {/* Left: Controls */}
        <div className="control-panel glass-panel">
          <div className="desktop-playground-header">
            <h2 className="section-title">
              <Sparkles size={20} color="var(--color-pink-primary)" />
              <span>AI Makeup Workspace</span>
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Choose a quick preset or customize every detail.
            </p>
          </div>

          <hr style={{ border: 'none', borderBottom: '1px solid rgba(255,255,255,0.08)', margin: '1rem 0' }} />

          {/* QUICK PRESETS */}
          <div className="selector-group">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span className="selector-title" style={{ marginBottom: 0 }}>⚡ QUICK PRESETS</span>
              <button
                type="button"
                title="Random preset"
                onClick={() => {
                  const random = MAKEUP_PRESETS[Math.floor(Math.random() * MAKEUP_PRESETS.length)];
                  setSelectedPreset(random.id);
                  setActiveQuickPreset(null);
                  toast.success(`🎲 Random: ${random.name}`);
                  scrollToPreview();
                }}
                style={{ background: 'rgba(255,46,147,0.1)', border: '1px solid rgba(255,46,147,0.25)', borderRadius: '8px', padding: '0.3rem 0.6rem', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--color-pink-primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem', transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,46,147,0.2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,46,147,0.1)'}
              >
                🎲 Random
              </button>
            </div>
            <div className="smart-presets-row">
              {QUICK_PRESETS.map(qp => (
                <button
                  type="button"
                  key={qp.id}
                  className={`preset-chip ${activeQuickPreset === qp.id ? 'active' : ''}`}
                  onClick={() => handleApplyQuickPreset(qp)}
                >
                  <span>{qp.icon}</span>
                  <span>{qp.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Preset Cards */}
          <div className="selector-group">
            <span className="selector-title">SELECT MAKEUP LOOK</span>
            <div className="style-cards-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              {MAKEUP_PRESETS.map(p => {
                const isSelected = selectedPreset === p.id;
                return (
                  <button
                    type="button"
                    key={p.id}
                    className={`style-card ${isSelected ? 'selected' : ''}`}
                    aria-pressed={isSelected}
                    aria-label={`Select: ${p.name}`}
                    onClick={() => { setSelectedPreset(p.id); setActiveQuickPreset(null); scrollToPreview(); }}
                    style={{ border: 'none', background: 'transparent', padding: '0.5rem', cursor: 'pointer', width: '100%', textAlign: 'left' }}
                  >
                    {isSelected && <div className="selected-badge"><Check size={12} /></div>}
                    <div className="style-card-image-wrapper">
                      <img src={p.image} alt={p.name} className="style-card-img" />
                      <div className="style-card-overlay"></div>
                    </div>
                    <div className="style-card-footer" style={{ fontSize: '0.72rem', fontWeight: 700 }}>{p.name}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Lipstick */}
          <div className="selector-group">
            <span className="selector-title">LIPSTICK SHADE</span>
            <div className="pill-grid">
              {LIPSTICKS.map(l => (
                <button type="button" key={l.id} className={`pill-option ${selectedLipstick === l.id ? 'selected' : ''}`} onClick={() => setSelectedLipstick(l.id)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', border: 'none', font: 'inherit', cursor: 'pointer' }}>
                  <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: l.hex, border: '1px solid rgba(0,0,0,0.15)', flexShrink: 0 }} />
                  <span>{l.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Eyeliner */}
          <div className="selector-group">
            <span className="selector-title">EYELINER STYLE</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
              {EYELINERS.map(e => (
                <button key={e.id} className={`btn ${selectedEyeliner === e.id ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '0.5rem 0.75rem', fontSize: '0.75rem' }} onClick={() => setSelectedEyeliner(e.id)}>{e.name}</button>
              ))}
            </div>
          </div>

          {/* Eyeshadow */}
          <div className="selector-group">
            <span className="selector-title">EYESHADOW PALETTE</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
              {EYESHADOWS.map(es => (
                <button key={es.id} className={`btn ${selectedEyeshadow === es.id ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '0.5rem 0.75rem', fontSize: '0.75rem' }} onClick={() => setSelectedEyeshadow(es.id)}>{es.name}</button>
              ))}
            </div>
          </div>

          {/* Blush */}
          <div className="selector-group">
            <span className="selector-title">BLUSH & HIGHLIGHTER</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
              {BLUSHES.map(b => (
                <button key={b.id} className={`btn ${selectedBlush === b.id ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '0.5rem 0.75rem', fontSize: '0.75rem' }} onClick={() => setSelectedBlush(b.id)}>{b.name}</button>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 'auto', paddingTop: '1.5rem' }}>
            <button
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.9rem', fontSize: '1rem' }}
              disabled={!image || isGenerating}
              onClick={handleGenerate}
            >
              <Sparkles size={18} />
              <span>{isGenerating ? `Generating... ${etaRemaining}s` : 'Apply AI Makeup'}</span>
            </button>
          </div>
        </div>

        {/* Right: Preview Panel */}
        <div className="preview-panel glass-panel" ref={previewPanelRef}>
          {isGenerating && (
            <div className="loading-overlay">
              <div className="spinner-outer">
                <div className="spinner-inner"></div>
              </div>
              <div className="progress-track">
                <div className="progress-bar" style={{ width: `${progress}%` }}></div>
              </div>
              <span className="loading-text">{loadingText}</span>
              <span className="loading-subtext">{progress}% • ~{etaRemaining}s remaining</span>
            </div>
          )}

          {!image ? (
            <div className="dropzone" onClick={triggerUpload} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); triggerUpload(); } }} aria-label="Upload photo" style={{ cursor: 'pointer' }}>
              <div className="dropzone-icon"><Upload size={24} /></div>
              <h3>Upload Your Selfie</h3>
              <p>Upload a clear, front-facing portrait to apply beauty makeup filters.</p>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '0.75rem' }}>
                <button className="btn btn-primary" tabIndex={-1} onClick={(e) => { e.stopPropagation(); triggerUpload(); }}>
                  <Upload size={15} /> <span>Upload Photo</span>
                </button>
                <button className="btn btn-secondary" tabIndex={-1} onClick={(e) => { e.stopPropagation(); triggerCamera(); }}>
                  <Camera size={15} /> <span>Take Photo</span>
                </button>
              </div>
              {/* Privacy Badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '1rem', fontSize: '0.78rem', color: 'var(--text-muted)', justifyContent: 'center' }}>
                <Lock size={12} />
                <span>Your photo is fully secure. Auto-deleted within 1 hour.</span>
              </div>
              <input ref={fileInputRef} type="file" className="file-input" accept="image/*" onChange={handleFileChange} />
              <input ref={cameraInputRef} type="file" className="file-input" accept="image/*" capture="user" onChange={handleFileChange} />
            </div>
          ) : (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              {resultImage ? (
                <>
                  {/* Before/After Slider */}
                  <div
                    ref={sliderRef}
                    onMouseMove={(e) => { if (e.buttons === 1) handleSliderMove(e.clientX); }}
                    onTouchMove={(e) => { e.preventDefault(); if (e.touches.length > 0) handleSliderMove(e.touches[0].clientX); }}
                    style={{ position: 'relative', width: '100%', maxWidth: '460px', height: '360px', borderRadius: '16px', overflow: 'hidden', cursor: 'ew-resize', userSelect: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}
                  >
                    <img src={resultImage} alt="After Makeup" style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }} />
                    <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', background: 'rgba(255,46,147,0.85)', color: '#fff', fontSize: '0.65rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '4px' }}>AFTER</div>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: `${sliderPosition}%`, height: '100%', overflow: 'hidden', borderRight: '2px solid #fff' }}>
                      <img src={image} alt="Before Makeup" style={{ width: sliderRef.current ? sliderRef.current.getBoundingClientRect().width + 'px' : '460px', height: '360px', objectFit: 'cover', maxWidth: 'none', pointerEvents: 'none' }} />
                      <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: '0.65rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '4px' }}>BEFORE</div>
                    </div>
                    <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${sliderPosition}%`, width: '2px', background: '#fff', transform: 'translateX(-50%)', pointerEvents: 'none' }}>
                      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '32px', height: '32px', background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', color: 'var(--color-pink-primary)', fontWeight: 'bold' }}>⇔</div>
                    </div>
                  </div>

                  {/* Feedback */}
                  {!feedbackSubmitted && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                      <span>Love the result?</span>
                      <button onClick={() => handleFeedback('like')} style={{ fontSize: '1.2rem', background: 'none', border: 'none', cursor: 'pointer' }}>👍</button>
                      <button onClick={() => handleFeedback('dislike')} style={{ fontSize: '1.2rem', background: 'none', border: 'none', cursor: 'pointer' }}>👎</button>
                    </div>
                  )}
                  {feedbackSubmitted && <div style={{ fontSize: '0.85rem', color: 'var(--color-pink-primary)' }}>Thank you for your feedback! ✨</div>}

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <a href={resultImage} download="glamai_makeup.png" className="btn btn-primary" style={{ flex: 1, minWidth: '120px', maxWidth: '160px' }}>
                      <Download size={15} /><span>Download</span>
                    </a>
                    <button
                      className="btn btn-secondary"
                      style={{ flex: 1, minWidth: '100px', maxWidth: '130px', color: isFavorite('makeup-result') ? '#ff2e93' : undefined }}
                      onClick={() => {
                        const id = 'makeup-' + Date.now();
                        if (isFavorite(id)) { removeFavorite(id); toast.success('Removed from favourites'); }
                        else { addFavorite({ id, result: resultImage, style: selectedPreset ? MAKEUP_PRESETS.find(p => p.id === selectedPreset)?.name : 'Makeup', category: '💄 Makeup', date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) }); toast.success('Saved to favourites ❤️'); }
                      }}
                    >
                      <Heart size={15} /><span>Save</span>
                    </button>
                    <button className="btn btn-secondary" onClick={() => setShowStoriesModal({ url: resultImage, styleName: selectedPreset ? MAKEUP_PRESETS.find(p => p.id === selectedPreset)?.name || 'Makeup Look' : 'Makeup Look' })} style={{ flex: 1, minWidth: '100px', maxWidth: '130px' }}>
                      <Share2 size={15} /><span>Stories</span>
                    </button>
                    <button className="btn btn-secondary" onClick={handleReset} style={{ flex: 1, minWidth: '80px', maxWidth: '110px' }}>
                      <RefreshCw size={15} /><span>Reset</span>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="preview-container" style={{ position: 'relative', overflow: 'hidden', borderRadius: '16px', background: '#000', maxWidth: '450px', width: '100%', margin: '0 auto' }}>
                    <img src={image} alt="Makeup Preview" style={{ maxWidth: '100%', height: 'auto', display: 'block', maxHeight: '460px', objectFit: 'contain' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <button className="btn btn-secondary" onClick={triggerUpload} style={{ fontSize: '0.8rem' }}>
                      <Upload size={14} /><span>Change Photo</span>
                    </button>
                    <button className="btn btn-secondary" onClick={triggerCamera} style={{ fontSize: '0.8rem' }}>
                      <Camera size={14} /><span>Take Photo</span>
                    </button>
                    <button className="btn btn-secondary" onClick={handleReset} style={{ fontSize: '0.8rem' }}>
                      <RefreshCw size={14} /><span>Reset</span>
                    </button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    <Lock size={12} /><span>Your photo is fully secure. Auto-deleted within 1 hour.</span>
                  </div>
                </>
              )}
              <input ref={fileInputRef} type="file" className="file-input" accept="image/*" onChange={handleFileChange} />
              <input ref={cameraInputRef} type="file" className="file-input" accept="image/*" capture="user" onChange={handleFileChange} />
            </div>
          )}
        </div>
      </div>

      {/* Social Proof Scroll */}
      <div style={{ margin: '2rem 0', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', minWidth: 'max-content' }}>
          {SOCIAL_PROOF.map((s, i) => (
            <div key={i} style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '1rem', minWidth: '220px', maxWidth: '250px' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{s.emoji}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', lineHeight: '1.5' }}>"{s.text}"</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-pink-primary)' }}>{s.name} · {s.look}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Real Transformations */}
      <div className="landing-section transformations-section">
        <div className="section-header">
          <span className="section-badge">✨ Showcase</span>
          <h2>See the Magic in Action</h2>
          <p>Real AI makeup transformations in high definition.</p>
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
              <div className="transformation-card-title-bottom" style={{ marginTop: '0.5rem', fontWeight: 700, fontSize: '0.85rem' }}>{tData.title}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <div className="landing-section testimonials-section">
        <div className="section-header">
          <span className="section-badge">💬 Real Stories</span>
          <h2>Loved by Makeup Lovers</h2>
          <p>Read why users choose GlamAI to test cosmetic aesthetics risk-free.</p>
        </div>
        <div className="testimonials-grid">
          {[
            { name: 'Min-ji K.', meta: 'Korean Makeup Preset', avatar: '🌸', text: 'The Korean gradient lip tint is spot on! Saved it to show my stylist.' },
            { name: 'Sarah L.', meta: 'Bridal Makeup Preset', avatar: '👰‍♀️', text: 'I designed my entire wedding look here. The Champagne Bridal preview made the decision so easy.' },
            { name: 'Chloe M.', meta: 'Euphoria Preset', avatar: '✨', text: 'The graphic eyeliner looks so real! Perfect for festival prep.' }
          ].map((review, i) => (
            <div key={i} className="testimonial-card glass-panel">
              <div className="testimonial-stars">{[...Array(5)].map((_, si) => (<Star key={si} size={14} fill="var(--color-pink-primary)" color="var(--color-pink-primary)" />))}</div>
              <p className="testimonial-text">{review.text}</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar" style={{ background: 'var(--gradient-pink-purple)', color: '#fff' }}>{review.avatar}</div>
                <div className="testimonial-author-info">
                  <span className="testimonial-name">{review.name}</span>
                  <span className="testimonial-meta">{review.meta}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="landing-section faq-section" style={{ background: 'transparent' }}>
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="section-header">
            <span className="section-badge">❓ Got Questions?</span>
            <h2>Common Makeup Inquiries</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
            {[
              { q: 'Will the AI alter my facial bone structure?', a: 'No. Our AI only overlays cosmetics — eye shadow, liners, and lipstick. Your underlying facial anatomy stays completely original.' },
              { q: 'Can I test lipstick if my mouth is closed?', a: 'Yes! The biometric detector maps lip margins in closed, neutral, and smiling expressions for accurate lipstick application.' },
              { q: 'Can it render matte and glossy finishes separately?', a: 'Yes — presets like Natural use dewy glass skin finishes, while the Matte preset creates a velvet skin look.' }
            ].map((item, idx) => {
              const isOpened = openFaq === idx;
              return (
                <div key={idx} style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '16px', overflow: 'hidden' }}>
                  <button onClick={() => toggleFaq(idx)} style={{ width: '100%', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                    <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <HelpCircle size={16} color="var(--color-pink-primary)" style={{ flexShrink: 0 }} />
                      {item.q}
                    </span>
                    {isOpened ? <ChevronUp size={18} color="var(--text-muted)" /> : <ChevronDown size={18} color="var(--text-muted)" />}
                  </button>
                  {isOpened && (
                    <div style={{ padding: '0 1.5rem 1.25rem 2.5rem', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.6', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="landing-section bottom-cta-section" style={{ textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '680px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, background: 'var(--gradient-text)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '1rem' }}>
            Find Your Perfect Makeup Look
          </h2>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: '1.6' }}>
            Instantly preview your flawless makeover. No physical testing, no expensive buyer's remorse.
          </p>
          <button className="btn btn-primary" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ padding: '1rem 2rem', fontSize: '1rem', boxShadow: '0 10px 20px var(--color-pink-glow)' }}>
            <span>Create Your Look Now</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* Mobile Fixed CTA */}
      {image && !isGenerating && showFixedCta && (
        <div className="mobile-generate-cta">
          <button 
            type="button"
            className="btn btn-primary"
            onClick={() => { handleGenerate(); scrollToPreview(); }}
          >
            <Sparkles size={18} style={{ marginRight: '0.5rem' }} />
            <span>Apply AI Makeup</span>
            <span style={{ fontSize: '0.8rem', opacity: 0.8, marginLeft: '0.25rem' }}>
              (-10 Tokens)
            </span>
          </button>
        </div>
      )}

      {showStoriesModal && (
        <ShareStoriesModal
          imageUrl={showStoriesModal.url}
          styleName={showStoriesModal.styleName}
          onClose={() => setShowStoriesModal(null)}
        />
      )}
    </section>
  );
}
