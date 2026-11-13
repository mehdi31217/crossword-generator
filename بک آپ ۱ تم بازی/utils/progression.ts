/**
 * Client mirror of `server/progression.js`.
 *
 * ⚠️ Mirror rule: change one, change the other.
 */

export const STREAK_MULT = [1, 1.1, 1.2, 1.3, 1.5, 1.7, 2];

export const SEASON_DAYS = 28;
export const SEASON_KEEP_RATIO = 0.7;
export const SEASON_REWARDS: Record<string, number> = {
  bronze: 60,
  silver: 90,
  gold: 140,
  crystal: 200,
  diamond: 280,
  legendary: 360,
};

export const SET_REWARD_COINS = 50;
export const LEVEL_CHEST_COINS = 75;
export const LEVEL_CHEST_EVERY = 5;

export const WIN_STREAK_BONUS = { every: 3, coins: 12, dailyCap: 36 };

export const SHELF_FRAMES: Record<string, string> = {
  history: 'frame_history',
  epic: 'frame_epic',
  folklore: 'frame_folklore',
  football: 'frame_football',
};

/** Maximum number of Master Scrolls that can be equipped in the Scroll Combo Rack. */
export const MAX_SCROLL_SLOTS = 10;

// ─── XP ──────────────────────────────────────────────────

export interface XpInfo {
  value: number;
  level: number;
  into: number;
  need: number;
  pct: number;
}

const safeInt = (n: unknown, fallback = 0) => {
  const v = Math.floor(Number(n) || 0);
  return Number.isFinite(v) ? Math.max(0, v) : fallback;
};

export function xpForLevel(level: number): number {
  const l = Math.max(1, Math.floor(Number(level) || 1));
  return 100 * l * (l - 1);
}

export function levelFromXp(xp: number): number {
  const value = safeInt(xp);
  let level = 1;
  while (level < 999 && xpForLevel(level + 1) <= value) level++;
  return level;
}

export function xpInfo(xp: number): XpInfo {
  const value = safeInt(xp);
  const level = levelFromXp(value);
  const floor = xpForLevel(level);
  const next = xpForLevel(level + 1);
  const need = next - floor;
  const into = value - floor;
  return {
    value,
    level,
    into,
    need,
    pct: need > 0 ? Math.min(100, Math.round((into / need) * 100)) : 100,
  };
}

/**
 * Smooth 30-tier Season Battle Pass progression (aligned with SEASON_PASS_TIERS).
 */
export function seasonTierInfo(xp: number): XpInfo {
  const value = safeInt(xp);
  const step = 220;
  const tier = Math.min(30, Math.max(1, Math.floor(value / step) + 1));
  const floor = (tier - 1) * step;
  const next = tier * step;
  const need = step;
  const into = tier >= 30 ? step : Math.max(0, value - floor);
  return {
    value,
    level: tier,
    into,
    need,
    pct: tier >= 30 ? 100 : Math.min(100, Math.round((into / need) * 100)),
  };
}

export function streakMultiplier(streak: number): number {
  const idx = Math.min(Math.max(Number(streak) || 0, 0), STREAK_MULT.length - 1);
  return STREAK_MULT[idx];
}

// ─── Server payload shapes ───────────────────────────────

export interface QuestView {
  id: string;
  type: string;
  target: number;
  progress: number;
  claimed: boolean;
  reward: number;
  labelFa: string;
  labelEn: string;
}

export interface QuestDayView {
  date: string;
  rerolled: boolean;
  items: QuestView[];
}

export interface StreakView {
  current: number;
  best: number;
  playedToday: boolean;
  multiplier: number;
  nextReward: number;
  shields: number;
  ladder: number[];
}

export interface SeasonView {
  id: string;
  endsAt: string;
  daysLeft: number;
  claimed: boolean;
  pendingTier: string | null;
  pendingCoins: number;
  currentTier: string;
  rewardCoins: number;
}

export interface CosmeticsView {
  owned: string[];
  frame: string | null;
  title: string | null;
}

