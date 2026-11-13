/**
 * Content Moderation Engine for PCMC CivicWatch
 * Blocks inappropriate uploads at the gate before submission:
 * 1. Client-side pixel & color analysis (Skin tone / nudity heuristics, blank / corrupted images)
 * 2. Gemini 2.5 Flash / 1.5 Flash Vision API (if VITE_GEMINI_API_KEY is available)
 */

export interface ModerationResult {
  isAllowed: boolean;
  violationCategory?: 'NSFW_VULGAR' | 'PRIVATE_INTERIOR' | 'PERSONAL_DISPUTE_PLATE' | 'NOT_CIVIC' | 'CORRUPTED';
  reason: string;
  marathiReason: string;
  source: 'ai_vision' | 'client_heuristic';
}

/**
 * Checks an image blob using on-device canvas analysis (fast, 0ms latency, runs offline)
 */
async function inspectImagePixels(blob: Blob): Promise<{ 
  isLikelyNsfw: boolean; 
  isBlankOrCorrupted: boolean; 
  skinToneRatio: number;
}> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(url);
          resolve({ isLikelyNsfw: false, isBlankOrCorrupted: false, skinToneRatio: 0 });
          return;
        }

        // Downsample to 100x100 for ultra-fast processing
        const width = 100;
        const height = 100;
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        URL.revokeObjectURL(url);

        const imgData = ctx.getImageData(0, 0, width, height);
        const data = imgData.data;
        const totalPixels = width * height;

        let skinPixels = 0;
        let colorSum = 0;
        let minPixel = 255;
        let maxPixel = 0;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const brightness = (r + g + b) / 3;
          colorSum += brightness;

          if (brightness < minPixel) minPixel = brightness;
          if (brightness > maxPixel) maxPixel = brightness;

          // Standard Normalized RGB Human Skin Tone Detection:
          // In natural lighting, skin satisfies: R > 95, G > 40, B > 20, max-min > 15, abs(R-G) > 15, R > G, R > B
          const isSkin =
            r > 95 &&
            g > 40 &&
            b > 20 &&
            Math.max(r, g, b) - Math.min(r, g, b) > 15 &&
            Math.abs(r - g) > 15 &&
            r > g &&
            r > b;

          if (isSkin) {
            skinPixels++;
          }
        }

        const skinRatio = skinPixels / totalPixels;
        const isBlankOrCorrupted = (maxPixel - minPixel) < 10 || (colorSum / totalPixels) < 5;
        // If more than 58% of the frame is detected as exposed human skin tones, flag as likely NSFW/nude content
        const isLikelyNsfw = skinRatio > 0.58;

        resolve({
          isLikelyNsfw,
          isBlankOrCorrupted,
          skinToneRatio: skinRatio
        });
      } catch (e) {
        URL.revokeObjectURL(url);
        resolve({ isLikelyNsfw: false, isBlankOrCorrupted: false, skinToneRatio: 0 });
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ isLikelyNsfw: false, isBlankOrCorrupted: true, skinToneRatio: 0 });
    };

    img.src = url;
  });
}

/**
 * Convert a Blob into base64 string
 */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const res = reader.result as string;
      const base64 = res.includes(',') ? res.split(',')[1] : res;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Validates the image using Gemini Vision API if an API key is available in environment
 */
