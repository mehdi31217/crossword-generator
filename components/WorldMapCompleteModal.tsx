import React from 'react';
import { Language } from '../types';
import { Trophy, Star, Sparkles, ChevronLeft, Award } from 'lucide-react';
import { GameCoin } from './GameCoin';

interface WorldMapCompleteModalProps {
  language: Language;
  legendName: { fa: string; en: string };
  legendColor: string;
  legendIcon: string;
  chapters: number;
  finalStory: { fa: string; en: string };
  bgImage?: string;
  rewardCoins?: number;
  onBackToMap: () => void;
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

export const WorldMapCompleteModal: React.FC<WorldMapCompleteModalProps> = ({
  language, legendName, legendColor, legendIcon, chapters, finalStory, bgImage, rewardCoins, onBackToMap,
}) => {
  const isFA = language === 'fa';
  const accent = legendColor;
  const accentDeep = darken(legendColor, 60);

  return (
    <div
      className="cg-sand fixed inset-0 z-[1000] flex items-center justify-center animate-in fade-in duration-700 overflow-y-auto"
    >
      {/* Player photo as a soft, warm backdrop (if available) */}
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

      {/* Legend-tinted wash */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 28%, ${hexToRgba(accent, 0.20)} 0%, transparent 68%)`,
        }}
      />

      {/* Large icon watermark (fallback if no photo) */}
      {!bgImage && (
        <div
          className="absolute flex items-center justify-center opacity-[0.10] select-none pointer-events-none"
          style={{ top: '6%', left: '50%', transform: 'translateX(-50%)', width: 300, height: 300 }}
        >
          <span className="text-[300px] leading-none">{legendIcon}</span>
        </div>
      )}

      {/* Content */}
      <div className="relative w-full max-w-sm mx-4 py-10 animate-in zoom-in-95 duration-1000 text-center">
        {/* Trophy icon */}
        <div className="mb-4">
          <div
            className="w-24 h-24 mx-auto rounded-3xl flex items-center justify-center"
            style={{
              backgroundColor: 'var(--paper)',
              backgroundImage: 'var(--tex-paper)',
              backgroundSize: '200px 200px',
              border: `2px solid ${hexToRgba(accent, 0.42)}`,
              boxShadow: `0 1px 0 rgba(255,255,255,.85) inset, 0 20px 34px -24px ${hexToRgba(accentDeep, 0.75)}`
            }}
          >
            <Trophy size={48} style={{ color: accentDeep }} />
          </div>
        </div>

        {/* Badge */}
        <div
          className="inline-block px-4 py-1.5 rounded-full text-[11px] font-black mb-3"
          style={{
            backgroundColor: 'var(--paper-lift)',
            color: accentDeep,
            border: `1px solid ${hexToRgba(accent, 0.34)}`,
            boxShadow: '0 1px 0 rgba(255,255,255,.8) inset'
          }}
        >
          <Sparkles size={11} className="inline mr-1 mb-0.5" />
          {isFA ? 'تمام شد!' : 'COMPLETE!'}
        </div>

        {/* Title */}
        <h2 className="text-2xl font-black mb-1" style={{ color: 'var(--ink)' }}>
          {isFA ? `سفر ${legendName.fa} کامل شد` : `${legendName.en}'s Journey Complete`}
        </h2>

        {/* Star rating */}
        <div className="flex justify-center gap-1 mb-4">
          {Array.from({ length: Math.min(chapters, 7) }).map((_, i) => (
            <Star key={i} size={18} style={{ color: '#B07F22', fill: '#E2C079' }} />
          ))}
        </div>

        {/* Divider */}
        <div
          className="w-20 h-0.5 mx-auto mb-4 rounded-full"
          style={{ backgroundColor: hexToRgba(accent, 0.45) }}
        />

        {/* Final story — printed sheet */}
        <div
          className="rounded-2xl p-5 mb-5 max-h-[32vh] overflow-y-auto text-start"
          style={{
            backgroundColor: 'var(--paper)',
            backgroundImage: 'var(--tex-paper)',
            backgroundSize: '200px 200px',
            border: '1px solid rgba(36,26,20,.18)',
            boxShadow: '0 1px 0 rgba(255,255,255,.85) inset, 0 18px 30px -24px rgba(70,45,30,.8)'
          }}
        >
          <p className="text-[12px] font-medium leading-7 whitespace-pre-line text-justify" style={{ color: 'var(--ink)' }}>
            {isFA ? finalStory.fa : finalStory.en}
          </p>
        </div>

        {/* Completion Rewards Badge */}
        <div
          className="flex items-center justify-center gap-3 py-2 px-4 rounded-xl mb-4 border"
          style={{
            backgroundColor: 'rgba(58,32,22,.85)',
            borderColor: '#8E4E37',
            boxShadow: 'inset 0 1px 0 rgba(255,226,204,.25)',
          }}
        >
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#E6C29E]">
            <Award size={14} className="text-[#FBBF24]" />
            <span>{isFA ? 'پاداش تکمیل اسطوره:' : 'Legend Bonus:'}</span>
          </div>
          <div className="flex items-center gap-1 text-sm font-black text-[#FBBF24] tabular-nums">
            <span>+{rewardCoins || 150}</span>
            <GameCoin size={15} />
          </div>
        </div>

        {/* Chapters count */}
        <div
          className="inline-block px-3 py-1 rounded-lg text-[10px] font-bold mb-5"
          style={{
            backgroundColor: 'var(--paper-lift)',
            color: 'var(--ink-2)',
            border: '1px solid rgba(36,26,20,.12)'
          }}
        >
          {isFA ? `${chapters} فصل تکمیل شد` : `${chapters} chapters completed`}
        </div>

        {/* Back button */}
        <button
          onClick={onBackToMap}
          className="w-full py-3.5 rounded-2xl font-black text-base active:scale-95 transition-all duration-200"
          style={{
            backgroundImage: `linear-gradient(140deg, ${accent} 0%, ${accentDeep} 100%)`,
            color: '#FBF4E7',
            border: `1px solid ${accentDeep}`,
            boxShadow: `0 1px 0 rgba(255,255,255,.28) inset, 0 14px 26px -18px ${hexToRgba(accentDeep, 0.95)}`
          }}
        >
          <ChevronLeft
            size={18}
            className="inline mr-1 mb-0.5"
            style={{ transform: isFA ? 'rotate(180deg)' : 'none' }}
          />
          {isFA ? 'بازگشت به نقشه' : 'Back to Map'}
        </button>
      </div>
    </div>
  );
};
