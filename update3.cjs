const fs = require('fs');

let content = fs.readFileSync('src/components/Makeup.jsx', 'utf8');

// 1. Add missing imports
if (!content.includes('Download')) {
  content = content.replace('Upload, Sparkles, RefreshCw', 'Upload, Sparkles, RefreshCw, Download, Share2');
}

// 2. Replace the UI viewer portion
const uiStartStr = `            {!image ? (
              /* Demo State: comparison slider using public makeup images */
              <div className="demo-comparison-wrapper">
                <SliderComparison
                  beforeSrc="/trending_makeup_before.png"
                  afterSrc="/trending_makeup.png"
                  title={t('audit.makeup.demoMakeup')}
                  hideActions={true}
                />
              </div>
            ) : resultImage ? (`;
            
const uiStartReplacementStr = `            {!image ? (
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

if(content.includes(uiStartStr)) {
    content = content.replace(uiStartStr, uiStartReplacementStr);
} else {
    // try to match with regex, spaces might be different
    console.log("Could not find exact uiStartStr. Trying more robust replacement.");
}

// Also replace `resultImage` in the single item view with `resultImages[0].result`
// And `selectedPreset` to `selectedCombinations[0].presetId`

// We just replace `resultImage` string literal with `resultImages[0].result` in this block
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


// Lightbox UI appending to the very end before closing section
const sectionClose = `    </section>
  );
}`;
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

content = content.replace(sectionClose, lightboxStr);


// Remove resultImage dependency from useEffect if it still has it
content = content.replace(', [resultImage])', ', [resultImages, activeResultIndex])');


fs.writeFileSync('src/components/Makeup.jsx', content);
console.log('Script 3 executed');

