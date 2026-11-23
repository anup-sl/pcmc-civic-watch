import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://lxkpvqobtfstysszezwk.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_6RSg1BUPhGGm0L4_VOXp-A_LJaNzh4o';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function cleanNoIndia(text) {
  if (!text) return '';
  return text
    .replace(/,\s*India\b/gi, '')
    .replace(/\bIndia\b/gi, '')
    .replace(/,\s*,/g, ',')
    .trim()
    .replace(/,\s*$/, '');
}

function escapeXml(unsafe) {
  return String(unsafe).replace(/[<>&'"]/g, c => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
    }
  });
}

function formatGPSTimestamp(date) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = days[date.getDay()];
  const pad = (n) => n.toString().padStart(2, '0');
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

function buildSvgBanner({ width, scale, cleanHeader, addressLine, latVal, lngVal, timestampStr }) {
  const mapSize = Math.max(64, Math.round(76 * scale));
  const padX = Math.round(18 * scale);
  const padY = Math.round(14 * scale);
  const bannerHeight = Math.max(mapSize + padY * 2, Math.round(135 * scale));

  const mapX = padX;
  const mapY = Math.round((bannerHeight - mapSize) / 2);
  const mapCenterX = Math.round(mapX + mapSize * 0.48);
  const mapCenterY = Math.round(mapY + mapSize * 0.45);

  const textX = mapX + mapSize + Math.round(16 * scale);

  const fontHeader = Math.max(14, Math.round(16 * scale));
  const fontAddress = Math.max(12, Math.round(13.5 * scale));
  const fontCoords = Math.max(11, Math.round(12.5 * scale));
  const fontTimestamp = Math.max(11, Math.round(12 * scale));

  const y1 = Math.round(28 * scale);
  const y2 = Math.round(y1 + fontAddress * 1.35);
  const y3 = Math.round(y2 + fontCoords * 1.35);
  const y4 = Math.round(y3 + fontTimestamp * 1.35);

  return {
    bannerHeight,
    svg: `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${bannerHeight}">
  <defs>
    <clipPath id="mapClip">
      <rect x="${mapX}" y="${mapY}" width="${mapSize}" height="${mapSize}" rx="${Math.max(4, Math.round(mapSize * 0.08))}" />
    </clipPath>
  </defs>

  <!-- Dark semi-transparent overlay: rgba(10, 15, 30, 0.88) -->
  <rect x="0" y="0" width="${width}" height="${bannerHeight}" fill="#0a0f1e" fill-opacity="0.88" />

  <!-- Top cyan highlight line -->
  <rect x="0" y="0" width="${width}" height="${Math.max(2, Math.round(2.5 * scale))}" fill="#06b6d4" />

  <!-- Mini Map Box -->
  <g clip-path="url(#mapClip)">
    <rect x="${mapX}" y="${mapY}" width="${mapSize}" height="${mapSize}" fill="#0f172a" />
    <rect x="${mapX + mapSize * 0.08}" y="${mapY + mapSize * 0.08}" width="${mapSize * 0.35}" height="${mapSize * 0.28}" fill="#166534" fill-opacity="0.45" />
    <rect x="${mapX + mapSize * 0.58}" y="${mapY + mapSize * 0.55}" width="${mapSize * 0.35}" height="${mapSize * 0.35}" fill="#166534" fill-opacity="0.45" />
    <path d="M ${mapX} ${mapY + mapSize * 0.7} Q ${mapX + mapSize * 0.45} ${mapY + mapSize * 0.65} ${mapX + mapSize} ${mapY + mapSize * 0.65}" stroke="#0284c7" stroke-width="${Math.max(2, mapSize * 0.05)}" fill="none" opacity="0.6" />
    <line x1="${mapX}" y1="${mapY + mapSize * 0.45}" x2="${mapX + mapSize}" y2="${mapY + mapSize * 0.45}" stroke="#94a3b8" stroke-width="${Math.max(1.5, mapSize * 0.03)}" opacity="0.35" />
    <line x1="${mapX + mapSize * 0.45}" y1="${mapY}" x2="${mapX + mapSize * 0.45}" y2="${mapY + mapSize}" stroke="#94a3b8" stroke-width="${Math.max(1.5, mapSize * 0.03)}" opacity="0.35" />
    <line x1="${mapX}" y1="${mapY + mapSize * 0.85}" x2="${mapX + mapSize * 0.85}" y2="${mapY}" stroke="#fbbf24" stroke-width="${Math.max(2, mapSize * 0.04)}" opacity="0.65" />
    <circle cx="${mapCenterX}" cy="${mapCenterY}" r="${mapSize * 0.22}" fill="#ef4444" fill-opacity="0.3" />
    <path d="M ${mapCenterX} ${mapCenterY + mapSize * 0.12} L ${mapCenterX - mapSize * 0.08} ${mapCenterY - mapSize * 0.02} A ${mapSize * 0.1} ${mapSize * 0.1} 0 1 1 ${mapCenterX + mapSize * 0.08} ${mapCenterY - mapSize * 0.02} Z" fill="#ef4444" stroke="#ffffff" stroke-width="${Math.max(1, mapSize * 0.02)}" />
    <circle cx="${mapCenterX}" cy="${mapCenterY - mapSize * 0.05}" r="${mapSize * 0.035}" fill="#ffffff" />
  </g>
  <rect x="${mapX}" y="${mapY}" width="${mapSize}" height="${mapSize}" rx="${Math.max(4, Math.round(mapSize * 0.08))}" fill="none" stroke="#38bdf8" stroke-width="${Math.max(1.5, Math.round(mapSize * 0.025))}" />

  <!-- Text Stack -->
  <text x="${textX}" y="${y1}" font-family="Plus Jakarta Sans, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif" font-weight="700" font-size="${fontHeader}px" fill="#ffffff">${escapeXml(cleanHeader)}</text>
  <text x="${textX}" y="${y2}" font-family="Plus Jakarta Sans, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif" font-weight="500" font-size="${fontAddress}px" fill="#cbd5e1">${escapeXml(addressLine)}</text>
  <text x="${textX}" y="${y3}" font-family="SF Mono, Menlo, Monaco, Consolas, Courier New, monospace" font-weight="600" font-size="${fontCoords}px" fill="#22d3ee">Lat ${latVal}, Long ${lngVal}</text>
  <text x="${textX}" y="${y4}" font-family="Plus Jakarta Sans, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif" font-weight="400" font-size="${fontTimestamp}px" fill="#94a3b8">${escapeXml(timestampStr)}</text>
</svg>
`
  };
}

