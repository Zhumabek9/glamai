const fs = require('fs');

let content = fs.readFileSync('src/components/Makeup.jsx', 'utf8');

// Replace setResultImage(null); with setResultImages([]); setActiveResultIndex(0);
content = content.replace(
  /setResultImage\(null\);/g,
  `setResultImages([]);\n    setActiveResultIndex(0);`
);

// Replace the UI block
const uiStartRegex = /\}\n\n\s*\{\/\* Comparison \/ Main Viewer Block \*\/\}\n\s*<div className="preview-viewer-area">\n\s*\{\!image \? \(\n\s*\{\/\* Demo State: comparison slider using public makeup images \*\/\}\n\s*<div className="demo-comparison-wrapper">\n\s*<SliderComparison\n\s*beforeSrc="\/trending_makeup_before\.png"\n\s*afterSrc="\/trending_makeup\.png"\n\s*title=\{t\('audit\.makeup\.demoMakeup'\)\}\n\s*hideActions=\{true\}\n\s*\/>\n\s*<\/div>\n\s*\) \: resultImage \? \(/;

const uiReplacement = `}

          {/* Comparison / Main Viewer Block */}
          <div className="preview-viewer-area">
            {!image ? (
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

fs.writeFileSync('src/components/Makeup.jsx', content);
console.log('fixUI.cjs executed');
