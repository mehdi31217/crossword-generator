/**
 * Redis — Central Redis client with pub/sub + data structures.
 *
 * Provides:
 *   1. Pub/Sub for cross-instance WebSocket message broadcasting
 *   2. Sorted-set-based matchmaking queue (persistent, shared across instances)
 *   3. Sliding-window rate limiting (shared across instances)
 *   4. Key-value store for session blocklist (optional)
 *
 * Graceful degradation: if Redis is unavailable, every method returns a
 * no-op / in-memory fallback so the server continues working without Redis.
 *
 * Requirements:
 *   brew install redis
 *   redis-server --daemonize yes
 *
 * Set in .env:  REDIS_URL=redis://localhost:6379  (or omit for fallback)
 *
 * Usage:
 *   const redis = require('./redis');
 *   await redis.publish('channel:msg', payload);
 *   await redis.matchmakingAdd('player-123', { mode: 'speed', score: 1500 });
 *   const match = await redis.matchmakingFind({ mode: 'speed', score: 1500 });
 */

const logger = require('./utils/logger');
const Redis = require('ioredis');

const REDIS_URL = process.env.REDIS_URL || '';
const REDIS_ENABLED = !!REDIS_URL;

// ─── Pub/Sub state (in-memory fallback) ────────────────────
const fallbackChannels = new Map();   // channel → Set<subscriber callback>
let pubClient = null;
let subClient = null;
let _connected = false;

// ─── Rate limit state (in-memory fallback) ─────────────────
const fallbackRateMap = new Map();

// ─── Matchmaking state (in-memory fallback) ────────────────
let fallbackQueue = [];
const MATCHMAKING_TIMEOUT = 30000;

// ─── Arena game state (in-memory fallback) ─────────────────
let fallbackPendingGames = []; // { gameId, playerId, mode, wager, timestamp }
const ARENA_TIMEOUT = 300000; // 5min
let arenaGameCounter = 1000;

// ─── Init ──────────────────────────────────────────────────

if (REDIS_ENABLED) {
  try {
    pubClient = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        // Never give up: Redis may come back after a restart or network blip.
        // Cap the backoff so recovery stays prompt.
        return Math.min(times * 200, 5000);
      },
      lazyConnect: true,
    });

    subClient = pubClient.duplicate();
    subClient.setMaxListeners(50);

    // Re-arm the connected flag whenever a client (re)connects.
    pubClient.on('ready', () => { _connected = true; });
    subClient.on('ready', () => { _connected = true; });

    // Subscribe to all channels — forward to local callbacks
    subClient.on('message', (channel, message) => {
      const subs = fallbackChannels.get(channel);
      if (subs) {
        let parsed;
        try { parsed = JSON.parse(message); } catch { parsed = message; }
        for (const cb of subs) {
          try { cb(parsed, channel); } catch (e) { /* prevent callback exceptions from crashing */ }
        }
      }
    });

    // Connect
    Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
      _connected = true;
      logger.info('[redis] ✅ Connected to Redis');
    }).catch(err => {
      logger.warn('[redis] ❌ Connection failed:', err.message);
      logger.warn('[redis] Using in-memory fallback — set REDIS_URL to enable');
      _connected = false;
    });
  } catch (e) {
    logger.warn('[redis] Init failed:', e.message, '— using fallback');
  }
} else {
  logger.info('[redis] REDIS_URL not set — using in-memory fallback');
}

// ─── Helpers ───────────────────────────────────────────────

function isConnected() { return _connected && pubClient && subClient && pubClient.status === 'ready'; }

// ─── Pub/Sub API ───────────────────────────────────────────

/**
 * Publish a message to a channel.
 * With Redis: all connected server instances receive it.
 * Without Redis: only this process's subscribers.
 */
async function publish(channel, message) {
  const payload = typeof message === 'string' ? message : JSON.stringify(message);
  if (isConnected()) {
    try { await pubClient.publish(channel, payload); } catch (e) { /* fall through */ }
  }
  // Also deliver locally (for in-process subscribers)
  const subs = fallbackChannels.get(channel);
  if (subs) {
    let parsed;
    try { parsed = JSON.parse(payload); } catch { parsed = payload; }
    for (const cb of subs) {
      try { cb(parsed, channel); } catch (e) { /* silent */ }
    }
  }
}

