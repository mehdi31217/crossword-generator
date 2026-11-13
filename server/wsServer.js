const { WebSocketServer } = require('ws');
const crypto = require('crypto');
const { validateToken } = require('./middleware/sessionAuth');
const logger = require('./utils/logger');
const redis = require('./redis');

// Unique id for THIS server process. Used to tag Redis broadcasts so an
// instance can ignore the echo of its own messages while still accepting
// messages from every other instance (needed for PM2 cluster mode).
const INSTANCE_ID = `${process.pid}-${crypto.randomBytes(6).toString('hex')}`;

// Store: channel -> Set<{ ws, userId, data }>
const channels = new Map();

// ─── Per-room replay cache ────────────────────────────────────────────────
// A room broadcast is fire-and-forget: if the peer has not finished joining
// (or its socket is mid-reconnect) the message is simply gone, and nothing in
// the protocol asks for it again. Observed symptom: one ranked player completes
// the merge and receives a grid while the other sits on "connecting to
// opponent" forever, because it missed `player_preference` / `player_joined`.
//
// Keep the small, idempotent facts a room needs — each player's preference, the
// decided merge, and the generated grid — so they can be replayed to anyone who
// joins late or asks for a sync. All of it is scoped to `room_*` channels and
// dropped the moment the channel empties.
const roomPreferences = new Map();   // channelName -> Map<userId, preference>
const roomMergeResults = new Map();  // channelName -> coin_flip_result payload
const roomStartGames = new Map();    // channelName -> start_game payload
const roomHeartbeats = new Map();    // channelName -> interval
const ROOM_HEARTBEAT_MS = 4000;

// Minimum `proto` a room member must send on channel:join. A lower/missing value
// means that browser is running a pre-handshake bundle: it never broadcasts
// player_preference / merge_ack, so the room can never converge and the other
// player waits forever. Logged (the peer detects it client-side and bails out).
const MIN_PROTOCOL_VERSION = 3;

function logProtocolMismatch(channelName, members) {
  if (!isRoomChannel(channelName)) return;
  const versions = new Map();
  for (const m of members) {
    if (m.userId) versions.set(m.userId, Number(m.data?.proto) || 0);
  }
  if (versions.size < 2) return;
  const newest = Math.max(...versions.values());
  for (const [userId, v] of versions) {
    if (v < newest) {
      logger.warn(`[WS] room="${channelName}": user="${userId}" is on stale protocol v${v} (peer v${newest}, min v${MIN_PROTOCOL_VERSION}) — room cannot synchronize`);
    }
  }
}

function isRoomChannel(channelName) {
  return typeof channelName === 'string' && channelName.startsWith('room_');
}

function clearRoomCache(channelName) {
  roomPreferences.delete(channelName);
  roomMergeResults.delete(channelName);
  roomStartGames.delete(channelName);
  const timer = roomHeartbeats.get(channelName);
  if (timer) {
    clearInterval(timer);
    roomHeartbeats.delete(channelName);
  }
}

/** Presence message carrying the room's replayable state alongside the member list. */
function buildPresenceMessage(channelName) {
  const prefs = roomPreferences.get(channelName);
  return {
    type: 'presence_sync',
    channel: channelName,
    users: getChannelUsers(channelName),
    preferences: prefs ? Array.from(prefs.values()) : [],
    mergeResult: roomMergeResults.get(channelName) || null,
  };
}

/**
 * Room presence heartbeat. presence_sync used to be sent exactly once per join;
 * a single dropped frame (or a peer subscribing a heartbeat later) left that
 * side convinced it was alone. Repeating it keeps the lobby self-healing.
 */
function ensureRoomHeartbeat(channelName) {
  if (!isRoomChannel(channelName) || roomHeartbeats.has(channelName)) return;
  const timer = setInterval(() => {
    const members = channels.get(channelName);
    if (!members || members.size === 0) {
      clearRoomCache(channelName);
      return;
    }
    // Once the grid is out, membership changes are reported by player_left;
    // the pre-game heartbeat is no longer needed.
    if (roomStartGames.has(channelName)) {
      const t = roomHeartbeats.get(channelName);
      if (t) clearInterval(t);
      roomHeartbeats.delete(channelName);
      return;
    }
    broadcastToChannel(channelName, buildPresenceMessage(channelName));
  }, ROOM_HEARTBEAT_MS);
  if (timer.unref) timer.unref();
  roomHeartbeats.set(channelName, timer);
}

// Store: ws -> Set<channelName>
const clientChannels = new Map();

// Store: ws -> { userId, token }
const authenticatedClients = new Map();

// Store pending notifications per userId for re-delivery on reconnect
// userId -> notification[]
const pendingNotifications = new Map();
const MAX_PENDING_NOTIFS = 20;

/**
 * Store a notification for later re-delivery when the user reconnects.
 * Caps the per-user backlog at MAX_PENDING_NOTIFS (newest kept).
 */
function pushPendingNotification(userId, notif) {
  if (!userId || !notif) return;
  if (!pendingNotifications.has(userId)) pendingNotifications.set(userId, []);
  const arr = pendingNotifications.get(userId);
  arr.push(notif);
  if (arr.length > MAX_PENDING_NOTIFS) arr.splice(0, arr.length - MAX_PENDING_NOTIFS);
}

