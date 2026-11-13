import React from 'react';
import { Language, WorldMapChapter, WorldMapCardRarity, WORLD_MAP_RARITY } from '../types';
import { Sparkles, BookOpen, Star, Trophy, Clock, Zap, ChevronRight } from 'lucide-react';

interface WorldMapVictoryModalProps {
  chapter: WorldMapChapter | null;
  legendColor: string;
  legendName: { fa: string; en: string };
  legendIcon: string;
  language: Language;
  bgImage?: string;
  cardRarity: WorldMapCardRarity;
  matchScore: number;
  finalSeconds: number;
  wordCount: number;
  onContinue: () => void;
}

function hexToRgba(hex: string, alpha: number): string {
  const c = hex.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function darken(hex: string, amt: number): string {
  const c = hex.replace('#', '');
  let r = parseInt(c.substring(0, 2), 16);
  let g = parseInt(c.substring(2, 4), 16);
  let b = parseInt(c.substring(4, 6), 16);
  r = Math.max(0, r - amt);
  g = Math.max(0, g - amt);
  b = Math.max(0, b - amt);
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
}

export const WorldMapVictoryModal: React.FC<WorldMapVictoryModalProps> = ({
  chapter, legendColor, legendName, legendIcon, language, bgImage,
  cardRarity, matchScore, finalSeconds, wordCount,
  onContinue,
}) => {
  if (!chapter) return null;
  const isFA = language === 'fa';
  const accent = legendColor;
  const rarityInfo = WORLD_MAP_RARITY[cardRarity];

  const isFast = finalSeconds <= wordCount * 12;
  const isGoodScore = matchScore >= wordCount * 90;

  return (
    <div
      className="cg-sand fixed inset-0 z-[1000] flex items-center justify-center animate-in fade-in duration-700 overflow-y-auto"
    >
      {bgImage && (
        <div
          className="absolute inset-0 select-none pointer-events-none overflow-hidden"
          style={{
            backgroundImage: `url(${bgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 30%',
            filter: 'blur(8px) saturate(.85)',
            opacity: 0.22,
            mixBlendMode: 'multiply'
          }}
        />
      )}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: `radial-gradient(ellipse at 50% 25%, ${hexToRgba(accent, 0.20)} 0%, transparent 70%)`,
      }} />

      {/* Content */}
      <div className="relative w-full max-w-xs mx-4 max-h-[96vh] overflow-y-auto animate-in zoom-in-95 duration-1000 scrollbar-hide" style={{ direction: isFA ? 'rtl' : 'ltr' }}>

        {/* ═══════════════════════════════════ */}
        {/* FIFA-STYLE CARD */}
        {/* ═══════════════════════════════════ */}
        <div
          className="relative w-full mx-auto rounded-2xl overflow-hidden shadow-2xl mb-4 select-none"
          style={{
            aspectRatio: '3 / 4',
            maxHeight: '380px',
            border: `5px solid ${rarityInfo.color}`,
            boxShadow: `0 0 30px ${hexToRgba(rarityInfo.color, 0.3)}, 0 0 60px ${hexToRgba(rarityInfo.color, 0.1)}`,
          }}
        >
          {/* ── Photo background ── */}
          {bgImage ? (
            <div className="absolute inset-0" style={{
              backgroundImage: `url(${bgImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center 35%',
            }} />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-7xl opacity-40" style={{
              background: `linear-gradient(135deg, ${darken(accent, 120)}, ${darken(accent, 60)})`,
            }}>
              {legendIcon}
            </div>
          )}

          {/* ── Dark vignette overlay ── */}
          <div className="absolute inset-0" style={{
            background: `
              radial-gradient(ellipse at 50% 30%, transparent 40%, rgba(0,0,0,0.5) 100%),
              linear-gradient(180deg, rgba(0,0,0,0.1) 0%, transparent 30%, transparent 60%, rgba(0,0,0,0.4) 80%, rgba(0,0,0,0.8) 100%)
            `,
          }} />

          {/* ── Glossy / Shine effect (FIFA-style) ── */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: `linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 20%, transparent 50%, rgba(255,255,255,0.02) 70%, transparent 100%)`,
          }} />

          {/* ── Rarity glow ring (inner) ── */}
          <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{
            border: `2px solid ${hexToRgba(rarityInfo.color, 0.3)}`,
            boxShadow: `inset 0 0 30px ${hexToRgba(rarityInfo.color, 0.15)}`,
          }} />

          {/* ── Top: Legend icon + Stars ── */}
          <div className="absolute top-3 left-0 right-0 flex items-center justify-between px-3 z-10">
            <span className="text-3xl drop-shadow-lg">{legendIcon}</span>
            <div className="flex gap-0.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={i < cardRarity ? 'fill-current' : 'opacity-20'}
                  style={{
                    color: i < cardRarity ? rarityInfo.color : '#ffffff',
                    filter: i < cardRarity ? `drop-shadow(0 0 4px ${hexToRgba(rarityInfo.color, 0.8)})` : 'none',
                  }}
                />
              ))}
            </div>
          </div>

          {/* ── Bottom: Player name + year ── */}
          <div className="absolute bottom-0 left-0 right-0 p-3 pt-8 z-10" style={{
            background: `linear-gradient(0deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 50%, transparent 100%)`,
          }}>
            <h2 className="text-white font-black text-base leading-tight text-center drop-shadow-lg" style={{
              textShadow: '0 2px 8px rgba(0,0,0,0.6)',
            }}>
              {isFA ? chapter.title.fa : chapter.title.en}
            </h2>
            <p className="text-center text-[10px] font-bold mt-0.5" style={{
              color: hexToRgba('#ffffff', 0.6),
              textShadow: '0 1px 4px rgba(0,0,0,0.5)',
            }}>
              {chapter.year}
            </p>
          </div>

          {/* ── Rarity name at very bottom border ── */}
          <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 z-20 px-3 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest" style={{
            backgroundColor: rarityInfo.color,
            color: cardRarity === 3 || cardRarity === 4 ? '#000' : '#fff',
            border: `1px solid ${hexToRgba(rarityInfo.color, 0.5)}`,
          }}>
            {isFA ? rarityInfo.fa : rarityInfo.en}
          </div>
        </div>

        {/* ─── STATS ROW ─── */}
        <div className="flex items-center justify-center gap-4 mb-4 px-4 py-2.5 rounded-lg" style={{
          backgroundColor: 'var(--paper)',
          backgroundImage: 'var(--tex-paper)',
          backgroundSize: '200px 200px',
          border: '1px solid rgba(36,26,20,.18)',
          boxShadow: '0 1px 0 rgba(255,255,255,.8) inset, 0 18px 30px -22px rgba(0,0,0,.9)',
        }}>
          <div className="text-center">
            <p className="text-sm font-black" style={{ color: rarityInfo.color }}>{matchScore.toLocaleString()}</p>
            <p className="text-[7px] font-bold" style={{ color: 'var(--ink-3)' }}>{isFA ? 'امتیاز' : 'SCORE'}</p>
          </div>
          <div className="w-px self-stretch" style={{ backgroundColor: 'rgba(36,26,20,.14)' }} />
          <div className="text-center">
            <p className="text-sm font-black" style={{ color: 'var(--ink)' }}>{Math.floor(finalSeconds / 60)}:{String(finalSeconds % 60).padStart(2, '0')}</p>
            <p className="text-[7px] font-bold" style={{ color: 'var(--ink-3)' }}>{isFA ? 'زمان' : 'TIME'}</p>
          </div>
          <div className="w-px self-stretch" style={{ backgroundColor: 'rgba(36,26,20,.14)' }} />
          <div className="text-center">
            <p className="text-sm font-black" style={{ color: 'var(--ink)' }}>{wordCount}</p>
            <p className="text-[7px] font-bold" style={{ color: 'var(--ink-3)' }}>{isFA ? 'کلمه' : 'WORDS'}</p>
          </div>
        </div>

        {/* ─── REQUIREMENTS ─── */}
        <div className="flex items-center justify-center gap-4 mb-4 text-[8px]">
          <div className="flex items-center gap-1.5" style={{ color: isFast ? '#4C5A42' : '#9A8879' }}>
            <Zap size={10} />
            <span>{isFA ? `زیر ${wordCount * 12} ثانیه` : `<${wordCount * 12}s`}</span>
            {isFast && <span className="font-bold" style={{ color: '#5E6E52' }}>✓</span>}
          </div>
          <div className="flex items-center gap-1.5" style={{ color: isGoodScore ? '#4C5A42' : '#9A8879' }}>
            <Trophy size={10} />
            <span>{isFA ? `امتیاز ${wordCount * 90}+` : `>${wordCount * 90}`}</span>
            {isGoodScore && <span className="font-bold" style={{ color: '#5E6E52' }}>✓</span>}
          </div>
        </div>

        {/* ─── STORY CONTINUATION ─── */}
        <div className="rounded-lg p-4 mb-4 max-h-[28vh] overflow-y-auto" style={{
          backgroundColor: 'var(--paper)',
          backgroundImage: 'var(--tex-paper)',
          backgroundSize: '200px 200px',
          border: '1px solid rgba(36,26,20,.2)',
          boxShadow: '0 1px 0 rgba(255,255,255,.8) inset, 0 18px 30px -22px rgba(0,0,0,.9)',
        }}>
          <div className="flex items-center gap-1.5 mb-2" style={{ flexDirection: isFA ? 'row-reverse' : 'row' }}>
            <BookOpen size={11} style={{ color: '#8E4E37' }} />
            <span className="text-[8px] font-bold uppercase tracking-widest" style={{ color: '#9E7418' }}>
              {isFA ? 'ادامه داستان' : 'STORY CONTINUES'}
            </span>
          </div>
          <p className="text-[11px] font-medium leading-7 whitespace-pre-line" style={{
            color: 'var(--ink)',
            textAlign: isFA ? 'justify' : 'justify',
          }}>
            {isFA ? chapter.victoryText.fa : chapter.victoryText.en}
          </p>
        </div>

        {/* Continue button */}
        <button
          onClick={onContinue}
          className="w-full py-3.5 rounded-2xl font-black text-sm active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
          style={{
            backgroundImage: `linear-gradient(140deg, ${accent} 0%, ${darken(accent, 60)} 100%)`,
            color: '#FBF4E7',
            border: `1px solid ${darken(accent, 60)}`,
            boxShadow: `0 1px 0 rgba(255,255,255,.28) inset, 0 14px 26px -18px ${hexToRgba(darken(accent, 60), 0.95)}`
          }}
        >
          {isFA ? 'ادامه' : 'Continue'}
          <ChevronRight size={16} style={{ transform: isFA ? 'rotate(180deg)' : '' }} />
        </button>
        <div className="h-4" />
      </div>
    </div>
  );
};
