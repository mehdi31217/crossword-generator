/**
 * PostgresDB — Asynchronous PostgreSQL driver using pg.Pool
 *
 * Matches the SQLiteDB.js interface exactly so db/index.js can swap them.
 * All methods return { data, error } for backward compatibility.
 *
 * Graceful fallback: if DATABASE_URL is not set, the constructor returns
 * a "not connected" error for every operation (caller must check or retry).
 */

const { Pool, types } = require('pg');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const logger = require('../utils/logger');
// Server-side league math (mirror of services/league.ts) — used to derive
// league/highest_league from a trophy count. Never fed by client input.
const leagueMath = require('../league');

// Every timestamp in this schema is a bare `TIMESTAMP` and every value we write is
// UTC (`new Date().toISOString()`, or `NOW()` read back in a UTC session — see the
// `timezone` option on the pool below). node-postgres, however, parses a bare
// TIMESTAMP as *process-local* time, so with a non-UTC host TZ (`Asia/Tehran` here)
// each row read back landed 3.5 hours in the past: a challenge invite created a
// second ago looked hours old, chat times were wrong, and the duel TTL fired early.
// Pin the parse back to UTC so stored and read values mean the same instant.
types.setTypeParser(1114, (value) => (value === null ? null : new Date(`${value.replace(' ', 'T')}Z`)));

const DATA_DIR = path.join(__dirname, '..', 'local-data');

const JSON_COLUMNS = {
  // `items` MUST be here: without it getUser() handed the client the raw TEXT
  // '{"trophyShield":0,...}', so `player.items.trophyShield` was undefined and
  // trophy shield/boost silently never worked.
  profiles: ['epic_progress_map', 'epic_stars', 'epic_progress', 'game_history', 'card_progress', 'worldmap_cards', 'items', 'daily_quests', 'cosmetics', 'claimed_sets'],
  notifications: ['payload'],
  story_books: ['style'],
  story_chapters: ['words'],
  duel_arenas: ['board', 'creator_result'],
  duel_invites: ['opponent_result'],
};

class PostgresDB {
  constructor() {
    this.connected = false;
    this.pool = null;
    // Resolves (true/false) once connection + schema + seeding have finished.
    // db/index.js awaits this so no query runs against a half-migrated schema.
    this.ready = new Promise((resolve) => { this._readyResolve = resolve; });
    this._init();
  }

  // ─── Internal ───────────────────────────────────────────

