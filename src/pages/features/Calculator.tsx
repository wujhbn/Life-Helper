import { useState } from 'react';
import { PageContainer } from '../../components/SharedUI';
import { speak } from '../../lib/speech';

export default function CalculatorPage() {
  const [display, setDisplay] = useState('0');
  const [previousVal, setPreviousVal] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForNewVal, setWaitingForNewVal] = useState(false);

  const calculate = (a: number, b: number, op: string) => {
    switch(op) {
      case '+': return a + b;
      case '-': return a - b;
      case '×': return a * b;
      case '÷': return b !== 0 ? a / b : 0;
      default: return b;
    }
  };

  const handleNum = (num: string) => {
    speak(num);
    if (waitingForNewVal) {
      setDisplay(num);
      setWaitingForNewVal(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const handleOp = (op: string) => {
    const speakOp = op === '+' ? '加' : op === '-' ? '減' : op === '×' ? '乘' : '除以外';
    speak(speakOp);
    
    const currentVal = parseFloat(display);
    if (previousVal === null) {
      setPreviousVal(currentVal);
    } else if (operator && !waitingForNewVal) {
      const res = calculate(previousVal, currentVal, operator);
      setDisplay(String(res));
      setPreviousVal(res);
    }
    setOperator(op);
    setWaitingForNewVal(true);
  };

  const handleEq = () => {
    if (operator && previousVal !== null && !waitingForNewVal) {
      const currentVal = parseFloat(display);
      const res = calculate(previousVal, currentVal, operator);
      setDisplay(String(res));
      setPreviousVal(null);
      setOperator(null);
      setWaitingForNewVal(true);
      speak(`等於 ${res}`);
    }
  };

  const handleClear = () => {
    speak("清除");
    setDisplay('0');
    setPreviousVal(null);
    setOperator(null);
    setWaitingForNewVal(false);
  };

  const btnClass = "bg-white border-b-4 border-slate-300 rounded-2xl text-2xl sm:text-4xl font-black text-slate-700 hover:bg-slate-50 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center p-3 shadow-sm";
  const opClass = "bg-green-100 border-b-4 border-green-300 rounded-2xl text-2xl sm:text-4xl font-black text-green-800 hover:bg-green-200 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center p-3 shadow-sm";

  return (
    <PageContainer title="計算機" icon="🧮" color="border-green-500">
      <div className="flex flex-col h-full max-w-sm mx-auto w-full bg-slate-100 p-3 sm:p-6 rounded-3xl border-2 border-slate-200 min-h-0">
        
        {/* Display */}
        <div className="bg-slate-800 rounded-2xl p-4 sm:p-5 mb-3 text-right overflow-hidden shadow-inner border-2 border-slate-700 shrink-0">
          <div className="text-xl text-slate-400 min-h-[1.5rem] mb-1 font-mono">
           {previousVal !== null ? `${previousVal} ${operator}` : ''}
          </div>
          <div className="text-4xl sm:text-5xl font-mono font-black text-emerald-400 truncate">
            {display}
          </div>
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-4 gap-2 flex-1 min-h-0">
          <button onClick={handleClear} className="col-span-2 bg-red-100 border-b-4 border-red-300 rounded-2xl text-xl sm:text-2xl font-black text-red-700 hover:bg-red-200 active:border-b-0 active:translate-y-1 transition-all shadow-sm">清除 C</button>
          <button onClick={() => handleOp('÷')} className={opClass}>÷</button>
          <button onClick={() => handleOp('×')} className={opClass}>×</button>

          <button onClick={() => handleNum('7')} className={btnClass}>7</button>
          <button onClick={() => handleNum('8')} className={btnClass}>8</button>
          <button onClick={() => handleNum('9')} className={btnClass}>9</button>
          <button onClick={() => handleOp('-')} className={opClass}>-</button>

          <button onClick={() => handleNum('4')} className={btnClass}>4</button>
          <button onClick={() => handleNum('5')} className={btnClass}>5</button>
          <button onClick={() => handleNum('6')} className={btnClass}>6</button>
          <button onClick={() => handleOp('+')} className={opClass}>+</button>

          <button onClick={() => handleNum('1')} className={btnClass}>1</button>
          <button onClick={() => handleNum('2')} className={btnClass}>2</button>
          <button onClick={() => handleNum('3')} className={btnClass}>3</button>
          <button onClick={handleEq} className="row-span-2 bg-amber-400 border-b-4 border-amber-600 rounded-2xl text-4xl sm:text-5xl font-black text-white hover:bg-amber-500 active:border-b-0 active:translate-y-1 transition-all shadow-sm flex items-center justify-center">=</button>

          <button onClick={() => handleNum('0')} className="col-span-2 bg-white border-b-4 border-slate-300 rounded-2xl text-2xl sm:text-4xl font-black text-slate-700 hover:bg-slate-50 active:border-b-0 active:translate-y-1 transition-all shadow-sm">0</button>
          <button onClick={() => handleNum('.')} className={btnClass}>.</button>
        </div>

      </div>
    </PageContainer>
  );
}
