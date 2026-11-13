#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const DICT = path.join(__dirname, '..', 'server', 'local-data', 'dictionary.json');
const dict = JSON.parse(fs.readFileSync(DICT, 'utf-8'));

const latin = /[a-zA-Z]/;

// Remove all tech entries with spaces or Latin characters
const before = dict.filter(e => e.category === 'tech' && e.language === 'fa').length;

let removed = 0;
const cleaned = [];
for (const entry of dict) {
  if (entry.category === 'tech' && entry.language === 'fa') {
    const word = entry.word;
    // Keep only single-word Persian-only entries
    if (word.includes(' ') || latin.test(word)) {
      removed++;
      continue; // skip (remove)
    }
  }
  cleaned.push(entry);
}

console.log('Removed tech entries:', removed);
console.log('Tech FA before:', before);
console.log('Tech FA after:', cleaned.filter(e => e.category === 'tech' && e.language === 'fa').length);

fs.writeFileSync(DICT, JSON.stringify(cleaned, null, 2), 'utf-8');
