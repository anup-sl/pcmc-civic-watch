/**
 * Official PCMC Ward & Zonal Office Directory
 * Source: PCMC Official Portal - https://www.pcmcindia.gov.in/ward_info
 * 
 * PCMC divides its municipal jurisdiction into 10 Zonal Field Offices (क्षेत्रीय कार्यालये),
 * each named after historic Maratha forts, encompassing all 32 electoral prabhags (wards).
 */

export interface OfficialPcmcZone {
  zoneKey: string;           // 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'J' | 'L'
  zoneName: string;          // e.g. 'Zone A'
  marathiName: string;       // e.g. 'अ क्षेत्रीय कार्यालय'
  fortName: string;          // e.g. 'Rajgad (राजगड)'
  fortMarathi: string;       // e.g. 'राजगड'
  address: string;           // Full physical office address
  phone: string;             // Landline phone
  phoneFormatted: string;    // Display formatted
  mobileHelplines: string[]; // Mobile helpline numbers
  email: string;             // Official zone email
  wardNumbers: number[];     // Included prabhags
  coverageAreas: string;     // Key localities in English
  coverageMarathi: string;   // Key localities in Marathi
}

export interface OfficialPcmcWard {
  wardNo: number;            // 1 to 32
  badge: string;             // 'W-01' to 'W-32'
  zoneKey: string;           // 'A' | 'B' | ... | 'L'
  zoneName: string;          // e.g. 'Zone A'
  fortName: string;          // e.g. 'Rajgad'
  locality: string;          // English locality title
  marathiLocality: string;   // Marathi locality title
  includedSocietiesAndAreas: string; // Full official boundary text from pcmcindia.gov.in/ward_info
}

