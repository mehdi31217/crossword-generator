/**
 * Database factory — PostgreSQL-only mode.
 *
 * DB_TYPE=postgres → PostgresDB (required, exits on failure)
 * DB_TYPE=auto     → Tries PostgresDB, falls back to SQLite (deprecated)
 * DB_TYPE=sqlite   → SQLiteDB (legacy, for dev without PG)
 *
 * In postgres mode, if DATABASE_URL is not set or connection fails,
 * the server logs a fatal error and exits — no silent fallback.
 *
 * Set DATABASE_URL in .env:
 *   DATABASE_URL=postgresql://user:password@host:port/crossword
 */

const logger = require('../utils/logger');
const DB_TYPE = (process.env.DB_TYPE || 'sqlite').toLowerCase();

let activeDb = null;
let activeType = 'none';

// ─── PostgreSQL ─────────────────────────────────────────

async function _initPostgres() {
  const PostgresDB = require('./PostgresDB');
  const db = new PostgresDB();

  // Wait for connection + schema migration + seeding to complete. Seeding a
  // fresh database can take several seconds, so allow a generous window.
  const outcome = await Promise.race([
    db.ready,
    new Promise(resolve => setTimeout(() => resolve('timeout'), 60_000)),
  ]);

  if (outcome === true || db.connected) {
    activeDb = db;
    activeType = 'postgres';
    logger.info('[db] ✅ PostgreSQL active');
    return true;
  }

  // Safety valve: connection works but init is unusually slow — accept it
  // rather than hard-failing (queries are guarded by the pool check).
  if (outcome === 'timeout' && db.pool) {
    activeDb = db;
    activeType = 'postgres';
    logger.warn('[db] ⚠️ PostgreSQL accepted while still initializing (slow seed)');
    return true;
  }

  return false;
}

// ─── SQLite (legacy fallback) ────────────────────────────

function _initSQLite() {
  const SQLiteDB = require('./SQLiteDB');
  const db = new SQLiteDB();
  activeDb = db;
  activeType = 'sqlite';
  logger.info('[db] ⚠️ SQLite active (legacy fallback)');
  return true;
}

// ─── Factory ─────────────────────────────────────────────

const factory = {
  get type() { return activeType; },
  get ready() { return initPromise; },
};

const handler = {
  get(target, prop) {
    if (prop in factory) {
      const val = factory[prop];
      return typeof val === 'function' ? val.bind(factory) : val;
    }
    if (!activeDb) {
      throw new Error(`[db] No database backend available`);
    }
    const val = activeDb[prop];
    if (typeof val === 'function') {
      return function (...args) { return val.apply(activeDb, args); };
    }
    return val;
  },
  set(target, prop, value) {
    if (prop in factory) {
      factory[prop] = value;
      return true;
    }
    if (!activeDb) return false;
    activeDb[prop] = value;
    return true;
  },
};

// ─── Init (async wrapper) ────────────────────────────────

async function _init() {
  let initOk = false;

  if (DB_TYPE === 'postgres') {
    initOk = await _initPostgres();
    if (!initOk) {
      logger.error('[db] ❌ FATAL: DB_TYPE=postgres but PostgreSQL is not reachable.');
      logger.error('[db]   Set DATABASE_URL in server/.env');
      logger.error('[db]   Example: DATABASE_URL=postgresql://postgres:pass@127.0.0.1:5432/crossword');
      process.exit(1);
    }
  } else {
    if (DB_TYPE === 'auto') {
      initOk = await _initPostgres();
    }
    if (!initOk) {
      _initSQLite();
      initOk = true;
    }
  }

  return initOk;
}

const initPromise = _init();

const db = new Proxy({}, handler);
module.exports = db;
