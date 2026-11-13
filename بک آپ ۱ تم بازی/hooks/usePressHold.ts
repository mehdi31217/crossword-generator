import { useCallback, useRef, useState } from 'react';

/**
 * Press state for the invisible hits laid over the poster artwork.
 *
 * `:active` alone is not enough here: iOS only lights it up when the element
 * carries its own touch listener, and a fast tap (<40ms) can release before a
 * single frame paints the recessed tile. Holding keeps the tile sunk; a quick
 * tap holds the recess for at least 115ms so the clay sink is always visible.
 */
export const usePressHold = () => {
  const [down, setDown] = useState<string | null>(null);
  const downAtRef = useRef<number>(0);
  const timerRef = useRef<number | null>(null);

  const release = useCallback(() => {
    const elapsed = performance.now() - downAtRef.current;
    const minHold = 115;
    if (elapsed < minHold) {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        setDown(null);
        timerRef.current = null;
      }, minHold - elapsed);
    } else {
      setDown(null);
    }
  }, []);

  const bind = useCallback(
    (id: string) => ({
      onPointerDown: () => {
        if (timerRef.current) {
          window.clearTimeout(timerRef.current);
          timerRef.current = null;
        }
        downAtRef.current = performance.now();
        setDown(id);
      },
      onPointerUp: release,
      onPointerLeave: release,
      onPointerCancel: release,
    }),
    [release]
  );

  return { down, bind };
};

