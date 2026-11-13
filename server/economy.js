/**
 * Coin economy — every faucet, sink, IAP SKU, and probability table in one place.
 *
 * Mirror: utils/economy.ts (client display). Change one, change the other.
 *
 * Economy Rebalance (2026-11):
 * - Daily free coin faucets tightened from ~850/day to ~95–140/day so coins hold
 *   genuine scarcity and value.
 * - Consumable prices, grid sizes, categories, story books, and sculpted clay
 *   avatars act as layered short/mid/long-term sinks (~48,200+ coins of progression).
 * - 8 non-P2W IAP packages priced for the Iranian market (29,000 to 279,000 Tomans)
 *   with a +15% direct-web gateway bonus.
 */

const INITIAL_COINS = 120;

const DAILY_PUZZLE_REWARD = parseInt(process.env.DAILY_PUZZLE_REWARD || '35', 10);

const DAILY_TOWER_COIN_CAP = 90;
const TOWER_MAX_RUN_COINS = 2500;

const COIN_PRICES = {
  hint_letter: 35,
  hint_word: 90,
  shop_trophyShield: 150,
  shop_trophyBoost: 120,
  shop_streakShield: 120,
  shop_towerTicket: 65,
  wheel_extra_spin: 80,
};

const SHOP_ITEM_GRANTS = {
  shop_trophyShield: 'trophyShield',
  shop_trophyBoost: 'trophyBoost',
  shop_streakShield: 'streakShield',
};

const LEAGUE_WIN_REWARD = 10;
const LEAGUE_DAILY_WIN_CAP = 50;

const WIN_STREAK_BONUS = { every: 3, coins: 12, dailyCap: 36 };

const DUEL_COINS = { win: 10, draw: 4, loss: 2 };

const REWARDED_AD_COINS = 25;
const REWARDED_AD_DAILY_CAP = 3;

const WEB_DIRECT_BONUS_RATE = 0.15; // +15% extra coins on direct website gateway

/**
 * Official In-App Purchase (IAP) Catalog — Server Authoritative
 * Prices are in Tomans (تومان).
 */
const IAP_PACKAGES = [
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

const IAP_BY_ID = Object.fromEntries(IAP_PACKAGES.map((p) => [p.id, p]));

/**
 * 8-Wedge Daily Fortune Wheel — Expected Value (EV) = 36.80 Coins
 * Extra paid spin costs 80 coins (anti-inflationary house edge = 54%).
 */
const WHEEL_WEDGES = [
  { id: 'w_coins_15', index: 0, kind: 'coins', coins: 15, weight: 30, labelFa: '۱۵ سکه', labelEn: '15 Coins', tone: 'cream' },
  { id: 'w_coins_25', index: 1, kind: 'coins', coins: 25, weight: 25, labelFa: '۲۵ سکه', labelEn: '25 Coins', tone: 'ochre' },
  { id: 'w_coins_35', index: 2, kind: 'coins', coins: 35, weight: 18, labelFa: '۳۵ سکه (راهنما)', labelEn: '35 Coins', tone: 'sage' },
  { id: 'w_coins_45', index: 3, kind: 'coins', coins: 45, weight: 12, labelFa: '۴۵ سکه', labelEn: '45 Coins', tone: 'clay' },
  { id: 'w_ticket_1', index: 4, kind: 'ticket', tickets: 1, coins: 0, weight: 8, labelFa: '۱ بلیت برج', labelEn: '1 Tower Ticket', tone: 'dusty' },
  { id: 'w_coins_90', index: 5, kind: 'coins', coins: 90, weight: 4, labelFa: '۹۰ سکه (کلمه)', labelEn: '90 Coins', tone: 'ochre' },
  { id: 'w_shield_1', index: 6, kind: 'item', item: 'streakShield', count: 1, coins: 0, weight: 2, labelFa: 'سپر زنجیره', labelEn: 'Streak Shield', tone: 'sage' },
  { id: 'w_jackpot', index: 7, kind: 'jackpot', coins: 250, tickets: 1, weight: 1, labelFa: '۲۵۰ سکه + بلیت!', labelEn: '250 Coins + Ticket', tone: 'gold' },
];

const FREE_BOOK_IDS = ['rostam_7', 'hushang', 'medes', 'persepolis', 'hassan_kachal', 'boz', 'kurosh'];

function getBookUnlockCost(bookId, difficulty = 'medium') {
  if (FREE_BOOK_IDS.includes(bookId)) return 0;
  if (difficulty === 'easy') return 350;
  if (difficulty === 'hard') return 550;
  return 450;
}

const FREE_AVATAR_IDS = ['clay_default', 'celeb_ferdowsi', 'player_messi', '👤'];

function getAvatarUnlockCost(avatarId) {
  if (!avatarId || FREE_AVATAR_IDS.includes(avatarId)) return 0;
  if (avatarId === 'celeb_cyrus' || avatarId === 'player_ronaldo' || avatarId === 'player_pele' || avatarId === 'player_maradona') {
    return 850;
  }
  return 600;
}

const FREE_FOOTBALL_LEGEND_IDS = ['daei', 'maradona', 'zidane'];

function getLegendUnlockCost(legendId) {
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

const SIZE_UNLOCK_COSTS = {
  5: 0,
  6: 0,
  7: 250,
  8: 450,
  9: 750,
  10: 1200,
};

const CATEGORY_UNLOCK_COSTS = {
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

const KILN_POLISH_COSTS = {
  2: 60,
  3: 120,
  4: 220,
};

const KILN_POLISH_SEALS_REQUIRED = {
  2: 0,
  3: 1,
  4: 2,
};

const KILN_POLISH_SEAL_ONLY_COST = {
  2: 1,
  3: 2,
  4: 3,
};

const MAX_FREE_POLISH_TOKENS = 12;

module.exports = {
  INITIAL_COINS,
  DAILY_PUZZLE_REWARD,
  DAILY_TOWER_COIN_CAP,
  TOWER_MAX_RUN_COINS,
  COIN_PRICES,
  SHOP_ITEM_GRANTS,
  LEAGUE_WIN_REWARD,
  LEAGUE_DAILY_WIN_CAP,
  WIN_STREAK_BONUS,
  DUEL_COINS,
  REWARDED_AD_COINS,
  REWARDED_AD_DAILY_CAP,
  WEB_DIRECT_BONUS_RATE,
  IAP_PACKAGES,
  IAP_BY_ID,
  WHEEL_WEDGES,
  FREE_BOOK_IDS,
  getBookUnlockCost,
  FREE_AVATAR_IDS,
  getAvatarUnlockCost,
  FREE_FOOTBALL_LEGEND_IDS,
  getLegendUnlockCost,
  SIZE_UNLOCK_COSTS,
  CATEGORY_UNLOCK_COSTS,
  KILN_POLISH_COSTS,
  KILN_POLISH_SEALS_REQUIRED,
  KILN_POLISH_SEAL_ONLY_COST,
  MAX_FREE_POLISH_TOKENS,
};
