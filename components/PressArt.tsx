import React from 'react';
import { PressPanel } from './pressTiles';

interface PressArtProps {
  /** the panel the tile was cropped from — supplies its pixel grid */
  panel: PressPanel;
  /** manifest key of the control, e.g. `kb-r2c3` */
  id: string;
  /** held down right now */
  down: boolean;
}

/**
 * The pressed face of a printed control, painted on top of its panel.
 *
 * The approved press is not an overlay: it is the artwork re-rendered with that
 * one control sunk into the clay (`scripts/press-panels.py`). The tile is laid
 * out in the panel's own pixel grid, so it stays married to the print at every
 * size. Every tile stays mounted at zero opacity, so the first tap on a control
 * is not waiting on a fetch.
 */
export const PressArt: React.FC<PressArtProps> = ({ panel, id, down }) => {
  const tile = panel.tiles[id];
  if (!tile) return null;
  return (
    <img
      src={tile.src}
      alt=""
      aria-hidden
      draggable={false}
      className={`cg-pressart${down ? ' is-down' : ''}`}
      style={{
        left: `${(tile.x / panel.w) * 100}%`,
        top: `${(tile.y / panel.h) * 100}%`,
        width: `${(tile.w / panel.w) * 100}%`,
        height: `${(tile.h / panel.h) * 100}%`,
      }}
    />
  );
};
