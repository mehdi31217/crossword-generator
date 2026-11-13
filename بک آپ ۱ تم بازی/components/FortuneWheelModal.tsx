import React, { useEffect, useRef, useState } from 'react';
import { Loader2, Sparkles, Play, Info, Check } from 'lucide-react';
import { Language, PlayerState } from '../types';
import { WHEEL_WEDGES, SHOP_PRICES, type WheelWedgeDef } from '../utils/economy';
import { gameServer } from '../utils/gameServer';
import type { EconomyStateView } from '../utils/progression';
import { GameCoin } from './GameCoin';
import { InkClose, CornerFlorets } from './InkIcons';

interface FortuneWheelModalProps {
  isOpen: boolean;
  language: Language;
  player: PlayerState | null;
  onClose: () => void;
  onPlayerSync: (patch: Partial<PlayerState>) => void;
}

// Rich Persian Miniature & Terracotta Palette for the 8 slices
const WEDGE_STYLES: Array<{
  bgStart: string;
  bgEnd: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
}> = [
  {
    // 0: 15 Coins — Warm Bone Parchment
    bgStart: '#F5E9D4',
    bgEnd: '#DFC9A8',
    textPrimary: '#2B1608',
    textSecondary: '#6E4522',
    accent: '#C88C32',
  },
  {
    // 1: 25 Coins — Persian Ochre Gold
    bgStart: '#ECCB82',
    bgEnd: '#CFA048',
    textPrimary: '#2A1506',
    textSecondary: '#5A3210',
    accent: '#8F5812',
  },
  {
    // 2: 35 Coins — Sage Celadon Clay
    bgStart: '#B2C59E',
    bgEnd: '#839B6D',
    textPrimary: '#1A2812',
    textSecondary: '#354B27',
    accent: '#4E6B3A',
  },
  {
    // 3: 45 Coins — Baked Terracotta Clay
    bgStart: '#D98B68',
    bgEnd: '#B5603C',
    textPrimary: '#FFF8EE',
    textSecondary: '#F8DFC8',
    accent: '#6E2B12',
  },
  {
    // 4: 1 Tower Ticket — Persian Turquoise / Dusty Lapis
    bgStart: '#92B4C2',
    bgEnd: '#638999',
    textPrimary: '#122630',
    textSecondary: '#264554',
    accent: '#2D596B',
  },
  {
    // 5: 90 Coins — Royal Saffron Amber
    bgStart: '#F2CC78',
    bgEnd: '#CE9632',
    textPrimary: '#2B1506',
    textSecondary: '#5C320E',
    accent: '#8A4E0E',
  },
  {
    // 6: 1 Streak Freeze — Emerald Cypress
    bgStart: '#9EB88C',
    bgEnd: '#6F8B5C',
    textPrimary: '#182610',
    textSecondary: '#314924',
    accent: '#426130',
  },
  {
    // 7: 250 Coins Jackpot — Imperial Crimson & Gold
    bgStart: '#8E2A1B',
    bgEnd: '#5C160C',
    textPrimary: '#FFE8A3',
    textSecondary: '#F6C868',
    accent: '#F5C452',
  },
];

// Concise, guaranteed non-overflowing 2-line labels for each of the 8 wedges
function getCompactWedgeLines(
  wedge: WheelWedgeDef,
  isFA: boolean,
  fmt: (v: number) => string
): { line1: string; line2: string } {
  switch (wedge.id) {
    case 'w_coins_15':
      return { line1: fmt(15), line2: isFA ? 'سکه' : 'COINS' };
    case 'w_coins_25':
      return { line1: fmt(25), line2: isFA ? 'سکه' : 'COINS' };
    case 'w_coins_35':
      return { line1: fmt(35), line2: isFA ? 'سکه' : 'COINS' };
    case 'w_coins_45':
      return { line1: fmt(45), line2: isFA ? 'سکه' : 'COINS' };
    case 'w_ticket_1':
      return {
        line1: isFA ? `${fmt(1)} بلیت` : '1 TICKET',
        line2: isFA ? 'برج' : 'TOWER',
      };
    case 'w_coins_90':
      return { line1: fmt(90), line2: isFA ? 'سکه' : 'COINS' };
    case 'w_shield_1':
    case 'w_freeze_1':
      return {
        line1: isFA ? `${fmt(1)} سپر` : '1 SHIELD',
        line2: isFA ? 'زنجیره' : 'STREAK',
      };
    case 'w_jackpot':
    case 'w_jackpot_250':
      return {
        line1: fmt(250),
        line2: isFA ? 'سکه طلا!' : 'JACKPOT!',
      };
    default:
      return {
        line1: fmt(wedge.coins || wedge.tickets || wedge.count || 1),
        line2: isFA ? 'جایزه' : 'PRIZE',
      };
  }
}

