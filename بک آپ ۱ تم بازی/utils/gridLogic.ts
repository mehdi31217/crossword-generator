
import { Grid, GridSize, Slot, Clue } from '../types';
import { getMatchingWords, priorityWordSet } from './dictionary';
import { debug } from './debug';

// Initialize an empty grid with block placement
export function createEmptyGrid(size: GridSize): Grid {
  let grid: Grid;
  let attempts = 0;
  
  // Try up to 100 times to create a valid topology (connected + no isolated cells)
  do {
      grid = generateTopology(size);
      attempts++;
  } while ((!isConnected(grid) || hasIsolatedOrShortSlots(grid)) && attempts < 100);

  // If we still fail (rare), return the last attempt, the solver will likely reject it quickly
  return grid;
}

function generateTopology(size: GridSize): Grid {
  const grid: Grid = Array(size).fill(null).map((_, r) =>
    Array(size).fill(null).map((_, c) => ({
      row: r,
      col: c,
      value: '',
      isBlack: false,
    }))
  );

  // Adjusted ratios for larger grids
  let ratio = 0.18; // Default for 5x5
  if (size === 6) ratio = 0.22;
  else if (size === 7) ratio = 0.25;
  else if (size === 8) ratio = 0.28;
  else if (size === 9) ratio = 0.32;
  // 10x10 needs to be dense enough to not have huge open spaces, but not so dense it breaks into islands.
  // 0.32 seems safer than 0.35 to allow slightly longer words if available.
  else if (size === 10) ratio = 0.32; 

  const targetBlack = Math.floor(size * size * ratio); 
  
  let placed = 0;
  let attempts = 0;
  const maxPlacementAttempts = size > 8 ? 800 : 400;
  
  while (placed < targetBlack && attempts < maxPlacementAttempts) { 
    attempts++;
    const r = Math.floor(Math.random() * size);
    const c = Math.floor(Math.random() * size);
    
    if (grid[r][c].isBlack) continue;
    
    // Tentatively place black
    grid[r][c].isBlack = true;
    let added = 1;

    // Symmetry
    const symR = size - 1 - r;
    const symC = size - 1 - c;
    if (!grid[symR][symC].isBlack) {
        grid[symR][symC].isBlack = true;
        added++;
    }

    placed += added;
  }
  return grid;
}

function hasIsolatedOrShortSlots(grid: Grid): boolean {
    const size = grid.length;
    // Check if any white cell is NOT part of a valid word (>1 length)
    for(let r=0; r<size; r++){
        for(let c=0; c<size; c++){
            if(!grid[r][c].isBlack) {
                const hasHoriz = (c > 0 && !grid[r][c-1].isBlack) || (c < size-1 && !grid[r][c+1].isBlack);
                const hasVert = (r > 0 && !grid[r-1][c].isBlack) || (r < size-1 && !grid[r+1][c].isBlack);
                
                if (!hasHoriz && !hasVert) return true; // Completely isolated 1x1
            }
        }
    }
    return false;
}

function isConnected(grid: Grid): boolean {
  const size = grid.length;
  let startNode = null;
  let whiteCount = 0;

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!grid[r][c].isBlack) {
        whiteCount++;
        if (!startNode) startNode = { r, c };
      }
    }
  }

  if (whiteCount === 0) return true;
  if (!startNode) return false;

  const visited = new Set<string>();
  const queue = [startNode];
  visited.add(`${startNode.r},${startNode.c}`);
  let count = 0;

  while (queue.length > 0) {
    const { r, c } = queue.pop()!;
    count++;

    const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < size && nc >= 0 && nc < size && !grid[nr][nc].isBlack) {
        const key = `${nr},${nc}`;
        if (!visited.has(key)) {
          visited.add(key);
          queue.push({ r: nr, c: nc });
        }
      }
    }
  }

  return count === whiteCount;
}

