/**
 * DBInterface — Abstract contract for database access.
 *
 * All methods return plain objects/arrays.
 * Every method must NEVER throw — errors are returned as { error: message }.
 *
 * Two implementations:
 *   SQLiteDB  (node:sqlite) — local dev, single-server prod
 *   PostgresDB (pg)         — multi-server, high-scale prod
 *
 * To switch: change const db = new SQLiteDB() to new PostgresDB() in db/index.js
 */
class DBInterface {
  // ─── Profile ───────────────────────────────────────────
  /** @returns {Promise<{data: object|null, error: string|null}>} */
  async getUser(id) {}
  /** @returns {Promise<{data: object, error: string|null}>} */
  async createUser(data) {}
  /** @returns {Promise<{data: object, error: string|null}>} */
  async updateUser(id, updates) {}
  /**
   * Atomically add `delta` (may be negative) to a player's coin balance.
   *
   * MUST be a single UPDATE ... RETURNING (never read-modify-write), so two
   * concurrent spends cannot both pass against the same balance. The result is
   * clamped to [0, cap]; if a debit would go below zero nothing is written and
   * the caller gets `{ data: null, error: 'insufficient_coins' }`.
   *
   * @returns {Promise<{data: {coins: number}|null, error: string|null}>}
   */
  async addCoins(id, delta, cap) {}
  /** @returns {Promise<{data: object|null, error: string|null}>} */
  async getUserByPhone(phone) {}

  // ─── Leaderboard ────────────────────────────────────────
  /** @returns {Promise<{data: Array, error: string|null}>} */
  async getLeaderboard(limit = 20) {}

  // ─── Match History ─────────────────────────────────────
  /** @returns {Promise<{data: object, error: string|null}>} */
  async saveMatch(data) {}

  // ─── Friends ────────────────────────────────────────────
  /** @returns {Promise<{data: Array, error: string|null}>} */
  async getFriends(userId) {}
  /** @returns {Promise<{data: object|null, error: string|null}>} */
  async findUserByFriendCode(code) {}
  /** @returns {Promise<{data: object, error: string|null}>} */
  async sendFriendRequest(myId, friendId) {}
  /** @returns {Promise<{data: object, error: string|null}>} */
  async acceptFriendRequest(senderId, receiverId) {}
  /** @returns {Promise<{data: object, error: string|null}>} */
  async removeFriendship(friendshipId) {}

  // ─── Messages ───────────────────────────────────────────
  /** @returns {Promise<{data: Array, error: string|null}>} */
  async getMessages(userId, friendId, limit = 50) {}
  /** @returns {Promise<{data: object, error: string|null}>} */
  async sendMessage(data) {}
  /** @returns {Promise<{data: object, error: string|null}>} */
  async markMessagesRead(myId, senderId) {}
  /**
   * Unread DM count grouped by sender.
   * @returns {Promise<{data: Record<string, number>, error: string|null}>}
   */
  async getUnreadCounts(userId) {}

  // ─── Notifications ─────────────────────────────────────
  /** @returns {Promise<{data: Array, error: string|null}>} */
  async getNotifications(userId) {}
  /** @returns {Promise<{data: object, error: string|null}>} */
  async createNotification(data) {}
  /** @returns {Promise<{data: object, error: string|null}>} */
  async deleteNotification(id) {}
  /** @returns {Promise<{data: object|null, error: string|null}>} */
  async findNotificationBySender(senderId, userId, type) {}

  // ─── Dictionary ─────────────────────────────────────────
  /** @returns {Promise<{data: Array, error: string|null}>} */
  async getDictionary(category, language, limit = 10000) {}
  /** @returns {Promise<{data: Array, error: string|null}>} */
  async getGlueDictionary(category, language, limit = 500) {}
  /** @returns {Promise<{data: object, error: string|null}>} */
  async seedWord(word, clue, category, language) {}

  // ─── Story ──────────────────────────────────────────────
  /** @returns {Promise<{data: Array, error: string|null}>} */
  async getStoryBooks() {}
  /** @returns {Promise<{data: Array, error: string|null}>} */
  async getStoryChapters(bookId) {}

  // ─── Tower ──────────────────────────────────────────────
  /**
   * Atomically decrement the ticket count, refusing when none are left.
   * @returns {Promise<{data: {tower_tickets:number,last_ticket_refill:string|null}|null, error: string|null}>}
   */
  async consumeTowerTicket(deviceId) {}
  /**
   * Atomically add tickets (negative removes), clamped to [0, cap]. `refillAt`
   * (ISO string) also stamps `last_ticket_refill` when provided.
   * @param {string} id
   * @param {number} qty
   * @param {number} cap
   * @param {string|null} refillAt
   * @returns {Promise<{data: {tower_tickets:number,last_ticket_refill:string|null}|null, error: string|null}>}
   */
  async addTowerTickets(id, qty, cap = 2, refillAt = null) {}
  /**
   * @param {string} deviceId
   * @param {number} coinsEarned  already clamped to the daily allowance
   * @param {number} floorReached
   * @param {number|null} dailyCoinsTotal  authoritative per-day total (or null to accumulate)
   * @returns {Promise<{data: object, error: string|null}>}
   */
  async updateTowerStats(deviceId, coinsEarned, floorReached, dailyCoinsTotal = null) {}

  // ─── League / trophies ──────────────────────────────────
  /**
   * Apply a server-computed trophy delta. `delta` must come from
   * `server/league.js` — never from a client. The trophy arithmetic happens
   * inside SQL against the stored value (so it cannot be forged), and the
   * derived league/highest_league/streak fields are recomputed from the result.
   *
   * @param {string} id
   * @param {number} delta       signed trophy change
   * @param {boolean} won
   * @returns {Promise<{data: {trophies,league,highestLeague,winStreak,totalWins,totalLosses}|null, error: string|null}>}
   */
  async applyLeagueResult(id, delta, won) {}

  /**
   * Increment a counter inside the profile's `items` JSON blob, atomically.
   * @param {string} id
   * @param {string} itemKey  e.g. 'trophyShield'
   * @param {number} qty      signed
   * @returns {Promise<{data: object|null, error: string|null}>}
   */
  async addItem(id, itemKey, qty) {}
}

module.exports = DBInterface;
