/**
 * progression.js — server-owned player progression (XP, streak, quests, seasons,
 * cosmetics, and 30-tier Season Battle Pass).
 * The client mirror lives in `utils/progression.ts`; every number that the UI
 * displays must exist in both files.
 */

'use strict';

const { DAILY_PUZZLE_REWARD } = require('./economy');

const DAY_MS = 24 * 60 * 60 * 1000;
const SEASON_DAYS = 28;
const SEASON_EPOCH = Date.UTC(2026, 0, 1);

// ─── Daily streak ────────────────────────────────────────

const STREAK_MULT = [1, 1.1, 1.2, 1.3, 1.5, 1.7, 2];

function streakMultiplier(streak) {
  const idx = Math.min(Math.max(Number(streak) || 0, 0), STREAK_MULT.length - 1);
  return STREAK_MULT[idx];
}

function dailyRewardFor(streak) {
  return Math.round(DAILY_PUZZLE_REWARD * streakMultiplier((Number(streak) || 0) - 1));
}

function todayString(now = new Date()) {
  return now.toLocaleDateString('en-CA');
}

function yesterdayString(now = new Date()) {
  return new Date(now.getTime() - DAY_MS).toLocaleDateString('en-CA');
}

function planDaily(profile, now = new Date()) {
  const today = todayString(now);
  const yesterday = yesterdayString(now);
  const last = profile.daily_streak_last || '';
  const prev = Number(profile.daily_streak) || 0;
  const shields = Number(profile.items && profile.items.streakShield) || 0;

  let streak;
  let shieldUsed = false;
  if (last === today) {
    streak = Math.max(1, prev);
  } else if (last === yesterday) {
    streak = prev + 1;
  } else if (shields > 0 && prev > 0) {
    streak = prev + 1;
    shieldUsed = true;
  } else {
    streak = 1;
  }

  return {
    today,
    streak,
    best: Math.max(Number(profile.daily_streak_best) || 0, streak),
    multiplier: streakMultiplier(streak - 1),
    reward: dailyRewardFor(streak),
    shieldUsed,
  };
}

// ─── XP & level ──────────────────────────────────────────

function xpForLevel(level) {
  const l = Math.max(1, Math.floor(Number(level) || 1));
  return 100 * l * (l - 1);
}

function levelFromXp(xp) {
  const value = Math.max(0, Math.floor(Number(xp) || 0));
  let level = 1;
  while (level < 999 && xpForLevel(level + 1) <= value) level++;
  return level;
}

const LEVEL_CHEST_COINS = 75;
const LEVEL_CHEST_EVERY = 5;

function applyXp(currentXp, gain) {
  const before = Math.max(0, Math.floor(Number(currentXp) || 0));
  const add = Math.max(0, Math.floor(Number(gain) || 0));
  const after = before + add;
  const levelBefore = levelFromXp(before);
  const level = levelFromXp(after);
  let chests = 0;
  for (let l = levelBefore + 1; l <= level; l++) {
    if (l % LEVEL_CHEST_EVERY === 0) chests++;
  }
  return {
    xp: after,
    level,
    levelBefore,
    levelUp: level > levelBefore,
    chestCoins: chests * LEVEL_CHEST_COINS,
  };
}

