import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Play, RotateCcw, Check, X, ScrollText, Crown, Flame } from 'lucide-react';
import { CardFamily } from '../utils/progression';
import { SCROLL_STAGE_THEMES } from './MasterScroll';

export type CeremonyModelId = 1 | 2 | 3 | 4 | 5;

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
  /** If provided, opens directly in Award Celebration Mode for this scroll */
  award?: ScrollAwardPayload | null;
  /** If true, shows the 5-Model & 4-Tier Interactive Test Lab controls */
  isTestLab?: boolean;
  initialModel?: CeremonyModelId;
  onSelectModel?: (model: CeremonyModelId) => void;
  onEquipNow?: (scrollKey: string) => void;
  onClose: () => void;
}

const STORAGE_KEY_MODEL = 'cg_scroll_ceremony_model';

export function getSavedCeremonyModel(): CeremonyModelId {
  try {
    const raw = Number(localStorage.getItem(STORAGE_KEY_MODEL));
    if (raw >= 1 && raw <= 5) return raw as CeremonyModelId;
  } catch {}
  return 1;
}

export function saveCeremonyModel(model: CeremonyModelId): void {
  try {
    localStorage.setItem(STORAGE_KEY_MODEL, String(model));
  } catch {}
}

export const CEREMONY_MODELS: {
  id: CeremonyModelId;
  nameFa: string;
  subtitleFa: string;
  badgeFa: string;
}[] = [
  {
    id: 1,
    nameFa: 'مدل ۱: چرخش تند و شکافِ مُهر کوره',
    subtitleFa: 'چرخش سه‌بعدی طومار بسته + شکستن مهر موم + موج انفجار و باز شدن لوله‌ها',
    badgeFa: 'کلاسیکِ پرهیجان',
  },
  {
    id: 2,
    nameFa: 'مدل ۲: عروج سیمرغ و پرتوهای نامتقارن',
    subtitleFa: 'فرود چرخشی از گردباد مه و پرهای زرین هما + شعاع‌های نور رندوم چندلایه',
    badgeFa: 'حماسی و اساطیری',
  },
  {
    id: 3,
    nameFa: 'مدل ۳: گنجینهٔ هزارستون و مه اسرارآمیز',
    subtitleFa: 'خروج از مه غلیظ با تابش نور از درز لوله‌های بسته + چرخش ۷۲۰ درجه و گشودن طومار',
    badgeFa: 'سنگین و موزه‌ای',
  },
  {
    id: 4,
    nameFa: 'مدل ۴: صاعقهٔ شاهوار و انفجار شمسه',
    subtitleFa: 'برخورد صاعقه‌های نور به طومار بسته + لرزش صحنه و فوران شعاع‌های نامنظم خورشیدی',
    badgeFa: 'انفجاری و خیره‌کننده',
  },
  {
    id: 5,
    nameFa: 'مدل ۵: آیین تاج‌گذاری و طوفان جواهر ساسانی',
    subtitleFa: 'چرخش مداری طومار بسته در حلقهٔ مروارید + باز شدن باشکوه با باران زمرد و طلا',
    badgeFa: 'سلطنتی و باشکوه',
  },
];