export interface EconomyStateView {
  purchasedPacks: string[];
  unlockedBooks: string[];
  unlockedAvatars: string[];
  unlockedSizes: number[];
  unlockedCategories: string[];
  unlockedLegends?: string[];
  hasEpicPatronPass: boolean;
  hasSeasonPass: boolean;
  seasonPassClaimedFree: number[];
  seasonPassClaimedGold: number[];
  wheelSpinsToday: number;
  wheelFreeAvailable: boolean;
  wheelAdAvailable: boolean;
  wheelPaidAvailable: boolean;
  rewardedAdsToday: number;
  rewardedAdsRemaining: number;
  /** Clay Piggy Bank (خمرهٔ زرین سفالی) */
  piggyBankCoins?: number;
  piggyBankSmashedCount?: number;
  /** Kiln Polishing & Practice Mode (کورهٔ صیقل و تمرین روزانه) */
  freePracticeToday?: number;
  freePracticeRemaining?: number;
  freePolishTokens?: number;
  cardPolishPity?: Record<string, number>;
  storyCardTiers?: Record<string, 1 | 2 | 3 | 4>;
  /** Cached resolved tiers for unlocked Master Scrolls (`scroll:legend:<id>` or `scroll:book:<id>`) */
  scrollTiers?: Record<string, 1 | 2 | 3 | 4>;
  /** 10-Scroll Active Combo Rack (قفسهٔ ترکیب ۱۰ طوماری — تک‌نفره و نبرد آنلاین) */
  activeDeck?: string[];
  /** Daily Free Second-Chance Ad Revive */
  reviveAdUsedToday?: boolean;
}

export type DeckCardFamily = 'football' | 'epic' | 'history' | 'folklore';
export type CardFamily = DeckCardFamily;

export interface ActiveDeckCardSlot {
  key: string;
  family: DeckCardFamily;
  groupId: string;
  tier: 1 | 2 | 3 | 4;
  titleFa: string;
  subtitleFa: string;
}

export interface FamilySynergyStatus {
  family: DeckCardFamily;
  count: number;
  bonusPct: 5 | 12 | 25;
  labelFa: string;
  tierLabelFa: string;
}

export interface ActiveDeckBuffs {
  cards: ActiveDeckCardSlot[];
  hasSynergy: boolean;
  synergyLabelFa: string | null;
  familySynergies: FamilySynergyStatus[];
  /** Football Scrolls: +score combo in single-player & +mana charge / -attack cost in online battle */
  comboScoreBonusPct: number;
  onlineManaChargeBonusPct: number;
  onlineAttackDiscountPct: number;
  /** Epic / Shahnameh Scrolls: +monster rage armor in story & -freeze/blind duration + erase shield in online battle */
  monsterArmorPct: number;
  onlineDebuffResistPct: number;
  onlineEraseShieldCharges: number;
  /** History Scrolls: +coins & XP in single-player & +league trophies / arena bonus in online battle */
  coinXpBonusPct: number;
  onlineTrophyBonusPct: number;
  /** Folklore Scrolls: -hint coin cost & auto-reveal 1-2 starting key letters at second 0 */
  hintDiscountPct: number;
  startingFreeLetterCount: number;
}

/**
 * Computed status of a Set's Master Scroll (`طومار مجموعه`).
 * A Master Scroll unlocks ONLY when `unlockedCards === totalCards && totalCards > 0`.
 * Its tier equals the MINIMUM tier across all cards in that set (`scrollTier`).
 */
export interface SetScrollStatus {
  scrollKey: string;
  setId: string;
  family: DeckCardFamily;
  titleFa: string;
  titleEn: string;
  icon: string;
  color: string;
  isUnlocked: boolean;
  unlockedCards: number;
  totalCards: number;
  /** null when locked, or 1..4 (= minimum tier among all cards in the set) when unlocked */
  scrollTier: 1 | 2 | 3 | 4 | null;
  /** Next achievable tier (2, 3, or 4) if unlocked and scrollTier < 4 */
  nextTargetTier: 2 | 3 | 4 | null;
  /** How many cards in the set are currently at `scrollTier` (holding back the upgrade to `nextTargetTier`) */
  bottleneckCount: number;
}

