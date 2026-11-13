import React from 'react';
import { Swords } from 'lucide-react';
import { Language } from '../types';

interface IncomingChallengeNotificationProps {
  incomingChallenge: any;
  language: Language;
  onAccept: () => void;
  onDecline: () => void;
}

export const IncomingChallengeNotification: React.FC<IncomingChallengeNotificationProps> = ({
  incomingChallenge,
  language,
  onAccept,
  onDecline,
}) => {
  if (!incomingChallenge) return null;

  const isFA = language === 'fa';

  const categoryLabel = (cat: string): string => {
    if (cat === 'knowledge') return isFA ? 'عمومی' : 'General';
    if (cat === 'movies') return isFA ? 'سینما' : 'Movies';
    if (cat === 'all') return isFA ? 'میکس' : 'Mixed';
    return cat;
  };

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[2000] w-[90%] max-w-md animate-in slide-in-from-top-10">
      <div
        className="rounded-2xl p-4 flex items-center justify-between gap-3"
        style={{
          backgroundColor: 'rgba(252,247,236,.97)',
          border: '2px solid #8E4E37',
          boxShadow: '0 1px 0 rgba(255,255,255,.85) inset, 0 20px 34px -22px rgba(46,28,18,.95)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
            style={{
              background: 'var(--clay-shell)',
              border: '2px solid rgba(255,232,208,.55)',
              color: '#FFF6EC',
              boxShadow: 'inset 0 1px 0 rgba(255,226,204,.5), inset 0 -2px 0 rgba(58,30,18,.3)',
            }}
          >
            <Swords size={24} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-md"
                style={{ backgroundColor: 'rgba(142,78,55,.12)', color: '#8E4E37' }}
              >
                {isFA ? 'دعوت به نبرد' : 'BATTLE REQUEST'}
              </span>
            </div>
            <div className="font-black text-sm truncate mb-0.5" style={{ color: 'var(--ink)' }}>
              {incomingChallenge.payload?.senderName || incomingChallenge.senderName}
            </div>
            {incomingChallenge.payload?.size && incomingChallenge.payload?.category && (
              <div className="text-xs font-bold" style={{ color: '#8E4E37' }}>
                {incomingChallenge.payload.size}×{incomingChallenge.payload.size}
                {' | '}
                {categoryLabel(incomingChallenge.payload.category)}
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-1 shrink-0">
          <button
            onClick={onAccept}
            className="cg-btn-clay px-4 py-2 rounded-xl text-xs font-black"
          >
            {isFA ? 'قبول' : 'Accept'}
          </button>
          <button
            onClick={onDecline}
            className="cg-btn-cream px-4 py-2 rounded-xl text-xs font-bold"
          >
            {isFA ? 'رد' : 'Decline'}
          </button>
        </div>
      </div>
    </div>
  );
};
