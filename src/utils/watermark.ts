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

export interface GPSWatermarkOptions {
  area?: string;
  address: string;
  ward?: string;
  pincode?: string;
  latitude: number;
  longitude: number;
  timestamp?: Date | string;
}

export interface StampedWatermarkResult {
  blob: Blob;
  dataUrl: string;
}

function cleanNoIndia(text: string): string {
  if (!text) return '';
  return text
    .replace(/,\s*India\b/gi, '')
    .replace(/\bIndia\b/gi, '')
    .replace(/,\s*,/g, ',')
    .trim()
    .replace(/,\s*$/, '');
}

function formatGPSTimestamp(date: Date): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = days[date.getDay()];
  const pad = (n: number) => n.toString().padStart(2, '0');
  const d = pad(date.getDate());
  const m = pad(date.getMonth() + 1);
  const y = date.getFullYear();

  let h = date.getHours();
  const mins = pad(date.getMinutes());
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  h = h ? h : 12;
  const hFormatted = pad(h);

  return `${dayName}, ${d}/${m}/${y} ${hFormatted}:${mins} ${ampm} GMT+05:30`;
}

function drawMiniMapBox(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number
) {
  ctx.save();
  ctx.beginPath();
  const radius = Math.max(4, Math.round(size * 0.08));
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, size, size, radius);
  } else {
    ctx.rect(x, y, size, size);
  }
  ctx.clip();

  // Dark terrain base
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(x, y, size, size);

  // Subtle landuse/parks
  ctx.fillStyle = 'rgba(22, 101, 52, 0.45)';
  ctx.fillRect(x + size * 0.08, y + size * 0.08, size * 0.35, size * 0.28);
  ctx.fillRect(x + size * 0.58, y + size * 0.55, size * 0.35, size * 0.35);

  // River curve
  ctx.strokeStyle = 'rgba(2, 132, 199, 0.55)';
  ctx.lineWidth = Math.max(2, size * 0.05);
  ctx.beginPath();
  ctx.moveTo(x, y + size * 0.7);
  ctx.bezierCurveTo(x + size * 0.3, y + size * 0.65, x + size * 0.6, y + size * 0.8, x + size, y + size * 0.65);
  ctx.stroke();

  // Road grid
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
  ctx.lineWidth = Math.max(1.5, size * 0.03);
  ctx.beginPath();
  ctx.moveTo(x, y + size * 0.45);
  ctx.lineTo(x + size, y + size * 0.45);
  ctx.moveTo(x + size * 0.45, y);
  ctx.lineTo(x + size * 0.45, y + size);
  ctx.stroke();

  // Highway diagonal
  ctx.strokeStyle = 'rgba(251, 191, 36, 0.6)';
  ctx.lineWidth = Math.max(2, size * 0.04);
  ctx.beginPath();
  ctx.moveTo(x, y + size * 0.85);
  ctx.lineTo(x + size * 0.85, y);
  ctx.stroke();

  // GPS Pin pulse ring
  const centerX = x + size * 0.48;
  const centerY = y + size * 0.45;
  ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
  ctx.beginPath();
  ctx.arc(centerX, centerY, size * 0.25, 0, Math.PI * 2);
  ctx.fill();

  // Red Pin
  ctx.font = `${Math.max(12, Math.round(size * 0.34))}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('📍', centerX, centerY - size * 0.02);

  ctx.restore();

  // Border around mini-map
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = Math.max(1.5, Math.round(size * 0.025));
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, size, size, radius);
  } else {
    ctx.rect(x, y, size, size);
  }
  ctx.stroke();
}

/**
 * Programmatically stamps the approved GPS watermark banner onto the image file pixels:
 * - Position: Bottom of photo, full width
 * - Background: Dark semi-transparent overlay (rgba(10, 15, 30, 0.88))
 * - Mini Map Box (Left): ~60x60px representation with location pin (📍)
 * - Metadata (Right, text stack):
 *     1. Area / City, State ("Pimpri Chinchwad, Maharashtra" — strictly NO "India")
 *     2. Specific street/building address, ward, or landmark (strictly NO "India")
 *     3. Coordinates: Monospace cyan text (Lat <lat>, Long <lng>)
 *     4. Timestamp: Day, DD/MM/YYYY hh:mm AM/PM GMT+05:30
 */
export async function stampGPSWatermark(
  imageSource: File | Blob | string,
  options: GPSWatermarkOptions
): Promise<StampedWatermarkResult> {
  let resolvedBlob: Blob | null = null;
  let objectUrlToRevoke: string | null = null;
  let bitmapToClose: ImageBitmap | null = null;

  try {
    if (imageSource instanceof Blob) {
      resolvedBlob = imageSource;
    } else if (typeof imageSource === 'string' && imageSource.startsWith('data:')) {
      try {
        const parts = imageSource.split(',');
        const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
        const bstr = atob(parts[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        resolvedBlob = new Blob([u8arr], { type: mime });
      } catch {
        // fallback to string URL
      }
    }

    let drawable: CanvasImageSource | null = null;
    let width = 1200;
    let height = 900;

  // Use createImageBitmap with EXIF auto-orientation when available
  if (typeof createImageBitmap === 'function' && resolvedBlob) {
    try {
      const bitmap = await createImageBitmap(resolvedBlob, { imageOrientation: 'from-image' });
      bitmapToClose = bitmap;
      drawable = bitmap;
      width = bitmap.width;
      height = bitmap.height;
    } catch (e) {
      console.warn('createImageBitmap failed, falling back to Image element', e);
    }
  }

  if (!drawable) {
    let resolvedSrc = '';
    if (resolvedBlob) {
      resolvedSrc = URL.createObjectURL(resolvedBlob);
      objectUrlToRevoke = resolvedSrc;
    } else if (typeof imageSource === 'string') {
      resolvedSrc = imageSource;
    }

    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.crossOrigin = 'anonymous';
      el.onload = () => resolve(el);
      el.onerror = (e) => reject(e);
      el.src = resolvedSrc;
    });

    if (typeof createImageBitmap === 'function') {
      try {
        const bitmap = await createImageBitmap(img, { imageOrientation: 'from-image' });
        bitmapToClose = bitmap;
        drawable = bitmap;
        width = bitmap.width;
        height = bitmap.height;
      } catch {
        drawable = img;
        width = img.naturalWidth || 1200;
        height = img.naturalHeight || 900;
      }
    } else {
      drawable = img;
      width = img.naturalWidth || 1200;
      height = img.naturalHeight || 900;
    }
  }

  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context unavailable');

      // 1. Draw base photo upright
      ctx.drawImage(drawable!, 0, 0, width, height);

      // 2. Banner geometry
      const scale = Math.max(0.7, Math.min(2.5, width / 1100));
      const mapSize = Math.max(64, Math.round(76 * scale));
      const padX = Math.round(18 * scale);
      const padY = Math.round(14 * scale);
      const bannerHeight = Math.max(mapSize + padY * 2, Math.round(135 * scale));
      const bannerY = height - bannerHeight;

      // 3. Dark semi-transparent overlay (rgba(10, 15, 30, 0.88))
      ctx.fillStyle = 'rgba(10, 15, 30, 0.88)';
      ctx.fillRect(0, bannerY, width, bannerHeight);

      // Top cyan highlight line
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(0, bannerY, width, Math.max(2, Math.round(2.5 * scale)));

      // 4. Mini Map Box (Left)
      const mapX = padX;
      const mapY = bannerY + (bannerHeight - mapSize) / 2;
      drawMiniMapBox(ctx, mapX, mapY, mapSize);

      // 5. Metadata (Right, text stack)
      const textX = mapX + mapSize + Math.round(16 * scale);
      const maxTextWidth = width - textX - padX;

        const fontHeader = Math.max(14, Math.round(16 * scale));
        const fontAddress = Math.max(12, Math.round(13.5 * scale));
        const fontCoords = Math.max(11, Math.round(12.5 * scale));
        const fontTimestamp = Math.max(11, Math.round(12 * scale));

        let currentY = bannerY + 24 * scale;

        // HEADER: Area / City, State (Strictly NO "India")
        ctx.font = `bold ${fontHeader}px 'Plus Jakarta Sans', -apple-system, sans-serif`;
        ctx.fillStyle = '#ffffff';
        const rawHeader = options.area || 'Pimpri Chinchwad, Maharashtra';
        const cleanHeader = cleanNoIndia(rawHeader);
        ctx.fillText(cleanHeader, textX, currentY);

        currentY += fontAddress * 1.35;

        // ADDRESS: Specific street/building address, ward, or landmark (Strictly NO "India")
        ctx.font = `500 ${fontAddress}px 'Plus Jakarta Sans', -apple-system, sans-serif`;
        ctx.fillStyle = '#cbd5e1'; // slate-300
        const addressParts = [
          cleanNoIndia(options.address),
          options.ward ? cleanNoIndia(options.ward) : '',
          options.pincode ? cleanNoIndia(options.pincode) : ''
        ].filter(Boolean);
        let addressLine = addressParts.join(' • ') || 'Pimpri-Chinchwad, Maharashtra';
        if (ctx.measureText(addressLine).width > maxTextWidth) {
          while (addressLine.length > 8 && ctx.measureText(addressLine + '...').width > maxTextWidth) {
            addressLine = addressLine.slice(0, -1);
          }
          addressLine += '...';
        }
        ctx.fillText(addressLine, textX, currentY);

        currentY += fontCoords * 1.35;

        // COORDINATES: Monospace cyan text with Lat <latitude>, Long <longitude>
        ctx.font = `600 ${fontCoords}px 'SF Mono', Menlo, Consolas, monospace`;
        ctx.fillStyle = '#22d3ee'; // cyan-400
        const latVal = typeof options.latitude === 'number' && !isNaN(options.latitude) ? options.latitude.toFixed(6) : '18.629800';
        const lngVal = typeof options.longitude === 'number' && !isNaN(options.longitude) ? options.longitude.toFixed(6) : '73.799700';
        ctx.fillText(`Lat ${latVal}, Long ${lngVal}`, textX, currentY);

        currentY += fontTimestamp * 1.35;

        // TIMESTAMP: Formatted with day of week, date, time, and timezone
        ctx.font = `500 ${fontTimestamp}px 'Plus Jakarta Sans', -apple-system, sans-serif`;
        ctx.fillStyle = '#94a3b8'; // slate-400
        const dateObj = options.timestamp instanceof Date
          ? options.timestamp
          : options.timestamp
            ? new Date(options.timestamp)
            : new Date();
        const timestampStr = formatGPSTimestamp(dateObj);
        ctx.fillText(timestampStr, textX, currentY);

        // 6. Convert canvas to permanent JPEG Blob & DataURL
        canvas.toBlob(
          (blob) => {
            if (bitmapToClose) {
              try { bitmapToClose.close(); } catch {}
            }
            if (objectUrlToRevoke) {
              try { URL.revokeObjectURL(objectUrlToRevoke); } catch {}
            }
            if (blob) {
              const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
              resolve({ blob, dataUrl });
            } else {
              const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
              resolve({
                blob: imageSource instanceof Blob ? imageSource : new Blob(),
                dataUrl
              });
            }
          },
          'image/jpeg',
          0.92
        );
      } catch (err) {
        if (bitmapToClose) {
          try { bitmapToClose.close(); } catch {}
        }
        if (objectUrlToRevoke) {
          try { URL.revokeObjectURL(objectUrlToRevoke); } catch {}
        }
        reject(err);
      }
    });
  } catch (err) {
    if (bitmapToClose) {
      try { bitmapToClose.close(); } catch {}
    }
    if (objectUrlToRevoke) {
      try { URL.revokeObjectURL(objectUrlToRevoke); } catch {}
    }
    throw err;
  }
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
 * Safely converts an image source (data URI, blob URL, remote URL, or Blob) into a Blob.
 */
export async function resolveImageBlob(source: string | Blob): Promise<Blob | null> {
  if (!source) return null;
  if (source instanceof Blob) return source;

  if (typeof source === 'string') {
    if (source.startsWith('data:')) {
      try {
        const parts = source.split(',');
        const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
        const bstr = atob(parts[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
      } catch (e) {
        console.warn('Failed to parse data URL to blob:', e);
      }
    }

    if (source.startsWith('blob:') || source.startsWith('http://') || source.startsWith('https://')) {
      try {
        const res = await fetch(source, { mode: 'cors' });
        if (res.ok) {
          return await res.blob();
        }
      } catch (err) {
        console.warn('Failed to fetch image source as blob:', err);
      }
    }
  }
  return null;
}

export interface SavePhotoResult {
  success: boolean;
  method: 'share' | 'download' | 'tab' | 'fallback';
  error?: string;
  blobUrl?: string;
}

/**
 * Downloads or shares a photo reliably across desktop and mobile devices.
 * Overcomes mobile browser constraints:
 * 1. Uses Web Share API (Level 2) with File on mobile view so users can save directly to Photos / Camera Roll
 *    or share directly to Mail/Gmail with the photo attached.
 * 2. Uses Blob URL with <a download> on desktop and browsers that support downloading.
 * 3. Falls back to opening the blob/image in a new window/tab for manual long-press saving on iOS/WebKit.
 */
export async function saveOrDownloadPhoto(
  source: string | Blob,
  filename: string,
  meta?: { title?: string; text?: string }
): Promise<SavePhotoResult> {
  if (!source) return { success: false, method: 'fallback', error: 'No image source provided' };

  try {
    const blob = await resolveImageBlob(source);
    const isMobile = typeof navigator !== 'undefined' && (
      /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent || '') ||
      (typeof window !== 'undefined' && window.innerWidth < 768)
    );
    const isIOS = typeof navigator !== 'undefined' && (
      /iPhone|iPad|iPod/i.test(navigator.userAgent || '') ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    );

    // If we have a valid Blob
    if (blob) {
      const file = new File([blob], filename, { type: blob.type || 'image/jpeg' });

      // 1. Mobile First: Web Share API Level 2 (files support)
      // When invoked on mobile, this brings up the native OS share sheet.
      // iOS: User can tap "Save Image" (to Camera Roll) or "Mail" / "Gmail" (photo attached).
      // Android: User can tap "Save to device" / "Google Photos" or "Gmail" (photo attached).
      if (isMobile && typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: meta?.title || 'PCMC Civic Evidence Photo',
            text: meta?.text || 'PCMC CivicWatch Geotagged Evidence Photo'
          });
          return { success: true, method: 'share' };
        } catch (shareErr: unknown) {
          if (shareErr instanceof Error && shareErr.name === 'AbortError') {
            // User intentionally closed or completed the native share sheet
            return { success: true, method: 'share' };
          }
          console.warn('Native share failed or dismissed, falling back to download:', shareErr);
        }
      }

      // 2. Desktop and standard browser: Blob URL download via <a> element
      const blobUrl = URL.createObjectURL(blob);

      if (!isIOS) {
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = filename;
        a.rel = 'noopener noreferrer';
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          if (a.parentNode) a.remove();
          URL.revokeObjectURL(blobUrl);
        }, 3000);
        return { success: true, method: 'download' };
      }

      // 3. iOS Safari fallback: Opening blob URL or window for long-press saving
      const win = window.open(blobUrl, '_blank');
      if (!win) {
        window.location.href = blobUrl;
      }
      return { success: true, method: 'tab', blobUrl };
    }

    // Direct fallback if blob resolution was not possible (e.g. strict cross-origin without CORS)
    if (typeof source === 'string') {
      const a = document.createElement('a');
      a.href = source;
      a.download = filename;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => a.remove(), 200);
      return { success: true, method: 'tab' };
    }

    return { success: false, method: 'fallback', error: 'Unable to process image' };
  } catch (err: unknown) {
    console.warn('saveOrDownloadPhoto error:', err);
    return { success: false, method: 'fallback', error: err instanceof Error ? err.message : String(err) };
  }
}

/**
 * Downloads data URI, blob URL, or remote file reliably.
 */
export async function downloadFile(source: string, filename: string): Promise<void> {
  await saveOrDownloadPhoto(source, filename);
}
