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
    <div className="w-full h-[100dvh] bg-[#F2F2F7] flex flex-col font-sans overflow-hidden select-none relative">
      {/* Top Status Bar */}
      <header className="h-14 sm:h-16 bg-white/70 backdrop-blur-xl border-b border-slate-200/80 text-black flex items-center justify-between px-3 sm:px-5 shrink-0 z-10 relative">
        <div className="flex items-center gap-2">
          <Link to="/" className="p-1 px-2 text-blue-500 hover:text-blue-600 transition-colors active:opacity-70 flex-shrink-0 flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 sm:w-7 sm:h-7">
              <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.06 1.06l8.69-8.69z" />
              <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
            </svg>
          </Link>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-800">生活小幫手</h1>
        </div>
        <div className="flex flex-col items-end flex-shrink-0 pr-1">
          <div className="text-lg sm:text-xl font-semibold tracking-tight text-slate-800">{timeString}</div>
          <div className="text-[10px] sm:text-xs font-semibold text-slate-500 tracking-wide">{dateString}</div>
        </div>
      </header>

      {/* Main Area */}
      <main className="flex-grow overflow-hidden flex flex-col h-full min-h-0 relative z-0">
        <Outlet />
      </main>

      {/* Bottom Accessibility Controls */}
      <footer className="h-12 sm:h-14 bg-white/70 backdrop-blur-xl border-t border-slate-200/80 flex items-center justify-between px-3 sm:px-5 shrink-0 z-10 relative">
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
