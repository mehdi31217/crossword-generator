/**
 * Measures how much of a generated grid actually comes from its own category.
 *
 * Mirrors the real `generateGrid` loop in hooks/useGameLogic.ts (best-of-N,
 * 60% priority target, frequency pruning, 35% fallback) so the numbers reflect
 * what a player sees — not an idealized run.
 *
 * Usage:
 *   npx esbuild scripts/word-purity.ts --bundle --platform=node --format=cjs \
 *     --outfile=/tmp/word-purity.cjs && node /tmp/word-purity.cjs [--sizes=5,7,10] [--rounds=2]
 */
import fs from 'fs';
import path from 'path';
import { loadCategory, priorityWordSet } from '../utils/dictionary';
import { createEmptyGrid, fillGrid } from '../utils/gridLogic';
import { MASSIVE_GLUE_FA } from '../utils/glueWords';
import { CATEGORY_GLUE_MAP_FA } from '../data/glueWords';
import { SHORT_EXTRA_MAP } from '../data/glueWordsExtra';
import * as WL from '../data/wordLists';
import { SHAHNAMEH_FA } from '../data/shahnamehWords';

// The bundle runs from /tmp, so resolve data files from the repo cwd.
const ROOT = process.cwd();
// `--api` measures what a player actually receives: the live server's word
// pools. Without it the harness reads the seed JSON, which can lag the DB.
const USE_API = process.argv.includes('--api');
const API = process.env.CW_API || 'http://127.0.0.1:8081';

type Entry = { word: string; clue: string; category?: string; language?: string };

let DICT: Entry[] = [];
let GLUE: Entry[] = [];

async function loadCorpus(cats: string[]): Promise<void> {
  if (!USE_API) {
    DICT = JSON.parse(fs.readFileSync(path.join(ROOT, 'server/local-data/dictionary.json'), 'utf-8'));
    GLUE = JSON.parse(fs.readFileSync(path.join(ROOT, 'server/local-data/glue_dictionary.json'), 'utf-8'));
    return;
  }
  const get = async (route: string, cat: string): Promise<Entry[]> => {
    const res = await fetch(`${API}/api/${route}?category=${cat}&language=fa&limit=10000`);
    if (!res.ok) throw new Error(`${route}/${cat} → HTTP ${res.status}`);
    return (await res.json()) as Entry[];
  };
  const dict: Entry[] = [];
  const glue: Entry[] = [];
  for (const cat of cats) {
    const [d, g] = await Promise.all([get('dictionary', cat), get('glue-dictionary', cat)]);
    dict.push(...d.map((e) => ({ ...e, category: cat })));
    glue.push(...g.map((e) => ({ ...e, category: cat })));
    process.stdout.write(`  api ${cat}: dictionary=${d.length} glue=${g.length}\n`);
  }
  DICT = dict;
  GLUE = glue;
}

const norm = (s: string) =>
  s.toUpperCase().replace(/[\s-]/g, '')
    .replace(/[آأإ]/g, 'ا').replace(/ئ/g, 'ی').replace(/ي/g, 'ی').replace(/ك/g, 'ک');

const LOCAL_BY_CAT: Record<string, Entry[]> = {
  movies: WL.MOVIES_FA, food: WL.FOOD_FA, cities: WL.CITIES_FA, nature: WL.NATURE_FA,
  knowledge: WL.KNOWLEDGE_FA, body: WL.BODY_FA, tech: WL.TECH_FA, jobs: WL.JOBS_FA,
  history: WL.HISTORY_FA, sports: WL.SPORTS_FA, art: WL.ART_FA, shahnameh: SHAHNAMEH_FA,
};

const CATEGORIES = ['knowledge', 'movies', 'food', 'cities', 'body', 'jobs', 'tech', 'nature', 'history', 'sports', 'art', 'shahnameh'];
const SIZES = [5, 6, 7, 8, 9, 10];

const genericGlue = new Set(MASSIVE_GLUE_FA.map(e => norm(e.word)));

// Leaked (non-own) words counted by length, aggregated over the whole run.
// The solver only leaves a category when a slot length has no usable in-category
// word, so this histogram says exactly which length pools are too thin.
const LEAK = new Map<number, number>();
// Every word placed in a grid, by length: the solver's real demand per slot
// length. leak/total at a length is the share of that length the category could
// not serve itself -- the number that says whether more words can help at all.
const DEMAND = new Map<number, number>();
// Per-category leak histogram + that category's own-priority pool per length,
// so a leak column can be read next to the pool it should have come from.
const LEAK_BY_CAT = new Map<string, Map<number, number>>();
const POOL_LEN = new Map<string, number[]>();

