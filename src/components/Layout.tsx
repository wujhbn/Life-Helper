import { Outlet, Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function Layout() {
  const [time, setTime] = useState(new Date());
  const location = useLocation();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = time.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false });
  const dateString = time.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });

  return (
    <div className="w-full h-[100dvh] bg-[#F1F5F9] flex flex-col font-sans overflow-hidden select-none">
      {/* Top Status Bar */}
      <header className="h-20 sm:h-24 bg-blue-700 text-white flex items-center justify-between px-4 sm:px-10 shadow-lg shrink-0">
        <div className="flex items-center gap-3 sm:gap-4">
          <Link to="/" className="bg-white/20 p-2 sm:p-3 rounded-full hover:bg-white/30 transition-colors focus:ring-4 focus:ring-white">
            <span className="text-3xl sm:text-4xl leading-none block">🏠</span>
          </Link>
          <h1 className="text-2xl sm:text-5xl font-black tracking-tight">生活小幫手</h1>
        </div>
        <div className="flex flex-col items-end">
          <div className="text-3xl sm:text-5xl font-mono font-bold leading-none">{timeString}</div>
          <div className="text-sm sm:text-xl font-bold opacity-90">{dateString}</div>
        </div>
      </header>

      {/* Main Area */}
      <main className="flex-grow overflow-y-auto">
        <Outlet />
      </main>

      {/* Bottom Accessibility Controls */}
      <footer className="h-16 sm:h-20 bg-slate-200 flex items-center justify-around px-2 sm:px-8 border-t-2 border-slate-300 shrink-0">
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="w-6 h-6 sm:w-12 sm:h-12 bg-green-500 rounded-full animate-pulse border-2 border-green-600"></div>
          <span className="text-lg sm:text-2xl font-bold text-slate-700">語音助理已就緒</span>
        </div>
        <div className="flex gap-2 sm:gap-8">
          <button className="bg-white px-4 sm:px-8 py-2 rounded-full border-2 border-slate-400 font-bold text-sm sm:text-xl flex items-center gap-1 sm:gap-2 hover:bg-slate-50 transition-colors active:scale-95">
            <span className="text-xl sm:text-2xl">🔊</span> <span className="hidden sm:inline">語音音量</span>
          </button>
          <button className="bg-white px-4 sm:px-8 py-2 rounded-full border-2 border-slate-400 font-bold text-sm sm:text-xl flex items-center gap-1 sm:gap-2 hover:bg-slate-50 transition-colors active:scale-95">
            <span className="text-xl sm:text-2xl">⚙️</span> <span className="hidden sm:inline">設定</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
