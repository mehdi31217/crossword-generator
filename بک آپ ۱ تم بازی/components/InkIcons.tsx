import React from 'react';
import { GameCoin } from './GameCoin';

/* Hand-inked icon family — the drawing language of the approved paper & ink
   design: a single ink contour, round caps, lines that bow instead of running
   dead straight, no gradients and no filled silhouettes. Every icon is drawn on
   a 24-unit grid with strokeWidth 1.6 so the family stays optically even. */

export interface InkIconProps {
  size?: number | string;
  className?: string;
  style?: React.CSSProperties;
  strokeWidth?: number;
}

type Glyph = (p: InkIconProps) => React.ReactElement;

const svgProps = (p: InkIconProps) => ({
  viewBox: '0 0 24 24',
  width: p.size ?? 24,
  height: p.size ?? 24,
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: p.strokeWidth ?? 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  className: p.className,
  style: p.style,
  'aria-hidden': true,
  focusable: 'false' as const,
});

const Icon: React.FC<InkIconProps & { d: string[]; dots?: number[][]; fills?: string[] }> = ({
  d, dots, fills, ...p
}) => (
  <svg {...svgProps(p)}>
    {d.map((path, i) => <path key={i} d={path} />)}
    {fills?.map((path, i) => (
      <path key={`f${i}`} d={path} fill="currentColor" stroke="none" />
    ))}
    {dots?.map(([cx, cy], i) => (
      <circle key={`c${i}`} cx={cx} cy={cy} r={1.15} fill="currentColor" stroke="none" />
    ))}
  </svg>
);

/* ── navigation ───────────────────────────────────────────────────── */

export const InkHome: Glyph = (p) => (
  <Icon {...p} d={[
    'M3.6 11.4c2.4-2.6 5.2-5.2 8.2-7.6.2-.2.5-.2.7 0 3 2.4 5.7 5 8.1 7.6',
    'M5.8 10.6c.1 3 .1 5.7-.1 8.5 3.8.3 8.3.3 12.5 0-.2-2.8-.2-5.5-.1-8.5',
    'M10.2 19.1c-.1-1.5-.1-2.8.1-4.1.9-.9 2.5-.9 3.4 0 .2 1.3.2 2.6.1 4.1',
  ]} />
);

export const InkBooks: Glyph = (p) => (
  <Icon {...p} d={[
    'M4.4 7.1c2.3-.5 4.7-.6 7-.3.3 0 .5.2.5.5l.6 9.1c-2.5-.4-4.9-.3-7.3.2-.2 0-.4-.1-.4-.4z',
    'M12.9 7.4c2.3-.3 4.6-.2 6.9.4l-.6 9c-2.3-.5-4.5-.6-6.8-.2',
    'M7.6 9.6c.9-.1 1.8-.1 2.7 0M7.8 12c.9-.1 1.7-.1 2.5 0',
    'M3.9 19.2c5.6-.7 10.8-.7 16.2 0',
  ]} />
);

export const InkTrophy: Glyph = (p) => (
  <Icon {...p} d={[
    'M8.1 4.2c2.6-.2 5.2-.2 7.8 0 .2 2.5-.1 5.1-1.6 6.8-1.4 1.6-3.3 1.6-4.7 0C8.2 9.3 7.9 6.7 8.1 4.2z',
    'M8.2 5.6H5.9c-.2 1.6.7 2.8 2.4 3M15.8 5.6h2.3c.2 1.6-.7 2.8-2.4 3',
    'M12 11.3c0 1.6 0 3.1-.1 4.5',
    'M8.7 18.6c2.2-.4 4.4-.4 6.6 0',
    'M9.5 15.8h5c.2 1 .2 2 0 2.8-1.7.2-3.3.2-5 0-.2-.8-.2-1.8 0-2.8z',
  ]} />
);

export const InkUsers: Glyph = (p) => (
  <Icon {...p} d={[
    'M9.4 4.3c1.9-.2 3.3 1.2 3.3 3 0 1.9-1.5 3.4-3.4 3.2-1.8-.2-3-1.6-2.9-3.4.1-1.5 1.4-2.7 3-2.8z',
    'M4.3 19.2c.2-2.6 2.4-4.6 5.1-4.7 2.7-.1 4.9 1.8 5.2 4.4',
    'M15.3 5.4c1.7-.1 3 1.2 3 2.9 0 1.5-1.1 2.8-2.6 2.9',
    'M16.7 14.8c1.9.2 3.3 1.7 3.4 3.6',
  ]} />
);