// Reverse-index for O(1) sendToUser lookup: userId -> Set<{ ws, channelName }>
const userChannelMap = new Map();

// Direct socket index: userId -> Set<ws>. Populated on auth, so a connected
// user can receive direct messages even before joining any channel
// (e.g. a host waiting in the matchmaking queue).
const userSockets = new Map();

// Grace period before broadcasting player_left after WS disconnect (5000ms)
const LEAVE_GRACE_PERIOD = 5000;
// Store: userId -> { timers: Map<channelName, timeout>, channels: Set<channelName> }
const pendingLeaves = new Map();

// Redis channel prefix for cross-instance room broadcasts
const REDIS_WS_PREFIX = 'ws:room:';

// ─── WS Rate Limiting ──────────────────────────────────────────
// Track message timestamps per userId for sliding-window rate limiting.
// Prevents a single client from flooding the server with messages.
//
// There are TWO independent buckets: a general one, and a far more generous one
// for game-critical room broadcasts. A single shared bucket was a correctness
// bug, not just a throttle: a fast player spends the whole general allowance on
// `progress` updates (one per correct letter), and the excess is dropped with no
// error to the sender — so the Eraser's `cell_reset` could silently never reach
// the opponent, leaving the attacker's board cleared and the victim's untouched.
const WS_RATE_WINDOW_MS = 10_000;     // 10-second window
const WS_RATE_MAX_MSGS = 60;          // max 60 general messages per window
const WS_RATE_MAX_CRITICAL = 240;     // max 240 game-critical messages per window
const wsRateMap = new Map();          // userId -> number[] of timestamps
const wsCriticalRateMap = new Map();  // userId -> number[] of timestamps

// Room broadcasts that carry game state. These use the critical bucket, so they
// can never be starved by ordinary traffic. Still capped, so a hostile client
// cannot use them as an unlimited flood channel.
const CRITICAL_WS_EVENTS = new Set([
  'cell_reset',
  'cell_fill',
  'attack',
  'word_solved',
  'game_over',
  'player_left',
  'start_game',
  'merge_ack',
  'coin_flip_result',
  'player_preference',
  'request_game_data',
  'player_joined',
  'generating_status',
]);

function checkWsRateLimit(userId, isCritical = false) {
  if (!userId) return true; // allow unauthenticated
  const now = Date.now();
  const cutoff = now - WS_RATE_WINDOW_MS;
  const map = isCritical ? wsCriticalRateMap : wsRateMap;
  const max = isCritical ? WS_RATE_MAX_CRITICAL : WS_RATE_MAX_MSGS;
  let timestamps = map.get(userId);
  if (!timestamps) {
    timestamps = [];
    map.set(userId, timestamps);
  }
  // Remove expired entries
  while (timestamps.length > 0 && timestamps[0] < cutoff) timestamps.shift();
  if (timestamps.length >= max) {
    logger.warn({ userId, isCritical }, `WS rate limit exceeded (${timestamps.length}/${max})`);
    return false;
  }
  timestamps.push(now);
  return true;
}

// Clean stale entries every minute
setInterval(() => {
  const cutoff = Date.now() - WS_RATE_WINDOW_MS;
  for (const map of [wsRateMap, wsCriticalRateMap]) {
    for (const [userId, timestamps] of map) {
      while (timestamps.length > 0 && timestamps[0] < cutoff) timestamps.shift();
      if (timestamps.length === 0) map.delete(userId);
    }
  }
}, 60_000);

// ─── Cross-instance direct messaging ──────────────────────
// sendToUser() can only see sockets attached to THIS process. If a user is
// connected to a different instance (PM2 cluster / multiple nodes) the message
// would be silently dropped. To fix that we publish direct messages on a shared
// Redis channel; every instance listens and delivers the message if it happens
// to hold that user's socket.
//
// Presence is mirrored the same way, so sendToUser can still distinguish
// "user is offline" from "user is connected elsewhere" — callers rely on that
// to queue a pending notification instead of losing it.
const REDIS_DIRECT_CHANNEL = 'ws:direct';       // direct-message delivery
const REDIS_PRESENCE_CHANNEL = 'ws:presence';   // online/offline announcements
const PRESENCE_STALE_MS = 180_000;              // forget a mirror entry after 3min

// userId -> { instanceId, ts } for users connected to ANOTHER instance
const remoteOnline = new Map();

function announcePresence(userId, online) {
  if (!userId) return;
  try {
    redis.publish(REDIS_PRESENCE_CHANNEL, {
      type: 'presence',
      userId,
      online,
      instanceId: INSTANCE_ID,
      _origin: INSTANCE_ID,
    }).catch(() => {});
  } catch (e) { /* ignore */ }
}

// Drop mirror entries that went stale (e.g. an instance died without saying bye)
setInterval(() => {
  const cutoff = Date.now() - PRESENCE_STALE_MS;
  for (const [userId, entry] of remoteOnline) {
    if (entry.ts < cutoff) remoteOnline.delete(userId);
  }
}, 60_000);

