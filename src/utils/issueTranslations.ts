import type { Category } from '../types';
import type { Language } from './i18n';

export interface SubTagTranslation {
  en: string;
  mr: string;
}

export const SUB_TAG_TRANSLATIONS: Record<Category, SubTagTranslation[]> = {
  Pothole: [
    { en: 'Deep Crater on Carriageway', mr: 'रस्त्यावरील खोल खड्डा' },
    { en: 'Sunken Manhole / Trench Dip', mr: 'खचलेले मॅनहोल / चेंबर खड्डा' },
    { en: 'Loose Gravel / Asphalt Washed Out', mr: 'उखडलेला डांबर / पसरलेली खडी' },
    { en: 'Multiple Consecutive Potholes', mr: 'सलग अनेक खड्डे' },
    { en: 'Broken Paver Blocks', mr: 'तुटलेले पेव्हर ब्लॉक्स' },
    { en: 'Road Surface Subsidence', mr: 'रस्ता खचणे / भेगा पडणे' }
  ],
  Garbage: [
    { en: 'Overflowing Bin', mr: 'ओव्हरफ्लो कचरा कुंडी' },
    { en: 'Illegal Roadside Dumping', mr: 'रस्त्याच्या कडेला अनधिकृत कचरा ढीग' },
    { en: 'Construction Debris', mr: 'बांधकामाचा राडारोडा (डेब्रिज)' },
    { en: 'Open Waste Burning', mr: 'कचरा उघड्यावर जाळणे (धूर)' },
    { en: 'Dead Animal / Carcass', mr: 'मृत प्राणी विल्हेवाट' },
    { en: 'Uncleaned Public Urinal', mr: 'अस्वच्छ सार्वजनिक शौचालय' },
    { en: 'Garden / Tree Waste', mr: 'पालापाचोळा / छाटलेल्या फांद्या' }
  ],
  Drainage: [
    { en: 'Clogged Stormwater Drain', mr: 'पावसाळी गटार तुंबणे' },
    { en: 'Sewage Chamber Overflow', mr: 'सांडपाणी चेंबर ओव्हरफ्लो' },
    { en: 'Missing / Broken Manhole Lid', mr: 'मॅनहोलचे तुटलेले / गायब झाकण' },
    { en: 'Stagnant Water / Mosquitoes', mr: 'साचलेले दुर्गंधीयुक्त पाणी / डास' },
    { en: 'Drinking Water Pipeline Leak', mr: 'पिण्याच्या पाण्याची पाईपलाईन गळती' },
    { en: 'Open Drainage Pit Hazard', mr: 'उघडा ड्रेनेज खड्डा धोका' }
  ],
  Streetlight: [
    { en: 'Completely Dark Stretch', mr: 'संपूर्ण रस्त्यावर अंधार' },
    { en: 'Single Lamp Not Working', mr: 'बंद पथदिवा' },
    { en: 'Flickering / Dim Streetlight', mr: 'लुकलुगणारा / मंद पथदिवा' },
    { en: 'Exposed / Hanging Live Wires', mr: 'उघड्या / लटकणाऱ्या विजेच्या तारा' },
    { en: 'Damaged / Tilted Electric Pole', mr: 'वाकलेला / धोकादायक विजेचा खांब' },
    { en: 'High Mast Light Failure', mr: 'हायमास्ट दिवा बंद' },
    { en: 'Daytime Burning Light', mr: 'दिवसा चालू असणारा पथदिवा' }
  ],
  Encroachment: [
    { en: 'Footpath Blocked by Illegal Stalls', mr: 'पदपथावरील अनधिकृत हातगाड्या / स्टॉल्स' },
    { en: 'Unauthorized Shed on Public Walkway', mr: 'पादचारी मार्गावरील अनधिकृत पत्र्याचे शेड' },
    { en: 'Banners & Boards Blocking Visibility', mr: 'वाहतुकीस अडथळा आणणारे बॅनर्स / फलक' },
    { en: 'Vehicles & Debris Blocking Access', mr: 'पादचाऱ्यांचा रस्ता अडवणारी वाहने व साहित्य' }
  ],
  Other: [
    { en: 'PCMC Sarathi Grievance Portal Issue', mr: 'सारथी पोर्टलवर तक्रार नोंदणी अडचण' },
    { en: 'Property Tax / Water Bill Receipt Issue', mr: 'कर / पाणीपट्टी पावती न मिळणे' },
    { en: 'Broken Public Park Equipment', mr: 'सार्वजनिक उद्यानातील तुटलेली खेळणी' },
    { en: 'Noise Pollution in Residential Area', mr: 'रहिवासी भागातील तीव्र ध्वनी प्रदूषण' }
  ]
};

