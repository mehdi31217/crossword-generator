-- Crossword Gen Pro — PostgreSQL Schema
-- Run this on your PostgreSQL database to create all tables.
--
-- Usage:
--   createdb crossword
--   psql -d crossword -f schema.pg.sql

CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  username TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  device_id TEXT DEFAULT '',
  friend_code TEXT DEFAULT '',
  password_hash TEXT DEFAULT NULL,
  avatar_text TEXT DEFAULT '👤',
  is_guest INTEGER DEFAULT 1,
  score INTEGER DEFAULT 0,
  high_score INTEGER DEFAULT 0,
  coins INTEGER DEFAULT 100,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  is_online INTEGER DEFAULT 0,
  is_admin INTEGER DEFAULT 0,
  last_daily_date TEXT DEFAULT '',
  last_daily_reward_date TEXT DEFAULT '',
  tower_tickets INTEGER DEFAULT 3,
  tower_high_floor INTEGER DEFAULT 0,
  total_matches INTEGER DEFAULT 0,
  total_wins INTEGER DEFAULT 0,
  epic_stars TEXT DEFAULT '{}',
  epic_progress TEXT DEFAULT '{}',
  epic_progress_map TEXT DEFAULT '{}',
  game_history TEXT DEFAULT '[]',
  updated_at TEXT DEFAULT '',
  last_ticket_refill TEXT DEFAULT '',
  daily_tower_coins INTEGER DEFAULT 0,
  trophies INTEGER DEFAULT 0,
  league TEXT DEFAULT 'bronze',
  items TEXT DEFAULT '{"trophyShield":0,"trophyBoost":0}',
  card_progress TEXT DEFAULT '{}',
  worldmap_cards TEXT DEFAULT '{}',
  daily_streak INTEGER DEFAULT 0,
  daily_streak_best INTEGER DEFAULT 0,
  daily_streak_last TEXT DEFAULT '',
  daily_quests TEXT DEFAULT '{}',
  cosmetics TEXT DEFAULT '{"owned":[],"frame":"","title":""}',
  claimed_sets TEXT DEFAULT '[]',
  season_id TEXT DEFAULT '',
  season_pending_tier TEXT DEFAULT '',
  season_reward_claimed TEXT DEFAULT '',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dictionary (
  id TEXT PRIMARY KEY,
  word TEXT NOT NULL,
  clue TEXT NOT NULL,
  category TEXT DEFAULT '',
  language TEXT DEFAULT 'fa',
  length INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS glue_dictionary (
  id TEXT PRIMARY KEY,
  word TEXT NOT NULL,
  clue TEXT NOT NULL,
  category TEXT DEFAULT '',
  language TEXT DEFAULT 'fa',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS matches (
  id TEXT PRIMARY KEY,
  user_id TEXT DEFAULT '',
  player_id TEXT DEFAULT '',
  opponent_id TEXT DEFAULT '',
  mode TEXT DEFAULT '',
  category TEXT DEFAULT '',
  size INTEGER DEFAULT 0,
  grid_size INTEGER DEFAULT 0,
  score INTEGER DEFAULT 0,
  seconds INTEGER DEFAULT 0,
  time_taken INTEGER DEFAULT 0,
  won INTEGER DEFAULT 0,
  date_played TEXT DEFAULT '',
  created_at TIMESTAMP DEFAULT NOW(),
  finished_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  sender_id TEXT NOT NULL,
  receiver_id TEXT NOT NULL,
  content TEXT NOT NULL,
  read INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  sender_id TEXT DEFAULT '',
  type TEXT DEFAULT '',
  payload TEXT DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS friendships (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  friend_id TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS story_books (
  id TEXT PRIMARY KEY,
  title TEXT DEFAULT '',
  title_fa TEXT DEFAULT '',
  author TEXT DEFAULT '',
  genre TEXT DEFAULT 'epic',
  description TEXT DEFAULT '',
  cover_image TEXT DEFAULT '',
  difficulty TEXT DEFAULT 'medium',
  required_stars INTEGER DEFAULT 0,
  style TEXT DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS story_chapters (
  id TEXT PRIMARY KEY,
  book_id TEXT DEFAULT '',
  title TEXT DEFAULT '',
  title_fa TEXT DEFAULT '',
  description TEXT DEFAULT '',
  image TEXT DEFAULT '',
  chapter_index INTEGER DEFAULT 0,
  chapter_order INTEGER DEFAULT 0,
  monster_avatar TEXT DEFAULT '',
  victory_text TEXT DEFAULT '',
  words TEXT DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Async duels, part 1: an arena is one finished board plus the creator's own run.
-- `board` is the exact grid + clues, so every friend solves the same puzzle.
-- Friends are invited to an arena *afterwards*, so a duel can exist with nobody
-- invited yet. `closed` stops new invitations but never touches the results.
CREATE TABLE IF NOT EXISTS duel_arenas (
  id TEXT PRIMARY KEY,
  creator_id TEXT NOT NULL,
  creator_name TEXT DEFAULT '',
  creator_avatar TEXT DEFAULT '',
  category TEXT DEFAULT 'all',
  language TEXT DEFAULT 'fa',
  size INTEGER DEFAULT 8,
  board TEXT DEFAULT '{}',
  creator_result TEXT DEFAULT '{}',
  closed INTEGER DEFAULT 0,
  created_at TEXT DEFAULT ''
);
-- Async duels, part 2: one invitation per friend, carrying that friend's replay.
CREATE TABLE IF NOT EXISTS duel_invites (
  id TEXT PRIMARY KEY,
  arena_id TEXT NOT NULL,
  opponent_id TEXT NOT NULL,
  opponent_name TEXT DEFAULT '',
  opponent_avatar TEXT DEFAULT '',
  opponent_result TEXT DEFAULT NULL,
  status TEXT DEFAULT 'open',
  rewarded INTEGER DEFAULT 0,
  created_at TEXT DEFAULT '',
  completed_at TEXT DEFAULT ''
);

-- Indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_story_chapters_book_chapter ON story_chapters(book_id, chapter_index);
CREATE INDEX IF NOT EXISTS idx_duel_arenas_creator ON duel_arenas(creator_id);
CREATE INDEX IF NOT EXISTS idx_duel_invites_arena ON duel_invites(arena_id);
CREATE INDEX IF NOT EXISTS idx_duel_invites_opponent ON duel_invites(opponent_id);
CREATE INDEX IF NOT EXISTS idx_matches_user_id ON matches(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_user ON friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend ON friendships(friend_id);
CREATE INDEX IF NOT EXISTS idx_dictionary_category ON dictionary(category, language);
CREATE INDEX IF NOT EXISTS idx_dictionary_word ON dictionary(word);
CREATE INDEX IF NOT EXISTS idx_profiles_friend_code ON profiles(friend_code);
CREATE INDEX IF NOT EXISTS idx_profiles_score ON profiles(score DESC);

-- Minimal behaviour log (see server/progression.js). Seven event types, no PII.
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  user_id TEXT DEFAULT '',
  type TEXT DEFAULT '',
  payload TEXT DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_user_time ON events(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_events_type_time ON events(type, created_at);
