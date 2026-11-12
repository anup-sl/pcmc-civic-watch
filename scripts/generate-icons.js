import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const svgIcon = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="50%" stop-color="#020617" />
      <stop offset="100%" stop-color="#020617" />
    </linearGradient>
    <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#06b6d4" />
      <stop offset="50%" stop-color="#2563eb" />
      <stop offset="100%" stop-color="#4f46e5" />
    </linearGradient>
    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="100%" stop-color="#06b6d4" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="16" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Background container -->
  <rect width="512" height="512" rx="108" fill="url(#bgGrad)" />
  <rect width="504" height="504" x="4" y="4" rx="104" fill="none" stroke="#1e293b" stroke-width="4" />

  <!-- Background decorative circular glow -->
  <circle cx="256" cy="256" r="160" fill="#06b6d4" opacity="0.12" filter="url(#glow)" />

  <!-- Shield Base Shape -->
  <path 
    d="M256 76 L392 124 C392 272 344 372 256 424 C168 372 120 272 120 124 Z" 
    fill="url(#shieldGrad)" 
    stroke="#38bdf8" 
    stroke-width="8" 
    stroke-linejoin="round"
    filter="url(#glow)"
  />

  <!-- Inner Shield Inset -->
  <path 
    d="M256 104 L368 144 C368 260 328 344 256 388 C184 344 144 260 144 144 Z" 
    fill="#0f172a" 
    opacity="0.9"
  />

  <!-- Center Pin / Camera Focal Emblem -->
  <!-- Pin Head / Lens Outer -->
  <circle cx="256" cy="216" r="54" fill="url(#shieldGrad)" stroke="#ffffff" stroke-width="6" />
  
  <!-- Camera Lens Core -->
  <circle cx="256" cy="216" r="28" fill="#ffffff" />
  <circle cx="256" cy="216" r="14" fill="#020617" />
  
  <!-- Camera Lens Flare Dot -->
  <circle cx="268" cy="206" r="5" fill="#ffffff" />

  <!-- Pin Point descending from circle -->
  <path 
    d="M224 252 L256 320 L288 252 Z" 
    fill="url(#accentGrad)" 
    stroke="#38bdf8" 
    stroke-width="3"
    stroke-linejoin="round"
  />

  <!-- Small civic star/flame accent top right -->
  <circle cx="356" cy="136" r="8" fill="#38bdf8" />
</svg>
`;

// Maskable icon with safe margin (Android adaptive icon needs 20% safe zone padding)
const svgMaskableIcon = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="50%" stop-color="#020617" />
      <stop offset="100%" stop-color="#020617" />
    </linearGradient>
    <linearGradient id="shieldGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#06b6d4" />
      <stop offset="50%" stop-color="#2563eb" />
      <stop offset="100%" stop-color="#4f46e5" />
    </linearGradient>
    <linearGradient id="accentGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="100%" stop-color="#06b6d4" />
    </linearGradient>
  </defs>

  <!-- Full bleed background for adaptive masking -->
  <rect width="512" height="512" fill="url(#bgGrad2)" />

  <!-- Scaled down to 72% to fit safe zone -->
  <g transform="translate(71.68, 71.68) scale(0.72)">
    <circle cx="256" cy="256" r="160" fill="#06b6d4" opacity="0.12" />

    <!-- Shield Base Shape -->
    <path 
      d="M256 76 L392 124 C392 272 344 372 256 424 C168 372 120 272 120 124 Z" 
      fill="url(#shieldGrad2)" 
      stroke="#38bdf8" 
      stroke-width="8" 
      stroke-linejoin="round"
    />

    <!-- Inner Shield Inset -->
    <path 
      d="M256 104 L368 144 C368 260 328 344 256 388 C184 344 144 260 144 144 Z" 
      fill="#0f172a" 
      opacity="0.9"
    />

    <circle cx="256" cy="216" r="54" fill="url(#shieldGrad2)" stroke="#ffffff" stroke-width="6" />
    <circle cx="256" cy="216" r="28" fill="#ffffff" />
    <circle cx="256" cy="216" r="14" fill="#020617" />
    <circle cx="268" cy="206" r="5" fill="#ffffff" />

    <path 
      d="M224 252 L256 320 L288 252 Z" 
      fill="url(#accentGrad2)" 
      stroke="#38bdf8" 
      stroke-width="3"
      stroke-linejoin="round"
    />
  </g>
</svg>
`;

async function generate() {
  const publicDir = path.resolve('public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // 1. Write favicon.svg
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgIcon.trim());
  console.log('Generated public/favicon.svg');

  // 2. 512x512 PWA Icon
  await sharp(Buffer.from(svgIcon))
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));
  console.log('Generated public/pwa-512x512.png');

  // 3. 192x192 PWA Icon
  await sharp(Buffer.from(svgIcon))
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));
  console.log('Generated public/pwa-192x192.png');

  // 4. Apple Touch Icon 180x180
  await sharp(Buffer.from(svgIcon))
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('Generated public/apple-touch-icon.png');

  // 5. Maskable Icon 512x512
  await sharp(Buffer.from(svgMaskableIcon))
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'maskable-icon-512x512.png'));
  console.log('Generated public/maskable-icon-512x512.png');
}

generate().catch(console.error);
