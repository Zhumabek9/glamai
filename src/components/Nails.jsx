import React, { useState, useRef } from 'react';
import { Upload, Sparkles, Coins, Download, RefreshCw, Eye, Check, HelpCircle, EyeOff, ArrowRight, Star, ChevronDown, ChevronUp, Users, Lock, Palette } from 'lucide-react';
import { useToast } from './Toast';
import { authFetch } from '../apiClient';

const NAIL_PRESETS = [
  { id: 'french', name: 'Timeless French Tip', image: '/styles/nails_french.png', desc: 'Classic nude pink base with clean, crisp white crescent tips.' },
  { id: 'chrome', name: 'Mirror Silver Chrome', image: '/styles/nails_chrome.png', desc: 'High-wattage liquid metal chrome finish reflecting cool silver undertones.' },
  { id: 'acrylic', name: 'Pink Marble Acrylic', image: '/styles/nails_acrylic.png', desc: 'Sculpted coffin extensions with luxurious pink-and-white marble veins.' },
  { id: 'luxury', name: 'Luxury Gold Foil', image: '/styles/nails_luxury.png', desc: 'Bespoke manicure with gold leaf flecks and subtle diamond-like accents.' },
  { id: 'minimal', name: 'Minimalist Nude Gel', image: '/styles/nails_minimal.png', desc: 'Sheer glossy nude top coat over short natural nails.' },
  { id: 'pink', name: 'Soft Blush Pink', image: '/styles/nails_pink.png', desc: 'Sweet, opaque pastel cotton-candy pink gel polish.' },
  { id: 'black', name: 'High-Gloss Goth Black', image: '/styles/nails_black.png', desc: 'Deep obsidian black lacquer with a mirror-shine gloss coat.' },
  { id: 'cat-eye', name: 'Velvet Cat-Eye Shimmer', image: '/styles/nails_cat_eye.png', desc: 'Magnetic dimensional velvet polish that shifts in the light.' },
  { id: 'aurora', name: 'Opalescent Aurora Glass', image: '/styles/nails_aurora.png', desc: 'Iridescent pearl glaze with shifting lilac and teal reflections.' }
];

const NAIL_SHAPES = [
  { id: 'almond', name: 'Almond Shape' },
  { id: 'coffin', name: 'Coffin Shape' },
  { id: 'stiletto', name: 'Stiletto Shape' },
  { id: 'square', name: 'Square Shape' },
  { id: 'round', name: 'Round Shape' }
];

const NAIL_TEXTURES = [
  { id: 'liquid-chrome', name: 'Liquid Chrome' },
  { id: 'glazed-donut', name: 'Glazed Donut' },
  { id: 'marble-foil', name: 'Marble Foil' },
  { id: 'glossy-gel', name: 'Glossy Gel' },
  { id: 'velvet-matte', name: 'Velvet Matte' }
];

