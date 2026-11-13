import React from 'react';
import { Lightbulb } from 'lucide-react';
import { Language } from '../types';
import { keyboard } from './pressTiles';
import { PressArt } from './PressArt';
import { usePressHold } from '../hooks/usePressHold';

/**
 * The keyboard printed on the approved mockup, cropped from the poster into
 * `public/images/game/keyboard-panel.webp` (953×402). The keys are painted in
 * the artwork, so the live buttons are invisible hit areas laid over them.
 * Every rect is the painted ceramic square of one key — measured from that crop
 * by colour segmentation, not guessed from the gaps (row 1: 12 squares, row 2:
 * 11, row 3: the gold bulb + 9). `lastCx` is the centre of the row's rightmost
 * square and `pitch` the step to its neighbour.
 */
const POSTER_KEYS = { w: 953, h: 402 } as const;
const POSTER_ROWS = [
  { cy: 106, lastCx: 866.5, pitch: 71.03, w: 55, h: 57 },
  { cy: 194.5, lastCx: 864.5, pitch: 77.8, w: 61, h: 62 },
  { cy: 287.5, lastCx: 848, pitch: 81.25, w: 63, h: 64 },
];
const POSTER_HINT = { cx: 107.5, cy: 286, w: 80, h: 61 };
const pct = (v: number, total: number) => `${(v / total) * 100}%`;
const hotspot = (x: number, y: number, w: number, h: number): React.CSSProperties => ({
  left: pct(x, POSTER_KEYS.w),
  top: pct(y, POSTER_KEYS.h),
  width: pct(w, POSTER_KEYS.w),
  height: pct(h, POSTER_KEYS.h),
});

interface GameKeyboardProps {
  language: Language;
  onKeyPress: (key: string) => void;
  onBackspace: () => void;
  onHint: () => void;
  isMultiplayer?: boolean; // Disable hint in multiplayer mode
  isArena?: boolean; // Show specific message for arena (no hints allowed during wager matches)
  onShowToast?: (msg: string) => void;
  /** The console's tray is the material, so the deck drops its own background. */
  clay?: boolean;
  /** Mounted straight into the poster frame: fills its slot, no safe-area padding. */
  poster?: boolean;
}

