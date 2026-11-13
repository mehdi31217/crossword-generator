import React from 'react';
import { CardDef, Language, CardCategory } from '../types';

interface CardStoryModalProps {
  card: CardDef;
  language: Language;
  onStart: () => void;
  onClose: () => void;
}

// Category-specific visual themes
const CATEGORY_STYLES: Record<CardCategory, {
  bgFrom: string;
  bgTo: string;
  accent: string;
  glow: string;
  pattern: string;
  textGlow: string;
}> = {
  football_iran: {
    bgFrom: '#0a1628',
    bgTo: '#1a1a2e',
    accent: '#00d4aa',
    glow: 'rgba(0,212,170,0.15)',
    pattern: 'radial-gradient(circle at 20% 30%, rgba(0,212,170,0.08) 0%, transparent 60%)',
    textGlow: '#00d4aa',
  },
  football_world: {
    bgFrom: '#0d0d1a',
    bgTo: '#1a0d2e',
    accent: '#f59e0b',
    glow: 'rgba(245,158,11,0.15)',
    pattern: 'radial-gradient(circle at 80% 20%, rgba(245,158,11,0.08) 0%, transparent 60%)',
    textGlow: '#f59e0b',
  },
  iran_ancient: {
    bgFrom: '#1a0d00',
    bgTo: '#2d1a00',
    accent: '#d4a373',
    glow: 'rgba(212,163,115,0.15)',
    pattern: 'radial-gradient(circle at 50% 50%, rgba(212,163,115,0.08) 0%, transparent 60%)',
    textGlow: '#d4a373',
  },
  iran_history: {
    bgFrom: '#0d1a1a',
    bgTo: '#001a2d',
    accent: '#6ba3d4',
    glow: 'rgba(107,163,212,0.15)',
    pattern: 'radial-gradient(circle at 30% 70%, rgba(107,163,212,0.08) 0%, transparent 60%)',
    textGlow: '#6ba3d4',
  },
};

const DIFFICULTY_LABELS: Record<number, { fa: string; en: string }> = {
  1: { fa: 'مبتدی', en: 'Easy' },
  2: { fa: 'متوسط', en: 'Medium' },
  3: { fa: 'پیشرفته', en: 'Hard' },
};

export const CardStoryModal: React.FC<CardStoryModalProps> = ({ card, language, onStart, onClose }) => {
  const isFA = language === 'fa';
  const style = CATEGORY_STYLES[card.category] || CATEGORY_STYLES.football_iran;
  const diffLabel = DIFFICULTY_LABELS[card.difficulty];

  return (
    <div className="fixed inset-0 z-[1000] cg-dark flex items-center justify-center animate-in fade-in duration-700">
      {/* Full-screen backdrop */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${style.bgFrom} 0%, ${style.bgTo} 100%)`,
        }}
      />

      {/* Glow effect */}
      <div
        className="absolute inset-0"
        style={{ background: style.pattern }}
      />

      {/* Story background image or giant blurred emoji */}
      {card.storyImage ? (
        <div className="absolute inset-0 opacity-20 select-none pointer-events-none overflow-hidden">
          <img
            src={card.storyImage}
            alt=""
            className="w-full h-full object-cover"
            style={{ filter: 'blur(8px) saturate(0.6)' }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${style.bgFrom}80 0%, ${style.bgTo}80 100%)`,
            }}
          />
        </div>
      ) : (
        <div
          className="absolute flex items-center justify-center opacity-15 select-none pointer-events-none"
          style={{ top: '5%', left: '50%', transform: 'translateX(-50%)', width: 350, height: 350 }}
        >
          <span className="text-[280px] leading-none blur-[3px]">{card.icon}</span>
        </div>
      )}

      {/* Floating decorative orbs */}
      <div
        className="absolute w-64 h-64 rounded-full opacity-25 blur-3xl"
        style={{ background: style.accent, top: '5%', right: '-15%' }}
      />
      <div
        className="absolute w-48 h-48 rounded-full opacity-20 blur-3xl"
        style={{ background: style.accent, bottom: '15%', left: '-10%' }}
      />
      {/* Small accent orbs */}
      <div
        className="absolute w-32 h-32 rounded-full opacity-15 blur-2xl"
        style={{ background: style.accent, top: '40%', left: '-5%' }}
      />
      <div
        className="absolute w-24 h-24 rounded-full opacity-10 blur-2xl"
        style={{ background: style.accent, bottom: '30%', right: '5%' }}
      />

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/30 text-white/60 hover:bg-black/50 hover:text-white transition-all backdrop-blur-sm"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>

      {/* Content */}
      <div className="relative w-full max-w-sm mx-4 animate-in zoom-in-95 duration-1000 text-center">
        {/* Image / Icon hero */}
        <div className="relative mb-4">
          <div
            className="w-32 h-32 mx-auto rounded-2xl flex items-center justify-center text-6xl shadow-2xl backdrop-blur"
            style={{
              backgroundColor: `${style.accent}20`,
              border: `2px solid ${style.accent}40`,
              boxShadow: `0 0 60px ${style.glow}`,
            }}
          >
            {card.icon}
          </div>
        </div>

        {/* Difficulty badge */}
        <div
          className="inline-block px-3 py-1 rounded-full text-[10px] font-black mb-3"
          style={{
            backgroundColor: `${style.accent}20`,
            color: style.accent,
            border: `1px solid ${style.accent}30`,
          }}
        >
          {isFA ? diffLabel.fa : diffLabel.en} • {'⭐'.repeat(card.difficulty)}
        </div>

        {/* Title */}
        <h2
          className="text-2xl font-black mb-1"
          style={{ color: style.textGlow }}
        >
          {card.title}
        </h2>

        {/* Separator */}
        <div
          className="w-16 h-0.5 mx-auto mb-3 rounded-full"
          style={{ backgroundColor: `${style.accent}50` }}
        />

        {/* Description / Story text */}
        <div
          className="rounded-xl p-4 mb-4 mx-2 backdrop-blur-sm"
          style={{ backgroundColor: `${style.accent}08`, border: `1px solid ${style.accent}15` }}
        >
          <p
            className="text-sm font-bold leading-7"
            style={{ color: `${style.textGlow}BB` }}
          >
            {card.subtitle}
          </p>
        </div>

        {/* Card stats */}
        <div className="flex justify-center gap-4 mb-5">
          <div
            className="px-3 py-1.5 rounded-lg text-[10px] font-bold backdrop-blur-sm"
            style={{ backgroundColor: `${style.accent}10`, color: `${style.textGlow}99` }}
          >
            {isFA ? `${card.words.length} کلمه` : `${card.words.length} words`}
          </div>
          <div
            className="px-3 py-1.5 rounded-lg text-[10px] font-bold backdrop-blur-sm"
            style={{ backgroundColor: `${style.accent}10`, color: `${style.textGlow}99` }}
          >
            {isFA ? 'جدول تصلیبی' : 'Crossword'}
          </div>
        </div>

        {/* Start button */}
        <button
          onClick={onStart}
          className="w-full py-3.5 rounded-xl font-black text-base text-white shadow-lg active:scale-95 transition-all duration-200"
          style={{
            background: `linear-gradient(135deg, ${style.accent} 0%, ${style.accent}CC 100%)`,
            boxShadow: `0 4px 24px ${style.glow}`,
          }}
        >
          {isFA ? '🎯 شروع ماجراجویی' : '🎯 Start Adventure'}
        </button>
      </div>
    </div>
  );
};
