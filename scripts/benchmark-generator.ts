/**
 * Grid Generation Benchmark
 * Tests all categories × sizes 5-10 × 10 attempts each
 * Reports: success rate, purity, time per attempt
 *
 * Usage: npx tsx scripts/benchmark-generator.ts
 */
import { fillGrid, createEmptyGrid } from '../utils/gridLogic';
import { loadCategory, priorityWordSet } from '../utils/dictionary';
import type { Category, DictionaryEntry, Language } from '../types';

const CATEGORIES: Category[] = [
  'general', 'movies', 'cities', 'knowledge', 'food',
  'body', 'jobs', 'tech', 'nature', 'sports', 'art'
];

const SIZES = [5, 6, 7, 8, 9, 10];
const ATTEMPTS = 1;
const LANGUAGE: Language = 'fa';
const API_BASE = 'http://localhost:8081';

// Fetch words from the running server
async function fetchWords(category: Category): Promise<{ dbWords: DictionaryEntry[]; glueWords: DictionaryEntry[] }> {
  const dbRes = await fetch(`${API_BASE}/api/words/category/${category}`);
  const dbWords: DictionaryEntry[] = await dbRes.json();
  const glueRes = await fetch(`${API_BASE}/api/words/glue/${category}`);
  const glueWords: DictionaryEntry[] = await glueRes.json();
  return { dbWords, glueWords };
}

// Extract words from a filled grid for purity measurement
function extractWords(g: any[][]): string[] {
  const size = g.length;
  const words: string[] = [];
  const normWord = (s: string) => s.toUpperCase().replace(/[\s-]/g,'').replace(/[آأإ]/g,'ا').replace(/[ئي]/g,'ی').replace(/ك/g,'ک');

  for (let r = 0; r < size; r++) {
    let c = 0;
    while (c < size) {
      if (g[r][c].isBlack) { c++; continue; }
      let word = '';
      while (c < size && !g[r][c].isBlack) { word += (g[r][c].value || ''); c++; }
      if (word.length >= 2) words.push(normWord(word));
    }
  }

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
}

function measurePurity(g: any[][]): number {
  const words = extractWords(g);
  if (words.length === 0) return 0;
  const pCount = words.filter(w => priorityWordSet.has(w)).length;
  return pCount / words.length;
}

interface BenchmarkResult {
  category: Category;
  size: number;
  successCount: number;
  totalAttempts: number;
  phase1Successes: number;
  phase1Attempts: number;
  phase2Successes: number;
  phase2Attempts: number;
  fallbackCount: number;
  purities: number[];
  times: number[];
  avgPurity: number;
  avgTime: number;
  minPurity: number;
  maxPurity: number;
}

