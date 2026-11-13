/**
 * Coin economy — display mirror of server/economy.js.
 * Change one, change the other.
 */
import type { Category, GridSize } from '../types';

export const INITIAL_COINS = 120;

export const DAILY_PUZZLE_REWARD = 35;

export const TOWER_DAILY_COIN_CAP = 90;

/** Tower loot multiplier applied to the floor number. */
export const TOWER_FLOOR_REWARD = {
  /** Floors 1–9. */
  normal: 3,
  /** Floors 10+ — deeper floors are worth more. */
  deep: 4,
  /** Every 5th floor. */
  boss: 6,
};

export const HINT_PRICES = {
  letter: 35,
  word: 90,
};

export const SHOP_PRICES = {
  trophyShield: 150,
  trophyBoost: 120,
  /** Keeps one missed day from breaking the daily streak. */
  streakShield: 120,
  towerTicket: 65,
  wheelExtraSpin: 80,
};

export const REWARDED_AD_COINS = 25;
export const REWARDED_AD_DAILY_CAP = 3;
export const WEB_DIRECT_BONUS_RATE = 0.15;

/** Clay Jar Piggy Bank (خمرهٔ زرین سفالی) */
export const PIGGY_BANK_PER_WORD = 3;
export const PIGGY_BANK_HALF_THRESHOLD = 750;
export const PIGGY_BANK_MAX_CAP = 1500;
export const PIGGY_BANK_SMASH_PRICE_TOMAN = 39000;

/**
 * Kiln Card Polishing & Daily Practice (کورهٔ صیقل خشت و تمرین روزانه)
 * Hybrid Skill + Seal + Coin Economy:
 * - Tier 2 (فیروزه): 60 Coins OR 1 Polish Seal (مُهر صیقل)
 * - Tier 3 (زرین): 1 Polish Seal + 120 Coins OR 2 Polish Seals
 * - Tier 4 (زمرد شاهانه): Strictly requires 2 Polish Seals + 220 Coins (or 3 Polish Seals) — never purchasable with coins alone!
 */
export const KILN_POLISH_COSTS: Record<2 | 3 | 4, number> = {
  2: 60,
  3: 120,
  4: 220,
};
export const KILN_POLISH_SEALS_REQUIRED: Record<2 | 3 | 4, number> = {
  2: 0,
  3: 1,
  4: 2,
};
export const KILN_POLISH_SEAL_ONLY_COST: Record<2 | 3 | 4, number> = {
  2: 1,
  3: 2,
  4: 3,
};
export const DAILY_FREE_PRACTICE_CAP = 2;
export const MAX_FREE_POLISH_TOKENS = 12;
export const KILN_PITY_STEP = 35;

export interface KilnPolishRecipe {
  targetTier: 2 | 3 | 4;
  hybridCoins: number;
  hybridSeals: number;
  sealOnlyCost: number;
  hybridLabelFa: string;
  hybridLabelEn: string;
  sealOnlyLabelFa: string;
  sealOnlyLabelEn: string;
}

export function getKilnPolishRecipe(targetTier: 2 | 3 | 4): KilnPolishRecipe {
  const hybridCoins = KILN_POLISH_COSTS[targetTier];
  const hybridSeals = KILN_POLISH_SEALS_REQUIRED[targetTier];
  const sealOnlyCost = KILN_POLISH_SEAL_ONLY_COST[targetTier];
  const faNum = (n: number) => n.toLocaleString('fa-IR');

  if (targetTier === 2) {
    return {
      targetTier,
      hybridCoins,
      hybridSeals,
      sealOnlyCost,
      hybridLabelFa: `صیقل به رده ۲ (فیروزه) با ${faNum(hybridCoins)} سکه`,
      hybridLabelEn: `Polish to Tier 2 for ${hybridCoins} Coins`,
      sealOnlyLabelFa: `صیقل رایگان با ۱ مُهر صیقل`,
      sealOnlyLabelEn: `Free Polish with 1 Seal`,
    };
  }
  if (targetTier === 3) {
    return {
      targetTier,
      hybridCoins,
      hybridSeals,
      sealOnlyCost,
      hybridLabelFa: `صیقل به رده ۳ (زرین): ${faNum(hybridSeals)} مُهر صیقل + ${faNum(hybridCoins)} سکه`,
      hybridLabelEn: `Polish to Tier 3: ${hybridSeals} Seal + ${hybridCoins} Coins`,
      sealOnlyLabelFa: `صیقل بدون سکه با ${faNum(sealOnlyCost)} مُهر صیقل`,
      sealOnlyLabelEn: `Coin-free Polish with ${sealOnlyCost} Seals`,
    };
  }
  return {
    targetTier,
    hybridCoins,
    hybridSeals,
    sealOnlyCost,
    hybridLabelFa: `صیقل زمرد شاهانه (رده ۴): ${faNum(hybridSeals)} مُهر صیقل + ${faNum(hybridCoins)} سکه`,
    hybridLabelEn: `Royal Emerald Polish (Tier 4): ${hybridSeals} Seals + ${hybridCoins} Coins`,
    sealOnlyLabelFa: `صیقل شاهانه بدون سکه با ${faNum(sealOnlyCost)} مُهر صیقل`,
    sealOnlyLabelEn: `Royal Polish with ${sealOnlyCost} Seals (0 Coins)`,
  };
}

