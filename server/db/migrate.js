#!/usr/bin/env node
/**
 * migrate.js — SQLite → PostgreSQL Data Migration
 *
 * Reads all data from the SQLite database and writes it to PostgreSQL.
 * Safe to run multiple times (uses ON CONFLICT DO NOTHING).
 *
 * Usage:
 *   DB_TYPE=postgres DATABASE_URL=postgresql://localhost/crossword node db/migrate.js
 *
 * Or with a custom SQLite file:
 *   SQLITE_PATH=./data.sqlite node db/migrate.js
 */

const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// ─── Config ────────────────────────────────────────────────
const SQLITE_PATH = process.env.SQLITE_PATH || path.join(__dirname, '..', 'local-data', 'game.db');
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://localhost/crossword';
const BATCH_SIZE = parseInt(process.env.BATCH_SIZE || '100');

const TABLES = [
  'profiles',
  'dictionary',
  'glue_dictionary',
  'matches',
  'messages',
  'notifications',
  'friendships',
  'story_books',
  'story_chapters',
];

// ─── Connect ───────────────────────────────────────────────

async function connectSQLite() {
  const { DatabaseSync } = require('node:sqlite');
  if (!fs.existsSync(SQLITE_PATH)) {
    console.error(`❌ SQLite database not found: ${SQLITE_PATH}`);
    console.error(`   Set SQLITE_PATH or run from the server directory`);
    process.exit(1);
  }
  const sqlite = new DatabaseSync(SQLITE_PATH);
  console.log(`✅ Connected to SQLite: ${SQLITE_PATH} (${fs.statSync(SQLITE_PATH).size} bytes)`);
  return sqlite;
}

async function connectPG() {
  const { Pool } = require('pg');
  const pool = new Pool({ connectionString: DATABASE_URL, max: 10 });
  // Test connection
  const client = await pool.connect();
  try {
    await client.query('SELECT 1');
    console.log(`✅ Connected to PostgreSQL: ${DATABASE_URL.replace(/\/\/.*@/, '//user:pass@')}`);
  } finally {
    client.release();
  }
  return pool;
}

// ─── Migration ─────────────────────────────────────────────

function readAll(sqlite, table) {
  try {
    const stmt = sqlite.prepare(`SELECT * FROM "${table}"`);
    const rows = stmt.all();
    return rows.map(r => {
      const obj = {};
      for (const [k, v] of Object.entries(r)) {
        obj[k] = typeof v === 'bigint' ? Number(v) : v;
      }
      return obj;
    });
  } catch (e) {
    console.error(`  ⚠️  Error reading ${table}: ${e.message}`);
    return [];
  }
}

async function migrateTable(pool, table, rows) {
  if (rows.length === 0) {
    console.log(`  ${table}: 0 rows (skipping)`);
    return 0;
  }

  let migrated = 0;
  let errors = 0;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);

    for (const row of batch) {
      const cols = Object.keys(row);
      const placeholders = cols.map((_, j) => `$${j + 1}`).join(', ');
      const vals = cols.map(c => {
        const v = row[c];
        return typeof v === 'object' && v !== null ? JSON.stringify(v) : v;
      });

      try {
        await pool.query(
          `INSERT INTO "${table}" (${cols.map(c => `"${c}"`).join(',')}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`,
          vals
        );
        migrated++;
      } catch (e) {
        errors++;
        if (errors <= 5) {
          console.error(`  ⚠️  Error inserting row in ${table}: ${e.message.substring(0, 100)}`);
        }
      }
    }

    process.stdout.write(`\r  ${table}: ${migrated}/${rows.length} rows (${errors} errors)`);
  }

  console.log(`\n  ${table}: ✅ ${migrated} migrated, ${errors} errors, ${rows.length - migrated - errors} skipped (duplicates)`);
  return migrated;
}

async function runSchemaMigration(pool) {
  const schemaPath = path.join(__dirname, '..', 'schema.pg.sql');
  if (!fs.existsSync(schemaPath)) {
    console.log(`  ⚠️  schema.pg.sql not found, using inline schema`);
    return;
  }

  const sql = fs.readFileSync(schemaPath, 'utf8');
  const statements = sql.split(';').filter(s => s.trim().length > 0);

  for (const stmt of statements) {
    try {
      await pool.query(stmt + ';');
    } catch (e) {
      if (!e.message?.includes('already exists')) {
        console.error(`  ⚠️  Schema error: ${e.message.substring(0, 100)}`);
      }
    }
  }
  console.log(`✅ Schema applied`);
}

// ─── Main ──────────────────────────────────────────────────

async function main() {
  console.log('═══════════════════════════════════════════');
  console.log('  SQLite → PostgreSQL Migration');
  console.log('═══════════════════════════════════════════\n');

  const sqlite = await connectSQLite();
  const pool = await connectPG();

  console.log(`\n📋 Running schema migration...`);
  await runSchemaMigration(pool);

  let total = 0;
  for (const table of TABLES) {
    const rows = readAll(sqlite, table);
    console.log(`\n📦 ${table}: ${rows.length} rows in SQLite`);
    const count = await migrateTable(pool, table, rows);
    total += count;
  }

  // Verify
  console.log(`\n═══════════════════════════════════════════`);
  console.log(`✅ Migration complete: ${total} total rows migrated`);
  console.log(`\n📊 Verification:`);
  for (const table of TABLES) {
    try {
      const result = await pool.query(`SELECT COUNT(*)::int AS cnt FROM "${table}"`);
      const pgCount = result.rows[0]?.cnt || 0;
      const sqliteCount = readAll(sqlite, table).length;
      const status = pgCount === sqliteCount ? '✅' : '⚠️';
      console.log(`  ${status} ${table}: SQLite=${sqliteCount} → PG=${pgCount}`);
    } catch (e) {
      console.log(`  ❌ ${table}: ${e.message.substring(0, 80)}`);
    }
  }

  sqlite.close();
  await pool.end();
}

main().catch(e => {
  console.error('\n❌ Migration failed:', e);
  process.exit(1);
});
