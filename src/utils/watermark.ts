/**
 * Applies a municipal evidence stamp/watermark on an image blob/dataUrl using HTML5 Canvas.
 * Stamped data includes PCMC tracking ID, Coordinates, Timestamp, and Municipal SLA notice.
 */
export async function createWatermarkedImage(
  imageSource: string | Blob,
  meta: {
    id: string;
    category: string;
    areaName: string;
    latitude: number;
    longitude: number;
    createdAt?: string;
  }
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const width = img.naturalWidth || 1200;
      const height = img.naturalHeight || 800;
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(typeof imageSource === 'string' ? imageSource : URL.createObjectURL(imageSource));
        return;
      }

      // Draw original image
      ctx.drawImage(img, 0, 0, width, height);

      // Dark translucent evidence strip at bottom
      const stripHeight = Math.max(100, Math.round(height * 0.16));
      ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
      ctx.fillRect(0, height - stripHeight, width, stripHeight);

      // Left accent bar
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(0, height - stripHeight, 12, stripHeight);

      // Primary Title: PCMC CIVIC GRIEVANCE EVIDENCE
      const fontSizePrimary = Math.max(16, Math.round(width * 0.024));
      ctx.font = `bold ${fontSizePrimary}px sans-serif`;
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(
        `PCMC CIVIC GRIEVANCE EVIDENCE • #${meta.id.substring(0, 8)} • ${meta.category.toUpperCase()}`,
        26,
        height - stripHeight + fontSizePrimary * 1.3
      );

      // Subtitle: Location & Coordinates
      const fontSizeSecondary = Math.max(12, Math.round(width * 0.018));
      ctx.font = `${fontSizeSecondary}px sans-serif`;
      ctx.fillStyle = '#f8fafc';
      const coordsStr = `GPS: ${meta.latitude.toFixed(5)}° N, ${meta.longitude.toFixed(5)}° E • ${meta.areaName}`;
      ctx.fillText(coordsStr, 26, height - stripHeight + fontSizePrimary * 1.4 + fontSizeSecondary * 1.4);

      // Date & Geotag Notice
      const dateStr = meta.createdAt ? new Date(meta.createdAt).toLocaleString('en-IN') : new Date().toLocaleString('en-IN');
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`Timestamp: ${dateStr} • Geotagged On-Site Evidence`, 26, height - 16);

      resolve(canvas.toDataURL('image/jpeg', 0.90));
    };

    img.onerror = () => {
      resolve(typeof imageSource === 'string' ? imageSource : URL.createObjectURL(imageSource));
    };

    if (imageSource instanceof Blob) {
      img.src = URL.createObjectURL(imageSource);
    } else {
      img.src = imageSource;
    }
  });
}

/**
 * Downloads data URI or blob as file
 */
export function downloadFile(dataUrl: string, filename: string) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