export function resolveSetScrollTier(
  scrollKey: string,
  setId: string,
  titleFa: string,
  titleEn: string,
  family: DeckCardFamily,
  icon: string,
  color: string,
  cardTiers: Array<number | null | undefined>,
): SetScrollStatus {
  const totalCards = cardTiers.length;
  if (totalCards <= 0) {
    return {
      scrollKey,
      setId,
      family,
      titleFa,
      titleEn,
      icon,
      color,
      isUnlocked: false,
      unlockedCards: 0,
      totalCards: 0,
      scrollTier: null,
      nextTargetTier: null,
      bottleneckCount: 0,
    };
  }
  const validTiers: number[] = [];
  for (let i = 0; i < totalCards; i++) {
    const t = Number(cardTiers[i] || 0);
    if (t >= 1) validTiers.push(Math.min(4, Math.max(1, t)));
  }
  if (validTiers.length < totalCards) {
    return {
      scrollKey,
      setId,
      family,
      titleFa,
      titleEn,
      icon,
      color,
      isUnlocked: false,
      unlockedCards: validTiers.length,
      totalCards,
      scrollTier: null,
      nextTargetTier: null,
      bottleneckCount: totalCards - validTiers.length,
    };
  }
  const minTier = Math.min(...validTiers) as 1 | 2 | 3 | 4;
  const bottleneckCount = validTiers.filter((t) => t === minTier).length;
  return {
    scrollKey,
    setId,
    family,
    titleFa,
    titleEn,
    icon,
    color,
    isUnlocked: true,
    unlockedCards: totalCards,
    totalCards,
    scrollTier: minTier,
    nextTargetTier: minTier < 4 ? ((minTier + 1) as 2 | 3 | 4) : null,
    bottleneckCount: minTier < 4 ? bottleneckCount : 0,
  };
}

export const HISTORY_BOOK_SET = new Set([
  'medes', 'kurosh', 'dariush', 'achaemenid_fall', 'ashkanian', 'sassanid',
  'babak', 'samanid', 'ghaznavid', 'saljuq', 'kharazm', 'safavid',
  'nadershah', 'zandiyeh', 'amir_kabir', 'mashruteh', 'mosaddegh', 'iran_football',
]);

export const FOLKLORE_BOOK_SET = new Set([
  'hassan_kachal', 'mah_pishooni', 'kadoo_qelqeleh', 'shahzadeh_ahu',
  'gorg_robah', 'narنج_toranj', 'narenj_toranj', 'chel_gis', ' namaki', 'namaki',
  'shangoul_mangoul', 'khaleh_pirzan',
]);

export const LEGEND_NAME_FA_MAP: Record<string, string> = {
  messi: 'لیونل مسی',
  maradona: 'دیگو مارادونا',
  zidane: 'زین‌الدین زیدان',
  ronaldo: 'کریستیانو رونالدو',
  pele: 'پله',
  daei: 'علی دایی',
  cruyff: 'یوهان کرویف',
  beckham: 'دیوید بکهام',
  ronaldinho: 'رونالدینیو',
  maldini: 'پائولو مالدینی',
  buffon: 'جانلوئیجی بوفون',
  modric: 'لوکا مودریچ',
  salah: 'محمد صلاح',
  iniesta: 'آندرس اینیستا',
  baggio: 'روبرتو باجو',
  platini: 'میشل پلاتینی',
  rivaldo: 'ریوالدو',
  romario: 'روماریو',
  kaka: 'کاکا',
  henry: 'تیری آنری',
  ibrahimovic: 'زلاتان ابراهیموویچ',
  neuer: 'مانوئل نویر',
  ramos: 'سرخیو راموس',
  mbappe: 'کیلیان امباپه',
  haaland: 'ارلینگ هالند',
};

export const BOOK_NAME_FA_MAP: Record<string, string> = {
  rostam_7: 'هفت‌خوان رستم',
  rostam_sohrab: 'رستم و سهراب',
  rostam_afrasiab: 'رستم و افراسیاب',
  siavoshan: 'سیاوش',
  bizhan: 'بیژن و منیژه',
  zal_rudabeh: 'زال و رودابه',
  arash: 'آرش کمانگیر',
  khosrow_shirin: 'خسرو و شیرین',
  haft_peykar: 'هفت پیکر',
  kurosh: 'کوروش بزرگ',
  medes: 'مادها',
  dariush: 'داریوش بزرگ',
  mosaddegh: 'دکتر مصدق',
  amir_kabir: 'امیرکبیر',
  nadershah: 'نادرشاه',
  hassan_kachal: 'حسن کچل',
  mah_pishooni: 'ماه‌پیشونی',
  kadoo_qelqeleh: 'کدو قلقل‌زن',
};

export function getBookFamily(bookId: string, genre?: string): DeckCardFamily {
  if (genre === 'history' || HISTORY_BOOK_SET.has(bookId)) return 'history';
  if (genre === 'folklore' || FOLKLORE_BOOK_SET.has(bookId)) return 'folklore';
  return 'epic';
}