export function findSlots(grid: Grid): Slot[] {
  const slots: Slot[] = [];
  const size = grid.length;

  // Across
  for (let r = 0; r < size; r++) {
    let c = 0;
    while (c < size) {
      if (grid[r][c].isBlack) {
        c++;
        continue;
      }
      let len = 0;
      let startCol = c;
      while (c < size && !grid[r][c].isBlack) {
        len++;
        c++;
      }
      if (len > 1) { 
        const cells = [];
        for(let k=0; k<len; k++) cells.push({r, c: startCol + k});
        slots.push({ direction: 'across', row: r, col: startCol, length: len, cells });
      }
    }
  }

  // Down
  for (let c = 0; c < size; c++) {
    let r = 0;
    while (r < size) {
      if (grid[r][c].isBlack) {
        r++;
        continue;
      }
      let len = 0;
      let startRow = r;
      while (r < size && !grid[r][c].isBlack) {
        len++;
        r++;
      }
      if (len > 1) {
        const cells = [];
        for(let k=0; k<len; k++) cells.push({r: startRow + k, c});
        slots.push({ direction: 'down', row: startRow, col: c, length: len, cells });
      }
    }
  }

  return slots;
}

export async function fillGrid(grid: Grid, timeoutMs = 1000, opts?: { priorityOnly?: boolean; bannedWords?: Set<string> }): Promise<Grid | null> {
  const startTime = Date.now();
  const slots = findSlots(grid);
  const slotCount = slots.length;

  // Optimization: Pre-calculate intersections
  const intersectionMap: { targetSlot: number; selfCharIdx: number; targetCharIdx: number }[][] = Array.from({ length: slotCount }, () => []);
  const cellToSlotMap = new Map<string, { slotIdx: number; charIdx: number }[]>();

  slots.forEach((slot, sIdx) => {
    slot.cells.forEach((cell, cIdx) => {
      const key = `${cell.r},${cell.c}`;
      if (!cellToSlotMap.has(key)) cellToSlotMap.set(key, []);
      cellToSlotMap.get(key)!.push({ slotIdx: sIdx, charIdx: cIdx });
    });
  });

  slots.forEach((slot, sIdx) => {
    slot.cells.forEach((cell, cIdx) => {
      const key = `${cell.r},${cell.c}`;
      const overlaps = cellToSlotMap.get(key);
      if (overlaps) {
        overlaps.forEach(ov => {
          if (ov.slotIdx !== sIdx) {
            intersectionMap[sIdx].push({
              targetSlot: ov.slotIdx,
              selfCharIdx: cIdx,
              targetCharIdx: ov.charIdx
            });
          }
        });
      }
    });
  });

  // Initial Domain Generation
  const domains: string[][] = [];
  for (const slot of slots) {
      let pattern = "";
      for (const c of slot.cells) {
          pattern += grid[c.r][c.c].value || "_";
      }
      let words = getMatchingWords(pattern);
      // Filter banned words (iterative pruning)
      if (opts?.bannedWords && opts.bannedWords.size > 0) {
        words = words.filter(w => !opts.bannedWords!.has(w));
      }
      if (words.length === 0) {
          debug.log('solver', 'FAIL: slot length=' + pattern.length + ' pattern=' + pattern + ' has 0 candidates');
          return null; // Impossible from start
      }

      domains.push(words);
  }

  // Sort each domain: words with common characters at intersection points come first
  // Persian character commonness scores
  const CHAR_SCORE: Record<string, number> = {
    'ا': 10, 'و': 10, 'ی': 10, 'ن': 8, 'ر': 8, 'م': 8, 'د': 7, 'ب': 7,
    'س': 6, 'ت': 6, 'ک': 5, 'ل': 5, 'گ': 5, 'ه': 4, 'ز': 4, 'ف': 4,
    'ع': 4, 'ح': 3, 'خ': 3, 'چ': 3, 'ش': 3, 'ق': 3, 'آ': 3, 'ج': 3,
    'پ': 3, 'ظ': 1, 'ذ': 1, 'غ': 1, 'ژ': 1, 'ث': 1, 'ص': 1, 'ض': 1, 'ط': 1, '‌': 1
  };
  for (let i = 0; i < slotCount; i++) {
    const constraints = intersectionMap[i];
    if (constraints.length === 0) {
      // Still keep in-category words ahead of the generic fallback pool, but
      // rotate inside each band so the same short words do not win every time.
      const prio = domains[i].filter(w => priorityWordSet.has(w));
      const rest = domains[i].filter(w => !priorityWordSet.has(w));
      shuffleArray(prio);
      shuffleArray(rest);
      domains[i] = prio.concat(rest);
      continue;
    }
    const wordScores = domains[i].map(w => {
      let s = 0;
      for (const c of constraints) s += CHAR_SCORE[w[c.selfCharIdx]] || 0;
      // The priority band must stay wide enough to dominate, but the commonness
      // score is only a light nudge now: with ±0.01 noise against integer
      // scores, every grid floated the same few «نی/می»-class words to the top.
      return { word: w, score: (priorityWordSet.has(w) ? 0 : 1000) - s * 0.15 + Math.random() * 4 };
    });
    wordScores.sort((a, b) => a.score - b.score);
    domains[i] = wordScores.map(ws => ws.word);
  }

  // Log topology
  const slotLens = slots.map(s => s.length).sort((a,b) => a-b);
  const domainSizes = domains.map(d => d.length);
  const minDomain = Math.min(...domainSizes);
  debug.log('solver', 'topology: slots=' + slotCount + ' lens=' + JSON.stringify(slotLens) + ' minDomain=' + minDomain);

  const solution = new Array(slotCount).fill(null);
  const usedWords = new Set<string>();

  let nodesVisited = 0;
  
  // Recursive solver (synchronous for max speed)
  const solve = (): boolean => {
      nodesVisited++;
      if (nodesVisited % 20 === 0) {
          if (Date.now() - startTime > timeoutMs) return false;
      }

      // MRV + Degree Heuristic: Pick slot with fewest candidates AND most constraints
      let bestSlot = -1;
      let bestScore = Infinity;

      for (let i = 0; i < slotCount; i++) {
          if (solution[i] === null) {
              const len = domains[i].length;
              if (len === 0) return false; // Dead end
              const degree = intersectionMap[i].length;
              const score = len / (degree + 1); // Fewer candidates + more connections = better
              if (score < bestScore) {
                  bestScore = score;
                  bestSlot = i;
              }
          }
      }

      if (bestSlot === -1) return true; // All filled

      const candidates = domains[bestSlot];

      for (const word of candidates) {
          if (usedWords.has(word)) continue;

          solution[bestSlot] = word;
          usedWords.add(word);

          // Forward Check
          const oldDomains: Map<number, string[]> = new Map();
          let validAssignment = true;

          const constraints = intersectionMap[bestSlot];
          for (const conn of constraints) {
              const neighborIdx = conn.targetSlot;
              if (solution[neighborIdx] !== null) continue;

              const char = word[conn.selfCharIdx];
              const neighborDomain = domains[neighborIdx];
              
              if (!neighborDomain) continue; // Safety check

              const newNeighborDomain = [];
              for(let k=0; k<neighborDomain.length; k++) {
                  if (neighborDomain[k][conn.targetCharIdx] === char) {
                      newNeighborDomain.push(neighborDomain[k]);
                  }
              }

              if (newNeighborDomain.length === 0) {
                  validAssignment = false;
                  break;
              }

              oldDomains.set(neighborIdx, neighborDomain);
              domains[neighborIdx] = newNeighborDomain;
          }

          if (validAssignment) {
              if (solve()) return true;
          }

          // Backtrack
          for (const [idx, d] of oldDomains) {
              domains[idx] = d;
          }
          solution[bestSlot] = null;
          usedWords.delete(word);
          
          if (Date.now() - startTime > timeoutMs) return false;
      }

      return false;
  };

  let success = solve();
  if (!success) debug.log('solver', 'FAIL timeout=' + timeoutMs + 'ms nodes=' + nodesVisited);

  // If solver found a solution and priorityOnly mode is active, verify only priority words used
  if (success && opts?.priorityOnly !== false && priorityWordSet.size > 0) {
    for (let i = 0; i < slotCount; i++) {
      if (solution[i] && !priorityWordSet.has(solution[i])) {
        console.log('[solver] rejected — non-priority word "' + solution[i] + '" in slot ' + i);
        success = false;
        break;
      }
    }
  }

  if (success) {
      debug.log('solver', 'SUCCESS nodes=' + nodesVisited + ' time=' + (Date.now() - startTime) + 'ms');
      for (let i = 0; i < slotCount; i++) {
          const slot = slots[i];
          const word = solution[i];
          if (word) {
              for (let k = 0; k < slot.length; k++) {
                  grid[slot.cells[k].r][slot.cells[k].c].value = word[k];
              }
          }
      }
      // Final validation: reject grids that still contain empty white cells
      // (e.g. an isolated 1x1 cell that belongs to no slot). Such a cell would
      // otherwise satisfy the win check instantly because both the master value
      // and the (empty) user cell are ''.
      if (!validateFilledGrid(grid)) {
          debug.warn('solver', 'REJECT: grid has empty/isolated white cells after solve');
          return null;
      }
      return grid;
  }

  return null;
}