/**
 * Subscribe to a channel. Returns an unsubscribe function.
 * With Redis: receives messages published by any instance.
 * Without Redis: local-only.
 */
function subscribe(channel, callback) {
  if (!fallbackChannels.has(channel)) {
    fallbackChannels.set(channel, new Set());
  }
  fallbackChannels.get(channel).add(callback);
  if (isConnected()) {
    subClient.subscribe(channel).catch(e => logger.warn('[redis] subscribe error:', e.message));
  }
  return () => {
    const subs = fallbackChannels.get(channel);
    if (subs) {
      subs.delete(callback);
      if (subs.size === 0) {
        fallbackChannels.delete(channel);
        if (isConnected()) subClient.unsubscribe(channel).catch(() => {});
      }
    }
  };
}

// ─── Matchmaking Lua Script (atomic find-or-add) ────────────

const MATCHMAKING_FIND_OR_ADD = `
local key = KEYS[1]
local playerJson = ARGV[1]
local playerId = ARGV[2]
local roomId = ARGV[3]
local now = tonumber(ARGV[4])
local cutoff = tonumber(ARGV[5])

-- Never pair a live player with an abandoned entry: a client that closed its
-- tab never calls /matchmaking/leave, and matching it leaves the newcomer
-- alone in a room that nobody will ever join.
redis.call('ZREMRANGEBYSCORE', key, '-inf', cutoff)
local candidates = redis.call('ZRANGEBYSCORE', key, '-inf', '+inf', 'LIMIT', 0, 10)
for i, candidateJson in ipairs(candidates) do
    local ok, candidate = pcall(cjson.decode, candidateJson)
    if ok and candidate.playerId ~= playerId then
        redis.call('ZREM', key, candidateJson)
        return cjson.encode({ status = 'matched', roomId = roomId, isHost = false, opponent = candidate })
    end
end
redis.call('ZADD', key, now, playerJson)
return cjson.encode({ status = 'waiting' })
`;

// ─── Matchmaking API ───────────────────────────────────────

/**
 * Add a player to the matchmaking queue.
 * Uses an atomic Lua script to prevent TOCTOU race conditions.
 * Returns { status: 'waiting' } or { status: 'matched', ...opponent, roomId }
 */
async function matchmakingAdd(player) {
  const { playerId, mode, wager = 0 } = player;

  if (isConnected()) {
    const key = `mm:${mode}:${wager}`;
    const entry = JSON.stringify({ ...player, timestamp: Date.now() });
    const roomId = Math.floor(100000 + Math.random() * 900000).toString();
    try {
      const result = await pubClient.eval(
        MATCHMAKING_FIND_OR_ADD,
        1,
        key,
        entry,
        playerId,
        roomId,
        Date.now().toString(),
        (Date.now() - MATCHMAKING_TIMEOUT).toString()
      );
      return JSON.parse(result);
    } catch (e) {
      logger.warn('[redis] matchmakingAdd eval failed:', e.message);
      // Fall through to in-memory fallback
    }
  }

  // In-memory fallback (original behavior, non-atomic but single-process)
  // Drop abandoned entries before matching (see the Lua script above).
  const now = Date.now();
  fallbackQueue = fallbackQueue.filter(p => now - p.timestamp <= MATCHMAKING_TIMEOUT);
  const matchIdx = fallbackQueue.findIndex(p => p.mode === mode && p.wager === wager && p.playerId !== playerId);
  if (matchIdx >= 0) {
    const match = fallbackQueue.splice(matchIdx, 1)[0];
    const roomId = Math.floor(100000 + Math.random() * 900000).toString();
    return { status: 'matched', roomId, isHost: false, opponent: match };
  }
  fallbackQueue.push({ ...player, timestamp: Date.now() });
  return { status: 'waiting' };
}

/**
 * Non-blocking key scan. Replaces blocking `KEYS` (O(N) on the Redis event
 * loop) with cursor-based `SCAN`, so large matchmaking sets can't stall Redis.
 */
