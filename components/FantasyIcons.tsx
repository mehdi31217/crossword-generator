import React from 'react';

/**
 * Fantasy Flower Coin (سکه خمیری فانتزی طرح گل رزت / گل لاله)
 * Crafted to replace the old sun icon on the user's coins/purse pill with an
 * authentic, hand-painted fantasy rosette coin in rich warm gold and clay tones.
 */
export interface FantasyFlowerCoinProps {
  className?: string;
  style?: React.CSSProperties;
  size?: number | string;
}

/**
 * Fantasy Flower Coin (سکه خمیری فانتزی طرح گل رزت / گل لاله)
 * Crafted to replace the old sun icon on the user's coins/purse pill with an
 * authentic, hand-painted fantasy rosette coin in rich warm gold and clay tones.
 */
export const FantasyFlowerCoin: React.FC<FantasyFlowerCoinProps> = ({ className, style, size }) => {
  const sizeStyle: React.CSSProperties =
    size !== undefined
      ? {
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
          flexShrink: 0,
        }
      : {};

  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ ...sizeStyle, ...style }}
      aria-hidden="true"
    >
    <defs>
      {/* Outer scalloped flower petals: rich antique gold with top-left sheen */}
      <linearGradient id="coinFlowerPetals" x1="8" y1="5" x2="42" y2="43" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FFF2D0" />
        <stop offset="22%" stopColor="#E6BA55" />
        <stop offset="68%" stopColor="#B37D24" />
        <stop offset="100%" stopColor="#6C4310" />
      </linearGradient>

      {/* Inner circular field */}
      <radialGradient id="coinCoreWell" cx="38%" cy="36%" r="56%" fx="36%" fy="34%">
        <stop offset="0%" stopColor="#FFF7DE" />
        <stop offset="42%" stopColor="#E2B856" />
        <stop offset="82%" stopColor="#A86F1E" />
        <stop offset="100%" stopColor="#55320A" />
      </radialGradient>

      {/* Central 8-petal Persian rosette petals */}
      <linearGradient id="rosetteGold" x1="16" y1="14" x2="32" y2="34" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FFF8E4" />
        <stop offset="48%" stopColor="#E4BA58" />
        <stop offset="100%" stopColor="#8C5716" />
      </linearGradient>

      {/* Clay relief shadow */}
      <filter id="coinReliefShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="1.4" stdDeviation="0.75" floodColor="#261204" floodOpacity="0.45" />
      </filter>
    </defs>

    {/* Drop shadow under the coin in the pill hollow */}
    <circle cx="24" cy="25.5" r="20" fill="#241306" opacity="0.32" />

    {/* 8-Petal Scalloped Flower Coin Body */}
    <path
      d="M24 3.5
         C27 3.5 28.5 7.5 31.5 8.7
         C34.5 10 38.5 9 40.5 11.8
         C42.5 14.5 41.2 18.5 42.2 21.6
         C43.2 24.7 46.5 27 45.8 30.2
         C45 33.5 41.5 35.5 39.8 38.3
         C38 41 34.5 43.5 31.2 44.5
         C28 45.5 25.5 44.2 24 44.2
         C22.5 44.2 20 45.5 16.8 44.5
         C13.5 43.5 10 41 8.2 38.3
         C6.5 35.5 3 33.5 2.2 30.2
         C1.5 27 4.8 24.7 5.8 21.6
         C6.8 18.5 5.5 14.5 7.5 11.8
         C9.5 9 13.5 10 16.5 8.7
         C19.5 7.5 21 3.5 24 3.5Z"
      fill="url(#coinFlowerPetals)"
      stroke="#38200C"
      strokeWidth="1.2"
      strokeLinejoin="round"
      filter="url(#coinReliefShadow)"
    />

    {/* Inner beaded engraved coin boundary */}
    <circle cx="24" cy="24" r="14.8" fill="url(#coinCoreWell)" stroke="#45270E" strokeWidth="1" />
    <circle
      cx="24"
      cy="24"
      r="13.4"
      fill="none"
      stroke="#FFF5DC"
      strokeWidth="0.85"
      strokeDasharray="1.7 1.9"
      opacity="0.9"
    />

    {/* Center 8-petal Persian flower rosette */}
    {/* Cardinal petals */}
    <path
      d="M24 15.5 C25.8 19 25.8 20.8 24 24 C22.2 20.8 22.2 19 24 15.5Z
         M24 32.5 C25.8 29 25.8 27.2 24 24 C22.2 27.2 22.2 29 24 32.5Z
         M15.5 24 C19 22.2 20.8 22.2 24 24 C20.8 25.8 19 25.8 15.5 24Z
         M32.5 24 C29 22.2 27.2 22.2 24 24 C27.2 25.8 29 25.8 32.5 24Z"
      fill="url(#rosetteGold)"
      stroke="#3A210A"
      strokeWidth="0.85"
    />
    {/* Diagonal petals */}
    <path
      d="M18 18 C20.8 19.4 22 21 24 24 C21 22 19.4 20.8 18 18Z
         M30 30 C27.2 28.6 26 27 24 24 C27 26 28.6 27.2 30 30Z
         M18 30 C19.4 27.2 21 26 24 24 C22 27 20.8 28.6 18 30Z
         M30 18 C28.6 20.8 27 22 24 24 C26 21 27.2 19.4 30 18Z"
      fill="url(#rosetteGold)"
      stroke="#3A210A"
      strokeWidth="0.85"
    />

    {/* Central gleaming bud of the flower */}
    <circle cx="24" cy="24" r="3.4" fill="#FFEAA8" stroke="#48290B" strokeWidth="0.85" />
    <circle cx="23" cy="22.8" r="1.15" fill="#FFFFFF" opacity="0.95" />
  </svg>
  );
};

