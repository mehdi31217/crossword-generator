import React from 'react';
import { Language, WorldMapChapter } from '../types';
import { Sparkles, BookOpen } from 'lucide-react';

interface WorldMapStoryModalProps {
  chapter: WorldMapChapter | null;
  legendColor: string;
  legendName: { fa: string; en: string };
  language: Language;
  bgImage?: string;
  onStart: () => void;
  onClose: () => void;
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

export const WorldMapStoryModal: React.FC<WorldMapStoryModalProps> = ({
  chapter, legendColor, legendName, language, bgImage, onStart, onClose,
}) => {
  if (!chapter) return null;
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

      {/* Glow from legend color */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 25%, ${hexToRgba(accent, 0.20)} 0%, transparent 70%)`,
        }}
      />

      {/* Large blurred emoji watermark (fallback if no photo) */}
      {!bgImage && (
        <div
          className="absolute flex items-center justify-center opacity-[0.10] select-none pointer-events-none overflow-hidden"
          style={{ top: '4%', left: '50%', transform: 'translateX(-50%)', width: 350, height: 350 }}
        >
          <span className="text-[300px] leading-none">{chapter.bgEmoji || '⚽'}</span>
        </div>
      )}

      {/* Close button */}
      <button
        onClick={onClose}
        aria-label={isFA ? 'بستن' : 'Close'}
        className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-95"
        style={{
          backgroundColor: 'rgba(246,241,231,.94)',
          color: 'var(--ink-2)',
          border: '1px solid rgba(142,78,55,.3)',
          boxShadow: '0 1px 0 rgba(255,255,255,.8) inset, 0 8px 16px -12px rgba(70,40,25,.7)'
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>

      {/* Content Card */}
      <div className="relative w-full max-w-sm mx-4 py-10 animate-in zoom-in-95 duration-1000">
        {/* Hero Emoji */}
        <div className="text-center mb-4">
          <div
            className="w-24 h-24 mx-auto rounded-3xl flex items-center justify-center text-5xl"
            style={{
              backgroundColor: 'var(--paper)',
              backgroundImage: 'var(--tex-paper)',
              backgroundSize: '200px 200px',
              border: `2px solid ${hexToRgba(accent, 0.42)}`,
              boxShadow: `0 1px 0 rgba(255,255,255,.85) inset, 0 20px 34px -24px ${hexToRgba(accentDeep, 0.75)}`
            }}
          >
            {chapter.bgEmoji || '⚽'}
          </div>
        </div>

        {/* Legend name badge */}
        <div className="text-center mb-2">
          <div
            className="inline-block px-3 py-1 rounded-full text-[10px] font-black"
            style={{
              backgroundColor: 'rgba(246,241,231,.94)',
              color: accentDeep,
              border: `1px solid ${hexToRgba(accent, 0.34)}`,
              boxShadow: '0 1px 0 rgba(255,255,255,.8) inset'
            }}
          >
            {isFA ? legendName.fa : legendName.en} • {chapter.year}
          </div>
        </div>

        {/* Chapter title */}
        <h2 className="text-xl font-black text-center mb-1" style={{ color: 'var(--ink)' }}>
          {isFA ? chapter.title.fa : chapter.title.en}
        </h2>
        <p className="text-[10px] font-bold text-center mb-3" style={{ color: 'var(--ink-2)' }}>
          {isFA ? chapter.subtitle.fa : chapter.subtitle.en}
        </p>

        {/* Divider */}
        <div
          className="w-16 h-0.5 mx-auto mb-4 rounded-full"
          style={{ backgroundColor: hexToRgba(accent, 0.45) }}
        />

        {/* Story text — printed sheet */}
        <div
          className="rounded-md p-5 mb-5 max-h-[35vh] overflow-y-auto"
          style={{
            backgroundColor: 'var(--paper)',
            backgroundImage: 'var(--tex-paper)',
            backgroundSize: '200px 200px',
            border: '1px solid rgba(36,26,20,.2)',
            boxShadow: '0 1px 0 rgba(255,255,255,.8) inset, 0 18px 30px -24px rgba(70,45,30,.85)',
            direction: isFA ? 'rtl' : 'ltr',
          }}
        >
          <p
            className="text-[12px] font-medium leading-7 whitespace-pre-line text-justify"
            style={{ color: 'var(--ink)' }}
          >
            {isFA ? chapter.story.fa : chapter.story.en}
          </p>
        </div>

        {/* Word count */}
        <div className="flex justify-center gap-2 mb-4">
          <div
            className="px-3 py-1.5 rounded-lg text-[10px] font-bold"
            style={{ backgroundColor: 'rgba(246,241,231,.9)', color: 'var(--ink-2)', border: '1px solid rgba(36,26,20,.12)' }}
          >
            <BookOpen size={10} className="inline mr-1 mb-0.5" />
            {isFA ? `${chapter.words.length} کلمه` : `${chapter.words.length} words`}
          </div>
          <div
            className="px-3 py-1.5 rounded-lg text-[10px] font-bold"
            style={{ backgroundColor: 'rgba(246,241,231,.9)', color: 'var(--ink-2)', border: '1px solid rgba(36,26,20,.12)' }}
          >
            <Sparkles size={10} className="inline mr-1 mb-0.5" style={{ color: accentDeep }} />
            {isFA ? 'جدول کلمات' : 'Crossword'}
          </div>
        </div>

        {/* Start button */}
        <button
          onClick={onStart}
          className="w-full py-3.5 rounded-2xl font-black text-base active:scale-95 transition-all duration-200"
          style={{
            backgroundImage: `linear-gradient(140deg, ${accent} 0%, ${accentDeep} 100%)`,
            color: '#FBF4E7',
            border: `1px solid ${accentDeep}`,
            boxShadow: `0 1px 0 rgba(255,255,255,.28) inset, 0 14px 26px -18px ${hexToRgba(accentDeep, 0.95)}`
          }}
        >
          {isFA ? '🎯 شروع بازی' : '🎯 Start Game'}
        </button>
      </div>
    </div>
  );
};
