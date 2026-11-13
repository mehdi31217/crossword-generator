import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { Play, ArrowRight, Swords, Zap, Loader2, X, Clock, Users, Lock } from 'lucide-react';
import { GameCoin } from './GameCoin';
import { Language, GridSize, GameMode, Category, Friend, PlayerLeague } from '../types';
import { TOWER_DAILY_COIN_CAP } from '../utils/economy';
import { LeagueBadge } from './LeagueBadge';
import { LeagueInfoModal } from './LeagueInfoModal';
import { computeActiveDeckBuffs } from '../utils/progression';
import { gameServer } from '../utils/gameServer';

interface LobbyProps {
  language: Language;
  onJoin: (roomId: string) => void;
  onCreate: (mode: GameMode, wager: number) => void;
  onQuickMatch?: (mode: GameMode, wager: number) => void;
  onBack: () => void;
  isLoading: boolean;
  size: GridSize;
  setSize: (s: GridSize) => void;
  playerScore: number;
  playerCoins: number;
  onlineFriends?: Friend[];
  friends?: Friend[];
  onChallenge?: (friendId: string, size: GridSize, category: Category) => void;
  playerLeague?: PlayerLeague;

  // Arena props
  pendingGames: { gameId: string; mode: GameMode; wager: number; mine?: boolean }[];
  myPendingGameId: string | null;
  setMyPendingGameId: (v: string | null) => void;
  pendingGamesLoading: string | null;
  setPendingGamesLoading: (v: string | null) => void;
  onArenaCreate: (mode: GameMode, wager: number) => Promise<string | null>;
  onArenaJoin: (gameId: string) => Promise<void>;
  onArenaCancel: (gameId: string) => Promise<void>;
  isArenaJoining: boolean;
  onOpenCollection?: () => void;
}

