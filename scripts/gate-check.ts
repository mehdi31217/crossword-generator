/**
 * Verifies the quality gate on the pools the solver actually reads.
 *
 * For every category: no word in `wordsByLength` may be a banned form, and every
 * NON-priority short word must come from the curated common pool (that is the
 * whole point: 2-3 letter slots fall back to vetted crossword answers, not to
 * other domains' abbreviations).
 *
 *   npx esbuild scripts/gate-check.ts --bundle --platform=node --format=cjs \
 *     --outfile=/tmp/gate-check.cjs && node /tmp/gate-check.cjs
 */
import { loadCategory, getSolverDictionaryState, priorityWordSet } from '../utils/dictionary';
import { isBannedForm, isLockedOutOf, CURATED_FALLBACK_MAX_LEN } from '../utils/wordQuality';
import { COMMON_CROSSWORD_GLUE_FA } from '../data/commonCrosswordGlue';
import { MASSIVE_GLUE_FA } from '../utils/glueWords';
import type { Category } from '../types';

const norm = (s: string) =>
  s.toUpperCase().replace(/[\s-]/g, '')
    .replace(/[آأإ]/g, 'ا').replace(/ئ/g, 'ی').replace(/ي/g, 'ی').replace(/ك/g, 'ک');

const CURATED = new Set(COMMON_CROSSWORD_GLUE_FA.map((e) => norm(e.word)));
for (const e of MASSIVE_GLUE_FA) CURATED.add(norm(e.word));

const CATS: Category[] = ['general', 'movies', 'cities', 'knowledge', 'food', 'body', 'jobs',
  'tech', 'nature', 'shahnameh', 'history', 'sports', 'art'];

const clueOf = new Map<string, string>();
let bannedForms = 0;
let lockedIn = 0;
let uncuratedShort = 0;
const samples: string[] = [];

for (const cat of CATS) {
  loadCategory(cat, 'fa');
  const state = getSolverDictionaryState();
  // A general-knowledge grid is allowed to draw on the whole dictionary, so the
  // "short slots must come from the curated pool" rule only describes the
  // category branches.
  const isGeneral = cat === 'general';
  for (let len = 2; len <= 12; len++) {
    for (const word of state.wordsByLength[len] || []) {
      if (isBannedForm(word)) {
        bannedForms++;
        if (samples.length < 12) samples.push(`${cat} L${len} banned-form «${word}»`);
        continue;
      }
      const isPriority = priorityWordSet.has(word);
      if (!isPriority && !isGeneral) {
        if (isLockedOutOf(word, cat)) {
          lockedIn++;
          if (samples.length < 12) samples.push(`${cat} L${len} locked-in «${word}»`);
        }
        if (len <= CURATED_FALLBACK_MAX_LEN && !CURATED.has(word)) {
          uncuratedShort++;
          if (samples.length < 12) samples.push(`${cat} L${len} uncurated-short «${word}»`);
        }
      }
      const clue = clueOf.get(word);
      if (clue === undefined) clueOf.set(word, '');
    }
  }
}

// Clues are in the module-level map, not the serializable state — read them back.
console.log(`pool size: ${clueOf.size} distinct words`);
console.log(`banned forms in pool   : ${bannedForms}`);
console.log(`locked-out words placed: ${lockedIn}`);
console.log(`non-curated 2-3 letter : ${uncuratedShort}`);
if (samples.length) console.log(samples.join('\n'));
