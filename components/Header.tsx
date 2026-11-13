import React from 'react';
import { Timer, TrendingUp, Users, Home } from 'lucide-react';
import { Language, GameView, PlayerState, MultiPlayerInfo } from '../types';
import { TowerHearts } from './TowerHearts';
import { LoadingStage } from '../types';
import { getLeague } from '../services/league';
import { usePressHold } from '../hooks/usePressHold';

const faNum = (value: string | number) =>
  String(value).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[+d]);

import { topbar, topbarOnline } from './pressTiles';
import { PressArt } from './PressArt';
import { FantasyScoreIcon } from './FantasyIcons';
import { GameCoin } from './GameCoin';
import { AvatarRenderer } from './AvatarRenderer';
import { ClayPiggyJarBadge, ClayPiggyBankModal } from './ClayPiggyBankModal';
import { PWAInstallButton } from './PWAInstallButton';

/* The slot bar is its own artwork (`public/images/game/topbar.webp` &
   `topbar-online.webp`, 768x136). Everything visible on it — clay, pills,
   recesses, the dial ring, the sun — is printed, so the live layer only places
   values, the recessed `PressArt` tiles (`public/images/game/press/bar*.webp`),
   and invisible hit areas inside the hollows the print left empty. Coordinates
   below are pixels of that 768x136 crop (from `scripts/press-panels.py`). */
const BAR = { w: 768, h: 136 } as const;
const pctOf = (v: number, total: number) => `${(v / total) * 100}%`;
const barRect = (x: number, y: number, w: number, h: number): React.CSSProperties => ({
  left: pctOf(x, BAR.w),
  top: pctOf(y, BAR.h),
  width: pctOf(w, BAR.w),
  height: pctOf(h, BAR.h),
});

const BAR_SLOTS = {
  avatar: barRect(640, 24.5, 94, 87),
  home: barRect(576, 44, 44, 45),
  flip: barRect(533, 44, 44, 45),
  bulb: barRect(490, 44, 44, 45),
  pursePill: barRect(39, 45, 145, 51),
  purseDigits: barRect(92, 48, 86, 44),
  clock: barRect(394, 44, 58, 52),
  scorePill: barRect(216, 44, 140, 52),
};

const DEFAULT_AVATAR_BOX_CONFIG = {
  leftPct: 81.54,
  topPct: 1.22,
  widthPct: 11.10,
  heightPct: 7.65,
  imgScale: 135,
  imgOffsetX: 0,
  imgOffsetY: 0,
  objectFit: 'cover' as 'cover' | 'fill' | 'contain',
  withClayBacking: true,
};

function readAvatarBoxConfig() {
  try {
    const saved = localStorage.getItem('avatar_box_config');
    if (saved) {
      const parsed = JSON.parse(saved);
      const left = Math.min(92, Math.max(70, Number(parsed.leftPct) || 81.54));
      const top = Math.min(12, Math.max(-2, Number(parsed.topPct) || 1.22));
      const width = Math.min(22, Math.max(6, Number(parsed.widthPct) || 11.10));
      const height = Math.min(18, Math.max(4, Number(parsed.heightPct) || 7.65));
      const scale = parsed.imgScale === 100 ? 135 : (parsed.imgScale || 135);
      return {
        ...DEFAULT_AVATAR_BOX_CONFIG,
        ...parsed,
        leftPct: left,
        topPct: top,
        widthPct: width,
        heightPct: height,
        imgScale: scale,
        objectFit: (parsed.objectFit || 'cover') as 'cover' | 'fill' | 'contain',
        withClayBacking: parsed.withClayBacking ?? true,
      };
    }
  } catch {}
  return DEFAULT_AVATAR_BOX_CONFIG;
}

/* Extracted so the poster screen can hang the very same bar inside its own
   artwork frame: the slots, the live values and the hit areas stay one copy. */
