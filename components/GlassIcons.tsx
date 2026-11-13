import React from 'react';

/* ============================================================
   GlassIcons — a cohesive, minimalist icon family for the
   "fresh glass" design system. All icons are thin rounded
   line glyphs (currentColor) that read consistently with the
   proposal's soft, friendly aesthetic. Pair them with
   <GlassBadge> to get the gradient rounded-square treatment
   used across the app (stat pills, headers, tabs).
   ============================================================ */

type P = {
  size?: number;
  strokeWidth?: number;
  className?: string;
  style?: React.CSSProperties;
};

const svg = (size: number, sw: number, className?: string, style?: React.CSSProperties) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: sw,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  className,
  style,
});

/* ---------- people ---------- */
export const User: React.FC<P> = ({ size = 20, strokeWidth = 1.8, className, style }) => (
  <svg {...svg(size, strokeWidth, className, style)}>
    <circle cx="12" cy="8.2" r="3.9" />
    <path d="M4.5 19.5c.6-3.8 3.7-6 7.5-6s6.9 2.2 7.5 6" />
  </svg>
);

export const UserPlus: React.FC<P> = ({ size = 20, strokeWidth = 1.8, className, style }) => (
  <svg {...svg(size, strokeWidth, className, style)}>
    <circle cx="10.5" cy="8" r="3.6" />
    <path d="M4 18.6c.5-3.3 3-5.1 6.5-5.1" />
    <path d="M18 13.5v5M15.5 16h5" />
  </svg>
);

export const Users: React.FC<P> = ({ size = 20, strokeWidth = 1.8, className, style }) => (
  <svg {...svg(size, strokeWidth, className, style)}>
    <circle cx="9" cy="8.4" r="3.2" />
    <path d="M3.4 18.4c.5-2.9 2.6-4.6 5.6-4.6s5.1 1.7 5.6 4.6" />
    <circle cx="16.6" cy="9.6" r="2.5" />
    <path d="M15 14.4c2.4.1 4.3 1.6 4.8 4" />
  </svg>
);

/* ---------- achievements ---------- */
export const Award: React.FC<P> = ({ size = 20, strokeWidth = 1.8, className, style }) => (
  <svg {...svg(size, strokeWidth, className, style)}>
    <path d="M12 3.2l2.3 4.7 5.2.8-3.8 3.7.9 5.2L12 15.9l-4.6 2.4.9-5.2L4.5 8.7l5.2-.8z" />
  </svg>
);

export const Trophy: React.FC<P> = ({ size = 20, strokeWidth = 1.8, className, style }) => (
  <svg {...svg(size, strokeWidth, className, style)}>
    <path d="M7 4h10v4.2a5 5 0 0 1-10 0z" />
    <path d="M7 5.4H4.4v1.6A2.6 2.6 0 0 0 7 9.6M17 5.4h2.6v1.6A2.6 2.6 0 0 1 17 9.6" />
    <path d="M12 13.4v3M9.4 20h5.2M10.2 16.4h3.6l.4 3.6h-4.4z" />
  </svg>
);

export const Zap: React.FC<P> = ({ size = 20, strokeWidth = 1.8, className, style }) => (
  <svg {...svg(size, strokeWidth, className, style)}>
    <path d="M13 2.5L5 13.4h5.4L10.4 21.5 19 10h-5.4z" />
  </svg>
);

export const History: React.FC<P> = ({ size = 20, strokeWidth = 1.8, className, style }) => (
  <svg {...svg(size, strokeWidth, className, style)}>
    <path d="M12 21.5a9.5 9.5 0 1 1 8.6-5.4" />
    <path d="M20.2 4.2v3.6h-3.6" />
    <path d="M12 7.5V12l3 2" />
  </svg>
);

/* ---------- actions ---------- */
export const Save: React.FC<P> = ({ size = 20, strokeWidth = 1.8, className, style }) => (
  <svg {...svg(size, strokeWidth, className, style)}>
    <path d="M5 4.5h11l3 3v12a1.5 1.5 0 0 1-1.5 1.5h-12A1.5 1.5 0 0 1 4 19.5v-14A1.5 1.5 0 0 1 5 4.5z" />
    <path d="M8 4.5v4.5h7V4.5M8 20v-6h8v6" />
  </svg>
);

