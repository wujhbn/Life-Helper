export interface AppSettings {
  volume: number;
  muted: boolean;
  voiceURI: string;
}

const defaultSettings: AppSettings = {
  volume: 1,
  muted: false,
  voiceURI: ''
};

export function getSettings(): AppSettings {
  try {
    const s = localStorage.getItem('lifehelper-settings');
    if (s) return { ...defaultSettings, ...JSON.parse(s) };
  } catch (e) {}
  return defaultSettings;
}

export function saveSettings(s: AppSettings) {
  localStorage.setItem('lifehelper-settings', JSON.stringify(s));
}

let availableVoices: SpeechSynthesisVoice[] = [];
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  const loadVoices = () => {
    availableVoices = window.speechSynthesis.getVoices().filter(v => 
      v.lang.startsWith('zh') || v.lang.startsWith('en')
    );
  };
  loadVoices();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }
}

export function getAvailableVoices() {
  return availableVoices;
}

export function speak(text: string) {
  const settings = getSettings();
  if (settings.muted) return;
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-TW';
    utterance.rate = 0.9; 
    utterance.pitch = 1.0;
    utterance.volume = settings.volume;
    
    if (settings.voiceURI) {
      const selected = availableVoices.find(v => v.voiceURI === settings.voiceURI);
      if (selected) utterance.voice = selected;
    } else {
      const twVoice = availableVoices.find(v => v.lang === 'zh-TW' || v.lang === 'zh-HK' || v.lang === 'zh-CN');
      if (twVoice) utterance.voice = twVoice;
    }
    
    window.speechSynthesis.speak(utterance);
  }
}

export function playSound(type: 'complete' | 'click' | 'alert') {
  const settings = getSettings();
  if (settings.muted) return;
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    if (type === 'complete') {
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 0.1);
      gainNode.gain.setValueAtTime(settings.volume, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.5);
    } else if (type === 'alert') {
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(880, audioContext.currentTime + 0.2);
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime + 0.4);
      gainNode.gain.setValueAtTime(settings.volume * 0.5, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.01, audioContext.currentTime + 0.6);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.6);
    } else {
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
      gainNode.gain.setValueAtTime(settings.volume * 0.5, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.1);
    }
  } catch (e) {
    console.log('Audio disabled or not supported');
  }
}
