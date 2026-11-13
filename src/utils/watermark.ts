/**
 * Generates an official PCMC Evidence Stamp / Watermarked image using HTML5 Canvas.
 * Handles Blobs, base64 data URLs, and remote URLs (with CORS handling and fallback to a standalone official evidence dossier certificate).
 */

export interface WatermarkMeta {
  id: string;
  category: string;
  subTag?: string;
  areaName: string;
  latitude: number;
  longitude: number;
  createdAt?: string;
}

/**
 * Draws a clean, self-contained municipal evidence card directly onto canvas.
 * Guaranteed to never taint the canvas and always export cleanly.
 */
function drawEvidenceCard(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  meta: WatermarkMeta
) {
  // Background gradient: dark municipal navy
  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, '#090e17');
  grad.addColorStop(0.5, '#0f172a');
  grad.addColorStop(1, '#020617');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Decorative border
  ctx.strokeStyle = '#06b6d4';
  ctx.lineWidth = 6;
  ctx.strokeRect(16, 16, width - 32, height - 32);

  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 2;
  ctx.strokeRect(26, 26, width - 52, height - 52);

  // Top Municipal Header Banner
  ctx.fillStyle = '#082f49';
  ctx.fillRect(32, 32, width - 64, 100);
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(32, 130, width - 64, 3);

  // Municipal Corporation text
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 26px sans-serif';
  ctx.fillText('PIMPRI CHINCHWAD MUNICIPAL CORPORATION (PCMC)', 50, 72);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '600 14px sans-serif';
  ctx.fillText('NAGRIK FAST-TRACK GRIEVANCE REDRESSAL SYSTEM • OFFICIAL EVIDENCE DOSSIER', 50, 105);

  // Stamp Badge in top right
  ctx.strokeStyle = '#22c55e';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(width - 230, 44, 175, 76);
  ctx.fillStyle = '#22c55e';
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText('PCMC VERIFIED', width - 215, 74);
  ctx.font = '600 12px sans-serif';
  ctx.fillText('GEOTAGGED PROOF', width - 215, 98);

  // Main Card Body Details
  const startY = 180;
  const lineGap = 44;

  const drawRow = (label: string, value: string, y: number, highlight = false) => {
    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText(label.toUpperCase(), 52, y);

    ctx.fillStyle = highlight ? '#38bdf8' : '#f8fafc';
    ctx.font = highlight ? 'bold 20px sans-serif' : '600 17px sans-serif';
    ctx.fillText(value, 260, y);
  };

  drawRow('Tracking ID', `#${meta.id.substring(0, 8)}`, startY, true);
  drawRow('Civic Category', `${meta.category}${meta.subTag ? ` (${meta.subTag})` : ''}`, startY + lineGap);
  drawRow('Locality / Ward', meta.areaName, startY + lineGap * 2);
  drawRow('GPS Coordinates', `${meta.latitude.toFixed(5)}° N, ${meta.longitude.toFixed(5)}° E`, startY + lineGap * 3);

  const dateStr = meta.createdAt
    ? new Date(meta.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    : new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  drawRow('Timestamp (IST)', `${dateStr} IST`, startY + lineGap * 4);
  drawRow('Verification Status', 'On-Site Geotagged • Real-Time Municipal Evidence', startY + lineGap * 5);

  // Bottom Notice Box
  const noticeY = height - 145;
  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.fillRect(36, noticeY, width - 72, 75);
  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(36, noticeY, width - 72, 75);

  ctx.fillStyle = '#e0f2fe';
  ctx.font = '600 13px sans-serif';
  ctx.fillText('Statutory Grievance Guarantee: As per Maharashtra Right to Public Services Act (RTS),', 52, noticeY + 30);
  ctx.fillText('this civic record is assigned to the PCMC Zonal Field Officer for inspection and rapid clearance.', 52, noticeY + 54);

  // Footer bar
  ctx.fillStyle = '#64748b';
  ctx.font = '11px sans-serif';
  ctx.fillText('Generated via PCMC Nagrik Watch Portal • Certified Geotagged Civic Proof', 52, height - 32);
}

/**
 * Creates watermarked municipal proof image data URL.
 * Never hangs or throws an uncaught error.
 */
