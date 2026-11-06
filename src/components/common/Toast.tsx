import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toast } = useApp();

  if (!toast) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center space-x-2.5 rounded-2xl bg-slate-900 px-4 py-3 text-xs font-semibold text-white shadow-2xl border border-slate-700 animate-in slide-in-from-bottom-5 duration-200">
      {toast.type === 'success' && <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0" />}
      {toast.type === 'error' && <AlertCircle className="h-4 w-4 text-rose-400 flex-shrink-0" />}
      {toast.type === 'info' && <Info className="h-4 w-4 text-indigo-400 flex-shrink-0" />}
      <span>{toast.message}</span>
    </div>
  );
};
