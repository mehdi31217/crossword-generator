#!/usr/bin/env node
// Pushes server/local-data/{dictionary,glue_dictionary}.json into the live
// database. The JSON files are the source of truth for the crossword word
// pools; the DB lags behind them, so this syncs every missing row, not only
// the newest word-pack entries. Credentials come from the server's own dotenv
// load — the file is never read or printed here.
// Run: node scripts/seed-word-packs.cjs [--dry] [--batch=400]
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const DRY = process.argv.includes('--dry');
const BATCH = Number((process.argv.find((a) => a.startsWith('--batch=')) || '').split('=')[1]) || 400;

require(path.join(ROOT, 'server', 'node_modules', 'dotenv')).config({ path: path.join(ROOT, 'server', '.env') });
const { Pool } = require(path.join(ROOT, 'server', 'node_modules', 'pg'));

const ZW = new RegExp('\u200c', 'g');
const norm = (s) => String(s || '').replace(ZW, '').trim();

function rowsOf(file) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, 'server', 'local-data', file), 'utf8'));
}

async function sync(pool, { table, rows, columns, mkValues, mkId }) {
  const { rows: existing } = await pool.query(`SELECT word, category, language FROM "${table}"`);
  const have = new Set(existing.map((r) => `${norm(r.word)}\u0000${r.category}\u0000${r.language}`));
  const seen = new Set();
  const missing = [];
  for (const r of rows) {
    const word = norm(r.word);
    if (!word || word.includes(' ')) continue;
    const key = `${word}\u0000${r.category || ''}\u0000${r.language || 'fa'}`;
    if (have.has(key) || seen.has(key)) continue;
    seen.add(key);
    missing.push({ ...r, word, id: mkId(r) });
  }
  console.log(`${table}: json=${rows.length} db=${existing.length} missing=${missing.length}`);
  if (DRY || missing.length === 0) return;

  let done = 0;
  const cols = ['id', ...columns];
  for (let i = 0; i < missing.length; i += BATCH) {
    const chunk = missing.slice(i, i + BATCH);
    const vals = [];
    for (const r of chunk) vals.push(r.id, ...mkValues(r));
    const tuples = chunk
      .map((_, n) => `(${cols.map((__, k) => `$${n * cols.length + k + 1}`).join(',')})`)
      .join(',');
    const sql = `INSERT INTO "${table}" (${cols.map((c) => `"${c}"`).join(',')}) VALUES ${tuples} ON CONFLICT (id) DO NOTHING`;
    await pool.query(sql, vals);
    done += chunk.length;
    process.stdout.write(`\r  inserted ${done}/${missing.length}`);
  }
  console.log('');
}

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 5 });
  const now = new Date().toISOString();

  await sync(pool, {
    table: 'dictionary',
    rows: rowsOf('dictionary.json'),
    columns: ['word', 'clue', 'category', 'language', 'length', 'created_at'],
    mkId: () => crypto.randomUUID(),
    mkValues: (r) => [r.word, r.clue, r.category || '', r.language || 'fa', norm(r.word).length, r.created_at || now],
  });

  await sync(pool, {
    table: 'glue_dictionary',
    rows: rowsOf('glue_dictionary.json'),
    columns: ['word', 'clue', 'category', 'language', 'created_at'],
    mkId: () => crypto.randomUUID(),
    mkValues: (r) => [r.word, r.clue, r.category || '', r.language || 'fa', r.created_at || now],
  });

  const { rows } = await pool.query(
    `SELECT category, language, COUNT(*)::int AS n FROM dictionary GROUP BY category, language ORDER BY category`
  );
  console.log('\ndictionary after sync:');
  for (const r of rows) console.log(`  ${(r.category || '(none)').padEnd(12)} ${r.language}  ${r.n}`);
  const g = await pool.query(`SELECT category, COUNT(*)::int AS n FROM glue_dictionary GROUP BY category ORDER BY category`);
  console.log('\nglue_dictionary after sync:');
  for (const r of g.rows) console.log(`  ${(r.category || '(none)').padEnd(12)} ${r.n}`);

  await pool.end();
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
