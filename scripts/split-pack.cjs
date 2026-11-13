#!/usr/bin/env node
// Splits a pack file into short (glue) and long (words) parts by answer length.
// Usage: node scripts/split-pack.cjs <file> <maxShortLen>
const fs = require('fs');
const [file, maxLen] = [process.argv[2], Number(process.argv[3])];
const lines = fs.readFileSync(file, 'utf-8').split('\n').map((l) => l.trim()).filter(Boolean);
const len = (w) => w.replace(/[\u200c]/g, '').length;
const short = lines.filter((l) => len(l.split('|')[0]) <= maxLen);
const long = lines.filter((l) => len(l.split('|')[0]) > maxLen);
fs.writeFileSync(file, short.join('\n') + (short.length ? '\n' : ''));
if (long.length) {
  const dest = file.replace(/\.glue\.txt$/, '.words.txt');
  const existing = fs.existsSync(dest) ? fs.readFileSync(dest, 'utf-8').trim() : '';
  fs.writeFileSync(dest, (existing ? existing + '\n' : '') + long.join('\n') + '\n');
  console.log(`${file}: short ${short.length}, moved ${long.length} → ${dest}`);
} else {
  console.log(`${file}: short ${short.length}, moved 0`);
}