export default function Nails({ user, guestTokens, onDeductToken, onOpenAuth, onAddHistory, setActiveTab }) {
  const toast = useToast();
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [selectedPreset, setSelectedPreset] = useState('french');
  const [selectedShape, setSelectedShape] = useState('almond');
  const [selectedTexture, setSelectedTexture] = useState('glossy-gel');
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
      {/* Premium Feature Landing Page Hero */}
      <div className="category-landing-hero">
        <div className="glowing-orb pink-orb"></div>
        <div className="glowing-orb purple-orb"></div>
        <h1 className="landing-title">
          <span className="gradient-text">Virtual Nail Couture, Zero Dry Time</span>. Try Premium AI Nails
        </h1>
        <p className="landing-subtitle">
          Test high-gloss liquid chrome overlays, timeless french tips, marble acrylics, or bespoke nail art in real time. Perfect your shape and shade to show your technician. Zero dry time, zero salon commitment.
        </p>
        <div className="landing-stats">
          <div className="stat-badge"><Sparkles size={14} color="var(--color-pink-primary)" /> <span>Biometric Fingertip Contour Tracking</span></div>
          <div className="stat-badge"><Coins size={14} color="var(--color-pink-primary)" /> <span>Specular Reflection Gloss Shaders</span></div>
          <div className="stat-badge"><span>⚡ Studio-Grade Manicure Templates</span></div>
        </div>
      </div>

      <div className="playground-grid">
        {/* Left Control Panel */}
        <div className="control-panel glass-panel">
          <div className="desktop-playground-header">
            <h2 className="section-title">
              <Sparkles size={20} color="var(--color-pink-primary)" />
              <span>AI Nails Workspace</span>
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Select a nail template design below.
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
                  <button
                    type="button"
                    key={p.id}
                    className={`style-card ${isSelected ? 'selected' : ''}`}
                    aria-pressed={isSelected}
                    aria-label={`Select nails design: ${p.name}`}
                    onClick={() => setSelectedPreset(p.id)}
                    style={{ border: 'none', background: 'transparent', padding: '0.5rem', cursor: 'pointer', display: 'block', width: '100%', textAlign: 'left' }}
                  >
                    {isSelected && (
                      <div className="selected-badge">
                        <Check size={12} />
                      </div>
                    )}
                    <div className="style-card-image-wrapper">
                      <img 
                        src={p.image} 
                        alt={p.name} 
                        className="style-card-img" 
                      />
                      <div className="style-card-overlay"></div>
                    </div>
                    <div className="style-card-footer" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                      {p.name}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          {/* Nail Shape Selection */}
          <div className="selector-group">
            <span className="selector-title">NAIL SHAPE</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
              {NAIL_SHAPES.map(s => (
                <button
                  key={s.id}
                  className={`btn ${selectedShape === s.id ? 'btn-primary' : 'btn-secondary'}`}
                  aria-pressed={selectedShape === s.id}
                  style={{ padding: '0.5rem 0.75rem', fontSize: '0.75rem' }}
                  onClick={() => setSelectedShape(s.id)}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          {/* Nail Texture Selection */}
          <div className="selector-group">
            <span className="selector-title">NAIL TEXTURE</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
              {NAIL_TEXTURES.map(tObj => (
                <button
                  key={tObj.id}
                  className={`btn ${selectedTexture === tObj.id ? 'btn-primary' : 'btn-secondary'}`}
                  aria-pressed={selectedTexture === tObj.id}
                  style={{ padding: '0.5rem 0.75rem', fontSize: '0.75rem' }}
                  onClick={() => setSelectedTexture(tObj.id)}
                >
                  {tObj.name}
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
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputRef.current.click(); } }}
              aria-label="Upload photo: drag and drop a hand and nails photo here or press Enter to browse files"
            >
              <div className="dropzone-icon">
                <Upload size={24} />
              </div>
              <h3>Upload a Photo of Your Hand</h3>
              <p>Upload a photo showing your fingers and nails clearly to apply templates.</p>
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
                    <span className="before-after-label before">Before</span>
                    <div className="preview-container">
                      <img src={image} alt="Before Nails" />
                    </div>
                  </div>
                  <div className="before-after-col">
                    <span className="before-after-label after">After</span>
                    <div className="preview-container">
                      <img src={resultImage} alt="After Nails" />
                      <div className="slider-label after" style={{ top: '1rem', right: '1rem', bottom: 'auto' }}>AI NAILS</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="preview-container" style={{ position: 'relative', overflow: 'hidden', borderRadius: '16px', background: '#000', maxWidth: '450px', margin: '0 auto' }}>
                  <img 
                    src={image} 
                    alt="Nails Preview"
                    style={{ maxWidth: '100%', height: 'auto', display: 'block', maxHeight: '500px', objectFit: 'contain' }}
                  />
                </div>
              )}

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

      {/* --- Real Transformations --- */}
      <div className="landing-section transformations-section">
        <div className="section-header">
          <span className="section-badge">✨ Showcase</span>
          <h2>Real Transformations</h2>
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
          <span className="section-badge">⚡ Simple Process</span>
          <h2>4 Steps to Glamorous Nails</h2>
          <p>Get a virtual manicure with zero dry time and no salon appointments.</p>
        </div>
        <div className="process-timeline">
          {[
            { num: '01', title: 'Capture Hand', desc: 'Take a photo of your hand flat on a plain background.', icon: <Upload size={24} /> },
            { num: '02', title: 'Pick Nail Art', desc: 'Select French tips, chromes, gold foil, or plain gels.', icon: <Palette size={24} /> },
            { num: '03', title: 'Fingertip Tracking', desc: 'Our AI auto-detects and aligns templates to all 5 fingers.', icon: <Sparkles size={24} /> },
            { num: '04', title: 'Download Look', desc: 'Save high-definition mockups to show your technician.', icon: <Download size={24} /> },
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

      {/* --- Real Stories --- */}
      <div className="landing-section testimonials-section">
        <div className="section-header">
          <span className="section-badge">💬 Real Stories</span>
          <h2>Loved by Nail Artists</h2>
          <p>See why users use GlamAI to draft manicure ideas and choose templates.</p>
        </div>
        <div className="testimonials-grid">
          {[
            { name: 'Jess B.', meta: 'Mirror Chrome Set', avatar: '💅', text: 'I wanted to see if mirror silver chrome suited my skin tone before buying a powder kit. The AI reflection shader is extremely realistic!' },
            { name: 'Maya S.', meta: 'Luxury Gold Foil', avatar: '🌸', text: 'Showed the Gold Foil design preview to my nail technician. She was impressed by the placement suggestion and replicated it perfectly.' },
            { name: 'Taylor R.', meta: 'Pink Marble Acrylics', avatar: '✨', text: 'The coffin extension preview looked so seamless. Gives a clean impression of length without actually putting glue on my fingers.' }
          ].map((review, i) => (
            <div key={i} className="testimonial-card glass-panel">
              <div className="testimonial-stars">
                {[...Array(5)].map((_, si) => (
                  <Star key={si} size={14} fill="var(--color-pink-primary)" color="var(--color-pink-primary)" />
                ))}
              </div>
              <p className="testimonial-text">{review.text}</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar" style={{ background: 'var(--gradient-pink-purple)', color: '#fff' }}>
                  {review.avatar}
                </div>
                <div className="testimonial-author-info">
                  <span className="testimonial-name">{review.name}</span>
                  <span className="testimonial-meta">{review.meta}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- Why Choose Us --- */}
      <div className="landing-section why-choose-section">
        <div className="section-header">
          <span className="section-badge">🏆 Why Choose Us</span>
          <h2>Precision Nail Overlay Shader</h2>
          <p>Our algorithms track fingernails under active light projections for natural shine.</p>
        </div>
        <div className="benefits-grid">
          {[
            { title: 'Fingertip Detection', desc: 'Auto-maps boundaries of each nail plate with zero manual adjustment.', icon: <Sparkles size={24} /> },
            { title: 'Shape Adjustments', desc: 'Supports coffin, almond, and round manicure presets cleanly.', icon: <Palette size={24} /> },
            { title: 'High-Gloss Topcoats', desc: 'Simulates photorealistic lighting reflections over metallic and matte gel layers.', icon: <Check size={24} /> },
            { title: 'Secure Processing', desc: 'Uploads are secure. Your hand and face data remains 100% private.', icon: <Lock size={24} /> },
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
            <span className="section-badge">❓ Got Questions?</span>
            <h2>Common Nail Inquiries</h2>
            <p>Everything you need to know about our virtual nail studio.</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
            {[
              { q: 'Do I need to show my whole hand in the picture?', a: 'Showing your fingers flat from a top-down angle under clear natural light works best for the fingertip tracking.' },
              { q: 'Does it work if I already have nail polish on?', a: 'Yes! The AI overrides existing colors and designs, masking them completely with the selected template.' },
              { q: 'Can I choose nail length parameters?', a: 'Currently length is managed by preset styles, ranging from short minimal gels to long coffin acrylics.' }
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
            Preview your next manicure design and find the perfect color balance for your hands today.
          </p>
          <button className="btn btn-primary" onClick={() => window.scrollTo({ top: 380, behavior: 'smooth' })} style={{ padding: '1rem 2rem', fontSize: '1.05rem', boxShadow: '0 10px 20px var(--color-pink-glow)' }}>
            <span>Style Your Nails Now</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
