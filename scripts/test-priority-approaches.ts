// Compare approaches: bestOfN vs no-len2 topology for FOOD_FA
import { loadCategory, priorityWordSet } from '../utils/dictionary';
import { createEmptyGrid, fillGrid, findSlots } from '../utils/gridLogic';

loadCategory('food', 'fa', [], []);

function extractWords(grid: any[][]): string[] {
  const size = grid.length;
  const words: string[] = [];
  for (let r = 0; r < size; r++) {
    let c = 0;
    while (c < size) {
      if (grid[r][c].isBlack) { c++; continue; }
      let word = '';
      while (c < size && !grid[r][c].isBlack) { word += grid[r][c].value || ''; c++; }
      if (word.length >= 2) words.push(word);
    }
  }
  for (let c = 0; c < size; c++) {
    let r = 0;
    while (r < size) {
      if (grid[r][c].isBlack) { r++; continue; }
      let word = '';
      while (r < size && !grid[r][c].isBlack) { word += grid[r][c].value || ''; r++; }
      if (word.length >= 2) words.push(word);
    }
  }
  return words;
}

function measurePurity(grid: any[][]): number {
  const words = extractWords(grid);
  const pCount = words.filter(w => priorityWordSet.has(w)).length;
  return words.length > 0 ? pCount / words.length : 0;
}

// --- No-len2 topology generator ---
function hasLen2Slots(grid: any[][]): boolean {
  const slots = findSlots(grid);
  return slots.some(s => s.length === 2);
}

function isConnected(grid: any[][]): boolean {
  const size = grid.length;
  let start: any = null, white = 0;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!grid[r][c].isBlack) { white++; if (!start) start = { r, c }; }
    }
  }
  if (white === 0) return true;
  if (!start) return false;
  const visited = new Set<string>();
  const queue = [start];
  visited.add(`${start.r},${start.c}`);
  let count = 0;
  while (queue.length > 0) {
    const { r, c } = queue.pop()!;
    count++;
    for (const [dr, dc] of [[0,1],[0,-1],[1,0],[-1,0]]) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < size && nc >= 0 && nc < size && !grid[nr][nc].isBlack) {
        const k = `${nr},${nc}`;
        if (!visited.has(k)) { visited.add(k); queue.push({ r: nr, c: nc }); }
      }
    }
  }
  return count === white;
}

function hasIsolatedCell(grid: any[][]): boolean {
  const size = grid.length;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!grid[r][c].isBlack) {
        const h = (c > 0 && !grid[r][c-1].isBlack) || (c < size-1 && !grid[r][c+1].isBlack);
        const v = (r > 0 && !grid[r-1][c].isBlack) || (r < size-1 && !grid[r+1][c].isBlack);
        if (!h && !v) return true;
      }
    }
  }
  return false;
}

function createGridNoLen2(size: number): any[][] | null {
  for (let attempt = 0; attempt < 300; attempt++) {
    const grid: any[][] = Array(size).fill(null).map((_, r) =>
      Array(size).fill(null).map((_, c) => ({ row: r, col: c, value: '', isBlack: false }))
    );
    const ratio = size <= 5 ? 0.25 : size <= 6 ? 0.28 : size <= 7 ? 0.30 : size <= 8 ? 0.33 : 0.36;
    const target = Math.floor(size * size * ratio);
    let placed = 0, att = 0;
    while (placed < target && att < 600) {
      att++;
      const r = Math.floor(Math.random() * size);
      const c = Math.floor(Math.random() * size);
      if (grid[r][c].isBlack) continue;
      grid[r][c].isBlack = true;
      let added = 1;
      const sr = size - 1 - r, sc = size - 1 - c;
      if (!grid[sr][sc].isBlack) { grid[sr][sc].isBlack = true; added++; }
      placed += added;
    }
    if (!isConnected(grid) || hasIsolatedCell(grid) || hasLen2Slots(grid)) continue;
    return grid;
  }
  return null;
}

// --- Best-of-N with normal topology ---
async function bestOfN(size: number, N: number, timeout: number): Promise<{ purity: number; grid: any[][] | null }> {
  let bestPurity = 0;
  let bestGrid: any[][] | null = null;
  for (let i = 0; i < N; i++) {
    const grid = createEmptyGrid(size);
    const result = await fillGrid(grid, timeout, { priorityOnly: false });
    if (result) {
      const p = measurePurity(result);
      if (p > bestPurity) { bestPurity = p; bestGrid = result; }
    }
  }
  return { purity: bestPurity, grid: bestGrid };
}

// --- No-len2 with solver ---
async function noLen2Solver(size: number, timeout: number): Promise<{ purity: number; grid: any[][] | null }> {
  for (let i = 0; i < 10; i++) {
    const grid = createGridNoLen2(size);
    if (!grid) continue;
    const result = await fillGrid(grid, timeout, { priorityOnly: false });
    if (result) {
      const p = measurePurity(result);
      return { purity: p, grid: result };
    }
  }
  return { purity: 0, grid: null };
}

async function main() {
  console.log('FOOD_FA priority pool: ' + priorityWordSet.size + ' words');
  console.log('========================================');
  console.log('METHOD A: best-of-10 (normal topology, 10 attempts, pick best purity)');
  console.log('METHOD B: no-len2 topology + solver\n');

  for (const size of [5, 6, 7, 8, 9, 10]) {
    const timeout = size >= 9 ? 5000 : size >= 7 ? 4000 : 3000;
    const resultsA: number[] = [];
    const resultsB: number[] = [];
    const successA: number[] = [];
    const successB: number[] = [];

    // Run each 5 times for statistical validity
    for (let run = 0; run < 5; run++) {
      // Method A
      const a = await bestOfN(size, 10, timeout);
      if (a.grid) { successA.push(a.purity); resultsA.push(Math.round(a.purity * 100)); }
      // Method B
      const b = await noLen2Solver(size, timeout);
      if (b.grid) { successB.push(b.purity); resultsB.push(Math.round(b.purity * 100)); }
    }

    const avgA = resultsA.length > 0 ? Math.round(resultsA.reduce((s, v) => s + v, 0) / resultsA.length) : 0;
    const avgB = resultsB.length > 0 ? Math.round(resultsB.reduce((s, v) => s + v, 0) / resultsB.length) : 0;
    const maxA = resultsA.length > 0 ? Math.max(...resultsA) : 0;
    const maxB = resultsB.length > 0 ? Math.max(...resultsB) : 0;

    console.log(`--- ${size}×${size} ---`);
    console.log(`  A (bestOf10): ${successA.length}/5 grids | avg ${avgA}% purity | best ${maxA}%`);
    if (resultsA.length > 0) console.log(`    purities: [${resultsA.join(', ')}]`);
    console.log(`  B (noLen2):   ${successB.length}/5 grids | avg ${avgB}% purity | best ${maxB}%`);
    if (resultsB.length > 0) console.log(`    purities: [${resultsB.join(', ')}]`);
    if (resultsB.length === 0) console.log(`    (no-len2 topology impossible for ${size}×${size})`);
  }
}

main().catch(console.error);