function shuffleArray(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

/**
 * Validate a solver-filled grid before it is accepted as the game grid.
 * - Every non-black cell must hold a value (no leftover empty cells).
 * - The topology must still be connected and free of isolated cells.
 *
 * Rejecting here prevents a class of false-win bugs: an isolated white cell
 * that belongs to no slot would stay '' and make the win check pass instantly
 * (master value '' === user cell '').
 */
export function validateFilledGrid(grid: Grid): boolean {
  if (!grid || grid.length === 0) return false;
  const size = grid.length;
  for (let r = 0; r < size; r++) {
    const row = grid[r];
    if (!row || row.length !== size) return false;
    for (let c = 0; c < size; c++) {
      const cell = row[c];
      if (!cell) return false;
      if (!cell.isBlack && (!cell.value || cell.value.trim() === '')) return false;
    }
  }
  if (!isConnected(grid)) return false;
  if (hasIsolatedOrShortSlots(grid)) return false;
  return true;
}

export function numberGrid(grid: Grid): { grid: Grid, across: Clue[], down: Clue[] } {
    let counter = 1;
    const size = grid.length;
    const acrossClues: Clue[] = [];
    const downClues: Clue[] = [];

    const newGrid = grid.map(row => row.map(cell => ({...cell, clueNumber: undefined})));

    for(let r=0; r<size; r++) {
        for(let c=0; c<size; c++) {
            if(newGrid[r][c].isBlack) continue;

            let startsAcross = false;
            let startsDown = false;

            if ((c===0 || newGrid[r][c-1].isBlack) && (c+1 < size && !newGrid[r][c+1].isBlack)) {
                startsAcross = true;
            }

            if ((r===0 || newGrid[r-1][c].isBlack) && (r+1 < size && !newGrid[r+1][c].isBlack)) {
                startsDown = true;
            }

            if(startsAcross || startsDown) {
                newGrid[r][c].clueNumber = counter;
                if (startsAcross) {
                    let w = ''; 
                    let cells = [];
                    let k = c; 
                    while(k<size && !newGrid[r][k].isBlack) { 
                        w += newGrid[r][k].value; 
                        cells.push({r, c: k});
                        k++; 
                    }
                    acrossClues.push({ number: counter, word: w, translation: '', direction: 'across', cells });
                }
                if (startsDown) {
                    let w = ''; 
                    let cells = [];
                    let k = r; 
                    while(k<size && !newGrid[k][c].isBlack) { 
                        w += newGrid[k][c].value; 
                        cells.push({r: k, c});
                        k++; 
                    }
                    downClues.push({ number: counter, word: w, translation: '', direction: 'down', cells });
                }
                counter++;
            }
        }
    }
    return { grid: newGrid, across: acrossClues, down: downClues };
}
