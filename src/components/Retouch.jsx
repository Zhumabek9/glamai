import React, { useState, useRef } from 'react';
import { Upload, Sparkles, Coins, Download, RefreshCw, Eye, Check, HelpCircle, EyeOff } from 'lucide-react';
import { useToast } from './Toast';
import { authFetch } from '../apiClient';

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
      const retouchConfig = JSON.stringify({
        smoothSkin,
        teethWhitening,
        eyeEnhancement,
        faceSymmetry,
        acneRemoval,
        skinGlow
      });

      const formData = new FormData();
      formData.append('image', imageFile);
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
      <div className="mobile-playground-header">
        <h2 className="section-title">
          <Sparkles size={20} color="var(--color-pink-primary)" />
          <span>Beauty Retouch</span>
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Smooth skin, whiten teeth, remove acne blemishes, and enhance eye details.
        </p>
      </div>

      <div className="playground-grid">
        {/* Left Control Panel */}
        <div className="control-panel glass-panel">
          <div className="desktop-playground-header">
            <h2 className="section-title">
              <Sparkles size={20} color="var(--color-pink-primary)" />
              <span>Beauty Retouch</span>
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Adjust sliders to apply retouch edits.
            </p>
          </div>

          <hr style={{ border: 'none', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', margin: '1rem 0' }} />

          {/* Sliders */}
          <div className="selector-group" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Smooth Skin */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                <span>SMOOTH SKIN</span>
                <span>{smoothSkin}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={smoothSkin} 
                onChange={(e) => setSmoothSkin(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--color-pink-primary)' }}
              />
            </div>

            {/* Teeth Whitening */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                <span>TEETH WHITENING</span>
                <span>{teethWhitening}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={teethWhitening} 
                onChange={(e) => setTeethWhitening(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--color-pink-primary)' }}
              />
            </div>

            {/* Eye Enhancement */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                <span>EYE ENHANCEMENT</span>
                <span>{eyeEnhancement}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={eyeEnhancement} 
                onChange={(e) => setEyeEnhancement(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--color-pink-primary)' }}
              />
            </div>

            {/* Face Symmetry */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                <span>FACE SYMMETRY ENHANCEMENT</span>
                <span>{faceSymmetry}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={faceSymmetry} 
                onChange={(e) => setFaceSymmetry(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--color-pink-primary)' }}
              />
            </div>

            {/* Skin Glow */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                <span>DEWY SKIN GLOW</span>
                <span>{skinGlow}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={skinGlow} 
                onChange={(e) => setSkinGlow(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--color-pink-primary)' }}
              />
            </div>

            {/* Acne Removal Checkbox */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }} onClick={() => setAcneRemoval(!acneRemoval)}>
              <div style={{ width: '18px', height: '18px', borderRadius: '4px', border: '2px solid var(--color-pink-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: acneRemoval ? 'var(--color-pink-primary)' : 'transparent', transition: 'all 0.15s ease' }}>
                {acneRemoval && <Check size={12} color="#fff" />}
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>ACNE & BLEMISH REMOVAL</span>
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
              <span>Apply AI Retouch</span>
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
              <h3>Upload a Portrait Photo</h3>
              <p>Upload a selfie or headshot to retouch and polish.</p>
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
                  alt="Retouch Preview"
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
                    {showOriginal ? 'ORIGINAL' : 'AI RETOUCHED'}
                  </div>
                )}
              </div>

              <div className="preview-controls" style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', width: '100%', justifyContent: 'center' }}>
                {resultImage ? (
                  <>
                    <a
                      href={resultImage}
                      download="glamai_retouch.png"
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
                    Adjust sliders and click 'Apply AI Retouch' to render.
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