async function runBenchmark(): Promise<void> {
  console.log('=== GRID GENERATION BENCHMARK ===');
  console.log(`Categories: ${CATEGORIES.length}, Sizes: ${SIZES.length}, Attempts per combo: ${ATTEMPTS}`);
  console.log(`Total runs: ${CATEGORIES.length * SIZES.length * ATTEMPTS}\n`);

  const allResults: BenchmarkResult[] = [];

  for (const category of CATEGORIES) {
    console.log(`\n========== CATEGORY: ${category} ==========`);

    // Load word data for this category
    console.log(`  Loading words...`);
    const { dbWords, glueWords } = await fetchWords(category);
    console.log(`  dbWords: ${dbWords.length}, glueWords: ${glueWords.length}`);

    for (const targetSize of SIZES) {
      console.log(`\n  --- Size ${targetSize} ---`);

      const result: BenchmarkResult = {
        category,
        size: targetSize,
        successCount: 0,
        totalAttempts: 0,
        phase1Successes: 0,
        phase1Attempts: 0,
        phase2Successes: 0,
        phase2Attempts: 0,
        fallbackCount: 0,
        purities: [],
        times: [],
        avgPurity: 0,
        avgTime: 0,
        minPurity: 0,
        maxPurity: 0,
      };

      for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
        // Reload words for each attempt (clean state)
        loadCategory(category, LANGUAGE, dbWords, glueWords);

        const sizeRetries = targetSize <= 6 ? 25 : targetSize <= 8 ? 40 : 30;
        const maxRetries = sizeRetries;
        const sizeTimeout = targetSize <= 6 ? 1000 : targetSize <= 8 ? 1500 : 2000;
        const timeoutPerAttempt = sizeTimeout;
        const HIGH_PURITY_TARGET = 0.60;
        const bannedWords = new Set<string>();
        let pruneCount = 0;
        let successGrid: any[][] | null = null;
        let bestPurity = 0;
        let bestCandidate: any[][] | null = null;
        let usedFallback = false;
        let startTime = Date.now();

        // Single phase with iterative supplement pruning
        for (let i = 1; i <= maxRetries; i++) {
          result.phase2Attempts++;
          result.totalAttempts++;
          const candidate = await fillGrid(createEmptyGrid(targetSize), timeoutPerAttempt, { priorityOnly: false, bannedWords });
          if (candidate) {
            const purity = measurePurity(candidate);
            if (priorityWordSet.size === 0 || purity >= HIGH_PURITY_TARGET) {
              successGrid = candidate;
              bestPurity = purity;
              result.phase2Successes++;
              break;
            }
            if (purity > bestPurity) {
              bestPurity = purity;
              bestCandidate = candidate;
            }
            // Iterative supplement pruning
            if (pruneCount < 15 && purity > 0) {
              const words = extractWords(candidate);
              for (const w of words) {
                if (!priorityWordSet.has(w)) bannedWords.add(w);
              }
              pruneCount++;
            }
          }
        }

        // Fallback
        if (!successGrid && (priorityWordSet.size === 0 || bestPurity >= 0.35) && bestCandidate) {
          successGrid = bestCandidate;
          usedFallback = true;
          result.fallbackCount++;
        }

        const elapsed = Date.now() - startTime;
        result.times.push(elapsed);

        if (successGrid) {
          const purity = measurePurity(successGrid);
          result.purities.push(purity);
          result.successCount++;
          console.log(`    [${attempt}/${ATTEMPTS}] ✅ purity=${(purity*100).toFixed(0)}% time=${elapsed}ms${usedFallback ? ' (fallback)' : ''} cat=${category} sz=${targetSize}`);
        } else {
          console.log(`    [${attempt}/${ATTEMPTS}] ❌ FAILED time=${elapsed}ms cat=${category} sz=${targetSize}`);
        }
      }

      // Calculate averages
      if (result.purities.length > 0) {
        result.avgPurity = result.purities.reduce((a, b) => a + b, 0) / result.purities.length;
        result.minPurity = Math.min(...result.purities);
        result.maxPurity = Math.max(...result.purities);
      }
      result.avgTime = result.times.length > 0 ? result.times.reduce((a, b) => a + b, 0) / result.times.length : 0;

      allResults.push(result);

      // Print summary for this (category, size)
      console.log(`  => success=${result.successCount}/${ATTEMPTS} purity=${(result.avgPurity*100).toFixed(0)}% avg=${result.avgTime.toFixed(0)}ms`);
    }
  }

  // === SUMMARY TABLE ===
  console.log('\n\n========== SUMMARY TABLE ==========');
  console.log('Cat'.padEnd(12) + 'Sz'.padEnd(4) + 'OK'.padEnd(4) + 'Fall'.padEnd(5) + 'Avg%'.padEnd(6) + 'Min%'.padEnd(6) + 'Max%'.padEnd(6) + 'AvgMs'.padEnd(8) + 'Ph1OK'.padEnd(6) + 'Ph2OK'.padEnd(6));
  console.log('-'.repeat(65));

  let totalSuccess = 0;
  let totalRuns = 0;
  let grandPuritySum = 0;
  let grandPurityCount = 0;

  for (const r of allResults) {
    const purityStr = r.purities.length > 0 ? (r.avgPurity * 100).toFixed(0) : '-';
    const minStr = r.purities.length > 0 ? (r.minPurity * 100).toFixed(0) : '-';
    const maxStr = r.purities.length > 0 ? (r.maxPurity * 100).toFixed(0) : '-';
    console.log(
      r.category.padEnd(12) +
      String(r.size).padEnd(4) +
      String(r.successCount).padEnd(4) +
      String(r.fallbackCount).padEnd(5) +
      String(purityStr).padEnd(6) +
      String(minStr).padEnd(6) +
      String(maxStr).padEnd(6) +
      r.avgTime.toFixed(0).padEnd(8) +
      String(r.phase1Successes).padEnd(6) +
      String(r.phase2Successes).padEnd(6)
    );
    totalSuccess += r.successCount;
    totalRuns += ATTEMPTS;
    grandPuritySum += r.purities.reduce((a, b) => a + b, 0);
    grandPurityCount += r.purities.length;
  }

  console.log('-'.repeat(65));
  console.log(`Total success: ${totalSuccess}/${totalRuns} (${(totalSuccess/totalRuns*100).toFixed(0)}%)`);
  console.log(`Overall avg purity: ${grandPurityCount > 0 ? (grandPuritySum/grandPurityCount*100).toFixed(0) : '-'}%`);
}

runBenchmark().catch(console.error);
