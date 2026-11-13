import React, { useState, useEffect } from 'react';
import { ArrowRight, Star, Lock, Sparkles, ChevronRight, Zap, Clock, Globe, Medal, GalleryHorizontalEnd, Flame, Target } from 'lucide-react';
import { Language, WorldMapChapter, WorldMapCardRarity, WORLD_MAP_RARITY } from '../types';
import { getLegendChapters } from '../data/worldMapData';
import { getChapterBgImage, getLegendPortraitImage } from '../data/legendImages';
import { WorldMapCardGallery } from './WorldMapCardGallery';
import { LegendCard, ClayTierBadge } from './LegendCard';
import { gameServer } from '../utils/gameServer';
import { KILN_POLISH_COSTS, DAILY_FREE_PRACTICE_CAP } from '../utils/economy';
import { EconomyStateView } from '../utils/progression';

const faNum = (n: number | string) => String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[+d]);

interface WorldMapChaptersProps {
  language: Language;
  legendId: string;
  legendName: { fa: string; en: string };
  legendColor: string;
  legendIcon: string;
  legendCountry: { fa: string; en: string };
  unlockedChapters: Record<string, number>; // legendId → chapter level (max done)
  cardProgress: Record<string, WorldMapCardRarity>; // chapterId → best rarity earned
  /** Index of the chapter that was just completed (for fly-in animation) */
  animatingChapterIndex: number | null;
  onBack: () => void;
  onStartChapter: (chapter: WorldMapChapter) => void;
  onOpenCollection?: () => void;
}

