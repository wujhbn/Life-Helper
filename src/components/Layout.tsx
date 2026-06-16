import { Outlet, Link, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import SettingsModal from './SettingsModal';
import { speak } from '../lib/speech';
import { initDB } from '../lib/db';
import ReloadPrompt from './ReloadPrompt';
import { getItem } from '../lib/storage';

export default function Layout() {
  const [time, setTime] = useState(new Date());
  const location = useLocation();
  const [showSettings, setShowSettings] = useState(false);
  const [activeAlarmNotification, setActiveAlarmNotification] = useState<{label: string, time: string, isSchedule?: boolean} | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  const lastTriggeredTime = useRef<string | null>(null);
  const lastTriggeredScheduleTime = useRef<string | null>(null);
  const alarmIntervalId = useRef<number | null>(null);

  const triggerNotification = (title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/icon-192x192.png' });
    }
  };

  const startAlarmSound = () => {
    if (alarmIntervalId.current !== null) {
      clearInterval(alarmIntervalId.current);
    }
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContext();

      const playBeeps = () => {
        for (let j = 0; j < 4; j++) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          
          osc.type = 'square';
          osc.frequency.setValueAtTime(800, ctx.currentTime + j * 0.2);
          
          gain.gain.setValueAtTime(0, ctx.currentTime + j * 0.2);
          gain.gain.linearRampToValueAtTime(0.6, ctx.currentTime + j * 0.2 + 0.02);
          gain.gain.linearRampToValueAtTime(0, ctx.currentTime + j * 0.2 + 0.15);
          
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.start(ctx.currentTime + j * 0.2);
          osc.stop(ctx.currentTime + j * 0.2 + 0.15);
        }
      };

      playBeeps();
      alarmIntervalId.current = window.setInterval(() => {
        if (ctx.state === 'suspended') ctx.resume();
        playBeeps();
      }, 1500);

    } catch (e) {
      console.error(e);
    }
  };

  const stopAlarmSound = () => {
    if (alarmIntervalId.current !== null) {
      clearInterval(alarmIntervalId.current);
      alarmIntervalId.current = null;
    }
    setActiveAlarmNotification(null);
  };

  useEffect(() => {
    (window as any).triggerTestAlarm = () => {
      speak('這是一個提醒測試，語音與聲音正常運作中。');
      triggerNotification('測試提醒', '這是一個提醒測試，通知權限正常。');
      setActiveAlarmNotification({ label: '此為照顧者測試項目', time: '現在' });
      startAlarmSound();
    };
    return () => {
      delete (window as any).triggerTestAlarm;
    };
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const timer = setInterval(() => {
      const now = new Date();
      setTime(now);

      const currentHourMin = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
      const currentSec = now.getSeconds();
      
      // Check Normal Alarms
      try {
        const alarms = getItem<any[]>('life-helper-alarms', []);
        if (alarms.length > 0) {
          const activeAlarm = alarms.find((a: any) => a.enabled && a.time === currentHourMin);
          if (activeAlarm && lastTriggeredTime.current !== currentHourMin) {
            lastTriggeredTime.current = currentHourMin;
            speak(`鬧鐘響了！現在時間 ${currentHourMin}，提醒您：${activeAlarm.label}。`);
            triggerNotification('鬧鐘提醒', activeAlarm.label);
            setActiveAlarmNotification({ label: activeAlarm.label, time: currentHourMin });
            startAlarmSound();
          }
        }
      } catch (err) {
        console.error(err);
      }

      // Check Schedule 
      if (currentSec === 0 && lastTriggeredScheduleTime.current !== currentHourMin) {
        lastTriggeredScheduleTime.current = currentHourMin;
        
        // 使用本地時間組成 YYYY-MM-DD
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const d = String(now.getDate()).padStart(2, '0');
        const todayStr = `${y}-${m}-${d}`;
        
        initDB().then(db => {
          db.getAllFromIndex('schedule', 'by-date', todayStr).then(all => {
             const uncompleted = all.filter(s => !s.completed);
             const activeSchedule = uncompleted.find(s => s.time === currentHourMin);
             if (activeSchedule) {
                speak(`行程提醒：現在時間 ${currentHourMin}，該「${activeSchedule.title}」了。`);
                triggerNotification('行程提醒', activeSchedule.title);
                setActiveAlarmNotification({ label: activeSchedule.title, time: currentHourMin, isSchedule: true });
                startAlarmSound();
             }
          });
        }).catch(err => console.error(err));
      }

    }, 1000);
    return () => {
      clearInterval(timer);
      if (alarmIntervalId.current !== null) {
        clearInterval(alarmIntervalId.current);
      }
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const timeString = time.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false });
  const dateString = time.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' });

  const handleTimeClick = () => {
    const hours = time.getHours();
    const minutes = time.getMinutes();
    
    let period = '半夜';
    if (hours >= 5 && hours < 12) period = '早上';
    else if (hours === 12) period = '中午';
    else if (hours > 12 && hours < 18) period = '下午';
    else if (hours >= 18 && hours < 24) period = '晚上';

    let displayHours = hours % 12;
    if (displayHours === 0) displayHours = 12;

    speak(`現在時間是 ${period} ${displayHours}點 ${minutes > 0 ? `${minutes}分` : '整'}`);
  };

  return (
    <div className="w-full h-[100dvh] bg-[#FFF8F0] flex flex-col font-sans overflow-hidden select-none relative text-slate-700 pb-[env(safe-area-inset-bottom)]">
      {/* Top Status Bar */}
      <header className="h-16 sm:h-20 bg-[#FFF8F0] text-black flex items-center justify-between px-4 sm:px-6 shrink-0 z-10 relative">
        <div className="flex items-center gap-2">
          <Link to="/" className="p-1 px-[10px] bg-white rounded-full border-4 border-orange-200 shadow-sm text-orange-500 hover:text-orange-600 transition-transform active:scale-90 flex-shrink-0 flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-widest text-slate-700 py-1 px-2">生活小幫手</h1>
          </Link>
        </div>
        <div 
          className="flex flex-col items-end flex-shrink-0 px-3 py-1 bg-white rounded-2xl border-4 border-orange-200 shadow-sm cursor-pointer active:scale-95 transition-transform"
          onClick={handleTimeClick}
        >
          <div className="text-xl sm:text-2xl font-black tracking-widest text-orange-500">{timeString}</div>
          <div className="text-[10px] sm:text-xs font-bold text-orange-400 tracking-wide">{dateString}</div>
        </div>
      </header>

      {/* Main Area */}
      <main className="flex-grow overflow-hidden flex flex-col h-full min-h-0 relative z-0">
        <Outlet />
      </main>

      {!isOnline && (
        <div className="bg-slate-800 text-amber-300 py-1 px-4 text-center text-sm font-bold flex items-center justify-center gap-2">
          <span>⚠️</span> 
          <span>您目前處於離線狀態。大部分功能仍可正常使用，但天氣資訊可能無法更新。</span>
        </div>
      )}

      {activeAlarmNotification && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 flex flex-col items-center gap-4 animate-in zoom-in-95 duration-300">
            <div className="text-6xl animate-bounce">{activeAlarmNotification.isSchedule ? '📋' : '⏰'}</div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight text-center">{activeAlarmNotification.isSchedule ? '行程提醒' : '鬧鐘響了'}</h2>
            <div className={`px-6 py-3 rounded-2xl border-2 flex flex-col items-center w-full mt-2 ${activeAlarmNotification.isSchedule ? 'text-amber-800 bg-amber-50 border-amber-100' : 'text-sky-800 bg-sky-50 border-sky-100'}`}>
              <div className="text-4xl font-black">{activeAlarmNotification.time}</div>
              <div className="text-xl font-bold mt-2">{activeAlarmNotification.label}</div>
            </div>
            <button 
              onClick={stopAlarmSound}
              className={`mt-4 w-full text-white py-4 rounded-2xl font-black text-xl active:scale-95 border-b-4 active:border-b-0 active:translate-y-1 transition-all shadow-md ${activeAlarmNotification.isSchedule ? 'bg-amber-500 border-amber-700' : 'bg-sky-500 border-sky-700'}`}
            >
              我知道了
            </button>
          </div>
        </div>
      )}

      {/* Bottom Accessibility Controls */}
      <footer className="bg-[#FFF8F0] flex items-center justify-between px-4 sm:px-6 pt-2 pb-[calc(env(safe-area-inset-bottom)+16px)] shrink-0 z-10 relative">
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border-4 border-green-200 shadow-sm">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-bounce shrink-0 mt-1"></div>
          <span className="text-sm font-bold text-green-600 truncate tracking-wider">語音輔助中</span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowSettings(true)} className="bg-white px-4 py-2 rounded-full border-4 border-orange-200 font-bold text-sm flex items-center gap-1 text-orange-500 hover:bg-orange-50 transition-transform active:scale-90 shadow-sm">
            <span className="text-lg leading-none">⚙️</span> 設定
          </button>
        </div>
      </footer>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      <ReloadPrompt />
    </div>
  );
}
