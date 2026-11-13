/**
 * Quick benchmark — no server needed, 1 attempt per combo
 * Run: node scripts/benchmark-fast.mjs
 */
import { fillGrid, createEmptyGrid } from '../utils/gridLogic.ts';
import { loadCategory, priorityWordSet } from '../utils/dictionary.ts';

const CATEGORIES = ['general','movies','cities','knowledge','food','body','jobs','tech','nature','sports','art'];
const SIZES = [5,6,7,8,9,10];

function extractWords(g) {
  const size = g.length;
  const words = [];
  const normWord = (s) => s.toUpperCase().replace(/[\s-]/g,'').replace(/[آأإ]/g,'ا').replace(/[ئي]/g,'ی').replace(/ك/g,'ک');
  for (let r = 0; r < size; r++) {
    let c = 0;
    while (c < size) { if (g[r][c].isBlack) { c++; continue; } let word = ''; while (c < size && !g[r][c].isBlack) { word += (g[r][c].value || ''); c++; } if (word.length >= 2) words.push(normWord(word)); }
  }
  for (let c = 0; c < size; c++) {
    let r = 0;
    while (r < size) { if (g[r][c].isBlack) { r++; continue; } let word = ''; while (r < size && !g[r][c].isBlack) { word += (g[r][c].value || ''); r++; } if (word.length >= 2) words.push(normWord(word)); }
  }
  return words;
}

function measurePurity(g) {
  const words = extractWords(g);
  if (words.length === 0) return 0;
  return words.filter(w => priorityWordSet.has(w)).length / words.length;
}

async function runBench() {
  console.log('=== GRID GENERATION BENCHMARK ===');
  const allResults = [];

  for (const cat of CATEGORIES) {
    console.log(`\n--- ${cat} ---`);
    loadCategory(cat, 'fa', [], []);

    for (const size of SIZES) {
      const maxRetries = size <= 6 ? 25 : size <= 8 ? 40 : 30;
      const timeoutMs = size <= 6 ? 1000 : size <= 8 ? 1500 : 2000;
      const HIGH_PURITY_TARGET = 0.6;
      const bannedWords = new Set();
      // Frequency-based: only ban supplements appearing in >=2 solutions
      const supplementFreq = new Map();
      const MAX_PRUNE_CYCLES = Math.min(15, Math.floor(maxRetries * 0.4));
      let pruneCount = 0;
      let successGrid = null, bestPurity = 0, bestCandidate = null, fallback = false;
      const start = Date.now();

      let attempts = 0;
      for (let i = 1; i <= maxRetries; i++) {
        attempts++;
        const cand = await fillGrid(createEmptyGrid(size), timeoutMs, { priorityOnly: false, bannedWords });
        if (cand) {
          const p = measurePurity(cand);
          if (priorityWordSet.size === 0 || p >= HIGH_PURITY_TARGET) {
            successGrid = cand; bestPurity = p; break;
          }
          if (p > bestPurity) { bestPurity = p; bestCandidate = cand; }
          // Frequency-based: ban supplements that appear in >=2 different low-purity solutions
          if (pruneCount < MAX_PRUNE_CYCLES && p > 0) {
            const words = extractWords(cand);
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
      if (!successGrid && (priorityWordSet.size === 0 || bestPurity >= 0.35) && bestCandidate) {
        successGrid = bestCandidate; fallback = true;
      }

      const elapsed = Date.now() - start;
      const purity = successGrid ? measurePurity(successGrid) : 0;
      const pct = (purity*100).toFixed(0);
      const status = successGrid ? `✅ purity=${pct}%` : `❌ FAILED`;
      console.log(`  ${size}×${size}: ${status} time=${elapsed}ms att=${attempts}${fallback ? ' fallback' : ''}`);
      allResults.push({ cat, size, ok: !!successGrid, purity, elapsed, attempts, fallback });
    }
  }

  console.log('\n\n─── SUMMARY ───');
  console.log('Cat'.padEnd(12)+'Sz'.padEnd(4)+'OK'.padEnd(4)+'Avg%'.padEnd(6)+'Min%'.padEnd(6)+'Max%'.padEnd(6)+'AvgMs'.padEnd(8)+'Atts'.padEnd(6)+'Fall');
  console.log('─'.repeat(56));

  const catResults = {};
  for (const r of allResults) {
    if (!catResults[r.cat]) catResults[r.cat] = { results: [], totalOK: 0, totalPurity: 0, purityCount: 0, totalTime: 0, totalAtts: 0, fallbacks: 0 };
    catResults[r.cat].results.push(r);
    if (r.ok) { catResults[r.cat].totalOK++; catResults[r.cat].totalPurity += r.purity; catResults[r.cat].purityCount++; }
    catResults[r.cat].totalTime += r.elapsed;
    catResults[r.cat].totalAtts += r.attempts;
    if (r.fallback) catResults[r.cat].fallbacks++;
  }

  let grandOK = 0, grandTotal = 0, grandPuritySum = 0, grandPurityCount = 0;

  for (const [cat, cr] of Object.entries(catResults)) {
    const avgPct = cr.purityCount > 0 ? (cr.totalPurity/cr.purityCount*100).toFixed(0) : '-';
    const minPct = cr.purityCount > 0 ? (Math.min(...cr.results.filter(r=>r.ok).map(r=>r.purity*100))).toFixed(0) : '-';
    const maxPct = cr.purityCount > 0 ? (Math.max(...cr.results.filter(r=>r.ok).map(r=>r.purity*100))).toFixed(0) : '-';
    const avgMs = (cr.totalTime / cr.results.length).toFixed(0);
    const okStr = cr.totalOK + '/' + cr.results.length;
    const cls = cr.totalOK === cr.results.length ? '' : cr.totalOK > 0 ? ' (partial)' : ' (FAILED)';
    console.log(`${cat.padEnd(12)} ${okStr.padEnd(4)} ${avgPct.padEnd(5)}% ${minPct.padEnd(5)}% ${maxPct.padEnd(5)}% ${avgMs.padEnd(8)}ms ${String(cr.totalAtts).padEnd(6)} ${cr.fallbacks}${cls}`);
    grandOK += cr.totalOK; grandTotal += cr.results.length;
    for (const r of cr.results) { if (r.ok) { grandPuritySum += r.purity; grandPurityCount++; } }
  }

  console.log('─'.repeat(72));
  const rate = (grandOK/grandTotal*100).toFixed(0);
  const overall = grandPurityCount > 0 ? (grandPuritySum/grandPurityCount*100).toFixed(0) : '-';
  console.log(`✅ ${grandOK}/${grandTotal} (${rate}%) avg purity=${overall}%`);
}

runBench().catch(console.error);