function dbWordsFor(cat: string): Entry[] {
  return (DICT as Entry[]).filter(e => e.category === cat && e.language === 'fa' && !/[a-zA-Z]/.test(e.word) && !e.word.includes(' '));
}
function dbGlueFor(cat: string): Entry[] {
  return (GLUE as Entry[]).filter(e => e.category === cat && e.language === 'fa');
}

/** The pool the player would consider "this category's own words". */
function ownPoolFor(cat: string, dbWords: Entry[]): Set<string> {
  const base = dbWords.length > 0 ? dbWords : (LOCAL_BY_CAT[cat] || []);
  return new Set([...base, ...(LOCAL_BY_CAT[cat] || [])].map(e => norm(e.word)));
}
function catGlueFor(cat: string, glueWords: Entry[]): Set<string> {
  return new Set([
    ...glueWords.map(e => norm(e.word)),
    ...(SHORT_EXTRA_MAP as any)[cat] ? ((SHORT_EXTRA_MAP as any)[cat] as Entry[]).map(e => norm(e.word)) : [],
    ...((CATEGORY_GLUE_MAP_FA as any)[cat] || []).map((e: Entry) => norm(e.word)),
  ]);
}

function extractWords(g: any[][]): string[] {
  const size = g.length;
  const words: string[] = [];
  for (let r = 0; r < size; r++) {
    let c = 0;
    while (c < size) {
      if (g[r][c].isBlack) { c++; continue; }
      let w = '';
      while (c < size && !g[r][c].isBlack) { w += (g[r][c].value || ''); c++; }
      if (w.length >= 2) words.push(norm(w));
    }
  }
  for (let c = 0; c < size; c++) {
    let r = 0;
    while (r < size) {
      if (g[r][c].isBlack) { r++; continue; }
      let w = '';
      while (r < size && !g[r][c].isBlack) { w += (g[r][c].value || ''); r++; }
      if (w.length >= 2) words.push(norm(w));
    }
  }
  return words;
}

async function generateOne(size: number): Promise<any[][] | null> {
  const maxRetries = size <= 6 ? 25 : size <= 8 ? 40 : 30;
  const timeoutMs = size <= 6 ? 1000 : size <= 8 ? 1500 : 2000;
  const TARGET = 0.60;
  // Offline experiment only: `--max2=N` refuses any candidate whose topology
  // leaves more than N two-letter slots. A 32% black ratio chops a 10x10 into
  // runs of two, and Persian has no thematic 2-letter inventory to fill them.
  const MAX2 = Number(process.env.CW_MAX2 || 0) || Infinity;
  const banned = new Set<string>();
  const freq = new Map<string, number>();
  let best: any[][] | null = null;
  let bestPurity = 0;
  const maxPrune = Math.min(15, Math.floor(maxRetries * 0.4));
  let pruneCount = 0;
  for (let i = 1; i <= maxRetries; i++) {
    const candidate = await fillGrid(createEmptyGrid(size as any), timeoutMs, { priorityOnly: false, bannedWords: banned });
    if (!candidate) continue;
    const words = extractWords(candidate);
    const p = words.length ? words.filter(w => priorityWordSet.has(w)).length / words.length : 0;
    const twoLen = words.filter(w => w.length === 2).length;
    if (twoLen > MAX2) continue;
    if (priorityWordSet.size === 0 || p >= TARGET) return candidate;
    if (p > bestPurity) { bestPurity = p; best = candidate; }
    if (pruneCount < maxPrune && p > 0) {
      for (const w of words) {
        if (!priorityWordSet.has(w)) {
          const f = (freq.get(w) || 0) + 1;
          freq.set(w, f);
          if (f >= 2) banned.add(w);
        }
      }
      pruneCount++;
    }
  }
  if (best && bestPurity >= 0.35) return best;
  return null;
}

