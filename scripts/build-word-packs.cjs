#!/usr/bin/env node
// Merges data/wordPacks/<cat>.{glue,words}.txt into the two seed files the
// server reads. `*.glue.txt` → glue_dictionary.json (short connector words the
// solver prefers), `*.words.txt` → dictionary.json (thematic words).
// Run: node scripts/build-word-packs.cjs [--dry]
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PACKS = path.join(ROOT, 'data', 'wordPacks');
const DICT = path.join(ROOT, 'server', 'local-data', 'dictionary.json');
const GLUE = path.join(ROOT, 'server', 'local-data', 'glue_dictionary.json');

const DRY = process.argv.includes('--dry');
const ZW = new RegExp('\u200c', 'g');
const norm = (s) => s.replace(ZW, '').trim();

function readPack(file) {
  if (!fs.existsSync(file)) return [];
  return fs
    .readFileSync(file, 'utf8')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('//'))
    .map((l) => {
      const i = l.indexOf('|');
      if (i < 0) return null;
      const word = norm(l.slice(0, i));
      const clue = l.slice(i + 1).trim();
      return word && clue ? { word, clue } : null;
    })
    .filter(Boolean);
}

const dictionary = JSON.parse(fs.readFileSync(DICT, 'utf8'));
const glue = JSON.parse(fs.readFileSync(GLUE, 'utf8'));

// Rows without an id exist in dictionary.json; only numbered rows advance the counter.
let nextId = Math.max(...dictionary.map((r) => Number(r.id) || 0)) + 1;
const now = new Date().toISOString();

const seenDict = new Set(dictionary.map((r) => `${norm(r.word)}\u0000${r.category || ''}`));
const seenGlue = new Set(glue.map((r) => `${norm(r.word)}\u0000${r.category || ''}`));

const files = fs.readdirSync(PACKS).filter((f) => /^[a-z]+\.glue\.txt$|^[a-z]+\.words\.txt$/.test(f)).sort();
const report = [];

for (const file of files) {
  const isGlue = file.endsWith('.glue.txt');
  const category = file.split('.')[0];
  const entries = readPack(path.join(PACKS, file));
  const seen = isGlue ? seenGlue : seenDict;
  const target = isGlue ? glue : dictionary;
  let added = 0;
  let dupes = 0;

  for (const { word, clue } of entries) {
    const key = `${word}\u0000${category}`;
    if (seen.has(key)) { dupes++; continue; }
    seen.add(key);
    target.push(
      isGlue
        ? { word, clue, category, language: 'fa' }
        : { id: String(nextId++), word, clue, category, language: 'fa', length: word.length, created_at: now }
    );
    added++;
  }
  report.push({ file, category, kind: isGlue ? 'glue' : 'words', read: entries.length, added, dupes });
}

for (const r of report) {
  console.log(`${r.file.padEnd(24)} ${r.kind.padEnd(5)} read=${String(r.read).padStart(4)} added=${String(r.added).padStart(4)} dupes=${r.dupes}`);
}
console.log(`\ndictionary.json: ${dictionary.length} rows · glue_dictionary.json: ${glue.length} rows`);

if (DRY) {
  console.log('\n--dry: nothing written');
} else {
  fs.writeFileSync(DICT, JSON.stringify(dictionary, null, 2) + '\n');
  fs.writeFileSync(GLUE, JSON.stringify(glue, null, 2) + '\n');
  console.log('\nwrote dictionary.json + glue_dictionary.json');
}

const byCat = {};
for (const r of report) {
  byCat[r.category] = byCat[r.category] || { glue: 0, words: 0 };
  byCat[r.category][r.kind] += r.added;
}
console.log('\nper category (new entries):');
for (const [c, v] of Object.entries(byCat).sort()) {
  console.log(`  ${c.padEnd(12)} glue=${String(v.glue).padStart(4)}  words=${String(v.words).padStart(4)}  total=${String(v.glue + v.words).padStart(4)}`);
}
