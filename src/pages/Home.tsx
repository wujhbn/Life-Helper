import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="flex flex-col flex-1 h-full pt-4 pb-8 sm:pt-6 sm:pb-12 overflow-y-auto w-full items-center">
      <div className="w-full max-w-[320px] sm:max-w-[420px] md:max-w-[560px] lg:max-w-[680px] xl:max-w-[800px] my-auto grid grid-cols-3 md:grid-cols-4 gap-x-2 gap-y-4 sm:gap-x-4 sm:gap-y-6 md:gap-x-6 md:gap-y-8 lg:gap-x-8 lg:gap-y-8">
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
      <div className="w-[80px] h-[80px] sm:w-[96px] sm:h-[96px] md:w-[104px] md:h-[104px] lg:w-[116px] lg:h-[116px] bg-white rounded-3xl border-4 border-b-[6px] sm:border-b-8 border-orange-200 flex items-center justify-center group-hover:border-orange-300 group-hover:bg-orange-50 group-active:border-b-4 group-active:translate-y-2 transition-all shadow-sm">
        <span className="text-[44px] sm:text-[48px] md:text-[52px] lg:text-[60px] leading-none drop-shadow-sm">{icon}</span>
      </div>
      <span className="mt-2 sm:mt-3 text-[14px] sm:text-[16px] md:text-[17px] lg:text-[18px] font-black text-slate-700 tracking-wider text-center">
        {title}
      </span>
    </Link>
  );
}