export const QUICK_PHRASES_BY_CATEGORY: Record<Category, { en: string[]; mr: string[] }> = {
  Pothole: {
    en: [
      'Deep pothole crater causing two-wheeler hazard',
      'Sunken drainage chamber on carriageway',
      'Asphalt washed out across left lane'
    ],
    mr: [
      'दुचाकीस्वारांसाठी अत्यंत धोकादायक खोल खड्डा',
      'रस्त्यावरील चेंबर खचल्यामुळे मोठा अपघाताचा धोका',
      'डांबरीकरण उखडून खडी पसरली आहे'
    ]
  },
  Garbage: {
    en: [
      'Uncollected garbage pile & foul smell',
      'Illegal construction debris dumped on road',
      'Waste burning causing toxic morning smoke'
    ],
    mr: [
      'कचरा न उचलल्यामुळे असह्य दुर्गंधी व आरोग्याचा प्रश्न',
      'रस्त्यावर टाकलेला अनधिकृत बांधकामाचा राडारोडा',
      'उघड्यावर कचरा जाळल्याने होणारा विषारी धूर'
    ]
  },
  Drainage: {
    en: [
      'Choked stormwater drain overflowing on road',
      'Missing manhole cover open hazard',
      'Stagnant sewage pooling along footpath'
    ],
    mr: [
      'तुंबलेले पावसाळी गटार, रस्त्यावरून घाण पाणी वाहत आहे',
      'मॅनहोलचे झाकण तुटल्यामुळे पादचाऱ्यांना जीवघेणा धोका',
      'पदपथाजवळ सांडपाणी साचून डासांचा प्रादुर्भाव'
    ]
  },
  Streetlight: {
    en: [
      'Complete dark stretch, streetlights not working',
      'Flickering lamp pole posing safety risk',
      'Damaged light pole with exposed wiring'
    ],
    mr: [
      'संपूर्ण रस्त्यावर अंधार, सर्व पथदिवे बंद आहेत',
      'विजेचा दिवा लुकलुकत असून रात्री भीतीचे वातावरण',
      'विजेच्या खांबाच्या उघड्या तारा लटकत आहेत'
    ]
  },
  Encroachment: {
    en: [
      'Footpath completely blocked by illegal stalls, pedestrians forced onto road',
      'Unauthorized tin shed erected on public walkway',
      'Commercial banners and advertising boards blocking road visibility'
    ],
    mr: [
      'पदपथावर अनधिकृत स्टॉल्समुळे नागरिकांना रस्त्यावरून चालावे लागत आहे',
      'सार्वजनिक फुटपाथवर अनधिकृत पत्र्याचे शेड बांधले आहे',
      'मोठ्या जाहिरात फलकांमुळे वळणावर अपघात धोका निर्माण होत आहे'
    ]
  },
  Other: {
    en: [
      'PCMC Sarathi portal timing out / grievance submission failing',
      'Online property tax / water bill receipt not generating after transaction',
      'Public park equipment broken and garden unmaintained'
    ],
    mr: [
      'सारथी पोर्टलवर तांत्रिक अडचण / तक्रार दाखल होत नाही',
      'ऑनलाईन कर भरल्यानंतर पावती डाऊनलोड होत नाही',
      'उद्यानातील खेळणी तुटलेली असून अस्वच्छता आहे'
    ]
  }
};

export function getSubTagsForCategory(category: Category, _language?: Language): SubTagTranslation[] {
  return SUB_TAG_TRANSLATIONS[category] || [];
}

export function getQuickPhrasesForCategory(category: Category, language: Language): string[] {
  const item = QUICK_PHRASES_BY_CATEGORY[category];
  if (!item) return [];
  return language === 'mr' ? item.mr : item.en;
}