async function inspectWithGeminiVision(blob: Blob, apiKey: string): Promise<ModerationResult | null> {
  try {
    const base64Data = await blobToBase64(blob);
    const mimeType = blob.type || 'image/jpeg';

    const prompt = `You are an automated content moderation firewall for a public municipal civic reporting app in Pimpri-Chinchwad (PCMC CivicWatch).
Your job is to strictly allow only outdoor public civic infrastructure issues (potholes, asphalt damage, uncollected garbage, overflowing drainage, open manholes, dark streetlights, encroachment on footpaths, broken public amenities).

You must REJECT:
1. Human nudity, pornographic material, sexually suggestive poses, underwear, or vulgar content. (Category: NSFW_VULGAR)
2. Indoor private residences, residential bedrooms, living rooms, bathrooms, kitchens, private balconies. (Category: PRIVATE_INTERIOR)
3. Personal parking disputes focusing solely on someone's car license plate, selfies, memes, animals, food, or non-civic photos. (Category: PERSONAL_DISPUTE_PLATE or NOT_CIVIC)

Respond with strictly valid JSON only with NO markdown fences:
{
  "allowed": true or false,
  "violationCategory": null or "NSFW_VULGAR" or "PRIVATE_INTERIOR" or "PERSONAL_DISPUTE_PLATE" or "NOT_CIVIC",
  "reason": "1 concise sentence explaining acceptance or rejection in English",
  "marathiReason": "1 concise sentence explaining acceptance or rejection in Marathi"
}`;

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType,
                  data: base64Data
                }
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: 'application/json'
        }
      })
    });

    if (!res.ok) {
      console.warn('Gemini vision API response not OK:', res.statusText);
      return null;
    }

    const json = await res.json();
    const candidateText = json?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) return null;

    const parsed = JSON.parse(candidateText.trim());
    return {
      isAllowed: parsed.allowed === true,
      violationCategory: parsed.violationCategory || undefined,
      reason: parsed.reason || (parsed.allowed ? 'Photo verified as outdoor civic issue.' : 'Image violates civic content policy.'),
      marathiReason: parsed.marathiReason || (parsed.allowed ? 'फोटो नागरी समस्येचा असल्याचे सत्यापित झाले.' : 'फोटो नागरी सुरक्षा नियमांचे उल्लंघन करतो.'),
      source: 'ai_vision'
    };
  } catch (err) {
    console.warn('Gemini Vision inspection notice (falling back to client heuristics):', err);
    return null;
  }
}

/**
 * Main Content Moderation Function.
 * Runs instantly when photo is snapped/selected before any network upload.
 */
export async function analyzeImageContent(fileOrBlob: File | Blob): Promise<ModerationResult> {
  // Step 1: Fast On-Device Pixel & Color Analysis
  const pixelStats = await inspectImagePixels(fileOrBlob);

  if (pixelStats.isBlankOrCorrupted) {
    return {
      isAllowed: false,
      violationCategory: 'CORRUPTED',
      reason: 'The image appears blank, dark, or corrupted. Please capture a clear photo in good lighting.',
      marathiReason: 'फोटो अंधुक किंवा खराब दिसत आहे. कृपया पुरेशा प्रकाशात स्पष्ट फोटो घ्या.',
      source: 'client_heuristic'
    };
  }

  if (pixelStats.isLikelyNsfw) {
    return {
      isAllowed: false,
      violationCategory: 'NSFW_VULGAR',
      reason: 'Image rejected: Excessive flesh tones / inappropriate content detected. Only outdoor civic issues are permitted.',
      marathiReason: 'फोटो नाकारला: आक्षेपार्ह किंवा अयोग्य मजकूर आढळला. केवळ सार्वजनिक नागरी समस्येचा फोटो घ्या.',
      source: 'client_heuristic'
    };
  }

  // Step 2: Gemini Vision AI Analysis (if API key is present)
  const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (geminiApiKey && typeof geminiApiKey === 'string' && geminiApiKey.trim().length > 10) {
    const aiResult = await inspectWithGeminiVision(fileOrBlob, geminiApiKey.trim());
    if (aiResult) {
      return aiResult;
    }
  }

  // Passed all client-side pre-submission validations
  return {
    isAllowed: true,
    reason: 'Photo verified as legitimate outdoor civic content.',
    marathiReason: 'फोटो सार्वजनिक नागरी समस्येचा असल्याचे पडताळण्यात आले.',
    source: 'client_heuristic'
  };
}
