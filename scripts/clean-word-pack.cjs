#!/usr/bin/env node
// Removes malformed lines (Latin chars, missing separator, placeholders) from a word pack
// and dedupes by normalized word. Run: node scripts/clean-word-pack.cjs <file...>
const fs = require('fs');

const ZW = /[\u200c]/g;
const norm = (s) => s.replace(ZW, '').replace(/[^\u0621-\u064A\u067E\u0686\u0698\u06A9\u06AF\u06CC]/g, '');
const PERSIAN_ONLY = /^[\u0621-\u064A\u067E\u0686\u0698\u06A9\u06AF\u06CC\u200c]+$/;
// Clues must stay in Persian/Arabic script. Reject Latin, ASCII digits, CJK,
// half-width forms and '?' placeholders — but allow the whole Arabic block,
// including «ۀ» (U+06C0) used as the eżāfe heh in «خانوادۀ».
const CLUE_BAD = /[A-Za-z0-9??\u00C0-\u024F\u2000-\u200B\u200D-\u206F\u3000-\u9fff\uAC00-\uD7AF\uFF00-\uFFEF\u{10000}-\u{1FFFF}]/u;

for (const file of process.argv.slice(2)) {
  const lines = fs.readFileSync(file, 'utf-8').split('\n').map((l) => l.trim()).filter(Boolean);
  const seenWord = new Set();
  const seenClue = new Set();
  const kept = [];
  const dropped = [];
  for (const line of lines) {
    const i = line.indexOf('|');
    if (i < 0) { dropped.push(line + ' → no separator'); continue; }
    const word = line.slice(0, i);
    const clue = line.slice(i + 1);
    if (!PERSIAN_ONLY.test(word)) { dropped.push(line + ' → word not Persian'); continue; }
    if (CLUE_BAD.test(clue)) { dropped.push(line + ' → clue has foreign-script or placeholder characters'); continue; }
    const w = norm(word);
    if (w.length < 2 || w.length > 10) { dropped.push(line + ` → length ${w.length}`); continue; }
    if (clue.length < 8 || clue.length > 70) { dropped.push(line + ` → clue length ${clue.length}`); continue; }
    if (norm(clue).includes(w)) { dropped.push(line + ' → answer inside clue'); continue; }
    if (seenWord.has(w)) { dropped.push(line + ' → duplicate word'); continue; }
    if (seenClue.has(norm(clue))) { dropped.push(line + ' → duplicate clue'); continue; }
    seenWord.add(w);
    seenClue.add(norm(clue));
    kept.push(`${word}|${clue}`);
  }
  fs.writeFileSync(file, kept.join('\n') + '\n', 'utf-8');
  console.log(`${file}: kept ${kept.length}, dropped ${dropped.length}`);
  for (const d of dropped.slice(0, 20)) console.log(`  - ${d}`);
}