export interface PosterTopBarProps {
  language: Language;
  player: PlayerState | null;
  seconds: number;
  score: number;
  opponent?: MultiPlayerInfo | null;
  opponentScore?: number;
  onProfileClick?: () => void;
  onHomeClick?: () => void;
  onOpenShop?: () => void;
  onHint?: () => void;
  canToggleDirection?: boolean;
  onToggleDirection?: () => void;
  /** inside the poster frame the bar is pinned to the artwork, not to a max-width */
  fill?: boolean;
}

export const PosterTopBar: React.FC<PosterTopBarProps> = ({
  language,
  player,
  seconds,
  score,
  opponent = null,
  opponentScore = 0,
  onProfileClick,
  onHomeClick,
  onOpenShop,
  onHint,
  canToggleDirection = false,
  onToggleDirection,
  fill = false,
}) => {
  const isFA = language === 'fa';
  const { down, bind } = usePressHold();
  const avatarConfig = React.useMemo(() => readAvatarBoxConfig(), [player?.avatar]);
  const avatarSlotStyle = React.useMemo(() => {
    const wScale = avatarConfig.widthPct / DEFAULT_AVATAR_BOX_CONFIG.widthPct;
    const hScale = avatarConfig.heightPct / DEFAULT_AVATAR_BOX_CONFIG.heightPct;
    const baseW = 94 * wScale;
    const baseH = 87 * hScale;
    const baseCx = 687.0;
    const baseCy = 68.0;
    return barRect(baseCx - baseW / 2, baseCy - baseH / 2, baseW, baseH);
  }, [avatarConfig]);
  const clock = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  const shownClock = isFA ? faNum(clock) : clock;
  /* the tan pill is narrow and its hollow is small: at this type size the
     thousands separator paints as a diamond, so the count stays bare digits */
  const purse = isFA ? faNum(player?.coins ?? 0) : String(player?.coins ?? 0);
  const nothingScored = score === 0 && !!opponent && opponentScore === 0;
  const flipReady = canToggleDirection && !!onToggleDirection;
  const isOnline = !!opponent;
  const panel = isOnline ? topbarOnline : topbar;

  return (
    <div
      className="cg-postbar mx-auto"
      dir={isFA ? 'rtl' : 'ltr'}
      style={fill ? { maxWidth: 'none' } : undefined}
    >
      <img
        className="cg-postbar-art"
        src={isOnline ? '/images/game/topbar-online.webp' : '/images/game/topbar.webp'}
        alt=""
        aria-hidden
        draggable={false}
      />

      {/* right to left, exactly as the clay is modelled: avatar, home, flip,
          bulb, dial, score pill, purse */}
      <PressArt panel={panel} id="bar-avatar" down={down === 'avatar'} />
      <button
        type="button"
        onClick={onProfileClick}
        className={`cg-postbar-hit is-round flex items-center justify-center group${down === 'avatar' ? ' is-down' : ''}`}
        style={avatarSlotStyle}
        aria-label={isFA ? 'پروفایل' : 'Profile'}
        title={opponent?.name ?? player?.name}
        {...bind('avatar')}
      >
        <AvatarRenderer
          avatar={player?.avatar}
          framelessOnKhaki={!avatarConfig.withClayBacking}
          withClayBacking={avatarConfig.withClayBacking}
          objectFit={avatarConfig.objectFit}
          imageScale={avatarConfig.imgScale / 100}
          imageOffsetX={avatarConfig.imgOffsetX}
          imageOffsetY={avatarConfig.imgOffsetY}
          className="w-full h-full group-hover:scale-105 transition-transform pointer-events-none"
        />
      </button>

      <PressArt panel={panel} id="bar-home" down={down === 'home'} />
      <button
        type="button"
        onClick={onHomeClick}
        className={`cg-postbar-hit is-round${down === 'home' ? ' is-down' : ''}`}
        style={BAR_SLOTS.home}
        aria-label={isFA ? 'خانه' : 'Home'}
        {...bind('home')}
      />

      <PressArt panel={panel} id="bar-flip" down={flipReady && down === 'flip'} />
      <button
        type="button"
        onClick={onToggleDirection}
        disabled={!flipReady}
        className={`cg-postbar-hit is-round${flipReady ? '' : ' is-off'}${down === 'flip' ? ' is-down' : ''}`}
        style={BAR_SLOTS.flip}
        aria-label={isFA ? 'چرخش جهت' : 'Flip direction'}
        {...bind('flip')}
      />

      <PressArt panel={panel} id="bar-bulb" down={!!onHint && down === 'bulb'} />
      <button
        type="button"
        onClick={onHint}
        disabled={!onHint}
        className={`cg-postbar-hit is-round${down === 'bulb' ? ' is-down' : ''}`}
        style={BAR_SLOTS.bulb}
        aria-label={isFA ? 'راهنما' : 'Hint'}
        {...bind('bulb')}
      />

      <div className="cg-postbar-val cg-postbar-clock" style={BAR_SLOTS.clock} aria-label={isFA ? 'زمان' : 'Time'}>
        {shownClock}
      </div>

      {/* mine, then the rival's after a rose dot. Solo with nothing scored yet
          leaves the pill with the score icon; an empty duel shows one centred
          dash — two dashes read as a dashed line. */}
      <div
        className="cg-postbar-val cg-postbar-score"
        style={BAR_SLOTS.scorePill}
        title={opponent
          ? (isFA ? `تو ${faNum(score)} — ${opponent.name} ${faNum(opponentScore)}` : `You ${score} — ${opponent.name} ${opponentScore}`)
          : (isFA ? 'امتیاز' : 'Score')}
      >
        <FantasyScoreIcon className="cg-postbar-score-icon" />
        {!opponent && score === 0 ? (
          <span className="is-zero">{isFA ? faNum(0) : '0'}</span>
        ) : nothingScored ? (
          <span className="cg-postbar-dash">—</span>
        ) : (
          <>
            <span className={score === 0 ? 'is-zero' : undefined}>{isFA ? faNum(score) : score}</span>
            {opponent && (
              <>
                <i className="cg-postbar-dot" aria-hidden />
                <span className="cg-postbar-foe">{isFA ? faNum(opponentScore) : opponentScore}</span>
              </>
            )}
          </>
        )}
      </div>

      <PressArt panel={panel} id="bar-purse" down={down === 'purse'} />
      <button
        type="button"
        onClick={onOpenShop}
        className={`cg-postbar-hit is-pill${down === 'purse' ? ' is-down' : ''}`}
        style={BAR_SLOTS.pursePill}
        aria-label={isFA ? 'فروشگاه' : 'Shop'}
        {...bind('purse')}
      >
        <GameCoin
          className={`cg-postbar-coin${down === 'purse' ? ' is-pressed' : ''}`}
        />
      </button>
      <div
        className={`cg-postbar-val cg-postbar-purse${down === 'purse' ? ' is-pressed' : ''}`}
        style={BAR_SLOTS.purseDigits}
        aria-hidden
      >
        {purse}
      </div>
    </div>
  );
};

