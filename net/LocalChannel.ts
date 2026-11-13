import { WS_URL, PROTOCOL_VERSION } from '../utils/config';
import { debug } from '../utils/debug';
import { getToken, api, refreshToken } from '../api/client';

type WSCallback = (msg: any) => void;
type ChannelHandler = { event: string; callback: WSCallback; filter?: any };

class LocalChannel {
  private ws: WebSocket | null = null;
  private channelName: string;
  private handlers: ChannelHandler[] = [];
  private userId: string = 'guest';
  // Carries the wire protocol version from the very first channel:join, so the
  // server can spot a room member running a stale bundle.
  private userData: any = { proto: PROTOCOL_VERSION };
  private _status: string = 'unsubscribed';
  private _presenceState: Record<string, any[]> = {};
  private pendingMessages: any[] = [];
  private flushPendingTimer: any = null;
  private wsConnectPromise: Promise<void> | null = null; // Guard against concurrent connectWS calls
  private reconnectAttempt: number = 0;
  private _unsubscribed: boolean = false; // Explicit flag to prevent reconnect after unsubscribe
  private _joinConfirmed: boolean = false; // Server acknowledged channel:join via join_ok
  private _pendingJoinResolve: ((value: void) => void) | null = null; // Resolver for join confirmation
  private _joinOkFallbackTimer: ReturnType<typeof setTimeout> | null = null; // Fallback timer if server doesn't send join_ok
  // Dedupe keys for state the server replays on every presence sync, so a
  // replayed frame cannot cascade into endless re-renders.
  private _lastPrefSig = new Map<string, string>();
  private _lastMergeSig: string | null = null;

  constructor(name: string) {
    this.channelName = name;
  }

  on(event: string, filterOrCb: any, cb?: any) {
    if (event === 'presence') {
      const presenceEvent = filterOrCb?.event || '';
      this.handlers.push({ event: 'presence', callback: cb || filterOrCb, filter: presenceEvent });
    } else if (event === 'broadcast') {
      this.handlers.push({ event: 'broadcast', callback: cb || filterOrCb, filter: filterOrCb });
    } else if (event === 'postgres_changes') {
      this.handlers.push({ event: 'pg_change', callback: cb, filter: filterOrCb });
    }
    return this;
  }

  async subscribe(cb?: (status: string) => void | Promise<void>) {
    this._status = 'SUBSCRIBED';
    // Connect the WebSocket BEFORE firing the callback, so the caller
    // knows the channel is truly ready (not just synchronously resolved).
    await this.ensureConnected();
    if (cb) {
      // Await the callback result: a void return resolves immediately, a
      // Promise is awaited — equivalent to the previous `instanceof Promise` guard.
      await cb('SUBSCRIBED');
    }
    return this;
  }

  async track(data: any) {
    this.userData = { ...(data || {}), proto: PROTOCOL_VERSION };
    // `clean(player)` carries `id`; `user_id` is only the legacy/social shape.
    // Using the wrong field made every broadcast report senderId="guest".
    this.userId = data.id || data.user_id || 'guest';
    await this.ensureConnected();
    // Send updated presence to server so channel:join has proper user data.
    // The initial channel:join in connectWSImpl() sends empty data (this.userData is set
    // later by the caller), so we re-join here with the real user info. This fixes
    // presence_sync so both sides detect each other via the room channel.
    //
    // `is_guest` MUST be repeated here when the socket joined as a guest: the
    // server only accepts a `channel:join` on a ROOM channel from an
    // UNAUTHENTICATED socket when `data.is_guest === true`. Without it this
    // corrective join is rejected with "ابتدا باید احراز هویت کنید" — an error
    // LocalChannel has no handler for, so it fails silently and the member stays
    // registered as `undefined` forever (both players collide on that key, the
    // second join evicts the first, and the merge lobby hangs).
    if (this.ws?.readyState === WebSocket.OPEN) {
      const joinData: any = { ...this.userData };
      if (this._isGuest) joinData.is_guest = true;
      debug.log('WS', `track: updating presence for "${this.channelName}" userId=${this.userData.id || this.userId} guest=${this._isGuest}`);
      this.ws.send(JSON.stringify({
        type: 'channel:join',
        channel: this.channelName,
        data: joinData,
      }));
    } else {
      // Loud on purpose: a silently skipped presence update is indistinguishable
      // from "the opponent never joined" on the other screen.
      debug.warn('WS', `track: WS not OPEN for "${this.channelName}" (state=${this.ws?.readyState}) — presence update NOT sent`);
    }
  }

