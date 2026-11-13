# E2E Audit: Challenge & Matchmaking Flow

> Complete end-to-end trace of the multiplayer challenge flow, including Quick Match.
> Generated: 2026-06-17

---

## 1. Challenge Flow (Host → Joiner)

### Phase 1 — Room Creation (Host)

```
Host clicks "Challenge" in Lobby/SocialPanel
  → useChallengeSystem.handleChallengeFriend(friendId, size, category)
    → multiplayerState.createRoom('battle', ...)
      → multiplayer.createRoom(room_XXXXX, playerInfo, mode, callbacks)
        → LocalChannel('room_XXXXX')
          → .on('presence', ...) — sync handler calls onPlayerJoin
          → .on('broadcast', player_preference, ...)
          → .on('broadcast', coin_flip_result, ...)
          → .on('broadcast', merge_ack, ...)
          → .on('broadcast', start_game, ...)
          → .on('broadcast', progress, game_over, attack, ...)
          → .subscribe() → ensureConnected() → WS connect → channel:join
          → .track(player) → channel:join with data
        → presence_sync fires on WS (but only host in channel)
    → gameServer.registerRoom(roomId, hostId)   ← HTTP POST /api/room/register
    → gameServer.sendChallenge(...)              ← HTTP POST /api/notifications
        → Server creates DB notification (type='challenge')
        → Server sends 'notification:new' WS to joiner via sendToUser()
        → Server stores in pendingNotifications for re-delivery
    → setView('playing')
```

**Issues:**
1. ⚠️ `registerRoom` returns `false` on HTTP failure but doesn't abort the challenge — the room still works if WS channel is active, but joiner's `checkRoom()` returns `false` and they see "منقضی شده"
2. ⚠️ `sendChallenge` has NO retry — if WS notification delivery to joiner fails, joiner never sees the challenge (HTTP polling backup at 2s interval catches it though)
3. ⚠️ Host sets `view='playing'` BEFORE joiner joins — MergeLobby shows immediately with `opponent=null`, causing `MultiplayerWaitingOverlay` to flash briefly (condition: `!multiplayerState.opponent`)

### Phase 2 — Challenge Acceptance (Joiner)

```
Joiner receives notification (WS + HTTP polling backup)
  → useChallengeSystem notification watcher → setIncomingChallenge(latest)
  → Auto-dismiss after 20s if not acted upon
  → handleChallengeClickAccept()
    → checkRoom(roomId)                        ← HTTP POST /api/room/check
        → Server checks wsChannels + roomRegistry
    → Opens BattleInviteDialog (accept mode)
  → handleChallengeDialogAccept()
    → handleAcceptChallenge(incomingChallenge, joinerCat, joinerSize)
      → checkRoom(roomId) again!
      → setSize(joinerSize), setCategory(joinerCat)
      → sendChallengeAccepted(...)              ← HTTP POST /api/challenge/accept
          → Server deletes notification
          → Server pushes 'challenge:accepted' WS to host (5 retries, 1s apart)
      → multiplayerState.joinRoom(roomId, ...)
        → multiplayer.joinRoom(room_XXXXX, playerInfo, callbacks)
          → LocalChannel('room_XXXXX')
          → .subscribe() → ensureConnected() → WS connect → channel:join
          → .track(player)
          → Broadcast 'player_joined' (3 retries, 1s apart)
      → setView('playing')
```

**Issues:**
4. ⚠️ `checkRoom()` called TWICE (`handleChallengeClickAccept` + `handleAcceptChallenge`) — between these two calls, the room could expire. The second check has no retry.
5. ⚠️ Room check TTL inconsistency: server `room/check` uses `60000ms` (60s) hardcoded but room registry TTL is `300000ms` (5min). Room registered 70s ago returns `exists=false` from the check endpoint even though the room is still valid.
6. ⚠️ `sendChallengeAccepted` has HTTP try/catch but doesn't retry the WS notification if HTTP succeeds but WS fails — the `delivered` variable is returned from the server but the client ignores it.
7. ⚠️ Joiner's `setView('playing')` happens AFTER `joinRoom` completes — the local state transition (MergeLobby showing) is delayed compared to the host who set view immediately in Phase 1.

### Phase 2b — Host Receives Joiner

