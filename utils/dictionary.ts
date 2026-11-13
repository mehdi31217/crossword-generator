
import { DictionaryEntry, Language, Category } from '../types';
import { MASSIVE_GLUE_FA, MASSIVE_GLUE_EN } from './glueWords';
import { CATEGORY_GLUE_MAP_FA, CATEGORY_GLUE_MAP_EN } from '../data/glueWords';
import { SHORT_EXTRA_MAP } from '../data/glueWordsExtra';
import { debug } from './debug';
import { SHAHNAMEH_FA } from '../data/shahnamehWords';
import { COMMON_CROSSWORD_GLUE_FA } from '../data/commonCrosswordGlue';
import { makeSupplementFilter, makeMergedSupplementFilter, makePriorityFilter, CURATED_FALLBACK_MAX_LEN } from './wordQuality';
import * as WL from '../data/wordLists';

const ACCEPT_ALL = () => true;

let wordsByLength: Record<number, string[]> = {};
let cluesMap: Map<string, string> = new Map();
export let priorityWordSet: Set<string> = new Set();

// Bumped on every dictionary (re)load. The solver worker uses this to decide
// whether it needs the (potentially large) dictionary state re-serialized.
let dictionaryVersion = 0;
export function getDictionaryVersion(): number { return dictionaryVersion; }

/** Serializable snapshot of the state the CSP solver actually reads. */
export interface SolverDictionaryState {
  wordsByLength: Record<number, string[]>;
  priorityWords: string[];
}

export function getSolverDictionaryState(): SolverDictionaryState {
  return { wordsByLength, priorityWords: Array.from(priorityWordSet) };
}

/**
 * Restore solver state inside a Web Worker. Reassigning the module bindings
 * keeps gridLogic.ts's live imports (priorityWordSet) in sync.
 */
export function setSolverDictionaryState(state: SolverDictionaryState): void {
  if (!state) return;
  wordsByLength = state.wordsByLength || {};
  priorityWordSet = new Set(state.priorityWords || []);
}

function getAllLocalWords(language: Language, excludeShahnameh = false): DictionaryEntry[] {
  const isFA = language === 'fa';
  const lists: DictionaryEntry[][] = [];
  if (isFA) {
    lists.push(WL.MOVIES_FA, WL.FOOD_FA, WL.CITIES_FA, WL.NATURE_FA,
               WL.KNOWLEDGE_FA, WL.BODY_FA, WL.TECH_FA, WL.JOBS_FA,
               WL.HISTORY_FA, WL.SPORTS_FA, WL.ART_FA);
    // Shahnameh only included when explicitly needed (shahnameh category)
    if (!excludeShahnameh) lists.push(SHAHNAMEH_FA);
  } else {
    lists.push(WL.MOVIES_EN, WL.FOOD_EN, WL.CITIES_EN, WL.NATURE_EN,
               WL.KNOWLEDGE_EN, WL.BODY_EN, WL.TECH_EN, WL.JOBS_EN,
               WL.HISTORY_EN, WL.SPORTS_EN, WL.ART_EN);
  }
  return lists.flat();
}

/** Return the main word list for a specific category (local data). */
function getMainWordsForCategory(category: Category, language: Language): DictionaryEntry[] {
  const isFA = language === 'fa';
  switch (category) {
    case 'movies': return isFA ? WL.MOVIES_FA : WL.MOVIES_EN;
    case 'food': return isFA ? WL.FOOD_FA : WL.FOOD_EN;
    case 'cities': return isFA ? WL.CITIES_FA : WL.CITIES_EN;
    case 'nature': return isFA ? WL.NATURE_FA : WL.NATURE_EN;
    case 'knowledge': return isFA ? WL.KNOWLEDGE_FA : WL.KNOWLEDGE_EN;
    case 'body': return isFA ? WL.BODY_FA : WL.BODY_EN;
    case 'tech': return isFA ? WL.TECH_FA : WL.TECH_EN;
    case 'jobs': return isFA ? WL.JOBS_FA : WL.JOBS_EN;
    case 'shahnameh': return isFA ? SHAHNAMEH_FA : [];
    case 'history': return isFA ? WL.HISTORY_FA : WL.HISTORY_EN;
    case 'sports': return isFA ? WL.SPORTS_FA : WL.SPORTS_EN;
    case 'art': return isFA ? WL.ART_FA : WL.ART_EN;
    default: return [];
  }
}

