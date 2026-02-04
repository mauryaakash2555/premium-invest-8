/**
 * Voice Guide Utility
 * 
 * Provides text-to-speech functionality for accessibility
 * Uses Web Speech API (built into all modern browsers)
 * 
 * @module utils/voiceGuide
 */

type VoiceLang = 'en-IN' | 'hi-IN' | 'en-US';

interface VoiceOptions {
  lang?: VoiceLang;
  rate?: number;
  pitch?: number;
  volume?: number;
}

/**
 * Check if speech synthesis is supported
 */
export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/**
 * Speak text aloud using Web Speech API
 */
export function speak(text: string, options: VoiceOptions = {}): void {
  if (!isSpeechSupported()) {
    console.warn('[VoiceGuide] Speech synthesis not supported');
    return;
  }

  const {
    lang = 'en-IN',
    rate = 0.9,
    pitch = 1,
    volume = 1
  } = options;

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = rate;
  utterance.pitch = pitch;
  utterance.volume = volume;

  // Try to find a voice that matches the language
  const voices = window.speechSynthesis.getVoices();
  const matchingVoice = voices.find(v => v.lang.startsWith(lang.split('-')[0]));
  if (matchingVoice) {
    utterance.voice = matchingVoice;
  }

  window.speechSynthesis.speak(utterance);
}

/**
 * Stop any ongoing speech
 */
export function stopSpeaking(): void {
  if (isSpeechSupported()) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Check if currently speaking
 */
export function isSpeaking(): boolean {
  return isSpeechSupported() && window.speechSynthesis.speaking;
}

/**
 * Format currency for speech (reads naturally)
 * ₹5,37,000 → "5 lakh 37 thousand rupees"
 */
export function formatAmountForSpeech(amount: number): string {
  if (!Number.isFinite(amount)) return 'zero rupees';
  
  const absAmount = Math.abs(amount);
  
  if (absAmount >= 10_000_000) {
    const crores = (absAmount / 10_000_000).toFixed(2);
    return `${crores} crore rupees`;
  }
  
  if (absAmount >= 100_000) {
    const lakhs = (absAmount / 100_000).toFixed(2);
    return `${lakhs} lakh rupees`;
  }
  
  if (absAmount >= 1000) {
    const thousands = (absAmount / 1000).toFixed(1);
    return `${thousands} thousand rupees`;
  }
  
  return `${Math.round(absAmount)} rupees`;
}

/**
 * React hook for voice guidance
 */
export function useVoiceGuide() {
  const speakText = (text: string, lang: VoiceLang = 'en-IN') => {
    speak(text, { lang });
  };

  const speakAmount = (amount: number, prefix = '', suffix = '') => {
    const amountText = formatAmountForSpeech(amount);
    speak(`${prefix} ${amountText} ${suffix}`.trim());
  };

  return {
    speak: speakText,
    speakAmount,
    stop: stopSpeaking,
    isSpeaking,
    isSupported: isSpeechSupported
  };
}

export default {
  speak,
  stopSpeaking,
  isSpeaking,
  isSpeechSupported,
  formatAmountForSpeech
};
