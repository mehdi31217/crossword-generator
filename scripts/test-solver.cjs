#!/usr/bin/env node
/**
 * Standalone grid generation test for specific categories.
 * Simulates the exact same CSP solver used in the frontend.
 */
const fs = require('fs');
const path = require('path');

// Load data
const dict = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'server', 'local-data', 'dictionary.json'), 'utf-8'));
const glue = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'server', 'local-data', 'glue_dictionary.json'), 'utf-8'));

const latin = /[a-zA-Z]/;

// Normalize Persian: same as dictionary.ts
function normalize(s) {
  return s.toUpperCase()
    .replace(/[\s-]/g, '')
    .replace(/[آأإ]/g, 'ا')
    .replace(/ئ/g, 'ی')
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک');
}

// Character commonness (same as gridLogic.ts)
const CHAR_SCORE = {
  'ا': 10, 'و': 10, 'ی': 10, 'ن': 8, 'ر': 8, 'م': 8, 'د': 7, 'ب': 7,
  'س': 6, 'ت': 6, 'ک': 5, 'ل': 5, 'گ': 5, 'ه': 4, 'ز': 4, 'ف': 4,
  'ع': 4, 'ح': 3, 'خ': 3, 'چ': 3, 'ش': 3, 'ق': 3, 'آ': 3, 'ج': 3,
  'پ': 3, 'ظ': 1, 'ذ': 1, 'غ': 1, 'ژ': 1, 'ث': 1, 'ص': 1, 'ض': 1, 'ط': 1, '‌': 1
};

// Shuffle
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// --- Simulate loadCategory (same logic as dictionary.ts) ---
function loadCategory(category) {
  // Filter FA words: category words + glue
  const catWords = dict.filter(e =>
    e.category === category && e.language === 'fa' &&
    !e.word.includes(' ') && !latin.test(e.word)
  );
  const glueWords = glue.filter(e =>
    e.category === category && e.language === 'fa' &&
    !e.word.includes(' ') && !latin.test(e.word)
  );
  const massiveGlue = glue.filter(e =>
    e.language === 'fa' && !e.word.includes(' ') && !latin.test(e.word)
  );

  const priority = [...glueWords, ...catWords];
  const supplement = [...catWords, ...massiveGlue];

  const cluesMap = new Map();
  const wordsByLength = {};
  const priorityWordSet = new Set();

  for (let len = 2; len <= 12; len++) {
    const result = [];
    const seen = new Set();

    for (const e of priority) {
      const n = normalize(e.word);
      if (n.length === len && !cluesMap.has(n) && !seen.has(n)) {
        cluesMap.set(n, e.clue);
        seen.add(n);
        result.push(n);
        priorityWordSet.add(n);
      }
    }
    for (const e of supplement) {
      const n = normalize(e.word);
      if (n.length === len && !cluesMap.has(n) && !seen.has(n)) {
        cluesMap.set(n, e.clue);
        seen.add(n);
        result.push(n);
      }
    }
    wordsByLength[len] = result;
  }

  return { wordsByLength, priorityWordSet, cluesMap };
}

function getMatchingWords(pattern, wordsByLength) {
  const len = pattern.length;
  const allWords = wordsByLength[len] || [];
  if (!pattern.includes('_')) return allWords.filter(w => w === pattern);
  return allWords.filter(w => {
    for (let i = 0; i < len; i++) {
      if (pattern[i] !== '_' && pattern[i] !== w[i]) return false;
    }
    return true;
  });
}

// --- Grid generation (simplified from glueWords.ts + gridLogic.ts) ---
function generateGrid(size, wordsByLength, priorityWordSet, cluesMap) {
  const retries = 6;
  const timeoutMs = 3000;

  for (let attempt = 1; attempt <= retries; attempt++) {
    const t0 = Date.now();
    const result = fillGrid(createEmptyGrid(size), timeoutMs, wordsByLength, priorityWordSet);
    const dt = Date.now() - t0;
    if (result) {
      console.log(`  ✅ SUCCESS attempt ${attempt} (${dt}ms)`);
      for (const row of result) {
        console.log('    ' + row.map(c => c.isBlack ? '█' : (c.value || '_')).join(' '));
      }

      const words = new Set();
      for (const row of result) {
        let curr = '';
        for (const cell of row) {
          if (cell.isBlack) { if (curr.length > 1) words.add(curr); curr = ''; }
          else curr += cell.value || '_';
        }
        if (curr.length > 1) words.add(curr);
      }
      for (let c = 0; c < size; c++) {
        let curr = '';
        for (let r = 0; r < size; r++) {
          if (result[r][c].isBlack) { if (curr.length > 1) words.add(curr); curr = ''; }
          else curr += result[r][c].value || '_';
        }
        if (curr.length > 1) words.add(curr);
      }

      const wordList = [...words].filter(w => !w.includes('_'));
      console.log(`    Words: ${wordList.length}`);
      for (const w of wordList) {
        const clue = cluesMap.get(normalize(w)) || '?';
        const isPrio = priorityWordSet.has(w) ? '' : ' [supp]';
        console.log(`    ${w} → ${clue}${isPrio}`);
      }
      return { grid: result, words: wordList };
    }
    if (dt >= timeoutMs) {
      console.log(`  ✗ attempt ${attempt} timeout (${dt}ms)`);
    } else {
      console.log(`  ✗ attempt ${attempt} failed (${dt}ms)`);
    }
  }
  return null;
}

