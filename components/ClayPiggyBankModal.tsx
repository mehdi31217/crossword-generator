import React, { useEffect, useState } from 'react';
import { X, Sparkles, Hammer, ShieldCheck, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';
import { PlayerState, Language } from '../types';
import { EconomyStateView } from '../utils/progression';
import {
  PIGGY_BANK_HALF_THRESHOLD,
  PIGGY_BANK_MAX_CAP,
  PIGGY_BANK_PER_WORD,
  PIGGY_BANK_SMASH_PRICE_TOMAN,
  WEB_DIRECT_BONUS_RATE,
} from '../utils/economy';
import { gameServer } from '../utils/gameServer';

const toPersianNums = (s: string | number) => String(s).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[+d]);

const fmt = (n: number, isFA: boolean) =>
  isFA ? toPersianNums(n.toLocaleString('en-US')) : n.toLocaleString('en-US');

export interface ClayPiggyJarBadgeProps {
  language?: Language;
  onClick: () => void;
  compact?: boolean;
  variant?: 'default' | 'compact' | 'home-pill';
}

/**
 * HUD / Menu / Shop badge for the Persian Clay Piggy Bank (`خمرهٔ زرین سفالی`).
 * Features the hand-illustrated Persian terracotta & turquoise Khomreh artwork
 * inside a soft, pillowy-rounded medallion with a circular gold progress ring.
 * Automatically listens to `cg-piggy-coin` events so every solved word triggers
 * a flying gold coin into the jar, and jiggles excitedly once >= 1500 coins.
 */
