import { useState, useEffect } from 'react';
import { getSettings, saveSettings, AppSettings, getAvailableVoices, speak } from '../lib/speech';

export default function SettingsModal({ onClose }: { onClose: () => void }) {
  const [settings, setSettings] = useState<AppSettings>(getSettings());
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const v = getAvailableVoices();
    setVoices(v);
    const timer = setTimeout(() => {
      setVoices(getAvailableVoices());
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const updateAndSave = (partial: Partial<AppSettings>) => {
    const newSettings = { ...settings, ...partial };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  return (
    <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-sm w-full rounded-[2rem] p-6 flex flex-col gap-4 shadow-2xl">
        <h2 className="text-2xl font-black text-slate-800 text-center mb-2 flex justify-center items-center gap-2">
          <span>⚙️</span> 設定
        </h2>
        
        <div className="flex flex-col gap-3">
          <label className="flex items-center justify-between bg-slate-100 p-3 rounded-2xl">
            <span className="text-xl font-bold text-slate-700">聲音開關</span>
            <input type="checkbox" className="w-6 h-6 rounded" checked={!settings.muted} onChange={(e) => {
              updateAndSave({ muted: !e.target.checked });
              if (e.target.checked) setTimeout(() => speak("聲音已開啟"), 100);
            }} />
          </label>

          <label className="flex flex-col gap-1 bg-slate-100 p-3 rounded-2xl">
            <span className="text-xl font-bold text-slate-700">選擇聲音 (男女聲)</span>
            <select 
              className="w-full text-lg p-2 rounded-xl bg-white border-2 border-slate-300 font-bold text-slate-600"
              value={settings.voiceURI}
              onChange={(e) => {
                updateAndSave({ voiceURI: e.target.value });
                setTimeout(() => speak("你好，我是這個聲音"), 200);
              }}
            >
              <option value="">預設聲音</option>
              {voices.map(v => (
                <option key={v.voiceURI} value={v.voiceURI}>{v.name} ({v.lang})</option>
              ))}
            </select>
          </label>
          
          <label className="flex flex-col gap-1 bg-slate-100 p-3 rounded-2xl">
            <span className="text-xl font-bold text-slate-700">音量大小</span>
            <input 
              type="range" min="0.1" max="1" step="0.1" 
              value={settings.volume} 
              onChange={(e) => {
                 updateAndSave({ volume: parseFloat(e.target.value) });
              }} 
              onMouseUp={() => speak("音量測試")}
              onTouchEnd={() => speak("音量測試")}
              className="w-full h-4 accent-teal-500" 
            />
          </label>
        </div>

        <button onClick={onClose} className="mt-2 bg-teal-500 text-white font-black text-xl py-3 rounded-xl active:scale-95 transition-transform shadow-md border-b-4 border-teal-700 active:border-b-0 active:translate-y-1">
          完成設定
        </button>
      </div>
    </div>
  );
}