interface RandomRay {
  id: number;
  baseAngle: number;
  widthDeg: number;
  lengthPx: number;
  speedDegPerSec: number;
  pulseSpeed: number;
  pulseOffset: number;
  opacityMax: number;
  colorType: 'primary' | 'secondary' | 'white';
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

interface SparkParticle {
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
    rayCount: number;
    smokeCount: number;
    particleCount: number;
    shockwaveCount: number;
    shakeIntensity: number;
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
    rayCount: 12,
    smokeCount: 8,
    particleCount: 18,
    shockwaveCount: 1,
    shakeIntensity: 0,
    rayPrimary: '#E8A86B',
    raySecondary: '#C86D3B',
    smokeColor1: 'rgba(212, 138, 84, 0.42)',
    smokeColor2: 'rgba(138, 79, 36, 0.35)',
    bgRadial1: 'rgba(184, 84, 35, 0.42)',
    bgRadial2: 'rgba(42, 22, 10, 0.94)',
    headlineFa: '📜 طومار خشتیِ نیشابور گشوده شد!',
    subHeadlineFa: 'تمامی کارت‌های این مجموعه کامل شد و طومار خشتی به قفسهٔ کومبوی شما راه یافت',
    confettiBursts: 1,
    confettiColors: ['#E5B97B', '#C86D3B', '#F7E7C8', '#8A4F24'],
  },
  2: {
    rayCount: 20,
    smokeCount: 12,
    particleCount: 28,
    shockwaveCount: 2,
    shakeIntensity: 1,
    rayPrimary: '#7CF3FF',
    raySecondary: '#FFD666',
    smokeColor1: 'rgba(24, 154, 180, 0.48)',
    smokeColor2: 'rgba(124, 243, 255, 0.32)',
    bgRadial1: 'rgba(18, 141, 166, 0.55)',
    bgRadial2: 'rgba(7, 36, 46, 0.95)',
    headlineFa: '💠 ارتقای باشکوه به طومار لعابِ فیروزه!',
    subHeadlineFa: 'همهٔ کارت‌های این مجموعه به سطح فیروزه رسیدند و قدرت طومار دوچندان شد!',
    confettiBursts: 2,
    confettiColors: ['#7CF3FF', '#189AB4', '#FFD666', '#E6FCFF'],
  },
  3: {
    rayCount: 30,
    smokeCount: 16,
    particleCount: 42,
    shockwaveCount: 3,
    shakeIntensity: 2,
    rayPrimary: '#FFE07D',
    raySecondary: '#FF9E2C',
    smokeColor1: 'rgba(229, 165, 36, 0.55)',
    smokeColor2: 'rgba(29, 67, 133, 0.45)',
    bgRadial1: 'rgba(224, 150, 20, 0.65)',
    bgRadial2: 'rgba(20, 14, 4, 0.96)',
    headlineFa: '👑 تجلیِ طومار زرینِ درباری!',
    subHeadlineFa: 'شاهکار کورهٔ سفالگری! طومار مجموعهٔ شما با طلای ناب و لاجورد درباری تذهیب شد!',
    confettiBursts: 3,
    confettiColors: ['#FFF3A8', '#E5A524', '#FFD666', '#3B82F6', '#FFFFFF'],
  },
  4: {
    rayCount: 44,
    smokeCount: 24,
    particleCount: 64,
    shockwaveCount: 5,
    shakeIntensity: 3,
    rayPrimary: '#80FFCC',
    raySecondary: '#FFE285',
    smokeColor1: 'rgba(18, 150, 102, 0.62)',
    smokeColor2: 'rgba(255, 217, 112, 0.48)',
    bgRadial1: 'rgba(18, 150, 102, 0.78)',
    bgRadial2: 'rgba(3, 24, 15, 0.97)',
    headlineFa: '💚👑 دستاورد افسانه‌ای: طومار زمردیِ شاهانه!',
    subHeadlineFa: 'والاترین جایزهٔ بازی! تمامی کارت‌های این مجموعه به کمالِ زمرد شاهانه رسیدند!',
    confettiBursts: 5,
    confettiColors: ['#80FFCC', '#129666', '#FFE285', '#FFD700', '#FFFFFF', '#059669'],
  },
};

