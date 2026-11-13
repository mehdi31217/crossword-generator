/* Server-authoritative economy E2E test against the real server.
 *
 * Proves that the client can no longer mint coins through any of the paths that
 * used to up-sync a local balance, and that rewards are paid by the server from
 * its own arbitration record:
 *
 *   1. POST /match            ignores a client-supplied `coins` field
 *   2. POST /arena/create     ignores `localCoins` (atomic server-side debit)
 *   3. POST /arena/join       ignores `localCoins` (and refunds the creator)
 *   4. POST /league/result    pays +20 to the server-arbitrated winner only,
 *                             idempotently, participants only
 *   5. POST /coins/spend      server-priced, atomic, rejects when short
 *
 * Usage:
 *   node scripts/econ_e2e.cjs      (server must be running on 127.0.0.1:8081)
 *
 * NOTE: creates throwaway users named `ec_*`. Clean up afterwards with:
 *   DELETE FROM profiles WHERE id LIKE 'ec\_%';
 *   (plus matches/notifications/friendships/messages referencing them)
 */
const WebSocket = require('ws');

const HTTP = 'http://127.0.0.1:8081/api';
const WS_URL = 'ws://127.0.0.1:8081';

const results = [];
function check(name, ok, detail) {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  → ' + detail : ''}`);
}
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function post(path, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(HTTP + path, { method: 'POST', headers, body: JSON.stringify(body) });
  let json = null;
  try { json = await res.json(); } catch {}
  return { status: res.status, json };
}

async function login(deviceId, username, coins) {
  const body = { deviceId, username: username || deviceId };
  if (coins !== undefined) body.coins = coins;
  const r = await post('/login', body);
  return { token: r.json?.token, coins: r.json?.player?.coins };
}

// Balance is read fresh from the server (never from a cached response).
async function balance(token, deviceId) {
  const r = await post('/login', { deviceId }, token);
  return r.json?.player?.coins;
}

function connectPlayer(token, userId, label) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(WS_URL);
    const inbox = [];
    const waiters = [];
    ws.on('message', (raw) => {
      let m; try { m = JSON.parse(raw.toString()); } catch { return; }
      inbox.push(m);
      for (let i = waiters.length - 1; i >= 0; i--) {
        if (waiters[i].pred(m)) { waiters[i].resolve(m); waiters.splice(i, 1); }
      }
    });
    const waitFor = (pred, ms = 6000) => new Promise((res, rej) => {
      const hit = inbox.find(pred);
      if (hit) return res(hit);
      const w = { pred, resolve: res };
      waiters.push(w);
      setTimeout(() => {
        const idx = waiters.indexOf(w);
        if (idx !== -1) { waiters.splice(idx, 1); rej(new Error(`${label}: timeout waiting`)); }
      }, ms);
    });
    ws.on('open', async () => {
      ws.send(JSON.stringify({ type: 'auth', token }));
      try { await waitFor(m => m.type === 'auth_ok', 4000); } catch (e) { return reject(e); }
      resolve({ ws, waitFor, inbox, userId, label, send: (o) => ws.send(JSON.stringify(o)) });
    });
    ws.on('error', reject);
  });
}

// Drive a matchmaking pair into a room and return { roomId, pa, pb }.
async function makeRoom(A, tokA, B, tokB, tag) {
  const j1 = await post('/matchmaking/join', { playerId: A, playerName: A, playerAvatar: '👤', mode: 'speed', wager: 0, leagueTrophies: 0 }, tokA);
  if (j1.json?.status !== 'waiting') throw new Error(`${tag}: first join not waiting (${j1.json?.status})`);
  const j2 = await post('/matchmaking/join', { playerId: B, playerName: B, playerAvatar: '👤', mode: 'speed', wager: 0, leagueTrophies: 0 }, tokB);
  if (!j2.json?.roomId) throw new Error(`${tag}: second join did not match`);
  const roomId = j2.json.roomId;
  const pa = await connectPlayer(tokA, A, `${tag}-A`);
  const pb = await connectPlayer(tokB, B, `${tag}-B`);
  pa.send({ type: 'channel:join', channel: `room_${roomId}`, data: { id: A, name: A, is_guest: false } });
  await pa.waitFor(m => m.type === 'join_ok', 4000);
  pb.send({ type: 'channel:join', channel: `room_${roomId}`, data: { id: B, name: B, is_guest: false } });
  await pb.waitFor(m => m.type === 'join_ok', 4000);
  return { roomId, pa, pb };
}

