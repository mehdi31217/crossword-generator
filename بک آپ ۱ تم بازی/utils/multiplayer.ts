import { supabase } from './gameServer';
import { Grid, Clue, Category, MultiPlayerInfo, GameMode, AttackType, GridSize } from '../types';
import { debug } from './debug';
import { PROTOCOL_VERSION } from './config';

export type PlayerPreference = {
    playerId: string;
    playerName: string;
    playerAvatar: string;
    category: Category;
    size: GridSize;
};

type MultiplayerCallbacks = {
    onPlayerJoin: (player: MultiPlayerInfo) => void;
    onGameStart: (grid: Grid, clues: { across: Clue[], down: Clue[] }, category: Category, mode: GameMode, hostInfo: MultiPlayerInfo) => void;
    onProgressUpdate: (playerId: string, progress: number, score: number) => void;
    onGameOver: (winnerId: string, winnerScore: number, winnerTime: number, loserId?: string, loserScore?: number) => void; 
    onAttackReceived?: (type: AttackType) => void;
    onInputReceived?: (coords: { r: number, c: number }) => void;
    onWordSolved?: (cells: { r: number, c: number, val: string }[]) => void;
    onEmojiReceived?: (emoji: string) => void;
    onCellReset?: (coords: { r: number, c: number }) => void;
    onPlayerLeft?: (reason?: string) => void;
    onPreferenceReceived?: (preference: PlayerPreference) => void; // NEW: For coin flip
    onCoinFlipResult?: (selectedCategory: Category, selectedSize: GridSize) => void; // NEW: Receive coin flip result from host
    onMergeAck?: (payload: any) => void; // NEW: Merge acknowledgment from joiner
    onGeneratingStatus?: (status: string) => void; // NEW: Host generating grid status
    onRequestGameData?: () => void; // NEW: Joiner requests game data resend
};

let channel: any = null;

/**
 * True when the peer's presence entry proves it predates the current wire
 * protocol. Every join from this build carries `proto`, so a missing/older
 * value means that browser is running a stale bundle — the exact failure mode
 * that leaves one player watching merge stages alone while the other sees
 * nothing (observed live room_147150: one client never broadcast a single
 * frame). Such a room can never converge, so the UI warns and bails out
 * instead of hanging forever.
 */
export const isPeerOutdated = (peer: any): boolean => {
    if (!peer) return false;
    const proto = Number(peer.proto);
    return !Number.isFinite(proto) || proto < PROTOCOL_VERSION;
};

/**
 * Safely cleans an object for broadcasting over the wire.
 * Uses JSON serialization to strip non-cloneable properties like functions or prototypes.
 * Specifically prevents DataCloneError in modern browsers.
 */
const clean = (obj: any) => {
    if (obj === undefined) return null;
    if (obj === null) return null;
    try {
        const str = JSON.stringify(obj);
        if (str === undefined) return null;
        return JSON.parse(str);
    } catch (e) {
        debug.warn('MP', 'Serialization Error:', e);
        return null;
    }
};

/**
 * Subscribe a channel and resolve once it reports SUBSCRIBED. Unlike the old
 * inline logic (which only *logged* "Retrying…" and then rethrew), this actually
 * retries the subscribe on transient failure. `onSubscribed` runs after a
 * successful subscribe (e.g. presence track / initial broadcast). Throws after
 * all attempts are exhausted.
 */
