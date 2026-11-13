// Official Elected Corporators (नगरसेवक) from PCMC Portal
// Source: https://www.pcmcindia.gov.in/corporator

export interface CorporatorInfo {
  seat: 'A' | 'B' | 'C' | 'D';
  name: string;        // Official Marathi name
  nameEn: string;      // English Romanized name
  phone: string;
  profileUrl: string;
}

export const PCMC_CORPORATORS: Record<number, CorporatorInfo[]> = {
  "1": [
    {
      "seat": "A",
      "name": "विकास नामदेव साने",
      "phone": "9922399699",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=277",
      "nameEn": "Vikas Namdev Sane"
    },
    {
      "seat": "B",
      "name": "सोनम विनायक मोरे",
      "phone": "8805350909",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=281",
      "nameEn": "Sonam Vinayak More"
    },
    {
      "seat": "C",
      "name": "संगिता प्रभाकर ताम्हाणे",
      "phone": "9763385586",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=285",
      "nameEn": "Sangita Prabhakar Tamhane"
    },
    {
      "seat": "D",
      "name": "यश दत्तात्रय साने",
      "phone": "8381099699",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=286",
      "nameEn": "Yash Dattatraya Sane"
    }
  ],
  "2": [
    {
      "seat": "A",
      "name": "सुजाता निलेश बोराटे",
      "phone": "9096330431",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=288",
      "nameEn": "Sujata Nilesh Borate"
    },
    {
      "seat": "B",
      "name": "सारिका नितिन बो-हाडे",
      "phone": "9372515505",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=291",
      "nameEn": "Sarika Nitin Borhade"
    },
    {
      "seat": "C",
      "name": "राहुल गुलाब जाधव",
      "phone": "9665463636",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=293",
      "nameEn": "Rahul Gulab Jadhav"
    },
    {
      "seat": "D",
      "name": "निखिल शिवाजी बो-हाडे",
      "phone": "9422450101",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=295",
      "nameEn": "Nikhil Shivaji Borhade"
    }
  ],
  "3": [
    {
      "seat": "A",
      "name": "सारीका रविंद्र गायकवाड",
      "phone": "9552516519",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=297",
      "nameEn": "Sarika Ravindra Gayakavada"
    },
    {
      "seat": "B",
      "name": "नितीन (आप्पा) काळजे",
      "phone": "9850502900",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=298",
      "nameEn": "Nitina (Aappa) Kalaje"
    },
    {
      "seat": "C",
      "name": "अर्चना राजेश सस्ते",
      "phone": "7972283904",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=301",
      "nameEn": "Archana Rajesha Saste"
    },
    {
      "seat": "D",
      "name": "सचिन (भाऊ) तापकीर",
      "phone": "9881359535",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=302",
      "nameEn": "Sachina (bhaU) Tapakira"
    }
  ],
  "4": [
    {
      "seat": "A",
      "name": "श्रुती विकास डोळस",
      "phone": "9890972639",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=305",
      "nameEn": "Shruti Vikasa Dolasa"
    },
    {
      "seat": "B",
      "name": "कृष्णा भिकाजी सुरकुले",
      "phone": "8975913827",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=309",
      "nameEn": "Krishna Bhikaji Surakule"
    },
    {
      "seat": "C",
      "name": "नानी उर्फ हिराबाई गोवर्धन घुले",
      "phone": "9765000678",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=314",
      "nameEn": "Nani Urpha HirabaI Govardhana Ghule"
    },
    {
      "seat": "D",
      "name": "उदय दत्तात्रय गायकवाड",
      "phone": "8806503033",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=318",
      "nameEn": "Udaya Dattatraya Gayakavada"
    }
  ],
  "5": [
    {
      "seat": "A",
      "name": "भिमाबाई पोपट फुगे",
      "phone": "9881248485",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=320",
      "nameEn": "BhimabaI Popata Phuge"
    },
    {
      "seat": "B",
      "name": "सागर बाळासाहेब गवळी",
      "phone": "9822140777",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=325",
      "nameEn": "Sagara Balasaheba Gavali"
    },
    {
      "seat": "C",
      "name": "कविता भोंगाळे",
      "phone": "7447435970",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=329",
      "nameEn": "Kavita Bhongale"
    },
    {
      "seat": "D",
      "name": "जालींधर  किसन शिंदे",
      "phone": "7474435970",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=332",
      "nameEn": "Jalindhara Kisana Shinde"
    }
  ],
  "6": [
    {
      "seat": "A",
      "name": "रेखा देवराम देवकर",
      "phone": "7276936348",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=341",
      "nameEn": "Rekha Devarama Devakara"
    },
    {
      "seat": "B",
      "name": "रवि बाबासाहेब लांडगे (महापौर)",
      "phone": "9011827878",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=343",
      "nameEn": "Ravi Babasaheba Landage (mahapaur)"
    },
    {
      "seat": "C",
      "name": "राजश्री राजेंद्र लांडगे",
      "phone": "9881715599",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=345",
      "nameEn": "Rajashri Rajendra Landage"
    },
    {
      "seat": "D",
      "name": "योगेश सोपान लांडगे",
      "phone": "8888399993",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=348",
      "nameEn": "Yogesha Sopana Landage"
    }
  ],
  "7": [
    {
      "seat": "A",
      "name": "विराज विश्वनाथ लांडे",
      "phone": "9970017001",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=356",
      "nameEn": "Viraja Vishvanatha Lande"
    },
    {
      "seat": "B",
      "name": "प्रा. सोनाली दत्तात्रय गव्हाणे",
      "phone": "8446000239",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=358",
      "nameEn": "Pra. Sonali Dattatraya Gavhane"
    },
    {
      "seat": "C",
      "name": "राणी माई अशोक पठारे",
      "phone": "8600777667",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=362",
      "nameEn": "Rani MaI Ashoka Pathare"
    },
    {
      "seat": "D",
      "name": "अँड. नितिन ज्ञानेश्वर लांडगे",
      "phone": "7350063000",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=365",
      "nameEn": "Aँd. Nitina Jnyaneshvara Landage"
    }
  ],
  "8": [
    {
      "seat": "A",
      "name": "सुहास लक्ष्मण कांबळे",
      "phone": "9890833833",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=369",
      "nameEn": "Suhasa Lakshmana Kanbale"
    },
    {
      "seat": "B",
      "name": "नम्रता योगेश लोंढे",
      "phone": "9049741010",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=372",
      "nameEn": "Namrata Yogesha Londhe"
    },
    {
      "seat": "C",
      "name": "अश्विनी संजय वाबळे",
      "phone": "8605669990",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=378",
      "nameEn": "Ashvini Snjaya Vabale"
    },
    {
      "seat": "D",
      "name": "तुषार भिवाजी सहाणे",
      "phone": "9850055169",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=380",
      "nameEn": "Tushara Bhivaji Sahane"
    }
  ],
  "9": [
    {
      "seat": "A",
      "name": "सिध्दार्थ अण्णा बनसोडे",
      "phone": "8975177008",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=383",
      "nameEn": "Sidhdartha Anna Banasode"
    },
    {
      "seat": "B",
      "name": "डॉ. वैशाली घोडेकर (लोंढे)",
      "phone": "9822733111",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=384",
      "nameEn": "Dॉ. Vaishali Ghodekara (londhe)"
    },
    {
      "seat": "C",
      "name": "सारीका विशाल मासुळकर",
      "phone": "9923937799",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=385",
      "nameEn": "Sarika Vishala Masulakara"
    },
    {
      "seat": "D",
      "name": "राहुल हनुमंतराव भोसले",
      "phone": "9970222222",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=386",
      "nameEn": "Rahula Hanumntarava Bhosale"
    }
  ],
  "10": [
    {
      "seat": "A",
      "name": "अनुराधा गणपत गोरखे",
      "phone": "7887887978",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=387",
      "nameEn": "Anuradha Ganapata Gorakhe"
    },
    {
      "seat": "B",
      "name": "सुप्रिया महेश चांदगुडे",
      "phone": "9881097998",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=388",
      "nameEn": "Supriya Mahesha Chandagude"
    },
    {
      "seat": "C",
      "name": "कुशाग्र अशोक कदम",
      "phone": "9850070707",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=389",
      "nameEn": "Kushagra Ashoka Kadama"
    },
    {
      "seat": "D",
      "name": "तुषार रघुनाथ हिंगे",
      "phone": "9890909090",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=390",
      "nameEn": "Tushara Raghunatha Hinge"
    }
  ],
  "11": [
    {
      "seat": "A",
      "name": "कुंदन अंबादास गायकवाड",
      "phone": "9890359999",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=279",
      "nameEn": "Kundana Anbadasa Gayakavada"
    },
    {
      "seat": "B",
      "name": "रिटा सचिन सानप",
      "phone": "7276292697",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=280",
      "nameEn": "Rita Sachina Sanapa"
    },
    {
      "seat": "C",
      "name": "योगीता ज्ञानेश्वर नागरगोजे",
      "phone": "9552521293",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=282",
      "nameEn": "Yogita Jnyaneshvara Nagaragoje"
    },
    {
      "seat": "D",
      "name": "निलेश मधुकर नेवाळे",
      "phone": "9890395970",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=283",
      "nameEn": "Nilesha Madhukara Nevale"
    }
  ],
  "12": [
    {
      "seat": "A",
      "name": "प्रविण महादेव भालेकर",
      "phone": "9822194933",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=304",
      "nameEn": "Pravina Mahadeva Bhalekara"
    },
    {
      "seat": "B",
      "name": "शितल धनंजय वर्णेकर",
      "phone": "9762047861",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=307",
      "nameEn": "Shitala Dhannjaya Varnekara"
    },
    {
      "seat": "C",
      "name": "शिवानी दादासाहेब नरळे",
      "phone": "8308364730",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=308",
      "nameEn": "Shivani Dadasaheba Narale"
    },
    {
      "seat": "D",
      "name": "पंकज दत्तात्रय भालेकर",
      "phone": "9822455151",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=311",
      "nameEn": "Pnkaja Dattatraya Bhalekara"
    }
  ],
  "13": [
    {
      "seat": "A",
      "name": "अनिल अभिमान घोलप",
      "phone": "9822525270",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=313",
      "nameEn": "Anila Abhimana Gholapa"
    },
    {
      "seat": "B",
      "name": "अर्चना अक्षय करांडे",
      "phone": "8796525691",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=315",
      "nameEn": "Archana Akshaya Karande"
    },
    {
      "seat": "C",
      "name": "सुलभा रामभाऊ उबाळे",
      "phone": "9850240999",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=316",
      "nameEn": "Sulabha RamabhaU Ubale"
    },
    {
      "seat": "D",
      "name": "उत्तमराव प्रकाश केंदळे",
      "phone": "9822517144",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=321",
      "nameEn": "Uttamarava Prakasha Kendale"
    }
  ],
  "14": [
    {
      "seat": "A",
      "name": "कैलास गणपत कुटे",
      "phone": "9011761111",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=323",
      "nameEn": "Kailasa Ganapata Kute"
    },
    {
      "seat": "B",
      "name": "वैशाली जालिंदर काळभोर",
      "phone": "9860491241",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=324",
      "nameEn": "Vaishali Jalindara Kalabhora"
    },
    {
      "seat": "C",
      "name": "अरुणा गणेश लंगोटे",
      "phone": "9527237850",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=327",
      "nameEn": "Aruna Ganesha Lngote"
    },
    {
      "seat": "D",
      "name": "प्रमोद कुटे",
      "phone": "9850502745",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=328",
      "nameEn": "Pramoda Kute"
    }
  ],
  "15": [
    {
      "seat": "A",
      "name": "राजू मिसाळ",
      "phone": "9850911011",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=330",
      "nameEn": "Raju Misala"
    },
    {
      "seat": "B",
      "name": "शैलजा अविनाश मोरे",
      "phone": "9823074738",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=331",
      "nameEn": "Shailaja Avinasha More"
    },
    {
      "seat": "C",
      "name": "शर्मिला राजू बाबर (उप-महापौर)",
      "phone": "7887887922",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=333",
      "nameEn": "Sharmila Raju Babara (Up-mahapaur)"
    },
    {
      "seat": "D",
      "name": "अमित राजेंद्र गावडे",
      "phone": "9890077799",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=334",
      "nameEn": "Amita Rajendra Gavade"
    }
  ],
  "16": [
    {
      "seat": "A",
      "name": "धर्मपाल यशवंतराव तंतरपाळे",
      "phone": "9822475696",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=335",
      "nameEn": "Dharmapal Yashwantrao Tantarpale"
    },
    {
      "seat": "B",
      "name": "ऐश्वर्या राजेंद्र तरस",
      "phone": "9922579999",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=337",
      "nameEn": "Aishwarya Rajendra Taras"
    },
    {
      "seat": "C",
      "name": "रेश्मा बापुजी कातळे",
      "phone": "8975593838",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=339",
      "nameEn": "Reshma Bapuji Katale"
    },
    {
      "seat": "D",
      "name": "निलेश गुलाब तरस",
      "phone": "9921202164",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=346",
      "nameEn": "Nilesh Gulab Taras"
    }
  ],
  "17": [
    {
      "seat": "A",
      "name": "आशा ज्ञानेश्वर सुर्यवंशी",
      "phone": "9922501629",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=349",
      "nameEn": "Asha Dnyaneshwar Suryawanshi"
    },
    {
      "seat": "B",
      "name": "भाऊसाहेब सोपानराव भोईर (विरोधी पक्षनेता)",
      "phone": "9860135555",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=350",
      "nameEn": "BhaUsaheba Sopanarava BhoIra (virodhi Pakshaneta)"
    },
    {
      "seat": "C",
      "name": "पल्लवी सुधीर वाल्हेकर",
      "phone": "7744050868",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=351",
      "nameEn": "Pallavi Sudhir Walhekar"
    },
    {
      "seat": "D",
      "name": "शेखर बबन चिंचवडे",
      "phone": "9881490123",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=353",
      "nameEn": "Shekhar Baban Chinchwade"
    }
  ],
  "18": [
    {
      "seat": "A",
      "name": "अपर्णा निलेश डोके",
      "phone": "9823546014",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=354",
      "nameEn": "Aparna Nilesha Doke"
    },
    {
      "seat": "B",
      "name": "मनिषा योगेश चिंचवडे",
      "phone": "7057998020",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=357",
      "nameEn": "Manisha Yogesha Chinchavade"
    },
    {
      "seat": "C",
      "name": "अनंत सुभाष को-हाळे",
      "phone": "9850905070",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=359",
      "nameEn": "Annta Subhasha Ko-hale"
    },
    {
      "seat": "D",
      "name": "सुरेश शिवाजी भोईर",
      "phone": "9822021892",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=361",
      "nameEn": "Suresha Shivaji BhoIra"
    }
  ],
  "19": [
    {
      "seat": "A",
      "name": "मधुरा नेताजी शिंदे",
      "phone": "8857058263",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=363",
      "nameEn": "Madhura Netaji Shinde"
    },
    {
      "seat": "B",
      "name": "शितल उर्फ विजय गोरख शिंदे",
      "phone": "9850905033",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=366",
      "nameEn": "Shitala Urpha Vijaya Gorakha Shinde"
    },
    {
      "seat": "C",
      "name": "सविता धनराज आसवानी",
      "phone": "9370762281",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=368",
      "nameEn": "Savita Dhanaraja Aasavani"
    },
    {
      "seat": "D",
      "name": "मंदार देशपांडे",
      "phone": "9822773211",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=371",
      "nameEn": "Mndara Deshapande"
    }
  ],
  "20": [
    {
      "seat": "A",
      "name": "जितेंद्र बाबासाहेब ननावरे",
      "phone": "9096003999",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=373",
      "nameEn": "Jitendra Babasaheba Nanavare"
    },
    {
      "seat": "B",
      "name": "मनिषा शाम लांडे",
      "phone": "9850987007",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=375",
      "nameEn": "Manisha Shama Lande"
    },
    {
      "seat": "C",
      "name": "वर्षा सर्जेराव जगताप",
      "phone": "9970037513",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=377",
      "nameEn": "Varsha Sarjerava Jagatapa"
    },
    {
      "seat": "D",
      "name": "योगेश मंगलसेन बहल",
      "phone": "9881232320",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=379",
      "nameEn": "Yogesha Mngalasena Bahala"
    }
  ],
  "21": [
    {
      "seat": "A",
      "name": "निकिता अर्जुन कदम",
      "phone": "9890116611",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=275",
      "nameEn": "Nikita Arjuna Kadama"
    },
    {
      "seat": "B",
      "name": "संदीप बाळकृष्ण वाघेरे",
      "phone": "9822025259",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=276",
      "nameEn": "Sndipa Balakrishna Vaghere"
    },
    {
      "seat": "C",
      "name": "प्रियांका सुनील कुदळे",
      "phone": "9921104858",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=278",
      "nameEn": "Priyanka Sunila Kudale"
    },
    {
      "seat": "D",
      "name": "डब्बु आसवानी (हीरानंद)",
      "phone": "9822867070",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=284",
      "nameEn": "Dabbu Aasavani (hirannd)"
    }
  ],
  "22": [
    {
      "seat": "A",
      "name": "निता विलास पाडाळे",
      "phone": "9850905053",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=287",
      "nameEn": "Nita Vilasa Padale"
    },
    {
      "seat": "B",
      "name": "कोमल सचिन काळे",
      "phone": "9011575600",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=289",
      "nameEn": "Komala Sachina Kale"
    },
    {
      "seat": "C",
      "name": "विनोद जयवंत नढे",
      "phone": "9011111711",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=290",
      "nameEn": "Vinoda Jayavnta Nadhe"
    },
    {
      "seat": "D",
      "name": "संतोष अंकुश कोकणे",
      "phone": "9922502222",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=292",
      "nameEn": "Sntosha Ankusha Kokane"
    }
  ],
  "23": [
    {
      "seat": "A",
      "name": "मनिषा प्रमोद पवार",
      "phone": "9823128282",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=294",
      "nameEn": "Manisha Pramoda Pavara"
    },
    {
      "seat": "B",
      "name": "तानाजी हरिभाऊ बारणे",
      "phone": "9545047777",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=296",
      "nameEn": "Tanaji HaribhaU Barane"
    },
    {
      "seat": "C",
      "name": "योगिता महेश बारणे",
      "phone": "9156182001",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=299",
      "nameEn": "Yogita Mahesha Barane"
    },
    {
      "seat": "D",
      "name": "अभिषेक गोविंद बारणे",
      "phone": "9922411396",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=300",
      "nameEn": "Abhisheka Govinda Barane"
    }
  ],
  "24": [
    {
      "seat": "A",
      "name": "विश्वजीत श्रीरंग बारणे",
      "phone": "9422027333",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=303",
      "nameEn": "Vishvajita Shrirnga Barane"
    },
    {
      "seat": "B",
      "name": "शालीनीताई कांतीलाल गुजर",
      "phone": "9011812222",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=306",
      "nameEn": "ShalinitaI Kantilala Gujara"
    },
    {
      "seat": "C",
      "name": "माया संतोष बारणे",
      "phone": "9604874643",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=310",
      "nameEn": "Maya Sntosha Barane"
    },
    {
      "seat": "D",
      "name": "निलेश हिरामण बारणे",
      "phone": "8551000027",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=312",
      "nameEn": "Nilesha Hiramana Barane"
    }
  ],
  "25": [
    {
      "seat": "A",
      "name": "कुणाल वैजनाथ वाव्हळकर",
      "phone": "9850583093",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=317",
      "nameEn": "Kunala Vaijanatha Vavhalakara"
    },
    {
      "seat": "B",
      "name": "रेश्मा चेतन भुजबळ",
      "phone": "9767839090",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=319",
      "nameEn": "Reshma Chetana Bhujabala"
    },
    {
      "seat": "C",
      "name": "श्रुती राम वाकडकर",
      "phone": "9922522007",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=322",
      "nameEn": "Shruti Rama Vakadakara"
    },
    {
      "seat": "D",
      "name": "राहुल तानाजी कलाटे",
      "phone": "9822058992",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=326",
      "nameEn": "Rahula Tanaji Kalate"
    }
  ],
  "26": [
    {
      "seat": "A",
      "name": "ॲड. विनायक गायकवाड",
      "phone": "9673006363",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=336",
      "nameEn": "ॲd. Vinayaka Gayakavada"
    },
    {
      "seat": "B",
      "name": "आरती सुरेश चोंधे",
      "phone": "9011991010",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=338",
      "nameEn": "Aarati Suresha Chondhe"
    },
    {
      "seat": "C",
      "name": "स्नेहा रणजित कलाटे",
      "phone": "6399597155",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=340",
      "nameEn": "Sneha Ranajita Kalate"
    },
    {
      "seat": "D",
      "name": "संदिप अरुण कस्पटे",
      "phone": "9923524444",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=342",
      "nameEn": "Sndipa Aruna Kaspate"
    }
  ],
  "27": [
    {
      "seat": "A",
      "name": "बाबासाहेब (बाबा ) त्रिभुवन",
      "phone": "9922420770",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=344",
      "nameEn": "Babasaheba (baba ) Tribhuvana"
    },
    {
      "seat": "B",
      "name": "सविता बाळकृष्ण खुळे",
      "phone": "9822737749",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=347",
      "nameEn": "Savita Balakrishna Khule"
    },
    {
      "seat": "C",
      "name": "अर्चना विनोद तापकीर",
      "phone": "9822978997",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=352",
      "nameEn": "Archana Vinoda Tapakira"
    },
    {
      "seat": "D",
      "name": "सागर खंडूशेठ कोकणे",
      "phone": "9922004007",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=355",
      "nameEn": "Sagara Khndushetha Kokane"
    }
  ],
  "28": [
    {
      "seat": "A",
      "name": "बापू उर्फ शत्रुघ्न सिताराम काटे",
      "phone": "9850598100",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=360",
      "nameEn": "Bapu Urpha Shatrughna Sitarama Kate"
    },
    {
      "seat": "B",
      "name": "अनिता संदिप काटे",
      "phone": "9850045124",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=364",
      "nameEn": "Anita Sndipa Kate"
    },
    {
      "seat": "C",
      "name": "कुंदा संजय भिसे",
      "phone": "9921607777",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=367",
      "nameEn": "Kunda Snjaya Bhise"
    },
    {
      "seat": "D",
      "name": "विठ्ठल उर्फ नाना काटे",
      "phone": "9011115555",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=370",
      "nameEn": "Viththala Urpha Nana Kate"
    }
  ],
  "29": [
    {
      "seat": "A",
      "name": "रविना सागर आंगोळकर",
      "phone": "9075080926",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=374",
      "nameEn": "Ravina Sagara Aangolakara"
    },
    {
      "seat": "B",
      "name": "शकुंतला भाऊसाहेब धराडे",
      "phone": "9922501591",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=376",
      "nameEn": "Shakuntala BhaUsaheba Dharade"
    },
    {
      "seat": "C",
      "name": "शशिकांत गणपत कदम",
      "phone": "9822434134",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=381",
      "nameEn": "Shashikanta Ganapata Kadama"
    },
    {
      "seat": "D",
      "name": "शाम शांताराम जगताप",
      "phone": "9822682856",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=382",
      "nameEn": "Shama Shantarama Jagatapa"
    }
  ],
  "30": [
    {
      "seat": "A",
      "name": "राजू विश्वनाथ बनसोडे",
      "phone": "7350792005",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=391",
      "nameEn": "Raju Vishvanatha Banasode"
    },
    {
      "seat": "B",
      "name": "प्रतिक्षा राजेंद्र लांघी -जवळकर",
      "phone": "8999556576",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=392",
      "nameEn": "Pratiksha Rajendra Langhi -javalakara"
    },
    {
      "seat": "C",
      "name": "स्वाती (माई) चंद्रकांत काटे",
      "phone": "9890218682",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=393",
      "nameEn": "Svati (maI) Chndrakanta Kate"
    },
    {
      "seat": "D",
      "name": "संजय (नाना) काटे",
      "phone": "9422302315",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=394",
      "nameEn": "Snjaya (nana) Kate"
    }
  ],
  "31": [
    {
      "seat": "A",
      "name": "दिप्ती अंबरनाथ कांबळे",
      "phone": "7385985158",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=395",
      "nameEn": "Dipti Anbaranatha Kanbale"
    },
    {
      "seat": "B",
      "name": "ज्ञानेश्वर बट्टुराव जगताप",
      "phone": "9822509394",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=396",
      "nameEn": "Jnyaneshvara Batturava Jagatapa"
    },
    {
      "seat": "C",
      "name": "पल्लवी महेश जगताप",
      "phone": "9881913408",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=397",
      "nameEn": "Pallavi Mahesha Jagatapa"
    },
    {
      "seat": "D",
      "name": "नवनाथ दत्तु जगताप",
      "phone": "9689996899",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=398",
      "nameEn": "Navanatha Dattu Jagatapa"
    }
  ],
  "32": [
    {
      "seat": "A",
      "name": "तृप्ती संतोष कांबळे",
      "phone": "9890313333",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=399",
      "nameEn": "Tripti Sntosha Kanbale"
    },
    {
      "seat": "B",
      "name": "हर्षल मश्चिद्र ढोरे",
      "phone": "9765108999",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=400",
      "nameEn": "Harshala Mashchidra Dhore"
    },
    {
      "seat": "C",
      "name": "उज्वला सुनिल ढोरे",
      "phone": "9881470269",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=401",
      "nameEn": "Ujvala Sunila Dhore"
    },
    {
      "seat": "D",
      "name": "प्रशांत शितोळे (सभागृह नेता )",
      "phone": "9922501688",
      "profileUrl": "https://www.pcmcindia.gov.in/corporator-details?Id=402",
      "nameEn": "Prashanta Shitole (sabhagriha Neta )"
    }
  ]
};

export function getCorporatorsForWard(wardNo: number | string): CorporatorInfo[] {
  const num = typeof wardNo === 'string' ? parseInt(wardNo.replace(/[^0-9]/g, ''), 10) : Number(wardNo);
  if (!num || isNaN(num)) return PCMC_CORPORATORS[16] || [];
  return PCMC_CORPORATORS[num] || [];
}
