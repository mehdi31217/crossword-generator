import React, { useId } from 'react';
import { CardFamily } from '../utils/progression';

export interface MasterScrollProps {
  /** 0 = Locked (not all cards in set unlocked), 1 = Clay, 2 = Turquoise, 3 = Gold, 4 = Royal Emerald */
  stage: 0 | 1 | 2 | 3 | 4;
  title: string;
  subtitle?: string;
  family?: CardFamily;
  unlockedCardsCount?: number;
  totalCardsCount?: number;
  size?: 'full' | 'xs' | 'sm' | 'md' | 'lg';
  isEquipped?: boolean;
  /** Renders a scroll-shaped empty socket for the 10-Scroll Combo Rack */
  isEmptySlot?: boolean;
  emptySlotNumber?: number;
  onClick?: () => void;
  className?: string;
}

interface ScrollStageTheme {
  nameFa: string;
  shortFa: string;
  rollerTop: string;
  rollerMid: string;
  rollerDeep: string;
  finialLight: string;
  finialMid: string;
  finialDark: string;
  tileBand: string;
  tileAccent: string;
  parchmentTop: string;
  parchmentMid: string;
  parchmentBot: string;
  parchmentEdge: string;
  sideBorderBg: string;
  sideBorderStroke: string;
  shamsaOuter: string;
  shamsaInner: string;
  gemLight: string;
  gemMid: string;
  gemDeep: string;
  pearlFill: string;
  titleColor: string;
  subColor: string;
  badgeBg: string;
  badgeText: string;
  glow: string;
}