interface HeaderProps {
  view: GameView;
  currentGameMode: string;
  language: Language;
  player: PlayerState | null;
  loadingStage: LoadingStage;
  hasGrid: boolean;
  seconds: number;
  towerLives?: number;
  towerMaxLives?: number;
  towerFloor: number;
  towerLoot: number;
  towerTimeLimit?: number;
  livesShaking: boolean;
  hasShield: boolean;
  notificationCount: number;
  onProfileClick: () => void;
  onHomeClick: () => void;
  onSocialClick: () => void;
  onOpenShop: () => void;
  onShowAuth: () => void;
  onCollectionClick?: () => void;
  onPlayerUpdate?: (player: PlayerState) => void;
  /** Solo play renders the game screen as one clay console, so the ledge becomes the mockup's slot bar. */
  clay?: boolean;
  score?: number;
  combo?: number;
  onHint?: () => void;
  canToggleDirection?: boolean;
  onToggleDirection?: () => void;
  /** online: the rival rides on the avatar and in the score pill, as in the artwork */
  opponent?: MultiPlayerInfo | null;
  opponentScore?: number;
}

export const Header: React.FC<HeaderProps> = ({
  view,
  currentGameMode,
  language,
  player,
  loadingStage,
  hasGrid,
  seconds,
  towerLives,
  towerMaxLives,
  towerFloor,
  towerLoot,
  towerTimeLimit,
  livesShaking,
  hasShield,
  notificationCount,
  onProfileClick,
  onHomeClick,
  onSocialClick,
  onOpenShop,
  onShowAuth,
  onCollectionClick,
  onPlayerUpdate,
  clay = false,
  score = 0,
  onHint,
  canToggleDirection = false,
  onToggleDirection,
  opponent = null,
  opponentScore = 0,
}) => {
  const isPlaying = view === 'playing';
  const isTower = isPlaying && currentGameMode === 'tower';
  const isLoading = loadingStage !== 'idle';
  const isFA = language === 'fa';
  const trophies = player?.league?.trophies ?? 0;
  const scoreShown = player?.score ?? 0;
  const [showPiggyModal, setShowPiggyModal] = React.useState(false);
  const [inGamePiggyPop, setInGamePiggyPop] = React.useState<{ added: number; total: number } | null>(null);

  React.useEffect(() => {
    const onPiggyCoin = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && detail.added > 0) {
        setInGamePiggyPop({ added: detail.added, total: detail.total });
        const t = setTimeout(() => setInGamePiggyPop(null), 1450);
        return () => clearTimeout(t);
      }
    };
    window.addEventListener('cg-piggy-coin', onPiggyCoin);
    return () => window.removeEventListener('cg-piggy-coin', onPiggyCoin);
  }, []);

  /* === the mockup's own slot bar ===
     `topbar*.webp` is the approved artwork pixel for pixel: the clay ledge, the
     blue avatar, the rose rival badge, the three carved recesses, the dial, the
     sage and cream pills. The printed numbers were lifted out of it, so the only
     things laid on top are the run's live values and invisible hit areas. */
  if (clay && isPlaying && hasGrid) {
    return (
      <header className={`relative shrink-0 z-50 px-2 pt-2 pb-1 transition-opacity duration-300 ${isLoading ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <PosterTopBar
          language={language}
          player={player}
          seconds={seconds}
          score={score}
          opponent={opponent}
          opponentScore={opponentScore}
          onProfileClick={onProfileClick}
          onHomeClick={onHomeClick}
          onOpenShop={onOpenShop}
          onHint={onHint}
          canToggleDirection={canToggleDirection}
          onToggleDirection={onToggleDirection}
        />
        {inGamePiggyPop && (
          <div
            dir="rtl"
            className="pointer-events-none absolute left-4 -bottom-5 z-50 flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#239693] via-[#1B7573] to-[#4A2508] px-3 py-1 text-[11px] font-black text-[#FFF5CC] border-2 border-[#F5B82E] shadow-[0_6px_16px_rgba(0,0,0,0.45)] animate-bounce"
          >
            <span>🏺 +{faNum(inGamePiggyPop.added)} سکه در خمره!</span>
            <span className="text-[#FFD666] opacity-90">({faNum(inGamePiggyPop.total)}/۱۵۰۰)</span>
          </div>
        )}
      </header>
    );
  }

  return (
    <>
      <header
        dir={isFA ? 'rtl' : 'ltr'}
        className={`cg-header px-2 sm:px-4 h-[50px] sm:h-[58px] flex items-center justify-between gap-1.5 sm:gap-2 sticky top-0 z-50 shrink-0 transition-all duration-300 ${
          isLoading && isPlaying ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        {/* Start Zone (Right in RTL) — Player Identity Pill or Tower Hearts */}
        <div className="flex items-center min-w-0 shrink">
          {isTower && towerLives !== undefined && towerMaxLives !== undefined ? (
            <TowerHearts
              lives={towerLives}
              maxLives={towerMaxLives}
              shield={hasShield}
              livesShaking={livesShaking}
            />
          ) : (
            <button
              type="button"
              onClick={onProfileClick}
              className="cg-chip h-[34px] sm:h-[38px] !rounded-full !py-1 !ps-1 !pe-2.5 sm:!pe-3 flex items-center gap-1.5 sm:gap-2 hover:brightness-[1.03] active:scale-95 transition-all max-w-full"
            >
              <div className="relative shrink-0">
                <AvatarRenderer avatar={player?.avatar} size={26} />
                <span
                  title={isFA ? ((player?.isOnline ?? true) ? 'آنلاین' : 'آفلاین') : 'Online Status'}
                  className={`
                    absolute -bottom-0.5 -left-0.5 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full border-[1.5px] border-[#FCF6E9]
                    ${(player?.isOnline ?? true) ? 'bg-[#2E8B57]' : 'bg-[#B85A4B]'}
                  `}
                />
              </div>
              <div className="flex flex-col items-start justify-center leading-none min-w-0">
                <div className="flex items-center gap-1 max-w-full">
                  <span
                    className="text-[10.5px] sm:text-[11px] font-black truncate max-w-[78px] sm:max-w-[160px]"
                    style={{ color: 'var(--cg-ink)' }}
                  >
                    {player?.name || (isFA ? 'پهلوان' : 'Player')}
                  </span>
                  {!!trophies && (
                    <span className="text-[10px] sm:text-[11px] leading-none shrink-0">{getLeague(trophies).icon}</span>
                  )}
                </div>
                <div className="flex items-center gap-1 sm:gap-1.5 whitespace-nowrap mt-0.5">
                  {!!trophies && (
                    <span className="font-black text-[9px] sm:text-[9.5px] tabular-nums" style={{ color: 'var(--cg-blue)' }}>
                      {faNum(trophies)}
                    </span>
                  )}
                  <span className="hidden sm:inline font-bold text-[9px]" style={{ color: 'var(--cg-ink3)' }}>
                    {isFA ? `${faNum(scoreShown)} امتیاز` : `${scoreShown} pts`}
                  </span>
                </div>
              </div>
            </button>
          )}
        </div>

        {/* Center Zone — Only active during gameplay (Timer & Tower Floor) */}
        {isPlaying && hasGrid && (
          <div className="flex items-center gap-1.5 shrink-0">
            {isTower && towerFloor > 0 && (
              <div className="cg-chip h-[34px] !py-0.5 !px-2.5 !rounded-full flex items-center gap-1">
                <TrendingUp size={12} style={{ color: 'var(--cg-amber)' }} />
                <span className="text-[10px] font-black" style={{ color: 'var(--cg-ink)' }}>
                  {isFA ? `طبقه ${faNum(towerFloor)}` : `Floor ${towerFloor}`}
                </span>
              </div>
            )}

            {(() => {
              const remaining = towerTimeLimit ? Math.max(0, towerTimeLimit - seconds) : null;
              const isCountdown = remaining !== null;
              const isLowTime = isCountdown && remaining <= 30;
              const isCriticalTime = isCountdown && remaining <= 10;

              return (
                <div
                  className={`cg-timer h-[34px] sm:h-[38px] flex items-center gap-1.5 px-2.5 sm:px-3 !rounded-full border transition-all ${
                    isCriticalTime ? 'animate-pulse' : ''
                  }`}
                  style={
                    isCriticalTime
                      ? { background: 'rgba(163,74,58,.14)', borderColor: 'rgba(163,74,58,.48)' }
                      : isLowTime
                      ? { background: 'rgba(200,149,43,.16)', borderColor: 'rgba(200,149,43,.48)' }
                      : undefined
                  }
                >
                  <Timer
                    size={14}
                    className={isCriticalTime ? 'animate-bounce' : ''}
                    style={{
                      color: isCriticalTime
                        ? '#a32a2d'
                        : isLowTime
                        ? '#8a5a00'
                        : towerTimeLimit
                        ? 'var(--cg-amber)'
                        : 'var(--cg-blue)',
                    }}
                  />
                  <span
                    className="font-mono font-black text-xs sm:text-sm tabular-nums"
                    style={{ color: isCriticalTime ? '#8f2338' : 'var(--cg-ink)' }}
                  >
                    {isCountdown
                      ? (() => {
                          const m = Math.floor(remaining / 60);
                          const s = remaining % 60;
                          return `${m}:${s.toString().padStart(2, '0')}`;
                        })()
                      : `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`}
                  </span>
                </div>
              );
            })()}
          </div>
        )}

        {/* End Zone (Left in RTL) — Unified 34px/38px Treasury & Navigation Cluster */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {!isPlaying && <PWAInstallButton />}
          {!isPlaying && view !== 'collection' && onCollectionClick && (
            <button
              type="button"
              onClick={onCollectionClick}
              className="cg-chip h-[34px] sm:h-[38px] !rounded-full !py-1 !px-2 sm:!px-2.5 flex items-center gap-1 hover:brightness-[1.03] active:scale-95 transition-all"
              title={isFA ? 'کالکشن کارت‌ها و کارگاه کومبو' : 'Card Collection & Combo Studio'}
            >
              <span className="text-xs leading-none">🃏</span>
              <span className="text-[10px] sm:text-[10.5px] font-black" style={{ color: 'var(--cg-ink)' }}>
                {isFA ? 'کومبو' : 'Cards'}
              </span>
            </button>
          )}

          {player && (
            <ClayPiggyJarBadge
              compact
              language={language}
              onClick={() => setShowPiggyModal(true)}
            />
          )}

          {isTower && towerLoot > 0 && (
            <div className="cg-chip coin h-[34px] sm:h-[38px] !rounded-full !py-1 !px-2 sm:!px-2.5 flex items-center gap-1">
              <GameCoin className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="text-[10.5px] sm:text-xs font-black tabular-nums">{isFA ? faNum(towerLoot) : towerLoot}</span>
            </div>
          )}

          {player && (
            <button
              type="button"
              onClick={onOpenShop}
              className="cg-chip coin h-[34px] sm:h-[38px] !rounded-full !py-1 !ps-1.5 !pe-2 sm:!ps-2 sm:!pe-2.5 flex items-center gap-1 sm:gap-1.5 hover:brightness-[1.03] active:scale-95 transition-all"
              aria-label={isFA ? 'فروشگاه و خزانه سکه' : 'Shop'}
            >
              <GameCoin className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="text-[10.5px] sm:text-xs font-black tabular-nums">
                {isFA ? faNum(player.coins) : player.coins}
              </span>
            </button>
          )}

          {view === 'menu' && player ? (
            <button
              type="button"
              onClick={() => {
                if (!player.isOnline) onShowAuth();
                else onSocialClick();
              }}
              aria-label={isFA ? 'دوستان و چت' : 'Social'}
              className="cg-chip !rounded-full !p-0 w-[34px] h-[34px] sm:w-[38px] sm:h-[38px] flex items-center justify-center relative transition-all hover:brightness-[1.03] active:scale-95 shrink-0"
            >
              <Users size={16} style={{ color: 'var(--cg-ink)' }} />
              {notificationCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 text-[9px] font-black rounded-full flex items-center justify-center shadow-md tabular-nums"
                  style={{ backgroundColor: '#A8463C', color: '#FBF3E6', border: '1.5px solid #FBF4E7' }}
                >
                  {notificationCount > 99 ? '99+' : notificationCount}
                </span>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={onHomeClick}
              aria-label={isFA ? 'بازگشت به خانه' : 'Home'}
              className="cg-chip !rounded-full !p-0 w-[34px] h-[34px] sm:w-[38px] sm:h-[38px] flex items-center justify-center transition-all hover:brightness-[1.03] active:scale-95 shrink-0"
            >
              <Home size={16} style={{ color: 'var(--cg-ink)' }} />
            </button>
          )}
        </div>
      </header>

      {player && showPiggyModal && (
        <ClayPiggyBankModal
          isOpen={showPiggyModal}
          onClose={() => setShowPiggyModal(false)}
          player={player}
          language={language}
          onPlayerUpdate={(updated) => {
            onPlayerUpdate?.(updated);
          }}
        />
      )}
    </>
  );
};
