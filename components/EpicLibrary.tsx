import React, { useState, useEffect, useMemo } from 'react';
import { Lock, Sparkles, CheckCircle2 } from 'lucide-react';
import { StoryBook, PlayerState, StoryGenre, Language } from '../types';
import { gameServer } from '../utils/gameServer';
import { debug } from '../utils/debug';
import { EPIC_CAMPAIGNS } from '../data/campaigns';
import { FOLKTALE_BOOKS } from '../data/folktales/folktalesIndex';
import {
  getBookUnlockCost,
  FREE_BOOK_IDS,
  FREE_FOOTBALL_LEGEND_IDS,
  getLegendUnlockCost,
  IAP_PACKAGES,
} from '../utils/economy';
import { executeGatewayCheckout, getPreferredGateway, formatToman } from '../utils/paymentAdapter';
import { EconomyStateView } from '../utils/progression';
import { IranMap } from './IranMap';
import { WorldMap, FOOTBALL_LEGENDS, FootballLegend, getLegendDifficulty } from './WorldMap';
import { getLegendPortraitImage } from '../data/legendImages';
import { GameCoin } from './GameCoin';
import {
  InkBack, InkScroll, InkBooks, InkLeaf, InkGlobe, InkTome, InkFlame, InkCheck,
  Medallion,
} from './InkIcons';

export type LibraryShelf = 'history' | 'epic' | 'folklore' | 'football';

interface EpicLibraryProps {
  player: PlayerState;
  language: Language;
  shelf: LibraryShelf;
  onShelfChange: (shelf: LibraryShelf) => void;
  onSelectBook: (book: StoryBook) => void;
  onBack: () => void;
  worldMapProgress: Record<string, number>;
  onSelectLegend: (legend: any) => void;
  onCoinsChange?: (coins: number) => void;
  onOpenShop?: () => void;
  onOpenCollection?: () => void;
}

const SHELVES: {
  id: LibraryShelf;
  label: string;
  Icon: React.FC<{ size?: number }>;
}[] = [
  { id: 'history', label: 'تاریخ', Icon: InkScroll },
  { id: 'epic', label: 'حماسه', Icon: InkBooks },
  { id: 'folklore', label: 'قصه‌ها', Icon: InkLeaf },
  { id: 'football', label: 'فوتبال', Icon: InkGlobe },
];

const toFa = (n: number) => String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[+d]);

const bookLevel = (book: StoryBook, player: PlayerState) =>
  Math.min(Math.max((player.epicProgress?.[book.id] || 1) - 1, 0), book.chapters.length);

const DIFFICULTY = {
  hard: { label: 'سخت', tone: 'rose' },
  medium: { label: 'متوسط', tone: 'ochre' },
  easy: { label: 'آسان', tone: 'sage' },
} as const;

const NEW_OR_UPGRADED_BOOK_IDS = new Set([
  // 8 New History Books
  'persepolis', 'silk_road', 'dariush', 'yaqub_laith',
  'zandiyeh', 'amir_kabir', 'nadershah', 'mashruteh',
  // 6 New Folklore Books
  'sindbad', 'aladdin', 'amir_arsalan', 'shahrzad', 'samak_ayyar', 'kalila_dimna',
  // 4 Upgraded 4-Chapter Folklore Books
  'mahi', 'dokhtar', 'div', 'mosh',
]);

const DIFF_ORDER: Record<'easy' | 'medium' | 'hard', number> = {
  easy: 0,
  medium: 1,
  hard: 2,
};

const sortBooksEasyToHard = (list: StoryBook[]): StoryBook[] =>
  [...list].sort((a, b) => {
    const da = DIFF_ORDER[a.difficulty] ?? 1;
    const db = DIFF_ORDER[b.difficulty] ?? 1;
    if (da !== db) return da - db;
    return a.chapters.length - b.chapters.length;
  });

const UPGRADED_FOLKLORE_IDS = new Set(['mahi', 'dokhtar', 'div', 'mosh']);

const LegendShelfCard: React.FC<{
  legend: FootballLegend;
  level: number;
  isUnlocked: boolean;
  unlockCost: number;
  onSelect: () => void;
  delay: number;
}> = ({ legend, level, isUnlocked, unlockCost, onSelect, delay }) => {
  const total = legend.chapters.length;
  const done = Math.min(Math.max(level > 0 ? level - 1 : 0, 0), total);
  const completed = total > 0 && level > total;
  const percent = total ? Math.round((done / total) * 100) : 0;
  const next = Math.min(done + 1, total);
  const diffKey = getLegendDifficulty(legend.id);
  const diff = DIFFICULTY[diffKey] || DIFFICULTY.medium;
  const portraitUrl = getLegendPortraitImage(legend.id);

  return (
    <button
      onClick={onSelect}
      className={`shelf-book tone-${diff.tone} group`}
      style={{ animationDelay: `${delay}s` }}
      dir="rtl"
      aria-label={legend.name.fa}
    >
      <span className="shelf-book-art">
        <img src={portraitUrl} alt="" loading="eager" decoding="sync" />
        <span className={`shelf-book-diff tone-${diff.tone}`}>
          <InkFlame size={8} />
          {diff.label} · {toFa(total)} فصل
        </span>
        <span
          className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-black shadow"
          style={{
            background: 'rgba(246, 238, 224, 0.92)',
            color: '#3B1806',
            border: `1px solid ${legend.color}`,
          }}
        >
          {legend.icon} {legend.country.fa}
        </span>
        {!isUnlocked ? (
          <span
            className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-black flex items-center gap-1 shadow"
            style={{
              background: 'linear-gradient(180deg, #8C4A27 0%, #5E2C12 100%)',
              color: '#FFF5E4',
              border: '1px solid #F5E2C8',
            }}
          >
            <Lock className="w-2.5 h-2.5" />
            <span>{toFa(unlockCost)}</span>
          </span>
        ) : completed ? (
          <span className="shelf-book-done">
            <InkCheck size={9} />
          </span>
        ) : null}
      </span>

      <span className="shelf-book-name">{legend.name.fa}</span>
      <span className="shelf-book-meta">
        {!isUnlocked
          ? `قفل · ${toFa(unlockCost)} سکه`
          : completed
          ? `${toFa(total)} فصل کامل`
          : `فصل ${toFa(next)} از ${toFa(total)}`}
      </span>

      <span className="shelf-book-band" aria-hidden="true">
        <span className="shelf-bar" style={{ ['--p' as any]: `${completed ? 100 : Math.max(3, percent)}%` }} />
      </span>
    </button>
  );
};

