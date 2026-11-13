import { estimatePCMCArea } from './geo';

export interface ZonalOffice {
  zone: string;
  marathiZone: string;
  fort?: string;
  address?: string;
  wardNumbers: string;
  coverage: string;
  officer: string;
  email: string;
  phone: string;
  phoneFormatted: string;
}

export const ZONAL_OFFICES: ZonalOffice[] = [
  {
    zone: 'Zone A',
    marathiZone: 'अ क्षेत्रीय कार्यालय (राजगड)',
    fort: 'Rajgad (राजगड)',
    address: 'संत ज्ञानेश्वर चौक, निगडी प्राधिकरण, निगडी ४११०४४',
    wardNumbers: 'Wards 13, 14, 15',
    coverage: 'Nigdi Gaothan, Pradhikaran, Akurdi, Chinchwad Station, Mohannagar, Kalbhornagar (Wards 13, 14, 15)',
    officer: 'Assistant Commissioner, Zone A',
    email: 'azone@pcmcindia.gov.in',
    phone: '02027646621',
    phoneFormatted: '+91-020-27646621'
  },
  {
    zone: 'Zone B',
    marathiZone: 'ब क्षेत्रीय कार्यालय (सिंहगड)',
    fort: 'Sinhagad (सिंहगड)',
    address: 'लिंक रोड, एल प्रो कंपनी आवार, चिंचवडगाव, पुणे ४११०३३',
    wardNumbers: 'Wards 17, 18, 19',
    coverage: 'Chinchwadgaon, Dalvinagar, Walhekarwadi Gaothan, SKF Colony, Pimpri Camp, Udyognagar (Wards 17, 18, 19)',
    officer: 'Assistant Commissioner, Zone B',
    email: 'bzone@pcmcindia.gov.in',
    phone: '02027350153',
    phoneFormatted: '+91-020-27350153'
  },
  {
    zone: 'Zone C',
    marathiZone: 'क क्षेत्रीय कार्यालय (विजयदुर्ग)',
    fort: 'Vijaydurg (विजयदुर्ग)',
    address: 'हॉकी स्टेडियम शेजारी, नेहरूनगर, भोसरी, पुणे ४११०२६',
    wardNumbers: 'Wards 02, 09, 10',
    coverage: 'Chikhali East, Jadhavwadi, Borhadewadi, Nehrunagar, Ajmera, Masulkar Colony, Sambhajinagar, Shahunagar (Wards 02, 09, 10)',
    officer: 'Assistant Commissioner, Zone C',
    email: 'czone@pcmcindia.gov.in',
    phone: '02027122969',
    phoneFormatted: '+91-020-27122969'
  },
  {
    zone: 'Zone D',
    marathiZone: 'ड क्षेत्रीय कार्यालय (देवगिरी)',
    fort: 'Devgiri (देवगिरी)',
    address: 'औंध-रावेत रोड, रहाटणी, पुणे ४११०१७',
    wardNumbers: 'Wards 21, 27, 28, 29',
    coverage: 'Pimprigaon, Tapkirnagar, Rahatani, Pimple Saudagar (Kokane Chowk, Shivar Garden), Kalpataru Estate, Pimple Gurav (Wards 21, 27, 28, 29)',
    officer: 'Assistant Commissioner, Zone D',
    email: 'dzone@pcmcindia.gov.in',
    phone: '02027277898',
    phoneFormatted: '+91-020-27277898'
  },
  {
    zone: 'Zone E',
    marathiZone: 'इ क्षेत्रीय कार्यालय (शिवनेरी)',
    fort: 'Shivneri (शिवनेरी)',
    address: 'पांजरपोळ संस्थे समोर, नाशिक रोड, भोसरी, पुणे ४११०३९',
    wardNumbers: 'Wards 03, 04, 05',
    coverage: 'Moshi Gaothan, Charholi, Dudulgaon, Dighi, Bopkhel, VSNL Road, Ramnagar, Gawlinagar (Wards 03, 04, 05)',
    officer: 'Assistant Commissioner, Zone E',
    email: 'ezone@pcmcindia.gov.in',
    phone: '02027230412',
    phoneFormatted: '+91-020-27230412'
  },
  {
    zone: 'Zone F',
    marathiZone: 'फ क्षेत्रीय कार्यालय (तोरणा)',
    fort: 'Torna (तोरणा)',
    address: 'नवनगर विकास प्राधिकरण कार्यालयाची जुनी इमारत, लोकमान्य टिळक चौक, निगडी ४११०४४',
    wardNumbers: 'Wards 01, 11, 12',
    coverage: 'Chikhali Gaothan, Kudalwadi, Krishnanagar, Purnanagar, Talawade MIDC IT Park, Rupeenagar, Triveninagar (Wards 01, 11, 12)',
    officer: 'Assistant Commissioner, Zone F',
    email: 'fzone@pcmcindia.gov.in',
    phone: '02027230410',
    phoneFormatted: '+91-020-27230410'
  },
  {
    zone: 'Zone G',
    marathiZone: 'ग क्षेत्रीय कार्यालय (पुरंदर)',
    fort: 'Purandar (पुरंदर)',
    address: 'तिसरा मजला, नविन प्रशासकिय इमारत, दिलिप वेंगसरकर क्रिकेट अकॅडमी मागे, थेरगाव, पुणे ४११०३३',
    wardNumbers: 'Wards 22, 23, 24',
    coverage: 'Kalewadi, Vijayanagar, Thergaon Gaothan, Dange Chowk, Wakad (Aditya Birla Hospital, Datta Mandir, Greens) (Wards 22, 23, 24)',
    officer: 'Assistant Commissioner, Zone G',
    email: 'gzone@pcmcindia.gov.in',
    phone: '7887879555',
    phoneFormatted: '7887879555'
  },
  {
    zone: 'Zone H',
    marathiZone: 'ह क्षेत्रीय कार्यालय (प्रतापगड)',
    fort: 'Pratapgad (प्रतापगड)',
    address: 'कासारवाडी येथील महिला आय.टी.आय इमारत, कासारवाडी, पुणे',
    wardNumbers: 'Wards 30, 31, 32',
    coverage: 'Kasarwadi, Fugewadi, Dapodi, Sangvi (Old & New), Sangamnagar, PWD Colony, Sairaj Residency (Wards 30, 31, 32)',
    officer: 'Assistant Commissioner, Zone H',
    email: 'hzone@pcmcindia.gov.in',
    phone: '02027142503',
    phoneFormatted: '020-27142503 / 04'
  },
  {
    zone: 'Zone J',
    marathiZone: 'ज क्षेत्रीय कार्यालय (रायगड)',
    fort: 'Raigad (रायगड)',
    address: 'स. नं. २७, मनपा वाहनतळ इमारत, ताथवडे, पुणे ४११०३३',
    wardNumbers: 'Wards 16, 25, 26',
    coverage: 'Kiwale (Mukai Chowk), Ravet (Basket Bridge, BRT), Mamurdi, Vikas Nagar, Punawale, Tathawade (JSPM), Pimple Nilakh (Vishal Nagar, Kaspatewasti) (Wards 16, 25, 26)',
    officer: 'Assistant Commissioner, Zone J',
    email: 'jzone@pcmcindia.gov.in',
    phone: '8888006666',
    phoneFormatted: 'PCMC Sarathi: 8888006666'
  },
  {
    zone: 'Zone L',
    marathiZone: 'ल क्षेत्रीय कार्यालय (लोहगड)',
    fort: 'Lohagad (लोहगड)',
    address: 'म्हाडा, प्लॉट नं. E-२, संत तुकाराम नगर, पोलिस स्टेशन समोर, पिंपरी, पुणे ४११०१८',
    wardNumbers: 'Wards 06, 07, 08, 20',
    coverage: 'Bhosari Gaothan, Landewadi, Chakrapani, Indrayaninagar, MIDC Bhosari, Sant Tukaram Nagar, Vallabhnagar, HA Colony, CIRT (Wards 06, 07, 08, 20)',
    officer: 'Assistant Commissioner, Zone L',
    email: 'lzone@pcmcindia.gov.in',
    phone: '8888006666',
    phoneFormatted: 'PCMC Sarathi: 8888006666'
  }
];