// The joiner must go, not just be hidden: a pool word is laid down one cell per
// code point, so «سه‌تار» would occupy six cells and show only five letters — the
// sixth cell demands a character no keyboard can type, making the word unsolvable.
// freeformGenerator.ts already strips it; this is the same rule for grid mode.
const normalize = (s: string) => {
  return s.toUpperCase().replace(/[\s-]/g, '')
    .replace(/\u200c/g, '')
    .replace(/[آأإ]/g, 'ا')
    .replace(/ئ/g, 'ی')
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک');
};

function groupByLen(entries: DictionaryEntry[], clues: Map<string, string>): Record<number, string[]> {
  const byLen: Record<number, string[]> = {};
  for (const entry of entries) {
    const n = normalize(entry.word);
    if (n.length >= 2 && n.length <= 12 && !clues.has(n)) {
      clues.set(n, entry.clue);
      if (!byLen[n.length]) byLen[n.length] = [];
      byLen[n.length].push(n);
    }
  }
  return byLen;
}

export function loadCategory(category: Category, language: Language, dbWords: DictionaryEntry[] = [], glueWords: DictionaryEntry[] = []) {
  cluesMap.clear();
  dictionaryVersion++;

  const baseGlue = language === 'fa' ? MASSIVE_GLUE_FA : MASSIVE_GLUE_EN;
  const categoryGlue = language === 'fa'
    ? (CATEGORY_GLUE_MAP_FA[category] || [])
    : (CATEGORY_GLUE_MAP_EN[category] || []);

  wordsByLength = {};
  priorityWordSet = new Set();

  // The quality gate is Persian-only: an English clue legitimately contains
  // Latin letters, so gating EN would empty the pool.
  const keepPriority = language === 'fa' ? makePriorityFilter() : ACCEPT_ALL;
  const keepSupplement = language === 'fa' ? makeSupplementFilter(category) : ACCEPT_ALL;
  const curatedShort = language === 'fa' ? COMMON_CROSSWORD_GLUE_FA : [];

  if (category === 'all' || category === 'general') {
    const all = dbWords.length > 0 ? [...dbWords] : getAllLocalWords(language);
    all.push(...baseGlue, ...curatedShort);
    wordsByLength = groupByLen(language === 'fa' ? all.filter(keepSupplement) : all, cluesMap);
    const total = Object.values(wordsByLength).reduce((s, a) => s + a.length, 0);
    debug.log('dict', `${category}: ${total} words`);
    return total;
  }

  // Priority: category-specific words (tried first by solver)
  const priority: DictionaryEntry[] = [];
  for (const e of glueWords) priority.push({ ...e });
  const extra = SHORT_EXTRA_MAP[category] || [];
  for (const e of extra) priority.push({ ...e, category });
  for (const e of categoryGlue) priority.push({ ...e, category });

  // IMPORTANT: The category's OWN main words are always priority — both the
  // server rows and the bundled list. Taking one OR the other meant that as soon
  // as a category had any server row at all, its curated local list was demoted
  // to "supplement", so the solver preferred other categories' words over it.
  if (dbWords.length > 0) for (const e of dbWords) priority.push({ ...e, category });
  for (const e of getMainWordsForCategory(category, language)) priority.push({ ...e, category });

  // Supplement: other categories' words + generic glue (fallback only).
  // Short slots fall back to the curated common-crossword pool instead of "every
  // short word in the game": a two-letter answer borrowed from another domain is
  // what made art and history grids read as nonsense.
  const allSupplement: DictionaryEntry[] = [];
  const shortSupplement: DictionaryEntry[] = [...curatedShort, ...baseGlue];
  const priorityNorms = new Set<string>();
  for (const e of priority) priorityNorms.add(normalize(e.word));
  // Add words from ALL categories except the current one
  const allLocal = getAllLocalWords(language, true);
  for (const e of allLocal) {
    const n = normalize(e.word);
    if (!priorityNorms.has(n)) allSupplement.push(e);
  }
  for (const e of baseGlue) allSupplement.push(e);

  // Group by length: priority words FIRST (index 0), then all supplement
  for (let len = 2; len <= 12; len++) {
    const result: string[] = [];
    const seen = new Set<string>();
    const useCurated = len <= CURATED_FALLBACK_MAX_LEN && language === 'fa';
    const source = useCurated ? shortSupplement : allSupplement;

    for (const e of priority) {
      const n = normalize(e.word);
      if (n.length === len && !cluesMap.has(n) && !seen.has(n) && keepPriority(e)) {
        cluesMap.set(n, e.clue);
        seen.add(n);
        result.push(n);
        priorityWordSet.add(n);
      }
    }
    for (const e of source) {
      const n = normalize(e.word);
      if (n.length === len && !cluesMap.has(n) && !seen.has(n) && keepSupplement(e)) {
        cluesMap.set(n, e.clue);
        seen.add(n);
        result.push(n);
      }
    }
    wordsByLength[len] = result;
  }

  const totalUnique = Object.values(wordsByLength).reduce((sum, arr) => sum + arr.length, 0);
  const priorityCount = priority.filter(e => normalize(e.word).length >= 2).length;
  debug.log('dict', `${category}: ${totalUnique} words (${priorityCount} category)`);
  return totalUnique;
}

