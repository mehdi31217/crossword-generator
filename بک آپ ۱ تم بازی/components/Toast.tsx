import React from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import type { ToastType } from '../hooks/useToast';

interface ToastData {
  id: number;
  msg: string;
  type: ToastType;
  exiting?: boolean;
}

interface ToastProps {
  toast: ToastData | null;
  onDismiss?: () => void;
}

const iconMap: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle size={16} className="text-[#DDEBD2]" />,
  error: <XCircle size={16} className="text-[#FFD9D2]" />,
  info: <Info size={16} className="text-[#D3E6EC]" />,
};

const shellMap: Record<ToastType, string> = {
  success: '#4C5A42',
  error: '#8A4A42',
  info: '#3F5A60',
};

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  if (!toast) return null;

  return (
    <div
      className={`fixed top-5 left-1/2 -translate-x-1/2 z-[400] transition-all duration-300 ${
        toast.exiting
          ? 'opacity-0 translate-y-[-20px] scale-95'
          : 'opacity-100 translate-y-0 scale-100 animate-in slide-in-from-top-8 fade-in duration-200'
      }`}
    >
      <div
        className="flex items-center gap-2.5 px-5 py-3 rounded-2xl font-bold text-sm"
        style={{
          backgroundColor: shellMap[toast.type],
          color: '#FBF3E6',
          border: '1px solid rgba(255,232,210,.22)',
          boxShadow: 'inset 0 1px 0 rgba(255,238,218,.28), inset 0 -2px 0 rgba(20,14,10,.3), 0 16px 28px -18px rgba(46,28,18,.9)',
        }}
      >
        {iconMap[toast.type]}
        <span className="leading-none">{toast.msg}</span>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="ml-1 p-0.5 rounded-full hover:bg-white/20 transition-all active:scale-90"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
};
