/**
 * Compress an image file using HTML5 Canvas.
 * Resizes the image to fit within maxDimension (default 1024px)
 * and reduces quality (default 0.85) to ensure it stays well under Vercel's 4.5MB payload limit.
 * 
 * @param {File} file - The original image File.
 * @param {number} maxDimension - Maximum width or height.
 * @param {number} quality - JPEG quality from 0 to 1.
 * @returns {Promise<File|Blob>} A promise that resolves with the compressed image File.
 */
export function compressImage(file, maxDimension = 1024, quality = 0.85) {
  return new Promise((resolve, reject) => {
    // If the file is already small (e.g. < 500KB), we can skip compression to save processing time
    if (file.size < 500 * 1024) {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              // Create a new file from the blob preserving the original name
              const nameParts = file.name ? file.name.split('.') : ['image'];
              nameParts.pop(); // Remove old extension
              const newName = `${nameParts.join('.') || 'image'}_compressed.jpg`;
              
              const compressedFile = new File([blob], newName, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file); // Fallback to original
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => resolve(file); // Fallback on image load error
    };
    reader.onerror = () => resolve(file); // Fallback on read error
  });
}
