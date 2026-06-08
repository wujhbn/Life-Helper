import { Link } from 'react-router-dom';

export const BackButton = () => (
  <Link to="/" className="inline-flex items-center justify-center gap-1 bg-slate-200 text-slate-800 px-3 py-1 sm:py-2 rounded-full text-base sm:text-lg font-black hover:bg-slate-300 transition-colors active:scale-95 shrink-0 shadow-sm border-2 border-slate-300">
    <span className="text-xl sm:text-2xl leading-none block">🔙</span> 
    <span className="hidden sm:inline">回首頁</span>
  </Link>
);

export const PageContainer = ({ title, icon, color, children }: { title: string, icon: string, color: string, children: React.ReactNode }) => (
  <div className="flex flex-col h-full px-2 max-w-7xl mx-auto w-full min-h-0 gap-2">
    <div className="flex items-center gap-2 shrink-0">
      <BackButton />
      <h2 className={`text-xl sm:text-3xl font-black ml-auto border-b-4 ${color} pb-1 tracking-wide flex items-center gap-2 truncate text-slate-800`}>
        <span className="text-2xl sm:text-3xl leading-none">{icon}</span> {title}
      </h2>
    </div>
    <div className="flex-1 bg-white rounded-2xl shadow-xl border-4 border-slate-200 p-2 sm:p-4 overflow-hidden flex flex-col min-h-0 relative">
      {children}
    </div>
  </div>
);