async function scanKeys(pattern) {
  const keys = [];
  let cursor = '0';
  do {
    const [next, batch] = await pubClient.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
    cursor = next;
    if (batch && batch.length) keys.push(...batch);
  } while (cursor !== '0');
  return keys;
}

/**
 * Remove a player from the matchmaking queue.
 */
async function matchmakingRemove(playerId) {
  if (isConnected()) {
    // Remove from all possible mode:wager keys
    const keys = await scanKeys('mm:*').catch(() => []);
    for (const key of keys) {
      const candidates = await pubClient.zrangebyscore(key, '-inf', '+inf').catch(() => []);
      for (const c of candidates) {
        let cData;
        try { cData = JSON.parse(c); } catch { continue; }
        if (cData.playerId === playerId) {
          await pubClient.zrem(key, c).catch(() => {});
        }
      }
    }
    return;
  }
  const idx = fallbackQueue.findIndex(p => p.playerId === playerId);
  if (idx >= 0) fallbackQueue.splice(idx, 1);
}

/**
 * Check a player's matchmaking status.
 */
async function matchmakingStatus(playerId) {
  if (isConnected()) {
    const keys = await scanKeys('mm:*').catch(() => []);
    for (const key of keys) {
      const candidates = await pubClient.zrangebyscore(key, '-inf', '+inf').catch(() => []);
      for (const c of candidates) {
        let cData;
        try { cData = JSON.parse(c); } catch { continue; }
        if (cData.playerId === playerId) {
          const ts = cData.timestamp || 0;
          if (Date.now() - ts > MATCHMAKING_TIMEOUT) {
            await pubClient.zrem(key, c);
            return { status: 'timeout' };
          }
          return { status: 'waiting' };
        }
      }
    }
    return { status: 'unknown' };
  }
  const idx = fallbackQueue.findIndex(p => p.playerId === playerId);
  if (idx >= 0) {
    if (Date.now() - fallbackQueue[idx].timestamp > MATCHMAKING_TIMEOUT) {
      fallbackQueue.splice(idx, 1);
      return { status: 'timeout' };
    }
    return { status: 'waiting' };
  }
  return { status: 'unknown' };
}

/**
 * Clean stale entries from the matchmaking queue.
 */
async function matchmakingCleanup() {
  if (isConnected()) {
    const keys = await scanKeys('mm:*').catch(() => []);
    const cutoff = Date.now() - MATCHMAKING_TIMEOUT;
    for (const key of keys) {
      await pubClient.zremrangebyscore(key, '-inf', cutoff).catch(() => {});
    }
    return;
  }
  const now = Date.now();
  while (fallbackQueue.length > 0 && now - fallbackQueue[0].timestamp > MATCHMAKING_TIMEOUT) {
    fallbackQueue.shift();
  }
}

// ─── Arena API ─────────────────────────────────────────────

/**
 * Add a pending arena game to the queue.
 * The game entry contains the creator's playerId but the list API
 * (arenaList) strips all identifying info for anonymity.
 *
 * `timestamp` is only passed when re-queueing a game whose wager refund failed,
 * so the entry keeps its original age and is retried on the next cleanup cycle.
 */
async function arenaAdd(gameId, playerId, mode, wager, timestamp) {
  const entry = { gameId, playerId, mode, wager, timestamp: timestamp || Date.now() };
  if (isConnected()) {
    try {
      await pubClient.hset('arena:games', gameId, JSON.stringify(entry));
      await pubClient.zadd('arena:games:by_ts', entry.timestamp, gameId);
    } catch (e) {
      logger.warn('[redis] arenaAdd failed:', e.message);
      fallbackPendingGames.push(entry);
    }
    return;
  }
  fallbackPendingGames.push(entry);
}

/**
 * List all pending arena games.
 * Returns: [{ gameId, mode, wager, playerId }]
 *
 * `playerId` is for SERVER-SIDE use only — the HTTP layer turns it into a
 * boolean `mine` flag and strips it, so no client ever receives an identity.
 * It is needed because `myPendingGameId` is React state: after a reload (or in
 * a second tab) the creator no longer recognises its own listing, and clicking
 * Join on it just 404s.
 */
