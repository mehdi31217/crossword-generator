
export type Cell = {
  row: number;
  col: number;
  value: string; 
  isBlack: boolean;
  clueNumber?: number;
};

export type Grid = Cell[][];
export type GridSize = 5 | 6 | 7 | 8 | 9 | 10;
export type WordDirection = 'across' | 'down';
// Add missing Language type export
export type Language = 'fa' | 'en';
export type Category = 'general' | 'movies' | 'cities' | 'knowledge' | 'food' | 'body' | 'jobs' | 'tech' | 'nature' | 'shahnameh' | 'history' | 'sports' | 'art' | 'all';
export type LoadingStage = 'idle' | 'loading_dict' | 'generating_ai' | 'constructing' | 'finalizing';

export type Slot = {
  direction: WordDirection;
  row: number;
  col: number;
  length: number;
  cells: { r: number; c: number }[];
};

export type DictionaryEntry = {
  word: string;
  clue: string;
  category?: string;
  language?: string;
  length?: number;
  id?: number;
  created_at?: string;
};

export type Clue = {
  number: number;
  word: string;
  translation: string;
  direction: WordDirection;
  cells: { r: number; c: number }[];
  isStory?: boolean;
};

/** Snapshot of a finished board, stored with an async duel so it can be replayed. */
export type DuelBoard = {
  grid: Grid;
  clues: Clue[];
};

export type DuelResult = {
  score: number;
  seconds: number;
  solved: number;
  total: number;
  completed: boolean;
  /** Letters placed by the player's own keystrokes — what the verdict rewards. */
  typed?: number;
  mistakes?: number;
  /** Letters that arrived from a power-up or a paid hint instead of typing. */
  assisted?: number;
};

export type AsyncDuelStatus = 'open' | 'playing' | 'completed' | 'expired';

/** One friend's invitation to replay an arena, as the creator sees it. */
export type DuelInviteView = {
  id: string;
  opponent_id: string;
  opponent_name: string;
  opponent_avatar: string;
  status: AsyncDuelStatus;
  /** The friend's verdict score once they played; null until then. */
  points: number | null;
  /** Verdict from the creator's side: 'creator' means you still lead. */
  outcome: 'creator' | 'opponent' | 'draw' | null;
  completed_at: string;
};

/**
 * A finished game of mine, posted so friends can try to beat it. The arena
 * exists before anyone is invited, and its records survive both closing and
 * expiry — only an arena with no result at all can be deleted.
 */
export type DuelArena = {
  id: string;
  category: Category;
  language: Language;
  size: number;
  closed: boolean;
  expired: boolean;
  created_at: string;
  creator_points: number;
  can_delete: boolean;
  can_invite: boolean;
  invite_slots_left: number;
  invites: DuelInviteView[];
};

/** Flattened invite + arena: what the challenger replays and settles. */
export type AsyncDuel = {
  id: string;
  arena_id?: string;
  creator_id: string;
  creator_name: string;
  creator_avatar: string;
  opponent_id: string;
  opponent_name: string;
  opponent_avatar: string;
  category: Category;
  language: Language;
  size: number;
  // Only present on the accept response — lists never ship the board.
  board?: DuelBoard | null;
  creator_result: DuelResult;
  opponent_result: DuelResult | null;
  /** Verdict numbers computed by the server from typed letters, time and help. */
  creator_points?: number;
  opponent_points?: number | null;
  status: AsyncDuelStatus;
  created_at: string;
  completed_at: string;
};

/** The last finished solo board, kept so it can become an async duel. */
export type LastPlayedBoard = {
  board: DuelBoard;
  category: Category;
  language: Language;
  size: number;
  result: DuelResult;
  at: number;
};

/** What the duel screen shows right after the challenger finishes a replay. */
export type DuelOutcome = {
  duel: AsyncDuel;
  outcome: 'win' | 'loss' | 'draw';
  coins?: number | null;
  /** Coins earned by this duel (`coins` is the resulting balance). */
  reward?: number | null;
};

export type MatchRecord = {
  id: string;
  date: string;
  score: number;
  time: number;
  size: number;
  category: Category;
  // Set ONLY by the daily-puzzle run. It cannot be inferred from the record:
  // the daily is `all` @ 10x10, but `all` is also the ordinary «میکس» (Mixed)
  // category, so a casual 10x10 mix game looks identical — and used to lock the
  // daily puzzle for the rest of the day.
  isDaily?: boolean;
};

