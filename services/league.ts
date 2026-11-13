import { Category, LeagueId, PlayerLeague, PlayerState } from '../types';

// ==================== LEAGUE DEFINITIONS ====================

export interface LeagueTier {
  id: LeagueId;
  name: string;
  nameEn: string;
  icon: string;
  minTrophies: number;
  maxTrophies: number;
  minWager: number;
  color: string;
  rewardMultiplier: number;
}

export const LEAGUES: LeagueTier[] = [
  { id: 'bronze',  name: 'برنز III',  nameEn: 'Bronze III',  icon: '🥉', minTrophies: 0,    maxTrophies: 199,  minWager: 0,   color: '#cd7f32', rewardMultiplier: 1.0 },
  { id: 'bronze2', name: 'برنز II',   nameEn: 'Bronze II',   icon: '🥉', minTrophies: 200,  maxTrophies: 399,  minWager: 10,  color: '#cd7f32', rewardMultiplier: 1.1 },
  { id: 'bronze1', name: 'برنز I',    nameEn: 'Bronze I',    icon: '🥉', minTrophies: 400,  maxTrophies: 599,  minWager: 25,  color: '#cd7f32', rewardMultiplier: 1.2 },
  { id: 'silver',  name: 'نقره III',  nameEn: 'Silver III',  icon: '🥈', minTrophies: 600,  maxTrophies: 799,  minWager: 50,  color: '#c0c0c0', rewardMultiplier: 1.3 },
  { id: 'silver2', name: 'نقره II',   nameEn: 'Silver II',   icon: '🥈', minTrophies: 800,  maxTrophies: 999,  minWager: 75,  color: '#c0c0c0', rewardMultiplier: 1.4 },
  { id: 'silver1', name: 'نقره I',    nameEn: 'Silver I',    icon: '🥈', minTrophies: 1000, maxTrophies: 1249, minWager: 100, color: '#c0c0c0', rewardMultiplier: 1.5 },
  { id: 'gold',    name: 'طلا III',   nameEn: 'Gold III',    icon: '🥇', minTrophies: 1250, maxTrophies: 1499, minWager: 150, color: '#ffd700', rewardMultiplier: 1.7 },
  { id: 'gold2',   name: 'طلا II',    nameEn: 'Gold II',     icon: '🥇', minTrophies: 1500, maxTrophies: 1749, minWager: 200, color: '#ffd700', rewardMultiplier: 1.9 },
  { id: 'gold1',   name: 'طلا I',     nameEn: 'Gold I',      icon: '🥇', minTrophies: 1750, maxTrophies: 1999, minWager: 250, color: '#ffd700', rewardMultiplier: 2.1 },
  { id: 'crystal', name: 'کریستال III', nameEn: 'Crystal III', icon: '💎', minTrophies: 2000, maxTrophies: 2249, minWager: 350, color: '#e040fb', rewardMultiplier: 2.5 },
  { id: 'crystal2', name: 'کریستال II', nameEn: 'Crystal II',  icon: '💎', minTrophies: 2250, maxTrophies: 2499, minWager: 500, color: '#e040fb', rewardMultiplier: 3.0 },
  { id: 'crystal1', name: 'کریستال I',  nameEn: 'Crystal I',   icon: '💎', minTrophies: 2500, maxTrophies: 2749, minWager: 750, color: '#e040fb', rewardMultiplier: 3.5 },
  { id: 'diamond', name: 'الماس III', nameEn: 'Diamond III', icon: '👑', minTrophies: 2750, maxTrophies: 2999, minWager: 1000, color: '#00bcd4', rewardMultiplier: 4.0 },
  { id: 'diamond2', name: 'الماس II',  nameEn: 'Diamond II',  icon: '👑', minTrophies: 3000, maxTrophies: 3399, minWager: 1500, color: '#00bcd4', rewardMultiplier: 5.0 },
  { id: 'diamond1', name: 'الماس I',   nameEn: 'Diamond I',   icon: '👑', minTrophies: 3400, maxTrophies: 3999, minWager: 2000, color: '#00bcd4', rewardMultiplier: 6.0 },
  { id: 'legendary', name: 'افسانه‌ای', nameEn: 'Legendary',  icon: '🔥', minTrophies: 4000, maxTrophies: 9999, minWager: 3000, color: '#ff1744', rewardMultiplier: 8.0 },
];

// ==================== LEAGUE FUNCTIONS ====================

export function getLeague(trophies: number): LeagueTier {
  for (let i = LEAGUES.length - 1; i >= 0; i--) {
    if (trophies >= LEAGUES[i].minTrophies) return LEAGUES[i];
  }
  return LEAGUES[0];
}