function createEmptyGrid(size) {
  // Random topology generation (mirrors gridLogic.ts)
  let ratio = 0.18;
  if (size === 6) ratio = 0.22;
  else if (size === 7) ratio = 0.25;
  else if (size === 8) ratio = 0.28;
  else if (size >= 9) ratio = 0.32;

  // Try up to 100 times to create valid topology
  for (let attempt = 0; attempt < 100; attempt++) {
    const grid = Array(size).fill(null).map((_, r) =>
      Array(size).fill(null).map((_, c) => ({
        r, c, value: '', isBlack: false
      }))
    );

    const targetBlack = Math.floor(size * size * ratio);
    let placed = 0;
    const maxAttempts = size > 8 ? 800 : 400;

    for (let a = 0; a < maxAttempts && placed < targetBlack; a++) {
      const r = Math.floor(Math.random() * size);
      const c = Math.floor(Math.random() * size);
      if (grid[r][c].isBlack) continue;

      grid[r][c].isBlack = true;
      let added = 1;

      // Symmetry
      const symR = size - 1 - r;
      const symC = size - 1 - c;
      if (!grid[symR][symC].isBlack) {
        grid[symR][symC].isBlack = true;
        added++;
      }
      placed += added;
    }

    // Validate topology: connected + no isolated cells
    if (!isValidTopology(grid)) continue;
    return grid;
  }

  // Fallback
  return Array(size).fill(null).map((_, r) =>
    Array(size).fill(null).map((_, c) => ({
      r, c, value: '', isBlack: false
    }))
  );
}

function isValidTopology(grid) {
  const size = grid.length;

  // Check for isolated cells (no horizontal or vertical neighbor)
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!grid[r][c].isBlack) {
        const hasHoriz = (c > 0 && !grid[r][c-1].isBlack) || (c < size-1 && !grid[r][c+1].isBlack);
        const hasVert = (r > 0 && !grid[r-1][c].isBlack) || (r < size-1 && !grid[r+1][c].isBlack);
        if (!hasHoriz && !hasVert) return false;
      }
    }
  }

  // Check connectivity: BFS from first white cell
  let startR = -1, startC = -1;
  for (let r = 0; r < size && startR === -1; r++) {
    for (let c = 0; c < size && startC === -1; c++) {
      if (!grid[r][c].isBlack) { startR = r; startC = c; }
    }
  }
  if (startR === -1) return false;

  const visited = new Set();
  const queue = [[startR, startC]];
  visited.add(startR + ',' + startC);
  while (queue.length > 0) {
    const [r, c] = queue.shift();
    for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1]]) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < size && nc >= 0 && nc < size && !grid[nr][nc].isBlack && !visited.has(nr + ',' + nc)) {
        visited.add(nr + ',' + nc);
        queue.push([nr, nc]);
      }
    }
  }

  // All white cells must be reachable
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!grid[r][c].isBlack && !visited.has(r + ',' + c)) return false;
    }
  }

  return true;
}