async function subscribeWithRetry(
    ch: any,
    opts: { attempts?: number; timeoutMs?: number; onSubscribed?: () => Promise<void> | void } = {}
): Promise<void> {
    const attempts = opts.attempts ?? 3;
    const timeoutMs = opts.timeoutMs ?? 10000;
    let lastErr: any = null;

    for (let attempt = 1; attempt <= attempts; attempt++) {
        try {
            await new Promise<void>((resolve, reject) => {
                const subTimeout = setTimeout(() => reject(new Error('Subscription timeout')), timeoutMs);
                ch.subscribe(async (status: string) => {
                    if (status === 'SUBSCRIBED') {
                        clearTimeout(subTimeout);
                        try {
                            if (opts.onSubscribed) await opts.onSubscribed();
                        } catch (e) {
                            debug.warn('MP', 'post-subscribe hook failed:', e);
                        }
                        resolve();
                    } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
                        clearTimeout(subTimeout);
                        reject(new Error(`Subscription failed: ${status}`));
                    }
                });
            });
            return; // success
        } catch (err: any) {
            lastErr = err;
            debug.warn('MP', `subscribe attempt ${attempt}/${attempts} failed: ${err?.message || err}`);
            try { await ch.unsubscribe(); } catch { /* ignore */ }
            if (attempt < attempts) await new Promise(r => setTimeout(r, 1000 * attempt));
        }
    }

    debug.error('MP', 'channel subscribe failed after all retries.');
    throw lastErr;
}

