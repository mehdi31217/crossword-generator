import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Archive, Clock, Handshake, Inbox, Loader2, Lock, Send, Swords, Trash2, Trophy, X,
} from 'lucide-react';
import { GameCoin } from './GameCoin';
import {
  AsyncDuel, Category, DuelArena, DuelInviteView, DuelOutcome, DuelResult,
  GridSize, Language, LastPlayedBoard, PlayerState,
} from '../types';
import { gameServer } from '../utils/gameServer';
import { track } from '../utils/analytics';
import { getCategoryNameFa, getCategoryNameEn } from '../utils/categoryNames';
import { DUEL_WEIGHTS, duelPoints, duelPointsOf } from '../utils/duelScoring';
import { getUnlockedCategories, getCategoryUnlockScore, isSizeUnlocked, SIZE_SCORE_THRESHOLDS } from '../utils/config';

const toFa = (value: string | number) =>
  String(value).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[+d]);

const formatTime = (seconds: number) => {
  const s = Math.max(0, Math.round(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

/** Mirrors the server: DUEL_ARENA_LIMIT / DUEL_INVITE_LIMIT. */
const MAX_ARENAS = 5;
const MAX_INVITES = 5;

const SIZES: GridSize[] = [5, 6, 7, 8, 9, 10];
const PICK_CATEGORIES: Category[] = [
  'knowledge', 'food', 'all', 'movies', 'cities', 'body',
  'jobs', 'tech', 'nature', 'history', 'sports', 'art',
];

type Props = {
  language: Language;
  player: PlayerState;
  friends: any[];
  lastBoard: LastPlayedBoard | null;
  outcome: DuelOutcome | null;
  onBack: () => void;
  onStartBoard: (duel: AsyncDuel) => void;
  onPlayQuick: () => void;
  /** Build a fresh solo board with these settings — finishing it makes it duel-ready. */
  onBuildBoard: (size: GridSize, category: Category) => void;
  onClearOutcome: () => void;
  onRequireAuth: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error') => void;
};

type DetailsTarget = {
  title: string;
  meta: string;
  points: number;
  result: DuelResult | null;
};

export const AsyncDuelScreen: React.FC<Props> = ({
  language, player, friends, lastBoard, outcome,
  onBack, onStartBoard, onPlayQuick, onBuildBoard, onClearOutcome, onRequireAuth, onShowToast,
}) => {
  const isFA = language === 'fa';
  const isGuest = !player || player.id === 'guest';

  const categoryLabel = useCallback(
    (cat: Category) => (isFA ? getCategoryNameFa(cat) : getCategoryNameEn(cat)),
    [isFA],
  );

  const [arenas, setArenas] = useState<DuelArena[]>([]);
  const [incoming, setIncoming] = useState<AsyncDuel[]>([]);
  const [results, setResults] = useState<AsyncDuel[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [inviteArena, setInviteArena] = useState<DuelArena | null>(null);
  const [targets, setTargets] = useState<string[]>([]);
  const [details, setDetails] = useState<DetailsTarget | null>(null);
  // Default the builder to what this player has actually unlocked, otherwise the
  // first tap on the build button can only answer «هنوز قفل است».
  const [buildSize, setBuildSize] = useState<GridSize>(() => {
    const score = player?.score ?? 0;
    for (let s = 10; s >= 5; s--) if (isSizeUnlocked(s, score)) return s as GridSize;
    return 5;
  });
  const [buildCategory, setBuildCategory] = useState<Category>(() => {
    const unlocked = getUnlockedCategories(player?.score ?? 0);
    return (unlocked.includes('knowledge') ? 'knowledge' : unlocked[0] || 'all') as Category;
  });
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [pendingClose, setPendingClose] = useState<string | null>(null);
  // `/duel/create` is idempotent-free, so remember which finished run was already
  // posted to avoid turning the same board into two identical arenas by accident.
  const [publishedAt, setPublishedAt] = useState<number | null>(null);

  // The parent passes an inline toast callback, so keeping it in the deps would
  // rebuild `refresh` on every render and re-fetch on loop.
  const toastRef = useRef(onShowToast);
  toastRef.current = onShowToast;

  const refresh = useCallback(async () => {
    if (isGuest) { setLoading(false); return; }
    try {
      const data = await gameServer.listDuels();
      setArenas(data.arenas);
      setIncoming(data.incoming);
      setResults(data.results);
    } catch (e: any) {
      toastRef.current(e?.message || (isFA ? 'دریافت چالش‌ها ناموفق بود' : 'Could not load challenges'), 'error');
    } finally {
      setLoading(false);
    }
  }, [isFA, isGuest]);

  useEffect(() => { refresh(); }, [refresh]);

  const acceptedFriends = useMemo(
    () => (friends || []).filter((f: any) => !f.status || f.status === 'accepted'),
    [friends],
  );
  const liveCount = useMemo(() => arenas.filter(a => !a.expired).length, [arenas]);
  const unlockedCats = useMemo(
    () => getUnlockedCategories(player?.score ?? 0),
    [player?.score],
  );

  const dateLabel = (iso: string) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleDateString(isFA ? 'fa-IR' : 'en-GB', { month: 'short', day: 'numeric' });
  };

  const lastPoints = lastBoard ? duelPointsOf(lastBoard.result) : 0;

  /** Locked settings answer with what unlocks them, instead of failing on build. */
  const pickSize = (s: GridSize) => {
    const need = SIZE_SCORE_THRESHOLDS[s] ?? 0;
    if (need > (player?.score ?? 0)) {
      onShowToast(
        isFA ? `برای ${toFa(s)}×${toFa(s)} به ${toFa(need)} امتیاز نیاز داری` : `${s}×${s} needs ${need} score`,
        'error',
      );
      return;
    }
    setBuildSize(s);
  };

  const pickCategory = (c: Category) => {
    const need = getCategoryUnlockScore(c);
    if (need > (player?.score ?? 0)) {
      onShowToast(
        isFA ? `«${categoryLabel(c)}» با ${toFa(need)} امتیاز باز می‌شود` : `“${categoryLabel(c)}” unlocks at ${need} score`,
        'error',
      );
      return;
    }
    setBuildCategory(c);
  };

  const publishLastBoard = async () => {
    if (!lastBoard) return;
    if (liveCount >= MAX_ARENAS) {
      onShowToast(
        isFA
          ? `سقف ${toFa(MAX_ARENAS)} چالش فعال را پر کرده‌ای؛ یکی را حذف کن`
          : `All ${MAX_ARENAS} live challenges are used — delete one first`,
        'error',
      );
      return;
    }
    setBusy('publish');
    try {
      await gameServer.createDuelArena({
        category: lastBoard.category,
        language: lastBoard.language,
        size: lastBoard.size,
        board: lastBoard.board,
        result: lastBoard.result,
      });
      setPublishedAt(lastBoard.at);
      onShowToast(
        isFA ? 'چالش ساخته شد؛ حالا دوست‌ها را به رقابت دعوت کن' : 'Challenge created — now invite your friends',
        'success',
      );
      await refresh();
    } catch (e: any) {
      onShowToast(e?.message || (isFA ? 'ساخت چالش ناموفق بود' : 'Could not create the challenge'), 'error');
    } finally {
      setBusy(null);
    }
  };

  const openInvite = (arena: DuelArena) => {
    if (!arena.can_invite) return;
    setTargets([]);
    setInviteArena(arena);
  };

  const toggleTarget = (id: string) => {
    const slots = inviteArena?.invite_slots_left ?? MAX_INVITES;
    setTargets(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= slots) {
        onShowToast(
          isFA ? `این چالش فقط ${toFa(slots)} دعوت دیگر جا دارد` : `Only ${slots} more invite(s) fit here`,
          'error',
        );
        return prev;
      }
      return [...prev, id];
    });
  };

  const sendInvites = async () => {
    if (!inviteArena || targets.length === 0) return;
    setBusy(`invite:${inviteArena.id}`);
    try {
      const updated = await gameServer.inviteToDuel(inviteArena.id, targets);
      setInviteArena(null);
      setTargets([]);
      onShowToast(
        isFA ? `دعوت برای ${toFa(targets.length)} دوست فرستاده شد` : `Invitation sent to ${targets.length} friend(s)`,
        'success',
      );
      setArenas(prev => prev.map(a => (a.id === updated.id ? updated : a)));
      track('duel_invite', { count: targets.length });
      await refresh();
    } catch (e: any) {
      onShowToast(e?.message || (isFA ? 'ارسال دعوت ناموفق بود' : 'Could not send the invitation'), 'error');
      await refresh();
    } finally {
      setBusy(null);
    }
  };

  const acceptDuel = async (duelId: string) => {
    setBusy(`accept:${duelId}`);
    try {
      const duel = await gameServer.acceptDuel(duelId);
      if (!duel?.board) throw new Error(isFA ? 'جدول این دوئل پیدا نشد' : 'Duel board missing');
      onStartBoard(duel);
    } catch (e: any) {
      onShowToast(e?.message || (isFA ? 'پذیرش دعوت ناموفق بود' : 'Could not accept the invitation'), 'error');
      await refresh();
    } finally {
      setBusy(null);
    }
  };

  const removeArena = async (arenaId: string) => {
    setBusy(`delete:${arenaId}`);
    setPendingDelete(null);
    try {
      await gameServer.deleteDuelArena(arenaId);
      onShowToast(isFA ? 'چالش و دعوت‌هایش حذف شد' : 'Challenge and its invitations were deleted', 'success');
      await refresh();
    } catch (e: any) {
      onShowToast(e?.message || (isFA ? 'حذف چالش ناموفق بود' : 'Could not delete the challenge'), 'error');
    } finally {
      setBusy(null);
    }
  };

  const closeArena = async (arenaId: string) => {
    setBusy(`close:${arenaId}`);
    setPendingClose(null);
    try {
      const updated = await gameServer.closeDuelArena(arenaId);
      setArenas(prev => prev.map(a => (a.id === updated.id ? updated : a)));
      onShowToast(isFA ? 'چالش بسته شد؛ رکوردها سر جایشان ماندند' : 'Challenge closed — records are kept', 'success');
    } catch (e: any) {
      onShowToast(e?.message || (isFA ? 'بستن چالش ناموفق بود' : 'Could not close the challenge'), 'error');
    } finally {
      setBusy(null);
    }
  };

  const arenaChip = (arena: DuelArena) => {
    if (arena.expired) return { label: isFA ? 'منقضی' : 'Expired', cls: 'bg-[rgba(36,26,20,.07)] text-[color:var(--ink-3)]' };
    if (arena.closed) return { label: isFA ? 'بسته' : 'Closed', cls: 'bg-[rgba(36,26,20,.07)] text-[color:var(--ink-3)]' };
    return { label: isFA ? 'باز' : 'Open', cls: 'bg-[rgba(94,110,82,.16)] text-[color:var(--cg-green)]' };
  };

  const inviteChip = (invite: DuelInviteView) => {
    if (invite.status === 'completed') {
      if (invite.outcome === 'creator') return { label: isFA ? 'برد تو' : 'You won', cls: 'bg-[rgba(94,110,82,.16)] text-[color:var(--cg-green)]' };
      if (invite.outcome === 'opponent') return { label: isFA ? 'برد دوست' : 'Friend won', cls: 'bg-[rgba(158,90,80,.14)] text-[color:var(--clay-ink)]' };
      return { label: isFA ? 'مساوی' : 'Draw', cls: 'bg-[rgba(176,127,34,.16)] text-[color:var(--ink-win)]' };
    }
    if (invite.status === 'playing') return { label: isFA ? 'در حال بازی' : 'In play', cls: 'bg-[rgba(122,90,134,.16)] text-[color:var(--ink-draw)]' };
    return { label: isFA ? 'منتظر بازی' : 'Waiting', cls: 'bg-[rgba(36,26,20,.06)] text-[color:var(--ink-2)]' };
  };

  const openDetails = (title: string, meta: string, points: number, result: DuelResult | null) => {
    setDetails({ title, meta, points, result });
  };

  if (isGuest) {
    return (
      <div className="w-full h-full flex flex-col overflow-hidden relative" style={{ color: 'var(--cg-ink)' }}>
        <header className="px-4 py-3 flex items-center justify-between">
          <button onClick={onBack} className="cg-chip !rounded-full !px-3 !py-2 text-[11px] font-black">
            {isFA ? 'بازگشت' : 'Back'}
          </button>
          <h1 className="text-lg font-black">{isFA ? 'چالش‌های دوئل' : 'Duel challenges'}</h1>
          <span className="w-9" />
        </header>
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-8 text-center">
          <Swords size={40} className="text-[color:var(--ink-3)]" />
          <p className="text-sm font-bold leading-6">
            {isFA ? 'برای ساختن چالش و دعوت دوستان باید وارد حساب خودت شوی.' : 'Log in to create challenges and invite friends.'}
          </p>
          <button
            onClick={onRequireAuth}
            className="px-6 py-2.5 rounded-2xl cg-btn-clay font-black text-sm shadow-lg"
          >
            {isFA ? 'ورود / ثبت‌نام' : 'Log in'}
          </button>
        </div>
      </div>
    );
  }

  const publishedFromLast = lastBoard != null && publishedAt === lastBoard.at;

  return (
    <div className="w-full h-full flex flex-col overflow-hidden relative" style={{ color: 'var(--cg-ink)' }}>
      <header className="px-3 sm:px-6 py-2 sm:py-3 shrink-0 relative z-10">
        <div className="flex items-start justify-between gap-2">
          <div className="text-right min-w-0">
            <h1 className="text-lg sm:text-2xl font-black leading-tight">
              {isFA ? 'چالش‌های دوئل' : 'Duel challenges'}
            </h1>
            <p className="text-[10px] sm:text-xs font-bold text-[color:var(--ink-3)] mt-0.5 leading-5">
              {isFA
                ? 'بازی‌ای که ثبت کردی می‌شود چالش؛ دوست‌ها همان جدول را بازی می‌کنند.'
                : 'Post a run as a challenge and friends replay the same board.'}
            </p>
          </div>
          <button onClick={onBack} className="cg-chip !rounded-full !px-3 !py-2 text-[11px] font-black shrink-0">
            {isFA ? 'بازگشت' : 'Back'}
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-3 sm:px-6 pb-12 relative z-10 scrollbar-hide">
        <div className="max-w-2xl mx-auto flex flex-col gap-3" dir="rtl">

          {outcome && (
            <section
              className={`cg-glass !rounded-3xl p-4 relative overflow-hidden ${
                outcome.outcome === 'win' ? 'ring-2 ring-[#5E6E52]/60'
                  : outcome.outcome === 'loss' ? 'ring-2 ring-[#9E5A50]/50'
                  : 'ring-2 ring-[#B07F22]/50'
              }`}
            >
              <button
                onClick={onClearOutcome}
                className="absolute top-2 left-2 text-[color:var(--ink-3)] px-2 py-1"
                aria-label={isFA ? 'بستن' : 'Close'}
              >
                <X size={14} />
              </button>
              <div className="flex items-center gap-2 mb-2">
                {outcome.outcome === 'win'
                  ? <Trophy size={18} className="text-[color:var(--ink-win)]" />
                  : outcome.outcome === 'loss'
                    ? <Swords size={18} className="text-[color:var(--ink-lose)]" />
                    : <Handshake size={18} className="text-[color:var(--ink-win)]" />}
                <h2 className="text-sm font-black">
                  {outcome.outcome === 'win'
                    ? (isFA ? 'داور: تو بردی!' : 'Verdict: you won!')
                    : outcome.outcome === 'loss'
                      ? (isFA ? 'داور: حریف برد' : 'Verdict: opponent won')
                      : (isFA ? 'مساوی شد' : 'It is a draw')}
                </h2>
              </div>
              <div className="flex items-center justify-center gap-6 py-2">
                <div className="text-center">
                  <p className="text-[10px] font-bold text-[color:var(--ink-3)]">
                    {outcome.duel.creator_name || (isFA ? 'سازنده' : 'Creator')}
                  </p>
                  <p className="text-2xl font-black tabular-nums">
                    {isFA ? toFa(duelPointsOf(outcome.duel.creator_result)) : duelPointsOf(outcome.duel.creator_result)}
                  </p>
                </div>
                <span className="text-xs font-black text-[color:var(--ink-3)]">—</span>
                <div className="text-center">
                  <p className="text-[10px] font-bold text-[color:var(--ink-3)]">{isFA ? 'تو' : 'You'}</p>
                  <p className="text-2xl font-black tabular-nums">
                    {isFA ? toFa(duelPointsOf(outcome.duel.opponent_result)) : duelPointsOf(outcome.duel.opponent_result)}
                  </p>
                </div>
              </div>
              {outcome.duel.opponent_result && (
                <button
                  onClick={() => openDetails(
                    isFA ? 'امتیاز داوری من' : 'My verdict',
                    `${categoryLabel(outcome.duel.category)} • ${isFA ? toFa(outcome.duel.size) : outcome.duel.size}×${isFA ? toFa(outcome.duel.size) : outcome.duel.size}`,
                    duelPointsOf(outcome.duel.opponent_result),
                    outcome.duel.opponent_result,
                  )}
                  className="mx-auto block px-3 py-1 rounded-xl cg-note text-[10.5px] font-black text-[color:var(--clay-ink)]"
                >
                  {isFA ? 'جزئیات امتیاز من' : 'My score details'}
                </button>
              )}
              {(typeof outcome.reward === 'number' || typeof outcome.coins === 'number') && (
                <p className="text-center text-[11px] font-black text-[color:var(--ink-win)] mt-2 flex items-center justify-center gap-1">
                  <GameCoin size={14} />
                  <span>
                    {isFA
                      ? `${toFa(outcome.reward ?? outcome.coins ?? 0)} سکه پاداش گرفتی`
                      : `+${outcome.reward ?? outcome.coins ?? 0} coins`}
                  </span>
                </p>
              )}
            </section>
          )}

          {/* ─── ساخت چالش ─── */}
          <section className="cg-glass !rounded-3xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Swords size={16} className="text-[color:var(--clay-ink)]" />
                <h2 className="text-sm font-black">{isFA ? 'چالش تازه' : 'New challenge'}</h2>
              </div>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                liveCount >= MAX_ARENAS ? 'bg-[rgba(158,90,80,.14)] text-[color:var(--clay-ink)]' : 'bg-[rgba(36,26,20,.06)] text-[color:var(--ink-2)]'
              }`}>
                {isFA ? `${toFa(liveCount)} از ${toFa(MAX_ARENAS)} چالش` : `${liveCount}/${MAX_ARENAS} challenges`}
              </span>
            </div>
            <p className="text-[10px] font-bold text-[color:var(--ink-3)] leading-5 mb-3">
              {isFA
                ? 'هر چالش ۷ روز اعتبار دارد و نتیجه‌ها همیشه می‌مانند.'
                : 'A challenge lives for 7 days; results are kept forever.'}
            </p>

            {lastBoard ? (
              <div className="rounded-2xl cg-note p-3">
                <p className="text-[10px] font-bold text-[color:var(--ink-3)] mb-1">
                  {isFA ? 'آخرین بازی ثبت‌شده‌ی تو' : 'Your last recorded run'}
                </p>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-black">
                      {categoryLabel(lastBoard.category)} •{' '}
                      {isFA ? toFa(lastBoard.board.grid.length) : lastBoard.board.grid.length}×
                      {isFA ? toFa(lastBoard.board.grid[0]?.length || 0) : lastBoard.board.grid[0]?.length || 0}
                    </p>
                    <p className="text-[10px] font-bold text-[color:var(--ink-3)] mt-1 flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-0.5">
                        <Clock size={11} />
                        {isFA ? toFa(formatTime(lastBoard.result.seconds)) : formatTime(lastBoard.result.seconds)}
                      </span>
                      <span className="text-[color:var(--clay-ink)] font-black">
                        {isFA ? `امتیاز داوری ${toFa(lastPoints)}` : `verdict ${lastPoints}`}
                      </span>
                    </p>
                  </div>
                  <button
                    onClick={() => openDetails(
                      isFA ? 'امتیاز داوری من' : 'My verdict',
                      `${categoryLabel(lastBoard.category)} • ${isFA ? toFa(lastBoard.size) : lastBoard.size}×${isFA ? toFa(lastBoard.size) : lastBoard.size}`,
                      lastPoints,
                      lastBoard.result,
                    )}
                    className="cg-chip !rounded-full !px-2.5 !py-1 text-[10px] font-black text-[color:var(--clay-ink)] shrink-0"
                  >
                    {isFA ? 'جزئیات' : 'Details'}
                  </button>
                </div>

                {publishedFromLast ? (
                  <p className="mt-3 text-center text-[11px] font-black text-[color:var(--cg-green)] bg-[rgba(94,110,82,.10)] border border-[rgba(94,110,82,.30)] rounded-2xl py-2">
                    {isFA ? 'این بازی به چالش تبدیل شد ✓' : 'This run became a challenge ✓'}
                  </p>
                ) : (
                  <button
                    onClick={publishLastBoard}
                    disabled={busy === 'publish' || liveCount >= MAX_ARENAS}
                    className="mt-3 w-full py-3 rounded-2xl cg-btn-clay text-xs font-black shadow-lg active:scale-[0.99] transition-transform disabled:opacity-40 flex items-center justify-center gap-2"
                  >
                    {busy === 'publish' ? <Loader2 size={16} className="animate-spin" /> : <Trophy size={16} />}
                    {isFA ? 'ساخت چالش از این بازی' : 'Create a challenge from this run'}
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-3 rounded-2xl cg-note">
                <p className="text-[11px] font-bold text-[color:var(--ink-3)] leading-6 mb-3 px-3">
                  {isFA
                    ? 'هنوز بازی ثبت‌شده‌ای نداری. یک جدول بازی کن و تا آخر پرش کن؛ بعد از آن می‌توانی چالش بسازی.'
                    : 'No recorded run yet. Finish a board and you can turn it into a challenge.'}
                </p>
                <button
                  onClick={onPlayQuick}
                  className="px-5 py-2 rounded-2xl cg-btn-clay text-xs font-black shadow-lg"
                >
                  {isFA ? 'یک بازی سریع' : 'Play a quick game'}
                </button>
              </div>
            )}

            <div className="mt-3 pt-3 border-t border-[rgba(142,78,55,.16)]">
              <p className="text-[10px] font-black text-[color:var(--ink-3)] mb-2">
                {isFA ? 'یا یک جدول تازه بازی کن' : 'Or play a fresh board'}
              </p>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {SIZES.map(s => {
                  const locked = !isSizeUnlocked(s, player.score ?? 0);
                  return (
                    <button
                      key={s}
                      onClick={() => pickSize(s)}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition-all ${
                        buildSize === s
                          ? 'cg-btn-clay shadow-md'
                          : locked
                            ? 'bg-[rgba(36,26,20,.06)] text-[color:var(--ink-3)]'
                            : 'cg-note text-[color:var(--ink-2)]'
                      }`}
                    >
                      {isFA ? toFa(s) : s}×{isFA ? toFa(s) : s}
                      {locked && ' 🔒'}
                    </button>
                  );
                })}
              </div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {PICK_CATEGORIES.map(c => {
                  const locked = !unlockedCats.includes(c);
                  return (
                    <button
                      key={c}
                      onClick={() => pickCategory(c)}
                      className={`px-2.5 py-1 rounded-xl text-[10.5px] font-black transition-all ${
                        buildCategory === c
                          ? 'bg-[#D0A34A] text-[#3A2906] shadow-md shadow-amber-400/30'
                          : locked
                            ? 'bg-[rgba(36,26,20,.06)] text-[color:var(--ink-3)]'
                            : 'cg-note text-[color:var(--ink-2)]'
                      }`}
                    >
                      {categoryLabel(c)}{locked && ' 🔒'}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => onBuildBoard(buildSize, buildCategory)}
                className="w-full py-2.5 rounded-2xl cg-btn-clay text-xs font-black active:scale-[0.99] transition-transform flex items-center justify-center gap-2"
              >
                <Swords size={14} />
                {isFA
                  ? `شروع بازی ${toFa(buildSize)}×${toFa(buildSize)} — ${categoryLabel(buildCategory)}`
                  : `Play ${buildSize}×${buildSize} — ${categoryLabel(buildCategory)}`}
              </button>
            </div>
          </section>

          {/* ─── چالش‌های من ─── */}
          <section className="cg-glass !rounded-3xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Swords size={16} className="text-[color:var(--clay-ink)]" />
              <h2 className="text-sm font-black">{isFA ? 'چالش‌های من' : 'My challenges'}</h2>
              {arenas.length > 0 && (
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[rgba(122,90,134,.16)] text-[color:var(--ink-draw)]">
                  {isFA ? toFa(arenas.length) : arenas.length}
                </span>
              )}
            </div>

            {loading ? (
              <div className="py-4 flex justify-center"><Loader2 size={18} className="animate-spin text-[color:var(--ink-3)]" /></div>
            ) : arenas.length === 0 ? (
              <p className="text-[11px] font-bold text-[color:var(--ink-3)] py-2">
                {isFA ? 'هنوز چالشی نساخته‌ای.' : 'No challenges yet.'}
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {arenas.map(arena => {
                  const chip = arenaChip(arena);
                  const canClose = !arena.closed && !arena.expired && !arena.can_delete;
                  return (
                    <div key={arena.id} className="rounded-2xl cg-note p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-[11.5px] font-black truncate">
                            {categoryLabel(arena.category)} •{' '}
                            {isFA ? toFa(arena.size) : arena.size}×{isFA ? toFa(arena.size) : arena.size}
                          </p>
                          <p className="text-[9.5px] font-bold text-[color:var(--ink-3)] mt-0.5">
                            {dateLabel(arena.created_at)} •{' '}
                            {isFA ? `امتیاز داوری من ${toFa(arena.creator_points)}` : `my verdict ${arena.creator_points}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <span className={`text-[9.5px] font-black px-2 py-0.5 rounded-full ${chip.cls}`}>{chip.label}</span>
                          <button
                            onClick={() => openDetails(
                              isFA ? 'امتیاز داوری من' : 'My verdict',
                              `${categoryLabel(arena.category)} • ${isFA ? toFa(arena.size) : arena.size}×${isFA ? toFa(arena.size) : arena.size} • ${dateLabel(arena.created_at)}`,
                              arena.creator_points,
                              null,
                            )}
                            className="text-[10px] font-black text-[color:var(--clay-ink)] px-1.5 py-0.5 rounded-lg bg-[rgba(142,78,55,.08)]"
                          >
                            {isFA ? 'جزئیات' : 'Details'}
                          </button>
                        </div>
                      </div>

                      {arena.invites.length > 0 && (
                        <div className="mt-2 flex flex-col gap-1">
                          {arena.invites.map(invite => {
                            const invChip = inviteChip(invite);
                            return (
                              <div key={invite.id} className="flex items-center gap-2 rounded-xl bg-[rgba(36,26,20,.045)] border border-[rgba(36,26,20,.10)] px-2 py-1.5">
                                <span className="w-6 h-6 rounded-lg cg-note grid place-items-center text-[13px] shrink-0">
                                  {invite.opponent_avatar || '👤'}
                                </span>
                                <span className="text-[10.5px] font-black truncate flex-1 min-w-0">
                                  {invite.opponent_name || (isFA ? 'دوست دعوت‌شده' : 'Invited friend')}
                                </span>
                                {invite.points != null && (
                                  <span className="text-[10px] font-black text-[color:var(--ink-2)] tabular-nums shrink-0">
                                    {isFA ? toFa(invite.points) : invite.points}
                                  </span>
                                )}
                                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full shrink-0 ${invChip.cls}`}>
                                  {invChip.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-[rgba(142,78,55,.18)] flex-wrap">
                        {arena.can_invite && (
                          <button
                            onClick={() => openInvite(arena)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl cg-btn-clay text-[10.5px] font-black shadow-md active:scale-95 transition-transform"
                          >
                            <Send size={12} />
                            {isFA
                              ? `دعوت دوستان (${toFa(arena.invite_slots_left)} جا)`
                              : `Invite friends (${arena.invite_slots_left} left)`}
                          </button>
                        )}

                        {arena.can_delete ? (
                          pendingDelete === arena.id ? (
                            <span className="flex items-center gap-1">
                              <button
                                onClick={() => removeArena(arena.id)}
                                disabled={!!busy}
                                className="px-2.5 py-1.5 rounded-xl cg-btn-brick text-[10px] font-black disabled:opacity-50"
                              >
                                {busy === `delete:${arena.id}`
                                  ? <Loader2 size={12} className="animate-spin" />
                                  : (isFA ? 'حذف کن' : 'Delete')}
                              </button>
                              <button
                                onClick={() => setPendingDelete(null)}
                                className="px-2.5 py-1.5 rounded-xl cg-note text-[color:var(--ink-2)] text-[10px] font-black border border-[rgba(36,26,20,.16)]"
                              >
                                {isFA ? 'نه' : 'No'}
                              </button>
                            </span>
                          ) : (
                            <button
                              onClick={() => setPendingDelete(arena.id)}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl cg-note text-[color:var(--ink-lose)] text-[10.5px] font-black border border-[rgba(158,90,80,.34)]"
                            >
                              <Trash2 size={12} />
                              {isFA ? 'حذف چالش' : 'Delete challenge'}
                            </button>
                          )
                        ) : canClose ? (
                          pendingClose === arena.id ? (
                            <span className="flex items-center gap-1">
                              <button
                                onClick={() => closeArena(arena.id)}
                                disabled={!!busy}
                                className="px-2.5 py-1.5 rounded-xl cg-btn-cream text-[10px] font-black disabled:opacity-50"
                              >
                                {busy === `close:${arena.id}`
                                  ? <Loader2 size={12} className="animate-spin" />
                                  : (isFA ? 'ببند' : 'Close')}
                              </button>
                              <button
                                onClick={() => setPendingClose(null)}
                                className="px-2.5 py-1.5 rounded-xl cg-note text-[color:var(--ink-2)] text-[10px] font-black border border-[rgba(36,26,20,.16)]"
                              >
                                {isFA ? 'نه' : 'No'}
                              </button>
                            </span>
                          ) : (
                            <button
                              onClick={() => setPendingClose(arena.id)}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl cg-note text-[color:var(--ink)] text-[10.5px] font-black border border-[rgba(36,26,20,.16)]"
                            >
                              <Archive size={12} />
                              {isFA ? 'بستن چالش' : 'Close challenge'}
                            </button>
                          )
                        ) : null}

                        {!arena.can_delete && (
                          <span className="text-[9.5px] font-bold text-[color:var(--ink-3)]">
                            {arena.closed
                              ? (isFA ? 'بسته است؛ رکوردها حفظ شده‌اند.' : 'Closed — records kept.')
                              : (isFA ? 'نتیجه دارد؛ رکوردها حفظ می‌شوند.' : 'Has results — they stay.')}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* ─── دعوت‌های دوستان ─── */}
          <section className="cg-glass !rounded-3xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Inbox size={16} className="text-[color:var(--ink-win)]" />
              <h2 className="text-sm font-black">{isFA ? 'دعوت‌های دوستان' : "Friends' challenges"}</h2>
              {incoming.length > 0 && (
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[rgba(176,127,34,.16)] text-[color:var(--ink-win)]">
                  {isFA ? toFa(incoming.length) : incoming.length}
                </span>
              )}
            </div>
            {loading ? (
              <div className="py-4 flex justify-center"><Loader2 size={18} className="animate-spin text-[color:var(--ink-3)]" /></div>
            ) : incoming.length === 0 ? (
              <p className="text-[11px] font-bold text-[color:var(--ink-3)] py-2">
                {isFA ? 'دعوتی منتظر تو نیست.' : 'No invitations waiting.'}
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {incoming.map(duel => (
                  <div key={duel.id} className="flex items-center gap-2 rounded-2xl cg-note p-2.5">
                    <span className="w-9 h-9 rounded-xl bg-[rgba(142,78,55,.08)] grid place-items-center text-lg shrink-0">
                      {duel.creator_avatar || '👤'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11.5px] font-black truncate">{duel.creator_name || '—'}</p>
                      <p className="text-[9.5px] font-bold text-[color:var(--ink-3)]">
                        {categoryLabel(duel.category)} • {isFA ? toFa(duel.size) : duel.size}×{isFA ? toFa(duel.size) : duel.size}
                        {' '}• {isFA ? `امتیاز حریف ${toFa(duelPointsOf(duel.creator_result))}` : `their verdict ${duelPointsOf(duel.creator_result)}`}
                        {' '}• {dateLabel(duel.created_at)}
                      </p>
                    </div>
                    <button
                      onClick={() => acceptDuel(duel.id)}
                      disabled={!!busy}
                      className="px-3 py-1.5 rounded-xl cg-btn-sage text-[10.5px] font-black disabled:opacity-50 shrink-0"
                    >
                      {busy === `accept:${duel.id}`
                        ? <Loader2 size={13} className="animate-spin" />
                        : (isFA ? 'بازی' : 'Play')}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ─── نتیجه‌های من ─── */}
          {results.length > 0 && (
            <section className="cg-glass !rounded-3xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Trophy size={16} className="text-[color:var(--ink-win)]" />
                <h2 className="text-sm font-black">{isFA ? 'نتیجه‌های من' : 'My results'}</h2>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[rgba(176,127,34,.16)] text-[color:var(--ink-win)]">
                  {isFA ? toFa(results.length) : results.length}
                </span>
              </div>
              <p className="text-[10px] font-bold text-[color:var(--ink-3)] leading-5 mb-2">
                {isFA ? 'این رکوردها پاک نمی‌شوند.' : 'These records are never deleted.'}
              </p>
              <div className="flex flex-col gap-2">
                {results.map(duel => {
                  const mine = duelPointsOf(duel.opponent_result);
                  const theirs = duelPointsOf(duel.creator_result);
                  const verdict = mine === theirs
                    ? 'draw'
                    : mine > theirs ? 'win' : 'loss';
                  return (
                    <div key={duel.id} className="rounded-2xl cg-note p-2.5">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-xl bg-[rgba(36,26,20,.06)] grid place-items-center text-base shrink-0">
                          {duel.creator_avatar || '👤'}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11.5px] font-black truncate">{duel.creator_name || '—'}</p>
                          <p className="text-[9.5px] font-bold text-[color:var(--ink-3)] truncate">
                            {categoryLabel(duel.category)} • {isFA ? toFa(duel.size) : duel.size}×{isFA ? toFa(duel.size) : duel.size}
                            {' '}• {dateLabel(duel.completed_at || duel.created_at)}
                          </p>
                        </div>
                        <span className={`text-[10px] font-black px-2 py-1 rounded-full shrink-0 ${
                          verdict === 'draw'
                            ? 'bg-[rgba(176,127,34,.16)] text-[color:var(--ink-win)]'
                            : verdict === 'win' ? 'bg-[rgba(94,110,82,.16)] text-[color:var(--cg-green)]' : 'bg-[rgba(158,90,80,.14)] text-[color:var(--clay-ink)]'
                        }`}>
                          {verdict === 'draw'
                            ? (isFA ? 'مساوی' : 'Draw')
                            : verdict === 'win' ? (isFA ? 'برد' : 'Win') : (isFA ? 'باخت' : 'Loss')}
                        </span>
                      </div>
                      <div className="flex items-center justify-center gap-4 mt-2 pt-2 border-t border-[rgba(142,78,55,.16)]">
                        <span className="text-[10px] font-bold text-[color:var(--ink-3)]">
                          {duel.creator_name}: <b className="text-[color:var(--ink)] tabular-nums">{isFA ? toFa(theirs) : theirs}</b>
                        </span>
                        <span className="text-[10px] font-bold text-[color:var(--ink-3)]">
                          {isFA ? 'تو' : 'You'}: <b className="text-[color:var(--ink)] tabular-nums">{isFA ? toFa(mine) : mine}</b>
                        </span>
                        <button
                          onClick={() => openDetails(
                            isFA ? 'امتیاز داوری من' : 'My verdict',
                            `${categoryLabel(duel.category)} • ${isFA ? toFa(duel.size) : duel.size}×${isFA ? toFa(duel.size) : duel.size} • ${dateLabel(duel.completed_at || duel.created_at)}`,
                            mine,
                            duel.opponent_result,
                          )}
                          className="text-[10px] font-black text-[color:var(--clay-ink)] px-1.5 py-0.5 rounded-lg bg-[rgba(142,78,55,.08)]"
                        >
                          {isFA ? 'جزئیات' : 'Details'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* ─── مودال دعوت به چالش ─── */}
      {inviteArena && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-[rgba(46,28,18,.55)] backdrop-blur-sm px-4"
          onClick={() => setInviteArena(null)}
        >
          <div
            dir="rtl"
            onClick={e => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl bg-[var(--paper)] shadow-[0_24px_48px_-24px_rgba(70,40,25,.9)] overflow-hidden"
            style={{ color: 'var(--cg-ink)' }}
          >
            <div className="px-4 py-3 flex items-center justify-between text-[#FFF6EC]">
              <div className="flex items-center gap-2">
                <Send size={17} />
                <h3 className="text-sm font-black">{isFA ? 'چه کسانی رقابت کنند؟' : 'Who should compete?'}</h3>
              </div>
              <button onClick={() => setInviteArena(null)} aria-label={isFA ? 'بستن' : 'Close'}>
                <X size={16} />
              </button>
            </div>

            <div className="px-4 py-2.5 bg-[rgba(142,78,55,.07)] border-b border-[rgba(142,78,55,.18)] flex items-center justify-between gap-2">
              <p className="text-[10px] font-black text-[color:var(--clay-ink)]">
                {categoryLabel(inviteArena.category)} •{' '}
                {isFA ? toFa(inviteArena.size) : inviteArena.size}×{isFA ? toFa(inviteArena.size) : inviteArena.size}
                {' '}• {isFA ? `امتیاز داوری ${toFa(inviteArena.creator_points)}` : `verdict ${inviteArena.creator_points}`}
              </p>
              <span className="text-[9.5px] font-black text-[color:var(--clay-ink)] shrink-0">
                {isFA ? `${toFa(inviteArena.invite_slots_left)} جای خالی` : `${inviteArena.invite_slots_left} left`}
              </span>
            </div>

            <div className="px-4 py-3 max-h-[46vh] overflow-y-auto">
              {(() => {
                const alreadyInvited = new Set(inviteArena.invites.map(i => i.opponent_id));
                const available = acceptedFriends.filter((f: any) => !alreadyInvited.has(f.friendId));
                if (available.length === 0) {
                  return (
                    <p className="text-[11px] font-bold text-[color:var(--ink-3)] text-center py-6 leading-6">
                      {acceptedFriends.length === 0
                        ? (isFA ? 'هنوز دوستی نداری. از بخش «اجتماعی» با کد دوستی نفر بعدی را اضافه کن.' : 'No friends yet. Add one with a friend code in Social.')
                        : (isFA ? 'همه‌ی دوستانت به این چالش دعوت شده‌اند.' : 'All your friends are already invited here.')}
                    </p>
                  );
                }
                return (
                  <div className="flex flex-col gap-1.5">
                    {available.map((f: any) => {
                      const on = targets.includes(f.friendId);
                      return (
                        <button
                          key={f.friendId}
                          onClick={() => toggleTarget(f.friendId)}
                          className={`flex items-center gap-2 rounded-2xl border p-2 text-right transition-all ${
                            on
                              ? 'border-[color:var(--clay-ink)] bg-[rgba(180,105,75,.10)] ring-1 ring-[#B4694B]/60'
                              : 'border-[rgba(36,26,20,.16)] cg-note hover:bg-[rgba(36,26,20,.04)]'
                          }`}
                        >
                          <span className="w-9 h-9 rounded-xl bg-[rgba(36,26,20,.06)] grid place-items-center text-lg shrink-0">
                            {f.avatar || '👤'}
                          </span>
                          <span className="flex-1 min-w-0 text-[11.5px] font-black truncate">{f.name}</span>
                          <span className={`w-5 h-5 rounded-md grid place-items-center shrink-0 ${
                            on ? 'cg-btn-clay' : 'bg-[rgba(36,26,20,.07)] text-transparent'
                          }`}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                              <path d="M20 6 9 17l-5-5" />
                            </svg>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            <div className="px-4 py-3 border-t border-[rgba(36,26,20,.10)]">
              <button
                onClick={sendInvites}
                disabled={targets.length === 0 || busy === `invite:${inviteArena.id}`}
                className="w-full py-2.5 rounded-2xl cg-btn-clay text-xs font-black shadow-lg disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {busy === `invite:${inviteArena.id}` ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                {isFA
                  ? `ارسال دعوت به ${toFa(targets.length || 0)} دوست`
                  : `Send to ${targets.length} friend(s)`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── مودال جزئیات امتیاز ─── */}
      {details && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-[rgba(46,28,18,.55)] backdrop-blur-sm px-4"
          onClick={() => setDetails(null)}
        >
          <div
            dir="rtl"
            onClick={e => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl bg-[var(--paper)] shadow-[0_24px_48px_-24px_rgba(70,40,25,.9)] overflow-hidden"
            style={{ color: 'var(--cg-ink)' }}
          >
            <div className="px-4 py-3 flex items-center justify-between bg-[linear-gradient(270deg,#8E4E37,#6E3A29)] text-[#FFF6EC]">
              <div className="flex items-center gap-2">
                <Trophy size={17} />
                <h3 className="text-sm font-black">{details.title}</h3>
              </div>
              <button onClick={() => setDetails(null)} aria-label={isFA ? 'بستن' : 'Close'}>
                <X size={16} />
              </button>
            </div>
            <div className="px-4 py-3">
              <p className="text-[10px] font-bold text-[color:var(--ink-3)] text-center">{details.meta}</p>
              <p className="text-center text-4xl font-black text-[color:var(--clay-ink)] tabular-nums my-2">
                {isFA ? toFa(details.points) : details.points}
              </p>
              <p className="text-center text-[10px] font-black text-[color:var(--ink-3)] mb-3">
                {isFA ? 'امتیاز داوری' : 'verdict points'}
              </p>
              <VerdictDetails isFA={isFA} result={details.result} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const formatNumber = (isFA: boolean, value: number) => (isFA ? toFa(value) : String(value));

/**
 * Counters first, formula last and behind a toggle: a player opening this wants
 * to know why they scored what they did, not to read a permanent equation.
 */
const VerdictDetails: React.FC<{
  isFA: boolean;
  result?: DuelResult | null;
}> = ({ isFA, result }) => {
  const [showFormula, setShowFormula] = useState(false);

  if (!result) {
    return (
      <p className="text-[11px] font-bold text-[color:var(--ink-3)] text-center leading-6">
        {isFA
          ? 'جزئیات این بازی ذخیره نشده؛ فقط امتیاز داوری نهایی ثبت شده است.'
          : 'The counters were not stored for this run — only the final verdict.'}
      </p>
    );
  }

  const typed = result.typed ?? result.solved ?? 0;
  const mistakes = result.mistakes ?? 0;
  const assisted = result.assisted ?? 0;
  const seconds = Math.round(result.seconds ?? 0);

  const rows = [
    { label: isFA ? 'خانه‌های درست' : 'correct cells', value: typed, good: true },
    { label: isFA ? 'زمان' : 'time', value: formatTime(seconds), good: false },
    { label: isFA ? 'اشتباه' : 'mistakes', value: mistakes, good: false },
    { label: isFA ? 'کمک گرفته' : 'helped', value: assisted, good: false },
  ];

  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        {rows.map(r => (
          <div key={r.label} className="rounded-2xl bg-[rgba(36,26,20,.04)] border border-[rgba(36,26,20,.12)] px-2 py-1.5 text-center">
            <p className="text-[9.5px] font-bold text-[color:var(--ink-3)]">{r.label}</p>
            <p className={`text-sm font-black tabular-nums ${r.good ? 'text-[color:var(--cg-green)]' : 'text-[color:var(--ink)]'}`}>
              {typeof r.value === 'number' ? formatNumber(isFA, r.value) : (isFA ? toFa(r.value) : r.value)}
            </p>
          </div>
        ))}
      </div>

      <button
        onClick={() => setShowFormula(v => !v)}
        className="mt-3 w-full py-1.5 rounded-xl text-[10.5px] font-black text-[color:var(--ink-2)] bg-[rgba(36,26,20,.06)]"
      >
        {showFormula
          ? (isFA ? 'بستن روش محاسبه' : 'Hide the formula')
          : (isFA ? 'چطور حساب می‌شود؟' : 'How is it calculated?')}
      </button>

      {showFormula && (
        <div className="mt-2 rounded-2xl bg-[rgba(36,26,20,.045)] border border-[rgba(36,26,20,.12)] p-2">
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            <span className="text-[9.5px] font-bold text-[color:var(--ink-3)] tabular-nums">
              +{formatNumber(isFA, typed)}<span className="text-[color:var(--ink-3)]">×{formatNumber(isFA, DUEL_WEIGHTS.cell)}</span>
              <span className="mx-1 text-[color:rgba(36,26,20,.3)]">|</span>{isFA ? 'خانه درست' : 'cells'}
            </span>
            <span className="text-[9.5px] font-bold text-[color:var(--ink-3)] tabular-nums">
              −{formatNumber(isFA, seconds)}<span className="text-[color:var(--ink-3)]">×{formatNumber(isFA, DUEL_WEIGHTS.second)}</span>
              <span className="mx-1 text-[color:rgba(36,26,20,.3)]">|</span>{isFA ? 'ثانیه' : 'seconds'}
            </span>
            <span className="text-[9.5px] font-bold text-[color:var(--ink-3)] tabular-nums">
              −{formatNumber(isFA, mistakes)}<span className="text-[color:var(--ink-3)]">×{formatNumber(isFA, DUEL_WEIGHTS.mistake)}</span>
              <span className="mx-1 text-[color:rgba(36,26,20,.3)]">|</span>{isFA ? 'اشتباه' : 'mistakes'}
            </span>
            <span className="text-[9.5px] font-bold text-[color:var(--ink-3)] tabular-nums">
              −{formatNumber(isFA, assisted)}<span className="text-[color:var(--ink-3)]">×{formatNumber(isFA, DUEL_WEIGHTS.assisted)}</span>
              <span className="mx-1 text-[color:rgba(36,26,20,.3)]">|</span>{isFA ? 'خانه‌های کمکی' : 'helped cells'}
            </span>
          </div>
          <p className="text-center text-[9.5px] font-bold text-[color:var(--ink-3)] mt-1.5 leading-5">
            {isFA
              ? 'سریع‌تر و بی‌اشتباه‌تر بودن، امتیاز را بالا می‌برد؛ کمک‌گرفتن از آن کم می‌کند.'
              : 'Speed and accuracy raise the score; using help lowers it.'}
          </p>
        </div>
      )}
    </>
  );
};

export default AsyncDuelScreen;