// ─── Cross-instance channel membership (presence lists) ───
// broadcastToChannel() already reaches members on other instances via Redis,
// but getChannelUsers() only saw THIS process, so a room split across workers
// produced an incomplete player list (each side saw only its own members).
// Each instance publishes its share of every channel; everyone mirrors the
// rest and getChannelUsers() merges local + remote.
const REDIS_CHANPRESENCE_CHANNEL = 'ws:chanpresence';
const CHAN_PRESENCE_STALE_MS = 120_000;   // forget a mirrored channel share after 2min
const CHAN_PRESENCE_HEARTBEAT_MS = 30_000; // re-announce so new/failed instances converge

// channelName -> Map<instanceId, { members: PlayerData[], ts }>
const remoteChannelMembers = new Map();

function publishChannelPresence(channelName) {
  if (!channelName) return;
  const members = channels.get(channelName);
  const list = members
    ? Array.from(members).filter(m => m.ws.readyState === 1).map(m => m.data)
    : [];
  try {
    redis.publish(REDIS_CHANPRESENCE_CHANNEL, {
      type: 'chanpresence',
      channel: channelName,
      instanceId: INSTANCE_ID,
      members: list,
      _origin: INSTANCE_ID,
    }).catch(() => {});
  } catch (e) { /* ignore */ }
}

// Re-announce every channel so mirrors survive a missed event or a new worker.
setInterval(() => {
  for (const channelName of channels.keys()) publishChannelPresence(channelName);
}, CHAN_PRESENCE_HEARTBEAT_MS);

// Sweep shares from instances that vanished without leaving.
setInterval(() => {
  const cutoff = Date.now() - CHAN_PRESENCE_STALE_MS;
  for (const [channelName, byInstance] of remoteChannelMembers) {
    for (const [instanceId, entry] of byInstance) {
      if (entry.ts < cutoff) byInstance.delete(instanceId);
    }
    if (byInstance.size === 0) remoteChannelMembers.delete(channelName);
  }
}, 60_000);

/** Local members + every other instance's mirrored share of this channel. */
function getChannelUsers(channelName) {
  const members = channels.get(channelName);
  const out = members ? Array.from(members).map(m => m.data) : [];
  const byInstance = remoteChannelMembers.get(channelName);
  if (!byInstance) return out;

  const seen = new Set(out.map(u => u && u.id).filter(Boolean));
  const cutoff = Date.now() - CHAN_PRESENCE_STALE_MS;
  for (const [instanceId, entry] of byInstance) {
    if (entry.ts < cutoff) { byInstance.delete(instanceId); continue; }
    for (const u of entry.members) {
      if (u && u.id && !seen.has(u.id)) { seen.add(u.id); out.push(u); }
    }
  }
  return out;
}

function broadcastToChannel(channelName, message, excludeWs = null) {
  const members = channels.get(channelName);
  if (!members) return;
  const msg = JSON.stringify(message);
  members.forEach(m => {
    if (m.ws !== excludeWs && m.ws.readyState === 1) {
      m.ws.send(msg);
    }
  });
  // Also publish to Redis for cross-instance delivery
  if (channelName && message) {
    redis.publish(`${REDIS_WS_PREFIX}${channelName}`, {
      type: 'channel:event',
      channel: channelName,
      event: message.event || message.type,
      payload: message.payload || message,
      senderId: message.senderId,
      _origin: INSTANCE_ID,
    }).catch(() => {});
  }
}

function sendToUser(userId, message) {
  const msg = JSON.stringify(message);
  // 0) Prefer the user's SOCIAL socket — the one that joined `global_social`.
  //    A user can hold several sockets at once (one per joined room), and only
  //    the social one has a client handler for USER-LEVEL notifications
  //    (`matchmaking:matched`, `challenge:*`, `friend:*`, `message:*`,
  //    `notification:new`). A room socket's LocalChannel silently ignores them.
  //    Picking an arbitrary "first open" socket therefore dropped the message
  //    whenever a stale room socket happened to come first — which is how a
  //    ranked match could be reported "delivered" while the host never received
  //    `matchmaking:matched` and sat on "waiting for opponent" forever.
  //    `clientChannels` is already maintained by joinChannel/removeClient, so
  //    no extra bookkeeping is needed here.
  const sockets = userSockets.get(userId);
  if (sockets) {
    for (const ws of sockets) {
      if (ws.readyState === 1 && clientChannels.get(ws)?.has('global_social')) {
        ws.send(msg);
        return true;
      }
    }
    // 1) Direct authenticated socket — works even if the user has not joined any
    //    channel yet (e.g. waiting in the matchmaking queue, or receiving a
    //    challenge notification right after connecting).
    for (const ws of sockets) {
      if (ws.readyState === 1) {
        ws.send(msg);
        return true;
      }
    }
  }
  // 2) Channel reverse-index — same preference: a global_social entry first.
  const entries = userChannelMap.get(userId);
  if (entries) {
    for (const entry of entries) {
      if (entry.ws.readyState === 1 && entry.channelName === 'global_social') {
        entry.ws.send(msg);
        return true;
      }
    }
    for (const entry of entries) {
      if (entry.ws.readyState === 1) {
        entry.ws.send(msg);
        return true;
      }
    }
  }
  // Fallback: scan all channels (shouldn't normally happen if userChannelMap is correct)
  for (const [channelName, members] of channels) {
    for (const member of members) {
      if (member.userId === userId && member.ws.readyState === 1) {
        logger.warn(`[WS] sendToUser: user="${userId}" found by scan but missing from userChannelMap — sync issue`);
        member.ws.send(msg);
        return true;
      }
    }
  }
  // 3) Not here — the user may be connected to another server instance.
  //    Publish on the shared channel; whichever instance holds the socket
  //    delivers it. The presence mirror tells us whether anyone holds it at
  //    all, so a genuinely offline user still reports false (→ caller queues
  //    a pending notification instead of silently losing the message).
  const remote = remoteOnline.get(userId);
  if (remote && Date.now() - remote.ts < PRESENCE_STALE_MS) {
    try {
      redis.publish(REDIS_DIRECT_CHANNEL, {
        ...message,
        _target: userId,
        _origin: INSTANCE_ID,
      }).catch(() => {});
      return true;
    } catch (e) { /* ignore */ }
  }
  return false;
}