// Synthesized Web Audio API wooden/clay peg tick & win fanfare (safe no-op if audio blocked)
function playPegTick(pitchFactor = 1) {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(520 * pitchFactor, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.038);
    gain.gain.setValueAtTime(0.14, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.042);
    setTimeout(() => ctx.close().catch(() => {}), 80);
  } catch {}
}

function playWinFanfare(isJackpot: boolean) {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const notes = isJackpot ? [523.25, 659.25, 783.99, 1046.5] : [523.25, 659.25, 783.99];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      const t0 = ctx.currentTime + idx * 0.09;
      osc.frequency.setValueAtTime(freq, t0);
      gain.gain.setValueAtTime(0.16, t0);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + 0.36);
    });
    setTimeout(() => ctx.close().catch(() => {}), 900);
  } catch {}
}

export const FortuneWheelModal: React.FC<FortuneWheelModalProps> = ({
  isOpen,
  language,
  player,
  onClose,
  onPlayerSync,
}) => {
  const isFA = language === 'fa';
  const fmt = (v: number) =>
    isFA ? String(v).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[+d]) : String(v);

  const [economy, setEconomy] = useState<EconomyStateView>(() =>
    gameServer.getLocalEconomyState()
  );
  const [spinning, setSpinning] = useState(false);
  const [watchingAd, setWatchingAd] = useState(false);
  const [adSecondsLeft, setAdSecondsLeft] = useState(0);
  const [rotationDeg, setRotationDeg] = useState(0);
  const [wonWedge, setWonWedge] = useState<WheelWedgeDef | null>(null);
  const [wonIndex, setWonIndex] = useState<number | null>(null);
  const [errorNote, setErrorNote] = useState<string | null>(null);
  const [showOdds, setShowOdds] = useState(false);
  const [pointerKick, setPointerKick] = useState(false);
  const [rimPhase, setRimPhase] = useState(0);
  const tickTimersRef = useRef<number[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    setWonWedge(null);
    setWonIndex(null);
    setErrorNote(null);
    setEconomy(gameServer.getLocalEconomyState());
    if (player && player.id !== 'guest') {
      gameServer.getProgress().then((snap) => {
        if (snap?.economy) setEconomy(snap.economy);
      });
    }
    return () => {
      tickTimersRef.current.forEach((id) => window.clearTimeout(id));
      tickTimersRef.current = [];
    };
  }, [isOpen, player?.id]);

  // Chasing rim lights while spinning
  useEffect(() => {
    if (!spinning) return;
    const iv = window.setInterval(() => {
      setRimPhase((p) => (p + 1) % 2);
    }, 160);
    return () => window.clearInterval(iv);
  }, [spinning]);

  if (!isOpen || !player) return null;

  const schedulePointerTicks = () => {
    tickTimersRef.current.forEach((id) => window.clearTimeout(id));
    tickTimersRef.current = [];
    // 26 decelerating peg ticks over 3.65s following cubic-bezier(0.12, 0.84, 0.16, 1)
    const totalTicks = 26;
    for (let i = 0; i < totalTicks; i++) {
      const progress = i / (totalTicks - 1);
      // Ease-in time spacing so ticks start rapid and slow down dramatically at the end
      const timeMs = Math.round(Math.pow(progress, 2.15) * 3520);
      const tId = window.setTimeout(() => {
        setPointerKick(true);
        playPegTick(1.12 - progress * 0.25);
        const resetId = window.setTimeout(() => setPointerKick(false), 65);
        tickTimersRef.current.push(resetId);
      }, timeMs);
      tickTimersRef.current.push(tId);
    }
  };

  const executeSpin = async (mode: 'free' | 'ad' | 'paid') => {
    if (spinning || watchingAd) return;
    setErrorNote(null);
    setWonWedge(null);
    setWonIndex(null);

    if (mode === 'ad') {
      setWatchingAd(true);
      setAdSecondsLeft(3);
      await new Promise<void>((resolve) => {
        let sec = 3;
        const timer = window.setInterval(() => {
          sec -= 1;
          setAdSecondsLeft(sec);
          if (sec <= 0) {
            window.clearInterval(timer);
            resolve();
          }
        }, 900);
      });
      setWatchingAd(false);
    }

    setSpinning(true);
    const res = await gameServer.spinFortuneWheel(player, mode);
    if (!res.ok || typeof res.wedgeIndex !== 'number' || !res.wedge) {
      setSpinning(false);
      setErrorNote(res.error || (isFA ? 'خطا در چرخش گردونه' : 'Spin failed'));
      return;
    }

    // 8 wedges = 45 deg each. Wedge i is centered at i * 45 + 22.5 deg clockwise.
    // Pointer is at top (0 deg), so to bring wedge i to the top we rotate to:
    // 360 - (wedgeIndex * 45 + 22.5) + 6 full turns (2160 deg)
    const sliceAngle = 360 / WHEEL_WEDGES.length;
    const targetStopAngle = 360 - (res.wedgeIndex * sliceAngle + sliceAngle / 2);
    const currentBase = Math.ceil(rotationDeg / 360) * 360;
    const nextDeg = currentBase + 2160 + targetStopAngle;
    setRotationDeg(nextDeg);
    schedulePointerTicks();

    const finishTimer = window.setTimeout(async () => {
      setSpinning(false);
      setPointerKick(false);
      setWonWedge(res.wedge!);
      setWonIndex(res.wedgeIndex!);
      playWinFanfare(res.wedge?.kind === 'jackpot');
      if (res.economy) setEconomy(res.economy);
      onPlayerSync({
        ...(typeof res.coins === 'number' ? { coins: res.coins } : {}),
        ...(res.items ? { items: res.items } : {}),
        ...(typeof res.towerTickets === 'number'
          ? { towerTickets: res.towerTickets }
          : {}),
      });
      try {
        const { default: confetti } = await import('canvas-confetti');
        confetti({
          particleCount: res.wedge?.kind === 'jackpot' ? 150 : 75,
          spread: 85,
          origin: { y: 0.52 },
        });
      } catch {}
    }, 3800);
    tickTimersRef.current.push(finishTimer);
  };

  const canSpinFree = economy.wheelFreeAvailable;
  const canSpinAd = !canSpinFree && economy.wheelAdAvailable;
  const canSpinPaid = !canSpinFree && !canSpinAd && economy.wheelPaidAvailable;
  const allSpinsDone = !canSpinFree && !canSpinAd && !canSpinPaid;

  const activeSpinMode: 'free' | 'ad' | 'paid' | null = canSpinFree
    ? 'free'
    : canSpinAd
    ? 'ad'
    : canSpinPaid
    ? 'paid'
    : null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-2.5 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={() => !spinning && !watchingAd && onClose()}
    >
      <div
        dir={isFA ? 'rtl' : 'ltr'}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[425px] p-3.5 sm:p-4 rounded-[30px] max-h-[94dvh] overflow-y-auto"
        style={{
          backgroundColor: '#EAE0CE',
          backgroundImage: `
            var(--tex-paper),
            radial-gradient(circle at 50% 24%, rgba(246, 224, 178, 0.55) 0%, rgba(226, 206, 176, 0.2) 70%)
          `,
          border: '3.5px solid #7E3F24',
          boxShadow:
            'inset 0 0 0 2px rgba(42,26,16,0.6), 0 10px 0 #4E2210, 0 28px 56px rgba(0,0,0,0.82)',
          scrollbarWidth: 'none',
        }}
      >
        <CornerFlorets inset={6} size={12} color="#3A2618" />

        {/* Header with Cohesive Persian Miniature Backdrop Strip */}
        <div
          className="relative overflow-hidden rounded-2xl p-2.5 mb-2.5 flex items-center justify-between"
          style={{
            border: '1.5px solid #5C3218',
            boxShadow:
              'inset 0 1px 0 rgba(255,242,215,0.6), 0 3px 8px rgba(32,12,4,0.22)',
          }}
        >
          <img
            src="/images/ui/hero-wheel.webp"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover object-center opacity-35 pointer-events-none select-none"
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(90deg, rgba(241, 228, 204, 0.92) 0%, rgba(241, 228, 204, 0.78) 50%, rgba(241, 228, 204, 0.92) 100%)',
            }}
          />

          <div className="relative z-10 flex items-center gap-2">
            <div
              className="w-10 h-10 rounded-xl grid place-items-center shrink-0"
              style={{
                background:
                  'radial-gradient(circle at 35% 28%, #F6D888 0%, #CE922C 68%, #8F5A0E 100%)',
                border: '1.5px solid #4E2E06',
                color: '#2B1608',
                boxShadow:
                  'inset 0 1.5px 1px rgba(255,248,225,0.8), 0 2px 5px rgba(32,12,4,0.45)',
              }}
            >
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="text-[15px] sm:text-base font-black text-[#2B1608] leading-tight">
                {isFA ? 'گردونه سرنوشت خشتی' : 'Clay Wheel of Fortune'}
              </h3>
              <p className="text-[10px] font-extrabold text-[#5E3C1E]">
                {isFA
                  ? `چرخش‌های امروز: ${fmt(economy.wheelSpinsToday)} از ${fmt(3)}`
                  : `Today's Spins: ${economy.wheelSpinsToday} / 3`}
              </p>
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setShowOdds((v) => !v)}
              className="cg-btn-cream w-8 h-8 rounded-full grid place-items-center"
              title={isFA ? 'جدول شانس هر خانه' : 'Probability Table'}
            >
              <Info size={15} />
            </button>
            <div className="cg-chip coin">
              <GameCoin size={14} />
              <span className="font-black text-xs">{fmt(player.coins)}</span>
            </div>
            <button
              type="button"
              disabled={spinning || watchingAd}
              onClick={onClose}
              className="cg-btn-cream w-8 h-8 rounded-full grid place-items-center"
            >
              <InkClose size={16} />
            </button>
          </div>
        </div>

        {/* 3-Step Daily Spin Progress Bar */}
        <div className="grid grid-cols-3 gap-1.5 mb-2.5">
          {[
            {
              step: 1,
              done: !economy.wheelFreeAvailable,
              active: canSpinFree,
              labelFa: '۱. رایگان',
              labelEn: '1. Free',
            },
            {
              step: 2,
              done: !economy.wheelFreeAvailable && !economy.wheelAdAvailable,
              active: canSpinAd,
              labelFa: '۲. ویدیو جایزه',
              labelEn: '2. Video Ad',
            },
            {
              step: 3,
              done: allSpinsDone,
              active: canSpinPaid,
              labelFa: `۳. ویژه (${fmt(SHOP_PRICES.wheelExtraSpin)})`,
              labelEn: `3. Bonus (${SHOP_PRICES.wheelExtraSpin})`,
            },
          ].map((item) => (
            <div
              key={item.step}
              className="px-2 py-1 rounded-xl flex items-center justify-center gap-1 text-[9.5px] sm:text-[10px] font-black transition-all"
              style={
                item.done
                  ? {
                      backgroundColor: '#C9D6B5',
                      color: '#2F461E',
                      border: '1px solid #7C9260',
                    }
                  : item.active
                  ? {
                      background:
                        'linear-gradient(180deg, #F6DD9E 0%, #DBA846 100%)',
                      color: '#2B1608',
                      border: '1.5px solid #7E5210',
                      boxShadow: '0 2px 5px rgba(42,20,4,0.22)',
                    }
                  : {
                      backgroundColor: '#DFCBB0',
                      color: '#6E5238',
                      border: '1px solid #B09472',
                    }
              }
            >
              {item.done && <Check size={11} className="stroke-[3] shrink-0" />}
              <span className="truncate">{isFA ? item.labelFa : item.labelEn}</span>
            </div>
          ))}
        </div>

        {/* Odds Disclosure Drawer */}
        {showOdds && (
          <div
            className="mb-2.5 p-2.5 rounded-2xl text-[10px] space-y-1.5 animate-in fade-in duration-150"
            style={{
              backgroundColor: '#DFCBB0',
              border: '1.5px solid #9E7C56',
            }}
          >
            <div className="font-black text-[#2B1B10] flex items-center justify-between">
              <span>
                {isFA ? 'احتمال دقیق هر خانه گردونه:' : 'Exact Wedge Probabilities:'}
              </span>
              <span className="text-[#7A4A1C]">
                {isFA ? 'امید ریاضی: ۳۶.۸ سکه' : 'EV: 36.8 Coins'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1">
              {WHEEL_WEDGES.map((w) => (
                <div
                  key={w.id}
                  className="flex items-center justify-between px-2 py-1 rounded-lg bg-[#EFE4D2] border border-[#B89B78]"
                >
                  <span className="font-bold text-[#2B1B10] truncate">
                    {isFA ? w.labelFa : w.labelEn}
                  </span>
                  <span className="font-black text-[#8E4B30]">{fmt(w.weight)}٪</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =================================================================
            SCULPTED PERSIAN TERRACOTTA & GOLD WHEEL STAGE
            All slice text uses concise 2-line radial headers well inside the
            59.7-unit outer chord width so ZERO characters ever touch a border!
           ================================================================= */}
        <div className="relative mx-auto my-1.5 w-[286px] h-[286px] sm:w-[308px] sm:h-[308px] flex items-center justify-center select-none">
          {/* Ambient Golden Halo Behind Wheel */}
          <div
            className={`absolute inset-1 rounded-full pointer-events-none transition-opacity duration-500 ${
              spinning ? 'opacity-95 animate-pulse' : 'opacity-55'
            }`}
            style={{
              background:
                'radial-gradient(circle, rgba(244, 198, 92, 0.5) 0%, rgba(200, 108, 68, 0.18) 62%, transparent 75%)',
              filter: 'blur(8px)',
            }}
          />

          {/* Top Sculpted Clapper Pointer (Rocks with Physics When Pegs Pass!) */}
          <div
            className="absolute -top-3 left-1/2 -translate-x-1/2 z-30 pointer-events-none"
            style={{
              transformOrigin: '50% 8px',
              transform: pointerKick
                ? 'translateX(-50%) rotate(-22deg) scale(1.06)'
                : 'translateX(-50%) rotate(0deg) scale(1)',
              transition: pointerKick
                ? 'transform 42ms cubic-bezier(0.2, 0.9, 0.3, 1)'
                : 'transform 110ms cubic-bezier(0.34, 1.56, 0.64, 1)',
              filter: 'drop-shadow(0 5px 6px rgba(20, 6, 1, 0.75))',
            }}
            aria-hidden="true"
          >
            <svg width="38" height="42" viewBox="0 0 38 42" fill="none">
              <defs>
                <linearGradient id="clapperGold" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FCE39C" />
                  <stop offset="55%" stopColor="#D49830" />
                  <stop offset="100%" stopColor="#8E580C" />
                </linearGradient>
              </defs>
              {/* Pointer Shield Body */}
              <path
                d="M19 39L5 10C3.6 7 5.8 3 9.2 3H28.8C32.2 3 34.4 7 33 10L19 39Z"
                fill="url(#clapperGold)"
                stroke="#3A1808"
                strokeWidth="2.6"
                strokeLinejoin="round"
              />
              {/* Inlaid Turquoise Gem */}
              <circle
                cx="19"
                cy="12"
                r="5"
                fill="#38A89D"
                stroke="#2B1608"
                strokeWidth="1.6"
              />
              <circle cx="17.5" cy="10.5" r="1.5" fill="#CFF7F2" />
            </svg>
          </div>

          {/* Outer Sculpted Terracotta & Brass Bezel with 16 Inlaid Studs */}
          <div
            className="relative w-full h-full rounded-full p-[13px] sm:p-[14px]"
            style={{
              background:
                'radial-gradient(circle at 35% 28%, #B26242 0%, #7E3A1E 58%, #4E200D 100%)',
              border: '3.5px solid #2E1206',
              boxShadow: `
                inset 0 3px 5px rgba(255, 224, 195, 0.48),
                inset 0 -4px 6px rgba(24, 7, 2, 0.75),
                0 14px 28px rgba(28, 10, 3, 0.7)
              `,
            }}
          >
            {/* 16 Decorative Rim Studs (Alternating Gold & Persian Turquoise) */}
            <svg
              viewBox="0 0 220 220"
              className="absolute inset-0 w-full h-full pointer-events-none z-20"
            >
              {Array.from({ length: 16 }).map((_, idx) => {
                const angleRad = (idx * 22.5 - 90) * (Math.PI / 180);
                const cx = 110 + 103.5 * Math.cos(angleRad);
                const cy = 110 + 103.5 * Math.sin(angleRad);
                const isTurquoise = idx % 2 === 1;
                const isLit = spinning ? idx % 2 === rimPhase : true;
                return (
                  <g key={idx}>
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isLit ? 3.4 : 2.7}
                      fill={
                        isTurquoise
                          ? isLit
                            ? '#56D6C8'
                            : '#2B7A72'
                          : isLit
                          ? '#FFE494'
                          : '#B88428'
                      }
                      stroke="#2A1205"
                      strokeWidth="1.1"
                    />
                  </g>
                );
              })}
            </svg>

            {/* Rotating Wheel Disc */}
            <div
              className="w-full h-full rounded-full overflow-hidden relative"
              style={{
                transform: `rotate(${rotationDeg}deg)`,
                transition: spinning
                  ? 'transform 3.75s cubic-bezier(0.12, 0.84, 0.16, 1)'
                  : 'none',
                boxShadow: 'inset 0 0 0 2.5px #3A1808',
              }}
            >
              <svg viewBox="0 0 200 200" className="w-full h-full block">
                <defs>
                  {WEDGE_STYLES.map((st, idx) => (
                    <radialGradient
                      key={idx}
                      id={`wedgeGrad_${idx}`}
                      cx="50%"
                      cy="50%"
                      r="55%"
                    >
                      <stop offset="18%" stopColor={st.bgStart} />
                      <stop offset="100%" stopColor={st.bgEnd} />
                    </radialGradient>
                  ))}
                  <radialGradient id="hubGoldGrad" cx="35%" cy="30%" r="70%">
                    <stop offset="0%" stopColor="#FFF0B8" />
                    <stop offset="52%" stopColor="#DFA438" />
                    <stop offset="100%" stopColor="#8C560A" />
                  </radialGradient>
                </defs>

                {WHEEL_WEDGES.map((wedge, i) => {
                  const startAngle = (i * 45 - 90) * (Math.PI / 180);
                  const endAngle = ((i + 1) * 45 - 90) * (Math.PI / 180);
                  const x1 = 100 + 100 * Math.cos(startAngle);
                  const y1 = 100 + 100 * Math.sin(startAngle);
                  const x2 = 100 + 100 * Math.cos(endAngle);
                  const y2 = 100 + 100 * Math.sin(endAngle);
                  const midDeg = i * 45 + 22.5;
                  const style = WEDGE_STYLES[i % WEDGE_STYLES.length];
                  const { line1, line2 } = getCompactWedgeLines(wedge, isFA, fmt);
                  const isWinner = !spinning && wonIndex === i;

                  return (
                    <g key={wedge.id}>
                      {/* Slice Sector Path */}
                      <path
                        d={`M100,100 L${x1},${y1} A100,100 0 0,1 ${x2},${y2} Z`}
                        fill={`url(#wedgeGrad_${i % WEDGE_STYLES.length})`}
                        stroke={isWinner ? '#FFF3B0' : '#431E0C'}
                        strokeWidth={isWinner ? '2.6' : '1.6'}
                      />

                      {/* Subtle Inner Ornamental Arch Line Inside Each Wedge */}
                      <path
                        d={`M${100 + 88 * Math.cos(startAngle)},${
                          100 + 88 * Math.sin(startAngle)
                        } A88,88 0 0,1 ${100 + 88 * Math.cos(endAngle)},${
                          100 + 88 * Math.sin(endAngle)
                        }`}
                        fill="none"
                        stroke={style.accent}
                        strokeWidth="0.9"
                        strokeDasharray="2.5 2"
                        opacity="0.65"
                      />

                      {/* Wedge Content — Strictly Contained Inside Safe Chord Width */}
                      <g transform={`rotate(${midDeg} 100 100)`}>
                        {/* Line 1: Bold Value at y=23 (r=77, safe chord=59px, text width <= 26px) */}
                        <text
                          x="100"
                          y="23.5"
                          textAnchor="middle"
                          fill={style.textPrimary}
                          fontSize="9.2"
                          fontWeight="900"
                          style={{
                            paintOrder: 'stroke',
                            stroke:
                              wedge.kind === 'jackpot'
                                ? 'rgba(42, 10, 4, 0.85)'
                                : 'rgba(255, 248, 235, 0.55)',
                            strokeWidth: '1.4px',
                          }}
                        >
                          {line1}
                        </text>

                        {/* Line 2: Compact Unit Label at y=33.5 (r=66.5, safe chord=51px, text width <= 24px) */}
                        <text
                          x="100"
                          y="33.5"
                          textAnchor="middle"
                          fill={style.textSecondary}
                          fontSize="6.5"
                          fontWeight="800"
                        >
                          {line2}
                        </text>

                        {/* Sculpted Prize Medallion Emblem at y=49 (r=51) */}
                        <g transform="translate(100, 49)">
                          <circle
                            cx="0"
                            cy="0"
                            r="9.2"
                            fill="rgba(42, 20, 8, 0.16)"
                            stroke={style.accent}
                            strokeWidth="1"
                          />
                          {wedge.kind === 'jackpot' ? (
                            // Royal Kiani Crown SVG
                            <path
                              d="M-5.5 3.5L-4.2 -3L-1.5 0.5L0 -4.5L1.5 0.5L4.2 -3L5.5 3.5Z"
                              fill="#FFE28A"
                              stroke="#3A1806"
                              strokeWidth="1"
                              strokeLinejoin="round"
                            />
                          ) : wedge.kind === 'ticket' ? (
                            // Sculpted Tower Emblem
                            <path
                              d="M-3.5 4.5V-2.5L-5 -2.5V-4.5H5V-2.5L3.5 -2.5V4.5Z"
                              fill="#FFF5E4"
                              stroke="#1D3E4A"
                              strokeWidth="1.1"
                              strokeLinejoin="round"
                            />
                          ) : wedge.kind === 'item' ? (
                            // Turquoise Streak Shield Emblem
                            <path
                              d="M0 -5.2L4.8 -3V0.8C4.8 3.5 2.7 5.2 0 6C-2.7 5.2 -4.8 3.5 -4.8 0.8V-3L0 -5.2Z"
                              fill="#5CE0D2"
                              stroke="#1B3B2B"
                              strokeWidth="1.1"
                              strokeLinejoin="round"
                            />
                          ) : (
                            // Sculpted Gold Coin Emblem
                            <>
                              <circle
                                cx="0"
                                cy="0"
                                r="5.6"
                                fill="#F5C452"
                                stroke="#5C3409"
                                strokeWidth="1.1"
                              />
                              <circle
                                cx="0"
                                cy="0"
                                r="3.2"
                                fill="none"
                                stroke="#8C5412"
                                strokeWidth="0.8"
                              />
                            </>
                          )}
                        </g>
                      </g>
                    </g>
                  );
                })}

                {/* 8 Brass Pegs on the Boundary Lines Near the Outer Rim */}
                {WHEEL_WEDGES.map((_, i) => {
                  const deg = (i * 45 - 90) * (Math.PI / 180);
                  const px = 100 + 94 * Math.cos(deg);
                  const py = 100 + 94 * Math.sin(deg);
                  return (
                    <circle
                      key={`peg_${i}`}
                      cx={px}
                      cy={py}
                      r="2.8"
                      fill="#FCE39C"
                      stroke="#3A1808"
                      strokeWidth="1.2"
                    />
                  );
                })}

                {/* Inner Decorative Rosette Ring */}
                <circle
                  cx="100"
                  cy="100"
                  r="27"
                  fill="#5E2812"
                  stroke="#D9A13C"
                  strokeWidth="2.2"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="23"
                  fill="none"
                  stroke="#F7DF9C"
                  strokeWidth="1"
                  strokeDasharray="3 2"
                />
              </svg>
            </div>

            {/* Interactive Center Rosette Spin Hub Button (Non-Rotating Overlay) */}
            <button
              type="button"
              disabled={
                spinning ||
                watchingAd ||
                !activeSpinMode ||
                (activeSpinMode === 'paid' &&
                  player.coins < SHOP_PRICES.wheelExtraSpin)
              }
              onClick={() => activeSpinMode && executeSpin(activeSpinMode)}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-[64px] h-[64px] sm:w-[68px] sm:h-[68px] rounded-full flex flex-col items-center justify-center active:scale-90 transition-transform focus:outline-none disabled:opacity-75"
              style={{
                background:
                  'radial-gradient(circle at 35% 28%, #FFF0B8 0%, #DFA438 58%, #8C560A 100%)',
                border: '3px solid #3A1808',
                boxShadow:
                  'inset 0 2px 3px rgba(255, 252, 235, 0.85), 0 5px 12px rgba(20, 6, 1, 0.7)',
              }}
              title={isFA ? 'بچرخان!' : 'Spin!'}
            >
              {spinning ? (
                <Loader2 size={20} className="text-[#2B1608] animate-spin" />
              ) : (
                <>
                  <span className="text-[10.5px] sm:text-[11px] font-black text-[#2B1608] leading-none">
                    {isFA ? 'بچرخان' : 'SPIN'}
                  </span>
                  <span className="text-[8px] font-extrabold text-[#5E3408] mt-0.5 leading-none">
                    {canSpinFree
                      ? isFA
                        ? 'رایگان!'
                        : 'FREE'
                      : canSpinAd
                      ? isFA
                        ? 'ویدیو'
                        : 'AD'
                      : canSpinPaid
                      ? fmt(SHOP_PRICES.wheelExtraSpin)
                      : '✓'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Rewarded Ad Simulation Overlay */}
        {watchingAd && (
          <div
            className="my-2 p-3 rounded-2xl text-center space-y-1 animate-pulse"
            style={{
              backgroundColor: '#3A2314',
              color: '#FFF6E8',
              border: '1.5px solid #D4A44E',
            }}
          >
            <p className="text-xs font-black">
              {isFA
                ? `در حال نمایش ویدیوی جایزه‌دار... (${fmt(adSecondsLeft)} ثانیه)`
                : `Playing Rewarded Video Ad... (${adSecondsLeft}s)`}
            </p>
            <p className="text-[10px] text-[#E6C79C]">
              {isFA
                ? 'پس از اتمام ویدیو، گردونه به صورت رایگان می‌چرخد!'
                : 'Your bonus wheel spin will start automatically!'}
            </p>
          </div>
        )}

        {/* Won Prize Notification */}
        {wonWedge && (
          <div
            className="my-2 p-3 rounded-2xl text-center animate-in zoom-in-95 duration-200"
            style={{
              background: 'linear-gradient(180deg, #F6E7C8 0%, #E4C994 100%)',
              border: '2px solid #9E6B18',
              boxShadow: '0 6px 16px rgba(42,20,6,0.25)',
            }}
          >
            <p className="text-[10.5px] font-bold text-[#6E4812]">
              {isFA ? '🎉 تبریک! جایزه شما از گردونه خشتی:' : '🎉 You won:'}
            </p>
            <p className="text-base font-black text-[#2B1608] mt-0.5">
              {isFA ? wonWedge.labelFa : wonWedge.labelEn}
            </p>
          </div>
        )}

        {errorNote && (
          <div className="my-2 p-2.5 rounded-xl text-center text-xs font-black bg-[#9E4230]/15 text-[#8E2A1B] border border-[#9E4230]/40">
            {errorNote}
          </div>
        )}

        {/* Action Buttons for the 3 Daily Spins */}
        <div className="mt-2.5 space-y-2">
          {canSpinFree && (
            <button
              type="button"
              disabled={spinning || watchingAd}
              onClick={() => executeSpin('free')}
              className="w-full py-3 rounded-2xl font-black text-sm text-[#FFF8EC] flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-md"
              style={{
                background: 'linear-gradient(180deg, #6E8A58 0%, #4E663B 100%)',
                border: '1.5px solid #2F4022',
                boxShadow:
                  'inset 0 1px 0 rgba(255,255,255,0.4), 0 3px 0 #26341B',
              }}
            >
              {spinning ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  <Sparkles size={17} />
                  <span>
                    {isFA ? 'چرخش اول روزانه (رایگان!)' : '1st Daily Spin (FREE!)'}
                  </span>
                </>
              )}
            </button>
          )}

          {canSpinAd && (
            <button
              type="button"
              disabled={spinning || watchingAd}
              onClick={() => executeSpin('ad')}
              className="w-full py-3 rounded-2xl font-black text-sm text-[#2C1808] flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-md"
              style={{
                background: 'linear-gradient(180deg, #F3D393 0%, #D4A44E 100%)',
                border: '1.5px solid #7E5614',
                boxShadow:
                  'inset 0 1px 0 rgba(255,250,230,0.75), 0 3px 0 #5C3D0B',
              }}
            >
              {spinning || watchingAd ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  <Play size={16} className="fill-current" />
                  <span>
                    {isFA
                      ? 'چرخش دوم (تماشای ویدیوی کوتاه رایگان)'
                      : '2nd Spin (Watch Short Video Ad)'}
                  </span>
                </>
              )}
            </button>
          )}

          {canSpinPaid && (
            <button
              type="button"
              disabled={
                spinning ||
                watchingAd ||
                player.coins < SHOP_PRICES.wheelExtraSpin
              }
              onClick={() => executeSpin('paid')}
              className="w-full py-3 rounded-2xl font-black text-sm text-[#FFF7EB] flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-md disabled:opacity-60"
              style={{
                background: 'linear-gradient(180deg, #C86C44 0%, #9E4A28 100%)',
                border: '1.5px solid #5E2914',
                boxShadow:
                  'inset 0 1px 0 rgba(255,230,200,0.45), 0 3px 0 #421B0B',
              }}
            >
              {spinning ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  <span>{isFA ? 'چرخش سوم ویژه:' : '3rd Bonus Spin:'}</span>
                  <GameCoin size={16} />
                  <span>{fmt(SHOP_PRICES.wheelExtraSpin)}</span>
                </>
              )}
            </button>
          )}

          {allSpinsDone && (
            <div
              className="p-3 rounded-2xl text-center text-xs font-black"
              style={{
                backgroundColor: '#DFCBB0',
                color: '#5C4028',
                border: '1.5px solid #A68964',
              }}
            >
              {isFA
                ? '✓ هر ۳ چرخش امروز را انجام دادید! فردا دوباره برگردید.'
                : '✓ All 3 spins used for today! Come back tomorrow.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