const ShelfCard: React.FC<{
  book: StoryBook;
  player: PlayerState;
  isUnlocked: boolean;
  unlockCost: number;
  onSelect: () => void;
  delay: number;
}> = ({ book, player, isUnlocked, unlockCost, onSelect, delay }) => {
  const done = bookLevel(book, player);
  const total = book.chapters.length;
  const completed = total > 0 && done >= total;
  const percent = total ? Math.round((done / total) * 100) : 0;
  const next = Math.min(done + 1, total);
  const diff = DIFFICULTY[book.difficulty] || DIFFICULTY.medium;
  const isNewOrUpgraded = NEW_OR_UPGRADED_BOOK_IDS.has(book.id);
  const isUpgraded = UPGRADED_FOLKLORE_IDS.has(book.id);

  return (
    <button
      onClick={onSelect}
      className={`shelf-book tone-${diff.tone} group`}
      style={{ animationDelay: `${delay}s` }}
      dir="rtl"
      aria-label={book.title}
    >
      <span className="shelf-book-art">
        <img src={book.coverImage} alt="" loading="eager" decoding="sync" />
        <span className={`shelf-book-diff tone-${diff.tone}`}>
          <InkFlame size={8} />
          {diff.label} · {toFa(total)} فصل
        </span>
        {isNewOrUpgraded && (
          <span
            className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded-full text-[8.5px] font-black shadow"
            style={{
              background: 'linear-gradient(180deg, #FDE047 0%, #D97706 100%)',
              color: '#3B1806',
              border: '1px solid #FEF9C3',
            }}
          >
            {isUpgraded ? 'ارتقا به ۴ فصل ✨' : 'جدید ✨'}
          </span>
        )}
        {!isUnlocked ? (
          <span
            className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-black flex items-center gap-1 shadow"
            style={{
              background: 'linear-gradient(180deg, #8C4A27 0%, #5E2C12 100%)',
              color: '#FFF5E4',
              border: '1px solid #F5E2C8',
            }}
          >
            <Lock className="w-2.5 h-2.5" />
            <span>{toFa(unlockCost)}</span>
          </span>
        ) : completed ? (
          <span className="shelf-book-done">
            <InkCheck size={9} />
          </span>
        ) : null}
      </span>

      <span className="shelf-book-name">{book.title}</span>
      <span className="shelf-book-meta">
        {!isUnlocked
          ? `قفل · ${toFa(unlockCost)} سکه`
          : completed
          ? `${toFa(total)} فصل کامل`
          : `فصل ${toFa(next)} از ${toFa(total)}`}
      </span>

      <span className="shelf-book-band" aria-hidden="true">
        <span className="shelf-bar" style={{ ['--p' as any]: `${completed ? 100 : Math.max(3, percent)}%` }} />
      </span>
    </button>
  );
};

