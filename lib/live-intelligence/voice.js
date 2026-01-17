/**
 * Voice Reader for Live Intelligence
 * @file lib/live-intelligence/voice.js
 * 
 * Text-to-speech functionality for reading headlines aloud
 * Supports play/pause, speed control, and voice selection
 */

'use client';

class VoiceReader {
  constructor() {
    this.synthesis = null;
    this.isPlaying = false;
    this.isPaused = false;
    this.currentUtterance = null;
    this.rate = 1.0;
    this.autoRead = false;
    this.selectedVoice = null;
    this.availableVoices = [];
    
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      this.synthesis = window.speechSynthesis;
      this.loadVoices();
      
      // Voices may load asynchronously
      if (this.synthesis.onvoiceschanged !== undefined) {
        this.synthesis.onvoiceschanged = () => this.loadVoices();
      }
    }
  }
  
  loadVoices() {
    if (!this.synthesis) return;
    
    this.availableVoices = this.synthesis.getVoices();
    
    // Prefer Indian English voice
    this.selectedVoice = this.availableVoices.find(v => v.lang === 'en-IN') ||
                         this.availableVoices.find(v => v.lang.startsWith('en-')) ||
                         this.availableVoices[0];
  }
  
  getVoices() {
    return this.availableVoices;
  }
  
  setVoice(voiceName) {
    const voice = this.availableVoices.find(v => v.name === voiceName);
    if (voice) {
      this.selectedVoice = voice;
    }
  }
  
  setRate(rate) {
    this.rate = Math.max(0.5, Math.min(2.0, rate));
  }
  
  setAutoRead(enabled) {
    this.autoRead = enabled;
  }
  
  speak(text, options = {}) {
    if (!this.synthesis) return false;
    
    // Cancel any ongoing speech
    this.stop();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Voice settings
    utterance.rate = options.rate || this.rate;
    utterance.pitch = options.pitch || 1.0;
    utterance.volume = options.volume || 1.0;
    utterance.lang = 'en-IN'; // Indian English
    
    // Use selected voice
    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }
    
    utterance.onstart = () => {
      this.isPlaying = true;
      this.isPaused = false;
      if (options.onStart) options.onStart();
    };
    
    utterance.onend = () => {
      this.isPlaying = false;
      this.isPaused = false;
      if (options.onEnd) options.onEnd();
    };
    
    utterance.onerror = (error) => {
      console.error('Speech error:', error);
      this.isPlaying = false;
      this.isPaused = false;
      if (options.onError) options.onError(error);
    };
    
    this.currentUtterance = utterance;
    this.synthesis.speak(utterance);
    return true;
  }
  
  stop() {
    if (this.synthesis) {
      this.synthesis.cancel();
      this.isPlaying = false;
      this.isPaused = false;
    }
  }
  
  pause() {
    if (this.synthesis && this.isPlaying) {
      this.synthesis.pause();
      this.isPaused = true;
    }
  }
  
  resume() {
    if (this.synthesis && this.isPaused) {
      this.synthesis.resume();
      this.isPaused = false;
    }
  }
  
  toggle() {
    if (this.isPaused) {
      this.resume();
    } else if (this.isPlaying) {
      this.pause();
    }
  }
  
  readHeadline(headline) {
    if (!headline) return false;
    
    const categoryName = headline.category?.replace(/_/g, ' ') || 'Update';
    const headlineText = headline.headline || headline.block_what_happened || '';
    const whyMatters = headline.whyItMatters || headline.why_it_matters || headline.block_why_it_matters || '';
    
    const text = `${categoryName}. ${headlineText}. ${whyMatters}`;
    return this.speak(text);
  }
  
  readSummary(summary) {
    if (!summary) return false;
    
    let text = 'Here is your market summary. ';
    
    if (summary.markets_recap) {
      const m = summary.markets_recap;
      if (m.nifty) {
        text += `NIFTY at ${m.nifty.value}, ${m.nifty.change}. `;
      }
      if (m.sensex) {
        text += `SENSEX at ${m.sensex.value}, ${m.sensex.change}. `;
      }
    }
    
    if (summary.key_developments && Array.isArray(summary.key_developments)) {
      text += 'Key developments. ';
      summary.key_developments.forEach((dev, i) => {
        if (i < 5) { // Limit to 5 developments
          text += `${dev.text || dev}. `;
        }
      });
    }
    
    if (summary.tomorrow_watch) {
      text += `Tomorrow watch. ${summary.tomorrow_watch}. `;
    }
    
    return this.speak(text);
  }
  
  isSupported() {
    return typeof window !== 'undefined' && !!window.speechSynthesis;
  }
  
  getStatus() {
    return {
      isPlaying: this.isPlaying,
      isPaused: this.isPaused,
      rate: this.rate,
      autoRead: this.autoRead,
      voiceName: this.selectedVoice?.name || 'Default',
      supported: this.isSupported()
    };
  }
}

// Singleton instance
let voiceReaderInstance = null;

export function getVoiceReader() {
  if (typeof window === 'undefined') return null;
  
  if (!voiceReaderInstance) {
    voiceReaderInstance = new VoiceReader();
  }
  return voiceReaderInstance;
}

export const voiceReader = typeof window !== 'undefined' ? new VoiceReader() : null;

export default VoiceReader;
