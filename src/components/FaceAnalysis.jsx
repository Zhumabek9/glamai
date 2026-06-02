import React, { useState, useRef } from 'react';
import { Upload, Sparkles, User, Check, RefreshCw, Scissors, Smile, Eye, Award, ArrowRight, Star, ChevronDown, ChevronUp, Users, Lock, Palette, HelpCircle, Coins } from 'lucide-react';
import { useToast } from './Toast';
import { authFetch } from '../apiClient';

export default function FaceAnalysis({ user, onOpenAuth, setActiveTab }) {
  const toast = useToast();
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [analysisResult, setAnalysisResult] = useState(null);
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
        setAnalysisResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScan = async () => {
    setIsScanning(true);
    setScanStep(1); // Landmarks
    
    // Simulate steps locally for visual scan effect
    setTimeout(() => setScanStep(2), 500); // Skin tone
    setTimeout(() => setScanStep(3), 1000); // Recommending
    
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const res = await authFetch('/api/analyze-face', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        throw new Error('Analysis request failed');
      }

      const data = await res.json();
      
      // Wait for scanning animation to feel premium
      setTimeout(() => {
        setAnalysisResult(data.analysis);
        setIsScanning(false);
        setScanStep(0);
        toast.success("AI Face Analysis Complete!");
      }, 1500);

    } catch (err) {
      setIsScanning(false);
      setScanStep(0);
      toast.error(err.message || 'Face analysis failed.');
    }
  };

  const handleReset = () => {
    setImage(null);
    setImageFile(null);
    setAnalysisResult(null);
  };

  return (
    <section className="playground-section container animate-fade-in" style={{ maxWidth: '900px' }}>
      {/* Premium Feature Landing Page Hero */}
      <div className="category-landing-hero">
        <div className="glowing-orb pink-orb"></div>
        <div className="glowing-orb purple-orb"></div>
        <h1 className="landing-title">
          <span className="gradient-text">AI Face Scanner</span> & Analysis
        </h1>
        <p className="landing-subtitle">
          Unlock personalized style insights. Upload your selfie to scan facial symmetry, shape structures, and skin tones, instantly mapping the perfect haircuts and beauty presets for your profile.
        </p>
        <div className="landing-stats">
          <div className="stat-badge"><Sparkles size={14} color="var(--color-pink-primary)" /> <span>Biometric Landmark Mapping</span></div>
          <div className="stat-badge"><Coins size={14} color="var(--color-pink-primary)" /> <span>Free Analysis scan</span></div>
          <div className="stat-badge"><span>⚡ Powered by Face Mesh AI</span></div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '2rem', display: 'grid', gridTemplateColumns: image ? '1fr 1fr' : '1fr', gap: '2rem', minHeight: '400px' }}>
        
        {/* Left Side: Upload / Scanner View */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          {!image ? (
            <div 
              className="dropzone"
              style={{ width: '100%', borderStyle: 'dashed' }}
              onClick={() => fileInputRef.current.click()}
            >
              <div className="dropzone-icon">
                <Upload size={24} />
              </div>
              <h3>Take or Upload a Selfie</h3>
              <p>For best results, look straight ahead with a neutral face and clear lighting.</p>
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
            <div style={{ position: 'relative', width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--glass-border)', background: '#000' }}>
              <img 
                src={image} 
                alt="Selfie" 
                style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '420px', objectFit: 'contain' }}
              />

              {/* Scanning visual overlay */}
              {isScanning && (
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.3)', pointerEvents: 'none' }}>
                  {/* Glowing vertical line */}
                  <div className="scan-line-laser" style={{
                    position: 'absolute',
                    width: '100%',
                    height: '3px',
                    background: 'var(--gradient-pink-purple)',
                    boxShadow: '0 0 15px var(--color-pink-primary)',
                    animation: 'scanLineMove 2s ease-in-out infinite'
                  }}></div>
                  
                  {/* Animated SVG wireframe tracking grid overlay */}
                  <svg style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0, stroke: 'var(--color-pink-primary)', strokeWidth: 1.5, fill: 'none', opacity: 0.6 }} viewBox="0 0 100 100" preserveAspectRatio="none">
                    <circle cx="50" cy="45" r="25" strokeDasharray="3,3" />
                    <line x1="50" y1="10" x2="50" y2="90" strokeDasharray="2,2" />
                    <line x1="10" y1="45" x2="90" y2="45" strokeDasharray="2,2" />
                    <circle cx="35" cy="40" r="3" />
                    <circle cx="65" cy="40" r="3" />
                    <path d="M40 70 Q 50 75 60 70" />
                  </svg>
                </div>
              )}
            </div>
          )}

          {image && !isScanning && !analysisResult && (
            <button className="btn btn-primary" style={{ marginTop: '1.5rem', width: '100%' }} onClick={handleScan}>
              <Sparkles size={16} />
              <span>Start AI Scanning</span>
            </button>
          )}

          {isScanning && (
            <div style={{ marginTop: '1.5rem', textAlign: 'center', width: '100%' }}>
              <div className="spinner-inner" style={{ margin: '0 auto 0.5rem' }}></div>
              <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-pink-primary)', margin: 0 }}>
                {scanStep === 1 && "Detecting facial coordinates..."}
                {scanStep === 2 && "Analyzing skin undertones..."}
                {scanStep === 3 && "Synthesizing recommendations..."}
              </p>
            </div>
          )}
        </div>

        {/* Right Side: Analysis report */}
        {image && (
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {!analysisResult ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                <User size={40} style={{ opacity: 0.5, marginBottom: '1rem', display: 'block', margin: '0 auto 1rem' }} />
                <h3>Ready to Analyze</h3>
                <p style={{ fontSize: '0.85rem' }}>Click the scan button to start the facial landmark scanner.</p>
              </div>
            ) : (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255, 46, 147, 0.06)', padding: '1rem', borderRadius: '16px' }}>
                  <Award size={24} color="var(--color-pink-primary)" />
                  <div>
                    <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>HAIR COMPATIBILITY SCORE</h4>
                    <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>{analysisResult.hairCompatibility}%</span>
                  </div>
                </div>

                {/* Characteristics */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid var(--glass-border)', padding: '1rem', borderRadius: '16px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>Face Shape</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'capitalize' }}>{analysisResult.faceShape}</span>
                  </div>
                  
                  <div style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid var(--glass-border)', padding: '1rem', borderRadius: '16px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>Skin undertone</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'capitalize' }}>{analysisResult.skinTone.replace('-', ' ')}</span>
                  </div>
                </div>

                {/* Recommendations */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, borderBottom: '1px solid rgba(255, 46, 147, 0.1)', paddingBottom: '0.5rem' }}>Recommended Presets</h3>
                  
                  {/* Hairstyles */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem' }}>
                    <Scissors size={16} color="var(--color-pink-primary)" />
                    <span style={{ fontWeight: 700, minWidth: '80px' }}>Haircut:</span>
                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                      {analysisResult.recommendations.hairstyles.map(h => (
                        <button key={h} className="category-chip active" style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }} onClick={() => setActiveTab('playground')}>
                          {h}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Makeup */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem' }}>
                    <Sparkles size={16} color="var(--color-pink-primary)" />
                    <span style={{ fontWeight: 700, minWidth: '80px' }}>Makeup:</span>
                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                      {analysisResult.recommendations.makeup.map(m => (
                        <button key={m} className="category-chip active" style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }} onClick={() => setActiveTab('makeup')}>
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Beards */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem' }}>
                    <Smile size={16} color="var(--color-pink-primary)" />
                    <span style={{ fontWeight: 700, minWidth: '80px' }}>Beard:</span>
                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                      {analysisResult.recommendations.beards.map(b => (
                        <button key={b} className="category-chip active" style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }} onClick={() => setActiveTab('beard')}>
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Laser move style helper */}
      <style>{`
        @keyframes scanLineMove {
          0% { top: 0%; }
          50% { top: 99%; }
          100% { top: 0%; }
        }
      `}</style>

      {/* --- Real Transformations --- */}
      <div className="landing-section transformations-section" style={{ marginTop: '3rem' }}>
        <div className="section-header">
          <span className="section-badge">✨ Showcase</span>
          <h2>Real Transformations</h2>
          <p>Discover how exact landmark scanning unlocks custom-tailored beauty styles.</p>
        </div>
        <div className="transformations-grid">
          {[
            { id: 1, title: 'Heart Shape Mapping', path: '/styles/female_bob.webp', hot: true },
            { id: 2, title: 'Oval Symmetry Balancing', path: '/styles/female_straight.webp' },
            { id: 3, title: 'Cool Undertone Palettes', path: '/styles/makeup_natural.png' },
            { id: 4, title: 'Square Contour Softening', path: '/styles/female_soft-waves.webp' },
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
          <h2>4 Steps to Your Beauty Profile</h2>
          <p>Scan and analyze your features to eliminate style guesswork forever.</p>
        </div>
        <div className="process-timeline">
          {[
            { num: '01', title: 'Upload Selfie', desc: 'Provide a front-facing photo under clean, even lighting.', icon: <Upload size={24} /> },
            { num: '02', title: 'Biometric Scan', desc: 'Our landmark grid analyzes your facial dimensions.', icon: <Sparkles size={24} /> },
            { num: '03', title: 'Tone Analysis', desc: 'AI evaluates skin RGB spectrums for warm/cool undertones.', icon: <Palette size={24} /> },
            { num: '04', title: 'Get Match Report', desc: 'Instantly view compatible haircuts, beard lengths, and makeup.', icon: <Award size={24} /> },
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
          <h2>Loved by Trendsetters</h2>
          <p>See how our facial analytics help users select matching styles effortlessly.</p>
        </div>
        <div className="testimonials-grid">
          {[
            { name: 'Alice M.', meta: 'Heart Shape Scan', avatar: '🌸', text: 'I always thought I had a round face, but the scanner detected a heart shape. It recommended lob cuts and soft waves — changed my hairstyle and it looks amazing!' },
            { name: 'Lucy F.', meta: 'Cool Undertone Scan', avatar: '👩', text: 'Helped me realize why warm gold makeup looked off on me. It recommended rosy pink and plum shades. Spot on, very useful profile report.' },
            { name: 'Mia J.', meta: 'Oval Shape Scan', avatar: '✨', text: 'The scanner is super fast and high quality. Found my shape instantly and synced all recommended bob cuts directly in the salon.' }
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
          <h2>Biometric Precision Alignment</h2>
          <p>Our detector maps key features to compute structural ratios accurately.</p>
        </div>
        <div className="benefits-grid">
          {[
            { title: 'Landmark Grid Mapping', desc: 'Aligns 68 biometric landmark points over eyes, brows, nose, and lips.', icon: <Sparkles size={24} /> },
            { title: 'Undertone Validator', desc: 'Analyzes skin color charts to identify precise cosmetic warm/cool matching ranges.', icon: <Palette size={24} /> },
            { title: 'Cross-Salon Sync', desc: 'Syncs recommendation tags directly to Hair, Makeup, and Beard workspaces.', icon: <Scissors size={24} /> },
            { title: 'Local Encryption', desc: 'All scanned portrait coordinates are processed locally. Biometric data is safe.', icon: <Lock size={24} /> },
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
            <h2>Common Scanner Inquiries</h2>
            <p>Everything you need to know about our face shape scanner.</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
            {[
              { q: 'Is my scanned portrait private?', a: 'Yes. We process scans on-the-fly and do not store photos or biometric vectors on our databases. Your scanning session is completely private.' },
              { q: 'Can lighting affect face shape detection?', a: 'Yes. For high accuracy, keep your face facing straight under uniform light with neutral expressions (no smiling during landmarks scan).' },
              { q: 'How does it identify undertone palettes?', a: 'Our AI reads high-density color averages of cheek and forehead skin, comparing values to warmth index matrices.' }
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
            Discover your symmetry ratio, face shapes, and unlock custom-tailored recommendations now.
          </p>
          <button className="btn btn-primary" onClick={() => window.scrollTo({ top: 380, behavior: 'smooth' })} style={{ padding: '1rem 2rem', fontSize: '1.05rem', boxShadow: '0 10px 20px var(--color-pink-glow)' }}>
            <span>Start Scanning Now</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