export const ScrollRevealCeremony: React.FC<ScrollRevealCeremonyProps> = ({
  award,
  isTestLab = false,
  initialModel,
  onSelectModel,
  onEquipNow,
  onClose,
}) => {
  const uid = useId().replace(/:/g, '');

  const [selectedModel, setSelectedModel] = useState<CeremonyModelId>(
    () => initialModel || getSavedCeremonyModel(),
  );
  const [selectedTier, setSelectedTier] = useState<1 | 2 | 3 | 4>(() => award?.tier || 4);
  const [selectedFamily, setSelectedFamily] = useState<CardFamily>(() => award?.family || 'epic');
  const [replaySeed, setReplaySeed] = useState(1);

  // Animation timeline state (0..1000ms = spin closed, 1000..1350ms = burst, 1150..2400ms = unroll rollers, 2400ms+ = climax)
  const [elapsedMs, setElapsedMs] = useState(0);
  const rafRef = useRef<number | null>(null);

  const activeTitle = award?.titleFa || 'هفت‌خوان رستم';
  const activeSubtitle =
    award?.subtitleFa || `${toFa(award?.totalCards || 7)} از ${toFa(award?.totalCards || 7)} کارت کامل`;

  const tierCfg = TIER_CEREMONY_CONFIG[selectedTier];
  const scrollTheme = SCROLL_STAGE_THEMES[selectedTier];

  // Generate non-repeating randomized rays (`شعاع‌های نور غیرتکراری و رندوم`) on every replay/tier change
  const randomRays = useMemo<RandomRay[]>(() => {
    const rays: RandomRay[] = [];
    const count = tierCfg.rayCount;
    for (let i = 0; i < count; i++) {
      // Jittered non-uniform angle so rays never look like a uniform gear
      const baseSlice = (i / count) * 360;
      const jitter = (Math.random() - 0.5) * (360 / count) * 1.45;
      const colorRoll = Math.random();
      rays.push({
        id: i,
        baseAngle: (baseSlice + jitter + 360) % 360,
        widthDeg: 1.2 + Math.random() * (selectedTier === 4 ? 9.5 : selectedTier === 3 ? 7.5 : 5.5),
        lengthPx: 150 + Math.random() * (selectedTier * 68 + 80),
        speedDegPerSec: (Math.random() - 0.5) * (selectedTier * 8 + 10),
        pulseSpeed: 1.5 + Math.random() * 4.5,
        pulseOffset: Math.random() * Math.PI * 2,
        opacityMax: 0.28 + Math.random() * (0.15 * selectedTier),
        colorType: colorRoll > 0.72 ? 'white' : colorRoll > 0.36 ? 'secondary' : 'primary',
      });
    }
    return rays;
  }, [selectedTier, replaySeed, tierCfg.rayCount]);

  // Generate volumetric smoke & mist clouds (`مه و دود کوره و بخور`)
  const smokePuffs = useMemo<SmokePuff[]>(() => {
    return Array.from({ length: tierCfg.smokeCount }, (_, i) => {
      const angle = (i / tierCfg.smokeCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
      const dist = 45 + Math.random() * (75 + selectedTier * 25);
      return {
        id: i,
        angle,
        distance: dist,
        size: 75 + Math.random() * (65 + selectedTier * 22),
        delay: Math.random() * 0.45,
        duration: 2.2 + Math.random() * 2.0,
        driftX: Math.cos(angle) * dist,
        driftY: Math.sin(angle) * dist - 20,
        color: i % 2 === 0 ? tierCfg.smokeColor1 : tierCfg.smokeColor2,
      };
    });
  }, [selectedTier, replaySeed, tierCfg]);

  // Generate flying sparks, pearls & emerald crystal shards
  const sparkParticles = useMemo<SparkParticle[]>(() => {
    return Array.from({ length: tierCfg.particleCount }, (_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const dist = 70 + Math.random() * (110 + selectedTier * 35);
      return {
        id: i,
        angle,
        dist,
        size: 4 + Math.random() * (selectedTier === 4 ? 8 : 5),
        delay: Math.random() * 0.6,
        duration: 1.4 + Math.random() * 1.8,
        isGem: i % 3 === 0,
      };
    });
  }, [selectedTier, replaySeed, tierCfg]);

  // Drive smooth 60fps timeline for closed spin -> seal shatter -> roller unrolling -> ongoing ray motion
  useEffect(() => {
    const start = performance.now();
    setElapsedMs(0);

    const tick = (now: number) => {
      const dt = now - start;
      setElapsedMs(dt);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    // Fire tier-scaled confetti waves when the scroll bursts open (~1.15s)
    const timers: number[] = [];
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
  }, [selectedModel, selectedTier, replaySeed, tierCfg]);

  // Timeline phases:
  // 0..1050ms: Phase 1 (Closed Scroll 3D Spin & Gathering Energy)
  // 1050..2350ms: Phase 2 (Seal Shatters + Rollers Unroll from center)
  // 2350ms+: Phase 3 (Fully Unrolled Climax + Continuous Non-Repeating God-Rays)
  const spinPhaseProgress = Math.min(1, elapsedMs / 1050);
  const rawUnroll = Math.max(0, Math.min(1, (elapsedMs - 1020) / 1220));
  // Smooth easeOutBack / cubic easing for the unrolling cylinders
  const unrollProgress =
    rawUnroll <= 0
      ? 0
      : rawUnroll >= 1
      ? 1
      : 1 - Math.pow(1 - rawUnroll, 3);

  const isBurstTriggered = elapsedMs >= 1000;
  const timeSec = elapsedMs / 1000;

  // Compute 3D transform of the Scroll container based on the 5 Ceremony Models
  const computeModelTransform = (): string => {
    const p = spinPhaseProgress;
    const easeOut = 1 - Math.pow(1 - p, 3);

    // Screen-shake tremor right at seal shatter (1000ms..1450ms) for higher tiers
    let shakeX = 0;
    let shakeY = 0;
    if (elapsedMs >= 980 && elapsedMs <= 1480 && tierCfg.shakeIntensity > 0) {
      const decay = 1 - (elapsedMs - 980) / 500;
      const amp = tierCfg.shakeIntensity * 4.5 * decay;
      shakeX = Math.sin(elapsedMs * 0.09) * amp;
      shakeY = Math.cos(elapsedMs * 0.11) * amp;
    }

    // Gentle floating hover after unroll completes
    const floatY = elapsedMs > 2300 ? Math.sin((elapsedMs - 2300) * 0.003) * 5 : 0;

    switch (selectedModel) {
      case 1: {
        // Model 1: Fast 3D multi-axis cyclone spin -> snap open
        const rotY = (1 - easeOut) * 1080;
        const rotZ = (1 - easeOut) * -28;
        const scale = p < 1 ? 0.28 + easeOut * 0.82 : 1 + Math.sin(Math.min(1, (elapsedMs - 1050) / 350) * Math.PI) * 0.08;
        return `translate3d(${shakeX}px, ${shakeY + floatY}px, 0) perspective(900px) rotateY(${rotY}deg) rotateZ(${rotZ}deg) scale(${scale})`;
      }
      case 2: {
        // Model 2: Simorgh Spiral Vortex Descent
        const dropY = (1 - easeOut) * -180;
        const rotZ = (1 - easeOut) * 540;
        const rotX = (1 - easeOut) * 55;
        const scale = 0.35 + easeOut * 0.65;
        return `translate3d(${shakeX}px, ${dropY + shakeY + floatY}px, 0) perspective(900px) rotateX(${rotX}deg) rotateZ(${rotZ}deg) scale(${scale})`;
      }
      case 3: {
        // Model 3: Persepolis Treasury Horizontal Barrel Roll (rotateX 720deg) emerging from mist
        const riseY = (1 - easeOut) * 140;
        const rotX = (1 - easeOut) * -720;
        const rotY = Math.sin(easeOut * Math.PI) * 22;
        const scale = 0.4 + easeOut * 0.6;
        return `translate3d(${shakeX}px, ${riseY + shakeY + floatY}px, 0) perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${scale})`;
      }
      case 4: {
        // Model 4: Celestial Thunder Figure-8 Spin + High-energy pulse
        const rotY = (1 - easeOut) * -720;
        const rotZ = Math.sin((1 - easeOut) * Math.PI * 2) * 35;
        const scale = p < 0.85 ? 0.3 + easeOut * 0.55 : 0.85 + Math.sin(((elapsedMs - 850) / 400) * Math.PI) * 0.22;
        return `translate3d(${shakeX}px, ${shakeY + floatY}px, 0) perspective(900px) rotateY(${rotY}deg) rotateZ(${rotZ}deg) scale(${Math.max(0.3, scale)})`;
      }
      case 5:
      default: {
        // Model 5: Imperial Coronation — Gyroscopic 3D tilt + regal slow-motion unroll
        const rotY = (1 - easeOut) * 720;
        const rotX = Math.sin((1 - easeOut) * Math.PI) * 40;
        const scale = 0.42 + easeOut * 0.58;
        return `translate3d(${shakeX}px, ${shakeY + floatY}px, 0) perspective(1000px) rotateY(${rotY}deg) rotateX(${rotX}deg) scale(${scale})`;
      }
    }
  };

  // Dynamic Roller Positions during Unrolling:
  // Center is Y = 130.
  // When closed (`unrollProgress = 0`): Top roller is at Y = 108, Bottom roller is at Y = 130.
  // When fully open (`unrollProgress = 1`): Top roller is at Y = 16, Bottom roller is at Y = 222.
  const topRollerY = 108 - unrollProgress * 92;
  const bottomRollerY = 130 + unrollProgress * 92;
  const bodyTopY = topRollerY + 14;
  const bodyBottomY = bottomRollerY + 6;

  // Precompute 8-point Shamsa star polygon around (100, 118)
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

  const handleSavePreferredModel = (modelId: CeremonyModelId) => {
    setSelectedModel(modelId);
    saveCeremonyModel(modelId);
    onSelectModel?.(modelId);
    setReplaySeed((s) => s + 1);
  };

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-[999] flex flex-col items-center justify-between overflow-y-auto scrollbar-hide p-3 sm:p-5 select-none"
      style={{
        background: `radial-gradient(circle at 50% 42%, ${tierCfg.bgRadial1} 0%, ${tierCfg.bgRadial2} 76%, #050302 100%)`,
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Top Bar: Close + Replay + Model/Tier Controls (when in Test Lab mode) */}
      <div className="w-full max-w-3xl flex flex-wrap items-center justify-between gap-2 z-30 shrink-0">
        <div className="flex items-center gap-2">
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
            <span>پخش دوبارهٔ انیمیشن</span>
          </button>
        </div>

        {/* Tier Selector Pills (Available in Test Lab or to preview all 4 Scroll Tiers) */}
        {isTestLab && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {([1, 2, 3, 4] as const).map((t) => {
              const active = selectedTier === t;
              const th = SCROLL_STAGE_THEMES[t];
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setSelectedTier(t);
                    setReplaySeed((s) => s + 1);
                  }}
                  className={`px-3 py-1.5 rounded-full text-[10.5px] font-black transition-all active:scale-95 ${
                    active ? 'ring-2 ring-white scale-105 shadow-lg' : 'opacity-80 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: th.badgeBg,
                    color: th.badgeText,
                    border: `1px solid ${th.sideBorderStroke}`,
                  }}
                >
                  {t === 4 ? '💚 رده ۴: زمرد شاهانه' : th.shortFa}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* =====================================================================
          CENTER STAGE: GOD-RAYS, VOLUMETRIC MIST, SHOCKWAVES & UNROLLING SCROLL
      ===================================================================== */}
      <div className="relative flex-1 w-full max-w-2xl flex flex-col items-center justify-center my-2 min-h-[340px] sm:min-h-[400px]">
        {/* 1. NON-REPEATING RANDOMIZED GOD-RAYS (`شعاع‌های نور غیرتکراری و رندوم از پشت طومار`) */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-visible"
          style={{
            opacity: isBurstTriggered ? Math.min(1, (elapsedMs - 950) / 450) : 0.18 * spinPhaseProgress,
            transition: 'opacity 180ms ease-out',
          }}
        >
          <svg
            viewBox="-450 -450 900 900"
            className="w-[460px] h-[460px] sm:w-[640px] sm:h-[640px] overflow-visible"
          >
            <defs>
              <radialGradient id={`ray-primary-${uid}`} cx="0%" cy="0%" r="100%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
                <stop offset="22%" stopColor={tierCfg.rayPrimary} stopOpacity="0.82" />
                <stop offset="65%" stopColor={tierCfg.raySecondary} stopOpacity="0.28" />
                <stop offset="100%" stopColor={tierCfg.raySecondary} stopOpacity="0" />
              </radialGradient>
              <radialGradient id={`ray-secondary-${uid}`} cx="0%" cy="0%" r="100%">
                <stop offset="0%" stopColor="#FFFDF2" stopOpacity="0.9" />
                <stop offset="30%" stopColor={tierCfg.raySecondary} stopOpacity="0.75" />
                <stop offset="100%" stopColor={tierCfg.rayPrimary} stopOpacity="0" />
              </radialGradient>
              <radialGradient id={`ray-white-${uid}`} cx="0%" cy="0%" r="100%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
                <stop offset="40%" stopColor={tierCfg.rayPrimary} stopOpacity="0.55" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
              </radialGradient>
              <radialGradient id={`core-glow-${uid}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
                <stop offset="35%" stopColor={tierCfg.rayPrimary} stopOpacity="0.65" />
                <stop offset="70%" stopColor={tierCfg.raySecondary} stopOpacity="0.22" />
                <stop offset="100%" stopColor={tierCfg.raySecondary} stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Central radiant core nebula */}
            <circle
              cx="0"
              cy="0"
              r={110 + selectedTier * 36}
              fill={`url(#core-glow-${uid})`}
            />

            {/* Asymmetric, independently drifting & pulsing rays */}
            {randomRays.map((ray) => {
              const currentAngle = ray.baseAngle + timeSec * ray.speedDegPerSec;
              const pulse =
                0.55 + 0.45 * Math.sin(timeSec * ray.pulseSpeed + ray.pulseOffset);
              const halfW = (ray.widthDeg * (0.8 + 0.35 * pulse)) / 2;
              const rad1 = ((currentAngle - halfW) * Math.PI) / 180;
              const rad2 = ((currentAngle + halfW) * Math.PI) / 180;
              const len = ray.lengthPx * (0.85 + 0.25 * pulse);
              const x1 = Math.cos(rad1) * len;
              const y1 = Math.sin(rad1) * len;
              const x2 = Math.cos(rad2) * len;
              const y2 = Math.sin(rad2) * len;
              const fillId =
                ray.colorType === 'white'
                  ? `url(#ray-white-${uid})`
                  : ray.colorType === 'secondary'
                  ? `url(#ray-secondary-${uid})`
                  : `url(#ray-primary-${uid})`;

              return (
                <polygon
                  key={ray.id}
                  points={`0,0 ${x1.toFixed(1)},${y1.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}`}
                  fill={fillId}
                  opacity={(ray.opacityMax * pulse).toFixed(3)}
                  style={{ mixBlendMode: 'screen' }}
                />
              );
            })}

            {/* Tier 3 & Tier 4 Counter-Rotating Sacred Shamsa Light Rings */}
            {selectedTier >= 3 && isBurstTriggered && (
              <g
                transform={`rotate(${(timeSec * 18).toFixed(1)})`}
                stroke={tierCfg.rayPrimary}
                fill="none"
                opacity="0.42"
              >
                <circle cx="0" cy="0" r="155" strokeWidth="1.5" strokeDasharray="8 6" />
                <circle cx="0" cy="0" r="195" strokeWidth="1" strokeDasharray="3 8" />
              </g>
            )}
            {selectedTier === 4 && isBurstTriggered && (
              <g
                transform={`rotate(${(-timeSec * 24).toFixed(1)})`}
                stroke="#FFE285"
                fill="none"
                opacity="0.55"
              >
                <polygon
                  points="0,-220 55,-55 220,0 55,55 0,220 -55,55 -220,0 -55,-55"
                  strokeWidth="1.5"
                />
              </g>
            )}
          </svg>
        </div>

        {/* 2. VOLUMETRIC MIST & INCENSE SMOKE CLOUDS (`مه و دود کوره و بخور شاهانه`) */}
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
                ? (puffProgress / 0.3) * 0.75
                : (1 - (puffProgress - 0.3) / 0.7) * 0.75;

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
                  filter: 'blur(10px)',
                  mixBlendMode: 'screen',
                }}
              />
            );
          })}
        </div>

        {/* 3. EXPLOSION SHOCKWAVE RINGS (`حلقه‌های موج انفجار در لحظهٔ باز شدن مهر طومار`) */}
        {isBurstTriggered && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {Array.from({ length: tierCfg.shockwaveCount }, (_, idx) => {
              const waveElapsed = elapsedMs - 1000 - idx * 180;
              if (waveElapsed <= 0 || waveElapsed > 1200) return null;
              const p = waveElapsed / 1200;
              const radius = 30 + p * (220 + selectedTier * 45);
              const opacity = Math.pow(1 - p, 1.6) * 0.85;
              return (
                <div
                  key={idx}
                  className="absolute rounded-full border-2 pointer-events-none"
                  style={{
                    width: `${radius * 2}px`,
                    height: `${radius * 2}px`,
                    borderColor: idx % 2 === 0 ? tierCfg.rayPrimary : tierCfg.raySecondary,
                    boxShadow: `0 0 24px ${tierCfg.rayPrimary}`,
                    opacity,
                  }}
                />
              );
            })}
          </div>
        )}

        {/* 4. FLYING EMERALD SHARDS, PEARLS & GOLDEN SPARKS */}
        {isBurstTriggered && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {sparkParticles.map((sp) => {
              const spProgress = Math.max(
                0,
                Math.min(1, (timeSec - 1.0 - sp.delay) / sp.duration),
              );
              if (spProgress <= 0 || spProgress >= 1) return null;
              const ease = 1 - Math.pow(1 - spProgress, 2.2);
              const x = Math.cos(sp.angle) * sp.dist * ease;
              const y = Math.sin(sp.angle) * sp.dist * ease - spProgress * 25;
              const opacity = spProgress < 0.2 ? spProgress * 5 : 1 - (spProgress - 0.2) / 0.8;

              return (
                <div
                  key={sp.id}
                  className="absolute pointer-events-none"
                  style={{
                    width: `${sp.size}px`,
                    height: `${sp.size}px`,
                    borderRadius: sp.isGem ? '2px' : '9999px',
                    backgroundColor: sp.isGem ? tierCfg.rayPrimary : '#FFFDF2',
                    boxShadow: `0 0 10px ${tierCfg.rayPrimary}`,
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

        {/* 5. THE ANIMATED UNROLLING SCROLL (`طومار بسته که می‌چرخد و سپس لوله‌هایش به مرور باز می‌شوند`) */}
        <div
          className="relative z-20 w-[210px] sm:w-[248px]"
          style={{
            transform: computeModelTransform(),
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

              {/* Dynamic ClipPath that reveals the parchment only between the unrolling top & bottom cylinders! */}
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
                {/* Left Royal Homa Wing */}
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
                {/* Right Royal Homa Wing */}
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

            {/* ============================================================
                CLIPPED UNROLLING SAMARKAND PARCHMENT BODY
            ============================================================ */}
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

              {/* Left & Right Vertical Illuminated Marginalia Borders */}
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

              {/* Top Illuminated Header Arch (`سرلوح طومار`) */}
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

              {/* Central 8-Point Shamsa Medallion & 12-Pearl Sassanian Collar */}
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

              {/* Central Domed Cabochon Jewel */}
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

              {/* Scroll Title & Subtitle */}
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

            {/* ============================================================
                ANIMATED TOP ROLLED CYLINDER (Moves from Y=108 to Y=16)
            ============================================================ */}
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

            {/* ============================================================
                ANIMATED BOTTOM ROLLED CYLINDER (Moves from Y=130 to Y=222)
            ============================================================ */}
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

            {/* ============================================================
                CLOSED-SCROLL SILK CORD & GLOWING SEAL (Visible while closed, shatters at 1.05s)
            ============================================================ */}
            {unrollProgress < 0.22 && (
              <g opacity={1 - unrollProgress / 0.22}>
                {/* Silk cord holding the two closed rollers together */}
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
                {/* Glowing Royal Wax/Jewel Seal on the closed scroll */}
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
          className="relative z-30 text-center mt-3 px-4 max-w-lg transition-all duration-500"
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

          {/* Action buttons when awarded in real gameplay */}
          {award && !isTestLab && (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
              {onEquipNow && (
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
          )}
        </div>
      </div>

      {/* =====================================================================
          BOTTOM PANEL: 5 CEREMONY MODELS SELECTOR (WHEN IN TEST LAB MODE)
      ===================================================================== */}
      {isTestLab && (
        <div
          className="w-full max-w-4xl rounded-[26px] p-3 sm:p-4 border-2 z-30 shrink-0"
          style={{
            background: 'linear-gradient(180deg, rgba(251,244,230,0.96) 0%, rgba(235,216,184,0.96) 100%)',
            borderColor: '#C8952B',
            boxShadow: '0 16px 40px rgba(0,0,0,0.65)',
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
            <div>
              <h3 className="text-xs sm:text-sm font-black text-[#2E1709] flex items-center gap-1.5">
                <Sparkles size={15} className="text-[#B8522A]" />
                <span>آزمایشگاه ۵ نمونه انیمیشن دریافت و باز شدن طومار (مدل دلخواهتان را انتخاب کنید)</span>
              </h3>
              <p className="text-[10px] font-bold text-[#633B1D]">
                از دکمه‌های بالا می‌توانید هر ۴ رده (خشتی، فیروزه، زرین و زمرد شاهانه) را هم روی این ۵ مدل تست کنید!
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl text-[11px] font-black text-[#FFF9F0] bg-gradient-to-b from-[#129666] to-[#064E33] border border-[#80FFCC] flex items-center gap-1 shadow active:scale-95"
            >
              <Check size={13} />
              <span>تأیید و ذخیرهٔ مدل {toFa(selectedModel)}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
            {CEREMONY_MODELS.map((m) => {
              const isSelected = selectedModel === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleSavePreferredModel(m.id)}
                  className={`rounded-2xl p-2.5 text-right border-2 flex flex-col justify-between gap-1.5 transition-all active:scale-95 ${
                    isSelected
                      ? 'bg-[#FFFDF7] border-[#129666] ring-2 ring-[#129666]/40 shadow-md'
                      : 'bg-[#F5E6CC]/80 border-[#C6A882] hover:bg-[#FFF9EE]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[8.5px] font-black ${
                          isSelected
                            ? 'bg-[#129666] text-white'
                            : 'bg-[#D9C3A3] text-[#4E2D16]'
                        }`}
                      >
                        {m.badgeFa}
                      </span>
                      {isSelected && (
                        <span className="text-[9px] font-black text-[#129666]">✓ فعال</span>
                      )}
                    </div>
                    <div className="text-[11px] font-black text-[#2E1709] leading-4">
                      {m.nameFa}
                    </div>
                    <p className="text-[9px] font-bold text-[#6E4526] mt-1 leading-4">
                      {m.subtitleFa}
                    </p>
                  </div>

                  <div className="pt-1 border-t border-[#D5BA96]/60 flex items-center justify-between text-[9px] font-black text-[#9E4922]">
                    <span className="flex items-center gap-0.5">
                      <Play size={10} />
                      <span>پخش و تست</span>
                    </span>
                    <span>مدل {toFa(m.id)}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ScrollRevealCeremony;
