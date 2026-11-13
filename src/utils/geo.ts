import type { Language } from './i18n';

export interface PCMCLocation {
  name: string;
  nameMr?: string;
  ward: string;
  zone: string;
  latitude: number;
  longitude: number;
}

// Comprehensive PCMC Localities & Prabhag Hubs
export const PCMC_PRESETS: PCMCLocation[] = [
  // Zone A: Nigdi, Pradhikaran, Akurdi, Chinchwad Station (Wards 13, 14, 15, 19)
  { name: 'Nigdi Bhakti Shakti Chowk', nameMr: 'निगडी भक्ती शक्ती चौक', ward: 'Ward 14', zone: 'Zone A', latitude: 18.6584, longitude: 73.7712 },
  { name: 'Pradhikaran Sector 27', nameMr: 'प्राधिकरण सेक्टर २७', ward: 'Ward 14', zone: 'Zone A', latitude: 18.6510, longitude: 73.7650 },
  { name: 'Akurdi Khandoba Mal & Railway Station', nameMr: 'आकुर्डी खंडोबा माळ व रेल्वे स्टेशन', ward: 'Ward 15', zone: 'Zone A', latitude: 18.6478, longitude: 73.7821 },
  { name: 'Chinchwad Railway Station Road', nameMr: 'चिंचवड रेल्वे स्टेशन रोड', ward: 'Ward 19', zone: 'Zone B', latitude: 18.6355, longitude: 73.7884 },

  // Zone J: Kiwale, Ravet, Tathawade, Punawale (Wards 16, 25, 26)
  { name: 'Kiwale Mukai Chowk', nameMr: 'किवळे मुकाई चौक', ward: 'Ward 16', zone: 'Zone J', latitude: 18.6610, longitude: 73.7290 },
  { name: 'Ravet Basket Bridge & BRT Road', nameMr: 'रावेत बास्केट ब्रिज व बीआरटी रोड', ward: 'Ward 16', zone: 'Zone J', latitude: 18.6542, longitude: 73.7431 },
  { name: 'Tathawade Bhujbal Chowk & JSPM', nameMr: 'ताथवडे भुजबळ चौक व जेएसपीएम', ward: 'Ward 25', zone: 'Zone J', latitude: 18.6050, longitude: 73.7530 },
  { name: 'Punawale 18 Latitude Chowk', nameMr: 'पुनावळे १८ लॅटिट्यूड चौक', ward: 'Ward 25', zone: 'Zone J', latitude: 18.6220, longitude: 73.7450 },

  // Zone B: Chinchwadgaon, Dalvinagar, Walhekarwadi (Wards 17, 18)
  { name: 'Chinchwadgaon Mangalmurti Wada', nameMr: 'चिंचवडगाव मंगलमूर्ती वाडा', ward: 'Ward 17', zone: 'Zone B', latitude: 18.6280, longitude: 73.7820 },

  // Zone G: Thergaon, Kalewadi, Wakad (Wards 22, 23, 24)
  { name: 'Thergaon Dange Chowk', nameMr: 'थेरगाव डांगे चौक', ward: 'Ward 23', zone: 'Zone G', latitude: 18.6145, longitude: 73.7735 },
  { name: 'Kalewadi Main Chowk', nameMr: 'काळेवाडी मुख्य चौक', ward: 'Ward 22', zone: 'Zone G', latitude: 18.6080, longitude: 73.7920 },
  { name: 'Wakad Bridge & Datta Mandir Road', nameMr: 'वाकड ब्रिज व दत्त मंदिर रोड', ward: 'Ward 25', zone: 'Zone G', latitude: 18.5987, longitude: 73.7661 },

  // Zone D: Pimple Saudagar, Rahatani, Pimprigaon (Wards 21, 27, 28, 29)
  { name: 'Rahatani Phata & Shivar Garden', nameMr: 'रहाटणी फाटा व शिवार गार्डन', ward: 'Ward 28', zone: 'Zone D', latitude: 18.6020, longitude: 73.7910 },
  { name: 'Pimple Saudagar Kokane Chowk', nameMr: 'पिंपळे सौदागर कोकणे चौक', ward: 'Ward 28', zone: 'Zone D', latitude: 18.5952, longitude: 73.7981 },
  { name: 'Pimple Gurav Kate Puram Chowk', nameMr: 'पिंपळे गुरव काटे पुरम चौक', ward: 'Ward 27', zone: 'Zone D', latitude: 18.5880, longitude: 73.8080 },

  // Zone L: Bhosari, Indrayani Nagar, Sant Tukaram Nagar (Wards 05, 06, 07, 20)
  { name: 'Bhosari MIDC Spine Road', nameMr: 'भोसरी एमआयडीसी स्पाईन रोड', ward: 'Ward 05', zone: 'Zone L', latitude: 18.6392, longitude: 73.8427 },
  { name: 'Indrayani Nagar Sector 4', nameMr: 'इंद्रायणी नगर सेक्टर ४', ward: 'Ward 05', zone: 'Zone L', latitude: 18.6440, longitude: 73.8350 },
  { name: 'Vallabhnagar ST Stand & Dr. DY Patil', nameMr: 'वल्लभनगर एसटी स्टँड व डॉ. डी. वाय. पाटील', ward: 'Ward 20', zone: 'Zone L', latitude: 18.6240, longitude: 73.8190 },

  // Zone E: Moshi, Charholi, Dighi, Bopkhel (Wards 02, 03, 04, 08)
  { name: 'Moshi Toll Naka & Spine City', nameMr: 'मोशी टोल नाका व स्पाईन सिटी', ward: 'Ward 02', zone: 'Zone E', latitude: 18.6720, longitude: 73.8510 },
  { name: 'Charholi Budruk & Wadmukhwadi', nameMr: 'चरहोली बुद्रुक व वडमुखवाडी', ward: 'Ward 08', zone: 'Zone E', latitude: 18.6250, longitude: 73.8820 },
  { name: 'Dighi Magazine Chowk', nameMr: 'दिघी मॅगझिन चौक', ward: 'Ward 03', zone: 'Zone E', latitude: 18.6180, longitude: 73.8740 },
  { name: 'Bopkhel Military Camp Road', nameMr: 'बोपखेल मिलिटरी कॅम्प रोड', ward: 'Ward 04', zone: 'Zone E', latitude: 18.5920, longitude: 73.8680 },

  // Zone F: Chikhali, Talawade, Rupeenagar (Wards 01, 11, 12, 13)
  { name: 'Chikhali Kudalwadi Chowk', nameMr: 'चिखली कुदळवाडी चौक', ward: 'Ward 01', zone: 'Zone F', latitude: 18.6750, longitude: 73.8120 },
  { name: 'Talawade IT Park Tower', nameMr: 'तळवडे आयटी पार्क टॉवर', ward: 'Ward 12', zone: 'Zone F', latitude: 18.6850, longitude: 73.7780 },
  { name: 'Rupeenagar Main Market', nameMr: 'रुपीनगर मुख्य बाजार', ward: 'Ward 13', zone: 'Zone F', latitude: 18.6710, longitude: 73.7850 },

  // Zone H: Sangvi, Dapodi, Kasarwadi (Wards 24, 30, 31, 32)
  { name: 'Sangvi Old PWD Chowk & Famous Chowk', nameMr: 'सांगवी जुने पीडब्ल्यूडी चौक व फेमस चौक', ward: 'Ward 30', zone: 'Zone H', latitude: 18.5772, longitude: 73.8184 },
  { name: 'Dapodi CME Gate & Khadki Border', nameMr: 'दापोडी सीएमई गेट व खडकी सीमा', ward: 'Ward 31', zone: 'Zone H', latitude: 18.5810, longitude: 73.8340 },
  { name: 'Kasarwadi Nashik Phata Metro Station', nameMr: 'कासारवाडी नाशिक फाटा मेट्रो स्टेशन', ward: 'Ward 24', zone: 'Zone H', latitude: 18.6090, longitude: 73.8210 }
];

