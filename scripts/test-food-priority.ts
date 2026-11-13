// Test: generate grids for FOOD_FA category, measure priority-word percentage
import { loadCategory, priorityWordSet, getClueForWord } from '../utils/dictionary';
import { createEmptyGrid, fillGrid } from '../utils/gridLogic';

loadCategory('food', 'fa', [], []);

async function testSize(size: number, attempts: number): Promise<void> {
  let prioritySuccess = 0;
  let fallbackCount = 0;
  let totalWords = 0;
  let priorityWords = 0;
  const results: { success: boolean; pct: number; words: number; priority: number }[] = [];

  for (let i = 0; i < attempts; i++) {
    // Phase 1: priority-only
    const grid1 = createEmptyGrid(size);
    const result1 = await fillGrid(grid1, 4000, { priorityOnly: true });

    if (result1) {
      // Count priority vs total words
      const words = new Set<string>();
      for (const row of result1) {
        for (const cell of row) {
          if (cell.value) words.add(cell.value);
        }
      }
      // Actually, we need to count SLOT words, not individual cells
      // Let's use the solver's slot-based approach differently
      // The grid's values are stored per cell; we can reconstruct words from connected cells

      const gridWords = extractWords(result1);
      const pCount = gridWords.filter(w => priorityWordSet.has(w)).length;
      const pct = Math.round(pCount / gridWords.length * 100);

      results.push({ success: true, pct, words: gridWords.length, priority: pCount });
      prioritySuccess++;
      totalWords += gridWords.length;
      priorityWords += pCount;
    } else {
      // Phase 2: fallback (full pool)
      const grid2 = createEmptyGrid(size);
      const result2 = await fillGrid(grid2, 6000, { priorityOnly: false });
      if (result2) {
        const gridWords = extractWords(result2);
        const pCount = gridWords.filter(w => priorityWordSet.has(w)).length;
        const pct = Math.round(pCount / gridWords.length * 100);
        results.push({ success: true, pct, words: gridWords.length, priority: pCount });
        fallbackCount++;
        totalWords += gridWords.length;
        priorityWords += pCount;
      } else {
        results.push({ success: false, pct: 0, words: 0, priority: 0 });
      }
    }
  }

  console.log(`\n=== ${size}×${size} (${attempts} attempts) ===`);
  console.log(`  Priority-only success: ${prioritySuccess}/${attempts}`);
  if (fallbackCount > 0) console.log(`  Fallback needed: ${fallbackCount}/${attempts}`);

  if (results.filter(r => r.success).length > 0) {
    const avgPct = results.filter(r => r.success).reduce((s, r) => s + r.pct, 0) / results.filter(r => r.success).length;
    const overallPct = totalWords > 0 ? Math.round(priorityWords / totalWords * 100) : 0;
    console.log(`  Avg category-pure: ${avgPct.toFixed(1)}% (overall ${overallPct}%)`);
    results.forEach((r, i) => {
      if (r.success) console.log(`  Grid #${i+1}: ${r.priority}/${r.words} priority (${r.pct}%)`);
      else console.log(`  Grid #${i+1}: FAILED (no grid generated)`);
    });
  }

  return;
}

function extractWords(grid: any[][]): string[] {
  const size = grid.length;
  const words: Set<string> = new Set();
  const visited = new Set<string>();

  // Find across words
  for (let r = 0; r < size; r++) {
    let c = 0;
    while (c < size) {
      if (grid[r][c].isBlack) { c++; continue; }
      let word = '';
      const startC = c;
      while (c < size && !grid[r][c].isBlack) {
        word += grid[r][c].value || '';
        c++;
      }
      if (word.length >= 2) words.add(word);
    }
  }

  // Find down words
  for (let c = 0; c < size; c++) {
    let r = 0;
    while (r < size) {
      if (grid[r][c].isBlack) { r++; continue; }
      let word = '';
      const startR = r;
      while (r < size && !grid[r][c].isBlack) {
        word += grid[r][c].value || '';
        r++;
      }
      if (word.length >= 2) words.add(word);
    }
  }

  return Array.from(words);
}

async function main() {
  console.log('FOOD_FA priority pool: ' + priorityWordSet.size + ' words loaded');
  console.log('=== GRID GENERATION TEST ===');

  for (let size = 5; size <= 10; size++) {
    await testSize(size as any, 5);
  }
}

main().catch(console.error);
