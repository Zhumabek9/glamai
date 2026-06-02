import React, { useState, useRef } from 'react';
import { Upload, Sparkles, Coins, Download, RefreshCw, Eye, Check, HelpCircle, EyeOff, Smile, ArrowRight, Star, ChevronDown, ChevronUp, Users, Lock, Palette } from 'lucide-react';
import { useToast } from './Toast';
import { authFetch } from '../apiClient';

const BEARD_PRESETS = [
  { id: 'stubble', name: 'Classic 5 O\'clock Stubble', image: '/styles/beard_stubble.png', desc: 'Rugged, short stubble outlining the jawline for a modern, effortless aesthetic.' },
  { id: 'full-beard', name: 'Classic Full Groomed Beard', image: '/styles/beard_full.png', desc: 'Thick, dense growth, professionally lined and contoured for structure.' },
  { id: 'viking', name: 'Rugged Viking Beard', image: '/styles/beard_viking.png', desc: 'Bold, long Norse warrior style with full coverage and maximum density.' },
  { id: 'goatee', name: 'Sculpted Classic Goatee', image: '/styles/beard_goatee.png', desc: 'Tapered chin beard and matching mustache, defining the lower mouth.' },
  { id: 'mustache', name: 'Heritage Chevron Mustache', image: '/styles/beard_mustache.png', desc: 'Bold, prominent upper lip mustache with a clean-shaven face.' },
  { id: 'clean-shave', name: 'Ultra-Smooth Clean Shave', image: '/styles/beard_clean.png', desc: 'Completely bare skin, showing jawline and cheeks without shadow.' },
  { id: 'imperial', name: 'Majestic Imperial Mustache', image: '/styles/beard_imperial.png', desc: 'Groomed handlebar mustache with elegantly curled, upturned ends.' },
  { id: 'anchor', name: 'Sharp Anchor Beard', image: '/styles/beard_anchor.png', desc: 'Pointed chin beard paired with an ultra-thin mustache line.' },
  { id: 'vandyke', name: 'Dapper Van Dyke', image: '/styles/beard_vandyke.png', desc: 'Short goatee beard and disconnected mustache for a classic European profile.' },
  { id: 'balbo', name: 'Precision Balbo', image: '/styles/beard_balbo.png', desc: 'Floating mustache paired with a full chin beard and no sideburns.' },
  { id: 'beardstache', name: 'Modern Beardstache', image: '/styles/beard_beardstache.png', desc: 'Thick, heavy mustache contrasted against a light stubble shadow.' },
  { id: 'corporate', name: 'Professional Corporate Beard', image: '/styles/beard_corporate.png', desc: 'Closely-trimmed, uniform beard, neatly faded at the sideburns.' }
];