export const DEPARTMENT_EMAILS: Record<string, string> = {
  Garbage: 'health@pcmcindia.gov.in',
  Pothole: 'engineering@pcmcindia.gov.in',
  Drainage: 'drainage@pcmcindia.gov.in',
  Streetlight: 'electrical@pcmcindia.gov.in',
  Encroachment: 'encroachment@pcmcindia.gov.in',
  Other: 'egov@pcmcindia.gov.in'
};

export const PCMC_SARATHI = {
  helpline: '8888006666',
  email: 'sarathi@pcmcindia.gov.in',
  hours: '24×7 Citizen Helpline',
  webGrievance: 'https://grievance.pcmcindia.gov.in:8443/Grievance/citizen/',
  aapleSarkar: 'https://grievances.maharashtra.gov.in',
  propertyTax: 'https://publicptaxpcmc.in',
  waterBill: 'https://water.pcmcindia.gov.in'
};

/**
 * Maps an area name or coordinates to the nearest PCMC Zonal Office.
 * Kiwale & Ravet fall under Zone A (along with Nigdi, Akurdi, Pradhikaran).
 * Zone B covers Chinchwadgaon, Thergaon, Kalewadi, and Rahatani.
 */
export function getZoneForArea(areaName: string, lat?: number, lon?: number): ZonalOffice {
  let cleaned = (areaName || '').toLowerCase()
    .replace(/pimpri[- ]chinchwad/g, '')
    .replace(/\bpcmc\b/g, '')
    .trim();

  // If input was only generic city name or empty, and coordinates are given, estimate locality
  if (!cleaned && lat != null && lon != null) {
    cleaned = estimatePCMCArea(lat, lon).toLowerCase();
  }

  // Zone A: Kiwale, Ravet, Mukai Chowk, Nigdi, Akurdi, Pradhikaran, Chinchwad Station
  if (
    cleaned.includes('kiwale') ||
    cleaned.includes('ravet') ||
    cleaned.includes('mukai') ||
    cleaned.includes('nigdi') ||
    cleaned.includes('akurdi') ||
    cleaned.includes('pradhikaran') ||
    cleaned.includes('chinchwad station')
  ) {
    return ZONAL_OFFICES[0];
  }

  // Zone B: Chinchwadgaon, Thergaon, Kalewadi, Rahatani
  if (
    cleaned.includes('thergaon') ||
    cleaned.includes('kalewadi') ||
    cleaned.includes('rahatani') ||
    cleaned.includes('chinchwadgaon') ||
    cleaned.includes('chinchwad gaon') ||
    /\bchinchwad\b/.test(cleaned)
  ) {
    return ZONAL_OFFICES[1];
  }

  if (cleaned.includes('bhosari') || cleaned.includes('moshi') || cleaned.includes('charholi') || cleaned.includes('indrayani')) return ZONAL_OFFICES[2]; // Zone C
  if (cleaned.includes('wakad') || cleaned.includes('tathawade') || cleaned.includes('saudagar') || cleaned.includes('punawale')) return ZONAL_OFFICES[3]; // Zone D
  if (cleaned.includes('dighi') || cleaned.includes('bopkhel')) return ZONAL_OFFICES[4]; // Zone E
  if (cleaned.includes('chikhali') || cleaned.includes('talawade') || cleaned.includes('rupeenagar')) return ZONAL_OFFICES[5]; // Zone F
  if (cleaned.includes('vallabh') || cleaned.includes('nehru') || cleaned.includes('morwadi') || /\bpimpri\b/.test(cleaned)) return ZONAL_OFFICES[6]; // Zone G
  if (cleaned.includes('sangvi') || cleaned.includes('dapodi') || cleaned.includes('gurav') || cleaned.includes('kasarwadi')) return ZONAL_OFFICES[7]; // Zone H

  // Fallback: if coordinates exist, resolve ward's zone
  if (lat != null && lon != null) {
    const ward = getWardForArea(areaName, lat, lon);
    const matched = ZONAL_OFFICES.find(z => 
      z.zone.toLowerCase() === ward.zone.toLowerCase() || 
      z.marathiZone.toLowerCase().includes(ward.zone.toLowerCase())
    );
    if (matched) return matched;
  }

  return ZONAL_OFFICES[0]; // default Zone A
}

