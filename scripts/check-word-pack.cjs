#!/usr/bin/env node
/**
 * Hard checker for a word pack: applies the same rules as validate-word-pack.cjs
 * and additionally refuses any word that already exists anywhere in the corpus
 * (dictionary.json, glue_dictionary.json, every glue array in the bundled TS)
 * or that an earlier batch already claimed in /tmp/word-ledger.txt.
 *
 *   node scripts/check-word-pack.cjs data/wordPacks/art.txt art
 *   node scripts/check-word-pack.cjs data/wordPacks/art.txt art --claim
 *   node scripts/check-word-pack.cjs --rebuild-taken
 *
 * Exit 1 on any error. With --claim the accepted words are appended to the
 * ledger so the next batch cannot reuse them.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const file = process.argv[2];
const claim = process.argv.includes('--claim');
const TAKEN = '/tmp/taken-words.txt';
const LEDGER = '/tmp/word-ledger.txt';
const ZWNJ = /\u200c/g;
const norm = (s) => s.toUpperCase().replace(ZWNJ, '').replace(/[\s-]/g, '')
  .replace(/[آأإ]/g, 'ا').replace(/ئ/g, 'ی').replace(/ي/g, 'ی').replace(/ك/g, 'ک');

const PERSIAN = /^[\u0621-\u064A\u067E\u0686\u0698\u06A9\u06AF\u06CC\u200c]+$/;
const CLUE_BAD = /[A-Za-z0-9?\u3000-\u9fff\u3040-\u30ff\uAC00-\uD7AF\u00C0-\u024F\u2000-\u200B\u200D-\u206F]/;
const BANNED = new Set(['پن', 'فلف', 'مز', 'چغ', 'خم', 'حب', 'رگ', 'وب', 'مخ', 'یم', 'فک', 'بم', 'نت', 'ری', 'ژی', 'گو', 'لو', 'می', 'نی']);

function glueArraysIn(rel) {
  const src = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  return [...src.matchAll(/word:\s*["']([^"']+)["']/g)].map((m) => m[1]);
}

function rebuildTaken() {
  const all = new Set();
  for (const f of ['server/local-data/dictionary.json', 'server/local-data/glue_dictionary.json']) {
    const p = path.join(ROOT, f);
    if (!fs.existsSync(p)) continue;
    for (const e of JSON.parse(fs.readFileSync(p, 'utf8'))) {
      if (e.language && e.language !== 'fa') continue;
      all.add(norm(e.word));
    }
  }
  for (const f of ['utils/glueWords.ts', 'data/glueWords.ts', 'data/glueWordsExtra.ts', 'data/wordLists.ts']) {
    const p = path.join(ROOT, f);
    if (!fs.existsSync(p)) continue;
    for (const w of glueArraysIn(f)) all.add(norm(w));
  }
  // Shipped packs count as corpus; `incoming` does NOT — two batches may collide,
  // and that is what the --claim ledger is for. Including the draft dir here made
  // every file reject itself.
  const packsDir = path.join(ROOT, 'data', 'wordPacks');
  if (fs.existsSync(packsDir)) {
    for (const f of fs.readdirSync(packsDir).filter((x) => x.endsWith('.txt') && x !== path.basename(file || ''))) {
      for (const l of fs.readFileSync(path.join(packsDir, f), 'utf8').split(/\r?\n/)) {
        const at = l.indexOf('|');
        if (at > 0) all.add(norm(l.slice(0, at).trim()));
      }
    }
  }
  fs.writeFileSync(TAKEN, [...all].sort().join('\n') + '\n');
  return all;
}

let taken;
if (process.argv.includes('--rebuild-taken')) {
  taken = rebuildTaken();
  console.log(`taken-words rebuilt: ${taken.size} distinct fa word forms → ${TAKEN}`);
  process.exit(0);
}
// Always rebuilt: the cache used to be read back, so a run with no file argument
// poisoned it with the very words the next check was about.
taken = rebuildTaken();

// The ledger records `<file>::<word>` plus legacy bare words (from before the
// per-file key existed). A word claimed by THIS file is not a collision, so a
// batch can be re-checked after it was already claimed — without the exemption,
// re-running a finished pack rejected 100% of its own lines and every agent that
// tried to verify its work again concluded its pack was broken.
const claimsFor = (f) => `${f}::`;
const ledgerLines = fs.existsSync(LEDGER)
  ? fs.readFileSync(LEDGER, 'utf8').split('\n').filter(Boolean)
  : [];
const ownPrefix = claimsFor(file);
// Bare lines are global (legacy); `other/file::word` belongs to a different batch.
const ledger = new Set(ledgerLines.filter((l) => !l.startsWith(ownPrefix)).map((l) => (l.includes('::') ? l.slice(l.indexOf('::') + 2) : l)));

if (!file) { console.error('usage: check-word-pack.cjs <file> [category] [--claim]'); process.exit(2); }

const lines = fs.readFileSync(path.join(ROOT, file), 'utf8').split(/\r?\n/);
const errors = [];
const accepted = [];
const byLen = {};
const localWords = new Map();
const localClues = new Map();

lines.forEach((raw, i) => {
  const line = raw.trim();
  if (!line || line.startsWith('#') || line.startsWith('//')) return;
  const at = line.indexOf('|');
  if (at === -1) return errors.push(`L${i + 1}: missing "|"`);
  const word = line.slice(0, at).trim();
  const clue = line.slice(at + 1).trim();
  const wn = norm(word);
  const bad = (msg) => errors.push(`L${i + 1}: ${msg} → ${word}`);
  if (!PERSIAN.test(word)) return bad('non-Persian chars');
  if (word.includes(' ')) return bad('space in word');
  const letters = word.replace(ZWNJ, '').length;
  if (letters < 2 || letters > 10) return bad(`length ${letters}`);
  if (BANNED.has(word)) return bad('banned fragment');
  if (CLUE_BAD.test(clue)) return bad('non-Persian char in clue');
  if (clue.length < 8 || clue.length > 70) return bad(`clue length ${clue.length}`);
  if (norm(clue).includes(wn)) return bad('answer inside clue');
  if (localWords.has(wn)) return bad(`duplicate word (also L${localWords.get(wn)})`);
  if (localClues.has(norm(clue))) return bad(`duplicate clue (also L${localClues.get(norm(clue))})`);
  if (taken.has(wn)) return bad('ALREADY IN CORPUS');
  if (ledger.has(wn)) return bad('ALREADY CLAIMED BY ANOTHER BATCH');
  localWords.set(wn, i + 1);
  localClues.set(norm(clue), i + 1);
  accepted.push(wn);
  byLen[letters] = (byLen[letters] || 0) + 1;
});

console.log(`file     : ${file}`);
console.log(`accepted : ${accepted.length}`);
console.log(`rejected : ${errors.length}`);
console.log(`lengths  : ${Object.keys(byLen).sort((a, b) => a - b).map((l) => `${l}:${byLen[l]}`).join('  ')}`);
if (errors.length) console.log(`\nerrors:\n  ${errors.slice(0, 60).join('\n  ')}${errors.length > 60 ? `\n  … ${errors.length - 60} more` : ''}`);
if (claim && accepted.length) fs.appendFileSync(LEDGER, accepted.map((w) => ownPrefix + w).join('\n') + '\n');
if (claim) console.log(`\nledger   : ${new Set(ledgerLines.concat(accepted.map((w) => ownPrefix + w))).size} claimed entries`);
process.exit(errors.length ? 1 : 0);