export function parseDeckCardSlot(
  scrollOrCardKey: string,
  economy?: EconomyStateView | null,
  worldmapCards?: Record<string, number>,
  _epicStars?: Record<string, number>,
): ActiveDeckCardSlot | null {
  if (!scrollOrCardKey) return null;

  // ── 1. Master Scroll Keys (`scroll:legend:<legendId>` or `scroll:book:<bookId>`) ──
  if (scrollOrCardKey.startsWith('scroll:legend:')) {
    const parts = scrollOrCardKey.split(':');
    const legendId = parts[2] || 'messi';
    const explicitTier = Number(parts[3] || 0);
    let resolvedTier = explicitTier || Number(economy?.scrollTiers?.[`scroll:legend:${legendId}`] || 0);

    if (!resolvedTier && worldmapCards) {
      const matchingEntries = Object.entries(worldmapCards).filter(([chId]) =>
        chId.startsWith(`${legendId}_`),
      );
      if (matchingEntries.length >= 4) {
        resolvedTier = Math.min(...matchingEntries.map(([, t]) => Math.min(4, Math.max(1, Number(t) || 1))));
      }
    }

    const tier = (Math.min(4, Math.max(1, resolvedTier || 1)) as 1 | 2 | 3 | 4);
    const legendTitle = LEGEND_NAME_FA_MAP[legendId] || `اسطوره (${legendId.toUpperCase()})`;
    return {
      key: `scroll:legend:${legendId}`,
      family: 'football',
      groupId: `legend_${legendId}`,
      tier,
      titleFa: `طومار ${legendTitle}`,
      subtitleFa: 'امتیاز کومبو و شارژ مانا آنلاین',
    };
  }

  if (scrollOrCardKey.startsWith('scroll:book:')) {
    const parts = scrollOrCardKey.split(':');
    const bookId = parts[2] || 'rostam_7';
    const explicitTier = Number(parts[3] || 0);
    const resolvedTier =
      explicitTier || Number(economy?.scrollTiers?.[`scroll:book:${bookId}`] || 1);
    const tier = (Math.min(4, Math.max(1, resolvedTier)) as 1 | 2 | 3 | 4);
    const family = getBookFamily(bookId);
    const bookName =
      BOOK_NAME_FA_MAP[bookId] ||
      (family === 'history' ? 'تاریخ ایران' : family === 'folklore' ? 'قصه کهن' : 'شاهنامه');
    const familySub =
      family === 'history'
        ? 'سکه، XP و تروفی لیگ آنلاین'
        : family === 'folklore'
          ? 'تخفیف راهنما و حرف آغازین'
          : 'زره دیو و مقاومت طلسم آنلاین';
    return {
      key: `scroll:book:${bookId}`,
      family,
      groupId: `book_${bookId}`,
      tier,
      titleFa: `طومار ${bookName}`,
      subtitleFa: familySub,
    };
  }

  return null;
}

/**
 * Stepped Family Synergy multiplier for a family count in the 10-Scroll Rack:
 * - 3..5 scrolls of same family -> +5% (1.05x)
 * - 6..9 scrolls of same family -> +12% (1.12x)
 * - 10 scrolls of same family   -> +25% (1.25x)
 */
export function getFamilySynergyBonusPct(count: number): 0 | 5 | 12 | 25 {
  if (count >= 10) return 25;
  if (count >= 6) return 12;
  if (count >= 3) return 5;
  return 0;
}

const FAMILY_TITLE_FA: Record<DeckCardFamily, string> = {
  football: 'اساطیر فوتبال',
  epic: 'حماسه و شاهنامه',
  history: 'تاریخ ایران',
  folklore: 'قصه‌های کهن',
};

/**
 * Computes active buffs from the 10-Slot Master Scroll Rack (`activeDeck`).
 * Per-scroll values are carefully balanced for a 10-scroll capacity, with stepped
 * 3 / 6 / 10 family synergy bonuses.
 */