```
Joiner broadcasts 'player_joined' (WS room channel, 3 retries)
  → Host's onPlayerJoin fires
  → setOpponent(joinerInfo)
  → Host's MergeLobby shows "Connected" step ✓

Host also receives 'challenge:accepted' WS notification (via global_social)
  → UseSocial callback → msg === 'challenge_accepted'
  → Stores joiner's size/category in challengeRef.current.challengeGuestPref
  → This is the FALLBACK preference if WS preference exchange fails
```

**Issues:**
8. ✅ `player_joined` broadcast has 3 retries — good
9. ⚠️ Two separate WS channels deliver the same event:
    - WS #1 (global_social): `challenge:accepted` message from server's `sendToUser()`
    - WS #2 (room_XXXXX): `player_joined` message from joiner's broadcast
    - These can arrive in ANY order, and the MergeLobby depends on WS #2's presence

### Phase 3 — Preference Exchange

```
Both sides (independently, via useCoinFlip effect):
  → Send myPreference via multiplayer.sendPreference()
    → Broadcast 'player_preference' over WS (2 retries, 800ms apart)
  → Each side receives opponent's preference via onPreferenceReceived
    → setOpponentPreference(pref)

App.tsx effect (auto-trigger when both preferences set + coinFlipActive):
  → 2s delay for visual animation
  → handleCoinFlipComplete(hostCategory, mergedSize)
```

**Issues:**
10. ⚠️ Preference exchange depends on host's `useCoinFlip` effect which only fires when `multiplayerState.opponent && player && !myPreference`. If joiner's preference arrives BEFORE host's effect fires, the host already has `opponentPreference` set. When the effect fires, it sends host's preference. Then joiner receives it. This works but is fragile.
11. ⚠️ Preference send has only 2 retries (800ms apart) vs 3 for `coin_flip_result` — most critical message should have the most retries
12. ⚠️ **Two separate 2s timers**: `useMultiplayerState` has a 2s timer to `setShowCoinFlip(true)`, then App.tsx has another 2s timer to auto-trigger `handleCoinFlipComplete`. Total 4s wait before merge starts. This is deliberate for UX animation but fragile if either timer is cancelled.

### Phase 3b — Fallback (Host, 10s timeout)

```
If host doesn't receive opponent's preference within 10s:
  → Uses challengeGuestPref.current (stored from HTTP accept)
  → Falls back to host's own preference if guestPref is null
  → Merges with host's preference
  → Sends coin_flip_result
  → Sets mergeAckReceived = true
  → Proceeds without WS preference exchange
```

**Issues:**
13. ⚠️ No validation that `challengeGuestPref.current` contains valid data — it could be `null` or have stale values from a previous challenge
14. ⚠️ When fallback fires, it calls `multiplayer.sendCoinFlipResult()` AND `multiplayerState.setMergeAckReceived(true)` — but the joiner never sent a merge_ack. The host proceeds without the joiner's acknowledgment.
15. ⚠️ The 10s fallback and the 10s merge_ack timeout could fire simultaneously, causing duplicate grid generation attempts

### Phase 4 — Merge / Coin Flip

```
handleCoinFlipComplete(selectedCategory, selectedSize):
  → Calculate mergedCats = [hostCat, guestCat]
  → setMergedCategories(mergedCats)
  → setFinalCategory(hostCat)
  → setFinalSize(mergedSize)
  → setCategory(hostCat), setSize(mergedSize)
  → Host: sendCoinFlipResult(hostCat, mergedSize, playerId) — 3 retries
  → Joiner: sendMergeAck(playerId)
  → setShowCoinFlip(false)
  → setCoinFlipDone() — sets coinFlipDoneRef.current = true
```

**Issues:**
16. ⚠️ `coinFlipDoneRef` only resets when `showCoinFlip` turns false (App.tsx line 316). If coin flip is cancelled (opponent leaves), `showCoinFlip` is already false but `coinFlipDoneRef` remains true, blocking future re-triggers until `resetState()` is called.
17. ⚠️ Joiner receives `coin_flip_result` AND also sends `merge_ack` — these cross in transit. If the joiner hasn't yet received the host's preference when the coin_flip_result arrives, the merge could use stale category/size.
18. ⚠️ `sendCoinFlipResult` uses `playerId` as `senderId` for the filter `payload.senderId !== player.id`. This means on the host, if `playerId` is undefined, the senderId filter won't match and the host could receive its own broadcast.