export const InkUser: Glyph = (p) => (
  <Icon {...p} d={[
    'M12 4.1c2.1-.2 3.7 1.4 3.7 3.4 0 2.1-1.7 3.8-3.8 3.6-2-.2-3.4-1.8-3.3-3.8.1-1.7 1.6-3 3.4-3.2z',
    'M5.3 19.5c.2-3.1 2.8-5.5 6-5.6 3.3-.1 6 2.2 6.3 5.3',
  ]} />
);

/* ── game modes ───────────────────────────────────────────────────── */

/* The treasure shelf: an open illuminated manuscript with a rosette stamped on
   the page — the library, not a gem. */
export const InkTome: Glyph = (p) => (
  <Icon {...p} d={[
    'M12 7.4c-2.4-1.3-4.9-1.7-7.6-1.4-.3 0-.5.2-.5.5v10.1c0 .3.2.4.5.4 2.6-.3 5.1.1 7.4 1.3',
    'M12.2 7.4c2.3-1.3 4.8-1.7 7.5-1.4.3 0 .5.2.5.5v10.1c0 .3-.2.4-.5.4-2.5-.3-5 .1-7.3 1.3',
    'M12.1 7.6v10.7',
    'M15.6 10.8a2 2 0 1 1-2.1 2.4',
  ]} dots={[[15.9, 12.1]]} />
);

export const InkTower: Glyph = (p) => (
  <Icon {...p} d={[
    'M8.4 19.6c.4-3.6.6-7.2.5-10.9 2.1-.3 4.1-.3 6.2 0 .1 3.7.3 7.3.7 10.9',
    'M8.2 8.7 8 5.4c1-.2 1.9-.2 2.8 0l-.2 3.3M13.4 8.7l-.2-3.3c.9-.2 1.8-.2 2.7 0l.2 3.3',
    'M10.6 19.5v-2.6c.9-.6 1.9-.6 2.8 0v2.6',
    'M9.6 12.2c1.6-.2 3.2-.2 4.8 0',
    'M6.2 19.8c3.9-.5 7.8-.5 11.6 0',
  ]} />
);

export const InkSwords: Glyph = (p) => (
  <Icon {...p} d={[
    'M4.4 4.2c2.9.6 5.6 1.9 7.9 4.2 2 2 3.9 4.2 5.6 6.6',
    'M15.6 15.7l-2.1-1.1-1.1-2.1 2 .7 1.5 1.5z',
    'M19.6 4.2c-2.9.6-5.6 1.9-7.9 4.2-2 2-3.9 4.2-5.6 6.6',
    'M8.4 15.7l2.1-1.1 1.1-2.1-2 .7-1.5 1.5z',
    'M6.1 18.6l1.7-1.7M17.9 18.6l-1.7-1.7',
  ]} />
);

/* A shield, drawn as one bowed contour with a single inner rule. */
export const InkShield: Glyph = (p) => (
  <Icon {...p} d={[
    'M12 3.9c2.3.9 4.4 1.4 6.4 1.6.5 3.4-.1 6.3-1.6 8.8-1.3 2.1-3 3.7-4.8 4.9-1.9-1.2-3.6-2.8-4.9-4.9-1.5-2.5-2-5.4-1.5-8.8 2-.2 4.1-.7 6.4-1.6z',
    'M9.4 8.9c1.7-.2 3.4-.2 5.1 0',
  ]} dots={[[12, 12.6]]} />
);

