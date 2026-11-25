import type { Category } from '../types';
import type { Language } from './i18n';

export interface SubTagTranslation {
  en: string;
  mr: string;
}

export const SUB_TAG_TRANSLATIONS: Record<Category, SubTagTranslation[]> = {
  Garbage: [
    { en: 'Overflowing Garbage Bin', mr: 'ओव्हरफ्लो कचरा कुंडी' },
    { en: 'Open Roadside Dumping', mr: 'रस्त्याकडेला उघड्यावर कचरा' },
    { en: 'Dead Animal / Bio-Waste', mr: 'मृत प्राणी / बायो-कचरा' },
    { en: 'Construction Debris (Malba)', mr: 'बांधकामाचा राडारोडा (डेब्रिज)' },
    { en: 'Missed Door-to-Door Van', mr: 'घंटागाडी न येणे' },
    { en: 'Burning of Garbage', mr: 'कचरा जाळणे (धूर / प्रदूषण)' },
    { en: 'Other', mr: 'इतर' }
  ],
  Drainage: [
    { en: 'Blocked / Overflowing Gutter', mr: 'तुंबलेले / वाहणारे गटार' },
    { en: 'Open / Missing Manhole Cover', mr: 'उघडे / तुटलेले मॅनहोल झाकण' },
    { en: 'Drinking Water Pipeline Leak', mr: 'पिण्याच्या पाण्याची पाईपलाईन गळती' },
    { en: 'Sewage Mixing in Water', mr: 'पिण्याच्या पाण्यात सांडपाणी मिसळणे' },
    { en: 'Waterlogging on Road', mr: 'रस्त्यावर साचलेले पाणी' },
    { en: 'No Water Supply', mr: 'पाणीपुरवठा खंडित / कमी दाब' },
    { en: 'Other', mr: 'इतर' }
  ],
  Pothole: [
    { en: 'Deep Crater on Carriageway', mr: 'रस्त्यावरील खोल खड्डा' },
    { en: 'Sunken Manhole / Trench Dip', mr: 'खचलेले मॅनहोल / चेंबर खड्डा' },
    { en: 'Loose Gravel / Asphalt Washed Out', mr: 'उखडलेला डांबर / पसरलेली खडी' },
    { en: 'Multiple Consecutive Potholes', mr: 'सलग अनेक खड्डे' },
    { en: 'Broken Paver Blocks', mr: 'तुटलेले पेव्हर ब्लॉक्स' },
    { en: 'Road Surface Subsidence', mr: 'रस्ता खचणे / भेगा पडणे' },
    { en: 'Damaged Speed Breaker', mr: 'तुटलेला / निकृष्ट गतिरोधक' },
    { en: 'Other', mr: 'इतर' }
  ],
  Streetlight: [
    { en: 'Streetlight Not Working', mr: 'बंद पथदिवा' },
    { en: 'Dark Stretch (Multiple Lights Off)', mr: 'संपूर्ण रस्त्यावर अंधार' },
    { en: 'Flickering / Dim Streetlight', mr: 'लुकलुगणारा / मंद पथदिवा' },
    { en: 'Exposed Live Wires / Open Box', mr: 'उघड्या विजेच्या तारा / उघडी पेटी' },
    { en: 'Tilted / Damaged Electric Pole', mr: 'वाकलेला / धोकादायक विजेचा खांब' },
    { en: 'Light On During Daytime', mr: 'दिवसा चालू असणारा पथदिवा' },
    { en: 'Other', mr: 'इतर' }
  ],
  Encroachment: [
    { en: 'Footpath Blocked by Stalls/Vendors', mr: 'पदपथावर हातगाड्या / फेरीवाले' },
    { en: 'Illegal Roadside Shed / Extension', mr: 'अनधिकृत पत्र्याचे शेड / बांधकाम' },
    { en: 'Abandoned Vehicles on Road', mr: 'रस्त्यावर बेवारस पडलेली वाहने' },
    { en: 'Illegal Hoarding / Banner', mr: 'अनधिकृत होर्डिंग / फ्लेक्स बोर्ड' },
    { en: 'Road Blocked by Building Material', mr: 'रस्त्यावर बांधकाम साहित्य' },
    { en: 'Other', mr: 'इतर' }
  ],
  Footpath: [
    { en: 'Bad Condition / Damaged Footpath', mr: 'खराब / तुटलेला पदपथ' },
    { en: 'Missing / Non-Existent Footpath', mr: 'पदपथ नसणे / पादचारी मार्गाचा अभाव' },
    { en: 'Footpath Encroachment / Obstruction', mr: 'पदपथावरील अतिक्रमण' },
    { en: 'Other', mr: 'इतर' }
  ],
  Garden: [
    { en: 'Fallen Tree / Blocking Road', mr: 'रस्त्यावर पडलेले झाड' },
    { en: 'Dangerous Hanging Branches', mr: 'धोकादायक लटकणाऱ्या फांद्या' },
    { en: 'Overgrown Weeds / Bushes', mr: 'वाढलेले गवत / झाडेझुडपे' },
    { en: 'Broken Park Bench / Play Equipment', mr: 'उद्यानातील तुटलेली खेळणी / बाकडे' },
    { en: 'Park Lights / Gate Damaged', mr: 'उद्यानाचा दिवा / गेट नादुरुस्त' },
    { en: 'Other', mr: 'इतर' }
  ],
  Animals: [
    { en: 'Aggressive / Biting Stray Dogs', mr: 'चावणारे / आक्रमक भटके कुत्रे' },
    { en: 'Injured / Sick Stray Animal', mr: 'जखमी / आजारी मुका प्राणी' },
    { en: 'Stray Cattle Blocking Traffic', mr: 'वाहतुकीस अडथळा ठरणारी मोकाट जनावरे' },
    { en: 'Dead Animal Removal Needed', mr: 'मृत प्राणी उचलण्याची गरज' },
    { en: 'Other', mr: 'इतर' }
  ],
  Pollution: [
    { en: 'Open Garbage / Plastic Burning', mr: 'कचरा / प्लास्टिक उघड्यावर जाळणे' },
    { en: 'RMC Plant / Construction Dust', mr: 'आरएमसी प्लॅन्ट / बांधकामाची धूळ' },
    { en: 'Industrial Smoke / Chemical Odor', mr: 'कारखान्यांचा धूर / रासायनिक दुर्गंधी' },
    { en: 'Late-Night Loudspeaker Noise', mr: 'रात्री उशिरापर्यंत लाऊडस्पीकर आवाज' },
    { en: 'Other', mr: 'इतर' }
  ],
  Other: [
    { en: 'Sarathi App / Portal Down', mr: 'सारथी ॲप / संकेतस्थळ बंद' },
    { en: 'WhatsApp Bot Unresponsive', mr: 'सारथी व्हॉट्सॲप बॉट अनुत्तरित' },
    { en: 'Complaint Closed Without Work', mr: 'काम न करताच तक्रार बंद केली' },
    { en: 'Property / Water Tax Portal Error', mr: 'कर / पाणीपट्टी भरणा त्रुटी' },
    { en: 'Other', mr: 'इतर' }
  ]
};