export const OFFICIAL_PCMC_ZONES: OfficialPcmcZone[] = [
  {
    zoneKey: 'A',
    zoneName: 'Zone A',
    marathiName: 'अ क्षेत्रीय कार्यालय',
    fortName: 'Rajgad (राजगड)',
    fortMarathi: 'राजगड',
    address: 'संत ज्ञानेश्वर चौक, निगडी प्राधिकरण, निगडी ४११०४४',
    phone: '02027646621',
    phoneFormatted: '+91-020-27646621',
    mobileHelplines: ['9922501453', '9922501454'],
    email: 'azone@pcmcindia.gov.in',
    wardNumbers: [13, 14, 15],
    coverageAreas: 'Nigdi Gaothan, Pradhikaran, Akurdi, Chinchwad Station, Mohannagar, Kalbhornagar',
    coverageMarathi: 'निगडी गावठाण, प्राधिकरण, आकुर्डी, चिंचवड स्टेशन, मोहननगर, काळभोरनगर'
  },
  {
    zoneKey: 'B',
    zoneName: 'Zone B',
    marathiName: 'ब क्षेत्रीय कार्यालय',
    fortName: 'Sinhagad (सिंहगड)',
    fortMarathi: 'सिंहगड',
    address: 'लिंक रोड, एल प्रो कंपनी आवार, चिंचवडगाव, पुणे ४११०३३',
    phone: '02027350153',
    phoneFormatted: '+91-020-27350153',
    mobileHelplines: ['9922501455', '9922501456'],
    email: 'bzone@pcmcindia.gov.in',
    wardNumbers: [17, 18, 19],
    coverageAreas: 'Chinchwadgaon, Dalvinagar, Walhekarwadi Gaothan, SKF Colony, Pimpri Camp, Udyognagar',
    coverageMarathi: 'चिंचवडगाव, दळवीनगर, वाल्हेकरवाडी गावठाण, एसकेएफ कॉलनी, पिंपरी कॅम्प, उद्योगनगर'
  },
  {
    zoneKey: 'C',
    zoneName: 'Zone C',
    marathiName: 'क क्षेत्रीय कार्यालय',
    fortName: 'Vijaydurg (विजयदुर्ग)',
    fortMarathi: 'विजयदुर्ग',
    address: 'हॉकी स्टेडियम शेजारी, नेहरूनगर, भोसरी, पुणे ४११०२६',
    phone: '02027122969',
    phoneFormatted: '+91-020-27122969',
    mobileHelplines: ['9922501457', '9922501458'],
    email: 'czone@pcmcindia.gov.in',
    wardNumbers: [2, 9, 10],
    coverageAreas: 'Chikhali East, Jadhavwadi, Borhadewadi, Nehrunagar, Ajmera, Masulkar Colony, Sambhajinagar, Shahunagar',
    coverageMarathi: 'चिखली पूर्व, जाधववाडी, बोर्हाडेवाडी, नेहरूनगर, अजमेरा, मासुळकर कॉलनी, संभाजीनगर, शाहूनगर'
  },
  {
    zoneKey: 'D',
    zoneName: 'Zone D',
    marathiName: 'ड क्षेत्रीय कार्यालय',
    fortName: 'Devgiri (देवगिरी)',
    fortMarathi: 'देवगिरी',
    address: 'औंध-रावेत रोड, रहाटणी, पुणे ४११०१७',
    phone: '02027277898',
    phoneFormatted: '+91-020-27277898',
    mobileHelplines: ['9922501459', '9922501460'],
    email: 'dzone@pcmcindia.gov.in',
    wardNumbers: [21, 27, 28, 29],
    coverageAreas: 'Pimprigaon, Tapkirnagar, Rahatani, Pimple Saudagar (Kokane Chowk, Shivar Garden), Kalpataru Estate, Pimple Gurav',
    coverageMarathi: 'पिंपरीगाव, तापकीरनगर, रहाटणी, पिंपळे सौदागर, कल्पतरु इस्टेट, पिंपळे गुरव'
  },
  {
    zoneKey: 'E',
    zoneName: 'Zone E',
    marathiName: 'इ क्षेत्रीय कार्यालय',
    fortName: 'Shivneri (शिवनेरी)',
    fortMarathi: 'शिवनेरी',
    address: 'पांजरपोळ संस्थे समोर, नाशिक रोड, भोसरी, पुणे ४११०३९',
    phone: '02027230412',
    phoneFormatted: '+91-020-27230412',
    mobileHelplines: ['8605822777', '8605722777'],
    email: 'ezone@pcmcindia.gov.in',
    wardNumbers: [3, 4, 5],
    coverageAreas: 'Moshi Gaothan, Charholi, Dudulgaon, Dighi, Bopkhel, VSNL Road, Ramnagar, Gawlinagar',
    coverageMarathi: 'मोशी गावठाण, चरहोली, डुडूळगाव, दिघी, बोपखेल, व्हीएसएनएल, रामनगर, गवळीनगर'
  },
  {
    zoneKey: 'F',
    zoneName: 'Zone F',
    marathiName: 'फ क्षेत्रीय कार्यालय',
    fortName: 'Torna (तोरणा)',
    fortMarathi: 'तोरणा',
    address: 'नवनगर विकास प्राधिकरण कार्यालयाची जुनी इमारत, लोकमान्य टिळक चौक, निगडी ४११०४४',
    phone: '02027230410',
    phoneFormatted: '+91-020-27230410',
    mobileHelplines: ['8605422888', '8605522888'],
    email: 'fzone@pcmcindia.gov.in',
    wardNumbers: [1, 11, 12],
    coverageAreas: 'Chikhali Gaothan, Kudalwadi, Krishnanagar, Purnanagar, Talawade MIDC IT Park, Rupeenagar, Triveninagar',
    coverageMarathi: 'चिखली गावठाण, कुदळवाडी, कृष्णानगर, पूर्णानगर, तळवडे आयटी पार्क, रुपीनगर, त्रिवेणीनगर'
  },
  {
    zoneKey: 'G',
    zoneName: 'Zone G',
    marathiName: 'ग क्षेत्रीय कार्यालय',
    fortName: 'Purandar (पुरंदर)',
    fortMarathi: 'पुरंदर',
    address: 'तिसरा मजला, नविन प्रशासकिय इमारत, दिलिप वेंगसरकर क्रिकेट अकॅडमी मागे, थेरगाव, पुणे ४११०३३',
    phone: '7887879555',
    phoneFormatted: '7887879555',
    mobileHelplines: ['7887879555'],
    email: 'gzone@pcmcindia.gov.in',
    wardNumbers: [22, 23, 24],
    coverageAreas: 'Kalewadi, Vijayanagar, Thergaon Gaothan, Dange Chowk, Wakad (Aditya Birla Hospital, Datta Mandir, Greens)',
    coverageMarathi: 'काळेवाडी, विजयनगर, थेरगाव गावठाण, डांगे चौक, वाकड (आदित्य बिर्ला, दत्तमंदिर, ग्रीन्स)'
  },
  {
    zoneKey: 'H',
    zoneName: 'Zone H',
    marathiName: 'ह क्षेत्रीय कार्यालय',
    fortName: 'Pratapgad (प्रतापगड)',
    fortMarathi: 'प्रतापगड',
    address: 'कासारवाडी येथील महिला आय.टी.आय इमारत, कासारवाडी, पुणे',
    phone: '02027142503',
    phoneFormatted: '020-27142503 / 04',
    mobileHelplines: ['02027142503', '02027142504'],
    email: 'hzone@pcmcindia.gov.in',
    wardNumbers: [30, 31, 32],
    coverageAreas: 'Kasarwadi, Fugewadi, Dapodi, Sangvi (Old & New), Sangamnagar, PWD Colony, Sairaj Residency',
    coverageMarathi: 'कासारवाडी, फुगेवाडी, दापोडी, सांगवी (जुनी व नवी), संगमनगर, पीडब्ल्यूडी कॉलनी'
  },
  {
    zoneKey: 'J',
    zoneName: 'Zone J',
    marathiName: 'ज क्षेत्रीय कार्यालय',
    fortName: 'Raigad (रायगड)',
    fortMarathi: 'रायगड',
    address: 'स. नं. २७, मनपा वाहनतळ इमारत, ताथवडे, पुणे ४११०३३',
    phone: '8888006666',
    phoneFormatted: 'PCMC Sarathi: 8888006666',
    mobileHelplines: ['8888006666'],
    email: 'jzone@pcmcindia.gov.in',
    wardNumbers: [16, 25, 26],
    coverageAreas: 'Kiwale (Mukai Chowk), Ravet (Basket Bridge, BRT), Mamurdi, Vikas Nagar, Punawale, Tathawade (JSPM), Pimple Nilakh (Vishal Nagar, Kaspatewasti)',
    coverageMarathi: 'किवळे (मुकाई चौक), रावेत (बास्केट ब्रिज), मामुर्डी, विकासनगर, पुनावळे, ताथवडे, पिंपळे निलख (विशालनगर, कस्पटेवस्ती)'
  },
  {
    zoneKey: 'L',
    zoneName: 'Zone L',
    marathiName: 'ल क्षेत्रीय कार्यालय',
    fortName: 'Lohagad (लोहगड)',
    fortMarathi: 'लोहगड',
    address: 'म्हाडा, प्लॉट नं. E-२, संत तुकाराम नगर, पोलिस स्टेशन समोर, पिंपरी, पुणे ४११०१८',
    phone: '8888006666',
    phoneFormatted: 'PCMC Sarathi: 8888006666',
    mobileHelplines: ['8888006666'],
    email: 'lzone@pcmcindia.gov.in',
    wardNumbers: [6, 7, 8, 20],
    coverageAreas: 'Bhosari Gaothan, Landewadi, Chakrapani, Indrayaninagar, MIDC Bhosari, Sant Tukaram Nagar, Vallabhnagar, HA Colony, CIRT',
    coverageMarathi: 'भोसरी गावठाण, लांडेवाडी, चक्रपाणी, इंद्रायणीनगर, एमआयडीसी भोसरी, संत तुकारामनगर, वल्लभनगर, एचए कॉलनी'
  }
];