export function computeActiveDeckBuffs(
  economy?: EconomyStateView | null,
  worldmapCards?: Record<string, number>,
  epicStars?: Record<string, number>,
): ActiveDeckBuffs {
  const rawKeys = Array.isArray(economy?.activeDeck)
    ? economy!.activeDeck!.filter((k) => typeof k === 'string' && k.startsWith('scroll:')).slice(0, MAX_SCROLL_SLOTS)
    : [];

  const cards: ActiveDeckCardSlot[] = [];
  const seenKeys = new Set<string>();
  for (const k of rawKeys) {
    const slot = parseDeckCardSlot(k, economy, worldmapCards, epicStars);
    if (slot && !seenKeys.has(slot.key)) {
      seenKeys.add(slot.key);
      cards.push(slot);
    }
  }

  // Count scrolls per family for stepped 3 / 6 / 10 synergy
  const familyCounts: Record<DeckCardFamily, number> = {
    football: 0,
    epic: 0,
    history: 0,
    folklore: 0,
  };
  for (const c of cards) {
    familyCounts[c.family] += 1;
  }

  const familySynergies: FamilySynergyStatus[] = [];
  (['football', 'epic', 'history', 'folklore'] as DeckCardFamily[]).forEach((fam) => {
    const cnt = familyCounts[fam];
    const bonusPct = getFamilySynergyBonusPct(cnt);
    if (bonusPct > 0) {
      const label = `${cnt} طومار ${FAMILY_TITLE_FA[fam]} (+${bonusPct}٪ هم‌افزایی)`;
      familySynergies.push({
        family: fam,
        count: cnt,
        bonusPct: bonusPct as 5 | 12 | 25,
        labelFa: label,
        tierLabelFa: label,
      });
    }
  });

  const hasSynergy = familySynergies.length > 0;
  const synergyLabelFa = hasSynergy
    ? familySynergies.map((s) => s.tierLabelFa).join(' · ')
    : null;

  // Per-Scroll Base Tables (balanced for 10-Slot Scroll Rack)
  const footballTable: Record<1 | 2 | 3 | 4, number> = { 1: 1.5, 2: 3.0, 3: 4.5, 4: 6.5 };
  const epicTable: Record<1 | 2 | 3 | 4, number> = { 1: 2.0, 2: 3.5, 3: 5.5, 4: 7.5 };
  const historyTable: Record<1 | 2 | 3 | 4, number> = { 1: 1.5, 2: 2.5, 3: 4.0, 4: 6.0 };
  const folkloreTable: Record<1 | 2 | 3 | 4, number> = { 1: 1.5, 2: 3.0, 3: 4.5, 4: 6.0 };

  let rawFootball = 0;
  let rawEpic = 0;
  let epicTier4Count = 0;
  let rawHistory = 0;
  let rawFolklore = 0;
  let folkloreTier4Count = 0;

  for (const c of cards) {
    if (c.family === 'football') {
      rawFootball += footballTable[c.tier];
    } else if (c.family === 'epic') {
      rawEpic += epicTable[c.tier];
      if (c.tier === 4) epicTier4Count += 1;
    } else if (c.family === 'history') {
      rawHistory += historyTable[c.tier];
    } else if (c.family === 'folklore') {
      rawFolklore += folkloreTable[c.tier];
      if (c.tier === 4) folkloreTier4Count += 1;
    }
  }

  const fbMult = 1 + getFamilySynergyBonusPct(familyCounts.football) / 100;
  const epMult = 1 + getFamilySynergyBonusPct(familyCounts.epic) / 100;
  const hiMult = 1 + getFamilySynergyBonusPct(familyCounts.history) / 100;
  const foMult = 1 + getFamilySynergyBonusPct(familyCounts.folklore) / 100;

  const comboScoreBonusPct = Math.min(65, Math.round(rawFootball * fbMult));
  const onlineManaChargeBonusPct = Math.min(65, Math.round(rawFootball * fbMult));
  const onlineAttackDiscountPct = Math.min(25, Math.round(rawFootball * fbMult * 0.38));

  const monsterArmorPct = Math.min(70, Math.round(rawEpic * epMult));
  const onlineDebuffResistPct = Math.min(60, Math.round(rawEpic * epMult * 0.85));
  const onlineEraseShieldCharges =
    familyCounts.epic >= 10 || epicTier4Count >= 4
      ? 2
      : familyCounts.epic >= 6 || epicTier4Count >= 2
        ? 1
        : 0;

  const coinXpBonusPct = Math.min(55, Math.round(rawHistory * hiMult));
  const onlineTrophyBonusPct = Math.min(55, Math.round(rawHistory * hiMult));

  const hintDiscountPct = Math.min(50, Math.round(rawFolklore * foMult));
  const startingFreeLetterCount =
    familyCounts.folklore >= 6 || folkloreTier4Count >= 3
      ? 2
      : familyCounts.folklore >= 3 || folkloreTier4Count >= 1
        ? 1
        : 0;

  return {
    cards,
    hasSynergy,
    synergyLabelFa,
    familySynergies,
    comboScoreBonusPct,
    onlineManaChargeBonusPct,
    onlineAttackDiscountPct,
    monsterArmorPct,
    onlineDebuffResistPct,
    onlineEraseShieldCharges,
    coinXpBonusPct,
    onlineTrophyBonusPct,
    hintDiscountPct,
    startingFreeLetterCount,
  };
}