async function arenaList() {
  const now = Date.now();
  const cutoff = now - ARENA_TIMEOUT;

  if (isConnected()) {
    try {
      const gameIds = await pubClient.zrangebyscore('arena:games:by_ts', cutoff, '+inf');
      if (gameIds && gameIds.length > 0) {
        const pipe = pubClient.pipeline();
        for (const gid of gameIds) {
          pipe.hget('arena:games', gid);
        }
        const results = await pipe.exec();
        const games = [];
        for (let i = 0; i < results.length; i++) {
          const raw = results[i][1]; // [err, result]
          if (!raw) continue;
          try {
            const entry = JSON.parse(raw);
            // `playerId` is carried out of here so the HTTP layer can tell the
            // caller which listing is theirs. It is STRIPPED there and never
            // serialized to a client — the anonymity of the list is preserved.
            games.push({ gameId: entry.gameId, mode: entry.mode, wager: entry.wager, playerId: entry.playerId });
          } catch {}
        }
        return games;
      }
      // Redis returned empty — fall through to in-memory fallback
    } catch (e) {
      logger.warn('[redis] arenaList failed:', e.message);
      // Fall through
    }
  }

  return fallbackPendingGames
    .filter(g => now - g.timestamp < ARENA_TIMEOUT)
    .map(g => ({ gameId: g.gameId, mode: g.mode, wager: g.wager, playerId: g.playerId }));
}

/**
 * Atomic join: remove a game from the queue and return the creator's info.
 * Returns the full entry (with playerId) or null if game is gone.
 * The joiner's identity is NOT stored in the queue — it's returned directly.
 */
async function arenaJoin(gameId, joinerId) {
  if (isConnected()) {
    try {
      const raw = await pubClient.hget('arena:games', gameId);
      if (raw) {
        const entry = JSON.parse(raw);
        if (joinerId === entry.playerId) return null; // can't join own game
        // HDEL is atomic and returns how many fields it removed, so exactly one
        // caller can receive `1` — that caller owns the game. Without this
        // claim, two simultaneous joiners would both build a room against the
        // same creator, and a cleanup racing a join could refund a game that is
        // actually about to be played.
        const removed = await pubClient.hdel('arena:games', gameId);
        if (removed !== 1) return null;
        await pubClient.zrem('arena:games:by_ts', gameId);
        return entry;
      }
      // If not found in Redis, fall through to in-memory fallback
    } catch (e) {
      logger.warn('[redis] arenaJoin failed:', e.message);
      // Fall through to in-memory fallback
    }
  }

  const idx = fallbackPendingGames.findIndex(g => g.gameId === gameId);
  if (idx < 0) return null;
  // Check ownership *before* splicing — otherwise a creator who joined their own
  // game would have it silently dropped (and their escrowed wager with it).
  if (joinerId === fallbackPendingGames[idx].playerId) return null;
  return fallbackPendingGames.splice(idx, 1)[0];
}

/**
 * Cancel a pending game and refund the creator's game slot.
 * Returns the game entry (with playerId) or null if not found.
 */
async function arenaCancel(gameId) {
  if (isConnected()) {
    try {
      const raw = await pubClient.hget('arena:games', gameId);
      if (raw) {
        const entry = JSON.parse(raw);
        await pubClient.hdel('arena:games', gameId);
        await pubClient.zrem('arena:games:by_ts', gameId);
        return entry;
      }
      // Not found in Redis — fall through to in-memory fallback
    } catch (e) {
      logger.warn('[redis] arenaCancel failed:', e.message);
      // Fall through to in-memory fallback
    }
  }

  const idx = fallbackPendingGames.findIndex(g => g.gameId === gameId);
  if (idx < 0) return null;
  const entry = fallbackPendingGames.splice(idx, 1)[0];
  return entry;
}

/**
 * Generate a unique, non-sequential game ID for arena.
 */
function arenaGenerateGameId() {
  arenaGameCounter++;
  return 'ag_' + Date.now().toString(36) + '_' + arenaGameCounter.toString(36);
}

/**
 * Clean stale pending games (older than ARENA_TIMEOUT).
 *
 * Returns the entries that were genuinely expired, so the caller can refund
 * each creator's escrowed wager. A game is only reported once its HDEL claim
 * succeeds (HDEL returns the number of fields removed), which keeps this safe
 * against a joiner racing the cleanup for the same game.
 *
 * @returns {Promise<Array<{gameId, playerId, mode, wager, timestamp}>>}
 */
