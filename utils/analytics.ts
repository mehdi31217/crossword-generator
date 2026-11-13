/**
 * Retention telemetry.
 *
 * Server-side (`POST /api/events`, table `events`) and deliberately cheap: the
 * queue is batched so a burst of UI events cannot turn into a request storm, and
 * every failure is swallowed — analytics must never break a game.
 *
 * Anonymous calls are allowed on the server, because the drop-off worth measuring
 * is exactly the player who never logs in.
 */

import { api, getToken } from '../api/client';

export type AnalyticsEvent = {
  type: string;
  payload?: Record<string, unknown>;
};

const MAX_BATCH = 20;
const MAX_QUEUE = 60;
const FLUSH_MS = 12_000;

let queue: AnalyticsEvent[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;
let flushing = false;

function schedule() {
  if (timer !== null) return;
  timer = setTimeout(() => {
    timer = null;
    void flush();
  }, FLUSH_MS);
}

export async function flush(): Promise<void> {
  if (flushing || queue.length === 0) return;
  flushing = true;
  const batch = queue.slice(0, MAX_BATCH);
  queue = queue.slice(batch.length);
  try {
    await api('/events', { method: 'POST', body: JSON.stringify({ events: batch }) });
  } catch {
    // Dropped on purpose: a lost analytics row is not worth a retry loop.
  } finally {
    flushing = false;
    if (queue.length > 0) schedule();
  }
}

/** Record one product event. Safe to call from anywhere, including guests. */
export function track(type: string, payload?: Record<string, unknown>): void {
  // A guest has no token; `api` would still call the endpoint anonymously, which
  // the server accepts. The only thing skipped is telemetry on a cold start with
  // storage disabled — acceptable.
  try {
    queue.push(payload ? { type, payload } : { type });
    if (queue.length > MAX_QUEUE) queue = queue.slice(-MAX_QUEUE);
    if (queue.length >= MAX_BATCH) void flush();
    else schedule();
  } catch {
    /* ignore */
  }
}

/** True when the device has an authenticated session (used to tag events). */
export function isSignedIn(): boolean {
  try { return !!getToken(); } catch { return false; }
}

if (typeof document !== 'undefined') {
  // A phone tab is usually killed, not closed — flush on the last reliable moment.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') void flush();
  });
}