/**
 * Context-aware dynamic Quick Phrases matching specific sub-tags
 */
export const SUBTAG_SPECIFIC_PHRASES: Record<string, { en: string[]; mr: string[] }> = {
  // Potholes
  'Deep Crater on Carriageway': {
    en: [
      'Deep pothole crater causing two-wheeler hazard',
      'Dangerous during night & rain due to poor visibility',
      'Causing severe traffic bottleneck during peak hours',
      'Two-wheelers skidding at this spot daily'
    ],
    mr: [
      'दुचाकीस्वारांसाठी अत्यंत धोकादायक खोल खड्डा',
      'रात्री व पावसाळ्यात न दिसल्यामुळे अपघाताचा धोका',
      'गर्दीच्या वेळी वाहतूक कोंडी होत आहे',
      'येथे रोज दुचाकी घसरत आहेत'
    ]
  },
  'Sunken Manhole / Trench Dip': {
    en: [
      'Sunken drainage chamber on carriageway',
      'Uneven road trench cut left unfilled after utility work',
      'Sharp edge damaging vehicle tires and suspension',
      'Severe vehicle jerk and hazard to motorists'
    ],
    mr: [
      'रस्त्यावरील खचलेले चेंबर / मॅनहोल',
      'खोदकाम करून खड्डा व्यवस्थित बुजवला नाही',
      'वाहनांच्या टायर व सस्पेंशनचे नुकसान होत आहे',
      'वाहनचालकांना अचानक जोरदार हादरा बसतो'
    ]
  },
  'Loose Gravel / Asphalt Washed Out': {
    en: [
      'Loose gravel spread across lane causing skidding',
      'Top asphalt completely washed away by water',
      'Two-wheelers losing balance during braking'
    ],
    mr: [
      'रस्त्यावर खडी पसरल्यामुळे गाड्या घसरत आहेत',
      'डांबराचा थर पूर्णपणे उखडून गेला आहे',
      'ब्रेक लावताना दुचाकी वाहने घसरून पडत आहेत'
    ]
  },

  // Garbage
  'Overflowing Garbage Bin': {
    en: [
      'Garbage overflowing onto main road & footpath',
      'Severe foul smell and mosquito breeding risk',
      'Garbage not lifted for more than 3 consecutive days',
      'Stray cattle and dogs scattering waste across street'
    ],
    mr: [
      'कचरा रस्त्यावर आणि पदपथावर पसरला आहे',
      'तीव्र दुर्गंधी आणि डासांचा प्रादुर्भाव',
      '३ दिवसांहून अधिक काळ कचरा उचललेला नाही',
      'भटके कुत्रे आणि जनावरे कचरा विस्कटत आहेत'
    ]
  },
  'Open Roadside Dumping': {
    en: [
      'Garbage overflowing onto main road & footpath',
      'Severe foul smell and mosquito breeding risk',
      'Garbage not lifted for more than 3 consecutive days',
      'Stray cattle and dogs scattering waste across street'
    ],
    mr: [
      'कचरा रस्त्यावर आणि पदपथावर पसरला आहे',
      'तीव्र दुर्गंधी आणि डासांचा प्रादुर्भाव',
      '३ दिवसांहून अधिक काळ कचरा उचललेला नाही',
      'भटके कुत्रे आणि जनावरे कचरा विस्कटत आहेत'
    ]
  },
  'Construction Debris (Malba)': {
    en: [
      'Heavy construction debris dumped on public road',
      'Dust flying into nearby residential society',
      'Blocking traffic lane and pedestrian movement'
    ],
    mr: [
      'रस्त्यावर बांधकामाचा राडारोडा (डेब्रिज) टाकला आहे',
      'बांधकाम साहित्याची धूळ सोसायट्यांमध्ये पसरत आहे',
      'वाहतुकीचा रस्ता व पदपथ अडवला आहे'
    ]
  },

  // Drainage
  'Blocked / Overflowing Gutter': {
    en: [
      'Sewage water overflowing continuously onto road',
      'Stagnant wastewater causing severe health hazard',
      'Foul smell entering nearby homes and shops',
      'Gutter choked with plastic waste and silt'
    ],
    mr: [
      'गटाराचे घाण पाणी रस्त्यावर वाहत आहे',
      'साचलेल्या सांडपाण्यामुळे साथीच्या रोगांची भीती',
      'आजूबाजूच्या घरात व दुकानात दुर्गंधी येत आहे',
      'प्लास्टिक व कचऱ्यामुळे गटार पूर्णपणे तुंबले आहे'
    ]
  },
  'Open / Missing Manhole Cover': {
    en: [
      'Open manhole poses life-threatening hazard to pedestrians',
      'Deep open chamber without any danger barricade',
      'Risk of children and two-wheelers falling into pit'
    ],
    mr: [
      'उघड्या मॅनहोलमुळे नागरिकांच्या जिवाला मोठा धोका',
      'कोणताही बॅरिकेड नसलेला खोल उघडा चेंबर',
      'लहान मुले किंवा दुचाकी खड्ड्यात पडण्याची शक्यता'
    ]
  },
  'Drinking Water Pipeline Leak': {
    en: [
      'Major potable water pipeline leaking thousands of liters',
      'Drinking water mixing with roadside mud',
      'Low water pressure in residential societies'
    ],
    mr: [
      'पिण्याच्या पाण्याची मुख्य पाईपलाईन फुटून हजारो लिटर पाणी वाया',
      'पिण्याच्या पाण्यात रस्त्यावरील माती व घाण मिसळत आहे',
      'परिसरातील सोसायट्यांमध्ये पाण्याचा दाब अत्यंत कमी'
    ]
  },

  // Streetlight
  'Streetlight Not Working': {
    en: [
      'Entire road stretch completely dark after sunset',
      'Safety hazard for pedestrians, women, and senior citizens',
      'Frequent complaints made but light still not repaired',
      'Prone to anti-social activities in the dark'
    ],
    mr: [
      'सूर्यास्तानंतर संपूर्ण रस्त्यावर काळोख असतो',
      'महिला, ज्येष्ठ नागरिक व पादचाऱ्यांच्या सुरक्षिततेचा प्रश्न',
      'अनेकदा तक्रार करूनही दिवा दुरुस्त केलेला नाही',
      'अंधारामुळे समाजकंटकांचा उपद्रव वाढला आहे'
    ]
  },
  'Dark Stretch (Multiple Lights Off)': {
    en: [
      'Entire road stretch completely dark after sunset',
      'Safety hazard for pedestrians, women, and senior citizens',
      'Open feeder pillar box with exposed electrical wires',
      'Prone to vehicular accidents due to zero visibility'
    ],
    mr: [
      'सूर्यास्तानंतर संपूर्ण रस्त्यावर काळोख असतो',
      'महिला, ज्येष्ठ नागरिक व पादचाऱ्यांच्या सुरक्षिततेचा प्रश्न',
      'उघड्या विजेच्या तारांमुळे शॉक लागण्याचा धोका',
      'अंधारामुळे वळणावर वाहनांचे अपघात होत आहेत'
    ]
  },
  'Exposed Live Wires / Open Box': {
    en: [
      'Open feeder pillar box with exposed electrical wires',
      'Live wires hanging at pedestrian height',
      'Life-threatening electric shock risk especially for children'
    ],
    mr: [
      'उघड्या विजेच्या तारांमुळे शॉक लागण्याचा मोठा धोका',
      'विजेच्या तारा जमिनीजवळ लटकत आहेत',
      'लहान मुले व नागरिकांच्या जिवाला थेट धोका'
    ]
  },

  // Encroachment
  'Footpath Blocked by Stalls/Vendors': {
    en: [
      'Pedestrians forced to walk on busy main road',
      'Illegal commercial stalls occupying public walkway',
      'Heavy traffic congestion due to blocked lane',
      'Two-wheelers driving on pedestrian footpath'
    ],
    mr: [
      'पादचाऱ्यांना जीव मुठीत धरून रस्त्यावरून चालावे लागते',
      'अनधिकृत स्टॉल्समुळे चालण्यासाठी जागा नाही',
      'रस्ता अडवल्यामुळे प्रचंड वाहतूक कोंडी होते',
      'फुटपाथवर बेकायदेशीर वाहने चालवली जातात'
    ]
  },
  'Abandoned Vehicles on Road': {
    en: [
      'Rusted abandoned vehicle blocking traffic lane for weeks',
      'Pedestrians forced to walk on busy main road',
      'Vehicle harboring garbage and stray animals'
    ],
    mr: [
      'भंगार बेवारस वाहनामुळे रस्ता कित्येक आठवडे अडवला आहे',
      'पादचाऱ्यांना जीव मुठीत धरून रस्त्यावरून चालावे लागते',
      'बेवारस वाहनाजवळ कचरा व अस्वच्छता साचली आहे'
    ]
  },

  // Trees / Parks
  'Fallen Tree / Blocking Road': {
    en: [
      'Fallen tree completely blocking traffic movement',
      'Electric wires snapped due to fallen branch',
      'Immediate tree removal & road clearing required'
    ],
    mr: [
      'झाड उन्मळून पडल्यामुळे रस्ता पूर्ण बंद आहे',
      'फांदी तुटून विजेच्या तारांवर पडली आहे',
      'तातडीने झाड हटवून रस्ता मोकळा करणे गरजेचे'
    ]
  },
  'Dangerous Hanging Branches': {
    en: [
      'Dangerous heavy branches can fall on vehicles anytime',
      'Blocking streetlights and reducing night visibility',
      'Immediate tree trimming required before rain/wind'
    ],
    mr: [
      'धोकादायक फांदी कधीही वाहनांवर पडू शकते',
      'झाडाच्या फांद्यांमुळे पथदिवा झाकला गेला आहे',
      'तातडीने फांद्या छाटणी करण्याची गरज आहे'
    ]
  },

  // Stray Animals
  'Aggressive / Biting Stray Dogs': {
    en: [
      'Pack of stray dogs chasing two-wheelers and children',
      'Dog bite incident occurred recently at this spot',
      'Urgent PCMC animal control team intervention needed'
    ],
    mr: [
      'भटकी कुत्री दुचाकी व लहान मुलांच्या अंगावर धावून जातात',
      'या ठिकाणी नुकतीच श्वानदंशाची घटना घडली आहे',
      'पालिकेच्या श्वान नियंत्रण पथकाने तातडीने कारवाई करावी'
    ]
  },
  'Stray Cattle Blocking Traffic': {
    en: [
      'Stray cattle sitting in middle of busy road causing accidents',
      'Heavy traffic bottleneck during peak hours',
      'Need impounding to PCMC cattle shed'
    ],
    mr: [
      'रस्त्याच्या मधोमध जनावरे बसल्याने अपघात होत आहेत',
      'गर्दीच्या वेळी जनावरांमुळे मोठी वाहतूक कोंडी',
      'मोकाट जनावरांना गोठ्यात हलवणे आवश्यक'
    ]
  },

  // Pollution
  'Open Garbage / Plastic Burning': {
    en: [
      'Toxic smoke from open waste burning affecting nearby societies',
      'Burning plastic creating suffocating chemical smell',
      'Senior citizens and asthma patients facing breathing issues'
    ],
    mr: [
      'कचरा जाळल्यामुळे विषारी धूर सोसायट्यांमध्ये पसरत आहे',
      'प्लास्टिक जळल्यामुळे अत्यंत दुर्गंधी व विषारी वायू',
      'ज्येष्ठ नागरिक व दम्याच्या रुग्णांना श्वास घेण्यास त्रास'
    ]
  },
  'RMC Plant / Construction Dust': {
    en: [
      'Heavy construction dust without green net / water sprinkling',
      'RMC cement dust blanketing road and residential buildings',
      'Air Quality Index severely deteriorated'
    ],
    mr: [
      'ग्रीन नेट व पाणी न मारल्यामुळे प्रचंड धूळ उडत आहे',
      'आरएमसी सिमेंटची धूळ घरांवर व झाडांवर बसत आहे',
      'हवेची गुणवत्ता अत्यंत खालावली आहे'
    ]
  },

  // E-Gov / Sarathi
  'Complaint Closed Without Work': {
    en: [
      'Previous ticket marked resolved without any on-ground work',
      'False clearance uploaded on PCMC Sarathi portal',
      'Escalated for administrative inspection and reopening'
    ],
    mr: [
      'प्रत्यक्ष काम न करताच मागील तक्रार बंद दाखवली',
      'सारथी पोर्टलवर खोटा निवारण अहवाल जोडला आहे',
      'प्रशासकीय अधिकाऱ्यांनी पाहणी करून तक्रार पुन्हा उघडावी'
    ]
  },
  'Sarathi App / Portal Down': {
    en: [
      'Official Sarathi app & WhatsApp helpline non-functional',
      'Grievance registration page giving server error',
      'Citizens unable to track existing complaints'
    ],
    mr: [
      'सारथी ॲप आणि व्हॉट्सॲप हेल्पलाइन काम करत नाही',
      'तक्रार नोंदणी करताना सर्व्हर त्रुटी येत आहे',
      'नागरिकांना तक्रारींचा पाठपुरावा करणे अशक्य झाले आहे'
    ]
  }
};

