// ===== Centralized Port Configuration =====
// Change these values to switch ports without hunting through the codebase.

export const API_PORT = 8081;
export const FRONTEND_PORT = 3000;

// Bumped whenever the room handshake changes incompatibly. Sent on every
// `channel:join`; the server warns the peer when a room member is older.
// v3: preference is announced on join (not after opponent detection), plus
//     the merge-ack / cached-state replay handshake.
export const PROTOCOL_VERSION = 3;

// وقتی از بیرون شبکه خونه وصل می‌شید، اینجا رو به لینک تونل بک‌اند تغییر بدید
// برای دسترسی محلی (وای‌فای خونه)، گزینه دوم
const BACKEND_TUNNEL = 'https://1378c69677f48146-2-145-13-31.serveousercontent.com'; // بک‌اند (پورت 8081)
const FRONTEND_TUNNEL = 'https://1f9d8b36dea8ee21-2-145-13-31.serveousercontent.com'; // فرانت (پورت 8080)
const LOCAL_BACKEND = typeof window !== 'undefined' ? window.location.origin : `http://localhost:${API_PORT}`;

export const USE_TUNNEL = false; // true = دسترسی از طریق تونل (خارج از شبکه خونه)

export const API_BASE = `${USE_TUNNEL ? BACKEND_TUNNEL : LOCAL_BACKEND}/api`;
export const WS_URL = `${USE_TUNNEL ? BACKEND_TUNNEL.replace('https', 'wss') : LOCAL_BACKEND.replace(/^http/, 'ws')}`;

// ===== Score-Based Unlock Thresholds (for Casual, Challenge, Invite) =====

/**
 * Minimum score required per grid size.
 *
 * Old ladder (500 / 1500 / 3000 / 5000 / 8000) unlocked 10×10 after roughly
 * two games, because one 10×10 run alone scores ~2000–4000. The tiers are now
 * spaced so each size needs a real streak of played grids (≈40 games for the
 * full ladder) and each one lands on the same score as a category tier below.
 */
export const SIZE_SCORE_THRESHOLDS: Record<number, number> = {
  5: 0,
  6: 1500,
  7: 5000,
  8: 12000,
  9: 25000,
  10: 50000,
};

/**
 * Category unlock thresholds.
 * Each entry adds categories when player reaches that score threshold.
 * Categories from all met thresholds are available.
 *
 * Tiers are aligned with SIZE_SCORE_THRESHOLDS so the «هدف بعدی» ladder in the
 * menu stays five clean rungs instead of two ladders that never meet.
 *
 * - 0     → knowledge, food, all
 * - 5000  → + movies, cities
 * - 12000 → + body, jobs
 * - 25000 → + tech, nature
 * - 50000 → + history, sports, art
 */
export const CATEGORY_SCORE_THRESHOLDS: { score: number; categories: string[] }[] = [
  { score: 0, categories: ['knowledge', 'food', 'all'] },
  { score: 5000, categories: ['movies', 'cities'] },
  { score: 12000, categories: ['body', 'jobs'] },
  { score: 25000, categories: ['tech', 'nature'] },
  { score: 50000, categories: ['history', 'sports', 'art'] },
];

/**
 * Get all category IDs unlocked at a given score.
 */
export function getUnlockedCategories(score: number): string[] {
  const unlocked: string[] = [];
  for (const tier of CATEGORY_SCORE_THRESHOLDS) {
    if (score >= tier.score) {
      unlocked.push(...tier.categories);
    }
  }
  return unlocked;
}

/**
 * Get min score needed to unlock a specific category.
 * Returns 0 if the category isn't in any threshold (always available).
 */
export function getCategoryUnlockScore(categoryId: string): number {
  for (const tier of CATEGORY_SCORE_THRESHOLDS) {
    if (tier.categories.includes(categoryId)) return tier.score;
  }
  return 0;
}

/**
 * Check if a size is unlocked at a given score.
 */
export function isSizeUnlocked(size: number, score: number): boolean {
  return score >= (SIZE_SCORE_THRESHOLDS[size] ?? 0);
}