function xpInfo(xp) {
  const value = Math.max(0, Math.floor(Number(xp) || 0));
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

const XP = {
  match: ({ score = 0, size = 5, isDaily = false } = {}) =>
    20 + Math.min(60, (Number(size) || 5) * 4) + Math.min(60, Math.round((Number(score) || 0) / 25)) + (isDaily ? 40 : 0),
  tower: (floor) => Math.min(120, Math.max(0, Math.round(Number(floor) || 0) * 8)),
  duel: 45,
  onlineWin: 90,
  onlineLoss: 30,
};

// ─── Daily quests (Rebalanced to 55–65 coins/day across 3 quests) ─────

const QUESTS = [
  { id: 'daily', type: 'daily', target: 1, reward: 20, labelFa: 'معمای روزانه را کامل کن', labelEn: 'Finish the daily puzzle' },
  { id: 'grid7', type: 'grid7', target: 1, reward: 15, labelFa: 'یک جدول ۷×۷ یا بزرگ‌تر بزن', labelEn: 'Finish a 7×7 or bigger grid' },
  { id: 'solo3', type: 'solo3', target: 3, reward: 20, labelFa: 'سه جدول کامل کن', labelEn: 'Complete three grids' },
  { id: 'duel', type: 'duel', target: 1, reward: 20, labelFa: 'یک چالش دوئل را بازی کن', labelEn: 'Play a duel challenge' },
  { id: 'online', type: 'online', target: 1, reward: 25, labelFa: 'یک نبرد آنلاین را ببر', labelEn: 'Win an online battle' },
  { id: 'tower', type: 'tower', target: 1, reward: 20, labelFa: 'در برج به طبقه ۳ برس', labelEn: 'Reach tower floor 3' },
];

const QUESTS_BY_ID = Object.fromEntries(QUESTS.map(q => [q.id, q]));
const QUESTS_PER_DAY = 3;

function hash32(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pickQuests(seed) {
  const pool = QUESTS.map(q => q.id);
  const picked = [];
  let h = hash32(seed);
  while (picked.length < QUESTS_PER_DAY && pool.length) {
    h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
    const idx = h % pool.length;
    picked.push(pool.splice(idx, 1)[0]);
  }
  return picked;
}

function newQuestDay(userId, today, rerolled) {
  const seed = `${userId}|${today}${rerolled ? '|r' : ''}`;
  return {
    date: today,
    rerolled: !!rerolled,
    items: pickQuests(seed).map(id => ({ id, progress: 0, claimed: false })),
  };
}

function ensureQuests(profile, userId, now = new Date()) {
  const today = todayString(now);
  const stored = profile.daily_quests;
  if (stored && stored.date === today && Array.isArray(stored.items)) return stored;
  return newQuestDay(userId, today, false);
}

function publicQuests(state) {
  return {
    date: state.date,
    rerolled: !!state.rerolled,
    items: (state.items || []).map(item => {
      const def = QUESTS_BY_ID[item.id];
      if (!def) return null;
      return {
        id: def.id,
        type: def.type,
        target: def.target,
        progress: Math.min(def.target, Number(item.progress) || 0),
        claimed: !!item.claimed,
        reward: def.reward,
        labelFa: def.labelFa,
        labelEn: def.labelEn,
      };
    }).filter(Boolean),
  };
}

function addQuestProgress(state, types) {
  const bump = Array.isArray(types) ? types : [types];
  const items = (state.items || []).map(item => {
    const def = QUESTS_BY_ID[item.id];
    if (!def || item.claimed || !bump.includes(def.type)) return item;
    const progress = Math.min(def.target, (Number(item.progress) || 0) + 1);
    return { ...item, progress };
  });
  return { ...state, items };
}

// ─── Seasons ─────────────────────────────────────────────

function seasonIndex(now = new Date()) {
  const utcMidnight = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.floor((utcMidnight - SEASON_EPOCH) / (SEASON_DAYS * DAY_MS));
}

function seasonId(now = new Date()) {
  return `S${seasonIndex(now) + 1}`;
}

function seasonEndsAt(now = new Date()) {
  return new Date(SEASON_EPOCH + (seasonIndex(now) + 1) * SEASON_DAYS * DAY_MS);
}

function seasonDaysLeft(now = new Date()) {
  return Math.max(1, Math.ceil((seasonEndsAt(now).getTime() - now.getTime()) / DAY_MS));
}

function family(leagueId) {
  return String(leagueId || 'bronze').replace(/\d+$/, '') || 'bronze';
}

const SEASON_REWARDS = {
  bronze: 60,
  silver: 90,
  gold: 140,
  crystal: 200,
  diamond: 280,
  legendary: 360,
};

const SEASON_KEEP_RATIO = 0.7;

function seasonRollover(profile, leagueIdOf, now = new Date()) {
  const current = seasonId(now);
  if (profile.season_id === current) return null;

  const everPlayed = !!profile.season_id;
  const updates = {
    season_id: current,
    season_reward_claimed: false,
    season_pending_tier: null,
  };
  if (everPlayed) {
    const trophies = Math.max(0, Math.round((Number(profile.trophies) || 0) * SEASON_KEEP_RATIO));
    updates.trophies = trophies;
    updates.league = leagueIdOf ? leagueIdOf(trophies) : family(profile.league);
    updates.season_pending_tier = family(profile.league);
  }
  return updates;
}

// ─── Cosmetics (Expanded Clay & Royal Sink Catalogue) ─────────

const COSMETICS = [
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

const COSMETICS_BY_ID = Object.fromEntries(COSMETICS.map(c => [c.id, c]));

const SHELF_FRAMES = {
  history: 'frame_history',
  epic: 'frame_epic',
  folklore: 'frame_folklore',
  football: 'frame_football',
};

const SET_REWARD_COINS = 60;

const GRAND_MASTERPIECE_BOOKS = new Set([
  'rostam_7', 'rostam_sohrab', 'rostam_afrasiab', 'siavoshan',
  'khosrow_shirin', 'haft_peykar', 'zal_rudabeh', 'kayumars',
  'tahmuras', 'fereydun', 'manuchehr', 'sam_nariman',
  'rustam_12_rokh', 'rustam_ashkbus', 'rustam_kamus', 'rustam_khaqan',
  'esfandiyar_7', 'esfandiyar', 'rostam_esfandiyar', 'bahram_gur',
  'kurosh', 'ashkanian', 'sassanid', 'babak', 'kharazm', 'safavid',
  'nadershah', 'mashruteh',
  'shahrzad', 'samak_ayyar', 'kalila_dimna',
]);

const GRAND_MASTERPIECE_LEGENDS = new Set([
  'messi', 'maradona', 'zidane', 'ronaldo', 'cruyff', 'maldini', 'buffon', 'iniesta',
]);

const SHORT_INTRO_BOOKS = new Set([
  'arash', 'boz', 'kadoo', 'khaleh', 'shangool',
  'gonjeshk', 'khoros', 'gol', 'siah', 'naneh', 'shab', 'gorbeh',
  'hassan_kachal', 'mah_pishooni', 'kadoo_qelqeleh', 'shahzadeh_ahu',
  'gorg_robah', 'narenj_toranj', 'chel_gis', 'namaki', 'shangoul_mangoul', 'khaleh_pirzan',
  'medes', 'persepolis', 'silk_road', 'iran_football',
  'hushang', 'jamshid',
]);

const SHORT_INTRO_LEGENDS = new Set([
  'pele', 'daei', 'beckham', 'salah', 'rivaldo', 'romario', 'kaka',
]);

function getSetRewardFor(shelf, setId) {
  const cleanId = String(setId || '').replace(/^(book_|legend_)/, '');
  if (
    (shelf === 'football' && GRAND_MASTERPIECE_LEGENDS.has(cleanId)) ||
    (shelf !== 'football' && GRAND_MASTERPIECE_BOOKS.has(cleanId))
  ) {
    return { coins: 150, polishTokens: 2, maxScrollTier: 4 };
  }
  if (
    (shelf === 'football' && SHORT_INTRO_LEGENDS.has(cleanId)) ||
    (shelf !== 'football' && SHORT_INTRO_BOOKS.has(cleanId))
  ) {
    return { coins: 60, polishTokens: 0, maxScrollTier: 3 };
  }
  return { coins: 90, polishTokens: 1, maxScrollTier: 4 };
}

// ─── 30-Tier Season Battle Pass (فصل‌نامه حماسی) ────────────────
// Each tier requires 100 XP (so 3,000 XP reaches Tier 30).
const SEASON_PASS_TIERS = Array.from({ length: 30 }, (_, idx) => {
  const tier = idx + 1;
  const xpRequired = tier * 100;

  // Free Track: rewards on odd tiers + milestone tiers
  let freeReward = null;
  if (tier % 5 === 0) {
    freeReward = { kind: 'ticket', count: 1, labelFa: '۱ بلیت برج', labelEn: '1 Tower Ticket' };
  } else if (tier % 2 === 1) {
    const c = tier >= 20 ? 35 : tier >= 10 ? 25 : 15;
    freeReward = { kind: 'coins', coins: c, labelFa: `${c} سکه`, labelEn: `${c} Coins` };
  }

  // Gold Pass Track: rich rewards on every single tier
  let goldReward;
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

module.exports = {
  DAY_MS,
  SEASON_DAYS,
  STREAK_MULT,
  streakMultiplier,
  dailyRewardFor,
  todayString,
  yesterdayString,
  planDaily,

  xpForLevel,
  levelFromXp,
  applyXp,
  xpInfo,
  XP,
  LEVEL_CHEST_COINS,

  QUESTS,
  QUESTS_BY_ID,
  ensureQuests,
  newQuestDay,
  publicQuests,
  addQuestProgress,

  seasonId,
  seasonEndsAt,
  seasonDaysLeft,
  seasonRollover,
  family,
  SEASON_REWARDS,
  SEASON_KEEP_RATIO,

  COSMETICS,
  COSMETICS_BY_ID,
  SHELF_FRAMES,
  SET_REWARD_COINS,
  getSetRewardFor,
  SEASON_PASS_TIERS,
};
