const fs = require('fs');

let content = fs.readFileSync('src/components/Makeup.jsx', 'utf8');

// 1. Add missing imports
if (!content.includes('Download')) {
  content = content.replace('Upload, Sparkles, RefreshCw', 'Upload, Sparkles, RefreshCw, Download, Share2');
}

// 2. States
content = content.replace(
  "const [selectedPreset, setSelectedPreset] = useState('bronze');",
  `const [selectedCombinations, setSelectedCombinations] = useState([{ id: 1, presetId: 'bronze', lipstickId: 'none' }]);`
);
content = content.replace(
  "const [resultImage, setResultImage] = useState(null);",
  `const [resultImages, setResultImages] = useState([]);
  const [activeResultIndex, setActiveResultIndex] = useState(0);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [lightboxTitle, setLightboxTitle] = useState('');`
);
content = content.replace(
  "observer.observe(sliderRef.current);\n    return () => observer.disconnect();\n  }, [resultImage]);",
  `observer.observe(sliderRef.current);\n    return () => observer.disconnect();\n  }, [resultImages, activeResultIndex]);`
);

// 3. styleContext
const styleCtxMatch = `      if (matched) {
        setSelectedPreset(matched.id);
        toast.success(\`Makeup preset pre-selected: \${matched.name}\`);`;
const styleCtxReplace = `      if (matched) {
        setSelectedCombinations([{ id: Date.now(), presetId: matched.id, lipstickId: 'none' }]);
        toast.success(\`Makeup preset pre-selected: \${matched.name}\`);`;
content = content.replace(styleCtxMatch, styleCtxReplace);

// 4. loadImage
const loadImageMatch = `      setImage(event.target.result);
      setResultImage(null);`;
const loadImageReplace = `      setImage(event.target.result);
      setResultImages([]);
      setActiveResultIndex(0);`;
content = content.replace(loadImageMatch, loadImageReplace);

// 5. handleApplyQuickPreset
const qpMatch = `  const handleApplyQuickPreset = (qp) => {
    setActiveQuickPreset(qp.id);
    setSelectedPreset(qp.preset);
    toast.success(\`"\${qp.name}" preset applied!\`);`;
const qpReplace = `  const handleApplyQuickPreset = (qp) => {
    setActiveQuickPreset(qp.id);
    setSelectedCombinations(prev => {
      if (prev.find(c => c.presetId === qp.preset)) return prev;
      return [...prev, { id: Date.now(), presetId: qp.preset, lipstickId: selectedLipstick }];
    });
    toast.success(\`"\${qp.name}" preset applied!\`);`;
content = content.replace(qpMatch, qpReplace);

// 6. handleReset
const resetMatch = `    setImageFile(null);
    setResultImage(null);`;
const resetReplace = `    setImageFile(null);
    setResultImages([]);
    setActiveResultIndex(0);`;
content = content.replace(resetMatch, resetReplace);

// 7. handleGenerate (using start/end block approach from update2.cjs)
const startPattern = "const handleGenerate = async () => {";
const endPattern = "  const handleFeedback = (type) => {";
const startIndex = content.indexOf(startPattern);
const endIndex = content.indexOf(endPattern);

if (startIndex !== -1 && endIndex !== -1) {
  const newHandleGenerate = `const handleGenerate = async () => {
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
      toast.error(\`You need at least \${calculatedCost} tokens to generate makeup!\`);
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
          id: \`gen-\${baseTime}-\${idx}\`,
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
          let makeupDesc = \`\${presetObj ? presetObj.name : 'Natural'} style.\`;
          if (lipstickObj && lipstickObj.id !== 'none') makeupDesc += \` Lipstick: \${lipstickObj.name}.\`;
          if (eyelinerObj && eyelinerObj.id !== 'none') makeupDesc += \` Eyeliner: \${eyelinerObj.name}.\`;
          if (eyeshadowObj && eyeshadowObj.id !== 'none') makeupDesc += \` Eyeshadow: \${eyeshadowObj.name}.\`;
          if (blushObj && blushObj.id !== 'none') makeupDesc += \` Blush: \${blushObj.name}.\`;

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
              id: \`match_\${Date.now()}_\${Math.floor(1000 + Math.random() * 9000)}\`,
              timestamp: Date.now(),
              date: new Date().toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" }),
              code: combo.presetId,
              name: presetObj ? presetObj.name : 'Custom Makeup',
              matchRate: \`\${Math.floor(88 + Math.random() * 11)}%\`,
              img: data.imageUrl
            };
            const storageKey = user ? \`levante_matches_\${user.id}\` : "levante_matches";
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
      link.download = \`glamai_\${img.styleName}_\${img.colorName}.png\`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      if (i < successImages.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  };

`;
  content = content.substring(0, startIndex) + newHandleGenerate + content.substring(endIndex);
}

