import React from 'react';
import { getAvatarItem, resolveAvatarSrc } from '../data/avatars';

export interface AvatarRendererProps {
  avatar?: string | null;
  size?: number | string;
  className?: string;
  alt?: string;
  /** When true, omits the outer khaki disc image (useful when placed directly over the chassis khaki medallion) */
  framelessOnKhaki?: boolean;
  imageScale?: number;
  imageOffsetX?: number;
  imageOffsetY?: number;
  objectFit?: 'cover' | 'contain' | 'fill';
  withClayBacking?: boolean;
}

/**
 * Renders any player avatar directly on the warm 3D khaki clay disc (/images/d9/h-avatar.webp)
 * with zero extra border or ring around the portrait.
 */
export const AvatarRenderer: React.FC<AvatarRendererProps> = ({
  avatar,
  size,
  className = '',
  alt,
  framelessOnKhaki = false,
  imageScale = 1.35,
  imageOffsetX = 0,
  imageOffsetY = 0,
  objectFit = 'cover',
  withClayBacking = true,
}) => {
  const src = resolveAvatarSrc(avatar);
  const item = getAvatarItem(avatar);
  const label = alt || item?.nameFa || 'Avatar';

  const actualSize = size ?? (!className ? 44 : undefined);
  const dimStyle: React.CSSProperties =
    actualSize !== undefined
      ? { width: actualSize, height: actualSize }
      : {};

  const imgTransform = `scale(${imageScale}) translate(${imageOffsetX}%, ${imageOffsetY}%)`;

  const bgStyle: React.CSSProperties =
    !framelessOnKhaki || withClayBacking
      ? {
          backgroundImage: "url('/images/d9/h-avatar.webp')",
          backgroundSize: '100% 100%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }
      : {};

  if (src) {
    return (
      <span
        className={`relative inline-flex items-center justify-center rounded-full shrink-0 select-none overflow-hidden ${className}`}
        style={{
          ...dimStyle,
          ...bgStyle,
        }}
        title={item ? `${item.nameFa} — ${item.titleFa}` : alt}
      >
        <span className="w-full h-full rounded-full overflow-hidden flex items-center justify-center">
          <img
            src={src}
            alt={label}
            className="w-full h-full pointer-events-none select-none rounded-full"
            style={{
              objectFit,
              mixBlendMode: 'multiply',
              filter: 'contrast(1.12) brightness(1.02)',
              transform: imgTransform,
            }}
            draggable={false}
          />
        </span>
      </span>
    );
  }

  // Fallback for legacy emoji strings on the khaki clay disc
  return (
    <span
      className={`relative inline-flex items-center justify-center rounded-full shrink-0 select-none overflow-hidden ${className}`}
      style={{
        ...dimStyle,
        backgroundImage: "url('/images/d9/h-avatar.webp')",
        backgroundSize: '100% 100%',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <span
        className="leading-none"
        style={{
          fontSize: typeof size === 'number' ? Math.round(size * 0.5) : '1.15em',
        }}
      >
        {avatar}
      </span>
    </span>
  );
};
