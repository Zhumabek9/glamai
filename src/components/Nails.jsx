import React, { useState, useRef, useEffect } from 'react';
import { Upload, Sparkles, Coins, Download, RefreshCw, Check, Camera, Share2, Lock, Star, ArrowRight, HelpCircle, ChevronDown, ChevronUp, Palette, Heart } from 'lucide-react';
import { useToast } from './Toast';
import { authFetch } from '../apiClient';
import { useFavorites } from './Favorites';
import ShareStoriesModal from './ShareStoriesModal';
import SliderComparison from './SliderComparison';
import confetti from 'canvas-confetti';

const NAIL_PRESETS = [
  { id: 'french', name: 'French Tip', image: '/styles/nails_french.png', desc: 'Classic nude pink base with clean, crisp white crescent tips.' },
  { id: 'chrome', name: 'Silver Chrome', image: '/styles/nails_chrome.png', desc: 'High-wattage liquid metal chrome finish with cool silver undertones.' },
  { id: 'acrylic', name: 'Pink Marble', image: '/styles/nails_acrylic.png', desc: 'Sculpted coffin extensions with luxurious pink-and-white marble veins.' },
  { id: 'luxury', name: 'Gold Foil', image: '/styles/nails_luxury.png', desc: 'Bespoke manicure with gold leaf flecks and subtle diamond-like accents.' },
  { id: 'minimal', name: 'Nude Minimal', image: '/styles/nails_minimal.png', desc: 'Sheer glossy nude top coat over short natural nails.' },
  { id: 'pink', name: 'Soft Blush', image: '/styles/nails_pink.png', desc: 'Sweet, opaque pastel cotton-candy pink gel polish.' },
  { id: 'black', name: 'Goth Black', image: '/styles/nails_black.png', desc: 'Deep obsidian black lacquer with a mirror-shine gloss coat.' },
  { id: 'cat-eye', name: 'Cat-Eye', image: '/styles/nails_cat_eye.png', desc: 'Magnetic dimensional velvet polish that shifts in the light.' },
  { id: 'aurora', name: 'Aurora Glass', image: '/styles/nails_aurora.png', desc: 'Iridescent pearl glaze with shifting lilac and teal reflections.' }
];

const QUICK_PRESETS = [
  { id: 'office', name: 'Office Chic', icon: '💼', preset: 'french', shape: 'square', texture: 'glossy-gel' },
  { id: 'date', name: 'Date Night', icon: '💅', preset: 'pink', shape: 'almond', texture: 'glossy-gel' },
  { id: 'bold', name: 'Bold & Edgy', icon: '🔥', preset: 'black', shape: 'coffin', texture: 'velvet-matte' },
  { id: 'glam', name: 'Full Glam', icon: '✨', preset: 'chrome', shape: 'stiletto', texture: 'liquid-chrome' },
];

const NAIL_SHAPES = [
  { id: 'almond', name: 'Almond' },
  { id: 'coffin', name: 'Coffin' },
  { id: 'stiletto', name: 'Stiletto' },
  { id: 'square', name: 'Square' },
  { id: 'round', name: 'Round' }
];

const NAIL_TEXTURES = [
  { id: 'liquid-chrome', name: 'Liquid Chrome' },
  { id: 'glazed-donut', name: 'Glazed Donut' },
  { id: 'marble-foil', name: 'Marble Foil' },
  { id: 'glossy-gel', name: 'Glossy Gel' },
  { id: 'velvet-matte', name: 'Velvet Matte' }
];

const PROGRESS_STEPS = [
  '⬆️ Uploading hand photo...',
  '🔍 Detecting hands and fingers...',
  '✂️ Isolating fingernail coordinates...',
  '🎨 Applying digital nail extensions...',
  '💅 Matching gloss & highlights...',
  '✨ Refining lighting details...'
];


