import React, { useEffect, useState } from 'react';
import { Language, WorldMapCardRarity, WORLD_MAP_RARITY, PlayerState } from '../types';
import { LegendCard, LegendCardLegend } from './LegendCard';
import { Zap, Trophy, ChevronRight, Sparkles, Flame } from 'lucide-react';
import { gameServer } from '../utils/gameServer';
import { KILN_POLISH_COSTS, getKilnPolishRecipe } from '../utils/economy';
import { soundEngine } from '../utils/soundEngine';

const faNum = (n: number | string) => String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[+d]);

interface WorldMapCardRevealModalProps {
  language: Language;
  chapterId?: string;
  chapterTitle: { fa: string; en: string };
  chapterSubtitle: { fa: string; en: string };
  rarity: WorldMapCardRarity;
  bgImage?: string | null;
  legendColor: string;
  legendIcon: string;
  legendName: { fa: string; en: string };
  matchScore: number;
  finalSeconds: number;
  wordCount: number;
  player?: PlayerState | null;
  onPlayerUpdate?: (player: PlayerState) => void;
  onCardPolished?: (newRarity: WorldMapCardRarity) => void;
  onClose: () => void;
  onContinue: () => void;
}

function hexToRgba(hex: string, alpha: number): string {
  const c = hex.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export const WorldMapCardRevealModal: React.FC<WorldMapCardRevealModalProps> = ({
  language, chapterId, chapterTitle, rarity, bgImage,
  legendColor, legendIcon, legendName,
  matchScore, finalSeconds, wordCount,
  player, onPlayerUpdate, onCardPolished,
  onClose, onContinue,
}) => {
  const isFA = language === 'fa';
  const [shownRarity, setShownRarity] = useState<WorldMapCardRarity>(rarity);
  const [economy, setEconomy] = useState(() => gameServer.getLocalEconomyState());
  const [polishNote, setPolishNote] = useState<string | null>(null);

  useEffect(() => {
    setShownRarity(rarity);
  }, [rarity]);

  const rarityInfo = WORLD_MAP_RARITY[shownRarity];
  const accent = legendColor;

  const [phase, setPhase] = useState<'back' | 'spinning' | 'front'>('back');

  useEffect(() => {
    if (phase === 'back') {
      const t = setTimeout(() => setPhase('spinning'), 400);
      return () => clearTimeout(t);
    }
    if (phase === 'spinning') {
      const t = setTimeout(() => setPhase('front'), 2400);
      return () => clearTimeout(t);
    }
  }, [phase]);

  const isFast = finalSeconds <= wordCount * 10;
  const isGoodScore = matchScore >= wordCount * 120;
  const performanceRank: WorldMapCardRarity = isFast && isGoodScore ? 4 : isFast || isGoodScore ? 3 : 2;
  const nextPolishTier = Math.min(4, Math.max(shownRarity + 1, performanceRank)) as 2 | 3 | 4;
  const cardKey = `legend:${chapterId || 'reveal'}`;
  const pityPct = Number(economy.cardPolishPity?.[cardKey] || 0);

  const handlePolishInModal = (useFreeSeal: boolean) => {
    if (shownRarity >= 4) return;
    let activePlayer = player;
    if (!activePlayer) {
      try {
        const raw = localStorage.getItem('player_state');
        if (raw) activePlayer = JSON.parse(raw);
      } catch {}
    }
    if (!activePlayer) return;

    const targetTier = (Math.min(4, shownRarity + 1) as 2 | 3 | 4);
    const res = gameServer.polishCardInKiln(activePlayer, cardKey, targetTier, useFreeSeal, true);
    setEconomy(res.economy);
    if (!res.ok) {
      setPolishNote(res.error || 'سکه کافی ندارید');
      return;
    }
    onPlayerUpdate?.(res.player);
    setShownRarity(targetTier);
    onCardPolished?.(targetTier);
    soundEngine.playCardPolish();
    setPolishNote(
      isFA
        ? `✨ کارت در کوره صیقل یافت و به «${WORLD_MAP_RARITY[targetTier].fa}» ارتقا پیدا کرد!`
        : `Polished to ${WORLD_MAP_RARITY[targetTier].en}!`,
    );
  };

  const legend: LegendCardLegend = {
    id: 'reveal',
    name: legendName,
    icon: legendIcon,
    color: legendColor,
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center">
      {/* Warm ink scrim — the room dims, not the screen */}
      <div className="absolute inset-0" style={{
        background: 'rgba(32,22,15,.62)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
      }} onClick={onClose} />

      {/* Accent glow */}
      <div className="absolute inset-0 opacity-25 transition-opacity duration-1000 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 50% 30%, ${hexToRgba(accent, 0.25)} 0%, transparent 70%)` }} />

      {/* Particles */}
      {phase === 'front' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="absolute animate-ping"
              style={{
                left: `${15 + (i * 7) % 70}%`, top: `${10 + (i * 11) % 80}%`,
                width: `${3 + (i % 3) * 2}px`, height: `${3 + (i % 3) * 2}px`,
                borderRadius: '50%', backgroundColor: rarityInfo.color,
                opacity: 0.5 + (i % 3) * 0.15,
                animationDuration: `${1 + (i % 3) * 0.5}s`, animationDelay: `${i * 0.08}s`,
              }} />
          ))}
        </div>
      )}

      <style>{`
        @keyframes cardSpinReveal {
          0%   { transform: rotateY(0deg) scale(0.82); filter: blur(0px); }
          12%  { transform: rotateY(720deg) scale(0.88); filter: blur(0px); }
          30%  { transform: rotateY(1260deg) scale(0.95); filter: blur(1px); }
          55%  { transform: rotateY(1620deg) scale(1.02); filter: blur(0px); }
          75%  { transform: rotateY(1800deg) scale(1.10); }
          88%  { transform: rotateY(1980deg) scale(1.06); }
          100% { transform: rotateY(1980deg) scale(1.0); }
        }
        @keyframes glowPulse {
          0%,100% { box-shadow: 0 0 20px ${hexToRgba(rarityInfo.color, 0.3)}, 0 0 60px ${hexToRgba(rarityInfo.color, 0.1)}; }
          50% { box-shadow: 0 0 40px ${hexToRgba(rarityInfo.color, 0.5)}, 0 0 100px ${hexToRgba(rarityInfo.color, 0.2)}; }
        }
        @keyframes statsSlide {
          0%   { opacity: 0; transform: translateY(16px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Center content */}
      <div
        className="relative flex flex-col items-center gap-2.5 sm:gap-3.5 px-3 py-3 max-h-[96dvh] overflow-y-auto scrollbar-hide w-full max-w-sm"
        dir={isFA ? 'rtl' : 'ltr'}
      >

        {/* Revealed Clay Tablet Tier Stamp Header */}
        {phase === 'front' && (
          <div
            className="animate-in fade-in slide-in-from-top-4 duration-500 text-center px-3.5 py-1 rounded-full border shadow-lg flex items-center gap-2 shrink-0"
            style={{
              backgroundColor: 'rgba(38,20,12,0.85)',
              borderColor: rarityInfo.color,
              boxShadow: `0 0 16px ${hexToRgba(rarityInfo.color, 0.45)}, inset 0 1px 0 rgba(255,230,200,0.3)`,
            }}
          >
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: rarityInfo.color, boxShadow: `0 0 6px ${rarityInfo.color}` }} />
            <span className="text-xs font-black text-[#FFF7EA]">
              {isFA ? rarityInfo.fa : rarityInfo.en}
            </span>
            <span className="text-[10px] font-bold text-[#E2C7A8] opacity-80">
              · {isFA ? rarityInfo.badgeFa : `Tier ${rarity}`}
            </span>
          </div>
        )}

        {/* 3D spinning card container */}
        <div className="relative shrink-0 w-[200px] h-[280px] sm:w-[244px] sm:h-[342px]" style={{ perspective: '1000px' }}>
          <div style={{
            width: '100%', height: '100%',
            transformStyle: 'preserve-3d',
            willChange: 'transform',
            transform: phase === 'front' ? 'rotateY(1980deg)' : undefined,
            animation: phase === 'spinning'
              ? 'cardSpinReveal 2.0s cubic-bezier(.22,1,.36,1) forwards'
              : 'none',
          }}>
            {/* BACK face — the sealed paper envelope the card lives in */}
            <div className="absolute inset-0 overflow-hidden grid place-items-center"
              style={{
                backfaceVisibility: 'hidden',
                borderRadius: '6% / 4.5%',
                backgroundColor: '#EFE5D3',
                backgroundImage: `var(--tex-paper), linear-gradient(145deg, #F7EFE0 0%, #E4D6BF 58%, #D8C7AC 100%)`,
                backgroundSize: '170px 170px, auto',
                backgroundBlendMode: 'multiply, normal',
                border: `1px solid ${hexToRgba('#6E3A2C', 0.55)}`,
                boxShadow: `inset 0 0 0 ${'1px'} ${hexToRgba('#6E3A2C', 0.16)}, inset 0 0 0 7px rgba(247,239,224,.9), inset 0 0 0 8px ${hexToRgba('#6E3A2C', 0.28)}, 0 18px 34px -18px rgba(20,12,8,.7)`,
                opacity: phase === 'front' ? 0 : 1,
                transition: 'opacity 0.25s',
              }}>
              <div className="text-center relative">
                {/* the legend's seal, stamped in ink on the envelope */}
                <div
                  className="w-[86px] h-[86px] mx-auto rounded-full grid place-items-center mb-5"
                  style={{
                    border: `2px solid ${hexToRgba('#6E3A2C', 0.35)}`,
                    boxShadow: `inset 0 0 0 4px rgba(247,239,224,.75), inset 0 0 0 5px ${hexToRgba('#6E3A2C', 0.18)}`,
                  }}
                >
                  <span className="text-[38px] leading-none select-none" style={{ filter: 'grayscale(.35) opacity(.72)' }}>
                    {legendIcon}
                  </span>
                </div>
                <p className="text-[10px] font-black tracking-[0.3em] uppercase" style={{ color: hexToRgba('#4A2A21', 0.55) }}>
                  {isFA ? 'کارت مخفی' : 'SECRET CARD'}
                </p>
                {/* torn paper rule */}
                <div className="flex justify-center gap-1.5 mt-4" aria-hidden>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <span key={i} className="block rounded-full" style={{
                      width: 5, height: 5, backgroundColor: hexToRgba('#6E3A2C', 0.22),
                    }} />
                  ))}
                </div>
              </div>
            </div>

            {/* FRONT face — the REAL LegendCard */}
            <div className="absolute inset-0" style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              animation: phase === 'front' ? 'glowPulse 2s ease-in-out infinite' : 'none',
            }}>
              <LegendCard
                chapterId={chapterId || 'reveal'}
                legend={legend}
                title={chapterTitle}
                year=""
                rarity={shownRarity}
                bgImage={bgImage}
                isFA={isFA}
                variant="large"
              />
            </div>
          </div>
        </div>

        {/* Stats row (appears after reveal) — three printed slips */}
        {phase === 'front' && (
          <div className="flex gap-2.5 animate-in fade-in slide-in-from-bottom-4 duration-500"
            style={{ animation: 'statsSlide 0.5s var(--cg-spring) both 0.3s' }}>
            {[
              { label: isFA ? 'امتیاز' : 'Score', value: matchScore.toLocaleString() },
              { label: isFA ? 'زمان' : 'Time', value: `${Math.floor(finalSeconds / 60)}:${String(finalSeconds % 60).padStart(2, '0')}` },
              { label: isFA ? 'کلمه' : 'Words', value: wordCount },
            ].map(s => (
              <div key={s.label} className="cg-paper px-4 py-2 flex flex-col items-center"
                style={{ minWidth: 74 }}>
                <span className="text-[9px] font-black tracking-wider" style={{ color: 'var(--ink-3)' }}>{s.label}</span>
                <span className="text-[15px] font-black tabular-nums" style={{ color: 'var(--ink)' }}>{s.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Kiln Grade Report & Instant Polish Panel */}
        {phase === 'front' && (
          <div className="w-full max-w-[300px] space-y-2"
            style={{ animation: 'statsSlide 0.5s var(--cg-spring) both 0.5s' }}>
            <div
              className="rounded-[24px] p-3.5 text-[#3B2010] space-y-2 shadow-lg"
              style={{
                background: 'linear-gradient(180deg, #FBF4E6 0%, #EFE0C5 100%)',
                border: '2px solid #C28B55',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.85), 0 10px 24px -12px rgba(30,14,6,0.55)',
              }}
            >
              <div className="flex items-center justify-between text-[11px] font-black">
                <span className="flex items-center gap-1 text-[#5C2E14]">
                  <Flame size={14} className="text-[#C86D3B]" />
                  {isFA ? 'گزارش عیار خشت در کوره:' : 'Kiln Grade Report:'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#EAD5B4] text-[#5C3014] border border-[#C69E6B] text-[9.5px]">
                  {isFA ? `عیار بازی شما: رده ${faNum(performanceRank)}` : `Run Rank: T${performanceRank}`}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1.5 text-[10px] font-bold">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl"
                  style={{
                    background: isFast ? '#E3F4E6' : '#E8D8BE',
                    border: `1px solid ${isFast ? '#4E9F68' : '#C6AB86'}`,
                    color: isFast ? '#1B5E32' : '#6E4C2E',
                  }}>
                  <Zap size={12} style={{ color: isFast ? '#2E8B57' : '#8C6747' }} />
                  <span>{isFA ? `زیر ${faNum(wordCount * 10)} ثانیه` : `< ${wordCount * 10}s`}</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl"
                  style={{
                    background: isGoodScore ? '#E3F4E6' : '#E8D8BE',
                    border: `1px solid ${isGoodScore ? '#4E9F68' : '#C6AB86'}`,
                    color: isGoodScore ? '#1B5E32' : '#6E4C2E',
                  }}>
                  <Trophy size={12} style={{ color: isGoodScore ? '#2E8B57' : '#8C6747' }} />
                  <span>{isFA ? `امتیاز ${faNum(wordCount * 120)}+` : `${wordCount * 120}+ pts`}</span>
                </div>
              </div>

              {shownRarity < 4 && (() => {
                const nextTier = (shownRarity + 1) as 2 | 3 | 4;
                const recipe = getKilnPolishRecipe(nextTier);
                const curSeals = economy.freePolishTokens ?? 0;
                return (
                  <div className="pt-1.5 border-t border-[#D6BC98] flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-[9.5px] font-extrabold text-[#6E4425]">
                      <span>
                        {isFA
                          ? `صیقل به «${WORLD_MAP_RARITY[nextTier].fa}» (موجودی مُهر: ${faNum(curSeals)}):`
                          : `Polish to Tier ${nextTier}:`}
                      </span>
                      {pityPct > 0 && (
                        <span className="text-[#146B64]">
                          {isFA ? `گرد طلا: ${faNum(pityPct)}٪` : `Pity: ${pityPct}%`}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch gap-1.5">
                      {curSeals >= recipe.sealOnlyCost && (
                        <button
                          type="button"
                          onClick={() => handlePolishInModal(true)}
                          className="flex-1 py-2 px-2.5 rounded-full bg-gradient-to-b from-[#239693] to-[#14635F] text-white text-[10.5px] font-black border border-[#7CE8C8] shadow active:scale-95"
                        >
                          {isFA
                            ? `🔥 ${recipe.sealOnlyLabelFa} (${faNum(curSeals)})`
                            : recipe.sealOnlyLabelEn}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handlePolishInModal(false)}
                        className="flex-1 py-2 px-2.5 rounded-full bg-gradient-to-b from-[#D47A47] to-[#9E4922] text-[#FFF8EE] text-[10.5px] font-black border border-[#F5C59B] shadow active:scale-95"
                      >
                        {isFA ? `🔥 ${recipe.hybridLabelFa}` : recipe.hybridLabelEn}
                      </button>
                    </div>
                  </div>
                );
              })()}

              {polishNote && (
                <div className="rounded-xl bg-[#E3F7EC] border border-[#2E9B68] px-2.5 py-1.5 text-[10px] font-black text-[#145235] text-center">
                  {polishNote}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Continue button — the one fired-clay action on this screen */}
        {phase === 'front' && (
          <button onClick={onContinue}
            className="px-9 py-3.5 rounded-2xl font-black text-[13px] active:scale-95 transition-all flex items-center gap-2"
            style={{
              background: 'var(--clay-shell)',
              color: '#FFF6EC',
              border: '1px solid #8E4E37',
              boxShadow: '0 1px 0 rgba(255,226,204,.45) inset, 0 -2px 0 rgba(58,30,18,.30) inset, 0 12px 22px -14px rgba(70,40,25,.85)',
              textShadow: '0 1px 0 rgba(74,42,33,.45)',
              animation: 'statsSlide 0.5s var(--cg-spring) both 0.7s',
            }}>
            <Sparkles size={15} />
            {isFA ? 'ادامه' : 'Continue'}
            <ChevronRight size={15} style={{ transform: isFA ? 'rotate(180deg)' : '' }} />
          </button>
        )}
      </div>
    </div>
  );
};
