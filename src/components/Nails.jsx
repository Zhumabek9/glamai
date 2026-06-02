import React, { useState, useRef } from 'react';
import { Upload, Sparkles, Coins, Download, RefreshCw, Check, Camera, Share2, Lock, Star, ArrowRight, HelpCircle, ChevronDown, ChevronUp, Palette, Heart } from 'lucide-react';
import { useToast } from './Toast';
import { authFetch } from '../apiClient';
import { useFavorites } from './Favorites';
import ShareStoriesModal from './ShareStoriesModal';

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

const SOCIAL_PROOF = [
  { name: 'Jess B.', look: 'Mirror Chrome', emoji: '💅', text: 'The silver chrome preview is extremely realistic — saved me from buying the wrong powder kit!' },
  { name: 'Maya S.', look: 'Gold Foil', emoji: '🌸', text: 'Showed the Gold Foil preview to my nail tech and she replicated it perfectly!' },
  { name: 'Taylor R.', look: 'Pink Marble', emoji: '✨', text: 'The coffin extension preview is so seamless. It gave me confidence in the shape choice.' },
  { name: 'Alicia M.', look: 'Aurora Glass', emoji: '💎', text: 'The color shift effect in the aurora glass nail is stunning — exactly what I wanted!' },
];

export default function Nails({ user, guestTokens, onDeductToken, onOpenAuth, onAddHistory, setActiveTab }) {
  const toast = useToast();
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [selectedPreset, setSelectedPreset] = useState('french');
  const [activeQuickPreset, setActiveQuickPreset] = useState(null);
  const [showStoriesModal, setShowStoriesModal] = useState(null);
  const { addFavorite, isFavorite } = useFavorites();
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

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const previewPanelRef = useRef(null);
  const sliderRef = useRef(null);

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
    setLoadingText('Uploading hand photo...');
    setEtaRemaining(30);

    const steps = [
      { prg: 20, txt: PROGRESS_STEPS[1] },
      { prg: 45, txt: PROGRESS_STEPS[2] },
      { prg: 65, txt: PROGRESS_STEPS[3] },
      { prg: 82, txt: PROGRESS_STEPS[4] },
      { prg: 93, txt: PROGRESS_STEPS[5] }
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
    }, 110);

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
        throw new Error(errData.error || 'Nail render failed');
      }

      const data = await res.json();
      setResultImage(data.imageUrl);
      setProgress(100);
      setSliderPosition(50);
      toast.success('AI Nails applied successfully! 💅');
      onDeductToken(tokenCost);

      onAddHistory({
        id: `history-nails-${Date.now()}`,
        original: image,
        result: data.imageUrl,
        style: presetObj ? presetObj.name : 'Nails',
        color: 'Nail Art',
        date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
      });

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

      <div className="playground-grid">
        {/* Left: Controls */}
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
            <div className="style-cards-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
              {NAIL_PRESETS.map(p => {
                const isSelected = selectedPreset === p.id;
                return (
                  <button
                    type="button"
                    key={p.id}
                    className={`style-card ${isSelected ? 'selected' : ''}`}
                    aria-pressed={isSelected}
                    aria-label={`Select: ${p.name}`}
                    onClick={() => { setSelectedPreset(p.id); setActiveQuickPreset(null); scrollToPreview(); }}
                    style={{ border: 'none', background: 'transparent', padding: '0.5rem', cursor: 'pointer', display: 'block', width: '100%', textAlign: 'left' }}
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

          <div style={{ marginTop: 'auto', paddingTop: '1.5rem' }}>
            <button
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.9rem', fontSize: '1rem' }}
              disabled={!image || isGenerating}
              onClick={handleGenerate}
            >
              <Sparkles size={18} />
              <span>{isGenerating ? `Generating... ${etaRemaining}s` : 'Apply AI Nails'}</span>
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
            <div
              className="dropzone"
              onClick={triggerUpload}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); triggerUpload(); } }}
              aria-label="Upload photo of your hand"
              style={{ cursor: 'pointer' }}
            >
              <div className="dropzone-icon"><Upload size={24} /></div>
              <h3>Upload a Photo of Your Hand</h3>
              <p>Upload a photo showing your fingers and nails clearly to apply templates.</p>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '0.75rem' }}>
                <button className="btn btn-primary" tabIndex={-1} onClick={(e) => { e.stopPropagation(); triggerUpload(); }}>
                  <Upload size={15} /><span>Upload Photo</span>
                </button>
                <button className="btn btn-secondary" tabIndex={-1} onClick={(e) => { e.stopPropagation(); triggerCamera(); }}>
                  <Camera size={15} /><span>Take Photo</span>
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '1rem', fontSize: '0.78rem', color: 'var(--text-muted)', justifyContent: 'center' }}>
                <Lock size={12} />
                <span>Your photo is fully secure. Auto-deleted within 1 hour.</span>
              </div>
              <input ref={fileInputRef} type="file" className="file-input" accept="image/*" onChange={handleFileChange} />
              <input ref={cameraInputRef} type="file" className="file-input" accept="image/*" capture="environment" onChange={handleFileChange} />
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
                    style={{ position: 'relative', width: '100%', maxWidth: '460px', height: '340px', borderRadius: '16px', overflow: 'hidden', cursor: 'ew-resize', userSelect: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}
                  >
                    <img src={resultImage} alt="AI Nails Result" style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }} />
                    <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', background: 'rgba(255,46,147,0.85)', color: '#fff', fontSize: '0.65rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '4px' }}>AFTER</div>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: `${sliderPosition}%`, height: '100%', overflow: 'hidden', borderRight: '2px solid #fff' }}>
                      <img src={image} alt="Before Nails" style={{ width: sliderRef.current ? sliderRef.current.getBoundingClientRect().width + 'px' : '460px', height: '340px', objectFit: 'cover', maxWidth: 'none', pointerEvents: 'none' }} />
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
                      <button onClick={() => { setFeedback('like'); setFeedbackSubmitted(true); toast.success('Thank you! 💅'); }} style={{ fontSize: '1.2rem', background: 'none', border: 'none', cursor: 'pointer' }}>👍</button>
                      <button onClick={() => { setFeedback('dislike'); setFeedbackSubmitted(true); toast.success('Thanks for helping us improve!'); }} style={{ fontSize: '1.2rem', background: 'none', border: 'none', cursor: 'pointer' }}>👎</button>
                    </div>
                  )}
                  {feedbackSubmitted && <div style={{ fontSize: '0.85rem', color: 'var(--color-pink-primary)' }}>Thank you for your feedback! ✨</div>}

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <a href={resultImage} download="glamai_nails.png" className="btn btn-primary" style={{ flex: 1, minWidth: '120px', maxWidth: '160px' }}>
                      <Download size={15} /><span>Download</span>
                    </a>
                    <button
                      className="btn btn-secondary"
                      style={{ flex: 1, minWidth: '100px', maxWidth: '130px' }}
                      onClick={() => {
                        const id = 'nails-' + Date.now();
                        addFavorite({ id, result: resultImage, style: selectedPreset ? NAIL_PRESETS.find(p => p.id === selectedPreset)?.name : 'Nail Art', category: '💅 Nails', date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) });
                        toast.success('Saved to favourites ❤️');
                      }}
                    >
                      <Heart size={15} /><span>Save</span>
                    </button>
                    <button className="btn btn-secondary" onClick={() => setShowStoriesModal({ url: resultImage, styleName: selectedPreset ? NAIL_PRESETS.find(p => p.id === selectedPreset)?.name || 'Nail Art' : 'Nail Art' })} style={{ flex: 1, minWidth: '100px', maxWidth: '130px' }}>
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
                    <img src={image} alt="Nails Preview" style={{ maxWidth: '100%', height: 'auto', display: 'block', maxHeight: '460px', objectFit: 'contain' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <button className="btn btn-secondary" onClick={triggerUpload} style={{ fontSize: '0.8rem' }}><Upload size={14} /><span>Change Photo</span></button>
                    <button className="btn btn-secondary" onClick={triggerCamera} style={{ fontSize: '0.8rem' }}><Camera size={14} /><span>Take Photo</span></button>
                    <button className="btn btn-secondary" onClick={handleReset} style={{ fontSize: '0.8rem' }}><RefreshCw size={14} /><span>Reset</span></button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    <Lock size={12} /><span>Your photo is fully secure. Auto-deleted within 1 hour.</span>
                  </div>
                </>
              )}
              <input ref={fileInputRef} type="file" className="file-input" accept="image/*" onChange={handleFileChange} />
              <input ref={cameraInputRef} type="file" className="file-input" accept="image/*" capture="environment" onChange={handleFileChange} />
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

      {/* Testimonials */}
      <div className="landing-section testimonials-section">
        <div className="section-header">
          <span className="section-badge">💬 Real Stories</span>
          <h2>Loved by Nail Artists</h2>
          <p>See why users use GlamAI to draft manicure ideas and choose templates.</p>
        </div>
        <div className="testimonials-grid">
          {[
            { name: 'Jess B.', meta: 'Mirror Chrome Set', avatar: '💅', text: 'I wanted to see if mirror silver chrome suited my skin tone before buying a powder kit. Extremely realistic!' },
            { name: 'Maya S.', meta: 'Luxury Gold Foil', avatar: '🌸', text: 'Showed the Gold Foil design preview to my nail technician. She was impressed and replicated it perfectly.' },
            { name: 'Taylor R.', meta: 'Pink Marble Acrylics', avatar: '✨', text: 'The coffin extension preview looked so seamless. Gives a clean impression of length without glue on fingers.' }
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
