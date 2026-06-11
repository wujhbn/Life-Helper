import { Link } from 'react-router-dom';
import React from 'react';

export const PageContainer = ({ title, icon, color, children }: { title: string, icon: string, color: string, children: React.ReactNode }) => (
  <div className="flex flex-col h-full px-4 max-w-7xl mx-auto w-full min-h-0 gap-3 pb-4 pt-4 bg-[#FFF8F0]">
    <div className="flex-1 bg-white rounded-[2rem] shadow-sm border-4 border-b-8 border-orange-200 p-3 sm:p-5 overflow-hidden flex flex-col min-h-0 relative">
      {/* Title inside the container acting like a label badge */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-white border-4 border-t-0 border-orange-200 px-6 pt-2 pb-3 rounded-b-3xl shrink-0 z-10 flex items-center justify-center">
        <h2 className={`text-xl sm:text-2xl font-black tracking-widest text-slate-700`}>
          {title}
        </h2>
      </div>
      <div className="flex-1 pt-12 flex flex-col min-h-0 w-full overflow-y-auto">
        {children}
      </div>
    </div>
  </div>
);