function hexToRgba(hex: string, alpha: number): string {
  const c = hex.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function lightenColor(hex: string, amount: number): string {
  const c = hex.replace('#', '');
  let r = parseInt(c.substring(0, 2), 16);
  let g = parseInt(c.substring(2, 4), 16);
  let b = parseInt(c.substring(4, 6), 16);
  r = Math.min(255, r + amount);
  g = Math.min(255, g + amount);
  b = Math.min(255, b + amount);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function darkenColor(hex: string, amount: number): string {
  const c = hex.replace('#', '');
  let r = parseInt(c.substring(0, 2), 16);
  let g = parseInt(c.substring(2, 4), 16);
  let b = parseInt(c.substring(4, 6), 16);
  r = Math.max(0, r - amount);
  g = Math.max(0, g - amount);
  b = Math.max(0, b - amount);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/** Card component for a single chapter */
const ChapterCard: React.FC<{
  chapter: WorldMapChapter;
  idx: number;
  level: number;
  isAnimating: boolean;
  rarity: WorldMapCardRarity | null; // null = not earned yet (show card back)
  pityPct: number;
  practiceRemaining: number;
  freePolishTokens: number;
  legendColor: string;
  legendIcon: string;
  legendName: { fa: string; en: string };
  isFA: boolean;
  onStart: () => void;
  onPracticeStart: () => void;
}> = ({
  chapter,
  idx,
  level,
  isAnimating,
  rarity,
  pityPct,
  practiceRemaining,
  freePolishTokens,
  legendColor,
  legendIcon,
  legendName,
  isFA,
  onStart,
  onPracticeStart,
}) => {
  const isUnlocked = idx < level;
  const isCurrent = idx === level;
  const isLocked = idx > level;
  const bgImage = getChapterBgImage(chapter.id);
  const [flyPhase, setFlyPhase] = useState<'hidden' | 'flying' | 'settled'>(
    isAnimating ? 'hidden' : 'settled'
  );

  useEffect(() => {
    if (isAnimating) {
      // Start hidden, then fly in
      const t1 = setTimeout(() => setFlyPhase('flying'), 50);
      const t2 = setTimeout(() => setFlyPhase('settled'), 800);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [isAnimating]);

  const accent = legendColor;

  // Unlocked chapters always show card front (default to tier 1 if no rarity saved)
  const showFront = isUnlocked;
  const effectiveRarity: WorldMapCardRarity = (isUnlocked && rarity !== null) ? rarity : 1;

  if (isLocked) {
    // ── LOCKED ──
    return (
      <div
        className="w-full rounded-2xl p-3 select-none"
        style={{
          backgroundColor: 'var(--paper)',
          border: '1px solid var(--sand-hair)',
          opacity: 0.62,
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: 'var(--sand-track)', color: 'var(--ink-3)' }}
          >
            <Lock size={14} />
          </div>
          <div className="flex-1">
            <div className="h-3 w-24 rounded mb-1" style={{ backgroundColor: 'var(--sand-track)' }} />
            <div className="h-2 w-16 rounded" style={{ backgroundColor: 'var(--sand-track)' }} />
          </div>
        </div>
      </div>
    );
  }

  // ── CARD (back or front) ──

  return (
    <button
      onClick={onStart}
      disabled={false}
      className={`
        w-full rounded-2xl overflow-hidden transition-all duration-300
        ${isAnimating && flyPhase === 'hidden' ? 'opacity-0 scale-0' : ''}
        ${flyPhase === 'flying' ? 'animate-in zoom-in-95 fade-in duration-700' : ''}
        hover:scale-[1.02] active:scale-[0.98] cursor-pointer
      `}
      style={{
        perspective: '800px',
        direction: isFA ? 'rtl' : 'ltr',
      }}
    >
      <div
        className="relative w-full overflow-hidden rounded-2xl"
        style={{
          minHeight: '110px',
          backgroundColor: showFront ? 'var(--paper)' : 'rgba(176,127,34,.09)',
          backgroundImage: showFront ? 'var(--tex-paper)' : undefined,
          backgroundSize: showFront ? '200px 200px' : undefined,
          border: showFront
            ? `2px solid ${WORLD_MAP_RARITY[effectiveRarity].border}`
            : '2px dashed rgba(176,127,34,.42)',
          boxShadow: showFront
            ? '0 1px 0 var(--sand-lip) inset, 0 18px 30px -24px rgba(20,10,5,.8)'
            : '0 1px 0 var(--sand-lip) inset',
        }}
      >
        {/* Rarity badge strip at top */}
        {showFront && (
          <div className="absolute top-0 left-0 right-0 h-1 z-20" style={{
            background: `linear-gradient(90deg, ${WORLD_MAP_RARITY[effectiveRarity].color}, ${lightenColor(WORLD_MAP_RARITY[effectiveRarity].color, 40)})`,
          }} />
        )}

        {/* Content */}
        <div className="relative z-10 p-3.5 flex items-center gap-3" style={{ flexDirection: isFA ? 'row-reverse' : 'row' }}>

          {/* ── LEFT: collectible clay tablet thumbnail ── */}
          <div className="shrink-0" style={{ width: showFront ? '76px' : '64px', filter: 'drop-shadow(0 6px 10px rgba(70,45,30,.28))' }}>
            <LegendCard
              chapterId={chapter.id}
              legend={{ id: chapter.legendId, name: legendName, icon: legendIcon, color: legendColor }}
              title={chapter.title}
              year={chapter.year}
              rarity={showFront ? effectiveRarity : null}
              bgImage={bgImage}
              isFA={isFA}
              variant="thumb"
            />
          </div>

          {/* ── CENTER: Title + info ── */}
          <div className="flex-1 min-w-0 py-0.5">
            {isCurrent && !showFront && (
              <div className="flex items-center gap-1 mb-1" style={{ flexDirection: isFA ? 'row-reverse' : 'row' }}>
                <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: '#B07F22' }} />
                <span className="text-[8px] font-bold uppercase tracking-widest" style={{ color: 'var(--sand-stamp)' }}>
                  {isFA ? 'آماده بازی · لوح مهروموم' : 'PLAY NOW · SEALED TABLET'}
                </span>
              </div>
            )}

            {showFront && (
              <div className="mb-1 flex items-center" style={{ justifyContent: isFA ? 'flex-end' : 'flex-start' }}>
                <ClayTierBadge tier={effectiveRarity} isFA={isFA} size="sm" />
              </div>
            )}

            <h3
              className="text-sm font-black leading-tight mb-0.5"
              style={{ color: 'var(--ink)' }}
            >
              {isFA ? chapter.title.fa : chapter.title.en}
            </h3>
            <p
              className="text-[8px] font-medium mb-1.5"
              style={{ color: 'var(--ink-2)' }}
            >
              {isFA ? chapter.subtitle.fa : chapter.subtitle.en}
            </p>

            <div className="flex items-center gap-2 flex-wrap" style={{ flexDirection: isFA ? 'row-reverse' : 'row' }}>
              <span
                className="text-[7px] px-1.5 py-0.5 rounded-full font-bold"
                style={{
                  backgroundColor: `${hexToRgba(accent, 0.18)}`,
                  color: 'var(--ink-2)',
                }}
              >
                <Clock size={6} className={`inline ${isFA ? 'ml-0.5' : 'mr-0.5'}`} />
                {chapter.year}
              </span>
              <span className="text-[7px] font-bold" style={{ color: 'var(--ink-3)' }}>
                {chapter.words.length} {isFA ? 'کلمه' : 'words'}
              </span>
              {showFront && effectiveRarity < 4 && (
                <span className="text-[8px] font-black px-2 py-0.5 rounded-full bg-[#F6E6CA] text-[#6E3C19] border border-[#C69B68]">
                  {isFA
                    ? `🔥 صیقل به رده ${faNum(effectiveRarity + 1)}: ${
                        freePolishTokens > 0
                          ? '۱ مُهر رایگان'
                          : `${faNum(KILN_POLISH_COSTS[(effectiveRarity + 1) as 2 | 3 | 4])} سکه`
                      }`
                    : `Polish T${effectiveRarity + 1}`}
                  {pityPct > 0 ? ` · گرد طلا: ${faNum(pityPct)}٪` : ''}
                </span>
              )}
            </div>

            {/* Practice & Rank Preview vs Kiln Polish Action Strip for Unlocked Chapters */}
            {showFront && effectiveRarity < 4 && (
              <div
                className="mt-2 pt-1.5 border-t border-[#DFCAAE] flex flex-wrap items-center gap-1.5"
                style={{ flexDirection: isFA ? 'row-reverse' : 'row' }}
              >
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    onPracticeStart();
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#E4F4F3] border border-[#239693] text-[#11514F] text-[8.5px] font-black hover:brightness-95"
                >
                  <Target size={10} />
                  {isFA
                    ? `تمرین و محک رده (${faNum(practiceRemaining)}/${faNum(DAILY_FREE_PRACTICE_CAP)} رایگان)`
                    : `Practice (${practiceRemaining}/${DAILY_FREE_PRACTICE_CAP})`}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-b from-[#D47A47] to-[#9E4922] text-[#FFF8EE] border border-[#F5C59B] text-[8.5px] font-black shadow-xs">
                  <Flame size={10} />
                  {isFA ? 'ورود به کوره صیقل ◀' : 'Kiln Polish Run'}
                </span>
              </div>
            )}
          </div>

          {/* ── RIGHT: Stars or play arrow ── */}
          <div className="shrink-0 self-center">
            {showFront ? (
              <div className="flex flex-col items-center gap-0.5">
                {Array.from({ length: effectiveRarity }).map((_, i) => (
                  <Star
                    key={i}
                    size={10}
                    className="fill-current"
                    style={{
                      color: WORLD_MAP_RARITY[effectiveRarity].color,
                      filter: `drop-shadow(0 0 3px ${hexToRgba(WORLD_MAP_RARITY[effectiveRarity].color, 0.4)})`,
                    }}
                  />
                ))}
              </div>
            ) : (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center animate-pulse"
                style={{ backgroundImage: 'var(--clay-shell)', boxShadow: 'inset 0 1px 0 rgba(255,232,214,.4)' }}
              >
                <ChevronRight size={14} style={{ color: '#FBF3E6', transform: isFA ? 'rotate(180deg)' : '' }} />
              </div>
            )}
          </div>
        </div>
      </div>
    </button>
  );
};

export const WorldMapChapters: React.FC<WorldMapChaptersProps> = ({
  language, legendId, legendName, legendColor, legendIcon,
  legendCountry, unlockedChapters, cardProgress,
  animatingChapterIndex,
  onBack, onStartChapter, onOpenCollection,
}) => {
  const isFA = language === 'fa';

  const chapters = getLegendChapters(legendId);
  const level = unlockedChapters[legendId] || 0;
  const [showGallery, setShowGallery] = useState(false);
  const [economy, setEconomy] = useState<EconomyStateView>(() => gameServer.getLocalEconomyState());
  const [practiceToast, setPracticeToast] = useState<string | null>(null);

  useEffect(() => {
    setEconomy(gameServer.getLocalEconomyState());
  }, [unlockedChapters, cardProgress]);

  const handlePracticeChapter = (ch: WorldMapChapter) => {
    const res = gameServer.consumePracticeRun();
    setEconomy(res.economy);
    if (!res.ok) {
      setPracticeToast(
        isFA
          ? 'سقف ۲ تمرین روزانه پر شد — بازی عادی شروع می‌شود و در پایان می‌توانید با سکه صیقل دهید!'
          : 'Daily practice used — starting chapter!',
      );
      setTimeout(() => setPracticeToast(null), 2600);
    } else {
      try {
        sessionStorage.setItem('cg_active_practice_chapter', ch.id);
      } catch {}
    }
    onStartChapter(ch);
  };

  const styles = {
    accent: legendColor,
    accentLight: lightenColor(legendColor, 60),
    accentDark: darkenColor(legendColor, 80),
  };


  if (!chapters.length) {
    return (
      <div className="cg-sand w-full h-full flex items-center justify-center">
        <p style={{ color: 'var(--ink-2)' }}>{isFA ? 'در حال آماده‌سازی...' : 'Coming soon...'}</p>
      </div>
    );
  }

  return (
    <div className="cg-sand w-full h-full flex flex-col overflow-hidden relative">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full opacity-[0.10]" style={{ background: `radial-gradient(circle, ${styles.accent}, transparent)` }} />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full opacity-[0.07]" style={{ background: `radial-gradient(circle, ${styles.accent}, transparent)` }} />
      </div>

      {/* Header */}
      <header className="relative z-10 shrink-0 px-3 pt-4 pb-3">
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={onBack}
            className="p-2 rounded-full transition-all active:scale-90"
            style={{ backgroundColor: 'var(--sand-chip)', border: '1px solid var(--sand-hair)', color: 'var(--ink-2)' }}
          >
            <ArrowRight size={18} className={`${isFA ? '' : 'rotate-180'}`} />
          </button>
          <div className="flex items-center gap-2">
            <div
              className="w-11 h-11 rounded-full overflow-hidden flex items-center justify-center shrink-0"
              style={{
                backgroundColor: 'var(--paper)',
                border: `2.5px solid ${legendColor}`,
                boxShadow: '0 1px 0 rgba(255,255,255,.8) inset, 0 8px 14px -12px rgba(70,45,30,.8)',
              }}
            >
              <img
                src={getLegendPortraitImage(legendId)}
                alt={isFA ? legendName.fa : legendName.en}
                className="w-full h-full object-cover object-top"
                draggable={false}
              />
            </div>
            <div>
              <h1 className="text-sm font-black leading-tight" style={{ color: 'var(--ink)' }}>{isFA ? legendName.fa : legendName.en}</h1>
              <p className="text-[8px] font-bold" style={{ color: 'var(--ink-3)' }}>
                <Globe size={8} className="inline mr-0.5 mb-0.5" />
                {isFA ? legendCountry.fa : legendCountry.en}
                <span className="mx-1">•</span>
                <Zap size={8} className="inline mr-0.5 mb-0.5" />
                {chapters.length} {isFA ? 'فصل' : 'chapters'}
              </p>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-2 rounded-full h-1.5 overflow-hidden" style={{ backgroundColor: 'var(--sand-track)' }}>
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: `${(level / chapters.length) * 100}%`, background: `linear-gradient(90deg, ${styles.accentDark}, ${styles.accentLight})` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[8px] font-bold" style={{ color: 'var(--ink-3)' }}>{isFA ? 'پیشرفت' : 'Progress'}</span>
          <span className="text-[8px] font-black" style={{ color: 'var(--sand-stamp)' }}>{level}/{chapters.length}</span>
        </div>

        {/* Kiln Polishing & Daily Practice Info Strip */}
        <div
          dir={isFA ? 'rtl' : 'ltr'}
          className="mt-2 rounded-2xl px-3 py-2 flex flex-wrap items-center justify-between gap-2 bg-gradient-to-b from-[#FBF4E5] to-[#EFE0C5] border border-[#C6A278] text-[#3E2210] shadow-xs"
        >
          <div className="flex items-center gap-1.5 text-[10px] font-black">
            <Flame size={13} className="text-[#C86D3B]" />
            <span>{isFA ? 'کورهٔ صیقل خشت:' : 'Clay Kiln:'}</span>
            <span className="px-2 py-0.5 rounded-full bg-[#EAD6B5] text-[#6E3C19] border border-[#C29B6B]">
              {isFA
                ? `مُهر صیقل رایگان: ${faNum(economy.freePolishTokens ?? 0)}`
                : `Free Seals: ${economy.freePolishTokens ?? 0}`}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[9.5px] font-extrabold text-[#146B64]">
            <Target size={12} />
            <span>
              {isFA
                ? `تمرین رایگان امروز: ${faNum(economy.freePracticeRemaining ?? 2)} از ${faNum(DAILY_FREE_PRACTICE_CAP)} (محک رده بدون کسر سکه!)`
                : `Free Practice: ${economy.freePracticeRemaining ?? 2}/${DAILY_FREE_PRACTICE_CAP}`}
            </span>
          </div>
        </div>
        {practiceToast && (
          <div className="mt-1.5 rounded-xl bg-[#FEF3C7] border border-[#F59E0B] px-3 py-1.5 text-[10px] font-black text-[#78350F] text-center">
            {practiceToast}
          </div>
        )}
      </header>

      {/* Cards collection title */}
      <div className="relative z-10 px-3 pb-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Medal size={10} style={{ color: '#9E7418' }} />
            <span className="text-[9px] font-bold tracking-wider" style={{ color: 'var(--sand-stamp)' }}>
              {isFA ? 'کارت‌های کلکسیون' : 'COLLECTION CARDS'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {onOpenCollection && (
              <button
                type="button"
                onClick={onOpenCollection}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-black text-[#FFF9EE] transition-all hover:scale-105 active:scale-95"
                style={{
                  background: 'linear-gradient(180deg, #289E92 0%, #176B62 100%)',
                  border: '1px solid #A7ECE4',
                }}
              >
                <span>🃏</span>
                <span>{isFA ? 'کالکشن و کومبو' : 'Combo Deck'}</span>
              </button>
            )}
            <button
              onClick={() => setShowGallery(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-black transition-all hover:scale-105 active:scale-95"
              style={{
                backgroundColor: 'var(--sand-chip)',
                color: 'var(--sand-stamp)',
                border: '1px solid rgba(176,127,34,.3)',
              }}
            >
              <GalleryHorizontalEnd size={10} />
              {isFA ? 'گالری فوتبال' : 'Gallery'}
            </button>
          </div>
        </div>
      </div>

      {/* Chapter cards list */}
      <div className="flex-1 overflow-y-auto px-3 pb-4 scrollbar-hide space-y-2.5">
        {chapters.map((ch, idx) => {
          const chRarity: WorldMapCardRarity | null = cardProgress[ch.id] ?? null;
          const isAnimating = animatingChapterIndex === idx;
          const pityPct = Number(economy.cardPolishPity?.[`legend:${ch.id}`] || 0);

          return (
            <ChapterCard
              key={ch.id}
              chapter={ch}
              idx={idx}
              level={level}
              isAnimating={isAnimating}
              rarity={chRarity}
              pityPct={pityPct}
              practiceRemaining={economy.freePracticeRemaining ?? 2}
              freePolishTokens={economy.freePolishTokens ?? 0}
              legendColor={legendColor}
              legendIcon={legendIcon}
              legendName={legendName}
              isFA={isFA}
              onStart={() => {
                try { sessionStorage.removeItem('cg_active_practice_chapter'); } catch {}
                onStartChapter(ch);
              }}
              onPracticeStart={() => handlePracticeChapter(ch)}
            />
          );
        })}
      </div>

      {/* Gallery overlay */}
      {showGallery && (
        <div className="fixed inset-0 z-[900] animate-in fade-in duration-300">
          <div
            className="absolute inset-0"
            style={{ backgroundColor: 'rgba(46,28,18,.55)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
            onClick={() => setShowGallery(false)}
          />
          <div className="relative w-full h-full">
            <WorldMapCardGallery
              language={language}
              cardProgress={cardProgress}
              onBack={() => setShowGallery(false)}
              onOpenFullCollection={
                onOpenCollection
                  ? () => {
                      setShowGallery(false);
                      onOpenCollection();
                    }
                  : undefined
              }
            />
          </div>
        </div>
      )}
    </div>
  );
};