/** Deliver a message that arrived from another instance (via Redis). */
function deliverRemoteDirect(target, message) {
  const sockets = userSockets.get(target);
  if (sockets) {
    for (const ws of sockets) {
      if (ws.readyState === 1) { ws.send(JSON.stringify(message)); return true; }
    }
  }
  const entries = userChannelMap.get(target);
  if (entries) {
    for (const entry of entries) {
      if (entry.ws.readyState === 1) { entry.ws.send(JSON.stringify(message)); return true; }
    }
  }
  return false;
}

/**
 * Retry sendToUser with exponential backoff.
 * Returns a promise that resolves to true if delivered, false after all retries fail.
 */
function sendToUserWithRetry(userId, message, maxRetries = 5, baseDelayMs = 1000) {
  return new Promise((resolve) => {
    let attempt = 0;
    function trySend() {
      attempt++;
      if (sendToUser(userId, message)) {
        resolve(true);
        return;
      }
      if (attempt < maxRetries) {
        const delay = baseDelayMs * Math.pow(1.5, attempt - 1); // 1s, 1.5s, 2.25s, 3.375s, 5.062s
        setTimeout(trySend, delay);
      } else {
        // User may be transiently offline or in-between reconnects — buffer for immediate delivery on auth/reconnect
        pushPendingNotification(userId, message);
        logger.info(`[WS] sendToUserWithRetry: user="${userId}" offline after ${maxRetries} attempts — buffered message (type=${message.type}) for reconnect`);
        resolve(false);
      }
    }
    trySend();
  });
}

function cancelPendingLeave(userId, channelName) {
  const pending = pendingLeaves.get(userId);
  if (!pending) return false;
  if (pending.timers.has(channelName)) {
    clearTimeout(pending.timers.get(channelName));
    pending.timers.delete(channelName);
    pending.channels.delete(channelName);
    if (pending.timers.size === 0) pendingLeaves.delete(userId);
    return true;
  }
  return false;
}

/**
 * Record the first `game_over` claim for a multiplayer room.
 *
 * This is the arbitration record the arena pot is paid against. The client that
 * finishes first broadcasts `game_over` with its own id as the winner
 * (`multiplayer.signalWin(player.id, …)`), and `useWinHandler` only sends it
 * when the local player actually completed the grid — so the FIRST claim is the
 * best signal the server has about who won.
 *
 * Two rules make it trustworthy:
 *   1. The claimer is the *authenticated socket* identity — never the
 *      client-supplied `msg.senderId` or `payload.winnerId`, both forgeable.
 *   2. The claimer must actually be a participant of that room.
 *
 * Stored as `arena:finish:<roomId>` (1h TTL). Only the first writer wins, so a
 * losing client shouting "I won" afterwards is ignored. Never throws.
 */
async function recordGameOver(channelName, authUserId, payload) {
  try {
    if (!channelName || !channelName.startsWith('room_') || !authUserId) return;
    const roomId = channelName.slice('room_'.length);
    if (!roomId) return;

    const raw = await redis.get(`room:reg:${roomId}`);
    if (!raw) return; // unknown room — nothing to arbitrate
    let room = null;
    try { room = JSON.parse(raw); } catch { return; }
    if (!room) return;
    if (authUserId !== room.hostId && authUserId !== room.joinerId) {
      logger.warn(`[WS] ignoring game_over from non-participant ${authUserId} in room ${roomId}`);
      return;
    }

    const claimed = await redis.setIfNotExists(`arena:finish:${roomId}`, {
      winnerId: authUserId, // authenticated sender, NOT payload.winnerId
      claimedWinnerId: payload?.winnerId ? String(payload.winnerId) : null,
      winnerScore: Number(payload?.winnerScore) || 0,
      winnerTime: Number(payload?.winnerTime) || 0,
      at: Date.now(),
    }, 3600);
    if (claimed === true) {
      logger.info(`[WS] arena finish recorded: room=${roomId} winner=${authUserId}`);
    }
  } catch (e) {
    logger.warn('[WS] recordGameOver failed:', e?.message);
  }
}

