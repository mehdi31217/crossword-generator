import { loadCategory, priorityWordSet } from '../utils/dictionary';
import { createEmptyGrid, fillGrid } from '../utils/gridLogic';

loadCategory('food', 'fa', [], []);

const normWord = (s: string) => s.toUpperCase().replace(/[\s-]/g,'').replace(/[آأإ]/g,'ا').replace(/[ئي]/g,'ی').replace(/ك/g,'ک');

function extractWords(grid: any[][]): string[] {
  const size = grid.length;
  const words: string[] = [];
  for (let r = 0; r < size; r++) {
    let c = 0;
    while (c < size) {
      if (grid[r][c].isBlack) { c++; continue; }
      let word = '';
      while (c < size && !grid[r][c].isBlack) { word += (grid[r][c].value || ''); c++; }
      if (word.length >= 2) words.push(normWord(word));
    }
  }
  for (let c = 0; c < size; c++) {
    let r = 0;
    while (r < size) {
      if (grid[r][c].isBlack) { r++; continue; }
      let word = '';
      while (r < size && !grid[r][c].isBlack) { word += (grid[r][c].value || ''); r++; }
      if (word.length >= 2) words.push(normWord(word));
    }
  }
  return words;
}

function measurePurity(grid: any[][]): number {
  const words = extractWords(grid);
  if (words.length === 0) return 0;
  return words.filter(w => priorityWordSet.has(w)).length / words.length;
}

async function testBestOfN(size: number, N: number, timeout: number, trials: number) {
  const allPurities: number[] = [];
  let successes = 0;
  for (let t = 0; t < trials; t++) {
    let bestPurity = 0;
    for (let i = 0; i < N; i++) {
      const grid = createEmptyGrid(size);
      const result = await fillGrid(grid, timeout, { priorityOnly: false });
      if (result) {
        const p = measurePurity(result);
        if (p > bestPurity) bestPurity = p;
        if (p >= 0.95) break;
      }
    }
    if (bestPurity > 0) {
      allPurities.push(Math.round(bestPurity * 100));
      successes++;
    }
  }
  return { purities: allPurities, successes, trials };
}

async function main() {
  console.log('FOOD_FA: ' + priorityWordSet.size + ' priority words');
  console.log('=== BEST-OF-N TEST (matches useGameLogic.ts) ===');
  console.log('');
  for (const size of [5, 6, 7, 8, 9, 10]) {
    const N = size <= 6 ? 20 : size <= 8 ? 30 : 40;
    const timeout = size >= 9 ? 5000 : size >= 7 ? 4000 : 3000;
    console.log('--- ' + size + 'x' + size + ' (N=' + N + ', timeout=' + timeout + 'ms) ---');
    const r = await testBestOfN(size, N, timeout, 3);
    if (r.purities.length > 0) {
      const avg = Math.round(r.purities.reduce((s,v) => s+v, 0) / r.purities.length);
      const best = Math.max(...r.purities);
      console.log('  Results: [' + r.purities.join(', ') + ']');
      console.log('  Best: ' + best + '% | Avg: ' + avg + '% | Success: ' + r.successes + '/' + r.trials);
    } else {
      console.log('  FAILED all ' + r.trials + ' attempts');
    }
    console.log('');
  }
}

main().catch(console.error);
