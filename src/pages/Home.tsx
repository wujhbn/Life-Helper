import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="p-4 sm:p-6 h-full overflow-y-auto">
      <div className="w-full max-w-sm sm:max-w-md mx-auto mt-4 sm:mt-12 grid grid-cols-3 gap-x-4 gap-y-7 sm:gap-x-6 sm:gap-y-10 pb-10">
        <FeatureButton to="/timer" icon="⏰" title="計時器" />
        <FeatureButton to="/countdown" icon="⌛" title="倒數計時" />
        <FeatureButton to="/calendar" icon="📅" title="日曆" />
        <FeatureButton to="/calculator" icon="🧮" title="計算機" />
        <FeatureButton to="/discount" icon="💰" title="折扣計算" />
        <FeatureButton to="/change" icon="💵" title="找錢練習" />
        <FeatureButton to="/tasks" icon="📝" title="工作步驟" />
        <FeatureButton to="/schedule" icon="📋" title="今日行程" />
        <FeatureButton to="/emergency" icon="☎️" title="緊急聯絡" />
      </div>
    </div>
  );
}

function FeatureButton({ to, icon, title }: { to: string, icon: string, title: string }) {
  return (
    <Link
      to={to}
      className="flex flex-col items-center group touch-manipulation"
    >
      <div className="w-[84px] h-[84px] sm:w-[96px] sm:h-[96px] bg-white rounded-[1.5rem] shadow-sm shadow-black/10 flex items-center justify-center transition-all duration-300 group-active:scale-90 group-active:opacity-70 group-hover:shadow-md">
        <span className="text-[44px] sm:text-[52px] leading-none drop-shadow-sm">{icon}</span>
      </div>
      <span className="mt-2 text-[13px] sm:text-[15px] font-medium text-slate-700 tracking-wide text-center">
        {title}
      </span>
    </Link>
  );
}