export const OFFICIAL_PCMC_WARDS: OfficialPcmcWard[] = [
  {
    wardNo: 1,
    badge: 'W-01',
    zoneKey: 'F',
    zoneName: 'Zone F',
    fortName: 'Torna (तोरणा)',
    locality: 'Chikhali Gaothan / Patilnagar',
    marathiLocality: 'चिखली गावठाण / पाटीलनगर',
    includedSocietiesAndAreas: 'चिखली गावठाण भाग, पाटीलनगर, गणेशनगर, मोरे वस्ती भाग, सोनवणे वस्ती इत्यादी.'
  },
  {
    wardNo: 2,
    badge: 'W-02',
    zoneKey: 'C',
    zoneName: 'Zone C',
    fortName: 'Vijaydurg (विजयदुर्ग)',
    locality: 'Chikhali / Borhadewadi / Jadhavwadi',
    marathiLocality: 'चिखली / बोर्हाडेवाडी / जाधववाडी',
    includedSocietiesAndAreas: 'चिखली गावठाण भाग, रिव्हर रेसिडेन्सी, क्रिस्टल सिटी, स्वराज रेसिडेन्सी, गंधर्व एक्सलन्स, बनकर वस्ती, बो-हाडेवाडी, वुड्स व्हिला, जाधववाडी, राजे शिवाजीनगर, कुदळवाडी भाग इत्यादी.'
  },
  {
    wardNo: 3,
    badge: 'W-03',
    zoneKey: 'E',
    zoneName: 'Zone E',
    fortName: 'Shivneri (शिवनेरी)',
    locality: 'Moshi / Charholi / Dudulgaon',
    marathiLocality: 'मोशी / चरहोली / डुडूळगाव',
    includedSocietiesAndAreas: 'मोशी गावठाण, गंधर्व नगरी, संत ज्ञानेश्वरनगर भाग, साई मंदिर परिसर, गोखलेमळा, अलंकापुरम सोसायटी, वडमुखवाडी, काळजेवाडी, ताजणेमळा, चोविसावाडी, च-होली, डुडूळगाव इत्यादी.'
  },
  {
    wardNo: 4,
    badge: 'W-04',
    zoneKey: 'E',
    zoneName: 'Zone E',
    fortName: 'Shivneri (शिवनेरी)',
    locality: 'Dighi / Bopkhel',
    marathiLocality: 'दिघी / बोपखेल',
    includedSocietiesAndAreas: 'दिघी, गजानन महाराज नगर, भारतमातानगर, गायकवाडनगर, भंडारी स्कायलाईन, समर्थनगर, कृष्णानगर इत्यादी, व्ही.एस.एन.एल. गणेशनगर, रामनगर, बोपखेल गावठाण.'
  },
  {
    wardNo: 5,
    badge: 'W-05',
    zoneKey: 'E',
    zoneName: 'Zone E',
    fortName: 'Shivneri (शिवनेरी)',
    locality: 'Ramnagar / Gawlinagar / Bhosari East',
    marathiLocality: 'रामनगर / गवळीनगर / भोसरी पूर्व',
    includedSocietiesAndAreas: 'रामनगर, संत तुकारामनगर, गुरुदत्त कॉलनी, गंगोत्री पार्क, सावंतनगर, महादेवनगर, गवळीनगर, श्रीराम कॉलनी, संत ज्ञानेश्वरनगर, चक्रपाणी वसाहत भाग इत्यादी.'
  },
  {
    wardNo: 6,
    badge: 'W-06',
    zoneKey: 'L',
    zoneName: 'Zone L',
    fortName: 'Lohagad (लोहगड)',
    locality: 'Dhawade Vasti / Chakrapani',
    marathiLocality: 'धावडे वस्ती / चक्रपाणी',
    includedSocietiesAndAreas: 'धावडे वस्ती, भगत वस्ती, गुळवे वस्ती, चक्रपाणी वसाहत भाग, पांडवनगर, रोशल गार्डन परिसर, सद्गुरुनगर इत्यादी.'
  },
  {
    wardNo: 7,
    badge: 'W-07',
    zoneKey: 'L',
    zoneName: 'Zone L',
    fortName: 'Lohagad (लोहगड)',
    locality: 'Bhosari Gaothan / Landewadi',
    marathiLocality: 'भोसरी गावठाण / लांडेवाडी',
    includedSocietiesAndAreas: 'शितलबाग, सेंच्युरी एन्का कॉलनी, सुविधा पार्क, आपटे कॉलनी, सॅंडविक कॉलनी, खंडोबा माळ, गव्हाणे वस्ती, भोसरी गावठाण, लांडेवाडी, शांतीनगर इत्यादी.'
  },
  {
    wardNo: 8,
    badge: 'W-08',
    zoneKey: 'L',
    zoneName: 'Zone L',
    fortName: 'Lohagad (लोहगड)',
    locality: 'Indrayani Nagar / MIDC Bhosari',
    marathiLocality: 'इंद्रायणीनगर / एमआयडीसी भोसरी',
    includedSocietiesAndAreas: 'जय गणेश साम्राज्य, जलवायु विहार, केंद्रिय विहार, महाराष्ट्र कॉलनी, इंद्रायणीनगर, खंडे वस्ती, गवळीमाथा, बालाजीनगर इत्यादी.'
  },
  {
    wardNo: 9,
    badge: 'W-09',
    zoneKey: 'C',
    zoneName: 'Zone C',
    fortName: 'Vijaydurg (विजयदुर्ग)',
    locality: 'Nehrunagar / Ajmera / Masulkar Colony',
    marathiLocality: 'नेहरूनगर / अजमेरा / मासुळकर कॉलनी',
    includedSocietiesAndAreas: 'टाटा मोटर्स, यशवंतनगर, विठ्ठलनगर, उद्यमनगर, स्वप्ननगरी, अंतरिक्ष सोसायटी, अजमेरा सोसायटी, वास्तुउद्योग, मासुळकर कॉलनी, महिंद्रा रॉयल, खराळवाडी, गांधीनगर, नेहरुनगर इत्यादी.'
  },
  {
    wardNo: 10,
    badge: 'W-10',
    zoneKey: 'C',
    zoneName: 'Zone C',
    fortName: 'Vijaydurg (विजयदुर्ग)',
    locality: 'Shahunagar / Sambhajinagar / Morwadi',
    marathiLocality: 'शाहूनगर / संभाजीनगर / मोरवाडी',
    includedSocietiesAndAreas: 'संत ज्ञानेश्वरनगर (म्हाडा), मोरवाडी, लालटोपीनगर, अमृतेश्वर कॉलनी, इंदिरानगर, सरस्वती विश्व विद्यालय परिसर, आंबेडकर नगर, एच.डी.एफ.सी. कॉलनी, दत्तनगर, विद्यानगर, शाहुनगर, वृंदावन सोसायटी, संभाजीनगर इत्यादी.'
  },
  {
    wardNo: 11,
    badge: 'W-11',
    zoneKey: 'F',
    zoneName: 'Zone F',
    fortName: 'Torna (तोरणा)',
    locality: 'Kudalwadi / Purnanagar / Krishnanagar',
    marathiLocality: 'कुदळवाडी / पूर्णानगर / कृष्णानगर',
    includedSocietiesAndAreas: 'नेवाळे वस्ती, हरगुडे वस्ती, कुदळवाडी भाग, कृष्णानगर, शरदनगर, कोयनानगर, महात्मा फुलेनगर, पुर्णानगर, स्वस्त घरकुल प्रकल्प, अजंठानगर, दुर्गानगर, शिवतेज नगर इत्यादी.'
  },
  {
    wardNo: 12,
    badge: 'W-12',
    zoneKey: 'F',
    zoneName: 'Zone F',
    fortName: 'Torna (तोरणा)',
    locality: 'Talawade MIDC IT Park / Rupeenagar',
    marathiLocality: 'तळवडे आयटी पार्क / रुपीनगर',
    includedSocietiesAndAreas: 'तळवडे गावठाण, एम.आय.डी.सी.आय.टी.पार्क, ज्योतिबा मंदिर परिसर, सहयोगनगर, रुपीनगर, त्रिवेणीनगर, म्हेत्रे वस्ती भाग, ताम्हाणे वस्ती भाग इत्यादी.'
  },
  {
    wardNo: 13,
    badge: 'W-13',
    zoneKey: 'A',
    zoneName: 'Zone A',
    fortName: 'Rajgad (राजगड)',
    locality: 'Nigdi Gaothan / Yamunanagar',
    marathiLocality: 'निगडी गावठाण / यमुनानगर',
    includedSocietiesAndAreas: 'निगडी गावठाण, सेक्टर २२- ओटास्कीम, यमुनानगर, माता अमृतानंदमयी मठ परिसर, श्रीकृष्ण मंदिर परिसर, साईनाथनगर इत्यादी.'
  },
  {
    wardNo: 14,
    badge: 'W-14',
    zoneKey: 'A',
    zoneName: 'Zone A',
    fortName: 'Rajgad (राजगड)',
    locality: 'Chinchwad Station / Mohannagar / Kalbhornagar',
    marathiLocality: 'चिंचवड स्टेशन / मोहननगर / काळभोरनगर',
    includedSocietiesAndAreas: 'चिंचवड स्टेशन, महावीर पार्क, मोहननगर, रामनगर, काळभोरनगर, ऐश्वर्यम सोसायटी, शुभश्री सोसायटी, जयगणेश व्हिजन, विवेकनगर, विठ्ठलवाडी, बजाज ऑटो, दत्तवाडी, तुळजाईवस्ती इत्यादी.'
  },
  {
    wardNo: 15,
    badge: 'W-15',
    zoneKey: 'A',
    zoneName: 'Zone A',
    fortName: 'Rajgad (राजगड)',
    locality: 'Akurdi Gaothan / Pradhikaran Sector 24-28',
    marathiLocality: 'आकुर्डी गावठाण / प्राधिकरण सेक्टर २४-२८',
    includedSocietiesAndAreas: 'आकुर्डी गावठाण, गंगानगर, वाहतुकनगरी, सेक्टर नं २४, २५, २६, २७, २७अ, २८, सिंधुनगर, परमार पार्क, स्वप्नपुर्ती सोसायटी, केंद्रिय वसाहत, एल.आय.सी., एक्साईज, इत्यादी.'
  },
  {
    wardNo: 16,
    badge: 'W-16',
    zoneKey: 'J',
    zoneName: 'Zone J',
    fortName: 'Raigad (रायगड)',
    locality: 'Kiwale / Ravet / Mamurdi / Vikas Nagar',
    marathiLocality: 'किवळे / रावेत / मामुर्डी / विकासनगर',
    includedSocietiesAndAreas: 'वाल्हेकरवाडी भाग, गुरुद्वारा नॅनोहोम सोसायटी, शिंदे वस्ती, रॉयल कासा सोसायटी, सेक्टर क्र.२९, रावेत, नंदगिरी सोसायटी, विकासनगर, क्रिस्टल सिटी, मामुर्डी, किवळे इत्यादी.'
  },
  {
    wardNo: 17,
    badge: 'W-17',
    zoneKey: 'B',
    zoneName: 'Zone B',
    fortName: 'Sinhagad (सिंहगड)',
    locality: 'Chinchwadenagar / Dalvinagar / Walhekarwadi',
    marathiLocality: 'चिंचवडेनगर / दळवीनगर / वाल्हेकरवाडी',
    includedSocietiesAndAreas: 'दळवीनगर, प्रेमलोक पार्क, भोईरनगर, गिरिराज सोसायटी, रेल विहार सोसायटी, शिवनगरी, नागसेनगर, आहेरनगर, वाल्हेकरवाडी गावठाण, चिंचवडेनगर, बळवंतनगर, बिजलीनगर इत्यादी.'
  },
  {
    wardNo: 18,
    badge: 'W-18',
    zoneKey: 'B',
    zoneName: 'Zone B',
    fortName: 'Sinhagad (सिंहगड)',
    locality: 'Chinchwad Gaothan / Moraya Gosavi / SKF',
    marathiLocality: 'चिंचवड गावठाण / मोरया गोसावी / एसकेएफ',
    includedSocietiesAndAreas: 'एस.के.एफ. कॉलनी, रस्टन कॉलनी, पवना नगर, वेताळनगर, चिंचवड गावठाण, केशवनगर, तानाजीनगर, काकडे पार्क, मोरया राज पार्क, दर्शन हॉल, माणिक कॉलनी, लक्ष्मीनगर, यशोपुरम सोसायटी इत्यादी.'
  },
  {
    wardNo: 19,
    badge: 'W-19',
    zoneKey: 'B',
    zoneName: 'Zone B',
    fortName: 'Sinhagad (सिंहगड)',
    locality: 'Pimpri Camp / Empire Estate / Anandnagar',
    marathiLocality: 'पिंपरी कॅम्प / एम्पायर इस्टेट / आनंदनगर',
    includedSocietiesAndAreas: 'विजयनगर, न्यु एस.के.एफ. कॉलनी, उद्योगनगर, क्वीन्स टाऊन, सुदर्शननगर, श्रीधरनगर, आनंदनगर, भोईर कॉलनी, गावडे पार्क, एम्पायर इस्टेट, विसडम पार्क, डॉ.बाबसाहेब आंबेडकर कॉलनी, भिमनगर, पिंपरी कॅम्प इत्यादी.'
  },
  {
    wardNo: 20,
    badge: 'W-20',
    zoneKey: 'L',
    zoneName: 'Zone L',
    fortName: 'Lohagad (लोहगड)',
    locality: 'Sant Tukaram Nagar / Vallabhnagar / HA Colony',
    marathiLocality: 'संत तुकारामनगर / वल्लभनगर / एचए कॉलनी',
    includedSocietiesAndAreas: 'विशाल थिएटर परिसर, एच.ए. कॉलनी, महेशनगर, संत तुकारामनगर, महात्मा फुलेनगर, वल्लभनगर, लांडेवाडी झोपडपट्टी, सी.आय.आर.टी., पार्श्वनाथ सोसायटी, कासारवाडी भाग, अग्रसेन नगर, कुंदननगर इत्यादी.'
  },
  {
    wardNo: 21,
    badge: 'W-21',
    zoneKey: 'D',
    zoneName: 'Zone D',
    fortName: 'Devgiri (देवगिरी)',
    locality: 'Pimpri Gaothan / Tapovan Mandir',
    marathiLocality: 'पिंपरी गावठाण / तपोवन मंदिर',
    includedSocietiesAndAreas: 'मिलिंदनगर, सुभाषनगर, गौतमनगर, आदर्शनगर, इंदीरानगर, शास्त्रीनगर, बलदेवनगर, गणेशनगर, जिजामाता हॉस्पीटल, संजय गांधीनगर, वैभवनगर, अशोक थिएटर, पिंपरीगाव, तपोवन मंदिर इत्यादी.'
  },
  {
    wardNo: 22,
    badge: 'W-22',
    zoneKey: 'G',
    zoneName: 'Zone G',
    fortName: 'Purandar (पुरंदर)',
    locality: 'Kalewadi / Nadhenagar / Jyotibanagar',
    marathiLocality: 'काळेवाडी / नढेनगर / ज्योतिबानगर',
    includedSocietiesAndAreas: 'काळेवाडी, विजयनगर, निर्मलनगर, आदर्शनगर, पवनानगर, ज्योतिबानगर भाग, नढेनगर इत्यादी.'
  },
  {
    wardNo: 23,
    badge: 'W-23',
    zoneKey: 'G',
    zoneName: 'Zone G',
    fortName: 'Purandar (पुरंदर)',
    locality: 'Thergaon Gaothan / Dange Chowk / Swiss County',
    marathiLocality: 'थेरगाव गावठाण / डांगे चौक / स्विस काऊंटी',
    includedSocietiesAndAreas: 'प्रसुनधाम, गंगा आशियाना, कुणाल रेसिडेन्सी, स्विस काऊंटी, थेरगाव गावठाण, पडवळनगर भाग, अशोका सोसायटी, साईनाथनगर, समर्थ कॉलनी इत्यादी.'
  },
  {
    wardNo: 24,
    badge: 'W-24',
    zoneKey: 'G',
    zoneName: 'Zone G',
    fortName: 'Purandar (पुरंदर)',
    locality: 'Wakad / Aditya Birla Hospital / Datta Mandir',
    marathiLocality: 'वाकड / आदित्य बिर्ला हॉस्पिटल / दत्तमंदिर',
    includedSocietiesAndAreas: 'आदित्य बिर्ला हॉस्पीटल, दत्तनगर, पद्मजी पेपरमिल, ग्रिन्स हाऊसींग सोसायटी, गंगा ओशियन मिडोज, पडवळनगर, गणेशनगर, म्हातोबानगर, प्रथम सोसायटी, क्रांतीनगर, यशदा कॉलनी, गुजरनगर इत्यादी.'
  },
  {
    wardNo: 25,
    badge: 'W-25',
    zoneKey: 'J',
    zoneName: 'Zone J',
    fortName: 'Raigad (रायगड)',
    locality: 'Punawale / Tathawade / Wakad Kalakhadak',
    marathiLocality: 'पुनावळे / ताथवडे / वाकड काळ-खडक',
    includedSocietiesAndAreas: 'माळवडी, पुनावळे, पंढारे वस्ती, काटे वस्ती, नवले वस्ती, ताथवडे, अशोकानगर, निंबाळकरनगर, भुमकरवस्ती, वाकड काळ-खडक, मुंबोजानगर, मानेवस्ती, भुजबळ वस्ती, वाकडकर वस्ती, केमसे वस्ती, रोहन तरंग, प्रिस्टाईन सोसायटी इत्यादी.'
  },
  {
    wardNo: 26,
    badge: 'W-26',
    zoneKey: 'J',
    zoneName: 'Zone J',
    fortName: 'Raigad (रायगड)',
    locality: 'Pimple Nilakh / Vishal Nagar / Kaspatewasti',
    marathiLocality: 'पिंपळे निलख / विशालनगर / कस्पटेवस्ती',
    includedSocietiesAndAreas: 'पिंपळे निलख, विशालनगर, पार्कस्ट्रिट, कस्पटेवस्ती, अनमोल रेसिडेन्सी, धनराज पार्क, दत्तमंदिर परिसर, अण्णाभाऊ साठेनगर, वेणुनगर भाग, रक्षक सोसायटी, भारत इलेक्ट्रॉनिक्स इत्यादी.'
  },
  {
    wardNo: 27,
    badge: 'W-27',
    zoneKey: 'D',
    zoneName: 'Zone D',
    fortName: 'Devgiri (देवगिरी)',
    locality: 'Rahatani Gaothan / Shrinagar / Tapkirnagar',
    marathiLocality: 'रहाटणी गावठाण / श्रीनगर / तापकीरनगर',
    includedSocietiesAndAreas: 'तापकीरनगर, श्रीनगर, शिवतीर्थनगर, बळिराम गार्डन, रहाटणी गावठाण, तांबेशाळा परिसर, सिंहगड कॉलनी, रायगड कॉलनी, एस.एन.बी.पी.स्कुल, रॉयल ऑरेंज काऊंटी, आकाशगंगा सोसायटी इत्यादी.'
  },
  {
    wardNo: 28,
    badge: 'W-28',
    zoneKey: 'D',
    zoneName: 'Zone D',
    fortName: 'Devgiri (देवगिरी)',
    locality: 'Pimple Saudagar / Kunal Icon / Rose Land',
    marathiLocality: 'पिंपळे सौदागर / कुणाल आयकॉन / रोझ लॅंड',
    includedSocietiesAndAreas: 'फाईव्ह गार्डन, शिवार गार्डन, प्लॅनेट मिलेनीयम, कापसे लॉन्स, रामनगर, पिंपळे सौदागर, कुणाल आयकॉन, रोझ लॅंड, गोविंद गार्डन इत्यादी.'
  },
  {
    wardNo: 29,
    badge: 'W-29',
    zoneKey: 'D',
    zoneName: 'Zone D',
    fortName: 'Devgiri (देवगिरी)',
    locality: 'Pimple Gurav / Kalpataru Estate',
    marathiLocality: 'पिंपळे गुरव / कल्पतरु इस्टेट',
    includedSocietiesAndAreas: 'कल्पतरु इस्टेट, क्रांतीनगर, काशिद पार्क, गगनगिरी पार्क, जवळकरनगर, शिवनेरी कॉलनी, गुलमोहर कॉलनी, ओंकार कॉलनी, गोकुळनगरी, भालेकरनगर, पिंपळे गुरव, सुदर्शन नगर इत्यादी.'
  },
  {
    wardNo: 30,
    badge: 'W-30',
    zoneKey: 'H',
    zoneName: 'Zone H',
    fortName: 'Pratapgad (प्रतापगड)',
    locality: 'Kasarwadi / Fugewadi / Dapodi',
    marathiLocality: 'कासारवाडी / फुगेवाडी / दापोडी',
    includedSocietiesAndAreas: 'शंकरवाडी भाग, सरीता संगम सोसायटी, शास्त्रीनगर, केशवनगर, कासारवाडी भाग, कुंदननगर, फुगेवाडी, संजयनगर, दापोडी, सिद्धार्थनगर, गणेशनगर, सुंदरबाग कॉलनी, एस.टी.वर्क शॉप इत्यादी.'
  },
  {
    wardNo: 31,
    badge: 'W-31',
    zoneKey: 'H',
    zoneName: 'Zone H',
    fortName: 'Pratapgad (प्रतापगड)',
    locality: 'Sangvi / Dapodi / Kirti Nagar',
    marathiLocality: 'सांगवी / दापोडी / किर्ती नगर',
    includedSocietiesAndAreas: 'राजीव गांधीनगर, गजानन महाराज नगर, किर्ती नगर, विनायकनगर, गणेशनगर, कवडेनगर, गांगार्डेनगर भाग, विद्यानगर भाग, ऊरो रुग्णालय इत्यादी.'
  },
  {
    wardNo: 32,
    badge: 'W-32',
    zoneKey: 'H',
    zoneName: 'Zone H',
    fortName: 'Pratapgad (प्रतापगड)',
    locality: 'Old Sangvi / Sangamnagar / PWD Colony',
    marathiLocality: 'जुनी सांगवी / संगमनगर / पीडब्ल्यूडी कॉलनी',
    includedSocietiesAndAreas: 'सांगवी गावठाण, मधुबन सोसायटी, ढोरेनगर, जयमालानगर, संगमनगर, पी.डब्ल्यु.डी. कॉलनी, एस.टी.कॉलनी, कृष्णानगर, साईराज रेसिडेन्सी, शिवदत्तनगर इत्यादी.'
  }
];

export function getOfficialZoneByKey(zoneKey: string): OfficialPcmcZone | undefined {
  const normalized = (zoneKey || '').trim().toUpperCase().replace(/^ZONE\s*/i, '');
  return OFFICIAL_PCMC_ZONES.find(z => z.zoneKey === normalized);
}

export function getOfficialWardByNumber(wardNo: number): OfficialPcmcWard | undefined {
  return OFFICIAL_PCMC_WARDS.find(w => w.wardNo === Number(wardNo));
}

export function getOfficialWardsForZone(zoneKey: string): OfficialPcmcWard[] {
  const normalized = (zoneKey || '').trim().toUpperCase().replace(/^ZONE\s*/i, '');
  return OFFICIAL_PCMC_WARDS.filter(w => w.zoneKey === normalized);
}
