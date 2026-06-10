import t from '../utils/i18n';
import React, { useState, useRef, useEffect } from 'react';
import { Upload, Sparkles, RefreshCw, Check, Camera, Lock, ArrowRight, HelpCircle, ChevronDown, ChevronUp, Heart, Download, Share2 } from 'lucide-react';
import { useToast } from './Toast';
import { authFetch } from '../apiClient';
import { useFavorites } from './Favorites';
import ShareStoriesModal from './ShareStoriesModal';
import SliderComparison from './SliderComparison';
import confetti from 'canvas-confetti';

const MAKEUP_PRESETS = [
  { id: 'bronze', name: 'Sunkissed Bronze', image: '/styles/makeup_bronze.webp', desc: 'Warm golden tones, radiant bronzed highlights, and a dewy beach glow.' },
  { id: 'clean-girl', name: 'Clean Girl', image: '/styles/makeup_clean_girl.webp', desc: 'Minimalist editorial look, fresh hyper-hydrated skin, and natural definition.' },
  { id: 'y2k', name: 'Y2K Shimmer', image: '/styles/makeup_y2k.webp', desc: 'Frosty pastel eyeshadows, high-shine wet lip gloss, and a classic late-90s vibe.' },
  { id: 'beige', name: 'Nude Beige', image: '/styles/makeup_beige.webp', desc: 'Neutral beige eyeshadow, soft contours, and natural nude lip.' },
  { id: 'soft-glam', name: 'Soft Glam', image: '/styles/makeup_soft_glam.webp', desc: 'Warm brown smoky eyes, neutral lips, and radiant finish.' },
  { id: 'doll-like', name: 'Doll Porcelain', image: '/styles/makeup_doll_like.webp', desc: 'Pink flushed cheeks, defined long lashes, and glossy pink lips.' },
  { id: 'elegant', name: 'Timeless Elegance', image: '/styles/makeup_elegant.webp', desc: 'Sophisticated look, classic thin eyeliner, and soft rose lips.' },
  { id: 'girlish', name: 'Petal Pink', image: '/styles/makeup_girlish.webp', desc: 'Cute baby pink blush and glossy pink gradient lips.' },
  { id: 'grunge-rock', name: 'Edgy Grunge', image: '/styles/makeup_grunge_rock.webp', desc: 'Dark smoky eyeshadow, bold brown/nude matte lip.' },
  { id: 'matte', name: 'Velvet Matte', image: '/styles/makeup_matte.webp', desc: 'Flawless velvet skin, nude matte lip, structured contours.' },
  { id: 'seductive', name: 'Cat Eye', image: '/styles/makeup_seductive.webp', desc: 'Dramatic winged cat eyeliner, sharp contour, and dark bold lips.' },
  { id: 'glossy-lips', name: 'Glass Lips', image: '/styles/makeup_glossy_lips.webp', desc: 'Simple glass skin paired with high-shine wet lip gloss.' },
  { id: 'siren-eyes', name: 'Siren Eyes', image: '/styles/makeup_siren_eyes.webp', desc: 'Elongated winged liner, smoked out edges, and dramatic lifted eyes.' },
  { id: 'latte-makeup', name: 'Latte Contour', image: '/styles/makeup_latte_makeup.webp', desc: 'Warm caramel tones, soft brown smoky eyes, and nude glossy lips.' }
];

const QUICK_PRESETS = [
  { id: 'office', name: 'Office Chic', icon: '💼', preset: 'clean-girl' },
  { id: 'date', name: 'Date Night', icon: '💅', preset: 'soft-glam' },
  { id: 'bold', name: 'Bold & Bright', icon: '💋', preset: 'siren-eyes' },
  { id: 'natural', name: 'Natural Glow', icon: '🌸', preset: 'bronze' },
];

