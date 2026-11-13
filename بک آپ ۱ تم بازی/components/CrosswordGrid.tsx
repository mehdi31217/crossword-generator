import React, { useRef, useState, useMemo, useEffect, useLayoutEffect, useCallback } from 'react';
import { Grid, WordDirection, Language, Clue } from '../types';

interface CrosswordGridProps {
  grid: Grid | null;
  loading: boolean;
  userGrid: string[][];
  onCellChange: (r: number, c: number, val: string) => void;
  selectedCell: { r: number; c: number } | null;
  direction: WordDirection;
  onSelect: (r: number, c: number, newDirection?: WordDirection) => void;
  activeClue: Clue | null;
  language: Language;
  opponentFilled?: Set<string>;
  clues?: { across: Clue[], down: Clue[] };
  powerRevealedCells?: Set<string>;
  wrongAnswerCount?: number;
  entranceKey?: number; // increment to replay cell-wave entrance + focus
  bare?: boolean; // the clay console artwork already draws the frame — only ink the rules
  /** Margin kept inside the container when fitting. 0 when the slot is the printed board box. */
  fitPadding?: number;
}

export const CrosswordGrid: React.FC<CrosswordGridProps> = ({
  grid,
  loading,
  userGrid,
  selectedCell,
  direction,
  onSelect,
  activeClue,
  language,
  opponentFilled,
  clues,
  powerRevealedCells,
  wrongAnswerCount = 0,
  entranceKey,
  bare = false,
  fitPadding = 10
}) => {
  // Cell entrance wave: cells pop in from center outward with stagger + focus
  const [entranceActive, setEntranceActive] = useState(false);
  const entranceTimerRef = useRef<number | null>(null);
  const runEntrance = useCallback((g: Grid) => {
    if (entranceTimerRef.current !== null) clearTimeout(entranceTimerRef.current);
    setEntranceActive(true);
    const totalCells = g.reduce((s, r) => s + r.filter(c => !c.isBlack).length, 0);
    const waveDuration = Math.min(totalCells * 40, 1000);
    entranceTimerRef.current = window.setTimeout(() => {
      setEntranceActive(false);
      entranceTimerRef.current = null;
    }, waveDuration + 800);
  }, []);
  // Auto-run entrance when a loaded grid appears (for modes without entranceKey changes)
  useLayoutEffect(() => {
    if (grid && !loading) {
      runEntrance(grid);
    }
  }, [grid, loading, runEntrance]);
  // entranceKey prop changed → replay entrance (story mode after modal dismiss)
  const prevKeyRef = useRef(entranceKey);
  useLayoutEffect(() => {
    if (!grid || loading || entranceKey === undefined) return;
    if (prevKeyRef.current !== undefined && entranceKey !== prevKeyRef.current) {
      runEntrance(grid);
    }
    prevKeyRef.current = entranceKey;
  }, [entranceKey, grid, loading, runEntrance]);

  // A word that just became complete gets one band of light run along its
  // whole length. Measured from the laid-out cells, so it is correct in bare
  // console mode, in the framed story board and in RTL alike.
  type SweepBand = { left: number; top: number; w: number; h: number; dir: WordDirection; delay: number };
  const [sweep, setSweep] = useState<{ key: number; bands: SweepBand[] } | null>(null);
  const solvedRef = useRef<Set<string>>(new Set());
  const sweepTimerRef = useRef<number | null>(null);
  useEffect(() => {
    if (!grid || !clues) return;
    const all = [...clues.across, ...clues.down];
    const done = new Set<string>();
    const fresh: Clue[] = [];
    for (const clue of all) {
      if (!clue.cells?.length) continue;
      const id = `${clue.number}:${clue.direction}`;
      const complete = clue.cells.every(({ r, c }) => {
        const v = userGrid[r]?.[c];
        return !!v && v === grid[r]?.[c]?.value;
      });
      if (!complete) continue;
      done.add(id);
      if (!solvedRef.current.has(id) && !entranceActive) fresh.push(clue);
    }
    solvedRef.current = done;
    if (!fresh.length) return;

    const raf = requestAnimationFrame(() => {
      const bands: SweepBand[] = [];
      fresh.forEach((clue, i) => {
        let l = Infinity, t = Infinity, r2 = -Infinity, b2 = -Infinity;
        for (const { r, c } of clue.cells) {
          const el = document.getElementById(`cell-${r}-${c}`);
          if (!el) continue;
          l = Math.min(l, el.offsetLeft);
          t = Math.min(t, el.offsetTop);
          r2 = Math.max(r2, el.offsetLeft + el.offsetWidth);
          b2 = Math.max(b2, el.offsetTop + el.offsetHeight);
        }
        if (!isFinite(l) || r2 <= l) return;
        bands.push({ left: l, top: t, w: r2 - l, h: b2 - t, dir: clue.direction, delay: i * 110 });
      });
      if (!bands.length) return;
      if (sweepTimerRef.current !== null) window.clearTimeout(sweepTimerRef.current);
      setSweep({ key: Date.now(), bands });
      sweepTimerRef.current = window.setTimeout(() => {
        setSweep(null);
        sweepTimerRef.current = null;
      }, 1500);
    });
    return () => cancelAnimationFrame(raf);
  }, [grid, clues, userGrid, entranceActive]);
  useEffect(() => () => {
    if (sweepTimerRef.current !== null) window.clearTimeout(sweepTimerRef.current);
  }, []);

  const isRTL = language === 'fa';
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Transformation State
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const transformRef = useRef({ x: 0, y: 0, scale: 1 });
  
  // Interaction State
  const isDragging = useRef(false);
  const lastMousePosition = useRef({ x: 0, y: 0 });
  const lastTouchDistance = useRef<number | null>(null);
  const lastTouchCenter = useRef<{x: number, y: number} | null>(null); // Track pinch center
  const pointerStartPos = useRef({ x: 0, y: 0 }); 
  
  const CELL_SIZE = 40;

  const isStoryMode = useMemo(() => {
      return clues?.across.some(c => c.isStory) || clues?.down.some(c => c.isStory);
  }, [clues]);

  // Helper to calculate the minimum scale allowed (Fit to Screen)
  const getMinScale = () => {
      if (!grid || !containerRef.current) return 0.5;
      const cw = containerRef.current.clientWidth;
      const ch = containerRef.current.clientHeight;
      const gridW = grid[0].length * CELL_SIZE;
      const gridH = grid.length * CELL_SIZE;
      
      const padding = 0; // ZERO padding for max screen usage
      const scaleX = (cw - padding) / gridW;
      const scaleY = (ch - padding) / gridH;
      
      return Math.min(scaleX, scaleY);
  };

  const updateTransform = useCallback((x: number, y: number, scale: number) => {
      if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(scale) || scale <= 0) return;
      transformRef.current = { x, y, scale };
      setTransform({ x, y, scale });
  }, []);

  // --- AUTO FOCUS & FIT LOGIC ---
  const computeAndApplyFit = useCallback(() => {
    if (!grid || !grid[0] || !containerRef.current) return;

    const container = containerRef.current;
    const cw = container.clientWidth;
    const ch = container.clientHeight;
    if (cw <= 0 || ch <= 0) return;

    const gridW = grid[0].length * CELL_SIZE;
    const gridH = grid.length * CELL_SIZE;
    if (gridW <= 0 || gridH <= 0) return;

    // --- STANDARD MODE (Fixed Fit) ---
    // User cannot zoom/pan. Grid fits perfectly in center.
    if (!isStoryMode) {
        const paddingX = fitPadding;
        const paddingY = fitPadding;
        const scaleX = Math.max(0.1, (cw - paddingX) / gridW);
        const scaleY = Math.max(0.1, (ch - paddingY) / gridH);
        const fitScale = Math.min(scaleX, scaleY);

        const x = (cw - gridW * fitScale) / 2;
        const y = (ch - gridH * fitScale) / 2;

        updateTransform(x, y, fitScale);
        return;
    }

    // --- STORY MODE (Freedom/Zoom Logic) ---
    const minScaleX = Math.max(0.1, cw / gridW);
    const minScaleY = Math.max(0.1, ch / gridH);
    const minScale = Math.min(minScaleX, minScaleY);

    if (activeClue && activeClue.cells.length > 0) {
        const rows = activeClue.cells.map(c => c.r);
        const cols = activeClue.cells.map(c => c.c);

        const minR = Math.min(...rows);
        const maxR = Math.max(...rows);
        const minC = Math.min(...cols);
        const maxC = Math.max(...cols);

        let centerXPx = ((minC + maxC + 1) / 2) * CELL_SIZE;
        if (isRTL) {
            centerXPx = gridW - centerXPx;
        }

        const centerYPx = ((minR + maxR + 1) / 2) * CELL_SIZE;

        const wordW = (maxC - minC + 1) * CELL_SIZE;
        const wordH = (maxR - minR + 1) * CELL_SIZE;

        const hPadding = 80;
        const vPadding = 240;
        const fitScaleX = cw / (wordW + hPadding);
        const fitScaleY = ch / (wordH + vPadding);

        let targetScale = Math.min(fitScaleX, fitScaleY);
        targetScale = Math.min(Math.max(targetScale, minScale), 2.2);

        const targetX = (cw / 2) - (centerXPx * targetScale);
        const targetY = (ch / 2) - (centerYPx * targetScale);

        updateTransform(targetX, targetY, targetScale);
    } else {
        const initialX = (cw - gridW * minScale) / 2;
        const initialY = (ch - gridH * minScale) / 2;
        updateTransform(initialX, initialY, minScale);
    }
  }, [activeClue, grid, isRTL, isStoryMode, fitPadding, updateTransform]);

  useLayoutEffect(() => {
    computeAndApplyFit();
  }, [computeAndApplyFit]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => {
      computeAndApplyFit();
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [computeAndApplyFit]);

  // --- POINTER EVENTS (Drag & Click) ---
  const handlePointerDown = (e: React.PointerEvent) => {
      // Always capture start pos for click detection
      pointerStartPos.current = { x: e.clientX, y: e.clientY };
      
      // Only allow dragging in Story Mode
      if (isStoryMode) {
          containerRef.current?.setPointerCapture(e.pointerId);
          isDragging.current = true;
          lastMousePosition.current = { x: e.clientX, y: e.clientY };
          if (containerRef.current) containerRef.current.style.cursor = 'grabbing';
      }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
      if (!isDragging.current || !isStoryMode) return;
      const dx = e.clientX - lastMousePosition.current.x;
      const dy = e.clientY - lastMousePosition.current.y;
      lastMousePosition.current = { x: e.clientX, y: e.clientY };

      const { x, y, scale } = transformRef.current;
      updateTransform(x + dx, y + dy, scale);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
      isDragging.current = false;
      if (isStoryMode) {
          containerRef.current?.releasePointerCapture(e.pointerId);
          if (containerRef.current) containerRef.current.style.cursor = 'grab';
      }
      
      // Click detection logic works for both modes
      const dist = Math.hypot(e.clientX - pointerStartPos.current.x, e.clientY - pointerStartPos.current.y);
      if (dist < 10) {
          const target = document.elementFromPoint(e.clientX, e.clientY);
          const cellDiv = target?.closest('[data-cell-coords]');
          if (cellDiv) {
              const coords = cellDiv.getAttribute('data-cell-coords');
              if (coords) {
                  const [r, c] = coords.split(',').map(Number);
                  onSelect(r, c, (selectedCell?.r === r && selectedCell?.c === c) ? (direction === 'across' ? 'down' : 'across') : undefined);
              }
          }
      }
  };

  // --- TOUCH ZOOM (Pinch with Focal Point) ---
  const handleTouchStart = (e: React.TouchEvent) => {
      if (!isStoryMode) return; // Disable pinch zoom in standard mode

      if (e.touches.length === 2) {
          const t1 = e.touches[0];
          const t2 = e.touches[1];
          const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
          lastTouchDistance.current = dist;
          // Calculate center of pinch
          lastTouchCenter.current = {
              x: (t1.clientX + t2.clientX) / 2,
              y: (t1.clientY + t2.clientY) / 2
          };
      }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
      if (!isStoryMode) return; // Disable pinch zoom in standard mode

      if (e.touches.length === 2 && lastTouchDistance.current !== null && lastTouchCenter.current && containerRef.current) {
          const t1 = e.touches[0];
          const t2 = e.touches[1];
          const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
          
          const rect = containerRef.current.getBoundingClientRect();
          const currentCenter = {
              x: (t1.clientX + t2.clientX) / 2,
              y: (t1.clientY + t2.clientY) / 2
          };

          // Calculate Scale Factor
          const scaleFactor = dist / lastTouchDistance.current;
          
          const { x, y, scale } = transformRef.current;
          const minScale = getMinScale();
          const maxScale = 2.5;

          let newScale = scale * scaleFactor;
          
          // Constrain Scale
          if (newScale < minScale) newScale = minScale;
          if (newScale > maxScale) newScale = maxScale;

          // Calculate Focal Point Logic (Zoom towards fingers)
          // Relative to container
          const fx = lastTouchCenter.current.x - rect.left;
          const fy = lastTouchCenter.current.y - rect.top;

          // Formula: newPos = focal - (focal - oldPos) * (newScale / oldScale)
          // We also add the pan offset (currentCenter - lastTouchCenter)
          const panX = currentCenter.x - lastTouchCenter.current.x;
          const panY = currentCenter.y - lastTouchCenter.current.y;

          let newX = fx - (fx - x) * (newScale / scale) + panX;
          let newY = fy - (fy - y) * (newScale / scale) + panY;

          // SNAP TO CENTER if hitting minScale
          if (newScale <= minScale + 0.01) {
              const gridW = grid![0].length * CELL_SIZE;
              const gridH = grid!.length * CELL_SIZE;
              newX = (rect.width - gridW * newScale) / 2;
              newY = (rect.height - gridH * newScale) / 2;
          }

          updateTransform(newX, newY, newScale);
          
          lastTouchDistance.current = dist;
          lastTouchCenter.current = currentCenter;
          e.stopPropagation();
      }
  };

  // --- MOUSE WHEEL ZOOM (Focal Point) ---
  const handleWheel = (e: React.WheelEvent) => {
      if (!isStoryMode) return; // Disable wheel zoom in standard mode

      const container = containerRef.current;
      if (!container) return;

      const { x, y, scale } = transformRef.current;
      const minScale = getMinScale();
      const maxScale = 2.5;

      const zoomIntensity = 0.001;
      const zoomFactor = Math.exp(-e.deltaY * zoomIntensity);
      
      let newScale = scale * zoomFactor;
      if (newScale < minScale) newScale = minScale;
      if (newScale > maxScale) newScale = maxScale;

      // Focal point relative to container
      const rect = container.getBoundingClientRect();
      const fx = e.clientX - rect.left;
      const fy = e.clientY - rect.top;

      let newX = fx - (fx - x) * (newScale / scale);
      let newY = fy - (fy - y) * (newScale / scale);

      // SNAP TO CENTER if hitting minScale
      if (newScale <= minScale + 0.001) {
          const gridW = grid![0].length * CELL_SIZE;
          const gridH = grid!.length * CELL_SIZE;
          newX = (rect.width - gridW * newScale) / 2;
          newY = (rect.height - gridH * newScale) / 2;
      }

      updateTransform(newX, newY, newScale);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full animate-pulse">
        <div className="w-10 h-10 border-4 border-[#B4694B] border-t-transparent rounded-full animate-spin mb-4"></div>
      </div>
    );
  }

  if (!grid || !userGrid || userGrid.length !== grid.length) return null;

  const sizeR = grid.length;
  const sizeC = grid[0].length;

  // Shake grid on wrong answer
  const [shaking, setShaking] = useState(false);
  const prevWrongRef = useRef(wrongAnswerCount);
  useEffect(() => {
    if (wrongAnswerCount > prevWrongRef.current) {
      setShaking(true);
      const t = setTimeout(() => setShaking(false), 500);
      return () => clearTimeout(t);
    }
    prevWrongRef.current = wrongAnswerCount;
  }, [wrongAnswerCount]);

  return (
    <div className={`relative w-full h-full overflow-hidden bg-transparent touch-none select-none ${shaking ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
        <style>{`
          @keyframes cell-entrance {
            0% { transform: scale(0) rotateZ(-15deg); opacity: 0; }
            50% { transform: scale(1.15) rotateZ(3deg); opacity: 1; }
            100% { transform: scale(1) rotateZ(0deg); opacity: 1; }
          }
          @keyframes cell-pop {
            0% { transform: translateY(0); text-shadow: 0 0 0 transparent; }
            20% { transform: translateY(-6px); text-shadow: 0 0 15px rgba(250, 204, 21, 0.9), 0 0 40px rgba(245, 158, 11, 0.5); }
            50% { transform: translateY(-3px); text-shadow: 0 0 8px rgba(250, 204, 21, 0.4), 0 0 20px rgba(245, 158, 11, 0.2); }
            100% { transform: translateY(0); text-shadow: none; }
          }
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20% { transform: translateX(-4px); }
            40% { transform: translateX(4px); }
            60% { transform: translateX(-3px); }
            80% { transform: translateX(3px); }
          }
          @keyframes word-glow {
            0% { box-shadow: 0 0 0 0 rgba(250, 204, 21, 0.6); }
            50% { box-shadow: 0 0 20px 8px rgba(250, 204, 21, 0.25); }
            100% { box-shadow: 0 0 0 0 rgba(250, 204, 21, 0); }
          }
          .cell-entrance {
            animation: cell-entrance 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
          }
          .cell-value-pop {
            animation: cell-pop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
          }
          .cell-word-complete {
            animation: word-glow 0.8s ease-out;
          }
        `}</style>
        {/* VIEWPORT CONTAINER */}
        <div
            ref={containerRef}
            className={`w-full h-full touch-none ${isStoryMode ? 'cursor-grab' : 'cursor-default'}`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onWheel={handleWheel}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
        > 
            <div 
                ref={contentRef}
                className={`absolute origin-top-left will-change-transform ${isStoryMode ? 'transition-transform duration-500 ease-out' : ''}`}
                style={{
                    transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
                    width: `${sizeC * CELL_SIZE}px`,
                    height: `${sizeR * CELL_SIZE}px`,
                }}
            >
                <div className={`w-full h-full ${isStoryMode || bare ? '' : 'cg-board p-[7px] rounded-[14px]'}`}>
                <div
                    className={`grid gap-[1px] w-full h-full ${isStoryMode ? '' : 'cg-board-sheet'}`}
                    dir={isRTL ? "rtl" : "ltr"}
                    style={{
                        gridTemplateColumns: `repeat(${sizeC}, minmax(0, 1fr))`,
                        gridTemplateRows: `repeat(${sizeR}, minmax(0, 1fr))`
                    }}
                >
                {grid.map((row, rIndex) =>
                    row.map((cell, cIndex) => {
                    const isSelected = selectedCell?.r === rIndex && selectedCell?.c === cIndex;
                    const activeWordCells = activeClue?.cells || [];
                    const isInActiveWord = activeWordCells.some(ac => ac.r === rIndex && ac.c === cIndex);
                    
                    const isCorrect = userGrid[rIndex]?.[cIndex] === grid[rIndex][cIndex].value;
                    const hasError = userGrid[rIndex]?.[cIndex] && !isCorrect;
                    const isOpponent = opponentFilled?.has(`${rIndex},${cIndex}`);
                    
                    // NEW: Check if cell is being revealed by power-up
                    const isPowerRevealed = powerRevealedCells?.has(`${rIndex},${cIndex}`);

                    // Entrance wave delay: Manhattan distance from center
                    const centerR = (sizeR - 1) / 2;
                    const centerC = (sizeC - 1) / 2;
                    const dist = Math.abs(rIndex - centerR) + Math.abs(cIndex - centerC);
                    const maxDist = Math.ceil(centerR + centerC);
                    const entranceDelay = entranceActive && !cell.isBlack ? `${(dist / Math.max(maxDist, 1)) * 800}ms` : '0ms';

                    // The console holds one printed sheet, so the squares are the same paper
                    // as the mat and only the sheet's ink rules separate them. Everything
                    // below is sampled from the approved board crop: paper #DEC7AC, black
                    // #171513, active word #F4E3C0, selected #F2D896 behind a 1.5px gold rule.
                    let bgClass = bare ? 'bg-[#DEC7AC]' : 'bg-[#FBF5E8]';
                    let borderClass = '';
                    let shadowClass = '';
                    let animClass = '';
                    
                    if (cell.isBlack) {
                        bgClass = isStoryMode ? 'opacity-0 pointer-events-none' : (bare ? 'bg-[#171513]' : 'bg-[#2A1E16]');
                    } else {
                        if (isStoryMode) {
                            bgClass = 'bg-[#fdf6e3]'; 
                            borderClass = 'border border-[#d4a373]';
                            if (isPowerRevealed) {
                                bgClass = 'bg-[#E9CE8B] animate-pulse z-40 border-[#B07F22]';
                            } else if (isSelected) {
                                bgClass = 'bg-[#E9CE8B] scale-110 z-30 shadow-lg border-[#B07F22] border-2 rounded-md';
                            } else if (isCorrect) {
                                bgClass = 'bg-[#E4EBDD]/90 border-[#C8D5BC]';
                            } else if (isInActiveWord) {
                                bgClass = 'bg-[#F6E8CC] border-[#DEC9A2] z-10';
                            }
                            if (isCorrect) shadowClass = 'inset-shadow-sm opacity-90';
                        } else if (bare) {
                            if (isPowerRevealed) bgClass = 'bg-[#F2D896] animate-pulse z-40';
                            else if (isSelected) bgClass = 'bg-[#F2D896] ring-[1.5px] ring-[#C8952B] ring-inset z-30';
                            else if (isOpponent) bgClass = 'bg-[#EFD8CC]';
                            else if (isInActiveWord) bgClass = 'bg-[#F4E3C0] z-20';
                        } else {
                            if (isPowerRevealed) bgClass = 'bg-[#E9CE8B] animate-pulse z-40';
                            else if (isSelected) bgClass = 'bg-[#F3DCA6] ring-[3px] ring-[#C8952B] ring-inset z-30 shadow-xl';
                            else if (isOpponent) bgClass = 'bg-[#F7E0DA]';
                            else if (isInActiveWord) bgClass = 'bg-[#F6E8CC] z-20'; 
                            else if (isCorrect) bgClass = 'bg-[#E4EBDD]'; 
                        }
                    }

                    let textColorClass = bare ? 'text-[#1B1611]' : 'text-[#241A14]';
                    if (!cell.isBlack) {
                        if (isStoryMode) {
                            if (isPowerRevealed) textColorClass = 'text-[#3A2A1E] scale-110 transition-transform';
                            else if (hasError) textColorClass = 'text-[#A8463C] animate-pulse'; 
                            else if (isCorrect) textColorClass = 'text-[#2e7d32]'; 
                            else textColorClass = 'text-[#5e4b40]'; 
                        } else if (bare) {
                            // Wrong letters are never written into the grid, so every letter
                            // standing in a square is already right — the green tint only made
                            // the sheet look solved. Ink stays ink; a brother's letter keeps
                            // its rose so both players can still tell whose letter it is.
                            if (hasError) textColorClass = 'text-[#A8463C]'; 
                            else if (isOpponent) textColorClass = 'text-[#8A4A42]'; 
                        } else {
                            if (hasError) textColorClass = 'text-[#A8463C]'; 
                            else if (isOpponent) textColorClass = 'text-[#8A4A42]'; 
                            else if (isCorrect) textColorClass = 'text-[#4C5A42]'; 
                        }
                    }

                    const numberClass = bare
                        ? `top-[3px] text-[8px] font-bold text-[#33281F] ${isRTL ? 'right-[3px]' : 'left-[3px]'}`
                        : `top-0.5 text-[8px] font-black ${isStoryMode ? 'text-[#8c6b5d]' : 'text-[#8A6E55]'} ${isRTL ? 'right-0.5' : 'left-0.5'}`;

                    return (
                    <div
                        key={`${rIndex}-${cIndex}`}
                        id={`cell-${rIndex}-${cIndex}`}
                        data-cell-coords={`${rIndex},${cIndex}`}
                        className={`
                        relative w-full h-full flex items-center justify-center cursor-pointer select-none
                        ${bgClass}
                        ${borderClass}
                        ${shadowClass}
                        ${animClass}
                        ${entranceActive && !cell.isBlack && !userGrid[rIndex]?.[cIndex] ? 'cell-entrance' : ''}
                        ${!cell.isBlack && !isCorrect && 'hover:brightness-95'}
                        ${isStoryMode && !cell.isBlack ? 'rounded-sm shadow-sm' : bare ? 'rounded-none' : 'rounded-[1px]'}
                        `}
                        style={{ animationDelay: entranceDelay }}
                    >
                        {!cell.isBlack && (
                        <>
                            {isStoryMode && !userGrid[rIndex]?.[cIndex] && !isSelected && !isPowerRevealed && (
                                <div
                                    className="absolute inset-0 opacity-10 pointer-events-none"
                                    style={{ backgroundImage: 'var(--tex-paper)', backgroundSize: '160px 160px' }}
                                ></div>
                            )}
                            {cell.clueNumber && (
                            <span className={`absolute leading-none z-10 ${numberClass}`}>
                                {isRTL ? String(cell.clueNumber).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[+d]) : cell.clueNumber}
                            </span>
                            )}
                            <span key={userGrid[rIndex]?.[cIndex] || 'empty'} className={`${bare ? 'font-clay text-[18px] font-black' : 'text-xl font-black'} uppercase pointer-events-none ${userGrid[rIndex]?.[cIndex] && !entranceActive ? 'cell-value-pop' : ''} ${textColorClass} ${isStoryMode ? 'font-serif' : ''}`}>
                            {userGrid[rIndex]?.[cIndex]}
                            </span>
                        </>
                        )}
                    </div>
                    )})
                )}
                </div>
                </div>
                {sweep && sweep.bands.map((band, i) => (
                    <span
                        key={`${sweep.key}-${i}`}
                        className={`cg-sweepband ${band.dir}${band.dir === 'across' && isRTL ? ' rev' : ''}`}
                        style={{
                            left: band.left,
                            top: band.top,
                            width: band.w,
                            height: band.h,
                            ['--sd' as any]: `${band.delay}ms`,
                        }}
                    />
                ))}
            </div>
        </div>
    </div>
  );
};