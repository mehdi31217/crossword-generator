/**
 * Merges generated expanded words into dictionary.json
 * so the server serves all words via API.
 */
const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, '..');

// Load existing dictionary.json
const dictPath = path.join(baseDir, 'server', 'local-data', 'dictionary.json');
const dict = JSON.parse(fs.readFileSync(dictPath, 'utf8'));

// Load expanded word lists
const expandedContent = fs.readFileSync(path.join(baseDir, 'data', 'expandedGlueWords.ts'), 'utf8');

// Parse expanded word lists to extract entries per category
function parseExpanded(content) {
  const entries = [];
  const catRegex = /export const (\w+)_EXPANDED_FA: DictionaryEntry\[\] = \[([\s\S]*?)\];/g;
  let match;
  
  const catMap = {
    FOOD: 'food', MOVIES: 'movies', CITIES: 'cities', NATURE: 'nature',
    KNOWLEDGE: 'knowledge', BODY: 'body', JOBS: 'jobs', TECH: 'tech', SHAHNAMEH: 'shahnameh'
  };
  
  while ((match = catRegex.exec(content)) !== null) {
    const catName = catMap[match[1]];
    if (!catName) continue;
    
    const entryRegex = /{\s*word:\s*'([^']+)'\s*,\s*clue:\s*'([^']+)'\s*}/g;
    let em;
    while ((em = entryRegex.exec(match[2])) !== null) {
      const word = em[1];
      const clue = em[2];
      entries.push({ word, clue, category: catName });
    }
  }
  return entries;
}

const expanded = parseExpanded(expandedContent);
console.log(`Found ${expanded.length} expanded words to merge`);

// Build set of existing (word, category) pairs to avoid duplicates
const existing = new Set();
for (const e of dict) {
  existing.add(`${e.word}|${e.category}`);
}

// Find max id
let maxId = 0;
for (const e of dict) {
  if (e.id > maxId) maxId = e.id;
}

// Add new entries
let added = 0;
let skipped = 0;
const now = new Date().toISOString();

for (const e of expanded) {
  const key = `${e.word}|${e.category}`;
  if (existing.has(key)) {
    skipped++;
    continue;
  }
  
  const normalized = e.word.toUpperCase().replace(/[\s-]/g, '')
    .replace(/[آأإ]/g, 'ا')
    .replace(/[ئي]/g, 'ی')
    .replace(/ك/g, 'ک');
  
  dict.push({
    id: ++maxId,
    word: e.word,
    clue: e.clue,
    category: e.category,
    language: 'fa',
    length: normalized.length,
    created_at: now,
  });
  
  existing.add(key);
  added++;
}

// Write back
fs.writeFileSync(dictPath, JSON.stringify(dict, null, 2), 'utf8');
console.log(`Added ${added} new entries, skipped ${skipped} duplicates`);
console.log(`Total dictionary entries: ${dict.length}`);
