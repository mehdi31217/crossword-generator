require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const crypto = require('crypto');
const logger = require('./utils/logger');
const { setupWebSocket, sendToUser, sendToUserWithRetry, broadcastToChannel, channels: wsChannels, pendingNotifications, pushPendingNotification } = require('./wsServer');
const { rateLimit } = require('./middleware/rateLimit');
const { createSession, validateToken, requireAuth } = require('./middleware/sessionAuth');
const redis = require('./redis');
// Server-side league/trophy math (mirror of services/league.ts). The client may
// not name its own rating — deltas are computed here from server-stored values.
const leagueMath = require('./league');

const PORT = process.env.BACKEND_PORT || 8081;
const db = require('./db');
// Every coin faucet and sink lives in one module (mirror: utils/economy.ts), so
// the paid amounts, the daily caps and the shop prices cannot drift apart.
const {
  INITIAL_COINS,
  DAILY_PUZZLE_REWARD,
  DAILY_TOWER_COIN_CAP,
  TOWER_MAX_RUN_COINS,
  COIN_PRICES,
  SHOP_ITEM_GRANTS,
  LEAGUE_WIN_REWARD,
  LEAGUE_DAILY_WIN_CAP,
  DUEL_COINS,
  WIN_STREAK_BONUS,
  REWARDED_AD_COINS,
  REWARDED_AD_DAILY_CAP,
  WEB_DIRECT_BONUS_RATE,
  IAP_PACKAGES,
  IAP_BY_ID,
  WHEEL_WEDGES,
  FREE_BOOK_IDS,
  getBookUnlockCost,
  FREE_AVATAR_IDS,
  getAvatarUnlockCost,
  FREE_FOOTBALL_LEGEND_IDS,
  getLegendUnlockCost,
  SIZE_UNLOCK_COSTS,
  CATEGORY_UNLOCK_COSTS,
} = require('./economy');
// Streak / XP / quests / seasons / cosmetics. Server-owned for the same reason
// coins and trophies are: a progression a client can write is a coin printer.
const progression = require('./progression');
// Football collection sets (legendId -> chapter ids) used to validate a
// set-completion reward. Regenerate with `node scripts/gen-collection-sets.cjs`.
const COLLECTION_SETS = (() => {
  try { return require('./collection-sets.json'); } catch (_) { return { football: {} }; }
})();

// Room registry: roomId -> { hostId, joinerId?, wager?, mode?, isArena?, createdAt }
// Stored in Redis so every server instance sees the same rooms (needed when
// more than one worker/process is running). The local Map is only a cache and
// the fallback when Redis is down.
const roomRegistry = new Map();
const ROOM_REGISTRY_TTL = 300000; // 5min — matches challenge timeout
const roomKey = (roomId) => `room:reg:${roomId}`;

/** Persist a room in Redis (+ local cache). Fire-and-forget safe. */
async function roomSet(roomId, entry) {
  roomRegistry.set(roomId, entry);
  try {
    await redis.set(roomKey(roomId), entry, Math.ceil(ROOM_REGISTRY_TTL / 1000));
  } catch (e) { /* Redis down — local copy still serves this instance */ }
}

/** Read a room, preferring the shared copy so another instance's write is visible. */
async function roomGet(roomId) {
  try {
    const raw = await redis.get(roomKey(roomId));
    if (raw) {
      const shared = typeof raw === 'string' ? JSON.parse(raw) : raw;
      if (shared && Date.now() - (shared.createdAt || 0) < ROOM_REGISTRY_TTL) {
        roomRegistry.set(roomId, shared);
        return shared;
      }
    }
  } catch (e) { /* fall through to local cache */ }
  const local = roomRegistry.get(roomId);
  if (local && Date.now() - (local.createdAt || 0) < ROOM_REGISTRY_TTL) return local;
  return undefined;
}

async function roomDelete(roomId) {
  roomRegistry.delete(roomId);
  try { await redis.del(roomKey(roomId)); } catch (e) { /* ignore */ }
}

// Clean stale entries from the local cache every 10s (Redis copies self-expire)
setInterval(() => {
  const now = Date.now();
  for (const [roomId, entry] of roomRegistry) {
    if (now - entry.createdAt > ROOM_REGISTRY_TTL) {
      roomRegistry.delete(roomId);
    }
  }
}, 10000);

// Refund the escrowed wager of arena games that expired without ever being
// joined. `/api/arena/create` debits the creator up-front and parks the game in
// the pending queue; if nobody joins and the creator never calls
// `/api/arena/cancel` (they closed the tab, lost connection, …), the queue
// entry used to be dropped silently and the coins were gone for good.
//
// `redis.arenaCleanup()` returns only the entries it actually claimed (one
// atomic HDEL per game), so a game that a joiner grabs in the same instant is
// never both joined *and* refunded. If the refund itself fails we put the game
// back with its original timestamp so the next cycle retries — a player's
// coins are never dropped just because the DB blipped.
setInterval(async () => {
  let expired = [];
  try {
    expired = await redis.arenaCleanup();
  } catch (e) {
    logger.warn('[arena/expire] cleanup failed:', e?.message);
    return;
  }
  for (const game of expired) {
    if (!game || !game.playerId || !game.wager) continue;
    try {
      const { data: user } = await db.getUser(game.playerId);
      if (!user) continue; // account is gone — nothing left to refund
      await db.updateUser(game.playerId, { coins: (user.coins || 0) + game.wager });
      logger.info(`[arena/expire] refunded ${game.wager} to ${game.playerId} (gameId=${game.gameId})`);
    } catch (e) {
      logger.warn(`[arena/expire] refund failed for ${game.playerId}:`, e?.message);
      try {
        await redis.arenaAdd(game.gameId, game.playerId, game.mode, game.wager, game.timestamp);
      } catch (_) { /* Redis down too — retried on the next cycle */ }
    }
  }
}, 30000);

// Rate limit: 150 requests per minute per IP per route (1000 for load testing)
const RATE_LIMIT = parseInt(process.env.RATE_LIMIT || '150');
const limiter = rateLimit({ windowMs: 60_000, maxRequests: RATE_LIMIT });

/**
 * Per-USER throttle for a route. The global limiter keys on IP+path, so one
 * client can walk around it just by opening more connections. This keys on the
 * authenticated user id, which is what actually bounds a reward farm.
 * Fails open — a Redis hiccup must never block gameplay.
 *
 * @returns {Promise<boolean>} true when the call is allowed
 */
async function userThrottle(userId, bucket, max, windowMs) {
  if (!userId) return true;
  try {
    const res = await redis.checkRateLimit(`rl:user:${userId}:${bucket}`, max, windowMs);
    return res.allowed !== false;
  } catch (_) {
    return true;
  }
}

