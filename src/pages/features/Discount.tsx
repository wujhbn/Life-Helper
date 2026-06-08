import { useState } from 'react';
import { PageContainer } from '../../components/SharedUI';
import { speak } from '../../lib/speech';

export default function DiscountPage() {
  const [price, setPrice] = useState('0');
  const [discount, setDiscount] = useState<number | null>(null);

  const finalPrice = discount ? Math.round(parseFloat(price || '0') * discount) : parseFloat(price || '0');

  const handleNum = (num: string) => {
    speak(num);
    setPrice(price === '0' ? num : price + num);
  };

  const clearNum = () => {
    speak("清除");
    setPrice('0');
    setDiscount(null);
  };

  const applyDiscount = (val: number, label: string) => {
    setDiscount(val);
    const result = Math.round(parseFloat(price || '0') * val);
    speak(`${label}，特價 ${result} 元`);
  };

  const btnClass = "bg-white border-b-4 border-purple-200 rounded-xl text-xl sm:text-2xl font-black text-slate-700 hover:bg-purple-50 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center py-2 shadow-sm";

  return (
    <PageContainer title="折扣計算" icon="💰" color="border-purple-500">
      <div className="flex flex-col h-full lg:flex-row gap-2 max-w-5xl mx-auto w-full min-h-0 overflow-y-auto">
        
        {/* Left: Input */}
        <div className="flex-1 flex flex-col bg-purple-50 rounded-2xl p-3 border-2 border-purple-200 shrink-0">
          <div className="text-lg font-bold text-purple-800 mb-2 pl-2">1. 原價多少錢？</div>
          <div className="bg-white rounded-xl p-3 text-right shadow-inner border border-slate-100 flex items-center justify-between mb-3 shrink-0">
            <span className="text-2xl text-slate-400 font-bold">$</span>
            <span className="text-4xl font-black text-slate-800 tracking-tighter truncate">{price}</span>
          </div>

          <div className="grid grid-cols-3 gap-2 flex-grow min-h-[160px]">
            {['7','8','9','4','5','6','1','2','3'].map(n => (
              <button key={n} onClick={() => handleNum(n)} className={btnClass}>{n}</button>
            ))}
            <button onClick={clearNum} className="bg-rose-100 border-b-4 border-rose-300 rounded-xl text-xl font-black text-rose-700 hover:bg-rose-200 active:border-b-0 active:translate-y-1 transition-all shadow-sm">清除 C</button>
            <button onClick={() => handleNum('0')} className={btnClass}>0</button>
            <button onClick={() => handleNum('00')} className={btnClass}>00</button>
          </div>
        </div>

        {/* Right: Discount & Result */}
        <div className="flex-1 flex flex-col gap-2 shrink-0">
          <div className="bg-purple-50 rounded-2xl p-3 border-2 border-purple-200">
            <div className="text-lg font-bold text-purple-800 mb-2 pl-2">2. 打幾折？</div>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => applyDiscount(0.9, '9折')} className={`p-2 sm:p-3 rounded-xl text-base sm:text-xl font-black border-b-4 active:border-b-0 active:translate-y-1 transition-all shadow-sm ${discount === 0.9 ? 'bg-purple-600 border-purple-800 text-white' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'}`}>9折</button>
              <button onClick={() => applyDiscount(0.8, '8折')} className={`p-2 sm:p-3 rounded-xl text-base sm:text-xl font-black border-b-4 active:border-b-0 active:translate-y-1 transition-all shadow-sm ${discount === 0.8 ? 'bg-purple-600 border-purple-800 text-white' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'}`}>8折</button>
              <button onClick={() => applyDiscount(0.75, '75折')} className={`p-2 sm:p-3 rounded-xl text-base sm:text-xl font-black border-b-4 active:border-b-0 active:translate-y-1 transition-all shadow-sm ${discount === 0.75 ? 'bg-purple-600 border-purple-800 text-white' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'}`}>75折</button>
              <button onClick={() => applyDiscount(0.7, '7折')} className={`p-2 sm:p-3 rounded-xl text-base sm:text-xl font-black border-b-4 active:border-b-0 active:translate-y-1 transition-all shadow-sm ${discount === 0.7 ? 'bg-purple-600 border-purple-800 text-white' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'}`}>7折</button>
              <button onClick={() => applyDiscount(0.6, '6折')} className={`p-2 sm:p-3 rounded-xl text-base sm:text-xl font-black border-b-4 active:border-b-0 active:translate-y-1 transition-all shadow-sm ${discount === 0.6 ? 'bg-purple-600 border-purple-800 text-white' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'}`}>6折</button>
              <button onClick={() => applyDiscount(0.5, '半價')} className={`p-2 sm:p-3 rounded-xl text-base sm:text-xl font-black border-b-4 active:border-b-0 active:translate-y-1 transition-all shadow-sm ${discount === 0.5 ? 'bg-red-500 border-red-700 text-white' : 'bg-white border-slate-300 text-red-600 hover:bg-slate-50'}`}>半價(5折)</button>
            </div>
          </div>

          <div className="flex-1 bg-amber-100 rounded-2xl p-4 border-2 border-amber-300 flex flex-col justify-center items-center text-center min-h-[140px]">
            <div className="text-xl font-bold text-amber-800 mb-2">算出來的特價是：</div>
            <div className="text-5xl sm:text-6xl font-black text-rose-600 tracking-tighter mb-2">
              <span className="text-3xl mr-1">$</span>{finalPrice}
            </div>
            {discount && (
              <div className="text-sm font-bold text-slate-500 bg-white/50 px-4 py-1 rounded-full">
                省下了 {parseFloat(price || '0') - finalPrice} 元
              </div>
            )}
          </div>
        </div>

      </div>
    </PageContainer>
  );
}