function Nails({ user, guestTokens, onDeductToken, onOpenAuth, onAddHistory, setActiveTab }) {
  const toast = useToast();
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [selectedPreset, setSelectedPreset] = useState('french');
  const [activeQuickPreset, setActiveQuickPreset] = useState(null);
  const [showStoriesModal, setShowStoriesModal] = useState(null);
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();
  const [selectedShape, setSelectedShape] = useState('almond');
  const [selectedTexture, setSelectedTexture] = useState('glossy-gel');
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

  const isGuest = !user || user.isGuest;

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

  const toggleFaq = (index) => setOpenFaq(openFaq === index ? null : index);

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

  const handleFileChange = (e) => { const file = e.target.files[0]; if (file) loadImage(file); };
  const triggerUpload = () => fileInputRef.current.click();
  const triggerCamera = () => cameraInputRef.current.click();

  const scrollToPreview = () => {
    if (window.innerWidth <= 900 && previewPanelRef.current) {
      setTimeout(() => previewPanelRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }
  };

  const handleApplyQuickPreset = (qp) => {
    setActiveQuickPreset(qp.id);
    setSelectedPreset(qp.preset);
    setSelectedShape(qp.shape);
    setSelectedTexture(qp.texture);
    toast.success(`"${qp.name}" preset applied!`);
    scrollToPreview();
  };

  const handleSliderMove = (clientX) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    setSliderPosition(pct);
  };

  const handleShare = async () => {
    const shareData = { title: 'My AI Nails — GlamAI', text: 'Check out my AI nail transformation!', url: 'https://glamai.app' };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch (err) { if (err.name !== 'AbortError') toast.error('Sharing failed.'); }
    } else {
      try { await navigator.clipboard.writeText('https://glamai.app'); toast.success('Link copied!'); } catch { toast.error('Could not copy.'); }
    }
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
      toast.error('You need at least 10 tokens to generate nails!');
      setActiveTab('pricing');
      return;
    }

    setIsGenerating(true);
    setProgress(10);
    setLoadingText('Uploading hand photo...');
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
      const presetObj = NAIL_PRESETS.find(n => n.id === selectedPreset);
      const shapeObj = NAIL_SHAPES.find(s => s.id === selectedShape);
      const textureObj = NAIL_TEXTURES.find(t => t.id === selectedTexture);

      let nailsDesc = `${presetObj ? presetObj.name : 'Classic'} design.`;
      if (shapeObj) nailsDesc += ` Shape: ${shapeObj.name}.`;
      if (textureObj) nailsDesc += ` Texture: ${textureObj.name}.`;

      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('taskType', 'nails');
      formData.append('nails', nailsDesc);
      formData.append('gender', 'female');

      // 3. Post request to backend prediction API
      const res = await authFetch('/api/generate', { method: 'POST', body: formData });
      clearInterval(interval);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Nail render failed');
      }

      const data = await res.json();
      
      if (data.success) {
        const newId = 'nails-' + Date.now();
        setCurrentResultId(newId);
        setResultImage(data.imageUrl);
        setProgress(100);
        setSliderPosition(50);
        toast.success('AI Nails applied successfully! 💅');
        
        // Deduct credits locally (skip for unlimited subscription plans)
        if (!isUnlimited) {
          onDeductToken(10);
        }

        onAddHistory({
          id: `history-nails-${Date.now()}`,
          original: image,
          result: data.imageUrl,
          style: presetObj ? presetObj.name : 'Nails',
          color: 'Nail Art',
          date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
        });

        // 4. Save new match to local storage history list
        const newMatch = {
          id: `match_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
          timestamp: Date.now(),
          date: new Date().toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" }),
          code: selectedPreset,
          name: presetObj ? presetObj.name : 'Custom Nails',
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
        throw new Error(data.error || 'Nail render failed');
      }

      scrollToPreview();

    } catch (err) {
      clearInterval(interval);
      toast.error(err.message || 'AI Nails render failed.');
    } finally {
      setIsGenerating(false);
      clearInterval(etaInterval);
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
      {/* Hero */}
      <div className="category-landing-hero">
        <div className="glowing-orb pink-orb"></div>
        <div className="glowing-orb purple-orb"></div>
        <h1 className="landing-title">
          <span className="gradient-text">AI Nail Studio</span>
        </h1>
        <p className="landing-subtitle">
          Try liquid chrome, french tips, marble acrylics, or bespoke nail art in real time — zero dry time, zero salon commitment.
        </p>
        <div className="landing-stats">
          <div className="stat-badge"><Sparkles size={14} color="var(--color-pink-primary)" /><span>9 Premium Designs</span></div>
          <div className="stat-badge"><span>💅 5 Nail Shapes</span></div>
          <div className="stat-badge"><Lock size={14} color="var(--color-pink-primary)" /><span>Privacy Protected</span></div>
        </div>
      </div>

      {/* Try free notification banner */}
      <div className="try-free-banner">
        <span>Try free — no sign-up needed · 1 free trial instantly</span>
      </div>

      <div className="playground-grid">
        {/* Left Side: Customizer Controls */}
        <div className="control-panel glass-panel">
          <div className="desktop-playground-header">
            <h2 className="section-title">
              <Sparkles size={20} color="var(--color-pink-primary)" />
              <span>AI Nails Workspace</span>
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Pick a quick preset or customize your nail look.
            </p>
          </div>

          <hr style={{ border: 'none', borderBottom: '1px solid rgba(255,255,255,0.08)', margin: '1rem 0' }} />

          {/* QUICK PRESETS */}
          <div className="selector-group">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span className="selector-title" style={{ marginBottom: 0 }}>⚡ QUICK PRESETS</span>
              <button
                type="button"
                title="Random nail design"
                onClick={() => {
                  const random = NAIL_PRESETS[Math.floor(Math.random() * NAIL_PRESETS.length)];
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
            <span className="selector-title">SELECT NAIL DESIGN</span>
            <div className="style-cards-grid">
              {NAIL_PRESETS.map(p => {
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

          {/* Nail Shape */}
          <div className="selector-group">
            <span className="selector-title">NAIL SHAPE</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
              {NAIL_SHAPES.map(s => (
                <button key={s.id} className={`btn ${selectedShape === s.id ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '0.5rem 0.75rem', fontSize: '0.75rem' }} onClick={() => setSelectedShape(s.id)}>
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          {/* Nail Texture */}
          <div className="selector-group">
            <span className="selector-title">NAIL TEXTURE</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
              {NAIL_TEXTURES.map(tObj => (
                <button key={tObj.id} className={`btn ${selectedTexture === tObj.id ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '0.5rem 0.75rem', fontSize: '0.75rem' }} onClick={() => setSelectedTexture(tObj.id)}>
                  {tObj.name}
                </button>
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

        {/* Right Side: Upload and Result Viewer */}
        <div className="preview-panel glass-panel" ref={previewPanelRef}>
          <div className="preview-header">
            <span className="preview-title-uppercase">YOUR NEW AI GENERATED NAILS</span>
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
              <div className="demo-comparison-wrapper">
                <SliderComparison
                  beforeSrc="/trending_nails_before.png"
                  afterSrc="/trending_nails.png"
                  title="Demo Nails"
                  hideActions={true}
                />
              </div>
            ) : resultImage ? (
              <div style={{ width: '100%' }}>
                <SliderComparison
                  beforeSrc={image}
                  afterSrc={resultImage}
                  title={selectedPreset ? NAIL_PRESETS.find(p => p.id === selectedPreset)?.name : 'Nails'}
                  onShare={() => setShowStoriesModal({ url: resultImage, styleName: selectedPreset ? NAIL_PRESETS.find(p => p.id === selectedPreset)?.name || 'Nail Art' : 'Nail Art' })}
                  onDownload={() => {}}
                  hideActions={false}
                />

                {!feedbackSubmitted && (
                  <div className="feedback-panel">
                    <span className="feedback-title">Did you like the result?</span>
                    <div className="feedback-buttons">
                      <button onClick={() => { setFeedback('like'); setFeedbackSubmitted(true); toast.success('Thank you! 💅'); }} className="feedback-btn positive">👍 Yes</button>
                      <button onClick={() => { setFeedback('dislike'); setFeedbackSubmitted(true); toast.success('Thanks for helping us improve!'); }} className="feedback-btn negative">👎 No</button>
                    </div>
                  </div>
                )}
                {feedbackSubmitted && <div className="feedback-panel"><span className="feedback-thanks">Thank you for your feedback! ✨</span></div>}

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
                          style: selectedPreset ? NAIL_PRESETS.find(p => p.id === selectedPreset)?.name : 'Nail Art', 
                          category: '💅 Nails', 
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
                  <img src={image} alt="Nails Preview" style={{ width: '100%', display: 'block', borderRadius: '12px' }} />
                </div>
              </div>
            )}
          </div>

          {/* Upload dropzone */}
          {!image ? (
            <div 
              className="dropzone-modern"
              onClick={triggerUpload}
              style={{ cursor: 'pointer' }}
            >
              <div className="dropzone-icon">
                <Upload size={28} />
              </div>
              <h3>Upload a Photo of Your Hand</h3>
              <p className="dropzone-subtext">JPEG, PNG, or WebP - Max 10MB</p>
              <p className="dropzone-hint">Drag & drop or click to upload</p>
              
              <input ref={fileInputRef} type="file" className="file-input" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
              <input ref={cameraInputRef} type="file" className="file-input" accept="image/*" capture="environment" onChange={handleFileChange} style={{ display: 'none' }} />
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
                <input ref={cameraInputRef} type="file" className="file-input" accept="image/*" capture="environment" onChange={handleFileChange} style={{ display: 'none' }} />
              </div>
            )
          )}

          {/* Generate Button */}
          {!resultImage && (
            <div className="generate-action-box">
              <button 
                className="btn btn-primary generate-btn-large" 
                disabled={!image || isGenerating}
                onClick={() => { handleGenerate(); }}
              >
                <Sparkles size={18} />
                <span>Apply AI Nails</span>
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

      {/* See the Magic in Action */}
      <div className="landing-section transformations-section">
        <div className="section-header">
          <span className="section-badge">✨ Showcase</span>
          <h2>See the Magic in Action</h2>
          <p>Inspect the realistic glossy overlays and perfect alignments of our AI nail styling.</p>
        </div>
        <div className="transformations-grid">
          {[
            { id: 1, title: 'Mirror Silver Chrome', path: '/styles/nails_chrome.png', hot: true },
            { id: 2, title: 'Pink Marble Acrylics', path: '/styles/nails_acrylic.png' },
            { id: 3, title: 'Luxury Gold Foil Leaf', path: '/styles/nails_luxury.png' },
            { id: 4, title: 'Classic French Manicure', path: '/styles/nails_french.png' },
          ].map(tData => (
            <div key={tData.id} className="transformation-card-outer">
              <div className="transformation-card glass-panel" style={{ padding: '0.5rem' }}>
                <div className="transformation-image-wrapper" style={{ height: '220px', borderRadius: '12px', overflow: 'hidden' }}>
                  {tData.hot && <span className="transformation-hot-badge">POPULAR</span>}
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
            <h2>Common Nail Inquiries</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
            {[
              { q: 'Do I need to show my whole hand in the picture?', a: 'Showing your fingers flat from a top-down angle under clear natural light works best for the fingertip tracking.' },
              { q: 'Does it work if I already have nail polish on?', a: 'Yes! The AI overrides existing colors and designs, masking them completely with the selected template.' },
              { q: 'Can I choose nail length parameters?', a: 'Currently length is managed by preset styles, ranging from short minimal gels to long coffin acrylics.' }
            ].map((item, idx) => {
              const isOpened = openFaq === idx;
              return (
                <div key={idx} style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '16px', overflow: 'hidden' }}>
                  <button onClick={() => toggleFaq(idx)} style={{ width: '100%', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                    <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'flex-start', gap: '0.5rem', flex: 1, paddingRight: '1rem', minWidth: '0' }}>
                      <HelpCircle size={16} color="var(--color-pink-primary)" style={{ flexShrink: 0, marginTop: '3px' }} />
                      <span style={{ flex: 1, minWidth: '0' }}>{item.q}</span>
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
            Style Your Nails Now
          </h2>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: '1.6' }}>
            Preview your next manicure design and find the perfect color balance for your hands.
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
            <span>Apply AI Nails</span>
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


export default React.memo(Nails);