/* Sending a finished board to a friend: a sealed scroll. */
export const InkScroll: Glyph = (p) => (
  <Icon {...p} d={[
    'M7.2 5.6c3.2-.2 6.4-.2 9.6 0 .2 4 .2 8.1 0 12.1-3.2.2-6.4.2-9.6 0-.2-4-.2-8.1 0-12.1z',
    'M5.1 5.4c.7 0 1.3.2 1.9.5v11.6c-.6.3-1.2.4-1.9.4-.5 0-.8-.3-.8-.8V6.2c0-.5.3-.8.8-.8z',
    'M18.9 6.1c.6-.3 1.2-.4 1.9-.4.5 0 .8.3.8.8v10.9c0 .5-.3.8-.8.8-.7 0-1.3-.1-1.9-.4',
    'M9.7 9.4c1.5-.2 3-.2 4.5 0M9.7 12c1.2-.1 2.3-.1 3.4 0',
    'M13.3 15.3a1.6 1.6 0 1 1-2.1 1.8',
  ]} dots={[[13.6, 16.5]]} />
);

/* ── economy & chrome ─────────────────────────────────────────────── */

export const InkCoin: Glyph = (p) => (
  <GameCoin size={p.size ?? 24} className={p.className} style={p.style} />
);

export const InkBag: Glyph = (p) => (
  <Icon {...p} d={[
    'M5.6 8.4c4.3-.4 8.5-.4 12.8 0 .5 3.7.8 7.2.9 10.7-4.9.3-9.7.3-14.6 0 .1-3.5.4-7 .9-10.7z',
    'M8.7 8.6c-.2-1.9.9-3.5 2.9-3.6 2-.1 3.4 1.4 3.4 3.5',
    'M9.4 11.6v1.2M14.6 11.6v1.2',
  ]} />
);

export const InkUserPlus: Glyph = (p) => (
  <Icon {...p} d={[
    'M9.4 4.6c1.9-.2 3.4 1.3 3.3 3.2-.1 1.9-1.6 3.3-3.5 3.1-1.7-.2-2.9-1.6-2.9-3.3.1-1.5 1.4-2.8 3.1-3z',
    'M3.9 19.1c.2-2.7 2.4-4.8 5.2-4.9 1.3 0 2.5.4 3.4 1.2',
    'M17.4 12.2v6.2M14.3 15.3h6.2',
  ]} />
);

export const InkFlame: Glyph = (p) => (
  <Icon {...p} d={[
    'M12 3.9c.4 3.1 2.1 4.2 3.4 6.1 1.4 2 1.7 4.4.5 6.3-1.1 1.8-3.2 2.8-5.3 2.3-2.3-.5-3.8-2.7-3.4-5 .3-1.9 1.6-3.1 2.6-4.4.4 1.2.7 2 1.6 2.6.9-2.6.7-5.1.6-7.9z',
    'M11.8 19c-1.1-.4-1.7-1.5-1.4-2.6.2-.8.9-1.4 1.5-1.9.2 1 .6 1.5 1.1 1.9.5.5.6 1.3.3 1.9',
  ]} />
);

export const InkSpark: Glyph = (p) => (
  <Icon {...p} d={[
    'M12 3.8c.6 3 1.5 4.9 4.2 6.1-2.7 1.2-3.6 3.1-4.2 6.1-.6-3-1.5-4.9-4.2-6.1 2.7-1.2 3.6-3.1 4.2-6.1z',
    'M17.6 14.4c.3 1.4.7 2.3 1.9 2.9-1.2.6-1.6 1.5-1.9 2.9-.3-1.4-.7-2.3-1.9-2.9 1.2-.6 1.6-1.5 1.9-2.9z',
  ]} />
);

export const InkTarget: Glyph = (p) => (
  <Icon {...p} d={[
    'M12 3.8c4.6-.2 8.3 3.5 8.2 8.1-.1 4.5-3.8 8.2-8.3 8.1-4.4-.1-8-3.7-8-8.2 0-4.3 3.5-7.9 8.1-8z',
    'M12 7.6a4.5 4.5 0 1 1-.2 9 4.5 4.5 0 0 1 .2-9z',
    'M12 10.9a1.7 1.7 0 1 1-.2 3.4 1.7 1.7 0 0 1 .2-3.4z',
  ]} dots={[[12.1, 12.6]]} />
);

export const InkGift: Glyph = (p) => (
  <Icon {...p} d={[
    'M4.8 9.6c4.8-.5 9.6-.5 14.4 0 .1 3.3.1 6.4-.1 9.5-4.7.4-9.4.4-14.1 0-.2-3.1-.2-6.2-.2-9.5z',
    'M12 9.4v9.8',
    'M4.6 9.6c-.4-1.2.2-2.4 1.4-2.7 1.6-.4 3.2.4 3.9 1.9-1.9 1.2-4 1.7-5.3.8z',
    'M19.4 9.6c.4-1.2-.2-2.4-1.4-2.7-1.6-.4-3.2.4-3.9 1.9 1.9 1.2 4 1.7 5.3.8z',
    'M4.8 13c4.8-.3 9.6-.3 14.4 0',
  ]} />
);