// 8. Fix random button
const randomBtnRegex = /const random = MAKEUP_PRESETS\[Math\.floor\(Math\.random\(\) \* MAKEUP_PRESETS\.length\)\];\s+setSelectedPreset\(random\.id\);\s+setActiveQuickPreset\(null\);\s+toast\.success\(\`🎲 \$\{t\('audit\.makeup\.random'\)\}: \$\{random\.name\}\`\);\s+scrollToPreview\(\);/g;

content = content.replace(randomBtnRegex, `const random = MAKEUP_PRESETS[Math.floor(Math.random() * MAKEUP_PRESETS.length)];
                  setSelectedCombinations(prev => [...prev, { id: Date.now(), presetId: random.id, lipstickId: selectedLipstick }]);
                  setActiveQuickPreset(null);
                  toast.success(\`🎲 \${t('audit.makeup.random')}: \${random.name}\`);
                  scrollToPreview();`);

// 9. Fix preset cards
const presetCardStart = `                const isSelected = selectedPreset === p.id;
                return (
                  <button
                    type="button"
                    key={p.id}
                    className={\`style-card \${isSelected ? 'selected' : ''}\`}
                    aria-pressed={isSelected}
                    aria-label={\`Select: \${p.name}\`}
                    onClick={() => { setSelectedPreset(p.id); setActiveQuickPreset(null); }}`;

const presetCardReplacement = `                const isSelected = selectedCombinations.some(c => c.presetId === p.id);
                return (
                  <button
                    type="button"
                    key={p.id}
                    className={\`style-card \${isSelected ? 'selected' : ''}\`}
                    aria-pressed={isSelected}
                    aria-label={\`Select: \${p.name}\`}
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
                    }}`;

content = content.replace(presetCardStart, presetCardReplacement);

// 10. Fix the selected badge
const badgeRegex = /\{isSelected && <div className="selected-badge"><Check size=\{12\} \/><\/div>\}/g;
const badgeReplacement = `{isSelected && (
                      <div className="selected-badge">
                        {(selectedCombinations.findIndex(c => c.presetId === p.id) + 1) || <Check size={12} />}
                      </div>
                    )}`;
content = content.replace(badgeRegex, badgeReplacement);


// 11. UI Viewer Replacement
const uiStartRegex = /\{\!image \? \([\s\S]*?demo-comparison-wrapper[\s\S]*?hideActions=\{true\}\n\s*\/>\n\s*<\/div>\n\s*\) \: resultImage \? \(/;

const uiReplacement = `            {!image ? (
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

                        <div className={\`generation-card-status-badge \${res.status}\`}>
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
                                setLightboxTitle(\`\${res.styleName} (\${res.colorName})\`);
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
                                <div className="progress-bar" style={{ width: \`\${progress}%\`, height: '100%', background: 'var(--color-pink-primary)' }}></div>
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
                                download={\`glamai_\${res.styleName}_\${res.colorName}.png\`}
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
            ) : resultImages.length === 1 && resultImages[0].status === 'success' ? (`;

content = content.replace(uiStartRegex, uiReplacement);

// 12. Update resultImage single references
content = content.replace(/afterSrc=\{resultImage\}/g, "afterSrc={resultImages[0].result}");
content = content.replace(/url: resultImage,/g, "url: resultImages[0].result,");
content = content.replace(/result: resultImage,/g, "result: resultImages[0].result,");

const presetCheckStr = `title={selectedPreset ? MAKEUP_PRESETS.find(p => p.id === selectedPreset)?.name : 'Makeup'}`;
const presetCheckReplacement = `title={resultImages[0].styleName}`;
content = content.replace(presetCheckStr, presetCheckReplacement);

const styleNameStr = `styleName: selectedPreset ? MAKEUP_PRESETS.find(p => p.id === selectedPreset)?.name || 'Makeup Look' : 'Makeup Look'`;
const styleNameReplacement = `styleName: resultImages[0].styleName`;
content = content.replace(styleNameStr, styleNameReplacement);

const styleStr2 = `style: selectedPreset ? MAKEUP_PRESETS.find(p => p.id === selectedPreset)?.name : 'Makeup',`;
const styleReplacement2 = `style: resultImages[0].styleName, color: resultImages[0].colorName,`;
content = content.replace(styleStr2, styleReplacement2);

const idStr = `currentResultId`;
const idReplacement = `resultImages[0].id`;
content = content.replace(/currentResultId/g, idReplacement);


// 13. Community Preset Block
const communityMatch = `                    setSelectedPreset(look.id);
                    setActiveQuickPreset(null);
                    toast.success(\`\${t('audit.makeup.presetLoaded') || 'Preset loaded'}: \${look.name}\`);`;
const communityReplace = `                    setSelectedCombinations(prev => {
                      if (prev.find(c => c.presetId === look.id)) return prev;
                      return [...prev, { id: Date.now(), presetId: look.id, lipstickId: selectedLipstick }];
                    });
                    setActiveQuickPreset(null);
                    toast.success(\`\${t('audit.makeup.presetLoaded') || 'Preset loaded'}: \${look.name}\`);`;
content = content.replace(communityMatch, communityReplace);

// 14. Mobile Fixed CTA tokens
const mobileCTAMatch = `              (-10 Tokens)
            </span>
          </button>
        </div>
      )}`;
const mobileCTAReplace = `              (-{selectedCombinations.length * 10} Tokens)
            </span>
          </button>
        </div>
      )}`;
content = content.replace(mobileCTAMatch, mobileCTAReplace);

// 15. Append Lightbox
const lightboxStr = `      {lightboxImage && (
        <div 
          className="lightbox-overlay" 
          onClick={() => setLightboxImage(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.9)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            padding: '2rem'
          }}
        >
          <div 
            style={{ 
              position: 'relative', 
              maxWidth: '90%', 
              maxHeight: '80%', 
              borderRadius: '12px', 
              overflow: 'hidden', 
              boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <img 
              src={lightboxImage} 
              alt={lightboxTitle} 
              style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain', display: 'block' }}
            />
            <div 
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '100%',
                padding: '1rem',
                background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                color: 'white',
                fontWeight: 600,
                fontSize: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span>{lightboxTitle}</span>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  const link = document.createElement('a');
                  link.href = lightboxImage;
                  link.download = \`glamai_\${lightboxTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png\`;
                  link.click();
                }}
                style={{
                  background: 'var(--color-pink-primary)',
                  border: 'none',
                  color: 'white',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <Download size={16} />
              </button>
            </div>
          </div>
          <button 
            onClick={() => setLightboxImage(null)}
            style={{ 
              marginTop: '1.5rem', 
              background: 'transparent', 
              border: '1px solid rgba(255,255,255,0.3)', 
              color: 'white', 
              padding: '0.5rem 1.5rem', 
              borderRadius: '20px',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      )}
    </section>
  );
}`;

content = content.replace(`    </section>\n  );\n}`, lightboxStr);

// Desktop Generate Button token length
content = content.replace(`(-10 Tokens)`, `(-{selectedCombinations.length * 10} Tokens)`);

fs.writeFileSync('src/components/Makeup.jsx', content);
console.log('fixAll.cjs executed');
