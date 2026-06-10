import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="flex flex-col flex-1 h-full pt-1 pb-2 sm:pt-6 sm:pb-8 overflow-y-auto w-full items-center justify-center">
      <div className="w-full max-w-[330px] sm:max-w-md mx-auto grid grid-cols-3 gap-x-2 gap-y-3 sm:gap-x-6 sm:gap-y-8">
        <FeatureButton to="/calendar" icon="📅" title="日曆" />
        <FeatureButton to="/schedule" icon="📋" title="今日行程" />
        <FeatureButton to="/notes" icon="🗒️" title="備忘錄" />
        <FeatureButton to="/timer" icon="⏱️" title="碼錶" />
        <FeatureButton to="/countdown" icon="⌛" title="計時器" />
        <FeatureButton to="/alarm" icon="⏰" title="鬧鐘" />
        <FeatureButton to="/calculator" icon="🧮" title="計算機" />
        <FeatureButton to="/discount" icon="💰" title="折扣計算" />
        <FeatureButton to="/change" icon="💵" title="找錢練習" />
        <FeatureButton to="/weather" icon="⛅" title="現在天氣" />
        <FeatureButton to="/emergency" icon="☎️" title="緊急聯絡" />
        <FeatureButton to="/tasks" icon="📝" title="工作步驟" />
      </div>
    </div>
  );
}

function FeatureButton({ to, icon, title }: { to: string, icon: string, title: string }) {
  return (
    <Link
      to={to}
      className="flex flex-col items-center group touch-manipulation active:scale-95 transition-transform"
    >
      <div className="w-[76px] h-[76px] sm:w-[96px] sm:h-[96px] bg-white rounded-3xl border-4 border-b-[6px] sm:border-b-8 border-orange-200 flex items-center justify-center group-hover:border-orange-300 group-hover:bg-orange-50 group-active:border-b-4 group-active:translate-y-1 transition-all">
        <span className="text-[40px] sm:text-[48px] leading-none drop-shadow-sm">{icon}</span>
      </div>
      <span className="mt-2 text-[14px] sm:text-[16px] font-black text-slate-700 tracking-wider text-center">
        {title}
      </span>
    </Link>
  );
}
