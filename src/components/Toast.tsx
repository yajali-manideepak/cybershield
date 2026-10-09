import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';

export const Toast: React.FC = () => {
  const { toast } = useDashboard();

  if (!toast) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full animate-in slide-in-from-bottom-5 duration-200">
      <div className={`p-4 rounded-xl border shadow-2xl flex items-start gap-3 backdrop-blur-md ${
        toast.type === 'success'
          ? 'bg-[#0D1E1E]/95 border-emerald-500/40 text-emerald-200'
          : toast.type === 'error'
          ? 'bg-[#220E15]/95 border-rose-500/40 text-rose-200'
          : 'bg-[#0E1726]/95 border-cyan-500/40 text-cyan-200'
      }`}>
        {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
        {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
        {toast.type === 'info' && <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />}
        
        <div className="flex-1 text-xs leading-relaxed font-medium">
          {toast.message}
        </div>
      </div>
    </div>
  );
};
