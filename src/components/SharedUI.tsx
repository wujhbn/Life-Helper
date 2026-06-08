import { Link } from 'react-router-dom';

export const BackButton = () => (
  <Link to="/" className="inline-flex items-center justify-center gap-2 bg-slate-200 text-slate-800 px-6 py-4 rounded-full text-2xl sm:text-3xl font-black hover:bg-slate-300 transition-colors active:scale-95 shrink-0 shadow-md">
    <span className="text-3xl sm:text-4xl">🔙</span> 
    <span className="hidden sm:inline">回首頁</span>
  </Link>
);

export const PageContainer = ({ title, icon, color, children }: { title: string, icon: string, color: string, children: React.ReactNode }) => (
  <div className="flex flex-col h-full p-4 sm:p-8 max-w-7xl mx-auto w-full">
    <div className="flex items-center gap-4 mb-4 sm:mb-8 shrink-0">
      <BackButton />
      <h2 className={`text-3xl sm:text-6xl font-black ml-auto border-b-8 ${color} pb-2 tracking-wide flex items-center gap-4`}>
        <span className="text-4xl sm:text-7xl">{icon}</span> {title}
      </h2>
    </div>
    <div className="flex-1 bg-white rounded-3xl sm:rounded-[40px] shadow-2xl border-4 border-slate-200 p-4 sm:p-8 overflow-y-auto flex flex-col">
      {children}
    </div>
  </div>
);