export type LeagueId = 'bronze' | 'bronze2' | 'bronze1' | 'silver' | 'silver2' | 'silver1' | 'gold' | 'gold2' | 'gold1' | 'crystal' | 'crystal2' | 'crystal1' | 'diamond' | 'diamond2' | 'diamond1' | 'legendary';

export type PlayerLeague = {
  trophies: number;
  league: LeagueId;
  highestLeague: LeagueId;
  winStreak: number;
  totalWins: number;
  totalLosses: number;
};

export type PlayerState = {
  id: string;
  name: string;
  avatar: string;
  friendCode: string;
  coins: number;
  score: number;
  level: number;
  highScore: number;
  history: MatchRecord[];
  isOnline: boolean;
  lastDailyDate?: string;
  // Separate from `lastDailyDate` on purpose. The daily lock is taken when the run
  // STARTS (POST /api/daily/start), so "played today" no longer implies "paid
  // today" — a player who opens the daily and abandons it has used the day and
  // earned nothing, and the card must be able to tell those apart.
  lastDailyRewardDate?: string;
  isAdmin?: boolean;
  epicProgress: Record<string, number>;
  epicStars: Record<string, number>;
  cardProgress: Record<string, { stars: number }>;
  // Collectible world-map cards — `{ [chapterId]: 1..4 }`. Mirrored in
  // `profiles.worldmap_cards` so the collection belongs to the account, not to
  // one browser's localStorage.
  worldmapCards?: Record<string, WorldMapCardRarity>;
  // --- TOWER MODE STATS ---
  towerTickets: number;
  lastTicketRefill: string | null; // ISO Date string
  dailyTowerCoins: number;
  towerHighFloor: number;
  // --- LEAGUE ---
  league: PlayerLeague;
  // --- THEME ---
  theme?: 'light' | 'dark';
  // --- SHOP ITEMS ---
  items: {
    trophyShield: number;
    trophyBoost: number;
    /** Keeps a daily streak alive across one missed day (server-owned). */
    streakShield?: number;
  };
};

export type GameView = 'menu' | 'playing' | 'leaderboard' | 'profile' | 'lobby' | 'social' | 'epic_library' | 'epic_chapters' | 'tower_lobby' | 'cards' | 'collection' | 'world_map' | 'world_map_chapters' | 'duel';

// Backwards-compatible alias (several hooks import `ViewType`).
export type ViewType = GameView;

export interface WorldMapLegend {
  id: string;
  name: { fa: string; en: string };
  nickname: { fa: string; en: string };
  country: { fa: string; en: string };
  countryCode: string;
  countryX: number;
  countryY: number;
  icon: string;
  color: string;
  chapters: WorldMapChapter[];
}

export interface WorldMapChapter {
  id: string;
  legendId: string;
  chapterIndex: number;
  title: { fa: string; en: string };
  subtitle: { fa: string; en: string };
  story: { fa: string; en: string };
  victoryText: { fa: string; en: string };
  year: string;
  words: { word: string; clue: string }[];
  bgEmoji: string;
  bgImage?: string;
}

export type WorldMapCardRarity = 1 | 2 | 3 | 4;

export function calcWorldMapStars(matchScore: number, finalSeconds: number, wordCount: number): WorldMapCardRarity {
  const fast = finalSeconds <= wordCount * 12;
  const goodScore = matchScore >= wordCount * 90;
  if (goodScore && fast) return 4;
  if (goodScore) return 3;
  if (fast) return 2;
  return 1;
}

export const WORLD_MAP_RARITY: Record<WorldMapCardRarity, {
  fa: string;
  en: string;
  badgeFa: string;
  color: string;
  border: string;
  clayTone: string;
  descriptionFa: string;
}> = {
  1: {
    fa: 'خشت سفالین',
    en: 'Earthen Clay',
    badgeFa: 'خشت خام',
    color: '#B46644',
    border: '#B4664488',
    clayTone: 'terracotta',
    descriptionFa: 'پخته‌شده در کوره سفالگری کهن',
  },
  2: {
    fa: 'خشت لعابدار فیروزه',
    en: 'Turquoise Glaze',
    badgeFa: 'لعاب فیروزه',
    color: '#26A69A',
    border: '#26A69A88',
    clayTone: 'turquoise',
    descriptionFa: 'آراسته به لعاب فیروزه‌ای کاخ‌های باستانی',
  },
  3: {
    fa: 'کتیبه زرین هخامنشی',
    en: 'Imperial Gold Clay',
    badgeFa: 'کتیبه زرین',
    color: '#D89E34',
    border: '#D89E3499',
    clayTone: 'gold',
    descriptionFa: 'نقش‌برجسته کتیبه زرین با خط میخی شاهنشاهی',
  },
  4: {
    fa: 'قاب زمردیِ شاهانه',
    en: 'Royal Emerald & Gold',
    badgeFa: 'زمردِ شاهانه',
    color: '#129666',
    border: '#12966699',
    clayTone: 'emerald',
    descriptionFa: 'مینای زمرد سلطنتی با طلاکوبی برجستهٔ بال‌های هما و طوق ساسانی',
  },
};

