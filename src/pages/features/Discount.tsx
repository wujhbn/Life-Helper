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

  const btnClass = "bg-white border-b-8 border-purple-200 rounded-[2rem] text-4xl sm:text-5xl font-black text-slate-700 hover:bg-purple-50 active:border-b-0 active:translate-y-2 transition-all flex items-center justify-center py-4 shadow-sm";

  return (
    <PageContainer title="折扣計算" icon="💰" color="border-purple-500">
      <div className="flex flex-col h-full lg:flex-row gap-8 max-w-5xl mx-auto w-full">
        
        {/* Left: Input */}
        <div className="flex-1 flex flex-col bg-purple-50 rounded-[3rem] p-6 border-4 border-purple-200">
          <div className="text-2xl font-bold text-purple-800 mb-4 ml-4">1. 原價多少錢？</div>
          <div className="bg-white rounded-3xl p-6 text-right shadow-inner border-2 border-slate-100 flex items-center justify-between mb-6">
            <span className="text-4xl text-slate-400 font-bold">$</span>
            <span className="text-6xl sm:text-7xl font-black text-slate-800 tracking-tighter">{price}</span>
          </div>

          <div className="grid grid-cols-3 gap-3 flex-1 min-h-0">
            {['7','8','9','4','5','6','1','2','3'].map(n => (
              <button key={n} onClick={() => handleNum(n)} className={btnClass}>{n}</button>
            ))}
            <button onClick={clearNum} className="bg-rose-100 border-b-8 border-rose-300 rounded-[2rem] text-3xl font-black text-rose-700 hover:bg-rose-200 active:border-b-0 active:translate-y-2 transition-all shadow-sm">清除</button>
            <button onClick={() => handleNum('0')} className={btnClass}>0</button>
            <button onClick={() => handleNum('00')} className={btnClass}>00</button>
          </div>
        </div>

        {/* Right: Discount & Result */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="bg-purple-50 rounded-[3rem] p-6 border-4 border-purple-200">
            <div className="text-2xl font-bold text-purple-800 mb-4 ml-4">2. 打幾折？</div>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => applyDiscount(0.9, '9折')} className={`p-6 rounded-2xl text-3xl sm:text-4xl font-black border-b-8 active:border-b-0 active:translate-y-2 transition-all shadow-sm ${discount === 0.9 ? 'bg-purple-600 border-purple-800 text-white' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'}`}>9折 (少一點)</button>
              <button onClick={() => applyDiscount(0.8, '8折')} className={`p-6 rounded-2xl text-3xl sm:text-4xl font-black border-b-8 active:border-b-0 active:translate-y-2 transition-all shadow-sm ${discount === 0.8 ? 'bg-purple-600 border-purple-800 text-white' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'}`}>8折</button>
              <button onClick={() => applyDiscount(0.7, '7折')} className={`p-6 rounded-2xl text-3xl sm:text-4xl font-black border-b-8 active:border-b-0 active:translate-y-2 transition-all shadow-sm ${discount === 0.7 ? 'bg-purple-600 border-purple-800 text-white' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'}`}>7折</button>
              <button onClick={() => applyDiscount(0.5, '半價')} className={`p-6 rounded-2xl text-3xl sm:text-4xl font-black border-b-8 active:border-b-0 active:translate-y-2 transition-all shadow-sm ${discount === 0.5 ? 'bg-red-500 border-red-700 text-white' : 'bg-white border-slate-300 text-red-600 hover:bg-slate-50'}`}>5折 (半價!)</button>
            </div>
          </div>

          <div className="flex-1 bg-amber-100 rounded-[3rem] p-8 border-4 border-amber-300 flex flex-col justify-center items-center text-center">
            <div className="text-3xl font-bold text-amber-800 mb-4">算出來的特價是：</div>
            <div className="text-6xl sm:text-8xl font-black text-rose-600 tracking-tighter mb-4">
              <span className="text-5xl mr-2">$</span>{finalPrice}
            </div>
            {discount && (
              <div className="text-xl font-bold text-slate-500 bg-white/50 px-6 py-2 rounded-full">
                省下了 {parseFloat(price || '0') - finalPrice} 元
              </div>
            )}
          </div>
        </div>

      </div>
    </PageContainer>
  );
}
