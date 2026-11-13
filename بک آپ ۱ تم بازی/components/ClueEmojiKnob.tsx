import React, { useEffect, useRef, useState } from 'react';
import { multiplayer } from '../utils/multiplayer';
import { usePressHold } from '../hooks/usePressHold';

const REACTIONS = ['🔥', '😂', '💀', '👏', '😤', '🤝'];

interface ClueEmojiKnobProps {
  playerId: string;
  spawnFloatingEmoji: (emoji: string) => void;
  /** online only — the mockup removes the knob entirely from the solo strip */
  disabled?: boolean;
}

/**
 * The sage knob at the end of the clue tray. The mockup prints the knob and its
 * three pressed dots, so this only lays a transparent hit area over that print
 * and floats the reaction tray above it.
 */
export const ClueEmojiKnob: React.FC<ClueEmojiKnobProps> = ({ playerId, spawnFloatingEmoji, disabled }) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const { down, bind } = usePressHold();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (disabled) return null;

  const send = (emoji: string) => {
    spawnFloatingEmoji(emoji);
    multiplayer.sendEmoji(playerId, emoji);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative w-full h-full">
      {open && (
        <div className="cg-emoji-pop" dir="rtl">
          {REACTIONS.map((em) => (
            <button key={em} onClick={() => send(em)} className="cg-emoji-pick" aria-label={em}>
              {em}
            </button>
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`cg-postclue-knob-hit${open ? ' is-open' : ''}${down === 'knob' ? ' is-down' : ''}`}
        aria-label="واکنش‌ها"
        aria-expanded={open}
        {...bind('knob')}
      >
        <i className="cg-pressface is-round" aria-hidden />
      </button>
    </div>
  );
};
