#!/usr/bin/env node
/**
 * Validates a word pack file (`word|clue` per line) against the project rules
 * in WORD_CRAFTING_RULES.md and against everything already in the dictionary.
 *
 *   node scripts/validate-word-pack.cjs data/wordPacks/food.txt food
 *
 * Exit code 1 when any hard rule is broken.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const file = process.argv[2];
const category = process.argv[3] || path.basename(file || '', '.txt');
if (!file) { console.error('usage: validate-word-pack.cjs <file> [category]'); process.exit(2); }

const PERSIAN = /^[\u0621-\u064A\u067E\u0686\u0698\u06A9\u06AF\u06CC\u200c]+$/;
// A clue must be Persian/Arabic script with Persian digits and light punctuation.
// Anything else (Latin letters, ASCII digits, CJK, stray markup) is a hard error.
const CLUE_BAD = /[A-Za-z0-9?\u3000-\u9fff\u3040-\u30ff\uAC00-\uD7AF\u00C0-\u024F\u2000-\u200B\u200D-\u206F]/;
const ZWNJ = /\u200c/g;

// Fragments the player already reported as "nonsense": truncated words and
// ultra-rare readings that are technically real but nobody recognises.
const BANNED = new Set(['پن', 'فلف', 'مز', 'چغ', 'خم', 'حب', 'رگ', 'وب', 'مخ', 'یم', 'فک', 'بم', 'نت', 'ری', 'ژی', 'گو', 'لو', 'می', 'نی']);

const norm = (s) => s.toUpperCase().replace(ZWNJ, '').replace(/[\s-]/g, '')
  .replace(/[آأإ]/g, 'ا').replace(/ئ/g, 'ی').replace(/ي/g, 'ی').replace(/ك/g, 'ک');

function loadExisting() {
  const words = new Set(), clues = new Map();
  for (const f of ['dictionary.json', 'glue_dictionary.json']) {
    const p = path.join(ROOT, 'server/local-data', f);
    if (!fs.existsSync(p)) continue;
    for (const e of JSON.parse(fs.readFileSync(p, 'utf8'))) {
      if (e.language && e.language !== 'fa') continue;
      words.add(norm(e.word));
      if (!clues.has(norm(e.clue))) clues.set(norm(e.clue), e.word);
    }
  }
  return { words, clues };
}

const existing = loadExisting();
const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
const errors = [], warns = [];
const seenWord = new Map(), seenClue = new Map();
const byLen = {}, samples = [];
let ok = 0;

lines.forEach((raw, i) => {
  const line = raw.trim();
  if (!line || line.startsWith('#')) return;
  const at = line.indexOf('|');
  if (at === -1) { errors.push(`L${i + 1}: missing "|" → ${line.slice(0, 40)}`); return; }
  let word = line.slice(0, at).trim();
  let clue = line.slice(at + 1).trim();

  if (!PERSIAN.test(word)) { errors.push(`L${i + 1}: non-Persian chars in «${word}»`); return; }
  if (word.includes(' ')) { errors.push(`L${i + 1}: space in «${word}»`); return; }
  const letters = word.replace(ZWNJ, '').length;
  if (letters < 2 || letters > 10) { errors.push(`L${i + 1}: length ${letters} for «${word}»`); return; }
  if (BANNED.has(word)) { errors.push(`L${i + 1}: banned fragment «${word}»`); return; }
  if (CLUE_BAD.test(clue)) { errors.push(`L${i + 1}: non-Persian character in clue for «${word}»`); return; }
  if (clue.length < 8 || clue.length > 70) { errors.push(`L${i + 1}: clue length ${clue.length} for «${word}»`); return; }
  if (norm(clue).includes(norm(word))) { errors.push(`L${i + 1}: answer inside clue → «${word}» | ${clue}`); return; }

  const wn = norm(word);
  if (seenWord.has(wn)) { errors.push(`L${i + 1}: duplicate word «${word}» (also L${seenWord.get(wn)})`); return; }
  if (existing.words.has(wn)) { warns.push(`L${i + 1}: word already in dictionary «${word}»`); }
  const cn = norm(clue);
  if (seenClue.has(cn)) { errors.push(`L${i + 1}: duplicate clue «${clue.slice(0, 30)}…» (also L${seenClue.get(cn)})`); return; }
  if (existing.clues.has(cn)) { warns.push(`L${i + 1}: clue already used by «${existing.clues.get(cn)}»`); }

  seenWord.set(wn, i + 1);
  seenClue.set(cn, i + 1);
  ok++;
  byLen[letters] = (byLen[letters] || 0) + 1;
  if (samples.length < 5) samples.push(`${word} | ${clue}`);
});

const total = ok;
console.log(`file      : ${file}`);
console.log(`category  : ${category}`);
console.log(`entries   : ${total} valid, ${errors.length} errors, ${warns.length} warnings`);
console.log(`lengths   : ${Object.keys(byLen).sort((a, b) => a - b).map(l => `${l}:${byLen[l]}`).join('  ')}`);
console.log(`samples   : ${samples.join(' · ')}`);
if (warns.length) console.log(`\nwarnings:\n  ${warns.slice(0, 15).join('\n  ')}${warns.length > 15 ? `\n  … ${warns.length - 15} more` : ''}`);
if (errors.length) console.log(`\nerrors:\n  ${errors.slice(0, 40).join('\n  ')}${errors.length > 40 ? `\n  … ${errors.length - 40} more` : ''}`);

process.exit(errors.length ? 1 : 0);
