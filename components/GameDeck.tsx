import React from 'react';
import { ArrowRight, ArrowDown, HelpCircle } from 'lucide-react';
import { Clue, Language } from '../types';
import { usePressHold } from '../hooks/usePressHold';
import { PressArt } from './PressArt';
import { clue, keyboard, PressPanel, PressTile } from './pressTiles';

/**
 * The clue tray and the key deck as one printed piece
 * (`public/images/game/deck.webp`, 504×260, which is the 0.5× crop of
 * `(0, 756, 1008, 1276)` in the 1024×1280 master poster).
 *
 * `keyboard-panel.webp` was cropped at `(38, 876)` and `clue-panel.webp` at
 * `(110, 750)` in that same 1024×1280 space, so every pre-rendered recessed
 * tile in `pressTiles.ts` maps onto `deck.webp` (`1008×520` poster units) by
 * an exact integer translation: `(+38, +120)` for keyboard tiles and
 * `(+110, -6)` for clue tiles.
 */
const DECK = { w: 504, h: 260 } as const;

const deckPress: PressPanel = (() => {
  const tiles: Record<string, PressTile> = {};
  for (const [id, t] of Object.entries(keyboard.tiles)) {
    tiles[id] = { src: t.src, x: t.x + 38, y: t.y + 120, w: t.w, h: t.h };
  }
  for (const [id, t] of Object.entries(clue.tiles)) {
    tiles[id] = { src: t.src, x: t.x + 110, y: t.y - 6, w: t.w, h: t.h };
  }
  return { w: 1008, h: 520, tiles };
})();

const d = (x: number, y: number, w: number, h: number): React.CSSProperties => ({
  left: `${(x / DECK.w) * 100}%`,
  top: `${(y / DECK.h) * 100}%`,
  width: `${(w / DECK.w) * 100}%`,
  height: `${(h / DECK.h) * 100}%`,
});

/* right chevron is the previous clue, left chevron the next one — read in RTL */
const PREV = d(400, 25, 26, 26);
const NEXT = d(86, 25, 26, 26);
const TEXT = d(113, 21, 197, 41);
const CHIP = d(313, 29, 26, 23);
const DIR = d(340, 28, 24, 24);

/* row geometry read off the painted tiles: `cx0` is the leftmost centre, then a
   constant pitch. The letters are printed left to right in faLayout order. */
const ROWS = [
  { cy: 112, cx0: 60, pitch: 35.64, w: 30, h: 31 },
  { cy: 156.5, cx0: 61.5, pitch: 38.9, w: 34, h: 33 },
  { cy: 203.5, cx0: 117.5, pitch: 40.7, w: 38, h: 37 },
];
const HINT = { cx: 72.5, cy: 204, w: 42, h: 37 };

const FA_LAYOUT = [
  ['ض', 'ص', 'ث', 'ق', 'ف', 'غ', 'ع', 'ه', 'خ', 'ح', 'ج', 'چ'],
  ['ش', 'س', 'ی', 'ب', 'ل', 'ا', 'ت', 'ن', 'م', 'ک', 'گ'],
  ['ظ', 'ط', 'ز', 'ژ', 'ر', 'ذ', 'د', 'پ', 'و'],
];

const faNum = (value: string | number) =>
  String(value).replace(/\d/g, (digit) => '۰۱۲۳۴۵۶۷۸۹'[+digit]);

interface GameDeckProps {
  language: Language;
  activeClue: Clue | null;
  isBlinded?: boolean;
  canToggle?: boolean;
  onPrev?: () => void;
  onNext?: () => void;
  onToggle?: () => void;
  onKeyPress: (key: string) => void;
  onHint: () => void;
  isMultiplayer?: boolean;
  isArena?: boolean;
  onShowToast?: (message: string) => void;
}