export const GameKeyboard: React.FC<GameKeyboardProps> = ({ language, onKeyPress, onBackspace, onHint, isMultiplayer = false, isArena = false, onShowToast, clay = false, poster = false }) => {
  const isFA = language === 'fa';
  /* the press has to stay lit while the finger is down, `:active` alone ends at
     touch-end and never appears for a pointer that slides off the key */
  const { down: downKey, bind } = usePressHold();

  const handleHintClick = () => {
    if (isMultiplayer) {
      const message = isArena
        ? (isFA ? 'در مسابقه شرطی راهنما فعال نیست' : 'Hints are disabled in wager matches')
        : (isFA ? 'این دکمه در حالت بازی آنلاین غیرفعال است' : 'This button is disabled in online mode');
      onShowToast?.(message);
    } else {
      onHint();
    }
  };
  
  const faLayout = [
    ['ض', 'ص', 'ث', 'ق', 'ف', 'غ', 'ع', 'ه', 'خ', 'ح', 'ج', 'چ'],
    ['ش', 'س', 'ی', 'ب', 'ل', 'ا', 'ت', 'ن', 'م', 'ک', 'گ'],
    ['ظ', 'ط', 'ز', 'ژ', 'ر', 'ذ', 'د', 'پ', 'و']
  ];

  const enLayout = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
  ];

  // The mockup's deck is not one-colour: cream tiles with sage and slate glazes
  // scattered through them. Hand-placed per row so no vertical stripe appears.
  const faTones = [
    'c s c c b c c c s c b c'.split(' '),
    'c c s c b c c s c b c'.split(' '),
    's c c b c c s c b'.split(' ')
  ];
  const enTones = [
    'c s c c b c c s c b'.split(' '),
    'c c s c b c s c b'.split(' '),
    'c s c c s c b'.split(' ')
  ];

  const layout = isFA ? faLayout : enLayout;
  const tones = isFA ? faTones : enTones;
  const toneClass = (t: string) => t === 's' ? 'tone-sage' : t === 'b' ? 'tone-blue' : 'tone-cream';

  // The mockup's own keyboard, pixel for pixel. The baked tiles are Persian, so
  // only Persian clay uses it; English keeps the drawn keys.
  if (clay && isFA) {
    return (
      <div
        className={poster ? 'select-none touch-none' : 'w-full select-none touch-none'}
        style={{ paddingBottom: poster ? 0 : 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div
          className="cg-postkbd relative mx-auto"
          style={{
            width: poster ? '100%' : '93.07%',
            maxWidth: poster ? 'none' : 620,
            aspectRatio: '953 / 402',
          }}
        >
          <img
            src="/images/game/keyboard-panel.webp"
            alt=""
            aria-hidden
            draggable={false}
            className="cg-postkbd-art absolute inset-0 h-full w-full pointer-events-none"
          />
          {faLayout.map((row, i) => {
            const r = POSTER_ROWS[i];
            return row.map((key, j) => {
              // the layout arrays read left to right, exactly as the mockup does
              const col = row.length - 1 - j;
              const cx = r.lastCx - col * r.pitch;
              return (
                <React.Fragment key={key}>
                  <PressArt panel={keyboard} id={`kb-r${i + 1}c${col}`} down={downKey === key} />
                  <button
                    type="button"
                    onClick={() => onKeyPress(key)}
                    {...bind(key)}
                    aria-label={key}
                    className="cg-postkbd-key absolute"
                    style={hotspot(cx - r.w / 2, r.cy - r.h / 2, r.w, r.h)}
                  />
                </React.Fragment>
              );
            });
          })}
          <PressArt panel={keyboard} id="kb-lamp" down={!isMultiplayer && downKey === '__hint'} />
          <button
            type="button"
            onClick={handleHintClick}
            disabled={isMultiplayer}
            {...bind('__hint')}
            aria-label={isFA ? 'راهنما' : 'Hint'}
            className={`cg-postkbd-key absolute${isMultiplayer ? ' is-off' : ''}`}
            style={hotspot(
              POSTER_HINT.cx - POSTER_HINT.w / 2,
              POSTER_HINT.cy - POSTER_HINT.h / 2,
              POSTER_HINT.w,
              POSTER_HINT.h,
            )}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`cg-keydeck ${clay ? 'is-inset' : ''} w-full max-w-2xl mx-auto p-1 sm:p-2 select-none touch-none overflow-visible`}
      style={{ paddingBottom: clay ? 'env(safe-area-inset-bottom, 0px)' : 'calc(0.25rem + env(safe-area-inset-bottom, 0px))' }}
    >
      <div className={`flex flex-col overflow-visible ${clay ? 'cg-keywell mx-auto w-full gap-[14px] sm:gap-3' : 'gap-3'}`}>
        {layout.map((row, i) => (
          <div key={i} className={`flex justify-center ${clay ? 'gap-[3px] sm:gap-2' : 'gap-[5px] sm:gap-2.5'} overflow-visible px-0.5`}>
            {/* Hint Button */}
            {i === 2 && (
              <button
                onClick={handleHintClick}
                disabled={isMultiplayer}
                {...bind('__hint')}
                className={`cg-key tone-gold${!isMultiplayer && downKey === '__hint' ? ' is-down' : ''} flex-[1.12] ${clay ? 'h-[24px] sm:h-12' : 'h-12 sm:h-16'} flex items-center justify-center transition-all font-bold text-[10px] ${
                  isMultiplayer ? 'cursor-not-allowed opacity-45 saturate-0' : ''
                }`}
              >
                <Lightbulb size={14} fill="currentColor" />
              </button>
            )}

            {row.map((key, k) => (
              <button
                key={key}
                onClick={() => onKeyPress(key)}
                {...bind(key)}
                className={`group relative flex-1 min-w-0 ${clay ? 'h-[24px] sm:h-12' : 'h-12 sm:h-16'} cg-key ${toneClass(tones[i][k] || 'c')}${downKey === key ? ' is-down' : ''} flex items-center justify-center transition-all font-black text-[14px] sm:text-lg overflow-visible`}
              >
                {/* iPhone-style Key Pop-up Preview - Added z-50 to show over everything */}
                <div className={`pointer-events-none absolute -top-14 left-1/2 -translate-x-1/2 w-12 h-14 bg-[#F3E4CC] rounded-xl shadow-2xl border border-[rgba(120,80,52,.30)] flex items-center justify-center ${downKey === key ? 'opacity-100' : 'opacity-0 group-active:opacity-100'} transition-opacity scale-110 z-[100]`}>
                    <span className="text-2xl text-[#3A2A1E] font-black">{key}</span>
                    {/* Pop-up Stem/Pointer */}
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#F3E4CC] border-r border-b border-[rgba(120,80,52,.30)] rotate-45"></div>
                </div>
                
                {key}
              </button>
            ))}

            {/* Removed Backspace Button as per user request */}
          </div>
        ))}
      </div>
    </div>
  );
};