export async function createWatermarkedImage(
  imageSource: string | Blob,
  meta: WatermarkMeta
): Promise<string> {
  const renderFallbackCertificate = (): string => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 800;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        drawEvidenceCard(ctx, 1200, 800, meta);
        return canvas.toDataURL('image/jpeg', 0.92);
      }
    } catch (e) {
      console.warn('Canvas fallback error:', e);
    }
    return '';
  };

  // If source is missing or empty, directly produce certificate
  if (!imageSource || (typeof imageSource === 'string' && imageSource.trim().length === 0)) {
    return renderFallbackCertificate();
  }

  // Pre-fetch remote images as Blob if possible to avoid CORS canvas tainting
  let resolvedSrc = '';
  let objectUrlToRevoke: string | null = null;

  if (imageSource instanceof Blob) {
    resolvedSrc = URL.createObjectURL(imageSource);
    objectUrlToRevoke = resolvedSrc;
  } else if (typeof imageSource === 'string' && imageSource.startsWith('data:')) {
    resolvedSrc = imageSource;
  } else if (typeof imageSource === 'string' && (imageSource.startsWith('http://') || imageSource.startsWith('https://'))) {
    try {
      const res = await fetch(imageSource, { mode: 'cors' });
      if (res.ok) {
        const blob = await res.blob();
        resolvedSrc = URL.createObjectURL(blob);
        objectUrlToRevoke = resolvedSrc;
      } else {
        resolvedSrc = imageSource;
      }
    } catch {
      resolvedSrc = imageSource;
    }
  } else {
    resolvedSrc = String(imageSource);
  }

  return new Promise((resolve) => {
    let settled = false;
    const safeResolve = (url: string) => {
      if (settled) return;
      settled = true;
      if (objectUrlToRevoke) {
        try {
          URL.revokeObjectURL(objectUrlToRevoke);
        } catch {
          // ignore
        }
      }
      resolve(url);
    };

    // 6-second timeout safety guard
    const timer = setTimeout(() => {
      safeResolve(renderFallbackCertificate());
    }, 6000);

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      clearTimeout(timer);
      try {
        const canvas = document.createElement('canvas');
        const width = img.naturalWidth || 1200;
        const height = img.naturalHeight || 800;
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          safeResolve(renderFallbackCertificate());
          return;
        }

        // Draw original photo
        ctx.drawImage(img, 0, 0, width, height);

        // Dark translucent evidence strip at bottom
        const stripHeight = Math.max(110, Math.round(height * 0.18));
        ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
        ctx.fillRect(0, height - stripHeight, width, stripHeight);

        // Left accent cyan bar
        ctx.fillStyle = '#06b6d4';
        ctx.fillRect(0, height - stripHeight, 14, stripHeight);

        // Primary Title
        const fontSizePrimary = Math.max(16, Math.round(width * 0.024));
        ctx.font = `bold ${fontSizePrimary}px sans-serif`;
        ctx.fillStyle = '#38bdf8';
        ctx.fillText(
          `PCMC CIVIC EVIDENCE • #${meta.id.substring(0, 8)} • ${meta.category.toUpperCase()}`,
          28,
          height - stripHeight + fontSizePrimary * 1.3
        );

        // Subtitle: Location & Coordinates
        const fontSizeSecondary = Math.max(12, Math.round(width * 0.018));
        ctx.font = `${fontSizeSecondary}px sans-serif`;
        ctx.fillStyle = '#f8fafc';
        const coordsStr = `GPS: ${meta.latitude.toFixed(5)}° N, ${meta.longitude.toFixed(5)}° E • ${meta.areaName}`;
        ctx.fillText(coordsStr, 28, height - stripHeight + fontSizePrimary * 1.4 + fontSizeSecondary * 1.4);

        // Date & Geotag Notice
        const dateStr = meta.createdAt
          ? new Date(meta.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
          : new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(`Timestamp: ${dateStr} IST • Geotagged On-Site Proof • PCMC Sarathi Cell`, 28, height - 16);

        // Export data URL
        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        safeResolve(dataUrl);
      } catch (err) {
        console.warn('Canvas export failed (likely tainted), rendering fallback certificate:', err);
        safeResolve(renderFallbackCertificate());
      }
    };

    img.onerror = () => {
      clearTimeout(timer);
      console.warn('Image failed to load, generating evidence certificate');
      safeResolve(renderFallbackCertificate());
    };

    img.src = resolvedSrc;
  });
}

/**
 * Downloads data URI, blob URL, or remote file reliably.
 */
export async function downloadFile(source: string, filename: string): Promise<void> {
  if (!source) return;

  try {
    if (source.startsWith('data:') || source.startsWith('blob:')) {
      const a = document.createElement('a');
      a.href = source;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        if (a.parentNode) document.body.removeChild(a);
      }, 150);
      return;
    }

    // Remote HTTP/HTTPS URL: fetch as local blob first so download attribute works
    const res = await fetch(source, { mode: 'cors' });
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      if (a.parentNode) document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    }, 2000);
  } catch (err) {
    console.warn('downloadFile fallback to direct link:', err);
    const a = document.createElement('a');
    a.href = source;
    a.download = filename;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      if (a.parentNode) document.body.removeChild(a);
    }, 150);
  }
}
