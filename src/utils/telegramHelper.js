import { authFetch } from '../apiClient';

/**
 * Checks if the application is running inside a Telegram WebApp (Mini App).
 */
export function isTelegramApp() {
  return typeof window !== 'undefined' && 
         !!(window.Telegram?.WebApp?.initData && window.Telegram.WebApp.initData.length > 0);
}

/**
 * Gets the Telegram bot username, with a fallback.
 */
export function getBotUsername() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('tg_bot_username') || 'tryglamai_bot';
  }
  return 'tryglamai_bot';
}

/**
 * Handles downloading an image.
 * If running inside Telegram, it sends the image to the user's Telegram chat
 * and also opens the link using Telegram's openLink.
 * If running in a regular browser, it performs a standard browser download.
 * 
 * @param {string} imageUrl - The URL of the image to download (can be relative, absolute or base64)
 * @param {string} filename - The default filename for browser download
 * @param {object} toast - The toast helper
 */
export async function downloadImage(imageUrl, filename, toast) {
  if (isTelegramApp()) {
    try {
      if (toast && typeof toast.info === 'function') {
        toast.info('Отправляем фото в ваш чат с ботом...');
      }
      
      const res = await authFetch('/api/telegram/send-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl,
          caption: '📷 Ваше сгенерированное фото от GlamAI!'
        })
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        if (toast && typeof toast.success === 'function') {
          toast.success('Фото отправлено в чат с ботом! Откройте чат, чтобы сохранить его в память устройства.');
        }
      } else {
        console.error('Failed to send photo to Telegram:', data);
        if (toast && typeof toast.error === 'function') {
          toast.error('Не удалось отправить в чат. Открываем в браузере...');
        }
      }
    } catch (err) {
      console.error('Error downloading in Telegram:', err);
      if (toast && typeof toast.error === 'function') {
        toast.error('Ошибка при отправке в чат. Открываем в браузере...');
      }
    } finally {
      // Fallback: open the link in browser/telegram context so user can long-press save
      try {
        let targetUrl = imageUrl;
        if (targetUrl.startsWith('/')) {
          const baseUrl = window.location.origin;
          targetUrl = baseUrl + targetUrl;
        }
        window.Telegram.WebApp.openLink(targetUrl);
      } catch (err) {
        console.error('Failed to open link in Telegram:', err);
      }
    }
  } else {
    // Normal browser download
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

/**
 * Intercepts a download link click event and handles it via Telegram if needed.
 * Returns true if handled by Telegram, false otherwise.
 */
export function handleDownloadClick(e, imageUrl, filename, toast) {
  if (isTelegramApp()) {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    downloadImage(imageUrl, filename, toast);
    return true;
  }
  return false;
}

/**
 * Loops through multiple images and sends them to the user's Telegram chat.
 */
export async function downloadAllTelegram(images, toast) {
  if (!images || images.length === 0) return;
  if (toast && typeof toast.info === 'function') {
    toast.info(`Отправляем ${images.length} фото в ваш чат с ботом...`);
  }
  
  let successCount = 0;
  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const url = img.result || img.imageUrl || img;
    if (!url) continue;
    
    try {
      const res = await authFetch('/api/telegram/send-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: url,
          caption: `📷 Фото ${i + 1} из ${images.length}: ${img.styleName || ''} ${img.colorName || ''}`
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        successCount++;
      }
      if (i < images.length - 1) {
        // Pause to stay under Telegram Bot API rate limits
        await new Promise(resolve => setTimeout(resolve, 800));
      }
    } catch (err) {
      console.error('Error sending batch image:', err);
    }
  }
  
  if (toast && typeof toast.success === 'function') {
    toast.success(`Отправлено фото: ${successCount} из ${images.length} в ваш чат с ботом!`);
  }
}

/**
 * Generates a before/after collage on canvas.
 */
