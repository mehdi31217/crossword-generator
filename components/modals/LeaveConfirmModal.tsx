import React from 'react';
import { Language } from '../../types';
import { AlertTriangle } from 'lucide-react';

interface LeaveConfirmModalProps {
  isOpen: boolean;
  language: Language;
  onConfirm: () => void;
  onCancel: () => void;
}

export const LeaveConfirmModal: React.FC<LeaveConfirmModalProps> = ({
  isOpen,
  language,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] backdrop-blur-md flex items-center justify-center p-4 animate-in zoom-in-95" style={{ backgroundColor: 'rgba(46,28,18,.7)' }}>
      <div className="w-full max-w-sm cg-glass p-8 text-center">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: 'rgba(158,90,80,.14)', border: '1px solid rgba(158,90,80,.3)', color: '#9E5A50' }}
        >
          <AlertTriangle size={40} />
        </div>
        <h2 className="text-2xl font-black mb-2" style={{ color: 'var(--ink)' }}>
          {language === 'fa' ? 'خروج از بازی؟' : 'Leave Game?'}
        </h2>
        <p className="font-bold text-sm mb-6" style={{ color: 'var(--ink-2)' }}>
          {language === 'fa' 
            ? 'با خروج، حریف برنده می‌شود و شما باخت خواهید خورد.' 
            : 'Leaving will forfeit the match. Your opponent will win.'}
        </p>
        <div className="space-y-3">
          <button 
            onClick={onConfirm}
            className="w-full py-4 rounded-2xl font-black text-lg active:scale-95 transition-all cg-btn-brick"
          >
            {language === 'fa' ? 'بله، خروج' : 'Yes, Leave'}
          </button>
          <button 
            onClick={onCancel}
            className="w-full py-3 rounded-2xl font-black text-sm active:scale-95 transition-all cg-btn-cream"
          >
            {language === 'fa' ? 'انصراف' : 'Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
};
