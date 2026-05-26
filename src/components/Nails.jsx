import React, { useState, useRef } from 'react';
import { Upload, Sparkles, Coins, Download, RefreshCw, Eye, Check, HelpCircle, EyeOff } from 'lucide-react';
import { useToast } from './Toast';
import { authFetch } from '../apiClient';

const NAIL_PRESETS = [
  { id: 'french', name: 'French Manicure', desc: 'Classic clean base with white tips.' },
  { id: 'chrome', name: 'Mirror Chrome', desc: 'Futuristic high-shine silver chrome glaze.' },
  { id: 'acrylic', name: 'Marble Acrylic', desc: 'Long coffin acrylics with elegant pink marble art.' },
  { id: 'luxury', name: 'Luxury Gold Foil', desc: 'Glitz finish with gold foil leafing and subtle gems.' },
  { id: 'minimal', name: 'Minimalist Nude', desc: 'Short gel finish with clean sheer glossy top coat.' },
  { id: 'pink', name: 'Blush Pink', desc: 'Sweet soft cotton candy pink gel nails.' },
  { id: 'black', name: 'Goth Glossy Black', desc: 'Sleek, high-gloss solid black nails.' }
];

export default function Nails({ user, guestTokens, onDeductToken, onOpenAuth, onAddHistory, setActiveTab }) {
  const toast = useToast();
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [selectedPreset, setSelectedPreset] = useState('french');
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
      toast.error(`You need at least 10 tokens to generate nails!`);
      setActiveTab('pricing');
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setLoadingText('Uploading hand photo...');

    const steps = [
      { prg: 20, txt: 'Detecting hands and fingers...' },
      { prg: 50, txt: 'Isolating fingernail coordinates...' },
      { prg: 75, txt: 'Applying digital nail extensions...' },
      { prg: 90, txt: 'Refining lighting & gloss highlights...' }
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
      const presetObj = NAIL_PRESETS.find(n => n.id === selectedPreset);

      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('taskType', 'nails');
      formData.append('nails', presetObj ? presetObj.name : 'French nails');
      formData.append('gender', 'female');

      const res = await authFetch('/api/generate', {
        method: 'POST',
        body: formData
      });

      clearInterval(interval);

      if (!res.ok) {
        throw new Error('Nail render failed');
      }

      const data = await res.json();
      setResultImage(data.imageUrl);
      setProgress(100);
      toast.success("AI Nails applied successfully!");
      onDeductToken(tokenCost);

      const newHistoryItem = {
        id: `history-nails-${Date.now()}`,
        original: image,
        result: data.imageUrl,
        style: presetObj ? presetObj.name : 'Nails',
        color: 'Nail Art',
        date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
      };
      onAddHistory(newHistoryItem);

    } catch (err) {
      clearInterval(interval);
      toast.error(err.message || 'AI Nails render failed.');
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
          <span>AI Nails Studio</span>
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Try on French manicure, acrylics, and luxury mirror chrome nail arts instantly.
        </p>
      </div>

      <div className="playground-grid">
        {/* Left Control Panel */}
        <div className="control-panel glass-panel">
          <div className="desktop-playground-header">
            <h2 className="section-title">
              <Sparkles size={20} color="var(--color-pink-primary)" />
              <span>AI Nails Studio</span>
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Choose a template nail design.
            </p>
          </div>

          <hr style={{ border: 'none', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', margin: '1rem 0' }} />

          {/* Nails Presets */}
          <div className="selector-group">
            <span className="selector-title">SELECT NAILS DESIGN</span>
            <div className="style-cards-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
              {NAIL_PRESETS.map(p => {
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
                      <Sparkles size={24} style={{ color: 'var(--color-pink-primary)' }} />
                    </div>
                    <div className="style-card-footer" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                      {p.name}
                    </div>
                  </div>
                );
              })}
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
              <span>Apply AI Nails</span>
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
              <h3>Upload a Photo of Your Hand</h3>
              <p>Upload a photo showing your fingers and nails clearly to apply templates.</p>
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
                  alt="Nails Preview"
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
                    {showOriginal ? 'ORIGINAL' : 'AI NAILS'}
                  </div>
                )}
              </div>

              <div className="preview-controls" style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', width: '100%', justifyContent: 'center' }}>
                {resultImage ? (
                  <>
                    <a
                      href={resultImage}
                      download="glamai_nails.png"
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
                    Ready. Choose a style and click 'Apply AI Nails'.
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