const BEARD_COLORS = [
  { id: 'natural', name: 'Natural Shade', hex: '#888888' },
  { id: 'salt-pepper', name: 'Salt & Pepper', hex: 'linear-gradient(135deg, #555555, #eeeeee)', hot: true },
  { id: 'auburn', name: 'Classic Auburn', hex: '#922b21' },
  { id: 'grizzly-brown', name: 'Grizzly Brown', hex: '#5c4033' },
  { id: 'nordic-blonde', name: 'Nordic Blonde', hex: '#f0e68c' },
  { id: 'jet-black', name: 'Jet Black', hex: '#111111' }
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
      {/* Premium Feature Landing Page Hero */}
      <div className="category-landing-hero">
        <div className="glowing-orb pink-orb"></div>
        <div className="glowing-orb purple-orb"></div>
        <h1 className="landing-title">
          <span className="gradient-text">Precision Grooming, Visualized</span>. Try Any Beard Instantly
        </h1>
        <p className="landing-subtitle">
          Preview designer stubbles, groomed full beards, mustache shapes, or clean-shaven styles mapped precisely to your jawline contours. Skip the awkward growth phases and expensive barber regrets with 100% photorealistic AI simulation.
        </p>
        <div className="landing-stats">
          <div className="stat-badge"><Smile size={14} color="var(--color-pink-primary)" /> <span>Biometric Jawline Contour Tracking</span></div>
          <div className="stat-badge"><Coins size={14} color="var(--color-pink-primary)" /> <span>Follicle-Level Neural Realism</span></div>
          <div className="stat-badge"><span>⚡ Studio-Grade Grooming Simulation</span></div>
        </div>
      </div>

      <div className="playground-grid">
        {/* Left Control Panel */}
        <div className="control-panel glass-panel">
          <div className="desktop-playground-header">
            <h2 className="section-title">
              <Smile size={20} color="var(--color-pink-primary)" />
              <span>AI Beard Workspace</span>
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Choose a beard template and pick a color shade.
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
                  <button
                    type="button"
                    key={p.id}
                    className={`style-card ${isSelected ? 'selected' : ''}`}
                    aria-pressed={isSelected}
                    aria-label={`Select beard style: ${p.name}`}
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

          {/* Color shade picker */}
          <div className="selector-group">
            <span className="selector-title">BEARD COLOR TINT</span>
            <div className="pill-grid">
              {BEARD_COLORS.map(c => (
                <button
                  type="button"
                  key={c.id}
                  className={`pill-option ${selectedColor === c.id ? 'selected' : ''}`}
                  aria-pressed={selectedColor === c.id}
                  aria-label={`Select beard color: ${c.name}`}
                  onClick={() => setSelectedColor(c.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', border: 'none', font: 'inherit', cursor: 'pointer' }}
                >
                  <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: c.hex, border: '1px solid rgba(0,0,0,0.1)' }} />
                  <span>{c.name}</span>
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
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputRef.current.click(); } }}
              aria-label="Upload photo: drag and drop a face photo here or press Enter to browse files"
            >
              <div className="dropzone-icon">
                <Upload size={24} />
              </div>
              <h3>Upload a Photo</h3>
              <p>Drag and drop a portrait shot here to preview facial hair styles.</p>
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
                      <img src={image} alt="Before Beard" />
                    </div>
                  </div>
                  <div className="before-after-col">
                    <span className="before-after-label after">After</span>
                    <div className="preview-container">
                      <img src={resultImage} alt="After Beard" />
                      <div className="slider-label after" style={{ top: '1rem', right: '1rem', bottom: 'auto' }}>AI BEARD</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="preview-container" style={{ position: 'relative', overflow: 'hidden', borderRadius: '16px', background: '#000', maxWidth: '450px', margin: '0 auto' }}>
                  <img 
                    src={image} 
                    alt="Beard Preview"
                    style={{ maxWidth: '100%', height: 'auto', display: 'block', maxHeight: '500px', objectFit: 'contain' }}
                  />
                </div>
              )}

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

      {/* --- Real Transformations --- */}
      <div className="landing-section transformations-section">
        <div className="section-header">
          <span className="section-badge">✨ Showcase</span>
          <h2>Real Transformations</h2>
          <p>Explore the natural look and realistic follicle blending of our AI beard styles.</p>
        </div>
        <div className="transformations-grid">
          {[
            { id: 1, title: '5 o\'clock Stubble', path: '/styles/beard_stubble.png', hot: true },
            { id: 2, title: 'Full Groomed Beard', path: '/styles/beard_full.png' },
            { id: 3, title: 'Viking Warrior Braids', path: '/styles/beard_viking.png' },
            { id: 4, title: 'Classic Goatee Style', path: '/styles/beard_goatee.png' },
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
          <h2>4 Steps to a Perfect Beard Style</h2>
          <p>Preview beard templates instantly before committing to growing or shaving.</p>
        </div>
        <div className="process-timeline">
          {[
            { num: '01', title: 'Upload Photo', desc: 'Drag and drop a front-facing selfie with clear chin lighting.', icon: <Upload size={24} /> },
            { num: '02', title: 'Choose Beard', desc: 'Select from stubbles, heavy Viking beards, or goatees.', icon: <Smile size={24} /> },
            { num: '03', title: 'Color Matcher', desc: 'Select a matching hair dye shade from our 6 presets.', icon: <Palette size={24} /> },
            { num: '04', title: 'Save Preview', desc: 'Download your high-definition AI beard preview to show your barber.', icon: <Download size={24} /> },
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
          <h2>Loved by Men Globally</h2>
          <p>See how users use GlamAI to style their facial hair with complete confidence.</p>
        </div>
        <div className="testimonials-grid">
          {[
            { name: 'Dave H.', meta: 'Viking Beard Style', avatar: '🧔', text: 'The Viking Beard render is hilarious but looks incredibly real! The follicles look fully detailed and integrate perfectly with my chin shape.' },
            { name: 'Alex P.', meta: '5 o\'clock Stubble', avatar: '🧑🏽', text: 'I wanted to see if stubble suited me or if I should remain clean-shaven. This tool made it so easy to make a decision. Worth every token.' },
            { name: 'Marcus T.', meta: 'Goatee Style', avatar: '👨', text: 'The color matching is flawless. I chose dark-brown and it matches my natural hair perfectly. Super helpful tool.' }
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
          <h2>Advanced Follicle Projection</h2>
          <p>Our algorithms place individual hair layers aligning to your skin curvature.</p>
        </div>
        <div className="benefits-grid">
          {[
            { title: 'Follicle Synthesis', desc: 'Generates thousands of individual hair fibers for natural looking depth.', icon: <Sparkles size={24} /> },
            { title: 'Jawline Sculpting', desc: 'Wraps templates around cheeks and chin lines with zero displacement.', icon: <Smile size={24} /> },
            { title: 'Shave Simulation', desc: 'Allows you to preview a completely smooth clean-shaven face instantly.', icon: <Check size={24} /> },
            { title: 'Safe Processing', desc: 'All uploads are secure. We respect your biometric privacy.', icon: <Lock size={24} /> },
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
            <h2>Common Beard Styling Inquiries</h2>
            <p>Everything you need to know about our virtual beard salon.</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
            {[
              { q: 'Can I preview beards if I currently have facial hair?', a: 'Yes! The AI can overlay templates such as clean shave over existing stubble, or build viking beards over small goatees.' },
              { q: 'Will it match my eyebrow and hair color?', a: 'Yes, select from Jet Black, Dark Brown, Blonde, Ginger, or Silver to match your natural hair color.' },
              { q: 'Does it support patchy beard adjustments?', a: 'Yes, selecting presets like Full Groomed Beard filling in patchy spots automatically for a fuller look.' }
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
            Preview your new look and find the perfect beard balance for your face shape today.
          </p>
          <button className="btn btn-primary" onClick={() => window.scrollTo({ top: 380, behavior: 'smooth' })} style={{ padding: '1rem 2rem', fontSize: '1.05rem', boxShadow: '0 10px 20px var(--color-pink-glow)' }}>
            <span>Style Your Beard Now</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