export const ClayPiggyJarBadge: React.FC<ClayPiggyJarBadgeProps> = ({
  language = 'fa',
  onClick,
  compact = false,
  variant,
}) => {
  const isFA = language === 'fa';
  const [jarCoins, setJarCoins] = useState<number>(() => {
    return gameServer.getLocalEconomyState().piggyBankCoins ?? 420;
  });
  const [flyDelta, setFlyDelta] = useState<number | null>(null);
  const [hitPulse, setHitPulse] = useState(false);

  useEffect(() => {
    const sync = () => {
      setJarCoins(gameServer.getLocalEconomyState().piggyBankCoins ?? 420);
    };
    const onCoin = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && typeof detail.total === 'number') {
        setJarCoins(detail.total);
        if (detail.added > 0) {
          setFlyDelta(detail.added);
          setHitPulse(true);
          setTimeout(() => setHitPulse(false), 620);
          setTimeout(() => setFlyDelta(null), 1350);
        }
      } else {
        sync();
      }
    };
    window.addEventListener('cg-piggy-coin', onCoin);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('cg-piggy-coin', onCoin);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const pct = Math.min(100, Math.round((jarCoins / PIGGY_BANK_MAX_CAP) * 100));
  const isReady = jarCoins >= PIGGY_BANK_HALF_THRESHOLD;
  const isFull = jarCoins >= PIGGY_BANK_MAX_CAP;

  const ringRadius = 15;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (pct / 100) * ringCircumference;

  const resolvedVariant = variant ?? (compact ? 'compact' : 'default');

  // 1) Home Page Top Bar Pill (`MainMenu.tsx` — matches `raisedCreamPillStyle` & Coins capsule)
  if (resolvedVariant === 'home-pill') {
    return (
      <button
        type="button"
        onClick={onClick}
        title={isFA ? 'خمرهٔ زرین سفالی (قلک سکه)' : 'Golden Clay Jar Piggy Bank'}
        dir={isFA ? 'rtl' : 'ltr'}
        className={`h-full relative group flex items-center gap-1 px-1.5 sm:px-2.5 rounded-full active:scale-95 transition-transform focus:outline-none shrink-0 ${
          hitPulse ? 'scale-105 ring-2 ring-[#E5A93B]' : ''
        }`}
        style={{
          backgroundColor: '#EAE0CE',
          backgroundImage: `
            var(--tex-paper),
            linear-gradient(180deg, #F5EDE0 0%, #E6DAC6 62%, #D4C3AA 100%)
          `,
          backgroundSize: '160px 160px, auto',
          backgroundBlendMode: 'multiply, normal',
          boxShadow: `
            inset 0 1.5px 1px rgba(255, 253, 248, 0.92),
            inset 0 -2px 2px rgba(154, 132, 104, 0.52),
            0 3px 5px rgba(28, 10, 3, 0.55)
          `,
          border: isReady
            ? '1.5px solid #239693'
            : '1px solid rgba(110, 78, 52, 0.45)',
        }}
      >
        <div className="relative w-4 h-4 sm:w-[18px] sm:h-[18px] shrink-0 flex items-center justify-center">
          <div
            className="w-full h-full rounded-full overflow-hidden border border-[#B87D24] bg-[#F5EBDC]"
            style={{
              boxShadow: 'inset 0 1px 2px rgba(58,30,15,0.3), 0 1px 2px rgba(58,30,15,0.2)',
            }}
          >
            <img
              src="/images/ui/khomreh-jar.jpg"
              alt=""
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover scale-[1.18]"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          {isReady && (
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#239693] ring-1 ring-[#FFF8EE]" />
          )}
        </div>
        <span className="text-[10px] sm:text-[11px] font-black text-[#2C1A0C] tabular-nums tracking-tight leading-none">
          {fmt(jarCoins, isFA)}
        </span>
      </button>
    );
  }

  // 2) Sleek Single-Line Compact Header Chip (`Header.tsx` — `CSS selector 1`)
  if (resolvedVariant === 'compact') {
    return (
      <button
        type="button"
        onClick={onClick}
        title={isFA ? 'خمرهٔ زرین سفالی (قلک سکه)' : 'Golden Clay Jar Piggy Bank'}
        dir={isFA ? 'rtl' : 'ltr'}
        className={`cg-chip relative group inline-flex items-center rounded-full transition-transform active:scale-95 select-none shrink-0 h-[34px] sm:h-[38px] !py-1 !ps-1.5 !pe-2 sm:!pe-2.5 gap-1 ${
          hitPulse ? 'scale-105 ring-2 ring-[#E5A93B]' : ''
        }`}
        style={{
          backgroundImage: isFull
            ? 'linear-gradient(180deg, #FFF7DF 0%, #F4D284 100%)'
            : isReady
              ? 'linear-gradient(180deg, #FBF1DF 0%, #DFC8A2 100%)'
              : 'linear-gradient(180deg, #FCF6E9 0%, #EFE2CC 100%)',
          borderColor: isFull ? '#B87D1E' : isReady ? '#239693' : 'rgba(92,58,34,0.48)',
          color: '#3D200D',
        }}
      >
        <div className="relative w-[20px] h-[20px] sm:w-[22px] sm:h-[22px] shrink-0 flex items-center justify-center">
          <div
            className="w-full h-full rounded-full overflow-hidden border border-[#B87D24] bg-[#F5EBDC]"
            style={{
              boxShadow: 'inset 0 1px 2px rgba(58,30,15,0.3), 0 1px 2px rgba(58,30,15,0.2)',
            }}
          >
            <img
              src="/images/ui/khomreh-jar.jpg"
              alt={isFA ? 'خمرهٔ زرین سفالی' : 'Persian Clay Khomreh Jar'}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover scale-[1.18]"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          {isReady && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#239693] ring-1 ring-[#FFF8EE]" />
          )}
        </div>
        <span className="text-[10.5px] sm:text-xs font-black tracking-tight tabular-nums text-[#3D200D] leading-none whitespace-nowrap">
          {fmt(jarCoins, isFA)}
        </span>
        {flyDelta !== null && (
          <div className="cg-coin-fly pointer-events-none absolute -top-5 left-1/2 -translate-x-1/2 z-30 whitespace-nowrap rounded-full bg-gradient-to-r from-[#F5B82E] to-[#D98A16] px-2 py-0.5 text-[10px] font-black text-[#3B1A0B] shadow-md border border-[#FFF4C2]">
            +{fmt(flyDelta, isFA)} 🪙
          </div>
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      title={isFA ? 'خمرهٔ زرین سفالی (قلک سکه)' : 'Golden Clay Jar Piggy Bank'}
      dir={isFA ? 'rtl' : 'ltr'}
      className={`cg-chip relative group inline-flex items-center rounded-full transition-transform active:scale-95 select-none shrink-0 h-[42px] !py-1 !ps-1.5 !pe-3 gap-2 ${
        isReady ? 'cg-jar-excited' : ''
      } ${hitPulse ? 'scale-105 ring-2 ring-[#E5A93B]' : ''}`}
      style={{
        backgroundImage: isFull
          ? 'linear-gradient(180deg, #FFF7DF 0%, #F4D284 100%)'
          : isReady
            ? 'linear-gradient(180deg, #FBF1DF 0%, #DFC8A2 100%)'
            : 'linear-gradient(180deg, #FCF6E9 0%, #EFE2CC 100%)',
        borderColor: isFull ? '#B87D1E' : isReady ? '#239693' : 'rgba(92,58,34,0.48)',
        color: '#3D200D',
      }}
    >
      <style>{`
        @keyframes cgJarExcitedBounce {
          0%, 100% { transform: translateY(0) rotate(0deg) scale(1); }
          18% { transform: translateY(-2px) rotate(-3.5deg) scale(1.03); }
          36% { transform: translateY(0) rotate(3.5deg) scale(1.03); }
          54% { transform: translateY(-1.5px) rotate(-2deg) scale(1.015); }
          72% { transform: translateY(0) rotate(1.5deg) scale(1.005); }
        }
        @keyframes cgCoinFlyIn {
          0% { opacity: 0; transform: translateY(14px) scale(0.6); }
          30% { opacity: 1; transform: translateY(-8px) scale(1.12); }
          80% { opacity: 1; transform: translateY(-16px) scale(1); }
          100% { opacity: 0; transform: translateY(-24px) scale(0.85); }
        }
        .cg-jar-excited {
          animation: cgJarExcitedBounce 2.4s ease-in-out infinite;
        }
        .cg-coin-fly {
          animation: cgCoinFlyIn 1.25s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
      `}</style>

      {/* Hand-Illustrated Persian Khomreh Medallion with Circular Golden Fill Ring */}
      <div className="relative w-8 h-8 shrink-0 flex items-center justify-center">
        <div
          className="w-full h-full rounded-full overflow-hidden border border-[#B87D24] bg-[#F5EBDC]"
          style={{
            boxShadow: 'inset 0 1px 2px rgba(58,30,15,0.3), 0 1px 2px rgba(58,30,15,0.2)',
          }}
        >
          <img
            src="/images/ui/khomreh-jar.jpg"
            alt={isFA ? 'خمرهٔ زرین سفالی' : 'Persian Clay Khomreh Jar'}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover scale-[1.18] transition-transform duration-300 group-hover:scale-[1.25]"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>

        {/* Circular Progress Ring around the Medallion */}
        <svg
          viewBox="0 0 36 36"
          className="pointer-events-none absolute -inset-0.5 w-[calc(100%+4px)] h-[calc(100%+4px)] -rotate-90"
        >
          <circle
            cx="18"
            cy="18"
            r={ringRadius}
            fill="none"
            stroke="rgba(120,72,32,0.2)"
            strokeWidth="2.4"
          />
          <circle
            cx="18"
            cy="18"
            r={ringRadius}
            fill="none"
            stroke={isFull ? '#D98A16' : isReady ? '#239693' : '#C87A3E'}
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeDasharray={ringCircumference}
            strokeDashoffset={ringOffset}
          />
        </svg>

        {isReady && (
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#239693] ring-1 ring-[#FFF8EE]" />
        )}
      </div>

      <div className="flex flex-col items-start justify-center leading-none">
        <span className="text-[11px] font-black tracking-tight tabular-nums text-[#3D200D] whitespace-nowrap">
          {fmt(jarCoins, isFA)}
          <span className="opacity-65 text-[9.5px] font-bold">/{fmt(PIGGY_BANK_MAX_CAP, isFA)}</span>
        </span>
        <span className="text-[8px] font-extrabold text-[#7B4D2B] mt-0.5 whitespace-nowrap">
          {isFull
            ? isFA ? 'لبریز!' : 'FULL!'
            : isReady
              ? isFA ? 'آماده شکستن' : 'Ready!'
              : isFA ? 'خمره سکه' : 'Clay Jar'}
        </span>
      </div>

      {/* Flying Coin Particle when word is solved */}
      {flyDelta !== null && (
        <div className="cg-coin-fly pointer-events-none absolute -top-5 left-1/2 -translate-x-1/2 z-30 whitespace-nowrap rounded-full bg-gradient-to-r from-[#F5B82E] to-[#D98A16] px-2 py-0.5 text-[10px] font-black text-[#3B1A0B] shadow-md border border-[#FFF4C2]">
          +{fmt(flyDelta, isFA)} 🪙
        </div>
      )}
    </button>
  );
};

