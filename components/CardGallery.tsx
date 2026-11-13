import React, { useState, useMemo } from 'react';
import { ArrowRight, Star, Trophy } from 'lucide-react';
import { GameCoin } from './GameCoin';
import { CardDef, CardCategory, Language } from '../types';
import { CARDS } from '../data/cards';
import { CARD_CATEGORIES } from '../types';

interface CardGalleryProps {
  language: Language;
  playerCoins: number;
  unlockedCards: Record<string, { stars: number }>;
  onSelectCard: (card: CardDef) => void;
  onBack: () => void;
}

const DIFFICULTY_STARS: Record<number, string> = { 1: '⭐', 2: '⭐⭐', 3: '⭐⭐⭐' };
const RARITY_COLORS: Record<number, string> = {
  0: 'border-slate-300 bg-white/70',
  1: 'border-amber-300 bg-amber-50/80',
  2: 'border-slate-300 bg-slate-100/80',
  3: 'border-yellow-400 bg-yellow-50/80',
};

const RARITY_BADGES: Record<number, { fa: string; en: string; color: string }> = {
  0: { fa: 'برنز', en: 'Bronze', color: 'text-amber-700' },
  1: { fa: 'نقره', en: 'Silver', color: 'text-slate-500' },
  2: { fa: 'طلا', en: 'Gold', color: 'text-amber-500' },
  3: { fa: 'پلاتینیوم', en: 'Platinum', color: 'text-cyan-600' },
};

export const CardGallery: React.FC<CardGalleryProps> = ({
  language,
  playerCoins,
  unlockedCards,
  onSelectCard,
  onBack,
}) => {
  const isFA = language === 'fa';
  const [activeCategory, setActiveCategory] = useState<CardCategory>('football_iran');

  const filteredCards = CARDS.filter(c => c.category === activeCategory);
  const totalInCategory = filteredCards.length;
  const unlockedInCategory = filteredCards.filter(c => unlockedCards[c.id]).length;

  const progress = totalInCategory > 0 ? unlockedInCategory / totalInCategory : 0;
  const totalUnlocked = Object.keys(unlockedCards).length;
  const totalCards = CARDS.length;

  return (
    <div dir={isFA ? 'rtl' : 'ltr'} className="w-full h-full flex flex-col animate-in fade-in duration-300 overflow-hidden" style={{ color: 'var(--cg-ink)' }}>
      {/* Header */}
      <header dir={isFA ? 'rtl' : 'ltr'} className="px-4 py-3 shrink-0 border-b border-white/60">
        <div className="flex items-center justify-between mb-3">
          <button onClick={onBack} className="cg-chip !rounded-full !p-2 transition-all hover:brightness-105">
            <ArrowRight size={20} className={isFA ? '' : 'rotate-180'} />
          </button>
          <div className="flex items-center gap-2">
            <Trophy size={18} className="text-amber-500" />
            <span className="text-lg font-black">
              {isFA ? 'کارت‌ها' : 'Cards'}
            </span>
          </div>
          <div className="flex items-center gap-1 text-amber-600 text-xs font-bold">
            <GameCoin size={14} />
            <span>{playerCoins}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-2 text-[10px] text-slate-500">
          <span className="font-bold">
            {isFA
              ? `${totalUnlocked} از ${totalCards} کارت`
              : `${totalUnlocked} / ${totalCards} cards`}
          </span>
          <div className="flex-1 h-1.5 bg-slate-900/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-700"
              style={{ width: `${(totalUnlocked / totalCards) * 100}%` }}
            />
          </div>
        </div>
      </header>

      {/* Category Tabs */}
      <div className="flex gap-1.5 p-3 pb-0 overflow-x-auto shrink-0 scrollbar-hide">
        {CARD_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`
              px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5
              ${activeCategory === cat.id
                ? 'bg-white text-slate-900 shadow-lg border border-white/90'
                : 'bg-white/50 text-slate-500 hover:text-slate-700 border border-transparent'}
            `}
          >
            <span>{cat.icon}</span>
            <span>{isFA ? cat.labelFa : cat.labelEn}</span>
          </button>
        ))}
      </div>

      {/* Card Grid */}
      <div className="flex-1 overflow-y-auto p-3">
        {filteredCards.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-slate-400 text-sm font-bold">
              {isFA ? 'کارتی در این دسته وجود ندارد' : 'No cards in this category'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 pb-4">
            {filteredCards.map(card => {
              const unlocked = unlockedCards[card.id];
              const stars = unlocked?.stars || 0;
              const rarityColor = RARITY_COLORS[stars as keyof typeof RARITY_COLORS] || RARITY_COLORS[0];
              const badge = RARITY_BADGES[stars as keyof typeof RARITY_BADGES] || RARITY_BADGES[0];

              return (
                <button
                  key={card.id}
                  onClick={() => onSelectCard(card)}
                  className={`
                    relative rounded-2xl border-2 p-4 text-center transition-all duration-200 active:scale-95
                    backdrop-blur-xl shadow-[0_12px_30px_-18px_rgba(28,36,80,.30)]
                    ${rarityColor + ' hover:scale-[1.02] cursor-pointer'}
                  `}
                >

                  {/* Card icon */}
                  <div className="text-3xl mb-2">{card.icon}</div>

                  {/* Title */}
                  <div className="text-xs font-bold leading-tight mb-1">
                    {card.title}
                  </div>

                  {/* Difficulty stars */}
                  <div className="text-[8px] mb-1">
                    {DIFFICULTY_STARS[card.difficulty]}
                  </div>

                  {/* Rarity badge */}
                  {unlocked && (
                    <div className={`text-[9px] font-black ${badge.color}`}>
                      {isFA ? badge.fa : badge.en}
                    </div>
                  )}

                  {/* Star count if unlocked */}
                  {unlocked && stars > 0 && (
                    <div className="flex justify-center gap-0.5 mt-1">
                      {Array.from({ length: stars }).map((_, i) => (
                        <Star key={i} size={10} className="text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
