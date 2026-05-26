import React, { useState, useRef } from 'react';
import { Upload, Sparkles, User, Check, RefreshCw, Scissors, Smile, Eye, Award } from 'lucide-react';
import { useToast } from './Toast';
import { authFetch } from '../apiClient';

export default function FaceAnalysis({ user, onOpenAuth, setActiveTab }) {
  const toast = useToast();
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [analysisResult, setAnalysisResult] = useState(null);

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
      <div className="text-center" style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
          AI Face Scanner & Analysis
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '550px', margin: '0 auto' }}>
          Upload a selfie to scan your facial symmetry, shape, and skin undertones. Get personalized hairstyle, beard, and makeup recommendations instantly.
        </p>
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

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button className="btn btn-secondary" style={{ flex: 1 }} onClick={handleReset}>
                    <RefreshCw size={14} />
                    <span>Scan Again</span>
                  </button>
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
    </section>
  );
}