export interface ProgressSnapshot {
  xp: XpInfo;
  streak: StreakView;
  quests: QuestDayView;
  season: SeasonView;
  cosmetics: CosmeticsView;
  claimedSets: Record<string, boolean>;
  winStreak: number;
  streakBonusLeft: number;
  economy?: EconomyStateView;
}

export interface ProgressGrant {
  xp: XpInfo;
  level: number;
  levelUp: boolean;
  chestCoins: number;
  quests: QuestDayView;
}

// ─── Cosmetics catalogue ────────────────────────────────

export type CosmeticKind = 'frame' | 'title';

export interface CosmeticDef {
  id: string;
  kind: CosmeticKind;
  price: number;
  grantOnly?: boolean;
  style?: string;
  nameFa: string;
  nameEn: string;
}

export const COSMETICS: CosmeticDef[] = [
  { id: 'frame_gold', kind: 'frame', style: 'gold', price: 600, nameFa: 'قاب طلایی هخامنشی', nameEn: 'Achaemenid Gold Frame' },
  { id: 'frame_mint', kind: 'frame', style: 'mint', price: 600, nameFa: 'قاب فیروزه نیشابور', nameEn: 'Nishapur Turquoise Frame' },
  { id: 'frame_royal', kind: 'frame', style: 'royal', price: 1100, nameFa: 'قاب شاهی صفوی', nameEn: 'Safavid Royal Frame' },
  { id: 'frame_lapis', kind: 'frame', style: 'lapis', price: 1400, nameFa: 'قاب لاجورد کاشان', nameEn: 'Kashan Lapis Frame' },
  { id: 'frame_terracotta_crown', kind: 'frame', style: 'crown', price: 1800, nameFa: 'قاب تاج کیانی', nameEn: 'Kiani Crown Frame' },
  { id: 'frame_pahlavan', kind: 'frame', style: 'pahlavan', price: 900, nameFa: 'قاب پهلوان خشتی', nameEn: 'Clay Hero Frame' },
  { id: 'frame_season_gold', kind: 'frame', style: 'season', price: 0, grantOnly: true, nameFa: 'قاب زرین فصل‌نامه', nameEn: 'Season Gold Frame' },
  { id: 'frame_history', kind: 'frame', style: 'history', price: 0, grantOnly: true, nameFa: 'قاب تاریخ', nameEn: 'History Frame' },
  { id: 'frame_epic', kind: 'frame', style: 'epic', price: 0, grantOnly: true, nameFa: 'قاب حماسه', nameEn: 'Epic Frame' },
  { id: 'frame_folklore', kind: 'frame', style: 'folklore', price: 0, grantOnly: true, nameFa: 'قاب قصه‌ها', nameEn: 'Tales Frame' },
  { id: 'frame_football', kind: 'frame', style: 'football', price: 0, grantOnly: true, nameFa: 'قاب فوتبال', nameEn: 'Football Frame' },
  { id: 'title_master', kind: 'title', price: 650, nameFa: 'استاد جدول', nameEn: 'Grid Master' },
  { id: 'title_explorer', kind: 'title', price: 650, nameFa: 'جهانگرد خشتی', nameEn: 'Clay Explorer' },
  { id: 'title_streaker', kind: 'title', price: 850, nameFa: 'زنجیره‌ساز آتشین', nameEn: 'Blazing Streaker' },
  { id: 'title_shahnameh_khan', kind: 'title', price: 1200, nameFa: 'شاهنامه‌خوان بزرگ', nameEn: 'Grand Shahnameh Scholar' },
  { id: 'title_treasurer', kind: 'title', price: 1500, nameFa: 'خزانه‌دار شاهی', nameEn: 'Royal Treasurer' },
  { id: 'title_hakim', kind: 'title', price: 1500, nameFa: 'حکیم طوس', nameEn: 'Sage of Tus' },
];

