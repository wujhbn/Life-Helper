import { useState, useEffect, useRef } from 'react';
import { PageContainer } from '../../components/SharedUI';
import { speak, playSound } from '../../lib/speech';

export default function TimerPage() {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [initialTime, setInitialTime] = useState(0);
  
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = window.setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (isActive && timeLeft === 0) {
      setIsActive(false);
      playSound('alert');
      speak("時間到了");
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isActive, timeLeft]);

  const setTimer = (minutes: number) => {
    const seconds = minutes * 60;
    setTimeLeft(seconds);
    setInitialTime(seconds);
    setIsActive(false);
  };

  const toggleTimer = () => {
    if (timeLeft > 0) setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(initialTime);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = initialTime > 0 ? ((initialTime - timeLeft) / initialTime) * 100 : 0;
  const quickButtons = [1, 3, 5, 10, 30];

  return (
    <PageContainer title="碼錶" icon="⏱️" color="border-rose-400">
      <div className="flex flex-col h-full gap-2 max-h-full min-h-0 pb-1">
        
        {/* Quick Settings */}
        <div className="flex justify-center gap-2 shrink-0 flex-wrap pb-2 border-b-2 border-slate-100">
          {quickButtons.map(m => (
            <button 
              key={m}
              onClick={() => { setTimer(m); speak(`設定${m}分鐘`); }}
              className="bg-rose-100 hover:bg-rose-200 text-rose-800 text-sm font-black py-2 px-3 rounded-lg active:scale-95 transition-all outline-none focus:ring-2 focus:ring-rose-400 shadow-sm border-2 border-rose-300 flex-1 min-w-[50px] max-w-[80px]"
            >
              {m}分
            </button>
          ))}
        </div>

        {/* Display */}
        <div className="flex-1 flex flex-col items-center justify-center min-h-0">
          <div className="relative w-[55vw] max-w-[200px] aspect-square flex items-center justify-center shrink-0">
            <svg className="absolute w-full h-full transform -rotate-90">
              <circle cx="50%" cy="50%" r="45%" className="fill-none stroke-rose-100" strokeWidth="10%" />
              <circle 
                cx="50%" cy="50%" r="45%" 
                className="fill-none stroke-rose-500 transition-all duration-1000 ease-linear" 
                strokeWidth="10%" 
                strokeDasharray="283%"
                strokeDashoffset={`${283 - (progress / 100) * 283}%`}
              />
            </svg>
            <div className="text-4xl sm:text-6xl font-mono font-black text-rose-600 z-10 tracking-tighter">
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-2 shrink-0">
          <button 
            onClick={() => { resetTimer(); speak("重置"); }}
            disabled={timeLeft === 0 && initialTime === 0}
            className="bg-slate-200 text-slate-700 text-base sm:text-lg font-black py-3 px-4 rounded-xl active:scale-95 transition-all disabled:opacity-50 shadow-sm border-b-4 border-slate-400 active:border-b-0 active:translate-y-1 flex items-center gap-1 flex-1 max-w-[120px] justify-center"
          >
            <span className="text-xl">🔄</span> 重置
          </button>
          
          <button 
            onClick={() => { toggleTimer(); speak(isActive ? "暫停" : "開始"); }}
            disabled={timeLeft === 0}
            className={`${isActive ? 'bg-amber-400 border-amber-600' : 'bg-green-500 border-green-700'} text-white text-base sm:text-lg font-black py-3 px-4 rounded-xl active:scale-95 transition-all disabled:opacity-50 shadow-sm border-b-4 active:border-b-0 active:translate-y-1 flex items-center gap-1 flex-1 max-w-[120px] justify-center`}
          >
            {isActive ? <><span className="text-xl">⏸️</span> 暫停</> : <><span className="text-xl">▶️</span> 開始</>}
          </button>
        </div>
      </div>
    </PageContainer>
  );
}
