import { Outlet, Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import SettingsModal from './SettingsModal';

export default function Layout() {
  const [time, setTime] = useState(new Date());
  const location = useLocation();
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = time.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false });
  const dateString = time.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' });

  return (
    <div className="w-full h-[100dvh] bg-[#F1F5F9] flex flex-col font-sans overflow-hidden select-none relative">
      {/* Top Status Bar */}
      <header className="h-14 sm:h-16 bg-blue-700 text-white flex items-center justify-between px-3 shadow-md shrink-0 z-10 rounded-b-lg">
        <div className="flex items-center gap-2">
          <Link to="/" className="bg-white/20 p-1.5 rounded-full hover:bg-white/30 transition-colors focus:ring-4 focus:ring-white flex-shrink-0">
            <span className="text-xl sm:text-2xl leading-none block">🏠</span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight truncate">生活小幫手</h1>
        </div>
        <div className="flex flex-col items-end flex-shrink-0 pl-2">
          <div className="text-xl sm:text-3xl font-mono font-bold leading-none">{timeString}</div>
          <div className="text-xs sm:text-sm font-bold opacity-90">{dateString}</div>
        </div>
      </header>

      {/* Main Area */}
      <main className="flex-grow overflow-hidden flex flex-col pt-2 pb-2 h-full min-h-0 relative">
        <Outlet />
      </main>

      {/* Bottom Accessibility Controls */}
      <footer className="h-12 sm:h-14 bg-slate-200 flex items-center justify-between px-3 sm:px-4 border-t-2 border-slate-300 shrink-0 z-10">
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
