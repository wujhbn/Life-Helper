import { useState, useEffect, useRef } from 'react';
import { PageContainer } from '../../components/SharedUI';
import { speak, playSound } from '../../lib/speech';

export default function CountdownPage() {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [initialTime, setInitialTime] = useState(0);
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
      speak(`倒數開始`);
    }
  };

  const toggleTimer = () => { if (timeLeft > 0) setIsActive(!isActive); };
  const resetTimer = () => { setIsActive(false); setTimeLeft(0); setInitialTime(0); };
  const progress = initialTime > 0 ? ((initialTime - timeLeft) / initialTime) * 100 : 0;
  const formatHms = (sec: number) => {
    const hs = Math.floor(sec / 3600);
    const ms = Math.floor((sec % 3600) / 60);
    const ss = sec % 60;
    return `${hs.toString().padStart(2, '0')}:${ms.toString().padStart(2, '0')}:${ss.toString().padStart(2, '0')}`;
  };

  return (
    <PageContainer title="倒數計時" icon="⌛" color="border-orange-400">
      <div className="flex flex-col h-full gap-2 max-h-full min-h-0 pt-2">
        {timeLeft === 0 && initialTime === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 min-h-0">
            <div className="flex gap-2 sm:gap-4 items-center text-4xl sm:text-5xl font-mono font-black text-orange-600 max-w-full">
              <div className="flex flex-col items-center gap-1 bg-orange-50 p-2 sm:p-4 rounded-2xl border-2 border-orange-200 shadow-sm flex-1">
                <button onPointerDown={() => setH(px => Math.min(23, px + 1))} className="bg-white rounded-lg px-2 sm:px-4 py-1 sm:py-2 shadow active:scale-95 text-xl sm:text-2xl border border-slate-200">▲</button>
                <span>{h.toString().padStart(2, '0')}</span>
                <button onPointerDown={() => setH(px => Math.max(0, px - 1))} className="bg-white rounded-lg px-2 sm:px-4 py-1 sm:py-2 shadow active:scale-95 text-xl sm:text-2xl border border-slate-200">▼</button>
                <span className="text-sm font-sans text-orange-500 mt-1">時</span>
              </div>
              <span className="text-orange-300 pb-4">:</span>
              <div className="flex flex-col items-center gap-1 bg-orange-50 p-2 sm:p-4 rounded-2xl border-2 border-orange-200 shadow-sm flex-1">
                <button onPointerDown={() => setM(px => (px + 1) % 60)} className="bg-white rounded-lg px-2 sm:px-4 py-1 sm:py-2 shadow active:scale-95 text-xl sm:text-2xl border border-slate-200">▲</button>
                <span>{m.toString().padStart(2, '0')}</span>
                <button onPointerDown={() => setM(px => (px - 1 + 60) % 60)} className="bg-white rounded-lg px-2 sm:px-4 py-1 sm:py-2 shadow active:scale-95 text-xl sm:text-2xl border border-slate-200">▼</button>
                <span className="text-sm font-sans text-orange-500 mt-1">分</span>
              </div>
              <span className="text-orange-300 pb-4">:</span>
              <div className="flex flex-col items-center gap-1 bg-orange-50 p-2 sm:p-4 rounded-2xl border-2 border-orange-200 shadow-sm flex-1">
                <button onPointerDown={() => setS(px => (px + 1) % 60)} className="bg-white rounded-lg px-2 sm:px-4 py-1 sm:py-2 shadow active:scale-95 text-xl sm:text-2xl border border-slate-200">▲</button>
                <span>{s.toString().padStart(2, '0')}</span>
                <button onPointerDown={() => setS(px => (px - 1 + 60) % 60)} className="bg-white rounded-lg px-2 sm:px-4 py-1 sm:py-2 shadow active:scale-95 text-xl sm:text-2xl border border-slate-200">▼</button>
                <span className="text-sm font-sans text-orange-500 mt-1">秒</span>
              </div>
            </div>
            <button 
              onClick={startCustom} disabled={h === 0 && m === 0 && s === 0}
              className="bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 text-white text-xl sm:text-2xl font-black py-4 px-10 rounded-full active:scale-95 transition-all shadow-md mt-4 border-b-4 border-orange-700 active:border-b-0 active:translate-y-1"
            >
              開始倒數
            </button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 min-h-0">
            <div className="w-full max-w-sm mx-auto h-6 bg-slate-100 rounded-full overflow-hidden border-2 border-slate-200 relative mb-4 shrink-0 shadow-inner">
              <div className="h-full bg-orange-500 transition-all duration-1000 ease-linear rounded-full" style={{ width: `${100 - progress}%` }}></div>
            </div>
            <div className="text-6xl sm:text-8xl font-mono font-black text-orange-600 tracking-tighter shrink-0 mb-4">
              {formatHms(timeLeft)}
            </div>
            <div className="flex justify-center gap-4 shrink-0 w-full max-w-sm">
              <button 
                 onClick={() => { resetTimer(); speak("停止"); }} 
                 className="flex-1 bg-slate-200 text-slate-700 text-lg sm:text-xl font-black py-3 px-6 rounded-xl active:scale-95 transition-all shadow border-b-4 border-slate-400 active:border-b-0 active:translate-y-1"
              >
                 停止
              </button>
              <button 
                 onClick={() => { toggleTimer(); speak(isActive ? "暫停" : "繼續"); }} 
                 className={`flex-1 ${isActive ? 'bg-amber-400 border-amber-600' : 'bg-green-500 border-green-700'} text-white text-lg sm:text-xl font-black py-3 px-6 rounded-xl active:scale-95 transition-all shadow border-b-4 active:border-b-0 active:translate-y-1`}
              >
                 {isActive ? '暫停' : '繼續'}
              </button>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
