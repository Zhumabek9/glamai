import React, { useState, useRef, useEffect } from 'react';
import { Upload, Sparkles, Coins, Download, RefreshCw, Check, Camera, Share2, Lock, Star, ArrowRight, HelpCircle, ChevronDown, ChevronUp, Palette, Smile, Flame, Heart, Wind } from 'lucide-react';
import { useToast } from './Toast';
import { authFetch } from '../apiClient';
import { useFavorites } from './Favorites';
import ShareStoriesModal from './ShareStoriesModal';
import SliderComparison from './SliderComparison';
import confetti from 'canvas-confetti';

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


function Makeup({ user, guestTokens, onDeductToken, onOpenAuth, onAddHistory, setActiveTab, styleContext, setStyleContext }) {
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
  const [sliderWidth, setSliderWidth] = useState(0);
  const [currentResultId, setCurrentResultId] = useState(null);

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const previewPanelRef = useRef(null);
  const sliderRef = useRef(null);

  useEffect(() => {
    if (!sliderRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setSliderWidth(entry.contentRect.width);
      }
    });
    observer.observe(sliderRef.current);
    return () => observer.disconnect();
  }, [resultImage]);

  // Handle incoming style context from face scanner or blog
  useEffect(() => {
    if (styleContext && styleContext.taskType === 'makeup') {
      const styleName = styleContext.style.toLowerCase();
      const matched = MAKEUP_PRESETS.find(p => 
        p.id.toLowerCase() === styleName ||
        p.name.toLowerCase() === styleName ||
        p.name.toLowerCase().includes(styleName) ||
        styleName.includes(p.name.toLowerCase())
      );
      if (matched) {
        setSelectedPreset(matched.id);
        toast.success(`Makeup preset pre-selected: ${matched.name}`);
      } else {
        toast.info(`Makeup selected: ${styleContext.style}`);
      }
      setStyleContext(null);
    }
  }, [styleContext, setStyleContext, toast]);

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
    const isGuest = !user || user.isGuest;
    const availableTokens = isGuest ? (guestTokens ?? 0) : (user?.tokens ?? 0);

    setFeedback(null);
    setFeedbackSubmitted(false);

    // 1. Check user authentication before generation
    const isSignedIn = !isGuest;
    if (!isSignedIn) {
      onOpenAuth();
      return;
    }

    // 2. Check client-side credits (unless the account is unlimited)
    const isUnlimited = user?.subscriptionTier === 'premium' && user?.subscriptionStatus === 'active';
    if (!isUnlimited && availableTokens < 10) {
      toast.error('You need at least 10 tokens to generate makeup!');
      setActiveTab('pricing');
      return;
    }

    setIsGenerating(true);
    setProgress(10);
    setLoadingText('Uploading selfie to AI engine...');
    setEtaRemaining(30);

    // Smooth scroll to preview on mobile screen widths
    setTimeout(() => {
      if (typeof window !== "undefined" && window.innerWidth < 1024 && previewPanelRef.current) {
        previewPanelRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);

    const steps = [
      { prg: 25, txt: PROGRESS_STEPS[1] },
      { prg: 45, txt: PROGRESS_STEPS[2] },
      { prg: 70, txt: PROGRESS_STEPS[3] },
      { prg: 85, txt: PROGRESS_STEPS[4] },
      { prg: 95, txt: PROGRESS_STEPS[5] }
    ];

    const etaInterval = setInterval(() => {
      setEtaRemaining(prev => prev <= 1 ? 1 : prev - 1);
    }, 1000);

    let currentStep = 0;
    
    // Progress steps animation timer
    const interval = setInterval(() => {
      setProgress(prev => {
        const nextVal = prev + 10;
        if (currentStep < steps.length && nextVal >= steps[currentStep].prg) {
          setLoadingText(steps[currentStep].txt);
          currentStep++;
        }
        if (nextVal >= 90) return 90;
        return nextVal;
      });
    }, 400);

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

      // 3. Post request to backend prediction API
      const res = await authFetch('/api/generate', { method: 'POST', body: formData });

      clearInterval(interval);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to render makeup');
      }

      const data = await res.json();
      
      if (data.success) {
        const newId = 'makeup-' + Date.now();
        setCurrentResultId(newId);
        setResultImage(data.imageUrl);
        setProgress(100);
        setSliderPosition(50);
        toast.success('AI Makeup rendered successfully!');
        
        // Deduct credits locally (skip for unlimited subscription plans)
        if (!isUnlimited) {
          onDeductToken(10);
        }

        onAddHistory({
          id: `history-makeup-${Date.now()}`,
          original: image,
          result: data.imageUrl,
          style: presetObj ? presetObj.name : 'Makeup',
          color: lipstickObj ? lipstickObj.name : 'Lipstick',
          date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
        });

        // 4. Save new match to local storage history list
        const newMatch = {
          id: `match_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
          timestamp: Date.now(),
          date: new Date().toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" }),
          code: selectedPreset,
          name: presetObj ? presetObj.name : 'Custom Makeup',
          matchRate: `${Math.floor(88 + Math.random() * 11)}%`,
          img: data.imageUrl
        };
        const storageKey = user ? `levante_matches_${user.id}` : "levante_matches";
        const existingMatches = JSON.parse(localStorage.getItem(storageKey) || "[]");
        const filteredMatches = existingMatches.filter(m => m.code !== newMatch.code);
        localStorage.setItem(storageKey, JSON.stringify([newMatch, ...filteredMatches].slice(0, 10)));

        // Success confetti animation
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.8 },
          colors: ["#6D28D9", "#EC4899", "#ffffff"]
        });
      } else {
        throw new Error(data.error || 'Failed to render makeup');
      }

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
    setCurrentResultId(null);
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

      {/* Try free notification banner */}
      <div className="try-free-banner">
        <span>Try free — no sign-up needed · 1 free trial instantly</span>
      </div>

      <div className="playground-grid">
        {/* Right Side: Customizer Controls */}
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
            <div className="style-cards-grid">
              {MAKEUP_PRESETS.map(p => {
                const isSelected = selectedPreset === p.id;
                return (
                  <button
                    type="button"
                    key={p.id}
                    className={`style-card ${isSelected ? 'selected' : ''}`}
                    aria-pressed={isSelected}
                    aria-label={`Select: ${p.name}`}
                    onClick={() => { setSelectedPreset(p.id); setActiveQuickPreset(null); }}
                    style={{ border: 'none', background: 'transparent', padding: 0, cursor: 'pointer', width: '100%', textAlign: 'left' }}
                  >
                    {isSelected && <div className="selected-badge"><Check size={12} /></div>}
                    <div className="style-card-image-wrapper">
                      <img src={p.image} alt={p.name} className="style-card-img" loading="lazy" decoding="async" />
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
            <span className="selector-title">BLUSH & SKIN GLOW</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
              {BLUSHES.map(b => (
                <button key={b.id} className={`btn ${selectedBlush === b.id ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '0.5rem 0.75rem', fontSize: '0.75rem' }} onClick={() => setSelectedBlush(b.id)}>{b.name}</button>
              ))}
            </div>
          </div>

          {/* Token usage info */}
          <div style={{ marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                {isGuest ? `Free credits left: ${guestTokens ?? 0}` : `Credits left: ${user?.tokens ?? 0}`}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-pink-primary)', fontWeight: 700 }}>
                This render: 10 Tokens
              </span>
            </div>
          </div>
        </div>

        {/* Left Side: Upload and Result Viewer */}
        <div className="preview-panel glass-panel" ref={previewPanelRef}>
          <div className="preview-header">
            <span className="preview-title-uppercase">YOUR NEW AI GENERATED MAKEUP</span>
          </div>

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

          {/* Comparison / Main Viewer Block */}
          <div className="preview-viewer-area">
            {!image ? (
              /* Demo State: comparison slider using public makeup images */
              <div className="demo-comparison-wrapper">
                <SliderComparison
                  beforeSrc="/trending_makeup_before.png"
                  afterSrc="/trending_makeup.png"
                  title="Demo Makeup"
                  hideActions={true}
                />
              </div>
            ) : resultImage ? (
              <div style={{ width: '100%' }}>
                <SliderComparison
                  beforeSrc={image}
                  afterSrc={resultImage}
                  title={selectedPreset ? MAKEUP_PRESETS.find(p => p.id === selectedPreset)?.name : 'Makeup'}
                  onShare={() => setShowStoriesModal({ url: resultImage, styleName: selectedPreset ? MAKEUP_PRESETS.find(p => p.id === selectedPreset)?.name || 'Makeup Look' : 'Makeup Look' })}
                  onDownload={() => {}}
                  hideActions={false}
                />

                {/* Feedback */}
                {!feedbackSubmitted && (
                  <div className="feedback-panel">
                    <span className="feedback-title">Did you like the result?</span>
                    <div className="feedback-buttons">
                      <button onClick={() => handleFeedback('like')} className="feedback-btn positive">👍 Yes</button>
                      <button onClick={() => handleFeedback('dislike')} className="feedback-btn negative">👎 No</button>
                    </div>
                  </div>
                )}
                {feedbackSubmitted && <div className="feedback-panel"><span className="feedback-thanks">Thank you for your feedback! ✨</span></div>}

                {/* Additional Actions */}
                <div className="preview-controls-row">
                  <button
                    className="btn btn-secondary"
                    style={{ color: (currentResultId && isFavorite(currentResultId)) ? '#ff2e93' : undefined }}
                    onClick={() => {
                      if (!currentResultId) return;
                      if (isFavorite(currentResultId)) { 
                        removeFavorite(currentResultId); 
                        toast.success('Removed from favourites'); 
                      } else { 
                        addFavorite({ 
                          id: currentResultId, 
                          result: resultImage, 
                          style: selectedPreset ? MAKEUP_PRESETS.find(p => p.id === selectedPreset)?.name : 'Makeup', 
                          category: '💄 Makeup', 
                          date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) 
                        }); 
                        toast.success('Saved to favourites ❤️'); 
                      }
                    }}
                  >
                    <Heart size={15} /><span>Save Favourite</span>
                  </button>
                  <button className="btn btn-secondary" onClick={handleReset}>
                    <RefreshCw size={15} /><span>Try Another Style</span>
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                <div className="preview-container" style={{ maxWidth: '450px', width: '100%', margin: '0 auto' }}>
                  <img src={image} alt="Makeup Preview" style={{ width: '100%', display: 'block', borderRadius: '12px' }} />
                </div>
              </div>
            )}
          </div>

          {/* Upload dropzone (rendered below comparison image) */}
          {!image ? (
            <div 
              className="dropzone-modern"
              onClick={triggerUpload}
              style={{ cursor: 'pointer' }}
            >
              <div className="dropzone-icon">
                <Upload size={28} />
              </div>
              <h3>Upload Your Selfie</h3>
              <p className="dropzone-subtext">JPEG, PNG, or WebP - Max 10MB</p>
              <p className="dropzone-hint">Drag & drop or click to upload</p>
              
              <input ref={fileInputRef} type="file" className="file-input" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
              <input ref={cameraInputRef} type="file" className="file-input" accept="image/*" capture="user" onChange={handleFileChange} style={{ display: 'none' }} />
            </div>
          ) : (
            !isGenerating && (
              <div className="upload-actions-bar">
                <button type="button" className="btn btn-secondary btn-sm" onClick={triggerCamera}>
                  <Camera size={14} />
                  <span>Take Photo</span>
                </button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={triggerUpload}>
                  <Upload size={14} />
                  <span>Upload File</span>
                </button>
                <button type="button" className="btn btn-secondary btn-sm btn-danger-text" onClick={handleReset}>
                  <span>Delete Photo</span>
                </button>
                
                <input ref={fileInputRef} type="file" className="file-input" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                <input ref={cameraInputRef} type="file" className="file-input" accept="image/*" capture="user" onChange={handleFileChange} style={{ display: 'none' }} />
              </div>
            )
          )}

          {/* Generate Button (positioned under upload dropzone) */}
          {!resultImage && (
            <div className="generate-action-box">
              <button 
                className="btn btn-primary generate-btn-large" 
                disabled={!image || isGenerating}
                onClick={() => { handleGenerate(); }}
              >
                <Sparkles size={18} />
                <span>Apply AI Makeup</span>
                <span className="generate-btn-cost">
                  (-10 Tokens)
                </span>
              </button>
              
              <div className="generate-helper-links">
                {isGuest ? (
                  <>
                    <button type="button" className="helper-link" onClick={onOpenAuth}>Sign In</button>
                    <span className="helper-separator">·</span>
                    <button type="button" className="helper-link" onClick={() => setActiveTab('pricing')}>Purchase credits to continue</button>
                  </>
                ) : (
                  <button type="button" className="helper-link" onClick={() => setActiveTab('pricing')}>Purchase credits to continue</button>
                )}
              </div>
            </div>
          )}

          {/* Privacy Trust Badge */}
          <div className="privacy-trust-badge" style={{ justifyContent: 'center', marginTop: '1rem' }}>
            <span>🔒 Your photo is fully secure. Auto-deleted within 1 hour.</span>
          </div>
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


export default React.memo(Makeup);
