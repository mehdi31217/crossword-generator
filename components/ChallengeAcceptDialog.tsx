import React from 'react';
import { Language, Category, GridSize } from '../types';
import { ArrowLeft, Lock, Check, LayoutGrid, Globe2, Film, Building2, Utensils, User, Briefcase, Cpu, Leaf, Zap, Swords } from 'lucide-react';
import { SIZE_SCORE_THRESHOLDS, getUnlockedCategories } from '../utils/config';

interface ChallengeAcceptDialogProps {
  show: boolean;
  language: Language;
  senderName: string;
  opponentSize: number;
  opponentCategory: string;
  joinerSize: GridSize;
  joinerCategory: Category;
  playerScore: number;
  onJoinerSizeChange: (size: GridSize) => void;
  onJoinerCategoryChange: (cat: Category) => void;
  onAccept: () => void;
  onCancel: () => void;
}

const CATEGORIES = [
  { id: 'knowledge', labelFa: 'عمومی', labelEn: 'General', icon: <Globe2 size={16} /> },
  { id: 'movies', labelFa: 'سینما', labelEn: 'Movies', icon: <Film size={16} /> },
  { id: 'cities', labelFa: 'شهرها', labelEn: 'Cities', icon: <Building2 size={16} /> },
  { id: 'food', labelFa: 'غذا', labelEn: 'Food', icon: <Utensils size={16} /> },
  { id: 'body', labelFa: 'بدن', labelEn: 'Body', icon: <User size={16} /> },
  { id: 'jobs', labelFa: 'شغل', labelEn: 'Jobs', icon: <Briefcase size={16} /> },
  { id: 'tech', labelFa: 'تک', labelEn: 'Tech', icon: <Cpu size={16} /> },
  { id: 'nature', labelFa: 'طبیعت', labelEn: 'Nature', icon: <Leaf size={16} /> },
  { id: 'history', labelFa: 'تاریخ', labelEn: 'History', icon: <Globe2 size={16} /> },
  { id: 'sports', labelFa: 'ورزش', labelEn: 'Sports', icon: <Zap size={16} /> },
  { id: 'art', labelFa: 'هنر', labelEn: 'Art', icon: <LayoutGrid size={16} /> },
  { id: 'all', labelFa: 'میکس', labelEn: 'Mixed', icon: <LayoutGrid size={16} /> },
];

