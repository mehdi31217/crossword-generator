/**
 * Prints, per category and per slot length, how many priority (own-category)
 * words the generator can actually choose from. Anything under the target is a
 * deficit the vocabulary packs must cover.
 *
 *   npx esbuild scripts/pool-report.ts --bundle --platform=node --format=cjs \
 *     --outfile=/tmp/pool-report.cjs && node /tmp/pool-report.cjs [--api]
 */
import fs from 'fs';
import path from 'path';
import { loadCategory, getSolverDictionaryState, priorityWordSet } from '../utils/dictionary';
import type { Category, DictionaryEntry } from '../types';

const ROOT = process.cwd();
const USE_API = process.argv.includes('--api');
const API = process.env.CW_API || 'http://127.0.0.1:8081';
const TARGET = Number((process.argv.find((a) => a.startsWith('--target=')) || '--target=45').split('=')[1]);

const CATS: Category[] = ['movies', 'cities', 'knowledge', 'food', 'body', 'jobs',
  'tech', 'nature', 'shahnameh', 'history', 'sports', 'art'];

type Entry = DictionaryEntry;
const dict: Entry[] = [];
const glue: Entry[] = [];

async function loadCorpus() {
  if (!USE_API) {
    dict.push(...JSON.parse(fs.readFileSync(path.join(ROOT, 'server/local-data/dictionary.json'), 'utf-8')));
    glue.push(...JSON.parse(fs.readFileSync(path.join(ROOT, 'server/local-data/glue_dictionary.json'), 'utf-8')));
    return;
  }
  for (const cat of CATS) {
    const get = async (route: string) => {
      const res = await fetch(`${API}/api/${route}?category=${cat}&language=fa&limit=10000`);
      return res.ok ? ((await res.json()) as Entry[]) : [];
    };
    const [d, g] = await Promise.all([get('dictionary'), get('glue-dictionary')]);
    dict.push(...d.map((e) => ({ ...e, category: cat })));
    glue.push(...g.map((e) => ({ ...e, category: cat })));
  }
}

const fa = (e: Entry) => !e.language || e.language === 'fa';

(async () => {
  await loadCorpus();
  const lens = [2, 3, 4, 5, 6, 7, 8, 9, 10];
  console.log(`category      ${lens.map((l) => `L${l}`.padStart(5)).join('')}   short  deficit-sum`);
  for (const cat of CATS) {
    loadCategory(cat, 'fa',
      dict.filter((e) => e.category === cat && fa(e)) as any,
      glue.filter((e) => e.category === cat && fa(e)) as any);
    const state = getSolverDictionaryState();
    const counts = lens.map((l) => (state.wordsByLength[l] || []).filter((w) => priorityWordSet.has(w)).length);
    const deficits = counts.map((c) => Math.max(0, TARGET - c));
    const short = counts.slice(5).filter((c) => c < TARGET).length;
    console.log(
      `${cat.padEnd(12)}${counts.map((c) => String(c).padStart(5)).join('')}` +
      `${String(counts[0] + counts[1]).padStart(8)}${String(deficits.reduce((s, n) => s + n, 0)).padStart(13)}` +
      (short ? `   ← L7+ thin` : '')
    );
  }
})();
