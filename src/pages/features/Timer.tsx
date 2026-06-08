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
    <PageContainer title="計時器" icon="⏰" color="border-rose-400">
      <div className="flex flex-col h-full gap-8">
        
        {/* Quick Settings */}
        <div className="flex flex-wrap justify-center gap-4 shrink-0">
          {quickButtons.map(m => (
            <button 
              key={m}
              onClick={() => { setTimer(m); speak(`設定${m}分鐘`); }}
              className="bg-rose-100 hover:bg-rose-200 text-rose-800 text-3xl font-black py-4 px-8 rounded-2xl active:scale-95 transition-all outline-none focus:ring-4 focus:ring-rose-400 shadow-md border-4 border-rose-300"
            >
              {m} 分鐘
            </button>
          ))}
        </div>

        {/* Display */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="relative w-64 h-64 sm:w-96 sm:h-96 flex items-center justify-center">
            <svg className="absolute w-full h-full transform -rotate-90">
              <circle cx="50%" cy="50%" r="45%" className="fill-none stroke-rose-100" strokeWidth="10%" />
              <circle 
                cx="50%" 
                cy="50%" 
                r="45%" 
                className="fill-none stroke-rose-500 transition-all duration-1000 ease-linear" 
                strokeWidth="10%" 
                strokeDasharray="283%" /* 2 * pi * 45 = 282.7 */
                strokeDashoffset={`${283 - (progress / 100) * 283}%`}
              />
            </svg>
            <div className="text-6xl sm:text-8xl font-mono font-black text-rose-600 z-10">
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-6 shrink-0 pb-4">
          <button 
            onClick={() => { resetTimer(); speak("重置"); }}
            disabled={timeLeft === 0 && initialTime === 0}
            className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-3xl font-black py-6 px-12 rounded-[2rem] active:scale-95 transition-all disabled:opacity-50 shadow-lg border-b-8 border-slate-400 active:border-b-0 active:translate-y-2 flex items-center gap-2"
          >
            <span>🔄</span> 重置
          </button>
          
          <button 
            onClick={() => { toggleTimer(); speak(isActive ? "暫停" : "開始"); }}
            disabled={timeLeft === 0}
            className={`${isActive ? 'bg-amber-400 hover:bg-amber-500 border-amber-600' : 'bg-green-500 hover:bg-green-600 border-green-700'} text-white text-3xl font-black py-6 px-16 rounded-[2rem] active:scale-95 transition-all disabled:opacity-50 shadow-lg border-b-8 active:border-b-0 active:translate-y-2 flex items-center gap-2`}
          >
            {isActive ? <><span>⏸️</span> 暫停</> : <><span>▶️</span> 開始</>}
          </button>
        </div>
      </div>
    </PageContainer>
  );
}