export const COSMETICS_BY_ID: Record<string, CosmeticDef> = Object.fromEntries(
  COSMETICS.map((c) => [c.id, c]),
);

// ─── 30-Tier Season Battle Pass ──────────────────────────

export interface SeasonPassRewardDef {
  kind: 'coins' | 'ticket' | 'item' | 'jackpot';
  coins?: number;
  count?: number;
  item?: 'streakShield' | 'trophyShield' | 'trophyBoost';
  cosmetic?: string;
  labelFa: string;
  labelEn: string;
}

export interface SeasonPassTierDef {
  tier: number;
  xpRequired: number;
  freeReward: SeasonPassRewardDef | null;
  goldReward: SeasonPassRewardDef;
}

export const SEASON_PASS_TIERS: SeasonPassTierDef[] = Array.from({ length: 30 }, (_, idx) => {
  const tier = idx + 1;
  const xpRequired = tier * 100;

  let freeReward: SeasonPassRewardDef | null = null;
  if (tier % 5 === 0) {
    freeReward = { kind: 'ticket', count: 1, labelFa: '۱ بلیت برج', labelEn: '1 Tower Ticket' };
  } else if (tier % 2 === 1) {
    const c = tier >= 20 ? 35 : tier >= 10 ? 25 : 15;
    freeReward = { kind: 'coins', coins: c, labelFa: `${c} سکه`, labelEn: `${c} Coins` };
  }

  let goldReward: SeasonPassRewardDef;
  if (tier === 1) {
    goldReward = { kind: 'coins', coins: 150, labelFa: '۱۵۰ سکه آغاز فصل', labelEn: '150 Season Start Coins' };
  } else if (tier === 10) {
    goldReward = { kind: 'item', item: 'streakShield', count: 2, labelFa: '۲ سپر زنجیره', labelEn: '2 Streak Shields' };
  } else if (tier === 15) {
    goldReward = { kind: 'coins', coins: 250, labelFa: '۲۵۰ سکه خشتی', labelEn: '250 Clay Coins' };
  } else if (tier === 20) {
    goldReward = { kind: 'item', item: 'trophyShield', count: 2, labelFa: '۲ سپر تروفی', labelEn: '2 Trophy Shields' };
  } else if (tier === 25) {
    goldReward = { kind: 'ticket', count: 3, labelFa: '۳ بلیت برج', labelEn: '3 Tower Tickets' };
  } else if (tier === 30) {
    goldReward = { kind: 'jackpot', coins: 500, cosmetic: 'frame_terracotta_crown', labelFa: '۵۰۰ سکه + قاب تاج کیانی!', labelEn: '500 Coins + Kiani Crown!' };
  } else if (tier % 4 === 0) {
    goldReward = { kind: 'ticket', count: 1, labelFa: '۱ بلیت برج', labelEn: '1 Tower Ticket' };
  } else if (tier % 3 === 0) {
    goldReward = { kind: 'item', item: 'trophyBoost', count: 1, labelFa: '۱ تقویت تروفی', labelEn: '1 Trophy Boost' };
  } else {
    const c = tier >= 20 ? 110 : tier >= 10 ? 85 : 65;
    goldReward = { kind: 'coins', coins: c, labelFa: `${c} سکه زرین`, labelEn: `${c} Gold Coins` };
  }

  return { tier, xpRequired, freeReward, goldReward };
});

export function cosmeticName(id: string | null | undefined, isFA: boolean): string {
  if (!id) return '';
  const def = COSMETICS_BY_ID[id];
  if (!def) return '';
  return isFA ? def.nameFa : def.nameEn;
}

export function frameClass(id: string | null | undefined): string {
  if (!id) return '';
  const def = COSMETICS_BY_ID[id];
  return def && def.kind === 'frame' && def.style ? `mm-frame-${def.style}` : '';
}

export function tierNameFa(tier: string | null | undefined): string {
  switch (tier) {
    case 'bronze': return 'برنز';
    case 'silver': return 'نقره';
    case 'gold': return 'طلا';
    case 'crystal': return 'کریستال';
    case 'diamond': return 'الماس';
    case 'legendary': return 'افسانه‌ای';
    default: return 'برنز';
  }
}

export function tierNameEn(tier: string | null | undefined): string {
  if (!tier) return 'Bronze';
  return tier.charAt(0).toUpperCase() + tier.slice(1);
}