export function createBeforeAfterCollage(beforeUrl, afterUrl, botUsername = 'tryglamai_bot') {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1600;
    canvas.height = 1200;
    const ctx = canvas.getContext('2d');

    const beforeImg = new Image();
    beforeImg.crossOrigin = 'anonymous';
    beforeImg.src = beforeUrl;

    beforeImg.onload = () => {
      const afterImg = new Image();
      afterImg.crossOrigin = 'anonymous';
      
      // Prevent browser cache CORS issues
      const timestamp = Date.now();
      const corsAfterUrl = afterUrl.startsWith('data:') 
        ? afterUrl 
        : afterUrl + (afterUrl.includes('?') ? '&' : '?') + 't=' + timestamp;
      
      afterImg.src = corsAfterUrl;

      afterImg.onload = () => {
        // Draw background
        ctx.fillStyle = '#0f0c1b';
        ctx.fillRect(0, 0, 1600, 1200);

        const drawCover = (img, x, y, w, h) => {
          const imgRatio = img.naturalWidth / img.naturalHeight;
          const targetRatio = w / h;
          let sWidth = img.naturalWidth;
          let sHeight = img.naturalHeight;
          let sx = 0;
          let sy = 0;

          if (imgRatio > targetRatio) {
            sWidth = img.naturalHeight * targetRatio;
            sx = (img.naturalWidth - sWidth) / 2;
          } else {
            sHeight = img.naturalWidth / targetRatio;
            sy = (img.naturalHeight - sHeight) / 2;
          }
          ctx.drawImage(img, sx, sy, sWidth, sHeight, x, y, w, h);
        };

        // Draw left (Before)
        drawCover(beforeImg, 0, 0, 800, 1200);

        // Draw right (After)
        drawCover(afterImg, 800, 0, 800, 1200);

        // Draw vertical divider
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(800, 0);
        ctx.lineTo(800, 1200);
        ctx.stroke();

        // Draw Before (До) badge
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.beginPath();
        ctx.roundRect(30, 30, 160, 65, 12);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 36px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('До', 110, 75);

        // Draw After (После) badge
        ctx.fillStyle = '#ff2e93';
        ctx.beginPath();
        ctx.roundRect(830, 30, 180, 65, 12);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 36px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('После', 920, 75);

        // Draw watermark banner at bottom
        ctx.fillStyle = 'rgba(15, 12, 27, 0.9)';
        ctx.fillRect(0, 1100, 1600, 100);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 36px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('✨ GlamAI AI Beauty Studio', 60, 1162);

        ctx.fillStyle = '#ff2e93';
        ctx.font = 'bold 32px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(`Попробуй бота: @${botUsername}`, 1540, 1162);

        try {
          const dataUrl = canvas.toDataURL('image/png');
          resolve(dataUrl);
        } catch (err) {
          reject(err);
        }
      };

      afterImg.onerror = (e) => reject(new Error('Failed to load after image for collage: ' + e));
    };

    beforeImg.onerror = (e) => reject(new Error('Failed to load before image for collage: ' + e));
  });
}

/**
 * Handles sharing a before/after result.
 * If in Telegram, it sends the collage to the chat and opens the Telegram share link.
 * If in web, it uses standard navigator.share or copies the link.
 */
export async function shareResult(beforeUrl, afterUrl, styleName, toast) {
  const botUsername = getBotUsername();
  const botUrl = `https://t.me/${botUsername}`;
  
  if (isTelegramApp()) {
    try {
      if (toast && typeof toast.info === 'function') {
        toast.info('Создаем коллаж До/После и отправляем в чат...');
      }
      
      let sendUrl = afterUrl;
      
      // If we have both before and after, generate a collage
      if (beforeUrl && afterUrl) {
        try {
          sendUrl = await createBeforeAfterCollage(beforeUrl, afterUrl, botUsername);
        } catch (collageErr) {
          console.warn('Collage generation failed, sending after image only:', collageErr);
        }
      }

      // Send to telegram chat
      const res = await authFetch('/api/telegram/send-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: sendUrl,
          caption: `✨ Мой результат До/После в GlamAI!\n🔥 Попробуй новый образ бесплатно прямо в Telegram:\n👉 ${botUrl}`
        })
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        if (toast && typeof toast.success === 'function') {
          toast.success('Фото До/После отправлено в чат с ботом!');
        }
      } else {
        console.error('Failed to send collage to Telegram:', data);
      }
    } catch (err) {
      console.error('Error sharing in Telegram:', err);
    } finally {
      // Open native Telegram share sheet
      try {
        const shareText = `Посмотрите на мое изменение образа До/После в GlamAI! Попробуйте сами бесплатно в Telegram!`;
        window.Telegram.WebApp.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(botUrl)}&text=${encodeURIComponent(shareText)}`);
      } catch (err) {
        console.error('Failed to open Telegram share link:', err);
      }
    }
  } else {
    // Normal web share
    const shareData = {
      title: 'My AI Transformation — GlamAI',
      text: `Check out my AI transformation! Try it yourself at GlamAI!`,
      url: window.location.origin
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if (err.name !== 'AbortError') {
          if (toast && typeof toast.error === 'function') {
            toast.error('Sharing failed. Try downloading instead.');
          }
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.origin);
        if (toast && typeof toast.success === 'function') {
          toast.success('Link copied to clipboard!');
        }
      } catch {
        if (toast && typeof toast.error === 'function') {
          toast.error('Could not copy link.');
        }
      }
    }
  }
}
