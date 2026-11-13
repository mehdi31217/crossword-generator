import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { ArrowRight, Star, Swords, Flame, Sparkles, Check, ScrollText } from 'lucide-react';
import { Language, WorldMapCardRarity, WORLD_MAP_RARITY } from '../types';
import { WORLD_MAP_CHAPTERS, getLegendFinalStory } from '../data/worldMapData';
import { getChapterBgImage } from '../data/legendImages';
import { FOOTBALL_LEGENDS } from './WorldMap';
import { LegendCard, LegendCardLegend, ClayTierBadge } from './LegendCard';
import { MasterScroll, SCROLL_STAGE_THEMES } from './MasterScroll';
import { gameServer } from '../utils/gameServer';
import {
  MAX_SCROLL_SLOTS,
  computeActiveDeckBuffs,
  resolveSetScrollTier,
  SetScrollStatus,
  EconomyStateView,
} from '../utils/progression';
import { KILN_POLISH_COSTS, getKilnPolishRecipe } from '../utils/economy';

// ─── Helpers ─────────────────────────────────────────────

const toFa = (n: number | string) => String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[+d]);

function hexToRgba(hex: string, alpha: number): string {
  const c = hex.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// ─── Props ───────────────────────────────────────────────

interface WorldMapCardGalleryProps {
  language: Language;
  cardProgress: Record<string, WorldMapCardRarity>;
  onBack: () => void;
  onOpenFullCollection?: () => void;
}

// ─── Enlarged Card View (modal overlay with Kiln Polish for Set Scroll Upgrade) ───

interface EnlargedViewProps {
  chapterId: string;
  chapterTitle: { fa: string; en: string };
  chapterYear: string;
  rarity: WorldMapCardRarity | null;
  legend: LegendCardLegend;
  bgImage: string | null;
  isFA: boolean;
  freePolishTokens: number;
  parentScroll: SetScrollStatus | undefined;
  onPolish: (useFreeToken: boolean) => void;
  onClose: () => void;
}

const EnlargedCard: React.FC<EnlargedViewProps> = ({
  chapterId,
  chapterTitle,
  chapterYear,
  rarity,
  legend,
  bgImage,
  isFA,
  freePolishTokens,
  parentScroll,
  onPolish,
  onClose,
}) => {
  const isUnlocked = rarity !== null;
  const effectiveRarity: WorldMapCardRarity = rarity ?? 1;
  const rarityInfo = WORLD_MAP_RARITY[effectiveRarity];
  const finalStory = getLegendFinalStory(legend.id);

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center animate-in fade-in duration-300"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(32,22,15,.68)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
      />
      {bgImage && (
        <div
          className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden"
          style={{
            backgroundImage: `url(${bgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 30%',
            filter: 'blur(8px) brightness(0.8)',
          }}
        />
      )}

      {/* Content wrapper */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex flex-col items-center w-full max-w-[340px] mx-4 max-h-[90vh] overflow-y-auto scrollbar-hide py-5 rounded-[28px] p-5 border-2 border-[#B98758] shadow-2xl"
        style={{
          direction: isFA ? 'rtl' : 'ltr',
          background: 'linear-gradient(180deg, #FBF4E6 0%, #F0DFC2 100%)',
        }}
      >
        {/* The card itself */}
        <div className="w-[196px] shrink-0">
          <LegendCard
            chapterId={chapterId}
            legend={legend}
            title={chapterTitle}
            year={chapterYear}
            rarity={rarity}
            bgImage={bgImage}
            isFA={isFA}
            variant="large"
          />
        </div>

        {/* Tier Badge & Stars */}
        {isUnlocked && (
          <div className="flex flex-col items-center gap-1.5 mt-3">
            <ClayTierBadge tier={effectiveRarity} isFA={isFA} size="md" />
            <div className="flex justify-center gap-1">
              {Array.from({ length: effectiveRarity }).map((_, i) => (
                <Star
                  key={i}
                  size={15}
                  className="fill-current"
                  style={{
                    color: rarityInfo.color,
                    filter: `drop-shadow(0 0 5px ${hexToRgba(rarityInfo.color, 0.6)})`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Parent Set Scroll Status & Kiln Polish Controls */}
        {isUnlocked && (
          <div className="w-full mt-3 space-y-2">
            {parentScroll && (
              <div className="w-full rounded-2xl p-2.5 bg-[#F5E6CC] border border-[#C6A278] text-[10px] font-bold text-[#4E2D16] leading-4">
                📜 <b>طومار مجموعهٔ «{legend.name.fa}»:</b>{' '}
                {!parentScroll.isUnlocked
                  ? `برای آزادسازی طومار خشتی این اسطوره، هر ${toFa(parentScroll.totalCards)} کارت آن را باز کنید (${toFa(parentScroll.unlockedCards)}/${toFa(parentScroll.totalCards)}).`
                  : parentScroll.scrollTier === effectiveRarity && effectiveRarity < 4
                  ? `این کارت تعیین‌کنندهٔ حداقل ردهٔ مجموعه است! با صیقل دادن کارت‌های رده ${toFa(effectiveRarity)}، طومار این اسطوره به ردهٔ بالاتر ارتقا می‌یابد.`
                  : `طومار فعلی این اسطوره در ردهٔ ${toFa(parentScroll.scrollTier || 1)} قرار دارد.`}
              </div>
            )}

            {effectiveRarity < 4 && (() => {
              const nextTier = (effectiveRarity + 1) as 2 | 3 | 4;
              const recipe = getKilnPolishRecipe(nextTier);
              return (
                <div className="w-full rounded-2xl p-2.5 bg-[#FFF8EC] border border-[#D49B2A] space-y-1.5">
                  {freePolishTokens >= recipe.sealOnlyCost && (
                    <button
                      type="button"
                      onClick={() => onPolish(true)}
                      className="w-full py-2 px-3 rounded-xl font-black text-[11px] text-[#FFF9EE] bg-gradient-to-b from-[#289E92] to-[#176B62] flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <Sparkles size={13} />
                      <span>
                        {isFA ? `${recipe.sealOnlyLabelFa} (موجودی: ${toFa(freePolishTokens)})` : recipe.sealOnlyLabelEn}
                      </span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onPolish(false)}
                    className="w-full py-2 px-3 rounded-xl font-black text-[11px] text-[#FFF9EE] bg-gradient-to-b from-[#D47A47] to-[#9E4922] flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <Flame size={13} />
                    <span>{isFA ? recipe.hybridLabelFa : recipe.hybridLabelEn}</span>
                  </button>
                </div>
              );
            })()}
          </div>
        )}

        {/* Final story — a printed sheet */}
        {isUnlocked && finalStory && (
          <div className="cg-paper mt-3 w-full p-3.5" style={{ borderRadius: 12 }}>
            <p
              className="text-[11.5px] font-medium leading-6 whitespace-pre-line text-justify"
              style={{ color: 'var(--ink)' }}
            >
              {isFA ? finalStory.fa : finalStory.en}
            </p>
          </div>
        )}

        {/* Locked message */}
        {!isUnlocked && (
          <div className="cg-paper mt-4 w-full p-4 text-center" style={{ borderRadius: 12 }}>
            <p className="text-[12px] font-bold leading-6" style={{ color: 'var(--ink-2)' }}>
              {isFA
                ? 'باید داستان این فصل رو تموم کنی تا کارت باز بشه و به تکمیل طومار این اسطوره نزدیک بشی!'
                : 'Complete this chapter to unlock the card and progress toward this Legend Scroll'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main Gallery Component ──────────────────────────────

export const WorldMapCardGallery: React.FC<WorldMapCardGalleryProps> = ({
  language,
  cardProgress,
  onBack,
  onOpenFullCollection,
}) => {
  const isFA = language === 'fa';
  const [economy, setEconomy] = useState<EconomyStateView>(() => gameServer.getLocalEconomyState());
  const [localCards, setLocalCards] = useState<Record<string, WorldMapCardRarity>>(() => ({
    ...cardProgress,
  }));
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setLocalCards((prev) => ({ ...prev, ...cardProgress }));
  }, [cardProgress]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const legendMetas: LegendCardLegend[] = FOOTBALL_LEGENDS.map((l) => ({
    id: l.id,
    name: l.name,
    icon: l.icon,
    color: l.color,
  }));

  const effectiveCardProgress = localCards;

  // Compute Master Scroll status for each Football Legend
  const legendScrolls = useMemo<Record<string, SetScrollStatus>>(() => {
    const map: Record<string, SetScrollStatus> = {};
    for (const legend of FOOTBALL_LEGENDS) {
      const chapters = WORLD_MAP_CHAPTERS[legend.id] || [];
      if (chapters.length === 0) continue;
      const tiers = chapters.map((ch) => effectiveCardProgress[ch.id] ?? null);
      map[legend.id] = resolveSetScrollTier(
        `scroll:legend:${legend.id}`,
        legend.id,
        legend.name.fa,
        legend.name.en,
        'football',
        legend.icon,
        legend.color,
        tiers,
      );
    }
    return map;
  }, [effectiveCardProgress]);

  const lastSyncedFootballTiersRef = useRef<string>('');

  // Sync unlocked football scroll tiers to gameServer
  useEffect(() => {
    const nextMap: Record<string, WorldMapCardRarity> = { ...(economy.scrollTiers || {}) };
    let changed = false;
    for (const s of Object.values(legendScrolls)) {
      if (s.isUnlocked && s.scrollTier) {
        if (nextMap[s.scrollKey] !== s.scrollTier) {
          nextMap[s.scrollKey] = s.scrollTier;
          changed = true;
        }
      }
    }
    const nextMapStr = JSON.stringify(nextMap);
    if (!changed || lastSyncedFootballTiersRef.current === nextMapStr) {
      return;
    }
    lastSyncedFootballTiersRef.current = nextMapStr;
    const updated = gameServer.syncScrollTiers(nextMap);
    setEconomy(updated);
  }, [legendScrolls]);

  const deckBuffs = useMemo(
    () => computeActiveDeckBuffs(economy, effectiveCardProgress),
    [economy, effectiveCardProgress],
  );

  const totalCards = Object.values(WORLD_MAP_CHAPTERS).reduce((sum, chs) => sum + chs.length, 0);
  const unlockedCount = Object.keys(effectiveCardProgress).length;
  const progressPct = totalCards > 0 ? (unlockedCount / totalCards) * 100 : 0;

  const unlockedLegendScrollList = useMemo(
    () => Object.values(legendScrolls).filter((s) => s.isUnlocked && s.scrollTier !== null),
    [legendScrolls],
  );

  const [flippingCardId, setFlippingCardId] = useState<string | null>(null);

  const [enlarged, setEnlarged] = useState<{
    chapterId: string;
    title: { fa: string; en: string };
    year: string;
    rarity: WorldMapCardRarity | null;
    legend: LegendCardLegend;
    bgImage: string | null;
  } | null>(null);

  const handleToggleLegendScroll = (scrollStatus: SetScrollStatus) => {
    if (!scrollStatus.isUnlocked || !scrollStatus.scrollTier) {
      setToast(
        isFA
          ? `🔒 برای دریافت طومار «${scrollStatus.titleFa}»، ابتدا هر ${toFa(scrollStatus.totalCards)} فصل این اسطوره را کامل کنید!`
          : 'Complete all chapters of this legend to unlock its Master Scroll!',
      );
      return;
    }
    const res = gameServer.toggleDeckCard(scrollStatus.scrollKey);
    setEconomy(res.economy);
    setToast(
      res.added
        ? isFA
          ? `📜 طومار «${scrollStatus.titleFa}» در قفسهٔ ۱۰ طوماری کومبو قرار گرفت!`
          : `Equipped ${scrollStatus.titleEn} Scroll!`
        : isFA
        ? `طومار «${scrollStatus.titleFa}» از قفسهٔ کومبو برداشته شد`
        : `Removed ${scrollStatus.titleEn} Scroll`,
    );
  };

  const readCachedPlayer = (): import('../types').PlayerState => {
    try {
      const raw = localStorage.getItem('player_state');
      if (raw) return JSON.parse(raw);
    } catch {}
    return {
      id: 'guest',
      name: 'پهلوان',
      avatar: 'clay_default',
      friendCode: '0000',
      coins: 120,
      score: 0,
      highScore: 0,
      level: 1,
      history: [],
      isOnline: false,
      epicProgress: { rostam_7: 1 },
      epicStars: {},
      cardProgress: {},
      towerTickets: 1,
      lastTicketRefill: null,
      dailyTowerCoins: 0,
      towerHighFloor: 0,
      league: {
        trophies: 0,
        league: 'bronze',
        highestLeague: 'bronze',
        winStreak: 0,
        totalWins: 0,
        totalLosses: 0,
      },
      items: {
        trophyShield: 0,
        trophyBoost: 0,
        streakShield: 0,
      },
    };
  };

  const handlePolishEnlarged = (useFreeToken: boolean) => {
    if (!enlarged || !enlarged.rarity || enlarged.rarity >= 4) return;
    const player = readCachedPlayer();
    const targetTier = (enlarged.rarity + 1) as 2 | 3 | 4;
    const res = gameServer.polishCardInKiln(
      player,
      `legend:${enlarged.chapterId}`,
      targetTier,
      useFreeToken,
      true,
    );
    if (!res.ok) {
      setToast(res.error || (isFA ? 'صیقل کارت انجام نشد' : 'Could not polish card'));
      return;
    }
    setEconomy(res.economy);
    setLocalCards((prev) => ({ ...prev, [enlarged.chapterId]: res.newTier }));
    setEnlarged((prev) => (prev ? { ...prev, rarity: res.newTier } : null));
    setToast(
      isFA
        ? `🔥 کارت به رده ${toFa(res.newTier)} (${WORLD_MAP_RARITY[res.newTier].fa}) ارتقا یافت!`
        : `Upgraded to Tier ${res.newTier}!`,
    );
  };

  const handleCardClick = useCallback(
    (chapter: { id: string; title: { fa: string; en: string }; year: string; legendId: string }) => {
      if (flippingCardId || enlarged) return;
      const legend = legendMetas.find((l) => l.id === chapter.legendId);
      if (!legend) return;

      setFlippingCardId(chapter.id);
      setTimeout(() => {
        setFlippingCardId(null);
        setEnlarged({
          chapterId: chapter.id,
          title: chapter.title,
          year: chapter.year,
          rarity: effectiveCardProgress[chapter.id] ?? null,
          legend,
          bgImage: getChapterBgImage(chapter.id),
        });
      }, 420);
    },
    [legendMetas, flippingCardId, enlarged, effectiveCardProgress],
  );

  return (
    <>
      <div dir={isFA ? 'rtl' : 'ltr'} className="w-full h-full flex flex-col overflow-hidden relative cg-glass">
        {/* Header */}
        <header
          dir={isFA ? 'rtl' : 'ltr'}
          className="relative z-10 shrink-0 px-3 sm:px-4 pt-3 pb-2.5"
          style={{
            borderBottom: '1px solid rgba(122,80,52,.14)',
            background: 'var(--cg-glass)',
            boxShadow: '0 1px 0 rgba(255,252,246,.8) inset, 0 10px 20px -18px rgba(86,52,33,.6)',
          }}
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <button
                onClick={onBack}
                aria-label={isFA ? 'بازگشت' : 'Back'}
                className="w-9 h-9 flex items-center justify-center rounded-full transition-all active:scale-90 shrink-0"
                style={{
                  background: 'rgba(122,80,52,.09)',
                  border: '1px solid rgba(122,80,52,.16)',
                  boxShadow: '0 1px 0 rgba(255,255,255,.7) inset',
                }}
              >
                <ArrowRight size={18} className={isFA ? '' : 'rotate-180'} style={{ color: 'var(--cg-ink2)' }} />
              </button>
              <span className="text-[13px] sm:text-[15px] font-black tracking-wide truncate" style={{ color: 'var(--cg-ink)' }}>
                {isFA ? 'کلکسیون کارت‌ها و طومارهای اساطیر' : 'LEGEND CARDS & MASTER SCROLLS'}
              </span>
            </div>
            {onOpenFullCollection ? (
              <button
                type="button"
                onClick={onOpenFullCollection}
                className="px-2.5 py-1 rounded-full text-[10px] font-black bg-[#D47A47] text-[#FFF9EE] shadow-xs active:scale-95 whitespace-nowrap shrink-0"
              >
                {isFA ? 'تالار ۱۰ طومار' : '10-Scroll Hall'}
              </button>
            ) : (
              <div className="w-9 shrink-0" />
            )}
          </div>

          {/* Progress */}
          <div className="flex items-center gap-2.5">
            <span className="text-[10.5px] font-bold shrink-0 tabular-nums whitespace-nowrap" style={{ color: 'var(--cg-ink3)' }}>
              {isFA
                ? `${toFa(unlockedCount)}/${toFa(totalCards)} کارت · ${toFa(unlockedLegendScrollList.length)} طومار`
                : `${unlockedCount}/${totalCards}`}
            </span>
            <div
              className="flex-1 h-2 rounded-full overflow-hidden min-w-[60px]"
              style={{ background: 'rgba(122,80,52,.16)', boxShadow: 'inset 0 1px 2px rgba(86,52,33,.25)' }}
            >
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${progressPct}%`,
                  background: 'linear-gradient(90deg, #B07F22, #E2C079)',
                }}
              />
            </div>
            <span className="text-[11px] font-black shrink-0 tabular-nums text-end" style={{ color: '#9E7418' }}>
              {isFA ? `${toFa(Math.round(progressPct))}٪` : `${Math.round(progressPct)}%`}
            </span>
          </div>
        </header>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-4 pb-10 scrollbar-hide" dir={isFA ? 'rtl' : 'ltr'}>
          <div className="max-w-4xl mx-auto pt-3">
            {/* Compact 10-Scroll Combo Overview Bar */}
            <div
              className="mb-4 rounded-[22px] p-3 border-2"
              style={{
                background: 'linear-gradient(180deg, #FBF4E6 0%, #F2E3CA 100%)',
                borderColor: deckBuffs.hasSynergy ? '#C88B28' : '#B98758',
              }}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5">
                  <Swords size={14} className="text-[#B8522A]" />
                  <span className="text-xs font-black text-[#3B1E0D]">
                    {isFA ? 'قفسهٔ کومبوی ۱۰ طوماری فعال' : 'Active 10-Scroll Combo Rack'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-[#E8D4B4] text-[#5C3418]">
                    {isFA ? `${toFa(deckBuffs.cards.length)}/${toFa(MAX_SCROLL_SLOTS)} طومار` : `${deckBuffs.cards.length}/${MAX_SCROLL_SLOTS}`}
                  </span>
                </div>
                {onOpenFullCollection && (
                  <button
                    type="button"
                    onClick={onOpenFullCollection}
                    className="px-3 py-1 rounded-full text-[10px] font-black text-[#FFF9EE] bg-gradient-to-b from-[#289E92] to-[#176B62] flex items-center gap-1 shadow-xs active:scale-95"
                  >
                    <ScrollText size={12} />
                    <span>{isFA ? 'مدیریت کامل ۱۰ طومار در کالکشن' : 'Manage 10 Scrolls'}</span>
                  </button>
                )}
              </div>

              <p className="text-[10px] font-bold text-[#5C3418]">
                📜 هر اسطوره پس از باز شدن هر ۴ کارتش، یک <b>طومار مجموعه</b> به شما می‌دهد که ردهٔ آن برابر با کمترین ردهٔ کارت‌های همان اسطوره است.
              </p>
            </div>

            {legendMetas.map((legend) => {
              const chapters = WORLD_MAP_CHAPTERS[legend.id] || [];
              if (chapters.length === 0) return null;

              const scrollStatus = legendScrolls[legend.id];
              const stage = (scrollStatus?.isUnlocked && scrollStatus.scrollTier ? scrollStatus.scrollTier : 0) as 0 | 1 | 2 | 3 | 4;
              const stageTheme = SCROLL_STAGE_THEMES[stage];
              const isEquipped = scrollStatus ? (economy.activeDeck || []).includes(scrollStatus.scrollKey) : false;

              return (
                <section key={legend.id} className="mt-6 first:mt-2">
                  {/* Legend Master Scroll Header */}
                  <div
                    className="rounded-t-[20px] p-3.5 border-2 border-b-0 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3"
                    style={{
                      background: stage > 0
                        ? 'linear-gradient(135deg, #FFFDF8 0%, #F5E5C6 100%)'
                        : 'linear-gradient(135deg, #F8F2E7 0%, #E8DAC3 100%)',
                      borderColor: stage > 0 ? stageTheme.parchmentEdge : '#C2A884',
                    }}
                  >
                    <div className="flex items-center gap-3.5 w-full sm:w-auto min-w-0">
                      {scrollStatus && (
                        <MasterScroll
                          stage={stage}
                          title={legend.name.fa}
                          family="football"
                          unlockedCardsCount={scrollStatus.unlockedCards}
                          totalCardsCount={scrollStatus.totalCards}
                          size="xs"
                          isEquipped={isEquipped}
                          onClick={() => handleToggleLegendScroll(scrollStatus)}
                          className="shrink-0"
                        />
                      )}
                      <div className="min-w-0 flex-1 text-right">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-base leading-none">{legend.icon}</span>
                          <h2 className="text-base font-black truncate text-[#261105]">
                            {isFA ? legend.name.fa : legend.name.en}
                          </h2>
                          <span
                            className="px-2.5 py-0.5 rounded-full text-[10.5px] font-black shadow-2xs"
                            style={{ backgroundColor: stageTheme.badgeBg, color: stageTheme.badgeText }}
                          >
                            {stageTheme.nameFa}
                          </span>
                        </div>
                        <div className="mt-2 px-2.5 py-1.5 rounded-xl bg-[#FFFDF9]/90 border border-[#D5BA96] text-[11px] sm:text-xs font-bold text-[#381C0A] leading-5">
                          {!scrollStatus?.isUnlocked
                            ? `🔒 ${toFa(scrollStatus?.unlockedCards || 0)} از ${toFa(chapters.length)} کارت بازشده — تمام کارت‌ها را باز کنید تا طومار خشتی آزاد شود.`
                            : scrollStatus.scrollTier && scrollStatus.scrollTier < 4
                            ? `⚖️ ردهٔ طومار: ${stageTheme.shortFa} (برای ارتقا به ردهٔ بعدی، ${toFa(scrollStatus.bottleneckCount)} کارت رده ${toFa(scrollStatus.scrollTier)} را صیقل دهید)`
                            : '👑 تمامی کارت‌ها و طومار این اسطوره در بالاترین رده (زمرد شاهانه) قرار دارند!'}
                        </div>
                      </div>
                    </div>

                    {scrollStatus?.isUnlocked && scrollStatus.scrollTier && (
                      <button
                        type="button"
                        onClick={() => handleToggleLegendScroll(scrollStatus)}
                        className="px-3.5 py-2 rounded-xl text-[11px] font-black text-[#FFF9F0] flex items-center justify-center gap-1.5 shadow-xs active:scale-95 shrink-0"
                        style={{
                          background: isEquipped
                            ? 'linear-gradient(180deg, #129666 0%, #07593A 100%)'
                            : 'linear-gradient(180deg, #D47A47 0%, #9E4922 100%)',
                        }}
                      >
                        {isEquipped ? <Check size={13} /> : <ScrollText size={13} />}
                        <span>{isEquipped ? '✓ در قفسهٔ کومبو' : '+ چیدن طومار در کومبو'}</span>
                      </button>
                    )}
                  </div>

                  {/* Cards grid */}
                  <div className="coll-bay !rounded-t-none">
                    <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-2.5">
                      {chapters.map((ch) => {
                        const cardRarity = effectiveCardProgress[ch.id] ?? null;
                        const isBottleneck =
                          Boolean(scrollStatus?.isUnlocked) &&
                          scrollStatus?.scrollTier !== null &&
                          scrollStatus.scrollTier < 4 &&
                          cardRarity === scrollStatus.scrollTier;

                        return (
                          <div key={ch.id} className="flex flex-col gap-1">
                            <div className={isBottleneck ? 'ring-2 ring-[#D98A16] rounded-[18px]' : ''}>
                              <LegendCard
                                chapterId={ch.id}
                                legend={legend}
                                title={ch.title}
                                year={ch.year}
                                rarity={cardRarity}
                                bgImage={getChapterBgImage(ch.id)}
                                isFA={isFA}
                                variant="grid"
                                flipping={flippingCardId === ch.id}
                                onClick={() => handleCardClick(ch)}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        </div>

        {toast && (
          <div
            className="fixed inset-x-4 bottom-5 z-[950] mx-auto max-w-sm rounded-2xl px-4 py-2.5 text-center text-xs font-black shadow-xl"
            style={{ backgroundColor: '#FBF4E6', color: '#11544D', border: '1.5px solid #269489' }}
          >
            {toast}
          </div>
        )}
      </div>

      {/* ── Enlarged Card Overlay ── */}
      {enlarged && (
        <EnlargedCard
          chapterId={enlarged.chapterId}
          chapterTitle={enlarged.title}
          chapterYear={enlarged.year}
          rarity={enlarged.rarity}
          legend={enlarged.legend}
          bgImage={enlarged.bgImage}
          isFA={isFA}
          freePolishTokens={economy.freePolishTokens ?? 0}
          parentScroll={legendScrolls[enlarged.legend.id]}
          onPolish={handlePolishEnlarged}
          onClose={() => setEnlarged(null)}
        />
      )}
    </>
  );
};

export default WorldMapCardGallery;