/**
 * Category-level fallback quick phrases
 */
export const QUICK_PHRASES_BY_CATEGORY: Record<Category, { en: string[]; mr: string[] }> = {
  Pothole: {
    en: [
      'Deep pothole crater causing two-wheeler hazard',
      'Sunken drainage chamber on carriageway',
      'Dangerous during night & rain due to poor visibility',
      'Asphalt washed out across traffic lane'
    ],
    mr: [
      'दुचाकीस्वारांसाठी अत्यंत धोकादायक खोल खड्डा',
      'रस्त्यावरील चेंबर खचल्यामुळे अपघाताचा धोका',
      'रात्री व पावसात न दिसल्यामुळे मोठा धोका',
      'डांबरीकरण उखडून खडी पसरली आहे'
    ]
  },
  Garbage: {
    en: [
      'Garbage overflowing onto main road & footpath',
      'Severe foul smell and mosquito breeding risk',
      'Garbage not lifted for more than 3 consecutive days',
      'Waste burning causing toxic morning smoke'
    ],
    mr: [
      'कचरा रस्त्यावर आणि पदपथावर पसरला आहे',
      'तीव्र दुर्गंधी आणि डासांचा प्रादुर्भाव',
      '३ दिवसांहून अधिक काळ कचरा उचललेला नाही',
      'उघड्यावर कचरा जाळल्याने होणारा विषारी धूर'
    ]
  },
  Drainage: {
    en: [
      'Sewage water overflowing continuously onto road',
      'Open manhole poses life-threatening hazard to pedestrians',
      'Stagnant wastewater causing severe health hazard',
      'Choked stormwater drain overflowing on road'
    ],
    mr: [
      'गटाराचे घाण पाणी रस्त्यावर वाहत आहे',
      'उघड्या मॅनहोलमुळे पादचाऱ्यांच्या जिवाला धोका',
      'साचलेल्या सांडपाण्यामुळे साथीच्या रोगांची भीती',
      'तुंबलेले पावसाळी गटार, रस्त्यावरून पाणी वाहत आहे'
    ]
  },
  Streetlight: {
    en: [
      'Entire road stretch completely dark after sunset',
      'Safety hazard for pedestrians, women, and senior citizens',
      'Open feeder pillar box with exposed electrical wires',
      'Flickering lamp pole posing safety risk'
    ],
    mr: [
      'सूर्यास्तानंतर संपूर्ण रस्त्यावर काळोख असतो',
      'महिला, ज्येष्ठ नागरिक व पादचाऱ्यांच्या सुरक्षिततेचा प्रश्न',
      'उघड्या विजेच्या तारांमुळे शॉक लागण्याचा धोका',
      'विजेचा दिवा लुकलुकत असून रात्री भीतीचे वातावरण'
    ]
  },
  Encroachment: {
    en: [
      'Footpath completely blocked by stalls, pedestrians forced onto road',
      'Rusted abandoned vehicle blocking traffic lane for weeks',
      'Unauthorized tin shed erected on public walkway',
      'Commercial banners and advertising boards blocking road visibility'
    ],
    mr: [
      'पदपथावर अनधिकृत स्टॉल्समुळे नागरिकांना रस्त्यावरून चालावे लागत आहे',
      'भंगार बेवारस वाहनामुळे रस्ता कित्येक आठवडे अडवला आहे',
      'सार्वजनिक फुटपाथवर अनधिकृत पत्र्याचे शेड बांधले आहे',
      'मोठ्या जाहिरात फलकांमुळे वळणावर अपघात धोका निर्माण होत आहे'
    ]
  },
  Footpath: {
    en: [
      'Footpath broken and uneven, dangerous for pedestrians',
      'No footpath on this road, pedestrians forced onto traffic',
      'Footpath blocked by vendors and parked vehicles',
      'Footpath tiles missing, creates trip hazard'
    ],
    mr: [
      'पदपथ तुटलेला आणि असमान, पादचाऱ्यांसाठी धोकादायक',
      'या रस्त्यावर पदपथ नाही, पादचारी वाहतुकीत येतात',
      'पदपथ विक्रेते आणि पार्क केलेल्या वाहनांनी अडवला',
      'पदपथाच्या टाइल्स गहाळ, अडखळण्याचा धोका'
    ]
  },
  Garden: {
    en: [
      'Fallen tree completely blocking traffic movement',
      'Dangerous heavy branches can fall on vehicles anytime',
      'Overgrown bushes reducing driver visibility',
      'Public park equipment broken and garden unmaintained'
    ],
    mr: [
      'झाड उन्मळून पडल्यामुळे रस्ता पूर्ण बंद आहे',
      'धोकादायक फांदी कधीही वाहनांवर पडू शकते',
      'झाडेझुडपे वाढल्याने रस्त्यावरील दृश्यमानता कमी',
      'उद्यानातील खेळणी तुटलेली असून अस्वच्छता आहे'
    ]
  },
  Animals: {
    en: [
      'Pack of stray dogs chasing two-wheelers and children',
      'Stray cattle sitting in middle of busy road causing accidents',
      'Injured stray animal in need of urgent veterinary care',
      'Dead animal removal needed immediately'
    ],
    mr: [
      'भटकी कुत्री दुचाकी व लहान मुलांच्या अंगावर धावून जातात',
      'रस्त्याच्या मधोमध जनावरे बसल्याने अपघात होत आहेत',
      'जखमी प्राण्यावर तातडीने उपचारांची गरज आहे',
      'मृत प्राणी तातडीने उचलण्याची आवश्यकता आहे'
    ]
  },
  Pollution: {
    en: [
      'Toxic smoke from open waste burning affecting nearby societies',
      'Heavy construction dust without green net / water sprinkling',
      'Industrial chemical odor causing breathing difficulty in residents',
      'Late-night loudspeaker noise violating permissible hours'
    ],
    mr: [
      'कचरा जाळल्यामुळे विषारी धूर सोसायट्यांमध्ये पसरत आहे',
      'ग्रीन नेट व पाणी न मारल्यामुळे प्रचंड धूळ उडत आहे',
      'कारखान्यांच्या दुर्गंधीमुळे रहिवाशांना श्वास घेण्यास त्रास',
      'रात्री उशिरापर्यंत लाऊडस्पीकर आवाज सुरू असतो'
    ]
  },
  Other: {
    en: [
      'Official Sarathi app & WhatsApp helpline non-functional',
      'Previous ticket marked resolved without any on-ground work',
      'Property tax / water payment receipt not generating after transaction',
      'General civic grievance requiring immediate municipal inspection'
    ],
    mr: [
      'सारथी ॲप आणि व्हॉट्सॲप हेल्पलाइन काम करत नाही',
      'प्रत्यक्ष काम न करताच मागील तक्रार बंद दाखवली',
      'कर भरल्यानंतरही ऑनलाईन पावती जनरेट होत नाही',
      'स्थानिक प्रशासनाने तातडीने पाहणी करून निवारण करावे'
    ]
  }
};