  _init() {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      logger.warn('[PostgresDB] DATABASE_URL not set — will try auto-connect on first query or stay disconnected');
      this._readyResolve(false);
      return;
    }
    try {
      this.pool = new Pool({
        connectionString: dbUrl,
        // Keep the session clock in UTC: the columns are tz-naive, so a non-UTC
        // session would store `NOW()` defaults as local wall-clock while the driver
        // writes UTC strings — the two would then disagree. See the type parser above.
        options: '-c timezone=UTC',
        max: parseInt(process.env.PG_POOL_MAX || '20'),
        idleTimeoutMillis: parseInt(process.env.PG_IDLE_TIMEOUT || '30000'),
        connectionTimeoutMillis: parseInt(process.env.PG_CONNECT_TIMEOUT || '5000'),
      });
      // Test connection
      this.pool.query('SELECT 1 AS ok').then(async () => {
        console.log('[PostgresDB] ✅ Connected to PostgreSQL');
        await this._ensureSchema().catch(e => console.error('[PostgresDB] Schema init error:', e.message));
        await this._seedIfNeeded().catch(e => logger.warn('[PostgresDB] Seed error:', e.message));
        this.connected = true;
        this._readyResolve(true);
      }).catch(err => {
        logger.warn('[PostgresDB] ❌ Connection failed:', err.message);
        logger.warn('[PostgresDB] Will use SQLite fallback — set DATABASE_URL to enable PG');
        this.pool = null;
        this._readyResolve(false);
      });
    } catch (e) {
      logger.warn('[PostgresDB] Init error:', e.message);
      this.pool = null;
      this._readyResolve(false);
    }
  }

  async _ensureSchema() {
    // NOTE: guard on `pool` (not `connected`) — `connected` is set to true only
    // AFTER schema+seed finish, so guarding on it here would skip migrations.
    if (!this.pool) return;
    const schemaPath = path.join(__dirname, '..', 'schema.pg.sql');
    let sql;
    if (fs.existsSync(schemaPath)) {
      sql = fs.readFileSync(schemaPath, 'utf8');
    } else {
      // Inline schema — PostgreSQL-compatible version of schema.sql
      sql = this._getSchemaSQL();
    }
    const statements = sql.split(';').filter(s => s.trim().length > 0);
    for (const stmt of statements) {
      try {
        await this.pool.query(stmt + ';');
      } catch (e) {
        // Skip if table already exists
        if (!e.message?.includes('already exists')) {
          logger.warn('[PostgresDB] Schema statement warning:', e.message);
        }
      }
    }
    // Run migrations
    const migrations = [
      `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS password_hash TEXT DEFAULT NULL`,
      `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trophies INTEGER DEFAULT 0`,
      `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS league TEXT DEFAULT 'bronze'`,
      `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS items TEXT DEFAULT '{"trophyShield":0,"trophyBoost":0}'`,
      `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS card_progress TEXT DEFAULT '{}'`,
      // World-map collectible cards (`{ [chapterId]: rarity }`). Kept apart from
      // `card_progress`, which holds the older star-based mini-game cards and
      // has a different value shape.
      `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS worldmap_cards TEXT DEFAULT '{}'`,
      // League counters the server now owns. Without these, PlayerLeague's
      // non-trophy fields could not be persisted at all.
      `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_losses INTEGER DEFAULT 0`,
      `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS win_streak INTEGER DEFAULT 0`,
      `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS highest_league TEXT DEFAULT 'bronze'`,
      // ── Progression (see server/progression.js) ──
      // Streak, quests, season and cosmetics are server-owned; the client only
      // reads them. `xp` already exists in the schema file but fresh databases
      // created before this migration did not reliably carry it.
      `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0`,
      `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS daily_streak INTEGER DEFAULT 0`,
      `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS daily_streak_best INTEGER DEFAULT 0`,
      `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS daily_streak_last TEXT DEFAULT ''`,
      `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS daily_quests TEXT DEFAULT '{}'`,
      `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cosmetics TEXT DEFAULT '{"owned":[],"frame":"","title":""}'`,
      `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS claimed_sets TEXT DEFAULT '[]'`,
      `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS season_id TEXT DEFAULT ''`,
      `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS season_pending_tier TEXT DEFAULT ''`,
      `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS season_reward_claimed TEXT DEFAULT ''`,
      // story_books.difficulty holds 'easy' | 'medium' | 'hard' (frontend type),
      // not an integer — repair databases created with the wrong column type.
      `ALTER TABLE story_books ALTER COLUMN difficulty TYPE TEXT USING difficulty::text`,
      `ALTER TABLE story_chapters ADD COLUMN IF NOT EXISTS monster_name TEXT DEFAULT ''`,
      // Minimal behaviour log so retention changes can be measured at all. Kept
      // deliberately small: seven event types, no personal data beyond the id.
      `CREATE TABLE IF NOT EXISTS events (
         id TEXT PRIMARY KEY,
         user_id TEXT DEFAULT '',
         type TEXT DEFAULT '',
         payload TEXT DEFAULT '{}',
         created_at TIMESTAMP DEFAULT NOW()
       )`,
      `CREATE INDEX IF NOT EXISTS idx_events_user_time ON events(user_id, created_at)`,
      `CREATE INDEX IF NOT EXISTS idx_events_type_time ON events(type, created_at)`,
    ];
    for (const sql2 of migrations) {
      try { await this.pool.query(sql2); } catch (e) { /* ignore */ }
    }
  }

  _getSchemaSQL() {
    return `
      CREATE TABLE IF NOT EXISTS profiles (
        id TEXT PRIMARY KEY,
        username TEXT DEFAULT '',
        phone TEXT DEFAULT '',
        device_id TEXT DEFAULT '',
        friend_code TEXT DEFAULT '',
        password_hash TEXT DEFAULT NULL,
        avatar_text TEXT DEFAULT '👤',
        is_guest INTEGER DEFAULT 1,
        score INTEGER DEFAULT 0,
        high_score INTEGER DEFAULT 0,
        coins INTEGER DEFAULT 100,
        level INTEGER DEFAULT 1,
        xp INTEGER DEFAULT 0,
        is_online INTEGER DEFAULT 0,
        is_admin INTEGER DEFAULT 0,
        last_daily_date TEXT DEFAULT '',
        tower_tickets INTEGER DEFAULT 3,
        tower_high_floor INTEGER DEFAULT 0,
        total_matches INTEGER DEFAULT 0,
        total_wins INTEGER DEFAULT 0,
        epic_stars TEXT DEFAULT '{}',
        epic_progress TEXT DEFAULT '{}',
        epic_progress_map TEXT DEFAULT '{}',
        game_history TEXT DEFAULT '[]',
        updated_at TEXT DEFAULT '',
        last_ticket_refill TEXT DEFAULT '',
        daily_tower_coins INTEGER DEFAULT 0,
        trophies INTEGER DEFAULT 0,
        league TEXT DEFAULT 'bronze',
        items TEXT DEFAULT '{"trophyShield":0,"trophyBoost":0}',
        created_at TEXT DEFAULT (NOW())
      );
      CREATE TABLE IF NOT EXISTS dictionary (
        id TEXT PRIMARY KEY,
        word TEXT NOT NULL,
        clue TEXT NOT NULL,
        category TEXT DEFAULT '',
        language TEXT DEFAULT 'fa',
        length INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (NOW())
      );
      CREATE TABLE IF NOT EXISTS glue_dictionary (
        id TEXT PRIMARY KEY,
        word TEXT NOT NULL,
        clue TEXT NOT NULL,
        category TEXT DEFAULT '',
        language TEXT DEFAULT 'fa',
        created_at TEXT DEFAULT (NOW())
      );
      CREATE TABLE IF NOT EXISTS matches (
        id TEXT PRIMARY KEY,
        user_id TEXT DEFAULT '',
        player_id TEXT DEFAULT '',
        opponent_id TEXT DEFAULT '',
        mode TEXT DEFAULT '',
        category TEXT DEFAULT '',
        size INTEGER DEFAULT 0,
        grid_size INTEGER DEFAULT 0,
        score INTEGER DEFAULT 0,
        seconds INTEGER DEFAULT 0,
        time_taken INTEGER DEFAULT 0,
        won INTEGER DEFAULT 0,
        date_played TEXT DEFAULT '',
        created_at TEXT DEFAULT (NOW()),
        finished_at TEXT DEFAULT (NOW())
      );
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        sender_id TEXT NOT NULL,
        receiver_id TEXT NOT NULL,
        content TEXT NOT NULL,
        read INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (NOW())
      );
      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        sender_id TEXT DEFAULT '',
        type TEXT DEFAULT '',
        payload TEXT DEFAULT '{}',
        created_at TEXT DEFAULT (NOW())
      );
      CREATE TABLE IF NOT EXISTS friendships (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        friend_id TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at TEXT DEFAULT (NOW())
      );
      CREATE TABLE IF NOT EXISTS story_books (
        id TEXT PRIMARY KEY,
        title TEXT DEFAULT '',
        title_fa TEXT DEFAULT '',
        author TEXT DEFAULT '',
        genre TEXT DEFAULT 'epic',
        description TEXT DEFAULT '',
        cover_image TEXT DEFAULT '',
        difficulty TEXT DEFAULT 'medium',
        required_stars INTEGER DEFAULT 0,
        style TEXT DEFAULT '{}',
        created_at TEXT DEFAULT (NOW())
      );
      CREATE TABLE IF NOT EXISTS story_chapters (
        id TEXT PRIMARY KEY,
        book_id TEXT DEFAULT '',
        title TEXT DEFAULT '',
        title_fa TEXT DEFAULT '',
        description TEXT DEFAULT '',
        image TEXT DEFAULT '',
        chapter_index INTEGER DEFAULT 0,
        chapter_order INTEGER DEFAULT 0,
        monster_avatar TEXT DEFAULT '',
        monster_name TEXT DEFAULT '',
        victory_text TEXT DEFAULT '',
        words TEXT DEFAULT '[]',
        created_at TEXT DEFAULT (NOW())
      );
      CREATE UNIQUE INDEX IF NOT EXISTS idx_story_chapters_book_chapter ON story_chapters(book_id, chapter_index);
      CREATE INDEX IF NOT EXISTS idx_matches_user_id ON matches(user_id);
      CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id, receiver_id);
      CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
      CREATE INDEX IF NOT EXISTS idx_friendships_user ON friendships(user_id);
      CREATE INDEX IF NOT EXISTS idx_friendships_friend ON friendships(friend_id);
      CREATE INDEX IF NOT EXISTS idx_dictionary_category ON dictionary(category, language);
      CREATE INDEX IF NOT EXISTS idx_dictionary_word ON dictionary(word);
      CREATE INDEX IF NOT EXISTS idx_profiles_friend_code ON profiles(friend_code);
      CREATE INDEX IF NOT EXISTS idx_profiles_score ON profiles(score DESC);
    `;
  }

  async _seedIfNeeded() {
    if (!this.pool) return;
    const tables = [
      'profiles', 'dictionary', 'glue_dictionary', 'matches',
      'messages', 'notifications', 'friendships', 'story_books', 'story_chapters'
    ];
    for (const table of tables) {
      const jsonFile = path.join(DATA_DIR, `${table}.json`);
      if (!fs.existsSync(jsonFile)) continue;
      let data;
      try { data = JSON.parse(fs.readFileSync(jsonFile, 'utf8')); } catch { continue; }
      if (!Array.isArray(data) || data.length === 0) continue;

      const result = await this._query(`SELECT COUNT(*)::int AS cnt FROM "${table}"`);
      const dbCount = result.data?.[0]?.cnt ?? 0;
      if (dbCount === 0) {
        if (['dictionary', 'glue_dictionary'].includes(table)) {
          data = data.filter(r => r.word && !r.word.includes(' ') && r.word.length > 0);
          for (const r of data) r.word = r.word.replace(/‌/g, '');
        }
        console.log(`  ${table}: seeding ${data.length} rows`);
        await this._bulkInsert(table, data);
      }
    }
  }

  async _bulkInsert(table, rows) {
    if (!this.pool) return;
    for (const row of rows) {
      // Seed files for some tables (e.g. glue_dictionary) omit `id`; the tables
      // use a NOT NULL text primary key with no default, so generate one.
      if (row.id === undefined || row.id === null) row.id = this._genId();
      const cols = Object.keys(row);
      const placeholders = cols.map((_, i) => `$${i + 1}`).join(',');
      const vals = cols.map(c =>
        typeof row[c] === 'object' && row[c] !== null ? JSON.stringify(row[c]) : (row[c] === undefined ? null : row[c])
      );
      const sql = `INSERT INTO "${table}" (${cols.map(c => `"${c}"`).join(',')}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`;
      try {
        await this.pool.query(sql, vals);
      } catch (e) {
        // Skip rows that fail
      }
    }
  }

  // ─── Query helpers ───────────────────────────────────────

  async _query(sql, params = []) {
    if (!this.pool) {
      return { data: null, error: 'PostgreSQL not connected — check DATABASE_URL' };
    }
    try {
      const result = await this.pool.query(sql, params);
      return { data: result.rows, error: null };
    } catch (e) {
      return { data: null, error: e.message };
    }
  }

  async _getOne(sql, params = []) {
    const result = await this._query(sql, params);
    if (result.error) return { data: null, error: result.error };
    return { data: result.data?.[0] || null, error: null };
  }

  async _run(sql, params = []) {
    return this._query(sql, params);
  }

  _genId() { return crypto.randomUUID(); }
  _now() { return new Date().toISOString(); }

  _parseJson(row, table) {
    if (!row) return null;
    const jsonCols = JSON_COLUMNS[table] || [];
    const obj = {};
    for (const [k, v] of Object.entries(row)) {
      let val = v;
      if (typeof val === 'string' && jsonCols.includes(k)) {
        try { val = JSON.parse(val); } catch (e) { /* not JSON, keep string */ }
      }
      obj[k] = val;
    }
    if (table === 'profiles' && 'season_reward_claimed' in obj) {
      const v = obj.season_reward_claimed;
      obj.season_reward_claimed = v === true || v === 1 || v === '1' || v === 'true';
    }
    return obj;
  }

  // ─── Profile ───────────────────────────────────────────

  async getUser(id) {
    const result = await this._getOne(`SELECT * FROM profiles WHERE id = $1`, [id]);
    return { data: result.data ? this._parseJson(result.data, 'profiles') : null, error: result.error };
  }

  async getUserByPhone(phone) {
    const result = await this._getOne(`SELECT * FROM profiles WHERE phone = $1`, [phone]);
    return { data: result.data ? this._parseJson(result.data, 'profiles') : null, error: null };
  }

  async createUser(data) {
    const id = data.id || this._genId();
    const now = this._now();
    const row = {
      id,
      username: data.username || 'بازیکن',
      phone: data.phone || null,
      friend_code: data.friend_code || null,
      avatar_text: data.avatar_text || data.avatar || '👤',
      score: 0,
      high_score: 0,
      level: 1,
      coins: 0,
      tower_tickets: 10,
      game_history: JSON.stringify([]),
      epic_progress_map: JSON.stringify({}),
      epic_stars: JSON.stringify({}),
      epic_progress: JSON.stringify({}),
      created_at: now,
      ...data,
      id,
      created_at: now,
    };
    row.game_history = typeof row.game_history === 'string' ? row.game_history : JSON.stringify(row.game_history || []);
    row.epic_progress_map = typeof row.epic_progress_map === 'string' ? row.epic_progress_map : JSON.stringify(row.epic_progress_map || {});
    row.epic_stars = typeof row.epic_stars === 'string' ? row.epic_stars : JSON.stringify(row.epic_stars || {});
    row.epic_progress = typeof row.epic_progress === 'string' ? row.epic_progress : JSON.stringify(row.epic_progress || {});

    const cols = Object.keys(row);
    const placeholders = cols.map((_, i) => `$${i + 1}`).join(',');
    const vals = cols.map(c => row[c]);
    const sql = `INSERT INTO profiles (${cols.map(c => `"${c}"`).join(',')}) VALUES (${placeholders}) RETURNING *`;
    const result = await this._query(sql, vals);
    if (result.error) return result;
    const created = result.data?.[0];
    if (!created) return { data: null, error: 'Create failed' };
    return { data: this._parseJson(created, 'profiles'), error: null };
  }

  async updateUser(id, updates) {
    const cols = Object.keys(updates);
    if (cols.length === 0) return { data: null, error: 'No updates provided' };
    const setClause = cols.map((c, i) => `"${c}" = $${i + 1}`).join(', ');
    const vals = cols.map(c => {
      const v = updates[c];
      return typeof v === 'object' && v !== null ? JSON.stringify(v) : v;
    });
    vals.push(id);
    const sql = `UPDATE profiles SET ${setClause} WHERE id = $${vals.length} RETURNING *`;
    const result = await this._query(sql, vals);
    if (result.error) return result;
    const updated = result.data?.[0];
    if (!updated) return { data: null, error: 'Update failed — user not found' };
    return { data: this._parseJson(updated, 'profiles'), error: null };
  }

  /**
   * Atomic coin mutation — see DBInterface.addCoins.
   *
   * The whole thing is ONE statement: the UPDATE both computes the new balance
   * and refuses the row when a debit would go below zero, so two concurrent
   * spends can never both pass against the same balance.
   */
  async addCoins(id, delta, cap = 10_000_000) {
    const d = Number.parseInt(delta, 10);
    if (!Number.isFinite(d)) return { data: null, error: 'invalid_delta' };
    const limit = Math.min(Math.max(Number.parseInt(cap, 10) || 10_000_000, 0), 2_000_000_000);

    const result = await this._query(
      `UPDATE profiles
          SET coins = LEAST($1::bigint, GREATEST(0::bigint, COALESCE(coins, 0)::bigint + $2::bigint))
        WHERE id = $3
          AND ($2::bigint >= 0 OR COALESCE(coins, 0)::bigint + $2::bigint >= 0)
      RETURNING coins`,
      [limit, d, id]
    );
    if (result.error) return result;

    const row = result.data && result.data[0];
    if (!row) {
      // No row updated: either the balance is too low or the user is gone.
      const existing = await this.getUser(id);
      return existing.data
        ? { data: null, error: 'insufficient_coins' }
        : { data: null, error: 'user_not_found' };
    }
    return { data: { coins: Number(row.coins) || 0 }, error: null };
  }

  // ─── Leaderboard ───────────────────────────────────────

  async getLeaderboard(limit = 20) {
    const result = await this._query(
      `SELECT username, avatar_text AS avatar, score, high_score, level, trophies, league
       FROM profiles ORDER BY score DESC LIMIT $1`,
      [limit]
    );
    return { data: result.data || [], error: null };
  }

  // ─── Match ──────────────────────────────────────────────

  async saveMatch(data) {
    const id = data.id || this._genId();
    const now = data.created_at || this._now();
    const row = { id, created_at: now, ...data, id, created_at: now };
    const cols = Object.keys(row);
    const placeholders = cols.map((_, i) => `$${i + 1}`).join(',');
    const vals = cols.map(c => row[c]);

    const insertResult = await this._query(
      `INSERT INTO matches (${cols.map(c => `"${c}"`).join(',')}) VALUES (${placeholders})`,
      vals
    );
    if (insertResult.error) return insertResult;

    // Update profile score
    const user = await this.getUser(data.deviceId || data.user_id);
    if (user.data) {
      const newScore = (user.data.score || 0) + (data.score || 0);
      const newHigh = Math.max(user.data.high_score || 0, data.score || 0);
      const history = user.data.game_history || [];
      history.push({ score: data.score, size: data.grid_size, category: data.category, date: now });
      if (history.length > 50) history.shift();
      await this.updateUser(user.data.id, {
        score: newScore,
        high_score: newHigh,
        game_history: JSON.stringify(history),
      });
    }
    return { data: row, error: null };
  }

  // ─── Friends ────────────────────────────────────────────

  async getFriends(userId) {
    const result = await this._query(
      `SELECT f.*, p.username, p.avatar_text, p.friend_code,
              CASE WHEN f.user_id = $1 THEN f.friend_id ELSE f.user_id END AS other_id
       FROM friendships f
       LEFT JOIN profiles p ON (p.id = CASE WHEN f.user_id = $1 THEN f.friend_id ELSE f.user_id END)
       WHERE f.user_id = $1 OR f.friend_id = $1`,
      [userId]
    );
    return { data: result.data || [], error: null };
  }

  async findUserByFriendCode(code) {
    const result = await this._getOne(`SELECT * FROM profiles WHERE friend_code = $1`, [code]);
    return { data: result.data ? this._parseJson(result.data, 'profiles') : null, error: null };
  }

  async sendFriendRequest(myId, friendId) {
    const existing = await this._query(
      `SELECT * FROM friendships WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1)`,
      [myId, friendId]
    );
    if (existing.data && existing.data.length > 0) {
      return { data: null, error: 'already friends or pending' };
    }
    const id = this._genId();
    const result = await this._query(
      `INSERT INTO friendships (id, user_id, friend_id, status, created_at) VALUES ($1, $2, $3, 'pending', $4) RETURNING *`,
      [id, myId, friendId, this._now()]
    );
    if (result.error) return result;
    return { data: result.data?.[0] || { id, user_id: myId, friend_id: friendId, status: 'pending' }, error: null };
  }

  async acceptFriendRequest(senderId, receiverId) {
    const existing = await this._getOne(
      `SELECT * FROM friendships WHERE user_id = $1 AND friend_id = $2 AND status = 'pending'`,
      [senderId, receiverId]
    );
    if (!existing.data) return { data: null, error: 'request not found' };
    await this._query(
      `UPDATE friendships SET status = 'accepted' WHERE user_id = $1 AND friend_id = $2`,
      [senderId, receiverId]
    );
    // Create reverse entry
    await this._query(
      `INSERT INTO friendships (id, user_id, friend_id, status, created_at) VALUES ($1, $2, $3, 'accepted', $4) ON CONFLICT DO NOTHING`,
      [this._genId(), receiverId, senderId, this._now()]
    );
    return { data: { status: 'accepted' }, error: null };
  }

  async removeFriendship(friendshipId) {
    const row = await this._getOne(`SELECT * FROM friendships WHERE id = $1`, [friendshipId]);
    if (!row.data) return { data: null, error: 'not found' };
    await this._query(`DELETE FROM friendships WHERE id = $1`, [friendshipId]);
    if (row.data.friend_id && row.data.user_id) {
      await this._query(
        `DELETE FROM friendships WHERE user_id = $1 AND friend_id = $2`,
        [row.data.friend_id, row.data.user_id]
      );
    }
    return { data: null, error: null };
  }

  // ─── Messages ───────────────────────────────────────────

  async getMessages(userId, friendId, limit = 50) {
    const result = await this._query(
      `SELECT * FROM messages
       WHERE (sender_id = $1 AND receiver_id = $2)
          OR (sender_id = $2 AND receiver_id = $1)
       ORDER BY created_at ASC LIMIT $3`,
      [userId, friendId, limit]
    );
    const mapped = (result.data || []).map(r => ({
      id: r.id,
      senderId: r.sender_id,
      receiverId: r.receiver_id,
      content: r.content,
      createdAt: r.created_at,
      read: !!r.read,
      isMine: r.sender_id === userId
    }));
    return { data: mapped, error: null };
  }

  async sendMessage(data) {
    const id = data.id || this._genId();
    const row = {
      id,
      sender_id: data.sender_id || data.senderId,
      receiver_id: data.receiver_id || data.receiverId,
      content: data.content,
      read: data.read === true || data.read === 1 ? 1 : 0,
      created_at: data.created_at || this._now(),
    };
    const result = await this._query(
      `INSERT INTO messages (id, sender_id, receiver_id, content, read, created_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [row.id, row.sender_id, row.receiver_id, row.content, row.read, row.created_at]
    );
    if (result.error) return result;
    return { data: result.data?.[0] || row, error: null };
  }

  async markMessagesRead(myId, senderId) {
    await this._query(
      `UPDATE messages SET read = 1 WHERE receiver_id = $1 AND sender_id = $2 AND read = 0`,
      [myId, senderId]
    );
    return { data: null, error: null };
  }

  /**
   * Unread DM count grouped by sender, for the badge in the friends list.
   * Only counts messages addressed to `userId` that are still unread.
   */
  async getUnreadCounts(userId) {
    const result = await this._query(
      `SELECT sender_id, COUNT(*)::int AS unread
       FROM messages
       WHERE receiver_id = $1 AND (read = 0 OR read IS NULL)
       GROUP BY sender_id`,
      [userId]
    );
    const counts = {};
    for (const row of (result.data || [])) {
      const n = Number(row.unread) || 0;
      if (n > 0) counts[row.sender_id] = n;
    }
    return { data: counts, error: null };
  }

  // ─── Notifications ─────────────────────────────────────

  async getNotifications(userId) {
    const result = await this._query(
      `SELECT n.*, p.username AS sender_name, p.avatar_text AS sender_avatar
       FROM notifications n
       LEFT JOIN profiles p ON (n.sender_id = p.id)
       WHERE n.user_id = $1
       ORDER BY n.created_at DESC
       LIMIT 50`,
      [userId]
    );
    const mapped = (result.data || []).map(r => this._parseJson(r, 'notifications'));
    return { data: mapped, error: null };
  }

  async createNotification(data) {
    const id = data.id || this._genId();
    const row = {
      id,
      user_id: data.user_id,
      sender_id: data.sender_id,
      type: data.type || 'challenge',
      payload: typeof data.payload === 'object' ? JSON.stringify(data.payload) : (data.payload || '{}'),
      created_at: this._now(),
    };
    const result = await this._query(
      `INSERT INTO notifications (id, user_id, sender_id, type, payload, created_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [row.id, row.user_id, row.sender_id, row.type, row.payload, row.created_at]
    );
    if (result.error) return result;
    const created = result.data?.[0] || row;
    return { data: { ...created, payload: JSON.parse(created.payload || '{}') }, error: null };
  }

  async deleteNotification(id) {
    return this._query(`DELETE FROM notifications WHERE id = $1`, [id]);
  }

  async getNotificationById(id) {
    const result = await this._getOne(
      `SELECT n.*, p.username AS sender_name, p.avatar_text AS sender_avatar
       FROM notifications n
       LEFT JOIN profiles p ON (n.sender_id = p.id)
       WHERE n.id = $1`,
      [id]
    );
    if (!result.data) return { data: null, error: null };
    return { data: this._parseJson(result.data, 'notifications'), error: null };
  }

  async findNotificationBySender(senderId, userId, type) {
    const result = await this._getOne(
      `SELECT * FROM notifications WHERE sender_id = $1 AND user_id = $2 AND type = $3`,
      [senderId, userId, type]
    );
    if (!result.data) return { data: null, error: null };
    return { data: this._parseJson(result.data, 'notifications'), error: null };
  }

  // ─── Async duels (mirror of SQLiteDB) ──────────────────
  // Two levels: an arena is the creator's finished board plus their own run,
  // and an invite is one friend asked to replay that same board. The arena can
  // exist with no invite at all, and results outlive both closing and expiry.

  async createDuelArena(data) {
    const row = {
      id: data.id || this._genId(),
      creator_id: data.creator_id,
      creator_name: data.creator_name || '',
      creator_avatar: data.creator_avatar || '',
      category: data.category || 'all',
      language: data.language || 'fa',
      size: data.size || 8,
      board: JSON.stringify(data.board || {}),
      creator_result: JSON.stringify(data.creator_result || {}),
      closed: 0,
      created_at: this._now(),
    };
    const cols = Object.keys(row);
    const result = await this._query(
      `INSERT INTO duel_arenas (${cols.join(',')}) VALUES (${cols.map((_, i) => `$${i + 1}`).join(',')}) RETURNING *`,
      cols.map(c => row[c])
    );
    if (result.error) return { data: null, error: result.error };
    return { data: this._parseJson(result.data?.[0], 'duel_arenas'), error: null };
  }

  async getDuelArena(id) {
    const result = await this._getOne(`SELECT * FROM duel_arenas WHERE id = $1`, [id]);
    return { data: this._parseJson(result.data, 'duel_arenas'), error: result.error };
  }

  async listDuelArenas(creatorId, limit = 30) {
    const result = await this._query(
      `SELECT * FROM duel_arenas WHERE creator_id = $1 ORDER BY created_at DESC LIMIT $2`,
      [creatorId, limit]
    );
    return { data: (result.data || []).map(r => this._parseJson(r, 'duel_arenas')), error: result.error };
  }

  /** Arenas created inside the TTL window — the ones that use a slot. */
  async countLiveDuelArenas(creatorId, sinceIso) {
    const result = await this._getOne(
      `SELECT COUNT(*)::int AS cnt FROM duel_arenas WHERE creator_id = $1 AND created_at > $2`,
      [creatorId, sinceIso]
    );
    return { data: result.data ? Number(result.data.cnt) : 0, error: result.error };
  }

  async closeDuelArena(id) {
    const result = await this._query(`UPDATE duel_arenas SET closed = 1 WHERE id = $1`, [id]);
    if (result.error) return { data: null, error: result.error };
    return this.getDuelArena(id);
  }

  async deleteDuelArena(id) {
    const result = await this._query(`DELETE FROM duel_arenas WHERE id = $1`, [id]);
    return { data: !result.error, error: result.error || null };
  }

  async createDuelInvite(data) {
    const row = {
      id: data.id || this._genId(),
      arena_id: data.arena_id,
      opponent_id: data.opponent_id,
      opponent_name: data.opponent_name || '',
      opponent_avatar: data.opponent_avatar || '',
      opponent_result: null,
      status: 'open',
      rewarded: 0,
      created_at: this._now(),
      completed_at: '',
    };
    const cols = Object.keys(row);
    const result = await this._query(
      `INSERT INTO duel_invites (${cols.join(',')}) VALUES (${cols.map((_, i) => `$${i + 1}`).join(',')}) RETURNING *`,
      cols.map(c => row[c])
    );
    if (result.error) return { data: null, error: result.error };
    return { data: this._parseJson(result.data?.[0], 'duel_invites'), error: null };
  }

  async getDuelInvite(id) {
    const result = await this._getOne(`SELECT * FROM duel_invites WHERE id = $1`, [id]);
    return { data: this._parseJson(result.data, 'duel_invites'), error: result.error };
  }

  async listDuelInvites(arenaId) {
    const result = await this._query(
      `SELECT * FROM duel_invites WHERE arena_id = $1 ORDER BY created_at ASC`,
      [arenaId]
    );
    return { data: (result.data || []).map(r => this._parseJson(r, 'duel_invites')), error: result.error };
  }

  async deleteDuelInvite(id) {
    const result = await this._query(`DELETE FROM duel_invites WHERE id = $1`, [id]);
    return { data: !result.error, error: result.error || null };
  }

  /** Invitations this player can act on: not yet played or being played. */
  async listIncomingDuels(userId) {
    const result = await this._query(
      `SELECT * FROM duel_invites
        WHERE opponent_id = $1 AND status IN ('open', 'playing')
        ORDER BY created_at DESC LIMIT 30`,
      [userId]
    );
    return { data: (result.data || []).map(r => this._parseJson(r, 'duel_invites')), error: result.error };
  }

  /** Finished replays this player took part in — kept forever. */
  async listPlayedDuels(userId) {
    const result = await this._query(
      `SELECT * FROM duel_invites
        WHERE opponent_id = $1 AND status = 'completed'
        ORDER BY completed_at DESC LIMIT 30`,
      [userId]
    );
    return { data: (result.data || []).map(r => this._parseJson(r, 'duel_invites')), error: result.error };
  }

  /** Atomic accept: only one player can claim a still-open invitation. */
  async claimDuelInvite(id, userId, name, avatar) {
    const result = await this._query(
      `UPDATE duel_invites
          SET opponent_name = $1, opponent_avatar = $2, status = 'playing'
        WHERE id = $3 AND opponent_id = $4 AND status = 'open'
        RETURNING *`,
      [name || '', avatar || '', id, userId]
    );
    if (result.error) return { data: null, error: result.error };
    const row = result.data?.[0];
    return { data: row ? this._parseJson(row, 'duel_invites') : null, error: row ? null : 'duel_unavailable' };
  }

  /** Atomic completion: stores the challenger's result exactly once. */
  async completeDuelInvite(id, userId, result) {
    const response = await this._query(
      `UPDATE duel_invites
          SET opponent_result = $1, status = 'completed', completed_at = $2
        WHERE id = $3 AND status = 'playing' AND opponent_id = $4
        RETURNING *`,
      [JSON.stringify(result || {}), this._now(), id, userId]
    );
    if (response.error) return { data: null, error: response.error };
    const row = response.data?.[0];
    return { data: row ? this._parseJson(row, 'duel_invites') : null, error: row ? null : 'duel_not_playing' };
  }

  async markDuelInviteRewarded(id) {
    const result = await this._query(`UPDATE duel_invites SET rewarded = 1 WHERE id = $1`, [id]);
    return { data: !result.error, error: result.error || null };
  }

  async deleteDuelInvitesOfArena(arenaId) {
    const result = await this._query(
      `DELETE FROM duel_invites WHERE arena_id = $1 RETURNING *`,
      [arenaId]
    );
    return {
      data: (result.data || []).map(r => this._parseJson(r, 'duel_invites')),
      error: result.error || null,
    };
  }

  /** Arenas past their TTL — callers decide what survives (results do). */
  async listExpiredDuelArenas(beforeIso) {
    const result = await this._query(
      `SELECT * FROM duel_arenas WHERE created_at <> '' AND created_at <= $1`,
      [beforeIso]
    );
    return { data: (result.data || []).map(r => this._parseJson(r, 'duel_arenas')), error: result.error };
  }

  // ─── Dictionary ─────────────────────────────────────────

  async getDictionaryStats() {
    const result = await this._query(`SELECT COUNT(*)::int AS cnt FROM dictionary`);
    return { data: result.data?.[0] || { cnt: 0 }, error: null };
  }

  async getDictionary(category, language, limit = 10000) {
    let sql = `SELECT * FROM dictionary WHERE 1=1`;
    const params = [];
    let idx = 1;
    if (category && category !== 'all') { sql += ` AND category = $${idx++}`; params.push(category); }
    if (language) { sql += ` AND language = $${idx++}`; params.push(language); }
    sql += ` ORDER BY RANDOM() LIMIT $${idx}`;
    params.push(limit);
    const result = await this._query(sql, params);
    return { data: result.data || [], error: null };
  }

  async getGlueDictionary(category, language, limit = 500) {
    let sql = `SELECT * FROM glue_dictionary WHERE 1=1`;
    const params = [];
    let idx = 1;
    if (category && category !== 'all') { sql += ` AND category = $${idx++}`; params.push(category); }
    if (language) { sql += ` AND language = $${idx++}`; params.push(language); }
    sql += ` ORDER BY RANDOM() LIMIT $${idx}`;
    params.push(limit);
    const result = await this._query(sql, params);
    return { data: result.data || [], error: null };
  }

  async seedWord(word, clue, category, language) {
    const id = this._genId();
    const existing = await this._getOne(
      `SELECT id FROM dictionary WHERE word = $1 AND category = $2 AND language = $3`,
      [word, category, language]
    );
    if (existing.data) return { data: null, error: 'duplicate' };
    const result = await this._query(
      `INSERT INTO dictionary (id, word, clue, category, language, length, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [id, word, clue, category, language, word.length, this._now()]
    );
    if (result.error) return result;
    return { data: { id, word, clue, category, language, length: word.length }, error: null };
  }

  // ─── Story ──────────────────────────────────────────────

  async getStoryBooks() {
    const result = await this._query(`SELECT * FROM story_books ORDER BY title ASC`);
    const parsed = (result.data || []).map(b => this._parseJson(b, 'story_books'));
    return { data: parsed, error: null };
  }

  async getStoryChapters(bookId) {
    const result = await this._query(
      `SELECT * FROM story_chapters WHERE book_id = $1 ORDER BY chapter_index ASC`,
      [bookId]
    );
    const parsed = (result.data || []).map(r => this._parseJson(r, 'story_chapters'));
    return { data: parsed, error: null };
  }

  // ─── Tower ──────────────────────────────────────────────

  async consumeTowerTicket(deviceId) {
    // Atomic: the decrement only happens when a ticket is actually available, so
    // two concurrent consumes can never both spend the same last ticket. (This
    // used to be a read-modify-write — getUser then updateUser — which lost that
    // race and could drive the counter below zero.)
    const result = await this._query(
      `UPDATE profiles
          SET tower_tickets = COALESCE(tower_tickets, 0) - 1
        WHERE id = $1 AND COALESCE(tower_tickets, 0) > 0
      RETURNING tower_tickets, last_ticket_refill`,
      [deviceId]
    );
    if (result.error) return result;
    const row = result.data && result.data[0];
    if (!row) {
      const existing = await this.getUser(deviceId);
      return existing.data ? { data: null, error: 'no tickets' } : { data: null, error: 'user not found' };
    }
    return {
      data: {
        tower_tickets: Number(row.tower_tickets) || 0,
        last_ticket_refill: row.last_ticket_refill,
      },
      error: null,
    };
  }

  /**
   * Atomically add tower tickets (negative qty removes), clamped to [0, cap].
   * The caller supplies `refillAt` (an ISO string) to also stamp
   * `last_ticket_refill` — passing the timestamp in keeps the SQL portable
   * between Postgres and SQLite instead of relying on a date function.
   */
  async addTowerTickets(id, qty, cap = 2, refillAt = null) {
    const q = Number.parseInt(qty, 10);
    if (!Number.isFinite(q)) return { data: null, error: 'invalid_qty' };
    const limit = Math.max(0, Number.parseInt(cap, 10) || 2);
    const result = await this._query(
      `UPDATE profiles
          SET tower_tickets = CASE
                WHEN $2::int > 0
                  THEN GREATEST(COALESCE(tower_tickets, 0), LEAST($1::int, COALESCE(tower_tickets, 0) + $2::int))
                ELSE GREATEST(0, COALESCE(tower_tickets, 0) + $2::int)
              END,
              last_ticket_refill = COALESCE($4::text, last_ticket_refill)
        WHERE id = $3
      RETURNING tower_tickets, last_ticket_refill`,
      [limit, q, id, refillAt]
    );
    if (result.error) return result;
    const row = result.data && result.data[0];
    if (!row) return { data: null, error: 'user_not_found' };
    return {
      data: {
        tower_tickets: Number(row.tower_tickets) || 0,
        last_ticket_refill: row.last_ticket_refill,
      },
      error: null,
    };
  }

  async updateTowerStats(deviceId, coinsEarned, floorReached, dailyCoinsTotal = null) {
    const user = await this.getUser(deviceId);
    if (!user.data) return { data: null, error: 'user not found' };
    const updates = {
      coins: (user.data.coins || 0) + coinsEarned,
      tower_high_floor: Math.max(user.data.tower_high_floor || 0, floorReached),
      // The caller may pass the authoritative per-day total (already clamped to the
      // daily cap) so the counter can roll over at midnight; otherwise accumulate.
      daily_tower_coins: dailyCoinsTotal === null
        ? (user.data.daily_tower_coins || 0) + coinsEarned
        : dailyCoinsTotal,
    };
    await this.updateUser(deviceId, updates);
    return this.getUser(deviceId);
  }

  // ─── League / trophies ──────────────────────────────────

  /**
   * Apply a server-computed trophy delta (see DBInterface.applyLeagueResult).
   *
   * Step 1 does the arithmetic in SQL against the stored value, so a client can
   * never supply the base. Step 2 derives league/highest_league from the result
   * (a pure function of the number step 1 returned).
   */
  async applyLeagueResult(id, delta, won) {
    const d = Number.parseInt(delta, 10);
    if (!Number.isFinite(d)) return { data: null, error: 'invalid_delta' };
    const didWin = !!won;

    const step1 = await this._query(
      `UPDATE profiles
          SET trophies     = GREATEST(0::bigint, COALESCE(trophies, 0)::bigint + $2::bigint),
              total_wins   = COALESCE(total_wins, 0) + CASE WHEN $3::boolean THEN 1 ELSE 0 END,
              total_losses = COALESCE(total_losses, 0) + CASE WHEN $3::boolean THEN 0 ELSE 1 END,
              win_streak   = CASE WHEN $3::boolean THEN COALESCE(win_streak, 0) + 1 ELSE 0 END
        WHERE id = $1
      RETURNING trophies, total_wins, total_losses, win_streak, highest_league`,
      [id, d, didWin]
    );
    if (step1.error) return step1;
    const row = step1.data && step1.data[0];
    if (!row) return { data: null, error: 'user_not_found' };

    const trophies = Number(row.trophies) || 0;
    const league = leagueMath.getLeagueId(trophies);
    const prevHighest = row.highest_league || 'bronze';
    const highestLeague = d > 0 && trophies > leagueMath.minTrophiesOf(prevHighest)
      ? league
      : prevHighest;

    const step2 = await this._query(
      `UPDATE profiles SET league = $2, highest_league = $3 WHERE id = $1
       RETURNING trophies, league, highest_league, total_wins, total_losses, win_streak`,
      [id, league, highestLeague]
    );
    if (step2.error) return step2;
    const out = step2.data && step2.data[0];
    if (!out) return { data: null, error: 'user_not_found' };
    return {
      data: {
        trophies: Number(out.trophies) || 0,
        league: out.league,
        highestLeague: out.highest_league,
        winStreak: Number(out.win_streak) || 0,
        totalWins: Number(out.total_wins) || 0,
        totalLosses: Number(out.total_losses) || 0,
      },
      error: null,
    };
  }

  /**
   * Atomically increment a counter inside the profile's `items` JSON blob. The
   * value is read and written inside one statement, so two concurrent purchases
   * cannot lose an increment. Clamped at 0 (a consume never goes negative).
   */
  async addItem(id, itemKey, qty) {
    const q = Number.parseInt(qty, 10);
    if (!Number.isFinite(q) || typeof itemKey !== 'string' || !itemKey) {
      return { data: null, error: 'invalid_args' };
    }
    const result = await this._query(
      `UPDATE profiles
          SET items = (
            jsonb_set(
              COALESCE(NULLIF(items, '')::jsonb, '{}'::jsonb),
              ARRAY[$2::text],
              to_jsonb(GREATEST(0, COALESCE((COALESCE(NULLIF(items, '')::jsonb, '{}'::jsonb) ->> $2::text)::int, 0) + $3::int)),
              true
            )
          )::text
        WHERE id = $1
      RETURNING items`,
      [id, itemKey, q]
    );
    if (result.error) return result;
    const row = result.data && result.data[0];
    if (!row) return { data: null, error: 'user_not_found' };
    let items = {};
    try { items = JSON.parse(row.items) || {}; } catch (_) { items = {}; }
    return { data: { items }, error: null };
  }

  // ─── Behaviour events (retention measurement) ──────────

  /**
   * Batch-insert analytics events. Values are length-clamped here because the
   * endpoint accepts client input; nothing in the log is used for gameplay.
   */
  async insertEvents(userId, rows) {
    if (!Array.isArray(rows) || rows.length === 0) return { data: [], error: null };
    const clean = rows.slice(0, 20).map(r => ({
      id: this._genId(),
      user_id: userId || '',
      type: String(r && r.type || '').slice(0, 40),
      payload: JSON.stringify(r && r.payload && typeof r.payload === 'object' ? r.payload : {}).slice(0, 2000),
    })).filter(r => r.type);

    if (clean.length === 0) return { data: [], error: null };
    const values = [];
    const params = [];
    clean.forEach((r, i) => {
      const base = i * 4;
      values.push(`($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4})`);
      params.push(r.id, r.user_id, r.type, r.payload);
    });
    return this._query(
      `INSERT INTO events (id, user_id, type, payload) VALUES ${values.join(', ')}`,
      params
    );
  }

  // ─── Raw table access (for generic endpoints) ──────────

  async queryRaw(sql, params = []) {
    return this._query(sql, params);
  }
}

module.exports = PostgresDB;