export const SCROLL_STAGE_THEMES: Record<0 | 1 | 2 | 3 | 4, ScrollStageTheme> = {
  0: {
    nameFa: 'طومار مهروموم‌شده (قفل)',
    shortFa: '🔒 قفل',
    rollerTop: '#8C7A65',
    rollerMid: '#5E4E3C',
    rollerDeep: '#352A1E',
    finialLight: '#9A8873',
    finialMid: '#5C4D3C',
    finialDark: '#2B2218',
    tileBand: '#4A3D2F',
    tileAccent: '#8C7A65',
    parchmentTop: '#9E8E78',
    parchmentMid: '#857560',
    parchmentBot: '#6B5C49',
    parchmentEdge: '#4A3D2F',
    sideBorderBg: '#5C4D3C',
    sideBorderStroke: '#8C7A65',
    shamsaOuter: '#5E4E3C',
    shamsaInner: '#3E3225',
    gemLight: '#7A6C5D',
    gemMid: '#4A3F33',
    gemDeep: '#261F18',
    pearlFill: '#9E8E78',
    titleColor: '#352A1E',
    subColor: '#4A3D2F',
    badgeBg: '#3E3225',
    badgeText: '#D5C7B4',
    glow: 'none',
  },
  1: {
    nameFa: 'طومار خشتیِ نیشابور',
    shortFa: 'رده ۱ · خشتی',
    rollerTop: '#E5B97B',
    rollerMid: '#B87B3E',
    rollerDeep: '#6B3E17',
    finialLight: '#F3C892',
    finialMid: '#B56630',
    finialDark: '#5A2B0E',
    tileBand: '#7C3E19',
    tileAccent: '#E8A86B',
    parchmentTop: '#F7E7C8',
    parchmentMid: '#EBD1A3',
    parchmentBot: '#D5B27B',
    parchmentEdge: '#8A4F24',
    sideBorderBg: '#9C5226',
    sideBorderStroke: '#F2C68B',
    shamsaOuter: '#A85828',
    shamsaInner: '#6B3312',
    gemLight: '#F29D6B',
    gemMid: '#B85423',
    gemDeep: '#5C2209',
    pearlFill: '#F7E3C4',
    titleColor: '#472109',
    subColor: '#7A3D17',
    badgeBg: '#7C3E19',
    badgeText: '#FFEAD0',
    glow: '0 8px 20px rgba(184, 84, 35, 0.25)',
  },
  2: {
    nameFa: 'طومار لعابِ فیروزه',
    shortFa: 'رده ۲ · فیروزه',
    rollerTop: '#F3D299',
    rollerMid: '#C78E46',
    rollerDeep: '#6E4518',
    finialLight: '#8CF4FF',
    finialMid: '#189AB4',
    finialDark: '#0A4B5C',
    tileBand: '#0D5C70',
    tileAccent: '#6CE5F5',
    parchmentTop: '#FFF5DC',
    parchmentMid: '#F3DFB6',
    parchmentBot: '#DEC18D',
    parchmentEdge: '#0E6B80',
    sideBorderBg: '#0F697D',
    sideBorderStroke: '#7CEEFF',
    shamsaOuter: '#14849C',
    shamsaInner: '#0A4654',
    gemLight: '#7CF3FF',
    gemMid: '#128DA6',
    gemDeep: '#073B47',
    pearlFill: '#E6FCFF',
    titleColor: '#073540',
    subColor: '#0E6073',
    badgeBg: '#0D5C70',
    badgeText: '#DDFBFF',
    glow: '0 10px 24px rgba(18, 141, 166, 0.32)',
  },
  3: {
    nameFa: 'طومار زرینِ درباری',
    shortFa: 'رده ۳ · زرین',
    rollerTop: '#FFF1B8',
    rollerMid: '#DF9F28',
    rollerDeep: '#7A4908',
    finialLight: '#FFF5C0',
    finialMid: '#E5A524',
    finialDark: '#734405',
    tileBand: '#1A3E7A',
    tileAccent: '#FFD666',
    parchmentTop: '#FFF9E6',
    parchmentMid: '#F8E6B5',
    parchmentBot: '#E5C883',
    parchmentEdge: '#9C620C',
    sideBorderBg: '#1D4385',
    sideBorderStroke: '#FFE07D',
    shamsaOuter: '#D9931A',
    shamsaInner: '#18366B',
    gemLight: '#FFF3A8',
    gemMid: '#E09614',
    gemDeep: '#703E00',
    pearlFill: '#FFFDF2',
    titleColor: '#4A2800',
    subColor: '#824B08',
    badgeBg: '#8A5205',
    badgeText: '#FFF6CC',
    glow: '0 12px 28px rgba(224, 150, 20, 0.4)',
  },
  4: {
    nameFa: 'طومار زمردیِ شاهانه',
    shortFa: 'رده ۴ · زمرد شاهانه',
    rollerTop: '#FFF5C2',
    rollerMid: '#E3A72F',
    rollerDeep: '#6E4206',
    finialLight: '#7DFFCA',
    finialMid: '#129666',
    finialDark: '#053B25',
    tileBand: '#064E33',
    tileAccent: '#FFD970',
    parchmentTop: '#FFFDF2',
    parchmentMid: '#F5E8BE',
    parchmentBot: '#E2CD94',
    parchmentEdge: '#096B46',
    sideBorderBg: '#07593A',
    sideBorderStroke: '#FFE285',
    shamsaOuter: '#129666',
    shamsaInner: '#043823',
    gemLight: '#80FFCC',
    gemMid: '#0F8A5C',
    gemDeep: '#03331F',
    pearlFill: '#FFFDF5',
    titleColor: '#04331F',
    subColor: '#0A5E3C',
    badgeBg: '#064E33',
    badgeText: '#D9FFF0',
    glow: '0 14px 32px rgba(18, 150, 102, 0.48)',
  },
};

const EMPTY_SLOT_THEME: ScrollStageTheme = {
  nameFa: 'جایگاه خالی طومار',
  shortFa: 'جای خالی',
  rollerTop: '#E5CFAF',
  rollerMid: '#B99264',
  rollerDeep: '#6E4A26',
  finialLight: '#F4DFBE',
  finialMid: '#B48856',
  finialDark: '#5C3A1A',
  tileBand: '#7E542C',
  tileAccent: '#E8C597',
  parchmentTop: '#FDF7EC',
  parchmentMid: '#F4E5CA',
  parchmentBot: '#E6D0AB',
  parchmentEdge: '#A47848',
  sideBorderBg: '#C8A376',
  sideBorderStroke: '#F5E1C0',
  shamsaOuter: '#C69760',
  shamsaInner: '#82582E',
  gemLight: '#F9E6C7',
  gemMid: '#BD8B54',
  gemDeep: '#6B451E',
  pearlFill: '#FBF2E1',
  titleColor: '#5C3418',
  subColor: '#7A4F2A',
  badgeBg: '#8C6239',
  badgeText: '#FFF8EC',
  glow: '0 4px 10px rgba(110, 74, 38, 0.16)',
};

