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
  return new Promise((resolve, reject) => {
    let resolvedSrc = '';
    let objectUrlToRevoke: string | null = null;

    if (imageSource instanceof Blob) {
      resolvedSrc = URL.createObjectURL(imageSource);
      objectUrlToRevoke = resolvedSrc;
    } else if (typeof imageSource === 'string') {
      resolvedSrc = imageSource;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const width = img.naturalWidth || 1200;
        const height = img.naturalHeight || 900;
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas context unavailable');

        // 1. Draw base photo
        ctx.drawImage(img, 0, 0, width, height);

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
        if (objectUrlToRevoke) {
          try { URL.revokeObjectURL(objectUrlToRevoke); } catch {}
        }
        reject(err);
      }
    };

    img.onerror = () => {
      if (objectUrlToRevoke) {
        try { URL.revokeObjectURL(objectUrlToRevoke); } catch {}
      }
      reject(new Error('Failed to load image for watermarking'));
    };

    img.src = resolvedSrc;
  });
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
