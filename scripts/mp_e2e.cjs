/* Two-player online battle E2E test against the real server.
 * Simulates two independent clients: login -> matchmaking -> room -> WS broadcast
 * -> game_over echo -> arena create/join/result.
 *
 * Usage:
 *   npm run test:mp            (server must be running on 127.0.0.1:8081)
 *
 * NOTE: this creates throwaway users named `mp_a_*` … `mp_g_*`.
 * They are NOT removed automatically (the server exposes no delete endpoint).
 * Clean them up afterwards with:
 *   DELETE FROM matches WHERE user_id LIKE 'mp\_%';
 *   DELETE FROM notifications WHERE user_id LIKE 'mp\_%' OR sender_id LIKE 'mp\_%';
 *   DELETE FROM friendships WHERE user_id LIKE 'mp\_%' OR friend_id LIKE 'mp\_%';
 *   DELETE FROM messages WHERE sender_id LIKE 'mp\_%' OR receiver_id LIKE 'mp\_%';
 *   DELETE FROM profiles WHERE id LIKE 'mp\_%';
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

(async () => {
  const A = `mp_a_${Date.now()}`;
  const B = `mp_b_${Date.now()}`;

  // 1. login both players
  const la = await post('/login', { deviceId: A, username: 'PlayerA', coins: 1000 });
  const lb = await post('/login', { deviceId: B, username: 'PlayerB', coins: 1000 });
  check('both players login', la.status === 200 && !!la.json.token && lb.status === 200 && !!lb.json.token);
  const tokA = la.json.token, tokB = lb.json.token;

  // 2. connect both over WS and authenticate
  const pa = await connectPlayer(tokA, A, 'A');
  const pb = await connectPlayer(tokB, B, 'B');
  check('both players authenticate over WebSocket', true);

  // 3. matchmaking: A waits, B matches
  const j1 = await post('/matchmaking/join', { playerId: A, playerName: 'PlayerA', playerAvatar: '👤', mode: 'speed', wager: 0, leagueTrophies: 0 }, tokA);
  check('player A enters matchmaking queue (waiting)', j1.json?.status === 'waiting', `status=${j1.json?.status}`);

  const hostNotified = pa.waitFor(m => m.type === 'matchmaking:matched', 8000).catch(() => null);
  const j2 = await post('/matchmaking/join', { playerId: B, playerName: 'PlayerB', playerAvatar: '👤', mode: 'speed', wager: 0, leagueTrophies: 0 }, tokB);
  check('player B matched with A', j2.json?.status === 'matched' && !!j2.json?.roomId, `roomId=${j2.json?.roomId}`);
  const roomId = j2.json?.roomId;

  const hostMsg = await hostNotified;
  check('host A receives matchmaking:matched over WebSocket', !!hostMsg, hostMsg ? `isHost=${hostMsg.isHost}` : 'no message');
  check('matched payload carries opponent info', !!(hostMsg?.opponent?.id), hostMsg ? `opponent=${hostMsg.opponent?.id}` : '');

  // 4. both join the room channel
  pa.send({ type: 'channel:join', channel: `room_${roomId}`, data: { id: A, name: 'PlayerA', is_guest: false } });
  await pa.waitFor(m => m.type === 'join_ok', 4000);
  const bPresence = pb.waitFor(m => m.type === 'presence_sync' && m.users?.length >= 1, 4000).catch(() => null);
  pb.send({ type: 'channel:join', channel: `room_${roomId}`, data: { id: B, name: 'PlayerB', is_guest: false } });
  await pb.waitFor(m => m.type === 'join_ok', 4000);
  check('both players join the room channel (join_ok)', true);
  const pres = await bPresence;
  check('presence_sync reflects the other player', !!pres, pres ? `users=${pres.users.length}` : 'none');

  // 5. A broadcasts a move, B must receive it
  const bGotMove = pb.waitFor(m => m.type === 'channel:event' && m.event === 'grid_update', 5000).catch(() => null);
  pa.send({ type: 'channel:broadcast', channel: `room_${roomId}`, event: 'grid_update', senderId: A, payload: { row: 2, col: 3, letter: 'A' } });
  const moveMsg = await bGotMove;
  check('opponent receives a grid_update broadcast', !!moveMsg, moveMsg ? JSON.stringify(moveMsg.payload) : 'not received');

  // 6. sender must NOT receive its own non-game_over broadcast (no echo)
  let selfEcho = false;
  pa.waitFor(m => m.type === 'channel:event' && m.event === 'grid_update', 1200).then(() => { selfEcho = true; }).catch(() => {});
  await sleep(1400);
  check('sender does not receive its own grid_update echo', !selfEcho);

  // 7. game_over MUST echo back to the sender
  const aGotGameOver = pa.waitFor(m => m.type === 'channel:event' && m.event === 'game_over', 5000).catch(() => null);
  pb.send({ type: 'channel:broadcast', channel: `room_${roomId}`, event: 'game_over', senderId: B, payload: { score: 120 } });
  const goMsg = await aGotGameOver;
  check('game_over is echoed back to the sender', !!goMsg, goMsg ? `payload=${JSON.stringify(goMsg.payload)}` : 'not received');

  // 8. arena flow (wager escrow + payout)
  const c = await post('/arena/create', { playerId: A, mode: 'speed', wager: 50 }, tokA);
  check('arena game created (wager escrowed)', c.status === 200 && !!c.json?.gameId, `gameId=${c.json?.gameId}`);
  const gameId = c.json?.gameId;

  const aCoinsAfterCreate = (await post('/login', { deviceId: A })).json?.player?.coins;
  check('wager deducted from creator', aCoinsAfterCreate === 950, `coins=${aCoinsAfterCreate}`);

  const arenaHostNotified = pa.waitFor(m => m.type === 'arena:matched', 5000).catch(() => null);
  const jn = await post('/arena/join', { gameId, joinerId: B }, tokB);
  check('opponent joins the arena game', jn.status === 200 && !!jn.json?.roomId, `roomId=${jn.json?.roomId}`);
  const arenaRoomId = jn.json?.roomId;
  const arenaHost = await arenaHostNotified;
  check('creator notified of arena match over WebSocket', !!arenaHost);

  const bCoinsAfterJoin = (await post('/login', { deviceId: B })).json?.player?.coins;
  check('wager deducted from joiner', bCoinsAfterJoin === 950, `coins=${bCoinsAfterJoin}`);

  // 8b. The winner's `game_over` claim on the ARENA room channel is what the
  //     server arbitrates on. This mirrors multiplayer.signalWin() in the real
  //     client, and the server takes the claimer from the authenticated socket,
  //     never from the message body.
  pa.send({ type: 'channel:broadcast', channel: `room_${arenaRoomId}`, event: 'game_over', senderId: A, payload: { winnerId: A, winnerScore: 500, winnerTime: 90 } });
  await sleep(700); // let the server record the finish

  // 8c. THE ATTACK: the loser calls the result endpoint first and declares
  //     ITSELF the winner. The server must ignore the body and pay the player
  //     it actually saw finish. (Before this change the pot went to whoever
  //     called first, so the loser could simply take it.)
  const steal = await post('/arena/result', { roomId: arenaRoomId, winnerId: B }, tokB);
  check('loser cannot steal the pot — server arbitrates', steal.status === 200 && steal.json?.pot === 100, `status=${steal.status} pot=${steal.json?.pot}`);
  const bCoinsAfterSteal = (await post('/login', { deviceId: B })).json?.player?.coins;
  check('loser balance unchanged (still 950)', bCoinsAfterSteal === 950, `coins=${bCoinsAfterSteal}`);

  const aCoinsFinal = (await post('/login', { deviceId: A })).json?.player?.coins;
  check('recorded winner receives pot (950 + 100 = 1050)', aCoinsFinal === 1050, `coins=${aCoinsFinal}`);

  // 9. idempotency: second result call must not double-pay (and carries no
  //    winnerId at all, proving the body is ignored)
  const r2 = await post('/arena/result', { roomId: arenaRoomId }, tokA);
  const aCoinsAfterDup = (await post('/login', { deviceId: A })).json?.player?.coins;
  check('duplicate arena result does not double-pay', aCoinsAfterDup === 1050, `coins=${aCoinsAfterDup}`);

  // 10. a non-participant must not be able to report a result
  const C = `mp_c_${Date.now()}`;
  const lc = await post('/login', { deviceId: C, username: 'PlayerC', coins: 10 });
  const r3 = await post('/arena/result', { roomId: arenaRoomId, winnerId: C }, lc.json.token);
  check('non-participant cannot claim arena payout', r3.status === 403, `status=${r3.status}`);

  // 11. a player cannot impersonate another in matchmaking
  const imp = await post('/matchmaking/join', { playerId: A, playerName: 'x', mode: 'speed', wager: 0 }, tokB);
  check('matchmaking impersonation blocked', imp.status === 403, `status=${imp.status}`);

  // ─── 12. WAGERED RANKED MATCH — server-side escrow ─────────────────────
  // The ranked wager used to be deducted and refunded entirely on the client,
  // and the winner was never credited at all. It is now held in server-side
  // escrow keyed by roomId, and paid out from the same `game_over` record the
  // arena pot uses.
  const coinsOf = async (deviceId) => (await post('/login', { deviceId })).json?.player?.coins;
  const D = `mp_d_${Date.now()}`;
  const E = `mp_e_${Date.now()}`;
  const ld = await post('/login', { deviceId: D, username: 'PlayerD', coins: 500 });
  const le = await post('/login', { deviceId: E, username: 'PlayerE', coins: 500 });
  const tokD = ld.json.token, tokE = le.json.token;
  const pd = await connectPlayer(tokD, D, 'D');
  const pe = await connectPlayer(tokE, E, 'E');

  const WAGER = 40;
  const joinQueue = (id, name, tok, wager = WAGER) =>
    post('/matchmaking/join', { playerId: id, playerName: name, playerAvatar: '👤', mode: 'speed', wager, leagueTrophies: 0 }, tok);

  // 12a. escrow debits exactly once per player
  await joinQueue(D, 'PlayerD', tokD);
  const dHostNotified = pd.waitFor(m => m.type === 'matchmaking:matched', 8000).catch(() => null);
  const m1 = await joinQueue(E, 'PlayerE', tokE);
  const battleRoom = m1.json?.roomId;
  const dHostMsg = await dHostNotified;
  check('wagered match: matched with a non-zero wager', m1.json?.status === 'matched' && !!battleRoom && dHostMsg?.wager === WAGER, `roomId=${battleRoom} wager=${dHostMsg?.wager}`);

  const eD = await post('/battle/escrow', { roomId: battleRoom }, tokD);
  check('wagered match: host escrow debits the wager', eD.status === 200 && eD.json?.coins === 500 - WAGER, `coins=${eD.json?.coins}`);
  const eE = await post('/battle/escrow', { roomId: battleRoom }, tokE);
  check('wagered match: joiner escrow debits the wager', eE.status === 200 && eE.json?.coins === 500 - WAGER, `coins=${eE.json?.coins}`);

  const eD2 = await post('/battle/escrow', { roomId: battleRoom }, tokD);
  check('wagered match: escrow is idempotent (no double debit)', eD2.status === 200 && eD2.json?.coins === 500 - WAGER && eD2.json?.alreadyEscrowed === true, `coins=${eD2.json?.coins}`);

  const eOutsider = await post('/battle/escrow', { roomId: battleRoom }, lc.json.token);
  check('wagered match: a non-participant cannot escrow', eOutsider.status === 403, `status=${eOutsider.status}`);

  // 12b. the winner is decided by the server from the `game_over` claim
  pd.send({ type: 'channel:join', channel: `room_${battleRoom}`, data: { id: D, name: 'PlayerD', is_guest: false } });
  await pd.waitFor(m => m.type === 'join_ok', 4000);
  pe.send({ type: 'channel:join', channel: `room_${battleRoom}`, data: { id: E, name: 'PlayerE', is_guest: false } });
  await pe.waitFor(m => m.type === 'join_ok', 4000);
  pd.send({ type: 'channel:broadcast', channel: `room_${battleRoom}`, event: 'game_over', senderId: D, payload: { winnerId: D, winnerScore: 400, winnerTime: 60 } });
  await sleep(700);

  // the LOSER settles first — the server must ignore any claim it makes
  const settleLoser = await post('/battle/result', { roomId: battleRoom }, tokE);
  check('wagered match: loser settlement pays nothing', settleLoser.status === 200 && settleLoser.json?.won === false && settleLoser.json?.coins === 500 - WAGER, `won=${settleLoser.json?.won} coins=${settleLoser.json?.coins}`);

  const settleWinner = await post('/battle/result', { roomId: battleRoom }, tokD);
  check('wagered match: winner takes the pot (wager × 2)', settleWinner.status === 200 && settleWinner.json?.won === true && settleWinner.json?.pot === WAGER * 2 && settleWinner.json?.coins === 500 + WAGER, `won=${settleWinner.json?.won} pot=${settleWinner.json?.pot} coins=${settleWinner.json?.coins}`);

  const settleAgain = await post('/battle/result', { roomId: battleRoom }, tokD);
  check('wagered match: settlement is idempotent (no double payout)', settleAgain.json?.coins === 500 + WAGER && settleAgain.json?.alreadySettled === true, `coins=${settleAgain.json?.coins}`);

  // 12c. a decided match cannot be cancelled out of (the loser would dodge the loss)
  const cancelDecided = await post('/battle/cancel', { roomId: battleRoom }, tokE);
  check('wagered match: cancel is refused once decided', cancelDecided.status === 409, `status=${cancelDecided.status}`);

  // ─── 13. CANCEL BEFORE A DECISION REFUNDS THE ESCROW ───────────────────
  await joinQueue(D, 'PlayerD', tokD);
  const dHost2 = pd.waitFor(m => m.type === 'matchmaking:matched', 8000).catch(() => null);
  const m2 = await joinQueue(E, 'PlayerE', tokE);
  const cancelRoom = m2.json?.roomId;
  await dHost2;
  await post('/battle/escrow', { roomId: cancelRoom }, tokD);
  await post('/battle/escrow', { roomId: cancelRoom }, tokE);
  const beforeCancel = await coinsOf(D);
  const cx = await post('/battle/cancel', { roomId: cancelRoom }, tokD);
  check('cancel refunds the escrow before a decision', cx.status === 200 && cx.json?.refunded === WAGER && cx.json?.coins === beforeCancel + WAGER, `refunded=${cx.json?.refunded} coins=${cx.json?.coins}`);
  const cx2 = await post('/battle/cancel', { roomId: cancelRoom }, tokD);
  const afterSecondCancel = await coinsOf(D);
  check('cancel is idempotent (no double refund)', cx2.status === 200 && cx2.json?.refunded === 0 && afterSecondCancel === beforeCancel + WAGER, `refunded=${cx2.json?.refunded} coins=${afterSecondCancel}`);

  // ─── 14. AN UNDECIDED ROOM IS VOIDED, NOT PAID ─────────────────────────
  await joinQueue(D, 'PlayerD', tokD);
  const dHost3 = pd.waitFor(m => m.type === 'matchmaking:matched', 8000).catch(() => null);
  const m3 = await joinQueue(E, 'PlayerE', tokE);
  const voidRoom = m3.json?.roomId;
  await dHost3;
  await post('/battle/escrow', { roomId: voidRoom }, tokD);
  await post('/battle/escrow', { roomId: voidRoom }, tokE);
  const beforeVoid = await coinsOf(D);
  const voidRes = await post('/battle/result', { roomId: voidRoom }, tokD);
  check('an undecided room is voided and both escrows refunded', voidRes.json?.voided === true && voidRes.json?.pot === 0 && voidRes.json?.coins === beforeVoid + WAGER, `voided=${voidRes.json?.voided} coins=${voidRes.json?.coins}`);

  // ─── 15. ESCROW REFUSES AN UNCOVERABLE WAGER ───────────────────────────
  const F = `mp_f_${Date.now()}`;
  const G = `mp_g_${Date.now()}`;
  const lf = await post('/login', { deviceId: F, username: 'PlayerF', coins: 5 });
  const lg = await post('/login', { deviceId: G, username: 'PlayerG', coins: 5 });
  // /login floors a brand-new balance at 250 (clampInitialCoins), so a wager
  // above that cannot be covered.
  const POOR_WAGER = 1000;
  await joinQueue(F, 'PlayerF', lf.json.token, POOR_WAGER);
  const m4 = await joinQueue(G, 'PlayerG', lg.json.token, POOR_WAGER);
  const poorRoom = m4.json?.roomId;
  check('wagered match: an underfunded pair still matches', m4.json?.status === 'matched' && !!poorRoom, `roomId=${poorRoom}`);
  const beforePoor = await coinsOf(F);
  const ePoor = await post('/battle/escrow', { roomId: poorRoom }, lf.json.token);
  check('escrow is refused when the balance cannot cover the wager', ePoor.status === 400, `status=${ePoor.status} error=${ePoor.json?.error}`);
  const poorCoins = await coinsOf(F);
  check('a refused escrow leaves the balance untouched', poorCoins === beforePoor, `before=${beforePoor} after=${poorCoins}`);

  pa.ws.close(); pb.ws.close(); pd.ws.close(); pe.ws.close();

  // cleanup test users
  await fetch(HTTP + '/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ deviceId: A }) });

  const failed = results.filter(r => !r.ok);
  console.log(`\n===== ${results.length - failed.length}/${results.length} checks passed =====`);
  if (failed.length) { console.log('FAILURES:'); failed.forEach(f => console.log('  - ' + f.name)); process.exit(1); }
  process.exit(0);
})().catch(e => { console.error('E2E ERROR:', e.message); process.exit(2); });
