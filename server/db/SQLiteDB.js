const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const logger = require('../utils/logger');
// Server-side league math (mirror of services/league.ts) — see PostgresDB.
const leagueMath = require('../league');

const DATA_DIR = path.join(__dirname, '..', 'local-data');
const DATA_FILE = path.join(DATA_DIR, 'game.db');
const SCHEMA_FILE = path.join(__dirname, '..', 'schema.sql');

const TABLES = [
  'profiles', 'dictionary', 'glue_dictionary', 'matches',
  'messages', 'notifications', 'friendships', 'story_books', 'story_chapters',
  'duel_arenas', 'duel_invites',
];

const JSON_COLUMNS = {
  // `items` MUST be here — see PostgresDB. Without it the client received the
  // raw TEXT and trophy shield/boost were effectively dead.
  profiles: ['epic_progress_map', 'epic_stars', 'epic_progress', 'game_history', 'card_progress', 'worldmap_cards', 'items', 'daily_quests', 'cosmetics', 'claimed_sets'],
  notifications: ['payload'],
  story_books: ['style'],
  story_chapters: ['words'],
  duel_arenas: ['board', 'creator_result'],
  duel_invites: ['opponent_result'],
};

class SQLiteDB {
  constructor() {
    this.db = this._open();
    this._ensureSchema();
    this._seedIfNeeded();
  }

  // ─── Internal ───────────────────────────────────────────

  _open() {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    const exists = fs.existsSync(DATA_FILE);
    const db = new DatabaseSync(DATA_FILE);
    try { db.exec('PRAGMA busy_timeout=5000'); } catch (_) {}
    if (!exists) {
      const schema = fs.readFileSync(SCHEMA_FILE, 'utf8');
      db.exec(schema);
    }
    // Enable WAL mode for concurrent reads
    try { db.exec('PRAGMA journal_mode=WAL'); } catch (_) {}
    try { db.exec('PRAGMA synchronous=NORMAL'); } catch (_) {}
    try { db.exec('PRAGMA foreign_keys=ON'); } catch (_) {}
    return db;
  }

  _ensureSchema() {
    const schema = fs.readFileSync(SCHEMA_FILE, 'utf8');
    // Only run idempotent DDL (every CREATE TABLE / CREATE INDEX in schema.sql
    // uses IF NOT EXISTS). Leading `--` comment lines must be stripped first, or
    // a commented table is skipped and never created.
    const statements = schema
      .split(';')
      .map(s => s.split('\n').filter(l => !l.trim().startsWith('--')).join('\n'))
      .filter(s => /^CREATE (TABLE|UNIQUE INDEX|INDEX) IF NOT EXISTS/i.test(s.trim()));
    for (const stmt of statements) {
      try { this.db.exec(stmt + ';'); } catch (e) { logger.warn(`[db] schema statement failed: ${e.message}`); }
    }
    // Migrations: add columns that might not exist in older databases
    const migrations = [
      "ALTER TABLE profiles ADD COLUMN trophies INTEGER DEFAULT 0",
      "ALTER TABLE profiles ADD COLUMN league TEXT DEFAULT 'bronze'",
      "ALTER TABLE profiles ADD COLUMN items TEXT DEFAULT '{\"trophyShield\":0,\"trophyBoost\":0}'",
      "ALTER TABLE profiles ADD COLUMN password_hash TEXT DEFAULT NULL",
      "ALTER TABLE profiles ADD COLUMN card_progress TEXT DEFAULT '{}'",
      "ALTER TABLE profiles ADD COLUMN worldmap_cards TEXT DEFAULT '{}'",
      // League counters the server now owns (see PostgresDB migrations).
      "ALTER TABLE profiles ADD COLUMN total_losses INTEGER DEFAULT 0",
      "ALTER TABLE profiles ADD COLUMN win_streak INTEGER DEFAULT 0",
      "ALTER TABLE profiles ADD COLUMN highest_league TEXT DEFAULT 'bronze'",
      // Progression columns — see server/progression.js.
      "ALTER TABLE profiles ADD COLUMN xp INTEGER DEFAULT 0",
      "ALTER TABLE profiles ADD COLUMN daily_streak INTEGER DEFAULT 0",
      "ALTER TABLE profiles ADD COLUMN daily_streak_best INTEGER DEFAULT 0",
      "ALTER TABLE profiles ADD COLUMN daily_streak_last TEXT DEFAULT ''",
      "ALTER TABLE profiles ADD COLUMN daily_quests TEXT DEFAULT '{}'",
      "ALTER TABLE profiles ADD COLUMN cosmetics TEXT DEFAULT '{\"owned\":[],\"frame\":\"\",\"title\":\"\"}'",
      "ALTER TABLE profiles ADD COLUMN claimed_sets TEXT DEFAULT '[]'",
      "ALTER TABLE profiles ADD COLUMN season_id TEXT DEFAULT ''",
      "ALTER TABLE profiles ADD COLUMN season_pending_tier TEXT DEFAULT ''",
      "ALTER TABLE profiles ADD COLUMN season_reward_claimed TEXT DEFAULT ''",
      "ALTER TABLE story_chapters ADD COLUMN monster_name TEXT DEFAULT ''",
      "CREATE TABLE IF NOT EXISTS events (id TEXT PRIMARY KEY, user_id TEXT DEFAULT '', type TEXT DEFAULT '', payload TEXT DEFAULT '{}', created_at TEXT DEFAULT (datetime('now')))",
      // Performance indexes (idempotent — IF NOT EXISTS makes them safe to re-run)
      "CREATE INDEX IF NOT EXISTS idx_matches_user_id ON matches(user_id)",
      "CREATE INDEX IF NOT EXISTS idx_matches_player_id ON matches(player_id)",
      "CREATE INDEX IF NOT EXISTS idx_messages_sender_receiver ON messages(sender_id, receiver_id)",
      "CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id)",
      "CREATE INDEX IF NOT EXISTS idx_friendships_user ON friendships(user_id)",
      "CREATE INDEX IF NOT EXISTS idx_friendships_friend ON friendships(friend_id)",
      "CREATE INDEX IF NOT EXISTS idx_friendships_status ON friendships(status)",
      "CREATE INDEX IF NOT EXISTS idx_dictionary_category_lang ON dictionary(category, language)",
      "CREATE INDEX IF NOT EXISTS idx_dictionary_word ON dictionary(word)",
      "CREATE INDEX IF NOT EXISTS idx_profiles_friend_code ON profiles(friend_code)",
      "CREATE INDEX IF NOT EXISTS idx_profiles_score ON profiles(score DESC)",
    ];
    for (const sql of migrations) {
      try { this.db.exec(sql); } catch (e) {
        // Column already exists or other benign error
      }
    }
  }