async function main() {
  const args = process.argv.slice(2);
  const getArg = (k: string) => args.find(a => a.startsWith(`--${k}=`))?.split('=')[1];
  const sizes = (getArg('sizes') || SIZES.join(',')).split(',').map(Number);
  const rounds = Number(getArg('rounds') || 2);
  const onlyCats = getArg('cats')?.split(',');

  const out = (line: string) => process.stdout.write(line + '\n');
  await loadCorpus(CATEGORIES);

  // `--pool` reports how many priority (in-category) words exist for each slot
  // length. The solver only falls back to other categories when a length has no
  // usable in-category word, so this shows where the vocabulary really is thin.
  if (args.includes('--pool')) {
    out('               ' + Array.from({ length: 11 }, (_, i) => String(i + 2).padStart(5)).join('') + '   total');
    for (const cat of CATEGORIES) {
      if (onlyCats && !onlyCats.includes(cat)) continue;
      loadCategory(cat as any, 'fa', dbWordsFor(cat) as any, dbGlueFor(cat) as any);
      const lens: number[] = [];
      for (let l = 2; l <= 12; l++) lens.push([...priorityWordSet].filter(w => w.length === l).length);
      const total = lens.reduce((s, n) => s + n, 0);
      out(cat.padEnd(13) + lens.map(n => String(n).padStart(5)).join('') + String(total).padStart(7));
    }
    return;
  }

  out('category       size  grids  own%   catGlue%  genGlue%  other%  strict%   pureGrids   fail');
  const rows: any[] = [];

  for (const cat of CATEGORIES) {
    if (onlyCats && !onlyCats.includes(cat)) continue;
    const dbWords = dbWordsFor(cat);
    const glueWords = dbGlueFor(cat);
    const own = ownPoolFor(cat, dbWords);
    const catGlue = catGlueFor(cat, glueWords);

    for (const size of sizes) {
      loadCategory(cat as any, 'fa', dbWords as any, glueWords as any);
      if (!POOL_LEN.has(cat)) {
        const hist: number[] = [];
        for (let l = 2; l <= 12; l++) hist.push([...priorityWordSet].filter(w => w.length === l).length);
        POOL_LEN.set(cat, hist);
      }
      let grids = 0, fails = 0, strict = 0;
      let totWords = 0, ownN = 0, catGlueN = 0, genGlueN = 0, otherN = 0;
      const offSamples = new Set<string>();
      const offLen = new Map<number, number>();
      // Diversity: how many DISTINCT words this (category,size) actually placed,
      // and how often the single most repeated one showed up. A tiny distinct
      // count with a big "top" number is exactly «همیشه همان کلمات».
      const placed = new Map<string, number>();

      for (let r = 0; r < rounds; r++) {
        const g = await generateOne(size);
        if (!g) { fails++; continue; }
        grids++;
        const words = extractWords(g);
        let allOwn = true;
        for (const w of words) {
          totWords++;
          placed.set(w, (placed.get(w) || 0) + 1);
          DEMAND.set(w.length, (DEMAND.get(w.length) || 0) + 1);
          if (own.has(w)) ownN++;
          else if (catGlue.has(w)) { catGlueN++; allOwn = false; }
          else if (genericGlue.has(w)) {
            genGlueN++; allOwn = false;
            offLen.set(w.length, (offLen.get(w.length) || 0) + 1);
            if (offSamples.size < 12) offSamples.add(w);
          } else {
            otherN++; allOwn = false;
            offLen.set(w.length, (offLen.get(w.length) || 0) + 1);
            if (offSamples.size < 12) offSamples.add(w);
          }
        }
        if (allOwn) strict++;
      }

      const pct = (n: number) => grids && totWords ? Math.round((n / totWords) * 100) : 0;
      let topWord = '', topCount = 0;
      for (const [w, n] of placed) if (n > topCount) { topCount = n; topWord = w; }
      const distinctL2 = [...placed.keys()].filter((w) => w.length === 2).length;
      const row = {
        cat, size, grids, fails,
        own: pct(ownN), catGlue: pct(catGlueN), genGlue: pct(genGlueN), other: pct(otherN),
        strict: grids ? Math.round((strict / grids) * 100) : 0,
        samples: [...offSamples],
        distinct: placed.size, topWord, topCount, distinctL2,
      };
      for (const [l, n] of offLen) {
        LEAK.set(l, (LEAK.get(l) || 0) + n);
        let m = LEAK_BY_CAT.get(cat);
        if (!m) { m = new Map(); LEAK_BY_CAT.set(cat, m); }
        m.set(l, (m.get(l) || 0) + n);
      }
      rows.push(row);
      out(
        `${cat.padEnd(13)} ${String(size).padStart(3)}  ${String(grids).padStart(4)}  ` +
        `${String(row.own).padStart(4)}   ${String(row.catGlue).padStart(6)}   ${String(row.genGlue).padStart(6)}  ` +
        `${String(row.other).padStart(5)}  ${String(row.strict).padStart(5)}%   ${String(strict).padStart(2)}/${String(grids)}     ${String(fails).padStart(2)}` +
        (row.samples.length ? `   off: ${row.samples.slice(0, 4).join(' ')}` : '') +
        `   | distinct=${row.distinct} top=${row.topWord}×${row.topCount} L2uniq=${row.distinctL2}`
      );
    }
  }

  const agg = (key: string) => {
    const t = rows.reduce((s, r) => s + r[key] * r.grids, 0);
    const g = rows.reduce((s, r) => s + r.grids, 0);
    return g ? Math.round(t / g) : 0;
  };
  out('\nTOTAL grids=' + rows.reduce((s, r) => s + r.grids, 0) +
    '  own=' + agg('own') + '%  catGlue=' + agg('catGlue') + '%  genGlue=' + agg('genGlue') + '%  other=' + agg('other') + '%');

  // Diversity summary: the worst repeaters are what the player reads as
  // «همیشه همان کلمات» — one word ×N inside a single category/size run.
  const gAll = rows.reduce((s, r) => s + r.grids, 0) || 1;
  out('  distinct-word total across all category/size runs: ' + rows.reduce((s, r) => s + r.distinct, 0) +
    '  (avg ' + Math.round(rows.reduce((s, r) => s + r.distinct, 0) / gAll) + ' per grid)');
  out('  worst repeaters: ' +
    rows.slice().sort((a, b) => b.topCount - a.topCount).slice(0, 8)
      .map((r) => `${r.cat}/${r.size}:${r.topWord}×${r.topCount}`).join('  '));
  out('  distinct 2-letter words used: ' + rows.reduce((s, r) => s + r.distinctL2, 0) +
    ' across ' + rows.length + ' runs (max possible = pool size at L2)');

  const leakTotal = [...LEAK.values()].reduce((s, n) => s + n, 0);
  out('\n demand / leaks / in-category coverage, per slot length');
  out('  length   slots   leaks   served   share of all leaks');
  for (let l = 2; l <= 12; l++) {
    const d = DEMAND.get(l) || 0;
    if (!d) continue;
    const n = LEAK.get(l) || 0;
    out(
      String(l).padStart(7) + String(d).padStart(8) + String(n).padStart(8) +
      String(Math.round(((d - n) / d) * 100)).padStart(9) + '%' +
      String(Math.round((n / leakTotal) * 100)).padStart(10) + '%'
    );
  }
  const allSlots = [...DEMAND.values()].reduce((s, n) => s + n, 0);
  out('  total'.padEnd(15) + String(allSlots).padStart(7) + String(leakTotal).padStart(8) +
    String(Math.round(((allSlots - leakTotal) / allSlots) * 100)).padStart(9) + '%');

  out('\nنشت هر دسته بر حسب طول، در کنار اندازهٔ استخر واژه‌های اولویت‌دارِ همان طول');
  out('category     ' + Array.from({ length: 11 }, (_, i) => `L${i + 2}`.padStart(6)).join('') + '    leak');
  const totalLeaks = (m: Map<number, number>) => [...m.values()].reduce((x, y) => x + y, 0);
  for (const [cat, m] of [...LEAK_BY_CAT.entries()].sort((a, b) => totalLeaks(b[1]) - totalLeaks(a[1]))) {
    const pool = POOL_LEN.get(cat) || [];
    const cells = Array.from({ length: 11 }, (_, i) => {
      const l = i + 2;
      const leak = m.get(l) || 0;
      if (!leak) return '     .';
      return `${leak}/${pool[i] ?? 0}`.padStart(6);
    });
    out(cat.padEnd(13) + cells.join('') + String(totalLeaks(m)).padStart(8));
  }
  out('  هر خانه = نشت/تعداد واژهٔ اولویت‌دارِ آن دسته در همان طول');
}

main().catch(e => { console.error(e); process.exit(1); });
