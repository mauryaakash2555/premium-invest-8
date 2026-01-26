export type AnswerKey = "a" | "b" | "c" | "d";

export type QuizQuestion = {
  id: string;
  title: string;
  options: Array<{ k: AnswerKey; label: string }>;
};

export const QUESTIONS_BY_LANG: Record<string, QuizQuestion[]> = {
  en: [
    {
      id: "q1",
      title: "Q1: Your ₹10 lakh (₹10,00,000) portfolio drops to ₹7 lakh (₹7,00,000) overnight. You:",
      options: [
        { k: "a", label: "Check if it's time to buy more" },
        { k: "b", label: "Feel uncomfortable but do nothing" },
        { k: "c", label: "Consider selling to prevent further loss" },
        { k: "d", label: "Sell immediately" },
      ],
    },
    {
      id: "q2",
      title: "Q2: You check your portfolio during volatility:",
      options: [
        { k: "a", label: "Rarely (monthly/quarterly)" },
        { k: "b", label: "Weekly" },
        { k: "c", label: "Daily" },
        { k: "d", label: "Many times a day" },
      ],
    },
    {
      id: "q3",
      title: "Q3: You believe market crashes are:",
      options: [
        { k: "a", label: "Opportunities to accumulate" },
        { k: "b", label: "Normal but stressful" },
        { k: "c", label: "Dangerous and unpredictable" },
        { k: "d", label: "A sign to exit and re-enter later" },
      ],
    },
    {
      id: "q4",
      title: 'Q4: If headlines scream "market crash", you usually:',
      options: [
        { k: "a", label: "Stick to your plan" },
        { k: "b", label: "Pause and wait" },
        { k: "c", label: "Reduce risk" },
        { k: "d", label: "Exit completely" },
      ],
    },
    {
      id: "q5",
      title: "Q5: Your comfort with volatility is:",
      options: [
        { k: "a", label: "High" },
        { k: "b", label: "Medium" },
        { k: "c", label: "Low" },
        { k: "d", label: "Very low" },
      ],
    },
  ],
  hi: [
    {
      id: "q1",
      title: "Q1: आपका ₹10 लाख (₹10,00,000) पोर्टफोलियो रातों-रात ₹7 लाख (₹7,00,000) हो जाता है। आप:",
      options: [
        { k: "a", label: "देखते हैं कि और खरीदना चाहिए या नहीं" },
        { k: "b", label: "असहज महसूस करते हैं लेकिन कुछ नहीं करते" },
        { k: "c", label: "और नुकसान से बचने के लिए बेचने पर सोचते हैं" },
        { k: "d", label: "तुरंत बेच देते हैं" },
      ],
    },
    {
      id: "q2",
      title: "Q2: अस्थिरता के दौरान आप पोर्टफोलियो कितनी बार देखते हैं:",
      options: [
        { k: "a", label: "कम (मासिक/तिमाही)" },
        { k: "b", label: "साप्ताहिक" },
        { k: "c", label: "दैनिक" },
        { k: "d", label: "दिन में कई बार" },
      ],
    },
    {
      id: "q3",
      title: "Q3: आपके अनुसार मार्केट क्रैश हैं:",
      options: [
        { k: "a", label: "अधिक यूनिट्स जोड़ने का मौका" },
        { k: "b", label: "सामान्य लेकिन तनावपूर्ण" },
        { k: "c", label: "खतरनाक और अनिश्चित" },
        { k: "d", label: "बाहर निकलकर बाद में प्रवेश करने का संकेत" },
      ],
    },
    {
      id: "q4",
      title: 'Q4: अगर खबरें "market crash" चिल्लाएँ, तो आप आमतौर पर:',
      options: [
        { k: "a", label: "अपनी योजना पर टिके रहते हैं" },
        { k: "b", label: "रुककर इंतज़ार करते हैं" },
        { k: "c", label: "रिस्क कम करते हैं" },
        { k: "d", label: "पूरी तरह बाहर निकल जाते हैं" },
      ],
    },
    {
      id: "q5",
      title: "Q5: आपकी अस्थिरता के साथ सहजता:",
      options: [
        { k: "a", label: "उच्च" },
        { k: "b", label: "मध्यम" },
        { k: "c", label: "कम" },
        { k: "d", label: "बहुत कम" },
      ],
    },
  ],
  mr: [
    {
      id: "q1",
      title: "Q1: तुमचे ₹10 लाख (₹10,00,000) पोर्टफोलिओ रातोरात ₹7 लाख (₹7,00,000) होते. तुम्ही:",
      options: [
        { k: "a", label: "अजून खरेदी करायची वेळ आहे का पाहता" },
        { k: "b", label: "अस्वस्थ होता पण काही करत नाही" },
        { k: "c", label: "आणखी तोटा टाळण्यासाठी विक्रीचा विचार करता" },
        { k: "d", label: "ताबडतोब विकता" },
      ],
    },
    {
      id: "q2",
      title: "Q2: व्होलॅटिलिटीमध्ये तुम्ही पोर्टफोलिओ किती वेळा तपासता:",
      options: [
        { k: "a", label: "क्वचित (मासिक/तिमाही)" },
        { k: "b", label: "साप्ताहिक" },
        { k: "c", label: "दररोज" },
        { k: "d", label: "दिवसातून अनेकदा" },
      ],
    },
    {
      id: "q3",
      title: "Q3: तुमच्या मते मार्केट क्रॅश म्हणजे:",
      options: [
        { k: "a", label: "युनिट्स वाढवण्याची संधी" },
        { k: "b", label: "सामान्य पण तणावपूर्ण" },
        { k: "c", label: "धोकादायक आणि अनिश्चित" },
        { k: "d", label: "बाहेर पडून नंतर परत येण्याचा संकेत" },
      ],
    },
    {
      id: "q4",
      title: 'Q4: जर बातम्या "market crash" म्हणत असतील, तर तुम्ही:',
      options: [
        { k: "a", label: "योजनेला चिकटून राहता" },
        { k: "b", label: "थांबून पाहता" },
        { k: "c", label: "रिस्क कमी करता" },
        { k: "d", label: "पूर्णपणे बाहेर पडता" },
      ],
    },
    {
      id: "q5",
      title: "Q5: व्होलॅटिलिटीबद्दल तुमची सहजता:",
      options: [
        { k: "a", label: "जास्त" },
        { k: "b", label: "मध्यम" },
        { k: "c", label: "कमी" },
        { k: "d", label: "खूप कमी" },
      ],
    },
  ],
  gu: [
    {
      id: "q1",
      title: "Q1: તમારું ₹10 લાખ (₹10,00,000) પોર્ટફોલિયો રાતોરાત ₹7 લાખ (₹7,00,000) થાય છે. તમે:",
      options: [
        { k: "a", label: "વધારે ખરીદવાનો સમય છે કે નહીં ચેક કરો" },
        { k: "b", label: "અસ્વસ્થ લાગેછે પરંતુ કશું નહીં કરો" },
        { k: "c", label: "વધુ નુકસાન રોકવા વેચવાનું વિચારો" },
        { k: "d", label: "તુરંત વેચી દો" },
      ],
    },
    {
      id: "q2",
      title: "Q2: અસ્થિરતા દરમિયાન તમે પોર્ટફોલિયો કેટલું ચેક કરો:",
      options: [
        { k: "a", label: "કમ (માસિક/ત્રિમાસિક)" },
        { k: "b", label: "સાપ્તાહિક" },
        { k: "c", label: "દરરોજ" },
        { k: "d", label: "દિવસમાં ઘણી વાર" },
      ],
    },
    {
      id: "q3",
      title: "Q3: તમારા મત પ્રમાણે માર્કેટ ક્રેશ છે:",
      options: [
        { k: "a", label: "વધુ એકમ એકત્ર કરવાની તક" },
        { k: "b", label: "સામાન્ય પરંતુ તણાવપૂર્ણ" },
        { k: "c", label: "ખતરનાક અને અનિશ્ચિત" },
        { k: "d", label: "બહાર નીકળી પછી ફરી પ્રવેશવાનો સંકેત" },
      ],
    },
    {
      id: "q4",
      title: 'Q4: જો હેડલાઇન "market crash" કહે, તો તમે:',
      options: [
        { k: "a", label: "યોજનાથી ચોંટેલા રહો" },
        { k: "b", label: "થંભો અને રાહ જુઓ" },
        { k: "c", label: "રિસ્ક ઘટાડો" },
        { k: "d", label: "સંપૂર્ણ બહાર નીકળી જાઓ" },
      ],
    },
    {
      id: "q5",
      title: "Q5: અસ્થિરતા સાથે તમારી આરામદાયકતા:",
      options: [
        { k: "a", label: "વધારે" },
        { k: "b", label: "મધ્યમ" },
        { k: "c", label: "ઓછી" },
        { k: "d", label: "ખૂબ ઓછી" },
      ],
    },
  ],
};

const SCORE: Record<AnswerKey, number> = { a: 1, b: 2, c: 3, d: 4 };

export type BehavioralProfile = {
  label: string;
  thresholdPct: number;
  riskComfort: "conservative" | "moderate" | "aggressive";
};

export function profileFromAvg(avg: number): BehavioralProfile {
  if (avg <= 1.5) return { label: "Aggressive", thresholdPct: 40, riskComfort: "aggressive" };
  if (avg <= 2.5) return { label: "Moderate", thresholdPct: 27, riskComfort: "moderate" };
  if (avg <= 3.5) return { label: "Conservative", thresholdPct: 18, riskComfort: "conservative" };
  return { label: "Very Conservative", thresholdPct: 10, riskComfort: "conservative" };
}

export function computeProfileFromAnswers(answers: Record<string, AnswerKey | null>): BehavioralProfile | null {
  const keys = Object.keys(answers);
  if (!keys.length) return null;
  const filled = keys.filter((k) => answers[k]);
  if (filled.length !== keys.length) return null;

  const total = keys.reduce((sum, k) => sum + SCORE[(answers[k] as AnswerKey) ?? "b"], 0);
  const avg = total / keys.length;
  return profileFromAvg(avg);
}
