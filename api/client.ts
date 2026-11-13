import { API_BASE } from '../utils/config';
import { debug } from '../utils/debug';

const API = API_BASE;

const TOKEN_KEY = 'auth_token';

export function getToken(): string | null { return localStorage.getItem(TOKEN_KEY); }
export function setToken(token: string) { localStorage.setItem(TOKEN_KEY, token); }
export function clearToken() { localStorage.removeItem(TOKEN_KEY); }

/**
 * Mint a fresh JWT for the locally known player (`player_state.id`).
 *
 * Tokens expire after 24h. A tab that stays open past that keeps a valid-looking
 * player profile but a dead token, which used to degrade every WebSocket to a
 * GUEST connection permanently — a guest may join a room but the server refuses
 * every `channel:broadcast`, so that player silently sends no preferences/merge
 * acks and the opponent waits forever.
 *
 * Deduped: several sockets/calls may hit a 401 at the same moment.
 */
let refreshPromise: Promise<string | null> | null = null;
export function refreshToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    try {
      const stored = localStorage.getItem('player_state');
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      if (!parsed?.id || parsed.id === 'guest') return null;
      const loginRes = await fetch(`${API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId: parsed.id }),
      });
      if (!loginRes.ok) return null;
      const loginData = await loginRes.json();
      if (!loginData?.token) return null;
      setToken(loginData.token);
      debug.log('API', 'session token refreshed');
      return loginData.token as string;
    } catch (e) {
      debug.warn('API', 'token refresh error:', e);
      return null;
    }
  })().finally(() => { refreshPromise = null; });
  return refreshPromise;
}

export async function api<T = any>(path: string, options?: RequestInit): Promise<T> {
  const MAX_RETRIES = 3;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      // Helper: attempt the actual fetch with current token
      const doFetch = async (): Promise<Response> => {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        const token = getToken();
        if (token) headers['Authorization'] = `Bearer ${token}`;
        return fetch(`${API}${path}`, { headers, ...options });
      };

      let res = await doFetch();

      // Auto-retry on 401 — token may have expired; refresh it once
      if (res.status === 401 && !path.startsWith('/login')) {
        const refreshed = await refreshToken();
        if (refreshed) res = await doFetch();
        else debug.log('API', `401 on ${path} — no refresh possible (guest or missing player_state)`);
      }

      if (res.status === 304) return null as T;
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        // Only clear token if refresh already failed (we still got here with 401)
        if (res.status === 401) clearToken();
        const error = new Error(err.error || res.statusText) as Error & { status?: number };
        error.status = res.status;
        throw error;
      }
      return res.json();
    } catch (e: any) {
      lastError = e;
      // Don't retry 4xx errors (except 401 which already handled token refresh)
      if (e.message && !e.message.includes('TypeError') && !e.message.includes('Failed to fetch') && !e.message.includes('NetworkError') && !e.message.includes('load')) {
        throw e; // Non-network errors: throw immediately
      }
      // Network error — retry with exponential backoff
      if (attempt < MAX_RETRIES) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 8000);
        debug.warn('API', `Network error on ${path}, retrying in ${delay}ms (attempt ${attempt + 1}/${MAX_RETRIES}):`, e.message);
        await new Promise(r => setTimeout(r, delay));
      }
    }
  }

  debug.error('API', `All ${MAX_RETRIES + 1} attempts failed for ${path}`);
  throw lastError || new Error('Network request failed');
}

export function shuffleArray<T>(array: T[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
