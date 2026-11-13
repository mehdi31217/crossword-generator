// Fix story_chapters.json with real data from TS word files (v3)
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const CHAPTERS_FILE = path.join(__dirname, '..', 'server', 'local-data', 'story_chapters.json');
const TS_DIR = path.join(__dirname, '..', 'data', 'shahnameh');

const booksToFix = [
  { id: 'zal_simorgh',   tsFile: 'zalSimorghWords.ts' },
  { id: 'kaykhosrow',    tsFile: 'kaykhosrowWords.ts' },
  { id: 'rostam_akvan',  tsFile: 'rostamAkvanWords.ts' },
  { id: 'rostam_death',  tsFile: 'rostamDeathWords.ts' },
  { id: 'hushang',       tsFile: 'hushangWords.ts' },
  { id: 'jamshid',       tsFile: 'jamshidWords.ts' },
  { id: 'anushirvan',    tsFile: 'anushirvanWords.ts' },
];

function extractWordArray(content, arrayName) {
  const pattern = new RegExp(
    `(?:const|let|var)\\s+${arrayName}\\s*(?:=|:\\s*\\w+\\[\\]\\s*=\\s*)\\s*\\[([\\s\\S]*?)\\];`
  );
  const m = content.match(pattern);
  if (!m) return null;
  const body = m[1];
  const words = [];
  const wordMatches = body.matchAll(/\{\s*word:\s*"([^"]*)",\s*clue:\s*"([^"]*)"\s*\}/g);
  for (const wm of wordMatches) {
    words.push({ word: wm[1], clue: wm[2] });
  }
  return words;
}

function extractField(fieldRegex, block) {
  const m = block.match(fieldRegex);
  return m ? m[1] : null;
}

function extractChapters(tsPath, bookId) {
  const content = fs.readFileSync(tsPath, 'utf8');

  // Find the chapter array export
  const exportMatch = content.match(/export\s+const\s+(\w+)\s*:\s*ShahnamehChapter\[\]\s*=\s*\[([\s\S]*)\];\s*$/);
  if (!exportMatch) {
    console.error(`  Could not find chapter export in ${tsPath}`);
    return null;
  }

  const chapterConst = exportMatch[1];
  let arrayContent = exportMatch[2];

  // Split by chapter blocks: find each { id: ... }
  // Use a simple approach: iterate character by character to find top-level braces
  const chapters = [];
  let depth = 0;
  let currentBlock = '';
  let inBlock = false;
  
  for (let i = 0; i < arrayContent.length; i++) {
    const ch = arrayContent[i];
    
    if (ch === '{') {
      if (depth === 0) {
        // Start of a new chapter object
        currentBlock = '';
        inBlock = true;
      }
      depth++;
    }
    
    if (inBlock) currentBlock += ch;
    
    if (ch === '}') {
      depth--;
      if (depth === 0 && inBlock) {
        // End of a chapter object
        // Parse this block
        const block = currentBlock;
        
        const idStr = extractField(/id:\s*(\d+)\s*,/, block);
        const title = extractField(/title:\s*"((?:[^"\\]|\\.)*)"/, block);
        
        // description (template literal with backticks)
        const descMatch = block.match(/description:\s*`([\s\S]*?)`\s*,/);
        const description = descMatch ? descMatch[1].trim() : '';
        
        // image
        const image = extractField(/image:\s*"((?:[^"\\]|\\.)*)"/, block);
        
        // monsterAvatar
        const monsterAvatar = extractField(/monsterAvatar:\s*"((?:[^"\\]|\\.)*)"/, block);
        
        // victoryText (could be double-quoted OR template literal)
        let victoryText = '';
        const vtBacktick = block.match(/victoryText:\s*`([\s\S]*?)`\s*,/);
        if (vtBacktick) {
          victoryText = vtBacktick[1].trim();
        } else {
          const vtQuote = block.match(/victoryText:\s*"((?:[^"\\]|\\.)*)"/);
          if (vtQuote) victoryText = vtQuote[1].trim();
        }
        
        // created_at
        const created_at = extractField(/created_at:\s*"((?:[^"\\]|\\.)*)"/, block) || "2026-06-04T22:00:00.000Z";
        
        // words (referenced by const name like ZAL_SIMORGH_CHAPTER_1)
        const wordRef = extractField(/words:\s*(\w+)/, block);
        let words = [];
        if (wordRef) {
          const extracted = extractWordArray(content, wordRef);
          if (extracted) words = extracted;
        }
        
        chapters.push({
          id: crypto.randomUUID(),
          book_id: bookId,
          title: title || 'Unknown',
          description,
          image: image || '',
          chapter_index: idStr ? parseInt(idStr) : (chapters.length + 1),
          victory_text: victoryText,
          words,
          monster_avatar: monsterAvatar || '',
          created_at
        });
        
        inBlock = false;
        currentBlock = '';
      }
    }
  }

  return chapters.length > 0 ? chapters : null;
}

// Load existing chapters
let allChapters = JSON.parse(fs.readFileSync(CHAPTERS_FILE, 'utf8'));

console.log('Total chapters before:', allChapters.length);
let updated = 0;

for (const book of booksToFix) {
  const oldCount = allChapters.filter(c => c.book_id === book.id).length;
  allChapters = allChapters.filter(c => c.book_id !== book.id);

  const tsPath = path.join(TS_DIR, book.tsFile);
  if (!fs.existsSync(tsPath)) {
    console.error(`  File not found: ${tsPath}`);
    continue;
  }

  const chapters = extractChapters(tsPath, book.id);
  if (!chapters || chapters.length === 0) {
    console.error(`  No chapters extracted for ${book.id}`);
    continue;
  }

  for (const ch of chapters) allChapters.push(ch);

  const totalWords = chapters.reduce((s, c) => s + c.words.length, 0);
  const emptyDesc = chapters.filter(c => !c.description).length;
  const emptyVt = chapters.filter(c => !c.victory_text).length;
  const emptyWords = chapters.filter(c => c.words.length === 0).length;
  console.log(`  ${book.id}: ${oldCount}→${chapters.length}ch, ${totalWords}words (desc=${emptyDesc}, vt=${emptyVt}, emptyWords=${emptyWords})`);
  updated++;
}

if (updated > 0) {
  fs.writeFileSync(CHAPTERS_FILE, JSON.stringify(allChapters, null, 2), 'utf8');
  console.log(`\n✅ Updated ${updated} books. Total chapters: ${allChapters.length}`);
} else {
  console.log('\n⚠️ No books updated.');
}