  _seedIfNeeded() {
    for (const table of TABLES) {
      const jsonFile = path.join(DATA_DIR, `${table}.json`);
      if (!fs.existsSync(jsonFile)) continue;

      let data;
      try { data = JSON.parse(fs.readFileSync(jsonFile, 'utf8')); } catch { continue; }
      if (!Array.isArray(data) || data.length === 0) continue;

      const row = this.db.prepare(`SELECT COUNT(*) as cnt FROM "${table}"`).get();
      const dbCount = row ? Number(row.cnt) : 0;

      const isCatalogTable = table === 'story_books' || table === 'story_chapters';
      if (dbCount === 0 || isCatalogTable) {
        // Sanitize dictionary words
        if (['dictionary', 'glue_dictionary'].includes(table)) {
          data = data.filter(r => r.word && !r.word.includes(' ') && r.word.length > 0);
          for (const r of data) r.word = r.word.replace(/\u200c/g, '');
        }
        logger.info(`  ${table}: syncing ${data.length} rows`);
        this._bulkInsert(table, data, isCatalogTable);
      }
    }
  }

  _bulkInsert(table, rows, replace = false) {
    const insertAll = this.db.prepare(`BEGIN TRANSACTION`);
    insertAll.run();
    if (replace) {
      try { this.db.prepare(`DELETE FROM "${table}"`).run(); } catch (_) {}
    }
    const verb = replace ? 'INSERT OR REPLACE INTO' : 'INSERT INTO';
    for (const row of rows) {
      const cols = Object.keys(row);
      const placeholders = cols.map(() => '?').join(',');
      const vals = cols.map(c =>
        typeof row[c] === 'object' && row[c] !== null ? JSON.stringify(row[c]) : (row[c] === undefined ? null : row[c])
      );
      try {
        this.db.prepare(
          `${verb} "${table}" (${cols.map(c => `"${c}"`).join(',')}) VALUES (${placeholders})`
        ).run(...vals);
      } catch (e) {
        // Silently skip rows that fail (e.g. missing columns)
      }
    }
    const commit = this.db.prepare(`COMMIT`);
    commit.run();
  }

  _genId() { return crypto.randomUUID(); }
  _now() { return new Date().toISOString(); }