export interface WardInfo {
  wardNo: string;
  badge: string;
  locality: string;
  wardLabel: string;
  marathiWardLabel: string;
  zone: string;
  marathiZone: string;
}

/**
 * Maps an area name or coordinates to its official PCMC Municipal Ward / Prabhag Number.
 */
export function getWardForArea(areaName: string, lat?: number, lon?: number): WardInfo {
  let cleaned = (areaName || '').toLowerCase()
    .replace(/pimpri[- ]chinchwad/g, '')
    .replace(/\bpcmc\b/g, '')
    .trim();

  // If input was only generic city name or empty, and coordinates are given, estimate locality
  if (!cleaned && lat != null && lon != null) {
    cleaned = estimatePCMCArea(lat, lon).toLowerCase();
  }

  if (cleaned.includes('kiwale') || cleaned.includes('ravet') || cleaned.includes('mukai')) {
    return { wardNo: '16', badge: 'W-16', locality: 'Kiwale / Ravet', wardLabel: 'Ward 16 (Kiwale / Ravet)', marathiWardLabel: 'प्रभाग १६ (किवळे / रावेत)', zone: 'Zone A', marathiZone: 'क्षेत्रीय अ' };
  }
  if (cleaned.includes('nigdi') || cleaned.includes('pradhikaran')) {
    return { wardNo: '14', badge: 'W-14', locality: 'Nigdi / Pradhikaran', wardLabel: 'Ward 14 (Nigdi / Pradhikaran)', marathiWardLabel: 'प्रभाग १४ (निगडी / प्राधिकरण)', zone: 'Zone A', marathiZone: 'क्षेत्रीय अ' };
  }
  if (cleaned.includes('akurdi')) {
    return { wardNo: '15', badge: 'W-15', locality: 'Akurdi', wardLabel: 'Ward 15 (Akurdi)', marathiWardLabel: 'प्रभाग १५ (आकुर्डी)', zone: 'Zone A', marathiZone: 'क्षेत्रीय अ' };
  }
  if (cleaned.includes('chinchwad station')) {
    return { wardNo: '19', badge: 'W-19', locality: 'Chinchwad Station', wardLabel: 'Ward 19 (Chinchwad Station)', marathiWardLabel: 'प्रभाग १९ (चिंचवड स्टेशन)', zone: 'Zone A', marathiZone: 'क्षेत्रीय अ' };
  }
  if (cleaned.includes('thergaon')) {
    return { wardNo: '23', badge: 'W-23', locality: 'Thergaon', wardLabel: 'Ward 23 (Thergaon / Dange Chowk)', marathiWardLabel: 'प्रभाग २३ (थेरगाव / डांगे चौक)', zone: 'Zone B', marathiZone: 'क्षेत्रीय ब' };
  }
  if (cleaned.includes('kalewadi')) {
    return { wardNo: '22', badge: 'W-22', locality: 'Kalewadi', wardLabel: 'Ward 22 (Kalewadi)', marathiWardLabel: 'प्रभाग २२ (काळेवाडी)', zone: 'Zone B', marathiZone: 'क्षेत्रीय ब' };
  }
  if (cleaned.includes('rahatani')) {
    return { wardNo: '28', badge: 'W-28', locality: 'Rahatani', wardLabel: 'Ward 28 (Rahatani)', marathiWardLabel: 'प्रभाग २८ (रहाटणी)', zone: 'Zone B', marathiZone: 'क्षेत्रीय ब' };
  }
  if (cleaned.includes('chinchwadgaon') || cleaned.includes('chinchwad gaon') || /\bchinchwad\b/.test(cleaned)) {
    return { wardNo: '17', badge: 'W-17', locality: 'Chinchwadgaon', wardLabel: 'Ward 17 (Chinchwadgaon)', marathiWardLabel: 'प्रभाग १७ (चिंचवडगाव)', zone: 'Zone B', marathiZone: 'क्षेत्रीय ब' };
  }
  if (cleaned.includes('wakad') || cleaned.includes('tathawade') || cleaned.includes('punawale')) {
    return { wardNo: '25', badge: 'W-25', locality: 'Wakad / Tathawade', wardLabel: 'Ward 25 (Wakad / Tathawade)', marathiWardLabel: 'प्रभाग २५ (वाकड / ताथवडे)', zone: 'Zone D', marathiZone: 'क्षेत्रीय ड' };
  }
  if (cleaned.includes('saudagar')) {
    return { wardNo: '28', badge: 'W-28', locality: 'Pimple Saudagar', wardLabel: 'Ward 28 (Pimple Saudagar)', marathiWardLabel: 'प्रभाग २८ (पिंपळे सौदागर)', zone: 'Zone D', marathiZone: 'क्षेत्रीय ड' };
  }
  if (cleaned.includes('bhosari') || cleaned.includes('indrayani')) {
    return { wardNo: '05', badge: 'W-05', locality: 'Bhosari', wardLabel: 'Ward 05 (Bhosari / Indrayani Nagar)', marathiWardLabel: 'प्रभाग ०५ (भोसरी)', zone: 'Zone C', marathiZone: 'क्षेत्रीय क' };
  }
  if (cleaned.includes('moshi')) {
    return { wardNo: '02', badge: 'W-02', locality: 'Moshi', wardLabel: 'Ward 02 (Moshi)', marathiWardLabel: 'प्रभाग ०२ (मोशी)', zone: 'Zone C', marathiZone: 'क्षेत्रीय क' };
  }
  if (cleaned.includes('charholi')) {
    return { wardNo: '08', badge: 'W-08', locality: 'Charholi', wardLabel: 'Ward 08 (Charholi / Wadmukhwadi)', marathiWardLabel: 'प्रभाग ०८ (चरहोली)', zone: 'Zone C', marathiZone: 'क्षेत्रीय क' };
  }
  if (cleaned.includes('dighi')) {
    return { wardNo: '03', badge: 'W-03', locality: 'Dighi', wardLabel: 'Ward 03 (Dighi)', marathiWardLabel: 'प्रभाग ०३ (दिघी)', zone: 'Zone E', marathiZone: 'क्षेत्रीय इ' };
  }
  if (cleaned.includes('bopkhel')) {
    return { wardNo: '04', badge: 'W-04', locality: 'Bopkhel', wardLabel: 'Ward 04 (Bopkhel)', marathiWardLabel: 'प्रभाग ०४ (बोपखेल)', zone: 'Zone E', marathiZone: 'क्षेत्रीय इ' };
  }
  if (cleaned.includes('chikhali')) {
    return { wardNo: '01', badge: 'W-01', locality: 'Chikhali', wardLabel: 'Ward 01 (Chikhali / Kudalwadi)', marathiWardLabel: 'प्रभाग ०१ (चिखली)', zone: 'Zone F', marathiZone: 'क्षेत्रीय फ' };
  }
  if (cleaned.includes('talawade')) {
    return { wardNo: '12', badge: 'W-12', locality: 'Talawade', wardLabel: 'Ward 12 (Talawade IT Park)', marathiWardLabel: 'प्रभाग १२ (तळवडे)', zone: 'Zone F', marathiZone: 'क्षेत्रीय फ' };
  }
  if (cleaned.includes('rupeenagar')) {
    return { wardNo: '13', badge: 'W-13', locality: 'Rupeenagar', wardLabel: 'Ward 13 (Rupeenagar)', marathiWardLabel: 'प्रभाग १३ (रुपीनगर)', zone: 'Zone F', marathiZone: 'क्षेत्रीय फ' };
  }
  if (cleaned.includes('pimpri camp') || cleaned.includes('pimpri market') || /\bpimpri\b/.test(cleaned)) {
    return { wardNo: '21', badge: 'W-21', locality: 'Pimpri Market', wardLabel: 'Ward 21 (Pimpri Market)', marathiWardLabel: 'प्रभाग २१ (पिंपरी)', zone: 'Zone G', marathiZone: 'क्षेत्रीय ग' };
  }
  if (cleaned.includes('vallabh') || cleaned.includes('nehru')) {
    return { wardNo: '20', badge: 'W-20', locality: 'Vallabhnagar', wardLabel: 'Ward 20 (Vallabhnagar / Nehrunagar)', marathiWardLabel: 'प्रभाग २० (वल्लभनगर)', zone: 'Zone G', marathiZone: 'क्षेत्रीय ग' };
  }
  if (cleaned.includes('sangvi')) {
    return { wardNo: '30', badge: 'W-30', locality: 'Sangvi', wardLabel: 'Ward 30 (Sangvi)', marathiWardLabel: 'प्रभाग ३० (सांगवी)', zone: 'Zone H', marathiZone: 'क्षेत्रीय ह' };
  }
  if (cleaned.includes('gurav')) {
    return { wardNo: '27', badge: 'W-27', locality: 'Pimple Gurav', wardLabel: 'Ward 27 (Pimple Gurav)', marathiWardLabel: 'प्रभाग २७ (पिंपळे गुरव)', zone: 'Zone H', marathiZone: 'क्षेत्रीय ह' };
  }
  if (cleaned.includes('dapodi')) {
    return { wardNo: '31', badge: 'W-31', locality: 'Dapodi', wardLabel: 'Ward 31 (Dapodi)', marathiWardLabel: 'प्रभाग ३१ (दापोडी)', zone: 'Zone H', marathiZone: 'क्षेत्रीय ह' };
  }
  if (cleaned.includes('kasarwadi')) {
    return { wardNo: '24', badge: 'W-24', locality: 'Kasarwadi', wardLabel: 'Ward 24 (Kasarwadi / Nashik Phata)', marathiWardLabel: 'प्रभाग २४ (कासारवाडी)', zone: 'Zone H', marathiZone: 'क्षेत्रीय ह' };
  }

  // If still unmatched and coordinates exist, fallback to estimating from coordinates
  if (lat != null && lon != null) {
    const estimated = estimatePCMCArea(lat, lon);
    if (estimated && estimated !== areaName) {
      return getWardForArea(estimated);
    }
  }

  return { wardNo: '16', badge: 'W-16', locality: 'Kiwale / Ravet', wardLabel: 'Ward 16 (Kiwale / Ravet)', marathiWardLabel: 'प्रभाग १६ (किवळे / रावेत)', zone: 'Zone A', marathiZone: 'क्षेत्रीय अ' };
}
