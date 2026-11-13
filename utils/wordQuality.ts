/**
 * Quality gate for the crossword generator's pools.
 *
 * Two separate problems, two separate rules:
 *
 * 1. Some forms are not acceptable answers in ANY Persian crossword — Latin
 *   acronyms, letter names used as abbreviations, truncated fragments. They must
 *   never be placed.
 * 2. A word that only makes sense in one domain («کد», «نما», «اوت») must not
 *   become the filler of somebody else's grid.
 *
 * The lists live in `data/wordBlocklist.txt` and are compiled into
 * `data/wordBlocklist.ts` by `scripts/build-common-glue.cjs`.
 */
import { NEVER_FA, CATEGORY_LOCKED_FA } from '../data/wordBlocklist';

const ZWNJ = /‌/g;

const never = new Set(NEVER_FA.map((w) => w.replace(ZWNJ, '')));
const lockedByOwner: Record<string, Set<string>> = Object.fromEntries(
  CATEGORY_LOCKED_FA.map(([category, words]) => [category, new Set(words.map((w) => w.replace(ZWNJ, '')))])
);

/** Slots up to this length are filled only from the curated common pool. */
export const CURATED_FALLBACK_MAX_LEN = 3;

/** True when a form must never be placed in a Persian grid. */
export function isBannedForm(word: string): boolean {
  if (/[A-Za-z0-9\u00C0-\u024F۰-۹]/.test(word)) return true;
  return never.has(word.replace(ZWNJ, ''));
}

/** True when a definition is developer shorthand rather than a clue. */
export function isBannedClue(clue: string | undefined): boolean {
  if (!clue) return true;
  return /[A-Za-z0-9۰-۹\u00C0-\u024F\u3040-\u9fff]/.test(clue);
}

/** True when `word` may not be used as filler in a grid of `category`. */
export function isLockedOutOf(word: string, category: string): boolean {
  const bare = word.replace(ZWNJ, '');
  for (const [owner, forms] of Object.entries(lockedByOwner)) {
    if (owner !== category && forms.has(bare)) return true;
  }
  return false;
}

/** Filter for the pool a category falls back to when its own words run out. */
export function makeSupplementFilter(category: string) {
  return (entry: { word: string; clue?: string }): boolean => {
    if (isBannedForm(entry.word)) return false;
    if (isBannedClue(entry.clue)) return false;
    // The declared `category` on a glue row is unreliable — the generic lists are
    // tagged 'general' while holding «کد» and «نما» — so the lock is read from the
    // word itself, not from the row it arrived on.
    return !isLockedOutOf(entry.word, category);
  };
}

/** Filter for a category's own priority words — only the hard bans. */
export function makePriorityFilter(): (entry: { word: string; clue?: string }) => boolean {
  return (entry) => !isBannedForm(entry.word) && !isBannedClue(entry.clue);
}

/**
 * Filter for a merged (two-player) grid. A word locked to one of the participating
 * categories is still fair game there, so it is dropped only when locked out of all
 * of them.
 */
export function makeMergedSupplementFilter(categories: string[]) {
  return (entry: { word: string; clue?: string }): boolean => {
    if (isBannedForm(entry.word) || isBannedClue(entry.clue)) return false;
    return categories.some((category) => !isLockedOutOf(entry.word, category));
  };
}
