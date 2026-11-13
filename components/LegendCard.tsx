import React, { useEffect, useId, useState } from 'react';
import { WorldMapCardRarity, WORLD_MAP_RARITY } from '../types';
import { LEGEND_CHAPTER_REMOTE_FALLBACK } from '../data/legendImages';

/**
 * LegendCard — Design #10 (Model 2):
 * «قابِ موزه‌ایِ بال‌های ظریفِ هما و طوقِ مروارید ساسانی»
 * (Full-Bleed Museum Art Frame + Sleek Homa-Wing Filigree + Sassanian Pearl-Collar + Floating Ogee Samarkand Cartouche)
 *
 * 5 Progressive Stages:
 * - null (Stage 0): قفل (خشت خام و مُهر استوانه‌ای مفرغی)
 * - 1 (Stage 1): رده ۱ · سفالین (سفال نیشابور + کاغذ سمرقند)
 * - 2 (Stage 2): رده ۲ · لعاب فیروزه (قاب فیروزه + زنجیره مروارید و نگین بیضی)
 * - 3 (Stage 3): رده ۳ · قاب زرین هخامنشی (شمش زرین + بال‌های قلم‌زنی‌شدهٔ هما در بالای قاب و کنار کتیبه)
 * - 4 (Stage 4): رده ۴ · زمردیِ شاهانه (مینای زمرد سلطنتی با بازتاب بلورین + طلاکوبی برجستهٔ بال‌های هما و یاقوت سرخ)
 */

export type LegendCardVariant = 'grid' | 'large' | 'thumb';

export interface LegendCardLegend {
  id: string;
  name: { fa: string; en: string };
  icon: string;
  color: string;
}

export interface LegendCardProps {
  /** Stable id of the chapter (e.g. `messi_rosario`) — used for keys/testids. */
  chapterId: string;
  legend: LegendCardLegend;
  title: { fa: string; en: string };
  year: string;
  /** null = locked */
  rarity: WorldMapCardRarity | null;
  bgImage: string | null;
  isFA: boolean;
  variant?: LegendCardVariant;
  /** Flip animation for the grid card. */
  flipping?: boolean;
  onClick?: () => void;
  className?: string;
}

export function getCardPng(rarity: WorldMapCardRarity): string {
  if (rarity === 1) return '/images/worldmap/card-bronze.png';
  if (rarity === 2) return '/images/worldmap/card-silver.png';
  if (rarity === 3) return '/images/worldmap/card-gold.png';
  return '/images/worldmap/card-platinum.png';
}