/** Second-Chance Revive on Loss (فرصت دوم در لحظهٔ باخت) */
export const REVIVE_COST_COINS = 55;

export interface IapPackageDef {
  id: string;
  category: 'special' | 'coins';
  priceToman: number;
  coins: number;
  bonusPct?: number;
  items: {
    trophyShield?: number;
    trophyBoost?: number;
    streakShield?: number;
  };
  towerTickets: number;
  unlockAllBooks?: boolean;
  unlockSeasonPass?: boolean;
  unlockAvatar?: string;
  cosmetic?: string;
  oneTime: boolean;
  popular?: boolean;
  daysSaved: number;
  badgeFa?: string;
  badgeEn?: string;
  titleFa: string;
  titleEn: string;
  descFa: string;
  descEn: string;
}

export const IAP_PACKAGES: IapPackageDef[] = [
  {
    id: 'starter_clay_pack',
    category: 'special',
    priceToman: 29000,
    coins: 1200,
    items: { trophyShield: 1, streakShield: 1 },
    towerTickets: 3,
    cosmetic: 'frame_pahlavan',
    oneTime: true,
    daysSaved: 34,
    badgeFa: '۳۰۰٪ ارزش بیشتر (فقط یک‌بار)',
    badgeEn: '300% Value (One-Time)',
    titleFa: 'بسته آغازین پهلوان',
    titleEn: 'Hero Starter Pack',
    descFa: '۱,۲۰۰ سکه + ۳ بلیت برج + ۱ سپر تروفی + ۱ سپر زنجیره + قاب پهلوان',
    descEn: '1,200 Coins + 3 Tower Tickets + 1 Trophy Shield + 1 Streak Shield + Frame',
  },
  {
    id: 'epic_patron_pass',
    category: 'special',
    priceToman: 129000,
    coins: 1500,
    items: {},
    towerTickets: 0,
    unlockAllBooks: true,
    unlockAvatar: 'celeb_cyrus',
    cosmetic: 'title_hakim',
    oneTime: true,
    daysSaved: 420,
    badgeFa: 'بازگشایی دائمی همه کتاب‌ها',
    badgeEn: 'Unlock All Story Books',
    titleFa: 'طومار زرین شاهنامه و تاریخ',
    titleEn: 'Golden Scroll of Shahnameh',
    descFa: 'بازگشایی فوری تمام کتاب‌های حماسه، تاریخ و قصه‌ها + ۱,۵۰۰ سکه + تندیس کوروش + لقب حکیم طوس',
    descEn: 'Instantly unlock all Epic, History & Folklore books + 1,500 Coins + Cyrus Bust',
  },
  {
    id: 'season_battle_pass',
    category: 'special',
    priceToman: 89000,
    coins: 350,
    items: { streakShield: 1 },
    towerTickets: 2,
    unlockSeasonPass: true,
    cosmetic: 'frame_season_gold',
    oneTime: true,
    daysSaved: 185,
    badgeFa: 'بهترین ارزش ۳۰ روزه',
    badgeEn: 'Best 30-Day Value',
    titleFa: 'فصل‌نامه حماسی (طومار طلایی)',
    titleEn: 'Epic Season Battle Pass',
    descFa: 'مسیر طلایی ۳۰ سطحی (مجموعاً ۲,۸۰۰+ سکه و آیتم در طول فصل) + ۳۵۰ سکه فوری + قاب زرین فصل',
    descEn: '30-Tier Gold Pass (2,800+ Coins & Boosters across season) + 350 Instant Coins + Season Frame',
  },
  {
    id: 'bundle_tower_master',
    category: 'special',
    priceToman: 59000,
    coins: 600,
    items: { trophyShield: 3, trophyBoost: 3 },
    towerTickets: 8,
    oneTime: false,
    daysSaved: 55,
    badgeFa: 'ویژه فاتحان برج و لیگ',
    badgeEn: 'Tower & League Bundle',
    titleFa: 'بسته فاتحان برج و دوئل',
    titleEn: 'Tower & Duel Master Bundle',
    descFa: '۶۰۰ سکه + ۸ بلیت برج بی‌نهایت + ۳ سپر تروفی + ۳ تقویت تروفی',
    descEn: '600 Coins + 8 Tower Tickets + 3 Trophy Shields + 3 Trophy Boosts',
  },
  {
    id: 'coin_pouch_small',
    category: 'coins',
    priceToman: 39000,
    coins: 800,
    bonusPct: 0,
    items: {},
    towerTickets: 0,
    oneTime: false,
    daysSaved: 22,
    titleFa: 'کیسه سکه مسافر',
    titleEn: 'Traveler Coin Pouch',
    descFa: '۸۰۰ سکه خشتی خالص',
    descEn: '800 Clay Coins',
  },
  {
    id: 'coin_chest_medium',
    category: 'coins',
    priceToman: 79000,
    coins: 1900,
    bonusPct: 20,
    items: {},
    towerTickets: 2,
    oneTime: false,
    popular: true,
    daysSaved: 54,
    badgeFa: 'پرفروش‌ترین',
    badgeEn: 'Most Popular',
    titleFa: 'صندوقچه سکه بازرگان',
    titleEn: 'Merchant Coin Chest',
    descFa: '۱,۹۰۰ سکه (+۲۰٪ هدیه) + ۲ بلیت برج رایگان',
    descEn: '1,900 Coins (+20% Bonus) + 2 Tower Tickets',
  },
  {
    id: 'coin_treasury_large',
    category: 'coins',
    priceToman: 149000,
    coins: 4200,
    bonusPct: 40,
    items: { streakShield: 1, trophyBoost: 2 },
    towerTickets: 0,
    oneTime: false,
    daysSaved: 120,
    badgeFa: '+۴۰٪ سکه بیشتر',
    badgeEn: '+40% Extra Coins',
    titleFa: 'خزانه شاهوار',
    titleEn: 'Royal Treasury',
    descFa: '۴,۲۰۰ سکه (+۴۰٪ هدیه) + ۱ سپر زنجیره + ۲ تقویت تروفی',
    descEn: '4,200 Coins (+40% Bonus) + 1 Streak Shield + 2 Trophy Boosts',
  },
  {
    id: 'coin_vault_royal',
    category: 'coins',
    priceToman: 279000,
    coins: 9500,
    bonusPct: 70,
    items: { trophyShield: 5 },
    towerTickets: 5,
    cosmetic: 'title_treasurer',
    oneTime: false,
    daysSaved: 270,
    badgeFa: 'بیشترین صرفه اقتصادی (+۷۰٪)',
    badgeEn: 'Best Value (+70%)',
    titleFa: 'گنجینه جمشید',
    titleEn: 'Vault of Jamshid',
    descFa: '۹,۵۰۰ سکه (+۷۰٪ هدیه) + ۵ سپر تروفی + ۵ بلیت برج + لقب «خزانه‌دار شاهی»',
    descEn: '9,500 Coins (+70% Bonus) + 5 Shields + 5 Tickets + Royal Treasurer Title',
  },
];

