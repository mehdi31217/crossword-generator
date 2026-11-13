import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { RotateCcw, X, ScrollText, Crown } from 'lucide-react';
import { CardFamily } from '../utils/progression';
import { SCROLL_STAGE_THEMES } from './MasterScroll';
import { soundEngine } from '../utils/soundEngine';

export interface ScrollAwardPayload {
  scrollKey: string;
  titleFa: string;
  subtitleFa?: string;
  family: CardFamily;
  tier: 1 | 2 | 3 | 4;
  totalCards: number;
  isUpgrade?: boolean;
  previousTier?: 1 | 2 | 3;
}

interface ScrollRevealCeremonyProps {
  /** Opens in Award Celebration Mode for this newly unlocked/upgraded scroll */
  award?: ScrollAwardPayload | null;
  onEquipNow?: (scrollKey: string) => void;
  onClose: () => void;
}

interface SolarBeam {
  id: number;
  angleDeg: number;
  spreadDeg: number;
  lengthPx: number;
  driftSpeed: number;
  shimmerSpeed: number;
  shimmerPhase: number;
  maxAlpha: number;
  layer: 'wide' | 'filament';
  warmth: 'gold' | 'accent' | 'core';
}

interface SmokePuff {
  id: number;
  angle: number;
  distance: number;
  size: number;
  delay: number;
  duration: number;
  driftX: number;
  driftY: number;
  color: string;
}

interface SunlitMote {
  id: number;
  angle: number;
  dist: number;
  size: number;
  delay: number;
  duration: number;
  isGem: boolean;
}

const toFa = (n: number | string) => String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[+d]);

const TIER_CEREMONY_CONFIG: Record<
  1 | 2 | 3 | 4,
  {
    beamCount: number;
    smokeCount: number;
    particleCount: number;
    shockwaveCount: number;
    shakeIntensity: number;
    sunCore: string;
    sunWarmGold: string;
    rayPrimary: string;
    raySecondary: string;
    smokeColor1: string;
    smokeColor2: string;
    bgRadial1: string;
    bgRadial2: string;
    headlineFa: string;
    subHeadlineFa: string;
    confettiBursts: number;
    confettiColors: string[];
  }
> = {
  1: {
    beamCount: 16,
    smokeCount: 8,
    particleCount: 22,
    shockwaveCount: 1,
    shakeIntensity: 0,
    sunCore: '#FFFDF5',
    sunWarmGold: '#FFE4A3',
    rayPrimary: '#F5C384',
    raySecondary: '#D47A42',
    smokeColor1: 'rgba(232, 168, 107, 0.36)',
    smokeColor2: 'rgba(156, 82, 38, 0.28)',
    bgRadial1: 'rgba(196, 105, 45, 0.48)',
    bgRadial2: 'rgba(34, 17, 7, 0.95)',
    headlineFa: '📜 طومار خشتیِ نیشابور گشوده شد!',
    subHeadlineFa: 'تمامی کارت‌های این مجموعه کامل شد و طومار خشتی به قفسهٔ کومبوی شما راه یافت',
    confettiBursts: 1,
    confettiColors: ['#E5B97B', '#C86D3B', '#F7E7C8', '#8A4F24'],
  },
  2: {
    beamCount: 22,
    smokeCount: 12,
    particleCount: 32,
    shockwaveCount: 2,
    shakeIntensity: 1,
    sunCore: '#FFFFFF',
    sunWarmGold: '#FFF0B8',
    rayPrimary: '#98F7FF',
    raySecondary: '#FFE082',
    smokeColor1: 'rgba(40, 178, 204, 0.42)',
    smokeColor2: 'rgba(255, 224, 130, 0.28)',
    bgRadial1: 'rgba(22, 148, 174, 0.55)',
    bgRadial2: 'rgba(6, 30, 38, 0.96)',
    headlineFa: '💠 ارتقای باشکوه به طومار لعابِ فیروزه!',
    subHeadlineFa: 'همهٔ کارت‌های این مجموعه به سطح فیروزه رسیدند و قدرت طومار دوچندان شد!',
    confettiBursts: 2,
    confettiColors: ['#7CF3FF', '#189AB4', '#FFD666', '#E6FCFF'],
  },
  3: {
    beamCount: 28,
    smokeCount: 16,
    particleCount: 46,
    shockwaveCount: 3,
    shakeIntensity: 2,
    sunCore: '#FFFFFF',
    sunWarmGold: '#FFF4C2',
    rayPrimary: '#FFE58F',
    raySecondary: '#FFA938',
    smokeColor1: 'rgba(245, 184, 54, 0.48)',
    smokeColor2: 'rgba(255, 232, 150, 0.34)',
    bgRadial1: 'rgba(230, 158, 24, 0.65)',
    bgRadial2: 'rgba(20, 13, 3, 0.96)',
    headlineFa: '👑 تجلیِ طومار زرینِ درباری!',
    subHeadlineFa: 'شاهکار کورهٔ سفالگری! طومار مجموعهٔ شما با طلای ناب و لاجورد درباری تذهیب شد!',
    confettiBursts: 3,
    confettiColors: ['#FFF3A8', '#E5A524', '#FFD666', '#3B82F6', '#FFFFFF'],
  },
  4: {
    beamCount: 36,
    smokeCount: 22,
    particleCount: 68,
    shockwaveCount: 4,
    shakeIntensity: 3,
    sunCore: '#FFFFFF',
    sunWarmGold: '#FFF5C8',
    rayPrimary: '#FFE899',
    raySecondary: '#64F5C1',
    smokeColor1: 'rgba(255, 224, 130, 0.45)',
    smokeColor2: 'rgba(18, 165, 112, 0.48)',
    bgRadial1: 'rgba(22, 150, 102, 0.72)',
    bgRadial2: 'rgba(3, 22, 14, 0.97)',
    headlineFa: '💚👑 دستاورد افسانه‌ای: طومار زمردیِ شاهانه!',
    subHeadlineFa: 'والاترین جایزهٔ بازی! تمامی کارت‌های این مجموعه به کمالِ زمرد شاهانه رسیدند!',
    confettiBursts: 5,
    confettiColors: ['#80FFCC', '#129666', '#FFE285', '#FFD700', '#FFFFFF', '#059669'],
  },
};