/** Darken a #rrggbb colour by `amount` (0-255) per channel. */
export function darkenColor(hex: string, amount: number): string {
  const c = hex.replace('#', '');
  let r = parseInt(c.substring(0, 2), 16);
  let g = parseInt(c.substring(2, 4), 16);
  let b = parseInt(c.substring(4, 6), 16);
  r = Math.max(0, r - amount);
  g = Math.max(0, g - amount);
  b = Math.max(0, b - amount);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/** Mix a #rrggbb colour toward white by `amount` (0-255) per channel. */
export function lightenColor(hex: string, amount: number): string {
  const c = hex.replace('#', '');
  let r = parseInt(c.substring(0, 2), 16);
  let g = parseInt(c.substring(2, 4), 16);
  let b = parseInt(c.substring(4, 6), 16);
  r = Math.min(255, r + amount);
  g = Math.min(255, g + amount);
  b = Math.min(255, b + amount);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

interface StageRichPalette {
  tier: 0 | 1 | 2 | 3 | 4;
  labelFa: string;
  shortFa: string;
  shortEn: string;
  lipDark: string;
  outerStroke: string;
  frameStop1: string;
  frameStop2: string;
  frameStop3: string;
  frameStop4: string;
  filigreeHi: string;
  filigreeMid: string;
  filigreeDark: string;
  inlayHi: string;
  inlayMid: string;
  inlayDark: string;
  gemHi: string;
  gemMid: string;
  gemDeep: string;
  gem2Hi: string;
  gem2Mid: string;
  gem2Deep: string;
  paperTop: string;
  paperMid: string;
  paperBot: string;
  cartoucheBorder: string;
  cartoucheInnerRule: string;
  titleColor: string;
  subColor: string;
  pillTop: string;
  pillBot: string;
  pillBorder: string;
  pillText: string;
  glow: string;
}

const STAGE_PALETTES: Record<0 | 1 | 2 | 3 | 4, StageRichPalette> = {
  0: {
    tier: 0,
    labelFa: 'قفل (خشت خام)',
    shortFa: '🔒 قفل',
    shortEn: '🔒 Locked',
    lipDark: '#2E1E14',
    outerStroke: '#422C1E',
    frameStop1: '#AD947E',
    frameStop2: '#8C725D',
    frameStop3: '#6E5542',
    frameStop4: '#4F3B2C',
    filigreeHi: '#B8A08A',
    filigreeMid: '#8A715C',
    filigreeDark: '#574333',
    inlayHi: '#967E69',
    inlayMid: '#735C49',
    inlayDark: '#4D3B2C',
    gemHi: '#AD9884',
    gemMid: '#786452',
    gemDeep: '#4A3B2E',
    gem2Hi: '#9E8975',
    gem2Mid: '#6B5847',
    gem2Deep: '#423428',
    paperTop: '#E3D7C7',
    paperMid: '#CFC0AC',
    paperBot: '#B8A58E',
    cartoucheBorder: '#69513E',
    cartoucheInnerRule: '#9C846E',
    titleColor: '#3D2A1B',
    subColor: '#69513E',
    pillTop: '#735B47',
    pillBot: '#4D3A2B',
    pillBorder: '#A38B75',
    pillText: '#EFE5D8',
    glow: 'transparent',
  },
  1: {
    tier: 1,
    labelFa: 'رده ۱ · سفالین',
    shortFa: '★ سفالین',
    shortEn: '★ Clay',
    lipDark: '#4A1F0D',
    outerStroke: '#5E2811',
    frameStop1: '#EEA984',
    frameStop2: '#CC7B52',
    frameStop3: '#A35430',
    frameStop4: '#753518',
    filigreeHi: '#F7C8A8',
    filigreeMid: '#C97B53',
    filigreeDark: '#824122',
    inlayHi: '#E0966E',
    inlayMid: '#AD5E38',
    inlayDark: '#6E3216',
    gemHi: '#FAD4B8',
    gemMid: '#C47046',
    gemDeep: '#783618',
    gem2Hi: '#F5C4A2',
    gem2Mid: '#B05D35',
    gem2Deep: '#692E12',
    paperTop: '#FFFDF9',
    paperMid: '#F9EEDC',
    paperBot: '#EBD6B7',
    cartoucheBorder: '#99502E',
    cartoucheInnerRule: '#D49B78',
    titleColor: '#2B1307',
    subColor: '#7D4527',
    pillTop: '#B86640',
    pillBot: '#823E1E',
    pillBorder: '#F2B896',
    pillText: '#FFF8EE',
    glow: 'rgba(204, 123, 82, 0.14)',
  },
  2: {
    tier: 2,
    labelFa: 'رده ۲ · لعاب فیروزه',
    shortFa: '★★ فیروزه',
    shortEn: '★★ Turquoise',
    lipDark: '#093835',
    outerStroke: '#0D4F4B',
    frameStop1: '#68EDE4',
    frameStop2: '#26A69E',
    frameStop3: '#15756F',
    frameStop4: '#0B4A46',
    filigreeHi: '#F7DFAA',
    filigreeMid: '#CFA052',
    filigreeDark: '#825B1E',
    inlayHi: '#94F7F0',
    inlayMid: '#249991',
    inlayDark: '#0D524D',
    gemHi: '#B0FFF9',
    gemMid: '#1FB5AC',
    gemDeep: '#095954',
    gem2Hi: '#FCE5AC',
    gem2Mid: '#D49636',
    gem2Deep: '#7D500E',
    paperTop: '#FFFDF9',
    paperMid: '#F7EEDC',
    paperBot: '#E8D5B7',
    cartoucheBorder: '#167D76',
    cartoucheInnerRule: '#7CC7C1',
    titleColor: '#162927',
    subColor: '#146E68',
    pillTop: '#249E96',
    pillBot: '#105954',
    pillBorder: '#8CF5EE',
    pillText: '#FFFFFF',
    glow: 'rgba(38, 166, 158, 0.26)',
  },
  3: {
    tier: 3,
    labelFa: 'رده ۳ · زرین هخامنشی',
    shortFa: '★★★ زرین',
    shortEn: '★★★ Gold',
    lipDark: '#422405',
    outerStroke: '#5E3408',
    frameStop1: '#FFF2B8',
    frameStop2: '#EBB13B',
    frameStop3: '#BD7E14',
    frameStop4: '#804E06',
    filigreeHi: '#FFF8D6',
    filigreeMid: '#E5AA34',
    filigreeDark: '#8C5908',
    inlayHi: '#FFE596',
    inlayMid: '#C98718',
    inlayDark: '#734505',
    gemHi: '#9EFFF8',
    gemMid: '#22A39B',
    gemDeep: '#0B4F4B',
    gem2Hi: '#FFF5C2',
    gem2Mid: '#E3A029',
    gem2Deep: '#855306',
    paperTop: '#FFFEF9',
    paperMid: '#FAF0DA',
    paperBot: '#EDD7B2',
    cartoucheBorder: '#B57914',
    cartoucheInnerRule: '#E5BE6E',
    titleColor: '#261204',
    subColor: '#8C580B',
    pillTop: '#E5A832',
    pillBot: '#99620C',
    pillBorder: '#FFF2B8',
    pillText: '#241004',
    glow: 'rgba(235, 177, 59, 0.34)',
  },
  4: {
    tier: 4,
    labelFa: 'رده ۴ · زمردیِ شاهانه',
    shortFa: '★★★★ زمردِ شاهانه',
    shortEn: '★★★★ Emerald',
    lipDark: '#042619',
    outerStroke: '#073D29',
    frameStop1: '#42EBAC',
    frameStop2: '#129666',
    frameStop3: '#096341',
    frameStop4: '#043622',
    filigreeHi: '#FFF3BD',
    filigreeMid: '#E5AA36',
    filigreeDark: '#8F5C0A',
    inlayHi: '#78F7C6',
    inlayMid: '#128C5F',
    inlayDark: '#053D27',
    gemHi: '#FF9E94',
    gemMid: '#D92B2B',
    gemDeep: '#6E0B0B',
    gem2Hi: '#96FFDA',
    gem2Mid: '#14AD75',
    gem2Deep: '#054A30',
    paperTop: '#FFFEF9',
    paperMid: '#FBF0D9',
    paperBot: '#EED6AC',
    cartoucheBorder: '#D49826',
    cartoucheInnerRule: '#199E6D',
    titleColor: '#0A291C',
    subColor: '#0E754F',
    pillTop: '#128F61',
    pillBot: '#06472E',
    pillBorder: '#FAD878',
    pillText: '#FFFDF7',
    glow: 'rgba(20, 173, 117, 0.44)',
  },
};

/**
 * Reusable clay tier badge for chapter lists, collection headers, or modals.
 */
export const ClayTierBadge: React.FC<{
  tier: WorldMapCardRarity;
  isFA?: boolean;
  size?: 'sm' | 'md';
}> = ({ tier, isFA = true, size = 'sm' }) => {
  const info = WORLD_MAP_RARITY[tier];
  const isSm = size === 'sm';
  const dotColor = tier === 4 ? '#129666' : info.color;

  return (
    <span
      className={`inline-flex items-center gap-1 font-black select-none rounded-full ${
        isSm ? 'px-2 py-0.5 text-[8.5px]' : 'px-2.5 py-0.5 text-[10px]'
      }`}
      style={{
        backgroundColor: 'rgba(246, 241, 231, 0.94)',
        color: '#2A1E16',
        boxShadow: '0 0 0 1px rgba(36, 26, 20, 0.25), 0 1px 2px rgba(26, 15, 9, 0.25)',
      }}
    >
      <span
        className="rounded-full shrink-0"
        style={{
          width: isSm ? 6 : 7,
          height: isSm ? 6 : 7,
          backgroundColor: dotColor,
        }}
      />
      <span>{isFA ? (tier === 4 ? 'زمردِ شاهانه' : info.fa) : info.en}</span>
    </span>
  );
};

const renderFacetedJewel = (
  cx: number,
  cy: number,
  r: number,
  uid: string,
  p: StageRichPalette,
  variant: 'primary' | 'secondary' = 'primary',
  shape: 'octagon' | 'diamond' = 'octagon',
) => {
  const hi = variant === 'primary' ? p.gemHi : p.gem2Hi;
  const mid = variant === 'primary' ? p.gemMid : p.gem2Mid;
  const deep = variant === 'primary' ? p.gemDeep : p.gem2Deep;

  if (shape === 'diamond') {
    return (
      <g>
        <polygon
          points={`${cx},${cy - r * 1.35} ${cx + r * 1.35},${cy} ${cx},${cy + r * 1.35} ${cx - r * 1.35},${cy}`}
          fill={`url(#${uid}-filigree)`}
          stroke={p.lipDark}
          strokeWidth="1"
        />
        <polygon
          points={`${cx},${cy - r} ${cx + r},${cy} ${cx},${cy + r} ${cx - r},${cy}`}
          fill={deep}
        />
        <polygon
          points={`${cx},${cy - r} ${cx + r},${cy} ${cx},${cy} ${cx - r},${cy}`}
          fill={mid}
        />
        <polygon
          points={`${cx},${cy - r * 0.55} ${cx + r * 0.55},${cy} ${cx},${cy + r * 0.55} ${cx - r * 0.55},${cy}`}
          fill={hi}
          opacity="0.85"
        />
        <circle cx={cx - r * 0.22} cy={cy - r * 0.25} r={r * 0.2} fill="#FFFFFF" opacity="0.9" />
      </g>
    );
  }

  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={r + 1.6}
        fill={`url(#${uid}-filigree)`}
        stroke={p.lipDark}
        strokeWidth="1"
      />
      <circle cx={cx} cy={cy} r={r} fill={deep} />
      <circle cx={cx} cy={cy} r={r * 0.82} fill={mid} />
      <polygon
        points={`${cx - r * 0.35},${cy - r * 0.55} ${cx + r * 0.35},${cy - r * 0.55} ${cx + r * 0.55},${cy - r * 0.2} ${cx + r * 0.55},${cy + r * 0.25} ${cx + r * 0.25},${cy + r * 0.5} ${cx - r * 0.25},${cy + r * 0.5} ${cx - r * 0.55},${cy + r * 0.25} ${cx - r * 0.55},${cy - r * 0.2}`}
        fill={hi}
        opacity="0.55"
      />
      <ellipse
        cx={cx - r * 0.25}
        cy={cy - r * 0.28}
        rx={r * 0.32}
        ry={r * 0.18}
        transform={`rotate(-30 ${cx - r * 0.25} ${cy - r * 0.28})`}
        fill="#FFFFFF"
        opacity="0.92"
      />
    </g>
  );
};

function truncateLabel(text: string, maxLen: number): string {
  if (!text) return '';
  return text.length > maxLen ? text.slice(0, maxLen - 1) + '…' : text;
}

export const LegendCard: React.FC<LegendCardProps> = ({
  chapterId,
  legend,
  title,
  year,
  rarity,
  bgImage,
  isFA,
  variant = 'grid',
  flipping = false,
  onClick,
  className = '',
}) => {
  const reactId = useId().replace(/:/g, '');
  const isUnlocked = rarity !== null;
  const stageTier: 0 | 1 | 2 | 3 | 4 = isUnlocked ? (rarity as 1 | 2 | 3 | 4) : 0;
  const p = STAGE_PALETTES[stageTier];
  const uid = `lc-${reactId}-t${stageTier}`;

  const [resolvedImg, setResolvedImg] = useState<string | null>(bgImage);
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    setResolvedImg(bgImage);
    setImgFailed(false);
  }, [bgImage, chapterId]);

  const handleImageError = () => {
    const remoteFallback = LEGEND_CHAPTER_REMOTE_FALLBACK[chapterId];
    if (remoteFallback && resolvedImg !== remoteFallback) {
      setResolvedImg(remoteFallback);
      return;
    }
    setImgFailed(true);
  };

  const legendName = isFA ? legend.name.fa : legend.name.en;
  const rawTitle = isFA ? title.fa : title.en;
  const cleanTitle = rawTitle.includes(' — ')
    ? rawTitle.split(' — ').slice(1).join(' — ')
    : rawTitle;

  const displayTitle = truncateLabel(cleanTitle || legendName, 18);
  const displaySub = truncateLabel(
    year && year !== cleanTitle ? `${legendName} · ${year}` : legendName,
    24,
  );
  const badgeLabel = isFA ? p.shortFa : p.shortEn;

  const interactive = !!onClick;
  const Root: any = interactive ? 'button' : 'div';

  const artWindowPath =
    'M15,32 C15,20 23,14 35,14 L145,14 C157,14 165,20 165,32 L165,178 C165,188 157,194 145,194 L35,194 C23,194 15,188 15,178 Z';

  const cyTop = 152;
  const cHeight = 54;
  const getOgeeCartouchePath = (inset = 0) => {
    const L = 19 + inset;
    const R = 161 - inset;
    const T = cyTop + inset;
    const B = cyTop + cHeight - inset;
    return `M${L + 12},${T} L${R - 12},${T} C${R - 4},${T} ${R},${T + 5} ${R},${T + 12} L${R},${B - 12} C${R},${B - 5} ${R - 4},${B} ${R - 12},${B} L${L + 12},${B} C${L + 4},${B} ${L},${B - 5} ${L},${B - 12} L${L},${T + 12} C${L},${T + 5} ${L + 4},${T} ${L + 12},${T} Z`;
  };

  return (
    <Root
      type={interactive ? 'button' : undefined}
      data-card-id={chapterId}
      onClick={onClick}
      dir={isFA ? 'rtl' : 'ltr'}
      className={`relative block w-full select-none transition-transform duration-200 ${
        interactive ? 'cursor-pointer hover:-translate-y-0.5 active:scale-97' : ''
      } ${className}`}
      style={{
        aspectRatio: '180 / 250',
        transform: flipping ? 'rotateY(360deg)' : undefined,
        transition: 'transform 0.45s cubic-bezier(.22,1,.36,1)',
        filter:
          variant === 'thumb'
            ? 'drop-shadow(0 3px 6px rgba(34, 15, 6, 0.28))'
            : 'drop-shadow(0 8px 16px rgba(34, 15, 6, 0.32))',
      }}
    >
      <svg viewBox="0 0 180 250" className="w-full h-full block overflow-visible">
        <defs>
          {/* Main 4-Stop Ceramic / Turquoise / Gold / Royal Emerald Frame Gradient */}
          <linearGradient id={`${uid}-frame`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={p.frameStop1} />
            <stop offset="38%" stopColor={p.frameStop2} />
            <stop offset="78%" stopColor={p.frameStop3} />
            <stop offset="100%" stopColor={p.frameStop4} />
          </linearGradient>

          {/* Sculpted Gold / Bronze Filigree Gradient */}
          <linearGradient id={`${uid}-filigree`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={p.filigreeHi} />
            <stop offset="52%" stopColor={p.filigreeMid} />
            <stop offset="100%" stopColor={p.filigreeDark} />
          </linearGradient>

          {/* Secondary Enamel / Emerald Inlay Gradient */}
          <linearGradient id={`${uid}-inlay`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={p.inlayHi} />
            <stop offset="55%" stopColor={p.inlayMid} />
            <stop offset="100%" stopColor={p.inlayDark} />
          </linearGradient>

          {/* Samarkand Cream Paper Cartouche Gradient */}
          <linearGradient id={`${uid}-paper`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={p.paperTop} />
            <stop offset="58%" stopColor={p.paperMid} />
            <stop offset="100%" stopColor={p.paperBot} />
          </linearGradient>

          {/* Bottom Tier Pill Gradient */}
          <linearGradient id={`${uid}-pill`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={p.pillTop} />
            <stop offset="100%" stopColor={p.pillBot} />
          </linearGradient>

          <linearGradient id={`${uid}-emerald-sheen`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(160, 255, 220, 0.55)" />
            <stop offset="100%" stopColor="rgba(160, 255, 220, 0)" />
          </linearGradient>

          <clipPath id={`${uid}-art-clip`}>
            <path d={artWindowPath} />
          </clipPath>
        </defs>

        {/* 0. Ambient Aura for Tier 3 (Gold) & Tier 4 (Royal Emerald) */}
        {stageTier >= 3 && variant !== 'thumb' && (
          <rect
            x="3"
            y="3"
            width="174"
            height="242"
            rx="28"
            fill={p.glow}
            style={{ filter: 'blur(9px)' }}
          />
        )}

        {/* 1. 3D EXTRUDED PHYSICAL BASE LIP */}
        <rect
          x="6"
          y="12"
          width="168"
          height="232"
          rx="25"
          fill={p.lipDark}
        />

        {/* 2. MAIN OUTER SCULPTED FRAME BODY */}
        <rect
          x="6"
          y="6"
          width="168"
          height="232"
          rx="25"
          fill={`url(#${uid}-frame)`}
          stroke={p.outerStroke}
          strokeWidth="2.4"
        />

        {/* Outer Gold Filigree Rim for Tier 4 (`زهوارِ طلاکوبِ دورِ قابِ زمردی در رده ۴`) */}
        {stageTier === 4 && (
          <rect
            x="7.5"
            y="7.5"
            width="165"
            height="229"
            rx="23.5"
            fill="none"
            stroke={`url(#${uid}-filigree)`}
            strokeWidth="2"
          />
        )}

        {/* Top Specular Ceramic/Crystal Highlight */}
        <path
          d="M28,9.5 L152,9.5"
          stroke="rgba(255, 255, 255, 0.62)"
          strokeWidth="1.8"
          strokeLinecap="round"
        />

        {/* 3. SURFACE LUXURY DETAILS ON THE FRAME (Emerald Crystalline Facets + Sassanian Pearl-Collar) */}
        {stageTier > 0 && (
          <g pointerEvents="none">
            {stageTier === 4 && (
              <g opacity="0.55">
                <path d="M8,36 L44,7 L68,7 L8,58 Z" fill={`url(#${uid}-emerald-sheen)`} />
                <path d="M172,44 L118,92 L172,72 Z" fill={p.frameStop1} opacity="0.35" />
                <path d="M8,140 L32,120 L8,168 Z" fill={p.frameStop1} opacity="0.35" />
                <path d="M132,238 L172,196 L172,222 L152,238 Z" fill={p.frameStop1} opacity="0.4" />
                {[56, 96, 136].map((y) => (
                  <g key={y}>
                    <line x1="6.5" y1={y} x2="15" y2={y} stroke={p.filigreeHi} strokeWidth="1.4" />
                    <line x1="165" y1={y} x2="173.5" y2={y} stroke={p.filigreeHi} strokeWidth="1.4" />
                  </g>
                ))}
              </g>
            )}

            {stageTier === 2 && (
              <g opacity="0.38">
                <path d="M10,30 L38,8 L56,8 L10,48 Z" fill="#B8FFF9" />
                <path d="M140,238 L172,206 L172,224 L156,238 Z" fill="#B8FFF9" />
              </g>
            )}

            {/* Sassanian Pearl-Collar Micro-Beading along the inner bezel (`طوقِ مروارید ساسانی`) */}
            {stageTier >= 2 && (
              <rect
                x="11.5"
                y="10.5"
                width="157"
                height="223"
                rx="22"
                fill="none"
                stroke={p.filigreeHi}
                strokeWidth="1.25"
                strokeDasharray="2 3.5"
                opacity="0.85"
              />
            )}
          </g>
        )}

        {/* 4. FULL-BLEED MUSEUM ARTWORK WINDOW */}
        <path
          d={artWindowPath}
          fill={!isUnlocked ? p.paperBot : '#1C0E07'}
          stroke={p.lipDark}
          strokeWidth="2.4"
        />

        {!isUnlocked ? (
          <g clipPath={`url(#${uid}-art-clip)`}>
            {/* Subtle Engraved Sun-Wheel on Unfired Clay */}
            <circle cx="90" cy="88" r="52" fill="none" stroke={p.outerStroke} strokeWidth="1" strokeDasharray="4 4" opacity="0.35" />
            <circle cx="90" cy="88" r="36" fill="none" stroke={p.outerStroke} strokeWidth="1.2" opacity="0.4" />
            {/* Sculpted Bronze & Clay Cylinder-Seal Lock Medallion */}
            <circle cx="90" cy="88" r="23" fill={`url(#${uid}-frame)`} stroke={p.outerStroke} strokeWidth="2.2" />
            <circle cx="90" cy="88" r="17" fill={p.paperMid} stroke={p.outerStroke} strokeWidth="1.2" />
            <text x="90" y="96" textAnchor="middle" fontSize="21">
              🔒
            </text>
          </g>
        ) : resolvedImg && !imgFailed ? (
          <g clipPath={`url(#${uid}-art-clip)`}>
            <image
              href={resolvedImg}
              x="14"
              y="12"
              width="152"
              height="184"
              preserveAspectRatio="xMidYMid slice"
              onError={handleImageError}
            />
            {/* Museum Vignette Shadow around the inside of the Portrait Window */}
            <path
              d={artWindowPath}
              fill="none"
              stroke="rgba(20, 8, 2, 0.45)"
              strokeWidth="7"
            />
            {/* Soft Upper Crystal Glaze Reflection */}
            <ellipse
              cx="90"
              cy="22"
              rx="56"
              ry="12"
              fill="rgba(255, 255, 255, 0.20)"
            />
          </g>
        ) : (
          <g clipPath={`url(#${uid}-art-clip)`}>
            <rect x="14" y="12" width="152" height="184" fill={p.paperMid} />
            <text x="90" y="102" textAnchor="middle" fontSize="46">
              {legend.icon}
            </text>
          </g>
        )}

        {/* Crisp Metallic Inner Rim around the Portrait Window */}
        <path
          d={artWindowPath}
          fill="none"
          stroke={`url(#${uid}-filigree)`}
          strokeWidth={stageTier >= 3 ? '2.6' : '1.8'}
        />

        {/* 5. SLEEK HOMA-WING FILIGREE & SASSANIAN PEARL-COLLAR ORNAMENTS (Model #2) */}
        {isUnlocked && (
          <g>
            {/* Inner Illuminated Golden Jadval Rule (Tier 2+) */}
            {stageTier >= 2 && (
              <rect
                x="19"
                y="18"
                width="142"
                height="170"
                rx="14"
                fill="none"
                stroke={stageTier === 4 ? p.filigreeHi : p.filigreeMid}
                strokeWidth={stageTier >= 3 ? '1.2' : '0.9'}
                strokeOpacity={stageTier >= 3 ? '0.8' : '0.55'}
              />
            )}

            {/* Top Sleek Horizontal Homa Wings hugging the upper frame rim */}
            {stageTier >= 2 && (
              <g>
                {[1, -1].map((dir) => (
                  <g
                    key={dir}
                    transform={dir === -1 ? 'translate(180, 0) scale(-1, 1)' : undefined}
                  >
                    {/* Primary Outer Sleek Wing Feather hugging top bar */}
                    <path
                      d="M90,14 C106,8 126,8 144,13 C140,18 128,20 114,20 C104,20 96,18 90,16 Z"
                      fill={`url(#${uid}-filigree)`}
                      stroke={p.lipDark}
                      strokeWidth="1.2"
                    />
                    {/* Second Layered Feather (Tier 3+) */}
                    {stageTier >= 3 && (
                      <path
                        d="M92,16 C106,13 122,14 134,18 C128,22 116,23 104,22 C98,21 94,19 92,16 Z"
                        fill={stageTier === 4 ? `url(#${uid}-inlay)` : `url(#${uid}-filigree)`}
                        stroke={p.lipDark}
                        strokeWidth="1.1"
                      />
                    )}
                    {/* Third Inner Feather (Tier 4) */}
                    {stageTier === 4 && (
                      <path
                        d="M94,18 C104,17 114,18 122,22 C116,25 106,25 98,23 Z"
                        fill={`url(#${uid}-filigree)`}
                        stroke={p.lipDark}
                        strokeWidth="1"
                      />
                    )}
                  </g>
                ))}

                {/* Central Sassanian Crescent & Jewel clasping the Homa wings */}
                <path
                  d="M78,16 C82,22 86,24 90,24 C94,24 98,22 102,16 C98,19 94,20 90,20 C86,20 82,19 78,16 Z"
                  fill={`url(#${uid}-filigree)`}
                  stroke={p.lipDark}
                  strokeWidth="1.1"
                />
                {renderFacetedJewel(90, 14, stageTier === 4 ? 5.5 : 4.2, uid, p, 'primary', 'octagon')}
              </g>
            )}

            {/* Upper Corner Pearl Rosettes (Tier 3+) */}
            {stageTier >= 3 && (
              <>
                {renderFacetedJewel(23, 23, 3.2, uid, p, 'secondary', 'octagon')}
                {renderFacetedJewel(157, 23, 3.2, uid, p, 'secondary', 'octagon')}
              </>
            )}
          </g>
        )}

        {/* 6. FLOATING OGEE SAMARKAND CARTOUCHE & TIER SEAL */}
        <g>
          {/* Ambient Shadow under the Floating Cartouche */}
          <path
            d={getOgeeCartouchePath(0)}
            fill="rgba(12, 5, 2, 0.55)"
            transform="translate(0, 4.5)"
          />

          {/* Progressive Side Homa Wing-Clasp Brackets (`پرهای ظریفِ هما در آغوشِ دو سوی کتیبه`) */}
          {stageTier >= 3 && (
            <>
              {[1, -1].map((dir) => (
                <g
                  key={dir}
                  transform={dir === -1 ? 'translate(180, 0) scale(-1, 1)' : undefined}
                >
                  <path
                    d="M22,154 C12,150 9,140 15,132 C19,138 23,144 26,152 Z"
                    fill={`url(#${uid}-filigree)`}
                    stroke={p.lipDark}
                    strokeWidth="1.2"
                  />
                  {stageTier === 4 && (
                    <path
                      d="M20,164 C10,160 8,150 13,142 C17,148 21,154 23,160 Z"
                      fill={`url(#${uid}-inlay)`}
                      stroke={p.filigreeHi}
                      strokeWidth="1"
                    />
                  )}
                </g>
              ))}
            </>
          )}

          {/* Outer Metallic / Glazed Bezel of the Floating Cartouche */}
          <path
            d={getOgeeCartouchePath(0)}
            fill={`url(#${uid}-filigree)`}
            stroke={p.lipDark}
            strokeWidth="1.8"
            strokeLinejoin="round"
          />

          {/* Inner Samarkand Cream Parchment Tablet */}
          <path
            d={getOgeeCartouchePath(2.8)}
            fill={`url(#${uid}-paper)`}
            stroke={p.cartoucheBorder}
            strokeWidth="1.2"
            strokeLinejoin="round"
          />

          {/* Delicate Inner Illuminated Hairline Rule */}
          {stageTier >= 2 && (
            <path
              d={getOgeeCartouchePath(5.2)}
              fill="none"
              stroke={p.cartoucheInnerRule}
              strokeWidth="0.9"
              strokeLinejoin="round"
              opacity="0.85"
            />
          )}

          {/* Left & Right Jewel Bosses on the Cartouche */}
          {stageTier >= 1 && (
            <>
              {renderFacetedJewel(
                27,
                cyTop + cHeight / 2,
                stageTier >= 3 ? 3.6 : 2.8,
                uid,
                p,
                stageTier === 4 ? 'secondary' : 'primary',
                'octagon',
              )}
              {renderFacetedJewel(
                153,
                cyTop + cHeight / 2,
                stageTier >= 3 ? 3.6 : 2.8,
                uid,
                p,
                stageTier === 4 ? 'secondary' : 'primary',
                'octagon',
              )}
            </>
          )}

          {/* Top-Center Mini Crest on the Cartouche Upper Rim (Tier 3+) */}
          {stageTier >= 3 && (
            <g>
              <path
                d={`M74,${cyTop} L90,${cyTop - 5.5} L106,${cyTop} L98,${cyTop + 3.5} L82,${cyTop + 3.5} Z`}
                fill={`url(#${uid}-filigree)`}
                stroke={p.lipDark}
                strokeWidth="1.1"
              />
              {renderFacetedJewel(
                90,
                cyTop - 1,
                stageTier === 4 ? 3.2 : 2.5,
                uid,
                p,
                'primary',
                'diamond',
              )}
            </g>
          )}

          {/* Crisp Hero Title & Subtitle */}
          <text
            x="90"
            y={cyTop + 21.5}
            textAnchor="middle"
            fill={p.titleColor}
            fontSize={variant === 'grid' ? '13.5' : '12.5'}
            fontWeight="900"
            style={{ fontFamily: 'Vazirmatn, sans-serif' }}
          >
            {isUnlocked ? displayTitle : isFA ? 'لوحِ مهروموم' : 'Sealed Tablet'}
          </text>

          {/* Fine Calligraphy Divider with Center Diamond */}
          <line
            x1="48"
            y1={cyTop + 28}
            x2="132"
            y2={cyTop + 28}
            stroke={p.cartoucheInnerRule}
            strokeWidth="0.85"
            opacity="0.72"
          />
          <polygon
            points={`90,${cyTop + 26} 92.5,${cyTop + 28} 90,${cyTop + 30} 87.5,${cyTop + 28}`}
            fill={p.cartoucheBorder}
          />

          <text
            x="90"
            y={cyTop + 41}
            textAnchor="middle"
            fill={p.subColor}
            fontSize={variant === 'grid' ? '10' : '9.2'}
            fontWeight="800"
            style={{ fontFamily: 'Vazirmatn, sans-serif' }}
          >
            {displaySub}
          </text>

          {/* Bottom Jewel-Set Tier Seal Capsule */}
          <rect
            x="36"
            y="213"
            width="108"
            height="22"
            rx="11"
            fill={p.lipDark}
            transform="translate(0, 2.2)"
          />
          <rect
            x="36"
            y="213"
            width="108"
            height="22"
            rx="11"
            fill={`url(#${uid}-pill)`}
            stroke={p.pillBorder}
            strokeWidth="1.5"
          />
          <text
            x="90"
            y="228"
            textAnchor="middle"
            fill={p.pillText}
            fontSize={variant === 'grid' ? '10.2' : '9.5'}
            fontWeight="900"
            style={{ fontFamily: 'Vazirmatn, sans-serif' }}
          >
            {badgeLabel}
          </text>
        </g>
      </svg>
    </Root>
  );
};

export default LegendCard;
