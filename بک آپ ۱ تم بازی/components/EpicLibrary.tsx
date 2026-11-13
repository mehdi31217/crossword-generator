import React, { useState, useEffect } from 'react';
import { Lock, Sparkles, CheckCircle2 } from 'lucide-react';
import { StoryBook, PlayerState, StoryGenre, Language } from '../types';
import { gameServer } from '../utils/gameServer';
import { debug } from '../utils/debug';
import { EPIC_CAMPAIGNS } from '../data/campaigns';
import { FOLKTALE_BOOKS } from '../data/folktales/folktalesIndex';
import { getBookUnlockCost, FREE_BOOK_IDS, IAP_PACKAGES } from '../utils/economy';
import { executeGatewayCheckout, getPreferredGateway, formatToman } from '../utils/paymentAdapter';
import { EconomyStateView } from '../utils/progression';
import { IranMap } from './IranMap';
import { WorldMap, FOOTBALL_LEGENDS } from './WorldMap';
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
          {diff.label}
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
  const [busyUnlock, setBusyUnlock] = useState(false);

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

  const storyBooks = books.filter(b => b.genre !== 'education');
  const byGenre = (genre: StoryGenre) => storyBooks.filter(b => b.genre === genre);

  const historyBooks = byGenre('history');
  const epicBooks = byGenre('epic');
  const folkloreBooks = byGenre('folklore');

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
      return { line: `${toFa(FOOTBALL_LEGENDS.length)} اسطوره · ${toFa(totalChapters)} فصل`, sub: `${toFa(started)} شروع‌شده` };
    }
    const list = id === 'history' ? historyBooks : id === 'epic' ? epicBooks : folkloreBooks;
    const { total, done } = chapterStats(list);
    return { line: `${toFa(list.length)} کتاب · ${toFa(total)} فصل`, sub: `${toFa(done)} خوانده · ${toFa(startedCount(list))} شروع‌شده` };
  };

  const shelfRows: StoryBook[][] = [];
  for (let i = 0; i < folkloreBooks.length; i += cols) {
    shelfRows.push(folkloreBooks.slice(i, i + cols));
  }

  return (
    <div className="clay-wall w-full h-full flex flex-col animate-in fade-in duration-500 overflow-hidden relative">

      <header className="px-3 sm:px-6 pt-2 sm:pt-3 pb-2 shrink-0 relative z-10">
        <div className="flex justify-between items-center mb-2 sm:mb-2.5">
          <div className="flex items-center gap-2">
            <button onClick={onBack} className="cg-chip !rounded-full !p-2 transition-all hover:brightness-105">
              <span className="ink-back-flip"><InkBack size={16} /></span>
            </button>
            <button
              onClick={onOpenShop}
              className="cg-chip coin flex items-center gap-1.5"
              title="سکه و فروشگاه"
            >
              <GameCoin size={14} />
              <span className="font-black text-xs tabular-nums">{toFa(player.coins)}</span>
            </button>
            {onOpenCollection && (
              <button
                type="button"
                onClick={onOpenCollection}
                className="px-3 py-1.5 rounded-full text-[10.5px] font-black text-[#FFF9EE] flex items-center gap-1.5 shadow-sm active:scale-95 transition-transform"
                style={{
                  background: 'linear-gradient(180deg, #289E92 0%, #176B62 100%)',
                  border: '1px solid #A7ECE4',
                  boxShadow: '0 2px 0 #0E453F',
                }}
              >
                <span>🃏</span>
                <span>کالکشن و کومبوی ۳ کارتی</span>
              </button>
            )}
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end">
              {economy.hasEpicPatronPass && (
                <span className="px-2 py-0.5 rounded-full bg-[#fef3c7] border border-[#f59e0b] text-[#92400e] text-[9.5px] font-black flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-[#d97706]" />
                  حامی طومار زرین
                </span>
              )}
              <Medallion tone="ochre" size={30}>
                <InkTome size={16} />
              </Medallion>
              <h1 className="on-clay text-lg sm:text-2xl font-black">گنجینه</h1>
            </div>
            <p className="on-clay-2 text-[10px] sm:text-xs font-bold mt-0.5" dir="rtl">
              تاریخ، حماسه، قصه‌ها و اسطوره‌ها — همه در یک جا
            </p>
          </div>
        </div>

        <div className="treasure-tray" dir="rtl">
          {SHELVES.map((tab, ti) => {
            const active = shelf === tab.id;
            const stats = shelfStats(tab.id);
            return (
              <button
                key={tab.id}
                onClick={() => onShelfChange(tab.id)}
                className={`treasure-tab ${active ? 'on' : ''}`}
                style={{ animationDelay: `${0.06 + ti * 0.06}s` }}
                aria-pressed={active}
              >
                <span className="treasure-tab-head">
                  <tab.Icon size={14} />
                  <span className="treasure-tab-label">{tab.label}</span>
                </span>
                <span className="treasure-tab-line">{stats.line}</span>
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
              />
            </div>
          </div>
        </div>
      ) : shelf === 'football' ? (
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
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-3 sm:px-6 pb-24 relative z-10 scrollbar-hide">
          <div className="max-w-3xl mx-auto">
            <ShelfHeader
              title="قصه‌های شب"
              note="قصه‌های کوتاه و ساده برای همه"
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

            {folkloreBooks.length === 0 && (
              <div className="on-clay-2 text-center py-16">
                <Medallion tone="cream" size={44}>
                  <InkTome size={20} />
                </Medallion>
                <p className="text-sm font-bold mt-2">این قفسه هنوز خالی است.</p>
              </div>
            )}
          </div>
        </div>
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
                این کتاب شامل {toFa(lockedBookPrompt.chapters.length)} فصل داستانی است. می‌توانید آن را با سکه باز کنید یا با «طومار زرین شاهنامه» تمام ۳۴+ کتاب گنجینه را یک‌جا برای همیشه باز کنید!
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
                  بازگشایی دائمی هر ۳۴ کتاب + ۱,۲۰۰ سکه + لقب شاهنامه‌خوان
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
