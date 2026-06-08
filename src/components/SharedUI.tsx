import { Link } from 'react-router-dom';
import React from 'react';

export const PageContainer = ({ title, icon, color, children }: { title: string, icon: string, color: string, children: React.ReactNode }) => (
  <div className="flex flex-col h-full px-2 max-w-7xl mx-auto w-full min-h-0 gap-1 pb-2 pt-2">
    <div className="flex-1 bg-white rounded-2xl shadow-xl border-4 border-slate-200 p-2 sm:p-4 overflow-hidden flex flex-col min-h-0 relative">
      {children}
    </div>
  </div>
);