  /**
   * Ensure the underlying WebSocket is connected and joined to this channel.
   * Idempotent — if already connected, resolves immediately without reconnecting.
   */
  private async ensureConnected(): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN && this._authenticated) {
      return; // Already connected
    }
    if (this.wsConnectPromise) {
      // A connection attempt is already in flight — piggyback on it
      return this.wsConnectPromise;
    }
    this.wsConnectPromise = this.connectWSImpl();
    return this.wsConnectPromise;
  }

  /** Tracks whether the auth+channel:join handshake completed */
  private _authenticated = false;

  /**
   * True when this socket joined as a GUEST (no token, or the token was
   * rejected). The server only accepts a `channel:join` on a room channel from
   * an unauthenticated socket when `data.is_guest === true`, so `track()` must
   * repeat the flag on its corrective join — otherwise that join is rejected
   * and the member stays `undefined` forever.
   */
  private _isGuest = false;

  /** Schedule a fallback timeout for join_ok — resolves the connection without server ack for backward compat */
  private scheduleJoinOkFallback(resolve: (value: void) => void) {
    this.clearJoinOkFallback();
    this._pendingJoinResolve = resolve;
    this._joinOkFallbackTimer = setTimeout(() => {
      if (this._pendingJoinResolve) {
        debug.warn('WS', `join_ok fallback for "${this.channelName}" — resolving without join_ok`);
        this._joinConfirmed = true;
        this._pendingJoinResolve();
        this._pendingJoinResolve = null;
      }
    }, 3000);
  }

  /** Clear the join_ok fallback timer */
  private clearJoinOkFallback() {
    if (this._joinOkFallbackTimer) {
      clearTimeout(this._joinOkFallbackTimer);
      this._joinOkFallbackTimer = null;
    }
  }

  /** Clean up the connection promise guard when the underlying WS closes */
  private clearConnectGuard(resetAuth = false) {
    this.wsConnectPromise = null;
    if (resetAuth) this._authenticated = false;
  }

  /** Internal: the actual connection logic (not idempotent) */
  private connectWSImpl(): Promise<void> {
    debug.log('WS', `connectWSImpl called for channel="${this.channelName}"`);
    return new Promise((resolve) => {
      try {
        if (this.ws && this.ws.readyState !== WebSocket.CLOSED && this.ws.readyState !== WebSocket.CLOSING) {
          debug.log('WS', `Closing existing WS for channel="${this.channelName}"`);
          this.ws.close();
        }

        const currentWs = new WebSocket(WS_URL);
        this.ws = currentWs;
        let authenticated = false;
        let authRefreshTried = false;

        const joinAsGuest = () => {
          authenticated = true;
          this._authenticated = true;
          this._isGuest = true;
          this.reconnectAttempt = 0; // Reset backoff on successful connection
          debug.log('WS', `Guest mode, sending channel:join for "${this.channelName}" with is_guest`);
          currentWs.send(JSON.stringify({
            type: 'channel:join',
            channel: this.channelName,
            data: { ...this.userData, is_guest: true },
          }));
          // Wait for join_ok (with 3s fallback for backward compat with old server)
          this.scheduleJoinOkFallback(resolve);
          this.clearConnectGuard();
        };

        const timeout = setTimeout(() => {
          if (currentWs.readyState !== WebSocket.OPEN) {
            debug.warn('WS', `Connection timeout for "${this.channelName}", resolving anyway`);
            this.clearConnectGuard(true);
            resolve();
          }
        }, 5000);

        currentWs.onopen = () => {
          clearTimeout(timeout);
          debug.log('WS', `WS opened for channel="${this.channelName}"`);
          const token = getToken();
          if (token) {
            debug.log('WS', `Sending auth for "${this.channelName}"`);
            currentWs.send(JSON.stringify({ type: 'auth', token }));
            return;
          }
          // No token in storage: the session may just have expired (24h JWT) and
          // another socket cleared it. Mint a fresh one before accepting guest
          // mode — guests may join a room but the server rejects every broadcast,
          // which is indistinguishable from an opponent who never sends anything.
          refreshToken().then((fresh) => {
            if (currentWs.readyState !== WebSocket.OPEN) return;
            if (fresh) {
              debug.log('WS', `No stored token — refreshing session for "${this.channelName}"`);
              currentWs.send(JSON.stringify({ type: 'auth', token: fresh }));
              return;
            }
            joinAsGuest();
          });
        };

        currentWs.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);

            if (msg.type === 'auth_ok' && !authenticated) {
              authenticated = true;
              this._authenticated = true;
              this._isGuest = false;
              this.reconnectAttempt = 0; // Reset backoff on successful connection
              debug.log('WS', `Auth OK for "${this.channelName}", sending channel:join`);
              currentWs.send(JSON.stringify({
                type: 'channel:join',
                channel: this.channelName,
                data: this.userData,
              }));
              // Wait for join_ok (with 3s fallback for backward compat with old server)
              this.scheduleJoinOkFallback(resolve);
              this.clearConnectGuard();
              return;
            }
            if (msg.type === 'auth_error') {
              debug.warn('WS', `Auth failed for "${this.channelName}": ${msg.error}`);
              // One refresh attempt on the SAME socket before degrading to guest.
              // A guest keeps receiving broadcasts but cannot send any, so the
              // room silently never synchronizes.
              if (!authRefreshTried) {
                authRefreshTried = true;
                refreshToken().then((fresh) => {
                  if (currentWs.readyState !== WebSocket.OPEN) return;
                  if (fresh) {
                    debug.log('WS', `Retrying auth with refreshed token for "${this.channelName}"`);
                    currentWs.send(JSON.stringify({ type: 'auth', token: fresh }));
                    return;
                  }
                  joinAsGuest();
                });
                return;
              }
              debug.warn('WS', `Falling back to guest join for "${this.channelName}" — room broadcasts will be limited`);
              joinAsGuest();
              return;
            }
            if (msg.type === 'connected') return;
            if (msg.type === 'pong') return;
            if (msg.type === 'join_ok' && msg.channel === this.channelName) {
              debug.log('WS', `join_ok received for "${this.channelName}" — channel join confirmed`);
              this.clearJoinOkFallback();
              this._joinConfirmed = true;
              this.reconnectAttempt = 0;
              // Resolve pending join promise
              if (this._pendingJoinResolve) {
                this._pendingJoinResolve();
                this._pendingJoinResolve = null;
              }
              this.tryFlushPending();
              return;
            }

            if (msg.type === 'presence_sync' && msg.channel === this.channelName) {
              debug.log('WS', `presence_sync for "${this.channelName}": ${msg.users?.length || 0} users: ${JSON.stringify((msg.users || []).map((u: any) => u.id || u.name))}`);
              const oldKeys = new Set(Object.keys(this._presenceState));
              const newState: Record<string, any[]> = {};
              if (msg.users) {
                msg.users.forEach((u: any) => {
                  const key = u.id || u.user_id;
                  if (key) {
                    if (!newState[key]) newState[key] = [];
                    newState[key].push(u);
                  }
                });
              }
              this._presenceState = newState;

              const newKeys = new Set(Object.keys(newState));
              const leftKeys = [...oldKeys].filter(k => !newKeys.has(k));

              leftKeys.forEach(key => {
                this.handlers
                  .filter(h => h.event === 'presence' && h.filter === 'leave')
                  .forEach(h => {
                    if (typeof h.callback === 'function') h.callback({ event: 'leave', key });
                  });
              });

              this.handlers
                .filter(h => h.event === 'presence' && h.filter === 'sync')
                .forEach(h => {
                  if (typeof h.callback === 'function') h.callback({ event: 'sync' });
                });

              // The server piggybacks replayable room state on presence syncs.
              // Re-dispatch it as normal broadcasts so a member that joined late
              // (or missed the original frame) still receives the peer's
              // preference / the decided merge. Deduped — heartbeats repeat it.
              if (Array.isArray(msg.preferences)) {
                msg.preferences.forEach((pref: any) => {
                  const owner = pref?.playerId || pref?.id;
                  if (!owner || owner === this.userId) return;
                  const sig = JSON.stringify(pref);
                  if (this._lastPrefSig.get(owner) === sig) return;
                  this._lastPrefSig.set(owner, sig);
                  this.handlers
                    .filter(h => h.event === 'broadcast' && h.filter?.event === 'player_preference')
                    .forEach(h => { if (typeof h.callback === 'function') h.callback({ payload: pref }); });
                });
              }
              if (msg.mergeResult) {
                // The cache replays to every member; never let the sender's own
                // result come back as if it were the peer's.
                const mergeSender = msg.mergeResult.senderId;
                const sig = JSON.stringify(msg.mergeResult);
                if ((!mergeSender || mergeSender !== this.userId) && sig !== this._lastMergeSig) {
                  this._lastMergeSig = sig;
                  this.handlers
                    .filter(h => h.event === 'broadcast' && h.filter?.event === 'coin_flip_result')
                    .forEach(h => { if (typeof h.callback === 'function') h.callback({ payload: msg.mergeResult }); });
                }
              }
            }

            if (msg.type === 'channel:event' && msg.channel === this.channelName) {
              this.handlers
                .filter(h => h.event === 'broadcast' && (!h.filter || h.filter.event === msg.event))
                .forEach(h => h.callback({ payload: msg.payload }));
            }

            if (msg.type === 'notification:new' && msg.notification) {
              window.dispatchEvent(new CustomEvent('notification:new', { detail: msg.notification }));
            }
          } catch (e) {
            console.error('[LocalChannel] WS message parse error:', e);
          }
        };

        const heartbeat = setInterval(() => {
          if (currentWs.readyState === WebSocket.OPEN && authenticated) {
            currentWs.send(JSON.stringify({ type: 'ping' }));
          }
        }, 15000);

        currentWs.onclose = (ev) => {
          clearTimeout(timeout);
          clearInterval(heartbeat);
          this.clearJoinOkFallback();
          this.clearConnectGuard(true);
          this._joinConfirmed = false; // Reset — we need to re-join on reconnect
          debug.log('WS', `WS closed for "${this.channelName}" code=${ev.code} reason=${ev.reason}`);
          resolve();
          const attempt = this.reconnectAttempt++;
          const delay = Math.min(1000 * Math.pow(2, attempt), 30000); // 1s, 2s, 4s, 8s, 16s, 30s cap
          debug.log('WS', `Auto-reconnecting "${this.channelName}" in ${delay}ms (attempt ${attempt + 1})`);
          setTimeout(() => {
            if (this._unsubscribed) return; // Never reconnect after explicit unsubscribe
            if (this.ws === currentWs) {
              debug.log('WS', `Reconnecting "${this.channelName}" now...`);
              this.wsConnectPromise = this.connectWSImpl();
              this.wsConnectPromise.then(() => this.tryFlushPending());
            }
          }, delay);
        };

        currentWs.onerror = (ev) => {
          clearTimeout(timeout);
          this.clearConnectGuard(true);
          debug.warn('WS', `WS error for "${this.channelName}"`);
          resolve();
        };
      } catch (e) {
        debug.error('WS', `connectWS error for "${this.channelName}":`, e);
        this.clearConnectGuard(true);
        resolve();
      }
    });
  }

  async send(msg: any) {
    if (this._joinConfirmed && this.ws?.readyState === WebSocket.OPEN) {
      debug.log('WS', `Sending ${msg.event} on "${this.channelName}" (join confirmed)`);
      this.ws.send(JSON.stringify({
        type: 'channel:broadcast',
        channel: this.channelName,
        event: msg.event,
        payload: msg.payload,
        senderId: msg.payload?.senderId || msg.payload?.playerId || this.userId,
      }));
    } else {
      const reason = this._joinConfirmed ? 'ws not open' : 'join not confirmed';
      debug.warn('WS', `Cannot send ${msg.event} — queuing (${reason} state=${this.ws?.readyState})`);
      this.pendingMessages.push(msg);
      this.tryFlushPending();
    }
  }

  private tryFlushPending() {
    if (this.flushPendingTimer) clearTimeout(this.flushPendingTimer);
    // Don't bother if unsubscribed — messages can never be sent
    if (this._unsubscribed) {
      this.pendingMessages = [];
      return;
    }
    this.flushPendingTimer = setTimeout(() => {
      if (this.pendingMessages.length === 0) return;
      if (this._joinConfirmed && this.ws?.readyState === WebSocket.OPEN) {
        debug.log('WS', `Flushing ${this.pendingMessages.length} queued messages for "${this.channelName}"`);
        const batch = this.pendingMessages.splice(0);
        batch.forEach(m => {
          if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
              type: 'channel:broadcast',
              channel: this.channelName,
              event: m.event,
              payload: m.payload,
              senderId: m.payload?.senderId || m.payload?.playerId || this.userId,
            }));
          }
        });
      } else if (!this._unsubscribed) {
        // Retry after delay — waiting for join_ok or WS reconnection
        this.flushPendingTimer = setTimeout(() => this.tryFlushPending(), 500);
      } else {
        this.pendingMessages = [];
      }
    }, 300);
  }

  presenceState(): any {
    return this._presenceState;
  }

  /** Ask the server to re-send this room's members + replayable state. */
  requestSync() {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'room:sync', channel: this.channelName }));
    }
  }

  unsubscribe() {
    this._unsubscribed = true;
    // Clear pending flush timer and queued messages to prevent infinite loop
    if (this.flushPendingTimer) {
      clearTimeout(this.flushPendingTimer);
      this.flushPendingTimer = null;
    }
    this.pendingMessages = [];
    // Clear handler closures to free captured state
    this.handlers = [];
    this._presenceState = {};
    // Send leave and close
    this.ws?.send(JSON.stringify({
      type: 'channel:leave',
      channel: this.channelName,
    }));
    this.ws?.close();
    this.ws = null;
    this._status = 'unsubscribed';
    this._joinConfirmed = false;
    this.clearJoinOkFallback();
    if (this._pendingJoinResolve) {
      // If someone is still waiting on join_ok, resolve it now so they don't hang forever
      this._pendingJoinResolve();
      this._pendingJoinResolve = null;
    }
    this.clearConnectGuard(true);
  }
}

