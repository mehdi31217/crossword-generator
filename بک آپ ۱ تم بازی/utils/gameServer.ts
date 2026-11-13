import { PlayerState, MatchRecord, DictionaryEntry, Category, Language, Friend, GridSize, GameMode, PlayerLeague, LeagueId, AsyncDuel, DuelArena, DuelBoard, DuelResult } from '../types';
import { api, getToken, setToken, clearToken, shuffleArray } from '../api/client';
import { supabase } from '../net/LocalChannel';
import { initLeague } from '../services/league';
import { debug } from './debug';
import { API_BASE, WS_URL } from './config';
import { EPIC_CAMPAIGNS } from '../data/campaigns';
import { FOLKTALE_BOOKS } from '../data/folktales/folktalesIndex';
import type { ProgressGrant, ProgressSnapshot, QuestDayView, CosmeticsView, EconomyStateView, SeasonPassRewardDef } from './progression';
import { SEASON_PASS_TIERS } from './progression';
import {
  INITIAL_COINS,
  IAP_PACKAGES,
  WHEEL_WEDGES,
  WEB_DIRECT_BONUS_RATE,
  REWARDED_AD_COINS,
  REWARDED_AD_DAILY_CAP,
  PIGGY_BANK_PER_WORD,
  PIGGY_BANK_HALF_THRESHOLD,
  PIGGY_BANK_MAX_CAP,
  KILN_POLISH_COSTS,
  DAILY_FREE_PRACTICE_CAP,
  MAX_FREE_POLISH_TOKENS,
  KILN_PITY_STEP,
  REVIVE_COST_COINS,
  FREE_BOOK_IDS,
  FREE_AVATAR_IDS,
  FREE_FOOTBALL_LEGEND_IDS,
  getBookUnlockCost,
  getAvatarUnlockCost,
  getLegendUnlockCost,
  SIZE_UNLOCK_COSTS,
  CATEGORY_UNLOCK_COSTS,
  SHOP_PRICES,
  type WheelWedgeDef,
} from './economy';

// Re-export everything from the extracted modules
export { api, getToken, setToken, clearToken, shuffleArray, supabase };

export type AuthResult = {
  success: boolean;
  player?: PlayerState;
  message?: string;
};

/**
 * Server-priced purchases. The client names the item; the price lives on the
 * server (`COIN_PRICES` in server/index.js) so it can never be chosen by the
 * caller. Keep these two lists in sync.
 */
export type CoinReason =
  | 'hint_letter'
  | 'hint_word'
  | 'shop_trophyShield'
  | 'shop_trophyBoost'
  | 'shop_towerTicket'
  | 'shop_streakShield';

export type SpendResult =
  | { status: 'ok'; coins: number; items?: { trophyShield?: number; trophyBoost?: number; streakShield?: number }; towerTickets?: number }
  | { status: 'insufficient' }
  | { status: 'at_cap' }
  | { status: 'error' };

/**
 * The league block the server returns from `/match` and `/league/result`.
 * The server owns trophies — see `server/league.js`.
 */
export interface ServerLeague {
  trophies: number;
  league: string;
  highestLeague: string;
  winStreak: number;
  totalWins: number;
  totalLosses: number;
}

/** Adopt a server-computed league block over the local copy (server wins). */
function mergeServerLeague(local: PlayerLeague, s: ServerLeague): PlayerLeague {
  return {
    ...local,
    trophies: typeof s.trophies === 'number' ? s.trophies : local.trophies,
    league: (s.league as LeagueId) || local.league,
    highestLeague: (s.highestLeague as LeagueId) || local.highestLeague,
    winStreak: typeof s.winStreak === 'number' ? s.winStreak : local.winStreak,
    totalWins: typeof s.totalWins === 'number' ? s.totalWins : local.totalWins,
    totalLosses: typeof s.totalLosses === 'number' ? s.totalLosses : local.totalLosses,
  };
}

const ADMIN_PHONE = '09385019630';

const DEFAULT_STATE: PlayerState = {
  id: 'guest',
  name: 'مهمان',
  avatar: '👤',
  friendCode: 'GUEST',
  coins: INITIAL_COINS,
  score: 0,
  level: 1,
  highScore: 0,
  history: [],
  isOnline: true,
  isAdmin: false,
  epicProgress: { rostam_7: 1 },
  epicStars: {},
  cardProgress: {},
  worldmapCards: {},
  towerTickets: 1,
  lastTicketRefill: new Date().toISOString(),
  dailyTowerCoins: 0,
  towerHighFloor: 0,
  league: initLeague(),
  items: { trophyShield: 0, trophyBoost: 0, streakShield: 0 },
};

function getTodayString() {
  return new Date().toLocaleDateString('en-CA');
}

/**
 * Level-ups the server awarded while the player was inside a game. The menu
 * pulls them on mount so the chest is celebrated somewhere visible — the win
 * screen is owned by gameplay and has no business showing progression chrome.
 */
export interface LevelUpEvent { level: number; chestCoins: number }
let pendingLevelUps: LevelUpEvent[] = [];

/**
 * Win-streak bonuses the server paid while the player was inside a game. The
 * menu drains them for the same reason as level-ups: the board has no business
 * showing progression chrome, and `win_streak` is settled server-side on both
 * the casual and the ranked path.
 */
export interface StreakBonusEvent { streak: number; coins: number }
let pendingStreakBonuses: StreakBonusEvent[] = [];