export const Check: React.FC<P> = ({ size = 20, strokeWidth = 1.8, className, style }) => (
  <svg {...svg(size, strokeWidth, className, style)}>
    <path d="M5 12.5l4.5 4.5L19 7" />
  </svg>
);

export const X: React.FC<P> = ({ size = 20, strokeWidth = 1.8, className, style }) => (
  <svg {...svg(size, strokeWidth, className, style)}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

export const Copy: React.FC<P> = ({ size = 20, strokeWidth = 1.8, className, style }) => (
  <svg {...svg(size, strokeWidth, className, style)}>
    <rect x="8.5" y="8.5" width="11" height="11" rx="2.6" />
    <path d="M4.5 15.5h-.5A2 2 0 0 1 2 13.5v-9A2 2 0 0 1 4 2.5h9A2 2 0 0 1 15 4.5v.5" />
  </svg>
);

export const Trash: React.FC<P> = ({ size = 20, strokeWidth = 1.8, className, style }) => (
  <svg {...svg(size, strokeWidth, className, style)}>
    <path d="M4.5 6.5h15M9 6.5V4.5h6v2M6 6.5l.8 12.5a1.5 1.5 0 0 0 1.5 1.4h7.4a1.5 1.5 0 0 0 1.5-1.4L18 6.5" />
    <path d="M10 10.5v6M14 10.5v6" />
  </svg>
);

/* ---------- chat / social ---------- */
export const Message: React.FC<P> = ({ size = 20, strokeWidth = 1.8, className, style }) => (
  <svg {...svg(size, strokeWidth, className, style)}>
    <path d="M4.5 5.5h15a1.5 1.5 0 0 1 1.5 1.5v8.5a1.5 1.5 0 0 1-1.5 1.5H9.5L5 20.5v-3.5h-.5A1.5 1.5 0 0 1 3 15.5V7A1.5 1.5 0 0 1 4.5 5.5z" />
  </svg>
);

export const Send: React.FC<P> = ({ size = 20, strokeWidth = 1.8, className, style }) => (
  <svg {...svg(size, strokeWidth, className, style)}>
    <path d="M20.5 3.5L3 11l6.5 2.5L12 20l2.5-7.5L20.5 3.5z" />
    <path d="M9.5 13.5l11-10" />
  </svg>
);

export const Swords: React.FC<P> = ({ size = 20, strokeWidth = 1.8, className, style }) => (
  <svg {...svg(size, strokeWidth, className, style)}>
    <path d="M14.5 3.5L20.5 3.5L20.5 9.5L8 18L6 16L14.5 9.5z" />
    <path d="M9.5 20.5L3.5 20.5L3.5 14.5L16 6L18 8L9.5 14.5z" />
    <path d="M16.5 16.5l1.5 1.5M7.5 7.5L6 6" />
  </svg>
);

export const ArrowLeft: React.FC<P> = ({ size = 20, strokeWidth = 1.8, className, style }) => (
  <svg {...svg(size, strokeWidth, className, style)}>
    <path d="M14.5 5.5L8 12l6.5 6.5M8 12H20" />
  </svg>
);

/* ---------- time / calendar ---------- */
export const Clock: React.FC<P> = ({ size = 20, strokeWidth = 1.8, className, style }) => (
  <svg {...svg(size, strokeWidth, className, style)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7v5l3.5 2" />
  </svg>
);

export const Calendar: React.FC<P> = ({ size = 20, strokeWidth = 1.8, className, style }) => (
  <svg {...svg(size, strokeWidth, className, style)}>
    <rect x="3.5" y="5" width="17" height="15.5" rx="3" />
    <path d="M3.5 9.5h17M8 3.2v3.6M16 3.2v3.6" />
  </svg>
);

/* ---------- auth ---------- */
export const LogIn: React.FC<P> = ({ size = 20, strokeWidth = 1.8, className, style }) => (
  <svg {...svg(size, strokeWidth, className, style)}>
    <path d="M14.5 4.5h3.5a1.5 1.5 0 0 1 1.5 1.5v12a1.5 1.5 0 0 1-1.5 1.5h-3.5" />
    <path d="M9 12h11M15.5 8l4 4-4 4" />
  </svg>
);

export const LogOut: React.FC<P> = ({ size = 20, strokeWidth = 1.8, className, style }) => (
  <svg {...svg(size, strokeWidth, className, style)}>
    <path d="M14.5 4.5h3.5a1.5 1.5 0 0 1 1.5 1.5v12a1.5 1.5 0 0 1-1.5 1.5h-3.5" />
    <path d="M9 12h11M15.5 8l-4 4 4 4" />
  </svg>
);

/* ---------- theme ---------- */
export const Sun: React.FC<P> = ({ size = 20, strokeWidth = 1.8, className, style }) => (
  <svg {...svg(size, strokeWidth, className, style)}>
    <circle cx="12" cy="12" r="4.2" />
    <path d="M12 2.5v2.6M12 18.9v2.6M2.5 12h2.6M18.9 12h2.6M5.2 5.2l1.9 1.9M16.9 16.9l1.9 1.9M18.8 5.2l-1.9 1.9M7.1 16.9l-1.9 1.9" />
  </svg>
);

export const Moon: React.FC<P> = ({ size = 20, strokeWidth = 1.8, className, style }) => (
  <svg {...svg(size, strokeWidth, className, style)}>
    <path d="M20 14.2A8 8 0 0 1 9.8 4 8 8 0 1 0 20 14.2z" />
  </svg>
);

export const Monitor: React.FC<P> = ({ size = 20, strokeWidth = 1.8, className, style }) => (
  <svg {...svg(size, strokeWidth, className, style)}>
    <rect x="3.5" y="4.5" width="17" height="12" rx="2.4" />
    <path d="M9 20.5h6M12 16.5v4" />
  </svg>
);

/* ---------- misc ---------- */
export const Spinner: React.FC<P> = ({ size = 20, strokeWidth = 2, className, style }) => (
  <svg {...svg(size, strokeWidth, className, style)}>
    <path d="M12 3a9 9 0 1 0 9 9" />
  </svg>
);

/* ============================================================
   GlassBadge — gradient rounded square that holds an icon,
   matching the menu's mm-ic treatment. Used for section
   headers, stat pills and CTA accents across the app.
   ============================================================ */
export const BADGES: Record<string, string> = {
  blue:   'linear-gradient(150deg,#5ec8ff,#0a84ff)',
  indigo: 'linear-gradient(150deg,#bf5af2,#5e5ce6)',
  violet: 'linear-gradient(150deg,#b39bff,#7c5cff)',
  teal:   'linear-gradient(150deg,#7ce8d8,#32c5d6)',
  pink:   'linear-gradient(150deg,#ff7a9c,#ff375f)',
  rose:   'linear-gradient(150deg,#ff8aa6,#ff4d6d)',
  amber:  'linear-gradient(150deg,#ffd60a,#ff9f0a)',
  gold:   'linear-gradient(150deg,#ffe07a,#ffc14d)',
  green:  'linear-gradient(150deg,#7ee2a8,#30d158)',
};

export type BadgeColor = keyof typeof BADGES;

export const GlassBadge: React.FC<{
  color?: BadgeColor;
  size?: number;
  radius?: number;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}> = ({ color = 'indigo', size = 44, radius = 14, children, className, style }) => (
  <span
    className={className}
    style={{
      width: size,
      height: size,
      borderRadius: radius,
      display: 'inline-grid',
      placeItems: 'center',
      background: BADGES[color],
      color: '#fff',
      boxShadow: '0 8px 18px -8px rgba(20,30,70,.5), inset 0 1.5px 0 rgba(255,255,255,.45)',
      flex: '0 0 auto',
      ...style,
    }}
  >
    {children}
  </span>
);