export const InkCheck: Glyph = (p) => (
  <Icon {...p} d={['M4.6 12.8c1.6.7 2.9 1.8 3.9 3.1 2.4-4.6 5.6-8.1 9.9-10.4']} />
);

export const InkLock: Glyph = (p) => (
  <Icon {...p} d={[
    'M7.1 10.4c3.3-.3 6.5-.3 9.8 0 .3 2.9.3 5.8.1 8.7-3.3.4-6.6.4-9.9 0-.3-2.9-.3-5.8 0-8.7z',
    'M9 10.3c-.3-1.8-.2-3.4.9-4.4 1.2-1.1 3-1 4.1.2 1 1.1 1.1 2.6.8 4.2',
    'M12 13.4c.7 0 1.2.6 1.1 1.3-.1.5-.4.8-.9.9v1.4',
  ]} dots={[[11.9, 14.2]]} />
);

export const InkClose: Glyph = (p) => (
  <Icon {...p} d={['M6.1 5.9c3.9 4 7.8 8 11.7 12.1M18.1 6.1c-4 3.8-8 7.7-12 11.7']} />
);

export const InkBack: Glyph = (p) => (
  <Icon {...p} d={['M14.4 4.9c-3 2.2-5.8 4.6-8.5 7.1 2.7 2.5 5.5 4.9 8.5 7.1']} />
);

export const InkGlobe: Glyph = (p) => (
  <Icon {...p} d={[
    'M12 3.7c4.6-.1 8.4 3.6 8.3 8.2-.1 4.5-3.8 8.3-8.3 8.2-4.5-.1-8.2-3.8-8.2-8.3 0-4.4 3.6-8 8.2-8.1z',
    'M3.8 12c5.4-.3 10.9-.3 16.3 0',
    'M6.6 6.4c2.9 2.4 4.6 5.2 4.9 8.5.2 2.4-.6 4.6-2 6.6',
    'M17.3 6.6c-2.8 2.3-4.4 5-4.7 8.2-.2 2.4.5 4.5 1.9 6.5',
  ]} />
);

export const InkMap: Glyph = (p) => (
  <Icon {...p} d={[
    'M3.9 6.4c2.6-1 5.2-1 7.8 0 2.6 1 5.3 1 7.9 0 .9 4.2.9 8.3.1 12.4-2.7 1-5.4 1-8 0-2.6-1-5.2-1-7.8 0-.8-4.1-.8-8.2 0-12.4z',
    'M7.7 6.9c0 4.1 0 8.1.1 12.1M16 6.7c0 4.2 0 8.3-.1 12.3',
    'M10.8 10.2c.9-.3 1.7-.3 2.6 0',
  ]} dots={[[12.2, 13.2], [14.6, 15.6]]} />
);

export const InkBolt: Glyph = (p) => (
  <Icon {...p} d={['M13.4 3.6c-2.4 4-4.6 8-6.6 12.1 2.2-.3 4.1-.2 6.1.3-1 1.6-1.9 3.2-2.7 4.9 2.9-2.9 5.4-6.1 7.5-9.7-2.1.4-4 .3-5.9-.2.7-2.5 1.2-5 1.6-7.4z']} />
);

export const InkCalendar: Glyph = (p) => (
  <Icon {...p} d={[
    'M5.1 6.9c4.6-.5 9.2-.5 13.8 0 .3 4 .3 8.1 0 12.1-4.6.4-9.2.4-13.8 0-.3-4-.3-8.1 0-12.1z',
    'M4.8 10.6c4.8-.4 9.6-.4 14.4 0',
    'M8.4 4.3c-.1 1 -.1 1.9 0 2.8M15.7 4.3c.1.9.1 1.8 0 2.7',
    'M8.9 13.6h1.4M13.8 13.6h1.4M8.9 16.4h1.4',
  ]} />
);