export function calcTrophyChange(myTrophies: number, opponentTrophies: number, won: boolean): number {
  const diff = opponentTrophies - myTrophies;
  // Higher-rated opponent: win = more trophies, lose = fewer trophies lost
  // Lower-rated opponent: win = fewer trophies, lose = more trophies lost
  if (won) {
    const base = 20 + Math.floor(diff / 200);
    return Math.max(1, Math.min(40, base));
  } else {
    const base = 15 - Math.floor(diff / 200);
    return -Math.max(1, Math.min(40, base));
  }
}

export function initLeague(): PlayerLeague {
  return {
    trophies: 0,
    league: 'bronze',
    highestLeague: 'bronze',
    winStreak: 0,
    totalWins: 0,
    totalLosses: 0,
  };
}

export function applyTrophyChange(league: PlayerLeague, change: number, won: boolean): PlayerLeague {
  const newTrophies = Math.max(0, league.trophies + change);
  const highestTier = LEAGUES.find(l => l.id === league.highestLeague) ?? LEAGUES[0];
  const newHighest = change > 0 && newTrophies > highestTier.minTrophies
    ? getLeague(newTrophies).id
    : league.highestLeague;
  return {
    trophies: newTrophies,
    league: getLeague(newTrophies).id,
    highestLeague: newHighest,
    winStreak: won ? league.winStreak + 1 : 0,
    totalWins: league.totalWins + (won ? 1 : 0),
    totalLosses: league.totalLosses + (won ? 0 : 1),
  };
}

export function getLeagueName(leagueId: LeagueId, language: 'fa' | 'en'): string {
  const tier = LEAGUES.find(l => l.id === leagueId);
  if (!tier) return language === 'fa' ? 'برنز III' : 'Bronze III';
  return language === 'fa' ? tier.name : tier.nameEn;
}

export function getLeagueProgress(trophies: number): { current: LeagueTier; next: LeagueTier | null; progress: number } {
  const current = getLeague(trophies);
  const currentIdx = LEAGUES.indexOf(current);
  const next = currentIdx < LEAGUES.length - 1 ? LEAGUES[currentIdx + 1] : null;
  const range = next ? next.minTrophies - current.minTrophies : 1;
  const pos = trophies - current.minTrophies;
  const progress = next ? Math.min(100, Math.floor((pos / range) * 100)) : 100;
  return { current, next, progress };
}

// League-based size ranges — higher league = bigger grids
const LEAGUE_SIZE_RANGES: Record<string, [number, number]> = {
  bronze: [5, 6],
  bronze2: [5, 6],
  bronze1: [5, 6],
  silver: [6, 7],
  silver2: [6, 7],
  silver1: [6, 7],
  gold: [7, 8],
  gold2: [7, 8],
  gold1: [7, 8],
  crystal: [7, 9],
  crystal2: [7, 9],
  crystal1: [7, 9],
  diamond: [8, 10],
  diamond2: [8, 10],
  diamond1: [8, 10],
  legendary: [9, 10],
};

// League-based unlocked categories — higher league = more variety
const LEAGUE_CATEGORIES: Record<string, Category[]> = {
  bronze: ['knowledge'],
  bronze2: ['knowledge'],
  bronze1: ['knowledge'],
  silver: ['knowledge', 'movies', 'food'],
  silver2: ['knowledge', 'movies', 'food'],
  silver1: ['knowledge', 'movies', 'food'],
  gold: ['knowledge', 'movies', 'food', 'cities', 'body', 'jobs'],
  gold2: ['knowledge', 'movies', 'food', 'cities', 'body', 'jobs'],
  gold1: ['knowledge', 'movies', 'food', 'cities', 'body', 'jobs'],
  crystal: ['knowledge', 'movies', 'food', 'cities', 'body', 'jobs', 'tech', 'nature'],
  crystal2: ['knowledge', 'movies', 'food', 'cities', 'body', 'jobs', 'tech', 'nature'],
  crystal1: ['knowledge', 'movies', 'food', 'cities', 'body', 'jobs', 'tech', 'nature'],
  diamond: ['knowledge', 'movies', 'food', 'cities', 'body', 'jobs', 'tech', 'nature', 'history', 'sports'],
  diamond2: ['knowledge', 'movies', 'food', 'cities', 'body', 'jobs', 'tech', 'nature', 'history', 'sports'],
  diamond1: ['knowledge', 'movies', 'food', 'cities', 'body', 'jobs', 'tech', 'nature', 'history', 'sports'],
  legendary: ['knowledge', 'movies', 'food', 'cities', 'body', 'jobs', 'tech', 'nature', 'history', 'sports', 'art', 'all'],
};

export function getLeagueSizeRange(leagueId: LeagueId): [number, number] {
  return LEAGUE_SIZE_RANGES[leagueId] || [5, 6];
}

export function getLeagueCategories(leagueId: LeagueId): Category[] {
  return LEAGUE_CATEGORIES[leagueId] || ['knowledge'];
}
