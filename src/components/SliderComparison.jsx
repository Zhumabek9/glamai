import t from '../utils/i18n';
import { useState, useRef, useCallback, useEffect } from 'react';
import { Download, Share2 } from 'lucide-react';

/**
 * SliderComparison — Interactive drag before/after comparison slider
 * Touch + mouse compatible
 */
export default function SliderComparison({ beforeSrc, afterSrc, title, onShare, onDownload, hideActions }) {
  const [position, setPosition] = useState(50); // percentage 0–100
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

  const updatePosition = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pct = clamp(((clientX - rect.left) / rect.width) * 100, 2, 98);
    setPosition(pct);
  }, []);

  // Mouse events
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    updatePosition(e.clientX);
  };

  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e) => updatePosition(e.clientX);
    const onUp = () => setIsDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [isDragging, updatePosition]);

  // Touch events
  const handleTouchStart = (e) => {
    setIsDragging(true);
    updatePosition(e.touches[0].clientX);
  };

  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e) => updatePosition(e.touches[0].clientX);
    const onEnd = () => setIsDragging(false);
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onEnd);
    return () => {
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
    };
  }, [isDragging, updatePosition]);

  return (
    <div className="slider-comparison-wrapper">
      {/* Image container */}
      <div
        ref={containerRef}
        className="slider-comparison-container"
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        {/* After image (background, full width — right side) */}
        <img
          src={afterSrc}
          alt={t('audit.retouch.after')}
          className="slider-img slider-img-before"
          draggable={false}
        />

        {/* Before image (clipped to left portion — original photo) */}
        <div
          className="slider-after-clip"
          style={{ width: `${position}%` }}
        >
          <img
            src={beforeSrc}
            alt={t('audit.retouch.before')}
            className="slider-img slider-img-after"
            style={{ width: containerWidth ? `${containerWidth}px` : '100%', maxWidth: 'none' }}
            draggable={false}
          />
        </div>

        {/* Drag handle line */}
        <div
          className="slider-divider"
          style={{ left: `${position}%` }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          <div className="slider-handle">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 5L3 12L8 19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 5L21 12L16 19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {/* Labels: Before on left side of divider, After on right side */}
        <span className="slider-label-before">{t('audit.retouch.before')}</span>
        <span className="slider-label-after" style={{ left: `calc(${position}% + 0.75rem)` }}>{t('audit.retouch.after')}</span>
      </div>

      {/* Action buttons */}
      {!hideActions && (
        <div className="slider-actions">
          <a
            href={afterSrc}
            download={`glamai_${title || 'hairstyle'}.png`}
            className="btn btn-primary"
            onClick={onDownload}
          >
            <Download size={16} />
            <span>{t('audit.slidercomparison.downloadHd')}</span>
          </a>
          <button className="btn btn-secondary" onClick={onShare}>
            <Share2 size={16} />
            <span>{t('audit.slidercomparison.share')}</span>
          </button>
        </div>
      )}
    </div>
  );
}