export const PCMC_CENTER = {
  latitude: 18.6298,
  longitude: 73.7997,
  name: 'PCMC Bhavan, Pimpri'
};

// PCMC Approximate Municipal Boundary Bounding Box
export const PCMC_BOUNDS = {
  minLat: 18.560,
  maxLat: 18.720,
  minLng: 73.710,
  maxLng: 73.910
};

// In-memory cache for reverse geocoding to prevent repeat calls
const geocodeCache = new Map<string, { formattedArea: string; isWithinPCMC: boolean }>();

/**
 * Robust live reverse geocoding using OpenStreetMap Nominatim.
 * Accurately detects street, society, neighbourhood, suburb, and municipality.
 */
export async function reverseGeocodeLocation(lat: number, lon: number): Promise<{
  formattedArea: string;
  isWithinPCMC: boolean;
  suburb?: string;
  city?: string;
}> {
  const cacheKey = `${lat.toFixed(4)},${lon.toFixed(4)}`;
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey)!;
  }

  const isWithinPCMC =
    lat >= PCMC_BOUNDS.minLat &&
    lat <= PCMC_BOUNDS.maxLat &&
    lon >= PCMC_BOUNDS.minLng &&
    lon <= PCMC_BOUNDS.maxLng;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
      {
        headers: { 'User-Agent': 'PCMC-CivicWatch/1.0 (pcmc-civicwatch-pwa)' },
        signal: controller.signal
      }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};

      // Identify most specific landmark or road
      const primaryRoad =
        addr.road ||
        addr.residential ||
        addr.pedestrian ||
        addr.footway ||
        addr.amenity ||
        addr.building;

      // Identify locality, suburb, or neighborhood
      const neighbourhood = addr.neighbourhood;
      const suburb =
        addr.suburb ||
        addr.village ||
        addr.town ||
        addr.city_district ||
        addr.neighbourhood;

      // Identify municipality
      const city =
        addr.city ||
        addr.county ||
        addr.state_district ||
        (isWithinPCMC ? 'Pimpri-Chinchwad' : '');

      const parts: string[] = [];
      if (primaryRoad) parts.push(primaryRoad);
      if (neighbourhood && neighbourhood !== primaryRoad && !parts.includes(neighbourhood)) {
        parts.push(neighbourhood);
      }
      if (suburb && !parts.includes(suburb)) {
        parts.push(suburb);
      }
      if (city && !parts.includes(city) && parts.length < 3) {
        parts.push(city);
      }

      let formatted = parts.join(', ').trim();
      if (!formatted) {
        formatted = (data.display_name || '').split(',').slice(0, 3).join(', ').trim();
      }

      // If the address lacks a specific road, neighborhood, or suburb, or is simply "Pimpri-Chinchwad",
      // enrich it with the nearest known PCMC locality (e.g. "Kiwale Mukai Chowk")
      const hasSpecificDetail = primaryRoad || neighbourhood || suburb;
      if (!hasSpecificDetail || formatted === 'Pimpri-Chinchwad' || !formatted) {
        const nearestLocality = estimatePCMCArea(lat, lon);
        formatted = `${nearestLocality}, Pimpri-Chinchwad`;
      }

      // If outside PCMC, tag with context
      if (!isWithinPCMC) {
        const nearestPCMC = estimatePCMCArea(lat, lon);
        formatted = `${formatted} (Near PCMC: ${nearestPCMC})`;
      }

      const result = { formattedArea: formatted, isWithinPCMC, suburb, city };
      geocodeCache.set(cacheKey, result);
      return result;
    }
  } catch (err) {
    console.warn('Nominatim reverse geocode fallback to local presets:', err);
  }

  // Fallback to nearest local PCMC landmark
  const fallback = estimatePCMCArea(lat, lon);
  const result = {
    formattedArea: isWithinPCMC ? `${fallback}, Pimpri-Chinchwad` : `${fallback} (Outside PCMC bounds)`,
    isWithinPCMC
  };
  geocodeCache.set(cacheKey, result);
  return result;
}

