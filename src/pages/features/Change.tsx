import { useState } from 'react';
import { PageContainer } from '../../components/SharedUI';
import { speak, playSound } from '../../lib/speech';

export default function ChangePage() {
  const [price, setPrice] = useState('');
  const [paid, setPaid] = useState('');
  const [step, setStep] = useState(1);

  const calculateChange = () => {
    const p = parseInt(price || '0', 10);
    const pd = parseInt(paid || '0', 10);
    if (pd >= p) {
      setStep(3);
      speak(`找您 ${pd - p} 元`);
      playSound('complete');
    } else {
      speak("給的錢不夠哦");
    }
  };

  const getBreakdown = (amount: number) => {
    let remain = amount;
    const res: Record<number, number> = { 1000: 0, 500: 0, 100: 0, 50: 0, 10: 0, 5: 0, 1: 0 };
    [1000, 500, 100, 50, 10, 5, 1].forEach(denom => {
      res[denom] = Math.floor(remain / denom);
      remain %= denom;
    });
    return res;
  };

  const handleNum = (n: string) => {
    speak(n);
    if (step === 1) setPrice(prev => (prev === '0' ? n : prev + n));
    if (step === 2) setPaid(prev => (prev === '0' ? n : prev + n));
  };

  const reset = () => {
    setPrice('');
    setPaid('');
    setStep(1);
    speak("重新開始");
  };

  const currentVal = step === 1 ? price : paid;

  const btnClass = "bg-white border-b-4 border-slate-300 rounded-2xl text-2xl sm:text-4xl font-black text-slate-700 hover:bg-slate-50 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center p-2 sm:p-3 shadow-sm";

  return (
    <PageContainer title="找錢練習" icon="💵" color="border-teal-500">
      <div className="flex flex-col h-full gap-2 max-w-md mx-auto w-full min-h-0 overflow-y-auto pb-4">
        
        {/* Steps Header */}
        <div className="flex justify-between items-center bg-teal-50 rounded-2xl p-2 border-2 border-teal-200 shrink-0">
          <div className={`flex-1 text-center py-1 sm:py-2 rounded-xl text-xs sm:text-lg font-bold transition-colors ${step >= 1 ? 'bg-teal-500 text-white shadow-md' : 'text-teal-300'}`}>1. 物品錢</div>
          <div className="w-4 sm:w-6 text-center text-teal-300 text-sm sm:text-xl font-bold">➔</div>
          <div className={`flex-1 text-center py-1 sm:py-2 rounded-xl text-xs sm:text-lg font-bold transition-colors ${step >= 2 ? 'bg-teal-500 text-white shadow-md' : 'text-teal-300'}`}>2. 付錢</div>
          <div className="w-4 sm:w-6 text-center text-teal-300 text-sm sm:text-xl font-bold">➔</div>
          <div className={`flex-1 text-center py-1 sm:py-2 rounded-xl text-xs sm:text-lg font-bold transition-colors ${step === 3 ? 'bg-amber-400 text-white shadow-md' : 'text-teal-300'}`}>3. 找回錢</div>
        </div>

        {step < 3 ? (
          <div className="flex flex-col w-full bg-slate-100 p-3 sm:p-5 rounded-3xl border-2 border-slate-200 min-h-min shrink-0">
            <div className="text-xl sm:text-2xl font-black text-slate-700 mb-3 text-center shrink-0">
              {step === 1 ? "輸入物品價格" : "輸入付款金額"}
            </div>

            {/* Display */}
            <div className="bg-slate-800 rounded-2xl p-3 sm:p-5 mb-3 text-right overflow-hidden shadow-inner border-2 border-slate-700 shrink-0">
              <div className="text-4xl sm:text-5xl font-mono font-black text-emerald-400 truncate min-h-[2.5rem] sm:min-h-[3rem]">
                {currentVal || '0'}
              </div>
            </div>

            {/* Quick Actions (only in step 2) */}
            {step === 2 && (
              <div className="grid grid-cols-3 gap-2 mb-3 shrink-0">
                <button onClick={() => { setPaid('100'); speak('100元'); }} className="bg-green-100 p-2 rounded-2xl text-lg font-bold active:scale-95 shadow-sm border-b-4 border-green-300 hover:bg-green-200 text-green-800 flex items-center justify-center">100</button>
                <button onClick={() => { setPaid('500'); speak('500元'); }} className="bg-green-100 p-2 rounded-2xl text-lg font-bold active:scale-95 shadow-sm border-b-4 border-green-300 hover:bg-green-200 text-green-800 flex items-center justify-center">500</button>
                <button onClick={() => { setPaid('1000'); speak('1000元'); }} className="bg-green-100 p-2 rounded-2xl text-lg font-bold active:scale-95 shadow-sm border-b-4 border-green-300 hover:bg-green-200 text-green-800 flex items-center justify-center">1000</button>
              </div>
            )}

            {/* Keypad */}
            <div className="grid grid-cols-3 gap-2 flex-1 min-h-[200px]">
              {['7','8','9','4','5','6','1','2','3'].map(n => (
                <button key={n} onClick={() => handleNum(n)} className={btnClass}>{n}</button>
              )) }
              <button onClick={() => { speak('清除'); if(step===1) setPrice(''); else setPaid(''); }} className="bg-red-100 border-b-4 border-red-300 rounded-2xl text-lg sm:text-xl font-black text-red-700 hover:bg-red-200 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center p-2 shadow-sm whitespace-nowrap">清除 C</button>
              <button onClick={() => handleNum('0')} className={btnClass}>0</button>
              <button onClick={() => handleNum('00')} className="bg-white border-b-4 border-slate-300 rounded-2xl text-xl sm:text-2xl font-black text-slate-700 hover:bg-slate-50 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center p-2 shadow-sm">00</button>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-4 shrink-0">
               {step === 2 && (
                <button onClick={() => setStep(1)} className="flex-1 bg-slate-200 py-3 rounded-2xl text-lg sm:text-xl font-black text-slate-600 active:scale-95 border-b-4 border-slate-300 active:border-b-0 active:translate-y-1 shadow-sm shrink-0">返回</button>
               )}
               <button 
                  onClick={() => step === 1 ? setStep(2) : calculateChange()}
                  disabled={(step === 1 && !price) || (step === 2 && !paid)}
                  className="flex-[2] bg-teal-500 hover:bg-teal-600 disabled:bg-slate-300 text-white text-xl sm:text-2xl font-black py-4 rounded-2xl active:scale-95 transition-all shadow-md border-b-4 border-teal-700 active:border-b-0 active:translate-y-1 disabled:translate-y-0 disabled:border-slate-400"
               >
                  下一步 ➔
               </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-amber-50 rounded-2xl p-4 border-2 border-amber-200">
            <h3 className="text-2xl font-bold text-amber-800">老闆要找你：</h3>
            <div className="text-6xl sm:text-[80px] font-black text-rose-600 tracking-tighter leading-none mb-2">
              <span className="text-4xl mr-1">$</span>{parseInt(paid) - parseInt(price)}
            </div>

            <div className="flex flex-wrap justify-center gap-3 w-full">
              {Object.entries(getBreakdown(parseInt(paid) - parseInt(price))).reverse().filter(([, count]) => count > 0).map(([denom, count]) => (
                <div key={denom} className="flex flex-col items-center bg-white p-2 rounded-xl shadow-sm border border-slate-100 w-16 sm:w-20">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-sm sm:text-base font-bold shadow-inner ${
                    denom === '1000' ? 'bg-blue-200 text-blue-800' :
                    denom === '500' ? 'bg-orange-200 text-orange-800' :
                    denom === '100' ? 'bg-red-200 text-red-800' :
                    denom === '50' ? 'bg-yellow-300 text-yellow-800 border-2 border-yellow-400' :
                    denom === '10' ? 'bg-slate-300 text-slate-800 border-2 border-slate-400' :
                    denom === '5' ? 'bg-slate-200 text-slate-700' :
                    'bg-amber-600 text-white border-2 border-amber-700'
                  }`}>
                     {denom}
                  </div>
                  <div className="text-lg sm:text-xl font-black mt-1 text-slate-700">×{count}</div>
                </div>
              ))}
            </div>

            <button 
              onClick={reset}
              className="mt-4 bg-amber-400 hover:bg-amber-500 text-white text-xl font-black py-3 px-8 rounded-xl active:scale-95 transition-all shadow border-b-4 border-amber-600 active:border-b-0 active:translate-y-1 flex items-center gap-2"
            >
              <span>🔄</span> 再來一次
            </button>
          </div>
        )}

      </div>
    </PageContainer>
  );
}
