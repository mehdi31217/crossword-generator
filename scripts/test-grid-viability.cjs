#!/usr/bin/env node
/**
 * Tests grid generation viability by loading the actual dictionary.json and 
 * simulating the loadCategory() logic to check word counts per length per category.
 */
const fs = require('fs');
const path = require('path');

const DICT = path.join(__dirname, '..', 'server', 'local-data', 'dictionary.json');
const GLUE = path.join(__dirname, '..', 'server', 'local-data', 'glue_dictionary.json');

const dict = JSON.parse(fs.readFileSync(DICT, 'utf-8'));
const glue = JSON.parse(fs.readFileSync(GLUE, 'utf-8'));

// Categories to test
const categories = ['general', 'movies', 'nature', 'cities', 'knowledge', 'food', 'body', 'jobs', 'tech', 'shahnameh'];
const latin = /[a-zA-Z]/;

for (const cat of categories) {
  // Filter FA words for this category
  const catWords = dict.filter(e => e.category === cat && e.language === 'fa' && !e.word.includes(' ') && !latin.test(e.word));
  const catGlue = glue.filter(e => e.category === cat && e.language === 'fa');

  // Simulate loadCategory: group by length, dedup
  const wordsByLen = {};
  const seen = new Set();

  // Priority: category words first, then glue
  const allEntries = [...catWords, ...catGlue];
  for (const e of allEntries) {
    const w = e.word;
    const len = w.length;
    if (len < 2 || len > 12) continue;
    if (seen.has(w)) continue;
    seen.add(w);
    if (!wordsByLen[len]) wordsByLen[len] = [];
    wordsByLen[len].push(w);
  }

  // Check MIN_PER_LEN = 50 for each length from 2 to 10
  let allMinMet = true;
  const gaps = [];
  for (let l = 2; l <= 10; l++) {
    const count = (wordsByLen[l] || []).length;
    if (count < 50) {
      allMinMet = false;
      gaps.push(`len=${l}:${count}`);
    }
  }

  const total = Object.values(wordsByLen).reduce((s, a) => s + a.length, 0);
  const priorityCount = catWords.length;

  console.log(`[${cat}] total=${total} priority=${priorityCount} min50=${allMinMet ? '✅' : '❌ ' + gaps.join(', ')}`);
}
