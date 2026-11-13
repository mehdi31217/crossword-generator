
import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Grid, GridSize, Clue, WordDirection, Language, Category, LoadingStage, DictionaryEntry } from '../types';
import { EPIC_CAMPAIGNS } from '../data/campaigns';
import { FOLKTALE_BOOKS } from '../data/folktales/folktalesIndex';
import { createEmptyGrid, numberGrid } from '../utils/gridLogic';
import { runSolver } from '../utils/runSolver';
import { loadCategory, loadMergedCategories, getClueForWord, priorityWordSet } from '../utils/dictionary';
import { gameServer } from '../utils/gameServer';
import { generateFreeformGrid } from '../utils/freeformGenerator';
import { playCorrectLetter, playWrongLetter, playWordComplete, playComboStreak, playVictory, playDefeat, playGridBuildComplete } from '../utils/sounds';
import { debug } from '../utils/debug';
import { computeActiveDeckBuffs } from '../utils/progression';

export const useGameLogic = (
  size: GridSize,
  language: Language,
  category: Category,
  onWinCallback: (score: number, time: number, stars: number) => void
) => {
  const [grid, setGrid] = useState<Grid | null>(null);
  const [userGrid, setUserGrid] = useState<string[][]>([]);
  
  const userGridRef = useRef<string[][]>([]); 
  const selectedCellRef = useRef<{ r: number; c: number } | null>(null);
  const activeClueRef = useRef<Clue | null>(null);

  const [clues, setClues] = useState<{ across: Clue[], down: Clue[] } | null>(null);
  const [loadingStage, setLoadingStage] = useState<LoadingStage>('idle');
  const [maxRetries] = useState(10);
  const [gameWon, setGameWon] = useState(false);
  const [gameLost, setGameLost] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{ r: number; c: number } | null>(null);
  const [direction, setDirection] = useState<WordDirection>('across');
  const [activeClue, setActiveClue] = useState<Clue | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [combo, setCombo] = useState(0);
  
  // Power Meter (0 to 100) - Fighting Game Style
  const [powerMeter, setPowerMeter] = useState(0);
  // Track cells revealed by power-up for visual effect
  const [powerRevealedCells, setPowerRevealedCells] = useState<Set<string>>(new Set());
  // Track usage count for star calculation
  const [powerUpUsageCount, setPowerUpUsageCount] = useState(0);
  // Cells that arrived from help (power-up or a paid hint) rather than from the
  // player's own keystrokes. Duel judging only rewards what the player typed, so
  // without this a hint-spending run would look identical to a clean one.
  const [assistedCells, setAssistedCells] = useState<Set<string>>(new Set());

  // HP Stats & Animation Flags
  const [heroHp, setHeroHp] = useState(100);
  const [monsterHp, setMonsterHp] = useState(100);
  const [monsterRage, setMonsterRage] = useState(0); // 0 to 100
  // Mirror of monsterRage that the rage interval can read/write without
  // performing side effects inside a setState updater.
  const monsterRageRef = useRef(0);
  monsterRageRef.current = monsterRage;
  const [isHeroHit, setIsHeroHit] = useState(false);
  const [isMonsterHit, setIsMonsterHit] = useState(false);
  const [isMonsterAttacking, setIsMonsterAttacking] = useState(false);
  const [isHeroHeal, setIsHeroHeal] = useState(false);
  const [isFinishingMove, setIsFinishingMove] = useState(false); // New flag for final blow
  const prevComboRef = useRef(0);

  const [matchScore, setMatchScore] = useState(0); 
  const [myFilledCells, setMyFilledCells] = useState<Set<string>>(new Set()); 
  const [wrongAnswerCount, setWrongAnswerCount] = useState(0);

  const [seconds, setSeconds] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);

  // The win is detected in the same pass as the keystroke that earned the last
  // points, before React commits them. Reporting the render's `matchScore`
  // therefore dropped the final letter and the final word bonus, by a different
  // amount for every player. These refs are the authoritative, synchronous value.
  const scoreRef = useRef(0);
  const secondsRef = useRef(0);
  const awardScore = useCallback((delta: number) => {
    scoreRef.current += delta;
    setMatchScore(s => s + delta);
  }, []);

  const [currentChapterIndex, setCurrentChapterIndex] = useState<number | null>(null);
  
  // Flag to pause rage during animations (like power-up delay or finish)
  const isProcessingRef = useRef(false);

  // Track all timeouts for cleanup on unmount
  const timeoutIdsRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());
  const clearTimeouts = useCallback(() => {
    timeoutIdsRef.current.forEach(clearTimeout);
    timeoutIdsRef.current.clear();
  }, []);
  const addTimeout = useCallback((fn: () => void, delay: number) => {
    const id = setTimeout(() => {
      timeoutIdsRef.current.delete(id);
      fn();
    }, delay);
    timeoutIdsRef.current.add(id);
    return id;
  }, []);

  // Cleanup all timeouts on unmount
  useEffect(() => {
    return () => clearTimeouts();
  }, [clearTimeouts]);

  useEffect(() => { userGridRef.current = userGrid; }, [userGrid]);
  useEffect(() => { selectedCellRef.current = selectedCell; }, [selectedCell]);
  useEffect(() => { activeClueRef.current = activeClue; }, [activeClue]);

  useEffect(() => {
    let t: number;
    if (isTimerActive) t = window.setInterval(() => {
      secondsRef.current += 1;
      setSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(t);
  }, [isTimerActive]);

  // --- MONSTER RAGE LOGIC (Story Mode Only) ---
  useEffect(() => {
      let rageInterval: number;

      // Stop rage if game over OR finishing move is happening
      if (currentChapterIndex && !gameWon && !gameLost && isTimerActive && !isFinishingMove) {
          const tickRate = 100; // Update every 100ms
          const deckBuffs = computeActiveDeckBuffs(gameServer.getLocalEconomyState());
          const secondsToFullRage = 12 * (1 + (deckBuffs.monsterArmorPct || 0) / 100); 
          const incrementPerTick = 100 / (secondsToFullRage * (1000 / tickRate));

          rageInterval = window.setInterval(() => {
              if (isProcessingRef.current) return; // Pause rage during animations

              let shouldAttack = false;
              setMonsterRage(prev => {
                  if (prev >= 100) {
                      shouldAttack = true;
                      return 0; // Reset loop
                  }
                  return prev + incrementPerTick;
              });
              // Call handleMonsterAttack OUTSIDE setState updater to keep it pure
              if (shouldAttack) handleMonsterAttack();
          }, tickRate);
      }

      return () => clearInterval(rageInterval);
  }, [currentChapterIndex, gameWon, gameLost, isTimerActive, isFinishingMove]);

  // EXPOSED: Start Timer (for story mode - called after user dismisses intro modal)
  const startTimer = useCallback(() => {
      setIsTimerActive(true);
  }, []);

  // EXPOSED: Revive Hero (Second-Chance Revive on StoryLoseScreen)
  const reviveHero = useCallback(() => {
      setHeroHp(60);
      setMonsterRage(0);
      setGameLost(false);
      setIsTimerActive(true);
      setIsHeroHeal(true);
      addTimeout(() => setIsHeroHeal(false), 900);
  }, [addTimeout]);

  // EXPOSED: Manual Loss Trigger (e.g. for Time Limit)
  const manualLose = useCallback(() => {
      if (!gameWon && !gameLost) {
          setGameLost(true);
          setIsTimerActive(false);
      }
  }, [gameWon, gameLost]);

  // Play defeat sound when game is lost
  useEffect(() => {
    if (gameLost) playDefeat();
  }, [gameLost]);

  // Game over when the hero runs out of HP. Kept as an effect so the setState
  // updaters above stay pure (no side effects inside them).
  useEffect(() => {
      if (heroHp <= 0 && !gameWon && !gameLost) {
          setGameLost(true);
          setIsTimerActive(false);
      }
  }, [heroHp, gameWon, gameLost]);

  const handleMonsterAttack = useCallback(() => {
      // Reset Combo on Attack
      setCombo(0);
      
      // SCALING DIFFICULTY: Higher chapters deal more damage
      // Base damage 4 + Chapter number, reduced by active Epic/Shahnameh armor buff
      const baseDamage = currentChapterIndex ? (4 + currentChapterIndex) : 5;
      const armorPct = computeActiveDeckBuffs(gameServer.getLocalEconomyState()).monsterArmorPct || 0;
      const damage = Math.max(1, Math.round(baseDamage * (1 - armorPct / 100)));

      // Pure updater — the HP<=0 loss is handled by the effect above.
      setHeroHp(prev => Math.max(0, prev - damage));
      setIsMonsterAttacking(true);
      setIsHeroHit(true);
      
      addTimeout(() => {
          setIsMonsterAttacking(false);
          setIsHeroHit(false);
      }, 1000);
  }, [currentChapterIndex, addTimeout]);

  const findClueAt = useCallback((r: number, c: number, d: WordDirection, allClues: { across: Clue[], down: Clue[] } | null) => {
    if (!allClues) return null;
    const list = d === 'across' ? allClues.across : allClues.down;
    return list.find(clue => clue.cells.some(cell => cell.r === r && cell.c === c)) || null;
  }, []);

  const isClueSolved = (clue: Clue, currentG: string[][], masterG: Grid) => {
    return clue.cells.every(cell => currentG[cell.r][cell.c] === masterG[cell.r][cell.c].value);
  };

  const findNextEmptyInClue = (clue: Clue, currentG: string[][], masterG: Grid) => {
    return clue.cells.find(cell => currentG[cell.r][cell.c] !== masterG[cell.r][cell.c].value);
  };

  const findFirstUnsolvedClue = useCallback((allClues: { across: Clue[], down: Clue[] }, currentG: string[][], masterG: Grid) => {
    const combined = [...allClues.across, ...allClues.down];
    return combined.find(clue => !isClueSolved(clue, currentG, masterG));
  }, []);

  /** Find next unsolved clue AFTER current one (avoids jumping back to earlier words) */
  const findNextUnsolvedClueAfter = useCallback((allClues: { across: Clue[], down: Clue[] }, currentG: string[][], masterG: Grid, afterClue: Clue | null) => {
    const combined = [...allClues.across, ...allClues.down];
    if (!afterClue) return combined.find(clue => !isClueSolved(clue, currentG, masterG));
    const startIdx = combined.findIndex(c => c.number === afterClue.number && c.direction === afterClue.direction);
    if (startIdx === -1) return combined.find(clue => !isClueSolved(clue, currentG, masterG));
    for (let i = 1; i <= combined.length; i++) {
      const idx = (startIdx + i) % combined.length;
      const clue = combined[idx];
      if (!isClueSolved(clue, currentG, masterG)) return clue;
    }
    return null;
  }, []);

  // --- WIN CHECKER HELPER ---
  const checkForWin = useCallback((currentGrid: string[][]) => {
      if (!grid) return false;
      const isSolved = grid.every((row, r) => 
          row.every((cell, c) => cell.isBlack || currentGrid[r][c] === cell.value)
      );

      if (isSolved) {
          // Trigger Finishing Move Animation Phase
          setIsFinishingMove(true);
          setMonsterHp(0); // Drain health visually
          setIsTimerActive(false);
          setMonsterRage(0); // Clear stress

          // Calculate stars (Stricter 5-Star System)
          let stars = 1;
          if (currentChapterIndex) {
              if (heroHp > 80) {
                  // Perfect HP: Check power usage
                  if (powerUpUsageCount <= 1) {
                      stars = 5; // Perfect execution
                  } else {
                      stars = 4; // Good HP but too much help
                  }
              } else if (heroHp > 60) {
                  stars = 3; // Took some damage
              } else if (heroHp > 30) {
                  stars = 2; // Barely made it
              } else {
                  stars = 1; // Near death
              }
          }

          // Delay win screen to allow death animation
          addTimeout(() => {
              playVictory();
              setGameWon(true);
              onWinCallback(scoreRef.current, secondsRef.current, stars);
          }, 2500); // 2.5s delay for drama

          return true;
      }
      return false;
  }, [grid, currentChapterIndex, heroHp, onWinCallback, powerUpUsageCount]);

  // --- MANUAL POWER-UP FUNCTIONS ---

  // Shared with the paid hint flow (useHintSystem), which fills cells directly on
  // the grid and would otherwise leave no trace in the duel's accuracy record.
  const markAssisted = useCallback((keys: string[]) => {
      if (keys.length === 0) return;
      setAssistedCells(prev => {
          const next = new Set(prev);
          keys.forEach(k => next.add(k));
          return next;
      });
  }, []);

  const usePowerRevealCell = useCallback(() => {
      if (powerMeter < 30 || !selectedCell || !grid) return;
      
      // Reset Rage on power usage
      setMonsterRage(0);
      setPowerUpUsageCount(prev => prev + 1);
      isProcessingRef.current = true;

      const { r, c } = selectedCell;
      if (userGrid[r][c] === grid[r][c].value) {
          isProcessingRef.current = false;
          return; 
      }

      const newG = userGrid.map(row => [...row]);
      newG[r][c] = grid[r][c].value;
      setUserGrid(newG);
      markAssisted([`${r},${c}`]);
      setPowerMeter(prev => Math.max(0, prev - 30));
      
      // Highlight the cell
      setPowerRevealedCells(new Set([`${r},${c}`]));

      // DELAY: Wait 2s before checking win or moving
      addTimeout(() => {
          isProcessingRef.current = false;
          setPowerRevealedCells(new Set()); // Clear highlight

          if (checkForWin(newG)) return;

          if (activeClue) {
              const currentIdx = activeClue.cells.findIndex(cell => cell.r === r && cell.c === c);
              const nextEmpty = activeClue.cells.find((cell, idx) => idx > currentIdx && newG[cell.r][cell.c] !== grid[cell.r][cell.c].value);
              if (nextEmpty) setSelectedCell({ r: nextEmpty.r, c: nextEmpty.c });
          }
      }, 2000);

  }, [powerMeter, selectedCell, grid, userGrid, activeClue, checkForWin, markAssisted]);

  const usePowerRevealWord = useCallback(() => {
      if (powerMeter < 100 || !activeClue || !grid) return;
      
      // Reset Rage on power usage
      setMonsterRage(0);
      setPowerUpUsageCount(prev => prev + 1);
      isProcessingRef.current = true;

      const newG = userGrid.map(row => [...row]);
      const revealedSet = new Set<string>();
      const assistedKeys: string[] = [];

      activeClue.cells.forEach(cell => {
          const key = `${cell.r},${cell.c}`;
          if (newG[cell.r][cell.c] !== grid[cell.r][cell.c].value) assistedKeys.push(key);
          newG[cell.r][cell.c] = grid[cell.r][cell.c].value;
          revealedSet.add(key);
      });
      
      setUserGrid(newG);
      markAssisted(assistedKeys);
      setPowerMeter(0);
      setPowerRevealedCells(revealedSet); // Highlight word
      
      if (currentChapterIndex && clues) {
          const totalClues = clues.across.length + clues.down.length;
          setMonsterHp(prev => Math.max(0, prev - (100 / totalClues)));
          setIsMonsterHit(true);
          addTimeout(() => setIsMonsterHit(false), 400);
      }

      // DELAY: Wait 2s so user can see the word
      addTimeout(() => {
          isProcessingRef.current = false;
          setPowerRevealedCells(new Set()); // Clear highlight

          if (checkForWin(newG)) return;
          
          const nextClue = findNextUnsolvedClueAfter(clues!, newG, grid, activeClue);
          if (nextClue) {
              const firstEmpty = findNextEmptyInClue(nextClue, newG, grid);
              if (firstEmpty) {
                  setSelectedCell({ r: firstEmpty.r, c: firstEmpty.c });
                  setDirection(nextClue.direction);
                  setActiveClue(nextClue);
              }
          }
      }, 2000);

  }, [powerMeter, activeClue, grid, userGrid, clues, findNextUnsolvedClueAfter, checkForWin, currentChapterIndex, markAssisted]);

  const resetGame = useCallback(() => {
    clearTimeouts();
    scoreRef.current = 0;
    secondsRef.current = 0;
    setGrid(null); setUserGrid([]); setClues(null); setGameWon(false); setGameLost(false); setSelectedCell(null); setActiveClue(null); setSeconds(0);
    setIsTimerActive(false); setCombo(0); setMatchScore(0); setMyFilledCells(new Set()); setError(null); setRetryCount(0); setLoadingStage('idle');
    setCurrentChapterIndex(null); setHeroHp(100); setMonsterHp(100); setPowerMeter(0); setPowerRevealedCells(new Set()); setPowerUpUsageCount(0);
    setAssistedCells(new Set());
    setIsHeroHit(false); setIsMonsterHit(false); setIsHeroHeal(false); setIsMonsterAttacking(false); setMonsterRage(0); setIsFinishingMove(false);
    isProcessingRef.current = false;
  }, [clearTimeouts]);

  // Keep `myFilledCells` consistent with the board.
  // The opponent's Eraser clears a cell via useMultiplayerState.handleCellReset,
  // which only touches `userGrid`. Without this, an erased cell stayed counted as
  // filled: the victim's progress bar never dropped, and re-typing the correct
  // letter there awarded nothing because handleKeyPress skips keys already in the
  // set. Pruning here keeps scoring and progress truthful after any remote clear
  // (opponent's Eraser, a race-condition restore, or a grid reset).
  useEffect(() => {
    setMyFilledCells(prev => {
      if (prev.size === 0) return prev;
      let next: Set<string> | null = null;
      for (const key of prev) {
        const [r, c] = key.split(',').map(Number);
        const val = userGrid[r]?.[c];
        if (val === undefined || val === '') {
          if (!next) next = new Set(prev);
          next.delete(key);
        }
      }
      // Return the SAME reference when nothing changed — avoids a render loop.
      return next ?? prev;
    });
  }, [userGrid]);

  const updateSelection = useCallback((r: number, c: number, newDir?: WordDirection) => {
    if (!grid || !clues || grid[r][c].isBlack) return;
    if (powerRevealedCells.size > 0) return;

    const isClickedCellSolved = userGrid[r]?.[c] === grid[r][c].value;

    const getFirstEmptyInClue = (clue: Clue) => {
      const empties = clue.cells.filter(cell => userGrid[cell.r]?.[cell.c] !== grid[cell.r][cell.c].value);
      if (empties.length === 0) return null;
      // For 'across' in RTL (Farsi): get rightmost empty (SMALLEST c, because RTL)
      if (clue.direction === 'across') return empties.reduce((a, b) => (a.c <= b.c ? a : b));
      // For 'down': get topmost empty (smallest r)
      return empties.reduce((a, b) => (a.r <= b.r ? a : b));
    };

    if (isClickedCellSolved) {
      let d = newDir ?? direction;
      let clue = findClueAt(r, c, d, clues);
      if (!clue) { d = d === 'across' ? 'down' : 'across'; clue = findClueAt(r, c, d, clues); }
      if (!clue) return;

      let target = getFirstEmptyInClue(clue);
      if (!target) {
        d = d === 'across' ? 'down' : 'across';
        clue = findClueAt(r, c, d, clues);
        if (!clue) return;
        target = getFirstEmptyInClue(clue);
      }
      if (!target) return;
      setSelectedCell({ r: target.r, c: target.c });
      setDirection(clue.direction);
      setActiveClue(clue);
      return;
    }

    let d = newDir ?? direction;
    let nextClue = findClueAt(r, c, d, clues);
    if (!nextClue) {
      d = d === 'across' ? 'down' : 'across';
      nextClue = findClueAt(r, c, d, clues);
    }
    if (nextClue) {
      setSelectedCell({ r, c });
      setDirection(d);
      setActiveClue(nextClue);
    }
  }, [grid, userGrid, direction, clues, findClueAt, powerRevealedCells]);

  const canToggleDirection = useMemo(() => {
    if (!selectedCell || !clues) return false;
    const hasAcross = clues.across.some(clue => clue.cells.some(cell => cell.r === selectedCell.r && cell.c === selectedCell.c));
    const hasDown = clues.down.some(clue => clue.cells.some(cell => cell.r === selectedCell.r && cell.c === selectedCell.c));
    return hasAcross && hasDown;
  }, [selectedCell, clues]);

  const toggleDirection = useCallback(() => {
    if (!selectedCell || !clues) return;
    const newDir = direction === 'across' ? 'down' : 'across';
    const nextClue = findClueAt(selectedCell.r, selectedCell.c, newDir, clues);
    if (nextClue) {
        setDirection(newDir);
        setActiveClue(nextClue);
    }
  }, [selectedCell, direction, findClueAt, clues]);

  const handleNavigateClue = useCallback((offset: number) => {
    if (!clues || !activeClue) return;
    const all = [...clues.across, ...clues.down];
    const currentIdx = all.findIndex(c => c.number === activeClue.number && c.direction === activeClue.direction);
    if (currentIdx === -1) return;
    let nextIdx = (currentIdx + offset + all.length) % all.length;
    const nextClue = all[nextIdx];
    setSelectedCell({ r: nextClue.cells[0].r, c: nextClue.cells[0].c });
    setDirection(nextClue.direction);
    setActiveClue(nextClue);
  }, [clues, activeClue]);

  const triggerSmartNavigation = useCallback((currentG: string[][]) => {
    if (!grid || !clues) return;
    // Priority 1: stay within the current clue if it still has empty cells
    if (activeClue) {
      const firstEmpty = findNextEmptyInClue(activeClue, currentG, grid);
      if (firstEmpty) {
        setSelectedCell({ r: firstEmpty.r, c: firstEmpty.c });
        return;
      }
    }
    // Priority 2: jump to the first unsolved clue
    const nextClue = findFirstUnsolvedClue(clues, currentG, grid);
    if (nextClue) {
        const firstEmpty = findNextEmptyInClue(nextClue, currentG, grid);
        if (firstEmpty) {
            setSelectedCell({ r: firstEmpty.r, c: firstEmpty.c });
            setDirection(nextClue.direction);
            setActiveClue(nextClue);
        }
    }
  }, [grid, clues, activeClue, findFirstUnsolvedClue]);

  const generateGrid = useCallback(async (isDaily: boolean = false, overrideSize?: GridSize, chapterId?: number, customWords?: DictionaryEntry[], mergedCategories?: [Category, Category]) => {
    try {
    setError(null);
    resetGame();
    setLoadingStage('loading_dict');
    if (chapterId) {
        setCurrentChapterIndex(chapterId); 
        setLoadingStage('constructing');
        
        let wordsToUse = customWords;
        if (!wordsToUse || wordsToUse.length === 0) {
            for (const campaign of [...EPIC_CAMPAIGNS, ...FOLKTALE_BOOKS]) {
                const ch = campaign.chapters?.find(c => String(c.id) === String(chapterId));
                if (ch?.words && ch.words.length > 0) {
                    wordsToUse = ch.words;
                    break;
                }
            }
        }

        const freeformResult = generateFreeformGrid(wordsToUse || []);
        if (freeformResult) {
            const initialUserGrid: string[][] = freeformResult.grid.map(row => row.map(cell => cell.isBlack ? '#' : ''));
            const firstClue = freeformResult.clues.across[0] || freeformResult.clues.down[0];
            const deckBuffs = computeActiveDeckBuffs(gameServer.getLocalEconomyState());
            if (deckBuffs.startingFreeLetterCount > 0 && firstClue && firstClue.cells.length > 1) {
                const startCell = firstClue.cells[0];
                initialUserGrid[startCell.r][startCell.c] = freeformResult.grid[startCell.r][startCell.c].value;
                setPowerRevealedCells(new Set([`${startCell.r},${startCell.c}`]));
                addTimeout(() => setPowerRevealedCells(new Set()), 1400);
            }
            setGrid(freeformResult.grid);
            setUserGrid(initialUserGrid);
            setClues(freeformResult.clues); 
            setLoadingStage('idle'); // Timer starts after user dismisses story modal
            if (firstClue) {
                const targetCell = (deckBuffs.startingFreeLetterCount > 0 && firstClue.cells.length > 1)
                    ? firstClue.cells[1]
                    : firstClue.cells[0];
                setSelectedCell({ r: targetCell.r, c: targetCell.c });
                setDirection(firstClue.direction);
                setActiveClue(firstClue);
            }
            return { grid: freeformResult.grid, clues: freeformResult.clues };
        } else {
            setLoadingStage('idle');
            setError(language === 'fa' ? 'خطا در ساخت جدول این فصل. دوباره تلاش کنید.' : 'Failed to generate story grid.');
            return null;
        }
    }
    const targetSize = isDaily ? 10 : (overrideSize || size);
    let wordCount: number;
    let dbWords: DictionaryEntry[] = [];
    let isTwoCategory = false;
    if (mergedCategories && mergedCategories.length >= 2) {
      isTwoCategory = true;
      const [cat1, cat2] = mergedCategories;
      const dbWords1 = await gameServer.fetchCategoryWords(cat1, language);
      const glueWords1 = await gameServer.fetchGlueWords(cat1, language);
      const dbWords2 = await gameServer.fetchCategoryWords(cat2, language);
      const glueWords2 = await gameServer.fetchGlueWords(cat2, language);
      dbWords = [...dbWords1, ...dbWords2];
      wordCount = loadMergedCategories(cat1, cat2, language, dbWords1, dbWords2, glueWords1, glueWords2);
    } else {
      const targetCategory = isDaily ? 'all' : category;
      dbWords = await gameServer.fetchCategoryWords(targetCategory, language);
      const glueWords: DictionaryEntry[] = isDaily ? [] : await gameServer.fetchGlueWords(targetCategory, language);
      debug.log('[grid] targetCategory=' + targetCategory + ' dbWords=' + dbWords.length + ' glue=' + glueWords.length);
      wordCount = loadCategory(targetCategory, language, dbWords, glueWords);
    }
    setLoadingStage('constructing');
    // Merged categories (multiplayer) need more time per attempt and more retries
    // because the combined word pool from two categories is harder to solve
    const isMerged = mergedCategories && mergedCategories.length >= 2;
    // Size-dependent: smaller grids need fewer tries, larger grids get more time
    const sizeRetries = targetSize <= 6 ? 25 : targetSize <= 8 ? 40 : 30;
    const maxRetries = isMerged ? Math.round(sizeRetries * 1.5) : sizeRetries;
    const sizeTimeout = targetSize <= 6 ? 1000 : targetSize <= 8 ? 1500 : 2000;
    const timeoutMs = isMerged ? Math.round(sizeTimeout * 1.5) : sizeTimeout;
    debug.log('[grid] solver size=' + targetSize + ' words=' + wordCount + ' retries=' + maxRetries + ' timeout=' + timeoutMs + (isMerged ? ' (merged categories)' : ''));
    // Cap overall timeout at 120s for multiplayer (joiner waits 90s, give 30s buffer)
    const overallTimeout = 120000;
    const overallStart = Date.now();
    let successGrid: Grid | null = null;
    let bestPurity = 0;
    let bestCandidate: Grid | null = null;
    // Helper: normalize word for pool lookup
    const normWord = (s: string) => s.toUpperCase().replace(/[\s-]/g,'').replace(/[آأإ]/g,'ا').replace(/[ئي]/g,'ی').replace(/ك/g,'ک');
    // Helper: extract words from a filled grid
    const extractWords = (g: any[][]): string[] => {
      const size = g.length;
      const words: string[] = [];
      // Across
      for (let r = 0; r < size; r++) {
        let c = 0;
        while (c < size) {
          if (g[r][c].isBlack) { c++; continue; }
          let word = '';
          while (c < size && !g[r][c].isBlack) { word += (g[r][c].value || ''); c++; }
          if (word.length >= 2) words.push(normWord(word));
        }
      }
      // Down
      for (let c = 0; c < size; c++) {
        let r = 0;
        while (r < size) {
          if (g[r][c].isBlack) { r++; continue; }
          let word = '';
          while (r < size && !g[r][c].isBlack) { word += (g[r][c].value || ''); r++; }
          if (word.length >= 2) words.push(normWord(word));
        }
      }
      return words;
    };
    const measurePurity = (g: any[][]): number => {
      const words = extractWords(g);
      if (words.length === 0) return 0;
      const pCount = words.filter(w => priorityWordSet.has(w)).length;
      const total = words.length;
      return total > 0 ? pCount / total : 0;
    };
    // Phase 1 removed — benchmark showed it NEVER succeeds for categorized grids
    // and wastes ~5s. The solver resolves in 10-50ms so we go straight to Phase 2
    // with many fast attempts to maximize chance of high-purity grids.
    {
      const HIGH_PURITY_TARGET = 0.60;
      debug.log('[grid] PHASE 2: full pool (' + maxRetries + ' attempts, target purity ' + (HIGH_PURITY_TARGET * 100) + '%)');
      const bannedWords = new Set<string>();
      // Frequency-based adaptive pruning: track how often each supplement word appears
      // across failed attempts. Only ban words that appear ≥2 times (persistent offenders).
      // This avoids over-constraining the solver by banning one-off supplement words.
      const supplementFreq = new Map<string, number>();
      const MAX_PRUNE_CYCLES = Math.min(15, Math.floor(maxRetries * 0.4));
      let pruneCount = 0;
      for (let i = 1; i <= maxRetries; i++) {
        if (Date.now() - overallStart > overallTimeout) { debug.log('[grid] OVERALL TIMEOUT'); break; }
        setRetryCount(i); await new Promise(r => setTimeout(r, 0));
        const candidate = await runSolver(createEmptyGrid(targetSize), timeoutMs, { priorityOnly: false, bannedWords });
        if (candidate) {
          const purity = measurePurity(candidate);
          debug.log('[grid] attempt ' + i + ': purity=' + (Math.round(purity * 100)) + '%');
          // For general/all categories there's no priority set — accept any valid grid
          if (priorityWordSet.size === 0 || purity >= HIGH_PURITY_TARGET) {
            successGrid = candidate;
            bestPurity = purity;
            debug.log('[grid] PHASE 2 → ACCEPTED (purity=' + (Math.round(purity * 100)) + '%)');
            break;
          }
          if (purity > bestPurity) { bestPurity = purity; bestCandidate = candidate; }
          // Frequency-based iterative pruning: track non-priority words across attempts.
          // Only ban supplement words that appear in ≥2 different low-purity solutions,
          // keeping the constraint alive for the solver while removing persistent offenders.
          if (pruneCount < MAX_PRUNE_CYCLES && purity > 0) {
            const words = extractWords(candidate);
            for (const w of words) {
              if (!priorityWordSet.has(w)) {
                const freq = (supplementFreq.get(w) || 0) + 1;
                supplementFreq.set(w, freq);
                if (freq >= 2) bannedWords.add(w);
              }
            }
            pruneCount++;
          }
        }
      }
      // Fallback: if nothing hit 65%, accept best attempt ≥35%
      // For general/all (priorityWordSet empty), accept any valid grid
      if (!successGrid && (priorityWordSet.size === 0 || bestPurity > 0)) {
        if ((priorityWordSet.size === 0 || bestPurity >= 0.35) && bestCandidate) {
          successGrid = bestCandidate;
          debug.log('[grid] FALLBACK: accepting best attempt (purity=' + (Math.round(bestPurity * 100)) + '%)');
        } else {
          debug.log('[grid] exhausted, best purity=' + (Math.round(bestPurity * 100)) + '% — too low for fallback');
        }
      }
    }
    debug.log('[grid] best purity: ' + (Math.round(bestPurity * 100)) + '%');
    if (successGrid) {
        playGridBuildComplete();
        const numbered = numberGrid(successGrid);
        const processClues = (clues: Clue[]) => clues.map(c => ({...c, translation: getClueForWord(c.word)}));
        const finalClues = { across: processClues(numbered.across), down: processClues(numbered.down) };
        const initialUserGrid: string[][] = numbered.grid.map(row => row.map(cell => cell.isBlack ? '#' : ''));
        const firstClue = finalClues.across[0] || finalClues.down[0];
        const deckBuffs = computeActiveDeckBuffs(gameServer.getLocalEconomyState());
        if (deckBuffs.startingFreeLetterCount > 0 && firstClue && firstClue.cells.length > 1) {
            const startCell = firstClue.cells[0];
            initialUserGrid[startCell.r][startCell.c] = numbered.grid[startCell.r][startCell.c].value;
            setPowerRevealedCells(new Set([`${startCell.r},${startCell.c}`]));
            addTimeout(() => setPowerRevealedCells(new Set()), 1400);
        }
        setGrid(numbered.grid); setUserGrid(initialUserGrid);
        setClues(finalClues); if (!chapterId) setIsTimerActive(true); setLoadingStage('idle');
        const norm = (s: string) => s.toUpperCase().replace(/[\s-]/g,'').replace(/[آأإ]/g,'ا').replace(/[ئي]/g,'ی').replace(/ك/g,'ک');
        const wordCat = new Map<string, string>();
        for (const e of dbWords) wordCat.set(norm(e.word), e.category || 'glue');
        for (const c of finalClues.across) debug.log('  ACROSS #%d: "%s" → %s | %s', c.number, c.word, c.translation, wordCat.get(norm(c.word)) || 'glue');
        for (const c of finalClues.down) debug.log('  DOWN #%d: "%s" → %s | %s', c.number, c.word, c.translation, wordCat.get(norm(c.word)) || 'glue');
        addTimeout(() => {
            if (firstClue) {
                const targetCell = (deckBuffs.startingFreeLetterCount > 0 && firstClue.cells.length > 1)
                    ? firstClue.cells[1]
                    : firstClue.cells[0];
                setSelectedCell({ r: targetCell.r, c: targetCell.c });
                setDirection(firstClue.direction);
                setActiveClue(firstClue);
            }
        }, 100);
        return { grid: numbered.grid, clues: finalClues };
    }
    setError('جدول ساخته نشد. لطفاً دوباره تلاش کنید.');
    setLoadingStage('idle');
    return null;
  } catch (e: any) {
    debug.warn('useGameLogic', 'generateGrid unexpected error:', e, 'stack:', e?.stack || 'no stack', 'type:', typeof e, 'constructor:', e?.constructor?.name);
    setError(e?.message || 'خطا در ساخت جدول');
    setLoadingStage('idle');
    return null;
  }
  }, [category, language, size, resetGame, findClueAt, clues, direction]);

  const handleKeyPress = (key: string, isFrozen: boolean) => {
    if (!selectedCell || !grid || gameWon || gameLost || isFrozen || !clues || !activeClue || powerRevealedCells.size > 0 || isFinishingMove) return; 
    
    const { r, c } = selectedCell;
    const targetValue = grid[r][c].value;
    const isCorrect = key.toUpperCase() === targetValue;
    const nextComboVal = combo + 1;

    if (!isCorrect) {
        playWrongLetter();
        setCombo(0);
        setWrongAnswerCount(c => c + 1);
        if (currentChapterIndex) {
            // SCALING PENALTY: Wrong answer hurts more in later chapters too, reduced by active Epic/Shahnameh armor
            const basePenalty = currentChapterIndex ? (4 + currentChapterIndex) : 10;
            const armorPct = computeActiveDeckBuffs(gameServer.getLocalEconomyState()).monsterArmorPct || 0;
            const penalty = Math.max(1, Math.round(basePenalty * (1 - armorPct / 100)));
            
            const newHp = Math.max(0, heroHp - penalty);
            setHeroHp(newHp);
            setIsHeroHit(true);
            addTimeout(() => setIsHeroHit(false), 300);
            
            // Only trigger game loss in Story Mode (currentChapterIndex exists)
            if (newHp <= 0) {
                setGameLost(true);
                setIsTimerActive(false);
                return { newGrid: userGrid, isWordComplete: false, activeClue, wasMistake: true, completedClues: [] as Clue[] };
            }
        }
        // Return mistake flag for Tower Mode tracking
        return { newGrid: userGrid, isWordComplete: false, activeClue, wasMistake: true, completedClues: [] as Clue[] };
    } else {
        // Correct Answer -> Reset Rage
        if (currentChapterIndex) {
            setMonsterRage(0);
        }
        prevComboRef.current = nextComboVal;
        setCombo(v => v + 1);
        if (nextComboVal > 1 && nextComboVal % 2 === 0) playComboStreak(nextComboVal);

        // --- POWER METER FILL RATE (HALVED) ---
        // Old: 4 + (combo * 0.25)
        // New: 2 + (combo * 0.1)
        setPowerMeter(p => Math.min(100, p + 2 + (nextComboVal * 0.1)));
    }

    const newG = userGrid.map(row => [...row]);
    newG[r][c] = key.toUpperCase();
    setUserGrid(newG);

    // Every clue that this keystroke just completed, decided against the exact grid
    // the key was applied to. Testing only `activeClue` missed the crossing word and
    // every word that becomes complete again after an Eraser punched a hole in it,
    // which is how solved words silently failed to reach the opponent.
    const isClueComplete = (clue: Clue, g: string[][]) =>
        clue.cells.every(cell => g[cell.r]?.[cell.c] === grid[cell.r][cell.c].value);
    const completedClues: Clue[] = [];
    [...clues.across, ...clues.down].forEach(clue => {
        if (isClueComplete(clue, newG) && !isClueComplete(clue, userGrid)) completedClues.push(clue);
    });

    if (isCorrect) {
        const cellKey = `${r},${c}`;
        const deckBuffs = computeActiveDeckBuffs(gameServer.getLocalEconomyState());
        const scoreMult = 1 + (deckBuffs.comboScoreBonusPct || 0) / 100;
        if (!myFilledCells.has(cellKey)) {
            // Calculate word progress: how many cells of the current word are filled (including this one)
            const filledInWord = activeClue.cells.filter(cell => newG[cell.r][cell.c] !== '').length;
            const totalInWord = activeClue.cells.length;
            const wordProg = totalInWord > 0 ? Math.min(filledInWord / totalInWord, 1) : 0;
            playCorrectLetter(nextComboVal, wordProg);
            awardScore(Math.floor(10 * (1 + nextComboVal * 0.1) * scoreMult));
            setMyFilledCells(prev => new Set(prev).add(cellKey));
        }
        // Every clue this keystroke finished earns the bonus — including a crossing
        // word completed while a different clue was active. Charging it only to the
        // active clue made the total depend on the order the player happened to
        // navigate in, so a careful run could score below a messy one on one board.
        if (completedClues.length > 0) {
            playWordComplete(nextComboVal);
            awardScore(Math.floor(50 * completedClues.length * scoreMult));
            // Credit +3 coins per solved word into the Clay Piggy Bank (خمرهٔ زرین سفالی)
            gameServer.addPiggyBankCoins(completedClues.length);
            
            // --- POWER METER FILL RATE ON WORD COMPLETE (HALVED) ---
            // Old: 8
            // New: 4
            setPowerMeter(prev => Math.min(100, prev + 4)); 
            
            if (currentChapterIndex) {
                const totalClues = clues.across.length + clues.down.length;
                // If not finishing, reduce HP normally
                const damage = 100 / totalClues;
                // Don't reduce to 0 yet if not winning, keep at least 1 until last hit
                setMonsterHp(prev => Math.max(1, prev - damage));
                setIsMonsterHit(true);
                addTimeout(() => setIsMonsterHit(false), 400);

                setHeroHp(prev => Math.min(100, prev + 5));
                setIsHeroHeal(true);
                addTimeout(() => setIsHeroHeal(false), 600);
            }
        }
    }

    const result = { newGrid: newG, isWordComplete: activeClue.cells.every(cell => newG[cell.r][cell.c] === grid[cell.r][cell.c].value), activeClue, wasMistake: false, completedClues };

    if (checkForWin(newG)) return result;

    if (isCorrect) {
        const currentIdx = activeClue.cells.findIndex(cell => cell.r === r && cell.c === c);
        let nextIdx = activeClue.cells.findIndex((cell, idx) => idx > currentIdx && newG[cell.r][cell.c] !== grid[cell.r][cell.c].value);
        if (nextIdx !== -1) setSelectedCell({ r: activeClue.cells[nextIdx].r, c: activeClue.cells[nextIdx].c });
        else {
        const nextClue = findNextUnsolvedClueAfter(clues, newG, grid, activeClue);
        if (nextClue) { const firstEmpty = findNextEmptyInClue(nextClue, newG, grid); if (firstEmpty) { setSelectedCell({ r: firstEmpty.r, c: firstEmpty.c }); setDirection(nextClue.direction); setActiveClue(nextClue); } }
        }
    }
    return result;
  };

  return {
      grid, userGrid, setUserGrid, clues, loadingStage, retryCount, maxRetries, error, gameWon, gameLost,
      selectedCell, direction, activeClue, seconds, setSeconds, combo, matchScore, 
      heroHp, monsterHp, isHeroHit, isMonsterHit, isHeroHeal, isMonsterAttacking, 
      monsterRage, isFinishingMove, manualLose, wrongAnswerCount, // EXPORTED MANUAL LOSE
      powerMeter, powerRevealedCells, setPowerRevealedCells,
      usePowerRevealCell, usePowerRevealWord,
      assistedCount: assistedCells.size, markAssisted,
      myFilledCells, generateGrid, updateSelection, handleKeyPress, handleBackspace: (isFrozen: boolean) => {
          if (!selectedCell || isFrozen || gameWon || gameLost || !activeClue || isFinishingMove) return false;
          const { r, c } = selectedCell;
          const newG = userGrid.map(row => [...row]);
          if (userGrid[r][c]) { newG[r][c] = ''; setUserGrid(newG); setMyFilledCells(prev => { const next = new Set(prev); next.delete(`${r},${c}`); return next; }); return true; }
          else { const idx = activeClue.cells.findIndex(cell => cell.r === r && cell.c === c); if (idx > 0) setSelectedCell(activeClue.cells[idx - 1]); return false; }
      },
      setDirection, setActiveClue, canToggleDirection, setGameWon, setGameLost, setIsTimerActive, setError,
      resetGame, userGridRef, triggerSmartNavigation, toggleDirection, handleNavigateClue,
      currentChapterIndex, startTimer, reviveHero, setExternalGrid: (g: Grid, c: any) => {
          setError(null);
          setLoadingStage('idle');
          setCurrentChapterIndex(null);
          const initialUserGrid: string[][] = g.map(row => row.map(cell => cell.isBlack ? '#' : ''));
          const firstClue = c?.across?.[0] || c?.down?.[0] || null;
          const deckBuffs = computeActiveDeckBuffs(gameServer.getLocalEconomyState());
          if (deckBuffs.startingFreeLetterCount > 0 && firstClue && firstClue.cells?.length > 1) {
              const startCell = firstClue.cells[0];
              initialUserGrid[startCell.r][startCell.c] = g[startCell.r][startCell.c].value;
              setPowerRevealedCells(new Set([`${startCell.r},${startCell.c}`]));
              addTimeout(() => setPowerRevealedCells(new Set()), 1400);
          } else {
              setPowerRevealedCells(new Set());
          }
          setGrid(g);
          setClues(c);
          setUserGrid(initialUserGrid);
          setMyFilledCells(new Set());
          setAssistedCells(new Set());
          setWrongAnswerCount(0);
          setCombo(0);
          setMatchScore(0);
          scoreRef.current = 0;
          setSeconds(0);
          secondsRef.current = 0;
          setHeroHp(100);
          setMonsterHp(100);
          setMonsterRage(0);
          setPowerMeter(0);
          setGameWon(false);
          setGameLost(false);
          setIsTimerActive(true);
          if (firstClue && firstClue.cells?.length > 0) {
              const targetCell = (deckBuffs.startingFreeLetterCount > 0 && firstClue.cells.length > 1)
                  ? firstClue.cells[1]
                  : firstClue.cells[0];
              setSelectedCell({ r: targetCell.r, c: targetCell.c });
              setDirection(firstClue.direction);
              setActiveClue(firstClue);
          } else {
              setSelectedCell(null);
              setActiveClue(null);
          }
      }
  };
};