### Phase 5 — Grid Generation (Host Only)

```
Host's useCoinFlip effect detects:
  isHost && opponent && !grid && loading=idle && !retryModal && finalCategory+Size && mergeAckReceived
  → 1.2s delay
  → generateGrid(false, finalSize, undefined, undefined, mergedCategories)
  → If successful:
    → multiplayerState.setGameStarted(true)
    → multiplayer.startGame() — broadcast 'start_game' (3 retries, 1s apart)
  → If failed:
    → setShowMultiplayerRetryModal(true)
    → hasGeneratedForOpponentRef = false (allows retry)

Joiner receives 'start_game':
  → onGameStart callback
  → setExternalGrid(grid, clues)
  → 800ms delay
  → setView('playing')
  → Deduct battleWager
```

**Issues:**
19. ⚠️ The 1.2s delay before grid generation is arbitrary and adds unnecessary latency. If the merge UI animation doesn't need to play for 1.2s, this is wasted time.
20. ⚠️ `hasGeneratedForOpponentRef` is set to true BEFORE `generateGrid()` resolves. If `generateGrid` fails asynchronously, this ref is reset to false, but there's a window where it's true while grid is null.
21. ⚠️ Joiner's `setView('playing')` triggers a re-render at 800ms, but the grid data arrives via `setExternalGrid` asynchronously. The GameView component has a `userGrid` dependency that may not be set yet when the view changes.

### Phase 6 — Gameplay + Game Over

```
Progress synced via 'progress' broadcasts (every matchScore change)
Attacks via 'attack' broadcasts
Game ends:
  → multiplayer.signalWin() — broadcasts 'game_over' (SENDS TO ALL, including sender)
  → handleGameOverEvent fires on both sides
    → gameOverRef guards against duplicate processing
    → Calculates win/lose/draw based on mode (speed vs battle)
    → setFinalResult(...)
```

**Issues:**
22. ⚠️ `game_over` broadcast echoes back to sender (line 331-337 in wsServer.js: `broadcastToChannel` without `ws` exclusion). This means the sender also receives its own `game_over` event. The senderId filter in the client should prevent double-processing, but the event still fires twice.
23. ⚠️ `signalWin()` does NOT await the send (`channel.send({...})` with no await). If the send fails, the opponent never sees game_over. There's no retry.
24. ⚠️ Battle mode score comparison (useMultiplayerState lines 169-203) uses `matchScoreRef.current` vs `opponentScoreRef.current` — both are refs that update asynchronously. There's a race between the last progress update and the game_over event.

---

## 2. Matchmaking (Quick Match) Flow

```
Player clicks "Quick Match"
  → useMatchmakingActions.handleQuickMatch(mode, wager)
    → gameServer.joinMatchmaking(...)         ← HTTP POST /api/matchmaking/join
      → Server calls redis.matchmakingAdd(player)
        → Redis: ZADD to sorted set per mode:wager
        → If no match: return { status: 'waiting' }
        → If match found: ZREM both entries, return { status: 'matched', roomId, opponent, isHost: false }
      → If matched: sendToUser(opponent, matchmaking:matched) — WS notification
      → Response to B: { status: 'matched', roomId, isHost: false, ... }
      → Response to A: { status: 'waiting' } [A starts polling /api/matchmaking/status every 2s]
```

**Two paths from here:**

**Path A (Host received WS notification):**
  → useSocial callback → matchmakingHandlerRef
  → createRoomWithId(roomId, ...) → setView('playing')
  → Now waiting for joiner to join the room

**Path B (Joiner got immediate match response):**
  → handleJoinRoom(roomId) → joinRoom(...) → setView('playing')
  → Now waiting for host to generate grid

