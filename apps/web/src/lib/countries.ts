export interface Country {
  code: string;
  flag: string;
  fa: string;
  en: string;
  ar: string;
  hi?: string;
}

export const COUNTRIES: Country[] = [
  {code:'IR',flag:'🇮🇷',fa:'ایران',en:'Iran',ar:'إيران',hi:'ईरान'},
  {code:'TR',flag:'🇹🇷',fa:'ترکیه',en:'Turkey',ar:'تركيا',hi:'तुर्की'},
  {code:'AE',flag:'🇦🇪',fa:'امارات متحده عربی',en:'UAE',ar:'الإمارات',hi:'यूएई'},
  {code:'SA',flag:'🇸🇦',fa:'عربستان سعودی',en:'Saudi Arabia',ar:'السعودية',hi:'सऊदी अरब'},
  {code:'IQ',flag:'🇮🇶',fa:'عراق',en:'Iraq',ar:'العراق',hi:'इराक'},
  {code:'SY',flag:'🇸🇾',fa:'سوریه',en:'Syria',ar:'سوريا',hi:'सीरिया'},
  {code:'AF',flag:'🇦🇫',fa:'افغانستان',en:'Afghanistan',ar:'أفغانستان',hi:'अफगानिस्तान'},
  {code:'PK',flag:'🇵🇰',fa:'پاکستان',en:'Pakistan',ar:'باكستان',hi:'पाकिस्तान'},
  {code:'IN',flag:'🇮🇳',fa:'هند',en:'India',ar:'الهند',hi:'भारत'},
  {code:'CN',flag:'🇨🇳',fa:'چین',en:'China',ar:'الصين',hi:'चीन'},
  {code:'RU',flag:'🇷🇺',fa:'روسیه',en:'Russia',ar:'روسيا',hi:'रूस'},
  {code:'DE',flag:'🇩🇪',fa:'آلمان',en:'Germany',ar:'ألمانيا',hi:'जर्मनी'},
  {code:'FR',flag:'🇫🇷',fa:'فرانسه',en:'France',ar:'فرنسا',hi:'फ्रांस'},
  {code:'GB',flag:'🇬🇧',fa:'بریتانیا',en:'United Kingdom',ar:'المملكة المتحدة',hi:'यूके'},
  {code:'US',flag:'🇺🇸',fa:'ایالات متحده',en:'United States',ar:'الولايات المتحدة',hi:'अमेरिका'},
  {code:'CA',flag:'🇨🇦',fa:'کانادا',en:'Canada',ar:'كندا',hi:'कनाडा'},
  {code:'AU',flag:'🇦🇺',fa:'استرالیا',en:'Australia',ar:'أستراليا',hi:'ऑस्ट्रेलिया'},
  {code:'JP',flag:'🇯🇵',fa:'ژاپن',en:'Japan',ar:'اليابان',hi:'जापान'},
  {code:'KR',flag:'🇰🇷',fa:'کره جنوبی',en:'South Korea',ar:'كوريا الجنوبية',hi:'दक्षिण कोरिया'},
  {code:'IT',flag:'🇮🇹',fa:'ایتالیا',en:'Italy',ar:'إيطاليا',hi:'इटली'},
  {code:'ES',flag:'🇪🇸',fa:'اسپانیا',en:'Spain',ar:'إسبانيا',hi:'स्पेन'},
  {code:'NL',flag:'🇳🇱',fa:'هلند',en:'Netherlands',ar:'هولندا',hi:'नीदरलैंड'},
  {code:'CH',flag:'🇨🇭',fa:'سوئیس',en:'Switzerland',ar:'سويسرا',hi:'स्विट्जरलैंड'},
  {code:'SE',flag:'🇸🇪',fa:'سوئد',en:'Sweden',ar:'السويد',hi:'स्वीडन'},
  {code:'NO',flag:'🇳🇴',fa:'نروژ',en:'Norway',ar:'النرويج',hi:'नॉर्वे'},
  {code:'PL',flag:'🇵🇱',fa:'لهستان',en:'Poland',ar:'بولندا',hi:'पोलैंड'},
  {code:'BR',flag:'🇧🇷',fa:'برزیل',en:'Brazil',ar:'البرازيل',hi:'ब्राजील'},
  {code:'MX',flag:'🇲🇽',fa:'مکزیک',en:'Mexico',ar:'المكسيك',hi:'मेक्सिको'},
  {code:'AR',flag:'🇦🇷',fa:'آرژانتین',en:'Argentina',ar:'الأرجنتين',hi:'अर्जेंटीना'},
  {code:'EG',flag:'🇪🇬',fa:'مصر',en:'Egypt',ar:'مصر',hi:'मिस्र'},
  {code:'ZA',flag:'🇿🇦',fa:'آفریقای جنوبی',en:'South Africa',ar:'جنوب أفريقيا',hi:'दक्षिण अफ्रीका'},
  {code:'NG',flag:'🇳🇬',fa:'نیجریه',en:'Nigeria',ar:'نيجيريا',hi:'नाइजीरिया'},
  {code:'KE',flag:'🇰🇪',fa:'کنیا',en:'Kenya',ar:'كينيا',hi:'केन्या'},
  {code:'GH',flag:'🇬🇭',fa:'غنا',en:'Ghana',ar:'غانا',hi:'घाना'},
  {code:'MA',flag:'🇲🇦',fa:'مراکش',en:'Morocco',ar:'المغرب',hi:'मोरक्को'},
  {code:'TN',flag:'🇹🇳',fa:'تونس',en:'Tunisia',ar:'تونس',hi:'ट्यूनीशिया'},
  {code:'DZ',flag:'🇩🇿',fa:'الجزایر',en:'Algeria',ar:'الجزائر',hi:'अल्जीरिया'},
  {code:'QA',flag:'🇶🇦',fa:'قطر',en:'Qatar',ar:'قطر',hi:'कतर'},
  {code:'KW',flag:'🇰🇼',fa:'کویت',en:'Kuwait',ar:'الكويت',hi:'कुवैत'},
  {code:'BH',flag:'🇧🇭',fa:'بحرین',en:'Bahrain',ar:'البحرين',hi:'बहरीन'},
  {code:'OM',flag:'🇴🇲',fa:'عمان',en:'Oman',ar:'عُمان',hi:'ओमान'},
  {code:'JO',flag:'🇯🇴',fa:'اردن',en:'Jordan',ar:'الأردن',hi:'जॉर्डन'},
  {code:'LB',flag:'🇱🇧',fa:'لبنان',en:'Lebanon',ar:'لبنان',hi:'लेबनान'},
  {code:'AM',flag:'🇦🇲',fa:'ارمنستان',en:'Armenia',ar:'أرمينيا',hi:'आर्मेनिया'},
  {code:'AZ',flag:'🇦🇿',fa:'آذربایجان',en:'Azerbaijan',ar:'أذربيجان',hi:'अज़रबैजान'},
  {code:'GE',flag:'🇬🇪',fa:'گرجستان',en:'Georgia',ar:'جورجيا',hi:'जॉर्जिया'},
  {code:'KZ',flag:'🇰🇿',fa:'قزاقستان',en:'Kazakhstan',ar:'كازاخستان',hi:'कज़ाखस्तान'},
  {code:'UZ',flag:'🇺🇿',fa:'ازبکستان',en:'Uzbekistan',ar:'أوزبكستان',hi:'उज़्बेकिस्तान'},
  {code:'TM',flag:'🇹🇲',fa:'ترکمنستان',en:'Turkmenistan',ar:'تركمانستان',hi:'तुर्कमेनिस्तान'},
  {code:'TJ',flag:'🇹🇯',fa:'تاجیکستان',en:'Tajikistan',ar:'طاجيكستان',hi:'ताजिकिस्तान'},
  {code:'KG',flag:'🇰🇬',fa:'قرقیزستان',en:'Kyrgyzstan',ar:'قيرغيزستان',hi:'किर्गिस्तान'},
  {code:'MN',flag:'🇲🇳',fa:'مغولستان',en:'Mongolia',ar:'منغوليا',hi:'मंगोलिया'},
  {code:'BD',flag:'🇧🇩',fa:'بنگلادش',en:'Bangladesh',ar:'بنغلاديش',hi:'बांग्लादेश'},
  {code:'LK',flag:'🇱🇰',fa:'سری‌لانکا',en:'Sri Lanka',ar:'سريلانكا',hi:'श्रीलंका'},
  {code:'MM',flag:'🇲🇲',fa:'میانمار',en:'Myanmar',ar:'ميانمار',hi:'म्यांमार'},
  {code:'TH',flag:'🇹🇭',fa:'تایلند',en:'Thailand',ar:'تايلاند',hi:'थाईलैंड'},
  {code:'VN',flag:'🇻🇳',fa:'ویتنام',en:'Vietnam',ar:'فيتنام',hi:'वियतनाम'},
  {code:'MY',flag:'🇲🇾',fa:'مالزی',en:'Malaysia',ar:'ماليزيا',hi:'मलेशिया'},
  {code:'ID',flag:'🇮🇩',fa:'اندونزی',en:'Indonesia',ar:'إندونيسيا',hi:'इंडोनेशिया'},
  {code:'PH',flag:'🇵🇭',fa:'فیلیپین',en:'Philippines',ar:'الفلبين',hi:'फिलीपींस'},
  {code:'SG',flag:'🇸🇬',fa:'سنگاپور',en:'Singapore',ar:'سنغافورة',hi:'सिंगापुर'},
  {code:'HK',flag:'🇭🇰',fa:'هنگ‌کنگ',en:'Hong Kong',ar:'هونغ كونغ',hi:'हांगकांग'},
  {code:'TW',flag:'🇹🇼',fa:'تایوان',en:'Taiwan',ar:'تايوان',hi:'ताइवान'},
  {code:'NZ',flag:'🇳🇿',fa:'نیوزیلند',en:'New Zealand',ar:'نيوزيلندا',hi:'न्यूज़ीलैंड'},
  {code:'UA',flag:'🇺🇦',fa:'اوکراین',en:'Ukraine',ar:'أوكرانيا',hi:'यूक्रेन'},
  {code:'PT',flag:'🇵🇹',fa:'پرتغال',en:'Portugal',ar:'البرتغال',hi:'पुर्तगाल'},
  {code:'GR',flag:'🇬🇷',fa:'یونان',en:'Greece',ar:'اليونان',hi:'ग्रीस'},
  {code:'AT',flag:'🇦🇹',fa:'اتریش',en:'Austria',ar:'النمسا',hi:'ऑस्ट्रिया'},
  {code:'BE',flag:'🇧🇪',fa:'بلژیک',en:'Belgium',ar:'بلجيكا',hi:'बेल्जियम'},
  {code:'CZ',flag:'🇨🇿',fa:'چک',en:'Czech Republic',ar:'التشيك',hi:'चेक गणराज्य'},
  {code:'HU',flag:'🇭🇺',fa:'مجارستان',en:'Hungary',ar:'المجر',hi:'हंगरी'},
  {code:'RO',flag:'🇷🇴',fa:'رومانی',en:'Romania',ar:'رومانيا',hi:'रोमानिया'},
  {code:'BG',flag:'🇧🇬',fa:'بلغارستان',en:'Bulgaria',ar:'بلغاريا',hi:'बुल्गारिया'},
  {code:'FI',flag:'🇫🇮',fa:'فنلاند',en:'Finland',ar:'فنلندا',hi:'फिनलैंड'},
  {code:'DK',flag:'🇩🇰',fa:'دانمارک',en:'Denmark',ar:'الدنمارك',hi:'डेनमार्क'},
  {code:'IE',flag:'🇮🇪',fa:'ایرلند',en:'Ireland',ar:'أيرلندا',hi:'आयरलैंड'},
  {code:'CL',flag:'🇨🇱',fa:'شیلی',en:'Chile',ar:'تشيلي',hi:'चिली'},
  {code:'CO',flag:'🇨🇴',fa:'کلمبیا',en:'Colombia',ar:'كولومبيا',hi:'कोलंबिया'},
  {code:'PE',flag:'🇵🇪',fa:'پرو',en:'Peru',ar:'بيرو',hi:'पेरू'},
  {code:'NP',flag:'🇳🇵',fa:'نپال',en:'Nepal',ar:'نيبال',hi:'नेपाल'},
];

export function getCountryName(code: string, lang: string): string {
  const c = COUNTRIES.find(x => x.code === code);
  if (!c) return code;
  return (c as any)[lang] || c.fa;
}

export function getCountryByCode(code: string): Country | undefined {
  return COUNTRIES.find(x => x.code === code);
}
