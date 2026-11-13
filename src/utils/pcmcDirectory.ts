export interface ZonalOffice {
  zone: string;
  marathiZone: string;
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
    marathiZone: 'क्षेत्रीय कार्यालय अ',
    wardNumbers: 'Wards 10, 14, 15, 16, 19',
    coverage: 'Nigdi, Pradhikaran, Akurdi, Kiwale, Ravet, Chinchwad Station (Wards 10, 14, 15, 16, 19)',
    officer: 'Assistant Commissioner, Zone A',
    email: 'zonea@pcmcindia.gov.in',
    phone: '02027653168',
    phoneFormatted: '020-27653168'
  },
  {
    zone: 'Zone B',
    marathiZone: 'क्षेत्रीय कार्यालय ब',
    wardNumbers: 'Wards 17, 18, 22, 23, 28',
    coverage: 'Chinchwadgaon, Thergaon, Kalewadi, Rahatani (Wards 17, 18, 22, 23, 28)',
    officer: 'Assistant Commissioner, Zone B',
    email: 'zoneb@pcmcindia.gov.in',
    phone: '02027352244',
    phoneFormatted: '020-27352244'
  },
  {
    zone: 'Zone C',
    marathiZone: 'क्षेत्रीय कार्यालय क',
    wardNumbers: 'Wards 02, 05, 06, 08',
    coverage: 'Bhosari, Indrayani Nagar, Moshi, Charholi (Wards 02, 05, 06, 08)',
    officer: 'Assistant Commissioner, Zone C',
    email: 'cward@pcmcindia.gov.in',
    phone: '02027121155',
    phoneFormatted: '020-27121155'
  },
  {
    zone: 'Zone D',
    marathiZone: 'क्षेत्रीय कार्यालय ड',
    wardNumbers: 'Wards 25, 26, 28, 29',
    coverage: 'Wakad, Tathawade, Punawale, Pimple Saudagar (Wards 25, 26, 28, 29)',
    officer: 'Assistant Commissioner, Zone D',
    email: 'a.yele@pcmcindia.gov.in',
    phone: '02027276500',
    phoneFormatted: '020-27276500'
  },
  {
    zone: 'Zone E',
    marathiZone: 'क्षेत्रीय कार्यालय इ',
    wardNumbers: 'Wards 03, 04, 07',
    coverage: 'Dighi, Bopkhel, Bhosari East (Wards 03, 04, 07)',
    officer: 'Assistant Commissioner, Zone E',
    email: 'ah.gaikwad@pcmcindia.gov.in',
    phone: '02027150444',
    phoneFormatted: '020-27150444'
  },
  {
    zone: 'Zone F',
    marathiZone: 'क्षेत्रीय कार्यालय फ',
    wardNumbers: 'Wards 01, 11, 12, 13',
    coverage: 'Chikhali, Talawade, Rupeenagar, Nigdi East (Wards 01, 11, 12, 13)',
    officer: 'Assistant Commissioner, Zone F',
    email: 'zonef@pcmcindia.gov.in',
    phone: '02027662100',
    phoneFormatted: '020-27662100'
  },
  {
    zone: 'Zone G',
    marathiZone: 'क्षेत्रीय कार्यालय ग',
    wardNumbers: 'Wards 09, 20, 21',
    coverage: 'Pimpri Camp, Nehrunagar, Vallabhnagar, Morwadi (Wards 09, 20, 21)',
    officer: 'Assistant Commissioner, Zone G',
    email: 'zoneg@pcmcindia.gov.in',
    phone: '02027423300',
    phoneFormatted: '020-27423300'
  },
  {
    zone: 'Zone H',
    marathiZone: 'क्षेत्रीय कार्यालय ह',
    wardNumbers: 'Wards 24, 27, 30, 31, 32',
    coverage: 'Sangvi, Dapodi, Kasarwadi, Pimple Gurav (Wards 24, 27, 30, 31, 32)',
    officer: 'Assistant Commissioner, Zone H',
    email: 'zoneh@pcmcindia.gov.in',
    phone: '02027145522',
    phoneFormatted: '020-27145522'
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
export function getZoneForArea(areaName: string): ZonalOffice {
  const lower = (areaName || '').toLowerCase();
  // Zone A: Kiwale, Ravet, Nigdi, Akurdi, Pradhikaran, Chinchwad Station
  if (lower.includes('kiwale') || lower.includes('ravet') || lower.includes('nigdi') || lower.includes('akurdi') || lower.includes('pradhikaran')) return ZONAL_OFFICES[0];
  // Zone B: Chinchwadgaon, Thergaon, Kalewadi, Rahatani
  if (lower.includes('thergaon') || lower.includes('kalewadi') || lower.includes('rahatani') || lower.includes('chinchwad')) return ZONAL_OFFICES[1];
  if (lower.includes('bhosari') || lower.includes('moshi') || lower.includes('charholi') || lower.includes('indrayani')) return ZONAL_OFFICES[2]; // Zone C
  if (lower.includes('wakad') || lower.includes('tathawade') || lower.includes('saudagar') || lower.includes('punawale')) return ZONAL_OFFICES[3]; // Zone D
  if (lower.includes('dighi') || lower.includes('bopkhel')) return ZONAL_OFFICES[4]; // Zone E
  if (lower.includes('chikhali') || lower.includes('talawade') || lower.includes('rupeenagar')) return ZONAL_OFFICES[5]; // Zone F
  if (lower.includes('pimpri') || lower.includes('vallabh') || lower.includes('nehru') || lower.includes('morwadi')) return ZONAL_OFFICES[6]; // Zone G
  if (lower.includes('sangvi') || lower.includes('dapodi') || lower.includes('gurav') || lower.includes('kasarwadi')) return ZONAL_OFFICES[7]; // Zone H
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
 * Maps an area name to its official PCMC Municipal Ward / Prabhag Number.
 */
export function getWardForArea(areaName: string): WardInfo {
  const lower = (areaName || '').toLowerCase();
  if (lower.includes('kiwale') || lower.includes('ravet')) {
    return { wardNo: '16', badge: 'W-16', locality: 'Kiwale / Ravet', wardLabel: 'Ward 16 (Kiwale / Ravet)', marathiWardLabel: 'प्रभाग १६ (किवळे / रावेत)', zone: 'Zone A', marathiZone: 'क्षेत्रीय अ' };
  }
  if (lower.includes('nigdi') || lower.includes('pradhikaran')) {
    return { wardNo: '14', badge: 'W-14', locality: 'Nigdi / Pradhikaran', wardLabel: 'Ward 14 (Nigdi / Pradhikaran)', marathiWardLabel: 'प्रभाग १४ (निगडी / प्राधिकरण)', zone: 'Zone A', marathiZone: 'क्षेत्रीय अ' };
  }
  if (lower.includes('akurdi')) {
    return { wardNo: '15', badge: 'W-15', locality: 'Akurdi', wardLabel: 'Ward 15 (Akurdi)', marathiWardLabel: 'प्रभाग १५ (आकुर्डी)', zone: 'Zone A', marathiZone: 'क्षेत्रीय अ' };
  }
  if (lower.includes('chinchwad station')) {
    return { wardNo: '19', badge: 'W-19', locality: 'Chinchwad Station', wardLabel: 'Ward 19 (Chinchwad Station)', marathiWardLabel: 'प्रभाग १९ (चिंचवड स्टेशन)', zone: 'Zone A', marathiZone: 'क्षेत्रीय अ' };
  }
  if (lower.includes('thergaon')) {
    return { wardNo: '23', badge: 'W-23', locality: 'Thergaon', wardLabel: 'Ward 23 (Thergaon / Dange Chowk)', marathiWardLabel: 'प्रभाग २३ (थेरगाव / डांगे चौक)', zone: 'Zone B', marathiZone: 'क्षेत्रीय ब' };
  }
  if (lower.includes('kalewadi')) {
    return { wardNo: '22', badge: 'W-22', locality: 'Kalewadi', wardLabel: 'Ward 22 (Kalewadi)', marathiWardLabel: 'प्रभाग २२ (काळेवाडी)', zone: 'Zone B', marathiZone: 'क्षेत्रीय ब' };
  }
  if (lower.includes('rahatani')) {
    return { wardNo: '28', badge: 'W-28', locality: 'Rahatani', wardLabel: 'Ward 28 (Rahatani)', marathiWardLabel: 'प्रभाग २८ (रहाटणी)', zone: 'Zone B', marathiZone: 'क्षेत्रीय ब' };
  }
  if (lower.includes('chinchwad')) {
    return { wardNo: '17', badge: 'W-17', locality: 'Chinchwadgaon', wardLabel: 'Ward 17 (Chinchwadgaon)', marathiWardLabel: 'प्रभाग १७ (चिंचवडगाव)', zone: 'Zone B', marathiZone: 'क्षेत्रीय ब' };
  }
  if (lower.includes('wakad') || lower.includes('tathawade') || lower.includes('punawale')) {
    return { wardNo: '25', badge: 'W-25', locality: 'Wakad / Tathawade', wardLabel: 'Ward 25 (Wakad / Tathawade)', marathiWardLabel: 'प्रभाग २५ (वाकड / ताथवडे)', zone: 'Zone D', marathiZone: 'क्षेत्रीय ड' };
  }
  if (lower.includes('saudagar')) {
    return { wardNo: '28', badge: 'W-28', locality: 'Pimple Saudagar', wardLabel: 'Ward 28 (Pimple Saudagar)', marathiWardLabel: 'प्रभाग २८ (पिंपळे सौदागर)', zone: 'Zone D', marathiZone: 'क्षेत्रीय ड' };
  }
  if (lower.includes('bhosari') || lower.includes('indrayani')) {
    return { wardNo: '05', badge: 'W-05', locality: 'Bhosari', wardLabel: 'Ward 05 (Bhosari / Indrayani Nagar)', marathiWardLabel: 'प्रभाग ०५ (भोसरी)', zone: 'Zone C', marathiZone: 'क्षेत्रीय क' };
  }
  if (lower.includes('moshi')) {
    return { wardNo: '02', badge: 'W-02', locality: 'Moshi', wardLabel: 'Ward 02 (Moshi)', marathiWardLabel: 'प्रभाग ०२ (मोशी)', zone: 'Zone C', marathiZone: 'क्षेत्रीय क' };
  }
  if (lower.includes('charholi')) {
    return { wardNo: '08', badge: 'W-08', locality: 'Charholi', wardLabel: 'Ward 08 (Charholi / Wadmukhwadi)', marathiWardLabel: 'प्रभाग ०८ (चरहोली)', zone: 'Zone C', marathiZone: 'क्षेत्रीय क' };
  }
  if (lower.includes('dighi')) {
    return { wardNo: '03', badge: 'W-03', locality: 'Dighi', wardLabel: 'Ward 03 (Dighi)', marathiWardLabel: 'प्रभाग ०३ (दिघी)', zone: 'Zone E', marathiZone: 'क्षेत्रीय इ' };
  }
  if (lower.includes('bopkhel')) {
    return { wardNo: '04', badge: 'W-04', locality: 'Bopkhel', wardLabel: 'Ward 04 (Bopkhel)', marathiWardLabel: 'प्रभाग ०४ (बोपखेल)', zone: 'Zone E', marathiZone: 'क्षेत्रीय इ' };
  }
  if (lower.includes('chikhali')) {
    return { wardNo: '01', badge: 'W-01', locality: 'Chikhali', wardLabel: 'Ward 01 (Chikhali / Kudalwadi)', marathiWardLabel: 'प्रभाग ०१ (चिखली)', zone: 'Zone F', marathiZone: 'क्षेत्रीय फ' };
  }
  if (lower.includes('talawade')) {
    return { wardNo: '12', badge: 'W-12', locality: 'Talawade', wardLabel: 'Ward 12 (Talawade IT Park)', marathiWardLabel: 'प्रभाग १२ (तळवडे)', zone: 'Zone F', marathiZone: 'क्षेत्रीय फ' };
  }
  if (lower.includes('rupeenagar')) {
    return { wardNo: '13', badge: 'W-13', locality: 'Rupeenagar', wardLabel: 'Ward 13 (Rupeenagar)', marathiWardLabel: 'प्रभाग १३ (रुपीनगर)', zone: 'Zone F', marathiZone: 'क्षेत्रीय फ' };
  }
  if (lower.includes('pimpri')) {
    return { wardNo: '21', badge: 'W-21', locality: 'Pimpri Market', wardLabel: 'Ward 21 (Pimpri Market)', marathiWardLabel: 'प्रभाग २१ (पिंपरी)', zone: 'Zone G', marathiZone: 'क्षेत्रीय ग' };
  }
  if (lower.includes('vallabh') || lower.includes('nehru')) {
    return { wardNo: '20', badge: 'W-20', locality: 'Vallabhnagar', wardLabel: 'Ward 20 (Vallabhnagar / Nehrunagar)', marathiWardLabel: 'प्रभाग २० (वल्लभनगर)', zone: 'Zone G', marathiZone: 'क्षेत्रीय ग' };
  }
  if (lower.includes('sangvi')) {
    return { wardNo: '30', badge: 'W-30', locality: 'Sangvi', wardLabel: 'Ward 30 (Sangvi)', marathiWardLabel: 'प्रभाग ३० (सांगवी)', zone: 'Zone H', marathiZone: 'क्षेत्रीय ह' };
  }
  if (lower.includes('gurav')) {
    return { wardNo: '27', badge: 'W-27', locality: 'Pimple Gurav', wardLabel: 'Ward 27 (Pimple Gurav)', marathiWardLabel: 'प्रभाग २७ (पिंपळे गुरव)', zone: 'Zone H', marathiZone: 'क्षेत्रीय ह' };
  }
  if (lower.includes('dapodi')) {
    return { wardNo: '31', badge: 'W-31', locality: 'Dapodi', wardLabel: 'Ward 31 (Dapodi)', marathiWardLabel: 'प्रभाग ३१ (दापोडी)', zone: 'Zone H', marathiZone: 'क्षेत्रीय ह' };
  }
  if (lower.includes('kasarwadi')) {
    return { wardNo: '24', badge: 'W-24', locality: 'Kasarwadi', wardLabel: 'Ward 24 (Kasarwadi / Nashik Phata)', marathiWardLabel: 'प्रभाग २४ (कासारवाडी)', zone: 'Zone H', marathiZone: 'क्षेत्रीय ह' };
  }
  return { wardNo: '16', badge: 'W-16', locality: 'Kiwale / Ravet', wardLabel: 'Ward 16 (Kiwale / Ravet)', marathiWardLabel: 'प्रभाग १६ (किवळे / रावेत)', zone: 'Zone A', marathiZone: 'क्षेत्रीय अ' };
}
