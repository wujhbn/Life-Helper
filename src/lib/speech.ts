export function speak(text: string) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-TW';
    utterance.rate = 0.9; // Slightly slower for better comprehension
    utterance.pitch = 1.0;
    
    const voices = window.speechSynthesis.getVoices();
    const twVoice = voices.find(v => v.lang === 'zh-TW' || v.lang === 'zh-HK' || v.lang === 'zh-CN');
    if (twVoice) {
      utterance.voice = twVoice;
    }
    
    window.speechSynthesis.speak(utterance);
  }
}

export function playSound(type: 'complete' | 'click' | 'alert') {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    if (type === 'complete') {
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
      oscillator.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 0.1); // A5
      gainNode.gain.setValueAtTime(1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.5);
    } else if (type === 'alert') {
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(880, audioContext.currentTime + 0.2);
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime + 0.4);
      gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.01, audioContext.currentTime + 0.6);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.6);
    } else {
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.1);
    }
  } catch (e) {
    console.log('Audio disabled or not supported');
  }
}