const stamp = Date.now();
const created = [];
function uid(prefix) { const id = `ec_${prefix}_${stamp}`; created.push(id); return id; }

(async () => {
  // ── 1. /match must not mint coins ───────────────────────────────────────
  {
    const U = uid('match');
    const { token } = await login(U, 'EconMatch', 1000);
    const before = await balance(token, U);
    const r = await post('/match', {
      deviceId: U, score: 500, time_taken: 60, grid_size: 5,
      category: 'general', date_played: new Date().toISOString(),
      coins: 999999, // the attack
    }, token);
    const after = await balance(token, U);
    check('/match accepted a valid record', r.status === 200, `status=${r.status}`);
    check('/match ignores a client-supplied coins field', after === before, `before=${before} after=${after}`);
  }

  // ── 2. /arena/create must not mint via localCoins ───────────────────────
  {
    const U = uid('create');
    const { token } = await login(U, 'EconCreate', 300);
    const r = await post('/arena/create', { playerId: U, mode: 'speed', wager: 1000, localCoins: 999999 }, token);
    const after = await balance(token, U);
    check('/arena/create rejects a wager above the server balance', r.status === 400, `status=${r.status} err=${r.json?.error}`);
    check('/arena/create does not mint from localCoins', after === 300, `coins=${after}`);
  }

  // ── 3. /arena/join must not mint via localCoins (and refund creator) ────
  {
    const Q = uid('joinq');
    const R = uid('joinr');
    const q = await login(Q, 'EconJoinQ', 1000);
    const r = await login(R, 'EconJoinR', 100); // clamped to the 250 floor
    const rFloor = await balance(r.token, R);
    const c = await post('/arena/create', { playerId: Q, mode: 'speed', wager: 500 }, q.token);
    const qAfterCreate = await balance(q.token, Q);
    check('creator escrow debited (1000 - 500)', qAfterCreate === 500, `coins=${qAfterCreate}`);

    const jn = await post('/arena/join', { gameId: c.json?.gameId, joinerId: R, localCoins: 999999 }, r.token);
    check('/arena/join rejects a joiner short on server coins', jn.status === 400, `status=${jn.status} err=${jn.json?.error}`);
    const rAfter = await balance(r.token, R);
    check('/arena/join does not mint from localCoins', rAfter === rFloor, `coins=${rAfter} floor=${rFloor}`);
    const qRefunded = await balance(q.token, Q);
    check('creator refunded after a failed join', qRefunded === 1000, `coins=${qRefunded}`);
  }

  // ── 4. /league/result: server-arbitrated, idempotent, participants only ─
  {
    const W = uid('lgwin');
    const L = uid('lglose');
    const X = uid('lgout');
    const w = await login(W, 'EconLgWin', 1000);
    const l = await login(L, 'EconLgLose', 1000);
    const x = await login(X, 'EconLgOut', 1000);

    const { roomId, pa, pb } = await makeRoom(W, w.token, L, l.token, 'league');
    // The winner (W) claims game_over on the room channel. The server takes the
    // claimer from the authenticated socket, not from payload.winnerId.
    pa.send({ type: 'channel:broadcast', channel: `room_${roomId}`, event: 'game_over', senderId: W, payload: { winnerId: W, winnerScore: 900, winnerTime: 80 } });
    await sleep(600);

    // The loser calls first and must get nothing.
    const loseRes = await post('/league/result', { roomId }, l.token);
    const lCoins = await balance(l.token, L);
    check('league/result pays the loser nothing', loseRes.status === 200 && loseRes.json?.awarded === 0 && lCoins === 1000, `awarded=${loseRes.json?.awarded} coins=${lCoins}`);

    // The winner is paid +20 from the server's record.
    const winRes = await post('/league/result', { roomId }, w.token);
    const wCoins = await balance(w.token, W);
    check('league/result pays the arbitrated winner +20', winRes.json?.awarded === 20 && winRes.json?.coins === 1020, `awarded=${winRes.json?.awarded} coins=${wCoins}`);
    check('winner balance reflects the award', wCoins === 1020, `coins=${wCoins}`);

    // Idempotent: a second call must not pay again.
    const dupRes = await post('/league/result', { roomId }, w.token);
    const wCoinsDup = await balance(w.token, W);
    check('league/result is idempotent per room', dupRes.json?.awarded === 0 && wCoinsDup === 1020, `awarded=${dupRes.json?.awarded} coins=${wCoinsDup}`);

    // A non-participant is refused outright.
    const outRes = await post('/league/result', { roomId }, x.token);
    check('league/result refuses non-participants', outRes.status === 403, `status=${outRes.status}`);

    // No game_over recorded → the server awards nothing (grace period, then 0).
    const P = uid('lgw2');
    const Q = uid('lgl2');
    const p = await login(P, 'EconLgW2', 1000);
    const q = await login(Q, 'EconLgL2', 1000);
    const room2 = await makeRoom(P, p.token, Q, q.token, 'league2');
    const noClaim = await post('/league/result', { roomId: room2.roomId }, p.token);
    const pCoins = await balance(p.token, P);
    check('league/result awards nothing without a game_over record', noClaim.status === 200 && noClaim.json?.awarded === 0 && pCoins === 1000, `status=${noClaim.status} awarded=${noClaim.json?.awarded} coins=${pCoins}`);

    pa.ws.close(); pb.ws.close(); room2.pa.ws.close(); room2.pb.ws.close();
  }

  // ── 5. /coins/spend regression: server-priced, atomic ───────────────────
  {
    const U = uid('spend');
    const { token } = await login(U, 'EconSpend', 1000);
    const ok = await post('/coins/spend', { reason: 'hint_letter' }, token);
    check('coins/spend debits the server-owned price', ok.status === 200 && ok.json?.spent === 20 && ok.json?.coins === 980, `spent=${ok.json?.spent} coins=${ok.json?.coins}`);

    const bad = await post('/coins/spend', { reason: 'not_a_thing' }, token);
    check('coins/spend rejects an unknown reason', bad.status === 400, `status=${bad.status}`);

    // A client cannot name its own price.
    const spoof = await post('/coins/spend', { reason: 'hint_word', price: 1 }, token);
    check('coins/spend ignores a client-supplied price', spoof.status === 200 && spoof.json?.spent === 50, `spent=${spoof.json?.spent}`);
  }

  // ── 6. /tower/update-stats: client-reported reward is capped per day ────
  {
    const U = uid('tower');
    const { token } = await login(U, 'EconTower', 1000);

    const one = await post('/tower/update-stats', { coins_earned: 100, floor_reached: 5 }, token);
    check('tower credits a valid reward', one.status === 200 && one.json?.coins === 1100, `coins=${one.json?.coins}`);
    check('tower tracks the per-day counter', one.json?.daily_tower_coins === 100, `daily=${one.json?.daily_tower_coins}`);

    // 100 coins/run is the per-run ceiling the endpoint enforces.
    const tooBig = await post('/tower/update-stats', { coins_earned: 101, floor_reached: 5 }, token);
    check('tower rejects a per-run reward above 100', tooBig.status === 400, `status=${tooBig.status}`);

    // Drain the remaining 900 of the 1000/day allowance.
    for (let i = 0; i < 9; i++) {
      await post('/tower/update-stats', { coins_earned: 100, floor_reached: 5 }, token);
    }
    const atCap = await balance(token, U);
    check('tower reaches the daily cap (1000)', atCap === 2000, `coins=${atCap}`);

    // Past the cap the server must credit nothing, however often it is called.
    const past = await post('/tower/update-stats', { coins_earned: 100, floor_reached: 5 }, token);
    const afterCap = await balance(token, U);
    check('tower credits nothing past the daily cap', past.status === 200 && afterCap === 2000, `coins=${afterCap} daily=${past.json?.daily_tower_coins}`);
  }

  // ── 7. /arena/cancel: atomic refund + reported balance ─────────────────
  {
    const U = uid('cancel');
    const { token } = await login(U, 'EconCancel', 1000);
    const c = await post('/arena/create', { playerId: U, mode: 'speed', wager: 200 }, token);
    const afterCreate = await balance(token, U);
    check('cancel test: wager escrowed', afterCreate === 800, `coins=${afterCreate}`);

    const cancel = await post('/arena/cancel', { gameId: c.json?.gameId, playerId: U }, token);
    check('arena/cancel refunds the wager', cancel.status === 200 && cancel.json?.refund === 200 && cancel.json?.coins === 1000, `refund=${cancel.json?.refund} coins=${cancel.json?.coins}`);
    const afterCancel = await balance(token, U);
    check('arena/cancel balance persisted', afterCancel === 1000, `coins=${afterCancel}`);
  }

  // ── 8. Shop purchase delivers the item SERVER-side and it survives reload ──
  {
    const U = uid('shop');
    const { token } = await login(U, 'EconShop', 1000);

    const buy = await post('/coins/spend', { reason: 'shop_trophyShield' }, token);
    check('shop purchase debits the server price', buy.status === 200 && buy.json?.coins === 900, `coins=${buy.json?.coins}`);
    check('shop purchase returns the granted item', buy.json?.items?.trophyShield === 1, `items=${JSON.stringify(buy.json?.items)}`);

    // The real bug: the item used to live only in client state, so a paid-for
    // shield was gone after a reload.
    const reload = await post('/login', { deviceId: U });
    check('granted item persists across reload', reload.json?.player?.items?.trophyShield === 1, `items=${JSON.stringify(reload.json?.player?.items)}`);
    check('items come back as an object, not a JSON string', typeof reload.json?.player?.items === 'object', `typeof=${typeof reload.json?.player?.items}`);
  }

  // ── 9. Casual match awards trophies SERVER-side ─────────────────────────
  {
    const U = uid('trophy');
    const { token } = await login(U, 'EconTrophy', 1000);

    // calcCasualTrophyGain(1000, 15) = min(30, 10*2 + 15 - 4) = 30
    const m = await post('/match', { score: 1000, time_taken: 60, grid_size: 15, category: 'general', date_played: new Date().toISOString() }, token);
    check('casual match returns the server-computed league', m.json?.league?.trophies === 30, `trophies=${m.json?.league?.trophies}`);
    const after = await post('/login', { deviceId: U });
    check('casual trophies are persisted (leaderboard can see them)', after.json?.player?.trophies === 30, `trophies=${after.json?.player?.trophies}`);

    // skip_trophies (multiplayer path) must not award the casual bonus
    await post('/match', { score: 1000, time_taken: 60, grid_size: 15, category: 'general', date_played: new Date().toISOString(), skip_trophies: true }, token);
    const afterSkip = await post('/login', { deviceId: U });
    check('skip_trophies suppresses the casual award', afterSkip.json?.player?.trophies === 30, `trophies=${afterSkip.json?.player?.trophies}`);

    // A client must not be able to write its own rating.
    await fetch(HTTP + '/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ deviceId: U, username: 'EconTrophy', trophies: 99999, league: 'legendary' }),
    });
    const afterForge = await post('/login', { deviceId: U });
    check('/api/profile cannot set trophies or league', afterForge.json?.player?.trophies === 30 && afterForge.json?.player?.league === 'bronze', `trophies=${afterForge.json?.player?.trophies} league=${afterForge.json?.player?.league}`);
  }

  // ── 10. /league/result settles trophies + consumables for BOTH players ──
  {
    const W = uid('lgw');
    const L = uid('lgl');
    const w = await login(W, 'EconLgW', 1000);
    const l = await login(L, 'EconLgL', 1000);

    // Seed 30 trophies each via a casual match, then buy one consumable each.
    const casual = (tok) => post('/match', { score: 1000, time_taken: 60, grid_size: 15, category: 'general', date_played: new Date().toISOString() }, tok);
    await casual(w.token);
    await casual(l.token);
    await post('/coins/spend', { reason: 'shop_trophyBoost' }, w.token); // 1000-80 = 920
    await post('/coins/spend', { reason: 'shop_trophyShield' }, l.token); // 1000-100 = 900

    const { roomId, pa, pb } = await makeRoom(W, w.token, L, l.token, 'trophy');
    // W claims game_over → W is the server's winner.
    pa.send({ type: 'channel:broadcast', channel: `room_${roomId}`, event: 'game_over', senderId: W, payload: { winnerId: W, winnerScore: 900, winnerTime: 70 } });
    await sleep(600);

    // Winner: +20 base trophies, boosted ×1.5 → 30; plus the +20 coin bonus.
    const winRes = await post('/league/result', { roomId }, w.token);
    check('league/result awards the winner trophies (+boost)', winRes.json?.won === true && winRes.json?.trophyChange === 30 && winRes.json?.trophies === 60, `change=${winRes.json?.trophyChange} trophies=${winRes.json?.trophies}`);
    check('league/result consumes the trophy boost', winRes.json?.boostUsed === true && winRes.json?.items?.trophyBoost === 0, `boostUsed=${winRes.json?.boostUsed} items=${JSON.stringify(winRes.json?.items)}`);
    check('league/result still pays the +20 coin bonus', winRes.json?.awarded === 20 && winRes.json?.coins === 940, `awarded=${winRes.json?.awarded} coins=${winRes.json?.coins}`);

    // Loser: the shield absorbs the loss (normalises the opponent to own rating → -15).
    const loseRes = await post('/league/result', { roomId }, l.token);
    check('league/result applies the loser trophy loss', loseRes.json?.won === false && loseRes.json?.trophyChange === -15 && loseRes.json?.trophies === 15, `change=${loseRes.json?.trophyChange} trophies=${loseRes.json?.trophies}`);
    check('league/result consumes the trophy shield', loseRes.json?.shieldUsed === true && loseRes.json?.items?.trophyShield === 0, `shieldUsed=${loseRes.json?.shieldUsed} items=${JSON.stringify(loseRes.json?.items)}`);
    check('league/result pays the loser nothing', loseRes.json?.awarded === 0, `awarded=${loseRes.json?.awarded}`);

    // Everything persisted.
    const wAfter = await post('/login', { deviceId: W });
    const lAfter = await post('/login', { deviceId: L });
    check('winner trophies + items persisted', wAfter.json?.player?.trophies === 60 && wAfter.json?.player?.items?.trophyBoost === 0, `trophies=${wAfter.json?.player?.trophies} items=${JSON.stringify(wAfter.json?.player?.items)}`);
    check('loser trophies + items persisted', lAfter.json?.player?.trophies === 15 && lAfter.json?.player?.items?.trophyShield === 0, `trophies=${lAfter.json?.player?.trophies} items=${JSON.stringify(lAfter.json?.player?.items)}`);

    // Idempotent per (room, user).
    const dup = await post('/league/result', { roomId }, w.token);
    const wDup = await post('/login', { deviceId: W });
    check('league settlement is idempotent per user', dup.json?.alreadyAwarded === true && wDup.json?.player?.trophies === 60, `alreadyAwarded=${dup.json?.alreadyAwarded} trophies=${wDup.json?.player?.trophies}`);

    pa.ws.close(); pb.ws.close();
  }

  // ── 11. Daily trophy cap (seed the Redis day counter instead of grinding) ──
  {
    const U = uid('tcap');
    const { token } = await login(U, 'EconTcap', 1000);
    const today = new Date().toISOString().slice(0, 10);
    const mk = () => post('/match', { score: 1000, time_taken: 60, grid_size: 15, category: 'general', date_played: new Date().toISOString() }, token);

    const m1 = await mk();
    check('trophy cap: baseline award', m1.json?.trophyAwarded === 30, `awarded=${m1.json?.trophyAwarded}`);

    // Pretend 480 of the 500/day allowance is already spent — far faster than
    // actually grinding 16 matches (the /match throttle would block that anyway).
    const Redis = require('../server/node_modules/ioredis');
    const rds = new Redis('redis://127.0.0.1:6379', { maxRetriesPerRequest: 1 });
    try {
      await rds.set(`trophy:daily:${U}`, JSON.stringify({ date: today, coins: 480 }), 'EX', 300);
      const m2 = await mk();
      check('trophy cap: clamps to the remaining allowance', m2.json?.trophyAwarded === 20, `awarded=${m2.json?.trophyAwarded}`);

      const m3 = await mk();
      check('trophy cap: awards nothing past the cap', m3.json?.trophyAwarded === 0, `awarded=${m3.json?.trophyAwarded}`);

      const after = await post('/login', { deviceId: U });
      check('trophy cap: total stops at the cap', after.json?.player?.trophies === 50, `trophies=${after.json?.player?.trophies}`);
    } finally {
      await rds.quit().catch(() => {});
    }
  }

  // ── 12. Per-account throttle on /api/match ──────────────────────────────
  {
    const U = uid('rlim');
    const { token } = await login(U, 'EconRlim', 1000);
    const body = { score: 100, time_taken: 60, grid_size: 5, category: 'general', date_played: new Date().toISOString() };
    const statuses = [];
    for (let i = 0; i < 14; i++) statuses.push((await post('/match', body, token)).status);
    const okCount = statuses.filter(s => s === 200).length;
    const throttled = statuses.filter(s => s === 429).length;
    check('per-account throttle allows the burst then blocks', okCount === 12 && throttled === 2, `ok=${okCount} blocked=${throttled} [${statuses.join(',')}]`);
  }

  // ── 13. Tower tickets are server-owned ──────────────────────────────────
  // The free-ticket button used to increment localStorage with no server call at
  // all (an unmetered mint of a consumable the shop sells for 30 coins), the load
  // path Math.max-merged local over server, and the shop debited the coins while
  // granting nothing server-side.
  const ticketsOf = async (deviceId) => (await post('/login', { deviceId })).json?.player?.tower_tickets;
  {
    // 13a. the free ticket is metered server-side
    const U = uid('tfree');
    const { token } = await login(U, 'EconTicket', 1000);
    const start = await ticketsOf(U);
    check('free ticket: a new account starts with 1 ticket', start === 1, `tickets=${start}`);

    const f1 = await post('/tower/free-ticket', {}, token);
    check('free ticket: the first claim is granted', f1.status === 200 && f1.json?.tower_tickets === 2, `status=${f1.status} tickets=${f1.json?.tower_tickets}`);

    // At the cap the refusal is `at_cap`, not the refill window — the server checks
    // the cap BEFORE touching the window, so a refused claim never burns it.
    const f2 = await post('/tower/free-ticket', {}, token);
    check('free ticket: claiming at the cap is refused', f2.status === 400 && f2.json?.error === 'at_cap', `status=${f2.status} error=${f2.json?.error}`);

    // 13b. consuming is atomic and floors at zero
    const c1 = await post('/tower/consume-ticket', {}, token);
    check('consume: 2 → 1', c1.status === 200 && c1.json?.tower_tickets === 1, `tickets=${c1.json?.tower_tickets}`);

    // Now below the cap, so the refill window is what blocks a second claim — and
    // the at-cap refusal above must not have consumed it.
    const f3 = await post('/tower/free-ticket', {}, token);
    const afterWindow = await ticketsOf(U);
    check('free ticket: below the cap the refill window still blocks', f3.status === 429 && f3.json?.error === 'cooldown' && afterWindow === 1, `status=${f3.status} tickets=${afterWindow}`);

    const c2 = await post('/tower/consume-ticket', {}, token);
    check('consume: 1 → 0', c2.status === 200 && c2.json?.tower_tickets === 0, `tickets=${c2.json?.tower_tickets}`);
    const c3 = await post('/tower/consume-ticket', {}, token);
    check('consume: refuses at zero', c3.status === 400 && c3.json?.error === 'no tickets', `status=${c3.status} error=${c3.json?.error}`);
    const afterZero = await ticketsOf(U);
    check('consume: the stored count never goes negative', afterZero === 0, `tickets=${afterZero}`);

    // 13c. the shop delivers the ticket server-side and it persists
    const S = uid('tshop');
    const s = await login(S, 'EconTicketShop', 1000);
    const buy = await post('/coins/spend', { reason: 'shop_towerTicket' }, s.token);
    check('shop: a tower ticket costs 30 and returns the new count', buy.status === 200 && buy.json?.coins === 970 && buy.json?.tower_tickets === 2, `coins=${buy.json?.coins} tickets=${buy.json?.tower_tickets}`);
    const persisted = await ticketsOf(S);
    check('shop: the bought ticket persists across a reload', persisted === 2, `tickets=${persisted}`);

    const buyAtCap = await post('/coins/spend', { reason: 'shop_towerTicket' }, s.token);
    check('shop: buying at the cap is refused', buyAtCap.status === 400 && buyAtCap.json?.error === 'at_cap', `status=${buyAtCap.status} error=${buyAtCap.json?.error}`);
    const coinsAfterCap = await balance(s.token, S);
    check('shop: the refused purchase did not charge', coinsAfterCap === 970, `coins=${coinsAfterCap}`);
  }

  // Throwaway users are NOT removed automatically: the server exposes no delete
  // endpoint (the generic table POST was removed for security). Always run the
  // cleanup below after a test run, or the DB accumulates `ec_*` rows.
  console.log(`\n${created.length} throwaway users created — clean up with:`);
  console.log(`  DELETE FROM matches WHERE user_id LIKE 'ec\\_%';`);
  console.log(`  DELETE FROM notifications WHERE user_id LIKE 'ec\\_%' OR sender_id LIKE 'ec\\_%';`);
  console.log(`  DELETE FROM friendships WHERE user_id LIKE 'ec\\_%' OR friend_id LIKE 'ec\\_%';`);
  console.log(`  DELETE FROM messages WHERE sender_id LIKE 'ec\\_%' OR receiver_id LIKE 'ec\\_%';`);
  console.log(`  DELETE FROM profiles WHERE id LIKE 'ec\\_%';`);

  const failed = results.filter(r => !r.ok);
  console.log(`\n===== ${results.length - failed.length}/${results.length} checks passed =====`);
  if (failed.length) { console.log('FAILURES:'); failed.forEach(f => console.log('  - ' + f.name)); process.exit(1); }
  process.exit(0);
})().catch(e => { console.error('E2E ERROR:', e.message); process.exit(2); });