function fillGrid(initialGrid, timeoutMs, wordsByLength, priorityWordSet) {
  const size = initialGrid.length;
  const startTime = Date.now();

  // Build slots (horizontal and vertical word positions)
  const slots = [];
  const grid = initialGrid.map(row => row.map(c => ({ ...c })));

  // Find horizontal slots
  for (let r = 0; r < size; r++) {
    let start = -1;
    for (let c = 0; c <= size; c++) {
      if (c < size && !grid[r][c].isBlack) {
        if (start === -1) start = c;
      } else {
        if (start !== -1 && c - start >= 2) {
          const cells = [];
          for (let cc = start; cc < c; cc++) cells.push({ r, c: cc });
          slots.push({ cells, length: c - start, direction: 'across', index: slots.length });
        }
        start = -1;
      }
    }
  }

  // Find vertical slots
  for (let c = 0; c < size; c++) {
    let start = -1;
    for (let r = 0; r <= size; r++) {
      if (r < size && !grid[r][c].isBlack) {
        if (start === -1) start = r;
      } else {
        if (start !== -1 && r - start >= 2) {
          const cells = [];
          for (let rr = start; rr < r; rr++) cells.push({ r: rr, c });
          slots.push({ cells, length: r - start, direction: 'down', index: slots.length });
        }
        start = -1;
      }
    }
  }

  if (slots.length < 2) return null;

  // Build intersection map
  const cellToSlots = new Map();
  slots.forEach((slot, sIdx) => {
    slot.cells.forEach((cell, cIdx) => {
      const key = cell.r + ',' + cell.c;
      if (!cellToSlots.has(key)) cellToSlots.set(key, []);
      cellToSlots.get(key).push({ slotIdx: sIdx, charIdx: cIdx });
    });
  });

  const intersectionMap = Array.from({ length: slots.length }, () => []);
  slots.forEach((slot, sIdx) => {
    slot.cells.forEach((cell, cIdx) => {
      const key = cell.r + ',' + cell.c;
      const overlaps = cellToSlots.get(key);
      if (overlaps) {
        for (const ov of overlaps) {
          if (ov.slotIdx !== sIdx) {
            intersectionMap[sIdx].push({
              targetSlot: ov.slotIdx,
              selfCharIdx: cIdx,
              targetCharIdx: ov.charIdx
            });
          }
        }
      }
    });
  });

  // Initial domains
  const domains = [];
  for (const slot of slots) {
    let pattern = '';
    for (const c of slot.cells) {
      pattern += grid[c.r][c.c].value || '_';
    }
    const words = getMatchingWords(pattern, wordsByLength);
    if (words.length === 0) return null;
    domains.push([...words]);
  }

  // Sort domains: priority words first
  for (let i = 0; i < slots.length; i++) {
    const constraints = intersectionMap[i];
    if (constraints.length === 0) {
      shuffle(domains[i]);
      continue;
    }
    const shuffleNoise = Math.random() * 0.01;
    const wordScores = domains[i].map(w => {
      let s = 0;
      for (const c of constraints) s += CHAR_SCORE[w[c.selfCharIdx]] || 0;
      const isPriority = priorityWordSet.has(w) ? 0 : 1;
      return { word: w, score: isPriority * 1000 - s + Math.random() * shuffleNoise };
    });
    wordScores.sort((a, b) => a.score - b.score);
    domains[i] = wordScores.map(ws => ws.word);
  }

  const solution = new Array(slots.length).fill(null);
  const usedWords = new Set();
  let nodesVisited = 0;
  const FAIL_LIMIT = 100000;

  function solve() {
    nodesVisited++;
    if (nodesVisited >= FAIL_LIMIT) return false;

    // MRV: choose slot with fewest candidates
    let bestSlot = -1;
    let bestScore = Infinity;

    for (let i = 0; i < slots.length; i++) {
      if (solution[i] === null) {
        // Count valid candidates considering current constraints
        let count = 0;
        for (const w of domains[i]) {
          if (usedWords.has(w)) continue;
          // Check constraints with already-assigned slots
          let ok = true;
          for (const c of intersectionMap[i]) {
            if (solution[c.targetSlot] !== null) {
              if (w[c.selfCharIdx] !== solution[c.targetSlot][c.targetCharIdx]) {
                ok = false; break;
              }
            }
          }
          if (ok) count++;
        }
        if (count === 0) return false;
        // Degree heuristic: more intersections = higher score
        const degree = intersectionMap[i].reduce((sum, c) => sum + (solution[c.targetSlot] === null ? 1 : 0), 0);
        const score = count - degree * 0.01;
        if (score < bestScore) {
          bestScore = score;
          bestSlot = i;
        }
      }
    }

    if (bestSlot === -1) return true;

    // Try each candidate (with intersection-aware filtering)
    for (const word of domains[bestSlot]) {
      if (usedWords.has(word)) continue;

      // Forward check: does this word conflict with existing?
      let conflict = false;
      for (const c of intersectionMap[bestSlot]) {
        if (solution[c.targetSlot] !== null) {
          if (word[c.selfCharIdx] !== solution[c.targetSlot][c.targetCharIdx]) {
            conflict = true; break;
          }
        }
      }
      if (conflict) continue;

      // Assign
      solution[bestSlot] = word;
      usedWords.add(word);

      if (solve()) return true;

      // Backtrack
      solution[bestSlot] = null;
      usedWords.delete(word);
    }

    return false;
  }

  const success = solve();
  if (!success) return null;

  // Build result grid
  const resultGrid = initialGrid.map(row => row.map(c => ({ ...c })));
  for (let i = 0; i < slots.length; i++) {
    const word = solution[i];
    for (let ci = 0; ci < word.length; ci++) {
      const cell = slots[i].cells[ci];
      resultGrid[cell.r][cell.c].value = word[ci];
    }
  }

  return resultGrid;
}

// --- TEST ---
const categories = ['nature', 'movies', 'jobs', 'food', 'body', 'tech', 'cities', 'knowledge', 'shahnameh'];

for (const cat of categories) {
  console.log(`\n=== ${cat} ===`);
  const { wordsByLength, priorityWordSet, cluesMap } = loadCategory(cat);

  // Show word counts per length
  console.log(`  Words: ${Object.values(wordsByLength).reduce((s,a)=>s+a.length,0)} total`);
  for (let l = 2; l <= 10; l++) {
    console.log(`    len${l}: ${(wordsByLength[l]||[]).length}`);
  }

  for (const size of [7, 8, 9]) {
    console.log(`  Testing ${size}×${size}...`);
    generateGrid(size, wordsByLength, priorityWordSet, cluesMap);
  }
}
