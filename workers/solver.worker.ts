/**
 * Solver Web Worker
 *
 * Offloads the CPU-intensive fillGrid CSP solver to a background thread so the
 * main thread stays responsive during grid generation.
 *
 * The Worker has its own module scope, so it does NOT share dictionary.ts's
 * module-level state with the main thread. The caller (utils/runSolver.ts)
 * therefore serializes the solver dictionary state (wordsByLength +
 * priorityWordSet) and sends it along with the grid. The worker restores that
 * state before running fillGrid.
 *
 * Protocol:
 *   in : { id, grid, timeoutMs, opts, state? }
 *   out: { id, result: Grid | null, error?: string }
 *
 * If `state` is omitted the worker keeps the state it already has (the caller
 * only re-sends it when the dictionary version changes).
 */
import { fillGrid } from '../utils/gridLogic';
import { setSolverDictionaryState, type SolverDictionaryState } from '../utils/dictionary';

self.onmessage = async (e: MessageEvent) => {
  const { grid, timeoutMs, opts, state, id } = e.data || {};

  try {
    if (state) {
      setSolverDictionaryState(state as SolverDictionaryState);
    }
    const result = await fillGrid(grid, timeoutMs, opts);
    self.postMessage({ id, result });
  } catch (error: any) {
    self.postMessage({ id, result: null, error: error?.message || 'Unknown worker error' });
  }
};