  _toObject(row) {
    if (!row) return null;
    const obj = {};
    for (const [k, v] of Object.entries(row)) {
      obj[k] = (typeof v === 'bigint') ? Number(v) : v;
    }
    return obj;
  }

  _sanitizeParams(params = []) {
    return params.map(v => {
      if (v === undefined) return null;
      if (typeof v === 'boolean') return v ? 1 : 0;
      if (typeof v === 'object' && v !== null && !Buffer.isBuffer(v) && !(v instanceof Uint8Array)) {
        return JSON.stringify(v);
      }
      return v;
    });
  }

  _parseJson(row, table) {
    if (!row) return null;
    const jsonCols = JSON_COLUMNS[table] || [];
    const obj = {};
    for (const [k, v] of Object.entries(row)) {
      let val = (typeof v === 'bigint') ? Number(v) : v;
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

  _all(sql, params = []) {
    try {
      const stmt = this.db.prepare(sql);
      const rows = stmt.all(...this._sanitizeParams(params));
      return rows.map(r => this._toObject(r));
    } catch (e) {
      return [];
    }
  }

  _get(sql, params = []) {
    try {
      const stmt = this.db.prepare(sql);
      const row = stmt.get(...this._sanitizeParams(params));
      return row ? this._toObject(row) : null;
    } catch {
      return null;
    }
  }

  _run(sql, params = []) {
    try {
      this.db.prepare(sql).run(...this._sanitizeParams(params));
      return { data: null, error: null };
    } catch (e) {
      return { data: null, error: e.message };
    }
  }

  // ─── Profile ───────────────────────────────────────────

  async getUser(id) {
    const row = this._get(`SELECT * FROM profiles WHERE id = ?`, [id]);
    return { data: row ? this._parseJson(row, 'profiles') : null, error: null };
  }

  async getUserByPhone(phone) {
    const row = this._get(`SELECT * FROM profiles WHERE phone = ?`, [phone]);
    return { data: row ? this._parseJson(row, 'profiles') : null, error: null };
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
    for (const col of JSON_COLUMNS.profiles) {
      if (row[col] !== undefined && typeof row[col] === 'object') {
        row[col] = JSON.stringify(row[col] ?? (col === 'game_history' ? [] : {}));
      }
    }
    // SQLite cannot bind `undefined` — dropping the key lets the column DEFAULT apply.
    for (const key of Object.keys(row)) {
      if (row[key] === undefined) delete row[key];
    }

    const cols = Object.keys(row);
    const placeholders = cols.map(() => '?').join(',');
    const vals = cols.map(c => row[c]);

    const result = this._run(
      `INSERT INTO profiles (${cols.map(c => `"${c}"`).join(',')}) VALUES (${placeholders})`,
      vals
    );
    if (result.error) return result;
    return { data: this._parseJson(row, 'profiles'), error: null };
  }

  async updateUser(id, updates) {
    const existing = await this.getUser(id);
    if (!existing.data) return { data: null, error: 'User not found' };
    const merged = { ...existing.data, ...updates };
    // Stringify JSON columns
    for (const col of JSON_COLUMNS.profiles) {
      if (merged[col] !== undefined && typeof merged[col] === 'object') {
        merged[col] = JSON.stringify(merged[col]);
      }
    }
    const cols = Object.keys(updates);
    if (cols.length === 0) return { data: merged, error: null };
    const setClause = cols.map(c => `"${c}" = ?`).join(',');
    const vals = cols.map(c => {
      const v = updates[c];
      return typeof v === 'object' && v !== null ? JSON.stringify(v) : v;
    });
    const result = this._run(`UPDATE profiles SET ${setClause} WHERE id = ?`, [...vals, id]);
    if (result.error) return result;
    return this.getUser(id);
  }

  /**
   * Atomic coin mutation — see DBInterface.addCoins.
   *
   * One statement does the work and refuses the row when a debit would go below
   * zero, so two concurrent spends can never both pass. `changes` distinguishes
   * "balance too low" from a real SQL error (which `_run` would swallow).
   */
  async addCoins(id, delta, cap = 10_000_000) {
    const d = Number.parseInt(delta, 10);
    if (!Number.isFinite(d)) return { data: null, error: 'invalid_delta' };
    const limit = Math.min(Math.max(Number.parseInt(cap, 10) || 10_000_000, 0), 2_000_000_000);
    try {
      const res = this.db.prepare(
        `UPDATE profiles
            SET coins = MIN(?, MAX(0, COALESCE(coins, 0) + ?))
          WHERE id = ?
            AND (? >= 0 OR COALESCE(coins, 0) + ? >= 0)`
      ).run(limit, d, id, d, d);

      if (!res || Number(res.changes) === 0) {
        const existing = await this.getUser(id);
        return existing.data
          ? { data: null, error: 'insufficient_coins' }
          : { data: null, error: 'user_not_found' };
      }
      const row = this._get(`SELECT coins FROM profiles WHERE id = ?`, [id]);
      return { data: { coins: Number(row?.coins) || 0 }, error: null };
    } catch (e) {
      return { data: null, error: e.message };
    }
  }

  // ─── Leaderboard ───────────────────────────────────────

  async getLeaderboard(limit = 20) {
    const rows = this._all(
      `SELECT username, avatar_text AS avatar, score, high_score, level, trophies, league
       FROM profiles ORDER BY score DESC LIMIT ?`,
      [limit]
    );
    return { data: rows, error: null };
  }

  // ─── Match ──────────────────────────────────────────────

  async saveMatch(data) {
    const id = data.id || this._genId();
    const now = data.created_at || this._now();
    const row = { id, created_at: now, ...data, id, created_at: now };
    const cols = Object.keys(row);
    const placeholders = cols.map(() => '?').join(',');
    const vals = cols.map(c => row[c]);
    const result = this._run(
      `INSERT INTO matches (${cols.map(c => `"${c}"`).join(',')}) VALUES (${placeholders})`,
      vals
    );
    if (result.error) return result;

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
    const rows = this._all(
      `SELECT f.*, p.username, p.avatar_text, p.friend_code,
              CASE WHEN f.user_id = ? THEN f.friend_id ELSE f.user_id END AS other_id
       FROM friendships f
       LEFT JOIN profiles p ON (p.id = CASE WHEN f.user_id = ? THEN f.friend_id ELSE f.user_id END)
       WHERE f.user_id = ? OR f.friend_id = ?`,
      [userId, userId, userId, userId]
    );
    return { data: rows, error: null };
  }

  async findUserByFriendCode(code) {
    const row = this._get(`SELECT * FROM profiles WHERE friend_code = ?`, [code]);
    return { data: row ? this._parseJson(row, 'profiles') : null, error: null };
  }

  async sendFriendRequest(myId, friendId) {
    // Check if friendship already exists in EITHER direction
    const existing = this._all(
      `SELECT * FROM friendships WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)`,
      [myId, friendId, friendId, myId]
    );
    if (existing.length > 0) return { data: null, error: 'already friends or pending' };
    const id = this._genId();
    const result = this._run(
      `INSERT INTO friendships (id, user_id, friend_id, status, created_at)
       VALUES (?, ?, ?, 'pending', ?)`,
      [id, myId, friendId, this._now()]
    );
    if (result.error) return result;
    return { data: { id, user_id: myId, friend_id: friendId, status: 'pending' }, error: null };
  }

  async acceptFriendRequest(senderId, receiverId) {
    // Update both directions
    const existing = this._get(
      `SELECT * FROM friendships WHERE user_id = ? AND friend_id = ? AND status = 'pending'`,
      [senderId, receiverId]
    );
    if (!existing) return { data: null, error: 'request not found' };
    this._run(
      `UPDATE friendships SET status = 'accepted' WHERE user_id = ? AND friend_id = ?`,
      [senderId, receiverId]
    );
    // Create reverse entry
    this._run(
      `INSERT INTO friendships (id, user_id, friend_id, status, created_at)
       VALUES (?, ?, ?, 'accepted', ?)`,
      [this._genId(), receiverId, senderId, this._now()]
    );
    return { data: { status: 'accepted' }, error: null };
  }

  async removeFriendship(friendshipId) {
    const row = this._get(`SELECT * FROM friendships WHERE id = ?`, [friendshipId]);
    if (!row) return { data: null, error: 'not found' };
    // Remove both directions
    this._run(`DELETE FROM friendships WHERE id = ?`, [friendshipId]);
    this._run(
      `DELETE FROM friendships WHERE user_id = ? AND friend_id = ?`,
      [row.friend_id, row.user_id]
    );
    return { data: null, error: null };
  }

  // ─── Messages ───────────────────────────────────────────

  async getMessages(userId, friendId, limit = 50) {
    const rows = this._all(
      `SELECT * FROM messages
       WHERE (sender_id = ? AND receiver_id = ?)
          OR (sender_id = ? AND receiver_id = ?)
       ORDER BY created_at ASC LIMIT ?`,
      [userId, friendId, friendId, userId, limit]
    );
    const mapped = rows.map(r => ({
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
      read: data.read || false,
      created_at: data.created_at || this._now(),
    };
    const cols = Object.keys(row);
    const placeholders = cols.map(() => '?').join(',');
    this._run(
      `INSERT INTO messages (${cols.map(c => `"${c}"`).join(',')}) VALUES (${placeholders})`,
      cols.map(c => row[c])
    );
    return { data: row, error: null };
  }

  async markMessagesRead(myId, senderId) {
    this._run(
      `UPDATE messages SET read = 1 WHERE receiver_id = ? AND sender_id = ? AND read = 0`,
      [myId, senderId]
    );
    return { data: null, error: null };
  }

  /**
   * Unread DM count grouped by sender, for the badge in the friends list.
   * Only counts messages addressed to `userId` that are still unread.
   */
  async getUnreadCounts(userId) {
    const rows = this._all(
      `SELECT sender_id, COUNT(*) AS unread
       FROM messages
       WHERE receiver_id = ? AND (read = 0 OR read IS NULL)
       GROUP BY sender_id`,
      [userId]
    );
    const counts = {};
    for (const row of rows) {
      const n = Number(row.unread) || 0;
      if (n > 0) counts[row.sender_id] = n;
    }
    return { data: counts, error: null };
  }

  // ─── Notifications ─────────────────────────────────────

  async getNotifications(userId) {
    const rows = this._all(
      `SELECT n.*, p.username AS sender_name, p.avatar_text AS sender_avatar
       FROM notifications n
       LEFT JOIN profiles p ON (n.sender_id = p.id)
       WHERE n.user_id = ?
       ORDER BY n.created_at DESC
       LIMIT 50`,
      [userId]
    );
    const mapped = rows.map(r => this._parseJson(r, 'notifications'));
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
    const cols = Object.keys(row);
    const placeholders = cols.map(() => '?').join(',');
    const result = this._run(
      `INSERT INTO notifications (${cols.map(c => `"${c}"`).join(',')}) VALUES (${placeholders})`,
      cols.map(c => row[c])
    );
    if (result.error) return result;
    return { data: { ...row, payload: JSON.parse(row.payload) }, error: null };
  }

  async deleteNotification(id) {
    return this._run(`DELETE FROM notifications WHERE id = ?`, [id]);
  }

  async getNotificationById(id) {
    const rows = this._all(
      `SELECT n.*, p.username AS sender_name, p.avatar_text AS sender_avatar
       FROM notifications n
       LEFT JOIN profiles p ON (n.sender_id = p.id)
       WHERE n.id = ?`,
      [id]
    );
    if (rows.length === 0) return { data: null, error: null };
    return { data: this._parseJson(rows[0], 'notifications'), error: null };
  }

  async findNotificationBySender(senderId, userId, type) {
    const rows = this._all(
      `SELECT * FROM notifications WHERE sender_id = ? AND user_id = ? AND type = ?`,
      [senderId, userId, type]
    );
    if (rows.length === 0) return { data: null, error: null };
    return { data: this._parseJson(rows[0], 'notifications'), error: null };
  }

  // ─── Async duels (mirror of PostgresDB) ────────────────
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
    const result = this._run(
      `INSERT INTO duel_arenas (${cols.map(c => `"${c}"`).join(',')}) VALUES (${cols.map(() => '?').join(',')})`,
      cols.map(c => row[c])
    );
    if (result.error) return { data: null, error: result.error };
    return { data: this._parseJson(row, 'duel_arenas'), error: null };
  }

  async getDuelArena(id) {
    const row = this._get(`SELECT * FROM duel_arenas WHERE id = ?`, [id]);
    return { data: this._parseJson(row, 'duel_arenas'), error: null };
  }

  async listDuelArenas(creatorId, limit = 30) {
    const rows = this._all(
      `SELECT * FROM duel_arenas WHERE creator_id = ? ORDER BY created_at DESC LIMIT ?`,
      [creatorId, limit]
    );
    return { data: rows.map(r => this._parseJson(r, 'duel_arenas')), error: null };
  }

  /** Arenas created inside the TTL window — the ones that use a slot. */
  async countLiveDuelArenas(creatorId, sinceIso) {
    const row = this._get(
      `SELECT COUNT(*) AS cnt FROM duel_arenas WHERE creator_id = ? AND created_at > ?`,
      [creatorId, sinceIso]
    );
    return { data: row ? Number(row.cnt) : 0, error: null };
  }

  async closeDuelArena(id) {
    const result = this._run(`UPDATE duel_arenas SET closed = 1 WHERE id = ?`, [id]);
    if (result.error) return { data: null, error: result.error };
    return this.getDuelArena(id);
  }

  async deleteDuelArena(id) {
    const result = this._run(`DELETE FROM duel_arenas WHERE id = ?`, [id]);
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
    const result = this._run(
      `INSERT INTO duel_invites (${cols.map(c => `"${c}"`).join(',')}) VALUES (${cols.map(() => '?').join(',')})`,
      cols.map(c => row[c])
    );
    if (result.error) return { data: null, error: result.error };
    return { data: this._parseJson(row, 'duel_invites'), error: null };
  }

  async getDuelInvite(id) {
    const row = this._get(`SELECT * FROM duel_invites WHERE id = ?`, [id]);
    return { data: this._parseJson(row, 'duel_invites'), error: null };
  }

  async listDuelInvites(arenaId) {
    const rows = this._all(
      `SELECT * FROM duel_invites WHERE arena_id = ? ORDER BY created_at ASC`,
      [arenaId]
    );
    return { data: rows.map(r => this._parseJson(r, 'duel_invites')), error: null };
  }

  async deleteDuelInvite(id) {
    const result = this._run(`DELETE FROM duel_invites WHERE id = ?`, [id]);
    return { data: !result.error, error: result.error || null };
  }

  /** Invitations this player can act on: not yet played or being played. */
  async listIncomingDuels(userId) {
    const rows = this._all(
      `SELECT * FROM duel_invites
        WHERE opponent_id = ? AND status IN ('open', 'playing')
        ORDER BY created_at DESC LIMIT 30`,
      [userId]
    );
    return { data: rows.map(r => this._parseJson(r, 'duel_invites')), error: null };
  }

  /** Finished replays this player took part in — kept forever. */
  async listPlayedDuels(userId) {
    const rows = this._all(
      `SELECT * FROM duel_invites
        WHERE opponent_id = ? AND status = 'completed'
        ORDER BY completed_at DESC LIMIT 30`,
      [userId]
    );
    return { data: rows.map(r => this._parseJson(r, 'duel_invites')), error: null };
  }

  /** Atomic accept: only one player can claim a still-open invitation. */
  async claimDuelInvite(id, userId, name, avatar) {
    const result = this._run(
      `UPDATE duel_invites
          SET opponent_name = ?, opponent_avatar = ?, status = 'playing'
        WHERE id = ? AND opponent_id = ? AND status = 'open'`,
      [name || '', avatar || '', id, userId]
    );
    if (result.error) return { data: null, error: result.error };
    const row = this._get(
      `SELECT * FROM duel_invites WHERE id = ? AND opponent_id = ? AND status = 'playing'`,
      [id, userId]
    );
    return { data: this._parseJson(row, 'duel_invites'), error: row ? null : 'duel_unavailable' };
  }

  /** Atomic completion: stores the challenger's result exactly once. */
  async completeDuelInvite(id, userId, result) {
    const response = this._run(
      `UPDATE duel_invites
          SET opponent_result = ?, status = 'completed', completed_at = ?
        WHERE id = ? AND status = 'playing' AND opponent_id = ?`,
      [JSON.stringify(result || {}), this._now(), id, userId]
    );
    if (response.error) return { data: null, error: response.error };
    const row = this._get(
      `SELECT * FROM duel_invites WHERE id = ? AND status = 'completed' AND opponent_id = ?`,
      [id, userId]
    );
    return { data: this._parseJson(row, 'duel_invites'), error: row ? null : 'duel_not_playing' };
  }

  async markDuelInviteRewarded(id) {
    const result = this._run(`UPDATE duel_invites SET rewarded = 1 WHERE id = ?`, [id]);
    return { data: !result.error, error: result.error || null };
  }

  async deleteDuelInvitesOfArena(arenaId) {
    const rows = await this.listDuelInvites(arenaId);
    const result = this._run(`DELETE FROM duel_invites WHERE arena_id = ?`, [arenaId]);
    return { data: result.error ? [] : (rows.data || []), error: result.error || null };
  }

  /** Arenas past their TTL — callers decide what survives (results do). */
  async listExpiredDuelArenas(beforeIso) {
    const rows = this._all(
      `SELECT * FROM duel_arenas WHERE created_at <> '' AND created_at <= ?`,
      [beforeIso]
    );
    return { data: rows.map(r => this._parseJson(r, 'duel_arenas')), error: null };
  }

  // ─── Dictionary ─────────────────────────────────────────

  async getDictionaryStats() {
    const rows = this._all(`SELECT COUNT(*) AS cnt FROM dictionary`);
    return { data: rows[0] || { cnt: 0 }, error: null };
  }

  async getDictionary(category, language, limit = 10000) {
    let sql = `SELECT * FROM dictionary WHERE 1=1`;
    const params = [];
    if (category && category !== 'all') { sql += ` AND category = ?`; params.push(category); }
    if (language) { sql += ` AND language = ?`; params.push(language); }
    sql += ` ORDER BY RANDOM() LIMIT ?`;
    params.push(limit);
    const rows = this._all(sql, params);
    return { data: rows, error: null };
  }

  async getGlueDictionary(category, language, limit = 500) {
    let sql = `SELECT * FROM glue_dictionary WHERE 1=1`;
    const params = [];
    if (category && category !== 'all') { sql += ` AND category = ?`; params.push(category); }
    if (language) { sql += ` AND language = ?`; params.push(language); }
    sql += ` ORDER BY RANDOM() LIMIT ?`;
    params.push(limit);
    const rows = this._all(sql, params);
    return { data: rows, error: null };
  }

  async seedWord(word, clue, category, language) {
    const id = this._genId();
    const existing = this._get(
      `SELECT id FROM dictionary WHERE word = ? AND category = ? AND language = ?`,
      [word, category, language]
    );
    if (existing) return { data: null, error: 'duplicate' };
    const result = this._run(
      `INSERT INTO dictionary (id, word, clue, category, language, length, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, word, clue, category, language, word.length, this._now()]
    );
    if (result.error) return result;
    return { data: { id, word, clue, category, language, length: word.length }, error: null };
  }

  // ─── Story ──────────────────────────────────────────────

  async getStoryBooks() {
    const books = this._all(`SELECT * FROM story_books ORDER BY title ASC`);
    const parsed = books.map(b => this._parseJson(b, 'story_books'));
    return { data: parsed, error: null };
  }

  async getStoryChapters(bookId) {
    const rows = this._all(
      `SELECT * FROM story_chapters WHERE book_id = ? ORDER BY chapter_index ASC`,
      [bookId]
    );
    const parsed = rows.map(r => this._parseJson(r, 'story_chapters'));
    return { data: parsed, error: null };
  }

  // ─── Tower ──────────────────────────────────────────────

  async consumeTowerTicket(deviceId) {
    // Atomic: decrement only when a ticket is actually available. See the
    // PostgresDB twin — this used to be a read-modify-write that lost the race.
    try {
      const res = this.db.prepare(
        `UPDATE profiles
            SET tower_tickets = COALESCE(tower_tickets, 0) - 1
          WHERE id = ? AND COALESCE(tower_tickets, 0) > 0`
      ).run(deviceId);
      if (!res || Number(res.changes) === 0) {
        const existing = await this.getUser(deviceId);
        return existing.data ? { data: null, error: 'no tickets' } : { data: null, error: 'user not found' };
      }
      const row = this._get(`SELECT tower_tickets, last_ticket_refill FROM profiles WHERE id = ?`, [deviceId]);
      return {
        data: {
          tower_tickets: Number(row?.tower_tickets) || 0,
          last_ticket_refill: row?.last_ticket_refill ?? null,
        },
        error: null,
      };
    } catch (e) {
      return { data: null, error: e.message };
    }
  }

  /**
   * Atomically add tower tickets (negative qty removes), clamped to [0, cap].
   * `refillAt` (an ISO string) also stamps `last_ticket_refill` — passing the
   * timestamp in keeps the SQL portable between SQLite and Postgres.
   */
  async addTowerTickets(id, qty, cap = 2, refillAt = null) {
    const q = Number.parseInt(qty, 10);
    if (!Number.isFinite(q)) return { data: null, error: 'invalid_qty' };
    const limit = Math.max(0, Number.parseInt(cap, 10) || 2);
    try {
      const res = this.db.prepare(
        `UPDATE profiles
            SET tower_tickets = CASE
                  WHEN ? > 0
                    THEN MAX(COALESCE(tower_tickets, 0), MIN(?, COALESCE(tower_tickets, 0) + ?))
                  ELSE MAX(0, COALESCE(tower_tickets, 0) + ?)
                END,
                last_ticket_refill = COALESCE(?, last_ticket_refill)
          WHERE id = ?`
      ).run(q, limit, q, q, refillAt, id);
      if (!res || Number(res.changes) === 0) return { data: null, error: 'user_not_found' };
      const row = this._get(`SELECT tower_tickets, last_ticket_refill FROM profiles WHERE id = ?`, [id]);
      return {
        data: {
          tower_tickets: Number(row?.tower_tickets) || 0,
          last_ticket_refill: row?.last_ticket_refill ?? null,
        },
        error: null,
      };
    } catch (e) {
      return { data: null, error: e.message };
    }
  }

  async updateTowerStats(deviceId, coinsEarned, floorReached, dailyCoinsTotal = null) {
    const user = await this.getUser(deviceId);
    if (!user.data) return { data: null, error: 'user not found' };
    const updates = {
      coins: (user.data.coins || 0) + coinsEarned,
      tower_high_floor: Math.max(user.data.tower_high_floor || 0, floorReached),
      // See PostgresDB.updateTowerStats — an explicit total lets the day roll over.
      daily_tower_coins: dailyCoinsTotal === null
        ? (user.data.daily_tower_coins || 0) + coinsEarned
        : dailyCoinsTotal,
    };
    await this.updateUser(deviceId, updates);
    return this.getUser(deviceId);
  }

  // ─── League / trophies ──────────────────────────────────

  /** See DBInterface.applyLeagueResult / PostgresDB for the rationale. */
  async applyLeagueResult(id, delta, won) {
    const d = Number.parseInt(delta, 10);
    if (!Number.isFinite(d)) return { data: null, error: 'invalid_delta' };
    const w = won ? 1 : 0;

    const res = this._run(
      `UPDATE profiles
          SET trophies     = MAX(0, COALESCE(trophies, 0) + ?),
              total_wins   = COALESCE(total_wins, 0) + ?,
              total_losses = COALESCE(total_losses, 0) + ?,
              win_streak   = CASE WHEN ? THEN COALESCE(win_streak, 0) + 1 ELSE 0 END
        WHERE id = ?`,
      [d, w, w === 1 ? 0 : 1, w, id]
    );
    if (res.error) return res;

    const row = this._get(
      `SELECT trophies, total_wins, total_losses, win_streak, highest_league FROM profiles WHERE id = ?`,
      [id]
    );
    if (!row) return { data: null, error: 'user_not_found' };

    const trophies = Number(row.trophies) || 0;
    const league = leagueMath.getLeagueId(trophies);
    const prevHighest = row.highest_league || 'bronze';
    const highestLeague = d > 0 && trophies > leagueMath.minTrophiesOf(prevHighest)
      ? league
      : prevHighest;
    this._run(`UPDATE profiles SET league = ?, highest_league = ? WHERE id = ?`, [league, highestLeague, id]);

    return {
      data: {
        trophies,
        league,
        highestLeague,
        winStreak: Number(row.win_streak) || 0,
        totalWins: Number(row.total_wins) || 0,
        totalLosses: Number(row.total_losses) || 0,
      },
      error: null,
    };
  }

  /** See DBInterface.addItem / PostgresDB — atomic, clamped at 0. */
  async addItem(id, itemKey, qty) {
    const q = Number.parseInt(qty, 10);
    if (!Number.isFinite(q) || typeof itemKey !== 'string' || !itemKey) {
      return { data: null, error: 'invalid_args' };
    }
    const base = `CASE WHEN items IS NULL OR items = '' THEN '{}' ELSE items END`;
    const res = this._run(
      `UPDATE profiles
          SET items = json_set(
            ${base},
            '$.' || ?,
            MAX(0, COALESCE(json_extract(${base}, '$.' || ?), 0) + ?)
          )
        WHERE id = ?`,
      [itemKey, itemKey, q, id]
    );
    if (res.error) return res;

    const row = this._get(`SELECT items FROM profiles WHERE id = ?`, [id]);
    if (!row) return { data: null, error: 'user_not_found' };
    let items = {};
    try { items = JSON.parse(row.items) || {}; } catch (_) { items = {}; }
    return { data: { items }, error: null };
  }

  // ─── Behaviour events (retention measurement) ──────────

  async insertEvents(userId, rows) {
    if (!Array.isArray(rows) || rows.length === 0) return { data: [], error: null };
    return { data: [], error: null };
  }

  // ─── Raw table access (for generic endpoints) ──────────

  async queryRaw(sql, params = []) {
    try {
      const normalizedSql = sql.replace(/\$\d+/g, '?');
      const stmt = this.db.prepare(normalizedSql);
      const cleanParams = this._sanitizeParams(params);
      const rows = cleanParams.length > 0 ? stmt.all(...cleanParams) : stmt.all();
      return { data: rows.map(r => this._toObject(r)), error: null };
    } catch (e) {
      return { data: null, error: e.message };
    }
  }
}

module.exports = SQLiteDB;

