import React, { useEffect, useState } from 'react';
import { Trophy, Users, Spinner } from './GlassIcons';
import { Language, LeagueId } from '../types';
import { gameServer } from '../utils/gameServer';
import { getLeague, getLeagueName } from '../services/league';
import { AvatarRenderer } from './AvatarRenderer';
import { getAvatarItem } from '../data/avatars';

interface LeaderboardProps {
  language: Language;
  playerScore: number;
}

interface LeaderboardPlayer {
  name: string;
  avatar: string;
  score: number;
  rank: number;
  trophies: number;
  league: LeagueId;
}

const PRIMARY = 'linear-gradient(135deg,#B4694B 0%,#8E4E37 100%)';
const faNum = (value: string | number) =>
  String(value).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[+d]);

export const Leaderboard: React.FC<LeaderboardProps> = ({ language, playerScore }) => {
  const isFA = language === 'fa';
  const [loading, setLoading] = useState(true);
  const [topPlayers, setTopPlayers] = useState<LeaderboardPlayer[]>([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      const data = await gameServer.getGlobalLeaderboard(language);
      setTopPlayers(data);
      setLoading(false);
    };
    fetchLeaderboard();
  }, [language]);

  const rankBg = (rank: number) => {
    if (rank === 1) return 'linear-gradient(135deg,#ffd60a,#ffb020)';
    if (rank === 2) return 'linear-gradient(135deg,#c2c8d6,#8e96a8)';
    if (rank === 3) return 'linear-gradient(135deg,#cd7f32,#b87333)';
    return 'var(--paper-well-2)';
  };
  const rankText = (rank: number) => {
    if (rank <= 3) return '#fff';
    return 'var(--ink-2)';
  };

  return (
    <div className="w-full h-full flex flex-col items-center overflow-hidden animate-in slide-in-from-right duration-500" dir={isFA ? 'rtl' : 'ltr'}>
      {/* Fixed header */}
      <header className="w-full max-w-lg mx-auto shrink-0 p-4 sm:p-5 flex items-center justify-between"
        style={{ background: 'var(--cg-glass)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid var(--cg-hair)' }}>
        <div className="flex items-center gap-3">
          <span className="inline-grid place-items-center rounded-2xl text-white" style={{ width: 42, height: 42, background: PRIMARY, boxShadow: '0 8px 18px -8px rgba(20,30,70,.5)' }}>
            <Trophy size={22} />
          </span>
          <div>
            <h2 className="text-base sm:text-lg font-black text-[var(--cg-ink)]">{isFA ? 'برترین‌های جهان' : 'Global Rankings'}</h2>
            <p className="text-[10px] font-bold text-[var(--cg-ink3)] uppercase tracking-widest">{isFA ? 'رقابت زنده آنلاین' : 'Live Online Competition'}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-black text-[11px]" style={{ background: 'var(--paper-lift)', border: '1px solid var(--paper-well-hair)', color: 'var(--ink-2)' }}>
          <Users size={14} />
          {topPlayers.length ? faNum(topPlayers.length) : '—'}
        </div>
      </header>

      {/* Scrollable list */}
      <div className="flex-1 w-full max-w-lg mx-auto overflow-y-auto p-3 sm:p-4 space-y-2.5" style={{ scrollbarWidth: 'none' }}>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-[var(--cg-ink3)]">
            <Spinner size={36} className="animate-spin" />
            <span className="text-xs font-black">{isFA ? 'در حال دریافت اطلاعات...' : 'Loading Rankings...'}</span>
          </div>
        ) : (
          <>
            {topPlayers.map((p, pi) => {
              const tier = getLeague(p.trophies);
              const isTop3 = p.rank <= 3;
              return (
                <div key={p.rank}
                  className="flex items-center gap-3 p-3 sm:p-3.5 rounded-3xl animate-card-enter transition-all"
                  style={{
                    background: isTop3 ? 'var(--paper)' : 'var(--paper-2)',
                    border: `1px solid ${isTop3 ? 'rgba(200,149,43,.42)' : 'var(--paper-well-hair)'}`,
                    boxShadow: isTop3 ? '0 10px 24px -12px rgba(70,45,30,.55)' : '0 1px 0 rgba(255,255,255,.18) inset',
                    animationDelay: `${0.1 + pi * 0.07}s`,
                  }}>
                  {/* Rank */}
                  <div className="w-10 h-10 rounded-2xl grid place-items-center font-black text-sm shadow-sm shrink-0"
                    style={{ background: rankBg(p.rank), color: rankText(p.rank) }}>
                    {p.rank === 1 ? <Trophy size={20} /> : faNum(p.rank)}
                  </div>

                  {/* Player */}
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <AvatarRenderer avatar={p.avatar} size={38} />
                    <div className="flex flex-col min-w-0">
                      <span className="font-black text-[var(--cg-ink)] text-sm truncate">{p.name}</span>
                      <span className="text-[10px] text-[var(--cg-ink3)] font-bold truncate">
                        {tier.icon}{' '}
                        {(() => {
                          const meta = getAvatarItem(p.avatar);
                          return meta
                            ? `${isFA ? meta.nameFa : meta.nameEn} · ${getLeagueName(p.league, language)}`
                            : getLeagueName(p.league, language);
                        })()}
                      </span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-3 shrink-0 text-right">
                    <div className="flex flex-col items-end">
                      <span className="font-mono font-black text-[var(--cg-ink)] text-base">{faNum(p.score.toLocaleString('en-US'))}</span>
                      <span className="text-[10px] font-bold text-[var(--sand-stamp)] flex items-center gap-0.5">
                        <Trophy size={10} /> {faNum(p.trophies)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Your score card */}
            <div className="mt-4 pt-4" style={{ borderTop: '1px dashed var(--cg-hair)' }}>
              <div className="flex items-center gap-3 p-4 rounded-3xl text-white shadow-xl"
                style={{ background: PRIMARY, boxShadow: '0 14px 32px -12px rgba(70,40,25,.6)' }}>
                <div className="w-11 h-11 rounded-2xl grid place-items-center font-black text-lg" style={{ background: 'rgba(255,255,255,.2)' }}>
                  ?
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-black uppercase opacity-80">{isFA ? 'امتیاز فعلی شما' : 'Your Current Score'}</div>
                  <div className="font-black text-base truncate">{isFA ? 'شما' : 'You'}</div>
                </div>
                <div className="font-mono font-black text-xl shrink-0">{faNum(playerScore.toLocaleString('en-US'))}</div>
              </div>
            </div>

            {/* Bottom spacer */}
            <div className="h-4" />
          </>
        )}
      </div>
    </div>
  );
};
