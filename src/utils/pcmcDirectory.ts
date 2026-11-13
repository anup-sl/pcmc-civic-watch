export interface ZonalOffice {
  zone: string;
  marathiZone: string;
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
    coverage: 'Nigdi, Pradhikaran, Akurdi, Chinchwad Station (Prabhags 10, 14, 15, 19)',
    officer: 'Assistant Commissioner, Zone A',
    email: 'zonea@pcmcindia.gov.in',
    phone: '02027653168',
    phoneFormatted: '020-27653168'
  },
  {
    zone: 'Zone B',
    marathiZone: 'क्षेत्रीय कार्यालय ब',
    coverage: 'Kiwale, Ravet, Chinchwadgaon, Kalewadi (Prabhags 16, 17, 18, 22)',
    officer: 'Assistant Commissioner, Zone B',
    email: 'zoneb@pcmcindia.gov.in',
    phone: '02027352244',
    phoneFormatted: '020-27352244'
  },
  {
    zone: 'Zone C',
    marathiZone: 'क्षेत्रीय कार्यालय क',
    coverage: 'Bhosari, Indrayani Nagar, Moshi, Charholi (Prabhags 02, 05, 06, 08)',
    officer: 'Assistant Commissioner, Zone C',
    email: 'cward@pcmcindia.gov.in',
    phone: '02027121155',
    phoneFormatted: '020-27121155'
  },
  {
    zone: 'Zone D',
    marathiZone: 'क्षेत्रीय कार्यालय ड',
    coverage: 'Wakad, Tathawade, Pimple Saudagar, Rahatani (Prabhags 25, 26, 28, 29)',
    officer: 'Assistant Commissioner, Zone D',
    email: 'a.yele@pcmcindia.gov.in',
    phone: '02027276500',
    phoneFormatted: '020-27276500'
  },
  {
    zone: 'Zone E',
    marathiZone: 'क्षेत्रीय कार्यालय इ',
    coverage: 'Dighi, Bopkhel, Bhosari East (Prabhags 03, 04, 07)',
    officer: 'Assistant Commissioner, Zone E',
    email: 'ah.gaikwad@pcmcindia.gov.in',
    phone: '02027150444',
    phoneFormatted: '020-27150444'
  },
  {
    zone: 'Zone F',
    marathiZone: 'क्षेत्रीय कार्यालय फ',
    coverage: 'Chikhali, Talawade, Rupeenagar, Nigdi East (Prabhags 01, 11, 12, 13)',
    officer: 'Assistant Commissioner, Zone F',
    email: 'zonef@pcmcindia.gov.in',
    phone: '02027662100',
    phoneFormatted: '020-27662100'
  },
  {
    zone: 'Zone G',
    marathiZone: 'क्षेत्रीय कार्यालय ग',
    coverage: 'Pimpri Camp, Nehrunagar, Vallabhnagar, Thergaon (Prabhags 09, 20, 21, 23)',
    officer: 'Assistant Commissioner, Zone G',
    email: 'zoneg@pcmcindia.gov.in',
    phone: '02027423300',
    phoneFormatted: '020-27423300'
  },
  {
    zone: 'Zone H',
    marathiZone: 'क्षेत्रीय कार्यालय ह',
    coverage: 'Sangvi, Dapodi, Kasarwadi, Pimple Gurav (Prabhags 24, 27, 30, 31, 32)',
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
 */
export function getZoneForArea(areaName: string): ZonalOffice {
  const lower = areaName.toLowerCase();
  if (lower.includes('nigdi') || lower.includes('akurdi') || lower.includes('pradhikaran')) return ZONAL_OFFICES[0]; // Zone A
  if (lower.includes('kiwale') || lower.includes('ravet') || lower.includes('chinchwad') || lower.includes('kalewadi')) return ZONAL_OFFICES[1]; // Zone B
  if (lower.includes('bhosari') || lower.includes('moshi') || lower.includes('charholi')) return ZONAL_OFFICES[2]; // Zone C
  if (lower.includes('wakad') || lower.includes('tathawade') || lower.includes('saudagar') || lower.includes('rahatani')) return ZONAL_OFFICES[3]; // Zone D
  if (lower.includes('dighi') || lower.includes('bopkhel')) return ZONAL_OFFICES[4]; // Zone E
  if (lower.includes('chikhali') || lower.includes('talawade') || lower.includes('rupeenagar')) return ZONAL_OFFICES[5]; // Zone F
  if (lower.includes('pimpri') || lower.includes('thergaon') || lower.includes('vallabh')) return ZONAL_OFFICES[6]; // Zone G
  if (lower.includes('sangvi') || lower.includes('dapodi') || lower.includes('gurav')) return ZONAL_OFFICES[7]; // Zone H
  return ZONAL_OFFICES[1]; // default Zone B
}