export type CardCategory = 'football_iran' | 'football_world' | 'iran_ancient' | 'iran_history';

export interface CardDef {
  id: string;
  category: CardCategory;
  title: string;
  subtitle: string;
  difficulty: 1 | 2 | 3;
  words: { word: string; clue: string }[];
  icon: string;
  storyImage?: string;
}

export const CARD_CATEGORIES: { id: CardCategory; labelFa: string; labelEn: string; icon: string }[] = [
  { id: 'football_iran', labelFa: 'فوتبال ایران', labelEn: 'Iran Football', icon: '⚽' },
  { id: 'football_world', labelFa: 'فوتبال جهان', labelEn: 'World Football', icon: '🌍' },
  { id: 'iran_ancient', labelFa: 'ایران باستان', labelEn: 'Ancient Iran', icon: '🏛️' },
  { id: 'iran_history', labelFa: 'تاریخ ایران', labelEn: 'Iran History', icon: '📜' },
];

export type MultiPlayerInfo = {
  id: string;
  name: string;
  avatar: string;
  progress: number;
  score: number;
  isHost: boolean;
  category?: Category;
  size?: GridSize;
  trophies?: number;
};

export type GameMode = 'speed' | 'battle' | 'casual' | 'multiplayer' | 'tower' | 'story';

export type AttackType = 'erase' | 'blind' | 'freeze';

export type SocialNotification = {
  id: string;
  type: 'friend_req' | 'challenge' | 'challenge_declined' | 'message' | 'duel' | 'duel_result';
  senderId: string;
  senderName: string;
  payload?: any;
  createdAt: string;
};

export type Friend = {
  id: string;
  friendId: string;
  name: string;
  avatar: string;
  status: 'pending' | 'accepted';
  isOnline?: boolean;
};

export type ChatMessage = {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  isMine: boolean;
  read?: boolean;
};

export type ShahnamehChapter = {
    id: number;
    title: string;
    description: string;
    image: string;
    victoryText: string;
    words: DictionaryEntry[];
    monsterName?: string; // Optional: Override monster name
    monsterAvatar?: string; // Optional: Override monster avatar
    created_at?: string; // Present in seeded story data
};

export type StoryGenre = 'epic' | 'folklore' | 'education' | 'history';

export type StoryStyle = {
    primaryColor: string; 
    secondaryColor: string; 
    backgroundColor: string; 
    textColor: string; 
    fontFamily: string; 
    backgroundImagePattern?: string; 
};

export type StoryBook = {
    id: string;
    genre: StoryGenre;
    title: string;
    author: string;
    description: string;
    coverImage: string;
    style: StoryStyle;
    difficulty: 'easy' | 'medium' | 'hard';
    chapters: ShahnamehChapter[];
    requiredStars?: number; // Minimum total stars to unlock this book
};

// ============================================
// TOWER MODE V2 - Advanced Types
// ============================================

export type TowerFloorType = 'normal' | 'boss';

export type TowerHazardType = 'freeze' | 'blind' | 'scramble';

export type TowerShopItem = {
    id: string;
    name: string;
    nameEn: string;
    description: string;
    descriptionEn: string;
    cost: number;
    icon: string;
    effect: 'extra_life' | 'time_boost' | 'shield' | 'hazard_immunity';
};

export type TowerRunState = {
    floor: number;
    lives: number;
    maxLives: number;
    loot: number;
    isActive: boolean;
    mistakes: number; // Track mistakes in current floor
    timeBonus: number; // Extra seconds for current floor
    hasShield: boolean; // Next mistake is free
    hasHazardImmunity: boolean; // Immune to hazards for current floor
    comboMultiplier: number; // Bonus multiplier for no-mistake floors
};

export type TowerFloorConfig = {
    floor: number;
    type: TowerFloorType;
    gridSize: GridSize;
    timeLimit: number | null; // null = no time limit
    hazardChance: number; // 0-1
    baseReward: number;
    bossName?: string;
    bossAvatar?: string;
};