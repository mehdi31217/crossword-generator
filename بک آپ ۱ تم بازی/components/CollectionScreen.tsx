import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Flame, Sparkles, Swords, X, Play, Check, HelpCircle, Layers, ScrollText } from 'lucide-react';
import {
  Language, PlayerState, StoryBook, StoryGenre, WorldMapCardRarity, WORLD_MAP_RARITY,
} from '../types';
import { gameServer } from '../utils/gameServer';
import { track } from '../utils/analytics';
import {
  SET_REWARD_COINS,
  MAX_SCROLL_SLOTS,
  computeActiveDeckBuffs,
  resolveSetScrollTier,
  SetScrollStatus,
  EconomyStateView,
  DeckCardFamily,
} from '../utils/progression';
import { KILN_POLISH_COSTS } from '../utils/economy';
import { EPIC_CAMPAIGNS } from '../data/campaigns';
import { FOLKTALE_BOOKS } from '../data/folktales/folktalesIndex';
import { WORLD_MAP_CHAPTERS } from '../data/worldMapData';
import { getChapterBgImage } from '../data/legendImages';
import { FOOTBALL_LEGENDS } from './WorldMap';
import { LegendCard, ClayTierBadge } from './LegendCard';
import { MasterScroll, SCROLL_STAGE_THEMES } from './MasterScroll';
import { ScrollRevealCeremony, ScrollAwardPayload } from './ScrollRevealCeremony';
import { GameCoin } from './GameCoin';
import {
  InkBack, InkScroll, InkBooks, InkLeaf, InkGlobe, InkTome, InkGift, InkCheck,
  Medallion,
} from './InkIcons';

type CollectionShelf = 'history' | 'epic' | 'folklore' | 'football';

interface CollectionScreenProps {
  player: PlayerState;
  language: Language;
  shelf: CollectionShelf;
  onShelfChange: (shelf: CollectionShelf) => void;
  worldMapProgress: Record<string, number>;
  worldMapCardProgress: Record<string, WorldMapCardRarity>;
  onSelectBook: (book: StoryBook) => void;
  onSelectLegend: (legend: {
    id: string;
    name: { fa: string; en: string };
    color: string;
    icon: string;
    country: { fa: string; en: string };
  }) => void;
  onBack: () => void;
  /** Server-returned coin balance after a set reward or kiln polish. */
  onCoinsChange?: (coins: number) => void;
}

interface InspectableCardItem {
  cardKey: string;
  chapterId: string;
  setScrollKey: string;
  setTitleFa: string;
  family: DeckCardFamily;
  titleFa: string;
  titleEn: string;
  subtitleFa: string;
  yearLabel: string;
  owned: boolean;
  tier: WorldMapCardRarity;
  bgImage: string | null;
  legendMeta: {
    id: string;
    name: { fa: string; en: string };
    icon: string;
    color: string;
  };
  onPlayChapter: () => void;
}

const SHELVES: {
  id: CollectionShelf;
  label: string;
  Icon: React.FC<{ size?: number }>;
}[] = [
  { id: 'football', label: 'فوتبال', Icon: InkGlobe },
  { id: 'epic', label: 'حماسه', Icon: InkBooks },
  { id: 'history', label: 'تاریخ', Icon: InkScroll },
  { id: 'folklore', label: 'قصه‌ها', Icon: InkLeaf },
];

const toFa = (n: number | string) => String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[+d]);

const bookDone = (book: StoryBook, player: PlayerState) =>
  Math.min(Math.max((player.epicProgress?.[book.id] || 1) - 1, 0), book.chapters.length);

/**
 * Compute progressive clay tablet tier (1..4) for a story chapter:
 * - Opening chapters -> Tier 1 (`خشت سفالین`)
 * - Mid chapters -> Tier 2 (`خشت لعاب فیروزه`)
 * - Later chapters -> Tier 3 (`کتیبه نقش زرین`)
 * - Final chapter of a multi-chapter book -> Tier 4 (`قاب زمردیِ شاهانه`)
 */
export function getStoryChapterClayTier(index: number, total: number): WorldMapCardRarity {
  if (total <= 1) return 1;
  if (index === total - 1 && total >= 6) return 2;
  const ratio = (index + 1) / total;
  if (ratio >= 0.85 && total >= 7) return 2;
  return 1;
}

const FAMILY_SYNERGY_SPECS: {
  family: DeckCardFamily;
  icon: string;
  titleFa: string;
  badgeFa: string;
  singleBuffFa: string;
  onlineBuffFa: string;
  tierValuesFa: string;
  accent: string;
  bgTint: string;
}[] = [
  {
    family: 'football',
    icon: '⚽',
    titleFa: 'طومارهای اساطیر فوتبال',
    badgeFa: '۳ طومار = +۵٪ · ۶ طومار = +۱۲٪ · ۱۰ طومار = +۲۵٪ هم‌افزایی',
    singleBuffFa: 'تک‌نفره: +۲٪ تا +۸٪ ضریب امتیاز کومبو به ازای هر طومار',
    onlineBuffFa: 'نبرد آنلاین: +۲٪ تا +۸٪ سرعت شارژ مانا و تخفیف هزینه حملات به ازای هر طومار',
    tierValuesFa: 'طومار خشتی: +۲٪ · فیروزه: +۴٪ · زرین: +۶٪ · زمرد شاهانه: +۸٪',
    accent: '#1E8278',
    bgTint: 'linear-gradient(180deg, #EEF9F8 0%, #D9F0EC 100%)',
  },
  {
    family: 'epic',
    icon: '🛡️',
    titleFa: 'طومارهای پهلوانان شاهنامه',
    badgeFa: '۳ طومار = +۵٪ · ۶ طومار = +۱۲٪ · ۱۰ طومار = +۲۵٪ هم‌افزایی',
    singleBuffFa: 'تک‌نفره: +۳٪ تا +۱۲٪ زره در برابر خشم دیو به ازای هر طومار',
    onlineBuffFa: 'نبرد آنلاین: -۳٪ تا -۱۲٪ زمان انجماد و کوری + سپر ضدحذف حروف (در طومار زمردی)',
    tierValuesFa: 'طومار خشتی: +۳٪ · فیروزه: +۶٪ · زرین: +۹٪ · زمرد شاهانه: +۱۲٪ + سپر',
    accent: '#B84A2C',
    bgTint: 'linear-gradient(180deg, #FDF1EC 0%, #F7DFD4 100%)',
  },
  {
    family: 'history',
    icon: '👑',
    titleFa: 'طومارهای شهریاران تاریخ',
    badgeFa: '۳ طومار = +۵٪ · ۶ طومار = +۱۲٪ · ۱۰ طومار = +۲۵٪ هم‌افزایی',
    singleBuffFa: 'تک‌نفره: +۲٪ تا +۸٪ سکه و XP بیشتر در پایان هر جدول به ازای هر طومار',
    onlineBuffFa: 'نبرد آنلاین: +۲٪ تا +۸٪ تروفی لیگ بیشتر در بردهای میدان آنلاین',
    tierValuesFa: 'طومار خشتی: +۲٪ · فیروزه: +۴٪ · زرین: +۶٪ · زمرد شاهانه: +۸٪',
    accent: '#C2841A',
    bgTint: 'linear-gradient(180deg, #FEF8E6 0%, #F8E8C0 100%)',
  },
  {
    family: 'folklore',
    icon: '🔮',
    titleFa: 'طومارهای افسانه‌ها و قصه‌ها',
    badgeFa: '۳ طومار = +۵٪ · ۶ طومار = +۱۲٪ · ۱۰ طومار = +۲۵٪ هم‌افزایی',
    singleBuffFa: 'تک‌نفره: -۲٫۵٪ تا -۹٪ تخفیف سکه راهنما به ازای هر طومار',
    onlineBuffFa: 'تک‌نفره و آنلاین: افشای خودکار حرف کلیدی رایگان در شروع بازی (در طومار زرین و زمردی)',
    tierValuesFa: 'طومار خشتی: -۲٫۵٪ · فیروزه: -۵٪ · زرین: -۷٪ · زمرد شاهانه: -۹٪ + حرف آغازین',
    accent: '#2E7D52',
    bgTint: 'linear-gradient(180deg, #EEF8F1 0%, #D7EFE0 100%)',
  },
];

const ChapterCard: React.FC<{
  index: number;
  chapterId: string;
  title: string;
  bookTitle: string;
  bookIcon: string;
  bookColor: string;
  image?: string;
  tier: WorldMapCardRarity;
  owned: boolean;
  isBottleneck: boolean;
  isFA: boolean;
  onClick: () => void;
}> = ({
  index,
  chapterId,
  title,
  bookTitle,
  bookIcon,
  bookColor,
  image,
  tier,
  owned,
  isBottleneck,
  isFA,
  onClick,
}) => {
  return (
    <div className="relative flex flex-col gap-1">
      <div className={isBottleneck ? 'ring-2 ring-[#D98A16] rounded-[18px]' : ''}>
        <LegendCard
          chapterId={chapterId}
          legend={{
            id: chapterId,
            name: { fa: bookTitle, en: bookTitle },
            icon: bookIcon,
            color: bookColor,
          }}
          title={{ fa: title, en: title }}
          year={isFA ? `خوان ${toFa(index + 1)}` : `Ch. ${index + 1}`}
          rarity={owned ? tier : null}
          bgImage={image || null}
          isFA={isFA}
          variant="grid"
          onClick={onClick}
        />
      </div>
      {owned && tier < 4 && (
        <button
          type="button"
          onClick={onClick}
          className={`w-full py-0.5 px-1.5 rounded-full text-[8px] font-black transition-all active:scale-95 ${
            isBottleneck
              ? 'bg-[#FFF3D6] text-[#8A4B08] border border-[#D98A16]'
              : 'bg-[#F7EFE0] text-[#5C3418] border border-[#C6A882]'
          }`}
        >
          {isBottleneck ? '🔥 صیقل برای ارتقای طومار' : '🔥 صیقل در کوره'}
        </button>
      )}
    </div>
  );
};