function setupWebSocket(server) {
  const wss = new WebSocketServer({ server });

  // ─── Redis: subscribe to cross-instance room broadcasts ───
  const redisSubscriptions = new Map(); // channel -> unsubscribe fn

  function subscribeRedis(channelName) {
    if (redisSubscriptions.has(channelName)) return;
    const redisChannel = `${REDIS_WS_PREFIX}${channelName}`;
    const unsub = redis.subscribe(redisChannel, (msg, _redisChannel) => {
      // Ignore the echo of our OWN broadcast (local members already received it
      // directly). Messages from other instances carry a different _origin and
      // MUST be forwarded — that is the whole point of cross-instance delivery.
      if (msg && msg._origin === INSTANCE_ID) return;
      const members = channels.get(channelName);
      if (!members) return;
      const payload = typeof msg === 'string' ? JSON.parse(msg) : msg;
      const str = JSON.stringify(payload);
      members.forEach(m => {
        if (m.ws.readyState === 1) m.ws.send(str);
      });
    });
    redisSubscriptions.set(channelName, unsub);
  }

  function unsubscribeRedis(channelName) {
    const unsub = redisSubscriptions.get(channelName);
    if (unsub) {
      unsub();
      redisSubscriptions.delete(channelName);
    }
  }

  // ─── Redis: cross-instance direct messages + presence mirror ───
  // One shared channel for direct messages (every instance listens, only the
  // one holding the socket delivers) and one for online/offline announcements.
  redis.subscribe(REDIS_PRESENCE_CHANNEL, (msg) => {
    if (!msg || msg._origin === INSTANCE_ID) return;
    if (msg.online) {
      remoteOnline.set(msg.userId, { instanceId: msg.instanceId, ts: Date.now() });
    } else {
      remoteOnline.delete(msg.userId);
    }
  });

  redis.subscribe(REDIS_DIRECT_CHANNEL, (msg) => {
    // Own messages are already delivered locally — ignore the echo.
    if (!msg || msg._origin === INSTANCE_ID) return;
    const target = msg._target;
    if (!target) return;
    const { _target, _origin, ...clean } = msg;
    if (!deliverRemoteDirect(target, clean)) {
      logger.warn(`[WS] cross-instance message for "${target}" had no local socket`);
    }
  });

  redis.subscribe(REDIS_CHANPRESENCE_CHANNEL, (msg) => {
    if (!msg || msg._origin === INSTANCE_ID || !msg.channel) return;
    let byInstance = remoteChannelMembers.get(msg.channel);
    if (!byInstance) {
      byInstance = new Map();
      remoteChannelMembers.set(msg.channel, byInstance);
    }
    if (!msg.members || msg.members.length === 0) byInstance.delete(msg.instanceId);
    else byInstance.set(msg.instanceId, { members: msg.members, ts: Date.now() });

    // Refresh OUR members with the now-complete list. Delivered locally only —
    // publishing here would make the instances ping-pong forever.
    const localMembers = channels.get(msg.channel);
    if (localMembers && localMembers.size) {
      const str = JSON.stringify(buildPresenceMessage(msg.channel));
      for (const m of localMembers) {
        if (m.ws.readyState === 1) { try { m.ws.send(str); } catch (e) { /* ignore */ } }
      }
    }
  });

  function joinChannel(ws, channelName, data) {
    // A client's FIRST join is allowed to arrive without an identity
    // (LocalChannel sends `data: this.userData`, which is still undefined at that
    // point — `track()` fills it in). If that follow-up is ever lost, the member
    // is registered as `undefined` forever, and because BOTH players then share
    // the key "undefined" the second join evicts the first: the channel ends up
    // with ONE member, presence never shows an opponent, and both sides sit on
    // "waiting for opponent" (observed live 2026-10-23, room_910904 — each room
    // socket joined exactly once, as user="undefined").
    // The socket's authenticated identity is authoritative, so use it whenever
    // the client supplied none. Guests (no auth) keep the previous behaviour.
    if (ws && (!data || !data.id)) {
      const authInfo = authenticatedClients.get(ws);
      if (authInfo && authInfo.userId) {
        data = { ...(data || {}), id: authInfo.userId };
      }
    }
    const beforeSize = channels.has(channelName) ? channels.get(channelName).size : 0;
    logger.info(`[WS] joinChannel: channel="${channelName}" user="${data.id}" name="${data.name}" membersBefore=${beforeSize} totalChannels=${channels.size}`);

    if (!channels.has(channelName)) {
      channels.set(channelName, new Set());
    }
    const members = channels.get(channelName);

    // Cancel any pending leave for this user+channel (grace period reconnection)
    const wasPending = cancelPendingLeave(data.id, channelName);

    // Remove any existing entry for this userId OR this WS connection (handles reconnect
    // and LocalChannel.track() re-joining with proper data after initial empty join)
    const existing = Array.from(members).find(m => m.userId === data.id || m.ws === ws);
    if (existing) {
      logger.info(`[WS] joinChannel: replacing existing entry for user="${data.id}"`);
      members.delete(existing);
    }
    members.add({ ws, userId: data.id, data });

    // Surface a stale bundle: it is invisible in normal logs (the old client
    // simply never broadcasts) and looks exactly like "the opponent is idle".
    logProtocolMismatch(channelName, members);

    // Update reverse-index for O(1) sendToUser
    if (!userChannelMap.has(data.id)) userChannelMap.set(data.id, new Set());
    userChannelMap.get(data.id).add({ ws, channelName });

    if (!clientChannels.has(ws)) clientChannels.set(ws, new Set());
    clientChannels.get(ws).add(channelName);

    // Subscribe to Redis for cross-instance messages on this channel
    subscribeRedis(channelName);

    // Send join_ok back to the joining client (confirms channel membership is active)
    const joinOkMsg = JSON.stringify({
      type: 'join_ok',
      channel: channelName,
      userId: data.id,
      channelSize: members.size,
    });
    if (ws.readyState === 1) ws.send(joinOkMsg);

    // Send presence to all in channel
    if (wasPending) {
      logger.info(`[WS] joinChannel: user="${data.id}" rejoined within grace period, cancelled pending leave`);
    }
    logger.info(`[WS] joinChannel: after join, channel="${channelName}" has ${members.size} members, totalChannels=${channels.size}`);
    broadcastToChannel(channelName, buildPresenceMessage(channelName));
    // Keep re-announcing membership so a member that missed this frame (or
    // subscribed a moment later) still discovers its opponent.
    ensureRoomHeartbeat(channelName);
    // Let other instances learn about this membership (they re-send a merged
    // presence_sync to their own members when they receive it).
    publishChannelPresence(channelName);
  }

  function leaveChannelFinal(userId, channelName) {
    const members = channels.get(channelName);
    if (!members) return;
    const member = Array.from(members).find(m => m.userId === userId);
    if (!member) return;
    members.delete(member);
    const prefs = roomPreferences.get(channelName);
    if (prefs) prefs.delete(userId);
    if (members.size === 0) {
      channels.delete(channelName);
      unsubscribeRedis(channelName);
      clearRoomCache(channelName);
    }

    // Clean up reverse-index for O(1) sendToUser
    const entries = userChannelMap.get(userId);
    if (entries) {
      for (const entry of entries) {
        if (entry.channelName === channelName && entry.ws === member.ws) {
          entries.delete(entry);
          break;
        }
      }
      if (entries.size === 0) userChannelMap.delete(userId);
    }

    // Broadcast player_left (server-initiated = disconnect/leave, not forfeit)
    broadcastToChannel(channelName, {
      type: 'channel:event',
      channel: channelName,
      event: 'player_left',
      payload: { playerId: userId, reason: 'leave' },
      senderId: userId
    });

    // Broadcast updated presence
    broadcastToChannel(channelName, buildPresenceMessage(channelName));
    publishChannelPresence(channelName);
  }

  function scheduleLeave(userId, channelName) {
    if (!pendingLeaves.has(userId)) {
      pendingLeaves.set(userId, { timers: new Map(), channels: new Set() });
    }
    const pending = pendingLeaves.get(userId);
    if (pending.channels.has(channelName)) return; // already scheduled
    pending.channels.add(channelName);

    const timer = setTimeout(() => {
      logger.info(`[WS] grace period expired: removing user="${userId}" from channel="${channelName}"`);
      leaveChannelFinal(userId, channelName);
      pending.timers.delete(channelName);
      pending.channels.delete(channelName);
      if (pending.timers.size === 0) pendingLeaves.delete(userId);
    }, LEAVE_GRACE_PERIOD);
    pending.timers.set(channelName, timer);
  }

  function removeClient(ws) {
    const joinedChannels = clientChannels.get(ws);
    if (joinedChannels) {
      joinedChannels.forEach(ch => {
        const members = channels.get(ch);
        if (members) {
          const member = Array.from(members).find(m => m.ws === ws);
          if (member) {
            const userId = member.userId || member.data?.id;
            logger.info(`[WS] removeClient: scheduling disconnect for user="${userId}" channel="${ch}" (grace period ${LEAVE_GRACE_PERIOD}ms)`);
            scheduleLeave(userId, ch);
          }
        }
      });
    }
    clientChannels.delete(ws);
    // Drop the direct socket index entry for this connection
    const authInfo = authenticatedClients.get(ws);
    if (authInfo?.userId) {
      const set = userSockets.get(authInfo.userId);
      if (set) {
        set.delete(ws);
        if (set.size === 0) {
          userSockets.delete(authInfo.userId);
          // Last connection gone — tell other instances to stop routing here.
          announcePresence(authInfo.userId, false);
        }
      }
    }
    authenticatedClients.delete(ws);
  }

  wss.on('connection', (ws, req) => {
    logger.info(`[WS] New connection from ${req.socket.remoteAddress || 'unknown'}`);
    let isAuthenticated = false;

    ws.on('message', (raw) => {
      let msg;
      try {
        msg = JSON.parse(raw.toString());
      } catch {
        return;
      }

      // Auth handshake: first message MUST be auth
      if (msg.type === 'auth') {
        const userId = validateToken(msg.token);
        if (!userId) {
          ws.send(JSON.stringify({ type: 'auth_error', error: 'توکن نامعتبر است' }));
          // Don't close the WS — allow guest fallback
          return;
        }
        isAuthenticated = true;
        authenticatedClients.set(ws, { userId, token: msg.token });
        if (!userSockets.has(userId)) userSockets.set(userId, new Set());
        userSockets.get(userId).add(ws);
        // Let other instances know this user is reachable through us.
        announcePresence(userId, true);
        ws.send(JSON.stringify({ type: 'auth_ok', userId }));

        // Immediately flush any buffered notifications/messages that arrived while socket was reconnecting
        if (pendingNotifications.has(userId)) {
          const pending = pendingNotifications.get(userId);
          pendingNotifications.delete(userId);
          for (const item of pending) {
            try {
              if (item && item.type) {
                ws.send(JSON.stringify(item));
              } else {
                ws.send(JSON.stringify({ type: 'notification:new', notification: item }));
              }
            } catch (e) { /* ignore */ }
          }
        }
        return;
      }

      // Ping/pong always allowed
      if (msg.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong' }));
        return;
      }

      // Reconnect sync: re-send any pending notifications stored for this user
      if (msg.type === 'reconnect_sync') {
        const userId = msg.userId;
        if (userId && pendingNotifications.has(userId)) {
          const notifs = pendingNotifications.get(userId);
          notifs.forEach(n => {
            ws.send(JSON.stringify({ type: 'notification:new', notification: n }));
          });
        }
        return;
      }

      // global_social channel is public (presence/chat) - allow without auth
      // Game channels (room_xxx) also allow guest joins (is_guest flag in data)
      if (!isAuthenticated) {
        const isGuestJoin = msg.type === 'channel:join' && msg.data?.is_guest === true;
        const isPublicChannel = msg.type === 'channel:join' && msg.channel === 'global_social';
        const isPing = msg.type === 'ping';
        const isReconnectSync = msg.type === 'reconnect_sync';
        const isLeave = msg.type === 'channel:leave';
        const isRoomSync = msg.type === 'room:sync';
        // A guest that has actually JOINED a room may broadcast inside it.
        // Without this, a player whose 24h JWT expired is silently reduced to a
        // spectator: their socket joins, receives presence, but every
        // player_preference / coin_flip_result / merge_ack is rejected here —
        // exactly the "one side never progresses" bug (room_147150).
        const isJoinedRoomBroadcast = msg.type === 'channel:broadcast'
          && isRoomChannel(msg.channel)
          && !!clientChannels.get(ws)?.has(msg.channel);
        if (!isPublicChannel && !isGuestJoin && !isPing && !isReconnectSync && !isLeave && !isRoomSync && !isJoinedRoomBroadcast) {
          if (msg.type === 'channel:broadcast') {
            logger.warn(`[WS] rejected guest broadcast: channel="${msg.channel}" event="${msg.event}" (socket has not joined that room)`);
          }
          ws.send(JSON.stringify({ type: 'error', error: 'ابتدا باید احراز هویت کنید' }));
          return;
        }
      }

      // ─── WS Rate limiting ─────────────────────────────
      // Skip rate check for ping/pong (critical for heartbeat)
      if (msg.type !== 'ping' && msg.type !== 'pong') {
        const authInfo = authenticatedClients.get(ws);
        const rateUserId = authInfo?.userId || msg.senderId || 'anon';
        // Game-critical room broadcasts draw from their own, far more generous
        // bucket so ordinary traffic (e.g. `progress`) can never starve them.
        const isCriticalMsg = msg.type === 'channel:broadcast' && CRITICAL_WS_EVENTS.has(msg.event);
        if (!checkWsRateLimit(rateUserId, isCriticalMsg)) {
          // Rate limited — drop message silently (client will retry on next heartbeat)
          return;
        }
      }

      switch (msg.type) {
        case 'room:sync':
          // Targeted re-sync for a client that is waiting on a peer: reply with
          // the current member list plus any cached preferences/merge result.
          if (msg.channel && channels.has(msg.channel)) {
            try { ws.send(JSON.stringify(buildPresenceMessage(msg.channel))); } catch (e) { /* ignore */ }
          }
          break;

        case 'channel:join':
          // For authenticated users, validate that their ID matches the token
          if (isAuthenticated) {
            const authInfo = authenticatedClients.get(ws);
            if (authInfo && msg.data?.id && msg.data.id !== authInfo.userId) {
              // Logged: this rejection is invisible to the client (LocalChannel
              // has no handler for `error`), so without this line a silently
              // dropped join looks exactly like "the opponent never appeared".
              logger.warn(`[WS] channel:join REJECTED — data.id="${msg.data.id}" does not match token userId="${authInfo.userId}" (channel="${msg.channel}")`);
              ws.send(JSON.stringify({ type: 'error', error: 'شناسه کاربری با توکن مطابقت ندارد' }));
              return;
            }
          }
          joinChannel(ws, msg.channel, msg.data || {});
          break;

        case 'channel:leave':
        {
          const members = channels.get(msg.channel);
          let leftUserId = null;
          if (members) {
            const member = Array.from(members).find(m => m.ws === ws);
            if (member) {
              leftUserId = member.userId || member.data?.id;
              if (leftUserId) cancelPendingLeave(leftUserId, msg.channel);
              members.delete(member);
              const prefs = roomPreferences.get(msg.channel);
              if (prefs && leftUserId) prefs.delete(leftUserId);
              if (members.size === 0) {
                channels.delete(msg.channel);
                unsubscribeRedis(msg.channel);
                clearRoomCache(msg.channel);
              }
              // Clean up reverse-index for O(1) sendToUser
              if (leftUserId && userChannelMap.has(leftUserId)) {
                const userEntries = userChannelMap.get(leftUserId);
                for (const entry of userEntries) {
                  if (entry.channelName === msg.channel && entry.ws === ws) {
                    userEntries.delete(entry);
                    break;
                  }
                }
                if (userEntries.size === 0) userChannelMap.delete(leftUserId);
              }
            }
          }
          if (clientChannels.has(ws)) {
            clientChannels.get(ws).delete(msg.channel);
          }
          if (leftUserId && channels.has(msg.channel)) {
            broadcastToChannel(msg.channel, {
              type: 'channel:event',
              channel: msg.channel,
              event: 'player_left',
              payload: { playerId: leftUserId, reason: 'leave' },
              senderId: leftUserId
            });
          }
          broadcastToChannel(msg.channel, buildPresenceMessage(msg.channel));
          break;
        }

        case 'channel:broadcast': {
          logger.info(`[WS] broadcast: channel="${msg.channel}" event="${msg.event}" sender="${msg.senderId}" members=${(channels.get(msg.channel) || new Set()).size}`);
          // Remember the room facts that a late/mid-reconnect peer must not miss.
          if (isRoomChannel(msg.channel) && msg.payload) {
            if (msg.event === 'player_preference') {
              const prefOwner = msg.payload.playerId || msg.senderId;
              if (prefOwner) {
                if (!roomPreferences.has(msg.channel)) roomPreferences.set(msg.channel, new Map());
                roomPreferences.get(msg.channel).set(prefOwner, { ...msg.payload, playerId: prefOwner });
              }
            } else if (msg.event === 'coin_flip_result') {
              roomMergeResults.set(msg.channel, msg.payload);
            } else if (msg.event === 'start_game') {
              roomStartGames.set(msg.channel, msg.payload);
            }
          }
          // A joiner that missed `start_game` asks for it. Serve the cached grid
          // directly instead of forwarding the request: the host may itself be
          // the side that is stuck, and double delivery would restart the timer.
          if (msg.event === 'request_game_data' && isRoomChannel(msg.channel)) {
            const cachedStart = roomStartGames.get(msg.channel);
            if (cachedStart) {
              try {
                ws.send(JSON.stringify({
                  type: 'channel:event',
                  channel: msg.channel,
                  event: 'start_game',
                  payload: cachedStart,
                  senderId: 'server',
                }));
                logger.info(`[WS] replayed cached start_game for "${msg.channel}"`);
                break;
              } catch (e) { /* fall through to normal forwarding */ }
            }
          }
          // The first game_over claim decides the arena pot, so record it using
          // the authenticated socket identity — msg.senderId is client-supplied
          // and therefore forgeable.
          if (msg.event === 'game_over') {
            const authInfo = authenticatedClients.get(ws);
            recordGameOver(msg.channel, authInfo?.userId, msg.payload);
          }
          // game_over needs to echo back to sender so handleGameOverEvent compares scores on both sides
          if (msg.event === 'game_over') {
            broadcastToChannel(msg.channel, {
              type: 'channel:event',
              channel: msg.channel,
              event: msg.event,
              payload: msg.payload,
              senderId: msg.senderId
            });
          } else {
            broadcastToChannel(msg.channel, {
              type: 'channel:event',
              channel: msg.channel,
              event: msg.event,
              payload: msg.payload,
              senderId: msg.senderId
            }, ws);
          }
          break;
        }

        case 'challenge:accepted':
          if (msg.targetId) {
            sendToUser(msg.targetId, {
              type: 'challenge:accepted',
              senderId: msg.senderId,
              senderName: msg.senderName,
              roomId: msg.roomId,
              senderAvatar: msg.senderAvatar,
            });
          }
          break;

        case 'direct_message':
          if (msg.targetId) {
            sendToUser(msg.targetId, {
              type: msg.eventType || 'direct',
              payload: msg.payload,
              senderId: msg.senderId,
              timestamp: Date.now(),
            });
          }
          break;
      }
    });

    ws.on('close', () => {
      removeClient(ws);
    });

    // Send connected message - client must send auth next
    ws.send(JSON.stringify({ type: 'connected', requiresAuth: true }));
  });

  logger.info(`✅ WebSocket server ready (leave grace period: ${LEAVE_GRACE_PERIOD}ms)`);
  return wss;
}

module.exports = { setupWebSocket, sendToUser, sendToUserWithRetry, broadcastToChannel, channels, getChannelUsers, pendingNotifications, pushPendingNotification, MAX_PENDING_NOTIFS };