export function loadMergedCategories(
  cat1: Category,
  cat2: Category,
  language: Language,
  dbWords1: DictionaryEntry[] = [],
  dbWords2: DictionaryEntry[] = [],
  glueWords1: DictionaryEntry[] = [],
  glueWords2: DictionaryEntry[] = []
) {
  cluesMap.clear();
  wordsByLength = {};
  priorityWordSet = new Set();
  dictionaryVersion++;

  const baseGlue = language === 'fa' ? MASSIVE_GLUE_FA : MASSIVE_GLUE_EN;
  const isFA = language === 'fa';
  const keepPriority = isFA ? makePriorityFilter() : ACCEPT_ALL;
  // A merged grid may legitimately use a word locked to either player's category.
  const keepSupplement = isFA ? makeMergedSupplementFilter([cat1, cat2]) : ACCEPT_ALL;
  const curatedShort = isFA ? COMMON_CROSSWORD_GLUE_FA : [];
  const categoryGlue1 = language === 'fa'
    ? (CATEGORY_GLUE_MAP_FA[cat1] || [])
    : (CATEGORY_GLUE_MAP_EN[cat1] || []);
  const categoryGlue2 = language === 'fa'
    ? (CATEGORY_GLUE_MAP_FA[cat2] || [])
    : (CATEGORY_GLUE_MAP_EN[cat2] || []);

  // Priority: all glue + main words from BOTH categories
  const priority: DictionaryEntry[] = [];
  for (const e of glueWords1) priority.push({ ...e });
  for (const e of glueWords2) priority.push({ ...e });
  const extra1 = SHORT_EXTRA_MAP[cat1] || [];
  const extra2 = SHORT_EXTRA_MAP[cat2] || [];
  for (const e of extra1) priority.push({ ...e, category: cat1 });
  for (const e of extra2) priority.push({ ...e, category: cat2 });
  for (const e of categoryGlue1) priority.push({ ...e, category: cat1 });
  for (const e of categoryGlue2) priority.push({ ...e, category: cat2 });

  // Main category words from the server AND the bundled list are both priority —
  // see the same rule in loadCategory().
  if (dbWords1.length > 0) for (const e of dbWords1) priority.push({ ...e, category: cat1 });
  for (const e of getMainWordsForCategory(cat1, language)) priority.push({ ...e, category: cat1 });
  if (dbWords2.length > 0) for (const e of dbWords2) priority.push({ ...e, category: cat2 });
  for (const e of getMainWordsForCategory(cat2, language)) priority.push({ ...e, category: cat2 });

  // Supplement: generic glue + other categories' words (non-cat1, non-cat2).
  // Short slots fall back to the curated common pool — see loadCategory().
  const allSupplement: DictionaryEntry[] = [];
  const shortSupplement: DictionaryEntry[] = [...curatedShort, ...baseGlue];
  const priorityNorms = new Set<string>();
  for (const e of priority) priorityNorms.add(normalize(e.word));
  const allLocal = getAllLocalWords(language, true);
  for (const e of allLocal) {
    const n = normalize(e.word);
    if (!priorityNorms.has(n)) allSupplement.push(e);
  }
  for (const e of baseGlue) allSupplement.push(e);

  // Group by length
  for (let len = 2; len <= 12; len++) {
    const result: string[] = [];
    const seen = new Set<string>();
    const source = isFA && len <= CURATED_FALLBACK_MAX_LEN ? shortSupplement : allSupplement;
    for (const e of priority) {
      const n = normalize(e.word);
      if (n.length === len && !cluesMap.has(n) && !seen.has(n) && keepPriority(e)) {
        cluesMap.set(n, e.clue);
        seen.add(n);
        result.push(n);
        priorityWordSet.add(n);
      }
    }
    for (const e of source) {
      const n = normalize(e.word);
      if (n.length === len && !cluesMap.has(n) && !seen.has(n) && keepSupplement(e)) {
        cluesMap.set(n, e.clue);
        seen.add(n);
        result.push(n);
      }
    }
    wordsByLength[len] = result;
  }

  const totalUnique = Object.values(wordsByLength).reduce((sum, arr) => sum + arr.length, 0);
  debug.log('dict', 'merged ' + cat1 + '+' + cat2 + ': ' + totalUnique + ' words');
  return totalUnique;
}