export const Lobby: React.FC<LobbyProps> = ({
  language,
  onJoin,
  onCreate,
  onQuickMatch,
  onBack,
  isLoading,
  size,
  setSize,
  playerScore,
  playerCoins,
  onlineFriends = [],
  friends = [],
  onChallenge,
  playerLeague,
  pendingGames,
  myPendingGameId,
  setMyPendingGameId,
  pendingGamesLoading,
  setPendingGamesLoading,
  onArenaCreate,
  onArenaJoin,
  onArenaCancel,
  isArenaJoining,
  onOpenCollection,
}) => {
  const [roomIdInput, setRoomIdInput] = useState('');
  const [mode, setMode] = useState<GameMode>('battle');
  const [wager, setWager] = useState<number>(20);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [creatingArena, setCreatingArena] = useState(false);

  // Coin filter state
  const [showAffordableOnly, setShowAffordableOnly] = useState(false);

  // Challenge Dialog State
  const [showLeagueInfo, setShowLeagueInfo] = useState(false);
  const [wagerUnlockDialog, setWagerUnlockDialog] = useState<{ wager: number } | null>(null);

  const isFA = language === 'fa';
  const wagers = [20, 50, 100, 500, 1000];
  const fa = (n: number | string) => String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[+d]);

  // Is the current user waiting for an opponent?
  const isWaiting = myPendingGameId !== null;

  // Can the player cover the currently selected wager? The default is 20 coins,
  // which a fresh or drained account can easily sit below — and in that state the
  // Create button simply went dead, with no explanation of why or what to do.
  const canAffordWager = playerCoins >= wager;
  const shortfall = Math.max(0, wager - playerCoins);
  // Cheapest wager the player can actually afford right now (null = none).
  const cheapestAffordable = [...wagers].sort((a, b) => a - b).find(w => playerCoins >= w) ?? null;

  // Separate the player's OWN listings from joinable ones. `mine` comes from the
  // server because `myPendingGameId` is React state and does not survive a
  // reload — after one, your own game looked joinable and clicking it 404'd
  // (`arenaJoin` refuses a self-join).
  const myGames = pendingGames.filter(g => g.mine || g.gameId === myPendingGameId);
  const otherPendingGames = pendingGames.filter(g => !g.mine && g.gameId !== myPendingGameId);
  const filteredPendingGames = showAffordableOnly
    ? otherPendingGames.filter(g => playerCoins >= g.wager)
    : otherPendingGames;

  const handleCreateArena = async () => {
    if (creatingArena) return;
    setCreatingArena(true);
    const gid = await onArenaCreate(mode, wager);
    setCreatingArena(false);
  };

  const handleCancelArena = async () => {
    if (myPendingGameId) {
      await onArenaCancel(myPendingGameId);
    }
  };

  // ─── JOINABLE GAMES ───────────────────────────────────────
  // Rendered in BOTH lobby states. It used to live only inside the "not
  // waiting" branch, so the moment you created a game the entire list of
  // other players' games vanished and was replaced by the waiting card.
  // Two friends who both hit "create" then sat on "waiting for opponent"
  // forever, each unable to see the other's listing — the only way out was
  // to notice the Cancel button and refund yourself. Keeping the list
  // mounted while waiting lets either player simply join the other.
  const renderJoinableGames = () => (
    <>
      {filteredPendingGames.length === 0 ? (
        <div className="cg-paper p-6 text-center" style={{ borderRadius: 14 }}>
          <p className="text-sm font-bold" style={{ color: 'var(--ink-3)' }}>
            {showAffordableOnly && otherPendingGames.length > 0
              ? (isFA
                  ? `${fa(otherPendingGames.length)} بازی در انتظار است اما سکه کافی ندارید. برای کسب سکه بیشتر برج بی‌نهایت را بازی کنید.`
                  : `${otherPendingGames.length} games waiting, but you can't afford any. Play Tower mode to earn more coins.`
                )
              : myGames.length > 0
                ? (isFA
                    ? 'فقط بازی خودت در لیست است. منتظر باش تا حریف بیاید.'
                    : 'Only your own game is listed. Waiting for an opponent.')
                : (isFA ? 'هیچ بازی در انتظار نیست. اولین نفری باشید که بازی می‌سازد!' : 'No pending games. Be the first to create one!')
            }
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredPendingGames.map(g => {
            const isJoining = pendingGamesLoading === g.gameId;
            const canAfford = playerCoins >= g.wager;
            return (
              <div
                key={g.gameId}
                className="cg-paper p-4 flex items-center justify-between"
                style={{ borderRadius: 14 }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{
                      backgroundColor: 'var(--paper-2)',
                      border: '1px solid var(--paper-well-hair)',
                      color: g.mode === 'battle' ? 'var(--ink-draw)' : 'var(--cg-blue)',
                    }}
                  >
                    {g.mode === 'battle' ? <Swords size={18} /> : <Zap size={18} />}
                  </div>
                  <div>
                    <div className="text-sm font-bold" style={{ color: 'var(--ink)' }}>
                      {g.mode === 'battle'
                        ? (isFA ? 'نبرد' : 'Battle')
                        : (isFA ? 'سرعت' : 'Speed')}
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold" style={{ color: 'var(--ink-win)' }}>
                      <GameCoin size={12} />
                      <span>{isFA ? fa(g.wager) : g.wager} {isFA ? 'سکه' : 'coins'}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onArenaJoin(g.gameId)}
                  disabled={isJoining || !canAfford}
                  className="px-5 py-2 rounded-xl font-black text-xs transition-all flex items-center gap-1.5 active:scale-95 disabled:active:scale-100"
                  style={canAfford ? {
                    backgroundColor: '#5E6E52',
                    color: '#F6F1E7',
                    border: '1px solid #46543C',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,.22), inset 0 -2px 0 rgba(30,40,26,.35), 0 6px 12px -8px rgba(40,50,35,.8)',
                  } : {
                    backgroundColor: 'rgba(36,26,20,.08)',
                    color: 'var(--ink-3)',
                    border: '1px dashed rgba(36,26,20,.22)',
                    cursor: 'not-allowed',
                  }}
                >
                  {isJoining ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Play size={14} fill="currentColor" />
                  )}
                  {isFA ? 'ورود' : 'Join'}
                </button>
                {!canAfford && !isJoining && (
                  <span className="text-[9px] font-bold ms-2" style={{ color: 'var(--ink-3)' }}>
                    {isFA ? 'سکه ناکافی' : 'Low coins'}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );

  return (
    <div
      dir={isFA ? 'rtl' : 'ltr'}
      className="w-full h-full flex flex-col relative overflow-hidden animate-in fade-in duration-500"
      style={{ backgroundColor: 'var(--paper-2)', color: 'var(--ink)' }}
    >

      {/* Soft clay wash, like light falling on a plaster wall */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 25% 12%, rgba(180,105,75,.18), transparent 58%), radial-gradient(circle at 82% 88%, rgba(176,127,34,.14), transparent 56%)',
        }}
      />

      {/* Header */}
      <header dir={isFA ? 'rtl' : 'ltr'} className="px-4 sm:px-6 py-4 flex items-center justify-between gap-3 z-10 shrink-0 animate-[card-enter_0.5s_ease-out]">
        <div className="flex items-center gap-2.5">
          <button
            onClick={onBack}
            className="cg-chip !rounded-full !p-2 transition-all active:scale-95 shrink-0"
            style={{ color: 'var(--ink)' }}
            aria-label={isFA ? 'بازگشت' : 'Back'}
          >
            <ArrowRight size={20} className={isFA ? '' : 'rotate-180'} />
          </button>
          <h1 className="text-xl sm:text-2xl font-black" style={{ color: 'var(--ink)' }}>
            {isFA ? 'بت‌آرینا' : 'BET ARENA'}
          </h1>
        </div>
        <div
          className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full shrink-0"
          style={{
            backgroundColor: 'var(--paper)',
            border: '1px solid rgba(200,149,43,.45)',
            color: 'var(--sand-stamp)',
          }}
        >
          <GameCoin size={14} />
          <span className="tabular-nums">{isFA ? fa(playerCoins) : playerCoins}</span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-20 space-y-5 z-10 scrollbar-hide">

        {/* LEAGUE BADGE + Quick Ranked Match */}
        <div className="flex items-center justify-between gap-3 animate-[card-enter_0.5s_ease-out_0.05s_both]">
          {playerLeague && <LeagueBadge league={playerLeague} language={language} size="md" showProgress showInfoButton onInfoClick={() => setShowLeagueInfo(true)} />}
          <button
            onClick={() => {
              // Ranked Match carries the selected wager too, so gate it on the same
              // balance check as Create rather than firing into a refusal.
              if (!canAffordWager) { setWagerUnlockDialog({ wager }); return; }
              (onQuickMatch || onCreate)(mode, wager);
            }}
            disabled={isLoading}
            className="px-4 py-2 rounded-full font-black text-xs flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 whitespace-nowrap"
            style={{
              background: 'var(--clay-shell)',
              color: '#FFF6EC',
              border: '1px solid #8E4E37',
              boxShadow: 'inset 0 1px 0 rgba(255,226,204,.45), inset 0 -2px 0 rgba(58,30,18,.28), 0 8px 14px -10px rgba(70,40,25,.9)',
            }}
          >
            <Zap size={14} />
            {isFA ? 'مسابقه رنکد' : 'Ranked Match'}
          </button>
        </div>

        {/* ─── ACTIVE 10-SCROLL COMBO RACK IN ONLINE BATTLE ─────── */}
        {(() => {
          const deckBuffs = computeActiveDeckBuffs(gameServer.getLocalEconomyState());
          return (
            <div
              className="cg-paper p-3.5 relative overflow-hidden animate-[card-enter_0.5s_ease-out_0.12s_both]"
              style={{
                borderRadius: 18,
                border: deckBuffs.hasSynergy ? '1.5px solid rgba(176,127,34,.65)' : '1px solid rgba(36,26,20,.16)',
                background: 'linear-gradient(180deg, rgba(252,245,231,.95), rgba(238,224,199,.92))',
              }}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">📜</span>
                  <span className="text-[11px] font-black" style={{ color: '#4A2C14' }}>
                    {isFA
                      ? `قفسهٔ ۱۰ طومار کومبو در نبرد آنلاین (${fa(deckBuffs.cards.length)}/۱۰)`
                      : `Active 10-Scroll Combo (${deckBuffs.cards.length}/10)`}
                  </span>
                  {deckBuffs.hasSynergy && (
                    <span
                      className="px-2 py-0.5 rounded-full text-[9px] font-black"
                      style={{
                        background: 'linear-gradient(180deg,#F7DF9C,#D99E32)',
                        color: '#3F2605',
                        border: '1px solid rgba(122,82,16,.45)',
                      }}
                    >
                      ✨ {isFA ? 'هم‌افزایی کامل' : 'Synergy'}
                    </span>
                  )}
                </div>
                {onOpenCollection && (
                  <button
                    type="button"
                    onClick={onOpenCollection}
                    className="px-2.5 py-1 rounded-full text-[9.5px] font-black text-[#FFF9EE] flex items-center gap-1 shadow-xs active:scale-95 transition-transform whitespace-nowrap"
                    style={{
                      background: 'linear-gradient(180deg, #289E92 0%, #176B62 100%)',
                      border: '1px solid #A7ECE4',
                    }}
                  >
                    <span>📜</span>
                    <span>{isFA ? 'چینش ۱۰ طومار ◀' : 'Edit 10 Scrolls ▶'}</span>
                  </button>
                )}
              </div>

              {deckBuffs.cards.length > 0 ? (
                <div className="flex flex-wrap items-center gap-1 pt-1" style={{ borderTop: '1px dashed rgba(122,82,16,.22)' }}>
                  {deckBuffs.onlineManaChargeBonusPct > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black" style={{ background: 'rgba(58,107,76,.14)', color: '#285238' }}>
                      ⚽ +{fa(deckBuffs.onlineManaChargeBonusPct)}٪ شارژ مانا و -{fa(deckBuffs.onlineAttackDiscountPct)}٪ هزینه حمله
                    </span>
                  )}
                  {deckBuffs.onlineDebuffResistPct > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black" style={{ background: 'rgba(158,70,56,.14)', color: '#7A2E22' }}>
                      🛡️ -{fa(deckBuffs.onlineDebuffResistPct)}٪ زمان انجماد/کوری {deckBuffs.onlineEraseShieldCharges > 0 ? '+ سپر ضدحذف' : ''}
                    </span>
                  )}
                  {deckBuffs.onlineTrophyBonusPct > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black" style={{ background: 'rgba(176,127,34,.16)', color: '#6A4A10' }}>
                      👑 +{fa(deckBuffs.onlineTrophyBonusPct)}٪ تروفی لیگ آنلاین
                    </span>
                  )}
                  {deckBuffs.startingFreeLetterCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black" style={{ background: 'rgba(78,107,114,.16)', color: '#2F4D54' }}>
                      🔮 {fa(deckBuffs.startingFreeLetterCount)} حرف رایگان در شروع
                    </span>
                  )}
                </div>
              ) : (
                <div className="text-[9.5px] font-bold text-start" style={{ color: '#7A5A3C' }}>
                  {isFA
                    ? 'در بخش «کالکشن و تالار طومارها» تا ۱۰ طومار بچینید تا در نبرد آنلاین شارژ مانا، سپر ضدحذف و تروفی بیشتر بگیرید!'
                    : 'Equip up to 10 Master Scrolls in Collection for online battle buffs!'}
                </div>
              )}
            </div>
          );
        })()}

        {/* ─── CREATE / WAITING PANEL ────────────────────────── */}
        {isWaiting ? (
          /* Waiting for opponent state */
          <div
            className="cg-paper p-6 relative overflow-hidden animate-[card-enter_0.5s_ease-out_0.15s_both]"
            style={{ borderRadius: 20, borderColor: 'rgba(176,127,34,.55)' }}
          >
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="relative">
                <Loader2 size={48} className="animate-spin" style={{ color: 'var(--sand-stamp)' }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Clock size={20} style={{ color: 'var(--ink-win)' }} />
                </div>
              </div>
              <h3 className="text-lg font-black" style={{ color: 'var(--ink-win)' }}>
                {isFA ? 'در انتظار حریف...' : 'Waiting for opponent...'}
              </h3>
              <p className="text-sm text-center" style={{ color: 'var(--ink-2)' }}>
                {isFA
                  ? 'بازی شما در لیست میدان قرار گرفت. به محض ورود حریف، بازی شروع می‌شود.'
                  : 'Your game is listed in the arena. The match starts when an opponent joins.'}
              </p>
              <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--ink-2)' }}>
                <Swords size={14} />
                <span>{mode === 'battle' ? (isFA ? 'نبرد' : 'Battle') : (isFA ? 'سرعت' : 'Speed')}</span>
                {wager > 0 && (
                  <>
                    <span>•</span>
                    <GameCoin size={14} />
                    <span>{isFA ? fa(wager) : wager}</span>
                  </>
                )}
              </div>
              <button
                onClick={handleCancelArena}
                className="mt-2 px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 active:scale-95"
                style={{
                  backgroundColor: 'rgba(158,90,80,.12)',
                  border: '1px solid rgba(158,90,80,.5)',
                  color: '#8E4E37',
                }}
              >
                <X size={16} />
                {isFA ? 'لغو بازی و بازگشت سکه' : 'Cancel & Refund'}
              </button>
            </div>

            {/* ─── STILL JOINABLE WHILE WAITING ───────────────
                The joinable list used to vanish the moment you created a game,
                so two friends who both pressed "create" each saw only their own
                waiting card and could never find each other. Keep the list
                mounted: joining someone else's game auto-cancels (and refunds)
                your own listing — see `onArenaJoin` in GameViews.tsx. */}
            {otherPendingGames.length > 0 && (
              <div className="mt-5 pt-4" style={{ borderTop: '1px solid rgba(36,26,20,.14)' }}>
                <p className="text-[10px] font-black mb-2 text-center uppercase tracking-widest" style={{ color: 'var(--ink-3)' }}>
                  {isFA ? 'بازی‌های دیگران — می‌توانی به یکی بپیوندی' : "Other players' games — you can join one"}
                </p>
                {renderJoinableGames()}
              </div>
            )}
          </div>
        ) : (
          /* Create Arena Game panel */
          <div
            className="cg-paper p-6 relative overflow-hidden animate-[card-enter_0.5s_ease-out_0.15s_both]"
            style={{ borderRadius: 20 }}
          >

            <h3 className="text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: 'var(--ink-2)' }}>
              <Swords size={16} /> {isFA ? 'شرط‌بندی جدید' : 'New Wager Game'}
            </h3>

            {/* Mode Switch */}
            <div
              className="grid grid-cols-2 gap-2 mb-4 p-1 rounded-xl"
              style={{ backgroundColor: 'var(--paper-well-2)', border: '1px solid var(--paper-well-hair)' }}
            >
              <button
                onClick={() => setMode('speed')}
                className="py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all"
                style={mode === 'speed' ? {
                  backgroundColor: '#4E6B72',
                  color: '#F6F1E7',
                  border: '1px solid #3C5459',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,.2), inset 0 -2px 0 rgba(24,38,42,.35)',
                } : { color: 'var(--ink-3)' }}
              >
                <Zap size={16} /> <span className="text-[10px] font-black">{isFA ? 'سرعت' : 'Speed'}</span>
              </button>
              <button
                onClick={() => setMode('battle')}
                className="py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all"
                style={mode === 'battle' ? {
                  backgroundColor: '#9E5A50',
                  color: '#FBF1E4',
                  border: '1px solid #7E453D',
                  boxShadow: 'inset 0 1px 0 rgba(255,226,214,.28), inset 0 -2px 0 rgba(60,25,20,.35)',
                } : { color: 'var(--ink-3)' }}
              >
                <Swords size={16} /> <span className="text-[10px] font-black">{isFA ? 'نبرد' : 'Battle'}</span>
              </button>
            </div>

            {/* Wager Chips */}
            <div className="mb-6">
              <span className="text-[10px] font-black block mb-2 text-center uppercase" style={{ color: 'var(--ink-3)' }}>{isFA ? 'مبلغ شرط' : 'Wager Amount'}</span>
              <div className="flex justify-center gap-3">
                {wagers.map(w => {
                    const canAfford = playerCoins >= w;
                    const isSelected = wager === w;
                    return (
                      <button
                        key={w}
                        onClick={() => {
                          if (!canAfford) {
                            setWagerUnlockDialog({ wager: w });
                          } else {
                            setWager(w);
                          }
                        }}
                        className="w-14 h-14 rounded-full flex flex-col items-center justify-center transition-all active:scale-95"
                        style={isSelected ? {
                          backgroundColor: 'rgba(200,149,43,.18)',
                          border: '2px solid var(--sand-stamp)',
                          color: 'var(--sand-stamp)',
                          boxShadow: '0 6px 12px -8px rgba(120,85,20,.8)',
                        } : !canAfford ? {
                          backgroundColor: 'var(--paper-well-2)',
                          border: '2px dashed var(--paper-well-hair)',
                          color: 'var(--ink-3)',
                          opacity: .75,
                        } : {
                          backgroundColor: 'var(--paper-2)',
                          border: '2px solid var(--paper-well-hair)',
                          color: 'var(--ink-2)',
                        }}
                      >
                        {!canAfford ? (
                          <Lock size={14} style={{ color: 'var(--ink-3)' }} />
                        ) : (
                          /* one line: a filled coin glyph at 10px reads as a stray
                             dot when it is stacked under the number, and the filled
                             lucide pair collapses into a blob at this size */
                          <span className="flex items-center gap-1 leading-none">
                            <span className="text-xs font-black tabular-nums">{isFA ? fa(w) : w}</span>
                            <GameCoin size={13} />
                          </span>
                        )}
                      </button>
                    );
                })}
              </div>
            </div>

            {/* ─── INSUFFICIENT COINS ───────────────────────────
                The Create button is disabled when the balance cannot cover the
                selected wager. It used to just go dead (opacity + grayscale) with
                no explanation, so the panel looked broken. Say why, how much is
                missing, offer the affordable alternative, and tell them where
                coins come from. */}
            {!canAffordWager && (
              <div
                className="mb-3 p-3 text-center space-y-1.5"
                style={{
                  borderRadius: 14,
                  border: '1px solid rgba(158,90,80,.45)',
                  backgroundColor: 'rgba(158,90,80,.10)',
                }}
              >
                <p className="text-xs font-black flex items-center justify-center gap-1.5" style={{ color: '#8E4E37' }}>
                  <GameCoin size={14} />
                  {isFA ? 'سکه ناکافی' : 'Not enough coins'}
                </p>
                <p className="text-[11px] font-bold" style={{ color: 'var(--ink-2)' }}>
                  {isFA
                    ? `این شرط ${fa(wager)} سکه می‌خواهد و شما ${fa(playerCoins)} سکه دارید — ${fa(shortfall)} سکه کم دارید.`
                    : `This wager needs ${wager} coins and you have ${playerCoins} — ${shortfall} short.`}
                </p>
                {cheapestAffordable !== null && (
                  <button
                    onClick={() => setWager(cheapestAffordable)}
                    className="text-[11px] font-black px-3 py-1.5 rounded-full transition-colors"
                    style={{
                      backgroundColor: 'rgba(176,127,34,.16)',
                      color: 'var(--ink-win)',
                      border: '1px solid rgba(176,127,34,.5)',
                    }}
                  >
                    {isFA
                      ? `شرط ${fa(cheapestAffordable)} سکه‌ای را انتخاب کن`
                      : `Switch to the ${cheapestAffordable}-coin wager`}
                  </button>
                )}
                <p className="text-[10px] font-bold leading-5 pt-0.5" style={{ color: 'var(--ink-3)' }}>
                  {isFA
                    ? `برای گرفتن سکه: برج بی‌نهایت را بازی کن (هر ۱۲ ساعت یک بلیت رایگان · تا ${TOWER_DAILY_COIN_CAP.toLocaleString('fa-IR')} سکه در روز)، معمای روزانه را بزن، یا مسابقات میدان را ببر.`
                    : `To earn coins: play Endless Tower (free ticket every 12h · up to ${TOWER_DAILY_COIN_CAP} coins/day), play the Daily Puzzle, or win Arena matches.`}
                </p>
              </div>
            )}

            <button
              onClick={handleCreateArena}
              disabled={creatingArena || !canAffordWager}
              className="w-full py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-2 active:scale-95 disabled:active:scale-100"
              style={canAffordWager ? {
                background: 'var(--clay-shell)',
                color: '#FFF6EC',
                border: '1px solid #8E4E37',
                boxShadow: 'inset 0 1px 0 rgba(255,226,204,.5), inset 0 -2px 0 rgba(58,30,18,.3), 0 10px 20px -14px rgba(70,40,25,.9)',
              } : {
                backgroundColor: 'rgba(36,26,20,.07)',
                color: 'var(--ink-3)',
                border: '1px dashed rgba(36,26,20,.22)',
                cursor: 'not-allowed',
              }}
            >
              {creatingArena ? <Loader2 className="animate-spin" /> : <Play fill="currentColor" />}
              {isFA ? 'ساخت و قرار گرفتن در لیست' : 'Create & List'}
            </button>
          </div>
        )}

        {/* ─── PENDING GAMES LIST ──────────────────────────── */}
        <div className="animate-[card-enter_0.5s_ease-out_0.2s_both]">
          <div className="flex items-center justify-between mb-3 gap-2">
            <h3 className="text-sm font-black tracking-widest flex items-center gap-2" style={{ color: 'var(--ink-2)' }}>
              <Users size={16} />
              {isFA ? 'بازی‌های در انتظار' : 'Pending Games'}
            </h3>
            <div className="flex items-center gap-2">
              {/* Coin filter toggle */}
              <button
                onClick={() => setShowAffordableOnly(!showAffordableOnly)}
                className="text-[10px] font-bold px-2.5 py-1 rounded-full transition-all flex items-center gap-1"
                style={showAffordableOnly ? {
                  backgroundColor: 'rgba(176,127,34,.18)',
                  color: 'var(--ink-win)',
                  border: '1px solid rgba(176,127,34,.5)',
                } : {
                  backgroundColor: 'var(--paper-well-2)',
                  color: 'var(--ink-3)',
                  border: '1px solid rgba(36,26,20,.16)',
                }}
              >
                <GameCoin size={12} />
                {isFA ? 'قابل پرداخت' : 'Affordable'}
              </button>
              <span className="text-[10px] font-bold" style={{ color: 'var(--ink-3)' }}>
                {isFA
                  ? fa(showAffordableOnly ? `${filteredPendingGames.length}/${otherPendingGames.length}` : otherPendingGames.length)
                  : (showAffordableOnly ? `${filteredPendingGames.length}/${otherPendingGames.length}` : otherPendingGames.length)}
                {' '}{isFA ? 'بازی' : 'games'}
              </span>
            </div>
          </div>

          {/* ─── YOUR OWN LISTING ─────────────────────────────
              Rendered separately with a DISABLED Join. The server refuses a
              self-join (`arenaJoin` returns null → 404), so the button used to
              look actionable but could only ever fail. `g.mine` is what
              identifies the listing after a reload, when the creator's
              `myPendingGameId` React state is already gone. */}
          {myGames.length > 0 && (
            <div className="space-y-2 mb-3">
              {myGames.map(g => (
                <div
                  key={g.gameId}
                  className="p-4 flex items-center justify-between"
                  style={{
                    borderRadius: 14,
                    backgroundColor: 'var(--paper)',
                    border: '1px solid rgba(200,149,43,.5)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,.7)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: 'rgba(200,149,43,.16)', color: 'var(--ink-win)' }}
                    >
                      <Clock size={18} />
                    </div>
                    <div>
                      <div className="text-sm font-bold" style={{ color: 'var(--ink)' }}>
                        {isFA ? 'بازی خودت' : 'Your own game'}
                      </div>
                      <div className="flex items-center gap-1 text-xs font-bold" style={{ color: 'var(--ink-win)' }}>
                        <GameCoin size={12} />
                        <span>{isFA ? fa(g.wager) : g.wager} {isFA ? 'سکه' : 'coins'}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    disabled
                    title={isFA ? 'نمی‌توانی به بازی خودت بپیوندی — منتظر حریف باش' : 'You cannot join your own game — wait for an opponent'}
                    className="px-5 py-2 rounded-xl font-black text-xs flex items-center gap-1.5"
                    style={{
                      backgroundColor: 'rgba(36,26,20,.08)',
                      color: 'var(--ink-3)',
                      border: '1px dashed rgba(36,26,20,.2)',
                      cursor: 'not-allowed',
                    }}
                  >
                    <Lock size={14} />
                    {isFA ? 'ورود' : 'Join'}
                  </button>
                </div>
              ))}
              <p className="text-[10px] font-bold text-center" style={{ color: 'var(--ink-3)' }}>
                {isFA
                  ? 'بازی خودت در لیست است؛ به‌محض ورود حریف شروع می‌شود.'
                  : 'Your game is listed; it starts as soon as an opponent joins.'}
              </p>
            </div>
          )}

          {renderJoinableGames()}
        </div>

        {/* ─── OR JOIN VIA CODE ──────────────────────────────── */}
        <div className="text-center animate-[card-enter_0.5s_ease-out_0.25s_both]">
          <div className="relative flex items-center py-4">
            <div className="flex-grow" style={{ borderTop: '1px solid rgba(36,26,20,.16)' }}></div>
            <span className="flex-shrink-0 mx-4 font-black text-[10px] uppercase" style={{ color: 'var(--ink-3)' }}>
              {isFA ? 'یا ورود با کد اتاق' : 'OR JOIN VIA CODE'}
            </span>
            <div className="flex-grow" style={{ borderTop: '1px solid rgba(36,26,20,.16)' }}></div>
          </div>

          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="123456"
                className="w-full px-4 py-3 font-mono font-black text-lg text-center focus:outline-none transition-all placeholder:text-[color:var(--ink-3)]"
                style={{
                  borderRadius: 14,
                  backgroundColor: 'var(--paper)',
                  border: joinError ? '2px solid var(--ink-lose)' : '2px solid var(--paper-well-hair)',
                  color: 'var(--ink)',
                  boxShadow: 'inset 0 2px 4px rgba(70,45,30,.08)',
                }}
                value={roomIdInput}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/[^0-9]/g, '').slice(0,6);
                  setRoomIdInput(cleaned);
                  setJoinError(null);
                }}
                onPaste={(e) => {
                  e.preventDefault();
                  const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0,6);
                  if (pasted) { setRoomIdInput(pasted); setJoinError(null); }
                }}
              />
              {joinError && (
                <p className="text-[10px] font-bold mt-1 text-center" style={{ color: '#8E4E37' }}>{joinError}</p>
              )}
            </div>
            <button
              onClick={() => {
                if (!roomIdInput || roomIdInput.length < 4) {
                  setJoinError(isFA ? 'کد اتاق نامعتبر است' : 'Invalid room code');
                  return;
                }
                setJoinError(null);
                onJoin(roomIdInput);
              }}
              disabled={isLoading}
              className="px-6 rounded-2xl font-black transition-all active:scale-95 disabled:opacity-50"
              style={{
                background: 'var(--clay-shell)',
                color: '#FFF6EC',
                border: '1px solid #8E4E37',
                boxShadow: 'inset 0 1px 0 rgba(255,226,204,.45), inset 0 -2px 0 rgba(58,30,18,.28)',
              }}
            >
              {isFA ? 'ورود' : 'Join'}
            </button>
          </div>
        </div>

      </div>

      {showLeagueInfo && playerLeague && (
        <LeagueInfoModal language={language} playerLeague={playerLeague} onClose={() => setShowLeagueInfo(false)} />
      )}

      {/* ─── WAGER UNLOCK DIALOG ───────────────────────────── */}
      {wagerUnlockDialog && ReactDOM.createPortal(
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 animate-in fade-in duration-150" onClick={() => setWagerUnlockDialog(null)}>
          <div className="absolute inset-0" style={{ backgroundColor: 'rgba(36,26,20,.45)', backdropFilter: 'blur(3px)' }} />
          <div
            className="relative w-full max-w-xs cg-paper shadow-2xl p-6 animate-in zoom-in-95 duration-200"
            style={{ borderRadius: 20 }}
            onClick={e => e.stopPropagation()}
            dir={isFA ? 'rtl' : 'ltr'}
          >
            {/* Close button */}
            <button
              onClick={() => setWagerUnlockDialog(null)}
              className="absolute top-3 end-3 p-1.5 rounded-full transition-colors"
              style={{ backgroundColor: 'rgba(36,26,20,.08)', color: 'var(--ink-2)' }}
            >
              <X size={14} />
            </button>

            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center p-2"
                style={{ backgroundColor: 'rgba(200,149,43,.16)', color: 'var(--ink-win)', border: '1px solid rgba(200,149,43,.4)' }}
              >
                <GameCoin size={36} />
              </div>
            </div>

            {/* Title */}
            <h3 className="text-center font-black mb-1" style={{ color: 'var(--ink)' }}>
              {isFA ? 'سکه ناکافی' : 'Not enough coins'}
            </h3>

            {/* Wager amount */}
            <p className="text-center text-sm font-bold mb-4" style={{ color: 'var(--ink-2)' }}>
              {isFA
                ? `شرط ${fa(wagerUnlockDialog.wager)} سکه`
                : `Wager ${wagerUnlockDialog.wager} coins`
              }
            </p>

            {/* Progress bar */}
            <div className="w-full h-2 rounded-full overflow-hidden mb-2" style={{ backgroundColor: 'rgba(36,26,20,.12)' }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min(100, Math.floor((playerCoins / wagerUnlockDialog.wager) * 100))}%`,
                  background: 'linear-gradient(90deg,#B07F22,#E2C079)',
                }}
              />
            </div>

            <p className="text-center text-xs font-bold mb-3" style={{ color: 'var(--ink-3)' }}>
              {isFA
                ? `${fa(playerCoins.toLocaleString())} / ${fa(wagerUnlockDialog.wager.toLocaleString())} سکه`
                : `${playerCoins.toLocaleString()} / ${wagerUnlockDialog.wager.toLocaleString()} coins`
              }
            </p>

            {/* Info message */}
            <div className="p-3 text-center" style={{ borderRadius: 12, backgroundColor: 'rgba(180,105,75,.10)', border: '1px solid rgba(180,105,75,.28)' }}>
              <p className="text-[10px] font-bold leading-5" style={{ color: '#8E4E37' }}>
                {isFA
                  ? `باید ${fa((wagerUnlockDialog.wager - playerCoins).toLocaleString())} سکه دیگر جمع کنید تا بتوانید در این شرط‌بندی شرکت کنید. سکه را می‌توانید از برج بی‌نهایت و مسابقات میدان بدست آورید.`
                  : `You need ${(wagerUnlockDialog.wager - playerCoins).toLocaleString()} more coins to join this wager. Earn coins in Tower mode and Arena matches.`
                }
              </p>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
