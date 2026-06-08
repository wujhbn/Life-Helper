import { Outlet, Link, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import SettingsModal from './SettingsModal';
import { speak } from '../lib/speech';
import { initDB } from '../lib/db';

export default function Layout() {
  const [time, setTime] = useState(new Date());
  const location = useLocation();
  const [showSettings, setShowSettings] = useState(false);
  const [activeAlarmNotification, setActiveAlarmNotification] = useState<{label: string, time: string, isSchedule?: boolean} | null>(null);
  const lastTriggeredTime = useRef<string | null>(null);
  const lastTriggeredScheduleTime = useRef<string | null>(null);
  const alarmIntervalId = useRef<number | null>(null);

  const startAlarmSound = () => {
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
    const timer = setInterval(() => {
      const now = new Date();
      setTime(now);

      const currentHourMin = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
      const currentSec = now.getSeconds();
      
      // Check Normal Alarms
      try {
        const saved = localStorage.getItem('life-helper-alarms');
        if (saved) {
          const alarms = JSON.parse(saved);
          const activeAlarm = alarms.find((a: any) => a.enabled && a.time === currentHourMin);
          if (activeAlarm && lastTriggeredTime.current !== currentHourMin) {
            lastTriggeredTime.current = currentHourMin;
            speak(`鬧鐘響了！現在時間 ${currentHourMin}，提醒您：${activeAlarm.label}。`);
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
        const todayStr = now.toISOString().split('T')[0];
        
        initDB().then(db => {
          db.getAllFromIndex('schedule', 'by-date', todayStr).then(all => {
             const uncompleted = all.filter(s => !s.completed);
             const activeSchedule = uncompleted.find(s => s.time === currentHourMin);
             if (activeSchedule) {
                speak(`行程提醒：現在時間 ${currentHourMin}，該「${activeSchedule.title}」了。`);
                setActiveAlarmNotification({ label: activeSchedule.title, time: currentHourMin, isSchedule: true });
                startAlarmSound();
             }
          });
        }).catch(err => console.error(err));
      }

    }, 1000);
    return () => clearInterval(timer);
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
    <div className="w-full h-[100dvh] bg-[#F2F2F7] flex flex-col font-sans overflow-hidden select-none relative">
      {/* Top Status Bar */}
      <header className="h-14 sm:h-16 bg-white/70 backdrop-blur-xl border-b border-slate-200/80 text-black flex items-center justify-between px-3 sm:px-5 shrink-0 z-10 relative">
        <div className="flex items-center gap-2">
          <Link to="/" className="p-1 px-2 text-blue-500 hover:text-blue-600 transition-colors active:opacity-70 flex-shrink-0 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 sm:w-10 sm:h-10">
              <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.06 1.06l8.69-8.69z" />
              <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
            </svg>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800 ml-1">生活小幫手</h1>
          </Link>
        </div>
        <div 
          className="flex flex-col items-end flex-shrink-0 pr-1 cursor-pointer active:opacity-60 transition-opacity"
          onClick={handleTimeClick}
        >
          <div className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-800">{timeString}</div>
          <div className="text-xs sm:text-sm font-semibold text-slate-500 tracking-wide">{dateString}</div>
        </div>
      </header>

      {/* Main Area */}
      <main className="flex-grow overflow-hidden flex flex-col h-full min-h-0 relative z-0">
        <Outlet />
      </main>

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
      <footer className="bg-white/70 backdrop-blur-xl border-t border-slate-200/80 flex items-center justify-between px-3 sm:px-5 pt-3 pb-[calc(env(safe-area-inset-bottom)+12px)] shrink-0 z-10 relative">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse border border-green-600 shrink-0"></div>
          <span className="text-sm font-bold text-slate-700 truncate">語音輔助中</span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowSettings(true)} className="bg-white px-3 sm:px-4 py-1 sm:py-1.5 rounded-full border-2 border-slate-400 font-bold text-sm flex items-center gap-1 hover:bg-slate-50 transition-colors active:scale-95 whitespace-nowrap shadow-sm">
            <span className="text-base sm:text-lg leading-none">⚙️</span> 聲音/設定
          </button>
        </div>
      </footer>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
}
