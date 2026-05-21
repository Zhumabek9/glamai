import React, { useState } from 'react';
import { History as HistoryIcon, Download, Calendar, Eye, Trash2, X } from 'lucide-react';

export default function History({ history, onClearItem, onStartClick }) {
  const [selectedItem, setSelectedItem] = useState(null);

  const handleDownload = (imgUrl, filename) => {
    const link = document.createElement('a');
    link.href = imgUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getFilterStyle = (item) => {
    return {};
  };

  return (
    <section className="history-section container animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <HistoryIcon size={24} color="var(--color-pink-primary)" />
            <span>My Style History</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Your personal gallery of photorealistic hairstyle transformations.
          </p>
        </div>
      </div>

      {history.length === 0 ? (
        <div 
          className="glass-panel" 
          style={{ 
            padding: '4rem 2rem', 
            textAlign: 'center', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '300px'
          }}
        >
          <div 
            style={{ 
              width: '60px', 
              height: '60px', 
              borderRadius: '50%', 
              background: 'rgba(255, 46, 147, 0.05)', 
              color: 'var(--color-pink-primary)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              marginBottom: '1.5rem',
              border: '1px solid rgba(255, 46, 147, 0.15)'
            }}
          >
            <HistoryIcon size={24} />
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Your Style Gallery is Empty</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '350px', marginBottom: '1.5rem' }}>
            Once you start generating styles in the customizer, your creations will appear here.
          </p>
          <button className="btn btn-primary" onClick={onStartClick}>
            <span>Open Customizer Studio</span>
          </button>
        </div>
      ) : (
        <div className="history-grid">
          {history.map(item => (
            <div 
              key={item.id} 
              className="history-card"
              onClick={() => setSelectedItem(item)}
            >
              <img src={item.result} alt={item.style} style={getFilterStyle(item)} />
              
              <div className="history-card-overlay">
                <div className="history-card-info">
                  <div className="history-card-title">{item.style} ({item.color})</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
                    <span className="history-card-date">{item.date}</span>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '0.25rem', borderRadius: '4px' }}
                        onClick={(e) => { e.stopPropagation(); handleDownload(item.result, `glamai_${item.style}.png`); }}
                        title="Download"
                      >
                        <Download size={12} />
                      </button>
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '0.25rem', borderRadius: '4px' }}
                        onClick={(e) => { e.stopPropagation(); onClearItem(item.id); }}
                        title="Delete"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox / Side-by-Side Comparison Modal */}
      {selectedItem && (
        <div className="modal-backdrop" onClick={() => setSelectedItem(null)}>
          <div 
            className="modal-content glass-panel" 
            style={{ maxWidth: '800px', padding: '2.5rem' }} 
            onClick={(e) => e.stopPropagation()}
          >
            <button className="modal-close-btn" onClick={() => setSelectedItem(null)}>
              <X size={20} />
            </button>

            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{selectedItem.style} Hairstyle Transition</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Selected Style: <strong>{selectedItem.style}</strong> dyed with <strong>{selectedItem.color}</strong>. Rendered on {selectedItem.date}.
              </p>
            </div>

            {/* Side-by-Side Images */}
            <div 
              style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '1.5rem', 
                marginBottom: '2rem' 
              }}
            >
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  Before (Original)
                </div>
                <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', height: '300px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <img src={selectedItem.original} alt="Original input" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-pink-primary)', marginBottom: '0.5rem' }}>
                  After (AI Styled)
                </div>
                <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', height: '300px', border: '1px solid rgba(255, 46, 147, 0.2)' }}>
                  <img src={selectedItem.result} alt="AI output" style={{ width: '100%', height: '100%', objectFit: 'cover', ...getFilterStyle(selectedItem) }} />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => setSelectedItem(null)}
              >
                Close Preview
              </button>
              <button 
                className="btn btn-primary" 
                onClick={() => handleDownload(selectedItem.result, `glamai_${selectedItem.style}.png`)}
              >
                <Download size={16} />
                <span>Download HD Image</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
