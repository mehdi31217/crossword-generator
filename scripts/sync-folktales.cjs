/**
 * Push the rebuilt folktale chapters (data/folktales/*Words.ts) into
 * server/local-data/*.json and PostgreSQL.
 *
 * The library reads /api/story/books, which is backed by Postgres; the JSON
 * files are the seed source. Both must be refreshed together or a fresh
 * database comes back with the old one-chapter tales.
 *
 *   node scripts/sync-folktales.cjs [--dry] [--json-only]
 */
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..');
const DRY = process.argv.includes('--dry');
const JSON_ONLY = process.argv.includes('--json-only');

const BOOKS_JSON = path.join(ROOT, 'server', 'local-data', 'story_books.json');
const CHAPTERS_JSON = path.join(ROOT, 'server', 'local-data', 'story_chapters.json');
const TMP = path.join(ROOT, 'node_modules', '.cache', 'folktales.bundle.cjs');

function stableId(text) {
  const h = crypto.createHash('md5').update(text).digest('hex');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}`;
}

function loadBooks() {
  const esbuild = require('esbuild');
  fs.mkdirSync(path.dirname(TMP), { recursive: true });
  esbuild.buildSync({
    entryPoints: [path.join(ROOT, 'data', 'folktales', 'folktalesIndex.ts')],
    bundle: true,
    platform: 'node',
    format: 'cjs',
    outfile: TMP,
    logLevel: 'silent',
  });
  const folkMod = require(TMP);

  const TMP_CAMP = path.join(ROOT, 'node_modules', '.cache', 'campaigns.bundle.cjs');
  esbuild.buildSync({
    entryPoints: [path.join(ROOT, 'data', 'campaigns.ts')],
    bundle: true,
    platform: 'node',
    format: 'cjs',
    outfile: TMP_CAMP,
    logLevel: 'silent',
  });
  const campMod = require(TMP_CAMP);

  return [...(campMod.EPIC_CAMPAIGNS || []), ...(folkMod.FOLKTALE_BOOKS || [])];
}

function buildRows(books) {
  const bookRows = [];
  const chapterRows = [];
  for (const book of books) {
    bookRows.push({
      id: book.id,
      genre: book.genre || 'folklore',
      title: book.title,
      author: book.author,
      description: book.description,
      cover_image: book.coverImage,
      difficulty: book.difficulty || 'easy',
      style: book.style || {},
      required_stars: book.requiredStars || 0,
      created_at: new Date().toISOString(),
    });
    for (const ch of book.chapters) {
      chapterRows.push({
        id: stableId(`${book.id}|${ch.id}`),
        book_id: book.id,
        chapter_index: ch.id,
        chapter_order: ch.id,
        title: ch.title,
        description: ch.description,
        image: ch.image,
        monster_avatar: ch.monsterAvatar || '',
        monster_name: ch.monsterName || '',
        victory_text: ch.victoryText || '',
        words: ch.words,
        created_at: new Date().toISOString(),
      });
    }
  }
  return { bookRows, chapterRows };
}

function writeJson(bookRows, chapterRows, ids) {
  const books = JSON.parse(fs.readFileSync(BOOKS_JSON, 'utf8'));
  const chapters = JSON.parse(fs.readFileSync(CHAPTERS_JSON, 'utf8'));

  const bookById = new Map(books.map((b, i) => [b.id, i]));
  for (const row of bookRows) {
    const i = bookById.get(row.id);
    if (i === undefined) {
      books.push(row);
      bookById.set(row.id, books.length - 1);
    } else {
      books[i] = { ...books[i], ...row, created_at: books[i].created_at || row.created_at };
    }
  }

  const kept = chapters.filter((c) => !ids.has(c.book_id));
  const byKey = new Map(chapterRows.map((c) => [`${c.book_id}|${c.chapter_index}`, c]));
  const merged = [];
  const seen = new Set();
  for (const c of chapters) {
    if (!ids.has(c.book_id)) { merged.push(c); continue; }
    const key = `${c.book_id}|${c.chapter_index}`;
    const next = byKey.get(key);
    if (!next || seen.has(key)) continue;
    seen.add(key);
    merged.push(next);
  }
  for (const c of chapterRows) {
    const key = `${c.book_id}|${c.chapter_index}`;
    if (!seen.has(key)) { seen.add(key); merged.push(c); }
  }

  fs.writeFileSync(BOOKS_JSON, JSON.stringify(books, null, 2) + '\n');
  fs.writeFileSync(CHAPTERS_JSON, JSON.stringify(merged, null, 2) + '\n');
  return { books: books.length, chapters: merged.length, dropped: chapters.length - kept.length };
}

async function syncDb(bookRows, chapterRows) {
  try {
    require('dotenv').config({ path: path.join(ROOT, 'server', '.env'), quiet: true });
  } catch (_) {}
  const db = require(path.join(ROOT, 'server', 'db'));
  const ready = await Promise.race([
    db.ready,
    new Promise((r) => setTimeout(() => r('timeout'), 60_000)),
  ]);
  if (ready !== true) {
    console.error('[sync] database not ready:', ready);
    process.exit(1);
  }

  let books = 0;
  for (const b of bookRows) {
    const res = await db._query(
      `INSERT INTO story_books (id, title, author, genre, description, cover_image, difficulty, required_stars, style)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       ON CONFLICT (id) DO UPDATE SET
         title = EXCLUDED.title, author = EXCLUDED.author, genre = EXCLUDED.genre,
         description = EXCLUDED.description, cover_image = EXCLUDED.cover_image,
         difficulty = EXCLUDED.difficulty, style = EXCLUDED.style`,
      [b.id, b.title, b.author, b.genre, b.description, b.cover_image, b.difficulty, b.required_stars, JSON.stringify(b.style)]
    );
    if (res.error) { console.error('[sync] book', b.id, res.error); continue; }
    books++;
  }

  let chapters = 0;
  for (const c of chapterRows) {
    const res = await db._query(
      `INSERT INTO story_chapters
         (id, book_id, chapter_index, chapter_order, title, description, image, monster_avatar, monster_name, victory_text, words)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       ON CONFLICT (book_id, chapter_index) DO UPDATE SET
         chapter_order = EXCLUDED.chapter_order, title = EXCLUDED.title,
         description = EXCLUDED.description, image = EXCLUDED.image,
         monster_avatar = EXCLUDED.monster_avatar, monster_name = EXCLUDED.monster_name,
         victory_text = EXCLUDED.victory_text, words = EXCLUDED.words`,
      [c.id, c.book_id, c.chapter_index, c.chapter_order, c.title, c.description,
       c.image, c.monster_avatar, c.monster_name, c.victory_text, JSON.stringify(c.words)]
    );
    if (res.error) { console.error('[sync] chapter', c.book_id, c.chapter_index, res.error); continue; }
    chapters++;
  }

  const maxChapterByBook = new Map();
  for (const c of chapterRows) {
    maxChapterByBook.set(c.book_id, Math.max(maxChapterByBook.get(c.book_id) || 0, c.chapter_index));
  }
  for (const [id, maxCh] of maxChapterByBook.entries()) {
    await db._query(`DELETE FROM story_chapters WHERE book_id = $1 AND chapter_index > $2`, [id, maxCh]);
  }
  return { books, chapters };
}

(async () => {
  const books = loadBooks();
  const { bookRows, chapterRows } = buildRows(books);
  const ids = new Set(bookRows.map((b) => b.id));

  console.log(`[sync] content: ${bookRows.length} books, ${chapterRows.length} chapters, ${chapterRows.reduce((n, c) => n + c.words.length, 0)} words`);

  if (DRY) {
    for (const b of bookRows) {
      const n = chapterRows.filter((c) => c.book_id === b.id).length;
      console.log(`  - ${b.id}: ${n} chapters`);
    }
    console.log('[sync] dry run — nothing written');
    process.exit(0);
  }

  const jsonStats = writeJson(bookRows, chapterRows, ids);
  console.log(`[sync] json: ${jsonStats.books} books, ${jsonStats.chapters} chapters (${jsonStats.dropped} old chapter rows replaced)`);

  if (!JSON_ONLY) {
    const dbStats = await syncDb(bookRows, chapterRows);
    console.log(`[sync] db: ${dbStats.books} books, ${dbStats.chapters} chapters upserted`);
  }

  process.exit(0);
})().catch((e) => {
  console.error('[sync] failed:', e);
  process.exit(1);
});
