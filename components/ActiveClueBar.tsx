
import React from 'react';
import { Clue, Language } from '../types';
import { ArrowRight, ArrowDown, HelpCircle, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { usePressHold } from '../hooks/usePressHold';
import { clue, clueOnline } from './pressTiles';
import { PressArt } from './PressArt';

interface ActiveClueBarProps {
  activeClue: Clue | null;
  language: Language;
  onPrev?: () => void;
  onNext?: () => void;
  canToggle?: boolean;
  onToggle?: () => void;
  isBlinded?: boolean;
  /** Inside the clay console the strip is a cream plate pressed into the tray. */
  clay?: boolean;
  /** Battle play widens the tray with the sage reaction knob, so the mockup's online plate is used. */
  online?: boolean;
  /** The online-only emoji knob, hung on the clay before the slip (mockup). */
  knob?: React.ReactNode;
  /** Pinned straight onto the poster artwork: no lift, no negative margins. */
  poster?: boolean;
}

/* The approved mockup's clue tray is its own artwork (`public/images/game/
   clue-panel*.webp`, 805x168). Clay, parchment, chevron discs, the tan number
   chip, the blue direction square and the online knob are all printed; the
   numbers and the clue itself were lifted out, so the live layer only writes
   back into those hollows. All boxes below are pixels of that crop. */
const SLIP = { w: 805, h: 168 } as const;
const slipPct = (v: number, total: number) => `${(v / total) * 100}%`;
const slipRect = (x: number, y: number, w: number, h: number): React.CSSProperties => ({
  left: slipPct(x, SLIP.w),
  top: slipPct(y, SLIP.h),
  width: slipPct(w, SLIP.w),
  height: slipPct(h, SLIP.h),
});

/* solo: the slip runs the whole tray; online: it stops short of the knob */
const SOLO_SLIP = {
  prev: slipRect(690, 56, 54, 56),
  next: slipRect(62, 56, 52, 56),
  text: slipRect(116, 46, 394, 88),
  chip: slipRect(522, 66, 40, 42),
  dir: slipRect(572, 66, 42, 42),
};
const ONLINE_SLIP = {
  prev: slipRect(562, 56, 54, 56),
  next: slipRect(62, 56, 52, 56),
  text: slipRect(116, 46, 332, 88),
  chip: slipRect(455, 66, 40, 42),
  dir: slipRect(509, 66, 42, 42),
  knob: slipRect(668, 32, 96, 100),
};

export const ActiveClueBar: React.FC<ActiveClueBarProps> = ({ 
  activeClue, 
  language, 
  onPrev, 
  onNext,
  canToggle,
  onToggle,
  isBlinded,
  clay,
  online = false,
  knob,
  poster = false
}) => {
  const isRTL = language === 'fa';
  const { down, bind } = usePressHold();
  const faNum = (value: string | number) =>
    String(value).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[+d]);

  // Dynamic font size logic
  const getFontSize = (text: string) => {
      if (text.length > 60) return 'text-[11px] leading-[1.25]';
      if (text.length > 40) return 'text-[12px] leading-[1.25]';
      return 'text-[14px] leading-[1.25]';
  };

  /* the same fit, measured against the plate so it grows with it */
  const paperFontSize = (text: string) =>
    text.length > 60 ? '2.9cqw' : text.length > 40 ? '3.15cqw' : '3.4cqw';

  /* === the printed tray ===
     Right to left the clay reads: the reaction knob (online), the previous
     chevron, the clue, the number chip, the direction square, the next chevron.
     The chevron glyphs are printed, so the hit areas are invisible. */
  if (clay) {
    const g = online ? ONLINE_SLIP : SOLO_SLIP;
    const press = online ? clueOnline : clue;
    return (
      <div dir={isRTL ? 'rtl' : 'ltr'} className={`cg-postclue w-full relative${poster ? ' is-poster' : ''}`}>
        <img
          className="cg-postclue-art"
          src={online ? '/images/game/clue-panel-online.webp' : '/images/game/clue-panel.webp'}
          alt=""
          aria-hidden
          draggable={false}
        />

        <PressArt panel={press} id="clue-prev" down={down === 'prev'} />
        <button
          type="button"
          onClick={onPrev}
          className="cg-postclue-hit"
          style={g.prev}
          aria-label={isRTL ? 'سرنخ قبلی' : 'Previous clue'}
          {...bind('prev')}
        />
        <PressArt panel={press} id="clue-next" down={down === 'next'} />
        <button
          type="button"
          onClick={onNext}
          className="cg-postclue-hit"
          style={g.next}
          aria-label={isRTL ? 'سرنخ بعدی' : 'Next clue'}
          {...bind('next')}
        />

        {!activeClue ? (
          <div className="cg-postclue-val cg-postclue-empty" style={g.text}>
            <HelpCircle size="1.1em" />
            <span>{isRTL ? 'انتخاب سوال' : 'Pick a cell'}</span>
          </div>
        ) : (
          <>
            <PressArt panel={press} id="clue-dir" down={!!canToggle && down === 'dir'} />
            <button
              type="button"
              onClick={onToggle}
              disabled={!canToggle}
              className={`cg-postclue-hit cg-postclue-dir${canToggle && down === 'dir' ? ' is-down' : ''}`}
              style={g.dir}
              aria-label={isRTL ? 'تغییر جهت' : 'Flip direction'}
              {...bind('dir')}
            >
              <span className="cg-postclue-diricon">
                {activeClue.direction === 'across'
                  ? <ArrowRight size="1em" strokeWidth={3} className={isRTL ? 'rotate-180' : ''} />
                  : <ArrowDown size="1em" strokeWidth={3} />}
              </span>
            </button>

            <div className="cg-postclue-val cg-postclue-num" style={g.chip} aria-hidden>
              {isRTL ? faNum(activeClue.number) : activeClue.number}
            </div>

            <div
              className={`cg-postclue-val cg-postclue-text${isBlinded ? ' is-blind' : ''}`}
              style={{ ...g.text, fontSize: paperFontSize(activeClue.translation) }}
            >
              {activeClue.translation}
            </div>

            {isBlinded && (
              <div className="cg-postclue-blind" style={g.text}>
                <span>BLINDED</span>
              </div>
            )}
          </>
        )}

        {online && knob && <div className="cg-postclue-knob" style={ONLINE_SLIP.knob}>{knob}</div>}
      </div>
    );
  }

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="cg-cluebar w-full border-t border-[rgba(120,80,52,.22)] relative overflow-visible"
    >
      <div className="flex-1 min-w-0 flex items-center gap-1 sm:gap-1.5 max-w-2xl mx-auto px-1 sm:px-2 py-1 sm:py-1.5 h-12 sm:h-16">
        {/* Navigation Button Left */}
        <button
          onClick={onPrev}
          className="active:scale-90 transition-all shrink-0 flex items-center justify-center cg-clue-nav p-1.5 sm:p-2 rounded-xl bg-transparent border h-9 sm:h-12 w-8 sm:w-10"
        >
          {isRTL ? <ChevronRight size={16} strokeWidth={3} /> : <ChevronLeft size={16} strokeWidth={3} />}
        </button>

        <div className="flex-1 min-w-0 px-1.5 sm:px-2.5 py-0.5 sm:py-1 h-full flex items-center gap-1 sm:gap-3 relative overflow-hidden">
          {isBlinded && (
             <div className="absolute inset-0 backdrop-blur-sm z-20 flex items-center justify-center" style={{ backgroundColor: 'rgba(46,28,18,.88)' }}>
                 <span className="text-white font-black text-[8px] sm:text-[10px] animate-pulse">BLINDED</span>
             </div>
          )}

          {!activeClue ? (
            <div className="flex-1 flex items-center justify-center gap-2 text-[#B49A80] font-bold">
              <HelpCircle size={14} />
              <span className="text-[9px] sm:text-[11px] uppercase tracking-wider">{language === 'fa' ? 'انتخاب سوال' : 'Pick a cell'}</span>
            </div>
          ) : (
            <>
              {/* Direction Icon */}
              <div className="flex items-center justify-center shrink-0">
                <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center" style={{ color: '#FFF6EC', backgroundColor: activeClue.direction === 'across' ? '#4E6B72' : '#8E4E37', boxShadow: 'inset 0 1px 0 rgba(255,232,214,.35), inset 0 -2px 0 rgba(30,20,14,.28), 0 4px 10px -8px rgba(70,40,25,.9)' }}>
                   {activeClue.direction === 'across' ? (
                     <ArrowRight size={14} strokeWidth={3} className={isRTL ? 'rotate-180' : ''} />
                   ) : (
                     <ArrowDown size={14} strokeWidth={3} />
                   )}
                </div>
              </div>

              {/* Clue Text */}
              <div className="flex-1 min-w-0 flex items-center py-0.5">
                 <div className={`cg-clue-text ${getFontSize(activeClue.translation)} font-black line-clamp-2 sm:line-clamp-3 ${isBlinded ? 'blur-sm select-none' : ''}`} style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
                   <span className="cg-clue-num mr-1 ml-1 text-[8px] sm:text-[10px] px-1 rounded inline-block align-middle">#{activeClue.number}</span>
                   {activeClue.translation}
                 </div>
              </div>

              {/* Flip Button */}
              {canToggle && (
                 <button
                   onClick={(e) => { e.stopPropagation(); onToggle?.(); }}
                   className="cg-clue-flip flex flex-col items-center justify-center gap-0.5 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg text-[7px] sm:text-[8px] font-bold active:scale-90 transition-all border bg-transparent shrink-0"
                 >
                   <RotateCcw size={11} />
                   {language === 'fa' ? 'چرخش' : 'Flip'}
                 </button>
              )}
            </>
          )}
        </div>

        {/* Navigation Button Right */}
        <button
          onClick={onNext}
          className="active:scale-90 transition-all shrink-0 flex items-center justify-center cg-clue-nav p-1.5 sm:p-2 rounded-xl bg-transparent border h-9 sm:h-12 w-8 sm:w-10"
        >
          {isRTL ? <ChevronLeft size={16} strokeWidth={3} /> : <ChevronRight size={16} strokeWidth={3} />}
        </button>
      </div>
    </div>
  );
};