export function getSubTagsForCategory(category: Category, _language?: Language): SubTagTranslation[] {
  return SUB_TAG_TRANSLATIONS[category] || [];
}

/**
 * Returns dynamic, context-aware quick phrases matching the exact sub-tag if available,
 * or falls back to category-level phrases.
 */
export function getDynamicQuickPhrases(
  category: Category,
  subTag: string,
  language: Language
): string[] {
  // Normalize subTag search
  const cleanSubTag = (subTag || '').trim();

  // Try direct sub-tag match
  if (SUBTAG_SPECIFIC_PHRASES[cleanSubTag]) {
    const item = SUBTAG_SPECIFIC_PHRASES[cleanSubTag];
    return language === 'mr' ? item.mr : item.en;
  }

  // Try matching against English equivalent if subTag is in Marathi
  const subTags = SUB_TAG_TRANSLATIONS[category] || [];
  const found = subTags.find(s => s.en === cleanSubTag || s.mr === cleanSubTag);
  if (found && SUBTAG_SPECIFIC_PHRASES[found.en]) {
    const item = SUBTAG_SPECIFIC_PHRASES[found.en];
    return language === 'mr' ? item.mr : item.en;
  }

  // Fallback to category phrases
  const catFallback = QUICK_PHRASES_BY_CATEGORY[category] || QUICK_PHRASES_BY_CATEGORY.Pothole;
  return language === 'mr' ? catFallback.mr : catFallback.en;
}