function makeQuery(table: string, cols: string, filters: Record<string, any> = {}) {
  const q: any = async () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => params.set(k, String(v)));
    const data = await api(`/${table}?${params.toString()}`);
    return { data: Array.isArray(data) ? data : [data], error: null };
  };
  q.eq = (col: string, val: any) => makeQuery(table, cols, { ...filters, [col]: val });
  q.order = (sortCol: string, { ascending }: any = {}) => {
    const q2: any = async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => params.set(k, String(v)));
      params.set('sort', sortCol);
      params.set('asc', String(!!ascending));
      const data = await api(`/${table}?${params.toString()}`);
      return { data: Array.isArray(data) ? data : [data], error: null };
    };
    q2.limit = async (n: number) => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => params.set(k, String(v)));
      params.set('limit', String(n));
      params.set('sort', sortCol);
      params.set('asc', String(!!ascending));
      const data = await api(`/${table}?${params.toString()}`);
      return { data, error: null };
    };
    q2.single = async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => params.set(k, String(v)));
      const data = await api(`/${table}?${params.toString()}`);
      const item = Array.isArray(data) ? data[0] : data;
      return { data: item || null, error: item ? null : { code: 'PGRST116', message: 'not found' } };
    };
    return q2;
  };
  q.single = async () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => params.set(k, String(v)));
    const data = await api(`/${table}?${params.toString()}`);
    const item = Array.isArray(data) ? data[0] : data;
    return { data: item || null, error: item ? null : { code: 'PGRST116', message: 'not found' } };
  };
  q.limit = async (n: number) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => params.set(k, String(v)));
    params.set('limit', String(n));
    const data = await api(`/${table}?${params.toString()}`);
    return { data, error: null };
  };
  return q;
}

export const supabase = {
  channel: (name: string, config?: any) => new LocalChannel(name),
  removeChannel: (ch: LocalChannel) => ch.unsubscribe(),
  from: (table: string) => ({
    select: (cols: string) => makeQuery(table, cols),
  }),
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    signInWithPassword: async () => ({ data: { user: null, session: null }, error: null }),
    signUp: async () => ({ data: { user: null, session: null }, error: null }),
    signOut: async () => ({ error: null }),
  },
};

export { LocalChannel };