async function createApp(externalServer) {
  // Wait for database to be ready
  await db.ready;
  logger.info('Database ready');

  const app = express();
  const server = externalServer || http.createServer(app);
  // Behind nginx / tunnel — trust the proxy so req.ip is the real client IP.
  // Without this, rate limiting buckets every client under the proxy IP.
  app.set('trust proxy', 1);
  app.use(express.json({ limit: '1mb' }));
  app.use(helmet());
  // دامنه‌های مجاز برای CORS — هم محلی و هم تونل
  const allowedOrigins = [
    'http://127.0.0.1:8080',
    'http://localhost:8080',
    'http://127.0.0.1:3000',
    'http://localhost:3000',
    'https://*.serveousercontent.com',
    'https://*.run.app',
    ...(process.env.CORS_ORIGIN ? [process.env.CORS_ORIGIN] : []),
  ];
  app.use(cors({
    origin: (origin, cb) => {
      // Allow requests with no origin (server-to-server, curl, etc.)
      if (!origin) return cb(null, true);
      // Check exact match or wildcard
      const allowed = allowedOrigins.some(a => {
        if (a.startsWith('https://*.')) {
          // Wildcard: https://*.domain.com
          const suffix = a.slice(10); // remove 'https://*.'
          return origin.startsWith('https://') && origin.endsWith('.' + suffix);
        }
        return a === origin;
      });
      cb(null, allowed);
    },
    credentials: true,
  }));
  app.set('etag', false);

  // ─── Health / Liveness / Readiness (public, before rate-limit & auth) ───
  app.get('/healthz', (req, res) => res.status(200).type('text/plain').send('ok'));
  app.get('/readyz', async (req, res) => {
    const dbOk = await db.ready.catch(() => false);
    const redisOk = redis.connected;
    const pgOk = db.type === 'postgres' ? dbOk : true; // pg = postgres or sqlite
    res.status(dbOk ? 200 : 503).json({
      status: dbOk ? 'ready' : 'not_ready',
      database: dbOk ? 'ok' : 'error',
      postgres: pgOk ? 'ok' : 'not_used',
      redis: redisOk ? 'ok' : 'fallback',
      timestamp: new Date().toISOString(),
    });
  });

  // Apply rate limiter and auth to ALL routes
  app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    next();
  });
  app.use(limiter);
  app.use(requireAuth);

  // ─── Helpers ──────────────────────────────────────────
  function generateFriendCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) code += chars[crypto.randomInt(chars.length)];
    return code;
  }

  function sanitize(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/[<>]/g, '').slice(0, 200);
  }

  /**
   * Monotonic merge of collectible cards (`{ [chapterId]: 1|2|3|4 }`).
   * A card's rarity never goes down: replaying a chapter badly, or syncing from
   * a stale tab, must not take away a card that was already earned.
   */
  function mergeWorldMapCards(current, incoming) {
    const out = {};
    const put = (src) => {
      if (!src || typeof src !== 'object') return;
      for (const [id, rarity] of Object.entries(src)) {
        if (typeof id !== 'string' || id.length > 80) continue;
        const value = Number(rarity);
        if (!Number.isInteger(value) || value < 1 || value > 4) continue;
        out[id] = Math.max(out[id] || 0, value);
      }
    };
    put(current);
    put(incoming);
    return out;
  }

  /**
   * True when an accepted friendship exists between the two users (either direction).
   * Used to stop any authenticated user from DMing / notifying an arbitrary victim.
   */
  async function areFriends(a, b) {
    if (!a || !b || a === b) return false;
    const { data } = await db.getFriends(a);
    return (data || []).some(f =>
      f.status === 'accepted' && (f.user_id === b || f.friend_id === b)
    );
  }

  // ─── Password hashing (scrypt) ─────────────────────────
  // New hashes: "scrypt$<N>$<saltHex>$<hashHex>" (salted, slow KDF).
  // Legacy hashes (unsalted SHA-256, 64 hex chars) are still verifiable and are
  // transparently upgraded to scrypt on the next successful login.
  const SCRYPT_N = 16384, SCRYPT_R = 8, SCRYPT_P = 1, SCRYPT_KEYLEN = 64;

  function hashPassword(password) {
    const salt = crypto.randomBytes(16);
    const derived = crypto.scryptSync(String(password), salt, SCRYPT_KEYLEN, {
      N: SCRYPT_N, r: SCRYPT_R, p: SCRYPT_P,
    });
    return `scrypt$${SCRYPT_N}$${salt.toString('hex')}$${derived.toString('hex')}`;
  }

  function isLegacyHash(stored) {
    return typeof stored === 'string'
      && !stored.startsWith('scrypt$')
      && /^[0-9a-f]{64}$/i.test(stored);
  }

  function verifyPassword(password, stored) {
    if (!stored || typeof stored !== 'string') return false;
    try {
      if (stored.startsWith('scrypt$')) {
        const parts = stored.split('$');
        const N = parseInt(parts[1], 10) || SCRYPT_N;
        const salt = Buffer.from(parts[2], 'hex');
        const expected = Buffer.from(parts[3], 'hex');
        const derived = crypto.scryptSync(String(password), salt, expected.length, {
          N, r: SCRYPT_R, p: SCRYPT_P,
        });
        return derived.length === expected.length && crypto.timingSafeEqual(derived, expected);
      }
      // Legacy unsalted SHA-256
      const legacy = crypto.createHash('sha256').update(String(password)).digest('hex');
      return crypto.timingSafeEqual(Buffer.from(legacy, 'hex'), Buffer.from(stored, 'hex'));
    } catch (e) {
      return false;
    }
  }

  // Maximum allowed values for score submission
  const MAX_SCORE = 10000;
  // Upper bound for any client-reported coin balance. The game is local-first,
  // so the server mirrors the client's balance — but only within a sane ceiling
  // to prevent absurd coin minting.
  const MAX_COINS = 10_000_000;
  // Coin amounts (daily prize, tower ceiling, shop prices, duel rewards) come from
  // ./economy — the audit behind those numbers is written down there.

  // Tower tickets are a PAID consumable (the shop sells one for 30 coins), so the
  // server has to own the count. Before this, the client held it outright: the
  // free-ticket button incremented localStorage with no server call at all, the
  // load path `Math.max`-merged local over server (so a hand-edited
  // `towerTickets: 999` stuck), and the shop debited the coins without granting
  // anything server-side. `MAX_TOWER_TICKETS` / the refill window mirror the cap
  // and interval the UI already advertises (`TowerLobby.tsx`, `reconcileTowerState`).
  const MAX_TOWER_TICKETS = 2;
  const TOWER_TICKET_REFILL_SEC = 12 * 60 * 60;

  // Daily ceiling on CASUAL trophy awards. The casual award is derived from a
  // client-reported score, and the game's scoring formula is unbounded (the combo
  // multiplier has no cap), so no numeric plausibility envelope is possible — the
  // only sound bound is a per-day total. Override with DAILY_TROPHY_CAP.
  const DAILY_TROPHY_CAP = parseInt(process.env.DAILY_TROPHY_CAP || '500');
  const MAX_TIME = 600; // 10 minutes
  const MIN_TIME = 5;   // 5 seconds minimum

  /**
   * Bound the starting balance reported by the client at sign-up.
   *
   * A fresh account inherits the guest's local coins, so the value has to be
   * accepted from the client — but only within the same ceiling every other
   * sync point uses. Non-numeric input is coerced to the default instead of
   * producing NaN (which used to reach the DB and break the insert).
   */
  const clampInitialCoins = (raw) => {
    const n = Number.parseInt(raw, 10);
    if (!Number.isFinite(n)) return INITIAL_COINS;
    return Math.min(Math.max(n, INITIAL_COINS), MAX_COINS);
  };

  // ─── PROGRESSION (streak / XP / quests / season / cosmetics) ──

  /**
   * Current displayed streak. A chain only counts while it is unbroken: played
   * today or yesterday keeps it, anything longer dropped it to zero (unless a
   * shield is owned, which `planDaily` spends when the run is finished).
   */
  function displayStreak(profile) {
    const last = profile.daily_streak_last || '';
    const value = Number(profile.daily_streak) || 0;
    if (last === progression.todayString() || last === progression.yesterdayString()) return value;
    return 0;
  }

  /**
   * Advance the 28-day league season when the stored one is over.
   *
   * The reward is settled against the tier the player FINISHED in, so the tier is
   * captured before the soft reset shrinks the trophy count. The reset keeps
   * `SEASON_KEEP_RATIO` of the total — a full wipe would erase months of climbing
   * and a no-op reset would make the season a label with no stakes.
   */
  async function rollSeason(userId, profile) {
    const updates = progression.seasonRollover(profile, leagueMath.getLeagueId);
    if (!updates) return profile;
    if (updates.season_pending_tier) {
      logger.info(`[season] rollover user=${userId} finished=${updates.season_pending_tier} newTrophies=${updates.trophies}`);
    }
    const { data } = await db.updateUser(userId, updates);
    if (!data) logger.warn(`[season] rollover write failed for ${userId}`);
    return data || { ...profile, ...updates };
  }

  const todayStamp = () => new Date().toISOString().slice(0, 10);
  const streakBonusKey = (userId) => `streakbonus:daily:${userId}`;

  /**
   * Pay the win-streak bonus for `streak` consecutive wins, bounded per day.
   *
   * Both settlement paths call this — a finished casual grid (`/api/match`) and a
   * settled ranked match (`/api/league/result`) — because `win_streak` counts
   * wins from both. Paying from only one of them left the menu chip promising
   * coins that a casual win could never collect.
   */
  async function payStreakBonus(userId, streak) {
    const { every, coins, dailyCap } = WIN_STREAK_BONUS;
    const s = Number(streak) || 0;
    if (!userId || s === 0 || s % every !== 0) return { paid: 0, coins: null };
    const paidToday = await streakBonusPaidToday(userId);
    const pay = Math.min(coins, Math.max(0, dailyCap - paidToday));
    if (pay <= 0) return { paid: 0, coins: null };
    const { data } = await db.addCoins(userId, pay, MAX_COINS);
    if (!data) return { paid: 0, coins: null };
    try {
      await redis.set(streakBonusKey(userId), { date: todayStamp(), coins: paidToday + pay }, 172800);
    } catch (e) { /* the bonus is already paid; only the cap bookkeeping is lost */ }
    return { paid: pay, coins: data.coins };
  }

  async function streakBonusPaidToday(userId) {
    try {
      const raw = await redis.get(streakBonusKey(userId));
      if (!raw) return 0;
      const rec = typeof raw === 'string' ? JSON.parse(raw) : raw;
      return rec && rec.date === todayStamp() ? Math.max(0, Number(rec.coins) || 0) : 0;
    } catch (e) {
      return 0;
    }
  }

  /** Normalize economy state stored inside `profile.cosmetics.economy`. */
  function readEconomyState(profile) {
    const today = progression.todayString();
    const rawCosmetics = (profile && profile.cosmetics && typeof profile.cosmetics === 'object') ? profile.cosmetics : {};
    const eco = (rawCosmetics.economy && typeof rawCosmetics.economy === 'object') ? rawCosmetics.economy : {};

    const purchasedPacks = Array.isArray(eco.purchasedPacks) ? eco.purchasedPacks : [];
    const unlockedBooks = Array.from(new Set([...FREE_BOOK_IDS, ...(Array.isArray(eco.unlockedBooks) ? eco.unlockedBooks : [])]));
    const unlockedAvatars = Array.from(new Set([...FREE_AVATAR_IDS, ...(Array.isArray(eco.unlockedAvatars) ? eco.unlockedAvatars : [])]));
    const unlockedSizes = Array.from(new Set([5, 6, ...(Array.isArray(eco.unlockedSizes) ? eco.unlockedSizes.map(Number) : [])]));
    const unlockedCategories = Array.from(new Set(['shahnameh', 'all', 'general', 'food', ...(Array.isArray(eco.unlockedCategories) ? eco.unlockedCategories : [])]));
    const unlockedLegends = Array.from(new Set([...FREE_FOOTBALL_LEGEND_IDS, ...(Array.isArray(eco.unlockedLegends) ? eco.unlockedLegends : [])]));

    const hasEpicPatronPass = !!eco.hasEpicPatronPass || purchasedPacks.includes('epic_patron_pass');
    const currentSeason = progression.seasonId();
    const hasSeasonPass = eco.seasonPassId === currentSeason || purchasedPacks.includes(`season_battle_pass_${currentSeason}`) || !!eco.hasSeasonPass;

    const seasonPassClaimedFree = (eco.seasonPassSeason === currentSeason && Array.isArray(eco.seasonPassClaimedFree))
      ? eco.seasonPassClaimedFree.map(Number)
      : [];
    const seasonPassClaimedGold = (eco.seasonPassSeason === currentSeason && Array.isArray(eco.seasonPassClaimedGold))
      ? eco.seasonPassClaimedGold.map(Number)
      : [];

    const wheelSameDay = eco.wheelLastDate === today;
    const wheelSpinsToday = wheelSameDay ? (Number(eco.wheelSpinsToday) || 0) : 0;
    const wheelFreeUsed = wheelSameDay && !!eco.wheelFreeUsed;
    const wheelAdUsed = wheelSameDay && !!eco.wheelAdUsed;
    const wheelPaidUsed = wheelSameDay && !!eco.wheelPaidUsed;

    const adSameDay = eco.rewardedAdLastDate === today;
    const rewardedAdsToday = adSameDay ? (Number(eco.rewardedAdsToday) || 0) : 0;

    return {
      purchasedPacks,
      unlockedBooks,
      unlockedAvatars,
      unlockedSizes,
      unlockedCategories,
      unlockedLegends,
      hasEpicPatronPass,
      hasSeasonPass,
      seasonPassClaimedFree,
      seasonPassClaimedGold,
      wheelSpinsToday,
      wheelFreeAvailable: !wheelFreeUsed,
      wheelAdAvailable: wheelFreeUsed && !wheelAdUsed,
      wheelPaidAvailable: wheelFreeUsed && wheelAdUsed && !wheelPaidUsed,
      rewardedAdsToday,
      rewardedAdsRemaining: Math.max(0, REWARDED_AD_DAILY_CAP - rewardedAdsToday),
    };
  }

  /** Everything the menu's progression surfaces read. */
  function publicProgress(profile, quests, streakBonusLeft = WIN_STREAK_BONUS.dailyCap) {
    const season = {
      id: progression.seasonId(),
      endsAt: progression.seasonEndsAt().toISOString(),
      daysLeft: progression.seasonDaysLeft(),
      claimed: !!profile.season_reward_claimed,
      pendingTier: profile.season_pending_tier || null,
      pendingCoins: profile.season_pending_tier
        ? (progression.SEASON_REWARDS[profile.season_pending_tier] || 0)
        : 0,
      currentTier: progression.family(profile.league),
      rewardCoins: progression.SEASON_REWARDS[progression.family(profile.league)] || 0,
    };
    const owned = (profile.cosmetics && profile.cosmetics.owned) || {};
    const current = displayStreak(profile);
    return {
      xp: progression.xpInfo(profile.xp),
      streak: {
        current,
        best: Number(profile.daily_streak_best) || 0,
        playedToday: (profile.daily_streak_last || '') === progression.todayString(),
        multiplier: progression.streakMultiplier(current),
        nextReward: progression.dailyRewardFor(Math.max(1, current + 1)),
        shields: (profile.items && profile.items.streakShield) || 0,
        ladder: progression.STREAK_MULT,
      },
      quests: progression.publicQuests(quests),
      season,
      cosmetics: {
        owned: Object.keys(owned).filter(k => owned[k]),
        frame: (profile.cosmetics && profile.cosmetics.frame) || null,
        title: (profile.cosmetics && profile.cosmetics.title) || null,
      },
      claimedSets: profile.claimed_sets || {},
      winStreak: Number(profile.win_streak) || 0,
      streakBonusLeft,
      economy: readEconomyState(profile),
    };
  }

  /**
   * Award XP and quest progress in ONE profile write.
   *
   * Called only from places where a run actually FINISHED server-side (match
   * save, tower cash-out, league settlement, duel completion) — never from the
   * client, so `xp` and quest counters cannot be inflated by a direct caller.
   */
  async function grantProgress(userId, { xp = 0, questTypes = [] } = {}) {
    if (!userId) return null;
    const { data: raw } = await db.getUser(userId);
    if (!raw) return null;
    const profile = await rollSeason(userId, raw);

    const applied = progression.applyXp(profile.xp, xp);
    let quests = progression.ensureQuests(profile, userId);
    if (questTypes.length) quests = progression.addQuestProgress(quests, questTypes);

    // Only progression columns are written here. Trophies/season are persisted by
    // rollSeason itself, and re-writing them from this snapshot could clobber a
    // trophy change that landed between the read and this write.
    const updates = {
      xp: applied.xp,
      level: applied.level,
      daily_quests: quests,
    };
    const { error } = await db.updateUser(userId, updates);
    if (error) {
      logger.warn(`[progress] grant failed for ${userId}: ${error}`);
      return null;
    }

    let chestCoins = 0;
    if (applied.chestCoins > 0) {
      const paid = await db.addCoins(userId, applied.chestCoins, MAX_COINS);
      if (paid.data) chestCoins = applied.chestCoins;
      else logger.warn(`[progress] level chest payout failed for ${userId}: ${paid.error}`);
    }

    return {
      xp: progression.xpInfo(applied.xp),
      level: applied.level,
      levelUp: applied.levelUp,
      chestCoins,
      quests: progression.publicQuests(quests),
    };
  }

  /** Best-effort write used to undo half of a multi-step payout. */
  async function bestEffortUpdate(userId, updates) {
    try { await db.updateUser(userId, updates); } catch (_) { /* ignore */ }
  }

  /** Is every chapter of one collection set owned? */
  async function collectionSetComplete(profile, shelf, setId) {
    if (shelf === 'football') {
      const ids = (COLLECTION_SETS.football || {})[setId];
      if (!ids || ids.length === 0) return false;
      const cards = profile.worldmap_cards || {};
      return ids.every(id => Number(cards[id]) > 0);
    }
    const { data: books } = await db.getStoryBooks();
    const book = (books || []).find(b => b.id === setId && b.genre === shelf);
    if (!book || book.genre === 'education') return false;
    const { data: chapters } = await db.getStoryChapters(setId);
    const total = (chapters || []).length;
    if (total === 0) return false;
    const done = Math.max(0, (Number((profile.epic_progress_map || {})[setId]) || 1) - 1);
    return done >= total;
  }

  // ─── HEALTH ────────────────────────────────────────────
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // ─── AUTH (Login / Register) ───────────────────────────
  app.post('/api/login', async (req, res) => {
    try {
      const { deviceId, username, password, score, high_score, coins, epic_progress_map, epic_stars, card_progress, worldmap_cards } = req.body;
      if (!deviceId) return res.status(400).json({ error: 'deviceId required' });
      if (typeof deviceId !== 'string' || deviceId.length > 128) {
        return res.status(400).json({ error: 'deviceId نامعتبر است' });
      }

      let { data: profile } = await db.getUser(deviceId);
      if (!profile) {
        // Store password hash for future validation if provided
        const passwordHash = password ? hashPassword(password) : null;
        const friendCode = generateFriendCode();
        const newProfile = {
          id: deviceId,
          username: username ? sanitize(username) : `کاربر ${deviceId.slice(-4)}`,
          password_hash: passwordHash,
          avatar_text: '👤',
          friend_code: friendCode,
          coins: clampInitialCoins(coins),
          score: score ?? 0,
          level: 1,
          // Seeded from the guest's best score so a first-time registration does
          // not lose it (the client no longer merges guest stats after login).
          // Consumed ONLY when the profile is being CREATED — the existing-user
          // branch below never touches score/high_score/coins.
          high_score: high_score ?? 0,
          epic_progress_map: epic_progress_map || {},
          epic_stars: epic_stars || {},
          card_progress: card_progress || {},
          worldmap_cards: worldmap_cards || {},
          tower_tickets: 1,
          last_ticket_refill: new Date().toISOString(),
          daily_tower_coins: 0,
          tower_high_floor: 0,
        };
        const { data: created, error: createErr } = await db.createUser(newProfile);
        if (!created) {
          // A token for a profile that does not exist would authenticate every
          // later call into a 404 — fail loudly instead.
          logger.error({ err: createErr }, '[login] profile creation failed');
          return res.status(500).json({ error: 'ساخت حساب کاربری ممکن نشد' });
        }
        const token = createSession(deviceId);
        // Don't return sensitive fields
        const { password_hash, phone, ...safe } = created;
        return res.json({ token, player: safe });
      }

      // Existing user: validate password if one was set
      if (profile.password_hash) {
        if (!password) {
          return res.status(401).json({ error: 'رمز عبور required' });
        }
        if (!verifyPassword(password, profile.password_hash)) {
          return res.status(401).json({ error: 'رمز عبور اشتباه است' });
        }
        // Transparently upgrade legacy unsalted SHA-256 hashes to scrypt.
        if (isLegacyHash(profile.password_hash)) {
          try {
            await db.updateUser(deviceId, { password_hash: hashPassword(password) });
          } catch (e) {
            logger.warn('[login] password hash upgrade failed:', e?.message);
          }
        }
      } else if (password) {
        // First-time login sets the password
        try {
          await db.updateUser(deviceId, { password_hash: hashPassword(password) });
        } catch (e) {
          logger.warn('[login] password set failed:', e?.message);
        }
      }

      const token = createSession(deviceId);

      // Update username if provided on login (existing user may have changed name)
      const loginUpdates = {};
      if (username && sanitize(username) !== profile.username) {
        loginUpdates.username = sanitize(username);
      }
      if (Object.keys(loginUpdates).length > 0) {
        const updResult = await db.updateUser(deviceId, loginUpdates);
        if (!updResult.error) Object.assign(profile, loginUpdates);
      }

      const { phone, password_hash, ...safe } = profile;

      // Generate friend_code for existing users who don't have one
      if (!safe.friend_code) {
        const newCode = generateFriendCode();
        const updateResult = await db.updateUser(deviceId, { friend_code: newCode });
        if (updateResult.error) {
          logger.error('[login] failed to set friend_code:', updateResult.error);
        } else {
          safe.friend_code = newCode;
        }
      }

      res.json({ token, player: safe });
    } catch (e) {
      logger.error('[login]', e);
      res.status(500).json({ error: 'خطای داخلی سرور' });
    }
  });

  // ─── CURRENT USER (token-based) ───────────────────────
  // Lets a client that holds a valid session token fetch its own profile
  // without re-sending a password (used when deviceId-only login is refused
  // because the account has a password set).
  app.get('/api/me', async (req, res) => {
    try {
      const deviceId = req.userId;
      if (!deviceId) return res.status(401).json({ error: 'احراز هویت نشده' });
      const { data: profile } = await db.getUser(deviceId);
      if (!profile) return res.status(404).json({ error: 'پروفایل یافت نشد' });
      const { phone, password_hash, ...safe } = profile;
      res.json(safe);
    } catch (e) {
      logger.error('[me]', e);
      res.status(500).json({ error: 'خطای داخلی سرور' });
    }
  });

  // ─── PROFILE UPDATE ───────────────────────────────────
  app.put('/api/profile', async (req, res) => {
    try {
      const { username, avatar_text, epic_progress_map, epic_stars, card_progress, worldmap_cards } = req.body;
      const deviceId = req.userId;
      if (!deviceId) return res.status(401).json({ error: 'احراز هویت نشده' });
      const updates = { updated_at: new Date().toISOString() };
      if (username !== undefined) updates.username = sanitize(username);
      if (avatar_text !== undefined) updates.avatar_text = sanitize(avatar_text);
      if (epic_progress_map !== undefined) updates.epic_progress_map = epic_progress_map;
      if (epic_stars !== undefined) updates.epic_stars = epic_stars;
      if (card_progress !== undefined) updates.card_progress = card_progress;
      // Collectible world-map cards — `{ [chapterId]: rarity 1..4 }`. The client
      // only ever raises a rarity, and the merge below keeps it monotonic so a
      // stale tab cannot downgrade a card another tab already earned.
      if (worldmap_cards !== undefined) {
        const { data: currentProfile } = await db.getUser(deviceId);
        const current = (currentProfile && currentProfile.worldmap_cards) || {};
        updates.worldmap_cards = mergeWorldMapCards(current, worldmap_cards);
      }
      // Note: trophies, league, items, coins and tower_tickets are SERVER-SIDE
      // only — the client cannot set them here.

      const { data: result } = await db.updateUser(deviceId, updates);
      const { phone, password_hash, ...safe } = result;
      res.json(safe);
    } catch (e) {
      logger.error('[profile]', e);
      res.status(500).json({ error: 'خطای داخلی سرور' });
    }
  });

  // ─── MATCH ────────────────────────────────────────────
  app.post('/api/match', async (req, res) => {
    try {
      const deviceId = req.userId;
      const { score, time_taken, grid_size, category, skip_trophies, is_daily } = req.body;

      // A genuine submission cannot arrive faster than MIN_TIME seconds, so a
      // burst means a loop, not a player. Throttle per ACCOUNT (the global
      // limiter is per IP+path and a client can walk around it).
      if (!(await userThrottle(deviceId, 'match', 12, 60_000))) {
        return res.status(429).json({ error: 'درخواست بیش از حد. لطفاً کمی صبر کنید.' });
      }

      // Server-side validation
      const parsedScore = parseInt(score) || 0;
      const parsedTime = parseInt(time_taken) || 0;
      const parsedSize = parseInt(grid_size) || 5;

      if (parsedScore < 0 || parsedScore > MAX_SCORE) {
        return res.status(400).json({ error: `امتیاز باید بین ۰ و ${MAX_SCORE} باشد` });
      }
      if (parsedTime < MIN_TIME || parsedTime > MAX_TIME) {
        return res.status(400).json({ error: `زمان باید بین ${MIN_TIME} ثانیه و ${MAX_TIME} ثانیه باشد` });
      }
      if (parsedSize < 5 || parsedSize > 15) {
        return res.status(400).json({ error: 'اندازه جدول نامعتبر است' });
      }

      // NOTE: a client-supplied `coins` field is deliberately IGNORED here. It used
      // to be up-synced on every match save, which let any client mint an arbitrary
      // balance. Coins now only move through server-owned endpoints:
      // /coins/spend, /arena/create, /arena/join, /arena/result, /league/result.

      const safeCategory = sanitize(category || 'general');
      const { data } = await db.saveMatch({
        user_id: deviceId, score: parsedScore, time_taken: parsedTime,
        grid_size: parsedSize, category: safeCategory,
        date_played: new Date().toISOString(),
      });

      // The daily puzzle is meant to be played once a day. That lock used to live
      // ONLY in the client's localStorage (`player.lastDailyDate`), and
      // `getPlayerState` never carried it across a reload — so the card unlocked
      // again on every refresh. Persist the play date on the profile so the lock
      // survives a reload, a re-login, and a cleared browser.
      //
      // The client must SAY it was the daily (`is_daily`): size+category cannot
      // identify it, because `all` @ 10x10 is also an ordinary «میکس» (Mixed)
      // game — inferring it from those fields locked the daily for the rest of
      // the day after any 10x10 mix game.
      //
      // Date basis: `en-CA` yields YYYY-MM-DD and matches the client's
      // `getTodayString()`. A client/server timezone skew can release the lock a
      // few hours early or late; that is acceptable, but the PRIZE is guarded
      // separately and atomically below so the skew can never double-pay.
      let dailyReward = 0;
      let coinsAfterDaily = null;
      let streakAfter = null;
      if (deviceId && is_daily === true) {
        const today = new Date().toLocaleDateString('en-CA');

        // `last_daily_date` is now written when the run STARTS (POST
        // /api/daily/start), so a completed daily always arrives here with
        // today's date already on the profile — it can no longer answer "was the
        // prize paid?". That question needs its own marker, otherwise starting
        // the daily would permanently suppress its own prize.
        let alreadyRewardedToday = false;
        let prof = null;
        try {
          const res = await db.getUser(deviceId);
          prof = res.data;
          alreadyRewardedToday = !!prof && prof.last_daily_reward_date === today;
        } catch (e) {
          logger.warn('[match] daily profile read failed:', e.message);
        }

        // Redundant when the start-claim already wrote it. Kept for a daily begun
        // before this marker existed, or by a client that never called
        // /api/daily/start.
        try {
          await db.updateUser(deviceId, { last_daily_date: today });
        } catch (e) {
          logger.warn('[match] last_daily_date update failed:', e.message);
        }

        // Pay the prize the menu card advertises. The claim is atomic per
        // (player, day) in Redis, so a double-submit or a replayed request cannot
        // double-pay; `last_daily_reward_date` is the durable fallback guard for
        // when Redis is unavailable.
        if (!alreadyRewardedToday) {
          let claimed = true;
          try {
            const won = await redis.setIfNotExists(`daily:claim:${deviceId}:${today}`, '1', 60 * 60 * 48);
            claimed = won !== false;
          } catch (e) {
            logger.warn('[match] daily claim guard failed, using the reward date:', e.message);
          }
          if (claimed) {
            // Streak is worked out from the stored dates (a gap > 1 day resets it,
            // unless a streak shield absorbs the miss), and the prize is that
            // streak's multiplier. Both are written here so the ladder the card
            // shows is the ladder that actually paid.
            const plan = progression.planDaily(prof || {});
            if (plan.shieldUsed) {
              try {
                await db.addItem(deviceId, 'streakShield', -1);
              } catch (e) {
                logger.warn('[match] streak shield consume failed:', e.message);
              }
            }
            try {
              await db.updateUser(deviceId, {
                last_daily_reward_date: today,
                daily_streak: plan.streak,
                daily_streak_best: plan.best,
                daily_streak_last: today,
              });
            } catch (e) {
              logger.warn('[match] streak update failed:', e.message);
            }
            try {
              const { data: paid } = await db.addCoins(deviceId, plan.reward, MAX_COINS);
              if (paid) {
                dailyReward = plan.reward;
                coinsAfterDaily = paid.coins;
                streakAfter = {
                  current: plan.streak, best: plan.best,
                  multiplier: plan.multiplier, shieldUsed: plan.shieldUsed,
                };
              }
            } catch (e) {
              logger.warn('[match] daily reward failed:', e.message);
            }
          }
        }
      }

      // Casual/single-player trophies — the server computes and persists the
      // award (mirrors gameServer.saveMatch). Multiplayer passes
      // skip_trophies=true because /league/result settles it from the
      // `game_over` record instead; awarding both would double-count.
      //
      // The score behind this award is client-reported and the game's scoring
      // formula is unbounded (the combo multiplier has no cap), so no numeric
      // plausibility envelope exists. The only sound bound is a per-day total:
      // track the day in Redis and clamp the award to today's remaining allowance.
      let league = null;
      let trophyAwarded = 0;
      if (deviceId && !skip_trophies && parsedScore > 0) {
        const gain = leagueMath.calcCasualTrophyGain(parsedScore, parsedSize);
        const today = new Date().toISOString().slice(0, 10);
        const dayKey = `trophy:daily:${deviceId}`;
        let todayTotal = 0;
        try {
          const raw = await redis.get(dayKey);
          if (raw) {
            const rec = JSON.parse(raw);
            if (rec && rec.date === today) todayTotal = Math.max(0, Number(rec.coins) || 0);
          }
        } catch (_) { /* fail open to a 0 baseline */ }

        const credit = Math.min(gain, Math.max(0, DAILY_TROPHY_CAP - todayTotal));
        // The win is recorded even when the trophy allowance is spent: `win_streak`
        // and `total_wins` describe matches, not the capped trophy award.
        const applied = await db.applyLeagueResult(deviceId, credit, true);
        if (applied.error || !applied.data) {
          logger.warn(`[match] trophy award failed for ${deviceId}: ${applied.error}`);
        } else {
          league = applied.data;
          trophyAwarded = credit;
          if (credit > 0) {
            try { await redis.set(dayKey, { date: today, coins: todayTotal + credit }, 172800); } catch (_) {}
          } else {
            logger.info(`[match] daily trophy cap reached for ${deviceId} (${todayTotal}/${DAILY_TROPHY_CAP})`);
          }
        }
      }

      // Win-streak bonus. A finished casual grid is a win, so the counter this
      // path increments is also the counter that pays here.
      let streakBonus = 0;
      let streakBonusCoins = null;
      if (league) {
        try {
          const res2 = await payStreakBonus(deviceId, league.winStreak);
          streakBonus = res2.paid;
          streakBonusCoins = res2.coins;
        } catch (e) {
          logger.warn('[match] streak bonus failed:', e.message);
        }
      }

      // XP + the quests this run satisfies. A finished grid is the only place
      // these advance, and every counter comes from what the server just wrote.
      let progress = null;
      try {
        const questTypes = ['solo3'];
        if (is_daily === true) questTypes.push('daily');
        if (parsedSize >= 7) questTypes.push('grid7');
        progress = await grantProgress(deviceId, {
          xp: progression.XP.match({ score: parsedScore, size: parsedSize, isDaily: is_daily === true }),
          questTypes,
        });
      } catch (e) {
        logger.warn('[match] progress grant failed:', e.message);
      }

      res.json({
        ...(data || { success: true }),
        ...(league ? { league } : {}),
        trophyAwarded,
        // Present only when this submission actually paid the daily prize, so the
        // client can show the new balance without waiting for a reload.
        ...(dailyReward > 0 ? { dailyReward, coins: coinsAfterDaily } : {}),
        ...(streakBonus > 0 ? { streakBonus, coins: streakBonusCoins } : {}),
        ...(streakAfter ? { streak: streakAfter } : {}),
        ...(progress ? { progress } : {}),
      });
    } catch (e) {
      logger.error('[match]', e);
      res.status(500).json({ error: 'خطای داخلی سرور' });
    }
  });

  /**
   * POST /api/daily/start
   * Consumes today's daily puzzle for the calling account and reports whether it
   * had already been used.
   *
   * The lock has to be taken when the run STARTS. It used to be written only from
   * POST /api/match (the completion path), so starting the daily, quitting, and
   * starting again was an unlimited retry loop — while the card advertised
   * «فقط یک تلاش».
   *
   * `last_daily_date` means "the date this account used its daily". The prize has
   * its own marker (`last_daily_reward_date`) so that taking the lock does not
   * suppress the reward for finishing the run.
   *
   * Redis is the atomic guard (two concurrent starts cannot both win); the profile
   * date is the durable marker the client's card reads after a reload.
   */
  app.post('/api/daily/start', async (req, res) => {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ error: 'احراز هویت نشده' });

      const today = new Date().toLocaleDateString('en-CA');

      let prof = null;
      try {
        const { data } = await db.getUser(userId);
        prof = data;
      } catch (e) {
        logger.warn('[daily/start] profile read failed:', e.message);
      }

      if (prof && prof.last_daily_date === today) {
        return res.json({ alreadyPlayed: true, lastDailyDate: today });
      }

      let claimed = true;
      try {
        const won = await redis.setIfNotExists(`daily:play:${userId}:${today}`, '1', 60 * 60 * 48);
        claimed = won !== false;
      } catch (e) {
        logger.warn('[daily/start] redis guard failed, using the profile date:', e.message);
      }

      // Written on both branches: the profile must agree with Redis so the card
      // still locks after a reload when another instance took the key first.
      try {
        await db.updateUser(userId, { last_daily_date: today });
      } catch (e) {
        logger.warn('[daily/start] last_daily_date update failed:', e.message);
      }

      res.json({ alreadyPlayed: !claimed, lastDailyDate: today });
    } catch (e) {
      logger.error('[daily/start]', e);
      res.status(500).json({ error: 'خطای داخلی سرور' });
    }
  });

  // ─── PROGRESS / QUESTS / SEASON / COSMETICS ────────────

  /**
   * GET /api/progress
   * Everything the menu's progression surfaces read, in one round trip. Rolls the
   * season and today's quest set forward as a side effect, so the client never
   * has to decide what a new day means.
   */
  app.get('/api/progress', async (req, res) => {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ error: 'احراز هویت نشده' });
      const { data: raw } = await db.getUser(userId);
      if (!raw) return res.status(404).json({ error: 'پروفایل یافت نشد' });

      const profile = await rollSeason(userId, raw);
      let quests = progression.ensureQuests(profile, userId);
      if (!profile.daily_quests || profile.daily_quests.date !== quests.date) {
        const { data: written } = await db.updateUser(userId, { daily_quests: quests });
        if (written) Object.assign(profile, { daily_quests: written.daily_quests });
      }
      res.json(publicProgress(profile, quests, Math.max(0, WIN_STREAK_BONUS.dailyCap - await streakBonusPaidToday(userId))));
    } catch (e) {
      logger.error('[progress]', e);
      res.status(500).json({ error: 'خطای داخلی سرور' });
    }
  });

  /**
   * POST /api/quests/claim { id }
   * Pays one finished quest. Progress and completion are server-side facts, so
   * the client can only name WHICH quest, never that it is done.
   */
  app.post('/api/quests/claim', async (req, res) => {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ error: 'احراز هویت نشده' });
      const id = String((req.body && req.body.id) || '');
      const def = progression.QUESTS_BY_ID[id];
      if (!def) return res.status(400).json({ error: 'مأموریت نامعتبر است' });

      const { data: raw } = await db.getUser(userId);
      if (!raw) return res.status(404).json({ error: 'پروفایل یافت نشد' });
      const state = progression.ensureQuests(raw, userId);
      const item = (state.items || []).find(i => i.id === id);
      if (!item) return res.status(404).json({ error: 'این مأموریت امروز نیست' });
      if (item.claimed) return res.status(409).json({ error: 'جایزه این مأموریت را گرفته‌اید' });
      if ((Number(item.progress) || 0) < def.target) {
        return res.status(409).json({ error: 'این مأموریت هنوز کامل نشده است' });
      }

      const items = state.items.map(i => i.id === id ? { ...i, claimed: true } : i);
      const next = { ...state, items };
      const { data: written, error } = await db.updateUser(userId, { daily_quests: next });
      if (error || !written) return res.status(500).json({ error: 'خطای داخلی سرور' });

      const { data: paid, error: payErr } = await db.addCoins(userId, def.reward, MAX_COINS);
      if (payErr || !paid) {
        // Do not leave the quest marked as paid when the coins never landed.
        await bestEffortUpdate(userId, { daily_quests: state });
        return res.status(500).json({ error: 'خطای داخلی سرور' });
      }

      logger.info(`[quests/claim] user=${userId} quest=${id} +${def.reward} → ${paid.coins}`);
      res.json({
        success: true,
        reward: def.reward,
        coins: paid.coins,
        quests: progression.publicQuests(next),
      });
    } catch (e) {
      logger.error('[quests/claim]', e);
      res.status(500).json({ error: 'خطای داخلی سرور' });
    }
  });

  /**
   * POST /api/quests/reroll
   * One free reroll per day for players who dislike the hand they were dealt.
   * The replacement set is deterministic per (user, day, rerolled) so two
   * concurrent calls cannot produce two different sets.
   */
  app.post('/api/quests/reroll', async (req, res) => {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ error: 'احراز هویت نشده' });
      const { data: profile } = await db.getUser(userId);
      if (!profile) return res.status(404).json({ error: 'پروفایل یافت نشد' });

      const today = progression.todayString();
      const state = progression.ensureQuests(profile, userId);
      if (state.date === today && state.rerolled) {
        return res.status(409).json({ error: 'امروز یک‌بار مأموریت‌ها را عوض کرده‌اید' });
      }

      const next = progression.newQuestDay(userId, today, true);
      const { data: written, error } = await db.updateUser(userId, { daily_quests: next });
      if (error || !written) return res.status(500).json({ error: 'خطای داخلی سرور' });
      res.json({ success: true, quests: progression.publicQuests(next) });
    } catch (e) {
      logger.error('[quests/reroll]', e);
      res.status(500).json({ error: 'خطای داخلی سرور' });
    }
  });

  /**
   * POST /api/season/claim
   * Pays the season-end reward for the tier the player finished in. The tier is
   * written once by `rollSeason`, so the reward can only ever be collected once.
   */
  app.post('/api/season/claim', async (req, res) => {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ error: 'احراز هویت نشده' });
      const { data: raw } = await db.getUser(userId);
      if (!raw) return res.status(404).json({ error: 'پروفایل یافت نشد' });
      const profile = await rollSeason(userId, raw);

      if (!profile.season_pending_tier) {
        return res.status(409).json({ error: 'جایزه‌ای برای فصل گذشته ندارید' });
      }
      if (profile.season_reward_claimed) {
        return res.status(409).json({ error: 'جایزه این فصل را گرفته‌اید' });
      }
      const reward = progression.SEASON_REWARDS[profile.season_pending_tier] || 0;
      if (reward <= 0) return res.status(409).json({ error: 'جایزه‌ای تعریف نشده است' });

      const { error } = await db.updateUser(userId, { season_reward_claimed: true });
      if (error) return res.status(500).json({ error: 'خطای داخلی سرور' });
      const { data: paid, error: payErr } = await db.addCoins(userId, reward, MAX_COINS);
      if (payErr || !paid) {
        await bestEffortUpdate(userId, { season_reward_claimed: false });
        return res.status(500).json({ error: 'خطای داخلی سرور' });
      }

      logger.info(`[season/claim] user=${userId} tier=${profile.season_pending_tier} +${reward} → ${paid.coins}`);
      res.json({ success: true, reward, coins: paid.coins, tier: profile.season_pending_tier });
    } catch (e) {
      logger.error('[season/claim]', e);
      res.status(500).json({ error: 'خطای داخلی سرور' });
    }
  });

  /**
   * POST /api/cosmetics/purchase { id }
   * This is the post-catalogue coin sink: the consumable shop caps out after a
   * few days, and frames/titles keep coins meaningful after that.
   */
  app.post('/api/cosmetics/purchase', async (req, res) => {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ error: 'احراز هویت نشده' });
      const id = String((req.body && req.body.id) || '');
      const def = progression.COSMETICS_BY_ID[id];
      if (!def) return res.status(400).json({ error: 'آیتم نامعتبر است' });
      if (def.grantOnly) return res.status(403).json({ error: 'این قاب با تکمیل کالکشن باز می‌شود' });
      if (!def.price) return res.status(400).json({ error: 'قیمت نامعتبر است' });

      const { data: profile } = await db.getUser(userId);
      if (!profile) return res.status(404).json({ error: 'پروفایل یافت نشد' });
      const cosmetics = (profile.cosmetics && typeof profile.cosmetics === 'object') ? profile.cosmetics : {};
      const owned = (cosmetics.owned && typeof cosmetics.owned === 'object') ? { ...cosmetics.owned } : {};
      if (owned[id]) return res.status(409).json({ error: 'این آیتم را دارید' });

      const { data: paid, error } = await db.addCoins(userId, -def.price, MAX_COINS);
      if (error === 'insufficient_coins') return res.status(400).json({ error: 'سکه کافی نیست', insufficient: true });
      if (error || !paid) return res.status(500).json({ error: 'خطای داخلی سرور' });

      owned[id] = true;
      const { data: written, error: writeErr } = await db.updateUser(userId, {
        cosmetics: { ...cosmetics, owned },
      });
      if (writeErr || !written) {
        try { await db.addCoins(userId, def.price, MAX_COINS); } catch (_) { /* best effort */ }
        return res.status(500).json({ error: 'خطای داخلی سرور' });
      }

      logger.info(`[cosmetics/purchase] user=${userId} item=${id} -${def.price} → ${paid.coins}`);
      res.json({ success: true, coins: paid.coins, owned: Object.keys(owned), spent: def.price });
    } catch (e) {
      logger.error('[cosmetics/purchase]', e);
      res.status(500).json({ error: 'خطای داخلی سرور' });
    }
  });

  /**
   * POST /api/cosmetics/equip { id }
   * `id` may be `null`/`''` to clear the slot. Only an OWNED cosmetic can be
   * shown on the profile; the check is what stops a client from wearing a frame
   * it never bought.
   */
  app.post('/api/cosmetics/equip', async (req, res) => {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ error: 'احراز هویت نشده' });
      const raw = req.body && req.body.id;
      const id = raw ? String(raw) : '';

      const { data: profile } = await db.getUser(userId);
      if (!profile) return res.status(404).json({ error: 'پروفایل یافت نشد' });
      const cosmetics = (profile.cosmetics && typeof profile.cosmetics === 'object') ? profile.cosmetics : {};
      const owned = (cosmetics.owned && typeof cosmetics.owned === 'object') ? cosmetics.owned : {};

      let next;
      if (!id) {
        // Cleared without saying which slot — infer from the current values.
        next = { ...cosmetics, frame: null, title: null };
      } else {
        const def = progression.COSMETICS_BY_ID[id];
        if (!def) return res.status(400).json({ error: 'آیتم نامعتبر است' });
        if (!owned[id]) return res.status(403).json({ error: 'این آیتم را ندارید' });
        next = def.kind === 'frame'
          ? { ...cosmetics, frame: id }
          : { ...cosmetics, title: id };
      }

      const { data: written, error } = await db.updateUser(userId, { cosmetics: next });
      if (error || !written) return res.status(500).json({ error: 'خطای داخلی سرور' });
      res.json({
        success: true,
        cosmetics: { frame: next.frame || null, title: next.title || null, owned: Object.keys(owned) },
      });
    } catch (e) {
      logger.error('[cosmetics/equip]', e);
      res.status(500).json({ error: 'خطای داخلی سرور' });
    }
  });

  /**
   * POST /api/collection/claim { shelf, setId }
   * One-time coins for finishing a book/legend set, plus the shelf frame once
   * every set on that shelf has been claimed.
   *
   * Completion is verified here from `story_chapters` / `collection-sets.json`
   * and the stored progress — not from the client's claim that it is done.
   */
  app.post('/api/collection/claim', async (req, res) => {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ error: 'احراز هویت نشده' });
      const shelf = String((req.body && req.body.shelf) || '');
      const setId = String((req.body && req.body.setId) || '');
      if (!progression.SHELF_FRAMES[shelf]) return res.status(400).json({ error: 'قفسه نامعتبر است' });
      if (!setId) return res.status(400).json({ error: 'شناسه مجموعه لازم است' });

      const { data: profile } = await db.getUser(userId);
      if (!profile) return res.status(404).json({ error: 'پروفایل یافت نشد' });

      const key = `${shelf}:${setId}`;
      const claimed = (profile.claimed_sets && typeof profile.claimed_sets === 'object') ? profile.claimed_sets : {};
      if (claimed[key]) return res.status(409).json({ error: 'جایزه این مجموعه را گرفته‌اید' });

      const complete = await collectionSetComplete(profile, shelf, setId);
      if (!complete) return res.status(409).json({ error: 'این مجموعه هنوز کامل نشده است' });

      const nextClaimed = { ...claimed, [key]: true };

      // Shelf frame: unlocked once every set on the shelf is claimed. The list of
      // sets comes from the same server data that validated this claim.
      let frameGranted = null;
      const cosmetics = (profile.cosmetics && typeof profile.cosmetics === 'object') ? profile.cosmetics : {};
      const owned = (cosmetics.owned && typeof cosmetics.owned === 'object') ? { ...cosmetics.owned } : {};
      const allSetIds = shelf === 'football'
        ? Object.keys(COLLECTION_SETS.football || {})
        : ((await db.getStoryBooks()).data || []).filter(b => b.genre === shelf && b.genre !== 'education').map(b => b.id);
      if (allSetIds.length > 0 && allSetIds.every(id => nextClaimed[`${shelf}:${id}`])) {
        const frame = progression.SHELF_FRAMES[shelf];
        if (frame && !owned[frame]) {
          owned[frame] = true;
          frameGranted = frame;
        }
      }

      const { error } = await db.updateUser(userId, {
        claimed_sets: nextClaimed,
        ...(frameGranted ? { cosmetics: { ...cosmetics, owned } } : {}),
      });
      if (error) return res.status(500).json({ error: 'خطای داخلی سرور' });

      const { data: paid, error: payErr } = await db.addCoins(userId, progression.SET_REWARD_COINS, MAX_COINS);
      if (payErr || !paid) {
        await bestEffortUpdate(userId, { claimed_sets: claimed });
        return res.status(500).json({ error: 'خطای داخلی سرور' });
      }

      logger.info(`[collection/claim] user=${userId} set=${key} +${progression.SET_REWARD_COINS}${frameGranted ? ` frame=${frameGranted}` : ''}`);
      res.json({
        success: true,
        reward: progression.SET_REWARD_COINS,
        coins: paid.coins,
        frameGranted,
        claimedSets: nextClaimed,
      });
    } catch (e) {
      logger.error('[collection/claim]', e);
      res.status(500).json({ error: 'خطای داخلی سرور' });
    }
  });

  /**
   * POST /api/events { events: [{ type, payload }] }
   * Retention telemetry. Anonymous events are welcome (a guest that never logs
   * in is exactly the drop-off worth measuring), so this endpoint does not
   * require a token — that is also why nothing here feeds gameplay.
   */
  app.post('/api/events', async (req, res) => {
    try {
      const rows = (req.body && req.body.events) || [];
      if (!Array.isArray(rows)) return res.status(400).json({ error: 'events must be an array' });
      const { error } = await db.insertEvents(req.userId || '', rows);
      if (error) return res.status(500).json({ error: 'خطای داخلی سرور' });
      res.json({ success: true, stored: Math.min(rows.length, 20) });
    } catch (e) {
      logger.error('[events]', e);
      res.status(500).json({ error: 'خطای داخلی سرور' });
    }
  });

  // ─── LEADERBOARD ──────────────────────────────────────
  app.get('/api/leaderboard', async (req, res) => {
    try {
      const { data } = await db.getLeaderboard(20);
      res.json(data || []);
    } catch (e) {
      logger.error('[leaderboard]', e);
      res.status(500).json({ error: 'خطای داخلی سرور' });
    }
  });

  // ─── FRIENDS ──────────────────────────────────────────
  app.get('/api/friends', async (req, res) => {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ error: 'احراز هویت نشده' });

      const { data: friendships } = await db.getFriends(userId);
      const seen = new Set();
      const friends = friendships
        .filter(f => f.status === 'accepted')
        .map(f => ({
          id: f.id,
          friendId: f.friend_id === userId ? f.user_id : f.friend_id,
          name: f.username || 'ناشناس',
          avatar: f.avatar_text || '👤',
          status: f.status,
        }))
        .filter(f => {
          if (seen.has(f.friendId)) return false;
          seen.add(f.friendId);
          return true;
        });

      res.json(friends);
    } catch (e) {
      logger.error('[friends]', e);
      res.status(500).json({ error: 'خطای داخلی سرور' });
    }
  });

  app.post('/api/friends/request', async (req, res) => {
    try {
      const myId = req.userId;
      if (!myId) return res.status(401).json({ error: 'احراز هویت نشده' });
      const { friend_code } = req.body;
      if (!friend_code) return res.status(400).json({ error: 'friend_code required' });

      const { data: target } = await db.findUserByFriendCode(friend_code.toUpperCase());
      if (!target) return res.status(404).json({ error: 'کد دوست پیدا نشد' });
      if (target.id === myId) return res.status(400).json({ error: 'نمی‌توانید خودتان را اضافه کنید' });

      const { data: friendships } = await db.getFriends(myId);
      const existing = friendships.find(f =>
        (f.user_id === myId && f.friend_id === target.id) ||
        (f.user_id === target.id && f.friend_id === myId)
      );
      if (existing) {
        return res.status(400).json({
          error: existing.status === 'accepted' ? 'شما قبلاً دوست هستید' : 'درخواست قبلاً ارسال شده'
        });
      }

      const { error } = await db.sendFriendRequest(myId, target.id);
      if (error) return res.status(400).json({ error });

      const notifResult = await db.createNotification({
        user_id: target.id, sender_id: myId, type: 'friend_req', payload: {},
      });

      // Push WS notification to target
      if (notifResult.data) {
        const sender = await db.getUser(myId).catch(() => null);
        const notifMsg = {
          type: 'notification:new',
          notification: {
            id: notifResult.data.id,
            senderId: myId,
            senderName: sender?.data?.username || 'ناشناس',
            senderAvatar: sender?.data?.avatar_text || '👤',
            type: 'friend_req',
            payload: {},
            createdAt: notifResult.data.created_at,
          }
        };
        if (!pendingNotifications.has(target.id)) {
          pendingNotifications.set(target.id, []);
        }
        const pending = pendingNotifications.get(target.id);
        pending.push(notifMsg.notification);
        if (pending.length > 20) pending.splice(0, pending.length - 20);
        // Retry sendToUser up to 5 times with 1s delay — target may be reconnecting
        for (let attempt = 1; attempt <= 5; attempt++) {
          const delivered = sendToUser(target.id, notifMsg);
          if (delivered) break;
          if (attempt < 5) await new Promise(r => setTimeout(r, 1000));
        }
      }

      res.json({ success: true });
    } catch (e) {
      logger.error('[friends/request]', e);
      res.status(500).json({ error: 'خطای داخلی سرور' });
    }
  });

  app.post('/api/friends/accept', async (req, res) => {
    try {
      const sender_id = req.body.sender_id || req.body.senderId;
      const notification_id = req.body.notification_id || req.body.notificationId;
      const receiver_id = req.userId;
      if (!receiver_id) return res.status(401).json({ error: 'احراز هویت نشده' });

      const { error } = await db.acceptFriendRequest(sender_id, receiver_id);
      if (error) {
        // Even if accept fails (e.g. already friends), still delete the notification
        if (notification_id) {
          await db.deleteNotification(notification_id);
          for (const [uid, notifs] of pendingNotifications) {
            const idx = notifs.findIndex(n => n.id === notification_id || String(n.id) === notification_id);
            if (idx !== -1) { notifs.splice(idx, 1); if (notifs.length === 0) pendingNotifications.delete(uid); break; }
          }
        }
        // Check if they're already friends — if so, treat as success (notification cleaned up)
        const existing = await db.getFriends(receiver_id);
        const alreadyFriends = existing.data?.some((f) =>
          f.status === 'accepted' && (f.user_id === sender_id || f.friend_id === sender_id)
        );
        if (alreadyFriends) {
          // Already accepted — notification deleted, return success
          return res.json({ success: true, alreadyFriends: true });
        }
        return res.status(400).json({ error });
      }

      if (notification_id) {
        await db.deleteNotification(notification_id);
        // Also clean from pendingNotifications in-memory cache
        for (const [uid, notifs] of pendingNotifications) {
          const idx = notifs.findIndex(n => n.id === notification_id || String(n.id) === notification_id);
          if (idx !== -1) { notifs.splice(idx, 1); if (notifs.length === 0) pendingNotifications.delete(uid); break; }
        }
      }

      // Notify the original sender that the request was accepted
      if (sender_id) {
        const receiver = await db.getUser(receiver_id).catch(() => null);
        sendToUser(sender_id, {
          type: 'friend:accepted',
          acceptedBy: {
            id: receiver_id,
            name: receiver?.data?.username || 'ناشناس',
            avatar: receiver?.data?.avatar_text || '👤',
          }
        });
      }

      res.json({ success: true });
    } catch (e) {
      logger.error('[friends/accept]', e);
      res.status(500).json({ error: 'خطای داخلی سرور' });
    }
  });

  app.delete('/api/friends/:id', async (req, res) => {
    try {
      const deleterId = req.userId;
      if (!deleterId) return res.status(401).json({ error: 'احراز هویت نشده' });

      // Look up friendship before deleting to verify ownership
      const friendship = await db.queryRaw('SELECT * FROM friendships WHERE id = $1', [req.params.id]);
      const friendRow = friendship.data?.[0];
      if (!friendRow) return res.status(404).json({ error: 'رابطه دوستی پیدا نشد' });
      // Only the two users involved can delete this friendship
      if (friendRow.user_id !== deleterId && friendRow.friend_id !== deleterId) {
        return res.status(403).json({ error: 'شما اجازه حذف این رابطه را ندارید' });
      }

      await db.removeFriendship(req.params.id);

      // Notify the other user that they were removed
      const otherUserId = friendRow.user_id === deleterId ? friendRow.friend_id : friendRow.user_id;
      const remover = await db.getUser(deleterId).catch(() => null);
      sendToUser(otherUserId, {
        type: 'friend:removed',
        byUserId: deleterId,
        byName: remover?.data?.username || 'ناشناس',
      });

      res.json({ success: true });
    } catch (e) {
      logger.error('[friends/delete]', e);
      res.status(500).json({ error: 'خطای داخلی سرور' });
    }
  });

  // ─── MESSAGES ─────────────────────────────────────────
  // NOTE: `/unread` must be registered BEFORE `/:friendId`, otherwise Express
  // would match it as a friendId named "unread".
  app.get('/api/messages/unread', async (req, res) => {
    try {
      const myId = req.userId;
      if (!myId) return res.status(401).json({ error: 'احراز هویت نشده' });
      const { data } = await db.getUnreadCounts(myId);
      res.json(data || {});
    } catch (e) {
      logger.error('[messages/unread]', e);
      res.status(500).json({ error: 'خطای داخلی سرور' });
    }
  });

  app.get('/api/messages/:friendId', async (req, res) => {
    try {
      const myId = req.userId;
      const friendId = req.params.friendId;
      if (!friendId) return res.status(400).json({ error: 'friendId required' });

      const { data } = await db.getMessages(myId, friendId, 50);
      res.json(data);
    } catch (e) {
      logger.error('[messages]', e);
      res.status(500).json({ error: 'خطای داخلی سرور' });
    }
  });

  app.post('/api/messages/send', async (req, res) => {
    try {
      const sender_id = req.userId;
      const { receiver_id, content } = req.body;
      if (!receiver_id || !content?.trim()) {
        return res.status(400).json({ error: 'receiver_id and content required' });
      }
      // Only friends may DM each other — otherwise any authenticated user could
      // spam an arbitrary victim (and plant unread badges on their account).
      if (!(await areFriends(sender_id, receiver_id))) {
        return res.status(403).json({ error: 'شما با این کاربر دوست نیستید' });
      }

      const sanitizedContent = sanitize(content.trim()).slice(0, 1000);
      const result = await db.sendMessage({
        sender_id, receiver_id, content: sanitizedContent, read: 0,
      });
      if (!result?.data) {
        console.warn('[messages/send] sendMessage returned no data, error:', result?.error);
        return res.status(500).json({ error: result?.error || 'Failed to send message' });
      }
      const data = result.data;
      sendToUser(receiver_id, {
        type: 'message:new',
        message: {
          id: data.id,
          senderId: sender_id,
          receiverId: receiver_id,
          content: sanitizedContent,
          createdAt: data.created_at,
          read: false,
          isMine: false,
        }
      });
      res.json(data);
    } catch (e) {
      logger.error('[messages/send]', e);
      res.status(500).json({ error: 'خطای داخلی سرور' });
    }
  });

  app.post('/api/messages/read', async (req, res) => {
    try {
      const myId = req.userId;
      const { sender_id } = req.body;
      await db.markMessagesRead(myId, sender_id);
      // Tell the original sender their message was seen (read receipt).
      // Gated on friendship so `sender_id` can't be used to ping an arbitrary user.
      if (sender_id && await areFriends(myId, sender_id)) {
        sendToUser(sender_id, { type: 'message:read', readerId: myId });
      }
      res.json({ success: true });
    } catch (e) {
      logger.error('[messages/read]', e);
      res.status(500).json({ error: 'خطای داخلی سرور' });
    }
  });

  // ─── NOTIFICATIONS ────────────────────────────────────
  app.get('/api/notifications', async (req, res) => {
    try {
      const userId = req.userId;
      if (!userId) return res.status(400).json({ error: 'userId required' });
      const { data } = await db.getNotifications(userId);
      res.json(data);
    } catch (e) {
      logger.error('[notifications]', e);
      res.status(500).json({ error: 'خطای داخلی سرور' });
    }
  });

  app.post('/api/notifications', async (req, res) => {
    try {
      const sender_id = req.userId;
      if (!sender_id) return res.status(401).json({ error: 'احراز هویت نشده' });
      const { user_id, type, payload } = req.body;
      if (!user_id || !type) return res.status(400).json({ error: 'user_id and type required' });

      // Clients may only raise a battle challenge, and only to a friend.
      // Everything else (friend_req, etc.) is created server-side by its own route,
      // so an arbitrary client can no longer forge notifications of any type.
      if (type !== 'challenge') {
        return res.status(400).json({ error: 'نوع اعلان نامعتبر است' });
      }
      if (!(await areFriends(sender_id, user_id))) {
        return res.status(403).json({ error: 'شما با این کاربر دوست نیستید' });
      }

      const { data } = await db.createNotification({
        user_id, sender_id, type, payload: payload || {},
      });

      // Push WS notification to target user.
      // This is best-effort: the row is already persisted, and the client also
      // polls /api/notifications — so a push failure must NOT fail the request.
      if (data?.user_id) {
        try {
          const sender = sender_id ? await db.getUser(sender_id).catch(() => null) : null;
          const notifMsg = {
            type: 'notification:new',
            notification: {
              id: data.id,
              senderId: sender_id || 'unknown',
              senderName: sender?.data?.username || 'ناشناس',
              senderAvatar: sender?.data?.avatar_text || '👤',
              type: data.type,
              payload: data.payload,
              createdAt: data.created_at,
            }
          };
          // Store in pending for re-delivery on reconnect (capped per user)
          pushPendingNotification(data.user_id, notifMsg.notification);
          logger.info(`[notifications] Broadcasting via WS to user=${data.user_id} notif=${data.id} type=${data.type}`);
          const sent = sendToUser(data.user_id, notifMsg);
          logger.info(`[notifications] sendToUser result: ${sent ? 'DELIVERED' : 'NOT FOUND'}`);
        } catch (pushErr) {
          logger.error('[notifications/push] non-fatal:', pushErr);
        }
      }

      res.json(data);
    } catch (e) {
      logger.error('[notifications/create]', e);
      res.status(500).json({ error: 'خطای داخلی سرور' });
    }
  });

  app.delete('/api/notifications/:id', async (req, res) => {
    try {
      // Look up notification first to check type
      const { data: notif } = await db.getNotificationById(req.params.id);
      if (notif) {
        // Ownership: a user may only delete notifications addressed to them
        // (or ones they sent, e.g. cancelling their own challenge).
        if (req.userId && notif.user_id !== req.userId && notif.sender_id !== req.userId) {
          return res.status(403).json({ error: 'not your notification' });
        }
        // If it's a friend request, also clean up the pending friendship
        if (notif.type === 'friend_req') {
          const { data: friendships } = await db.getFriends(notif.user_id);
          const pending = friendships.find(f =>
            f.status === 'pending' &&
            ((f.user_id === notif.sender_id && f.friend_id === notif.user_id) ||
             (f.user_id === notif.user_id && f.friend_id === notif.sender_id))
          );
          if (pending) {
            db.removeFriendship(pending.id);
          }
        }
      }

      await db.deleteNotification(req.params.id);
      // Clean from pendingNotifications for all users
      const notifId = req.params.id;
      for (const [userId, notifs] of pendingNotifications) {
        const idx = notifs.findIndex(n => n.id === notifId || String(n.id) === notifId);
        if (idx !== -1) {
          notifs.splice(idx, 1);
          if (notifs.length === 0) pendingNotifications.delete(userId);
          break;
        }
      }
      res.json({ success: true });
    } catch (e) {
      logger.error('[notifications/delete]', e);
      res.status(500).json({ error: 'خطای داخلی سرور' });
    }
  });

  // ─── DICTIONARY ────────────────────────────────────────
  app.get('/api/dictionary', async (req, res) => {
    try {
      const { category, language, limit = 10000 } = req.query;
      const sanitizedCategory = sanitize(category || '');
      const sanitizedLang = sanitize(language || '');
      const { data } = await db.getDictionary(sanitizedCategory, sanitizedLang, Math.min(Number(limit) || 10000, 10000));
      res.json(data.map(w => ({ word: w.word, clue: w.clue, category: w.category, language: w.language })));
    } catch (e) {
      logger.error('[dictionary]', e);
      res.status(500).json({ error: 'خطای داخلی سرور' });
    }
  });

  app.get('/api/dictionary/stats', async (req, res) => {
    try {
      const { data } = await db.getDictionaryStats();
      res.json({ count: data?.cnt || 0 });
    } catch (e) {
      res.json({ count: 0 });
    }
  });

  app.get('/api/glue-dictionary', async (req, res) => {
    try {
      const { category, language, limit = 500 } = req.query;
      const sanitizedCategory = sanitize(category || '');
      const sanitizedLang = sanitize(language || '');
      // Category glue is now ~500 words per category, so the old 500 cap would
      // silently truncate the pool the solver depends on for short slots.
      const { data } = await db.getGlueDictionary(sanitizedCategory, sanitizedLang, Math.min(Number(limit) || 500, 10000));
      res.json(data.map(w => ({ word: w.word, clue: w.clue, category: w.category, language: w.language })));
    } catch (e) {
      logger.error('[glue-dictionary]', e);
      res.status(500).json({ error: 'خطای داخلی سرور' });
    }
  });

  app.post('/api/dictionary/seed', async (req, res) => {
    try {
      const { words, category, language } = req.body;
      if (!words?.length) return res.status(400).json({ error: 'words required' });
      let count = 0;
      for (const w of words) {
        let word = (w.word || '').replace(/\u200c/g, '').trim();
        if (!word || word.includes(' ')) continue;
        const { error } = await db.seedWord(word, w.clue, category, language);
        if (!error) count++;
      }
      res.json({ success: true, added: count });
    } catch (e) {
      logger.error('[dictionary/seed]', e);
      res.status(500).json({ error: 'خطای داخلی سرور' });
    }
  });

  // ─── STORY ─────────────────────────────────────────────
  app.get('/api/story/books', async (req, res) => {
    try {
      const { data: books } = await db.getStoryBooks();
      const result = [];
      for (const book of books) {
        const { data: chapters } = await db.getStoryChapters(book.id);
        result.push({
          id: book.id,
          genre: book.genre,
          title: book.title,
          author: book.author,
          description: book.description,
          coverImage: book.cover_image,
          difficulty: book.difficulty,
          style: book.style,
          chapters: chapters.map(c => ({
            id: c.chapter_index,
            title: c.title,
            description: c.description,
            image: c.image,
            victoryText: c.victory_text,
            words: c.words || [],
            monsterAvatar: c.monster_avatar,
            monsterName: c.monster_name,
          })),
        });
      }
      res.json(result);
    } catch (e) {
      logger.error('[story/books]', e);
      res.status(500).json({ error: 'خطای داخلی سرور' });
    }
  });

  // ─── TOWER ─────────────────────────────────────────────
  app.post('/api/tower/consume-ticket', async (req, res) => {
    try {
      const deviceId = req.userId;
      if (!deviceId) return res.status(401).json({ error: 'احراز هویت نشده' });
      const { data, error } = await db.consumeTowerTicket(deviceId);
      if (error) return res.status(400).json({ error });
      res.json({ success: true, ...data });
    } catch (e) {
      logger.error('[tower/consume-ticket]', e);
      res.status(500).json({ error: 'خطای داخلی سرور' });
    }
  });

  /**
   * POST /api/tower/free-ticket
   * Claim the free ticket the TowerLobby button offers. The client used to just
   * bump its own counter with no server call at all, which minted an unlimited
   * number of a consumable the shop sells for 30 coins.
   *
   * Metered server-side: at most one per refill window, and never past the cap.
   * The window is a Redis claim (SET NX EX) so it holds across instances and two
   * concurrent requests cannot both win.
   */
  app.post('/api/tower/free-ticket', async (req, res) => {
    try {
      const deviceId = req.userId;
      if (!deviceId) return res.status(401).json({ error: 'احراز هویت نشده' });

      const user = await db.getUser(deviceId);
      if (!user.data) return res.status(404).json({ error: 'User not found' });
      const tickets = Number(user.data.tower_tickets) || 0;
      if (tickets >= MAX_TOWER_TICKETS) {
        return res.status(400).json({ error: 'at_cap', tower_tickets: tickets, max: MAX_TOWER_TICKETS });
      }

      const claimKey = `tower:free:${deviceId}`;
      const claimed = await redis.setIfNotExists(claimKey, { at: Date.now() }, TOWER_TICKET_REFILL_SEC);
      if (claimed === false) {
        // Derive the remaining window from the stored timestamp (the redis helper
        // set exposes no TTL read).
        let retryInSeconds = TOWER_TICKET_REFILL_SEC;
        try {
          const raw = await redis.get(claimKey);
          const rec = raw ? JSON.parse(raw) : null;
          if (rec && rec.at) {
            retryInSeconds = Math.max(1, TOWER_TICKET_REFILL_SEC - Math.floor((Date.now() - rec.at) / 1000));
          }
        } catch (_) { /* fall back to the full window */ }
        return res.status(429).json({ error: 'cooldown', tower_tickets: tickets, retryInSeconds });
      }
      if (claimed === null) {
        return res.status(503).json({ error: 'unavailable — please retry' });
      }

      const granted = await db.addTowerTickets(deviceId, 1, MAX_TOWER_TICKETS, new Date().toISOString());
      if (granted.error || !granted.data) {
        // Nothing was handed out, so release the window instead of eating it.
        try { await redis.del(claimKey); } catch (_) { /* ignore */ }
        return res.status(500).json({ error: 'خطای داخلی سرور' });
      }

      logger.info(`[tower/free-ticket] ${deviceId} → ${granted.data.tower_tickets} tickets`);
      res.json({
        success: true,
        tower_tickets: granted.data.tower_tickets,
        last_ticket_refill: granted.data.last_ticket_refill,
        nextFreeInSeconds: TOWER_TICKET_REFILL_SEC,
      });
    } catch (e) {
      logger.error('[tower/free-ticket]', e);
      res.status(500).json({ error: 'خطای داخلی سرور' });
    }
  });

  app.post('/api/tower/update-stats', async (req, res) => {
    try {
      const deviceId = req.userId;
      if (!deviceId) return res.status(401).json({ error: 'احراز هویت نشده' });
      const { coins_earned, floor_reached } = req.body;

      const parsedCoins = parseInt(coins_earned) || 0;
      const parsedFloor = parseInt(floor_reached) || 0;

      // The old ceiling here was a flat 100 coins per cash-out — but a run to
      // floor 5 already loots ~240, so every bigger run was rejected with a 400
      // and the player kept only a local (unsaved) balance: real tower earnings
      // vanished on the next load. The daily allowance below is the actual bound,
      // so this is only a sanity check against nonsense input.
      if (parsedCoins < 0 || parsedCoins > TOWER_MAX_RUN_COINS) {
        return res.status(400).json({ error: 'سکه نامعتبر است' });
      }
      if (parsedFloor < 0 || parsedFloor > 100) {
        return res.status(400).json({ error: 'طبقه نامعتبر است' });
      }

      // The reward is client-reported, so it must be bounded server-side. The UI
      // already advertises a DAILY_TOWER_COIN_CAP, but nothing enforced it and the
      // stored counter never rolled over — so a direct caller could mint 100 coins
      // per request, indefinitely. Track the day in Redis so the counter really is
      // per-day, and clamp the credit to what is left of today's allowance.
      const today = new Date().toISOString().slice(0, 10);
      const dayKey = `tower:daily:${deviceId}`;
      let todayTotal = 0;
      try {
        const raw = await redis.get(dayKey);
        if (raw) {
          const rec = JSON.parse(raw);
          if (rec && rec.date === today) todayTotal = Math.max(0, Number(rec.coins) || 0);
        }
      } catch (_) { /* fail open to a 0 baseline */ }

      const remaining = Math.max(0, DAILY_TOWER_COIN_CAP - todayTotal);
      const credit = Math.min(parsedCoins, remaining);
      const newTodayTotal = todayTotal + credit;

      const { data, error } = await db.updateTowerStats(deviceId, credit, parsedFloor, newTodayTotal);
      if (error) return res.status(400).json({ error });
      try { await redis.set(dayKey, { date: today, coins: newTodayTotal }, 172800); } catch (_) {}

      // XP scales with how deep the cash-out run went; the floor-3 quest is the
      // first real climb, so shallow hops cannot farm it.
      let progress = null;
      try {
        progress = await grantProgress(deviceId, {
          xp: progression.XP.tower(parsedFloor),
          questTypes: parsedFloor >= 3 ? ['tower'] : [],
        });
      } catch (e) {
        logger.warn('[tower/update-stats] progress grant failed:', e.message);
      }
      res.json({ ...(data || {}), ...(progress ? { progress } : {}) });
    } catch (e) {
      logger.error('[tower/update-stats]', e);
      res.status(500).json({ error: 'خطای داخلی سرور' });
    }
  });

  // ─── COIN SPENDING (server-authoritative) ──────────────
  // Prices and grants come from ./economy. The client asks for an *item*, never
  // for a balance change, so a direct caller cannot name its own price.
  /**
   * POST /api/coins/spend
   * Body: { reason }
   * Debits the caller's own balance by the server-side price of `reason`, grants
   * the matching item when the reason is a shop purchase, and returns the
   * resulting balance (plus the item counts when they changed). The amount is
   * never taken from the client.
   */
  app.post('/api/coins/spend', async (req, res) => {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ error: 'احراز هویت نشده' });

      const { reason } = req.body || {};
      const price = COIN_PRICES[reason];
      if (typeof price !== 'number') {
        return res.status(400).json({ error: 'reason نامعتبر است' });
      }

      // A tower ticket is capped, so buying one at the cap would charge the player
      // for nothing. Check before the debit, and re-verify after the grant below
      // (which closes the read-then-write race).
      let ticketsBefore = null;
      if (reason === 'shop_towerTicket') {
        const u = await db.getUser(userId);
        ticketsBefore = Number(u?.data?.tower_tickets) || 0;
        if (ticketsBefore >= MAX_TOWER_TICKETS) {
          return res.status(400).json({ error: 'at_cap', tower_tickets: ticketsBefore, max: MAX_TOWER_TICKETS });
        }
      }

      const { data, error } = await db.addCoins(userId, -price, MAX_COINS);
      if (error === 'insufficient_coins') {
        return res.status(400).json({ error: 'سکه کافی نیست', insufficient: true });
      }
      if (error || !data) {
        logger.error(`[coins/spend] failed for ${userId} reason=${reason}: ${error}`);
        return res.status(500).json({ error: 'خطای داخلی سرور' });
      }

      // Deliver the item. If that fails, put the coins back so the player is never
      // charged for nothing.
      const itemKey = SHOP_ITEM_GRANTS[reason];
      let items;
      let towerTickets;
      if (itemKey) {
        const granted = await db.addItem(userId, itemKey, 1);
        if (granted.error || !granted.data) {
          logger.error(`[coins/spend] grant ${itemKey} failed for ${userId}: ${granted.error} — refunding`);
          try { await db.addCoins(userId, price, MAX_COINS); } catch (_) { /* best effort */ }
          return res.status(500).json({ error: 'خطای داخلی سرور' });
        }
        items = granted.data.items;
      } else if (reason === 'shop_towerTicket') {
        // Tickets are a capped counter column, not an entry in the `items` blob, so
        // they need their own grant. Without this the coins were debited and the
        // ticket only ever existed in the client's memory (gone on the next load).
        const granted = await db.addTowerTickets(userId, 1, MAX_TOWER_TICKETS);
        if (granted.error || !granted.data) {
          logger.error(`[coins/spend] tower ticket grant failed for ${userId}: ${granted.error} — refunding`);
          try { await db.addCoins(userId, price, MAX_COINS); } catch (_) { /* best effort */ }
          return res.status(500).json({ error: 'خطای داخلی سرور' });
        }
        towerTickets = granted.data.tower_tickets;
        if (towerTickets <= ticketsBefore) {
          // Someone else filled the last slot first — refund rather than keep the coins.
          try { await db.addCoins(userId, price, MAX_COINS); } catch (_) { /* best effort */ }
          return res.status(400).json({ error: 'at_cap', tower_tickets: towerTickets, max: MAX_TOWER_TICKETS });
        }
      }

      logger.info(`[coins/spend] user=${userId} reason=${reason} -${price} → ${data.coins}${itemKey ? ` (+1 ${itemKey})` : ''}${towerTickets !== undefined ? ` (tickets=${towerTickets})` : ''}`);
      res.json({
        success: true,
        coins: data.coins,
        spent: price,
        ...(items ? { items } : {}),
        ...(towerTickets !== undefined ? { tower_tickets: towerTickets } : {}),
      });
    } catch (e) {
      logger.error('[coins/spend]', e);
      res.status(500).json({ error: 'خطای داخلی سرور' });
    }
  });

  // ─── IN-APP PURCHASES, FORTUNE WHEEL, REWARDED ADS & BATTLE PASS ───────

  /**
   * POST /api/shop/iap/purchase
   * Body: { skuId, gateway: 'web_shaparak' | 'bazaar' | 'myket', receiptId? }
   * Validates the SKU against server-owned `IAP_BY_ID`, applies +15% bonus coins
   * when paid via `web_shaparak` (direct website gateway with 0% store commission),
   * and atomically grants coins, items, tower tickets, cosmetics, and passes.
   */
  app.post('/api/shop/iap/purchase', async (req, res) => {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ error: 'احراز هویت نشده' });

      const { skuId, gateway = 'web_shaparak', receiptId } = req.body || {};
      const pkg = IAP_BY_ID[String(skuId || '')];
      if (!pkg) return res.status(400).json({ error: 'بسته انتخابی نامعتبر است' });

      const { data: profile } = await db.getUser(userId);
      if (!profile) return res.status(404).json({ error: 'پروفایل یافت نشد' });

      const rawCosmetics = (profile.cosmetics && typeof profile.cosmetics === 'object') ? { ...profile.cosmetics } : {};
      const ownedCosmetics = (rawCosmetics.owned && typeof rawCosmetics.owned === 'object') ? { ...rawCosmetics.owned } : {};
      const rawEco = (rawCosmetics.economy && typeof rawCosmetics.economy === 'object') ? { ...rawCosmetics.economy } : {};
      const purchasedPacks = Array.isArray(rawEco.purchasedPacks) ? [...rawEco.purchasedPacks] : [];

      if (pkg.oneTime && purchasedPacks.includes(pkg.id)) {
        return res.status(409).json({ error: 'این بسته ویژه قبلاً یک‌بار خریداری شده است' });
      }

      const isDirectWeb = gateway === 'web_shaparak';
      const bonusCoins = isDirectWeb ? Math.round((pkg.coins || 0) * WEB_DIRECT_BONUS_RATE) : 0;
      const totalCoinsToGrant = (pkg.coins || 0) + bonusCoins;

      // 1. Grant coins
      let newCoins = Number(profile.coins) || 0;
      if (totalCoinsToGrant > 0) {
        const coinRes = await db.addCoins(userId, totalCoinsToGrant, MAX_COINS);
        if (coinRes.data) newCoins = coinRes.data.coins;
      }

      // 2. Grant items
      let currentItems = (profile.items && typeof profile.items === 'object') ? { ...profile.items } : { trophyShield: 0, trophyBoost: 0, streakShield: 0 };
      if (pkg.items && typeof pkg.items === 'object') {
        for (const [itemKey, count] of Object.entries(pkg.items)) {
          const addCount = Number(count) || 0;
          if (addCount > 0) {
            const granted = await db.addItem(userId, itemKey, addCount);
            if (granted.data && granted.data.items) {
              currentItems = granted.data.items;
            } else {
              currentItems[itemKey] = (Number(currentItems[itemKey]) || 0) + addCount;
            }
          }
        }
      }

      // 3. Grant tower tickets (allow exceeding free 2-ticket cap up to 99 for paid bundles!)
      let currentTickets = Number(profile.tower_tickets) || 0;
      if (pkg.towerTickets && pkg.towerTickets > 0) {
        const ticketRes = await db.addTowerTickets(userId, pkg.towerTickets, 99);
        if (ticketRes.data && typeof ticketRes.data.tower_tickets === 'number') {
          currentTickets = ticketRes.data.tower_tickets;
        } else {
          currentTickets += pkg.towerTickets;
        }
      }

      // 4. Grant cosmetic, avatar, book pass, or season pass
      if (pkg.cosmetic) {
        ownedCosmetics[pkg.cosmetic] = true;
      }
      if (!purchasedPacks.includes(pkg.id)) {
        purchasedPacks.push(pkg.id);
      }
      const unlockedAvatars = Array.isArray(rawEco.unlockedAvatars) ? [...rawEco.unlockedAvatars] : [...FREE_AVATAR_IDS];
      if (pkg.unlockAvatar && !unlockedAvatars.includes(pkg.unlockAvatar)) {
        unlockedAvatars.push(pkg.unlockAvatar);
      }
      if (pkg.unlockAllBooks) {
        rawEco.hasEpicPatronPass = true;
      }
      if (pkg.unlockSeasonPass) {
        const curSeason = progression.seasonId();
        rawEco.hasSeasonPass = true;
        rawEco.seasonPassId = curSeason;
      }

      const nextCosmetics = {
        ...rawCosmetics,
        owned: ownedCosmetics,
        economy: {
          ...rawEco,
          purchasedPacks,
          unlockedAvatars,
          lastReceipt: {
            skuId: pkg.id,
            gateway,
            receiptId: receiptId || `rcpt_${Date.now()}`,
            priceToman: pkg.priceToman,
            coinsGranted: totalCoinsToGrant,
            bonusCoins,
            at: new Date().toISOString(),
          },
        },
      };

      await db.updateUser(userId, { cosmetics: nextCosmetics });
      const { data: refreshed } = await db.getUser(userId);
      const finalProfile = refreshed || { ...profile, coins: newCoins, items: currentItems, tower_tickets: currentTickets, cosmetics: nextCosmetics };

      logger.info(`[iap/purchase] user=${userId} sku=${pkg.id} gateway=${gateway} +${totalCoinsToGrant} coins (webBonus=${bonusCoins})`);
      res.json({
        success: true,
        skuId: pkg.id,
        gateway,
        coinsGranted: totalCoinsToGrant,
        bonusCoins,
        coins: finalProfile.coins ?? newCoins,
        items: finalProfile.items || currentItems,
        towerTickets: finalProfile.tower_tickets ?? currentTickets,
        cosmetics: {
          owned: Object.keys(ownedCosmetics).filter(k => ownedCosmetics[k]),
          frame: nextCosmetics.frame || null,
          title: nextCosmetics.title || null,
        },
        economy: readEconomyState(finalProfile),
      });
    } catch (e) {
      logger.error('[iap/purchase]', e);
      res.status(500).json({ error: 'خطای داخلی سرور در ثبت خرید' });
    }
  });

  /**
   * POST /api/shop/wheel/spin
   * Body: { mode: 'free' | 'ad' | 'paid' }
   * 1st daily spin: free
   * 2nd daily spin: after watching a rewarded video ad ('ad')
   * 3rd daily spin: costs 80 coins ('paid')
   */
  app.post('/api/shop/wheel/spin', async (req, res) => {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ error: 'احراز هویت نشده' });

      const mode = String((req.body && req.body.mode) || 'free');
      const today = progression.todayString();
      const { data: profile } = await db.getUser(userId);
      if (!profile) return res.status(404).json({ error: 'پروفایل یافت نشد' });

      const rawCosmetics = (profile.cosmetics && typeof profile.cosmetics === 'object') ? { ...profile.cosmetics } : {};
      const rawEco = (rawCosmetics.economy && typeof rawCosmetics.economy === 'object') ? { ...rawCosmetics.economy } : {};

      const sameDay = rawEco.wheelLastDate === today;
      let wheelFreeUsed = sameDay ? !!rawEco.wheelFreeUsed : false;
      let wheelAdUsed = sameDay ? !!rawEco.wheelAdUsed : false;
      let wheelPaidUsed = sameDay ? !!rawEco.wheelPaidUsed : false;
      let spinsToday = sameDay ? (Number(rawEco.wheelSpinsToday) || 0) : 0;

      if (mode === 'free') {
        if (wheelFreeUsed) return res.status(409).json({ error: 'چرخش رایگان امروز استفاده شده است' });
        wheelFreeUsed = true;
      } else if (mode === 'ad') {
        if (!wheelFreeUsed) return res.status(400).json({ error: 'ابتدا از چرخش رایگان استفاده کنید' });
        if (wheelAdUsed) return res.status(409).json({ error: 'چرخش تبلیغاتی امروز استفاده شده است' });
        wheelAdUsed = true;
      } else if (mode === 'paid') {
        if (wheelPaidUsed) return res.status(409).json({ error: 'حداکثر چرخش‌های امروز تمام شده است' });
        const spinPrice = COIN_PRICES.wheel_extra_spin || 80;
        const debit = await db.addCoins(userId, -spinPrice, MAX_COINS);
        if (debit.error === 'insufficient_coins') {
          return res.status(400).json({ error: 'سکه کافی برای چرخش اضافه ندارید', insufficient: true });
        }
        if (debit.error || !debit.data) {
          return res.status(500).json({ error: 'خطا در کسر سکه' });
        }
        wheelPaidUsed = true;
      } else {
        return res.status(400).json({ error: 'حالت چرخش نامعتبر است' });
      }

      // Weighted random roll (total weight = 100)
      const totalWeight = WHEEL_WEDGES.reduce((acc, w) => acc + w.weight, 0);
      let roll = crypto.randomInt(totalWeight);
      let chosen = WHEEL_WEDGES[0];
      for (const wedge of WHEEL_WEDGES) {
        if (roll < wedge.weight) {
          chosen = wedge;
          break;
        }
        roll -= wedge.weight;
      }

      if (chosen.coins && chosen.coins > 0) {
        await db.addCoins(userId, chosen.coins, MAX_COINS);
      }
      if (chosen.tickets && chosen.tickets > 0) {
        await db.addTowerTickets(userId, chosen.tickets, 99);
      }
      if (chosen.kind === 'item' && chosen.item) {
        await db.addItem(userId, chosen.item, chosen.count || 1);
      }

      spinsToday += 1;
      const nextCosmetics = {
        ...rawCosmetics,
        economy: {
          ...rawEco,
          wheelLastDate: today,
          wheelSpinsToday: spinsToday,
          wheelFreeUsed,
          wheelAdUsed,
          wheelPaidUsed,
        },
      };
      await db.updateUser(userId, { cosmetics: nextCosmetics });
      const { data: updatedProfile } = await db.getUser(userId);
      const finalProfile = updatedProfile || { ...profile, cosmetics: nextCosmetics };

      logger.info(`[wheel/spin] user=${userId} mode=${mode} wedge=${chosen.id} (${chosen.labelFa})`);
      res.json({
        success: true,
        wedgeIndex: chosen.index,
        wedge: chosen,
        coins: finalProfile.coins ?? profile.coins,
        items: finalProfile.items || profile.items,
        towerTickets: finalProfile.tower_tickets ?? profile.tower_tickets,
        economy: readEconomyState(finalProfile),
      });
    } catch (e) {
      logger.error('[wheel/spin]', e);
      res.status(500).json({ error: 'خطای داخلی سرور در چرخش گردونه' });
    }
  });

  /**
   * POST /api/shop/rewarded-ad
   * Grants +25 coins for watching a short rewarded video ad (capped at 3/day).
   */
  app.post('/api/shop/rewarded-ad', async (req, res) => {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ error: 'احراز هویت نشده' });

      const today = progression.todayString();
      const { data: profile } = await db.getUser(userId);
      if (!profile) return res.status(404).json({ error: 'پروفایل یافت نشد' });

      const rawCosmetics = (profile.cosmetics && typeof profile.cosmetics === 'object') ? { ...profile.cosmetics } : {};
      const rawEco = (rawCosmetics.economy && typeof rawCosmetics.economy === 'object') ? { ...rawCosmetics.economy } : {};

      const adsToday = rawEco.rewardedAdLastDate === today ? (Number(rawEco.rewardedAdsToday) || 0) : 0;
      if (adsToday >= REWARDED_AD_DAILY_CAP) {
        return res.status(409).json({ error: 'سقف تماشای ویدیوی جایزه‌دار امروز تمام شده است' });
      }

      const paid = await db.addCoins(userId, REWARDED_AD_COINS, MAX_COINS);
      if (paid.error || !paid.data) {
        return res.status(500).json({ error: 'خطای داخلی سرور' });
      }

      const nextCosmetics = {
        ...rawCosmetics,
        economy: {
          ...rawEco,
          rewardedAdLastDate: today,
          rewardedAdsToday: adsToday + 1,
        },
      };
      await db.updateUser(userId, { cosmetics: nextCosmetics });
      const { data: updatedProfile } = await db.getUser(userId);
      const finalProfile = updatedProfile || { ...profile, coins: paid.data.coins, cosmetics: nextCosmetics };

      logger.info(`[shop/rewarded-ad] user=${userId} +${REWARDED_AD_COINS} coins (${adsToday + 1}/${REWARDED_AD_DAILY_CAP})`);
      res.json({
        success: true,
        reward: REWARDED_AD_COINS,
        coins: finalProfile.coins ?? paid.data.coins,
        economy: readEconomyState(finalProfile),
      });
    } catch (e) {
      logger.error('[shop/rewarded-ad]', e);
      res.status(500).json({ error: 'خطای داخلی سرور' });
    }
  });

  /**
   * POST /api/shop/unlock-content
   * Body: { kind: 'book' | 'avatar' | 'size' | 'category', id, difficulty? }
   * Server-authoritative coin sink for unlocking story books, clay avatars,
   * grid sizes, and crossword categories.
   */
  app.post('/api/shop/unlock-content', async (req, res) => {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ error: 'احراز هویت نشده' });

      const { kind, id, difficulty } = req.body || {};
      if (!kind || id === undefined || id === null) {
        return res.status(400).json({ error: 'اطلاعات بازگشایی ناقص است' });
      }

      const { data: profile } = await db.getUser(userId);
      if (!profile) return res.status(404).json({ error: 'پروفایل یافت نشد' });

      const rawCosmetics = (profile.cosmetics && typeof profile.cosmetics === 'object') ? { ...profile.cosmetics } : {};
      const rawEco = (rawCosmetics.economy && typeof rawCosmetics.economy === 'object') ? { ...rawCosmetics.economy } : {};
      const currentEco = readEconomyState(profile);

      let cost = 0;
      const strId = String(id);

      if (kind === 'book') {
        if (currentEco.hasEpicPatronPass || currentEco.unlockedBooks.includes(strId)) {
          return res.json({ success: true, alreadyUnlocked: true, coins: profile.coins, economy: currentEco });
        }
        cost = getBookUnlockCost(strId, difficulty || 'medium');
      } else if (kind === 'avatar') {
        if (currentEco.unlockedAvatars.includes(strId)) {
          return res.json({ success: true, alreadyUnlocked: true, coins: profile.coins, economy: currentEco });
        }
        cost = getAvatarUnlockCost(strId);
      } else if (kind === 'size') {
        const numSize = Number(id);
        if (currentEco.unlockedSizes.includes(numSize)) {
          return res.json({ success: true, alreadyUnlocked: true, coins: profile.coins, economy: currentEco });
        }
        cost = SIZE_UNLOCK_COSTS[numSize] ?? 450;
      } else if (kind === 'category') {
        if (currentEco.unlockedCategories.includes(strId)) {
          return res.json({ success: true, alreadyUnlocked: true, coins: profile.coins, economy: currentEco });
        }
        cost = CATEGORY_UNLOCK_COSTS[strId] ?? 300;
      } else if (kind === 'legend') {
        if (currentEco.hasEpicPatronPass || (currentEco.unlockedLegends && currentEco.unlockedLegends.includes(strId))) {
          return res.json({ success: true, alreadyUnlocked: true, coins: profile.coins, economy: currentEco });
        }
        cost = getLegendUnlockCost(strId);
      } else {
        return res.status(400).json({ error: 'نوع محتوا نامعتبر است' });
      }

      let newCoins = Number(profile.coins) || 0;
      if (cost > 0) {
        const debit = await db.addCoins(userId, -cost, MAX_COINS);
        if (debit.error === 'insufficient_coins') {
          return res.status(400).json({ error: 'سکه کافی ندارید', insufficient: true, required: cost });
        }
        if (debit.error || !debit.data) {
          return res.status(500).json({ error: 'خطا در کسر سکه' });
        }
        newCoins = debit.data.coins;
      }

      const nextEco = { ...rawEco };
      if (kind === 'book') {
        nextEco.unlockedBooks = Array.from(new Set([...currentEco.unlockedBooks, strId]));
      } else if (kind === 'avatar') {
        nextEco.unlockedAvatars = Array.from(new Set([...currentEco.unlockedAvatars, strId]));
      } else if (kind === 'size') {
        nextEco.unlockedSizes = Array.from(new Set([...currentEco.unlockedSizes, Number(id)]));
      } else if (kind === 'category') {
        nextEco.unlockedCategories = Array.from(new Set([...currentEco.unlockedCategories, strId]));
      } else if (kind === 'legend') {
        nextEco.unlockedLegends = Array.from(new Set([...(currentEco.unlockedLegends || []), strId]));
      }

      const nextCosmetics = { ...rawCosmetics, economy: nextEco };
      await db.updateUser(userId, { cosmetics: nextCosmetics });
      const { data: updatedProfile } = await db.getUser(userId);
      const finalProfile = updatedProfile || { ...profile, coins: newCoins, cosmetics: nextCosmetics };

      logger.info(`[shop/unlock-content] user=${userId} kind=${kind} id=${strId} -${cost} coins → ${newCoins}`);
      res.json({
        success: true,
        kind,
        id,
        spent: cost,
        coins: finalProfile.coins ?? newCoins,
        economy: readEconomyState(finalProfile),
      });
    } catch (e) {
      logger.error('[shop/unlock-content]', e);
      res.status(500).json({ error: 'خطای داخلی سرور' });
    }
  });

  /**
   * POST /api/shop/battle-pass/claim
   * Body: { tier: number, track: 'free' | 'gold' }
   * Claims a tier reward on the 30-tier Season Battle Pass.
   */
  app.post('/api/shop/battle-pass/claim', async (req, res) => {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ error: 'احراز هویت نشده' });

      const tierNum = Number(req.body && req.body.tier);
      const track = String((req.body && req.body.track) || 'free');
      const tierDef = progression.SEASON_PASS_TIERS.find(t => t.tier === tierNum);
      if (!tierDef) return res.status(400).json({ error: 'پله فصل‌نامه نامعتبر است' });

      const { data: profile } = await db.getUser(userId);
      if (!profile) return res.status(404).json({ error: 'پروفایل یافت نشد' });

      const playerXp = Number(profile.xp) || 0;
      if (playerXp < tierDef.xpRequired) {
        return res.status(409).json({ error: 'هنوز امتیاز تجربه (XP) کافی برای این پله ندارید' });
      }

      const currentEco = readEconomyState(profile);
      if (track === 'gold' && !currentEco.hasSeasonPass) {
        return res.status(403).json({ error: 'برای دریافت این جایزه باید طومار طلایی فصل‌نامه را فعال کنید' });
      }

      const reward = track === 'gold' ? tierDef.goldReward : tierDef.freeReward;
      if (!reward) return res.status(400).json({ error: 'این پله جایزه‌ای ندارد' });

      const claimedList = track === 'gold' ? [...currentEco.seasonPassClaimedGold] : [...currentEco.seasonPassClaimedFree];
      if (claimedList.includes(tierNum)) {
        return res.status(409).json({ error: 'جایزه این پله قبلاً دریافت شده است' });
      }

      if (reward.coins && reward.coins > 0) {
        await db.addCoins(userId, reward.coins, MAX_COINS);
      }
      if (reward.kind === 'ticket' && reward.count) {
        await db.addTowerTickets(userId, reward.count, 99);
      }
      if (reward.kind === 'item' && reward.item) {
        await db.addItem(userId, reward.item, reward.count || 1);
      }

      const rawCosmetics = (profile.cosmetics && typeof profile.cosmetics === 'object') ? { ...profile.cosmetics } : {};
      const ownedCosmetics = (rawCosmetics.owned && typeof rawCosmetics.owned === 'object') ? { ...rawCosmetics.owned } : {};
      if (reward.cosmetic) {
        ownedCosmetics[reward.cosmetic] = true;
      }

      claimedList.push(tierNum);
      const rawEco = (rawCosmetics.economy && typeof rawCosmetics.economy === 'object') ? { ...rawCosmetics.economy } : {};
      const currentSeason = progression.seasonId();
      const nextCosmetics = {
        ...rawCosmetics,
        owned: ownedCosmetics,
        economy: {
          ...rawEco,
          seasonPassSeason: currentSeason,
          seasonPassClaimedFree: track === 'free' ? claimedList : currentEco.seasonPassClaimedFree,
          seasonPassClaimedGold: track === 'gold' ? claimedList : currentEco.seasonPassClaimedGold,
        },
      };

      await db.updateUser(userId, { cosmetics: nextCosmetics });
      const { data: updatedProfile } = await db.getUser(userId);
      const finalProfile = updatedProfile || { ...profile, cosmetics: nextCosmetics };

      logger.info(`[battle-pass/claim] user=${userId} tier=${tierNum} track=${track}`);
      res.json({
        success: true,
        tier: tierNum,
        track,
        reward,
        coins: finalProfile.coins ?? profile.coins,
        items: finalProfile.items || profile.items,
        towerTickets: finalProfile.tower_tickets ?? profile.tower_tickets,
        economy: readEconomyState(finalProfile),
      });
    } catch (e) {
      logger.error('[battle-pass/claim]', e);
      res.status(500).json({ error: 'خطای داخلی سرور' });
    }
  });


  /**
   * POST /api/league/result
   * Body: { roomId }
   *
   * Server-arbitrated league settlement for a multiplayer room. Decides win/loss
   * from the recorded `game_over` claim (the same record that decides the arena
   * pot), then applies — for the CALLING player only — the trophy delta, the
   * trophy-shield / trophy-boost consumption, and (winner only) the +20 coin
   * bonus. Both players call it; each gets their own delta. Idempotent per
   * (room, user).
   *
   * Previously ALL of this was computed client-side: `profiles.trophies` was
   * never written by any server code, so every row sat at 0, the leaderboard
   * ranked everyone equally, and shields/boosts were pure local state.
   */
  app.post('/api/league/result', async (req, res) => {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ error: 'احراز هویت نشده' });
      const { roomId } = req.body || {};
      if (!roomId) return res.status(400).json({ error: 'roomId required' });

      const room = await roomGet(roomId);
      if (!room) return res.status(404).json({ error: 'Room not found' });
      if (userId !== room.hostId && userId !== room.joinerId) {
        return res.status(403).json({ error: 'not a participant of this room' });
      }
      const opponentId = userId === room.hostId ? room.joinerId : room.hostId;

      const reportBalance = async () => {
        const { data } = await db.getUser(userId);
        return data ? (data.coins || 0) : null;
      };

      // One settlement per (room, user) — both players settle, each exactly once.
      const claimKey = `league:paid:${roomId}:${userId}`;
      const claimed = await redis.setIfNotExists(claimKey, { userId, at: Date.now() }, 3600);
      if (claimed === false) {
        return res.json({ success: true, awarded: 0, alreadyAwarded: true, coins: await reportBalance() });
      }
      const releaseClaim = async () => { try { await redis.del(claimKey); } catch (_) { /* ignore */ } };

      // Allow a short grace period in case the `game_over` broadcast races this.
      let finish = null;
      for (let attempt = 0; attempt < 10 && !finish; attempt++) {
        const raw = await redis.get(`arena:finish:${roomId}`);
        if (raw) { try { finish = JSON.parse(raw); } catch { finish = null; } }
        if (!finish) await new Promise(r => setTimeout(r, 200));
      }
      if (!finish) {
        // No result on record — settle nothing and let a later call retry.
        await releaseClaim();
        return res.json({ success: true, awarded: 0, coins: await reportBalance() });
      }

      const won = finish.winnerId === userId;

      const { data: me } = await db.getUser(userId);
      if (!me) { await releaseClaim(); return res.status(404).json({ error: 'پروفایل یافت نشد' }); }
      const { data: opp } = opponentId ? await db.getUser(opponentId) : { data: null };

      const myTrophies = me.trophies || 0;
      const oppTrophies = (opp && typeof opp.trophies === 'number') ? opp.trophies : myTrophies;
      const items = (me.items && typeof me.items === 'object') ? { ...me.items } : {};

      // Shield absorbs a loss (mirrors gameServer.applyMultiplayerResult).
      let shieldUsed = false;
      let effectiveOpp = oppTrophies;
      if (!won && (items.trophyShield || 0) > 0) {
        const consumed = await db.addItem(userId, 'trophyShield', -1);
        if (!consumed.error && consumed.data) {
          items.trophyShield = Math.max(0, (items.trophyShield || 0) - 1);
          shieldUsed = true;
          effectiveOpp = myTrophies; // diff = 0 → smallest possible loss
        }
      }

      let trophyChange = leagueMath.calcTrophyChange(myTrophies, effectiveOpp, won);

      // Boost amplifies a gain.
      let boostUsed = false;
      if (won && (items.trophyBoost || 0) > 0 && trophyChange > 0) {
        const consumed = await db.addItem(userId, 'trophyBoost', -1);
        if (!consumed.error && consumed.data) {
          items.trophyBoost = Math.max(0, (items.trophyBoost || 0) - 1);
          boostUsed = true;
          trophyChange = Math.round(trophyChange * 1.5);
        }
      }

      const leagueRes = await db.applyLeagueResult(userId, trophyChange, won);
      if (leagueRes.error || !leagueRes.data) {
        await releaseClaim();
        logger.error(`[league/result] trophy apply failed for ${userId}: ${leagueRes.error}`);
        return res.status(500).json({ error: 'خطای داخلی سرور' });
      }

      // Coin bonus — winner only.
      let awarded = 0;
      let coins = me.coins || 0;
      let streakBonus = 0;
      if (won) {
        const { data, error } = await db.addCoins(userId, LEAGUE_WIN_REWARD, MAX_COINS);
        if (error || !data) {
          logger.error(`[league/result] coin reward failed for ${userId}: ${error}`);
        } else {
          awarded = LEAGUE_WIN_REWARD;
          coins = data.coins;
        }

        // Every Nth straight win pays extra. `win_streak` counts casual wins too,
        // so the payout rule lives in `payStreakBonus` and both paths share its
        // daily ceiling.
        try {
          const bonus = await payStreakBonus(userId, leagueRes.data.winStreak);
          if (bonus.paid > 0) {
            streakBonus = bonus.paid;
            awarded += streakBonus;
            coins = bonus.coins;
          }
        } catch (e) {
          logger.warn('[league/result] streak bonus failed:', e.message);
        }
      }

      // XP + the online-win quest. Losing still earns a little XP: the run was
      // played, and a mode that pays nothing for a loss is a mode nobody retries.
      let progress = null;
      try {
        progress = await grantProgress(userId, {
          xp: won ? progression.XP.onlineWin : progression.XP.onlineLoss,
          questTypes: won ? ['online'] : [],
        });
      } catch (e) {
        logger.warn('[league/result] progress grant failed:', e.message);
      }

      logger.info(`[league/result] room=${roomId} user=${userId} won=${won} trophies=${leagueRes.data.trophies} (${trophyChange >= 0 ? '+' : ''}${trophyChange}) coins=${coins}${streakBonus ? ` +${streakBonus}streak` : ''}${shieldUsed ? ' shield' : ''}${boostUsed ? ' boost' : ''}`);
      res.json({
        success: true,
        awarded,
        streakBonus,
        coins,
        won,
        trophyChange,
        trophies: leagueRes.data.trophies,
        league: leagueRes.data.league,
        highestLeague: leagueRes.data.highestLeague,
        winStreak: leagueRes.data.winStreak,
        totalWins: leagueRes.data.totalWins,
        totalLosses: leagueRes.data.totalLosses,
        items,
        shieldUsed,
        boostUsed,
        ...(progress ? { progress } : {}),
      });
    } catch (e) {
      logger.error('[league/result]', e);
      res.status(500).json({ error: 'خطای داخلی سرور' });
    }
  });


  // ─── RESTRICTED TABLE API ──────────────────────────────
  const ALLOWED_TABLES = ['profiles', 'matches', 'notifications', 'messages', 'friendships'];

  function isAllowed(table) {
    return ALLOWED_TABLES.includes(table);
  }

  const ALLOWED_COLUMNS = {
    profiles: ['id', 'username', 'avatar_text', 'friend_code', 'high_score', 'level', 'coins', 'score'],
    matches: ['id', 'user_id', 'score', 'time_taken', 'grid_size', 'category', 'date_played'],
    notifications: ['id', 'user_id', 'sender_id', 'type', 'payload', 'created_at'],
    messages: ['id', 'sender_id', 'receiver_id', 'content', 'created_at', 'read'],
    friendships: ['id', 'user_id', 'friend_id', 'status'],
  };

  app.get('/api/:table', async (req, res) => {
    try {
      const { table } = req.params;
      if (!isAllowed(table)) return res.status(404).json({ error: 'table not found' });
      if (!req.userId) return res.status(401).json({ error: 'احراز هویت نشده' });

      const filters = { ...req.query };
      delete filters.table;
      const limit = Math.min(Number(filters.limit) || 50, 100); delete filters.limit;

      // Only allow filtering by allowed columns
      const allowedCols = ALLOWED_COLUMNS[table] || [];
      const safeFilters = {};
      for (const [col, val] of Object.entries(filters)) {
        if (val === undefined || val === '') continue;
        if (!allowedCols.includes(col)) continue;
        safeFilters[col] = val;
      }

      let sql = `SELECT "${allowedCols.join('","')}" FROM "${table}"`;
      const params = [];
      const where = [];
      let paramIdx = 1;

      // ── Ownership enforcement (IDOR protection) ──
      // A caller may only read rows that belong to them.
      const scopedCols = new Set(['user_id', 'sender_id', 'receiver_id', 'id']);
      if (table === 'messages') {
        // Must be a participant of the conversation (sent by or addressed to me)
        where.push(`("sender_id" = $${paramIdx} OR "receiver_id" = $${paramIdx + 1})`);
        params.push(req.userId, req.userId);
        paramIdx += 2;
      } else if (table === 'notifications' || table === 'friendships' || table === 'matches') {
        where.push(`"user_id" = $${paramIdx++}`);
        params.push(req.userId);
      } else if (table === 'profiles') {
        // Own profile is allowed by id; reading others is limited to public fields
        // (enforced when shaping the response below).
        safeFilters.id = safeFilters.id || req.userId;
      }

      for (const [col, val] of Object.entries(safeFilters)) {
        if (scopedCols.has(col) && table !== 'profiles') continue; // already scoped above
        where.push(`"${col}" = $${paramIdx++}`);
        params.push(val);
      }
      if (where.length > 0) sql += ` WHERE ${where.join(' AND ')}`;
      if (limit) { sql += ` LIMIT $${paramIdx++}`; params.push(limit); }

      const { data: rows } = await db.queryRaw(sql, params);

      // For profiles, never leak private economy fields of other users.
      if (table === 'profiles') {
        const shape = (row) => {
          if (row.id === req.userId) return row;
          const { coins, score, ...pub } = row;
          return pub;
        };
        const shaped = rows.map(shape);
        if (safeFilters.id) return res.json(shaped.length > 0 ? shaped[0] : null);
        return res.json(shaped);
      }
      res.json(rows);
    } catch (e) {
      logger.error('[table-get]', e);
      res.status(500).json({ error: 'خطای داخلی سرور' });
    }
  });

  // Generic POST removed for security

  // ─── CHALLENGE ACCEPTED ───────────────────────────────
  app.post('/api/challenge/accept', async (req, res) => {
    try {
      const { host_id: hostId, room_id: roomId, notification_id: notificationId } = req.body;
      const myId = req.userId;
      if (!myId) return res.status(401).json({ error: 'احراز هویت نشده' });

      // Respond immediately so the client isn't blocked by delivery retries
      res.json({ success: true });

      // Async cleanup and delivery
      if (notificationId) {
        try { await db.deleteNotification(notificationId); } catch (e) { /* non-fatal */ }
      }

      sendToUserWithRetry(hostId, {
        type: 'challenge:accepted',
        senderId: myId,
        senderName: req.body.sender_name || '',
        senderAvatar: req.body.sender_avatar || '👤',
        roomId,
        joinerSize: req.body.joiner_size,
        joinerCategory: req.body.joiner_category,
      }).then(delivered => {
        if (!delivered) {
          console.warn(`[challenge/accept] Could not deliver to host="${hostId}" after retries`);
        }
      });
    } catch (e) {
      logger.error('[challenge/accept]', e);
      // Only send error response if we haven't already responded
      if (!res.headersSent) {
        res.status(500).json({ error: 'خطای داخلی سرور' });
      }
    }
  });

  // ─── CHALLENGE REJECTION ───────────────────────────────
  app.post('/api/challenge/reject', async (req, res) => {
    try {
      const { notificationId, senderId } = req.body;
      const receiverId = req.userId;
      if (!receiverId) return res.status(401).json({ error: 'احراز هویت نشده' });
      if (notificationId) {
        await db.deleteNotification(notificationId);
      }
      sendToUser(senderId, {
        type: 'challenge:rejected',
        byUserId: receiverId,
      });
      res.json({ success: true });
    } catch (e) {
      logger.error('[challenge/reject]', e);
      res.status(500).json({ error: 'خطای داخلی سرور' });
    }
  });

  // ─── CHALLENGE CANCELLED ───────────────────────────────
  app.post('/api/challenge/cancel', async (req, res) => {
    try {
      const myId = req.userId;
      const { notificationId, friendId } = req.body;
      if (notificationId) {
        await db.deleteNotification(notificationId);
      } else if (friendId) {
        const { data: notifs } = await db.getNotifications(friendId);
        for (const n of notifs) {
          if (n.sender_id === myId && n.type === 'challenge') {
            await db.deleteNotification(n.id);
          }
        }
      }
      sendToUser(friendId, { type: 'challenge:cancelled' });
      // Clean room registry entry linked to this challenge's roomId
      if (notificationId) {
        const { data: notifs } = await db.getNotifications(friendId);
        const notif = notifs?.find(n => n.id === notificationId || (n.sender_id === myId && n.type === 'challenge'));
        if (notif?.payload?.roomId) {
          await roomDelete(notif.payload.roomId);
        }
      }
      res.json({ success: true });
    } catch (e) {
      logger.error('[challenge/cancel]', e);
      res.status(500).json({ error: 'خطای داخلی سرور' });
    }
  });

  // ─── ROOM CHECK ────────────────────────────────────────
  app.post('/api/room/register', async (req, res) => {
    try {
      const { roomId, hostId } = req.body;
      if (!roomId || !hostId) return res.status(400).json({ error: 'roomId and hostId required' });
      // A caller may only register a room as themselves.
      if (req.userId && hostId !== req.userId) {
        return res.status(403).json({ error: 'hostId mismatch' });
      }
      await roomSet(roomId, { hostId, createdAt: Date.now() });
      logger.info(`[room/register] roomId=${roomId} hostId=${hostId} totalRegistered=${roomRegistry.size}`);
      res.json({ ok: true });
    } catch (e) {
      logger.error('[room/register]', e);
      res.status(500).json({ error: 'خطای داخلی سرور' });
    }
  });

  app.post('/api/room/check', async (req, res) => {
    try {
      const { roomId } = req.body;
      if (!roomId) return res.status(400).json({ error: 'roomId required' });
      const channelName = `room_${roomId}`;
      const members = wsChannels.get(channelName);
      const wsExists = !!(members && members.size > 0);
      // Also check the HTTP room registry (covers case where WS is not yet connected or auth failed)
      const reg = await roomGet(roomId);
      const regExists = !!(reg && (Date.now() - reg.createdAt < ROOM_REGISTRY_TTL)); // match registry TTL
      const exists = wsExists || regExists;
      logger.info(`[room/check] roomId=${roomId} wsExists=${wsExists} regExists=${regExists} exists=${exists}`);
      res.json({ exists });
    } catch (e) {
      logger.error('[room/check]', e);
      res.status(500).json({ error: 'خطای داخلی سرور' });
    }
  });

  // ─── MATCHMAKING ───────────────────────────────────────
  const MATCHMAKING_TIMEOUT = 30000;

  app.post('/api/matchmaking/join', async (req, res) => {
    try {
      const { playerId, playerName, playerAvatar, mode, wager, leagueTrophies } = req.body;
      if (!playerId) return res.status(400).json({ error: 'playerId required' });
      // Bind to the authenticated identity when available (no impersonation).
      if (req.userId && playerId !== req.userId) {
        return res.status(403).json({ error: 'playerId mismatch' });
      }

      const player = { playerId, playerName, playerAvatar, mode, wager, leagueTrophies, timestamp: Date.now() };
      const result = await redis.matchmakingAdd(player);

      if (result.status === 'matched') {
        const roomId = result.roomId;
        const opponent = result.opponent;
        // Record BOTH participants. Without `joinerId` the joiner was not
        // recognised as a participant of the room, so wsServer.recordGameOver()
        // ignored their `game_over` claim — which is the arbitration record the
        // per-room payouts rely on.
        //
        // `wager` is recorded here too: the ranked-match wager is escrowed and
        // paid out server-side (see /api/battle/*), and the server must be the
        // one that remembers the amount — a client-supplied wager is never used
        // to decide how many coins move.
        await roomSet(roomId, {
          hostId: opponent.playerId,
          joinerId: playerId,
          wager: parseInt(wager) || 0,
          mode,
          createdAt: Date.now(),
        });

        logger.info(`[matchmaking] MATCHED! roomId=${roomId} host=${opponent.playerName}(${opponent.playerId}) vs joiner=${playerName}(${playerId})`);

        // Notify host via WS (retry with backoff)
        sendToUserWithRetry(opponent.playerId, {
          type: 'matchmaking:matched',
          roomId,
          isHost: true,
          opponent: { id: playerId, name: playerName, avatar: playerAvatar, trophies: leagueTrophies || 0 },
          mode,
          wager,
        }).then(delivered => {
          if (!delivered) {
            console.warn(`[matchmaking] Host notification not delivered to ${opponent.playerId} — host may be offline`);
          }
        });

        return res.json({
          status: 'matched',
          roomId,
          isHost: false,
          opponent: { id: opponent.playerId, name: opponent.playerName, avatar: opponent.playerAvatar, trophies: opponent.leagueTrophies || 0 },
          mode,
          wager,
        });
      }

      logger.info(`[matchmaking] WAITING: player=${playerName}(${playerId}) queueSize=redis`);
      res.json({ status: 'waiting' });
    } catch (e) {
      logger.error('[matchmaking/join]', e);
      res.status(500).json({ error: 'خطای داخلی سرور' });
    }
  });

  app.post('/api/matchmaking/leave', async (req, res) => {
    try {
      const { playerId } = req.body;
      if (req.userId && playerId !== req.userId) {
        return res.status(403).json({ error: 'playerId mismatch' });
      }
      await redis.matchmakingRemove(playerId);
      logger.info(`[matchmaking] player=${playerId} left queue`);
      res.json({ success: true });
    } catch (e) {
      logger.error('[matchmaking/leave]', e);
      res.status(500).json({ error: 'خطای داخلی سرور' });
    }
  });

  app.post('/api/matchmaking/status', async (req, res) => {
    try {
      const { playerId } = req.body;
      if (req.userId && playerId !== req.userId) {
        return res.status(403).json({ error: 'playerId mismatch' });
      }
      const status = await redis.matchmakingStatus(playerId);
      res.json(status);
    } catch (e) {
      logger.error('[matchmaking/status]', e);
      res.status(500).json({ error: 'خطای داخلی سرور' });
    }
  });

  // ─── ARENA (Wagered matchmaking) ───────────────────────
  //
  // System: player A creates a pending game with a coin wager.
  // The game appears in a public list WITHOUT the creator's identity.
  // Player B joins anonymously → both players' wagers are deducted
  // → a room is created → Two-Way Merge → game starts.
  // Winner takes the pot (wager × 2). No trophy/score changes.
  // ────────────────────────────────────────────────────────

  /**
   * POST /api/arena/create
   * Create a pending arena game. Deducts the wager from the creator
   * immediately (held in escrow). The game appears in the arena list
   * without the creator's playerId/name.
   */
  app.post('/api/arena/create', async (req, res) => {
    try {
      const { playerId, mode, wager } = req.body;
      if (!playerId || wager === undefined || !mode) {
        return res.status(400).json({ error: 'playerId, mode, wager required' });
      }
      // A caller may only act on their own account.
      if (req.userId && playerId !== req.userId) {
        return res.status(403).json({ error: 'playerId mismatch' });
      }
      const parsedWager = parseInt(wager) || 0;
      if (parsedWager < 0 || parsedWager > 10000) {
        return res.status(400).json({ error: 'Invalid wager amount' });
      }

      // Validate mode
      if (!['speed', 'battle'].includes(mode)) {
        return res.status(400).json({ error: 'Invalid mode' });
      }

      // Validate player exists
      const user = await db.getUser(playerId);
      if (!user.data) return res.status(404).json({ error: 'User not found' });

      // Deduct the wager from the creator atomically (escrow). A client-supplied
      // balance is never trusted: the server reads and debits its own value in a
      // single guarded statement, so the balance can never go negative.
      if (parsedWager > 0) {
        const { error } = await db.addCoins(playerId, -parsedWager, MAX_COINS);
        if (error === 'insufficient_coins') {
          return res.status(400).json({ error: 'Insufficient coins' });
        }
        if (error) {
          return res.status(500).json({ error: 'خطای داخلی سرور' });
        }
      }

      // Generate gameId and add to pending queue
      const gameId = redis.arenaGenerateGameId();
      await redis.arenaAdd(gameId, playerId, mode, parsedWager);

      logger.info(`[arena/create] gameId=${gameId} playerId=${playerId} mode=${mode} wager=${parsedWager}`);
      res.json({ success: true, gameId });
    } catch (e) {
      logger.error('[arena/create]', e);
      res.status(500).json({ error: 'خطای داخلی سرور' });
    }
  });

  /**
   * GET /api/arena/list
   * Returns the list of pending arena games.
   * NO playerId, username, or any identifying information is included.
   *
   * Each entry carries `mine: true` when the caller created it. That is the only
   * thing derived from `playerId`, and it reveals nothing about anyone else —
   * without it the client cannot tell its own listing apart (the creator's
   * `myPendingGameId` is React state and is lost on reload), so clicking Join on
   * your own game just produced a 404.
   */
  app.get('/api/arena/list', async (req, res) => {
    try {
      const games = await redis.arenaList();
      const mine = req.userId;
      res.json({
        games: games.map(g => ({
          gameId: g.gameId,
          mode: g.mode,
          wager: g.wager,
          mine: !!mine && g.playerId === mine,
        })),
      });
    } catch (e) {
      logger.error('[arena/list]', e);
      res.status(500).json({ error: 'خطای داخلی سرور' });
    }
  });

  /**
   * POST /api/arena/join
   * Join a pending arena game. Deducts the wager from the joiner,
   * removes the game from the pending list, notifies the creator,
   * creates a room, and returns room info to the joiner.
   */
  app.post('/api/arena/join', async (req, res) => {
    try {
      const { gameId, joinerId } = req.body;
      if (!gameId || !joinerId) {
        return res.status(400).json({ error: 'gameId and joinerId required' });
      }
      // A caller may only join on their own behalf.
      if (req.userId && joinerId !== req.userId) {
        return res.status(403).json({ error: 'joinerId mismatch' });
      }

      // Get the game entry from the queue (atomically removes it)
      const game = await redis.arenaJoin(gameId, joinerId);
      if (!game) {
        return res.status(404).json({ error: 'Game not found or already joined' });
      }

      const { playerId: creatorId, mode, wager } = game;

      const refundCreator = async () => {
        if (wager > 0) {
          try { await db.addCoins(creatorId, wager, MAX_COINS); }
          catch (e) { logger.error(`[arena/join] creator refund failed for ${creatorId}:`, e?.message); }
        }
      };

      const joinerUser = await db.getUser(joinerId);
      if (!joinerUser.data) {
        // Refund creator since we already removed the game from the queue
        await refundCreator();
        return res.status(404).json({ error: 'Joiner not found' });
      }

      // Deduct the wager from the joiner atomically (escrow). The client's own
      // balance is never trusted; the guarded UPDATE cannot go negative.
      if (wager > 0) {
        const { error } = await db.addCoins(joinerId, -wager, MAX_COINS);
        if (error === 'insufficient_coins') {
          await refundCreator();
          return res.status(400).json({ error: 'Insufficient coins' });
        }
        if (error) {
          await refundCreator();
          return res.status(500).json({ error: 'خطای داخلی سرور' });
        }
      }

      // Generate room ID (same format as existing matchmaking)
      const roomId = Math.floor(100000 + Math.random() * 900000).toString();

      // Register the room with extended metadata (isArena flag + wager)
      await roomSet(roomId, {
        hostId: creatorId,
        joinerId,
        wager,
        mode,
        isArena: true,
        createdAt: Date.now(),
      });

      // Get creator info for the joiner's opponent display
      const creatorUser = await db.getUser(creatorId);
      const creatorName = creatorUser?.data?.username || 'Opponent';
      const creatorAvatar = creatorUser?.data?.avatar_text || '👤';

      // Get joiner info for the WS notification to the creator
      const joinerName = joinerUser.data.username || 'Opponent';
      const joinerAvatar = joinerUser.data.avatar_text || '👤';

      // Notify the creator via WebSocket that someone joined their game
      const notified = sendToUser(creatorId, {
        type: 'arena:matched',
        roomId,
        isHost: true,
        mode,
        wager,
        opponent: {
          id: joinerId,
          name: joinerName,
          avatar: joinerAvatar,
        },
      });

      if (!notified) {
        logger.warn(`[arena/join] Creator ${creatorId} not reachable via WS for room ${roomId}`);
        // Still proceed — the joiner will wait in merge lobby
      }

      logger.info(`[arena/join] gameId=${gameId} roomId=${roomId} creator=${creatorId} joiner=${joinerId} mode=${mode} wager=${wager}`);

      res.json({
        success: true,
        roomId,
        isHost: false,
        wager,
        opponent: {
          id: creatorId,
          name: creatorName,
          avatar: creatorAvatar,
        },
      });
    } catch (e) {
      logger.error('[arena/join]', e);
      res.status(500).json({ error: 'خطای داخلی سرور' });
    }
  });

  /**
   * POST /api/arena/cancel
   * Cancel a pending arena game. Refunds the creator's wager.
   * Only the creator can cancel their own game.
   */
  app.post('/api/arena/cancel', async (req, res) => {
    try {
      const { gameId, playerId } = req.body;
      if (!gameId || !playerId) {
        return res.status(400).json({ error: 'gameId and playerId required' });
      }
      if (req.userId && playerId !== req.userId) {
        return res.status(403).json({ error: 'playerId mismatch' });
      }

      const game = await redis.arenaCancel(gameId);
      if (!game) {
        return res.status(404).json({ error: 'Game not found' });
      }

      if (game.playerId !== playerId) {
        // Re-add the game since we removed it but wrong user
        await redis.arenaAdd(game.gameId, game.playerId, game.mode, game.wager);
        return res.status(403).json({ error: 'Not your game to cancel' });
      }

      // Refund wager to creator — atomically, and report the new balance so the
      // client can mirror it instead of guessing.
      const { data, error } = game.wager > 0
        ? await db.addCoins(playerId, game.wager, MAX_COINS)
        : await db.getUser(playerId);
      if (error && error !== 'user_not_found') {
        logger.error(`[arena/cancel] refund failed for ${playerId}: ${error}`);
        return res.status(500).json({ error: 'خطای داخلی سرور' });
      }

      logger.info(`[arena/cancel] gameId=${gameId} playerId=${playerId} refund=${game.wager}`);
      res.json({ success: true, refund: game.wager, coins: data ? (data.coins || 0) : null });
    } catch (e) {
      logger.error('[arena/cancel]', e);
      res.status(500).json({ error: 'خطای داخلی سرور' });
    }
  });

  /**
   * POST /api/arena/result
   * Called after an arena game ends. Awards the pot (wager × 2) to the winner.
   * No trophy or score changes — those are handled separately for non-arena MP.
   */
  app.post('/api/arena/result', async (req, res) => {
    try {
      // `winnerId` is intentionally NOT read from the body — the winner is
      // decided server-side from the recorded `game_over` claim.
      const { roomId } = req.body;
      if (!roomId) {
        return res.status(400).json({ error: 'roomId required' });
      }

      const room = await roomGet(roomId);
      if (!room) {
        return res.status(404).json({ error: 'Room not found' });
      }
      if (!room.isArena) {
        return res.status(400).json({ error: 'Not an arena game' });
      }
      // Only an actual participant may report a result.
      if (req.userId && req.userId !== room.hostId && req.userId !== room.joinerId) {
        return res.status(403).json({ error: 'not a participant of this room' });
      }

      const { wager, hostId, joinerId } = room;
      const pot = wager * 2;
      const claimKey = `arena:paid:${roomId}`;

      // ── Server-side arbitration ──────────────────────────────
      // The winner is whoever the server saw claim `game_over` FIRST on the
      // room channel (recorded by wsServer.recordGameOver from the
      // *authenticated* socket identity). A client-supplied `winnerId` is
      // deliberately ignored: trusting it let any participant — including the
      // loser — declare themselves the winner and take the pot.
      let finish = null;
      for (let attempt = 0; attempt < 10 && !finish; attempt++) {
        const raw = await redis.get(`arena:finish:${roomId}`);
        if (raw) { try { finish = JSON.parse(raw); } catch { finish = null; } }
        if (!finish) await new Promise(r => setTimeout(r, 200)); // up to ~2s
      }

      if (!finish) {
        // No `game_over` ever reached the server (WS hiccup, or a forged call
        // with no game behind it). Void the game and refund BOTH wagers so
        // nobody is out of pocket and nobody profits from an unverifiable claim.
        const claim = await redis.setIfNotExists(claimKey, { voided: true, at: Date.now() }, 3600);
        if (claim === false) {
          return res.json({ success: true, pot: 0, voided: true, alreadyAwarded: true });
        }
        for (const pid of [hostId, joinerId]) {
          const { data } = await db.addCoins(pid, wager, MAX_COINS);
          if (!data) logger.warn(`[arena/result] void refund failed for ${pid}`);
        }
        logger.warn(`[arena/result] roomId=${roomId} VOIDED — no game_over on record; both wagers refunded`);
        return res.json({ success: true, pot: 0, voided: true });
      }

      const winnerId = finish.winnerId;
      if (winnerId !== hostId && winnerId !== joinerId) {
        logger.warn(`[arena/result] roomId=${roomId} recorded winner ${winnerId} is not a participant`);
        return res.status(409).json({ error: 'recorded winner is not a participant of this room' });
      }

      // Idempotency: award the pot exactly once, even if both clients (or two
      // server instances) call this concurrently. An in-process boolean would
      // be per-instance and unsafe, so claim an atomic Redis key instead.
      const claimed = await redis.setIfNotExists(claimKey, { winnerId, pot, at: Date.now() }, 3600);
      if (claimed === false) {
        return res.json({ success: true, pot, alreadyAwarded: true });
      }
      if (claimed === null) {
        // Redis unavailable — fall back to the per-process flag.
        if (room.resultSubmitted) {
          return res.json({ success: true, pot, alreadyAwarded: true });
        }
        room.resultSubmitted = true;
        await roomSet(roomId, room);
      }

      // Award pot to winner
      try {
        const { data } = await db.addCoins(winnerId, pot, MAX_COINS);
        if (!data) throw new Error('addCoins failed for the arena winner');
      } catch (e) {
        // Release the claim so the payout can be retried
        try { await redis.del(claimKey); } catch (_) { /* ignore */ }
        room.resultSubmitted = false;
        throw e;
      }

      logger.info(`[arena/result] roomId=${roomId} winner=${winnerId} pot=${pot}`);
      res.json({ success: true, pot });
    } catch (e) {
      logger.error('[arena/result]', e);
      res.status(500).json({ error: 'خطای داخلی سرور' });
    }
  });

  // ─── WAGERED MULTIPLAYER (ranked) — server-side escrow ─────────────────
  //
  // A ranked match can carry a coin wager. Historically the CLIENT deducted the
  // wager locally when the game started and refunded it locally when the player
  // left — and the winner was never credited at all (the result screen rendered
  // `wager × 2` but no code paid it). That made "start a wagered match, then
  // leave" an unlimited coin mint, and made actually winning one worthless.
  //
  // Coins now live server-side, keyed by roomId:
  //   battle:escrow:<roomId>            { wager, hostId, joinerId, paid:{id:true}, createdAt }
  //   battle:settle:<roomId>            one-shot claim gating the payout / void
  //   battle:refund:<roomId>:<userId>   one-shot claim gating a single refund
  //
  // The wager is read from the room registry (written by /matchmaking/join) and
  // the winner from the `arena:finish` arbitration record written by
  // wsServer.recordGameOver from the *authenticated* socket identity — neither
  // is ever taken from the request body.
  const BATTLE_ESCROW_TTL = 7200;           // 2h — outlives the 5min room registry
  const BATTLE_SETTLE_TTL = 3600;
  const BATTLE_SWEEP_AFTER_MS = 30 * 60 * 1000;
  const battleEscrowKey = (roomId) => `battle:escrow:${roomId}`;

  async function readBattleEscrow(roomId) {
    try {
      const raw = await redis.get(battleEscrowKey(roomId));
      if (!raw) return null;
      return typeof raw === 'string' ? JSON.parse(raw) : raw;
    } catch (_) { return null; }
  }

  async function writeBattleEscrow(roomId, rec) {
    try { await redis.set(battleEscrowKey(roomId), rec, BATTLE_ESCROW_TTL); } catch (_) { /* ignore */ }
  }

  /** Poll for the room's `game_over` arbitration record (it can race the settle). */
  async function readBattleFinish(roomId, attempts = 10, delayMs = 200) {
    for (let i = 0; i < attempts; i++) {
      const raw = await redis.get(`arena:finish:${roomId}`);
      if (raw) { try { return JSON.parse(raw); } catch { /* retry */ } }
      await new Promise(r => setTimeout(r, delayMs));
    }
    return null;
  }

  /**
   * Perform the one-shot settlement of a wagered room. Returns
   * { settled, voided, winnerId, pot } — `settled:false` means another caller
   * already did the money movement (the caller should just read its balance).
   *
   * Payout rule: the pot is only paid when the match was decided AND both sides
   * actually escrowed. Anything else voids — every player who paid is refunded,
   * so a partial or unverifiable pool can never be paid out at a profit.
   */
  async function settleBattleRoom(roomId, { wager, hostId, joinerId, paid }) {
    const settleKey = `battle:settle:${roomId}`;
    const claimed = await redis.setIfNotExists(settleKey, { pending: true, at: Date.now() }, BATTLE_SETTLE_TTL);

    if (claimed === false) {
      // Another caller (the other client, or the sweep) owns the settlement.
      // Read the outcome IT persisted rather than recomputing it here — the
      // escrow record is already gone by then, so recomputing would report
      // "not both escrowed" and wrongly tell the winner the match was voided.
      for (let i = 0; i < 10; i++) {
        const raw = await redis.get(settleKey);
        if (raw) {
          try {
            const done = JSON.parse(raw);
            if (done && !done.pending) {
              return { settled: false, voided: !!done.voided, winnerId: done.winnerId || null, pot: done.pot || 0 };
            }
          } catch (_) { /* keep waiting for the outcome */ }
        }
        await new Promise(r => setTimeout(r, 200));
      }
      return { settled: false, voided: true, winnerId: null, pot: 0 };
    }
    if (claimed === null) {
      // Redis is the only cross-instance lock. Without it we could pay twice, so
      // refuse to move money at all — the caller retries.
      return { settled: false, unavailable: true, voided: true, winnerId: null, pot: 0 };
    }

    const finish = await readBattleFinish(roomId);
    const winnerId = finish && finish.winnerId;
    const decided = !!(winnerId && (winnerId === hostId || winnerId === joinerId));
    const bothEscrowed = !!(paid && paid[hostId] && paid[joinerId]);
    const pot = wager * 2;

    try {
      if (decided && bothEscrowed) {
        const { data } = await db.addCoins(winnerId, pot, MAX_COINS);
        if (!data) throw new Error('addCoins failed for the battle winner');
        logger.info(`[battle] roomId=${roomId} winner=${winnerId} pot=${pot}`);
      } else {
        for (const pid of Object.keys(paid || {})) {
          const { data } = await db.addCoins(pid, wager, MAX_COINS);
          if (!data) logger.warn(`[battle] void refund failed for ${pid}`);
        }
        logger.warn(`[battle] roomId=${roomId} VOIDED (decided=${decided} bothEscrowed=${bothEscrowed}) — escrows refunded`);
      }
    } catch (e) {
      // Release the claim so a retry can complete the settlement.
      try { await redis.del(settleKey); } catch (_) { /* ignore */ }
      throw e;
    }

    const outcome = {
      winnerId: decided ? winnerId : null,
      pot: (decided && bothEscrowed) ? pot : 0,
      voided: !(decided && bothEscrowed),
      at: Date.now(),
    };
    try { await redis.set(settleKey, outcome, BATTLE_SETTLE_TTL); } catch (_) { /* ignore */ }
    try { await redis.del(battleEscrowKey(roomId)); } catch (_) { /* ignore */ }
    return { settled: true, ...outcome };
  }

  /**
   * POST /api/battle/escrow  { roomId }
   * Escrow the caller's wager. The amount comes from the room registry, so a
   * client can never choose how many of its own coins are at stake.
   */
  app.post('/api/battle/escrow', async (req, res) => {
    try {
      const { roomId } = req.body;
      if (!roomId) return res.status(400).json({ error: 'roomId required' });
      const userId = req.userId;
      if (!userId) return res.status(401).json({ error: 'احراز هویت نشده' });

      const room = await roomGet(roomId);
      if (!room) return res.status(404).json({ error: 'Room not found' });
      if (userId !== room.hostId && userId !== room.joinerId) {
        return res.status(403).json({ error: 'not a participant of this room' });
      }

      const wager = parseInt(room.wager) || 0;
      const balance = async () => { const { data } = await db.getUser(userId); return data?.coins ?? 0; };
      if (wager <= 0) {
        // Free match — nothing to escrow. Not an error; the client just mirrors.
        return res.json({ success: true, wager: 0, coins: await balance() });
      }

      const rec = (await readBattleEscrow(roomId)) ||
        { wager, hostId: room.hostId, joinerId: room.joinerId, paid: {}, createdAt: Date.now() };
      if (rec.paid && rec.paid[userId]) {
        // Retry / double call — never debit the same player twice for one room.
        return res.json({ success: true, wager, coins: await balance(), alreadyEscrowed: true });
      }

      // Atomic guarded debit: updates no row when the balance would go negative.
      const { data, error } = await db.addCoins(userId, -wager, MAX_COINS);
      if (error === 'insufficient_coins') {
        return res.status(400).json({ error: 'Insufficient coins', coins: await balance() });
      }
      if (error || !data) return res.status(500).json({ error: 'خطای داخلی سرور' });

      rec.paid = rec.paid || {};
      rec.paid[userId] = true;
      rec.wager = wager;
      rec.hostId = room.hostId;
      rec.joinerId = room.joinerId;
      await writeBattleEscrow(roomId, rec);

      logger.info(`[battle/escrow] roomId=${roomId} user=${userId} wager=${wager} coins=${data.coins}`);
      res.json({ success: true, wager, coins: data.coins });
    } catch (e) {
      logger.error('[battle/escrow]', e);
      res.status(500).json({ error: 'خطای داخلی سرور' });
    }
  });

  /**
   * POST /api/battle/result  { roomId }
   * Settle a wagered room: the winner takes the pot (wager × 2), or the room is
   * voided and every escrow refunded. Safe to call from both clients.
   */
  app.post('/api/battle/result', async (req, res) => {
    try {
      const { roomId } = req.body;
      if (!roomId) return res.status(400).json({ error: 'roomId required' });
      const userId = req.userId;
      if (!userId) return res.status(401).json({ error: 'احراز هویت نشده' });

      const room = await roomGet(roomId);
      if (!room) return res.status(404).json({ error: 'Room not found' });
      if (userId !== room.hostId && userId !== room.joinerId) {
        return res.status(403).json({ error: 'not a participant of this room' });
      }

      const rec = await readBattleEscrow(roomId);
      const wager = parseInt((rec && rec.wager) || room.wager) || 0;
      const balance = async () => { const { data } = await db.getUser(userId); return data?.coins ?? 0; };
      if (wager <= 0) {
        return res.json({ success: true, wager: 0, pot: 0, won: false, coins: await balance() });
      }

      const hostId = room.hostId, joinerId = room.joinerId;
      const paid = (rec && rec.paid) || {};
      const outcome = await settleBattleRoom(roomId, { wager, hostId, joinerId, paid });
      if (outcome.unavailable) {
        return res.status(503).json({ error: 'settlement unavailable — please retry' });
      }

      res.json({
        success: true,
        wager,
        pot: outcome.pot,
        won: !!outcome.winnerId && outcome.winnerId === userId,
        voided: outcome.voided,
        alreadySettled: !outcome.settled,
        coins: await balance(),
      });
    } catch (e) {
      logger.error('[battle/result]', e);
      res.status(500).json({ error: 'خطای داخلی سرور' });
    }
  });

  /**
   * POST /api/battle/cancel  { roomId }
   * Abandon a wagered room before it is decided: refund the caller's own escrow.
   * Refused once a `game_over` exists — a decided match must be settled, or the
   * loser could cancel their way out of a loss.
   */
  app.post('/api/battle/cancel', async (req, res) => {
    try {
      const { roomId } = req.body;
      if (!roomId) return res.status(400).json({ error: 'roomId required' });
      const userId = req.userId;
      if (!userId) return res.status(401).json({ error: 'احراز هویت نشده' });

      const room = await roomGet(roomId);
      if (!room) return res.status(404).json({ error: 'Room not found' });
      if (userId !== room.hostId && userId !== room.joinerId) {
        return res.status(403).json({ error: 'not a participant of this room' });
      }

      const balance = async () => { const { data } = await db.getUser(userId); return data?.coins ?? 0; };

      const finish = await redis.get(`arena:finish:${roomId}`);
      if (finish) {
        return res.status(409).json({ error: 'match already decided — settle it instead', coins: await balance() });
      }

      const rec = await readBattleEscrow(roomId);
      const paid = (rec && rec.paid) || {};
      const wager = parseInt((rec && rec.wager) || room.wager) || 0;
      if (wager <= 0 || !paid[userId]) {
        return res.json({ success: true, refunded: 0, coins: await balance() });
      }

      const claimKey = `battle:refund:${roomId}:${userId}`;
      const claimed = await redis.setIfNotExists(claimKey, { at: Date.now() }, BATTLE_SETTLE_TTL);
      if (claimed === false) {
        return res.json({ success: true, refunded: 0, alreadyRefunded: true, coins: await balance() });
      }
      if (claimed === null) {
        return res.status(503).json({ error: 'refund unavailable — please retry' });
      }

      const { data, error } = await db.addCoins(userId, wager, MAX_COINS);
      if (error || !data) {
        try { await redis.del(claimKey); } catch (_) { /* ignore */ }
        return res.status(500).json({ error: 'خطای داخلی سرور' });
      }

      // Drop them from the pool. Otherwise a decided match settled later would
      // still see "both escrowed" and pay a pot that this refund already drained.
      delete rec.paid[userId];
      await writeBattleEscrow(roomId, rec);

      logger.info(`[battle/cancel] roomId=${roomId} user=${userId} refunded=${wager} coins=${data.coins}`);
      res.json({ success: true, refunded: wager, coins: data.coins });
    } catch (e) {
      logger.error('[battle/cancel]', e);
      res.status(500).json({ error: 'خطای داخلی سرور' });
    }
  });

  // Sweep escrows left behind by a tab close / crash: a room whose client never
  // reached /battle/result or /battle/cancel would otherwise hold the wager
  // forever. After the grace window, settle it on the player's behalf.
  setInterval(async () => {
    let keys = [];
    try { keys = await redis.scanKeys('battle:escrow:*'); } catch (_) { return; }
    for (const key of keys) {
      try {
        const roomId = key.slice('battle:escrow:'.length);
        const rec = await readBattleEscrow(roomId);
        if (!rec || !rec.createdAt) continue;
        if (Date.now() - rec.createdAt < BATTLE_SWEEP_AFTER_MS) continue;
        const outcome = await settleBattleRoom(roomId, {
          wager: parseInt(rec.wager) || 0,
          hostId: rec.hostId,
          joinerId: rec.joinerId,
          paid: rec.paid || {},
        });
        if (outcome.settled) {
          logger.info(`[battle/sweep] settled stale escrow roomId=${roomId} voided=${outcome.voided} pot=${outcome.pot}`);
        }
      } catch (e) {
        logger.warn('[battle/sweep] failed:', e?.message);
      }
    }
  }, 60_000);

  // ─── ASYNC DUELS ──────────────────────────────────────
  // Two levels. An ARENA is one finished board plus the creator's own result;
  // it is created on its own, with nobody invited yet, because the whole point
  // is "this is the run I'm proud of". An INVITE is one friend asked to replay
  // that same arena. Results are never deleted: they survive closing and expiry,
  // and an arena that already has a result can no longer be deleted at all.
  const DUEL_ARENA_LIMIT = 5;
  const DUEL_INVITE_LIMIT = 5;
  const DUEL_TTL_MS = 7 * 24 * 3600 * 1000;
  const DUEL_BOARD_BYTES = 120_000;
  // `DUEL_COINS` comes from ./economy.
  // Arena creation follows the same unlock ladder as the rest of the game
  // (mirror of SIZE_SCORE_THRESHOLDS / CATEGORY_SCORE_THRESHOLDS in utils/config.ts).
  // Enforced here too: the client gate alone is bypassable with a raw request.
  const DUEL_SIZE_UNLOCK = { 5: 0, 6: 1500, 7: 5000, 8: 12000, 9: 25000, 10: 50000 };
  const DUEL_CATEGORY_UNLOCK = {
    knowledge: 0, food: 0, all: 0, general: 0, shahnameh: 0,
    movies: 5000, cities: 5000, body: 12000, jobs: 12000,
    tech: 25000, nature: 25000, history: 50000, sports: 50000, art: 50000,
  };
  const DUEL_CATEGORY_LABEL = {
    general: 'عمومی', movies: 'فیلم', cities: 'شهرها', knowledge: 'اطلاعات عمومی',
    food: 'غذا', body: 'بدن', jobs: 'مشاغل', tech: 'تکنولوژی', nature: 'طبیعت',
    history: 'تاریخ', sports: 'ورزش', art: 'هنر', shahnameh: 'شاهنامه', all: 'همه',
  };
  // Duel verdicts are NOT the in-game score. That number grows with the streak
  // multiplier and with the order the player happened to navigate in, so a messy
  // run could beat a careful one on the same board. Verdicts use their own
  // measure: letters the player placed themselves, minus time spent, mistakes
  // made and letters they were shown by a power-up or a paid hint.
  const DUEL_POINTS = { cell: 100, second: 2, mistake: 40, assisted: 60 };
  // Every duel message is shown to a Persian-speaking player, so its numbers are
  // Persian too — a Latin digit inside an RTL sentence breaks the reading order.
  const faDigits = (value) => String(value).replace(/[0-9]/g, d => '۰۱۲۳۴۵۶۷۸۹'[+d]);

  /**
   * Wipe one duel out of one player's inbox: the invitation card, a result notice,
   * and anything still queued for them in memory. Deleting the row alone would
   * leave a card in the friend's inbox pointing at a duel that no longer exists.
   */
  const dropDuelNotifications = async (userId, duelId) => {
    if (!userId) return 0;
    let removed = 0;
    try {
      const { data: inbox } = await db.getNotifications(userId);
      for (const n of inbox || []) {
        if (n.type !== 'duel' && n.type !== 'duel_result') continue;
        let payload = n.payload;
        if (typeof payload === 'string') {
          try { payload = JSON.parse(payload || '{}'); } catch { payload = {}; }
        }
        if (String((payload || {}).duelId || '') !== String(duelId)) continue;
        await db.deleteNotification(n.id);
        removed++;
        for (const [uid, notifs] of pendingNotifications) {
          const idx = notifs.findIndex(q => String(q.id) === String(n.id));
          if (idx !== -1) {
            notifs.splice(idx, 1);
            if (notifs.length === 0) pendingNotifications.delete(uid);
            break;
          }
        }
      }
    } catch (e) {
      logger.warn('[duel/delete] inbox cleanup failed (non-fatal):', e?.message);
    }
    return removed;
  };

  // Arenas live for a week, but a result never dies. On expiry the sweep only
  // drops invitations nobody answered (and the inbox cards pointing at them),
  // closes arenas that do have results, and deletes arenas nothing points at.
  setInterval(async () => {
    try {
      const cutoff = new Date(Date.now() - DUEL_TTL_MS).toISOString();
      const { data: expired, error } = await db.listExpiredDuelArenas(cutoff);
      if (error) {
        logger.error({ err: error }, '[duel/sweep] failed');
        return;
      }
      let droppedInvites = 0, droppedArenas = 0, closedArenas = 0;
      for (const arena of expired || []) {
        const { data: rows } = await db.listDuelInvites(arena.id);
        const invites = rows || [];
        const unanswered = invites.filter(i => i.status === 'open');
        const playing = invites.filter(i => i.status === 'playing');
        const finished = invites.filter(i => i.status === 'completed');

        for (const invite of unanswered) {
          await db.deleteDuelInvite(invite.id);
          await dropDuelNotifications(invite.opponent_id, invite.id);
          droppedInvites++;
        }
        if (finished.length === 0 && playing.length === 0) {
          await db.deleteDuelArena(arena.id);
          droppedArenas++;
        } else if (finished.length > 0 && !arena.closed) {
          await db.closeDuelArena(arena.id);
          closedArenas++;
        }
      }
      if (droppedInvites || droppedArenas || closedArenas) {
        logger.info(`[duel/sweep] invite=${droppedInvites} arena=${droppedArenas} closed=${closedArenas}`);
      }
    } catch (e) {
      logger.error({ err: e }, '[duel/sweep] failed');
    }
  }, 10 * 60_000);

  const DUEL_CATEGORIES = new Set([
    'general', 'movies', 'cities', 'knowledge', 'food', 'body',
    'jobs', 'tech', 'nature', 'history', 'sports', 'art', 'shahnameh', 'all',
  ]);

  const arenaExpired = (arena) => {
    const created = Date.parse((arena && arena.created_at) || '') || 0;
    return !!created && Date.now() - created > DUEL_TTL_MS;
  };

  /** Board = { grid, clues } — validated structurally, not semantically. */
  function sanitizeDuelBoard(raw) {
    if (!raw || typeof raw !== 'object') return null;
    const { grid, clues } = raw;
    if (!Array.isArray(grid) || grid.length < 5 || grid.length > 10) return null;
    if (!Array.isArray(clues) || clues.length < 1 || clues.length > 80) return null;

    const rows = grid.length;
    const cols = grid[0] && grid[0].length;
    if (!Number.isInteger(cols) || cols < 5 || cols > 10) return null;

    const cells = [];
    for (const row of grid) {
      if (!Array.isArray(row) || row.length !== cols) return null;
      const cleanRow = [];
      for (const cell of row) {
        if (!cell || typeof cell !== 'object') return null;
        const r = Number(cell.row), c = Number(cell.col);
        if (!Number.isInteger(r) || !Number.isInteger(c) || r < 0 || r >= rows || c < 0 || c >= cols) return null;
        cleanRow.push({
          row: r,
          col: c,
          value: typeof cell.value === 'string' ? cell.value.slice(0, 1) : '',
          isBlack: !!cell.isBlack,
          ...(Number.isInteger(cell.clueNumber) ? { clueNumber: cell.clueNumber } : {}),
        });
      }
      cells.push(cleanRow);
    }

    const cleanClues = [];
    for (const clue of clues) {
      if (!clue || typeof clue !== 'object') return null;
      const number = Number(clue.number);
      const direction = clue.direction === 'down' ? 'down' : clue.direction === 'across' ? 'across' : null;
      const word = typeof clue.word === 'string' ? clue.word.trim() : '';
      if (!Number.isInteger(number) || !direction) return null;
      if (!word || word.length > 24) return null;
      if (!Array.isArray(clue.cells) || clue.cells.length < 1 || clue.cells.length > 10) return null;
      const clueCells = [];
      for (const cc of clue.cells) {
        // The game engine addresses clue cells as `{ r, c }` (see types.ts Clue),
        // so that is the shape stored here too.
        const r = Number(cc && cc.r), c = Number(cc && cc.c);
        if (!Number.isInteger(r) || !Number.isInteger(c) || r < 0 || r >= rows || c < 0 || c >= cols) return null;
        clueCells.push({ r, c });
      }
      cleanClues.push({
        number,
        direction,
        word,
        translation: typeof clue.translation === 'string' ? clue.translation.slice(0, 200) : '',
        cells: clueCells,
      });
    }

    const clean = { grid: cells, clues: cleanClues };
    if (JSON.stringify(clean).length > DUEL_BOARD_BYTES) return null;
    return clean;
  }

  function sanitizeDuelResult(raw) {
    if (!raw || typeof raw !== 'object') return null;
    const score = Number(raw.score);
    const seconds = Number(raw.seconds);
    const solved = Number(raw.solved);
    const total = Number(raw.total);
    if (!Number.isInteger(score) || score < 0 || score > MAX_SCORE) return null;
    if (!Number.isFinite(seconds) || seconds < 0 || seconds > 7200) return null;
    if (!Number.isInteger(solved) || solved < 0 || solved > 999) return null;
    if (!Number.isInteger(total) || total < 1 || total > 999) return null;
    const clamp = (value, max, fallback) => (
      Number.isInteger(value) && value >= 0 && value <= max ? value : fallback
    );
    const typed = Number(raw.typed), mistakes = Number(raw.mistakes), assisted = Number(raw.assisted);
    return {
      score,
      seconds: Math.round(seconds),
      solved: Math.min(solved, total),
      total,
      completed: !!raw.completed,
      // A client that predates these fields reports nothing, so it is judged on
      // what it solved with no penalties — never on a free win.
      typed: clamp(typed, 999, Math.min(solved, total)),
      mistakes: clamp(mistakes, 9999, 0),
      assisted: clamp(assisted, 999, 0),
    };
  }

  function duelPoints(result) {
    if (!result) return 0;
    const raw = (Number(result.typed) || 0) * DUEL_POINTS.cell
      - (Number(result.seconds) || 0) * DUEL_POINTS.second
      - (Number(result.mistakes) || 0) * DUEL_POINTS.mistake
      - (Number(result.assisted) || 0) * DUEL_POINTS.assisted;
    return Math.max(0, Math.round(raw));
  }

  /**
   * Fair duel verdict: more points wins, and only a dead tie falls back to the
   * clock. The in-game `score` is kept purely as display flavor.
   */
  function compareDuelResults(creatorResult, opponentResult) {
    const a = duelPoints(creatorResult);
    const b = duelPoints(opponentResult);
    if (a !== b) return a > b ? 'creator' : 'opponent';
    const ta = Number(creatorResult && creatorResult.seconds) || 0;
    const tb = Number(opponentResult && opponentResult.seconds) || 0;
    if (ta !== tb) return ta < tb ? 'creator' : 'opponent';
    return 'draw';
  }

  /** Arena view for the creator's list — no board, invites summarized. */
  function publicArena(arena, invites = []) {
    if (!arena) return null;
    const rows = invites || [];
    const finished = rows.filter(i => i.status === 'completed');
    const expired = arenaExpired(arena);
    return {
      id: arena.id,
      category: arena.category,
      language: arena.language,
      size: arena.size,
      closed: !!arena.closed,
      expired,
      created_at: arena.created_at,
      creator_points: duelPoints(arena.creator_result),
      // A result is permanent, so deletion stops being an option the moment one
      // friend finishes. "Close" is the way out from then on.
      can_delete: finished.length === 0,
      can_invite: !arena.closed && !expired && rows.length < DUEL_INVITE_LIMIT,
      invite_slots_left: Math.max(0, DUEL_INVITE_LIMIT - rows.length),
      invites: rows.map(i => ({
        id: i.id,
        opponent_id: i.opponent_id,
        opponent_name: i.opponent_name || '',
        opponent_avatar: i.opponent_avatar || '',
        status: i.status,
        points: i.opponent_result ? duelPoints(i.opponent_result) : null,
        outcome: i.opponent_result ? compareDuelResults(arena.creator_result, i.opponent_result) : null,
        completed_at: i.completed_at || '',
      })),
    };
  }

  /** Flattened invite + arena, shaped like the duel object the client reads. */
  function publicInvite(invite, arena, { withBoard = false } = {}) {
    if (!invite) return null;
    const out = {
      id: invite.id,
      arena_id: invite.arena_id,
      creator_id: arena ? arena.creator_id : '',
      creator_name: arena ? arena.creator_name : '',
      creator_avatar: arena ? arena.creator_avatar : '',
      opponent_id: invite.opponent_id,
      opponent_name: invite.opponent_name || '',
      opponent_avatar: invite.opponent_avatar || '',
      category: arena ? arena.category : 'all',
      language: arena ? arena.language : 'fa',
      size: arena ? arena.size : 0,
      creator_result: arena ? arena.creator_result : null,
      opponent_result: invite.opponent_result || null,
      status: invite.status,
      created_at: invite.created_at,
      completed_at: invite.completed_at || '',
      creator_points: duelPoints(arena && arena.creator_result),
      opponent_points: invite.opponent_result ? duelPoints(invite.opponent_result) : null,
    };
    if (withBoard) out.board = arena ? arena.board : null;
    return out;
  }

  /** Stores an inbox card and pushes it right away when the player is online. */
  async function pushDuelNotification({ userId, senderId, senderName, senderAvatar, type, payload }) {
    try {
      const { data: notif } = await db.createNotification({ user_id: userId, sender_id: senderId, type, payload });
      if (!notif) return null;
      const msg = {
        id: notif.id,
        senderId,
        senderName,
        senderAvatar,
        type,
        payload: notif.payload,
        createdAt: notif.created_at,
      };
      pushPendingNotification(userId, msg);
      sendToUser(userId, { type: 'notification:new', notification: msg });
      return msg;
    } catch (pushErr) {
      logger.warn({ err: pushErr }, '[duel] notification push failed (non-fatal)');
      return null;
    }
  }

  /**
   * Creating an arena posts the board and YOUR result — no friends involved.
   * Inviting happens later, one arena at a time, which is what makes "here is
   * the run I'm proud of" possible.
   */
  app.post('/api/duel/create', async (req, res) => {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ error: 'احراز هویت نشده' });
      if (!(await userThrottle(userId, 'duel-create', 10, 60_000))) {
        return res.status(429).json({ error: 'درخواست بیش از حد. لطفاً کمی صبر کنید.' });
      }

      const body = req.body || {};
      const board = sanitizeDuelBoard(body.board);
      if (!board) return res.status(400).json({ error: 'جدول ارسالی معتبر نیست' });

      const result = sanitizeDuelResult(body.result);
      if (!result) return res.status(400).json({ error: 'نتیجه بازی معتبر نیست' });

      const size = board.grid.length;
      const category = DUEL_CATEGORIES.has(body.category) ? body.category : 'all';
      const language = body.language === 'en' ? 'en' : 'fa';

      const { data: me } = await db.getUser(userId);
      if (!me) return res.status(404).json({ error: 'پروفایل یافت نشد' });
      const score = Number(me.score) || 0;

      const sizeNeed = DUEL_SIZE_UNLOCK[size];
      if (sizeNeed === undefined) return res.status(400).json({ error: 'اندازه جدول نامعتبر است' });
      if (score < sizeNeed) {
        return res.status(403).json({
          error: `برای چالش ${faDigits(size)}×${faDigits(size)} به ${faDigits(sizeNeed)} امتیاز نیاز دارید`,
          need_score: sizeNeed,
        });
      }
      const categoryNeed = DUEL_CATEGORY_UNLOCK[category] ?? 0;
      if (score < categoryNeed) {
        return res.status(403).json({
          error: `دستهٔ «${DUEL_CATEGORY_LABEL[category] || category}» هنوز باز نشده؛ برای باز شدنش ${faDigits(categoryNeed)} امتیاز لازم است`,
          need_score: categoryNeed,
        });
      }

      const liveSince = new Date(Date.now() - DUEL_TTL_MS).toISOString();
      const { data: live } = await db.countLiveDuelArenas(userId, liveSince);
      if ((Number(live) || 0) >= DUEL_ARENA_LIMIT) {
        return res.status(409).json({
          error: `سقف ${faDigits(DUEL_ARENA_LIMIT)} چالش را پر کرده‌اید؛ یکی را حذف کنید یا تا پایان اعتبار چالش‌های قدیمی صبر کنید`,
        });
      }

      const { data: arena, error } = await db.createDuelArena({
        creator_id: userId,
        creator_name: me.username || 'بازیکن',
        creator_avatar: me.avatar_text || '👤',
        category,
        language,
        size,
        board,
        creator_result: result,
      });
      if (error || !arena) {
        logger.error({ err: error || 'no row returned' }, '[duel/create] insert failed');
        return res.status(500).json({ error: 'خطای داخلی سرور' });
      }

      logger.info(`[duel/create] arena=${arena.id} creator=${userId} size=${size} cat=${category} points=${duelPoints(result)}`);
      res.json({ arena: publicArena(arena, []) });
    } catch (e) {
      logger.error({ err: e }, '[duel/create] failed');
      res.status(500).json({ error: 'خطای داخلی سرور' });
    }
  });

  /** One arena, up to five friends, each invited once. */
  app.post('/api/duel/invite', async (req, res) => {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ error: 'احراز هویت نشده' });
      if (!(await userThrottle(userId, 'duel-invite', 20, 60_000))) {
        return res.status(429).json({ error: 'درخواست بیش از حد. لطفاً کمی صبر کنید.' });
      }

      const body = req.body || {};
      const arenaId = String(body.arena_id || body.id || '').trim().slice(0, 64);
      if (!arenaId) return res.status(400).json({ error: 'شناسه چالش لازم است' });

      const { data: arena } = await db.getDuelArena(arenaId);
      if (!arena) return res.status(404).json({ error: 'این چالش پیدا نشد' });
      if (arena.creator_id !== userId) {
        return res.status(403).json({ error: 'فقط سازنده چالش می‌تواند دعوت بفرستد' });
      }
      if (arenaExpired(arena)) return res.status(410).json({ error: 'این چالش منقضی شده است' });
      if (arena.closed) return res.status(409).json({ error: 'این چالش بسته شده و دعوت تازه نمی‌گیرد' });

      const { data: existingRows } = await db.listDuelInvites(arena.id);
      const existing = existingRows || [];
      const alreadyInvited = new Set(existing.map(i => i.opponent_id));
      const slots = DUEL_INVITE_LIMIT - existing.length;
      if (slots <= 0) {
        return res.status(409).json({
          error: `این چالش ${faDigits(DUEL_INVITE_LIMIT)} دعوت را پر کرده است`,
          invite_slots_left: 0,
        });
      }

      const requested = Array.isArray(body.opponent_ids) ? body.opponent_ids : [body.opponent_id];
      const targets = [];
      for (const raw of requested) {
        const target = typeof raw === 'string' ? raw.trim().slice(0, 128) : '';
        if (!target || targets.includes(target) || alreadyInvited.has(target)) continue;
        if (target === userId) return res.status(400).json({ error: 'نمی‌توانید خودتان را دعوت کنید' });
        if (!(await areFriends(userId, target))) {
          return res.status(403).json({ error: 'فقط دوستانتان را می‌توانید دعوت کنید' });
        }
        targets.push(target);
      }
      if (targets.length === 0) {
        return res.status(400).json({
          error: existing.length > 0
            ? 'همهٔ این دوستان قبلاً به این چالش دعوت شده‌اند'
            : 'حداقل یک دوست را انتخاب کنید',
        });
      }
      if (targets.length > slots) {
        return res.status(409).json({
          error: `هر چالش حداکثر ${faDigits(DUEL_INVITE_LIMIT)} دوست را می‌پذیرد؛ ${faDigits(slots)} جای خالی مانده است`,
          invite_slots_left: slots,
        });
      }

      const { data: me } = await db.getUser(userId);
      const created = [];
      for (const opponentId of targets) {
        const { data: opponent } = await db.getUser(opponentId);
        const { data: invite, error } = await db.createDuelInvite({
          arena_id: arena.id,
          opponent_id: opponentId,
          opponent_name: opponent?.username || '',
          opponent_avatar: opponent?.avatar_text || '',
        });
        if (error || !invite) {
          logger.error({ err: error || 'no row returned' }, '[duel/invite] insert failed');
          if (created.length === 0) return res.status(500).json({ error: 'خطای داخلی سرور' });
          break;
        }
        created.push(invite);
        await pushDuelNotification({
          userId: opponentId,
          senderId: userId,
          senderName: me?.username || 'بازیکن',
          senderAvatar: me?.avatar_text || '👤',
          type: 'duel',
          payload: {
            duelId: invite.id,
            arenaId: arena.id,
            fromName: me?.username || 'بازیکن',
            category: arena.category,
            size: arena.size,
            points: duelPoints(arena.creator_result),
          },
        });
      }

      const { data: afterRows } = await db.listDuelInvites(arena.id);
      logger.info(`[duel/invite] arena=${arena.id} creator=${userId} sent=${created.length}/${targets.length}`);
      res.json({
        arena: publicArena(arena, afterRows || []),
        invited: created.map(i => i.opponent_id),
      });
    } catch (e) {
      logger.error({ err: e }, '[duel/invite] failed');
      res.status(500).json({ error: 'خطای داخلی سرور' });
    }
  });

  app.post('/api/duel/accept', async (req, res) => {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ error: 'احراز هویت نشده' });
      // An invitation is always addressed to one friend, so its id from the inbox
      // card is enough — there is no code to type.
      const id = String((req.body && (req.body.duel_id || req.body.id)) || '').trim().slice(0, 64);
      if (!id) return res.status(400).json({ error: 'شناسه دعوت لازم است' });

      const { data: invite } = await db.getDuelInvite(id);
      if (!invite) return res.status(404).json({ error: 'این دعوت حذف یا منقضی شده است' });
      if (invite.opponent_id !== userId) return res.status(403).json({ error: 'این دعوت برای شما نبود' });

      const { data: arena } = await db.getDuelArena(invite.arena_id);
      if (!arena) return res.status(404).json({ error: 'چالش این دعوت حذف شده است' });

      if (invite.status === 'completed') {
        return res.json({ duel: publicInvite(invite, arena, { withBoard: true }) });
      }
      if (invite.status !== 'open' && invite.status !== 'playing') {
        return res.status(409).json({ error: 'این دعوت دیگر در دسترس نیست' });
      }
      // A run that was already started is allowed to finish; only a new claim
      // on a dead arena is refused.
      if (invite.status === 'open' && arenaExpired(arena)) {
        return res.status(410).json({ error: 'این چالش منقضی شده است' });
      }

      let current = invite;
      if (invite.status === 'open') {
        const { data: me } = await db.getUser(userId);
        const { data: claimed, error } = await db.claimDuelInvite(
          invite.id, userId, me?.username || 'بازیکن', me?.avatar_text || '👤'
        );
        if (error || !claimed) return res.status(409).json({ error: 'پذیرش این دعوت ممکن نشد' });
        current = claimed;
      }

      res.json({ duel: publicInvite(current, arena, { withBoard: true }) });
    } catch (e) {
      logger.error({ err: e }, '[duel/accept] failed');
      res.status(500).json({ error: 'خطای داخلی سرور' });
    }
  });

  /**
   * Delete a whole arena you own. Only while it has no result: as soon as one
   * friend finishes, those numbers belong to both players and stay forever —
   * from then on the creator can only «بستن» it.
   */
  app.post('/api/duel/delete', async (req, res) => {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ error: 'احراز هویت نشده' });
      if (!(await userThrottle(userId, 'duel-delete', 20, 60_000))) {
        return res.status(429).json({ error: 'درخواست بیش از حد. لطفاً کمی صبر کنید.' });
      }
      const arenaId = String((req.body && (req.body.arena_id || req.body.id)) || '').trim().slice(0, 64);
      if (!arenaId) return res.status(400).json({ error: 'شناسه چالش لازم است' });

      const { data: arena } = await db.getDuelArena(arenaId);
      if (!arena) return res.status(404).json({ error: 'این چالش پیدا نشد' });
      if (arena.creator_id !== userId) {
        return res.status(403).json({ error: 'فقط سازنده چالش می‌تواند آن را حذف کند' });
      }

      const { data: rows } = await db.listDuelInvites(arena.id);
      const invites = rows || [];
      if (invites.some(i => i.status === 'completed')) {
        return res.status(409).json({
          error: 'این چالش نتیجه دارد و حذف نمی‌شود؛ ببندیدش تا رکوردها بمانند',
          code: 'arena_has_results',
        });
      }

      await db.deleteDuelInvitesOfArena(arena.id);
      await db.deleteDuelArena(arena.id);
      let removedNotifications = 0;
      for (const invite of invites) {
        removedNotifications += await dropDuelNotifications(invite.opponent_id, invite.id);
      }

      logger.info(`[duel/delete] arena=${arena.id} creator=${userId} invites=${invites.length} inbox=${removedNotifications}`);
      res.json({ ok: true, removedNotifications });
    } catch (e) {
      logger.error({ err: e }, '[duel/delete] failed');
      res.status(500).json({ error: 'خطای داخلی سرور' });
    }
  });

  /** Stop taking new invitations. Everything already inside stays playable. */
  app.post('/api/duel/close', async (req, res) => {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ error: 'احراز هویت نشده' });
      const arenaId = String((req.body && (req.body.arena_id || req.body.id)) || '').trim().slice(0, 64);
      if (!arenaId) return res.status(400).json({ error: 'شناسه چالش لازم است' });

      const { data: arena } = await db.getDuelArena(arenaId);
      if (!arena) return res.status(404).json({ error: 'این چالش پیدا نشد' });
      if (arena.creator_id !== userId) {
        return res.status(403).json({ error: 'فقط سازنده چالش می‌تواند آن را ببندد' });
      }

      const { data: closed, error } = await db.closeDuelArena(arena.id);
      if (error) return res.status(500).json({ error: 'خطای داخلی سرور' });
      const { data: rows } = await db.listDuelInvites(arena.id);
      logger.info(`[duel/close] arena=${arena.id} creator=${userId} invites=${(rows || []).length}`);
      res.json({ arena: publicArena(closed || arena, rows || []) });
    } catch (e) {
      logger.error({ err: e }, '[duel/close] failed');
      res.status(500).json({ error: 'خطای داخلی سرور' });
    }
  });

  app.post('/api/duel/result', async (req, res) => {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ error: 'احراز هویت نشده' });
      const inviteId = String((req.body && (req.body.id || req.body.duel_id)) || '').trim();
      if (!inviteId) return res.status(400).json({ error: 'شناسه دعوت لازم است' });

      const result = sanitizeDuelResult(req.body && req.body.result);
      if (!result) return res.status(400).json({ error: 'نتیجه بازی معتبر نیست' });

      const { data: invite } = await db.getDuelInvite(inviteId);
      // The creator may delete an untouched arena while a friend is replaying
      // it, so say what actually happened instead of a bare "not found".
      if (!invite) return res.status(404).json({ error: 'این دعوت حذف شده است' });
      if (invite.opponent_id !== userId) return res.status(403).json({ error: 'شما در این دوئل شرکت نکرده‌اید' });

      const { data: arena } = await db.getDuelArena(invite.arena_id);
      if (!arena) return res.status(404).json({ error: 'چالش این دعوت حذف شده است' });

      if (invite.status === 'completed') {
        const outcome = compareDuelResults(arena.creator_result, invite.opponent_result);
        return res.json({
          duel: publicInvite(invite, arena),
          // Same field meanings as the settle path below: `points` is always the
          // caller's verdict score, `opponentPoints` the creator's.
          points: duelPoints(invite.opponent_result),
          opponentPoints: duelPoints(arena.creator_result),
          outcome: outcome === 'creator' ? 'loss' : outcome === 'opponent' ? 'win' : 'draw',
          reward: outcome === 'opponent' ? DUEL_COINS.win : outcome === 'draw' ? DUEL_COINS.draw : DUEL_COINS.loss,
          alreadyCompleted: true,
        });
      }
      if (invite.status !== 'playing') return res.status(409).json({ error: 'این دوئل در حال انجام نیست' });

      const { data: done, error } = await db.completeDuelInvite(invite.id, userId, result);
      if (error || !done) return res.status(409).json({ error: 'ثبت نتیجه ممکن نشد — دوباره تلاش کنید' });

      const outcome = compareDuelResults(arena.creator_result, done.opponent_result);
      const opponentGain = outcome === 'opponent' ? DUEL_COINS.win : outcome === 'draw' ? DUEL_COINS.draw : DUEL_COINS.loss;
      const creatorGain = outcome === 'creator' ? DUEL_COINS.win : outcome === 'draw' ? DUEL_COINS.draw : DUEL_COINS.loss;
      let opponentCoins = null, creatorCoins = null;
      try {
        await db.markDuelInviteRewarded(done.id);
        const { data: paidOpponent } = await db.addCoins(userId, opponentGain, MAX_COINS);
        if (paidOpponent) opponentCoins = paidOpponent.coins;
        const { data: paidCreator } = await db.addCoins(arena.creator_id, creatorGain, MAX_COINS);
        if (paidCreator) creatorCoins = paidCreator.coins;

        if (outcome !== 'draw') {
          await pushDuelNotification({
            userId: arena.creator_id,
            senderId: userId,
            senderName: done.opponent_name || 'بازیکن',
            senderAvatar: done.opponent_avatar || '👤',
            type: 'duel_result',
            payload: {
              duelId: done.id,
              arenaId: arena.id,
              outcome: outcome === 'creator' ? 'win' : 'loss',
              opponentName: done.opponent_name || 'بازیکن',
              creatorScore: arena.creator_result?.score ?? 0,
              opponentScore: done.opponent_result?.score ?? 0,
              creatorPoints: duelPoints(arena.creator_result),
              opponentPoints: duelPoints(done.opponent_result),
              rewardCoins: creatorGain,
            },
          });
        }
      } catch (payErr) {
        logger.error({ err: payErr }, '[duel/result] payout failed');
      }

      // Replaying someone's board is a real game: it earns XP and clears the
      // "play a duel challenge" quest. The creator already earned theirs when
      // they played the arena's source run.
      let progress = null;
      try {
        progress = await grantProgress(userId, { xp: progression.XP.duel, questTypes: ['duel'] });
      } catch (e) {
        logger.warn('[duel/result] progress grant failed:', e.message);
      }

      logger.info(`[duel/result] invite=${done.id} opponent=${userId} outcome=${outcome} points=${duelPoints(done.opponent_result)}:${duelPoints(arena.creator_result)}`);
      res.json({
        duel: publicInvite(done, arena),
        outcome: outcome === 'creator' ? 'loss' : outcome === 'opponent' ? 'win' : 'draw',
        points: duelPoints(done.opponent_result),
        opponentPoints: duelPoints(arena.creator_result),
        coins: opponentCoins,
        reward: opponentGain,
        creatorCoins,
        ...(progress ? { progress } : {}),
      });
    } catch (e) {
      logger.error({ err: e }, '[duel/result] failed');
      res.status(500).json({ error: 'خطای داخلی سرور' });
    }
  });

  app.get('/api/duel/list', async (req, res) => {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ error: 'احراز هویت نشده' });

      const { data: arenaRows } = await db.listDuelArenas(userId);
      const arenas = [];
      for (const arena of arenaRows || []) {
        const { data: rows } = await db.listDuelInvites(arena.id);
        arenas.push(publicArena(arena, rows || []));
      }

      const { data: incomingRows } = await db.listIncomingDuels(userId);
      const incoming = [];
      for (const invite of incomingRows || []) {
        const { data: arena } = await db.getDuelArena(invite.arena_id);
        if (!arena) continue;
        // An unanswered invitation from a dead arena would only fail on accept;
        // the sweep removes it shortly.
        if (invite.status === 'open' && arenaExpired(arena)) continue;
        incoming.push(publicInvite(invite, arena));
      }

      const { data: playedRows } = await db.listPlayedDuels(userId);
      const results = [];
      for (const invite of playedRows || []) {
        const { data: arena } = await db.getDuelArena(invite.arena_id);
        if (!arena) continue;
        results.push(publicInvite(invite, arena));
      }

      res.json({ arenas, incoming, results });
    } catch (e) {
      logger.error({ err: e }, '[duel/list] failed');
      res.status(500).json({ error: 'خطای داخلی سرور' });
    }
  });

  // ─── MULTIPLAYER LEAVE ────────────────────────────────
  app.post('/api/player-left', async (req, res) => {
    try {
      const { roomId, playerId } = req.body;
      if (!roomId || !playerId) return res.status(400).json({ error: 'roomId and playerId required' });
      // Bind identity to the authenticated session when available, so a third
      // party cannot forge a "player_left" for an opponent (→ false win).
      if (req.userId && playerId !== req.userId) {
        return res.status(403).json({ error: 'playerId mismatch' });
      }
      const effectiveId = req.userId || playerId;
      const channelName = `room_${roomId}`;
      const members = wsChannels.get(channelName);
      const room = await roomGet(roomId);
      const isParticipant =
        (!!room && (room.hostId === effectiveId || room.joinerId === effectiveId)) ||
        (!!members && Array.from(members).some(m => m.userId === effectiveId));
      if (!isParticipant) {
        return res.status(403).json({ error: 'not a participant of this room' });
      }
      if (members) {
        Array.from(members).forEach(m => {
          if (m.userId !== effectiveId && m.ws?.readyState === 1) {
            try {
              m.ws.send(JSON.stringify({
                type: 'channel:event',
                channel: channelName,
                event: 'player_left',
                payload: { playerId: effectiveId },
                senderId: effectiveId,
              }));
            } catch (e) { console.warn('broadcast player_left failed:', e?.message); }
          }
        });
      }
      res.json({ ok: true });
    } catch (e) {
      res.status(500).json({ error: 'خطای داخلی سرور' });
    }
  });

  // ─── START ────────────────────────────────────────────
  setupWebSocket(server);
  return { app, server };
}

if (require.main === module) {
  createApp()
    .then(({ server }) => {
      server.listen(PORT, () => {
        logger.info(`✅ Crossword Local Server running on port ${PORT} (RATE_LIMIT=${RATE_LIMIT})`);
      });
    })
    .catch(e => {
      logger.error('❌ Failed to start:', e);
      process.exit(1);
    });
}

module.exports = { createApp };

