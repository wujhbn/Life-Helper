import { useState, useEffect, useRef } from 'react';
import { PageContainer } from '../../components/SharedUI';
import { speak, playSound } from '../../lib/speech';

export default function CountdownPage() {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [initialTime, setInitialTime] = useState(0);
  
  // Custom Time State
  const [h, setH] = useState(0);
  const [m, setM] = useState(0);
  const [s, setS] = useState(0);

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

  const startCustom = () => {
    const totalSeconds = (h * 3600) + (m * 60) + s;
    if (totalSeconds > 0) {
      setTimeLeft(totalSeconds);
      setInitialTime(totalSeconds);
      setIsActive(true);
      speak(`倒數 ${h > 0 ? h + '小時' : ''} ${m > 0 ? m + '分鐘' : ''} ${s > 0 ? s + '秒' : ''} 開始`);
    }
  };

  const toggleTimer = () => {
    if (timeLeft > 0) setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(0);
    setInitialTime(0);
  };

  const progress = initialTime > 0 ? ((initialTime - timeLeft) / initialTime) * 100 : 0;

  const formatHms = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <PageContainer title="倒數計時" icon="⌛" color="border-orange-400">
      <div className="flex flex-col h-full gap-8">
        
        {timeLeft === 0 && initialTime === 0 ? (
          // Input Mode
          <div className="flex-1 flex flex-col items-center justify-center gap-12">
            <div className="flex gap-4 sm:gap-8 items-center text-5xl sm:text-7xl font-mono font-black text-orange-600">
              <div className="flex flex-col items-center gap-4 bg-orange-50 p-6 rounded-3xl border-4 border-orange-200">
                <button onPointerDown={() => setH(px => Math.min(23, px + 1))} className="bg-white rounded-xl px-4 py-2 hover:bg-orange-100 shadow active:scale-95 text-4xl">▲</button>
                <span>{h.toString().padStart(2, '0')}</span>
                <button onPointerDown={() => setH(px => Math.max(0, px - 1))} className="bg-white rounded-xl px-4 py-2 hover:bg-orange-100 shadow active:scale-95 text-4xl">▼</button>
                <span className="text-2xl text-orange-400">時</span>
              </div>
              <span className="text-orange-300 mb-8">:</span>
              <div className="flex flex-col items-center gap-4 bg-orange-50 p-6 rounded-3xl border-4 border-orange-200">
                <button onPointerDown={() => setM(px => (px + 1) % 60)} className="bg-white rounded-xl px-4 py-2 hover:bg-orange-100 shadow active:scale-95 text-4xl">▲</button>
                <span>{m.toString().padStart(2, '0')}</span>
                <button onPointerDown={() => setM(px => (px - 1 + 60) % 60)} className="bg-white rounded-xl px-4 py-2 hover:bg-orange-100 shadow active:scale-95 text-4xl">▼</button>
                <span className="text-2xl text-orange-400">分</span>
              </div>
              <span className="text-orange-300 mb-8">:</span>
              <div className="flex flex-col items-center gap-4 bg-orange-50 p-6 rounded-3xl border-4 border-orange-200">
                <button onPointerDown={() => setS(px => (px + 1) % 60)} className="bg-white rounded-xl px-4 py-2 hover:bg-orange-100 shadow active:scale-95 text-4xl">▲</button>
                <span>{s.toString().padStart(2, '0')}</span>
                <button onPointerDown={() => setS(px => (px - 1 + 60) % 60)} className="bg-white rounded-xl px-4 py-2 hover:bg-orange-100 shadow active:scale-95 text-4xl">▼</button>
                <span className="text-2xl text-orange-400">秒</span>
              </div>
            </div>
            
            <button 
              onClick={startCustom}
              disabled={h === 0 && m === 0 && s === 0}
              className="bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 text-white text-4xl font-black py-8 px-24 rounded-[3rem] active:scale-95 transition-all shadow-xl border-b-8 border-orange-700 active:border-b-0 active:translate-y-2 flex items-center gap-4 mt-8"
            >
              <span>▶️</span> 開始倒數
            </button>
          </div>
        ) : (
          // Display Mode
          <div className="flex-1 flex flex-col items-center justify-center gap-12">
            <div className="w-full h-8 bg-slate-100 rounded-full overflow-hidden border-4 border-slate-200 relative mb-8">
              <div 
                className="h-full bg-orange-500 transition-all duration-1000 ease-linear" 
                style={{ width: `${100 - progress}%` }}
              ></div>
            </div>
            
            <div className="text-7xl sm:text-[140px] font-mono font-black text-orange-600 tracking-tighter">
              {formatHms(timeLeft)}
            </div>

            <div className="flex justify-center gap-6 mt-12">
              <button 
                onClick={() => { resetTimer(); speak("停止"); }}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-3xl font-black py-6 px-12 rounded-[2rem] active:scale-95 transition-all shadow-lg border-b-8 border-slate-400 active:border-b-0 active:translate-y-2 flex items-center gap-2"
              >
                <span>⏹️</span> 停止
              </button>
              
              <button 
                onClick={() => { toggleTimer(); speak(isActive ? "暫停" : "繼續"); }}
                className={`${isActive ? 'bg-amber-400 hover:bg-amber-500 border-amber-600' : 'bg-green-500 hover:bg-green-600 border-green-700'} text-white text-3xl font-black py-6 px-16 rounded-[2rem] active:scale-95 transition-all shadow-lg border-b-8 active:border-b-0 active:translate-y-2 flex items-center gap-2`}
              >
                {isActive ? <><span>⏸️</span> 暫停</> : <><span>▶️</span> 繼續</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