async function arenaCleanup() {
  const cutoff = Date.now() - ARENA_TIMEOUT;
  const expired = [];

  if (isConnected()) {
    try {
      const staleIds = await pubClient.zrangebyscore('arena:games:by_ts', '-inf', cutoff);
      if (staleIds && staleIds.length > 0) {
        // Read the entries first, then claim them in a second pass.
        const readPipe = pubClient.pipeline();
        for (const gid of staleIds) readPipe.hget('arena:games', gid);
        const reads = await readPipe.exec();

        const candidates = [];
        const claimPipe = pubClient.pipeline();
        for (let i = 0; i < staleIds.length; i++) {
          const raw = reads[i] && reads[i][1];
          let entry = null;
          if (raw) {
            try { entry = JSON.parse(raw); } catch (_) { entry = null; }
          }
          candidates.push(entry);
          // Always queue both commands so the result indices stay aligned:
          // hdel lands at 2*i, zrem at 2*i + 1.
          claimPipe.hdel('arena:games', staleIds[i]);
          claimPipe.zrem('arena:games:by_ts', staleIds[i]);
        }
        const claims = await claimPipe.exec();

        for (let i = 0; i < candidates.length; i++) {
          const hdelResult = claims[2 * i] && claims[2 * i][1];
          if (hdelResult === 1 && candidates[i]) expired.push(candidates[i]);
        }
        if (expired.length > 0) {
          logger.info(`[redis] arenaCleanup: expired ${expired.length} stale games`);
        }
      }
    } catch (e) {
      logger.warn('[redis] arenaCleanup failed:', e.message);
    }
    return expired;
  }

  const now = Date.now();
  const kept = [];
  for (const g of fallbackPendingGames) {
    if (now - g.timestamp < ARENA_TIMEOUT) kept.push(g);
    else expired.push(g);
  }
  fallbackPendingGames = kept;
  if (expired.length > 0) {
    logger.info(`[redis] arenaCleanup: expired ${expired.length} stale games`);
  }
  return expired;
}

// ─── Rate Limit API ────────────────────────────────────────

/**
 * Check if a request should be rate-limited.
 * Returns { allowed: bool, remaining: number, resetMs: number }
 *
 * key    — unique identifier (e.g. 'rl:user-123:POST:/api/match')
 * max    — max requests in the window
 * window — window duration in ms (default 60000 = 1 min)
 */
async function checkRateLimit(key, max = 150, window = 60000) {
  if (isConnected()) {
    const now = Date.now();
    const member = `${now}`;
    try {
      const multi = pubClient.multi();
      multi.zadd(key, now, member);
      multi.zremrangebyscore(key, 0, now - window);
      multi.zcard(key);
      multi.expire(key, Math.ceil(window / 1000));
      const results = await multi.exec();
      const count = results?.[2]?.[1] || 0;
      const allowed = count <= max;
      return { allowed, remaining: Math.max(0, max - count), resetMs: window };
    } catch (e) {
      return { allowed: true, remaining: 1, resetMs: window };
    }
  }

  // In-memory fallback
  const now = Date.now();
  if (!fallbackRateMap.has(key)) {
    fallbackRateMap.set(key, []);
  }
  const hits = fallbackRateMap.get(key);
  // Remove expired entries
  while (hits.length > 0 && now - hits[0] > window) hits.shift();
  if (hits.length >= max) {
    return { allowed: false, remaining: 0, resetMs: window - (now - hits[0]) };
  }
  hits.push(now);
  return { allowed: true, remaining: max - hits.length, resetMs: window };
}

// ─── Key-Value Store ───────────────────────────────────────

// Single-process fallback for deployments without Redis. Escrow / settlement
// records live here, so without it a double-call would debit twice and a
// decided match could never be paid out. Only used when Redis is unreachable
// (cross-instance coordination is already unavailable in that mode).
const fallbackKV = new Map(); // key -> { value: string, expiresAt: number }
const FALLBACK_KV_MAX = 5000;

