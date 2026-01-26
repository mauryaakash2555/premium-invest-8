export type Lang = "en" | "hi" | "mr" | "gu";

export const LANG_OPTIONS: Array<{ k: Lang; label: string; nativeLabel: string }> = [
  { k: "en", label: "English", nativeLabel: "English" },
  { k: "hi", label: "Hindi", nativeLabel: "हिन्दी" },
  { k: "mr", label: "Marathi", nativeLabel: "मराठी" },
  { k: "gu", label: "Gujarati", nativeLabel: "ગુજરાતી" },
];

export function isLang(v: string | null | undefined): v is Lang {
  return v === "en" || v === "hi" || v === "mr" || v === "gu";
}

const STRINGS = {
  en: {
    "page.badgeTitle": "SIP vs Panic Selling",
    "page.badgeSubtitle": "Education-only simulator",
    "page.partner": "Partner: {{partner}}",
    "page.title": "What Happens If You Stop SIP During a Market Crash?",
    "page.subtitle": "Compare calm investing vs panic-selling, and see the post-tax cost — month by month.",

    "lang.label": "Language",

    "quiz.cardTitle": "🎯 Quick behavioral quiz (2 min)",
    "quiz.cardSubtitle": "Personalized recommendations based on your profile. You can skip and take it later.",
    "quiz.show": "Take quiz",
    "quiz.hide": "Hide quiz",
    "quiz.tip": "Tip: If you don’t have time now, come back after you see your first results.",

    "crash.title": "Replay market crashes (illustrative)",
    "crash.subtitle": "Choose a crash-style path to see behavior under stress. Education-only, not historical index data.",
    "crash.default": "Default (Education)",
    "crash.2008": "2008-like (-60%)",
    "crash.2020": "2020-like (-40%)",
    "crash.2022": "2022-like (-18%)",

    "risk.title": "How do you feel about market downturns?",
    "risk.subtitle": "Used to personalize insights — not a product recommendation.",
    "risk.conservative": "Conservative",
    "risk.moderate": "Moderate",
    "risk.aggressive": "Aggressive",

    "scenario.title": "Scenarios",
    "scenario.subtitle": "Choose which investor behaviors to compare.",
    "scenario.more": "More options",
    "scenario.hideMore": "Hide more options",
    "scenario.createCustom": "⚙️ + Create Custom Scenario",
    "scenario.customTooltip": "Define exactly when you’d stop SIP and how many months to auto-resume.",

    "taxMode.title": "Tax calculation mode",
    "taxMode.subtitle": "Choose a simplified tax method for learning. LTCG applies if held > 1 year. Consult your CA for actual tax liability.",
    "taxMode.conservativeTitle": "Conservative (STCG - 30% flat)",
    "taxMode.conservativeDesc": "Assumes a higher tax rate (worst-case style).",
    "taxMode.optimizedTitle": "Optimized (LTCG - 20% with indexation)",
    "taxMode.optimizedDesc": "Applies a simple indexation approximation before taxing gains.",
    "taxMode.disclaimerTitle": "Disclaimer",
    "taxMode.disclaimerBody": "Rules vary by instrument type, holding period, and changes in law. This simulator is education-only.",

    "quiz.title": "Your Behavioral Profile (5-question quiz)",
    "quiz.subtitle": "Answer quickly — your first instinct is usually your real instinct.",
    "quiz.apply": "Apply recommended scenario",
    "quiz.completeHint": "Answer all questions to see your profile.",
    "quiz.predicted": "Your predicted behavior",
    "quiz.panicAround": "You would likely panic around a {{pct}}% fall.",
  },
  hi: {
    "page.badgeTitle": "SIP बनाम Panic Selling",
    "page.badgeSubtitle": "केवल शिक्षा हेतु सिम्युलेटर",
    "page.partner": "साझेदार: {{partner}}",
    "page.title": "अगर मार्केट क्रैश में आप SIP रोक दें तो क्या होगा?",
    "page.subtitle": "शांत निवेश बनाम घबराकर रोकना—और पोस्ट-टैक्स लागत (महीने दर महीने) देखें।",

    "lang.label": "भाषा",

    "quiz.cardTitle": "🎯 छोटा व्यवहार क्विज़ (2 मिनट)",
    "quiz.cardSubtitle": "आपकी प्रोफ़ाइल के आधार पर व्यक्तिगत सुझाव। चाहें तो अभी छोड़ सकते हैं।",
    "quiz.show": "क्विज़ लें",
    "quiz.hide": "क्विज़ छुपाएँ",
    "quiz.tip": "टिप: अभी समय नहीं है तो पहली रिपोर्ट देखने के बाद वापस आएँ।",

    "crash.title": "मार्केट क्रैश (उदाहरण)",
    "crash.subtitle": "तनाव के समय व्यवहार समझने के लिए क्रैश-स्टाइल पाथ चुनें। यह ऐतिहासिक इंडेक्स डेटा नहीं है।",
    "crash.default": "डिफ़ॉल्ट (शिक्षा)",
    "crash.2008": "2008-जैसा (-60%)",
    "crash.2020": "2020-जैसा (-40%)",
    "crash.2022": "2022-जैसा (-18%)",

    "risk.title": "मार्केट गिरावट पर आप कैसा महसूस करते हैं?",
    "risk.subtitle": "इंसाइट्स को पर्सनलाइज़ करने के लिए — यह उत्पाद सलाह नहीं है।",
    "risk.conservative": "सावधान",
    "risk.moderate": "मध्यम",
    "risk.aggressive": "आक्रामक",

    "scenario.title": "परिदृश्य",
    "scenario.subtitle": "तुलना के लिए निवेशक व्यवहार चुनें।",
    "scenario.more": "और विकल्प",
    "scenario.hideMore": "अतिरिक्त विकल्प छुपाएँ",
    "scenario.createCustom": "⚙️ + कस्टम परिदृश्य बनाएँ",
    "scenario.customTooltip": "आप कब SIP रोकेंगे और कितने महीनों बाद फिर शुरू करेंगे, यह तय करें।",

    "taxMode.title": "टैक्स गणना मोड",
    "taxMode.subtitle": "सीखने के लिए एक सरल टैक्स तरीका चुनें। 1 वर्ष से अधिक होल्डिंग पर LTCG लागू हो सकता है।",
    "taxMode.conservativeTitle": "कंज़र्वेटिव (STCG - 30% फ्लैट)",
    "taxMode.conservativeDesc": "उच्च टैक्स दर मानता है (वर्स्ट-केस स्टाइल)।",
    "taxMode.optimizedTitle": "ऑप्टिमाइज़्ड (LTCG - 20% इंडेक्सेशन के साथ)",
    "taxMode.optimizedDesc": "टैक्स से पहले इंडेक्सेशन का सरल अनुमान लागू करता है।",
    "taxMode.disclaimerTitle": "अस्वीकरण",
    "taxMode.disclaimerBody": "नियम इंस्ट्रूमेंट, होल्डिंग पीरियड और कानून बदलावों पर निर्भर हैं। यह शिक्षा हेतु है।",

    "quiz.title": "आपकी व्यवहार प्रोफ़ाइल (5 प्रश्न)",
    "quiz.subtitle": "जल्दी जवाब दें — पहली प्रतिक्रिया अक्सर असली होती है।",
    "quiz.apply": "सुझाया गया परिदृश्य लागू करें",
    "quiz.completeHint": "प्रोफ़ाइल देखने के लिए सभी प्रश्नों के उत्तर दें।",
    "quiz.predicted": "अनुमानित व्यवहार",
    "quiz.panicAround": "आप लगभग {{pct}}% गिरावट पर घबरा सकते हैं।",
  },
  mr: {
    "page.badgeTitle": "SIP विरुद्ध Panic Selling",
    "page.badgeSubtitle": "फक्त शिक्षणासाठी सिम्युलेटर",
    "page.partner": "भागीदार: {{partner}}",
    "page.title": "मार्केट क्रॅशमध्ये तुम्ही SIP थांबवल्यास काय होईल?",
    "page.subtitle": "शांत गुंतवणूक विरुद्ध घाबरून थांबवणे — आणि पोस्ट-टॅक्स खर्च महिन्यानुसार पहा.",

    "lang.label": "भाषा",

    "quiz.cardTitle": "🎯 जलद व्यवहार क्विझ (2 मिनिटे)",
    "quiz.cardSubtitle": "तुमच्या प्रोफाईलवर आधारित वैयक्तिक शिफारसी. हवे असल्यास नंतर करू शकता.",
    "quiz.show": "क्विझ घ्या",
    "quiz.hide": "क्विझ लपवा",
    "quiz.tip": "टीप: आत्ता वेळ नसेल तर पहिली परिणामं पाहिल्यावर परत या.",

    "crash.title": "मार्केट क्रॅश (उदाहरण)",
    "crash.subtitle": "ताणाच्या काळात वर्तन पाहण्यासाठी क्रॅश-स्टाईल पाथ निवडा. हे ऐतिहासिक इंडेक्स डेटा नाही.",
    "crash.default": "डीफॉल्ट (शिक्षण)",
    "crash.2008": "2008-सारखा (-60%)",
    "crash.2020": "2020-सारखा (-40%)",
    "crash.2022": "2022-सारखा (-18%)",

    "risk.title": "मार्केट घसरल्यावर तुम्हाला कसे वाटते?",
    "risk.subtitle": "इन्साईट्स पर्सनलाइझ करण्यासाठी — उत्पादन शिफारस नाही.",
    "risk.conservative": "कन्झर्व्हेटिव्ह",
    "risk.moderate": "मॉडरेट",
    "risk.aggressive": "अॅग्रेसिव्ह",

    "scenario.title": "परिस्थिती",
    "scenario.subtitle": "तुलनेसाठी गुंतवणूकदार वर्तन निवडा.",
    "scenario.more": "अधिक पर्याय",
    "scenario.hideMore": "अधिक पर्याय लपवा",
    "scenario.createCustom": "⚙️ + कस्टम परिस्थिती",
    "scenario.customTooltip": "SIP कधी थांबवायची आणि किती महिन्यांनी पुन्हा सुरू करायची ते ठरवा.",

    "taxMode.title": "टॅक्स गणना मोड",
    "taxMode.subtitle": "शिकण्यासाठी साधी टॅक्स पद्धत निवडा. 1 वर्षापेक्षा जास्त होल्डिंगवर LTCG लागू होऊ शकतो.",
    "taxMode.conservativeTitle": "कन्झर्व्हेटिव्ह (STCG - 30% फ्लॅट)",
    "taxMode.conservativeDesc": "उच्च टॅक्स दर गृहित धरतो (वर्स्ट-केस).",
    "taxMode.optimizedTitle": "ऑप्टिमाइझ्ड (LTCG - 20% इंडेक्सेशनसह)",
    "taxMode.optimizedDesc": "टॅक्सपूर्वी इंडेक्सेशनचा साधा अंदाज लावतो.",
    "taxMode.disclaimerTitle": "डिस्क्लेमर",
    "taxMode.disclaimerBody": "नियम साधन प्रकार, होल्डिंग कालावधी आणि कायद्यातील बदलांवर अवलंबून असतात. हे शिक्षणासाठी आहे.",

    "quiz.title": "तुमची व्यवहार प्रोफाईल (5 प्रश्न)",
    "quiz.subtitle": "लवकर उत्तर द्या — पहिली प्रतिक्रिया बहुतेक खरी असते.",
    "quiz.apply": "शिफारस केलेली परिस्थिती लागू करा",
    "quiz.completeHint": "प्रोफाईल पाहण्यासाठी सर्व प्रश्नांची उत्तरे द्या.",
    "quiz.predicted": "तुमचे अंदाजित वर्तन",
    "quiz.panicAround": "तुम्ही साधारण {{pct}}% घसरणीवर घाबरू शकता.",
  },
  gu: {
    "page.badgeTitle": "SIP સામે Panic Selling",
    "page.badgeSubtitle": "માત્ર શિક્ષણ માટેનું સિમ્યુલેટર",
    "page.partner": "પાર્ટનર: {{partner}}",
    "page.title": "જો માર્કેટ ક્રેશમાં તમે SIP બંધ કરો તો શું થાય?",
    "page.subtitle": "શાંત રોકાણ સામે ઘબરાટ — અને પોસ્ટ-ટેક્સ ખર્ચ મહિના પ્રમાણે જુઓ.",

    "lang.label": "ભાષા",

    "quiz.cardTitle": "🎯 ઝડપી વર્તણૂક ક્વિઝ (2 મિનિટ)",
    "quiz.cardSubtitle": "તમારા પ્રોફાઇલ આધારે વ્યક્તિગત સૂચનો. ઇચ્છો તો પછી કરી શકો.",
    "quiz.show": "ક્વિઝ લો",
    "quiz.hide": "ક્વિઝ છુપાવો",
    "quiz.tip": "ટીપ: અત્યારે સમય ન હોય તો પહેલા પરિણામ પછી ફરી આવો.",

    "crash.title": "માર્કેટ ક્રેશ (ઉદાહરણ)",
    "crash.subtitle": "તણાવમાં વર્તણૂક સમજવા માટે ક્રેશ-સ્ટાઇલ પાથ પસંદ કરો. આ ઐતિહાસિક ઇન્ડેક્સ ડેટા નથી.",
    "crash.default": "ડિફોલ્ટ (શિક્ષણ)",
    "crash.2008": "2008 જેવી (-60%)",
    "crash.2020": "2020 જેવી (-40%)",
    "crash.2022": "2022 જેવી (-18%)",

    "risk.title": "માર્કેટ ઘટે ત્યારે તમને કેવી રીતે લાગે છે?",
    "risk.subtitle": "ઇન્સાઇટ્સ વ્યક્તિગત કરવા માટે — પ્રોડક્ટ સલાહ નથી.",
    "risk.conservative": "સાવચેત",
    "risk.moderate": "મધ્યમ",
    "risk.aggressive": "આક્રમક",

    "scenario.title": "પરિસ્થિતિઓ",
    "scenario.subtitle": "તુલના માટે રોકાણકાર વર્તણૂક પસંદ કરો.",
    "scenario.more": "વધુ વિકલ્પ",
    "scenario.hideMore": "વધુ વિકલ્પ છુપાવો",
    "scenario.createCustom": "⚙️ + કસ્ટમ પરિસ્થિતિ",
    "scenario.customTooltip": "SIP ક્યારે બંધ કરશો અને કેટલા મહિનાથી પછી ફરી શરૂ કરશો તે નક્કી કરો.",

    "taxMode.title": "ટેક્સ ગણતરી મોડ",
    "taxMode.subtitle": "શીખવા માટે સરળ ટેક્સ રીત પસંદ કરો. 1 વર્ષથી વધુ હોલ્ડિંગ પર LTCG લાગુ થઈ શકે છે.",
    "taxMode.conservativeTitle": "કન્ઝર્વેટિવ (STCG - 30% ફ્લેટ)",
    "taxMode.conservativeDesc": "ઉચ્ચ ટેક્સ દર માને છે (વર્સ્ટ-કેસ).",
    "taxMode.optimizedTitle": "ઓપ્ટિમાઇઝ્ડ (LTCG - 20% ઇન્ડેક્સેશન સાથે)",
    "taxMode.optimizedDesc": "ટેક્સ પહેલાં ઇન્ડેક્સેશનનો સરળ અંદાજ લાગુ કરે છે.",
    "taxMode.disclaimerTitle": "ડિસ્ક્લેમર",
    "taxMode.disclaimerBody": "નિયમો સાધન પ્રકાર, હોલ્ડિંગ સમયગાળો અને કાયદા બદલાવ પર આધાર રાખે છે. આ માત્ર શિક્ષણ માટે છે.",

    "quiz.title": "તમારું વર્તણૂક પ્રોફાઇલ (5 પ્રશ્ન)",
    "quiz.subtitle": "ઝડપી જવાબ આપો — પહેલી પ્રતિક્રિયા સામાન્ય રીતે સાચી હોય છે.",
    "quiz.apply": "ભલામણ કરેલ પરિસ્થિતિ લાગુ કરો",
    "quiz.completeHint": "પ્રોફાઇલ જોવા માટે બધા પ્રશ્નોના જવાબ આપો.",
    "quiz.predicted": "તમારું અનુમાનિત વર્તણૂક",
    "quiz.panicAround": "તમે આશરે {{pct}}% ઘટાડા પર ઘબરી શકો છો.",
  },
} as const;

export type TranslationKey = keyof (typeof STRINGS)["en"];

export function t(lang: Lang, key: TranslationKey, vars?: Record<string, string | number>): string {
  const table = STRINGS[lang] ?? STRINGS.en;
  const raw = (table as any)[key] ?? (STRINGS.en as any)[key] ?? String(key);
  const s = String(raw);

  if (!vars) return s;

  return s.replace(/\{\{(\w+)\}\}/g, (_, name) => {
    const v = vars[name];
    return v === undefined || v === null ? "" : String(v);
  });
}