**Issues:**
25. 🔴 **CRITICAL**: Matchmaking WS notification to host has NO retry. `sendToUser()` is called ONCE (server line 893). If the host is temporarily disconnected or the WS isn't ready, the notification is lost. The host keeps polling and gets 'unknown' → silently gives up. The joiner gets 'matched' and waits forever.
26. 🔴 **CRITICAL**: Race condition in `redis.matchmakingAdd` — ZADD + ZRANGEBYSCORE is not atomic (TOCTOU). Two concurrent requests from different instances can both see zcard=0 and both add themselves, missing the match. The 2s polling + matchmaking status check mitigates this but doesn't eliminate it. Need Lua scripting or a WATCH transaction.
27. ⚠️ `matchmakingStatus` polling only handles 'timeout' and 'unknown' — it stops polling on 'unknown' without calling `setIsMatchmaking(false)`, leaving the UI stuck showing "waiting"

---

## 3. Dual WebSocket Delivery Summary

| Event | WS Channel | Retry | Fallback |
|-------|-----------|-------|----------|
| `notification:new` (challenge) | global_social (WS #1) | 5 retries, 1s apart | HTTP polling 2s |
| `challenge:accepted` | global_social (WS #1) | 5 retries, 1s apart | None (HTTP just confirms) |
| `player_joined` | room_XXXXX (WS #2) | 3 retries, 1s apart | presence_sync |
| `player_preference` | room_XXXXX (WS #2) | 2 retries, 800ms | 10s fallback via HTTP guestPref |
| `coin_flip_result` | room_XXXXX (WS #2) | 3 retries, 800ms | 10s merge_ack timeout |
| `merge_ack` | room_XXXXX (WS #2) | 1 send, no retry | 10s timeout on host |
| `start_game` | room_XXXXX (WS #2) | 3 retries, 1s apart | joinTimeout (35s) |
| `game_over` | room_XXXXX (WS #2) | 1 send (no await), no retry | None |
| `matchmaking:matched` | global_social (WS #1) | 1 send, no retry | Polling (but broken for host) |
| `player_left` | room_XXXXX (WS #2) | 5s grace, 1 send | Grace period cancellation |
| `progress` | room_XXXXX (WS #2) | 1 send | Every score change retries |

---

## 4. Critical Fixes Needed

### FIX 1 — Matchmaking WS notification retry
**File:** `server/index.js` (line 893)
**Problem:** `sendToUser(opponent.playerId, ...)` has NO retry after `redis.matchmakingAdd` returns matched.
**Fix:** Wrap in retry loop (5 attempts, 1s apart) like `challenge/accept` does.

### FIX 2 — Redis matchmakingAdd Lua scripting
**File:** `server/redis.js` (line 146-183)
**Problem:** ZADD + ZRANGEBYSCORE is not atomic — TOCTOU race between two concurrent requests.
**Fix:** Use a Lua script (EVAL) for the find-or-add operation: `redis.call('ZADD', ...); local candidates = redis.call('ZRANGEBYSCORE', ...); ...`

### FIX 3 — Room check TTL consistency
**File:** `server/index.js` (line 856)
**Problem:** `room/check` uses 60s hardcoded TTL but room registry TTL is 300000ms (5min).
**Fix:** Use the same ROOM_REGISTRY_TTL constant: `Date.now() - reg.createdAt < ROOM_REGISTRY_TTL`

### FIX 4 — Matchmaking polling silent exit
**File:** `hooks/useMatchmakingActions.ts` (lines 105-110)
**Problem:** Polling gets 'unknown' → stops polling but doesn't call `setIsMatchmaking(false)` or `setMatchmakingStatus('idle')`, leaving UI stuck on "waiting".
**Fix:** When polling returns 'unknown', call `setIsMatchmaking(false)` and `setMatchmakingStatus('idle')`.

### FIX 5 — game_over reliability
**File:** `utils/multiplayer.ts` (lines 318-326)
**Problem:** `signalWin()` uses `channel.send()` without await, no retry.
**Fix:** Add await + retry loop.

---

## 5. Low Priority Issues

- **Auto-trigger 2s+2s stacking** (useMultiplayerState + App.tsx): Total 4s delay before merge. Consider combining into one timer.
- **Preference refactor**: useCoinFlip manages preference effect + grid generation but the auto-trigger is in App.tsx. Move to a unified hook.
- **challengeGuestPref stale data**: No cleanup between challenge attempts. Add clear on challenge cancel/decline.
- **hasGeneratedForOpponentRef timing**: Set to true before async generateGrid. Consider setting after the promise resolves.
- **game_over echoing to sender**: Server broadcasts game_over to all including sender. Client filters by senderId, but the extra message is wasteful.
