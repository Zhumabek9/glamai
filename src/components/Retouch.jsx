import t from '../utils/i18n';
import React, { useState, useRef } from 'react';
import { Upload, Sparkles, Coins, Download, RefreshCw, Eye, Check, HelpCircle, EyeOff, ArrowRight, Star, ChevronDown, ChevronUp, Users, Lock, Palette } from 'lucide-react';
import { useToast } from './Toast';
import { authFetch } from '../apiClient';
import { compressImage } from '../utils/image';
import { handleDownloadClick } from '../utils/telegramHelper';

export default function Retouch({ user, guestTokens, onDeductToken, onOpenAuth, onAddHistory, setActiveTab }) {
  const toast = useToast();
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [smoothSkin, setSmoothSkin] = useState(50);
  const [teethWhitening, setTeethWhitening] = useState(0);
  const [eyeEnhancement, setEyeEnhancement] = useState(0);
  const [faceSymmetry, setFaceSymmetry] = useState(0);
  const [acneRemoval, setAcneRemoval] = useState(true);
  const [skinGlow, setSkinGlow] = useState(30);
  const [skinTexturePreservation, setSkinTexturePreservation] = useState(70);
  const [poreRefiner, setPoreRefiner] = useState(true);

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
    const isPremium = false; // VIP subscriptions now spend credits instead of having infinite generations
    const tokenCost = 10;
    const isGuest = !user || user.isGuest;
    const availableTokens = isGuest ? (guestTokens ?? 0) : (user?.tokens ?? 0);

    if (isGuest && availableTokens < 10) {
      toast.error('You have used your free generation! Sign up to get more tokens.');
      onOpenAuth();
      return;
    }

    if (!isGuest && !isPremium && availableTokens < 10) {
      toast.error(`You need at least 10 tokens to apply beauty retouching!`);
      setActiveTab('pricing');
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setLoadingText('Uploading portrait to editor...');

    const steps = [
      { prg: 20, txt: 'Analyzing skin pigmentation...' },
      { prg: 45, txt: 'Removing blemishes & acne spots...' },
      { prg: 70, txt: 'Applying skin smoothing brush...' },
      { prg: 90, txt: 'Whitening teeth & enhancing iris details...' }
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
    }, 110);

    try {
      const compressedFile = await compressImage(imageFile);
      const retouchConfig = JSON.stringify({
        smoothSkin,
        teethWhitening,
        eyeEnhancement,
        faceSymmetry,
        acneRemoval,
        skinGlow,
        skinTexturePreservation,
        poreRefiner
      });

      const formData = new FormData();
      formData.append('image', compressedFile);
      formData.append('taskType', 'retouch');
      formData.append('retouch', retouchConfig);
      formData.append('gender', 'person');

      const res = await authFetch('/api/generate', {
        method: 'POST',
        body: formData
      });

      clearInterval(interval);

      if (!res.ok) {
        throw new Error('Retouch failed');
      }

      const data = await res.json();
      setResultImage(data.imageUrl);
      setProgress(100);
      toast.success("AI Retouching applied!");
      onDeductToken(tokenCost);

      const newHistoryItem = {
        id: `history-retouch-${Date.now()}`,
        original: image,
        result: data.imageUrl,
        style: 'Retouch',
        color: 'Beauty Filter',
        date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
      };
      onAddHistory(newHistoryItem);

    } catch (err) {
      clearInterval(interval);
      toast.error(err.message || 'Retouching failed.');
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
          <span className="gradient-text">{t('audit.retouch.flawlessPortraitureRealTexture')}</span>. Try Premium AI Retouching
        </h1>
        <p className="landing-subtitle">
          Experience editorial-grade skin and facial enhancements that preserve your authentic character. Smooth pigmentation, illuminate smiles, and define eyes without the synthetic plastic look. Powered by texture retention algorithms.
        </p>
        <div className="landing-stats">
          <div className="stat-badge"><Sparkles size={14} color="var(--color-pink-primary)" /> <span>{t('audit.retouch.texturepreservingSmoothing')}</span></div>
          <div className="stat-badge"><Coins size={14} color="var(--color-pink-primary)" /> <span>{t('audit.retouch.subcellularBlemishSmartErase')}</span></div>
          <div className="stat-badge"><span>{t('audit.retouch.professionalDetailRetention')}</span></div>
        </div>
      </div>

      <div className="playground-grid">
        {/* Left Control Panel */}
        <div className="control-panel glass-panel">
          <div className="desktop-playground-header">
            <h2 className="section-title">
              <Sparkles size={20} color="var(--color-pink-primary)" />
              <span>{t('audit.retouch.retouchWorkspace')}</span>
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Adjust sliders below to customize the beauty filter intensity.
            </p>
          </div>

          <hr style={{ border: 'none', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', margin: '1rem 0' }} />

          {/* Sliders */}
          <div className="selector-group" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Smooth Skin */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                <span>{t('audit.retouch.smoothSkin')}</span>
                <span>{smoothSkin}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={smoothSkin} 
                onChange={(e) => setSmoothSkin(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--color-pink-primary)' }}
                aria-label={t('audit.retouch.smoothSkinIntensityPercentage')}
                aria-valuenow={smoothSkin}
                aria-valuemin="0"
                aria-valuemax="100"
              />
            </div>

            {/* Teeth Whitening */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                <span>{t('audit.retouch.teethWhitening')}</span>
                <span>{teethWhitening}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={teethWhitening} 
                onChange={(e) => setTeethWhitening(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--color-pink-primary)' }}
                aria-label={t('audit.retouch.teethWhiteningPercentage')}
                aria-valuenow={teethWhitening}
                aria-valuemin="0"
                aria-valuemax="100"
              />
            </div>

            {/* Eye Enhancement */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                <span>{t('audit.retouch.eyeEnhancement')}</span>
                <span>{eyeEnhancement}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={eyeEnhancement} 
                onChange={(e) => setEyeEnhancement(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--color-pink-primary)' }}
                aria-label={t('audit.retouch.eyeEnhancementPercentage')}
                aria-valuenow={eyeEnhancement}
                aria-valuemin="0"
                aria-valuemax="100"
              />
            </div>

            {/* Face Symmetry */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                <span>{t('audit.retouch.faceSymmetryEnhancement')}</span>
                <span>{faceSymmetry}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={faceSymmetry} 
                onChange={(e) => setFaceSymmetry(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--color-pink-primary)' }}
                aria-label={t('audit.retouch.faceSymmetryEnhancementPercent')}
                aria-valuenow={faceSymmetry}
                aria-valuemin="0"
                aria-valuemax="100"
              />
            </div>

            {/* Skin Glow */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                <span>{t('audit.retouch.dewySkinGlow')}</span>
                <span>{skinGlow}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={skinGlow} 
                onChange={(e) => setSkinGlow(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--color-pink-primary)' }}
                aria-label={t('audit.retouch.dewySkinGlowPercentage')}
                aria-valuenow={skinGlow}
                aria-valuemin="0"
                aria-valuemax="100"
              />
            </div>

            {/* Skin Texture Preservation */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                <span>{t('audit.retouch.skinTexturePreservation')}</span>
                <span>{skinTexturePreservation}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={skinTexturePreservation} 
                onChange={(e) => setSkinTexturePreservation(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--color-pink-primary)' }}
                aria-label={t('audit.retouch.skinTexturePreservationPercent')}
                aria-valuenow={skinTexturePreservation}
                aria-valuemin="0"
                aria-valuemax="100"
              />
            </div>

            {/* Pore Refiner Checkbox */}
            <div 
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', outline: 'none' }} 
              onClick={() => setPoreRefiner(!poreRefiner)}
              role="checkbox"
              aria-checked={poreRefiner}
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setPoreRefiner(!poreRefiner); } }}
            >
              <div style={{ width: '18px', height: '18px', borderRadius: '4px', border: '2px solid var(--color-pink-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: poreRefiner ? 'var(--color-pink-primary)' : 'transparent', transition: 'all 0.15s ease' }}>
                {poreRefiner && <Check size={12} color="#fff" />}
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{t('audit.retouch.poreRefinerSmartPreserve')}</span>
            </div>

            {/* Acne Removal Checkbox */}
            <div 
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', outline: 'none' }} 
              onClick={() => setAcneRemoval(!acneRemoval)}
              role="checkbox"
              aria-checked={acneRemoval}
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setAcneRemoval(!acneRemoval); } }}
            >
              <div style={{ width: '18px', height: '18px', borderRadius: '4px', border: '2px solid var(--color-pink-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: acneRemoval ? 'var(--color-pink-primary)' : 'transparent', transition: 'all 0.15s ease' }}>
                {acneRemoval && <Check size={12} color="#fff" />}
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{t('audit.retouch.acneBlemishRemoval')}</span>
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
              <span>{t('audit.retouch.applyAiRetouch')}</span>
            </button>
          </div>
        </div>

        {/* Right Preview Panel */}
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
              aria-label={t('audit.retouch.uploadPhotoDragAndDropAFacePho')}
            >
              <div className="dropzone-icon">
                <Upload size={24} />
              </div>
              <h3>{t('audit.retouch.uploadAPortraitPhoto')}</h3>
              <p>{t('audit.retouch.uploadASelfieOrHeadshotToRetou')}</p>
              <button className="btn btn-secondary" tabIndex={-1} onClick={(e) => { e.stopPropagation(); fileInputRef.current.click(); }}>
                Browse Files
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
                    <span className="before-after-label before">{t('audit.retouch.before')}</span>
                    <div className="preview-container">
                      <img src={image} alt="Before Retouch" />
                    </div>
                  </div>
                  <div className="before-after-col">
                    <span className="before-after-label after">{t('audit.retouch.after')}</span>
                    <div className="preview-container">
                      <img src={resultImage} alt="After Retouch" />
                      <div className="slider-label after" style={{ top: '1rem', right: '1rem', bottom: 'auto' }}>{t('audit.retouch.aiRetouched')}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="preview-container" style={{ position: 'relative', overflow: 'hidden', borderRadius: '16px', background: '#000', maxWidth: '450px', margin: '0 auto' }}>
                  <img 
                    src={image} 
                    alt="Retouch Preview"
                    style={{ maxWidth: '100%', height: 'auto', display: 'block', maxHeight: '500px', objectFit: 'contain' }}
                  />
                </div>
              )}

              <div className="preview-controls" style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', width: '100%', justifyContent: 'center' }}>
                {resultImage ? (
                  <>
                    <a
                      href={resultImage}
                      download="glamai_retouch.png"
                      className="btn btn-primary"
                      style={{ flex: 1, maxWidth: '200px' }}
                      onClick={(e) => handleDownloadClick(e, resultImage, 'glamai_retouch.png', toast)}
                    >
                      <Download size={16} />
                      <span>{t('audit.favorites.download')}</span>
                    </a>
                    <button className="btn btn-secondary" onClick={handleReset} style={{ flex: 1, maxWidth: '200px' }}>
                      <RefreshCw size={16} />
                      <span>{t('audit.retouch.reset')}</span>
                    </button>
                  </>
                ) : (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Adjust sliders and click 'Apply AI Retouch' to render.
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
          <span className="section-badge">{t('audit.faceanalysis.showcase')}</span>
          <h2>{t('audit.faceanalysis.realTransformations')}</h2>
          <p>{t('audit.retouch.seeHowOurAiSmartBrushesClearBl')}</p>
        </div>
        <div className="transformations-grid">
          {[
            { id: 1, title: 'Blemish Clearance', path: '/styles/makeup_matte.webp', hot: true },
            { id: 2, title: 'Velvet Skin Smoothing', path: '/styles/makeup_natural.png' },
            { id: 3, title: 'Dewy Skin Glow', path: '/styles/makeup_bridal.png' },
            { id: 4, title: 'Symmetry Enhancements', path: '/styles/makeup_korean.png' },
          ].map(tData => (
            <div key={tData.id} className="transformation-card-outer">
              <div className="transformation-card glass-panel" style={{ padding: '0.5rem' }}>
                <div className="transformation-image-wrapper" style={{ height: '220px', borderRadius: '12px', overflow: 'hidden' }}>
                  {tData.hot && <span className="transformation-hot-badge">{t('audit.faceanalysis.popular')}</span>}
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
          <span className="section-badge">{t('audit.faceanalysis.simpleProcess')}</span>
          <h2>{t('audit.retouch.4StepsToFlawlessSkin')}</h2>
          <p>{t('audit.retouch.easilyEditAndPolishHeadshotsWi')}</p>
        </div>
        <div className="process-timeline">
          {[
            { num: '01', title: 'Upload Photo', desc: 'Drag and drop your headshot or portrait photo.', icon: <Upload size={24} /> },
            { num: '02', title: 'Tune Sliders', desc: 'Adjust skin smoothing, teeth whitening, and glows.', icon: <Palette size={24} /> },
            { num: '03', title: 'Smart Erase', desc: 'Check blemish removal to automatically clear spots.', icon: <Sparkles size={24} /> },
            { num: '04', title: 'Download HD', desc: 'Save your retouched portrait with natural lighting.', icon: <Download size={24} /> },
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


      {/* --- Why Choose Us --- */}
      <div className="landing-section why-choose-section">
        <div className="section-header">
          <span className="section-badge">{t('audit.faceanalysis.whyChooseUs')}</span>
          <h2>{t('audit.retouch.poresafeRetouchingAlgorithms')}</h2>
          <p>{t('audit.retouch.ourEngineTargetsOnlyBlemishesR')}</p>
        </div>
        <div className="benefits-grid">
          {[
            { title: 'Pore Preservation', desc: 'Retains natural skin patterns, avoiding flat cosmetic blurs.', icon: <Sparkles size={24} /> },
            { title: 'Blemish Patching', desc: 'Auto-detects pigmentation deviations to patch spots seamlessly.', icon: <Palette size={24} /> },
            { title: 'Enamel Whitening', desc: 'Isolates teeth boundaries for subtle, natural whitening.', icon: <Check size={24} /> },
            { title: 'Data Privacy', desc: 'Processes photos securely. No personal image data is stored.', icon: <Lock size={24} /> },
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
            <span className="section-badge">{t('audit.faceanalysis.gotQuestions')}</span>
            <h2>{t('audit.retouch.commonRetouchInquiries')}</h2>
            <p>{t('audit.retouch.commonQuestionsAboutOurBeautyR')}</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
            {[
              { q: 'Will my face look plastic or fake?', a: 'No. Our model uses a texture overlay logic to smooth pigmentation while keeping fine pores and natural skin texture fully intact.' },
              { q: 'Can it clear severe acne?', a: 'Yes! The Acne & Blemish Removal toggle uses patch-fill neural networks to detect and erase spots, blemishes, and scars in one click.' },
              { q: 'Can I adjust the strength of the filters?', a: 'Absolutely, you have full slider control (0-100%) over smoothing, whitening, eye enhancement, and face symmetry.' }
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
            Unlock your best look. Smooth skin textures, whiten teeth, and create stunning headshots online.
          </p>
          <button className="btn btn-primary" onClick={() => window.scrollTo({ top: 380, behavior: 'smooth' })} style={{ padding: '1rem 2rem', fontSize: '1.05rem', boxShadow: '0 10px 20px var(--color-pink-glow)' }}>
            <span>{t('audit.retouch.retouchYourPhotoNow')}</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