function kvGetLocal(key) {
  const entry = fallbackKV.get(key);
  if (!entry) return null;
  if (entry.expiresAt && entry.expiresAt <= Date.now()) {
    fallbackKV.delete(key);
    return null;
  }
  return entry.value;
}

function kvSetLocal(key, value, ttlSeconds = 0) {
  if (fallbackKV.size >= FALLBACK_KV_MAX && !fallbackKV.has(key)) {
    // Drop expired entries first; if the map is still full, evict the oldest.
    const now = Date.now();
    for (const [k, v] of fallbackKV) {
      if (v.expiresAt && v.expiresAt <= now) fallbackKV.delete(k);
    }
    if (fallbackKV.size >= FALLBACK_KV_MAX) {
      fallbackKV.delete(fallbackKV.keys().next().value);
    }
  }
  fallbackKV.set(key, {
    value: typeof value === 'string' ? value : JSON.stringify(value),
    expiresAt: ttlSeconds > 0 ? Date.now() + ttlSeconds * 1000 : 0,
  });
}

async function set(key, value, ttlSeconds = 0) {
  if (isConnected()) {
    try {
      if (ttlSeconds > 0) {
        await pubClient.setex(key, ttlSeconds, typeof value === 'string' ? value : JSON.stringify(value));
      } else {
        await pubClient.set(key, typeof value === 'string' ? value : JSON.stringify(value));
      }
    } catch (e) { /* fall through to local */ }
  }
  kvSetLocal(key, value, ttlSeconds);
}

async function get(key) {
  if (isConnected()) {
    try {
      // A successful GET is authoritative — don't resurrect a stale local copy
      // when another instance has deleted or overwritten the key.
      const remote = await pubClient.get(key);
      return remote === undefined ? null : remote;
    } catch { /* fall through to local */ }
  }
  return kvGetLocal(key);
}

async function del(key) {
  if (isConnected()) {
    try { await pubClient.del(key); } catch { /* ignore */ }
  }
  fallbackKV.delete(key);
}

/**
 * Atomic "claim" primitive: SET key value NX EX ttl.
 * Returns true if THIS caller created the key (i.e. won the claim),
 * false if the key already existed (someone else — possibly another server
 * instance — already claimed it).
 *
 * Used for cross-instance idempotency (e.g. paying an arena pot exactly once)
 * where an in-process boolean would be per-instance and therefore unsafe.
 * Returns null when Redis is unavailable so the caller can fall back.
 */
async function setIfNotExists(key, value, ttlSeconds = 3600) {
  if (isConnected()) {
    try {
      const res = await pubClient.set(
        key,
        typeof value === 'string' ? value : JSON.stringify(value),
        'NX',
        'EX',
        ttlSeconds,
      );
      return res === 'OK';
    } catch (e) {
      // Fall through to the single-process claim below.
    }
  }
  // Node is single-threaded, so a get-then-set here is atomic for this process —
  // enough to make a one-instance deployment settle each room exactly once.
  if (kvGetLocal(key) !== null) return false;
  kvSetLocal(key, value, ttlSeconds);
  return true;
}

// ─── Cleanup ───────────────────────────────────────────────

async function shutdown() {
  if (pubClient) { try { await pubClient.quit(); } catch {} }
  if (subClient) { try { await subClient.quit(); } catch {} }
}

// ─── Periodic cleanup for matchmaking ──────────────────────
setInterval(() => { matchmakingCleanup(); }, 5000);
// NOTE: arenaCleanup is deliberately NOT scheduled here. Expiring a game has to
// refund the creator's escrowed wager, which needs the DB — so the loop lives in
// index.js, which calls arenaCleanup() and pays the refunds out.

module.exports = {
  // Connection
  isConnected,
  shutdown,
  get connected() { return _connected; },

  // Pub/Sub
  publish,
  subscribe,

  // Matchmaking
  matchmakingAdd,
  matchmakingRemove,
  matchmakingStatus,
  matchmakingCleanup,

  // Arena
  arenaAdd,
  arenaList,
  arenaJoin,
  arenaCancel,
  arenaGenerateGameId,
  arenaCleanup,

  // Rate Limiting
  checkRateLimit,

  // Key-Value
  set,
  get,
  setIfNotExists,
  del,
};