// ADMIN TOOL: Get local lists for uploading to DB
export function getLocalWordsForSeeding(category: Category, language: Language): DictionaryEntry[] {
    const isFA = language === 'fa';
    const genericGlue = isFA ? MASSIVE_GLUE_FA : MASSIVE_GLUE_EN;
    const categoryGlue = isFA
      ? (CATEGORY_GLUE_MAP_FA[category] || [])
      : (CATEGORY_GLUE_MAP_EN[category] || []);
    
    // Use category-specific glue when available, fall back to generic
    const effectiveGlue = categoryGlue.length > 0 ? categoryGlue : genericGlue;
    
    let specificList: DictionaryEntry[] = [];

    switch (category) {
        case 'movies': specificList = isFA ? WL.MOVIES_FA : WL.MOVIES_EN; break;
        case 'cities': specificList = isFA ? WL.CITIES_FA : WL.CITIES_EN; break;
        case 'food': specificList = isFA ? WL.FOOD_FA : WL.FOOD_EN; break;
        case 'body': specificList = isFA ? WL.BODY_FA : WL.BODY_EN; break; 
        case 'jobs': specificList = isFA ? WL.JOBS_FA : WL.JOBS_EN; break;
        case 'tech': specificList = isFA ? WL.TECH_FA : WL.TECH_EN; break;
        case 'nature': specificList = isFA ? WL.NATURE_FA : WL.NATURE_EN; break;
        case 'knowledge': specificList = isFA ? WL.KNOWLEDGE_FA : WL.KNOWLEDGE_EN; break;
        case 'shahnameh': specificList = isFA ? SHAHNAMEH_FA : []; break;
        case 'history': specificList = isFA ? WL.HISTORY_FA : WL.HISTORY_EN; break;
        case 'sports': specificList = isFA ? WL.SPORTS_FA : WL.SPORTS_EN; break;
        case 'art': specificList = isFA ? WL.ART_FA : WL.ART_EN; break;
        default: return [];
    }

    return [...effectiveGlue, ...specificList];
}

export function getTotalWords(): number {
  return Object.values(wordsByLength).reduce((acc, arr) => acc + arr.length, 0);
}

export function getClueForWord(word: string): string {
  if (cluesMap.has(word)) return cluesMap.get(word)!;
  return word.match(/[a-zA-Z]/) ? "General word" : "واژه عمومی";
}

export function getMatchingWords(pattern: string): string[] {
  const len = pattern.length;
  const candidates = wordsByLength[len] || [];
  
  if (!pattern.includes('_')) {
      return candidates.includes(pattern) ? [pattern] : [];
  }

  // Escape regex metacharacters in the pattern, then treat '_' as a wildcard.
  // Without escaping, a prefilled cell containing e.g. '(' would throw at runtime.
  const escaped = pattern
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(/_/g, '.');
  const regex = new RegExp(`^${escaped}$`);
  return candidates.filter(w => regex.test(w));
}
