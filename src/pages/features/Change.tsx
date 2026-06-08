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

  const btnClass = "bg-white border-b-4 border-slate-300 rounded-xl text-xl sm:text-2xl font-black text-slate-700 hover:bg-slate-50 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center py-2 shadow-sm";

  return (
    <PageContainer title="找錢練習" icon="💵" color="border-teal-500">
      <div className="flex flex-col h-full gap-2 max-w-5xl mx-auto w-full min-h-0 overflow-y-auto">
        
        {/* Steps Header */}
        <div className="flex justify-between items-center bg-teal-50 rounded-2xl p-2 border-2 border-teal-200 shrink-0">
          <div className={`flex-1 text-center py-1 sm:py-2 rounded-xl text-xs sm:text-lg font-bold transition-colors ${step >= 1 ? 'bg-teal-500 text-white shadow-md' : 'text-teal-300'}`}>1. 物品錢</div>
          <div className="w-4 sm:w-6 text-center text-teal-300 text-sm sm:text-xl font-bold">➔</div>
          <div className={`flex-1 text-center py-1 sm:py-2 rounded-xl text-xs sm:text-lg font-bold transition-colors ${step >= 2 ? 'bg-teal-500 text-white shadow-md' : 'text-teal-300'}`}>2. 付錢</div>
          <div className="w-4 sm:w-6 text-center text-teal-300 text-sm sm:text-xl font-bold">➔</div>
          <div className={`flex-1 text-center py-1 sm:py-2 rounded-xl text-xs sm:text-lg font-bold transition-colors ${step === 3 ? 'bg-amber-400 text-white shadow-md' : 'text-teal-300'}`}>3. 找回錢</div>
        </div>

        {step < 3 ? (
          <div className="flex-1 flex flex-col lg:flex-row gap-2 min-h-0">
            {/* Input & Keypad */}
            <div className="flex-1 flex flex-col bg-slate-100 rounded-2xl p-3 border-2 border-slate-200">
              <div className="text-xl font-black text-slate-700 mb-2 text-center">
                {step === 1 ? "輸入價格" : "輸入給的錢"}
              </div>
              <div className="bg-white rounded-xl p-3 text-right shadow-inner border-2 border-slate-200 mb-3 shrink-0">
                <div className="text-4xl font-black text-slate-800 tracking-tighter truncate h-10">{currentVal || '0'}</div>
              </div>

              <div className="grid grid-cols-3 gap-2 flex-grow min-h-[140px]">
                {['7','8','9','4','5','6','1','2','3'].map(n => (
                  <button key={n} onClick={() => handleNum(n)} className={btnClass}>{n}</button>
                )) }
                <button onClick={() => { speak('清除'); if(step===1) setPrice(''); else setPaid(''); }} className="bg-rose-100 border-b-4 border-rose-300 rounded-xl text-xl font-black text-rose-700 hover:bg-rose-200 active:border-b-0 active:translate-y-1 transition-all shadow-sm">清</button>
                <button onClick={() => handleNum('0')} className={btnClass}>0</button>
                <button onClick={() => handleNum('00')} className={btnClass}>00</button>
              </div>
            </div>

            {/* Actions */}
            <div className="w-full lg:w-64 flex flex-col gap-2 shrink-0">
              {step === 2 && (
                <div className="flex-1 bg-green-50 rounded-2xl p-3 border-2 border-green-200 flex flex-col gap-2 min-h-[140px]">
                  <div className="text-sm font-bold text-green-800 mb-1">快速付整張：</div>
                  <button onClick={() => { setPaid('100'); speak('100元'); }} className="bg-green-100 p-2 rounded-xl text-lg font-bold flex items-center justify-between hover:bg-green-200 active:scale-95 shadow"><span>一百</span> <span>💵</span></button>
                  <button onClick={() => { setPaid('500'); speak('500元'); }} className="bg-green-100 p-2 rounded-xl text-lg font-bold flex items-center justify-between hover:bg-green-200 active:scale-95 shadow"><span>五百</span> <span>💷</span></button>
                  <button onClick={() => { setPaid('1000'); speak('1000元'); }} className="bg-green-100 p-2 rounded-xl text-lg font-bold flex items-center justify-between hover:bg-green-200 active:scale-95 shadow"><span>一千</span> <span>💶</span></button>
                </div>
              )}
              
              <button 
                onClick={() => step === 1 ? setStep(2) : calculateChange()}
                disabled={(step === 1 && !price) || (step === 2 && !paid)}
                className="bg-teal-500 hover:bg-teal-600 disabled:bg-slate-300 text-white text-xl font-black py-4 rounded-xl active:scale-95 transition-all shadow-md border-b-4 border-teal-700 active:border-b-0 active:translate-y-1 disabled:translate-y-0 disabled:border-slate-400 mt-auto shrink-0"
              >
                下一步 ➔
              </button>
              {step === 2 && (
                <button onClick={() => setStep(1)} className="bg-slate-200 py-2 rounded-lg text-sm font-bold text-slate-600 active:scale-95 shrink-0">返回改價格</button>
              )}
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
