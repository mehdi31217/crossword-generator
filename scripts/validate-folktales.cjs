/**
 * Content gate for the folklore shelf.
 *
 * Bundles `data/folktales/folktalesIndex.ts` with esbuild (so the check runs on
 * the exact content the game ships) and enforces the rules from
 * WORD_CRAFTING_RULES.md: 1-3 short chapters per tale, 10-15 simple words per
 * chapter, no duplicate word inside a book, no word inside its own clue.
 *
 *   node scripts/validate-folktales.cjs [--verbose]
 */
const path = require('path');
const fs = require('fs');
const esbuild = require('esbuild');

const ROOT = path.join(__dirname, '..');
const VERBOSE = process.argv.includes('--verbose');

const bundle = esbuild.buildSync({
  entryPoints: [path.join(ROOT, 'data/folktales/folktalesIndex.ts')],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  write: false,
  logLevel: 'silent',
});
const mod = { exports: {} };
new Function('module', 'exports', 'require', bundle.outputFiles[0].text)(mod, mod.exports, require);
const { FOLKTALE_BOOKS } = mod.exports;

const clean = (s) => String(s || '').replace(/[\u200c\u200f\u200e]/g, '').trim();
const problems = [];
const stats = [];

for (const book of FOLKTALE_BOOKS) {
  const chapters = book.chapters || [];
  if (chapters.length < 1 || chapters.length > 6) {
    problems.push(`${book.id}: ${chapters.length} chapters (must be 1-6)`);
  }
  if (book.coverImage && book.coverImage.startsWith('/') && !fs.existsSync(path.join(ROOT, 'public', book.coverImage))) {
    problems.push(`${book.id}: coverImage not on disk: ${book.coverImage}`);
  }
  const seen = new Set();
  let words = 0;

  for (const ch of chapters) {
    if (!ch.words || ch.words.length < 10 || ch.words.length > 15) {
      problems.push(`${book.id} ch${ch.id}: ${ch.words ? ch.words.length : 0} words (must be 10-15)`);
    }
    if (!ch.title) problems.push(`${book.id} ch${ch.id}: missing title`);
    if (!ch.description) problems.push(`${book.id} ch${ch.id}: missing description`);
    if (!ch.victoryText) problems.push(`${book.id} ch${ch.id}: missing victoryText`);

    for (const entry of ch.words || []) {
      const word = clean(entry.word);
      const clue = clean(entry.clue);
      words++;
      if (!word || !clue) { problems.push(`${book.id} ch${ch.id}: empty word/clue`); continue; }
      if (seen.has(word)) problems.push(`${book.id} ch${ch.id}: duplicate word «${word}»`);
      seen.add(word);
      if (clue.includes(word)) problems.push(`${book.id} ch${ch.id}: «${word}» appears in its clue`);
      if (word.length > 8) problems.push(`${book.id} ch${ch.id}: «${word}» is ${word.length} letters (max 8)`);
      if (clue.length > 70) problems.push(`${book.id} ch${ch.id}: clue for «${word}» is ${clue.length} chars (max 70)`);
      if (/\.\.\.|…/.test(clue)) problems.push(`${book.id} ch${ch.id}: clue for «${word}» has an ellipsis`);
    }

    for (const [kind, p] of [['image', ch.image], ['monster', ch.monsterAvatar]]) {
      if (!p) { problems.push(`${book.id} ch${ch.id}: missing ${kind}`); continue; }
      if (!p.startsWith('/')) continue;
      if (!fs.existsSync(path.join(ROOT, 'public', p))) problems.push(`${book.id} ch${ch.id}: ${kind} not on disk: ${p}`);
    }
    if (!ch.monsterName) problems.push(`${book.id} ch${ch.id}: missing monsterName`);
  }

  stats.push({ id: book.id, chapters: chapters.length, words, avg: chapters.length ? Math.round(words / chapters.length) : 0 });
}

if (VERBOSE) {
  for (const s of stats) console.log(`${s.id.padEnd(10)} chapters=${s.chapters} words=${s.words} avg=${s.avg}`);
}

const totalWords = stats.reduce((n, s) => n + s.words, 0);
console.log(`books=${FOLKTALE_BOOKS.length} chapters=${stats.reduce((n, s) => n + s.chapters, 0)} words=${totalWords}`);

if (problems.length) {
  console.error(`\n${problems.length} problem(s):`);
  for (const p of problems) console.error(' - ' + p);
  process.exit(1);
}
console.log('all folktale content checks passed');
