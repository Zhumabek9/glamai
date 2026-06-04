import { useRef, useEffect, useState } from 'react';
import { X, Download, Copy } from 'lucide-react';
import { useToast } from './Toast';

/**
 * ShareStoriesModal
 * Renders the result image inside a 9:16 Stories frame with the GlamAI logo,
 * then lets the user download it or copy to clipboard.
 */
export default function ShareStoriesModal({ imageUrl, styleName, onClose }) {
  const canvasRef = useRef(null);
  const toast = useToast();
  const [isRendering, setIsRendering] = useState(true);
  const [dataUrl, setDataUrl] = useState(null);

  useEffect(() => {
    if (!imageUrl || !canvasRef.current) return;

    const canvas = canvasRef.current;
    // 9:16 aspect ratio — 1080×1920 for HD Stories
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d');

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // --- Background gradient ---
      const grad = ctx.createLinearGradient(0, 0, 1080, 1920);
      grad.addColorStop(0, '#1a0a1e');
      grad.addColorStop(0.5, '#2d0a2e');
      grad.addColorStop(1, '#0d0014');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1080, 1920);

      // --- Decorative glow circles ---
      const drawGlow = (x, y, r, color) => {
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, color);
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      };
      drawGlow(180, 380, 280, 'rgba(255,46,147,0.18)');
      drawGlow(900, 1540, 300, 'rgba(168,85,247,0.15)');

      // --- GlamAI logo text (top) ---
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 54px system-ui, sans-serif';
      ctx.fillText('✨ GlamAI', 540, 130);

      ctx.font = '32px system-ui, sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.fillText('AI Beauty Studio', 540, 185);

      // --- Pink divider line ---
      ctx.strokeStyle = 'rgba(255,46,147,0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(340, 210);
      ctx.lineTo(740, 210);
      ctx.stroke();

      // --- Main image (centered, with rounded rect clip) ---
      const imgW = 960;
      const imgH = 1200;
      const imgX = (1080 - imgW) / 2;
      const imgY = 270;
      const radius = 40;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(imgX + radius, imgY);
      ctx.lineTo(imgX + imgW - radius, imgY);
      ctx.quadraticCurveTo(imgX + imgW, imgY, imgX + imgW, imgY + radius);
      ctx.lineTo(imgX + imgW, imgY + imgH - radius);
      ctx.quadraticCurveTo(imgX + imgW, imgY + imgH, imgX + imgW - radius, imgY + imgH);
      ctx.lineTo(imgX + radius, imgY + imgH);
      ctx.quadraticCurveTo(imgX, imgY + imgH, imgX, imgY + imgH - radius);
      ctx.lineTo(imgX, imgY + radius);
      ctx.quadraticCurveTo(imgX, imgY, imgX + radius, imgY);
      ctx.closePath();
      ctx.clip();

      // Scale image to cover the box
      const scale = Math.max(imgW / img.naturalWidth, imgH / img.naturalHeight);
      const drawW = img.naturalWidth * scale;
      const drawH = img.naturalHeight * scale;
      const drawX = imgX + (imgW - drawW) / 2;
      const drawY = imgY + (imgH - drawH) / 2;
      ctx.drawImage(img, drawX, drawY, drawW, drawH);
      ctx.restore();

      // --- Style name pill ---
      if (styleName) {
        ctx.fillStyle = 'rgba(255,46,147,0.85)';
        const pillW = 380;
        const pillH = 56;
        const pillX = (1080 - pillW) / 2;
        const pillY = imgY + imgH - pillH / 2;
        ctx.beginPath();
        ctx.roundRect(pillX, pillY, pillW, pillH, 28);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 26px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(styleName, 540, pillY + 37);
      }

      // --- Bottom CTA ---
      const bottomY = imgY + imgH + 80;
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.font = 'bold 40px system-ui, sans-serif';
      ctx.fillText('Try your own look for free!', 540, bottomY);

      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '28px system-ui, sans-serif';
      ctx.fillText('glamai.app', 540, bottomY + 56);

      setDataUrl(canvas.toDataURL('image/png'));
      setIsRendering(false);
    };
    img.onerror = () => setIsRendering(false);
    img.src = imageUrl;
  }, [imageUrl, styleName]);

  const handleDownload = () => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `glamai_stories_${Date.now()}.png`;
    a.click();
    toast.success('Story saved! Share it on Instagram 🌟');
  };

  const handleCopy = async () => {
    if (!dataUrl) return;
    try {
      const blob = await (await fetch(dataUrl)).blob();
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      toast.success('Image copied to clipboard!');
    } catch {
      toast.error('Copy not supported — please download instead.');
    }
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(8px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="glass-panel" style={{ borderRadius: '24px', padding: '1.5rem', maxWidth: '420px', width: '100%', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>Share to Stories 📤</h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>Download your 9:16 story card</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.25rem' }}>
            <X size={20} />
          </button>
        </div>

        {/* Canvas preview */}
        <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', aspectRatio: '9/16', background: '#111', maxHeight: '380px' }}>
          <canvas
            ref={canvasRef}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: isRendering ? 'none' : 'block' }}
          />
          {isRendering && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-pink-primary)' }}>
              <div className="animate-spin" style={{ width: '36px', height: '36px', border: '3px solid rgba(255,46,147,0.15)', borderTopColor: 'var(--color-pink-primary)', borderRadius: '50%' }} />
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            className="btn btn-primary"
            style={{ flex: 2, padding: '0.75rem 0', fontSize: '0.9rem' }}
            onClick={handleDownload}
            disabled={isRendering}
          >
            <Download size={16} />
            <span>Download Story</span>
          </button>
          <button
            className="btn btn-secondary"
            style={{ flex: 1, padding: '0.75rem 0', fontSize: '0.9rem' }}
            onClick={handleCopy}
            disabled={isRendering}
            title="Copy to clipboard"
          >
            <Copy size={16} />
          </button>
        </div>

        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center', margin: 0 }}>
          Open Instagram → New Story → select the downloaded image
        </p>
      </div>
    </div>
  );
}
