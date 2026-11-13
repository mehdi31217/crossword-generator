
import React from 'react';
import { X, Trophy, Unlock, Swords, Grid3X3 } from 'lucide-react';
import { Language, PlayerLeague } from '../types';
import { LEAGUES, getLeague, getLeagueSizeRange, getLeagueCategories, getLeagueName, getLeagueProgress } from '../services/league';

interface LeagueInfoModalProps {
  language: Language;
  playerLeague: PlayerLeague;
  onClose: () => void;
}

const CategoryFa: Record<string, string> = {
  knowledge: 'عمومی',
  movies: 'سینما',
  cities: 'شهرها',
  food: 'غذا',
  body: 'بدن',
  jobs: 'شغل',
  tech: 'تک',
  nature: 'طبیعت',
  history: 'تاریخ',
  sports: 'ورزش',
  art: 'هنر',
  all: 'میکس',
};

function sizeLabels(minS: number, maxS: number, isFA: boolean): string {
  const sizes: string[] = [];
  for (let s = minS; s <= maxS; s++) sizes.push(`${s}×${s}`);
  return sizes.join(isFA ? '، ' : ', ');
}

export const LeagueInfoModal: React.FC<LeagueInfoModalProps> = ({ language, playerLeague, onClose }) => {
  const isFA = language === 'fa';
  const currentTier = getLeague(playerLeague.trophies);
  const { progress, next } = getLeagueProgress(playerLeague.trophies);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 backdrop-blur-sm" style={{ backgroundColor: 'rgba(46,28,18,.55)' }} onClick={onClose} />
      
      <div className="relative w-full max-w-md cg-glass p-6 max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-300" style={{ borderRadius: 26 }} dir={isFA ? 'rtl' : 'ltr'}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl grid place-items-center" style={{ background: 'rgba(176,127,34,.16)', color: '#9E7418', border: '1px solid rgba(176,127,34,.3)' }}>
              <Trophy size={22} />
            </div>
            <h3 className="text-lg font-black" style={{ color: 'var(--ink)' }}>
              {isFA ? 'لیگ‌ها' : 'Leagues'}
            </h3>
          </div>
          <button onClick={onClose} className="cg-btn-cream p-2 rounded-full transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Current League Progress */}
        <div className="rounded-2xl p-4 mb-4 flex-shrink-0" style={{ background: 'rgba(176,127,34,.10)', border: '1px solid rgba(176,127,34,.3)' }}>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{currentTier.icon}</span>
            <div>
              <p className="font-black text-sm" style={{ color: 'var(--ink)' }}>{getLeagueName(playerLeague.league, language)}</p>
              <p className="text-[10px] font-bold" style={{ color: 'var(--ink-2)' }}>{isFA ? `${playerLeague.trophies} جام` : `${playerLeague.trophies} trophies`}</p>
            </div>
          </div>
          {next && (
            <div className="mt-2">
              <div className="flex justify-between text-[10px] font-bold mb-1" style={{ color: 'var(--ink-2)' }}>
                <span>{isFA ? 'پیشرفت' : 'Progress'}</span>
                <span>{playerLeague.trophies}/{next.minTrophies}</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(36,26,20,.12)' }}>
                <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%`, backgroundColor: currentTier.color }} />
              </div>
              <p className="text-[9px] font-bold mt-1" style={{ color: 'var(--ink-3)' }}>
                {isFA ? `تا ${getLeagueName(next.id, language)}: ${next.minTrophies - playerLeague.trophies} جام دیگر` : `${next.minTrophies - playerLeague.trophies} more trophies to ${getLeagueName(next.id, language)}`}
              </p>
            </div>
          )}
        </div>

        {/* Unlock Info */}
        <div className="rounded-2xl p-3 mb-4 flex items-center gap-2 flex-shrink-0" style={{ background: 'rgba(78,107,114,.10)', border: '1px solid rgba(78,107,114,.28)' }}>
          <Unlock size={14} className="flex-shrink-0" style={{ color: '#4E6B72' }} />
          <p className="text-[10px] font-bold" style={{ color: '#3F5A60' }}>
            {(() => {
              const [minS, maxS] = getLeagueSizeRange(playerLeague.league as any);
              const cats = getLeagueCategories(playerLeague.league as any);
              const catNames = cats.map(c => isFA ? CategoryFa[c] || c : c).join(isFA ? '، ' : ', ');
              return `${sizeLabels(minS, maxS, isFA)} · ${catNames}`;
            })()}
          </p>
        </div>

        {/* League Table */}
        <div className="flex-1 overflow-y-auto -mx-2 px-2 space-y-1">
          {LEAGUES.map((tier, i) => {
            const [minS, maxS] = getLeagueSizeRange(tier.id as any);
            const cats = getLeagueCategories(tier.id as any);
            const isCurrent = tier.id === currentTier.id;
            const isUnlocked = playerLeague.trophies >= tier.minTrophies;
            return (
              <div
                key={tier.id}
                className="flex items-center gap-2 p-2 rounded-xl transition-all"
                style={isCurrent
                  ? { background: 'rgba(176,127,34,.16)', border: '1px solid rgba(176,127,34,.4)' }
                  : { background: isUnlocked ? 'var(--paper-lift)' : 'var(--paper-well-2)', border: '1px solid rgba(36,26,20,.08)' }}
              >
                <span className="text-lg w-8 text-center flex-shrink-0">{tier.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-black" style={{ color: isUnlocked ? 'var(--ink)' : 'var(--ink-3)' }}>
                      {getLeagueName(tier.id, language)}
                    </span>
                    {isCurrent && (
                      <span className="text-[8px] text-[#FFF6EC] px-1.5 py-0.5 rounded-full font-black" style={{ background: 'var(--clay-shell)' }}>
                        {isFA ? 'شما' : 'You'}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    <span className="text-[8px] px-1.5 py-0.5 rounded font-bold whitespace-nowrap" style={{ backgroundColor: 'rgba(36,26,20,.07)', color: 'var(--ink-2)' }}>
                      <Grid3X3 size={8} className="inline mr-0.5" />{sizeLabels(minS, maxS, isFA)}
                    </span>
                    <span className="text-[8px] px-1.5 py-0.5 rounded font-bold" style={{ backgroundColor: 'rgba(36,26,20,.07)', color: 'var(--ink-2)' }}>
                      {isFA ? `${tier.minWager} سکه` : `${tier.minWager}c`}
                    </span>
                    <span className="text-[7px] px-1 py-0.5 font-bold truncate max-w-[120px]" style={{ color: 'var(--ink-3)' }}>
                      {cats.slice(0, 3).map(c => isFA ? CategoryFa[c] || c : c).join(', ')}
                      {cats.length > 3 ? ` +${cats.length - 3}` : ''}
                    </span>
                  </div>
                </div>
                {!isUnlocked && (
                  <div className="flex-shrink-0" style={{ color: 'var(--ink-3)' }}>
                    <span className="text-[9px] font-bold">{tier.minTrophies}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <button onClick={onClose} className="mt-4 w-full py-3 font-bold text-xs transition-colors flex-shrink-0" style={{ color: 'var(--ink-3)' }}>
          {isFA ? 'بستن' : 'Close'}
        </button>
      </div>
    </div>
  );
};
