import type { DuelResult } from '../types';

/**
 * Mirror of the server's verdict weights (`DUEL_POINTS` in server/index.js).
 * The server always decides; this only exists so a player can watch the same
 * number move while they play. Change one, change the other.
 */
export const DUEL_WEIGHTS = { cell: 100, second: 2, mistake: 40, assisted: 60 };

export type DuelCounters = {
  typed: number;
  seconds: number;
  mistakes: number;
  assisted: number;
};

export const duelPoints = (c: DuelCounters): number => {
  const raw = c.typed * DUEL_WEIGHTS.cell
    - c.seconds * DUEL_WEIGHTS.second
    - c.mistakes * DUEL_WEIGHTS.mistake
    - c.assisted * DUEL_WEIGHTS.assisted;
  return Math.max(0, Math.round(raw));
};

/** Points as stored on a duel result, for reading the server's numbers back. */
export const duelPointsOf = (result?: DuelResult | null): number =>
  result ? duelPoints({
    typed: result.typed ?? result.solved ?? 0,
    seconds: result.seconds ?? 0,
    mistakes: result.mistakes ?? 0,
    assisted: result.assisted ?? 0,
  }) : 0;

type DuelGameCounters = {
  myFilledCells?: Set<string>;
  wrongAnswerCount?: number;
  assistedCount?: number;
};

/** The counters a duel verdict is built from, read off the live game object. */
export const duelCounters = (g?: DuelGameCounters | null) => ({
  typed: g?.myFilledCells?.size ?? 0,
  mistakes: g?.wrongAnswerCount ?? 0,
  assisted: g?.assistedCount ?? 0,
});