export const CollectionScreen: React.FC<CollectionScreenProps> = ({
  player, language, shelf, onShelfChange, worldMapProgress, worldMapCardProgress,
  onSelectBook, onSelectLegend, onBack, onCoinsChange,
}) => {
  const isFA = language === 'fa';
  const [books, setBooks] = useState<StoryBook[]>(() => [...EPIC_CAMPAIGNS, ...FOLKTALE_BOOKS]);
  const [loading, setLoading] = useState(false);
  const [claimedSets, setClaimedSets] = useState<Record<string, boolean>>({});
  const [claiming, setClaiming] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [economy, setEconomy] = useState<EconomyStateView>(() => gameServer.getLocalEconomyState());
  const [localWorldMapCards, setLocalWorldMapCards] = useState<Record<string, WorldMapCardRarity>>(
    () => ({ ...worldMapCardProgress }),
  );
  const [localPlayer, setLocalPlayer] = useState<PlayerState>(player);
  const [showComboGuide, setShowComboGuide] = useState(false);
  const [slotPickerIndex, setSlotPickerIndex] = useState<number | null>(null);
  const [slotPickerFilter, setSlotPickerFilter] = useState<'all' | DeckCardFamily>('all');
  const [inspectedCard, setInspectedCard] = useState<InspectableCardItem | null>(null);
  const [inspectedScrollKey, setInspectedScrollKey] = useState<string | null>(null);
  const [showScrollCeremonyLab, setShowScrollCeremonyLab] = useState(false);
  const [activeScrollAward, setActiveScrollAward] = useState<ScrollAwardPayload | null>(null);

  useEffect(() => {
    setLocalWorldMapCards((prev) => ({ ...prev, ...worldMapCardProgress }));
  }, [worldMapCardProgress]);

  useEffect(() => {
    setLocalPlayer(player);
  }, [player]);

  const storyBooks = useMemo(
    () => books.filter((b) => b.genre !== 'education'),
    [books],
  );

  // Compute Master Scroll status (`SetScrollStatus`) for every Football Legend and Story Book set
  const allSetScrolls = useMemo<SetScrollStatus[]>(() => {
    const list: SetScrollStatus[] = [];

    // 1. Football Legend Sets
    for (const legend of FOOTBALL_LEGENDS) {
      const chapters = WORLD_MAP_CHAPTERS[legend.id] || [];
      if (chapters.length === 0) continue;
      const cardTiers = chapters.map((ch) => localWorldMapCards[ch.id] ?? null);
      list.push(
        resolveSetScrollTier(
          `scroll:legend:${legend.id}`,
          legend.id,
          legend.name.fa,
          legend.name.en,
          'football',
          legend.icon,
          legend.color,
          cardTiers,
        ),
      );
    }

    // 2. Story Book Sets (Epic, History, Folklore)
    const genreMeta: Record<StoryGenre, { icon: string; color: string; family: DeckCardFamily }> = {
      epic: { icon: '⚔️', color: '#B85D38', family: 'epic' },
      history: { icon: '👑', color: '#C8952B', family: 'history' },
      folklore: { icon: '🌿', color: '#26A69A', family: 'folklore' },
      education: { icon: '📜', color: '#8E4E37', family: 'epic' },
    };

    for (const book of storyBooks) {
      const total = book.chapters.length;
      if (total === 0) continue;
      const done = bookDone(book, localPlayer);
      const meta = genreMeta[book.genre] || genreMeta.epic;
      const cardTiers: (WorldMapCardRarity | null)[] = book.chapters.map((_, idx) => {
        if (idx >= done) return null;
        const cardKey = `story:${book.id}:${idx + 1}`;
        const baseTier = getStoryChapterClayTier(idx, total);
        const polished = economy.storyCardTiers?.[cardKey] as WorldMapCardRarity | undefined;
        return (polished && polished > baseTier ? polished : baseTier) as WorldMapCardRarity;
      });

      list.push(
        resolveSetScrollTier(
          `scroll:book:${book.id}`,
          book.id,
          book.title,
          book.title,
          meta.family,
          meta.icon,
          meta.color,
          cardTiers,
        ),
      );
    }

    return list;
  }, [localWorldMapCards, storyBooks, localPlayer, economy.storyCardTiers]);

  const scrollStatusByKey = useMemo(() => {
    const map: Record<string, SetScrollStatus> = {};
    for (const s of allSetScrolls) {
      map[s.scrollKey] = s;
    }
    return map;
  }, [allSetScrolls]);

  const unlockedScrolls = useMemo(
    () =>
      allSetScrolls
        .filter((s) => s.isUnlocked && s.scrollTier !== null)
        .sort((a, b) => (b.scrollTier || 0) - (a.scrollTier || 0)),
    [allSetScrolls],
  );

  // Closest set to unlocking a Scroll (for guiding players with 0 unlocked scrolls)
  const closestIncompleteSet = useMemo(() => {
    const incomplete = allSetScrolls.filter((s) => !s.isUnlocked && s.totalCards > 0);
    if (incomplete.length === 0) return null;
    return incomplete.sort(
      (a, b) => b.unlockedCards / b.totalCards - a.unlockedCards / a.totalCards,
    )[0];
  }, [allSetScrolls]);

  const lastSyncedTiersRef = useRef<string>('');

  // Sync unlocked scroll tiers to gameServer AND auto-trigger the Scroll Reveal Ceremony
  // whenever a Set's Master Scroll newly unlocks (after completing the final card of a set)
  // or upgrades to a higher tier (after polishing bottleneck cards in the kiln)!
  useEffect(() => {
    const nextMap: Record<string, WorldMapCardRarity> = {};
    for (const s of allSetScrolls) {
      if (s.isUnlocked && s.scrollTier) {
        nextMap[s.scrollKey] = s.scrollTier;
      }
    }

    const nextMapStr = JSON.stringify(nextMap);
    if (lastSyncedTiersRef.current === nextMapStr) {
      return;
    }
    lastSyncedTiersRef.current = nextMapStr;

    // Check against persisted celebrated scroll tiers in localStorage
    const CELEBRATED_KEY = 'cg_celebrated_scroll_tiers';
    let celebratedMap: Record<string, number> = {};
    let hasSavedBaseline = false;
    try {
      const raw = localStorage.getItem(CELEBRATED_KEY);
      if (raw) {
        celebratedMap = JSON.parse(raw);
        hasSavedBaseline = true;
      }
    } catch {}

    if (!hasSavedBaseline) {
      // Save current state as baseline on first-ever visit, unless a scroll was just unlocked in this session
      try {
        localStorage.setItem(CELEBRATED_KEY, JSON.stringify(nextMap));
      } catch {}
    } else {
      let newlyAwarded: ScrollAwardPayload | null = null;
      const updatedCelebrated = { ...celebratedMap };
      for (const s of allSetScrolls) {
        if (s.isUnlocked && s.scrollTier) {
          const prevTier = Number(celebratedMap[s.scrollKey] || 0);
          if (s.scrollTier > prevTier) {
            updatedCelebrated[s.scrollKey] = s.scrollTier;
            newlyAwarded = {
              scrollKey: s.scrollKey,
              titleFa: s.titleFa,
              subtitleFa: `${toFa(s.totalCards)} از ${toFa(s.totalCards)} کارت کامل`,
              family: s.family,
              tier: s.scrollTier,
              totalCards: s.totalCards,
              isUpgrade: prevTier > 0,
              previousTier: prevTier > 0 ? (prevTier as 1 | 2 | 3) : undefined,
            };
          }
        }
      }
      if (newlyAwarded) {
        try {
          localStorage.setItem(CELEBRATED_KEY, JSON.stringify(updatedCelebrated));
        } catch {}
        setInspectedCard(null);
        setActiveScrollAward(newlyAwarded);
      }
    }

    const currentMap = economy.scrollTiers || {};
    const currentKeys = Object.keys(currentMap);
    const nextKeys = Object.keys(nextMap);
    const changed =
      currentKeys.length !== nextKeys.length ||
      nextKeys.some((k) => currentMap[k] !== nextMap[k]);
    if (changed) {
      const updated = gameServer.syncScrollTiers(nextMap);
      setEconomy(updated);
    }
  }, [allSetScrolls]);

  const deckBuffs = useMemo(
    () => computeActiveDeckBuffs(economy, localWorldMapCards, localPlayer.epicStars),
    [economy, localWorldMapCards, localPlayer.epicStars],
  );

  const handleToggleScrollEquip = (scrollStatus: SetScrollStatus) => {
    if (!scrollStatus.isUnlocked || !scrollStatus.scrollTier) {
      setNotice(
        isFA
          ? `🔒 برای باز شدن طومار «${scrollStatus.titleFa}»، ابتدا تمام ${toFa(scrollStatus.totalCards)} کارت این مجموعه را کامل کنید!`
          : 'Complete all cards in this set to unlock its Master Scroll!',
      );
      return;
    }
    const res = gameServer.toggleDeckCard(scrollStatus.scrollKey);
    setEconomy(res.economy);
    setNotice(
      res.added
        ? isFA
          ? `📜 طومار «${scrollStatus.titleFa}» (${SCROLL_STAGE_THEMES[scrollStatus.scrollTier].shortFa}) در قفسهٔ ۱۰ طوماری کومبو قرار گرفت!`
          : `Equipped ${scrollStatus.titleEn} Scroll!`
        : isFA
        ? `طومار «${scrollStatus.titleFa}» از قفسهٔ کومبو برداشته شد`
        : `Removed ${scrollStatus.titleEn} Scroll`,
    );
  };

  const handleEquipScrollAtSlot = (slotIdx: number, scrollStatus: SetScrollStatus) => {
    if (!scrollStatus.isUnlocked || !scrollStatus.scrollTier) return;
    const updatedEco = gameServer.equipDeckCardAtSlot(slotIdx, scrollStatus.scrollKey);
    setEconomy(updatedEco);
    setSlotPickerIndex(null);
    setNotice(
      isFA
        ? `📜 طومار «${scrollStatus.titleFa}» در جایگاه ${toFa(slotIdx + 1)} قفسهٔ کومبو قرار گرفت!`
        : `Equipped ${scrollStatus.titleEn} Scroll in Slot ${slotIdx + 1}!`,
    );
  };

  const handleAutoEquipBestScrolls = (preferredFamily?: DeckCardFamily) => {
    if (unlockedScrolls.length === 0) {
      setNotice(
        isFA
          ? '📜 هنوز طوماری باز نشده است! ابتدا تمام کارت‌های یک مجموعه (مثلاً ۴ فصل یک اسطوره یا یک داستان کوتاه) را کامل کنید تا اولین طومار خشتی شما آزاد شود.'
          : 'Complete all cards of any set first to unlock your first Master Scroll!',
      );
      return;
    }

    let picked: SetScrollStatus[] = [];
    if (preferredFamily) {
      const famScrolls = unlockedScrolls.filter((s) => s.family === preferredFamily);
      const others = unlockedScrolls.filter((s) => s.family !== preferredFamily);
      picked = [...famScrolls, ...others].slice(0, MAX_SCROLL_SLOTS);
    } else {
      picked = unlockedScrolls.slice(0, MAX_SCROLL_SLOTS);
    }

    const updatedEco = gameServer.setActiveDeck(picked.map((s) => s.scrollKey));
    setEconomy(updatedEco);
    setNotice(
      isFA
        ? `✨ ${toFa(picked.length)} طومار برتر شما در قفسهٔ ۱۰تایی کومبو چیده شد!`
        : `Equipped ${picked.length} Master Scrolls in the 10-slot rack!`,
    );
  };

  const handlePolishInspectedCard = (useFreeToken: boolean) => {
    if (!inspectedCard || inspectedCard.tier >= 4) return;
    const targetTier = (inspectedCard.tier + 1) as 2 | 3 | 4;
    const res = gameServer.polishCardInKiln(
      localPlayer,
      inspectedCard.cardKey,
      targetTier,
      useFreeToken,
      true,
    );
    if (!res.ok) {
      setNotice(res.error || (isFA ? 'صیقل کارت انجام نشد' : 'Could not polish card'));
      return;
    }
    setEconomy(res.economy);
    setLocalPlayer(res.player);
    if (typeof res.coins === 'number') {
      onCoinsChange?.(res.coins);
    }
    if (inspectedCard.cardKey.startsWith('legend:')) {
      const chId = inspectedCard.cardKey.slice('legend:'.length);
      setLocalWorldMapCards((prev) => ({ ...prev, [chId]: res.newTier }));
    }
    setInspectedCard((prev) => (prev ? { ...prev, tier: res.newTier } : null));
    setNotice(
      isFA
        ? `🔥 آفرین! کارت «${inspectedCard.titleFa}» در کوره صیقل یافت و به رده ${toFa(res.newTier)} (${WORLD_MAP_RARITY[res.newTier].fa}) ارتقا پیدا کرد!`
        : `🔥 Card upgraded to Tier ${res.newTier}!`,
    );
  };

  useEffect(() => {
    let alive = true;
    gameServer.getProgress().then((p) => {
      if (alive && p) setClaimedSets(p.claimedSets || {});
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!notice) return;
    const id = window.setTimeout(() => setNotice(null), 4400);
    return () => window.clearTimeout(id);
  }, [notice]);

  const claimSet = async (shelfId: CollectionShelf, setId: string) => {
    const key = `${shelfId}:${setId}`;
    setClaiming(key);
    const res = await gameServer.claimCollectionSet(shelfId, setId);
    setClaiming(null);
    if (!res.ok) {
      setNotice(res.error || (isFA ? 'دریافت جایزه ناموفق بود' : 'Could not claim the reward'));
      return;
    }
    setClaimedSets((prev) => ({ ...prev, ...(res.claimedSets || { [key]: true }) }));
    if (typeof res.coins === 'number') onCoinsChange?.(res.coins);
    track('set_claim', { shelf: shelfId, setId, reward: res.reward || 0, frame: !!res.frameGranted });
    setNotice(
      res.frameGranted
        ? (isFA ? `🎉 قاب این قفسه باز شد! +${toFa(res.reward || 0)} سکه` : `🎉 Shelf frame unlocked! +${res.reward} coins`)
        : (isFA ? `🎁 ${toFa(res.reward || 0)} سکه برای کامل‌کردن مجموعه` : `🎁 +${res.reward} coins for the full set`),
    );
  };

  const renderSetReward = (shelfId: CollectionShelf, setId: string, complete: boolean) => {
    const key = `${shelfId}:${setId}`;
    if (claimedSets[key]) {
      return (
        <span className="coll-claimed">
          <InkCheck size={10} />
          {isFA ? 'گرفته شد' : 'Claimed'}
        </span>
      );
    }
    if (!complete) return null;
    return (
      <button
        onClick={() => claimSet(shelfId, setId)}
        disabled={claiming === key}
        className="coll-reward"
      >
        <InkGift size={11} />
        {isFA ? `${toFa(SET_REWARD_COINS)} سکه` : `${SET_REWARD_COINS} coins`}
      </button>
    );
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      const dbBooks = await gameServer.fetchStoryLibrary().catch(() => [] as StoryBook[]);
      if (!alive) return;
      if (dbBooks.length > 0) setBooks(dbBooks);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const booksFor = (genre: StoryGenre) => storyBooks.filter((b) => b.genre === genre);

  const storyStats = useMemo(() => {
    const stats: Record<string, { earned: number; total: number }> = {};
    (['history', 'epic', 'folklore'] as StoryGenre[]).forEach((genre) => {
      const list = storyBooks.filter((b) => b.genre === genre);
      stats[genre] = {
        total: list.reduce((n, b) => n + b.chapters.length, 0),
        earned: list.reduce((n, b) => n + bookDone(b, localPlayer), 0),
      };
    });
    return stats;
  }, [storyBooks, localPlayer]);

  const footballStats = useMemo(() => {
    let total = 0;
    let earned = 0;
    for (const legend of FOOTBALL_LEGENDS) {
      const chapters = WORLD_MAP_CHAPTERS[legend.id] || [];
      total += chapters.length;
      earned += chapters.filter((ch) => localWorldMapCards[ch.id]).length;
    }
    return { earned, total };
  }, [localWorldMapCards]);

  const statsFor = (id: CollectionShelf) =>
    id === 'football' ? footballStats : (storyStats[id] || { earned: 0, total: 0 });

  const overall = useMemo(() => {
    const all = [...Object.values(storyStats), footballStats];
    return {
      earned: all.reduce((n, s) => n + s.earned, 0),
      total: all.reduce((n, s) => n + s.total, 0),
    };
  }, [storyStats, footballStats]);

  const percent = overall.total ? Math.round((overall.earned / overall.total) * 100) : 0;

  /**
   * Renders the Master Scroll Header Banner right above a Set's cards
   * (Dual Placement: Set Header + 10-Slot Combo Rack)
   */
  const renderSetScrollBanner = (
    scrollStatus: SetScrollStatus | undefined,
    onPlaySet: () => void,
    extraRewardNode?: React.ReactNode,
  ) => {
    if (!scrollStatus) return null;
    const stage = (scrollStatus.isUnlocked && scrollStatus.scrollTier ? scrollStatus.scrollTier : 0) as 0 | 1 | 2 | 3 | 4;
    const stageTheme = SCROLL_STAGE_THEMES[stage];
    const isEquipped = (economy.activeDeck || []).includes(scrollStatus.scrollKey);
    const pct = scrollStatus.totalCards
      ? Math.round((scrollStatus.unlockedCards / scrollStatus.totalCards) * 100)
      : 0;

    return (
      <div
        className="rounded-t-[22px] p-3 sm:p-3.5 border-2 border-b-0 flex flex-col sm:flex-row items-center justify-between gap-3"
        style={{
          background: stage > 0
            ? 'linear-gradient(135deg, #FFFDF7 0%, #F5E5C6 60%, #EAD1A7 100%)'
            : 'linear-gradient(135deg, #F6EFE3 0%, #E8DAC3 100%)',
          borderColor: stage > 0 ? stageTheme.parchmentEdge : '#C2A884',
        }}
      >
        {/* Left/Right: Master Scroll Visual + Set Title & Minimum-Tier Rule Explanation */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <MasterScroll
            stage={stage}
            title={scrollStatus.titleFa}
            family={scrollStatus.family}
            unlockedCardsCount={scrollStatus.unlockedCards}
            totalCardsCount={scrollStatus.totalCards}
            size="xs"
            isEquipped={isEquipped}
            onClick={() => setInspectedScrollKey(scrollStatus.scrollKey)}
            className="shrink-0"
          />

          <div className="flex-1 min-w-0 text-right">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={onPlaySet}
                className="text-sm sm:text-base font-black text-[#2E1709] hover:underline text-right truncate"
              >
                {scrollStatus.icon} {scrollStatus.titleFa}
              </button>
              <span
                className="px-2 py-0.5 rounded-full text-[9.5px] font-black"
                style={{
                  backgroundColor: stageTheme.badgeBg,
                  color: stageTheme.badgeText,
                }}
              >
                {stageTheme.nameFa}
              </span>
              {extraRewardNode}
            </div>

            {/* Progress Bar */}
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[10px] font-extrabold text-[#5C3418] shrink-0">
                {toFa(scrollStatus.unlockedCards)} از {toFa(scrollStatus.totalCards)} کارت مجموعه
              </span>
              <div className="flex-1 max-w-[160px] h-2 rounded-full bg-[#D9C3A3] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${scrollStatus.unlockedCards ? Math.max(8, pct) : 0}%`,
                    background: stage > 0 ? stageTheme.shamsaOuter : '#8C6240',
                  }}
                />
              </div>
            </div>

            {/* Minimum-Tier Inheritance Rule Status (`قانون کمترین ردهٔ کارت‌های مجموعه`) */}
            <p className="text-[10px] font-bold text-[#633B1D] mt-1 leading-4">
              {!scrollStatus.isUnlocked ? (
                <>
                  🔒 <b>شرط دریافت طومار خشتی:</b> باز کردن هر {toFa(scrollStatus.totalCards)} کارت این مجموعه (
                  {toFa(scrollStatus.totalCards - scrollStatus.unlockedCards)} کارت باقی‌مانده).
                </>
              ) : scrollStatus.scrollTier && scrollStatus.scrollTier < 4 ? (
                <>
                  ⚖️ <b>ردهٔ فعلی طومار ({stageTheme.shortFa}):</b> برابر با کمترین ردهٔ کارت‌های این مجموعه است. برای ارتقای طومار به{' '}
                  <b>{SCROLL_STAGE_THEMES[(scrollStatus.scrollTier + 1) as 2 | 3 | 4].nameFa}</b>،{' '}
                  <span className="text-[#B84A2C] font-black">
                    {toFa(scrollStatus.bottleneckCount)} کارتِ ردهٔ {toFa(scrollStatus.scrollTier)}
                  </span>{' '}
                  مشخص‌شده در پایین را در کوره صیقل دهید!
                </>
              ) : (
                <>
                  👑 <b>کمالِ طومار مجموعه:</b> تمام کارت‌های این مجموعه به ردهٔ ۴ (زمرد شاهانه) رسیده‌اند!
                </>
              )}
            </p>
          </div>
        </div>

        {/* Action Buttons on Set Scroll Header */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end shrink-0">
          <button
            type="button"
            onClick={() => setInspectedScrollKey(scrollStatus.scrollKey)}
            className="px-2.5 py-2 rounded-xl text-[10px] font-black text-[#4E2D16] bg-[#FFF8EC] border border-[#C4A176] hover:brightness-95 active:scale-95"
          >
            بررسی طومار
          </button>

          {scrollStatus.isUnlocked && scrollStatus.scrollTier ? (
            <button
              type="button"
              onClick={() => handleToggleScrollEquip(scrollStatus)}
              className="px-3.5 py-2 rounded-xl text-[10.5px] font-black text-[#FFF9F0] flex items-center gap-1.5 shadow-sm active:scale-95 transition-transform"
              style={{
                background: isEquipped
                  ? 'linear-gradient(180deg, #129666 0%, #07593A 100%)'
                  : 'linear-gradient(180deg, #D47A47 0%, #9E4922 100%)',
                border: isEquipped ? '1px solid #80FFCC' : '1px solid #F5C59B',
              }}
            >
              {isEquipped ? <Check size={13} /> : <ScrollText size={13} />}
              <span>
                {isEquipped ? '✓ در قفسهٔ کومبو' : '+ افزودن طومار به کومبو'}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onPlaySet}
              className="px-3 py-2 rounded-xl text-[10px] font-black text-[#FFF9F0] bg-gradient-to-b from-[#8C6240] to-[#5C3A1E] border border-[#D5BA96] flex items-center gap-1 active:scale-95"
            >
              <Play size={11} />
              <span>تکمیل مجموعه</span>
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderStoryShelf = (genre: StoryGenre) => {
    const list = booksFor(genre);
    if (list.length === 0) {
      return (
        <div className="on-clay-2 text-center py-16">
          <Medallion tone="cream" size={44}>
            <InkTome size={20} />
          </Medallion>
          <p className="text-sm font-bold mt-2">هنوز چیزی برای نمایش نیست.</p>
        </div>
      );
    }
    const genreMeta: Record<StoryGenre, { icon: string; color: string; family: DeckCardFamily; sub: string }> = {
      epic: { icon: '⚔️', color: '#B85D38', family: 'epic', sub: 'زره دیو و ضدحمله آنلاین' },
      history: { icon: '👑', color: '#C8952B', family: 'history', sub: 'سکه و تروفی لیگ آنلاین' },
      folklore: { icon: '🌿', color: '#26A69A', family: 'folklore', sub: 'تخفیف راهنما و حرف آغازین' },
      education: { icon: '📜', color: '#8E4E37', family: 'epic', sub: 'زره دیو' },
    };

    return list.map((book) => {
      const done = bookDone(book, localPlayer);
      const total = book.chapters.length;
      const meta = genreMeta[book.genre] || genreMeta.epic;
      const scrollKey = `scroll:book:${book.id}`;
      const scrollStatus = scrollStatusByKey[scrollKey];

      return (
        <section key={book.id} className="mb-6">
          {renderSetScrollBanner(
            scrollStatus,
            () => onSelectBook(book),
            renderSetReward(genre as CollectionShelf, book.id, total > 0 && done >= total),
          )}

          <div className="coll-bay !rounded-t-none">
            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-2.5">
              {book.chapters.map((chapter, idx) => {
                const cardKey = `story:${book.id}:${idx + 1}`;
                const polishedTier = economy.storyCardTiers?.[cardKey] as WorldMapCardRarity | undefined;
                const baseTier = getStoryChapterClayTier(idx, total);
                const effectiveTier = (polishedTier && polishedTier > baseTier ? polishedTier : baseTier) as WorldMapCardRarity;
                const isOwned = idx < done;
                const isBottleneck =
                  Boolean(scrollStatus?.isUnlocked) &&
                  scrollStatus?.scrollTier !== null &&
                  scrollStatus.scrollTier < 4 &&
                  effectiveTier === scrollStatus.scrollTier;

                return (
                  <ChapterCard
                    key={chapter.id ?? idx}
                    index={idx}
                    chapterId={`${book.id}_ch_${idx + 1}`}
                    title={chapter.title}
                    bookTitle={book.title}
                    bookIcon={meta.icon}
                    bookColor={meta.color}
                    image={chapter.image || book.coverImage}
                    tier={effectiveTier}
                    owned={isOwned}
                    isBottleneck={isBottleneck}
                    isFA={isFA}
                    onClick={() =>
                      setInspectedCard({
                        cardKey,
                        chapterId: `${book.id}_ch_${idx + 1}`,
                        setScrollKey: scrollKey,
                        setTitleFa: book.title,
                        family: meta.family,
                        titleFa: `${book.title} — ${chapter.title}`,
                        titleEn: `${book.title} — ${chapter.title}`,
                        subtitleFa: meta.sub,
                        yearLabel: isFA ? `خوان ${toFa(idx + 1)}` : `Ch. ${idx + 1}`,
                        owned: isOwned,
                        tier: effectiveTier,
                        bgImage: chapter.image || book.coverImage || null,
                        legendMeta: {
                          id: book.id,
                          name: { fa: book.title, en: book.title },
                          icon: meta.icon,
                          color: meta.color,
                        },
                        onPlayChapter: () => onSelectBook(book),
                      })
                    }
                  />
                );
              })}
            </div>
          </div>
        </section>
      );
    });
  };

  const renderFootballShelf = () => {
    return FOOTBALL_LEGENDS.map((legend) => {
      const chapters = WORLD_MAP_CHAPTERS[legend.id] || [];
      if (chapters.length === 0) return null;
      const owned = chapters.filter((ch) => localWorldMapCards[ch.id]).length;
      const scrollKey = `scroll:legend:${legend.id}`;
      const scrollStatus = scrollStatusByKey[scrollKey];

      return (
        <section key={legend.id} className="mb-6">
          {renderSetScrollBanner(
            scrollStatus,
            () => onSelectLegend(legend),
            renderSetReward('football', legend.id, owned >= chapters.length),
          )}

          <div className="coll-bay !rounded-t-none">
            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-2.5">
              {chapters.map((ch) => {
                const cardRarity = localWorldMapCards[ch.id] ?? null;
                const cardKey = `legend:${ch.id}`;
                const bgImg = getChapterBgImage(ch.id) || ch.bgImage || null;
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
                        legend={{ id: legend.id, name: legend.name, icon: legend.icon, color: legend.color }}
                        title={ch.title}
                        year={ch.year}
                        rarity={cardRarity}
                        bgImage={bgImg}
                        isFA={isFA}
                        variant="grid"
                        onClick={() =>
                          setInspectedCard({
                            cardKey,
                            chapterId: ch.id,
                            setScrollKey: scrollKey,
                            setTitleFa: legend.name.fa,
                            family: 'football',
                            titleFa: ch.title.fa,
                            titleEn: ch.title.en,
                            subtitleFa: `${legend.name.fa} · توربو مانا و کومبوی امتیاز`,
                            yearLabel: ch.year,
                            owned: cardRarity !== null,
                            tier: (cardRarity ?? 1) as WorldMapCardRarity,
                            bgImage: bgImg,
                            legendMeta: {
                              id: legend.id,
                              name: legend.name,
                              icon: legend.icon,
                              color: legend.color,
                            },
                            onPlayChapter: () => onSelectLegend(legend),
                          })
                        }
                      />
                    </div>
                    {cardRarity !== null && cardRarity < 4 && (
                      <button
                        type="button"
                        onClick={() =>
                          setInspectedCard({
                            cardKey,
                            chapterId: ch.id,
                            setScrollKey: scrollKey,
                            setTitleFa: legend.name.fa,
                            family: 'football',
                            titleFa: ch.title.fa,
                            titleEn: ch.title.en,
                            subtitleFa: `${legend.name.fa} · توربو مانا و کومبوی امتیاز`,
                            yearLabel: ch.year,
                            owned: true,
                            tier: cardRarity,
                            bgImage: bgImg,
                            legendMeta: {
                              id: legend.id,
                              name: legend.name,
                              icon: legend.icon,
                              color: legend.color,
                            },
                            onPlayChapter: () => onSelectLegend(legend),
                          })
                        }
                        className={`w-full py-0.5 px-1.5 rounded-full text-[8px] font-black transition-all active:scale-95 ${
                          isBottleneck
                            ? 'bg-[#FFF3D6] text-[#8A4B08] border border-[#D98A16]'
                            : 'bg-[#F7EFE0] text-[#5C3418] border border-[#C6A882]'
                        }`}
                      >
                        {isBottleneck ? '🔥 صیقل برای ارتقای طومار' : '🔥 صیقل در کوره'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      );
    });
  };

  const inspectedScroll = inspectedScrollKey ? scrollStatusByKey[inspectedScrollKey] : null;

  return (
    <div className="clay-wall w-full h-full flex flex-col overflow-hidden relative">
      {/* Top Fixed Header */}
      <header className="px-3 sm:px-6 pt-2 sm:pt-3 pb-2 shrink-0 relative z-10">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <button onClick={onBack} className="cg-chip !rounded-full !p-2 transition-all hover:brightness-105">
              <span className="ink-back-flip"><InkBack size={16} /></span>
            </button>
            <div className="cg-chip coin !rounded-full !py-1 !px-2.5 flex items-center gap-1.5">
              <GameCoin size={14} />
              <span className="text-xs font-black tabular-nums">{toFa(localPlayer.coins)}</span>
            </div>
            <div className="cg-chip !rounded-full !py-1 !px-2.5 flex items-center gap-1 text-[10px] font-black text-[#6E3C19]">
              <Flame size={12} className="text-[#C86D3B]" />
              <span>{isFA ? `مُهر صیقل: ${toFa(economy.freePolishTokens ?? 0)}` : `Seals: ${economy.freePolishTokens ?? 0}`}</span>
            </div>
          </div>

          <div className="text-right">
            <div className="flex items-center gap-2 justify-end">
              <Medallion tone="cream" size={30}>
                <InkScroll size={16} />
              </Medallion>
              <h1 className="on-clay text-base sm:text-xl font-black">
                {isFA ? 'کالکشن کارت‌ها و تالار ۱۰ طومار کومبو' : 'Card Collection & 10-Scroll Combo Hall'}
              </h1>
            </div>
          </div>
        </div>

        {/* Progress Bar + Shelf Tabs */}
        <div className="coll-progress" dir="rtl">
          <span className="coll-progress-label">
            {toFa(overall.earned)} از {toFa(overall.total)} کارت · {toFa(unlockedScrolls.length)} از {toFa(allSetScrolls.length)} طومار مجموعه بازشده
          </span>
          <span className="coll-progress-track">
            <i style={{ width: `${percent}%` }} />
          </span>
          <span className="coll-progress-pct">{toFa(percent)}٪</span>
        </div>

        <div className="treasure-tray mt-2" dir="rtl">
          {SHELVES.map((tab) => {
            const active = shelf === tab.id;
            const stats = statsFor(tab.id);
            return (
              <button
                key={tab.id}
                onClick={() => onShelfChange(tab.id)}
                className={`treasure-tab ${active ? 'on' : ''}`}
                aria-pressed={active}
              >
                <span className="treasure-tab-head">
                  <tab.Icon size={14} />
                  <span className="treasure-tab-label">{tab.label}</span>
                </span>
                <span className="treasure-tab-line tabular-nums">
                  {toFa(stats.earned)} / {toFa(stats.total)}
                </span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Scrollable Content (Includes 10-Scroll Combo Rack + Card Shelves) */}
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 opacity-70">
          <Medallion tone="cream" size={46}>
            <InkTome size={22} />
          </Medallion>
          <span className="text-xs font-bold">در حال باز کردن کالکشن...</span>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-3 sm:px-6 pb-14 relative z-10 scrollbar-hide">
          <div className="max-w-4xl mx-auto" dir="rtl">
            {/* Guide Banner when player starts with an empty rack (0 unlocked scrolls) */}
            {unlockedScrolls.length === 0 && (
              <div
                className="mb-3.5 rounded-[24px] p-3.5 border-2 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md"
                style={{
                  background: 'linear-gradient(135deg, #FFF9EB 0%, #F4E0B8 60%, #E5C693 100%)',
                  borderColor: '#B87B3E',
                }}
              >
                <div className="flex items-center gap-3 text-right">
                  <MasterScroll
                    stage={1}
                    title="طومار مجموعه"
                    subtitle="نمونهٔ طومار خشتی"
                    family="epic"
                    size="xs"
                    className="shrink-0"
                  />
                  <div>
                    <div className="text-xs sm:text-sm font-black text-[#3B1E0D]">
                      📜 چطور اولین «طومار مجموعه» خود را برای چیدمان کومبو به دست آوریم؟
                    </div>
                    <p className="text-[10.5px] font-bold text-[#5C3418] mt-1 leading-5">
                      در سیستم جدید، <b>کومبوها با طومارهای مجموعه ساخته می‌شوند نه با تک‌کارت‌ها!</b> کافی است تمام کارت‌های یک اسطوره (۴ فصل) یا یک داستان را باز کنید تا <b>طومار خشتی</b> آن مجموعه آزاد شود. سپس با صیقل دادن همهٔ کارت‌های آن مجموعه به فیروزه، زرین یا زمرد، طومارتان نیز هم‌رده با کمترین کارت مجموعه ارتقا می‌یابد!
                    </p>
                  </div>
                </div>
                {closestIncompleteSet && (
                  <button
                    type="button"
                    onClick={() => {
                      if (closestIncompleteSet.scrollKey.startsWith('scroll:legend:')) {
                        const leg = FOOTBALL_LEGENDS.find((l) => l.id === closestIncompleteSet.setId);
                        if (leg) onSelectLegend(leg);
                      } else {
                        const bk = storyBooks.find((b) => b.id === closestIncompleteSet.setId);
                        if (bk) onSelectBook(bk);
                      }
                    }}
                    className="shrink-0 w-full sm:w-auto px-4 py-2.5 rounded-2xl font-black text-xs text-[#FFF9F0] flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-transform"
                    style={{
                      background: 'linear-gradient(180deg, #B85828 0%, #7C3512 100%)',
                      border: '1.5px solid #F3C892',
                    }}
                  >
                    <Play size={13} />
                    <span>
                      تکمیل «{closestIncompleteSet.titleFa}» ({toFa(closestIncompleteSet.unlockedCards)}/
                      {toFa(closestIncompleteSet.totalCards)})
                    </span>
                  </button>
                )}
              </div>
            )}

            {/* ─── 10-SCROLL MASTER COMBO RACK (`قفسهٔ چیدمان کومبوی ۱۰ طوماری`) ─── */}
            <div
              className="mb-5 rounded-[26px] p-3.5 sm:p-4 border-2 transition-all"
              style={{
                background: 'linear-gradient(180deg, #FBF4E6 0%, #F2E3CA 65%, #E7D2B0 100%)',
                borderColor: deckBuffs.hasSynergy ? '#C88B28' : '#B98758',
                boxShadow: deckBuffs.hasSynergy
                  ? 'inset 0 2px 0 rgba(255,255,255,0.85), 0 4px 0 #8E5B15, 0 12px 24px -10px rgba(180,115,24,0.4)'
                  : 'inset 0 2px 0 rgba(255,255,255,0.85), 0 4px 0 #8C5B36, 0 10px 20px -12px rgba(70,40,20,0.35)',
              }}
            >
              {/* Top Header Row of 10-Scroll Rack */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs sm:text-sm font-black text-[#3B1E0D] flex items-center gap-1.5">
                    <Swords size={15} className="text-[#B8522A]" />
                    <span>قفسهٔ چیدمان کومبوی ۱۰ طوماری (تک‌نفره و آنلاین)</span>
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[9.5px] font-black bg-[#E8D4B4] text-[#5C3418] border border-[#C4A176]">
                    {toFa(deckBuffs.cards.length)} از {toFa(MAX_SCROLL_SLOTS)} طومار فعال
                  </span>
                  {deckBuffs.familySynergies.map((syn) => (
                    <span
                      key={syn.family}
                      className="px-2.5 py-0.5 rounded-full text-[9.5px] font-black bg-gradient-to-r from-[#C88822] to-[#129666] text-[#FFF9EE] shadow-xs"
                    >
                      ✨ {syn.labelFa}
                    </span>
                  ))}
                </div>

                {/* Quick Rack Actions */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setShowScrollCeremonyLab(true)}
                    className="px-3 py-1.5 rounded-full text-[10px] font-black text-[#FFF9EE] flex items-center gap-1 transition-transform active:scale-95 shadow-sm"
                    style={{
                      background: 'linear-gradient(135deg, #129666 0%, #064E33 65%, #C88B28 100%)',
                      border: '1px solid #80FFCC',
                    }}
                  >
                    <Sparkles size={12} />
                    <span>🎬 تست ۵ انیمیشن طومار (۴ رده)</span>
                  </button>
                  {unlockedScrolls.length > 0 && (
                    <button
                      type="button"
                      onClick={() => handleAutoEquipBestScrolls()}
                      className="px-3 py-1.5 rounded-full text-[10px] font-black text-[#FFF9EE] flex items-center gap-1 transition-transform active:scale-95"
                      style={{
                        background: 'linear-gradient(180deg, #D47A47 0%, #9E4922 100%)',
                        border: '1px solid #F5C59B',
                        boxShadow: '0 2px 0 #6B2E12',
                      }}
                    >
                      <Sparkles size={12} />
                      <span>چیدمان خودکار برترین طومارها</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowComboGuide((v) => !v)}
                    className="px-2.5 py-1.5 rounded-full text-[10px] font-black text-[#4E2D16] bg-[#FFF8EC] border border-[#C4A176] flex items-center gap-1 hover:brightness-95 active:scale-95"
                  >
                    <HelpCircle size={12} className="text-[#B86B35]" />
                    <span>{showComboGuide ? 'بستن راهنما' : 'قوانین طومار و هم‌افزایی ۳/۶/۱۰'}</span>
                  </button>
                </div>
              </div>

              {/* 10 Interactive Master Scroll Slots (2 rows of 5 on mobile, 10 across on desktop) */}
              <div className="grid grid-cols-5 sm:grid-cols-5 md:grid-cols-10 gap-2">
                {Array.from({ length: MAX_SCROLL_SLOTS }, (_, slotIdx) => {
                  const slot = deckBuffs.cards[slotIdx];
                  if (!slot) {
                    return (
                      <button
                        key={slotIdx}
                        type="button"
                        onClick={() => {
                          setSlotPickerFilter('all');
                          setSlotPickerIndex(slotIdx);
                        }}
                        className="rounded-2xl border-2 border-dashed border-[#B89062] bg-[#FFF9EE]/75 hover:bg-[#FFF9EE] p-1.5 flex flex-col items-center justify-center text-center min-h-[106px] transition-all active:scale-95 group"
                      >
                        <span className="w-6 h-6 rounded-full bg-[#EAD6B8] text-[#6E3C19] flex items-center justify-center text-xs font-black mb-1 group-hover:scale-110 transition-transform">
                          +
                        </span>
                        <span className="text-[9px] font-black text-[#5C3418]">
                          طومار {toFa(slotIdx + 1)}
                        </span>
                        <span className="text-[7.5px] font-bold text-[#8C6240] mt-0.5">
                          انتخاب طومار
                        </span>
                      </button>
                    );
                  }

                  const scrollMeta = scrollStatusByKey[slot.key];
                  const stage = (scrollMeta?.scrollTier || slot.tier) as 1 | 2 | 3 | 4;
                  const cleanTitle = scrollMeta ? scrollMeta.titleFa : slot.titleFa.replace(/^طومار\s+/, '');

                  return (
                    <div
                      key={`${slot.key}-${slotIdx}`}
                      className="relative flex flex-col items-center justify-between rounded-2xl border bg-gradient-to-b from-[#FFFDF8] to-[#F3E2C6] p-1.5 shadow-xs"
                      style={{ borderColor: SCROLL_STAGE_THEMES[stage].parchmentEdge }}
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const res = gameServer.toggleDeckCard(slot.key);
                          setEconomy(res.economy);
                        }}
                        className="absolute -top-1.5 -left-1.5 z-10 w-5 h-5 rounded-full bg-[#6B2E12] text-[#FFF9EE] flex items-center justify-center shadow hover:bg-[#B84A2C]"
                        title="برداشتن طومار"
                      >
                        <X size={10} />
                      </button>

                      <MasterScroll
                        stage={stage}
                        title={cleanTitle}
                        family={slot.family}
                        size="xs"
                        onClick={() => {
                          setSlotPickerFilter('all');
                          setSlotPickerIndex(slotIdx);
                        }}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Active 10-Scroll Combo Powers Summary */}
              <div className="mt-3 pt-2.5 border-t border-[#D5BA96] flex flex-wrap items-center justify-between gap-1.5 text-[9.5px] font-black">
                {deckBuffs.cards.length === 0 ? (
                  <span className="text-[#6E4526]">
                    💡 قفسهٔ کومبوی شما خالی است ({toFa(0)} از {toFa(10)} طومار). با کامل کردن تمام کارت‌های هر مجموعه، طومار آن آزاد می‌شود و می‌توانید تا ۱۰ طومار در این قفسه بچینید!
                  </span>
                ) : (
                  <div className="flex flex-wrap items-center gap-1.5">
                    {deckBuffs.onlineManaChargeBonusPct > 0 && (
                      <span className="px-2.5 py-0.5 rounded-full bg-[#E1F3F1] text-[#11544D] border border-[#269489]/50">
                        ⚽ +{toFa(deckBuffs.comboScoreBonusPct)}٪ امتیاز کومبو · +{toFa(deckBuffs.onlineManaChargeBonusPct)}٪ شارژ مانا آنلاین
                      </span>
                    )}
                    {deckBuffs.monsterArmorPct > 0 && (
                      <span className="px-2.5 py-0.5 rounded-full bg-[#FBE7DE] text-[#7D2918] border border-[#C86446]/50">
                        🛡️ +{toFa(deckBuffs.monsterArmorPct)}٪ زره دیو · -{toFa(deckBuffs.onlineDebuffResistPct)}٪ زمان انجماد/کوری آنلاین
                        {deckBuffs.onlineEraseShieldCharges > 0 ? ` · ${toFa(deckBuffs.onlineEraseShieldCharges)}× سپر ضدحذف` : ''}
                      </span>
                    )}
                    {deckBuffs.coinXpBonusPct > 0 && (
                      <span className="px-2.5 py-0.5 rounded-full bg-[#FDF0CE] text-[#6E4409] border border-[#D49B2A]/60">
                        👑 +{toFa(deckBuffs.coinXpBonusPct)}٪ سکه و XP · +{toFa(deckBuffs.onlineTrophyBonusPct)}٪ تروفی لیگ آنلاین
                      </span>
                    )}
                    {deckBuffs.hintDiscountPct > 0 && (
                      <span className="px-2.5 py-0.5 rounded-full bg-[#E5F4E8] text-[#1D5933] border border-[#3E9B60]/50">
                        🔮 -{toFa(deckBuffs.hintDiscountPct)}٪ هزینه راهنما
                        {deckBuffs.startingFreeLetterCount > 0
                          ? ` · +${toFa(deckBuffs.startingFreeLetterCount)} حرف طلایی رایگان در شروع بازی!`
                          : ''}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Collapsible 4-Family Stepped Synergy Guide (`قوانین طومارها و هم‌افزایی ۳ / ۶ / ۱۰`) */}
              {showComboGuide && (
                <div className="mt-3 pt-3 border-t-2 border-[#D5BA96] space-y-2.5 animate-in fade-in duration-200">
                  <div className="rounded-2xl p-2.5 bg-[#FFF9EC] border border-[#C8952B]/50 text-[10px] font-bold text-[#4E2D16] leading-5">
                    <div>
                      📜 <b>قانون ۱ (شرط دریافت طومار):</b> زمانی که تمام کارت‌های یک اسطوره یا یک داستان را باز کنید، <b>طومار آن مجموعه</b> آزاد می‌شود.
                    </div>
                    <div>
                      ⚖️ <b>قانون ۲ (ردهٔ طومار = کمترین ردهٔ کارت‌های مجموعه):</b> اگر حتی ۱ کارت از مجموعه‌ای خشتی (رده ۱) باشد و بقیه فیروزه یا زرین باشند، طومار آن مجموعه خشتی است تا زمانی که همهٔ کارت‌های آن مجموعه را در کوره حداقل به ردهٔ بالاتر صیقل دهید!
                    </div>
                    <div>
                      🔥 <b>قانون ۳ (هم‌افزایی پله‌ای خاندان‌ها در ۱۰ طومار):</b> چیدن <b>۳ طومار هم‌خاندان = +۵٪</b>، چیدن <b>۶ طومار هم‌خاندان = +۱۲٪</b>، و چیدن <b>۱۰ طومار هم‌خاندان = +۲۵٪</b> پاداش هم‌افزایی به قدرت کل آن خاندان اضافه می‌کند!
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {FAMILY_SYNERGY_SPECS.map((spec) => {
                      const famScrollCount = unlockedScrolls.filter((s) => s.family === spec.family).length;
                      return (
                        <div
                          key={spec.family}
                          className="rounded-2xl p-2.5 border flex flex-col justify-between gap-1.5"
                          style={{
                            background: spec.bgTint,
                            borderColor: `${spec.accent}66`,
                          }}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-xs font-black text-[#2B1608] flex items-center gap-1">
                                <span>{spec.icon}</span>
                                <span>{spec.titleFa}</span>
                              </span>
                              <span
                                className="px-2 py-0.5 rounded-full text-[8.5px] font-black text-white"
                                style={{ backgroundColor: spec.accent }}
                              >
                                {toFa(famScrollCount)} طومار بازشده
                              </span>
                            </div>
                            <p className="text-[9px] font-black text-[#8A4B08] mt-0.5">
                              ✨ {spec.badgeFa}
                            </p>
                            <p className="text-[9.5px] font-bold text-[#4E2D16] mt-1">
                              • {spec.singleBuffFa}
                            </p>
                            <p className="text-[9.5px] font-bold text-[#14524C]">
                              • {spec.onlineBuffFa}
                            </p>
                            <p className="text-[8.5px] font-extrabold text-[#7A5438] mt-0.5">
                              {spec.tierValuesFa}
                            </p>
                          </div>
                          {famScrollCount > 0 && (
                            <button
                              type="button"
                              onClick={() => handleAutoEquipBestScrolls(spec.family)}
                              className="w-full py-1.5 px-2.5 rounded-xl text-[9.5px] font-black text-white flex items-center justify-center gap-1 shadow-xs active:scale-95 transition-transform"
                              style={{ backgroundColor: spec.accent }}
                            >
                              <Layers size={11} />
                              <span>چیدن طومارهای {spec.titleFa} در قفسه</span>
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Active Shelf Sets & Cards Grid */}
            {shelf === 'football'
              ? renderFootballShelf()
              : renderStoryShelf(shelf as StoryGenre)}
          </div>
        </div>
      )}

      {/* ─── MODAL 1: 10-SLOT MASTER SCROLL PICKER (`انتخاب طومار برای جایگاه کومبو`) ─── */}
      {slotPickerIndex !== null && (
        <div
          dir="rtl"
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/65 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150"
          onClick={() => setSlotPickerIndex(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl max-h-[86dvh] flex flex-col rounded-[28px] border-2 border-[#B98758] overflow-hidden shadow-2xl"
            style={{
              background: 'linear-gradient(180deg, #FBF4E6 0%, #F2E3CA 100%)',
            }}
          >
            {/* Modal Header */}
            <div className="px-4 py-3 border-b border-[#D5BA96] flex items-center justify-between bg-[#F6E8CF]">
              <div>
                <h3 className="text-sm sm:text-base font-black text-[#3B1E0D]">
                  📜 انتخاب طومار برای جایگاه {toFa(slotPickerIndex + 1)} (از ۱۰ جایگاه کومبو)
                </h3>
                <p className="text-[10px] font-bold text-[#6E4526]">
                  هم‌افزایی خاندان: ۳ طومار (+۵٪) · ۶ طومار (+۱۲٪) · ۱۰ طومار (+۲۵٪)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSlotPickerIndex(null)}
                className="w-8 h-8 rounded-full bg-[#E5CFB0] text-[#4E2D16] flex items-center justify-center hover:brightness-95"
              >
                <X size={16} />
              </button>
            </div>

            {/* Family Filter Pills */}
            <div className="px-4 py-2 border-b border-[#E2CCA8] flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
              {[
                { id: 'all', label: `همه طومارهای باز (${toFa(unlockedScrolls.length)})` },
                { id: 'football', label: '⚽ فوتبال' },
                { id: 'epic', label: '🛡️ حماسه' },
                { id: 'history', label: '👑 تاریخ' },
                { id: 'folklore', label: '🔮 قصه‌ها' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setSlotPickerFilter(f.id as 'all' | DeckCardFamily)}
                  className={`px-3 py-1 rounded-full text-[10px] font-black shrink-0 transition-all ${
                    slotPickerFilter === f.id
                      ? 'bg-[#9E4922] text-[#FFF8EE] shadow-xs'
                      : 'bg-[#EAD8BC] text-[#5C3418] hover:brightness-95'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Unlocked & In-Progress Scrolls List */}
            <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
              {unlockedScrolls.filter((s) => slotPickerFilter === 'all' || s.family === slotPickerFilter).length === 0 ? (
                <div className="rounded-2xl p-4 bg-[#FFF8EC] border border-[#D49B2A] text-center space-y-2">
                  <p className="text-xs font-black text-[#4E2D16]">
                    هنوز طوماری در این دسته باز نشده است!
                  </p>
                  <p className="text-[10.5px] font-bold text-[#6E4526]">
                    برای باز شدن طومار هر مجموعه، کافی است تمام کارت‌های آن اسطوره یا کتاب داستانی را کامل کنید. مجموعه‌های نزدیک به تکمیل را در زیر ببینید:
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {unlockedScrolls
                    .filter((s) => slotPickerFilter === 'all' || s.family === slotPickerFilter)
                    .map((scrollItem) => {
                      const isEquipped = (economy.activeDeck || []).includes(scrollItem.scrollKey);
                      const stage = (scrollItem.scrollTier || 1) as 1 | 2 | 3 | 4;
                      const theme = SCROLL_STAGE_THEMES[stage];
                      return (
                        <button
                          key={scrollItem.scrollKey}
                          type="button"
                          onClick={() => handleEquipScrollAtSlot(slotPickerIndex, scrollItem)}
                          className={`rounded-2xl p-2.5 border-2 text-right flex items-center gap-3 transition-all active:scale-95 ${
                            isEquipped
                              ? 'bg-[#FFF5E0] border-[#129666]'
                              : 'bg-[#FFFDF8] border-[#D4BC9C] hover:border-[#B86B44]'
                          }`}
                        >
                          <MasterScroll
                            stage={stage}
                            title={scrollItem.titleFa}
                            family={scrollItem.family}
                            size="xs"
                            className="shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span
                                className="px-2 py-0.5 rounded-full text-[8.5px] font-black"
                                style={{ backgroundColor: theme.badgeBg, color: theme.badgeText }}
                              >
                                {theme.shortFa}
                              </span>
                              {isEquipped && (
                                <span className="text-[8.5px] font-black text-[#0A5E3C] bg-[#D9FFF0] px-2 py-0.5 rounded-full">
                                  ✓ در قفسه
                                </span>
                              )}
                            </div>
                            <div className="text-xs font-black text-[#2E1709] truncate">
                              طومار {scrollItem.titleFa}
                            </div>
                            <div className="text-[9.5px] font-bold text-[#6E4526] mt-0.5">
                              {toFa(scrollItem.totalCards)} کارت کامل · کمترین رده: {toFa(stage)}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                </div>
              )}

              {/* Locked Sets Progress Preview so the user knows which set to finish next */}
              <div className="pt-2 border-t border-[#D5BA96]">
                <div className="text-[10.5px] font-black text-[#5C3418] mb-2">
                  🔒 طومارهای در حال تکمیل (نزدیک‌ترین مجموعه‌ها به آزادسازی طومار):
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {allSetScrolls
                    .filter(
                      (s) =>
                        !s.isUnlocked &&
                        (slotPickerFilter === 'all' || s.family === slotPickerFilter),
                    )
                    .sort((a, b) => b.unlockedCards / b.totalCards - a.unlockedCards / a.totalCards)
                    .slice(0, 6)
                    .map((lockedSet) => (
                      <button
                        key={lockedSet.scrollKey}
                        type="button"
                        onClick={() => {
                          setSlotPickerIndex(null);
                          if (lockedSet.scrollKey.startsWith('scroll:legend:')) {
                            const leg = FOOTBALL_LEGENDS.find((l) => l.id === lockedSet.setId);
                            if (leg) onSelectLegend(leg);
                          } else {
                            const bk = storyBooks.find((b) => b.id === lockedSet.setId);
                            if (bk) onSelectBook(bk);
                          }
                        }}
                        className="rounded-xl p-2 bg-[#F4E6CE] border border-[#C8AF8A] flex items-center justify-between gap-2 text-right hover:brightness-95"
                      >
                        <div className="min-w-0">
                          <div className="text-[10.5px] font-black text-[#3B1E0D] truncate">
                            {lockedSet.icon} {lockedSet.titleFa}
                          </div>
                          <div className="text-[9px] font-bold text-[#6E4526]">
                            {toFa(lockedSet.unlockedCards)} از {toFa(lockedSet.totalCards)} کارت بازشده
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg text-[9px] font-black bg-[#8C6240] text-[#FFF9EE] shrink-0">
                          ورود به مجموعه ◂
                        </span>
                      </button>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL 2: MASTER SCROLL INSPECTOR (`بررسی طومار مجموعه و شرایط ارتقا`) ─── */}
      {inspectedScroll && (
        <div
          dir="rtl"
          className="fixed inset-0 z-[130] flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150"
          onClick={() => setInspectedScrollKey(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md max-h-[90dvh] overflow-y-auto scrollbar-hide rounded-[30px] border-2 border-[#B98758] p-4 sm:p-5 flex flex-col items-center gap-3 shadow-2xl relative"
            style={{
              background: 'linear-gradient(180deg, #FBF4E6 0%, #F0DFC2 100%)',
            }}
          >
            <button
              type="button"
              onClick={() => setInspectedScrollKey(null)}
              className="absolute top-3.5 left-3.5 w-8 h-8 rounded-full bg-[#E5CFB0] text-[#4E2D16] flex items-center justify-center hover:brightness-95"
            >
              <X size={16} />
            </button>

            <MasterScroll
              stage={(inspectedScroll.isUnlocked && inspectedScroll.scrollTier ? inspectedScroll.scrollTier : 0) as 0 | 1 | 2 | 3 | 4}
              title={inspectedScroll.titleFa}
              family={inspectedScroll.family}
              unlockedCardsCount={inspectedScroll.unlockedCards}
              totalCardsCount={inspectedScroll.totalCards}
              size="lg"
              isEquipped={(economy.activeDeck || []).includes(inspectedScroll.scrollKey)}
            />

            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-[#2E1709]">
                طومار مجموعهٔ «{inspectedScroll.titleFa}»
              </h3>
              <p className="text-[11px] font-bold text-[#6E4526]">
                {inspectedScroll.isUnlocked && inspectedScroll.scrollTier
                  ? SCROLL_STAGE_THEMES[inspectedScroll.scrollTier].nameFa
                  : `🔒 قفل (${toFa(inspectedScroll.unlockedCards)} از ${toFa(inspectedScroll.totalCards)} کارت بازشده)`}
              </p>
            </div>

            {/* Minimum-Tier Rule Explanation Box */}
            <div className="w-full rounded-2xl p-3 bg-[#FFF8EC] border border-[#D49B2A] text-right space-y-1.5 text-[10.5px] font-bold text-[#4E2D16]">
              <div className="font-black text-[#3B1E0D]">
                ⚖️ قانون ردهٔ طومار مجموعه:
              </div>
              {!inspectedScroll.isUnlocked ? (
                <p>
                  برای دریافت <b>طومار خشتی (رده ۱)</b> این مجموعه، باید هر{' '}
                  {toFa(inspectedScroll.totalCards)} کارت آن را باز کنید. هم‌اکنون{' '}
                  {toFa(inspectedScroll.unlockedCards)} کارت باز شده است.
                </p>
              ) : inspectedScroll.scrollTier && inspectedScroll.scrollTier < 4 ? (
                <p>
                  ردهٔ طومار همیشه برابر با <b>کمترین ردهٔ کارت‌های آن مجموعه</b> است. برای ارتقای این طومار به{' '}
                  <b>{SCROLL_STAGE_THEMES[(inspectedScroll.scrollTier + 1) as 2 | 3 | 4].nameFa}</b>، باید{' '}
                  <b className="text-[#B84A2C]">
                    {toFa(inspectedScroll.bottleneckCount)} کارتِ ردهٔ {toFa(inspectedScroll.scrollTier)}
                  </b>{' '}
                  این مجموعه را در کورهٔ سفالگری صیقل دهید تا همهٔ کارت‌های مجموعه حداقل ردهٔ{' '}
                  {toFa(inspectedScroll.scrollTier + 1)} شوند.
                </p>
              ) : (
                <p>
                  تمامی کارت‌های این مجموعه به بالاترین سطح (رده ۴ زمرد شاهانه) رسیده‌اند و این طومار در اوج قدرت خود قرار دارد!
                </p>
              )}
            </div>

            {inspectedScroll.isUnlocked && inspectedScroll.scrollTier && (
              <div className="w-full space-y-2">
                <button
                  type="button"
                  onClick={() => handleToggleScrollEquip(inspectedScroll)}
                  className="w-full py-2.5 px-4 rounded-2xl font-black text-xs text-[#FFF9F0] flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-transform"
                  style={{
                    background: (economy.activeDeck || []).includes(inspectedScroll.scrollKey)
                      ? 'linear-gradient(180deg, #6E4526 0%, #4A2C14 100%)'
                      : 'linear-gradient(180deg, #129666 0%, #07593A 100%)',
                  }}
                >
                  <ScrollText size={15} />
                  <span>
                    {(economy.activeDeck || []).includes(inspectedScroll.scrollKey)
                      ? '✓ در قفسهٔ ۱۰ طوماری قرار دارد (برداشتن)'
                      : '+ قرار دادن طومار در قفسهٔ ۱۰تایی کومبو'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const tier = inspectedScroll.scrollTier!;
                    setInspectedScrollKey(null);
                    setActiveScrollAward({
                      scrollKey: inspectedScroll.scrollKey,
                      titleFa: inspectedScroll.titleFa,
                      subtitleFa: `${toFa(inspectedScroll.totalCards)} از ${toFa(inspectedScroll.totalCards)} کارت کامل`,
                      family: inspectedScroll.family,
                      tier,
                      totalCards: inspectedScroll.totalCards,
                    });
                  }}
                  className="w-full py-2 px-4 rounded-2xl font-black text-xs text-[#3B1E0D] bg-gradient-to-b from-[#FFF5C0] to-[#E5A524] border border-[#C88822] flex items-center justify-center gap-1.5 shadow active:scale-95"
                >
                  <Sparkles size={14} />
                  <span>🎬 پخش انیمیشن باشکوه باز شدن این طومار</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── MODAL 3: INDIVIDUAL CARD INSPECTOR & POTTERY KILN POLISH (`صیقل کارت در کوره برای ارتقای طومار مجموعه`) ─── */}
      {inspectedCard && (
        <div
          dir="rtl"
          className="fixed inset-0 z-[130] flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150"
          onClick={() => setInspectedCard(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm max-h-[90dvh] overflow-y-auto scrollbar-hide rounded-[30px] border-2 border-[#B98758] p-4 sm:p-5 flex flex-col items-center gap-3 shadow-2xl relative"
            style={{
              background: 'linear-gradient(180deg, #FBF4E6 0%, #F0DFC2 100%)',
              boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.85), 0 20px 45px rgba(24,10,4,0.65)',
            }}
          >
            <button
              type="button"
              onClick={() => setInspectedCard(null)}
              className="absolute top-3.5 left-3.5 w-8 h-8 rounded-full bg-[#E5CFB0] text-[#4E2D16] flex items-center justify-center hover:brightness-95"
            >
              <X size={16} />
            </button>

            {/* Large Sasanian Homa-Wing Card */}
            <div className="w-[186px] shrink-0 mt-1">
              <LegendCard
                chapterId={inspectedCard.chapterId}
                legend={inspectedCard.legendMeta}
                title={{ fa: inspectedCard.titleFa, en: inspectedCard.titleEn }}
                year={inspectedCard.yearLabel}
                rarity={inspectedCard.owned ? inspectedCard.tier : null}
                bgImage={inspectedCard.bgImage}
                isFA={isFA}
                variant="large"
              />
            </div>

            {/* Card Title & Tier */}
            <div className="text-center space-y-1 w-full">
              <div className="flex items-center justify-center gap-1.5">
                {inspectedCard.owned ? (
                  <ClayTierBadge tier={inspectedCard.tier} isFA={isFA} size="md" />
                ) : (
                  <span className="px-3 py-0.5 rounded-full text-[10px] font-black bg-[#E5D3B8] text-[#6E4526] border border-[#C2A27A]">
                    🔒 خشت مهروموم (قفل)
                  </span>
                )}
              </div>
              <h3 className="text-sm sm:text-base font-black text-[#2E1709]">
                {inspectedCard.titleFa}
              </h3>
              <p className="text-[10.5px] font-bold text-[#6E4526]">
                بخشی از مجموعهٔ «{inspectedCard.setTitleFa}»
              </p>
            </div>

            {/* Parent Set Scroll Impact Box */}
            {(() => {
              const parentScroll = scrollStatusByKey[inspectedCard.setScrollKey];
              if (!parentScroll) return null;
              return (
                <div className="w-full rounded-2xl p-2.5 bg-[#F5E6CC] border border-[#C6A278] text-right text-[10px] font-bold text-[#4E2D16]">
                  📜 <b>تأثیر بر طومار «{parentScroll.titleFa}»:</b>{' '}
                  {!parentScroll.isUnlocked ? (
                    <span>
                      با باز کردن تمام کارت‌های این مجموعه ({toFa(parentScroll.unlockedCards)} از{' '}
                      {toFa(parentScroll.totalCards)})، طومار خشتی آن برای قفسهٔ کومبو آزاد می‌شود.
                    </span>
                  ) : parentScroll.scrollTier === inspectedCard.tier && inspectedCard.tier < 4 ? (
                    <span className="text-[#9E4922] font-black">
                      این کارت یکی از کارت‌های تعیین‌کنندهٔ حداقل ردهٔ مجموعه است! صیقل دادن آن به ارتقای طومار مجموعه به ردهٔ{' '}
                      {toFa(inspectedCard.tier + 1)} کمک می‌کند.
                    </span>
                  ) : (
                    <span>
                      این کارت بالاتر از ردهٔ فعلی طومار مجموعه (رده {toFa(parentScroll.scrollTier || 1)}) است.
                    </span>
                  )}
                </div>
              );
            })()}

            {/* Action Buttons: Kiln Polish + Play Chapter */}
            {inspectedCard.owned ? (
              <div className="w-full space-y-2">
                {/* Kiln Polish Upgrade Box (`🔥 صیقل در کوره به رده بالاتر`) */}
                {inspectedCard.tier < 4 && (
                  <div className="w-full rounded-2xl p-3 bg-[#FFF8EC] border-2 border-[#D49B2A] space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-black text-[#5C3418]">
                      <span className="flex items-center gap-1">
                        <Flame size={13} className="text-[#C86D3B]" />
                        <span>ارتقا در کورهٔ صیقل به رده {toFa(inspectedCard.tier + 1)}:</span>
                      </span>
                      <span className="text-[#9E5218]">
                        {WORLD_MAP_RARITY[(inspectedCard.tier + 1) as 2 | 3 | 4].fa}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-1.5">
                      {(economy.freePolishTokens ?? 0) > 0 && (
                        <button
                          type="button"
                          onClick={() => handlePolishInspectedCard(true)}
                          className="w-full py-2 px-3 rounded-xl font-black text-[11px] text-[#FFF9EE] bg-gradient-to-b from-[#289E92] to-[#176B62] border border-[#A7ECE4] flex items-center justify-center gap-1.5 shadow-xs active:scale-95"
                        >
                          <Sparkles size={13} />
                          <span>صیقل فوری با ۱ مُهر صیقل رایگان (موجودی: {toFa(economy.freePolishTokens ?? 0)})</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handlePolishInspectedCard(false)}
                        className="w-full py-2 px-3 rounded-xl font-black text-[11px] text-[#FFF9EE] bg-gradient-to-b from-[#D47A47] to-[#9E4922] border border-[#F5C59B] flex items-center justify-center gap-1.5 shadow-xs active:scale-95"
                      >
                        <Flame size={13} />
                        <span>
                          صیقل و ارتقا به رده {toFa(inspectedCard.tier + 1)} با{' '}
                          {toFa(KILN_POLISH_COSTS[(inspectedCard.tier + 1) as 2 | 3 | 4])} سکه
                        </span>
                      </button>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    const playFn = inspectedCard.onPlayChapter;
                    setInspectedCard(null);
                    playFn();
                  }}
                  className="w-full py-2 px-3 rounded-xl font-black text-[11px] text-[#4E2D16] bg-[#EAD6B8] border border-[#C4A176] flex items-center justify-center gap-1.5 hover:brightness-95 active:scale-95"
                >
                  <Play size={13} />
                  <span>ورود به فصل و بازی کردن این مرحله</span>
                </button>
              </div>
            ) : (
              <div className="w-full space-y-2 text-center">
                <p className="text-[11px] font-bold text-[#6E4526]">
                  برای باز کردن این کارت و نزدیک شدن به آزادسازی طومار مجموعهٔ «{inspectedCard.setTitleFa}»، این فصل را بازی کنید!
                </p>
                <button
                  type="button"
                  onClick={() => {
                    const playFn = inspectedCard.onPlayChapter;
                    setInspectedCard(null);
                    playFn();
                  }}
                  className="w-full py-2.5 px-4 rounded-2xl font-black text-xs text-[#FFF9F0] bg-gradient-to-b from-[#D47A47] to-[#9E4922] border border-[#F5C59B] flex items-center justify-center gap-1.5 shadow-md active:scale-95"
                >
                  <Play size={14} />
                  <span>رفتن به این فصل و شروع بازی</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {notice && (
        <div
          className="fixed inset-x-3 bottom-5 z-[140] mx-auto max-w-md rounded-2xl px-4 py-2.5 text-center text-[11.5px] font-black shadow-xl backdrop-blur"
          style={{
            border: '1.5px solid #269489',
            backgroundColor: '#FBF4E6',
            color: '#11544D',
          }}
        >
          {notice}
        </div>
      )}

      {/* Full-Screen Scroll Award / Upgrade Celebration Ceremony */}
      {activeScrollAward && (
        <ScrollRevealCeremony
          award={activeScrollAward}
          onEquipNow={(scrollKey) => {
            const scrollItem = scrollStatusByKey[scrollKey];
            if (scrollItem && !(economy.activeDeck || []).includes(scrollKey)) {
              handleToggleScrollEquip(scrollItem);
            }
          }}
          onClose={() => setActiveScrollAward(null)}
        />
      )}

      {/* 5-Model & 4-Tier Interactive Scroll Ceremony Lab */}
      {showScrollCeremonyLab && (
        <ScrollRevealCeremony
          isTestLab={true}
          onClose={() => setShowScrollCeremonyLab(false)}
        />
      )}
    </div>
  );
};

export default CollectionScreen;

export type { CollectionShelf };