export interface WheelWedgeDef {
  id: string;
  index: number;
  kind: 'coins' | 'ticket' | 'item' | 'jackpot';
  coins: number;
  tickets?: number;
  item?: 'streakShield' | 'trophyShield' | 'trophyBoost';
  count?: number;
  weight: number;
  labelFa: string;
  labelEn: string;
  tone: 'cream' | 'ochre' | 'sage' | 'clay' | 'dusty' | 'gold';
}

export const WHEEL_WEDGES: WheelWedgeDef[] = [
  { id: 'w_coins_15', index: 0, kind: 'coins', coins: 15, weight: 30, labelFa: '۱۵ سکه', labelEn: '15 Coins', tone: 'cream' },
  { id: 'w_coins_25', index: 1, kind: 'coins', coins: 25, weight: 25, labelFa: '۲۵ سکه', labelEn: '25 Coins', tone: 'ochre' },
  { id: 'w_coins_35', index: 2, kind: 'coins', coins: 35, weight: 18, labelFa: '۳۵ سکه (راهنما)', labelEn: '35 Coins', tone: 'sage' },
  { id: 'w_coins_45', index: 3, kind: 'coins', coins: 45, weight: 12, labelFa: '۴۵ سکه', labelEn: '45 Coins', tone: 'clay' },
  { id: 'w_ticket_1', index: 4, kind: 'ticket', tickets: 1, coins: 0, weight: 8, labelFa: '۱ بلیت برج', labelEn: '1 Tower Ticket', tone: 'dusty' },
  { id: 'w_coins_90', index: 5, kind: 'coins', coins: 90, weight: 4, labelFa: '۹۰ سکه (کلمه)', labelEn: '90 Coins', tone: 'ochre' },
  { id: 'w_shield_1', index: 6, kind: 'item', item: 'streakShield', count: 1, coins: 0, weight: 2, labelFa: 'سپر زنجیره', labelEn: 'Streak Shield', tone: 'sage' },
  { id: 'w_jackpot', index: 7, kind: 'jackpot', coins: 250, tickets: 1, weight: 1, labelFa: '۲۵۰ سکه + بلیت!', labelEn: '250 Coins + Ticket', tone: 'gold' },
];