export const gameServer = {
  getApiUrl() { return API_BASE.replace('/api', ''); },
  getWsUrl() { return WS_URL; },

  /** Drain level-ups reported by the last gameplay settlement. */
  takeLevelUps(): LevelUpEvent[] {
    const out = pendingLevelUps;
    pendingLevelUps = [];
    return out;
  },

  /** Adopt a server progress grant: level, chest toast queue, quest counters. */
  recordProgress(grant: ProgressGrant | null | undefined): void {
    if (!grant) return;
    if (grant.levelUp) pendingLevelUps.push({ level: grant.level, chestCoins: grant.chestCoins || 0 });
  },

  /** Drain win-streak bonuses reported by the last gameplay settlement. */
  takeStreakBonuses(): StreakBonusEvent[] {
    const out = pendingStreakBonuses;
    pendingStreakBonuses = [];
    return out;
  },

  async getPlayerState(): Promise<PlayerState> {
    const stored = localStorage.getItem('player_state');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.id && parsed.id !== 'guest') {
          try {
            // Prefer the existing session token (this also works for accounts
            // that have a password, which cannot be re-authenticated by
            // deviceId alone). Fall back to deviceId login, which also
            // refreshes an expired token for password-less accounts.
            let profileData: any = null;
            if (getToken()) {
              try { profileData = await api('/me'); } catch (e) { profileData = null; }
            }
            if (!profileData) {
              const loginResult = await api('/login', {
                method: 'POST',
                body: JSON.stringify({ deviceId: parsed.id }),
              });
              if (loginResult?.token) setToken(loginResult.token);
              profileData = loginResult?.player || loginResult;
            }
            const serverState = this.mapProfileToState(profileData);
            // Always prefer local data over server — server may have stale/zero values
            serverState.name = parsed.name || serverState.name;
            serverState.avatar = parsed.avatar || serverState.avatar;
            serverState.score = Math.max(parsed.score || 0, serverState.score || 0);
            serverState.highScore = Math.max(parsed.highScore || 0, serverState.highScore || 0);
            // Coins are a server-owned currency: arena escrow/settle, shop spend
            // and the daily reward all write them through db.addCoins and hand the
            // new balance back. This used to be Math.max(local, server), which let
            // ANY locally inflated value — a stale guest balance, a hand-edited
            // localStorage, or the old register-time merge — outlive the server's
            // real number on every reload. Verified: with the server reporting 250
            // coins, a local 9999 rendered as ۹۹۹۹. The server's value wins; the
            // cached one is only a fallback when the profile carried no balance.
            serverState.coins = serverState.coins ?? parsed.coins ?? 0;
            serverState.level = Math.max(parsed.level || 1, serverState.level || 1);
            // League/rating is SERVER-owned — take the server's numbers outright.
            // This used to be Math.max(local, server), which let a locally inflated
            // trophy count survive a reload. (The server's value was always 0 back
            // then anyway, because no server code ever wrote the column.)
            // `items` is likewise server-owned now (mapProfileToState already took
            // it from the server), so the local copy is only a cache.
            // Tower tickets are a PAID consumable, so the server owns the count.
            // This used to be Math.max(local, server), which let a hand-edited
            // localStorage value (or any client-side grant) survive every reload.
            serverState.towerTickets = serverState.towerTickets ?? 1;
            serverState.towerHighFloor = Math.max(parsed.towerHighFloor || 0, serverState.towerHighFloor || 0);
            // The daily-puzzle lock is a DATE, not a number, so it has to be carried
            // over explicitly — `Math.max` is meaningless for it, and the old merge
            // simply dropped it. `lastDailyDate` therefore fell back to the server's
            // empty default on every reload and the "انجام شد" lock released itself.
            // The server now writes `last_daily_date` from POST /api/match; the
            // cached value stays as a migration fallback for a play that was
            // recorded before the server persisted it.
            serverState.lastDailyDate = serverState.lastDailyDate || parsed.lastDailyDate;
            // Same reason as above — a date, so it needs explicit carry-over or the
            // chip would forget that today's prize was already paid.
            serverState.lastDailyRewardDate = serverState.lastDailyRewardDate || parsed.lastDailyRewardDate;
            // Keep local history (richer than server's)
            if (parsed.history && parsed.history.length > (serverState.history?.length || 0)) {
              serverState.history = parsed.history;
            }
            if (parsed.epicProgress && typeof parsed.epicProgress === 'object') {
              for (const [bookId, level] of Object.entries(parsed.epicProgress)) {
                if (!serverState.epicProgress[bookId] || serverState.epicProgress[bookId] < (level as number)) {
                  serverState.epicProgress[bookId] = level as number;
                }
              }
            }
            if (parsed.epicStars && typeof parsed.epicStars === 'object') {
              for (const [key, stars] of Object.entries(parsed.epicStars)) {
                if (!serverState.epicStars[key] || serverState.epicStars[key] < (stars as number)) {
                  serverState.epicStars[key] = stars as number;
                }
              }
            }
            if (parsed.cardProgress && typeof parsed.cardProgress === 'object') {
              for (const [cardId, data] of Object.entries(parsed.cardProgress)) {
                const sv = (data as { stars: number }).stars;
                if (!serverState.cardProgress[cardId] || sv > serverState.cardProgress[cardId].stars) {
                  serverState.cardProgress[cardId] = { stars: sv };
                }
              }
            }
            // Save merged state back so server has it next time
            this.savePlayer(serverState);
            return serverState;
          } catch (e) {
            debug.log('API', 'Login failed — using cached player state');
            debug.warn('gameServer', 'login error:', e);
          }
        }
        // Cached guest state can be partial (an old build persisted only
        // epicProgress), so fill the gaps from the defaults instead of letting
        // undefined reach the UI (the greeting rendered "سلام، undefined").
        return { ...DEFAULT_STATE, ...parsed, isOnline: true };
      } catch (e) {
        debug.warn('gameServer', 'Player state corrupted, resetting:', e);
      }
    }
    return { ...DEFAULT_STATE };
  },

  async registerUser(phone: string, pass: string, guestState?: any): Promise<AuthResult> {
    const deviceId = `user_${phone}`;
    try {
      // `epic_progress_map` is a JSONB column. `guestStats.epicProgress` used to
      // be the bare number 1, so the old `|| { rostam_7: 1 }` passed it straight
      // through and the column was written as the scalar `1` instead of a map.
      const epicProgress = (guestState?.epicProgress && typeof guestState.epicProgress === 'object')
        ? guestState.epicProgress
        : { rostam_7: 1 };
      const result = await api('/login', {
        method: 'POST',
        body: JSON.stringify({
          deviceId,
          // NO `username` on purpose: the server renames the account whenever a
          // login carries a different name, so the old hardcoded
          // `کاربر ${phone.slice(-4)}` silently overwrote any custom nickname the
          // player had saved. Omitting it makes the server apply the exact same
          // default on first registration (`کاربر ${deviceId.slice(-4)}`) while
          // leaving an existing account's chosen name untouched.
          password: pass, // Send password for server-side validation
          // Seed a brand-new account from the guest's progress so nothing is lost
          // on first registration. The server consumes these ONLY when it creates
          // the profile; for an existing account they are ignored — which is what
          // makes the server the authority.
          score: guestState?.score ?? 0,
          high_score: guestState?.highScore ?? 0,
          coins: guestState?.coins ?? 250,
          epic_progress_map: epicProgress,
          epic_stars: guestState?.epicStars || {},
          card_progress: guestState?.cardProgress || {},
          worldmap_cards: guestState?.worldmapCards || {},
        }),
      });
      if (result.token) setToken(result.token);
      const player = this.mapProfileToState(result.player || result);
      // NOTE: the guest stats are deliberately NOT merged in here any more. This
      // block used to run `coins = Math.max(server, guest.coins ?? 250)`, so every
      // login from a fresh browser (guest = 250 coins) overwrote a real balance
      // below 250 — and then persisted the inflated number to localStorage, which
      // made the wrong value survive every reload and left the client disagreeing
      // with the server about the player's money. The values are already sent
      // above (and applied by the server for new accounts), so the merge was
      // redundant for a registration and corrupting for an existing account.
      this.savePlayer(player);
      return { success: true, player };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  },

  async logout() {
    localStorage.removeItem('player_state');
    clearToken();
    return { ...DEFAULT_STATE };
  },

  savePlayer(player: PlayerState) {
    try { localStorage.setItem('player_state', JSON.stringify(player)); } catch { /* storage full / unavailable */ }
  },

  mapProfileToState(profile: any): PlayerState {
    // The server keeps the match log in `game_history` — a JSON array of
    // { score, size, category, date }. There is no `matches` column, so the old
    // `profile.matches || []` silently produced an EMPTY history on every login:
    // the profile showed "0 matches / no matches recorded" even for an account
    // with a full log (the DB had 14 entries for one real account). Accept both
    // key sets so an older payload still maps.
    const rawHistory: any[] = Array.isArray(profile.matches) ? profile.matches
      : Array.isArray(profile.game_history) ? profile.game_history
      : [];
    const history: MatchRecord[] = rawHistory.map((h: any, i: number) => ({
      // game_history entries carry no id — fall back to the index so the React
      // key in ProfileModal stays unique.
      id: h.id?.toString() || String(i),
      date: h.date_played || h.date || '',
      score: h.score || 0,
      // game_history rows only store { score, size, category, date }; without the
      // fallbacks `time` would be undefined and ProfileModal's mm:ss render NaN.
      time: h.time_taken ?? h.time ?? 0,
      size: h.grid_size ?? h.size ?? 5,
      category: h.category || 'general',
    }));

    let progressMap: Record<string, number> = {};
    if (profile.epic_progress_map && typeof profile.epic_progress_map === 'object') {
      progressMap = profile.epic_progress_map;
    }
    if (Object.keys(progressMap).length === 0) progressMap['rostam_7'] = 1;

    return {
      id: profile.id || 'guest',
      name: profile.username || 'کاربر جدید',
      avatar: profile.avatar_text || '👤',
      friendCode: profile.friend_code || '---',
      coins: profile.coins ?? 250,
      score: profile.score ?? 0,
      level: profile.level ?? 1,
      highScore: profile.high_score ?? 0,
      history,
      isOnline: true,
      lastDailyDate: profile.last_daily_date,
      lastDailyRewardDate: profile.last_daily_reward_date,
      // `is_admin` is a real `profiles` column, but the old code hardcoded false
      // here (and in DEFAULT_STATE), which left the ADMIN_PHONE constant above
      // completely dead. Read the column, and keep the phone fallback for the
      // legacy account that was never flagged in the DB.
      isAdmin: profile.is_admin === 1 || profile.is_admin === true || profile.id === `user_${ADMIN_PHONE}`,
      epicProgress: progressMap,
      epicStars: profile.epic_stars || {},
      cardProgress: profile.card_progress || {},
      worldmapCards: profile.worldmap_cards || {},
      towerTickets: profile.tower_tickets ?? 1,
      lastTicketRefill: profile.last_ticket_refill || new Date().toISOString(),
      dailyTowerCoins: profile.daily_tower_coins ?? 0,
      towerHighFloor: profile.tower_high_floor ?? 0,
      league: {
        // These are top-level columns on `profiles`. The old code read
        // `profile.league.trophies`, but `league` is a TEXT column holding e.g.
        // 'bronze' — so trophies were ALWAYS read back as 0.
        trophies: profile.trophies ?? 0,
        league: (typeof profile.league === 'string' ? profile.league : profile.league?.league) || 'bronze',
        highestLeague: profile.highest_league || 'bronze',
        winStreak: profile.win_streak ?? 0,
        totalWins: profile.total_wins ?? 0,
        totalLosses: profile.total_losses ?? 0,
      },
      // `items` is a JSON column (see JSON_COLUMNS in the DB layer). Guard against
      // a raw string in case an older server hands one back.
      items: (profile.items && typeof profile.items === 'object')
        ? {
            trophyShield: profile.items.trophyShield || 0,
            trophyBoost: profile.items.trophyBoost || 0,
            streakShield: profile.items.streakShield || 0,
          }
        : { trophyShield: 0, trophyBoost: 0, streakShield: 0 },
    };
  },

  /**
   * Consume today's daily puzzle for this account.
   *
   * The daily lock belongs at the START of the run, not at the win. It used to be
   * written only from `saveMatch` (reachable solely from `useWinHandler`), so a
   * player could start the daily, quit, and start again indefinitely — while the
   * card promised «فقط یک تلاش».
   *
   * Called from `useNavigation.onGenerateClick` AFTER the grid generates, so a
   * generation failure does not burn the day.
   *
   * Returns `alreadyPlayed: true` when the server refused because today was
   * already used, and the refreshed player so the caller can lock the card
   * immediately instead of waiting for a reload.
   */
  async claimDaily(player: PlayerState): Promise<{ alreadyPlayed: boolean; player?: PlayerState }> {
    if (!player || player.id === 'guest') return { alreadyPlayed: false };
    try {
      const res = await api<{ alreadyPlayed?: boolean; lastDailyDate?: string }>('/daily/start', { method: 'POST' });
      if (res?.alreadyPlayed) return { alreadyPlayed: true };
      const updated: PlayerState = { ...player, lastDailyDate: res?.lastDailyDate || getTodayString() };
      this.savePlayer(updated);
      return { alreadyPlayed: false, player: updated };
    } catch (e) {
      debug.warn('gameServer', 'claimDaily failed:', e);
      // Fail OPEN: a network hiccup must not silently cost the player their daily.
      // The server still marks the date when the run is submitted (POST /api/match)
      // and the prize keeps its own atomic guard, so nothing is double-paid.
      return { alreadyPlayed: false };
    }
  },

  async saveMatch(player: PlayerState, record: MatchRecord, skipTrophies: boolean = false): Promise<PlayerState> {
    const newScore = player.score + record.score;
    const newHighScore = Math.max(player.highScore, record.score);
    const isDaily = record.isDaily === true;
    const todayStr = getTodayString();

    // NOTE: trophies are NOT computed here any more. The server owns the award
    // (it mirrors the old formula in server/league.js) and persists it, which is
    // what finally puts a real number in `profiles.trophies` for the leaderboard.
    const updatedPlayer: PlayerState = {
      ...player,
      score: newScore,
      highScore: newHighScore,
      coins: player.coins,
      history: [record, ...player.history].slice(0, 20),
      lastDailyDate: isDaily ? todayStr : player.lastDailyDate,
    };

    this.savePlayer(updatedPlayer);

    if (player.id !== 'guest') {
      try {
        const res = await api<{ league?: ServerLeague; dailyReward?: number; coins?: number; progress?: ProgressGrant; streakBonus?: number }>('/match', {
          method: 'POST',
          body: JSON.stringify({
            deviceId: player.id,
            score: record.score,
            time_taken: record.time,
            grid_size: record.size,
            category: record.category,
            date_played: record.date,
            // Lets the server record `last_daily_date` — it cannot infer the daily
            // from size+category, because `all` @ 10x10 is also a casual «میکس» game.
            is_daily: isDaily,
            // Multiplayer settles trophies via /league/result (from the recorded
            // `game_over`), so it must not also take the casual award.
            skip_trophies: skipTrophies,
          }),
        });
        if (res?.league) {
          updatedPlayer.league = mergeServerLeague(updatedPlayer.league, res.league);
          this.savePlayer(updatedPlayer);
        }
        // The daily-puzzle prize is granted SERVER-side (once per day, claimed
        // atomically) and reported back here. Without this the local balance stayed
        // stale until the next reload, so the advertised «جایزه ۲۵۰ سکه» was
        // invisible — the player would see no coins arrive at all.
        if (typeof res?.coins === 'number') {
          updatedPlayer.coins = res.coins;
          // The prize is decoupled from "played" now that the day is consumed at
          // START, so record that today's reward actually landed — the card's chip
          // reads this and must not claim a prize the player never received.
          if (res.dailyReward && res.dailyReward > 0) updatedPlayer.lastDailyRewardDate = todayStr;
          this.savePlayer(updatedPlayer);
        }
        if (res?.streakBonus && res.streakBonus > 0) {
          pendingStreakBonuses.push({
            streak: Number(res.league?.winStreak) || 0,
            coins: res.streakBonus,
          });
        }
        // XP and quest progress are settled by the same request; the level lives on
        // the profile (the stat pill reads it) and a level-up is queued so the menu
        // can celebrate the chest once the player is back outside the board.
        if (res?.progress) {
          updatedPlayer.level = res.progress.level || updatedPlayer.level;
          this.savePlayer(updatedPlayer);
          this.recordProgress(res.progress);
        }
      } catch (e) {
        debug.warn('API', 'saveMatch failed:', e);
      }
    }

    return updatedPlayer;
  },

  async syncPlayer(player: PlayerState): Promise<PlayerState> {
    if (player.id !== 'guest') {
      try {
        await api('/profile', {
          method: 'PUT',
          body: JSON.stringify({
            deviceId: player.id,
            username: player.name,
            avatar_text: player.avatar,
            epic_progress_map: player.epicProgress,
            epic_stars: player.epicStars,
            card_progress: player.cardProgress,
            worldmap_cards: player.worldmapCards || {},
          }),
        });
      } catch (e) {
        debug.warn('API', 'syncPlayer failed:', e);
      }
    }
    this.savePlayer(player);
    return player;
  },

  /**
   * Push only the collectible-card map. Kept separate from `syncPlayer` so a
   * card unlock never rewrites the cached player snapshot with a stale copy of
   * the rest of the profile (coins, tickets, …).
   */
  async syncWorldMapCards(cards: Record<string, number>): Promise<void> {
    try {
      await api('/profile', {
        method: 'PUT',
        body: JSON.stringify({ worldmap_cards: cards }),
      });
    } catch (e) {
      debug.warn('API', 'syncWorldMapCards failed:', e);
    }
  },

  async updateProfile(player: PlayerState, name: string, avatar: string): Promise<PlayerState> {
    const updated = { ...player, name, avatar };
    if (player.id !== 'guest') {
      try {
        await api('/profile', {
          method: 'PUT',
          body: JSON.stringify({ deviceId: player.id, username: name, avatar_text: avatar }),
        });
      } catch (e) {
        debug.warn('API', 'updateProfile failed:', e);
      }
    }
    this.savePlayer(updated);
    return updated;
  },

  async getGlobalLeaderboard(language: 'fa' | 'en') {
    try {
      const data = await api('/leaderboard');
      return (data || []).map((p: any, index: number) => ({
        name: p.username || (language === 'fa' ? 'ناشناس' : 'Unknown'),
        avatar: p.avatar_text || '👤',
        score: p.score || 0,
        rank: index + 1,
        trophies: p.trophies || 0,
        league: p.league || 'bronze',
      }));
    } catch (e) {
      debug.warn('API', 'getGlobalLeaderboard failed:', e);
      return [];
    }
  },

  async fetchCategoryWords(category: Category, language: Language): Promise<DictionaryEntry[]> {
    const cacheKey = `${category}_${language}`;
    if (WORD_CACHE[cacheKey]) return WORD_CACHE[cacheKey];
    try {
      const data = await api(`/dictionary?category=${category}&language=${language}&limit=10000`);
      const shuffled = shuffleArray(data as DictionaryEntry[]);
      WORD_CACHE[cacheKey] = shuffled;
      return shuffled;
    } catch (e) {
      debug.warn('API', 'fetchCategoryWords failed:', e);
      return [];
    }
  },

  async fetchGlueWords(category: Category, language: Language): Promise<DictionaryEntry[]> {
    const cacheKey = `glue_${category}_${language}`;
    if (WORD_CACHE[cacheKey]) return WORD_CACHE[cacheKey];
    try {
      const data = await api(`/glue-dictionary?category=${category}&language=${language}&limit=10000`);
      const shuffled = shuffleArray(data as DictionaryEntry[]);
      WORD_CACHE[cacheKey] = shuffled;
      return shuffled;
    } catch (e) {
      debug.warn('API', 'fetchGlueWords failed:', e);
      return [];
    }
  },

  async sendFriendRequest(myId: string, friendCode: string): Promise<{ success: boolean; msg?: string }> {
    try {
      return await api('/friends/request', {
        method: 'POST',
        body: JSON.stringify({ myId, friend_code: friendCode }),
      });
    } catch (e: any) {
      return { success: false, msg: e.message };
    }
  },

  async acceptFriend(senderId: string, receiverId: string, notificationId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await api('/friends/accept', {
        method: 'POST',
        body: JSON.stringify({ sender_id: senderId, receiver_id: receiverId, notification_id: notificationId }),
      });
      return { success: true };
    } catch (e: any) {
      debug.warn('API', 'acceptFriend failed:', e);
      return { success: false, error: e.message || 'خطا' };
    }
  },

  async removeFriend(friendshipId: string, userId?: string) {
    try {
      const query = userId ? `?userId=${userId}` : '';
      await api(`/friends/${friendshipId}${query}`, { method: 'DELETE' });
      return true;
    } catch (e) {
      debug.warn('API', 'removeFriend failed:', e);
      return false;
    }
  },

  async getFriends(myId: string): Promise<Friend[]> {
    try {
      return await api(`/friends?userId=${myId}`);
    } catch (e) {
      debug.warn('API', 'getFriends failed:', e);
      return [];
    }
  },

  async registerRoom(roomId: string, hostId: string): Promise<boolean> {
    try {
      await api('/room/register', {
        method: 'POST',
        body: JSON.stringify({ roomId, hostId }),
      });
      debug.log('API', `Room registered: ${roomId} host=${hostId}`);
      return true;
    } catch (e) {
      debug.warn('API', `registerRoom failed: ${roomId}`, e);
      return false;
    }
  },

  async sendChallenge(myId: string, myName: string, friendId: string, roomId: string, mode: string, size: number, category: string) {
    try {
      const data = await api('/notifications', {
        method: 'POST',
        body: JSON.stringify({
          user_id: friendId,
          sender_id: myId,
          type: 'challenge',
          payload: { roomId, mode, senderName: myName, size, category },
        }),
      });
      debug.log('API', `Challenge sent: room=${roomId} to=${friendId} notif=${data?.id}`);
      return data;
    } catch (e) {
      debug.warn('API', `sendChallenge failed:`, e);
      return null;
    }
  },

  async cancelChallenge(notificationId: string | null, friendId: string, myId: string) {
    try {
      await api('/challenge/cancel', {
        method: 'POST',
        body: JSON.stringify({ notificationId, friendId, myId }),
      });
      debug.log('API', `Challenge cancelled: notif=${notificationId}`);
    } catch (e) {
      debug.warn('API', `cancelChallenge failed:`, e);
    }
  },

  async checkRoom(roomId: string) {
    try {
        const data = await api('/room/check', {
            method: 'POST',
            body: JSON.stringify({ roomId }),
        });
        const exists = data?.exists ?? false;
        debug.log('API', `checkRoom: ${roomId} exists=${exists}`);
        return exists;
    } catch (e) {
        debug.warn('API', `checkRoom error: ${roomId}`, e);
        return false;
    }
  },

  // ─── Async duels ───────────────────────────────────────

  /** Post one finished game as an arena. No friends involved yet. */
  async createDuelArena(payload: {
    category: Category;
    language: Language;
    size: number;
    board: DuelBoard;
    result: DuelResult;
  }): Promise<DuelArena> {
    const data = await api('/duel/create', {
      method: 'POST',
      body: JSON.stringify({
        category: payload.category,
        language: payload.language,
        size: payload.size,
        board: payload.board,
        result: payload.result,
      }),
    });
    return data.arena as DuelArena;
  },

  /** Invite friends to one existing arena (max five friends per arena). */
  async inviteToDuel(arenaId: string, opponentIds: string[]): Promise<DuelArena> {
    const data = await api('/duel/invite', {
      method: 'POST',
      body: JSON.stringify({ arena_id: arenaId, opponent_ids: opponentIds }),
    });
    return data.arena as DuelArena;
  },

  /** Stop new invitations — everything already inside stays playable. */
  async closeDuelArena(arenaId: string): Promise<DuelArena> {
    const data = await api('/duel/close', {
      method: 'POST',
      body: JSON.stringify({ arena_id: arenaId }),
    });
    return data.arena as DuelArena;
  },

  /** Remove an arena. Refused by the server once it has any result. */
  async deleteDuelArena(arenaId: string): Promise<void> {
    await api('/duel/delete', {
      method: 'POST',
      body: JSON.stringify({ arena_id: arenaId }),
    });
  },

  async acceptDuel(duelId: string): Promise<AsyncDuel> {
    const data = await api('/duel/accept', {
      method: 'POST',
      body: JSON.stringify({ duel_id: duelId }),
    });
    return data.duel as AsyncDuel;
  },

  async submitDuelResult(id: string, result: DuelResult): Promise<{
    duel: AsyncDuel;
    outcome: 'win' | 'loss' | 'draw';
    coins?: number | null;
    reward?: number | null;
    points?: number;
    opponentPoints?: number;
    progress?: ProgressGrant;
  }> {
    const data = await api<{
      duel: AsyncDuel;
      outcome: 'win' | 'loss' | 'draw';
      coins?: number | null;
      reward?: number | null;
      points?: number;
      opponentPoints?: number;
      progress?: ProgressGrant;
    }>('/duel/result', {
      method: 'POST',
      body: JSON.stringify({ id, result }),
    });
    gameServer.recordProgress(data.progress);
    return data;
  },

  async listDuels(): Promise<{
    arenas: DuelArena[];
    incoming: AsyncDuel[];
    results: AsyncDuel[];
  }> {
    const data = await api('/duel/list');
    return {
      arenas: Array.isArray(data?.arenas) ? data.arenas : [],
      incoming: Array.isArray(data?.incoming) ? data.incoming : [],
      results: Array.isArray(data?.results) ? data.results : [],
    };
  },

  async sendChallengeAccepted(myId: string, myName: string, myAvatar: string, hostId: string, roomId: string, notificationId?: string, joinerSize?: GridSize, joinerCategory?: Category) {
    debug.log('API', `sendChallengeAccepted: room=${roomId} host=${hostId} sender=${myId} size=${joinerSize} cat=${joinerCategory}`);
    try {
      const data = await api('/challenge/accept', {
        method: 'POST',
        body: JSON.stringify({
          sender_id: myId, sender_name: myName, sender_avatar: myAvatar,
          host_id: hostId, room_id: roomId, notification_id: notificationId,
          joiner_size: joinerSize, joiner_category: joinerCategory,
        }),
      });
      return data;
    } catch (e) {
      debug.warn('API', `sendChallengeAccepted HTTP failed:`, e);
      return null;
    }
  },

  async fetchNotifications(userId: string) {
    try {
      return await api(`/notifications?userId=${userId}`);
    } catch (e) {
      debug.warn('API', 'fetchNotifications failed:', e);
      return [];
    }
  },

  async clearNotification(nId: string) {
    try {
      await api(`/notifications/${nId}`, { method: 'DELETE' });
    } catch (e) {
      debug.warn('API', 'clearNotification failed:', e);
    }
  },

  async rejectChallenge(notificationId: string, senderId: string, myId: string) {
    try {
      await api('/challenge/reject', {
        method: 'POST',
        body: JSON.stringify({ notificationId, senderId, receiverId: myId }),
      });
    } catch (e) {
      debug.warn('API', 'rejectChallenge failed:', e);
    }
  },

  async joinMatchmaking(playerId: string, playerName: string, playerAvatar: string, mode: GameMode, wager: number, leagueTrophies: number): Promise<any> {
    try {
      return await api('/matchmaking/join', {
        method: 'POST',
        body: JSON.stringify({ playerId, playerName, playerAvatar, mode, wager, leagueTrophies }),
      });
    } catch (e) {
      debug.warn('API', `joinMatchmaking failed:`, e);
      return null;
    }
  },

  async leaveMatchmaking(playerId: string) {
    try {
      await api('/matchmaking/leave', {
        method: 'POST',
        body: JSON.stringify({ playerId }),
      });
    } catch (e) {
      debug.warn('API', 'leaveMatchmaking failed:', e);
    }
  },

  async checkMatchmakingStatus(playerId: string): Promise<any> {
    try {
      return await api('/matchmaking/status', {
        method: 'POST',
        body: JSON.stringify({ playerId }),
      });
    } catch (e) {
      debug.warn('API', 'checkMatchmakingStatus failed:', e);
      return null;
    }
  },

  async sendMessage(senderId: string, receiverId: string, content: string) {
    try {
      const msg = await api('/messages/send', {
        method: 'POST',
        body: JSON.stringify({ sender_id: senderId, receiver_id: receiverId, content: content.trim() }),
      });
      return msg;
    } catch (e) {
      debug.warn('API', 'sendMessage failed:', e);
    }
  },

  async fetchMessages(myId: string, friendId: string) {
    try {
      return await api(`/messages/${friendId}?myId=${myId}`);
    } catch (e) {
      debug.warn('API', 'fetchMessages failed:', e);
      return [];
    }
  },

  async markMessagesRead(myId: string, friendId: string): Promise<boolean> {
    try {
      await api('/messages/read', {
        method: 'POST',
        body: JSON.stringify({ myId, sender_id: friendId }),
      });
      return true;
    } catch (e) {
      debug.warn('API', 'markMessagesRead failed:', e);
      return false;
    }
  },

  /** Unread DM counts keyed by sender id, for friend-list badges. */
  async fetchUnreadCounts(myId: string): Promise<Record<string, number>> {
    try {
      const data = await api(`/messages/unread?myId=${encodeURIComponent(myId)}`);
      return (data && typeof data === 'object') ? data as Record<string, number> : {};
    } catch (e) {
      debug.warn('API', 'fetchUnreadCounts failed:', e);
      return {};
    }
  },

  consumeTowerTicket: async (player: PlayerState): Promise<PlayerState> => {
    if (player.towerTickets <= 0) return player;

    // The server owns the count: it decrements atomically and refuses when none
    // are left. Mirror what it returns rather than trusting a local subtraction
    // (the old version also clobbered `lastTicketRefill` when going 2 → 1).
    if (player.id !== 'guest') {
      try {
        const res = await api<{ success: boolean; tower_tickets: number; last_ticket_refill?: string }>('/tower/consume-ticket', {
          method: 'POST',
          body: JSON.stringify({ deviceId: player.id }),
        });
        if (typeof res?.tower_tickets === 'number') {
          const synced: PlayerState = {
            ...player,
            towerTickets: res.tower_tickets,
            lastTicketRefill: res.last_ticket_refill ?? player.lastTicketRefill,
          };
          gameServer.savePlayer(synced);
          return synced;
        }
      } catch (e) {
        debug.warn('API', 'consumeTowerTicket failed:', e);
      }
    }

    // Guest, or the server was unreachable — decrement locally so an offline game
    // is still playable. The next load re-syncs to the server's value.
    const updated = { ...player, towerTickets: player.towerTickets - 1 };
    gameServer.savePlayer(updated);
    return updated;
  },

  /**
   * Claim the free tower ticket the TowerLobby button offers. The SERVER meters
   * it (one per refill window, never past the cap), so this can legitimately fail:
   * `atCap` / `cooldown` tell the caller which.
   */
  claimFreeTicket: async (): Promise<{ ok: boolean; towerTickets: number | null; lastTicketRefill: string | null; atCap: boolean; cooldown: boolean }> => {
    const empty = { ok: false, towerTickets: null, lastTicketRefill: null, atCap: false, cooldown: false };
    try {
      const res = await api<{ success: boolean; tower_tickets: number; last_ticket_refill?: string }>('/tower/free-ticket', {
        method: 'POST',
        body: JSON.stringify({}),
      });
      if (res?.success !== true) return empty;
      return {
        ok: true,
        towerTickets: typeof res.tower_tickets === 'number' ? res.tower_tickets : null,
        lastTicketRefill: res.last_ticket_refill ?? null,
        atCap: false,
        cooldown: false,
      };
    } catch (e: any) {
      // `api` throws with only the server's `error` string, so the remaining
      // window is not available here — the caller just reports "not ready yet".
      const msg = String(e?.message || '');
      debug.warn('API', 'claimFreeTicket failed:', msg);
      return { ...empty, atCap: msg === 'at_cap', cooldown: msg === 'cooldown' };
    }
  },

  /**
   * Spend coins on a server-priced item (hint, shop purchase).
   *
   * The debit happens server-side and atomically, so it cannot overdraw and
   * cannot be replayed for free on reload — which is exactly what used to
   * happen when the cost was only subtracted locally. Returns the authoritative
   * balance on success.
   */
  spendCoins: async (reason: CoinReason): Promise<SpendResult> => {
    try {
      const res = await api<{ success: boolean; coins: number; spent: number; items?: { trophyShield?: number; trophyBoost?: number; streakShield?: number }; tower_tickets?: number }>('/coins/spend', {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });
      if (typeof res?.coins === 'number') {
        // Shop purchases also return the resulting item / ticket counts, which the
        // server owns (it used to debit the coins and leave the goods to the client).
        return {
          status: 'ok',
          coins: res.coins,
          ...(res.items ? { items: res.items } : {}),
          ...(typeof res.tower_tickets === 'number' ? { towerTickets: res.tower_tickets } : {}),
        };
      }
      return { status: 'error' };
    } catch (e: any) {
      // 400 = the server refused: balance too low, or already at the ticket cap.
      const msg = String(e?.message || '');
      debug.warn('API', `spendCoins(${reason}) failed:`, msg);
      if (msg === 'at_cap') return { status: 'at_cap' };
      return { status: msg.includes('سکه') ? 'insufficient' : 'error' };
    }
  },

  // ─── Progression (server-owned: streak, XP, quests, season, cosmetics) ───

  /**
   * One round trip for every progression surface in the menu. The server also
   * rolls the season/quest day forward as a side effect, so a client that has
   * been closed for a week gets a correct snapshot without any local date math.
   */
  async getProgress(): Promise<ProgressSnapshot | null> {
    try {
      return await api<ProgressSnapshot>('/progress');
    } catch (e) {
      debug.warn('API', 'getProgress failed:', e);
      return null;
    }
  },

  /** Claim one finished quest. Completion is verified server-side. */
  async claimQuest(id: string): Promise<{ ok: boolean; reward?: number; coins?: number; quests?: QuestDayView; polishTokenGranted?: boolean; error?: string }> {
    try {
      const res = await api<{ reward: number; coins: number; quests: QuestDayView }>('/quests/claim', {
        method: 'POST',
        body: JSON.stringify({ id }),
      });
      let polishTokenGranted = false;
      if (res?.quests?.items?.length && res.quests.items.every((q) => q.claimed)) {
        const eco = this.getLocalEconomyState();
        const today = getTodayString();
        let raw: any = {};
        try { raw = JSON.parse(localStorage.getItem('crossword_economy_state') || '{}') || {}; } catch {}
        if (raw.polishTokenQuestDate !== today) {
          const nextTokens = Math.min(MAX_FREE_POLISH_TOKENS, (eco.freePolishTokens || 0) + 1);
          this.saveLocalEconomyPatch({
            freePolishTokens: nextTokens,
            polishTokenQuestDate: today,
          });
          polishTokenGranted = true;
        }
      }
      return { ok: true, reward: res.reward, coins: res.coins, quests: res.quests, polishTokenGranted };
    } catch (e: any) {
      return { ok: false, error: String(e?.message || '') };
    }
  },

  /** Swap today's quest set — one free reroll per day. */
  async rerollQuests(): Promise<{ ok: boolean; quests?: QuestDayView; error?: string }> {
    try {
      const res = await api<{ quests: QuestDayView }>('/quests/reroll', { method: 'POST', body: JSON.stringify({}) });
      return { ok: true, quests: res.quests };
    } catch (e: any) {
      return { ok: false, error: String(e?.message || '') };
    }
  },

  /** Collect the reward for the tier the player FINISHED last season in. */
  async claimSeason(): Promise<{ ok: boolean; reward?: number; coins?: number; tier?: string; error?: string }> {
    try {
      const res = await api<{ reward: number; coins: number; tier: string }>('/season/claim', { method: 'POST', body: JSON.stringify({}) });
      return { ok: true, reward: res.reward, coins: res.coins, tier: res.tier };
    } catch (e: any) {
      return { ok: false, error: String(e?.message || '') };
    }
  },

  /** Buy a frame/title. Prices are server-owned (`progression.COSMETICS`). */
  async purchaseCosmetic(id: string): Promise<{ ok: boolean; coins?: number; owned?: string[]; error?: string; insufficient?: boolean }> {
    try {
      const res = await api<{ coins: number; owned: string[] }>('/cosmetics/purchase', {
        method: 'POST',
        body: JSON.stringify({ id }),
      });
      return { ok: true, coins: res.coins, owned: res.owned };
    } catch (e: any) {
      return { ok: false, error: String(e?.message || ''), insufficient: String(e?.message || '').includes('سکه') };
    }
  },

  /** Equip a cosmetic, or clear both slots with an empty id. */
  async equipCosmetic(id: string | null): Promise<{ ok: boolean; cosmetics?: CosmeticsView; error?: string }> {
    try {
      const res = await api<{ cosmetics: CosmeticsView }>('/cosmetics/equip', {
        method: 'POST',
        body: JSON.stringify({ id: id || '' }),
      });
      return { ok: true, cosmetics: res.cosmetics };
    } catch (e: any) {
      return { ok: false, error: String(e?.message || '') };
    }
  },

  /** One-time coins for finishing a book/legend set; may also grant a shelf frame. */
  async claimCollectionSet(shelf: string, setId: string): Promise<{
    ok: boolean;
    reward?: number;
    coins?: number;
    frameGranted?: string | null;
    claimedSets?: Record<string, boolean>;
    error?: string;
  }> {
    try {
      const res = await api<{ reward: number; coins: number; frameGranted: string | null; claimedSets: Record<string, boolean> }>('/collection/claim', {
        method: 'POST',
        body: JSON.stringify({ shelf, setId }),
      });
      return { ok: true, reward: res.reward, coins: res.coins, frameGranted: res.frameGranted, claimedSets: res.claimedSets };
    } catch (e: any) {
      return { ok: false, error: String(e?.message || '') };
    }
  },

  // ─── Economy / IAP / Wheel / Battle Pass / Clay Piggy Bank / Kiln / Loadout ───

  getLocalEconomyState(): EconomyStateView {
    const today = getTodayString();
    let raw: any = {};
    try {
      const saved = localStorage.getItem('crossword_economy_state');
      if (saved) raw = JSON.parse(saved) || {};
    } catch {}
    let legacySizes: number[] = [];
    let legacyCats: string[] = [];
    try {
      const s = localStorage.getItem('unlocked_sizes');
      if (s) legacySizes = JSON.parse(s);
      const c = localStorage.getItem('unlocked_categories');
      if (c) legacyCats = JSON.parse(c);
    } catch {}

    const purchasedPacks: string[] = Array.isArray(raw.purchasedPacks) ? raw.purchasedPacks : [];
    const unlockedBooks = Array.from(new Set([...FREE_BOOK_IDS, ...(Array.isArray(raw.unlockedBooks) ? raw.unlockedBooks : [])]));
    const unlockedAvatars = Array.from(new Set([...FREE_AVATAR_IDS, ...(Array.isArray(raw.unlockedAvatars) ? raw.unlockedAvatars : [])]));
    const unlockedSizes = Array.from(new Set([5, 6, ...legacySizes, ...(Array.isArray(raw.unlockedSizes) ? raw.unlockedSizes.map(Number) : [])]));
    const unlockedCategories = Array.from(new Set(['shahnameh', 'all', 'general', 'food', ...legacyCats, ...(Array.isArray(raw.unlockedCategories) ? raw.unlockedCategories : [])]));
    const unlockedLegends = Array.from(new Set([...FREE_FOOTBALL_LEGEND_IDS, ...(Array.isArray(raw.unlockedLegends) ? raw.unlockedLegends : [])]));

    const hasEpicPatronPass = !!raw.hasEpicPatronPass || purchasedPacks.includes('epic_patron_pass');
    const hasSeasonPass = !!raw.hasSeasonPass || purchasedPacks.includes('season_battle_pass');

    const wheelSameDay = raw.wheelLastDate === today;
    const wheelSpinsToday = wheelSameDay ? (Number(raw.wheelSpinsToday) || 0) : 0;
    const wheelFreeUsed = wheelSameDay && !!raw.wheelFreeUsed;
    const wheelAdUsed = wheelSameDay && !!raw.wheelAdUsed;
    const wheelPaidUsed = wheelSameDay && !!raw.wheelPaidUsed;

    const adSameDay = raw.rewardedAdLastDate === today;
    const rewardedAdsToday = adSameDay ? (Number(raw.rewardedAdsToday) || 0) : 0;

    // Clay Piggy Bank: seed with 420 coins on first boot so the jar visibly glitters
    const piggyBankCoins = Math.min(
      PIGGY_BANK_MAX_CAP,
      Math.max(0, typeof raw.piggyBankCoins === 'number' ? raw.piggyBankCoins : 420),
    );
    const piggyBankSmashedCount = Math.max(0, Number(raw.piggyBankSmashedCount) || 0);

    // Practice Mode (2 free daily runs) & Kiln Polishing
    const practiceSameDay = raw.practiceLastDate === today;
    const freePracticeToday = practiceSameDay ? (Number(raw.freePracticeToday) || 0) : 0;
    const freePracticeRemaining = Math.max(0, DAILY_FREE_PRACTICE_CAP - freePracticeToday);
    const freePolishTokens = Math.min(
      MAX_FREE_POLISH_TOKENS,
      Math.max(0, typeof raw.freePolishTokens === 'number' ? raw.freePolishTokens : 1),
    );
    const cardPolishPity: Record<string, number> =
      raw.cardPolishPity && typeof raw.cardPolishPity === 'object' ? raw.cardPolishPity : {};
    const storyCardTiers: Record<string, 1 | 2 | 3 | 4> =
      raw.storyCardTiers && typeof raw.storyCardTiers === 'object' ? raw.storyCardTiers : {};

    // Active 3-card loadout
    const activeDeck: string[] = Array.isArray(raw.activeDeck)
      ? raw.activeDeck.filter((x: unknown) => typeof x === 'string').slice(0, 3)
      : [];

    // Daily Ad Revive
    const reviveSameDay = raw.reviveAdLastDate === today;
    const reviveAdUsedToday = reviveSameDay && !!raw.reviveAdUsedToday;

    return {
      purchasedPacks,
      unlockedBooks,
      unlockedAvatars,
      unlockedSizes,
      unlockedCategories,
      unlockedLegends,
      hasEpicPatronPass,
      hasSeasonPass,
      seasonPassClaimedFree: Array.isArray(raw.seasonPassClaimedFree) ? raw.seasonPassClaimedFree : [],
      seasonPassClaimedGold: Array.isArray(raw.seasonPassClaimedGold) ? raw.seasonPassClaimedGold : [],
      wheelSpinsToday,
      wheelFreeAvailable: !wheelFreeUsed,
      wheelAdAvailable: wheelFreeUsed && !wheelAdUsed,
      wheelPaidAvailable: wheelFreeUsed && wheelAdUsed && !wheelPaidUsed,
      rewardedAdsToday,
      rewardedAdsRemaining: Math.max(0, REWARDED_AD_DAILY_CAP - rewardedAdsToday),
      piggyBankCoins,
      piggyBankSmashedCount,
      freePracticeToday,
      freePracticeRemaining,
      freePolishTokens,
      cardPolishPity,
      storyCardTiers,
      activeDeck,
      reviveAdUsedToday,
    };
  },

  saveLocalEconomyPatch(patch: Record<string, any>): EconomyStateView {
    try {
      const saved = localStorage.getItem('crossword_economy_state');
      const prev = saved ? JSON.parse(saved) : {};
      const next = { ...prev, ...patch };
      localStorage.setItem('crossword_economy_state', JSON.stringify(next));
      if (Array.isArray(next.unlockedSizes)) {
        localStorage.setItem('unlocked_sizes', JSON.stringify(next.unlockedSizes));
      }
      if (Array.isArray(next.unlockedCategories)) {
        localStorage.setItem('unlocked_categories', JSON.stringify(next.unlockedCategories));
      }
    } catch {}
    return this.getLocalEconomyState();
  },

  /**
   * Add coins to the Clay Jar Piggy Bank whenever words are solved in any mode,
   * and dispatch a window event (`cg-piggy-coin`) so the HUD / Menu jar plays
   * a flying-coin & jiggle animation.
   */
  addPiggyBankCoins(wordsCount: number = 1): {
    added: number;
    total: number;
    full: boolean;
    halfReady: boolean;
    economy: EconomyStateView;
  } {
    const eco = this.getLocalEconomyState();
    const current = eco.piggyBankCoins ?? 420;
    const rawAdd = Math.max(1, wordsCount) * PIGGY_BANK_PER_WORD;
    const nextTotal = Math.min(PIGGY_BANK_MAX_CAP, current + rawAdd);
    const added = Math.max(0, nextTotal - current);
    const updatedEco = this.saveLocalEconomyPatch({ piggyBankCoins: nextTotal });
    const detail = {
      added,
      rawAdd,
      total: nextTotal,
      full: nextTotal >= PIGGY_BANK_MAX_CAP,
      halfReady: nextTotal >= PIGGY_BANK_HALF_THRESHOLD,
    };
    if (typeof window !== 'undefined') {
      try {
        window.dispatchEvent(new CustomEvent('cg-piggy-coin', { detail }));
      } catch {}
    }
    return { ...detail, economy: updatedEco };
  },

  /**
   * Smash the Clay Jar Piggy Bank (available once >= 750 coins) and credit all
   * stored coins (+15% direct web bonus when using `web_shaparak`).
   */
  async smashPiggyBank(
    player: PlayerState,
    gateway: 'web_shaparak' | 'bazaar' | 'myket' = 'web_shaparak',
  ): Promise<{
    ok: boolean;
    coinsGranted?: number;
    bonusCoins?: number;
    coins?: number;
    economy?: EconomyStateView;
    error?: string;
  }> {
    const eco = this.getLocalEconomyState();
    const jarCoins = eco.piggyBankCoins ?? 0;
    if (jarCoins < PIGGY_BANK_HALF_THRESHOLD) {
      return {
        ok: false,
        error: `خمره باید حداقل تا نیمه (${PIGGY_BANK_HALF_THRESHOLD} سکه) پر شود تا قابل شکستن باشد`,
      };
    }
    const bonusCoins = gateway === 'web_shaparak' ? Math.round(jarCoins * WEB_DIRECT_BONUS_RATE) : 0;
    const coinsGranted = jarCoins + bonusCoins;
    const nextCoins = (player.coins || 0) + coinsGranted;
    const updatedEco = this.saveLocalEconomyPatch({
      piggyBankCoins: 150, // Seed the next clay jar with 150 starter coins
      piggyBankSmashedCount: (eco.piggyBankSmashedCount || 0) + 1,
    });
    const updatedPlayer: PlayerState = { ...player, coins: nextCoins };
    this.savePlayer(updatedPlayer);
    if (typeof window !== 'undefined') {
      try {
        window.dispatchEvent(
          new CustomEvent('cg-piggy-coin', {
            detail: { added: 0, total: 150, full: false, halfReady: false, smashed: true },
          }),
        );
      } catch {}
    }
    return {
      ok: true,
      coinsGranted,
      bonusCoins,
      coins: nextCoins,
      economy: updatedEco,
    };
  },

  /** Consume 1 daily free Practice & Rank Preview run (out of 2/day). */
  consumePracticeRun(): { ok: boolean; remaining: number; economy: EconomyStateView; error?: string } {
    const today = getTodayString();
    const eco = this.getLocalEconomyState();
    const used = eco.freePracticeToday || 0;
    if (used >= DAILY_FREE_PRACTICE_CAP) {
      return {
        ok: false,
        remaining: 0,
        economy: eco,
        error: 'سقف ۲ تمرین رایگان امروز تمام شده است',
      };
    }
    const nextUsed = used + 1;
    const updatedEco = this.saveLocalEconomyPatch({
      practiceLastDate: today,
      freePracticeToday: nextUsed,
    });
    return {
      ok: true,
      remaining: Math.max(0, DAILY_FREE_PRACTICE_CAP - nextUsed),
      economy: updatedEco,
    };
  },

  /**
   * Polish a card in the Kiln (either before a chapter replay or retroactively
   * from the Practice/Victory screen). Supports paying with 1 Free Polish Seal
   * (`useFreeToken = true`) or coins (`60 / 120 / 220`), and guarantees the
   * upgrade when `cardPolishPity[cardKey]` reaches 100%.
   */
  polishCardInKiln(
    player: PlayerState,
    cardKey: string,
    targetTier: 2 | 3 | 4,
    useFreeToken: boolean,
    succeededByTime: boolean,
  ): {
    ok: boolean;
    upgraded: boolean;
    newTier: 1 | 2 | 3 | 4;
    pity: number;
    pityTriggered: boolean;
    coins: number;
    spentCoins: number;
    economy: EconomyStateView;
    player: PlayerState;
    error?: string;
  } {
    const eco = this.getLocalEconomyState();
    const cost = KILN_POLISH_COSTS[targetTier] || 60;
    let nextCoins = player.coins || 0;
    let nextTokens = eco.freePolishTokens ?? 0;
    let spentCoins = 0;

    if (useFreeToken) {
      if (nextTokens <= 0) {
        return {
          ok: false,
          upgraded: false,
          newTier: 1,
          pity: eco.cardPolishPity?.[cardKey] || 0,
          pityTriggered: false,
          coins: nextCoins,
          spentCoins: 0,
          economy: eco,
          player,
          error: 'مُهر صیقل رایگان ندارید',
        };
      }
      nextTokens -= 1;
    } else {
      if (nextCoins < cost) {
        return {
          ok: false,
          upgraded: false,
          newTier: 1,
          pity: eco.cardPolishPity?.[cardKey] || 0,
          pityTriggered: false,
          coins: nextCoins,
          spentCoins: 0,
          economy: eco,
          player,
          error: `سکه کافی ندارید (${cost} سکه نیاز است)`,
        };
      }
      nextCoins -= cost;
      spentCoins = cost;
    }

    const prevPity = Number(eco.cardPolishPity?.[cardKey] || 0);
    const nextPityIfFail = Math.min(100, prevPity + KILN_PITY_STEP);
    const pityTriggered = !succeededByTime && nextPityIfFail >= 100;
    const upgraded = succeededByTime || pityTriggered;
    const finalPity = upgraded ? 0 : nextPityIfFail;

    const nextPityMap = { ...(eco.cardPolishPity || {}), [cardKey]: finalPity };
    const nextStoryTiers = { ...(eco.storyCardTiers || {}) };
    const nextWorldMapCards = { ...(player.worldmapCards || {}) };
    const nextEpicStars = { ...(player.epicStars || {}) };

    let finalTier: 1 | 2 | 3 | 4 = targetTier;
    if (upgraded) {
      nextStoryTiers[cardKey] = targetTier;
      if (cardKey.startsWith('legend:')) {
        const chId = cardKey.slice('legend:'.length);
        const cur = Number(nextWorldMapCards[chId] || 1);
        nextWorldMapCards[chId] = Math.min(4, Math.max(cur, targetTier)) as 1 | 2 | 3 | 4;
      } else if (cardKey.startsWith('story:')) {
        const parts = cardKey.split(':');
        const starKey = `${parts[1]}_${parts[2]}`;
        const cur = Number(nextEpicStars[starKey] || 1);
        nextEpicStars[starKey] = Math.max(cur, targetTier);
      }
    } else {
      if (cardKey.startsWith('legend:')) {
        const chId = cardKey.slice('legend:'.length);
        finalTier = (Math.min(4, Math.max(1, Number(nextWorldMapCards[chId] || 1))) as 1 | 2 | 3 | 4);
      } else {
        finalTier = (Math.min(4, Math.max(1, Number(nextStoryTiers[cardKey] || 1))) as 1 | 2 | 3 | 4);
      }
    }

    const updatedEco = this.saveLocalEconomyPatch({
      freePolishTokens: nextTokens,
      cardPolishPity: nextPityMap,
      storyCardTiers: nextStoryTiers,
    });

    const updatedPlayer: PlayerState = {
      ...player,
      coins: nextCoins,
      worldmapCards: nextWorldMapCards,
      epicStars: nextEpicStars,
    };
    this.savePlayer(updatedPlayer);
    if (cardKey.startsWith('legend:')) {
      try {
        const raw = localStorage.getItem('crossword_worldmap_cards');
        const parsed = raw ? JSON.parse(raw) : {};
        const merged = { ...parsed, ...nextWorldMapCards };
        localStorage.setItem('crossword_worldmap_cards', JSON.stringify(merged));
      } catch {}
      this.syncWorldMapCards(nextWorldMapCards);
    }
    if (typeof window !== 'undefined') {
      try {
        window.dispatchEvent(
          new CustomEvent('cg-cards-updated', {
            detail: { worldmapCards: nextWorldMapCards, player: updatedPlayer, economy: updatedEco },
          }),
        );
      } catch {}
    }

    return {
      ok: true,
      upgraded,
      newTier: finalTier,
      pity: finalPity,
      pityTriggered,
      coins: nextCoins,
      spentCoins,
      economy: updatedEco,
      player: updatedPlayer,
    };
  },

  /** Toggle a Master Scroll key (`scroll:legend:<legendId>` or `scroll:book:<bookId>`) in the 10-slot activeDeck. */
  toggleDeckCard(
    scrollKey: string,
    tier?: 1 | 2 | 3 | 4,
  ): { added: boolean; full: boolean; economy: EconomyStateView } {
    const eco = this.getLocalEconomyState();
    const deck = Array.isArray(eco.activeDeck)
      ? eco.activeDeck.filter((k) => typeof k === 'string' && k.startsWith('scroll:'))
      : [];
    const idx = deck.indexOf(scrollKey);
    let added = false;
    if (idx >= 0) {
      deck.splice(idx, 1);
    } else {
      if (deck.length >= 10) {
        deck.shift();
      }
      deck.push(scrollKey);
      added = true;
    }
    const nextScrollTiers = tier
      ? { ...(eco.scrollTiers || {}), [scrollKey]: tier }
      : eco.scrollTiers;
    const updatedEco = this.saveLocalEconomyPatch({
      activeDeck: deck,
      ...(nextScrollTiers ? { scrollTiers: nextScrollTiers } : {}),
    });
    if (typeof window !== 'undefined') {
      try {
        window.dispatchEvent(new CustomEvent('cg-deck-updated', { detail: { activeDeck: deck } }));
      } catch {}
    }
    return { added, full: deck.length >= 10, economy: updatedEco };
  },

  /** Replace the entire 10-scroll active combo deck at once (e.g., Auto-Equip Best Scrolls). */
  setActiveDeck(
    scrollKeys: string[],
    scrollTiersPatch?: Record<string, 1 | 2 | 3 | 4>,
  ): EconomyStateView {
    const eco = this.getLocalEconomyState();
    const clean = Array.from(
      new Set(scrollKeys.filter((k) => typeof k === 'string' && k.startsWith('scroll:'))),
    ).slice(0, 10);
    const nextScrollTiers = scrollTiersPatch
      ? { ...(eco.scrollTiers || {}), ...scrollTiersPatch }
      : eco.scrollTiers;
    const updatedEco = this.saveLocalEconomyPatch({
      activeDeck: clean,
      ...(nextScrollTiers ? { scrollTiers: nextScrollTiers } : {}),
    });
    if (typeof window !== 'undefined') {
      try {
        window.dispatchEvent(new CustomEvent('cg-deck-updated', { detail: { activeDeck: clean } }));
      } catch {}
    }
    return updatedEco;
  },

  /** Equip a specific Master Scroll into slot 0..9 of the 10-scroll combo rack. */
  equipDeckCardAtSlot(
    slotIdx: number,
    scrollKey: string,
    tier?: 1 | 2 | 3 | 4,
  ): EconomyStateView {
    const eco = this.getLocalEconomyState();
    const deck = Array.isArray(eco.activeDeck)
      ? eco.activeDeck.filter((k) => typeof k === 'string' && k.startsWith('scroll:'))
      : [];
    const existingIdx = deck.indexOf(scrollKey);
    if (existingIdx >= 0) {
      deck.splice(existingIdx, 1);
    }
    const targetIdx = Math.max(0, Math.min(9, slotIdx));
    if (targetIdx < deck.length) {
      deck[targetIdx] = scrollKey;
    } else {
      deck.push(scrollKey);
    }
    const clean = Array.from(new Set(deck.filter(Boolean))).slice(0, 10);
    const nextScrollTiers = tier
      ? { ...(eco.scrollTiers || {}), [scrollKey]: tier }
      : eco.scrollTiers;
    const updatedEco = this.saveLocalEconomyPatch({
      activeDeck: clean,
      ...(nextScrollTiers ? { scrollTiers: nextScrollTiers } : {}),
    });
    if (typeof window !== 'undefined') {
      try {
        window.dispatchEvent(new CustomEvent('cg-deck-updated', { detail: { activeDeck: clean } }));
      } catch {}
    }
    return updatedEco;
  },

  /** Persist resolved Master Scroll tiers (`min(card tiers in set)`) into economy state. */
  syncScrollTiers(scrollTiersPatch: Record<string, 1 | 2 | 3 | 4>): EconomyStateView {
    const eco = this.getLocalEconomyState();
    const current = eco.scrollTiers || {};
    let changed = false;
    const merged: Record<string, 1 | 2 | 3 | 4> = { ...current };
    for (const [k, v] of Object.entries(scrollTiersPatch)) {
      if (merged[k] !== v) {
        merged[k] = v;
        changed = true;
      }
    }
    if (!changed) return eco;
    return this.saveLocalEconomyPatch({ scrollTiers: merged });
  },

  /**
   * Grant a free Starter Combo Card Pack (3 Football Legend cards + 3 Shahnameh/History cards)
   * so any player opening the Collection & Combo Studio can immediately build, test, and
   * polish a 3-card synergy combo without facing an empty/locked collection.
   */
  claimStarterComboPack(player: PlayerState): {
    economy: EconomyStateView;
    player: PlayerState;
    worldmapCards: Record<string, 1 | 2 | 3 | 4>;
    worldmapProgress: Record<string, number>;
  } {
    let rawCards: Record<string, 1 | 2 | 3 | 4> = {};
    let rawProgress: Record<string, number> = {};
    try {
      const c = localStorage.getItem('crossword_worldmap_cards');
      if (c) rawCards = JSON.parse(c) || {};
      const p = localStorage.getItem('crossword_worldmap_progress');
      if (p) rawProgress = JSON.parse(p) || {};
    } catch {}

    const nextWorldMapCards: Record<string, 1 | 2 | 3 | 4> = {
      ...(player.worldmapCards || {}),
      ...rawCards,
      messi_rosario: Math.max(2, Number(rawCards.messi_rosario || player.worldmapCards?.messi_rosario || 0)) as 1 | 2 | 3 | 4,
      maradona_villa: Math.max(1, Number(rawCards.maradona_villa || player.worldmapCards?.maradona_villa || 0)) as 1 | 2 | 3 | 4,
      zidane_marseille: Math.max(1, Number(rawCards.zidane_marseille || player.worldmapCards?.zidane_marseille || 0)) as 1 | 2 | 3 | 4,
    };

    const nextWorldMapProgress: Record<string, number> = {
      ...rawProgress,
      messi: Math.max(1, Number(rawProgress.messi || 0)),
      maradona: Math.max(1, Number(rawProgress.maradona || 0)),
      zidane: Math.max(1, Number(rawProgress.zidane || 0)),
    };

    const nextEpicProgress: Record<string, number> = {
      ...(player.epicProgress || {}),
      rostam_7: Math.max(2, Number(player.epicProgress?.rostam_7 || 1)),
      kurosh: Math.max(2, Number(player.epicProgress?.kurosh || 1)),
      hassan_kachal: Math.max(2, Number(player.epicProgress?.hassan_kachal || 1)),
    };

    const nextEpicStars: Record<string, number> = {
      ...(player.epicStars || {}),
      rostam_7_1: Math.max(2, Number(player.epicStars?.rostam_7_1 || 0)),
      kurosh_1: Math.max(1, Number(player.epicStars?.kurosh_1 || 0)),
      hassan_kachal_1: Math.max(1, Number(player.epicStars?.hassan_kachal_1 || 0)),
    };

    try {
      localStorage.setItem('crossword_worldmap_cards', JSON.stringify(nextWorldMapCards));
      localStorage.setItem('crossword_worldmap_progress', JSON.stringify(nextWorldMapProgress));
    } catch {}

    const eco = this.getLocalEconomyState();
    const nextDeck =
      eco.activeDeck && eco.activeDeck.length >= 3
        ? eco.activeDeck
        : ['legend:messi_rosario', 'legend:maradona_villa', 'legend:zidane_marseille'];

    const updatedEco = this.saveLocalEconomyPatch({
      activeDeck: nextDeck,
      freePolishTokens: Math.max(1, eco.freePolishTokens ?? 1),
      storyCardTiers: {
        ...(eco.storyCardTiers || {}),
        'story:rostam_7:1': Math.max(2, Number(eco.storyCardTiers?.['story:rostam_7:1'] || 0)) as 1 | 2 | 3 | 4,
        'story:kurosh:1': Math.max(1, Number(eco.storyCardTiers?.['story:kurosh:1'] || 0)) as 1 | 2 | 3 | 4,
        'story:hassan_kachal:1': Math.max(1, Number(eco.storyCardTiers?.['story:hassan_kachal:1'] || 0)) as 1 | 2 | 3 | 4,
      },
    });

    const updatedPlayer: PlayerState = {
      ...player,
      worldmapCards: nextWorldMapCards,
      epicProgress: nextEpicProgress,
      epicStars: nextEpicStars,
    };
    this.savePlayer(updatedPlayer);
    this.syncWorldMapCards(nextWorldMapCards);

    if (typeof window !== 'undefined') {
      try {
        window.dispatchEvent(
          new CustomEvent('cg-cards-updated', {
            detail: {
              worldmapCards: nextWorldMapCards,
              worldmapProgress: nextWorldMapProgress,
              player: updatedPlayer,
              economy: updatedEco,
            },
          }),
        );
        window.dispatchEvent(new CustomEvent('cg-deck-updated', { detail: { activeDeck: nextDeck } }));
      } catch {}
    }

    return {
      economy: updatedEco,
      player: updatedPlayer,
      worldmapCards: nextWorldMapCards,
      worldmapProgress: nextWorldMapProgress,
    };
  },

  /** Second-Chance Revive on Story / Tower Loss (55 coins or 1 daily free video ad). */
  revivePlayer(
    player: PlayerState,
    mode: 'coins' | 'ad',
  ): {
    ok: boolean;
    coins: number;
    economy: EconomyStateView;
    player: PlayerState;
    error?: string;
  } {
    const today = getTodayString();
    const eco = this.getLocalEconomyState();
    if (mode === 'ad') {
      if (eco.reviveAdUsedToday) {
        return {
          ok: false,
          coins: player.coins || 0,
          economy: eco,
          player,
          error: 'سهمیه فرصت دوم رایگان امروز استفاده شده است',
        };
      }
      const updatedEco = this.saveLocalEconomyPatch({
        reviveAdLastDate: today,
        reviveAdUsedToday: true,
      });
      return { ok: true, coins: player.coins || 0, economy: updatedEco, player };
    }

    if ((player.coins || 0) < REVIVE_COST_COINS) {
      return {
        ok: false,
        coins: player.coins || 0,
        economy: eco,
        player,
        error: `سکه کافی ندارید (${REVIVE_COST_COINS} سکه نیاز است)`,
      };
    }
    const nextCoins = (player.coins || 0) - REVIVE_COST_COINS;
    const updatedPlayer: PlayerState = { ...player, coins: nextCoins };
    this.savePlayer(updatedPlayer);
    return {
      ok: true,
      coins: nextCoins,
      economy: eco,
      player: updatedPlayer,
    };
  },

  async purchaseIapPackage(
    player: PlayerState,
    skuId: string,
    gateway: 'web_shaparak' | 'bazaar' | 'myket',
    receiptId?: string,
  ): Promise<{
    ok: boolean;
    coinsGranted?: number;
    bonusCoins?: number;
    coins?: number;
    items?: PlayerState['items'];
    towerTickets?: number;
    cosmetics?: CosmeticsView;
    economy?: EconomyStateView;
    error?: string;
  }> {
    const pkg = IAP_PACKAGES.find((p) => p.id === skuId);
    if (!pkg) return { ok: false, error: 'بسته نامعتبر است' };

    if (player.id !== 'guest') {
      try {
        const res = await api<any>('/shop/iap/purchase', {
          method: 'POST',
          body: JSON.stringify({ skuId, gateway, receiptId }),
        });
        if (res?.success) {
          if (res.economy) {
            this.saveLocalEconomyPatch({
              purchasedPacks: res.economy.purchasedPacks,
              unlockedBooks: res.economy.unlockedBooks,
              unlockedAvatars: res.economy.unlockedAvatars,
              hasEpicPatronPass: res.economy.hasEpicPatronPass,
              hasSeasonPass: res.economy.hasSeasonPass,
            });
          }
          return {
            ok: true,
            coinsGranted: res.coinsGranted,
            bonusCoins: res.bonusCoins,
            coins: res.coins,
            items: res.items,
            towerTickets: res.towerTickets,
            cosmetics: res.cosmetics,
            economy: res.economy,
          };
        }
      } catch (e: any) {
        return { ok: false, error: String(e?.message || 'خطا در ثبت خرید') };
      }
    }

    // Guest / offline fallback
    const localEco = this.getLocalEconomyState();
    if (pkg.oneTime && localEco.purchasedPacks.includes(pkg.id)) {
      return { ok: false, error: 'این بسته ویژه قبلاً یک‌بار خریداری شده است' };
    }
    const bonusCoins = gateway === 'web_shaparak' ? Math.round(pkg.coins * WEB_DIRECT_BONUS_RATE) : 0;
    const coinsGranted = pkg.coins + bonusCoins;
    const nextCoins = (player.coins || 0) + coinsGranted;
    const nextItems = {
      trophyShield: (player.items.trophyShield || 0) + (pkg.items.trophyShield || 0),
      trophyBoost: (player.items.trophyBoost || 0) + (pkg.items.trophyBoost || 0),
      streakShield: (player.items.streakShield || 0) + (pkg.items.streakShield || 0),
    };
    const nextTickets = (player.towerTickets || 0) + (pkg.towerTickets || 0);
    const nextPacks = Array.from(new Set([...localEco.purchasedPacks, pkg.id]));
    const nextAvatars = pkg.unlockAvatar
      ? Array.from(new Set([...localEco.unlockedAvatars, pkg.unlockAvatar]))
      : localEco.unlockedAvatars;

    const economy = this.saveLocalEconomyPatch({
      purchasedPacks: nextPacks,
      unlockedAvatars: nextAvatars,
      hasEpicPatronPass: localEco.hasEpicPatronPass || !!pkg.unlockAllBooks,
      hasSeasonPass: localEco.hasSeasonPass || !!pkg.unlockSeasonPass,
    });

    return {
      ok: true,
      coinsGranted,
      bonusCoins,
      coins: nextCoins,
      items: nextItems,
      towerTickets: nextTickets,
      economy,
    };
  },

  async spinFortuneWheel(
    player: PlayerState,
    mode: 'free' | 'ad' | 'paid',
  ): Promise<{
    ok: boolean;
    wedgeIndex?: number;
    wedge?: WheelWedgeDef;
    coins?: number;
    items?: PlayerState['items'];
    towerTickets?: number;
    economy?: EconomyStateView;
    error?: string;
  }> {
    if (player.id !== 'guest') {
      try {
        const res = await api<any>('/shop/wheel/spin', {
          method: 'POST',
          body: JSON.stringify({ mode }),
        });
        if (res?.success) {
          return {
            ok: true,
            wedgeIndex: res.wedgeIndex,
            wedge: res.wedge,
            coins: res.coins,
            items: res.items,
            towerTickets: res.towerTickets,
            economy: res.economy,
          };
        }
      } catch (e: any) {
        return { ok: false, error: String(e?.message || 'خطا در چرخش گردونه') };
      }
    }

    // Guest / offline fallback
    const today = getTodayString();
    const eco = this.getLocalEconomyState();
    if (mode === 'free' && !eco.wheelFreeAvailable) {
      return { ok: false, error: 'چرخش رایگان امروز استفاده شده است' };
    }
    if (mode === 'ad' && !eco.wheelAdAvailable) {
      return { ok: false, error: 'چرخش تبلیغاتی امروز استفاده شده است' };
    }
    if (mode === 'paid') {
      if (!eco.wheelPaidAvailable) return { ok: false, error: 'سقف چرخش‌های امروز تمام شده است' };
      if ((player.coins || 0) < SHOP_PRICES.wheelExtraSpin) {
        return { ok: false, error: 'سکه کافی برای چرخش اضافه ندارید' };
      }
    }

    const totalWeight = WHEEL_WEDGES.reduce((s, w) => s + w.weight, 0);
    let r = Math.floor(Math.random() * totalWeight);
    let chosen = WHEEL_WEDGES[0];
    for (const w of WHEEL_WEDGES) {
      if (r < w.weight) {
        chosen = w;
        break;
      }
      r -= w.weight;
    }

    let nextCoins = (player.coins || 0) - (mode === 'paid' ? SHOP_PRICES.wheelExtraSpin : 0) + (chosen.coins || 0);
    let nextTickets = (player.towerTickets || 0) + (chosen.tickets || 0);
    const nextItems = { ...player.items };
    if (chosen.kind === 'item' && chosen.item) {
      nextItems[chosen.item] = (nextItems[chosen.item] || 0) + (chosen.count || 1);
    }

    const updatedEco = this.saveLocalEconomyPatch({
      wheelLastDate: today,
      wheelSpinsToday: eco.wheelSpinsToday + 1,
      wheelFreeUsed: true,
      wheelAdUsed: mode === 'ad' || mode === 'paid' || !eco.wheelAdAvailable,
      wheelPaidUsed: mode === 'paid',
    });

    return {
      ok: true,
      wedgeIndex: chosen.index,
      wedge: chosen,
      coins: nextCoins,
      items: nextItems,
      towerTickets: nextTickets,
      economy: updatedEco,
    };
  },

  async claimRewardedAd(player: PlayerState): Promise<{
    ok: boolean;
    reward?: number;
    coins?: number;
    economy?: EconomyStateView;
    error?: string;
  }> {
    if (player.id !== 'guest') {
      try {
        const res = await api<any>('/shop/rewarded-ad', { method: 'POST', body: JSON.stringify({}) });
        if (res?.success) {
          return { ok: true, reward: res.reward, coins: res.coins, economy: res.economy };
        }
      } catch (e: any) {
        return { ok: false, error: String(e?.message || 'سقف تبلیغات امروز تمام شده است') };
      }
    }

    const today = getTodayString();
    const eco = this.getLocalEconomyState();
    if (eco.rewardedAdsRemaining <= 0) {
      return { ok: false, error: 'سقف تماشای ویدیوی جایزه‌دار امروز تمام شده است' };
    }
    const nextCoins = (player.coins || 0) + REWARDED_AD_COINS;
    const updatedEco = this.saveLocalEconomyPatch({
      rewardedAdLastDate: today,
      rewardedAdsToday: eco.rewardedAdsToday + 1,
    });
    return { ok: true, reward: REWARDED_AD_COINS, coins: nextCoins, economy: updatedEco };
  },

  async unlockContent(
    player: PlayerState,
    kind: 'book' | 'avatar' | 'size' | 'category' | 'legend',
    id: string | number,
    difficulty?: 'easy' | 'medium' | 'hard',
  ): Promise<{
    ok: boolean;
    coins?: number;
    spent?: number;
    economy?: EconomyStateView;
    insufficient?: boolean;
    error?: string;
  }> {
    if (player.id !== 'guest') {
      try {
        const res = await api<any>('/shop/unlock-content', {
          method: 'POST',
          body: JSON.stringify({ kind, id, difficulty }),
        });
        if (res?.success) {
          if (res.economy) {
            this.saveLocalEconomyPatch({
              unlockedBooks: res.economy.unlockedBooks,
              unlockedAvatars: res.economy.unlockedAvatars,
              unlockedSizes: res.economy.unlockedSizes,
              unlockedCategories: res.economy.unlockedCategories,
              unlockedLegends: res.economy.unlockedLegends,
            });
          }
          return { ok: true, coins: res.coins, spent: res.spent, economy: res.economy };
        }
      } catch (e: any) {
        const msg = String(e?.message || '');
        return { ok: false, insufficient: msg.includes('سکه'), error: msg };
      }
    }

    // Guest / offline fallback
    const eco = this.getLocalEconomyState();
    const strId = String(id);
    let cost = 0;
    if (kind === 'book') cost = getBookUnlockCost(strId, difficulty || 'medium');
    else if (kind === 'avatar') cost = getAvatarUnlockCost(strId);
    else if (kind === 'size') cost = SIZE_UNLOCK_COSTS[Number(id) as GridSize] ?? 450;
    else if (kind === 'category') cost = CATEGORY_UNLOCK_COSTS[strId as Category] ?? 300;
    else if (kind === 'legend') cost = getLegendUnlockCost(strId);

    if ((player.coins || 0) < cost) {
      return { ok: false, insufficient: true, error: 'سکه کافی ندارید' };
    }
    const nextCoins = (player.coins || 0) - cost;
    const patch: Record<string, any> = {};
    if (kind === 'book') patch.unlockedBooks = Array.from(new Set([...eco.unlockedBooks, strId]));
    if (kind === 'avatar') patch.unlockedAvatars = Array.from(new Set([...eco.unlockedAvatars, strId]));
    if (kind === 'size') patch.unlockedSizes = Array.from(new Set([...eco.unlockedSizes, Number(id)]));
    if (kind === 'category') patch.unlockedCategories = Array.from(new Set([...eco.unlockedCategories, strId]));
    if (kind === 'legend') patch.unlockedLegends = Array.from(new Set([...(eco.unlockedLegends || []), strId]));

    const updatedEco = this.saveLocalEconomyPatch(patch);
    return { ok: true, coins: nextCoins, spent: cost, economy: updatedEco };
  },

  async claimBattlePassTier(
    player: PlayerState,
    tier: number,
    track: 'free' | 'gold',
  ): Promise<{
    ok: boolean;
    reward?: SeasonPassRewardDef;
    coins?: number;
    items?: PlayerState['items'];
    towerTickets?: number;
    economy?: EconomyStateView;
    error?: string;
  }> {
    if (player.id !== 'guest') {
      try {
        const res = await api<any>('/shop/battle-pass/claim', {
          method: 'POST',
          body: JSON.stringify({ tier, track }),
        });
        if (res?.success) {
          if (res.economy) {
            this.saveLocalEconomyPatch({
              seasonPassClaimedFree: res.economy.seasonPassClaimedFree,
              seasonPassClaimedGold: res.economy.seasonPassClaimedGold,
            });
          }
          return {
            ok: true,
            reward: res.reward,
            coins: res.coins,
            items: res.items,
            towerTickets: res.towerTickets,
            economy: res.economy,
          };
        }
      } catch (e: any) {
        return { ok: false, error: String(e?.message || 'خطا در دریافت جایزه') };
      }
    }

    // Guest / offline fallback
    const eco = this.getLocalEconomyState();
    const tierDef = SEASON_PASS_TIERS.find((t) => t.tier === tier);
    if (!tierDef) return { ok: false, error: 'پله نامعتبر است' };
    if (track === 'gold' && !eco.hasSeasonPass) {
      return { ok: false, error: 'ابتدا طومار طلایی فصل‌نامه را فعال کنید' };
    }
    const reward = track === 'gold' ? tierDef.goldReward : tierDef.freeReward;
    if (!reward) return { ok: false, error: 'این پله جایزه‌ای ندارد' };

    const list = track === 'gold' ? [...eco.seasonPassClaimedGold] : [...eco.seasonPassClaimedFree];
    if (list.includes(tier)) return { ok: false, error: 'قبلاً دریافت شده است' };
    list.push(tier);

    const nextCoins = (player.coins || 0) + (reward.coins || 0);
    const nextTickets = (player.towerTickets || 0) + (reward.kind === 'ticket' ? (reward.count || 1) : 0);
    const nextItems = { ...player.items };
    if (reward.kind === 'item' && reward.item) {
      nextItems[reward.item] = (nextItems[reward.item] || 0) + (reward.count || 1);
    }

    const updatedEco = this.saveLocalEconomyPatch(
      track === 'gold' ? { seasonPassClaimedGold: list } : { seasonPassClaimedFree: list },
    );
    return {
      ok: true,
      reward,
      coins: nextCoins,
      items: nextItems,
      towerTickets: nextTickets,
      economy: updatedEco,
    };
  },

  updateTowerStats: async (player: PlayerState, coinsEarned: number, floorReached: number): Promise<PlayerState> => {    // Optimistic local update, then let the server settle it. The server clamps the
    // credit to the remaining daily allowance, so mirror the balance it returns
    // rather than trusting the raw (client-reported) loot.
    let updated: PlayerState = {
      ...player,
      coins: player.coins + coinsEarned,
      dailyTowerCoins: player.dailyTowerCoins + coinsEarned,
      towerHighFloor: Math.max(player.towerHighFloor, floorReached),
    };
    if (player.id !== 'guest') {
      try {
        const res = await api<{ coins?: number; daily_tower_coins?: number; tower_high_floor?: number; progress?: ProgressGrant }>('/tower/update-stats', {
          method: 'POST',
          body: JSON.stringify({ deviceId: player.id, coins_earned: coinsEarned, floor_reached: floorReached }),
        });
        if (res && typeof res.coins === 'number') {
          updated = {
            ...updated,
            coins: res.coins,
            dailyTowerCoins: typeof res.daily_tower_coins === 'number' ? res.daily_tower_coins : updated.dailyTowerCoins,
            towerHighFloor: typeof res.tower_high_floor === 'number'
              ? Math.max(updated.towerHighFloor, res.tower_high_floor)
              : updated.towerHighFloor,
          };
        }
        if (res?.progress) {
          updated.level = res.progress.level || updated.level;
          gameServer.recordProgress(res.progress);
        }
      } catch (e) {
        debug.warn('API', 'updateTowerStats failed:', e);
      }
    }
    gameServer.savePlayer(updated);
    return updated;
  },

  fetchStoryLibrary: async () => {
    const bundledBooks = [...EPIC_CAMPAIGNS, ...FOLKTALE_BOOKS];
    const bundledById = new Map(bundledBooks.map(b => [b.id, b]));
    try {
      const serverBooks = await api<any[]>('/story/books');
      if (!Array.isArray(serverBooks) || serverBooks.length === 0) {
        return bundledBooks;
      }
      const seenIds = new Set<string>();
      const merged = serverBooks.map(sb => {
        seenIds.add(sb.id);
        const bundled = bundledById.get(sb.id);
        if (!bundled) return sb;
        const sbChapters = Array.isArray(sb.chapters) ? sb.chapters : [];
        const hasValidChapters =
          sbChapters.length > 0 &&
          sbChapters.every((ch: any) => Array.isArray(ch.words) && ch.words.length > 0);
        return {
          ...bundled,
          ...sb,
          coverImage: sb.coverImage || bundled.coverImage,
          style: sb.style || bundled.style,
          chapters: hasValidChapters
            ? sbChapters.map((ch: any) => {
                const bCh = bundled.chapters.find(c => String(c.id) === String(ch.id));
                return bCh ? { ...bCh, ...ch, words: ch.words?.length ? ch.words : bCh.words } : ch;
              })
            : bundled.chapters,
        };
      });
      for (const b of bundledBooks) {
        if (!seenIds.has(b.id)) {
          merged.push(b);
        }
      }
      return merged;
    } catch (e) {
      debug.warn('API', 'fetchStoryLibrary failed:', e);
      return bundledBooks;
    }
  },

  getDictionaryStats: async () => {
    try {
      const stats = await api('/dictionary/stats');
      return stats.count || 0;
    } catch (e) {
      debug.warn('API', 'getDictionaryStats failed:', e);
      return 0;
    }
  },

  seedDictionary: async (words: DictionaryEntry[], category: string, language: string) => {
    try {
      await api('/dictionary/seed', {
        method: 'POST',
        body: JSON.stringify({ words, category, language }),
      });
      return true;
    } catch (e) {
      debug.warn('API', 'seedDictionary failed:', e);
      return false;
    }
  },

  seedStoryData: async () => {
    return { success: true, msg: 'Seed from client not needed in local mode.' };
  },

  getCompleteSchemaSQL: () => `-- Local mode: no SQL setup needed.\n-- Data is stored in server/local-data/ as JSON files.`,

  checkSchemaHealth: async () => true,

  // ─── Arena API ─────────────────────────────────────────

  async createArenaGame(playerId: string, mode: GameMode, wager: number): Promise<{ gameId?: string; error?: string }> {
    try {
      const data = await api('/arena/create', {
        method: 'POST',
        body: JSON.stringify({ playerId, mode, wager }),
      });
      if (data?.gameId) return { gameId: data.gameId };
      return { error: data?.error || 'unknown' };
    } catch (e: any) {
      const errMsg = e?.message || 'Network error';
      debug.warn('API', 'createArenaGame failed:', errMsg);
      return { error: errMsg };
    }
  },

  // `mine` is set by GET /api/arena/list for the caller's own listing. The
  // creator's `myPendingGameId` lives in React state and is lost on reload, so
  // without this flag the client cannot tell its own game apart from a joinable
  // one — and joining it is refused by the server with a 404.
  async fetchArenaGames(): Promise<{ gameId: string; mode: GameMode; wager: number; mine?: boolean }[]> {
    try {
      const data = await api('/arena/list');
      return data?.games || [];
    } catch (e) {
      debug.warn('API', 'fetchArenaGames failed:', e);
      return [];
    }
  },

  async joinArenaGame(gameId: string, playerId: string): Promise<{ roomId: string; isHost: boolean; wager: number; opponent: { id: string; name: string; avatar: string } } | null> {
    try {
      const data = await api('/arena/join', {
        method: 'POST',
        body: JSON.stringify({ gameId, joinerId: playerId }),
      });
      if (data?.roomId) {
        return {
          roomId: data.roomId,
          isHost: data.isHost || false,
          wager: data.wager || 0,
          opponent: data.opponent || null,
        };
      }
      const errMsg = data?.error || 'unknown';
      debug.warn('API', 'joinArenaGame failed:', errMsg);
      return null;
    } catch (e) {
      debug.warn('API', 'joinArenaGame failed:', e);
      return null;
    }
  },

  async cancelArenaGame(gameId: string, playerId: string): Promise<{ success: boolean; coins?: number | null; error?: string }> {
    try {
      const data = await api('/arena/cancel', {
        method: 'POST',
        body: JSON.stringify({ gameId, playerId }),
      });
      return {
        success: data?.success === true,
        coins: typeof data?.coins === 'number' ? data.coins : null,
      };
    } catch (e: any) {
      const errMsg = e?.message || 'Network error';
      debug.warn('API', 'cancelArenaGame failed:', errMsg);
      return { success: false, error: errMsg };
    }
  },

  async submitArenaResult(roomId: string, winnerId: string): Promise<number | null> {
    try {
      const data = await api('/arena/result', {
        method: 'POST',
        body: JSON.stringify({ roomId, winnerId }),
      });
      if (data?.success && data?.pot !== undefined) return data.pot;
      return null;
    } catch (e) {
      debug.warn('API', 'submitArenaResult failed:', e);
      return null;
    }
  },

  /**
   * Escrow the caller's wager for a wagered multiplayer room. The amount lives
   * server-side (read from the room registry), so the client only names the room
   * and can never choose how much of its own balance is at stake. Idempotent per
   * (room, user): a retry never debits twice.
   */
  async escrowBattle(roomId: string): Promise<{ ok: boolean; wager: number; coins: number | null; insufficient: boolean; unauthorized?: boolean; error?: string }> {
    try {
      const data = await api<any>('/battle/escrow', {
        method: 'POST',
        body: JSON.stringify({ roomId }),
      });
      return {
        ok: data?.success === true,
        wager: data?.wager || 0,
        coins: typeof data?.coins === 'number' ? data.coins : null,
        insufficient: false,
      };
    } catch (e: any) {
      const errMsg = e?.message || 'Network error';
      debug.warn('API', 'escrowBattle failed:', errMsg);
      return { ok: false, wager: 0, coins: null, insufficient: errMsg === 'Insufficient coins', unauthorized: e?.status === 401, error: errMsg };
    }
  },

  /**
   * Settle a wagered multiplayer room server-side: the winner takes the pot
   * (wager × 2), or the room is voided and every escrow refunded. The winner is
   * decided from the recorded `game_over` claim, so a client can neither declare
   * itself the winner nor pick the payout. Returns the authoritative balance.
   */
  async settleBattle(roomId: string): Promise<{ ok: boolean; won: boolean; pot: number; wager: number; voided: boolean; coins: number | null }> {
    const empty = { ok: false, won: false, pot: 0, wager: 0, voided: false, coins: null };
    try {
      const data = await api<any>('/battle/result', {
        method: 'POST',
        body: JSON.stringify({ roomId }),
      });
      if (data?.success !== true) return empty;
      return {
        ok: true,
        won: data.won === true,
        pot: data.pot || 0,
        wager: data.wager || 0,
        voided: data.voided === true,
        coins: typeof data.coins === 'number' ? data.coins : null,
      };
    } catch (e) {
      debug.warn('API', 'settleBattle failed:', e);
      return empty;
    }
  },

  /**
   * Abandon a wagered room before it is decided and get the caller's own escrow
   * back. The server refuses once the match has a `game_over` record — a decided
   * match must go through settleBattle, otherwise the loser could cancel out of
   * a loss. `decided: true` means exactly that.
   */
  async cancelBattle(roomId: string): Promise<{ ok: boolean; refunded: number; coins: number | null; decided: boolean }> {
    try {
      const data = await api<any>('/battle/cancel', {
        method: 'POST',
        body: JSON.stringify({ roomId }),
      });
      return {
        ok: data?.success === true,
        refunded: data?.refunded || 0,
        coins: typeof data?.coins === 'number' ? data.coins : null,
        decided: false,
      };
    } catch (e: any) {
      const errMsg = e?.message || 'Network error';
      debug.warn('API', 'cancelBattle failed:', errMsg);
      return { ok: false, refunded: 0, coins: null, decided: errMsg.includes('already decided') };
    }
  },

  /**
   * Settle a multiplayer room server-side: trophies, trophy shield/boost
   * consumption, and (winner only) the +20 coin bonus. The server decides
   * win/loss from the recorded `game_over` claim, so the caller can neither
   * declare itself the winner nor pick a trophy delta. Returns the authoritative
   * post-settlement state; `coins === null` means the call failed and the caller
   * should keep its local values.
   */
  async submitLeagueResult(roomId: string): Promise<{
    awarded: number;
    coins: number | null;
    won: boolean;
    trophyChange: number;
    league: ServerLeague | null;
    items: { trophyShield: number; trophyBoost: number } | null;
    shieldUsed: boolean;
    boostUsed: boolean;
    /** Extra coins paid for a 3-win streak (server-owned `WIN_STREAK_BONUS`). */
    streakBonus: number;
    progress: ProgressGrant | null;
  }> {
    const empty = {
      awarded: 0, coins: null, won: false, trophyChange: 0,
      league: null, items: null, shieldUsed: false, boostUsed: false,
      streakBonus: 0, progress: null,
    };
    try {
      const data = await api<any>('/league/result', {
        method: 'POST',
        body: JSON.stringify({ roomId }),
      });
      if (!data?.success) return empty;
      gameServer.recordProgress(data.progress);
      if (data.streakBonus > 0) {
        pendingStreakBonuses.push({ streak: Number(data.winStreak) || 0, coins: data.streakBonus });
      }
      return {
        awarded: data.awarded || 0,
        coins: typeof data.coins === 'number' ? data.coins : null,
        won: data.won === true,
        trophyChange: typeof data.trophyChange === 'number' ? data.trophyChange : 0,
        league: typeof data.trophies === 'number'
          ? {
              trophies: data.trophies,
              league: data.league,
              highestLeague: data.highestLeague,
              winStreak: data.winStreak ?? 0,
              totalWins: data.totalWins ?? 0,
              totalLosses: data.totalLosses ?? 0,
            }
          : null,
        items: (data.items && typeof data.items === 'object')
          ? { trophyShield: data.items.trophyShield || 0, trophyBoost: data.items.trophyBoost || 0 }
          : null,
        shieldUsed: data.shieldUsed === true,
        boostUsed: data.boostUsed === true,
        streakBonus: typeof data.streakBonus === 'number' ? data.streakBonus : 0,
        progress: data.progress || null,
      };
    } catch (e) {
      debug.warn('API', 'submitLeagueResult failed:', e);
      return empty;
    }
  },

  /**
   * Local post-game bookkeeping for multiplayer. Trophies, trophy shield/boost
   * and the win reward are all settled SERVER-side by POST /api/league/result
   * (from the recorded `game_over`), so this only bumps the local score/streak so
   * the UI has something to show while that request is in flight.
   * `useGameResultEffects` then adopts the server's league + items.
   */
  applyMultiplayerResult(player: PlayerState, won: boolean, _opponentTrophies: number, isArena: boolean = false): { state: PlayerState; shieldUsed: boolean; boostUsed: boolean } {
    if (isArena) {
      // Arena: no trophy/score/coin change — the pot is settled by /arena/result.
      const updated: PlayerState = { ...player, items: { ...player.items } };
      this.savePlayer(updated);
      return { state: updated, shieldUsed: false, boostUsed: false };
    }

    const updated: PlayerState = {
      ...player,
      coins: player.coins,
      score: player.score + (won ? 100 : 10),
    };
    this.savePlayer(updated);
    return { state: updated, shieldUsed: false, boostUsed: false };
  },
};

// Simple in-memory word cache
const WORD_CACHE: Record<string, DictionaryEntry[]> = {};
