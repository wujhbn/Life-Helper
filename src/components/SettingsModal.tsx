import React, { useState, useEffect, useRef } from 'react';
import { getSettings, saveSettings, AppSettings, getAvailableVoices, speak } from '../lib/speech';
import { exportBackup, importBackup } from '../lib/backup';

export default function SettingsModal({ onClose }: { onClose: () => void }) {
  const [settings, setSettings] = useState<AppSettings>(getSettings());
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const success = await importBackup(file);
      if (success) {
        alert('資料還原成功！請重新整理頁面以套用變更。');
        window.location.reload();
      } else {
        alert('檔案格式錯誤或還原失敗');
      }
    }
  };

  return (
    <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-sm w-full rounded-[2rem] p-6 flex flex-col gap-4 shadow-2xl overflow-y-auto max-h-full">
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
            <span className="text-xl font-bold text-slate-700">選擇聲音</span>
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

          <div className="bg-blue-50 p-3 rounded-2xl flex flex-col gap-2 border-2 border-blue-200">
            <span className="font-bold text-blue-900">資料備份與還原</span>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={exportBackup} 
                className="bg-white border-b-4 border-blue-300 text-blue-700 font-bold py-2 rounded-xl active:translate-y-1 active:border-b-0"
              >
                📥 匯出紀錄
              </button>
              <button 
                onClick={() => fileInputRef.current?.click()} 
                className="bg-blue-500 border-b-4 border-blue-700 text-white font-bold py-2 rounded-xl active:translate-y-1 active:border-b-0"
              >
                📤 匯入紀錄
              </button>
              <input type="file" accept=".json" ref={fileInputRef} onChange={handleImport} className="hidden" />
            </div>
          </div>

          <div className="bg-amber-100 p-3 rounded-2xl flex flex-col gap-2 border-2 border-amber-200">
            <span className="font-bold text-amber-900">提醒設定與測試</span>
            <div className="text-sm font-semibold text-amber-700 mb-1">
              注意：PWA 網頁若被關閉或進入休眠，可能無法準時發出提醒。
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => {
                  if ('Notification' in window) {
                    Notification.requestPermission().then(p => {
                      alert(p === 'granted' ? '系統通知權限已開啟' : '您拒絕了通知權限');
                    });
                  } else {
                    alert('目前使用的瀏覽器不支援通知功能');
                  }
                }} 
                className="bg-white border-b-4 border-amber-300 text-amber-700 font-bold py-2 rounded-xl active:translate-y-1 active:border-b-0"
              >
                開啟通知權限
              </button>
              <button 
                onClick={() => {
                   if (typeof (window as any).triggerTestAlarm === 'function') {
                      (window as any).triggerTestAlarm();
                   }
                }} 
                className="bg-orange-500 border-b-4 border-orange-700 text-white font-bold py-2 rounded-xl active:translate-y-1 active:border-b-0"
              >
                測試提醒
              </button>
            </div>
          </div>
        </div>

        <button onClick={onClose} className="mt-2 bg-teal-500 text-white font-black text-xl py-3 rounded-xl active:scale-95 transition-transform shadow-md border-b-4 border-teal-700 active:border-b-0 active:translate-y-1">
          完成設定
        </button>
      </div>
    </div>
  );
}