export const ChallengeAcceptDialog: React.FC<ChallengeAcceptDialogProps> = ({
  show,
  language,
  senderName,
  opponentSize,
  opponentCategory,
  joinerSize,
  joinerCategory,
  playerScore,
  onJoinerSizeChange,
  onJoinerCategoryChange,
  onAccept,
  onCancel,
}) => {
  if (!show) return null;

  const isFA = language === 'fa';
  const finalSize = Math.round(Math.sqrt((opponentSize || 5) * joinerSize));
  const opponentCat = CATEGORIES.find(c => c.id === opponentCategory);
  const unlockedCategories = getUnlockedCategories(playerScore);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 backdrop-blur-sm" style={{ backgroundColor: 'rgba(46,28,18,.55)' }} onClick={onCancel} />

      <div className="relative w-full max-w-sm cg-glass cg-rise p-6 flex flex-col" dir={isFA ? 'rtl' : 'ltr'}>
        <div className="flex items-center gap-3 mb-5 pb-4" style={{ borderBottom: '1px solid rgba(36,26,20,.12)' }}>
          <button
            onClick={onCancel}
            className="p-2 rounded-full transition-colors"
            style={{ backgroundColor: 'var(--paper-lift)', border: '1px solid rgba(36,26,20,.14)', color: 'var(--ink-2)' }}
          >
            <ArrowLeft size={20} className={isFA ? 'rotate-180' : ''} />
          </button>
          <div>
            <h3 className="font-black text-lg" style={{ color: 'var(--ink)' }}>{isFA ? 'دعوت به نبرد' : 'Battle Invitation'}</h3>
            <p className="text-[10px] font-bold" style={{ color: 'var(--ink-3)' }}>{isFA ? `از طرف ${senderName}` : `From ${senderName}`}</p>
          </div>
        </div>

        <div className="space-y-5 mb-5">
          {/* Opponent's settings — compact tag-style */}
          <div
            className="flex items-center justify-center gap-3 flex-wrap p-3 rounded-2xl"
            style={{ backgroundColor: 'rgba(176,127,34,.10)', border: '1px solid rgba(176,127,34,.24)' }}
          >
            <span className="text-[9px] font-black uppercase" style={{ color: 'var(--sand-stamp)' }}>{isFA ? 'حریف:' : 'Opponent:'}</span>
            <div
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
              style={{ backgroundColor: 'var(--paper)', border: '1px solid rgba(36,26,20,.12)', boxShadow: '0 1px 0 rgba(255,255,255,.7) inset' }}
            >
              <LayoutGrid size={12} style={{ color: 'var(--clay-ink)' }} />
              <span className="text-xs font-black" style={{ color: 'var(--clay-ink)' }}>{opponentSize}×{opponentSize}</span>
            </div>
            <div
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
              style={{ backgroundColor: 'var(--paper)', border: '1px solid rgba(36,26,20,.12)', boxShadow: '0 1px 0 rgba(255,255,255,.7) inset', color: 'var(--clay-ink)' }}
            >
              {opponentCat ? <>{opponentCat.icon}<span className="text-xs font-black">{isFA ? opponentCat.labelFa : opponentCat.labelEn}</span></> : <span className="text-xs font-black" style={{ color: 'var(--ink-3)' }}>—</span>}
            </div>
          </div>

          {/* Size selector — same as Lobby */}
          <div>
            <label className="block text-[10px] font-black mb-2 uppercase" style={{ color: 'var(--ink-3)' }}>{isFA ? 'ابعاد جدول شما' : 'Your Grid Size'}</label>
            <div className="grid grid-cols-3 gap-2" dir="ltr">
              {[5, 6, 7, 8, 9, 10].map((s) => {
                const unlocked = playerScore >= (SIZE_SCORE_THRESHOLDS[s] ?? 0);
                const isActive = joinerSize === s;
                return (
                  <button
                    key={s}
                    onClick={() => unlocked && onJoinerSizeChange(s as GridSize)}
                    className={`py-2 rounded-xl text-xs font-black transition-all ${isActive ? 'scale-105' : ''}`}
                    style={isActive ? {
                      backgroundImage: 'var(--clay-shell)',
                      color: '#FBF3E6',
                      border: '1px solid rgba(255,255,255,.22)',
                      boxShadow: 'inset 0 1px 0 rgba(255,232,214,.4), 0 6px 14px -10px rgba(46,28,18,.95)',
                    } : unlocked ? {
                      backgroundColor: 'var(--paper-lift)',
                      color: 'var(--ink-2)',
                      border: '1px solid rgba(36,26,20,.12)',
                    } : {
                      backgroundColor: 'rgba(36,26,20,.05)',
                      color: 'var(--ink-3)',
                      border: '1px solid rgba(36,26,20,.08)',
                      cursor: 'not-allowed',
                    }}
                  >
                    {unlocked ? `${s}×${s}` : <span className="flex items-center justify-center gap-1"><Lock size={10} />{s}×{s}</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category selector — same as Lobby (grid-cols-4) */}
          <div>
            <label className="block text-[10px] font-black mb-2 uppercase" style={{ color: 'var(--ink-3)' }}>{isFA ? 'موضوع جدول شما' : 'Your Topic'}</label>
            <div className="grid grid-cols-4 gap-2">
              {CATEGORIES.map((cat) => {
                const unlocked = unlockedCategories.includes(cat.id as Category);
                const isActive = joinerCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => unlocked && onJoinerCategoryChange(cat.id as Category)}
                    className="p-2 rounded-xl transition-all flex flex-col items-center gap-1"
                    style={isActive ? {
                      backgroundColor: 'rgba(176,127,34,.16)',
                      border: '2px solid rgba(176,127,34,.55)',
                      color: 'var(--sand-stamp)',
                    } : unlocked ? {
                      backgroundColor: 'var(--paper-lift)',
                      border: '2px solid transparent',
                      color: 'var(--ink-3)',
                    } : {
                      backgroundColor: 'rgba(36,26,20,.05)',
                      border: '2px solid transparent',
                      color: 'var(--ink-3)',
                      opacity: .55,
                      cursor: 'not-allowed',
                    }}
                  >
                    {unlocked ? React.cloneElement(cat.icon, { size: 16 }) : <Lock size={14} />}
                    <span className="text-[8px] font-black text-center">{isFA ? cat.labelFa : cat.labelEn}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Final merged size */}
        <div className="rounded-2xl p-3 mb-4 text-center" style={{ backgroundColor: 'rgba(94,110,82,.12)', border: '1px solid rgba(94,110,82,.22)' }}>
          <p className="text-[9px] font-black uppercase" style={{ color: '#5E6E52' }}>{isFA ? 'سایز نهایی' : 'Final Size'}</p>
          <p className="text-lg font-black" style={{ color: '#4C5A42' }}>{finalSize}×{finalSize}</p>
        </div>

        {/* Two buttons: Cancel + Accept */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-4 rounded-2xl font-black text-xs active:scale-95 transition-all cg-btn-cream"
          >
            {isFA ? 'انصراف' : 'Cancel'}
          </button>
          <button
            onClick={onAccept}
            className="flex-1 py-4 rounded-2xl font-black text-xs active:scale-95 transition-all flex items-center justify-center gap-2 cg-btn-clay"
          >
            <Check size={16} />
            {isFA ? 'قبول و ورود' : 'Accept & Join'}
          </button>
        </div>
      </div>
    </div>
  );
};
