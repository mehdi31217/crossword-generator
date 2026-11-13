import React from 'react';
import { Language, LoadingStage } from '../../types';
import { AlertTriangle, Loader2, RefreshCw } from 'lucide-react';

interface MultiplayerRetryModalProps {
  isOpen: boolean;
  language: Language;
  loadingStage: LoadingStage;
  onRetry: () => void;
  onCancel: () => void;
}

export const MultiplayerRetryModal: React.FC<MultiplayerRetryModalProps> = ({
  isOpen,
  language,
  loadingStage,
  onRetry,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] backdrop-blur-md flex items-center justify-center p-4 animate-in zoom-in-95" style={{ backgroundColor: 'rgba(46,28,18,.72)' }}>
      <div className="w-full max-w-sm cg-glass p-8 text-center">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: 'rgba(176,127,34,.14)', border: '1px solid rgba(176,127,34,.3)', color: '#9E7418' }}
        >
          <AlertTriangle size={40} />
        </div>
        <h2 className="text-2xl font-black mb-2" style={{ color: 'var(--ink)' }}>
          {language === 'fa' ? 'جدول ساخته نشد' : 'Grid Failed'}
        </h2>
        <p className="font-bold text-sm mb-6" style={{ color: 'var(--ink-2)' }}>
          {language === 'fa' 
            ? 'امکان ساخت جدول نبود. دوباره تلاش کن یا انصراف بده.' 
            : 'Could not build the grid. Retry or cancel.'}
        </p>
        <div className="space-y-3">
          <button 
            onClick={onRetry}
            disabled={loadingStage !== 'idle'}
            className="w-full py-4 rounded-2xl font-black text-lg active:scale-95 transition-all flex items-center justify-center gap-2 cg-btn-clay"
          >
            {loadingStage !== 'idle' ? <Loader2 className="animate-spin" size={20} /> : <RefreshCw size={20} />}
            {language === 'fa' ? 'دوباره تلاش کن' : 'Retry'}
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
