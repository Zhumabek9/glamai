const fs = require('fs');

let content = fs.readFileSync('src/components/Makeup.jsx', 'utf8');

// 1. Community Preset Block
content = content.replace(
  `                    setSelectedPreset(look.id);\n                    setActiveQuickPreset(null);\n                    toast.success(\`\${t('audit.makeup.presetLoaded') || 'Preset loaded'}: \${look.name}\`);`,
  `                    setSelectedCombinations(prev => {
                      if (prev.find(c => c.presetId === look.id)) return prev;
                      return [...prev, { id: Date.now(), presetId: look.id, lipstickId: selectedLipstick }];
                    });
                    setActiveQuickPreset(null);
                    toast.success(\`\${t('audit.makeup.presetLoaded') || 'Preset loaded'}: \${look.name}\`);`
);

// 2. Mobile Fixed CTA tokens
content = content.replace(
  `              (-10 Tokens)\n            </span>\n          </button>\n        </div>\n      )}`,
  `              (-{selectedCombinations.length * 10} Tokens)
            </span>
          </button>
        </div>
      )}`
);

// 3. Append Lightbox
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


fs.writeFileSync('src/components/Makeup.jsx', content);
console.log('Script 4 executed');