export const ScrollRevealCeremony: React.FC<ScrollRevealCeremonyProps> = ({
  award,
  onEquipNow,
  onClose,
}) => {
  const uid = useId().replace(/:/g, '');

  const [selectedTier, setSelectedTier] = useState<1 | 2 | 3 | 4>(() => award?.tier || 4);
  const [replaySeed, setReplaySeed] = useState(1);

  const [elapsedMs, setElapsedMs] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (award?.tier) {
      setSelectedTier(award.tier);
    }
  }, [award?.tier]);

  const activeTitle = award?.titleFa || 'هفت‌خوان رستم';
  const activeSubtitle =
    award?.subtitleFa || `${toFa(award?.totalCards || 7)} از ${toFa(award?.totalCards || 7)} کارت کامل`;

  const tierCfg = TIER_CEREMONY_CONFIG[selectedTier];
  const scrollTheme = SCROLL_STAGE_THEMES[selectedTier];

  // Realistic Crepuscular Solar Rays (`شعاع‌های نور خورشیدی طبیعی و حجمی`)
  // Combines wide feathered atmospheric shafts + delicate golden sun filaments
  const solarBeams = useMemo<SolarBeam[]>(() => {
    const beams: SolarBeam[] = [];
    const total = tierCfg.beamCount;

    for (let i = 0; i < total; i++) {
      const isWide = i % 2 === 0;
      const baseSlice = (i / total) * 360;
      // Organic angular spacing so beams cluster naturally like sunlight through clouds
      const jitter = (Math.random() - 0.5) * (360 / total) * 1.35;
      const warmthRoll = Math.random();

      beams.push({
        id: i,
        angleDeg: (baseSlice + jitter + 360) % 360,
        // Wide volumetric shafts vs delicate golden sun filaments
        spreadDeg: isWide
          ? 12 + Math.random() * (10 + selectedTier * 2.5)
          : 3.5 + Math.random() * 5.5,
        lengthPx: isWide
          ? 240 + Math.random() * (95 + selectedTier * 42)
          : 190 + Math.random() * (110 + selectedTier * 38),
        // Very slow, majestic atmospheric drift (1.2 to 3.5 deg/sec) — never spins like a wheel
        driftSpeed: (isWide ? 1 : -1) * (0.8 + Math.random() * 2.2),
        shimmerSpeed: 0.9 + Math.random() * 1.8,
        shimmerPhase: Math.random() * Math.PI * 2,
        maxAlpha: isWide
          ? 0.22 + Math.random() * (0.08 * selectedTier)
          : 0.35 + Math.random() * (0.1 * selectedTier),
        layer: isWide ? 'wide' : 'filament',
        warmth: warmthRoll > 0.65 ? 'core' : warmthRoll > 0.3 ? 'gold' : 'accent',
      });
    }
    return beams;
  }, [selectedTier, replaySeed, tierCfg.beamCount]);

  // Volumetric golden mist & incense clouds
  const smokePuffs = useMemo<SmokePuff[]>(() => {
    return Array.from({ length: tierCfg.smokeCount }, (_, i) => {
      const angle = (i / tierCfg.smokeCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
      const dist = 45 + Math.random() * (75 + selectedTier * 25);
      return {
        id: i,
        angle,
        distance: dist,
        size: 85 + Math.random() * (70 + selectedTier * 24),
        delay: Math.random() * 0.45,
        duration: 2.4 + Math.random() * 2.0,
        driftX: Math.cos(angle) * dist,
        driftY: Math.sin(angle) * dist - 20,
        color: i % 2 === 0 ? tierCfg.smokeColor1 : tierCfg.smokeColor2,
      };
    });
  }, [selectedTier, replaySeed, tierCfg]);

  // Sunlit dust motes & golden/emerald sparkles floating in the sunbeams
  const sunlitMotes = useMemo<SunlitMote[]>(() => {
    return Array.from({ length: tierCfg.particleCount }, (_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const dist = 65 + Math.random() * (120 + selectedTier * 35);
      return {
        id: i,
        angle,
        dist,
        size: 3.5 + Math.random() * (selectedTier === 4 ? 7 : 5),
        delay: Math.random() * 0.65,
        duration: 1.6 + Math.random() * 2.0,
        isGem: i % 4 === 0,
      };
    });
  }, [selectedTier, replaySeed, tierCfg]);

  // Drive smooth 60fps timeline for Model 2 (Simorgh Spiral Descent -> Seal Shatter -> Roller Unrolling -> Solar Corona)
  useEffect(() => {
    const start = performance.now();
    setElapsedMs(0);

    soundEngine.playScrollWhoosh();

    const tick = (now: number) => {
      const dt = now - start;
      setElapsedMs(dt);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    const timers: number[] = [];

    timers.push(
      window.setTimeout(() => {
        soundEngine.playScrollUnroll();
      }, 850),
    );

    timers.push(
      window.setTimeout(() => {
        soundEngine.playScrollGrandFanfare(selectedTier);
      }, 1120),
    );

    const burstCount = tierCfg.confettiBursts;
    for (let b = 0; b < burstCount; b++) {
      const t = window.setTimeout(() => {
        try {
          confetti({
            particleCount: 35 + selectedTier * 22,
            spread: 65 + b * 18,
            origin: {
              x: b % 2 === 0 ? 0.5 : b % 4 === 1 ? 0.25 : 0.75,
              y: 0.48,
            },
            colors: tierCfg.confettiColors,
            disableForReducedMotion: true,
          });
        } catch {}
      }, 1120 + b * 360);
      timers.push(t);
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [selectedTier, replaySeed, tierCfg]);

  // Timeline phases:
  // 0..1050ms: Phase 1 (Model 2: Simorgh Spiral Vortex Descent of Closed Scroll)
  // 1050..2350ms: Phase 2 (Seal Shatters + Rollers Unroll from center + Solar Corona erupts)
  // 2350ms+: Phase 3 (Fully Unrolled Climax + Breathing Volumetric Sunbeams)
  const spinPhaseProgress = Math.min(1, elapsedMs / 1050);
  const rawUnroll = Math.max(0, Math.min(1, (elapsedMs - 1020) / 1220));
  const unrollProgress =
    rawUnroll <= 0
      ? 0
      : rawUnroll >= 1
      ? 1
      : 1 - Math.pow(1 - rawUnroll, 3);

  const isBurstTriggered = elapsedMs >= 1000;
  const timeSec = elapsedMs / 1000;

  // Exclusively Model 2 (`مدل ۲: عروج سیمرغ`) 3D Transform
  const computeSimorghTransform = (): string => {
    const p = spinPhaseProgress;
    const easeOut = 1 - Math.pow(1 - p, 3);

    let shakeX = 0;
    let shakeY = 0;
    if (elapsedMs >= 980 && elapsedMs <= 1480 && tierCfg.shakeIntensity > 0) {
      const decay = 1 - (elapsedMs - 980) / 500;
      const amp = tierCfg.shakeIntensity * 4.0 * decay;
      shakeX = Math.sin(elapsedMs * 0.09) * amp;
      shakeY = Math.cos(elapsedMs * 0.11) * amp;
    }

    const floatY = elapsedMs > 2300 ? Math.sin((elapsedMs - 2300) * 0.0028) * 5 : 0;

    // Model 2: Simorgh Spiral Vortex Descent
    const dropY = (1 - easeOut) * -180;
    const rotZ = (1 - easeOut) * 540;
    const rotX = (1 - easeOut) * 55;
    const scale = 0.35 + easeOut * 0.65;
    return `translate3d(${shakeX}px, ${dropY + shakeY + floatY}px, 0) perspective(900px) rotateX(${rotX}deg) rotateZ(${rotZ}deg) scale(${scale})`;
  };

  const topRollerY = 108 - unrollProgress * 92;
  const bottomRollerY = 130 + unrollProgress * 92;
  const bodyTopY = topRollerY + 14;
  const bodyBottomY = bottomRollerY + 6;

  const shamsaPoints = useMemo(() => {
    const pts: string[] = [];
    for (let i = 0; i < 16; i++) {
      const angle = (i * Math.PI) / 8 - Math.PI / 2;
      const r = i % 2 === 0 ? 36 : 24;
      const x = 100 + Math.cos(angle) * r;
      const y = 118 + Math.sin(angle) * r;
      pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return pts.join(' ');
  }, []);

  const pearls = useMemo(
    () =>
      Array.from({ length: 12 }, (_, idx) => {
        const angle = (idx * Math.PI * 2) / 12;
        return {
          cx: 100 + Math.cos(angle) * 19,
          cy: 118 + Math.sin(angle) * 19,
        };
      }),
    [],
  );

  // Helper to build a soft, rounded solar beam wedge starting from inner radius r0 to outer radius r1
  const buildSunbeamPath = (angleDeg: number, spreadDeg: number, lengthPx: number): string => {
    const halfSpread = spreadDeg / 2;
    const a1 = ((angleDeg - halfSpread) * Math.PI) / 180;
    const a2 = ((angleDeg + halfSpread) * Math.PI) / 180;
    const aMid = (angleDeg * Math.PI) / 180;

    // Inner base slightly offset so rays emerge smoothly from behind the scroll body
    const r0 = 18;
    const x01 = Math.cos(a1) * r0;
    const y01 = Math.sin(a1) * r0;
    const x02 = Math.cos(a2) * r0;
    const y02 = Math.sin(a2) * r0;

    // Outer feathered arc
    const x1 = Math.cos(a1) * lengthPx;
    const y1 = Math.sin(a1) * lengthPx;
    const x2 = Math.cos(a2) * lengthPx;
    const y2 = Math.sin(a2) * lengthPx;
    const xCtrl = Math.cos(aMid) * (lengthPx * 1.08);
    const yCtrl = Math.sin(aMid) * (lengthPx * 1.08);

    return `M ${x01.toFixed(1)} ${y01.toFixed(1)} L ${x1.toFixed(1)} ${y1.toFixed(1)} Q ${xCtrl.toFixed(1)} ${yCtrl.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)} L ${x02.toFixed(1)} ${y02.toFixed(1)} Z`;
  };

  // Smooth breathing factor for the solar corona
  const coronaBreath = 1 + 0.045 * Math.sin(timeSec * 2.1);

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-[999] flex flex-col items-center justify-between overflow-y-auto scrollbar-hide p-3 sm:p-5 select-none"
      style={{
        background: `radial-gradient(circle at 50% 44%, ${tierCfg.bgRadial1} 0%, ${tierCfg.bgRadial2} 74%, #050302 100%)`,
        backdropFilter: 'blur(14px)',
      }}
    >
      {/* Top Bar: Close + Replay */}
      <div className="w-full max-w-3xl flex items-center justify-between gap-2 z-30 shrink-0">
        <button
          type="button"
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-black/45 text-[#FFF8EE] border border-white/20 flex items-center justify-center hover:bg-black/70 active:scale-95"
          title="بستن"
        >
          <X size={18} />
        </button>
        <button
          type="button"
          onClick={() => setReplaySeed((s) => s + 1)}
          className="px-3.5 py-2 rounded-full text-xs font-black text-[#FFF9EE] bg-white/15 border border-white/25 flex items-center gap-1.5 hover:bg-white/25 active:scale-95"
        >
          <RotateCcw size={14} />
          <span>پخش دوباره</span>
        </button>
      </div>

      {/* =====================================================================
          CENTER STAGE: REALISTIC SOLAR CORONA, CREPUSCULAR SUNBEAMS & SCROLL
      ===================================================================== */}
      <div className="relative flex-1 w-full max-w-2xl flex flex-col items-center justify-center my-2 min-h-[360px] sm:min-h-[430px]">
        {/* 1. REALISTIC VOLUMETRIC SOLAR RAYS & GOLDEN SUN CORONA (`شعاع‌های نور خورشیدی طبیعی و واقعی`) */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-visible"
          style={{
            opacity: isBurstTriggered
              ? Math.min(1, (elapsedMs - 950) / 550)
              : 0.25 * spinPhaseProgress,
            transition: 'opacity 220ms ease-out',
          }}
        >
          {/* Soft ambient golden bloom behind everything */}
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: `${340 + selectedTier * 55}px`,
              height: `${340 + selectedTier * 55}px`,
              background: `radial-gradient(circle, ${tierCfg.sunCore} 0%, ${tierCfg.sunWarmGold} 24%, ${tierCfg.rayPrimary} 48%, transparent 74%)`,
              opacity: 0.58,
              filter: 'blur(28px)',
              transform: `scale(${coronaBreath.toFixed(3)})`,
              mixBlendMode: 'screen',
            }}
          />

          {/* Horizontal Anamorphic Solar Flare Streak */}
          {isBurstTriggered && (
            <div
              className="absolute pointer-events-none"
              style={{
                width: `${420 + selectedTier * 65}px`,
                height: '18px',
                background: `radial-gradient(ellipse at center, #FFFFFF 0%, ${tierCfg.sunWarmGold} 38%, transparent 78%)`,
                opacity: 0.65 * Math.min(1, (elapsedMs - 1000) / 400),
                filter: 'blur(6px)',
                mixBlendMode: 'screen',
              }}
            />
          )}

          <svg
            viewBox="-480 -480 960 960"
            className="w-[480px] h-[480px] sm:w-[680px] sm:h-[680px] overflow-visible"
          >
            <defs>
              {/* Soft Gaussian Blur filters that make the rays look like real atmospheric sunlight instead of hard polygons */}
              <filter id={`sun-wide-blur-${uid}`} x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="14" />
              </filter>
              <filter id={`sun-filament-blur-${uid}`} x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="4.5" />
              </filter>

              {/* Warm Solar Radial Gradients */}
              <radialGradient id={`sun-gold-${uid}`} cx="0" cy="0" r="380" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.98" />
                <stop offset="16%" stopColor={tierCfg.sunWarmGold} stopOpacity="0.88" />
                <stop offset="48%" stopColor={tierCfg.rayPrimary} stopOpacity="0.38" />
                <stop offset="82%" stopColor={tierCfg.raySecondary} stopOpacity="0.08" />
                <stop offset="100%" stopColor={tierCfg.raySecondary} stopOpacity="0" />
              </radialGradient>

              <radialGradient id={`sun-accent-${uid}`} cx="0" cy="0" r="360" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
                <stop offset="22%" stopColor={tierCfg.rayPrimary} stopOpacity="0.75" />
                <stop offset="60%" stopColor={tierCfg.raySecondary} stopOpacity="0.28" />
                <stop offset="100%" stopColor={tierCfg.raySecondary} stopOpacity="0" />
              </radialGradient>

              <radialGradient id={`sun-core-beam-${uid}`} cx="0" cy="0" r="340" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
                <stop offset="28%" stopColor={tierCfg.sunWarmGold} stopOpacity="0.82" />
                <stop offset="68%" stopColor={tierCfg.rayPrimary} stopOpacity="0.22" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
              </radialGradient>

              <radialGradient id={`corona-center-${uid}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
                <stop offset="26%" stopColor={tierCfg.sunWarmGold} stopOpacity="0.85" />
                <stop offset="58%" stopColor={tierCfg.rayPrimary} stopOpacity="0.38" />
                <stop offset="100%" stopColor={tierCfg.raySecondary} stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Layer A: Wide, Softly Blurred Crepuscular Sun Shafts */}
            <g filter={`url(#sun-wide-blur-${uid})`} style={{ mixBlendMode: 'screen' }}>
              {solarBeams
                .filter((b) => b.layer === 'wide')
                .map((beam) => {
                  const angle = beam.angleDeg + timeSec * beam.driftSpeed;
                  const shimmer =
                    0.65 + 0.35 * Math.sin(timeSec * beam.shimmerSpeed + beam.shimmerPhase);
                  const len = beam.lengthPx * (0.9 + 0.14 * shimmer);
                  const spread = beam.spreadDeg * (0.92 + 0.12 * shimmer);
                  const fillUrl =
                    beam.warmth === 'core'
                      ? `url(#sun-core-beam-${uid})`
                      : beam.warmth === 'gold'
                      ? `url(#sun-gold-${uid})`
                      : `url(#sun-accent-${uid})`;

                  return (
                    <path
                      key={beam.id}
                      d={buildSunbeamPath(angle, spread, len)}
                      fill={fillUrl}
                      opacity={(beam.maxAlpha * shimmer).toFixed(3)}
                    />
                  );
                })}
            </g>

            {/* Layer B: Fine Shimmering Solar Filaments */}
            <g filter={`url(#sun-filament-blur-${uid})`} style={{ mixBlendMode: 'screen' }}>
              {solarBeams
                .filter((b) => b.layer === 'filament')
                .map((beam) => {
                  const angle = beam.angleDeg + timeSec * beam.driftSpeed;
                  const shimmer =
                    0.5 + 0.5 * Math.sin(timeSec * beam.shimmerSpeed + beam.shimmerPhase);
                  const len = beam.lengthPx * (0.86 + 0.2 * shimmer);
                  const spread = beam.spreadDeg * (0.85 + 0.2 * shimmer);
                  const fillUrl =
                    beam.warmth === 'accent'
                      ? `url(#sun-accent-${uid})`
                      : `url(#sun-core-beam-${uid})`;

                  return (
                    <path
                      key={beam.id}
                      d={buildSunbeamPath(angle, spread, len)}
                      fill={fillUrl}
                      opacity={(beam.maxAlpha * shimmer).toFixed(3)}
                    />
                  );
                })}
            </g>

            {/* Layer C: Central Blazing Solar Corona Disc behind the Scroll */}
            <circle
              cx="0"
              cy="0"
              r={(125 + selectedTier * 30) * coronaBreath}
              fill={`url(#corona-center-${uid})`}
              style={{ mixBlendMode: 'screen' }}
            />
          </svg>
        </div>

        {/* 2. VOLUMETRIC MIST & INCENSE SMOKE CLOUDS */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {smokePuffs.map((puff) => {
            const puffProgress = Math.max(
              0,
              Math.min(1, (timeSec - 0.85 - puff.delay) / puff.duration),
            );
            const x = puff.driftX * puffProgress;
            const y = puff.driftY * puffProgress;
            const scale = 0.4 + puffProgress * 1.65;
            const opacity =
              puffProgress <= 0
                ? 0
                : puffProgress < 0.3
                ? (puffProgress / 0.3) * 0.72
                : (1 - (puffProgress - 0.3) / 0.7) * 0.72;

            return (
              <div
                key={puff.id}
                className="absolute rounded-full pointer-events-none"
                style={{
                  width: `${puff.size}px`,
                  height: `${puff.size}px`,
                  background: `radial-gradient(circle, ${puff.color} 0%, transparent 72%)`,
                  transform: `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) scale(${scale.toFixed(2)})`,
                  opacity: Math.max(0, opacity),
                  filter: 'blur(12px)',
                  mixBlendMode: 'screen',
                }}
              />
            );
          })}
        </div>

        {/* 3. SOLAR SHOCKWAVE RINGS AT MOMENT OF UNSEALING */}
        {isBurstTriggered && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {Array.from({ length: tierCfg.shockwaveCount }, (_, idx) => {
              const waveElapsed = elapsedMs - 1000 - idx * 190;
              if (waveElapsed <= 0 || waveElapsed > 1250) return null;
              const p = waveElapsed / 1250;
              const radius = 32 + p * (225 + selectedTier * 42);
              const opacity = Math.pow(1 - p, 1.8) * 0.75;
              return (
                <div
                  key={idx}
                  className="absolute rounded-full border pointer-events-none"
                  style={{
                    width: `${radius * 2}px`,
                    height: `${radius * 2}px`,
                    borderColor: idx % 2 === 0 ? tierCfg.sunWarmGold : tierCfg.rayPrimary,
                    boxShadow: `0 0 28px ${tierCfg.sunWarmGold}`,
                    opacity,
                  }}
                />
              );
            })}
          </div>
        )}

        {/* 4. FLOATING SUNLIT DUST MOTES & GOLDEN SPARKS */}
        {isBurstTriggered && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {sunlitMotes.map((sp) => {
              const spProgress = Math.max(
                0,
                Math.min(1, (timeSec - 1.0 - sp.delay) / sp.duration),
              );
              if (spProgress <= 0 || spProgress >= 1) return null;
              const ease = 1 - Math.pow(1 - spProgress, 2.2);
              const x = Math.cos(sp.angle) * sp.dist * ease;
              const y = Math.sin(sp.angle) * sp.dist * ease - spProgress * 28;
              const opacity = spProgress < 0.2 ? spProgress * 5 : 1 - (spProgress - 0.2) / 0.8;

              return (
                <div
                  key={sp.id}
                  className="absolute pointer-events-none"
                  style={{
                    width: `${sp.size}px`,
                    height: `${sp.size}px`,
                    borderRadius: sp.isGem ? '2px' : '9999px',
                    backgroundColor: sp.isGem ? tierCfg.rayPrimary : '#FFFDF5',
                    boxShadow: `0 0 12px ${tierCfg.sunWarmGold}`,
                    transform: `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${
                      spProgress * 360
                    }deg)`,
                    opacity,
                  }}
                />
              );
            })}
          </div>
        )}

        {/* 5. THE ANIMATED UNROLLING SCROLL (Model 2: Simorgh Descent & Royal Unfurling) */}
        <div
          className="relative z-20 w-[210px] sm:w-[248px]"
          style={{
            transform: computeSimorghTransform(),
            filter: `drop-shadow(0 18px 38px rgba(0,0,0,0.65)) drop-shadow(${scrollTheme.glow})`,
          }}
        >
          <svg
            viewBox="0 0 200 260"
            className="w-full h-auto overflow-visible"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id={`cer-roller-${uid}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={scrollTheme.rollerDeep} />
                <stop offset="28%" stopColor={scrollTheme.rollerTop} />
                <stop offset="55%" stopColor={scrollTheme.rollerMid} />
                <stop offset="100%" stopColor={scrollTheme.rollerDeep} />
              </linearGradient>

              <linearGradient id={`cer-finial-${uid}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={scrollTheme.finialLight} />
                <stop offset="50%" stopColor={scrollTheme.finialMid} />
                <stop offset="100%" stopColor={scrollTheme.finialDark} />
              </linearGradient>

              <linearGradient id={`cer-parchment-${uid}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={scrollTheme.rollerDeep} stopOpacity="0.45" />
                <stop offset="8%" stopColor={scrollTheme.parchmentTop} />
                <stop offset="50%" stopColor={scrollTheme.parchmentMid} />
                <stop offset="92%" stopColor={scrollTheme.parchmentBot} />
                <stop offset="100%" stopColor={scrollTheme.rollerDeep} stopOpacity="0.5" />
              </linearGradient>

              <radialGradient id={`cer-gem-${uid}`} cx="36%" cy="32%" r="68%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
                <stop offset="24%" stopColor={scrollTheme.gemLight} />
                <stop offset="68%" stopColor={scrollTheme.gemMid} />
                <stop offset="100%" stopColor={scrollTheme.gemDeep} />
              </radialGradient>

              <linearGradient id={`cer-shamsa-${uid}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={scrollTheme.sideBorderStroke} />
                <stop offset="50%" stopColor={scrollTheme.shamsaOuter} />
                <stop offset="100%" stopColor={scrollTheme.shamsaInner} />
              </linearGradient>

              <clipPath id={`unroll-clip-${uid}`}>
                <rect
                  x="0"
                  y={bodyTopY}
                  width="200"
                  height={Math.max(0, bodyBottomY - bodyTopY)}
                />
              </clipPath>
            </defs>

            {/* Tier 4 Royal Homa Golden Wings unfurling behind the scroll as it opens */}
            {selectedTier === 4 && unrollProgress > 0.25 && (
              <g
                opacity={Math.min(1, (unrollProgress - 0.25) / 0.55)}
                transform={`scale(${0.75 + 0.25 * unrollProgress})`}
                style={{ transformOrigin: '100px 125px' }}
              >
                <path
                  d="M 32 135 C -18 110, -26 58, 18 28 C 2 62, 14 95, 36 112 Z"
                  fill={`url(#cer-shamsa-${uid})`}
                  stroke="#FFE285"
                  strokeWidth="1.5"
                />
                <path
                  d="M 30 152 C -12 136, -18 88, 14 58 C 4 88, 16 115, 34 132 Z"
                  fill="#129666"
                  stroke="#FFE285"
                  strokeWidth="1.2"
                />
                <path
                  d="M 168 135 C 218 110, 226 58, 182 28 C 198 62, 186 95, 164 112 Z"
                  fill={`url(#cer-shamsa-${uid})`}
                  stroke="#FFE285"
                  strokeWidth="1.5"
                />
                <path
                  d="M 170 152 C 212 136, 218 88, 186 58 C 196 88, 184 115, 166 132 Z"
                  fill="#129666"
                  stroke="#FFE285"
                  strokeWidth="1.2"
                />
              </g>
            )}

            {/* CLIPPED UNROLLING SAMARKAND PARCHMENT BODY */}
            <g clipPath={`url(#unroll-clip-${uid})`}>
              <path
                d="
                  M 30 28
                  L 170 28
                  C 173 65, 168 95, 171 130
                  C 173 165, 168 195, 170 232
                  L 30 232
                  C 32 195, 27 165, 29 130
                  C 32 95, 27 65, 30 28
                  Z
                "
                fill={`url(#cer-parchment-${uid})`}
                stroke={scrollTheme.parchmentEdge}
                strokeWidth="2.4"
              />

              <rect
                x="34"
                y="32"
                width="9"
                height="196"
                fill={scrollTheme.sideBorderBg}
                stroke={scrollTheme.sideBorderStroke}
                strokeWidth="1"
              />
              <rect
                x="157"
                y="32"
                width="9"
                height="196"
                fill={scrollTheme.sideBorderBg}
                stroke={scrollTheme.sideBorderStroke}
                strokeWidth="1"
              />

              {[52, 76, 100, 124, 148, 172, 196].map((cy) => (
                <g key={cy} fill={scrollTheme.sideBorderStroke} opacity="0.9">
                  <polygon points={`38.5,${cy - 4} 41.5,${cy} 38.5,${cy + 4} 35.5,${cy}`} />
                  <polygon points={`161.5,${cy - 4} 164.5,${cy} 161.5,${cy + 4} 158.5,${cy}`} />
                </g>
              ))}

              <path
                d="M 52 44 L 148 44 L 142 62 Q 100 68 58 62 Z"
                fill={scrollTheme.sideBorderBg}
                stroke={scrollTheme.sideBorderStroke}
                strokeWidth="1.2"
              />
              <text
                x="100"
                y="57"
                textAnchor="middle"
                fontSize="10"
                fontWeight="900"
                fill={scrollTheme.badgeText}
              >
                {scrollTheme.shortFa}
              </text>

              <circle
                cx="100"
                cy="118"
                r="41"
                fill="none"
                stroke={scrollTheme.sideBorderStroke}
                strokeWidth="1.3"
                strokeDasharray="3 3"
              />
              <polygon
                points={shamsaPoints}
                fill={`url(#cer-shamsa-${uid})`}
                stroke={scrollTheme.sideBorderStroke}
                strokeWidth="1.8"
              />
              <circle
                cx="100"
                cy="118"
                r="22.5"
                fill={scrollTheme.shamsaInner}
                stroke={scrollTheme.sideBorderStroke}
                strokeWidth="1.2"
              />
              {pearls.map((p, idx) => (
                <circle
                  key={idx}
                  cx={p.cx}
                  cy={p.cy}
                  r="2.2"
                  fill={scrollTheme.pearlFill}
                  stroke={scrollTheme.parchmentEdge}
                  strokeWidth="0.5"
                />
              ))}

              <circle
                cx="100"
                cy="118"
                r="14.5"
                fill={`url(#cer-gem-${uid})`}
                stroke={scrollTheme.sideBorderStroke}
                strokeWidth="1.6"
              />
              <ellipse
                cx="95"
                cy="113"
                rx="5.5"
                ry="3"
                transform="rotate(-25 95 113)"
                fill="#FFFFFF"
                opacity="0.7"
              />
              <text
                x="100"
                y="123"
                textAnchor="middle"
                fontSize="12"
                fontWeight="900"
                fill="#FFFFFF"
              >
                {'★'.repeat(selectedTier)}
              </text>

              <text
                x="100"
                y="175"
                textAnchor="middle"
                fontSize="13.5"
                fontWeight="900"
                fill={scrollTheme.titleColor}
              >
                {activeTitle.length > 18 ? `${activeTitle.slice(0, 17)}…` : activeTitle}
              </text>

              <path
                d="M 62 183 L 138 183"
                stroke={scrollTheme.parchmentEdge}
                strokeWidth="1"
                opacity="0.6"
              />

              <rect
                x="50"
                y="191"
                width="100"
                height="20"
                rx="10"
                fill={scrollTheme.badgeBg}
                stroke={scrollTheme.sideBorderStroke}
                strokeWidth="1"
              />
              <text
                x="100"
                y="204.5"
                textAnchor="middle"
                fontSize="9.5"
                fontWeight="800"
                fill={scrollTheme.badgeText}
              >
                {activeSubtitle}
              </text>
            </g>

            {/* ANIMATED TOP ROLLED CYLINDER */}
            <g transform={`translate(0, ${topRollerY - 16})`}>
              <rect
                x="12"
                y="22"
                width="10"
                height="12"
                rx="2"
                fill={`url(#cer-finial-${uid})`}
                stroke={scrollTheme.rollerDeep}
                strokeWidth="1.2"
              />
              <path
                d="M 12 20 C 4 20, 2 28, 12 36 Z"
                fill={`url(#cer-finial-${uid})`}
                stroke={scrollTheme.rollerDeep}
                strokeWidth="1.2"
              />
              <rect
                x="178"
                y="22"
                width="10"
                height="12"
                rx="2"
                fill={`url(#cer-finial-${uid})`}
                stroke={scrollTheme.rollerDeep}
                strokeWidth="1.2"
              />
              <path
                d="M 188 20 C 196 20, 198 28, 188 36 Z"
                fill={`url(#cer-finial-${uid})`}
                stroke={scrollTheme.rollerDeep}
                strokeWidth="1.2"
              />

              <rect
                x="20"
                y="16"
                width="160"
                height="22"
                rx="11"
                fill={`url(#cer-roller-${uid})`}
                stroke={scrollTheme.rollerDeep}
                strokeWidth="1.8"
              />
              <rect
                x="28"
                y="16.5"
                width="14"
                height="21"
                fill={scrollTheme.tileBand}
                stroke={scrollTheme.tileAccent}
                strokeWidth="1"
              />
              <rect
                x="158"
                y="16.5"
                width="14"
                height="21"
                fill={scrollTheme.tileBand}
                stroke={scrollTheme.tileAccent}
                strokeWidth="1"
              />
              <ellipse
                cx="24"
                cy="27"
                rx="4"
                ry="9"
                fill={scrollTheme.parchmentMid}
                stroke={scrollTheme.rollerDeep}
                strokeWidth="1.2"
              />
              <ellipse
                cx="176"
                cy="27"
                rx="4"
                ry="9"
                fill={scrollTheme.parchmentMid}
                stroke={scrollTheme.rollerDeep}
                strokeWidth="1.2"
              />
              <line
                x1="46"
                y1="22"
                x2="154"
                y2="22"
                stroke="#FFFFFF"
                strokeOpacity="0.5"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </g>

            {/* ANIMATED BOTTOM ROLLED CYLINDER */}
            <g transform={`translate(0, ${bottomRollerY - 222})`}>
              <rect
                x="12"
                y="226"
                width="10"
                height="12"
                rx="2"
                fill={`url(#cer-finial-${uid})`}
                stroke={scrollTheme.rollerDeep}
                strokeWidth="1.2"
              />
              <path
                d="M 12 224 C 4 224, 2 232, 12 240 Z"
                fill={`url(#cer-finial-${uid})`}
                stroke={scrollTheme.rollerDeep}
                strokeWidth="1.2"
              />
              <rect
                x="178"
                y="226"
                width="10"
                height="12"
                rx="2"
                fill={`url(#cer-finial-${uid})`}
                stroke={scrollTheme.rollerDeep}
                strokeWidth="1.2"
              />
              <path
                d="M 188 224 C 196 224, 198 232, 188 240 Z"
                fill={`url(#cer-finial-${uid})`}
                stroke={scrollTheme.rollerDeep}
                strokeWidth="1.2"
              />

              <rect
                x="20"
                y="222"
                width="160"
                height="22"
                rx="11"
                fill={`url(#cer-roller-${uid})`}
                stroke={scrollTheme.rollerDeep}
                strokeWidth="1.8"
              />
              <rect
                x="28"
                y="222.5"
                width="14"
                height="21"
                fill={scrollTheme.tileBand}
                stroke={scrollTheme.tileAccent}
                strokeWidth="1"
              />
              <rect
                x="158"
                y="222.5"
                width="14"
                height="21"
                fill={scrollTheme.tileBand}
                stroke={scrollTheme.tileAccent}
                strokeWidth="1"
              />
              <ellipse
                cx="24"
                cy="233"
                rx="4"
                ry="9"
                fill={scrollTheme.parchmentMid}
                stroke={scrollTheme.rollerDeep}
                strokeWidth="1.2"
              />
              <ellipse
                cx="176"
                cy="233"
                rx="4"
                ry="9"
                fill={scrollTheme.parchmentMid}
                stroke={scrollTheme.rollerDeep}
                strokeWidth="1.2"
              />
              <line
                x1="46"
                y1="228"
                x2="154"
                y2="228"
                stroke="#FFFFFF"
                strokeOpacity="0.45"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </g>

            {/* CLOSED-SCROLL SILK CORD & GLOWING SEAL */}
            {unrollProgress < 0.22 && (
              <g opacity={1 - unrollProgress / 0.22}>
                <rect
                  x="92"
                  y={topRollerY - 2}
                  width="16"
                  height={bottomRollerY - topRollerY + 26}
                  rx="4"
                  fill={scrollTheme.sideBorderBg}
                  stroke={scrollTheme.sideBorderStroke}
                  strokeWidth="1.5"
                />
                <circle
                  cx="100"
                  cy={(topRollerY + bottomRollerY) / 2 + 11}
                  r="16"
                  fill={`url(#cer-gem-${uid})`}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />
                <text
                  x="100"
                  y={(topRollerY + bottomRollerY) / 2 + 16}
                  textAnchor="middle"
                  fontSize="13"
                  fontWeight="900"
                  fill="#FFFFFF"
                >
                  ✦
                </text>
              </g>
            )}
          </svg>
        </div>

        {/* Proclamation Title & Banner underneath the unrolling scroll */}
        <div
          className="relative z-30 text-center mt-4 px-4 max-w-lg transition-all duration-500"
          style={{
            opacity: unrollProgress > 0.35 ? 1 : 0,
            transform: `translateY(${unrollProgress > 0.35 ? 0 : 16}px)`,
          }}
        >
          <div
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black mb-1.5 shadow-lg border"
            style={{
              backgroundColor: scrollTheme.badgeBg,
              color: scrollTheme.badgeText,
              borderColor: scrollTheme.sideBorderStroke,
            }}
          >
            <Crown size={14} />
            <span>{scrollTheme.nameFa}</span>
          </div>

          <h2
            className="text-lg sm:text-2xl font-black text-[#FFFDF5]"
            style={{ textShadow: '0 2px 14px rgba(0,0,0,0.85)' }}
          >
            {tierCfg.headlineFa}
          </h2>
          <p className="text-xs sm:text-sm font-bold text-[#F3E2C6] mt-1 leading-6">
            {tierCfg.subHeadlineFa}
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
            {award && onEquipNow && (
              <button
                type="button"
                onClick={() => {
                  onEquipNow(award.scrollKey);
                  onClose();
                }}
                className="px-5 py-2.5 rounded-2xl font-black text-xs sm:text-sm text-[#FFF9F0] flex items-center gap-2 shadow-xl active:scale-95 transition-transform"
                style={{
                  background: 'linear-gradient(180deg, #129666 0%, #064E33 100%)',
                  border: '1.5px solid #80FFCC',
                }}
              >
                <ScrollText size={16} />
                <span>+ قرار دادن فوری در قفسهٔ ۱۰ طومار کومبو</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl font-black text-xs sm:text-sm text-[#3B1E0D] bg-gradient-to-b from-[#FFF5C0] to-[#E5A524] border border-[#FFFDF2] shadow-lg active:scale-95"
            >
              ادامه و بازگشت به بازی
            </button>
          </div>
        </div>
      </div>

      {/* Bottom spacer for vertical centering */}
      <div className="h-2 shrink-0" />
    </div>
  );
};

export default ScrollRevealCeremony;
