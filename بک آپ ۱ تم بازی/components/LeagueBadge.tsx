import React from 'react';
import { Info } from 'lucide-react';
import { PlayerLeague } from '../types';
import { getLeague, getLeagueProgress, getLeagueName, LEAGUES } from '../services/league';

interface LeagueBadgeProps {
  league: PlayerLeague;
  language?: 'fa' | 'en';
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
  showInfoButton?: boolean;
  onInfoClick?: () => void;
}

export const LeagueBadge: React.FC<LeagueBadgeProps> = ({ league, language = 'fa', size = 'md', showProgress = false, showInfoButton = false, onInfoClick }) => {
  const tier = getLeague(league.trophies);
  const { next, progress } = getLeagueProgress(league.trophies);
  const fa = (n: number) => String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[+d]);

  const sizeClass = size === 'sm' ? 'text-xs px-1.5 py-0.5 gap-1' : size === 'lg' ? 'text-lg px-4 py-2 gap-2' : 'text-sm px-3 py-1.5 gap-1.5';
  const iconSize = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-2xl' : 'text-lg';
  const barH = size === 'sm' ? 'h-1' : 'h-1.5';

  return (
    <div className="inline-flex flex-col gap-1">
      <div
        className={`inline-flex items-center rounded-full font-black shadow-sm border ${sizeClass}`}
        style={{ backgroundColor: tier.color + '20', borderColor: tier.color + '50', color: tier.color }}
      >
        <span className={iconSize}>{tier.icon}</span>
        <span>{getLeagueName(league.league, language)}</span>
        {showInfoButton && (
          <button
            onClick={(e) => { e.stopPropagation(); onInfoClick?.(); }}
            className="ml-1 p-0.5 rounded-full hover:bg-black/10 transition-colors"
          >
            <Info size={size === 'sm' ? 10 : 14} />
          </button>
        )}
      </div>
      {showProgress && next && (
        <div className="flex items-center gap-2">
          <div className={`flex-1 ${barH} rounded-full overflow-hidden`} style={{ backgroundColor: 'rgba(36,26,20,.12)' }}>
            <div
              className={`${barH} rounded-full transition-all duration-500`}
              style={{ width: `${progress}%`, backgroundColor: tier.color }}
            />
          </div>
          <span className="text-[10px] font-bold" style={{ color: tier.color }}>
            {language === 'fa'
              ? `${fa(league.trophies)}/${fa(next.minTrophies)}`
              : `${league.trophies}/${next.minTrophies}`}
          </span>
        </div>
      )}
    </div>
  );
};

interface LeagueIconProps {
  trophies: number;
  size?: number;
}

export const LeagueIcon: React.FC<LeagueIconProps> = ({ trophies, size = 24 }) => {
  const tier = getLeague(trophies);
  return <span style={{ fontSize: size }}>{tier.icon}</span>;
};
