import React, { useState, useRef } from 'react';
import { Upload, Sparkles, Coins, Download, RefreshCw, Eye, Check, HelpCircle, EyeOff } from 'lucide-react';
import { useToast } from './Toast';
import { authFetch } from '../apiClient';

const MAKEUP_PRESETS = [
  { id: 'natural', name: 'Natural Makeup', image: '/styles/makeup_natural.webp', desc: 'Minimalist clean aesthetic, dewy glass skin and nude lip tint.' },
  { id: 'glam', name: 'Glam Makeup', image: '/styles/makeup_glam.webp', desc: 'Dramatic smoky eyes, sharp eyeliner, and bold matte lips.' },
  { id: 'korean', name: 'Korean Makeup', image: '/styles/makeup_korean.webp', desc: 'Peach gradient lips, puppy eyes, and soft rosy cheeks.' },
  { id: 'soft-girl', name: 'Soft Girl Makeup', image: '/styles/makeup_soft_girl.webp', desc: 'Pink eyeshadow, glossy blush, cute faux freckles.' },
  { id: 'bridal', name: 'Bridal Makeup', image: '/styles/makeup_bridal.webp', desc: 'Classic elegant look, champagne highlights, soft rose lips.' },
  { id: 'euphoria', name: 'Euphoria Makeup', image: '/styles/makeup_euphoria.webp', desc: 'Gemstones, colorful neon eyeshadow, graphic eyeliner.' },
  { id: 'matte', name: 'Matte Makeup', image: '/styles/makeup_matte.webp', desc: 'Flawless velvet skin, nude matte lipstick, structured contours.' }
];

const LIPSTICKS = [
  { id: 'none', name: 'None', hex: '#888888' },
  { id: 'cherry-red', name: 'Cherry Red', hex: '#d32f2f' },
  { id: 'nude', name: 'Matte Nude', hex: '#cb9b8c' },
  { id: 'rose-pink', name: 'Rose Pink', hex: '#f48fb1' },
  { id: 'deep-plum', name: 'Deep Plum', hex: '#4a148c' }
];

const EYELINERS = [
  { id: 'none', name: 'None' },
  { id: 'classic', name: 'Classic Eyeliner' },
  { id: 'winged', name: 'Winged Cat Eye' },
  { id: 'smokey', name: 'Smokey Smudge' }
];

export default function Makeup({ user, guestTokens, onDeductToken, onOpenAuth, onAddHistory, setActiveTab }) {
  const toast = useToast();
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [selectedPreset, setSelectedPreset] = useState('natural');
  const [selectedLipstick, setSelectedLipstick] = useState('none');
  const [selectedEyeliner, setSelectedEyeliner] = useState('none');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('');
  const [resultImage, setResultImage] = useState(null);
  const [showOriginal, setShowOriginal] = useState(false);

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

      const makeupDesc = `${presetObj ? presetObj.name : 'Natural'} style. Lipstick: ${lipstickObj?.name || 'None'}. Eyeliner: ${eyelinerObj?.name || 'None'}.`;

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
      <div className="mobile-playground-header">
        <h2 className="section-title">
          <Sparkles size={20} color="var(--color-pink-primary)" />
          <span>AI Makeup Salon</span>
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Try on gorgeous makeup presets and lips/eyeliner shades instantly.
        </p>
      </div>

      <div className="playground-grid">
        {/* Left Side: Makeup controls */}
        <div className="control-panel glass-panel">
          <div className="desktop-playground-header">
            <h2 className="section-title">
              <Sparkles size={20} color="var(--color-pink-primary)" />
              <span>AI Makeup Salon</span>
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Select a visual preset and fine-tune details.
            </p>
          </div>

          <hr style={{ border: 'none', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', margin: '1rem 0' }} />

          {/* Preset cards */}
          <div className="selector-group">
            <span className="selector-title">SELECT PRESET</span>
            <div className="style-cards-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
              {MAKEUP_PRESETS.map(p => {
                const isSelected = selectedPreset === p.id;
                return (
                  <div
                    key={p.id}
                    className={`style-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedPreset(p.id)}
                    style={{ padding: '0.5rem' }}
                  >
                    {isSelected && (
                      <div className="selected-badge">
                        <Check size={12} />
                      </div>
                    )}
                    <div className="style-card-image-wrapper" style={{ height: '80px' }}>
                      <div style={{ width: '100%', height: '100%', background: 'var(--gradient-pink-purple)', opacity: 0.15, position: 'absolute' }}></div>
                      <Sparkles size={24} style={{ color: 'var(--color-pink-primary)', zIndex: 2 }} />
                    </div>
                    <div className="style-card-footer" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                      {p.name}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Lipstick shade selection */}
          <div className="selector-group">
            <span className="selector-title">LIPSTICK SHADE</span>
            <div className="pill-grid">
              {LIPSTICKS.map(l => (
                <div
                  key={l.id}
                  className={`pill-option ${selectedLipstick === l.id ? 'selected' : ''}`}
                  onClick={() => setSelectedLipstick(l.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: l.hex, border: '1px solid rgba(0,0,0,0.1)' }} />
                  <span>{l.name}</span>
                </div>
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
                  style={{ padding: '0.5rem 0.75rem', fontSize: '0.75rem' }}
                  onClick={() => setSelectedEyeliner(e.id)}
                >
                  {e.name}
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
            >
              <div className="dropzone-icon">
                <Upload size={24} />
              </div>
              <h3>Upload a Selfie</h3>
              <p>Upload a clear, front-facing portrait to apply beauty makeup filters.</p>
              <button className="btn btn-secondary" onClick={(e) => { e.stopPropagation(); fileInputRef.current.click(); }}>
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
              <div className="preview-container" style={{ position: 'relative', overflow: 'hidden', borderRadius: '16px', border: '1px solid var(--glass-border)', background: '#000' }}>
                <img 
                  src={showOriginal ? image : (resultImage || image)} 
                  alt="Makeup Preview"
                  style={{ maxWidth: '100%', height: 'auto', display: 'block', maxHeight: '500px', objectFit: 'contain' }}
                />
                
                {resultImage && (
                  <button
                    className="btn btn-secondary"
                    style={{ position: 'absolute', bottom: '1rem', right: '1rem', padding: '0.5rem', borderRadius: '50%', minWidth: '40px', height: '40px', background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff' }}
                    onMouseDown={() => setShowOriginal(true)}
                    onMouseUp={() => setShowOriginal(false)}
                    onTouchStart={() => setShowOriginal(true)}
                    onTouchEnd={() => setShowOriginal(false)}
                    title="Hold to see original"
                  >
                    {showOriginal ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                )}
                
                {resultImage && (
                  <div className="slider-label after" style={{ top: '1rem', right: '1rem' }}>
                    {showOriginal ? 'ORIGINAL' : 'AI MAKEUP'}
                  </div>
                )}
              </div>

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
    </section>
  );
}