interface ClayPiggyBankModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: PlayerState;
  language: Language;
  economy?: EconomyStateView | null;
  onPlayerUpdate: (player: PlayerState, economy?: EconomyStateView) => void;
}

export const ClayPiggyBankModal: React.FC<ClayPiggyBankModalProps> = ({
  isOpen,
  onClose,
  player,
  language,
  economy,
  onPlayerUpdate,
}) => {
  const isFA = language === 'fa';
  const [localEco, setLocalEco] = useState<EconomyStateView>(() => economy || gameServer.getLocalEconomyState());
  const [gateway, setGateway] = useState<'web_shaparak' | 'bazaar' | 'myket'>('web_shaparak');
  const [smashing, setSmashing] = useState(false);
  const [crackedStage, setCrackedStage] = useState<0 | 1 | 2>(0);
  const [droppingCoin, setDroppingCoin] = useState(false);
  const [banner, setBanner] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLocalEco(gameServer.getLocalEconomyState());
      setCrackedStage(0);
      setBanner(null);
      setDroppingCoin(true);
      const t = setTimeout(() => setDroppingCoin(false), 1000);
      return () => clearTimeout(t);
    }
  }, [isOpen, economy]);

  if (!isOpen) return null;

  const jarCoins = localEco.piggyBankCoins ?? 420;
  const pct = Math.min(100, Math.round((jarCoins / PIGGY_BANK_MAX_CAP) * 100));
  const isReady = jarCoins >= PIGGY_BANK_HALF_THRESHOLD;
  const isFull = jarCoins >= PIGGY_BANK_MAX_CAP;
  const webBonus = gateway === 'web_shaparak' ? Math.round(jarCoins * WEB_DIRECT_BONUS_RATE) : 0;
  const totalGrant = jarCoins + webBonus;

  const ringRadius = 104;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (pct / 100) * ringCircumference;

  const handlePreviewCoinDrop = () => {
    setDroppingCoin(false);
    setTimeout(() => setDroppingCoin(true), 20);
    setTimeout(() => setDroppingCoin(false), 950);
  };

  const handleSmashJar = async () => {
    if (!isReady || smashing) return;
    setSmashing(true);
    setBanner(null);
    setCrackedStage(1);

    setTimeout(() => {
      setCrackedStage(2);
      try {
        confetti({
          particleCount: 95,
          spread: 85,
          origin: { y: 0.55 },
          colors: ['#F5B82E', '#239693', '#D86A37', '#FFF2B2'],
        });
      } catch {}
    }, 480);

    setTimeout(async () => {
      const res = await gameServer.smashPiggyBank(player, gateway);
      setSmashing(false);
      if (!res.ok) {
        setCrackedStage(0);
        setBanner({ kind: 'err', text: res.error || 'خطا در شکستن خمره' });
        return;
      }
      if (res.economy) setLocalEco(res.economy);
      const updatedPlayer: PlayerState = {
        ...player,
        coins: typeof res.coins === 'number' ? res.coins : player.coins,
      };
      onPlayerUpdate(updatedPlayer, res.economy);
      setBanner({
        kind: 'ok',
        text: isFA
          ? `خمرهٔ زرین شکسته شد! +${fmt(res.coinsGranted || totalGrant, true)} سکه به خزانه شما واریز شد 🎉`
          : `Clay Jar Smashed! +${res.coinsGranted || totalGrant} Coins added to your treasury!`,
      });
      setTimeout(() => setCrackedStage(0), 1200);
    }, 1050);
  };

  return (
    <div
      dir={isFA ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-[130] flex items-center justify-center bg-[#28160B]/70 backdrop-blur-md p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <style>{`
        @keyframes cgModalJarFloat {
          0%, 100% { transform: translateY(0) rotate(0deg) scale(1); }
          25% { transform: translateY(-4px) rotate(-2deg) scale(1.02); }
          50% { transform: translateY(0) rotate(2deg) scale(1.02); }
          75% { transform: translateY(-2.5px) rotate(-1deg) scale(1.01); }
        }
        @keyframes cgModalJarCrackShake {
          0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1.04); }
          20% { transform: translate(-6px, 2px) rotate(-5deg) scale(1.07); }
          40% { transform: translate(6px, -3px) rotate(5deg) scale(1.08); }
          60% { transform: translate(-5px, -2px) rotate(-4deg) scale(1.06); }
          80% { transform: translate(5px, 2px) rotate(4deg) scale(1.05); }
        }
        @keyframes cgDropCoinSlot {
          0% { opacity: 0; transform: translateY(-38px) scale(0.7) rotate(-18deg); }
          45% { opacity: 1; transform: translateY(-4px) scale(1.1) rotate(12deg); }
          85% { opacity: 1; transform: translateY(20px) scale(0.92) rotate(0deg); }
          100% { opacity: 0; transform: translateY(34px) scale(0.6); }
        }
        .cg-jar-hero-ready {
          animation: cgModalJarFloat 2.6s ease-in-out infinite;
        }
        .cg-jar-cracking {
          animation: cgModalJarCrackShake 0.42s ease-in-out infinite;
        }
        .cg-slot-coin-drop {
          animation: cgDropCoinSlot 0.9s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
      `}</style>

      {/* Pillowy-Rounded Tactile Clay & Warm Cream Parchment Modal Shell */}
      <div
        className="relative w-full max-w-md rounded-[34px] p-4 sm:p-5 text-[#3B2010] overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #FBF4E6 0%, #F4E6CE 58%, #EAD5B5 100%)',
          border: '3px solid #B67D52',
          boxShadow:
            'inset 0 2px 0 rgba(255,255,255,0.85), inset 0 -4px 0 rgba(124,74,40,0.28), 0 12px 0 #7C4726, 0 26px 55px rgba(24,11,4,0.58)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle Warm Eslimiyeh Corner Ornaments */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-2 rounded-[26px] border border-[#D4B48C]/70"
        />

        {/* Top Header */}
        <div className="relative z-10 flex items-center justify-between gap-2 pb-3 border-b border-[#D8BE9B]">
          <div className="flex items-center gap-2.5">
            <div
              className="w-11 h-11 rounded-2xl overflow-hidden border-2 border-[#C88B3A] bg-[#F5EBDC] shrink-0 shadow-sm"
              style={{
                boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.8), 0 3px 0 #8B572A',
              }}
            >
              <img
                src="/images/ui/khomreh-jar.jpg"
                alt=""
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover scale-115"
              />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-[#381D0C] tracking-tight">
                {isFA ? 'خمرهٔ زرین سفالی (قلک بازی)' : 'Persian Clay Khomreh Jar'}
              </h2>
              <p className="text-[11px] font-bold text-[#754B2B]">
                {isFA
                  ? `با حل هر کلمه در بازی +${fmt(PIGGY_BANK_PER_WORD, true)} سکه درون این خمره اندوخته می‌شود`
                  : `Every solved word stores +${PIGGY_BANK_PER_WORD} extra Coins inside this clay jar!`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-2xl bg-[#EFE0C6] hover:bg-[#E5CEAA] border border-[#C2A17B] flex items-center justify-center text-[#5B361C] shadow-[0_2px_0_#A3825C] active:translate-y-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Centerpiece Hand-Illustrated Persian Khomreh Shrine */}
        <div
          className="relative z-10 my-3.5 flex flex-col items-center justify-center rounded-[28px] p-4 overflow-hidden"
          style={{
            background:
              'radial-gradient(circle at 50% 42%, #FFF9EE 0%, #F5E7CE 58%, #E7D0AE 100%)',
            border: '2px solid #C99B64',
            boxShadow:
              'inset 0 2px 6px rgba(110,65,30,0.18), inset 0 -2px 0 rgba(255,255,255,0.7)',
          }}
        >
          {/* Status Pill */}
          <div
            className="relative z-10 mb-2.5 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-[11px] font-black shadow-xs"
            style={{
              background: isReady
                ? 'linear-gradient(180deg, #1E7E74 0%, #135750 100%)'
                : 'linear-gradient(180deg, #B86B3D 0%, #8C4A23 100%)',
              color: '#FFF9EE',
              border: isReady ? '1.5px solid #6FE5D7' : '1.5px solid #E5A97C',
            }}
          >
            <Flame className="w-3.5 h-3.5 text-[#FFE082]" />
            {isFull
              ? isFA
                ? 'خمره لبریز از سکه است! آمادهٔ شکستن با بیشترین سود'
                : 'Jar is 100% FULL! Ready to smash for maximum coins'
              : isReady
                ? isFA
                  ? 'خمره از نیمه گذشته و آمادهٔ شکستن است!'
                  : 'Half-full milestone reached! Ready to smash!'
                : isFA
                  ? `${fmt(PIGGY_BANK_HALF_THRESHOLD - jarCoins, true)} سکه تا رسیدن به حد شکستن خمره`
                  : `${PIGGY_BANK_HALF_THRESHOLD - jarCoins} more coins to unlock smashing`}
          </div>

          {/* Hand-Illustrated Persian Khomreh Medallion + Golden Progress Ring */}
          <div
            onClick={handlePreviewCoinDrop}
            title={isFA ? 'برای امتحان انیمیشن افتادن سکه کلیک کنید' : 'Tap to preview coin drop'}
            className="relative w-56 h-56 flex items-center justify-center cursor-pointer select-none"
          >
            {/* Falling Coin Animation into the Jar Mouth */}
            {droppingCoin && (
              <div className="cg-slot-coin-drop pointer-events-none absolute top-1 z-30 flex items-center justify-center">
                <div className="w-9 h-9 rounded-full bg-gradient-to-b from-[#FFF2A6] to-[#D98B14] border-2 border-[#FFFDF0] shadow-[0_4px_14px_rgba(217,139,20,0.65)] flex items-center justify-center text-xs font-black text-[#4A2508]">
                  +{fmt(PIGGY_BANK_PER_WORD, isFA)}
                </div>
              </div>
            )}

            {/* Outer Circular Golden Fill Progress Ring */}
            <svg
              viewBox="0 0 228 228"
              className="pointer-events-none absolute inset-0 w-full h-full -rotate-90"
            >
              <defs>
                <linearGradient id="khomrehRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFE484" />
                  <stop offset="50%" stopColor="#E59A24" />
                  <stop offset="100%" stopColor="#239693" />
                </linearGradient>
              </defs>
              <circle
                cx="114"
                cy="114"
                r={ringRadius}
                fill="none"
                stroke="rgba(140,88,44,0.2)"
                strokeWidth="9"
              />
              <circle
                cx="114"
                cy="114"
                r={ringRadius}
                fill="none"
                stroke="url(#khomrehRingGrad)"
                strokeWidth="9"
                strokeLinecap="round"
                strokeDasharray={ringCircumference}
                strokeDashoffset={ringOffset}
                style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.22, 1, 0.36, 1)' }}
              />
            </svg>

            {/* Pillowy-Rounded Medallion Containing the Illustrated Persian Khomreh */}
            <div
              className={`relative w-46 h-46 rounded-full overflow-hidden border-[4px] border-[#C68642] bg-[#F5EBDC] shadow-[0_12px_26px_rgba(70,38,16,0.32),inset_0_2px_6px_rgba(255,255,255,0.8)] transition-transform ${
                crackedStage > 0 ? 'cg-jar-cracking' : isReady ? 'cg-jar-hero-ready' : ''
              }`}
            >
              <img
                src="/images/ui/khomreh-jar.jpg"
                alt={isFA ? 'خمرهٔ زرین سفالی' : 'Persian Clay Khomreh Jar'}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover scale-[1.08]"
              />

              {/* Warm Golden Shimmer Overlay proportional to fill */}
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    'radial-gradient(circle at 50% 25%, rgba(255,232,145,0.28) 0%, transparent 65%)',
                }}
              />

              {/* Glowing Golden Cracks Overlay when Smashing */}
              {crackedStage >= 1 && (
                <svg
                  viewBox="0 0 200 200"
                  className="pointer-events-none absolute inset-0 w-full h-full"
                >
                  <path
                    d="M100 24 L90 68 L114 102 L84 144 L106 182 M58 92 L98 108 L142 94"
                    fill="none"
                    stroke="#FFF7B2"
                    strokeWidth={crackedStage === 2 ? '6' : '3.5'}
                    strokeLinecap="round"
                    style={{ filter: 'drop-shadow(0 0 8px #F5B82E)' }}
                  />
                </svg>
              )}
            </div>

            {/* Floating Fill Percentage Seal at Bottom of Medallion */}
            <div
              className="absolute -bottom-1 left-1/2 -translate-x-1/2 z-20 rounded-full px-3.5 py-1 text-xs font-black border-2 border-[#FFF5D6] shadow-md whitespace-nowrap"
              style={{
                background: 'linear-gradient(180deg, #C86D3B 0%, #8E431D 100%)',
                color: '#FFF9EE',
              }}
            >
              {fmt(pct, isFA)}٪ {isFA ? 'پر شده' : 'Full'}
            </div>
          </div>

          {/* Coin Counter & Soft Tactile Fill Bar */}
          <div className="relative z-10 w-full mt-3 pt-2 border-t border-[#DEC5A2]">
            <div className="flex items-baseline justify-between mb-1.5">
              <span className="text-xs font-extrabold text-[#6E4526]">
                {isFA ? 'موجودی اندوخته در خمره:' : 'Coins Stored in Jar:'}
              </span>
              <span className="text-lg sm:text-xl font-black text-[#9C5214] tabular-nums">
                {fmt(jarCoins, isFA)}{' '}
                <span className="text-xs font-bold text-[#7D5536]">
                  / {fmt(PIGGY_BANK_MAX_CAP, isFA)} {isFA ? 'سکه' : 'Coins'}
                </span>
              </span>
            </div>

            {/* Soft Pillowy Progress Bar with Halfway Marker */}
            <div className="relative h-4 w-full rounded-full bg-[#DFC8A8] border border-[#B8966E] p-0.5 overflow-hidden shadow-inner">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#C86D3B] via-[#E59A24] to-[#239693] transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
              <div
                className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-[#5C3418]/50"
                title={isFA ? 'حد نصاب شکستن خمره (۷۵۰ سکه)' : 'Break Threshold (750)'}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] font-extrabold text-[#7B5232] mt-1">
              <span>{isFA ? '۰ سکه' : '0'}</span>
              <span className={isReady ? 'text-[#146B64] font-black' : ''}>
                {isFA
                  ? `نیمه‌پر (${fmt(PIGGY_BANK_HALF_THRESHOLD, true)} سکه: قابل شکستن)`
                  : 'Halfway (750: Breakable)'}
              </span>
              <span>{isFA ? `لبریز (${fmt(PIGGY_BANK_MAX_CAP, true)})` : 'Max (1,500)'}</span>
            </div>
          </div>
        </div>

        {/* Gateway Selector + Smash Action */}
        <div className="relative z-10 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-[#EFE0C6] border border-[#CBB08A] p-2.5">
            <span className="text-xs font-black text-[#4E2C14]">
              {isFA ? 'درگاه شکستن خمره:' : 'Payment Gateway:'}
            </span>
            <div className="flex items-center gap-1.5">
              {(
                [
                  { id: 'web_shaparak', labelFa: 'شاپرک (+۱۵٪ هدیه)', labelEn: 'Direct Web (+15%)' },
                  { id: 'bazaar', labelFa: 'کافه‌بازار', labelEn: 'Cafe Bazaar' },
                  { id: 'myket', labelFa: 'مایکت', labelEn: 'Myket' },
                ] as const
              ).map((gw) => (
                <button
                  key={gw.id}
                  type="button"
                  onClick={() => setGateway(gw.id)}
                  className={`px-2.5 py-1 rounded-xl text-[10.5px] font-black transition-all ${
                    gateway === gw.id
                      ? 'bg-gradient-to-b from-[#239693] to-[#156966] text-white shadow-[0_2px_0_#0D4543]'
                      : 'bg-[#FAF0DF] text-[#5B3A24] border border-[#CBB08A]'
                  }`}
                >
                  {isFA ? gw.labelFa : gw.labelEn}
                </button>
              ))}
            </div>
          </div>

          {banner && (
            <div
              className={`rounded-2xl px-3.5 py-2.5 text-xs font-black border ${
                banner.kind === 'ok'
                  ? 'bg-[#E3F7EC] border-[#2E9B68] text-[#145235]'
                  : 'bg-[#FDE8E4] border-[#C84B31] text-[#6E1B09]'
              }`}
            >
              {banner.text}
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-0.5">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#5C381C]">
              <ShieldCheck className="w-4 h-4 text-[#1E7E74] shrink-0" />
              <span>
                {isFA
                  ? `دریافتی کل: ${fmt(totalGrant, true)} سکه ${webBonus > 0 ? `(شامل +${fmt(webBonus, true)} هدیه وب)` : ''}`
                  : `Total Payout: ${totalGrant} Coins`}
              </span>
            </div>

            <button
              type="button"
              disabled={!isReady || smashing}
              onClick={handleSmashJar}
              className={`inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-xs sm:text-sm font-black transition-all ${
                isReady
                  ? 'bg-gradient-to-b from-[#D47A47] to-[#9E4922] text-[#FFF8EE] border-2 border-[#F5C59B] shadow-[0_4px_0_#6B2E12] active:translate-y-0.5 hover:brightness-105'
                  : 'bg-[#DCC9AE] text-[#856C50] border border-[#C2AA8B] cursor-not-allowed'
              }`}
            >
              <Hammer className="w-4 h-4" />
              {smashing
                ? isFA
                  ? 'در حال شکستن خمره...'
                  : 'Smashing Jar...'
                : isReady
                  ? isFA
                    ? `شکستن خمره (${fmt(PIGGY_BANK_SMASH_PRICE_TOMAN, true)} تومان)`
                    : `Smash Jar (${PIGGY_BANK_SMASH_PRICE_TOMAN} T)`
                  : isFA
                    ? `حداقل ${fmt(PIGGY_BANK_HALF_THRESHOLD, true)} سکه لازم است`
                    : `Requires ${PIGGY_BANK_HALF_THRESHOLD} Coins`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClayPiggyBankModal;
