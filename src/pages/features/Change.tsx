import { useState } from 'react';
import { PageContainer } from '../../components/SharedUI';
import { speak, playSound } from '../../lib/speech';

export default function ChangePage() {
  const [price, setPrice] = useState('');
  const [paid, setPaid] = useState('');
  const [step, setStep] = useState(1); // 1: price, 2: paid, 3: result

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

  const btnClass = "bg-white border-b-8 border-slate-300 rounded-[2rem] text-4xl sm:text-5xl font-black text-slate-700 hover:bg-slate-50 active:border-b-0 active:translate-y-2 transition-all flex items-center justify-center py-6 shadow-sm";

  return (
    <PageContainer title="找錢練習" icon="💵" color="border-teal-500">
      <div className="flex flex-col h-full gap-6 max-w-5xl mx-auto w-full">
        
        {/* Steps Header */}
        <div className="flex justify-between items-center bg-teal-50 rounded-3xl p-4 border-2 border-teal-200 shrink-0">
          <div className={`flex-1 text-center py-3 rounded-2xl text-2xl font-bold transition-colors ${step >= 1 ? 'bg-teal-500 text-white shadow-md' : 'text-teal-300'}`}>1. 物品多少錢</div>
          <div className="w-8 text-center text-teal-300 text-2xl font-bold">➔</div>
          <div className={`flex-1 text-center py-3 rounded-2xl text-2xl font-bold transition-colors ${step >= 2 ? 'bg-teal-500 text-white shadow-md' : 'text-teal-300'}`}>2. 付了多少錢</div>
          <div className="w-8 text-center text-teal-300 text-2xl font-bold">➔</div>
          <div className={`flex-1 text-center py-3 rounded-2xl text-2xl font-bold transition-colors ${step === 3 ? 'bg-amber-400 text-white shadow-md' : 'text-teal-300'}`}>3. 找回多少錢</div>
        </div>

        {step < 3 ? (
          <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
            {/* Input Display & Keypad */}
            <div className="flex-1 flex flex-col bg-slate-100 rounded-[3rem] p-6 sm:p-8 border-4 border-slate-200">
              <div className="text-3xl font-black text-slate-700 mb-6 text-center">
                {step === 1 ? "輸入物品的價格" : "輸入你給老闆的錢"}
              </div>
              <div className="bg-white rounded-3xl p-6 text-right shadow-inner border-4 border-slate-200 mb-8">
                <div className="text-7xl sm:text-[100px] font-black text-slate-800 tracking-tighter truncate h-24">{currentVal || '0'}</div>
              </div>

              <div className="grid grid-cols-3 gap-3 flex-1 min-h-0">
                {['7','8','9','4','5','6','1','2','3'].map(n => (
                  <button key={n} onClick={() => handleNum(n)} className={btnClass}>{n}</button>
                )) }
                <button onClick={() => { speak('清除'); if(step===1) setPrice(''); else setPaid(''); }} className="bg-rose-100 border-b-8 border-rose-300 rounded-[2rem] text-3xl font-black text-rose-700 hover:bg-rose-200 active:border-b-0 active:translate-y-2 transition-all shadow-sm">清除</button>
                <button onClick={() => handleNum('0')} className={btnClass}>0</button>
                <button onClick={() => handleNum('00')} className={btnClass}>00</button>
              </div>
            </div>

            {/* Quick cash buttons & Actions */}
            <div className="w-full lg:w-80 flex flex-col gap-4">
              {step === 2 && (
                <div className="flex-1 bg-green-50 rounded-[3rem] p-6 border-4 border-green-200 flex flex-col gap-3">
                  <div className="text-xl font-bold text-green-800 mb-2">快速付錢：</div>
                  <button onClick={() => { setPaid('100'); speak('100元'); }} className="bg-green-100 p-4 rounded-xl text-2xl font-bold flex items-center justify-between hover:bg-green-200 active:scale-95 shadow"><span>一百元</span> <span>💵</span></button>
                  <button onClick={() => { setPaid('500'); speak('500元'); }} className="bg-green-100 p-4 rounded-xl text-2xl font-bold flex items-center justify-between hover:bg-green-200 active:scale-95 shadow"><span>五百元</span> <span>💷</span></button>
                  <button onClick={() => { setPaid('1000'); speak('1000元'); }} className="bg-green-100 p-4 rounded-xl text-2xl font-bold flex items-center justify-between hover:bg-green-200 active:scale-95 shadow"><span>一千元</span> <span>💶</span></button>
                </div>
              )}
              
              <button 
                onClick={() => step === 1 ? setStep(2) : calculateChange()}
                disabled={(step === 1 && !price) || (step === 2 && !paid)}
                className="bg-teal-500 hover:bg-teal-600 disabled:bg-slate-300 text-white text-4xl font-black py-8 rounded-[2rem] active:scale-95 transition-all shadow-lg border-b-8 border-teal-700 active:border-b-0 active:translate-y-2 disabled:translate-y-0 disabled:border-slate-400 mt-auto"
              >
                下一步 ➔
              </button>
              {step === 2 && (
                <button onClick={() => setStep(1)} className="bg-slate-200 py-4 rounded-2xl text-xl font-bold text-slate-600 active:scale-95">返回修改價格</button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-8 bg-amber-50 rounded-[3rem] p-8 border-4 border-amber-200">
            <h3 className="text-4xl font-bold text-amber-800">老闆要找你：</h3>
            <div className="text-[120px] font-black text-rose-600 tracking-tighter leading-none mb-4">
              <span className="text-6xl mr-2">$</span>{parseInt(paid) - parseInt(price)}
            </div>

            <div className="flex flex-wrap justify-center gap-6 max-w-3xl">
              {Object.entries(getBreakdown(parseInt(paid) - parseInt(price))).reverse().filter(([, count]) => count > 0).map(([denom, count]) => (
                <div key={denom} className="flex flex-col items-center bg-white p-4 rounded-3xl shadow-md border-2 border-slate-100 w-32">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold shadow-inner ${
                    denom === '1000' ? 'bg-blue-200 text-blue-800' :
                    denom === '500' ? 'bg-orange-200 text-orange-800' :
                    denom === '100' ? 'bg-red-200 text-red-800' :
                    denom === '50' ? 'bg-yellow-300 text-yellow-800 border-4 border-yellow-400' :
                    denom === '10' ? 'bg-slate-300 text-slate-800 border-4 border-slate-400' :
                    denom === '5' ? 'bg-slate-200 text-slate-700' :
                    'bg-amber-600 text-white border-2 border-amber-700'
                  }`}>
                     {denom}
                  </div>
                  <div className="text-4xl font-black mt-3 text-slate-700">× {count}</div>
                </div>
              ))}
            </div>

            <button 
              onClick={reset}
              className="mt-8 bg-amber-400 hover:bg-amber-500 text-white text-3xl font-black py-6 px-16 rounded-[2rem] active:scale-95 transition-all shadow-lg border-b-8 border-amber-600 active:border-b-0 active:translate-y-2 flex items-center gap-3"
            >
              <span>🔄</span> 再練習一次
            </button>
          </div>
        )}

      </div>
    </PageContainer>
  );
}
