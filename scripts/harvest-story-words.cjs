#!/usr/bin/env node
/**
 * Harvests already-curated Persian word/clue pairs from the project's own story
 * content and appends them to the crossword generator's word packs.
 *
 * Why: the leak histogram (scripts/word-purity.ts) shows 80% of non-category
 * words land in 2-4 letter slots, and the categories with the thinnest pools are
 * shahnameh / history / sports. Those three already own hundreds of hand-written
 * entries in their story files, so the vocabulary exists and is verified real --
 * it simply was never offered to the grid solver.
 *
 * Story content is READ ONLY; nothing here edits a chapter or word file.
 *
 *   node scripts/harvest-story-words.cjs [--dry] [--group=shahnameh,history,sports]
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DRY = process.argv.includes('--dry');
const ONLY = (process.argv.find((a) => a.startsWith('--group=')) || '').split('=')[1];
const SHOW = Number((process.argv.find((a) => a.startsWith('--show=')) || '').split('=')[1] || 0);

const PERSIAN = /^[ء-يپچژکگی‌]+$/;
const CLUE_BAD = /[A-Za-z0-9?\u3000-\u9fff\uAC00-\uD7AF\u00C0-\u024F\u2000-\u200B\u200D-\u206F]/;
const BANNED = new Set(['پن', 'فلف', 'مز', 'چغ', 'خم', 'حب', 'رگ', 'وب', 'مخ', 'یم', 'فک', 'بم', 'نت', 'ری', 'ژی', 'گو', 'لو', 'می', 'نی']);

// Story files hold two clue styles: a definition («پدر سام، پدربزرگ رستم») and a
// sentence with the answer cut out («مصدق با آتشین مردم را به مبارزه دعوت کرد»).
// The second reads as broken Persian, so a clue ending in a finite verb is dropped.
const FINITE_VERBS = new Set([
  'شد', 'شود', 'شوند', 'شدند', 'شدن', 'است', 'هست', 'هستند', 'بود', 'بودند', 'بود',
  'کرد', 'کردند', 'کند', 'کنند', 'داد', 'دادند', 'دهد', 'دهند',
  'رفت', 'رفتند', 'رود', 'روند', 'آمد', 'آمدند', 'آید', 'آیند',
  'گشت', 'گشتند', 'نهاد', 'نهادند', 'زد', 'زدند', 'زند', 'گفت', 'گفتند', 'گوید',
  'داشت', 'داشتند', 'دارد', 'دارند', 'نمود', 'نمودند', 'خورد', 'خوردند', 'خورَد',
  'برد', 'بردند', 'بست', 'بستند', 'دوخت', 'خواست', 'خواستند', 'توانست', 'ماند', 'ماندند',
  'یافت', 'یافتند', 'نامید', 'نامیدند', 'خواند', 'خواندند', 'آفرید', 'آفریدند',
  'افکند', 'گسست', 'شکست', 'درید', 'رسید', 'رسیدند', 'زدود', 'ستود', 'باخت', 'کاست',
]);
const isSentenceClue = (clue) => {
  const last = clue.replace(/[.!?؛:]+$/, '').trim().split(/\s+/).pop() || '';
  return FINITE_VERBS.has(last.replace(ZW, ''));
};
const ZW = new RegExp('\u200c', 'g');
const norm = (s) => s.toUpperCase().replace(ZW, '').replace(/[\s-]/g, '')
  .replace(/[آأإ]/g, 'ا').replace(/ئ/g, 'ی').replace(/ي/g, 'ی').replace(/ك/g, 'ک');

function tsFiles(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...tsFiles(p));
    else if (e.name.endsWith('.ts')) out.push(p);
  }
  return out;
}

const ALL = tsFiles(path.join(ROOT, 'data'));
const rel = (p) => path.relative(ROOT, p).replace(/\\/g, '/');
const GROUPS = {
  shahnameh: ALL.filter((p) => /^data\/shahnameh\//.test(rel(p)) || /shahnameh\w*\.ts$/.test(rel(p))),
  history: ALL.filter((p) => /^data\/history\//.test(rel(p)) || /kurosh|mosaddegh/.test(rel(p))),
  sports: ALL.filter((p) => /worldMap|legend|football/i.test(rel(p))),
};

// Existing dictionary rows: never re-add a word the category already has.
const existingByCat = new Map();
const existingClues = new Set();
for (const f of ['dictionary.json', 'glue_dictionary.json']) {
  for (const e of JSON.parse(fs.readFileSync(path.join(ROOT, 'server/local-data', f), 'utf8'))) {
    if (e.language && e.language !== 'fa') continue;
    if (!existingByCat.has(e.category)) existingByCat.set(e.category, new Set());
    existingByCat.get(e.category).add(norm(e.word));
    existingClues.add(norm(e.clue));
  }
}

const stats = [];
for (const [cat, files] of Object.entries(GROUPS)) {
  if (ONLY && !ONLY.split(',').includes(cat)) continue;
  const have = existingByCat.get(cat) || new Set();
  const gluePath = path.join(ROOT, `data/wordPacks/${cat}.glue.txt`);
  const wordsPath = path.join(ROOT, `data/wordPacks/${cat}.words.txt`);
  const packWords = (p) => (fs.existsSync(p) ? fs.readFileSync(p, 'utf8').split(/\r?\n/) : [])
    .map((l) => l.slice(0, l.indexOf('|') === -1 ? 1e9 : l.indexOf('|')).trim())
    .filter(Boolean).map(norm);
  const inPack = new Set([...packWords(gluePath), ...packWords(wordsPath), ...have]);
  const seenClues = new Set(existingClues);

  const pairs = new Map();
  let raw = 0, reject = 0, split = 0;
  const check = (word, clue) => {
    if (CLUE_BAD.test(clue) || clue.length < 8 || clue.length > 70) return false;
    if (norm(clue).includes(norm(word))) return false;
    if (isSentenceClue(clue)) return false;
    return true;
  };
  for (const f of files) {
    const text = fs.readFileSync(f, 'utf8');
    const re = /word\s*:\s*["'`]([^"'`]+)["'`]\s*,\s*clue\s*:\s*["'`]([^"'`]+)["'`]/g;
    let m;
    while ((m = re.exec(text))) {
      raw++;
      const word = m[1].trim();
      const letters = word.replace(ZW, '').length;
      if (!PERSIAN.test(word) || word.includes(' ') || letters < 2 || letters > 10) { reject++; continue; }
      if (BANNED.has(word)) { reject++; continue; }
      // «context | definition» -- the definition is the precise, standalone gloss.
      const parts = m[2].split('|').map((s) => s.trim()).filter(Boolean);
      let clue = parts[0];
      if (parts.length > 1) {
        const gloss = parts[parts.length - 1];
        if (check(word, gloss)) { clue = gloss; split++; }
      }
      if (!check(word, clue)) { reject++; continue; }
      if (inPack.has(norm(word))) { reject++; continue; }
      if (seenClues.has(norm(clue))) { reject++; continue; }
      seenClues.add(norm(clue));
      // Keep the first sighting; story files repeat many words across chapters.
      if (!pairs.has(norm(word))) pairs.set(norm(word), { word, clue, letters });
    }
  }

  const glue = [...pairs.values()].filter((p) => p.letters <= 4);
  const words = [...pairs.values()].filter((p) => p.letters > 4);
  stats.push({ cat, files: files.length, raw, usable: pairs.size, glue: glue.length, words: words.length, glossUsed: split });
  if (SHOW) {
    const all = [...pairs.values()];
    const step = Math.max(1, Math.floor(all.length / SHOW));
    console.log(`\n--- ${cat} sample ---`);
    for (let i = 0; i < all.length; i += step) console.log(`${all[i].word}|${all[i].clue}`);
  }
  if (!DRY) {
    const render = (items, header) => (items.length
      ? `# ${header}\n` + items.map((p) => `${p.word}|${p.clue}\n`).join('')
      : '');
    if (glue.length) fs.appendFileSync(gluePath, render(glue, `${cat} short (2-4) harvested from story content`));
    if (words.length) fs.appendFileSync(wordsPath, render(words, `${cat} main (5-10) harvested from story content`));
  }
}

console.table(stats);
console.log(DRY ? 'dry run - nothing written' : 'appended into data/wordPacks/<cat>.(glue|words).txt');