async function backfillAll() {
  console.log('Fetching all reports with photos...');
  const { data: reports, error } = await supabase
    .from('reports')
    .select('id, hotspot_id, report_type, photo_url, created_at, hotspots(latitude, longitude, area_name, category)')
    .not('photo_url', 'is', null)
    .order('created_at', { ascending: false });

  if (error || !reports) {
    console.error('Failed to fetch reports:', error);
    process.exit(1);
  }

  console.log(`Found ${reports.length} total reports with photo URLs.`);

  let updatedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (let i = 0; i < reports.length; i++) {
    const report = reports[i];
    const prefix = `[${i + 1}/${reports.length}] (Report ID ${report.id.slice(0, 8)})`;

    // Skip if already stamped by this script
    if (report.photo_url.includes('/test-wm-') || report.photo_url.includes('/wm-')) {
      console.log(`${prefix} Already watermarked: ${report.photo_url}. Skipping.`);
      skippedCount++;
      continue;
    }

    try {
      console.log(`${prefix} Downloading photo: ${report.photo_url}...`);
      const res = await fetch(report.photo_url);
      if (!res.ok) {
        console.warn(`${prefix} Failed to fetch HTTP ${res.status}. Skipping.`);
        errorCount++;
        continue;
      }

      const arrayBuf = await res.arrayBuffer();
      const inputBuf = Buffer.from(arrayBuf);

      const img = sharp(inputBuf);
      const meta = await img.metadata();
      const width = meta.width || 1200;
      const height = meta.height || 900;
      const scale = Math.max(0.7, Math.min(2.5, width / 1100));

      const cleanHeader = cleanNoIndia('Pimpri Chinchwad, Maharashtra');
      const rawAddress = report.hotspots?.area_name || 'Pimpri-Chinchwad, Maharashtra';
      const addressLine = cleanNoIndia(rawAddress);
      const latVal = (report.hotspots?.latitude || 18.6298).toFixed(6);
      const lngVal = (report.hotspots?.longitude || 73.7997).toFixed(6);
      const dateObj = report.created_at ? new Date(report.created_at) : new Date();
      const timestampStr = formatGPSTimestamp(dateObj);

      const { bannerHeight, svg } = buildSvgBanner({
        width,
        scale,
        cleanHeader,
        addressLine,
        latVal,
        lngVal,
        timestampStr
      });

      const bannerY = height - bannerHeight;

      const stampedBuffer = await img
        .composite([
          {
            input: Buffer.from(svg),
            top: bannerY,
            left: 0
          }
        ])
        .jpeg({ quality: 90 })
        .toBuffer();

      const newStoragePath = `wm-${report.id.slice(0, 8)}-${Date.now()}.jpg`;
      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from('civic-photos')
        .upload(newStoragePath, stampedBuffer, {
          contentType: 'image/jpeg'
        });

      if (uploadErr || !uploadData) {
        console.error(`${prefix} Failed to upload to Supabase storage:`, uploadErr);
        errorCount++;
        continue;
      }

      const { data: pubData } = supabase.storage
        .from('civic-photos')
        .getPublicUrl(newStoragePath);

      const newPublicUrl = pubData.publicUrl;

      // Update the report in the database
      const { error: updateErr } = await supabase
        .from('reports')
        .update({ photo_url: newPublicUrl })
        .eq('id', report.id);

      if (updateErr) {
        console.error(`${prefix} Failed to update report photo_url in DB:`, updateErr);
        errorCount++;
        continue;
      }

      console.log(`${prefix} Successfully backfilled -> ${newPublicUrl}`);
      updatedCount++;
    } catch (err) {
      console.error(`${prefix} Error processing report:`, err);
      errorCount++;
    }
  }

  console.log(`\n=== Backfill Migration Complete ===`);
  console.log(`Total: ${reports.length}`);
  console.log(`Updated: ${updatedCount}`);
  console.log(`Skipped (already watermarked): ${skippedCount}`);
  console.log(`Errors: ${errorCount}`);
}

backfillAll().catch(console.error);
