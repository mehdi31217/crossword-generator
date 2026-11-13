import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { ArrowLeft, Star, Check, X, RefreshCw } from 'lucide-react';
import { CardDef, Language, Grid } from '../types';
import { generateFreeformGrid } from '../utils/freeformGenerator';

interface CardPuzzleScreenProps {
  card: CardDef;
  language: Language;
  onComplete: (stars: number) => void;
  onBack: () => void;
}

type CellState = {
  filled: string;
  revealed: boolean;
};

export const CardPuzzleScreen: React.FC<CardPuzzleScreenProps> = ({
  card,
  language,
  onComplete,
  onBack,
}) => {
  const isFA = language === 'fa';
  const puzzleData = useMemo(() => {
    const entries = card.words.map(w => ({ word: w.word, clue: w.clue, category: '' }));
    return generateFreeformGrid(entries);
  }, [card.id]);

  const gridData = puzzleData?.grid || null;
  const cluesData = puzzleData?.clues || null;

  // Flatten all clue words for tracking
  const allClues = useMemo(() => {
    if (!cluesData) return [];
    return [...cluesData.across, ...cluesData.down];
  }, [cluesData]);

  // Auto-reveal all cells initially (no hide-and-seek)
  const [userGrid, setUserGrid] = useState<CellState[][] | null>(null);
  const [completed, setCompleted] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [selectedClue, setSelectedClue] = useState<number | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [totalCells, setTotalCells] = useState(0);
  const [filledCells, setFilledCells] = useState(0);
  const completedRef = useRef(false);

  // Init user grid
  useEffect(() => {
    if (!gridData) return;
    const init: CellState[][] = gridData.map(row =>
      row.map(cell => ({
        filled: cell.isBlack ? '■' : '',
        revealed: false,
      }))
    );
    setUserGrid(init);

    let count = 0;
    for (const row of gridData) {
      for (const cell of row) {
        if (!cell.isBlack) count++;
      }
    }
    setTotalCells(count);
  }, [gridData]);

  // Fill word in user grid
  const fillWord = useCallback((wordIdx: number) => {
    if (!gridData || !userGrid || !cluesData) return;
    const clue = allClues[wordIdx];
    if (!clue) return;

    setUserGrid(prev => {
      if (!prev) return prev;
      const next = prev.map(r => r.map(c => ({ ...c })));

      // Check if user already filled this correctly
      let anyIncorrect = false;
      let allFilled = true;
      for (const cell of clue.cells) {
        const target = gridData[cell.r][cell.c].value;
        const current = next[cell.r][cell.c].filled;
        if (current === '') {
          allFilled = false;
        } else if (current !== target) {
          anyIncorrect = true;
        }
      }

      // If all correct and filled, fill the word
      if (!anyIncorrect && allFilled) {
        return prev; // already done
      }

      // Auto-fill the word character by character with delay
      let delay = 0;
      for (const cell of clue.cells) {
        const target = gridData[cell.r][cell.c].value;
        const current = next[cell.r][cell.c].filled;
        if (current !== target) {
          setTimeout(() => {
            setUserGrid(p => {
              if (!p) return p;
              const updated = p.map(r => r.map(c => ({ ...c })));
              updated[cell.r][cell.c].filled = target;
              updated[cell.r][cell.c].revealed = false;
              return updated;
            });
          }, delay);
          delay += 80;
        }
      }

      return next;
    });
  }, [gridData, userGrid, cluesData, allClues]);

  // Check completion
  useEffect(() => {
    if (!userGrid || !gridData || completedRef.current) return;

    let filled = 0;
    let mistakes = 0;
    let total = 0;
    for (let r = 0; r < gridData.length; r++) {
      for (let c = 0; c < gridData[r].length; c++) {
        if (gridData[r][c].isBlack) continue;
        total++;
        if (userGrid[r]?.[c]?.filled === gridData[r][c].value) {
          filled++;
        } else if (userGrid[r]?.[c]?.filled && userGrid[r][c].filled !== gridData[r][c].value) {
          mistakes++;
        }
      }
    }
    setFilledCells(filled);
    if (filled === total && total > 0) {
      setIsCompleted(true);
      completedRef.current = true;
      const starCount = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1;
      setTimeout(() => onComplete(starCount), 600);
    }
  }, [userGrid, gridData, onComplete]);

  // Reveal grid gradually on mount
  const [revealStep, setRevealStep] = useState(0);
  useEffect(() => {
    if (!cluesData) return;
    const interval = setInterval(() => {
      setRevealStep(prev => {
        if (prev >= allClues.length) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 400);
    return () => clearInterval(interval);
  }, [cluesData, allClues.length]);

  // Build clue number mapping
  const clueNumMap = useMemo(() => {
    const map = new Map<string, number>();
    if (!cluesData) return map;
    for (const clue of [...cluesData.across, ...cluesData.down]) {
      for (const cell of clue.cells) {
        map.set(`${cell.r},${cell.c}`, clue.number);
      }
    }
    return map;
  }, [cluesData]);

  if (!gridData || !userGrid) {
    return (
      <div className="w-full h-full cg-dark bg-[#121212] text-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isCompleted) {
    const stars = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1;
    return (
      <div className="w-full h-full bg-[#121212] text-white flex flex-col items-center justify-center p-6">
        <div className="text-6xl mb-4">{card.icon}</div>
        <h2 className="text-xl font-black mb-2">{card.title}</h2>
        <div className="flex gap-2 mb-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Star
              key={i}
              size={32}
              className={i < stars ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}
            />
          ))}
        </div>
        <p className="text-slate-400 text-sm font-bold mb-2">
          {isFA
            ? `${mistakes === 0 ? 'عالی! بدون اشتباه!' : `با ${mistakes} اشتباه`}`
            : `${mistakes === 0 ? 'Perfect! No mistakes!' : `${mistakes} mistakes`}`}
        </p>
        {stars < 3 && (
          <p className="text-slate-500 text-xs mb-4">
            {isFA ? 'دوباره تلاش کن تا طلا بگیری!' : 'Try again for gold!'}
          </p>
        )}
        <button
          onClick={() => onComplete(stars)}
          className="bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black px-6 py-3 rounded-xl text-sm active:scale-95 transition-all"
        >
          {isFA ? 'ادامه' : 'Continue'}
        </button>
      </div>
    );
  }

  return (
    <div className="w-full h-full cg-dark bg-[#121212] text-white flex flex-col overflow-hidden">
      {/* Header */}
      <header className="px-4 py-3 flex items-center justify-between shrink-0 border-b border-white/5">
        <button onClick={onBack} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all">
          <ArrowLeft size={18} />
        </button>
        <div className="flex items-center gap-3">
          <span className="text-sm font-black">{card.title}</span>
          <span className="text-2xl">{card.icon}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <div className="w-20 h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all"
              style={{ width: `${totalCells > 0 ? (filledCells / totalCells) * 100 : 0}%` }}
            />
          </div>
          <span className="font-bold">{filledCells}/{totalCells}</span>
        </div>
      </header>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto flex items-start justify-center p-4">
        <div className="inline-block" style={{ direction: 'ltr' }}>
          <table className="border-collapse">
            <tbody>
              {gridData.map((row, r) => (
                <tr key={r}>
                  {row.map((cell, c) => {
                    if (cell.isBlack) {
                      return <td key={c} className="w-7 h-7 sm:w-9 sm:h-9 bg-slate-900/50" />;
                    }
                    const isRevealedReveal = revealStep >= allClues.length;
                    const clueNum = clueNumMap.get(`${r},${c}`);
                    const filled = userGrid[r]?.[c]?.filled || '';
                    const isEmpty = filled === '';

                    return (
                      <td
                        key={c}
                        className={`
                          w-7 h-7 sm:w-9 sm:h-9 border border-white/10 text-center relative
                          ${isEmpty ? 'bg-slate-800/60' : 'bg-slate-700/40'}
                          transition-colors duration-300
                        `}
                      >
                        {filled ? (
                          <span className="text-xs sm:text-sm font-bold text-white">{filled}</span>
                        ) : null}
                        {clueNum !== undefined && !filled && (
                          <span className="absolute top-0 left-0.5 text-[6px] sm:text-[8px] text-slate-500 font-bold">
                            {clueNum}
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Word list with auto-fill buttons */}
      <div className="shrink-0 bg-slate-900/80 backdrop-blur border-t border-white/5 px-4 py-3 max-h-48 overflow-y-auto">
        <p className="text-[10px] font-bold text-slate-500 mb-2">
          {isFA ? 'کلمات را انتخاب کن:' : 'Tap a word to fill:'}
        </p>
        <div className="flex flex-wrap gap-2">
          {allClues.map((clue, idx) => {
            const isFilled = clue.cells.every(
              c => userGrid[c.r]?.[c.c]?.filled === gridData[c.r][c.c].value
            );
            return (
              <button
                key={idx}
                onClick={() => fillWord(idx)}
                disabled={isFilled}
                className={`
                  px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95
                  ${isFilled
                    ? 'bg-emerald-900/30 text-emerald-400/50 border border-emerald-800/30'
                    : 'bg-white/10 text-white hover:bg-white/15 border border-white/10'
                  }
                `}
              >
                <span className="text-[9px] text-slate-400 mr-1">
                  {clue.direction === 'across' ? '→' : '↓'}
                </span>
                {clue.translation}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