const COMMUNITY_FEED = [
  { id: 'bronze', name: 'Sunkissed Bronze', before: '/trending_makeup_before.png', after: '/styles/makeup_natural.png', desc: 'Warm golden tones, radiant bronzed highlights, and a dewy beach glow.' },
  { id: 'siren-eyes', name: 'Siren Eyes', before: '/trending_makeup_before.png', after: '/styles/makeup_siren_eyes.png', desc: 'Elongated winged liner, smoked out edges, and dramatic lifted eyes.' },
  { id: 'latte-makeup', name: 'Latte Contour', before: '/trending_makeup_before.png', after: '/styles/makeup_latte.png', desc: 'Warm caramel tones, soft brown smoky eyes, and nude glossy lips.' },
  { id: 'clean-girl', name: 'Clean Girl Look', before: '/trending_makeup_before.png', after: '/styles/makeup_clean_girl.webp', desc: 'Minimalist editorial look, fresh hyper-hydrated skin, and natural definition.' },
  { id: 'soft-glam', name: 'Soft Glamour', before: '/trending_makeup_before.png', after: '/styles/makeup_soft_glam.webp', desc: 'Warm brown smoky eyes, neutral lips, and radiant finish.' }
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
  const [selectedCombinations, setSelectedCombinations] = useState([{ id: 1, presetId: 'bronze', lipstickId: 'none' }]);
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
  const [resultImages, setResultImages] = useState([]);
  const [activeResultIndex, setActiveResultIndex] = useState(0);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [lightboxTitle, setLightboxTitle] = useState('');
  const [openFaq, setOpenFaq] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [showFixedCta, setShowFixedCta] = useState(true);
  const [sliderWidth, setSliderWidth] = useState(0);
  

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
  }, [resultImages, activeResultIndex]);

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
        setSelectedCombinations([{ id: Date.now(), presetId: matched.id, lipstickId: 'none' }]);
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
      setResultImages([]);
    setActiveResultIndex(0);
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
    setSelectedCombinations(prev => {
      if (prev.find(c => c.presetId === qp.preset)) return prev;
      return [...prev, { id: Date.now(), presetId: qp.preset, lipstickId: selectedLipstick }];
    });
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
    const calculatedCost = selectedCombinations.length * 10;

    setFeedback(null);
    setFeedbackSubmitted(false);

    if (isGuest && availableTokens < calculatedCost) {
      toast.error('You have used your free generation! Sign up to get more tokens.');
      onOpenAuth();
      return;
    }

    const isUnlimited = false;
    if (!isGuest && !isUnlimited && availableTokens < calculatedCost) {
      toast.error(`You need at least ${calculatedCost} tokens to generate makeup!`);
      setActiveTab('pricing');
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setLoadingText('Uploading selfie to AI engine...');
    setEtaRemaining(30 * selectedCombinations.length);

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

    try {
      const baseTime = Date.now();
      const initialResults = selectedCombinations.map((combo, idx) => {
        const presetObj = MAKEUP_PRESETS.find(p => p.id === combo.presetId);
        const lipstickObj = LIPSTICKS.find(l => l.id === combo.lipstickId);
        return {
          id: `gen-${baseTime}-${idx}`,
          comboId: combo.id,
          styleName: presetObj ? presetObj.name : 'Custom Makeup',
          colorName: lipstickObj ? lipstickObj.name : 'None',
          status: idx === 0 ? 'generating' : 'pending',
          result: null,
          original: image,
          combo
        };
      });

      setResultImages(initialResults);
      setActiveResultIndex(0);

      for (let i = 0; i < selectedCombinations.length; i++) {
        const combo = selectedCombinations[i];
        const presetObj = MAKEUP_PRESETS.find(p => p.id === combo.presetId);
        const lipstickObj = LIPSTICKS.find(l => l.id === combo.lipstickId);
        const eyelinerObj = EYELINERS.find(e => e.id === selectedEyeliner);
        const eyeshadowObj = EYESHADOWS.find(es => es.id === selectedEyeshadow);
        const blushObj = BLUSHES.find(b => b.id === selectedBlush);

        setResultImages(prev => prev.map((item, idx) => idx === i ? { ...item, status: 'generating' } : item));

        setProgress(0);
        setLoadingText('Uploading selfie to AI engine...');
        let currentStep = 0;
        
        const styleInterval = setInterval(() => {
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
          clearInterval(styleInterval);

          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || 'Failed to render makeup');
          }

          const data = await res.json();
          
          if (data.success) {
            setResultImages(prev => prev.map((item, idx) => idx === i ? { ...item, status: 'success', result: data.imageUrl } : item));
            
            if (!isUnlimited) onDeductToken(10);

            onAddHistory({
              original: image,
              result: data.imageUrl,
              style: presetObj ? presetObj.name : 'Makeup',
              color: lipstickObj ? lipstickObj.name : 'Lipstick',
              date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
            });

            const newMatch = {
              id: `match_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
              timestamp: Date.now(),
              date: new Date().toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" }),
              code: combo.presetId,
              name: presetObj ? presetObj.name : 'Custom Makeup',
              matchRate: `${Math.floor(88 + Math.random() * 11)}%`,
              img: data.imageUrl
            };
            const storageKey = user ? `levante_matches_${user.id}` : "levante_matches";
            const existingMatches = JSON.parse(localStorage.getItem(storageKey) || "[]");
            const filteredMatches = existingMatches.filter(m => m.code !== newMatch.code);
            localStorage.setItem(storageKey, JSON.stringify([newMatch, ...filteredMatches].slice(0, 10)));
          } else {
            throw new Error(data.error || 'Failed to render makeup');
          }
        } catch (err) {
          clearInterval(styleInterval);
          setResultImages(prev => prev.map((item, idx) => idx === i ? { ...item, status: 'error', error: err.message } : item));
          toast.error(err.message || 'AI Makeup generation failed.');
        }

        if (i < selectedCombinations.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }

      setProgress(100);
      setSliderPosition(50);
      toast.success('AI Makeup batch rendered successfully!');
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 },
        colors: ["#6D28D9", "#EC4899", "#ffffff"]
      });

      scrollToPreview();

    } catch (err) {
      toast.error(err.message || 'AI Makeup generation failed.');
    } finally {
      setIsGenerating(false);
      clearInterval(etaInterval);
    }
  };

  const handleDownloadAll = async () => {
    const successImages = resultImages.filter(r => r.status === 'success');
    for (let i = 0; i < successImages.length; i++) {
      const img = successImages[i];
      const link = document.createElement('a');
      link.href = img.result;
      link.download = `glamai_${img.styleName}_${img.colorName}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      if (i < successImages.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  };

  const handleFeedback = (type) => {
    setFeedback(type);
    if (type === 'like') {
      setFeedbackSubmitted(true);
      toast.success(t('audit.makeup.thanksRating'));
    }
  };

  const handleReset = () => {
    setImage(null);
    setImageFile(null);
    setResultImages([]);
    setActiveResultIndex(0);
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
          <span className="gradient-text">{t('audit.makeup.aiMakeupStudio')}</span>
        </h1>
        <p className="landing-subtitle">
          {t('audit.makeup.landingSubtitle')}
        </p>
        <div className="landing-stats">
          <div className="stat-badge"><Sparkles size={14} color="var(--color-pink-primary)" /><span>{t('audit.makeup.biometricToneMatching')}</span></div>
          <div className="stat-badge"><span>{t('audit.makeup.14MakeupPresets')}</span></div>
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
        {/* Right Side: Customizer Controls */}
        <div className="control-panel glass-panel">
          <div className="desktop-playground-header">
            <h2 className="section-title">
              <Sparkles size={20} color="var(--color-pink-primary)" />
              <span>{t('audit.makeup.aiMakeupWorkspace')}</span>
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {t('audit.makeup.workspaceDesc')}
            </p>
          </div>

          <hr style={{ border: 'none', borderBottom: '1px solid rgba(255,255,255,0.08)', margin: '1rem 0' }} />

          {/* QUICK PRESETS */}
          <div className="selector-group">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span className="selector-title" style={{ marginBottom: 0 }}>{t('audit.makeup.quickPresets')}</span>
              <button
                type="button"
                title={t('audit.makeup.randomPreset')}
                onClick={() => {
                  const random = MAKEUP_PRESETS[Math.floor(Math.random() * MAKEUP_PRESETS.length)];
                  setSelectedCombinations(prev => [...prev, { id: Date.now(), presetId: random.id, lipstickId: selectedLipstick }]);
                  setActiveQuickPreset(null);
                  toast.success(`🎲 ${t('audit.makeup.random')}: ${random.name}`);
                  scrollToPreview();
                }}
                style={{ background: 'rgba(255,46,147,0.1)', border: '1px solid rgba(255,46,147,0.25)', borderRadius: '8px', padding: '0.3rem 0.6rem', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--color-pink-primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem', transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,46,147,0.2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,46,147,0.1)'}
              >
                🎲 {t('audit.makeup.randomBtn')}
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
            <span className="selector-title">{t('audit.makeup.selectMakeupLook')}</span>
            <div className="style-cards-grid">
              {MAKEUP_PRESETS.map(p => {
                const isSelected = selectedCombinations.some(c => c.presetId === p.id);
                return (
                  <button
                    type="button"
                    key={p.id}
                    className={`style-card ${isSelected ? 'selected' : ''}`}
                    aria-pressed={isSelected}
                    aria-label={`Select: ${p.name}`}
                    onClick={() => {
                      setSelectedCombinations(prev => {
                        if (prev.some(c => c.presetId === p.id)) {
                          return prev.filter(c => c.presetId !== p.id);
                        } else {
                          if (prev.length >= 10) {
                            toast.error("You can select up to 10 makeups at once!");
                            return prev;
                          }
                          return [...prev, { id: Date.now(), presetId: p.id, lipstickId: selectedLipstick }];
                        }
                      });
                      setActiveQuickPreset(null);
                    }}
                    style={{ border: 'none', background: 'transparent', padding: 0, cursor: 'pointer', width: '100%', textAlign: 'left' }}
                  >
                    {isSelected && (
                      <div className="selected-badge">
                        {(selectedCombinations.findIndex(c => c.presetId === p.id) + 1) || <Check size={12} />}
                      </div>
                    )}
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
            <span className="selector-title">{t('audit.makeup.lipstickShade')}</span>
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
            <span className="selector-title">{t('audit.makeup.eyelinerStyle')}</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
              {EYELINERS.map(e => (
                <button key={e.id} className={`btn ${selectedEyeliner === e.id ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '0.5rem 0.75rem', fontSize: '0.75rem' }} onClick={() => setSelectedEyeliner(e.id)}>{e.name}</button>
              ))}
            </div>
          </div>

          {/* Eyeshadow */}
          <div className="selector-group">
            <span className="selector-title">{t('audit.makeup.eyeshadowPalette')}</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
              {EYESHADOWS.map(es => (
                <button key={es.id} className={`btn ${selectedEyeshadow === es.id ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '0.5rem 0.75rem', fontSize: '0.75rem' }} onClick={() => setSelectedEyeshadow(es.id)}>{es.name}</button>
              ))}
            </div>
          </div>

          {/* Blush */}
          <div className="selector-group">
            <span className="selector-title">{t('audit.makeup.blushSkinGlow')}</span>
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
                {isGuest ? `${t('audit.makeup.freeCreditsLeft')}: ${guestTokens ?? 0}` : `${t('audit.makeup.creditsLeft')}: ${user?.tokens ?? 0}`}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-pink-primary)', fontWeight: 700 }}>
                {t('audit.makeup.thisRenderTokens')}
              </span>
            </div>
          </div>
        </div>

        {/* Left Side: Upload and Result Viewer */}
        <div className="preview-panel glass-panel" ref={previewPanelRef}>
          <div className="preview-header">
            <span className="preview-title-uppercase">{t('audit.makeup.yourNewAiGeneratedMakeup')}</span>
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
              /* Demo State: comparison slider using public makeup images */
              <div className="demo-comparison-wrapper">
                <SliderComparison
                  beforeSrc="/trending_makeup_before.png"
                  afterSrc="/trending_makeup.png"
                  title={t('audit.makeup.demoMakeup')}
                  hideActions={true}
                />
              </div>
            ) : resultImages.length > 1 ? (
              <div style={{ width: '100%' }}>
                <div className="generation-grid">
                  {resultImages.map((res, index) => {
                    const isItemGenerating = res.status === 'generating';
                    const isItemSuccess = res.status === 'success';
                    const isItemPending = res.status === 'pending';
                    const isItemError = res.status === 'error';

                    return (
                      <div key={res.id} className="generation-card">
                        <div className="generation-card-badge">
                          {res.styleName}
                        </div>

                        <div className={`generation-card-status-badge ${res.status}`}>
                          {res.status === 'generating' ? 'Rendering' : (res.status === 'pending' ? 'Waiting' : res.status)}
                        </div>

                        <div className="generation-card-image-wrapper">
                          {isItemSuccess ? (
                            <img
                              src={res.result}
                              alt={res.styleName}
                              className="generation-card-image"
                              style={{ cursor: 'pointer' }}
                              onClick={() => {
                                setLightboxImage(res.result);
                                setLightboxTitle(`${res.styleName} (${res.colorName})`);
                              }}
                            />
                          ) : (
                            <img
                              src={image}
                              alt="Original"
                              className="generation-card-image"
                              style={{
                                filter: isItemPending ? 'grayscale(0.5) blur(1px)' : 'none',
                                opacity: isItemPending ? 0.6 : 1
                              }}
                            />
                          )}

                          {isItemGenerating && (
                            <div className="generation-card-overlay">
                              <div className="generation-card-spinner"></div>
                              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-pink-primary)' }}>Rendering</span>
                              <div className="progress-track" style={{ height: '4px', width: '80%', marginTop: '8px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                                <div className="progress-bar" style={{ width: `${progress}%`, height: '100%', background: 'var(--color-pink-primary)' }}></div>
                              </div>
                              <span className="generation-card-progress">{progress}%</span>
                            </div>
                          )}

                          {isItemPending && (
                            <div className="generation-card-overlay" style={{ background: 'rgba(0,0,0,0.6)' }}>
                              <RefreshCw size={24} className="animate-spin-slow" style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }} />
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>Waiting</span>
                            </div>
                          )}

                          {isItemError && (
                            <div className="generation-card-overlay" style={{ background: 'rgba(30,10,10,0.8)' }}>
                              <span style={{ color: '#ff4d4d', fontSize: '0.75rem', fontWeight: 600 }}>Failed</span>
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.6rem', marginTop: '4px', maxWidth: '90%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {res.error || 'AI Server Error'}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="generation-card-footer">
                          <div className="generation-card-info">
                            <span className="generation-card-title">{res.styleName}</span>
                            <span className="generation-card-subtitle">{res.colorName}</span>
                          </div>

                          {isItemSuccess && (
                            <div className="generation-card-actions">
                              <a
                                href={res.result}
                                download={`glamai_${res.styleName}_${res.colorName}.png`}
                                className="generation-card-btn"
                                title="Download HD Render"
                              >
                                <Download size={14} />
                              </a>
                              <button
                                className="generation-card-btn"
                                title={isFavorite(res.id) ? 'Remove from Favourites' : 'Save to Favourites'}
                                onClick={() => {
                                  if (isFavorite(res.id)) {
                                    removeFavorite(res.id);
                                    toast.success('Removed from Favourites');
                                  } else {
                                    addFavorite({ id: res.id, result: res.result, style: res.styleName, color: res.colorName, category: '💄 Makeup', date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) });
                                    toast.success('Saved to Favourites');
                                  }
                                }}
                                style={{ color: isFavorite(res.id) ? '#ff2e93' : 'inherit' }}
                              >
                                <Heart size={14} fill={isFavorite(res.id) ? '#ff2e93' : 'none'} />
                              </button>
                              <button
                                className="generation-card-btn"
                                title="Share to Stories"
                                onClick={() => setShowStoriesModal({ url: res.result, styleName: res.styleName })}
                              >
                                <Share2 size={14} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="preview-controls" style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                  {resultImages.some(r => r.status === 'success') && (
                    <button
                      className="btn btn-primary"
                      onClick={handleDownloadAll}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                      <Download size={16} />
                      <span>Download All</span>
                    </button>
                  )}
                  {!isGenerating && (
                    <button className="btn btn-secondary" onClick={handleReset} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <RefreshCw size={16} />
                      <span>Try Another Batch</span>
                    </button>
                  )}
                </div>
              </div>
            ) : resultImages.length === 1 && resultImages[0].status === 'success' ? (
              <div style={{ width: '100%' }}>
                <SliderComparison
                  beforeSrc={image}
                  afterSrc={resultImages[0].result}
                  title={resultImages[0].styleName}
                  onShare={() => setShowStoriesModal({ url: resultImages[0].result, styleName: resultImages[0].styleName })}
                  onDownload={() => {}}
                  hideActions={false}
                />

                {/* Feedback */}
                {!feedbackSubmitted && (
                  <div className="feedback-panel">
                    <span className="feedback-title">{t('audit.makeup.didYouLikeTheResult')}</span>
                    <div className="feedback-buttons">
                      <button onClick={() => handleFeedback('like')} className="feedback-btn positive">{t('audit.makeup.yes')}</button>
                      <button onClick={() => handleFeedback('dislike')} className="feedback-btn negative">{t('audit.makeup.no')}</button>
                    </div>
                  </div>
                )}
                {feedbackSubmitted && <div className="feedback-panel"><span className="feedback-thanks">{t('audit.makeup.thankYouForYourFeedback')}</span></div>}

                {/* Additional Actions */}
                <div className="preview-controls-row">
                  <button
                    className="btn btn-secondary"
                    style={{ color: (resultImages[0].id && isFavorite(resultImages[0].id)) ? '#ff2e93' : undefined }}
                    onClick={() => {
                      if (!resultImages[0].id) return;
                      if (isFavorite(resultImages[0].id)) { 
                        removeFavorite(resultImages[0].id); 
                        toast.success(t('audit.makeup.removedFromFavourites')); 
                      } else { 
                        addFavorite({ 
                          id: resultImages[0].id, 
                          result: resultImages[0].result, 
                          style: resultImages[0].styleName, color: resultImages[0].colorName, 
                          category: '💄 Makeup', 
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
                  <img src={image} alt="Makeup Preview" style={{ width: '100%', display: 'block', borderRadius: '12px' }} />
                </div>
              </div>
            )}
          </div>

          {/* Upload dropzone (rendered below comparison image) */}
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
                <h3>{t('audit.makeup.uploadYourSelfie')}</h3>
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

          <input ref={fileInputRef} type="file" className="file-input" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
          <input ref={cameraInputRef} type="file" className="file-input" accept="image/*" capture="user" onChange={handleFileChange} style={{ display: 'none' }} />

          {/* Generate Button (positioned under upload dropzone) */}
          {image && (
            <div className="generate-action-box">
              <button 
                className="btn btn-primary generate-btn-large" 
                disabled={isGenerating}
                onClick={() => { handleGenerate(); }}
              >
                <Sparkles size={18} />
                <span>{t('audit.makeup.applyAiMakeup')}</span>
                <span className="generate-btn-cost">
                  (-{selectedCombinations.length * 10} Tokens)
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

          {/* Privacy Trust Badge */}
          <div className="privacy-trust-badge" style={{ justifyContent: 'center', marginTop: '1rem' }}>
            <span>{t('audit.makeup.yourPhotoIsFullySecureAutodele')}</span>
          </div>
        </div>
      </div>

      {/* Real Transformations */}
      <div className="landing-section transformations-section">
        <div className="section-header">
          <span className="section-badge">{t('audit.faceanalysis.showcase')}</span>
          <h2>{t('audit.makeup.seeTheMagicInAction')}</h2>
          <p>{t('audit.makeup.realAiMakeupTransformationsInH')}</p>
        </div>
        <div className="transformations-grid">
          {[
            { id: 1, title: t('audit.makeup.peachGloss'), path: '/styles/makeup_korean.png', hot: true },
            { id: 2, title: t('audit.makeup.smokyGlam'), path: '/styles/makeup_glam.png' },
            { id: 3, title: t('audit.makeup.champagneBridal'), path: '/styles/makeup_bridal.png' },
            { id: 4, title: t('audit.makeup.dewyGlow'), path: '/styles/makeup_natural.png' },
          ].map(tData => (
            <div key={tData.id} className="transformation-card-outer">
              <div className="transformation-card glass-panel" style={{ padding: '0.5rem' }}>
                <div className="transformation-image-wrapper" style={{ height: '220px', borderRadius: '12px', overflow: 'hidden' }}>
                  {tData.hot && <span className="transformation-hot-badge">{t('audit.makeup.trending')}</span>}
                  <img src={tData.path} alt={tData.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              </div>
              <div className="transformation-card-title-bottom" style={{ marginTop: '0.5rem', fontWeight: 700, fontSize: '0.85rem' }}>{tData.title}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Community Preset Feed */}
      <div className="landing-section community-preset-feed" style={{ marginTop: '3rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '3rem' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-badge">{t('audit.makeup.communityFeed') || 'Lookbook'}</span>
            <h2>{t('audit.makeup.communityPresetsTitle') || 'Trending Lookbook & Presets'}</h2>
            <p>{t('audit.makeup.communityPresetsDesc') || 'Explore community-favorite makeovers. Click "Try Preset" to apply the style instantly.'}</p>
          </div>
          
          <div className="community-presets-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
            marginTop: '2rem'
          }}>
            {COMMUNITY_FEED.map(look => (
              <div key={look.id} className="preset-feed-card glass-panel" style={{
                padding: '1rem',
                borderRadius: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.8rem',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                transition: 'all 0.3s ease',
                overflow: 'hidden'
              }}>
                {/* Before / After side by side */}
                <div className="side-by-side-wrapper" style={{ display: 'flex', gap: '0.5rem', height: '180px', borderRadius: '12px', overflow: 'hidden' }}>
                  <div style={{ flex: 1, position: 'relative' }}>
                    <img src={look.before} alt={t('audit.retouch.before')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <span style={{ position: 'absolute', bottom: '8px', left: '8px', background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>{t('audit.retouch.before')}</span>
                  </div>
                  <div style={{ flex: 1, position: 'relative' }}>
                    <img src={look.after} alt={t('audit.retouch.after')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <span style={{ position: 'absolute', bottom: '8px', left: '8px', background: 'var(--color-pink-primary)', color: '#fff', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>{t('audit.retouch.after')}</span>
                  </div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', padding: '0 0.25rem' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{look.name}</h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0, minHeight: '38px', lineHeight: '1.4' }}>{look.desc}</p>
                </div>
                
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    setSelectedCombinations(prev => {
      if (prev.find(c => c.presetId === look.id)) return prev;
      return [...prev, { id: Date.now(), presetId: look.id, lipstickId: selectedLipstick }];
    });
                    setActiveQuickPreset(null);
                    toast.success(`${t('audit.makeup.presetLoaded') || 'Preset loaded'}: ${look.name}`);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  style={{ 
                    width: '100%', 
                    padding: '0.65rem 1rem', 
                    fontSize: '0.8rem', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justify: 'center', 
                    gap: '0.5rem',
                    marginTop: 'auto',
                    boxShadow: '0 4px 12px rgba(255,46,147,0.15)'
                  }}
                >
                  <Sparkles size={14} />
                  <span>{t('audit.makeup.tryPreset') || 'Try Preset'}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="landing-section faq-section" style={{ background: 'transparent' }}>
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="section-header">
            <span className="section-badge">{t('audit.faceanalysis.gotQuestions')}</span>
            <h2>{t('audit.makeup.commonMakeupInquiries')}</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
            {[
              { q: t('audit.makeup.faq.q1'), a: t('audit.makeup.faq.a1') },
              { q: t('audit.makeup.faq.q2'), a: t('audit.makeup.faq.a2') },
              { q: t('audit.makeup.faq.q3'), a: t('audit.makeup.faq.a3') }
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
            {t('audit.makeup.ctaTitle')}
          </h2>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: '1.6' }}>
            {t('audit.makeup.ctaSubtitle')}
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
            <span>{t('audit.makeup.applyAiMakeup')}</span>
            <span style={{ fontSize: '0.8rem', opacity: 0.8, marginLeft: '0.25rem' }}>
              (-{selectedCombinations.length * 10} Tokens)
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
