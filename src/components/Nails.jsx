import t from '../utils/i18n';
import React, { useState, useRef, useEffect } from 'react';
import { Upload, Sparkles, RefreshCw, Check, Camera, Lock, ArrowRight, HelpCircle, ChevronDown, ChevronUp, Heart } from 'lucide-react';
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

const FINGER_COLORS = [
  { id: 'default', name: 'Default', hex: 'linear-gradient(45deg, #ff2e93, #a855f7)' },
  { id: 'candy-pink', name: 'Candy Pink', hex: '#ff69b4' },
  { id: 'obsidian-black', name: 'Obsidian Black', hex: '#111111' },
  { id: 'pure-white', name: 'Pure White', hex: '#ffffff' },
  { id: 'silver-shimmer', name: 'Silver Shimmer', hex: '#d3d3d3' },
  { id: 'gold-leaf', name: 'Gold Leaf', hex: '#ffd700' },
  { id: 'royal-blue', name: 'Royal Blue', hex: '#4169e1' },
  { id: 'lavender', name: 'Lavender', hex: '#e6e6fa' },
  { id: 'emerald-green', name: 'Emerald', hex: '#50c878' }
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
  const [activeFinger, setActiveFinger] = useState('all'); // 'all', 'thumb', 'index', 'middle', 'ring', 'pinky'
  const [fingerCustomizations, setFingerCustomizations] = useState({
    thumb: { preset: 'french', color: 'default' },
    index: { preset: 'french', color: 'default' },
    middle: { preset: 'french', color: 'default' },
    ring: { preset: 'french', color: 'default' },
    pinky: { preset: 'french', color: 'default' }
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('');
  const [etaRemaining, setEtaRemaining] = useState(30);
  const [resultImage, setResultImage] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [showFixedCta, setShowFixedCta] = useState(true);
  const [currentResultId, setCurrentResultId] = useState(null);

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const previewPanelRef = useRef(null);

  const isGuest = !user || user.isGuest;

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



  const handleGenerate = async () => {
    const isGuest = !user || user.isGuest;
    const availableTokens = isGuest ? (guestTokens ?? 0) : (user?.tokens ?? 0);

    setFeedback(null);
    setFeedbackSubmitted(false);

    // Guest with no tokens left — ask to sign up
    if (isGuest && availableTokens < 10) {
      toast.error('You have used your free generation! Sign up to get more tokens.');
      onOpenAuth();
      return;
    }

    // Logged-in user with no tokens — redirect to pricing
    const isUnlimited = false; // VIP subscriptions now spend credits instead of having infinite generations
    if (!isGuest && !isUnlimited && availableTokens < 10) {
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
      const textureObj = NAIL_TEXTURES.find(tex => tex.id === selectedTexture);

      let nailsDesc = '';
      if (activeFinger === 'all') {
        nailsDesc = `${presetObj ? presetObj.name : 'Classic'} design.`;
      } else {
        nailsDesc = 'Custom multi-finger design: ';
        const fingerKeys = ['thumb', 'index', 'middle', 'ring', 'pinky'];
        const parts = [];
        fingerKeys.forEach(f => {
          const config = fingerCustomizations[f];
          const fPreset = NAIL_PRESETS.find(n => n.id === config.preset);
          const fColor = FINGER_COLORS.find(c => c.id === config.color);
          const presetName = fPreset ? fPreset.name : 'Classic';
          const colorName = fColor && fColor.id !== 'default' ? fColor.name : 'matching shade';
          parts.push(`${f} finger has ${presetName} design in ${colorName}`);
        });
        nailsDesc += parts.join(', ') + '.';
      }
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
        // Result ID is managed by server or created locally inside event handler, not render body.
        setResultImage(data.imageUrl);
        setProgress(100);
        toast.success('AI Nails applied successfully! 💅');
        
        // Deduct credits locally (skip for unlimited subscription plans)
        if (!isUnlimited) {
          onDeductToken(10);
        }

        onAddHistory({
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
          <span className="gradient-text">{t('audit.nails.aiNailStudio')}</span>
        </h1>
        <p className="landing-subtitle">
          {t('audit.nails.landingSubtitle')}
        </p>
        <div className="landing-stats">
          <div className="stat-badge"><Sparkles size={14} color="var(--color-pink-primary)" /><span>{t('audit.nails.9PremiumDesigns')}</span></div>
          <div className="stat-badge"><span>{t('audit.nails.5NailShapes')}</span></div>
          <div className="stat-badge"><Lock size={14} color="var(--color-pink-primary)" /><span>{t('audit.makeup.privacyProtected')}</span></div>
        </div>
      </div>

      {/* Try free notification banner */}
      {isGuest && (
        <div className="try-free-banner">
          <span>{t('audit.makeup.tryFreeNoSignupNeeded1FreeTria')}</span>
        </div>
      )}

      <div className="playground-grid">
        {/* Left Side: Customizer Controls */}
        <div className="control-panel glass-panel">
          <div className="desktop-playground-header">
            <h2 className="section-title">
              <Sparkles size={20} color="var(--color-pink-primary)" />
              <span>{t('audit.nails.aiNailsWorkspace')}</span>
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {t('audit.nails.workspaceDesc')}
            </p>
          </div>

          <hr style={{ border: 'none', borderBottom: '1px solid rgba(255,255,255,0.08)', margin: '1rem 0' }} />

          {/* QUICK PRESETS */}
          <div className="selector-group">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span className="selector-title" style={{ marginBottom: 0 }}>{t('audit.makeup.quickPresets')}</span>
              <button
                type="button"
                title={t('audit.nails.randomNailDesign')}
                onClick={() => {
                  const random = NAIL_PRESETS[Math.floor(Math.random() * NAIL_PRESETS.length)];
                  setSelectedPreset(random.id);
                  setActiveQuickPreset(null);
                  toast.success(`🎲 ${t('audit.nails.random')}: ${random.name}`);
                  scrollToPreview();
                }}
                style={{ background: 'rgba(255,46,147,0.1)', border: '1px solid rgba(255,46,147,0.25)', borderRadius: '8px', padding: '0.3rem 0.6rem', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--color-pink-primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem', transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,46,147,0.2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,46,147,0.1)'}
              >
                🎲 {t('audit.nails.randomBtn')}
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

          {/* Design Mode Selector */}
          <div className="selector-group">
            <span className="selector-title">{t('audit.nails.designMode') || 'Design Mode'}</span>
            <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', padding: '0.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <button
                type="button"
                className={`btn ${activeFinger === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1, padding: '0.5rem 0.75rem', fontSize: '0.8rem', borderRadius: '10px' }}
                onClick={() => {
                  setActiveFinger('all');
                  toast.info(t('audit.nails.switchedToGlobal') || 'Switched to global design mode');
                }}
              >
                🖐️ {t('audit.nails.allFingers') || 'All Fingers'}
              </button>
              <button
                type="button"
                className={`btn ${activeFinger !== 'all' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1, padding: '0.5rem 0.75rem', fontSize: '0.8rem', borderRadius: '10px' }}
                onClick={() => {
                  setActiveFinger('thumb');
                  toast.info(t('audit.nails.switchedToMultiFinger') || 'Multi-Finger mode activated: Select a finger below.');
                }}
              >
                🎨 {t('audit.nails.customizeFingers') || 'Customize per Finger'}
              </button>
            </div>
          </div>

          {/* Preset Cards & Finger customizer panel */}
          {activeFinger === 'all' ? (
            <div className="selector-group">
              <span className="selector-title">{t('audit.nails.selectNailDesign')}</span>
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
          ) : (
            <div className="selector-group">
              <span className="selector-title">{t('audit.nails.selectActiveFinger') || 'Select Finger to Design'}</span>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.35rem', overflowX: 'auto', paddingBottom: '0.5rem', marginTop: '0.5rem' }}>
                {['thumb', 'index', 'middle', 'ring', 'pinky'].map(finger => {
                  const isSelected = activeFinger === finger;
                  const config = fingerCustomizations[finger];
                  const presetObj = NAIL_PRESETS.find(n => n.id === config.preset);
                  const colorObj = FINGER_COLORS.find(c => c.id === config.color);
                  const emoji = finger === 'thumb' ? '🖐️' : finger === 'index' ? '☝️' : finger === 'middle' ? '🖕' : finger === 'ring' ? '💍' : '🤙';
                  
                  return (
                    <button
                      type="button"
                      key={finger}
                      onClick={() => setActiveFinger(finger)}
                      className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ 
                        flex: 1, 
                        padding: '0.6rem 0.5rem', 
                        fontSize: '0.72rem', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        gap: '0.3rem', 
                        borderRadius: '12px',
                        minWidth: '65px',
                        border: isSelected ? '1px solid var(--color-pink-primary)' : '1px solid rgba(255,255,255,0.08)'
                      }}
                    >
                      <span style={{ fontSize: '1.1rem' }}>{emoji}</span>
                      <span style={{ textTransform: 'capitalize', fontWeight: 700 }}>{t(`audit.nails.${finger}`) || finger}</span>
                      <span style={{ fontSize: '0.6rem', opacity: 0.7, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {presetObj ? presetObj.name : 'French'}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Finger customization workspace */}
              <div className="finger-customizer-panel animate-fade-in" style={{ 
                background: 'rgba(255, 255, 255, 0.02)', 
                border: '1px solid rgba(255, 255, 255, 0.06)', 
                borderRadius: '16px', 
                padding: '1rem',
                marginTop: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                    ⚙️ {t(`audit.nails.${activeFinger}`) || activeFinger} Settings
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setFingerCustomizations(prev => ({
                        ...prev,
                        [activeFinger]: { preset: selectedPreset, color: 'default' }
                      }));
                      toast.success(t('audit.nails.resetToGlobal') || `Reset ${activeFinger} to global preset.`);
                    }}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    {t('audit.nails.resetBtn')}
                  </button>
                </div>

                {/* Finger Preset Pattern */}
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                    {t('audit.nails.stepPattern')}
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem' }}>
                    {NAIL_PRESETS.map(p => {
                      const isSelected = fingerCustomizations[activeFinger]?.preset === p.id;
                      return (
                        <button
                          type="button"
                          key={p.id}
                          onClick={() => {
                            setFingerCustomizations(prev => ({
                              ...prev,
                              [activeFinger]: { ...prev[activeFinger], preset: p.id }
                            }));
                          }}
                          style={{
                            background: isSelected ? 'rgba(255,46,147,0.1)' : 'rgba(255,255,255,0.02)',
                            border: isSelected ? '1px solid var(--color-pink-primary)' : '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '10px',
                            padding: '0.4rem',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.25rem',
                            textAlign: 'center',
                            transition: 'all 0.2s'
                          }}
                        >
                          <img src={p.image} alt={p.name} style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} />
                          <span style={{ fontSize: '0.65rem', color: isSelected ? 'var(--color-pink-primary)' : 'var(--text-secondary)', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>{p.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Finger Custom Color */}
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                    {t('audit.nails.stepColor')}
                  </span>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {FINGER_COLORS.map(c => {
                      const isSelected = (fingerCustomizations[activeFinger]?.color || 'default') === c.id;
                      return (
                        <button
                          type="button"
                          key={c.id}
                          title={c.name}
                          onClick={() => {
                            setFingerCustomizations(prev => ({
                              ...prev,
                              [activeFinger]: { ...prev[activeFinger], color: c.id }
                            }));
                          }}
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            background: c.hex,
                            border: isSelected ? '2px solid #fff' : '1px solid rgba(255,255,255,0.2)',
                            cursor: 'pointer',
                            transform: isSelected ? 'scale(1.15)' : 'none',
                            boxShadow: isSelected ? '0 0 8px var(--color-pink-primary)' : 'none',
                            transition: 'all 0.2s'
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Nail Shape */}
          <div className="selector-group">
            <span className="selector-title">{t('audit.nails.nailShape')}</span>
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
            <span className="selector-title">{t('audit.nails.nailTexture')}</span>
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
                {isGuest ? `${t('audit.makeup.freeCreditsLeft')}: ${guestTokens ?? 0}` : `${t('audit.makeup.creditsLeft')}: ${user?.tokens ?? 0}`}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-pink-primary)', fontWeight: 700 }}>
                {t('audit.nails.thisRenderTokens')}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Upload and Result Viewer */}
        <div className="preview-panel glass-panel" ref={previewPanelRef}>
          <div className="preview-header">
            <span className="preview-title-uppercase">{t('audit.nails.yourNewAiGeneratedNails')}</span>
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
              <span className="loading-subtext">{progress}% • ~{etaRemaining}s {t('audit.makeup.remaining')}</span>
            </div>
          )}

          {/* Comparison / Main Viewer Block */}
          <div className="preview-viewer-area">
            {!image ? (
              <div className="demo-comparison-wrapper">
                <SliderComparison
                  beforeSrc="/trending_nails_before.png"
                  afterSrc="/trending_nails.png"
                  title={t('audit.nails.demoNails')}
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
                    <span className="feedback-title">{t('audit.makeup.didYouLikeTheResult')}</span>
                    <div className="feedback-buttons">
                      <button onClick={() => { setFeedback('like'); setFeedbackSubmitted(true); toast.success(t('audit.makeup.thanksRating')); }} className="feedback-btn positive">{t('audit.makeup.yes')}</button>
                      <button onClick={() => { setFeedback('dislike'); setFeedbackSubmitted(true); toast.success(t('audit.makeup.thankYouForYourFeedback')); }} className="feedback-btn negative">{t('audit.makeup.no')}</button>
                    </div>
                  </div>
                )}
                {feedbackSubmitted && <div className="feedback-panel"><span className="feedback-thanks">{t('audit.makeup.thankYouForYourFeedback')}</span></div>}

                <div className="preview-controls-row">
                  <button
                    className="btn btn-secondary"
                    style={{ color: (currentResultId && isFavorite(currentResultId)) ? '#ff2e93' : undefined }}
                    onClick={() => {
                      if (!currentResultId) return;
                      if (isFavorite(currentResultId)) {
                        removeFavorite(currentResultId);
                        toast.success(t('audit.makeup.removedFromFavourites'));
                      } else {
                        addFavorite({ 
                          id: currentResultId, 
                          result: resultImage, 
                          style: selectedPreset ? NAIL_PRESETS.find(p => p.id === selectedPreset)?.name : 'Nail Art', 
                          category: '💅 Nails', 
                          date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) 
                        });
                        toast.success(t('audit.makeup.savedToFavourites'));
                      }
                    }}
                  >
                    <Heart size={15} /><span>{t('audit.makeup.saveFavourite')}</span>
                  </button>
                  <button className="btn btn-secondary" onClick={handleReset}>
                    <RefreshCw size={15} /><span>{t('audit.makeup.tryAnotherStyle')}</span>
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
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file && file.type.startsWith('image/')) loadImage(file);
              }}
              style={{ cursor: 'default' }}
            >
              <div onClick={triggerUpload} style={{ cursor: 'pointer', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div className="dropzone-icon">
                  <Upload size={28} />
                </div>
                <h3>{t('audit.nails.uploadAPhotoOfYourHand')}</h3>
                <p className="dropzone-subtext">{t('audit.makeup.jpegPngOrWebpMax10mb')}</p>
                <p className="dropzone-hint">{t('audit.makeup.dragDropOrClickToUpload')}</p>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', justifyContent: 'center', width: '100%', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={triggerCamera}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', fontSize: '0.85rem' }}
                >
                  <Camera size={16} />
                  <span>{t('audit.makeup.takePhoto')}</span>
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={triggerUpload}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', fontSize: '0.85rem' }}
                >
                  <Upload size={16} />
                  <span>{t('audit.makeup.uploadFile')}</span>
                </button>
              </div>
            </div>
          ) : (

            !isGenerating && (
              <div className="upload-actions-bar">
                <button type="button" className="btn btn-secondary btn-sm" onClick={triggerCamera}>
                  <Camera size={14} />
                  <span>{t('audit.makeup.takePhoto')}</span>
                </button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={triggerUpload}>
                  <Upload size={14} />
                  <span>{t('audit.makeup.uploadFile')}</span>
                </button>
                <button type="button" className="btn btn-secondary btn-sm btn-danger-text" onClick={handleReset}>
                  <span>{t('audit.makeup.deletePhoto')}</span>
                </button>
              </div>
            )
          )}

          {/* Generate Button */}
          {image && (
            <div className="generate-action-box">
              <button 
                className="btn btn-primary generate-btn-large" 
                disabled={isGenerating}
                onClick={() => { handleGenerate(); }}
              >
                <Sparkles size={18} />
                <span>{t('audit.nails.applyAiNails')}</span>
                <span className="generate-btn-cost">
                  (-10 Tokens)
                </span>
              </button>
              
              <div className="generate-helper-links">
                {isGuest ? (
                  <>
                    <button type="button" className="helper-link" onClick={onOpenAuth}>{t('audit.makeup.signIn')}</button>
                    <span className="helper-separator">·</span>
                    <button type="button" className="helper-link" onClick={() => setActiveTab('pricing')}>{t('audit.makeup.purchaseCreditsToContinue')}</button>
                  </>
                ) : (
                  <button type="button" className="helper-link" onClick={() => setActiveTab('pricing')}>{t('audit.makeup.purchaseCreditsToContinue')}</button>
                )}
              </div>
            </div>
          )}

          </div>
          
          <input ref={fileInputRef} type="file" className="file-input" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
          <input ref={cameraInputRef} type="file" className="file-input" accept="image/*" capture="environment" onChange={handleFileChange} style={{ display: 'none' }} />
        </div>

      {/* See the Magic in Action */}
      <div className="landing-section transformations-section">
        <div className="section-header">
          <span className="section-badge">{t('audit.faceanalysis.showcase')}</span>
          <h2>{t('audit.makeup.seeTheMagicInAction')}</h2>
          <p>{t('audit.nails.inspectTheRealisticGlossyOverl')}</p>
        </div>
        <div className="transformations-grid">
          {[
            { id: 1, title: t('audit.nails.mirrorChrome'), path: '/styles/nails_chrome.png', hot: true },
            { id: 2, title: t('audit.nails.pinkMarble'), path: '/styles/nails_acrylic.png' },
            { id: 3, title: t('audit.nails.goldFoil'), path: '/styles/nails_luxury.png' },
            { id: 4, title: t('audit.nails.frenchMani'), path: '/styles/nails_french.png' },
          ].map(tData => (
            <div key={tData.id} className="transformation-card-outer">
              <div className="transformation-card glass-panel" style={{ padding: '0.5rem' }}>
                <div className="transformation-image-wrapper" style={{ height: '220px', borderRadius: '12px', overflow: 'hidden' }}>
                  {tData.hot && <span className="transformation-hot-badge">{t('audit.faceanalysis.popular')}</span>}
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
            <span className="section-badge">{t('audit.faceanalysis.gotQuestions')}</span>
            <h2>{t('audit.nails.commonNailInquiries')}</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
            {[
              { q: t('audit.nails.faq.q1'), a: t('audit.nails.faq.a1') },
              { q: t('audit.nails.faq.q2'), a: t('audit.nails.faq.a2') },
              { q: t('audit.nails.faq.q3'), a: t('audit.nails.faq.a3') }
            ].map((item, idx) => {
              const isOpened = openFaq === idx;
              return (
                <div key={idx} style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '16px', overflow: 'hidden' }}>
                  <button onClick={() => toggleFaq(idx)} aria-expanded={isOpened} style={{ width: '100%', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
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
            {t('audit.nails.ctaTitle')}
          </h2>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: '1.6' }}>
            {t('audit.nails.ctaSubtitle')}
          </p>
          <button className="btn btn-primary" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ padding: '1rem 2rem', fontSize: '1rem', boxShadow: '0 10px 20px var(--color-pink-glow)' }}>
            <span>{t('audit.makeup.createYourLookNow')}</span>
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
            <span>{t('audit.nails.applyAiNails')}</span>
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