export const FREE_BOOK_IDS = ['rostam_7', 'hushang', 'medes', 'persepolis', 'hassan_kachal', 'boz', 'kurosh'];

export function getBookUnlockCost(bookId: string, difficulty: 'easy' | 'medium' | 'hard' = 'medium'): number {
  if (FREE_BOOK_IDS.includes(bookId)) return 0;
  if (difficulty === 'easy') return 350;
  if (difficulty === 'hard') return 550;
  return 450;
}

export const FREE_AVATAR_IDS = ['clay_default', 'celeb_ferdowsi', 'player_messi', '👤'];

export function getAvatarUnlockCost(avatarId?: string | null): number {
  if (!avatarId || FREE_AVATAR_IDS.includes(avatarId)) return 0;
  if (
    avatarId === 'celeb_cyrus' ||
    avatarId === 'player_ronaldo' ||
    avatarId === 'player_pele' ||
    avatarId === 'player_maradona'
  ) {
    return 850;
  }
  return 600;
}

export const FREE_FOOTBALL_LEGEND_IDS = ['daei', 'maradona', 'zidane'];

export function getLegendUnlockCost(legendId: string): number {
  if (FREE_FOOTBALL_LEGEND_IDS.includes(legendId)) return 0;
  const modern = [
    'messi',
    'ronaldo',
    'modric',
    'salah',
    'lewandowski',
    'iniesta',
    'son',
    'vandijk',
    'kaka',
    'henry',
    'buffon',
    'ibrahimovic',
  ];
  if (modern.includes(legendId)) return 350;
  return 300;
}

export const SIZE_UNLOCK_COSTS: Record<GridSize, number> = {
  5: 0,
  6: 0,
  7: 250,
  8: 450,
  9: 750,
  10: 1200,
};

export const CATEGORY_UNLOCK_COSTS: Record<Category, number> = {
  shahnameh: 0,
  all: 0,
  general: 0,
  food: 0,
  cities: 250,
  movies: 250,
  nature: 250,
  sports: 250,
  knowledge: 350,
  body: 350,
  jobs: 350,
  history: 350,
  art: 350,
  tech: 450,
};