const FAMILY_ICON: Record<CardFamily, string> = {
  football: '⚽',
  epic: '⚔️',
  history: '🏛️',
  folklore: '🌙',
};

const toFaDigits = (n: number | string) => String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[+d]);

/**
 * Illuminated Persian Master Scroll (`طومار مجموعه`)
 * Directly modeled on the ornate rolled scroll in `/public/images/ui/hero-quests.webp`:
 * - Top & bottom 3D rolled parchment cylinders with turned bronze/gold acorn finials & geometric tile bands
 * - Unrolled Samarkand parchment body with deckled wave edges & vertical illuminated borders
 * - Central 8-pointed Shamsa rosette medallion with a 12-pearl-ringed cabochon jewel
 */
export const MasterScroll: React.FC<MasterScrollProps> = ({
  stage,
  title,
  subtitle,
  family = 'football',
  unlockedCardsCount,
  totalCardsCount,
  size = 'md',
  isEquipped = false,
  isEmptySlot = false,
  emptySlotNumber,
  onClick,
  className = '',
}) => {
  const uid = useId().replace(/:/g, '');
  const theme = isEmptySlot ? EMPTY_SLOT_THEME : SCROLL_STAGE_THEMES[stage];
  const isCompact = size === 'xs' || size === 'sm' || size === 'full';

  const dimensions: Record<'full' | 'xs' | 'sm' | 'md' | 'lg', string> = {
    full: 'w-full',
    xs: 'w-[88px] sm:w-[96px]',
    sm: 'w-[108px]',
    md: 'w-[142px]',
    lg: 'w-[186px]',
  };

  // Precompute 8-point Shamsa star polygon around (100, 108)
  const shamsaCy = 108;
  const shamsaPoints: string[] = [];
  for (let i = 0; i < 16; i++) {
    const angle = (i * Math.PI) / 8 - Math.PI / 2;
    const r = i % 2 === 0 ? 31 : 21;
    const x = 100 + Math.cos(angle) * r;
    const y = shamsaCy + Math.sin(angle) * r;
    shamsaPoints.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }

  // Precompute 12 pearls around central cabochon jewel at (100, 108)
  const pearls = Array.from({ length: 12 }, (_, idx) => {
    const angle = (idx * Math.PI * 2) / 12;
    return {
      cx: 100 + Math.cos(angle) * 17,
      cy: shamsaCy + Math.sin(angle) * 17,
    };
  });

  const maxTitleChars = isCompact ? 12 : 16;
  const formattedTitle =
    title.length > maxTitleChars ? `${title.slice(0, maxTitleChars - 1)}…` : title;

  const bottomBadgeText = subtitle
    ? subtitle.length > (isCompact ? 13 : 18)
      ? `${subtitle.slice(0, isCompact ? 12 : 17)}…`
      : subtitle
    : typeof unlockedCardsCount === 'number' && typeof totalCardsCount === 'number'
    ? `${toFaDigits(unlockedCardsCount)} از ${toFaDigits(totalCardsCount)} کارت`
    : theme.shortFa;

  const topHeaderLabel = isEmptySlot
    ? `طومار ${toFaDigits(emptySlotNumber || 1)}`
    : isCompact
    ? theme.shortFa
    : `${FAMILY_ICON[family]} ${theme.shortFa}`;

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={`relative select-none transition-transform duration-200 ${
        onClick ? 'cursor-pointer hover:-translate-y-1 active:scale-95' : ''
      } ${dimensions[size]} ${className}`}
      style={{
        filter: stage > 0 ? `drop-shadow(${theme.glow})` : undefined,
        fontFamily: 'Vazirmatn, sans-serif',
      }}
    >
      <svg
        viewBox="0 0 200 260"
        className="w-full h-auto overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
        style={{ fontFamily: 'Vazirmatn, sans-serif' }}
      >
        <defs>
          {/* Cylindrical roller vertical gradient */}
          <linearGradient id={`roller-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={theme.rollerDeep} />
            <stop offset="28%" stopColor={theme.rollerTop} />
            <stop offset="55%" stopColor={theme.rollerMid} />
            <stop offset="100%" stopColor={theme.rollerDeep} />
          </linearGradient>

          {/* Turned finial gradient */}
          <linearGradient id={`finial-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={theme.finialLight} />
            <stop offset="50%" stopColor={theme.finialMid} />
            <stop offset="100%" stopColor={theme.finialDark} />
          </linearGradient>

          {/* Samarkand parchment body gradient */}
          <linearGradient id={`parchment-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={theme.rollerDeep} stopOpacity="0.38" />
            <stop offset="8%" stopColor={theme.parchmentTop} />
            <stop offset="52%" stopColor={theme.parchmentMid} />
            <stop offset="92%" stopColor={theme.parchmentBot} />
            <stop offset="100%" stopColor={theme.rollerDeep} stopOpacity="0.42" />
          </linearGradient>

          {/* Central cabochon jewel radial gradient */}
          <radialGradient id={`gem-${uid}`} cx="36%" cy="32%" r="68%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
            <stop offset="24%" stopColor={theme.gemLight} />
            <stop offset="68%" stopColor={theme.gemMid} />
            <stop offset="100%" stopColor={theme.gemDeep} />
          </radialGradient>

          {/* Shamsa gold/turquoise medallion gradient */}
          <linearGradient id={`shamsa-${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={theme.sideBorderStroke} />
            <stop offset="50%" stopColor={theme.shamsaOuter} />
            <stop offset="100%" stopColor={theme.shamsaInner} />
          </linearGradient>
        </defs>

        {/* ============================================================
            HANGING SILK TASSEL & CORD (Stages 2, 3, 4)
        ============================================================ */}
        {stage >= 2 && (
          <g>
            <path
              d="M 100 242 L 100 255"
              stroke={theme.sideBorderStroke}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle cx="100" cy="249" r="3.5" fill={`url(#finial-${uid})`} />
            <path
              d="M 94 257 L 100 249 L 106 257 Z"
              fill={theme.sideBorderBg}
              stroke={theme.sideBorderStroke}
              strokeWidth="1"
            />
          </g>
        )}

        {/* ============================================================
            UNROLLED SAMARKAND PARCHMENT BODY (With deckled side edges)
        ============================================================ */}
        <path
          d="
            M 30 32
            L 170 32
            C 173 65, 168 95, 171 130
            C 173 165, 168 195, 170 228
            L 30 228
            C 32 195, 27 165, 29 130
            C 32 95, 27 65, 30 32
            Z
          "
          fill={`url(#parchment-${uid})`}
          stroke={theme.parchmentEdge}
          strokeWidth={isEmptySlot ? '2' : '2.2'}
          strokeDasharray={isEmptySlot ? '6 4' : undefined}
          opacity={isEmptySlot ? 0.94 : 1}
        />

        {/* Subtle horizontal parchment fiber lines (kept clear of the title zone!) */}
        <g stroke={theme.parchmentEdge} strokeOpacity={isEmptySlot ? '0.1' : '0.14'} strokeWidth="1">
          <line x1="46" y1="84" x2="154" y2="84" />
          <line x1="46" y1="134" x2="154" y2="134" />
        </g>

        {/* Left & Right Vertical Illuminated Marginalia Borders (`حاشیه تذهیب`) */}
        <rect
          x="33"
          y="35"
          width="8"
          height="190"
          fill={theme.sideBorderBg}
          stroke={theme.sideBorderStroke}
          strokeWidth="1"
          opacity={isEmptySlot ? '0.6' : '0.92'}
        />
        <rect
          x="159"
          y="35"
          width="8"
          height="190"
          fill={theme.sideBorderBg}
          stroke={theme.sideBorderStroke}
          strokeWidth="1"
          opacity={isEmptySlot ? '0.6' : '0.92'}
        />

        {/* Geometric diamond motifs inside left & right illuminated borders */}
        {[54, 80, 106, 132, 158, 184].map((cy) => (
          <g key={cy} fill={theme.sideBorderStroke} opacity={isEmptySlot ? '0.65' : '0.88'}>
            <polygon points={`37,${cy - 3.5} 39.5,${cy} 37,${cy + 3.5} 34.5,${cy}`} />
            <polygon points={`163,${cy - 3.5} 165.5,${cy} 163,${cy + 3.5} 160.5,${cy}`} />
          </g>
        ))}

        {/* Inner golden/ochre framing hairline */}
        <rect
          x="44"
          y="40"
          width="112"
          height="180"
          rx="4"
          fill="none"
          stroke={theme.parchmentEdge}
          strokeWidth={isEmptySlot ? '1.4' : '1'}
          strokeDasharray={stage === 0 || isEmptySlot ? '5 4' : undefined}
          opacity={isEmptySlot ? '0.65' : '0.55'}
        />

        {/* Top Illuminated Header Arch (`سرلوح طومار`) */}
        <path
          d="M 46 43 L 154 43 L 148 64 Q 100 70 52 64 Z"
          fill={theme.sideBorderBg}
          stroke={theme.sideBorderStroke}
          strokeWidth="1.3"
          opacity={isEmptySlot ? 0.9 : 1}
        />
        <text
          x="100"
          y="58.5"
          textAnchor="middle"
          fontSize={isCompact ? '12.5' : '11'}
          fontWeight="900"
          fill={theme.badgeText}
          style={{ fontFamily: 'Vazirmatn, sans-serif' }}
        >
          {topHeaderLabel}
        </text>

        {/* ============================================================
            CENTRAL SHAMSA MEDALLION & SASSANIAN PEARL-RINGED CABOCHON
        ============================================================ */}
        {/* Outer decorative arabesque corner rays */}
        {stage >= 2 && !isEmptySlot && (
          <circle
            cx="100"
            cy={shamsaCy}
            r="35"
            fill="none"
            stroke={theme.sideBorderStroke}
            strokeWidth="1.2"
            strokeDasharray="3 3"
            opacity="0.85"
          />
        )}

        {/* 16-vertex (8-point) Shamsa Rosette Star */}
        <polygon
          points={shamsaPoints.join(' ')}
          fill={`url(#shamsa-${uid})`}
          stroke={theme.sideBorderStroke}
          strokeWidth="1.6"
          strokeDasharray={isEmptySlot ? '4 2' : undefined}
          opacity={isEmptySlot ? 0.82 : 1}
        />

        {/* Inner dark medallion ring */}
        <circle
          cx="100"
          cy={shamsaCy}
          r="20.5"
          fill={theme.shamsaInner}
          stroke={theme.sideBorderStroke}
          strokeWidth="1.2"
          opacity={isEmptySlot ? 0.88 : 1}
        />

        {/* Sassanian 12-Pearl Collar (`طوق ۱۲ مروارید ساسانی`) */}
        {pearls.map((p, i) => (
          <circle
            key={i}
            cx={p.cx}
            cy={p.cy}
            r={stage >= 3 ? 2.2 : 1.8}
            fill={theme.pearlFill}
            stroke={theme.parchmentEdge}
            strokeWidth="0.5"
            opacity={isEmptySlot ? 0.65 : 1}
          />
        ))}

        {/* Central Domed Cabochon Jewel (`نگین گنبدی طومار`) */}
        <circle
          cx="100"
          cy={shamsaCy}
          r="13"
          fill={`url(#gem-${uid})`}
          stroke={theme.sideBorderStroke}
          strokeWidth="1.5"
        />

        {/* Specular highlight arc on the jewel */}
        <ellipse
          cx="95"
          cy={shamsaCy - 5}
          rx="5"
          ry="2.8"
          transform={`rotate(-25 95 ${shamsaCy - 5})`}
          fill="#FFFFFF"
          opacity={stage === 0 || isEmptySlot ? 0.35 : 0.65}
        />

        {/* Stage 4 Royal Homa Wings embracing the Shamsa */}
        {stage === 4 && !isEmptySlot && (
          <g fill="none" stroke="#FFE285" strokeWidth="1.8" strokeLinecap="round">
            <path d="M 62 120 C 52 106, 56 88, 70 78" />
            <path d="M 58 112 C 50 100, 54 86, 65 78" opacity="0.75" />
            <path d="M 138 120 C 148 106, 144 88, 130 78" />
            <path d="M 142 112 C 150 100, 146 86, 135 78" opacity="0.75" />
          </g>
        )}

        {/* Plus icon (for empty slot), Lock icon (for locked), or Tier Star Numeral inside the jewel */}
        {isEmptySlot ? (
          <text
            x="100"
            y={shamsaCy + 7}
            textAnchor="middle"
            fontSize="21"
            fontWeight="900"
            fill="#FFFDF5"
            style={{ fontFamily: 'Vazirmatn, sans-serif' }}
          >
            +
          </text>
        ) : stage === 0 ? (
          <text x="100" y={shamsaCy + 5} textAnchor="middle" fontSize="13" fill="#E8DCCB">
            🔒
          </text>
        ) : (
          <text
            x="100"
            y={shamsaCy + 4.5}
            textAnchor="middle"
            fontSize="11.5"
            fontWeight="900"
            fill="#FFFFFF"
            style={{
              textShadow: '0 1px 2px rgba(0,0,0,0.65)',
              fontFamily: 'Vazirmatn, sans-serif',
            }}
          >
            {'★'.repeat(stage)}
          </text>
        )}

        {/* ============================================================
            SCROLL CALLIGRAPHY TITLE & PROGRESS / SUBTITLE
            (High-contrast Samarkand cream cartouche for crisp legibility)
        ============================================================ */}
        <rect
          x="46"
          y="147"
          width="108"
          height="32"
          rx="8"
          fill="#FFFDF7"
          fillOpacity={stage === 0 ? '0.68' : '0.88'}
          stroke={theme.parchmentEdge}
          strokeOpacity="0.45"
          strokeWidth="1"
        />

        <text
          x="100"
          y="168.5"
          textAnchor="middle"
          fontSize={isCompact ? '15.5' : '14'}
          fontWeight="900"
          fill={stage === 0 ? '#2B1F14' : theme.titleColor}
          style={{ fontFamily: 'Vazirmatn, sans-serif' }}
        >
          {formattedTitle}
        </text>

        {/* Bottom Ribbon Pill inside parchment */}
        <rect
          x="44"
          y="186"
          width="112"
          height="25"
          rx="12.5"
          fill={theme.badgeBg}
          stroke={theme.sideBorderStroke}
          strokeWidth="1.2"
        />
        <text
          x="100"
          y="203"
          textAnchor="middle"
          fontSize={isCompact ? '12.5' : '11'}
          fontWeight="900"
          fill={theme.badgeText}
          style={{ fontFamily: 'Vazirmatn, sans-serif' }}
        >
          {bottomBadgeText}
        </text>

        {/* ============================================================
            TOP 3D ROLLED PARCHMENT CYLINDER & TURNED ACORN FINIALS
            (Modeled directly after hero-quests.webp top scroll bar)
        ============================================================ */}
        <g>
          {/* Left bronze/gold spindle neck & acorn finial */}
          <rect
            x="12"
            y="22"
            width="10"
            height="12"
            rx="2"
            fill={`url(#finial-${uid})`}
            stroke={theme.rollerDeep}
            strokeWidth="1.2"
          />
          <path
            d="M 12 20 C 4 20, 2 28, 12 36 Z"
            fill={`url(#finial-${uid})`}
            stroke={theme.rollerDeep}
            strokeWidth="1.2"
          />
          {/* Right bronze/gold spindle neck & acorn finial */}
          <rect
            x="178"
            y="22"
            width="10"
            height="12"
            rx="2"
            fill={`url(#finial-${uid})`}
            stroke={theme.rollerDeep}
            strokeWidth="1.2"
          />
          <path
            d="M 188 20 C 196 20, 198 28, 188 36 Z"
            fill={`url(#finial-${uid})`}
            stroke={theme.rollerDeep}
            strokeWidth="1.2"
          />

          {/* Main Top Rolled Parchment Cylinder */}
          <rect
            x="20"
            y="16"
            width="160"
            height="22"
            rx="11"
            fill={`url(#roller-${uid})`}
            stroke={theme.rollerDeep}
            strokeWidth="1.8"
          />

          {/* Left & Right Turquoise/Gold Tilework End-Bands (`بست کاشی‌کاری سر طومار`) */}
          <rect
            x="28"
            y="16.5"
            width="14"
            height="21"
            fill={theme.tileBand}
            stroke={theme.tileAccent}
            strokeWidth="1"
          />
          <rect
            x="158"
            y="16.5"
            width="14"
            height="21"
            fill={theme.tileBand}
            stroke={theme.tileAccent}
            strokeWidth="1"
          />

          {/* Spiral rolled paper end-caps */}
          <ellipse
            cx="24"
            cy="27"
            rx="4"
            ry="9"
            fill={theme.parchmentMid}
            stroke={theme.rollerDeep}
            strokeWidth="1.2"
          />
          <ellipse
            cx="176"
            cy="27"
            rx="4"
            ry="9"
            fill={theme.parchmentMid}
            stroke={theme.rollerDeep}
            strokeWidth="1.2"
          />

          {/* Top roller specular highlight */}
          <line
            x1="46"
            y1="22"
            x2="154"
            y2="22"
            stroke="#FFFFFF"
            strokeOpacity="0.45"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>

        {/* ============================================================
            BOTTOM 3D ROLLED PARCHMENT CYLINDER & TURNED ACORN FINIALS
        ============================================================ */}
        <g>
          {/* Left spindle & finial */}
          <rect
            x="12"
            y="226"
            width="10"
            height="12"
            rx="2"
            fill={`url(#finial-${uid})`}
            stroke={theme.rollerDeep}
            strokeWidth="1.2"
          />
          <path
            d="M 12 224 C 4 224, 2 232, 12 240 Z"
            fill={`url(#finial-${uid})`}
            stroke={theme.rollerDeep}
            strokeWidth="1.2"
          />
          {/* Right spindle & finial */}
          <rect
            x="178"
            y="226"
            width="10"
            height="12"
            rx="2"
            fill={`url(#finial-${uid})`}
            stroke={theme.rollerDeep}
            strokeWidth="1.2"
          />
          <path
            d="M 188 224 C 196 224, 198 232, 188 240 Z"
            fill={`url(#finial-${uid})`}
            stroke={theme.rollerDeep}
            strokeWidth="1.2"
          />

          {/* Main Bottom Rolled Parchment Cylinder */}
          <rect
            x="20"
            y="222"
            width="160"
            height="22"
            rx="11"
            fill={`url(#roller-${uid})`}
            stroke={theme.rollerDeep}
            strokeWidth="1.8"
          />

          {/* Left & Right Tilework End-Bands */}
          <rect
            x="28"
            y="222.5"
            width="14"
            height="21"
            fill={theme.tileBand}
            stroke={theme.tileAccent}
            strokeWidth="1"
          />
          <rect
            x="158"
            y="222.5"
            width="14"
            height="21"
            fill={theme.tileBand}
            stroke={theme.tileAccent}
            strokeWidth="1"
          />

          {/* Spiral rolled paper end-caps */}
          <ellipse
            cx="24"
            cy="233"
            rx="4"
            ry="9"
            fill={theme.parchmentMid}
            stroke={theme.rollerDeep}
            strokeWidth="1.2"
          />
          <ellipse
            cx="176"
            cy="233"
            rx="4"
            ry="9"
            fill={theme.parchmentMid}
            stroke={theme.rollerDeep}
            strokeWidth="1.2"
          />

          {/* Bottom roller specular highlight */}
          <line
            x1="46"
            y1="228"
            x2="154"
            y2="228"
            stroke="#FFFFFF"
            strokeOpacity="0.4"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>
      </svg>

      {/* Single-line Centered Equipped Badge Overlay (Never wraps into multiple broken lines) */}
      {isEquipped && (
        <div
          dir="rtl"
          className="absolute -top-2 left-1/2 -translate-x-1/2 z-10 px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black shadow-md border whitespace-nowrap leading-tight"
          style={{
            background: 'linear-gradient(135deg, #09593B 0%, #129666 100%)',
            color: '#FFFDF5',
            borderColor: '#80FFCC',
            fontFamily: 'Vazirmatn, sans-serif',
          }}
        >
          {size === 'xs' ? '✓ در کومبو' : '✓ در قفسهٔ کومبو'}
        </div>
      )}
    </div>
  );
};

export default MasterScroll;
