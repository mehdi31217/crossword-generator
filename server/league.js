/**
 * League / trophy math — SERVER mirror of `services/league.ts`.
 *
 * The client keeps its own copy for optimistic display, but the server is the
 * source of truth: `POST /api/league/result` (multiplayer) and `POST /api/match`
 * (casual) compute the delta here and persist it, so a client can no longer
 * invent a rating. Before this, `profiles.trophies` was never written by any
 * server code — every one of the 4963 rows sat at 0, which is also why the
 * leaderboard ranked everybody equally.
 *
 * ⚠️ Keep the tier table and the formulas in sync with `services/league.ts`
 * (`LEAGUES` / `calcTrophyChange` / `applyTrophyChange`). The server is plain
 * CommonJS and cannot import the TS module, so this is a deliberate, minimal
 * duplicate — only the parts the server actually needs.
 */

/** id + minTrophies only, descending. Icons/colours/names are client concerns. */
const LEAGUE_TIERS = [
  { id: 'legendary', minTrophies: 4000 },
  { id: 'diamond1',  minTrophies: 3400 },
  { id: 'diamond2',  minTrophies: 3000 },
  { id: 'diamond',   minTrophies: 2750 },
  { id: 'crystal1',  minTrophies: 2500 },
  { id: 'crystal2',  minTrophies: 2250 },
  { id: 'crystal',   minTrophies: 2000 },
  { id: 'gold1',     minTrophies: 1750 },
  { id: 'gold2',     minTrophies: 1500 },
  { id: 'gold',      minTrophies: 1250 },
  { id: 'silver1',   minTrophies: 1000 },
  { id: 'silver2',   minTrophies: 800 },
  { id: 'silver',    minTrophies: 600 },
  { id: 'bronze1',   minTrophies: 400 },
  { id: 'bronze2',   minTrophies: 200 },
  { id: 'bronze',    minTrophies: 0 },
];

/** Mirror of `getLeague(trophies).id`. */
function getLeagueId(trophies) {
  const t = Math.max(0, Number(trophies) || 0);
  for (const tier of LEAGUE_TIERS) { // descending — first match wins
    if (t >= tier.minTrophies) return tier.id;
  }
  return 'bronze';
}

/** minTrophies of a tier id (0 if unknown). */
function minTrophiesOf(leagueId) {
  const tier = LEAGUE_TIERS.find(t => t.id === leagueId);
  return tier ? tier.minTrophies : 0;
}

/** Mirror of `calcTrophyChange` — symmetric in nothing: each side is computed from its own view. */
function calcTrophyChange(myTrophies, opponentTrophies, won) {
  const diff = (Number(opponentTrophies) || 0) - (Number(myTrophies) || 0);
  if (won) {
    const base = 20 + Math.floor(diff / 200);
    return Math.max(1, Math.min(40, base));
  }
  const base = 15 - Math.floor(diff / 200);
  return -Math.max(1, Math.min(40, base));
}

/** Mirror of the casual/single-player award in `gameServer.saveMatch`. */
function calcCasualTrophyGain(score, size) {
  const s = Number(score) || 0;
  const g = Number(size) || 5;
  return Math.max(1, Math.min(30, Math.floor(s / 100) * 2 + g - 4));
}

/**
 * Fold a change into a league record — mirror of `applyTrophyChange`, including
 * the highest-league ratchet (only ratchets up, and only on a gain).
 */
function applyTrophyChange(league, change, won) {
  const current = {
    trophies: Math.max(0, Number(league && league.trophies) || 0),
    highestLeague: (league && league.highestLeague) || 'bronze',
    winStreak: Number(league && league.winStreak) || 0,
    totalWins: Number(league && league.totalWins) || 0,
    totalLosses: Number(league && league.totalLosses) || 0,
  };
  const newTrophies = Math.max(0, current.trophies + change);
  const newHighest = change > 0 && newTrophies > minTrophiesOf(current.highestLeague)
    ? getLeagueId(newTrophies)
    : current.highestLeague;
  return {
    trophies: newTrophies,
    league: getLeagueId(newTrophies),
    highestLeague: newHighest,
    winStreak: won ? current.winStreak + 1 : 0,
    totalWins: current.totalWins + (won ? 1 : 0),
    totalLosses: current.totalLosses + (won ? 0 : 1),
  };
}

module.exports = {
  LEAGUE_TIERS,
  getLeagueId,
  minTrophiesOf,
  calcTrophyChange,
  calcCasualTrophyGain,
  applyTrophyChange,
};
