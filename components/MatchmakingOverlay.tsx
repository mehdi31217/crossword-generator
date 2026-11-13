import React from 'react';
import { Swords } from 'lucide-react';
import { Language } from '../types';

interface MatchmakingOverlayProps {
  isMatchmaking: boolean;
  matchmakingStatus: string;
  language: Language;
  onCancel: () => void;
}

export const MatchmakingOverlay: React.FC<MatchmakingOverlayProps> = ({
  isMatchmaking,
  matchmakingStatus,
  language,
  onCancel,
}) => {
  if (!isMatchmaking || matchmakingStatus !== 'waiting') return null;

  return (
    <div className="fixed inset-0 z-[100] cg-dark cg-merge-overlay flex items-center justify-center px-6">
      <div className="w-full max-w-sm cg-glass cg-rise px-7 py-9 text-center" style={{ color: 'var(--ink)' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="relative mb-2">
            <div
              className="w-20 h-20 rounded-full animate-spin"
              style={{ border: '4px solid #B07F22', borderTopColor: 'transparent' }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Swords size={28} style={{ color: '#9E7418' }} />
            </div>
          </div>
          <h2 className="text-xl font-black">
            {language === 'fa' ? '🔍 در جستجوی حریف...' : 'Searching for opponent...'}
          </h2>
          <div className="flex items-center gap-3 mt-1">
            {[0, 0.2, 0.4].map((delay) => (
              <div
                key={delay}
                className="w-2 h-2 rounded-full animate-bounce"
                style={{ animationDelay: `${delay}s`, backgroundColor: '#5E6E52' }}
              />
            ))}
          </div>
          <p className="text-sm font-bold mt-2" style={{ color: 'var(--ink-2)' }}>
            {language === 'fa' ? 'در حال جستجوی بازیکنان آنلاین...' : 'Scanning for online players...'}
          </p>
          <p className="text-xs font-bold mt-1" style={{ color: 'var(--ink-3)' }}>
            {language === 'fa' ? 'بازیکنان با سطح و امتیاز مشابه' : 'Matching by league and wager'}
          </p>
          <button
            onClick={onCancel}
            className="cg-btn-cream w-full mt-7 py-3.5 rounded-2xl font-black text-sm transition-all active:scale-95"
          >
            {language === 'fa' ? '✕ لغو جستجو' : '✕ Cancel Search'}
          </button>
        </div>
      </div>
    </div>
  );
};