export const InkClock: Glyph = (p) => (
  <Icon {...p} d={[
    'M12 3.7c4.6-.1 8.4 3.6 8.3 8.2-.1 4.5-3.8 8.3-8.3 8.2-4.5-.1-8.2-3.8-8.2-8.3 0-4.4 3.6-8 8.2-8.1z',
    'M12 7.6c0 2.9 0 4.6-.1 6.2 1.3.3 2.4.8 3.6 1.6',
  ]} />
);

export const InkRefresh: Glyph = (p) => (
  <Icon {...p} d={[
    'M19 12.4c-.2-2.5-1.6-4.7-3.9-5.7-2.5-1.1-5.4-.5-7.3 1.5',
    'M5.1 11.6c.2 2.5 1.6 4.7 3.9 5.7 2.5 1.1 5.4.5 7.3-1.5',
    'M4.6 4.9c0 2 0 4 .2 6 1.8-.2 3.5-.6 5.2-1.2',
    'M19.4 19.1c0-2 0-4-.2-6-1.8.2-3.5.6-5.2 1.2',
  ]} />
);

export const InkTrend: Glyph = (p) => (
  <Icon {...p} d={[
    'M4.6 17.6c2.7-1.8 5-4 7-6.5 1.7 1.3 3.2 2.8 4.6 4.5 1.2-2.9 2.7-5.5 4.5-7.9',
    'M16.6 5.5c1.6-.1 3.2.1 4.7.5-.1 1.5-.4 3-.9 4.4',
    'M4.4 20.2c5.2-.4 10.4-.4 15.6 0',
  ]} />
);

export const InkLeaf: Glyph = (p) => (
  <Icon {...p} d={[
    'M19.4 4.9c.5 3.3-.2 6.3-1.9 8.9-1.5 2.3-3.9 3.8-6.7 4.1-1.9.2-3.6-.4-4.9-1.7 2.7-4.3 6.1-7.4 10.2-9.4',
    'M5.8 19.1c1.7-3.3 3.9-6.2 6.6-8.8',
  ]} />
);

export const InkSettings: Glyph = (p) => (
  <Icon {...p} d={[
    'M12 8.9a3.2 3.2 0 1 1-.1 6.4 3.2 3.2 0 0 1 .1-6.4z',
    'M12 3.9c.4 1 .7 1.9.9 2.8 1.1-.2 2.2-.3 3.3-.2.5-.8 1-1.6 1.6-2.4.8.5 1.5 1 2.2 1.6-.6.9-1.2 1.7-1.8 2.5.7.8 1.3 1.7 1.7 2.7 1 .1 2 .4 3 .8-.2 1-.5 1.9-.8 2.8-1 .1-2 .1-3 .2-.4 1-.9 1.9-1.6 2.7.6.8 1.2 1.6 1.7 2.5-.7.6-1.5 1.1-2.3 1.5-.5-.8-1-1.6-1.5-2.4-1 .2-2.1.2-3.1 0-.5.8-1 1.6-1.6 2.3-.8-.4-1.6-.9-2.3-1.5.6-.8 1.1-1.6 1.7-2.4-.7-.8-1.3-1.7-1.7-2.7-1-.1-2-.2-3-.4.2-1 .4-1.9.7-2.8 1-.1 2-.1 3-.1.4-1 .9-2 1.6-2.8-.6-.8-1.2-1.6-1.7-2.5.7-.6 1.5-1.1 2.3-1.5.5.8 1 1.5 1.5 2.3 1-.2 2.1-.2 3.1-.1.3-.9.6-1.8 1-2.7z',
  ]} />
);

/* ── ornaments ────────────────────────────────────────────────────── */

/* A four-petal floret with a dot — the corner mark used on every sheet in the
   design. Sized by the parent; drawn with the same ink weight as the icons. */
export const InkFloret: React.FC<InkIconProps & { rotate?: number }> = ({ rotate = 0, ...p }) => (
  <svg {...svgProps(p)} viewBox="0 0 24 24" style={{ ...p.style, transform: rotate ? `rotate(${rotate}deg)` : undefined }}>
    <path d="M12 4.6c1.4 2.5 2 4.4 0 6.6-2-2.2-1.4-4.1 0-6.6z" />
    <path d="M19.4 12c-2.5 1.4-4.4 2-6.6 0 2.2-2 4.1-1.4 6.6 0z" />
    <path d="M12 19.4c-1.4-2.5-2-4.4 0-6.6 2 2.2 1.4 4.1 0 6.6z" />
    <path d="M4.6 12c2.5-1.4 4.4-2 6.6 0-2.2 2-4.1 1.4-6.6 0z" />
    <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
  </svg>
);