export const GameDeck: React.FC<GameDeckProps> = ({
  language,
  activeClue,
  isBlinded = false,
  canToggle = false,
  onPrev,
  onNext,
  onToggle,
  onKeyPress,
  onHint,
  isMultiplayer = false,
  isArena = false,
  onShowToast,
}) => {
  const isFA = language === 'fa';
  const { down, bind } = usePressHold();

  /* the clue has to fit the printed slip, so the size follows the length and
     the box grows with the deck, not with the viewport */
  const clueFontSize = (text: string) =>
    text.length > 60 ? '2.1cqw' : text.length > 42 ? '2.3cqw' : '2.55cqw';

  const handleHint = () => {
    if (isMultiplayer) {
      onShowToast?.(
        isArena
          ? (isFA ? 'در مسابقه شرطی راهنما فعال نیست' : 'Hints are disabled in wager matches')
          : (isFA ? 'این دکمه در حالت بازی آنلاین غیرفعال است' : 'This button is disabled in online mode')
      );
      return;
    }
    onHint();
  };

  return (
    <div dir={isFA ? 'rtl' : 'ltr'} className="cg-deck relative h-full w-full select-none touch-none">
      <img
        src="/images/game/deck.webp"
        alt=""
        aria-hidden
        draggable={false}
        className="cg-deck-art absolute inset-0 h-full w-full pointer-events-none"
      />

      {/* --- the parchment slip --- */}
      <PressArt panel={deckPress} id="clue-prev" down={down === 'prev'} />
      <button
        type="button"
        onClick={onPrev}
        className={`cg-deck-hit is-round${down === 'prev' ? ' is-down' : ''}`}
        style={PREV}
        aria-label={isFA ? 'سرنخ قبلی' : 'Previous clue'}
        {...bind('prev')}
      />

      <PressArt panel={deckPress} id="clue-next" down={down === 'next'} />
      <button
        type="button"
        onClick={onNext}
        className={`cg-deck-hit is-round${down === 'next' ? ' is-down' : ''}`}
        style={NEXT}
        aria-label={isFA ? 'سرنخ بعدی' : 'Next clue'}
        {...bind('next')}
      />

      {!activeClue ? (
        <div className="cg-postclue-val cg-postclue-empty" style={TEXT}>
          <HelpCircle size="1.1em" />
          <span>{isFA ? 'انتخاب سوال' : 'Pick a cell'}</span>
        </div>
      ) : (
        <>
          <PressArt panel={deckPress} id="clue-dir" down={canToggle && down === 'dir'} />
          <button
            type="button"
            onClick={onToggle}
            disabled={!canToggle}
            className={`cg-deck-hit cg-deck-dir is-square${canToggle && down === 'dir' ? ' is-down' : ''}`}
            style={DIR}
            aria-label={isFA ? 'تغییر جهت' : 'Flip direction'}
            {...bind('dir')}
          >
            <span className="cg-deck-diricon">
              {activeClue.direction === 'across'
                ? <ArrowRight size="1em" strokeWidth={3.4} className={isFA ? 'rotate-180' : ''} />
                : <ArrowDown size="1em" strokeWidth={3.4} />}
            </span>
          </button>

          <div className="cg-postclue-val cg-postclue-num" style={CHIP} aria-hidden>
            {isFA ? faNum(activeClue.number) : activeClue.number}
          </div>

          <div
            className={`cg-postclue-val cg-postclue-text cg-deck-clue${isBlinded ? ' is-blind' : ''}`}
            style={{ ...TEXT, fontSize: clueFontSize(activeClue.translation) }}
          >
            <span>{activeClue.translation}</span>
          </div>

          {isBlinded && (
            <div className="cg-postclue-blind" style={TEXT}>
              <span>{isFA ? 'کور شدی' : 'BLINDED'}</span>
            </div>
          )}
        </>
      )}

      {/* --- the key deck --- */}
      {FA_LAYOUT.map((row, rowIndex) => {
        const r = ROWS[rowIndex];
        return row.map((key, column) => {
          const cx = r.cx0 + column * r.pitch;
          const col = row.length - 1 - column;
          const tileId = `kb-r${rowIndex + 1}c${col}`;
          return (
            <React.Fragment key={key}>
              <PressArt panel={deckPress} id={tileId} down={down === key} />
              <button
                type="button"
                onClick={() => onKeyPress(key)}
                aria-label={key}
                className={`cg-deck-hit cg-deck-key${down === key ? ' is-down' : ''}`}
                style={d(cx - r.w / 2, r.cy - r.h / 2, r.w, r.h)}
                {...bind(key)}
              />
            </React.Fragment>
          );
        });
      })}

      <PressArt panel={deckPress} id="kb-lamp" down={!isMultiplayer && down === 'hint'} />
      <button
        type="button"
        onClick={handleHint}
        disabled={isMultiplayer}
        aria-label={isFA ? 'راهنما' : 'Hint'}
        className={`cg-deck-hit cg-deck-key${isMultiplayer ? ' is-off' : ''}${down === 'hint' ? ' is-down' : ''}`}
        style={d(HINT.cx - HINT.w / 2, HINT.cy - HINT.h / 2, HINT.w, HINT.h)}
        {...bind('hint')}
      />
    </div>
  );
};