export const EpicLibrary: React.FC<EpicLibraryProps> = ({
  player,
  language,
  shelf,
  onShelfChange,
  onSelectBook,
  onBack,
  worldMapProgress,
  onSelectLegend,
  onCoinsChange,
  onOpenShop,
  onOpenCollection,
}) => {
  const [books, setBooks] = useState<StoryBook[]>(() => [...EPIC_CAMPAIGNS, ...FOLKTALE_BOOKS]);
  const [loading, setLoading] = useState(false);
  const [cols, setCols] = useState(2);
  const [economy, setEconomy] = useState<EconomyStateView>(() => gameServer.getLocalEconomyState());
  const [lockedBookPrompt, setLockedBookPrompt] = useState<StoryBook | null>(null);
  const [lockedLegendPrompt, setLockedLegendPrompt] = useState<FootballLegend | null>(null);
  const [busyUnlock, setBusyUnlock] = useState(false);
  const [displayMode, setDisplayMode] = useState<'map' | 'shelf'>('map');
  const [diffFilter, setDiffFilter] = useState<'all' | 'new' | 'easy' | 'medium' | 'hard'>('all');

  useEffect(() => {
    let alive = true;
    const loadBooks = async () => {
      const [dbBooks, snap] = await Promise.all([
        gameServer.fetchStoryLibrary().catch(() => [] as StoryBook[]),
        gameServer.getProgress().catch(() => null),
      ]);
      if (!alive) return;
      if (snap?.economy) setEconomy(snap.economy);
      if (dbBooks.length > 0) {
        debug.log('[TREASURE] server books:', dbBooks.length);
        setBooks(dbBooks);
      }
      setLoading(false);
    };
    loadBooks();
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 640px)');
    const sync = () => setCols(mq.matches ? 3 : 2);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const isBookUnlocked = (book: StoryBook): boolean => {
    if (economy.hasEpicPatronPass) return true;
    if (FREE_BOOK_IDS.includes(book.id)) return true;
    if (economy.unlockedBooks?.includes(book.id)) return true;
    if ((player.epicProgress?.[book.id] || 1) > 1) return true;
    return false;
  };

  const handleBookClick = (book: StoryBook) => {
    if (isBookUnlocked(book)) {
      onSelectBook(book);
    } else {
      setLockedBookPrompt(book);
    }
  };

  const handleUnlockBookWithCoins = async () => {
    if (!lockedBookPrompt || busyUnlock) return;
    const cost = getBookUnlockCost(lockedBookPrompt.id, lockedBookPrompt.difficulty);
    if (player.coins < cost) {
      setLockedBookPrompt(null);
      onOpenShop?.();
      return;
    }
    setBusyUnlock(true);
    try {
      const res = await gameServer.unlockContent(
        player,
        'book',
        lockedBookPrompt.id,
        lockedBookPrompt.difficulty
      );
      if (!res.ok) return;
      if (res.economy) setEconomy(res.economy);
      if (typeof res.coins === 'number') onCoinsChange?.(res.coins);
      const targetBook = lockedBookPrompt;
      setLockedBookPrompt(null);
      onSelectBook(targetBook);
    } catch {
      // Fallback
    } finally {
      setBusyUnlock(false);
    }
  };

  const handleBuyEpicPatronPass = async () => {
    if (busyUnlock) return;
    const pkg = IAP_PACKAGES.find((p) => p.id === 'epic_patron_pass');
    if (!pkg) return;
    setBusyUnlock(true);
    try {
      const gw = getPreferredGateway();
      const receipt = await executeGatewayCheckout(pkg, gw);
      const res = await gameServer.purchaseIapPackage(player, pkg.id, gw, receipt.receiptId);
      if (!res.ok) return;
      if (res.economy) setEconomy(res.economy);
      if (typeof res.coins === 'number') onCoinsChange?.(res.coins);
      const targetBook = lockedBookPrompt;
      setLockedBookPrompt(null);
      if (targetBook) onSelectBook(targetBook);
    } catch {
      // ignore
    } finally {
      setBusyUnlock(false);
    }
  };

  const isLegendUnlocked = (legendId: string): boolean => {
    if (economy.hasEpicPatronPass) return true;
    if (FREE_FOOTBALL_LEGEND_IDS.includes(legendId)) return true;
    if (economy.unlockedLegends?.includes(legendId)) return true;
    if ((worldMapProgress?.[legendId] || 0) > 1) return true;
    return false;
  };

  const handleLegendShelfClick = (legend: FootballLegend) => {
    if (isLegendUnlocked(legend.id)) {
      onSelectLegend(legend);
    } else {
      setLockedLegendPrompt(legend);
    }
  };

  const handleUnlockLegendWithCoins = async () => {
    if (!lockedLegendPrompt || busyUnlock) return;
    const cost = getLegendUnlockCost(lockedLegendPrompt.id);
    if (player.coins < cost) {
      setLockedLegendPrompt(null);
      onOpenShop?.();
      return;
    }
    setBusyUnlock(true);
    try {
      const res = await gameServer.unlockContent(player, 'legend', lockedLegendPrompt.id);
      if (!res.ok) return;
      if (res.economy) setEconomy(res.economy);
      if (typeof res.coins === 'number') onCoinsChange?.(res.coins);
      const targetLegend = lockedLegendPrompt;
      setLockedLegendPrompt(null);
      onSelectLegend(targetLegend);
    } catch {
      // Fallback
    } finally {
      setBusyUnlock(false);
    }
  };

  const storyBooks = books.filter(b => b.genre !== 'education');
  const byGenre = (genre: StoryGenre) => storyBooks.filter(b => b.genre === genre);

  // All 4 shelves sorted from Easy (🟢 آسان) → Medium (🟡 متوسط) → Hard (🔴 سخت)
  const historyBooks = useMemo(() => sortBooksEasyToHard(byGenre('history')), [storyBooks]);
  const epicBooks = useMemo(() => sortBooksEasyToHard(byGenre('epic')), [storyBooks]);
  const folkloreBooks = useMemo(() => sortBooksEasyToHard(byGenre('folklore')), [storyBooks]);
  const sortedFootballLegends = useMemo(
    () =>
      [...FOOTBALL_LEGENDS].sort((a, b) => {
        const da = DIFF_ORDER[getLegendDifficulty(a.id)] ?? 1;
        const db = DIFF_ORDER[getLegendDifficulty(b.id)] ?? 1;
        return da - db;
      }),
    []
  );

  const startedCount = (list: StoryBook[]) =>
    list.reduce((n, b) => n + ((player.epicProgress?.[b.id] || 1) > 1 ? 1 : 0), 0);
  const chapterStats = (list: StoryBook[]) => {
    const total = list.reduce((n, b) => n + b.chapters.length, 0);
    const done = list.reduce((n, b) => n + bookLevel(b, player), 0);
    return { total, done };
  };

  const shelfStats = (id: LibraryShelf) => {
    if (id === 'football') {
      const totalChapters = FOOTBALL_LEGENDS.reduce((n, l) => n + l.chapters.length, 0);
      const started = Object.values(worldMapProgress || {}).filter(v => v > 0).length;
      return {
        shortLine: `${toFa(FOOTBALL_LEGENDS.length)} اسطوره`,
        line: `${toFa(FOOTBALL_LEGENDS.length)} اسطوره · ${toFa(totalChapters)} فصل`,
        sub: `${toFa(started)} شروع‌شده`,
      };
    }
    const list = id === 'history' ? historyBooks : id === 'epic' ? epicBooks : folkloreBooks;
    const { total, done } = chapterStats(list);
    return {
      shortLine: `${toFa(list.length)} کتاب`,
      line: `${toFa(list.length)} کتاب · ${toFa(total)} فصل`,
      sub: `${toFa(done)} خوانده · ${toFa(startedCount(list))} شروع‌شده`,
    };
  };

  const activeShelfSourceBooks =
    shelf === 'history' ? historyBooks : shelf === 'epic' ? epicBooks : folkloreBooks;

  const guidedStep = useMemo(() => {
    const totalDoneChapters = storyBooks.reduce((sum, b) => sum + bookLevel(b, player), 0);
    const completedBooks = storyBooks.filter(
      (b) => b.chapters.length > 0 && bookLevel(b, player) >= b.chapters.length
    );
    const equippedDeckCount = (economy.activeDeck || []).filter(Boolean).length;

    if (totalDoneChapters === 0) {
      const starter =
        activeShelfSourceBooks.find((b) => b.difficulty === 'easy' && isBookUnlocked(b)) ||
        storyBooks.find((b) => b.difficulty === 'easy' && isBookUnlocked(b)) ||
        activeShelfSourceBooks[0];
      return {
        step: 1,
        totalSteps: 5,
        badge: 'گام ۱ از ۵ · آغاز مسیر',
        title: `داستان مقدماتی و رایگان «${starter?.title || 'تخت جمشید'}» (🟢 آسان) را آغاز کن`,
        sub: 'با کلمات ساده راه بیفت و اولین کارت تذهیب‌شده‌ات را دریافت کن',
        actionLabel: 'شروع گام اول',
        targetBook: starter,
      };
    }

    if (completedBooks.length === 0) {
      const inProgress =
        storyBooks.find((b) => {
          const done = bookLevel(b, player);
          return done > 0 && done < b.chapters.length;
        }) ||
        activeShelfSourceBooks.find((b) => b.difficulty === 'easy') ||
        storyBooks[0];
      const doneInBook = inProgress ? bookLevel(inProgress, player) : 0;
      const totalInBook = inProgress ? inProgress.chapters.length : 3;
      return {
        step: 2,
        totalSteps: 5,
        badge: 'گام ۲ از ۵ · تکمیل طومار اول',
        title: `فصل‌های باقی‌ماندهٔ «${inProgress?.title || 'داستان اول'}» را تمام کن (${toFa(doneInBook)}/${toFa(totalInBook)})`,
        sub: 'با پایان همهٔ کارت‌های یک کتاب، «طومار مجموعه» و جایزهٔ سکه آزاد می‌شود',
        actionLabel: 'ادامهٔ داستان',
        targetBook: inProgress,
      };
    }

    if (equippedDeckCount === 0 && onOpenCollection) {
      return {
        step: 3,
        totalSteps: 5,
        badge: 'گام ۳ از ۵ · چیدن طومار در قفسه',
        title: 'اولین طومار مجموعه‌ات آزاد شد! آن را در قفسهٔ کومبو قرار بده',
        sub: 'در تالار کلکسیون، طومارت را تجهیز کن تا در هر نبرد پاداش هم‌افزایی بگیری',
        actionLabel: 'ورود به کلکسیون',
        openCollection: true,
      };
    }

    const completedMediumOrHard = completedBooks.some(
      (b) => b.difficulty === 'medium' || b.difficulty === 'hard'
    );
    if (!completedMediumOrHard) {
      const nextMed =
        activeShelfSourceBooks.find(
          (b) => b.difficulty === 'medium' && bookLevel(b, player) < b.chapters.length
        ) || storyBooks.find((b) => b.difficulty === 'medium');
      return {
        step: 4,
        totalSteps: 5,
        badge: 'گام ۴ از ۵ · ارتقا به درجه ۲ (متوسط)',
        title: `یک داستان 🟡 متوسط مثل «${nextMed?.title || 'کورش بزرگ'}» را فتح کن`,
        sub: 'داستان‌های متوسط طومار درجه ۲ (+۱۵٪ شکوه حماسی + مهر صیقل) و سقف زمردی شاهانه دارند!',
        actionLabel: 'مشاهدهٔ داستان متوسط',
        targetBook: nextMed,
      };
    }

    const nextHard =
      activeShelfSourceBooks.find(
        (b) => b.difficulty === 'hard' && bookLevel(b, player) < b.chapters.length
      ) || storyBooks.find((b) => b.difficulty === 'hard');
    return {
      step: 5,
      totalSteps: 5,
      badge: 'گام ۵ از ۵ · شاهکارهای درجه ۳ (سخت)',
      title: `نبرد با شاهکارهای 🔴 سخت مثل «${nextHard?.title || 'هفت‌خان رستم'}»`,
      sub: 'طومار درجه ۳ (+۳۵٪ شکوه شاهکار + ۱۵۰ سکه + ۲ مهر صیقل) با قانون ۴ کارت محوری!',
      actionLabel: 'مشاهدهٔ شاهکار',
      targetBook: nextHard,
    };
  }, [storyBooks, player, economy, activeShelfSourceBooks, onOpenCollection]);

  const filteredShelfBooks = activeShelfSourceBooks.filter((b) => {
    if (diffFilter === 'all') return true;
    if (diffFilter === 'new') return NEW_OR_UPGRADED_BOOK_IDS.has(b.id);
    return b.difficulty === diffFilter;
  });

  const shelfRows: StoryBook[][] = [];
  for (let i = 0; i < filteredShelfBooks.length; i += cols) {
    shelfRows.push(filteredShelfBooks.slice(i, i + cols));
  }

  const filteredFootballLegends = sortedFootballLegends.filter((l) => {
    if (diffFilter === 'all' || diffFilter === 'new') return true;
    return getLegendDifficulty(l.id) === diffFilter;
  });

  const footballShelfRows: FootballLegend[][] = [];
  for (let i = 0; i < filteredFootballLegends.length; i += cols) {
    footballShelfRows.push(filteredFootballLegends.slice(i, i + cols));
  }

  // Counts for the Unified Difficulty Filter Bar across all 4 tabs
  const filterCounts = useMemo(() => {
    if (shelf === 'football') {
      return {
        total: sortedFootballLegends.length,
        newCount: 0,
        easy: sortedFootballLegends.filter((l) => getLegendDifficulty(l.id) === 'easy').length,
        medium: sortedFootballLegends.filter((l) => getLegendDifficulty(l.id) === 'medium').length,
        hard: sortedFootballLegends.filter((l) => getLegendDifficulty(l.id) === 'hard').length,
      };
    }
    return {
      total: activeShelfSourceBooks.length,
      newCount: activeShelfSourceBooks.filter((b) => NEW_OR_UPGRADED_BOOK_IDS.has(b.id)).length,
      easy: activeShelfSourceBooks.filter((b) => b.difficulty === 'easy').length,
      medium: activeShelfSourceBooks.filter((b) => b.difficulty === 'medium').length,
      hard: activeShelfSourceBooks.filter((b) => b.difficulty === 'hard').length,
    };
  }, [shelf, sortedFootballLegends, activeShelfSourceBooks]);

  const renderBookShelfView = (title: string, note: string) => {
    return (
      <div className="flex-1 overflow-y-auto px-3 sm:px-6 pb-24 relative z-10 scrollbar-hide">
        <div className="max-w-3xl mx-auto">
          <ShelfHeader
            title={title}
            note={note}
            stats={shelfStats(shelf)}
          />

          <div className="shelf-stack">
            {shelfRows.map((row, ri) => (
              <div className="shelf-line" key={ri}>
                <div className="shelf-line-books" style={{ ['--cols' as any]: row.length }}>
                  {row.map((book, bi) => {
                    const unlocked = isBookUnlocked(book);
                    const cost = getBookUnlockCost(book.id, book.difficulty);
                    return (
                      <ShelfCard
                        key={book.id}
                        book={book}
                        player={player}
                        isUnlocked={unlocked}
                        unlockCost={cost}
                        onSelect={() => handleBookClick(book)}
                        delay={0.05 + (ri * cols + bi) * 0.03}
                      />
                    );
                  })}
                </div>
                <div className="shelf-board" aria-hidden="true" />
              </div>
            ))}
          </div>

          {filteredShelfBooks.length === 0 && (
            <div className="on-clay-2 text-center py-16">
              <Medallion tone="cream" size={44}>
                <InkTome size={20} />
              </Medallion>
              <p className="text-sm font-bold mt-2">کتابی در این رده یافت نشد.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderFootballShelfView = () => {
    return (
      <div className="flex-1 overflow-y-auto px-3 sm:px-6 pb-24 relative z-10 scrollbar-hide">
        <div className="max-w-3xl mx-auto">
          <ShelfHeader
            title="قفسهٔ اسطوره‌های فوتبال جهان"
            note="۲۵ اسطوره به ترتیب از آسان به سخت: ۷ اسطورهٔ آسان · ۱۰ اسطورهٔ متوسط · ۸ اسطورهٔ سخت"
            stats={shelfStats('football')}
          />

          <div className="shelf-stack">
            {footballShelfRows.map((row, ri) => (
              <div className="shelf-line" key={ri}>
                <div className="shelf-line-books" style={{ ['--cols' as any]: row.length }}>
                  {row.map((legend, bi) => {
                    const unlocked = isLegendUnlocked(legend.id);
                    const cost = getLegendUnlockCost(legend.id);
                    const level = worldMapProgress?.[legend.id] || 1;
                    return (
                      <LegendShelfCard
                        key={legend.id}
                        legend={legend}
                        level={level}
                        isUnlocked={unlocked}
                        unlockCost={cost}
                        onSelect={() => handleLegendShelfClick(legend)}
                        delay={0.05 + (ri * cols + bi) * 0.03}
                      />
                    );
                  })}
                </div>
                <div className="shelf-board" aria-hidden="true" />
              </div>
            ))}
          </div>

          {filteredFootballLegends.length === 0 && (
            <div className="on-clay-2 text-center py-16">
              <Medallion tone="cream" size={44}>
                <InkGlobe size={20} />
              </Medallion>
              <p className="text-sm font-bold mt-2">اسطوره‌ای در این رده یافت نشد.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      dir={language === 'fa' ? 'rtl' : 'ltr'}
      className="clay-wall w-full h-full flex flex-col animate-in fade-in duration-500 overflow-hidden relative"
    >

      <header
        dir={language === 'fa' ? 'rtl' : 'ltr'}
        className="px-2.5 sm:px-6 pt-1.5 sm:pt-2.5 pb-1.5 shrink-0 relative z-10"
      >
        <div className="flex justify-between items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
          {/* Start (Right in RTL): Compact Back button + Title */}
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <button
              onClick={onBack}
              className="cg-chip !rounded-full !p-1.5 sm:!p-2 transition-all hover:brightness-105 shrink-0"
              aria-label="بازگشت"
            >
              <span className="ink-back-flip"><InkBack size={15} /></span>
            </button>
            <div className="hidden sm:flex shrink-0">
              <Medallion tone="ochre" size={28}>
                <InkTome size={15} />
              </Medallion>
            </div>
            <div className="min-w-0 text-start">
              <div className="flex items-center gap-1.5">
                <h1 className="on-clay text-sm sm:text-xl font-black leading-tight truncate">
                  گنجینه
                </h1>
                <span className="text-[10px] sm:text-xs font-extrabold on-clay-2 truncate">
                  {shelf === 'history'
                    ? `· ${toFa(historyBooks.length)} کتاب تاریخ ایران`
                    : shelf === 'epic'
                    ? `· ${toFa(epicBooks.length)} کتاب شاهنامه`
                    : shelf === 'folklore'
                    ? `· ${toFa(folkloreBooks.length)} قصه کهن`
                    : `· ${toFa(FOOTBALL_LEGENDS.length)} اسطوره فوتبال`}
                </span>
                {economy.hasEpicPatronPass && (
                  <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full bg-[#fef3c7] border border-[#f59e0b] text-[#92400e] text-[9px] font-black items-center gap-1 whitespace-nowrap">
                    <CheckCircle2 className="w-3 h-3 text-[#d97706]" />
                    <span>حامی طومار زرین</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* End (Left in RTL): Map/Shelf Switcher (for History, Epic & Football) + Compact Scrolls button */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {(shelf === 'history' || shelf === 'epic' || shelf === 'football') && (
              <div className="inline-flex rounded-full p-0.5 bg-[#4E2A17]/35 border border-[#8E4E37]/55">
                <button
                  type="button"
                  onClick={() => setDisplayMode('map')}
                  className="px-2 sm:px-2.5 py-1 rounded-full text-[9.5px] sm:text-[10px] font-black transition-all whitespace-nowrap"
                  style={{
                    background: displayMode === 'map' ? '#F6EEE0' : 'transparent',
                    color: displayMode === 'map' ? '#3B1806' : '#F6EEE0',
                  }}
                >
                  🗺️ نقشه
                </button>
                <button
                  type="button"
                  onClick={() => setDisplayMode('shelf')}
                  className="px-2 sm:px-2.5 py-1 rounded-full text-[9.5px] sm:text-[10px] font-black transition-all whitespace-nowrap"
                  style={{
                    background: displayMode === 'shelf' ? '#F6EEE0' : 'transparent',
                    color: displayMode === 'shelf' ? '#3B1806' : '#F6EEE0',
                  }}
                >
                  📚 قفسه
                </button>
              </div>
            )}

            {onOpenCollection && (
              <button
                type="button"
                onClick={onOpenCollection}
                className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[9.5px] sm:text-[10.5px] font-black text-[#FFF9EE] flex items-center gap-1 shadow-sm active:scale-95 transition-transform whitespace-nowrap"
                style={{
                  background: 'linear-gradient(180deg, #289E92 0%, #176B62 100%)',
                  border: '1px solid #A7ECE4',
                  boxShadow: '0 2px 0 #0E453F',
                }}
              >
                <span>📜</span>
                <span className="sm:hidden">طومارها</span>
                <span className="hidden sm:inline">کالکشن و ۱۰ طومار کومبو</span>
              </button>
            )}
          </div>
        </div>

        <div className="treasure-tray" dir="rtl">
          {SHELVES.map((tab, ti) => {
            const active = shelf === tab.id;
            const stats = shelfStats(tab.id);
            return (
              <button
                key={tab.id}
                onClick={() => {
                  onShelfChange(tab.id);
                  setDiffFilter('all');
                }}
                className={`treasure-tab ${active ? 'on' : ''}`}
                style={{ animationDelay: `${0.06 + ti * 0.06}s` }}
                aria-pressed={active}
              >
                <span className="treasure-tab-head">
                  <tab.Icon size={13} />
                  <span className="treasure-tab-label text-[10.5px] sm:text-xs">{tab.label}</span>
                </span>
                <span className="treasure-tab-line whitespace-nowrap">
                  <span className="sm:hidden">{stats.shortLine}</span>
                  <span className="hidden sm:inline">{stats.line}</span>
                </span>
              </button>
            );
          })}
        </div>

        {/* 5-Step Guided Progression Path (مسیر گام‌به‌گام پهلوان) */}
        {!loading && guidedStep && (
          <div
            dir="rtl"
            className="mt-1.5 rounded-xl px-2.5 py-1.5 flex items-center justify-between gap-2 transition-all"
            style={{
              background: 'linear-gradient(90deg, rgba(15,61,62,0.92), rgba(26,37,48,0.92))',
              border: '1px solid rgba(212,168,67,0.42)',
              boxShadow: '0 4px 12px rgba(15,23,42,0.12)',
            }}
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex flex-col items-center justify-center shrink-0 px-2 py-0.5 rounded-lg bg-amber-400/20 border border-amber-300/40 text-amber-200">
                <span className="text-[9px] font-black whitespace-nowrap">{guidedStep.badge}</span>
                <div className="flex items-center gap-0.5 mt-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span
                      key={s}
                      className={`h-1 rounded-full transition-all ${
                        s <= guidedStep.step ? 'w-2.5 bg-amber-400' : 'w-1.5 bg-white/20'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="min-w-0">
                <div className="text-[10.5px] sm:text-xs font-black text-amber-50 truncate">
                  {guidedStep.title}
                </div>
                <div className="text-[9px] sm:text-[10px] font-semibold text-amber-200/80 truncate hidden sm:block">
                  {guidedStep.sub}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (guidedStep.openCollection && onOpenCollection) {
                  onOpenCollection();
                } else if (guidedStep.targetBook) {
                  handleBookClick(guidedStep.targetBook);
                }
              }}
              className="shrink-0 px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-black text-amber-950 bg-gradient-to-b from-amber-300 to-amber-500 hover:brightness-105 active:scale-95 transition-all shadow-sm whitespace-nowrap"
            >
              {guidedStep.actionLabel} ←
            </button>
          </div>
        )}

        {/* Unified Difficulty & New Books Filter Pills across History, Epic, Folklore, and Football (Map & Shelf) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1.5 pb-0.5 scrollbar-hide" dir="rtl">
          {[
            { id: 'all' as const, label: `همه (${toFa(filterCounts.total)})`, dot: null },
            ...(filterCounts.newCount > 0
              ? [{ id: 'new' as const, label: `جدید و ارتقایافته ✨ (${toFa(filterCounts.newCount)})`, dot: null }]
              : []),
            { id: 'easy' as const, label: `آسان (${toFa(filterCounts.easy)})`, dot: '#16A34A' },
            { id: 'medium' as const, label: `متوسط (${toFa(filterCounts.medium)})`, dot: '#D97706' },
            { id: 'hard' as const, label: `سخت (${toFa(filterCounts.hard)})`, dot: '#DC2626' },
          ].map((pill) => {
            const active = diffFilter === pill.id;
            return (
              <button
                key={pill.id}
                type="button"
                onClick={() => setDiffFilter(pill.id)}
                className="px-2.5 py-1 rounded-full text-[10px] font-black whitespace-nowrap transition-all shrink-0 flex items-center gap-1"
                style={{
                  background: active
                    ? 'linear-gradient(180deg, #C86C44 0%, #9E4A28 100%)'
                    : 'rgba(246, 238, 224, 0.88)',
                  color: active ? '#FFF9EE' : '#4E2A17',
                  border: active ? '1px solid #F7D9C4' : '1px solid rgba(142, 78, 55, 0.35)',
                }}
              >
                {pill.dot && (
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{
                      background: active ? '#FFF9EE' : pill.dot,
                      boxShadow: '0 0 0 1px rgba(0,0,0,0.18)',
                    }}
                  />
                )}
                <span>{pill.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 opacity-70">
          <Medallion tone="cream" size={46}>
            <InkTome size={22} />
          </Medallion>
          <span className="text-xs font-bold">در حال باز کردن گنجینه...</span>
        </div>
      ) : shelf === 'history' || shelf === 'epic' ? (
        <div className="flex-1 min-h-0 flex flex-col">
          {displayMode === 'map' ? (
            <div className="flex-1 min-h-0 px-2 sm:px-4 pb-2">
              <div
                className="h-full relative"
                style={{
                  borderRadius: 18,
                  padding: 6,
                  background: 'var(--clay-shell)',
                  border: '1px solid #8E4E37',
                  boxShadow: '0 1px 0 rgba(255,226,204,.45) inset, 0 -2px 0 rgba(58,30,18,.3) inset, 0 18px 34px -22px rgba(70,40,25,.85)',
                }}
              >
                <div className="h-full relative overflow-hidden" style={{ borderRadius: 13, boxShadow: 'inset 0 0 0 1px rgba(36,26,20,.35)' }}>
                  <IranMap
                    books={shelf === 'epic' ? epicBooks : historyBooks}
                    activeGenre={shelf}
                    onSelectBook={handleBookClick}
                    player={player}
                    difficultyFilter={diffFilter === 'new' ? 'all' : diffFilter}
                  />
                </div>
              </div>
            </div>
          ) : (
            renderBookShelfView(
              shelf === 'history' ? 'قفسهٔ تاریخ ایران' : 'قفسهٔ حماسه‌های ایران',
              shelf === 'history'
                ? 'به ترتیب از آسان به سخت: از مادها و تخت جمشید تا نادرشاه، امیرکبیر و مشروطه'
                : 'به ترتیب از آسان به سخت: از هوشنگ و جمشید تا هفت‌خان رستم و سیاوشان'
            )
          )}
        </div>
      ) : shelf === 'football' ? (
        <div className="flex-1 min-h-0 flex flex-col">
          {displayMode === 'map' ? (
            <div className="flex-1 min-h-0 px-2 sm:px-4 pb-2">
              <div
                className="h-full relative overflow-hidden"
                style={{
                  borderRadius: 18,
                  padding: 6,
                  background: 'var(--clay-shell)',
                  border: '1px solid #8E4E37',
                  boxShadow: '0 1px 0 rgba(255,226,204,.45) inset, 0 -2px 0 rgba(58,30,18,.3) inset, 0 18px 34px -22px rgba(70,40,25,.85)',
                }}
              >
                <div className="h-full relative overflow-hidden" style={{ borderRadius: 13, boxShadow: 'inset 0 0 0 1px rgba(36,26,20,.35)' }}>
                  <div className="map-hint flex items-center gap-1.5" dir="rtl">
                    <Medallion tone="cream" size={16}>
                      <InkGlobe size={9} />
                    </Medallion>
                    <span className="tabular-nums">{toFa(FOOTBALL_LEGENDS.length)} اسطوره · {toFa(FOOTBALL_LEGENDS.reduce((n, l) => n + l.chapters.length, 0))} فصل</span>
                  </div>
                  <WorldMap
                    language={language}
                    unlockedChapters={worldMapProgress}
                    player={player}
                    onCoinsChange={onCoinsChange}
                    onOpenShop={onOpenShop}
                    onSelectLegend={onSelectLegend}
                    difficultyFilter={diffFilter === 'new' ? 'all' : diffFilter}
                  />
                </div>
              </div>
            </div>
          ) : (
            renderFootballShelfView()
          )}
        </div>
      ) : (
        renderBookShelfView(
          'قصه‌ها و افسانه‌های کهن',
          'به ترتیب از آسان به سخت: ۱۱ متل آسان · ۷ افسانهٔ متوسط ۴ فصلی · ۴ حماسهٔ عامیانهٔ سخت'
        )
      )}

      {/* Book Unlock Modal */}
      {lockedBookPrompt && (
        <div
          dir="rtl"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-150"
          onClick={() => !busyUnlock && setLockedBookPrompt(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl p-5 bg-[#f4e8d1] border-4 border-[#92400e] shadow-2xl space-y-4 text-center"
          >
            <div className="w-16 h-16 mx-auto rounded-2xl overflow-hidden border-2 border-[#92400e] shadow-md">
              <img src={lockedBookPrompt.coverImage} alt="" className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#451a03]">
                بازگشایی کتاب «{lockedBookPrompt.title}»
              </h3>
              <p className="text-xs font-bold text-[#61442b] mt-1">
                این کتاب شامل {toFa(lockedBookPrompt.chapters.length)} فصل داستانی است. می‌توانید آن را با سکه باز کنید یا با «طومار زرین شاهنامه» تمام ۵۸ کتاب گنجینه را یک‌جا برای همیشه باز کنید!
              </p>
            </div>

            <div className="space-y-2">
              {(() => {
                const cost = getBookUnlockCost(lockedBookPrompt.id, lockedBookPrompt.difficulty);
                const canAfford = player.coins >= cost;
                return (
                  <button
                    type="button"
                    disabled={busyUnlock}
                    onClick={handleUnlockBookWithCoins}
                    className="w-full py-3 rounded-2xl font-black text-xs text-white flex items-center justify-center gap-2 shadow-md active:scale-95 transition"
                    style={{
                      background: canAfford
                        ? 'linear-gradient(180deg, #C86C44 0%, #9E4A28 100%)'
                        : 'linear-gradient(180deg, #78350F 0%, #451A03 100%)',
                    }}
                  >
                    <GameCoin size={16} />
                    <span>
                      {canAfford
                        ? `بازگشایی دائمی این کتاب با ${toFa(cost)} سکه`
                        : `سکه کافی نیست (${toFa(cost)} سکه) — ورود به خزانه`}
                    </span>
                  </button>
                );
              })()}

              <button
                type="button"
                disabled={busyUnlock}
                onClick={handleBuyEpicPatronPass}
                className="w-full py-3 px-3 rounded-2xl bg-gradient-to-b from-[#fde047] to-[#eab308] text-[#451a03] border-b-4 border-[#a16207] font-black text-xs flex flex-col items-center gap-0.5 shadow active:scale-95 transition"
              >
                <span className="flex items-center gap-1">
                  <Sparkles className="w-4 h-4 text-[#92400e]" />
                  <span>طومار زرین شاهنامه ({formatToman(129000)})</span>
                </span>
                <span className="text-[10px] font-bold text-[#78350f]">
                  بازگشایی دائمی تمام کتاب‌ها و اسطوره‌ها + ۱,۲۰۰ سکه + لقب شاهنامه‌خوان
                </span>
              </button>

              <button
                type="button"
                disabled={busyUnlock}
                onClick={() => setLockedBookPrompt(null)}
                className="w-full py-2 text-xs font-black text-[#78350f]"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Football Legend Unlock Modal (from Shelf view) */}
      {lockedLegendPrompt && (
        <div
          dir="rtl"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-150"
          onClick={() => !busyUnlock && setLockedLegendPrompt(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl p-5 bg-[#f4e8d1] border-4 border-[#92400e] shadow-2xl space-y-4 text-center"
          >
            <div className="w-16 h-16 mx-auto rounded-2xl overflow-hidden border-2 border-[#92400e] shadow-md">
              <img src={getLegendPortraitImage(lockedLegendPrompt.id)} alt="" className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#451a03]">
                بازگشایی اسطوره «{lockedLegendPrompt.name.fa}»
              </h3>
              <p className="text-xs font-bold text-[#61442b] mt-1">
                این مجموعه شامل {toFa(lockedLegendPrompt.chapters.length)} فصل فوتبالی است. می‌توانید آن را با سکه باز کنید یا با «طومار زرین شاهنامه» تمام مجموعه‌ها را یک‌جا باز کنید!
              </p>
            </div>

            <div className="space-y-2">
              {(() => {
                const cost = getLegendUnlockCost(lockedLegendPrompt.id);
                const canAfford = player.coins >= cost;
                return (
                  <button
                    type="button"
                    disabled={busyUnlock}
                    onClick={handleUnlockLegendWithCoins}
                    className="w-full py-3 rounded-2xl font-black text-xs text-white flex items-center justify-center gap-2 shadow-md active:scale-95 transition"
                    style={{
                      background: canAfford
                        ? 'linear-gradient(180deg, #C86C44 0%, #9E4A28 100%)'
                        : 'linear-gradient(180deg, #78350F 0%, #451A03 100%)',
                    }}
                  >
                    <GameCoin size={16} />
                    <span>
                      {canAfford
                        ? `بازگشایی دائمی این اسطوره با ${toFa(cost)} سکه`
                        : `سکه کافی نیست (${toFa(cost)} سکه) — ورود به خزانه`}
                    </span>
                  </button>
                );
              })()}

              <button
                type="button"
                disabled={busyUnlock}
                onClick={handleBuyEpicPatronPass}
                className="w-full py-3 px-3 rounded-2xl bg-gradient-to-b from-[#fde047] to-[#eab308] text-[#451a03] border-b-4 border-[#a16207] font-black text-xs flex flex-col items-center gap-0.5 shadow active:scale-95 transition"
              >
                <span className="flex items-center gap-1">
                  <Sparkles className="w-4 h-4 text-[#92400e]" />
                  <span>طومار زرین شاهنامه ({formatToman(129000)})</span>
                </span>
                <span className="text-[10px] font-bold text-[#78350f]">
                  بازگشایی دائمی تمام کتاب‌ها و اسطوره‌ها + ۱,۲۰۰ سکه + لقب شاهنامه‌خوان
                </span>
              </button>

              <button
                type="button"
                disabled={busyUnlock}
                onClick={() => setLockedLegendPrompt(null)}
                className="w-full py-2 text-xs font-black text-[#78350f]"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ShelfHeader: React.FC<{
  title: string;
  note: string;
  stats: { line: string; sub: string };
}> = ({ title, note, stats }) => (
  <div className="flex items-center justify-between gap-3 pt-1 pb-2.5" dir="rtl">
    <div className="flex items-center gap-2 min-w-0">
      <Medallion tone="sage" size={28}>
        <InkLeaf size={14} />
      </Medallion>
      <div className="min-w-0">
        <h2 className="on-clay text-xs sm:text-sm font-black truncate">{title}</h2>
        <p className="on-clay-2 text-[9px] font-bold truncate">{note}</p>
      </div>
    </div>
    <div className="text-left shrink-0">
      <p className="on-clay-2 text-[9.5px] font-black">{stats.line}</p>
      <p className="on-clay-2 text-[8.5px] font-bold">{stats.sub}</p>
    </div>
  </div>
);