/* Divider: a hairline that opens around a diamond, like the section rules in
   the approved layout. Rendered as a flex row of [line — diamond — line]. */
export const InkRule: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className, style }) => (
  <span className={`ink-rule${className ? ' ' + className : ''}`} style={style} aria-hidden="true">
    <i />
    <svg viewBox="0 0 12 12" width="9" height="9" fill="none" stroke="currentColor" strokeWidth="1.3">
      <path d="M6 1.2 10.8 6 6 10.8 1.2 6z" />
    </svg>
    <i />
  </span>
);

/* ── medallion ────────────────────────────────────────────────────── */

export type MedallionTone = 'ochre' | 'sage' | 'rose' | 'indigo' | 'cream';

const TONE: Record<MedallionTone, { bg: string; ink: string; ring: string }> = {
  ochre:  { bg: 'radial-gradient(circle at 32% 26%, #D9AE5C 0%, #C1913C 62%, #A97C2C 100%)', ink: '#2A1C0E', ring: 'rgba(42,28,14,.5)' },
  sage:   { bg: 'radial-gradient(circle at 32% 26%, #A3B394 0%, #879878 62%, #71825F 100%)', ink: '#1E2418', ring: 'rgba(30,36,24,.5)' },
  rose:   { bg: 'radial-gradient(circle at 32% 26%, #D2A096 0%, #C08B7F 62%, #A87468 100%)', ink: '#2A1512', ring: 'rgba(42,21,18,.5)' },
  indigo: { bg: 'radial-gradient(circle at 32% 26%, #93A0B0 0%, #78869A 62%, #63707F 100%)', ink: '#141821', ring: 'rgba(20,24,33,.5)' },
  cream:  { bg: 'radial-gradient(circle at 32% 26%, #FBF6EC 0%, #F1E7D6 68%, #E3D5BE 100%)', ink: '#2A1C0E', ring: 'rgba(42,28,14,.35)' },
};

/* The icon medallion from the design: a pressed-clay disc with an ink contour
   and a hairline inner ring, holding a line icon. */
export const Medallion: React.FC<{
  tone?: MedallionTone;
  size?: number;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}> = ({ tone = 'ochre', size = 46, children, className, style }) => {
  const t = TONE[tone];
  return (
    <span
      className={`ink-medallion${className ? ' ' + className : ''}`}
      style={{
        width: size,
        height: size,
        background: t.bg,
        color: t.ink,
        boxShadow: `0 0 0 1px ${t.ring}, 0 6px 12px -6px rgba(40,22,12,.55), inset 0 1px 0 rgba(255,255,255,.45), inset 0 -2px 4px rgba(58,32,18,.28)`,
        ...style,
      }}
    >
      <span className="ink-medallion-ring" style={{ borderColor: t.ring }} aria-hidden="true" />
      {children}
    </span>
  );
};

/* Corner ornaments for sheets and cards: two mirrored florets, tucked into the
   corners of the frame. Drawn in the ink colour at low weight. */
export const CornerFlorets: React.FC<{ inset?: number; size?: number; color?: string }> = ({
  inset = 6, size = 11, color = 'currentColor',
}) => (
  <>
    <InkFloret size={size} style={{ position: 'absolute', top: inset, insetInlineStart: inset, color, opacity: .55 }} />
    <InkFloret size={size} style={{ position: 'absolute', top: inset, insetInlineEnd: inset, color, opacity: .55, transform: 'rotate(90deg)' }} />
    <InkFloret size={size} style={{ position: 'absolute', bottom: inset, insetInlineStart: inset, color, opacity: .55, transform: 'rotate(-90deg)' }} />
    <InkFloret size={size} style={{ position: 'absolute', bottom: inset, insetInlineEnd: inset, color, opacity: .55, transform: 'rotate(180deg)' }} />
  </>
);