export const multiplayer = {
    generateRoomId(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    },

    async createRoom(roomId: string, player: MultiPlayerInfo, mode: GameMode, callbacks: MultiplayerCallbacks) {
        debug.log('MP', `createRoom: room=${roomId} player=${player.id} mode=${mode}`);
        if (channel) await this.leaveRoom();
        channel = supabase.channel(`room_${roomId}`, { config: { presence: { key: player.id } } });

        channel
            .on('presence', { event: 'sync' }, () => {
                const state = channel?.presenceState();
                debug.log('MP', `createRoom presence_sync: keys=${Object.keys(state || {}).join(',')}`);
                if (state) {
                    Object.keys(state).forEach(key => {
                        const p = state[key][0] as unknown as MultiPlayerInfo;
                        debug.log('MP', `createRoom presence_sync: found user ${p.id} vs local ${player.id}`);
                        if (p.id !== player.id) {
                            debug.log('MP', `createRoom: calling onPlayerJoin for ${p.id}`);
                            callbacks.onPlayerJoin(p);
                        }
                    });
                }
            })
            .on('presence', { event: 'leave' }, ({ key }) => {
                // Automatic Supabase event — may fire during brief WS reconnect, not a real forfeit
                debug.log('MP', `presence:leave key="${key}" local="${player.id}"`);
                if (key !== player.id && callbacks.onPlayerLeft) callbacks.onPlayerLeft('presence');
            })
            .on('broadcast', { event: 'progress' }, ({ payload }) => callbacks.onProgressUpdate(payload.id, payload.progress, payload.score))
            .on('broadcast', { event: 'game_over' }, ({ payload }) => callbacks.onGameOver(payload.winnerId, payload.winnerScore, payload.winnerTime, payload.loserId, payload.loserScore))
            .on('broadcast', { event: 'player_left' }, ({ payload }) => {
                // Explicit forfeit — opponent intentionally left, no grace period needed
                if (payload.playerId !== player.id && callbacks.onPlayerLeft) callbacks.onPlayerLeft(payload.reason || 'leave');
            })
            .on('broadcast', { event: 'attack' }, ({ payload }) => {
                if (payload.targetId === player.id && callbacks.onAttackReceived) callbacks.onAttackReceived(payload.type);
            })
            .on('broadcast', { event: 'input' }, ({ payload }) => {
                if (payload.playerId !== player.id && callbacks.onInputReceived) callbacks.onInputReceived(payload.coords);
            })
            .on('broadcast', { event: 'word_solved' }, ({ payload }) => {
                if (payload.playerId !== player.id && callbacks.onWordSolved) callbacks.onWordSolved(payload.cells);
            })
            .on('broadcast', { event: 'emoji' }, ({ payload }) => {
                if (payload.playerId !== player.id && callbacks.onEmojiReceived) callbacks.onEmojiReceived(payload.emoji);
            })
            .on('broadcast', { event: 'player_preference' }, ({ payload }) => {
                debug.log('MP', `createRoom: received preference from ${payload.playerId} cat=${payload.category} size=${payload.size}`);
                // Server replays cached prefs as well as live broadcasts; never let
                // our own preference masquerade as the opponent's.
                if (payload.playerId === player.id) return;
                if (callbacks.onPreferenceReceived) callbacks.onPreferenceReceived(payload);
            })
            .on('broadcast', { event: 'coin_flip_result' }, ({ payload }) => {
                debug.log('MP', `createRoom: received coin_flip_result cat=${payload.selectedCategory} size=${payload.selectedSize} sender=${payload.senderId} local=${player.id}`);
                if (payload.senderId !== player.id && callbacks.onCoinFlipResult) callbacks.onCoinFlipResult(payload.selectedCategory, payload.selectedSize);
            })
            .on('broadcast', { event: 'merge_ack' }, ({ payload }) => {
                debug.log('MP', `createRoom: received merge_ack from ${payload.playerId}`);
                if (callbacks.onMergeAck) callbacks.onMergeAck(payload);
            })
            .on('broadcast', { event: 'cell_reset' }, ({ payload }) => {
                if (payload.playerId !== player.id && callbacks.onCellReset) callbacks.onCellReset(payload.coords);
            })
            .on('broadcast', { event: 'request_game_data' }, () => {
                debug.log('MP', 'createRoom: received request_game_data from joiner');
                if (callbacks.onRequestGameData) callbacks.onRequestGameData();
            })
            // NEW: Fallback opponent detection when presence.sync misses
            .on('broadcast', { event: 'player_joined' }, ({ payload }) => {
                debug.log('MP', `createRoom: player_joined from ${payload.id}`);
                if (payload.id !== player.id && callbacks.onPlayerJoin) {
                    callbacks.onPlayerJoin(payload);
                }
            })
            // Track presence BEFORE subscribing. `track()` sets `userData`, and
            // LocalChannel's FIRST `channel:join` sends exactly that payload — so
            // registering the identity up-front means the member is created with
            // the real id instead of `undefined`.
            //
            // The old order (track only inside onSubscribed) relied on a
            // corrective second join a few ms later. When that frame was lost the
            // member stayed `undefined` FOREVER: both players then shared the key
            // "undefined", the second join evicted the first, presence never
            // showed an opponent, and the merge lobby hung on "waiting for
            // opponent". Observed live 2026-10-23 (room_910904): the server log
            // showed each room socket joining exactly once, as user="undefined".
            try { await channel.track(clean(player)); } catch (e) { debug.warn('MP', 'pre-subscribe track failed:', e); }
            // Subscribe with real retries; re-track once subscribed. Idempotent —
            // the server replaces the existing member entry for this socket.
            await subscribeWithRetry(channel, {
                onSubscribed: async () => {
                    try { await channel?.track(clean(player)); } catch (e) { debug.warn('MP', 'track failed:', e); }
                }
            });
    },

    async joinRoom(roomId: string, player: MultiPlayerInfo, callbacks: MultiplayerCallbacks) {
        debug.log('MP', `joinRoom: room=${roomId} player=${player.id}`);
        if (channel) await this.leaveRoom();
        channel = supabase.channel(`room_${roomId}`, { config: { presence: { key: player.id } } });

        channel
            .on('presence', { event: 'sync' }, () => {
                // NEW: Detect host when joining
                const state = channel?.presenceState();
                debug.log('MP', `joinRoom presence_sync: keys=${Object.keys(state || {}).join(',')}`);
                if (state) {
                    Object.keys(state).forEach(key => {
                        const p = state[key][0] as unknown as MultiPlayerInfo;
                        debug.log('MP', `joinRoom presence_sync: found user ${p.id} vs local ${player.id}`);
                        if (p.id !== player.id) {
                            debug.log('MP', `joinRoom: calling onPlayerJoin for ${p.id}`);
                            callbacks.onPlayerJoin(p);
                        }
                    });
                }
            })
            .on('presence', { event: 'leave' }, ({ key }) => {
                // Automatic Supabase event — may fire during brief WS reconnect, not a real forfeit
                debug.log('MP', `presence:leave key="${key}" local="${player.id}"`);
                if (key !== player.id && callbacks.onPlayerLeft) callbacks.onPlayerLeft('presence');
            })
            .on('broadcast', { event: 'start_game' }, ({ payload }) => callbacks.onGameStart(payload.grid, payload.clues, payload.category, payload.mode, payload.hostInfo))
            .on('broadcast', { event: 'progress' }, ({ payload }) => callbacks.onProgressUpdate(payload.id, payload.progress, payload.score))
            .on('broadcast', { event: 'game_over' }, ({ payload }) => callbacks.onGameOver(payload.winnerId, payload.winnerScore, payload.winnerTime, payload.loserId, payload.loserScore))
            .on('broadcast', { event: 'player_left' }, ({ payload }) => {
                // Explicit forfeit — opponent intentionally left, no grace period needed
                if (payload.playerId !== player.id && callbacks.onPlayerLeft) callbacks.onPlayerLeft(payload.reason || 'leave');
            })
            .on('broadcast', { event: 'attack' }, ({ payload }) => {
                if (payload.targetId === player.id && callbacks.onAttackReceived) callbacks.onAttackReceived(payload.type);
            })
            .on('broadcast', { event: 'input' }, ({ payload }) => {
                if (payload.playerId !== player.id && callbacks.onInputReceived) callbacks.onInputReceived(payload.coords);
            })
            .on('broadcast', { event: 'word_solved' }, ({ payload }) => {
                if (payload.playerId !== player.id && callbacks.onWordSolved) callbacks.onWordSolved(payload.cells);
            })
            .on('broadcast', { event: 'emoji' }, ({ payload }) => {
                if (payload.playerId !== player.id && callbacks.onEmojiReceived) callbacks.onEmojiReceived(payload.emoji);
            })
            .on('broadcast', { event: 'player_preference' }, ({ payload }) => {
                debug.log('MP', `joinRoom: received preference from ${payload.playerId} cat=${payload.category} size=${payload.size}`);
                if (payload.playerId === player.id) return;
                if (callbacks.onPreferenceReceived) callbacks.onPreferenceReceived(payload);
            })
            .on('broadcast', { event: 'coin_flip_result' }, ({ payload }) => {
                debug.log('MP', `joinRoom: received coin_flip_result cat=${payload.selectedCategory} size=${payload.selectedSize} sender=${payload.senderId} local=${player.id}`);
                if (payload.senderId !== player.id && callbacks.onCoinFlipResult) callbacks.onCoinFlipResult(payload.selectedCategory, payload.selectedSize);
            })
            .on('broadcast', { event: 'merge_ack' }, ({ payload }) => {
                debug.log('MP', `joinRoom: received merge_ack from ${payload.playerId}`);
                if (callbacks.onMergeAck) callbacks.onMergeAck(payload);
            })
            .on('broadcast', { event: 'generating_status' }, ({ payload }) => {
                if (callbacks.onGeneratingStatus) callbacks.onGeneratingStatus(payload.status || '');
            })
            .on('broadcast', { event: 'cell_reset' }, ({ payload }) => {
                if (payload.playerId !== player.id && callbacks.onCellReset) callbacks.onCellReset(payload.coords);
            })
            // NEW: Fallback opponent detection for joinRoom side
            .on('broadcast', { event: 'player_joined' }, ({ payload }) => {
                debug.log('MP', `joinRoom: player_joined from ${payload.id}`);
                if (payload.id !== player.id && callbacks.onPlayerJoin) {
                    callbacks.onPlayerJoin(payload);
                }
            })
            // Track presence BEFORE subscribing — see the createRoom note. The
            // first channel:join must already carry the real identity, otherwise
            // the joiner is registered as `undefined` and the host never sees it.
            try { await channel.track(clean(player)); } catch (e) { debug.warn('MP', 'pre-subscribe track failed:', e); }
            // Subscribe with real retries; on success track presence and
            // broadcast player_joined (fallback for host's presence_sync).
            await subscribeWithRetry(channel, {
                onSubscribed: async () => {
                    try {
                        await channel?.track(clean(player));
                        for (let retry = 0; retry < 3; retry++) {
                            try {
                                await channel?.send({ type: 'broadcast', event: 'player_joined', payload: { ...clean(player), proto: PROTOCOL_VERSION } });
                                break;
                            } catch (sendErr) {
                                if (retry < 2) await new Promise(r => setTimeout(r, 1000));
                                else debug.warn('MP', 'player_joined broadcast failed after retries');
                            }
                        }
                    } catch (e) { debug.warn('MP', 'track/send failed:', e); }
                }
            });
    },

    async startGame(grid: Grid, clues: any, category: Category, mode: GameMode, hostInfo: MultiPlayerInfo) {
        if (!channel) { debug.warn('MP', 'startGame: no channel'); return; }
        debug.log('MP', `startGame: broadcasting grid (${grid.length}x${grid[0].length}) cat=${category}`);
        for (let retry = 0; retry < 3; retry++) {
            try {
                await channel.send({ type: 'broadcast', event: 'start_game', payload: clean({ grid, clues, category, mode, hostInfo }) });
                return;
            } catch (sendErr) {
                if (retry < 2) await new Promise(r => setTimeout(r, 1000));
                else debug.warn('MP', 'startGame broadcast failed after retries');
            }
        }
    },

    async sendProgress(id: string, progress: number, score: number) {
        if (!channel) return;
        await channel.send({ type: 'broadcast', event: 'progress', payload: clean({ id, progress, score }) });
    },

    async sendInput(playerId: string, r: number, c: number) {
        if (!channel) return;
        await channel.send({ type: 'broadcast', event: 'input', payload: clean({ playerId, coords: { r, c } }) });
    },

    async sendWordSolved(playerId: string, cells: any[]) {
        if (!channel) return;
        // A solved word is the ONLY thing that crosses the wire, so a dropped frame
        // leaves the opponent's board permanently missing that word. Retry like the
        // other critical senders: re-delivery is harmless because the receiver only
        // fills cells that are still empty.
        for (let retry = 0; retry < 3; retry++) {
            try {
                await channel.send({ type: 'broadcast', event: 'word_solved', payload: clean({ playerId, cells }) });
                return;
            } catch (sendErr) {
                if (retry < 2) await new Promise(res => setTimeout(res, 400));
                else debug.warn('MP', 'sendWordSolved failed after retries', sendErr);
            }
        }
    },

    async sendEmoji(playerId: string, emoji: string) {
        if (!channel) return;
        await channel.send({ type: 'broadcast', event: 'emoji', payload: clean({ playerId, emoji }) });
    },

    async sendPreference(preference: PlayerPreference) {
        if (!channel) { debug.warn('MP', 'sendPreference: no channel'); return; }
        debug.log('MP', `Sending preference: cat=${preference.category} size=${preference.size} player=${preference.playerId}`);
        for (let retry = 0; retry < 2; retry++) {
            try {
                await channel.send({ type: 'broadcast', event: 'player_preference', payload: clean(preference) });
                return;
            } catch (sendErr) {
                if (retry < 1) await new Promise(r => setTimeout(r, 800));
                else debug.warn('MP', 'sendPreference failed after retry');
            }
        }
    },

  async sendCoinFlipResult(selectedCategory: Category, selectedSize: GridSize, playerId?: string) {
    if (!channel) { debug.warn('MP', 'sendCoinFlipResult: no channel'); return; }
    debug.log('MP', `Broadcasting coin flip result: cat=${selectedCategory} size=${selectedSize}`);
    for (let retry = 0; retry < 3; retry++) {
        try {
            await channel.send({ type: 'broadcast', event: 'coin_flip_result', payload: clean({ selectedCategory, selectedSize, senderId: playerId }) });
            return;
        } catch (sendErr) {
            if (retry < 2) await new Promise(r => setTimeout(r, 800));
            else debug.warn('MP', 'sendCoinFlipResult failed after retries');
        }
    }
  },

  async sendMergeAck(playerId: string) {
    if (!channel) { debug.warn('MP', 'sendMergeAck: no channel'); return; }
    debug.log('MP', `Sending merge ack from: ${playerId}`);
    for (let retry = 0; retry < 3; retry++) {
      try {
        await channel.send({ type: 'broadcast', event: 'merge_ack', payload: clean({ playerId }) });
        return;
      } catch (sendErr) {
        if (retry < 2) await new Promise(r => setTimeout(r, 800));
        else debug.warn('MP', 'sendMergeAck failed after retries');
      }
    }
  },

  async sendGeneratingStatus(status: string) {
    if (!channel) { debug.warn('MP', 'sendGeneratingStatus: no channel'); return; }
    debug.log('MP', `Generating status: ${status}`);
    try { await channel.send({ type: 'broadcast', event: 'generating_status', payload: clean({ status }) }); }
    catch (e) { debug.warn('MP', 'sendGeneratingStatus failed:', e); }
  },

    async sendAttack(targetId: string, type: AttackType) {
        if (!channel) return;
        await channel.send({ type: 'broadcast', event: 'attack', payload: clean({ targetId, type }) });
    },

    async sendCellReset(playerId: string, r: number, c: number) {
        if (!channel) { debug.warn('MP', 'sendCellReset: no channel'); return; }
        // The Eraser is a one-shot action with no other recovery path: if this
        // broadcast is lost, the victim's board keeps a letter the attacker has
        // already removed. Retry like the other critical senders.
        for (let retry = 0; retry < 3; retry++) {
            try {
                await channel.send({ type: 'broadcast', event: 'cell_reset', payload: clean({ playerId, coords: { r, c } }) });
                return;
            } catch (sendErr) {
                if (retry < 2) await new Promise(res => setTimeout(res, 500));
                else debug.warn('MP', 'sendCellReset failed after retries');
            }
        }
    },

    async requestGameData() {
        if (!channel) { debug.warn('MP', 'requestGameData: no channel'); return; }
        debug.log('MP', 'Requesting game data from host');
        await channel.send({ type: 'broadcast', event: 'request_game_data', payload: {} });
    },

    /**
     * Ask the server to re-send this room's member list and replayable state.
     * Used while waiting for an opponent: presence_sync is otherwise a one-shot
     * announcement, so a lost frame leaves that side waiting forever.
     */
    requestSync() {
        try { channel?.requestSync?.(); } catch (e) { debug.warn('MP', 'requestSync failed:', e); }
    },

    async signalWin(winnerId: string, winnerScore: number, winnerTime: number, loserId?: string, loserScore?: number) {
        if (!channel) return;
        const payload = clean({ winnerId, winnerScore, winnerTime, loserId, loserScore, timestamp: Date.now() });
        // Retry up to 3 times for reliability
        for (let i = 0; i < 3; i++) {
            try {
                await channel.send({ type: 'broadcast', event: 'game_over', payload });
                return;
            } catch (e) {
                if (i === 2) {
                    debug.warn('MP', 'signalWin failed after 3 attempts', e);
                } else {
                    await new Promise(r => setTimeout(r, 500 * (i + 1)));
                }
            }
        }
    },

    async broadcastLeave(playerId: string, reason: string = 'forfeit') {
        if (!channel) return;
        await channel.send({ type: 'broadcast', event: 'player_left', payload: clean({ playerId, reason }) });
    },

    async leaveRoom() {
        if (channel) {
            await channel.unsubscribe();
            channel = null;
        }
    }
};