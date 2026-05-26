import React, { useState, useRef } from 'react';
import { Upload, Sparkles, Coins, Download, RefreshCw, Eye, Check, HelpCircle, EyeOff } from 'lucide-react';
import { useToast } from './Toast';
import { authFetch } from '../apiClient';

const BEARD_PRESETS = [
  { id: 'stubble', name: '5 o\'clock Stubble', desc: 'Light rugged stubble, clean modern look.' },
  { id: 'full-beard', name: 'Full Groomed Beard', desc: 'Thick full beard, neatly trimmed and styled.' },
  { id: 'viking', name: 'Viking Beard', desc: 'Long, wild, full Norse warrior style beard.' },
  { id: 'goatee', name: 'Classic Goatee', desc: 'Tapered chin beard paired with mustache.' },
  { id: 'mustache', name: 'Classic Mustache', desc: 'Clean-shaven face with a prominent upper lip mustache.' },
  { id: 'clean-shave', name: 'Clean Shave', desc: 'Completely hairless face, smooth and clean look.' }
];

const BEARD_COLORS = [
  { id: 'natural', name: 'Natural Shade', hex: '#888888' },
  { id: 'jet-black', name: 'Jet Black', hex: '#111111' },
  { id: 'dark-brown', name: 'Dark Brown', hex: '#3e2723' },
  { id: 'blonde', name: 'Blonde tint', hex: '#f0e68c' },
  { id: 'ginger-red', name: 'Ginger Red', hex: '#d84315' },
  { id: 'grey-silver', name: 'Grey / Silver', hex: '#b0bec5' }
];

export default function Beard({ user, guestTokens, onDeductToken, onOpenAuth, onAddHistory, setActiveTab }) {
  const toast = useToast();
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [selectedPreset, setSelectedPreset] = useState('stubble');
  const [selectedColor, setSelectedColor] = useState('natural');
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
      toast.error(`You need at least 10 tokens to generate beard styles!`);
      setActiveTab('pricing');
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setLoadingText('Uploading image to AI...');

    const steps = [
      { prg: 15, txt: 'Scanning jaw and cheeks lines...' },
      { prg: 40, txt: 'Synthesizing beard follicle layers...' },
      { prg: 70, txt: 'Blending facial hair textures...' },
      { prg: 90, txt: 'Matching lighting & hair dye...' }
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
    }, 120);

    try {
      const presetObj = BEARD_PRESETS.find(p => p.id === selectedPreset);
      const colorObj = BEARD_COLORS.find(c => c.id === selectedColor);

      const beardDesc = `${presetObj ? presetObj.name : 'Stubble'}. Color: ${colorObj ? colorObj.name : 'Natural'}.`;

      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('taskType', 'beard');
      formData.append('beard', beardDesc);
      formData.append('gender', 'male');

      const res = await authFetch('/api/generate', {
        method: 'POST',
        body: formData
      });

      clearInterval(interval);

      if (!res.ok) {
        throw new Error('Failed to generate beard style');
      }

      const data = await res.json();
      setResultImage(data.imageUrl);
      setProgress(100);
      toast.success("AI Beard applied successfully!");
      onDeductToken(tokenCost);

      const newHistoryItem = {
        id: `history-beard-${Date.now()}`,
        original: image,
        result: data.imageUrl,
        style: presetObj ? presetObj.name : 'Beard',
        color: colorObj ? colorObj.name : 'Natural',
        date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
      };
      onAddHistory(newHistoryItem);

    } catch (err) {
      clearInterval(interval);
      toast.error(err.message || 'AI Beard render failed.');
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
          <Smile size={20} color="var(--color-pink-primary)" />
          <span>AI Beard Styler</span>
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Instantly try on stubbles, full beards, mustaches, and change beard color.
        </p>
      </div>

      <div className="playground-grid">
        {/* Left Control Panel */}
        <div className="control-panel glass-panel">
          <div className="desktop-playground-header">
            <h2 className="section-title">
              <Smile size={20} color="var(--color-pink-primary)" />
              <span>AI Beard Styler</span>
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Choose beard template and select hair color.
            </p>
          </div>

          <hr style={{ border: 'none', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', margin: '1rem 0' }} />

          {/* Beard Presets */}
          <div className="selector-group">
            <span className="selector-title">SELECT BEARD STYLE</span>
            <div className="style-cards-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
              {BEARD_PRESETS.map(p => {
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
                    <div className="style-card-image-wrapper" style={{ height: '80px', flexDirection: 'column' }}>
                      <Smile size={28} style={{ color: 'var(--color-pink-primary)', opacity: 0.8 }} />
                    </div>
                    <div className="style-card-footer" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                      {p.name}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Color shade picker */}
          <div className="selector-group">
            <span className="selector-title">BEARD COLOR TINT</span>
            <div className="pill-grid">
              {BEARD_COLORS.map(c => (
                <div
                  key={c.id}
                  className={`pill-option ${selectedColor === c.id ? 'selected' : ''}`}
                  onClick={() => setSelectedColor(c.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: c.hex, border: '1px solid rgba(0,0,0,0.1)' }} />
                  <span>{c.name}</span>
                </div>
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
              <span>Apply AI Beard</span>
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
            >
              <div className="dropzone-icon">
                <Upload size={24} />
              </div>
              <h3>Upload a Photo</h3>
              <p>Drag and drop a portrait shot here to preview facial hair styles.</p>
              <button className="btn btn-secondary" onClick={(e) => { e.stopPropagation(); fileInputRef.current.click(); }}>
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
              <div className="preview-container" style={{ position: 'relative', overflow: 'hidden', borderRadius: '16px', background: '#000' }}>
                <img 
                  src={showOriginal ? image : (resultImage || image)} 
                  alt="Beard Preview"
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
                  >
                    {showOriginal ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                )}
                
                {resultImage && (
                  <div className="slider-label after" style={{ top: '1rem', right: '1rem' }}>
                    {showOriginal ? 'ORIGINAL' : 'AI BEARD'}
                  </div>
                )}
              </div>

              <div className="preview-controls" style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', width: '100%', justifyContent: 'center' }}>
                {resultImage ? (
                  <>
                    <a
                      href={resultImage}
                      download="glamai_beard.png"
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
                    Select options and click 'Apply AI Beard' to render.
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