/**
 * Finds the nearest known PCMC area / ward name for any lat/lon.
 */
export function estimatePCMCArea(lat: number, lon: number): string {
  let minDistance = Infinity;
  let closest = PCMC_PRESETS[0];

  for (const preset of PCMC_PRESETS) {
    const dLat = (preset.latitude - lat) * 111000;
    const dLon = (preset.longitude - lon) * 111000 * Math.cos(lat * (Math.PI / 180));
    const dist = Math.sqrt(dLat * dLat + dLon * dLon);
    if (dist < minDistance) {
      minDistance = dist;
      closest = preset;
    }
  }

  return closest.name;
}

/**
 * Formats SLA duration open vs target SLA
 */
export function getSLAStatus(createdAt: string, slaHours: number, status: string, resolvedAt?: string | null, language: Language = 'en') {
  const isMr = language === 'mr';
  const createdTime = new Date(createdAt).getTime();
  const endTime = status === 'RESOLVED' && resolvedAt ? new Date(resolvedAt).getTime() : Date.now();
  const elapsedMs = Math.max(0, endTime - createdTime);
  const elapsedHours = Math.floor(elapsedMs / (1000 * 60 * 60));
  const elapsedDays = Math.floor(elapsedHours / 24);

  const elapsedStr = isMr
    ? (elapsedDays > 0 ? `${elapsedDays} दिवस ${elapsedHours % 24} तास` : `${elapsedHours} तास`)
    : (elapsedDays > 0 ? `${elapsedDays}d ${elapsedHours % 24}h` : `${elapsedHours}h`);

  if (status === 'RESOLVED') {
    return {
      isResolved: true,
      label: isMr ? 'निवारण झाले' : 'Resolved',
      durationOpenStr: isMr ? `${elapsedStr} मध्ये निवारण` : `Resolved in ${elapsedStr}`,
      slaRatioText: isMr ? `${elapsedStr} मध्ये निवारण (SLA: ${slaHours} तास)` : `${elapsedStr} to resolve (SLA: ${slaHours}h)`,
      badgeClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
      isOverdue: elapsedHours > slaHours,
      overdueHours: Math.max(0, elapsedHours - slaHours)
    };
  }

  const slaTargetTime = createdTime + slaHours * 60 * 60 * 1000;
  const now = Date.now();
  const diffMs = slaTargetTime - now;

  if (diffMs > 0) {
    const hoursLeft = Math.floor(diffMs / (1000 * 60 * 60));
    const minsLeft = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    let text = isMr ? `${hoursLeft} तास शिल्लक` : `${hoursLeft}h left`;
    if (hoursLeft > 24) {
      const daysLeft = Math.floor(hoursLeft / 24);
      text = isMr ? `${daysLeft} दिवस ${hoursLeft % 24} तास शिल्लक` : `${daysLeft}d ${hoursLeft % 24}h left`;
    } else if (hoursLeft === 0) {
      text = isMr ? `${minsLeft} मिनिटे शिल्लक` : `${minsLeft}m left`;
    }

    const isUrgent = hoursLeft <= 12;

    return {
      isResolved: false,
      label: isMr ? `मुदत: ${text}` : `SLA: ${text}`,
      durationOpenStr: isMr ? `${elapsedStr} प्रलंबित` : `Open for ${elapsedStr}`,
      slaRatioText: isMr
        ? `${elapsedStr} प्रलंबित / ${slaHours} तास SLA (${text})`
        : `Open for ${elapsedStr} / ${slaHours}h SLA (${text})`,
      badgeClass: isUrgent 
        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 animate-pulse'
        : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      isOverdue: false,
      overdueHours: 0
    };
  } else {
    const overdueHours = Math.abs(Math.floor(diffMs / (1000 * 60 * 60)));
    const overdueDays = Math.floor(overdueHours / 24);
    const overdueStr = isMr
      ? (overdueDays > 0 ? `${overdueDays} दिवस ${overdueHours % 24} तास` : `${overdueHours} तास`)
      : (overdueDays > 0 ? `${overdueDays}d ${overdueHours % 24}h` : `${overdueHours}h`);

    return {
      isResolved: false,
      label: isMr ? `${overdueStr} मुदत संपली` : `Overdue by ${overdueStr}`,
      durationOpenStr: isMr ? `${elapsedStr} प्रलंबित` : `Open for ${elapsedStr}`,
      slaRatioText: isMr
        ? `${elapsedStr} प्रलंबित / ${slaHours} तास SLA (${overdueStr} मुदत उलटली)`
        : `Open for ${elapsedStr} / ${slaHours}h SLA (Overdue by ${overdueStr})`,
      badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/50 font-bold',
      isOverdue: true,
      overdueHours
    };
  }
}
