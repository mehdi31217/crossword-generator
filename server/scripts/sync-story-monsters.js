/**
 * Push `monster_avatar` / `monster_name` from local-data/story_chapters.json
 * into PostgreSQL.
 *
 * Seeding only runs on an empty table, so the rows created before the avatar
 * re-curation kept serving the old abstract `.svg` paths to the game.
 *
 *   cd server && node scripts/sync-story-monsters.js [--dry]
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const fs = require('fs');

const DRY = process.argv.includes('--dry');

(async () => {
  const db = require('../db');
  const ready = await Promise.race([
    db.ready,
    new Promise(r => setTimeout(() => r('timeout'), 60_000)),
  ]);
  if (ready !== true) {
    console.error('[sync] database not ready:', ready);
    process.exit(1);
  }

  const rows = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'local-data', 'story_chapters.json'), 'utf8'));
  try {
    await db._query(`ALTER TABLE story_chapters ADD COLUMN IF NOT EXISTS monster_name TEXT DEFAULT ''`);
  } catch (e) {
    console.warn('[sync] column check:', e.message);
  }

  let changed = 0;
  for (const row of rows) {
    if (!row.book_id || row.chapter_index === undefined) continue;
    const avatar = row.monster_avatar || '';
    const name = row.monster_name || '';
    if (!avatar) continue;
    if (DRY) { changed++; continue; }
    const res = await db._query(
      `UPDATE story_chapters SET monster_avatar = $1, monster_name = $2
       WHERE book_id = $3 AND chapter_index = $4`,
      [avatar, name, row.book_id, row.chapter_index]
    );
    if (res.error) {
      console.error('[sync]', row.book_id, row.chapter_index, res.error);
      continue;
    }
    changed++;
  }

  const left = await db._query(`SELECT COUNT(*)::int AS n FROM story_chapters WHERE monster_avatar LIKE '%.svg'`);
  console.log(`[sync] ${DRY ? 'would update' : 'updated'} ${changed} chapters; svg rows left: ${left.data?.[0]?.n}`);
  process.exit(0);
})().catch(e => {
  console.error('[sync] failed:', e);
  process.exit(1);
});
