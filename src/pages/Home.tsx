import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="p-2 h-full flex flex-col justify-center">
      <div className="w-full max-w-lg mx-auto grid grid-cols-3 grid-rows-3 gap-2 sm:gap-4 h-full max-h-full">
        <FeatureButton to="/timer" icon="⏰" title="計時器" colorClass="border-rose-400 hover:bg-rose-50 text-rose-700" />
        <FeatureButton to="/countdown" icon="⌛" title="倒數計時" colorClass="border-orange-400 hover:bg-orange-50 text-orange-700" />
        <FeatureButton to="/calendar" icon="📅" title="日曆" colorClass="border-blue-400 hover:bg-blue-50 text-blue-700" />
        <FeatureButton to="/calculator" icon="🧮" title="計算機" colorClass="border-green-500 hover:bg-green-50 text-green-700" />
        <FeatureButton to="/discount" icon="💰" title="折扣計算" colorClass="border-purple-500 hover:bg-purple-50 text-purple-700" />
        <FeatureButton to="/change" icon="💵" title="找錢練習" colorClass="border-teal-500 hover:bg-teal-50 text-teal-700" />
        <FeatureButton to="/tasks" icon="📝" title="工作步驟" colorClass="border-indigo-500 hover:bg-indigo-50 text-indigo-700" />
        <FeatureButton to="/schedule" icon="📋" title="今日行程" colorClass="border-amber-500 hover:bg-amber-50 text-amber-700" />
        <FeatureButton to="/emergency" icon="☎️" title="緊急聯絡" colorClass="border-red-600 hover:bg-red-50 text-red-700" />
      </div>
    </div>
  );
}

function FeatureButton({ to, icon, title, colorClass }: { to: string, icon: string, title: string, colorClass: string }) {
  return (
    <Link
      to={to}
      className={`bg-white border-[3px] sm:border-[4px] rounded-xl flex flex-col items-center justify-center gap-1 shadow flex-1 transition-all duration-200 group active:scale-95 py-2 ${colorClass}`}
    >
      <span className="text-4xl sm:text-5xl leading-none group-hover:scale-110 transition-transform mb-1">{icon}</span>
      <span className="text-sm sm:text-base font-black truncate px-1 text-slate-800">{title}</span>
    </Link>
  );
}