/**
 * Fantasy Score Star Icon (نشان ستاره فانتزی امتیاز)
 * Designed for the olive/sage green pill to represent user points/score in
 * authentic carved miniature style with gold facets and clay depth.
 */
export const FantasyScoreIcon: React.FC<{
  className?: string;
  style?: React.CSSProperties;
}> = ({ className, style }) => (
  <svg
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={style}
    aria-hidden="true"
  >
    <defs>
      {/* 8-point score star: radiant antique gold to warm clay amber */}
      <linearGradient id="scoreStarGrad" x1="6" y1="4" x2="26" y2="28" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FFF4D0" />
        <stop offset="32%" stopColor="#ECC25E" />
        <stop offset="72%" stopColor="#B68322" />
        <stop offset="100%" stopColor="#68460E" />
      </linearGradient>

      {/* Central diamond jewel */}
      <radialGradient id="scoreGemGrad" cx="35%" cy="32%" r="60%">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="48%" stopColor="#FFE084" />
        <stop offset="88%" stopColor="#CB9324" />
        <stop offset="100%" stopColor="#704A0C" />
      </radialGradient>

      <filter id="scoreReliefShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="1.2" stdDeviation="0.6" floodColor="#14200B" floodOpacity="0.5" />
      </filter>
    </defs>

    {/* Soft drop shadow in the sage hollow */}
    <circle cx="16" cy="17.2" r="12" fill="#121D0A" opacity="0.32" />

    {/* Secondary 4-point star (diagonal rays, rotated 45deg) */}
    <path
      d="M16 7.5 L19.2 12.8 L24.5 16 L19.2 19.2 L16 24.5 L12.8 19.2 L7.5 16 L12.8 12.8 Z"
      fill="url(#scoreStarGrad)"
      stroke="#1E2A12"
      strokeWidth="0.8"
      transform="rotate(45 16 16)"
      opacity="0.9"
    />

    {/* Primary 4-point star (cardinal rays) */}
    <path
      d="M16 3 L19.5 12.5 L29 16 L19.5 19.5 L16 29 L12.5 19.5 L3 16 L12.5 12.5 Z"
      fill="url(#scoreStarGrad)"
      stroke="#1B2810"
      strokeWidth="1.1"
      strokeLinejoin="round"
      filter="url(#scoreReliefShadow)"
    />

    {/* Inner facet crease line */}
    <path
      d="M16 3 L16 29 M3 16 L29 16"
      stroke="#FFF0C8"
      strokeWidth="0.75"
      strokeLinecap="round"
      opacity="0.7"
    />

    {/* Center faceted diamond jewel */}
    <path
      d="M16 11.5 L20.5 16 L16 20.5 L11.5 16 Z"
      fill="url(#scoreGemGrad)"
      stroke="#321F06"
      strokeWidth="0.85"
    />
    <circle cx="15.1" cy="15.1" r="1.1" fill="#FFFFFF" opacity="0.95" />
  </svg>
);

/**
 * Universal GameCoin alias exported from FantasyIcons.
 * Use this as the single source of truth for the game coin icon.
 */
export const GameCoin = FantasyFlowerCoin;
export default GameCoin;
