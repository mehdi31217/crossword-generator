/**
 * Solver Runner — Web Worker wrapper with synchronous fallback.
 *
 * Offloads the CPU-intensive fillGrid CSP solver to a Web Worker so the main
 * thread stays responsive during grid generation. If the Worker is unavailable,
 * fails to load, errors, or times out, we transparently fall back to running
 * fillGrid synchronously on the main thread — so correctness never depends on
 * the worker path.
 *
 * Architecture:
 *   runSolver(grid, timeoutMs, opts)
 *     ├── worker available → postMessage({grid, timeoutMs, opts, state}) → await
 *     └── otherwise / on failure → fillGrid(grid, timeoutMs, opts) (sync)
 *
 * The worker has its own module scope, so dictionary.ts's module-level state is
 * NOT shared. We serialize it (wordsByLength + priorityWordSet) and ship it with
 * the first request after each dictionary reload (tracked via a version).
 */

import { fillGrid } from './gridLogic';
import type { Grid } from '../types';
import { debug } from './debug';
import { getDictionaryVersion, getSolverDictionaryState } from './dictionary';

// Worker instance (lazy-init, shared across calls)
let worker: Worker | null = null;
let workerInitAttempted = false;
// Dictionary version currently loaded inside the worker (null = none)
let workerDictionaryVersion: number | null = null;
// Monotonic request id
let requestCounter = 0;

/** Check if the current environment supports Web Workers. */
function supportsWorkers(): boolean {
  return typeof Worker !== 'undefined';
}

/** Initialize the solver worker (lazy, once). */
function initWorker(): Worker | null {
  if (workerInitAttempted) return worker;
  workerInitAttempted = true;

  if (!supportsWorkers()) {
    debug.warn('runSolver', 'Web Workers not supported in this environment');
    return null;
  }

  try {
    worker = new Worker(
      new URL('../workers/solver.worker.ts', import.meta.url),
      { type: 'module' }
    );
    return worker;
  } catch (e) {
    debug.warn('runSolver', 'Failed to init Worker, using sync fallback:', e);
    worker = null;
    return null;
  }
}

/** Tear down a broken worker so the next call re-creates it. */
function resetWorker(): void {
  if (worker) {
    try { worker.terminate(); } catch { /* ignore */ }
  }
  worker = null;
  workerInitAttempted = false;
  workerDictionaryVersion = null;
}

/**
 * Run one solve inside the worker. Resolves with the grid (or null) or rejects
 * on error/timeout so the caller can fall back to synchronous execution.
 */
function runInWorker(
  w: Worker,
  grid: Grid,
  timeoutMs: number,
  opts: { priorityOnly?: boolean; bannedWords?: Set<string> }
): Promise<Grid | null> {
  const id = ++requestCounter;
  const version = getDictionaryVersion();
  const needsState = workerDictionaryVersion !== version;
  const state = needsState ? getSolverDictionaryState() : undefined;

  return new Promise<Grid | null>((resolve, reject) => {
    // Hard cap: the solver's own timeout plus slack for serialization/messaging.
    const hardTimeout = setTimeout(() => {
      cleanup();
      reject(new Error('worker timeout'));
    }, timeoutMs + 2500);

    function cleanup() {
      clearTimeout(hardTimeout);
      w.removeEventListener('message', onMessage);
      w.removeEventListener('error', onError);
    }

    function onMessage(ev: MessageEvent) {
      const data = ev.data;
      if (!data || data.id !== id) return; // not our response
      cleanup();
      if (data.error) reject(new Error(data.error));
      else resolve((data.result as Grid | null) ?? null);
    }

    function onError(err: ErrorEvent) {
      cleanup();
      reject(err?.error || new Error(err?.message || 'worker error'));
    }

    w.addEventListener('message', onMessage);
    w.addEventListener('error', onError);

    try {
      w.postMessage({ id, grid, timeoutMs, opts, state });
      if (needsState) workerDictionaryVersion = version;
    } catch (e) {
      cleanup();
      reject(e);
    }
  });
}

/**
 * Run the solver via Web Worker with synchronous fallback.
 */
export async function runSolver(
  grid: Grid,
  timeoutMs: number,
  opts: { priorityOnly?: boolean; bannedWords?: Set<string> }
): Promise<Grid | null> {
  const w = initWorker();
  if (!w) return fillGrid(grid, timeoutMs, opts);

  try {
    return await runInWorker(w, grid, timeoutMs, opts);
  } catch (e) {
    debug.warn('runSolver', 'Worker path failed, falling back to sync:', e);
    // The worker may be wedged (e.g. still solving a timed-out request) —
    // replace it so subsequent calls get a fresh one.
    resetWorker();
    return fillGrid(grid, timeoutMs, opts);
  }
}

/** Clean up the solver worker. Call when the game unmounts. */
export function terminateSolver(): void {
  resetWorker();
}
